import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as iam from "aws-cdk-lib/aws-iam";

import { DataBrewTransformStage } from "../src";

test("DataBrew Transfrom stage creates State Machine & Alarm", () => {
  const stack = new cdk.Stack();

  new DataBrewTransformStage(stack, "databrew-transform", {
    jobName: "dummy-job",
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": ["", Match.arrayWith([Match.stringLikeRegexp("Start DataBrew Job")])],
    },
  });
  template.hasResourceProperties("AWS::CloudWatch::Alarm", {
    ComparisonOperator: "GreaterThanThreshold",
    EvaluationPeriods: 1,
    MetricName: "ExecutionsFailed",
    Namespace: "AWS/States",
    Period: 300,
    Statistic: "Sum",
    Threshold: 5,
  });
});

test("DataBrew Transfrom stage created with jobName and createJob set", () => {
  const stack = new cdk.Stack();

  new DataBrewTransformStage(stack, "databrew-transform", {
    jobName: "dummy-job",
    jobType: "PROFILE",
    createJob: true,
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::DataBrew::Job", {
    Name: "dummy-job",
    Type: "PROFILE",
  });
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": ["", Match.arrayWith([Match.stringLikeRegexp("Start DataBrew Job")])],
    },
  });
});

test("DataBrew Transfrom stage created with only 'jobType' set", () => {
  const stack = new cdk.Stack();

  new DataBrewTransformStage(stack, "databrew-transform", {
    jobType: "PROFILE",
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::DataBrew::Job", {
    Name: "databrew-transform-job",
    Type: "PROFILE",
  });
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": ["", Match.arrayWith([Match.stringLikeRegexp("Start DataBrew Job")])],
    },
  });
});

test("DataBrew Transfrom stage created with 'roleArn' set", () => {
  const stack = new cdk.Stack();
  const jobRole = new iam.Role(stack, "DataBrew Job Role", {
    assumedBy: new iam.ServicePrincipal("databrew.amazonaws.com"),
    description: "Default DataBrew Job Role created by the AWS DDK",
    managedPolicies: [
      iam.ManagedPolicy.fromManagedPolicyName(
        stack,
        "DataBrew Service Role Policy",
        "service-role/AWSGlueDataBrewServiceRole",
      ),
    ],
  });
  new DataBrewTransformStage(stack, "databrew-transform", {
    jobRoleArn: jobRole.roleArn,
    jobType: "PROFILE",
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::DataBrew::Job", {
    Name: "databrew-transform-job",
    Type: "PROFILE",
  });
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": ["", Match.arrayWith([Match.stringLikeRegexp("Start DataBrew Job")])],
    },
  });
});

test("DataBrew Transform must have 'jobType' if 'createJob' is enabled or no existing 'jobName' is provided", () => {
  const stack = new cdk.Stack();

  expect(() => {
    new DataBrewTransformStage(stack, "appflow-ingestion", {
      jobName: "dummy-job",
      createJob: true,
    });
  }).toThrowError("if 'jobType' is a required property when creating a new DataBrew job");
});
