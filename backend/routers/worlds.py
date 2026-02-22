from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from simulation.pattern import get_pattern_question, check_pattern_answer
from simulation.prediction import get_prediction_question, check_prediction_answer
from simulation.hallucination import get_hallucination_question, check_hallucination_answer
from simulation.prompt_scorer import score_prompt
from simulation import mini_trainer
from simulation.attention import simulate_attention
import random

router = APIRouter()


# ===================== WORLD 1: AI Basics / Pattern Recognition =====================

@router.get("/1/question")
async def world1_question(difficulty: str = "easy"):
    return get_pattern_question(difficulty)


class PatternAnswer(BaseModel):
    question_item: str
    answer: str


@router.post("/1/answer")
async def world1_answer(data: PatternAnswer):
    return check_pattern_answer(data.question_item, data.answer)


# ===================== WORLD 2: Prediction Engine =====================

@router.get("/2/question")
async def world2_question():
    return get_prediction_question()


class PredictionAnswer(BaseModel):
    prompt: str
    answer: str


@router.post("/2/answer")
async def world2_answer(data: PredictionAnswer):
    return check_prediction_answer(data.prompt, data.answer)


# ===================== WORLD 3: Tokenization =====================

from simulation.tokenizer import tokenize

class TokenizeRequest(BaseModel):
    text: str


@router.post("/3/tokenize")
async def world3_tokenize(data: TokenizeRequest):
    return tokenize(data.text)


# ===================== WORLD 4: Prompt Engineering =====================

class PromptRequest(BaseModel):
    prompt: str


@router.post("/4/score")
async def world4_score(data: PromptRequest):
    return score_prompt(data.prompt)


# ===================== WORLD 5: Hallucination Detection =====================

@router.get("/5/question")
async def world5_question():
    return get_hallucination_question()


class HallucinationAnswer(BaseModel):
    question_id: int
    answer: bool


@router.post("/5/answer")
async def world5_answer(data: HallucinationAnswer):
    return check_hallucination_answer(data.question_id, data.answer)


# ===================== WORLD 6: Mini AI Trainer =====================

class TrainRequest(BaseModel):
    item: str
    category: str
    session_id: Optional[str] = "default"


class PredictRequest(BaseModel):
    item: str
    session_id: Optional[str] = "default"


@router.post("/6/train")
async def world6_train(data: TrainRequest):
    """Add a training example to the mini AI."""
    return mini_trainer.train_example(data.item, data.category, data.session_id)


@router.post("/6/predict")
async def world6_predict(data: PredictRequest):
    """Predict a category using the trained mini AI."""
    return mini_trainer.predict(data.item, data.session_id)


@router.get("/6/state")
async def world6_state(session_id: str = "default"):
    """Get current training state."""
    return mini_trainer.get_model_state(session_id)


@router.delete("/6/reset")
async def world6_reset(session_id: str = "default"):
    """Reset the mini AI model."""
    return mini_trainer.reset_model(session_id)


# ===================== ATTENTION ANALYSIS =====================

class AttentionRequest(BaseModel):
    prompt: str
    focus_word: Optional[str] = ""


@router.post("/attention")
async def analyze_attention(data: AttentionRequest):
    """Simulate attention weights for a prompt."""
    return simulate_attention(data.prompt, data.focus_word)
