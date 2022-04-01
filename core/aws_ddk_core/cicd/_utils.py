# Copyright (c) 2021 Amazon.com, Inc. or its affiliates
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT

from typing import List

from aws_cdk.aws_iam import Effect, PolicyStatement


def _get_codeartifact_read_policy_statements(
    partition: str,
    region: str,
    account: str,
    domain: str,
    repository: str,
) -> List[PolicyStatement]:
    return [
        PolicyStatement(
            effect=Effect.ALLOW,
            actions=[
                "codeartifact:DescribeDomain",
                "codeartifact:GetAuthorizationToken",
                "codeartifact:ListRepositoriesInDomain",
            ],
            resources=[
                f"arn:{partition}:codeartifact:{region}:{account}:domain/{domain}",
            ],
        ),
        PolicyStatement(
            effect=Effect.ALLOW,
            actions=[
                "codeartifact:GetRepositoryEndpoint",
                "codeartifact:ReadFromRepository",
            ],
            resources=[
                f"arn:{partition}:codeartifact:{region}:{account}:repository/{domain}/{repository}",
            ],
        ),
        PolicyStatement(
            effect=Effect.ALLOW,
            actions=["sts:GetServiceBearerToken"],
            resources=["*"],
            conditions={"StringEquals": {"sts:AWSServiceName": "codeartifact.amazonaws.com"}},
        ),
    ]


def _get_codeartifact_publish_policy_statements(
    partition: str,
    region: str,
    account: str,
    domain: str,
    repository: str,
) -> List[PolicyStatement]:
    return [
        PolicyStatement(
            actions=[
                "codeartifact:DescribeDomain",
                "codeartifact:GetAuthorizationToken",
                "codeartifact:ListRepositoriesInDomain",
            ],
            effect=Effect.ALLOW,
            resources=[
                f"arn:{partition}:codeartifact:{region}:{account}:domain/{domain}",
            ],
        ),
        PolicyStatement(
            actions=[
                "codeartifact:GetRepositoryEndpoint",
                "codeartifact:ReadFromRepository",
            ],
            effect=Effect.ALLOW,
            resources=[
                f"arn:{partition}:codeartifact:{region}:{account}:repository/{domain}/{repository}",
            ],
        ),
        PolicyStatement(
            actions=[
                "codeartifact:PublishPackageVersion",
            ],
            effect=Effect.ALLOW,
            resources=["*"],
        ),
        PolicyStatement(
            actions=[
                "sts:GetServiceBearerToken",
            ],
            effect=Effect.ALLOW,
            resources=["*"],
            conditions={
                "StringEquals": {
                    "sts:AWSServiceName": "codeartifact.amazonaws.com",
                },
            },
        ),
    ]
