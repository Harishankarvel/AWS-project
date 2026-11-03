# app.py
"""Streamlit UI for the Farmer‑to‑Consumer platform.
Provides three tabs:
1️⃣ Farmer portal – list produce, upload image to S3, get price recommendation.
2️⃣ Consumer storefront – browse catalog, filter by location, add to cart, checkout.
3️⃣ Admin dashboard – view supply & price trends.
"""

import os
import json
import boto3
import streamlit as st
import pandas as pd
import requests
from datetime import datetime
from utils.aws_helpers import upload_file, generate_presigned_url, get_s3_client, get_dynamo_client, start_state_machine

# ------------------------------------------------------------
# Configuration – read from environment variables (or .env during local dev)
# ------------------------------------------------------------
REGION = os.getenv("REGION", "us-east-1")
API_ENDPOINT = os.getenv("API_ENDPOINT", "http://localhost:3000")  # placeholder when running locally
MODEL_ENDPOINT = f"{API_ENDPOINT}/infer"
ORDER_STATE_MACHINE_ARN = os.getenv("ORDER_STATE_MACHINE_ARN", "")
S3_BUCKET = os.getenv("S3_BUCKET", "f2c-model-bucket")

# ------------------------------------------------------------
# Streamlit layout
# ------------------------------------------------------------
st.set_page_config(page_title="F2C Marketplace", layout="wide")

st.title("🌾 Farmer‑to‑Consumer Marketplace")

tab_farmer, tab_consumer, tab_admin = st.tabs(["Farmer Portal", "Consumer Storefront", "Admin Dashboard"])

# ---------- Farmer Portal ----------
with tab_farmer:
    st.header("List Your Produce")
    with st.form(key="list_produce"):
        commodity = st.selectbox("Commodity", ["Wheat", "Rice", "Maize", "Soybean"])
        district = st.selectbox("District", ["North", "South", "East", "West"])
        arrival_qty = st.number_input("Arrival Quantity (kg)", min_value=1, step=1)
        cpi = st.number_input("CPI Inflation Index", min_value=0.0, value=100.0)
        fuel = st.number_input("Fuel Price Index", min_value=0.0, value=70.0)
        seasonality = st.slider("Seasonality (multiplier)", 0.5, 1.5, 1.0)
        image_file = st.file_uploader("Upload Crop Image", type=["png", "jpg", "jpeg"])
        submit = st.form_submit_button("Submit Listing")

    if submit:
        # 1️⃣ Upload image to S3 (if provided)
        image_url = None
        if image_file:
            s3_key = f"images/{datetime.utcnow().isoformat()}_{image_file.name}"
            s3 = get_s3_client()
            s3.upload_fileobj(image_file, S3_BUCKET, s3_key)
            image_url = generate_presigned_url(s3_key, expires_in=86400)

        # 2️⃣ Call inference Lambda for price recommendation
        payload = {
            "commodity": commodity,
            "district": district,
            "arrival_qty": arrival_qty,
            "cpi_inflation_index": cpi,
            "fuel_price_index": fuel,
            "seasonality": seasonality,
        }
        try:
            response = requests.post(MODEL_ENDPOINT, json=payload, timeout=10)
            response.raise_for_status()
            price_data = response.json()
        except Exception as e:
            st.error(f"Failed to get price recommendation: {e}")
            price_data = None

        # 3️⃣ Persist listing to DynamoDB
        table = get_dynamo_client()
        listing_id = f"listing#{datetime.utcnow().isoformat()}"
        item = {
            "pk": listing_id,
            "sk": "METADATA",
            "type": "PRODUCE",
            "commodity": commodity,
            "district": district,
            "arrival_qty": arrival_qty,
            "image_url": image_url or "",
            "created_at": datetime.utcnow().isoformat(),
        }
        if price_data:
            item.update({
                "recommended_price": price_data["recommended_price"],
                "price_range_low": price_data["fair_price_range"]["low"],
                "price_range_high": price_data["fair_price_range"]["high"],
                "inflation_warning": price_data["inflation_warning_flag"],
            })
        table.put_item(Item=item)
        st.success("Produce listed successfully!")
        st.json(item)

# ---------- Consumer Storefront ----------
with tab_consumer:
    st.header("Browse Produce")
    # Simple scan of DynamoDB for demo purposes (replace with query in prod)
    table = get_dynamo_client()
    resp = table.scan(FilterExpression="attribute_exists(commodity)")
    items = resp.get("Items", [])
    df = pd.DataFrame(items)
    if not df.empty:
        st.dataframe(df[["pk", "commodity", "district", "arrival_qty", "recommended_price"]])
        st.info("Select a listing to add to your cart (functionality omitted for brevity).")
    else:
        st.info("No produce available at the moment.")

    st.subheader("Checkout")
    with st.form(key="checkout"):
        order_id = st.text_input("Order ID", value=f"order#{datetime.utcnow().isoformat()}")
        listing_pk = st.text_input("Listing PK")
        quantity = st.number_input("Quantity (kg)", min_value=1, step=1)
        submit_order = st.form_submit_button("Place Order")
    if submit_order:
        if not ORDER_STATE_MACHINE_ARN:
            st.error("Order state machine ARN not configured.")
        else:
            execution_arn = start_state_machine(
                ORDER_STATE_MACHINE_ARN,
                {
                    "order_id": order_id,
                    "listing_pk": listing_pk,
                    "quantity": quantity,
                    "timestamp": datetime.utcnow().isoformat(),
                },
            )
            st.success(f"Order placed. Execution ARN: {execution_arn}")

# ---------- Admin Dashboard ----------
with tab_admin:
    st.header("Analytics Dashboard")
    # Load latest synthetic dataset (if present) for charting
    data_path = os.path.join(os.path.dirname(__file__), "data", "synthetic_agri.csv")
    if os.path.exists(data_path):
        df = pd.read_csv(data_path, parse_dates=["date"])
        st.line_chart(df.set_index("date")["historical_price"])
        st.subheader("Price distribution by commodity")
        st.bar_chart(df.groupby("commodity")["historical_price"].mean())
    else:
        st.info("Synthetic dataset not found. Run generate_data.py & train_model.py locally to see charts.")
