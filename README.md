# Dashboard Login App with MongoDB

A beautiful login/register dashboard with MongoDB database integration.

## Features

- 🎨 Beautiful glass morphism design
- 📱 Phone number authentication
- 🔐 Secure password hashing with bcrypt
- 💾 MongoDB database storage
- ✅ Form validation
- 🔄 Real-time feedback
- 📱 Mobile responsive

## Setup Instructions

### 1. Install MongoDB

**Windows:**
- Download MongoDB Community Server from https://www.mongodb.com/try/download/community
- Install and start MongoDB service
- Or use MongoDB Atlas (cloud) for easier setup

**Alternative - MongoDB Atlas (Recommended):**
- Go to https://www.mongodb.com/atlas
- Create free account and cluster
- Get connection string and update `server/.env`

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

Update `server/.env` with your MongoDB connection:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dashboard
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dashboard
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

## Database Schema

```javascript
{
  fullName: String (required),
  phoneNumber: String (required, unique),
  password: String (required, hashed),
  timestamps: true
}
```

## Usage

1. **Register**: Create new account with full name, phone number, and password
2. **Login**: Sign in with phone number and password
3. **Remember Me**: Keep user logged in across sessions
4. **Data Storage**: All user data is securely stored in MongoDB

## Security Features

- Password hashing with bcrypt
- Input validation
- Duplicate phone number prevention
- CORS enabled for frontend communication