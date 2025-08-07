from dotenv import load_dotenv
load_dotenv()  # ✅ Load environment variables from .env file

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import query, chat, whisper  # ✅ Make sure all these exist in /routers

# 🚀 Create the FastAPI app
app = FastAPI(
    title="ClauseMind AI – Insurance Clause Matcher",
    description="Query + PDF-based insurance clause search using FastAPI",
    version="1.0.0"
)

# ✅ Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace * with allowed domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include all routers
app.include_router(query.router)
app.include_router(chat.router)
app.include_router(whisper.router)

# 🏠 Health check route
@app.get("/")
def root():
    return {"message": "✅ ClauseMind API is running!"}