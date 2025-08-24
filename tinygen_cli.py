#!/usr/bin/env python3
"""
TinyGen CLI - A simple command-line interface for TinyGen with DeepSeek integration
"""

import argparse
import os
import requests
import json
import sys
from typing import Dict, List, Any, Optional

class TinyGenCLI:
    def __init__(self, api_key: str = None, model: str = "deepseek-chat"):
        self.api_key = api_key or os.environ.get("DEEPSEEK_API_KEY")
        if not self.api_key:
            raise ValueError("DeepSeek API key is required. Set DEEPSEEK_API_KEY environment variable or pass it as an argument.")
        
        self.api_url = "https://api.deepseek.com/chat/completions"
        self.model = model  # Default model is deepseek-chat (DeepSeek-V3.1 Non-thinking Mode)
    
    def generate(self, prompt: str, system_prompt: Optional[str] = None, 
                 temperature: float = 0.7, max_tokens: int = 1000, 
                 stream: bool = False, json_mode: bool = False) -> Dict[str, Any]:
        """
        Generate a response using the DeepSeek API
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream
        }
        
        # Add JSON mode if requested
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        
        print(f"Sending request to DeepSeek API using model: {self.model}...")
        
        if stream:
            return self._stream_response(headers, payload)
        else:
            return self._get_response(headers, payload)
    
    def _get_response(self, headers: Dict[str, str], payload: Dict[str, Any]) -> Dict[str, Any]:
        """Get a complete response from the API"""
        response = requests.post(self.api_url, headers=headers, json=payload)
        
        if response.status_code != 200:
            print(f"Error: {response.status_code}")
            print(response.text)
            return {"error": response.text}
        
        return response.json()
    
    def _stream_response(self, headers: Dict[str, str], payload: Dict[str, Any]) -> Dict[str, Any]:
        """Stream the response from the API"""
        response = requests.post(self.api_url, headers=headers, json=payload, stream=True)
        
        if response.status_code != 200:
            print(f"Error: {response.status_code}")
            print(response.text)
            return {"error": response.text}
        
        # Process the streaming response
        full_response = ""
        for line in response.iter_lines():
            if line:
                line_text = line.decode('utf-8')
                if line_text.startswith('data: '):
                    data_str = line_text[6:]  # Remove 'data: ' prefix
                    if data_str == "[DONE]":
                        break
                    try:
                        data = json.loads(data_str)
                        if 'choices' in data and len(data['choices']) > 0:
                            if data['choices'][0].get('delta', {}).get('content'):
                                content = data['choices'][0]['delta']['content']
                                full_response += content
                                print(content, end='', flush=True)
                            # Handle the case where we get the message directly
                            elif data['choices'][0].get('message', {}).get('content'):
                                content = data['choices'][0]['message']['content']
                                full_response += content
                                print(content, end='', flush=True)
                    except json.JSONDecodeError:
                        print(f"Error parsing JSON: {data_str}")
        
        print()  # Add a newline at the end
        return {"response": full_response}

    def list_models(self) -> Dict[str, Any]:
        """List available models from DeepSeek API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        response = requests.get("https://api.deepseek.com/models", headers=headers)
        
        if response.status_code != 200:
            print(f"Error: {response.status_code}")
            print(response.text)
            return {"error": response.text}
        
        return response.json()

def main():
    parser = argparse.ArgumentParser(description="TinyGen CLI with DeepSeek integration")
    parser.add_argument("prompt", nargs="?", help="The prompt to send to the model")
    parser.add_argument("--api-key", help="DeepSeek API key (defaults to DEEPSEEK_API_KEY env var)")
    parser.add_argument("--system", help="System prompt to use")
    parser.add_argument("--temperature", type=float, default=0.7, help="Temperature for generation (default: 0.7)")
    parser.add_argument("--max-tokens", type=int, default=1000, help="Maximum tokens to generate (default: 1000)")
    parser.add_argument("--stream", action="store_true", help="Stream the response")
    parser.add_argument("--model", default="deepseek-chat", choices=["deepseek-chat", "deepseek-reasoner"], 
                      help="Model to use (default: deepseek-chat)")
    parser.add_argument("--json", action="store_true", help="Request JSON output format")
    parser.add_argument("--list-models", action="store_true", help="List available models")
    
    args = parser.parse_args()
    
    try:
        tinygen = TinyGenCLI(api_key=args.api_key, model=args.model)
        
        if args.list_models:
            models = tinygen.list_models()
            print("\nAvailable Models:")
            if "data" in models:
                for model in models["data"]:
                    print(f"- {model['id']} (owned by {model['owned_by']})")
            else:
                print(json.dumps(models, indent=2))
            return 0
        
        if not args.prompt:
            parser.print_help()
            return 1
        
        result = tinygen.generate(
            prompt=args.prompt,
            system_prompt=args.system,
            temperature=args.temperature,
            max_tokens=args.max_tokens,
            stream=args.stream,
            json_mode=args.json
        )
        
        if not args.stream and 'error' not in result:
            if 'choices' in result and len(result['choices']) > 0:
                message = result['choices'][0]['message']['content']
                print("\nResponse:")
                print(message)
            else:
                print("\nUnexpected response format:")
                print(json.dumps(result, indent=2))
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

