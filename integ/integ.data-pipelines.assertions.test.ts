import * as integration from "@aws-cdk/integ-tests-alpha";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import path from "path";
import { RequireApproval } from "aws-cdk-lib/cloud-assembly-schema";

import * as ddk from "../src";

const INPUT_KEY = "data.json";

interface DataPipelineTestStackProps extends cdk.StackProps {
}

class DataPipelineTestStack extends cdk.Stack {
  readonly bucket: s3.Bucket;
  readonly sqsToLambdaStage: ddk.SqsToLambdaStage;
  readonly outputQueue: sqs.Queue;

  constructor(scope: Construct, id: string, props: DataPipelineTestStackProps) {
    super(scope, id, props);

    this.outputQueue = new sqs.Queue(this, "Output Queue", {
      retentionPeriod: cdk.Duration.minutes(1),
    });
  
    this.bucket = new s3.Bucket(this, "Bucket", {
      eventBridgeEnabled: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const eventStage = new ddk.S3EventStage(this, "Event Stage", {
        bucket: this.bucket,
        eventNames: ["Object Created"],
    });

    this.sqsToLambdaStage = new ddk.SqsToLambdaStage(this, "SQS To Lambda Stage", {
      lambdaFunctionProps: {
        code: lambda.Code.fromAsset(path.join(__dirname, "/src/lambda_write_s3/")),
        handler: "lambda_function.lambda_handler",
        memorySize: cdk.Size.mebibytes(512).toMebibytes(),
        runtime: lambda.Runtime.PYTHON_3_9,
        environment: {
          QUEUE_URL: this.outputQueue.queueUrl,
        },
      },
    });

    this.outputQueue.grantSendMessages(this.sqsToLambdaStage.function);

    const pipeline = new ddk.DataPipeline(this, "Pipeline", {});
    pipeline.addStage({ stage: eventStage }).addStage({ stage: this.sqsToLambdaStage });
  }
}

const app = new cdk.App();
const stack = new DataPipelineTestStack(app, "DataPipelineS3SQSLambda", {})

const integTest = new integration.IntegTest(app, "SQS Lambda Stage Integration Tests", {
    testCases: [stack],
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

integTest.assertions.awsApiCall("S3", "putObject", {
  Bucket: stack.bucket.bucketName,
  Key: INPUT_KEY,
});

const message = integTest.assertions.awsApiCall("SQS", "receiveMessage", {
  QueueUrl: stack.outputQueue.queueUrl,
  WaitTimeSeconds: 20,
});

message.assertAtPath("Messages.0.Body.detail.object.key", integration.ExpectedResult.stringLikeRegexp(INPUT_KEY));
