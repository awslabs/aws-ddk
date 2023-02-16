import * as integration from "@aws-cdk/integ-tests-alpha";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { RequireApproval } from "aws-cdk-lib/cloud-assembly-schema";

import { FirehoseToS3Stage } from "../src";

interface FirehoseToS3StageTestStackProps extends cdk.StackProps {
  readonly enforceSSL?: boolean;
  readonly dataStreamEnabled?: boolean;
  readonly deliveryStreamDataFreshnessErrorsEvaluationPeriods?: number;
}

class FirehoseToS3StageTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FirehoseToS3StageTestStackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "Bucket");
    new FirehoseToS3Stage(this, "Stage", {
      s3Bucket: bucket,
      dataStreamEnabled: props.dataStreamEnabled,
      deliveryStreamDataFreshnessErrorsEvaluationPeriods: props.deliveryStreamDataFreshnessErrorsEvaluationPeriods,
    });
  }
}

const app = new cdk.App();
new integration.IntegTest(app, "Firehose S3 Stage Integration Tests", {
    testCases: [
      new FirehoseToS3StageTestStack(app, "Basic", {}),
      new FirehoseToS3StageTestStack(app, "DataStream", {dataStreamEnabled: true})
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
