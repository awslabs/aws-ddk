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
from aws_cdk.aws_stepfunctions import (
    CustomState,
    IntegrationPattern,
    JsonPath,
    StateMachine,
    StateMachineType,
    Succeed,
    TaskInput,
)
from aws_cdk.aws_stepfunctions_tasks import GlueStartJobRun
from aws_ddk_core.pipelines.stage import Stage
from constructs import Construct


class GlueTransformStage(Stage):
    """
    Class that represents a Glue Transform DDK Stage.
    """

    def __init__(
        self,
        scope: Construct,
        id: str,
        environment_id: str,
        job_name: str,
        crawler_name: str,
        job_args: Optional[Dict[str, Any]] = None,
        state_machine_input: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        DDK Glue Transform stage.

        Stage that contains a step function that runs Glue job, and a Glue crawler afterwards.
        Both the Glue job and the crawler must be pre-created.

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the stage
        environment_id : str
            Identifier of the environment
        job_name : str
            Name of the Glue job to run
        crawler_name : str
            Name of the Glue crawler to run
        job_args : Optional[Dict[str, Any]]
            Glue job arguments
        state_machine_input : Optional[Dict[str, Any]]
            Input of the state machine
        """
        super().__init__(scope, id)

        self._state_machine_input: Optional[Dict[str, Any]] = state_machine_input
        # Create GlueStartJobRun step function task
        start_job_run: GlueStartJobRun = GlueStartJobRun(
            self,
            "start-job-run",
            glue_job_name=job_name,
            integration_pattern=IntegrationPattern.RUN_JOB,
            arguments=TaskInput.from_object(
                obj=job_args,
            )
            if job_args
            else None,
            result_path=JsonPath.DISCARD,
        )
        # Create start crawler step function task
        crawl_object = CustomState(
            self,
            "crawl-object",
            state_json={
                "Type": "Task",
                "Resource": "arn:aws:states:::aws-sdk:glue:startCrawler",
                "Parameters": {"Name": crawler_name},
                "Catch": [{"ErrorEquals": ["Glue.CrawlerRunningException"], "Next": "success"}],
            },
        )
        # Build state machine
        self._state_machine: StateMachine = StateMachine(
            self,
            "state-machine",
            definition=(start_job_run.next(crawl_object).next(Succeed(self, "success"))),
            state_machine_type=StateMachineType.EXPRESS,
        )
        # Allow state machine to start crawler
        self._state_machine.add_to_role_policy(
            PolicyStatement(
                effect=Effect.ALLOW,
                actions=[
                    "glue:StartCrawler",
                ],
                resources=["*"],
            )
        )

    @property
    def state_machine(self) -> StateMachine:
        """
        Return: StateMachine
            The StateMachine
        """
        return self._state_machine

    def get_event_pattern(self) -> Optional[EventPattern]:
        return None

    def get_targets(self) -> Optional[List[IRuleTarget]]:
        return [SfnStateMachine(self._state_machine, input=RuleTargetInput.from_object(self._state_machine_input))]
