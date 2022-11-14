import logging
import platform
from typing import Optional

import aws_cdk.aws_lambda as lmbda
import boto3
from constructs import Construct

AWS_SDK_PANDAS_ARTIFACT_ACCOUNT_ID = "336392948345"
MAX_VERSION_POLL = 50
LAYER_PREFIXES = ["AWSDataWrangler", "AWSSDKPandas"]
logging.basicConfig()
logger = logging.getLogger("aws-sdk-pandas-layer-lookup")


def _get_python_version() -> str:
    return "Python" + "".join(platform.python_version().split(".")[0:2])


def _latest_layer(boto3_client: boto3.client, region: str = "us-east-1", scan_buffer_range: int = 25) -> str:
    layer_arn = (
        f"arn:aws:lambda:{region}:{AWS_SDK_PANDAS_ARTIFACT_ACCOUNT_ID}:layer:AWSSDKPandas-{_get_python_version()}"
    )
    logger.debug(f" Layer Arn: {layer_arn}")
    logger.debug(" Scanning versions for latest...")
    latest = False
    version = 1
    while not latest:
        try:
            response = boto3_client.get_layer_version(
                LayerName=layer_arn,
                VersionNumber=version,
            )
            description = response["Description"]
            version += 1
        except Exception:
            scan_buffer_range -= 1
            if scan_buffer_range == 0:
                latest = True
        latest_version = version - 1
        logger.debug(f" Latest version is {latest_version}. Arn: {layer_arn}:{latest_version}. {description}")
        return f"{layer_arn}:{latest_version}"


def _get_layer_for_version(version: str, boto3_client: boto3.client, region: str = "us-east-1") -> str:
    layer_arns = [
        f"arn:aws:lambda:{region}:{AWS_SDK_PANDAS_ARTIFACT_ACCOUNT_ID}:layer:{prefix}-{_get_python_version()}"
        for prefix in LAYER_PREFIXES
    ]

    for layer_arn in layer_arns:
        existing_version = True
        increment_version = 1
        while existing_version:
            try:
                response = boto3_client.get_layer_version(
                    LayerName=layer_arn,
                    VersionNumber=increment_version,
                )
                if version in response["Description"]:
                    return f"{layer_arn}:{increment_version}"
                increment_version += 1
            except Exception:
                increment_version += 1
                existing_version = False if increment_version >= MAX_VERSION_POLL else True
    return None


def pandas_sdk_layer(
    scope: Construct,
    id: Optional[str] = "pandas-sdk-layer",
    region: Optional[str] = "us-east-1",
    version: Optional[str] = None,
) -> lmbda.LayerVersion:
    logger.debug(f" Scanning region: {region}")
    lambda_client = boto3.client("lambda", region_name=region)
    if not version:
        return lmbda.LayerVersion.from_layer_version_arn(
            scope, id, layer_version_arn=_latest_layer(lambda_client, region=region)
        )
    else:
        return lmbda.LayerVersion.from_layer_version_arn(
            scope, id, layer_version_arn=_get_layer_for_version(version, lambda_client, region=region)
        )
