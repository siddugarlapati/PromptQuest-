from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from collections import defaultdict

router = APIRouter()

# In-memory stores (per-app-session)
_mistakes: defaultdict = defaultdict(int)  # topic -> count
_prompt_history: list = []  # list of {prompt, score, grade, timestamp}


class MistakeRecord(BaseModel):
    topic: str  # e.g. "tokenization", "prediction", "pattern", "prompt", "hallucination"
    question_id: Optional[str] = None


class PromptHistoryRecord(BaseModel):
    prompt: str
    score: int
    grade: str
    grade_label: str


@router.post("/mistake")
def record_mistake(record: MistakeRecord):
    """Record a mistake for a topic."""
    topic = record.topic.lower().strip()
    _mistakes[topic] += 1
    return {
        "topic": topic,
        "total_mistakes": _mistakes[topic],
        "message": f"Mistake recorded in {topic}."
    }


@router.get("/summary")
def get_summary():
    """Return mistake counts per topic."""
    return {
        "mistakes": dict(_mistakes),
        "total_mistakes": sum(_mistakes.values()),
        "weakest_topic": max(_mistakes, key=_mistakes.get) if _mistakes else None,
        "suggestions": _generate_suggestions()
    }


@router.post("/prompt-history")
def save_prompt_history(record: PromptHistoryRecord):
    """Save a prompt score to history."""
    entry = {
        "prompt": record.prompt[:200],  # truncate
        "score": record.score,
        "grade": record.grade,
        "grade_label": record.grade_label,
        "timestamp": datetime.now().isoformat(),
        "index": len(_prompt_history) + 1
    }
    _prompt_history.append(entry)

    # Compute trend
    trend = "improving" if _is_improving() else "declining" if _is_declining() else "steady"

    return {
        "saved": True,
        "entry": entry,
        "history_count": len(_prompt_history),
        "best_score": max(h["score"] for h in _prompt_history),
        "average_score": round(sum(h["score"] for h in _prompt_history) / len(_prompt_history), 1),
        "trend": trend
    }


@router.get("/prompt-history")
def get_prompt_history():
    """Return all saved prompt scores."""
    if not _prompt_history:
        return {"history": [], "stats": None}

    scores = [h["score"] for h in _prompt_history]
    return {
        "history": _prompt_history,
        "stats": {
            "count": len(_prompt_history),
            "best": max(scores),
            "worst": min(scores),
            "average": round(sum(scores) / len(scores), 1),
            "trend": "improving" if _is_improving() else "declining" if _is_declining() else "steady",
            "chart_data": [{"x": h["index"], "y": h["score"], "grade": h["grade"]} for h in _prompt_history]
        }
    }


@router.delete("/reset")
def reset_analytics():
    """Reset all analytics (for testing)."""
    global _mistakes, _prompt_history
    _mistakes = defaultdict(int)
    _prompt_history = []
    return {"reset": True}


def _is_improving() -> bool:
    if len(_prompt_history) < 3:
        return False
    recent = [h["score"] for h in _prompt_history[-3:]]
    return recent[-1] > recent[0]


def _is_declining() -> bool:
    if len(_prompt_history) < 3:
        return False
    recent = [h["score"] for h in _prompt_history[-3:]]
    return recent[-1] < recent[0]


def _generate_suggestions() -> list:
    suggestions = []
    topic_map = {
        "tokenization": "Practice World 3 — Tokenization Lab",
        "prediction": "Try World 2 — Prediction Engine again",
        "pattern": "Revisit World 1 — Pattern Intelligence",
        "prompt": "Head to World 4 or the Prompt Engineering Dashboard",
        "hallucination": "Practice World 5 — Hallucination Detective"
    }
    for topic, count in sorted(_mistakes.items(), key=lambda x: x[1], reverse=True)[:3]:
        if count > 0 and topic in topic_map:
            suggestions.append({"topic": topic, "mistakes": count, "action": topic_map[topic]})
    return suggestions
