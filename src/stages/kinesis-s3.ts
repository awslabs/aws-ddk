import * as firehose from "@aws-cdk/aws-kinesisfirehose-alpha";
import * as destinations from "@aws-cdk/aws-kinesisfirehose-destinations-alpha";
import * as cdk from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kinesis from "aws-cdk-lib/aws-kinesis";
import * as kms from "aws-cdk-lib/aws-kms";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { overrideProps } from "../core";
import { S3Factory } from "../core/s3-factory";
import { DataStage, DataStageProps } from "../pipelines/stage";

export interface DeliveryStreamProps {
  readonly destinations?: firehose.IDestination[];
  readonly deliveryStreamName?: string;
  readonly encryption?: firehose.StreamEncryption;
  readonly encryptionKey?: kms.IKey;
  readonly role?: iam.IRole;
  readonly sourceStream?: kinesis.IStream;
}

export interface FirehoseToS3StageProps extends DataStageProps {
  readonly s3Bucket?: s3.IBucket;
  readonly s3BucketProps?: s3.BucketProps;
  readonly firehoseDeliveryStream?: firehose.DeliveryStream;
  readonly firehoseDeliveryStreamProps?: DeliveryStreamProps;
  readonly kinesisFirehoseDestinationsS3BucketProps?: destinations.S3BucketProps;
  readonly dataOutputPrefix?: string;
  readonly dataStreamEnabled?: boolean;
  readonly dataStream?: kinesis.Stream;
  readonly deliveryStreamDataFreshnessErrorsAlarmThreshold?: number;
  readonly deliveryStreamDataFreshnessErrorsEvaluationPeriods?: number;
}

export class FirehoseToS3Stage extends DataStage {
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;

  readonly bucket: s3.IBucket;
  readonly deliveryStream: firehose.DeliveryStream;
  readonly dataStream?: kinesis.Stream;

  constructor(scope: Construct, id: string, props: FirehoseToS3StageProps) {
    super(scope, id, props);

    if (props.s3Bucket) {
      this.bucket = props.s3Bucket;
    } else if (props.s3BucketProps) {
      this.bucket = S3Factory.bucket(this, "Stage Bucket", {
        ...props.s3BucketProps,
        eventBridgeEnabled: true,
      });
    } else {
      throw TypeError("'s3Bucket' or 's3BucketProps' must be set to instantiate this stage");
    }

    if (props.dataStreamEnabled == true && !props.dataStream) {
      this.dataStream = new kinesis.Stream(this, "Data Stream", {});
    } else if (props.dataStreamEnabled != false && props.dataStream) {
      this.dataStream = props.dataStream;
    }

    const destinationsBucketProps = overrideProps(
      {
        compression: destinations.Compression.GZIP,
        bufferingInterval: cdk.Duration.seconds(300),
        bufferingSize: cdk.Size.mebibytes(5),
      },
      {
        ...(props.kinesisFirehoseDestinationsS3BucketProps ?? {}),
        dataOutputPrefix: props.dataOutputPrefix,
      },
    );
    this.deliveryStream = props.firehoseDeliveryStream
      ? props.firehoseDeliveryStream
      : new firehose.DeliveryStream(this, "Delivery Stream", {
          destinations: [new destinations.S3Bucket(this.bucket, destinationsBucketProps)],
          sourceStream: this.dataStream,
          ...props.firehoseDeliveryStreamProps,
        });
    const dataOutputPrefix: string = destinationsBucketProps.dataOutputPrefix;

    this.addAlarm("Data Freshness Errors", {
      metric: this.deliveryStream.metric("DeliveryToS3.DataFreshness", {
        period: destinationsBucketProps.bufferingInterval,
        statistic: "Maximum",
      }),
      threshold: props.deliveryStreamDataFreshnessErrorsAlarmThreshold,
      evaluationPeriods: props.deliveryStreamDataFreshnessErrorsEvaluationPeriods,
    });

    const eventDetail = {
      bucket: { name: [this.bucket.bucketName] },
      ...(dataOutputPrefix && { object: { key: [{ prefix: dataOutputPrefix }] } }),
    };

    this.eventPattern = {
      source: ["aws.s3"],
      detail: eventDetail,
      detailType: ["Object Created"],
    };
  }
}
