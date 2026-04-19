import asyncio
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.complaints import router as complaints_router
from routes.stats import router as stats_router
from routes.uploads import router as uploads_router
from routes.leaderboard import router as leaderboard_router
from routes.users import router as users_router
from routes.ai import router as ai_router
from routes.workers import router as workers_router
import threading
from cron_job import setup_cron

app = FastAPI(title="CivicPulse Delhi Backend", version="1.0.0")

# Keep-Alive Background Task for Render Free Tier
async def keep_alive():
    """Pings the server every 5 minutes to prevent Render from sleeping."""
    url = "https://smart-public-service-crm-ps-crm.onrender.com/health"
    await asyncio.sleep(60)  # Wait for startup
    async with httpx.AsyncClient() as client:
        while True:
            try:
                await client.get(url)
            except Exception:
                pass
            await asyncio.sleep(300) # 5 minutes

@app.on_event("startup")
async def startup_event():
    # Start the Render keep-alive task
    asyncio.create_task(keep_alive())
    
    # Start the Appwrite cron job in a separate thread
    cron_thread = threading.Thread(target=setup_cron, daemon=True)
    cron_thread.start()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:3000",
        "https://smart-public-service-crm-ps-crm.onrender.com",
        "https://smart-public-service-crm-ps-crm.vercel.app",
        "https://civicpulse-crm.vercel.app",
        "https://civicpulse-crm.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints_router)
app.include_router(stats_router)
app.include_router(uploads_router)
app.include_router(leaderboard_router)
app.include_router(users_router)
app.include_router(ai_router)
app.include_router(workers_router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
