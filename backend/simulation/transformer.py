import random

def resolve_pronouns(sentence: str) -> dict:
    """
    Simulates Transformer Self-Attention mechanism for pronoun resolution (Coreference Resolution).
    Educational mock for teaching how words pay attention to each other.
    """
    words = sentence.split()
    lower_words = [w.lower().strip(".,!?") for w in words]
    
    # Simple hardcoded mock logic for education
    pronouns = {"he", "she", "it", "they", "him", "her", "them"}
    
    resolutions = []
    
    for i, word in enumerate(lower_words):
        if word in pronouns:
            # Look backwards for the first capitalized word (proper noun) or standard noun
            # Mock logic: just grab the first capitalized word before the pronoun
            target = None
            target_index = -1
            
            # Simple heuristic matching
            for j in range(i - 1, -1, -1):
                # Is it capitalized in the original sentence? (Proper Noun)
                if words[j][0].isupper() and j != 0: 
                    target = words[j].strip(".,!?")
                    target_index = j
                    break
                # Or if it's the first word of the sentence
                elif j == 0:
                    target = words[j].strip(".,!?")
                    target_index = j
                    break
                    
            if target:
                resolutions.append({
                    "pronoun": words[i],
                    "pronoun_index": i,
                    "target": target,
                    "target_index": target_index,
                    "attention_weight": 0.85 + (random.random() * 0.1) if 'random' in globals() else 0.88
                })
                
    return {
        "sentence": sentence,
        "tokens": words,
        "resolutions": resolutions,
        "explanation": "Transformers use Self-Attention to understand relationships. The pronoun pays high 'attention' to its likely subject."
    }
