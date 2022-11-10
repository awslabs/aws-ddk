import logging
import platform

import boto3

AWS_SDK_PANDAS_ARTIFACT_ACCOUNT_ID = "336392948345"
MAX_VERSION_POLL = 50
LAYER_PREFIXES = ["AWSDataWrangler", "AWSSDKPandas"]
logging.basicConfig()
logger = logging.getLogger("aws-sdk-pandas-layer-lookup")


def _get_python_version() -> str:
    return "Python" + "".join(platform.python_version().split(".")[0:2])


def _latest_layer(boto3_client: boto3.client, region="us-east-1") -> str:
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


def lookup_pandas_sdk_layer(
    region: str = "us-east-1",
    version: str = None,
) -> str:
    logger.debug(f" Scanning region: {region}")
    lambda_client = boto3.client("lambda", region_name=region)
    if not version:
        return _latest_layer(lambda_client, region=region)
    else:
        return _get_layer_for_version(version, lambda_client, region=region)
