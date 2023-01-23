import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as iam from "aws-cdk-lib/aws-iam";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";

import { AthenaSQLStage } from "../src";

test("AthenaToSQL stage creates State Machine", () => {
  const stack = new cdk.Stack();

  new AthenaSQLStage(stack, "athena-sql", {
    queryString: "SELECT 1",
    workGroup: "primary",
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": ["", Match.arrayWith([Match.stringLikeRegexp("Start Query Exec")])],
    },
  });
});

test("AthenaToSQL stage with additional properties", () => {
  const stack = new cdk.Stack();

  new AthenaSQLStage(stack, "athena-sql", {
    queryString: "SELECT 1",
    workGroup: "primary",
    encryptionOption: tasks.EncryptionOption.KMS,
    additionalRolePolicyStatements: [
      new iam.PolicyStatement({
        actions: ["s3:*"],
        resources: ["*"],
      }),
    ],
    stateMachineInput: { foo: "bar" },
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": ["", Match.arrayWith([Match.stringLikeRegexp("Start Query Exec")])],
    },
  });
});
