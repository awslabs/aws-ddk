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
from aws_ddk_core.resources import SNSFactory


def test_get_topic_default(test_stack: BaseStack) -> None:
    SNSFactory.topic(
        scope=test_stack,
        id="dummy-topic-1",
        environment_id="dev",
        topic_name="dummy-topic",
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::SNS::Topic",
        props={
            "TopicName": "dummy-topic",
        },
    )



def test_get_topic_hardcoded(test_stack: BaseStack) -> None:
    SNSFactory.topic(
        scope=test_stack,
        id="dummy-topic-2",
        environment_id="dev",
        topic_name="dummy-topic",
        display_name="DummyTopic"
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::SNS::Topic",
        props={
            "TopicName": "dummy-topic",
            "DisplayName": "DummyTopic"
        },
    )


def test_get_topic_fifo(test_stack: BaseStack) -> None:
    SNSFactory.topic(
        scope=test_stack,
        environment_id="dev",
        id="dummy-topic",
        fifo=True,
        content_based_deduplication=True
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::SNS::Topic",
        props={"TopicName": "dummystack-dummytopic-D1A70B8B.fifo", "FifoTopic": True, "ContentBasedDeduplication": True},
    )

    template.has_resource_properties(
        "AWS::SNS::TopicPolicy",
        props={},
    )
