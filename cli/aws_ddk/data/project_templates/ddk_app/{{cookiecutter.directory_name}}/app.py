#!/usr/bin/env python3

import aws_cdk as cdk
from {{cookiecutter.package_name}}.{{cookiecutter.stack_file_name}} import {{cookiecutter.stack_name}}

app = cdk.App()
{{cookiecutter.stack_name}}(app, "{{cookiecutter.stack_name}}", "{{cookiecutter.environment_id}}")

app.synth()
