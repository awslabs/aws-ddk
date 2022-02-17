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
from typing import Any, Dict, Optional, Union

import botocore.exceptions
from aws_ddk.utils import boto3_client
from click import echo

_logger: logging.Logger = logging.getLogger(__name__)


def create_repository(name: str, description: Optional[str], tags: Optional[Dict[str, str]]) -> str:
    client = boto3_client("codecommit")
    args: Dict[str, Union[str, Dict[str, str]]] = {
        "repositoryName": name,
    }
    if description:
        args.update({"repositoryDescription": description})
    if tags:
        args.update({"tags": tags})
    try:
        resp: Dict[str, Dict[str, str]] = client.create_repository(**args)
    except botocore.exceptions.ClientError as ex:
        error: Dict[str, Any] = ex.response["Error"]
        if error["Code"] == "RepositoryNameExistsException":
            echo(f"Repository {name} already exists in the AWS account.")
            resp = client.get_repository(repositoryName=name)
        else:
            raise ex
    return resp["repositoryMetadata"]["cloneUrlHttp"]
