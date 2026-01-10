import requests
import os

from dotenv import load_dotenv
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
API_URL = "https://api.groq.com/openai/v1/chat/completions"
# MODEL = "llama-3.3-70b-versatile"
MODEL = "llama3-70b-8192" # Trying a known stable model alias first, or I will try the one I used.

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

payload = {
    "model": "llama-3.3-70b-versatile", # Testing the one I used
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
}

print(f"Testing model: {payload['model']}")
try:
    response = requests.post(API_URL, headers=headers, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
