#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================================${NC}"
echo -e "${BLUE}       Setting up TinyGen with Virtual Environment          ${NC}"
echo -e "${BLUE}===========================================================${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed. Please install git first.${NC}"
    exit 1
fi

# Check if python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: python3 is not installed. Please install Python first.${NC}"
    exit 1
fi

# Clone TinyGen repository if it doesn't exist
if [ ! -d "tinygen" ]; then
    echo -e "${BLUE}Cloning TinyGen repository...${NC}"
    git clone https://github.com/Zeeeepa/TinyGen-prama-yudistara.git tinygen
    cd tinygen
else
    echo -e "${YELLOW}TinyGen repository already exists. Updating...${NC}"
    cd tinygen
    git pull
fi

# Create virtual environment
echo -e "${BLUE}Creating virtual environment...${NC}"
python3 -m venv .venv

# Activate virtual environment
echo -e "${BLUE}Activating virtual environment...${NC}"
source .venv/bin/activate

# Install TinyGen in development mode
echo -e "${BLUE}Installing TinyGen in development mode...${NC}"
pip install -e .

# Install additional dependencies
echo -e "${BLUE}Installing additional dependencies...${NC}"
pip install supabase modal pyjwt[crypto] requests claude-code-sdk openai fastapi uvicorn

# Create .bashrc hook for automatic venv activation
echo -e "${BLUE}Creating .bashrc hook for automatic venv activation...${NC}"
cat > ~/.tinygen_venv_hook << EOF
# TinyGen virtual environment auto-activation
tinygen_auto_activate() {
  if [[ "\$PWD" == *"DeepCode"* ]]; then
    if [ -f "\$PWD/.venv/bin/activate" ]; then
      source "\$PWD/.venv/bin/activate"
    elif [ -f "\$PWD/../.venv/bin/activate" ]; then
      source "\$PWD/../.venv/bin/activate"
    fi
  fi
}

cd() {
  builtin cd "\$@"
  tinygen_auto_activate
}

# Activate on shell start if in DeepCode directory
tinygen_auto_activate
EOF

# Add hook to .bashrc if not already there
if ! grep -q "source ~/.tinygen_venv_hook" ~/.bashrc; then
    echo -e "\n# TinyGen virtual environment auto-activation" >> ~/.bashrc
    echo "source ~/.tinygen_venv_hook" >> ~/.bashrc
    echo -e "${GREEN}Added auto-activation hook to .bashrc${NC}"
else
    echo -e "${YELLOW}Auto-activation hook already exists in .bashrc${NC}"
fi

echo -e "${GREEN}===========================================================${NC}"
echo -e "${GREEN}TinyGen setup completed successfully!${NC}"
echo -e "${GREEN}===========================================================${NC}"
echo -e "${YELLOW}To activate the virtual environment manually:${NC}"
echo -e "${YELLOW}source .venv/bin/activate${NC}"
echo -e "${GREEN}===========================================================${NC}"

# Return to original directory
cd ..

