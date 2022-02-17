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

import json
from typing import Any, Generator
from unittest.mock import mock_open, patch

from aws_cdk import App, Environment
from aws_ddk_core.base import BaseStack
from aws_ddk_core.config import Config
from constructs import Construct
from pytest import fixture

config = {
    "cdk_version": "2.8.0",
    "environments": {
        "dev": {
            "account": "111111111111",
            "region": "us-east-1",
            "tags": {"Environment": "Dev", "Application": "Foo"},
            "resources": {
                "dummy-resource": {
                    "removal_policy": "destroy",
                },
                "dummy-stack": {"tags": {"Stack": "Test", "Owner": "DDK"}},
                "dummy-bucket-2": {
                    "versioned": False,
                    "removal_policy": "destroy",
                    "access_control": "public_read_write",
                },
                "dummy-lambda-2": {
                    "memory_size": 512,
                    "timeout": 300,
                    "tracing": "ACTIVE",
                },
                "dummy-lambda-vpc": {
                    "timeout": 300,
                    "vpc_id": "ddk-dev-vpc",
                    "vpc_subnet_type": "private_with_nat",
                },
                "dummy-lambda-vpc-subnet-ids": {
                    "vpc_id": "ddk-dev-vpc",
                    "vpc_subnet_ids": ["1", "2", "3"],
                },
                "dummy-lambda-security-groups": {
                    "vpc_id": "ddk-dev-vpc",
                    "security_group_ids": ["SGFD6CE9E0"],
                },
                "dummy-queue-2": {
                    "visibility_timeout": 30,
                    "retention_period": 3600,
                    "delivery_delay": 15,
                    "removal_policy": "destroy",
                },
                "dummy-key-2": {
                    "enable_key_rotation": False,
                },
                "dummy-key-3": {
                    "enable_key_rotation": True,
                },
                "dummy-sqs-lambda-function": {
                    "memory_size": 512,
                },
                "dummy-sqs-lambda-queue": {
                    "visibility_timeout": 120,
                },
                "dummy-sqs-lambda-event-dlq": {
                    "delivery_delay": 15,
                },
            },
        },
    },
    "tags": {
        "Application": "Core",
    },
}


@fixture()
def cdk_app() -> App:
    return App(context=config)


@fixture()
def test_stack(cdk_app: App) -> BaseStack:
    class TestStack(BaseStack):
        def __init__(self, scope: Construct, id: str, **kwargs: Any) -> None:
            super().__init__(scope, id=id, environment_id="dev", **kwargs)

    return TestStack(
        cdk_app,
        "dummy-stack",
        env=Environment(account="111111111111", region="us-west-2"),
    )


@fixture()
@patch("builtins.open", mock_open(read_data=json.dumps(config)))
def config_json() -> Config:
    return Config()


@fixture(scope="session", autouse=True)
def mock_config() -> Generator[Any, None, None]:
    with patch("builtins.open", mock_open(read_data=json.dumps(config))):
        yield
