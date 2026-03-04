# Docker Setup Guide - PS-CRM

This guide explains how to run PS-CRM using Docker (recommended for quick setup) and without Docker (for development).

## Table of Contents
1. [Quick Start with Docker](#quick-start-with-docker)
2. [Local Development Setup](#local-development-setup)
3. [Installation Steps](#installation-steps)
4. [Troubleshooting](#troubleshooting)

---

## Quick Start with Docker

### Prerequisites
- **Docker** ([Download](https://www.docker.com/products/docker-desktop/))
- **Docker Compose** (included with Docker Desktop)
- **Firebase Project** with credentials
- Clone this repository

### 1. Setup Environment Variables

Copy Firebase credentials to `.env` file:

```bash
# In root directory, create .env file
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 2. Setup Firebase Backend Credentials

```bash
# Backend needs firebase-key.json (service account json)
# Download from Firebase Console > Project Settings > Service Accounts > Generate Private Key

# Place in backend/ directory:
cp /path/to/firebase-key.json ./backend/firebase-key.json

# Make sure it's in .gitignore (already configured)
```

### 3. Start Services with Docker Compose

```bash
cd ~/Projects/Smart-Public-Service-CRM-PS-CRM

# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 5. Stop Services

```bash
# Stop running services
docker-compose down

# Stop and remove data
docker-compose down -v
```

---

## Local Development Setup 

### Prerequisites
- **Python 3.12+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** (included with Node.js)
- **Firebase Project** with credentials
- Clone this repository

### 1. Setup Environment Files

#### Backend Setup
```bash
cd backend

# Copy environment template
cp .env.example .env

# Place Firebase service account key
cp /path/to/firebase-key.json ./firebase-key.json
```

#### Frontend Setup
```bash
cd ../frontend

# Copy environment template
cp .env.example .env.local

# Add Firebase credentials to .env.local
cat >> .env.local << EOF
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
EOF
```

### 2. Install Backend Dependencies

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend

# Install npm packages
npm install
```

---

## Installation Steps

### Running the Backend (Local)

```bash
# From backend/ directory with venv activated
python main.py

# Or with uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will start at: http://localhost:8000

### Running the Frontend (Local)

```bash
# From frontend/ directory
npm start

# Or build for production
npm run build
```

Frontend will start at: http://localhost:3000

### Running Both (Local)

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

---

## Docker Commands Reference

### Build Images
```bash
# Build specific service
docker-compose build backend
docker-compose build frontend

# Build all
docker-compose build
```

### Run Services
```bash
# Start in foreground (see logs)
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f  # all services
```

### Stop Services
```bash
# Stop running services
docker-compose stop

# Remove stopped containers
docker-compose rm

# Stop everything (down)
docker-compose down

# Remove volumes (clears data)
docker-compose down -v
```

### Exec Commands in Container
```bash
# Run command in backend container
docker-compose exec backend python -c "import firebase_admin; print('Firebase OK')"

# Open shell in frontend container
docker-compose exec frontend sh
```

---

## Development vs Production

### Development (Local or Docker)
- Hot reload enabled
- Full source code visible
- Debug friendly
- Slower startup

### Production (Docker)
- Optimized build
- Minified code
- No hot reload
- Faster performance

To run in production mode locally:
```bash
cd frontend
npm run build
serve -s build -l 3000
```

---

## Troubleshooting

### Issue: "firebase-key.json not found"

**Solution:**
```bash
# Download from Firebase Console
# 1. Go to Firebase Console
# 2. Project Settings > Service Accounts
# 3. Generate Private Key > JSON
# 4. Move to backend/firebase-key.json

# Verify it exists
ls -la backend/firebase-key.json
```

### Issue: Port 3000 or 8000 already in use

**Solution:**
```bash
# Change ports in docker-compose.yml
# Or kill existing process

# Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or find on port 8000
lsof -i :8000
kill -9 <PID>
```

### Issue: "Cannot find module" in frontend

**Solution:**
```bash
cd frontend

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Then rebuild
npm run build
```

### Issue: Firebase authentication not working

**Solution:**
1. Check `.env` or `.env.local` has all Firebase variables
2. Verify Firebase project exists and is not disabled
3. Check Firebase Console > Authentication > Providers enabled
4. Restart services: `docker-compose restart` or restart dev servers

### Issue: "Python 3.14 not compatible"

**Solution:**
The project uses Python 3.12 in Docker (more stable). If you're running locally:
```bash
# Use Python 3.12
python3.12 -m venv venv

# Or downgrade to 3.11
python3.11 -m venv venv
```

### Issue: Backend can't connect to Firestore

**Solution:**
1. Verify `firebase-key.json` is valid JSON
2. Check Firebase project ID matches in key file
3. Verify Firestore database exists in Firebase Console
4. Check service account has correct permissions

### Issue: Docker containers keep crashing

**Solution:**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

---

## Environment Variables Checklist

### Backend (.env or docker-compose.yml)
- ✅ `PYTHONUNBUFFERED=1` (for Docker logging)
- ✅ `firebase-key.json` (mounted/placed correctly)
- ✅ `CORS_ORIGINS` (defaults to localhost:3000)

### Frontend (.env.local or docker-compose.yml)
- ✅ All 7 `REACT_APP_FIREBASE_*` variables
- ✅ `REACT_APP_API_URL=http://localhost:8000`

### Required Firebase Credentials
From Firebase Console > Project Settings:
1. API Key
2. Auth Domain
3. Project ID
4. Storage Bucket
5. Messaging Sender ID
6. App ID
7. Measurement ID (optional)
8. Service Account Private Key (JSON file for backend)

---

## Next Steps

After setup:
1. ✅ Create an account on landing page
2. ✅ Submit a civic complaint
3. ✅ Browse all complaints
4. ✅ Verify community issues
5. ✅ Track SLA and priority scores

For integration details, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
