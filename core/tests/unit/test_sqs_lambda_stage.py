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

import aws_cdk as cdk
import pytest
from aws_cdk.assertions import Match, Template
from aws_cdk.aws_lambda import Code, Function, LayerVersion, Runtime
from aws_cdk.aws_sqs import Queue
from aws_ddk_core.base import BaseStack
from aws_ddk_core.pipelines import DataPipeline
from aws_ddk_core.resources import S3Factory, SQSFactory
from aws_ddk_core.stages import S3EventStage, SqsToLambdaStage


def test_sqs_lambda(test_stack: BaseStack) -> None:
    SqsToLambdaStage(
        scope=test_stack,
        id="dummy-sqs-lambda",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
        layers=[
            LayerVersion.from_layer_version_arn(
                test_stack,
                "layer",
                "arn:aws:lambda:us-east-1:222222222222:layer:dummy:1",
            )
        ],
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Lambda::Function",
        props={
            "Runtime": "python3.9",
            "MemorySize": 512,
            "Layers": Match.array_with(
                pattern=[
                    "arn:aws:lambda:us-east-1:222222222222:layer:dummy:1",
                ],
            ),
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


def test_sqs_lambda_with_existing_queue(test_stack: BaseStack) -> None:
    SqsToLambdaStage(
        scope=test_stack,
        id="dummy-sqs-lambda",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
        sqs_queue=Queue(test_stack, "custom-queue", queue_name="custom-queue"),
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
            "QueueName": "custom-queue",
        },
    )


def test_sqs_lambda_with_existing_function(test_stack: BaseStack) -> None:
    SqsToLambdaStage(
        scope=test_stack,
        id="dummy-sqs-lambda",
        environment_id="dev",
        lambda_function=Function(
            test_stack,
            "custom-function",
            runtime=Runtime.PYTHON_3_8,
            handler="commons.handlers.lambda_handler",
            code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        ),
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Lambda::Function",
        props={
            "Runtime": "python3.8",
        },
    )
    template.has_resource_properties(
        "AWS::SQS::Queue",
        props={
            "VisibilityTimeout": 120,
        },
    )


def test_sqs_lambda_alarm(test_stack: BaseStack) -> None:
    SqsToLambdaStage(
        scope=test_stack,
        id="dummy-sqs-lambda",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
        lambda_function_errors_alarm_threshold=10,
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
        "AWS::CloudWatch::Alarm",
        props={
            "Dimensions": Match.array_with(
                pattern=[
                    Match.object_like(
                        pattern={
                            "Name": "FunctionName",
                            "Value": {"Ref": "dummysqslambdadummysqslambdafunction6E0AB03E"},
                        }
                    )
                ]
            ),
            "Threshold": 10,
        },
    )


def test_sqs_lambda_with_additional_function_props(test_stack: BaseStack) -> None:
    SqsToLambdaStage(
        scope=test_stack,
        id="dummy-sqs-lambda",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
        layers=[
            LayerVersion.from_layer_version_arn(
                test_stack,
                "layer",
                "arn:aws:lambda:us-east-1:222222222222:layer:dummy:1",
            )
        ],
        function_props={"profiling": True},
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Lambda::Function",
        props={
            "Runtime": "python3.9",
            "MemorySize": 512,
            "Layers": Match.array_with(
                pattern=[
                    "arn:aws:lambda:us-east-1:222222222222:layer:dummy:1",
                ],
            ),
            "Environment": {
                "Variables": {
                    "AWS_CODEGURU_PROFILER_GROUP_ARN": {
                        "Fn::GetAtt": [
                            "dummysqslambdadummysqslambdafunctionProfilingGroup993A85CA",
                            "Arn",
                        ]
                    },
                    "AWS_CODEGURU_PROFILER_ENABLED": "TRUE",
                    "EVENT_SOURCE": "dummy-sqs-lambda-event-source",
                    "EVENT_DETAIL_TYPE": "dummy-sqs-lambda-event-type",
                }
            },
        },
    )


def test_sqs_lambda_batching(test_stack: BaseStack) -> None:
    SqsToLambdaStage(
        scope=test_stack,
        id="dummy-sqs-lambda",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
        batch_size=100,
        max_batching_window=cdk.Duration.minutes(3),
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
        "AWS::Lambda::EventSourceMapping",
        props={
            "BatchSize": 100,
            "MaximumBatchingWindowInSeconds": 180,
        },
    )


def test_sqs_lambda_fifo(test_stack: BaseStack) -> None:

    bucket = S3Factory.bucket(
        scope=test_stack,
        id="dummy-bucket",
        environment_id="dev",
    )

    s3_event_stage = S3EventStage(
        scope=test_stack,
        id="dummy-s3-event",
        environment_id="dev",
        event_names=["Object Created"],
        bucket_name=bucket.bucket_name,
    )

    sqs_lambda_stage = SqsToLambdaStage(
        scope=test_stack,
        id="dummy-sqs-lambda",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
        sqs_queue=SQSFactory.queue(
            scope=test_stack,
            environment_id="dev",
            id="dummy-queue",
            queue_name="dummy-queue.fifo",
        ),
        message_group_id="dummy-group",
    )

    DataPipeline(scope=test_stack, id="dummy-pipeline").add_stage(s3_event_stage).add_stage(sqs_lambda_stage)

    template = Template.from_stack(test_stack)

    template.has_resource_properties(
        "AWS::SQS::Queue",
        props={"QueueName": "dummy-queue.fifo", "FifoQueue": True},
    )
    template.has_resource_properties(
        "AWS::Events::Rule",
        props={
            "Targets": [
                {
                    "Arn": {"Fn::GetAtt": ["dummyqueue43F4223D", "Arn"]},
                    "Id": "Target0",
                    "SqsParameters": {"MessageGroupId": "dummy-group"},
                }
            ]
        },
    )


def test_invalid_arguments(test_stack: BaseStack) -> None:
    with pytest.raises(Exception):
        SqsToLambdaStage(
            scope=test_stack,
            id="dummy-sqs-lambda-0",
            environment_id="dev",
            code=Code.from_asset(f"{Path(__file__).parents[2]}"),
            handler="commons.handlers.lambda_handler",
            sqs_queue=SQSFactory.queue(
                scope=test_stack,
                environment_id="dev",
                id="dummy-queue-0",
                queue_name="dummy-queue.fifo",
            ),
        )
    with pytest.raises(ValueError):
        SqsToLambdaStage(
            scope=test_stack,
            id="dummy-sqs-lambda-1",
            environment_id="dev",
            sqs_queue=SQSFactory.queue(
                scope=test_stack,
                environment_id="dev",
                id="dummy-queue-1",
                queue_name="dummy-queue",
            ),
        )


def test_sqs_lambda_name_override(test_stack: BaseStack) -> None:
    SqsToLambdaStage(
        scope=test_stack,
        id="dummy-sqs-lambda",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
        queue_props={"queue_name": "foobar"},
        function_props={"function_name": "foobar"},
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Lambda::Function",
        props={
            "FunctionName": "foobar",
        },
    )
    template.has_resource_properties(
        "AWS::SQS::Queue",
        props={
            "QueueName": "foobar",
        },
    )
