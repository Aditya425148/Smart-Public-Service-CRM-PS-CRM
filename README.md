# Smart Public Service CRM (PS-CRM)

Civic engagement platform for reporting and tracking public infrastructure issues.

---

## 🚀 Quick Start with Docker

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Firebase Project](https://console.firebase.google.com/)

### Setup (5 minutes)

**1. Get Firebase credentials:**
```bash
cp .env.example .env
# Edit .env with your Firebase credentials from Firebase Console
```

**2. Download Firebase service account key:**
- Firebase Console > Project Settings > Service Accounts > Generate Private Key (JSON)
- Save as `backend/firebase-key.json`

**3. Start with Docker:**
```bash
docker-compose up --build
```

**4. Access application:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Stop
```bash
docker-compose down
```

---

## 📁 Project Structure

```
├── backend/              # FastAPI + Firebase
├── frontend/             # React 18 + TypeScript
├── docs/                 # Documentation
├── docker-compose.yml    # Docker setup
└── .env.example          # Environment template
```

---

## 🔐 Environment Variables

Edit `.env` with Firebase credentials from Firebase Console:

```env
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement
```

Place `firebase-key.json` (from Firebase Service Accounts) in `backend/`

---

## ✨ Features

- Report civic issues (potholes, streetlights, garbage, water, etc)
- Community verification system
- AI-powered category detection
- Real-time priority scoring
- SLA tracking
- Interactive maps
- Firebase authentication (email/password + Google OAuth)

---

## 🆘 Troubleshooting

**Port in use?**
```bash
lsof -i :3000     # Find process on port 3000
kill -9 <PID>     # Kill process
```

**Firebase not connecting?**
- Verify `.env` has all Firebase variables
- Check `backend/firebase-key.json` exists
- Create Firestore database in Firebase Console

**Docker build error?**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up --build
```

---

## 📚 Documentation

- [Firebase Setup](./docs/FIREBASE_SETUP.md)
- [Features](./docs/Final_features.md)
- [FAQ](./docs/Judge_crossquestions.md)
- [Requirements](./docs/PRD.md)

---

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python
- **Database**: Firestore (real-time)
- **Auth**: Firebase Authentication
- **Maps**: Leaflet + OpenStreetMap
- **Deployment**: Docker + Docker Compose