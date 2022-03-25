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

from aws_cdk.aws_events import EventPattern, IRuleTarget, RuleTargetInput
from aws_cdk.aws_events_targets import SfnStateMachine
from aws_cdk.aws_iam import Effect, PolicyStatement
from aws_cdk.aws_kms import Key
from aws_cdk.aws_s3 import Location
from aws_cdk.aws_stepfunctions import (
    CustomState,
    IntegrationPattern,
    JsonPath,
    StateMachine,
    StateMachineType,
    Succeed,
    TaskInput,
)
from aws_cdk.aws_stepfunctions_tasks import (
    AthenaStartQueryExecution,
    EncryptionConfiguration,
    EncryptionOption,
    QueryExecutionContext,
    ResultConfiguration,
)
from aws_ddk_core.pipelines import DataStage
from aws_ddk_core.resources import StepFunctionsFactory
from constructs import Construct


class AthenaSQLStage(DataStage):
    """
    Class that represents a Athena SQL DDK DataStage.
    """

    def __init__(
        self,
        scope: Construct,
        id: str,
        environment_id: str,
        query_string: str,
        workgroup: Optional[str] = None,
        catalog_name: Optional[str] = None,
        database_name: Optional[str] = None,
        output_bucket_name: Optional[str] = None,
        ouput_object_key: Optional[str] = None,
        encryption_option: Optional[EncryptionOption] = None,
        encryption_key: Optional[Key] = None,
        state_machine_input: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        DDK Athena SQL stage.

        Stage that contains a step function that executre Athena SQL query.

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the stage
        environment_id : str
            Identifier of the environment
        query_string : str
            SQL query that will be started
        state_machine_input : Optional[Dict[str, Any]]
            Input of the state machine
        """
        super().__init__(scope, id)

        self._state_machine_input: Optional[Dict[str, Any]] = state_machine_input
        self._event_detail_type: str = f"{id}-event-type"

        # Create AthenaStartQueryExecution step function task
        start_query_exec: AthenaStartQueryExecution = AthenaStartQueryExecution(
            self,
            "start-query-exec",
            query_string=query_string,
            integration_pattern=IntegrationPattern.RUN_JOB,
            query_execution_context=QueryExecutionContext(
                catalog_name=catalog_name,
                database_name=database_name,
            )
            if catalog_name and database_name
            else None,
            result_configuration=ResultConfiguration(
                encryption_configuration=EncryptionConfiguration(
                    encryption_option=encryption_option,
                    encryption_key=encryption_key,
                )
                if encryption_option
                else None,
                output_location=Location(
                    bucket_name=output_bucket_name,
                    object_key=ouput_object_key,
                )
                if output_bucket_name and ouput_object_key
                else None,
            )
            if not workgroup
            else None,
            work_group=workgroup,
        )
        # Build state machine
        self._state_machine: StateMachine = StepFunctionsFactory.state_machine(
            self,
            id=f"{id}-state-machine",
            environment_id=environment_id,
            definition=(start_query_exec.next(Succeed(self, "success"))),
            state_machine_type=StateMachineType.STANDARD,
        )

    def get_event_pattern(self) -> Optional[EventPattern]:
        return EventPattern(
            source=["aws.states"],
            detail_type=["Step Functions Execution Status Change"],
            detail={
                "status": ["SUCCEEDED"],
                "stateMachineArn": [self._state_machine.state_machine_arn],
            },
        )

    def get_targets(self) -> Optional[List[IRuleTarget]]:
        """
        Get input targets of the stage.

        Targets are used by Event Rules to describe what should be invoked when a rule matches an event.

        Returns
        -------
        targets : Optional[List[IRuleTarget]]
            List of targets
        """
        return [
            SfnStateMachine(
                self._state_machine,
                input=RuleTargetInput.from_object(self._state_machine_input),
            )
        ]
