import { assert } from "console";
import path from "path";
import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

import {
  Configurator,
  CICDPipelineStack,
  DataPipeline,
  FirehoseToS3Stage,
  SqsToLambdaStage,
  getConfig,
  getStackSynthesizer,
} from "../src";

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

test("Config Override Stage By Id", () => {
  const sampleConfig = {
    environments: {
      dev: {
        resources: {
          "Process Function": {
            MemorySize: 1024,
          },
          "Stage/Queue": {
            VisibilityTimeout: 300,
          },
        },
      },
    },
  };
  const stack = new cdk.Stack();
  new Configurator(stack, sampleConfig, "dev");

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(stack, "Layer", "arn:aws:lambda:us-east-1:222222222222:layer:dummy:1"),
      ],
    },
  });

  new SqsToLambdaStage(stack, "Stage2", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_9,
    },
  });

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::Lambda::Function", {
    MemorySize: 1024,
  });
  template.hasResourceProperties("AWS::SQS::Queue", {
    MemorySize: Match.absent(),
    VisibilityTimeout: 300,
  });
  template.hasResourceProperties("AWS::SQS::Queue", {
    VisibilityTimeout: 120,
  });
});

test("Config Override By Id", () => {
  class NestedStack extends cdk.Stack {
    constructor(scope: Construct, id: string) {
      super(scope, id);
      new s3.Bucket(this, "AVeryLongBucketNameInsideANestedStack");
    }
  }
  const sampleConfig = {
    environments: {
      dev: {
        resources: {
          MyBucket: {
            BucketName: "my-exact-bucket-name-for-this-resource",
          },
          AVeryLongBucketNameInsideANestedStack: {
            BucketName: "override-bucket-name",
          },
          MyQueue: {
            KmsMasterKeyId: "alias/aws/sqs",
          },
        },
      },
    },
  };
  const stack = new cdk.Stack();
  new s3.Bucket(stack, "MyBucket");
  new sqs.Queue(stack, "MyQueue");
  new sqs.Queue(stack, "MyUnencryptedQueue");
  new Configurator(stack, sampleConfig, "dev");
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::S3::Bucket", {
    BucketName: "my-exact-bucket-name-for-this-resource",
  });
  template.hasResourceProperties("AWS::SQS::Queue", {
    KmsMasterKeyId: "alias/aws/sqs",
  });
  template.hasResourceProperties("AWS::SQS::Queue", {
    KmsMasterKeyId: Match.absent(),
  });

  const app = new cdk.App();
  const nestedStack = new NestedStack(app, "PlaceholderWithExcessivelyLongNameABCDEFGHIJFKLMNOPQRSTUVXXYZ");
  new Configurator(nestedStack, sampleConfig, "dev");
  const nestedTemplate = Template.fromStack(nestedStack);
  nestedTemplate.hasResourceProperties("AWS::S3::Bucket", {
    BucketName: "override-bucket-name",
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
        tags: { CostCenter: "2020" },
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
        tags: { CostCenter: "3030" },
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
        tags: { CostCenter: "4040" },
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
    Tags: [
      {
        Key: "CostCenter",
        Value: "2020",
      },
    ],
  });
  devTemplate.hasResourceProperties("AWS::SQS::Queue", {
    MessageRetentionPeriod: 300,
    Tags: [
      {
        Key: "CostCenter",
        Value: "2020",
      },
    ],
  });

  const stageTemplate = Template.fromStack(stacks.stage);
  stageTemplate.hasResourceProperties("AWS::Lambda::Function", {
    MemorySize: 512,
    Tags: [
      {
        Key: "CostCenter",
        Value: "3030",
      },
    ],
  });
  stageTemplate.hasResourceProperties("AWS::SQS::Queue", {
    MessageRetentionPeriod: 3600,
    Tags: [
      {
        Key: "CostCenter",
        Value: "3030",
      },
    ],
  });

  const prodTemplate = Template.fromStack(stacks.prod);
  prodTemplate.hasResourceProperties("AWS::Lambda::Function", {
    MemorySize: 1024,
    Tags: [
      {
        Key: "CostCenter",
        Value: "4040",
      },
    ],
  });
  prodTemplate.hasResourceProperties("AWS::SQS::Queue", {
    MessageRetentionPeriod: 7200,
    Tags: [
      {
        Key: "CostCenter",
        Value: "4040",
      },
    ],
  });
});

test("File Based Config: JSON", () => {
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
    Tags: [
      {
        Key: "CostCenter",
        Value: "2014",
      },
      {
        Key: "global:foo",
        Value: "bar",
      },
    ],
  });
});

test("File Based Config: YAML", () => {
  const stack = new cdk.Stack();

  new SqsToLambdaStage(stack, "Stage", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    },
  });

  new Configurator(stack, "./test/test-config.yaml", "dev");
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::Lambda::Function", {
    MemorySize: 128,
    Runtime: "python3.8",
    Tags: [
      {
        Key: "CostCenter",
        Value: "2014",
      },
      {
        Key: "global:foo",
        Value: "bar",
      },
    ],
  });
});

test("File based config: Bad Format", () => {
  const stack = new cdk.Stack();
  expect(() => {
    new Configurator(stack, "./test/test-config.jso", "dev");
  }).toThrowError("Config file must be in YAML or JSON format");
});

test("File based config: None specified, default does not exist", () => {
  const synthesizer = getStackSynthesizer({ environmentId: "dev" });
  const expectedValues = {
    qualifier: "hnb659fds",
    bucketName: "cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}",
    repositoryName: "cdk-hnb659fds-container-assets-${AWS::AccountId}-${AWS::Region}",
    _deployRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-deploy-role-${AWS::AccountId}-${AWS::Region}",
    _cloudFormationExecutionRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-cfn-exec-role-${AWS::AccountId}-${AWS::Region}",
    fileAssetPublishingRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-file-publishing-role-${AWS::AccountId}-${AWS::Region}",
    imageAssetPublishingRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-image-publishing-role-${AWS::AccountId}-${AWS::Region}",
    lookupRoleArn:
      "arn:${AWS::Partition}:iam::${AWS::AccountId}:role/cdk-hnb659fds-lookup-role-${AWS::AccountId}-${AWS::Region}",
    bucketPrefix: "",
    dockerTagPrefix: "",
    bootstrapStackVersionSsmParameter: "/cdk-bootstrap/hnb659fds/version",
  };
  for (const attribute in expectedValues) {
    assert(
      synthesizer[attribute as keyof typeof synthesizer] === expectedValues[attribute as keyof typeof expectedValues],
    );
  }
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

test("Get Env Config Attribute", () => {
  const app = new cdk.App();
  const config = new Configurator(app, "./test/test-config.json", "dev");
  assert(config.getConfigAttribute("account") === "222222222222");
});

test("Get Config : Non-Existent File", () => {
  const app = new cdk.App();
  const config = new Configurator(app, "./test/not-real.yaml", "dev");
  const expectedDevConfig = {};
  assert(config.getConfigAttribute("foo") === expectedDevConfig);
});

test("Get Env Config", () => {
  assert(getConfig({ config: "./test/test-config.json" })?.environments.dev.account === "222222222222");
  assert(getConfig({}) === undefined);
});

test("Get Env Config Static Method", () => {
  const config = Configurator.getEnvConfig({ configPath: "./test/test-config.yaml", environmentId: "dev" });
  const nullConfig = Configurator.getEnvConfig({ configPath: "./ddk.json", environmentId: "dev" });
  const expectedDevConfig = {
    account: "222222222222",
    region: "us-east-1",
    resources: {
      "AWS::Lambda::Function": {
        MemorySize: 128,
        Runtime: "python3.8",
      },
    },
    tags: { CostCenter: "2014" },
  };
  assert(config === expectedDevConfig);
  assert(nullConfig === undefined);
});

test("Get Tags", () => {
  const devTags = Configurator.getTags({ configPath: "./test/test-config.yaml", environmentId: "dev" });
  const prodTags = Configurator.getTags({ configPath: "./test/test-config.yaml", environmentId: "prod" });
  const globalTags = Configurator.getTags({ configPath: "./test/test-config.yaml" });
  assert(devTags.CostCenter === "2014");
  assert(prodTags.CostCenter === "2015");
  assert(globalTags["global:foo"] === "bar");
});
