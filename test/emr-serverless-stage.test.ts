import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as s3 from "aws-cdk-lib/aws-s3";

import { EMRServerlessJobStage } from "../src";

test("Basic Emr Stage", () => {
  const stack = new cdk.Stack();

  const bucket = new s3.Bucket(stack, "My Bucket");
  new EMRServerlessJobStage(stack, "EMR Serverless Job", {
    applicationId: "foobar",
    executionRoleArn: "arn:aws:iam::1111111111111:role/EmrServerlessExecutionRole",
    jobDriver: {
      SparkSubmit: {
        EntryPoint: `s3://${bucket.bucketName}/scripts/wordcount.py`,
        EntryPointArguments: [`s3://${bucket.bucketName}/emr-serverless-spark/output`],
        SparkSubmitParameters:
          "--conf spark.executor.cores=1 --conf spark.executor.memory=4g --conf spark.driver.cores=1 --conf spark.driver.memory=4g --conf spark.executor.instances=1",
      },
    },
  });
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": [
        "",
        Match.arrayWith([Match.stringLikeRegexp("Start Job Run"), Match.stringLikeRegexp("Get Job Status")]),
      ],
    },
  });
});

test("Emr Stage Additional Parameters", () => {
  const stack = new cdk.Stack();

  const bucket = new s3.Bucket(stack, "My Bucket");
  new EMRServerlessJobStage(stack, "EMR Serverless Job", {
    applicationId: "foobar",
    executionRoleArn: "arn:aws:iam::1111111111111:role/EmrServerlessExecutionRole",
    jobExecutionStatusCheckPeriod: cdk.Duration.minutes(2),
    jobDriver: {
      SparkSubmit: {
        EntryPoint: `s3://${bucket.bucketName}/scripts/wordcount.py`,
        EntryPointArguments: [`s3://${bucket.bucketName}/emr-serverless-spark/output`],
        SparkSubmitParameters:
          "--conf spark.executor.cores=1 --conf spark.executor.memory=4g --conf spark.driver.cores=1 --conf spark.driver.memory=4g --conf spark.executor.instances=1",
      },
    },
    startJobRunProps: {
      Name: "foobar",
    },
  });
});
