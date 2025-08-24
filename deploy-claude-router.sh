#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================================${NC}"
echo -e "${BLUE}       Deploying Claude Code Router with DeepSeek          ${NC}"
echo -e "${BLUE}===========================================================${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed. Please install Node.js and npm first.${NC}"
    exit 1
fi

# Check if DEEPINFRA_API_KEY is already set in environment
if [ -z "$DEEPINFRA_API_KEY" ]; then
    echo -e "${YELLOW}No API key found in environment. Using default key.${NC}"
    DEEPINFRA_API_KEY="Fe3V9w1bWf50qX6IeBtsvqLqxIDhyzyE"
else
    echo -e "${YELLOW}Using API key from environment: $DEEPINFRA_API_KEY${NC}"
fi

# Create .env file for storing the API key
echo "DEEPINFRA_API_KEY=$DEEPINFRA_API_KEY" > .env
echo -e "${GREEN}API key saved to .env file.${NC}"

# Install Claude Code Router globally
echo -e "${BLUE}Installing Claude Code Router...${NC}"
npm install -g @anthropic-ai/claude-code @musistudio/claude-code-router

# Create Claude Code Router config directory
mkdir -p ~/.claude-code-router

# Create Claude Code Router config with DeepSeek configuration
echo -e "${BLUE}Creating Claude Code Router configuration with DeepSeek...${NC}"
cat > ~/.claude-code-router/config.json << EOF
{
  "LOG": true,
  "API_TIMEOUT_MS": 600000,
  "Providers": [
    {
      "name": "deepinfra",
      "api_base_url": "https://api.deepinfra.com/v1/openai/chat/completions",
      "api_key": "$DEEPINFRA_API_KEY",
      "models": ["openai/gpt-oss-120b", "deepseek-ai/deepseek-coder-33b-instruct"],
      "transformer": {
        "use": ["openai"]
      }
    }
  ],
  "Router": {
    "default": "deepinfra,deepseek-ai/deepseek-coder-33b-instruct",
    "background": "deepinfra,deepseek-ai/deepseek-coder-33b-instruct",
    "think": "deepinfra,deepseek-ai/deepseek-coder-33b-instruct",
    "longContext": "deepinfra,deepseek-ai/deepseek-coder-33b-instruct",
    "webSearch": "deepinfra,deepseek-ai/deepseek-coder-33b-instruct"
  }
}
EOF

# Start Claude Code Router
echo -e "${BLUE}Starting Claude Code Router...${NC}"
ccr start

# Check if Claude Code Router is running
if ccr status | grep -q -i "status: running"; then
    echo -e "${GREEN}Claude Code Router is running successfully.${NC}"
else
    echo -e "${RED}Failed to start Claude Code Router. Please check the logs.${NC}"
    exit 1
fi

echo -e "${GREEN}===========================================================${NC}"
echo -e "${GREEN}Claude Code Router with DeepSeek deployed successfully!${NC}"
echo -e "${GREEN}===========================================================${NC}"

