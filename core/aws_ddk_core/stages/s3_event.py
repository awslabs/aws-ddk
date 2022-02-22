# Copyright 2022 Amazon.com, Inc. or its affiliates
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

from aws_cdk.aws_cloudtrail import S3EventSelector, Trail
from aws_cdk.aws_events import EventPattern, IRuleTarget
from aws_cdk.aws_s3 import Bucket, IBucket
from aws_ddk_core.pipelines import Stage
from aws_ddk_core.resources import S3Factory
from constructs import Construct


class S3EventStage(Stage):
    """
    Class that represents an S3 Event DDK Stage.
    """

    def __init__(
        self,
        scope: Construct,
        id: str,
        environment_id: str,
        event_names: List[str],
        bucket_name: str,
        key_prefix: Optional[str] = None,
        **kwargs: Any,
    ) -> None:
        """
        DDK S3 Event stage.

        It implements an S3 event pattern based on event names, a bucket name and optional key prefix.
        A CloudTrail Trail and associated bucket are created to enable S3 object level tracking.

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the stage
        environment_id : str
            Identifier of the environment
        event_names : Optional[List[str]]
            https://docs.aws.amazon.com/AmazonS3/latest/userguide/cloudtrail-logging-s3-info.html#cloudtrail-object-level-tracking
            The list of events to capture
        bucket_name : str
            The name of the S3 bucket
        key_prefix : Optional[str]
            The S3 prefix. Capture root level prefix ("/") by default
        """
        super().__init__(scope, id, **kwargs)
        self._bucket = Bucket.from_bucket_name(self, id=f"{id}-bucket", bucket_name=bucket_name)
        request_parameters: Dict[str, Any] = {"bucketName": [bucket_name]}
        if key_prefix:
            request_parameters["key"] = [{"prefix": key_prefix}]

        self._event_pattern = EventPattern(
            source=["aws.s3"],
            detail={
                "eventSource": ["s3.amazonaws.com"],
                "eventName": event_names,
                "requestParameters": request_parameters,
            },
        )

        self._trail_bucket = S3Factory.bucket(
            self,
            id=f"{id}-trail-bucket",
            environment_id=environment_id,
        )
        self._trail = Trail(
            self,
            id=f"{id}-trail",
            bucket=self._trail_bucket,
            is_multi_region_trail=False,
            include_global_service_events=False,
        ).add_s3_event_selector(
            s3_selector=[S3EventSelector(bucket=self._bucket, object_prefix=key_prefix)],
            include_management_events=False,
        )

    @property
    def event_pattern(self) -> EventPattern:
        """
        Return: EventPattern
            The S3 event pattern
        """
        return self._event_pattern

    @property
    def trail(self) -> Trail:
        """
        Return: Trail
            The CloudTrail Trail
        """
        return self._trail

    @property
    def trail_bucket(self) -> IBucket:
        """
        Return: IBucket
            The CloudTrail Trail bucket
        """
        return self._trail_bucket

    def get_event_pattern(self) -> Optional[EventPattern]:
        return self._event_pattern

    def get_targets(self) -> Optional[List[IRuleTarget]]:
        return None
