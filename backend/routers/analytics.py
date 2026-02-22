from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database.db import get_db
from database.models import User, Mistake, PromptHistory
from routers.gamification import get_current_user

router = APIRouter()

class MistakeRecord(BaseModel):
    topic: str
    question_id: Optional[str] = None

class PromptHistoryRecord(BaseModel):
    prompt: str
    score: int
    grade: str
    grade_label: str

@router.post("/mistake")
async def record_mistake(record: MistakeRecord, db: AsyncSession = Depends(get_db)):
    """Record a mistake for a topic."""
    user = await get_current_user(db)
    topic = record.topic.lower().strip()
    
    result = await db.execute(select(Mistake).where(Mistake.user_id == user.id, Mistake.topic == topic))
    mistake = result.scalar_one_or_none()
    
    if mistake:
        mistake.count += 1
    else:
        mistake = Mistake(user_id=user.id, topic=topic, count=1)
        db.add(mistake)
        
    await db.commit()
    await db.refresh(mistake)
    
    return {
        "topic": topic,
        "total_mistakes": mistake.count,
        "message": f"Mistake recorded in {topic}."
    }

@router.get("/summary")
async def get_summary(db: AsyncSession = Depends(get_db)):
    """Return mistake counts per topic."""
    user = await get_current_user(db)
    result = await db.execute(select(Mistake).where(Mistake.user_id == user.id))
    mistakes = result.scalars().all()
    
    mistake_dict = {m.topic: m.count for m in mistakes}
    total_mistakes = sum(mistake_dict.values())
    weakest_topic = max(mistake_dict, key=mistake_dict.get) if mistake_dict else None
    
    return {
        "mistakes": mistake_dict,
        "total_mistakes": total_mistakes,
        "weakest_topic": weakest_topic,
        "suggestions": _generate_suggestions(mistake_dict)
    }

@router.post("/prompt-history")
async def save_prompt_history(record: PromptHistoryRecord, db: AsyncSession = Depends(get_db)):
    """Save a prompt score to history."""
    user = await get_current_user(db)
    
    entry = PromptHistory(
        user_id=user.id,
        prompt_text=record.prompt[:200],
        score=record.score,
        grade=record.grade,
        grade_label=record.grade_label
    )
    db.add(entry)
    await db.commit()
    
    return {"saved": True, "message": "Prompt saved to history."}

@router.get("/prompt-history")
async def get_prompt_history(db: AsyncSession = Depends(get_db)):
    """Return all saved prompt scores."""
    user = await get_current_user(db)
    result = await db.execute(select(PromptHistory).where(PromptHistory.user_id == user.id).order_by(PromptHistory.id))
    history = result.scalars().all()
    
    if not history:
        return {"history": [], "stats": None}

    scores = [h.score for h in history]
    history_list = []
    for i, h in enumerate(history):
        history_list.append({
            "prompt": h.prompt_text,
            "score": h.score,
            "grade": h.grade,
            "grade_label": h.grade_label,
            "timestamp": h.created_at.isoformat() if h.created_at else None,
            "index": i + 1
        })
        
    trend = "steady"
    if len(scores) >= 3:
        if scores[-1] > scores[-3]: trend = "improving"
        elif scores[-1] < scores[-3]: trend = "declining"

    return {
        "history": history_list,
        "stats": {
            "count": len(scores),
            "best": max(scores),
            "worst": min(scores),
            "average": round(sum(scores) / len(scores), 1),
            "trend": trend,
            "chart_data": [{"x": i+1, "y": s, "grade": g} for i, (s, g) in enumerate(zip(scores, [h.grade for h in history]))]
        }
    }

@router.delete("/reset")
async def reset_analytics(db: AsyncSession = Depends(get_db)):
    """Reset all analytics (for testing)."""
    user = await get_current_user(db)
    
    # Delete mistakes
    mistakes = await db.execute(select(Mistake).where(Mistake.user_id == user.id))
    for m in mistakes.scalars().all():
        await db.delete(m)
        
    # Delete prompt history
    prompts = await db.execute(select(PromptHistory).where(PromptHistory.user_id == user.id))
    for p in prompts.scalars().all():
        await db.delete(p)
        
    await db.commit()
    return {"reset": True}

def _generate_suggestions(mistakes_dict: dict) -> list:
    suggestions = []
    topic_map = {
        "tokenization": "Practice World 3 — Tokenization Lab",
        "prediction": "Try World 2 — Prediction Engine again",
        "pattern": "Revisit World 1 — Pattern Intelligence",
        "prompt": "Head to World 8 or the Prompt Engineering Dashboard",
        "hallucination": "Practice World 9 — Hallucination Detective",
        "transformers": "Learn about self-attention in World 4",
        "attention": "Focus on semantic weight in World 5",
        "embeddings": "Check out Word Maps in World 6",
        "context": "Understand context limits in World 7",
        "training": "Experiment with mini-training in World 10"
    }
    for topic, count in sorted(mistakes_dict.items(), key=lambda x: x[1], reverse=True)[:3]:
        if count > 0 and topic in topic_map:
            suggestions.append({"topic": topic, "mistakes": count, "action": topic_map[topic]})
    return suggestions
