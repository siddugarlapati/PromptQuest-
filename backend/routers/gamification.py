from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database.db import get_db
from database.models import User, CompletedWorld

router = APIRouter()

LEVELS = [
    {"level": 1, "title": "Beginner", "min_xp": 0, "max_xp": 100, "color": "#6c757d"},
    {"level": 2, "title": "Explorer", "min_xp": 100, "max_xp": 250, "color": "#20c997"},
    {"level": 3, "title": "Learner", "min_xp": 250, "max_xp": 450, "color": "#0dcaf0"},
    {"level": 4, "title": "Thinker", "min_xp": 450, "max_xp": 700, "color": "#0d6efd"},
    {"level": 5, "title": "Intermediate", "min_xp": 700, "max_xp": 1000, "color": "#6610f2"},
    {"level": 6, "title": "Practitioner", "min_xp": 1000, "max_xp": 1400, "color": "#d63384"},
    {"level": 7, "title": "Analyst", "min_xp": 1400, "max_xp": 1900, "color": "#fd7e14"},
    {"level": 8, "title": "Advanced", "min_xp": 1900, "max_xp": 2500, "color": "#ffc107"},
    {"level": 9, "title": "Master", "min_xp": 2500, "max_xp": 3200, "color": "#dc3545"},
    {"level": 10, "title": "Expert", "min_xp": 3200, "max_xp": 9999, "color": "#D4A017"},
]

BADGES = [
    {"id": "ai_explorer", "name": "AI Explorer", "description": "Completed World 1", "icon": "🔍", "world": 1},
    {"id": "prediction_pro", "name": "Prediction Pro", "description": "Completed World 2", "icon": "📊", "world": 2},
    {"id": "token_master", "name": "Token Master", "description": "Completed World 3", "icon": "🔤", "world": 3},
    {"id": "prompt_master", "name": "Prompt Master", "description": "Completed World 4", "icon": "✍️", "world": 4},
    {"id": "truth_seeker", "name": "Truth Seeker", "description": "Completed World 5", "icon": "🕵️", "world": 5},
    {"id": "ai_trainer", "name": "AI Trainer", "description": "Completed World 6", "icon": "🏋️", "world": 6},
    {"id": "context_wizard", "name": "Context Wizard", "description": "Completed World 7", "icon": "🧠", "world": 7},
]

def compute_level(xp: int) -> dict:
    for lv in reversed(LEVELS):
        if xp >= lv["min_xp"]:
            next_lv = LEVELS[min(lv["level"], len(LEVELS) - 1)]
            progress = ((xp - lv["min_xp"]) / max(1, (next_lv["max_xp"] - lv["min_xp"]))) * 100
            return {
                **lv,
                "current_xp": xp,
                "next_level_xp": next_lv["max_xp"],
                "progress_percent": min(100, round(progress, 1))
            }
    return {**LEVELS[0], "current_xp": xp, "next_level_xp": 100, "progress_percent": 0}

async def get_current_user(db: AsyncSession):
    # Always fetch/create default user for now (id=1)
    result = await db.execute(select(User).where(User.id == 1))
    user = result.scalar_one_or_none()
    if not user:
        user = User(id=1, username="student", xp=0)
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user

@router.get("/levels")
async def get_levels():
    return LEVELS

@router.get("/badges")
async def get_badges():
    return BADGES

@router.get("/level/{xp}")
async def get_level_for_xp(xp: int):
    return compute_level(xp)

@router.get("/progress")
async def get_progress(db: AsyncSession = Depends(get_db)):
    """Get current XP and completed worlds."""
    user = await get_current_user(db)
    worlds_result = await db.execute(select(CompletedWorld).where(CompletedWorld.user_id == user.id))
    completed_worlds = [w.world_id for w in worlds_result.scalars().all()]
    
    return {
        "xp": user.xp,
        "completed_worlds": completed_worlds
    }

from routers.ws import trigger_leaderboard_update

@router.post("/xp")
async def add_xp(amount: int, db: AsyncSession = Depends(get_db)):
    """Add XP to the user."""
    user = await get_current_user(db)
    user.xp += amount
    await db.commit()
    await db.refresh(user)
    
    # Broadcast XP update to all connected WebSocket clients
    await trigger_leaderboard_update(user.id, user.username, user.xp)
    
    return {"message": f"Added {amount} XP", "total_xp": user.xp}

@router.post("/world")
async def complete_world(world_id: int, db: AsyncSession = Depends(get_db)):
    """Mark a world as completed."""
    user = await get_current_user(db)
    
    existing = await db.execute(
        select(CompletedWorld).where(CompletedWorld.user_id == user.id, CompletedWorld.world_id == world_id)
    )
    if existing.scalar_one_or_none():
        return {"message": "World already completed"}
        
    world = CompletedWorld(user_id=user.id, world_id=world_id)
    db.add(world)
    await db.commit()
    return {"message": f"World {world_id} completed"}
