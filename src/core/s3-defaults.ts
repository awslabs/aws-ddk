import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { overrideProps } from "../core/utils";

export class S3Defaults {
  public static bucketProps(props: s3.BucketProps): s3.BucketProps {
    const defaultProps: Partial<s3.BucketProps> = {
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      enforceSSL: true,
      eventBridgeEnabled: false,
    };

    return overrideProps(defaultProps, props);
  }
}
