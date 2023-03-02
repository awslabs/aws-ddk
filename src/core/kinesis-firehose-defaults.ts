import { Compression, S3BucketProps } from "@aws-cdk/aws-kinesisfirehose-destinations-alpha";
import * as cdk from "aws-cdk-lib";
import { overrideProps } from "./utils";

export class FirehoseDestinationsDefaults {
  public static s3Props(props: S3BucketProps) {
    const defaultProps: Partial<S3BucketProps> = {
      compression: Compression.GZIP,
      bufferingInterval: cdk.Duration.seconds(300),
      bufferingSize: cdk.Size.mebibytes(5),
    };

    return overrideProps(defaultProps, props);
  }
}
