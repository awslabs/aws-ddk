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
from aws_ddk_core.resources import KinesisStreamsFactory


def test_data_stream(test_stack: BaseStack) -> None:

    KinesisStreamsFactory.data_stream(
        scope=test_stack, id="dummy-stream-1", environment_id="dev", stream_name="dummy-stream"
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Kinesis::Stream",
        props={
            "Name": "dummy-stream",
        },
    )
