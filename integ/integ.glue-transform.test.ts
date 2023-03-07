import * as integration from "@aws-cdk/integ-tests-alpha";
import * as cdk from "aws-cdk-lib";
import path from "path";
import * as glue_alpha from "@aws-cdk/aws-glue-alpha";
import * as glue from "aws-cdk-lib/aws-glue";
import { Construct } from "constructs";
import { RequireApproval } from "aws-cdk-lib/cloud-assembly-schema";

import { GlueTransformStage } from "../src";
import { StateMachineStageProps } from "../src/pipelines/stage";

interface GlueTransformStageTestStackProps extends StateMachineStageProps {
  readonly jobName?: string;
  readonly jobProps?: glue_alpha.JobProps;
  readonly jobRunArgs?: { [key: string]: any };
  readonly crawlerName?: string;
  readonly crawlerProps?: glue.CfnCrawlerProps;
}

class GlueTransformStageTestStack extends cdk.Stack {
  readonly job: glue_alpha.IJob;
  constructor(scope: Construct, id: string, props: GlueTransformStageTestStackProps) {
    super(scope, id, props);

    const stage = new GlueTransformStage(this, "Stage", {
      ...props,
    });
    this.job = stage.glueJob
  }
}

const app = new cdk.App();
const stack = new GlueTransformStageTestStack(app, "GlueTransformBasic", {
  jobProps: {
    executable: glue_alpha.JobExecutable.pythonShell({
      glueVersion: glue_alpha.GlueVersion.V1_0,
      pythonVersion: glue_alpha.PythonVersion.THREE,
      script: glue_alpha.Code.fromAsset(path.join(__dirname, "/src/glue_script.py")),
    })
  },
  crawlerName: "dummy-crawler",
});
const integTest = new integration.IntegTest(app, "Glue Transform Stage Integration Tests", {
    testCases: [
      stack
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

integTest.assertions.awsApiCall("Glue", "startJobRun", {
  JobName: stack.job.jobName,
});
