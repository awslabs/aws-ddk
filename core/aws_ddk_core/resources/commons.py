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

from typing import Any, Dict, Optional

import aws_cdk as cdk
import aws_cdk.aws_ec2 as ec2
from marshmallow import EXCLUDE, Schema, ValidationError, fields


class BaseSchema(Schema):
    """Base DDK Marshmallow schema."""

    class Meta:
        # By default, a field not represented in the schema raises a Validation error
        # https://marshmallow.readthedocs.io/en/stable/quickstart.html#handling-unknown-fields
        unknown = EXCLUDE

    # Removal policy is a shared property across most CDK resources
    # https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_core.RemovalPolicy.html
    removal_policy = fields.Method(deserialize="load_removal_policy", load_default=cdk.RemovalPolicy.DESTROY)

    def load_removal_policy(self, value: str) -> cdk.RemovalPolicy:
        removal_policies: Dict[str, cdk.RemovalPolicy] = cdk.RemovalPolicy._member_map_
        try:
            return removal_policies[value.upper()]
        except KeyError as error:
            raise ValidationError(f"`removal_policy` value must be one of {removal_policies.values()}.") from error


class Duration(fields.Field):
    """Field that deserializes a string to a CDK Duration in seconds."""

    def _deserialize(self, value: int, attr: Optional[str], data: Any, **kwargs: Any) -> cdk.Duration:
        try:
            return cdk.Duration.seconds(value)
        except TypeError as error:
            raise ValidationError(f"`{attr}` must be an integer representing duration in seconds.") from error


class SubnetType(fields.Field):
    """Field that deserializes a string to a CDK EC2 SubnetType."""

    def _deserialize(self, value: str, attr: Optional[str], data: Any, **kwargs: Any) -> ec2.SubnetType:
        subnet_types: Dict[str, ec2.SubnetType] = ec2.SubnetType._member_map_
        try:
            return subnet_types[value.upper()]
        except KeyError as error:
            raise ValidationError(f"`{attr}` value must be one of {subnet_types.values()}") from error
