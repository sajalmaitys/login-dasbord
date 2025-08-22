# Dashboard Login App with MySQL

A beautiful login/register dashboard with MySQL database integration.

## Features

- 🎨 Beautiful glass morphism design
- 📱 Phone number authentication
- 🔐 Secure password hashing with bcrypt
- 💾 MySQL database storage
- ✅ Form validation
- 🔄 Real-time feedback
- 📱 Mobile responsive

## Setup Instructions

### 1. Install MySQL

**Windows:**
- Download MySQL Community Server from https://dev.mysql.com/downloads/mysql/
- Install and start MySQL service
- Create a database user with appropriate permissions

**Alternative - MySQL Cloud Services:**
- Use services like PlanetScale, AWS RDS, or Google Cloud SQL
- Get connection details and update `server/.env`

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 3. Environment Setup

Update `server/.env` with your MySQL connection:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=dashboard
```

### 4. Start the Application

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

### 5. Access the App

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `GET /api/users` - Get all users (for testing)
- `POST /api/ideas` - Submit new idea
- `GET /api/ideas` - Get all ideas
- `GET /api/ideas/user/:userId` - Get user's ideas
- `PATCH /api/ideas/:id/status` - Update idea status

## Database Schema

**Users Table:**
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(255) NOT NULL,
  phoneNumber VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Ideas Table:**
```sql
CREATE TABLE ideas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  text TEXT NOT NULL,
  project VARCHAR(255) NOT NULL,
  module VARCHAR(255) NOT NULL,
  section VARCHAR(255) NOT NULL,
  submittedBy VARCHAR(255) NOT NULL,
  userId INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'in-progress', 'completed') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

## Usage

1. **Register**: Create new account with full name, phone number, and password
2. **Login**: Sign in with phone number and password
3. **Remember Me**: Keep user logged in across sessions
4. **Data Storage**: All user data is securely stored in MySQL
5. **Idea Management**: Submit and track ideas with status updates

## Security Features

- Password hashing with bcrypt
- Input validation
- Duplicate phone number prevention
- CORS enabled for frontend communication