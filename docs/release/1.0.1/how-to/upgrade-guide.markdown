---
title: 1.0.0 Upgrade guide
layout: how-to
tags: how-to
order: 3
category: Introduction
---

# 1.0.0 Major Version Release
Version `1.0.0` of the AWS DDK includes the following high-level changes and updates.
- Source code is now written in Typescript and uses [**JSII**](https://aws.github.io/jsii) to package both python and typescript versions of the library. In the near future we will add support for all AWS CDK supported programming languages.
- A new **optional** config construct `Configurator()` has been implemented to replace the required `Config()` construct from earlier verisons.
- The [DDK CLI](https://pypi.org/project/aws-ddk/) has been deprectated. **Projects that were bootstrapped using `ddk bootstrap` will still be supported.** 
- New stages have been added
  - [`RedshiftDataApiStage()`](https://constructs.dev/packages/aws-ddk-core/v/1.0.0-beta.1/api/RedshiftDataApiStage)
  - [`SnsSqsToLambdaStage()`](https://constructs.dev/packages/aws-ddk-core/v/1.0.0-beta.1/api/SnsSqsToLambdaStage)

## Config
`Configurator` is the new **optional** construct used to manage config across multiple environments. While this can handle a variety of use cases we encourage users to build their own config mechanisms when it `Configurator` is not the best option. See [this how-to guide](https://awslabs.github.io/aws-ddk/release/latest/how-to/ddk-configuration.html)for more on using Configurator.

## Bootstrapping
Customers that have already bootstrapped accounts and regions using `ddk bootstrap` can easily use the same roles by following the [**Using Legacy DDK Bootstrap Roles** section of this guide](https://awslabs.github.io/aws-ddk/release/latest/how-to/custom-bootstrap.html).

## Stage Properties
Because we have shifted to using typescript interfaces provided by the AWS CDK some properties may look slightly different in the new version. We will outline some common changes below, but always refer to the [API documentation](https://constructs.dev/packages/aws-ddk-core) if you are unsure.

- **Data Pipeline**: Now requires positional arguments in the `add_stage()` method.
{% tabs language %}
{% tab language typescript %}
```javascript
new DataPipeline(
      this, "DDK Pipeline", {}
    ).addStage({stage: myFirstStage}).addStage({stage: mySecondStage})
```
{% endtab %}
{% tab language python %}
```python
(
  DataPipeline(scope=self, id="DDK Pipeline")
  .add_stage(stage=my_first_stage)
  .add_stage(stage=my_second_stage)
)
```
{% endtab %}
{% endtabs %}
- **Changes to SqsToLambdaStage Properties**: Function and queue properties now have their own dedicated positional argument.
{% tabs language %}
{% tab language typescript %}
```javascript
new SqsToLambdaStage(
  this, 
  "Lambda Stage", 
  {
    lambdaFunctionProps: {
      functionName: "dummy-function",
      code: lambda.Code.fromAsset(path.join(__dirname, "/../src/")),
      handler: "commons.handlers.lambda_handler",
      runtime: lambda.Runtime.PYTHON_3_8,
    },
    sqsQueueProps: {
      queueName: "dummy-queue.fifo",
      visibilityTimeout: cdk.Duration.minutes(5),
    },
  }
)
```
{% endtab %}
{% tab language python %}
```python
SqsToLambdaStage(
    self,
    id="lambda-stage",
    lambda_function_props={
        "code": Code.from_asset("./ddk_app/lambda_handlers"),
        "handler": "handler.lambda_handler",
        "layers": [
            LayerVersion.from_layer_version_arn(
                self,
                id="layer",
                layer_version_arn=f"arn:aws:lambda:{self.region}:336392948345:layer:AWSDataWrangler-Python39:1",
            )
        ],
        "runtime": Runtime.PYTHON_3_9,
    },
)
```
{% endtab %}
{% endtabs %}
- **BaseStack**: No longer requires an environment id. See [`BaseStackProps()`](https://constructs.dev/packages/aws-ddk-core/v/1.0.0-beta.1/api/BaseStackProps) for more details.
{% tabs language %}
{% tab language typescript %}
```javascript
new BaseStack(app, "my-stack", {});
```
{% endtab %}
{% tab language python %}
```python
BaseStack(app, "my-stack")
```
{% endtab %}
{% endtabs %}

