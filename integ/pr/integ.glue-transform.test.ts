import * as integration from "@aws-cdk/integ-tests-alpha";
import * as cdk from "aws-cdk-lib";
import path from "path";
import * as glue_alpha from "@aws-cdk/aws-glue-alpha";
import { Construct } from "constructs";
import { RequireApproval } from "aws-cdk-lib/cloud-assembly-schema";

import { GlueJobType, GlueTransformStage } from "../../src";
import * as iam from "aws-cdk-lib/aws-iam";

class GlueTransformStageTestStack extends cdk.Stack {
  readonly job: glue_alpha.IJob;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const glueIamRole = new iam.Role(this, "GlueRole", {
      assumedBy: new iam.ServicePrincipal("glue.amazonaws.com"),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSGlueServiceRole")],
    });

    const stage = new GlueTransformStage(this, "Stage", {
      jobProps: {
        glueJobType: GlueJobType.PYTHON_SHELL_JOB,
        glueJobProperties: {
          script: glue_alpha.Code.fromAsset(path.join(__dirname, "/src/glue_script.py")),
          glueVersion: glue_alpha.GlueVersion.V1_0,
          pythonVersion: glue_alpha.PythonVersion.THREE,
          role: glueIamRole,
        },
      },
      crawlerName: "dummy-crawler",
    });

    this.job = stage.glueJob
  }
}

const app = new cdk.App();
const stack = new GlueTransformStageTestStack(app, "GlueTransformBasic");
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
