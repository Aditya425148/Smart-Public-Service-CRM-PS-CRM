from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.complaints import router as complaints_router
from routes.stats import router as stats_router
from routes.uploads import router as uploads_router
from routes.leaderboard import router as leaderboard_router

app = FastAPI(title="PS-CRM Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints_router)
app.include_router(stats_router)
app.include_router(uploads_router)
app.include_router(leaderboard_router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
