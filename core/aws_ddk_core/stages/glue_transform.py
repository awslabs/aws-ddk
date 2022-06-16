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

from aws_cdk.aws_glue import CfnCrawler
from aws_cdk.aws_glue_alpha import IJob, JobExecutable
from aws_cdk.aws_iam import IRole, PolicyStatement
from aws_cdk.aws_stepfunctions import CustomState, IntegrationPattern, JsonPath, Succeed, TaskInput
from aws_cdk.aws_stepfunctions_tasks import GlueStartJobRun
from aws_ddk_core.pipelines import StateMachineStage
from aws_ddk_core.resources import GlueFactory
from constructs import Construct


class GlueTransformStage(StateMachineStage):
    """
    Class that represents a Glue Transform DDK DataStage.
    """

    def __init__(
        self,
        scope: Construct,
        id: str,
        environment_id: str,
        job_name: Optional[str] = None,
        executable: Optional[JobExecutable] = None,
        job_role: Optional[IRole] = None,
        crawler_name: Optional[str] = None,
        database_name: Optional[str] = None,
        crawler_role: Optional[IRole] = None,
        targets: Optional[CfnCrawler.TargetsProperty] = None,
        job_args: Optional[Dict[str, Any]] = None,
        state_machine_input: Optional[Dict[str, Any]] = None,
        additional_role_policy_statements: Optional[List[PolicyStatement]] = None,
        state_machine_failed_executions_alarm_threshold: Optional[int] = 1,
        state_machine_failed_executions_alarm_evaluation_periods: Optional[int] = 1,
    ) -> None:
        """
        DDK Glue Transform stage.

        Stage that contains a step function that runs Glue job, and a Glue crawler afterwards.
        If the Glue job or crawler names are not supplied, then they are created.

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the stage
        environment_id : str
            Identifier of the environment
        job_name : Optional[str]
            The name of a preexisting Glue job to run. If None, a Glue job is created
        executable : Optional[JobExecutable]
            The job executable properties
        job_role : Optional[IRole]
            The job execution role
        crawler_name : Optional[str]
            The name of a preexisting Glue crawler to run. If None, a Glue crawler is created
        database_name : Optional[str]
            The name of the database in which the crawler's output is stored
        crawler_role : Optional[IRole]
            The crawler execution role
        targets : Optional[TargetsProperty]
            A collection of targets to crawl
        job_args : Optional[Dict[str, Any]]
            The input arguments to the Glue job
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

        # If Glue job name is not supplied, create one
        self._job: Optional[IJob] = None
        if not job_name:
            self._job = GlueFactory.job(
                self,
                id=f"{id}-job",
                environment_id=environment_id,
                executable=executable,
                role=job_role,
            )
            job_name = self._job.job_name

        # If Glue crawler name is not supplied, create one
        self._crawler: Optional[CfnCrawler] = None
        if not crawler_name:
            self._crawler = CfnCrawler(
                self,
                f"{id}-crawler",
                database_name=database_name,
                targets=targets,
                role=crawler_role.role_arn,  # type: ignore
            )
            crawler_name = self._crawler.name

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
        self.build_state_machine(
            id=f"{id}-state-machine",
            environment_id=environment_id,
            definition=(start_job_run.next(crawl_object).next(Succeed(self, "success"))),
            state_machine_input=state_machine_input,
            additional_role_policy_statements=additional_role_policy_statements,
            state_machine_failed_executions_alarm_threshold=state_machine_failed_executions_alarm_threshold,
            state_machine_failed_executions_alarm_evaluation_periods=state_machine_failed_executions_alarm_evaluation_periods,  # noqa
        )

    @property
    def job(self) -> Optional[IJob]:
        """
        Return: Optional[IJob]
            The Glue job
        """
        return self._job

    @property
    def crawler(self) -> Optional[CfnCrawler]:
        """
        Return: Optional[CfnCrawler]
            The Glue crawler
        """
        return self._crawler
