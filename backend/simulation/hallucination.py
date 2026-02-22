import random

# Curated hallucination questions: mix of true and false AI "answers"
HALLUCINATION_QUESTIONS = [
    {
        "question": "An AI says: 'Albert Einstein won the Nobel Prize for the Theory of Relativity.'",
        "answer": False,
        "explanation": "Einstein won the Nobel Prize in Physics 1921 for the photoelectric effect, NOT relativity."
    },
    {
        "question": "An AI says: 'The Great Wall of China is visible from space.'",
        "answer": False,
        "explanation": "The Great Wall is too narrow to be seen from space with the naked eye. This is a common myth."
    },
    {
        "question": "An AI says: 'Python was created by Guido van Rossum.'",
        "answer": True,
        "explanation": "Correct! Guido van Rossum created Python, first released in 1991."
    },
    {
        "question": "An AI says: 'The chemical formula for water is H3O.'",
        "answer": False,
        "explanation": "The correct formula is H₂O (two hydrogen atoms + one oxygen atom). H₃O⁺ is the hydronium ion."
    },
    {
        "question": "An AI says: 'Mount Everest is the tallest mountain on Earth measured from sea level.'",
        "answer": True,
        "explanation": "Correct! Mount Everest at 8,848.86m is the highest above sea level."
    },
    {
        "question": "An AI says: 'Shakespeare wrote Romeo and Juliet in 1623.'",
        "answer": False,
        "explanation": "Romeo and Juliet was written around 1594–1596. 1623 is when Shakespeare's First Folio was published."
    },
    {
        "question": "An AI says: 'Humans use only 10% of their brain.'",
        "answer": False,
        "explanation": "This is a myth! Humans use virtually all of their brain — different areas are active at different times."
    },
    {
        "question": "An AI says: 'DNA stands for Deoxyribonucleic Acid.'",
        "answer": True,
        "explanation": "Correct! DNA = Deoxyribonucleic Acid, the molecule carrying genetic information."
    },
    {
        "question": "An AI says: 'Napoleon Bonaparte was very short — around 5 feet tall.'",
        "answer": False,
        "explanation": "Napoleon was about 5 feet 7 inches (170cm), average for his era. The 'short' myth came from unit confusion."
    },
    {
        "question": "An AI says: 'The first computer programmer was Ada Lovelace.'",
        "answer": True,
        "explanation": "Correct! Ada Lovelace is credited as writing the first algorithm for Charles Babbage's Analytical Engine."
    },
    {
        "question": "An AI says: 'Light travels faster in water than in a vacuum.'",
        "answer": False,
        "explanation": "Light travels fastest in a vacuum (~300,000 km/s). It slows down in water."
    },
    {
        "question": "An AI says: 'The Amazon River is the longest river in the world.'",
        "answer": False,
        "explanation": "The Nile River is traditionally considered the longest. The Amazon is the largest by volume."
    },
]


def get_hallucination_question() -> dict:
    q = random.choice(HALLUCINATION_QUESTIONS)
    return {
        "question": q["question"],
        "correct_answer": q["answer"],  # hidden from frontend
        "_id": HALLUCINATION_QUESTIONS.index(q)
    }


def check_hallucination_answer(question_id: int, user_answer: bool) -> dict:
    if question_id < 0 or question_id >= len(HALLUCINATION_QUESTIONS):
        return {"is_correct": False, "xp_earned": 0, "feedback": "Invalid question."}

    q = HALLUCINATION_QUESTIONS[question_id]
    is_correct = user_answer == q["answer"]
    xp = 30 if is_correct else 0

    return {
        "is_correct": is_correct,
        "correct_answer": q["answer"],
        "explanation": q["explanation"],
        "xp_earned": xp,
        "feedback": f"✅ Correct! {q['explanation']}" if is_correct else f"❌ Wrong! {q['explanation']}"
    }
