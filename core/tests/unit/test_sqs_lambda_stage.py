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

from pathlib import Path

from aws_cdk.assertions import Template
from aws_cdk.aws_lambda import Code
from aws_ddk_core.base import BaseStack
from aws_ddk_core.stages.sqs_lambda import SqsToLambdaStage


def test_sqs_lambda(test_stack: BaseStack) -> None:
    SqsToLambdaStage(
        scope=test_stack,
        id="dummy-sqs-lambda",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Lambda::Function",
        props={
            "Runtime": "python3.9",
            "MemorySize": 512,
        },
    )
    template.has_resource_properties(
        "AWS::SQS::Queue",
        props={
            "VisibilityTimeout": 120,
        },
    )


def test_sqs_lambda_event_source(test_stack: BaseStack) -> None:
    SqsToLambdaStage(
        scope=test_stack,
        id="dummy-sqs-lambda-event",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
        dead_letter_queue_enabled=True,
        batch_size=5,
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Lambda::EventSourceMapping",
        props={
            "BatchSize": 5,
        },
    )
    template.has_resource_properties(
        "AWS::SQS::Queue",
        props={
            "DelaySeconds": 15,
        },
    )
