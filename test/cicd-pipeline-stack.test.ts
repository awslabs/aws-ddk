import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as iam from "aws-cdk-lib/aws-iam";
import path from "path";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import { ShellStep } from "aws-cdk-lib/pipelines";
import { CICDPipelineStack, DataPipeline, FirehoseToS3Stage, getCodeArtifactPublishAction, SqsToLambdaStage } from "../src";

test("Basic CICDPipeline", () => {
  const app = new cdk.App();
  const appStack = new cdk.Stack(app, "application-stack");
  const bucket = new s3.Bucket(appStack, "Bucket");

  const firehoseToS3Stage = new FirehoseToS3Stage(appStack, "Firehose To S3 Stage", { s3Bucket: bucket });

  const sqsToLambdaStage = new SqsToLambdaStage(appStack, "SQS To Lambda Stage 2", {
    lambdaFunctionProps: {
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      memorySize: cdk.Size.mebibytes(512),
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(appStack, "Layer", "arn:aws:lambda:us-east-1:222222222222:layer:dummy:1"),
      ],
    },
  });

  const pipeline = new DataPipeline(appStack, "Pipeline", {});

  pipeline.addStage({ stage: firehoseToS3Stage }).addStage({ stage: sqsToLambdaStage });

  const stack = new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction()
    .buildPipeline()
    .addStage({ stageId: 'dev', stage: new cdk.Stage(appStack, 'my-data-pipeline')})
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
        Name: 'dev',
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
        getCodeArtifactPublishAction(
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

test("Test Pipeline with Artifact Upload", () => {
  const app = new cdk.App();
  const stack = new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction()
    .buildPipeline()
    .addCustomStage({
      stageName: "PublishToCodeArtifact",
      steps: [
        getCodeArtifactPublishAction(
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
