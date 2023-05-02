# AWS DataOps Development Kit (DDK)
![Actions Status](https://github.com/awslabs/aws-ddk/actions/workflows/bandit.yml/badge.svg)
![Actions Status](https://github.com/awslabs/aws-ddk/actions/workflows/cfn-nag.yml/badge.svg)
![Actions Status](https://github.com/awslabs/aws-ddk/actions/workflows/cli-tests.yml/badge.svg)
![Actions Status](https://github.com/awslabs/aws-ddk/actions/workflows/core-tests.yml/badge.svg)


The AWS DataOps Development Kit is an open source development framework for customers that build data workflows and modern data architecture on AWS.

Based on the [AWS CDK](https://github.com/aws/aws-cdk), it offers high-level abstractions allowing you to build pipelines that manage data flows on AWS, driven by DevOps best practices.  The framework is extensible, you can add abstractions for your own data processing infrastructure or replace our best practices with your own standards. It's easy to share templates, so everyone in your organisation can concentrate on the business logic of dealing with their data, rather than boilerplate logic.

---

The **DDK Core** is a library of CDK constructs that you can use to build data workflows and modern data architecture on AWS, following our best practice. The DDK Core is modular and extensible, if our best practice doesn't work for you, then you can update and share your own version with the rest of your organisation by leveraging a private **AWS Code Artifact** repository.

You can compose constructs from the DDK Core into a **DDK App**.  Your DDK App can also add contain constructs from the CDK Framework or the [AWS Construct Library](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html).

You can use the **DDK CLI** to manage your DDK App.  You can use it to create a new app from a template, or deploy your DDK app to AWS.

## Overview

For a detailed walk-through, check out our [Workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/3644b48b-1d7c-43ef-a353-6edcd96385af/en-US) or
take a look at [examples](https://github.com/aws-samples/aws-ddk-examples).

### Build Data Pipelines

One of the core features of DDK is ability to create Data Pipelines. A DDK [DataPipeline](https://awslabs.github.io/aws-ddk/release/stable/api/core/stubs/aws_ddk_core.pipelines.DataPipeline.html)
is a chained series of stages. It automatically “wires” the stages together using
[AWS EventBridge Rules](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rules.html) .

DDK comes with a library of stages, however users can also create their own based on their use cases,
and are encouraged to share them with the community.

Let's take a look at an example below:

```python
...

firehose_s3_stage = KinesisToS3Stage(
    self,
    "ddk-firehose-s3",
    environment_id=environment_id,
    bucket=ddk_bucket,
    data_output_prefix="raw/",
)
sqs_lambda_stage = SqsToLambdaStage(
    scope=self,
    id="ddk-sqs-lambda",
    environment_id=environment_id,
    code=Code.from_asset("./lambda"),
    handler="index.lambda_handler",
    layers=[
        LayerVersion.from_layer_version_arn(
            self,
            "ddk-lambda-layer-wrangler",
            f"arn:aws:lambda:{self.region}:336392948345:layer:AWSDataWrangler-Python39:2",
        )
    ]
)

(
    DataPipeline(scope=self, id="ddk-pipeline")
    .add_stage(firehose_s3_stage)
    .add_stage(sqs_lambda_stage)
)
...
```

First, we import the required resources from the aws_ddk_core library, including the two stage constructs:
[KinesisToS3Stage](https://awslabs.github.io/aws-ddk/release/stable/api/core/stubs/aws_ddk_core.stages.KinesisToS3Stage.html), and
[SQSToLambdaStage()](https://awslabs.github.io/aws-ddk/release/stable/api/core/stubs/aws_ddk_core.stages.SqsToLambdaStage.html).
These two classes are then instantiated and the delivery stream is configured with the S3 prefix (raw/).
Finally, the DDK DataPipeline construct is used to chain these two stages together into a data pipeline.

Complete source code of the data pipeline above can be found in
[AWS DDK Examples - Basic Data Pipeline](https://github.com/aws-samples/aws-ddk-examples/tree/main/basic-data-pipeline)

### Resource Configuration

Another core feature of DDK is ability to provide environment-dependent configuration to your resources.

In the example below, we create Kinesis Data Stream using
[KinesisStreamsFactory](https://awslabs.github.io/aws-ddk/release/latest/api/core/stubs/aws_ddk_core.resources.KinesisStreamsFactory.html#aws_ddk_core.resources.KinesisStreamsFactory).

```python
...
from aws_ddk_core.resources import KinesisStreamsFactory

...
data_stream = KinesisStreamsFactory.data_stream(
    self, id=f"example-data-stream", environment_id=environment_id,
)
...
```

Resources created by DDK factories are automatically configured with properties from `ddk.json`.

```json
{
    "environments": {
        "test": {
            "account": "3333333333333",
            "region": "us-east-1",
            "resources": {
                "example-data-stream": {"shard_count": 5},
            }
        }
    }
}
```

In this example, the Kinesis Data Stream will be configured with `5` shards.

### Starting a new project

Install or update the AWS DDK from PyPi.

![pip install aws-ddk](./docs/source/_static/pip-install.gif)

Create a new project:

```console
ddk init sample-app
```
This will create a `sample-app` directory inside the current folder.
Inside that directory, it will generate the initial project structure, and initialize a virtual environment.

```console
sample-app
├── .gitignore
├── .venv
├── README.md
├── app.py
├── cdk.json
├── ddk.json
├── ddk_app
│   ├── __init__.py
│   └── ddk_app_stack.py
├── requirements-dev.txt
├── requirements.txt
├── setup.py
└── source.bat
```

To activate the virtual environment, and install the dependencies, run:

```console
source .venv/bin/activate && pip install -r requirements.txt
```

Next, let us examine the code. If you look at app.py, it will look like this:

```python
import aws_cdk as cdk
from ddk_app.ddk_app_stack import DdkApplicationStack

app = cdk.App()
DdkApplicationStack(app, "DdkApplication", "dev")

app.synth()
```

If your AWS account hasn't been used to deploy DDK apps before, then you need to bootstrap your environment:

```console
ddk bootstrap
```

You can then deploy your DDK app:

```console
ddk deploy
```

### Official Resources
- [Workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/3644b48b-1d7c-43ef-a353-6edcd96385af/en-US)
- [Documentation](https://awslabs.github.io/aws-ddk/)
- [API Reference](https://awslabs.github.io/aws-ddk/release/stable/api/index)
- [Examples](https://github.com/aws-samples/aws-ddk-examples/)

## Getting Help

The best way to interact with our team is through GitHub.  You can open an issue and choose from one of our templates for bug reports, feature requests, or documentation issues.  If you have a feature request, don't forget you can search existing issues and upvote or comment on existing issues before creating a new one.

## Contributing

We welcome community contributions and pull requests.  Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to set up a development
environment and submit code.

## Other Ways to Support

One way you can support our project is by letting others know that your organisation uses the DDK.  If you would like us to include your company's name and/or logo in this README file, please raise a 'Support the DDK' issue.  Note that by raising a this issue (and related pull request), you are granting AWS permission to use your company’s name (and logo) for the limited purpose described here and you are confirming that you have authority to grant such permission.

## License
This project is licensed under the Apache-2.0 License.
# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### AppFlowIngestionStage <a name="AppFlowIngestionStage" id="aws-ddk-core.AppFlowIngestionStage"></a>

Stage that contains a step function that runs an AppFlow flow ingestion.

If the AppFlow flow name is not supplied, then the flow is created.

#### Initializers <a name="Initializers" id="aws-ddk-core.AppFlowIngestionStage.Initializer"></a>

```typescript
import { AppFlowIngestionStage } from 'aws-ddk-core'

new AppFlowIngestionStage(scope: Construct, id: string, props: AppFlowIngestionStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AppFlowIngestionStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | Scope within which this construct is defined. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStage.Initializer.parameter.id">id</a></code> | <code>string</code> | Identifier of the stage. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.AppFlowIngestionStageProps">AppFlowIngestionStageProps</a></code> | Properties for the stage. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.AppFlowIngestionStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

Scope within which this construct is defined.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.AppFlowIngestionStage.Initializer.parameter.id"></a>

- *Type:* string

Identifier of the stage.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.AppFlowIngestionStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AppFlowIngestionStageProps">AppFlowIngestionStageProps</a>

Properties for the stage.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.AppFlowIngestionStage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStage.addAlarm">addAlarm</a></code> | Add a CloudWatch alarm for the DataStage. |

---

##### `toString` <a name="toString" id="aws-ddk-core.AppFlowIngestionStage.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addAlarm` <a name="addAlarm" id="aws-ddk-core.AppFlowIngestionStage.addAlarm"></a>

```typescript
public addAlarm(id: string, props: AlarmProps): DataStage
```

Add a CloudWatch alarm for the DataStage.

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.AppFlowIngestionStage.addAlarm.parameter.id"></a>

- *Type:* string

Identifier of the CloudWatch Alarm.

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.AppFlowIngestionStage.addAlarm.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AlarmProps">AlarmProps</a>

Properties for the alarm.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.AppFlowIngestionStage.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-core.AppFlowIngestionStage.isConstruct"></a>

```typescript
import { AppFlowIngestionStage } from 'aws-ddk-core'

AppFlowIngestionStage.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-core.AppFlowIngestionStage.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AppFlowIngestionStage.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStage.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | Output event pattern of the stage. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStage.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | Input targets for the stage. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStage.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Flag indicating whether the alarms are enabled for this stage. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStage.property.cloudwatchAlarms">cloudwatchAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm[]</code> | List of CloudWatch Alarms linked to the stage. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStage.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.StateMachine</code> | State machine. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStage.property.flowName">flowName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.AppFlowIngestionStage.property.flowObject">flowObject</a></code> | <code>aws-cdk-lib.aws_stepfunctions_tasks.CallAwsService</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-core.AppFlowIngestionStage.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.AppFlowIngestionStage.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.AppFlowIngestionStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

Output event pattern of the stage.

Event pattern describes the structure of output event(s) produced by this stage.
Event Rules use event patterns to select events and route them to targets.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.AppFlowIngestionStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.AppFlowIngestionStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

Input targets for the stage.

Targets are used by Event Rules to describe what should be invoked when a rule matches an event.

---

##### `alarmsEnabled`<sup>Required</sup> <a name="alarmsEnabled" id="aws-ddk-core.AppFlowIngestionStage.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

Flag indicating whether the alarms are enabled for this stage.

---

##### `cloudwatchAlarms`<sup>Required</sup> <a name="cloudwatchAlarms" id="aws-ddk-core.AppFlowIngestionStage.property.cloudwatchAlarms"></a>

```typescript
public readonly cloudwatchAlarms: Alarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm[]

List of CloudWatch Alarms linked to the stage.

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="aws-ddk-core.AppFlowIngestionStage.property.stateMachine"></a>

```typescript
public readonly stateMachine: StateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.StateMachine

State machine.

---

##### `flowName`<sup>Required</sup> <a name="flowName" id="aws-ddk-core.AppFlowIngestionStage.property.flowName"></a>

```typescript
public readonly flowName: string;
```

- *Type:* string

---

##### `flowObject`<sup>Required</sup> <a name="flowObject" id="aws-ddk-core.AppFlowIngestionStage.property.flowObject"></a>

```typescript
public readonly flowObject: CallAwsService;
```

- *Type:* aws-cdk-lib.aws_stepfunctions_tasks.CallAwsService

---


### AthenaSQLStage <a name="AthenaSQLStage" id="aws-ddk-core.AthenaSQLStage"></a>

Stage that contains a step function that execute Athena SQL query.

#### Initializers <a name="Initializers" id="aws-ddk-core.AthenaSQLStage.Initializer"></a>

```typescript
import { AthenaSQLStage } from 'aws-ddk-core'

new AthenaSQLStage(scope: Construct, id: string, props: AthenaToSQLStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AthenaSQLStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | Scope within which this construct is defined. |
| <code><a href="#aws-ddk-core.AthenaSQLStage.Initializer.parameter.id">id</a></code> | <code>string</code> | Identifier of the stage. |
| <code><a href="#aws-ddk-core.AthenaSQLStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.AthenaToSQLStageProps">AthenaToSQLStageProps</a></code> | Properties for the stage. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.AthenaSQLStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

Scope within which this construct is defined.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.AthenaSQLStage.Initializer.parameter.id"></a>

- *Type:* string

Identifier of the stage.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.AthenaSQLStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AthenaToSQLStageProps">AthenaToSQLStageProps</a>

Properties for the stage.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.AthenaSQLStage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.AthenaSQLStage.addAlarm">addAlarm</a></code> | Add a CloudWatch alarm for the DataStage. |

---

##### `toString` <a name="toString" id="aws-ddk-core.AthenaSQLStage.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addAlarm` <a name="addAlarm" id="aws-ddk-core.AthenaSQLStage.addAlarm"></a>

```typescript
public addAlarm(id: string, props: AlarmProps): DataStage
```

Add a CloudWatch alarm for the DataStage.

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.AthenaSQLStage.addAlarm.parameter.id"></a>

- *Type:* string

Identifier of the CloudWatch Alarm.

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.AthenaSQLStage.addAlarm.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AlarmProps">AlarmProps</a>

Properties for the alarm.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.AthenaSQLStage.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-core.AthenaSQLStage.isConstruct"></a>

```typescript
import { AthenaSQLStage } from 'aws-ddk-core'

AthenaSQLStage.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-core.AthenaSQLStage.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AthenaSQLStage.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-core.AthenaSQLStage.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.AthenaSQLStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | Output event pattern of the stage. |
| <code><a href="#aws-ddk-core.AthenaSQLStage.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.AthenaSQLStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | Input targets for the stage. |
| <code><a href="#aws-ddk-core.AthenaSQLStage.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Flag indicating whether the alarms are enabled for this stage. |
| <code><a href="#aws-ddk-core.AthenaSQLStage.property.cloudwatchAlarms">cloudwatchAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm[]</code> | List of CloudWatch Alarms linked to the stage. |
| <code><a href="#aws-ddk-core.AthenaSQLStage.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.StateMachine</code> | State machine. |
| <code><a href="#aws-ddk-core.AthenaSQLStage.property.eventBridgeEventPath">eventBridgeEventPath</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaSQLStage.property.stateMachineInput">stateMachineInput</a></code> | <code>{[ key: string ]: any}</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-core.AthenaSQLStage.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.AthenaSQLStage.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.AthenaSQLStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

Output event pattern of the stage.

Event pattern describes the structure of output event(s) produced by this stage.
Event Rules use event patterns to select events and route them to targets.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.AthenaSQLStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.AthenaSQLStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

Input targets for the stage.

Targets are used by Event Rules to describe what should be invoked when a rule matches an event.

---

##### `alarmsEnabled`<sup>Required</sup> <a name="alarmsEnabled" id="aws-ddk-core.AthenaSQLStage.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

Flag indicating whether the alarms are enabled for this stage.

---

##### `cloudwatchAlarms`<sup>Required</sup> <a name="cloudwatchAlarms" id="aws-ddk-core.AthenaSQLStage.property.cloudwatchAlarms"></a>

```typescript
public readonly cloudwatchAlarms: Alarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm[]

List of CloudWatch Alarms linked to the stage.

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="aws-ddk-core.AthenaSQLStage.property.stateMachine"></a>

```typescript
public readonly stateMachine: StateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.StateMachine

State machine.

---

##### `eventBridgeEventPath`<sup>Optional</sup> <a name="eventBridgeEventPath" id="aws-ddk-core.AthenaSQLStage.property.eventBridgeEventPath"></a>

```typescript
public readonly eventBridgeEventPath: string;
```

- *Type:* string

---

##### `stateMachineInput`<sup>Optional</sup> <a name="stateMachineInput" id="aws-ddk-core.AthenaSQLStage.property.stateMachineInput"></a>

```typescript
public readonly stateMachineInput: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

---


### BaseStack <a name="BaseStack" id="aws-ddk-core.BaseStack"></a>

Base Stack to inherit from.

Includes configurable termination protection, synthesizer, permissions boundary and tags.

#### Initializers <a name="Initializers" id="aws-ddk-core.BaseStack.Initializer"></a>

```typescript
import { BaseStack } from 'aws-ddk-core'

new BaseStack(scope: Construct, id: string, props: BaseStackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.BaseStack.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | Scope within which this construct is defined. |
| <code><a href="#aws-ddk-core.BaseStack.Initializer.parameter.id">id</a></code> | <code>string</code> | Identifier of the stack. |
| <code><a href="#aws-ddk-core.BaseStack.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.BaseStackProps">BaseStackProps</a></code> | Stack properties. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.BaseStack.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

Scope within which this construct is defined.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.BaseStack.Initializer.parameter.id"></a>

- *Type:* string

Identifier of the stack.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.BaseStack.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.BaseStackProps">BaseStackProps</a>

Stack properties.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.BaseStack.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.BaseStack.addDependency">addDependency</a></code> | Add a dependency between this stack and another stack. |
| <code><a href="#aws-ddk-core.BaseStack.addMetadata">addMetadata</a></code> | Adds an arbitary key-value pair, with information you want to record about the stack. |
| <code><a href="#aws-ddk-core.BaseStack.addTransform">addTransform</a></code> | Add a Transform to this stack. A Transform is a macro that AWS CloudFormation uses to process your template. |
| <code><a href="#aws-ddk-core.BaseStack.exportStringListValue">exportStringListValue</a></code> | Create a CloudFormation Export for a string list value. |
| <code><a href="#aws-ddk-core.BaseStack.exportValue">exportValue</a></code> | Create a CloudFormation Export for a string value. |
| <code><a href="#aws-ddk-core.BaseStack.formatArn">formatArn</a></code> | Creates an ARN from components. |
| <code><a href="#aws-ddk-core.BaseStack.getLogicalId">getLogicalId</a></code> | Allocates a stack-unique CloudFormation-compatible logical identity for a specific resource. |
| <code><a href="#aws-ddk-core.BaseStack.regionalFact">regionalFact</a></code> | Look up a fact value for the given fact for the region of this stack. |
| <code><a href="#aws-ddk-core.BaseStack.renameLogicalId">renameLogicalId</a></code> | Rename a generated logical identities. |
| <code><a href="#aws-ddk-core.BaseStack.reportMissingContextKey">reportMissingContextKey</a></code> | Indicate that a context key was expected. |
| <code><a href="#aws-ddk-core.BaseStack.resolve">resolve</a></code> | Resolve a tokenized value in the context of the current stack. |
| <code><a href="#aws-ddk-core.BaseStack.splitArn">splitArn</a></code> | Splits the provided ARN into its components. |
| <code><a href="#aws-ddk-core.BaseStack.toJsonString">toJsonString</a></code> | Convert an object, potentially containing tokens, to a JSON string. |

---

##### `toString` <a name="toString" id="aws-ddk-core.BaseStack.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addDependency` <a name="addDependency" id="aws-ddk-core.BaseStack.addDependency"></a>

```typescript
public addDependency(target: Stack, reason?: string): void
```

Add a dependency between this stack and another stack.

This can be used to define dependencies between any two stacks within an
app, and also supports nested stacks.

###### `target`<sup>Required</sup> <a name="target" id="aws-ddk-core.BaseStack.addDependency.parameter.target"></a>

- *Type:* aws-cdk-lib.Stack

---

###### `reason`<sup>Optional</sup> <a name="reason" id="aws-ddk-core.BaseStack.addDependency.parameter.reason"></a>

- *Type:* string

---

##### `addMetadata` <a name="addMetadata" id="aws-ddk-core.BaseStack.addMetadata"></a>

```typescript
public addMetadata(key: string, value: any): void
```

Adds an arbitary key-value pair, with information you want to record about the stack.

These get translated to the Metadata section of the generated template.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html)

###### `key`<sup>Required</sup> <a name="key" id="aws-ddk-core.BaseStack.addMetadata.parameter.key"></a>

- *Type:* string

---

###### `value`<sup>Required</sup> <a name="value" id="aws-ddk-core.BaseStack.addMetadata.parameter.value"></a>

- *Type:* any

---

##### `addTransform` <a name="addTransform" id="aws-ddk-core.BaseStack.addTransform"></a>

```typescript
public addTransform(transform: string): void
```

Add a Transform to this stack. A Transform is a macro that AWS CloudFormation uses to process your template.

Duplicate values are removed when stack is synthesized.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-section-structure.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-section-structure.html)

*Example*

```typescript
declare const stack: Stack;

stack.addTransform('AWS::Serverless-2016-10-31')
```


###### `transform`<sup>Required</sup> <a name="transform" id="aws-ddk-core.BaseStack.addTransform.parameter.transform"></a>

- *Type:* string

The transform to add.

---

##### `exportStringListValue` <a name="exportStringListValue" id="aws-ddk-core.BaseStack.exportStringListValue"></a>

```typescript
public exportStringListValue(exportedValue: any, options?: ExportValueOptions): string[]
```

Create a CloudFormation Export for a string list value.

Returns a string list representing the corresponding `Fn.importValue()`
expression for this Export. The export expression is automatically wrapped with an
`Fn::Join` and the import value with an `Fn::Split`, since CloudFormation can only
export strings. You can control the name for the export by passing the `name` option.

If you don't supply a value for `name`, the value you're exporting must be
a Resource attribute (for example: `bucket.bucketName`) and it will be
given the same name as the automatic cross-stack reference that would be created
if you used the attribute in another Stack.

One of the uses for this method is to *remove* the relationship between
two Stacks established by automatic cross-stack references. It will
temporarily ensure that the CloudFormation Export still exists while you
remove the reference from the consuming stack. After that, you can remove
the resource and the manual export.

See `exportValue` for an example of this process.

###### `exportedValue`<sup>Required</sup> <a name="exportedValue" id="aws-ddk-core.BaseStack.exportStringListValue.parameter.exportedValue"></a>

- *Type:* any

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-ddk-core.BaseStack.exportStringListValue.parameter.options"></a>

- *Type:* aws-cdk-lib.ExportValueOptions

---

##### `exportValue` <a name="exportValue" id="aws-ddk-core.BaseStack.exportValue"></a>

```typescript
public exportValue(exportedValue: any, options?: ExportValueOptions): string
```

Create a CloudFormation Export for a string value.

Returns a string representing the corresponding `Fn.importValue()`
expression for this Export. You can control the name for the export by
passing the `name` option.

If you don't supply a value for `name`, the value you're exporting must be
a Resource attribute (for example: `bucket.bucketName`) and it will be
given the same name as the automatic cross-stack reference that would be created
if you used the attribute in another Stack.

One of the uses for this method is to *remove* the relationship between
two Stacks established by automatic cross-stack references. It will
temporarily ensure that the CloudFormation Export still exists while you
remove the reference from the consuming stack. After that, you can remove
the resource and the manual export.

###### `exportedValue`<sup>Required</sup> <a name="exportedValue" id="aws-ddk-core.BaseStack.exportValue.parameter.exportedValue"></a>

- *Type:* any

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-ddk-core.BaseStack.exportValue.parameter.options"></a>

- *Type:* aws-cdk-lib.ExportValueOptions

---

##### `formatArn` <a name="formatArn" id="aws-ddk-core.BaseStack.formatArn"></a>

```typescript
public formatArn(components: ArnComponents): string
```

Creates an ARN from components.

If `partition`, `region` or `account` are not specified, the stack's
partition, region and account will be used.

If any component is the empty string, an empty string will be inserted
into the generated ARN at the location that component corresponds to.

The ARN will be formatted as follows:

   arn:{partition}:{service}:{region}:{account}:{resource}{sep}{resource-name}

The required ARN pieces that are omitted will be taken from the stack that
the 'scope' is attached to. If all ARN pieces are supplied, the supplied scope
can be 'undefined'.

###### `components`<sup>Required</sup> <a name="components" id="aws-ddk-core.BaseStack.formatArn.parameter.components"></a>

- *Type:* aws-cdk-lib.ArnComponents

---

##### `getLogicalId` <a name="getLogicalId" id="aws-ddk-core.BaseStack.getLogicalId"></a>

```typescript
public getLogicalId(element: CfnElement): string
```

Allocates a stack-unique CloudFormation-compatible logical identity for a specific resource.

This method is called when a `CfnElement` is created and used to render the
initial logical identity of resources. Logical ID renames are applied at
this stage.

This method uses the protected method `allocateLogicalId` to render the
logical ID for an element. To modify the naming scheme, extend the `Stack`
class and override this method.

###### `element`<sup>Required</sup> <a name="element" id="aws-ddk-core.BaseStack.getLogicalId.parameter.element"></a>

- *Type:* aws-cdk-lib.CfnElement

The CloudFormation element for which a logical identity is needed.

---

##### `regionalFact` <a name="regionalFact" id="aws-ddk-core.BaseStack.regionalFact"></a>

```typescript
public regionalFact(factName: string, defaultValue?: string): string
```

Look up a fact value for the given fact for the region of this stack.

Will return a definite value only if the region of the current stack is resolved.
If not, a lookup map will be added to the stack and the lookup will be done at
CDK deployment time.

What regions will be included in the lookup map is controlled by the
`@aws-cdk/core:target-partitions` context value: it must be set to a list
of partitions, and only regions from the given partitions will be included.
If no such context key is set, all regions will be included.

This function is intended to be used by construct library authors. Application
builders can rely on the abstractions offered by construct libraries and do
not have to worry about regional facts.

If `defaultValue` is not given, it is an error if the fact is unknown for
the given region.

###### `factName`<sup>Required</sup> <a name="factName" id="aws-ddk-core.BaseStack.regionalFact.parameter.factName"></a>

- *Type:* string

---

###### `defaultValue`<sup>Optional</sup> <a name="defaultValue" id="aws-ddk-core.BaseStack.regionalFact.parameter.defaultValue"></a>

- *Type:* string

---

##### `renameLogicalId` <a name="renameLogicalId" id="aws-ddk-core.BaseStack.renameLogicalId"></a>

```typescript
public renameLogicalId(oldId: string, newId: string): void
```

Rename a generated logical identities.

To modify the naming scheme strategy, extend the `Stack` class and
override the `allocateLogicalId` method.

###### `oldId`<sup>Required</sup> <a name="oldId" id="aws-ddk-core.BaseStack.renameLogicalId.parameter.oldId"></a>

- *Type:* string

---

###### `newId`<sup>Required</sup> <a name="newId" id="aws-ddk-core.BaseStack.renameLogicalId.parameter.newId"></a>

- *Type:* string

---

##### `reportMissingContextKey` <a name="reportMissingContextKey" id="aws-ddk-core.BaseStack.reportMissingContextKey"></a>

```typescript
public reportMissingContextKey(report: MissingContext): void
```

Indicate that a context key was expected.

Contains instructions which will be emitted into the cloud assembly on how
the key should be supplied.

###### `report`<sup>Required</sup> <a name="report" id="aws-ddk-core.BaseStack.reportMissingContextKey.parameter.report"></a>

- *Type:* aws-cdk-lib.cloud_assembly_schema.MissingContext

The set of parameters needed to obtain the context.

---

##### `resolve` <a name="resolve" id="aws-ddk-core.BaseStack.resolve"></a>

```typescript
public resolve(obj: any): any
```

Resolve a tokenized value in the context of the current stack.

###### `obj`<sup>Required</sup> <a name="obj" id="aws-ddk-core.BaseStack.resolve.parameter.obj"></a>

- *Type:* any

---

##### `splitArn` <a name="splitArn" id="aws-ddk-core.BaseStack.splitArn"></a>

```typescript
public splitArn(arn: string, arnFormat: ArnFormat): ArnComponents
```

Splits the provided ARN into its components.

Works both if 'arn' is a string like 'arn:aws:s3:::bucket',
and a Token representing a dynamic CloudFormation expression
(in which case the returned components will also be dynamic CloudFormation expressions,
encoded as Tokens).

###### `arn`<sup>Required</sup> <a name="arn" id="aws-ddk-core.BaseStack.splitArn.parameter.arn"></a>

- *Type:* string

the ARN to split into its components.

---

###### `arnFormat`<sup>Required</sup> <a name="arnFormat" id="aws-ddk-core.BaseStack.splitArn.parameter.arnFormat"></a>

- *Type:* aws-cdk-lib.ArnFormat

the expected format of 'arn' - depends on what format the service 'arn' represents uses.

---

##### `toJsonString` <a name="toJsonString" id="aws-ddk-core.BaseStack.toJsonString"></a>

```typescript
public toJsonString(obj: any, space?: number): string
```

Convert an object, potentially containing tokens, to a JSON string.

###### `obj`<sup>Required</sup> <a name="obj" id="aws-ddk-core.BaseStack.toJsonString.parameter.obj"></a>

- *Type:* any

---

###### `space`<sup>Optional</sup> <a name="space" id="aws-ddk-core.BaseStack.toJsonString.parameter.space"></a>

- *Type:* number

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.BaseStack.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#aws-ddk-core.BaseStack.isStack">isStack</a></code> | Return whether the given object is a Stack. |
| <code><a href="#aws-ddk-core.BaseStack.of">of</a></code> | Looks up the first stack scope in which `construct` is defined. |
| <code><a href="#aws-ddk-core.BaseStack.createDefaultPermissionsBoundary">createDefaultPermissionsBoundary</a></code> | *No description.* |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-core.BaseStack.isConstruct"></a>

```typescript
import { BaseStack } from 'aws-ddk-core'

BaseStack.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-core.BaseStack.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isStack` <a name="isStack" id="aws-ddk-core.BaseStack.isStack"></a>

```typescript
import { BaseStack } from 'aws-ddk-core'

BaseStack.isStack(x: any)
```

Return whether the given object is a Stack.

We do attribute detection since we can't reliably use 'instanceof'.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-core.BaseStack.isStack.parameter.x"></a>

- *Type:* any

---

##### `of` <a name="of" id="aws-ddk-core.BaseStack.of"></a>

```typescript
import { BaseStack } from 'aws-ddk-core'

BaseStack.of(construct: IConstruct)
```

Looks up the first stack scope in which `construct` is defined.

Fails if there is no stack up the tree.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-ddk-core.BaseStack.of.parameter.construct"></a>

- *Type:* constructs.IConstruct

The construct to start the search from.

---

##### `createDefaultPermissionsBoundary` <a name="createDefaultPermissionsBoundary" id="aws-ddk-core.BaseStack.createDefaultPermissionsBoundary"></a>

```typescript
import { BaseStack } from 'aws-ddk-core'

BaseStack.createDefaultPermissionsBoundary(scope: Construct, id: string, props: PermissionsBoundaryProps)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.BaseStack.createDefaultPermissionsBoundary.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.BaseStack.createDefaultPermissionsBoundary.parameter.id"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.BaseStack.createDefaultPermissionsBoundary.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.PermissionsBoundaryProps">PermissionsBoundaryProps</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.BaseStack.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-core.BaseStack.property.account">account</a></code> | <code>string</code> | The AWS account into which this stack will be deployed. |
| <code><a href="#aws-ddk-core.BaseStack.property.artifactId">artifactId</a></code> | <code>string</code> | The ID of the cloud assembly artifact for this stack. |
| <code><a href="#aws-ddk-core.BaseStack.property.availabilityZones">availabilityZones</a></code> | <code>string[]</code> | Returns the list of AZs that are available in the AWS environment (account/region) associated with this stack. |
| <code><a href="#aws-ddk-core.BaseStack.property.bundlingRequired">bundlingRequired</a></code> | <code>boolean</code> | Indicates whether the stack requires bundling or not. |
| <code><a href="#aws-ddk-core.BaseStack.property.dependencies">dependencies</a></code> | <code>aws-cdk-lib.Stack[]</code> | Return the stacks this stack depends on. |
| <code><a href="#aws-ddk-core.BaseStack.property.environment">environment</a></code> | <code>string</code> | The environment coordinates in which this stack is deployed. |
| <code><a href="#aws-ddk-core.BaseStack.property.nested">nested</a></code> | <code>boolean</code> | Indicates if this is a nested stack, in which case `parentStack` will include a reference to it's parent. |
| <code><a href="#aws-ddk-core.BaseStack.property.notificationArns">notificationArns</a></code> | <code>string[]</code> | Returns the list of notification Amazon Resource Names (ARNs) for the current stack. |
| <code><a href="#aws-ddk-core.BaseStack.property.partition">partition</a></code> | <code>string</code> | The partition in which this stack is defined. |
| <code><a href="#aws-ddk-core.BaseStack.property.region">region</a></code> | <code>string</code> | The AWS region into which this stack will be deployed (e.g. `us-west-2`). |
| <code><a href="#aws-ddk-core.BaseStack.property.stackId">stackId</a></code> | <code>string</code> | The ID of the stack. |
| <code><a href="#aws-ddk-core.BaseStack.property.stackName">stackName</a></code> | <code>string</code> | The concrete CloudFormation physical stack name. |
| <code><a href="#aws-ddk-core.BaseStack.property.synthesizer">synthesizer</a></code> | <code>aws-cdk-lib.IStackSynthesizer</code> | Synthesis method for this stack. |
| <code><a href="#aws-ddk-core.BaseStack.property.tags">tags</a></code> | <code>aws-cdk-lib.TagManager</code> | Tags to be applied to the stack. |
| <code><a href="#aws-ddk-core.BaseStack.property.templateFile">templateFile</a></code> | <code>string</code> | The name of the CloudFormation template file emitted to the output directory during synthesis. |
| <code><a href="#aws-ddk-core.BaseStack.property.templateOptions">templateOptions</a></code> | <code>aws-cdk-lib.ITemplateOptions</code> | Options for CloudFormation template (like version, transform, description). |
| <code><a href="#aws-ddk-core.BaseStack.property.urlSuffix">urlSuffix</a></code> | <code>string</code> | The Amazon domain suffix for the region in which this stack is defined. |
| <code><a href="#aws-ddk-core.BaseStack.property.nestedStackParent">nestedStackParent</a></code> | <code>aws-cdk-lib.Stack</code> | If this is a nested stack, returns it's parent stack. |
| <code><a href="#aws-ddk-core.BaseStack.property.nestedStackResource">nestedStackResource</a></code> | <code>aws-cdk-lib.CfnResource</code> | If this is a nested stack, this represents its `AWS::CloudFormation::Stack` resource. |
| <code><a href="#aws-ddk-core.BaseStack.property.terminationProtection">terminationProtection</a></code> | <code>boolean</code> | Whether termination protection is enabled for this stack. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-core.BaseStack.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `account`<sup>Required</sup> <a name="account" id="aws-ddk-core.BaseStack.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string

The AWS account into which this stack will be deployed.

This value is resolved according to the following rules:

1. The value provided to `env.account` when the stack is defined. This can
    either be a concrete account (e.g. `585695031111`) or the
    `Aws.ACCOUNT_ID` token.
3. `Aws.ACCOUNT_ID`, which represents the CloudFormation intrinsic reference
    `{ "Ref": "AWS::AccountId" }` encoded as a string token.

Preferably, you should use the return value as an opaque string and not
attempt to parse it to implement your logic. If you do, you must first
check that it is a concrete value an not an unresolved token. If this
value is an unresolved token (`Token.isUnresolved(stack.account)` returns
`true`), this implies that the user wishes that this stack will synthesize
into a **account-agnostic template**. In this case, your code should either
fail (throw an error, emit a synth error using `Annotations.of(construct).addError()`) or
implement some other region-agnostic behavior.

---

##### `artifactId`<sup>Required</sup> <a name="artifactId" id="aws-ddk-core.BaseStack.property.artifactId"></a>

```typescript
public readonly artifactId: string;
```

- *Type:* string

The ID of the cloud assembly artifact for this stack.

---

##### `availabilityZones`<sup>Required</sup> <a name="availabilityZones" id="aws-ddk-core.BaseStack.property.availabilityZones"></a>

```typescript
public readonly availabilityZones: string[];
```

- *Type:* string[]

Returns the list of AZs that are available in the AWS environment (account/region) associated with this stack.

If the stack is environment-agnostic (either account and/or region are
tokens), this property will return an array with 2 tokens that will resolve
at deploy-time to the first two availability zones returned from CloudFormation's
`Fn::GetAZs` intrinsic function.

If they are not available in the context, returns a set of dummy values and
reports them as missing, and let the CLI resolve them by calling EC2
`DescribeAvailabilityZones` on the target environment.

To specify a different strategy for selecting availability zones override this method.

---

##### `bundlingRequired`<sup>Required</sup> <a name="bundlingRequired" id="aws-ddk-core.BaseStack.property.bundlingRequired"></a>

```typescript
public readonly bundlingRequired: boolean;
```

- *Type:* boolean

Indicates whether the stack requires bundling or not.

---

##### `dependencies`<sup>Required</sup> <a name="dependencies" id="aws-ddk-core.BaseStack.property.dependencies"></a>

```typescript
public readonly dependencies: Stack[];
```

- *Type:* aws-cdk-lib.Stack[]

Return the stacks this stack depends on.

---

##### `environment`<sup>Required</sup> <a name="environment" id="aws-ddk-core.BaseStack.property.environment"></a>

```typescript
public readonly environment: string;
```

- *Type:* string

The environment coordinates in which this stack is deployed.

In the form
`aws://account/region`. Use `stack.account` and `stack.region` to obtain
the specific values, no need to parse.

You can use this value to determine if two stacks are targeting the same
environment.

If either `stack.account` or `stack.region` are not concrete values (e.g.
`Aws.ACCOUNT_ID` or `Aws.REGION`) the special strings `unknown-account` and/or
`unknown-region` will be used respectively to indicate this stack is
region/account-agnostic.

---

##### `nested`<sup>Required</sup> <a name="nested" id="aws-ddk-core.BaseStack.property.nested"></a>

```typescript
public readonly nested: boolean;
```

- *Type:* boolean

Indicates if this is a nested stack, in which case `parentStack` will include a reference to it's parent.

---

##### `notificationArns`<sup>Required</sup> <a name="notificationArns" id="aws-ddk-core.BaseStack.property.notificationArns"></a>

```typescript
public readonly notificationArns: string[];
```

- *Type:* string[]

Returns the list of notification Amazon Resource Names (ARNs) for the current stack.

---

##### `partition`<sup>Required</sup> <a name="partition" id="aws-ddk-core.BaseStack.property.partition"></a>

```typescript
public readonly partition: string;
```

- *Type:* string

The partition in which this stack is defined.

---

##### `region`<sup>Required</sup> <a name="region" id="aws-ddk-core.BaseStack.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

The AWS region into which this stack will be deployed (e.g. `us-west-2`).

This value is resolved according to the following rules:

1. The value provided to `env.region` when the stack is defined. This can
    either be a concrete region (e.g. `us-west-2`) or the `Aws.REGION`
    token.
3. `Aws.REGION`, which is represents the CloudFormation intrinsic reference
    `{ "Ref": "AWS::Region" }` encoded as a string token.

Preferably, you should use the return value as an opaque string and not
attempt to parse it to implement your logic. If you do, you must first
check that it is a concrete value an not an unresolved token. If this
value is an unresolved token (`Token.isUnresolved(stack.region)` returns
`true`), this implies that the user wishes that this stack will synthesize
into a **region-agnostic template**. In this case, your code should either
fail (throw an error, emit a synth error using `Annotations.of(construct).addError()`) or
implement some other region-agnostic behavior.

---

##### `stackId`<sup>Required</sup> <a name="stackId" id="aws-ddk-core.BaseStack.property.stackId"></a>

```typescript
public readonly stackId: string;
```

- *Type:* string

The ID of the stack.

---

*Example*

```typescript
// After resolving, looks like
'arn:aws:cloudformation:us-west-2:123456789012:stack/teststack/51af3dc0-da77-11e4-872e-1234567db123'
```


##### `stackName`<sup>Required</sup> <a name="stackName" id="aws-ddk-core.BaseStack.property.stackName"></a>

```typescript
public readonly stackName: string;
```

- *Type:* string

The concrete CloudFormation physical stack name.

This is either the name defined explicitly in the `stackName` prop or
allocated based on the stack's location in the construct tree. Stacks that
are directly defined under the app use their construct `id` as their stack
name. Stacks that are defined deeper within the tree will use a hashed naming
scheme based on the construct path to ensure uniqueness.

If you wish to obtain the deploy-time AWS::StackName intrinsic,
you can use `Aws.STACK_NAME` directly.

---

##### `synthesizer`<sup>Required</sup> <a name="synthesizer" id="aws-ddk-core.BaseStack.property.synthesizer"></a>

```typescript
public readonly synthesizer: IStackSynthesizer;
```

- *Type:* aws-cdk-lib.IStackSynthesizer

Synthesis method for this stack.

---

##### `tags`<sup>Required</sup> <a name="tags" id="aws-ddk-core.BaseStack.property.tags"></a>

```typescript
public readonly tags: TagManager;
```

- *Type:* aws-cdk-lib.TagManager

Tags to be applied to the stack.

---

##### `templateFile`<sup>Required</sup> <a name="templateFile" id="aws-ddk-core.BaseStack.property.templateFile"></a>

```typescript
public readonly templateFile: string;
```

- *Type:* string

The name of the CloudFormation template file emitted to the output directory during synthesis.

Example value: `MyStack.template.json`

---

##### `templateOptions`<sup>Required</sup> <a name="templateOptions" id="aws-ddk-core.BaseStack.property.templateOptions"></a>

```typescript
public readonly templateOptions: ITemplateOptions;
```

- *Type:* aws-cdk-lib.ITemplateOptions

Options for CloudFormation template (like version, transform, description).

---

##### `urlSuffix`<sup>Required</sup> <a name="urlSuffix" id="aws-ddk-core.BaseStack.property.urlSuffix"></a>

```typescript
public readonly urlSuffix: string;
```

- *Type:* string

The Amazon domain suffix for the region in which this stack is defined.

---

##### `nestedStackParent`<sup>Optional</sup> <a name="nestedStackParent" id="aws-ddk-core.BaseStack.property.nestedStackParent"></a>

```typescript
public readonly nestedStackParent: Stack;
```

- *Type:* aws-cdk-lib.Stack

If this is a nested stack, returns it's parent stack.

---

##### `nestedStackResource`<sup>Optional</sup> <a name="nestedStackResource" id="aws-ddk-core.BaseStack.property.nestedStackResource"></a>

```typescript
public readonly nestedStackResource: CfnResource;
```

- *Type:* aws-cdk-lib.CfnResource

If this is a nested stack, this represents its `AWS::CloudFormation::Stack` resource.

`undefined` for top-level (non-nested) stacks.

---

##### `terminationProtection`<sup>Optional</sup> <a name="terminationProtection" id="aws-ddk-core.BaseStack.property.terminationProtection"></a>

```typescript
public readonly terminationProtection: boolean;
```

- *Type:* boolean

Whether termination protection is enabled for this stack.

---


### CICDPipelineStack <a name="CICDPipelineStack" id="aws-ddk-core.CICDPipelineStack"></a>

Create a stack that contains DDK Continuous Integration and Delivery (CI/CD) pipeline.

The pipeline is based on
[CDK self-mutating pipeline](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.pipelines-readme.html)
but includes several DDK-specific features, including:

- Ability to configure some properties via JSON config e.g. manual approvals for application stages
- Defaults for source/synth - CodeCommit & cdk synth, with ability to override them
- Ability to connect to private artifactory to pull artifacts from at synth
- Security best practices - ensures pipeline buckets block non-SSL, and are KMS-encrypted with rotated keys
- Builder interface to avoid chunky constructor methods

The user should be able to reuse the pipeline in multiple DDK applications hoping to save LOC.

*Example*

```typescript
const stack = new CICDPipelineStack(app, "dummy-pipeline", { environmentId: "dev", pipelineName: "dummy-pipeline" })
  .addSourceAction({ repositoryName: "dummy-repository" })
  .addSynthAction()
  .buildPipeline()
  .add_checks()
  .addStage({ stageId: "dev", stage: devStage, manualApprovals: true })
  .synth()
  .add_notifications();
```


#### Initializers <a name="Initializers" id="aws-ddk-core.CICDPipelineStack.Initializer"></a>

```typescript
import { CICDPipelineStack } from 'aws-ddk-core'

new CICDPipelineStack(scope: Construct, id: string, props: CICDPipelineStackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.CICDPipelineStack.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | Parent of this stack, usually an `App` or a `Stage`, but could be any construct. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.Initializer.parameter.id">id</a></code> | <code>string</code> | The construct ID of this stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.CICDPipelineStackProps">CICDPipelineStackProps</a></code> | Stack properties. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.CICDPipelineStack.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

Parent of this stack, usually an `App` or a `Stage`, but could be any construct.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.CICDPipelineStack.Initializer.parameter.id"></a>

- *Type:* string

The construct ID of this stack.

If `stackName` is not explicitly
defined, this id (and any parent IDs) will be used to determine the
physical ID of the stack.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.CICDPipelineStackProps">CICDPipelineStackProps</a>

Stack properties.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.CICDPipelineStack.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addDependency">addDependency</a></code> | Add a dependency between this stack and another stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addMetadata">addMetadata</a></code> | Adds an arbitary key-value pair, with information you want to record about the stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addTransform">addTransform</a></code> | Add a Transform to this stack. A Transform is a macro that AWS CloudFormation uses to process your template. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.exportStringListValue">exportStringListValue</a></code> | Create a CloudFormation Export for a string list value. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.exportValue">exportValue</a></code> | Create a CloudFormation Export for a string value. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.formatArn">formatArn</a></code> | Creates an ARN from components. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.getLogicalId">getLogicalId</a></code> | Allocates a stack-unique CloudFormation-compatible logical identity for a specific resource. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.regionalFact">regionalFact</a></code> | Look up a fact value for the given fact for the region of this stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.renameLogicalId">renameLogicalId</a></code> | Rename a generated logical identities. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.reportMissingContextKey">reportMissingContextKey</a></code> | Indicate that a context key was expected. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.resolve">resolve</a></code> | Resolve a tokenized value in the context of the current stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.splitArn">splitArn</a></code> | Splits the provided ARN into its components. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.toJsonString">toJsonString</a></code> | Convert an object, potentially containing tokens, to a JSON string. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addChecks">addChecks</a></code> | Add checks to the pipeline (e.g. linting, security, tests...). |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addCustomStage">addCustomStage</a></code> | Add custom stage to the pipeline. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addNotifications">addNotifications</a></code> | Add pipeline notifications. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addSecurityLintStage">addSecurityLintStage</a></code> | Add linting - cfn-nag, and bandit. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addSourceAction">addSourceAction</a></code> | Add source action. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addStage">addStage</a></code> | Add application stage to the CICD pipeline. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addSynthAction">addSynthAction</a></code> | Add synth action. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addTestStage">addTestStage</a></code> | Add test - e.g. pytest. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addWave">addWave</a></code> | Add multiple application stages in parallel to the CICD pipeline. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.buildPipeline">buildPipeline</a></code> | Build the pipeline structure. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.synth">synth</a></code> | Synthesize the pipeline. |

---

##### `toString` <a name="toString" id="aws-ddk-core.CICDPipelineStack.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addDependency` <a name="addDependency" id="aws-ddk-core.CICDPipelineStack.addDependency"></a>

```typescript
public addDependency(target: Stack, reason?: string): void
```

Add a dependency between this stack and another stack.

This can be used to define dependencies between any two stacks within an
app, and also supports nested stacks.

###### `target`<sup>Required</sup> <a name="target" id="aws-ddk-core.CICDPipelineStack.addDependency.parameter.target"></a>

- *Type:* aws-cdk-lib.Stack

---

###### `reason`<sup>Optional</sup> <a name="reason" id="aws-ddk-core.CICDPipelineStack.addDependency.parameter.reason"></a>

- *Type:* string

---

##### `addMetadata` <a name="addMetadata" id="aws-ddk-core.CICDPipelineStack.addMetadata"></a>

```typescript
public addMetadata(key: string, value: any): void
```

Adds an arbitary key-value pair, with information you want to record about the stack.

These get translated to the Metadata section of the generated template.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html)

###### `key`<sup>Required</sup> <a name="key" id="aws-ddk-core.CICDPipelineStack.addMetadata.parameter.key"></a>

- *Type:* string

---

###### `value`<sup>Required</sup> <a name="value" id="aws-ddk-core.CICDPipelineStack.addMetadata.parameter.value"></a>

- *Type:* any

---

##### `addTransform` <a name="addTransform" id="aws-ddk-core.CICDPipelineStack.addTransform"></a>

```typescript
public addTransform(transform: string): void
```

Add a Transform to this stack. A Transform is a macro that AWS CloudFormation uses to process your template.

Duplicate values are removed when stack is synthesized.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-section-structure.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-section-structure.html)

*Example*

```typescript
declare const stack: Stack;

stack.addTransform('AWS::Serverless-2016-10-31')
```


###### `transform`<sup>Required</sup> <a name="transform" id="aws-ddk-core.CICDPipelineStack.addTransform.parameter.transform"></a>

- *Type:* string

The transform to add.

---

##### `exportStringListValue` <a name="exportStringListValue" id="aws-ddk-core.CICDPipelineStack.exportStringListValue"></a>

```typescript
public exportStringListValue(exportedValue: any, options?: ExportValueOptions): string[]
```

Create a CloudFormation Export for a string list value.

Returns a string list representing the corresponding `Fn.importValue()`
expression for this Export. The export expression is automatically wrapped with an
`Fn::Join` and the import value with an `Fn::Split`, since CloudFormation can only
export strings. You can control the name for the export by passing the `name` option.

If you don't supply a value for `name`, the value you're exporting must be
a Resource attribute (for example: `bucket.bucketName`) and it will be
given the same name as the automatic cross-stack reference that would be created
if you used the attribute in another Stack.

One of the uses for this method is to *remove* the relationship between
two Stacks established by automatic cross-stack references. It will
temporarily ensure that the CloudFormation Export still exists while you
remove the reference from the consuming stack. After that, you can remove
the resource and the manual export.

See `exportValue` for an example of this process.

###### `exportedValue`<sup>Required</sup> <a name="exportedValue" id="aws-ddk-core.CICDPipelineStack.exportStringListValue.parameter.exportedValue"></a>

- *Type:* any

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-ddk-core.CICDPipelineStack.exportStringListValue.parameter.options"></a>

- *Type:* aws-cdk-lib.ExportValueOptions

---

##### `exportValue` <a name="exportValue" id="aws-ddk-core.CICDPipelineStack.exportValue"></a>

```typescript
public exportValue(exportedValue: any, options?: ExportValueOptions): string
```

Create a CloudFormation Export for a string value.

Returns a string representing the corresponding `Fn.importValue()`
expression for this Export. You can control the name for the export by
passing the `name` option.

If you don't supply a value for `name`, the value you're exporting must be
a Resource attribute (for example: `bucket.bucketName`) and it will be
given the same name as the automatic cross-stack reference that would be created
if you used the attribute in another Stack.

One of the uses for this method is to *remove* the relationship between
two Stacks established by automatic cross-stack references. It will
temporarily ensure that the CloudFormation Export still exists while you
remove the reference from the consuming stack. After that, you can remove
the resource and the manual export.

###### `exportedValue`<sup>Required</sup> <a name="exportedValue" id="aws-ddk-core.CICDPipelineStack.exportValue.parameter.exportedValue"></a>

- *Type:* any

---

###### `options`<sup>Optional</sup> <a name="options" id="aws-ddk-core.CICDPipelineStack.exportValue.parameter.options"></a>

- *Type:* aws-cdk-lib.ExportValueOptions

---

##### `formatArn` <a name="formatArn" id="aws-ddk-core.CICDPipelineStack.formatArn"></a>

```typescript
public formatArn(components: ArnComponents): string
```

Creates an ARN from components.

If `partition`, `region` or `account` are not specified, the stack's
partition, region and account will be used.

If any component is the empty string, an empty string will be inserted
into the generated ARN at the location that component corresponds to.

The ARN will be formatted as follows:

   arn:{partition}:{service}:{region}:{account}:{resource}{sep}{resource-name}

The required ARN pieces that are omitted will be taken from the stack that
the 'scope' is attached to. If all ARN pieces are supplied, the supplied scope
can be 'undefined'.

###### `components`<sup>Required</sup> <a name="components" id="aws-ddk-core.CICDPipelineStack.formatArn.parameter.components"></a>

- *Type:* aws-cdk-lib.ArnComponents

---

##### `getLogicalId` <a name="getLogicalId" id="aws-ddk-core.CICDPipelineStack.getLogicalId"></a>

```typescript
public getLogicalId(element: CfnElement): string
```

Allocates a stack-unique CloudFormation-compatible logical identity for a specific resource.

This method is called when a `CfnElement` is created and used to render the
initial logical identity of resources. Logical ID renames are applied at
this stage.

This method uses the protected method `allocateLogicalId` to render the
logical ID for an element. To modify the naming scheme, extend the `Stack`
class and override this method.

###### `element`<sup>Required</sup> <a name="element" id="aws-ddk-core.CICDPipelineStack.getLogicalId.parameter.element"></a>

- *Type:* aws-cdk-lib.CfnElement

The CloudFormation element for which a logical identity is needed.

---

##### `regionalFact` <a name="regionalFact" id="aws-ddk-core.CICDPipelineStack.regionalFact"></a>

```typescript
public regionalFact(factName: string, defaultValue?: string): string
```

Look up a fact value for the given fact for the region of this stack.

Will return a definite value only if the region of the current stack is resolved.
If not, a lookup map will be added to the stack and the lookup will be done at
CDK deployment time.

What regions will be included in the lookup map is controlled by the
`@aws-cdk/core:target-partitions` context value: it must be set to a list
of partitions, and only regions from the given partitions will be included.
If no such context key is set, all regions will be included.

This function is intended to be used by construct library authors. Application
builders can rely on the abstractions offered by construct libraries and do
not have to worry about regional facts.

If `defaultValue` is not given, it is an error if the fact is unknown for
the given region.

###### `factName`<sup>Required</sup> <a name="factName" id="aws-ddk-core.CICDPipelineStack.regionalFact.parameter.factName"></a>

- *Type:* string

---

###### `defaultValue`<sup>Optional</sup> <a name="defaultValue" id="aws-ddk-core.CICDPipelineStack.regionalFact.parameter.defaultValue"></a>

- *Type:* string

---

##### `renameLogicalId` <a name="renameLogicalId" id="aws-ddk-core.CICDPipelineStack.renameLogicalId"></a>

```typescript
public renameLogicalId(oldId: string, newId: string): void
```

Rename a generated logical identities.

To modify the naming scheme strategy, extend the `Stack` class and
override the `allocateLogicalId` method.

###### `oldId`<sup>Required</sup> <a name="oldId" id="aws-ddk-core.CICDPipelineStack.renameLogicalId.parameter.oldId"></a>

- *Type:* string

---

###### `newId`<sup>Required</sup> <a name="newId" id="aws-ddk-core.CICDPipelineStack.renameLogicalId.parameter.newId"></a>

- *Type:* string

---

##### `reportMissingContextKey` <a name="reportMissingContextKey" id="aws-ddk-core.CICDPipelineStack.reportMissingContextKey"></a>

```typescript
public reportMissingContextKey(report: MissingContext): void
```

Indicate that a context key was expected.

Contains instructions which will be emitted into the cloud assembly on how
the key should be supplied.

###### `report`<sup>Required</sup> <a name="report" id="aws-ddk-core.CICDPipelineStack.reportMissingContextKey.parameter.report"></a>

- *Type:* aws-cdk-lib.cloud_assembly_schema.MissingContext

The set of parameters needed to obtain the context.

---

##### `resolve` <a name="resolve" id="aws-ddk-core.CICDPipelineStack.resolve"></a>

```typescript
public resolve(obj: any): any
```

Resolve a tokenized value in the context of the current stack.

###### `obj`<sup>Required</sup> <a name="obj" id="aws-ddk-core.CICDPipelineStack.resolve.parameter.obj"></a>

- *Type:* any

---

##### `splitArn` <a name="splitArn" id="aws-ddk-core.CICDPipelineStack.splitArn"></a>

```typescript
public splitArn(arn: string, arnFormat: ArnFormat): ArnComponents
```

Splits the provided ARN into its components.

Works both if 'arn' is a string like 'arn:aws:s3:::bucket',
and a Token representing a dynamic CloudFormation expression
(in which case the returned components will also be dynamic CloudFormation expressions,
encoded as Tokens).

###### `arn`<sup>Required</sup> <a name="arn" id="aws-ddk-core.CICDPipelineStack.splitArn.parameter.arn"></a>

- *Type:* string

the ARN to split into its components.

---

###### `arnFormat`<sup>Required</sup> <a name="arnFormat" id="aws-ddk-core.CICDPipelineStack.splitArn.parameter.arnFormat"></a>

- *Type:* aws-cdk-lib.ArnFormat

the expected format of 'arn' - depends on what format the service 'arn' represents uses.

---

##### `toJsonString` <a name="toJsonString" id="aws-ddk-core.CICDPipelineStack.toJsonString"></a>

```typescript
public toJsonString(obj: any, space?: number): string
```

Convert an object, potentially containing tokens, to a JSON string.

###### `obj`<sup>Required</sup> <a name="obj" id="aws-ddk-core.CICDPipelineStack.toJsonString.parameter.obj"></a>

- *Type:* any

---

###### `space`<sup>Optional</sup> <a name="space" id="aws-ddk-core.CICDPipelineStack.toJsonString.parameter.space"></a>

- *Type:* number

---

##### `addChecks` <a name="addChecks" id="aws-ddk-core.CICDPipelineStack.addChecks"></a>

```typescript
public addChecks(): CICDPipelineStack
```

Add checks to the pipeline (e.g. linting, security, tests...).

##### `addCustomStage` <a name="addCustomStage" id="aws-ddk-core.CICDPipelineStack.addCustomStage"></a>

```typescript
public addCustomStage(props: AddCustomStageProps): CICDPipelineStack
```

Add custom stage to the pipeline.

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.addCustomStage.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AddCustomStageProps">AddCustomStageProps</a>

Properties for adding a custom stage.

---

##### `addNotifications` <a name="addNotifications" id="aws-ddk-core.CICDPipelineStack.addNotifications"></a>

```typescript
public addNotifications(props?: AddNotificationsProps): CICDPipelineStack
```

Add pipeline notifications.

Create notification rule that sends events to the specified SNS topic.

###### `props`<sup>Optional</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.addNotifications.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AddNotificationsProps">AddNotificationsProps</a>

Notification properties.

---

##### `addSecurityLintStage` <a name="addSecurityLintStage" id="aws-ddk-core.CICDPipelineStack.addSecurityLintStage"></a>

```typescript
public addSecurityLintStage(props: AddSecurityLintStageProps): CICDPipelineStack
```

Add linting - cfn-nag, and bandit.

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.addSecurityLintStage.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AddSecurityLintStageProps">AddSecurityLintStageProps</a>

Security lint properties.

---

##### `addSourceAction` <a name="addSourceAction" id="aws-ddk-core.CICDPipelineStack.addSourceAction"></a>

```typescript
public addSourceAction(props: SourceActionProps): CICDPipelineStack
```

Add source action.

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.addSourceAction.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.SourceActionProps">SourceActionProps</a>

Source action properties.

---

##### `addStage` <a name="addStage" id="aws-ddk-core.CICDPipelineStack.addStage"></a>

```typescript
public addStage(props: AddApplicationStageProps): CICDPipelineStack
```

Add application stage to the CICD pipeline.

This stage deploys your application infrastructure.

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.addStage.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AddApplicationStageProps">AddApplicationStageProps</a>

Application stage properties.

---

##### `addSynthAction` <a name="addSynthAction" id="aws-ddk-core.CICDPipelineStack.addSynthAction"></a>

```typescript
public addSynthAction(props?: SynthActionProps): CICDPipelineStack
```

Add synth action.

During synth can connect and pull artifacts from a private artifactory.

###### `props`<sup>Optional</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.addSynthAction.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.SynthActionProps">SynthActionProps</a>

Synth action properties.

---

##### `addTestStage` <a name="addTestStage" id="aws-ddk-core.CICDPipelineStack.addTestStage"></a>

```typescript
public addTestStage(props: AddTestStageProps): CICDPipelineStack
```

Add test - e.g. pytest.

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.addTestStage.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AddTestStageProps">AddTestStageProps</a>

Test stage properties.

---

##### `addWave` <a name="addWave" id="aws-ddk-core.CICDPipelineStack.addWave"></a>

```typescript
public addWave(props: AddApplicationWaveProps): CICDPipelineStack
```

Add multiple application stages in parallel to the CICD pipeline.

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.addWave.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AddApplicationWaveProps">AddApplicationWaveProps</a>

Application wave properties.

---

##### `buildPipeline` <a name="buildPipeline" id="aws-ddk-core.CICDPipelineStack.buildPipeline"></a>

```typescript
public buildPipeline(props?: AdditionalPipelineProps): CICDPipelineStack
```

Build the pipeline structure.

###### `props`<sup>Optional</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.buildPipeline.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AdditionalPipelineProps">AdditionalPipelineProps</a>

Additional pipeline properties.

---

##### `synth` <a name="synth" id="aws-ddk-core.CICDPipelineStack.synth"></a>

```typescript
public synth(): CICDPipelineStack
```

Synthesize the pipeline.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.CICDPipelineStack.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.isStack">isStack</a></code> | Return whether the given object is a Stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.of">of</a></code> | Looks up the first stack scope in which `construct` is defined. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.createDefaultPermissionsBoundary">createDefaultPermissionsBoundary</a></code> | *No description.* |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-core.CICDPipelineStack.isConstruct"></a>

```typescript
import { CICDPipelineStack } from 'aws-ddk-core'

CICDPipelineStack.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-core.CICDPipelineStack.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isStack` <a name="isStack" id="aws-ddk-core.CICDPipelineStack.isStack"></a>

```typescript
import { CICDPipelineStack } from 'aws-ddk-core'

CICDPipelineStack.isStack(x: any)
```

Return whether the given object is a Stack.

We do attribute detection since we can't reliably use 'instanceof'.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-core.CICDPipelineStack.isStack.parameter.x"></a>

- *Type:* any

---

##### `of` <a name="of" id="aws-ddk-core.CICDPipelineStack.of"></a>

```typescript
import { CICDPipelineStack } from 'aws-ddk-core'

CICDPipelineStack.of(construct: IConstruct)
```

Looks up the first stack scope in which `construct` is defined.

Fails if there is no stack up the tree.

###### `construct`<sup>Required</sup> <a name="construct" id="aws-ddk-core.CICDPipelineStack.of.parameter.construct"></a>

- *Type:* constructs.IConstruct

The construct to start the search from.

---

##### `createDefaultPermissionsBoundary` <a name="createDefaultPermissionsBoundary" id="aws-ddk-core.CICDPipelineStack.createDefaultPermissionsBoundary"></a>

```typescript
import { CICDPipelineStack } from 'aws-ddk-core'

CICDPipelineStack.createDefaultPermissionsBoundary(scope: Construct, id: string, props: PermissionsBoundaryProps)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.CICDPipelineStack.createDefaultPermissionsBoundary.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.CICDPipelineStack.createDefaultPermissionsBoundary.parameter.id"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.createDefaultPermissionsBoundary.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.PermissionsBoundaryProps">PermissionsBoundaryProps</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.account">account</a></code> | <code>string</code> | The AWS account into which this stack will be deployed. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.artifactId">artifactId</a></code> | <code>string</code> | The ID of the cloud assembly artifact for this stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.availabilityZones">availabilityZones</a></code> | <code>string[]</code> | Returns the list of AZs that are available in the AWS environment (account/region) associated with this stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.bundlingRequired">bundlingRequired</a></code> | <code>boolean</code> | Indicates whether the stack requires bundling or not. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.dependencies">dependencies</a></code> | <code>aws-cdk-lib.Stack[]</code> | Return the stacks this stack depends on. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.environment">environment</a></code> | <code>string</code> | The environment coordinates in which this stack is deployed. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.nested">nested</a></code> | <code>boolean</code> | Indicates if this is a nested stack, in which case `parentStack` will include a reference to it's parent. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.notificationArns">notificationArns</a></code> | <code>string[]</code> | Returns the list of notification Amazon Resource Names (ARNs) for the current stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.partition">partition</a></code> | <code>string</code> | The partition in which this stack is defined. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.region">region</a></code> | <code>string</code> | The AWS region into which this stack will be deployed (e.g. `us-west-2`). |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.stackId">stackId</a></code> | <code>string</code> | The ID of the stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.stackName">stackName</a></code> | <code>string</code> | The concrete CloudFormation physical stack name. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.synthesizer">synthesizer</a></code> | <code>aws-cdk-lib.IStackSynthesizer</code> | Synthesis method for this stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.tags">tags</a></code> | <code>aws-cdk-lib.TagManager</code> | Tags to be applied to the stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.templateFile">templateFile</a></code> | <code>string</code> | The name of the CloudFormation template file emitted to the output directory during synthesis. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.templateOptions">templateOptions</a></code> | <code>aws-cdk-lib.ITemplateOptions</code> | Options for CloudFormation template (like version, transform, description). |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.urlSuffix">urlSuffix</a></code> | <code>string</code> | The Amazon domain suffix for the region in which this stack is defined. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.nestedStackParent">nestedStackParent</a></code> | <code>aws-cdk-lib.Stack</code> | If this is a nested stack, returns it's parent stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.nestedStackResource">nestedStackResource</a></code> | <code>aws-cdk-lib.CfnResource</code> | If this is a nested stack, this represents its `AWS::CloudFormation::Stack` resource. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.terminationProtection">terminationProtection</a></code> | <code>boolean</code> | Whether termination protection is enabled for this stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.cdkLanguage">cdkLanguage</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.config">config</a></code> | <code><a href="#aws-ddk-core.Configurator">Configurator</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.environmentId">environmentId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.pipelineId">pipelineId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.pipelineName">pipelineName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.notificationRule">notificationRule</a></code> | <code>aws-cdk-lib.aws_codestarnotifications.NotificationRule</code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.pipeline">pipeline</a></code> | <code>aws-cdk-lib.pipelines.CodePipeline</code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.pipelineKey">pipelineKey</a></code> | <code>aws-cdk-lib.aws_kms.CfnKey</code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.sourceAction">sourceAction</a></code> | <code>aws-cdk-lib.pipelines.CodePipelineSource</code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.synthAction">synthAction</a></code> | <code>aws-cdk-lib.pipelines.CodeBuildStep</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-core.CICDPipelineStack.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `account`<sup>Required</sup> <a name="account" id="aws-ddk-core.CICDPipelineStack.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string

The AWS account into which this stack will be deployed.

This value is resolved according to the following rules:

1. The value provided to `env.account` when the stack is defined. This can
    either be a concrete account (e.g. `585695031111`) or the
    `Aws.ACCOUNT_ID` token.
3. `Aws.ACCOUNT_ID`, which represents the CloudFormation intrinsic reference
    `{ "Ref": "AWS::AccountId" }` encoded as a string token.

Preferably, you should use the return value as an opaque string and not
attempt to parse it to implement your logic. If you do, you must first
check that it is a concrete value an not an unresolved token. If this
value is an unresolved token (`Token.isUnresolved(stack.account)` returns
`true`), this implies that the user wishes that this stack will synthesize
into a **account-agnostic template**. In this case, your code should either
fail (throw an error, emit a synth error using `Annotations.of(construct).addError()`) or
implement some other region-agnostic behavior.

---

##### `artifactId`<sup>Required</sup> <a name="artifactId" id="aws-ddk-core.CICDPipelineStack.property.artifactId"></a>

```typescript
public readonly artifactId: string;
```

- *Type:* string

The ID of the cloud assembly artifact for this stack.

---

##### `availabilityZones`<sup>Required</sup> <a name="availabilityZones" id="aws-ddk-core.CICDPipelineStack.property.availabilityZones"></a>

```typescript
public readonly availabilityZones: string[];
```

- *Type:* string[]

Returns the list of AZs that are available in the AWS environment (account/region) associated with this stack.

If the stack is environment-agnostic (either account and/or region are
tokens), this property will return an array with 2 tokens that will resolve
at deploy-time to the first two availability zones returned from CloudFormation's
`Fn::GetAZs` intrinsic function.

If they are not available in the context, returns a set of dummy values and
reports them as missing, and let the CLI resolve them by calling EC2
`DescribeAvailabilityZones` on the target environment.

To specify a different strategy for selecting availability zones override this method.

---

##### `bundlingRequired`<sup>Required</sup> <a name="bundlingRequired" id="aws-ddk-core.CICDPipelineStack.property.bundlingRequired"></a>

```typescript
public readonly bundlingRequired: boolean;
```

- *Type:* boolean

Indicates whether the stack requires bundling or not.

---

##### `dependencies`<sup>Required</sup> <a name="dependencies" id="aws-ddk-core.CICDPipelineStack.property.dependencies"></a>

```typescript
public readonly dependencies: Stack[];
```

- *Type:* aws-cdk-lib.Stack[]

Return the stacks this stack depends on.

---

##### `environment`<sup>Required</sup> <a name="environment" id="aws-ddk-core.CICDPipelineStack.property.environment"></a>

```typescript
public readonly environment: string;
```

- *Type:* string

The environment coordinates in which this stack is deployed.

In the form
`aws://account/region`. Use `stack.account` and `stack.region` to obtain
the specific values, no need to parse.

You can use this value to determine if two stacks are targeting the same
environment.

If either `stack.account` or `stack.region` are not concrete values (e.g.
`Aws.ACCOUNT_ID` or `Aws.REGION`) the special strings `unknown-account` and/or
`unknown-region` will be used respectively to indicate this stack is
region/account-agnostic.

---

##### `nested`<sup>Required</sup> <a name="nested" id="aws-ddk-core.CICDPipelineStack.property.nested"></a>

```typescript
public readonly nested: boolean;
```

- *Type:* boolean

Indicates if this is a nested stack, in which case `parentStack` will include a reference to it's parent.

---

##### `notificationArns`<sup>Required</sup> <a name="notificationArns" id="aws-ddk-core.CICDPipelineStack.property.notificationArns"></a>

```typescript
public readonly notificationArns: string[];
```

- *Type:* string[]

Returns the list of notification Amazon Resource Names (ARNs) for the current stack.

---

##### `partition`<sup>Required</sup> <a name="partition" id="aws-ddk-core.CICDPipelineStack.property.partition"></a>

```typescript
public readonly partition: string;
```

- *Type:* string

The partition in which this stack is defined.

---

##### `region`<sup>Required</sup> <a name="region" id="aws-ddk-core.CICDPipelineStack.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

The AWS region into which this stack will be deployed (e.g. `us-west-2`).

This value is resolved according to the following rules:

1. The value provided to `env.region` when the stack is defined. This can
    either be a concrete region (e.g. `us-west-2`) or the `Aws.REGION`
    token.
3. `Aws.REGION`, which is represents the CloudFormation intrinsic reference
    `{ "Ref": "AWS::Region" }` encoded as a string token.

Preferably, you should use the return value as an opaque string and not
attempt to parse it to implement your logic. If you do, you must first
check that it is a concrete value an not an unresolved token. If this
value is an unresolved token (`Token.isUnresolved(stack.region)` returns
`true`), this implies that the user wishes that this stack will synthesize
into a **region-agnostic template**. In this case, your code should either
fail (throw an error, emit a synth error using `Annotations.of(construct).addError()`) or
implement some other region-agnostic behavior.

---

##### `stackId`<sup>Required</sup> <a name="stackId" id="aws-ddk-core.CICDPipelineStack.property.stackId"></a>

```typescript
public readonly stackId: string;
```

- *Type:* string

The ID of the stack.

---

*Example*

```typescript
// After resolving, looks like
'arn:aws:cloudformation:us-west-2:123456789012:stack/teststack/51af3dc0-da77-11e4-872e-1234567db123'
```


##### `stackName`<sup>Required</sup> <a name="stackName" id="aws-ddk-core.CICDPipelineStack.property.stackName"></a>

```typescript
public readonly stackName: string;
```

- *Type:* string

The concrete CloudFormation physical stack name.

This is either the name defined explicitly in the `stackName` prop or
allocated based on the stack's location in the construct tree. Stacks that
are directly defined under the app use their construct `id` as their stack
name. Stacks that are defined deeper within the tree will use a hashed naming
scheme based on the construct path to ensure uniqueness.

If you wish to obtain the deploy-time AWS::StackName intrinsic,
you can use `Aws.STACK_NAME` directly.

---

##### `synthesizer`<sup>Required</sup> <a name="synthesizer" id="aws-ddk-core.CICDPipelineStack.property.synthesizer"></a>

```typescript
public readonly synthesizer: IStackSynthesizer;
```

- *Type:* aws-cdk-lib.IStackSynthesizer

Synthesis method for this stack.

---

##### `tags`<sup>Required</sup> <a name="tags" id="aws-ddk-core.CICDPipelineStack.property.tags"></a>

```typescript
public readonly tags: TagManager;
```

- *Type:* aws-cdk-lib.TagManager

Tags to be applied to the stack.

---

##### `templateFile`<sup>Required</sup> <a name="templateFile" id="aws-ddk-core.CICDPipelineStack.property.templateFile"></a>

```typescript
public readonly templateFile: string;
```

- *Type:* string

The name of the CloudFormation template file emitted to the output directory during synthesis.

Example value: `MyStack.template.json`

---

##### `templateOptions`<sup>Required</sup> <a name="templateOptions" id="aws-ddk-core.CICDPipelineStack.property.templateOptions"></a>

```typescript
public readonly templateOptions: ITemplateOptions;
```

- *Type:* aws-cdk-lib.ITemplateOptions

Options for CloudFormation template (like version, transform, description).

---

##### `urlSuffix`<sup>Required</sup> <a name="urlSuffix" id="aws-ddk-core.CICDPipelineStack.property.urlSuffix"></a>

```typescript
public readonly urlSuffix: string;
```

- *Type:* string

The Amazon domain suffix for the region in which this stack is defined.

---

##### `nestedStackParent`<sup>Optional</sup> <a name="nestedStackParent" id="aws-ddk-core.CICDPipelineStack.property.nestedStackParent"></a>

```typescript
public readonly nestedStackParent: Stack;
```

- *Type:* aws-cdk-lib.Stack

If this is a nested stack, returns it's parent stack.

---

##### `nestedStackResource`<sup>Optional</sup> <a name="nestedStackResource" id="aws-ddk-core.CICDPipelineStack.property.nestedStackResource"></a>

```typescript
public readonly nestedStackResource: CfnResource;
```

- *Type:* aws-cdk-lib.CfnResource

If this is a nested stack, this represents its `AWS::CloudFormation::Stack` resource.

`undefined` for top-level (non-nested) stacks.

---

##### `terminationProtection`<sup>Optional</sup> <a name="terminationProtection" id="aws-ddk-core.CICDPipelineStack.property.terminationProtection"></a>

```typescript
public readonly terminationProtection: boolean;
```

- *Type:* boolean

Whether termination protection is enabled for this stack.

---

##### `cdkLanguage`<sup>Required</sup> <a name="cdkLanguage" id="aws-ddk-core.CICDPipelineStack.property.cdkLanguage"></a>

```typescript
public readonly cdkLanguage: string;
```

- *Type:* string

---

##### `config`<sup>Required</sup> <a name="config" id="aws-ddk-core.CICDPipelineStack.property.config"></a>

```typescript
public readonly config: Configurator;
```

- *Type:* <a href="#aws-ddk-core.Configurator">Configurator</a>

---

##### `environmentId`<sup>Optional</sup> <a name="environmentId" id="aws-ddk-core.CICDPipelineStack.property.environmentId"></a>

```typescript
public readonly environmentId: string;
```

- *Type:* string

---

##### `pipelineId`<sup>Optional</sup> <a name="pipelineId" id="aws-ddk-core.CICDPipelineStack.property.pipelineId"></a>

```typescript
public readonly pipelineId: string;
```

- *Type:* string

---

##### `pipelineName`<sup>Optional</sup> <a name="pipelineName" id="aws-ddk-core.CICDPipelineStack.property.pipelineName"></a>

```typescript
public readonly pipelineName: string;
```

- *Type:* string

---

##### `notificationRule`<sup>Optional</sup> <a name="notificationRule" id="aws-ddk-core.CICDPipelineStack.property.notificationRule"></a>

```typescript
public readonly notificationRule: NotificationRule;
```

- *Type:* aws-cdk-lib.aws_codestarnotifications.NotificationRule

---

##### `pipeline`<sup>Optional</sup> <a name="pipeline" id="aws-ddk-core.CICDPipelineStack.property.pipeline"></a>

```typescript
public readonly pipeline: CodePipeline;
```

- *Type:* aws-cdk-lib.pipelines.CodePipeline

---

##### `pipelineKey`<sup>Optional</sup> <a name="pipelineKey" id="aws-ddk-core.CICDPipelineStack.property.pipelineKey"></a>

```typescript
public readonly pipelineKey: CfnKey;
```

- *Type:* aws-cdk-lib.aws_kms.CfnKey

---

##### `sourceAction`<sup>Optional</sup> <a name="sourceAction" id="aws-ddk-core.CICDPipelineStack.property.sourceAction"></a>

```typescript
public readonly sourceAction: CodePipelineSource;
```

- *Type:* aws-cdk-lib.pipelines.CodePipelineSource

---

##### `synthAction`<sup>Optional</sup> <a name="synthAction" id="aws-ddk-core.CICDPipelineStack.property.synthAction"></a>

```typescript
public readonly synthAction: CodeBuildStep;
```

- *Type:* aws-cdk-lib.pipelines.CodeBuildStep

---


### DataBrewTransformStage <a name="DataBrewTransformStage" id="aws-ddk-core.DataBrewTransformStage"></a>

Stage that contains a step function that runs DataBrew job.

#### Initializers <a name="Initializers" id="aws-ddk-core.DataBrewTransformStage.Initializer"></a>

```typescript
import { DataBrewTransformStage } from 'aws-ddk-core'

new DataBrewTransformStage(scope: Construct, id: string, props: DataBrewTransformStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.DataBrewTransformStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | Scope within which this construct is defined. |
| <code><a href="#aws-ddk-core.DataBrewTransformStage.Initializer.parameter.id">id</a></code> | <code>string</code> | Identifier of the stage. |
| <code><a href="#aws-ddk-core.DataBrewTransformStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.DataBrewTransformStageProps">DataBrewTransformStageProps</a></code> | Properties for the stage. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.DataBrewTransformStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

Scope within which this construct is defined.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.DataBrewTransformStage.Initializer.parameter.id"></a>

- *Type:* string

Identifier of the stage.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.DataBrewTransformStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.DataBrewTransformStageProps">DataBrewTransformStageProps</a>

Properties for the stage.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.DataBrewTransformStage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.DataBrewTransformStage.addAlarm">addAlarm</a></code> | Add a CloudWatch alarm for the DataStage. |

---

##### `toString` <a name="toString" id="aws-ddk-core.DataBrewTransformStage.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addAlarm` <a name="addAlarm" id="aws-ddk-core.DataBrewTransformStage.addAlarm"></a>

```typescript
public addAlarm(id: string, props: AlarmProps): DataStage
```

Add a CloudWatch alarm for the DataStage.

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.DataBrewTransformStage.addAlarm.parameter.id"></a>

- *Type:* string

Identifier of the CloudWatch Alarm.

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.DataBrewTransformStage.addAlarm.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AlarmProps">AlarmProps</a>

Properties for the alarm.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.DataBrewTransformStage.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-core.DataBrewTransformStage.isConstruct"></a>

```typescript
import { DataBrewTransformStage } from 'aws-ddk-core'

DataBrewTransformStage.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-core.DataBrewTransformStage.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.DataBrewTransformStage.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-core.DataBrewTransformStage.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.DataBrewTransformStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | Output event pattern of the stage. |
| <code><a href="#aws-ddk-core.DataBrewTransformStage.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.DataBrewTransformStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | Input targets for the stage. |
| <code><a href="#aws-ddk-core.DataBrewTransformStage.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Flag indicating whether the alarms are enabled for this stage. |
| <code><a href="#aws-ddk-core.DataBrewTransformStage.property.cloudwatchAlarms">cloudwatchAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm[]</code> | List of CloudWatch Alarms linked to the stage. |
| <code><a href="#aws-ddk-core.DataBrewTransformStage.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.StateMachine</code> | State machine. |
| <code><a href="#aws-ddk-core.DataBrewTransformStage.property.createJob">createJob</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.DataBrewTransformStage.property.jobName">jobName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.DataBrewTransformStage.property.job">job</a></code> | <code>aws-cdk-lib.aws_databrew.CfnJob</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-core.DataBrewTransformStage.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.DataBrewTransformStage.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.DataBrewTransformStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

Output event pattern of the stage.

Event pattern describes the structure of output event(s) produced by this stage.
Event Rules use event patterns to select events and route them to targets.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.DataBrewTransformStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.DataBrewTransformStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

Input targets for the stage.

Targets are used by Event Rules to describe what should be invoked when a rule matches an event.

---

##### `alarmsEnabled`<sup>Required</sup> <a name="alarmsEnabled" id="aws-ddk-core.DataBrewTransformStage.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

Flag indicating whether the alarms are enabled for this stage.

---

##### `cloudwatchAlarms`<sup>Required</sup> <a name="cloudwatchAlarms" id="aws-ddk-core.DataBrewTransformStage.property.cloudwatchAlarms"></a>

```typescript
public readonly cloudwatchAlarms: Alarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm[]

List of CloudWatch Alarms linked to the stage.

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="aws-ddk-core.DataBrewTransformStage.property.stateMachine"></a>

```typescript
public readonly stateMachine: StateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.StateMachine

State machine.

---

##### `createJob`<sup>Required</sup> <a name="createJob" id="aws-ddk-core.DataBrewTransformStage.property.createJob"></a>

```typescript
public readonly createJob: boolean;
```

- *Type:* boolean

---

##### `jobName`<sup>Required</sup> <a name="jobName" id="aws-ddk-core.DataBrewTransformStage.property.jobName"></a>

```typescript
public readonly jobName: string;
```

- *Type:* string

---

##### `job`<sup>Optional</sup> <a name="job" id="aws-ddk-core.DataBrewTransformStage.property.job"></a>

```typescript
public readonly job: CfnJob;
```

- *Type:* aws-cdk-lib.aws_databrew.CfnJob

---


### DataPipeline <a name="DataPipeline" id="aws-ddk-core.DataPipeline"></a>

#### Initializers <a name="Initializers" id="aws-ddk-core.DataPipeline.Initializer"></a>

```typescript
import { DataPipeline } from 'aws-ddk-core'

new DataPipeline(scope: Construct, id: string, props: DataPipelineProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.DataPipeline.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-ddk-core.DataPipeline.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.DataPipeline.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.DataPipelineProps">DataPipelineProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.DataPipeline.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.DataPipeline.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.DataPipeline.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.DataPipelineProps">DataPipelineProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.DataPipeline.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.DataPipeline.addNotifications">addNotifications</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.DataPipeline.addRule">addRule</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.DataPipeline.addStage">addStage</a></code> | *No description.* |

---

##### `toString` <a name="toString" id="aws-ddk-core.DataPipeline.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addNotifications` <a name="addNotifications" id="aws-ddk-core.DataPipeline.addNotifications"></a>

```typescript
public addNotifications(notificationsTopic?: ITopic): DataPipeline
```

###### `notificationsTopic`<sup>Optional</sup> <a name="notificationsTopic" id="aws-ddk-core.DataPipeline.addNotifications.parameter.notificationsTopic"></a>

- *Type:* aws-cdk-lib.aws_sns.ITopic

---

##### `addRule` <a name="addRule" id="aws-ddk-core.DataPipeline.addRule"></a>

```typescript
public addRule(props: AddRuleProps): DataPipeline
```

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.DataPipeline.addRule.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AddRuleProps">AddRuleProps</a>

---

##### `addStage` <a name="addStage" id="aws-ddk-core.DataPipeline.addStage"></a>

```typescript
public addStage(props: AddStageProps): DataPipeline
```

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.DataPipeline.addStage.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AddStageProps">AddStageProps</a>

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.DataPipeline.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-core.DataPipeline.isConstruct"></a>

```typescript
import { DataPipeline } from 'aws-ddk-core'

DataPipeline.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-core.DataPipeline.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.DataPipeline.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-core.DataPipeline.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.DataPipeline.property.name">name</a></code> | <code>string</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-core.DataPipeline.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.DataPipeline.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.DataPipeline.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---


### DataStage <a name="DataStage" id="aws-ddk-core.DataStage"></a>

Class that represents a data stage within a data pipeline.

To create a DataStage, inherit from this class, add infrastructure required by the stage,
and implement `eventPatterns` and `targets` properties.

*Example*

```typescript
class MyStage extends DataStage:
  readonly queue: sqs.Queue;

  constructor(scope: Construct, id: string, props: MyStageProps) {
     super(scope, id, props);

     this.queue = sqs.Queue(this, "Queue");

     this.eventPatterns = {
       detail_type: ["my-detail-type"],
     };
     this.targets = [new events_targets.SqsQueue(this.queue)];
  }
```


#### Initializers <a name="Initializers" id="aws-ddk-core.DataStage.Initializer"></a>

```typescript
import { DataStage } from 'aws-ddk-core'

new DataStage(scope: Construct, id: string, props: DataStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.DataStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | Scope within which this construct is defined. |
| <code><a href="#aws-ddk-core.DataStage.Initializer.parameter.id">id</a></code> | <code>string</code> | Identifier of the stage. |
| <code><a href="#aws-ddk-core.DataStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.DataStageProps">DataStageProps</a></code> | Properties for the stage. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.DataStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

Scope within which this construct is defined.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.DataStage.Initializer.parameter.id"></a>

- *Type:* string

Identifier of the stage.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.DataStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.DataStageProps">DataStageProps</a>

Properties for the stage.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.DataStage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.DataStage.addAlarm">addAlarm</a></code> | Add a CloudWatch alarm for the DataStage. |

---

##### `toString` <a name="toString" id="aws-ddk-core.DataStage.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addAlarm` <a name="addAlarm" id="aws-ddk-core.DataStage.addAlarm"></a>

```typescript
public addAlarm(id: string, props: AlarmProps): DataStage
```

Add a CloudWatch alarm for the DataStage.

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.DataStage.addAlarm.parameter.id"></a>

- *Type:* string

Identifier of the CloudWatch Alarm.

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.DataStage.addAlarm.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AlarmProps">AlarmProps</a>

Properties for the alarm.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.DataStage.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-core.DataStage.isConstruct"></a>

```typescript
import { DataStage } from 'aws-ddk-core'

DataStage.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-core.DataStage.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.DataStage.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-core.DataStage.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.DataStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | Output event pattern of the stage. |
| <code><a href="#aws-ddk-core.DataStage.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.DataStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | Input targets for the stage. |
| <code><a href="#aws-ddk-core.DataStage.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Flag indicating whether the alarms are enabled for this stage. |
| <code><a href="#aws-ddk-core.DataStage.property.cloudwatchAlarms">cloudwatchAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm[]</code> | List of CloudWatch Alarms linked to the stage. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-core.DataStage.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.DataStage.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.DataStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

Output event pattern of the stage.

Event pattern describes the structure of output event(s) produced by this stage.
Event Rules use event patterns to select events and route them to targets.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.DataStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.DataStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

Input targets for the stage.

Targets are used by Event Rules to describe what should be invoked when a rule matches an event.

---

##### `alarmsEnabled`<sup>Required</sup> <a name="alarmsEnabled" id="aws-ddk-core.DataStage.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

Flag indicating whether the alarms are enabled for this stage.

---

##### `cloudwatchAlarms`<sup>Required</sup> <a name="cloudwatchAlarms" id="aws-ddk-core.DataStage.property.cloudwatchAlarms"></a>

```typescript
public readonly cloudwatchAlarms: Alarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm[]

List of CloudWatch Alarms linked to the stage.

---


### EventStage <a name="EventStage" id="aws-ddk-core.EventStage"></a>

Class that represents an event stage within a data pipeline.

To create an EventStage, inherit from this class, add infrastructure required by the stage,
and implement the `eventPattern` property.

The `targets` property will be set to null.

*Example*

```typescript
class MyStage extends EventStage:
  constructor(scope: Construct, id: string, props: MyStageProps) {
     super(scope, id, props);

     this.eventPatterns = {
       source: ["aws.s3"],
       detail: props.detail,
       detail_type: props.detail_type,
     };
  }
```


#### Initializers <a name="Initializers" id="aws-ddk-core.EventStage.Initializer"></a>

```typescript
import { EventStage } from 'aws-ddk-core'

new EventStage(scope: Construct, id: string, props: EventStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.EventStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | Scope within which this construct is defined. |
| <code><a href="#aws-ddk-core.EventStage.Initializer.parameter.id">id</a></code> | <code>string</code> | Identifier of the stage. |
| <code><a href="#aws-ddk-core.EventStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.EventStageProps">EventStageProps</a></code> | Properties for the stage. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.EventStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

Scope within which this construct is defined.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.EventStage.Initializer.parameter.id"></a>

- *Type:* string

Identifier of the stage.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.EventStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.EventStageProps">EventStageProps</a>

Properties for the stage.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.EventStage.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-ddk-core.EventStage.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.EventStage.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-core.EventStage.isConstruct"></a>

```typescript
import { EventStage } from 'aws-ddk-core'

EventStage.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-core.EventStage.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.EventStage.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-core.EventStage.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.EventStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | Output event pattern of the stage. |
| <code><a href="#aws-ddk-core.EventStage.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.EventStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | Input targets for the stage. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-core.EventStage.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.EventStage.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.EventStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

Output event pattern of the stage.

Event pattern describes the structure of output event(s) produced by this stage.
Event Rules use event patterns to select events and route them to targets.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.EventStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.EventStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

Input targets for the stage.

Targets are used by Event Rules to describe what should be invoked when a rule matches an event.

---


### FirehoseToS3Stage <a name="FirehoseToS3Stage" id="aws-ddk-core.FirehoseToS3Stage"></a>

DDK Kinesis Firehose Delivery stream to S3 stage, with an optional Kinesis Data Stream.

#### Initializers <a name="Initializers" id="aws-ddk-core.FirehoseToS3Stage.Initializer"></a>

```typescript
import { FirehoseToS3Stage } from 'aws-ddk-core'

new FirehoseToS3Stage(scope: Construct, id: string, props: FirehoseToS3StageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | Scope within which this construct is defined. |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.Initializer.parameter.id">id</a></code> | <code>string</code> | Identifier of the stage. |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.FirehoseToS3StageProps">FirehoseToS3StageProps</a></code> | Properties for the stage. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.FirehoseToS3Stage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

Scope within which this construct is defined.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.FirehoseToS3Stage.Initializer.parameter.id"></a>

- *Type:* string

Identifier of the stage.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.FirehoseToS3Stage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.FirehoseToS3StageProps">FirehoseToS3StageProps</a>

Properties for the stage.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.addAlarm">addAlarm</a></code> | Add a CloudWatch alarm for the DataStage. |

---

##### `toString` <a name="toString" id="aws-ddk-core.FirehoseToS3Stage.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addAlarm` <a name="addAlarm" id="aws-ddk-core.FirehoseToS3Stage.addAlarm"></a>

```typescript
public addAlarm(id: string, props: AlarmProps): DataStage
```

Add a CloudWatch alarm for the DataStage.

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.FirehoseToS3Stage.addAlarm.parameter.id"></a>

- *Type:* string

Identifier of the CloudWatch Alarm.

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.FirehoseToS3Stage.addAlarm.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AlarmProps">AlarmProps</a>

Properties for the alarm.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-core.FirehoseToS3Stage.isConstruct"></a>

```typescript
import { FirehoseToS3Stage } from 'aws-ddk-core'

FirehoseToS3Stage.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-core.FirehoseToS3Stage.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | Output event pattern of the stage. |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | Input targets for the stage. |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Flag indicating whether the alarms are enabled for this stage. |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.property.cloudwatchAlarms">cloudwatchAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm[]</code> | List of CloudWatch Alarms linked to the stage. |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | *No description.* |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.property.deliveryStream">deliveryStream</a></code> | <code>@aws-cdk/aws-kinesisfirehose-alpha.DeliveryStream</code> | *No description.* |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.property.dataStream">dataStream</a></code> | <code>aws-cdk-lib.aws_kinesis.Stream</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-core.FirehoseToS3Stage.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.FirehoseToS3Stage.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.FirehoseToS3Stage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

Output event pattern of the stage.

Event pattern describes the structure of output event(s) produced by this stage.
Event Rules use event patterns to select events and route them to targets.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.FirehoseToS3Stage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.FirehoseToS3Stage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

Input targets for the stage.

Targets are used by Event Rules to describe what should be invoked when a rule matches an event.

---

##### `alarmsEnabled`<sup>Required</sup> <a name="alarmsEnabled" id="aws-ddk-core.FirehoseToS3Stage.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

Flag indicating whether the alarms are enabled for this stage.

---

##### `cloudwatchAlarms`<sup>Required</sup> <a name="cloudwatchAlarms" id="aws-ddk-core.FirehoseToS3Stage.property.cloudwatchAlarms"></a>

```typescript
public readonly cloudwatchAlarms: Alarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm[]

List of CloudWatch Alarms linked to the stage.

---

##### `bucket`<sup>Required</sup> <a name="bucket" id="aws-ddk-core.FirehoseToS3Stage.property.bucket"></a>

```typescript
public readonly bucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

---

##### `deliveryStream`<sup>Required</sup> <a name="deliveryStream" id="aws-ddk-core.FirehoseToS3Stage.property.deliveryStream"></a>

```typescript
public readonly deliveryStream: DeliveryStream;
```

- *Type:* @aws-cdk/aws-kinesisfirehose-alpha.DeliveryStream

---

##### `dataStream`<sup>Optional</sup> <a name="dataStream" id="aws-ddk-core.FirehoseToS3Stage.property.dataStream"></a>

```typescript
public readonly dataStream: Stream;
```

- *Type:* aws-cdk-lib.aws_kinesis.Stream

---


### GlueTransformStage <a name="GlueTransformStage" id="aws-ddk-core.GlueTransformStage"></a>

Stage that contains a step function that runs Glue job, and a Glue crawler afterwards.

If the Glue job or crawler names are not supplied, then they are created.

#### Initializers <a name="Initializers" id="aws-ddk-core.GlueTransformStage.Initializer"></a>

```typescript
import { GlueTransformStage } from 'aws-ddk-core'

new GlueTransformStage(scope: Construct, id: string, props: GlueTransformStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.GlueTransformStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | Scope within which this construct is defined. |
| <code><a href="#aws-ddk-core.GlueTransformStage.Initializer.parameter.id">id</a></code> | <code>string</code> | Identifier of the stage. |
| <code><a href="#aws-ddk-core.GlueTransformStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.GlueTransformStageProps">GlueTransformStageProps</a></code> | Properties for the stage. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.GlueTransformStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

Scope within which this construct is defined.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.GlueTransformStage.Initializer.parameter.id"></a>

- *Type:* string

Identifier of the stage.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.GlueTransformStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.GlueTransformStageProps">GlueTransformStageProps</a>

Properties for the stage.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.GlueTransformStage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.GlueTransformStage.addAlarm">addAlarm</a></code> | Add a CloudWatch alarm for the DataStage. |

---

##### `toString` <a name="toString" id="aws-ddk-core.GlueTransformStage.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addAlarm` <a name="addAlarm" id="aws-ddk-core.GlueTransformStage.addAlarm"></a>

```typescript
public addAlarm(id: string, props: AlarmProps): DataStage
```

Add a CloudWatch alarm for the DataStage.

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.GlueTransformStage.addAlarm.parameter.id"></a>

- *Type:* string

Identifier of the CloudWatch Alarm.

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.GlueTransformStage.addAlarm.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AlarmProps">AlarmProps</a>

Properties for the alarm.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.GlueTransformStage.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-core.GlueTransformStage.isConstruct"></a>

```typescript
import { GlueTransformStage } from 'aws-ddk-core'

GlueTransformStage.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-core.GlueTransformStage.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.GlueTransformStage.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-core.GlueTransformStage.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.GlueTransformStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | Output event pattern of the stage. |
| <code><a href="#aws-ddk-core.GlueTransformStage.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.GlueTransformStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | Input targets for the stage. |
| <code><a href="#aws-ddk-core.GlueTransformStage.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Flag indicating whether the alarms are enabled for this stage. |
| <code><a href="#aws-ddk-core.GlueTransformStage.property.cloudwatchAlarms">cloudwatchAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm[]</code> | List of CloudWatch Alarms linked to the stage. |
| <code><a href="#aws-ddk-core.GlueTransformStage.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.StateMachine</code> | State machine. |
| <code><a href="#aws-ddk-core.GlueTransformStage.property.glueJob">glueJob</a></code> | <code>@aws-cdk/aws-glue-alpha.IJob</code> | *No description.* |
| <code><a href="#aws-ddk-core.GlueTransformStage.property.crawler">crawler</a></code> | <code>aws-cdk-lib.aws_glue.CfnCrawler</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-core.GlueTransformStage.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.GlueTransformStage.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.GlueTransformStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

Output event pattern of the stage.

Event pattern describes the structure of output event(s) produced by this stage.
Event Rules use event patterns to select events and route them to targets.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.GlueTransformStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.GlueTransformStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

Input targets for the stage.

Targets are used by Event Rules to describe what should be invoked when a rule matches an event.

---

##### `alarmsEnabled`<sup>Required</sup> <a name="alarmsEnabled" id="aws-ddk-core.GlueTransformStage.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

Flag indicating whether the alarms are enabled for this stage.

---

##### `cloudwatchAlarms`<sup>Required</sup> <a name="cloudwatchAlarms" id="aws-ddk-core.GlueTransformStage.property.cloudwatchAlarms"></a>

```typescript
public readonly cloudwatchAlarms: Alarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm[]

List of CloudWatch Alarms linked to the stage.

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="aws-ddk-core.GlueTransformStage.property.stateMachine"></a>

```typescript
public readonly stateMachine: StateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.StateMachine

State machine.

---

##### `glueJob`<sup>Required</sup> <a name="glueJob" id="aws-ddk-core.GlueTransformStage.property.glueJob"></a>

```typescript
public readonly glueJob: IJob;
```

- *Type:* @aws-cdk/aws-glue-alpha.IJob

---

##### `crawler`<sup>Optional</sup> <a name="crawler" id="aws-ddk-core.GlueTransformStage.property.crawler"></a>

```typescript
public readonly crawler: CfnCrawler;
```

- *Type:* aws-cdk-lib.aws_glue.CfnCrawler

---


### RedshiftDataApiStage <a name="RedshiftDataApiStage" id="aws-ddk-core.RedshiftDataApiStage"></a>

Stage that contains a step function that executes Redshift Data API statements.

#### Initializers <a name="Initializers" id="aws-ddk-core.RedshiftDataApiStage.Initializer"></a>

```typescript
import { RedshiftDataApiStage } from 'aws-ddk-core'

new RedshiftDataApiStage(scope: Construct, id: string, props: RedshiftDataApiStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.RedshiftDataApiStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | Scope within which this construct is defined. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStage.Initializer.parameter.id">id</a></code> | <code>string</code> | Identifier of the stage. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.RedshiftDataApiStageProps">RedshiftDataApiStageProps</a></code> | Properties for the stage. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.RedshiftDataApiStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

Scope within which this construct is defined.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.RedshiftDataApiStage.Initializer.parameter.id"></a>

- *Type:* string

Identifier of the stage.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.RedshiftDataApiStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.RedshiftDataApiStageProps">RedshiftDataApiStageProps</a>

Properties for the stage.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.RedshiftDataApiStage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStage.addAlarm">addAlarm</a></code> | Add a CloudWatch alarm for the DataStage. |

---

##### `toString` <a name="toString" id="aws-ddk-core.RedshiftDataApiStage.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addAlarm` <a name="addAlarm" id="aws-ddk-core.RedshiftDataApiStage.addAlarm"></a>

```typescript
public addAlarm(id: string, props: AlarmProps): DataStage
```

Add a CloudWatch alarm for the DataStage.

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.RedshiftDataApiStage.addAlarm.parameter.id"></a>

- *Type:* string

Identifier of the CloudWatch Alarm.

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.RedshiftDataApiStage.addAlarm.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AlarmProps">AlarmProps</a>

Properties for the alarm.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.RedshiftDataApiStage.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-core.RedshiftDataApiStage.isConstruct"></a>

```typescript
import { RedshiftDataApiStage } from 'aws-ddk-core'

RedshiftDataApiStage.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-core.RedshiftDataApiStage.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.RedshiftDataApiStage.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStage.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | Output event pattern of the stage. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStage.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | Input targets for the stage. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStage.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Flag indicating whether the alarms are enabled for this stage. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStage.property.cloudwatchAlarms">cloudwatchAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm[]</code> | List of CloudWatch Alarms linked to the stage. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStage.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.StateMachine</code> | State machine. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStage.property.eventBridgeEventPath">eventBridgeEventPath</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.RedshiftDataApiStage.property.stateMachineInput">stateMachineInput</a></code> | <code>{[ key: string ]: any}</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-core.RedshiftDataApiStage.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.RedshiftDataApiStage.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.RedshiftDataApiStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

Output event pattern of the stage.

Event pattern describes the structure of output event(s) produced by this stage.
Event Rules use event patterns to select events and route them to targets.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.RedshiftDataApiStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.RedshiftDataApiStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

Input targets for the stage.

Targets are used by Event Rules to describe what should be invoked when a rule matches an event.

---

##### `alarmsEnabled`<sup>Required</sup> <a name="alarmsEnabled" id="aws-ddk-core.RedshiftDataApiStage.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

Flag indicating whether the alarms are enabled for this stage.

---

##### `cloudwatchAlarms`<sup>Required</sup> <a name="cloudwatchAlarms" id="aws-ddk-core.RedshiftDataApiStage.property.cloudwatchAlarms"></a>

```typescript
public readonly cloudwatchAlarms: Alarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm[]

List of CloudWatch Alarms linked to the stage.

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="aws-ddk-core.RedshiftDataApiStage.property.stateMachine"></a>

```typescript
public readonly stateMachine: StateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.StateMachine

State machine.

---

##### `eventBridgeEventPath`<sup>Optional</sup> <a name="eventBridgeEventPath" id="aws-ddk-core.RedshiftDataApiStage.property.eventBridgeEventPath"></a>

```typescript
public readonly eventBridgeEventPath: string;
```

- *Type:* string

---

##### `stateMachineInput`<sup>Optional</sup> <a name="stateMachineInput" id="aws-ddk-core.RedshiftDataApiStage.property.stateMachineInput"></a>

```typescript
public readonly stateMachineInput: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

---


### S3EventStage <a name="S3EventStage" id="aws-ddk-core.S3EventStage"></a>

Stage implements an S3 event pattern based on event names, a bucket name and optional key prefix.

Amazon EventBridge notifications must be enabled on the bucket in order to use this construct.

#### Initializers <a name="Initializers" id="aws-ddk-core.S3EventStage.Initializer"></a>

```typescript
import { S3EventStage } from 'aws-ddk-core'

new S3EventStage(scope: Construct, id: string, props: S3EventStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.S3EventStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | Scope within which this construct is defined. |
| <code><a href="#aws-ddk-core.S3EventStage.Initializer.parameter.id">id</a></code> | <code>string</code> | Identifier of the stage. |
| <code><a href="#aws-ddk-core.S3EventStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.S3EventStageProps">S3EventStageProps</a></code> | Properties for the stage. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.S3EventStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

Scope within which this construct is defined.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.S3EventStage.Initializer.parameter.id"></a>

- *Type:* string

Identifier of the stage.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.S3EventStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.S3EventStageProps">S3EventStageProps</a>

Properties for the stage.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.S3EventStage.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-ddk-core.S3EventStage.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.S3EventStage.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-core.S3EventStage.isConstruct"></a>

```typescript
import { S3EventStage } from 'aws-ddk-core'

S3EventStage.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-core.S3EventStage.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.S3EventStage.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-core.S3EventStage.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.S3EventStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | Output event pattern of the stage. |
| <code><a href="#aws-ddk-core.S3EventStage.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.S3EventStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | Input targets for the stage. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-core.S3EventStage.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.S3EventStage.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.S3EventStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

Output event pattern of the stage.

Event pattern describes the structure of output event(s) produced by this stage.
Event Rules use event patterns to select events and route them to targets.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.S3EventStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.S3EventStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

Input targets for the stage.

Targets are used by Event Rules to describe what should be invoked when a rule matches an event.

---


### SnsSqsToLambdaStage <a name="SnsSqsToLambdaStage" id="aws-ddk-core.SnsSqsToLambdaStage"></a>

Stage implements an SNS Topic connected to an Amazon SQS queue and an AWS Lambda function, with an optional DLQ.

#### Initializers <a name="Initializers" id="aws-ddk-core.SnsSqsToLambdaStage.Initializer"></a>

```typescript
import { SnsSqsToLambdaStage } from 'aws-ddk-core'

new SnsSqsToLambdaStage(scope: Construct, id: string, props: SnsToLambdaStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.SnsSqsToLambdaStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | Scope within which this construct is defined. |
| <code><a href="#aws-ddk-core.SnsSqsToLambdaStage.Initializer.parameter.id">id</a></code> | <code>string</code> | Identifier of the stage. |
| <code><a href="#aws-ddk-core.SnsSqsToLambdaStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.SnsToLambdaStageProps">SnsToLambdaStageProps</a></code> | Properties for the stage. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.SnsSqsToLambdaStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

Scope within which this construct is defined.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.SnsSqsToLambdaStage.Initializer.parameter.id"></a>

- *Type:* string

Identifier of the stage.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.SnsSqsToLambdaStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.SnsToLambdaStageProps">SnsToLambdaStageProps</a>

Properties for the stage.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.SnsSqsToLambdaStage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.SnsSqsToLambdaStage.addAlarm">addAlarm</a></code> | Add a CloudWatch alarm for the DataStage. |

---

##### `toString` <a name="toString" id="aws-ddk-core.SnsSqsToLambdaStage.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addAlarm` <a name="addAlarm" id="aws-ddk-core.SnsSqsToLambdaStage.addAlarm"></a>

```typescript
public addAlarm(id: string, props: AlarmProps): DataStage
```

Add a CloudWatch alarm for the DataStage.

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.SnsSqsToLambdaStage.addAlarm.parameter.id"></a>

- *Type:* string

Identifier of the CloudWatch Alarm.

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.SnsSqsToLambdaStage.addAlarm.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AlarmProps">AlarmProps</a>

Properties for the alarm.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.SnsSqsToLambdaStage.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-core.SnsSqsToLambdaStage.isConstruct"></a>

```typescript
import { SnsSqsToLambdaStage } from 'aws-ddk-core'

SnsSqsToLambdaStage.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-core.SnsSqsToLambdaStage.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.SnsSqsToLambdaStage.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-core.SnsSqsToLambdaStage.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.SnsSqsToLambdaStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | Output event pattern of the stage. |
| <code><a href="#aws-ddk-core.SnsSqsToLambdaStage.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.SnsSqsToLambdaStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | Input targets for the stage. |
| <code><a href="#aws-ddk-core.SnsSqsToLambdaStage.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Flag indicating whether the alarms are enabled for this stage. |
| <code><a href="#aws-ddk-core.SnsSqsToLambdaStage.property.cloudwatchAlarms">cloudwatchAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm[]</code> | List of CloudWatch Alarms linked to the stage. |
| <code><a href="#aws-ddk-core.SnsSqsToLambdaStage.property.function">function</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | *No description.* |
| <code><a href="#aws-ddk-core.SnsSqsToLambdaStage.property.queue">queue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | *No description.* |
| <code><a href="#aws-ddk-core.SnsSqsToLambdaStage.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.Queue</code> | *No description.* |
| <code><a href="#aws-ddk-core.SnsSqsToLambdaStage.property.topic">topic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | *No description.* |
| <code><a href="#aws-ddk-core.SnsSqsToLambdaStage.property.snsDeadLetterQueue">snsDeadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.Queue</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-core.SnsSqsToLambdaStage.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.SnsSqsToLambdaStage.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.SnsSqsToLambdaStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

Output event pattern of the stage.

Event pattern describes the structure of output event(s) produced by this stage.
Event Rules use event patterns to select events and route them to targets.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.SnsSqsToLambdaStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.SnsSqsToLambdaStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

Input targets for the stage.

Targets are used by Event Rules to describe what should be invoked when a rule matches an event.

---

##### `alarmsEnabled`<sup>Required</sup> <a name="alarmsEnabled" id="aws-ddk-core.SnsSqsToLambdaStage.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

Flag indicating whether the alarms are enabled for this stage.

---

##### `cloudwatchAlarms`<sup>Required</sup> <a name="cloudwatchAlarms" id="aws-ddk-core.SnsSqsToLambdaStage.property.cloudwatchAlarms"></a>

```typescript
public readonly cloudwatchAlarms: Alarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm[]

List of CloudWatch Alarms linked to the stage.

---

##### `function`<sup>Required</sup> <a name="function" id="aws-ddk-core.SnsSqsToLambdaStage.property.function"></a>

```typescript
public readonly function: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

---

##### `queue`<sup>Required</sup> <a name="queue" id="aws-ddk-core.SnsSqsToLambdaStage.property.queue"></a>

```typescript
public readonly queue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="aws-ddk-core.SnsSqsToLambdaStage.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: Queue;
```

- *Type:* aws-cdk-lib.aws_sqs.Queue

---

##### `topic`<sup>Required</sup> <a name="topic" id="aws-ddk-core.SnsSqsToLambdaStage.property.topic"></a>

```typescript
public readonly topic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic

---

##### `snsDeadLetterQueue`<sup>Optional</sup> <a name="snsDeadLetterQueue" id="aws-ddk-core.SnsSqsToLambdaStage.property.snsDeadLetterQueue"></a>

```typescript
public readonly snsDeadLetterQueue: Queue;
```

- *Type:* aws-cdk-lib.aws_sqs.Queue

---


### SqsToLambdaStage <a name="SqsToLambdaStage" id="aws-ddk-core.SqsToLambdaStage"></a>

Stage implements an Amazon SQS queue connected to an AWS Lambda function, with an optional DLQ.

#### Initializers <a name="Initializers" id="aws-ddk-core.SqsToLambdaStage.Initializer"></a>

```typescript
import { SqsToLambdaStage } from 'aws-ddk-core'

new SqsToLambdaStage(scope: Construct, id: string, props: SqsToLambdaStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | Scope within which this construct is defined. |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.Initializer.parameter.id">id</a></code> | <code>string</code> | Identifier of the stage. |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.SqsToLambdaStageProps">SqsToLambdaStageProps</a></code> | Properties for the stage. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.SqsToLambdaStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

Scope within which this construct is defined.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.SqsToLambdaStage.Initializer.parameter.id"></a>

- *Type:* string

Identifier of the stage.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.SqsToLambdaStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.SqsToLambdaStageProps">SqsToLambdaStageProps</a>

Properties for the stage.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.addAlarm">addAlarm</a></code> | Add a CloudWatch alarm for the DataStage. |

---

##### `toString` <a name="toString" id="aws-ddk-core.SqsToLambdaStage.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addAlarm` <a name="addAlarm" id="aws-ddk-core.SqsToLambdaStage.addAlarm"></a>

```typescript
public addAlarm(id: string, props: AlarmProps): DataStage
```

Add a CloudWatch alarm for the DataStage.

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.SqsToLambdaStage.addAlarm.parameter.id"></a>

- *Type:* string

Identifier of the CloudWatch Alarm.

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.SqsToLambdaStage.addAlarm.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AlarmProps">AlarmProps</a>

Properties for the alarm.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-core.SqsToLambdaStage.isConstruct"></a>

```typescript
import { SqsToLambdaStage } from 'aws-ddk-core'

SqsToLambdaStage.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-core.SqsToLambdaStage.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | Output event pattern of the stage. |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | Input targets for the stage. |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Flag indicating whether the alarms are enabled for this stage. |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.property.cloudwatchAlarms">cloudwatchAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm[]</code> | List of CloudWatch Alarms linked to the stage. |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.property.function">function</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.property.queue">queue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.Queue</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-core.SqsToLambdaStage.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.SqsToLambdaStage.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.SqsToLambdaStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

Output event pattern of the stage.

Event pattern describes the structure of output event(s) produced by this stage.
Event Rules use event patterns to select events and route them to targets.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.SqsToLambdaStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.SqsToLambdaStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

Input targets for the stage.

Targets are used by Event Rules to describe what should be invoked when a rule matches an event.

---

##### `alarmsEnabled`<sup>Required</sup> <a name="alarmsEnabled" id="aws-ddk-core.SqsToLambdaStage.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

Flag indicating whether the alarms are enabled for this stage.

---

##### `cloudwatchAlarms`<sup>Required</sup> <a name="cloudwatchAlarms" id="aws-ddk-core.SqsToLambdaStage.property.cloudwatchAlarms"></a>

```typescript
public readonly cloudwatchAlarms: Alarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm[]

List of CloudWatch Alarms linked to the stage.

---

##### `function`<sup>Required</sup> <a name="function" id="aws-ddk-core.SqsToLambdaStage.property.function"></a>

```typescript
public readonly function: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

---

##### `queue`<sup>Required</sup> <a name="queue" id="aws-ddk-core.SqsToLambdaStage.property.queue"></a>

```typescript
public readonly queue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="aws-ddk-core.SqsToLambdaStage.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: Queue;
```

- *Type:* aws-cdk-lib.aws_sqs.Queue

---


### Stage <a name="Stage" id="aws-ddk-core.Stage"></a>

Abstract class representing a stage.

#### Initializers <a name="Initializers" id="aws-ddk-core.Stage.Initializer"></a>

```typescript
import { Stage } from 'aws-ddk-core'

new Stage(scope: Construct, id: string, props: StageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.Stage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | Scope within which this construct is defined. |
| <code><a href="#aws-ddk-core.Stage.Initializer.parameter.id">id</a></code> | <code>string</code> | Identifier of the stage. |
| <code><a href="#aws-ddk-core.Stage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.StageProps">StageProps</a></code> | Properties for the stage. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.Stage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

Scope within which this construct is defined.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.Stage.Initializer.parameter.id"></a>

- *Type:* string

Identifier of the stage.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.Stage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.StageProps">StageProps</a>

Properties for the stage.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.Stage.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-ddk-core.Stage.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.Stage.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-core.Stage.isConstruct"></a>

```typescript
import { Stage } from 'aws-ddk-core'

Stage.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-core.Stage.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.Stage.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-core.Stage.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.Stage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | Output event pattern of the stage. |
| <code><a href="#aws-ddk-core.Stage.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.Stage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | Input targets for the stage. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-core.Stage.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.Stage.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.Stage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

Output event pattern of the stage.

Event pattern describes the structure of output event(s) produced by this stage.
Event Rules use event patterns to select events and route them to targets.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.Stage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.Stage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

Input targets for the stage.

Targets are used by Event Rules to describe what should be invoked when a rule matches an event.

---


### StateMachineStage <a name="StateMachineStage" id="aws-ddk-core.StateMachineStage"></a>

DataStage with helper methods to simplify StateMachine stages creation.

#### Initializers <a name="Initializers" id="aws-ddk-core.StateMachineStage.Initializer"></a>

```typescript
import { StateMachineStage } from 'aws-ddk-core'

new StateMachineStage(scope: Construct, id: string, props: StateMachineStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.StateMachineStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | Scope within which this construct is defined. |
| <code><a href="#aws-ddk-core.StateMachineStage.Initializer.parameter.id">id</a></code> | <code>string</code> | Identifier of the stage. |
| <code><a href="#aws-ddk-core.StateMachineStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.StateMachineStageProps">StateMachineStageProps</a></code> | Properties for the stage. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.StateMachineStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

Scope within which this construct is defined.

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.StateMachineStage.Initializer.parameter.id"></a>

- *Type:* string

Identifier of the stage.

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.StateMachineStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.StateMachineStageProps">StateMachineStageProps</a>

Properties for the stage.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.StateMachineStage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.StateMachineStage.addAlarm">addAlarm</a></code> | Add a CloudWatch alarm for the DataStage. |

---

##### `toString` <a name="toString" id="aws-ddk-core.StateMachineStage.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addAlarm` <a name="addAlarm" id="aws-ddk-core.StateMachineStage.addAlarm"></a>

```typescript
public addAlarm(id: string, props: AlarmProps): DataStage
```

Add a CloudWatch alarm for the DataStage.

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.StateMachineStage.addAlarm.parameter.id"></a>

- *Type:* string

Identifier of the CloudWatch Alarm.

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.StateMachineStage.addAlarm.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AlarmProps">AlarmProps</a>

Properties for the alarm.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.StateMachineStage.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-core.StateMachineStage.isConstruct"></a>

```typescript
import { StateMachineStage } from 'aws-ddk-core'

StateMachineStage.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-core.StateMachineStage.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.StateMachineStage.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-core.StateMachineStage.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.StateMachineStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | Output event pattern of the stage. |
| <code><a href="#aws-ddk-core.StateMachineStage.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.StateMachineStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | Input targets for the stage. |
| <code><a href="#aws-ddk-core.StateMachineStage.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Flag indicating whether the alarms are enabled for this stage. |
| <code><a href="#aws-ddk-core.StateMachineStage.property.cloudwatchAlarms">cloudwatchAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm[]</code> | List of CloudWatch Alarms linked to the stage. |
| <code><a href="#aws-ddk-core.StateMachineStage.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.StateMachine</code> | State machine. |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-core.StateMachineStage.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.StateMachineStage.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.StateMachineStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

Output event pattern of the stage.

Event pattern describes the structure of output event(s) produced by this stage.
Event Rules use event patterns to select events and route them to targets.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.StateMachineStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.StateMachineStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

Input targets for the stage.

Targets are used by Event Rules to describe what should be invoked when a rule matches an event.

---

##### `alarmsEnabled`<sup>Required</sup> <a name="alarmsEnabled" id="aws-ddk-core.StateMachineStage.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

Flag indicating whether the alarms are enabled for this stage.

---

##### `cloudwatchAlarms`<sup>Required</sup> <a name="cloudwatchAlarms" id="aws-ddk-core.StateMachineStage.property.cloudwatchAlarms"></a>

```typescript
public readonly cloudwatchAlarms: Alarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm[]

List of CloudWatch Alarms linked to the stage.

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="aws-ddk-core.StateMachineStage.property.stateMachine"></a>

```typescript
public readonly stateMachine: StateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.StateMachine

State machine.

---


## Structs <a name="Structs" id="Structs"></a>

### AddApplicationStageProps <a name="AddApplicationStageProps" id="aws-ddk-core.AddApplicationStageProps"></a>

Properties for adding an application stage.

#### Initializer <a name="Initializer" id="aws-ddk-core.AddApplicationStageProps.Initializer"></a>

```typescript
import { AddApplicationStageProps } from 'aws-ddk-core'

const addApplicationStageProps: AddApplicationStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AddApplicationStageProps.property.stage">stage</a></code> | <code>aws-cdk-lib.Stage</code> | Application stage instance. |
| <code><a href="#aws-ddk-core.AddApplicationStageProps.property.stageId">stageId</a></code> | <code>string</code> | Identifier of the stage. |
| <code><a href="#aws-ddk-core.AddApplicationStageProps.property.manualApprovals">manualApprovals</a></code> | <code>boolean</code> | Configure manual approvals. |

---

##### `stage`<sup>Required</sup> <a name="stage" id="aws-ddk-core.AddApplicationStageProps.property.stage"></a>

```typescript
public readonly stage: Stage;
```

- *Type:* aws-cdk-lib.Stage

Application stage instance.

---

##### `stageId`<sup>Required</sup> <a name="stageId" id="aws-ddk-core.AddApplicationStageProps.property.stageId"></a>

```typescript
public readonly stageId: string;
```

- *Type:* string

Identifier of the stage.

---

##### `manualApprovals`<sup>Optional</sup> <a name="manualApprovals" id="aws-ddk-core.AddApplicationStageProps.property.manualApprovals"></a>

```typescript
public readonly manualApprovals: boolean;
```

- *Type:* boolean
- *Default:* false

Configure manual approvals.

---

### AddApplicationWaveProps <a name="AddApplicationWaveProps" id="aws-ddk-core.AddApplicationWaveProps"></a>

Properties for adding an application wave.

#### Initializer <a name="Initializer" id="aws-ddk-core.AddApplicationWaveProps.Initializer"></a>

```typescript
import { AddApplicationWaveProps } from 'aws-ddk-core'

const addApplicationWaveProps: AddApplicationWaveProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AddApplicationWaveProps.property.stageId">stageId</a></code> | <code>string</code> | Identifier of the wave. |
| <code><a href="#aws-ddk-core.AddApplicationWaveProps.property.stages">stages</a></code> | <code>aws-cdk-lib.Stage[]</code> | Application stage instance. |
| <code><a href="#aws-ddk-core.AddApplicationWaveProps.property.manualApprovals">manualApprovals</a></code> | <code>boolean</code> | Configure manual approvals. |

---

##### `stageId`<sup>Required</sup> <a name="stageId" id="aws-ddk-core.AddApplicationWaveProps.property.stageId"></a>

```typescript
public readonly stageId: string;
```

- *Type:* string

Identifier of the wave.

---

##### `stages`<sup>Required</sup> <a name="stages" id="aws-ddk-core.AddApplicationWaveProps.property.stages"></a>

```typescript
public readonly stages: Stage[];
```

- *Type:* aws-cdk-lib.Stage[]

Application stage instance.

---

##### `manualApprovals`<sup>Optional</sup> <a name="manualApprovals" id="aws-ddk-core.AddApplicationWaveProps.property.manualApprovals"></a>

```typescript
public readonly manualApprovals: boolean;
```

- *Type:* boolean
- *Default:* false

Configure manual approvals.

---

### AddCustomStageProps <a name="AddCustomStageProps" id="aws-ddk-core.AddCustomStageProps"></a>

Properties for adding a custom stage.

#### Initializer <a name="Initializer" id="aws-ddk-core.AddCustomStageProps.Initializer"></a>

```typescript
import { AddCustomStageProps } from 'aws-ddk-core'

const addCustomStageProps: AddCustomStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AddCustomStageProps.property.stageName">stageName</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.AddCustomStageProps.property.steps">steps</a></code> | <code>aws-cdk-lib.pipelines.Step[]</code> | Steps to add to this stage. List of Step objects. |

---

##### `stageName`<sup>Required</sup> <a name="stageName" id="aws-ddk-core.AddCustomStageProps.property.stageName"></a>

```typescript
public readonly stageName: string;
```

- *Type:* string

Name of the stage.

---

##### `steps`<sup>Required</sup> <a name="steps" id="aws-ddk-core.AddCustomStageProps.property.steps"></a>

```typescript
public readonly steps: Step[];
```

- *Type:* aws-cdk-lib.pipelines.Step[]

Steps to add to this stage. List of Step objects.

See [Documentation on aws_cdk.pipelines.Step](https://docs.aws.amazon.com/cdk/api/v1/python/aws_cdk.pipelines/Step.html)
for more detail.

---

### AdditionalPipelineProps <a name="AdditionalPipelineProps" id="aws-ddk-core.AdditionalPipelineProps"></a>

Additional properties for building the CodePipeline.

#### Initializer <a name="Initializer" id="aws-ddk-core.AdditionalPipelineProps.Initializer"></a>

```typescript
import { AdditionalPipelineProps } from 'aws-ddk-core'

const additionalPipelineProps: AdditionalPipelineProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.assetPublishingCodeBuildDefaults">assetPublishingCodeBuildDefaults</a></code> | <code>aws-cdk-lib.pipelines.CodeBuildOptions</code> | Additional customizations to apply to the asset publishing CodeBuild projects. |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.cliVersion">cliVersion</a></code> | <code>string</code> | CDK CLI version to use in self-mutation and asset publishing steps. |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.codeBuildDefaults">codeBuildDefaults</a></code> | <code>aws-cdk-lib.pipelines.CodeBuildOptions</code> | Customize the CodeBuild projects created for this pipeline. |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.codePipeline">codePipeline</a></code> | <code>aws-cdk-lib.aws_codepipeline.Pipeline</code> | An existing Pipeline to be reused and built upon. |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.dockerCredentials">dockerCredentials</a></code> | <code>aws-cdk-lib.pipelines.DockerCredential[]</code> | A list of credentials used to authenticate to Docker registries. |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.dockerEnabledForSelfMutation">dockerEnabledForSelfMutation</a></code> | <code>boolean</code> | Enable Docker for the self-mutate step. |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.dockerEnabledForSynth">dockerEnabledForSynth</a></code> | <code>boolean</code> | Enable Docker for the 'synth' step. |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.publishAssetsInParallel">publishAssetsInParallel</a></code> | <code>boolean</code> | Publish assets in multiple CodeBuild projects. |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.reuseCrossRegionSupportStacks">reuseCrossRegionSupportStacks</a></code> | <code>boolean</code> | Reuse the same cross region support stack for all pipelines in the App. |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.selfMutation">selfMutation</a></code> | <code>boolean</code> | Whether the pipeline will update itself. |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.selfMutationCodeBuildDefaults">selfMutationCodeBuildDefaults</a></code> | <code>aws-cdk-lib.pipelines.CodeBuildOptions</code> | Additional customizations to apply to the self mutation CodeBuild projects. |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.synthCodeBuildDefaults">synthCodeBuildDefaults</a></code> | <code>aws-cdk-lib.pipelines.CodeBuildOptions</code> | Additional customizations to apply to the synthesize CodeBuild projects. |

---

##### `assetPublishingCodeBuildDefaults`<sup>Optional</sup> <a name="assetPublishingCodeBuildDefaults" id="aws-ddk-core.AdditionalPipelineProps.property.assetPublishingCodeBuildDefaults"></a>

```typescript
public readonly assetPublishingCodeBuildDefaults: CodeBuildOptions;
```

- *Type:* aws-cdk-lib.pipelines.CodeBuildOptions
- *Default:* Only `codeBuildDefaults` are applied

Additional customizations to apply to the asset publishing CodeBuild projects.

---

##### `cliVersion`<sup>Optional</sup> <a name="cliVersion" id="aws-ddk-core.AdditionalPipelineProps.property.cliVersion"></a>

```typescript
public readonly cliVersion: string;
```

- *Type:* string
- *Default:* latest version

CDK CLI version to use in self-mutation and asset publishing steps.

---

##### `codeBuildDefaults`<sup>Optional</sup> <a name="codeBuildDefaults" id="aws-ddk-core.AdditionalPipelineProps.property.codeBuildDefaults"></a>

```typescript
public readonly codeBuildDefaults: CodeBuildOptions;
```

- *Type:* aws-cdk-lib.pipelines.CodeBuildOptions
- *Default:* All projects run non-privileged build, SMALL instance, LinuxBuildImage.STANDARD_6_0

Customize the CodeBuild projects created for this pipeline.

---

##### `codePipeline`<sup>Optional</sup> <a name="codePipeline" id="aws-ddk-core.AdditionalPipelineProps.property.codePipeline"></a>

```typescript
public readonly codePipeline: Pipeline;
```

- *Type:* aws-cdk-lib.aws_codepipeline.Pipeline
- *Default:* a new underlying pipeline is created.

An existing Pipeline to be reused and built upon.

---

##### `dockerCredentials`<sup>Optional</sup> <a name="dockerCredentials" id="aws-ddk-core.AdditionalPipelineProps.property.dockerCredentials"></a>

```typescript
public readonly dockerCredentials: DockerCredential[];
```

- *Type:* aws-cdk-lib.pipelines.DockerCredential[]
- *Default:* []

A list of credentials used to authenticate to Docker registries.

Specify any credentials necessary within the pipeline to build, synth, update, or publish assets.

---

##### `dockerEnabledForSelfMutation`<sup>Optional</sup> <a name="dockerEnabledForSelfMutation" id="aws-ddk-core.AdditionalPipelineProps.property.dockerEnabledForSelfMutation"></a>

```typescript
public readonly dockerEnabledForSelfMutation: boolean;
```

- *Type:* boolean
- *Default:* false

Enable Docker for the self-mutate step.

---

##### `dockerEnabledForSynth`<sup>Optional</sup> <a name="dockerEnabledForSynth" id="aws-ddk-core.AdditionalPipelineProps.property.dockerEnabledForSynth"></a>

```typescript
public readonly dockerEnabledForSynth: boolean;
```

- *Type:* boolean
- *Default:* false

Enable Docker for the 'synth' step.

---

##### `publishAssetsInParallel`<sup>Optional</sup> <a name="publishAssetsInParallel" id="aws-ddk-core.AdditionalPipelineProps.property.publishAssetsInParallel"></a>

```typescript
public readonly publishAssetsInParallel: boolean;
```

- *Type:* boolean
- *Default:* true

Publish assets in multiple CodeBuild projects.

---

##### `reuseCrossRegionSupportStacks`<sup>Optional</sup> <a name="reuseCrossRegionSupportStacks" id="aws-ddk-core.AdditionalPipelineProps.property.reuseCrossRegionSupportStacks"></a>

```typescript
public readonly reuseCrossRegionSupportStacks: boolean;
```

- *Type:* boolean
- *Default:* true (Use the same support stack for all pipelines in App)

Reuse the same cross region support stack for all pipelines in the App.

---

##### `selfMutation`<sup>Optional</sup> <a name="selfMutation" id="aws-ddk-core.AdditionalPipelineProps.property.selfMutation"></a>

```typescript
public readonly selfMutation: boolean;
```

- *Type:* boolean
- *Default:* true

Whether the pipeline will update itself.

This needs to be set to `true` to allow the pipeline to reconfigure
itself when assets or stages are being added to it, and `true` is the
recommended setting.

You can temporarily set this to `false` while you are iterating
on the pipeline itself and prefer to deploy changes using `cdk deploy`.

---

##### `selfMutationCodeBuildDefaults`<sup>Optional</sup> <a name="selfMutationCodeBuildDefaults" id="aws-ddk-core.AdditionalPipelineProps.property.selfMutationCodeBuildDefaults"></a>

```typescript
public readonly selfMutationCodeBuildDefaults: CodeBuildOptions;
```

- *Type:* aws-cdk-lib.pipelines.CodeBuildOptions
- *Default:* Only `codeBuildDefaults` are applied

Additional customizations to apply to the self mutation CodeBuild projects.

---

##### `synthCodeBuildDefaults`<sup>Optional</sup> <a name="synthCodeBuildDefaults" id="aws-ddk-core.AdditionalPipelineProps.property.synthCodeBuildDefaults"></a>

```typescript
public readonly synthCodeBuildDefaults: CodeBuildOptions;
```

- *Type:* aws-cdk-lib.pipelines.CodeBuildOptions
- *Default:* Only `codeBuildDefaults` are applied

Additional customizations to apply to the synthesize CodeBuild projects.

---

### AddNotificationsProps <a name="AddNotificationsProps" id="aws-ddk-core.AddNotificationsProps"></a>

Properties for adding notifications.

#### Initializer <a name="Initializer" id="aws-ddk-core.AddNotificationsProps.Initializer"></a>

```typescript
import { AddNotificationsProps } from 'aws-ddk-core'

const addNotificationsProps: AddNotificationsProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AddNotificationsProps.property.notificationRule">notificationRule</a></code> | <code>aws-cdk-lib.aws_codestarnotifications.NotificationRule</code> | Override notification rule. |

---

##### `notificationRule`<sup>Optional</sup> <a name="notificationRule" id="aws-ddk-core.AddNotificationsProps.property.notificationRule"></a>

```typescript
public readonly notificationRule: NotificationRule;
```

- *Type:* aws-cdk-lib.aws_codestarnotifications.NotificationRule

Override notification rule.

---

### AddRuleProps <a name="AddRuleProps" id="aws-ddk-core.AddRuleProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.AddRuleProps.Initializer"></a>

```typescript
import { AddRuleProps } from 'aws-ddk-core'

const addRuleProps: AddRuleProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AddRuleProps.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | *No description.* |
| <code><a href="#aws-ddk-core.AddRuleProps.property.eventTargets">eventTargets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.AddRuleProps.property.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.AddRuleProps.property.overrideRule">overrideRule</a></code> | <code>aws-cdk-lib.aws_events.IRule</code> | *No description.* |
| <code><a href="#aws-ddk-core.AddRuleProps.property.ruleName">ruleName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.AddRuleProps.property.schedule">schedule</a></code> | <code>aws-cdk-lib.aws_events.Schedule</code> | *No description.* |

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.AddRuleProps.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

---

##### `eventTargets`<sup>Optional</sup> <a name="eventTargets" id="aws-ddk-core.AddRuleProps.property.eventTargets"></a>

```typescript
public readonly eventTargets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

---

##### `id`<sup>Optional</sup> <a name="id" id="aws-ddk-core.AddRuleProps.property.id"></a>

```typescript
public readonly id: string;
```

- *Type:* string

---

##### `overrideRule`<sup>Optional</sup> <a name="overrideRule" id="aws-ddk-core.AddRuleProps.property.overrideRule"></a>

```typescript
public readonly overrideRule: IRule;
```

- *Type:* aws-cdk-lib.aws_events.IRule

---

##### `ruleName`<sup>Optional</sup> <a name="ruleName" id="aws-ddk-core.AddRuleProps.property.ruleName"></a>

```typescript
public readonly ruleName: string;
```

- *Type:* string

---

##### `schedule`<sup>Optional</sup> <a name="schedule" id="aws-ddk-core.AddRuleProps.property.schedule"></a>

```typescript
public readonly schedule: Schedule;
```

- *Type:* aws-cdk-lib.aws_events.Schedule

---

### AddSecurityLintStageProps <a name="AddSecurityLintStageProps" id="aws-ddk-core.AddSecurityLintStageProps"></a>

Properties for adding a security lint stage.

#### Initializer <a name="Initializer" id="aws-ddk-core.AddSecurityLintStageProps.Initializer"></a>

```typescript
import { AddSecurityLintStageProps } from 'aws-ddk-core'

const addSecurityLintStageProps: AddSecurityLintStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AddSecurityLintStageProps.property.cloudAssemblyFileSet">cloudAssemblyFileSet</a></code> | <code>aws-cdk-lib.pipelines.IFileSetProducer</code> | Cloud assembly file set producer. |
| <code><a href="#aws-ddk-core.AddSecurityLintStageProps.property.stageName">stageName</a></code> | <code>string</code> | Name of the stage. |

---

##### `cloudAssemblyFileSet`<sup>Optional</sup> <a name="cloudAssemblyFileSet" id="aws-ddk-core.AddSecurityLintStageProps.property.cloudAssemblyFileSet"></a>

```typescript
public readonly cloudAssemblyFileSet: IFileSetProducer;
```

- *Type:* aws-cdk-lib.pipelines.IFileSetProducer

Cloud assembly file set producer.

---

##### `stageName`<sup>Optional</sup> <a name="stageName" id="aws-ddk-core.AddSecurityLintStageProps.property.stageName"></a>

```typescript
public readonly stageName: string;
```

- *Type:* string

Name of the stage.

---

### AddStageProps <a name="AddStageProps" id="aws-ddk-core.AddStageProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.AddStageProps.Initializer"></a>

```typescript
import { AddStageProps } from 'aws-ddk-core'

const addStageProps: AddStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AddStageProps.property.stage">stage</a></code> | <code><a href="#aws-ddk-core.Stage">Stage</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.AddStageProps.property.overrideRule">overrideRule</a></code> | <code>aws-cdk-lib.aws_events.IRule</code> | *No description.* |
| <code><a href="#aws-ddk-core.AddStageProps.property.ruleName">ruleName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.AddStageProps.property.schedule">schedule</a></code> | <code>aws-cdk-lib.aws_events.Schedule</code> | *No description.* |
| <code><a href="#aws-ddk-core.AddStageProps.property.skipRule">skipRule</a></code> | <code>boolean</code> | *No description.* |

---

##### `stage`<sup>Required</sup> <a name="stage" id="aws-ddk-core.AddStageProps.property.stage"></a>

```typescript
public readonly stage: Stage;
```

- *Type:* <a href="#aws-ddk-core.Stage">Stage</a>

---

##### `overrideRule`<sup>Optional</sup> <a name="overrideRule" id="aws-ddk-core.AddStageProps.property.overrideRule"></a>

```typescript
public readonly overrideRule: IRule;
```

- *Type:* aws-cdk-lib.aws_events.IRule

---

##### `ruleName`<sup>Optional</sup> <a name="ruleName" id="aws-ddk-core.AddStageProps.property.ruleName"></a>

```typescript
public readonly ruleName: string;
```

- *Type:* string

---

##### `schedule`<sup>Optional</sup> <a name="schedule" id="aws-ddk-core.AddStageProps.property.schedule"></a>

```typescript
public readonly schedule: Schedule;
```

- *Type:* aws-cdk-lib.aws_events.Schedule

---

##### `skipRule`<sup>Optional</sup> <a name="skipRule" id="aws-ddk-core.AddStageProps.property.skipRule"></a>

```typescript
public readonly skipRule: boolean;
```

- *Type:* boolean

---

### AddTestStageProps <a name="AddTestStageProps" id="aws-ddk-core.AddTestStageProps"></a>

Properties for adding a test stage.

#### Initializer <a name="Initializer" id="aws-ddk-core.AddTestStageProps.Initializer"></a>

```typescript
import { AddTestStageProps } from 'aws-ddk-core'

const addTestStageProps: AddTestStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AddTestStageProps.property.cloudAssemblyFileSet">cloudAssemblyFileSet</a></code> | <code>aws-cdk-lib.pipelines.IFileSetProducer</code> | Cloud assembly file set. |
| <code><a href="#aws-ddk-core.AddTestStageProps.property.commands">commands</a></code> | <code>string[]</code> | Additional commands to run in the test. |
| <code><a href="#aws-ddk-core.AddTestStageProps.property.stageName">stageName</a></code> | <code>string</code> | Name of the stage. |

---

##### `cloudAssemblyFileSet`<sup>Optional</sup> <a name="cloudAssemblyFileSet" id="aws-ddk-core.AddTestStageProps.property.cloudAssemblyFileSet"></a>

```typescript
public readonly cloudAssemblyFileSet: IFileSetProducer;
```

- *Type:* aws-cdk-lib.pipelines.IFileSetProducer

Cloud assembly file set.

---

##### `commands`<sup>Optional</sup> <a name="commands" id="aws-ddk-core.AddTestStageProps.property.commands"></a>

```typescript
public readonly commands: string[];
```

- *Type:* string[]
- *Default:* "./test.sh"

Additional commands to run in the test.

---

##### `stageName`<sup>Optional</sup> <a name="stageName" id="aws-ddk-core.AddTestStageProps.property.stageName"></a>

```typescript
public readonly stageName: string;
```

- *Type:* string

Name of the stage.

---

### AlarmProps <a name="AlarmProps" id="aws-ddk-core.AlarmProps"></a>

Properties for the alarm being added to the DataStage.

#### Initializer <a name="Initializer" id="aws-ddk-core.AlarmProps.Initializer"></a>

```typescript
import { AlarmProps } from 'aws-ddk-core'

const alarmProps: AlarmProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AlarmProps.property.metric">metric</a></code> | <code>aws-cdk-lib.aws_cloudwatch.IMetric</code> | Metric to use for creating the stage's CloudWatch Alarm. |
| <code><a href="#aws-ddk-core.AlarmProps.property.comparisonOperator">comparisonOperator</a></code> | <code>aws-cdk-lib.aws_cloudwatch.ComparisonOperator</code> | Comparison operator to use for alarm. |
| <code><a href="#aws-ddk-core.AlarmProps.property.evaluationPeriods">evaluationPeriods</a></code> | <code>number</code> | The value against which the specified alarm statistic is compared. |
| <code><a href="#aws-ddk-core.AlarmProps.property.threshold">threshold</a></code> | <code>number</code> | The number of periods over which data is compared to the specified threshold. |

---

##### `metric`<sup>Required</sup> <a name="metric" id="aws-ddk-core.AlarmProps.property.metric"></a>

```typescript
public readonly metric: IMetric;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.IMetric

Metric to use for creating the stage's CloudWatch Alarm.

---

##### `comparisonOperator`<sup>Optional</sup> <a name="comparisonOperator" id="aws-ddk-core.AlarmProps.property.comparisonOperator"></a>

```typescript
public readonly comparisonOperator: ComparisonOperator;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.ComparisonOperator
- *Default:* GREATER_THAN_THRESHOLD

Comparison operator to use for alarm.

---

##### `evaluationPeriods`<sup>Optional</sup> <a name="evaluationPeriods" id="aws-ddk-core.AlarmProps.property.evaluationPeriods"></a>

```typescript
public readonly evaluationPeriods: number;
```

- *Type:* number
- *Default:* 5

The value against which the specified alarm statistic is compared.

---

##### `threshold`<sup>Optional</sup> <a name="threshold" id="aws-ddk-core.AlarmProps.property.threshold"></a>

```typescript
public readonly threshold: number;
```

- *Type:* number
- *Default:* 1

The number of periods over which data is compared to the specified threshold.

---

### AppFlowIngestionStageProps <a name="AppFlowIngestionStageProps" id="aws-ddk-core.AppFlowIngestionStageProps"></a>

Properties of the AppFlow Ingestion stage.

#### Initializer <a name="Initializer" id="aws-ddk-core.AppFlowIngestionStageProps.Initializer"></a>

```typescript
import { AppFlowIngestionStageProps } from 'aws-ddk-core'

const appFlowIngestionStageProps: AppFlowIngestionStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AppFlowIngestionStageProps.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStageProps.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStageProps.property.additionalRolePolicyStatements">additionalRolePolicyStatements</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | Additional IAM policy statements to add to the state machine role. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStageProps.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Enable/Disable all alarms in the stage. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStageProps.property.stateMachineFailedExecutionsAlarmEvaluationPeriods">stateMachineFailedExecutionsAlarmEvaluationPeriods</a></code> | <code>number</code> | The number of periods over which data is compared to the specified threshold. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStageProps.property.stateMachineFailedExecutionsAlarmThreshold">stateMachineFailedExecutionsAlarmThreshold</a></code> | <code>number</code> | The number of failed state machine executions before triggering CW alarm. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStageProps.property.stateMachineInput">stateMachineInput</a></code> | <code>{[ key: string ]: any}</code> | Input of the state machine. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStageProps.property.stateMachineName">stateMachineName</a></code> | <code>string</code> | Name of the state machine. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStageProps.property.destinationFlowConfig">destinationFlowConfig</a></code> | <code>aws-cdk-lib.aws_appflow.CfnFlow.DestinationFlowConfigProperty</code> | The flow `appflow.CfnFlow.DestinationFlowConfigProperty` properties. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStageProps.property.flowExecutionStatusCheckPeriod">flowExecutionStatusCheckPeriod</a></code> | <code>aws-cdk-lib.Duration</code> | Time to wait between flow execution status checks. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStageProps.property.flowName">flowName</a></code> | <code>string</code> | Name of the AppFlow flow to run. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStageProps.property.flowTasks">flowTasks</a></code> | <code>aws-cdk-lib.aws_appflow.CfnFlow.TaskProperty[]</code> | The flow tasks properties. |
| <code><a href="#aws-ddk-core.AppFlowIngestionStageProps.property.sourceFlowConfig">sourceFlowConfig</a></code> | <code>aws-cdk-lib.aws_appflow.CfnFlow.SourceFlowConfigProperty</code> | The flow `appflow.CfnFlow.SourceFlowConfigProperty` properties. |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.AppFlowIngestionStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.AppFlowIngestionStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `additionalRolePolicyStatements`<sup>Optional</sup> <a name="additionalRolePolicyStatements" id="aws-ddk-core.AppFlowIngestionStageProps.property.additionalRolePolicyStatements"></a>

```typescript
public readonly additionalRolePolicyStatements: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]

Additional IAM policy statements to add to the state machine role.

---

##### `alarmsEnabled`<sup>Optional</sup> <a name="alarmsEnabled" id="aws-ddk-core.AppFlowIngestionStageProps.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean
- *Default:* true

Enable/Disable all alarms in the stage.

---

##### `stateMachineFailedExecutionsAlarmEvaluationPeriods`<sup>Optional</sup> <a name="stateMachineFailedExecutionsAlarmEvaluationPeriods" id="aws-ddk-core.AppFlowIngestionStageProps.property.stateMachineFailedExecutionsAlarmEvaluationPeriods"></a>

```typescript
public readonly stateMachineFailedExecutionsAlarmEvaluationPeriods: number;
```

- *Type:* number
- *Default:* 1

The number of periods over which data is compared to the specified threshold.

---

##### `stateMachineFailedExecutionsAlarmThreshold`<sup>Optional</sup> <a name="stateMachineFailedExecutionsAlarmThreshold" id="aws-ddk-core.AppFlowIngestionStageProps.property.stateMachineFailedExecutionsAlarmThreshold"></a>

```typescript
public readonly stateMachineFailedExecutionsAlarmThreshold: number;
```

- *Type:* number
- *Default:* 1

The number of failed state machine executions before triggering CW alarm.

---

##### `stateMachineInput`<sup>Optional</sup> <a name="stateMachineInput" id="aws-ddk-core.AppFlowIngestionStageProps.property.stateMachineInput"></a>

```typescript
public readonly stateMachineInput: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

Input of the state machine.

---

##### `stateMachineName`<sup>Optional</sup> <a name="stateMachineName" id="aws-ddk-core.AppFlowIngestionStageProps.property.stateMachineName"></a>

```typescript
public readonly stateMachineName: string;
```

- *Type:* string

Name of the state machine.

---

##### `destinationFlowConfig`<sup>Optional</sup> <a name="destinationFlowConfig" id="aws-ddk-core.AppFlowIngestionStageProps.property.destinationFlowConfig"></a>

```typescript
public readonly destinationFlowConfig: DestinationFlowConfigProperty;
```

- *Type:* aws-cdk-lib.aws_appflow.CfnFlow.DestinationFlowConfigProperty

The flow `appflow.CfnFlow.DestinationFlowConfigProperty` properties.

---

##### `flowExecutionStatusCheckPeriod`<sup>Optional</sup> <a name="flowExecutionStatusCheckPeriod" id="aws-ddk-core.AppFlowIngestionStageProps.property.flowExecutionStatusCheckPeriod"></a>

```typescript
public readonly flowExecutionStatusCheckPeriod: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* aws_cdk.Duration.seconds(15)

Time to wait between flow execution status checks.

---

##### `flowName`<sup>Optional</sup> <a name="flowName" id="aws-ddk-core.AppFlowIngestionStageProps.property.flowName"></a>

```typescript
public readonly flowName: string;
```

- *Type:* string

Name of the AppFlow flow to run.

If None, an AppFlow flow is created.

---

##### `flowTasks`<sup>Optional</sup> <a name="flowTasks" id="aws-ddk-core.AppFlowIngestionStageProps.property.flowTasks"></a>

```typescript
public readonly flowTasks: TaskProperty[];
```

- *Type:* aws-cdk-lib.aws_appflow.CfnFlow.TaskProperty[]

The flow tasks properties.

---

##### `sourceFlowConfig`<sup>Optional</sup> <a name="sourceFlowConfig" id="aws-ddk-core.AppFlowIngestionStageProps.property.sourceFlowConfig"></a>

```typescript
public readonly sourceFlowConfig: SourceFlowConfigProperty;
```

- *Type:* aws-cdk-lib.aws_appflow.CfnFlow.SourceFlowConfigProperty

The flow `appflow.CfnFlow.SourceFlowConfigProperty` properties.

---

### AthenaToSQLStageProps <a name="AthenaToSQLStageProps" id="aws-ddk-core.AthenaToSQLStageProps"></a>

Properties for `AthenaSQLStage`.

#### Initializer <a name="Initializer" id="aws-ddk-core.AthenaToSQLStageProps.Initializer"></a>

```typescript
import { AthenaToSQLStageProps } from 'aws-ddk-core'

const athenaToSQLStageProps: AthenaToSQLStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.additionalRolePolicyStatements">additionalRolePolicyStatements</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | Additional IAM policy statements to add to the state machine role. |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Enable/Disable all alarms in the stage. |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.stateMachineFailedExecutionsAlarmEvaluationPeriods">stateMachineFailedExecutionsAlarmEvaluationPeriods</a></code> | <code>number</code> | The number of periods over which data is compared to the specified threshold. |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.stateMachineFailedExecutionsAlarmThreshold">stateMachineFailedExecutionsAlarmThreshold</a></code> | <code>number</code> | The number of failed state machine executions before triggering CW alarm. |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.stateMachineInput">stateMachineInput</a></code> | <code>{[ key: string ]: any}</code> | Input of the state machine. |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.stateMachineName">stateMachineName</a></code> | <code>string</code> | Name of the state machine. |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.catalogName">catalogName</a></code> | <code>string</code> | Catalog name. |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.databaseName">databaseName</a></code> | <code>string</code> | Database name. |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.Key</code> | Encryption KMS key. |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.encryptionOption">encryptionOption</a></code> | <code>aws-cdk-lib.aws_stepfunctions_tasks.EncryptionOption</code> | Encryption configuration. |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.outputLocation">outputLocation</a></code> | <code>aws-cdk-lib.aws_s3.Location</code> | Output S3 location. |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.parallel">parallel</a></code> | <code>boolean</code> | flag to determine parallel or sequential execution. |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.queryString">queryString</a></code> | <code>string[]</code> | SQL queries that will be started. |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.queryStringPath">queryStringPath</a></code> | <code>string</code> | dynamic path in statemachine for SQL query to be started. |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.workGroup">workGroup</a></code> | <code>string</code> | Athena workgroup name. |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.AthenaToSQLStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.AthenaToSQLStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `additionalRolePolicyStatements`<sup>Optional</sup> <a name="additionalRolePolicyStatements" id="aws-ddk-core.AthenaToSQLStageProps.property.additionalRolePolicyStatements"></a>

```typescript
public readonly additionalRolePolicyStatements: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]

Additional IAM policy statements to add to the state machine role.

---

##### `alarmsEnabled`<sup>Optional</sup> <a name="alarmsEnabled" id="aws-ddk-core.AthenaToSQLStageProps.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean
- *Default:* true

Enable/Disable all alarms in the stage.

---

##### `stateMachineFailedExecutionsAlarmEvaluationPeriods`<sup>Optional</sup> <a name="stateMachineFailedExecutionsAlarmEvaluationPeriods" id="aws-ddk-core.AthenaToSQLStageProps.property.stateMachineFailedExecutionsAlarmEvaluationPeriods"></a>

```typescript
public readonly stateMachineFailedExecutionsAlarmEvaluationPeriods: number;
```

- *Type:* number
- *Default:* 1

The number of periods over which data is compared to the specified threshold.

---

##### `stateMachineFailedExecutionsAlarmThreshold`<sup>Optional</sup> <a name="stateMachineFailedExecutionsAlarmThreshold" id="aws-ddk-core.AthenaToSQLStageProps.property.stateMachineFailedExecutionsAlarmThreshold"></a>

```typescript
public readonly stateMachineFailedExecutionsAlarmThreshold: number;
```

- *Type:* number
- *Default:* 1

The number of failed state machine executions before triggering CW alarm.

---

##### `stateMachineInput`<sup>Optional</sup> <a name="stateMachineInput" id="aws-ddk-core.AthenaToSQLStageProps.property.stateMachineInput"></a>

```typescript
public readonly stateMachineInput: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

Input of the state machine.

---

##### `stateMachineName`<sup>Optional</sup> <a name="stateMachineName" id="aws-ddk-core.AthenaToSQLStageProps.property.stateMachineName"></a>

```typescript
public readonly stateMachineName: string;
```

- *Type:* string

Name of the state machine.

---

##### `catalogName`<sup>Optional</sup> <a name="catalogName" id="aws-ddk-core.AthenaToSQLStageProps.property.catalogName"></a>

```typescript
public readonly catalogName: string;
```

- *Type:* string

Catalog name.

---

##### `databaseName`<sup>Optional</sup> <a name="databaseName" id="aws-ddk-core.AthenaToSQLStageProps.property.databaseName"></a>

```typescript
public readonly databaseName: string;
```

- *Type:* string

Database name.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="aws-ddk-core.AthenaToSQLStageProps.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: Key;
```

- *Type:* aws-cdk-lib.aws_kms.Key

Encryption KMS key.

---

##### `encryptionOption`<sup>Optional</sup> <a name="encryptionOption" id="aws-ddk-core.AthenaToSQLStageProps.property.encryptionOption"></a>

```typescript
public readonly encryptionOption: EncryptionOption;
```

- *Type:* aws-cdk-lib.aws_stepfunctions_tasks.EncryptionOption

Encryption configuration.

---

##### `outputLocation`<sup>Optional</sup> <a name="outputLocation" id="aws-ddk-core.AthenaToSQLStageProps.property.outputLocation"></a>

```typescript
public readonly outputLocation: Location;
```

- *Type:* aws-cdk-lib.aws_s3.Location

Output S3 location.

---

##### `parallel`<sup>Optional</sup> <a name="parallel" id="aws-ddk-core.AthenaToSQLStageProps.property.parallel"></a>

```typescript
public readonly parallel: boolean;
```

- *Type:* boolean
- *Default:* false

flag to determine parallel or sequential execution.

---

##### `queryString`<sup>Optional</sup> <a name="queryString" id="aws-ddk-core.AthenaToSQLStageProps.property.queryString"></a>

```typescript
public readonly queryString: string[];
```

- *Type:* string[]

SQL queries that will be started.

---

##### `queryStringPath`<sup>Optional</sup> <a name="queryStringPath" id="aws-ddk-core.AthenaToSQLStageProps.property.queryStringPath"></a>

```typescript
public readonly queryStringPath: string;
```

- *Type:* string

dynamic path in statemachine for SQL query to be started.

---

##### `workGroup`<sup>Optional</sup> <a name="workGroup" id="aws-ddk-core.AthenaToSQLStageProps.property.workGroup"></a>

```typescript
public readonly workGroup: string;
```

- *Type:* string

Athena workgroup name.

---

### BaseStackProps <a name="BaseStackProps" id="aws-ddk-core.BaseStackProps"></a>

Properties of `BaseStack`.

#### Initializer <a name="Initializer" id="aws-ddk-core.BaseStackProps.Initializer"></a>

```typescript
import { BaseStackProps } from 'aws-ddk-core'

const baseStackProps: BaseStackProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.BaseStackProps.property.analyticsReporting">analyticsReporting</a></code> | <code>boolean</code> | Include runtime versioning information in this Stack. |
| <code><a href="#aws-ddk-core.BaseStackProps.property.crossRegionReferences">crossRegionReferences</a></code> | <code>boolean</code> | Enable this flag to allow native cross region stack references. |
| <code><a href="#aws-ddk-core.BaseStackProps.property.description">description</a></code> | <code>string</code> | A description of the stack. |
| <code><a href="#aws-ddk-core.BaseStackProps.property.env">env</a></code> | <code>aws-cdk-lib.Environment</code> | The AWS environment (account/region) where this stack will be deployed. |
| <code><a href="#aws-ddk-core.BaseStackProps.property.permissionsBoundary">permissionsBoundary</a></code> | <code>aws-cdk-lib.PermissionsBoundary</code> | Options for applying a permissions boundary to all IAM Roles and Users created within this Stage. |
| <code><a href="#aws-ddk-core.BaseStackProps.property.stackName">stackName</a></code> | <code>string</code> | Name to deploy the stack with. |
| <code><a href="#aws-ddk-core.BaseStackProps.property.synthesizer">synthesizer</a></code> | <code>aws-cdk-lib.IStackSynthesizer</code> | Synthesis method to use while deploying this stack. |
| <code><a href="#aws-ddk-core.BaseStackProps.property.tags">tags</a></code> | <code>{[ key: string ]: string}</code> | Stack tags that will be applied to all the taggable resources and the stack itself. |
| <code><a href="#aws-ddk-core.BaseStackProps.property.terminationProtection">terminationProtection</a></code> | <code>boolean</code> | Whether to enable termination protection for this stack. |
| <code><a href="#aws-ddk-core.BaseStackProps.property.config">config</a></code> | <code>string \| <a href="#aws-ddk-core.Configuration">Configuration</a></code> | Configuration or path to file which contains the configuration. |
| <code><a href="#aws-ddk-core.BaseStackProps.property.environmentId">environmentId</a></code> | <code>string</code> | Identifier of the environment. |
| <code><a href="#aws-ddk-core.BaseStackProps.property.permissionsBoundaryArn">permissionsBoundaryArn</a></code> | <code>string</code> | ARN of the permissions boundary managed policy. |

---

##### `analyticsReporting`<sup>Optional</sup> <a name="analyticsReporting" id="aws-ddk-core.BaseStackProps.property.analyticsReporting"></a>

```typescript
public readonly analyticsReporting: boolean;
```

- *Type:* boolean
- *Default:* `analyticsReporting` setting of containing `App`, or value of 'aws:cdk:version-reporting' context key

Include runtime versioning information in this Stack.

---

##### `crossRegionReferences`<sup>Optional</sup> <a name="crossRegionReferences" id="aws-ddk-core.BaseStackProps.property.crossRegionReferences"></a>

```typescript
public readonly crossRegionReferences: boolean;
```

- *Type:* boolean
- *Default:* false

Enable this flag to allow native cross region stack references.

Enabling this will create a CloudFormation custom resource
in both the producing stack and consuming stack in order to perform the export/import

This feature is currently experimental

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.BaseStackProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string
- *Default:* No description.

A description of the stack.

---

##### `env`<sup>Optional</sup> <a name="env" id="aws-ddk-core.BaseStackProps.property.env"></a>

```typescript
public readonly env: Environment;
```

- *Type:* aws-cdk-lib.Environment
- *Default:* The environment of the containing `Stage` if available, otherwise create the stack will be environment-agnostic.

The AWS environment (account/region) where this stack will be deployed.

Set the `region`/`account` fields of `env` to either a concrete value to
select the indicated environment (recommended for production stacks), or to
the values of environment variables
`CDK_DEFAULT_REGION`/`CDK_DEFAULT_ACCOUNT` to let the target environment
depend on the AWS credentials/configuration that the CDK CLI is executed
under (recommended for development stacks).

If the `Stack` is instantiated inside a `Stage`, any undefined
`region`/`account` fields from `env` will default to the same field on the
encompassing `Stage`, if configured there.

If either `region` or `account` are not set nor inherited from `Stage`, the
Stack will be considered "*environment-agnostic*"". Environment-agnostic
stacks can be deployed to any environment but may not be able to take
advantage of all features of the CDK. For example, they will not be able to
use environmental context lookups such as `ec2.Vpc.fromLookup` and will not
automatically translate Service Principals to the right format based on the
environment's AWS partition, and other such enhancements.

---

*Example*

```typescript
// Use a concrete account and region to deploy this stack to:
// `.account` and `.region` will simply return these values.
new Stack(app, 'Stack1', {
  env: {
    account: '123456789012',
    region: 'us-east-1'
  },
});

// Use the CLI's current credentials to determine the target environment:
// `.account` and `.region` will reflect the account+region the CLI
// is configured to use (based on the user CLI credentials)
new Stack(app, 'Stack2', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
});

// Define multiple stacks stage associated with an environment
const myStage = new Stage(app, 'MyStage', {
  env: {
    account: '123456789012',
    region: 'us-east-1'
  }
});

// both of these stacks will use the stage's account/region:
// `.account` and `.region` will resolve to the concrete values as above
new MyStack(myStage, 'Stack1');
new YourStack(myStage, 'Stack2');

// Define an environment-agnostic stack:
// `.account` and `.region` will resolve to `{ "Ref": "AWS::AccountId" }` and `{ "Ref": "AWS::Region" }` respectively.
// which will only resolve to actual values by CloudFormation during deployment.
new MyStack(app, 'Stack1');
```


##### `permissionsBoundary`<sup>Optional</sup> <a name="permissionsBoundary" id="aws-ddk-core.BaseStackProps.property.permissionsBoundary"></a>

```typescript
public readonly permissionsBoundary: PermissionsBoundary;
```

- *Type:* aws-cdk-lib.PermissionsBoundary
- *Default:* no permissions boundary is applied

Options for applying a permissions boundary to all IAM Roles and Users created within this Stage.

---

##### `stackName`<sup>Optional</sup> <a name="stackName" id="aws-ddk-core.BaseStackProps.property.stackName"></a>

```typescript
public readonly stackName: string;
```

- *Type:* string
- *Default:* Derived from construct path.

Name to deploy the stack with.

---

##### `synthesizer`<sup>Optional</sup> <a name="synthesizer" id="aws-ddk-core.BaseStackProps.property.synthesizer"></a>

```typescript
public readonly synthesizer: IStackSynthesizer;
```

- *Type:* aws-cdk-lib.IStackSynthesizer
- *Default:* The synthesizer specified on `App`, or `DefaultStackSynthesizer` otherwise.

Synthesis method to use while deploying this stack.

The Stack Synthesizer controls aspects of synthesis and deployment,
like how assets are referenced and what IAM roles to use. For more
information, see the README of the main CDK package.

If not specified, the `defaultStackSynthesizer` from `App` will be used.
If that is not specified, `DefaultStackSynthesizer` is used if
`@aws-cdk/core:newStyleStackSynthesis` is set to `true` or the CDK major
version is v2. In CDK v1 `LegacyStackSynthesizer` is the default if no
other synthesizer is specified.

---

##### `tags`<sup>Optional</sup> <a name="tags" id="aws-ddk-core.BaseStackProps.property.tags"></a>

```typescript
public readonly tags: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* {}

Stack tags that will be applied to all the taggable resources and the stack itself.

---

##### `terminationProtection`<sup>Optional</sup> <a name="terminationProtection" id="aws-ddk-core.BaseStackProps.property.terminationProtection"></a>

```typescript
public readonly terminationProtection: boolean;
```

- *Type:* boolean
- *Default:* false

Whether to enable termination protection for this stack.

---

##### `config`<sup>Optional</sup> <a name="config" id="aws-ddk-core.BaseStackProps.property.config"></a>

```typescript
public readonly config: string | Configuration;
```

- *Type:* string | <a href="#aws-ddk-core.Configuration">Configuration</a>

Configuration or path to file which contains the configuration.

---

##### `environmentId`<sup>Optional</sup> <a name="environmentId" id="aws-ddk-core.BaseStackProps.property.environmentId"></a>

```typescript
public readonly environmentId: string;
```

- *Type:* string
- *Default:* "dev"

Identifier of the environment.

---

##### `permissionsBoundaryArn`<sup>Optional</sup> <a name="permissionsBoundaryArn" id="aws-ddk-core.BaseStackProps.property.permissionsBoundaryArn"></a>

```typescript
public readonly permissionsBoundaryArn: string;
```

- *Type:* string

ARN of the permissions boundary managed policy.

---

### CICDPipelineStackProps <a name="CICDPipelineStackProps" id="aws-ddk-core.CICDPipelineStackProps"></a>

CICD Pipeline Stack properties.

#### Initializer <a name="Initializer" id="aws-ddk-core.CICDPipelineStackProps.Initializer"></a>

```typescript
import { CICDPipelineStackProps } from 'aws-ddk-core'

const cICDPipelineStackProps: CICDPipelineStackProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.analyticsReporting">analyticsReporting</a></code> | <code>boolean</code> | Include runtime versioning information in this Stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.crossRegionReferences">crossRegionReferences</a></code> | <code>boolean</code> | Enable this flag to allow native cross region stack references. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.description">description</a></code> | <code>string</code> | A description of the stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.env">env</a></code> | <code>aws-cdk-lib.Environment</code> | The AWS environment (account/region) where this stack will be deployed. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.permissionsBoundary">permissionsBoundary</a></code> | <code>aws-cdk-lib.PermissionsBoundary</code> | Options for applying a permissions boundary to all IAM Roles and Users created within this Stage. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.stackName">stackName</a></code> | <code>string</code> | Name to deploy the stack with. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.synthesizer">synthesizer</a></code> | <code>aws-cdk-lib.IStackSynthesizer</code> | Synthesis method to use while deploying this stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.tags">tags</a></code> | <code>{[ key: string ]: string}</code> | Stack tags that will be applied to all the taggable resources and the stack itself. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.terminationProtection">terminationProtection</a></code> | <code>boolean</code> | Whether to enable termination protection for this stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.config">config</a></code> | <code>string \| <a href="#aws-ddk-core.Configuration">Configuration</a></code> | Configuration or path to file which contains the configuration. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.environmentId">environmentId</a></code> | <code>string</code> | Identifier of the environment. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.permissionsBoundaryArn">permissionsBoundaryArn</a></code> | <code>string</code> | ARN of the permissions boundary managed policy. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.cdkLanguage">cdkLanguage</a></code> | <code>string</code> | Language of the CDK construct definitions. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.pipelineName">pipelineName</a></code> | <code>string</code> | Name of the pipeline. |

---

##### `analyticsReporting`<sup>Optional</sup> <a name="analyticsReporting" id="aws-ddk-core.CICDPipelineStackProps.property.analyticsReporting"></a>

```typescript
public readonly analyticsReporting: boolean;
```

- *Type:* boolean
- *Default:* `analyticsReporting` setting of containing `App`, or value of 'aws:cdk:version-reporting' context key

Include runtime versioning information in this Stack.

---

##### `crossRegionReferences`<sup>Optional</sup> <a name="crossRegionReferences" id="aws-ddk-core.CICDPipelineStackProps.property.crossRegionReferences"></a>

```typescript
public readonly crossRegionReferences: boolean;
```

- *Type:* boolean
- *Default:* false

Enable this flag to allow native cross region stack references.

Enabling this will create a CloudFormation custom resource
in both the producing stack and consuming stack in order to perform the export/import

This feature is currently experimental

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.CICDPipelineStackProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string
- *Default:* No description.

A description of the stack.

---

##### `env`<sup>Optional</sup> <a name="env" id="aws-ddk-core.CICDPipelineStackProps.property.env"></a>

```typescript
public readonly env: Environment;
```

- *Type:* aws-cdk-lib.Environment
- *Default:* The environment of the containing `Stage` if available, otherwise create the stack will be environment-agnostic.

The AWS environment (account/region) where this stack will be deployed.

Set the `region`/`account` fields of `env` to either a concrete value to
select the indicated environment (recommended for production stacks), or to
the values of environment variables
`CDK_DEFAULT_REGION`/`CDK_DEFAULT_ACCOUNT` to let the target environment
depend on the AWS credentials/configuration that the CDK CLI is executed
under (recommended for development stacks).

If the `Stack` is instantiated inside a `Stage`, any undefined
`region`/`account` fields from `env` will default to the same field on the
encompassing `Stage`, if configured there.

If either `region` or `account` are not set nor inherited from `Stage`, the
Stack will be considered "*environment-agnostic*"". Environment-agnostic
stacks can be deployed to any environment but may not be able to take
advantage of all features of the CDK. For example, they will not be able to
use environmental context lookups such as `ec2.Vpc.fromLookup` and will not
automatically translate Service Principals to the right format based on the
environment's AWS partition, and other such enhancements.

---

*Example*

```typescript
// Use a concrete account and region to deploy this stack to:
// `.account` and `.region` will simply return these values.
new Stack(app, 'Stack1', {
  env: {
    account: '123456789012',
    region: 'us-east-1'
  },
});

// Use the CLI's current credentials to determine the target environment:
// `.account` and `.region` will reflect the account+region the CLI
// is configured to use (based on the user CLI credentials)
new Stack(app, 'Stack2', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
});

// Define multiple stacks stage associated with an environment
const myStage = new Stage(app, 'MyStage', {
  env: {
    account: '123456789012',
    region: 'us-east-1'
  }
});

// both of these stacks will use the stage's account/region:
// `.account` and `.region` will resolve to the concrete values as above
new MyStack(myStage, 'Stack1');
new YourStack(myStage, 'Stack2');

// Define an environment-agnostic stack:
// `.account` and `.region` will resolve to `{ "Ref": "AWS::AccountId" }` and `{ "Ref": "AWS::Region" }` respectively.
// which will only resolve to actual values by CloudFormation during deployment.
new MyStack(app, 'Stack1');
```


##### `permissionsBoundary`<sup>Optional</sup> <a name="permissionsBoundary" id="aws-ddk-core.CICDPipelineStackProps.property.permissionsBoundary"></a>

```typescript
public readonly permissionsBoundary: PermissionsBoundary;
```

- *Type:* aws-cdk-lib.PermissionsBoundary
- *Default:* no permissions boundary is applied

Options for applying a permissions boundary to all IAM Roles and Users created within this Stage.

---

##### `stackName`<sup>Optional</sup> <a name="stackName" id="aws-ddk-core.CICDPipelineStackProps.property.stackName"></a>

```typescript
public readonly stackName: string;
```

- *Type:* string
- *Default:* Derived from construct path.

Name to deploy the stack with.

---

##### `synthesizer`<sup>Optional</sup> <a name="synthesizer" id="aws-ddk-core.CICDPipelineStackProps.property.synthesizer"></a>

```typescript
public readonly synthesizer: IStackSynthesizer;
```

- *Type:* aws-cdk-lib.IStackSynthesizer
- *Default:* The synthesizer specified on `App`, or `DefaultStackSynthesizer` otherwise.

Synthesis method to use while deploying this stack.

The Stack Synthesizer controls aspects of synthesis and deployment,
like how assets are referenced and what IAM roles to use. For more
information, see the README of the main CDK package.

If not specified, the `defaultStackSynthesizer` from `App` will be used.
If that is not specified, `DefaultStackSynthesizer` is used if
`@aws-cdk/core:newStyleStackSynthesis` is set to `true` or the CDK major
version is v2. In CDK v1 `LegacyStackSynthesizer` is the default if no
other synthesizer is specified.

---

##### `tags`<sup>Optional</sup> <a name="tags" id="aws-ddk-core.CICDPipelineStackProps.property.tags"></a>

```typescript
public readonly tags: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* {}

Stack tags that will be applied to all the taggable resources and the stack itself.

---

##### `terminationProtection`<sup>Optional</sup> <a name="terminationProtection" id="aws-ddk-core.CICDPipelineStackProps.property.terminationProtection"></a>

```typescript
public readonly terminationProtection: boolean;
```

- *Type:* boolean
- *Default:* false

Whether to enable termination protection for this stack.

---

##### `config`<sup>Optional</sup> <a name="config" id="aws-ddk-core.CICDPipelineStackProps.property.config"></a>

```typescript
public readonly config: string | Configuration;
```

- *Type:* string | <a href="#aws-ddk-core.Configuration">Configuration</a>

Configuration or path to file which contains the configuration.

---

##### `environmentId`<sup>Optional</sup> <a name="environmentId" id="aws-ddk-core.CICDPipelineStackProps.property.environmentId"></a>

```typescript
public readonly environmentId: string;
```

- *Type:* string
- *Default:* "dev"

Identifier of the environment.

---

##### `permissionsBoundaryArn`<sup>Optional</sup> <a name="permissionsBoundaryArn" id="aws-ddk-core.CICDPipelineStackProps.property.permissionsBoundaryArn"></a>

```typescript
public readonly permissionsBoundaryArn: string;
```

- *Type:* string

ARN of the permissions boundary managed policy.

---

##### `cdkLanguage`<sup>Optional</sup> <a name="cdkLanguage" id="aws-ddk-core.CICDPipelineStackProps.property.cdkLanguage"></a>

```typescript
public readonly cdkLanguage: string;
```

- *Type:* string
- *Default:* "typescript"

Language of the CDK construct definitions.

---

##### `pipelineName`<sup>Optional</sup> <a name="pipelineName" id="aws-ddk-core.CICDPipelineStackProps.property.pipelineName"></a>

```typescript
public readonly pipelineName: string;
```

- *Type:* string

Name of the pipeline.

---

### CodeArtifactPublishActionProps <a name="CodeArtifactPublishActionProps" id="aws-ddk-core.CodeArtifactPublishActionProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.CodeArtifactPublishActionProps.Initializer"></a>

```typescript
import { CodeArtifactPublishActionProps } from 'aws-ddk-core'

const codeArtifactPublishActionProps: CodeArtifactPublishActionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.CodeArtifactPublishActionProps.property.account">account</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.CodeArtifactPublishActionProps.property.codeartifactDomain">codeartifactDomain</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.CodeArtifactPublishActionProps.property.codeartifactDomainOwner">codeartifactDomainOwner</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.CodeArtifactPublishActionProps.property.codeartifactRepository">codeartifactRepository</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.CodeArtifactPublishActionProps.property.partition">partition</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.CodeArtifactPublishActionProps.property.region">region</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.CodeArtifactPublishActionProps.property.codePipelineSource">codePipelineSource</a></code> | <code>aws-cdk-lib.pipelines.CodePipelineSource</code> | *No description.* |
| <code><a href="#aws-ddk-core.CodeArtifactPublishActionProps.property.rolePolicyStatements">rolePolicyStatements</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | *No description.* |

---

##### `account`<sup>Required</sup> <a name="account" id="aws-ddk-core.CodeArtifactPublishActionProps.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string

---

##### `codeartifactDomain`<sup>Required</sup> <a name="codeartifactDomain" id="aws-ddk-core.CodeArtifactPublishActionProps.property.codeartifactDomain"></a>

```typescript
public readonly codeartifactDomain: string;
```

- *Type:* string

---

##### `codeartifactDomainOwner`<sup>Required</sup> <a name="codeartifactDomainOwner" id="aws-ddk-core.CodeArtifactPublishActionProps.property.codeartifactDomainOwner"></a>

```typescript
public readonly codeartifactDomainOwner: string;
```

- *Type:* string

---

##### `codeartifactRepository`<sup>Required</sup> <a name="codeartifactRepository" id="aws-ddk-core.CodeArtifactPublishActionProps.property.codeartifactRepository"></a>

```typescript
public readonly codeartifactRepository: string;
```

- *Type:* string

---

##### `partition`<sup>Required</sup> <a name="partition" id="aws-ddk-core.CodeArtifactPublishActionProps.property.partition"></a>

```typescript
public readonly partition: string;
```

- *Type:* string

---

##### `region`<sup>Required</sup> <a name="region" id="aws-ddk-core.CodeArtifactPublishActionProps.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

---

##### `codePipelineSource`<sup>Optional</sup> <a name="codePipelineSource" id="aws-ddk-core.CodeArtifactPublishActionProps.property.codePipelineSource"></a>

```typescript
public readonly codePipelineSource: CodePipelineSource;
```

- *Type:* aws-cdk-lib.pipelines.CodePipelineSource

---

##### `rolePolicyStatements`<sup>Optional</sup> <a name="rolePolicyStatements" id="aws-ddk-core.CodeArtifactPublishActionProps.property.rolePolicyStatements"></a>

```typescript
public readonly rolePolicyStatements: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]

---

### CodeCommitSourceActionProps <a name="CodeCommitSourceActionProps" id="aws-ddk-core.CodeCommitSourceActionProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.CodeCommitSourceActionProps.Initializer"></a>

```typescript
import { CodeCommitSourceActionProps } from 'aws-ddk-core'

const codeCommitSourceActionProps: CodeCommitSourceActionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.CodeCommitSourceActionProps.property.branch">branch</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.CodeCommitSourceActionProps.property.repositoryName">repositoryName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.CodeCommitSourceActionProps.property.props">props</a></code> | <code>aws-cdk-lib.pipelines.ConnectionSourceOptions</code> | *No description.* |

---

##### `branch`<sup>Required</sup> <a name="branch" id="aws-ddk-core.CodeCommitSourceActionProps.property.branch"></a>

```typescript
public readonly branch: string;
```

- *Type:* string

---

##### `repositoryName`<sup>Required</sup> <a name="repositoryName" id="aws-ddk-core.CodeCommitSourceActionProps.property.repositoryName"></a>

```typescript
public readonly repositoryName: string;
```

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="aws-ddk-core.CodeCommitSourceActionProps.property.props"></a>

```typescript
public readonly props: ConnectionSourceOptions;
```

- *Type:* aws-cdk-lib.pipelines.ConnectionSourceOptions

---

### Configuration <a name="Configuration" id="aws-ddk-core.Configuration"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.Configuration.Initializer"></a>

```typescript
import { Configuration } from 'aws-ddk-core'

const configuration: Configuration = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.Configuration.property.environments">environments</a></code> | <code>{[ key: string ]: <a href="#aws-ddk-core.EnvironmentConfiguration">EnvironmentConfiguration</a>}</code> | *No description.* |
| <code><a href="#aws-ddk-core.Configuration.property.account">account</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.Configuration.property.bootstrap">bootstrap</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |
| <code><a href="#aws-ddk-core.Configuration.property.ddkBootstrapConfigKey">ddkBootstrapConfigKey</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.Configuration.property.region">region</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.Configuration.property.tags">tags</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |

---

##### `environments`<sup>Required</sup> <a name="environments" id="aws-ddk-core.Configuration.property.environments"></a>

```typescript
public readonly environments: {[ key: string ]: EnvironmentConfiguration};
```

- *Type:* {[ key: string ]: <a href="#aws-ddk-core.EnvironmentConfiguration">EnvironmentConfiguration</a>}

---

##### `account`<sup>Optional</sup> <a name="account" id="aws-ddk-core.Configuration.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string

---

##### `bootstrap`<sup>Optional</sup> <a name="bootstrap" id="aws-ddk-core.Configuration.property.bootstrap"></a>

```typescript
public readonly bootstrap: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

---

##### `ddkBootstrapConfigKey`<sup>Optional</sup> <a name="ddkBootstrapConfigKey" id="aws-ddk-core.Configuration.property.ddkBootstrapConfigKey"></a>

```typescript
public readonly ddkBootstrapConfigKey: string;
```

- *Type:* string

---

##### `region`<sup>Optional</sup> <a name="region" id="aws-ddk-core.Configuration.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

---

##### `tags`<sup>Optional</sup> <a name="tags" id="aws-ddk-core.Configuration.property.tags"></a>

```typescript
public readonly tags: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

---

### CreateStateMachineResult <a name="CreateStateMachineResult" id="aws-ddk-core.CreateStateMachineResult"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.CreateStateMachineResult.Initializer"></a>

```typescript
import { CreateStateMachineResult } from 'aws-ddk-core'

const createStateMachineResult: CreateStateMachineResult = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.CreateStateMachineResult.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | *No description.* |
| <code><a href="#aws-ddk-core.CreateStateMachineResult.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.StateMachine</code> | *No description.* |
| <code><a href="#aws-ddk-core.CreateStateMachineResult.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | *No description.* |

---

##### `eventPattern`<sup>Required</sup> <a name="eventPattern" id="aws-ddk-core.CreateStateMachineResult.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="aws-ddk-core.CreateStateMachineResult.property.stateMachine"></a>

```typescript
public readonly stateMachine: StateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.StateMachine

---

##### `targets`<sup>Required</sup> <a name="targets" id="aws-ddk-core.CreateStateMachineResult.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

---

### DataBrewTransformStageProps <a name="DataBrewTransformStageProps" id="aws-ddk-core.DataBrewTransformStageProps"></a>

Properties for `DataBrewTransformStage`.

#### Initializer <a name="Initializer" id="aws-ddk-core.DataBrewTransformStageProps.Initializer"></a>

```typescript
import { DataBrewTransformStageProps } from 'aws-ddk-core'

const dataBrewTransformStageProps: DataBrewTransformStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.additionalRolePolicyStatements">additionalRolePolicyStatements</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | Additional IAM policy statements to add to the state machine role. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Enable/Disable all alarms in the stage. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.stateMachineFailedExecutionsAlarmEvaluationPeriods">stateMachineFailedExecutionsAlarmEvaluationPeriods</a></code> | <code>number</code> | The number of periods over which data is compared to the specified threshold. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.stateMachineFailedExecutionsAlarmThreshold">stateMachineFailedExecutionsAlarmThreshold</a></code> | <code>number</code> | The number of failed state machine executions before triggering CW alarm. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.stateMachineInput">stateMachineInput</a></code> | <code>{[ key: string ]: any}</code> | Input of the state machine. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.stateMachineName">stateMachineName</a></code> | <code>string</code> | Name of the state machine. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.createJob">createJob</a></code> | <code>boolean</code> | Whether to create the DataBrew job or not. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.databaseOutputs">databaseOutputs</a></code> | <code>aws-cdk-lib.aws_databrew.CfnJob.DatabaseOutputProperty[]</code> | Represents a list of JDBC database output objects which defines the output destination for a DataBrew recipe job to write into. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.dataCatalogOutputs">dataCatalogOutputs</a></code> | <code>aws-cdk-lib.aws_databrew.CfnJob.DataCatalogOutputProperty[]</code> | One or more artifacts that represent the AWS Glue Data Catalog output from running the job. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.datasetName">datasetName</a></code> | <code>string</code> | The name of the dataset to use for the job. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.encryptionKeyArn">encryptionKeyArn</a></code> | <code>string</code> | The Amazon Resource Name (ARN) of an encryption key that is used to protect the job output. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.encryptionMode">encryptionMode</a></code> | <code>string</code> | The encryption mode for the job, which can be one of the following:. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.jobName">jobName</a></code> | <code>string</code> | The name of a preexisting DataBrew job to run. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.jobRoleArn">jobRoleArn</a></code> | <code>string</code> | The Arn of the job execution role. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.jobSample">jobSample</a></code> | <code>aws-cdk-lib.aws_databrew.CfnJob.JobSampleProperty</code> | A sample configuration for profile jobs only, which determines the number of rows on which the profile job is run. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.jobType">jobType</a></code> | <code>string</code> | The type of job to run. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.logSubscription">logSubscription</a></code> | <code>string</code> | The current status of Amazon CloudWatch logging for the job. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.maxCapacity">maxCapacity</a></code> | <code>number</code> | The maximum number of nodes that can be consumed when the job processes data. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.maxRetries">maxRetries</a></code> | <code>number</code> | The maximum number of times to retry the job after a job run fails. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.outputLocation">outputLocation</a></code> | <code>aws-cdk-lib.aws_databrew.CfnJob.OutputLocationProperty</code> | `AWS::DataBrew::Job.OutputLocation`. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.outputs">outputs</a></code> | <code>aws-cdk-lib.aws_databrew.CfnJob.OutputProperty[]</code> | The output properties for the job. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.profileConfiguration">profileConfiguration</a></code> | <code>aws-cdk-lib.aws_databrew.CfnJob.ProfileConfigurationProperty</code> | Configuration for profile jobs. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.projectName">projectName</a></code> | <code>string</code> | The name of the project that the job is associated with. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.recipe">recipe</a></code> | <code>aws-cdk-lib.aws_databrew.CfnJob.RecipeProperty</code> | The recipe to be used by the DataBrew job which is a series of data transformation steps. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.tags">tags</a></code> | <code>aws-cdk-lib.CfnTag[]</code> | Metadata tags that have been applied to the job. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.timeout">timeout</a></code> | <code>number</code> | The job's timeout in minutes. |
| <code><a href="#aws-ddk-core.DataBrewTransformStageProps.property.validationConfigurations">validationConfigurations</a></code> | <code>aws-cdk-lib.aws_databrew.CfnJob.ValidationConfigurationProperty[]</code> | List of validation configurations that are applied to the profile job. |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.DataBrewTransformStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.DataBrewTransformStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `additionalRolePolicyStatements`<sup>Optional</sup> <a name="additionalRolePolicyStatements" id="aws-ddk-core.DataBrewTransformStageProps.property.additionalRolePolicyStatements"></a>

```typescript
public readonly additionalRolePolicyStatements: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]

Additional IAM policy statements to add to the state machine role.

---

##### `alarmsEnabled`<sup>Optional</sup> <a name="alarmsEnabled" id="aws-ddk-core.DataBrewTransformStageProps.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean
- *Default:* true

Enable/Disable all alarms in the stage.

---

##### `stateMachineFailedExecutionsAlarmEvaluationPeriods`<sup>Optional</sup> <a name="stateMachineFailedExecutionsAlarmEvaluationPeriods" id="aws-ddk-core.DataBrewTransformStageProps.property.stateMachineFailedExecutionsAlarmEvaluationPeriods"></a>

```typescript
public readonly stateMachineFailedExecutionsAlarmEvaluationPeriods: number;
```

- *Type:* number
- *Default:* 1

The number of periods over which data is compared to the specified threshold.

---

##### `stateMachineFailedExecutionsAlarmThreshold`<sup>Optional</sup> <a name="stateMachineFailedExecutionsAlarmThreshold" id="aws-ddk-core.DataBrewTransformStageProps.property.stateMachineFailedExecutionsAlarmThreshold"></a>

```typescript
public readonly stateMachineFailedExecutionsAlarmThreshold: number;
```

- *Type:* number
- *Default:* 1

The number of failed state machine executions before triggering CW alarm.

---

##### `stateMachineInput`<sup>Optional</sup> <a name="stateMachineInput" id="aws-ddk-core.DataBrewTransformStageProps.property.stateMachineInput"></a>

```typescript
public readonly stateMachineInput: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

Input of the state machine.

---

##### `stateMachineName`<sup>Optional</sup> <a name="stateMachineName" id="aws-ddk-core.DataBrewTransformStageProps.property.stateMachineName"></a>

```typescript
public readonly stateMachineName: string;
```

- *Type:* string

Name of the state machine.

---

##### `createJob`<sup>Optional</sup> <a name="createJob" id="aws-ddk-core.DataBrewTransformStageProps.property.createJob"></a>

```typescript
public readonly createJob: boolean;
```

- *Type:* boolean

Whether to create the DataBrew job or not.

---

##### `databaseOutputs`<sup>Optional</sup> <a name="databaseOutputs" id="aws-ddk-core.DataBrewTransformStageProps.property.databaseOutputs"></a>

```typescript
public readonly databaseOutputs: DatabaseOutputProperty[];
```

- *Type:* aws-cdk-lib.aws_databrew.CfnJob.DatabaseOutputProperty[]

Represents a list of JDBC database output objects which defines the output destination for a DataBrew recipe job to write into.

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-databaseoutputs](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-databaseoutputs)

---

##### `dataCatalogOutputs`<sup>Optional</sup> <a name="dataCatalogOutputs" id="aws-ddk-core.DataBrewTransformStageProps.property.dataCatalogOutputs"></a>

```typescript
public readonly dataCatalogOutputs: DataCatalogOutputProperty[];
```

- *Type:* aws-cdk-lib.aws_databrew.CfnJob.DataCatalogOutputProperty[]

One or more artifacts that represent the AWS Glue Data Catalog output from running the job.

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-datacatalogoutputs](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-datacatalogoutputs)

---

##### `datasetName`<sup>Optional</sup> <a name="datasetName" id="aws-ddk-core.DataBrewTransformStageProps.property.datasetName"></a>

```typescript
public readonly datasetName: string;
```

- *Type:* string

The name of the dataset to use for the job.

---

##### `encryptionKeyArn`<sup>Optional</sup> <a name="encryptionKeyArn" id="aws-ddk-core.DataBrewTransformStageProps.property.encryptionKeyArn"></a>

```typescript
public readonly encryptionKeyArn: string;
```

- *Type:* string

The Amazon Resource Name (ARN) of an encryption key that is used to protect the job output.

For more information, see [Encrypting data written by DataBrew jobs](https://docs.aws.amazon.com/databrew/latest/dg/encryption-security-configuration.html)

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-encryptionkeyarn](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-encryptionkeyarn)

---

##### `encryptionMode`<sup>Optional</sup> <a name="encryptionMode" id="aws-ddk-core.DataBrewTransformStageProps.property.encryptionMode"></a>

```typescript
public readonly encryptionMode: string;
```

- *Type:* string

The encryption mode for the job, which can be one of the following:.

`SSE-KMS` - Server-side encryption with keys managed by AWS KMS .
- `SSE-S3` - Server-side encryption with keys managed by Amazon S3.

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-encryptionmode](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-encryptionmode)

---

##### `jobName`<sup>Optional</sup> <a name="jobName" id="aws-ddk-core.DataBrewTransformStageProps.property.jobName"></a>

```typescript
public readonly jobName: string;
```

- *Type:* string

The name of a preexisting DataBrew job to run.

If None, a DataBrew job is created.

---

##### `jobRoleArn`<sup>Optional</sup> <a name="jobRoleArn" id="aws-ddk-core.DataBrewTransformStageProps.property.jobRoleArn"></a>

```typescript
public readonly jobRoleArn: string;
```

- *Type:* string

The Arn of the job execution role.

Required if job_name is None.

---

##### `jobSample`<sup>Optional</sup> <a name="jobSample" id="aws-ddk-core.DataBrewTransformStageProps.property.jobSample"></a>

```typescript
public readonly jobSample: JobSampleProperty;
```

- *Type:* aws-cdk-lib.aws_databrew.CfnJob.JobSampleProperty

A sample configuration for profile jobs only, which determines the number of rows on which the profile job is run.

If a `JobSample` value isn't provided, the default value is used. The default value is CUSTOM_ROWS for the mode parameter and 20,000 for the size parameter.

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-jobsample](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-jobsample)

---

##### `jobType`<sup>Optional</sup> <a name="jobType" id="aws-ddk-core.DataBrewTransformStageProps.property.jobType"></a>

```typescript
public readonly jobType: string;
```

- *Type:* string

The type of job to run.

Required if job_name is None.

---

##### `logSubscription`<sup>Optional</sup> <a name="logSubscription" id="aws-ddk-core.DataBrewTransformStageProps.property.logSubscription"></a>

```typescript
public readonly logSubscription: string;
```

- *Type:* string

The current status of Amazon CloudWatch logging for the job.

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-logsubscription](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-logsubscription)

---

##### `maxCapacity`<sup>Optional</sup> <a name="maxCapacity" id="aws-ddk-core.DataBrewTransformStageProps.property.maxCapacity"></a>

```typescript
public readonly maxCapacity: number;
```

- *Type:* number

The maximum number of nodes that can be consumed when the job processes data.

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-maxcapacity](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-maxcapacity)

---

##### `maxRetries`<sup>Optional</sup> <a name="maxRetries" id="aws-ddk-core.DataBrewTransformStageProps.property.maxRetries"></a>

```typescript
public readonly maxRetries: number;
```

- *Type:* number

The maximum number of times to retry the job after a job run fails.

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-maxretries](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-maxretries)

---

##### `outputLocation`<sup>Optional</sup> <a name="outputLocation" id="aws-ddk-core.DataBrewTransformStageProps.property.outputLocation"></a>

```typescript
public readonly outputLocation: OutputLocationProperty;
```

- *Type:* aws-cdk-lib.aws_databrew.CfnJob.OutputLocationProperty

`AWS::DataBrew::Job.OutputLocation`.

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-outputlocation](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-outputlocation)

---

##### `outputs`<sup>Optional</sup> <a name="outputs" id="aws-ddk-core.DataBrewTransformStageProps.property.outputs"></a>

```typescript
public readonly outputs: OutputProperty[];
```

- *Type:* aws-cdk-lib.aws_databrew.CfnJob.OutputProperty[]

The output properties for the job.

---

##### `profileConfiguration`<sup>Optional</sup> <a name="profileConfiguration" id="aws-ddk-core.DataBrewTransformStageProps.property.profileConfiguration"></a>

```typescript
public readonly profileConfiguration: ProfileConfigurationProperty;
```

- *Type:* aws-cdk-lib.aws_databrew.CfnJob.ProfileConfigurationProperty

Configuration for profile jobs.

Configuration can be used to select columns, do evaluations, and override default parameters of evaluations. When configuration is undefined, the profile job will apply default settings to all supported columns.

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-profileconfiguration](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-profileconfiguration)

---

##### `projectName`<sup>Optional</sup> <a name="projectName" id="aws-ddk-core.DataBrewTransformStageProps.property.projectName"></a>

```typescript
public readonly projectName: string;
```

- *Type:* string

The name of the project that the job is associated with.

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-projectname](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-projectname)

---

##### `recipe`<sup>Optional</sup> <a name="recipe" id="aws-ddk-core.DataBrewTransformStageProps.property.recipe"></a>

```typescript
public readonly recipe: RecipeProperty;
```

- *Type:* aws-cdk-lib.aws_databrew.CfnJob.RecipeProperty

The recipe to be used by the DataBrew job which is a series of data transformation steps.

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-recipe](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-recipe)

---

##### `tags`<sup>Optional</sup> <a name="tags" id="aws-ddk-core.DataBrewTransformStageProps.property.tags"></a>

```typescript
public readonly tags: CfnTag[];
```

- *Type:* aws-cdk-lib.CfnTag[]

Metadata tags that have been applied to the job.

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-tags](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-tags)

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="aws-ddk-core.DataBrewTransformStageProps.property.timeout"></a>

```typescript
public readonly timeout: number;
```

- *Type:* number

The job's timeout in minutes.

A job that attempts to run longer than this timeout period ends with a status of `TIMEOUT` .

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-timeout](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-timeout)

---

##### `validationConfigurations`<sup>Optional</sup> <a name="validationConfigurations" id="aws-ddk-core.DataBrewTransformStageProps.property.validationConfigurations"></a>

```typescript
public readonly validationConfigurations: ValidationConfigurationProperty[];
```

- *Type:* aws-cdk-lib.aws_databrew.CfnJob.ValidationConfigurationProperty[]

List of validation configurations that are applied to the profile job.

> [http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-validationconfigurations](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-databrew-job.html#cfn-databrew-job-validationconfigurations)

---

### DataPipelineProps <a name="DataPipelineProps" id="aws-ddk-core.DataPipelineProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.DataPipelineProps.Initializer"></a>

```typescript
import { DataPipelineProps } from 'aws-ddk-core'

const dataPipelineProps: DataPipelineProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.DataPipelineProps.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.DataPipelineProps.property.name">name</a></code> | <code>string</code> | *No description.* |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.DataPipelineProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.DataPipelineProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

### DataStageProps <a name="DataStageProps" id="aws-ddk-core.DataStageProps"></a>

Properties for the `DataStage`.

#### Initializer <a name="Initializer" id="aws-ddk-core.DataStageProps.Initializer"></a>

```typescript
import { DataStageProps } from 'aws-ddk-core'

const dataStageProps: DataStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.DataStageProps.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.DataStageProps.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.DataStageProps.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Enable/Disable all alarms in a DataStage. |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.DataStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.DataStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `alarmsEnabled`<sup>Optional</sup> <a name="alarmsEnabled" id="aws-ddk-core.DataStageProps.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean
- *Default:* true

Enable/Disable all alarms in a DataStage.

---

### DeliveryStreamProps <a name="DeliveryStreamProps" id="aws-ddk-core.DeliveryStreamProps"></a>

Properties of the Firehose Delivery stream to be created.

#### Initializer <a name="Initializer" id="aws-ddk-core.DeliveryStreamProps.Initializer"></a>

```typescript
import { DeliveryStreamProps } from 'aws-ddk-core'

const deliveryStreamProps: DeliveryStreamProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.DeliveryStreamProps.property.deliveryStreamName">deliveryStreamName</a></code> | <code>string</code> | A name for the delivery stream. |
| <code><a href="#aws-ddk-core.DeliveryStreamProps.property.destinations">destinations</a></code> | <code>@aws-cdk/aws-kinesisfirehose-alpha.IDestination[]</code> | The destinations that this delivery stream will deliver data to. |
| <code><a href="#aws-ddk-core.DeliveryStreamProps.property.encryption">encryption</a></code> | <code>@aws-cdk/aws-kinesisfirehose-alpha.StreamEncryption</code> | Indicates the type of customer master key (CMK) to use for server-side encryption, if any. |
| <code><a href="#aws-ddk-core.DeliveryStreamProps.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | Customer managed key to server-side encrypt data in the stream. |
| <code><a href="#aws-ddk-core.DeliveryStreamProps.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | The IAM role associated with this delivery stream. |
| <code><a href="#aws-ddk-core.DeliveryStreamProps.property.sourceStream">sourceStream</a></code> | <code>aws-cdk-lib.aws_kinesis.IStream</code> | The Kinesis data stream to use as a source for this delivery stream. |

---

##### `deliveryStreamName`<sup>Optional</sup> <a name="deliveryStreamName" id="aws-ddk-core.DeliveryStreamProps.property.deliveryStreamName"></a>

```typescript
public readonly deliveryStreamName: string;
```

- *Type:* string
- *Default:* a name is generated by CloudFormation.

A name for the delivery stream.

---

##### `destinations`<sup>Optional</sup> <a name="destinations" id="aws-ddk-core.DeliveryStreamProps.property.destinations"></a>

```typescript
public readonly destinations: IDestination[];
```

- *Type:* @aws-cdk/aws-kinesisfirehose-alpha.IDestination[]

The destinations that this delivery stream will deliver data to.

Only a singleton array is supported at this time.

---

##### `encryption`<sup>Optional</sup> <a name="encryption" id="aws-ddk-core.DeliveryStreamProps.property.encryption"></a>

```typescript
public readonly encryption: StreamEncryption;
```

- *Type:* @aws-cdk/aws-kinesisfirehose-alpha.StreamEncryption
- *Default:* StreamEncryption.UNENCRYPTED - unless `encryptionKey` is provided, in which case this will be implicitly set to `StreamEncryption.CUSTOMER_MANAGED`

Indicates the type of customer master key (CMK) to use for server-side encryption, if any.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="aws-ddk-core.DeliveryStreamProps.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey
- *Default:* no KMS key will be used; if `encryption` is set to `CUSTOMER_MANAGED`, a KMS key will be created for you

Customer managed key to server-side encrypt data in the stream.

---

##### `role`<sup>Optional</sup> <a name="role" id="aws-ddk-core.DeliveryStreamProps.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* a role will be created with default permissions.

The IAM role associated with this delivery stream.

Assumed by Kinesis Data Firehose to read from sources and encrypt data server-side.

---

##### `sourceStream`<sup>Optional</sup> <a name="sourceStream" id="aws-ddk-core.DeliveryStreamProps.property.sourceStream"></a>

```typescript
public readonly sourceStream: IStream;
```

- *Type:* aws-cdk-lib.aws_kinesis.IStream
- *Default:* data must be written to the delivery stream via a direct put.

The Kinesis data stream to use as a source for this delivery stream.

---

### EnvironmentConfiguration <a name="EnvironmentConfiguration" id="aws-ddk-core.EnvironmentConfiguration"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.EnvironmentConfiguration.Initializer"></a>

```typescript
import { EnvironmentConfiguration } from 'aws-ddk-core'

const environmentConfiguration: EnvironmentConfiguration = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.EnvironmentConfiguration.property.account">account</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.EnvironmentConfiguration.property.bootstrap">bootstrap</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |
| <code><a href="#aws-ddk-core.EnvironmentConfiguration.property.region">region</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.EnvironmentConfiguration.property.resources">resources</a></code> | <code>{[ key: string ]: any}</code> | *No description.* |
| <code><a href="#aws-ddk-core.EnvironmentConfiguration.property.tags">tags</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |

---

##### `account`<sup>Optional</sup> <a name="account" id="aws-ddk-core.EnvironmentConfiguration.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string

---

##### `bootstrap`<sup>Optional</sup> <a name="bootstrap" id="aws-ddk-core.EnvironmentConfiguration.property.bootstrap"></a>

```typescript
public readonly bootstrap: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

---

##### `region`<sup>Optional</sup> <a name="region" id="aws-ddk-core.EnvironmentConfiguration.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

---

##### `resources`<sup>Optional</sup> <a name="resources" id="aws-ddk-core.EnvironmentConfiguration.property.resources"></a>

```typescript
public readonly resources: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

---

##### `tags`<sup>Optional</sup> <a name="tags" id="aws-ddk-core.EnvironmentConfiguration.property.tags"></a>

```typescript
public readonly tags: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

---

### EnvironmentResult <a name="EnvironmentResult" id="aws-ddk-core.EnvironmentResult"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.EnvironmentResult.Initializer"></a>

```typescript
import { EnvironmentResult } from 'aws-ddk-core'

const environmentResult: EnvironmentResult = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.EnvironmentResult.property.account">account</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.EnvironmentResult.property.region">region</a></code> | <code>string</code> | *No description.* |

---

##### `account`<sup>Optional</sup> <a name="account" id="aws-ddk-core.EnvironmentResult.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string

---

##### `region`<sup>Optional</sup> <a name="region" id="aws-ddk-core.EnvironmentResult.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

---

### EventStageProps <a name="EventStageProps" id="aws-ddk-core.EventStageProps"></a>

Properties for the event stage.

#### Initializer <a name="Initializer" id="aws-ddk-core.EventStageProps.Initializer"></a>

```typescript
import { EventStageProps } from 'aws-ddk-core'

const eventStageProps: EventStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.EventStageProps.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.EventStageProps.property.name">name</a></code> | <code>string</code> | Name of the stage. |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.EventStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.EventStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

### FirehoseToS3StageProps <a name="FirehoseToS3StageProps" id="aws-ddk-core.FirehoseToS3StageProps"></a>

Properties for `FirehoseToS3Stage`.

#### Initializer <a name="Initializer" id="aws-ddk-core.FirehoseToS3StageProps.Initializer"></a>

```typescript
import { FirehoseToS3StageProps } from 'aws-ddk-core'

const firehoseToS3StageProps: FirehoseToS3StageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Enable/Disable all alarms in a DataStage. |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.dataOutputPrefix">dataOutputPrefix</a></code> | <code>string</code> | A prefix that Kinesis Data Firehose evaluates and adds to records before writing them to S3. |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.dataStream">dataStream</a></code> | <code>aws-cdk-lib.aws_kinesis.Stream</code> | Preexisting Kinesis Data Stream to use in stage before Delivery Stream. |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.dataStreamEnabled">dataStreamEnabled</a></code> | <code>boolean</code> | Add Kinesis Data Stream to front Firehose Delivery. |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.deliveryStreamDataFreshnessErrorsAlarmThreshold">deliveryStreamDataFreshnessErrorsAlarmThreshold</a></code> | <code>number</code> | Threshold for Cloudwatch Alarm created for this stage. |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.deliveryStreamDataFreshnessErrorsEvaluationPeriods">deliveryStreamDataFreshnessErrorsEvaluationPeriods</a></code> | <code>number</code> | Evaluation period value for Cloudwatch alarm created for this stage. |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.firehoseDeliveryStream">firehoseDeliveryStream</a></code> | <code>@aws-cdk/aws-kinesisfirehose-alpha.DeliveryStream</code> | Firehose Delivery stream. |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.firehoseDeliveryStreamProps">firehoseDeliveryStreamProps</a></code> | <code><a href="#aws-ddk-core.DeliveryStreamProps">DeliveryStreamProps</a></code> | Properties of the Firehose Delivery stream to be created. |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.kinesisFirehoseDestinationsS3BucketProps">kinesisFirehoseDestinationsS3BucketProps</a></code> | <code>@aws-cdk/aws-kinesisfirehose-destinations-alpha.S3BucketProps</code> | Props for defining an S3 destination of a Kinesis Data Firehose delivery stream. |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.s3Bucket">s3Bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Preexisting S3 Bucket to use as a destination for the Firehose Stream. |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.s3BucketProps">s3BucketProps</a></code> | <code>aws-cdk-lib.aws_s3.BucketProps</code> | Properties of the S3 Bucket to be created as a delivery destination. |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.FirehoseToS3StageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.FirehoseToS3StageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `alarmsEnabled`<sup>Optional</sup> <a name="alarmsEnabled" id="aws-ddk-core.FirehoseToS3StageProps.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean
- *Default:* true

Enable/Disable all alarms in a DataStage.

---

##### `dataOutputPrefix`<sup>Optional</sup> <a name="dataOutputPrefix" id="aws-ddk-core.FirehoseToS3StageProps.property.dataOutputPrefix"></a>

```typescript
public readonly dataOutputPrefix: string;
```

- *Type:* string
- *Default:* “YYYY/MM/DD/HH”

A prefix that Kinesis Data Firehose evaluates and adds to records before writing them to S3.

This prefix appears immediately following the bucket name.

---

##### `dataStream`<sup>Optional</sup> <a name="dataStream" id="aws-ddk-core.FirehoseToS3StageProps.property.dataStream"></a>

```typescript
public readonly dataStream: Stream;
```

- *Type:* aws-cdk-lib.aws_kinesis.Stream

Preexisting Kinesis Data Stream to use in stage before Delivery Stream.

Setting this parameter will override any creation of Kinesis Data Streams
in this stage.
The `dataStreamEnabled` parameter will have no effect.

---

##### `dataStreamEnabled`<sup>Optional</sup> <a name="dataStreamEnabled" id="aws-ddk-core.FirehoseToS3StageProps.property.dataStreamEnabled"></a>

```typescript
public readonly dataStreamEnabled: boolean;
```

- *Type:* boolean
- *Default:* false

Add Kinesis Data Stream to front Firehose Delivery.

---

##### `deliveryStreamDataFreshnessErrorsAlarmThreshold`<sup>Optional</sup> <a name="deliveryStreamDataFreshnessErrorsAlarmThreshold" id="aws-ddk-core.FirehoseToS3StageProps.property.deliveryStreamDataFreshnessErrorsAlarmThreshold"></a>

```typescript
public readonly deliveryStreamDataFreshnessErrorsAlarmThreshold: number;
```

- *Type:* number
- *Default:* 900

Threshold for Cloudwatch Alarm created for this stage.

---

##### `deliveryStreamDataFreshnessErrorsEvaluationPeriods`<sup>Optional</sup> <a name="deliveryStreamDataFreshnessErrorsEvaluationPeriods" id="aws-ddk-core.FirehoseToS3StageProps.property.deliveryStreamDataFreshnessErrorsEvaluationPeriods"></a>

```typescript
public readonly deliveryStreamDataFreshnessErrorsEvaluationPeriods: number;
```

- *Type:* number
- *Default:* 1

Evaluation period value for Cloudwatch alarm created for this stage.

---

##### `firehoseDeliveryStream`<sup>Optional</sup> <a name="firehoseDeliveryStream" id="aws-ddk-core.FirehoseToS3StageProps.property.firehoseDeliveryStream"></a>

```typescript
public readonly firehoseDeliveryStream: DeliveryStream;
```

- *Type:* @aws-cdk/aws-kinesisfirehose-alpha.DeliveryStream

Firehose Delivery stream.

If no stram is provided, a new one is created.

---

##### `firehoseDeliveryStreamProps`<sup>Optional</sup> <a name="firehoseDeliveryStreamProps" id="aws-ddk-core.FirehoseToS3StageProps.property.firehoseDeliveryStreamProps"></a>

```typescript
public readonly firehoseDeliveryStreamProps: DeliveryStreamProps;
```

- *Type:* <a href="#aws-ddk-core.DeliveryStreamProps">DeliveryStreamProps</a>

Properties of the Firehose Delivery stream to be created.

---

##### `kinesisFirehoseDestinationsS3BucketProps`<sup>Optional</sup> <a name="kinesisFirehoseDestinationsS3BucketProps" id="aws-ddk-core.FirehoseToS3StageProps.property.kinesisFirehoseDestinationsS3BucketProps"></a>

```typescript
public readonly kinesisFirehoseDestinationsS3BucketProps: S3BucketProps;
```

- *Type:* @aws-cdk/aws-kinesisfirehose-destinations-alpha.S3BucketProps

Props for defining an S3 destination of a Kinesis Data Firehose delivery stream.

---

##### `s3Bucket`<sup>Optional</sup> <a name="s3Bucket" id="aws-ddk-core.FirehoseToS3StageProps.property.s3Bucket"></a>

```typescript
public readonly s3Bucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

Preexisting S3 Bucket to use as a destination for the Firehose Stream.

If no bucket is provided, a new one is created.

Amazon EventBridge notifications must be enabled on the bucket in order
for this stage to produce events after its completion.

---

##### `s3BucketProps`<sup>Optional</sup> <a name="s3BucketProps" id="aws-ddk-core.FirehoseToS3StageProps.property.s3BucketProps"></a>

```typescript
public readonly s3BucketProps: BucketProps;
```

- *Type:* aws-cdk-lib.aws_s3.BucketProps

Properties of the S3 Bucket to be created as a delivery destination.

Amazon EventBridge notifications must be enabled on the bucket in order
for this stage to produce events after its completion.

---

### GetEnvConfigProps <a name="GetEnvConfigProps" id="aws-ddk-core.GetEnvConfigProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.GetEnvConfigProps.Initializer"></a>

```typescript
import { GetEnvConfigProps } from 'aws-ddk-core'

const getEnvConfigProps: GetEnvConfigProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.GetEnvConfigProps.property.configPath">configPath</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.GetEnvConfigProps.property.environmentId">environmentId</a></code> | <code>string</code> | *No description.* |

---

##### `configPath`<sup>Required</sup> <a name="configPath" id="aws-ddk-core.GetEnvConfigProps.property.configPath"></a>

```typescript
public readonly configPath: string;
```

- *Type:* string

---

##### `environmentId`<sup>Required</sup> <a name="environmentId" id="aws-ddk-core.GetEnvConfigProps.property.environmentId"></a>

```typescript
public readonly environmentId: string;
```

- *Type:* string

---

### GetEnvironmentProps <a name="GetEnvironmentProps" id="aws-ddk-core.GetEnvironmentProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.GetEnvironmentProps.Initializer"></a>

```typescript
import { GetEnvironmentProps } from 'aws-ddk-core'

const getEnvironmentProps: GetEnvironmentProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.GetEnvironmentProps.property.configPath">configPath</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.GetEnvironmentProps.property.environmentId">environmentId</a></code> | <code>string</code> | *No description.* |

---

##### `configPath`<sup>Required</sup> <a name="configPath" id="aws-ddk-core.GetEnvironmentProps.property.configPath"></a>

```typescript
public readonly configPath: string;
```

- *Type:* string

---

##### `environmentId`<sup>Optional</sup> <a name="environmentId" id="aws-ddk-core.GetEnvironmentProps.property.environmentId"></a>

```typescript
public readonly environmentId: string;
```

- *Type:* string

---

### GetSynthActionProps <a name="GetSynthActionProps" id="aws-ddk-core.GetSynthActionProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.GetSynthActionProps.Initializer"></a>

```typescript
import { GetSynthActionProps } from 'aws-ddk-core'

const getSynthActionProps: GetSynthActionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.GetSynthActionProps.property.account">account</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.GetSynthActionProps.property.additionalInstallCommands">additionalInstallCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.GetSynthActionProps.property.cdkVersion">cdkVersion</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.GetSynthActionProps.property.codeartifactDomain">codeartifactDomain</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.GetSynthActionProps.property.codeartifactDomainOwner">codeartifactDomainOwner</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.GetSynthActionProps.property.codeartifactRepository">codeartifactRepository</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.GetSynthActionProps.property.codePipelineSource">codePipelineSource</a></code> | <code>aws-cdk-lib.pipelines.IFileSetProducer</code> | *No description.* |
| <code><a href="#aws-ddk-core.GetSynthActionProps.property.partition">partition</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.GetSynthActionProps.property.region">region</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.GetSynthActionProps.property.rolePolicyStatements">rolePolicyStatements</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | *No description.* |

---

##### `account`<sup>Optional</sup> <a name="account" id="aws-ddk-core.GetSynthActionProps.property.account"></a>

```typescript
public readonly account: string;
```

- *Type:* string

---

##### `additionalInstallCommands`<sup>Optional</sup> <a name="additionalInstallCommands" id="aws-ddk-core.GetSynthActionProps.property.additionalInstallCommands"></a>

```typescript
public readonly additionalInstallCommands: string[];
```

- *Type:* string[]

---

##### `cdkVersion`<sup>Optional</sup> <a name="cdkVersion" id="aws-ddk-core.GetSynthActionProps.property.cdkVersion"></a>

```typescript
public readonly cdkVersion: string;
```

- *Type:* string

---

##### `codeartifactDomain`<sup>Optional</sup> <a name="codeartifactDomain" id="aws-ddk-core.GetSynthActionProps.property.codeartifactDomain"></a>

```typescript
public readonly codeartifactDomain: string;
```

- *Type:* string

---

##### `codeartifactDomainOwner`<sup>Optional</sup> <a name="codeartifactDomainOwner" id="aws-ddk-core.GetSynthActionProps.property.codeartifactDomainOwner"></a>

```typescript
public readonly codeartifactDomainOwner: string;
```

- *Type:* string

---

##### `codeartifactRepository`<sup>Optional</sup> <a name="codeartifactRepository" id="aws-ddk-core.GetSynthActionProps.property.codeartifactRepository"></a>

```typescript
public readonly codeartifactRepository: string;
```

- *Type:* string

---

##### `codePipelineSource`<sup>Optional</sup> <a name="codePipelineSource" id="aws-ddk-core.GetSynthActionProps.property.codePipelineSource"></a>

```typescript
public readonly codePipelineSource: IFileSetProducer;
```

- *Type:* aws-cdk-lib.pipelines.IFileSetProducer

---

##### `partition`<sup>Optional</sup> <a name="partition" id="aws-ddk-core.GetSynthActionProps.property.partition"></a>

```typescript
public readonly partition: string;
```

- *Type:* string

---

##### `region`<sup>Optional</sup> <a name="region" id="aws-ddk-core.GetSynthActionProps.property.region"></a>

```typescript
public readonly region: string;
```

- *Type:* string

---

##### `rolePolicyStatements`<sup>Optional</sup> <a name="rolePolicyStatements" id="aws-ddk-core.GetSynthActionProps.property.rolePolicyStatements"></a>

```typescript
public readonly rolePolicyStatements: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]

---

### GetTagsProps <a name="GetTagsProps" id="aws-ddk-core.GetTagsProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.GetTagsProps.Initializer"></a>

```typescript
import { GetTagsProps } from 'aws-ddk-core'

const getTagsProps: GetTagsProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.GetTagsProps.property.configPath">configPath</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.GetTagsProps.property.environmentId">environmentId</a></code> | <code>string</code> | *No description.* |

---

##### `configPath`<sup>Required</sup> <a name="configPath" id="aws-ddk-core.GetTagsProps.property.configPath"></a>

```typescript
public readonly configPath: string;
```

- *Type:* string

---

##### `environmentId`<sup>Optional</sup> <a name="environmentId" id="aws-ddk-core.GetTagsProps.property.environmentId"></a>

```typescript
public readonly environmentId: string;
```

- *Type:* string

---

### GlueTransformStageProps <a name="GlueTransformStageProps" id="aws-ddk-core.GlueTransformStageProps"></a>

Properties for `GlueTransformStage`.

#### Initializer <a name="Initializer" id="aws-ddk-core.GlueTransformStageProps.Initializer"></a>

```typescript
import { GlueTransformStageProps } from 'aws-ddk-core'

const glueTransformStageProps: GlueTransformStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.additionalRolePolicyStatements">additionalRolePolicyStatements</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | Additional IAM policy statements to add to the state machine role. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Enable/Disable all alarms in the stage. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.stateMachineFailedExecutionsAlarmEvaluationPeriods">stateMachineFailedExecutionsAlarmEvaluationPeriods</a></code> | <code>number</code> | The number of periods over which data is compared to the specified threshold. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.stateMachineFailedExecutionsAlarmThreshold">stateMachineFailedExecutionsAlarmThreshold</a></code> | <code>number</code> | The number of failed state machine executions before triggering CW alarm. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.stateMachineInput">stateMachineInput</a></code> | <code>{[ key: string ]: any}</code> | Input of the state machine. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.stateMachineName">stateMachineName</a></code> | <code>string</code> | Name of the state machine. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.crawlerAllowFailure">crawlerAllowFailure</a></code> | <code>boolean</code> | Argument to allow stepfunction success for crawler failures/execption like Glue.CrawlerRunningException. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.crawlerName">crawlerName</a></code> | <code>string</code> | The name of a preexisting Glue crawler to run. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.crawlerProps">crawlerProps</a></code> | <code>aws-cdk-lib.aws_glue.CfnCrawlerProps</code> | Properties for the Glue Crawler. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.crawlerRole">crawlerRole</a></code> | <code>string</code> | The crawler execution role. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.databaseName">databaseName</a></code> | <code>string</code> | The name of the database in which the crawler's output is stored. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.jobName">jobName</a></code> | <code>string</code> | The name of a preexisting Glue job to run. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.jobProps">jobProps</a></code> | <code>@aws-cdk/aws-glue-alpha.JobProps</code> | Additional Glue job properties. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.jobRunArgs">jobRunArgs</a></code> | <code>{[ key: string ]: any}</code> | The input arguments to the Glue job. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.stateMachineRetryBackoffRate">stateMachineRetryBackoffRate</a></code> | <code>number</code> | Multiplication for how much longer the wait interval gets on every retry. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.stateMachineRetryInterval">stateMachineRetryInterval</a></code> | <code>aws-cdk-lib.Duration</code> | How many seconds to wait initially before retrying. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.stateMachineRetryMaxAttempts">stateMachineRetryMaxAttempts</a></code> | <code>number</code> | How many times to retry this particular error. |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_glue.CfnCrawler.TargetsProperty</code> | A collection of targets to crawl. |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.GlueTransformStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.GlueTransformStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `additionalRolePolicyStatements`<sup>Optional</sup> <a name="additionalRolePolicyStatements" id="aws-ddk-core.GlueTransformStageProps.property.additionalRolePolicyStatements"></a>

```typescript
public readonly additionalRolePolicyStatements: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]

Additional IAM policy statements to add to the state machine role.

---

##### `alarmsEnabled`<sup>Optional</sup> <a name="alarmsEnabled" id="aws-ddk-core.GlueTransformStageProps.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean
- *Default:* true

Enable/Disable all alarms in the stage.

---

##### `stateMachineFailedExecutionsAlarmEvaluationPeriods`<sup>Optional</sup> <a name="stateMachineFailedExecutionsAlarmEvaluationPeriods" id="aws-ddk-core.GlueTransformStageProps.property.stateMachineFailedExecutionsAlarmEvaluationPeriods"></a>

```typescript
public readonly stateMachineFailedExecutionsAlarmEvaluationPeriods: number;
```

- *Type:* number
- *Default:* 1

The number of periods over which data is compared to the specified threshold.

---

##### `stateMachineFailedExecutionsAlarmThreshold`<sup>Optional</sup> <a name="stateMachineFailedExecutionsAlarmThreshold" id="aws-ddk-core.GlueTransformStageProps.property.stateMachineFailedExecutionsAlarmThreshold"></a>

```typescript
public readonly stateMachineFailedExecutionsAlarmThreshold: number;
```

- *Type:* number
- *Default:* 1

The number of failed state machine executions before triggering CW alarm.

---

##### `stateMachineInput`<sup>Optional</sup> <a name="stateMachineInput" id="aws-ddk-core.GlueTransformStageProps.property.stateMachineInput"></a>

```typescript
public readonly stateMachineInput: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

Input of the state machine.

---

##### `stateMachineName`<sup>Optional</sup> <a name="stateMachineName" id="aws-ddk-core.GlueTransformStageProps.property.stateMachineName"></a>

```typescript
public readonly stateMachineName: string;
```

- *Type:* string

Name of the state machine.

---

##### `crawlerAllowFailure`<sup>Optional</sup> <a name="crawlerAllowFailure" id="aws-ddk-core.GlueTransformStageProps.property.crawlerAllowFailure"></a>

```typescript
public readonly crawlerAllowFailure: boolean;
```

- *Type:* boolean
- *Default:* true

Argument to allow stepfunction success for crawler failures/execption like Glue.CrawlerRunningException.

---

##### `crawlerName`<sup>Optional</sup> <a name="crawlerName" id="aws-ddk-core.GlueTransformStageProps.property.crawlerName"></a>

```typescript
public readonly crawlerName: string;
```

- *Type:* string

The name of a preexisting Glue crawler to run.

If None, a Glue crawler is created.

---

##### `crawlerProps`<sup>Optional</sup> <a name="crawlerProps" id="aws-ddk-core.GlueTransformStageProps.property.crawlerProps"></a>

```typescript
public readonly crawlerProps: CfnCrawlerProps;
```

- *Type:* aws-cdk-lib.aws_glue.CfnCrawlerProps

Properties for the Glue Crawler.

> [https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_glue.CfnCrawler.html](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_glue.CfnCrawler.html)

---

##### `crawlerRole`<sup>Optional</sup> <a name="crawlerRole" id="aws-ddk-core.GlueTransformStageProps.property.crawlerRole"></a>

```typescript
public readonly crawlerRole: string;
```

- *Type:* string

The crawler execution role.

---

##### `databaseName`<sup>Optional</sup> <a name="databaseName" id="aws-ddk-core.GlueTransformStageProps.property.databaseName"></a>

```typescript
public readonly databaseName: string;
```

- *Type:* string

The name of the database in which the crawler's output is stored.

---

##### `jobName`<sup>Optional</sup> <a name="jobName" id="aws-ddk-core.GlueTransformStageProps.property.jobName"></a>

```typescript
public readonly jobName: string;
```

- *Type:* string

The name of a preexisting Glue job to run.

If None, a Glue job is created.

---

##### `jobProps`<sup>Optional</sup> <a name="jobProps" id="aws-ddk-core.GlueTransformStageProps.property.jobProps"></a>

```typescript
public readonly jobProps: JobProps;
```

- *Type:* @aws-cdk/aws-glue-alpha.JobProps

Additional Glue job properties.

For complete list of properties refer to CDK Documentation

> [https://docs.aws.amazon.com/cdk/api/v2/docs/@aws-cdk_aws-glue-alpha.Job.html](https://docs.aws.amazon.com/cdk/api/v2/docs/@aws-cdk_aws-glue-alpha.Job.html)

---

##### `jobRunArgs`<sup>Optional</sup> <a name="jobRunArgs" id="aws-ddk-core.GlueTransformStageProps.property.jobRunArgs"></a>

```typescript
public readonly jobRunArgs: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

The input arguments to the Glue job.

---

##### `stateMachineRetryBackoffRate`<sup>Optional</sup> <a name="stateMachineRetryBackoffRate" id="aws-ddk-core.GlueTransformStageProps.property.stateMachineRetryBackoffRate"></a>

```typescript
public readonly stateMachineRetryBackoffRate: number;
```

- *Type:* number
- *Default:* 2

Multiplication for how much longer the wait interval gets on every retry.

---

##### `stateMachineRetryInterval`<sup>Optional</sup> <a name="stateMachineRetryInterval" id="aws-ddk-core.GlueTransformStageProps.property.stateMachineRetryInterval"></a>

```typescript
public readonly stateMachineRetryInterval: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* cdk.Duration.seconds(1)

How many seconds to wait initially before retrying.

---

##### `stateMachineRetryMaxAttempts`<sup>Optional</sup> <a name="stateMachineRetryMaxAttempts" id="aws-ddk-core.GlueTransformStageProps.property.stateMachineRetryMaxAttempts"></a>

```typescript
public readonly stateMachineRetryMaxAttempts: number;
```

- *Type:* number
- *Default:* 3

How many times to retry this particular error.

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.GlueTransformStageProps.property.targets"></a>

```typescript
public readonly targets: TargetsProperty;
```

- *Type:* aws-cdk-lib.aws_glue.CfnCrawler.TargetsProperty

A collection of targets to crawl.

---

### PermissionsBoundaryProps <a name="PermissionsBoundaryProps" id="aws-ddk-core.PermissionsBoundaryProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.PermissionsBoundaryProps.Initializer"></a>

```typescript
import { PermissionsBoundaryProps } from 'aws-ddk-core'

const permissionsBoundaryProps: PermissionsBoundaryProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.PermissionsBoundaryProps.property.environmentId">environmentId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.PermissionsBoundaryProps.property.prefix">prefix</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.PermissionsBoundaryProps.property.qualifier">qualifier</a></code> | <code>string</code> | *No description.* |

---

##### `environmentId`<sup>Optional</sup> <a name="environmentId" id="aws-ddk-core.PermissionsBoundaryProps.property.environmentId"></a>

```typescript
public readonly environmentId: string;
```

- *Type:* string

---

##### `prefix`<sup>Optional</sup> <a name="prefix" id="aws-ddk-core.PermissionsBoundaryProps.property.prefix"></a>

```typescript
public readonly prefix: string;
```

- *Type:* string

---

##### `qualifier`<sup>Optional</sup> <a name="qualifier" id="aws-ddk-core.PermissionsBoundaryProps.property.qualifier"></a>

```typescript
public readonly qualifier: string;
```

- *Type:* string

---

### RedshiftDataApiStageProps <a name="RedshiftDataApiStageProps" id="aws-ddk-core.RedshiftDataApiStageProps"></a>

Properties for `RedshiftDataApiStage`.

#### Initializer <a name="Initializer" id="aws-ddk-core.RedshiftDataApiStageProps.Initializer"></a>

```typescript
import { RedshiftDataApiStageProps } from 'aws-ddk-core'

const redshiftDataApiStageProps: RedshiftDataApiStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.RedshiftDataApiStageProps.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStageProps.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStageProps.property.additionalRolePolicyStatements">additionalRolePolicyStatements</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | Additional IAM policy statements to add to the state machine role. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStageProps.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Enable/Disable all alarms in the stage. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStageProps.property.stateMachineFailedExecutionsAlarmEvaluationPeriods">stateMachineFailedExecutionsAlarmEvaluationPeriods</a></code> | <code>number</code> | The number of periods over which data is compared to the specified threshold. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStageProps.property.stateMachineFailedExecutionsAlarmThreshold">stateMachineFailedExecutionsAlarmThreshold</a></code> | <code>number</code> | The number of failed state machine executions before triggering CW alarm. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStageProps.property.stateMachineInput">stateMachineInput</a></code> | <code>{[ key: string ]: any}</code> | Input of the state machine. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStageProps.property.stateMachineName">stateMachineName</a></code> | <code>string</code> | Name of the state machine. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStageProps.property.redshiftClusterIdentifier">redshiftClusterIdentifier</a></code> | <code>string</code> | Identifier of the Redshift cluster. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStageProps.property.sqlStatements">sqlStatements</a></code> | <code>string[]</code> | List of SQL statements to execute. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStageProps.property.databaseName">databaseName</a></code> | <code>string</code> | Name of the database in Redshift. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStageProps.property.databaseUser">databaseUser</a></code> | <code>string</code> | Database user. |
| <code><a href="#aws-ddk-core.RedshiftDataApiStageProps.property.pollingTime">pollingTime</a></code> | <code>aws-cdk-lib.Duration</code> | Waiting time between checking whether the statements have finished executing. |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.RedshiftDataApiStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.RedshiftDataApiStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `additionalRolePolicyStatements`<sup>Optional</sup> <a name="additionalRolePolicyStatements" id="aws-ddk-core.RedshiftDataApiStageProps.property.additionalRolePolicyStatements"></a>

```typescript
public readonly additionalRolePolicyStatements: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]

Additional IAM policy statements to add to the state machine role.

---

##### `alarmsEnabled`<sup>Optional</sup> <a name="alarmsEnabled" id="aws-ddk-core.RedshiftDataApiStageProps.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean
- *Default:* true

Enable/Disable all alarms in the stage.

---

##### `stateMachineFailedExecutionsAlarmEvaluationPeriods`<sup>Optional</sup> <a name="stateMachineFailedExecutionsAlarmEvaluationPeriods" id="aws-ddk-core.RedshiftDataApiStageProps.property.stateMachineFailedExecutionsAlarmEvaluationPeriods"></a>

```typescript
public readonly stateMachineFailedExecutionsAlarmEvaluationPeriods: number;
```

- *Type:* number
- *Default:* 1

The number of periods over which data is compared to the specified threshold.

---

##### `stateMachineFailedExecutionsAlarmThreshold`<sup>Optional</sup> <a name="stateMachineFailedExecutionsAlarmThreshold" id="aws-ddk-core.RedshiftDataApiStageProps.property.stateMachineFailedExecutionsAlarmThreshold"></a>

```typescript
public readonly stateMachineFailedExecutionsAlarmThreshold: number;
```

- *Type:* number
- *Default:* 1

The number of failed state machine executions before triggering CW alarm.

---

##### `stateMachineInput`<sup>Optional</sup> <a name="stateMachineInput" id="aws-ddk-core.RedshiftDataApiStageProps.property.stateMachineInput"></a>

```typescript
public readonly stateMachineInput: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

Input of the state machine.

---

##### `stateMachineName`<sup>Optional</sup> <a name="stateMachineName" id="aws-ddk-core.RedshiftDataApiStageProps.property.stateMachineName"></a>

```typescript
public readonly stateMachineName: string;
```

- *Type:* string

Name of the state machine.

---

##### `redshiftClusterIdentifier`<sup>Required</sup> <a name="redshiftClusterIdentifier" id="aws-ddk-core.RedshiftDataApiStageProps.property.redshiftClusterIdentifier"></a>

```typescript
public readonly redshiftClusterIdentifier: string;
```

- *Type:* string

Identifier of the Redshift cluster.

---

##### `sqlStatements`<sup>Required</sup> <a name="sqlStatements" id="aws-ddk-core.RedshiftDataApiStageProps.property.sqlStatements"></a>

```typescript
public readonly sqlStatements: string[];
```

- *Type:* string[]

List of SQL statements to execute.

---

##### `databaseName`<sup>Optional</sup> <a name="databaseName" id="aws-ddk-core.RedshiftDataApiStageProps.property.databaseName"></a>

```typescript
public readonly databaseName: string;
```

- *Type:* string
- *Default:* "dev"

Name of the database in Redshift.

---

##### `databaseUser`<sup>Optional</sup> <a name="databaseUser" id="aws-ddk-core.RedshiftDataApiStageProps.property.databaseUser"></a>

```typescript
public readonly databaseUser: string;
```

- *Type:* string
- *Default:* "awsuser"

Database user.

---

##### `pollingTime`<sup>Optional</sup> <a name="pollingTime" id="aws-ddk-core.RedshiftDataApiStageProps.property.pollingTime"></a>

```typescript
public readonly pollingTime: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* cdk.Duration.seconds(15)

Waiting time between checking whether the statements have finished executing.

---

### S3EventStageProps <a name="S3EventStageProps" id="aws-ddk-core.S3EventStageProps"></a>

Properties for `S3EventStage`.

#### Initializer <a name="Initializer" id="aws-ddk-core.S3EventStageProps.Initializer"></a>

```typescript
import { S3EventStageProps } from 'aws-ddk-core'

const s3EventStageProps: S3EventStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.S3EventStageProps.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.S3EventStageProps.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.S3EventStageProps.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket \| aws-cdk-lib.aws_s3.IBucket[]</code> | S3 Bucket or list of buckets. |
| <code><a href="#aws-ddk-core.S3EventStageProps.property.eventNames">eventNames</a></code> | <code>string[]</code> | The list of events to capture, for example: ["Object Created"]. |
| <code><a href="#aws-ddk-core.S3EventStageProps.property.keyPrefix">keyPrefix</a></code> | <code>string \| string[]</code> | The S3 prefix or list of prefixes. |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.S3EventStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.S3EventStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `bucket`<sup>Required</sup> <a name="bucket" id="aws-ddk-core.S3EventStageProps.property.bucket"></a>

```typescript
public readonly bucket: IBucket | IBucket[];
```

- *Type:* aws-cdk-lib.aws_s3.IBucket | aws-cdk-lib.aws_s3.IBucket[]

S3 Bucket or list of buckets.

Amazon EventBridge notifications must be enabled on the bucket in order to use this construct.

---

##### `eventNames`<sup>Required</sup> <a name="eventNames" id="aws-ddk-core.S3EventStageProps.property.eventNames"></a>

```typescript
public readonly eventNames: string[];
```

- *Type:* string[]

The list of events to capture, for example: ["Object Created"].

> [https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventBridge.html](https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventBridge.html)

---

##### `keyPrefix`<sup>Optional</sup> <a name="keyPrefix" id="aws-ddk-core.S3EventStageProps.property.keyPrefix"></a>

```typescript
public readonly keyPrefix: string | string[];
```

- *Type:* string | string[]

The S3 prefix or list of prefixes.

Capture root level prefix ("/") by default.

---

### SnsToLambdaStageProps <a name="SnsToLambdaStageProps" id="aws-ddk-core.SnsToLambdaStageProps"></a>

Properties for `SnsSqsToLambdaStage`.

#### Initializer <a name="Initializer" id="aws-ddk-core.SnsToLambdaStageProps.Initializer"></a>

```typescript
import { SnsToLambdaStageProps } from 'aws-ddk-core'

const snsToLambdaStageProps: SnsToLambdaStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.SnsToLambdaStageProps.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.SnsToLambdaStageProps.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.SnsToLambdaStageProps.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Enable/Disable all alarms in a DataStage. |
| <code><a href="#aws-ddk-core.SnsToLambdaStageProps.property.batchSize">batchSize</a></code> | <code>number</code> | The maximum number of records retrieved from the event source at the function invocation time. |
| <code><a href="#aws-ddk-core.SnsToLambdaStageProps.property.dlqEnabled">dlqEnabled</a></code> | <code>boolean</code> | Determines if DLQ is enabled. |
| <code><a href="#aws-ddk-core.SnsToLambdaStageProps.property.lambdaFunction">lambdaFunction</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | Preexisting Lambda Function to use in stage. |
| <code><a href="#aws-ddk-core.SnsToLambdaStageProps.property.lambdaFunctionProps">lambdaFunctionProps</a></code> | <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps">SqsToLambdaStageFunctionProps</a></code> | Properties for the Lambda Function that will be created by this construct (if `lambdaFunction` is not provided). |
| <code><a href="#aws-ddk-core.SnsToLambdaStageProps.property.maxBatchingWindow">maxBatchingWindow</a></code> | <code>aws-cdk-lib.Duration</code> | The maximum amount of time to gather records before invoking the function. |
| <code><a href="#aws-ddk-core.SnsToLambdaStageProps.property.maxReceiveCount">maxReceiveCount</a></code> | <code>number</code> | The number of times a message can be unsuccessfully dequeued before being moved to the dead-letter queue. |
| <code><a href="#aws-ddk-core.SnsToLambdaStageProps.property.messageGroupId">messageGroupId</a></code> | <code>string</code> | Message Group ID for messages sent to this queue. |
| <code><a href="#aws-ddk-core.SnsToLambdaStageProps.property.sqsQueue">sqsQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | Preexisting SQS Queue to use in stage. |
| <code><a href="#aws-ddk-core.SnsToLambdaStageProps.property.sqsQueueProps">sqsQueueProps</a></code> | <code>aws-cdk-lib.aws_sqs.QueueProps</code> | Properties for the SQS Queue that will be created by this construct (if `sqsQueue` is not provided). |
| <code><a href="#aws-ddk-core.SnsToLambdaStageProps.property.disableDefaultTopicPolicy">disableDefaultTopicPolicy</a></code> | <code>boolean</code> | Whether to disable the default topic policy generated by SnsFactory. |
| <code><a href="#aws-ddk-core.SnsToLambdaStageProps.property.filterPolicy">filterPolicy</a></code> | <code>{[ key: string ]: aws-cdk-lib.aws_sns.SubscriptionFilter}</code> | The filter policy. |
| <code><a href="#aws-ddk-core.SnsToLambdaStageProps.property.rawMessageDelivery">rawMessageDelivery</a></code> | <code>boolean</code> | The message to the queue is the same as it was sent to the topic. |
| <code><a href="#aws-ddk-core.SnsToLambdaStageProps.property.snsDlqEnabled">snsDlqEnabled</a></code> | <code>boolean</code> | Queue to be used as dead letter queue. |
| <code><a href="#aws-ddk-core.SnsToLambdaStageProps.property.snsTopic">snsTopic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | Preexisting SNS Topic to use in stage. |
| <code><a href="#aws-ddk-core.SnsToLambdaStageProps.property.snsTopicProps">snsTopicProps</a></code> | <code>aws-cdk-lib.aws_sns.TopicProps</code> | Properties for the SNS Topic that will be created by this construct (if `snsTopic` is not provided). |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.SnsToLambdaStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.SnsToLambdaStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `alarmsEnabled`<sup>Optional</sup> <a name="alarmsEnabled" id="aws-ddk-core.SnsToLambdaStageProps.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean
- *Default:* true

Enable/Disable all alarms in a DataStage.

---

##### `batchSize`<sup>Optional</sup> <a name="batchSize" id="aws-ddk-core.SnsToLambdaStageProps.property.batchSize"></a>

```typescript
public readonly batchSize: number;
```

- *Type:* number
- *Default:* 10

The maximum number of records retrieved from the event source at the function invocation time.

---

##### `dlqEnabled`<sup>Optional</sup> <a name="dlqEnabled" id="aws-ddk-core.SnsToLambdaStageProps.property.dlqEnabled"></a>

```typescript
public readonly dlqEnabled: boolean;
```

- *Type:* boolean
- *Default:* false

Determines if DLQ is enabled.

---

##### `lambdaFunction`<sup>Optional</sup> <a name="lambdaFunction" id="aws-ddk-core.SnsToLambdaStageProps.property.lambdaFunction"></a>

```typescript
public readonly lambdaFunction: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

Preexisting Lambda Function to use in stage.

If not provided, a new function will be created.

---

##### `lambdaFunctionProps`<sup>Optional</sup> <a name="lambdaFunctionProps" id="aws-ddk-core.SnsToLambdaStageProps.property.lambdaFunctionProps"></a>

```typescript
public readonly lambdaFunctionProps: SqsToLambdaStageFunctionProps;
```

- *Type:* <a href="#aws-ddk-core.SqsToLambdaStageFunctionProps">SqsToLambdaStageFunctionProps</a>

Properties for the Lambda Function that will be created by this construct (if `lambdaFunction` is not provided).

---

##### `maxBatchingWindow`<sup>Optional</sup> <a name="maxBatchingWindow" id="aws-ddk-core.SnsToLambdaStageProps.property.maxBatchingWindow"></a>

```typescript
public readonly maxBatchingWindow: Duration;
```

- *Type:* aws-cdk-lib.Duration

The maximum amount of time to gather records before invoking the function.

Valid Range: Minimum value of 0 minutes, maximum value of 5 minutes.
Default: - no batching window.

---

##### `maxReceiveCount`<sup>Optional</sup> <a name="maxReceiveCount" id="aws-ddk-core.SnsToLambdaStageProps.property.maxReceiveCount"></a>

```typescript
public readonly maxReceiveCount: number;
```

- *Type:* number
- *Default:* 1

The number of times a message can be unsuccessfully dequeued before being moved to the dead-letter queue.

---

##### `messageGroupId`<sup>Optional</sup> <a name="messageGroupId" id="aws-ddk-core.SnsToLambdaStageProps.property.messageGroupId"></a>

```typescript
public readonly messageGroupId: string;
```

- *Type:* string

Message Group ID for messages sent to this queue.

Required for FIFO queues.

---

##### `sqsQueue`<sup>Optional</sup> <a name="sqsQueue" id="aws-ddk-core.SnsToLambdaStageProps.property.sqsQueue"></a>

```typescript
public readonly sqsQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue

Preexisting SQS Queue to use in stage.

If not provided, a new queue will be created.

---

##### `sqsQueueProps`<sup>Optional</sup> <a name="sqsQueueProps" id="aws-ddk-core.SnsToLambdaStageProps.property.sqsQueueProps"></a>

```typescript
public readonly sqsQueueProps: QueueProps;
```

- *Type:* aws-cdk-lib.aws_sqs.QueueProps

Properties for the SQS Queue that will be created by this construct (if `sqsQueue` is not provided).

---

##### `disableDefaultTopicPolicy`<sup>Optional</sup> <a name="disableDefaultTopicPolicy" id="aws-ddk-core.SnsToLambdaStageProps.property.disableDefaultTopicPolicy"></a>

```typescript
public readonly disableDefaultTopicPolicy: boolean;
```

- *Type:* boolean
- *Default:* false

Whether to disable the default topic policy generated by SnsFactory.

> [SnsFactory.secureSnsTopicPolicy *](SnsFactory.secureSnsTopicPolicy *)

---

##### `filterPolicy`<sup>Optional</sup> <a name="filterPolicy" id="aws-ddk-core.SnsToLambdaStageProps.property.filterPolicy"></a>

```typescript
public readonly filterPolicy: {[ key: string ]: SubscriptionFilter};
```

- *Type:* {[ key: string ]: aws-cdk-lib.aws_sns.SubscriptionFilter}
- *Default:* all messages are delivered

The filter policy.

---

##### `rawMessageDelivery`<sup>Optional</sup> <a name="rawMessageDelivery" id="aws-ddk-core.SnsToLambdaStageProps.property.rawMessageDelivery"></a>

```typescript
public readonly rawMessageDelivery: boolean;
```

- *Type:* boolean
- *Default:* false

The message to the queue is the same as it was sent to the topic.

If false, the message will be wrapped in an SNS envelope.

---

##### `snsDlqEnabled`<sup>Optional</sup> <a name="snsDlqEnabled" id="aws-ddk-core.SnsToLambdaStageProps.property.snsDlqEnabled"></a>

```typescript
public readonly snsDlqEnabled: boolean;
```

- *Type:* boolean
- *Default:* No dead letter queue enabled.

Queue to be used as dead letter queue.

If not passed no dead letter queue is enabled.

---

##### `snsTopic`<sup>Optional</sup> <a name="snsTopic" id="aws-ddk-core.SnsToLambdaStageProps.property.snsTopic"></a>

```typescript
public readonly snsTopic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic

Preexisting SNS Topic to use in stage.

If not provided, a new one will be created.

---

##### `snsTopicProps`<sup>Optional</sup> <a name="snsTopicProps" id="aws-ddk-core.SnsToLambdaStageProps.property.snsTopicProps"></a>

```typescript
public readonly snsTopicProps: TopicProps;
```

- *Type:* aws-cdk-lib.aws_sns.TopicProps

Properties for the SNS Topic that will be created by this construct (if `snsTopic` is not provided).

---

### SourceActionProps <a name="SourceActionProps" id="aws-ddk-core.SourceActionProps"></a>

Properties for the source action.

#### Initializer <a name="Initializer" id="aws-ddk-core.SourceActionProps.Initializer"></a>

```typescript
import { SourceActionProps } from 'aws-ddk-core'

const sourceActionProps: SourceActionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.SourceActionProps.property.repositoryName">repositoryName</a></code> | <code>string</code> | Name of the SCM repository. |
| <code><a href="#aws-ddk-core.SourceActionProps.property.branch">branch</a></code> | <code>string</code> | Branch of the SCM repository. |
| <code><a href="#aws-ddk-core.SourceActionProps.property.sourceAction">sourceAction</a></code> | <code>aws-cdk-lib.pipelines.CodePipelineSource</code> | Override source action. |

---

##### `repositoryName`<sup>Required</sup> <a name="repositoryName" id="aws-ddk-core.SourceActionProps.property.repositoryName"></a>

```typescript
public readonly repositoryName: string;
```

- *Type:* string

Name of the SCM repository.

---

##### `branch`<sup>Optional</sup> <a name="branch" id="aws-ddk-core.SourceActionProps.property.branch"></a>

```typescript
public readonly branch: string;
```

- *Type:* string

Branch of the SCM repository.

---

##### `sourceAction`<sup>Optional</sup> <a name="sourceAction" id="aws-ddk-core.SourceActionProps.property.sourceAction"></a>

```typescript
public readonly sourceAction: CodePipelineSource;
```

- *Type:* aws-cdk-lib.pipelines.CodePipelineSource

Override source action.

---

### SqsToLambdaStageFunctionProps <a name="SqsToLambdaStageFunctionProps" id="aws-ddk-core.SqsToLambdaStageFunctionProps"></a>

Properties for the Lambda Function created by `SqsToLambdaStage`.

#### Initializer <a name="Initializer" id="aws-ddk-core.SqsToLambdaStageFunctionProps.Initializer"></a>

```typescript
import { SqsToLambdaStageFunctionProps } from 'aws-ddk-core'

const sqsToLambdaStageFunctionProps: SqsToLambdaStageFunctionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.maxEventAge">maxEventAge</a></code> | <code>aws-cdk-lib.Duration</code> | The maximum age of a request that Lambda sends to a function for processing. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.onFailure">onFailure</a></code> | <code>aws-cdk-lib.aws_lambda.IDestination</code> | The destination for failed invocations. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.onSuccess">onSuccess</a></code> | <code>aws-cdk-lib.aws_lambda.IDestination</code> | The destination for successful invocations. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.retryAttempts">retryAttempts</a></code> | <code>number</code> | The maximum number of times to retry when the function returns an error. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.adotInstrumentation">adotInstrumentation</a></code> | <code>aws-cdk-lib.aws_lambda.AdotInstrumentationConfig</code> | Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.allowAllOutbound">allowAllOutbound</a></code> | <code>boolean</code> | Whether to allow the Lambda to send all network traffic. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.allowPublicSubnet">allowPublicSubnet</a></code> | <code>boolean</code> | Lambda Functions in a public subnet can NOT access the internet. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.architecture">architecture</a></code> | <code>aws-cdk-lib.aws_lambda.Architecture</code> | The system architectures compatible with this lambda function. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.codeSigningConfig">codeSigningConfig</a></code> | <code>aws-cdk-lib.aws_lambda.ICodeSigningConfig</code> | Code signing config associated with this function. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.currentVersionOptions">currentVersionOptions</a></code> | <code>aws-cdk-lib.aws_lambda.VersionOptions</code> | Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | The SQS queue to use if DLQ is enabled. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.deadLetterQueueEnabled">deadLetterQueueEnabled</a></code> | <code>boolean</code> | Enabled DLQ. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.deadLetterTopic">deadLetterTopic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | The SNS topic to use as a DLQ. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.description">description</a></code> | <code>string</code> | A description of the function. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Key-value pairs that Lambda caches and makes available for your Lambda functions. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.environmentEncryption">environmentEncryption</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | The AWS KMS key that's used to encrypt your function's environment variables. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.ephemeralStorageSize">ephemeralStorageSize</a></code> | <code>aws-cdk-lib.Size</code> | The size of the function’s /tmp directory in MiB. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.events">events</a></code> | <code>aws-cdk-lib.aws_lambda.IEventSource[]</code> | Event sources for this function. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.filesystem">filesystem</a></code> | <code>aws-cdk-lib.aws_lambda.FileSystem</code> | The filesystem configuration for the lambda function. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.functionName">functionName</a></code> | <code>string</code> | A name for the function. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.initialPolicy">initialPolicy</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | Initial policy statements to add to the created Lambda Role. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.insightsVersion">insightsVersion</a></code> | <code>aws-cdk-lib.aws_lambda.LambdaInsightsVersion</code> | Specify the version of CloudWatch Lambda insights to use for monitoring. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.layers">layers</a></code> | <code>aws-cdk-lib.aws_lambda.ILayerVersion[]</code> | A list of layers to add to the function's execution environment. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.logRetention">logRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | The number of days log events are kept in CloudWatch Logs. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.logRetentionRetryOptions">logRetentionRetryOptions</a></code> | <code>aws-cdk-lib.aws_lambda.LogRetentionRetryOptions</code> | When log retention is specified, a custom resource attempts to create the CloudWatch log group. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.logRetentionRole">logRetentionRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | The IAM role for the Lambda function associated with the custom resource that sets the retention policy. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.memorySize">memorySize</a></code> | <code>number</code> | The amount of memory, in MB, that is allocated to your Lambda function. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.profiling">profiling</a></code> | <code>boolean</code> | Enable profiling. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.profilingGroup">profilingGroup</a></code> | <code>aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup</code> | Profiling Group. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.reservedConcurrentExecutions">reservedConcurrentExecutions</a></code> | <code>number</code> | The maximum of concurrent executions you want to reserve for the function. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | Lambda execution role. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.runtimeManagementMode">runtimeManagementMode</a></code> | <code>aws-cdk-lib.aws_lambda.RuntimeManagementMode</code> | Sets the runtime management configuration for a function's version. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.securityGroups">securityGroups</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup[]</code> | The list of security groups to associate with the Lambda's network interfaces. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.timeout">timeout</a></code> | <code>aws-cdk-lib.Duration</code> | The function execution time (in seconds) after which Lambda terminates the function. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.tracing">tracing</a></code> | <code>aws-cdk-lib.aws_lambda.Tracing</code> | Enable AWS X-Ray Tracing for Lambda Function. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | VPC network to place Lambda network interfaces. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.vpcSubnets">vpcSubnets</a></code> | <code>aws-cdk-lib.aws_ec2.SubnetSelection</code> | Where to place the network interfaces within the VPC. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.code">code</a></code> | <code>aws-cdk-lib.aws_lambda.Code</code> | The source code of your Lambda function. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.handler">handler</a></code> | <code>string</code> | The name of the method within your code that Lambda calls to execute your function. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.runtime">runtime</a></code> | <code>aws-cdk-lib.aws_lambda.Runtime</code> | The runtime environment for the Lambda function that you are uploading. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.errorsAlarmThreshold">errorsAlarmThreshold</a></code> | <code>number</code> | Amount of errored function invocations before triggering CloudWatch alarm. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.errorsComparisonOperator">errorsComparisonOperator</a></code> | <code>aws-cdk-lib.aws_cloudwatch.ComparisonOperator</code> | Comparison operator for evaluating alarms. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.errorsEvaluationPeriods">errorsEvaluationPeriods</a></code> | <code>number</code> | The number of periods over which data is compared to the specified threshold. |

---

##### `maxEventAge`<sup>Optional</sup> <a name="maxEventAge" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.maxEventAge"></a>

```typescript
public readonly maxEventAge: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.hours(6)

The maximum age of a request that Lambda sends to a function for processing.

Minimum: 60 seconds
Maximum: 6 hours

---

##### `onFailure`<sup>Optional</sup> <a name="onFailure" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.onFailure"></a>

```typescript
public readonly onFailure: IDestination;
```

- *Type:* aws-cdk-lib.aws_lambda.IDestination
- *Default:* no destination

The destination for failed invocations.

---

##### `onSuccess`<sup>Optional</sup> <a name="onSuccess" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.onSuccess"></a>

```typescript
public readonly onSuccess: IDestination;
```

- *Type:* aws-cdk-lib.aws_lambda.IDestination
- *Default:* no destination

The destination for successful invocations.

---

##### `retryAttempts`<sup>Optional</sup> <a name="retryAttempts" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.retryAttempts"></a>

```typescript
public readonly retryAttempts: number;
```

- *Type:* number
- *Default:* 2

The maximum number of times to retry when the function returns an error.

Minimum: 0
Maximum: 2

---

##### `adotInstrumentation`<sup>Optional</sup> <a name="adotInstrumentation" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.adotInstrumentation"></a>

```typescript
public readonly adotInstrumentation: AdotInstrumentationConfig;
```

- *Type:* aws-cdk-lib.aws_lambda.AdotInstrumentationConfig
- *Default:* No ADOT instrumentation

Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation.

> [https://aws-otel.github.io/docs/getting-started/lambda](https://aws-otel.github.io/docs/getting-started/lambda)

---

##### `allowAllOutbound`<sup>Optional</sup> <a name="allowAllOutbound" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.allowAllOutbound"></a>

```typescript
public readonly allowAllOutbound: boolean;
```

- *Type:* boolean
- *Default:* true

Whether to allow the Lambda to send all network traffic.

If set to false, you must individually add traffic rules to allow the
Lambda to connect to network targets.

---

##### `allowPublicSubnet`<sup>Optional</sup> <a name="allowPublicSubnet" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.allowPublicSubnet"></a>

```typescript
public readonly allowPublicSubnet: boolean;
```

- *Type:* boolean
- *Default:* false

Lambda Functions in a public subnet can NOT access the internet.

Use this property to acknowledge this limitation and still place the function in a public subnet.

> [https://stackoverflow.com/questions/52992085/why-cant-an-aws-lambda-function-inside-a-public-subnet-in-a-vpc-connect-to-the/52994841#52994841](https://stackoverflow.com/questions/52992085/why-cant-an-aws-lambda-function-inside-a-public-subnet-in-a-vpc-connect-to-the/52994841#52994841)

---

##### `architecture`<sup>Optional</sup> <a name="architecture" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.architecture"></a>

```typescript
public readonly architecture: Architecture;
```

- *Type:* aws-cdk-lib.aws_lambda.Architecture
- *Default:* Architecture.X86_64

The system architectures compatible with this lambda function.

---

##### `codeSigningConfig`<sup>Optional</sup> <a name="codeSigningConfig" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.codeSigningConfig"></a>

```typescript
public readonly codeSigningConfig: ICodeSigningConfig;
```

- *Type:* aws-cdk-lib.aws_lambda.ICodeSigningConfig
- *Default:* Not Sign the Code

Code signing config associated with this function.

---

##### `currentVersionOptions`<sup>Optional</sup> <a name="currentVersionOptions" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.currentVersionOptions"></a>

```typescript
public readonly currentVersionOptions: VersionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.VersionOptions
- *Default:* default options as described in `VersionOptions`

Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method.

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue
- *Default:* SQS queue with 14 day retention period if `deadLetterQueueEnabled` is `true`

The SQS queue to use if DLQ is enabled.

If SNS topic is desired, specify `deadLetterTopic` property instead.

---

##### `deadLetterQueueEnabled`<sup>Optional</sup> <a name="deadLetterQueueEnabled" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.deadLetterQueueEnabled"></a>

```typescript
public readonly deadLetterQueueEnabled: boolean;
```

- *Type:* boolean
- *Default:* false unless `deadLetterQueue` is set, which implies DLQ is enabled.

Enabled DLQ.

If `deadLetterQueue` is undefined,
an SQS queue with default options will be defined for your Function.

---

##### `deadLetterTopic`<sup>Optional</sup> <a name="deadLetterTopic" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.deadLetterTopic"></a>

```typescript
public readonly deadLetterTopic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic
- *Default:* no SNS topic

The SNS topic to use as a DLQ.

Note that if `deadLetterQueueEnabled` is set to `true`, an SQS queue will be created
rather than an SNS topic. Using an SNS topic as a DLQ requires this property to be set explicitly.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string
- *Default:* No description.

A description of the function.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* No environment variables.

Key-value pairs that Lambda caches and makes available for your Lambda functions.

Use environment variables to apply configuration changes, such
as test and production environment configurations, without changing your
Lambda function source code.

---

##### `environmentEncryption`<sup>Optional</sup> <a name="environmentEncryption" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.environmentEncryption"></a>

```typescript
public readonly environmentEncryption: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey
- *Default:* AWS Lambda creates and uses an AWS managed customer master key (CMK).

The AWS KMS key that's used to encrypt your function's environment variables.

---

##### `ephemeralStorageSize`<sup>Optional</sup> <a name="ephemeralStorageSize" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.ephemeralStorageSize"></a>

```typescript
public readonly ephemeralStorageSize: Size;
```

- *Type:* aws-cdk-lib.Size
- *Default:* 512 MiB

The size of the function’s /tmp directory in MiB.

---

##### `events`<sup>Optional</sup> <a name="events" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.events"></a>

```typescript
public readonly events: IEventSource[];
```

- *Type:* aws-cdk-lib.aws_lambda.IEventSource[]
- *Default:* No event sources.

Event sources for this function.

You can also add event sources using `addEventSource`.

---

##### `filesystem`<sup>Optional</sup> <a name="filesystem" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.filesystem"></a>

```typescript
public readonly filesystem: FileSystem;
```

- *Type:* aws-cdk-lib.aws_lambda.FileSystem
- *Default:* will not mount any filesystem

The filesystem configuration for the lambda function.

---

##### `functionName`<sup>Optional</sup> <a name="functionName" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.functionName"></a>

```typescript
public readonly functionName: string;
```

- *Type:* string
- *Default:* AWS CloudFormation generates a unique physical ID and uses that ID for the function's name. For more information, see Name Type.

A name for the function.

---

##### `initialPolicy`<sup>Optional</sup> <a name="initialPolicy" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.initialPolicy"></a>

```typescript
public readonly initialPolicy: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]
- *Default:* No policy statements are added to the created Lambda role.

Initial policy statements to add to the created Lambda Role.

You can call `addToRolePolicy` to the created lambda to add statements post creation.

---

##### `insightsVersion`<sup>Optional</sup> <a name="insightsVersion" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.insightsVersion"></a>

```typescript
public readonly insightsVersion: LambdaInsightsVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.LambdaInsightsVersion
- *Default:* No Lambda Insights

Specify the version of CloudWatch Lambda insights to use for monitoring.

> [https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights-Getting-Started-docker.html](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights-Getting-Started-docker.html)

---

##### `layers`<sup>Optional</sup> <a name="layers" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.layers"></a>

```typescript
public readonly layers: ILayerVersion[];
```

- *Type:* aws-cdk-lib.aws_lambda.ILayerVersion[]
- *Default:* No layers.

A list of layers to add to the function's execution environment.

You can configure your Lambda function to pull in
additional code during initialization in the form of layers. Layers are packages of libraries or other dependencies
that can be used by multiple functions.

---

##### `logRetention`<sup>Optional</sup> <a name="logRetention" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.logRetention"></a>

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays
- *Default:* logs.RetentionDays.INFINITE

The number of days log events are kept in CloudWatch Logs.

When updating
this property, unsetting it doesn't remove the log retention policy. To
remove the retention policy, set the value to `INFINITE`.

---

##### `logRetentionRetryOptions`<sup>Optional</sup> <a name="logRetentionRetryOptions" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.logRetentionRetryOptions"></a>

```typescript
public readonly logRetentionRetryOptions: LogRetentionRetryOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.LogRetentionRetryOptions
- *Default:* Default AWS SDK retry options.

When log retention is specified, a custom resource attempts to create the CloudWatch log group.

These options control the retry policy when interacting with CloudWatch APIs.

---

##### `logRetentionRole`<sup>Optional</sup> <a name="logRetentionRole" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.logRetentionRole"></a>

```typescript
public readonly logRetentionRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A new role is created.

The IAM role for the Lambda function associated with the custom resource that sets the retention policy.

---

##### `memorySize`<sup>Optional</sup> <a name="memorySize" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.memorySize"></a>

```typescript
public readonly memorySize: number;
```

- *Type:* number
- *Default:* 128

The amount of memory, in MB, that is allocated to your Lambda function.

Lambda uses this value to proportionally allocate the amount of CPU
power. For more information, see Resource Model in the AWS Lambda
Developer Guide.

---

##### `profiling`<sup>Optional</sup> <a name="profiling" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.profiling"></a>

```typescript
public readonly profiling: boolean;
```

- *Type:* boolean
- *Default:* No profiling.

Enable profiling.

> [https://docs.aws.amazon.com/codeguru/latest/profiler-ug/setting-up-lambda.html](https://docs.aws.amazon.com/codeguru/latest/profiler-ug/setting-up-lambda.html)

---

##### `profilingGroup`<sup>Optional</sup> <a name="profilingGroup" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.profilingGroup"></a>

```typescript
public readonly profilingGroup: IProfilingGroup;
```

- *Type:* aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup
- *Default:* A new profiling group will be created if `profiling` is set.

Profiling Group.

> [https://docs.aws.amazon.com/codeguru/latest/profiler-ug/setting-up-lambda.html](https://docs.aws.amazon.com/codeguru/latest/profiler-ug/setting-up-lambda.html)

---

##### `reservedConcurrentExecutions`<sup>Optional</sup> <a name="reservedConcurrentExecutions" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.reservedConcurrentExecutions"></a>

```typescript
public readonly reservedConcurrentExecutions: number;
```

- *Type:* number
- *Default:* No specific limit - account limit.

The maximum of concurrent executions you want to reserve for the function.

> [https://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html](https://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html)

---

##### `role`<sup>Optional</sup> <a name="role" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A unique role will be generated for this lambda function. Both supplied and generated roles can always be changed by calling `addToRolePolicy`.

Lambda execution role.

This is the role that will be assumed by the function upon execution.
It controls the permissions that the function will have. The Role must
be assumable by the 'lambda.amazonaws.com' service principal.

The default Role automatically has permissions granted for Lambda execution. If you
provide a Role, you must add the relevant AWS managed policies yourself.

The relevant managed policies are "service-role/AWSLambdaBasicExecutionRole" and
"service-role/AWSLambdaVPCAccessExecutionRole".

---

##### `runtimeManagementMode`<sup>Optional</sup> <a name="runtimeManagementMode" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.runtimeManagementMode"></a>

```typescript
public readonly runtimeManagementMode: RuntimeManagementMode;
```

- *Type:* aws-cdk-lib.aws_lambda.RuntimeManagementMode
- *Default:* Auto

Sets the runtime management configuration for a function's version.

---

##### `securityGroups`<sup>Optional</sup> <a name="securityGroups" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.securityGroups"></a>

```typescript
public readonly securityGroups: ISecurityGroup[];
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup[]
- *Default:* If the function is placed within a VPC and a security group is not specified, either by this or securityGroup prop, a dedicated security group will be created for this function.

The list of security groups to associate with the Lambda's network interfaces.

Only used if 'vpc' is supplied.

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.timeout"></a>

```typescript
public readonly timeout: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.seconds(3)

The function execution time (in seconds) after which Lambda terminates the function.

Because the execution time affects cost, set this value
based on the function's expected execution time.

---

##### `tracing`<sup>Optional</sup> <a name="tracing" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.tracing"></a>

```typescript
public readonly tracing: Tracing;
```

- *Type:* aws-cdk-lib.aws_lambda.Tracing
- *Default:* Tracing.Disabled

Enable AWS X-Ray Tracing for Lambda Function.

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc
- *Default:* Function is not placed within a VPC.

VPC network to place Lambda network interfaces.

Specify this if the Lambda function needs to access resources in a VPC.
This is required when `vpcSubnets` is specified.

---

##### `vpcSubnets`<sup>Optional</sup> <a name="vpcSubnets" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.vpcSubnets"></a>

```typescript
public readonly vpcSubnets: SubnetSelection;
```

- *Type:* aws-cdk-lib.aws_ec2.SubnetSelection
- *Default:* the Vpc default strategy if not specified

Where to place the network interfaces within the VPC.

This requires `vpc` to be specified in order for interfaces to actually be
placed in the subnets. If `vpc` is not specify, this will raise an error.

Note: Internet access for Lambda Functions requires a NAT Gateway, so picking
public subnets is not allowed (unless `allowPublicSubnet` is set to `true`).

---

##### `code`<sup>Required</sup> <a name="code" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.code"></a>

```typescript
public readonly code: Code;
```

- *Type:* aws-cdk-lib.aws_lambda.Code

The source code of your Lambda function.

You can point to a file in an
Amazon Simple Storage Service (Amazon S3) bucket or specify your source
code as inline text.

---

##### `handler`<sup>Required</sup> <a name="handler" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.handler"></a>

```typescript
public readonly handler: string;
```

- *Type:* string

The name of the method within your code that Lambda calls to execute your function.

The format includes the file name. It can also include
namespaces and other qualifiers, depending on the runtime.
For more information, see https://docs.aws.amazon.com/lambda/latest/dg/foundation-progmodel.html.

Use `Handler.FROM_IMAGE` when defining a function from a Docker image.

NOTE: If you specify your source code as inline text by specifying the
ZipFile property within the Code property, specify index.function_name as
the handler.

---

##### `runtime`<sup>Required</sup> <a name="runtime" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.runtime"></a>

```typescript
public readonly runtime: Runtime;
```

- *Type:* aws-cdk-lib.aws_lambda.Runtime

The runtime environment for the Lambda function that you are uploading.

For valid values, see the Runtime property in the AWS Lambda Developer
Guide.

Use `Runtime.FROM_IMAGE` when defining a function from a Docker image.

---

##### `errorsAlarmThreshold`<sup>Optional</sup> <a name="errorsAlarmThreshold" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.errorsAlarmThreshold"></a>

```typescript
public readonly errorsAlarmThreshold: number;
```

- *Type:* number
- *Default:* 5

Amount of errored function invocations before triggering CloudWatch alarm.

---

##### `errorsComparisonOperator`<sup>Optional</sup> <a name="errorsComparisonOperator" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.errorsComparisonOperator"></a>

```typescript
public readonly errorsComparisonOperator: ComparisonOperator;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.ComparisonOperator
- *Default:* cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD

Comparison operator for evaluating alarms.

---

##### `errorsEvaluationPeriods`<sup>Optional</sup> <a name="errorsEvaluationPeriods" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.errorsEvaluationPeriods"></a>

```typescript
public readonly errorsEvaluationPeriods: number;
```

- *Type:* number
- *Default:* 1

The number of periods over which data is compared to the specified threshold.

---

### SqsToLambdaStageProps <a name="SqsToLambdaStageProps" id="aws-ddk-core.SqsToLambdaStageProps"></a>

Properties for `SqsToLambdaStage`.

#### Initializer <a name="Initializer" id="aws-ddk-core.SqsToLambdaStageProps.Initializer"></a>

```typescript
import { SqsToLambdaStageProps } from 'aws-ddk-core'

const sqsToLambdaStageProps: SqsToLambdaStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Enable/Disable all alarms in a DataStage. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.batchSize">batchSize</a></code> | <code>number</code> | The maximum number of records retrieved from the event source at the function invocation time. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.dlqEnabled">dlqEnabled</a></code> | <code>boolean</code> | Determines if DLQ is enabled. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.lambdaFunction">lambdaFunction</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | Preexisting Lambda Function to use in stage. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.lambdaFunctionProps">lambdaFunctionProps</a></code> | <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps">SqsToLambdaStageFunctionProps</a></code> | Properties for the Lambda Function that will be created by this construct (if `lambdaFunction` is not provided). |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.maxBatchingWindow">maxBatchingWindow</a></code> | <code>aws-cdk-lib.Duration</code> | The maximum amount of time to gather records before invoking the function. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.maxReceiveCount">maxReceiveCount</a></code> | <code>number</code> | The number of times a message can be unsuccessfully dequeued before being moved to the dead-letter queue. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.messageGroupId">messageGroupId</a></code> | <code>string</code> | Message Group ID for messages sent to this queue. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.sqsQueue">sqsQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | Preexisting SQS Queue to use in stage. |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.sqsQueueProps">sqsQueueProps</a></code> | <code>aws-cdk-lib.aws_sqs.QueueProps</code> | Properties for the SQS Queue that will be created by this construct (if `sqsQueue` is not provided). |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.SqsToLambdaStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.SqsToLambdaStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `alarmsEnabled`<sup>Optional</sup> <a name="alarmsEnabled" id="aws-ddk-core.SqsToLambdaStageProps.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean
- *Default:* true

Enable/Disable all alarms in a DataStage.

---

##### `batchSize`<sup>Optional</sup> <a name="batchSize" id="aws-ddk-core.SqsToLambdaStageProps.property.batchSize"></a>

```typescript
public readonly batchSize: number;
```

- *Type:* number
- *Default:* 10

The maximum number of records retrieved from the event source at the function invocation time.

---

##### `dlqEnabled`<sup>Optional</sup> <a name="dlqEnabled" id="aws-ddk-core.SqsToLambdaStageProps.property.dlqEnabled"></a>

```typescript
public readonly dlqEnabled: boolean;
```

- *Type:* boolean
- *Default:* false

Determines if DLQ is enabled.

---

##### `lambdaFunction`<sup>Optional</sup> <a name="lambdaFunction" id="aws-ddk-core.SqsToLambdaStageProps.property.lambdaFunction"></a>

```typescript
public readonly lambdaFunction: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

Preexisting Lambda Function to use in stage.

If not provided, a new function will be created.

---

##### `lambdaFunctionProps`<sup>Optional</sup> <a name="lambdaFunctionProps" id="aws-ddk-core.SqsToLambdaStageProps.property.lambdaFunctionProps"></a>

```typescript
public readonly lambdaFunctionProps: SqsToLambdaStageFunctionProps;
```

- *Type:* <a href="#aws-ddk-core.SqsToLambdaStageFunctionProps">SqsToLambdaStageFunctionProps</a>

Properties for the Lambda Function that will be created by this construct (if `lambdaFunction` is not provided).

---

##### `maxBatchingWindow`<sup>Optional</sup> <a name="maxBatchingWindow" id="aws-ddk-core.SqsToLambdaStageProps.property.maxBatchingWindow"></a>

```typescript
public readonly maxBatchingWindow: Duration;
```

- *Type:* aws-cdk-lib.Duration

The maximum amount of time to gather records before invoking the function.

Valid Range: Minimum value of 0 minutes, maximum value of 5 minutes.
Default: - no batching window.

---

##### `maxReceiveCount`<sup>Optional</sup> <a name="maxReceiveCount" id="aws-ddk-core.SqsToLambdaStageProps.property.maxReceiveCount"></a>

```typescript
public readonly maxReceiveCount: number;
```

- *Type:* number
- *Default:* 1

The number of times a message can be unsuccessfully dequeued before being moved to the dead-letter queue.

---

##### `messageGroupId`<sup>Optional</sup> <a name="messageGroupId" id="aws-ddk-core.SqsToLambdaStageProps.property.messageGroupId"></a>

```typescript
public readonly messageGroupId: string;
```

- *Type:* string

Message Group ID for messages sent to this queue.

Required for FIFO queues.

---

##### `sqsQueue`<sup>Optional</sup> <a name="sqsQueue" id="aws-ddk-core.SqsToLambdaStageProps.property.sqsQueue"></a>

```typescript
public readonly sqsQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue

Preexisting SQS Queue to use in stage.

If not provided, a new queue will be created.

---

##### `sqsQueueProps`<sup>Optional</sup> <a name="sqsQueueProps" id="aws-ddk-core.SqsToLambdaStageProps.property.sqsQueueProps"></a>

```typescript
public readonly sqsQueueProps: QueueProps;
```

- *Type:* aws-cdk-lib.aws_sqs.QueueProps

Properties for the SQS Queue that will be created by this construct (if `sqsQueue` is not provided).

---

### StageProps <a name="StageProps" id="aws-ddk-core.StageProps"></a>

Properties for the base abstract stage.

#### Initializer <a name="Initializer" id="aws-ddk-core.StageProps.Initializer"></a>

```typescript
import { StageProps } from 'aws-ddk-core'

const stageProps: StageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.StageProps.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.StageProps.property.name">name</a></code> | <code>string</code> | Name of the stage. |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.StageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.StageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

### StateMachineStageProps <a name="StateMachineStageProps" id="aws-ddk-core.StateMachineStageProps"></a>

Properties of a state machine stage.

#### Initializer <a name="Initializer" id="aws-ddk-core.StateMachineStageProps.Initializer"></a>

```typescript
import { StateMachineStageProps } from 'aws-ddk-core'

const stateMachineStageProps: StateMachineStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.StateMachineStageProps.property.description">description</a></code> | <code>string</code> | Description of the stage. |
| <code><a href="#aws-ddk-core.StateMachineStageProps.property.name">name</a></code> | <code>string</code> | Name of the stage. |
| <code><a href="#aws-ddk-core.StateMachineStageProps.property.additionalRolePolicyStatements">additionalRolePolicyStatements</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | Additional IAM policy statements to add to the state machine role. |
| <code><a href="#aws-ddk-core.StateMachineStageProps.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | Enable/Disable all alarms in the stage. |
| <code><a href="#aws-ddk-core.StateMachineStageProps.property.stateMachineFailedExecutionsAlarmEvaluationPeriods">stateMachineFailedExecutionsAlarmEvaluationPeriods</a></code> | <code>number</code> | The number of periods over which data is compared to the specified threshold. |
| <code><a href="#aws-ddk-core.StateMachineStageProps.property.stateMachineFailedExecutionsAlarmThreshold">stateMachineFailedExecutionsAlarmThreshold</a></code> | <code>number</code> | The number of failed state machine executions before triggering CW alarm. |
| <code><a href="#aws-ddk-core.StateMachineStageProps.property.stateMachineInput">stateMachineInput</a></code> | <code>{[ key: string ]: any}</code> | Input of the state machine. |
| <code><a href="#aws-ddk-core.StateMachineStageProps.property.stateMachineName">stateMachineName</a></code> | <code>string</code> | Name of the state machine. |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.StateMachineStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

Description of the stage.

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.StateMachineStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

Name of the stage.

---

##### `additionalRolePolicyStatements`<sup>Optional</sup> <a name="additionalRolePolicyStatements" id="aws-ddk-core.StateMachineStageProps.property.additionalRolePolicyStatements"></a>

```typescript
public readonly additionalRolePolicyStatements: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]

Additional IAM policy statements to add to the state machine role.

---

##### `alarmsEnabled`<sup>Optional</sup> <a name="alarmsEnabled" id="aws-ddk-core.StateMachineStageProps.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean
- *Default:* true

Enable/Disable all alarms in the stage.

---

##### `stateMachineFailedExecutionsAlarmEvaluationPeriods`<sup>Optional</sup> <a name="stateMachineFailedExecutionsAlarmEvaluationPeriods" id="aws-ddk-core.StateMachineStageProps.property.stateMachineFailedExecutionsAlarmEvaluationPeriods"></a>

```typescript
public readonly stateMachineFailedExecutionsAlarmEvaluationPeriods: number;
```

- *Type:* number
- *Default:* 1

The number of periods over which data is compared to the specified threshold.

---

##### `stateMachineFailedExecutionsAlarmThreshold`<sup>Optional</sup> <a name="stateMachineFailedExecutionsAlarmThreshold" id="aws-ddk-core.StateMachineStageProps.property.stateMachineFailedExecutionsAlarmThreshold"></a>

```typescript
public readonly stateMachineFailedExecutionsAlarmThreshold: number;
```

- *Type:* number
- *Default:* 1

The number of failed state machine executions before triggering CW alarm.

---

##### `stateMachineInput`<sup>Optional</sup> <a name="stateMachineInput" id="aws-ddk-core.StateMachineStageProps.property.stateMachineInput"></a>

```typescript
public readonly stateMachineInput: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

Input of the state machine.

---

##### `stateMachineName`<sup>Optional</sup> <a name="stateMachineName" id="aws-ddk-core.StateMachineStageProps.property.stateMachineName"></a>

```typescript
public readonly stateMachineName: string;
```

- *Type:* string

Name of the state machine.

---

### SynthActionProps <a name="SynthActionProps" id="aws-ddk-core.SynthActionProps"></a>

Properties for the synth action.

#### Initializer <a name="Initializer" id="aws-ddk-core.SynthActionProps.Initializer"></a>

```typescript
import { SynthActionProps } from 'aws-ddk-core'

const synthActionProps: SynthActionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.SynthActionProps.property.additionalInstallCommands">additionalInstallCommands</a></code> | <code>string[]</code> | Additional install commands. |
| <code><a href="#aws-ddk-core.SynthActionProps.property.cdkVersion">cdkVersion</a></code> | <code>string</code> | CDK versio to use during the synth action. |
| <code><a href="#aws-ddk-core.SynthActionProps.property.codeartifactDomain">codeartifactDomain</a></code> | <code>string</code> | Name of the CodeArtifact domain. |
| <code><a href="#aws-ddk-core.SynthActionProps.property.codeartifactDomainOwner">codeartifactDomainOwner</a></code> | <code>string</code> | CodeArtifact domain owner account. |
| <code><a href="#aws-ddk-core.SynthActionProps.property.codeartifactRepository">codeartifactRepository</a></code> | <code>string</code> | Name of the CodeArtifact repository to pull artifacts from. |
| <code><a href="#aws-ddk-core.SynthActionProps.property.rolePolicyStatements">rolePolicyStatements</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | Additional policies to add to the synth action role. |
| <code><a href="#aws-ddk-core.SynthActionProps.property.synthAction">synthAction</a></code> | <code>aws-cdk-lib.pipelines.CodeBuildStep</code> | Override synth action. |

---

##### `additionalInstallCommands`<sup>Optional</sup> <a name="additionalInstallCommands" id="aws-ddk-core.SynthActionProps.property.additionalInstallCommands"></a>

```typescript
public readonly additionalInstallCommands: string[];
```

- *Type:* string[]

Additional install commands.

---

##### `cdkVersion`<sup>Optional</sup> <a name="cdkVersion" id="aws-ddk-core.SynthActionProps.property.cdkVersion"></a>

```typescript
public readonly cdkVersion: string;
```

- *Type:* string
- *Default:* "latest"

CDK versio to use during the synth action.

---

##### `codeartifactDomain`<sup>Optional</sup> <a name="codeartifactDomain" id="aws-ddk-core.SynthActionProps.property.codeartifactDomain"></a>

```typescript
public readonly codeartifactDomain: string;
```

- *Type:* string

Name of the CodeArtifact domain.

---

##### `codeartifactDomainOwner`<sup>Optional</sup> <a name="codeartifactDomainOwner" id="aws-ddk-core.SynthActionProps.property.codeartifactDomainOwner"></a>

```typescript
public readonly codeartifactDomainOwner: string;
```

- *Type:* string

CodeArtifact domain owner account.

---

##### `codeartifactRepository`<sup>Optional</sup> <a name="codeartifactRepository" id="aws-ddk-core.SynthActionProps.property.codeartifactRepository"></a>

```typescript
public readonly codeartifactRepository: string;
```

- *Type:* string

Name of the CodeArtifact repository to pull artifacts from.

---

##### `rolePolicyStatements`<sup>Optional</sup> <a name="rolePolicyStatements" id="aws-ddk-core.SynthActionProps.property.rolePolicyStatements"></a>

```typescript
public readonly rolePolicyStatements: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]

Additional policies to add to the synth action role.

---

##### `synthAction`<sup>Optional</sup> <a name="synthAction" id="aws-ddk-core.SynthActionProps.property.synthAction"></a>

```typescript
public readonly synthAction: CodeBuildStep;
```

- *Type:* aws-cdk-lib.pipelines.CodeBuildStep

Override synth action.

---

## Classes <a name="Classes" id="Classes"></a>

### CICDActions <a name="CICDActions" id="aws-ddk-core.CICDActions"></a>

#### Initializers <a name="Initializers" id="aws-ddk-core.CICDActions.Initializer"></a>

```typescript
import { CICDActions } from 'aws-ddk-core'

new CICDActions()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.CICDActions.getBanditAction">getBanditAction</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDActions.getCfnNagAction">getCfnNagAction</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDActions.getCodeArtifactPublishAction">getCodeArtifactPublishAction</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDActions.getCodeCommitSourceAction">getCodeCommitSourceAction</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDActions.getSynthAction">getSynthAction</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDActions.getTestsAction">getTestsAction</a></code> | *No description.* |

---

##### `getBanditAction` <a name="getBanditAction" id="aws-ddk-core.CICDActions.getBanditAction"></a>

```typescript
import { CICDActions } from 'aws-ddk-core'

CICDActions.getBanditAction(codePipelineSource: CodePipelineSource, stageName?: string)
```

###### `codePipelineSource`<sup>Required</sup> <a name="codePipelineSource" id="aws-ddk-core.CICDActions.getBanditAction.parameter.codePipelineSource"></a>

- *Type:* aws-cdk-lib.pipelines.CodePipelineSource

---

###### `stageName`<sup>Optional</sup> <a name="stageName" id="aws-ddk-core.CICDActions.getBanditAction.parameter.stageName"></a>

- *Type:* string

---

##### `getCfnNagAction` <a name="getCfnNagAction" id="aws-ddk-core.CICDActions.getCfnNagAction"></a>

```typescript
import { CICDActions } from 'aws-ddk-core'

CICDActions.getCfnNagAction(fileSetProducer: IFileSetProducer, stageName?: string)
```

###### `fileSetProducer`<sup>Required</sup> <a name="fileSetProducer" id="aws-ddk-core.CICDActions.getCfnNagAction.parameter.fileSetProducer"></a>

- *Type:* aws-cdk-lib.pipelines.IFileSetProducer

---

###### `stageName`<sup>Optional</sup> <a name="stageName" id="aws-ddk-core.CICDActions.getCfnNagAction.parameter.stageName"></a>

- *Type:* string

---

##### `getCodeArtifactPublishAction` <a name="getCodeArtifactPublishAction" id="aws-ddk-core.CICDActions.getCodeArtifactPublishAction"></a>

```typescript
import { CICDActions } from 'aws-ddk-core'

CICDActions.getCodeArtifactPublishAction(partition: string, region: string, account: string, codeartifactRepository: string, codeartifactDomain: string, codeartifactDomainOwner: string, codePipelineSource?: CodePipelineSource, rolePolicyStatements?: PolicyStatement[])
```

###### `partition`<sup>Required</sup> <a name="partition" id="aws-ddk-core.CICDActions.getCodeArtifactPublishAction.parameter.partition"></a>

- *Type:* string

---

###### `region`<sup>Required</sup> <a name="region" id="aws-ddk-core.CICDActions.getCodeArtifactPublishAction.parameter.region"></a>

- *Type:* string

---

###### `account`<sup>Required</sup> <a name="account" id="aws-ddk-core.CICDActions.getCodeArtifactPublishAction.parameter.account"></a>

- *Type:* string

---

###### `codeartifactRepository`<sup>Required</sup> <a name="codeartifactRepository" id="aws-ddk-core.CICDActions.getCodeArtifactPublishAction.parameter.codeartifactRepository"></a>

- *Type:* string

---

###### `codeartifactDomain`<sup>Required</sup> <a name="codeartifactDomain" id="aws-ddk-core.CICDActions.getCodeArtifactPublishAction.parameter.codeartifactDomain"></a>

- *Type:* string

---

###### `codeartifactDomainOwner`<sup>Required</sup> <a name="codeartifactDomainOwner" id="aws-ddk-core.CICDActions.getCodeArtifactPublishAction.parameter.codeartifactDomainOwner"></a>

- *Type:* string

---

###### `codePipelineSource`<sup>Optional</sup> <a name="codePipelineSource" id="aws-ddk-core.CICDActions.getCodeArtifactPublishAction.parameter.codePipelineSource"></a>

- *Type:* aws-cdk-lib.pipelines.CodePipelineSource

---

###### `rolePolicyStatements`<sup>Optional</sup> <a name="rolePolicyStatements" id="aws-ddk-core.CICDActions.getCodeArtifactPublishAction.parameter.rolePolicyStatements"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]

---

##### `getCodeCommitSourceAction` <a name="getCodeCommitSourceAction" id="aws-ddk-core.CICDActions.getCodeCommitSourceAction"></a>

```typescript
import { CICDActions } from 'aws-ddk-core'

CICDActions.getCodeCommitSourceAction(scope: Construct, props: CodeCommitSourceActionProps)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.CICDActions.getCodeCommitSourceAction.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.CICDActions.getCodeCommitSourceAction.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.CodeCommitSourceActionProps">CodeCommitSourceActionProps</a>

---

##### `getSynthAction` <a name="getSynthAction" id="aws-ddk-core.CICDActions.getSynthAction"></a>

```typescript
import { CICDActions } from 'aws-ddk-core'

CICDActions.getSynthAction(props: GetSynthActionProps)
```

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.CICDActions.getSynthAction.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.GetSynthActionProps">GetSynthActionProps</a>

---

##### `getTestsAction` <a name="getTestsAction" id="aws-ddk-core.CICDActions.getTestsAction"></a>

```typescript
import { CICDActions } from 'aws-ddk-core'

CICDActions.getTestsAction(fileSetProducer: IFileSetProducer, commands?: string[], installCommands?: string[], stageName?: string)
```

###### `fileSetProducer`<sup>Required</sup> <a name="fileSetProducer" id="aws-ddk-core.CICDActions.getTestsAction.parameter.fileSetProducer"></a>

- *Type:* aws-cdk-lib.pipelines.IFileSetProducer

---

###### `commands`<sup>Optional</sup> <a name="commands" id="aws-ddk-core.CICDActions.getTestsAction.parameter.commands"></a>

- *Type:* string[]

---

###### `installCommands`<sup>Optional</sup> <a name="installCommands" id="aws-ddk-core.CICDActions.getTestsAction.parameter.installCommands"></a>

- *Type:* string[]

---

###### `stageName`<sup>Optional</sup> <a name="stageName" id="aws-ddk-core.CICDActions.getTestsAction.parameter.stageName"></a>

- *Type:* string

---



### Configurator <a name="Configurator" id="aws-ddk-core.Configurator"></a>

#### Initializers <a name="Initializers" id="aws-ddk-core.Configurator.Initializer"></a>

```typescript
import { Configurator } from 'aws-ddk-core'

new Configurator(scope: Construct, config: string | Configuration, environmentId?: string)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.Configurator.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-ddk-core.Configurator.Initializer.parameter.config">config</a></code> | <code>string \| <a href="#aws-ddk-core.Configuration">Configuration</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.Configurator.Initializer.parameter.environmentId">environmentId</a></code> | <code>string</code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.Configurator.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `config`<sup>Required</sup> <a name="config" id="aws-ddk-core.Configurator.Initializer.parameter.config"></a>

- *Type:* string | <a href="#aws-ddk-core.Configuration">Configuration</a>

---

##### `environmentId`<sup>Optional</sup> <a name="environmentId" id="aws-ddk-core.Configurator.Initializer.parameter.environmentId"></a>

- *Type:* string

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.Configurator.getConfigAttribute">getConfigAttribute</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.Configurator.tagConstruct">tagConstruct</a></code> | *No description.* |

---

##### `getConfigAttribute` <a name="getConfigAttribute" id="aws-ddk-core.Configurator.getConfigAttribute"></a>

```typescript
public getConfigAttribute(attribute: string): any
```

###### `attribute`<sup>Required</sup> <a name="attribute" id="aws-ddk-core.Configurator.getConfigAttribute.parameter.attribute"></a>

- *Type:* string

---

##### `tagConstruct` <a name="tagConstruct" id="aws-ddk-core.Configurator.tagConstruct"></a>

```typescript
public tagConstruct(scope: Construct, tags: {[ key: string ]: string}): void
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.Configurator.tagConstruct.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `tags`<sup>Required</sup> <a name="tags" id="aws-ddk-core.Configurator.tagConstruct.parameter.tags"></a>

- *Type:* {[ key: string ]: string}

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.Configurator.getEnvConfig">getEnvConfig</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.Configurator.getEnvironment">getEnvironment</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.Configurator.getTags">getTags</a></code> | *No description.* |

---

##### `getEnvConfig` <a name="getEnvConfig" id="aws-ddk-core.Configurator.getEnvConfig"></a>

```typescript
import { Configurator } from 'aws-ddk-core'

Configurator.getEnvConfig(props: GetEnvConfigProps)
```

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.Configurator.getEnvConfig.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.GetEnvConfigProps">GetEnvConfigProps</a>

---

##### `getEnvironment` <a name="getEnvironment" id="aws-ddk-core.Configurator.getEnvironment"></a>

```typescript
import { Configurator } from 'aws-ddk-core'

Configurator.getEnvironment(props: GetEnvironmentProps)
```

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.Configurator.getEnvironment.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.GetEnvironmentProps">GetEnvironmentProps</a>

---

##### `getTags` <a name="getTags" id="aws-ddk-core.Configurator.getTags"></a>

```typescript
import { Configurator } from 'aws-ddk-core'

Configurator.getTags(props: GetTagsProps)
```

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.Configurator.getTags.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.GetTagsProps">GetTagsProps</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.Configurator.property.config">config</a></code> | <code><a href="#aws-ddk-core.Configuration">Configuration</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.Configurator.property.environmentId">environmentId</a></code> | <code>string</code> | *No description.* |

---

##### `config`<sup>Required</sup> <a name="config" id="aws-ddk-core.Configurator.property.config"></a>

```typescript
public readonly config: Configuration;
```

- *Type:* <a href="#aws-ddk-core.Configuration">Configuration</a>

---

##### `environmentId`<sup>Optional</sup> <a name="environmentId" id="aws-ddk-core.Configurator.property.environmentId"></a>

```typescript
public readonly environmentId: string;
```

- *Type:* string

---


### GlueFactory <a name="GlueFactory" id="aws-ddk-core.GlueFactory"></a>

#### Initializers <a name="Initializers" id="aws-ddk-core.GlueFactory.Initializer"></a>

```typescript
import { GlueFactory } from 'aws-ddk-core'

new GlueFactory()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.GlueFactory.job">job</a></code> | *No description.* |

---

##### `job` <a name="job" id="aws-ddk-core.GlueFactory.job"></a>

```typescript
import { GlueFactory } from 'aws-ddk-core'

GlueFactory.job(scope: Construct, id: string, props: JobProps)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.GlueFactory.job.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.GlueFactory.job.parameter.id"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.GlueFactory.job.parameter.props"></a>

- *Type:* @aws-cdk/aws-glue-alpha.JobProps

---



### KmsFactory <a name="KmsFactory" id="aws-ddk-core.KmsFactory"></a>

#### Initializers <a name="Initializers" id="aws-ddk-core.KmsFactory.Initializer"></a>

```typescript
import { KmsFactory } from 'aws-ddk-core'

new KmsFactory()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.KmsFactory.key">key</a></code> | *No description.* |

---

##### `key` <a name="key" id="aws-ddk-core.KmsFactory.key"></a>

```typescript
import { KmsFactory } from 'aws-ddk-core'

KmsFactory.key(scope: Construct, id: string, props: KeyProps)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.KmsFactory.key.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.KmsFactory.key.parameter.id"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.KmsFactory.key.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_kms.KeyProps

---



### S3Factory <a name="S3Factory" id="aws-ddk-core.S3Factory"></a>

#### Initializers <a name="Initializers" id="aws-ddk-core.S3Factory.Initializer"></a>

```typescript
import { S3Factory } from 'aws-ddk-core'

new S3Factory()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.S3Factory.bucket">bucket</a></code> | *No description.* |

---

##### `bucket` <a name="bucket" id="aws-ddk-core.S3Factory.bucket"></a>

```typescript
import { S3Factory } from 'aws-ddk-core'

S3Factory.bucket(scope: Construct, id: string, props: BucketProps)
```

###### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.S3Factory.bucket.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.S3Factory.bucket.parameter.id"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.S3Factory.bucket.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_s3.BucketProps

---



### SnsFactory <a name="SnsFactory" id="aws-ddk-core.SnsFactory"></a>

#### Initializers <a name="Initializers" id="aws-ddk-core.SnsFactory.Initializer"></a>

```typescript
import { SnsFactory } from 'aws-ddk-core'

new SnsFactory()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.SnsFactory.secureSnsTopicPolicy">secureSnsTopicPolicy</a></code> | *No description.* |

---

##### `secureSnsTopicPolicy` <a name="secureSnsTopicPolicy" id="aws-ddk-core.SnsFactory.secureSnsTopicPolicy"></a>

```typescript
import { SnsFactory } from 'aws-ddk-core'

SnsFactory.secureSnsTopicPolicy(topic: ITopic)
```

###### `topic`<sup>Required</sup> <a name="topic" id="aws-ddk-core.SnsFactory.secureSnsTopicPolicy.parameter.topic"></a>

- *Type:* aws-cdk-lib.aws_sns.ITopic

---




