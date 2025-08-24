#!/bin/bash
# Start TinyGen with DeepSeek integration

# Check if API key is provided
if [ -z "$1" ]; then
    echo "Error: DeepSeek API key is required."
    echo "Usage: ./start-tinygen.sh your_api_key_here"
    exit 1
fi

# Export the API key
export DEEPSEEK_API_KEY=$1

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "Starting TinyGen with DeepSeek integration..."

# Start the Docker container
docker-compose up -d

echo "TinyGen is now running in a Docker container."
echo "You can use it in the following ways:"

echo "1. Run commands inside the container:"
echo "   docker exec -it tinygen-deepseek ./tinygen_cli.py \"Your prompt\""

echo "2. Use the claudecode command inside the container:"
echo "   docker exec -it tinygen-deepseek claudecode -p \"Your prompt\""

echo "3. Test the DeepSeek API directly:"
echo "   docker exec -it tinygen-deepseek python test_deepseek.py"

echo "4. Access the container's shell:"
echo "   docker exec -it tinygen-deepseek bash"

echo "To stop TinyGen, run: docker-compose down"

