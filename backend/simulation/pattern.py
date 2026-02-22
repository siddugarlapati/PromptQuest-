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


def generate_number_pattern() -> dict:
    """Generate a sequence prediction pattern (e.g. 2, 4, 6, 8 -> 10)."""
    examples = []
    # Build 3 examples of arithmetic progressions
    for _ in range(3):
        start = random.randint(1, 10)
        step = random.randint(1, 5)
        seq = [start + i*step for i in range(4)]
        next_val = start + 4*step
        examples.append({"item": " ".join(map(str, seq)), "category": str(next_val)})
        
    # Build the actual question
    start = random.randint(2, 15)
    step = random.randint(2, 6)
    seq = [start + i*step for i in range(4)]
    correct = start + 4*step
    
    options = [str(correct)]
    while len(options) < 4:
        wrong = correct + random.choice([-2, -1, 1, 2]) * step
        if str(wrong) not in options and wrong > 0:
            options.append(str(wrong))
    random.shuffle(options)
    
    return {
        "type": "number",
        "examples": examples,
        "question_item": " ".join(map(str, seq)),
        "correct_answer": str(correct),
        "options": options
    }


def get_pattern_question(difficulty: str = "easy") -> dict:
    """Generate a pattern recognition question."""
    
    # Randomly choose between word categories and number patterns
    if random.random() < 0.4:
        return generate_number_pattern()
        
    if difficulty == "easy":
        num_examples = 3
        num_options = 3
    elif difficulty == "medium":
        num_examples = 2
        num_options = 4
    else:
        num_examples = 1
        num_options = 4

    target_cat = random.choice(list(CATEGORIES.keys()))
    target_items = CATEGORIES[target_cat]

    examples = []
    for _ in range(num_examples):
        cat = random.choice(list(CATEGORIES.keys()))
        item = random.choice(CATEGORIES[cat])
        examples.append({"item": item, "category": cat})

    question_item = random.choice([i for i in target_items if i not in [e["item"] for e in examples]])

    other_cats = [c for c in CATEGORIES.keys() if c != target_cat]
    wrong_cats = random.sample(other_cats, min(num_options - 1, len(other_cats)))
    options = [target_cat] + wrong_cats
    random.shuffle(options)

    return {
        "type": "word",
        "examples": examples,
        "question_item": question_item,
        "correct_answer": target_cat,
        "options": options
    }


def check_pattern_answer(question_item: str, answer: str) -> dict:
    """Check a pattern recognition answer."""
    # Check if it was a number sequence (has spaces and digits)
    if " " in question_item and any(c.isdigit() for c in question_item):
        nums = list(map(int, question_item.split()))
        step = nums[1] - nums[0]
        correct = str(nums[-1] + step)
        is_correct = (answer == correct)
        return {
            "is_correct": is_correct,
            "correct_answer": correct,
            "xp_earned": 20 if is_correct else 0,
            "feedback": f"✅ Correct! The pattern increases by {step}." if is_correct else f"❌ Not quite. The next number is {correct}."
        }
        
    v = ITEM_TO_CATEGORY.get(question_item)
    correct = v
    is_correct = (answer == correct)
    xp_earned = 20 if is_correct else 0
    return {
        "is_correct": is_correct,
        "correct_answer": correct,
        "xp_earned": xp_earned,
        "feedback": f"✅ Correct! {question_item} is a {correct}." if is_correct else f"❌ Not quite. {question_item} is a {correct}, not {answer}."
    }
