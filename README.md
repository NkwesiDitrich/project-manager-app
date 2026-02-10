# Tasco – Project Management App

A full-stack web application for teams to manage workspaces, projects, and tasks. Users can sign up, create workspaces, add projects and tasks, assign members, track progress, and chat with their team.

---

## Features

- **Authentication**: Sign up, sign in, email verification, forgot password, reset password
- **Workspaces**: Create workspaces, invite members, manage roles
- **Projects**: Create projects inside workspaces, set status and due dates
- **Tasks**: Create tasks with priority, status, assignees, subtasks, due dates, comments, and activity log
- **Dashboard**: Stats, charts (task trends, project status, priority, productivity), recent projects, upcoming tasks
- **My Tasks**: List and board view of tasks assigned to you, with filters and search
- **Chat**: Workspace-level chat with text and image messages
- **Achievements**: Gamification and leaderboard per workspace
- **Profile**: Update name, profile picture, change password

---

## Tech Stack

| Layer    | Technologies |
| -------- | ------------- |
| Frontend | React 19, React Router 7, TypeScript, Tailwind CSS, TanStack Query, Axios |
| Backend  | Node.js, Express, MongoDB (Mongoose), JWT, Zod (validation) |
| Database | MongoDB (e.g. MongoDB Atlas) |

---

## Project Structure

```
project-manager/
├── backend/           # Express API
│   ├── controllers/   # Request handlers (auth, workspace, project, task, etc.)
│   ├── middleware/    # Auth (JWT), validation
│   ├── models/       # Mongoose schemas (User, Workspace, Project, Task, etc.)
│   ├── routes/       # API route definitions
│   ├── libs/          # Shared utilities (email, validation schemas, etc.)
│   └── index.js      # App entry point
├── frontend/          # React SPA (React Router, Vite)
│   └── app/
│       ├── components/  # Reusable UI and feature components
│       ├── hooks/       # Data-fetching and auth hooks
│       ├── routes/      # Pages (auth, dashboard, workspaces, project, task, etc.)
│       ├── provider/    # Auth and React Query providers
│       └── lib/         # API client, schema, utils
├── README.md         # This file
└── DEPLOYMENT.md     # Live hosting guide (Render, MongoDB Atlas)
```

---

## Setup Instructions

### Prerequisites

- **Node.js** 18 or later
- **MongoDB** – local instance or a MongoDB Atlas cluster (free tier is enough)
- **npm** (or yarn / pnpm)

### 1. Clone the repository

```bash
git clone <repository-url>
cd project-manager
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder (see `backend/.env.example` for a template):

```env
MONGODB_URI=mongodb://localhost:27017/tasco
JWT_SECRET=your-long-random-secret-at-least-32-chars
FRONTEND_URL=http://localhost:5173
PORT=3001
```

- **MONGODB_URI**: Your MongoDB connection string (e.g. Atlas URI or `mongodb://localhost:27017/tasco`).
- **JWT_SECRET**: A long random string used to sign JWTs (e.g. generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
- **FRONTEND_URL**: URL of the frontend in development (e.g. `http://localhost:5173`).
- **PORT**: Port the API will listen on (default 3001).

Optional (for email and extra features):

- **SEND_GRID_API**: SendGrid API key (for verification and password-reset emails).
- **FROM_EMAIL**: Sender email address used with SendGrid.
- **ARCJET_KEY**: Arcjet key for optional bot/rate limiting (app works without it).

Start the backend:

```bash
npm run dev
```

The API will be available at `http://localhost:3001`. The root route returns a welcome message; the main API is under `/api-v1`.

### 3. Frontend setup

Open a new terminal in the project root:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder (see `frontend/.env.example` for a template):

```env
VITE_API_URL=http://localhost:3001/api-v1
```

- **VITE_API_URL**: Base URL of the backend API (must end with `/api-v1`).

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in the terminal).

### 4. Verify setup

1. Open `http://localhost:5173` in the browser.
2. Sign up with an email and password.
3. After sign-in (and optional email verification), create a workspace and a project, then add a task.

If the backend or database is not running, sign-in and data loading will fail; ensure both backend and MongoDB are running and that `.env` values are correct.

---

## Running in production mode (locally)

- **Backend**: From `backend`, run `npm start` (uses `node index.js`). Set `PORT` and `MONGODB_URI` (and optionally `FRONTEND_URL`) in `.env`.
- **Frontend**: From `frontend`, run `npm run build` then `npm start`. Set `VITE_API_URL` to your backend URL (e.g. `http://localhost:3001/api-v1`) before building.

---

## Deployment (live hosting)

For deploying the app to a live server with external data (e.g. MongoDB Atlas and Render), see **[DEPLOYMENT.md](./DEPLOYMENT.md)**. It covers MongoDB Atlas, environment variables, and step-by-step deployment of the backend and frontend.

---

## API overview

All API routes are prefixed with `/api-v1`.

| Area       | Examples |
| ---------- | -------- |
| Auth       | `POST /api-v1/auth/register`, `POST /api-v1/auth/login`, `POST /api-v1/auth/verify-email`, `POST /api-v1/auth/reset-password-request`, `POST /api-v1/auth/reset-password` |
| Workspaces | `GET /api-v1/workspaces`, `POST /api-v1/workspaces`, `GET /api-v1/workspaces/:id`, `POST /api-v1/workspaces/:id/invite-member`, `DELETE /api-v1/workspaces/:id/members/:userId` |
| Projects   | `POST /api-v1/projects/:workspaceId/create-project`, `GET /api-v1/projects/:projectId`, `GET /api-v1/projects/:projectId/tasks` |
| Tasks      | `POST /api-v1/tasks/:projectId/create-task`, `GET /api-v1/tasks/:taskId`, `PUT /api-v1/tasks/:taskId/status`, `GET /api-v1/tasks/my-tasks` |
| Users      | `GET /api-v1/users/profile`, `PUT /api-v1/users/profile`, etc. |
| Chat       | `GET /api-v1/chat/messages`, `POST /api-v1/chat/send`, etc. |
| Achievements | `GET /api-v1/achievements/...` |

Protected routes require the `Authorization: Bearer <token>` header. The frontend stores the token after login and sends it with each request.

---
## credentials

- Admin dashboard
  - Email: `hackergeek55@gmail.com`
  - Password: `123445678`
## License

**Educational Use Only License (Non-Commercial)**

Copyright (c) 2026

Permission is granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to use the Software **only for educational and non-commercial purposes**, subject to the following conditions:

- The Software may be used for learning, coursework, demos, and personal study.
- The Software may not be used, in whole or in part, for any commercial purpose, business activity, revenue-generating use, or production deployment.
- You may not sell, sublicense, or distribute the Software as part of a commercial product or service.
- This license must be included with any permitted copies or portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
