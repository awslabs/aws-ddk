import path from "path";
import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";

import { Configurator, CICDPipelineStack, DataPipeline, FirehoseToS3Stage, SqsToLambdaStage } from "../src";

test("Config Simple Override", () => {
  const sampleConfig = {
    environments: {
      dev: {
        account: "222222222222",
        region: "us-east-1",
        resources: {
          "AWS::Lambda::Function": {
            MemorySize: 128,
            Runtime: lambda.Runtime.PYTHON_3_8,
          },
        },
      },
    },
  };
  console.log(typeof sampleConfig);
  const stack = new cdk.Stack();

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    },
  });

  new Configurator(stack, sampleConfig, "dev");
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::Lambda::Function", {
    MemorySize: 128,
    Runtime: {
      bundlingDockerImage: { image: "public.ecr.aws/sam/build-python3.8" },
      bundlingImage: { image: "public.ecr.aws/sam/build-python3.8" },
      family: 2,
      name: "python3.8",
      supportsCodeGuruProfiling: true,
      supportsInlineCode: true,
    },
  });
});

test("Different values per environment", () => {
  const sampleConfig = {
    environments: {
      dev: {
        resources: {
          "AWS::Lambda::Function": {
            MemorySize: 128,
          },
          "AWS::SQS::Queue": {
            MessageRetentionPeriod: 300,
          },
        },
      },
      stage: {
        resources: {
          "AWS::Lambda::Function": {
            MemorySize: 512,
          },
          "AWS::SQS::Queue": {
            MessageRetentionPeriod: 3600,
          },
        },
      },
      prod: {
        resources: {
          "AWS::Lambda::Function": {
            MemorySize: 1024,
          },
          "AWS::SQS::Queue": {
            MessageRetentionPeriod: 7200,
          },
        },
      },
    },
  };

  const stacks: { [environment: string]: cdk.Stack } = {
    dev: new cdk.Stack(),
    stage: new cdk.Stack(),
    prod: new cdk.Stack(),
  };

  for (const env in stacks) {
    new SqsToLambdaStage(stacks[env], "Stage", {
      lambdaFunctionProps: {
        code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
        handler: "commons.handlers.lambda_handler",
        memorySize: 256,
        runtime: lambda.Runtime.PYTHON_3_9,
      },
    });
    new Configurator(stacks[env], sampleConfig, env);
  }

  const devTemplate = Template.fromStack(stacks.dev);
  devTemplate.hasResourceProperties("AWS::Lambda::Function", {
    MemorySize: 128,
  });
  devTemplate.hasResourceProperties("AWS::SQS::Queue", {
    MessageRetentionPeriod: 300,
  });

  const stageTemplate = Template.fromStack(stacks.stage);
  stageTemplate.hasResourceProperties("AWS::Lambda::Function", {
    MemorySize: 512,
  });
  stageTemplate.hasResourceProperties("AWS::SQS::Queue", {
    MessageRetentionPeriod: 3600,
  });

  const prodTemplate = Template.fromStack(stacks.prod);
  prodTemplate.hasResourceProperties("AWS::Lambda::Function", {
    MemorySize: 1024,
  });
  prodTemplate.hasResourceProperties("AWS::SQS::Queue", {
    MessageRetentionPeriod: 7200,
  });
});

test("File Based Config", () => {
  const stack = new cdk.Stack();

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    },
  });

  new Configurator(stack, "./test/test-config.json", "dev");
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::Lambda::Function", {
    MemorySize: 128,
    Runtime: "python3.8",
  });
});

test("CICDPipeline with Config", () => {
  const app = new cdk.App();

  // Dev
  const devStage = new cdk.Stage(app, "dev", { env: { account: "000000000000" } });
  const devStack = new cdk.Stack(devStage, "dev-application-stack");
  new Configurator(devStage, "./test/test-config.json", "dev");
  const devBucket = new s3.Bucket(devStack, "Bucket");
  const devFirehoseToS3Stage = new FirehoseToS3Stage(devStack, "Firehose To S3 Stage", { s3Bucket: devBucket });

  const devSqsToLambdaStage = new SqsToLambdaStage(devStack, "SQS To Lambda Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    },
  });

  const devDataPipeline = new DataPipeline(devStack, "Pipeline", {});

  devDataPipeline.addStage({ stage: devFirehoseToS3Stage }).addStage({ stage: devSqsToLambdaStage });

  // Prod
  const prodStage = new cdk.Stage(app, "prod", { env: { account: "000000000000" } });
  const prodStack = new cdk.Stack(prodStage, "prod-application-stack");
  new Configurator(prodStage, "./test/test-config.json", "prod");
  const prodBucket = new s3.Bucket(prodStack, "Bucket");
  const prodFirehoseToS3Stage = new FirehoseToS3Stage(prodStack, "Firehose To S3 Stage", { s3Bucket: prodBucket });

  const prodSqsToLambdaStage = new SqsToLambdaStage(prodStack, "SQS To Lambda Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    },
  });
  const prodDataPipeline = new DataPipeline(prodStack, "Pipeline", {});
  prodDataPipeline.addStage({ stage: prodFirehoseToS3Stage }).addStage({ stage: prodSqsToLambdaStage });

  // CI/CD Stack
  new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction()
    .buildPipeline()
    .addStage({ stageId: "dev", stage: devStage })
    .addStage({ stageId: "prod", stage: prodStage })
    .synth();

  const devStageTemplate = Template.fromStack(devStack);
  devStageTemplate.hasResourceProperties("AWS::Lambda::Function", {
    MemorySize: 128,
    Runtime: "python3.8",
  });
  const prodStageTemplate = Template.fromStack(prodStack);
  prodStageTemplate.hasResourceProperties("AWS::Lambda::Function", {
    MemorySize: 1024,
    Runtime: "python3.8",
  });
});
