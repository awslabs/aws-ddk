import * as integration from "@aws-cdk/integ-tests-alpha";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { RequireApproval } from "aws-cdk-lib/cloud-assembly-schema";

import { S3EventStage } from "../src";

interface S3EventStageTestStackProps extends cdk.StackProps {
  readonly eventNames: string[];
  readonly keyPrefix?: string | string[];
}

class S3EventStageTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: S3EventStageTestStackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "Bucket");
    new S3EventStage(this, "Stage", {
      bucket: bucket,
      eventNames: props.eventNames,
      keyPrefix: props.keyPrefix,
    });
  }
}

const app = new cdk.App();

new integration.IntegTest(app, "S3 Event Integration Tests", {
    testCases: [
      new S3EventStageTestStack(app, "NoPrefix", {
        eventNames: ["Object Created"],
      }),
      new S3EventStageTestStack(app, "Prefix", {
        eventNames: ["Object Created"],
        keyPrefix: "test/",
      }),
      new S3EventStageTestStack(app, "ListofPrefixes", {
        eventNames: ["Object Created"],
        keyPrefix: ["foo/", "bar/"]
      }),
    ],
    diffAssets: true,
    stackUpdateWorkflow: true,
    cdkCommandOptions: {
      deploy: {
        args: {
          requireApproval: RequireApproval.NEVER,
          json: true,
        },
      },
      destroy: {
        args: {
          force: true,
        },
      },
    },
  });

