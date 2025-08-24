FROM python:3.10-slim

# Install Node.js
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    git \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install Claude Code Router
RUN npm install -g claude-code-router

# Install Python dependencies
RUN pip install --no-cache-dir requests openai

# Make scripts executable
RUN chmod +x deploy-deepseek.sh tinygen_cli.py test_deepseek.py

# Create a directory for Claude Code Router config
RUN mkdir -p /root/.claude-code-router/

# Set environment variables
ENV PATH="/app:${PATH}"

# Expose port for potential web interface
EXPOSE 8000

# Set entrypoint
ENTRYPOINT ["/bin/bash", "-c"]

# Default command
CMD ["echo 'TinyGen with DeepSeek integration is ready. Set your DEEPSEEK_API_KEY and run ./deploy-deepseek.sh to configure.'"]

