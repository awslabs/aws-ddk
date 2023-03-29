import * as glue_alpha from "@aws-cdk/aws-glue-alpha";
import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as s3 from "aws-cdk-lib/aws-s3";

import { GlueFactory } from "../src";

test("Glue Job", () => {
  const stack = new cdk.Stack();

  GlueFactory.job(stack, "test job", {
    executable: glue_alpha.JobExecutable.pythonEtl({
      glueVersion: glue_alpha.GlueVersion.V3_0,
      script: glue_alpha.Code.fromBucket(s3.Bucket.fromBucketName(stack, "bucket", "my-bucket"), "my-script"),
      pythonVersion: glue_alpha.PythonVersion.THREE,
    }),
  });
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::Glue::Job", {
    MaxRetries: 1,
    ExecutionProperty: { MaxConcurrentRuns: 1 },
    Timeout: 600,
  });
  template.hasResourceProperties("AWS::Glue::SecurityConfiguration", {
    EncryptionConfiguration: { S3Encryptions: [{ S3EncryptionMode: "SSE-S3" }] },
  });
});

test("Glue Job Property Precedence", () => {
  const stack = new cdk.Stack();

  GlueFactory.job(stack, "test job", {
    executable: glue_alpha.JobExecutable.pythonEtl({
      glueVersion: glue_alpha.GlueVersion.V3_0,
      script: glue_alpha.Code.fromBucket(s3.Bucket.fromBucketName(stack, "bucket", "my-bucket"), "my-script"),
      pythonVersion: glue_alpha.PythonVersion.THREE,
    }),
    maxRetries: 2,
    maxConcurrentRuns: 2,
    securityConfiguration: new glue_alpha.SecurityConfiguration(stack, "test-job-security-configuration", {
      s3Encryption: {
        mode: glue_alpha.S3EncryptionMode.S3_MANAGED,
      },
    }),
  });
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::Glue::Job", {
    MaxRetries: 2,
    ExecutionProperty: { MaxConcurrentRuns: 2 },
  });
  template.hasResourceProperties("AWS::Glue::SecurityConfiguration", {
    Name: "testjobsecurityconfiguration",
    EncryptionConfiguration: { S3Encryptions: [{ S3EncryptionMode: "SSE-S3" }] },
  });
});
