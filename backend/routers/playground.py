from fastapi import APIRouter
from pydantic import BaseModel
from simulation.tokenizer import tokenize
from simulation.prompt_scorer import score_prompt

router = APIRouter()

# Simulated AI output templates
SIMULATED_OUTPUTS = {
    "default": "Based on your prompt, here is a simulated AI response. In a real LLM, this would be generated token-by-token using billions of parameters learned from vast amounts of training data.",
    "explain": "Here's an explanation: The concept works by breaking down complex information into simpler components. Each step builds on the previous one, creating a chain of understanding that makes the topic accessible to learners.",
    "list": "Here are the key points:\n1. First important aspect\n2. Second crucial element\n3. Third key consideration\n4. Fourth relevant factor\n5. Fifth supporting detail",
    "code": "```python\n# Simulated code output\ndef solution():\n    # This is where the AI would generate actual code\n    # based on your specific requirements\n    return 'Hello from PromptQuest!'\n```",
    "story": "Once upon a time, in a world where knowledge was power, a young learner discovered the secrets of artificial intelligence. Through patience and curiosity, they mastered the art of prompting...",
}


def simulate_output(prompt: str) -> str:
    prompt_lower = prompt.lower()
    if any(kw in prompt_lower for kw in ["code", "function", "program", "write a"]):
        return SIMULATED_OUTPUTS["code"]
    elif any(kw in prompt_lower for kw in ["list", "steps", "enumerate", "give me"]):
        return SIMULATED_OUTPUTS["list"]
    elif any(kw in prompt_lower for kw in ["explain", "what is", "how does", "describe"]):
        return SIMULATED_OUTPUTS["explain"]
    elif any(kw in prompt_lower for kw in ["story", "once", "narrative", "tell"]):
        return SIMULATED_OUTPUTS["story"]
    else:
        return SIMULATED_OUTPUTS["default"]


class PlaygroundRequest(BaseModel):
    prompt: str


@router.post("/analyze")
async def playground_analyze(data: PlaygroundRequest):
    token_result = tokenize(data.prompt)
    score_result = score_prompt(data.prompt)
    output = simulate_output(data.prompt)

    return {
        "prompt": data.prompt,
        "tokens": token_result,
        "score": score_result,
        "simulated_output": output,
        "pipeline_steps": [
            {"step": "Input", "description": "Your prompt is received"},
            {"step": "Tokenization", "description": f"Split into {token_result['token_count']} tokens"},
            {"step": "Embedding", "description": "Each token converted to a vector"},
            {"step": "Attention", "description": "Transformer computes relationships"},
            {"step": "Generation", "description": "Output generated token by token"},
        ]
    }
