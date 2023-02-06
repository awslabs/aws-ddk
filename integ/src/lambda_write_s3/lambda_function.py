import boto3
import json
import os


sqs_client = boto3.client("sqs")
queue_url = os.environ["QUEUE_URL"]


def lambda_handler(event, context):
    print(json.dumps(event))
    sqs_client.send_message(
        QueueUrl=queue_url,
        MessageBody=event["Records"][0]["body"],
    )
