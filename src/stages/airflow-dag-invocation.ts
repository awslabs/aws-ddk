import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import * as appflow from "aws-cdk-lib/aws-appflow";
import * as events from "aws-cdk-lib/aws-events";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { StateMachineStage, StateMachineStageProps } from "../pipelines/stage";

/**
 * Properties of the Airflow Dag Invocation stage.
 */
export interface AirflowDagInvocationStageProps extends StateMachineStageProps {
  /**
   * Name of the Airflow flow to run. If None, an AppFlow flow is created.
   */
  readonly flowName?: string;
  /**
   * Time to wait between flow execution status checks.
   * @default aws_cdk.Duration.seconds(15)
   */
  readonly flowExecutionStatusCheckPeriod?: Duration;
  /**
   * The flow `appflow.CfnFlow.DestinationFlowConfigProperty` properties.
   */
  readonly destinationFlowConfig?: appflow.CfnFlow.DestinationFlowConfigProperty;
  /**
   * The flow `appflow.CfnFlow.SourceFlowConfigProperty` properties.
   */
  readonly sourceFlowConfig?: appflow.CfnFlow.SourceFlowConfigProperty;
  /**
   * The flow tasks properties.
   */
  readonly flowTasks?: appflow.CfnFlow.TaskProperty[];
}

/**
 * Stage that contains a step function that runs an AppFlow flow ingestion.
 * If the AppFlow flow name is not supplied, then the flow is created.
 */
export class AirflowDagInvocationStage extends StateMachineStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;
  readonly stateMachine: sfn.StateMachine;
  readonly flowObject: tasks.CallAwsService;
  readonly flowName: string;

  /**
   * Constructs AirflowDagInvocationStage.
   * @param scope Scope within which this construct is defined.
   * @param id Identifier of the stage.
   * @param props Properties for the stage.
   */
  constructor(scope: Construct, id: string, props: AirflowDagInvocationStageProps) {
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

    const statusLambda = new lambda.Function(this, "Flow Execution Status Lambda", {
      code: lambda.Code.fromInline(`
          # Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
          #
          # Licensed under the Apache License, Version 2.0 (the "License").
          # You may not use this file except in compliance with the License.
          # You may obtain a copy of the License at
          #
          #     http://www.apache.org/licenses/LICENSE-2.0
          #
          # Unless required by applicable law or agreed to in writing, software
          # distributed under the License is distributed on an "AS IS" BASIS,
          # WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
          # See the License for the specific language governing permissions and
          # limitations under the License.

          import json
          import logging
          from typing import Any, Dict, Optional

          import boto3

          logger = logging.getLogger()
          logger.setLevel(logging.INFO)

          appflow = boto3.client("appflow")


          def lambda_handler(event: Dict[str, Any], context: Optional[Dict[str, Any]]) -> str:
              # Log the received event
              logger.info("Received event: " + json.dumps(event, indent=2))
              # Get appflow flow name from the event
              flow_name = event["FlowArn"].rsplit("/")[-1]
              # Get appflow flow execution id from the event
              execution_id = event["ExecutionId"]

              params = {"flowName": flow_name, "maxResults": 10}

              flow_execution_status = ""

              try:
                  # unfortunately the appflow client does not have any paginator
                  while True:
                      response = appflow.describe_flow_execution_records(**params)  # type: ignore
                      logger.info(response)
                      execution_record = [
                          execution for execution in response["flowExecutions"] if execution["executionId"] == execution_id
                      ]
                      if execution_record:
                          flow_execution_status = execution_record[0]["executionStatus"]
                          break
                      if "nextToken" in response:
                          params["nextToken"] = response["nextToken"]
                      else:
                          break
                  logger.info(f"Status: {flow_execution_status}")
                  return flow_execution_status
              except Exception as e:
                  logger.info(e)
                  message = "Error getting AppFlow flow status"
                  logger.info(message)
                  raise Exception(message)
        `),
      handler: "lambda_function.lambda_handler",
      role: statusLambdaRole,
      runtime: lambda.Runtime.PYTHON_3_9,
      memorySize: 256,
      timeout: cdk.Duration.seconds(120),
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
    return new tasks.LambdaInvoke(this, "Get Flow Execution Status", {
      lambdaFunction: statusLambda,
      resultSelector: { "FlowExecutionStatus.$": "$.Payload" },
    });
  }
}
