from pathlib import Path

from aws_cdk.assertions import Template
from aws_cdk.aws_glue_alpha import (
    Code,
    GlueVersion,
    JobExecutable,
    PythonVersion,
    S3Encryption,
    S3EncryptionMode,
    SecurityConfiguration,
)
from aws_ddk_core.base import BaseStack
from aws_ddk_core.resources import GlueFactory


def test_glue_job_security_config_default_args(test_stack: BaseStack) -> None:
    glue_job_details = JobExecutable.python_etl(
        glue_version=GlueVersion.V3_0,
        python_version=PythonVersion.THREE,
        script=Code.from_asset(f"{Path(__file__).absolute()}"),
    )

    environment_id = "dev"
    GlueFactory.job(
        test_stack,
        id="job-1",
        environment_id=environment_id,
        job_name=f"myproject-{environment_id}-job1",
        executable=glue_job_details,
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Glue::SecurityConfiguration",
        props={
            "EncryptionConfiguration": {
                "S3Encryptions": [
                    {"S3EncryptionMode": "SSE-S3"},
                ],
            },
            "Name": "job-1-security-config",
        },
    )
    assert len(template.find_resources("AWS::Glue::SecurityConfiguration")) == 1


def test_glue_job_security_config_with_custom_name(test_stack: BaseStack) -> None:
    glue_job_details = JobExecutable.python_etl(
        glue_version=GlueVersion.V3_0,
        python_version=PythonVersion.THREE,
        script=Code.from_asset(f"{Path(__file__).absolute()}"),
    )

    environment_id = "dev"
    GlueFactory.job(
        test_stack,
        id="job-1",
        environment_id=environment_id,
        job_name=f"myproject-{environment_id}-job1",
        executable=glue_job_details,
        security_configuration_name="my-custom-security-config-name",
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Glue::SecurityConfiguration",
        props={
            "EncryptionConfiguration": {
                "S3Encryptions": [
                    {"S3EncryptionMode": "SSE-S3"},
                ],
            },
            "Name": "my-custom-security-config-name",
        },
    )
    assert len(template.find_resources("AWS::Glue::SecurityConfiguration")) == 1


def test_glue_job_security_config_custom(test_stack: BaseStack) -> None:
    glue_job_details = JobExecutable.python_etl(
        glue_version=GlueVersion.V3_0,
        python_version=PythonVersion.THREE,
        script=Code.from_asset(f"{Path(__file__).absolute()}"),
    )

    security_config = SecurityConfiguration(
        test_stack,
        "security-config",
        security_configuration_name="my-custom-security-config-name",
        s3_encryption=S3Encryption(mode=S3EncryptionMode.KMS),
    )

    environment_id = "dev"
    GlueFactory.job(
        test_stack,
        id="job-1",
        environment_id=environment_id,
        job_name=f"myproject-{environment_id}-job1",
        executable=glue_job_details,
        security_configuration=security_config,
    )

    template = Template.from_stack(test_stack)
    template.has_resource_properties(
        "AWS::Glue::SecurityConfiguration",
        props={
            "EncryptionConfiguration": {
                "S3Encryptions": [
                    {"S3EncryptionMode": "SSE-KMS"},
                ],
            },
            "Name": "my-custom-security-config-name",
        },
    )
    assert len(template.find_resources("AWS::Glue::SecurityConfiguration")) == 1
