import requests
import json

try:
    response = requests.post(
        'http://127.0.0.1:8001/api/ai/chat',
        json={'prompt': 'Say Hello to CodeConnect!'}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
