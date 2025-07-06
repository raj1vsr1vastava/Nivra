#!/bin/bash

# Script to start both frontend and backend services
# Cross-platform compatibility for macOS and Linux

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Nivra Society Management System...${NC}"

# Directory paths
API_DIR="$(pwd)/api"
UI_DIR="$(pwd)/ui"

# Check if directories exist
if [ ! -d "$API_DIR" ]; then
    echo -e "${RED}API directory not found at $API_DIR${NC}"
    exit 1
fi

if [ ! -d "$UI_DIR" ]; then
    echo -e "${RED}UI directory not found at $UI_DIR${NC}"
    exit 1
fi

# Create and activate Python virtual environment
echo -e "${GREEN}Setting up Python virtual environment...${NC}"
cd "$API_DIR" || exit 1

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv || python -m venv venv
fi

# Activate virtual environment (cross-platform)
if [ -f "venv/bin/activate" ]; then
    # Linux/macOS
    source venv/bin/activate
elif [ -f "venv/Scripts/activate" ]; then
    # Git Bash on Windows
    source venv/Scripts/activate
else
    echo -e "${RED}Could not find virtual environment activation script${NC}"
    exit 1
fi

# Check Python installation
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python is not installed or not found in PATH${NC}"
    echo -e "${YELLOW}Please install Python 3.8+ from: https://www.python.org/downloads/${NC}"
    exit 1
fi

# Install Python dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo -e "${GREEN}Installing Python dependencies...${NC}"
    pip install -r requirements.txt
fi

# Setup database (if setup script exists)
if [ -f "setup_db.sh" ]; then
    echo -e "${GREEN}Setting up database...${NC}"
    chmod +x setup_db.sh
    ./setup_db.sh
elif [ -f "setup_db.ps1" ]; then
    echo -e "${YELLOW}Database setup script found (PowerShell), but we're on Unix/Linux${NC}"
    echo -e "${YELLOW}You may need to manually set up the database${NC}"
fi

# Check if PostgreSQL is available
if command -v psql &> /dev/null; then
    echo -e "${GREEN}PostgreSQL found${NC}"
else
    echo -e "${YELLOW}PostgreSQL not found in PATH. Make sure it's installed and configured.${NC}"
fi

# Start the backend
echo -e "${GREEN}Starting Backend API server...${NC}"
# Use the virtual environment's python
PYTHON_CMD="python"
if [ -f "venv/bin/python" ]; then
    PYTHON_CMD="./venv/bin/python"
elif [ -f "venv/Scripts/python.exe" ]; then
    PYTHON_CMD="./venv/Scripts/python.exe"
fi

$PYTHON_CMD -m uvicorn main:app --reload &
BACKEND_PID=$!

# Give the backend a moment to start
sleep 3

# Move to UI directory and start frontend
echo -e "${GREEN}Setting up Frontend dependencies...${NC}"
cd "$UI_DIR" || exit 1

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed or not found in PATH${NC}"
    echo -e "${YELLOW}Please install Node.js from: https://nodejs.org/${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed or not found in PATH${NC}"
    echo -e "${YELLOW}npm usually comes with Node.js installation${NC}"
    exit 1
fi

# Install npm dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${GREEN}Installing npm dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}Starting Frontend UI server...${NC}"
npm start &
FRONTEND_PID=$!

# Function to handle script termination
cleanup() {
    echo -e "\n${BLUE}Shutting down servers...${NC}"
    
    # Kill backend process
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}Backend server stopped${NC}"
    fi
    
    # Kill frontend process
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}Frontend server stopped${NC}"
    fi
    
    # Kill any remaining uvicorn or npm processes
    pkill -f "uvicorn main:app" 2>/dev/null
    pkill -f "npm start" 2>/dev/null
    
    echo -e "${GREEN}Servers stopped successfully.${NC}"
    exit 0
}

# Register the cleanup function for script termination signals
trap cleanup INT TERM EXIT

# Keep the script running until manually terminated
echo -e "\n${BLUE}Servers are running. Press Ctrl+C to stop both servers.${NC}"
echo -e "${GREEN}Backend:${NC} http://localhost:8000"
echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "${YELLOW}Logs will appear below. Use Ctrl+C to stop both servers.${NC}"
echo -e "${BLUE}================================================${NC}"

# Wait for background processes to complete or until interrupted
wait $BACKEND_PID $FRONTEND_PID
