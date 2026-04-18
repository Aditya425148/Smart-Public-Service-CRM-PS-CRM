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

# ── Delhi Zone Config & Manager Config ─────────────────────────────

DELHI_ZONE_CONFIG = [
    {
        "id": "south",
        "name": "South Delhi",
        "keywords": ["south delhi", "saket", "gk", "greater kailash", "hauz khas",
                     "vasant vihar", "malviya nagar", "defence colony", "mehrauli",
                     "chhatarpur", "qutub"],
    },
    {
        "id": "central_new",
        "name": "Central & New Delhi",
        "keywords": ["central delhi", "new delhi", "connaught place", "cp",
                     "karol bagh", "daryaganj", "civil lines", "paharganj",
                     "india gate", "rajpath", "chandni chowk"],
    },
    {
        "id": "east_shahdara",
        "name": "East Delhi & Shahdara",
        "keywords": ["east delhi", "shahdara", "laxmi nagar", "preet vihar",
                     "mayur vihar", "gandhi nagar", "anand vihar", "vivek vihar",
                     "dilshad garden", "seelampur"],
    },
    {
        "id": "west",
        "name": "West Delhi",
        "keywords": ["west delhi", "rajouri garden", "punjabi bagh", "janakpuri",
                     "patel nagar", "tilak nagar", "vikaspuri", "dwarka",
                     "uttam nagar", "najafgarh"],
    },
    {
        "id": "north_nw",
        "name": "North & North-West Delhi",
        "keywords": ["north delhi", "north west delhi", "north-west delhi",
                     "rohini", "model town", "narela", "delhi university",
                     "du campus", "burari", "pitampura", "azadpur", "timarpur"],
    },
]

# 10 managers — 2 per zone (zone-based IDs)
MOCK_MANAGERS = [
    # South Delhi
    {"id": "MGR-DEL-S01", "name": "Sanjay Sharma",  "state": "Delhi", "zone": "south"},
    {"id": "MGR-DEL-S02", "name": "Kavita Mehra",   "state": "Delhi", "zone": "south"},
    # Central & New Delhi
    {"id": "MGR-DEL-C01", "name": "Meena Kumari",   "state": "Delhi", "zone": "central_new"},
    {"id": "MGR-DEL-C02", "name": "Vikram Khanna",  "state": "Delhi", "zone": "central_new"},
    # East Delhi & Shahdara
    {"id": "MGR-DEL-E01", "name": "Rajesh Tyagi",   "state": "Delhi", "zone": "east_shahdara"},
    {"id": "MGR-DEL-E02", "name": "Pooja Verma",    "state": "Delhi", "zone": "east_shahdara"},
    # West Delhi
    {"id": "MGR-DEL-W01", "name": "Anita Singh",    "state": "Delhi", "zone": "west"},
    {"id": "MGR-DEL-W02", "name": "Rakesh Gupta",   "state": "Delhi", "zone": "west"},
    # North & North-West Delhi
    {"id": "MGR-DEL-N01", "name": "Amit Goel",      "state": "Delhi", "zone": "north_nw"},
    {"id": "MGR-DEL-N02", "name": "Sunita Devi",    "state": "Delhi", "zone": "north_nw"},
]


def detect_zone_from_complaint(address: str = "", coordinates: dict = None) -> str:
    """Detects which Delhi zone a complaint belongs to based on address keywords or GPS coords."""
    if address:
        lower = address.lower()
        for zone in DELHI_ZONE_CONFIG:
            if any(kw in lower for kw in zone["keywords"]):
                return zone["id"]

    if coordinates and isinstance(coordinates, dict):
        lat = coordinates.get("lat") or coordinates.get("latitude")
        lng = coordinates.get("lng") or coordinates.get("longitude")
        if lat is not None and lng is not None:
            lat, lng = float(lat), float(lng)
            # 2D bounding boxes for each zone (order matters — check specific zones before default)
            # North & NW: upper part of Delhi
            if lat >= 28.72:
                return "north_nw"
            # South: lower part of Delhi
            if lat <= 28.56:
                return "south"
            # East & Shahdara: east side, but only beyond Yamuna river (~77.28 lng)
            if lng >= 77.28:
                return "east_shahdara"
            # West: west side of Delhi
            if lng <= 77.08:
                return "west"
            # Central & New Delhi: everything else in the middle band
            # (lat 28.56–28.72, lng 77.08–77.28)

    return "central_new"  # default zone


def assign_manager_to_complaint(complaint_state: str, address: str = "", coordinates: dict = None) -> dict:
    """Assigns the least-loaded manager from the correct zone for the given complaint."""
    # 1. Get managers for this state
    state_managers = [m for m in MOCK_MANAGERS if m["state"].lower() == complaint_state.lower()]

    if not state_managers:
        return {"id": "SYSTEM", "name": "SystemAdmin"}

    # 2. Detect zone and filter managers by zone
    zone_id = detect_zone_from_complaint(address, coordinates)
    zone_managers = [m for m in state_managers if m.get("zone") == zone_id]

    # Fallback to all state managers if no zone match
    if not zone_managers:
        zone_managers = state_managers

    # 3. Count active (non-resolved) complaints per manager
    manager_workloads = []
    for mgr in zone_managers:
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

    # 4. Pick the manager with the fewest active complaints
    best_manager = min(manager_workloads, key=lambda x: x[1])[0]
    return best_manager


# ── Business Logic ─────────────────────────────────────────────────────────────

# Maps known Nominatim ISO codes and city names to the state names used in MOCK_MANAGERS
_STATE_ALIASES: dict[str, str] = {
    # Delhi / NCT
    "IN-DL": "Delhi", "nct of delhi": "Delhi", "delhi": "Delhi",
    "new delhi": "Delhi",
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
    assignedTo: Optional[str] = None
    photoUrl: Optional[str] = None


class AssignManager(BaseModel):
    managerId: str
    managerName: Optional[str] = ""


class ShareCardUpdate(BaseModel):
    photoUrl: str


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
            # Look up the actual manager by name
            found_mgr = next((m for m in MOCK_MANAGERS if m["name"] == body.assignedManagerName), None)
            if found_mgr:
                assigned_manager = found_mgr
            else:
                assigned_manager = {"id": f"MGR-{body.assignedManagerState[:3].upper()}", "name": body.assignedManagerName}
        else:
            # Assign manager based on location (least-loaded manager for this zone)
            coords_dict = body.coordinates if body.coordinates else None
            assigned_manager = assign_manager_to_complaint(state, body.address or "", coords_dict)

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
        
        # Build update payload - include assignedTo if provided
        update_payload = {
            "status": body.status,
            "timeline": json.dumps(timeline),
            "updatedAt": datetime.now(UTC).isoformat(),
        }
        
        if body.assignedTo:
            update_payload["assignedTo"] = body.assignedTo
        
        if body.photoUrl:
            update_payload["photoUrl"] = body.photoUrl
        
        databases.update_document(DATABASE_ID, COLLECTION_ID, complaint_id, update_payload)
        updated = databases.get_document(DATABASE_ID, COLLECTION_ID, complaint_id)
        return _map_doc(updated)
    except HTTPException:
        raise
    except Exception as e:
        print(f"STATUS_UPDATE_ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{complaint_id}/share-card")
async def update_share_card(complaint_id: str, body: ShareCardUpdate):
    try:
        if not body.photoUrl:
            raise HTTPException(status_code=400, detail="photoUrl is required")

        databases.update_document(DATABASE_ID, COLLECTION_ID, complaint_id, {
            "photoUrl": body.photoUrl,
            "updatedAt": datetime.now(UTC).isoformat(),
        })
        updated = databases.get_document(DATABASE_ID, COLLECTION_ID, complaint_id)
        return _map_doc(updated)
    except HTTPException:
        raise
    except Exception as e:
        print(f"SHARE_CARD_UPDATE_ERROR: {str(e)}")
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


