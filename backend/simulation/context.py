import math

def simulate_context_window(messages: list, max_tokens: int = 50) -> dict:
    """
    Simulates how an LLM processes context.
    Models 'forget' older messages if the conversation exceeds the context window.
    """
    total_tokens = 0
    retained_messages = []
    forgotten_messages = []
    
    # Process from newest to oldest
    for msg in reversed(messages):
        # Rough token estimation: 1 word ~ 1.3 tokens
        msg_tokens = math.ceil(len(msg["text"].split()) * 1.3)
        
        if total_tokens + msg_tokens <= max_tokens:
            retained_messages.insert(0, {**msg, "tokens": msg_tokens, "status": "retained"})
            total_tokens += msg_tokens
        else:
            forgotten_messages.insert(0, {**msg, "tokens": msg_tokens, "status": "forgotten"})
            
    return {
        "retained": retained_messages,
        "forgotten": forgotten_messages,
        "total_tokens_used": total_tokens,
        "max_capacity": max_tokens,
        "utilization_percent": round((total_tokens / max_tokens) * 100)
    }
