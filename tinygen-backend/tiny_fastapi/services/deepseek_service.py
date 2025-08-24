"""
DeepSeek API Service for TinyGen

This module provides functions for interacting with the DeepSeek API,
supporting both deepseek-chat and deepseek-reasoner models.
"""

import os
import json
import requests
from typing import Dict, List, Any, Optional, AsyncGenerator, Union
import logging
import asyncio
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Models
class DeepSeekMessage(BaseModel):
    role: str
    content: str

class DeepSeekRequest(BaseModel):
    model: str = "deepseek-chat"
    messages: List[DeepSeekMessage]
    temperature: float = 0.7
    max_tokens: int = 1000
    stream: bool = False
    response_format: Optional[Dict[str, str]] = None

class DeepSeekResponse(BaseModel):
    id: str
    object: str
    created: int
    model: str
    choices: List[Dict[str, Any]]
    usage: Dict[str, Any]

class DeepSeekService:
    """Service for interacting with the DeepSeek API"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the DeepSeek service
        
        Args:
            api_key: DeepSeek API key (defaults to DEEPSEEK_API_KEY env var)
        """
        self.api_key = api_key or os.environ.get("DEEPSEEK_API_KEY")
        if not self.api_key:
            raise ValueError("DeepSeek API key is required. Set DEEPSEEK_API_KEY environment variable or pass it as an argument.")
        
        self.api_url = "https://api.deepseek.com/chat/completions"
        self.models_url = "https://api.deepseek.com/models"
    
    def get_headers(self) -> Dict[str, str]:
        """Get the headers for DeepSeek API requests"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def list_models(self) -> Dict[str, Any]:
        """
        List available DeepSeek models
        
        Returns:
            Dict containing the available models
        """
        headers = self.get_headers()
        
        try:
            response = requests.get(self.models_url, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Error listing models: {str(e)}")
            return {"error": str(e)}
    
    def generate(self, 
                 messages: List[Dict[str, str]], 
                 model: str = "deepseek-chat",
                 temperature: float = 0.7, 
                 max_tokens: int = 1000,
                 stream: bool = False,
                 json_mode: bool = False) -> Dict[str, Any]:
        """
        Generate a response using the DeepSeek API
        
        Args:
            messages: List of message objects with role and content
            model: Model to use (deepseek-chat or deepseek-reasoner)
            temperature: Temperature for generation
            max_tokens: Maximum tokens to generate
            stream: Whether to stream the response
            json_mode: Whether to request JSON output format
            
        Returns:
            Dict containing the response from DeepSeek API
        """
        headers = self.get_headers()
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream
        }
        
        # Add JSON mode if requested
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        
        logger.info(f"Sending request to DeepSeek API using model: {model}...")
        
        try:
            if stream:
                response = requests.post(self.api_url, headers=headers, json=payload, stream=True)
                response.raise_for_status()
                return self._process_streaming_response(response)
            else:
                response = requests.post(self.api_url, headers=headers, json=payload)
                response.raise_for_status()
                return response.json()
        except requests.RequestException as e:
            logger.error(f"Error generating response: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                return {"error": e.response.text}
            return {"error": str(e)}
    
    def _process_streaming_response(self, response: requests.Response) -> Dict[str, Any]:
        """
        Process a streaming response from the DeepSeek API
        
        Args:
            response: Streaming response from requests
            
        Returns:
            Dict containing the full response text
        """
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
                            # Handle the case where we get the message directly
                            elif data['choices'][0].get('message', {}).get('content'):
                                content = data['choices'][0]['message']['content']
                                full_response += content
                    except json.JSONDecodeError:
                        logger.error(f"Error parsing JSON: {data_str}")
        
        return {"response": full_response}
    
    async def generate_stream(self, 
                             messages: List[Dict[str, str]], 
                             model: str = "deepseek-chat",
                             temperature: float = 0.7, 
                             max_tokens: int = 1000,
                             json_mode: bool = False) -> AsyncGenerator[str, None]:
        """
        Generate a streaming response using the DeepSeek API
        
        Args:
            messages: List of message objects with role and content
            model: Model to use (deepseek-chat or deepseek-reasoner)
            temperature: Temperature for generation
            max_tokens: Maximum tokens to generate
            json_mode: Whether to request JSON output format
            
        Yields:
            Chunks of the response as they are received
        """
        headers = self.get_headers()
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True
        }
        
        # Add JSON mode if requested
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        
        logger.info(f"Sending streaming request to DeepSeek API using model: {model}...")
        
        try:
            async def fetch():
                # Using requests in a non-blocking way with asyncio
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None, 
                    lambda: requests.post(self.api_url, headers=headers, json=payload, stream=True)
                )
                response.raise_for_status()
                
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
                                        yield content
                                    # Handle the case where we get the message directly
                                    elif data['choices'][0].get('message', {}).get('content'):
                                        content = data['choices'][0]['message']['content']
                                        yield content
                            except json.JSONDecodeError:
                                logger.error(f"Error parsing JSON: {data_str}")
            
            async for chunk in fetch():
                yield chunk
                
        except Exception as e:
            logger.error(f"Error generating streaming response: {str(e)}")
            yield f"Error: {str(e)}"

