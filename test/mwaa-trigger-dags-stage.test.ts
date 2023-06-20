import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";

import { MWAATriggerDagsStage } from "../src";

test("MWAA Trigger Dags Stage Basic", () => {
  const stack = new cdk.Stack();
  new MWAATriggerDagsStage(stack, "MWAA Stage", { mwaaEnvironmentName: "dummyenv", dags: ["dummy"] });
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": [
        "",
        Match.arrayWith([
          Match.stringLikeRegexp("Trigger Dag dummy"),
          Match.stringLikeRegexp("Get Dag dummy Execution Status"),
        ]),
      ],
    },
  });
});

test("MWAA Trigger Dags Stage More Options", () => {
  const stack = new cdk.Stack();
  new MWAATriggerDagsStage(stack, "MWAA Stage", {
    mwaaEnvironmentName: "dummyenv",
    dags: ["foo", "bar"],
    statusCheckPeriod: cdk.Duration.minutes(1),
  });
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": [
        "",
        Match.arrayWith([
          Match.stringLikeRegexp("Trigger Dag foo"),
          Match.stringLikeRegexp("Get Dag foo Execution Status"),
          Match.stringLikeRegexp("Trigger Dag bar"),
          Match.stringLikeRegexp("Get Dag bar Execution Status"),
        ]),
      ],
    },
  });
});
