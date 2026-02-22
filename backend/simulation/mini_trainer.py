"""
Mini AI Trainer — World 6
In-memory key-value training that simulates how AI learns from examples.
"""
from typing import Dict, List, Optional
from difflib import SequenceMatcher


# Global in-memory "model" — per session
# In production this would be per-user via session ID
_models: Dict[str, Dict[str, str]] = {}


def get_or_create_model(session_id: str = "default") -> Dict[str, str]:
    if session_id not in _models:
        _models[session_id] = {}
    return _models[session_id]


def train_example(item: str, category: str, session_id: str = "default") -> dict:
    """Add a training example to the model."""
    model = get_or_create_model(session_id)
    item_clean = item.strip().lower()
    category_clean = category.strip().title()
    model[item_clean] = category_clean

    return {
        "success": True,
        "trained_item": item.strip(),
        "trained_category": category_clean,
        "total_examples": len(model),
        "message": f"✅ Model learned: {item.strip()} → {category_clean}",
        "model_state": [{"item": k, "category": v} for k, v in model.items()]
    }


def predict(item: str, session_id: str = "default") -> dict:
    """Predict the category for a new item using the trained model."""
    model = get_or_create_model(session_id)
    item_clean = item.strip().lower()

    if not model:
        return {
            "success": False,
            "prediction": None,
            "confidence": 0,
            "method": "none",
            "message": "❌ No training data yet. Add some examples first!",
            "explanation": "The model has no knowledge. You must train it first."
        }

    # Exact match
    if item_clean in model:
        return {
            "success": True,
            "prediction": model[item_clean],
            "confidence": 1.0,
            "method": "exact_match",
            "message": f"✅ '{item.strip()}' → {model[item_clean]} (exact match!)",
            "explanation": "The model found this exact item in its training data."
        }

    # Fuzzy match
    best_match = None
    best_score = 0
    for trained_item in model:
        score = SequenceMatcher(None, item_clean, trained_item).ratio()
        if score > best_score:
            best_score = score
            best_match = trained_item

    if best_score > 0.6:
        prediction = model[best_match]
        return {
            "success": True,
            "prediction": prediction,
            "confidence": round(best_score, 2),
            "method": "fuzzy_match",
            "message": f"🤔 '{item.strip()}' → {prediction} (similar to '{best_match}', {round(best_score*100)}% match)",
            "explanation": f"The model couldn't find '{item.strip()}' exactly, but it's {round(best_score*100)}% similar to '{best_match}' which belongs to {prediction}."
        }

    # Category majority vote
    categories = list(model.values())
    from collections import Counter
    most_common = Counter(categories).most_common(1)[0]
    return {
        "success": True,
        "prediction": most_common[0],
        "confidence": round(most_common[1] / len(categories), 2),
        "method": "majority_vote",
        "message": f"❓ Unknown item. Guessing '{most_common[0]}' (most common category in training data)",
        "explanation": f"The model doesn't recognize '{item.strip()}'. It falls back to the most common category ({most_common[0]}) seen in training."
    }


def reset_model(session_id: str = "default") -> dict:
    """Reset the model for a session."""
    _models[session_id] = {}
    return {"success": True, "message": "Model reset. Start training again!"}


def get_model_state(session_id: str = "default") -> dict:
    """Return current training state."""
    model = get_or_create_model(session_id)
    from collections import Counter
    categories = list(model.values())
    return {
        "total_examples": len(model),
        "categories": dict(Counter(categories)),
        "examples": [{"item": k, "category": v} for k, v in model.items()]
    }
