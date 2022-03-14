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

from aws_cdk.aws_events import EventPattern, IRuleTarget
from aws_cdk.aws_events_targets import SfnStateMachine
from aws_cdk.aws_stepfunctions import IChainable, StateMachine, StateMachineType
from aws_cdk.aws_stepfunctions_tasks import EventBridgePutEvents, EventBridgePutEventsEntry
from aws_ddk_core.pipelines.stage import DataStage
from aws_ddk_core.resources import StepFunctionsFactory
from constructs import Construct


class StateMachineStage(DataStage):
    """
    DataStage, but contains helper methods for creating state machines and events.
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
        super().__init__(scope, id, name, description)

    def create_state_machine(
        self,
        id: str,
        environment_id: str,
        definition: Optional[IChainable],
        state_machine_type: StateMachineType = StateMachineType.EXPRESS,
        state_machine: Optional[StateMachine] = None,
        add_output_event_task: bool = True,
    ) -> None:
        """
        Create state machine. Automatically adds a task at the end that publishes an event to EventBridge.

        Parameters
        ----------
        id : str
            Identifier of the state machine
        environment_id : str
            Identifier of the environment
        definition : Optional[IChainable]
            State machine definition
        state_machine_type : StateMachineType
            Type of the state machine
        state_machine : Optional[StateMachine]
            Escape hatch to override state machine
        add_output_event_task : bool
            Add task to publish an event at the end of the state machine. `True` by default.
        """
        if add_output_event_task and definition and not state_machine:
            definition = definition.next(self.get_event_task(self, "put-event", [self.get_output_event()]))

        self._state_machine: StateMachine = state_machine or StepFunctionsFactory.state_machine(
            self,
            id=id,
            environment_id=environment_id,
            definition=definition,
            state_machine_type=state_machine_type,
        )

    @abstractmethod
    def get_output_event(self) -> EventBridgePutEventsEntry:
        """
        Get event entry that should be published at the end of the state machine.

        Returns
        -------
        event : EventBridgePutEventsEntry
            Event
        """
        pass

    @staticmethod
    def get_event_task(scope: Construct, id: str, events: List[EventBridgePutEventsEntry]) -> EventBridgePutEvents:
        """
        Get event task that will be added as a last task of the state machine.

        Returns
        -------
        event : EventBridgePutEvents
            EventBridgePutEvents task
        """
        return EventBridgePutEvents(scope, id, entries=events)

    @property
    def state_machine(self) -> StateMachine:
        """
        Return: StateMachine
            State machine
        """
        return self._state_machine

    def get_targets(self) -> Optional[List[IRuleTarget]]:
        """
        Get input targets of the stage.

        Targets are used by Event Rules to describe what should be invoked when a rule matches an event.

        Returns
        -------
        targets : Optional[List[IRuleTarget]]
            List of targets
        """
        return [SfnStateMachine(self._state_machine)]

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
        success_event: EventBridgePutEventsEntry = self.get_output_event()
        return EventPattern(
            detail_type=[success_event.detail_type] if success_event.detail_type else None,
            source=[success_event.source] if success_event.source else None,
        )
