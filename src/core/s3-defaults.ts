import { RemovalPolicy } from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Bucket, BucketProps } from "aws-cdk-lib/aws-s3";

export function defaultS3BucketProps(loggingBucket?: Bucket, lifecycleRules?: s3.LifecycleRule[]): s3.BucketProps {
  return {
    encryption: s3.BucketEncryption.S3_MANAGED,
    versioned: false,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    removalPolicy: RemovalPolicy.RETAIN,
    enforceSSL: true,
    eventBridgeEnabled: false,
    ...(lifecycleRules !== undefined && { lifecycleRules }),
    ...(loggingBucket !== undefined && { serverAccessLogsBucket: loggingBucket }),
  } as BucketProps;
}
