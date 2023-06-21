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
        Match.arrayWith([Match.stringLikeRegexp("Trigger Dag"), Match.stringLikeRegexp("Get Dag Execution Status")]),
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
        Match.arrayWith([Match.stringLikeRegexp("Trigger Dag"), Match.stringLikeRegexp("Get Dag Execution Status")]),
      ],
    },
  });
});

test("MWAA Trigger Dags Path", () => {
  const stack = new cdk.Stack();
  new MWAATriggerDagsStage(stack, "MWAA Stage", {
    mwaaEnvironmentName: "dummyenv",
    dagPath: "$.dag_ids",
  });
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": ["", Match.arrayWith([Match.stringLikeRegexp(".*dag_ids")])],
    },
  });
});

test("MWAATriggerDags missing dags property", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new MWAATriggerDagsStage(stack, "Stage", {
      mwaaEnvironmentName: "dummyenv",
    });
  }).toThrowError("For this stage one of 'dags' or 'dagPath' parameter is required");
});

test("MWAATriggerDags duplicate dags properties", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new MWAATriggerDagsStage(stack, "Stage", {
      mwaaEnvironmentName: "dummyenv",
      dags: ["foo"],
      dagPath: "$.dags",
    });
  }).toThrowError("For this stage provide one of 'dags' or 'dagPath' parameter, not both");
});
