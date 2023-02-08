import path from "path";
import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as lambda from "aws-cdk-lib/aws-lambda";

import { Configurator, SqsToLambdaStage } from "../src";

test("Config Simple Override", () => {
  const sampleConfig = {
    "environments": {
      "dev": {
          "account": "222222222222",
          "region": "us-east-1",
          "resources": {
              "AWS::LAMBDA::FUNCTION": {"MemorySize": 128}
          }
      }
    }
  }

  const stack = new cdk.Stack();

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    },
  });

  new Configurator(stack, sampleConfig)
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::Lambda::Function", {
    MemorySize: 128,
  });
});
