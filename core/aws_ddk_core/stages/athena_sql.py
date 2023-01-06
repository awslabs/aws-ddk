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

from aws_cdk.aws_events import IRuleTarget, RuleTargetInput
from aws_cdk.aws_events_targets import SfnStateMachine
from aws_cdk.aws_iam import PolicyStatement
from aws_cdk.aws_kms import Key
from aws_cdk.aws_s3 import Location
from aws_cdk.aws_stepfunctions import IntegrationPattern, JsonPath, Succeed
from aws_cdk.aws_stepfunctions_tasks import (
    AthenaStartQueryExecution,
    EncryptionConfiguration,
    EncryptionOption,
    QueryExecutionContext,
    ResultConfiguration,
)
from aws_ddk_core.pipelines import StateMachineStage
from constructs import Construct


class AthenaSQLStage(StateMachineStage):
    """
    Class that represents a Athena SQL DDK DataStage.
    """

    def __init__(
        self,
        scope: Construct,
        id: str,
        environment_id: str,
        query_string: Optional[str] = None,
        query_string_path: Optional[str] = None,
        workgroup: Optional[str] = None,
        catalog_name: Optional[str] = None,
        database_name: Optional[str] = None,
        output_bucket_name: Optional[str] = None,
        output_object_key: Optional[str] = None,
        encryption_option: Optional[EncryptionOption] = None,
        encryption_key: Optional[Key] = None,
        state_machine_input: Optional[Dict[str, Any]] = None,
        additional_role_policy_statements: Optional[List[PolicyStatement]] = None,
        state_machine_failed_executions_alarm_threshold: Optional[int] = 1,
        state_machine_failed_executions_alarm_evaluation_periods: Optional[int] = 1,
    ) -> None:
        """
        DDK Athena SQL stage.

        Stage that contains a step function that execute Athena SQL query.

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the stage
        environment_id : str
            Identifier of the environment
        query_string : Optional[str]
            SQL query that will be started
        query_string_path : Optional[str]
            dynamic path in statemachine for SQL query to be started
        workgroup : Optional[str]
            Workgroup name
        catalog_name : Optional[str]
            Catalog name
        database_name : Optional[str]
            Database name
        output_bucket_name : Optional[str]
            Output S3 bucket name
        output_object_key : Optional[str]
            Output S3 key
        encryption_option : Optional[EncryptionOption]
            Encryption configuration
        encryption_key : Optional[Key]
            Encryption KMS key
        state_machine_input : Optional[Dict[str, Any]]
            Input of the state machine
        additional_role_policy_statements : Optional[List[PolicyStatement]]
            Additional IAM policy statements to add to the state machine role
        state_machine_failed_executions_alarm_threshold: Optional[int]
            The number of failed state machine executions before triggering CW alarm. Defaults to `1`
        state_machine_failed_executions_alarm_evaluation_periods: Optional[int]
            The number of periods over which data is compared to the specified threshold. Defaults to `1`
        """
        super().__init__(scope, id)

        if query_string and query_string_path:
            raise ValueError("For this stage provide one of query_string or query_string_path parameter, not both")

        if query_string is None and query_string_path is None:
            raise ValueError("For this stage one of query_string or query_string_path parameter is required")

        self._event_detail_type: str = f"{id}-event-type"
        self._query_string = query_string
        self._state_machine_input = state_machine_input
        self._event_bridge_event_path: Optional[str] = "$.detail" if query_string_path else None

        # Create AthenaStartQueryExecution step function task
        start_query_exec: AthenaStartQueryExecution = AthenaStartQueryExecution(
            self,
            "start-query-exec",
            query_string=query_string if query_string else JsonPath.string_at(query_string_path),
            integration_pattern=IntegrationPattern.RUN_JOB,
            query_execution_context=QueryExecutionContext(
                catalog_name=catalog_name if catalog_name else None,
                database_name=database_name if database_name else None,
            )
            if catalog_name or database_name
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
                    object_key=output_object_key,
                )
                if output_bucket_name and output_object_key
                else None,
            )
            if encryption_option or (output_bucket_name and output_object_key)
            else None,
            work_group=workgroup if workgroup else None,
        )

        # Build state machine
        self.build_state_machine(
            id=f"{id}-state-machine",
            environment_id=environment_id,
            definition=(start_query_exec.next(Succeed(self, "success"))),
            state_machine_input=state_machine_input,
            additional_role_policy_statements=additional_role_policy_statements,
            state_machine_failed_executions_alarm_threshold=state_machine_failed_executions_alarm_threshold,
            state_machine_failed_executions_alarm_evaluation_periods=state_machine_failed_executions_alarm_evaluation_periods,  # noqa
        )

    def get_targets(self) -> Optional[List[IRuleTarget]]:
        return [
            SfnStateMachine(
                self.state_machine,
                input=RuleTargetInput.from_object(self._state_machine_input)
                if self._query_string
                else RuleTargetInput.from_event_path(self._event_bridge_event_path),
            )
        ]
