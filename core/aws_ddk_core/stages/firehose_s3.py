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

from typing import Any, Dict, List, Optional

import aws_cdk.aws_kinesisfirehose_alpha as firehose
import aws_cdk.aws_kinesisfirehose_destinations_alpha as destinations
from aws_cdk import Size
from aws_cdk.aws_events import EventPattern, IRuleTarget
from aws_cdk.aws_kinesis import Stream
from aws_cdk.aws_kms import IKey
from aws_cdk.aws_logs import ILogGroup
from aws_cdk.aws_s3 import IBucket
from aws_ddk_core.pipelines.stage import DataStage
from aws_ddk_core.resources import KinesisFactory, KinesisFirehoseFactory, S3Factory
from aws_ddk_core.resources.commons import Duration
from constructs import Construct


class FirehoseS3Stage(DataStage):
    """
    Class that represents a Firehose to S3 Ingestion DDK Stage.
    """

    def __init__(
        self,
        scope: Construct,
        id: str,
        environment_id: str,
        delivery_stream_name: Optional[str] = None,
        delivery_stream: Optional[firehose.IDeliveryStream] = None,
        bucket_name: Optional[str] = None,
        bucket: Optional[IBucket] = None,
        buffering_interval: Optional[Duration] = None,
        buffering_size: Optional[Size] = None,
        compression: Optional[destinations.Compression] = None,
        data_output_prefix: Optional[str] = None,
        data_stream: Optional[Stream] = None,
        enable_data_stream: Optional[bool] = False,
        encryption_key: Optional[IKey] = None,
        error_output_prefix: Optional[str] = None,
        logging: Optional[bool] = True,
        log_group: Optional[ILogGroup] = None,
    ) -> None:
        """
        DDK Firehose to S3 stage.

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the stage
        environment_id : str
            Identifier of the environment
        delivery_stream_name: Optional[str] = None
            Name of the Firehose Delivery Stream
        delivery_stream: Optional[firehose.IDeliveryStream] = None
            Existing Delivery Stream to use in this stage
        bucket_name: Optional[str] = None
            Name of S3 Bucket to be created as a delivery destination
        bucket: Optional[IBucket] = None
            Existing S3 Bucket to use as a destination for the Firehose Stream.
            If no bucket is provided, a new one is created
        buffering_interval: Optional[Duration] = None
            The length of time that Firehose buffers incoming data before delivering it to the S3 bucket.
            Minimum: Duration.seconds(60)
            Maximum: Duration.seconds(900)
            Default: Duration.seconds(300)
        buffering_size: Optional[Size] = None
            The size of the buffer that Kinesis Data Firehose uses for incoming
            data before delivering it to the S3 bucket.
            Minimum: Size.mebibytes(1)
            Maximum: Size.mebibytes(128)
            Default: Size.mebibytes(5)
        compression: Optional[Compression] = None
            The type of compression that Kinesis Data Firehose uses to compress
            the data that it delivers to the Amazon S3 bucket.
            Default: - UNCOMPRESSED
        data_output_prefix: Optional[str] = None
            A prefix that Kinesis Data Firehose evaluates and adds to records before writing them to S3.
            This prefix appears immediately following the bucket name.
            Default: “YYYY/MM/DD/HH”
        enable_data_stream: Optional[bool] = False
            Add Kinesis Data Stream to front Firehose Delivery.
            Default: False
        encryption_key: Optional[IKey] = None
            The AWS KMS key used to encrypt the data delivered to your Amazon S3 bucket
        error_output_prefix: Optional[str] = None
            prefix that Kinesis Data Firehose evaluates and adds to failed records before writing them to S3.
            This prefix appears immediately following the bucket name.
            Default: “YYYY/MM/DD/HH”
        logging: Optional[bool] = True
            If true, log errors when data transformation or data delivery fails.
            If `log_group` is provided, this will be implicitly set to true.
            Default: true - errors are logged.
        log_group: Optional[ILogGroup] = None
            The CloudWatch log group where log streams will be created to hold error logs.
            Default: - if logging is set to true, a log group will be created for you.

        """
        super().__init__(scope, id)

        self._event_source: str = f"{id}-event-source"
        self._event_detail_type: str = f"{id}-event-type"

        self._bucket: IBucket = (
            S3Factory.bucket(
                self,
                id=f"{id}-bucket",
                environment_id=environment_id,
                bucket_name=bucket_name,
            )
            if not bucket
            else bucket
        )

        if enable_data_stream:
            self._data_stream: Any = KinesisFactory.data_stream(
                self, id=f"{id}-data-stream", environment_id=environment_id
            )
        elif data_stream:
            self._data_stream = data_stream
        else:
            self._data_stream = None

        self._delivery_stream = (
            KinesisFirehoseFactory.delivery_stream(
                self,
                id=f"{id}-firehose-stream",
                environment_id=environment_id,
                delivery_stream_name=delivery_stream_name,
                source_stream=self._data_stream,
                destinations=[
                    destinations.S3Bucket(
                        self._bucket,
                        buffering_interval=buffering_interval,
                        buffering_size=buffering_size,
                        compression=compression,
                        data_output_prefix=data_output_prefix,
                        encryption_key=encryption_key,
                        error_output_prefix=error_output_prefix,
                        logging=logging,
                        log_group=log_group,
                    )
                ],
            )
            if not delivery_stream
            else delivery_stream
        )

        request_parameters: Dict[str, Any] = {"bucketName": [self._bucket.bucket_name]}
        if data_output_prefix:
            request_parameters["key"] = [{"prefix": data_output_prefix}]

        self._event_pattern = EventPattern(
            source=["aws.s3"],
            detail={
                "eventSource": ["s3.amazonaws.com"],
                "eventName": ["PutObject"],
                "requestParameters": request_parameters,
            },
        )

    @property
    def delivery_stream(self) -> firehose.IDeliveryStream:
        """
        Return: Delivery Stream
            The Kinesis Firehose Delivery Stream
        """
        return self._delivery_stream

    @property
    def event_pattern(self) -> EventPattern:
        """
        Return: EventPattern
            The S3 event pattern
        """
        return self._event_pattern

    def get_event_pattern(self) -> Optional[EventPattern]:
        return self._event_pattern

    def get_targets(self) -> Optional[List[IRuleTarget]]:
        return None
