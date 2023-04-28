---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
homePage: true
---

## Overview

The AWS DataOps Development Kit is an open source development framework for customers that build data workflows and modern data architecture on AWS.

Based on the [AWS CDK](https://github.com/aws/aws-cdk), it offers high-level abstractions allowing you to build pipelines that manage data flows on AWS, driven by DevOps best practices.  The framework is extensible, you can add abstractions for your own data processing infrastructure or replace our best practices with your own standards. It's easy to share templates, so everyone in your organisation can concentrate on the business logic of dealing with their data, rather than boilerplate logic.

---

The **DDK Core** is a library of CDK constructs that you can use to build data workflows and modern data architecture on AWS, following our best practice. The DDK Core is modular and extensible, if our best practice doesn't work for you, then you can update and share your own version with the rest of your organisation by leveraging a private **AWS Code Artifact** repository.

You can compose constructs from the DDK Core into a **DDK App**.  Your DDK App can also add contain constructs from the CDK Framework or the [AWS Construct Library](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html).

For a detailed walk-through, check out our [Workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/3644b48b-1d7c-43ef-a353-6edcd96385af/en-US) or
take a look at [examples](https://github.com/aws-samples/aws-ddk-examples).

## Install

You can install or update the AWS DDK library from the following:
- [PyPi](https://pypi.org/project/aws-ddk-core/)
```shell
pip install aws-ddk-core
```
- [NPM](https://www.npmjs.com/package/aws-ddk-core)
```shell
npm install aws-ddk-core
```

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
[FirehoseToS3Stage()](https://constructs.dev/packages/aws-ddk-core/v/1.0.0-beta.1/api/FirehoseToS3Stage), and 
[SqsToLambdaStage()](https://constructs.dev/packages/aws-ddk-core/v/1.0.0-beta.1/api/SqsToLambdaStage). 
These two classes are then instantiated and the delivery stream is configured with the S3 prefix (raw/). 
Finally, the DDK DataPipeline construct is used to chain these two stages together into a data pipeline.

Complete source code of the data pipeline above can be found in 
[AWS DDK Examples - Basic Data Pipeline](https://github.com/aws-samples/aws-ddk-examples/tree/main/basic-data-pipeline)
