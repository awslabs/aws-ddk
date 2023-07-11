import boto3
import time

stacks = [
  "EmrServerlessTest"
]
polling_duration = 5
client = boto3.client("cloudformation")
for stack in stacks: 
  drift_detection_id = client.detect_stack_drift(StackName=stack)['StackDriftDetectionId']
  while client.describe_stack_drift_detection_status(StackDriftDetectionId=drift_detection_id)['DetectionStatus'] == "DETECTION_IN_PROGRESS":
    print("Waiting for drift detection...")
    time.sleep(polling_duration)
  drift_status = client.describe_stack_drift_detection_status(StackDriftDetectionId=drift_detection_id)['StackDriftStatus']
  print(f"Stack: '{stack}' drift status: {drift_status}")
  if drift_status == "DRIFTED":
    print("Remediating Drift")