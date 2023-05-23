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

import aws_cdk as cdk
import aws_cdk.aws_kms as kms
from aws_ddk_core.config import Config
from aws_ddk_core.resources.commons import BaseSchema, Duration
from constructs import Construct
from marshmallow import fields

_logger: logging.Logger = logging.getLogger(__name__)


class KeyConfigSchema(BaseSchema):
    """DDK KMS Key Marshmallow schema."""

    enable_key_rotation = fields.Bool(load_default=True)
    pending_window = Duration(load_default=cdk.Duration.days(30))


class KMSFactory:
    """
    Class factory to create and configure Key Management Service DDK resources, including Keys.
    """

    @staticmethod
    def key(
        scope: Construct,
        id: str,
        environment_id: str,
        alias: Optional[str] = None,
        enable_key_rotation: Optional[bool] = None,
        pending_window: Optional[cdk.Duration] = None,
        removal_policy: Optional[cdk.RemovalPolicy] = None,
        **key_props: Any,
    ) -> kms.IKey:
        """
        Create and configure KMS key.

        This construct allows to configure parameters of the key using ddk.json configuration file
        depending on the `environment_id` in which the key is used. Supported parameters are:
        `enable_key_rotation`,`pending_window`, and `removal_policy`.

        The parameters are respected in the following order:
        1 - Explicit arguments are always preferred
        2 - Values from configuration file
        3 - Defaults are used otherwise

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the key
        environment_id : str
            Identifier of the environment
        alias : Optional[str]
            Key alias
        enable_key_rotation : Optional[bool]
            Indicates whether AWS KMS rotates the key. `True` by default.
        pending_window : Optional[Duration]
            Specifies the number of days in the waiting period before AWS KMS deletes a CMK that has been
            removed from a CloudFormation stack. `aws_cdk.Duration.days(30)` by default.
        removal_policy : Optional[RemovalPolicy]
            Whether the encryption key should be retained when it is removed from the Stack.
            `aws_cdk.RemovalPolicy.RETAIN` by default.
        key_props : Any
            Additional key properties. For complete list of properties refer to CDK Documentation -
            KMS Key: https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_kms/Key.html

        Returns
        -------
        key : aws_cdk.aws_kms.Key
            KMS key
        """
        # Load and validate config
        key_config: Dict[str, Any] = KeyConfigSchema().load(
            Config().get_resource_config(
                environment_id=environment_id,
                id=id,
            )
        )
        # Collect all key arguments
        key_props = {
            "alias": alias,
            "enable_key_rotation": enable_key_rotation,
            "pending_window": pending_window,
            "removal_policy": removal_policy,
            **key_props,
        }
        # Explicit ("hardcoded") props should always take precedence
        for key, value in key_props.items():
            if value is not None:
                key_config[key] = value

        _logger.debug(f"key_config: {key_config}")

        return kms.Key(
            scope,
            id,
            **key_config,
        )
