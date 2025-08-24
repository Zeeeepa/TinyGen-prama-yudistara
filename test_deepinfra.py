import requests
import json
import os

# Get API key from environment variable
api_key = os.environ.get("DEEPINFRA_API_KEY", "Fe3V9w1bWf50qX6IeBtsvqLqxIDhyzyE")

# DeepInfra API endpoint
url = "https://api.deepinfra.com/v1/openai/chat/completions"

# Headers
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

# Request payload
payload = {
    "model": "openai/gpt-oss-120b",
    "messages": [
        {"role": "system", "content": "You are a helpful AI assistant."},
        {"role": "user", "content": "Hello, I'm using TinyGen with DeepInfra integration. Can you explain how this works?"}
    ],
    "temperature": 0.7,
    "max_tokens": 500
}

# Make the request
print("Sending request to DeepInfra API...")
response = requests.post(url, headers=headers, json=payload)

# Print the response
print(f"Status code: {response.status_code}")
if response.status_code == 200:
    result = response.json()
    print("\nResponse content:")
    print(json.dumps(result, indent=2))
    
    # Extract and print just the assistant's message
    if "choices" in result and len(result["choices"]) > 0:
        message = result["choices"][0]["message"]["content"]
        print("\nAssistant's response:")
        print(message)
else:
    print("Error response:")
    print(response.text)

