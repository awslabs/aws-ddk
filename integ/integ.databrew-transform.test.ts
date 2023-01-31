import * as integration from "@aws-cdk/integ-tests-alpha";
import * as cdk from "aws-cdk-lib";
import * as databrew from "aws-cdk-lib/aws-databrew";
import { Construct } from "constructs";
import { RequireApproval } from "aws-cdk-lib/cloud-assembly-schema";

import { DataBrewTransformStage } from "../src";
import { StateMachineStageProps } from "../src/pipelines/stage";

interface DataBrewTransformStageTestStackProps extends StateMachineStageProps {
  readonly jobName?: string;
  readonly jobRoleArn?: string;
  readonly jobType?: string;
  readonly datasetName?: string;
  readonly recipe?: databrew.CfnJob.RecipeProperty;
  readonly outputs?: databrew.CfnJob.OutputProperty[];
  readonly createJob?: boolean;
}

class DataBrewTransformStageTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DataBrewTransformStageTestStackProps) {
    super(scope, id, props);

    new DataBrewTransformStage(this, "Stage", {
      ...props,
    });
  }
}

const app = new cdk.App();
new integration.IntegTest(app, "Sqs Lambda Stage Integration Tests", {
    testCases: [
      new DataBrewTransformStageTestStack(app, "GlueTransformBasic", {
        jobName: "dummy-job",
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
