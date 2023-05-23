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

import json
import logging
from typing import Any, Dict, Optional

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

appflow = boto3.client("appflow")


def lambda_handler(event: Dict[str, Any], context: Optional[Dict[str, Any]]) -> str:
    # Log the received event
    logger.info("Received event: " + json.dumps(event, indent=2))
    # Get appflow flow name from the event
    flow_name = event["FlowArn"].rsplit("/")[-1]
    # Get appflow flow execution id from the event
    execution_id = event["ExecutionId"]

    params = {"flowName": flow_name, "maxResults": 10}

    flow_execution_status = ""

    try:
        # unfortunately the appflow client does not have any paginator
        while True:
            response = appflow.describe_flow_execution_records(**params)  # type: ignore
            logger.info(response)
            execution_record = [
                execution for execution in response["flowExecutions"] if execution["executionId"] == execution_id
            ]
            if execution_record:
                flow_execution_status = execution_record[0]["executionStatus"]
                break
            if "nextToken" in response:
                params["nextToken"] = response["nextToken"]
            else:
                break
        logger.info(f"Status: {flow_execution_status}")
        return flow_execution_status
    except Exception as e:
        logger.info(e)
        message = "Error getting AppFlow flow status"
        logger.info(message)
        raise Exception(message)
