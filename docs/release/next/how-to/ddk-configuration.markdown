---
title: DDK Configuration
layout: how-to
tags: how-to
order: 3
category: Advanced
---

## Configuration

The DDK Core supports environment specific configuration with the usage of a file called: `ddk.json`. You can leverage this file to apply different configurations to each of your DDK environments.

### Example
```json
{
    "environments": {
        "dev": {
            "account": "222222222222",
            "region": "us-east-1",
            "resources": {
                "ddk-bucket": {"versioned": false, "removal_policy": "destroy"},
                "ddk-sqs-lambda-function": {"memory_size": 128},
                "ddk-sqs-lambda-queue": {"retention_period": 10080}
            },
            "tags": {"CostCenter": "1984"}
        },
        "prod": {
            "account": "111111111111",
            "region": "us-east-1",
            "resources": {
                "ddk-bucket": {"versioned": false, "removal_policy": "retain"},
                "ddk-sqs-lambda-function": {"memory_size": 512},
                "ddk-sqs-lambda-queue": {"retention_period": 10080}
            },
            "tags": {"CostCenter": "1984"}
        }
    }
}
```

## Implementation 

Each data construct has the capability to allow configuration set by `ddk.json`. For example the DDK [`BaseStack`](https://github.com/awslabs/aws-ddk/blob/main/core/aws_ddk_core/base/stack.py) class allows the following parameters.
```
prefix: str
qualifier: str
termination_protection: str
tags: Dict[str, str]
```
If the construct supports environment configuration it will be listed in the documentation as ***Supported DDK Environment Configuration***. See the [API Documentation](https://awslabs.github.io/aws-ddk/release/stable/api/core/aws_ddk_core.html) for a list of DDK constructs.

## Resource Specific Configuration
Resource constructs allow DDK configuration to set AWS resource properties. These can be set in `ddk.json` in the `resources{}` object within any given environment. For example given a configuration: 
```json
{
    "environments": {
        "test": {
            "account": "3333333333333",
            "region": "us-east-1",
            "resources": {
                "ddk-glue-transform-job": {"timeout": 300, "worker_count": 2},
            }
        }
    }
}
```
Any underlying CDK resource matching the id: "ddk-glue-transform-job" would be passed the properties "*timeout*" and "*worker_count*".

### Property Precedence
Explicit properties will always take precedence over config values. 

```python
# A DDK resource is configured with an explicit property 'shard_count'
data_stream = KinesisStreamsFactory.data_stream(
    self, id=f"example-data-stream", environment_id=environment_id, shard_count=10
)
```
The above Kinesis Data Stream will be created with value '*shard_count=10*' even if ddk.json has a different value

This configuration value would be overridden
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
