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

from pathlib import Path

from aws_cdk.assertions import Template
from aws_cdk.aws_lambda import Code
from aws_ddk_core.base import BaseStack
from aws_ddk_core.pipelines import Pipeline
from aws_ddk_core.resources import S3Factory
from aws_ddk_core.stages import S3EventStage, SqsToLambdaStage


def test_basic_pipeline(test_stack: BaseStack) -> None:
    bucket = S3Factory.bucket(
        scope=test_stack,
        id="dummy-bucket",
        environment_id="dev",
    )

    s3_event_stage = S3EventStage(
        scope=test_stack,
        id="dummy-s3-event",
        environment_id="dev",
        event_names=["CopyObject", "PutObject"],
        bucket_name=bucket.bucket_name,
    )
    sqs_lambda_stage = SqsToLambdaStage(
        scope=test_stack,
        id="dummy-sqs-lambda",
        environment_id="dev",
        code=Code.from_asset(f"{Path(__file__).parents[2]}"),
        handler="commons.handlers.lambda_handler",
    )
    bucket.grant_read_write(sqs_lambda_stage.function)

    Pipeline(scope=test_stack, id="dummy-pipeline").add_stage(s3_event_stage).add_stage(sqs_lambda_stage)

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Events::Rule",
        props={
            "Targets": [{"Arn": {"Fn::GetAtt": ["dummysqslambdadummysqslambdaqueue97906E01", "Arn"]}, "Id": "Target0"}],
        },
    )
    template.has_resource_properties(
        "AWS::CloudTrail::Trail",
        props={
            "S3BucketName": {"Ref": "dummys3eventdummys3eventtrailbucket09B92664"},
        },
    )
