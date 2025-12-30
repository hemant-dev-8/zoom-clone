#!/bin/bash

echo "Cleaning ports and starting all services..."
echo ""

# Function to kill process on a port
kill_port() {
    local port=$1
    echo "Cleaning port $port..."
    
    # For Windows (Git Bash)
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        netstat -ano | findstr ":$port" | awk '{print $5}' | xargs -r taskkill //F //PID 2>/dev/null
    # For Linux/Mac
    else
        lsof -ti:$port | xargs -r kill -9 2>/dev/null
    fi
}

# Clean all ports
kill_port 3000
kill_port 3001
kill_port 3002
kill_port 3003
kill_port 3004
kill_port 3005

echo ""
echo "Ports cleaned!"
echo ""
echo "Starting all services with Turbo..."
pnpm run dev:all
