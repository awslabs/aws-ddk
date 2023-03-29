import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { overrideProps } from "./utils";

export class S3Factory {
  public static bucket(scope: Construct, id: string, props: s3.BucketProps): s3.Bucket {
    const defaultProps: Partial<s3.BucketProps> = {
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      enforceSSL: true,
      eventBridgeEnabled: false,
    };

    const mergedProps = overrideProps(defaultProps, props);
    return new s3.Bucket(scope, id, mergedProps);
  }
}
