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
from aws_cdk.aws_s3 import IBucket
from aws_ddk_core.config import Config
from aws_ddk_core.resources.commons import BaseSchema, Duration, Size
from constructs import Construct

_logger: logging.Logger = logging.getLogger(__name__)


class FirehoseDestinationSchema(BaseSchema):
    """DDK Firehose destination Marshmallow schema."""

    # Firehose Destination CDK construct fields
    buffer_interval = Duration()
    buffer_size = Size()


class KinesisFirehoseFactory:
    """
    Class factory create and configure Kinesis DDK resources, including Delivery Streams.
    """

    @staticmethod
    def delivery_stream(
        scope: Construct,
        environment_id: str,
        id: str,
        destinations: Sequence[firehose.IDestination],
        delivery_stream_name: Optional[str] = None,
        encryption: Optional[firehose.StreamEncryption] = None,
        encryption_key: Optional[IKey] = None,
        role: Optional[IRole] = None,
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
        destinations: Sequence[firehose.IDestination]
            The destinations that this delivery stream will deliver data to
        delivery_stream_name: Optional[str] = None
            A name for the delivery stream
        encryption: Optional[firehose.StreamEncryption] = None
            Indicates the type of customer master key (CMK) to use for server-side encryption, if any.
            Default: StreamEncryption.UNENCRYPTED
        encryption_key: Optional[IKey] = None
            Customer managed key to server-side encrypt data in the stream.
            Default: - no KMS key will be used
        role: Optional[IRole] = None
            The IAM role associated with this delivery stream.
            Assumed by Kinesis Data Firehose to read from sources and encrypt data server-side.
            Default: - a role will be created with default permissions.
        source_stream: Optional[IStream] = None
            The Kinesis data stream to use as a source for this delivery stream
        **firehose_props: Any
            Additional properties. For complete list of properties refer to CDK Documentation -
            Firehose Delivery Stream:
            https://docs.aws.amazon.com/cdk/api/v1/python/aws_cdk.aws_kinesisfirehose/DeliveryStream.html

        Returns
        -------
        delivery_stream: firehose.IDeliveryStream
            A Kinesis Firehose Delivery Stream
        """
        # Collect args
        firehose_props = {
            "delivery_stream_name": delivery_stream_name,
            "destinations": destinations,
            "encryption": encryption,
            "encryption_key": encryption_key,
            "role": role,
            "source_stream": source_stream,
            **firehose_props,
        }

        # create delivery stream
        _logger.debug(f"firehose_props: {firehose_props}")
        firehose_stream: firehose.IDeliveryStream = firehose.DeliveryStream(scope, id, **firehose_props)

        return firehose_stream

    @staticmethod
    def s3_destination(
        environment_id: str,
        id: str,
        bucket: IBucket,
        buffer_interval: Optional[Duration] = None,
        buffer_size: Optional[Size] = None,
        **destination_props: Any,
    ) -> firehose.IDeliveryStream:
        """
        Create and configure Firehose delivery S3 destination.

        This construct allows to configure parameters of the firehose destination using ddk.json
        configuration file depending on the `environment_id` in which the function is used.
        Supported parameters are:

        Parameters
        ----------
        id : str
            Identifier of the queue
        environment_id : str
            Identifier of the environment
        **destination_props: Any
            Additional properties. For complete list of properties refer to CDK Documentation -
            Firehose S3 Destinations:
            https://docs.aws.amazon.com/cdk/api/v1/python/aws_cdk.aws_kinesisfirehose_destinations/S3Bucket.html

        Returns
        -------
        destination: destinations.S3Bucket
            A Kinesis Firehose S3 Delivery Destination
        """
        # Load and validate the config
        destination_config_props: Dict[str, Any] = FirehoseDestinationSchema().load(
            Config().get_resource_config(
                environment_id=environment_id,
                id=id,
            ),
            partial=["removal_policy"],
        )

        # Collect args
        destination_props = {
            "buffer_interval": buffer_interval,
            "buffer_size": buffer_size,
            **destination_props,
        }

        # Explicit ("hardcoded") props should always take precedence over config
        for key, value in destination_props.items():
            if value is not None:
                destination_config_props[key] = value

        # create s3 destination
        _logger.debug(f"firehose destination properties: {destination_props}")
        destination: destinations.S3Bucket = destinations.S3Bucket(bucket, **destination_config_props)

        return destination
