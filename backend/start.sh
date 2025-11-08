#!/bin/bash
# Start script for the backend server
# Usage: ./start.sh

# Kill any existing processes on port 8000
echo "Checking for processes on port 8000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || echo "No processes found on port 8000"

# Wait a moment for port to be released
sleep 1

# Start the server
echo "Starting backend server on http://localhost:8000"
uvicorn main:app --reload --host 0.0.0.0 --port 8000

