import * as firehose from "@aws-cdk/aws-kinesisfirehose-alpha";
import * as destinations from "@aws-cdk/aws-kinesisfirehose-destinations-alpha";
import * as cdk from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as kinesis from "aws-cdk-lib/aws-kinesis";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { overrideProps } from "../core";
import { S3Factory } from "../core/s3-factory";
import { DataStage, DataStageProps } from "../pipelines/stage";

export interface FirehoseToS3StageProps extends DataStageProps {
  readonly s3Bucket?: s3.IBucket;
  readonly s3BucketProps?: s3.BucketProps;
  readonly firehoseDeliveryStreamProps?: firehose.DeliveryStreamProps;
  readonly kinesisFirehoseDestinationsS3BucketProps?: destinations.S3BucketProps;

  readonly dataOutputPrefix?: string;
  readonly dataStreamEnabled?: boolean;
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
      const bucketProps = overrideProps(
        {
          eventBridgeEnabled: true,
        },
        props.s3BucketProps,
      );
      this.bucket = S3Factory.bucket(this, "Stage Bucket", bucketProps);
    } else {
      throw TypeError("'s3Bucket' or 's3BucketProps' must be set to instantiate this stage");
    }

    const dataStreamEnabled = props.dataStreamEnabled ?? false;
    if (dataStreamEnabled == true) {
      this.dataStream = new kinesis.Stream(this, "Data Stream", {});
    }

    const destinationsBucketProps = overrideProps(
      {
        dataOutputPrefix: props.dataOutputPrefix,
        compression: destinations.Compression.GZIP,
        bufferingInterval: cdk.Duration.seconds(300),
        bufferingSize: cdk.Size.mebibytes(5),
      },
      props.kinesisFirehoseDestinationsS3BucketProps ?? {},
    );
    this.deliveryStream = new firehose.DeliveryStream(this, "Delivery Stream", {
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
