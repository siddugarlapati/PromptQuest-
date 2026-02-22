import math
import random

# A mock 2D embedding space for educational purposes
EMBEDDING_SPACE = {
    # Animals
    "dog": {"x": 10, "y": 80, "category": "animal"},
    "cat": {"x": 15, "y": 85, "category": "animal"},
    "lion": {"x": 8, "y": 90, "category": "animal"},
    "tiger": {"x": 12, "y": 92, "category": "animal"},
    "duck": {"x": 20, "y": 70, "category": "animal"},
    
    # Vehicles
    "car": {"x": 80, "y": 20, "category": "vehicle"},
    "truck": {"x": 85, "y": 15, "category": "vehicle"},
    "bus": {"x": 88, "y": 25, "category": "vehicle"},
    "train": {"x": 90, "y": 10, "category": "vehicle"},
    "bicycle": {"x": 75, "y": 30, "category": "vehicle"},
    
    # Food
    "apple": {"x": 40, "y": 90, "category": "food"},
    "banana": {"x": 45, "y": 85, "category": "food"},
    "pizza": {"x": 55, "y": 80, "category": "food"},
    "burger": {"x": 60, "y": 75, "category": "food"},
    
    # Tech
    "computer": {"x": 85, "y": 85, "category": "tech"},
    "phone": {"x": 80, "y": 80, "category": "tech"},
    "ai": {"x": 95, "y": 95, "category": "tech"},
    "robot": {"x": 90, "y": 90, "category": "tech"},
    "software": {"x": 75, "y": 75, "category": "tech"}
}

def get_word_embedding(word: str) -> dict:
    word = word.lower().strip()
    if word in EMBEDDING_SPACE:
        return EMBEDDING_SPACE[word]
    
    # If not found, generate a deterministic pseudo-random embedding based on the word string
    # This ensures the same word always gets the same coordinates in the simulation
    random.seed(word)
    return {
        "x": random.randint(10, 90),
        "y": random.randint(10, 90),
        "category": "unknown"
    }

def calculate_distance(word1: str, word2: str) -> float:
    e1 = get_word_embedding(word1)
    e2 = get_word_embedding(word2)
    # Euclidean distance
    return math.sqrt((e1["x"] - e2["x"])**2 + (e1["y"] - e2["y"])**2)

def calculate_similarity(word1: str, word2: str) -> float:
    # Max possible distance in 100x100 space is ~141.4
    dist = calculate_distance(word1, word2)
    similarity = max(0.0, 100 - (dist / 141.4) * 100)
    return round(similarity, 1)

def map_embeddings(word_list: list) -> list:
    """Takes a list of words and returns their embeddings and similarity matrix."""
    embeddings = []
    for w in word_list:
        e = get_word_embedding(w)
        embeddings.append({"word": w, "x": e["x"], "y": e["y"], "category": e["category"]})
        
    return embeddings
