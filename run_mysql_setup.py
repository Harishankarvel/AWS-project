import os
import pymysql
import sys

MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))

def run_migration(password=None):
    pwd = password if password is not None else MYSQL_PASSWORD
    sql_file = os.path.join(os.path.dirname(__file__), "setup_mysql_aws.sql")
    
    with open(sql_file, "r", encoding="utf-8") as f:
        sql_script = f.read()

    print(f"Connecting to MySQL at {MYSQL_HOST}:{MYSQL_PORT} with user '{MYSQL_USER}'...")
    conn = pymysql.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=pwd,
        port=MYSQL_PORT,
        autocommit=True
    )
    cursor = conn.cursor()
    
    # Split queries by semicolon
    statements = [stmt.strip() for stmt in sql_script.split(";") if stmt.strip()]
    for stmt in statements:
        cursor.execute(stmt)
    
    print("SUCCESS: Database 'AWS' and tables ('user_credentials', 'seller_credentials', 'admin_credentials') created successfully.")
    cursor.close()
    conn.close()

if __name__ == "__main__":
    pwd = sys.argv[1] if len(sys.argv) > 1 else None
    try:
        run_migration(pwd)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
