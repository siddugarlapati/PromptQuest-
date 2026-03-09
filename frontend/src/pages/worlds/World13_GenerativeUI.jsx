import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { WorldHeader } from './World1_Basics';
import toast from 'react-hot-toast';
import { ollamaAPI } from '../../services/api';
import { Sandpack } from "@codesandbox/sandpack-react";

// Real-Time Vibe Coding Environment powered by Ollama and Sandpack
export default function World13_GenerativeUI() {
    const navigate = useNavigate();
    const { addXP, completeWorld } = useGame();

    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [streamedCode, setStreamedCode] = useState('');
    const [previewActive, setPreviewActive] = useState(false);
    const [attempted, setAttempted] = useState(false);
    const [showGame, setShowGame] = useState(false);

    const defaultCode = `import React from 'react';

export default function App() {
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1 style={{ color: '#ec4899' }}>Vibe Coding Interface</h1>
      <p style={{ color: '#555' }}>Type a prompt below to generate a real React app!</p>
    </div>
  );
}`;

    // Remove duplicate declaration

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setPreviewActive(false);
        setStreamedCode('// Asking local AI to write code... Please wait.\n// This might take 10-30 seconds depending on your machine.');

        try {
            const res = await ollamaAPI.generateUI(prompt);

            if (res.data && res.data.success && res.data.code) {
                setStreamedCode(res.data.code);
                setPreviewActive(true);

                if (!attempted) {
                    addXP(50);
                    completeWorld(13, 'ai_engineer');
                    toast.success('🛠️ Real-time App Generated! +50 XP');
                    setAttempted(true);
                }
            } else {
                toast.error(res.data?.error || "Failed to generate valid React code.");
                setStreamedCode(defaultCode);
            }
        } catch (err) {
            console.error(err);
            toast.error("Error communicating with Ollama.");
            setStreamedCode(defaultCode);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, position: 'relative', zIndex: 1 }}>
            <WorldHeader
                emoji="🛠️" title="World 13: Vibe Coding (Generative UI)"
                subtitle="Teach AI what you want, and watch it write and render the software instantly like Cursor or v0.dev."
                onBack={() => navigate('/worlds')}
            />

            {!showGame ? (
                <div className="fade-in">
                    <div className="glass-card" style={{ padding: 32, marginBottom: 24, borderLeft: '4px solid #ec4899' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ec4899', marginBottom: 16 }}>
                            "Vibe Coding" & Generative UI
                        </h2>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            For decades, creating software meant writing complex syntax line by line. But because AI models have been trained on millions of GitHub repositories, they can now <strong>write code fluently</strong>.
                        </p>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A1A2E', marginTop: 24, marginBottom: 12 }}>
                            The Shift from Writing to Directing
                        </h3>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            When you combine a powerful LLM with a real-time web browser, something magical happens. You just type what you want in plain English, the AI streams the React or HTML code, and the browser renders it instantly.
                            <br /><br />
                            This has led to a new paradigm called <strong>"Vibe Coding"</strong>—where anyone can build functional software just by describing the "vibe" or the rules of what they want, without knowing the underlying syntax.
                        </p>

                        <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', marginTop: 24 }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                💡 The Future of Software
                            </div>
                            <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                Tools like Cursor, v0.dev, and GitHub Copilot Workspaces use this exact mechanic. The barrier to entry for building apps has permanently dropped from "knowing how to code" to "knowing what you want to build."
                            </p>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" style={{ width: '100%', fontSize: '1.1rem', padding: 18, background: '#ec4899', color: 'white', border: 'none' }} onClick={() => setShowGame(true)}>
                        Let's Play: Generate an App 🚀
                    </button>
                </div>
            ) : (
                <div className="fade-in">

                    <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, borderLeft: '3px solid #ec4899' }}>
                        <div style={{ fontSize: '0.8rem', color: '#ec4899', fontWeight: 700, marginBottom: 6 }}>🧠 WHAT IS VIBE CODING?</div>
                        <p style={{ fontSize: '0.85rem', color: '#555566', lineHeight: 1.6 }}>
                            Instead of just writing text, modern AIs can generate raw React/HTML code. When put inside an environment that can execute that code on-the-fly, the AI becomes a real-time web developer.
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <input
                                className="input-field"
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                placeholder="E.g. Build me a sleek dark-mode Pomodoro timer..."
                                style={{ flex: 1 }}
                                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                                disabled={isGenerating}
                            />
                            <button className="btn btn-primary" onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
                                {isGenerating ? 'Generating...' : 'Generate UI ✨'}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 24, height: 500 }}>
                        {/* Code Window */}
                        <div className="glass-card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0f172a' }}>
                            <div style={{ background: '#1e293b', padding: '12px 16px', borderBottom: '1px solid #334155', display: 'flex', gap: 8, alignItems: 'center' }}>
                                <div style={{ width: 12, height: 12, borderRadius: 6, background: '#ef4444' }} />
                                <div style={{ width: 12, height: 12, borderRadius: 6, background: '#eab308' }} />
                                <div style={{ width: 12, height: 12, borderRadius: 6, background: '#22c55e' }} />
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: 12, fontFamily: 'monospace' }}>AI_Engineer.jsx</span>
                            </div>
                            <pre style={{ padding: 20, margin: 0, color: '#38bdf8', fontSize: '0.85rem', overflowY: 'auto', flex: 1 }}>
                                <code>{streamedCode}</code>
                                {isGenerating && <span style={{ borderRight: '2px solid #38bdf8', animation: 'blink 1s step-end infinite' }}>&nbsp;</span>}
                            </pre>
                        </div>

                        {/* Preview Window powered by Sandpack */}
                        <div className="glass-card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <Sandpack
                                template="react"
                                theme="dark"
                                files={{
                                    "/App.js": streamedCode
                                }}
                                customSetup={{
                                    dependencies: { "react": "^18.0.0", "react-dom": "^18.0.0" }
                                }}
                                options={{
                                    showNavigator: false,
                                    showTabs: true,
                                    editorHeight: "100%",
                                    autoReload: true,
                                }}
                            />
                        </div>

                    </div>

                    <style>{`
                @keyframes blink { 50% { border-color: transparent; } }
            `}</style>
                </div>
            )}
        </div>
    );
}
