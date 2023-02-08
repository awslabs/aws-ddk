import path from "path";
import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sns from "aws-cdk-lib/aws-sns";

import { SnsToLambdaStage } from "../src";

test("SnsToLambdaStage creates Lambda Function and Sns Topic", () => {
  const stack = new cdk.Stack();

  new SnsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(stack, "Layer", "arn:aws:lambda:us-east-1:222222222222:layer:dummy:1"),
      ],
    },
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::Lambda::Function", {
    Runtime: "python3.9",
    MemorySize: 512,
    Layers: Match.arrayWith(["arn:aws:lambda:us-east-1:222222222222:layer:dummy:1"]),
  });

  template.hasResourceProperties("AWS::SNS::Topic", {});
  template.resourceCountIs("AWS::SNS::Subscription", 1);
  template.resourceCountIs("AWS::SNS::TopicPolicy", 1);
});

test("SnsToLambdaStage with default policy disabled", () => {
  const stack = new cdk.Stack();

  new SnsToLambdaStage(stack, "Stage", {
    disableDefaultTopicPolicy: true,
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(stack, "Layer", "arn:aws:lambda:us-east-1:222222222222:layer:dummy:1"),
      ],
    },
  });

  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::SNS::TopicPolicy", 0);
});

test("SnsToLambdaStage does not use dead letter queue when not needed", () => {
  const stack = new cdk.Stack();

  new SnsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9,
    },
  });

  const template = Template.fromStack(stack);

  // Main queue only
  template.resourceCountIs("AWS::SQS::Queue", 0);
});

test("SnsToLambdaStage creates dead letter queue when needed", () => {
  const stack = new cdk.Stack();

  new SnsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9,
    },
    dlqEnabled: true,
  });

  const template = Template.fromStack(stack);

  // Main queue and dead letter queue
  template.resourceCountIs("AWS::SQS::Queue", 1);
});

test("SnsToLambdaStage is able to reuse an existing queue", () => {
  const stack = new cdk.Stack();

  new SnsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9,
    },
    snsTopic: new sns.Topic(stack, "Topic", {
      topicName: "custom-topic",
    }),
  });

  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::SNS::Topic", 1);
  template.hasResourceProperties("AWS::SNS::Topic", {
    TopicName: "custom-topic",
  });
});

test("SnsToLambdaStage is able to reuse an existing lambda", () => {
  const stack = new cdk.Stack();

  new SnsToLambdaStage(stack, "Stage", {
    lambdaFunction: new lambda.Function(stack, "Function", {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9,
      functionName: "custom-function",
    }),
  });

  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::Lambda::Function", 1);
  template.hasResourceProperties("AWS::Lambda::Function", {
    FunctionName: "custom-function",
  });
});

test("SnsToLambdaStage is able to create a CloudWatch alarm", () => {
  const stack = new cdk.Stack();

  const stage = new SnsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9,
      errorsAlarmThreshold: 10,
      errorsEvaluationPeriods: 3,
      errorsComparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    },
  });

  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::CloudWatch::Alarm", {
    Threshold: 10,
    EvaluationPeriods: 3,
    Dimensions: Match.arrayWith([
      Match.objectLike({
        Name: "FunctionName",
        Value: {
          Ref: stack.resolve((stage.function.node.defaultChild as cdk.CfnElement).logicalId),
        },
      }),
    ]),
  });
});

test("SnsToLambdaStage additional properties", () => {
  const stack = new cdk.Stack();

  new SnsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromInline("def lambda_handler(event, context): return 200"),
      handler: "lambda_function.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
      errorsAlarmThreshold: 10,
      errorsEvaluationPeriods: 3,
      errorsComparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      environment: {
        FOO: "BAR",
      },
    },
    dlqEnabled: true,
    filterPolicy: {
      color: sns.SubscriptionFilter.stringFilter({
        allowlist: ["red", "orange"],
        matchPrefixes: ["bl"],
      }),
      size: sns.SubscriptionFilter.stringFilter({
        denylist: ["small", "medium"],
      }),
      store: sns.SubscriptionFilter.existsFilter(),
    },
  });

  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::SNS::Subscription", {
    FilterPolicy: {
      color: ["red", "orange", { prefix: "bl" }],
      size: [{ "anything-but": ["small", "medium"] }],
      store: [{ exists: true }],
    },
  });
});

test("SnsToLambda must have 'lambdaFunction' or 'lambdaFunctionProps' set", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new SnsToLambdaStage(stack, "Stage", {});
  }).toThrowError("'lambdaFunction' or 'lambdaFunctionProps' must be set to instantiate this stage");
});

test("SnsToLambda cannot use a fifo topic", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new SnsToLambdaStage(stack, "Stage", {
      lambdaFunctionProps: {
        code: lambda.Code.fromInline("def lambda_handler(event, context): return 200"),
        handler: "lambda_function.lambda_handler",
        memorySize: 512,
        runtime: lambda.Runtime.PYTHON_3_9,
        errorsAlarmThreshold: 10,
        errorsEvaluationPeriods: 3,
        errorsComparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      },
      dlqEnabled: true,
      snsTopicProps: {
        contentBasedDeduplication: true,
        fifo: true,
      },
    });
  }).toThrowError("FIFO SNS Topics are unsupported for Lambda Triggers");
});
