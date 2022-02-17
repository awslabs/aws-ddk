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

from aws_cdk import Environment
from aws_ddk_core.config import Config


def test_get_env_config(config_json: Config) -> None:
    assert len(config_json.get_env_config("dev")) > 0


def test_get_env(config_json: Config) -> None:
    assert config_json.get_env("dev") == Environment(account="111111111111", region="us-east-1")


def test_get_resource_config(config_json: Config) -> None:
    assert config_json.get_resource_config(environment_id="dev", id="dummy-resource")["removal_policy"] == "destroy"


def test_get_cdk_version(config_json: Config) -> None:
    assert config_json.get_cdk_version() == "2.8.0"


def test_get_tags(config_json: Config) -> None:
    assert config_json.get_tags() == {"Application": "Core"}
