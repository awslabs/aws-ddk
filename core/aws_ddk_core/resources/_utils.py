import logging
import platform
from typing import Any, Optional

import aws_cdk as cdk
import aws_cdk.aws_lambda as lmbda
import boto3
from aws_ddk_core.config import Config
from constructs import Construct
from mypy_boto3_lambda.client import LambdaClient

AWS_SDK_PANDAS_ARTIFACT_ACCOUNT_ID = "336392948345"
MAX_VERSION_POLL = 50
LAYER_PREFIXES = ["AWSDataWrangler", "AWSSDKPandas"]
CONTEXT_VALUE_NAME = "pandas_sdk_lambda_layer_version_arn"
logging.basicConfig()
logger = logging.getLogger("aws-sdk-pandas-layer-lookup")


def _get_python_version() -> str:
    return "Python" + "".join(platform.python_version().split(".")[0:2])


def _latest_layer(boto3_client: LambdaClient, region: str = "us-east-1", scan_buffer_range: int = 10) -> Any:
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
    return None


def _get_layer_for_version(version: str, boto3_client: LambdaClient, region: str = "us-east-1") -> Any:
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
    environment_id: Optional[str] = None,
    region: Optional[str] = None,
    version: Optional[str] = None,
) -> lmbda.LayerVersion:
    """
    Retrieves AWS SDK for pandas managed Lambda Layer.

    Parameters
    ----------
    scope: Construct
        CDK stack.
    id: Optional[str]
        Logical id of lambda layer resource in scope.
    environment_id: Optional[str]
        DDK environment to pull value from
        when using DDK config to specify layer.
    region : Optional[str]
        Name of region to lookup in. Defaults to region of CDK stack.
    version: Optional[str]
        Version of AWS SDK for pandas layer i.e. '2.17.0'.
        If no version is specified the latest version
        in the region will be returned

    Returns
    -------
    lmbda.LayerVersion

    """

    region_name: str = region if region else cdk.Stack.of(scope).region

    if environment_id:
        context_layer = (
            Config.get_env_config(environment_id).get(CONTEXT_VALUE_NAME)
            if Config.get_env_config(environment_id).get(CONTEXT_VALUE_NAME)
            else scope.node.try_get_context(CONTEXT_VALUE_NAME)
        )

    if context_layer:
        return lmbda.LayerVersion.from_layer_version_arn(scope, id, layer_version_arn=context_layer)

    logger.debug(f" Scanning region: {region_name}")
    lambda_client: LambdaClient = boto3.client("lambda", region_name=region_name)  # type: ignore
    if not version:
        layer_version_arn = _latest_layer(lambda_client, region=region_name)
    else:
        layer_version_arn = _get_layer_for_version(version, lambda_client, region=region_name)

    return lmbda.LayerVersion.from_layer_version_arn(scope, id, layer_version_arn=layer_version_arn)
