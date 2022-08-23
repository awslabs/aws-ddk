import { Compression, S3BucketProps } from '@aws-cdk/aws-kinesisfirehose-destinations-alpha';
import { Duration, Size } from 'aws-cdk-lib';

export function defaultDestinationsS3BucketProps(_dataOutputPrefix?: string) {
  return {
    compression: Compression.GZIP,
    bufferingInterval: Duration.seconds(300),
    bufferingSize: Size.mebibytes(5),
    ...(_dataOutputPrefix !== undefined && { dataOutputPrefix: _dataOutputPrefix }),
  } as S3BucketProps;
}
