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
from typing import Dict, Optional, Tuple

from aws_ddk.services import codecommit
from aws_ddk.sh import run
from aws_ddk.utils import is_in_git_repository
from click import echo, secho

_logger: logging.Logger = logging.getLogger(__name__)


def tuples_to_dict(tuples: Tuple[Tuple[str, str]]) -> Dict[str, str]:
    dict: Dict[str, str] = {}
    for k, v in tuples:
        dict.setdefault(k, v)
    return dict


def create_code_repository(
    profile: str,
    name: str,
    description: Optional[str] = None,
    tags: Optional[Tuple[Tuple[str, str]]] = None,
) -> None:
    _logger.debug(f"name: {name}")

    echo("Creating AWS CodeCommit repository...")
    dict_tags = tuples_to_dict(tags) if tags else None
    url = codecommit.create_repository(
        name=name,
        description=description,
        tags=dict_tags,
    )

    echo("Running git commands...")
    path = "."
    if is_in_git_repository(path):
        cmds = [
            f'git config --local credential.helper "!aws codecommit --profile {profile} credential-helper $@"',
            "git config --local credential.UseHttpPath true",
            f"git remote add origin {url}",
        ]
        try:
            for cmd in cmds:
                run(cmd, path)
        except Exception:
            secho(f"Failed to run `{cmd}`", blink=True, bold=True, fg="red")
    else:
        raise SystemExit("The current working directory does not contain a .git directory.")
    echo("Done.")
