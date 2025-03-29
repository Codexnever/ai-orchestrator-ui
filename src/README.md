# AI Orchestrator with Containers

A mini AI orchestrator system that processes high-level requests by determining and executing appropriate containerized tasks.

## System Architecture

![Architecture Diagram](architecture-diagram.png)

This system follows a modular architecture:

1. **Frontend**: Next.js UI for user input and displaying results
2. **API Layer**: Next.js API routes handle communication between frontend and backend
3. **Orchestrator**: Core system that:
   - Analyzes requests with Groq LLM
   - Determines required tasks and execution order
   - Manages Docker containers
   - Collects and processes results
4. **Containerized Tasks**: Specialized Docker containers for specific data processing tasks:
   - Data Cleaning
   - Sentiment Analysis

## Features

- **LLM-Powered Task Analysis**: Uses Groq to understand user requests and determine appropriate tasks
- **Dynamic Container Orchestration**: Executes Docker containers in the optimal sequence
- **Task Pipelines**: Passes data between containers for multi-step processing
- **Real-time Logging**: Displays execution logs for transparency
- **Scalable Architecture**: Easily add new task containers without changing core code

## Setup Instructions

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Groq API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Codexnever/ai-orchestrator.git
   cd ai-orchestrator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Groq API key:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. Build the containers:
   ```bash
   docker-compose build
   ```

### Running the Application

1. Start the application:
   ```bash
   docker-compose up
   ```

2. Open your browser and navigate to `http://localhost:3000`

## Usage Examples

1. **Data Cleaning**: Enter a request like "Clean my dataset and remove outliers"
2. **Sentiment Analysis**: Try "Analyze the sentiment in these customer reviews"
3. **Combined Tasks**: Use "Clean this dataset and then analyze sentiment of the comments"

## Development

### Adding New Task Containers

1. Create a new folder in the `containers` directory
2. Add a Dockerfile and application code
3. Implement the container to read from `/app/input.json` and write to `/app/output.json`
4. Update the LLM prompt in `lib/llm.js` to include your new task

## License

MIT