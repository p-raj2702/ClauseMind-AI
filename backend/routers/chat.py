from fastapi import APIRouter
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import os
import openai  # swap to `groq` or `google.generativeai` for Gemini if needed

router = APIRouter(prefix="/api", tags=["Chat"])

# Set API Key
openai.api_key = os.getenv("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")  # Or replace with GROQ_API_KEY / GEMINI_API_KEY

# Define schema for messages
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]

# Expert instruction to LLM
RULES = """
You are an expert Insurance Advisor specializing in Indian health and life insurance. 
Provide accurate answers based on IRDAI guidelines, common exclusions, policy terms, waiting periods, pre-existing conditions, etc.
Do NOT give legal advice. Respond clearly and helpfully like a human advisor would.
"""

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        full_messages = [{"role": "system", "content": RULES}] + [msg.dict() for msg in request.messages]

        response = openai.ChatCompletion.create(
            model="gpt-4",  # or use "gpt-3.5-turbo" or swap with "groq-llama3" model
            messages=full_messages,
            temperature=0.4
        )

        reply = response['choices'][0]['message']['content']
        return JSONResponse(content={"reply": reply})

    except Exception as e:
        print("❌ LLM Error:", e)
        return JSONResponse(status_code=500, content={"reply": f"❌ Error: {str(e)}"})