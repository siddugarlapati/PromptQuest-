import re

def tokenize(text: str) -> dict:
    """
    Tokenizer simulating Word, Character, and Subword BPE tokenization.
    """
    if not text.strip():
        return {
            "word_tokens": [],
            "char_tokens": [],
            "subword_tokens": [],
            "stats": {"token_count": 0, "char_count": 0}
        }

    # Word Tokens (split on spaces and punctuation but keep them)
    raw_words = re.findall(r"[A-Za-z]+|[0-9]+|[^\s\w]", text)
    
    # Character Tokens (skip spaces)
    raw_chars = [c for c in text if c.strip()]
    
    # Subword Tokens (mocking BPE logic)
    subwords = []
    vowels = set('aeiouyAEIOUY')
    for word in raw_words:
        if len(word) > 4 and word.isalpha():
            # Mock split word if it's long
            mid = len(word) // 2 + 1
            subwords.append(word[:mid])
            subwords.append("##" + word[mid:])
        elif word.lower().endswith("ing") and len(word) > 4:
            subwords.append(word[:-3])
            subwords.append("##ing")
        elif word.lower().endswith("ed") and len(word) > 3:
            subwords.append(word[:-2])
            subwords.append("##ed")
        else:
            subwords.append(word)

    token_colors = [
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
        "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
        "#BB8FCE", "#85C1E9", "#F1948A", "#82E0AA"
    ]

    def add_meta(t_list):
        return [
            {
                "text": tok,
                "id": i,
                "color": token_colors[i % len(token_colors)]
            } for i, tok in enumerate(t_list)
        ]

    return {
        "word_tokens": add_meta(raw_words),
        "char_tokens": add_meta(raw_chars),
        "subword_tokens": add_meta(subwords),
        "stats": {
            "token_count": len(subwords),
            "char_count": len(text),
            "compression_ratio": round(len(text) / max(len(subwords), 1), 2)
        }
    }
