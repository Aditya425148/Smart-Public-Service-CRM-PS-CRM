from fastapi import APIRouter, Query as QParam
from appwrite.query import Query
from appwrite_client import databases, DATABASE_ID, COLLECTION_ID
import json

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])

POINTS = {"Resolved": 50, "Verified": 20}


def _score(status: str) -> int:
    return POINTS.get(status, 10)


@router.get("")
async def leaderboard(tab: str = QParam(default="National")):
    """
    Returns ranked list of citizens by impact score.
    tab = "National" | "District" | "Local"
    (District / Local filtering requires lat-lng — for now returns all and
    frontend filters by the data it has. Full geo-filter can be added later.)
    """
    try:
        resp = databases.list_documents(
            DATABASE_ID, COLLECTION_ID,
            queries=[Query.limit(500)]
        )
        docs = resp["documents"]
    except Exception as e:
        return []

    user_stats: dict[str, dict] = {}

    for doc in docs:
        uid = doc.get("reporterId") or doc.get("userId")
        if not uid:
            continue

        status = doc.get("status", "")
        district = doc.get("district") or doc.get("ward") or "General"

        if uid not in user_stats:
            user_stats[uid] = {
                "uid": uid,
                "name": doc.get("reporterName") or "Citizen",
                "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={uid}",
                "impact": 0,
                "resolved": 0,
                "district": district,
            }

        user_stats[uid]["impact"] += _score(status)
        if status == "Resolved":
            user_stats[uid]["resolved"] += 1

    ranked = sorted(user_stats.values(), key=lambda x: x["impact"], reverse=True)[:10]
    return ranked


@router.get("/summary")
async def leaderboard_summary():
    """Global stats: total resolved, active citizens."""
    try:
        resp = databases.list_documents(
            DATABASE_ID, COLLECTION_ID,
            queries=[Query.limit(500)]
        )
        docs = resp["documents"]
        resolved = sum(1 for d in docs if d.get("status") == "Resolved")
        active_citizens = len({d.get("reporterId") or d.get("userId") for d in docs if d.get("reporterId") or d.get("userId")})
        return {"totalResolved": resolved, "activeCitizens": active_citizens}
    except Exception as e:
        return {"totalResolved": 0, "activeCitizens": 0}
