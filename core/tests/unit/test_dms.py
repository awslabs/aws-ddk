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
import aws_cdk.aws_dms as dms
from aws_ddk_core.base import BaseStack
from aws_ddk_core.resources import DMSFactory, S3Factory


def test_s3_source_endpoint(test_stack: BaseStack) -> None:

    bucket = S3Factory.bucket(
        scope=test_stack,
        id="dummy-bucket-1",
        environment_id="dev",
        bucket_name="my-dummy-bucket",
    )

    DMSFactory.endpoint(
        scope=test_stack,
        id="dummy-stream-1",
        environment_id="dev",
        endpoint_type="source",
        engine_name="s3",
        s3_settings=dms.CfnEndpoint.S3SettingsProperty(
            bucket_name=bucket.name,
        ),
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::DMS::Endpoint",
        props={
            "DeliveryStreamName": "dummy-stream"
        },
    )
