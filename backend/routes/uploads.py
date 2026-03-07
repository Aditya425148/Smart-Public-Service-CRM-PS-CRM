import io
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from appwrite.id import ID
from appwrite_client import storage, BUCKET_ID

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

ALLOWED_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "video/mp4", "video/webm", "video/quicktime",
}


@router.post("")
async def upload_file(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    max_size = 10 * 1024 * 1024 if file.content_type.startswith("image/") else 60 * 1024 * 1024
    data = await file.read()
    if len(data) > max_size:
        raise HTTPException(status_code=413, detail="File too large")

    try:
        result = storage.create_file(
            BUCKET_ID,
            ID.unique(),
            io.BytesIO(data),
            [file.content_type],
        )
        file_id = result["$id"]
        url = f"{storage.client.config['endpoint']}/storage/buckets/{BUCKET_ID}/files/{file_id}/view?project={storage.client.config['project']}"
        return {"fileId": file_id, "url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{file_id}")
async def delete_file(file_id: str):
    try:
        storage.delete_file(BUCKET_ID, file_id)
        return {"deleted": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
