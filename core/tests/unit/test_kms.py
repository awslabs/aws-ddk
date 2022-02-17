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

from aws_cdk.assertions import Template
from aws_ddk_core.base import BaseStack
from aws_ddk_core.resources import KMSFactory


def test_get_key_simple(test_stack: BaseStack) -> None:
    KMSFactory.key(
        scope=test_stack,
        environment_id="dev",
        id="dummy-key-1",
        alias="dummy-alias",
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::KMS::Key",
        props={
            "EnableKeyRotation": True,
        },
    )
    template.has_resource_properties(
        "AWS::KMS::Alias",
        props={
            "AliasName": "alias/dummy-alias",
        },
    )


def test_get_key_config(test_stack: BaseStack) -> None:
    KMSFactory.key(
        scope=test_stack,
        environment_id="dev",
        id="dummy-key-2",
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::KMS::Key",
        props={
            "EnableKeyRotation": False,
        },
    )


def test_get_key_hardcoded(test_stack: BaseStack) -> None:
    KMSFactory.key(
        scope=test_stack,
        environment_id="dev",
        id="dummy-key-3",
        enable_key_rotation=False,
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::KMS::Key",
        props={
            "EnableKeyRotation": False,
        },
    )


def test_get_key_additional_props(test_stack: BaseStack) -> None:
    KMSFactory.key(
        scope=test_stack,
        environment_id="dev",
        id="dummy-key-4",
        enabled=False,
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::KMS::Key",
        props={
            "Enabled": False,
        },
    )
