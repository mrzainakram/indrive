# InDrive - Setup Guide

## 🚀 Quick Start (Recommended)

The easiest way to run the entire application is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd indrive

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5001
# AI Service: http://localhost:5002
```

## 📝 Manual Setup

If you prefer to run services individually:

### 1. Database Setup

Install PostgreSQL 15 and create the database:

```bash
# Start PostgreSQL
createdb indrive_db

# Run the init script
psql -d indrive_db -f database/init.sql
```

### 2. Backend (.NET Core API)

```bash
cd backend/InDrive.API

# Restore dependencies
dotnet restore

# Update database connection string in appsettings.json
# Then run the application
dotnet run

# API will be available at http://localhost:5001
```

### 3. AI Service (Python)

```bash
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DB_HOST=localhost
export DB_NAME=indrive_db
export DB_USER=indrive
export DB_PASSWORD=indrive_pass_2024

# Run the service
python app.py

# Service will be available at http://localhost:5000
```

### 4. Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_WS_URL=ws://localhost:5001
EOF

# Run development server
npm run dev

# Frontend will be available at http://localhost:3000
```

## 🔐 Default Credentials

### Admin Account
```
Email: admin@indrive.com
Password: Admin@123
```

### Test Accounts

Create test accounts by registering:
- Rider: Choose "Rider" role during registration
- Driver: Choose "Driver" role and fill vehicle details

## 🧪 Testing the Application

### 1. Create a Rider Account
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Select "Rider" role
4. Fill in your details
5. Login

### 2. Book a Ride
1. Click "Book a Ride"
2. Enter pickup and dropoff addresses
3. Set your offered fare
4. Submit the request

### 3. Create a Driver Account
1. Open a new incognito/private window
2. Go to http://localhost:3000
3. Click "Sign Up"
4. Select "Driver" role
5. Fill in vehicle details
6. Login

### 4. Accept a Ride (as Driver)
1. Toggle "Online"
2. View available rides
3. Make an offer
4. Wait for rider to accept

### 5. Complete the Ride Flow
1. As rider, accept the driver's offer
2. As driver, start the ride
3. As driver, complete the ride
4. As rider, rate the driver

## 🐛 Common Issues

### Port Already in Use

If you get port conflicts:

```bash
# Check what's using the port
lsof -i :3000  # or :5001, :5002, :5432

# Kill the process
kill -9 <PID>

# Or change ports in docker-compose.yml
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Frontend Build Errors

```bash
# Clear Next.js cache
cd frontend
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

### Backend Build Errors

```bash
# Clean and rebuild
cd backend/InDrive.API
dotnet clean
dotnet restore
dotnet build
```

### AI Service Not Responding

```bash
# Check logs
docker-compose logs ai-service

# Restart the service
docker-compose restart ai-service
```

## 🔧 Configuration

### Environment Variables

#### Backend (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=postgres;Database=indrive_db;Username=indrive;Password=indrive_pass_2024"
  },
  "JwtSettings": {
    "Secret": "Your_Secret_Key_Here",
    "Issuer": "InDriveAPI",
    "Audience": "InDriveClient",
    "ExpiryMinutes": 1440
  },
  "AiServiceUrl": "http://ai-service:5000"
}
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_WS_URL=ws://localhost:5001
```

#### AI Service
```bash
DB_HOST=postgres
DB_NAME=indrive_db
DB_USER=indrive
DB_PASSWORD=indrive_pass_2024
```

## 📊 Database Management

### View Database
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U indrive -d indrive_db

# Common queries
\dt              # List tables
\d users         # Describe users table
SELECT * FROM users LIMIT 5;
SELECT * FROM rides ORDER BY created_at DESC LIMIT 10;
```

### Reset Database
```bash
# Drop and recreate
docker-compose down -v
docker-compose up --build
```

## 🚀 Production Deployment

### Build for Production

```bash
# Backend
cd backend/InDrive.API
dotnet publish -c Release -o out

# Frontend
cd frontend
npm run build

# AI Service
cd ai-service
# Already production-ready with gunicorn
```

### Using Docker

```bash
# Build images
docker-compose build

# Run in production mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📈 Performance Optimization

### Database Indexing
Already configured in `init.sql`:
- User email and phone indexes
- Ride status and date indexes
- Foreign key indexes

### Frontend Optimization
- Next.js automatic code splitting
- Image optimization
- Static page generation where applicable

### Backend Optimization
- Dapper for efficient queries
- Connection pooling
- Response caching

## 🔒 Security Checklist

- [x] Password hashing with BCrypt
- [x] JWT token authentication
- [x] SQL injection prevention
- [x] CORS configuration
- [x] Input validation
- [ ] HTTPS in production (configure reverse proxy)
- [ ] Rate limiting (add middleware)
- [ ] API key for AI service (optional)

## 📱 Mobile Development

The API is ready for mobile app development:

### API Base URL
```
http://your-server:5001/api
```

### Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### WebSocket Connection
```javascript
const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://your-server:5001/hubs/ride", {
    accessTokenFactory: () => token
  })
  .build();
```

## 🆘 Getting Help

If you encounter issues:

1. Check the logs:
   ```bash
   docker-compose logs -f [service-name]
   ```

2. Verify all services are running:
   ```bash
   docker-compose ps
   ```

3. Check database connectivity:
   ```bash
   docker-compose exec backend curl http://postgres:5432
   ```

4. Test API endpoints:
   ```bash
   curl http://localhost:5001/api/health
   ```

5. Create an issue on GitHub with:
   - Error messages
   - Steps to reproduce
   - Environment details
   - Log output

## 📚 Additional Resources

- [.NET Documentation](https://docs.microsoft.com/dotnet/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [SignalR Documentation](https://docs.microsoft.com/signalr/)

---

**Happy Coding! 🚗💨**

