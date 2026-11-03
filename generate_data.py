# generate_data.py
"""Synthetic dataset generator for the F2C price inflation model.
Generates 3 years of daily records with columns:
- commodity (str)
- district (str)
- arrival_qty (int)
- historical_price (float)
- cpi_inflation_index (float)
- fuel_price_index (float)
- seasonality (float)
"""

import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_dataset(start_date: str = "2020-01-01", years: int = 3) -> pd.DataFrame:
    end_date = datetime.strptime(start_date, "%Y-%m-%d") + timedelta(days=365 * years)
    dates = pd.date_range(start=start_date, end=end_date, freq="D")

    commodities = ["Wheat", "Rice", "Maize", "Soybean"]
    districts = ["North", "South", "East", "West"]

    data = []
    rng = np.random.default_rng()
    for date in dates:
        commodity = rng.choice(commodities)
        district = rng.choice(districts)
        arrival_qty = int(rng.integers(100, 5000))
        # Base price varies per commodity
        base_price = {
            "Wheat": 200,
            "Rice": 250,
            "Maize": 180,
            "Soybean": 300,
        }[commodity]
        # Seasonal multiplier (sin wave over a year)
        day_of_year = date.timetuple().tm_yday
        seasonality = 0.9 + 0.2 * np.sin(2 * np.pi * day_of_year / 365)
        # CPI and fuel indices slowly drift upwards
        cpi = 100 + (date - pd.Timestamp(start_date)).days * 0.02 + rng.normal(0, 0.5)
        fuel = 70 + (date - pd.Timestamp(start_date)).days * 0.015 + rng.normal(0, 0.3)
        historical_price = base_price * seasonality * (cpi / 100) * (fuel / 70)
        data.append(
            {
                "date": date.date(),
                "commodity": commodity,
                "district": district,
                "arrival_qty": arrival_qty,
                "historical_price": round(historical_price, 2),
                "cpi_inflation_index": round(cpi, 2),
                "fuel_price_index": round(fuel, 2),
                "seasonality": round(seasonality, 3),
            }
        )
    df = pd.DataFrame(data)
    return df

if __name__ == "__main__":
    output_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(output_dir, exist_ok=True)
    df = generate_dataset()
    csv_path = os.path.join(output_dir, "synthetic_agri.csv")
    df.to_csv(csv_path, index=False)
    print(f"Synthetic dataset written to {csv_path}")
