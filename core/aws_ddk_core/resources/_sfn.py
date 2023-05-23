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

import logging
from typing import Any, Dict, Optional

import aws_cdk.aws_stepfunctions as sfn
from aws_ddk_core.config import Config
from aws_ddk_core.resources.commons import BaseSchema, Duration
from constructs import Construct
from marshmallow import ValidationError, fields

_logger: logging.Logger = logging.getLogger(__name__)


class StateMachineSchema(BaseSchema):
    """DDK Step Functions State Machine Marshmallow schema."""

    tracing_enabled = fields.Bool()
    timeout = Duration()
    state_machine_type = fields.Method(deserialize="load_state_machine_type")

    def load_state_machine_type(self, value: str) -> sfn.StateMachineType:
        state_machine_types: Dict[str, sfn.StateMachineType] = sfn.StateMachineType._member_map_
        try:
            return state_machine_types[value.upper()]
        except KeyError as error:
            raise ValidationError(
                f"`state_machine_type` value must be one of {state_machine_types.values()}."
            ) from error


class StepFunctionsFactory:
    """
    Class factory create and configure AWS Step Functions Service DDK resources, including State Machines.
    """

    @staticmethod
    def state_machine(
        scope: Construct,
        environment_id: str,
        id: str,
        state_machine_name: Optional[str] = None,
        state_machine_type: Optional[sfn.StateMachineType] = None,
        timeout: Optional[Duration] = None,
        tracing_enabled: Optional[bool] = None,
        **state_machine_props: Any,
    ) -> sfn.StateMachine:
        """
        Create and configure state machine.

        This construct allows to configure parameters of the state machine using ddk.json configuration file
        depending on the `environment_id` in which the function is used. Supported parameters are:
        `state_machine_type`,`timeout`, and `tracing_enabled`.

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the state machine
        environment_id : str
            Identifier of the environment
        state_machine_name : Optional[str]
            Name of the state machine
        state_machine_type : Optional[sfn.StateMachineType]
            Type of the state machine
        timeout : Optional[Duration]
            Maximum run time for this state machine
        tracing_enabled : Optional[bool]
            Specifies whether Amazon X-Ray tracing is enabled for this state machine
        state_machine_props : Any
            Additional state machine properties. For complete list of properties refer to CDK Documentation -
            State Machine: https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_stepfunctions/StateMachine.html

        Returns
        -------
        state_machine : aws_cdk.aws_stepfunctions.StateMachine
            State machine
        """
        # Load and validate the config
        state_machine_config_props: Dict[str, Any] = StateMachineSchema().load(
            Config().get_resource_config(
                environment_id=environment_id,
                id=id,
            ),
            partial=["removal_policy"],
        )
        # Collect args
        state_machine_props = {
            "state_machine_name": state_machine_name,
            "state_machine_type": state_machine_type,
            "timeout": timeout,
            "tracing_enabled": tracing_enabled,
            **state_machine_props,
        }
        # Explicit ("hardcoded") props should always take precedence over config
        for key, value in state_machine_props.items():
            if value is not None:
                state_machine_config_props[key] = value

        _logger.debug(f"state_machine_config_props: {state_machine_config_props}")
        return sfn.StateMachine(scope, id, **state_machine_config_props)
