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
from aws_cdk.aws_iam import Role, ServicePrincipal
from aws_ddk_core.base import BaseStack


def test_base_stack(test_stack: BaseStack) -> None:
    Role(
        scope=test_stack,
        id="dummy-role",
        assumed_by=ServicePrincipal("sns.amazonaws.com"),
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::IAM::Role",
        props={
            "Tags": [
                Match.not_(pattern={"Key": "Application", "Value": "Foo"}),
                {"Key": "Environment", "Value": "Dev"},
                {"Key": "Owner", "Value": "DDK"},
                {"Key": "Stack", "Value": "Test"},
            ],
            "PermissionsBoundary": Match.object_like(
                pattern={
                    "Fn::Join": [
                        "",
                        [
                            "arn:",
                            {"Ref": "AWS::Partition"},
                            ":iam::111111111111:policy/ddk-dev-hnb659fds-permissions-boundary-111111111111-us-west-2",  # noqa
                        ],
                    ],
                }
            ),
        },
    )
