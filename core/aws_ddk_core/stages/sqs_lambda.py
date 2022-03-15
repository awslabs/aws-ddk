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

from typing import Any, List, Optional

from aws_cdk import Duration
from aws_cdk.aws_cloudwatch import Alarm, ComparisonOperator, IAlarm
from aws_cdk.aws_events import EventPattern, IRuleTarget
from aws_cdk.aws_events_targets import SqsQueue
from aws_cdk.aws_iam import IRole
from aws_cdk.aws_lambda import Code, IFunction, Runtime
from aws_cdk.aws_lambda_event_sources import SqsEventSource
from aws_cdk.aws_sqs import DeadLetterQueue, IQueue
from aws_ddk_core.pipelines.stage import DataStage
from aws_ddk_core.resources import LambdaFactory, SQSFactory
from constructs import Construct


class SqsToLambdaStage(DataStage):
    """
    Class that represents an SQS to Lambda Transform DDK Stage.
    """

    def __init__(
        self,
        scope: Construct,
        id: str,
        environment_id: str,
        code: Optional[Code] = None,
        handler: Optional[str] = None,
        runtime: Runtime = Runtime.PYTHON_3_9,
        role: Optional[IRole] = None,
        memory_size: Optional[int] = None,
        timeout: Optional[Duration] = None,
        visibility_timeout: Optional[Duration] = None,
        dead_letter_queue_enabled: bool = False,
        max_receive_count: int = 1,
        batch_size: Optional[int] = None,
        lambda_function: Optional[IFunction] = None,
        sqs_queue: Optional[IQueue] = None,
        create_alarm: Optional[bool] = False,
        alarm_threshold: Optional[int] = 5,
        alarm_evaluation_periods: Optional[int] = 1
    ) -> None:
        """
        DDK SQS to Lambda stage.

        It implements an Amazon SQS queue connected to an AWS Lambda function, with an optional DLQ.

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the stage
        environment_id : str
            Identifier of the environment
        code : Optional[Code]
            The source code of the Lambda function
            Must be set if `lambda_function` is not.
        handler : Optional[str]
            The name of the method within the code that Lambda calls to execute the function.
            Must be set if `lambda_function` is not.
        runtime : Runtime
            The runtime environment for the Lambda function. `PYTHON_3_9` by default
        role : Optional[IRole]
            Lambda execution role
        memory_size : Optional[int]
            The amount of memory, in MB, that is allocated to the Lambda function. `256` by default
        timeout : Optional[Duration]
            The function execution time (in seconds) after which Lambda terminates the function.
            `aws_cdk.Duration.seconds(120)` by default
        visibility_timeout : Optional[Duration]
            Timeout of processing a single message in the queue. Default: Duration.seconds(120).
        dead_letter_queue_enabled : Optional[bool]
            Determines if DLQ is enabled. `False` by default
        max_receive_count : int
            he number of times a message can be unsuccessfully dequeued before being moved to the dead-letter queue.
            `1` by default
        batch_size : Optional[int]
            The maximum number of records retrieved from the event source at the function invocation time.
            `10` by default
        lambda_function: Optional[IFunction]
            Preexisting Lambda Function to use in stage. `None` by default
        sqs_queue: Optional[IQueue]
            Preexisting SQS Queue  to use in stage. `None` by default
        create_alarm: Optional[bool]
            Create an alarm for Lambda Function errors. `False` by default. 
        alarm_threshold: Optional[int]
            The value against which the specified alarm statistic is compared
        alarm_evaulation_periods: Optional[int]
            The number of periods over which data is compared to the specified threshold
        """
        super().__init__(scope, id)

        self._event_detail_type: str = f"{id}-event-type"

        if lambda_function:
            self._function = lambda_function
        elif code and handler:
            self._function = LambdaFactory.function(
                self,
                id=f"{id}-function",
                environment_id=environment_id,
                code=code,
                handler=handler,
                runtime=runtime,
                role=role,
                memory_size=memory_size,
                timeout=timeout,
            )
        else:
            raise ValueError("'code' and 'handler' or 'lambda_function' must be set to instanstiate this stage")

        if create_alarm:
            self._cloudwatch_alarms = [
                    Alarm(self, "{id}-function-errors",
                    comparison_operator=ComparisonOperator.GREATER_THAN_THRESHOLD,
                    threshold=alarm_threshold,
                    evaluation_periods=alarm_evaluation_periods,
                    metric=self._function.metric_errors()
                )
            ]
        
        self._dlq: Optional[DeadLetterQueue] = None
        if dead_letter_queue_enabled:
            self._dlq = DeadLetterQueue(
                max_receive_count=max_receive_count,
                queue=SQSFactory.queue(
                    self,
                    id=f"{id}-dlq",
                    environment_id=environment_id,
                ),
            )

        self._queue = sqs_queue or SQSFactory.queue(
            self,
            id=f"{id}-queue",
            environment_id=environment_id,
            visibility_timeout=visibility_timeout,
            dead_letter_queue=self._dlq,
        )

        self._function.add_event_source(SqsEventSource(queue=self._queue, batch_size=batch_size))

    @property
    def function(self) -> IFunction:
        """
        Return: Function
            The Lambda function
        """
        return self._function

    @property
    def queue(self) -> IQueue:
        """
        Return: Queue
            The SQS queue
        """
        return self._queue

    @property
    def dlq(self) -> Optional[DeadLetterQueue]:
        """
        Return: DeadLetterQueue
            The SQS dead letter queue
        """
        return self._dlq
    
    @property
    def cloudwatch_alarms(self) -> Optional[List[IAlarm]]:
        """
        Return: Alarm
            List of any alarms created by the stage
        """
        return self._cloudwatch_alarms

    def get_event_pattern(self) -> Optional[EventPattern]:
        return EventPattern(
            detail_type=[self._event_detail_type],
        )

    def get_targets(self) -> Optional[List[IRuleTarget]]:
        return [SqsQueue(self._queue)]
