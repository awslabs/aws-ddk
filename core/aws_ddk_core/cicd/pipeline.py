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

import logging
from typing import Any, Dict, List, Optional

from aws_cdk import Environment, Stage
from aws_cdk.aws_codestarnotifications import DetailType, NotificationRule
from aws_cdk.aws_iam import PolicyStatement
from aws_cdk.aws_sns import Topic
from aws_cdk.pipelines import (
    CodeBuildStep,
    CodePipeline,
    CodePipelineSource,
    IFileSetProducer,
    ManualApprovalStep,
    Step,
)
from aws_ddk_core.base import BaseStack
from aws_ddk_core.cicd import (
    get_bandit_action,
    get_cfn_nag_action,
    get_code_commit_source_action,
    get_synth_action,
    get_tests_action,
)
from aws_ddk_core.config import Config
from constructs import Construct
from marshmallow import Schema, fields

_logger: logging.Logger = logging.getLogger(__name__)


class ArtifactorySchema(Schema):
    """DDK CICD Pipeline Artifactory schema."""

    repository = fields.String()
    domain = fields.String()
    domain_owner = fields.String()


class CICDPipelineSchema(Schema):
    """DDK CICD Pipeline schema."""

    artifactory = fields.Nested(ArtifactorySchema)


class CICDPipelineStack(BaseStack):
    """
    Create a stack that contains DDK Continuous Integration and Delivery (CI/CD) pipeline.

    The pipeline is based on `CDK self-mutating pipeline
    <https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.pipelines-readme.html>`_ but includes
    several DDK-specific features, including:

    - Ability to configure some properties via JSON config e.g. manual approvals for application stages
    - Defaults for source/synth - CodeCommit & cdk synth, with ability to override them
    - Ability to connect to private artifactory to pull artifacts from at synth
    - Security best practices - ensures pipeline buckets block non-SSL, and are KMS-encrypted with rotated keys
    - Builder interface to avoid chunky constructor methods

    The user should be able to reuse the pipeline in multiple DDK applications hoping to save LOC.

    Example:

    .. code-block:: python

        pipeline = (
            CICDPipelineStack(
                app,
                id="my-pipeline",
                environment_id="cicd",
                pipeline_name="MyPipeline",
            )
            .add_source_action(repository_name="my-repo")
            .add_synth_action()
            .build()
            .add_checks()
            .add_stage("dev", DevStage(app, "dev"))
            .synth()
            .add_notifications()
        )

    """

    def __init__(
        self,
        scope: Construct,
        id: str,
        environment_id: str,
        pipeline_name: Optional[str] = None,
        env: Optional[Environment] = None,
        **kwargs: Any,
    ) -> None:
        """
        Start building Code Pipeline.

        Parameters
        ----------
        scope: Construct
            Scope within which this construct is defined
        id: str
            Identifier of the pipeline
        environment_id: str
            Identifier of the environment that will contain the pipeline
        pipeline_name: Optional[str]
            Name  of the pipeline
        env: Optional[Environment]
            Environment
        kwargs: Any
            Additional args
        """
        self._config = Config()
        super().__init__(
            scope,
            id=id,
            environment_id=environment_id,
            env=env or self._config.get_env(environment_id),
            **kwargs,
        )
        self.environment_id = environment_id
        self.pipeline_name = pipeline_name
        self.pipeline_id = id

    def add_source_action(
        self,
        repository_name: Optional[str] = None,
        branch: str = "main",
        source_action: Optional[CodePipelineSource] = None,
    ) -> "CICDPipelineStack":
        """
        Add source action.

        Parameters
        ----------
        repository_name: Optional[str]
            Name of the SCM repository
        branch: str
            Branch of the SCM repository
        source_action: Optional[CodePipelineSource]
            Override source action

        Returns
        -------
        pipeline : CICDPipelineStack
            CICDPipelineStack
        """
        self._source_action = source_action or get_code_commit_source_action(
            self, repository_name=repository_name, branch=branch  # type: ignore
        )
        return self

    def add_synth_action(
        self,
        codeartifact_repository: Optional[str] = None,
        codeartifact_domain: Optional[str] = None,
        codeartifact_domain_owner: Optional[str] = None,
        role_policy_statements: Optional[List[PolicyStatement]] = None,
        synth_action: Optional[CodeBuildStep] = None,
    ) -> "CICDPipelineStack":
        """
        Add synth action. During synth can connect and pull artifacts from a private artifactory.

        Parameters
        ----------

        codeartifact_repository: Optional[str]
            Name of the CodeArtifact repository to pull artifacts from
        codeartifact_domain: Optional[str]
            Name of the CodeArtifact domain
        codeartifact_domain_owner: Optional[str]
            CodeArtifact domain owner account
        role_policy_statements: Optional[List[PolicyStatement]]
            Additional policies to add to the synth action role
        synth_action: Optional[CodeBuildStep]
            Override synth action

        Returns
        -------
        pipeline : CICDPipelineStack
            CICDPipelineStack
        """
        # Read artifactory config
        self._artifactory_config: Dict[str, Any] = (
            CICDPipelineSchema()
            .load(
                self._config.get_resource_config(
                    environment_id=self.environment_id,
                    id=self.pipeline_id,
                )
            )
            .get("artifactory", {})
        )
        self._synth_action = synth_action or get_synth_action(
            code_pipeline_source=self._source_action,
            cdk_version=self._config.get_cdk_version(),
            partition=self.partition,
            region=self.region,
            account=self.account,
            role_policy_statements=role_policy_statements,
            codeartifact_repository=codeartifact_repository or self._artifactory_config.get("repository"),
            codeartifact_domain=codeartifact_domain or self._artifactory_config.get("domain"),
            codeartifact_domain_owner=codeartifact_domain_owner or self._artifactory_config.get("domain_owner"),
        )
        return self

    def build(self) -> "CICDPipelineStack":
        """
        Build the pipeline structure.

        Returns
        -------
        pipeline : CICDPipelineStack
            CICDPipelineStack
        """
        # Create self-mutating CDK Pipeline
        self._pipeline = CodePipeline(
            self,
            id="code-pipeline",
            cross_account_keys=True,
            synth=self._synth_action,
            cli_version=self._config.get_cdk_version(),
        )
        return self

    def add_stage(
        self,
        stage_id: str,
        stage: Stage,
        manual_approvals: Optional[bool] = False,
    ) -> "CICDPipelineStack":
        """
        Add application stage to the CICD pipeline. This stage deploys your application infrastructure.

        Parameters
        ----------
        stage_id: str
            Identifier of the stage
        stage: Stage
            Application stage instance
        manual_approvals: Optional[bool]
            Configure manual approvals. False by default

        Returns
        -------
        pipeline : CICDPipelineStack
            CICDPipelineStack
        """
        manual_approvals = manual_approvals or self._config.get_env_config(stage_id).get("manual_approvals")

        self._pipeline.add_stage(
            stage,
            pre=[ManualApprovalStep(f"PromoteTo{stage_id.title()}")] if manual_approvals else None,
        )
        return self

    def add_security_lint_stage(
        self,
        stage_name: Optional[str] = None,
        cloud_assembly_file_set: Optional[IFileSetProducer] = None,
    ) -> "CICDPipelineStack":
        """
        Add linting - cfn-nag, and bandit.

        Parameters
        ----------
        stage_name: Optional[str]
            Name of the stage
        cloud_assembly_file_set: Optional[IFileSetProducer]
            Cloud assembly file set producer

        Returns
        -------
        pipeline : CICDPipeline
            CICD pipeline
        """
        self._pipeline.add_wave(
            stage_name or "SecurityLint",
            post=[
                get_cfn_nag_action(
                    file_set_producer=cloud_assembly_file_set
                    if cloud_assembly_file_set
                    else self._pipeline.cloud_assembly_file_set
                ),
                get_bandit_action(code_pipeline_source=self._source_action),
            ],
        )
        return self

    def add_test_stage(
        self,
        stage_name: Optional[str] = None,
        cloud_assembly_file_set: Optional[IFileSetProducer] = None,
        commands: Optional[List[str]] = None,
    ) -> "CICDPipelineStack":
        """
        Add test - e.g. pytest.

        Parameters
        ----------
        stage_name: Optional[str]
            Name of the stage
        cloud_assembly_file_set: Optional[IFileSetProducer]
            Cloud assembly file set
        commands: Optional[List[str]]
            Additional commands to run in the test. Defaults to "./test.sh" otherwise

        Returns
        -------
        pipeline : CICDPipelineStack
            CICD pipeline
        """

        self._pipeline.add_wave(
            stage_name or "Tests",
            post=[
                get_tests_action(
                    file_set_producer=cloud_assembly_file_set if cloud_assembly_file_set else self._source_action,
                    commands=commands,
                ),
            ],
        )
        return self

    def add_notifications(
        self,
        notification_rule: Optional[NotificationRule] = None,
    ) -> "CICDPipelineStack":
        """
        Add pipeline notifications. Create notification rule that sends events to the specified SNS topic.

        Parameters
        ----------
        notification_rule: Optional[NotificationRule]
            Override notification rule

        Returns
        -------
        pipeline : CICDPipeline
            CICD pipeline
        """

        self._notification_rule = notification_rule or NotificationRule(
            self,
            "notification",
            detail_type=DetailType.BASIC,
            events=["codepipeline-pipeline-pipeline-execution-failed"],
            source=self._pipeline.pipeline,
            targets=[
                Topic.from_topic_arn(
                    self,
                    "topic",
                    topic_arn=self._config.get_env_config(self.environment_id).get("notifications_topic_arn"),
                )
                if self._config.get_env_config(self.environment_id).get("notifications_topic_arn")
                else Topic(
                    self,
                    f"{self.pipeline_name}-{self.environment_id}-notifications",
                    topic_name=f"{self.pipeline_name}-{self.environment_id}-notifications",
                )
            ],
        )
        return self

    def add_checks(self) -> "CICDPipelineStack":
        """
        Add checks to the pipeline (e.g. linting, security, tests...).

        Returns
        -------
        pipeline : CICDPipelineStack
            CICD pipeline
        """
        if self._config.get_env_config(self.environment_id).get("execute_security_lint"):
            self.add_security_lint_stage()
        if self._config.get_env_config(self.environment_id).get("execute_tests"):
            self.add_test_stage()
        return self

    def add_custom_stage(self, stage_name: str, steps: List[Step]) -> "CICDPipelineStack":
        """
        Add custom stage to the pipeline.

        Parameters
        ----------
        stage_name: str
            Name of the stage
        steps: List[Step]
            Steps to add to this stage. List of Step().
            See `Documentation on aws_cdk.pipelines.Step`
            <https://docs.aws.amazon.com/cdk/api/v1/python/aws_cdk.pipelines/Step.html>`_ for more detail.

        Returns
        -------
        pipeline : CICDPipeline
            CICD pipeline
        """

        self._pipeline.add_wave(
            stage_name,
            post=steps,
        )
        return self

    def synth(self) -> "CICDPipelineStack":
        """
        Synthesize the pipeline.

        It is not possible to modify the pipeline after calling this method.

        Returns
        -------
        pipeline : CICDPipelineStack
            CICDPipelineStack
        """
        self._pipeline.build_pipeline()
        self._pipeline_key = self._pipeline.pipeline.artifact_bucket.encryption_key.node.default_child
        self._pipeline_key.enable_key_rotation = True
        return self
