#!/usr/bin/env python3
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
import os
import re
import sys
from typing import Optional, Tuple

import click
from aws_ddk.__metadata__ import __version__
from aws_ddk.commands.bootstrap import bootstrap_account
from aws_ddk.commands.create import create_code_repository
from aws_ddk.commands.deploy import cdk_deploy
from aws_ddk.commands.init import init_project
from aws_ddk.utils import get_package_root
from boto3 import Session, _get_default_session, setup_default_session

DEBUG_LOGGING_FORMAT = "[%(asctime)s][%(filename)-13s:%(lineno)3d] %(message)s"
DEBUG_LOGGING_FORMAT_REMOTE = "[%(filename)-13s:%(lineno)3d] %(message)s"
DEFAULT_PROJECT_TEMPLATE = "data/project_templates/ddk_app/"

_logger: logging.Logger = logging.getLogger(__name__)


def enable_debug(format: str) -> None:
    logging.basicConfig(level=logging.DEBUG, format=format)
    _logger.setLevel(logging.DEBUG)
    logging.getLogger("boto3").setLevel(logging.ERROR)
    logging.getLogger("botocore").setLevel(logging.ERROR)
    logging.getLogger("urllib3").setLevel(logging.ERROR)
    logging.getLogger("cookiecutter").setLevel(logging.ERROR)
    logging.getLogger("sh").setLevel(logging.ERROR)


def setup_boto_session(profile: str, region: Optional[str] = None) -> None:
    # Setup profile and region globally in boto3 sessions
    setup_default_session(profile_name=profile, region_name=region)
    session: Session = _get_default_session()
    _logger.debug(f"profile: {session.profile_name}")
    _logger.debug(f"region: {session.region_name}")


class RegexString(click.ParamType):
    name = "regex-string"

    def __init__(self, regex: str):
        self._regex = regex

    def convert(self, value: str, param: Optional[click.Parameter], ctx: Optional[click.Context]) -> str:
        found = re.match(self._regex, value)
        if not found:
            self.fail(
                f"Value '{value}' does not match regex {self._regex}",
                param,
                ctx,
            )
        return value


@click.group()
@click.version_option(__version__)
@click.option(
    "--debug/--no-debug",
    default=False,
    help="Turn debug logging on/off.",
    show_default=True,
)
def cli(
    debug: bool,
) -> None:
    """AWS DDK CLI."""
    click.echo(f"AWS DDK CLI {__version__} (Python {sys.version})")
    if debug:
        enable_debug(format=DEBUG_LOGGING_FORMAT)
    _logger.debug(f"debug: {debug}")


@cli.command(name="init")
@click.argument(
    "name",
    type=str,
    required=True,
)
@click.option(
    "--environment",
    "-e",
    type=str,
    help="The id of the environment.",
    required=True,
    default="dev",
    show_default=True,
)
@click.option(
    "--template",
    "-t",
    type=str,
    help="A directory containing a project template directory, or a URL to a git repository",
)
@click.option(
    "--generate-only",
    is_flag=True,
    type=bool,
    help="If true, only generates project files, without setting up a git repo or a virtual environment",
    default=False,
    show_default=True,
)
def init(name: str, environment: str, template: Optional[str] = None, generate_only: Optional[bool] = None) -> None:
    """
    Create the local structure for a new AWS DDK Python project.

    NAME is the name of the project.
    """
    # Use default Cookiecutter project template
    if not template:
        template = os.path.join(get_package_root(), DEFAULT_PROJECT_TEMPLATE)
    return init_project(name=name, environment=environment, template=template, generate_only=generate_only)


@cli.command(name="bootstrap")
@click.option(
    "--environment",
    "-e",
    type=RegexString(regex=r"^[A-Za-z0-9_-]{1,4}$"),
    help="The id of the environment.",
    required=True,
    default="dev",
    show_default=True,
)
@click.option(
    "--profile",
    "-p",
    type=str,
    default="default",
    help="Use a specific profile from your AWS credentials file.",
    show_default=True,
    required=False,
)
@click.option(
    "--region",
    "-r",
    type=str,
    default=None,
    help="AWS Region name (e.g. us-east-1). If None, it will be inferred.",
    show_default=False,
    required=False,
)
@click.option(
    "--prefix",
    type=RegexString(regex=r"^[A-Za-z0-9_-]{1,5}$"),
    help="The prefix to resource names.",
    required=False,
    default="ddk",
    show_default=True,
)
@click.option(
    "--qualifier",
    type=RegexString(regex=r"^[A-Za-z0-9_-]{1,10}$"),
    help="The CDK bootstrap qualifier.",
    required=False,
)
@click.option(
    "--trusted-accounts",
    "-a",
    type=str,
    help="List of trusted AWS accounts to perform deployments (e.g. -a 111111111111 -a 222222222222).",
    multiple=True,
    required=False,
)
@click.option(
    "--iam-policies",
    "-i",
    type=str,
    help="""List of IAM managed policy ARNs that should be attached to the role performing deployments.
    (e.g. -i arn1 -i arn2)""",
    multiple=True,
    required=False,
)
@click.option(
    "--permissions-boundary",
    type=str,
    help="IAM managed permissions boundary policy ARN that should be attached to the role performing deployments.",
    required=False,
)
@click.option(
    "--tags",
    "-t",
    type=(str, str),
    help="List of tags to apply to the stack (e.g -t CostCenter 1984 -t Framework DDK).",
    multiple=True,
    required=False,
)
def bootstrap(
    environment: str,
    profile: str,
    region: Optional[str] = None,
    prefix: Optional[str] = None,
    qualifier: Optional[str] = None,
    trusted_accounts: Optional[Tuple[str]] = None,
    iam_policies: Optional[Tuple[str]] = None,
    permissions_boundary: Optional[str] = None,
    tags: Optional[Tuple[Tuple[str, str]]] = None,
) -> None:
    """Bootstrap the AWS account with DDK resources."""
    setup_boto_session(profile, region)
    bootstrap_account(
        environment=environment,
        prefix=prefix,
        qualifier=qualifier,
        trusted_accounts=trusted_accounts,
        iam_policies=iam_policies,
        permissions_boundary=permissions_boundary,
        tags=tags,
    )


@cli.command(name="create-repository")
@click.argument(
    "name",
    type=str,
    required=True,
)
@click.option(
    "--profile",
    "-p",
    type=str,
    default="default",
    help="Use a specific profile from your AWS credentials file.",
    show_default=True,
    required=False,
)
@click.option(
    "--region",
    "-r",
    type=str,
    default=None,
    help="AWS Region name (e.g. us-east-1). If None, it will be inferred.",
    show_default=False,
    required=False,
)
@click.option(
    "--description",
    "-d",
    type=str,
    help="The description of the repository.",
    required=False,
)
@click.option(
    "--tags",
    "-t",
    type=(str, str),
    help="List of tags to apply to the repository (e.g -t CostCenter 1984 -t Framework DDK).",
    multiple=True,
    required=False,
)
def create_repository(
    name: str,
    profile: str,
    region: Optional[str] = None,
    description: Optional[str] = None,
    tags: Optional[Tuple[Tuple[str, str]]] = None,
) -> None:
    """
    Create a code repository from the source system provider.

    NAME is the name of the repository.
    """
    setup_boto_session(profile, region)
    create_code_repository(
        profile=profile,
        name=name,
        description=description,
        tags=tags,
    )


@cli.command(name="deploy")
@click.option(
    "--profile",
    "-p",
    type=str,
    default="default",
    help="Use a specific profile from your AWS credentials file.",
    show_default=True,
    required=False,
)
@click.option(
    "--require-approval",
    type=click.Choice(["never", "any-change", "broadening"], case_sensitive=False),
    default="never",
    help="What security-sensitive changes need manual approval.",
    required=False,
)
@click.option(
    "--force",
    "-f",
    is_flag=True,
    default=False,
    help="Always deploy stack even if templates are identical.",
    required=False,
)
@click.option(
    "--output-dir",
    "-o",
    type=str,
    help="Directory where cloud assembly is synthesized.",
    required=False,
)
def deploy(
    profile: str,
    require_approval: Optional[str] = None,
    force: Optional[bool] = None,
    output_dir: Optional[str] = None,
) -> None:
    """Deploy DDK stacks to AWS account."""
    setup_boto_session(profile)
    cdk_deploy(
        profile=profile,
        require_approval=require_approval,
        force=force,
        output_dir=output_dir,
    )


def main() -> int:
    cli()
    return 0
