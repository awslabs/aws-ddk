import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import * as appflow from "aws-cdk-lib/aws-appflow";
import * as events from "aws-cdk-lib/aws-events";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { assignLambdaFunctionProps } from "../core/lambda-defaults";
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
  readonly flowObject: tasks.CallAwsService;
  readonly flowName: string;

  constructor(scope: Construct, id: string, props: AppFlowIngestionStageProps) {
    super(scope, id, props);

    const { flowName, flowExecutionStatusCheckPeriod, destinationFlowConfig, sourceFlowConfig, flowTasks } = props;
    const flowExecutionRecords = this.createCheckFlowExecutionTask();
    const flowObjectExecutionStatus = new sfn.Choice(this, "Check Flow Execution Status");
    const flowObjectExecutionStatusWait = new sfn.Wait(this, "Wait Before Checking Flow Status", {
      time: sfn.WaitTime.duration(flowExecutionStatusCheckPeriod ?? Duration.seconds(15)),
    });

    if (!flowName) {
      // Check required props for CfnFlow create and except if not provided
      if (!destinationFlowConfig || !sourceFlowConfig || !flowTasks) {
        throw new Error(
          "if 'flowName' is not specified, 'destinationFlowConfig', 'sourceFlowConfig' & 'tasks' are required properties",
        );
      }
      const flow = new appflow.CfnFlow(this, "Flow", {
        destinationFlowConfigList: [destinationFlowConfig],
        flowName: `${id}-flow`,
        sourceFlowConfig: sourceFlowConfig,
        tasks: flowTasks,
        triggerConfig: {
          triggerType: "OnDemand",
        },
      });
      this.flowName = flow.flowName;
    } else {
      this.flowName = flowName;
    }
    this.flowObject = this.createStartFlowCustomTask(this.flowName, flowObjectExecutionStatusWait);

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

  private createStartFlowCustomTask(flowName: string, waitHandler?: sfn.Wait): tasks.CallAwsService {
    const stack = cdk.Stack.of(this);
    const task = new tasks.CallAwsService(this, "Start Flow Execution", {
      service: "appflow",
      action: "startFlow",
      iamResources: [`arn:${stack.partition}:appflow:${stack.region}:${stack.account}:flow/${flowName}`],
      parameters: {
        FlowName: flowName,
      },
    });
    if (waitHandler) {
      task.addCatch(waitHandler, {
        errors: ["Appflow.ConflictException"],
      });
    }

    return task;
  }

  private createCheckFlowExecutionTask(): tasks.LambdaInvoke {
    const statusLambdaRole = new iam.Role(this, "Flow Execution Status Lambda Role", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      description: "lambda role to check appflow flow execution status",
    });

    const statusLambda = new lambda.Function(
      this,
      "Flow Execution Status Lambda",
      assignLambdaFunctionProps({
        code: lambda.Code.fromAsset(path.join(__dirname, "lambda_handlers/appflow_check_flow_status/")),
        handler: "lambda_function.lambda_handler",
        role: statusLambdaRole,
        runtime: lambda.Runtime.PYTHON_3_9,
      }),
    );

    // Enable the function to get flow execution records
    statusLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["appflow:DescribeFlowExecutionRecords"],
        resources: ["*"],
      }),
    );

    // Create check flow execution status step function task
    return new tasks.LambdaInvoke(this, "Get Flow Execution Status", {
      lambdaFunction: statusLambda,
      resultSelector: { "FlowExecutionStatus.$": "$.Payload" },
    });
  }
}
