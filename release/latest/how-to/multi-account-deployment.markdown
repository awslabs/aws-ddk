---
title: Deploy Multi-Account DDK Apps
layout: how-to
tags: how-to
order: 2
category: Advanced
---

## Purpose
In some cases resources will need to be created in mulitple accounts to support environment or logical separation. The following guide demonstrates how you can deploy a DDK application to multiple environments in their own AWS accounts.

## Enabling Accounts for Cross-Account Access
`ddk bootstrap` allows us to setup cross-account access for a DDK account.

Let's say we have three AWS accounts.
- 111111111111: A centralized account for CI/CD pipelines.
- 222222222222: An account to host `dev` environment resources.
- 333333333333: An account to host `test` environment resources.

### Bootstrap Accounts
We'll need to bootstrap each environment. 

**cicd**: `ddk bootstrap -e cicd -p ${CICD_AWS_PROFILE}`
**dev**: `ddk bootstrap -e dev -p ${DEV_AWS_PROFILE} -a 111111111111`
**test**: `ddk bootstrap -e test -p ${TEST_AWS_PROFILE} -a 111111111111`

The `dev` & `test` environments are bootstrapped with `a 111111111111` to setup the required cross account access for the `cicd` account to manage resources within them.

## Configuration
`ddk.json` must be configured will all your accounts.

```json
{
    "environments": {
        "dev": {
            "account": "111111111111",
            "region": "us-west-2",
            "resources": {
                "ddk-bucket": {"versioned": true, "removal_policy": "destroy"}
            }
        },
        "test": {
            "account": "222222222222",
            "region": "us-west-2",
            "resources": {
                "ddk-bucket": {"versioned": true, "removal_policy": "retain"}
            }
        },
        "cicd": {
            "account": "333333333333",
            "region": "us-west-2"
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

## Deployment 
Running `ddk deploy` will deploy the pipeline in your AWS account. You can then push the code to your repository (`ddk-repository` in the above example) to trigger the release.

You should now have two deployment stages in your CodePipeline for each environment.
![Pipeline](/aws-ddk/img/multi-account-pipeline.png)
![Pipeline Stages](/aws-ddk/img/multi-account-stages.png)



