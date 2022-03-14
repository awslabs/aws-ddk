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

from aws_cdk.assertions import Match, Template
from aws_cdk.aws_stepfunctions import Pass, StateMachineType
from aws_ddk_core.base import BaseStack
from aws_ddk_core.pipelines import StateMachineStage


def test_sfn_stage(test_stack: BaseStack) -> None:

    StateMachineStage(scope=test_stack, id="dummy-sfn-stage", name="dummy-sfn-stage",).create_state_machine(
        "dummy-state-machine",
        environment_id="dev",
        definition=Pass(test_stack, "StartState"),
        state_machine_type=StateMachineType.STANDARD,
        add_output_event_task=False,
    ).create_notification(id="dummy-sfn-notification", environment_id="dev")

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::StepFunctions::StateMachine",
        props={},
    )
    template.has_resource_properties(
        "AWS::Events::Rule",
        props={
            "EventPattern": Match.object_like(
                pattern={
                    "detail": {
                        "status": ["FAILED", "TIMED_OUT"],
                        "stateMachineArn": [{"Ref": "dummysfnstagedummystatemachineE52EC94F"}],
                    },
                    "detail-type": ["Step Functions Execution Status Change"],
                    "source": ["aws.states"],
                }
            ),
            "Targets": Match.array_with(
                pattern=[
                    Match.object_like(
                        pattern={
                            "Arn": {"Ref": "dummysfnstagedummysfnnotificationdevnotifications6BF6A6BE"},
                            "Id": "Target0",
                        }
                    )
                ]
            ),
        },
    )
