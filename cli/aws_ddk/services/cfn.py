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
import time
from typing import TYPE_CHECKING, Any, Dict, List, Optional, Tuple

import botocore.exceptions
from aws_ddk.utils import boto3_client

if TYPE_CHECKING:
    from mypy_boto3_cloudformation.type_defs import WaiterConfigTypeDef

CHANGESET_PREFIX = "aws-ddk-cli-deploy-"

_logger: logging.Logger = logging.getLogger(__name__)


def get_stack_status(stack_name: str) -> str:
    client = boto3_client("cloudformation")
    try:
        resp = client.describe_stacks(StackName=stack_name)
        if len(resp["Stacks"]) < 1:
            raise ValueError(f"CloudFormation stack {stack_name} not found.")
    except botocore.exceptions.ClientError:
        raise
    return resp["Stacks"][0]["StackStatus"]


def does_stack_exist(stack_name: str) -> bool:
    client = boto3_client("cloudformation")
    try:
        resp = client.describe_stacks(StackName=stack_name)
        if len(resp["Stacks"]) < 1:
            return False
    except botocore.exceptions.ClientError as ex:
        error = ex.response["Error"]
        if error["Code"] == "ValidationError" and f"Stack with id {stack_name} does not exist" in error["Message"]:
            return False
        raise
    return True


def _wait_for_changeset(changeset_id: str, stack_name: str) -> bool:
    waiter = boto3_client("cloudformation").get_waiter("change_set_create_complete")
    waiter_config: "WaiterConfigTypeDef" = {"Delay": 1}
    try:
        waiter.wait(ChangeSetName=changeset_id, StackName=stack_name, WaiterConfig=waiter_config)
    except botocore.exceptions.WaiterError as ex:
        resp = ex.last_response
        status = resp["Status"]
        reason = resp["StatusReason"]
        if (
            status == "FAILED"
            and "The submitted information didn't contain changes." in reason
            or "No updates are to be performed" in reason
        ):
            _logger.debug(f"No changes to {stack_name} CloudFormation stack.")
            return False
        raise RuntimeError(f"Failed to create the changeset: {ex}. Status: {status}. Reason: {reason}")
    return True


def _create_changeset(
    stack_name: str,
    template_str: str,
    parameters: Optional[List[Dict[str, str]]] = None,
    tags: Optional[List[Dict[str, str]]] = None,
) -> Tuple[str, str]:
    now = str(int(time.time()))
    description = f"Created by AWS DDK CLI at {now} UTC"
    changeset_name = CHANGESET_PREFIX + now
    changeset_type = "UPDATE" if does_stack_exist(stack_name=stack_name) else "CREATE"
    kwargs: Dict[str, Any] = {
        "ChangeSetName": changeset_name,
        "StackName": stack_name,
        "ChangeSetType": changeset_type,
        "Capabilities": ["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM"],
        "Description": description,
        "TemplateBody": template_str,
    }
    if parameters:
        kwargs["Parameters"] = parameters
    if tags:
        kwargs["Tags"] = tags
    resp = boto3_client("cloudformation").create_change_set(**kwargs)
    return str(resp["Id"]), changeset_type


def _execute_changeset(changeset_id: str, stack_name: str) -> None:
    boto3_client("cloudformation").execute_change_set(ChangeSetName=changeset_id, StackName=stack_name)


def _wait_for_execute(stack_name: str, changeset_type: str) -> None:
    waiter_config: "WaiterConfigTypeDef" = {
        "Delay": 5,
        "MaxAttempts": 480,
    }

    if changeset_type == "CREATE":
        create_waiter = boto3_client("cloudformation").get_waiter("stack_create_complete")
        create_waiter.wait(StackName=stack_name, WaiterConfig=waiter_config)
        return

    if changeset_type == "UPDATE":
        update_waiter = boto3_client("cloudformation").get_waiter("stack_update_complete")
        update_waiter.wait(StackName=stack_name, WaiterConfig=waiter_config)
        return

    raise RuntimeError(f"Invalid changeset type {changeset_type}")


def deploy_template(
    stack_name: str,
    file_name: str,
    parameters: Optional[List[Dict[str, str]]] = None,
    tags: Optional[List[Dict[str, str]]] = None,
) -> None:
    _logger.debug("Deploying template %s", file_name)
    if not os.path.isfile(file_name):
        raise FileNotFoundError(f"CloudFormation template not found at {file_name}")
    with open(file_name, "r") as handle:
        template_str = handle.read()
    changeset_id, changeset_type = _create_changeset(
        stack_name=stack_name, template_str=template_str, parameters=parameters, tags=tags
    )
    has_changes = _wait_for_changeset(changeset_id, stack_name)
    if has_changes:
        _execute_changeset(changeset_id=changeset_id, stack_name=stack_name)
        _wait_for_execute(stack_name=stack_name, changeset_type=changeset_type)


def destroy_stack(stack_name: str) -> None:
    _logger.debug("Destroying stack %s", stack_name)
    client = boto3_client("cloudformation")
    client.delete_stack(StackName=stack_name)
    waiter = client.get_waiter("stack_delete_complete")
    waiter.wait(StackName=stack_name, WaiterConfig={"Delay": 5, "MaxAttempts": 200})
