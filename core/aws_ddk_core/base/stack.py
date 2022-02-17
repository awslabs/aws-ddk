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
from typing import Any, Dict, Optional

from aws_cdk import DefaultStackSynthesizer, Stack, Tags
from aws_cdk.aws_iam import ManagedPolicy, PermissionsBoundary
from aws_ddk_core.config import Config
from constructs import Construct

BOOTSTRAP_PREFIX = "ddk"
BOOTSTRAP_QUALIFIER = "hnb659fds"
_logger: logging.Logger = logging.getLogger(__name__)


class BaseStack(Stack):
    """
    Base Stack to inherit from.

    Includes configurable termination protection, synthesizer, permissions boundary and tags.
    """

    def __init__(
        self,
        scope: Construct,
        id: str,
        environment_id: str,
        termination_protection: Optional[bool] = None,
        permissions_boundary_arn: Optional[str] = None,
        synthesizer: Optional[DefaultStackSynthesizer] = None,
        **kwargs: Any,
    ) -> None:
        """
        Create a stack.

        Includes termination protection settings, multi-level (application, environment, and stack-level) tags,
        and permissions boundary.

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the stack
        environment_id : str
            Identifier of the environment
        termination_protection : Optional[bool]
            Stack termination protection
        permissions_boundary_arn: Optional[str]
            ARN of the permissions boundary managed policy
        synthesizer: Optional[DefaultStackSynthesizer]
            CDK synthesizer configuration
            https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html#bootstrapping-synthesizers
        kwargs : Any
            Additional arguments
        """
        _logger.debug(f"Instantiating {id} stack")

        self._config = Config()
        self._environment_id = environment_id
        self._env_config = self._config.get_env_config(environment_id=self._environment_id)
        self._prefix = self._env_config.get("prefix") or BOOTSTRAP_PREFIX
        self._qualifier = self._env_config.get("qualifier") or BOOTSTRAP_QUALIFIER

        if termination_protection is None:
            termination_protection = self._env_config.get("termination_protection")

        synthesizer = synthesizer or DefaultStackSynthesizer(
            qualifier=self._qualifier,
            file_assets_bucket_name=f"{self._prefix}-{self._environment_id}-{self._qualifier}-assets-${{AWS::AccountId}}-${{AWS::Region}}",  # noqa
            bootstrap_stack_version_ssm_parameter=f"/{self._prefix}/{self._environment_id}/{self._qualifier}/bootstrap-version",  # noqa
            deploy_role_arn=self.__build_role_arn("deploy"),
            file_asset_publishing_role_arn=self.__build_role_arn("file-publish"),
            cloud_formation_execution_role=self.__build_role_arn("cfn-exec"),
            lookup_role_arn=self.__build_role_arn("lookup"),
        )

        super().__init__(scope, id, termination_protection=termination_protection, synthesizer=synthesizer, **kwargs)

        # Stack level tags
        stack_tags: Dict[str, str] = self._config.get_resource_config(environment_id=self._environment_id, id=id).get(
            "tags", {}
        )
        # Environment level tags
        stack_tags.update(self._env_config.get("tags", {}))
        # Application level tags
        stack_tags.update(self._config.get_tags())
        for k, v in stack_tags.items():
            Tags.of(scope).add(k, v)

        # https://docs.aws.amazon.com/cdk/api/latest/python/aws_cdk.aws_iam/PermissionsBoundary.html
        PermissionsBoundary.of(scope).apply(
            ManagedPolicy.from_managed_policy_arn(
                self,
                "PermissionsBoundary",
                permissions_boundary_arn
                or f"arn:{self.partition}:iam::{self.account}:policy/{self._prefix}-{self._environment_id}-{self._qualifier}-permissions-boundary-{self.account}-{self.region}",  # noqa,
            )
        )

    def __build_role_arn(self, name: str) -> str:
        return f"arn:${{AWS::Partition}}:iam::${{AWS::AccountId}}:role/{self._prefix}-{self._environment_id}-{self._qualifier}-{name}-${{AWS::AccountId}}-${{AWS::Region}}"  # noqa
