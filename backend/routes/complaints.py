import json
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from appwrite.query import Query
from appwrite_client import databases, DATABASE_ID, COLLECTION_ID

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

# ── Business Logic ─────────────────────────────────────────────────────────────

# SLA hours per category (how fast the government must respond)
SLA_HOURS: dict[str, int] = {
    "Safety":       12,
    "Water":        24,
    "Garbage":      48,
    "Sanitation":   48,
    "Streetlight":  72,
    "Pothole":      96,
    "Construction": 120,
    "Other":        72,
}

# Base priority boost per category (0–0.3 additional weight)
CATEGORY_PRIORITY: dict[str, float] = {
    "Safety":       0.3,
    "Water":        0.25,
    "Sanitation":   0.15,
    "Pothole":      0.1,
    "Streetlight":  0.1,
    "Garbage":      0.05,
    "Construction": 0.05,
    "Other":        0.0,
}


def get_sla_hours(category: str) -> int:
    return SLA_HOURS.get(category, 72)


def calculate_priority(category: str, verification_count: int = 0) -> float:
    """
    Priority score 0–1.
      - Base: 0.5
      - Category urgency: up to +0.3
      - Verifications: +0.05 per verification (capped at +0.15)
    """
    score = 0.5
    score += CATEGORY_PRIORITY.get(category, 0.0)
    score += min(0.15, verification_count * 0.05)
    return round(min(1.0, score), 3)


def _map_doc(doc: dict) -> dict:
    """Strip Appwrite internal fields and normalise id."""
    internal = {"$id", "$collectionId", "$databaseId", "$createdAt", "$updatedAt", "$permissions"}
    out = {k: v for k, v in doc.items() if k not in internal}
    out["id"] = doc["$id"]
    # Parse JSON-stringified fields
    for field in ("timeline", "coordinates", "location", "photos"):
        if isinstance(out.get(field), str):
            try:
                out[field] = json.loads(out[field])
            except Exception:
                pass
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
    priorityScore: Optional[float] = 0.5
    slaHours: Optional[int] = 72


class StatusUpdate(BaseModel):
    status: str
    note: Optional[str] = ""
    actor: Optional[str] = "System"


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("")
async def list_complaints():
    try:
        resp = databases.list_documents(
            DATABASE_ID, COLLECTION_ID,
            queries=[Query.order_desc("createdAt"), Query.limit(100)]
        )
        return [_map_doc(d) for d in resp["documents"]]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", status_code=201)
async def create_complaint(body: ComplaintCreate):
    try:
        now = datetime.utcnow().isoformat()
        sla_hours = get_sla_hours(body.category)
        sla_deadline = (datetime.utcnow() + timedelta(hours=sla_hours)).isoformat()
        priority = calculate_priority(body.category)

        timeline = json.dumps([{
            "status": "Submitted",
            "timestamp": now,
            "note": "Complaint submitted successfully",
            "actor": "Citizen",
        }])
        payload = {
            **body.model_dump(),
            "status": "Submitted",
            "createdAt": now,
            "updatedAt": now,
            "timeline": timeline,
            "priorityScore": priority,
            "slaHours": sla_hours,
            "slaDeadline": sla_deadline,
            "coordinates": json.dumps(body.coordinates) if body.coordinates else None,
            "photos": json.dumps(body.photos) if body.photos else "[]",
        }
        doc = databases.create_document(DATABASE_ID, COLLECTION_ID, "unique()", payload)
        return {"id": doc["$id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}")
async def complaints_by_user(user_id: str):
    try:
        r1 = databases.list_documents(DATABASE_ID, COLLECTION_ID,
            queries=[Query.equal("reporterId", user_id), Query.order_desc("createdAt"), Query.limit(100)])
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
    except Exception as e:
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
            "timestamp": datetime.utcnow().isoformat(),
            "note": body.note,
            "actor": body.actor,
        })
        databases.update_document(DATABASE_ID, COLLECTION_ID, complaint_id, {
            "status": body.status,
            "timeline": json.dumps(timeline),
            "updatedAt": datetime.utcnow().isoformat(),
        })
        updated = databases.get_document(DATABASE_ID, COLLECTION_ID, complaint_id)
        return _map_doc(updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
