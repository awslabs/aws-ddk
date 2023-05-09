---
title: Create Your Own Data Pipeline Stage
layout: how-to
tags: how-to
order: 1
category: Advanced
---

## The DataStage Class

The AWS DDK provides a construct: [DataStage()](https://awslabs.github.io/aws-ddk/release/latest/api/core/stubs/aws_ddk_core.pipelines.DataStage.html#aws_ddk_core.pipelines.DataStage) that can be inherited to build your own custom stages.

## Building Your Own Data Stage
Let's say we need to create a stage that publishes S3 events to an SNS Topic.

We'll first need to create a Stage for the topic.

I'll write a file to my application stack package called `sns.py`.

```python
from typing import Any, Dict, List, Optional

from aws_cdk.aws_events import EventPattern, IRuleTarget
from aws_cdk.aws_events_targets import SnsTopic
from aws_cdk.aws_sns import Topic, ITopic
from aws_cdk.aws_kms import Key
from aws_ddk_core.pipelines import DataStage # importing DataStage class for ddk core
from constructs import Construct


class SNSStage(DataStage):
    """
    Class that represents a SNS DDK Stage.
    """

    def __init__(
        self,
        scope: Construct,
        id: str,
        environment_id: str,
        **kwargs: Any,
    ) -> None:
        """
        DDK SNS stage.
        """
        super().__init__(scope, id, **kwargs)

        self._event_detail_type: str = f"{id}-event-type"

        # create topic
        self._topic = Topic(
            self, f"{id}-topic"
        )

    @property
    def topic(self) -> ITopic:
        """
        Return: Topic
            The SNS Topic
        """
        return self._topic

    # method to retrieve Event Pattern
    def get_event_pattern(self) -> Optional[EventPattern]:
        return EventPattern(
            detail_type=[self._event_detail_type],
        )

    # methord to retrieve Event Rule Target
    def get_targets(self) -> Optional[List[IRuleTarget]]:
        return [SnsTopic(self._topic)]

```

Now that I have a new class defining my SNS stage, I can instantiate it and add to my Data Pipeline.

```python
.....
from ddk_app.sns import SNSStage # import my class I built above


class DDKApplicationStack(BaseStack):
    def __init__(
        self, scope: Construct, id: str, environment_id: str, **kwargs: Any
    ) -> None:
        super().__init__(scope, id, environment_id, **kwargs)

        # create my bucket
        ddk_bucket = S3Factory.bucket(
            self,
            "ddk-bucket",
            environment_id,
        )
        
        # create an S3 Event Stage based off the class available from `aws_ddk_core.stages`
        s3_event_stage = S3EventStage(
            scope=self,
            id="ddk-s3-event",
            environment_id=environment_id,
            event_names=["Object Created"],
            bucket_name=ddk_bucket.bucket_name,
            key_prefix="raw",
        )

        # instantiate my sns stage class
        sns_stage = SNSStage(
            scope=self,
            id="ddk-sns",
            environment_id=environment_id,
        )

        # construct my DataPipeline
        (
            DataPipeline(scope=self, id="ddk-pipeline")
                .add_stage(s3_event_stage)
                .add_stage(sns_stage)
        )    
```

## Build 
Use `ddk deploy` to build your infrastructure.

## Conclusion
You should now have a Bucket that routes events to a Topic.

![Result](/aws-ddk/img/s3-to-sns.png)

