from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import worlds, gamification, playground, ollama, analytics, rag, ws

app = FastAPI(title="PromptQuest Ultimate API", version="2.0.0")

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Existing routes
app.include_router(worlds.router, prefix="/api/worlds", tags=["Worlds"])
app.include_router(playground.router, prefix="/api/playground", tags=["Playground"])
app.include_router(gamification.router, prefix="/api/gamification", tags=["Gamification"])

# New routes
app.include_router(ollama.router, prefix="/api/ollama", tags=["Ollama / Real AI"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(rag.router, prefix="/api/rag", tags=["RAG Vector DB"])
app.include_router(ws.router, prefix="/ws", tags=["WebSockets"])

from database.db import engine, Base

@app.on_event("startup")
async def startup_event():
    # Initialize SQLite tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/")
async def root():
    return {
        "message": "Welcome to PromptQuest Ultimate API 🚀",
        "institution": "Anurag University",
        "version": "2.0.0",
        "worlds": 6,
        "features": ["simulation", "ollama", "analytics", "gamification"],
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}
