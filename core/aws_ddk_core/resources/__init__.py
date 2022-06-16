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

from aws_ddk_core.resources._databrew import DataBrewFactory
from aws_ddk_core.resources._dms import DMSFactory
from aws_ddk_core.resources._glue import GlueFactory
from aws_ddk_core.resources._kinesis_firehose import KinesisFirehoseFactory
from aws_ddk_core.resources._kinesis_streams import KinesisStreamsFactory
from aws_ddk_core.resources._kms import KMSFactory
from aws_ddk_core.resources._lambda import LambdaFactory
from aws_ddk_core.resources._s3 import S3Factory
from aws_ddk_core.resources._sfn import StepFunctionsFactory
from aws_ddk_core.resources._sqs import SQSFactory

__all__ = [
    "DataBrewFactory",
    "DMSFactory",
    "GlueFactory",
    "KinesisFirehoseFactory",
    "KinesisStreamsFactory",
    "KMSFactory",
    "LambdaFactory",
    "S3Factory",
    "SQSFactory",
    "StepFunctionsFactory",
]
