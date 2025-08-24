/**
 * DeepSeek API Client
 * 
 * This module provides functions for interacting with the DeepSeek API endpoints.
 */

// Types
export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model: string;
  temperature: number;
  max_tokens: number;
  stream: boolean;
  json_mode: boolean;
}

export interface ChatResponse {
  id?: string;
  model: string;
  choices: Array<{
    index?: number;
    message?: {
      role: string;
      content: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
}

export interface ModelInfo {
  id: string;
  owned_by: string;
  description?: string;
}

export interface ModelsResponse {
  models: ModelInfo[];
  error?: string;
}

// API Base URL - can be configured based on environment
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

/**
 * List available DeepSeek models
 * 
 * @returns Promise with the list of available models
 */
export async function listModels(): Promise<ModelsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/deepseek/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        models: [],
        error: errorData.detail || `Error: ${response.status} ${response.statusText}`,
      };
    }

    return await response.json();
  } catch (error) {
    return {
      models: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generate a chat completion using DeepSeek API
 * 
 * @param request Chat request parameters
 * @returns Promise with the chat response
 */
export async function chatCompletion(request: ChatRequest): Promise<ChatResponse> {
  try {
    // If streaming is requested, throw an error (use streamChatCompletion instead)
    if (request.stream) {
      throw new Error('For streaming responses, use streamChatCompletion function');
    }

    const response = await fetch(`${API_BASE_URL}/api/deepseek/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        model: request.model,
        choices: [],
        error: errorData.detail || `Error: ${response.status} ${response.statusText}`,
      };
    }

    return await response.json();
  } catch (error) {
    return {
      model: request.model,
      choices: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Stream a chat completion from DeepSeek API
 * 
 * @param request Chat request parameters
 * @param onChunk Callback function for each chunk received
 * @param onDone Callback function when streaming is complete
 * @param onError Callback function when an error occurs
 */
export function streamChatCompletion(
  request: ChatRequest,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: string) => void
): () => void {
  // Ensure stream is set to true
  const streamRequest = { ...request, stream: true };
  
  // Create EventSource for SSE
  const eventSource = new EventSource(
    `${API_BASE_URL}/api/deepseek/chat?${new URLSearchParams({
      messages: JSON.stringify(streamRequest.messages),
      model: streamRequest.model,
      temperature: streamRequest.temperature.toString(),
      max_tokens: streamRequest.max_tokens.toString(),
      json_mode: streamRequest.json_mode.toString(),
      stream: 'true',
    })}`
  );
  
  // Handle incoming messages
  eventSource.onmessage = (event) => {
    if (event.data === '[DONE]') {
      eventSource.close();
      onDone();
      return;
    }
    
    try {
      const data = JSON.parse(event.data);
      if (data.content) {
        onChunk(data.content);
      } else if (data.error) {
        onError(data.error);
        eventSource.close();
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Error parsing stream data');
      eventSource.close();
    }
  };
  
  // Handle errors
  eventSource.onerror = (error) => {
    onError('Stream error occurred');
    eventSource.close();
  };
  
  // Return a function to close the connection
  return () => {
    eventSource.close();
  };
}

/**
 * Connect to the DeepSeek WebSocket for real-time chat
 * 
 * @param onMessage Callback function for each message received
 * @param onError Callback function when an error occurs
 * @param onClose Callback function when the connection is closed
 * @returns WebSocket connection and send function
 */
export function connectWebSocket(
  onMessage: (content: string) => void,
  onError: (error: string) => void,
  onClose: () => void
): { 
  socket: WebSocket; 
  send: (request: ChatRequest) => void;
  close: () => void;
} {
  // Create WebSocket connection
  const socket = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/api/deepseek/ws`);
  
  // Handle incoming messages
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.content) {
        onMessage(data.content);
      } else if (data.error) {
        onError(data.error);
      } else if (data.done) {
        // End of response
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Error parsing WebSocket data');
    }
  };
  
  // Handle errors
  socket.onerror = (error) => {
    onError('WebSocket error occurred');
  };
  
  // Handle connection close
  socket.onclose = () => {
    onClose();
  };
  
  // Return the socket and send function
  return {
    socket,
    send: (request: ChatRequest) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(request));
      } else {
        onError('WebSocket is not connected');
      }
    },
    close: () => {
      socket.close();
    }
  };
}

