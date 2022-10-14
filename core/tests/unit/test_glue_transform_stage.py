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

from pathlib import Path

from aws_cdk.assertions import Match, Template
from aws_cdk.aws_glue import CfnCrawler
from aws_cdk.aws_glue_alpha import (
    Code,
    GlueVersion,
    JobExecutable,
    JobLanguage,
    JobType,
)
from aws_cdk.aws_iam import Role, ServicePrincipal
from aws_ddk_core.base import BaseStack
from aws_ddk_core.stages import GlueTransformStage


def test_glue_transform_stage_simple(test_stack: BaseStack) -> None:
    GlueTransformStage(
        scope=test_stack,
        id="dummy-glue-transform-simple",
        environment_id="dev",
        job_name="dummy-glue-job",
        crawler_name="dummy-glue-crawler",
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::StepFunctions::StateMachine",
        props={
            "DefinitionString": {
                "Fn::Join": [
                    "",
                    Match.array_with(
                        pattern=[
                            Match.string_like_regexp(pattern="start-job-run"),
                            Match.string_like_regexp(pattern="crawl-object"),
                        ]
                    ),
                ]
            }
        },
    )


def test_glue_transform_stage_create(test_stack: BaseStack) -> None:
    GlueTransformStage(
        scope=test_stack,
        id="dummy-glue-transform-create",
        environment_id="dev",
        executable=JobExecutable.of(
            glue_version=GlueVersion.V2_0,
            language=JobLanguage.PYTHON,
            script=Code.from_asset(f"{Path(__file__)}"),
            type=JobType.ETL,
        ),
        database_name="dummy-glue-database",
        targets=CfnCrawler.TargetsProperty(
            s3_targets=[CfnCrawler.S3TargetProperty(path="s3://dummy-path/")]
        ),
        crawler_role=Role(
            scope=test_stack,
            id="dummy-role",
            assumed_by=ServicePrincipal("glue.amazonaws.com"),
        ),
        job_args={"input_bucket": "dummy-bucket"},
        state_machine_input={"event": "dummy-event"},
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Glue::Job",
        props={
            "GlueVersion": "2.0",
            "DefaultArguments": {"--job-language": "python", "--enable-metrics": ""},
            "ExecutionProperty": {"MaxConcurrentRuns": 2},
            "MaxRetries": 0,
            "NumberOfWorkers": 3,
            "Timeout": 60,
        },
    )

    template.has_resource_properties(
        "AWS::Glue::SecurityConfiguration",
        props={"Name": "dummy-glue-transform-create-job-security-config"},
    )

    template.has_resource_properties(
        "AWS::Glue::Crawler",
        props={
            "DatabaseName": "dummy-glue-database",
            "Role": {"Fn::GetAtt": ["dummyrole41E7A8C1", "Arn"]},
            "Targets": {"S3Targets": [{"Path": "s3://dummy-path/"}]},
        },
    )


def test_glue_transform_stage_with_additional_args(test_stack: BaseStack) -> None:
    GlueTransformStage(
        scope=test_stack,
        id="dummy-glue-transform-create",
        environment_id="dev",
        executable=JobExecutable.of(
            glue_version=GlueVersion.V2_0,
            language=JobLanguage.PYTHON,
            script=Code.from_asset(f"{Path(__file__)}"),
            type=JobType.ETL,
        ),
        database_name="dummy-glue-database",
        targets=CfnCrawler.TargetsProperty(
            s3_targets=[CfnCrawler.S3TargetProperty(path="s3://dummy-path/")]
        ),
        crawler_role=Role(
            scope=test_stack,
            id="dummy-role",
            assumed_by=ServicePrincipal("glue.amazonaws.com"),
        ),
        job_args={"input_bucket": "dummy-bucket"},
        state_machine_input={"event": "dummy-event"},
        glue_job_args={"max_concurrent_runs": 100},
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Glue::Job",
        props={
            "GlueVersion": "2.0",
            "DefaultArguments": {"--job-language": "python", "--enable-metrics": ""},
            "ExecutionProperty": {"MaxConcurrentRuns": 100},
            "MaxRetries": 0,
            "NumberOfWorkers": 3,
            "Timeout": 60,
        },
    )
