from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import json
from simulation.tokenizer import tokenize
from simulation.prompt_scorer import score_prompt
from simulation import ollama_client

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


from simulation.embedding import map_embeddings
from simulation.context import simulate_context_window

@router.post("/analyze")
async def playground_analyze(data: PlaygroundRequest):
    token_result = tokenize(data.prompt)
    score_result = score_prompt(data.prompt)
    output = simulate_output(data.prompt)
    
    # Generate embeddings for valid word tokens
    words = [w["text"] for w in token_result.get("word_tokens", []) if w["text"].isalpha()]
    emb_result = map_embeddings(words)
    
    # Generate context simulation (just this one message against limit 50)
    ctx_result = simulate_context_window([{"role": "user", "text": data.prompt}], 50)

    return {
        "prompt": data.prompt,
        "tokens": token_result,
        "score": score_result,
        "embeddings": emb_result,
        "context": ctx_result,
        "simulated_output": output,
        "pipeline_steps": [
            {"step": "Input", "description": "Your prompt is received"},
            {"step": "Tokenization", "description": f"Split into {token_result['stats']['token_count']} tokens"},
            {"step": "Embedding", "description": f"Mapped {len(emb_result)} words to vectors"},
            {"step": "Attention", "description": "Transformer computes relationships"},
            {"step": "Generation", "description": "Output generated token by token"},
        ]
    }


class ArcadeGenerateRequest(BaseModel):
    game_id: str
    level: int
    score: int


@router.post("/arcade-generate")
async def generate_arcade_question(req: ArcadeGenerateRequest):
    """
    Dynamically generates a completely random new question for the LLM arcade
    using the local Ollama instance, adapting to the user's current level.
    """
    if req.game_id == "autoregressor":
        prompt = f"Generate a next word prediction challenge for a student at level {req.level}. Provide a 5 to 10 word sentence missing its most heavily probable final word (the 'answer'). Provide a 1 sentence explanation of why this word is statistically the most probable token. Return ONLY valid JSON: {{\"s\": \"The sentence...\", \"a\": \"answerword\", \"exp\": \"Explanation...\"}}"
    elif req.game_id == "squeezer":
        prompt = f"Generate a horribly bloated, overly verbose 30-word prompt request for a student at level {req.level}. Provide a 'diff' number representing how many fluffy useless tokens can be removed to optimize it. Provide a 1-sentence explanation of what fluff can be removed. Return ONLY valid JSON: {{\"p\": \"Bloated prompt...\", \"diff\": 15, \"exp\": \"Explanation...\"}}"
    elif req.game_id == "attention":
        prompt = f"Generate a grammar mapping challenge for a student at level {req.level}. Provide a single sentence with a clear pronoun (the 'target'). Provide 4 word options from the sentence, one of which must be the correct noun the pronoun refers to. Provide an explanation of the self-attention grammatical linkage. Return ONLY valid JSON: {{\"s\": \"The sentence...\", \"target\": \"pronoun\", \"options\": [\"word1\", \"word2\", \"word3\", \"word4\"], \"correct\": \"noun\", \"exp\": \"Explanation...\"}}"
    else:
        return {"error": "Invalid game_id"}

    result = await ollama_client.generate(
        prompt=prompt,
        system="You are an educational AI puzzle generator. Your only output is minified JSON.",
        temperature=0.9, # High temperature so questions don't repeat
        max_tokens=256,
        json_format=True
    )

    if not result["success"]:
        return {"error": result["error"]}
    
    try:
        # Parse what came out of the LLM to ensure it's clean JSON
        data = json.loads(result["response"])
        return {"success": True, "question": data}
    except json.JSONDecodeError:
        return {"error": "LLM failed to generate valid JSON"}

