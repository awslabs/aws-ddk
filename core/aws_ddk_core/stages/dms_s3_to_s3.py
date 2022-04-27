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
import json
from typing import Any, Dict, List, Optional, Union

import aws_cdk.aws_dms as dms
from aws_cdk.aws_events import EventPattern, IRuleTarget
from aws_cdk.aws_s3 import IBucket
from aws_ddk_core.pipelines.stage import DataStage
from aws_ddk_core.resources import DMSFactory
from constructs import Construct


class DMSS3ToS3Stage(DataStage):
    """
    Class that represents a DMS to S3 to S3 Replication DDK Stage.
    """

    def __init__(
        self,
        scope: Construct,
        id: str,
        environment_id: str,
        source_bucket: IBucket,
        target_bucket: IBucket,
        table_mappings: Union[str, None] = None,
        replication_instance_class: str = "m5.large",
    ) -> None:
        """
        DDK DMS S3 to S3 replication stage

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the stage
        environment_id : str
            Identifier of the environment
        """
        super().__init__(scope, id)

        self._event_source: str = f"{id}-event-source"
        self._event_detail_type: str = f"{id}-event-type"

        DMSFactory.replication_task(
            self,
            id=f"{id}-dms-replication-task",
            environment_id=environment_id,
            replication_instance_arn=DMSFactory.replication_instance(
                self,
                id=f"{id}-dms-replication-instance",
                environment_id=environment_id,
                replication_instance_class=replication_instance_class,
            ).ref,
            source_endpoint_arn=DMSFactory.endpoint(
                self,
                id=f"{id}-source-dms-endpoint",
                environment_id=environment_id,
                endpoint_type="source",
                engine_name="s3",
                s3_settings=dms.CfnEndpoint.S3SettingsProperty(
                    bucket_name=source_bucket.bucket_name,
                ),
            ).ref,
            target_endpoint_arn=DMSFactory.endpoint(
                self,
                id=f"{id}-target-dms-endpoint",
                environment_id=environment_id,
                endpoint_type="target",
                engine_name="s3",
                s3_settings=dms.CfnEndpoint.S3SettingsProperty(
                    bucket_name=target_bucket.bucket_name,
                ),
            ).ref,
            table_mappings=json.dumps(
                {
                    "rules": [
                        {
                            "rule-type": "%",
                            "rule-id": "1",
                            "rule-name": "1",
                            "object-locator": {"schema-name": "Test", "table-name": "%"},
                            "rule-action": "include",
                        }
                    ]
                },
            )
            if not table_mappings
            else table_mappings,
        )

        event_detail: Dict[str, Any] = {
            "bucket": {
                "name": [target_bucket.bucket_name],
            },
        }

        self._event_pattern = EventPattern(
            source=["aws.s3"],
            detail=event_detail,
            detail_type=["Object Created"],
        )

        # Cloudwatch Alarms (todo)

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
