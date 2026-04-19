from fastapi import APIRouter, HTTPException, Query as QParam
from appwrite.query import Query
from appwrite_client import databases, DATABASE_ID, WORKERS_COLLECTION_ID, COLLECTION_ID
from typing import Optional, List

router = APIRouter(prefix="/api/workers", tags=["workers"])

def _map_worker(doc: dict) -> dict:
    internal = {"$id", "$collectionId", "$databaseId", "$createdAt", "$updatedAt", "$permissions"}
    out = {k: v for k, v in doc.items() if k not in internal}
    out["id"] = doc["$id"]
    return out

@router.get("")
async def list_workers(state: Optional[str] = None):
    try:
        queries = [Query.limit(100)]
        if state:
            queries.append(Query.equal("state", state))
        
        resp = databases.list_documents(DATABASE_ID, WORKERS_COLLECTION_ID, queries=queries)
        workers = [_map_worker(d) for d in resp["documents"]]
        
        # Add current workload count for each worker
        for worker in workers:
            try:
                # Count active complaints assigned to this worker
                # In complaints collection, 'assignedTo' stores the worker name (based on existing logic)
                # It would be better to store workerId, but let's stick to existing code for compatibility
                workload_resp = databases.list_documents(
                    DATABASE_ID, COLLECTION_ID,
                    queries=[
                        Query.equal("assignedTo", worker["name"]),
                        Query.not_equal("status", "Resolved"),
                        Query.not_equal("status", "Closed"),
                        Query.limit(1)
                    ]
                )
                worker["activeTasks"] = workload_resp.get("total", 0)
            except Exception:
                worker["activeTasks"] = 0
                
        return workers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
