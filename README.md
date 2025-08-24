# TinyGen with DeepInfra Integration

This repository contains scripts to set up and run TinyGen with DeepInfra integration, allowing you to use powerful AI models for code generation and assistance.

## Quick Start

Follow these steps to get TinyGen up and running with DeepInfra integration:

### 1. Deploy Claude Code Router with DeepSeek Configuration

```bash
./deploy-claude-router.sh
```

This script will:
- Install Claude Code Router globally
- Configure it to use DeepInfra API with DeepSeek models
- Start the Claude Code Router service

### 2. Set Up TinyGen with Virtual Environment

```bash
./setup-tinygen.sh
```

This script will:
- Clone the TinyGen repository
- Create a Python virtual environment
- Install TinyGen in development mode
- Set up automatic virtual environment activation when in the DeepCode directory

### 3. Start the TinyGen Web Interface

```bash
./start-webpage.sh
```

This script will:
- Start the TinyGen backend server
- Start the TinyGen frontend
- Provide URLs to access the web interface

## API Key Configuration

The DeepInfra API key is set to `Fe3V9w1bWf50qX6IeBtsvqLqxIDhyzyE` by default. You can override this by setting the `DEEPINFRA_API_KEY` environment variable:

```bash
export DEEPINFRA_API_KEY="your_api_key_here"
```

## Accessing TinyGen

Once the web interface is running, you can access TinyGen at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Troubleshooting

### Claude Code Router Issues

If you encounter issues with Claude Code Router, you can check its status:

```bash
ccr status
```

To restart it:

```bash
ccr stop
ccr start
```

### Virtual Environment Issues

If the virtual environment is not activated automatically, you can activate it manually:

```bash
cd tinygen
source .venv/bin/activate
```

### Web Interface Issues

If the web interface doesn't start properly, try running the backend and frontend separately:

```bash
# Start backend
cd tinygen/backend
python -m app

# In another terminal
cd tinygen/frontend
npm run dev
```

