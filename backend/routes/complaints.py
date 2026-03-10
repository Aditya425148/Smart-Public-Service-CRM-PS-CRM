import json
import math
from datetime import datetime, timedelta, UTC
from typing import Optional
from fastapi import APIRouter, HTTPException, Query as FastAPIQuery
from pydantic import BaseModel
from appwrite.query import Query
from appwrite_client import tablesDB, DATABASE_ID, COLLECTION_ID
from geopy.geocoders import Nominatim

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

# Geocoder for reverse-geocoding state from coordinates
geolocator = Nominatim(user_agent="smart_crm_ps_crm")

# ── Business Logic ─────────────────────────────────────────────────────────────

def get_state_from_coords(lat: float, lng: float) -> str:
    """Reverse geocodes coordinates to find the State."""
    try:
        location = geolocator.reverse((lat, lng), exactly_one=True, timeout=10)
        if location and "address" in location.raw:
            return location.raw["address"].get("state", "Unknown")
    except Exception:
        pass
    return "Unknown"

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates the circular distance between two points in km."""
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2)**2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon / 2)**2)
    c = 2 * math.asin(math.sqrt(a))
    return R * c


SLA_HOURS: dict[str, int] = {
    "Safety": 12, "Water": 24, "Garbage": 48, "Sanitation": 48,
    "Streetlight": 72, "Pothole": 96, "Construction": 120, "Other": 72,
}

CATEGORY_PRIORITY: dict[str, float] = {
    "Safety": 0.4, "Water": 0.3, "Sanitation": 0.25, "Pothole": 0.15,
    "Streetlight": 0.1, "Garbage": 0.05, "Construction": 0.20, "Other": 0.0,
}


def get_sla_hours(category: str) -> int:
    return SLA_HOURS.get(category, 72)


def calculate_priority(category: str, verification_count: int = 0) -> float:
    score = 0.5 + CATEGORY_PRIORITY.get(category, 0.0) + min(0.15, verification_count * 0.05)
    return round(min(1.0, score), 3)


def _map_doc(doc: dict) -> dict:
    internal = {"$id", "$collectionId", "$databaseId", "$createdAt", "$updatedAt", "$permissions"}
    out = {k: v for k, v in doc.items() if k not in internal}
    out["id"] = doc["$id"]
    for field in ("timeline", "coordinates", "location", "photos"):
        if isinstance(out.get(field), str):
            try:
                out[field] = json.loads(out[field])
            except Exception:
                pass
    
    # Extract verifiedBy from timeline notes as a virtual field
    verified_by = []
    timeline = out.get("timeline")
    if isinstance(timeline, list):
        for event in timeline:
            note_content = event.get("note", "")
            if "Verified by user:" in note_content:
                verifier_id = note_content.split("Verified by user:")[1].strip()
                verified_by.append(verifier_id)
    out["verifiedBy"] = list(set(verified_by))
        
    return out


# ── Models ────────────────────────────────────────────────────────────────────

class ComplaintCreate(BaseModel):
    category: str
    subcategory: Optional[str] = ""
    description: Optional[str] = ""
    address: Optional[str] = ""
    ward: Optional[str] = "General"
    coordinates: Optional[dict] = None
    photos: Optional[list] = []
    reporterName: Optional[str] = "Anonymous"
    reporterId: Optional[str] = "anon"


class StatusUpdate(BaseModel):
    status: str
    note: Optional[str] = ""
    actor: Optional[str] = "System"


class VerifyUpdate(BaseModel):
    confirmations: int
    status: str
    priorityScore: float
    note: str
    actor: str


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("")
async def list_complaints(
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius: Optional[float] = 5.0  # default 5km radius
):
    try:
        resp = tablesDB.list_rows(
            DATABASE_ID, COLLECTION_ID,
            queries=[Query.order_desc("createdAt"), Query.limit(100)]
        )
        
        complaints = [_map_doc(d) for d in resp["rows"]]
        
        # If lat/lng are provided, filter by distance
        if lat is not None and lng is not None:
            filtered = []
            for c in complaints:
                coords = c.get("coordinates")
                if coords and isinstance(coords, dict):
                    c_lat = coords.get("lat") or coords.get("latitude")
                    c_lng = coords.get("lng") or coords.get("longitude")
                    if c_lat is not None and c_lng is not None:
                        dist = haversine_distance(lat, lng, c_lat, c_lng)
                        if dist <= radius:
                            # Attach distance for frontend use
                            c["distance_km"] = round(dist, 2)
                            filtered.append(c)
            return filtered
            
        return complaints
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", status_code=201)
async def create_complaint(body: ComplaintCreate):
    try:
        now = datetime.now(UTC).isoformat()
        sla_hours = get_sla_hours(body.category)
        priority = calculate_priority(body.category)
        timeline = json.dumps([{
            "status": "Submitted", "timestamp": now,
            "note": "Complaint submitted successfully", "actor": "Citizen",
        }])
        payload = {
            **body.model_dump(),
            "status": "Submitted",
            "createdAt": now,
            "updatedAt": now,
            "timeline": timeline,
            "priorityScore": priority,
            "slaHours": sla_hours,
            "slaRemainingHours": sla_hours,
            "coordinates": json.dumps(body.coordinates) if body.coordinates else None,
            "photos": json.dumps(body.photos) if body.photos else "[]",
            "state": get_state_from_coords(body.coordinates["lat"], body.coordinates["lng"]) if body.coordinates else "Unknown"
        }
        doc = tablesDB.create_row(DATABASE_ID, COLLECTION_ID, "unique()", payload)
        return {"id": doc["$id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}")
async def complaints_by_user(user_id: str):
    try:
        r1 = tablesDB.list_rows(DATABASE_ID, COLLECTION_ID,
            queries=[Query.equal("reporterId", user_id), Query.order_desc("createdAt"), Query.limit(100)])
        r2 = tablesDB.list_rows(DATABASE_ID, COLLECTION_ID,
            queries=[Query.equal("userId", user_id), Query.order_desc("createdAt"), Query.limit(100)])
        all_docs = r1["rows"] + r2["rows"]
        seen, unique = set(), []
        for d in all_docs:
            if d["$id"] not in seen:
                seen.add(d["$id"])
                unique.append(_map_doc(d))
        return unique
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{complaint_id}")
async def get_complaint(complaint_id: str):
    try:
        doc = tablesDB.get_row(DATABASE_ID, COLLECTION_ID, complaint_id)
        return _map_doc(doc)
    except Exception:
        raise HTTPException(status_code=404, detail="Complaint not found")


@router.patch("/{complaint_id}/status")
async def update_status(complaint_id: str, body: StatusUpdate):
    try:
        doc = tablesDB.get_row(DATABASE_ID, COLLECTION_ID, complaint_id)
        timeline = doc.get("timeline", "[]")
        if isinstance(timeline, str):
            try:
                timeline = json.loads(timeline)
            except Exception:
                timeline = []
        timeline.append({
            "status": body.status,
            "timestamp": datetime.now(UTC).isoformat(),
            "note": body.note,
            "actor": body.actor,
        })
        tablesDB.update_row(DATABASE_ID, COLLECTION_ID, complaint_id, {
            "status": body.status,
            "timeline": json.dumps(timeline),
            "updatedAt": datetime.now(UTC).isoformat(),
        })
        updated = tablesDB.get_row(DATABASE_ID, COLLECTION_ID, complaint_id)
        return _map_doc(updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{complaint_id}/verify")
async def verify_complaint_endpoint(complaint_id: str, body: VerifyUpdate):
    try:
        doc = tablesDB.get_row(DATABASE_ID, COLLECTION_ID, complaint_id)
        
        # 1. Extract verifiedBy from timeline instead of missing attribute
        timeline_raw = doc.get("timeline", "[]") or "[]"
        if isinstance(timeline_raw, str):
            try:
                timeline = json.loads(timeline_raw)
            except:
                timeline = []
        else:
            timeline = timeline_raw
            
        if not isinstance(timeline, list):
            timeline = []

        # Find unique verifier IDs from timeline notes
        verified_by = []
        for event in timeline:
            note_content = event.get("note", "")
            if "Verified by user:" in note_content:
                verifier_id = note_content.split("Verified by user:")[1].strip()
                verified_by.append(verifier_id)

        # 2. Prevent double verification
        if body.actor in verified_by:
            return _map_doc(doc)
            
        timeline.append({
            "status": body.status,
            "timestamp": datetime.now(UTC).isoformat(),
            "note": f"{body.note} | Verified by user: {body.actor}",
            "actor": "Citizen Verification",
        })
        
        # 3. Perform Update
        update_payload = {
            "status": body.status,
            "priorityScore": body.priorityScore,
            "timeline": json.dumps(timeline),
            "updatedAt": datetime.now(UTC).isoformat(),
        }
        
        # Check if confirmations attribute exists in the collection or if it's named differently
        # If it doesn't exist, we can't update it directly.
        # Let's try to update without 'confirmations' first and see if that works
        # or if the user meant a different attribute name.
        
        try:
             # Try with status and timeline first as they are verified to exist
             tablesDB.update_row(DATABASE_ID, COLLECTION_ID, complaint_id, update_payload)
        except Exception as update_err:
             print(f"Update failed: {str(update_err)}")
             # Final fallback: just the basic status/timeline which are guaranteed to exist
             basic_payload = {
                 "status": body.status,
                 "timeline": json.dumps(timeline),
                 "updatedAt": datetime.now(UTC).isoformat(),
             }
             tablesDB.update_row(DATABASE_ID, COLLECTION_ID, complaint_id, basic_payload)
        
        updated = tablesDB.get_row(DATABASE_ID, COLLECTION_ID, complaint_id)
        return _map_doc(updated)
    except Exception as e:
        print(f"VERIFY_ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
