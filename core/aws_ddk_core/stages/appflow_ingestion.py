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

from pathlib import Path
from typing import Any, Dict, List, Optional

from aws_cdk import Duration
from aws_cdk.aws_appflow import CfnFlow
from aws_cdk.aws_events import EventPattern, IRuleTarget, RuleTargetInput
from aws_cdk.aws_events_targets import SfnStateMachine
from aws_cdk.aws_iam import Effect, PolicyStatement, Role, ServicePrincipal
from aws_cdk.aws_lambda import Code
from aws_cdk.aws_stepfunctions import (
    Choice,
    Condition,
    CustomState,
    Fail,
    StateMachine,
    StateMachineType,
    Succeed,
    Wait,
    WaitTime,
)
from aws_cdk.aws_stepfunctions_tasks import LambdaInvoke
from aws_ddk_core.pipelines import DataStage
from aws_ddk_core.resources import LambdaFactory, StepFunctionsFactory
from constructs import Construct


class AppFlowIngestionStage(DataStage):
    """
    Class that represents an AppFlow DDK DataStage.
    """

    def __init__(
        self,
        scope: Construct,
        id: str,
        environment_id: str,
        flow_name: Optional[str] = None,
        flow_execution_status_check_period: Duration = Duration.seconds(15),
        destination_flow_config: Optional[CfnFlow.DestinationFlowConfigProperty] = None,
        source_flow_config: Optional[CfnFlow.SourceFlowConfigProperty] = None,
        tasks: Optional[List[CfnFlow.TaskProperty]] = None,
        state_machine_input: Optional[Dict[str, Any]] = None,
        additional_role_policy_statements: Optional[List[PolicyStatement]] = None,
        state_machine_failed_executions_alarm_threshold: Optional[int] = 1,
        state_machine_failed_executions_alarm_evaluation_periods: Optional[int] = 1,
    ) -> None:
        """
        DDK AppFlow Ingestion stage.

        Stage that contains a step function that runs an AppFlow flow ingestion.
        If the AppFlow flow name is not supplied, then it is created.

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the stage
        environment_id : str
            Identifier of the environment
        flow_name : Optional[str]
            Name of the AppFlow flow to run. If None, an AppFlow flow is created
        flow_execution_status_check_period : Duration
            Time to wait between flow execution status checks.
            `aws_cdk.Duration.seconds(15)` by default
        destination_flow_config : Optional[CfnFlow.DestinationFlowConfigProperty]
            The flow destination_flow_config properties
        source_flow_config : Optional[CfnFlow.SourceFlowConfigProperty]
            The flow source_flow_config properties
        tasks : Optional[List[CfnFlow.TaskProperty]]
            The flow tasks properties
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

        self._state_machine_input: Optional[Dict[str, Any]] = state_machine_input
        self._event_detail_type: str = f"{id}-event-type"

        # If AppFlow flow name is not supplied, create one
        self._flow: Optional[CfnFlow] = None
        if not flow_name:
            self._flow = CfnFlow(
                self,
                f"{id}-flow",
                destination_flow_config_list=[destination_flow_config],
                flow_name=f"{id}-flow",
                source_flow_config=source_flow_config,
                tasks=tasks,
                trigger_config=CfnFlow.TriggerConfigProperty(trigger_type="OnDemand"),
            )
            flow_name = self._flow.flow_name

        # Create start flow step function task
        assert flow_name is not None
        flow_object = self._create_start_flow_custom_task(flow_name)

        # Create check flow execution status step function task
        flow_execution_records = self._create_check_flow_execution_task(id, environment_id)

        # Create step function loop to check flow execution status
        flow_object_execution_status = Choice(self, "check-flow-execution-status")
        flow_object_execution_status_wait = Wait(
            self,
            "wait-before-checking-flow-status-again",
            time=WaitTime.duration(flow_execution_status_check_period),
        )

        # Build state machine
        self._state_machine: StateMachine = StepFunctionsFactory.state_machine(
            self,
            id=f"{id}-state-machine",
            environment_id=environment_id,
            definition=(
                flow_object.next(flow_object_execution_status_wait)
                .next(flow_execution_records)
                .next(
                    flow_object_execution_status.when(
                        Condition.string_equals("$.FlowExecutionStatus", "Successful"),
                        Succeed(self, "success"),
                    )
                    .when(
                        Condition.string_equals("$.FlowExecutionStatus", "Error"),
                        Fail(
                            self,
                            "failure",
                            error="WorkflowFailure",
                            cause="AppFlow failure",
                        ),
                    )
                    .otherwise(flow_object_execution_status_wait)
                )
            ),
            state_machine_type=StateMachineType.STANDARD,
        )

        # Allow state machine to start flow
        self._state_machine.add_to_role_policy(
            PolicyStatement(
                effect=Effect.ALLOW,
                actions=[
                    "appflow:StartFlow",
                ],
                resources=["*"],
            )
        )
        # Additional role policy statements
        if additional_role_policy_statements:
            for statement in additional_role_policy_statements:
                self._state_machine.add_to_role_policy(statement)
        self.add_alarm(
            alarm_id=f"{id}-sm-failed-exec",
            alarm_metric=self._state_machine.metric_failed(),
            alarm_threshold=state_machine_failed_executions_alarm_threshold,
            alarm_evaluation_periods=state_machine_failed_executions_alarm_evaluation_periods,
        )

    @property
    def flow(self) -> CfnFlow:
        """
        Return: CfnFlow
            The AppFlow flow
        """
        return self._flow

    @property
    def state_machine(self) -> StateMachine:
        """
        Return: StateMachine
            The state machine
        """
        return self._state_machine

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

    def _create_start_flow_custom_task(self, flow_name: str) -> CustomState:
        return CustomState(
            self,
            "start-flow-execution",
            state_json={
                "Type": "Task",
                "Resource": "arn:aws:states:::aws-sdk:appflow:startFlow",
                "Parameters": {"FlowName": flow_name},
                "Catch": [
                    {
                        "ErrorEquals": ["Appflow.ConflictException"],
                        "Next": "wait-before-checking-flow-status-again",
                    }
                ],
            },
        )

    def _create_check_flow_execution_task(self, id: str, environment_id: str) -> LambdaInvoke:
        status_lambda_role = Role(
            self,
            f"{id}-flow-execution-status-lambda-role",
            assumed_by=ServicePrincipal("lambda.amazonaws.com"),
            description="lambda role to check appflow flow execution status",
        )

        status_lambda = LambdaFactory.function(
            self,
            id=f"{id}-flow-execution-status-lambda",
            environment_id=environment_id,
            code=Code.from_asset(str(Path(__file__).parent.joinpath("lambda_handlers/appflow_check_flow_status/"))),
            handler="lambda_function.lambda_handler",
            role=status_lambda_role,
        )

        # Enable the function to get flow execution records
        status_lambda.add_to_role_policy(
            PolicyStatement(
                effect=Effect.ALLOW,
                actions=[
                    "appflow:DescribeFlowExecutionRecords",
                ],
                resources=["*"],
            )
        )

        # Create check flow execution status step function task
        flow_execution_records = LambdaInvoke(
            self,
            "get-flow-execution-status",
            lambda_function=status_lambda,
            result_selector={"FlowExecutionStatus.$": "$.Payload"},
        )
        return flow_execution_records
