import json
import math
from datetime import datetime, timedelta, UTC
from typing import Optional
from fastapi import APIRouter, HTTPException, Query as FastAPIQuery
from pydantic import BaseModel
from appwrite.query import Query
from appwrite_client import databases, DATABASE_ID, COLLECTION_ID
from geopy.geocoders import Nominatim

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

# Geocoder for reverse-geocoding state from coordinates
geolocator = Nominatim(user_agent="smart_crm_ps_crm")

# ── Manager Config (mirrors frontend mockData.ts) ─────────────────────────────

MOCK_MANAGERS = [
    # Delhi (5 managers)
    {"id": "MGR-DEL-01", "name": "Sanjay Sharma",  "state": "Delhi"},
    {"id": "MGR-DEL-02", "name": "Meena Kumari",   "state": "Delhi"},
    {"id": "MGR-DEL-03", "name": "Rajesh Tyagi",   "state": "Delhi"},
    {"id": "MGR-DEL-04", "name": "Anita Singh",    "state": "Delhi"},
    {"id": "MGR-DEL-05", "name": "Amit Goel",      "state": "Delhi"},
    # Uttar Pradesh (10 managers)
    {"id": "MGR-UP-01",  "name": "Yash Pal",       "state": "Uttar Pradesh"},
    {"id": "MGR-UP-02",  "name": "Priti Yadav",    "state": "Uttar Pradesh"},
    {"id": "MGR-UP-03",  "name": "Manoj Mishra",   "state": "Uttar Pradesh"},
    {"id": "MGR-UP-04",  "name": "Renu Devi",      "state": "Uttar Pradesh"},
    {"id": "MGR-UP-05",  "name": "Suresh Chandra", "state": "Uttar Pradesh"},
    {"id": "MGR-UP-06",  "name": "Kiran Singh",    "state": "Uttar Pradesh"},
    {"id": "MGR-UP-07",  "name": "Deepak Rawat",   "state": "Uttar Pradesh"},
    {"id": "MGR-UP-08",  "name": "Alka Jha",       "state": "Uttar Pradesh"},
    {"id": "MGR-UP-09",  "name": "Vikrant Tomar",  "state": "Uttar Pradesh"},
    {"id": "MGR-UP-10",  "name": "Sudhir Maurya",  "state": "Uttar Pradesh"},
]


def assign_manager_to_complaint(complaint_state: str) -> dict:
    """Assigns the manager with the least active complaints for the given state."""
    # 1. Get managers for this state
    state_managers = [m for m in MOCK_MANAGERS if m["state"].lower() == complaint_state.lower()]

    if not state_managers:
        return {"id": "SYSTEM", "name": "SystemAdmin"}

    # 2. Count active (non-resolved) complaints per manager
    manager_workloads = []
    for mgr in state_managers:
        try:
            resp = databases.list_documents(
                DATABASE_ID, COLLECTION_ID,
                queries=[
                    Query.equal("assignedManagerId", mgr["id"]),
                    Query.not_equal("status", "Resolved"),
                    Query.not_equal("status", "Closed"),
                    Query.limit(1),  # we only need the total count
                ]
            )
            count = resp.get("total", 0)
        except Exception:
            count = 0
        manager_workloads.append((mgr, count))

    # 3. Pick the manager with the fewest active complaints
    best_manager = min(manager_workloads, key=lambda x: x[1])[0]
    return best_manager


# ── Business Logic ─────────────────────────────────────────────────────────────

# Maps known Nominatim ISO codes and city names to the state names used in MOCK_MANAGERS
_STATE_ALIASES: dict[str, str] = {
    # Delhi / NCT
    "IN-DL": "Delhi", "nct of delhi": "Delhi", "delhi": "Delhi",
    "new delhi": "Delhi",
    # Uttar Pradesh
    "IN-UP": "Uttar Pradesh", "uttar pradesh": "Uttar Pradesh",
    "lucknow": "Uttar Pradesh", "kanpur": "Uttar Pradesh",
    "noida": "Uttar Pradesh", "ghaziabad": "Uttar Pradesh",
    "agra": "Uttar Pradesh", "varanasi": "Uttar Pradesh",
    "meerut": "Uttar Pradesh", "prayagraj": "Uttar Pradesh",
    "allahabad": "Uttar Pradesh", "bareilly": "Uttar Pradesh",
    "gorakhpur": "Uttar Pradesh",
}

def _resolve_state_from_address(addr: dict) -> str:
    """Tries multiple Nominatim address fields to find a known state."""
    candidates = [
        addr.get("state", ""),
        addr.get("state_district", ""),
        addr.get("county", ""),
        addr.get("ISO3166-2-lvl4", ""),
        addr.get("city", ""),
        addr.get("town", ""),
        addr.get("village", ""),
    ]
    for val in candidates:
        if not val:
            continue
        key = val.strip().lower()
        if key in _STATE_ALIASES:
            return _STATE_ALIASES[key]
        # Check if any alias is a substring (e.g. "nct of delhi")
        for alias, state_name in _STATE_ALIASES.items():
            if alias in key or key in alias:
                return state_name
    return "Unknown"


def get_state_from_coords(lat: float, lng: float) -> str:
    """Reverse geocodes coordinates to find the State."""
    try:
        location = geolocator.reverse((lat, lng), exactly_one=True, timeout=10)
        if location and "address" in location.raw:
            return _resolve_state_from_address(location.raw["address"])
    except Exception:
        pass
    return "Unknown"


def get_state_from_address_text(address: str) -> str:
    """Extracts state from a free-text address string (used when no GPS coords)."""
    lower = address.lower()
    for alias, state_name in _STATE_ALIASES.items():
        if alias in lower:
            return state_name
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
    assignedManagerName: Optional[str] = None
    assignedManagerState: Optional[str] = None


class StatusUpdate(BaseModel):
    status: str
    note: Optional[str] = ""
    actor: Optional[str] = "System"


class AssignManager(BaseModel):
    managerId: str
    managerName: Optional[str] = ""


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("")
async def list_complaints(
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius: Optional[float] = 5.0,  # default 5km radius
    managerId: Optional[str] = None,
):
    try:
        queries = [Query.order_desc("createdAt"), Query.limit(100)]
        if managerId:
            queries.append(Query.equal("assignedManagerId", managerId))

        resp = databases.list_documents(DATABASE_ID, COLLECTION_ID, queries=queries)
        complaints = [_map_doc(d) for d in resp["documents"]]

        # If lat/lng are provided, further filter by distance
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
                            c["distance_km"] = round(dist, 2)
                            filtered.append(c)
            return filtered

        return complaints
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/managers")
async def get_managers():
    """Returns the list of all available managers."""
    return MOCK_MANAGERS


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

        # Resolve state from GPS coordinates, fallback to address text
        state = "Unknown"
        if body.coordinates:
            state = get_state_from_coords(body.coordinates["lat"], body.coordinates["lng"])
        if state == "Unknown" and body.address:
            state = get_state_from_address_text(body.address)
        
        # Use frontend-provided manager if available, otherwise auto-assign
        if body.assignedManagerName and body.assignedManagerState:
            # Use the manager specified by the frontend
            assigned_manager = {"id": f"MGR-{body.assignedManagerState[:3].upper()}", "name": body.assignedManagerName}
        else:
            # Assign manager based on location (least-loaded manager for this state)
            assigned_manager = assign_manager_to_complaint(state)

        # Create payload without assignedManagerName and assignedManagerState (Appwrite doesn't have these fields)
        payload_dict = body.model_dump()
        payload_dict.pop("assignedManagerName", None)
        payload_dict.pop("assignedManagerState", None)
        
        payload = {
            **payload_dict,
            "status": "Submitted",
            "createdAt": now,
            "updatedAt": now,
            "timeline": timeline,
            "priorityScore": float(priority),
            "slaHours": int(sla_hours),
            "slaRemainingHours": int(sla_hours),
            "coordinates": json.dumps(body.coordinates) if body.coordinates else None,
            "photos": json.dumps(body.photos) if body.photos else "[]",
            "state": state,
            "assignedManagerId": assigned_manager["id"],
            "assignedManagerName": assigned_manager["name"],
        }
        doc = databases.create_document(DATABASE_ID, COLLECTION_ID, "unique()", payload)
        return {"id": doc["$id"], "assignedManager": assigned_manager["name"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}")
async def complaints_by_user(user_id: str, email: Optional[str] = None):
    try:
        queries_1 = [Query.equal("reporterId", user_id), Query.order_desc("createdAt"), Query.limit(100)]
        r1 = databases.list_documents(DATABASE_ID, COLLECTION_ID, queries=queries_1)
        r2 = databases.list_documents(DATABASE_ID, COLLECTION_ID,
            queries=[Query.equal("userId", user_id), Query.order_desc("createdAt"), Query.limit(100)])
        all_docs = r1["documents"] + r2["documents"]
        
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
        doc = databases.get_document(DATABASE_ID, COLLECTION_ID, complaint_id)
        return _map_doc(doc)
    except Exception:
        raise HTTPException(status_code=404, detail="Complaint not found")


@router.patch("/{complaint_id}/status")
async def update_status(complaint_id: str, body: StatusUpdate):
    try:
        doc = databases.get_document(DATABASE_ID, COLLECTION_ID, complaint_id)
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
        databases.update_document(DATABASE_ID, COLLECTION_ID, complaint_id, {
            "status": body.status,
            "timeline": json.dumps(timeline),
            "updatedAt": datetime.now(UTC).isoformat(),
        })
        updated = databases.get_document(DATABASE_ID, COLLECTION_ID, complaint_id)
        return _map_doc(updated)
    except HTTPException:
        raise
    except Exception as e:
        print(f"STATUS_UPDATE_ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{complaint_id}/assign")
async def assign_manager(complaint_id: str, body: AssignManager):
    """Assign a complaint to a specific manager."""
    try:
        # Validate manager exists
        manager = next((m for m in MOCK_MANAGERS if m["id"] == body.managerId), None)
        if not manager:
            raise HTTPException(status_code=400, detail="Manager not found")
        
        doc = databases.get_document(DATABASE_ID, COLLECTION_ID, complaint_id)
        timeline = doc.get("timeline", "[]")
        if isinstance(timeline, str):
            try:
                timeline = json.loads(timeline)
            except Exception:
                timeline = []
        
        # Add assignment event to timeline
        timeline.append({
            "status": "Assigned",
            "timestamp": datetime.now(UTC).isoformat(),
            "note": f"Assigned to {manager['name']}",
            "actor": "Admin",
        })
        
        databases.update_document(DATABASE_ID, COLLECTION_ID, complaint_id, {
            "assignedManagerId": body.managerId,
            "assignedManagerName": manager["name"],
            "status": "Assigned",
            "timeline": json.dumps(timeline),
            "updatedAt": datetime.now(UTC).isoformat(),
        })
        
        updated = databases.get_document(DATABASE_ID, COLLECTION_ID, complaint_id)
        return _map_doc(updated)
    except HTTPException:
        raise
    except Exception as e:
        print(f"ASSIGN_ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


