#!/usr/bin/env python3

import aws_cdk as cdk
from aws_cdk.aws_codebuild import BuildEnvironment, BuildEnvironmentVariable
from aws_cdk.aws_iam import Effect, PolicyStatement
from aws_cdk.pipelines import CodeBuildStep, ShellStep
from aws_ddk_core.cicd import CICDPipelineStack
from aws_ddk_core.config import Config
from ddk_app.artifactory_stack import ArtifactoryStack

app = cdk.App()

# Artifactory parameters
ENVIRONMENT_ID = "dev"
DOMAIN_NAME = "ddk-lib-domain"
DOMAIN_OWNER = Config().get_env(environment_id=ENVIRONMENT_ID).account
REPOSITORY_NAME = "ddk-lib-repository"
PIPELINE_NAME = "ddk-lib-pipeline"

# Private artifactory stack
artifactory_stack: ArtifactoryStack = ArtifactoryStack(
    app,
    id="DdkArtifactory",
    environment_id="dev",
    domain_name=DOMAIN_NAME,
    domain_owner=DOMAIN_OWNER,
    repository_name=REPOSITORY_NAME,
)

# Artifactory CI/CD pipeline
pipeline: CICDPipelineStack = (
    CICDPipelineStack(
        app,
        id="DdkArtifactoryCodePipeline",
        environment_id=ENVIRONMENT_ID,
        pipeline_name=PIPELINE_NAME,
    )
    .add_source_action(repository_name=REPOSITORY_NAME)
    .add_synth_action()
    .build()
    .add_custom_stage(
        stage_name="PublishToCodeArtifact",
        steps=[
            CodeBuildStep(
                id="PublishToArtifact",
                build_environment=BuildEnvironment(
                    environment_variables={
                        "DOMAIN": BuildEnvironmentVariable(value=DOMAIN_NAME),
                        "OWNER": BuildEnvironmentVariable(value=DOMAIN_OWNER),
                        "REPOSITORY": BuildEnvironmentVariable(value=REPOSITORY_NAME),
                    },
                ),
                install_commands=[
                    "pip install wheel twine",
                    "pip install -U -r requirements.txt",
                    "python setup.py bdist_wheel",
                    "export VERSION=$(python setup.py --version)",
                    "export PACKAGE=$(python setup.py --name)",
                    "aws codeartifact login --tool twine --domain ${DOMAIN} --domain-owner ${OWNER} --repository ${REPOSITORY}",
                ],
                commands=[
                    "twine upload --repository codeartifact dist/${PACKAGE}-${VERSION}-py3-none-any.whl",
                ],
                role_policy_statements=[
                    PolicyStatement(
                        actions=[
                            "codeartifact:DescribeDomain",
                            "codeartifact:GetAuthorizationToken",
                            "codeartifact:ListRepositoriesInDomain",
                        ],
                        effect=Effect.ALLOW,
                        resources=["*"],
                    ),
                    PolicyStatement(
                        actions=[
                            "codeartifact:GetRepositoryEndpoint",
                            "codeartifact:ReadFromRepository",
                        ],
                        effect=Effect.ALLOW,
                        resources=["*"],
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
                ],
            ),
        ],
    )
)

app.synth()
