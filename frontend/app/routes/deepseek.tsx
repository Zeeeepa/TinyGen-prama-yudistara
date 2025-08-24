/**
 * DeepSeek Chat Page
 * 
 * This page provides a dedicated interface for interacting with DeepSeek models.
 */

import React from 'react';
import ChatInterface from '../components/deepseek/ChatInterface';

export default function DeepSeekPage() {
  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">TinyGen with DeepSeek</h1>
          <p className="text-gray-500">
            Interact with DeepSeek's powerful language models
          </p>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
          <ChatInterface className="h-full" />
        </div>
      </main>
      
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            TinyGen with DeepSeek Integration | Supports both deepseek-chat and deepseek-reasoner models
          </p>
        </div>
      </footer>
    </div>
  );
}

