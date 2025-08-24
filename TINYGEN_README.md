# TinyGen with DeepInfra Integration

This repository contains a working implementation of TinyGen with DeepInfra integration. This README explains how to set up and use the integration.

## Overview

TinyGen is an AI-powered coding assistant platform that integrates with DeepInfra to provide powerful language model capabilities. The integration allows TinyGen to use DeepInfra's hosted models instead of Anthropic's Claude models.

## Components

1. **deploy-deepinfra.sh**: Script to set up the Claude Code Router with DeepInfra integration
2. **tinygen_cli.py**: A simple command-line interface for interacting with DeepInfra's API
3. **test_deepinfra.py**: A basic script to test the DeepInfra API connection

## Setup Instructions

### 1. Deploy DeepInfra Integration

```bash
# Make the script executable
chmod +x deploy-deepinfra.sh

# Run the deployment script with your API key
DEEPINFRA_API_KEY=your_api_key_here ./deploy-deepinfra.sh
```

This script:
- Installs Claude Code Router globally
- Configures it to use DeepInfra's API
- Installs necessary Python dependencies
- Sets up environment variables

### 2. Using the TinyGen CLI

The `tinygen_cli.py` script provides a simple way to interact with DeepInfra's API:

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
```

## Architecture

TinyGen with DeepInfra integration works as follows:

1. **Claude Code Router**: Intercepts requests meant for Claude and redirects them to DeepInfra
2. **DeepInfra API**: Provides access to powerful language models like `openai/gpt-oss-120b`
3. **TinyGen Backend**: Manages sandboxes, GitHub integration, and PR creation

The integration allows TinyGen to use alternative models while maintaining the same interface and capabilities.

## Environment Variables

- `DEEPINFRA_API_KEY`: Your DeepInfra API key (required)
- `SUPABASE_URL`: URL for Supabase database (for full TinyGen functionality)
- `SUPABASE_ANON_KEY`: Anonymous key for Supabase (for full TinyGen functionality)
- `GITHUB_CLIENT_ID`: GitHub App client ID (for GitHub integration)
- `GITHUB_PRIVATE_KEY`: GitHub App private key (for GitHub integration)

## Limitations

- The full TinyGen backend requires Modal authentication and deployment
- GitHub integration requires a properly configured GitHub App
- Supabase integration requires a configured Supabase project

## Troubleshooting

If you encounter issues:

1. Check that your DeepInfra API key is valid
2. Ensure Claude Code Router is properly configured
3. Verify that the DeepInfra API is accessible from your network
4. Check for any rate limiting or quota issues with DeepInfra

## Resources

- [DeepInfra Documentation](https://deepinfra.com/docs)
- [Claude Code Router GitHub](https://github.com/musistudio/claude-code-router)
- [Modal Documentation](https://modal.com/docs)

