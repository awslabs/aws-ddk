import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
//import { ShellStep } from 'aws-cdk-lib/pipelines';
//import { Construct } from 'constructs';
import { ShellStep } from "aws-cdk-lib/pipelines";
import {
  CICDPipelineStack /*, getCodeartifactPublishAction*/,
  getCodeartifactPublishAction,
  toTitleCase,
} from "../src";

test("Basic CICDPipeline", () => {
  const app = new cdk.App();
  const stack = new CICDPipelineStack(
    app,
    "dummy-pipeline",
    "dev",
    "dummy-pipeline",
    {}
  )
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction({})
    .buildPipeline()
    .synth();

  const template = Template.fromStack(stack);
  console.log(template.toJSON());
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
});

test("CICD Pipeline with Security Checks", () => {
  const app = new cdk.App();
  const stack = new CICDPipelineStack(
    app,
    "dummy-pipeline",
    "dev",
    "dummy-pipeline",
    {}
  )
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction({})
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
  const stack = new CICDPipelineStack(
    app,
    "dummy-pipeline",
    "dev",
    "dummy-pipeline",
    {}
  )
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction({})
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
  const stack = new CICDPipelineStack(
    app,
    "dummy-pipeline",
    "dev",
    "dummy-pipeline",
    {}
  )
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction({})
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
    .addNotifications({});

  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::SNS::Topic", {
    TopicName: Match.exact("dummy-pipeline-dev-notifications"),
  });
  template.hasResourceProperties("AWS::SNS::TopicPolicy", {
    PolicyDocument: Match.objectLike({
      Statement: [
        {
          Action: "sns:Publish",
          Effect: "Allow",
          Principal: { Service: "codestar-notifications.amazonaws.com" },
          Resource: { Ref: "dummypipelinedevnotificationsE4CDC252" },
          Sid: "0",
        },
      ],
    }),
  });
});

test("Test Pipeline with Artifact Upload", () => {
  const app = new cdk.App();
  const stack = new CICDPipelineStack(
    app,
    "dummy-pipeline",
    "dev",
    "dummy-pipeline",
    {}
  )
    .addSourceAction({ repositoryName: "dummy-repository" })
    .addSynthAction({})
    .buildPipeline()
    .addCustomStage({
      stageName: "PublishToCodeArtifact",
      steps: [
        getCodeartifactPublishAction({
          partition: "aws",
          region: app.region!,
          account: app.account!,
          codeartifactRepository: "dummy",
          codeartifactDomain: "dummy",
          codeartifactDomainOwner: "dummy",
        }),
      ],
    })
    .synth()
    .addNotifications({});

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
