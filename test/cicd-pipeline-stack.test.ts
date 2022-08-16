import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { ShellStep } from 'aws-cdk-lib/pipelines';
import { CICDPipelineStack, getCodeArtifactPublishAction } from '../src';

test('Basic CICDPipeline', () => {
  const app = new cdk.App();
  //const baseStack = new cdk.Stack(app, "my-base-stack"); will add when base stack is implemented
  const stack = new CICDPipelineStack(
    app,
    'dummy-pipeline',
    'dev',
    'dummy-pipeline',
    {},
  )
    .addSourceAction({ repositoryName: 'dummy-repository' })
    .addSynthAction({})
    .buildPipeline()
    //.addStage({ stageId: 'dev', stage: new cdk.Stage(baseStack, 'my-stack')}) will add when base stack is implemented
    .synth();

  const template = Template.fromStack(stack);
  console.log(template.toJSON());
  template.resourceCountIs('AWS::CodePipeline::Pipeline', 1);
  template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
    Stages: Match.arrayWith([
      Match.objectLike({
        Name: 'Source',
        Actions: Match.arrayWith([
          Match.objectLike({
            Name: 'dummy-repository',
            ActionTypeId: {
              Category: 'Source',
              Provider: 'CodeCommit',
            },
            Configuration: {
              RepositoryName: 'dummy-repository',
              BranchName: 'main',
            },
          }),
        ]),
      }),
      Match.objectLike({
        Name: 'Build',
        Actions: Match.arrayWith([
          Match.objectLike({
            Name: 'Synth',
            ActionTypeId: {
              Category: 'Build',
              Provider: 'CodeBuild',
            },
          }),
        ]),
      }),
      Match.objectLike({
        Name: 'UpdatePipeline',
        Actions: Match.arrayWith([
          Match.objectLike({
            Name: 'SelfMutate',
            ActionTypeId: {
              Category: 'Build',
              Provider: 'CodeBuild',
            },
          }),
        ]),
      }),
      // Match.objectLike({
      //   Name: 'dev',
      // }),
    ]),
  });
  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: Match.objectLike({
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'codepipeline.amazonaws.com',
          },
        },
      ],
    }),
  });
});

test('CICD Pipeline with Security Checks', () => {
  const app = new cdk.App();
  const stack = new CICDPipelineStack(
    app,
    'dummy-pipeline',
    'dev',
    'dummy-pipeline',
    {},
  )
    .addSourceAction({ repositoryName: 'dummy-repository' })
    .addSynthAction({})
    .buildPipeline()
    .addSecurityLintStage({})
    .addTestStage({})
    .synth();

  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
    Stages: Match.arrayWith([
      Match.objectLike({
        Name: 'SecurityLint',
        Actions: Match.arrayWith([
          Match.objectLike({
            Name: 'Bandit',
            ActionTypeId: {
              Category: 'Build',
              Provider: 'CodeBuild',
            },
          }),
          Match.objectLike({
            Name: 'CFNNag',
            ActionTypeId: {
              Category: 'Build',
              Provider: 'CodeBuild',
            },
          }),
        ]),
      }),
      Match.objectLike({
        Name: 'Tests',
        Actions: Match.arrayWith([
          Match.objectLike({
            Name: 'Tests',
            ActionTypeId: {
              Category: 'Build',
              Provider: 'CodeBuild',
            },
          }),
        ]),
      }),
    ]),
  });
});

test('CICD Pipeline with Custom Stage', () => {
  const app = new cdk.App();
  const stack = new CICDPipelineStack(
    app,
    'dummy-pipeline',
    'dev',
    'dummy-pipeline',
    {},
  )
    .addSourceAction({ repositoryName: 'dummy-repository' })
    .addSynthAction({})
    .buildPipeline()
    .addCustomStage({
      stageName: 'CustomStage',
      steps: [
        new ShellStep('foo', {
          commands: ['ls -al', "echo 'dummy'"],
        }),
        new ShellStep('bar', {
          commands: ['flake8 .'],
          installCommands: ['pip install flake8'],
        }),
      ],
    })
    .synth();

  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
    Stages: Match.arrayWith([
      Match.objectLike({
        Name: 'CustomStage',
        Actions: Match.arrayWith([
          Match.objectLike({
            Name: 'bar',
            ActionTypeId: {
              Category: 'Build',
              Provider: 'CodeBuild',
            },
          }),
          Match.objectLike({
            Name: 'foo',
            ActionTypeId: {
              Category: 'Build',
              Provider: 'CodeBuild',
            },
          }),
        ]),
      }),
    ]),
  });
});

test('CICD Pipeline with Notifications', () => {
  const app = new cdk.App();
  const stack = new CICDPipelineStack(
    app,
    'dummy-pipeline',
    'dev',
    'dummy-pipeline',
    {},
  )
    .addSourceAction({ repositoryName: 'dummy-repository' })
    .addSynthAction({})
    .buildPipeline()
    .addCustomStage({
      stageName: 'CustomStage',
      steps: [
        new ShellStep('foo', {
          commands: ['ls -al', "echo 'dummy'"],
        }),
        new ShellStep('bar', {
          commands: ['flake8 .'],
          installCommands: ['pip install flake8'],
        }),
      ],
    })
    .synth()
    .addNotifications({});

  const template = Template.fromStack(stack);
  console.log(template.toJSON());
  template.resourceCountIs('AWS::SNS::Topic', 1);
  template.hasResourceProperties('AWS::SNS::TopicPolicy', {
    PolicyDocument: Match.objectLike({
      Statement: [
        {
          Action: 'sns:Publish',
          Effect: 'Allow',
          Principal: { Service: 'codestar-notifications.amazonaws.com' },
          Resource: { Ref: 'ExecutionFailedNotifications4D682D12' },
          Sid: '0',
        },
      ],
    }),
  });
});

test('Test Pipeline with Artifact Upload', () => {
  const app = new cdk.App();
  const stack = new CICDPipelineStack(
    app,
    'dummy-pipeline',
    'dev',
    'dummy-pipeline',
    {},
  )
    .addSourceAction({ repositoryName: 'dummy-repository' })
    .addSynthAction({})
    .buildPipeline()
    .addCustomStage({
      stageName: 'PublishToCodeArtifact',
      steps: [
        getCodeArtifactPublishAction(
          'aws',
          app.region ?? 'us-east-1',
          app.account ?? '111111111111',
          'dummy',
          'dummy',
          'dummy',
        ),
      ],
    })
    .synth()
    .addNotifications({});

  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
    Stages: Match.arrayWith([
      Match.objectLike({
        Name: 'PublishToCodeArtifact',
        Actions: Match.arrayWith([
          Match.objectLike({
            Name: 'BuildAndUploadArtifact',
            ActionTypeId: {
              Category: 'Build',
              Provider: 'CodeBuild',
            },
          }),
        ]),
      }),
    ]),
  });
});

test('Build Pipeline with no Synth Action', () => {
  const app = new cdk.App();
  const stack = () =>
    new CICDPipelineStack(app, 'dummy-pipeline', 'dev', 'dummy-pipeline', {})
      .addSourceAction({ repositoryName: 'dummy-repository' })
      .buildPipeline()
      .synth();
  expect(stack).toThrow(Error);
});

test('Build Pipeline with test stage but no Source Action', () => {
  const app = new cdk.App();
  const stack = () =>
    new CICDPipelineStack(app, 'dummy-pipeline', 'dev', 'dummy-pipeline', {})
      .addSynthAction({})
      .addTestStage({})
      .buildPipeline()
      .synth();
  expect(stack).toThrow(Error('No cloudAssemblyFileSet configured, source action needs to be configured for this pipeline.'));
});

test('Build Pipeline with security lint stage but no Source Action', () => {
  const app = new cdk.App();
  const stack = () =>
    new CICDPipelineStack(app, 'dummy-pipeline', 'dev', 'dummy-pipeline', {})
      .addSynthAction({})
      .addSecurityLintStage({})
      .buildPipeline()
      .synth();
  expect(stack).toThrow(Error('Source Action Must Be configured before calling this method.'));
});

test('Add stage without building pipeline', () => {
  const app = new cdk.App();
  const stack = () =>
    new CICDPipelineStack(app, 'dummy-pipeline', 'dev', 'dummy-pipeline', {})
      .addSynthAction({})
      .addStage({ stageId: 'dev', stage: new cdk.Stage(app, 'my-stack') })
      .synth();
  expect(stack).toThrow(Error('`.buildPipeline()` needs to be called first before adding application stages to the pipeline.'));
});
