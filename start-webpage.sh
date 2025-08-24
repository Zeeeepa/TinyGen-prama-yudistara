#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================================${NC}"
echo -e "${BLUE}       Starting TinyGen Web Interface                      ${NC}"
echo -e "${BLUE}===========================================================${NC}"

# Check if TinyGen directory exists
if [ ! -d "tinygen" ]; then
    echo -e "${RED}Error: TinyGen directory not found. Please run setup-tinygen.sh first.${NC}"
    exit 1
fi

# Check if Claude Code Router is running
if ! ccr status | grep -q -i "status: running"; then
    echo -e "${YELLOW}Claude Code Router is not running. Starting it now...${NC}"
    ccr start
    
    # Wait for it to start
    sleep 2
    
    if ! ccr status | grep -q -i "status: running"; then
        echo -e "${RED}Failed to start Claude Code Router. Please check the logs.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}Claude Code Router is running.${NC}"

# Check if DEEPINFRA_API_KEY is set
if [ -f .env ]; then
    export $(cat .env | xargs)
    echo -e "${GREEN}Loaded API key from .env file.${NC}"
elif [ -z "$DEEPINFRA_API_KEY" ]; then
    echo -e "${YELLOW}No API key found. Using default key.${NC}"
    export DEEPINFRA_API_KEY="Fe3V9w1bWf50qX6IeBtsvqLqxIDhyzyE"
else
    echo -e "${GREEN}Using API key from environment: $DEEPINFRA_API_KEY${NC}"
fi

# Change to TinyGen directory
cd tinygen

# Activate virtual environment if not already activated
if [[ "$VIRTUAL_ENV" != *".venv"* ]]; then
    echo -e "${BLUE}Activating virtual environment...${NC}"
    source .venv/bin/activate
fi

# Start the backend server
echo -e "${BLUE}Starting TinyGen backend server...${NC}"
cd backend
python -m app &
BACKEND_PID=$!

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to start...${NC}"
sleep 5

# Start the frontend
echo -e "${BLUE}Starting TinyGen frontend...${NC}"
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}===========================================================${NC}"
echo -e "${GREEN}TinyGen Web Interface is now running!${NC}"
echo -e "${GREEN}===========================================================${NC}"
echo -e "${YELLOW}Backend server: http://localhost:8000${NC}"
echo -e "${YELLOW}Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}===========================================================${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Handle cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID; echo -e '${RED}Stopping TinyGen...${NC}'; exit" INT TERM EXIT

# Wait for user to press Ctrl+C
wait

