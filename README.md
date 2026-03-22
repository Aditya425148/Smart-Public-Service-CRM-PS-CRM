# 🌆 CivicPulse: Smart Public Service CRM (PS-CRM)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Appwrite](https://img.shields.io/badge/Backend_as_a_Service-Appwrite-f02e65?style=for-the-badge&logo=appwrite&logoColor=white)](https://appwrite.io)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**CivicPulse** is a next-generation civic engagement platform that empowers citizens to report, track, and verify public infrastructure issues in real-time. Built for speed, transparency, and accountability, it bridges the gap between the public and urban management.

---

## ✨ Key Features

### 👨‍💼 For Citizens

- **📍 Smart Reporting**: Report issues like potholes, broken streetlights, or waste with GPS auto-detection.
- **🖼️ AI Smart-Snap**: AI-assisted category suggestion based on uploaded photos.
- **🗺️ The Fix Map**: Interactive map showing nearby issues, their status, and community verifications.
- **⏱️ SLA Tracking**: Real-time countdowns for issue resolution with automatic escalation triggers.
- **🏆 Leaderboard**: Earn credits and climb the rankings by reporting and verifying neighborhood issues.

### 🛡️ For Administrators & Managers

- **📊 Admin Portal**: Comprehensive command center for ward-level statistics and performance metrics.
- **📋 Management Dashboard**: Streamlined interface for assigning tasks to field officers and monitoring progress.
- **📈 Data Visualization**: Real-time charts and heatmaps for infrastructure health monitoring.

---

## 🏗️ Architecture

- **Frontend**: React 18, Vite, Tailwind CSS (v4), Lucide Icons, Framer Motion.
- **Backend**: FastAPI (Python 3.10+), Pydantic.
- **Database/Infrastructure**: Appwrite (Auth, Databases, Storage, Real-time).

---

## 📁 Project Structure

| Path        | Purpose                                      |
| ----------- | -------------------------------------------- |
| `backend/`  | 🐍 FastAPI Application (Business Logic & AI) |
| `frontend/` | ⚛️ React Application (Vite + Tailwind)       |
| `docs/`     | 📝 Documentation & PRDs                      |

---

## 🚀 Quick Start

### 📋 Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- An **Appwrite** Project ([Create one for free](https://cloud.appwrite.io))

### 1️⃣ Clone & Install

```bash
git clone https://github.com/Nehul1605/Smart-Public-Service-CRM-PS-CRM
cd Smart-Public-Service-CRM-PS-CRM

# Setup Backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt

# Setup Frontend
cd frontend
npm install
```

### 2️⃣ Environment Configuration

Create a `.env` file in `backend/` and a `.env.local` in `frontend/`.

**Backend `.env`:**

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_id
APPWRITE_API_KEY=your_secret_key
# These can be default/demo values if using local setup scripts
APPWRITE_DATABASE_ID=civicpulse_db
APPWRITE_COLLECTION_ID=complaints
```

**Frontend `.env.local`:**

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_id
VITE_API_URL=http://localhost:8000
```

### 3️⃣ Run Locally

**Terminal 1 (Backend):**

```bash
cd backend
python main.py
```

**Terminal 2 (Frontend):**

```bash
cd frontend
npm run dev
```

---

## License

This project is licensed under the MIT License.

---

_Created with ❤️ for smarter cities._
