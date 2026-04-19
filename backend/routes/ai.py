import os
import httpx
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/ai", tags=["AI"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

class ChatRequest(BaseModel):
    message: str
    portal_type: str = "citizen" # citizen, manager, worker
    history: Optional[List[dict]] = []

class WorkerSummary(BaseModel):
    id: str
    name: str
    rating: float
    activeTasks: int
    area: Optional[str] = "Unknown"

class SmartAssignRequest(BaseModel):
    complaintId: str
    category: str
    description: str
    address: str
    workers: List[WorkerSummary]

SYSTEM_PROMPTS = {
    "citizen": """You are the CivicPulse Delhi AI Assistant. Your goal is to help citizens of Delhi report and track public service issues.
Language Support: You MUST support both English and Hindi. If a user speaks in Hindi or Hinglish, respond in a mix of Hindi and English (Hinglish) that is easy for a common citizen to understand.
Be helpful, professional, and concise. 
Key instructions for citizens:
1. To report an issue: Use the 'Report Issue' menu.
2. To track: Visit 'My Complaints'.
3. To share: Use 'Download Image' on the complaint detail page.
4. Civic Credits are earned for verified reports.
Use bold text (**text**) for important terms, buttons, or steps.""",
    
    "manager": """You are the CivicPulse Operational Support AI. You assist regional managers in overseeing public service resolution.
Language Support: Respond in professional English by default, but provide Hindi explanations if the manager asks in Hindi.
Your tone is professional and operation-focused.
Key capabilities for managers:
1. Worker Assignment: Select a complaint and click 'Assign Worker'.
2. SLA Tracking: Monitor the 'Area Overview' for red (overdue) or amber (approaching) alerts.
3. Jurisdictions: Use ward/zone filters to manage specific regions.
4. Performance: View 'My Workers' for resolution metrics.
Use clear Markdown formatting for steps and metrics.""",
    
    "worker": """You are the CivicPulse Field Assistant. You help field workers resolve assigned tasks efficiently.
LANGUAGE RULE: This is CRITICAL. Many field workers prefer Hindi or Hinglish. You MUST respond primarily in Hinglish (Hindi written in Roman script) or Hindi script if preferred, keeping technical terms in English. Use a helpful, "big brother" (Bada Bhai) guiding tone.
Key rules for workers:
1. Status Updates: Always update status to 'En Route' and then 'Resolved'.
2. GPS Lock: Resolution photos MUST be taken within 150m of recorded location.
3. Proof: Clear photos are required for resolution verification.
4. Priorities: Sort tasks by SLA urgency on your dashboard.
Use bold Markdown (**text**) for every step and instruction to make them stand out."""
}

@router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    system_content = SYSTEM_PROMPTS.get(request.portal_type, SYSTEM_PROMPTS["citizen"])
    
    messages = [
        {"role": "system", "content": system_content}
    ]
    
    # Add history if provided (limit to last 5 for brevity)
    if request.history:
        messages.extend(request.history[-5:])
    
    messages.append({"role": "user", "content": request.message})

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 512
                },
                timeout=20.0
            )
            response.raise_for_status()
            data = response.json()
            return {"reply": data["choices"][0]["message"]["content"]}
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Groq API Error: {e.response.text}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/smart-assign")
async def smart_assign(request: SmartAssignRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    prompt = f"""You are a Public Service Operations Expert. Your task is to assign the BEST field worker for a new complaint.
    
    Complaint Details:
    - ID: {request.complaintId}
    - Category: {request.category}
    - Description: {request.description}
    - Location: {request.address}
    
    Available Workers:
    """
    for w in request.workers:
        prompt += f"- ID: {w.id}, Name: {w.name}, Rating: {w.rating}, Active Tasks: {w.activeTasks}, Primary Area: {w.area}\n"
    
    prompt += """
    Guidelines for selection:
    1. **Expertise**: Match the complaint category to the worker's experience if implied.
    2. **Workload (CRITICAL)**: STRONGLY prioritize workers with fewer active tasks to ensure fast resolution and fairness. A worker with lower workload must be preferred even over a higher-rated worker if the gap in active tasks is more than 1.
    3. **Performance**: Consider higher ratings as a secondary factor.
    4. **Location**: Workers whose primary area matches the complaint location should be prioritized.
    
    Respond STRICTLY in JSON format with two keys:
    - "recommendedWorkerId": The ID of the best worker.
    - "reasoning": A brief (1-2 sentence) explanation of why this worker was chosen. DO NOT mention that you are an AI or using AI.
    """

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": "You are a logistics and operations expert. Your primary goal is fair and efficient workload distribution. Respond only in valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3,
                    "response_format": {"type": "json_object"}
                },
                timeout=20.0
            )
            response.raise_for_status()
            data = response.json()
            # Parse the JSON string from choices[0].message.content
            ai_data = json.loads(data["choices"][0]["message"]["content"])
            return ai_data
        except Exception as e:
            print(f"SMART_ASSIGN_ERROR: {str(e)}")
            # Fallback logic if AI fails: Simplistic load balancing
            if not request.workers:
                raise HTTPException(status_code=400, detail="No workers available for assignment")
            best_worker = min(request.workers, key=lambda w: (w.activeTasks, -w.rating))
            return {
                "recommendedWorkerId": best_worker.id,
                "reasoning": "Selected based on lowest workload and highest rating."
            }
