---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
homePage: true
---
## Getting Started

You can install or update the AWS DDK from PyPi.

![pip install aws-ddk](img/pip-install.gif)

Create a new project:

```console
$ ddk init sample-app
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
from ddk_app.ddk_app_stack import DDKApplicationStack

app = cdk.App()
DDKApplicationStack(app, "DDKApplicationStack", "dev")

app.synth()
```

If your AWS account hasn't been used to run a DDK before, then you will need to bootstrap your environment:

```console
ddk bootstrap
```

You can then deploy your DDK app:

```console
ddk deploy
```

Congratulations!  You've just created and deployed your first AWS DDK app.  Use the links below to find out more.


