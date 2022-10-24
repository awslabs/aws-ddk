# Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License").
# You may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from typing import Any

from aws_cdk import App, Stage
from aws_cdk.assertions import Match, Template
from aws_cdk.pipelines import ShellStep
from aws_ddk_core.base import BaseStack
from aws_ddk_core.cicd import CICDPipelineStack, get_codeartifact_publish_action
from constructs import Construct


class DevStage(Stage):
    def __init__(
        self,
        scope: Construct,
        stage_id: str,
        **kwargs: Any,
    ) -> None:
        super().__init__(scope, stage_id, **kwargs)
        DevStack(self, "my-stack")


class DevStack(BaseStack):
    def __init__(self, scope: Construct, id: str, **kwargs: Any) -> None:
        super().__init__(scope, id=id, environment_id="dev", **kwargs)
        pass


def test_cicd_pipeline_simple(cdk_app: App) -> None:
    pipeline_stack = (
        CICDPipelineStack(
            cdk_app,
            id="dummy-pipeline",
            environment_id="dev",
            pipeline_name="dummy-pipeline",
        )
        .add_source_action(repository_name="dummy-repository")
        .add_synth_action()
        .build()
        .add_stage("dev", DevStage(cdk_app, "dev"))
        .synth()
    )
    template = Template.from_stack(pipeline_stack)
    # Check if synthesized pipeline contains source, synth, self-update, and app stage
    template.has_resource_properties(
        "AWS::CodePipeline::Pipeline",
        props={
            "Name": "dummy-pipeline",
            "Stages": Match.array_with(
                pattern=[
                    Match.object_like(
                        pattern={
                            "Name": "Source",
                            "Actions": Match.array_with(
                                pattern=[
                                    Match.object_like(
                                        pattern={
                                            "Name": "dummy-repository",
                                            "ActionTypeId": {
                                                "Category": "Source",
                                                "Provider": "CodeCommit",
                                            },
                                            "Configuration": {
                                                "RepositoryName": "dummy-repository",
                                                "BranchName": "main",
                                            },
                                        },
                                    ),
                                ],
                            ),
                        },
                    ),
                    Match.object_like(
                        pattern={
                            "Name": "Build",
                            "Actions": Match.array_with(
                                pattern=[
                                    Match.object_like(
                                        pattern={
                                            "Name": "Synth",
                                            "ActionTypeId": {
                                                "Category": "Build",
                                                "Provider": "CodeBuild",
                                            },
                                        },
                                    ),
                                ],
                            ),
                        },
                    ),
                    Match.object_like(
                        pattern={
                            "Name": "UpdatePipeline",
                            "Actions": Match.array_with(
                                pattern=[
                                    Match.object_like(
                                        pattern={
                                            "Name": "SelfMutate",
                                            "ActionTypeId": {
                                                "Category": "Build",
                                                "Provider": "CodeBuild",
                                            },
                                        },
                                    ),
                                ],
                            ),
                        },
                    ),
                    Match.object_like(
                        pattern={
                            "Name": "dev",
                        },
                    ),
                ],
            ),
        },
    )
    # Check if pipeline bucket is KMS-encrypted and blocks public access
    template.has_resource_properties(
        "AWS::S3::Bucket",
        props={
            "PublicAccessBlockConfiguration": {
                "BlockPublicAcls": True,
                "BlockPublicPolicy": True,
                "IgnorePublicAcls": True,
                "RestrictPublicBuckets": True,
            },
            "BucketEncryption": {
                "ServerSideEncryptionConfiguration": Match.array_with(
                    pattern=[
                        Match.object_like(
                            pattern={
                                "ServerSideEncryptionByDefault": {
                                    "SSEAlgorithm": "aws:kms",
                                },
                            },
                        ),
                    ],
                ),
            },
        },
    )
    # Check if KMS keys are rotated
    template.has_resource_properties(
        "AWS::KMS::Key",
        props={
            "EnableKeyRotation": True,
        },
    )
    # Check if all IAM roles have permissions boundary attached
    template.has_resource_properties(
        "AWS::IAM::Role",
        props={
            "AssumeRolePolicyDocument": Match.object_like(
                pattern={
                    "Statement": [
                        {
                            "Action": "sts:AssumeRole",
                            "Effect": "Allow",
                            "Principal": {
                                "Service": "codepipeline.amazonaws.com",
                            },
                        },
                    ],
                },
            ),
            "PermissionsBoundary": Match.object_like(
                pattern={
                    "Fn::Join": [
                        "",
                        [
                            "arn:",
                            {"Ref": "AWS::Partition"},
                            ":iam::111111111111:policy/ddk-dev-hnb659fds-permissions-boundary-111111111111-us-east-1",  # noqa
                        ],
                    ],
                }
            ),
        },
    )
    template.has_resource_properties(
        "AWS::IAM::Role",
        props={
            "AssumeRolePolicyDocument": Match.object_like(
                pattern={
                    "Statement": [
                        {
                            "Action": "sts:AssumeRole",
                            "Effect": "Allow",
                            "Principal": {
                                "Service": "codebuild.amazonaws.com",
                            },
                        },
                    ],
                },
            ),
            "PermissionsBoundary": Match.object_like(
                pattern={
                    "Fn::Join": [
                        "",
                        [
                            "arn:",
                            {"Ref": "AWS::Partition"},
                            ":iam::111111111111:policy/ddk-dev-hnb659fds-permissions-boundary-111111111111-us-east-1",  # noqa
                        ],
                    ],
                }
            ),
        },
    )


def test_cicd_pipeline_security_checks(cdk_app: App) -> None:
    pipeline_stack = (
        CICDPipelineStack(
            cdk_app,
            id="dummy-pipeline",
            environment_id="dev",
            pipeline_name="dummy-pipeline",
        )
        .add_source_action(repository_name="dummy-repository")
        .add_synth_action()
        .build()
        .add_security_lint_stage()
        .add_test_stage()
        .add_stage("dev", DevStage(cdk_app, "dev"))
        .synth()
    )
    template = Template.from_stack(pipeline_stack)
    # Check if synthesized pipeline contains source, synth, self-update, and app stage
    template.has_resource_properties(
        "AWS::CodePipeline::Pipeline",
        props={
            "Stages": Match.array_with(
                pattern=[
                    Match.object_like(
                        pattern={
                            "Name": "SecurityLint",
                            "Actions": Match.array_with(
                                pattern=[
                                    Match.object_like(
                                        pattern={
                                            "Name": "Bandit",
                                            "ActionTypeId": {
                                                "Category": "Build",
                                                "Provider": "CodeBuild",
                                            },
                                        },
                                    ),
                                    Match.object_like(
                                        pattern={
                                            "Name": "CFNNag",
                                            "ActionTypeId": {
                                                "Category": "Build",
                                                "Provider": "CodeBuild",
                                            },
                                        },
                                    ),
                                ],
                            ),
                        },
                    ),
                    Match.object_like(
                        pattern={
                            "Name": "Tests",
                            "Actions": Match.array_with(
                                pattern=[
                                    Match.object_like(
                                        pattern={
                                            "Name": "Tests",
                                            "ActionTypeId": {
                                                "Category": "Build",
                                                "Provider": "CodeBuild",
                                            },
                                        },
                                    ),
                                ],
                            ),
                        },
                    ),
                ],
            ),
        },
    )


def test_cicd_pipeline_custom_stage(cdk_app: App) -> None:
    pipeline_stack = (
        CICDPipelineStack(
            cdk_app,
            id="dummy-pipeline",
            environment_id="dev",
            pipeline_name="dummy-pipeline",
        )
        .add_source_action(repository_name="dummy-repository")
        .add_synth_action()
        .build()
        .add_custom_stage(
            "CustomStage",
            [
                ShellStep(
                    "foo",
                    commands=["ls -al", "echo 'dummy'"],
                ),
                ShellStep(
                    "bar",
                    commands=["flake8 ."],
                    install_commands=["pip install flake8"],
                ),
            ],
        )
        .add_stage("dev", DevStage(cdk_app, "dev"))
        .synth()
    )
    template = Template.from_stack(pipeline_stack)
    # Check if synthesized pipeline contains source, synth, self-update, and app stage
    template.has_resource_properties(
        "AWS::CodePipeline::Pipeline",
        props={
            "Stages": Match.array_with(
                pattern=[
                    Match.object_like(
                        pattern={
                            "Name": "CustomStage",
                            "Actions": Match.array_with(
                                pattern=[
                                    Match.object_like(
                                        pattern={
                                            "Name": "bar",
                                            "ActionTypeId": {
                                                "Category": "Build",
                                                "Provider": "CodeBuild",
                                            },
                                        },
                                    ),
                                    Match.object_like(
                                        pattern={
                                            "Name": "foo",
                                            "ActionTypeId": {
                                                "Category": "Build",
                                                "Provider": "CodeBuild",
                                            },
                                        },
                                    ),
                                ],
                            ),
                        },
                    ),
                ],
            ),
        },
    )


def test_cicd_pipeline_notifications(cdk_app: App) -> None:
    pipeline_stack = (
        CICDPipelineStack(
            cdk_app,
            id="dummy-pipeline",
            environment_id="dev",
            pipeline_name="dummy-pipeline",
        )
        .add_source_action(repository_name="dummy-repository")
        .add_synth_action()
        .build()
        .add_stage("dev", DevStage(cdk_app, "dev"))
        .synth()
        .add_notifications()
    )
    template = Template.from_stack(pipeline_stack)

    # Check if SNS Topic for notifications exists
    template.has_resource_properties(
        "AWS::SNS::Topic",
        props={
            "TopicName": Match.exact(pattern="dummy-pipeline-dev-notifications"),
        },
    )
    # Check if SNS Topic policy is in place
    template.has_resource_properties(
        "AWS::SNS::TopicPolicy",
        props={
            "PolicyDocument": Match.object_like(
                pattern={
                    "Statement": [
                        {
                            "Action": "sns:Publish",
                            "Effect": "Allow",
                            "Principal": {"Service": "codestar-notifications.amazonaws.com"},
                            "Resource": {"Ref": "dummypipelinedevnotificationsE4CDC252"},
                            "Sid": "0",
                        },
                    ],
                }
            )
        },
    )


def test_cicd_pipeline_codeartifact_upload(cdk_app: App) -> None:
    pipeline_stack = (
        CICDPipelineStack(
            cdk_app,
            id="dummy-pipeline",
            environment_id="dev",
            pipeline_name="dummy-pipeline",
        )
        .add_source_action(repository_name="dummy-repository")
        .add_synth_action()
        .build()
        .add_custom_stage(
            stage_name="PublishToCodeArtifact",
            steps=[
                get_codeartifact_publish_action(
                    partition="aws",
                    region=cdk_app.region,
                    account=cdk_app.account,
                    codeartifact_repository="dummy",
                    codeartifact_domain="dummy",
                    codeartifact_domain_owner="dummy",
                ),
            ],
        )
        .synth()
    )
    template = Template.from_stack(pipeline_stack)
    # Check if synthesized pipeline contains stage with CodeArtifact upload action
    template.has_resource_properties(
        "AWS::CodePipeline::Pipeline",
        props={
            "Stages": Match.array_with(
                pattern=[
                    Match.object_like(
                        pattern={
                            "Name": "PublishToCodeArtifact",
                            "Actions": Match.array_with(
                                pattern=[
                                    Match.object_like(
                                        pattern={
                                            "Name": "BuildAndUploadArtifact",
                                            "ActionTypeId": {
                                                "Category": "Build",
                                                "Provider": "CodeBuild",
                                            },
                                        },
                                    ),
                                ],
                            ),
                        },
                    ),
                ],
            ),
        },
    )


def test_cicd_pipeline_with_wave(cdk_app: App) -> None:
    pipeline_stack = (
        CICDPipelineStack(
            cdk_app,
            id="dummy-pipeline",
            environment_id="dev",
            pipeline_name="dummy-pipeline",
        )
        .add_source_action(repository_name="dummy-repository")
        .add_synth_action()
        .build()
        .add_wave("dev", [DevStage(cdk_app, "dummy-0"), DevStage(cdk_app, "dummy-1")])
        .synth()
    )
    template = Template.from_stack(pipeline_stack)
    # Check if synthesized pipeline contains source, synth, self-update, and app stage
    template.has_resource_properties(
        "AWS::CodePipeline::Pipeline",
        props={
            "Name": "dummy-pipeline",
            "Stages": Match.array_with(
                pattern=[
                    Match.object_like(
                        pattern={
                            "Name": "Source",
                            "Actions": Match.array_with(
                                pattern=[
                                    Match.object_like(
                                        pattern={
                                            "Name": "dummy-repository",
                                            "ActionTypeId": {
                                                "Category": "Source",
                                                "Provider": "CodeCommit",
                                            },
                                            "Configuration": {
                                                "RepositoryName": "dummy-repository",
                                                "BranchName": "main",
                                            },
                                        },
                                    ),
                                ],
                            ),
                        },
                    ),
                    Match.object_like(
                        pattern={
                            "Name": "Build",
                            "Actions": Match.array_with(
                                pattern=[
                                    Match.object_like(
                                        pattern={
                                            "Name": "Synth",
                                            "ActionTypeId": {
                                                "Category": "Build",
                                                "Provider": "CodeBuild",
                                            },
                                        },
                                    ),
                                ],
                            ),
                        },
                    ),
                    Match.object_like(
                        pattern={
                            "Name": "UpdatePipeline",
                            "Actions": Match.array_with(
                                pattern=[
                                    Match.object_like(
                                        pattern={
                                            "Name": "SelfMutate",
                                            "ActionTypeId": {
                                                "Category": "Build",
                                                "Provider": "CodeBuild",
                                            },
                                        },
                                    ),
                                ],
                            ),
                        },
                    ),
                    Match.object_like(
                        pattern={
                            "Name": "dev",
                            "Actions": [
                                {
                                    "ActionTypeId": {
                                        "Category": "Deploy",
                                        "Owner": "AWS",
                                        "Provider": "CloudFormation",
                                        "Version": "1",
                                    },
                                    "Configuration": {
                                        "StackName": "dummy-0-my-stack",
                                        "Capabilities": "CAPABILITY_NAMED_IAM,CAPABILITY_AUTO_EXPAND",
                                        "RoleArn": {
                                            "Fn::Join": [
                                                "",
                                                [
                                                    "arn:",
                                                    {"Ref": "AWS::Partition"},
                                                    ":iam::",
                                                    {"Ref": "AWS::AccountId"},
                                                    ":role/ddk-dev-hnb659fds-cfn-exec-",
                                                    {"Ref": "AWS::AccountId"},
                                                    "-",
                                                    {"Ref": "AWS::Region"},
                                                ],
                                            ]
                                        },
                                        "TemplateConfiguration": Match.any_value(),
                                        "ActionMode": "CHANGE_SET_REPLACE",
                                        "ChangeSetName": "PipelineChange",
                                        "TemplatePath": Match.any_value(),
                                    },
                                    "InputArtifacts": [{"Name": "Synth_Output"}],
                                    "Name": "dummy-0.my-stack.Prepare",
                                    "RoleArn": {
                                        "Fn::Join": [
                                            "",
                                            [
                                                "arn:",
                                                {"Ref": "AWS::Partition"},
                                                ":iam::",
                                                {"Ref": "AWS::AccountId"},
                                                ":role/ddk-dev-hnb659fds-deploy-",
                                                {"Ref": "AWS::AccountId"},
                                                "-",
                                                {"Ref": "AWS::Region"},
                                            ],
                                        ]
                                    },
                                    "RunOrder": 1,
                                },
                                {
                                    "ActionTypeId": {
                                        "Category": "Deploy",
                                        "Owner": "AWS",
                                        "Provider": "CloudFormation",
                                        "Version": "1",
                                    },
                                    "Configuration": {
                                        "StackName": "dummy-1-my-stack",
                                        "Capabilities": "CAPABILITY_NAMED_IAM,CAPABILITY_AUTO_EXPAND",
                                        "RoleArn": {
                                            "Fn::Join": [
                                                "",
                                                [
                                                    "arn:",
                                                    {"Ref": "AWS::Partition"},
                                                    ":iam::",
                                                    {"Ref": "AWS::AccountId"},
                                                    ":role/ddk-dev-hnb659fds-cfn-exec-",
                                                    {"Ref": "AWS::AccountId"},
                                                    "-",
                                                    {"Ref": "AWS::Region"},
                                                ],
                                            ]
                                        },
                                        "TemplateConfiguration": Match.any_value(),
                                        "ActionMode": "CHANGE_SET_REPLACE",
                                        "ChangeSetName": "PipelineChange",
                                        "TemplatePath": Match.any_value(),
                                    },
                                    "InputArtifacts": [{"Name": "Synth_Output"}],
                                    "Name": "dummy-1.my-stack.Prepare",
                                    "RoleArn": {
                                        "Fn::Join": [
                                            "",
                                            [
                                                "arn:",
                                                {"Ref": "AWS::Partition"},
                                                ":iam::",
                                                {"Ref": "AWS::AccountId"},
                                                ":role/ddk-dev-hnb659fds-deploy-",
                                                {"Ref": "AWS::AccountId"},
                                                "-",
                                                {"Ref": "AWS::Region"},
                                            ],
                                        ]
                                    },
                                    "RunOrder": 1,
                                },
                                {
                                    "ActionTypeId": {
                                        "Category": "Deploy",
                                        "Owner": "AWS",
                                        "Provider": "CloudFormation",
                                        "Version": "1",
                                    },
                                    "Configuration": {
                                        "StackName": "dummy-0-my-stack",
                                        "ActionMode": "CHANGE_SET_EXECUTE",
                                        "ChangeSetName": "PipelineChange",
                                    },
                                    "Name": "dummy-0.my-stack.Deploy",
                                    "RoleArn": {
                                        "Fn::Join": [
                                            "",
                                            [
                                                "arn:",
                                                {"Ref": "AWS::Partition"},
                                                ":iam::",
                                                {"Ref": "AWS::AccountId"},
                                                ":role/ddk-dev-hnb659fds-deploy-",
                                                {"Ref": "AWS::AccountId"},
                                                "-",
                                                {"Ref": "AWS::Region"},
                                            ],
                                        ]
                                    },
                                    "RunOrder": 2,
                                },
                                {
                                    "ActionTypeId": {
                                        "Category": "Deploy",
                                        "Owner": "AWS",
                                        "Provider": "CloudFormation",
                                        "Version": "1",
                                    },
                                    "Configuration": {
                                        "StackName": "dummy-1-my-stack",
                                        "ActionMode": "CHANGE_SET_EXECUTE",
                                        "ChangeSetName": "PipelineChange",
                                    },
                                    "Name": "dummy-1.my-stack.Deploy",
                                    "RoleArn": {
                                        "Fn::Join": [
                                            "",
                                            [
                                                "arn:",
                                                {"Ref": "AWS::Partition"},
                                                ":iam::",
                                                {"Ref": "AWS::AccountId"},
                                                ":role/ddk-dev-hnb659fds-deploy-",
                                                {"Ref": "AWS::AccountId"},
                                                "-",
                                                {"Ref": "AWS::Region"},
                                            ],
                                        ]
                                    },
                                    "RunOrder": 2,
                                },
                            ],
                        },
                    ),
                ],
            ),
        },
    )
