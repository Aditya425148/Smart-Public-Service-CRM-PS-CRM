# Smart Public Service CRM (PS-CRM)

Civic engagement platform for reporting and tracking public infrastructure issues.

---

## 🏗️ Architecture

```
Browser (React) ──REST──▶ FastAPI Backend (:8000) ──▶ Appwrite Cloud
                    │
                    └──▶ Appwrite JS SDK (auth only — login/signup direct to Appwrite)
```

---

## 📁 Project Structure

### 🐍 Backend (`backend/`)

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app entry point, CORS, route registration |
| `appwrite_client.py` | Appwrite Python SDK setup using server API key |
| `routes/complaints.py` | Complaints CRUD + priority score & SLA calculation |
| `routes/leaderboard.py` | Citizen impact rankings (`calculateRankings` logic) |
| `routes/stats.py` | Ward-level resolution statistics |
| `routes/uploads.py` | Photo upload/delete proxied to Appwrite Storage |
| `requirements.txt` | Python dependencies |
| `.env` | Secrets — **gitignored, never commit** |

### ⚛️ Frontend (`frontend/src/`)

| File | Purpose |
|------|---------|
| `app/appwrite.ts` | Appwrite JS SDK init (auth only) |
| `app/api.ts` | `fetch` wrapper — attaches session header, calls FastAPI |
| `app/appwriteService.ts` | Service layer: auth → Appwrite direct, data → FastAPI |
| `app/pages/ReportIssue.tsx` | Multi-step complaint submission form |
| `app/pages/Leaderboard.tsx` | Citizen rankings UI |
| `app/pages/...` | Dashboard, ComplaintDetail, Login, etc. |
| `.env.local` | Frontend env vars — **gitignored, never commit** |

---

## � Quick Start

### Prerequisites
- Python 3.10+ with a virtualenv
- Node.js 18+
- [Appwrite](https://cloud.appwrite.io) project (free tier works)

### 1. Clone & setup

```bash
git clone https://github.com/Nehul1605/Smart-Public-Service-CRM-PS-CRM
cd Smart-Public-Service-CRM-PS-CRM
python -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
cd frontend && npm install
```

### 2. Configure environment

**`backend/.env`** (copy from `.env.example`):
```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_server_api_key      # Appwrite Console → API Keys
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_COLLECTION_ID=complaints
APPWRITE_BUCKET_ID=your_bucket_id
```

**`frontend/.env.local`**:
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COMPLAINTS_COLLECTION_ID=complaints
VITE_APPWRITE_BUCKET_ID=your_bucket_id
VITE_API_URL=http://localhost:8000
```

### 3. Run

```bash
# Terminal 1 — Backend
source venv/bin/activate && cd backend
python3 main.py
# API running at http://localhost:8000
# API docs at http://localhost:8000/docs

# Terminal 2 — Frontend
cd frontend
npm run dev
# App running at http://localhost:5173
```

---

## 🔐 Appwrite Setup

1. Create a project at [cloud.appwrite.io](https://cloud.appwrite.io)
2. **Auth** → Settings → Enable **Email/Password**
3. **Databases** → Create database + `complaints` collection
4. **Storage** → Create a bucket for photos
5. **API Keys** → Create server key with `databases.read/write`, `storage.read/write`

---

## ✨ Features

- Report civic issues (potholes, streetlights, garbage, water, safety, etc.)
- Multi-step form with photo upload and GPS location
- AI priority scoring based on category urgency
- SLA tracking per category (Safety=12h, Water=24h, etc.)
- Citizen impact leaderboard with real-time rankings
- Ward-level resolution statistics
- Appwrite authentication (email/password + Google OAuth)

---

## �️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS + Vite |
| Backend | FastAPI + Python 3.10+ |
| Database | Appwrite Database |
| Auth | Appwrite Auth (client-side sessions) |
| Storage | Appwrite Storage (photos) |
| Animations | Framer Motion |