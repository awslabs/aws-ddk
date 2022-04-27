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
import json

from aws_cdk.assertions import Template
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
        id="dummy-endpoint-1",
        environment_id="dev",
        endpoint_type="source",
        engine_name="s3",
        s3_settings=DMSFactory.endpoint_settings_s3(
            scope=test_stack, id="dummy-endpoint-settings", environment_id="dev", bucket_name=bucket.bucket_name
        ),
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::DMS::Endpoint",
        props={
            "EndpointType": "source",
            "EngineName": "s3",
            "S3Settings": {"BucketName": {"Ref": "dummybucket12E106EF4"}},
        },
    )


def test_s3_target_endpoint(test_stack: BaseStack) -> None:

    bucket = S3Factory.bucket(
        scope=test_stack,
        id="dummy-bucket-1",
        environment_id="dev",
        bucket_name="my-dummy-bucket",
    )

    DMSFactory.endpoint(
        scope=test_stack,
        id="dummy-endpoint-1",
        environment_id="dev",
        endpoint_type="target",
        engine_name="s3",
        s3_settings=DMSFactory.endpoint_settings_s3(
            scope=test_stack, id="dummy-endpoint-settings", environment_id="dev", bucket_name=bucket.bucket_name
        ),
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::DMS::Endpoint",
        props={
            "EndpointType": "target",
            "EngineName": "s3",
            "S3Settings": {"BucketName": {"Ref": "dummybucket12E106EF4"}},
        },
    )


def test_s3_to_s3_replication(test_stack: BaseStack) -> None:

    source_bucket = S3Factory.bucket(
        scope=test_stack,
        id="dummy-source-bucket-1",
        environment_id="dev",
        bucket_name="my-dummy-source-bucket",
    )

    target_bucket = S3Factory.bucket(
        scope=test_stack,
        id="dummy-target-bucket-1",
        environment_id="dev",
        bucket_name="my-dummy-target-bucket",
    )

    source_endpoint = DMSFactory.endpoint(
        scope=test_stack,
        id="dummy-endpoint-source",
        environment_id="dev",
        endpoint_type="source",
        engine_name="s3",
        s3_settings=DMSFactory.endpoint_settings_s3(
            scope=test_stack,
            id="dummy-endpoint-settings-source",
            environment_id="dev",
            bucket_name=source_bucket.bucket_name,
        ),
    )

    target_endpoint = DMSFactory.endpoint(
        scope=test_stack,
        id="dummy-endpoint-target",
        environment_id="dev",
        endpoint_type="target",
        engine_name="s3",
        s3_settings=DMSFactory.endpoint_settings_s3(
            scope=test_stack,
            id="dummy-endpoint-settings-target",
            environment_id="dev",
            bucket_name=target_bucket.bucket_name,
        ),
    )

    replication_instance = DMSFactory.replication_instance(
        scope=test_stack,
        id="dummy-replication-instance-1",
        environment_id="dev",
        replication_instance_class="dms.c5.large",
    )

    DMSFactory.replication_task(
        scope=test_stack,
        id="dummy-replication-task-1",
        environment_id="dev",
        replication_instance_arn=replication_instance.get_att("Arn").to_string(),
        source_endpoint_arn=source_endpoint.get_att("Arn").to_string(),
        target_endpoint_arn=target_endpoint.get_att("Arn").to_string(),
        table_mappings=json.dumps(
            {
                "rules": [
                    {
                        "rule-type": "selection",
                        "rule-id": "1",
                        "rule-name": "1",
                        "object-locator": {"schema-name": "Test", "table-name": "%"},
                        "rule-action": "include",
                    }
                ]
            },
        ),
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::DMS::Endpoint",
        props={
            "EndpointType": "target",
            "EngineName": "s3",
            "S3Settings": {
                "BucketName": {"Ref": "dummytargetbucket12A8F7644"},
                "ServiceAccessRoleArn": {"Fn::GetAtt": ["dummyendpointsettingstargetdmsserviceroleC9A6554B", "Arn"]},
            },
        },
    )
    template.has_resource_properties(
        "AWS::DMS::Endpoint",
        props={
            "EndpointType": "source",
            "EngineName": "s3",
            "S3Settings": {
                "BucketName": {"Ref": "dummysourcebucket15026EFCD"},
                "ServiceAccessRoleArn": {"Fn::GetAtt": ["dummyendpointsettingssourcedmsservicerole5F6AADCD", "Arn"]},
            },
        },
    )
    template.has_resource_properties(
        "AWS::DMS::ReplicationInstance",
        props={
            "ReplicationInstanceClass": "dms.c5.large",
        },
    )
    template.has_resource_properties(
        "AWS::DMS::ReplicationTask",
        props={
            "ReplicationInstanceArn": {"Fn::GetAtt": ["dummyreplicationinstance1", "Arn"]},
            "SourceEndpointArn": {"Fn::GetAtt": ["dummyendpointsource", "Arn"]},
            "TargetEndpointArn": {"Fn::GetAtt": ["dummyendpointtarget", "Arn"]},
        },
    )
