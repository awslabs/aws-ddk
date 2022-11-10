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

from aws_ddk_core.resources import lookup_pandas_sdk_layer


def test_lookup_latest_sdk_pandas_version() -> None:
    regions = [
      "us-east-1",
      "us-east-2",
      "us-west-1",
      "us-west-2",
      "eu-west-1",
      "ap-northeast-1"
    ]
    for region in regions:
      layer_arn = lookup_pandas_sdk_layer(region=region)
      assert layer_arn is not None

def test_lookup_explicit_sdk_pandas_version() -> None:
    regions = [
      "us-east-1",
      "us-east-2",
      "us-west-1",
      "us-west-2",
      "eu-west-1",
      "ap-northeast-1"
    ]
    version = "2.15.1"
    for region in regions:
      layer_arn = lookup_pandas_sdk_layer(region=region, version=version)
      assert layer_arn is not None
