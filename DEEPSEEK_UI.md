# TinyGen with DeepSeek UI Integration

This document provides information about the DeepSeek UI integration in TinyGen, which allows you to interact with DeepSeek's powerful language models through a user-friendly web interface.

## Features

- **Model Selection**: Choose between `deepseek-chat` and `deepseek-reasoner` models
- **Real-time Streaming**: See responses as they are generated
- **Special Formatting**: Enhanced display for reasoning steps in `deepseek-reasoner` responses
- **API Key Management**: Securely store your DeepSeek API key in your browser
- **WebSocket Support**: Efficient real-time communication

## Getting Started

### 1. Deploy DeepSeek Integration

First, deploy the DeepSeek integration by running the deployment script:

```bash
./deploy-deepseek.sh
```

This will:
- Install necessary dependencies
- Configure Claude Code Router for DeepSeek
- Set up the environment for DeepSeek API access

### 2. Configure Your API Key

You can configure your DeepSeek API key in two ways:

1. **Environment Variable**:
   ```bash
   export DEEPSEEK_API_KEY="your_api_key_here"
   ```

2. **Settings Page**:
   - Navigate to the Settings page in the TinyGen UI
   - Scroll down to the DeepSeek Integration section
   - Enter your API key and click "Save API Key"

### 3. Run TinyGen

Run TinyGen with the DeepSeek integration:

```bash
./run-tinygen.sh
```

This will:
- Start the backend server
- Start the frontend development server
- Configure the environment for DeepSeek API access

### 4. Access the DeepSeek Chat Interface

Once TinyGen is running, you can access the DeepSeek chat interface at:

```
http://localhost:3000/deepseek
```

## Using the DeepSeek Chat Interface

### Model Selection

- **deepseek-chat**: Optimized for fast, direct responses
- **deepseek-reasoner**: Better for complex reasoning and step-by-step problem solving

### Chat Features

- Type your message in the input box and click "Send" or press Enter
- View real-time streaming responses
- Special formatting for reasoning steps
- Stop generation at any time
- Clear the chat history

## API Endpoints

The following API endpoints are available for DeepSeek integration:

- `GET /api/deepseek/models`: List available DeepSeek models
- `POST /api/deepseek/chat`: Generate a chat completion
- `WebSocket /api/deepseek/ws`: Real-time chat with streaming responses

## Troubleshooting

### API Key Issues

- Ensure your API key is correctly formatted
- Check that the API key is valid and has not expired
- Verify that the API key has been saved correctly in the settings

### Connection Issues

- Make sure the backend server is running
- Check that Claude Code Router is running (`ccr status`)
- Verify that your internet connection is working

### Model Selection Issues

- If a model is not available, try refreshing the page
- Check that your API key has access to the selected model

## Development

If you want to extend the DeepSeek integration, the following files are relevant:

- Backend:
  - `tinygen-backend/tiny_fastapi/services/deepseek_service.py`: DeepSeek API service
  - `tinygen-backend/tiny_fastapi/routers/deepseek.py`: API endpoints

- Frontend:
  - `frontend/app/lib/api/deepseek.ts`: API client
  - `frontend/app/components/deepseek/ModelSelector.tsx`: Model selection component
  - `frontend/app/components/deepseek/ChatMessage.tsx`: Chat message component
  - `frontend/app/components/deepseek/ChatInterface.tsx`: Chat interface component
  - `frontend/app/routes/deepseek.tsx`: DeepSeek page
  - `frontend/app/routes/settings.tsx`: API key configuration

