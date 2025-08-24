/**
 * DeepSeek Chat Interface Component
 * 
 * This component provides a complete chat interface for interacting with DeepSeek models.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '../../lib/api/deepseek';
import { chatCompletion, streamChatCompletion } from '../../lib/api/deepseek';
import ModelSelector from './ModelSelector';
import ChatMessage from './ChatMessage';

interface ChatInterfaceProps {
  initialMessages?: ChatMessageType[];
  initialModel?: string;
  className?: string;
  onSendMessage?: (message: string, model: string) => void;
}

export default function ChatInterface({
  initialMessages = [],
  initialModel = 'deepseek-chat',
  className = '',
  onSendMessage,
}: ChatInterfaceProps) {
  // State
  const [messages, setMessages] = useState<Array<ChatMessageType & { timestamp?: string, isLoading?: boolean }>>(initialMessages);
  const [input, setInput] = useState<string>('');
  const [model, setModel] = useState<string>(initialModel);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };
  
  // Handle model change
  const handleModelChange = (newModel: string) => {
    setModel(newModel);
  };
  
  // Handle key press (Ctrl+Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle send message
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Call onSendMessage callback if provided
    onSendMessage?.(input, model);
    
    // Add user message
    const userMessage: ChatMessageType = {
      role: 'user',
      content: input,
    };
    
    // Add assistant message placeholder
    const assistantMessage: ChatMessageType & { isLoading: boolean } = {
      role: 'assistant',
      content: '',
      isLoading: true,
    };
    
    // Update messages
    setMessages(prev => [...prev, 
      { ...userMessage, timestamp: new Date().toLocaleTimeString() },
      assistantMessage
    ]);
    
    // Clear input
    setInput('');
    
    // Set loading state
    setIsLoading(true);
    setError(null);
    
    // Create abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      // Get all messages for context
      const allMessages = [...messages.map(({ role, content }) => ({ role, content })), userMessage];
      
      // Use streaming for better UX
      let responseContent = '';
      
      // Create cleanup function
      const cleanup = streamChatCompletion(
        {
          messages: allMessages,
          model,
          temperature: 0.7,
          max_tokens: 1000,
          stream: true,
          json_mode: false,
        },
        // On chunk
        (chunk) => {
          responseContent += chunk;
          setMessages(prev => {
            const newMessages = [...prev];
            const assistantMessageIndex = newMessages.length - 1;
            newMessages[assistantMessageIndex] = {
              ...newMessages[assistantMessageIndex],
              content: responseContent,
            };
            return newMessages;
          });
        },
        // On done
        () => {
          setIsLoading(false);
          setMessages(prev => {
            const newMessages = [...prev];
            const assistantMessageIndex = newMessages.length - 1;
            newMessages[assistantMessageIndex] = {
              ...newMessages[assistantMessageIndex],
              isLoading: false,
              timestamp: new Date().toLocaleTimeString(),
            };
            return newMessages;
          });
        },
        // On error
        (error) => {
          setError(error);
          setIsLoading(false);
          setMessages(prev => {
            const newMessages = [...prev];
            const assistantMessageIndex = newMessages.length - 1;
            newMessages[assistantMessageIndex] = {
              ...newMessages[assistantMessageIndex],
              content: `Error: ${error}`,
              isLoading: false,
              timestamp: new Date().toLocaleTimeString(),
            };
            return newMessages;
          });
        }
      );
      
      // Store cleanup function
      abortControllerRef.current.signal.addEventListener('abort', cleanup);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
      
      // Update assistant message with error
      setMessages(prev => {
        const newMessages = [...prev];
        const assistantMessageIndex = newMessages.length - 1;
        newMessages[assistantMessageIndex] = {
          ...newMessages[assistantMessageIndex],
          content: `Error: ${err instanceof Error ? err.message : 'An error occurred'}`,
          isLoading: false,
          timestamp: new Date().toLocaleTimeString(),
        };
        return newMessages;
      });
    }
  };
  
  // Handle stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      
      // Update assistant message
      setMessages(prev => {
        const newMessages = [...prev];
        const assistantMessageIndex = newMessages.length - 1;
        if (newMessages[assistantMessageIndex].isLoading) {
          newMessages[assistantMessageIndex] = {
            ...newMessages[assistantMessageIndex],
            content: newMessages[assistantMessageIndex].content + ' [Generation stopped]',
            isLoading: false,
            timestamp: new Date().toLocaleTimeString(),
          };
        }
        return newMessages;
      });
    }
  };
  
  // Handle clear chat
  const handleClearChat = () => {
    // Stop any ongoing generation
    if (isLoading) {
      handleStopGeneration();
    }
    
    // Clear messages
    setMessages([]);
    setError(null);
  };
  
  return (
    <div className={`chat-interface flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="chat-header flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">DeepSeek Chat</h2>
        <div className="flex items-center space-x-4">
          <ModelSelector
            selectedModel={model}
            onModelChange={handleModelChange}
            disabled={isLoading}
          />
          <button
            onClick={handleClearChat}
            className="text-gray-500 hover:text-gray-700"
            title="Clear chat"
          >
            Clear
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg mb-2">Start a conversation with DeepSeek AI</p>
            <p className="text-sm">
              Choose between <span className="font-semibold">deepseek-chat</span> for quick responses or{' '}
              <span className="font-semibold">deepseek-reasoner</span> for complex reasoning
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              model={model}
              timestamp={message.timestamp}
              isLoading={message.isLoading}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 text-sm">
          Error: {error}
        </div>
      )}
      
      {/* Input */}
      <div className="chat-input p-4 border-t">
        <div className="flex items-start">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            disabled={isLoading}
          />
          <div className="ml-3 flex flex-col space-y-2">
            {isLoading ? (
              <button
                onClick={handleStopGeneration}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={handleSendMessage}
                disabled={!input.trim()}
                className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none ${!input.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Send
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 flex justify-between">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{input.length} characters</span>
        </div>
      </div>
    </div>
  );
}

