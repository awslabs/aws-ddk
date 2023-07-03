import path from "path";
import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import { ShellStep } from "aws-cdk-lib/pipelines";
import { CICDPipelineStack, DataPipeline, FirehoseToS3Stage, CICDActions, SqsToLambdaStage } from "../src";

test("Basic CICDPipeline", () => {
  const app = new cdk.App();
  const devStage = new cdk.Stage(app, "dev", { env: { account: "000000000000" } });
  const devStack = new cdk.Stack(devStage, "application-stack");

  const bucket = new s3.Bucket(devStack, "Bucket");
  const firehoseToS3Stage = new FirehoseToS3Stage(devStack, "Firehose To S3 Stage", { s3Bucket: bucket });

  const sqsToLambdaStage = new SqsToLambdaStage(devStack, "SQS To Lambda Stage 2", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(
          devStack,
          "Layer",
          "arn:aws:lambda:us-east-1:222222222222:layer:dummy:1",
        ),
      ],
    },
  });

  const pipeline = new DataPipeline(devStack, "Pipeline", {});

  pipeline.addStage({ stage: firehoseToS3Stage }).addStage({ stage: sqsToLambdaStage });

  const stack = new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction()
    .buildPipeline()
    .addStage({ stageId: "dev", stage: devStage })
    .synth();

  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::CodePipeline::Pipeline", 1);
  template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
    Stages: Match.arrayWith([
      Match.objectLike({
        Name: "Source",
        Actions: Match.arrayWith([
          Match.objectLike({
            Name: "dummy-repository",
            ActionTypeId: {
              Category: "Source",
              Provider: "CodeCommit",
            },
            Configuration: {
              RepositoryName: "dummy-repository",
              BranchName: "main",
            },
          }),
        ]),
      }),
      Match.objectLike({
        Name: "Build",
        Actions: Match.arrayWith([
          Match.objectLike({
            Name: "Synth",
            ActionTypeId: {
              Category: "Build",
              Provider: "CodeBuild",
            },
          }),
        ]),
      }),
      Match.objectLike({
        Name: "UpdatePipeline",
        Actions: Match.arrayWith([
          Match.objectLike({
            Name: "SelfMutate",
            ActionTypeId: {
              Category: "Build",
              Provider: "CodeBuild",
            },
          }),
        ]),
      }),
      Match.objectLike({
        Name: "dev",
      }),
    ]),
  });
  template.hasResourceProperties("AWS::IAM::Role", {
    AssumeRolePolicyDocument: Match.objectLike({
      Statement: [
        {
          Action: "sts:AssumeRole",
          Effect: "Allow",
          Principal: {
            Service: "codepipeline.amazonaws.com",
          },
        },
      ],
    }),
  });
  template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
    Name: "dummy-pipeline",
  });
  template.hasResourceProperties("AWS::KMS::Key", {
    EnableKeyRotation: true,
  });
});

test("CICDPipeline with manual approval set", () => {
  const app = new cdk.App();
  const devStage = new cdk.Stage(app, "dev", { env: { account: "000000000000" } });
  const devStack = new cdk.Stack(devStage, "application-stack");

  const bucket = new s3.Bucket(devStack, "Bucket");
  const firehoseToS3Stage = new FirehoseToS3Stage(devStack, "Firehose To S3 Stage", { s3Bucket: bucket });

  const sqsToLambdaStage = new SqsToLambdaStage(devStack, "SQS To Lambda Stage 2", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(
          devStack,
          "Layer",
          "arn:aws:lambda:us-east-1:222222222222:layer:dummy:1",
        ),
      ],
    },
  });

  const pipeline = new DataPipeline(devStack, "Pipeline", {});

  pipeline.addStage({ stage: firehoseToS3Stage }).addStage({ stage: sqsToLambdaStage });

  const stack = new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction()
    .buildPipeline()
    .addStage({ stageId: "dev", stage: devStage, manualApprovals: true })
    .synth();

  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::CodePipeline::Pipeline", 1);
});

test("CICDPipeline with wave", () => {
  const app = new cdk.App();
  const devStage = new cdk.Stage(app, "dev", { env: { account: "000000000000" } });
  const devStack = new cdk.Stack(devStage, "dev-application-stack");
  const prodStage = new cdk.Stage(app, "prod", { env: { account: "000000000000" } });
  const prodStack = new cdk.Stack(prodStage, "prod-application-stack");
  new s3.Bucket(devStack, "Bucket");
  new s3.Bucket(prodStack, "Bucket");

  const stack = new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction()
    .buildPipeline()
    .addWave({ stageId: "applications", stages: [devStage, prodStage] })
    .synth();

  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::CodePipeline::Pipeline", 1);
});

test("CICD Pipeline with Security Checks", () => {
  const app = new cdk.App();
  const stack = new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction()
    .buildPipeline()
    .addSecurityLintStage({})
    .addTestStage({})
    .synth();

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
    Stages: Match.arrayWith([
      Match.objectLike({
        Name: "SecurityLint",
        Actions: Match.arrayWith([
          Match.objectLike({
            Name: "Bandit",
            ActionTypeId: {
              Category: "Build",
              Provider: "CodeBuild",
            },
          }),
          Match.objectLike({
            Name: "CFNNag",
            ActionTypeId: {
              Category: "Build",
              Provider: "CodeBuild",
            },
          }),
        ]),
      }),
      Match.objectLike({
        Name: "Tests",
        Actions: Match.arrayWith([
          Match.objectLike({
            Name: "Tests",
            ActionTypeId: {
              Category: "Build",
              Provider: "CodeBuild",
            },
          }),
        ]),
      }),
    ]),
  });
});

test("CICD Pipeline with Cfn Nag Action Set to Fail", () => {
  const app = new cdk.App();
  const stack = new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction()
    .buildPipeline()
    .addSecurityLintStage({ cfnNagFailBuild: true })
    .synth();

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::CodeBuild::Project", {
    Artifacts: {
      Type: "CODEPIPELINE",
    },
    Environment: {
      ComputeType: "BUILD_GENERAL1_SMALL",
      Image: "aws/codebuild/standard:6.0",
      ImagePullCredentialsType: "CODEBUILD",
      PrivilegedMode: false,
      Type: "LINUX_CONTAINER",
      EnvironmentVariables: [
        {
          Name: "FAIL_BUILD",
          Type: "PLAINTEXT",
          Value: "true",
        },
      ],
    },
  });
  template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
    Stages: Match.arrayWith([
      Match.objectLike({
        Name: "SecurityLint",
        Actions: Match.arrayWith([
          Match.objectLike({
            Name: "Bandit",
            ActionTypeId: {
              Category: "Build",
              Provider: "CodeBuild",
            },
          }),
          Match.objectLike({
            Name: "CFNNag",
            ActionTypeId: {
              Category: "Build",
              Provider: "CodeBuild",
            },
          }),
        ]),
      }),
    ]),
  });
});

test("CICD Pipeline with Custom Stage", () => {
  const app = new cdk.App();
  const stack = new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction()
    .buildPipeline()
    .addCustomStage({
      stageName: "CustomStage",
      steps: [
        new ShellStep("foo", {
          commands: ["ls -al", "echo 'dummy'"],
        }),
        new ShellStep("bar", {
          commands: ["flake8 ."],
          installCommands: ["pip install flake8"],
        }),
      ],
    })
    .synth();

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
    Stages: Match.arrayWith([
      Match.objectLike({
        Name: "CustomStage",
        Actions: Match.arrayWith([
          Match.objectLike({
            Name: "bar",
            ActionTypeId: {
              Category: "Build",
              Provider: "CodeBuild",
            },
          }),
          Match.objectLike({
            Name: "foo",
            ActionTypeId: {
              Category: "Build",
              Provider: "CodeBuild",
            },
          }),
        ]),
      }),
    ]),
  });
});

test("CICD Pipeline with Notifications", () => {
  const app = new cdk.App();
  const stack = new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction()
    .buildPipeline()
    .addCustomStage({
      stageName: "CustomStage",
      steps: [
        new ShellStep("foo", {
          commands: ["ls -al", "echo 'dummy'"],
        }),
        new ShellStep("bar", {
          commands: ["flake8 ."],
          installCommands: ["pip install flake8"],
        }),
      ],
    })
    .synth()
    .addNotifications();

  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::SNS::Topic", 1);
  template.hasResourceProperties("AWS::SNS::TopicPolicy", {
    PolicyDocument: Match.objectLike({
      Statement: [
        {
          Action: "sns:Publish",
          Effect: "Allow",
          Principal: { Service: "codestar-notifications.amazonaws.com" },
          Resource: { Ref: "ExecutionFailedNotifications4D682D12" },
          Sid: "0",
        },
      ],
    }),
  });
});

test("Test Pipeline with Artifact Upload", () => {
  const app = new cdk.App();
  const stack = new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction()
    .buildPipeline()
    .addCustomStage({
      stageName: "PublishToCodeArtifact",
      steps: [
        CICDActions.getCodeArtifactPublishAction(
          "aws",
          app.region ?? "us-east-1",
          app.account ?? "111111111111",
          "dummy",
          "dummy",
          "dummy",
        ),
      ],
    })
    .synth()
    .addNotifications();

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
    Stages: Match.arrayWith([
      Match.objectLike({
        Name: "PublishToCodeArtifact",
        Actions: Match.arrayWith([
          Match.objectLike({
            Name: "BuildAndUploadArtifact",
            ActionTypeId: {
              Category: "Build",
              Provider: "CodeBuild",
            },
          }),
        ]),
      }),
    ]),
  });
});

test("Manual Approvals Stage", () => {
  const app = new cdk.App();
  const stage = new cdk.Stage(app, "app-stage");
  new cdk.Stack(stage, "app-stack");
  const stack = new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction()
    .buildPipeline()
    .addStage({ stageId: "dev", stage: stage, manualApprovals: true })
    .synth();
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
    Stages: Match.arrayWith([
      Match.objectLike({
        Name: "app-stage",
        Actions: Match.arrayWith([
          Match.objectLike({
            Name: "PromoteToDev",
            ActionTypeId: {
              Category: "Approval",
              Provider: "Manual",
              Owner: "AWS",
            },
          }),
        ]),
      }),
    ]),
  });
});

test("Manual Approvals Wave", () => {
  const app = new cdk.App();
  const stage = new cdk.Stage(app, "app-stage");
  new cdk.Stack(stage, "app-stack");
  const stack = new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction()
    .buildPipeline()
    .addWave({ stageId: "dev", stages: [stage], manualApprovals: true })
    .synth();
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
    Stages: Match.arrayWith([
      Match.objectLike({
        Name: "dev",
        Actions: Match.arrayWith([
          Match.objectLike({
            Name: "PromoteToDev",
            ActionTypeId: {
              Category: "Approval",
              Provider: "Manual",
              Owner: "AWS",
            },
          }),
        ]),
      }),
    ]),
  });
});

test("Pipeline With Checks", () => {
  const app = new cdk.App();
  const stage = new cdk.Stage(app, "app-stage");
  new cdk.Stack(stage, "app-stack");
  const stack = new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction()
    .buildPipeline()
    .addChecks()
    .synth();
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
    Stages: Match.arrayWith([
      Match.objectLike({
        Name: "SecurityLint",
      }),
    ]),
  });
  template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
    Stages: Match.arrayWith([
      Match.objectLike({
        Name: "Tests",
      }),
    ]),
  });
});

test("Build Pipeline with no Synth Action", () => {
  const app = new cdk.App();
  const stack = () =>
    new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
      .addSourceAction({ repositoryName: "dummy-repository" })
      .buildPipeline()
      .synth();
  expect(stack).toThrow(Error);
});

test("Build Pipeline with test stage but no Source Action", () => {
  const app = new cdk.App();
  const stack = () =>
    new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
      .addSynthAction()
      .addTestStage({})
      .buildPipeline()
      .synth();
  expect(stack).toThrow(
    Error("No cloudAssemblyFileSet configured, source action needs to be configured for this pipeline."),
  );
});

test("Build Pipeline with security lint stage but no Source Action", () => {
  const app = new cdk.App();
  const stack = () =>
    new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
      .addSynthAction()
      .addSecurityLintStage({})
      .buildPipeline()
      .synth();
  expect(stack).toThrow(Error("Source Action Must Be configured before calling this method."));
});

test("Add stage without building pipeline", () => {
  const app = new cdk.App();
  const stack = () =>
    new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
      .addSynthAction()
      .addStage({ stageId: "dev", stage: new cdk.Stage(app, "my-stack") })
      .synth();
  expect(stack).toThrow(
    Error("`.buildPipeline()` needs to be called first before adding application stages to the pipeline."),
  );
});

test("Add notifications without building pipeline", () => {
  const app = new cdk.App();
  const stack = () =>
    new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
      .addSynthAction()
      .addNotifications()
      .synth();
  expect(stack).toThrow(
    Error("`.buildPipeline()` needs to be called first before adding notifications to the pipeline."),
  );
});

test("Add notifications without building pipeline", () => {
  const app = new cdk.App();
  const stack = () =>
    new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
      .addSynthAction()
      .addStage({ stageId: "dev", stage: new cdk.Stage(app, "my-stack") })
      .synth()
      .addNotifications();
  expect(stack).toThrow(
    Error("`.buildPipeline()` needs to be called first before adding application stages to the pipeline."),
  );
});

test("CICDPipeline additional properties", () => {
  const app = new cdk.App();
  const stack = new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction({
      additionalInstallCommands: ["echo 'foobar'"],
      cdkVersion: "2.61.0",
      env: {
        "privileged": true,
      }
    })
    .buildPipeline()
    .addTestStage({
      commands: ["./my-test.sh"],
    })
    //.addStage({ stageId: 'dev', stage: new cdk.Stage(baseStack, 'my-stack')}) will add when base stack is implemented
    .synth();

  Template.fromStack(stack);
});

test("Error when running build pipeline before adding synth action", () => {
  const app = new cdk.App();
  const stack = () =>
    new CICDPipelineStack(app, "dummy-pipeline", {
      environmentId: "dev",
      pipelineName: "dummy-pipeline",
    }).buildPipeline();
  expect(stack).toThrow(Error("Pipeline cannot be built without a synth action."));
});

test("Error: Adding stages before 'buildPipeline()'", () => {
  const app = new cdk.App();
  const appStage = new cdk.Stage(app, "app", { env: { account: "000000000000" } });
  new cdk.Stack(appStage, "AppStack");

  const stack = () =>
    new CICDPipelineStack(app, "dummy-pipeline", {
      pipelineName: "dummy-pipeline",
    })
      .addSourceAction({ repositoryName: "dummy-repository" })
      .addSynthAction()
      .addStage({ stageId: "app", stage: appStage })
      .buildPipeline();
  expect(stack).toThrow(
    Error("`.buildPipeline()` needs to be called first before adding application stages to the pipeline."),
  );
});

test("Error: Adding waves before 'buildPipeline()'", () => {
  const app = new cdk.App();
  const appStage = new cdk.Stage(app, "app", { env: { account: "000000000000" } });
  new cdk.Stack(appStage, "AppStack");

  const stack = () =>
    new CICDPipelineStack(app, "dummy-pipeline", {
      pipelineName: "dummy-pipeline",
    })
      .addSourceAction({ repositoryName: "dummy-repository" })
      .addSynthAction()
      .addWave({ stageId: "app", stages: [appStage] })
      .buildPipeline();
  expect(stack).toThrow(
    Error("`.buildPipeline()` needs to be called first before adding application stages to the pipeline."),
  );
});

test("Test Pipeline with Artifact Upload", () => {
  const app = new cdk.App();
  const stack = new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction()
    .buildPipeline()
    .addCustomStage({
      stageName: "PublishToCodeArtifact",
      steps: [
        CICDActions.getCodeArtifactPublishAction(
          "aws",
          app.region ?? "us-east-1",
          app.account ?? "111111111111",
          "dummy",
          "dummy",
          "dummy",
          undefined,
          [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                "codeartifact:DescribeDomain",
                "codeartifact:GetAuthorizationToken",
                "codeartifact:ListRepositoriesInDomain",
              ],
              resources: ["arn:aws:codeartifact:us-east-1:222222222222:domain/dummy"],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["codeartifact:GetRepositoryEndpoint", "codeartifact:ReadFromRepository"],
              resources: ["arn:aws:codeartifact:us-east-1:222222222222:repository/dummy/dummy-repo"],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["sts:GetServiceBearerToken"],
              resources: ["*"],
              conditions: {
                StringEquals: {
                  "sts:AWSServiceName": "codeartifact.amazonaws.com",
                },
              },
            }),
          ],
        ),
      ],
    })
    .synth()
    .addNotifications();

  Template.fromStack(stack);
});

test("CICDPipeline with different environments", () => {
  const app = new cdk.App();

  const stageA = new cdk.Stage(app, "foo", { env: { account: "000000000000", region: "us-east-1" } });
  const stackA = new cdk.Stack(stageA, "application-stack");
  new s3.Bucket(stackA, "BucketA");

  const stageB = new cdk.Stage(app, "bar", { env: { account: "111111111111", region: "us-east-1" } });
  const stackB = new cdk.Stack(stageB, "application-stack");
  new s3.Bucket(stackB, "BucketB");

  const stack = new CICDPipelineStack(app, "dummy-pipeline", {
    env: { region: "us-east-1" },
    environmentId: "dev",
    pipelineName: "dummy-pipeline",
  })
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction()
    .buildPipeline()
    .addStage({ stageId: "a", stage: stageA })
    .addStage({ stageId: "b", stage: stageB })
    .synth();

  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::CodePipeline::Pipeline", 1);
});
