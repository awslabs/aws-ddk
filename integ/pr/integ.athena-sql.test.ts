import * as integration from "@aws-cdk/integ-tests-alpha";
import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { RequireApproval } from "aws-cdk-lib/cloud-assembly-schema";

import { AthenaSQLStage } from "../../src";
import { StateMachineStageProps } from "../../src/pipelines/stage";

interface AthenaSqlStageTestStackProps extends StateMachineStageProps {
  readonly queryString: string[];
  readonly workGroup?: string;
  readonly catalogName?: string;
  readonly databaseName?: string;
  readonly outputLocation?: s3.Location;
  readonly encryptionOption?: tasks.EncryptionOption;
  readonly encryptionKey?: kms.Key;
}

class AthenaSqlStageTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AthenaSqlStageTestStackProps) {
    super(scope, id, props);

    new AthenaSQLStage(this, "Stage", {
      ...props,
    });
  }
}

const app = new cdk.App();
new integration.IntegTest(app, "AthenaSQL Stage Integration Tests", {
    testCases: [
      new AthenaSqlStageTestStack(app, "GlueTransformBasic", {
        queryString: ["SELECT 1"],
        workGroup: "primary",
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
