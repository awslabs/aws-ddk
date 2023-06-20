import * as integration from "@aws-cdk/integ-tests-alpha";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { RequireApproval } from "aws-cdk-lib/cloud-assembly-schema";

import { MWAATriggerDagsStage } from "../src";


class MWAATriggerDagsStageTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    new MWAATriggerDagsStage(this, "MWAA Trigger Stage", {
      mwaaEnvironmentName: "dummy",
      dags: ["foo", "bar"]
    });
  }
}

const app = new cdk.App();
new integration.IntegTest(app, "MWAA Trigger Dags Stage Integration Tests", {
    testCases: [
      new MWAATriggerDagsStageTestStack(app, "MWAATriggerDagsTest", {}),
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
