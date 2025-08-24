"""
DeepSeek API Router for TinyGen

This module provides API endpoints for interacting with the DeepSeek API,
supporting both deepseek-chat and deepseek-reasoner models.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, AsyncGenerator
import os
import json
import asyncio
from ..services.deepseek_service import DeepSeekService, DeepSeekMessage

router = APIRouter(prefix="/api/deepseek", tags=["deepseek"])

# Request/Response models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: str = "deepseek-chat"
    temperature: float = 0.7
    max_tokens: int = 1000
    stream: bool = False
    json_mode: bool = False

class ChatResponse(BaseModel):
    id: Optional[str] = None
    model: str
    choices: List[Dict[str, Any]]
    usage: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class ModelInfo(BaseModel):
    id: str
    owned_by: str
    description: Optional[str] = None

class ModelsResponse(BaseModel):
    models: List[ModelInfo]
    error: Optional[str] = None

# Helper function to get DeepSeek service
def get_deepseek_service() -> DeepSeekService:
    """
    Get an instance of the DeepSeek service
    
    Returns:
        DeepSeekService: An instance of the DeepSeek service
    """
    api_key = os.environ.get("DEEPSEEK_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="DeepSeek API key not configured")
    
    return DeepSeekService(api_key=api_key)

@router.get("/models", response_model=ModelsResponse)
async def list_models(deepseek_service: DeepSeekService = Depends(get_deepseek_service)):
    """
    List available DeepSeek models
    
    Returns:
        ModelsResponse: List of available models
    """
    try:
        result = deepseek_service.list_models()
        
        if "error" in result:
            return ModelsResponse(models=[], error=result["error"])
        
        models = []
        if "data" in result:
            for model in result["data"]:
                models.append(ModelInfo(
                    id=model["id"],
                    owned_by=model["owned_by"],
                    description=model.get("description", "")
                ))
        
        return ModelsResponse(models=models)
    except Exception as e:
        return ModelsResponse(models=[], error=str(e))

@router.post("/chat", response_model=ChatResponse)
async def chat_completion(
    request: ChatRequest,
    deepseek_service: DeepSeekService = Depends(get_deepseek_service)
):
    """
    Generate a chat completion using DeepSeek API
    
    Args:
        request: Chat request parameters
        
    Returns:
        ChatResponse: Response from DeepSeek API
    """
    try:
        # Convert messages to the format expected by DeepSeek service
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # If streaming is requested, return a streaming response
        if request.stream:
            return StreamingResponse(
                stream_chat_completion(deepseek_service, messages, request.model, 
                                      request.temperature, request.max_tokens, 
                                      request.json_mode),
                media_type="text/event-stream"
            )
        
        # Otherwise, return a regular response
        result = deepseek_service.generate(
            messages=messages,
            model=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            stream=False,
            json_mode=request.json_mode
        )
        
        if "error" in result:
            return ChatResponse(
                model=request.model,
                choices=[],
                error=result["error"]
            )
        
        return ChatResponse(
            id=result.get("id", ""),
            model=result.get("model", request.model),
            choices=result.get("choices", []),
            usage=result.get("usage", {})
        )
    except Exception as e:
        return ChatResponse(
            model=request.model,
            choices=[],
            error=str(e)
        )

async def stream_chat_completion(
    deepseek_service: DeepSeekService,
    messages: List[Dict[str, str]],
    model: str,
    temperature: float,
    max_tokens: int,
    json_mode: bool
) -> AsyncGenerator[str, None]:
    """
    Stream a chat completion from DeepSeek API
    
    Args:
        deepseek_service: DeepSeek service instance
        messages: List of messages
        model: Model to use
        temperature: Temperature for generation
        max_tokens: Maximum tokens to generate
        json_mode: Whether to request JSON output format
        
    Yields:
        Chunks of the response as they are received
    """
    try:
        async for chunk in deepseek_service.generate_stream(
            messages=messages,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            json_mode=json_mode
        ):
            # Format as SSE
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        
        # End of stream
        yield "data: [DONE]\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
        yield "data: [DONE]\n\n"

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, background_tasks: BackgroundTasks):
    """
    WebSocket endpoint for real-time chat with DeepSeek API
    
    Args:
        websocket: WebSocket connection
        background_tasks: Background tasks
    """
    await websocket.accept()
    
    try:
        # Get DeepSeek service
        api_key = os.environ.get("DEEPSEEK_API_KEY")
        if not api_key:
            await websocket.send_json({"error": "DeepSeek API key not configured"})
            await websocket.close()
            return
        
        deepseek_service = DeepSeekService(api_key=api_key)
        
        # Process messages
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            request_data = json.loads(data)
            
            # Extract request parameters
            messages = request_data.get("messages", [])
            model = request_data.get("model", "deepseek-chat")
            temperature = request_data.get("temperature", 0.7)
            max_tokens = request_data.get("max_tokens", 1000)
            json_mode = request_data.get("json_mode", False)
            
            # Generate streaming response
            try:
                async for chunk in deepseek_service.generate_stream(
                    messages=messages,
                    model=model,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    json_mode=json_mode
                ):
                    await websocket.send_json({"content": chunk})
                
                # End of response
                await websocket.send_json({"done": True})
            except Exception as e:
                await websocket.send_json({"error": str(e)})
    
    except WebSocketDisconnect:
        # Client disconnected
        pass
    except Exception as e:
        # Send error to client if connection is still open
        try:
            await websocket.send_json({"error": str(e)})
        except:
            pass

