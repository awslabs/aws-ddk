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
`cdk bootstrap` allows us to setup cross-account access for your AWS accounts.

Let's say we have three AWS accounts.
- **111111111111**: A centralized account for CI/CD pipelines.
- **222222222222**: An account to host `dev` environment resources.
- **333333333333**: An account to host `test` environment resources.

### Bootstrap Accounts
We'll need to bootstrap each environment. 

- **[cicd]**: `cdk bootstrap -p ${CICD_AWS_PROFILE}`
- **[dev]**: `cdk bootstrap -p ${DEV_AWS_PROFILE} --trust 111111111111 --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess`
- **[test]**: `cdk bootstrap -e test -p ${TEST_AWS_PROFILE} --trust 111111111111 --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess`

The `dev` & `test` environments are bootstrapped with `--trust 111111111111 --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess` to setup the required cross account access for the `cicd` account to manage resources within them.

## [Optional] Configuration
A preferred solution is to store environment configuration in a file e.g. `ddk.json`.

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

{% tabs example %}
{% tab example typescript %}
You can now build a CI/CD pipeline to instantiate your application in both environments.

```javascript
import * as cdk from 'aws-cdk-lib';
import * as ddk from "aws-ddk-core";
import { Construct } from "constructs";

export class ApplicationStage extends cdk.Stage {
  constructor(
    scope: Construct,
    id: string,
    props?: cdk.StageProps
  ) {
    super(scope, id, props ?? {});
    new cdk.Stack(this, "DataPipeline");
  }
}

const app = new cdk.App();

new ddk.CICDPipelineStack(app, "DDKCodePipeline", {
  environmentId: "cicd",
  pipelineName: "ddk-application-pipeline",
  env: ddk.Configurator.getEnvironment({
    configPath: "./ddk.json",
    environmentId: "cicd",
  }),
})
  .addSourceAction({ repositoryName: "ddk-repository" })
  .addSynthAction()
  .buildPipeline()
  .addStage({
    stageId: "dev",
    stage: new ApplicationStage(app, "DevStage", {
      env: ddk.Configurator.getEnvironment({
        configPath: "./ddk.json",
        environmentId: "dev",
      }),
    }),
  })
  .addStage({
    stageId: "test",
    stage: new ApplicationStage(app, "TestStage", {
      env: ddk.Configurator.getEnvironment({
        configPath: "./ddk.json",
        environmentId: "test",
      }),
    }),
  })
  .synth();

app.synth();
```
{% endtab %}
{% tab example python %}
`app.py` for example can now build a CI/CD pipeline to instantiate your application in both environments.

```python
import aws_cdk as cdk
import aws_ddk_core as ddk


class ApplicationStage(cdk.Stage):
    def __init__(
        self,
        scope,
        id: str,
        **kwargs,
    ) -> None:
        super().__init__(scope, id, **kwargs)
        cdk.Stack(self, "DataPipeline")


app = cdk.App()

(
    ddk.CICDPipelineStack(
        app,
        id="DDKCodePipeline",
        environment_id="cicd",
        pipeline_name="ddk-application-pipeline",
        env=ddk.Configurator.get_environment(
            config_path="./ddk.json", environment_id="cicd"
        ),
    )
    .add_source_action(repository_name="ddk-repository")
    .add_synth_action()
    .build_pipeline()
    .add_stage(
        stage_id="dev",
        stage=ApplicationStage(
            app,
            "DevStage",
            env=ddk.Configurator.get_environment(
                config_path="./ddk.json", environment_id="dev"
            ),
        ),
    )
    .add_stage(
        stage_id="test",
        stage=ApplicationStage(
            app,
            "TestStage",
            env=ddk.Configurator.get_environment(
                config_path="./ddk.json", environment_id="test"
            ),
        ),
    )
    .synth()
)

app.synth()
```

{% endtab %}

{% endtabs %}

We then push this infrastructure as code into a newly created CodeCommit repository named `ddk-repository`:
```
aws codecommit create-repository --repository-name ddk-repository
git init
git remote add origin https://git-codecommit.${AWS_REGION}.amazonaws.com/v1/repos/ddk-repository
git add .
git commit -m "Initial commit"
git push --set-upstream origin main
```

## Deployment 
Running `cdk deploy` provisions the pipeline in your AWS account. The aforementioned CI/CD pipeline is [self-mutating](https://aws.amazon.com/blogs/developer/cdk-pipelines-continuous-delivery-for-aws-cdk-applications/), meaning we only need to run cdk deploy one time to get the pipeline started. After that, the pipeline automatically updates itself if code is committed to the source code repository.

You should now have two deployment stages in your CodePipeline for each environment.

![Pipeline](/aws-ddk/img/multi-account-pipeline.png)
![Pipeline Stages](/aws-ddk/img/multi-account-stages.png)



