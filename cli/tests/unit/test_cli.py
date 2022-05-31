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

import os.path
import shutil
from tempfile import TemporaryDirectory

import boto3
from aws_ddk import bootstrap, create_repository, deploy, init
from click.testing import CliRunner
from moto import mock_cloudformation, mock_codecommit, mock_sts


def test_init_help() -> None:
    runner = CliRunner()
    result = runner.invoke(init, ["--help"])
    assert result.exit_code == 0


def test_init_environment() -> None:
    runner = CliRunner()
    workspace_name = "dummy"
    result = runner.invoke(init, ["--environment", "dev", workspace_name])
    path = os.getcwd() + "/" + workspace_name
    assert os.path.isdir(path)
    shutil.rmtree(path)
    assert result.exit_code == 0


def test_bootstrap_help() -> None:
    runner = CliRunner()
    result = runner.invoke(bootstrap, ["--help"])
    assert result.exit_code == 0


@mock_cloudformation
@mock_sts
def test_bootstrap() -> None:
    runner = CliRunner()
    cloudformation = boto3.client("cloudformation")
    prefix = "dummy"
    environment = "dev"

    # run bootstrap
    runner.invoke(
        bootstrap,
        ["--prefix", prefix, "--environment", environment],
    )
    stack_name = f"{prefix.title()}{environment.title()}Bootstrap"
    assert cloudformation.describe_stacks(StackName=stack_name)["Stacks"][0]["StackName"] == stack_name


@mock_cloudformation
@mock_sts
def test_bootstrap_with_disabled_public_access_block() -> None:
    runner = CliRunner()
    cloudformation = boto3.client("cloudformation")
    prefix = "dummy"
    environment = "dev"

    # run bootstrap
    runner.invoke(
        bootstrap,
        ["--prefix", prefix, "--environment", environment, "--disable-public-access-block-configuration"],
    )
    stack_name = f"{prefix.title()}{environment.title()}Bootstrap"
    assert cloudformation.describe_stacks(StackName=stack_name)["Stacks"][0]["StackName"] == stack_name


def test_create_repository_help() -> None:
    runner = CliRunner()
    result = runner.invoke(create_repository, ["--help"])
    assert result.exit_code == 0


@mock_codecommit
def test_create_repository() -> None:
    runner = CliRunner()
    repository_name = "dummy"
    repository_description = "a pytest repo"

    with TemporaryDirectory() as _:
        path = ".git"
        shutil.rmtree(path, ignore_errors=True)
        os.mkdir(path)
        # create repo
        result = runner.invoke(
            create_repository,
            ["--description", repository_description, repository_name],
        )

    # Assert exit code
    assert result.exit_code == 0
    # Assert repo created
    codecommit = boto3.client("codecommit")
    assert (
        codecommit.get_repository(repositoryName=repository_name)["repositoryMetadata"]["repositoryName"]
        == repository_name
    )


def test_deploy_help() -> None:
    runner = CliRunner()
    result = runner.invoke(deploy, ["--help"])
    assert result.exit_code == 0
