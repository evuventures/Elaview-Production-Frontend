#!/bin/bash

# Elaview Frontend Docker Setup
set -e

echo "🎨 Setting up Elaview Frontend..."

# Check if frontend/.env exists (your main app config)
if [ ! -f frontend/.env ]; then
    echo "❌ No .env file found in frontend/ directory"
    echo "📋 Please make sure you have frontend/.env configured"
    echo "💡 This should be your existing app environment file"
    exit 1
fi

# Check if Docker-specific .env exists
if [ ! -f .env.docker ]; then
    echo "📋 Creating Docker-specific .env from template..."
    cp .env.docker.example .env.docker
    echo "⚠️  Please edit .env.docker with Docker settings before continuing"
    echo "💡 Your app .env is in frontend/.env (keep using that)"
    exit 1
fi

# Load Docker environment
set -a
source .env.docker
set +a

# Create shared network if it doesn't exist
docker network create elaview-shared 2>/dev/null || true

# Start frontend service
echo "🚀 Starting frontend service..."
docker compose up -d

echo "✅ Frontend setup complete!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "📁 Your app .env file: ./frontend/.env (unchanged)"
echo "🐳 Docker config: ./.env.docker"
echo ""
echo "💡 To stop: docker compose down"
echo "💡 To connect to backend: make sure backend is running on port 3001"