# 🚀 Deployment Guide

## Upload to GitHub

### Step 1: Initialize Git Repository

```bash
cd /Users/apple/indrive

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Complete InDrive ride booking application"
```

### Step 2: Connect to GitHub Repository

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/mrzainakram/indrive.git

# Verify remote
git remote -v
```

### Step 3: Push to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main
```

If you encounter authentication issues:

**Option A: Using Personal Access Token (Recommended)**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` permissions
3. Use token as password when pushing

**Option B: Using SSH**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add SSH key to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub
# Add this key to GitHub → Settings → SSH and GPG keys

# Change remote to SSH
git remote set-url origin git@github.com:mrzainakram/indrive.git
git push -u origin main
```

---

## 🐳 Docker Deployment

### Fix Docker Issues

If Docker is not showing the app, follow these steps:

#### 1. Stop All Running Containers

```bash
cd /Users/apple/indrive

# Stop all containers
docker-compose down

# Remove volumes (fresh start)
docker-compose down -v

# Remove all stopped containers
docker container prune -f

# Remove unused images
docker image prune -f
```

#### 2. Build Fresh Images

```bash
# Build all images without cache
docker-compose build --no-cache

# Start services
docker-compose up
```

#### 3. Check Service Status

```bash
# View running containers
docker-compose ps

# Check logs for all services
docker-compose logs

# Check specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs ai-service
docker-compose logs postgres
```

#### 4. Verify Services

Open your browser and check:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/swagger (API documentation)
- **AI Service**: http://localhost:5002/health
- **Database**: Should be accessible internally

#### 5. Common Docker Issues & Solutions

**Issue 1: Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>

# Or change ports in docker-compose.yml
```

**Issue 2: Database Connection Failed**
```bash
# Check if postgres is healthy
docker-compose ps

# Restart postgres
docker-compose restart postgres

# Wait for postgres to be ready
docker-compose logs postgres | grep "ready"
```

**Issue 3: Backend Can't Connect to Database**
```bash
# Check network
docker network ls

# Inspect network
docker network inspect indrive_indrive-network

# Restart all services
docker-compose restart
```

**Issue 4: Frontend Shows Connection Error**
```bash
# Check if backend is running
curl http://localhost:5001/api/auth/login

# Check docker logs
docker-compose logs backend

# Rebuild frontend
docker-compose up --build frontend
```

**Issue 5: AI Service Not Responding**
```bash
# Check AI service logs
docker-compose logs ai-service

# Test AI service
curl http://localhost:5002/health

# Restart AI service
docker-compose restart ai-service
```

---

## 🔍 Debugging Steps

### 1. Check All Services are Running

```bash
docker-compose ps
```

Expected output:
```
NAME                  STATUS       PORTS
indrive-frontend      Up          0.0.0.0:3000->3000/tcp
indrive-backend       Up          0.0.0.0:5001->80/tcp
indrive-ai            Up          0.0.0.0:5002->5000/tcp
indrive-postgres      Up          0.0.0.0:5432->5432/tcp
```

### 2. Test Each Service Individually

```bash
# Test database
docker-compose exec postgres psql -U indrive -d indrive_db -c "SELECT 1;"

# Test backend
curl http://localhost:5001/api/users/me

# Test AI service
curl http://localhost:5002/health

# Test frontend (open in browser)
open http://localhost:3000
```

### 3. View Real-time Logs

```bash
# Follow logs for all services
docker-compose logs -f

# Follow logs for specific service
docker-compose logs -f frontend
```

### 4. Access Container Shell

```bash
# Access backend container
docker-compose exec backend /bin/bash

# Access frontend container
docker-compose exec frontend /bin/sh

# Access postgres container
docker-compose exec postgres psql -U indrive -d indrive_db
```

---

## 🚀 Production Deployment

### Using Docker Compose in Production

```bash
# Build for production
docker-compose -f docker-compose.yml build

# Run in detached mode
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Environment Variables for Production

Create `.env` file:
```bash
# Production Database
POSTGRES_USER=indrive_prod
POSTGRES_PASSWORD=strong_password_here
POSTGRES_DB=indrive_prod_db

# Production JWT Secret
JWT_SECRET=very_strong_secret_key_for_production

# Production URLs
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
```

### Using Docker Swarm (Advanced)

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml indrive

# Check services
docker stack services indrive

# Remove stack
docker stack rm indrive
```

### Using Kubernetes (Advanced)

Convert docker-compose to Kubernetes:
```bash
# Install kompose
brew install kompose  # macOS
# or
sudo apt-get install kompose  # Linux

# Convert
kompose convert

# Deploy to Kubernetes
kubectl apply -f .
```

---

## 📊 Monitoring

### Health Checks

Add to docker-compose.yml for each service:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### View Resource Usage

```bash
# View stats
docker stats

# View specific container
docker stats indrive-frontend
```

---

## 🔒 Security Checklist for Production

- [ ] Change all default passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS (use nginx reverse proxy)
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Set up backup system
- [ ] Use secrets management (Docker secrets or Kubernetes secrets)
- [ ] Enable logging and monitoring
- [ ] Regular security updates
- [ ] Use non-root users in containers

---

## 📝 Quick Reference

### Start Application
```bash
docker-compose up -d
```

### Stop Application
```bash
docker-compose down
```

### Restart Application
```bash
docker-compose restart
```

### View Logs
```bash
docker-compose logs -f
```

### Rebuild Specific Service
```bash
docker-compose up --build frontend
```

### Scale Services (if needed)
```bash
docker-compose up --scale backend=3
```

---

## 🆘 Emergency Recovery

If everything fails:

```bash
# Nuclear option - reset everything
docker-compose down -v
docker system prune -a --volumes -f
docker-compose up --build

# This will:
# 1. Stop all containers
# 2. Remove all volumes
# 3. Remove all images
# 4. Rebuild everything from scratch
```

---

**Need Help?** Check the logs first:
```bash
docker-compose logs -f
```

Most issues can be resolved by checking the logs! 🔍

