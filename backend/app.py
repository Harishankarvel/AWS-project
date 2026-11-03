import os
import json
import joblib
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import pymysql
import pymysql.cursors

# Resolve project root
BASE_DIR = Path(__file__).parent

# Load the trained model
MODEL_PATH = BASE_DIR.parent / "model" / "model.pkl"
try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    model = None
    print(f"Warning: Could not load model: {e}")

# Load product catalogue
CATALOGUE_PATH = BASE_DIR / "catalogue.json"
try:
    with open(CATALOGUE_PATH, "r", encoding="utf-8") as f:
        catalogue = json.load(f)
except Exception as e:
    catalogue = []

app = FastAPI(title="Price-Inflation E-Commerce & Auth API")

# Enable CORS for React Frontend (runs on localhost:5173 / 3000 / 8080)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL connection configuration
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DB = os.getenv("MYSQL_DB", "AWS")

def get_db_connection():
    try:
        return pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DB,
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection error: {str(e)}. Please ensure MySQL is running and database 'AWS' exists."
        )

# Pydantic Schemas
class LoginRequest(BaseModel):
    role: str  # 'user', 'seller', 'admin'
    email: str
    password: str

class SignUpRequest(BaseModel):
    role: str  # 'user', 'seller', 'admin'
    email: str
    password: str
    full_name: str
    farm_name: Optional[str] = None
    district: Optional[str] = None
    phone: Optional[str] = None

class InferRequest(BaseModel):
    commodity: str
    district: str
    arrival_qty: float
    cpi_inflation_index: float
    fuel_price_index: float
    seasonality: float

# Role-to-table mapper
ROLE_TABLES = {
    "user": "user_credentials",
    "seller": "seller_credentials",
    "admin": "admin_credentials"
}

@app.get("/catalogue", response_model=List[dict])
def get_catalogue():
    return catalogue

@app.post("/infer")
def infer(request: InferRequest):
    try:
        commodity_map = {"Apple": 0, "Banana": 1, "Carrot": 2, "Tomato": 3, "Wheat": 4, "Rice": 5}
        district_map = {"North": 0, "South": 1, "East": 2, "West": 3, "Central": 4}

        comm_code = commodity_map.get(request.commodity, 0)
        dist_code = district_map.get(request.district, 0)

        import pandas as pd
        features_df = pd.DataFrame([{
            "commodity": comm_code,
            "district": dist_code,
            "arrival_qty": float(request.arrival_qty),
            "cpi_inflation_index": float(request.cpi_inflation_index),
            "fuel_price_index": float(request.fuel_price_index),
            "seasonality": float(request.seasonality)
        }])

        if model and hasattr(model, "predict"):
            pred = model.predict(features_df)[0]
        else:
            pred = request.arrival_qty * 1.1

        return {"recommended_price": round(float(pred), 2)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login")
def login(req: LoginRequest):
    """
    Authenticate against role table in AWS database:
    - seller_credentials
    - user_credentials
    - admin_credentials
    """
    table = ROLE_TABLES.get(req.role.lower())
    if not table:
        raise HTTPException(status_code=400, detail="Invalid role specified. Must be user, seller, or admin.")

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            query = f"SELECT * FROM `{table}` WHERE `email` = %s LIMIT 1"
            cursor.execute(query, (req.email,))
            account = cursor.fetchone()

            if not account:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No account found with email '{req.email}' for {req.role.capitalize()}. Please sign up."
                )

            # Compare password (plain string check or hash)
            if account["password_hash"] != req.password:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect password."
                )

            return {
                "success": True,
                "message": f"Login successful as {req.role.capitalize()}!",
                "user": {
                    "id": account["id"],
                    "email": account["email"],
                    "name": account["full_name"],
                    "role": req.role.lower(),
                    "farmName": account.get("farm_name"),
                    "district": account.get("district"),
                    "phone": account.get("phone")
                }
            }
    finally:
        conn.close()

@app.post("/api/auth/signup")
def signup(req: SignUpRequest):
    """
    Register a new user, seller, or admin into the corresponding MySQL table.
    """
    table = ROLE_TABLES.get(req.role.lower())
    if not table:
        raise HTTPException(status_code=400, detail="Invalid role specified.")

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Check if email exists
            cursor.execute(f"SELECT `id` FROM `{table}` WHERE `email` = %s LIMIT 1", (req.email,))
            if cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"An account with email '{req.email}' already exists. Please log in instead."
                )

            if req.role.lower() == "seller":
                if not req.farm_name:
                    req.farm_name = f"{req.full_name}'s Farm"
                cursor.execute(
                    f"INSERT INTO `{table}` (`full_name`, `email`, `password_hash`, `farm_name`, `district`, `phone`) VALUES (%s, %s, %s, %s, %s, %s)",
                    (req.full_name, req.email, req.password, req.farm_name, req.district, req.phone)
                )
            elif req.role.lower() == "admin":
                cursor.execute(
                    f"INSERT INTO `{table}` (`full_name`, `email`, `password_hash`) VALUES (%s, %s, %s)",
                    (req.full_name, req.email, req.password)
                )
            else:  # user
                cursor.execute(
                    f"INSERT INTO `{table}` (`full_name`, `email`, `password_hash`, `phone`) VALUES (%s, %s, %s, %s)",
                    (req.full_name, req.email, req.password, req.phone)
                )

            new_id = cursor.lastrowid
            return {
                "success": True,
                "message": "Account created successfully! You are now logged in.",
                "user": {
                    "id": new_id,
                    "email": req.email,
                    "name": req.full_name,
                    "role": req.role.lower(),
                    "farmName": req.farm_name,
                    "district": req.district,
                    "phone": req.phone
                }
            }
    finally:
        conn.close()

# -------------------------------------------------------------
# USER ORDERS HISTORY API (Separated Per User Email)
# -------------------------------------------------------------
class SaveOrderRequest(BaseModel):
    order_id: str
    user_email: str
    user_name: str
    order_date: str
    order_month: str
    items: List[dict]
    total_amount: float
    payment_method: Optional[str] = "UPI"
    delivery_address: Optional[dict] = None
    order_status: Optional[str] = "Order Placed (In Transit 🚚)"

@app.post("/api/orders")
def save_order(req: SaveOrderRequest):
    """Save an order directly to MySQL under the specific user's email."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO `user_orders_history` 
                (`order_id`, `user_email`, `user_name`, `order_date`, `order_month`, `items_json`, `total_amount`, `payment_method`, `delivery_address`, `order_status`)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    req.order_id,
                    req.user_email,
                    req.user_name,
                    req.order_date,
                    req.order_month,
                    json.dumps(req.items),
                    req.total_amount,
                    req.payment_method,
                    json.dumps(req.delivery_address) if req.delivery_address else None,
                    req.order_status
                )
            )
        return {"success": True, "message": "Order saved to user_orders_history table in MySQL", "order_id": req.order_id}
    finally:
        conn.close()

@app.get("/api/orders/{user_email}")
def get_user_orders(user_email: str):
    """Retrieve only orders belonging to the specified customer."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM `user_orders_history` WHERE `user_email` = %s ORDER BY `id` DESC",
                (user_email,)
            )
            rows = cursor.fetchall()
            orders_list = []
            for r in rows:
                orders_list.append({
                    "id": r["order_id"],
                    "date": r["order_date"],
                    "month": r["order_month"],
                    "items": json.loads(r["items_json"]) if isinstance(r["items_json"], str) else r["items_json"],
                    "total": float(r["total_amount"]),
                    "paymentMethod": r["payment_method"],
                    "address": json.loads(r["delivery_address"]) if (r["delivery_address"] and isinstance(r["delivery_address"], str)) else r["delivery_address"],
                    "status": r["order_status"],
                    "userEmail": r["user_email"],
                    "userName": r["user_name"]
                })
            return orders_list
    finally:
        conn.close()

# -------------------------------------------------------------
# SELLER PRODUCTS API (Separated Per Seller Email)
# -------------------------------------------------------------
class AddSellerProductRequest(BaseModel):
    product_id: str
    seller_email: str
    seller_name: str
    product_name: str
    category: str
    base_price: float
    stock_quantity: int
    unit: Optional[str] = "kg"
    image_icon: Optional[str] = "🌾"

@app.post("/api/seller/products")
def add_seller_product(req: AddSellerProductRequest):
    """Save newly listed produce into MySQL under the specific seller's email."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO `seller_products`
                (`product_id`, `seller_email`, `seller_name`, `product_name`, `category`, `base_price`, `stock_quantity`, `unit`, `image_icon`)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    `base_price` = VALUES(`base_price`),
                    `stock_quantity` = VALUES(`stock_quantity`),
                    `product_name` = VALUES(`product_name`)
                """,
                (
                    req.product_id,
                    req.seller_email,
                    req.seller_name,
                    req.product_name,
                    req.category,
                    req.base_price,
                    req.stock_quantity,
                    req.unit,
                    req.image_icon
                )
            )
        return {"success": True, "message": "Product saved to seller_products table in MySQL", "product_id": req.product_id}
    finally:
        conn.close()

@app.get("/api/seller/products/{seller_email}")
def get_seller_products(seller_email: str):
    """Retrieve only products listed by the specified seller."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM `seller_products` WHERE `seller_email` = %s ORDER BY `id` DESC",
                (seller_email,)
            )
            rows = cursor.fetchall()
            return rows
    finally:
        conn.close()
