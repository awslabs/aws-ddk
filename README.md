# AWS DataOps Development Kit (DDK)
![Actions Status](https://github.com/awslabs/aws-ddk/actions/workflows/bandit.yml/badge.svg)
![Actions Status](https://github.com/awslabs/aws-ddk/actions/workflows/cfn-nag.yml/badge.svg)
![Actions Status](https://github.com/awslabs/aws-ddk/actions/workflows/cli-tests.yml/badge.svg)
![Actions Status](https://github.com/awslabs/aws-ddk/actions/workflows/core-tests.yml/badge.svg)


The AWS DataOps Development Kit is an open source development framework for customers that build data workflows and modern data architecture on AWS.

Based on the [AWS CDK](https://github.com/aws/aws-cdk), it offers high-level abstractions allowing you to build pipelines that manage data flows on AWS, driven by DevOps best practices.  The framework is extensible, you can add abstractions for your own data processing infrastructure or replace our best practices with your own standards. It's easy to share templates, so everyone in your organisation can concentrate on the business logic of dealing with their data, rather than boilerplate logic.

---

The **DDK Core** is a library of CDK constructs that you can use to build data workflows and modern data architecture on AWS, following our best practice. The DDK Core is modular and extensible, if our best practice doesn't work for you, then you can update and share your own version with the rest of your organisation by leveraging a private **AWS Code Artifact** repository.

DUMMY CHANGE

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