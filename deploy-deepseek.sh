#!/bin/bash
# Deploy DeepSeek integration for TinyGen

set -e  # Exit on error

# Check if API key is provided
if [ -z "$DEEPSEEK_API_KEY" ]; then
    echo "Error: DEEPSEEK_API_KEY environment variable is not set."
    echo "Usage: DEEPSEEK_API_KEY=your_api_key_here ./deploy-deepseek.sh"
    exit 1
fi

echo "Starting DeepSeek integration deployment..."

# Install Claude Code Router if not already installed
if ! command -v ccr &> /dev/null; then
    echo "Installing Claude Code Router..."
    npm install -g claude-code-router
fi

# Create configuration directory if it doesn't exist
mkdir -p ~/.claude-code-router

# Create configuration file for DeepSeek integration
echo "Configuring Claude Code Router for DeepSeek integration..."
cat > ~/.claude-code-router/config.json << EOL
{
  "LOG": true,
  "API_TIMEOUT_MS": 600000,
  "Providers": [
    {
      "name": "deepseek",
      "api_base_url": "https://api.deepseek.com/chat/completions",
      "api_key": "${DEEPSEEK_API_KEY}",
      "models": ["deepseek-chat", "deepseek-reasoner"],
      "transformer": {
        "use": ["openai"]
      }
    }
  ],
  "Router": {
    "default": "deepseek,deepseek-chat",
    "background": "deepseek,deepseek-chat",
    "think": "deepseek,deepseek-reasoner",
    "longContext": "deepseek,deepseek-chat",
    "webSearch": "deepseek,deepseek-chat"
  }
}
EOL

echo "Creating claudecode alias..."
# Create a claudecode alias script
cat > /usr/local/bin/claudecode << EOL
#!/bin/bash
export DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
ccr code "\$@"
EOL

# Make the script executable
chmod +x /usr/local/bin/claudecode

# Install Python dependencies
echo "Installing Python dependencies..."
pip install requests openai

# Create a simple test script
echo "Creating test script..."
cat > test_claudecode.sh << EOL
#!/bin/bash
echo "Testing claudecode command..."
claudecode -p "Hello, I'm using TinyGen with DeepSeek integration. Can you explain how this works?" --timeout 10
EOL

chmod +x test_claudecode.sh

echo "DeepSeek integration deployment complete!"
echo "You can now use the 'claudecode' command to interact with DeepSeek API."
echo "Example: claudecode -p \"What is TinyGen?\""
echo ""
echo "To test the integration, run: ./test_claudecode.sh"

