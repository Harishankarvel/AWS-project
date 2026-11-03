# utils/aws_helpers.py
"""Helper utilities wrapping boto3 clients for the F2C platform.
Provides typed factories and common operations used across the Streamlit UI
and Lambda functions.
"""

import os
import json
from typing import Any, Dict, List
import boto3
from botocore.exceptions import ClientError

# ------------------------------------------------------------
# Configuration – read from environment variables (set in SAM or .env)
# ------------------------------------------------------------
REGION = os.getenv("REGION", "us-east-1")
BUCKET = os.getenv("S3_BUCKET", "f2c-model-bucket")
TABLE_NAME = os.getenv("DYNAMODB_TABLE", "f2c-single-table")
USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID", "")
CLIENT_ID = os.getenv("COGNITO_CLIENT_ID", "")

# ------------------------------------------------------------
# Boto3 client factories (singletons for reuse)
# ------------------------------------------------------------
_dynamo_client = None
_s3_client = None
_cognito_client = None
_sns_client = None
_stepfunctions_client = None
_location_client = None


def get_dynamo_client():
    global _dynamo_client
    if _dynamo_client is None:
        _dynamo_client = boto3.resource("dynamodb", region_name=REGION)
    return _dynamo_client.Table(TABLE_NAME)


def get_s3_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client("s3", region_name=REGION)
    return _s3_client


def get_cognito_client():
    global _cognito_client
    if _cognito_client is None:
        _cognito_client = boto3.client("cognito-idp", region_name=REGION)
    return _cognito_client


def get_sns_client():
    global _sns_client
    if _sns_client is None:
        _sns_client = boto3.client("sns", region_name=REGION)
    return _sns_client


def get_stepfunctions_client():
    global _stepfunctions_client
    if _stepfunctions_client is None:
        _stepfunctions_client = boto3.client("stepfunctions", region_name=REGION)
    return _stepfunctions_client


def get_location_client():
    global _location_client
    if _location_client is None:
        _location_client = boto3.client("location", region_name=REGION)
    return _location_client

# ------------------------------------------------------------
# Common DynamoDB operations (single‑table design helpers)
# ------------------------------------------------------------
def put_item(item: Dict[str, Any]) -> None:
    table = get_dynamo_client()
    table.put_item(Item=item)

def get_item(key: Dict[str, Any]) -> Dict[str, Any] | None:
    table = get_dynamo_client()
    response = table.get_item(Key=key)
    return response.get("Item")

def query_items(index_name: str, key_expr: str, expr_attrs: Dict[str, Any]) -> List[Dict[str, Any]]:
    table = get_dynamo_client()
    response = table.query(IndexName=index_name, KeyConditionExpression=key_expr, ExpressionAttributeValues=expr_attrs)
    return response.get("Items", [])

# ------------------------------------------------------------
# S3 helpers (upload, download, generate presigned URL)
# ------------------------------------------------------------
def upload_file(file_path: str, s3_key: str) -> None:
    client = get_s3_client()
    client.upload_file(file_path, BUCKET, s3_key)

def download_file(s3_key: str, dest_path: str) -> None:
    client = get_s3_client()
    client.download_file(BUCKET, s3_key, dest_path)

def generate_presigned_url(s3_key: str, expires_in: int = 3600) -> str:
    client = get_s3_client()
    return client.generate_presigned_url(
        "get_object", Params={"Bucket": BUCKET, "Key": s3_key}, ExpiresIn=expires_in
    )

# ------------------------------------------------------------
# Cognito authentication helpers (OTP via SMS)
# ------------------------------------------------------------
def initiate_auth(phone_number: str) -> Dict[str, Any]:
    client = get_cognito_client()
    try:
        resp = client.initiate_auth(
            AuthFlow="CUSTOM_AUTH",
            AuthParameters={"USERNAME": phone_number},
            ClientId=CLIENT_ID,
        )
        return resp
    except ClientError as e:
        raise RuntimeError(f"Cognito auth initiation failed: {e.response['Error']['Message']}")

def respond_to_challenge(phone_number: str, challenge_response: str, session: str) -> Dict[str, Any]:
    client = get_cognito_client()
    try:
        resp = client.respond_to_auth_challenge(
            ClientId=CLIENT_ID,
            ChallengeName="CUSTOM_CHALLENGE",
            Session=session,
            ChallengeResponses={
                "USERNAME": phone_number,
                "ANSWER": challenge_response,
            },
        )
        return resp
    except ClientError as e:
        raise RuntimeError(f"Cognito challenge response failed: {e.response['Error']['Message']}")

# ------------------------------------------------------------
# SNS helper for farmer notifications
# ------------------------------------------------------------
def publish_notification(topic_arn: str, message: str, subject: str = "F2C Update") -> None:
    client = get_sns_client()
    client.publish(TopicArn=topic_arn, Message=message, Subject=subject)

# ------------------------------------------------------------
# Step Functions starter
# ------------------------------------------------------------
def start_state_machine(state_machine_arn: str, input_payload: Dict[str, Any]) -> str:
    client = get_stepfunctions_client()
    resp = client.start_execution(stateMachineArn=state_machine_arn, input=json.dumps(input_payload))
    return resp["executionArn"]

# ------------------------------------------------------------
# Location Service helper – find farms near a point
# ------------------------------------------------------------
def search_nearby_farms(latitude: float, longitude: float, radius_m: int = 50000) -> List[Dict[str, Any]]:
    client = get_location_client()
    # Assume a Place Index named 'f2c-place-index' exists (created outside this code).
    resp = client.search_place_index_for_position(
        IndexName="f2c-place-index",
        Position=[longitude, latitude],
        MaxResults=10,
        SearchAreaConstraints={
            "Polygon": [
                [longitude - 0.1, latitude - 0.1],
                [longitude + 0.1, latitude - 0.1],
                [longitude + 0.1, latitude + 0.1],
                [longitude - 0.1, latitude + 0.1],
                [longitude - 0.1, latitude - 0.1],
            ]
        },
    )
    return resp.get("Results", [])

# End of aws_helpers.py
