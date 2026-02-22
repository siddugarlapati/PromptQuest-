#!/bin/bash

# PromptQuest V3 Startup Script

echo "🧹 Cleaning up existing PromptQuest processes..."
pkill -f "uvicorn main:app" || true
pkill -f "vite" || true
sleep 1 # wait for ports to free up

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
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo "==========================================================="
echo "⚠️  Press Ctrl+C to stop both servers safely."
echo "==========================================================="

# Trap Ctrl+C (SIGINT) and SIGTERM to kill both servers cleanly when exited
trap "echo -e '\n🛑 Stopping PromptQuest servers...'; kill $BACKEND_PID $FRONTEND_PID; exit 0" SIGINT SIGTERM

# Keep script running to maintain trap focus
wait $BACKEND_PID $FRONTEND_PID
