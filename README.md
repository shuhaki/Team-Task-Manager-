# Team Task Manager (Full-Stack)

A full-stack team task management web application with role-based access control. Built with React + Tailwind + Node/Express + MongoDB.

## Features

- ✅ Authentication (Signup/Login with JWT)
- ✅ Project & Team Management
- ✅ Task Creation, Assignment & Status Tracking
- ✅ Dashboard with Stats & Overdue Alerts
- ✅ Role-based Access (Admin/Member)

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Mongoose
- **Database**: MongoDB

## Quick Start

### 1. Prerequisites

```bash
Node.js >= 20
npm
MongoDB (local or Atlas)
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
npm install
npm run dev
```

Backend runs on `http://localhost:3001`

### 3. Frontend Setup (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Test

1. Open http://localhost:5173
2. Sign up with email & password
3. Create a project
4. Add tasks and manage status

## API Endpoints

| Method | Endpoint | Description |
|--------|---------|------------|
| POST | /api/auth/signup | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| GET | /api/projects | List projects |
| POST | /api/projects | Create project |
| GET | /api/tasks | List tasks |
| POST | /api/tasks | Create task |
| GET | /api/dashboard | Get dashboard stats |

## Deployment

Deploy to Railway:

1. Create Railway account
2. Connect GitHub repository
3. Add MongoDB plugin
4. Set environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `PORT`: 3001
5. Deploy!

## Project Structure

```
├── backend/
│   ├── middleware/auth.js    # JWT authentication
│   ├── models/            # Mongoose models
│   ├── routes/           # API routes
│   ├── server.js         # Express server
│   └── .env             # Environment vars
└── frontend/
    ├── src/
    │   ├── context/     # React context
    │   ├── pages/      # Page components
    │   ├── utils/      # API utilities
    │   ├── App.jsx     # Main component
    │   └── main.jsx    # Entry point
    └── vite.config.js   # Vite config
```

Built with ❤️ - Ready for production!
