# lambda_inference/lambda_function.py
"""AWS Lambda handler for price inference.
Downloads the XGBoost model from S3 on first warm start, then processes
incoming API Gateway proxy events containing listing details.
Returns ``recommended_price``, a ``fair_price_range`` (±5 %) and an
``inflation_warning_flag``.
"""

import os
import json
import boto3
import joblib
import numpy as np
import xgboost as xgb
from typing import Dict, Any

# ------------------------------------------------------------
# Environment configuration (set by the SAM template)
# ------------------------------------------------------------
REGION = os.getenv("REGION", "us-east-1")
BUCKET = os.getenv("S3_BUCKET", "f2c-model-bucket")
MODEL_KEY = os.getenv("MODEL_KEY", "models/agri_price_xgboost.pkl")

s3_client = boto3.client("s3", region_name=REGION)
_model: xgb.XGBRegressor | None = None

def _load_model() -> xgb.XGBRegressor:
    """Download the serialized model from S3 into ``/tmp`` and deserialize.
    Lambda provides up to 512 MiB of temporary storage which persists across
    invocations in a warm container.
    """
    local_path = "/tmp/agri_price_xgboost.pkl"
    if not os.path.exists(local_path):
        s3_client.download_file(BUCKET, MODEL_KEY, local_path)
    return joblib.load(local_path)

def _get_model() -> xgb.XGBRegressor:
    global _model
    if _model is None:
        _model = _load_model()
    return _model

def _prepare_features(payload: Dict[str, Any]):
    """Convert the incoming JSON payload into the numeric feature vector
    expected by the model.

    The training script used ordinal encoding for the two categorical fields;
    we keep the same hard‑coded mapping here to stay in sync.
    """
    commodity_map = {"Wheat": 0, "Rice": 1, "Maize": 2, "Soybean": 3}
    district_map = {"North": 0, "South": 1, "East": 2, "West": 3}

    return np.array([
        commodity_map.get(payload.get("commodity"), -1),
        district_map.get(payload.get("district"), -1),
        int(payload.get("arrival_qty", 0)),
        float(payload.get("cpi_inflation_index", 100.0)),
        float(payload.get("fuel_price_index", 70.0)),
        float(payload.get("seasonality", 1.0)),
    ]).reshape(1, -1)

def lambda_handler(event: Dict[str, Any], context):
    """Entry‑point for API Gateway *proxy* integration.
    ``event['body']`` contains a JSON string with the required fields.
    """
    # -----------------------------------------------------------------
    # Parse request body
    # -----------------------------------------------------------------
    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Invalid JSON payload"}),
        }

    required = [
        "commodity",
        "district",
        "arrival_qty",
        "cpi_inflation_index",
        "fuel_price_index",
        "seasonality",
    ]
    missing = [k for k in required if k not in body]
    if missing:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": f"Missing fields: {', '.join(missing)}"}),
        }

    # -----------------------------------------------------------------
    # Model inference
    # -----------------------------------------------------------------
    model = _get_model()
    features = _prepare_features(body)
    predicted_price = float(model.predict(features)[0])

    # Fair price range (±5 %)
    low = round(predicted_price * 0.95, 2)
    high = round(predicted_price * 1.05, 2)

    # Simple inflation warning flag – arbitrary threshold
    inflation_flag = float(body.get("cpi_inflation_index", 100)) > 110

    response_body = {
        "recommended_price": round(predicted_price, 2),
        "fair_price_range": {"low": low, "high": high},
        "inflation_warning_flag": inflation_flag,
    }

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(response_body),
    }
