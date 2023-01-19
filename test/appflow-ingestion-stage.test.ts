import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";

import { AppFlowIngestionStage } from "../src";

test("AppFlow Ingestion stage creates State Machine, Lambda & Alarm", () => {
  const stack = new cdk.Stack();

  new AppFlowIngestionStage(stack, "appflow-ingestion", {
    flowName: "dummy-appflow-flow",
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": [
        "",
        Match.arrayWith([
          Match.stringLikeRegexp("start-flow-execution"),
          Match.stringLikeRegexp("check-flow-execution-status"),
        ]),
      ],
    },
  });
  template.hasResourceProperties("AWS::Lambda::Function", {
    Runtime: "python3.9",
    Handler: "lambda_function.lambda_handler",
  });
  template.hasResourceProperties("AWS::CloudWatch::Alarm", {
    ComparisonOperator: "GreaterThanThreshold",
    EvaluationPeriods: 1,
    MetricName: "ExecutionsFailed",
    Namespace: "AWS/States",
    Period: 300,
    Statistic: "Sum",
    Threshold: 5,
  });
});

test("AppFlow Ingestion stage creates flow", () => {
  const stack = new cdk.Stack();

  new AppFlowIngestionStage(stack, "appflow-ingestion", {
    flowExecutionStatusCheckPeriod: Duration.seconds(10),
    destinationFlowConfig: {
      connectorType: "EventBridge",
      destinationConnectorProperties: {
        eventBridge: {
          object: "dummy",
        },
      },
    },
    sourceFlowConfig: {
      connectorType: "s3",
      sourceConnectorProperties: {
        s3: {
          bucketName: "dummy-bucket",
          bucketPrefix: "foo",
        },
      },
    },
    flowTasks: [
      {
        sourceFields: ["foo", "bar"],
        taskType: "Validate",
      },
    ],
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::AppFlow::Flow", {
    FlowName: "appflow-ingestion-flow",
  });
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": [
        "",
        Match.arrayWith([
          Match.stringLikeRegexp('"wait-before-checking-flow-status-again":{"Type":"Wait","Seconds":10'),
        ]),
      ],
    },
  });
});

test("AppFlow Ingestion stage additional properties", () => {
  const stack = new cdk.Stack();

  new AppFlowIngestionStage(stack, "appflow-ingestion", {
    flowName: "dummy-appflow-flow",
    alarmsEnabled: false,
  });

  const template = Template.fromStack(stack);
  template.resourcePropertiesCountIs("AWS::CloudWatch::Alarm", {}, 0);
});

test("AppFlow Ingestion Must have 'destinationFlowConfig' if no 'flowName'", () => {
  const stack = new cdk.Stack();

  expect(() => {
    new AppFlowIngestionStage(stack, "appflow-ingestion", {});
  }).toThrowError(
    "if 'flowName' is not specified, 'destinationFlowConfig', 'sourceFlowConfig' & 'tasks' are required properties",
  );
});
