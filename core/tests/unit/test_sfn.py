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

import aws_cdk.aws_stepfunctions as sfn
from aws_cdk import Duration
from aws_cdk.assertions import Match, Template
from aws_ddk_core.base import BaseStack
from aws_ddk_core.resources import StepFunctionsFactory


def test_get_sfn_default(test_stack: BaseStack) -> None:
    StepFunctionsFactory.state_machine(
        scope=test_stack,
        id="dummy-sfn-1",
        environment_id="dev",
        state_machine_name="dummy-sfn-1",
        definition=sfn.Succeed(test_stack, "success"),
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::StepFunctions::StateMachine",
        props={
            "StateMachineName": "dummy-sfn-1",
        },
    )


def test_get_sfn_config(test_stack: BaseStack) -> None:
    StepFunctionsFactory.state_machine(
        scope=test_stack,
        id="dummy-sfn-2",
        environment_id="dev",
        state_machine_name="dummy-sfn-2",
        definition=sfn.Succeed(test_stack, "success"),
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::StepFunctions::StateMachine",
        props={
            "StateMachineName": "dummy-sfn-2",
            "StateMachineType": "EXPRESS",
            "TracingConfiguration": {
                "Enabled": True,
            },
            "DefinitionString": Match.string_like_regexp('"TimeoutSeconds":28800'),
        },
    )


def test_get_sfn_hardcoded(test_stack: BaseStack) -> None:
    StepFunctionsFactory.state_machine(
        scope=test_stack,
        id="dummy-sfn-2",
        environment_id="dev",
        state_machine_name="dummy-sfn-2",
        state_machine_type=sfn.StateMachineType.EXPRESS,
        tracing_enabled=True,
        timeout=Duration.hours(8),
        definition=sfn.Succeed(test_stack, "success"),
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::StepFunctions::StateMachine",
        props={
            "StateMachineName": "dummy-sfn-2",
            "StateMachineType": "EXPRESS",
            "TracingConfiguration": {
                "Enabled": True,
            },
            "DefinitionString": Match.string_like_regexp('"TimeoutSeconds":28800'),
        },
    )
