import json
from fastapi import APIRouter, Query as QParam
from appwrite.query import Query
from appwrite_client import databases, DATABASE_ID, COLLECTION_ID

router = APIRouter(prefix="/api/users", tags=["users"])


def calculate_tier(reputation: int) -> int:
    """Calculate user tier based on reputation points."""
    if reputation >= 400:
        return 2
    elif reputation >= 150:
        return 1
    else:
        return 0


@router.get("")
async def get_all_users():
    """Get all users with their stats aggregated from complaints."""
    try:
        resp = databases.list_documents(DATABASE_ID, COLLECTION_ID, queries=[Query.limit(500)])
        docs = resp["documents"]
    except Exception:
        return []

    user_stats: dict[str, dict] = {}
    user_flags: dict[str, bool] = {}
    
    for doc in docs:
        status = doc.get("status", "")
        ward = doc.get("ward") or doc.get("district") or "General"
        
        # Handle original reporter
        reporter_id = doc.get("reporterId") or doc.get("userId")
        if reporter_id:
            if reporter_id not in user_stats:
                user_stats[reporter_id] = {
                    "id": reporter_id,
                    "name": doc.get("reporterName") or "Citizen",
                    "email": doc.get("reporterEmail") or f"{reporter_id}@citizen.local",
                    "phone": doc.get("reporterPhone") or "N/A",
                    "reputation": 0,
                    "complaints": 0,
                    "resolved": 0,
                    "ward": ward,
                    "badges": 0,
                    "status": "Active",
                }
            
            # Add reputation points based on status
            points = {"Resolved": 50, "Verified": 20}.get(status, 10)
            user_stats[reporter_id]["reputation"] += points
            user_stats[reporter_id]["complaints"] += 1
            if status == "Resolved":
                user_stats[reporter_id]["resolved"] += 1
            if status == "Resolved":
                user_stats[reporter_id]["badges"] = min(user_stats[reporter_id]["resolved"] // 5 + 1, 5)

        # Handle verification points
        timeline_raw = doc.get("timeline")
        if timeline_raw:
            try:
                timeline = json.loads(timeline_raw) if isinstance(timeline_raw, str) else timeline_raw
                if isinstance(timeline, list):
                    for event in timeline:
                        note_content = event.get("note", "")
                        if "Verified by user:" in note_content:
                            v_uid = note_content.split("Verified by user:")[1].strip()
                            if v_uid not in user_stats:
                                user_stats[v_uid] = {
                                    "id": v_uid,
                                    "name": "Citizen",
                                    "email": f"{v_uid}@citizen.local",
                                    "phone": "N/A",
                                    "reputation": 0,
                                    "complaints": 0,
                                    "resolved": 0,
                                    "ward": ward,
                                    "badges": 0,
                                    "status": "Active",
                                }
                            user_stats[v_uid]["reputation"] += 20
            except:
                pass

    # Calculate tiers and determine if flagged
    all_users = []
    for uid, stats in user_stats.items():
        stats["tier"] = calculate_tier(stats["reputation"])
        # Flag users with negative reputation
        stats["status"] = "Flagged" if stats["reputation"] < 0 else "Active"
        all_users.append(stats)

    # Sort by reputation descending
    return sorted(all_users, key=lambda x: x["reputation"], reverse=True)


@router.get("/{user_id}")
async def get_user(user_id: str):
    """Get details for a specific user."""
    try:
        resp = databases.list_documents(DATABASE_ID, COLLECTION_ID, queries=[Query.limit(500)])
        docs = resp["documents"]
    except Exception:
        return None

    user_stats: dict[str, dict] = {}
    
    for doc in docs:
        status = doc.get("status", "")
        ward = doc.get("ward") or doc.get("district") or "General"
        
        reporter_id = doc.get("reporterId") or doc.get("userId")
        if reporter_id == user_id:
            if reporter_id not in user_stats:
                user_stats[reporter_id] = {
                    "id": reporter_id,
                    "name": doc.get("reporterName") or "Citizen",
                    "email": doc.get("reporterEmail") or f"{reporter_id}@citizen.local",
                    "phone": doc.get("reporterPhone") or "N/A",
                    "reputation": 0,
                    "complaints": 0,
                    "resolved": 0,
                    "ward": ward,
                    "badges": 0,
                    "status": "Active",
                }
            
            points = {"Resolved": 50, "Verified": 20}.get(status, 10)
            user_stats[reporter_id]["reputation"] += points
            user_stats[reporter_id]["complaints"] += 1
            if status == "Resolved":
                user_stats[reporter_id]["resolved"] += 1

    if user_id not in user_stats:
        return None

    stats = user_stats[user_id]
    stats["tier"] = calculate_tier(stats["reputation"])
    stats["status"] = "Flagged" if stats["reputation"] < 0 else "Active"
    return stats
