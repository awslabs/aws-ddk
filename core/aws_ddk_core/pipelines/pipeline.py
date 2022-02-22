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

from typing import List, Optional

from aws_cdk.aws_events import EventPattern, IRuleTarget, Rule
from aws_ddk_core.pipelines.stage import Stage
from constructs import Construct


class Pipeline(Construct):
    """
    Class that represents a data pipeline. Used to wire stages via Event Rules. For example:

    .. code-block:: python

        Pipeline(self, id, description="My pipeline")
            .add_stage(my_lambda_stage)
            .add_stage(my_glue_stage)

    """

    def __init__(
        self,
        scope: Construct,
        id: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
    ) -> None:
        """
        Create a data pipeline.

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the pipeline
        name : Optional[str]
            Name of the pipeline
        description : Optional[str]
            Description of the pipeline
        """
        super().__init__(scope, f"{id}-pipeline")

        self.id: str = id
        self.name: Optional[str] = name
        self.description: Optional[str] = description
        self._prev_stage: Optional[Stage] = None
        self._rules: List[Rule] = []

    def add_stage(self, stage: Stage, skip_rule: bool = False, override_rule: Optional[Rule] = None) -> "Pipeline":
        """
        Add a stage to the data pipeline.

        By default, creates an Event Rule that matches output event pattern of the previous stage
        with targets of the next one.

        Parameters
        ----------
        stage : Stage
            Stage instance
        skip_rule : bool
            Skip creation of the default rule
        override_rule : Optional[Rule]
            Override the default rule by the rule specified in this parameter

        Returns
        -------
        pipeline : Pipeline
            Pipeline
        """
        if override_rule:
            self.add_rule(override_rule=override_rule)
        elif self._prev_stage and not skip_rule:
            self.add_rule(
                id=f"{self.id}-{stage.id}-rule",
                event_pattern=self._prev_stage.get_event_pattern(),
                event_targets=stage.get_targets(),
            )
        self._prev_stage = stage
        return self

    def add_rule(
        self,
        id: Optional[str] = None,
        event_pattern: Optional[EventPattern] = None,
        event_targets: Optional[List[IRuleTarget]] = None,
        override_rule: Optional[Rule] = None,
    ) -> "Pipeline":
        """
        Create a rule that matches specificed event pattern with the specified target.

        Parameters
        ----------
        id : Optional[str]
            Identifier of the rule
        event_pattern : Optional[EventPattern]
            Event pattern of the rule
        event_targets : Optional[List[IRuleTarget]]
            Target of the rule - usually previous_stage.get_targets()
        override_rule : Optional[Rule]
            Custom rule

        Returns
        -------
        pipeline : Pipeline
            Pipeline
        """
        self._rules.append(
            override_rule
            if override_rule
            else Rule(
                self,
                id,
                event_pattern=event_pattern,
                targets=event_targets,
            )
        )
        return self
