# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### DataPipeline <a name="DataPipeline" id="aws-ddk-dev.DataPipeline"></a>

#### Initializers <a name="Initializers" id="aws-ddk-dev.DataPipeline.Initializer"></a>

```typescript
import { DataPipeline } from 'aws-ddk-dev'

new DataPipeline(scope: Construct, id: string, props: DataPipelineProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-dev.DataPipeline.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-ddk-dev.DataPipeline.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-dev.DataPipeline.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-dev.DataPipelineProps">DataPipelineProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-dev.DataPipeline.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-dev.DataPipeline.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-dev.DataPipeline.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-dev.DataPipelineProps">DataPipelineProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-dev.DataPipeline.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-dev.DataPipeline.addNotifications">addNotifications</a></code> | *No description.* |
| <code><a href="#aws-ddk-dev.DataPipeline.addRule">addRule</a></code> | *No description.* |
| <code><a href="#aws-ddk-dev.DataPipeline.addStage">addStage</a></code> | *No description.* |

---

##### `toString` <a name="toString" id="aws-ddk-dev.DataPipeline.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addNotifications` <a name="addNotifications" id="aws-ddk-dev.DataPipeline.addNotifications"></a>

```typescript
public addNotifications(notificationsTopic?: ITopic): DataPipeline
```

###### `notificationsTopic`<sup>Optional</sup> <a name="notificationsTopic" id="aws-ddk-dev.DataPipeline.addNotifications.parameter.notificationsTopic"></a>

- *Type:* aws-cdk-lib.aws_sns.ITopic

---

##### `addRule` <a name="addRule" id="aws-ddk-dev.DataPipeline.addRule"></a>

```typescript
public addRule(props: AddRuleProps): DataPipeline
```

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-dev.DataPipeline.addRule.parameter.props"></a>

- *Type:* <a href="#aws-ddk-dev.AddRuleProps">AddRuleProps</a>

---

##### `addStage` <a name="addStage" id="aws-ddk-dev.DataPipeline.addStage"></a>

```typescript
public addStage(props: AddStageProps): DataPipeline
```

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-dev.DataPipeline.addStage.parameter.props"></a>

- *Type:* <a href="#aws-ddk-dev.AddStageProps">AddStageProps</a>

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-dev.DataPipeline.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-dev.DataPipeline.isConstruct"></a>

```typescript
import { DataPipeline } from 'aws-ddk-dev'

DataPipeline.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-dev.DataPipeline.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-dev.DataPipeline.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-dev.DataPipeline.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-dev.DataPipeline.property.name">name</a></code> | <code>string</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-dev.DataPipeline.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-dev.DataPipeline.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-dev.DataPipeline.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---


### DataStage <a name="DataStage" id="aws-ddk-dev.DataStage"></a>

#### Initializers <a name="Initializers" id="aws-ddk-dev.DataStage.Initializer"></a>

```typescript
import { DataStage } from 'aws-ddk-dev'

new DataStage(scope: Construct, id: string, props: DataStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-dev.DataStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-ddk-dev.DataStage.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-dev.DataStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-dev.DataStageProps">DataStageProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-dev.DataStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-dev.DataStage.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-dev.DataStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-dev.DataStageProps">DataStageProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-dev.DataStage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-dev.DataStage.addAlarm">addAlarm</a></code> | *No description.* |

---

##### `toString` <a name="toString" id="aws-ddk-dev.DataStage.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addAlarm` <a name="addAlarm" id="aws-ddk-dev.DataStage.addAlarm"></a>

```typescript
public addAlarm(id: string, props: AlarmProps): DataStage
```

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-dev.DataStage.addAlarm.parameter.id"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-dev.DataStage.addAlarm.parameter.props"></a>

- *Type:* <a href="#aws-ddk-dev.AlarmProps">AlarmProps</a>

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-dev.DataStage.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-dev.DataStage.isConstruct"></a>

```typescript
import { DataStage } from 'aws-ddk-dev'

DataStage.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-dev.DataStage.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-dev.DataStage.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-dev.DataStage.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-dev.DataStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | *No description.* |
| <code><a href="#aws-ddk-dev.DataStage.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-dev.DataStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | *No description.* |
| <code><a href="#aws-ddk-dev.DataStage.property.cloudwatchAlarms">cloudwatchAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm[]</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-dev.DataStage.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-dev.DataStage.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-dev.DataStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-dev.DataStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-dev.DataStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

---

##### `cloudwatchAlarms`<sup>Required</sup> <a name="cloudwatchAlarms" id="aws-ddk-dev.DataStage.property.cloudwatchAlarms"></a>

```typescript
public readonly cloudwatchAlarms: Alarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm[]

---


### SqsToLambdaStage <a name="SqsToLambdaStage" id="aws-ddk-dev.SqsToLambdaStage"></a>

#### Initializers <a name="Initializers" id="aws-ddk-dev.SqsToLambdaStage.Initializer"></a>

```typescript
import { SqsToLambdaStage } from 'aws-ddk-dev'

new SqsToLambdaStage(scope: Construct, id: string, props: SqsToLambdaStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-dev.SqsToLambdaStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStage.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-dev.SqsToLambdaStageProps">SqsToLambdaStageProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-dev.SqsToLambdaStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-dev.SqsToLambdaStage.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-dev.SqsToLambdaStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-dev.SqsToLambdaStageProps">SqsToLambdaStageProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-dev.SqsToLambdaStage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-dev.SqsToLambdaStage.addAlarm">addAlarm</a></code> | *No description.* |

---

##### `toString` <a name="toString" id="aws-ddk-dev.SqsToLambdaStage.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addAlarm` <a name="addAlarm" id="aws-ddk-dev.SqsToLambdaStage.addAlarm"></a>

```typescript
public addAlarm(id: string, props: AlarmProps): DataStage
```

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-dev.SqsToLambdaStage.addAlarm.parameter.id"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-dev.SqsToLambdaStage.addAlarm.parameter.props"></a>

- *Type:* <a href="#aws-ddk-dev.AlarmProps">AlarmProps</a>

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-dev.SqsToLambdaStage.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-dev.SqsToLambdaStage.isConstruct"></a>

```typescript
import { SqsToLambdaStage } from 'aws-ddk-dev'

SqsToLambdaStage.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-dev.SqsToLambdaStage.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-dev.SqsToLambdaStage.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-dev.SqsToLambdaStage.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStage.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStage.property.cloudwatchAlarms">cloudwatchAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm[]</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStage.property.function">function</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStage.property.queue">queue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStage.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.Queue</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-dev.SqsToLambdaStage.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-dev.SqsToLambdaStage.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-dev.SqsToLambdaStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-dev.SqsToLambdaStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-dev.SqsToLambdaStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

---

##### `cloudwatchAlarms`<sup>Required</sup> <a name="cloudwatchAlarms" id="aws-ddk-dev.SqsToLambdaStage.property.cloudwatchAlarms"></a>

```typescript
public readonly cloudwatchAlarms: Alarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm[]

---

##### `function`<sup>Required</sup> <a name="function" id="aws-ddk-dev.SqsToLambdaStage.property.function"></a>

```typescript
public readonly function: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

---

##### `queue`<sup>Required</sup> <a name="queue" id="aws-ddk-dev.SqsToLambdaStage.property.queue"></a>

```typescript
public readonly queue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="aws-ddk-dev.SqsToLambdaStage.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: Queue;
```

- *Type:* aws-cdk-lib.aws_sqs.Queue

---


### Stage <a name="Stage" id="aws-ddk-dev.Stage"></a>

#### Initializers <a name="Initializers" id="aws-ddk-dev.Stage.Initializer"></a>

```typescript
import { Stage } from 'aws-ddk-dev'

new Stage(scope: Construct, id: string, props: StageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-dev.Stage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-ddk-dev.Stage.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-dev.Stage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-dev.StageProps">StageProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-dev.Stage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-dev.Stage.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-dev.Stage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-dev.StageProps">StageProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-dev.Stage.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="aws-ddk-dev.Stage.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-dev.Stage.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="aws-ddk-dev.Stage.isConstruct"></a>

```typescript
import { Stage } from 'aws-ddk-dev'

Stage.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="aws-ddk-dev.Stage.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-dev.Stage.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#aws-ddk-dev.Stage.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-dev.Stage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | *No description.* |
| <code><a href="#aws-ddk-dev.Stage.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-dev.Stage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="aws-ddk-dev.Stage.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-dev.Stage.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-dev.Stage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-dev.Stage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-dev.Stage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

---


## Structs <a name="Structs" id="Structs"></a>

### AddRuleProps <a name="AddRuleProps" id="aws-ddk-dev.AddRuleProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-dev.AddRuleProps.Initializer"></a>

```typescript
import { AddRuleProps } from 'aws-ddk-dev'

const addRuleProps: AddRuleProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-dev.AddRuleProps.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | *No description.* |
| <code><a href="#aws-ddk-dev.AddRuleProps.property.eventTargets">eventTargets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | *No description.* |
| <code><a href="#aws-ddk-dev.AddRuleProps.property.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-dev.AddRuleProps.property.overrideRule">overrideRule</a></code> | <code>aws-cdk-lib.aws_events.IRule</code> | *No description.* |

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-dev.AddRuleProps.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

---

##### `eventTargets`<sup>Optional</sup> <a name="eventTargets" id="aws-ddk-dev.AddRuleProps.property.eventTargets"></a>

```typescript
public readonly eventTargets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

---

##### `id`<sup>Optional</sup> <a name="id" id="aws-ddk-dev.AddRuleProps.property.id"></a>

```typescript
public readonly id: string;
```

- *Type:* string

---

##### `overrideRule`<sup>Optional</sup> <a name="overrideRule" id="aws-ddk-dev.AddRuleProps.property.overrideRule"></a>

```typescript
public readonly overrideRule: IRule;
```

- *Type:* aws-cdk-lib.aws_events.IRule

---

### AddStageProps <a name="AddStageProps" id="aws-ddk-dev.AddStageProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-dev.AddStageProps.Initializer"></a>

```typescript
import { AddStageProps } from 'aws-ddk-dev'

const addStageProps: AddStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-dev.AddStageProps.property.stage">stage</a></code> | <code><a href="#aws-ddk-dev.DataStage">DataStage</a></code> | *No description.* |
| <code><a href="#aws-ddk-dev.AddStageProps.property.overrideRule">overrideRule</a></code> | <code>aws-cdk-lib.aws_events.IRule</code> | *No description.* |
| <code><a href="#aws-ddk-dev.AddStageProps.property.skipRule">skipRule</a></code> | <code>boolean</code> | *No description.* |

---

##### `stage`<sup>Required</sup> <a name="stage" id="aws-ddk-dev.AddStageProps.property.stage"></a>

```typescript
public readonly stage: DataStage;
```

- *Type:* <a href="#aws-ddk-dev.DataStage">DataStage</a>

---

##### `overrideRule`<sup>Optional</sup> <a name="overrideRule" id="aws-ddk-dev.AddStageProps.property.overrideRule"></a>

```typescript
public readonly overrideRule: IRule;
```

- *Type:* aws-cdk-lib.aws_events.IRule

---

##### `skipRule`<sup>Optional</sup> <a name="skipRule" id="aws-ddk-dev.AddStageProps.property.skipRule"></a>

```typescript
public readonly skipRule: boolean;
```

- *Type:* boolean

---

### AlarmProps <a name="AlarmProps" id="aws-ddk-dev.AlarmProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-dev.AlarmProps.Initializer"></a>

```typescript
import { AlarmProps } from 'aws-ddk-dev'

const alarmProps: AlarmProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-dev.AlarmProps.property.metric">metric</a></code> | <code>aws-cdk-lib.aws_cloudwatch.IMetric</code> | *No description.* |
| <code><a href="#aws-ddk-dev.AlarmProps.property.comparisonOperator">comparisonOperator</a></code> | <code>aws-cdk-lib.aws_cloudwatch.ComparisonOperator</code> | *No description.* |
| <code><a href="#aws-ddk-dev.AlarmProps.property.evaluationPeriods">evaluationPeriods</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-ddk-dev.AlarmProps.property.threshold">threshold</a></code> | <code>number</code> | *No description.* |

---

##### `metric`<sup>Required</sup> <a name="metric" id="aws-ddk-dev.AlarmProps.property.metric"></a>

```typescript
public readonly metric: IMetric;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.IMetric

---

##### `comparisonOperator`<sup>Optional</sup> <a name="comparisonOperator" id="aws-ddk-dev.AlarmProps.property.comparisonOperator"></a>

```typescript
public readonly comparisonOperator: ComparisonOperator;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.ComparisonOperator

---

##### `evaluationPeriods`<sup>Optional</sup> <a name="evaluationPeriods" id="aws-ddk-dev.AlarmProps.property.evaluationPeriods"></a>

```typescript
public readonly evaluationPeriods: number;
```

- *Type:* number

---

##### `threshold`<sup>Optional</sup> <a name="threshold" id="aws-ddk-dev.AlarmProps.property.threshold"></a>

```typescript
public readonly threshold: number;
```

- *Type:* number

---

### DataPipelineProps <a name="DataPipelineProps" id="aws-ddk-dev.DataPipelineProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-dev.DataPipelineProps.Initializer"></a>

```typescript
import { DataPipelineProps } from 'aws-ddk-dev'

const dataPipelineProps: DataPipelineProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-dev.DataPipelineProps.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-dev.DataPipelineProps.property.name">name</a></code> | <code>string</code> | *No description.* |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-dev.DataPipelineProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-dev.DataPipelineProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

### DataStageProps <a name="DataStageProps" id="aws-ddk-dev.DataStageProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-dev.DataStageProps.Initializer"></a>

```typescript
import { DataStageProps } from 'aws-ddk-dev'

const dataStageProps: DataStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-dev.DataStageProps.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-dev.DataStageProps.property.name">name</a></code> | <code>string</code> | *No description.* |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-dev.DataStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-dev.DataStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

### SqsToLambdaStageFunctionProps <a name="SqsToLambdaStageFunctionProps" id="aws-ddk-dev.SqsToLambdaStageFunctionProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-dev.SqsToLambdaStageFunctionProps.Initializer"></a>

```typescript
import { SqsToLambdaStageFunctionProps } from 'aws-ddk-dev'

const sqsToLambdaStageFunctionProps: SqsToLambdaStageFunctionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageFunctionProps.property.code">code</a></code> | <code>aws-cdk-lib.aws_lambda.Code</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageFunctionProps.property.handler">handler</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageFunctionProps.property.errorsAlarmThreshold">errorsAlarmThreshold</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageFunctionProps.property.errorsEvaluationPeriods">errorsEvaluationPeriods</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageFunctionProps.property.layers">layers</a></code> | <code>aws-cdk-lib.aws_lambda.ILayerVersion[]</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageFunctionProps.property.memorySize">memorySize</a></code> | <code>aws-cdk-lib.Size</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageFunctionProps.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.Role</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageFunctionProps.property.runtime">runtime</a></code> | <code>aws-cdk-lib.aws_lambda.Runtime</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageFunctionProps.property.timeout">timeout</a></code> | <code>aws-cdk-lib.Duration</code> | *No description.* |

---

##### `code`<sup>Required</sup> <a name="code" id="aws-ddk-dev.SqsToLambdaStageFunctionProps.property.code"></a>

```typescript
public readonly code: Code;
```

- *Type:* aws-cdk-lib.aws_lambda.Code

---

##### `handler`<sup>Required</sup> <a name="handler" id="aws-ddk-dev.SqsToLambdaStageFunctionProps.property.handler"></a>

```typescript
public readonly handler: string;
```

- *Type:* string

---

##### `errorsAlarmThreshold`<sup>Optional</sup> <a name="errorsAlarmThreshold" id="aws-ddk-dev.SqsToLambdaStageFunctionProps.property.errorsAlarmThreshold"></a>

```typescript
public readonly errorsAlarmThreshold: number;
```

- *Type:* number

---

##### `errorsEvaluationPeriods`<sup>Optional</sup> <a name="errorsEvaluationPeriods" id="aws-ddk-dev.SqsToLambdaStageFunctionProps.property.errorsEvaluationPeriods"></a>

```typescript
public readonly errorsEvaluationPeriods: number;
```

- *Type:* number

---

##### `layers`<sup>Optional</sup> <a name="layers" id="aws-ddk-dev.SqsToLambdaStageFunctionProps.property.layers"></a>

```typescript
public readonly layers: ILayerVersion[];
```

- *Type:* aws-cdk-lib.aws_lambda.ILayerVersion[]

---

##### `memorySize`<sup>Optional</sup> <a name="memorySize" id="aws-ddk-dev.SqsToLambdaStageFunctionProps.property.memorySize"></a>

```typescript
public readonly memorySize: Size;
```

- *Type:* aws-cdk-lib.Size

---

##### `role`<sup>Optional</sup> <a name="role" id="aws-ddk-dev.SqsToLambdaStageFunctionProps.property.role"></a>

```typescript
public readonly role: Role;
```

- *Type:* aws-cdk-lib.aws_iam.Role

---

##### `runtime`<sup>Optional</sup> <a name="runtime" id="aws-ddk-dev.SqsToLambdaStageFunctionProps.property.runtime"></a>

```typescript
public readonly runtime: Runtime;
```

- *Type:* aws-cdk-lib.aws_lambda.Runtime

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="aws-ddk-dev.SqsToLambdaStageFunctionProps.property.timeout"></a>

```typescript
public readonly timeout: Duration;
```

- *Type:* aws-cdk-lib.Duration

---

### SqsToLambdaStageProps <a name="SqsToLambdaStageProps" id="aws-ddk-dev.SqsToLambdaStageProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-dev.SqsToLambdaStageProps.Initializer"></a>

```typescript
import { SqsToLambdaStageProps } from 'aws-ddk-dev'

const sqsToLambdaStageProps: SqsToLambdaStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageProps.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageProps.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageProps.property.batchSize">batchSize</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageProps.property.dlqEnabled">dlqEnabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageProps.property.lambdaFunction">lambdaFunction</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageProps.property.lambdaFunctionProps">lambdaFunctionProps</a></code> | <code><a href="#aws-ddk-dev.SqsToLambdaStageFunctionProps">SqsToLambdaStageFunctionProps</a></code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageProps.property.maxReceiveCount">maxReceiveCount</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageProps.property.sqsQueue">sqsQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | *No description.* |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageProps.property.sqsQueueProps">sqsQueueProps</a></code> | <code><a href="#aws-ddk-dev.SqsToLambdaStageQueueProps">SqsToLambdaStageQueueProps</a></code> | *No description.* |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-dev.SqsToLambdaStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-dev.SqsToLambdaStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `batchSize`<sup>Optional</sup> <a name="batchSize" id="aws-ddk-dev.SqsToLambdaStageProps.property.batchSize"></a>

```typescript
public readonly batchSize: number;
```

- *Type:* number

---

##### `dlqEnabled`<sup>Optional</sup> <a name="dlqEnabled" id="aws-ddk-dev.SqsToLambdaStageProps.property.dlqEnabled"></a>

```typescript
public readonly dlqEnabled: boolean;
```

- *Type:* boolean

---

##### `lambdaFunction`<sup>Optional</sup> <a name="lambdaFunction" id="aws-ddk-dev.SqsToLambdaStageProps.property.lambdaFunction"></a>

```typescript
public readonly lambdaFunction: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

---

##### `lambdaFunctionProps`<sup>Optional</sup> <a name="lambdaFunctionProps" id="aws-ddk-dev.SqsToLambdaStageProps.property.lambdaFunctionProps"></a>

```typescript
public readonly lambdaFunctionProps: SqsToLambdaStageFunctionProps;
```

- *Type:* <a href="#aws-ddk-dev.SqsToLambdaStageFunctionProps">SqsToLambdaStageFunctionProps</a>

---

##### `maxReceiveCount`<sup>Optional</sup> <a name="maxReceiveCount" id="aws-ddk-dev.SqsToLambdaStageProps.property.maxReceiveCount"></a>

```typescript
public readonly maxReceiveCount: number;
```

- *Type:* number

---

##### `sqsQueue`<sup>Optional</sup> <a name="sqsQueue" id="aws-ddk-dev.SqsToLambdaStageProps.property.sqsQueue"></a>

```typescript
public readonly sqsQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue

---

##### `sqsQueueProps`<sup>Optional</sup> <a name="sqsQueueProps" id="aws-ddk-dev.SqsToLambdaStageProps.property.sqsQueueProps"></a>

```typescript
public readonly sqsQueueProps: SqsToLambdaStageQueueProps;
```

- *Type:* <a href="#aws-ddk-dev.SqsToLambdaStageQueueProps">SqsToLambdaStageQueueProps</a>

---

### SqsToLambdaStageQueueProps <a name="SqsToLambdaStageQueueProps" id="aws-ddk-dev.SqsToLambdaStageQueueProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-dev.SqsToLambdaStageQueueProps.Initializer"></a>

```typescript
import { SqsToLambdaStageQueueProps } from 'aws-ddk-dev'

const sqsToLambdaStageQueueProps: SqsToLambdaStageQueueProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-dev.SqsToLambdaStageQueueProps.property.visibilityTimeout">visibilityTimeout</a></code> | <code>aws-cdk-lib.Duration</code> | *No description.* |

---

##### `visibilityTimeout`<sup>Optional</sup> <a name="visibilityTimeout" id="aws-ddk-dev.SqsToLambdaStageQueueProps.property.visibilityTimeout"></a>

```typescript
public readonly visibilityTimeout: Duration;
```

- *Type:* aws-cdk-lib.Duration

---

### StageProps <a name="StageProps" id="aws-ddk-dev.StageProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-dev.StageProps.Initializer"></a>

```typescript
import { StageProps } from 'aws-ddk-dev'

const stageProps: StageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-dev.StageProps.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-dev.StageProps.property.name">name</a></code> | <code>string</code> | *No description.* |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-dev.StageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-dev.StageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---



