# 🚀 TaskFlow — Team Task Manager

> A production-ready full-stack web application for managing teams, projects, and tasks with role-based access control.

![TaskFlow](https://img.shields.io/badge/Stack-MERN-blueviolet) ![License](https://img.shields.io/badge/License-MIT-green) ![Deployment](https://img.shields.io/badge/Deploy-Railway-purple) ![Status](https://img.shields.io/badge/Status-Live-brightgreen)

## 🌐 Live Demo

| | URL |
|---|---|
| **🖥️ Frontend (Live App)** | [https://taskflow-frontend.up.railway.app](https://taskflow-frontend.up.railway.app) |
| **⚙️ Backend API** | [https://taskflow-backend-api.up.railway.app/api/health](https://taskflow-backend-api.up.railway.app/api/health) |
| **🐙 GitHub Repo** | [https://github.com/pawanpreetsingh559-cell/team-task-manager](https://github.com/pawanpreetsingh559-cell/team-task-manager) |

### 🔑 Quick Login (use these to test both roles instantly)
| Role | Email | Password |
|------|-------|----------|
| **⚡ Admin** | admin@taskflow.com | Admin@123 |
| **👤 Member** | member@taskflow.com | Member@123 |

---

## 📸 Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | JWT-based signup/login with role selection (Admin/Member) |
| 📊 **Dashboard** | Stats overview, recent tasks, active projects with progress |
| 📁 **Projects** | Create, edit, delete projects with color labels and member assignments |
| 🗂 **Kanban Board** | Visual task board with columns: To Do → In Progress → In Review → Done |
| 📋 **List View** | Tabular task view with inline status updates |
| ✅ **Tasks** | Create/assign tasks with priority, due dates, tags — filter by status/priority |
| 👥 **Team** | Admin-only panel to manage users, promote/demote roles |
| ⚠️ **Overdue Alerts** | Automatic overdue detection with visual highlights and banner |
| 🎨 **Dark UI** | Premium dark-mode interface with framer-motion animations |

---

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express.js** — REST API server
- **MongoDB** + **Mongoose** — Database & ODM
- **JWT** + **bcryptjs** — Authentication & password hashing
- **express-validator** — Input validation

### Frontend
- **React 18** + **Vite** — SPA framework
- **React Router v6** — Client-side routing
- **Framer Motion** — Animations & transitions
- **Axios** — HTTP client with JWT interceptors
- **react-hot-toast** — Toast notifications
- **Lucide React** — Icon library
- **Vanilla CSS** — Custom design system (no Tailwind)

---

## 📁 Project Structure

```
TeamTaskManager/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/auth.js     # JWT + admin guard
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── Project.js        # Project schema
│   │   └── Task.js           # Task schema
│   ├── routes/
│   │   ├── auth.js           # /api/auth/*
│   │   ├── projects.js       # /api/projects/*
│   │   ├── tasks.js          # /api/tasks/*
│   │   └── users.js          # /api/users/*
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/axios.js           # Axios instance
    │   ├── context/AuthContext.jsx # Auth state
    │   ├── components/
    │   │   ├── Layout.jsx         # Sidebar layout
    │   │   └── TaskModal.jsx      # Reusable task form
    │   ├── pages/
    │   │   ├── AuthPage.jsx       # Login/Signup
    │   │   ├── Dashboard.jsx      # Home dashboard
    │   │   ├── Projects.jsx       # Projects grid
    │   │   ├── ProjectDetail.jsx  # Kanban + List view
    │   │   ├── Tasks.jsx          # My tasks with filters
    │   │   └── Team.jsx           # Team management
    │   ├── utils/helpers.js       # Shared utilities
    │   ├── App.jsx
    │   └── index.css              # Full design system
    ├── index.html
    └── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/pawanpreetsingh559-cell/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5001
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/teamtaskmanager
JWT_SECRET=your_super_secret_key
```

Start backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

> Frontend runs on `http://localhost:3000`
> Backend runs on `http://localhost:5001`

---

## 🔑 Demo Credentials (for reviewers)

Use these pre-seeded accounts to test both roles immediately:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@taskflow.com | Admin@123 |
| **Member** | member@taskflow.com | Member@123 |

> **Admin** can create projects, manage team, assign tasks, promote/demote roles.
> **Member** can view assigned projects, create & update tasks within their projects.

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login & get token |
| GET | `/api/auth/me` | Private | Get current user |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/projects` | Private | List all accessible projects |
| GET | `/api/projects/:id` | Private | Get project details |
| POST | `/api/projects` | Admin | Create project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project + tasks |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:uid` | Admin | Remove member |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tasks` | Private | Get tasks (with filters) |
| GET | `/api/tasks/stats` | Private | Dashboard stats |
| GET | `/api/tasks/project/:id` | Private | Tasks by project |
| POST | `/api/tasks` | Private | Create task |
| PUT | `/api/tasks/:id` | Private | Update task |
| PATCH | `/api/tasks/:id/status` | Private | Update status |
| DELETE | `/api/tasks/:id` | Private | Delete task |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Private | List all users |
| PUT | `/api/users/:id/role` | Admin | Promote/demote user |
| DELETE | `/api/users/:id` | Admin | Remove user |

---

## 🔐 Role-Based Access Control

| Action | Admin | Member |
|--------|-------|--------|
| Create/Edit/Delete Projects | ✅ | ❌ |
| Add/Remove Project Members | ✅ | ❌ |
| View assigned projects | ✅ | ✅ |
| Create/Edit Tasks | ✅ | ✅ (own projects) |
| Delete Tasks | ✅ | ✅ (own tasks) |
| Manage Team Roles | ✅ | ❌ |
| View Team Page | ✅ | ❌ |

---

## 🌱 Seed Demo Data

To populate the database with demo users, projects and tasks:

```bash
cd backend
node seed.js
```

This creates:
- **1 Admin** — `admin@taskflow.com` / `Admin@123`
- **2 Members** — `member@taskflow.com` / `Member@123` and `bob@taskflow.com` / `Member@123`
- **3 Projects** — Website Redesign, Mobile App MVP, API Integration
- **10 Tasks** — across all statuses (todo, in-progress, in-review, done) + 2 overdue tasks

> ⚠️ Running `seed.js` clears existing data before seeding.

---

## 🌐 Deployment on Railway

### Backend
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select the `backend` directory
3. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `PORT`
4. Railway auto-detects Node.js and runs `npm start`

### Frontend
1. In the same Railway project → Add Service → GitHub
2. Select the `frontend` directory
3. Set build command: `npm run build`
4. Set start command: `npx serve -s dist -p $PORT`
5. Add env var: `VITE_API_URL=https://your-backend.railway.app/api`

> Update `frontend/src/api/axios.js` baseURL to use `import.meta.env.VITE_API_URL` for production.

---

## 👨‍💻 Author

Built with ❤️ for the Ethara.AI Full-Stack Developer Assignment.

**Pawanpreet Singh**
- 🐙 GitHub: [@pawanpreetsingh559-cell](https://github.com/pawanpreetsingh559-cell)
- 📧 Email: pawanpreetsingh559@gmail.com

---

- **Stack:** MERN (MongoDB, Express, React, Node.js)
- **Design:** Premium dark UI with Framer Motion animations
- **Auth:** JWT with role-based access (Admin/Member)
- **Deployment:** Railway (backend + frontend)
