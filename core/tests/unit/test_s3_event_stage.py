# Copyright 2022 Amazon.com, Inc. or its affiliates
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

from aws_ddk_core.base import BaseStack
from aws_ddk_core.resources import S3Factory
from aws_ddk_core.stages import S3EventStage


def test_s3_event_stage_single_prefix(test_stack: BaseStack) -> None:
    prefix = "data"

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
        key_prefix=prefix,
    )

    assert [{"prefix": "data"}] == s3_event_stage.event_pattern.detail["object"]["key"]


def test_s3_event_stage_multiple_prefixes(test_stack: BaseStack) -> None:
    prefixes = ["data-0", "data-1", "data-2"]

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
        key_prefix=prefixes,
    )

    assert [{"prefix": key} for key in prefixes] == s3_event_stage.event_pattern.detail["object"]["key"]
