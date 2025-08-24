# TinyGen with DeepSeek Integration

This repository contains a working implementation of TinyGen with DeepSeek integration. This README explains how to set up and use the integration.

## Overview

TinyGen is an AI-powered coding assistant platform that integrates with DeepSeek to provide powerful language model capabilities. The integration allows TinyGen to use DeepSeek's hosted models instead of Anthropic's Claude models.

## Components

1. **deploy-deepseek.sh**: Script to set up the Claude Code Router with DeepSeek integration
2. **tinygen_cli.py**: A simple command-line interface for interacting with DeepSeek's API
3. **test_deepseek.py**: A basic script to test the DeepSeek API connection

## Setup Instructions

### 1. Deploy DeepSeek Integration

```bash
# Make the script executable
chmod +x deploy-deepseek.sh

# Run the deployment script with your API key
DEEPSEEK_API_KEY=your_api_key_here ./deploy-deepseek.sh
```

This script:
- Installs Claude Code Router globally
- Configures it to use DeepSeek's API
- Installs necessary Python dependencies
- Sets up environment variables
- Creates a `claudecode` command for easy access

### 2. Using the TinyGen CLI

The `tinygen_cli.py` script provides a simple way to interact with DeepSeek's API:

```bash
# Make the script executable
chmod +x tinygen_cli.py

# Basic usage
./tinygen_cli.py "Your prompt here"

# With system prompt
./tinygen_cli.py --system "You are a helpful assistant" "Your prompt here"

# With streaming (real-time output)
./tinygen_cli.py --stream "Your prompt here"

# Control generation parameters
./tinygen_cli.py --temperature 0.8 --max-tokens 500 "Your prompt here"

# Use the thinking mode model (deepseek-reasoner)
./tinygen_cli.py --model deepseek-reasoner "Your prompt here"

# Request JSON output format
./tinygen_cli.py --json "Generate a JSON object with name, age, and occupation fields"

# List available models
./tinygen_cli.py --list-models
```

## Architecture

TinyGen with DeepSeek integration works as follows:

1. **Claude Code Router**: Intercepts requests meant for Claude and redirects them to DeepSeek
2. **DeepSeek API**: Provides access to powerful language models like `deepseek-chat` and `deepseek-reasoner`
3. **TinyGen Backend**: Manages sandboxes, GitHub integration, and PR creation

The integration allows TinyGen to use alternative models while maintaining the same interface and capabilities.

## Available Models

DeepSeek offers two main models:

1. **deepseek-chat** (Default): DeepSeek-V3.1 Non-thinking Mode
   - Optimized for direct responses
   - Supports JSON output, function calling, and other features
   - Default max output: 4K tokens (maximum: 8K)

2. **deepseek-reasoner**: DeepSeek-V3.1 Thinking Mode
   - Designed for complex reasoning tasks
   - Supports JSON output and other features
   - Default max output: 32K tokens (maximum: 64K)

Both models support a 128K context length.

## Environment Variables

- `DEEPSEEK_API_KEY`: Your DeepSeek API key (required)
- `SUPABASE_URL`: URL for Supabase database (for full TinyGen functionality)
- `SUPABASE_ANON_KEY`: Anonymous key for Supabase (for full TinyGen functionality)
- `GITHUB_CLIENT_ID`: GitHub App client ID (for GitHub integration)
- `GITHUB_PRIVATE_KEY`: GitHub App private key (for GitHub integration)

## Full Deployment Plan

### 1. Prerequisites

- DeepSeek API key (obtain from [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys))
- Node.js and npm installed
- Python 3.8+ installed
- Git installed

### 2. Clone the Repository

```bash
git clone https://github.com/Zeeeepa/TinyGen-prama-yudistara.git
cd TinyGen-prama-yudistara
git checkout deepinfra-integration  # Or the appropriate branch
```

### 3. Deploy DeepSeek Integration

```bash
# Set your DeepSeek API key
export DEEPSEEK_API_KEY=your_api_key_here

# Run the deployment script
chmod +x deploy-deepseek.sh
./deploy-deepseek.sh
```

### 4. Test the Integration

```bash
# Test the DeepSeek API directly
python test_deepseek.py

# Test the TinyGen CLI
./tinygen_cli.py "Hello, TinyGen!"

# Test the claudecode command
claudecode -p "Hello, TinyGen!"
```

### 5. Set Up the Full TinyGen Backend (Optional)

For the complete TinyGen experience with GitHub integration and sandboxed environments:

```bash
# Navigate to the backend directory
cd tinygen-backend

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
export DEEPSEEK_API_KEY=your_api_key_here
export SUPABASE_URL=your_supabase_url
export SUPABASE_ANON_KEY=your_supabase_anon_key
export GITHUB_CLIENT_ID=your_github_client_id
export GITHUB_PRIVATE_KEY=your_github_private_key

# Deploy with Modal (requires Modal authentication)
modal deploy main.py
```

## Limitations

- The full TinyGen backend requires Modal authentication and deployment
- GitHub integration requires a properly configured GitHub App
- Supabase integration requires a configured Supabase project

## Troubleshooting

If you encounter issues:

1. Check that your DeepSeek API key is valid
2. Ensure Claude Code Router is properly configured
3. Verify that the DeepSeek API is accessible from your network
4. Check for any rate limiting or quota issues with DeepSeek

## Resources

- [DeepSeek API Documentation](https://api-docs.deepseek.com/)
- [Claude Code Router GitHub](https://github.com/musistudio/claude-code-router)
- [Modal Documentation](https://modal.com/docs)

