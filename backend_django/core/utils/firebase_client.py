import firebase_admin
from firebase_admin import credentials, firestore
import os
import json

_db = None

def get_firestore_client():
    global _db
    if _db:
        return _db

    try:
        if not firebase_admin._apps:
            # Check for env var with JSON content
            service_account_json = os.environ.get('FIREBASE_SERVICE_ACCOUNT')
            
            if service_account_json:
                cred = credentials.Certificate(json.loads(service_account_json))
                firebase_admin.initialize_app(cred)
                print("Firebase Admin initialized with SERVICE_ACCOUNT env var")
            else:
                # Fallback to default credentials (GOOGLE_APPLICATION_CREDENTIALS path)
                # or hope it's running in an environment with default creds
                default_app = firebase_admin.initialize_app()
                print("Firebase Admin initialized with default credentials")
        
        _db = firestore.client()
        return _db
    except Exception as e:
        print(f"Error initializing Firestore: {e}")
        return None
