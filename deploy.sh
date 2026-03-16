#!/bin/bash

# AgencyOS Deployment Script for VPS
# Usage: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🚀 AgencyOS Deployment Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Install Docker: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Install Docker Compose: sudo apt-get install docker-compose"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production file not found${NC}"
    echo "Please create .env.production with your Supabase credentials"
    exit 1
fi

echo -e "${GREEN}✓ .env.production found${NC}"

# Stop existing containers
echo ""
echo "📦 Stopping existing containers..."
docker-compose down || true

# Pull latest code (if in git repo)
if [ -d ".git" ]; then
    echo "📥 Pulling latest code..."
    git pull origin main || echo "Warning: Could not pull from git"
fi

# Build image
echo ""
echo "🔨 Building Docker image..."
docker-compose build

# Start services
echo ""
echo "🚀 Starting services..."
docker-compose up -d

# Wait for service to be ready
echo ""
echo "⏳ Waiting for service to be ready..."
sleep 5

# Check health
if docker-compose exec agencyos wget --quiet --spider http://localhost:3000/ 2>/dev/null; then
    echo -e "${GREEN}✓ Service is healthy${NC}"
else
    echo -e "${YELLOW}⚠ Service may still be starting, check logs with: docker-compose logs -f${NC}"
fi

echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "  - Check logs: docker-compose logs -f agencyos"
echo "  - Access app: http://localhost:3000"
echo "  - View processes: docker-compose ps"
echo "  - Stop services: docker-compose down"
echo ""
echo "🔗 Application running at: http://$(hostname -I | awk '{print $1}'):3000"
