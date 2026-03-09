#!/bin/bash

# PromptQuest V3 Startup Script

echo "🧹 Cleaning up existing PromptQuest processes..."
pkill -f "uvicorn main:app" || true
pkill -f "vite" || true
pkill -f "ollama serve" || true
sleep 2 # wait for ports to free up

echo "🤖 Starting Ollama Server..."
# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "⚠️  Ollama not found. Please install it from: https://ollama.ai"
    echo "   After installation, run: ollama pull llama3.2"
else
    # Start Ollama server in background
    ollama serve > ollama.log 2>&1 &
    OLLAMA_PID=$!
    echo "   Ollama server started (PID: $OLLAMA_PID)"
    sleep 3 # give Ollama time to start
    
    # Check if a model is available
    if ollama list | grep -q "llama"; then
        echo "   ✅ Ollama models found"
    else
        echo "   📥 No models found. Pulling llama3.2..."
        ollama pull llama3.2
    fi
fi

echo "🚀 Starting Backend (FastAPI)..."
cd backend
# Attempt to activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

echo "🚀 Starting Frontend (React/Vite)..."
cd frontend
npm run dev -- --host &
FRONTEND_PID=$!
cd ..

echo ""
echo "==========================================================="
echo "✅ Application started successfully!"
echo "   Ollama:   http://localhost:11434 (AI Server)"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo "   API Docs: http://localhost:8000/docs"
echo "==========================================================="
echo "⚠️  Press Ctrl+C to stop all servers safely."
echo "==========================================================="

# Trap Ctrl+C (SIGINT) and SIGTERM to kill all servers cleanly when exited
trap "echo -e '\n🛑 Stopping PromptQuest servers...'; kill $BACKEND_PID $FRONTEND_PID $OLLAMA_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Keep script running to maintain trap focus
wait $BACKEND_PID $FRONTEND_PID
