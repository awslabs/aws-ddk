import * as glue from "@aws-cdk/aws-glue-alpha";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { overrideProps } from "./utils";

export class GlueFactory {
  public static job(scope: Construct, id: string, props: glue.JobProps) {
    const defaultProps: Partial<glue.JobProps> = {
      maxConcurrentRuns: 1,
      maxRetries: 1,
      timeout: cdk.Duration.hours(10),
      securityConfiguration: new glue.SecurityConfiguration(scope, `${id}-security-configuration`, {
        s3Encryption: {
          mode: glue.S3EncryptionMode.S3_MANAGED,
        },
      }),
    };

    const mergedProps = overrideProps(defaultProps, props);
    return new glue.Job(scope, id, mergedProps);
  }
}
