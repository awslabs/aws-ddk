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

from pathlib import Path

import aws_cdk as cdk
from aws_cdk.assertions import Match, Template
from aws_cdk.aws_lambda import Code
from aws_ddk_core.base import BaseStack
from aws_ddk_core.resources import LambdaFactory


def test_get_lambda_default(test_stack: BaseStack) -> None:
    _fn = LambdaFactory.function(
        scope=test_stack,
        id="dummy-lambda-1",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
    )
    assert not _fn.is_bound_to_vpc

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Lambda::Function",
        props={
            "Runtime": "python3.9",
            "MemorySize": 256,
            "Timeout": 120,
        },
    )


def test_get_lambda_config(test_stack: BaseStack) -> None:
    LambdaFactory.function(
        scope=test_stack,
        id="dummy-lambda-2",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Lambda::Function",
        props={
            "Runtime": "python3.9",
            "MemorySize": 512,
            "Timeout": 300,
            "TracingConfig": {"Mode": "Active"},
        },
    )


def test_get_lambda_hardcoded(test_stack: BaseStack) -> None:
    LambdaFactory.function(
        scope=test_stack,
        id="dummy-lambda-2",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
        memory_size=1024,
        timeout=cdk.Duration.seconds(600),
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Lambda::Function",
        props={
            "Runtime": "python3.9",
            "MemorySize": 1024,
            "Timeout": 600,
        },
    )


def test_get_lambda_vpc(test_stack: BaseStack) -> None:
    _fn = LambdaFactory.function(
        scope=test_stack,
        id="dummy-lambda-security-groups",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
    )
    assert _fn.is_bound_to_vpc

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Lambda::Function",
        props={
            "Runtime": "python3.9",
            "VpcConfig": Match.object_like(
                pattern={
                    "SecurityGroupIds": ["SGFD6CE9E0"],
                    "SubnetIds": ["p-12345", "p-67890"],
                }
            ),
        },
    )

    template.has_resource_properties(
        "AWS::IAM::Policy",
        props={
            "PolicyDocument": Match.object_like(
                pattern={
                    "Statement": [
                        {
                            "Action": [
                                "ec2:AssignPrivateIpAddresses",
                                "ec2:CreateNetworkInterface",
                                "ec2:DeleteNetworkInterface",
                                "ec2:DescribeNetworkInterfaces",
                                "ec2:UnassignPrivateIpAddresses",
                            ],
                            "Effect": "Allow",
                        },
                    ],
                },
            ),
        },
    )


def test_get_lambda_vpc_from_json_config(test_stack: BaseStack) -> None:
    _fn = LambdaFactory.function(
        scope=test_stack,
        id="dummy-lambda-vpc",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
    )
    assert _fn.is_bound_to_vpc

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Lambda::Function",
        props={
            "Runtime": "python3.9",
            "MemorySize": 256,
            "VpcConfig": Match.object_like(
                pattern={
                    "SecurityGroupIds": [{"Fn::GetAtt": ["dummylambdavpcSecurityGroup30095587", "GroupId"]}],
                    "SubnetIds": ["p-12345", "p-67890"],
                }
            ),
        },
    )


def test_get_lambda_vpc_subnets_from_json_config(test_stack: BaseStack) -> None:
    _fn = LambdaFactory.function(
        scope=test_stack,
        id="dummy-lambda-vpc-subnet-ids",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
    )
    assert _fn.is_bound_to_vpc

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Lambda::Function",
        props={
            "Runtime": "python3.9",
            "MemorySize": 256,
            "VpcConfig": Match.object_like(
                pattern={
                    "SubnetIds": ["1", "2", "3"],
                }
            ),
        },
    )
