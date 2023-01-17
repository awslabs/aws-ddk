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
from aws_ddk_core.base import BaseStack
from aws_ddk_core.stages import AppFlowIngestionStage


def test_appflow_stage_simple(test_stack: BaseStack) -> None:
    AppFlowIngestionStage(
        scope=test_stack,
        id="dummy-appflow",
        environment_id="dev",
        flow_name="dummy-appflow-flow",
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Lambda::Function",
        props={
            "Runtime": "python3.9",
            "Handler": "lambda_function.lambda_handler",
        },
    )
    template.has_resource_properties(
        "AWS::StepFunctions::StateMachine",
        props={
            "DefinitionString": {
                "Fn::Join": [
                    "",
                    Match.array_with(
                        pattern=[
                            Match.string_like_regexp(pattern="start-flow-execution"),
                            Match.string_like_regexp(pattern="check-flow-execution-status"),
                        ]
                    ),
                ]
            }
        },
    )
    template.has_resource_properties(
        "AWS::CloudWatch::Alarm",
        props={
            "ComparisonOperator": "GreaterThanThreshold",
            "EvaluationPeriods": 1,
            "MetricName": "ExecutionsFailed",
            "Namespace": "AWS/States",
            "Period": 300,
            "Statistic": "Sum",
            "Threshold": 1,
        },
    )


def test_appflow_stage_additional_args(test_stack: BaseStack) -> None:
    AppFlowIngestionStage(
        scope=test_stack,
        id="dummy-appflow",
        environment_id="dev",
        flow_name="dummy-appflow-flow",
        state_machine_args={"state_machine_name": "dummy-sfn"},
        alarms_enabled=False,
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::StepFunctions::StateMachine",
        props={
            "StateMachineName": "dummy-sfn",
        },
    )

    template.resource_properties_count_is(
        "AWS::CloudWatch::Alarm",
        props={},
        count=0,
    )
