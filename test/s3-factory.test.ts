import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";

import { S3Factory } from "../src";

test("S3 Bucket", () => {
  const stack = new cdk.Stack();
  S3Factory.bucket(stack, "Test Bucket", {});
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::S3::Bucket", {
    BucketEncryption: {
      ServerSideEncryptionConfiguration: [{ ServerSideEncryptionByDefault: { SSEAlgorithm: "AES256" } }],
    },
    PublicAccessBlockConfiguration: {},
  });
});
