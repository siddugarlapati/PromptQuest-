import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

export default api;

// ─── WORLD APIS ────────────────────────────────────────────
export const worldsAPI = {
  // World 1
  getPatternQuestion: (difficulty = 'easy') =>
    api.get(`/worlds/1/question?difficulty=${difficulty}`),
  submitPatternAnswer: (questionItem, answer) =>
    api.post('/worlds/1/answer', { question_item: questionItem, answer }),

  // World 2
  getPredictionQuestion: () =>
    api.get('/worlds/2/question'),
  submitPredictionAnswer: (prompt, answer) =>
    api.post('/worlds/2/answer', { prompt, answer }),

  // World 3
  tokenize: (text) =>
    api.post('/worlds/3/tokenize', { text }),

  // World 4
  scorePrompt: (prompt) =>
    api.post('/worlds/4/score', { prompt }),

  // World 5
  getHallucinationQuestion: () =>
    api.get('/worlds/5/question'),
  submitHallucinationAnswer: (questionId, answer) =>
    api.post('/worlds/5/answer', { question_id: questionId, answer }),

  // World 6 — Mini AI Trainer
  world6Train: (item, category, sessionId = 'default') =>
    api.post('/worlds/6/train', { item, category, session_id: sessionId }),
  world6Predict: (item, sessionId = 'default') =>
    api.post('/worlds/6/predict', { item, session_id: sessionId }),
  world6State: (sessionId = 'default') =>
    api.get(`/worlds/6/state?session_id=${sessionId}`),
  world6Reset: (sessionId = 'default') =>
    api.delete(`/worlds/6/reset?session_id=${sessionId}`),

  // Attention
  analyzeAttention: (prompt, focusWord = '') =>
    api.post('/worlds/attention', { prompt, focus_word: focusWord }),
};

// ─── PLAYGROUND APIS ────────────────────────────────────────
export const playgroundAPI = {
  analyze: (prompt) =>
    api.post('/playground/analyze', { prompt }),
};

// ─── OLLAMA / REAL AI APIS ──────────────────────────────────
export const ollamaAPI = {
  status: () =>
    api.get('/ollama/status'),
  generate: (prompt, model = null) =>
    api.post('/ollama/generate', { prompt, model }),
  compare: (prompt, model = null) =>
    api.post('/ollama/compare', { prompt, model }),
};

// ─── ANALYTICS APIS ─────────────────────────────────────────
export const analyticsAPI = {
  recordMistake: (topic, questionId = null) =>
    api.post('/analytics/mistake', { topic, question_id: questionId }),
  getSummary: () =>
    api.get('/analytics/summary'),
  savePromptHistory: (entry) =>
    api.post('/analytics/prompt-history', entry),
  getPromptHistory: () =>
    api.get('/analytics/prompt-history'),
};

// ─── GAMIFICATION APIS ──────────────────────────────────────
export const gamificationAPI = {
  getLevels: () => api.get('/gamification/levels'),
  getBadges: () => api.get('/gamification/badges'),
  getLevelForXP: (xp) => api.get(`/gamification/level/${xp}`),
};
