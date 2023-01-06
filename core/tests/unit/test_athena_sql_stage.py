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
import pytest
from aws_cdk.assertions import Match, Template
from aws_ddk_core.base import BaseStack
from aws_ddk_core.stages import AthenaSQLStage


def test_athena_sql_stage_simple(test_stack: BaseStack) -> None:
    AthenaSQLStage(
        scope=test_stack,
        id="athena-sql",
        environment_id="dev",
        query_string="SELECT 1;",
        workgroup="primary",
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
                            Match.string_like_regexp(pattern="start-query-exec"),
                        ]
                    ),
                ]
            }
        },
    )


def test_athena_sql_stage_query_string_path(test_stack: BaseStack) -> None:
    AthenaSQLStage(
        scope=test_stack,
        id="athena-sql",
        environment_id="dev",
        query_string_path="$.queryString",
        workgroup="primary",
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
                            Match.string_like_regexp(pattern=r"\$\.queryString"),
                        ]
                    ),
                ]
            }
        },
    )


def test_invalid_arguments(test_stack: BaseStack) -> None:
    with pytest.raises(ValueError):
        AthenaSQLStage(
            scope=test_stack,
            id="athena-sql-both-query-params",
            environment_id="dev",
            query_string="SELECT 1;",
            query_string_path="$.queryString",
            workgroup="primary",
        )
    with pytest.raises(ValueError):
        AthenaSQLStage(
            scope=test_stack,
            id="athena-sql-no-query-params",
            environment_id="dev",
            workgroup="primary",
        )
