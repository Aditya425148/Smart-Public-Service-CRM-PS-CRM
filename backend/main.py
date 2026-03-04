from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List, Optional
import uuid
import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, auth as fb_auth

script_dir = os.path.dirname(os.path.abspath(__file__))
firebase_key_path = os.path.join(script_dir, "firebase-key.json")
cred = credentials.Certificate(firebase_key_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI(title="PS-CRM Backend", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ComplaintCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ComplaintUpdate(BaseModel):
    status: str

class Complaint(BaseModel):
    complaint_id: str
    title: str
    description: Optional[str]
    category: str
    subcategory: Optional[str]
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str
    priority_score: float
    created_at: str
    sla_deadline: str
    verification_count: int = 0
    photos: List[str] = []
    assignee: Optional[str] = None
    user_id: str

class AuthResponse(BaseModel):
    access_token: str
    user_id: str
    email: str

CATEGORIES = {
    "Garbage": {"icon": "🗑️", "sla_hours": 48},
    "Streetlight": {"icon": "💡", "sla_hours": 72},
    "Pothole": {"icon": "⚠️", "sla_hours": 96},
    "Water": {"icon": "💧", "sla_hours": 24},
    "Sanitation": {"icon": "🧹", "sla_hours": 48},
    "Construction": {"icon": "🚧", "sla_hours": 120},
    "Safety": {"icon": "🚨", "sla_hours": 12},
    "Other": {"icon": "📋", "sla_hours": 72},
}

CATEGORY_KEYWORDS = {
    "Garbage": ["garbage", "waste", "litter", "trash", "debris", "rubbish"],
    "Streetlight": ["light", "streetlight", "bulb", "dark", "lamp"],
    "Pothole": ["pothole", "hole", "road", "damaged", "crater", "pavement"],
    "Water": ["water", "leak", "supply", "pipe", "drain", "sewage"],
    "Sanitation": ["sanitation", "dirty", "hygiene", "stink", "odor"],
    "Construction": ["construction", "illegal", "building", "concrete"],
    "Safety": ["accident", "danger", "hazard", "unsafe", "risk"],
}

async def verify_firebase_token(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        token = authorization.split("Bearer ")[-1]
        decoded_token = fb_auth.verify_id_token(token)
        return decoded_token['uid']
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

def suggest_category(description: str, image_filename: Optional[str] = None) -> tuple[str, float]:
    text = (description or "").lower()
    filename = (image_filename or "").lower()
    
    combined = f"{text} {filename}"
    
    best_category = "Other"
    best_confidence = 0.4
    
    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in combined:
                confidence = min(0.95, 0.6 + len(keyword) / 20)
                if confidence > best_confidence:
                    best_category = category
                    best_confidence = confidence
    
    return best_category, best_confidence

@app.post("/api/suggest-category")
async def suggest_category_endpoint(description: Optional[str] = Form(None), filename: Optional[str] = Form(None)):
    category, confidence = suggest_category(description, filename)
    return {
        "category": category,
        "confidence": confidence,
        "icon": CATEGORIES.get(category, {}).get("icon", "📋")
    }

@app.post("/auth/signup")
async def signup(email: str = Form(...), password: str = Form(...)):
    try:
        user = fb_auth.create_user(email=email, password=password)
        return {
            "user_id": user.uid,
            "email": user.email,
            "message": "User created. Please login."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signup failed: {str(e)}")

@app.post("/auth/token", response_model=AuthResponse)
async def get_token(email: str = Form(...), password: str = Form(...)):
    try:
        user = fb_auth.get_user_by_email(email)
        custom_token = fb_auth.create_custom_token(user.uid)
        
        return AuthResponse(
            access_token=custom_token.decode('utf-8'),
            user_id=user.uid,
            email=user.email
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

def calculate_priority_score(
    category: str,
    verification_count: int,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    is_duplicate: bool = False
) -> float:
    base_score = 0.5
    
    if category in ["Safety", "Water"]:
        base_score += 0.2
    elif category in ["Pothole", "Streetlight"]:
        base_score += 0.1
    
    base_score += min(0.15, verification_count * 0.05)
    
    if is_duplicate:
        base_score += 0.15
    
    return min(1.0, max(0.0, base_score))

@app.post("/api/complaints", response_model=Complaint)
async def create_complaint(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category: str = Form(...),
    subcategory: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    pin_code: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    authorization: Optional[str] = Header(None),
):
    try:
        user_id = await verify_firebase_token(authorization)
    except HTTPException:
        user_id = "anonymous-" + str(uuid.uuid4())[:8]
    
    complaint_id = f"CMP-{datetime.now().year}-{uuid.uuid4().hex[:6].upper()}"
    
    sla_hours = CATEGORIES.get(category, {}).get("sla_hours", 72)
    sla_deadline = datetime.utcnow() + timedelta(hours=sla_hours)
    
    is_duplicate = False
    if latitude is not None and longitude is not None:
        try:
            similar_docs = db.collection("complaints").where(
                "category", "==", category
            ).stream()
            
            for doc in similar_docs:
                data = doc.to_dict()
                doc_lat = data.get("latitude")
                doc_long = data.get("longitude")
                if (doc_lat and doc_long and 
                    abs(doc_lat - latitude) < 0.001 and 
                    abs(doc_long - longitude) < 0.001):
                    is_duplicate = True
                    break
        except:
            is_duplicate = False
    elif address and city and pin_code:
        try:
            similar_docs = db.collection("complaints").where(
                "category", "==", category
            ).stream()
            
            for doc in similar_docs:
                data = doc.to_dict()
                if (data.get("address") == address and 
                    data.get("city") == city and 
                    data.get("pin_code") == pin_code):
                    is_duplicate = True
                    break
        except:
            is_duplicate = False
    
    priority_score = calculate_priority_score(category, 0, latitude, longitude, is_duplicate)
    
    complaint_data = {
        "complaint_id": complaint_id,
        "title": title,
        "description": description,
        "category": category,
        "subcategory": subcategory,
        "address": address,
        "city": city,
        "state": state,
        "pin_code": pin_code,
        "latitude": latitude,
        "longitude": longitude,
        "status": "submitted",
        "priority_score": priority_score,
        "created_at": datetime.utcnow().isoformat(),
        "sla_deadline": sla_deadline.isoformat(),
        "verification_count": 0,
        "photos": [],
        "user_id": user_id,
        "assignee": None,
    }
    
    db.collection("complaints").document(complaint_id).set(complaint_data)
    
    return Complaint(**complaint_data)

@app.get("/api/complaints/{complaint_id}", response_model=Complaint)
async def get_complaint(complaint_id: str):
    doc = db.collection("complaints").document(complaint_id).get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    data = doc.to_dict()
    return Complaint(**data)

@app.get("/api/complaints", response_model=List[Complaint])
async def list_complaints(
    category: Optional[str] = None,
    status: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius_km: float = 5.0,
):
    query = db.collection("complaints")
    
    if category:
        query = query.where("category", "==", category)
    
    if status:
        query = query.where("status", "==", status)
    
    docs = query.stream()
    complaints = []
    
    for doc in docs:
        data = doc.to_dict()
        
        if latitude and longitude:
            doc_lat = data.get("latitude")
            doc_long = data.get("longitude")
            if doc_lat and doc_long:
                dist = ((doc_lat - latitude) ** 2 + (doc_long - longitude) ** 2) ** 0.5
                if dist * 111 > radius_km:
                    continue
        
        complaints.append(data)
    
    complaints.sort(key=lambda x: x["priority_score"], reverse=True)
    
    return [Complaint(**c) for c in complaints[:50]]

@app.patch("/api/complaints/{complaint_id}", response_model=Complaint)
async def update_complaint(
    complaint_id: str,
    update: ComplaintUpdate,
    authorization: Optional[str] = Header(None),
):
    doc = db.collection("complaints").document(complaint_id).get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    db.collection("complaints").document(complaint_id).update({
        "status": update.status
    })
    
    updated_doc = db.collection("complaints").document(complaint_id).get()
    data = updated_doc.to_dict()
    
    return Complaint(**data)

@app.post("/api/complaints/{complaint_id}/verify")
async def verify_complaint(complaint_id: str, phone: str = Form(...)):
    doc = db.collection("complaints").document(complaint_id).get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    verification_ref = (
        db.collection("complaints")
        .document(complaint_id)
        .collection("verifications")
        .document(phone)
    )
    
    if not verification_ref.get().exists:
        verification_ref.set({"phone": phone, "timestamp": datetime.utcnow().isoformat()})
        
        db.collection("complaints").document(complaint_id).update({
            "verification_count": firestore.Increment(1)
        })
        
        complaint = db.collection("complaints").document(complaint_id).get().to_dict()
        new_priority = calculate_priority_score(
            complaint["category"],
            complaint["verification_count"] + 1,
            complaint["latitude"],
            complaint["longitude"]
        )
        db.collection("complaints").document(complaint_id).update({
            "priority_score": new_priority
        })
    
    updated = db.collection("complaints").document(complaint_id).get().to_dict()
    return {"verified": True, "verification_count": updated["verification_count"]}

@app.get("/api/stats")
async def get_stats(latitude: Optional[float] = None, longitude: Optional[float] = None):
    docs = db.collection("complaints").stream()
    complaints = [doc.to_dict() for doc in docs]
    
    resolved_count = sum(1 for c in complaints if c["status"] == "resolved")
    in_progress_count = sum(1 for c in complaints if c["status"] == "in_progress")
    total_count = len(complaints)
    
    return {
        "resolved_this_month": resolved_count,
        "in_progress": in_progress_count,
        "total_reported": total_count,
        "average_priority": sum(c["priority_score"] for c in complaints) / max(len(complaints), 1)
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "0.2.0", "firebase": "enabled"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

