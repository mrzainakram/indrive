# InDrive - Ride Booking Application

A full-stack ride booking application where users can set their own fares and negotiate with drivers. Built with modern technologies and AI-powered fare suggestions.

## 🚀 Features

### For Riders
- **Set Your Own Fare**: Propose your fare and get offers from drivers
- **AI Fare Suggestions**: Machine learning-based fare recommendations
- **Real-time Tracking**: Track your driver's location in real-time
- **Multiple Offers**: Compare offers from different drivers
- **Ride History**: View all your past rides
- **Rating System**: Rate your drivers after each ride
- **Notifications**: Get instant updates about your rides

### For Drivers
- **Accept Rides**: View available rides and make counter-offers
- **Flexible Pricing**: Set your own fares based on distance and demand
- **Earnings Tracking**: Monitor your daily and total earnings
- **Availability Toggle**: Go online/offline with one click
- **Rating System**: Build your reputation with good ratings
- **Vehicle Management**: Manage your vehicle information

### For Admins
- **Dashboard Analytics**: View comprehensive platform statistics
- **User Management**: Manage riders and drivers
- **Ride Monitoring**: Monitor all rides in real-time
- **Revenue Tracking**: Track platform revenue and growth
- **Daily Reports**: View daily statistics and trends

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern, utility-first styling
- **SignalR**: Real-time communication
- **Zustand**: State management
- **React Hot Toast**: Notifications
- **Axios**: HTTP client

### Backend
- **.NET 8**: High-performance backend framework
- **ASP.NET Core Web API**: RESTful API development
- **SignalR**: Real-time WebSocket communication
- **Dapper**: Lightweight ORM
- **BCrypt**: Password hashing
- **JWT**: Authentication and authorization

### AI Service
- **Python 3.11**: Programming language
- **Flask**: Web framework
- **Scikit-learn**: Machine learning library
- **NumPy**: Numerical computing
- **PostgreSQL**: Database connectivity

### Database
- **PostgreSQL 15**: Relational database
- Comprehensive schema with indexes
- Triggers for automatic timestamps

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration

## 📋 Prerequisites

- Docker and Docker Compose installed
- At least 4GB of RAM
- Ports 3000, 5001, 5002, and 5432 available

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/mrzainakram/indrive.git
cd indrive
```

### 2. Start All Services

```bash
docker-compose up --build
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **AI Service**: http://localhost:5002
- **PostgreSQL**: localhost:5432

### 3. Access the Application

Open your browser and navigate to: http://localhost:3000

### 4. Default Admin Credentials

```
Email: admin@indrive.com
Password: Admin@123
```

## 🏗️ Project Structure

```
indrive/
├── frontend/              # Next.js frontend application
│   ├── app/              # App router pages
│   ├── components/       # Reusable components
│   ├── lib/              # Utilities, API, and state management
│   └── Dockerfile
├── backend/              # .NET Core backend
│   ├── InDrive.API/
│   │   ├── Controllers/  # API endpoints
│   │   ├── Services/     # Business logic
│   │   ├── Models/       # Data models
│   │   ├── Hubs/         # SignalR hubs
│   │   └── Program.cs    # App configuration
│   └── Dockerfile
├── ai-service/           # Python AI service
│   ├── app.py           # Flask application
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile
├── database/             # Database scripts
│   └── init.sql         # Database schema
├── docker-compose.yml    # Docker orchestration
└── README.md            # This file
```

## 🔧 Development

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

### Backend Development

```bash
cd backend/InDrive.API
dotnet restore
dotnet run
```

The backend will be available at http://localhost:5001

### AI Service Development

```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

The AI service will be available at http://localhost:5002

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User accounts (riders, drivers, admin)
- **driver_details**: Driver-specific information and vehicle details
- **rides**: Ride requests and completions
- **ride_offers**: Driver offers for rides
- **ratings**: User ratings
- **notifications**: In-app notifications
- **payment_transactions**: Payment records

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. User registers or logs in
2. Server generates and returns a JWT token
3. Client stores token (localStorage)
4. Client includes token in subsequent requests
5. Server validates token for protected routes

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/profile` - Update profile
- `GET /api/users` - Get all users (admin only)

### Rides
- `POST /api/rides` - Create ride request
- `GET /api/rides/{id}` - Get ride details
- `GET /api/rides/my-rides` - Get user's rides
- `GET /api/rides/available` - Get available rides (drivers)
- `POST /api/rides/offers` - Make an offer (drivers)
- `POST /api/rides/offers/{id}/accept` - Accept offer (riders)
- `PUT /api/rides/{id}/status` - Update ride status

### Drivers
- `PUT /api/drivers/availability` - Toggle availability
- `PUT /api/drivers/location` - Update location

### Ratings
- `POST /api/ratings` - Create rating
- `GET /api/ratings/user/{userId}` - Get user ratings

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `PUT /api/admin/users/{id}/status` - Update user status

## 🤖 AI Fare Prediction

The AI service uses machine learning to predict fair fares:

1. Analyzes historical ride data
2. Uses polynomial regression for predictions
3. Considers distance, time, and demand
4. Provides min, max, and average fare suggestions
5. Falls back to simple calculation if insufficient data

## 📱 Real-time Features

SignalR WebSocket connections enable:

- Live ride status updates
- Real-time offer notifications
- Driver location tracking
- Instant messaging between riders and drivers

## 🎨 UI/UX Features

- Responsive design for all devices
- Modern, clean interface
- Smooth animations and transitions
- Toast notifications for user feedback
- Loading states and error handling
- Dark mode support (optional)

## 🧪 Testing

### Test User Accounts

After running the application, you can create test accounts:

**Rider Account:**
- Register as "Rider"
- Book rides and set fares

**Driver Account:**
- Register as "Driver"
- Provide vehicle information
- Accept ride requests

**Admin Account:**
- Use default credentials above
- Access admin dashboard

## 🔒 Security Features

- Password hashing with BCrypt
- JWT token authentication
- Role-based authorization
- SQL injection prevention (parameterized queries)
- XSS protection
- CORS configuration
- Input validation

## 📊 Performance Optimization

- Database indexing for fast queries
- Connection pooling
- Lazy loading of data
- Optimized image loading
- Code splitting in frontend
- Caching strategies

## 🐛 Troubleshooting

### Docker Issues

If containers fail to start:

```bash
# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild and restart
docker-compose up --build
```

### Database Connection Issues

Check if PostgreSQL is running:

```bash
docker-compose ps
docker-compose logs postgres
```

### Port Already in Use

If ports are already in use, modify `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Change 3000 to 3001
```

## 📈 Future Enhancements

- [ ] Mobile applications (iOS and Android)
- [ ] Google Maps integration
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Surge pricing algorithm
- [ ] Scheduled rides
- [ ] Ride sharing/pooling
- [ ] Driver verification system
- [ ] In-app chat system
- [ ] Referral program

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support and questions:
- Create an issue in the repository
- Email: support@indrive.com

## 🙏 Acknowledgments

- Built with modern technologies and best practices
- Inspired by real-world ride-booking applications
- Community feedback and contributions

---

**Made with ❤️ by the InDrive Team**

