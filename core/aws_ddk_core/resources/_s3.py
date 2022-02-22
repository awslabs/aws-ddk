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

import aws_cdk.aws_s3 as s3
from aws_cdk import RemovalPolicy
from aws_ddk_core.config import Config
from aws_ddk_core.resources.commons import BaseSchema
from constructs import Construct
from marshmallow import ValidationError, fields

_logger: logging.Logger = logging.getLogger(__name__)


class BucketSchema(BaseSchema):
    """DDK S3 bucket Marshmallow schema."""

    versioned = fields.Bool(load_default=True)
    auto_delete_objects = fields.Bool()
    enforce_ssl = fields.Bool(load_default=True)
    access_control = fields.Method(
        deserialize="load_access_control", load_default=s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL
    )

    def load_access_control(self, value: str) -> s3.BucketAccessControl:
        access_controls: Dict[str, s3.BucketAccessControl] = s3.BucketAccessControl._member_map_
        try:
            return access_controls[value.upper()]
        except KeyError as error:
            raise ValidationError(f"`access_control` value must be one of {access_controls.values()}.") from error


class S3Factory:
    """
    Class factory to create and configure Simple Storage Service DDK resources, including Buckets.
    """

    @staticmethod
    def bucket(
        scope: Construct,
        id: str,
        environment_id: str,
        bucket_name: Optional[str] = None,
        versioned: Optional[bool] = None,
        access_control: Optional[s3.BucketAccessControl] = None,
        block_public_access: Optional[s3.BlockPublicAccess] = None,
        removal_policy: Optional[RemovalPolicy] = None,
        encryption: Optional[s3.BucketEncryption] = None,
        enforce_ssl: Optional[bool] = None,
        **bucket_props: Any,
    ) -> s3.IBucket:
        """
        Create and configure S3 bucket.

        This construct allows to configure parameters of the bucket using ddk.json configuration file
        depending on the `environment_id` in which the function is used. Supported parameters are:
        `versioned`,`auto_delete_objects`, `enforce_ssl`, `access_control`, and `removal_policy`.

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the bucket
        environment_id : str
            Identifier of the environment
        bucket_name : Optional[str]
            The name of the bucket
        versioned : Optional[bool]
            Whether this bucket should have versioning turned on or not. `True` by default.
        access_control : Optional[BucketAccessControl]
            Specifies a canned ACL that grants predefined permissions to the bucket
            `aws_cdk.aws_s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL` by default.
        block_public_access : Optional[BlockPublicAccess]
            The block public access configuration of this bucket.
            `aws_cdk.aws_s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL` by default.
        removal_policy : Optional[RemovalPolicy]
            Policy to apply when the bucket is removed from this stack.
            `aws_cdk.RemovalPolicy.RETAIN` by default.
        encryption : Optional[BucketEncryption]
            The kind of server-side encryption to apply to this bucket.
            `aws_cdk.aws_s3.BucketEncryption.S3_MANAGED` by default.
        enforce_ssl : Optional[bool]
            Enforces SSL for requests. `True` by default.
        bucket_props : Any
            Additional bucket properties. For complete list of properties refer to CDK Documentation -
            S3 Bucket: https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_s3/Bucket.html

        Returns
        -------
        bucket : aws_cdk.aws_s3.Bucket
            S3 bucket
        """
        # Load and validate config
        bucket_config_props: Dict[str, Any] = BucketSchema().load(
            Config().get_resource_config(
                environment_id=environment_id,
                id=id,
            )
        )
        # Collect bucket props
        bucket_props = {
            "bucket_name": bucket_name,
            "versioned": versioned,
            "access_control": access_control,
            "block_public_access": block_public_access,
            "removal_policy": removal_policy,
            "encryption": encryption,
            "enforce_ssl": enforce_ssl,
            **bucket_props,
        }
        # Explicit ("hardcoded") props should always take precedence over config
        for key, value in bucket_props.items():
            if value is not None:
                bucket_config_props[key] = value
        # Otherwise use defaults
        bucket_config_props.setdefault("block_public_access", s3.BlockPublicAccess.BLOCK_ALL)
        bucket_config_props.setdefault("encryption", s3.BucketEncryption.S3_MANAGED)

        _logger.debug(f"bucket_config_props: {bucket_config_props}")

        return s3.Bucket(scope, id, **bucket_config_props)
