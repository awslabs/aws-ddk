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

import aws_cdk.aws_s3 as s3
from aws_cdk.assertions import Match, Template
from aws_ddk_core.base import BaseStack
from aws_ddk_core.resources import S3Factory


def test_get_bucket_default(test_stack: BaseStack) -> None:
    S3Factory.bucket(
        scope=test_stack,
        id="dummy-bucket-1",
        environment_id="dev",
        bucket_name="my-dummy-bucket",
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::S3::Bucket",
        props={
            "BucketName": "my-dummy-bucket",
            "VersioningConfiguration": {"Status": "Enabled"},
            "AccessControl": "BucketOwnerFullControl",
            "BucketEncryption": Match.object_like(
                pattern={
                    "ServerSideEncryptionConfiguration": [
                        {"ServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}
                    ],
                }
            ),
        },
    )


def test_get_bucket_config(test_stack: BaseStack) -> None:
    S3Factory.bucket(
        scope=test_stack,
        id="dummy-bucket-2",
        environment_id="dev",
        bucket_name="my-dummy-bucket",
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::S3::Bucket",
        props={
            "BucketName": "my-dummy-bucket",
            "AccessControl": "PublicReadWrite",
        },
    )


def test_get_bucket_hardcoded(test_stack: BaseStack) -> None:
    S3Factory.bucket(
        scope=test_stack,
        id="dummy-bucket-2",
        environment_id="dev",
        bucket_name="my-dummy-bucket",
        versioned=True,
        access_control=s3.BucketAccessControl.PRIVATE,
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::S3::Bucket",
        props={
            "BucketName": "my-dummy-bucket",
            "VersioningConfiguration": {"Status": "Enabled"},
            "AccessControl": "Private",
        },
    )
