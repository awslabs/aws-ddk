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

from aws_cdk.aws_databrew import CfnJob
from aws_cdk.aws_iam import PolicyStatement
from aws_cdk.aws_stepfunctions import IntegrationPattern, Succeed
from aws_cdk.aws_stepfunctions_tasks import GlueDataBrewStartJobRun
from aws_ddk_core.pipelines import StateMachineStage
from aws_ddk_core.resources import DataBrewFactory
from constructs import Construct


class DataBrewTransformStage(StateMachineStage):
    """
    Class that represents a DataBrew Transform DDK DataStage.
    """

    def __init__(
        self,
        scope: Construct,
        id: str,
        environment_id: str,
        job_name: Optional[str] = None,
        job_role_arn: Optional[str] = None,
        job_type: Optional[str] = None,
        dataset_name: Optional[str] = None,
        recipe: Optional[CfnJob.RecipeProperty] = None,
        outputs: Optional[List[CfnJob.OutputProperty]] = None,
        state_machine_input: Optional[Dict[str, Any]] = None,
        additional_role_policy_statements: Optional[List[PolicyStatement]] = None,
        state_machine_failed_executions_alarm_threshold: Optional[int] = 1,
        state_machine_failed_executions_alarm_evaluation_periods: Optional[int] = 1,
    ) -> None:
        """
        DDK DataBrew Transform stage.

        Stage that contains a step function that runs DataBrew job

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the stage
        environment_id : str
            Identifier of the environment
        job_name : Optional[str]
            The name of a preexisting DataBrew job to run. If None, a DataBrew job is created
        job_role_arn : Optional[str]
            The Arn of the job execution role. Required if job_name is None.
        job_type : Optional[str]
            The type of job to run.  Required if job_name is None.
        dataset_name : Optional[str]
            The name of the dataset to use for the job.
        recipe : Optional[CfnJob.RecipeProperty]
            The recipe to be used by the DataBrew job which is a series of data transformation steps.
        outputs : Optional[List[CfnJob.OutputProperty]]
            The output properties for the job.
        state_machine_input : Optional[Dict[str, Any]]
            The input dict to the state machine
        additional_role_policy_statements : Optional[List[PolicyStatement]]
            Additional IAM policy statements to add to the state machine role
        state_machine_failed_executions_alarm_threshold: Optional[int]
            The number of failed state machine executions before triggering CW alarm. Defaults to `1`
        state_machine_failed_executions_alarm_evaluation_periods: Optional[int]
            The number of periods over which data is compared to the specified threshold. Defaults to `1`
        """
        super().__init__(scope, id)

        self._event_detail_type: str = f"{id}-event-type"

        # If None, a DataBrew job is created
        self._job: Optional[CfnJob] = None
        if not job_name:
            self._job = DataBrewFactory.job(
                self,
                id=f"{id}-job",
                environment_id=environment_id,
                name=f"{id}-job",
                role_arn=job_role_arn,  # type: ignore
                type=job_type,  # type: ignore
                dataset_name=dataset_name,
                recipe=recipe,
                outputs=outputs,
            )
            job_name = self._job.name

        # Create GlueDataBrewStartJobRun step function task
        start_job_run: GlueDataBrewStartJobRun = GlueDataBrewStartJobRun(
            self,
            "start-job-run",
            name=job_name,
            integration_pattern=IntegrationPattern.RUN_JOB,
        )

        # Build state machine
        self.build_state_machine(
            id=f"{id}-state-machine",
            environment_id=environment_id,
            definition=(start_job_run.next(Succeed(self, "success"))),
            state_machine_input=state_machine_input,
            additional_role_policy_statements=additional_role_policy_statements,
            state_machine_failed_executions_alarm_threshold=state_machine_failed_executions_alarm_threshold,
            state_machine_failed_executions_alarm_evaluation_periods=state_machine_failed_executions_alarm_evaluation_periods,  # noqa
        )

    @property
    def job(self) -> Optional[CfnJob]:
        """
        Return: Optional[CfnJob]
            The DataBrew job
        """
        return self._job
