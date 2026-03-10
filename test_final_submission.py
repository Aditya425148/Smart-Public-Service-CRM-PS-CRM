import requests
import json

url = "http://localhost:8000/api/complaints/"
payload = {
    "category": "Test-Final",
    "description": "Testing the state field storage",
    "address": "Mumbai, Maharashtra",
    "reporterName": "Tester",
    "reporterId": "tester_123",
    "location": {"lat": 19.0760, "lng": 72.8777}
}

try:
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
