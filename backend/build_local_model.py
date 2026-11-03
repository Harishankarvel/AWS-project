import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import xgboost as xgb

# Paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'synthetic_agri.csv')
MODEL_DIR = os.path.join(BASE_DIR, '..', 'model')  # project_root/model
MODEL_PATH = os.path.join(MODEL_DIR, 'model.pkl')

# Ensure model directory exists
os.makedirs(MODEL_DIR, exist_ok=True)

# Load data
print(f"Loading data from {DATA_PATH}")
df = pd.read_csv(DATA_PATH)

# Prepare features (same as train_model.py)
df = df.copy()
df["commodity"] = df["commodity"].astype("category").cat.codes
df["district"] = df["district"].astype("category").cat.codes
X = df[["commodity", "district", "arrival_qty", "cpi_inflation_index", "fuel_price_index", "seasonality"]]
y = df["historical_price"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = xgb.XGBRegressor(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="reg:squarederror",
    n_jobs=4,
    random_state=42,
)
model.fit(X_train, y_train)

# Evaluate
preds = model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, preds))
r2 = r2_score(y_test, preds)
print(f"RMSE: {rmse:.2f}")
print(f"R2: {r2:.4f}")

# Save locally
joblib.dump(model, MODEL_PATH)
print(f"Model saved locally to {MODEL_PATH}")
