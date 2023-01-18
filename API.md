# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### AthenaSQLStage <a name="AthenaSQLStage" id="aws-ddk-core.AthenaSQLStage"></a>

#### Initializers <a name="Initializers" id="aws-ddk-core.AthenaSQLStage.Initializer"></a>

```typescript
import { AthenaSQLStage } from 'aws-ddk-core'

new AthenaSQLStage(scope: Construct, id: string, props: AthenaToSQLStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AthenaSQLStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaSQLStage.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaSQLStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.AthenaToSQLStageProps">AthenaToSQLStageProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.AthenaSQLStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.AthenaSQLStage.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.AthenaSQLStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AthenaToSQLStageProps">AthenaToSQLStageProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.AthenaSQLStage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.AthenaSQLStage.addAlarm">addAlarm</a></code> | *No description.* |

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

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.AthenaSQLStage.addAlarm.parameter.id"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.AthenaSQLStage.addAlarm.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AlarmProps">AlarmProps</a>

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
| <code><a href="#aws-ddk-core.AthenaSQLStage.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaSQLStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaSQLStage.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaSQLStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaSQLStage.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaSQLStage.property.cloudwatchAlarms">cloudwatchAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaSQLStage.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.StateMachine</code> | *No description.* |

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

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.AthenaSQLStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.AthenaSQLStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.AthenaSQLStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

---

##### `alarmsEnabled`<sup>Required</sup> <a name="alarmsEnabled" id="aws-ddk-core.AthenaSQLStage.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

---

##### `cloudwatchAlarms`<sup>Required</sup> <a name="cloudwatchAlarms" id="aws-ddk-core.AthenaSQLStage.property.cloudwatchAlarms"></a>

```typescript
public readonly cloudwatchAlarms: Alarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm[]

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="aws-ddk-core.AthenaSQLStage.property.stateMachine"></a>

```typescript
public readonly stateMachine: StateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.StateMachine

---


### CICDPipelineStack <a name="CICDPipelineStack" id="aws-ddk-core.CICDPipelineStack"></a>

#### Initializers <a name="Initializers" id="aws-ddk-core.CICDPipelineStack.Initializer"></a>

```typescript
import { CICDPipelineStack } from 'aws-ddk-core'

new CICDPipelineStack(scope: Construct, id: string, props: CICDPipelineStackProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.CICDPipelineStack.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.CICDPipelineStackProps">CICDPipelineStackProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.CICDPipelineStack.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.CICDPipelineStack.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.CICDPipelineStackProps">CICDPipelineStackProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.CICDPipelineStack.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addDependency">addDependency</a></code> | Add a dependency between this stack and another stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addTransform">addTransform</a></code> | Add a Transform to this stack. A Transform is a macro that AWS CloudFormation uses to process your template. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.exportValue">exportValue</a></code> | Create a CloudFormation Export for a value. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.formatArn">formatArn</a></code> | Creates an ARN from components. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.getLogicalId">getLogicalId</a></code> | Allocates a stack-unique CloudFormation-compatible logical identity for a specific resource. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.regionalFact">regionalFact</a></code> | Look up a fact value for the given fact for the region of this stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.renameLogicalId">renameLogicalId</a></code> | Rename a generated logical identities. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.reportMissingContextKey">reportMissingContextKey</a></code> | Indicate that a context key was expected. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.resolve">resolve</a></code> | Resolve a tokenized value in the context of the current stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.splitArn">splitArn</a></code> | Splits the provided ARN into its components. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.toJsonString">toJsonString</a></code> | Convert an object, potentially containing tokens, to a JSON string. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addCustomStage">addCustomStage</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addNotifications">addNotifications</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addSecurityLintStage">addSecurityLintStage</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addSourceAction">addSourceAction</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addStage">addStage</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addSynthAction">addSynthAction</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addTestStage">addTestStage</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.addWave">addWave</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.buildPipeline">buildPipeline</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.synth">synth</a></code> | *No description.* |

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

##### `exportValue` <a name="exportValue" id="aws-ddk-core.CICDPipelineStack.exportValue"></a>

```typescript
public exportValue(exportedValue: any, options?: ExportValueOptions): string
```

Create a CloudFormation Export for a value.

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

## Example

Here is how the process works. Let's say there are two stacks,
`producerStack` and `consumerStack`, and `producerStack` has a bucket
called `bucket`, which is referenced by `consumerStack` (perhaps because
an AWS Lambda Function writes into it, or something like that).

It is not safe to remove `producerStack.bucket` because as the bucket is being
deleted, `consumerStack` might still be using it.

Instead, the process takes two deployments:

### Deployment 1: break the relationship

- Make sure `consumerStack` no longer references `bucket.bucketName` (maybe the consumer
   stack now uses its own bucket, or it writes to an AWS DynamoDB table, or maybe you just
   remove the Lambda Function altogether).
- In the `ProducerStack` class, call `this.exportValue(this.bucket.bucketName)`. This
   will make sure the CloudFormation Export continues to exist while the relationship
   between the two stacks is being broken.
- Deploy (this will effectively only change the `consumerStack`, but it's safe to deploy both).

### Deployment 2: remove the bucket resource

- You are now free to remove the `bucket` resource from `producerStack`.
- Don't forget to remove the `exportValue()` call as well.
- Deploy again (this time only the `producerStack` will be changed -- the bucket will be deleted).

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

##### `addCustomStage` <a name="addCustomStage" id="aws-ddk-core.CICDPipelineStack.addCustomStage"></a>

```typescript
public addCustomStage(props: AddCustomStageProps): CICDPipelineStack
```

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.addCustomStage.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AddCustomStageProps">AddCustomStageProps</a>

---

##### `addNotifications` <a name="addNotifications" id="aws-ddk-core.CICDPipelineStack.addNotifications"></a>

```typescript
public addNotifications(props?: AddNotificationsProps): CICDPipelineStack
```

###### `props`<sup>Optional</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.addNotifications.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AddNotificationsProps">AddNotificationsProps</a>

---

##### `addSecurityLintStage` <a name="addSecurityLintStage" id="aws-ddk-core.CICDPipelineStack.addSecurityLintStage"></a>

```typescript
public addSecurityLintStage(props: AddSecurityLintStageProps): CICDPipelineStack
```

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.addSecurityLintStage.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AddSecurityLintStageProps">AddSecurityLintStageProps</a>

---

##### `addSourceAction` <a name="addSourceAction" id="aws-ddk-core.CICDPipelineStack.addSourceAction"></a>

```typescript
public addSourceAction(props: SourceActionProps): CICDPipelineStack
```

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.addSourceAction.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.SourceActionProps">SourceActionProps</a>

---

##### `addStage` <a name="addStage" id="aws-ddk-core.CICDPipelineStack.addStage"></a>

```typescript
public addStage(props: AddApplicationStageProps): CICDPipelineStack
```

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.addStage.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AddApplicationStageProps">AddApplicationStageProps</a>

---

##### `addSynthAction` <a name="addSynthAction" id="aws-ddk-core.CICDPipelineStack.addSynthAction"></a>

```typescript
public addSynthAction(props?: SynthActionProps): CICDPipelineStack
```

###### `props`<sup>Optional</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.addSynthAction.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.SynthActionProps">SynthActionProps</a>

---

##### `addTestStage` <a name="addTestStage" id="aws-ddk-core.CICDPipelineStack.addTestStage"></a>

```typescript
public addTestStage(props: AddTestStageProps): CICDPipelineStack
```

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.addTestStage.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AddTestStageProps">AddTestStageProps</a>

---

##### `addWave` <a name="addWave" id="aws-ddk-core.CICDPipelineStack.addWave"></a>

```typescript
public addWave(props: AddApplicationWaveProps): CICDPipelineStack
```

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.addWave.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AddApplicationWaveProps">AddApplicationWaveProps</a>

---

##### `buildPipeline` <a name="buildPipeline" id="aws-ddk-core.CICDPipelineStack.buildPipeline"></a>

```typescript
public buildPipeline(props?: AdditionalPipelineProps): CICDPipelineStack
```

###### `props`<sup>Optional</sup> <a name="props" id="aws-ddk-core.CICDPipelineStack.buildPipeline.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AdditionalPipelineProps">AdditionalPipelineProps</a>

---

##### `synth` <a name="synth" id="aws-ddk-core.CICDPipelineStack.synth"></a>

```typescript
public synth(): CICDPipelineStack
```

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.CICDPipelineStack.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.isStack">isStack</a></code> | Return whether the given object is a Stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStack.of">of</a></code> | Looks up the first stack scope in which `construct` is defined. |

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
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.environmentId">environmentId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.pipelineId">pipelineId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.pipelineName">pipelineName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.notificationRule">notificationRule</a></code> | <code>aws-cdk-lib.aws_codestarnotifications.NotificationRule</code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.pipeline">pipeline</a></code> | <code>aws-cdk-lib.pipelines.CodePipeline</code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStack.property.pipelineKey">pipelineKey</a></code> | <code>constructs.IConstruct</code> | *No description.* |
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
check that it is a concerete value an not an unresolved token. If this
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
    either be a concerete region (e.g. `us-west-2`) or the `Aws.REGION`
    token.
3. `Aws.REGION`, which is represents the CloudFormation intrinsic reference
    `{ "Ref": "AWS::Region" }` encoded as a string token.

Preferably, you should use the return value as an opaque string and not
attempt to parse it to implement your logic. If you do, you must first
check that it is a concerete value an not an unresolved token. If this
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
public readonly pipelineKey: IConstruct;
```

- *Type:* constructs.IConstruct

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

#### Initializers <a name="Initializers" id="aws-ddk-core.DataStage.Initializer"></a>

```typescript
import { DataStage } from 'aws-ddk-core'

new DataStage(scope: Construct, id: string, props: DataStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.DataStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-ddk-core.DataStage.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.DataStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.DataStageProps">DataStageProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.DataStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.DataStage.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.DataStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.DataStageProps">DataStageProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.DataStage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.DataStage.addAlarm">addAlarm</a></code> | *No description.* |

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

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.DataStage.addAlarm.parameter.id"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.DataStage.addAlarm.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AlarmProps">AlarmProps</a>

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
| <code><a href="#aws-ddk-core.DataStage.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.DataStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | *No description.* |
| <code><a href="#aws-ddk-core.DataStage.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.DataStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.DataStage.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.DataStage.property.cloudwatchAlarms">cloudwatchAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm[]</code> | *No description.* |

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

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.DataStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.DataStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.DataStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

---

##### `alarmsEnabled`<sup>Required</sup> <a name="alarmsEnabled" id="aws-ddk-core.DataStage.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

---

##### `cloudwatchAlarms`<sup>Required</sup> <a name="cloudwatchAlarms" id="aws-ddk-core.DataStage.property.cloudwatchAlarms"></a>

```typescript
public readonly cloudwatchAlarms: Alarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm[]

---


### EventStage <a name="EventStage" id="aws-ddk-core.EventStage"></a>

#### Initializers <a name="Initializers" id="aws-ddk-core.EventStage.Initializer"></a>

```typescript
import { EventStage } from 'aws-ddk-core'

new EventStage(scope: Construct, id: string, props: EventStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.EventStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-ddk-core.EventStage.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.EventStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.EventStageProps">EventStageProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.EventStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.EventStage.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.EventStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.EventStageProps">EventStageProps</a>

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
| <code><a href="#aws-ddk-core.EventStage.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.EventStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | *No description.* |
| <code><a href="#aws-ddk-core.EventStage.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.EventStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | *No description.* |

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

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.EventStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.EventStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.EventStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

---


### FirehoseToS3Stage <a name="FirehoseToS3Stage" id="aws-ddk-core.FirehoseToS3Stage"></a>

#### Initializers <a name="Initializers" id="aws-ddk-core.FirehoseToS3Stage.Initializer"></a>

```typescript
import { FirehoseToS3Stage } from 'aws-ddk-core'

new FirehoseToS3Stage(scope: Construct, id: string, props: FirehoseToS3StageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.FirehoseToS3StageProps">FirehoseToS3StageProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.FirehoseToS3Stage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.FirehoseToS3Stage.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.FirehoseToS3Stage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.FirehoseToS3StageProps">FirehoseToS3StageProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.addAlarm">addAlarm</a></code> | *No description.* |

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

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.FirehoseToS3Stage.addAlarm.parameter.id"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.FirehoseToS3Stage.addAlarm.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AlarmProps">AlarmProps</a>

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
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | *No description.* |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.FirehoseToS3Stage.property.cloudwatchAlarms">cloudwatchAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm[]</code> | *No description.* |
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

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.FirehoseToS3Stage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.FirehoseToS3Stage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.FirehoseToS3Stage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

---

##### `alarmsEnabled`<sup>Required</sup> <a name="alarmsEnabled" id="aws-ddk-core.FirehoseToS3Stage.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

---

##### `cloudwatchAlarms`<sup>Required</sup> <a name="cloudwatchAlarms" id="aws-ddk-core.FirehoseToS3Stage.property.cloudwatchAlarms"></a>

```typescript
public readonly cloudwatchAlarms: Alarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm[]

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

#### Initializers <a name="Initializers" id="aws-ddk-core.GlueTransformStage.Initializer"></a>

```typescript
import { GlueTransformStage } from 'aws-ddk-core'

new GlueTransformStage(scope: Construct, id: string, props: GlueTransformStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.GlueTransformStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-ddk-core.GlueTransformStage.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.GlueTransformStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.GlueTransformStageProps">GlueTransformStageProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.GlueTransformStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.GlueTransformStage.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.GlueTransformStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.GlueTransformStageProps">GlueTransformStageProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.GlueTransformStage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.GlueTransformStage.addAlarm">addAlarm</a></code> | *No description.* |

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

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.GlueTransformStage.addAlarm.parameter.id"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.GlueTransformStage.addAlarm.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AlarmProps">AlarmProps</a>

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
| <code><a href="#aws-ddk-core.GlueTransformStage.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.GlueTransformStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | *No description.* |
| <code><a href="#aws-ddk-core.GlueTransformStage.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.GlueTransformStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.GlueTransformStage.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.GlueTransformStage.property.cloudwatchAlarms">cloudwatchAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.GlueTransformStage.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.StateMachine</code> | *No description.* |

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

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.GlueTransformStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.GlueTransformStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.GlueTransformStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

---

##### `alarmsEnabled`<sup>Required</sup> <a name="alarmsEnabled" id="aws-ddk-core.GlueTransformStage.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

---

##### `cloudwatchAlarms`<sup>Required</sup> <a name="cloudwatchAlarms" id="aws-ddk-core.GlueTransformStage.property.cloudwatchAlarms"></a>

```typescript
public readonly cloudwatchAlarms: Alarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm[]

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="aws-ddk-core.GlueTransformStage.property.stateMachine"></a>

```typescript
public readonly stateMachine: StateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.StateMachine

---


### S3EventStage <a name="S3EventStage" id="aws-ddk-core.S3EventStage"></a>

#### Initializers <a name="Initializers" id="aws-ddk-core.S3EventStage.Initializer"></a>

```typescript
import { S3EventStage } from 'aws-ddk-core'

new S3EventStage(scope: Construct, id: string, props: S3EventStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.S3EventStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-ddk-core.S3EventStage.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.S3EventStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.S3EventStageProps">S3EventStageProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.S3EventStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.S3EventStage.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.S3EventStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.S3EventStageProps">S3EventStageProps</a>

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
| <code><a href="#aws-ddk-core.S3EventStage.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.S3EventStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | *No description.* |
| <code><a href="#aws-ddk-core.S3EventStage.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.S3EventStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | *No description.* |

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

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.S3EventStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.S3EventStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.S3EventStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

---


### SqsToLambdaStage <a name="SqsToLambdaStage" id="aws-ddk-core.SqsToLambdaStage"></a>

#### Initializers <a name="Initializers" id="aws-ddk-core.SqsToLambdaStage.Initializer"></a>

```typescript
import { SqsToLambdaStage } from 'aws-ddk-core'

new SqsToLambdaStage(scope: Construct, id: string, props: SqsToLambdaStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.SqsToLambdaStageProps">SqsToLambdaStageProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.SqsToLambdaStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.SqsToLambdaStage.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.SqsToLambdaStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.SqsToLambdaStageProps">SqsToLambdaStageProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.addAlarm">addAlarm</a></code> | *No description.* |

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

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.SqsToLambdaStage.addAlarm.parameter.id"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.SqsToLambdaStage.addAlarm.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AlarmProps">AlarmProps</a>

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
| <code><a href="#aws-ddk-core.SqsToLambdaStage.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStage.property.cloudwatchAlarms">cloudwatchAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm[]</code> | *No description.* |
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

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.SqsToLambdaStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.SqsToLambdaStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.SqsToLambdaStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

---

##### `alarmsEnabled`<sup>Required</sup> <a name="alarmsEnabled" id="aws-ddk-core.SqsToLambdaStage.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

---

##### `cloudwatchAlarms`<sup>Required</sup> <a name="cloudwatchAlarms" id="aws-ddk-core.SqsToLambdaStage.property.cloudwatchAlarms"></a>

```typescript
public readonly cloudwatchAlarms: Alarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm[]

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

#### Initializers <a name="Initializers" id="aws-ddk-core.Stage.Initializer"></a>

```typescript
import { Stage } from 'aws-ddk-core'

new Stage(scope: Construct, id: string, props: StageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.Stage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-ddk-core.Stage.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.Stage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.StageProps">StageProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.Stage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.Stage.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.Stage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.StageProps">StageProps</a>

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
| <code><a href="#aws-ddk-core.Stage.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.Stage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | *No description.* |
| <code><a href="#aws-ddk-core.Stage.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.Stage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | *No description.* |

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

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.Stage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.Stage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.Stage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

---


### StateMachineStage <a name="StateMachineStage" id="aws-ddk-core.StateMachineStage"></a>

#### Initializers <a name="Initializers" id="aws-ddk-core.StateMachineStage.Initializer"></a>

```typescript
import { StateMachineStage } from 'aws-ddk-core'

new StateMachineStage(scope: Construct, id: string, props: StateMachineStageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.StateMachineStage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#aws-ddk-core.StateMachineStage.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.StateMachineStage.Initializer.parameter.props">props</a></code> | <code><a href="#aws-ddk-core.StateMachineStageProps">StateMachineStageProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="aws-ddk-core.StateMachineStage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.StateMachineStage.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.StateMachineStage.Initializer.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.StateMachineStageProps">StateMachineStageProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#aws-ddk-core.StateMachineStage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#aws-ddk-core.StateMachineStage.addAlarm">addAlarm</a></code> | *No description.* |

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

###### `id`<sup>Required</sup> <a name="id" id="aws-ddk-core.StateMachineStage.addAlarm.parameter.id"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="aws-ddk-core.StateMachineStage.addAlarm.parameter.props"></a>

- *Type:* <a href="#aws-ddk-core.AlarmProps">AlarmProps</a>

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
| <code><a href="#aws-ddk-core.StateMachineStage.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.StateMachineStage.property.eventPattern">eventPattern</a></code> | <code>aws-cdk-lib.aws_events.EventPattern</code> | *No description.* |
| <code><a href="#aws-ddk-core.StateMachineStage.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.StateMachineStage.property.targets">targets</a></code> | <code>aws-cdk-lib.aws_events.IRuleTarget[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.StateMachineStage.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.StateMachineStage.property.cloudwatchAlarms">cloudwatchAlarms</a></code> | <code>aws-cdk-lib.aws_cloudwatch.Alarm[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.StateMachineStage.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.StateMachine</code> | *No description.* |

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

---

##### `eventPattern`<sup>Optional</sup> <a name="eventPattern" id="aws-ddk-core.StateMachineStage.property.eventPattern"></a>

```typescript
public readonly eventPattern: EventPattern;
```

- *Type:* aws-cdk-lib.aws_events.EventPattern

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.StateMachineStage.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `targets`<sup>Optional</sup> <a name="targets" id="aws-ddk-core.StateMachineStage.property.targets"></a>

```typescript
public readonly targets: IRuleTarget[];
```

- *Type:* aws-cdk-lib.aws_events.IRuleTarget[]

---

##### `alarmsEnabled`<sup>Required</sup> <a name="alarmsEnabled" id="aws-ddk-core.StateMachineStage.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

---

##### `cloudwatchAlarms`<sup>Required</sup> <a name="cloudwatchAlarms" id="aws-ddk-core.StateMachineStage.property.cloudwatchAlarms"></a>

```typescript
public readonly cloudwatchAlarms: Alarm[];
```

- *Type:* aws-cdk-lib.aws_cloudwatch.Alarm[]

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="aws-ddk-core.StateMachineStage.property.stateMachine"></a>

```typescript
public readonly stateMachine: StateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.StateMachine

---


## Structs <a name="Structs" id="Structs"></a>

### AddApplicationStageProps <a name="AddApplicationStageProps" id="aws-ddk-core.AddApplicationStageProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.AddApplicationStageProps.Initializer"></a>

```typescript
import { AddApplicationStageProps } from 'aws-ddk-core'

const addApplicationStageProps: AddApplicationStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AddApplicationStageProps.property.stage">stage</a></code> | <code>aws-cdk-lib.Stage</code> | *No description.* |
| <code><a href="#aws-ddk-core.AddApplicationStageProps.property.stageId">stageId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.AddApplicationStageProps.property.manualApprovals">manualApprovals</a></code> | <code>boolean</code> | *No description.* |

---

##### `stage`<sup>Required</sup> <a name="stage" id="aws-ddk-core.AddApplicationStageProps.property.stage"></a>

```typescript
public readonly stage: Stage;
```

- *Type:* aws-cdk-lib.Stage

---

##### `stageId`<sup>Required</sup> <a name="stageId" id="aws-ddk-core.AddApplicationStageProps.property.stageId"></a>

```typescript
public readonly stageId: string;
```

- *Type:* string

---

##### `manualApprovals`<sup>Optional</sup> <a name="manualApprovals" id="aws-ddk-core.AddApplicationStageProps.property.manualApprovals"></a>

```typescript
public readonly manualApprovals: boolean;
```

- *Type:* boolean

---

### AddApplicationWaveProps <a name="AddApplicationWaveProps" id="aws-ddk-core.AddApplicationWaveProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.AddApplicationWaveProps.Initializer"></a>

```typescript
import { AddApplicationWaveProps } from 'aws-ddk-core'

const addApplicationWaveProps: AddApplicationWaveProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AddApplicationWaveProps.property.stageId">stageId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.AddApplicationWaveProps.property.stages">stages</a></code> | <code>aws-cdk-lib.Stage[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.AddApplicationWaveProps.property.manualApprovals">manualApprovals</a></code> | <code>boolean</code> | *No description.* |

---

##### `stageId`<sup>Required</sup> <a name="stageId" id="aws-ddk-core.AddApplicationWaveProps.property.stageId"></a>

```typescript
public readonly stageId: string;
```

- *Type:* string

---

##### `stages`<sup>Required</sup> <a name="stages" id="aws-ddk-core.AddApplicationWaveProps.property.stages"></a>

```typescript
public readonly stages: Stage[];
```

- *Type:* aws-cdk-lib.Stage[]

---

##### `manualApprovals`<sup>Optional</sup> <a name="manualApprovals" id="aws-ddk-core.AddApplicationWaveProps.property.manualApprovals"></a>

```typescript
public readonly manualApprovals: boolean;
```

- *Type:* boolean

---

### AddCustomStageProps <a name="AddCustomStageProps" id="aws-ddk-core.AddCustomStageProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.AddCustomStageProps.Initializer"></a>

```typescript
import { AddCustomStageProps } from 'aws-ddk-core'

const addCustomStageProps: AddCustomStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AddCustomStageProps.property.stageName">stageName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.AddCustomStageProps.property.steps">steps</a></code> | <code>aws-cdk-lib.pipelines.Step[]</code> | *No description.* |

---

##### `stageName`<sup>Required</sup> <a name="stageName" id="aws-ddk-core.AddCustomStageProps.property.stageName"></a>

```typescript
public readonly stageName: string;
```

- *Type:* string

---

##### `steps`<sup>Required</sup> <a name="steps" id="aws-ddk-core.AddCustomStageProps.property.steps"></a>

```typescript
public readonly steps: Step[];
```

- *Type:* aws-cdk-lib.pipelines.Step[]

---

### AdditionalPipelineProps <a name="AdditionalPipelineProps" id="aws-ddk-core.AdditionalPipelineProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.AdditionalPipelineProps.Initializer"></a>

```typescript
import { AdditionalPipelineProps } from 'aws-ddk-core'

const additionalPipelineProps: AdditionalPipelineProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.assetPublishingCodeBuildDefaults">assetPublishingCodeBuildDefaults</a></code> | <code>aws-cdk-lib.pipelines.CodeBuildOptions</code> | *No description.* |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.cliVersion">cliVersion</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.codeBuildDefaults">codeBuildDefaults</a></code> | <code>aws-cdk-lib.pipelines.CodeBuildOptions</code> | *No description.* |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.codePipeline">codePipeline</a></code> | <code>aws-cdk-lib.aws_codepipeline.Pipeline</code> | *No description.* |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.dockerCredentials">dockerCredentials</a></code> | <code>aws-cdk-lib.pipelines.DockerCredential[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.dockerEnabledForSelfMutation">dockerEnabledForSelfMutation</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.dockerEnabledForSynth">dockerEnabledForSynth</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.publishAssetsInParallel">publishAssetsInParallel</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.reuseCrossRegionSupportStacks">reuseCrossRegionSupportStacks</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.selfMutation">selfMutation</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.selfMutationCodeBuildDefaults">selfMutationCodeBuildDefaults</a></code> | <code>aws-cdk-lib.pipelines.CodeBuildOptions</code> | *No description.* |
| <code><a href="#aws-ddk-core.AdditionalPipelineProps.property.synthCodeBuildDefaults">synthCodeBuildDefaults</a></code> | <code>aws-cdk-lib.pipelines.CodeBuildOptions</code> | *No description.* |

---

##### `assetPublishingCodeBuildDefaults`<sup>Optional</sup> <a name="assetPublishingCodeBuildDefaults" id="aws-ddk-core.AdditionalPipelineProps.property.assetPublishingCodeBuildDefaults"></a>

```typescript
public readonly assetPublishingCodeBuildDefaults: CodeBuildOptions;
```

- *Type:* aws-cdk-lib.pipelines.CodeBuildOptions

---

##### `cliVersion`<sup>Optional</sup> <a name="cliVersion" id="aws-ddk-core.AdditionalPipelineProps.property.cliVersion"></a>

```typescript
public readonly cliVersion: string;
```

- *Type:* string

---

##### `codeBuildDefaults`<sup>Optional</sup> <a name="codeBuildDefaults" id="aws-ddk-core.AdditionalPipelineProps.property.codeBuildDefaults"></a>

```typescript
public readonly codeBuildDefaults: CodeBuildOptions;
```

- *Type:* aws-cdk-lib.pipelines.CodeBuildOptions

---

##### `codePipeline`<sup>Optional</sup> <a name="codePipeline" id="aws-ddk-core.AdditionalPipelineProps.property.codePipeline"></a>

```typescript
public readonly codePipeline: Pipeline;
```

- *Type:* aws-cdk-lib.aws_codepipeline.Pipeline

---

##### `dockerCredentials`<sup>Optional</sup> <a name="dockerCredentials" id="aws-ddk-core.AdditionalPipelineProps.property.dockerCredentials"></a>

```typescript
public readonly dockerCredentials: DockerCredential[];
```

- *Type:* aws-cdk-lib.pipelines.DockerCredential[]

---

##### `dockerEnabledForSelfMutation`<sup>Optional</sup> <a name="dockerEnabledForSelfMutation" id="aws-ddk-core.AdditionalPipelineProps.property.dockerEnabledForSelfMutation"></a>

```typescript
public readonly dockerEnabledForSelfMutation: boolean;
```

- *Type:* boolean

---

##### `dockerEnabledForSynth`<sup>Optional</sup> <a name="dockerEnabledForSynth" id="aws-ddk-core.AdditionalPipelineProps.property.dockerEnabledForSynth"></a>

```typescript
public readonly dockerEnabledForSynth: boolean;
```

- *Type:* boolean

---

##### `publishAssetsInParallel`<sup>Optional</sup> <a name="publishAssetsInParallel" id="aws-ddk-core.AdditionalPipelineProps.property.publishAssetsInParallel"></a>

```typescript
public readonly publishAssetsInParallel: boolean;
```

- *Type:* boolean

---

##### `reuseCrossRegionSupportStacks`<sup>Optional</sup> <a name="reuseCrossRegionSupportStacks" id="aws-ddk-core.AdditionalPipelineProps.property.reuseCrossRegionSupportStacks"></a>

```typescript
public readonly reuseCrossRegionSupportStacks: boolean;
```

- *Type:* boolean

---

##### `selfMutation`<sup>Optional</sup> <a name="selfMutation" id="aws-ddk-core.AdditionalPipelineProps.property.selfMutation"></a>

```typescript
public readonly selfMutation: boolean;
```

- *Type:* boolean

---

##### `selfMutationCodeBuildDefaults`<sup>Optional</sup> <a name="selfMutationCodeBuildDefaults" id="aws-ddk-core.AdditionalPipelineProps.property.selfMutationCodeBuildDefaults"></a>

```typescript
public readonly selfMutationCodeBuildDefaults: CodeBuildOptions;
```

- *Type:* aws-cdk-lib.pipelines.CodeBuildOptions

---

##### `synthCodeBuildDefaults`<sup>Optional</sup> <a name="synthCodeBuildDefaults" id="aws-ddk-core.AdditionalPipelineProps.property.synthCodeBuildDefaults"></a>

```typescript
public readonly synthCodeBuildDefaults: CodeBuildOptions;
```

- *Type:* aws-cdk-lib.pipelines.CodeBuildOptions

---

### AddNotificationsProps <a name="AddNotificationsProps" id="aws-ddk-core.AddNotificationsProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.AddNotificationsProps.Initializer"></a>

```typescript
import { AddNotificationsProps } from 'aws-ddk-core'

const addNotificationsProps: AddNotificationsProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AddNotificationsProps.property.notificationRule">notificationRule</a></code> | <code>aws-cdk-lib.aws_codestarnotifications.NotificationRule</code> | *No description.* |

---

##### `notificationRule`<sup>Optional</sup> <a name="notificationRule" id="aws-ddk-core.AddNotificationsProps.property.notificationRule"></a>

```typescript
public readonly notificationRule: NotificationRule;
```

- *Type:* aws-cdk-lib.aws_codestarnotifications.NotificationRule

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

### AddSecurityLintStageProps <a name="AddSecurityLintStageProps" id="aws-ddk-core.AddSecurityLintStageProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.AddSecurityLintStageProps.Initializer"></a>

```typescript
import { AddSecurityLintStageProps } from 'aws-ddk-core'

const addSecurityLintStageProps: AddSecurityLintStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AddSecurityLintStageProps.property.cloudAssemblyFileSet">cloudAssemblyFileSet</a></code> | <code>aws-cdk-lib.pipelines.IFileSetProducer</code> | *No description.* |
| <code><a href="#aws-ddk-core.AddSecurityLintStageProps.property.stageName">stageName</a></code> | <code>string</code> | *No description.* |

---

##### `cloudAssemblyFileSet`<sup>Optional</sup> <a name="cloudAssemblyFileSet" id="aws-ddk-core.AddSecurityLintStageProps.property.cloudAssemblyFileSet"></a>

```typescript
public readonly cloudAssemblyFileSet: IFileSetProducer;
```

- *Type:* aws-cdk-lib.pipelines.IFileSetProducer

---

##### `stageName`<sup>Optional</sup> <a name="stageName" id="aws-ddk-core.AddSecurityLintStageProps.property.stageName"></a>

```typescript
public readonly stageName: string;
```

- *Type:* string

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

##### `skipRule`<sup>Optional</sup> <a name="skipRule" id="aws-ddk-core.AddStageProps.property.skipRule"></a>

```typescript
public readonly skipRule: boolean;
```

- *Type:* boolean

---

### AddTestStageProps <a name="AddTestStageProps" id="aws-ddk-core.AddTestStageProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.AddTestStageProps.Initializer"></a>

```typescript
import { AddTestStageProps } from 'aws-ddk-core'

const addTestStageProps: AddTestStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AddTestStageProps.property.cloudAssemblyFileSet">cloudAssemblyFileSet</a></code> | <code>aws-cdk-lib.pipelines.IFileSetProducer</code> | *No description.* |
| <code><a href="#aws-ddk-core.AddTestStageProps.property.commands">commands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.AddTestStageProps.property.stageName">stageName</a></code> | <code>string</code> | *No description.* |

---

##### `cloudAssemblyFileSet`<sup>Optional</sup> <a name="cloudAssemblyFileSet" id="aws-ddk-core.AddTestStageProps.property.cloudAssemblyFileSet"></a>

```typescript
public readonly cloudAssemblyFileSet: IFileSetProducer;
```

- *Type:* aws-cdk-lib.pipelines.IFileSetProducer

---

##### `commands`<sup>Optional</sup> <a name="commands" id="aws-ddk-core.AddTestStageProps.property.commands"></a>

```typescript
public readonly commands: string[];
```

- *Type:* string[]

---

##### `stageName`<sup>Optional</sup> <a name="stageName" id="aws-ddk-core.AddTestStageProps.property.stageName"></a>

```typescript
public readonly stageName: string;
```

- *Type:* string

---

### AlarmProps <a name="AlarmProps" id="aws-ddk-core.AlarmProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.AlarmProps.Initializer"></a>

```typescript
import { AlarmProps } from 'aws-ddk-core'

const alarmProps: AlarmProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AlarmProps.property.metric">metric</a></code> | <code>aws-cdk-lib.aws_cloudwatch.IMetric</code> | *No description.* |
| <code><a href="#aws-ddk-core.AlarmProps.property.comparisonOperator">comparisonOperator</a></code> | <code>aws-cdk-lib.aws_cloudwatch.ComparisonOperator</code> | *No description.* |
| <code><a href="#aws-ddk-core.AlarmProps.property.evaluationPeriods">evaluationPeriods</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-ddk-core.AlarmProps.property.threshold">threshold</a></code> | <code>number</code> | *No description.* |

---

##### `metric`<sup>Required</sup> <a name="metric" id="aws-ddk-core.AlarmProps.property.metric"></a>

```typescript
public readonly metric: IMetric;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.IMetric

---

##### `comparisonOperator`<sup>Optional</sup> <a name="comparisonOperator" id="aws-ddk-core.AlarmProps.property.comparisonOperator"></a>

```typescript
public readonly comparisonOperator: ComparisonOperator;
```

- *Type:* aws-cdk-lib.aws_cloudwatch.ComparisonOperator

---

##### `evaluationPeriods`<sup>Optional</sup> <a name="evaluationPeriods" id="aws-ddk-core.AlarmProps.property.evaluationPeriods"></a>

```typescript
public readonly evaluationPeriods: number;
```

- *Type:* number

---

##### `threshold`<sup>Optional</sup> <a name="threshold" id="aws-ddk-core.AlarmProps.property.threshold"></a>

```typescript
public readonly threshold: number;
```

- *Type:* number

---

### AthenaToSQLStageProps <a name="AthenaToSQLStageProps" id="aws-ddk-core.AthenaToSQLStageProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.AthenaToSQLStageProps.Initializer"></a>

```typescript
import { AthenaToSQLStageProps } from 'aws-ddk-core'

const athenaToSQLStageProps: AthenaToSQLStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.additionalRolePolicyStatements">additionalRolePolicyStatements</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.stateMachineFailedExecutionsAlarmEvaluationPeriods">stateMachineFailedExecutionsAlarmEvaluationPeriods</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.stateMachineFailedExecutionsAlarmThreshold">stateMachineFailedExecutionsAlarmThreshold</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.stateMachineInput">stateMachineInput</a></code> | <code>{[ key: string ]: any}</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.queryString">queryString</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.catalogName">catalogName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.databaseName">databaseName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.Key</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.encryptionOption">encryptionOption</a></code> | <code>aws-cdk-lib.aws_stepfunctions_tasks.EncryptionOption</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.outputLocation">outputLocation</a></code> | <code>aws-cdk-lib.aws_s3.Location</code> | *No description.* |
| <code><a href="#aws-ddk-core.AthenaToSQLStageProps.property.workGroup">workGroup</a></code> | <code>string</code> | *No description.* |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.AthenaToSQLStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.AthenaToSQLStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `additionalRolePolicyStatements`<sup>Optional</sup> <a name="additionalRolePolicyStatements" id="aws-ddk-core.AthenaToSQLStageProps.property.additionalRolePolicyStatements"></a>

```typescript
public readonly additionalRolePolicyStatements: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]

---

##### `alarmsEnabled`<sup>Optional</sup> <a name="alarmsEnabled" id="aws-ddk-core.AthenaToSQLStageProps.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

---

##### `stateMachineFailedExecutionsAlarmEvaluationPeriods`<sup>Optional</sup> <a name="stateMachineFailedExecutionsAlarmEvaluationPeriods" id="aws-ddk-core.AthenaToSQLStageProps.property.stateMachineFailedExecutionsAlarmEvaluationPeriods"></a>

```typescript
public readonly stateMachineFailedExecutionsAlarmEvaluationPeriods: number;
```

- *Type:* number

---

##### `stateMachineFailedExecutionsAlarmThreshold`<sup>Optional</sup> <a name="stateMachineFailedExecutionsAlarmThreshold" id="aws-ddk-core.AthenaToSQLStageProps.property.stateMachineFailedExecutionsAlarmThreshold"></a>

```typescript
public readonly stateMachineFailedExecutionsAlarmThreshold: number;
```

- *Type:* number

---

##### `stateMachineInput`<sup>Optional</sup> <a name="stateMachineInput" id="aws-ddk-core.AthenaToSQLStageProps.property.stateMachineInput"></a>

```typescript
public readonly stateMachineInput: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

---

##### `queryString`<sup>Required</sup> <a name="queryString" id="aws-ddk-core.AthenaToSQLStageProps.property.queryString"></a>

```typescript
public readonly queryString: string;
```

- *Type:* string

---

##### `catalogName`<sup>Optional</sup> <a name="catalogName" id="aws-ddk-core.AthenaToSQLStageProps.property.catalogName"></a>

```typescript
public readonly catalogName: string;
```

- *Type:* string

---

##### `databaseName`<sup>Optional</sup> <a name="databaseName" id="aws-ddk-core.AthenaToSQLStageProps.property.databaseName"></a>

```typescript
public readonly databaseName: string;
```

- *Type:* string

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="aws-ddk-core.AthenaToSQLStageProps.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: Key;
```

- *Type:* aws-cdk-lib.aws_kms.Key

---

##### `encryptionOption`<sup>Optional</sup> <a name="encryptionOption" id="aws-ddk-core.AthenaToSQLStageProps.property.encryptionOption"></a>

```typescript
public readonly encryptionOption: EncryptionOption;
```

- *Type:* aws-cdk-lib.aws_stepfunctions_tasks.EncryptionOption

---

##### `outputLocation`<sup>Optional</sup> <a name="outputLocation" id="aws-ddk-core.AthenaToSQLStageProps.property.outputLocation"></a>

```typescript
public readonly outputLocation: Location;
```

- *Type:* aws-cdk-lib.aws_s3.Location

---

##### `workGroup`<sup>Optional</sup> <a name="workGroup" id="aws-ddk-core.AthenaToSQLStageProps.property.workGroup"></a>

```typescript
public readonly workGroup: string;
```

- *Type:* string

---

### CICDPipelineStackProps <a name="CICDPipelineStackProps" id="aws-ddk-core.CICDPipelineStackProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.CICDPipelineStackProps.Initializer"></a>

```typescript
import { CICDPipelineStackProps } from 'aws-ddk-core'

const cICDPipelineStackProps: CICDPipelineStackProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.analyticsReporting">analyticsReporting</a></code> | <code>boolean</code> | Include runtime versioning information in this Stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.description">description</a></code> | <code>string</code> | A description of the stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.env">env</a></code> | <code>aws-cdk-lib.Environment</code> | The AWS environment (account/region) where this stack will be deployed. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.stackName">stackName</a></code> | <code>string</code> | Name to deploy the stack with. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.synthesizer">synthesizer</a></code> | <code>aws-cdk-lib.IStackSynthesizer</code> | Synthesis method to use while deploying this stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.tags">tags</a></code> | <code>{[ key: string ]: string}</code> | Stack tags that will be applied to all the taggable resources and the stack itself. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.terminationProtection">terminationProtection</a></code> | <code>boolean</code> | Whether to enable termination protection for this stack. |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.environmentId">environmentId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.CICDPipelineStackProps.property.pipelineName">pipelineName</a></code> | <code>string</code> | *No description.* |

---

##### `analyticsReporting`<sup>Optional</sup> <a name="analyticsReporting" id="aws-ddk-core.CICDPipelineStackProps.property.analyticsReporting"></a>

```typescript
public readonly analyticsReporting: boolean;
```

- *Type:* boolean
- *Default:* `analyticsReporting` setting of containing `App`, or value of 'aws:cdk:version-reporting' context key

Include runtime versioning information in this Stack.

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
- *Default:* `DefaultStackSynthesizer` if the `@aws-cdk/core:newStyleStackSynthesis` feature flag is set, `LegacyStackSynthesizer` otherwise.

Synthesis method to use while deploying this stack.

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

##### `environmentId`<sup>Optional</sup> <a name="environmentId" id="aws-ddk-core.CICDPipelineStackProps.property.environmentId"></a>

```typescript
public readonly environmentId: string;
```

- *Type:* string

---

##### `pipelineName`<sup>Optional</sup> <a name="pipelineName" id="aws-ddk-core.CICDPipelineStackProps.property.pipelineName"></a>

```typescript
public readonly pipelineName: string;
```

- *Type:* string

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

#### Initializer <a name="Initializer" id="aws-ddk-core.DataStageProps.Initializer"></a>

```typescript
import { DataStageProps } from 'aws-ddk-core'

const dataStageProps: DataStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.DataStageProps.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.DataStageProps.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.DataStageProps.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | *No description.* |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.DataStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.DataStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `alarmsEnabled`<sup>Optional</sup> <a name="alarmsEnabled" id="aws-ddk-core.DataStageProps.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

---

### EventStageProps <a name="EventStageProps" id="aws-ddk-core.EventStageProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.EventStageProps.Initializer"></a>

```typescript
import { EventStageProps } from 'aws-ddk-core'

const eventStageProps: EventStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.EventStageProps.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.EventStageProps.property.name">name</a></code> | <code>string</code> | *No description.* |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.EventStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.EventStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

### FirehoseToS3StageProps <a name="FirehoseToS3StageProps" id="aws-ddk-core.FirehoseToS3StageProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.FirehoseToS3StageProps.Initializer"></a>

```typescript
import { FirehoseToS3StageProps } from 'aws-ddk-core'

const firehoseToS3StageProps: FirehoseToS3StageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.dataOutputPrefix">dataOutputPrefix</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.dataStreamEnabled">dataStreamEnabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.deliveryStreamDataFreshnessErrorsAlarmThreshold">deliveryStreamDataFreshnessErrorsAlarmThreshold</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.deliveryStreamDataFreshnessErrorsEvaluationPeriods">deliveryStreamDataFreshnessErrorsEvaluationPeriods</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.kinesisFirehoseDestinationsS3BucketProps">kinesisFirehoseDestinationsS3BucketProps</a></code> | <code>@aws-cdk/aws-kinesisfirehose-destinations-alpha.S3BucketProps</code> | *No description.* |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.s3Bucket">s3Bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | *No description.* |
| <code><a href="#aws-ddk-core.FirehoseToS3StageProps.property.s3BucketProps">s3BucketProps</a></code> | <code>aws-cdk-lib.aws_s3.BucketProps</code> | *No description.* |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.FirehoseToS3StageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.FirehoseToS3StageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `alarmsEnabled`<sup>Optional</sup> <a name="alarmsEnabled" id="aws-ddk-core.FirehoseToS3StageProps.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

---

##### `dataOutputPrefix`<sup>Optional</sup> <a name="dataOutputPrefix" id="aws-ddk-core.FirehoseToS3StageProps.property.dataOutputPrefix"></a>

```typescript
public readonly dataOutputPrefix: string;
```

- *Type:* string

---

##### `dataStreamEnabled`<sup>Optional</sup> <a name="dataStreamEnabled" id="aws-ddk-core.FirehoseToS3StageProps.property.dataStreamEnabled"></a>

```typescript
public readonly dataStreamEnabled: boolean;
```

- *Type:* boolean

---

##### `deliveryStreamDataFreshnessErrorsAlarmThreshold`<sup>Optional</sup> <a name="deliveryStreamDataFreshnessErrorsAlarmThreshold" id="aws-ddk-core.FirehoseToS3StageProps.property.deliveryStreamDataFreshnessErrorsAlarmThreshold"></a>

```typescript
public readonly deliveryStreamDataFreshnessErrorsAlarmThreshold: number;
```

- *Type:* number

---

##### `deliveryStreamDataFreshnessErrorsEvaluationPeriods`<sup>Optional</sup> <a name="deliveryStreamDataFreshnessErrorsEvaluationPeriods" id="aws-ddk-core.FirehoseToS3StageProps.property.deliveryStreamDataFreshnessErrorsEvaluationPeriods"></a>

```typescript
public readonly deliveryStreamDataFreshnessErrorsEvaluationPeriods: number;
```

- *Type:* number

---

##### `kinesisFirehoseDestinationsS3BucketProps`<sup>Optional</sup> <a name="kinesisFirehoseDestinationsS3BucketProps" id="aws-ddk-core.FirehoseToS3StageProps.property.kinesisFirehoseDestinationsS3BucketProps"></a>

```typescript
public readonly kinesisFirehoseDestinationsS3BucketProps: S3BucketProps;
```

- *Type:* @aws-cdk/aws-kinesisfirehose-destinations-alpha.S3BucketProps

---

##### `s3Bucket`<sup>Optional</sup> <a name="s3Bucket" id="aws-ddk-core.FirehoseToS3StageProps.property.s3Bucket"></a>

```typescript
public readonly s3Bucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

---

##### `s3BucketProps`<sup>Optional</sup> <a name="s3BucketProps" id="aws-ddk-core.FirehoseToS3StageProps.property.s3BucketProps"></a>

```typescript
public readonly s3BucketProps: BucketProps;
```

- *Type:* aws-cdk-lib.aws_s3.BucketProps

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

### GlueTransformStageProps <a name="GlueTransformStageProps" id="aws-ddk-core.GlueTransformStageProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.GlueTransformStageProps.Initializer"></a>

```typescript
import { GlueTransformStageProps } from 'aws-ddk-core'

const glueTransformStageProps: GlueTransformStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.additionalRolePolicyStatements">additionalRolePolicyStatements</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.stateMachineFailedExecutionsAlarmEvaluationPeriods">stateMachineFailedExecutionsAlarmEvaluationPeriods</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.stateMachineFailedExecutionsAlarmThreshold">stateMachineFailedExecutionsAlarmThreshold</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.stateMachineInput">stateMachineInput</a></code> | <code>{[ key: string ]: any}</code> | *No description.* |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.crawlerName">crawlerName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.jobName">jobName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.GlueTransformStageProps.property.jobArgs">jobArgs</a></code> | <code>{[ key: string ]: any}</code> | *No description.* |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.GlueTransformStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.GlueTransformStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `additionalRolePolicyStatements`<sup>Optional</sup> <a name="additionalRolePolicyStatements" id="aws-ddk-core.GlueTransformStageProps.property.additionalRolePolicyStatements"></a>

```typescript
public readonly additionalRolePolicyStatements: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]

---

##### `alarmsEnabled`<sup>Optional</sup> <a name="alarmsEnabled" id="aws-ddk-core.GlueTransformStageProps.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

---

##### `stateMachineFailedExecutionsAlarmEvaluationPeriods`<sup>Optional</sup> <a name="stateMachineFailedExecutionsAlarmEvaluationPeriods" id="aws-ddk-core.GlueTransformStageProps.property.stateMachineFailedExecutionsAlarmEvaluationPeriods"></a>

```typescript
public readonly stateMachineFailedExecutionsAlarmEvaluationPeriods: number;
```

- *Type:* number

---

##### `stateMachineFailedExecutionsAlarmThreshold`<sup>Optional</sup> <a name="stateMachineFailedExecutionsAlarmThreshold" id="aws-ddk-core.GlueTransformStageProps.property.stateMachineFailedExecutionsAlarmThreshold"></a>

```typescript
public readonly stateMachineFailedExecutionsAlarmThreshold: number;
```

- *Type:* number

---

##### `stateMachineInput`<sup>Optional</sup> <a name="stateMachineInput" id="aws-ddk-core.GlueTransformStageProps.property.stateMachineInput"></a>

```typescript
public readonly stateMachineInput: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

---

##### `crawlerName`<sup>Required</sup> <a name="crawlerName" id="aws-ddk-core.GlueTransformStageProps.property.crawlerName"></a>

```typescript
public readonly crawlerName: string;
```

- *Type:* string

---

##### `jobName`<sup>Required</sup> <a name="jobName" id="aws-ddk-core.GlueTransformStageProps.property.jobName"></a>

```typescript
public readonly jobName: string;
```

- *Type:* string

---

##### `jobArgs`<sup>Optional</sup> <a name="jobArgs" id="aws-ddk-core.GlueTransformStageProps.property.jobArgs"></a>

```typescript
public readonly jobArgs: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

---

### S3EventStageProps <a name="S3EventStageProps" id="aws-ddk-core.S3EventStageProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.S3EventStageProps.Initializer"></a>

```typescript
import { S3EventStageProps } from 'aws-ddk-core'

const s3EventStageProps: S3EventStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.S3EventStageProps.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.S3EventStageProps.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.S3EventStageProps.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket \| aws-cdk-lib.aws_s3.IBucket[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.S3EventStageProps.property.eventNames">eventNames</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.S3EventStageProps.property.keyPrefix">keyPrefix</a></code> | <code>string \| string[]</code> | *No description.* |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.S3EventStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.S3EventStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `bucket`<sup>Required</sup> <a name="bucket" id="aws-ddk-core.S3EventStageProps.property.bucket"></a>

```typescript
public readonly bucket: IBucket | IBucket[];
```

- *Type:* aws-cdk-lib.aws_s3.IBucket | aws-cdk-lib.aws_s3.IBucket[]

---

##### `eventNames`<sup>Required</sup> <a name="eventNames" id="aws-ddk-core.S3EventStageProps.property.eventNames"></a>

```typescript
public readonly eventNames: string[];
```

- *Type:* string[]

---

##### `keyPrefix`<sup>Optional</sup> <a name="keyPrefix" id="aws-ddk-core.S3EventStageProps.property.keyPrefix"></a>

```typescript
public readonly keyPrefix: string | string[];
```

- *Type:* string | string[]

---

### SourceActionProps <a name="SourceActionProps" id="aws-ddk-core.SourceActionProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.SourceActionProps.Initializer"></a>

```typescript
import { SourceActionProps } from 'aws-ddk-core'

const sourceActionProps: SourceActionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.SourceActionProps.property.repositoryName">repositoryName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.SourceActionProps.property.branch">branch</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.SourceActionProps.property.sourceAction">sourceAction</a></code> | <code>aws-cdk-lib.pipelines.CodePipelineSource</code> | *No description.* |

---

##### `repositoryName`<sup>Required</sup> <a name="repositoryName" id="aws-ddk-core.SourceActionProps.property.repositoryName"></a>

```typescript
public readonly repositoryName: string;
```

- *Type:* string

---

##### `branch`<sup>Optional</sup> <a name="branch" id="aws-ddk-core.SourceActionProps.property.branch"></a>

```typescript
public readonly branch: string;
```

- *Type:* string

---

##### `sourceAction`<sup>Optional</sup> <a name="sourceAction" id="aws-ddk-core.SourceActionProps.property.sourceAction"></a>

```typescript
public readonly sourceAction: CodePipelineSource;
```

- *Type:* aws-cdk-lib.pipelines.CodePipelineSource

---

### SqsToLambdaStageFunctionProps <a name="SqsToLambdaStageFunctionProps" id="aws-ddk-core.SqsToLambdaStageFunctionProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.SqsToLambdaStageFunctionProps.Initializer"></a>

```typescript
import { SqsToLambdaStageFunctionProps } from 'aws-ddk-core'

const sqsToLambdaStageFunctionProps: SqsToLambdaStageFunctionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.code">code</a></code> | <code>aws-cdk-lib.aws_lambda.Code</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.handler">handler</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.errorsAlarmThreshold">errorsAlarmThreshold</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.errorsEvaluationPeriods">errorsEvaluationPeriods</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.layers">layers</a></code> | <code>aws-cdk-lib.aws_lambda.ILayerVersion[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.memorySize">memorySize</a></code> | <code>aws-cdk-lib.Size</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.Role</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.runtime">runtime</a></code> | <code>aws-cdk-lib.aws_lambda.Runtime</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps.property.timeout">timeout</a></code> | <code>aws-cdk-lib.Duration</code> | *No description.* |

---

##### `code`<sup>Required</sup> <a name="code" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.code"></a>

```typescript
public readonly code: Code;
```

- *Type:* aws-cdk-lib.aws_lambda.Code

---

##### `handler`<sup>Required</sup> <a name="handler" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.handler"></a>

```typescript
public readonly handler: string;
```

- *Type:* string

---

##### `errorsAlarmThreshold`<sup>Optional</sup> <a name="errorsAlarmThreshold" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.errorsAlarmThreshold"></a>

```typescript
public readonly errorsAlarmThreshold: number;
```

- *Type:* number

---

##### `errorsEvaluationPeriods`<sup>Optional</sup> <a name="errorsEvaluationPeriods" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.errorsEvaluationPeriods"></a>

```typescript
public readonly errorsEvaluationPeriods: number;
```

- *Type:* number

---

##### `layers`<sup>Optional</sup> <a name="layers" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.layers"></a>

```typescript
public readonly layers: ILayerVersion[];
```

- *Type:* aws-cdk-lib.aws_lambda.ILayerVersion[]

---

##### `memorySize`<sup>Optional</sup> <a name="memorySize" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.memorySize"></a>

```typescript
public readonly memorySize: Size;
```

- *Type:* aws-cdk-lib.Size

---

##### `role`<sup>Optional</sup> <a name="role" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.role"></a>

```typescript
public readonly role: Role;
```

- *Type:* aws-cdk-lib.aws_iam.Role

---

##### `runtime`<sup>Optional</sup> <a name="runtime" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.runtime"></a>

```typescript
public readonly runtime: Runtime;
```

- *Type:* aws-cdk-lib.aws_lambda.Runtime

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="aws-ddk-core.SqsToLambdaStageFunctionProps.property.timeout"></a>

```typescript
public readonly timeout: Duration;
```

- *Type:* aws-cdk-lib.Duration

---

### SqsToLambdaStageProps <a name="SqsToLambdaStageProps" id="aws-ddk-core.SqsToLambdaStageProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.SqsToLambdaStageProps.Initializer"></a>

```typescript
import { SqsToLambdaStageProps } from 'aws-ddk-core'

const sqsToLambdaStageProps: SqsToLambdaStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.batchSize">batchSize</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.dlqEnabled">dlqEnabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.lambdaFunction">lambdaFunction</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.lambdaFunctionProps">lambdaFunctionProps</a></code> | <code><a href="#aws-ddk-core.SqsToLambdaStageFunctionProps">SqsToLambdaStageFunctionProps</a></code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.maxBatchingWindow">maxBatchingWindow</a></code> | <code>aws-cdk-lib.Duration</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.maxReceiveCount">maxReceiveCount</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.messageGroupId">messageGroupId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.sqsQueue">sqsQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | *No description.* |
| <code><a href="#aws-ddk-core.SqsToLambdaStageProps.property.sqsQueueProps">sqsQueueProps</a></code> | <code><a href="#aws-ddk-core.SqsToLambdaStageQueueProps">SqsToLambdaStageQueueProps</a></code> | *No description.* |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.SqsToLambdaStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.SqsToLambdaStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `alarmsEnabled`<sup>Optional</sup> <a name="alarmsEnabled" id="aws-ddk-core.SqsToLambdaStageProps.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

---

##### `batchSize`<sup>Optional</sup> <a name="batchSize" id="aws-ddk-core.SqsToLambdaStageProps.property.batchSize"></a>

```typescript
public readonly batchSize: number;
```

- *Type:* number

---

##### `dlqEnabled`<sup>Optional</sup> <a name="dlqEnabled" id="aws-ddk-core.SqsToLambdaStageProps.property.dlqEnabled"></a>

```typescript
public readonly dlqEnabled: boolean;
```

- *Type:* boolean

---

##### `lambdaFunction`<sup>Optional</sup> <a name="lambdaFunction" id="aws-ddk-core.SqsToLambdaStageProps.property.lambdaFunction"></a>

```typescript
public readonly lambdaFunction: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

---

##### `lambdaFunctionProps`<sup>Optional</sup> <a name="lambdaFunctionProps" id="aws-ddk-core.SqsToLambdaStageProps.property.lambdaFunctionProps"></a>

```typescript
public readonly lambdaFunctionProps: SqsToLambdaStageFunctionProps;
```

- *Type:* <a href="#aws-ddk-core.SqsToLambdaStageFunctionProps">SqsToLambdaStageFunctionProps</a>

---

##### `maxBatchingWindow`<sup>Optional</sup> <a name="maxBatchingWindow" id="aws-ddk-core.SqsToLambdaStageProps.property.maxBatchingWindow"></a>

```typescript
public readonly maxBatchingWindow: Duration;
```

- *Type:* aws-cdk-lib.Duration

---

##### `maxReceiveCount`<sup>Optional</sup> <a name="maxReceiveCount" id="aws-ddk-core.SqsToLambdaStageProps.property.maxReceiveCount"></a>

```typescript
public readonly maxReceiveCount: number;
```

- *Type:* number

---

##### `messageGroupId`<sup>Optional</sup> <a name="messageGroupId" id="aws-ddk-core.SqsToLambdaStageProps.property.messageGroupId"></a>

```typescript
public readonly messageGroupId: string;
```

- *Type:* string

---

##### `sqsQueue`<sup>Optional</sup> <a name="sqsQueue" id="aws-ddk-core.SqsToLambdaStageProps.property.sqsQueue"></a>

```typescript
public readonly sqsQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue

---

##### `sqsQueueProps`<sup>Optional</sup> <a name="sqsQueueProps" id="aws-ddk-core.SqsToLambdaStageProps.property.sqsQueueProps"></a>

```typescript
public readonly sqsQueueProps: SqsToLambdaStageQueueProps;
```

- *Type:* <a href="#aws-ddk-core.SqsToLambdaStageQueueProps">SqsToLambdaStageQueueProps</a>

---

### SqsToLambdaStageQueueProps <a name="SqsToLambdaStageQueueProps" id="aws-ddk-core.SqsToLambdaStageQueueProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.SqsToLambdaStageQueueProps.Initializer"></a>

```typescript
import { SqsToLambdaStageQueueProps } from 'aws-ddk-core'

const sqsToLambdaStageQueueProps: SqsToLambdaStageQueueProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.SqsToLambdaStageQueueProps.property.visibilityTimeout">visibilityTimeout</a></code> | <code>aws-cdk-lib.Duration</code> | *No description.* |

---

##### `visibilityTimeout`<sup>Optional</sup> <a name="visibilityTimeout" id="aws-ddk-core.SqsToLambdaStageQueueProps.property.visibilityTimeout"></a>

```typescript
public readonly visibilityTimeout: Duration;
```

- *Type:* aws-cdk-lib.Duration

---

### StageProps <a name="StageProps" id="aws-ddk-core.StageProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.StageProps.Initializer"></a>

```typescript
import { StageProps } from 'aws-ddk-core'

const stageProps: StageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.StageProps.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.StageProps.property.name">name</a></code> | <code>string</code> | *No description.* |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.StageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.StageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

### StateMachineStageProps <a name="StateMachineStageProps" id="aws-ddk-core.StateMachineStageProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.StateMachineStageProps.Initializer"></a>

```typescript
import { StateMachineStageProps } from 'aws-ddk-core'

const stateMachineStageProps: StateMachineStageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.StateMachineStageProps.property.description">description</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.StateMachineStageProps.property.name">name</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.StateMachineStageProps.property.additionalRolePolicyStatements">additionalRolePolicyStatements</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.StateMachineStageProps.property.alarmsEnabled">alarmsEnabled</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#aws-ddk-core.StateMachineStageProps.property.stateMachineFailedExecutionsAlarmEvaluationPeriods">stateMachineFailedExecutionsAlarmEvaluationPeriods</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-ddk-core.StateMachineStageProps.property.stateMachineFailedExecutionsAlarmThreshold">stateMachineFailedExecutionsAlarmThreshold</a></code> | <code>number</code> | *No description.* |
| <code><a href="#aws-ddk-core.StateMachineStageProps.property.stateMachineInput">stateMachineInput</a></code> | <code>{[ key: string ]: any}</code> | *No description.* |

---

##### `description`<sup>Optional</sup> <a name="description" id="aws-ddk-core.StateMachineStageProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string

---

##### `name`<sup>Optional</sup> <a name="name" id="aws-ddk-core.StateMachineStageProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

---

##### `additionalRolePolicyStatements`<sup>Optional</sup> <a name="additionalRolePolicyStatements" id="aws-ddk-core.StateMachineStageProps.property.additionalRolePolicyStatements"></a>

```typescript
public readonly additionalRolePolicyStatements: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]

---

##### `alarmsEnabled`<sup>Optional</sup> <a name="alarmsEnabled" id="aws-ddk-core.StateMachineStageProps.property.alarmsEnabled"></a>

```typescript
public readonly alarmsEnabled: boolean;
```

- *Type:* boolean

---

##### `stateMachineFailedExecutionsAlarmEvaluationPeriods`<sup>Optional</sup> <a name="stateMachineFailedExecutionsAlarmEvaluationPeriods" id="aws-ddk-core.StateMachineStageProps.property.stateMachineFailedExecutionsAlarmEvaluationPeriods"></a>

```typescript
public readonly stateMachineFailedExecutionsAlarmEvaluationPeriods: number;
```

- *Type:* number

---

##### `stateMachineFailedExecutionsAlarmThreshold`<sup>Optional</sup> <a name="stateMachineFailedExecutionsAlarmThreshold" id="aws-ddk-core.StateMachineStageProps.property.stateMachineFailedExecutionsAlarmThreshold"></a>

```typescript
public readonly stateMachineFailedExecutionsAlarmThreshold: number;
```

- *Type:* number

---

##### `stateMachineInput`<sup>Optional</sup> <a name="stateMachineInput" id="aws-ddk-core.StateMachineStageProps.property.stateMachineInput"></a>

```typescript
public readonly stateMachineInput: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

---

### SynthActionProps <a name="SynthActionProps" id="aws-ddk-core.SynthActionProps"></a>

#### Initializer <a name="Initializer" id="aws-ddk-core.SynthActionProps.Initializer"></a>

```typescript
import { SynthActionProps } from 'aws-ddk-core'

const synthActionProps: SynthActionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#aws-ddk-core.SynthActionProps.property.additionalInstallCommands">additionalInstallCommands</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.SynthActionProps.property.cdkVersion">cdkVersion</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.SynthActionProps.property.codeartifactDomain">codeartifactDomain</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.SynthActionProps.property.codeartifactDomainOwner">codeartifactDomainOwner</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.SynthActionProps.property.codeartifactRepository">codeartifactRepository</a></code> | <code>string</code> | *No description.* |
| <code><a href="#aws-ddk-core.SynthActionProps.property.rolePolicyStatements">rolePolicyStatements</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | *No description.* |
| <code><a href="#aws-ddk-core.SynthActionProps.property.synthAction">synthAction</a></code> | <code>aws-cdk-lib.pipelines.CodeBuildStep</code> | *No description.* |

---

##### `additionalInstallCommands`<sup>Optional</sup> <a name="additionalInstallCommands" id="aws-ddk-core.SynthActionProps.property.additionalInstallCommands"></a>

```typescript
public readonly additionalInstallCommands: string[];
```

- *Type:* string[]

---

##### `cdkVersion`<sup>Optional</sup> <a name="cdkVersion" id="aws-ddk-core.SynthActionProps.property.cdkVersion"></a>

```typescript
public readonly cdkVersion: string;
```

- *Type:* string

---

##### `codeartifactDomain`<sup>Optional</sup> <a name="codeartifactDomain" id="aws-ddk-core.SynthActionProps.property.codeartifactDomain"></a>

```typescript
public readonly codeartifactDomain: string;
```

- *Type:* string

---

##### `codeartifactDomainOwner`<sup>Optional</sup> <a name="codeartifactDomainOwner" id="aws-ddk-core.SynthActionProps.property.codeartifactDomainOwner"></a>

```typescript
public readonly codeartifactDomainOwner: string;
```

- *Type:* string

---

##### `codeartifactRepository`<sup>Optional</sup> <a name="codeartifactRepository" id="aws-ddk-core.SynthActionProps.property.codeartifactRepository"></a>

```typescript
public readonly codeartifactRepository: string;
```

- *Type:* string

---

##### `rolePolicyStatements`<sup>Optional</sup> <a name="rolePolicyStatements" id="aws-ddk-core.SynthActionProps.property.rolePolicyStatements"></a>

```typescript
public readonly rolePolicyStatements: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]

---

##### `synthAction`<sup>Optional</sup> <a name="synthAction" id="aws-ddk-core.SynthActionProps.property.synthAction"></a>

```typescript
public readonly synthAction: CodeBuildStep;
```

- *Type:* aws-cdk-lib.pipelines.CodeBuildStep

---



