# Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import logging
from typing import Any, Dict, Optional

import aws_cdk as cdk
import aws_cdk.aws_glue_alpha as glue
from aws_cdk.aws_iam import IRole
from aws_ddk_core.config import Config
from aws_ddk_core.resources.commons import BaseSchema, Duration
from constructs import Construct
from marshmallow import fields

_logger: logging.Logger = logging.getLogger(__name__)


class JobSchema(BaseSchema):
    """DDK Glue job Marshmallow schema."""

    # Glue job CDK construct fields
    default_arguments = fields.Dict(keys=fields.Str, values=fields.Str)
    enable_profiling_metrics = fields.Bool()
    max_concurrent_runs = fields.Int(load_default=1)
    max_retries = fields.Int(load_default=0)
    timeout = Duration(load_default=cdk.Duration.seconds(3600))
    worker_count = fields.Int()


class GlueFactory:
    """
    Class factory to create and configure Glue DDK resources, including Jobs.
    """

    @staticmethod
    def job(
        scope: Construct,
        id: str,
        environment_id: str,
        executable: glue.JobExecutable,
        job_name: Optional[str] = None,
        description: Optional[str] = None,
        role: Optional[IRole] = None,
        security_configuration: Optional[glue.ISecurityConfiguration] = None,
        timeout: Optional[cdk.Duration] = None,
        worker_count: Optional[int] = None,
        worker_type: Optional[glue.WorkerType] = None,
        **job_props: Any,
    ) -> glue.IJob:
        """
        Create and configure Glue job.

        This construct allows to configure parameters of the job using ddk.json configuration file
        depending on the `environment_id` in which the job is used. Supported parameters are:
        `default_arguments`,`enable_profiling_metrics`, `max_concurrent_runs`, `max_retries`,
        `timeout`, `worker_count`.

        The parameters are respected in the following order:
        1 - Explicit arguments are always preferred
        2 - Values from configuration file
        3 - Defaults are used otherwise

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the Glue job
        environment_id : str
            Identifier of the environment
        executable : JobExecutable
            The job executable properties
        job_name : Optional[str]
            The name of the Glue job
        description : Optional[str]
            The description of the Glue job
        role : Optional[IRole]
            The execution role of the Glue job
        security_configuration : Optional[ISecurityConfiguration]
            The security configuration of the Glue job. If None, a default configuration is used
        timeout : Optional[Duration]
            The job execution time (in seconds) after which Glue terminates the job.
            `aws_cdk.Duration.seconds(3600)` by default.
        worker_count : Optional[int]
            The number of workers of a defined WorkerType that are allocated when a job runs
        worker_type : Optional[WorkerType]
            The type of predefined worker that is allocated when a job runs
        job_props : Any
            Additional job properties. For complete list of properties refer to CDK Documentation -
            Glue Job: https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_glue_alpha/Job.html

        Returns
        -------
        job : aws_cdk.aws_glue_alpha.Job
            Glue job
        """
        # Load job configuration from ddk.json based on environment id and resource id
        job_config_props: Dict[str, Any] = JobSchema().load(
            Config().get_resource_config(
                environment_id=environment_id,
                id=id,
            ),
            partial=["removal_policy"],
        )
        # Collect job props
        job_props = {
            "executable": executable,
            "job_name": job_name,
            "description": description,
            "role": role,
            "security_configuration": security_configuration,
            "timeout": timeout,
            "worker_count": worker_count,
            "worker_type": worker_type,
            **job_props,
        }
        # Explicit ("hardcoded") props should always take precedence over config
        for key, value in job_props.items():
            if value is not None:
                job_config_props[key] = value
        # Otherwise use defaults
        job_config_props.setdefault("security_configuration", GlueFactory._get_security_config(scope, id))

        _logger.debug(f"job_config_props: {job_config_props}")
        return glue.Job(scope, id, **job_config_props)

    @staticmethod
    def _get_security_config(scope: Construct, id: str) -> glue.SecurityConfiguration:
        return glue.SecurityConfiguration(
            scope,
            f"{id}-security-config",
            security_configuration_name=f"{id}-security-config",
            cloud_watch_encryption=glue.CloudWatchEncryption(mode=glue.CloudWatchEncryptionMode.KMS),
            s3_encryption=glue.S3Encryption(mode=glue.S3EncryptionMode.S3_MANAGED),
        )
