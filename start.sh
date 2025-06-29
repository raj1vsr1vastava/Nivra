#!/bin/bash

# Script to start both frontend and backend services

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Nivra Society Management System...${NC}"

# Directory paths
API_DIR="$(pwd)/api"
UI_DIR="$(pwd)/ui"

# Check if directories exist
if [ ! -d "$API_DIR" ]; then
    echo "API directory not found at $API_DIR"
    exit 1
fi

if [ ! -d "$UI_DIR" ]; then
    echo "UI directory not found at $UI_DIR"
    exit 1
fi

# Start the backend in the background
echo -e "${GREEN}Starting Backend API server...${NC}"
cd "$API_DIR" || exit 1
uvicorn main:app --reload &
BACKEND_PID=$!

# Give the backend a moment to start
sleep 2

# Start the frontend in the background
echo -e "${GREEN}Starting Frontend UI server...${NC}"
cd "$UI_DIR" || exit 1
npm start &
FRONTEND_PID=$!

# Function to handle script termination
cleanup() {
    echo -e "\n${BLUE}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Servers stopped successfully.${NC}"
    exit 0
}

# Register the cleanup function for script termination signals
trap cleanup INT TERM

# Keep the script running until manually terminated
echo -e "\n${BLUE}Servers are running. Press Ctrl+C to stop both servers.${NC}"
echo -e "${GREEN}Backend:${NC} http://localhost:8000"
echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
wait $BACKEND_PID $FRONTEND_PID
