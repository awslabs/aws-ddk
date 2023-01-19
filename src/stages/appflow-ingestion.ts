import * as path from "path";
import { Duration } from "aws-cdk-lib";
import * as appflow from "aws-cdk-lib/aws-appflow";
import * as events from "aws-cdk-lib/aws-events";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { StateMachineStage, StateMachineStageProps } from "../pipelines/stage";

export interface AppFlowIngestionStageProps extends StateMachineStageProps {
  readonly flowName?: string;
  readonly flowExecutionStatusCheckPeriod?: Duration;
  readonly destinationFlowConfig?: appflow.CfnFlow.DestinationFlowConfigProperty;
  readonly sourceFlowConfig?: appflow.CfnFlow.SourceFlowConfigProperty;
  readonly flowTasks?: appflow.CfnFlow.TaskProperty[];
}

export class AppFlowIngestionStage extends StateMachineStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;
  readonly stateMachine: sfn.StateMachine;
  readonly flowObject: sfn.CustomState;

  constructor(scope: Construct, id: string, props: AppFlowIngestionStageProps) {
    super(scope, id, props);

    const { flowName, flowExecutionStatusCheckPeriod, destinationFlowConfig, sourceFlowConfig, flowTasks } = props;

    if (!flowName) {
      // Check required props for CfnFlow create and except if not provided
      if (!destinationFlowConfig || !sourceFlowConfig || !flowTasks) {
        throw new Error(
          "if 'flowName' is not specified, 'destinationFlowConfig', 'sourceFlowConfig' & 'tasks' are required properties",
        );
      }
      const flow = new appflow.CfnFlow(this, `${id}-flow`, {
        destinationFlowConfigList: [destinationFlowConfig],
        flowName: `${id}-flow`,
        sourceFlowConfig: sourceFlowConfig,
        tasks: flowTasks,
        triggerConfig: {
          triggerType: "OnDemand",
        },
      });
      this.flowObject = this.createStartFlowCustomTask(flow.flowName);
    } else {
      this.flowObject = this.createStartFlowCustomTask(flowName);
    }

    // Create check flow execution status step function task
    const flowExecutionRecords = this.createCheckFlowExecutionTask(id);
    // Create step function loop to check flow execution status
    const flowObjectExecutionStatus = new sfn.Choice(this, "check-flow-execution-status");
    const flowObjectExecutionStatusWait = new sfn.Wait(this, "wait-before-checking-flow-status-again", {
      time: sfn.WaitTime.duration(flowExecutionStatusCheckPeriod ?? Duration.seconds(15)),
    });

    const definition = this.flowObject
      .next(flowObjectExecutionStatusWait)
      .next(flowExecutionRecords)
      .next(
        flowObjectExecutionStatus
          .when(sfn.Condition.stringEquals("$.FlowExecutionStatus", "Successful"), new sfn.Succeed(this, "success"))
          .when(
            sfn.Condition.stringEquals("$.FlowExecutionStatus", "Error"),
            new sfn.Fail(this, "failure", {
              error: "WorkflowFailure",
              cause: "AppFlow failure",
            }),
          )
          .otherwise(flowObjectExecutionStatusWait),
      );

    ({
      eventPattern: this.eventPattern,
      targets: this.targets,
      stateMachine: this.stateMachine,
    } = this.createStateMachine(definition, props));
    this.stateMachine.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["appflow:StartFlow"],
        resources: ["*"],
      }),
    );
  }

  private createStartFlowCustomTask(flowName: string): sfn.CustomState {
    const stateJson = {
      Type: "Task",
      Resource: "arn:aws:states:::aws-sdk:appflow:startFlow",
      Parameters: {
        FlowName: flowName,
      },
      Catch: [
        {
          ErrorEquals: ["Appflow.ConflictException"],
          Next: "wait-before-checking-flow-status-again",
        },
      ],
    };

    return new sfn.CustomState(this, "start-flow-execution", { stateJson });
  }

  private createCheckFlowExecutionTask(id: string): tasks.LambdaInvoke {
    const statusLambdaRole = new iam.Role(this, `{id}-flow-execution-status-lambda-role`, {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      description: "lambda role to check appflow flow execution status",
    });

    const statusLambda = new lambda.Function(this, `${id}-flow-execution-status-lambda`, {
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda_handlers/appflow_check_flow_status/")),
      handler: "lambda_function.lambda_handler",
      role: statusLambdaRole,
      runtime: lambda.Runtime.PYTHON_3_9,
    });

    // Enable the function to get flow execution records
    statusLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["appflow:DescribeFlowExecutionRecords"],
        resources: ["*"],
      }),
    );

    // Create check flow execution status step function task
    return new tasks.LambdaInvoke(this, "get-flow-execution-status", {
      lambdaFunction: statusLambda,
      resultSelector: { "FlowExecutionStatus.$": "$.Payload" },
    });
  }
}
