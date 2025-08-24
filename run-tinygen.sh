#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================================${NC}"
echo -e "${BLUE}       TinyGen with DeepInfra Integration                  ${NC}"
echo -e "${BLUE}===========================================================${NC}"

# Check if DeepInfra API key is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}No API key provided. Using default key.${NC}"
    export DEEPINFRA_API_KEY="Fe3V9w1bWf50qX6IeBtsvqLqxIDhyzyE"
else
    echo -e "${YELLOW}Using provided API key.${NC}"
    export DEEPINFRA_API_KEY="$1"
fi

# Step 1: Deploy Claude Code Router with DeepSeek
echo -e "${BLUE}Step 1: Deploying Claude Code Router with DeepSeek...${NC}"
./deploy-claude-router.sh

# Check if Claude Code Router deployment was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to deploy Claude Code Router. Exiting.${NC}"
    exit 1
fi

# Step 2: Set up TinyGen with virtual environment
echo -e "${BLUE}Step 2: Setting up TinyGen with virtual environment...${NC}"
./setup-tinygen.sh

# Check if TinyGen setup was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to set up TinyGen. Exiting.${NC}"
    exit 1
fi

# Step 3: Start the TinyGen web interface
echo -e "${BLUE}Step 3: Starting TinyGen web interface...${NC}"
./start-webpage.sh

# This script will not reach this point unless the user presses Ctrl+C
# because start-webpage.sh has a wait at the end

