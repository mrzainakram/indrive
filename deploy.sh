#!/bin/bash

# InDrive Deployment Script
# This script helps with GitHub upload and Docker deployment

set -e

echo "🚀 InDrive Deployment Helper"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists git; then
    echo -e "${RED}❌ Git is not installed${NC}"
    exit 1
fi

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""

# Menu
echo "What would you like to do?"
echo "1) Upload to GitHub"
echo "2) Deploy with Docker"
echo "3) Stop Docker services"
echo "4) View Docker logs"
echo "5) Reset everything (fresh start)"
echo "6) Exit"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "📤 Uploading to GitHub..."
        echo ""
        
        # Check if git is initialized
        if [ ! -d .git ]; then
            echo "Initializing git repository..."
            git init
        fi
        
        # Add files
        echo "Adding files..."
        git add .
        
        # Commit
        echo "Creating commit..."
        git commit -m "InDrive: Complete ride booking application with AI-powered fare prediction" || echo "No changes to commit"
        
        # Add remote if not exists
        if ! git remote | grep -q origin; then
            echo "Adding remote repository..."
            git remote add origin https://github.com/mrzainakram/indrive.git
        fi
        
        # Set branch to main
        git branch -M main
        
        echo ""
        echo -e "${YELLOW}⚠️  You will be prompted for GitHub credentials${NC}"
        echo "   Use your GitHub username and Personal Access Token"
        echo "   (Not your password - tokens are required now)"
        echo ""
        echo "   To create a token:"
        echo "   1. Go to: https://github.com/settings/tokens"
        echo "   2. Click 'Generate new token (classic)'"
        echo "   3. Select 'repo' scope"
        echo "   4. Copy the token and use it as password"
        echo ""
        read -p "Press Enter to continue with push..."
        
        # Push to GitHub
        git push -u origin main
        
        echo ""
        echo -e "${GREEN}✅ Successfully uploaded to GitHub!${NC}"
        echo "   View at: https://github.com/mrzainakram/indrive"
        ;;
        
    2)
        echo ""
        echo "🐳 Deploying with Docker..."
        echo ""
        
        # Stop existing containers
        echo "Stopping existing containers..."
        docker-compose down
        
        # Build images
        echo ""
        echo "Building Docker images (this may take a few minutes)..."
        docker-compose build --no-cache
        
        # Start services
        echo ""
        echo "Starting services..."
        docker-compose up -d
        
        echo ""
        echo "Waiting for services to be ready..."
        sleep 10
        
        # Check status
        echo ""
        echo "📊 Service Status:"
        docker-compose ps
        
        echo ""
        echo -e "${GREEN}✅ Deployment complete!${NC}"
        echo ""
        echo "Access your application:"
        echo "  Frontend:  http://localhost:3000"
        echo "  Backend:   http://localhost:5001"
        echo "  AI Service: http://localhost:5002"
        echo ""
        echo "Default Admin Login:"
        echo "  Email: admin@indrive.com"
        echo "  Password: Admin@123"
        echo ""
        echo "To view logs, run: docker-compose logs -f"
        ;;
        
    3)
        echo ""
        echo "🛑 Stopping Docker services..."
        docker-compose down
        echo -e "${GREEN}✅ Services stopped${NC}"
        ;;
        
    4)
        echo ""
        echo "📋 Viewing Docker logs (Press Ctrl+C to exit)..."
        echo ""
        docker-compose logs -f
        ;;
        
    5)
        echo ""
        echo -e "${YELLOW}⚠️  This will delete all data and rebuild everything!${NC}"
        read -p "Are you sure? (yes/no): " confirm
        
        if [ "$confirm" = "yes" ]; then
            echo ""
            echo "🔄 Resetting everything..."
            
            # Stop and remove containers, volumes
            docker-compose down -v
            
            # Prune system
            echo "Cleaning Docker system..."
            docker system prune -f
            
            # Rebuild
            echo ""
            echo "Rebuilding from scratch..."
            docker-compose build --no-cache
            
            # Start
            echo ""
            echo "Starting services..."
            docker-compose up -d
            
            echo ""
            echo "Waiting for services..."
            sleep 15
            
            echo ""
            echo -e "${GREEN}✅ Reset complete!${NC}"
            echo "Application is running at http://localhost:3000"
        else
            echo "Reset cancelled."
        fi
        ;;
        
    6)
        echo "Goodbye! 👋"
        exit 0
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "Done! 🎉"

