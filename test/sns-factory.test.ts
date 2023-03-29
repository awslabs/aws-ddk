import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as sns from "aws-cdk-lib/aws-sns";

import { SnsFactory } from "../src";

test("Sns Topic Policy", () => {
  const stack = new cdk.Stack();
  const topic = new sns.Topic(stack, "my topic");
  SnsFactory.secureSnsTopicPolicy(topic);
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::SNS::TopicPolicy", {
    PolicyDocument: {
      Statement: Match.arrayWith([]),
      Version: "2012-10-17",
    },
  });
});
