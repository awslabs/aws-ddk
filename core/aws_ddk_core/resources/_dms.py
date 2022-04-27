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
from typing import Any, Dict, List, Optional, Union

import aws_cdk.aws_dms as dms
from aws_cdk.aws_iam import PolicyStatement, Role, ServicePrincipal
from aws_ddk_core.config import Config
from aws_ddk_core.resources.commons import BaseSchema
from constructs import Construct

_logger: logging.Logger = logging.getLogger(__name__)


class DMSEndpointConfiguration(BaseSchema):
    """DDK DMS Endpoint Marshmallow schema."""


class DMSReplicationTaskConfiguration(BaseSchema):
    """DDK DMS ReplicationTask Marshmallow schema."""


class DMSReplicationInstanceConfiguration(BaseSchema):
    """DDK DMS ReplicationInstance Marshmallow schema."""


class DMSEndpointS3SettingsConfiguration(BaseSchema):
    """DDK DMS Endpoint S3 Settings Marshmallow schema."""


class DMSFactory:
    """
    Class factory create and configure Kinesis DDK resources, including Delivery Streams.
    """

    @staticmethod
    def endpoint_settings_s3(
        scope: Construct,
        id: str,
        environment_id: str,
        bucket_name: str,
        service_access_role_arn: str = None,
        **endpoint_s3_props: Any,
    ) -> dms.CfnEndpoint.S3SettingsProperty:
        """
        Create and configure DMS endpoint settings for s3.

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
        **endpoint_settings_s3_props: Any
            Additional properties. For complete list of properties refer to CDK Documentation -
            DMS Endpoints:
            https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_dms/CfnEndpoint.html

        Returns
        -------
        dms.CfnEndpoint.S3SettingsProperty: dms.CfnEndpoint.S3SettingsProperty:
            DMS Endpoint Settings for S3
        """
        # Load and validate the config
        endpoint_s3_config_props: Dict[str, Any] = DMSEndpointS3SettingsConfiguration().load(
            Config().get_resource_config(
                environment_id=environment_id,
                id=id,
            ),
            partial=["removal_policy"],
        )

        if not service_access_role_arn:
            service_access_role = Role(
                scope, f"{id}-dms-service-role", assumed_by=ServicePrincipal("dms.amazonaws.com")
            )
            service_access_role.add_to_policy(PolicyStatement(resources=["*"], actions=["iam:PassRole"]))
            service_access_role_arn = service_access_role.role_arn

        # Collect args
        endpoint_s3_props = {
            "bucket_name": bucket_name,
            "service_access_role_arn": service_access_role_arn,
            **endpoint_s3_props,
        }

        # Explicit ("hardcoded") props should always take precedence over config
        for key, value in endpoint_s3_props.items():
            if value is not None:
                endpoint_s3_config_props[key] = value

        # create dms endpoint
        _logger.debug(f" dms s3 endpoint properties: {endpoint_s3_props}")
        settings: dms.CfnEndpoint.S3SettingsProperty = dms.CfnEndpoint.S3SettingsProperty(**endpoint_s3_config_props)

        return settings

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

        # S3 Settings
        if s3_settings and not s3_settings.service_access_role_arn:
            s3_settings.service_access_role_arn = Role(
                scope, f"{id}-dms-service-role", assumed_by=ServicePrincipal("dms.amazonaws.com")
            ).add_to_policy(PolicyStatement(resources=["*"], actions=["iam:PassRole"]))
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
        replication_instance_arn: str,
        source_endpoint_arn: str,
        target_endpoint_arn: str,
        table_mappings: str,
        migration_type: str = "full-load",
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
        migration_type: str
            The migration type. Valid values: full-load | cdc | full-load-and-cdc
            Default: 'full-load'
        replication_instance_arn: str
            The Amazon Resource Name (ARN) of a replication instance.
        source_endpoint_arn: str
            An Amazon Resource Name (ARN) that uniquely identifies the source endpoint.
        target_endpoint_arn: str
            An Amazon Resource Name (ARN) that uniquely identifies the target endpoint.
        table_mappings: str
            The table mappings for the task, in JSON format.

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
        replication_task_config_props: Dict[str, Any] = DMSReplicationTaskConfiguration().load(
            Config().get_resource_config(
                environment_id=environment_id,
                id=id,
            ),
            partial=["removal_policy"],
        )

        # Collect args
        replication_task_props = {
            "migration_type": migration_type,
            "replication_instance_arn": replication_instance_arn,
            "source_endpoint_arn": source_endpoint_arn,
            "target_endpoint_arn": target_endpoint_arn,
            "table_mappings": table_mappings,
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

    @staticmethod
    def replication_instance(
        scope: Construct,
        id: str,
        environment_id: str,
        replication_instance_class: str,
        allocated_storage: Optional[str] = None,
        allow_major_version_upgrade: Optional[bool] = False,
        auto_minor_version_upgrade: Optional[bool] = False,
        availability_zone: Optional[str] = None,
        engine_version: Optional[str] = None,
        kms_key_id: Optional[str] = None,
        multi_az: Optional[bool] = False,
        preferred_maintenance_window: Optional[str] = None,
        publicly_accessible: Optional[bool] = False,
        replication_instance_identifier: Optional[str] = None,
        replication_subnet_group_identifier: Optional[str] = None,
        resource_identifier: Optional[str] = None,
        vpc_security_group_ids: Optional[List[str]] = None,
        **replication_instance_props: Any,
    ) -> dms.CfnReplicationInstance:
        """
        Create and configure DMS replication instance.

        This construct allows to configure parameters of the dms replication instance using ddk.json
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
        **replication_instance_props: Any
            Additional properties. For complete list of properties refer to CDK Documentation -
            DMS Endpoints:
            https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_dms/CfnReplicationInstance.html

        Returns
        -------
        dms.CfnReplicationInstance: dms.CfnReplicationInstance
            A DMS Replication instance
        """
        # Load and validate the config
        replication_instance_config_props: Dict[str, Any] = DMSReplicationInstanceConfiguration().load(
            Config().get_resource_config(
                environment_id=environment_id,
                id=id,
            ),
            partial=["removal_policy"],
        )

        # Collect args
        replication_instance_props = {
            "replication_instance_class": replication_instance_class,
            "allocated_storage": allocated_storage,
            "allow_major_version_upgrade": allow_major_version_upgrade,
            "auto_minor_version_upgrade": auto_minor_version_upgrade,
            "availability_zone": availability_zone,
            "engine_version": engine_version,
            "kms_key_id": kms_key_id,
            "multi_az": multi_az,
            "preferred_maintenance_window": preferred_maintenance_window,
            "publicly_accessible": publicly_accessible,
            "replication_instance_identifier": replication_instance_identifier,
            "replication_subnet_group_identifier": replication_subnet_group_identifier,
            "resource_identifier": resource_identifier,
            "vpc_security_group_ids": vpc_security_group_ids,
            **replication_instance_props,
        }

        # Explicit ("hardcoded") props should always take precedence over config
        for key, value in replication_instance_props.items():
            if value is not None:
                replication_instance_config_props[key] = value

        # create dms endpoint
        _logger.debug(f" dms replication instance properties: {replication_instance_props}")
        replication_instance: dms.CfnReplicationInstance = dms.CfnReplicationInstance(
            scope, id, **replication_instance_config_props
        )

        return replication_instance
