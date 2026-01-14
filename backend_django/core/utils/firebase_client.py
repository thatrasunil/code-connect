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
                print("[Firebase] Initializing with FIREBASE_SERVICE_ACCOUNT env var...")
                cred = credentials.Certificate(json.loads(service_account_json))
                firebase_admin.initialize_app(cred)
                print("[Firebase] SUCCESS: Firebase Admin initialized with SERVICE_ACCOUNT")
            else:
                # Fallback to default credentials (GOOGLE_APPLICATION_CREDENTIALS path)
                # or hope it's running in an environment with default creds
                print("[Firebase] No FIREBASE_SERVICE_ACCOUNT found, trying default credentials...")
                default_app = firebase_admin.initialize_app()
                print("[Firebase] SUCCESS: Firebase Admin initialized with default credentials")
        
        _db = firestore.client()
        print("[Firebase] SUCCESS: Firestore client initialized successfully")
        return _db
    except Exception as e:
        print(f"[Firebase] ERROR: Error initializing Firestore: {e}")
        print(f"[Firebase] FIREBASE_SERVICE_ACCOUNT present: {bool(os.environ.get('FIREBASE_SERVICE_ACCOUNT'))}")
        return None
