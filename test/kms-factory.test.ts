import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";

import { KmsFactory } from "../src";

test("Kms Key", () => {
  const stack = new cdk.Stack();
  KmsFactory.key(stack, "test key", {});
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::KMS::Key", {
    EnableKeyRotation: true,
    PendingWindowInDays: 30,
  });
});

test("Kms Key Property Precedence", () => {
  const stack = new cdk.Stack();
  KmsFactory.key(stack, "test key", {
    enableKeyRotation: false,
    pendingWindow: cdk.Duration.days(7),
  });
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::KMS::Key", {
    EnableKeyRotation: false,
    PendingWindowInDays: 7,
  });
});
