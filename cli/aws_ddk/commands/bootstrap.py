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
from typing import Dict, List, Optional, Tuple

from aws_ddk.services import cfn
from aws_ddk.utils import get_account_id, get_package_root, get_region
from click import echo

DEFAULT_BOOTSTRAP_TEMPLATE = "data/cloudformation_templates/bootstrap.yaml"
PREFIX = "ddk"

_logger: logging.Logger = logging.getLogger(__name__)


def tuples_to_list(tuples: Tuple[Tuple[str, str]]) -> List[Dict[str, str]]:
    return [{"Key": k, "Value": v} for k, v in tuples]


def bootstrap_account(
    environment: str,
    prefix: Optional[str] = None,
    qualifier: Optional[str] = None,
    trusted_accounts: Optional[Tuple[str]] = None,
    iam_policies: Optional[Tuple[str]] = None,
    permissions_boundary: Optional[str] = None,
    tags: Optional[Tuple[Tuple[str, str]]] = None,
) -> None:
    _logger.debug(f"environment: {environment}")

    if not prefix:
        prefix = PREFIX

    parameters = [
        {
            "ParameterKey": "Prefix",
            "ParameterValue": prefix,
        },
        {
            "ParameterKey": "Environment",
            "ParameterValue": environment,
        },
    ]

    if qualifier:
        parameters.append({"ParameterKey": "Qualifier", "ParameterValue": qualifier})
    if trusted_accounts:
        parameters.append({"ParameterKey": "TrustedAccounts", "ParameterValue": ",".join(trusted_accounts)})
    if iam_policies:
        parameters.append({"ParameterKey": "CloudFormationExecutionPolicies", "ParameterValue": ",".join(iam_policies)})
    else:
        echo("No IAM policy supplied. Defaulting to Admin permissions.")
    if permissions_boundary:
        parameters.append(
            {
                "ParameterKey": "CloudFormationExecutionPermissionsBoundaryPolicy",
                "ParameterValue": permissions_boundary,
            }
        )
    key_value_tags = tuples_to_list(tags) if tags else None

    echo(f"Bootstrapping environment {environment} - AWS account {get_account_id()} and region {get_region()}...")
    _logger.debug(f"parameters: {parameters}")
    cfn.deploy_template(
        stack_name=f"{prefix.title()}{environment.title()}Bootstrap",
        file_name=os.path.join(get_package_root(), DEFAULT_BOOTSTRAP_TEMPLATE),
        parameters=parameters,
        tags=key_value_tags,
    )
    echo("Done.")
