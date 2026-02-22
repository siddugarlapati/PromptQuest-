from fastapi import APIRouter

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
    {
        "id": "ai_explorer",
        "name": "AI Explorer",
        "description": "Completed World 1: AI Basics",
        "icon": "🔍",
        "world": 1
    },
    {
        "id": "prediction_pro",
        "name": "Prediction Pro",
        "description": "Completed World 2: Prediction Engine",
        "icon": "📊",
        "world": 2
    },
    {
        "id": "token_master",
        "name": "Token Master",
        "description": "Completed World 3: Tokenization",
        "icon": "🔤",
        "world": 3
    },
    {
        "id": "prompt_master",
        "name": "Prompt Master",
        "description": "Scored 80%+ in World 4: Prompt Engineering",
        "icon": "✍️",
        "world": 4
    },
    {
        "id": "truth_seeker",
        "name": "Truth Seeker",
        "description": "Detected hallucinations in World 5",
        "icon": "🕵️",
        "world": 5
    },
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


@router.get("/levels")
async def get_levels():
    return LEVELS


@router.get("/badges")
async def get_badges():
    return BADGES


@router.get("/level/{xp}")
async def get_level_for_xp(xp: int):
    return compute_level(xp)
