import pymysql
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

db_url = os.getenv("DATABASE_URL")
parsed = urlparse(db_url)

host = parsed.hostname
port = parsed.port or 3306
user = parsed.username
password = parsed.password
db_name = parsed.path.lstrip('/')

print(f"Connecting to MySQL at {host}:{port} as {user}...")

try:
    conn = pymysql.connect(
        host=host,
        user=user,
        password=password,
        port=port
    )
    cursor = conn.cursor()
    print(f"Dropping database '{db_name}'...")
    cursor.execute(f"DROP DATABASE IF EXISTS {db_name}")
    print(f"Creating database '{db_name}'...")
    cursor.execute(f"CREATE DATABASE {db_name}")
    print("Database reset successfully.")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error resetting database: {e}")
