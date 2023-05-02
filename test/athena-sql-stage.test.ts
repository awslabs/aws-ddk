import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as iam from "aws-cdk-lib/aws-iam";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";

import { AthenaSQLStage } from "../src";

test("AthenaToSQL stage creates State Machine single query", () => {
  const stack = new cdk.Stack();

  new AthenaSQLStage(stack, "athena-sql", {
    queryString: ["SELECT 1"],
    workGroup: "primary",
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": ["", Match.arrayWith([Match.stringLikeRegexp("Query Exec 0")])],
    },
  });
});

test("AthenaToSQL stage creates State Machine multiple query", () => {
  const stack = new cdk.Stack();

  new AthenaSQLStage(stack, "athena-sql", {
    queryString: ["SELECT 1", "SELECT 2"],
    workGroup: "primary",
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": ["", Match.arrayWith([Match.stringLikeRegexp("Query Exec 0")])],
    },
  });
});

test("AthenaToSQL stage creates State Machine with parallel branches", () => {
  const stack = new cdk.Stack();

  new AthenaSQLStage(stack, "athena-sql", {
    queryString: ["SELECT 1", "SELECT 2"],
    workGroup: "primary",
    parallel: true,
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": ["", Match.arrayWith([Match.stringLikeRegexp("All Jobs")])],
    },
  });
});

test("AthenaToSQL stage with additional properties", () => {
  const stack = new cdk.Stack();

  new AthenaSQLStage(stack, "athena-sql", {
    queryString: ["SELECT 1"],
    workGroup: "primary",
    encryptionOption: tasks.EncryptionOption.KMS,
    additionalRolePolicyStatements: [
      new iam.PolicyStatement({
        actions: ["s3:*"],
        resources: ["*"],
      }),
    ],
    stateMachineInput: { foo: "bar" },
    stateMachineName: "dummy-statemachine",
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": ["", Match.arrayWith([Match.stringLikeRegexp("Query Exec 0")])],
    },
    StateMachineName: "dummy-statemachine",
  });
});

test("AthenaToSQL stage using 'queryStringPath'", () => {
  const stack = new cdk.Stack();
  new AthenaSQLStage(stack, "athena-sql", {
    queryStringPath: "$.queryString",
    workGroup: "primary",
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": ["", Match.arrayWith([Match.stringLikeRegexp("Parameters.*QueryString.*.queryString")])],
    },
  });
});

test("AthenaSQLStage missing query string property", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new AthenaSQLStage(stack, "Stage", {});
  }).toThrowError("For this stage one of queryString or queryStringPath parameter is required");
});

test("AthenaSQLStage duplicate query string properties", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new AthenaSQLStage(stack, "Stage", {
      queryString: ["SELECT 1;"],
      queryStringPath: "$.queryString",
    });
  }).toThrowError("For this stage provide one of queryString or queryStringPath parameter, not both");
});
