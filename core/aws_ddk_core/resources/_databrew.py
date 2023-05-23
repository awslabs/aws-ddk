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
from typing import Any, Dict, Optional, Sequence

import aws_cdk as cdk
import aws_cdk.aws_databrew as databrew
from aws_ddk_core.config import Config
from aws_ddk_core.resources.commons import BaseSchema
from constructs import Construct
from marshmallow import fields

_logger: logging.Logger = logging.getLogger(__name__)


class JobSchema(BaseSchema):
    """DDK DataBrew recipe Marshmallow schema."""

    # DataBrew recipe CDK construct fields
    max_capacity = fields.Int()
    max_retries = fields.Int()
    timeout = fields.Int()
    log_subscription = fields.Str()


class DataBrewFactory:
    """
    Class factory to create and configure DataBrew DDK resources, including Jobs.
    """

    @staticmethod
    def job(
        scope: Construct,
        id: str,
        environment_id: str,
        name: str,
        role_arn: str,
        type: str,
        dataset_name: Optional[str] = None,
        recipe: Optional[databrew.CfnJob.RecipeProperty] = None,
        encryption_mode: Optional[str] = None,
        log_subscription: Optional[str] = None,
        max_capacity: Optional[int] = None,
        max_retries: Optional[int] = None,
        output_location: Optional[databrew.CfnJob.OutputLocationProperty] = None,
        outputs: Optional[Sequence[databrew.CfnJob.OutputProperty]] = None,
        timeout: Optional[cdk.Duration] = None,
        **job_props: Any,
    ) -> databrew.CfnJob:
        """
        Create and configure a DataBrew job.

        This construct allows to configure parameters of the job using ddk.json configuration file
        depending on the `environment_id` in which the job is used. Supported parameters are:
        `max_capacity`,`max_retries`, `timeout`

        The parameters are respected in the following order:
        1 - Explicit arguments are always preferred
        2 - Values from configuration file
        3 - Defaults are used otherwise

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the DataBrew job
        environment_id : str
            Identifier of the environment in which the job is used
        name : str
            Name of the DataBrew job
        role_arn : Optional[str]
            Arn of the execution role of the DataBrew job
        type : str
            The type of the DataBrew job, which must be one of the following:
                PROFILE - A job to analyze a dataset, to determine its size, data types, data distribution, and more.
                RECIPE - A job to apply one or more transformations to a dataset.
        dataset_name : Optional[str]
            The name of the DataBrew dataset to be processed by the DataBrew job
        recipe : Optional[databrew.CfnJob.RecipeProperty]
            The recipe to be used by the DataBrew job which is a series of data transformation steps.
        encryption_mode : Optional[str]
            The encryption mode to be used by the DataBrew job, which can be one of the following:
                SSE-KMS - Server-side encryption with keys managed by AWS KMS.
                SSE-S3 - Server-side encryption with keys managed by Amazon S3.
        log_subscription : Optional[str]
            The status of the Amazon Cloudwatch logging for the DataBrew job
        max_capacity : Optional[int]
            The maximum number of nodes that can be consumed by the DataBrew job.
        max_retries : Optional[int]
            The maximum number of times to retry the DataBrew job
        output_location : Optional[databrew.CfnJob.OutputLocationProperty]
            Output location to be used by the DataBrew job
        outputs : Optional[Sequence[databrew.CfnJob.OutputProperty]]
            One or more output artifacts that represent the output of the DataBrew job
        timeout : Optional[cdk.Duration]
            The job execution time (in seconds) after which DataBrew terminates the job.
            `aws_cdk.Duration.seconds(3600)` by default.
        job_props : Any
            Additional job properties. For complete list of properties refer to CDK Documentation -
            DataBrew Job: https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_databrew/CfnJob.html

        Returns
        -------
        job : databrew.CfnJob
            DataBrew job
        """
        job_config_props: Dict[str, Any] = JobSchema().load(
            Config().get_resource_config(
                environment_id=environment_id,
                id=id,
            ),
            partial=["removal_policy"],
        )
        # Collect job props
        job_props = {
            "name": name,
            "role_arn": role_arn,
            "type": type,
            "dataset_name": dataset_name,
            "recipe": recipe,
            "encryption_mode": encryption_mode,
            "log_subscription": log_subscription,
            "max_capacity": max_capacity,
            "max_retries": max_retries,
            "output_location": output_location,
            "outputs": outputs,
            "timeout": timeout,
            **job_props,
        }

        # Explicit ("hardcoded") props should always take precedence over config
        for key, value in job_props.items():
            if value is not None:
                job_config_props[key] = value
        # Otherwise use defaults

        _logger.debug(f"job_config_props: {job_config_props}")
        return databrew.CfnJob(scope, id, **job_config_props)
