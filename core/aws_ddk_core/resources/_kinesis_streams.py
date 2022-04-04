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
from typing import Any, Dict, Optional

from aws_cdk.aws_kinesis import IStream, Stream, StreamEncryption, StreamMode
from aws_cdk.aws_kms import IKey
from aws_ddk_core.config import Config
from aws_ddk_core.resources.commons import BaseSchema, Duration
from constructs import Construct
from marshmallow import fields

_logger: logging.Logger = logging.getLogger(__name__)


class KinesisStreamsSchema(BaseSchema):
    """DDK Kinesis data stream Marshmallow schema."""

    retention_period = Duration()
    shard_count = fields.Int()


class KinesisStreamsFactory:
    """
    Class factory create and configure Kinesis DDK resources, including Data Streams.
    """

    @staticmethod
    def data_stream(
        scope: Construct,
        id: str,
        environment_id: str,
        encryption: Optional[StreamEncryption] = None,
        encryption_key: Optional[IKey] = None,
        retention_period: Optional[Duration] = None,
        shard_count: Optional[int] = None,
        stream_mode: Optional[StreamMode] = None,
        stream_name: Optional[str] = None,
        **kinesis_props: Any,
    ) -> IStream:
        """
        Create and configure Kinesis data stream.

        This construct allows to configure parameters of the Kinesis data stream using ddk.json
        configuration file depending on the `environment_id` in which the function is used.
        Supported parameters are: `retention_period` and `shard_count`.

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the data stream
        environment_id : str
            Identifier of the environment
        encryption: Optional[StreamEncryption] = None
            The kind of server-side encryption to apply to this stream.
            If you choose KMS, you can specify a KMS key via encryptionKey.
            If encryption key is not specified, a key will automatically be created.
            Default: - StreamEncryption.KMS if encrypted Streams are supported
            in the region or StreamEncryption.UNENCRYPTED otherwise.
            StreamEncryption.KMS if an encryption key is supplied through the encryptionKey property
        encryption_key: Optional[IKey] = None
            External KMS key to use for stream encryption. The 'encryption' property must be set to “Kms”.
            Default: - Kinesis Data Streams master key ('/alias/aws/kinesis')
        retention_period: Optional[Duration] = None
            The number of hours for the data records that are stored in shards to remain accessible.
            Default: Duration.seconds(3600)
        shard_count: Optional[int] = None
            The number of shards for the stream. Can only be provided if streamMode is Provisioned.
            Default: 1
        stream_mode: Optional[StreamMode] = None
            The capacity mode of this stream.
            Default: StreamMode.PROVISIONED
        stream_name: Optional[str] = None
            Enforces a particular physical stream name.
            Default: A CloudFormation generated name
        **kinesis_props: Any
            Additional properties. For complete list of properties refer to CDK Documentation -
            Firehose Data Stream:
            https://docs.aws.amazon.com/cdk/api/v1/python/aws_cdk.aws_kinesis/Stream.html

        Returns
        -------
        data_stream: Stream
            A Kinesis Data Stream
        """
        # Load and validate the config
        kinesis_config_props: Dict[str, Any] = KinesisStreamsSchema().load(
            Config().get_resource_config(
                environment_id=environment_id,
                id=id,
            ),
            partial=["removal_policy"],
        )

        # Collect args
        kinesis_props = {
            "encryption": encryption,
            "encryption_key": encryption_key,
            "retention_period": retention_period,
            "shard_count": shard_count,
            "stream_mode": stream_mode,
            "stream_name": stream_name,
            **kinesis_props,
        }

        # Explicit ("hardcoded") props should always take precedence over config
        for key, value in kinesis_props.items():
            if value is not None:
                kinesis_config_props[key] = value

        # create delivery stream
        _logger.debug(f"kinesis_props: {kinesis_props}")
        data_stream: Stream = Stream(scope, id, **kinesis_props)

        return data_stream
