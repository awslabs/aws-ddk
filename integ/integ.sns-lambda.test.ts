import * as integration from "@aws-cdk/integ-tests-alpha";
import * as cdk from "aws-cdk-lib";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sns from "aws-cdk-lib/aws-sns";
import { Construct } from "constructs";
import { RequireApproval } from "aws-cdk-lib/cloud-assembly-schema";

import { SnsToLambdaStage } from "../src";

interface SnsToLambdaStageFunctionProps extends lambda.FunctionProps {
  readonly errorsAlarmThreshold?: number;
  readonly errorsEvaluationPeriods?: number;
  readonly errorsComparisonOperator?: cloudwatch.ComparisonOperator;
}

interface SnsToLambdaStageTestStackProps extends cdk.StackProps {
  readonly lambdaFunction?: lambda.IFunction;
  readonly lambdaFunctionProps?: SnsToLambdaStageFunctionProps;
  readonly snsTopic?: sns.ITopic;
  readonly snsTopicProps?: sns.TopicProps;
  readonly dlqEnabled?: boolean;
  readonly filterPolicy?: { [attribute: string]: sns.SubscriptionFilter };
}

class SnsToLambdaStageTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SnsToLambdaStageTestStackProps) {
    super(scope, id, props);

    new SnsToLambdaStage(this, "Stage", {
      ...props,
    });
  }
}

const app = new cdk.App();
new integration.IntegTest(app, "Sns Lambda Stage Integration Tests", {
    testCases: [
      new SnsToLambdaStageTestStack(app, "SnsLambdaBasic", {
        lambdaFunctionProps: {
          code: lambda.Code.fromInline("def lambda_handler(event, context): return 200"),
          handler: "lambda_function.lambda_handler",
          memorySize: 512,
          runtime: lambda.Runtime.PYTHON_3_9,
        },
      }),
      new SnsToLambdaStageTestStack(app, "SnsLambdaFull", {
        lambdaFunctionProps: {
          code: lambda.Code.fromInline("def lambda_handler(event, context): return 200"),
          handler: "lambda_function.lambda_handler",
          memorySize: 512,
          runtime: lambda.Runtime.PYTHON_3_9,
          errorsAlarmThreshold: 10,
          errorsEvaluationPeriods: 3,
          errorsComparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
          environment: {
            FOO: "BAR"
          }
        },
        dlqEnabled: true,
        filterPolicy: {
          color: sns.SubscriptionFilter.stringFilter({
            allowlist: ['red', 'orange'],
            matchPrefixes: ['bl'],
          }),
          size: sns.SubscriptionFilter.stringFilter({
            denylist: ['small', 'medium'],
          }),
          price: sns.SubscriptionFilter.numericFilter({
            between: { start: 100, stop: 200 },
            greaterThan: 300,
          }),
          store: sns.SubscriptionFilter.existsFilter(),
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
