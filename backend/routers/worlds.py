from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List

from simulation.pattern import get_pattern_question, check_pattern_answer
from simulation.prediction import get_prediction_question, check_prediction_answer
from simulation.hallucination import get_hallucination_question, check_hallucination_answer
from simulation.prompt_scorer import score_prompt
from simulation import mini_trainer
from simulation.attention import simulate_attention
from simulation.tokenizer import tokenize
from simulation.transformer import resolve_pronouns
from simulation.embedding import map_embeddings
from simulation.context import simulate_context_window

router = APIRouter()

# ===================== WORLD 1: AI Basics =====================
class PatternAnswer(BaseModel):
    question_item: str
    answer: str

@router.get("/1/question")
async def world1_question(difficulty: str = "easy"):
    return get_pattern_question(difficulty)

@router.post("/1/answer")
async def world1_answer(data: PatternAnswer):
    return check_pattern_answer(data.question_item, data.answer)


# ===================== WORLD 2: Prediction Engine =====================
class PredictionAnswer(BaseModel):
    prompt: str
    answer: str

@router.get("/2/question")
async def world2_question():
    return get_prediction_question()

@router.post("/2/answer")
async def world2_answer(data: PredictionAnswer):
    return check_prediction_answer(data.prompt, data.answer)


# ===================== WORLD 3: Tokenization =====================
class TokenizeRequest(BaseModel):
    text: str

@router.post("/3/tokenize")
async def world3_tokenize(data: TokenizeRequest):
    return tokenize(data.text)


# ===================== WORLD 4: Transformers =====================
class TransformerRequest(BaseModel):
    sentence: str

@router.post("/4/resolve")
async def world4_resolve(data: TransformerRequest):
    """Simulate Self-Attention pronoun resolution."""
    return resolve_pronouns(data.sentence)


# ===================== WORLD 5: Attention Lab =====================
class AttentionRequest(BaseModel):
    prompt: str
    focus_word: Optional[str] = ""

@router.post("/5/analyze")
async def world5_attention(data: AttentionRequest):
    """Simulate attention weights."""
    return simulate_attention(data.prompt, data.focus_word)


# ===================== WORLD 6: Embeddings Lab =====================
class EmbeddingRequest(BaseModel):
    words: List[str]

@router.post("/6/map")
async def world6_embeddings(data: EmbeddingRequest):
    """Generate 2D coordinates for given words."""
    return {"embeddings": map_embeddings(data.words)}


# ===================== WORLD 7: Context Lab =====================
class ContextRequest(BaseModel):
    messages: List[dict] # {text: str, role: str}
    max_tokens: Optional[int] = 50

@router.post("/7/simulate")
async def world7_context(data: ContextRequest):
    """Simulate context window limits."""
    return simulate_context_window(data.messages, data.max_tokens)


# ===================== WORLD 8: Prompt Engineering (Was 4) =====================
class PromptRequest(BaseModel):
    prompt: str

@router.post("/8/score")
async def world8_score(data: PromptRequest):
    return score_prompt(data.prompt)


# ===================== WORLD 9: Hallucination Detection (Was 5) =====================
class HallucinationAnswer(BaseModel):
    question_id: int
    answer: bool

@router.get("/9/question")
async def world9_question():
    return get_hallucination_question()

@router.post("/9/answer")
async def world9_answer(data: HallucinationAnswer):
    return check_hallucination_answer(data.question_id, data.answer)


# ===================== WORLD 10: Mini AI Trainer (Was 6) =====================
class TrainRequest(BaseModel):
    item: str
    category: str
    session_id: Optional[str] = "default"

class PredictRequest(BaseModel):
    item: str
    session_id: Optional[str] = "default"

@router.post("/10/train")
async def world10_train(data: TrainRequest):
    return mini_trainer.train_example(data.item, data.category, data.session_id)

@router.post("/10/predict")
async def world10_predict(data: PredictRequest):
    return mini_trainer.predict(data.item, data.session_id)

@router.get("/10/state")
async def world10_state(session_id: str = "default"):
    return mini_trainer.get_model_state(session_id)

@router.delete("/10/reset")
async def world10_reset(session_id: str = "default"):
    return mini_trainer.reset_model(session_id)
