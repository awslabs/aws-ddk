import path from "path";
import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";

import { SqsToLambdaStage } from "../src";

test("SQSToLambdaStage creates Lambda Function and SQS Queue", () => {
  const stack = new cdk.Stack();

  new SqsToLambdaStage(stack, "Stage", {
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

  template.hasResourceProperties("AWS::SQS::Queue", {
    VisibilityTimeout: 120,
  });
});

test("SQSToLambdaStage has event source mapping", () => {
  const stack = new cdk.Stack();

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9,
    },
    batchSize: 5,
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::Lambda::EventSourceMapping", {
    BatchSize: 5,
  });
});

test("SQSToLambdaStage does not use dead letter queue when not needed", () => {
  const stack = new cdk.Stack();

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9,
    },
  });

  const template = Template.fromStack(stack);

  // Main queue only
  template.resourceCountIs("AWS::SQS::Queue", 1);

  // The main queue has no redrive policy for the dead letter queue
  template.hasResourceProperties("AWS::SQS::Queue", {
    RedrivePolicy: Match.absent(),
  });
});

test("SQSToLambdaStage creates dead letter queue when needed", () => {
  const stack = new cdk.Stack();

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9,
    },
    dlqEnabled: true,
  });

  const template = Template.fromStack(stack);

  // Main queue and dead letter queue
  template.resourceCountIs("AWS::SQS::Queue", 2);

  // The main queue should have a redrive policy for the dead letter queue
  template.hasResourceProperties("AWS::SQS::Queue", {
    RedrivePolicy: Match.anyValue(),
  });
});

test("SQSToLambdaStage is able to reuse an existing queue", () => {
  const stack = new cdk.Stack();

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9,
    },
    sqsQueue: new sqs.Queue(stack, "Queue", {
      queueName: "custom-queue",
    }),
  });

  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::SQS::Queue", 1);
  template.hasResourceProperties("AWS::SQS::Queue", {
    QueueName: "custom-queue",
  });
});

test("SQSToLambdaStage is able to reuse an existing lambda", () => {
  const stack = new cdk.Stack();

  new SqsToLambdaStage(stack, "Stage", {
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

test("SQSToLambdaStage is able to create a CloudWatch alarm", () => {
  const stack = new cdk.Stack();

  const stage = new SqsToLambdaStage(stack, "Stage", {
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

test("SQSToLambda must have 'lambdaFunction' or 'lambdaFunctionProps' set", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new SqsToLambdaStage(stack, "Stage", {});
  }).toThrowError("'lambdaFunction' or 'lambdaFunctionProps' must be set to instantiate this stage");
});

test("SQSToLambda must have 'messageGroupId' when using a fifo queue", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new SqsToLambdaStage(stack, "Stage", {
      lambdaFunctionProps: {
        code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
        handler: "commons.handlers.lambda_handler",
        memorySize: 512,
        runtime: lambda.Runtime.PYTHON_3_9,
        layers: [
          lambda.LayerVersion.fromLayerVersionArn(
            stack,
            "Layer",
            "arn:aws:lambda:us-east-1:222222222222:layer:dummy:1",
          ),
        ],
      },
      sqsQueueProps: {
        fifo: true,
      },
    });
  }).toThrowError("'messageGroupId' must be set to when target is a fifo queue");
});

test("SQSToLambdaStage additional properties", () => {
  const stack = new cdk.Stack();

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      functionName: "dummy-function",
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_8,
      timeout: cdk.Duration.minutes(8),
    },
    messageGroupId: "dummy-group",
    maxReceiveCount: 2,
    dlqEnabled: true,
    sqsQueueProps: {
      queueName: "dummy-queue.fifo",
      fifo: true,
      visibilityTimeout: cdk.Duration.minutes(5),
    },
  });

  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::Lambda::Function", {
    Runtime: "python3.8",
    FunctionName: "dummy-function",
    Timeout: 480,
  });
  template.resourceCountIs("AWS::SQS::Queue", 2);
  template.hasResourceProperties("AWS::SQS::Queue", {
    VisibilityTimeout: 300,
    QueueName: "dummy-queue.fifo",
  });
});

test("SQSToLambdaStage DLQ No FIFO", () => {
  const stack = new cdk.Stack();

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      functionName: "dummy-function",
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_8,
    },
    messageGroupId: "dummy-group",
    maxReceiveCount: 2,
    dlqEnabled: true,
    sqsQueueProps: {
      queueName: "dummy-queue",
      visibilityTimeout: cdk.Duration.minutes(5),
    },
  });

  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::SQS::Queue", 2);
  template.hasResourceProperties("AWS::SQS::Queue", {
    VisibilityTimeout: 300,
    QueueName: "dummy-queue",
  });
});
