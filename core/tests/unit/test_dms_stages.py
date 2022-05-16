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
from aws_ddk_core.resources import S3Factory
from aws_ddk_core.stages.dms_s3_to_s3 import DMSS3ToS3Stage


def test_s3_to_s3(test_stack: BaseStack) -> None:

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

    external_table_definition = {
        "TableCount": "1",
        "Tables": [
            {
                "TableName": "employee",
                "TablePath": "hr/employee/",
                "TableOwner": "hr",
                "TableColumns": [
                    {"ColumnName": "Id", "ColumnType": "INT8", "ColumnNullable": "false", "ColumnIsPk": "true"},
                    {"ColumnName": "LastName", "ColumnType": "STRING", "ColumnLength": "20"},
                    {"ColumnName": "FirstName", "ColumnType": "STRING", "ColumnLength": "30"},
                    {"ColumnName": "HireDate", "ColumnType": "DATETIME"},
                    {"ColumnName": "OfficeLocation", "ColumnType": "STRING", "ColumnLength": "20"},
                ],
                "TableColumnsTotal": "5",
            }
        ],
    }

    DMSS3ToS3Stage(
        scope=test_stack,
        id="dummy",
        environment_id="dev",
        source_bucket=source_bucket,
        target_bucket=target_bucket,
        external_table_definition=json.dumps(external_table_definition),
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::DMS::Endpoint",
        props={
            "EndpointType": "target",
            "EngineName": "s3",
            "S3Settings": {"BucketName": {"Ref": "dummytargetbucket12A8F7644"}},
        },
    )
    template.has_resource_properties(
        "AWS::DMS::Endpoint",
        props={
            "EndpointType": "source",
            "EngineName": "s3",
            "S3Settings": {"BucketName": {"Ref": "dummysourcebucket15026EFCD"}},
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
            "ReplicationInstanceArn": {"Ref": "dummydummydmsreplicationinstance641AF922"},
            "SourceEndpointArn": {"Ref": "dummydummysourcedmsendpointD8D1F3DD"},
            "TargetEndpointArn": {"Ref": "dummydummytargetdmsendpoint068352C5"},
        },
    )
