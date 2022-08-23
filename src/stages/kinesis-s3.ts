import * as firehose from '@aws-cdk/aws-kinesisfirehose-alpha';
import * as destinations from '@aws-cdk/aws-kinesisfirehose-destinations-alpha';
import * as events from 'aws-cdk-lib/aws-events';
import * as kinesis from 'aws-cdk-lib/aws-kinesis';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { defaultDestinationsS3BucketProps } from '../core/kinesis-firehose-defaults';
import { defaultS3BucketProps } from '../core/s3-defaults';
import { consolidateProps, overrideProps } from '../core/utils';
import { DataStage, DataStageProps } from '../pipelines/stage';

export interface FirehoseToS3StageProps extends DataStageProps {
  readonly s3Bucket?: s3.IBucket;
  readonly s3BucketProps?: s3.BucketProps;
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
      const defaultBucketProps = overrideProps(defaultS3BucketProps(), { eventBridgeEnabled: true });
      const consolidatedBucketProps = consolidateProps(defaultBucketProps, props.s3BucketProps);
      this.bucket = new s3.Bucket(this, 'Stage Bucket', consolidatedBucketProps);
    } else {
      throw TypeError("'s3Bucket' or 's3BucketProps' must be set to instantiate this stage");
    }

    const dataStreamEnabled = props.dataStreamEnabled ?? false;
    if (dataStreamEnabled == true) {
      this.dataStream = new kinesis.Stream(this, 'Data Stream', {});
    }

    const destinationsBucketProps = props.kinesisFirehoseDestinationsS3BucketProps ?? {};
    const consolidatedDestinationsBucketProps = consolidateProps(
      defaultDestinationsS3BucketProps(props.dataOutputPrefix),
      destinationsBucketProps,
    );
    this.deliveryStream = new firehose.DeliveryStream(this, 'Delivery Stream', {
      destinations: [new destinations.S3Bucket(this.bucket, consolidatedDestinationsBucketProps)],
      sourceStream: this.dataStream,
    });
    const dataOutputPrefix: string = consolidatedDestinationsBucketProps.dataOutputPrefix;

    this.addAlarm('Data Freshness Errors', {
      metric: this.deliveryStream.metric('DeliveryToS3.DataFreshness', {
        period: consolidatedDestinationsBucketProps.bufferingInterval,
        statistic: 'Maximum',
      }),
      threshold: props.deliveryStreamDataFreshnessErrorsAlarmThreshold,
      evaluationPeriods: props.deliveryStreamDataFreshnessErrorsEvaluationPeriods,
    });

    const eventDetail = {
      bucket: { name: [this.bucket.bucketName] },
      ...(dataOutputPrefix && { object: { key: [{ prefix: dataOutputPrefix }] } }),
    };

    this.eventPattern = {
      source: ['aws.s3'],
      detail: eventDetail,
      detailType: ['Object Created'],
    };
  }
}
