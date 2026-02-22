"""
Attention Simulator
Simulates attention weights showing which tokens the model "focuses on".
"""
import re
import math
from typing import List


def tokenize_simple(text: str) -> List[str]:
    """Split text into simple word-level tokens."""
    return [t for t in re.split(r'(\s+|[,.!?;:])', text.strip()) if t.strip()]


def simulate_attention(prompt: str, focus_word: str = "") -> dict:
    """
    Simulate attention weights for tokens in a prompt.
    Returns token list with attention scores (0.0–1.0).
    """
    tokens = tokenize_simple(prompt)
    if not tokens:
        return {"tokens": [], "explanation": "No tokens to analyze."}

    n = len(tokens)
    weights = []

    for i, tok in enumerate(tokens):
        tok_lower = tok.lower()

        # Heuristic: nouns/content words get more attention
        score = 0.3  # base
        if len(tok) > 4:
            score += 0.2
        if tok[0].isupper():
            score += 0.15
        if tok_lower in {"explain", "describe", "list", "what", "how", "why", "example", "step"}:
            score += 0.4
        if focus_word and tok_lower == focus_word.lower():
            score += 0.5
        # Later tokens get slightly more attention (recency bias)
        score += (i / max(n, 1)) * 0.1
        # Add some variation
        score += math.sin(i * 1.7) * 0.05
        weights.append(min(score, 1.0))

    # Normalize to 0–1
    max_w = max(weights) if weights else 1
    normalized = [round(w / max_w, 3) for w in weights]

    result_tokens = [
        {
            "token": tok,
            "attention": normalized[i],
            "rank": 0
        }
        for i, tok in enumerate(tokens)
    ]
    # Assign rank
    sorted_by_attn = sorted(result_tokens, key=lambda x: x["attention"], reverse=True)
    for rank, item in enumerate(sorted_by_attn):
        item["rank"] = rank + 1

    top_tokens = [t["token"] for t in sorted_by_attn[:3]]

    return {
        "tokens": result_tokens,
        "top_tokens": top_tokens,
        "explanation": f"The model pays most attention to: {', '.join(top_tokens)}. "
                       f"These words carry the most meaning for generating the response.",
        "token_count": len(tokens)
    }
