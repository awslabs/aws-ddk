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
from aws_ddk_core.resources import FirehoseFactory, S3Factory


def test_get_queue_default(test_stack: BaseStack) -> None:

    bucket = S3Factory.bucket(
        scope=test_stack,
        id="dummy-bucket-1",
        environment_id="dev",
        bucket_name="my-dummy-bucket",
    )

    FirehoseFactory.firehose(
        scope=test_stack,
        id="dummy-stream-1",
        environment_id="dev",
        delivery_stream_name="dummy-stream",
        s3_destination_bucket=bucket,
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::KinesisFirehose::DeliveryStream",
        props={
            "DeliveryStreamName": "dummy-stream",
        },
    )
