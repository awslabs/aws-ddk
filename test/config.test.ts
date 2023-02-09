import path from "path";
import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as lambda from "aws-cdk-lib/aws-lambda";

import { Configurator, SqsToLambdaStage } from "../src";

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
