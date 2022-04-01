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
from aws_ddk_core.base import BaseStack
from aws_ddk_core.resources import KinesisFactory, S3Factory
from aws_ddk_core.stages.firehose_s3 import FirehoseS3Stage


def test_firehose_s3(test_stack: BaseStack) -> None:

    FirehoseS3Stage(
        scope=test_stack,
        id="dummy-firehose-s3",
        environment_id="dev",
        bucket_name="dummy-bucket",
        delivery_stream_name="dummy-firehose-stream",
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::S3::Bucket",
        props={
            "BucketName": "dummy-bucket",
        },
    )
    template.has_resource_properties(
        "AWS::KinesisFirehose::DeliveryStream",
        props={
            "DeliveryStreamName": "dummy-firehose-stream",
            "ExtendedS3DestinationConfiguration": Match.object_like(
                pattern={
                    "BucketARN": Match.object_like(
                        pattern={
                            "Fn::GetAtt": Match.array_with(
                                pattern=["dummyfirehoses3dummyfirehoses3bucketE9003BFA", "Arn"]
                            )
                        }
                    )
                }
            ),
        },
    )
    template.has_resource_properties(
        "AWS::CloudWatch::Alarm",
        props={
            "MetricName": "DeliveryToS3.DataFreshness",
            "Dimensions": Match.array_with(
                pattern=[
                    Match.object_like(
                        pattern={
                            "Name": "DeliveryStreamName",
                            "Value": Match.object_like(
                                pattern={"Ref": "dummyfirehoses3dummyfirehoses3firehosestream5F036D68"}
                            ),
                        }
                    )
                ]
            ),
        },
    )


def test_firehose_s3_with_data_stream(test_stack: BaseStack) -> None:

    FirehoseS3Stage(
        scope=test_stack,
        id="dummy-firehose-s3",
        environment_id="dev",
        bucket_name="dummy-bucket",
        delivery_stream_name="dummy-firehose-stream",
        enable_data_stream=True,
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::S3::Bucket",
        props={
            "BucketName": "dummy-bucket",
        },
    )
    template.has_resource_properties(
        "AWS::KinesisFirehose::DeliveryStream",
        props={
            "DeliveryStreamName": "dummy-firehose-stream",
            "ExtendedS3DestinationConfiguration": Match.object_like(
                pattern={
                    "BucketARN": Match.object_like(
                        pattern={
                            "Fn::GetAtt": Match.array_with(
                                pattern=["dummyfirehoses3dummyfirehoses3bucketE9003BFA", "Arn"]
                            )
                        }
                    )
                }
            ),
        },
    )
    template.has_resource_properties(
        "AWS::Kinesis::Stream",
        props={},
    )


def test_firehose_s3_existing_data_stream(test_stack: BaseStack) -> None:

    FirehoseS3Stage(
        scope=test_stack,
        id="dummy-firehose-s3",
        environment_id="dev",
        bucket_name="dummy-bucket",
        data_stream=KinesisFactory.data_stream(
            scope=test_stack, id="dummy-stream-1", environment_id="dev", stream_name="dummy-stream"
        ),
        delivery_stream_name="dummy-firehose-stream",
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::S3::Bucket",
        props={
            "BucketName": "dummy-bucket",
        },
    )
    template.has_resource_properties(
        "AWS::KinesisFirehose::DeliveryStream",
        props={
            "DeliveryStreamName": "dummy-firehose-stream",
            "ExtendedS3DestinationConfiguration": Match.object_like(
                pattern={
                    "BucketARN": Match.object_like(
                        pattern={
                            "Fn::GetAtt": Match.array_with(
                                pattern=["dummyfirehoses3dummyfirehoses3bucketE9003BFA", "Arn"]
                            )
                        }
                    )
                }
            ),
        },
    )
    template.has_resource_properties(
        "AWS::Kinesis::Stream",
        props={
            "Name": "dummy-stream",
        },
    )


def test_firehose_s3_existing_bucket(test_stack: BaseStack) -> None:
    bucket = S3Factory.bucket(
        scope=test_stack,
        id="dummy-bucket-1",
        environment_id="dev",
        bucket_name="my-dummy-bucket",
    )

    FirehoseS3Stage(
        scope=test_stack,
        id="dummy-firehose-s3",
        environment_id="dev",
        bucket=bucket,
        delivery_stream_name="dummy-firehose-stream",
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::S3::Bucket",
        props={
            "BucketName": "my-dummy-bucket",
        },
    )
    template.has_resource_properties(
        "AWS::KinesisFirehose::DeliveryStream",
        props={
            "DeliveryStreamName": "dummy-firehose-stream",
            "ExtendedS3DestinationConfiguration": Match.object_like(
                pattern={
                    "BucketARN": Match.object_like(
                        pattern={"Fn::GetAtt": Match.array_with(pattern=["dummybucket12E106EF4", "Arn"])}
                    )
                }
            ),
        },
    )
