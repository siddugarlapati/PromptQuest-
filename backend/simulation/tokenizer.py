import re


def tokenize(text: str) -> dict:
    """
    Simple tokenizer that simulates LLM-style tokenization:
    - Punctuation gets its own token
    - Common prefixes/suffixes get split (subword-like)
    - Returns colored token groups
    """
    if not text.strip():
        return {"tokens": [], "token_count": 0, "char_count": 0}

    # Step 1: split on spaces and punctuation
    raw_tokens = re.findall(r"[A-Za-z]+|[0-9]+|[^\s\w]", text)

    # Step 2: apply simple subword splitting for long words (simulated BPE)
    subword_tokens = []
    for token in raw_tokens:
        if len(token) > 8 and token.isalpha():
            # Split long words at common boundaries
            mid = len(token) // 2
            subword_tokens.append(token[:mid])
            subword_tokens.append("##" + token[mid:])
        else:
            subword_tokens.append(token)

    token_colors = [
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
        "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
        "#BB8FCE", "#85C1E9"
    ]

    tokens_with_meta = []
    for i, tok in enumerate(subword_tokens):
        tokens_with_meta.append({
            "text": tok,
            "id": i,
            "color": token_colors[i % len(token_colors)],
            "is_subword": tok.startswith("##")
        })

    return {
        "tokens": tokens_with_meta,
        "token_count": len(subword_tokens),
        "char_count": len(text),
        "compression_ratio": round(len(text) / max(len(subword_tokens), 1), 2)
    }
