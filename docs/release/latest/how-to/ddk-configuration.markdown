---
title: DDK Configurator
layout: how-to
tags: how-to
order: 3
category: Intermediate
---

## Purpose
DDK promotes a [trunk based](https://www.atlassian.com/continuous-delivery/continuous-integration/trunk-based-development) development approach where small changes are frequently applied to the `main` branch.
As a result, this core branch is the one source of truth and the same infrastructure as code is used across multiple environments. However, there is often a need to apply distinct configuration
to different environments (i.e. `dev`, `qa`, `prd`...). This How-To guide describes how this can be achieved in the DDK.

## Configuration
DDK Core offers a construct: [Configurator](https://constructs.dev/packages/aws-ddk-core/v/1.0.0-beta.1/api/Configurator?lang=typescript) which can be used to manage configuration across several DDK environments. **Note: This is a completely optional construct and users should feel free to build their own configuration mechanisms when necessary.**

### Example
In this example we will begin by creating a configuration file.
```shell
touch ddk.json
```
And updating it to include the following JSON data.

```json
{
  "tags": {
    "Global:Tag:foo": "bar"
  },
  "account": "111111111111",
  "region": "us-east-1",
  "environments": {
    "dev": {
      "account": "222222222222",
      "region": "us-east-1",
      "resources": {
        "AWS::Lambda::Function": {
          "MemorySize": 128,
          "Runtime": "python3.9"
        },
        "devStage/Queue": {
          "VisibilityTimeout": 180
        },
        "AWS::S3::Bucket": {
          "RemovalPolicy": "DESTROY"
        }
      },
      "tags": {"CostCenter": "2014"},
      "props": {
        "special_prop": "foobar"
      }
    },
    "prod": {
      "account": "222222222222",
      "region": "us-east-1",
      "resources": {
        "AWS::Lambda::Function": {
          "MemorySize": 1024,
          "Runtime": "python3.9"
        }
      },
      "tags": {"CostCenter": "2015"}
    }
  }
}
```

Let's breakdown what's included in this configuration file.

- A tag `"Global:Tag:foo": "bar"` is defined globally which will be applied to any scope Configurator is used on regardless of environment.
- `account` & `region` are defined globally which can be accessed from `Configurator.getEnvironment()` to be used where a [`cdk.Environment`](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.Environment.html) is applicable.
- `environments` is an object that includes configuration for any environments we would like to use. In this case there is one for `dev` and one for `prod`.
- We include `account` & `region` in the environment which can be accessed to be used where a [`cdk.Environment`](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.Environment.html) is applicable.
- The `resources` block contains any property overrides you would like to set. In this case we are overriding `MemorySize` & `Runtime` in our Lambda Functions, setting `VisibilityTimeout` for our SQS queue in `dev` and setting `DESTROY` removal policy for our S3 Bucket in `dev`. This will be explained in more detail [below](#resource-specific-configuration). 

Next let's create a CDK file using Configurator to control resources in our stacks.
{% tabs language %}
{% tab language typescript %}
```javascript
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import {
  BaseStack,
  Configurator,
  DataPipeline,
  S3EventStage,
  SqsToLambdaStage,
} from "aws-ddk-core";
import { Construct } from "constructs";

const app = new cdk.App();

class ExampleStack extends BaseStack {
  constructor(scope: Construct, environment: string) {
    super(scope, `${environment}Resources`, {});
    const s3Stage = new S3EventStage(this, `MyEventBucket${environment}`, {
      bucket: new s3.Bucket(this, `MyBucket${environment}`),
      eventNames: ["Object Created"],
    });
    const sqsToLambdaStage = new SqsToLambdaStage(this, `${environment}Stage`, {
      lambdaFunctionProps: {
        code: lambda.Code.fromInline(
          "def lambda_handler(event, context): pass;"
        ),
        handler: "lambda_function.lambda_handler",
        runtime: lambda.Runtime.PYTHON_3_8,
      },
    });
    new DataPipeline(this, `${environment}DataPipeline`, {})
      .addStage({ stage: s3Stage })
      .addStage({ stage: sqsToLambdaStage });
    new Configurator(this, "./ddk.json", environment);
  }
}

// Dev Stack
new ExampleStack(app, "dev");

// Prod Stack
new ExampleStack(app, "prod");
```
{% endtab %}
{% tab language python %}
```python
import aws_cdk as cdk
import aws_cdk.aws_lambda as lmbda
import aws_cdk.aws_s3 as s3
from aws_ddk_core import BaseStack, Configurator, DataPipeline,S3EventStage,SqsToLambdaStage
from constructs import Construct


app = cdk.App()

class ExampleStack(BaseStack):
    def __init__(
        self,
        scope: Construct,
        environment: str,
    ) -> None:
        super().__init__(scope, f"{environment}Resources")
        s3_stage = S3EventStage(self, f"MyEventBucket{environment}", bucket=s3.Bucket(self, f"MyBucket{environment}"), event_names=["Object Created"])
        sqs_to_lambda_stage = SqsToLambdaStage(
          self, 
          id=f"{environment}Stage", 
          lambda_function_props={
            "code": lmbda.Code.from_inline(
              "def lambda_handler(event, context): pass;"
            ),
            "handler": "lambda_function.lambda_handler",
            "runtime": lmbda.Runtime.PYTHON_3_8,
          },
        )
        DataPipeline(self, id=f"{environment}DataPipeline").add_stage(stage=s3_stage).add_stage(stage=sqs_to_lambda_stage)
        Configurator(scope=self, config="./ddk.json", environment_id=environment)

# Dev Stack
ExampleStack(app, "dev")

# Prod Stack
ExampleStack(app, "prod")

app.synth()

```
{% endtab %}
{% endtabs %}

Now let's synthesize our templates to examine `Configurator` in action.

```shell
cdk synth devResources
cdk synth prodResources
```

If we take a look at the SQS Queue in `devResources`

```yaml
devStageQueue44060536:
    Type: AWS::SQS::Queue
    Properties:
      Tags:
        - Key: CostCenter
          Value: "2014"
        - Key: Global:Tag:foo
          Value: bar
      VisibilityTimeout: 180
    UpdateReplacePolicy: Delete
    DeletionPolicy: Delete
    Metadata:
      aws:cdk:path: devResources/devStage/Queue/Resource
```

We can see that `VisibilityTimeout` has been updated as well as both the global tag and environment tag have been added to the resource. The same should follow for the other resources called out by the configuration.


## Resource Specific Configuration
Resource specific configuration can be set in `Configurator` within the `resources` object of any given environment. For example given a configuration: 
```json
{
    "environments": {
        "test": {
            "account": "444444444444",
            "region": "us-east-1",
            "resources": {
                "ddk-glue-transform-job": {"timeout": 300, "worker_count": 2}
            }
        }
    }
}
```
Any underlying CDK resource matching the id: "*ddk-glue-transform-job*" would be passed the properties "*timeout*" and "*worker_count*" in the `test` environment.

All resources of a given type e.g. `AWS::Lambda::Function` can be configured as well, but this will override properties for any resource matching that type within a following scope **Configurator** has been applied to. For example:
```json
{
    "environments": {
        "test": {
            "account": "444444444444",
            "region": "us-east-1",
            "resources": {
                "AWS::Lambda::Function": {
                    "MemorySize": 512
                }
            },
        }
    }
}
```
