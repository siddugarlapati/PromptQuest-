import random

# Category patterns for AI Basics world
CATEGORIES = {
    "Animal": ["Dog", "Cat", "Elephant", "Lion", "Tiger", "Rabbit", "Horse", "Bear", "Fox", "Wolf", "Deer", "Monkey"],
    "Vehicle": ["Car", "Truck", "Bus", "Motorcycle", "Bicycle", "Train", "Airplane", "Boat", "Scooter", "Van"],
    "Fruit": ["Apple", "Banana", "Mango", "Orange", "Grape", "Strawberry", "Watermelon", "Pineapple", "Cherry", "Pear"],
    "Country": ["India", "France", "Japan", "Brazil", "Australia", "Germany", "Canada", "Italy", "China", "Mexico"],
    "Planet": ["Earth", "Mars", "Jupiter", "Saturn", "Venus", "Mercury", "Neptune", "Uranus"],
    "Vegetable": ["Carrot", "Broccoli", "Spinach", "Tomato", "Potato", "Onion", "Cucumber", "Pepper"],
}

ITEM_TO_CATEGORY = {}
for cat, items in CATEGORIES.items():
    for item in items:
        ITEM_TO_CATEGORY[item] = cat


def get_pattern_question(difficulty: str = "easy") -> dict:
    """Generate a pattern recognition question."""
    if difficulty == "easy":
        num_examples = 3
        num_options = 3
    elif difficulty == "medium":
        num_examples = 2
        num_options = 4
    else:
        num_examples = 1
        num_options = 4

    # Pick a target category
    target_cat = random.choice(list(CATEGORIES.keys()))
    target_items = CATEGORIES[target_cat]

    # Pick examples (could be from same or mixed categories)
    examples = []
    for _ in range(num_examples):
        cat = random.choice(list(CATEGORIES.keys()))
        item = random.choice(CATEGORIES[cat])
        examples.append({"item": item, "category": cat})

    # The question item is from the target category
    question_item = random.choice([i for i in target_items if i not in [e["item"] for e in examples]])

    # Build answer options
    other_cats = [c for c in CATEGORIES.keys() if c != target_cat]
    wrong_cats = random.sample(other_cats, min(num_options - 1, len(other_cats)))
    options = [target_cat] + wrong_cats
    random.shuffle(options)

    return {
        "examples": examples,
        "question_item": question_item,
        "correct_answer": target_cat,
        "options": options
    }


def check_pattern_answer(question_item: str, answer: str) -> dict:
    """Check a pattern recognition answer."""
    correct = ITEM_TO_CATEGORY.get(question_item)
    is_correct = answer == correct
    xp_earned = 20 if is_correct else 0
    return {
        "is_correct": is_correct,
        "correct_answer": correct,
        "xp_earned": xp_earned,
        "feedback": f"✅ Correct! {question_item} is a {correct}." if is_correct else f"❌ Not quite. {question_item} is a {correct}, not {answer}."
    }
