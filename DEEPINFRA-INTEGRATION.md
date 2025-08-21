# TinyGen with DeepInfra Integration

This branch adds support for using DeepInfra's OpenAI-compatible API with TinyGen through Claude Code Router.

## What is Claude Code Router?

[Claude Code Router](https://github.com/Zeeeepa/claude-code-router) is a tool that intercepts requests from Claude Code SDK and redirects them to different model providers. It allows you to use Claude Code's interface with alternative models like DeepInfra's GPT-OSS.

## What is DeepInfra?

[DeepInfra](https://deepinfra.com/) is a platform that provides access to various AI models through an OpenAI-compatible API. This integration specifically uses the `openai/gpt-oss-120b` model.

## How It Works

1. Claude Code Router is installed and configured in the TinyGen sandbox
2. The router intercepts Claude Code SDK requests
3. Requests are transformed to OpenAI format and sent to DeepInfra
4. Responses are transformed back to Claude format
5. TinyGen processes the responses as if they came from Claude

## Setup Instructions

### Quick Setup

Run the deployment script:

```bash
./deploy-deepinfra.sh
```

The script will:
1. Prompt for your DeepInfra API key (or use a default one)
2. Install Claude Code Router
3. Configure the router to use DeepInfra
4. Start the router service
5. Install required dependencies

### Manual Setup

1. Install Claude Code Router:
   ```bash
   npm install -g @musistudio/claude-code-router
   ```

2. Create a configuration file at `~/.claude-code-router/config.json`:
   ```json
   {
     "LOG": true,
     "API_TIMEOUT_MS": 600000,
     "Providers": [
       {
         "name": "deepinfra",
         "api_base_url": "https://api.deepinfra.com/v1/openai/chat/completions",
         "api_key": "YOUR_DEEPINFRA_API_KEY",
         "models": ["openai/gpt-oss-120b"],
         "transformer": {
           "use": ["openai"]
         }
       }
     ],
     "Router": {
       "default": "deepinfra,openai/gpt-oss-120b",
       "background": "deepinfra,openai/gpt-oss-120b",
       "think": "deepinfra,openai/gpt-oss-120b",
       "longContext": "deepinfra,openai/gpt-oss-120b",
       "webSearch": "deepinfra,openai/gpt-oss-120b"
     }
   }
   ```

3. Start the router:
   ```bash
   ccr start
   ```

4. Set the environment variable for TinyGen:
   ```bash
   export DEEPINFRA_API_KEY="YOUR_DEEPINFRA_API_KEY"
   ```

## Troubleshooting

### Router Not Starting

If the router fails to start, check the logs:

```bash
tail -f ~/.claude-code-router/claude-code-router.log
```

### API Key Issues

If you encounter authentication errors, make sure your DeepInfra API key is valid and properly set in both:
- The router configuration file (`~/.claude-code-router/config.json`)
- The environment variable (`DEEPINFRA_API_KEY`)

### Router Status

Check if the router is running:

```bash
ccr status
```

Restart the router if needed:

```bash
ccr restart
```

## Limitations

- Some Claude-specific tools might not work with DeepInfra models
- The integration adds a small performance overhead due to the additional network hop
- Error messages might differ from those returned by Claude

## Getting a DeepInfra API Key

1. Sign up at [DeepInfra](https://deepinfra.com/)
2. Navigate to your account settings
3. Generate an API key
4. Use this key in the deployment script or configuration file

