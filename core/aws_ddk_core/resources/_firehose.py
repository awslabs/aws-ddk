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
from typing import Any, Dict, Optional, Sequence

import aws_cdk.aws_kinesisfirehose_alpha as firehose
import aws_cdk.aws_kinesisfirehose_destinations_alpha as destinations
from aws_cdk.aws_iam import IRole
from aws_cdk.aws_kinesis import IStream
from aws_cdk.aws_kms import IKey
from aws_cdk.aws_s3 import Bucket, IBucket
from aws_ddk_core.config import Config
from aws_ddk_core.resources.commons import BaseSchema, Duration
from constructs import Construct
from marshmallow import fields

_logger: logging.Logger = logging.getLogger(__name__)


class FirehoseSchema(BaseSchema):
    """DDK Firehose Delivery Stream Marshmallow Schema."""

    s3_destination_buffering_interval: Duration()
    s3_destination_buffering_size: fields.Int(load_default=16)


class FirehoseFactory:
    """
    Class factory create and configure Kinesis Firehose DDK resources, including Delivery Streams.
    """

    @staticmethod
    def firehose(
        scope: Construct,
        environment_id: str,
        id: str,
        destinations: Optional[Sequence[firehose.IDestination]] = None,
        delivery_stream_name: Optional[str] = None,
        encryption: Optional[firehose.StreamEncryption] = None,
        encryption_key: Optional[IKey] = None,
        role: Optional[IRole] = None,
        s3_destination_bucket: Optional[IBucket] = None,
        s3_destination_buffering_interval: Optional[Duration] = None,
        s3_destination_buffering_size: Optional[int] = None,
        s3_destination_data_output_prefix: Optional[str] = None,
        source_stream: Optional[IStream] = None,
        **firehose_props: Any,
    ) -> firehose.IDeliveryStream:
        """
        Create and configure Firehose delivery stream.

        This construct allows to configure parameters of the firehose delivery stream using ddk.json
        configuration file depending on the `environment_id` in which the function is used.
        Supported parameters are:

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the queue
        environment_id : str
            Identifier of the environment

        Returns
        -------
        """
        # Load and validate the config
        firehose_config_props: Dict[str, Any] = FirehoseSchema().load(
            Config().get_resource_config(
                environment_id=environment_id,
                id=id,
            ),
            partial=["removal_policy"],
        )
        # Collect args
        firehose_props = {
            "delivery_stream_name": delivery_stream_name,
            "destinations": destinations,
            "encryption": encryption,
            "encryption_key": encryption_key,
            "role": role,
            "source_stream": source_stream,
            "s3_destination_buffering_interval": s3_destination_buffering_interval,
            "s3_destination_buffering_size": s3_destination_buffering_size,
            "s3_destination_data_output_prefix": s3_destination_data_output_prefix,
            **firehose_props,
        }
        # Explicit ("hardcoded") props should always take precedence over config
        for key, value in firehose_props.items():
            if value is not None:
                firehose_config_props[key] = value

        # Destination Specific Config
        destination_properties = {
            "s3_destination_buffering_interval": "buffering_interval",
            "s3_destination_buffering_size": "buffering_size",
            "s3_destination_data_output_prefix": "data_output_prefix",
        }

        if not firehose_props["destinations"] and s3_destination_bucket:
            # Gather config specific to destination
            destination_config = {
                destination_properties[prop]: firehose_config_props[prop]
                for prop in firehose_config_props
                if prop in destination_properties.keys()
            }
            print(destination_config)

            # Create Destination
            firehose_config_props["destinations"] = [
                FirehoseFactory.create_s3_destination(s3_destination_bucket, **destination_config)
            ]
        else:
            _logger.debug("one of 'destinations' or 's3_bucket_destination' must be specified")

        # drop destination specific config
        for prop in destination_properties:
            if prop in firehose_config_props:
                firehose_config_props.pop(prop)

        # create delivery stream
        _logger.debug(f"firehose_props: {firehose_config_props}")
        firehose_stream: firehose.IDeliveryStream = firehose.DeliveryStream(scope, id, **firehose_config_props)

        return firehose_stream

    @staticmethod
    def create_s3_destination(bucket: Bucket, **props) -> destinations.S3Bucket:
        """
        Generates an S3 Destination for a Kinesis Firehose Delivery Stream
        """
        return destinations.S3Bucket(bucket, **props)
