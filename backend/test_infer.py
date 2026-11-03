import requests
import json

payload = {
    "commodity": "Apple",
    "district": "North",
    "arrival_qty": 100,
    "cpi_inflation_index": 105,
    "fuel_price_index": 75,
    "seasonality": 1.0
}

try:
    response = requests.post("http://127.0.0.1:8000/infer", json=payload)
    print("Status:", response.status_code)
    print("Response:", response.text)
except Exception as e:
    print("Error calling inference endpoint:", e)
