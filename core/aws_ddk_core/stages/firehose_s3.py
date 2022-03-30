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

from typing import List, Optional

import aws_cdk.aws_kinesisfirehose_destinations_alpha as destinations
from aws_cdk.aws_events import EventPattern, IRuleTarget
from aws_ddk_core.pipelines.stage import DataStage
from aws_ddk_core.resources import KinesisFactory, S3Factory
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
        bucket_name: str,
        delivery_stream_name: str,
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
        bucket_name : str
        """
        super().__init__(scope, id)

        self._event_source: str = f"{id}-event-source"
        self._event_detail_type: str = f"{id}-event-type"

        bucket = S3Factory.bucket(
            self,
            id=f"{id}-bucket",
            environment_id=environment_id,
            bucket_name=bucket_name,
        )

        KinesisFactory.firehose(
            self,
            id=f"{id}-firehose-stream",
            environment_id=environment_id,
            delivery_stream_name=delivery_stream_name,
            destinations=[destinations.S3Bucket(bucket)],
        )

    def get_event_pattern(self) -> Optional[EventPattern]:
        return EventPattern(
            source=[self._event_source],
            detail_type=[self._event_detail_type],
        )

    def get_targets(self) -> Optional[List[IRuleTarget]]:
        return None
