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

from typing import Any, List, Optional

from aws_cdk.aws_codecommit import Repository
from aws_cdk.aws_iam import PolicyStatement
from aws_cdk.pipelines import CodeBuildStep, CodePipelineSource, IFileSetProducer, ShellStep
from aws_ddk_core.cicd._utils import _get_codeartifact_policy_statements
from constructs import Construct


def get_code_commit_source_action(
    scope: Construct,
    repository_name: str,
    branch: str = "main",
    **source_props: Any,
) -> CodePipelineSource:
    """
    Get source action with CodeCommit as SCM.

    Parameters
    ----------
    scope : Construct
        Scope within which this construct is defined
    repository_name : str
        Name of the SCM repository
    branch : str
        Branch name
    source_props : Any
        Additional source action properties

    Returns
    -------
    action : CodePipelineSource
        CodeCommit source action
    """
    return CodePipelineSource.code_commit(
        repository=Repository.from_repository_name(scope, repository_name, repository_name),
        branch=branch,
        **source_props,
    )


def get_synth_action(
    code_pipeline_source: CodePipelineSource,
    cdk_version: Optional[str] = None,
    partition: Optional[str] = None,
    region: Optional[str] = None,
    account: Optional[str] = None,
    role_policy_statements: Optional[List[PolicyStatement]] = None,
    codeartifact_repository: Optional[str] = None,
    codeartifact_domain: Optional[str] = None,
    codeartifact_domain_owner: Optional[str] = None,
) -> CodeBuildStep:
    """
    Get synth action.

    Parameters
    ----------
    code_pipeline_source: CodePipelineSource
        Code Pipeline source stage
    cdk_version: str
        Version of CDK
    role_policy_statements: Optional[List[PolicyStatement]]
        Additional policies to add to the synth action role
    codeartifact_repository: Optional[str]
        Name of the CodeArtifact repository to pull artifacts from
    codeartifact_domain: Optional[str]
        Name of the CodeArtifact domain
    codeartifact_domain_owner: Optional[str]
        CodeArtifact domain owner account

    Returns
    -------
    action : CodeBuildStep
        Synth action
    """
    install_commands: List[str] = [
        f"npm install -g aws-cdk@{cdk_version if cdk_version else ''}",
    ]
    if all([codeartifact_repository, codeartifact_domain, codeartifact_domain_owner]):
        # Add minimal CodeArtifact permissions
        if not role_policy_statements:
            role_policy_statements = _get_codeartifact_policy_statements(
                partition, region, account, codeartifact_domain, codeartifact_repository  # type: ignore
            )
        install_commands.append(
            f"aws codeartifact login "
            f"--tool pip --repository {codeartifact_repository} "
            f"--domain {codeartifact_domain} "
            f"--domain-owner {codeartifact_domain_owner}",
        )
    install_commands.append("pip install -r requirements.txt")
    return CodeBuildStep(
        "Synth",
        input=code_pipeline_source,
        install_commands=install_commands,
        commands=["cdk synth"],
        role_policy_statements=role_policy_statements,
    )


def get_cfn_nag_action(
    file_set_producer: Optional[IFileSetProducer], stage_name: Optional[str] = "CFNNag"
) -> ShellStep:
    """
    Get CFN Nag action.

    Parameters
    ----------
    file_set_producer: Optional[IFileSetProducer]
        File set to run security scan on
    stage_name: Optional[str]
        Name for stage. Default is "CFNNag"

    Returns
    -------
    action : ShellStep
        Codebuild step
    """
    return ShellStep(
        stage_name,
        input=file_set_producer,
        install_commands=["gem install cfn-nag"],
        commands=[
            "fnames=$(find ./ -type f -name '*.template.json')",
            "for f in $fnames; do cfn_nag_scan --input-path $f; done",
        ],
    )


def get_bandit_action(code_pipeline_source: CodePipelineSource, stage_name: Optional[str] = "Bandit") -> ShellStep:
    """
    Get Bandit action.

    Parameters
    ----------
    code_pipeline_source: CodePipelineSource
        Code Pipeline source stage
    stage_name: Optional[str]
        Name for stage. Default is "Bandit"

    Returns
    -------
    action : CodeBuildStep
        Synth action
    """
    return ShellStep(
        stage_name,
        input=code_pipeline_source,
        install_commands=["pip install bandit"],
        commands=["bandit -r -ll -ii ."],
    )


def get_tests_action(
    file_set_producer: Optional[IFileSetProducer],
    commands: Optional[List[str]] = None,
    stage_name: Optional[str] = "Tests",
) -> ShellStep:
    """
    Return shell script action that runs tests.

    Parameters
    ----------
    scope : Construct
        Scope within which this construct is defined
    file_set_producer: Optional[IFileSetProducer]
        File set to run tests on
    commands: Optional[List[str]]
        Additional commands to run in the test. Defaults to "./test.sh" otherwise
    stage_name: Optional[str]
        Name for stage. Default is "Tests"

    Returns
    -------
    action : ShellStep
        Test action
    """
    install_commands: List[str] = []
    commands = ["./test.sh"] if commands is None else commands
    install_commands.extend(
        [
            "pip install -r requirements-dev.txt",  # Note that requirements-dev.txt can be an empty file
            "pip install -r requirements.txt",
        ]
    )
    return ShellStep(
        stage_name,
        input=file_set_producer,
        install_commands=install_commands,
        commands=commands,
    )
