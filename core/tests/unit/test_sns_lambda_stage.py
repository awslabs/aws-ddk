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

import pytest
from aws_cdk.assertions import Match, Template
from aws_cdk.aws_lambda import Code, Function, LayerVersion, Runtime
from aws_cdk.aws_sns import Topic
from aws_ddk_core.base import BaseStack
from aws_ddk_core.pipelines import DataPipeline
from aws_ddk_core.resources import S3Factory, SNSFactory
from aws_ddk_core.stages import S3EventStage, SnsToLambdaStage


def test_sns_lambda(test_stack: BaseStack) -> None:
    SnsToLambdaStage(
        scope=test_stack,
        id="dummy-sns-lambda",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
        topic_name="dummy-topic",
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
            "MemorySize": 256,
            "Layers": Match.array_with(
                pattern=[
                    "arn:aws:lambda:us-east-1:222222222222:layer:dummy:1",
                ],
            ),
        },
    )
    template.has_resource_properties(
        "AWS::SNS::Topic",
        props={
            "TopicName": "dummy-topic",
        },
    )


def test_sns_lambda_with_existing_topic(test_stack: BaseStack) -> None:
    SnsToLambdaStage(
        scope=test_stack,
        id="dummy-sns-lambda",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
        sns_topic=Topic(test_stack, "custom-topic"),
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Lambda::Function",
        props={
            "Runtime": "python3.9",
            "MemorySize": 256,
        },
    )
    template.has_resource_properties(
        "AWS::SNS::Topic",
        props={},
    )


def test_sns_lambda_with_existing_function(test_stack: BaseStack) -> None:
    SnsToLambdaStage(
        scope=test_stack,
        id="dummy-sns-lambda",
        environment_id="dev",
        topic_name="dummy-topic",
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
        "AWS::SNS::Topic",
        props={
            "TopicName": "dummy-topic",
        },
    )


def test_sns_lambda_alarm(test_stack: BaseStack) -> None:
    SnsToLambdaStage(
        scope=test_stack,
        id="dummy-sns-lambda",
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
            "MemorySize": 256,
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
                            "Value": {
                                "Ref": "dummysnslambdadummysnslambdafunction29FD977D"
                            },
                        }
                    )
                ]
            ),
            "Threshold": 10,
        },
    )


def test_sns_lambda_with_additional_function_props(test_stack: BaseStack) -> None:
    SnsToLambdaStage(
        scope=test_stack,
        id="dummy-sns-lambda",
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
            "MemorySize": 256,
            "Layers": Match.array_with(
                pattern=[
                    "arn:aws:lambda:us-east-1:222222222222:layer:dummy:1",
                ],
            ),
            "Environment": {
                "Variables": {
                    "AWS_CODEGURU_PROFILER_GROUP_ARN": {
                        "Fn::GetAtt": [
                            "dummysnslambdadummysnslambdafunctionProfilingGroupDA4E5CD5",
                            "Arn",
                        ]
                    },
                    "AWS_CODEGURU_PROFILER_ENABLED": "TRUE",
                    "EVENT_SOURCE": "dummy-sns-lambda-event-source",
                    "EVENT_DETAIL_TYPE": "dummy-sns-lambda-event-type",
                }
            },
        },
    )


def test_sns_lambda_fifo(test_stack: BaseStack) -> None:

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

    sns_lambda_stage = SnsToLambdaStage(
        scope=test_stack,
        id="dummy-sns-lambda",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
        sns_topic=SNSFactory.topic(
            scope=test_stack,
            environment_id="dev",
            id="dummy-topic",
            fifo=True,
        ),
    )

    DataPipeline(scope=test_stack, id="dummy-pipeline").add_stage(
        s3_event_stage
    ).add_stage(sns_lambda_stage)

    template = Template.from_stack(test_stack)

    template.has_resource_properties(
        "AWS::SNS::Topic",
        props={"TopicName": "dummystack-dummytopic-D1A70B8B.fifo", "FifoTopic": True},
    )
    template.has_resource_properties(
        "AWS::Events::Rule",
        props={"Targets": [{"Arn": {"Ref": "dummytopicDBE00BF1"}, "Id": "Target0"}]},
    )


def test_invalid_arguments(test_stack: BaseStack) -> None:
    with pytest.raises(Exception):
        SnsToLambdaStage(
            scope=test_stack,
            id="dummy-sns-lambda-0",
            environment_id="dev",
            code=Code.from_asset(f"{Path(__file__).parents[2]}"),
            handler="commons.handlers.lambda_handler",
            fifo=True,
            sns_topic=SNSFactory.topic(
                scope=test_stack,
                environment_id="dev",
                id="dummy-topic-0",
                topic_name="dummy-topic",
            ),
        )
    with pytest.raises(ValueError):
        SnsToLambdaStage(
            scope=test_stack,
            id="dummy-sns-lambda-1",
            environment_id="dev",
            sns_topic=SNSFactory.topic(
                scope=test_stack,
                environment_id="dev",
                id="dummy-topic-1",
                topic_name="dummy-topic",
                fifo=True,
            ),
        )


def test_sns_lambda_name_override(test_stack: BaseStack) -> None:
    SnsToLambdaStage(
        scope=test_stack,
        id="dummy-sns-lambda",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
        topic_name="foobar",
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
        "AWS::SNS::Topic",
        props={
            "TopicName": "foobar",
        },
    )
