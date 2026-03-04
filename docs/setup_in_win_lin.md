# Platform-Specific Setup Guide

Quick setup instructions for Windows, macOS, and Linux.

## 📱 macOS (Recommended for Development)

### Using Docker (Fastest)

```bash
# 1. Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop/
# Or use Homebrew
brew install docker

# 2. Clone repository
git clone <repo-url>
cd Smart-Public-Service-CRM-PS-CRM

# 3. Setup and run
chmod +x docker-quickstart.sh
./docker-quickstart.sh
```

### Local Development (Python + Node)

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python 3.12
brew install python@3.12

# Install Node.js 18
brew install node@18

# Clone repo
git clone <repo-url>
cd Smart-Public-Service-CRM-PS-CRM

# Get Firebase keys (see DOCKER_SETUP.md)
# ... place .env and firebase-key.json ...

# Backend
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py

# Frontend (new terminal)
cd frontend
npm install
npm start
```

---

## 🪟 Windows (Using Docker Recommended)

### Using Docker with WSL2 (Recommended)

**Prerequisites:**
- Windows 10+ with WSL2 enabled
- Docker Desktop for Windows (setup installs WSL2)

```powershell
# 1. Download and install Docker Desktop for Windows
# https://www.docker.com/products/docker-desktop/

# 2. Open PowerShell or CMD and clone repo
cd %USERPROFILE%\Documents
git clone <repo-url>
cd Smart-Public-Service-CRM-PS-CRM

# 3. Setup environment
copy .env.example .env
# Edit .env with your Firebase credentials (use Notepad)

# 4. Place firebase-key.json in backend folder

# 5. Start services
docker-compose up --build
```

Access at: http://localhost:3000

### Local Development (Python + Node)

**Prerequisites:**
- Python 3.12 [Download](https://www.python.org/downloads/)
- Node.js 18 [Download](https://nodejs.org/)
- Git [Download](https://git-scm.com/)

```powershell
# 1. Clone repository
git clone <repo-url>
cd Smart-Public-Service-CRM-PS-CRM

# 2. Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py

# 3. Frontend Setup (new PowerShell window)
cd frontend
npm install
npm start
```

**Troubleshooting:**
- If `venv` activation fails, try: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- If ports are blocked, check Windows Firewall

---

## 🐧 Linux (Debian/Ubuntu)

### Using Docker (Fastest)

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 2. Add current user to docker group (avoid sudo)
sudo usermod -aG docker $USER
newgrp docker

# 3. Clone and setup
git clone <repo-url>
cd Smart-Public-Service-CRM-PS-CRM

chmod +x docker-quickstart.sh
./docker-quickstart.sh
```

### Local Development

```bash
# 1. Install Python and Node
sudo apt-get update
sudo apt-get install python3.12 python3.12-venv python3-pip nodejs npm -y

# 2. Clone repo
git clone <repo-url>
cd Smart-Public-Service-CRM-PS-CRM

# 3. Backend
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py

# 4. Frontend (new terminal)
cd frontend
npm install
npm start
```

---

## 🚀 All Platforms - After Setup

### Verify Everything Works

```bash
# In one terminal, check backend is running
curl http://localhost:8000/docs

# Should show Swagger API documentation ✅

# In another terminal, check frontend is running
curl http://localhost:3000

# Should return HTML content ✅
```

### Create Test Account

1. Visit http://localhost:3000
2. Click "Sign up"
3. Enter email and password
4. Create account

### Submit a Test Report

1. Login with your account
2. Click "Report" button
3. Fill in issue details:
   - Title: "Test pothole"
   - Address: "123 Main Street"
   - City: "Your City"
   - State: "Your State"
   - PIN: "123456"
4. Click "Submit Report"

### View Reports

1. Click "Browse" to see all reports
2. Click on any report card to view details
3. Verify community features work

---

## 🔄 Environment Variables Reference

### Create `.env` File

```bash
# macOS/Linux
touch .env

# Windows PowerShell
New-Item -Path .env -ItemType File
```

### Add Firebase Credentials

```env
REACT_APP_FIREBASE_API_KEY=your_actual_value
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123def456
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

Get these from [Firebase Console](https://console.firebase.google.com/) > Your Project > Project Settings > General

### Place Service Account Key

```bash
# Download from Firebase Console > Service Accounts section
# then place at:
backend/firebase-key.json
```

---

## ⚡ Quick Script Templates

### macOS/Linux Startup Script

Create `start.sh`:
```bash
#!/bin/bash

# Start backend
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!

# Start frontend
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop"

wait
```

Run with: `chmod +x start.sh && ./start.sh`

### Windows Batch Script

Create `start.bat`:
```batch
@echo off

REM Start backend
cd backend
call venv\Scripts\activate
start python main.py

REM Start frontend
cd ..\frontend
start npm start

echo Services started at:
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
pause
```

Run with: `start.bat`

---

## 🆘 Platform-Specific Issues

### macOS
- **Issue**: Permission denied on venv activation
  ```bash
  chmod +x venv/bin/activate
  ```

- **Issue**: Python command not found
  ```bash
  # Use full path
  /usr/local/bin/python3.12 -m venv venv
  ```

### Windows
- **Issue**: PowerShell script execution disabled
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

- **Issue**: Port 3000/8000 in use
  ```powershell
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Linux
- **Issue**: Permission denied on docker commands
  ```bash
  sudo usermod -aG docker $USER
  newgrp docker
  # Log out and back in if still issues
  ```

- **Issue**: Python venv activation not found
  ```bash
  python3 -m venv venv
  . venv/bin/activate  # Note the dot
  ```

---

## 📊 System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| RAM | 4GB | 8GB+ |
| Disk Space | 2GB free | 5GB+ free |
| Python | 3.10+ | 3.12+ |
| Node.js | 16+ | 18+ |
| Docker | Latest | Latest |
| OS | Windows 10+, macOS 10.15+, Ubuntu 18.04+ | Latest LTS |

---

## ✅ Verification Checklist

- [ ] Git installed and repository cloned
- [ ] Python 3.12+ installed (or Docker)
- [ ] Node.js 18+ installed (or Docker)
- [ ] `.env` file created with Firebase credentials
- [ ] `backend/firebase-key.json` placed
- [ ] `docker-compose.yml` or dependencies installed
- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Can create account on landing page
- [ ] Can submit a test complaint
- [ ] Can view complaints in browse page

---

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for complete setup guide.
