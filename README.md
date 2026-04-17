# 🌆 CivicPulse: Smart Public Service CRM (PS-CRM)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Appwrite](https://img.shields.io/badge/Backend_as_a_Service-Appwrite-f02e65?style=for-the-badge&logo=appwrite&logoColor=white)](https://appwrite.io)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**CivicPulse** is a next-generation civic engagement platform that empowers citizens to report, track, and verify public infrastructure issues in real-time. Built for speed, transparency, and accountability, it bridges the gap between the public and urban management.

---

## 🏗️ Multi-Portal Ecosystem

### 👨‍💼 Citizen Portal

_Empowering community action through engagement._

- **📍 Smart Reporting**: Report issues (potholes, garbage, etc.) with GPS auto-detection and AI-assisted category suggestions.
- **🗺️ Interactive Map**: View nearby issues, status updates, and community verifications in real-time.
- **🏆 Civic Credits**: Earn reputation points for verified reports and successful resolutions.
- **📈 Personal Dashboard**: Track your contribution history and follow the lifecycle of your complaints.

### 🛡️ Admin Portal

_High-level oversight and system-wide management._

- **📊 Global Analytics**: Monitor MTTR (Mean Time to Resolution) and overall SLA compliance across all wards.
- **👥 User Management**: Manage user accounts, monitor reputation trends, and moderate reported content.
- **📥 Unified Queue**: Global inbox to filter, search, and oversee every complaint in the system.
- **⚙️ SLA Configuration**: Define and adjust resolution timelines based on issue categories.

### 📂 Manager Portal

_Regional operations and workflow optimization._

- **📍 Jurisdiction Overview**: Real-time monitoring of active complaints within specific states or regions.
- **👷 Worker Assignment**: Intelligent task routing to field officers based on location and current workload.
- **📈 Team Performance**: Track worker efficiency and regional resolution metrics.
- **🔄 Automated Routing**: Backend-driven logic for seamless transition from "Verified" to "Assigned".

### 👷 Worker Portal

_Field execution and resolution verification._

- **📋 Task Dashboard**: Mobile-optimized list of assigned tasks sorted by SLA urgency.
- **✅ Status Updates**: Direct updates from "En Route" to "Resolved" with field-level clarity.
- **📸 GPS-Locked Proof**: Resolution photos can only be uploaded within 150m of the GPS pin for total transparency.
- **🛠️ Service History**: Log of completed tasks and impact on community infrastructure.

---

## ✨ Key Technical Features

- **🖼️ AI Smart-Snap**: Automated image-based category classification for faster reporting.
- **⏱️ SLA Tracking**: Real-time countdowns with automated escalation triggers for overdue tasks.
- **🔗 Graded Trust Auth**: Phased authentication levels and reward models for verified users.
- **📊 Real-time Synchronization**: Powered by Appwrite for instant updates across all portals.

---

## 🏗️ Architecture

- **Frontend**: React 18, Vite, Tailwind CSS (v4), Lucide Icons, Framer Motion.
- **Backend**: FastAPI (Python 3.10+), Pydantic.
- **Database/Infrastructure**: Appwrite (Auth, Databases, Storage, Real-time).

---

## 📁 Project Structure

| Path        | Purpose                                                                          |
| ----------- | -------------------------------------------------------------------------------- |
| `backend/`  | 🐍 FastAPI Application (Business Logic & AI Endpoints)                           |
| `frontend/` | ⚛️ React Multi-Portal Application (Vite + Tailwind)                              |
| `docs/`     | 📝 Comprehensive [PRD](docs/PRD.md) and [Feature Guides](docs/Final_features.md) |

---

## 📜 Portals Quick Reference

| Portal      | Primary User      | Key Goal                       |
| ----------- | ----------------- | ------------------------------ |
| **Citizen** | General Public    | Report & Track Issues          |
| **Admin**   | System Admins     | Global Monitoring & Settings   |
| **Manager** | Regional Managers | Task Routing & Supervision     |
| **Worker**  | Field Officers    | Task Resolution & Verification |

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
