# Smart Lost & Found System

Full-stack web app for reporting, searching, claiming, and managing lost and found items.

## Stack

- Frontend: React (Vite) + Axios
- Backend: Node.js + Express
- Database: MongoDB
- Auth: JWT

## Quick start

### 1. Start MongoDB

**Option A — Docker (recommended)**

```bash
docker compose up -d
```

**Option B — Local MongoDB** already running on port 27017.

**Option C — MongoDB Atlas**  
Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI` to your Atlas connection string.

If MongoDB is not running, the backend automatically uses an in-memory database so you can still demo the app. Data is lost when the server stops.

### 2. Backend

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

API runs at http://localhost:5000

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at http://localhost:5173

### Default env (`backend/.env`)

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_lost_found
JWT_SECRET=change-this-secret-in-production
```

## Features

- Register / login with JWT
- Report lost or found items (optional image)
- Search and filter by keyword, type, category, location, status
- Claim a found item; reporter can approve or reject
- My Reports: edit, delete, update status, view claims
- Dashboard statistics

## API overview

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/auth/me` | Yes |
| GET | `/api/items` | Yes |
| GET | `/api/items/:id` | Yes |
| POST | `/api/items` | Yes (multipart) |
| PUT | `/api/items/:id` | Yes (owner) |
| PATCH | `/api/items/:id/status` | Yes (owner) |
| DELETE | `/api/items/:id` | Yes (owner) |
| GET | `/api/claims/item/:itemId` | Yes |
| GET | `/api/claims/mine` | Yes |
| POST | `/api/claims` | Yes |
| PATCH | `/api/claims/:id` | Yes (item owner) |
| GET | `/api/dashboard/stats` | Yes |

## Production build

```bash
cd frontend && npm run build
cd ../backend && npm start
```

In production, Express serves the React build from `frontend/dist` when `NODE_ENV=production`.
