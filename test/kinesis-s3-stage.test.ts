import * as firehose from "@aws-cdk/aws-kinesisfirehose-alpha";
import * as destinations from "@aws-cdk/aws-kinesisfirehose-destinations-alpha";
import * as cdk from "aws-cdk-lib";
import { Size } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as kinesis from "aws-cdk-lib/aws-kinesis";
import { Bucket } from "aws-cdk-lib/aws-s3";

import { FirehoseToS3Stage } from "../src";

test("FirehoseToS3Stage throws missing S3 Bucket error", () => {
  const stack = new cdk.Stack();

  const stage = () => {
    return new FirehoseToS3Stage(stack, "Stage", {});
  };

  expect(stage).toThrow(TypeError);
});

test("FirehoseToS3Stage creates Firehose DeliveryStream and S3 Bucket", () => {
  const stack = new cdk.Stack();

  const stage = new FirehoseToS3Stage(stack, "Stage", {
    s3BucketProps: {
      bucketName: "dummy-bucket",
      enforceSSL: false,
    },
  });

  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::S3::Bucket", { BucketName: "dummy-bucket" });

  template.hasResourceProperties("AWS::Lambda::Function", {
    Description: Match.stringLikeRegexp("Custom::S3BucketNotifications"),
  });

  template.hasResourceProperties("AWS::KinesisFirehose::DeliveryStream", {
    ExtendedS3DestinationConfiguration: Match.objectLike({
      BucketARN: Match.objectLike({
        "Fn::GetAtt": Match.arrayWith([
          stack.resolve((stage.bucket.node.defaultChild as cdk.CfnElement).logicalId),
          "Arn",
        ]),
      }),
      CompressionFormat: "GZIP",
      BufferingHints: {
        IntervalInSeconds: 300,
        SizeInMBs: 5,
      },
    }),
  });

  template.hasResourceProperties("AWS::CloudWatch::Alarm", {
    MetricName: "DeliveryToS3.DataFreshness",
    Threshold: 1,
    EvaluationPeriods: 1,
    Dimensions: Match.arrayWith([
      Match.objectLike({
        Name: "DeliveryStreamName",
        Value: {
          Ref: stack.resolve((stage.deliveryStream.node.defaultChild as cdk.CfnElement).logicalId),
        },
      }),
    ]),
  });
});

test("FirehoseToS3Stage uses S3 Bucket and creates Kinesis DataStream", () => {
  const stack = new cdk.Stack();

  const stage = new FirehoseToS3Stage(stack, "Stage", {
    s3Bucket: new Bucket(stack, "Bucket"),
    dataStreamEnabled: true,
    deliveryStreamDataFreshnessErrorsAlarmThreshold: 10,
  });

  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::S3::Bucket", 1);
  template.resourceCountIs("AWS::Kinesis::Stream", 1);

  template.hasResourceProperties("AWS::KinesisFirehose::DeliveryStream", {
    KinesisStreamSourceConfiguration: Match.objectLike({
      KinesisStreamARN: Match.objectLike({
        "Fn::GetAtt": Match.arrayWith([
          stack.resolve((stage.dataStream?.node.defaultChild as cdk.CfnElement).logicalId),
          "Arn",
        ]),
      }),
    }),
  });

  template.hasResourceProperties("AWS::CloudWatch::Alarm", {
    MetricName: "DeliveryToS3.DataFreshness",
    Threshold: 10,
  });
});

test("FirehoseToS3Stage uses existing S3 Bucket and Kinesis DataStream", () => {
  const stack = new cdk.Stack();

  const stage = new FirehoseToS3Stage(stack, "Stage", {
    s3Bucket: new Bucket(stack, "Bucket"),
    dataStream: new kinesis.Stream(stack, "Stream"),
    deliveryStreamDataFreshnessErrorsAlarmThreshold: 10,
  });

  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::S3::Bucket", 1);
  template.resourceCountIs("AWS::Kinesis::Stream", 1);

  template.hasResourceProperties("AWS::KinesisFirehose::DeliveryStream", {
    KinesisStreamSourceConfiguration: Match.objectLike({
      KinesisStreamARN: Match.objectLike({
        "Fn::GetAtt": Match.arrayWith([
          stack.resolve((stage.dataStream?.node.defaultChild as cdk.CfnElement).logicalId),
          "Arn",
        ]),
      }),
    }),
  });
});

test("FirehoseToS3Stage uses existing S3 Bucket and Firehose DeliveryStream", () => {
  const stack = new cdk.Stack();
  const s3Bucket = new Bucket(stack, "Bucket");
  new FirehoseToS3Stage(stack, "Stage", {
    s3Bucket: s3Bucket,
    firehoseDeliveryStream: new firehose.DeliveryStream(stack, "DeliveryStream", {
      destination: new destinations.S3Bucket(s3Bucket, {}),
    }),
  });

  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::S3::Bucket", 1);
  template.resourceCountIs("AWS::KinesisFirehose::DeliveryStream", 1);
});

test("FirehoseToS3Stage uses dataOutputPrefix in Firehose DeliveryStream", () => {
  const stack = new cdk.Stack();
  const bucket = new Bucket(stack, "Bucket");
  const prefix = "key/file.parquet";
  const errorOutputPrefix = "YYYY-MM-DD-HH";

  const stage = new FirehoseToS3Stage(stack, "Stage", {
    s3Bucket: bucket,
    kinesisFirehoseDestinationsS3BucketProps: {
      bufferingSize: Size.mebibytes(10),
      errorOutputPrefix: errorOutputPrefix,
    },
    dataOutputPrefix: prefix,
  });

  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::KinesisFirehose::DeliveryStream", {
    ExtendedS3DestinationConfiguration: Match.objectLike({
      BufferingHints: {
        IntervalInSeconds: 300,
        SizeInMBs: 10,
      },
      ErrorOutputPrefix: errorOutputPrefix,
      Prefix: prefix,
    }),
  });

  const eventPatternResolved = stage.eventPattern?.detail?.object;
  expect(eventPatternResolved).toEqual({ key: [{ prefix: prefix }] });
});
