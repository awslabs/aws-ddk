import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";

import { RedshiftDataApiStage } from "../src";

test("RedshiftDataApi stage creates State Machine", () => {
  const stack = new cdk.Stack();

  new RedshiftDataApiStage(stack, "redshiftdata", {
    redshiftClusterIdentifier: "foobar",
    sqlStatements: ["CREATE SCHEMA foobar;"],
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": [
        "",
        Match.arrayWith([
          Match.stringLikeRegexp("redshiftdata Execute Statement on Redshift"),
          Match.stringLikeRegexp("redshiftdata Describe Statement on Redshift"),
        ]),
      ],
    },
  });
});

test("RedshiftDataApi stage with additional properties", () => {
  const stack = new cdk.Stack();

  new RedshiftDataApiStage(stack, "redshiftdata", {
    redshiftClusterIdentifier: "foobar",
    sqlStatements: ["CREATE SCHEMA foobar;"],
    databaseName: "prod",
    databaseUser: "admin",
    pollingTime: cdk.Duration.minutes(1),
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": ["", Match.arrayWith([Match.stringLikeRegexp('ClusterIdentifier":"foobar')])],
    },
  });
});
