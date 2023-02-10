import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sns from "aws-cdk-lib/aws-sns";

export function secureSnsTopicPolicy(topic: sns.ITopic) {
  topic.addToResourcePolicy(
    new iam.PolicyStatement({
      sid: "TopicOwnerOnlyAccess",
      effect: iam.Effect.ALLOW,
      principals: [new iam.AccountPrincipal(cdk.Stack.of(topic).account)],
      actions: [
        "sns:AddPermission",
        "sns:GetTopicAttributes",
        "sns:SetTopicAttributes",
        "sns:Subscribe",
        "sns:RemovePermission",
        "sns:Publish",
      ],
      resources: [topic.topicArn],
    }),
  );
  topic.addToResourcePolicy(
    new iam.PolicyStatement({
      sid: "HttpsOnly",
      effect: iam.Effect.DENY,
      principals: [new iam.AnyPrincipal()],
      actions: ["sns:Subscribe", "sns:Publish"],
      resources: [topic.topicArn],
      conditions: { Bool: { "aws:SecureTransport": false } },
    }),
  );
}
