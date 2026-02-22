"""
Confidence Simulator
Generates realistic confidence scores for AI predictions.
"""
import math
import random
from typing import List


def simulate_confidence(prompt: str, predicted_word: str, probability: float) -> dict:
    """
    Simulate model confidence for a prediction.
    Returns confidence breakdown with explanation.
    """
    # Base confidence from probability
    base_conf = probability / 100.0

    # Context clarity score  
    words = prompt.strip().split()
    context_score = min(len(words) / 15, 1.0)  # more context = more confident

    # Word familiarity (longer = more common = more confident)
    familiarity = min(len(predicted_word) / 8, 1.0) * 0.5 + 0.5

    # Final confidence
    confidence = (base_conf * 0.6 + context_score * 0.25 + familiarity * 0.15)
    confidence = round(min(max(confidence, 0.05), 0.99), 3)

    # Entropy (lower = more confident)
    entropy = round(-confidence * math.log2(confidence + 1e-9) - (1 - confidence) * math.log2(1 - confidence + 1e-9), 3)

    level = "High" if confidence > 0.75 else "Medium" if confidence > 0.45 else "Low"
    color = "#16a34a" if level == "High" else "#d97706" if level == "Medium" else "#dc2626"

    return {
        "predicted_word": predicted_word,
        "confidence": confidence,
        "confidence_pct": round(confidence * 100, 1),
        "level": level,
        "color": color,
        "entropy": entropy,
        "breakdown": {
            "probability_weight": round(base_conf * 0.6, 3),
            "context_clarity": round(context_score * 0.25, 3),
            "word_familiarity": round(familiarity * 0.15, 3),
        },
        "explanation": (
            f"The model is {level.lower()}ly confident ({round(confidence*100)}%) in predicting '{predicted_word}'. "
            f"{'More context helps narrow down predictions.' if context_score < 0.6 else 'The context provides strong signal for this prediction.'} "
            f"Entropy: {entropy:.2f} bits (lower = more certain)."
        )
    }


def simulate_top_k_confidence(options: List[str], probabilities: List[float]) -> List[dict]:
    """Generate confidence for a list of candidate words."""
    results = []
    for word, prob in zip(options, probabilities):
        conf = prob / 100
        results.append({
            "word": word,
            "probability": prob,
            "confidence": round(conf, 3),
            "bar_width": f"{prob}%"
        })
    return sorted(results, key=lambda x: x["probability"], reverse=True)
