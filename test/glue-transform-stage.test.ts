import * as glue_alpha from "@aws-cdk/aws-glue-alpha";
import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as s3 from "aws-cdk-lib/aws-s3";

import { GlueTransformStage } from "../src";

test("GlueTransformStage stage creates State Machine", () => {
  const stack = new cdk.Stack();

  new GlueTransformStage(stack, "glue-transform", {
    jobName: "myJob",
    crawlerName: "myCrawler",
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": [
        "",
        Match.arrayWith([Match.stringLikeRegexp("Start Job Run"), Match.stringLikeRegexp("Crawl Object")]),
      ],
    },
  });
  template.resourceCountIs("AWS::Glue::Job", 0);
  template.resourceCountIs("AWS::Glue::Crawler", 0);
});

test("GlueTransformStage stage creates Glue Job", () => {
  const stack = new cdk.Stack();

  new GlueTransformStage(stack, "glue-transform", {
    jobProps: {
      executable: glue_alpha.JobExecutable.pythonEtl({
        glueVersion: glue_alpha.GlueVersion.V3_0,
        script: glue_alpha.Code.fromBucket(s3.Bucket.fromBucketName(stack, "bucket", "my-bucket"), "my-script"),
        pythonVersion: glue_alpha.PythonVersion.THREE,
      }),
      jobName: "myJob",
    },
    jobRunArgs: {
      foo: "bar",
    },
    crawlerName: "myCrawler",
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::Glue::Job", {
    Name: "myJob",
  });
  template.resourceCountIs("AWS::Glue::Crawler", 0);
});

test("GlueTransformStage stage creates Glue Crawler", () => {
  const stack = new cdk.Stack();

  new GlueTransformStage(stack, "glue-transform", {
    jobName: "myJob",
    crawlerProps: {
      role: "role",
      targets: {
        s3Targets: [
          {
            path: "s3://my-bucket/crawl-path",
          },
        ],
      },
    },
  });

  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::Glue::Job", 0);
  template.hasResourceProperties("AWS::Glue::Crawler", {
    Role: "role",
  });
});

test("GlueTranformStage must have 'jobName' or 'jobProps' set", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new GlueTransformStage(stack, "Stage", {});
  }).toThrowError("'jobName' or 'jobProps' must be set to instantiate this stage");
});

test("GlueTranformStage must have 'crawlerName' or 'crawlerProps' set", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new GlueTransformStage(stack, "Stage", {
      jobName: "myJob",
    });
  }).toThrowError("'crawlerName' or 'crawlerProps' must be set to instantiate this stage");
});
