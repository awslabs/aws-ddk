import path from "path";
import * as glue_alpha from "@aws-cdk/aws-glue-alpha";
import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as events from "aws-cdk-lib/aws-events";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";

import { DataPipeline, FirehoseToS3Stage, GlueTransformStage, S3EventStage, SqsToLambdaStage } from "../src";

test("Basic DataPipeline", () => {
  const stack = new cdk.Stack();

  const bucket = new s3.Bucket(stack, "Bucket");

  const firehoseToS3Stage = new FirehoseToS3Stage(stack, "Firehose To S3 Stage", { s3Bucket: bucket });

  const sqsToLambdaStage = new SqsToLambdaStage(stack, "SQS To Lambda Stage 2", {
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

  const pipeline = new DataPipeline(stack, "Pipeline", {});

  pipeline.addNotifications().addStage({ stage: firehoseToS3Stage }).addStage({ stage: sqsToLambdaStage });

  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::SNS::Topic", 1);

  template.resourceCountIs("AWS::Events::Rule", 1);
  template.hasResourceProperties("AWS::Events::Rule", {
    State: "ENABLED",
    EventPattern: Match.objectLike({
      "detail-type": firehoseToS3Stage.eventPattern?.detailType,
      source: firehoseToS3Stage.eventPattern?.source,
    }),
    Targets: Match.arrayEquals([
      Match.objectLike({
        Arn: {
          "Fn::GetAtt": [stack.resolve((sqsToLambdaStage.queue.node.defaultChild as cdk.CfnElement).logicalId), "Arn"],
        },
      }),
    ]),
  });
});

test("DataPipeline cannot have a Stage without targets in the middle", () => {
  const stack = new cdk.Stack();

  const bucket = new s3.Bucket(stack, "Bucket");

  const s3EventStage = new S3EventStage(stack, "S3 Event Stage", {
    eventNames: ["Object Created"],
    bucket: bucket,
  });

  const sqsToLambdaStage = new SqsToLambdaStage(stack, "SQS To Lambda Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9,
    },
    dlqEnabled: true,
  });

  const pipeline = new DataPipeline(stack, "Pipeline", {});

  pipeline.addNotifications().addStage({ stage: sqsToLambdaStage });

  expect(() => {
    pipeline.addStage({ stage: s3EventStage });
  }).toThrowError();
});

test("DataPipeline with Scheduled stage", () => {
  const stack = new cdk.Stack();
  const bucket = new s3.Bucket(stack, "Bucket");

  const firehoseToS3Stage = new FirehoseToS3Stage(stack, "Firehose To S3 Stage", { s3Bucket: bucket });

  const sqsToLambdaStage = new SqsToLambdaStage(stack, "SQS To Lambda Stage 2", {
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

  const glueTranformStage = new GlueTransformStage(stack, "glue-transform", {
    jobProps: {
      executable: glue_alpha.JobExecutable.pythonEtl({
        glueVersion: glue_alpha.GlueVersion.V3_0,
        script: glue_alpha.Code.fromBucket(s3.Bucket.fromBucketName(stack, "bucket", "my-bucket"), "my-script"),
        pythonVersion: glue_alpha.PythonVersion.THREE,
      }),
      jobName: "myJob",
    },
    crawlerName: "myCrawler",
  });
  const pipeline = new DataPipeline(stack, "Pipeline", {});
  pipeline
    .addStage({ stage: firehoseToS3Stage })
    .addStage({ stage: sqsToLambdaStage })
    .addStage({ stage: glueTranformStage, schedule: events.Schedule.rate(cdk.Duration.minutes(5)) });

  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::Events::Rule", 2);
  template.hasResourceProperties("AWS::Events::Rule", {
    State: "ENABLED",
    ScheduleExpression: "rate(5 minutes)",
  });
});

test("DataPipeline with override rule", () => {
  const stack = new cdk.Stack();
  const bucket = new s3.Bucket(stack, "Bucket");

  const firehoseToS3Stage = new FirehoseToS3Stage(stack, "Firehose To S3 Stage", { s3Bucket: bucket });

  const sqsToLambdaStage = new SqsToLambdaStage(stack, "SQS To Lambda Stage 2", {
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

  const pipeline = new DataPipeline(stack, "Pipeline", {});
  pipeline.addStage({ stage: firehoseToS3Stage }).addStage({
    stage: sqsToLambdaStage,
    overrideRule: new events.Rule(stack, "rule", {
      eventPattern: {
        source: ["aws.ec2"],
      },
    }),
  });

  Template.fromStack(stack);
});

test("DataPipeline with skip rule", () => {
  const stack = new cdk.Stack();
  const bucket = new s3.Bucket(stack, "Bucket");

  const firehoseToS3Stage = new FirehoseToS3Stage(stack, "Firehose To S3 Stage", { s3Bucket: bucket });

  const sqsToLambdaStage = new SqsToLambdaStage(stack, "SQS To Lambda Stage 2", {
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

  const pipeline = new DataPipeline(stack, "Pipeline", {});
  pipeline.addStage({ stage: firehoseToS3Stage }).addStage({
    stage: sqsToLambdaStage,
    skipRule: true,
  });
  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::Events::Rule", 0);
});
