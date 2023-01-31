import path from "path";
import * as integration from "@aws-cdk/integ-tests-alpha";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as glue_alpha from "@aws-cdk/aws-glue-alpha";
import { Construct } from "constructs";
import { RequireApproval } from "aws-cdk-lib/cloud-assembly-schema";

import { CICDPipelineStack, DataPipeline, FirehoseToS3Stage, SqsToLambdaStage } from "../src";

interface CICDPipelineTestStackProps extends cdk.StackProps {}

class CICDPipelineTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CICDPipelineTestStackProps) {
    super(scope, id, props);
    const devStage = new cdk.Stage(this, "dev", { env: { account: "228197580683" } });
    const devStack = new cdk.Stack(devStage, "application-stack");

    const bucket = new s3.Bucket(devStack, "Bucket");
    const firehoseToS3Stage = new FirehoseToS3Stage(devStack, "Firehose To S3 Stage", { s3Bucket: bucket });

    const sqsToLambdaStage = new SqsToLambdaStage(devStack, "SQS To Lambda Stage", {
      lambdaFunctionProps: {
        code: lambda.Code.fromInline("def lambda_handler(event, context): return 200"),
        handler: "lambda_function.lambda_handler",
        memorySize: 512,
        runtime: lambda.Runtime.PYTHON_3_9,
      },
    });

    const pipeline = new DataPipeline(devStack, "Pipeline", {});

    pipeline.addStage({ stage: firehoseToS3Stage }).addStage({ stage: sqsToLambdaStage });

    new CICDPipelineStack(this, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
      .addSourceAction({ repositoryName: "dummy-repository" })
      .addSynthAction()
      .buildPipeline()
      .addStage({ stageId: "dev", stage: devStage })
      .synth();
    }
}

const app = new cdk.App();
new integration.IntegTest(app, "Sqs Lambda Stage Integration Tests", {
    testCases: [
      new CICDPipelineTestStack(app, "CICDPipeline", {}),
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
