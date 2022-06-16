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
from aws_cdk.aws_databrew import CfnJob
from aws_cdk.aws_iam import Role, ServicePrincipal
from aws_ddk_core.base import BaseStack
from aws_ddk_core.stages import DatabrewTransformStage


def test_databrew_transform_stage_simple(test_stack: BaseStack) -> None:
    DatabrewTransformStage(
        scope=test_stack,
        id="dummy-databrew-transform-simple",
        environment_id="dev",
        job_name="dummy-databrew-job",
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
                        ]
                    ),
                ]
            }
        },
    )


def test_databrew_transform_stage_create(test_stack: BaseStack) -> None:
    DatabrewTransformStage(
        scope=test_stack,
        id="dummy-databrew-transform-create",
        environment_id="dev",
        job_role_arn=Role(
            scope=test_stack,
            id="dummy-role",
            assumed_by=ServicePrincipal("databrew.amazonaws.com"),
        ).role_arn,
        job_type="RECIPE",
        dataset_name="dummy-databrew-dataset",
        recipe=CfnJob.RecipeProperty(
            name="dummy-databrew-recipe",
            version="1",
        ),
        state_machine_input={"event": "dummy-event"},
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::DataBrew::Job",
        props={
            "Name": "dummy-databrew-transform-create-job",
            "Type": "RECIPE",
            "DatasetName": "dummy-databrew-dataset",
            "Recipe": {"Name": "dummy-databrew-recipe", "Version": "1"},
            "MaxCapacity": 2,
            "MaxRetries": 1,
            "Timeout": 60,
        },
    )
