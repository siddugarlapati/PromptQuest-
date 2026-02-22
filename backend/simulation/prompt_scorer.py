import re


def score_prompt(prompt: str) -> dict:
    """
    Score a prompt out of 100 based on:
    - Length (20 pts)
    - Clarity / specificity (25 pts)
    - Instructions present (25 pts)
    - Examples present (15 pts)
    - Context / role specification (15 pts)
    """
    scores = {}
    feedback = []

    # 1. Length score (20 pts)
    words = prompt.split()
    word_count = len(words)
    if word_count < 5:
        scores["length"] = 5
        feedback.append("❌ Too short — add more detail (5+ words needed)")
    elif word_count < 15:
        scores["length"] = 12
        feedback.append("⚠️ Moderate length — try to be more descriptive")
    elif word_count < 40:
        scores["length"] = 18
        feedback.append("✅ Good length")
    else:
        scores["length"] = 20
        feedback.append("✅ Excellent length — detailed and thorough")

    # 2. Clarity score (25 pts)
    clarity_keywords = ["explain", "describe", "list", "summarize", "write", "create", "generate",
                        "analyze", "compare", "define", "what", "how", "why", "give me", "tell me"]
    has_clarity = any(kw in prompt.lower() for kw in clarity_keywords)
    question_marks = prompt.count("?")
    if has_clarity or question_marks > 0:
        scores["clarity"] = 22 if word_count > 10 else 15
        feedback.append("✅ Clear instruction detected")
    else:
        scores["clarity"] = 8
        feedback.append("❌ Add a clear action verb (e.g., 'Explain', 'List', 'Write')")

    # 3. Instructions present (25 pts)
    instruction_patterns = [
        r"step[- ]by[- ]step", r"in \d+ words", r"bullet point", r"format",
        r"don't include", r"avoid", r"make sure", r"must", r"should",
        r"use simple language", r"for a beginner", r"for an expert",
        r"in the style of", r"tone:", r"output:"
    ]
    has_instructions = any(re.search(p, prompt.lower()) for p in instruction_patterns)
    if has_instructions:
        scores["instructions"] = 25
        feedback.append("✅ Contains formatting/style instructions")
    else:
        scores["instructions"] = 8
        feedback.append("💡 Add instructions: e.g., 'in bullet points', 'step-by-step', 'in simple language'")

    # 4. Examples present (15 pts)
    example_keywords = ["for example", "e.g.", "such as", "like:", "example:", "for instance", "as in"]
    has_examples = any(kw in prompt.lower() for kw in example_keywords)
    if has_examples:
        scores["examples"] = 15
        feedback.append("✅ Includes examples — great for guiding the model!")
    else:
        scores["examples"] = 3
        feedback.append("💡 Add examples to guide the model (e.g., 'for example, ...')")

    # 5. Context/Role (15 pts)
    role_keywords = ["you are", "act as", "as a", "assume you", "your role", "pretend", "imagine you"]
    has_role = any(kw in prompt.lower() for kw in role_keywords)
    if has_role:
        scores["context"] = 15
        feedback.append("✅ Role/context specified — excellent!")
    else:
        scores["context"] = 5
        feedback.append("💡 Set context/role: e.g., 'You are an expert teacher...'")

    total = sum(scores.values())

    # Grade
    if total >= 85:
        grade = "S"
        grade_label = "Prompt Master"
    elif total >= 70:
        grade = "A"
        grade_label = "Expert"
    elif total >= 55:
        grade = "B"
        grade_label = "Proficient"
    elif total >= 40:
        grade = "C"
        grade_label = "Developing"
    else:
        grade = "D"
        grade_label = "Needs Work"

    return {
        "total_score": total,
        "max_score": 100,
        "grade": grade,
        "grade_label": grade_label,
        "breakdown": scores,
        "feedback": feedback,
        "xp_earned": max(5, total // 5)
    }
