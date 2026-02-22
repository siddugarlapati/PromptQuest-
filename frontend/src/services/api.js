import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

export default api;

// ─── WORLD APIS ────────────────────────────────────────────
export const worldsAPI = {
  // World 1
  getPatternQuestion: (difficulty = 'easy') => api.get(`/worlds/1/question?difficulty=${difficulty}`),
  submitPatternAnswer: (questionItem, answer) => api.post('/worlds/1/answer', { question_item: questionItem, answer }),

  // World 2
  getPredictionQuestion: () => api.get('/worlds/2/question'),
  submitPredictionAnswer: (prompt, answer) => api.post('/worlds/2/answer', { prompt, answer }),

  // World 3
  tokenize: (text) => api.post('/worlds/3/tokenize', { text }),

  // World 4: Transformers
  resolvePronouns: (sentence) => api.post('/worlds/4/resolve', { sentence }),

  // World 5: Attention
  analyzeAttention: (prompt, focusWord = '') => api.post('/worlds/5/analyze', { prompt, focus_word: focusWord }),

  // World 6: Embeddings
  mapEmbeddings: (words) => api.post('/worlds/6/map', { words }),

  // World 7: Context
  simulateContext: (messages, maxTokens = 50) => api.post('/worlds/7/simulate', { messages, max_tokens: maxTokens }),

  // World 8: Prompt Engineering (formerly 4)
  scorePrompt: (prompt) => api.post('/worlds/8/score', { prompt }),

  // World 9: Hallucination (formerly 5)
  getHallucinationQuestion: () => api.get('/worlds/9/question'),
  submitHallucinationAnswer: (questionId, answer) => api.post('/worlds/9/answer', { question_id: questionId, answer }),

  // World 10: Training (formerly 6)
  world10Train: (item, category, sessionId = 'default') => api.post('/worlds/10/train', { item, category, session_id: sessionId }),
  world10Predict: (item, sessionId = 'default') => api.post('/worlds/10/predict', { item, session_id: sessionId }),
  world10State: (sessionId = 'default') => api.get(`/worlds/10/state?session_id=${sessionId}`),
  world10Reset: (sessionId = 'default') => api.delete(`/worlds/10/reset?session_id=${sessionId}`),
};

// ─── PLAYGROUND APIS ────────────────────────────────────────
export const playgroundAPI = {
  analyze: (prompt) =>
    api.post('/playground/analyze', { prompt }),
  generateArcadeQuestion: (gameId, level, score) =>
    api.post('/playground/arcade-generate', { game_id: gameId, level, score }),
};

// ─── OLLAMA (LOCAL AI) APIS ──────────────────────────────────
export const ollamaAPI = {
  getModels: () => api.get('/ollama/models'),
  checkStatus: () => fetch('http://localhost:11434/', { method: 'GET', mode: 'no-cors' }),
  generate: (prompt, model = null, system = null, temperature = 0.7, maxTokens = 512) =>
    api.post('/ollama/generate', { prompt, model, system, temperature, max_tokens: maxTokens }),
  compare: (prompt, model = null, system = null, temperature = 0.7, maxTokens = 512) =>
    api.post('/ollama/compare', { prompt, model, system, temperature, max_tokens: maxTokens }),
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

// ─── RAG (VECTOR DB) APIS ───────────────────────────────────
export const ragAPI = {
  uploadDocument: (text) => api.post('/rag/upload', { document_text: text }),
  uploadPDF: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/rag/upload_pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  query: (text) => api.post('/rag/query', { query: text }),
  reset: () => api.delete('/rag/reset')
};

export const gamificationAPI = {
  getLevels: () => api.get('/gamification/levels'),
  getBadges: () => api.get('/gamification/badges'),
  getLevelForXP: (xp) => api.get(`/gamification/level/${xp}`),
  getProgress: () => api.get('/gamification/progress'),
  addXP: (amount) => api.post(`/gamification/xp?amount=${amount}`),
  completeWorld: (worldId) => api.post(`/gamification/world?world_id=${worldId}`),
};
