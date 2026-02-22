# 🎮 PromptQuest Ultimate
### *The AI Learning Laboratory — Anurag University*

<div align="center">

![PromptQuest Banner](frontend/public/au-logo.png)

**A gamified AI learning platform that teaches students how AI, LLMs, tokenization, and prompt engineering work — through interactive games, experiments, and real AI integration.**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Ollama](https://img.shields.io/badge/Local%20AI-Ollama-black?style=for-the-badge)](https://ollama.ai/)
[![License](https://img.shields.io/badge/License-MIT-C02633?style=for-the-badge)](LICENSE)

</div>

---

## 🌟 What is PromptQuest?

PromptQuest is a **virtual AI laboratory** for first-year students. Instead of lectures, students **play, experiment, and observe** to understand:

- 🧠 What AI is and how it thinks
- 🔤 How text becomes tokens
- 📊 How LLMs predict the next word
- ✍️ How to write powerful prompts
- 🕵️ How AI hallucinations happen
- 🏋️ How AI training actually works

---

## ✨ Features

### 🌍 12 Interactive Learning Worlds

| World | Topic | What You Learn |
|-------|-------|----------------|
| 🧠 World 1 | Pattern Intelligence | AI learns from examples |
| 📊 World 2 | Prediction Engine | Probability-based next-word prediction |
| 🔤 World 3 | Tokenization Lab | How text is split into tokens |
| 🤖 World 4 | Transformers | Self-Attention and Pronoun Resolution |
| 🎯 World 5 | Attention Lab | Visualizing attention weights |
| 🗺️ World 6 | Embeddings Lab | Mapping words in 2D semantic space |
| 🧠 World 7 | Context Window | Short-term memory limits and chat decay |
| ✍️ World 8 | Prompt Engineering | Write and score effective prompts |
| 🕵️ World 9 | Hallucination Detective | Spot AI mistakes |
| 🏋️ World 10 | Mini AI Trainer | Train your own mini AI model |
| 🗺️ World 11 | RAG & Vector DB | Learn Retrieval-Augmented Generation by uploading text to an embedded ChromaDB vector database and testing similarity search |
| 🏗️ World 12 | Build an LLM | Drag, drop, and connect an LLM pipeline Architecture using a visual node builder |

### 🚀 Core Platform Features

- **🎮 Gamification** — XP system, levels, badges (Prompt Master, AI Explorer, etc.)
- **🤖 Real AI Integration** — Local Ollama LLM (works offline, no API key)
- **🔄 Simulation vs Real AI** — Side-by-side comparison mode
- **📊 Prompt Engineering Dashboard** — Score history, improvement graph, templates
- **📈 Analytics** — Mistake tracker, AI Understanding Meter
- **⚙️ Visual AI Pipeline** — Animated step-by-step AI processing

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router |
| Backend | FastAPI, Uvicorn |
| Storage | SQLite (via aiosqlite/SQLAlchemy) |
| Local AI | Ollama (optional, graceful fallback) |
| Styling | Vanilla CSS, AU Brand Theme |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- (Optional) [Ollama](https://ollama.ai/) for real AI responses

### 1. Clone the Repository

```bash
git clone https://github.com/siddugarlapati/PromptQuest-.git
cd PromptQuest-
```

### 2. Quick Start Configuration

We have provided a unified startup script to boot the backend and frontend simultaneously without port conflicts. 

```bash
chmod +x run.sh
./run.sh
```

- Your app will be live at: **http://localhost:5173**
- Backend APIs run at: **http://localhost:8000**
- API Docs are available at: **http://localhost:8000/docs**

### 3. (Optional) Enable Real AI with Ollama

If you see an error in the Playground about Ollama not running, open a new terminal window and run:

```bash
# Install Ollama from https://ollama.ai/
ollama pull llama3.2        # Pull the model
ollama serve                # Start the background daemon
```

If Ollama is not running, the app gracefully falls back to simulation mode.

---

## 📂 Project Structure

```
PromptQuest-/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── requirements.txt
│   ├── routers/
│   │   ├── worlds.py              # World 1–6 game endpoints
│   │   ├── playground.py          # AI Playground endpoints
│   │   ├── gamification.py        # XP, badges, levels
│   │   ├── ollama.py              # Real AI (Ollama) integration
│   │   └── analytics.py           # Mistake tracking, prompt history
│   ├── simulation/
│   │   ├── pattern.py             # Pattern recognition engine
│   │   ├── prediction.py          # Next-word prediction engine
│   │   ├── tokenizer.py           # Text tokenization
│   │   ├── prompt_scorer.py       # Prompt quality scorer
│   │   ├── hallucination.py       # Hallucination question bank
│   │   ├── mini_trainer.py        # World 6 mini AI trainer
│   │   ├── attention.py           # Attention weight simulator
│   │   ├── confidence.py          # Confidence score simulator
│   │   └── ollama_client.py       # Ollama API client
│   └── database/
│       ├── db.py                  # SQLite connection
│       └── models.py              # SQLAlchemy models
└── frontend/
    ├── public/
    │   └── au-logo.png            # Anurag University logo
    └── src/
        ├── App.jsx                # Routes
        ├── index.css              # AU brand theme
        ├── components/
        │   └── Navbar.jsx
        ├── context/
        │   └── GameContext.jsx    # XP, level, mistakes, history
        ├── services/
        │   └── api.js             # API client
        └── pages/
            ├── Dashboard.jsx      # Main dashboard + AI Meter
            ├── WorldsHub.jsx      # World selection
            ├── Playground.jsx     # AI Playground (sim + real)
            ├── Pipeline.jsx       # Visual AI pipeline
            ├── PromptDashboard.jsx # Prompt Engineering Lab
            ├── Analytics.jsx      # Mistakes + AI Understanding
            └── worlds/
                ├── World1_Basics.jsx
                ├── World2_Prediction.jsx
                ├── World3_Tokenization.jsx
                ├── World4_PromptEngineering.jsx
                ├── World5_Hallucination.jsx
                └── World6_MiniTrainer.jsx
```

---

## 🎮 Gamification System

| Action | XP Earned |
|--------|-----------|
| Correct answer | +5–20 XP |
| Lesson complete | +10 XP |
| Perfect score | +25 XP |
| Prompt score ≥ 80 | +30 XP |

| Level | Title |
|-------|-------|
| 1–4 | Beginner |
| 5–9 | Learner |
| 10–14 | Advanced |
| 15–19 | AI Expert |
| 20+ | AI Scientist |

### Badges
- 🔍 **AI Explorer** — Complete World 1
- 📊 **Prediction Pro** — Complete World 2
- 🔤 **Token Master** — Complete World 3
- ✍️ **Prompt Master** — Score 80+ in World 4
- 🕵️ **Truth Seeker** — Complete World 5
- 🏋️ **AI Trainer** — Complete World 6

---

## 🤖 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/worlds/pattern` | Pattern question |
| POST | `/api/worlds/pattern/answer` | Submit pattern answer |
| GET | `/api/worlds/prediction` | Prediction question |
| GET | `/api/worlds/tokenize` | Tokenize text |
| POST | `/api/worlds/prompt/score` | Score a prompt |
| GET | `/api/worlds/hallucination` | Hallucination question |
| POST | `/api/worlds/train` | Train mini AI |
| POST | `/api/worlds/train/predict` | Test trained AI |
| POST | `/api/ollama/generate` | Real AI response |
| GET | `/api/ollama/status` | Check Ollama availability |
| POST | `/api/ollama/compare` | Simulation vs Real AI |
| POST | `/api/analytics/mistake` | Record a mistake |
| GET | `/api/analytics/summary` | Mistake summary |
| POST | `/api/analytics/prompt-history` | Save prompt score |
| GET | `/api/analytics/prompt-history` | Get prompt history |

---

## 🎨 Design

- **Brand**: Anurag University — Brick Red `#C02633` + Sunglow `#FFC82C`
- **Theme**: Clean white background, light cards, modern UI
- **Font**: Space Grotesk (headings) + Inter (body)
- **Animations**: Smooth transitions, progress bars, pipeline animation

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Made with ❤️ at **Anurag University**

*Teaching AI, one quest at a time.*

</div>
