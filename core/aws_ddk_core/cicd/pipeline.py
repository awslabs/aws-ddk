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
from aws_cdk.aws_codepipeline import Pipeline
from aws_cdk.aws_iam import PolicyStatement
from aws_cdk.aws_kms import Key
from aws_cdk.aws_s3 import BucketEncryption
from aws_cdk.pipelines import CodeBuildStep, CodePipeline, CodePipelineSource, ManualApprovalStep
from aws_ddk_core.base import BaseStack
from aws_ddk_core.cicd import get_code_commit_source_action, get_synth_action
from aws_ddk_core.config import Config
from aws_ddk_core.resources import S3Factory
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
            .add_stage("dev", DevStage(app, "dev"))
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
            # Override underlying CodePipeline replacing default S3 bucket & KMS key
            code_pipeline=Pipeline(
                self,
                id="pipeline",
                artifact_bucket=S3Factory.bucket(
                    self,
                    environment_id=self.environment_id,
                    id="pipeline-bucket",
                    encryption=BucketEncryption.KMS,
                    encryption_key=Key(
                        self,
                        id="pipeline-key",
                        enable_key_rotation=True,
                    ),
                ),
                enable_key_rotation=True,
                pipeline_name=self.pipeline_name,
            ),
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
            stage, pre=[ManualApprovalStep(f"PromoteTo{stage_id.title()}")] if manual_approvals else None
        )
        return self
