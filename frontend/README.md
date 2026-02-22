# 🧠 PromptQuest: Interactive AI Engine

![PromptQuest Demo](https://img.shields.io/badge/Status-Active-success) ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi) ![Ollama](https://img.shields.io/badge/Ollama-Local_LLM-white)

Welcome to **PromptQuest** — a patentable, interactive educational simulation that deconstructs how artificial intelligence works. Instead of just talking to a chatbot, PromptQuest lets you "look under the hood" of Large Language Models (LLMs) and play gamified challenges to master the mechanics of AI.

## ✨ Core Features

### 🌌 1. The 14-World "Zero to Hero" Course
A step-by-step interactive curriculum designed to take complete beginners to advanced AI engineers.
- **World 1-3 (The Basics):** Learn about pattern recognition, predicting text, and Tokenization.
- **World 4-5 (The Core):** Master the Transformer Architecture and Self-Attention Mechanisms.
- **World 6-7 (The Brain):** Explore Vector Embeddings and the Context Window.
- **World 8-10 (The Math):** Engineer robust prompts, defeat hallucinations, and train mini neural networks.
- **World 13-14 (Advanced):** Implement Generative UI (Vercel v0 clone) and build a Retrieval-Augmented Generation (RAG) system.

### 🕹️ 2. The LLM Arcade (Patentable Concept)
The AI Playground features a dynamic arcade that generates mini-games in real-time using your local Ollama instance:
- 🏎️ **The Autoregressor:** A high-speed typing game where you combat a timer to guess the mathematically most probable *next token*.
- 🗜️ **The Context Squeezer:** A puzzle game where you optimize massive prompts down to strict token limits by deleting fluff.
- 🔗 **The Attention Mapper:** A grammar puzzle where you calculate the "attention weights" between pronouns and nouns in a sentence.
- *Difficulty explicitly scales up based on your performance, and fails yield detailed AI-generated explanations!*

### 📊 3. The Analytics Dashboard & Real-Time Pipeline
- Track your overall AI competency across different concepts (Tokens, Vectors, Math).
- Watch prompts actively get torn apart in the **Real-Time Data Pipeline**, passing through Tokenization, Embedding, Attention, and Generation nodes.

---

## 🚀 Getting Started

PromptQuest utilizes a decoupled architecture with a React/Vite Frontend and a FastAPI Python Backend. It also relies on a local LLM runner (Ollama) to ensure all data remains private and generation is free.

### Prerequisites
1. **Node.js** (v18+)
2. **Python** (3.10+)
3. **[Ollama](https://ollama.com/)** (Used to run the local Llama 3.2 model)

### 1️⃣ Start the AI Engine (Ollama)
Open a new terminal and run:
```bash
ollama serve
# If this is your first time, you may need to pull a model in another tab:
# ollama pull llama3.2
```

### 2️⃣ Start the Python Backend
Open a second terminal, navigate to the `backend` folder:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3️⃣ Start the React Frontend
Open a third terminal, navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```

The application will now be running at `http://localhost:5173/`. 

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, Vite, Framer Motion (Animations), TailwindCSS (Custom Design System) |
| **Backend** | Python, FastAPI, Uvicorn |
| **AI Engine** | Ollama (Local LLM inference without API keys) |
| **Vector DB** | ChromaDB (For the World 14 RAG simulation) |

---

*Built by your Antigravity Assistant.*
