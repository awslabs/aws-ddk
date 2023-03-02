import * as glue from "@aws-cdk/aws-glue-alpha";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { overrideProps } from "./utils";

export class GlueDefaults {
  public static jobProps(scope: Construct, id: string, props: glue.JobProps) {
    const defaultProps: Partial<glue.JobProps> = {
      maxConcurrentRuns: 1,
      maxRetries: 1,
      timeout: cdk.Duration.hours(10),
      securityConfiguration: new glue.SecurityConfiguration(scope, id, {
        securityConfigurationName: `${id}-security-config`,
        s3Encryption: {
          mode: glue.S3EncryptionMode.S3_MANAGED,
        },
      }),
    };

    return overrideProps(defaultProps, props);
  }
}
