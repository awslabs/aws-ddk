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

import aws_cdk.aws_sns as sns
from aws_cdk.assertions import Template
from aws_ddk_core.base import BaseStack
from aws_ddk_core.pipelines import DataStage
from constructs import Construct

    

def test_data_stage_with_alarm(test_stack: BaseStack) -> None:
    class TestAlarm(DataStage):
        """
        Class that represents a Firehose to S3 Ingestion DDK Stage.
        """

        def __init__(self, scope: Construct, id: str, alarm_threshold: str) -> None:

            topic = sns.Topic(self, "test-topic")

            # self.add_alarm(
            #     alarm_id=f"{id}-errors",
            #     alarm_metric=topic.metric_number_of_notifications_failed(),
            #     alarm_threshold=alarm_threshold,
            # )

    TestAlarm(
        scope=test_stack,
        id="dummy-data-stage",
        alarm_threshold=5,
    )

    # template = Template.from_stack(test_stack)
    # template.has_resource_properties(
    #     "AWS::CloudWatch::Alarm",
    #     props={
    #         "AlarmThreshold": 5,
    #     },
    # )
