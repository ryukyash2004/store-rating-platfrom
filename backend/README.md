# Store Rating Platform - Backend API

A NestJS-based REST API for a store rating platform with role-based access control, JWT authentication, and PostgreSQL database.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Role-based access control (Admin, Store Owner, User)
  - Secure password hashing with Argon2
  - HTTP-only cookies for refresh tokens

- **Core Functionality**
  - User registration and management
  - Store management with owner assignment
  - 1-5 star rating system with comments
  - One rating per user per store constraint
  - Real-time rating aggregation

- **Admin Features**
  - Dashboard with system statistics
  - User and store management
  - Detailed analytics and filtering
  - Audit logging for all actions

- **Security & Performance**
  - Input validation and sanitization
  - Rate limiting (100 req/min)
  - Database transactions for data consistency
  - Comprehensive error handling

## 🛠️ Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **Password Hashing**: Argon2
- **Rate Limiting**: @nestjs/throttler

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- npm or yarn

## 🏗️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd store-rating-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/store_rating_db?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="15m"
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run database migrations
   npm run prisma:migrate
   
   # Seed the database with sample data
   npm run prisma:seed
   ```

5. **Start Development Server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3001/api/v1`

## 🐳 Docker Setup

1. **Using Docker Compose (Recommended)**
   ```bash
   # Start PostgreSQL and API
   docker-compose up -d
   
   # View logs
   docker-compose logs -f backend
   ```

2. **Manual Docker Build**
   ```bash
   # Build the image
   docker build -t store-rating-backend .
   
   # Run with environment variables
   docker run -p 3001:3001 --env-file .env store-rating-backend
   ```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me/password` - Update password

### Stores
- `GET /api/v1/stores` - List all stores (with search/pagination)
- `GET /api/v1/stores/:id` - Get store details
- `GET /api/v1/stores/:id/my-rating` - Get user's rating for store

### Ratings
- `POST /api/v1/stores/:id/ratings` - Create/update rating
- `GET /api/v1/stores/:id/ratings` - Get store ratings (Store Owner only)
- `GET /api/v1/stores/:id/ratings/summary` - Get rating summary (Store Owner only)

### Admin
- `GET /api/v1/admin/dashboard` - System statistics
- `POST /api/v1/admin/users` - Create user
- `POST /api/v1/admin/stores` - Create store
- `GET /api/v1/admin/users` - List users (with filters)
- `GET /api/v1/admin/users/:id` - Get user details
- `GET /api/v1/admin/stores` - List stores (with filters)
- `GET /api/v1/admin/stores/:id` - Get store details

## 👥 User Roles

### Admin
- Full system access
- Create users and stores
- View all data and analytics
- Access admin dashboard

### Store Owner
- View ratings for owned stores
- Access rating analytics
- Cannot rate own stores

### User
- Submit/modify ratings for stores
- View all stores
- Update own profile

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov
```

## 📊 Database Schema

The application uses the following main entities:

- **Users**: Authentication and profile data
- **Stores**: Store information with owner relationships
- **Ratings**: User ratings for stores (1-5 stars + comments)
- **RefreshTokens**: JWT refresh token management
- **AuditLogs**: Action logging for compliance

## 🔒 Security Features

- **Password Security**: Argon2 hashing
- **JWT Security**: Short-lived access tokens + secure refresh tokens
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive DTO validation
- **SQL Injection Protection**: Prisma ORM parameterized queries
- **CORS Configuration**: Controlled cross-origin access

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
FRONTEND_URL="https://your-frontend-domain.com"
```

### Database Migration
```bash
# Production migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Health Check
The API includes basic health monitoring at the `/api/v1` endpoint.

## 📚 API Documentation

When running in development mode, you can explore the API using tools like:
- Postman (import the included collection)
- Thunder Client (VS Code extension)
- curl commands

### Sample API Calls

```bash
# Register a new user
curl -X POST http://localhost:3001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Rate a store (requires Authorization header)
curl -X POST http://localhost:3001/api/v1/stores/1/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"score":5,"comment":"Great service!"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions and support:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the API specification

## 🔄 Changelog

### v1.0.0
- Initial release with core functionality
- JWT authentication system
- Rating management
- Admin dashboard
- Docker support