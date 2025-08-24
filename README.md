# TinyGen

TinyGen is an AI-powered coding assistant that helps you write, understand, and improve code.

## Features

- **AI-powered code generation**: Get help with writing code in various programming languages
- **Code explanation**: Understand complex code snippets with AI-generated explanations
- **GitHub integration**: Work with your GitHub repositories directly
- **DeepSeek integration**: Interact with DeepSeek's powerful language models

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Zeeeepa/TinyGen-prama-yudistara.git
   cd TinyGen-prama-yudistara
   ```

2. Install backend dependencies:
   ```bash
   cd tinygen-backend
   pip install -r requirements.txt
   cd ..
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Running TinyGen

1. Start the backend server:
   ```bash
   cd tinygen-backend
   python -m tiny_fastapi.app
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## DeepSeek Integration

TinyGen includes integration with DeepSeek's powerful language models, providing advanced AI capabilities.

### Deploying DeepSeek Integration

Run the deployment script:
```bash
./deploy-deepseek.sh
```

### Running TinyGen with DeepSeek Integration

Use the provided script to run TinyGen with DeepSeek integration:
```bash
./run-tinygen.sh
```

### DeepSeek UI

TinyGen includes a dedicated UI for interacting with DeepSeek models. Access it at:
```
http://localhost:3000/deepseek
```

For more information about the DeepSeek UI integration, see [DEEPSEEK_UI.md](DEEPSEEK_UI.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [DeepSeek](https://deepseek.com/)
- [Claude Code Router](https://github.com/anthropics/claude-code-router)

