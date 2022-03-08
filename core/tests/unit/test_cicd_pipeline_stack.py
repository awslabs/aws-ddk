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
from aws_ddk_core.base import BaseStack
from aws_ddk_core.cicd import CICDPipelineStack
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
            "KmsMasterKeyId": Match.any_value(),
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
