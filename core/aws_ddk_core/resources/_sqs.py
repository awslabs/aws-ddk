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

import aws_cdk as cdk
import aws_cdk.aws_sqs as sqs
from aws_cdk.aws_iam import AccountPrincipal, AnyPrincipal, Effect, PolicyStatement
from aws_ddk_core.config import Config
from aws_ddk_core.resources.commons import BaseSchema, Duration
from constructs import Construct
from marshmallow import fields

_logger: logging.Logger = logging.getLogger(__name__)


class QueueSchema(BaseSchema):
    """DDK SQS queue Marshmallow schema."""

    content_based_deduplication = fields.Bool()
    data_key_reuse = Duration()
    delivery_delay = Duration()
    max_message_size_bytes = fields.Int()
    retention_period = Duration()
    visibility_timeout = Duration(load_default=cdk.Duration.seconds(120))
    receive_message_wait_time = Duration()


class SQSFactory:
    """
    Class factory create and configure Simple Queue Service DDK resources, including Queues.
    """

    @staticmethod
    def queue(
        scope: Construct,
        environment_id: str,
        id: str,
        queue_name: Optional[str] = None,
        encryption: Optional[sqs.QueueEncryption] = None,
        removal_policy: Optional[cdk.RemovalPolicy] = None,
        dead_letter_queue: Optional[sqs.DeadLetterQueue] = None,
        **queue_props: Any,
    ) -> sqs.IQueue:
        """
        Create and configure SQS queue.

        This construct allows to configure parameters of the queue using ddk.json configuration file
        depending on the `environment_id` in which the function is used. Supported parameters are:
        `content_based_deduplication`,`data_key_reuse`, `delivery_delay`, `max_message_size_bytes`,
        `retention_period`, `visibility_timeout`, `receive_message_wait_time`, and `removal_policy`.

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the queue
        environment_id : str
            Identifier of the environment
        queue_name : Optional[str]
            Name of the queue
        encryption : Optional[QueueEncryption]
            Whether the contents of the queue are encrypted, and by what type of key.
            `aws_cdk.aws_sqs.QueueEncryption.KMS_MANAGED` by default.
        removal_policy : Optional[RemovalPolicy]
            Policy to apply when the bucket is removed from this stack
            `aws_cdk.RemovalPolicy.RETAIN` by default.
        dead_letter_queue : Optional[DeadLetterQueue]
            Send messages to this queue if they were unsuccessfully dequeued a number of times.
        queue_props : Any
            Additional queue properties. For complete list of properties refer to CDK Documentation -
            SQS Queue: https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_sqs/Queue.html

        Returns
        -------
        queue : aws_cdk.aws_sqs.Queue
            SQS queue
        """
        # Load and validate the config
        queue_config_props: Dict[str, Any] = QueueSchema().load(
            Config().get_resource_config(
                environment_id=environment_id,
                id=id,
            )
        )
        # Collect args
        queue_props = {
            "queue_name": queue_name,
            "encryption": encryption,
            "removal_policy": removal_policy,
            "dead_letter_queue": dead_letter_queue,
            **queue_props,
        }
        # Explicit ("hardcoded") props should always take precedence over config
        for key, value in queue_props.items():
            if value is not None:
                queue_config_props[key] = value

        _logger.debug(f"queue_config_props: {queue_config_props}")
        queue: sqs.IQueue = sqs.Queue(scope, id, **queue_config_props)

        SQSFactory.apply_secure_queue_policy(queue)

        return queue

    @staticmethod
    def apply_secure_queue_policy(queue: sqs.IQueue) -> None:
        # Apply queue policy to enforce that only the queue owner can perform operations
        queue.add_to_resource_policy(
            PolicyStatement(
                sid="QueueOwnerOnlyAccess",
                effect=Effect.ALLOW,
                principals=[AccountPrincipal(cdk.Stack.of(queue).account)],
                actions=[
                    "sqs:AddPermission",
                    "sqs:DeleteMessage",
                    "sqs:GetQueueAttributes",
                    "sqs:ReceiveMessage",
                    "sqs:RemovePermission",
                    "sqs:SendMessage",
                    "sqs:SetQueueAttributes",
                ],
                resources=[f"{queue.queue_arn}"],
            )
        )

        # Apply Topic policy to enforce encryption of data in transit
        queue.add_to_resource_policy(
            PolicyStatement(
                sid="HttpsOnly",
                effect=Effect.DENY,
                principals=[AnyPrincipal()],
                actions=[
                    "SQS:*",
                ],
                resources=[f"{queue.queue_arn}"],
                conditions={"Bool": {"aws:SecureTransport": False}},
            )
        )
