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

from abc import abstractmethod
from typing import List, Optional

from aws_cdk.aws_cloudwatch import Alarm, ComparisonOperator, IAlarm, IMetric
from aws_cdk.aws_events import EventPattern, IRuleTarget
from constructs import Construct


class DataStage(Construct):
    """
    Class that represents a stage within a data pipeline.

    To create a DataStage, inherit from this class, add infrastructure required by the stage, and implement
    get_event_pattern and get_targets methods. For example:

    .. code-block:: python

        class MyStage(DataStage):
            def __init__(
                self,
                scope: Construct,
                id: str,
                environment_id: str,
            ) -> None:
                # Define stage infrastructure, for example a queue
                self._queue = SQSFactory.queue(
                    self,
                    id,
                    environment_id,
                )

            @property
            def queue(self) -> Queue:
                '''
                Return: Queue
                    The SQS queue
                '''
                return self._queue

            def get_event_pattern(self) -> Optional[EventPattern]:
                return EventPattern(
                    detail_type=["my-detail-type"],
                )

            def get_targets(self) -> Optional[List[IRuleTarget]]:
                return [SqsQueue(self._queue)]

    """

    def __init__(
        self,
        scope: Construct,
        id: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
    ) -> None:
        """
        Create a stage.

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the stage
        name : Optional[str]
            Name of the stage
        description :  Optional[str]
            Description of the stage
        """
        super().__init__(scope, id)

        self.id: str = id
        self.name: Optional[str] = name
        self.description: Optional[str] = description
        self._cloudwatch_alarms: List[Optional[IAlarm]] = []

    @abstractmethod
    def get_targets(self) -> Optional[List[IRuleTarget]]:
        """
        Get input targets of the stage.

        Targets are used by Event Rules to describe what should be invoked when a rule matches an event.

        Returns
        -------
        targets : Optional[List[IRuleTarget]]
            List of targets
        """
        pass

    @abstractmethod
    def get_event_pattern(self) -> Optional[EventPattern]:
        """
        Get output event pattern of the stage.

        Event pattern describes the structure of output event(s) produced by this stage. Event Rules use
        event patterns to select events and route them to targets.

        Returns
        -------
        event_pattern : Optional[EventPattern]
            Event pattern
        """
        pass

    def add_alarm(
        self,
        alarm_id: str,
        alarm_metric: IMetric,
        alarm_comparison_operator: Optional[ComparisonOperator] = ComparisonOperator.GREATER_THAN_THRESHOLD,
        alarm_evaluation_periods: Optional[int] = 1,
        alarm_threshold: Optional[int] = 5,
    ) -> "DataStage":
        """
        Add a CloudWatch alarm for the Data Stage

        Parameters
        ----------
        alarm_id: str
            Identifier of the CloudWatch Alarm.
        alarm_metric: IMetric
            Metric to use for creating the Stage's CloudWatch Alarm.
        alarm_comparison_operator: Optional[ComparisonOperator]
            Comparison operator to use for alarm. `GREATER_THAN_THRESHOLD` by default.
        alarm_threshold: Optional[int]
            The value against which the specified alarm statistic is compared. `5` by default.
        alarm_evaluation_periods: Optional[int]
            The number of periods over which data is compared to the specified threshold. `1` by default.
        """
        self._cloudwatch_alarms.append(
            Alarm(
                scope=self,
                id=alarm_id,
                comparison_operator=alarm_comparison_operator,
                threshold=alarm_threshold,
                evaluation_periods=alarm_evaluation_periods,
                metric=alarm_metric,
            )
        )
        return self

    @property
    def cloudwatch_alarms(self) -> List[Optional[IAlarm]]:
        """
        Return: List[Alarm]
            List of CloudWatch Alarms linked to the stage
        """
        return self._cloudwatch_alarms
