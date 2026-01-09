import pymysql
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

# Extract connection details from DATABASE_URL or provided directly
# URL format: mysql+aiomysql://root:2837@localhost:3306/codeconnect
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
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
    print(f"Database '{db_name}' created or already exists.")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error creating database: {e}")
