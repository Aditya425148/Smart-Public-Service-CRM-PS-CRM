from fastapi import APIRouter, Query as QParam
from appwrite.query import Query
from appwrite_client import tablesDB, DATABASE_ID, COLLECTION_ID

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])

POINTS = {"Resolved": 50, "Verified": 20}


def _score(status: str) -> int:
    return POINTS.get(status, 10)


@router.get("")
async def leaderboard(tab: str = QParam(default="National")):
    try:
        resp = tablesDB.list_rows(DATABASE_ID, COLLECTION_ID, queries=[Query.limit(500)])
        docs = resp["rows"]
    except Exception:
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

    return sorted(user_stats.values(), key=lambda x: x["impact"], reverse=True)[:10]


@router.get("/summary")
async def leaderboard_summary():
    try:
        resp = tablesDB.list_rows(DATABASE_ID, COLLECTION_ID, queries=[Query.limit(500)])
        docs = resp["rows"]
        resolved = sum(1 for d in docs if d.get("status") == "Resolved")
        active_citizens = len({d.get("reporterId") or d.get("userId") for d in docs if d.get("reporterId") or d.get("userId")})
        return {"totalResolved": resolved, "activeCitizens": active_citizens}
    except Exception:
        return {"totalResolved": 0, "activeCitizens": 0}
