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
from typing import Any, Optional, Sequence

import aws_cdk.aws_kinesisfirehose_alpha as firehose
from aws_cdk.aws_iam import IRole
from aws_cdk.aws_kinesis import IStream
from aws_cdk.aws_kms import IKey
from constructs import Construct

_logger: logging.Logger = logging.getLogger(__name__)


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
