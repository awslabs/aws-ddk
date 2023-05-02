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

{% tabs class %}
{% tab class typescript %}
I'll write a file to my application stack package called `sns.ts`.

```javascript
import * as events from "aws-cdk-lib/aws-events";
import * as eventsTargets from "aws-cdk-lib/aws-events-targets";
import * as sns from "aws-cdk-lib/aws-sns";
import { DataStage } from "aws-ddk-core";
import { Construct } from "constructs"; 


export class SNSStage extends DataStage {
  readonly topic: sns.ITopic;
  readonly targets?: events.IRuleTarget[];
  readonly eventPattern?: events.EventPattern;
  
  constructor(scope: Construct, id: string) {
    super(scope, id, {});
    this.topic = new sns.Topic(this, `${id}-topic`)
    this.eventPattern = {
      detailType: [`${id}-event-type`],
    }
    this.targets = [new eventsTargets.SnsTopic(this.topic)]
  }

}
```
Now that I have a new class defining my SNS stage, I can instantiate it and add to my Data Pipeline.

```javascript
import * as cdk from "aws-cdk-lib";
import { BaseStack, BaseStackProps, DataPipeline, S3EventStage, S3Factory } from "aws-ddk-core";
import { Construct } from "constructs"; 
import { SNSStage } from "../lib/sns";


export class DDKApplicationStack extends BaseStack {
  
  constructor(scope: Construct, id: string, props?: BaseStackProps) {
    super(scope, id, props ?? {});
    const ddkBucket = S3Factory.bucket(this, "ddk-bucket", {})
    const s3EventStage = new S3EventStage(
      this,
      "ddk-s3-event",
      {
        eventNames: ["Object Created"],
        bucket: ddkBucket,
        keyPrefix: "raw",
      }
    )
    const snsStage = new SNSStage(
      this, "ddk-sns"
    )
    new DataPipeline(
      this, "ddk-pipeline", {}
    ).addStage({stage: s3EventStage}).addStage({stage: snsStage})
  }

}

const app = new cdk.App();
new DDKApplicationStack(app, "test-stack")

```

{% endtab %}
{% tab class python %}
I'll write a file to my application stack package called `sns.py`.
```python
from typing import Any, List, Optional

from aws_cdk.aws_events import EventPattern, IRuleTarget
from aws_cdk.aws_events_targets import SnsTopic
from aws_cdk.aws_sns import ITopic, Topic
from aws_ddk_core import DataStage  # importing DataStage class for ddk core
from constructs import Construct


class SNSStage(DataStage):
    """
    Class that represents a SNS DDK Stage.
    """

    def __init__(
        self,
        scope: Construct,
        id: str,
        **kwargs: Any,
    ) -> None:
        """
        DDK SNS stage.
        """
        super().__init__(scope, id, **kwargs)

        self._event_detail_type: str = f"{id}-event-type"

        # create topic
        self._topic = Topic(self, f"{id}-topic")

    @property
    def topic(self) -> ITopic:
        """
        Return: Topic
            The SNS Topic
        """
        return self._topic

    # method to retrieve Event Pattern
    @property
    def event_pattern(self) -> Optional[EventPattern]:
        return EventPattern(
            detail_type=[self._event_detail_type],
        )

    # methord to retrieve Event Rule Target
    @property
    def targets(self) -> Optional[List[IRuleTarget]]:
        return [SnsTopic(self._topic)]


```

Now that I have a new class defining my SNS stage, I can instantiate it and add to my Data Pipeline.

```python
from typing import Any

import aws_cdk as cdk
from aws_ddk_core import BaseStack, DataPipeline, S3EventStage, S3Factory
from constructs import Construct

from ddk_app.sns import SNSStage  # import my class I built above

app = cdk.App()


class DDKApplicationStack(BaseStack):
    def __init__(self, scope: Construct, id: str, **kwargs: Any) -> None:
        super().__init__(scope, id, **kwargs)

        # create my bucket
        ddk_bucket = S3Factory.bucket(
            self,
            "ddk-bucket",
        )

        # create an S3 Event Stage based off the class available from `aws_ddk_core.stages`
        s3_event_stage = S3EventStage(
            scope=self,
            id="ddk-s3-event",
            event_names=["Object Created"],
            bucket=ddk_bucket,
            key_prefix="raw",
        )

        # instantiate my sns stage class
        sns_stage = SNSStage(
            scope=self,
            id="ddk-sns",
        )

        # construct my DataPipeline
        (
            DataPipeline(scope=self, id="ddk-pipeline")
            .add_stage(stage=s3_event_stage)
            .add_stage(stage=sns_stage)
        )


DDKApplicationStack(app, "test-stack")


app.synth()

```
{% endtab %}

{% endtabs %}

## Build 
Use `cdk deploy` to build your infrastructure.

## Conclusion
You should now have a Bucket that routes events to a Topic.

![Result](/aws-ddk/img/s3-to-sns.png)

