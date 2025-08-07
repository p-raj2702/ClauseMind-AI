from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import openai
import os
import tempfile
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api", tags=["Whisper"])

openai.api_key = os.getenv("OPENAI_API_KEY")  # Add this in your .env file

@router.post("/whisper")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        audio_file = open(tmp_path, "rb")

        # You can also use `model="whisper-1"` if paid model is available
        transcript = openai.Audio.transcribe(
            model="whisper-1",
            file=audio_file,
            response_format="json"
        )
        os.remove(tmp_path)
        return {"transcript": transcript.get("text", "")}

    except Exception as e:
        print("❌ Whisper Error:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})