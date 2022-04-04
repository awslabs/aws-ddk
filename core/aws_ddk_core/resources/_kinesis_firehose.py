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
from aws_cdk.aws_logs import ILogGroup
from aws_cdk.aws_s3 import IBucket
from aws_ddk_core.config import Config
from aws_ddk_core.resources.commons import BaseSchema, Duration, Size
from constructs import Construct

_logger: logging.Logger = logging.getLogger(__name__)


class FirehoseDestinationSchema(BaseSchema):
    """DDK Firehose destination Marshmallow schema."""

    # Firehose Destination CDK construct fields
    buffering_interval = Duration()
    buffering_size = Size()


class KinesisFirehoseFactory:
    """
    Class factory create and configure Kinesis DDK resources, including Delivery Streams.
    """

    @staticmethod
    def delivery_stream(
        scope: Construct,
        id: str,
        environment_id: str,
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

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the delivery stream
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
        id: str,
        environment_id: str,
        bucket: IBucket,
        buffering_interval: Optional[Duration] = None,
        buffering_size: Optional[Size] = None,
        compression: Optional[destinations.Compression] = destinations.Compression.GZIP,
        data_output_prefix: Optional[str] = None,
        encryption_key: Optional[IKey] = None,
        error_output_prefix: Optional[str] = None,
        logging: Optional[bool] = True,
        log_group: Optional[ILogGroup] = None,
        processor: Optional[firehose.IDataProcessor] = None,
        role: Optional[IRole] = None,
        s3_backup: Optional[destinations.DestinationS3BackupProps] = None,
        **destination_props: Any,
    ) -> destinations.S3Bucket:
        """
        Create and configure Firehose delivery S3 destination.

        This construct allows to configure parameters of the firehose destination using ddk.json
        configuration file depending on the `environment_id` in which the function is used.
        Supported parameters are: `buffering_interval` and `buffering_size`

        Parameters
        ----------
        id : str
            Identifier of the destination
        environment_id : str
            Identifier of the environment
        bucket: IBucket
            S3 Bucket to use for the destination.
        buffering_interval: Optional[Duration] = None
            The length of time that Firehose buffers incoming data before delivering it to the S3 bucket.
            Minimum: Duration.seconds(60)
            Maximum: Duration.seconds(900)
            Default: Duration.seconds(300)
        buffering_size: Optional[Size] = None
            The size of the buffer that Kinesis Data Firehose uses for incoming data
            before delivering it to the S3 bucket.
            Minimum: Size.mebibytes(1)
            Maximum: Size.mebibytes(128)
            Default: Size.mebibytes(5)
        compression: Optional[Compression] = None
            The type of compression that Kinesis Data Firehose uses to compress the data that it delivers
            to the Amazon S3 bucket.
            Default: Compression.GZIP
        data_output_prefix: Optional[str] = None
            A prefix that Kinesis Data Firehose evaluates and adds to records before writing them to S3
        encryption_key: Optional[IKey] = None
            The AWS KMS key used to encrypt the data that it delivers to your Amazon S3 bucket.
        error_output_prefix: Optional[str] = None
            A prefix that Kinesis Data Firehose evaluates and adds to failed records before writing them to S3.
            This prefix appears immediately following the bucket name
        logging: Optional[bool] = True
            If true, log errors when data transformation or data delivery fails.
            If logGroup is provided, this will be implicitly set to true.
            Default: true - errors are logged.
        log_group: Optional[ILogGroup] = None
            The CloudWatch log group where log streams will be created to hold error logs.
            Default: - if logging is set to true, a log group will be created for you.
        processor: Optional[IDataProcessor] = None
            The data transformation that should be performed on the data before writing to the destination.
        role: Optional[IRole] = None
            The IAM role associated with this destination.
            Assumed by Kinesis Data Firehose to invoke processors and write to destinations
        s3_backup: Optional[DestinationS3BackupProps] = None
            The configuration for backing up source records to S3.
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
            "buffering_interval": buffering_interval,
            "buffering_size": buffering_size,
            "compression": compression,
            "data_output_prefix": data_output_prefix,
            "encryption_key": encryption_key,
            "error_output_prefix": error_output_prefix,
            "logging": logging,
            "log_group": log_group,
            "processor": processor,
            "role": role,
            "s3_backup": s3_backup,
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
