import random

# Simulated next-word prediction tables
PREDICTION_PROMPTS = [
    {
        "prompt": "The capital of France is",
        "predictions": [
            {"word": "Paris", "probability": 91},
            {"word": "London", "probability": 5},
            {"word": "Rome", "probability": 2},
            {"word": "Berlin", "probability": 2},
        ],
        "correct": "Paris"
    },
    {
        "prompt": "The sun rises in the",
        "predictions": [
            {"word": "east", "probability": 88},
            {"word": "west", "probability": 7},
            {"word": "north", "probability": 3},
            {"word": "south", "probability": 2},
        ],
        "correct": "east"
    },
    {
        "prompt": "Water boils at 100 degrees",
        "predictions": [
            {"word": "Celsius", "probability": 85},
            {"word": "Fahrenheit", "probability": 10},
            {"word": "Kelvin", "probability": 4},
            {"word": "Centigrade", "probability": 1},
        ],
        "correct": "Celsius"
    },
    {
        "prompt": "The largest planet in our solar system is",
        "predictions": [
            {"word": "Jupiter", "probability": 90},
            {"word": "Saturn", "probability": 7},
            {"word": "Neptune", "probability": 2},
            {"word": "Mars", "probability": 1},
        ],
        "correct": "Jupiter"
    },
    {
        "prompt": "Python is a programming",
        "predictions": [
            {"word": "language", "probability": 93},
            {"word": "framework", "probability": 4},
            {"word": "tool", "probability": 2},
            {"word": "library", "probability": 1},
        ],
        "correct": "language"
    },
    {
        "prompt": "The speed of light is approximately 300,000 kilometers per",
        "predictions": [
            {"word": "second", "probability": 89},
            {"word": "hour", "probability": 7},
            {"word": "minute", "probability": 3},
            {"word": "day", "probability": 1},
        ],
        "correct": "second"
    },
    {
        "prompt": "Albert Einstein developed the theory of",
        "predictions": [
            {"word": "relativity", "probability": 92},
            {"word": "gravity", "probability": 4},
            {"word": "evolution", "probability": 2},
            {"word": "quantum", "probability": 2},
        ],
        "correct": "relativity"
    },
    {
        "prompt": "The human body has how many bones?",
        "predictions": [
            {"word": "206", "probability": 78},
            {"word": "212", "probability": 10},
            {"word": "198", "probability": 7},
            {"word": "220", "probability": 5},
        ],
        "correct": "206"
    },
]


def get_prediction_question() -> dict:
    q = random.choice(PREDICTION_PROMPTS)
    shuffled = q["predictions"][:]
    random.shuffle(shuffled)
    return {
        "prompt": q["prompt"],
        "predictions": sorted(q["predictions"], key=lambda x: -x["probability"]),
        "options": [p["word"] for p in shuffled],
        "correct": q["correct"]
    }


def check_prediction_answer(prompt: str, answer: str) -> dict:
    for q in PREDICTION_PROMPTS:
        if q["prompt"] == prompt:
            is_correct = answer == q["correct"]
            xp = 25 if is_correct else 5
            return {
                "is_correct": is_correct,
                "correct_answer": q["correct"],
                "predictions": sorted(q["predictions"], key=lambda x: -x["probability"]),
                "xp_earned": xp,
                "feedback": f"✅ The model predicted '{q['correct']}' with highest probability!" if is_correct
                            else f"❌ The model would predict '{q['correct']}' — that's what has the highest probability!"
            }
    return {"is_correct": False, "xp_earned": 0, "feedback": "Question not found."}
