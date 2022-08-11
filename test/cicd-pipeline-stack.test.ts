import * as cdk from 'aws-cdk-lib';
import { /*Match,*/ Template } from 'aws-cdk-lib/assertions';
//import { ShellStep } from 'aws-cdk-lib/pipelines';
//import { Construct } from 'constructs';
import { CICDPipelineStack/*, getCodeartifactPublishAction*/ } from '../src';

test('Basic CICDPipeline', () => {
  const stack = new cdk.Stack();
  const pipeline = new CICDPipelineStack(
    stack,
    'dummy-pipeline',
    'dev',
    'dummy-pipeline',
    {},
  )
    .addSourceAction({ repositoryName: 'dummy-repository' })
    .addSynthAction({})
    .buildPipeline()
    .synth();

  console.log(pipeline)
  const template = Template.fromStack(stack);
  console.log(template.toJSON())
  template.resourceCountIs('AWS::CodePipeline::Pipeline', 1);
  // template.hasResourceProperties('AWS::Events::Rule', {
  //   State: 'ENABLED',
  //   EventPattern: Match.objectLike({
  //     'detail-type': stage1.eventPattern?.detailType,
  //     'source': stage1.eventPattern?.source,
  //   }),
  //   Targets: Match.arrayEquals([
  //     Match.objectLike({
  //       Arn: {
  //         'Fn::GetAtt': [
  //           stack.resolve((stage2.queue.node.defaultChild as cdk.CfnElement).logicalId),
  //           'Arn',
  //         ],
  //       },
  //     }),
  //   ]),
  // });
});

//     template.has_resource_properties(
//         "AWS::CodePipeline::Pipeline",
//         props={
//             "Stages": Match.array_with(
//                 pattern=[
//                     Match.object_like(
//                         pattern={
//                             "Name": "Source",
//                             "Actions": Match.array_with(
//                                 pattern=[
//                                     Match.object_like(
//                                         pattern={
//                                             "Name": "dummy-repository",
//                                             "ActionTypeId": {
//                                                 "Category": "Source",
//                                                 "Provider": "CodeCommit",
//                                             },
//                                             "Configuration": {
//                                                 "RepositoryName": "dummy-repository",
//                                                 "BranchName": "main",
//                                             },
//                                         },
//                                     ),
//                                 ],
//                             ),
//                         },
//                     ),
//                     Match.object_like(
//                         pattern={
//                             "Name": "Build",
//                             "Actions": Match.array_with(
//                                 pattern=[
//                                     Match.object_like(
//                                         pattern={
//                                             "Name": "Synth",
//                                             "ActionTypeId": {
//                                                 "Category": "Build",
//                                                 "Provider": "CodeBuild",
//                                             },
//                                         },
//                                     ),
//                                 ],
//                             ),
//                         },
//                     ),
//                     Match.object_like(
//                         pattern={
//                             "Name": "UpdatePipeline",
//                             "Actions": Match.array_with(
//                                 pattern=[
//                                     Match.object_like(
//                                         pattern={
//                                             "Name": "SelfMutate",
//                                             "ActionTypeId": {
//                                                 "Category": "Build",
//                                                 "Provider": "CodeBuild",
//                                             },
//                                         },
//                                     ),
//                                 ],
//                             ),
//                         },
//                     ),
//                     Match.object_like(
//                         pattern={
//                             "Name": "dev",
//                         },
//                     ),
//                 ],
//             ),
//         },
//     )

//     # Check if all IAM roles have permissions boundary attached
//     template.has_resource_properties(
//         "AWS::IAM::Role",
//         props={
//             "AssumeRolePolicyDocument": Match.object_like(
//                 pattern={
//                     "Statement": [
//                         {
//                             "Action": "sts:AssumeRole",
//                             "Effect": "Allow",
//                             "Principal": {
//                                 "Service": "codepipeline.amazonaws.com",
//                             },
//                         },
//                     ],
//                 },
//             ),
//             "PermissionsBoundary": Match.object_like(
//                 pattern={
//                     "Fn::Join": [
//                         "",
//                         [
//                             "arn:",
//                             {"Ref": "AWS::Partition"},
//                             ":iam::111111111111:policy/ddk-dev-hnb659fds-permissions-boundary-111111111111-us-east-1",  # noqa
//                         ],
//                     ],
//                 }
//             ),
//         },
//     )
//     template.has_resource_properties(
//         "AWS::IAM::Role",
//         props={
//             "AssumeRolePolicyDocument": Match.object_like(
//                 pattern={
//                     "Statement": [
//                         {
//                             "Action": "sts:AssumeRole",
//                             "Effect": "Allow",
//                             "Principal": {
//                                 "Service": "codebuild.amazonaws.com",
//                             },
//                         },
//                     ],
//                 },
//             ),
//             "PermissionsBoundary": Match.object_like(
//                 pattern={
//                     "Fn::Join": [
//                         "",
//                         [
//                             "arn:",
//                             {"Ref": "AWS::Partition"},
//                             ":iam::111111111111:policy/ddk-dev-hnb659fds-permissions-boundary-111111111111-us-east-1",  # noqa
//                         ],
//                     ],
//                 }
//             ),
//         },
//     )

// def test_cicd_pipeline_security_checks(cdk_app: App) -> None:
//     pipeline_stack = (
//         CICDPipelineStack(
//             cdk_app,
//             id="dummy-pipeline",
//             environment_id="dev",
//             pipeline_name="dummy-pipeline",
//         )
//         .add_source_action(repository_name="dummy-repository")
//         .add_synth_action()
//         .build()
//         .add_security_lint_stage()
//         .add_test_stage()
//         .add_stage("dev", DevStage(cdk_app, "dev"))
//         .synth()
//     )
//     template = Template.from_stack(pipeline_stack)
//     # Check if synthesized pipeline contains source, synth, self-update, and app stage
//     template.has_resource_properties(
//         "AWS::CodePipeline::Pipeline",
//         props={
//             "Stages": Match.array_with(
//                 pattern=[
//                     Match.object_like(
//                         pattern={
//                             "Name": "SecurityLint",
//                             "Actions": Match.array_with(
//                                 pattern=[
//                                     Match.object_like(
//                                         pattern={
//                                             "Name": "Bandit",
//                                             "ActionTypeId": {
//                                                 "Category": "Build",
//                                                 "Provider": "CodeBuild",
//                                             },
//                                         },
//                                     ),
//                                     Match.object_like(
//                                         pattern={
//                                             "Name": "CFNNag",
//                                             "ActionTypeId": {
//                                                 "Category": "Build",
//                                                 "Provider": "CodeBuild",
//                                             },
//                                         },
//                                     ),
//                                 ],
//                             ),
//                         },
//                     ),
//                     Match.object_like(
//                         pattern={
//                             "Name": "Tests",
//                             "Actions": Match.array_with(
//                                 pattern=[
//                                     Match.object_like(
//                                         pattern={
//                                             "Name": "Tests",
//                                             "ActionTypeId": {
//                                                 "Category": "Build",
//                                                 "Provider": "CodeBuild",
//                                             },
//                                         },
//                                     ),
//                                 ],
//                             ),
//                         },
//                     ),
//                 ],
//             ),
//         },
//     )

// def test_cicd_pipeline_custom_stage(cdk_app: App) -> None:
//     pipeline_stack = (
//         CICDPipelineStack(
//             cdk_app,
//             id="dummy-pipeline",
//             environment_id="dev",
//             pipeline_name="dummy-pipeline",
//         )
//         .add_source_action(repository_name="dummy-repository")
//         .add_synth_action()
//         .build()
//         .add_custom_stage(
//             "CustomStage",
//             [
//                 ShellStep(
//                     "foo",
//                     commands=["ls -al", "echo 'dummy'"],
//                 ),
//                 ShellStep("bar", commands=["flake8 ."], install_commands=["pip install flake8"]),
//             ],
//         )
//         .add_stage("dev", DevStage(cdk_app, "dev"))
//         .synth()
//     )
//     template = Template.from_stack(pipeline_stack)
//     # Check if synthesized pipeline contains source, synth, self-update, and app stage
//     template.has_resource_properties(
//         "AWS::CodePipeline::Pipeline",
//         props={
//             "Stages": Match.array_with(
//                 pattern=[
//                     Match.object_like(
//                         pattern={
//                             "Name": "CustomStage",
//                             "Actions": Match.array_with(
//                                 pattern=[
//                                     Match.object_like(
//                                         pattern={
//                                             "Name": "bar",
//                                             "ActionTypeId": {
//                                                 "Category": "Build",
//                                                 "Provider": "CodeBuild",
//                                             },
//                                         },
//                                     ),
//                                     Match.object_like(
//                                         pattern={
//                                             "Name": "foo",
//                                             "ActionTypeId": {
//                                                 "Category": "Build",
//                                                 "Provider": "CodeBuild",
//                                             },
//                                         },
//                                     ),
//                                 ],
//                             ),
//                         },
//                     ),
//                 ],
//             ),
//         },
//     )

// def test_cicd_pipeline_notifications(cdk_app: App) -> None:
//     pipeline_stack = (
//         CICDPipelineStack(
//             cdk_app,
//             id="dummy-pipeline",
//             environment_id="dev",
//             pipeline_name="dummy-pipeline",
//         )
//         .add_source_action(repository_name="dummy-repository")
//         .add_synth_action()
//         .build()
//         .add_stage("dev", DevStage(cdk_app, "dev"))
//         .synth()
//         .add_notifications()
//     )
//     template = Template.from_stack(pipeline_stack)

//     # Check if SNS Topic for notifications exists
//     template.has_resource_properties(
//         "AWS::SNS::Topic",
//         props={
//             "TopicName": Match.exact(pattern="dummy-pipeline-dev-notifications"),
//         },
//     )
//     # Check if SNS Topic policy is in place
//     template.has_resource_properties(
//         "AWS::SNS::TopicPolicy",
//         props={
//             "PolicyDocument": Match.object_like(
//                 pattern={
//                     "Statement": [
//                         {
//                             "Action": "sns:Publish",
//                             "Effect": "Allow",
//                             "Principal": {"Service": "codestar-notifications.amazonaws.com"},
//                             "Resource": {"Ref": "dummypipelinedevnotificationsE4CDC252"},
//                             "Sid": "0",
//                         },
//                     ],
//                 }
//             )
//         },
//     )

// def test_cicd_pipeline_codeartifact_upload(cdk_app: App) -> None:
//     pipeline_stack = (
//         CICDPipelineStack(
//             cdk_app,
//             id="dummy-pipeline",
//             environment_id="dev",
//             pipeline_name="dummy-pipeline",
//         )
//         .add_source_action(repository_name="dummy-repository")
//         .add_synth_action()
//         .build()
//         .add_custom_stage(
//             stage_name="PublishToCodeArtifact",
//             steps=[
//                 get_codeartifact_publish_action(
//                     partition="aws",
//                     region=cdk_app.region,
//                     account=cdk_app.account,
//                     codeartifact_repository="dummy",
//                     codeartifact_domain="dummy",
//                     codeartifact_domain_owner="dummy",
//                 ),
//             ],
//         )
//         .synth()
//     )
//     template = Template.from_stack(pipeline_stack)
//     # Check if synthesized pipeline contains stage with CodeArtifact upload action
//     template.has_resource_properties(
//         "AWS::CodePipeline::Pipeline",
//         props={
//             "Stages": Match.array_with(
//                 pattern=[
//                     Match.object_like(
//                         pattern={
//                             "Name": "PublishToCodeArtifact",
//                             "Actions": Match.array_with(
//                                 pattern=[
//                                     Match.object_like(
//                                         pattern={
//                                             "Name": "BuildAndUploadArtifact",
//                                             "ActionTypeId": {
//                                                 "Category": "Build",
//                                                 "Provider": "CodeBuild",
//                                             },
//                                         },
//                                     ),
//                                 ],
//                             ),
//                         },
//                     ),
//                 ],
//             ),
//         },
//     )
