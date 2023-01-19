import { Compression, S3BucketProps } from "@aws-cdk/aws-kinesisfirehose-destinations-alpha";
import * as cdk from "aws-cdk-lib";

export function defaultDestinationsS3BucketProps(_dataOutputPrefix?: string) {
  return {
    compression: Compression.GZIP,
    bufferingInterval: cdk.Duration.seconds(300),
    bufferingSize: cdk.Size.mebibytes(5),
    ...(_dataOutputPrefix !== undefined && { dataOutputPrefix: _dataOutputPrefix }),
  } as S3BucketProps;
}
