# Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License").
# You may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import logging
import sys
from typing import Optional

from aws_ddk.sh import run
from aws_ddk.utils import is_in_git_repository
from click import echo, secho
from cookiecutter.main import cookiecutter

_logger: logging.Logger = logging.getLogger(__name__)


def python_executable() -> str:
    if sys.platform == "win32":
        return "python"
    return "python3"


def init_project(name: str, environment: str, template: Optional[str], generate_only: Optional[bool]) -> None:
    _logger.debug(f"name: {name}")
    _logger.debug(f"environment: {environment}")
    _logger.debug(f"template: {template}")
    _logger.debug(f"generate_only: {generate_only}")

    python_exec: str = python_executable()

    # Initialize from a project template
    echo("Initializing AWS DDK project...")
    path: str = cookiecutter(
        template,
        no_input=True,
        extra_context={
            "directory_name": name,
            "environment_id": environment,
            "python_executable": python_exec,
        },
    )

    if not generate_only:
        # Create git repository
        if not is_in_git_repository(path):
            echo("Initializing a new git repository...")
            cmds = [
                "git init",
                "git checkout -b main",
                "git add .",
                "git commit --message='Initial commit' --no-gpg-sign",
            ]
            try:
                for cmd in cmds:
                    run(cmd, path)
            except Exception:
                secho(f"Failed to run `{cmd}`", blink=True, bold=True, fg="red")

        # Create virtual environment (.venv)
        echo(f"Creating virtual environment in `{path}`...")
        cmd = f"{python_exec} -m venv '{path}/.venv'"
        try:
            run(cmd)
        except Exception:
            secho(f"Failed to run `{cmd}`", blink=True, bold=True, fg="red")

    echo("Done.")
