from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv
import os

load_dotenv()
# Force pymysql driver
db_url = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost/codeconnect")
# Replace any mysql:// or mysql+aiomysql:// with mysql+pymysql://
if db_url.startswith("mysql://"):
    SQLALCHEMY_DATABASE_URL = db_url.replace("mysql://", "mysql+pymysql://", 1)
elif "aiomysql" in db_url:
    SQLALCHEMY_DATABASE_URL = db_url.replace("mysql+aiomysql", "mysql+pymysql")
else:
    SQLALCHEMY_DATABASE_URL = db_url

print(f"Connecting to: {SQLALCHEMY_DATABASE_URL}")

try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    inspector = inspect(engine)
    columns = inspector.get_columns('rooms')
    for column in columns:
        if column['name'] == 'id':
            print(f"Column: {column['name']}, Type: {column['type']}")
except Exception as e:
    print(f"Error: {e}")
