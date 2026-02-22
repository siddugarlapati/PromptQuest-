from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import worlds, playground, gamification, ollama, analytics

app = FastAPI(
    title="PromptQuest Ultimate API",
    description="Gamified AI Learning Platform — Anurag University | v2.0",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core routes
app.include_router(worlds.router, prefix="/api/worlds", tags=["Worlds"])
app.include_router(playground.router, prefix="/api/playground", tags=["Playground"])
app.include_router(gamification.router, prefix="/api/gamification", tags=["Gamification"])

# New routes
app.include_router(ollama.router, prefix="/api/ollama", tags=["Ollama / Real AI"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])


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
