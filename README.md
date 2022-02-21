# AWS DataOps Development Kit (DDK)

The AWS DataOps Development Kit is an open source development framework for customers that build data workflows and modern data architecture on AWS.

Based on the [AWS CDK](https://github.com/aws/aws-cdk), it offers high-level abstractions allowing you to build pipelines that manage data flows on AWS, driven by DevOps best practices.  The framework is extensible, you can add abstractions for your own data processing infrastructure or replace our best practices with your own standards. It's easy to share templates, so everyone in your organisation can concentrate on the business logic of dealing with their data, rather than boilerplate logic.

---

The **DDK Core** is a library of CDK constructs that you can use to build data workflows and modern data architecture on AWS, following our best practice. The DDK Core is modular and extensible, if our best practice doesn't work for you, then you can update and share your own version with the rest of your organisation by leveraging a private **AWS Code Artifact** repository.

You can compose constructs from the DDK Core into a **DDK App**.  Your DDK App can also add contain constructs from the CDK Framework or the [AWS Construct Library](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html).

You can use the **DDK CLI** to manage your DDK App.  You can use it to create a new app from a template, or deploy your DDK app to AWS.

## Getting Started

For a detailed walk-through, check out our [Workshop](https://catalog.us-east-1.prod.workshops.aws/workshops/3644b48b-1d7c-43ef-a353-6edcd96385af/en-US).

### At a glance

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

## Getting Help

The best way to interact with our team is through GitHub.  You can open an issue and choose from one of our templates for bug reports, feature requests, or documentation issues.  If you have a feature request, don't forget you can search existing issues and upvote or comment on existing issues before creating a new one.

## Contributing

We welcome community contributions and pull requests.  Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to set up a development
environment and submit code.

## Other Ways to Support

One way you can support our project is by letting others know that your organisation uses the DDK.  If you would like us to include your company's name and/or logo in this README file, please raise a 'Support the DDK' issue.  Note that by raising a this issue (and related pull request), you are granting AWS permission to use your company’s name (and logo) for the limited purpose described here and you are confirming that you have authority to grant such permission.

## License
This project is licensed under the Apache-2.0 License.