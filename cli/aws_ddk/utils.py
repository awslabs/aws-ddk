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

import os
from pathlib import Path
from typing import TYPE_CHECKING, overload

import boto3
from aws_ddk.__metadata__ import __version__
from botocore.config import Config

if TYPE_CHECKING:
    from boto3.resources.base import ServiceResource
    from botocore.client import BaseClient
    from mypy_boto3_cloudformation.client import CloudFormationClient
    from mypy_boto3_codecommit.client import CodeCommitClient
    from mypy_boto3_codecommit.literals import ServiceName
    from mypy_boto3_sts.client import STSClient
    from typing_extensions import Literal


def get_botocore_config() -> Config:
    return Config(
        retries={"max_attempts": 5},
        connect_timeout=10,
        max_pool_connections=10,
        user_agent_extra=f"awsddk/{__version__}",
    )


@overload
def boto3_client(service_name: 'Literal["sts"]') -> "STSClient":
    ...


@overload
def boto3_client(service_name: 'Literal["cloudformation"]') -> "CloudFormationClient":
    ...


@overload
def boto3_client(service_name: 'Literal["codecommit"]') -> "CodeCommitClient":
    ...


def boto3_client(service_name: "ServiceName") -> "BaseClient":
    return boto3.client(service_name=service_name, use_ssl=True, config=get_botocore_config())


def boto3_resource(service_name: "ServiceName") -> "ServiceResource":
    return boto3.resource(service_name=service_name, use_ssl=True, config=get_botocore_config())


def get_region() -> str:
    session = boto3._get_default_session()
    if session.region_name is None:
        raise ValueError("It is not possible to infer AWS REGION from your environment.")
    return str(session.region_name)


def get_account_id() -> str:
    return str(boto3_client(service_name="sts").get_caller_identity().get("Account"))


def get_package_root() -> str:
    return os.path.dirname(os.path.relpath(__file__))


def is_in_git_repository(path: str) -> bool:
    return Path(path, ".git").is_dir()
