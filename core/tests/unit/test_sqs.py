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

import aws_cdk.aws_sqs as sqs
from aws_cdk.assertions import Template
from aws_ddk_core.base import BaseStack
from aws_ddk_core.resources import SQSFactory


def test_get_queue_default(test_stack: BaseStack) -> None:
    SQSFactory.queue(
        scope=test_stack,
        id="dummy-queue-1",
        environment_id="dev",
        queue_name="dummy-queue",
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::SQS::Queue",
        props={
            "QueueName": "dummy-queue",
        },
    )


def test_get_queue_config(test_stack: BaseStack) -> None:
    SQSFactory.queue(
        scope=test_stack,
        id="dummy-queue-2",
        environment_id="dev",
        queue_name="dummy-queue",
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::SQS::Queue",
        props={
            "QueueName": "dummy-queue",
            "VisibilityTimeout": 30,
            "MessageRetentionPeriod": 3600,
            "DelaySeconds": 15,
        },
    )


def test_get_queue_hardcoded(test_stack: BaseStack) -> None:
    SQSFactory.queue(
        scope=test_stack,
        id="dummy-queue-2",
        environment_id="dev",
        queue_name="dummy-queue",
        encryption=sqs.QueueEncryption.KMS,
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::SQS::Queue",
        props={
            "QueueName": "dummy-queue",
            "VisibilityTimeout": 30,
            "KmsMasterKeyId": {
                "Fn::GetAtt": ["dummyqueue2KeyE1608246", "Arn"],
            },
        },
    )


def test_get_queue_fifo(test_stack: BaseStack) -> None:
    SQSFactory.queue(
        scope=test_stack,
        environment_id="dev",
        id="dummy-queue",
        queue_name="dummy-queue.fifo",
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::SQS::Queue",
        props={"QueueName": "dummy-queue.fifo", "FifoQueue": True},
    )

    template.has_resource_properties(
        "AWS::SQS::QueuePolicy",
        props={},
    )
