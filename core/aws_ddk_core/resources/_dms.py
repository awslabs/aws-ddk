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

import logging
from typing import Any, Dict, Optional, Union

import aws_cdk.aws_dms as dms
from aws_ddk_core.config import Config
from aws_ddk_core.resources.commons import BaseSchema
from constructs import Construct

_logger: logging.Logger = logging.getLogger(__name__)


class DMSEndpointConfiguration(BaseSchema):
    """DDK DMS Endpoint Marshmallow schema."""

class DMSReplicationTaskConfiguration(BaseSchema):
    """DDK DMS ReplicationTask Marshmallow schema."""



class DMSFactory:
    """
    Class factory create and configure Kinesis DDK resources, including Delivery Streams.
    """

    @staticmethod
    def endpoint(
        scope: Construct,
        id: str,
        environment_id: str,
        endpoint_type: str,
        engine_name: str,
        s3_settings: Union[dms.CfnEndpoint.S3SettingsProperty, None],
        **endpoint_props: Any,
    ) -> dms.CfnEndpoint:
        """
        Create and configure DMS endpoint.

        This construct allows to configure parameters of the dms endpoint using ddk.json
        configuration file depending on the `environment_id` in which the function is used.
        Supported parameters are: ...

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id: str
            Identifier of the destination
        environment_id: str
            Identifier of the environment
        endpoint_type: str
            The type of endpoint. Valid values are `source` and `target`.
        engine_name: str
            The type of engine for the endpoint, depending on the EndpointType value. 
            Valid values : mysql | oracle | postgres | mariadb | aurora | aurora-postgresql 
            | opensearch | redshift | s3 | db2 | azuredb | sybase | dynamodb | mongodb 
            | kinesis | kafka | elasticsearch | docdb | sqlserver | neptune
        s3_settings: Union[dms.S3SettingsProperty, None]
             Settings in JSON format for the source and target Amazon S3 endpoint. 
             For more information about other available settings, see
             https://docs.aws.amazon.com/cdk/api/v1/python/aws_cdk.aws_dms/CfnEndpoint.html#s3settingsproperty
        **endpoint_props: Any
            Additional properties. For complete list of properties refer to CDK Documentation -
            DMS Endpoints:
            https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_dms/CfnEndpoint.html

        Returns
        -------
        dms.CfnEndpoint: dms.CfnEndpoint
            A DMS Endpoint
        """
        # Load and validate the config
        endpoint_config_props: Dict[str, Any] = DMSEndpointConfiguration().load(
            Config().get_resource_config(
                environment_id=environment_id,
                id=id,
            ),
            partial=["removal_policy"],
        )

        # Collect args
        endpoint_props = {
            "endpoint_type": endpoint_type,
            "engine_name": engine_name,
            "s3_settings": s3_settings,
            **endpoint_props,
        }

        # Explicit ("hardcoded") props should always take precedence over config
        for key, value in endpoint_props.items():
            if value is not None:
                endpoint_config_props[key] = value

        # create dms endpoint
        _logger.debug(f" dms endpoint properties: {endpoint_props}")
        endpoint: dms.CfnEndpoint = dms.CfnEndpoint(scope, id, **endpoint_config_props)

        return endpoint
      
    @staticmethod
    def replication_task(
        scope: Construct,
        id: str,
        environment_id: str,
        **replication_task_props: Any,
    ) -> dms.CfnEndpoint:
        """
        Create and configure DMS replication task.

        This construct allows to configure parameters of the dms replication task using ddk.json
        configuration file depending on the `environment_id` in which the function is used.
        Supported parameters are: ...

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id: str
            Identifier of the destination
        environment_id: str
            Identifier of the environment
        **replication_task_props: Any
            Additional properties. For complete list of properties refer to CDK Documentation -
            DMS Endpoints:
            https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_dms/CfnReplicationTask.html

        Returns
        -------
        dms.CfnReplicationTask: dms.CfnReplicationTask
            A DMS Replication Task
        """
        # Load and validate the config
        replication_task_config_props: Dict[str, Any] = DMSEndpointConfiguration().load(
            Config().get_resource_config(
                environment_id=environment_id,
                id=id,
            ),
            partial=["removal_policy"],
        )

        # Collect args
        replication_task_props = {
            "endpoint_type": endpoint_type,
            "engine_name": engine_name,
            "s3_settings": s3_settings,
            **replication_task_props,
        }

        # Explicit ("hardcoded") props should always take precedence over config
        for key, value in replication_task_props.items():
            if value is not None:
                replication_task_config_props[key] = value

        # create dms endpoint
        _logger.debug(f" dms replication task properties: {replication_task_props}")
        replication_task: dms.CfnReplicationTask = dms.CfnReplicationTask(scope, id, **replication_task_config_props)

        return replication_task

