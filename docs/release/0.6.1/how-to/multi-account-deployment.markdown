---
title: Deploy Multi-Account DDK Apps
layout: how-to
tags: how-to
order: 2
category: Advanced
---

## Purpose
In some cases, resources must be created across multiple accounts to support environment or logical separation. The following guide demonstrates how a DDK application is deployed to multiple environments in their own AWS accounts.

## Enabling Accounts for Cross-Account Access
`ddk bootstrap` allows us to setup cross-account access for a DDK account.

Let's say we have three AWS accounts.
- **111111111111**: A centralized account for CI/CD pipelines.
- **222222222222**: An account to host `dev` environment resources.
- **333333333333**: An account to host `test` environment resources.

### Bootstrap Accounts
We'll need to bootstrap each environment. 

- **[cicd]**: `ddk bootstrap -e cicd -p ${CICD_AWS_PROFILE}`
- **[dev]**: `ddk bootstrap -e dev -p ${DEV_AWS_PROFILE} -a 111111111111`
- **[test]**: `ddk bootstrap -e test -p ${TEST_AWS_PROFILE} -a 111111111111`

The `dev` & `test` environments are bootstrapped with `-a 111111111111` to setup the required cross account access for the `cicd` account to manage resources within them.

## Configuration
`ddk.json` must be configured with all your accounts.

```json
{
    "environments": {
        "cicd": {
            "account": "111111111111",
            "region": "us-west-2"
        },
        "dev": {
            "account": "222222222222",
            "region": "us-west-2",
            "resources": {
                "ddk-bucket": {"versioned": false, "removal_policy": "destroy"}
            }
        },
        "test": {
            "account": "333333333333",
            "region": "us-west-2",
            "resources": {
                "ddk-bucket": {"versioned": true, "removal_policy": "retain"}
            }
        }
    }
}
```

`app.py` for example can now build a CI/CD pipeline to instantiate your application in both environments.

```python
#!/usr/bin/env python3

import aws_cdk as cdk
from aws_ddk_core.cicd import CICDPipelineStack
from ddk_app.ddk_app_stack import DDKApplicationStack
from aws_ddk_core.config import Config


app = cdk.App()


class ApplicationStage(cdk.Stage):
    def __init__(
        self,
        scope,
        environment_id: str,
        **kwargs,
    ) -> None:
        super().__init__(scope, f"Ddk{environment_id.title()}Application", **kwargs)
        DDKApplicationStack(self, "DataPipeline", environment_id)


config = Config()
(
    CICDPipelineStack(
        app,
        id="DdkCodePipeline",
        environment_id="cicd",
        pipeline_name="ddk-application-pipeline",
    )
    .add_source_action(repository_name="ddk-repository")
    .add_synth_action()
    .build()
    .add_stage("dev", ApplicationStage(app, "dev", env=config.get_env("dev")))
    .add_stage("test", ApplicationStage(app, "test", env=config.get_env("test")))
    .synth()
)

app.synth()
```

We then push this infrastructure as code into a newly created CodeCommit repository named `ddk-repository`:
```
ddk create-repository ddk-repository
git add .
git commit -m "Initial commit"
git push --set-upstream origin main
```

## Deployment 
Running `ddk deploy` provisions the pipeline in your AWS account. The aforementioned CI/CD pipeline is [self-mutating](https://aws.amazon.com/blogs/developer/cdk-pipelines-continuous-delivery-for-aws-cdk-applications/), meaning we only need to run cdk deploy one time to get the pipeline started. After that, the pipeline automatically updates itself if code is committed to the source code repository.

You should now have two deployment stages in your CodePipeline for each environment.
![Pipeline](/aws-ddk/img/multi-account-pipeline.png)
![Pipeline Stages](/aws-ddk/img/multi-account-stages.png)



