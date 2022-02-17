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
import shlex
import subprocess
from typing import Iterable, Optional

from aws_ddk.exceptions import FailedShellCommand
from click import echo

_logger: logging.Logger = logging.getLogger(__name__)


def _clean_up_stdout_line(line: bytes) -> str:
    line_str = line.decode("utf-8")
    return line_str[:-1] if line_str.endswith("\n") else line_str


def _run_iterating(cmd: str, cwd: Optional[str] = None) -> Iterable[str]:
    p = subprocess.Popen(shlex.split(cmd), cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    if p.stdout is None:
        return []
    while p.poll() is None:
        yield _clean_up_stdout_line(line=p.stdout.readline())
    if p.returncode != 0:
        raise FailedShellCommand(f"Exit code: {p.returncode}")


def run(cmd: str, cwd: Optional[str] = None, hide_cmd: bool = False) -> None:
    if hide_cmd is False:
        _logger.debug(f"+ {cmd}")
    for line in _run_iterating(cmd=cmd, cwd=cwd):
        echo(line)
