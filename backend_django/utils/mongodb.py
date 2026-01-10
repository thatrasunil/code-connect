import os
from pymongo import MongoClient
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

class MongoDBManager:
    _instance = None
    _client = None
    _db = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    def __init__(self):
        try:
            mongodb_uri = os.getenv('MONGODB_URI')
            if not mongodb_uri:
                raise ValueError("MONGODB_URI not set in .env file")
            
            # Create connection
            self._client = MongoClient(
                mongodb_uri,
                serverSelectionTimeoutMS=5000,
                socketTimeoutMS=None,
                retryWrites=True,
                w='majority'
            )
            
            # Verify connection
            self._client.admin.command('ping')
            # logger.info("✅ MongoDB Atlas Connected Successfully!")
            
            # Set database
            db_name = os.getenv('MONGODB_DATABASE', 'code_connect')
            self._db = self._client[db_name]
            
        except Exception as e:
            logger.error(f"❌ MongoDB Connection Failed: {str(e)}")
            raise
    
    @property
    def db(self):
        return self._db
    
    @property
    def client(self):
        return self._client
    
    def get_collection(self, collection_name):
        return self._db[collection_name]
    
    def close(self):
        if self._client:
            self._client.close()
            logger.info("MongoDB connection closed")

# Create singleton instance
try:
    db_manager = MongoDBManager.get_instance()
except Exception:
    db_manager = None
