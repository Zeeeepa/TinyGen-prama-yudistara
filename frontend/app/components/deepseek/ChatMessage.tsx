/**
 * DeepSeek Chat Message Component
 * 
 * This component displays a chat message with special formatting for deepseek-reasoner responses.
 */

import React from 'react';

interface ChatMessageProps {
  role: string;
  content: string;
  model: string;
  timestamp?: string;
  isLoading?: boolean;
  className?: string;
}

export default function ChatMessage({
  role,
  content,
  model,
  timestamp,
  isLoading = false,
  className = '',
}: ChatMessageProps) {
  // Format the content based on the model
  const formatContent = (content: string, model: string): React.ReactNode => {
    if (model === 'deepseek-reasoner') {
      // For deepseek-reasoner, highlight reasoning steps
      return formatReasonerContent(content);
    }
    
    // For other models, just format markdown
    return formatMarkdown(content);
  };
  
  // Format markdown content
  const formatMarkdown = (content: string): React.ReactNode => {
    // Simple markdown formatting (could be replaced with a proper markdown library)
    const formattedContent = content
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Lists
      .replace(/^\s*\* (.*$)/gm, '<li>$1</li>')
      .replace(/^\s*\d+\. (.*$)/gm, '<li>$1</li>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p>');
    
    return <div dangerouslySetInnerHTML={{ __html: `<p>${formattedContent}</p>` }} />;
  };
  
  // Format reasoner content with step highlighting
  const formatReasonerContent = (content: string): React.ReactNode => {
    // Split content into steps
    const steps = content.split(/(?=Step \d+:|### Step \d+:)/);
    
    if (steps.length <= 1) {
      // If no steps found, just use regular markdown formatting
      return formatMarkdown(content);
    }
    
    // Format each step
    return (
      <div className="reasoner-steps">
        {steps.map((step, index) => {
          // Check if this is a step
          const isStep = /^(Step \d+:|### Step \d+:)/.test(step);
          
          return (
            <div 
              key={index} 
              className={`${isStep ? 'bg-blue-50 p-3 rounded-md my-2 border-l-4 border-blue-500' : ''}`}
            >
              {formatMarkdown(step)}
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className={`chat-message ${role === 'user' ? 'user-message' : 'assistant-message'} ${className}`}>
      <div className="flex items-start">
        <div className={`message-avatar ${role === 'user' ? 'bg-blue-500' : 'bg-green-500'} text-white rounded-full w-8 h-8 flex items-center justify-center mr-3`}>
          {role === 'user' ? 'U' : 'AI'}
        </div>
        
        <div className="message-content flex-1">
          <div className="message-header flex justify-between text-xs text-gray-500 mb-1">
            <span className="font-medium">
              {role === 'user' ? 'You' : 'DeepSeek AI'}
              {role === 'assistant' && model && ` (${model})`}
            </span>
            {timestamp && <span>{timestamp}</span>}
          </div>
          
          <div className={`message-body prose prose-sm max-w-none ${isLoading ? 'opacity-70' : ''}`}>
            {isLoading ? (
              <div className="flex items-center">
                <div className="loading-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
                <span className="ml-2">Thinking...</span>
              </div>
            ) : (
              formatContent(content, model)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

