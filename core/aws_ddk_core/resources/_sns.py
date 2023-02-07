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
import aws_cdk.aws_kms as kms
import aws_cdk.aws_sns as sns
import aws_cdk.aws_sqs as sqs
from aws_cdk.aws_iam import AccountPrincipal, AnyPrincipal, Effect, PolicyStatement
from aws_ddk_core.config import Config
from aws_ddk_core.resources.commons import BaseSchema
from constructs import Construct
from marshmallow import fields

_logger: logging.Logger = logging.getLogger(__name__)


class TopicSchema(BaseSchema):
    """DDK SNS Topic Marshmallow schema."""

    content_based_deduplication = fields.Bool()
    fifo = fields.Bool()
    display_name = fields.Str()


class SNSFactory:
    """
    Class factory create and configure Simple Notification Service DDK resources, including Topics.
    """

    @staticmethod
    def topic(
        scope: Construct,
        environment_id: str,
        id: str,
        topic_name: Optional[str] = None,
        master_key: Optional[kms.IKey] = None,
        **topic_props: Any,
    ) -> sns.ITopic:
        """
        Create and configure SNS topic.

        This construct allows to configure parameters of the topic using ddk.json configuration file
        depending on the `environment_id` in which the function is used. Supported parameters are:
        `content_based_deduplication`,`fifo`, `display_name`

        Parameters
        ----------
        scope : Construct
            Scope within which this construct is defined
        id : str
            Identifier of the queue
        environment_id : str
            Identifier of the environment
        topic_name : Optional[str]
            Name of the queue
        master_key : Optional[kms.IKey]
            Whether the contents of the topic are encrypted, and by what type of key.
        topic_props : Any
            Additional topic properties. For complete list of properties refer to CDK Documentation -
            SNS Topic: https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_sns/Topic.html

        Returns
        -------
        topic : aws_cdk.aws_sns.Topic
            SNS topic
        """
        # Load and validate the config
        topic_config_props: Dict[str, Any] = TopicSchema().load(
            Config().get_resource_config(
                environment_id=environment_id,
                id=id,
            ),
            partial=["removal_policy"],
        )
        # Collect args
        topic_props = {
            "topic_name": topic_name,
            "master_key": master_key,
            **topic_props,
        }
        # Explicit ("hardcoded") props should always take precedence over config
        for key, value in topic_props.items():
            if value is not None:
                topic_config_props[key] = value

        _logger.debug(f"topic_config_props: {topic_config_props}")
        topic: sns.ITopic = sns.Topic(scope, id, **topic_config_props)

        SNSFactory.apply_secure_queue_policy(topic)

        return topic

    @staticmethod
    def apply_secure_queue_policy(topic: sns.ITopic) -> None:
        # Apply queue policy to enforce that only the queue owner can perform operations
        topic.add_to_resource_policy(
            PolicyStatement(
                sid="TopicOwnerOnlyAccess",
                effect=Effect.ALLOW,
                principals=[AccountPrincipal(cdk.Stack.of(topic).account)],
                actions=[
                    "sns:AddPermission",
                    "sns:GetTopicAttributes",
                    "sns:SetTopicAttributes",
                    "sns:Subscribe",
                    "sns:RemovePermission",
                    "sns:Publish",
                ],
                resources=[f"{topic.topic_arn}"],
            )
        )

        # Apply Topic policy to enforce encryption of data in transit
        # sns:* gives error Invalid parameter: Policy statement action out of service scope!
        topic.add_to_resource_policy(
            PolicyStatement(
                sid="HttpsOnly",
                effect=Effect.DENY,
                principals=[AnyPrincipal()],
                actions=["sns:Subscribe", "sns:Publish"],
                resources=[f"{topic.topic_arn}"],
                conditions={"Bool": {"aws:SecureTransport": False}},
            )
        )
