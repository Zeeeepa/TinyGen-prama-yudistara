/**
 * DeepSeek Model Selector Component
 * 
 * This component provides a dropdown for selecting between deepseek-chat and deepseek-reasoner models.
 */

import React, { useState, useEffect } from 'react';
import { listModels, ModelInfo } from '../../lib/api/deepseek';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
  disabled = false,
  className = '',
}: ModelSelectorProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch available models on component mount
  useEffect(() => {
    async function fetchModels() {
      setLoading(true);
      try {
        const response = await listModels();
        if (response.error) {
          setError(response.error);
          // Set default models if API fails
          setModels([
            { id: 'deepseek-chat', owned_by: 'deepseek', description: 'DeepSeek-V3.1 Non-thinking Mode' },
            { id: 'deepseek-reasoner', owned_by: 'deepseek', description: 'DeepSeek-V3.1 Thinking Mode' }
          ]);
        } else {
          setModels(response.models);
          setError(null);
        }
      } catch (err) {
        setError('Failed to load models');
        // Set default models if API fails
        setModels([
          { id: 'deepseek-chat', owned_by: 'deepseek', description: 'DeepSeek-V3.1 Non-thinking Mode' },
          { id: 'deepseek-reasoner', owned_by: 'deepseek', description: 'DeepSeek-V3.1 Thinking Mode' }
        ]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchModels();
  }, []);
  
  // Handle model change
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onModelChange(e.target.value);
  };
  
  // Get model description
  const getModelDescription = (modelId: string): string => {
    const model = models.find(m => m.id === modelId);
    if (model?.description) {
      return model.description;
    }
    
    // Default descriptions if not available from API
    switch (modelId) {
      case 'deepseek-chat':
        return 'DeepSeek-V3.1 Non-thinking Mode - Optimized for fast, direct responses';
      case 'deepseek-reasoner':
        return 'DeepSeek-V3.1 Thinking Mode - Better for complex reasoning and step-by-step problem solving';
      default:
        return '';
    }
  };
  
  return (
    <div className={`model-selector ${className}`}>
      <div className="flex flex-col space-y-1">
        <label htmlFor="model-select" className="text-sm font-medium text-gray-700">
          Model
        </label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={handleModelChange}
          disabled={disabled || loading}
          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          {loading ? (
            <option value="">Loading models...</option>
          ) : (
            models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.id}
              </option>
            ))
          )}
        </select>
      </div>
      
      {/* Model description tooltip */}
      <div className="mt-1 text-xs text-gray-500">
        {getModelDescription(selectedModel)}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mt-1 text-xs text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}

