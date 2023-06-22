import * as integration from "@aws-cdk/integ-tests-alpha";
import * as cdk from "aws-cdk-lib";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { RequireApproval } from "aws-cdk-lib/cloud-assembly-schema";

import { SqsToLambdaStage } from "../../src";

interface SqsToLambdaStageFunctionProps extends lambda.FunctionProps {
  readonly errorsAlarmThreshold?: number;
  readonly errorsEvaluationPeriods?: number;
  readonly errorsComparisonOperator?: cloudwatch.ComparisonOperator;
}

interface SqsToLambdaStageTestStackProps extends cdk.StackProps {
  readonly lambdaFunction?: lambda.IFunction;
  readonly lambdaFunctionProps?: SqsToLambdaStageFunctionProps;
  readonly sqsQueue?: sqs.IQueue;
  readonly sqsQueueProps?: sqs.QueueProps;
  readonly batchSize?: number;
  readonly maxBatchingWindow?: cdk.Duration;
  readonly dlqEnabled?: boolean;
  readonly maxReceiveCount?: number;
  readonly messageGroupId?: string;
}

class SqsToLambdaStageTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SqsToLambdaStageTestStackProps) {
    super(scope, id, props);

    new SqsToLambdaStage(this, "Stage", {
      ...props,
    });
  }
}

const app = new cdk.App();
new integration.IntegTest(app, "Sqs Lambda Stage Integration Tests", {
    testCases: [
      new SqsToLambdaStageTestStack(app, "SqsLambdaBasic", {
        lambdaFunctionProps: {
          code: lambda.Code.fromInline("def lambda_handler(event, context): return 200"),
          handler: "lambda_function.lambda_handler",
          memorySize: 512,
          runtime: lambda.Runtime.PYTHON_3_9,
        },
      }),
      new SqsToLambdaStageTestStack(app, "SqsLambdaFull", {
        lambdaFunctionProps: {
          code: lambda.Code.fromInline("def lambda_handler(event, context): return 200"),
          handler: "lambda_function.lambda_handler",
          memorySize: 512,
          runtime: lambda.Runtime.PYTHON_3_9,
          errorsAlarmThreshold: 10,
          errorsEvaluationPeriods: 3,
          errorsComparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        },
        batchSize: 5,
        messageGroupId: "dummy-group",
        maxReceiveCount: 2,
        dlqEnabled: true,
        sqsQueueProps: {
          fifo: true,
          visibilityTimeout: cdk.Duration.minutes(5),
        },
      }),
    ],
    diffAssets: true,
    stackUpdateWorkflow: true,
    cdkCommandOptions: {
      deploy: {
        args: {
          requireApproval: RequireApproval.NEVER,
          json: true,
        },
      },
      destroy: {
        args: {
          force: true,
        },
      },
    },
});
