import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as kms from "aws-cdk-lib/aws-kms";

import { assignKmsKeyProps } from "../src";

test("KMS Defaults", () => {
  const stack = new cdk.Stack();
  new kms.Key(stack, "Default Key", assignKmsKeyProps({}));

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::KMS::Key", {
    EnableKeyRotation: true,
    PendingWindowInDays: 30,
  });
});
