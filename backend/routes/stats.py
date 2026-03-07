from fastapi import APIRouter

router = APIRouter(prefix="/api/stats", tags=["stats"])

WARD_STATS = [
    {"ward": "Ward 7", "resolutionRate": 94, "totalComplaints": 125, "resolvedComplaints": 118, "activeComplaints": 7,  "avgResolveTime": 28, "rank": 1, "trend": 5},
    {"ward": "Ward 4", "resolutionRate": 88, "totalComplaints": 98,  "resolvedComplaints": 86,  "activeComplaints": 12, "avgResolveTime": 34, "rank": 2, "trend": 12},
    {"ward": "Ward 1", "resolutionRate": 82, "totalComplaints": 84,  "resolvedComplaints": 69,  "activeComplaints": 15, "avgResolveTime": 42, "rank": 3, "trend": -2},
    {"ward": "Ward 3", "resolutionRate": 79, "totalComplaints": 110, "resolvedComplaints": 87,  "activeComplaints": 23, "avgResolveTime": 39, "rank": 4, "trend": 3},
    {"ward": "Ward 8", "resolutionRate": 74, "totalComplaints": 65,  "resolvedComplaints": 48,  "activeComplaints": 17, "avgResolveTime": 55, "rank": 5, "trend": -8},
    {"ward": "Ward 2", "resolutionRate": 71, "totalComplaints": 140, "resolvedComplaints": 100, "activeComplaints": 40, "avgResolveTime": 48, "rank": 6, "trend": 0},
]


@router.get("/wards")
async def ward_statistics():
    return WARD_STATS
