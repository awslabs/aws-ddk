import * as glue_alpha from "@aws-cdk/aws-glue-alpha";
import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";

import { GlueJobType, GlueTransformStage } from "../src";

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

  const glueIamRole = new iam.Role(stack, "GlueRole", {
    assumedBy: new iam.ServicePrincipal("glue.amazonaws.com"),
    managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSGlueServiceRole")],
  });

  new GlueTransformStage(stack, "glue-transform", {
    jobProps: {
      glueJobType: GlueJobType.PY_SPARK_ETL_JOB,
      glueJobProperties: {
        script: glue_alpha.Code.fromBucket(s3.Bucket.fromBucketName(stack, "bucket", "my-bucket"), "my-script"),
        role: glueIamRole,
        glueVersion: glue_alpha.GlueVersion.V3_0,
        pythonVersion: glue_alpha.PythonVersion.THREE,
        jobName: "myJob",
      },
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

test("GlueTransformStage stage creates Glue Crawler 2", () => {
  const stack = new cdk.Stack();

  new GlueTransformStage(stack, "glue-transform", {
    jobName: "myJob",
    crawlerRole: "role",
    targets: {
      s3Targets: [
        {
          path: "s3://my-bucket/crawl-path",
        },
      ],
    },
  });

  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::Glue::Job", 0);
  template.hasResourceProperties("AWS::Glue::Crawler", {
    Role: "role",
    Targets: {
      S3Targets: [{ Path: "s3://my-bucket/crawl-path" }],
    },
  });
});

test("GlueTranformStage must have 'jobName' or 'jobProps' set", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new GlueTransformStage(stack, "Stage", {});
  }).toThrowError("'jobName' or 'jobProps' must be set to instantiate this stage");
});

test("GlueTranformStage must set crawler targets", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new GlueTransformStage(stack, "Stage", {
      jobName: "myJob",
      crawlerRole: "arn:aws:iam::role/dummy-role",
    });
  }).toThrowError("Crawler Targets must be set either by 'targets' or 'crawlerProps.targets");
});

test("GlueTransformStage retry settings", () => {
  const stack = new cdk.Stack();

  new GlueTransformStage(stack, "glue-transform", {
    jobName: "myJob",
    crawlerName: "myCrawler",
    stateMachineRetryBackoffRate: 3,
    stateMachineRetryInterval: cdk.Duration.seconds(5),
    stateMachineRetryMaxAttempts: 2,
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": [
        "",
        Match.arrayWith([Match.stringLikeRegexp('Crawl Object.*IntervalSeconds":5.*MaxAttempts":2.*BackoffRate":3')]),
      ],
    },
  });
});

test("GlueTransformStage crawler allow failure settings", () => {
  const stack = new cdk.Stack();

  new GlueTransformStage(stack, "glue-transform-disallow-failure", {
    jobName: "myJob",
    crawlerName: "myCrawler",
    crawlerAllowFailure: false,
  });

  new GlueTransformStage(stack, "glue-transform-allow-failure", {
    jobName: "myJob",
    crawlerName: "myCrawler",
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
    DefinitionString: {
      "Fn::Join": ["", Match.arrayWith([Match.stringLikeRegexp("Catch.*ErrorEquals.*Glue.CrawlerRunningException")])],
    },
  });
});

test("GlueTransformStage no crawler", () => {
  const stack = new cdk.Stack();

  new GlueTransformStage(stack, "glue-transform-no-crawler", {
    jobName: "myJob",
  });

  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::Glue::Crawler", 0);
});
