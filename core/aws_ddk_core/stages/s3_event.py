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

from aws_cdk.aws_events import EventPattern
from aws_cdk.aws_s3 import Bucket
from aws_ddk_core.pipelines import EventStage
from constructs import Construct


class S3EventStage(EventStage):
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
        Amazon EventBridge notifications must be enabled on the bucket in order to use this construct.

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the stage
        environment_id : str
            Identifier of the environment
        event_names : List[str]
            The list of events to capture, for example: ["Object Created"].
            https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventBridge.html
        bucket_name : str
            The name of the S3 bucket. Amazon EventBridge notifications must be enabled
            on the bucket in order to use this construct.
        key_prefix : Optional[str]
            The S3 prefix. Capture root level prefix ("/") by default
        """
        super().__init__(scope, id, **kwargs)
        self._bucket = Bucket.from_bucket_name(self, id=f"{id}-bucket", bucket_name=bucket_name)
        detail: Dict[str, Any] = {
            "bucket": {
                "name": [bucket_name],
            },
        }
        if key_prefix:
            detail["object"] = {
                "key": [{"prefix": key_prefix}],
            }
        self._event_pattern = EventPattern(
            source=["aws.s3"],
            detail=detail,
            detail_type=event_names,
        )

    @property
    def event_pattern(self) -> EventPattern:
        """
        Return: EventPattern
            The S3 event pattern
        """
        return self._event_pattern

    def get_event_pattern(self) -> Optional[EventPattern]:
        return self._event_pattern
