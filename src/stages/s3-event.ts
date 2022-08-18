import * as events from 'aws-cdk-lib/aws-events';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { EventStage, EventStageProps } from '../pipelines/stage';

export interface S3EventStageProps extends EventStageProps {
  readonly eventNames: string[];
  readonly bucket: s3.IBucket;
  readonly keyPrefix?: string;
}

export class S3EventStage extends EventStage {
  readonly eventPattern?: events.EventPattern;

  readonly bucket: s3.IBucket;

  constructor(scope: Construct, id: string, props: S3EventStageProps) {
    super(scope, id, props);

    this.bucket = props.bucket;

    var detail: { [key: string]: any } = {
      bucket: {
        name: props.bucket.bucketName,
      },
    };

    if (props.keyPrefix) {
      detail.object = {
        key: [
          {
            prefix: props.keyPrefix,
          },
        ],
      };
    }

    this.eventPattern = {
      source: ['aws.s3'],
      detail: detail,
      detailType: props.eventNames,
    };
  }
}