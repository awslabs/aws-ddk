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
from typing import Optional

from aws_ddk.sh import run
from aws_ddk.utils import get_account_id, get_region
from click import echo

_logger: logging.Logger = logging.getLogger(__name__)


def cdk_deploy(
    profile: str,
    require_approval: Optional[str] = None,
    force: Optional[bool] = None,
    output_dir: Optional[str] = None,
) -> None:

    echo(f"Deploying DDK stacks to AWS account {get_account_id()} and region {get_region()}...")

    # generate command
    cmd = (
        "cdk deploy "
        f"--profile {profile} "
        f"{'--require-approval ' + require_approval + ' ' if require_approval else ''}"
        f"{'-f ' if force else ''}"
        f"--output {output_dir if output_dir else '.ddk.out'}"
    )

    try:
        run(cmd)
    except Exception:
        raise SystemExit(f"ERROR - Failed to run `{cmd}`. See output above.")
    echo("Done.")
