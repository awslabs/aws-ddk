---
title: Different methods to bootstrap DDK apps
layout: how-to
tags: how-to
order: 5
category: Advanced
---

# Bootstrapping

The AWS CDK requires some resources to be provisioned before deploying stacks into an account (i.e. IAM Roles, S3 Bucket for Assets). This is referred to as [bootstrapping](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html). 

## DDK Bootstrap Cases
The following are possible ways of bootstrapping an AWS account for DDK apps.

### Default
If no configuration is provided the DDK stacks will leverage the default resources provisioned by `cdk bootstrap`.

### Use Configurator()
See [Configurator]() for more details on the construct.

#### Schema 
Configurator supports the following schema, at both the global and environment level, for defining bootstrap resources for your CDK app. 

**All fields are optional**
- `bootstrap`
  - `prefix`: (The prefix of role names created to be used in a stack's synthesizer)
  - `qualifier`: (The qualifier used to bootstrap this stack)
  - `file_assets_bucket_name`: (File assets bucket name)
  - `stack_version_ssm_parameter`: (Default bootstrap stack version SSM parameter)
  - `deploy_role`: (Default deploy role ARN)
  - `file_publish_role`: (Default asset publishing role ARN for file (S3) assets)
  - `cfn_execution_role`: (Default CloudFormation role ARN)
  - `lookup_role`: (Default lookup role ARN for missing values)

__Configurator uses the [DefaultStackSynthesizer](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.DefaultStackSynthesizer.html) construct under the hood__


##### Example
```json
"environments": {
  "dev": {
    "account": "000000000000",
    "region": "us-west-2",
    "bootstrap": {
      "qualifier": "abcdefgh",
      "bucket_name": "ddk-abcdefgh-assets-000000000000-us-west-2",
      "deploy_role": "arn:aws:iam::000000000000:role/ddk-abcdefgh--deploy-role-000000000000-us-west-2",
      "cfn_execution_role":
        "arn:aws:iam::000000000000:role/ddk-abcdefgh-cfn-exec-role-000000000000-us-west-2",
      "file_publish_role":
        "arn:aws:iam::000000000000:role/ddk-abcdefgh-file-publishing-role-000000000000-us-west-2",
      "lookup_role": "arn:aws:iam::000000000000:role/ddk-abcdefgh-lookup-role-000000000000-us-west-2",
    }
  }
}
```

The stack synthesizer will be created for your app using all values specified in `Configurator()` and resort to default `cdk bootstrap` values when not explicitly set.

**Note**: The values for `account` and `region` will be default to `CDK_DEFAULT_ACCOUNT` and `CDK_DEFAULT_REGION` if not explicitly set in the environment config.



### Using Legacy DDK Bootstrap Roles
If you are familiar with the `<1.0.0` versions of the DDK there was a [separate package](https://pypi.org/project/aws-ddk/) including a CLI with a `ddk bootstrap -e ${ENVIRONMENT_ID}` command. This builds a bootstrap stack with slightly modified resources as compared to CDK's native bootstrap method. Let's look at an example of using existing DDK bootstrap roles with newer versions of the DDK core library.

0. Assume we have deployed a DDK bootstrap stack for a `dev` environment in our account.
![Stack](/aws-ddk/img/ddk-bootstrap-stack.png)
1. Configure `ddk.json` with the prefix: `ddk` to indicate any stacks created within this environment should use ddk bootstrap roles.
```json
{
  "environments": {
    "dev": {
      "bootstrap": {
        "prefix": "ddk"
      }
    }
  }
}
```
2. Use [BaseStack](https://constructs.dev/packages/aws-ddk-core/v/1.0.0-beta.1/api/BaseStack?lang=typescript) with the `dev` environment passed as a property.
{% tabs language %}
{% tab language typescript %}
```javascript
import * as cdk from "aws-cdk-lib";
import { BaseStack } from "aws-ddk-core";

const app = new cdk.App();
const stack = new BaseStack(app, 'ExampleStack', {environmentId: "dev"})
console.log(stack.synthesizer)
```
{% endtab %}
{% tab language python %}
```python
import aws_cdk as cdk
from aws_ddk_core import BaseStack

app = cdk.App()
stack = BaseStack(app, "ExampleStack", environment_id: "dev")
print(stack.synthesizer)
app.synth()
```
{% endtab %}
3. Run `cdk synth` and validate the stack is using the correct roles.
![Console.log](/aws-ddk/img/stack-synthesizer.png)
{% endtabs %}
