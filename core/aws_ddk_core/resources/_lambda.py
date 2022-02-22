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

import aws_cdk as cdk
import aws_cdk.aws_ec2 as ec2
import aws_cdk.aws_lambda as lmb
from aws_cdk.aws_iam import IRole, PolicyStatement
from aws_cdk.aws_sqs import IQueue
from aws_ddk_core.config import Config
from aws_ddk_core.resources.commons import BaseSchema, Duration, SubnetType
from constructs import Construct
from marshmallow import ValidationError, fields

_logger: logging.Logger = logging.getLogger(__name__)


class FunctionSchema(BaseSchema):
    """DDK Lambda function Marshmallow schema."""

    # Lambda function CDK construct fields
    dead_letter_queue_enabled = fields.Bool()
    memory_size = fields.Int(load_default=256)
    environment = fields.Dict(keys=fields.Str, values=fields.Str)
    profiling = fields.Bool()
    reserved_concurrent_executions = fields.Int()
    timeout = Duration(load_default=cdk.Duration.seconds(120))
    tracing = fields.Method(deserialize="load_tracing")
    max_event_age = Duration()
    retry_attempts = fields.Int()
    allow_all_outbound = fields.Bool()
    allow_public_subnet = fields.Bool()

    def load_tracing(self, value: str) -> lmb.Tracing:
        tracings: Dict[str, lmb.Tracing] = lmb.Tracing._member_map_
        try:
            return tracings[value.upper()]
        except KeyError as error:
            raise ValidationError(f"`tracing` value must be one of {tracings.values()}.") from error

    # Config specific fields
    vpc_id = fields.Str(metadata={"config_only": True})
    vpc_subnet_type = SubnetType(metadata={"config_only": True})
    vpc_subnet_group_name = fields.Str(metadata={"config_only": True})
    vpc_subnet_ids = fields.List(fields.Str(), metadata={"config_only": True})
    security_group_ids = fields.List(fields.Str(), metadata={"config_only": True})


class LambdaFactory:
    """
    Class factory to create and configure Lambda DDK resources, including Functions.
    """

    @staticmethod
    def function(
        scope: Construct,
        id: str,
        environment_id: str,
        code: lmb.Code,
        handler: str,
        runtime: lmb.Runtime = lmb.Runtime.PYTHON_3_9,
        function_name: Optional[str] = None,
        description: Optional[str] = None,
        role: Optional[IRole] = None,
        dead_letter_queue_enabled: Optional[bool] = None,
        dead_letter_queue: Optional[IQueue] = None,
        memory_size: Optional[int] = None,
        timeout: Optional[cdk.Duration] = None,
        **function_props: Any,
    ) -> lmb.IFunction:
        """
        Create and configure Lambda function.

        This construct allows to configure parameters of the function using ddk.json configuration file
        depending on the `environment_id` in which the function is used. Supported parameters are:
        `dead_letter_queue_enabled`,`memory_size`, `environment`, `profiling`,
        `reserved_concurrent_executions`, `timeout`, `tracing`, `max_event_age`, `retry_attempts`,
        `allow_all_outbound`, and `allow_public_subnet`.

        The parameters are respected in the following order:
        1 - Explicit arguments are always preferred
        2 - Values from configuration file
        3 - Defaults are used otherwise

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the Lambda function
        environment_id : str
            Identifier of the environment
        code : Code
            The source code of the Lambda function
        handler : str
            The name of the method within the code that Lambda calls to execute the function
        runtime : Runtime
            The runtime environment for the Lambda function
        function_name : Optional[str]
            The name of the Lambda function
        description : Optional[str]
            The description of the Lambda function
        role : Optional[IRole]
            Lambda execution role
        dead_letter_queue_enabled : Optional[bool]
            Determines if DLQ is enabled. `False` by default.
        dead_letter_queue : Optional[IQueue]
            The SQS queue to use if DLQ is enabled
        memory_size : Optional[int]
            The amount of memory, in MB, that is allocated to the Lambda function. `256` by default.
        timeout : Optional[Duration]
            The function execution time (in seconds) after which Lambda terminates the function.
            `aws_cdk.Duration.seconds(120)` by default.
        function_props : Any
            Additional function properties. For complete list of properties refer to CDK Documentation -
            Lambda Function: https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_lambda/Function.html

        Returns
        -------
        fn : aws_cdk.aws_lambda.Function
            Lambda function
        """
        # Load function configuration from ddk.json based on environment id and resource id
        function_config_dict: Dict[str, Any] = Config().get_resource_config(
            environment_id=environment_id,
            id=id,
        )
        declared_fields = FunctionSchema().declared_fields.items()
        # Load CDK-only fields from schema
        function_construct_props: Dict[str, Any] = FunctionSchema(
            only=[name for name, field in declared_fields if not field.metadata]
        ).load(function_config_dict, partial=["removal_policy"])
        # Load config-only fields from schema
        function_config_only_props: Dict[str, Any] = FunctionSchema(
            only=[name for name, field in declared_fields if field.metadata == {"config_only": True}]
        ).load(function_config_dict, partial=["removal_policy"])
        # Set up networking
        function_construct_props["vpc"] = LambdaFactory._get_vpc(
            scope, id, vpc_id=function_config_only_props.get("vpc_id")
        )
        function_construct_props["vpc_subnets"] = LambdaFactory._get_vpc_subnets(
            scope,
            id,
            vpc_subnet_ids=function_config_only_props.get("vpc_subnet_ids"),
            vpc_subnet_type=function_config_only_props.get("vpc_subnet_type"),
            vpc_subnet_group_name=function_config_only_props.get("vpc_subnet_group_name"),
        )
        function_construct_props["security_groups"] = LambdaFactory._get_security_groups(
            scope, id, security_group_ids=function_config_only_props.get("security_group_ids")
        )
        # Collect all explicit function arguments
        function_props = {
            "code": code,
            "handler": handler,
            "runtime": runtime,
            "role": role,
            "function_name": function_name,
            "description": description,
            "dead_letter_queue_enabled": dead_letter_queue_enabled,
            "dead_letter_queue": dead_letter_queue,
            "memory_size": memory_size,
            "timeout": timeout,
            **function_props,
        }
        # Explicit ("hardcoded") props should always take precedence over config
        for key, value in function_props.items():
            if value is not None:
                function_construct_props[key] = value

        _logger.debug(f"function_construct_props: {function_construct_props}")

        # Create the function
        fn: lmb.IFunction = lmb.Function(scope, id, **function_construct_props)
        # Add IAM permissions
        if "vpc" in function_construct_props:
            LambdaFactory.add_vpc_permissions(fn)
        return fn

    @staticmethod
    def _get_vpc(scope: Construct, id: str, vpc_id: Optional[str] = None) -> Optional[ec2.IVpc]:
        return ec2.Vpc.from_lookup(scope, f"{id}-{vpc_id}-vpc", vpc_id=vpc_id) if vpc_id else None

    @staticmethod
    def _get_vpc_subnets(
        scope: Construct,
        id: str,
        vpc_subnet_ids: Optional[List[str]] = None,
        vpc_subnet_type: Optional[ec2.SubnetType] = None,
        vpc_subnet_group_name: Optional[str] = None,
    ) -> Optional[ec2.SubnetSelection]:
        subnets: Optional[List[ec2.ISubnet]] = (
            [ec2.Subnet.from_subnet_id(scope, f"{id}-{subnet_id}-sb", subnet_id) for subnet_id in vpc_subnet_ids]
            if vpc_subnet_ids
            else None
        )
        return (
            ec2.SubnetSelection(
                subnet_type=vpc_subnet_type,
                subnet_group_name=vpc_subnet_group_name,
                subnets=subnets,
            )
            if vpc_subnet_type or vpc_subnet_group_name or subnets
            else None
        )

    @staticmethod
    def _get_security_groups(
        scope: Construct,
        id: str,
        security_group_ids: Optional[List[str]] = None,
    ) -> Optional[List[ec2.ISecurityGroup]]:
        return (
            [
                ec2.SecurityGroup.from_security_group_id(scope, f"{id}-{security_group_id}-sg", security_group_id)
                for security_group_id in security_group_ids
            ]
            if security_group_ids
            else None
        )

    @staticmethod
    def add_vpc_permissions(fn: lmb.IFunction) -> None:
        fn.add_to_role_policy(
            PolicyStatement(
                actions=[
                    "ec2:AssignPrivateIpAddresses",
                    "ec2:CreateNetworkInterface",
                    "ec2:DeleteNetworkInterface",
                    "ec2:DescribeNetworkInterfaces",
                    "ec2:UnassignPrivateIpAddresses",
                ],
                resources=["*"],
            )
        )
