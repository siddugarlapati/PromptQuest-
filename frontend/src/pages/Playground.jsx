import React, { useState, useEffect } from 'react';
import { playgroundAPI, ollamaAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useGame } from '../context/GameContext';

const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

export default function Playground() {
    const { addXP } = useGame();
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('arcade');
    const [hasEarnedXP, setHasEarnedXP] = useState(false);

    // Dynamic Parameter State
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(512);
    const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI teacher explaining concepts clearly and simply.');

    // Ollama state
    const [ollamaStatus, setOllamaStatus] = useState(null);
    const [ollamaResult, setOllamaResult] = useState(null);
    const [ollamaLoading, setOllamaLoading] = useState(false);
    const [compareResult, setCompareResult] = useState(null);
    const [compareLoading, setCompareLoading] = useState(false);

    // Arcade specific state
    const [arcadeGame, setArcadeGame] = useState(null); // 'autoregressor' | 'squeezer' | 'attention' | null
    const [arcadeTimer, setArcadeTimer] = useState(0);
    const [arcadeScore, setArcadeScore] = useState(0);
    const [arcadeLevel, setArcadeLevel] = useState(1);
    const [arcadeFailure, setArcadeFailure] = useState(false);
    const [arcadeExplanation, setArcadeExplanation] = useState('');
    const [arcadeLoading, setArcadeLoading] = useState(false);

    // Game 1: Autoregressor
    const [arSentence, setArSentence] = useState('');
    const [arAnswer, setArAnswer] = useState('');
    const [arCorrect, setArCorrect] = useState('');

    // Game 2: Squeezer
    const [sqOriginalTokens, setSqOriginalTokens] = useState(0);
    const [sqTargetTokens, setSqTargetTokens] = useState(0);

    // Game 3: Attention Mapper
    const [amSentence, setAmSentence] = useState('');
    const [amTarget, setAmTarget] = useState('');
    const [amOptions, setAmOptions] = useState([]);
    const [amCorrect, setAmCorrect] = useState('');

    const EXAMPLES = [
        'Explain quantum computing to a 10-year-old.',
        'You are a chef. List 3 healthy breakfast ideas with bullet points.',
        'Write a haiku about artificial intelligence.',
    ];

    // Arcade Timers
    useEffect(() => {
        let interval = null;
        if (arcadeGame && arcadeTimer > 0 && !arcadeFailure && !arcadeLoading) {
            interval = setInterval(() => {
                setArcadeTimer(t => t - 1);
            }, 1000);
        } else if (arcadeTimer === 0 && arcadeGame && !arcadeFailure && !arcadeLoading) {
            handleArcadeTimeout();
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [arcadeGame, arcadeTimer, arcadeFailure, arcadeLoading]);

    const fetchArcadeQuestion = async (gameId, level, score) => {
        try {
            const res = await playgroundAPI.generateArcadeQuestion(gameId, level, score);
            if (res.data.success) {
                return res.data.question;
            } else {
                toast.error(res.data.error || "Failed to generate question");
                return null;
            }
        } catch (e) {
            toast.error("Error calling AI Generator. Make sure Ollama is running.");
            return null;
        }
    };

    const startArcade = async (gameId) => {
        setArcadeGame(gameId);
        setArcadeScore(0);
        setArcadeLevel(1);
        setArcadeFailure(false);
        setArcadeTimer(0);
        setArcadeLoading(true);
        try {
            if (gameId === 'autoregressor') await setupAutoregressor(1, 0);
            if (gameId === 'squeezer') await setupSqueezer(1, 0);
            if (gameId === 'attention') await setupAttention(1, 0);
        } finally {
            setArcadeLoading(false);
        }
    };

    const setupAutoregressor = async (level, score) => {
        const q = await fetchArcadeQuestion('autoregressor', level, score);
        if (!q) { setArcadeFailure(true); return; }
        setArSentence(q.s);
        setArCorrect(q.a);
        setArcadeExplanation(q.exp);
        setArAnswer('');
        setArcadeFailure(false);
        setArcadeTimer(Math.max(12 - level, 4));
    };

    const setupSqueezer = async (level, score) => {
        const q = await fetchArcadeQuestion('squeezer', level, score);
        if (!q) { setArcadeFailure(true); return; }
        setPrompt(q.p);
        const originalTokens = q.p.split(/\s+/).filter(Boolean).length;
        setSqTargetTokens(Math.max(originalTokens - q.diff - (level * 2), 5));
        setArcadeExplanation(q.exp);
        setArcadeFailure(false);
        setArcadeTimer(Math.max(30 - (level * 2), 10));
    };

    const setupAttention = async (level, score) => {
        const q = await fetchArcadeQuestion('attention', level, score);
        if (!q) { setArcadeFailure(true); return; }
        setAmSentence(q.s);
        setAmTarget(q.target);
        setAmOptions(q.options);
        setAmCorrect(q.correct);
        setArcadeExplanation(q.exp);
        setArcadeFailure(false);
        setArcadeTimer(Math.max(15 - level, 5));
    };

    const handleArcadeTimeout = () => {
        setArcadeFailure(true);
        toast.error('⏰ Time is up!');
    };

    const handleArSubmit = async () => {
        if (arAnswer.trim().toLowerCase() === arCorrect.toLowerCase()) {
            toast.success('Nice! Fast prediction. ⚡');
            const newScore = arcadeScore + (100 * arcadeLevel);
            const newLevel = arcadeLevel + 1;
            setArcadeScore(newScore);
            setArcadeLevel(newLevel);
            addXP(20 * arcadeLevel);

            setArcadeTimer(0);
            setArcadeLoading(true);
            try {
                await setupAutoregressor(newLevel, newScore);
            } finally {
                setArcadeLoading(false);
            }
        } else {
            setArcadeFailure(true);
        }
    };

    const handleSqSubmit = async () => {
        const currentTokens = prompt.split(/\s+/).filter(Boolean).length;
        if (currentTokens <= sqTargetTokens) {
            toast.success(`Success! Squeezed to ${currentTokens} tokens. 🗜️`);
            const newScore = arcadeScore + (200 * arcadeLevel);
            const newLevel = arcadeLevel + 1;
            setArcadeScore(newScore);
            setArcadeLevel(newLevel);
            addXP(30 * arcadeLevel);

            setArcadeTimer(0);
            setArcadeLoading(true);
            try {
                await setupSqueezer(newLevel, newScore);
            } finally {
                setArcadeLoading(false);
            }
        } else {
            toast.error(`Too long! Used ${currentTokens}, target was ${sqTargetTokens}.`);
            setArcadeFailure(true);
        }
    };

    const handleAmSubmit = async (answer) => {
        if (answer.toLowerCase() === amCorrect.toLowerCase()) {
            toast.success('Perfect mapping! 🧠');
            const newScore = arcadeScore + (150 * arcadeLevel);
            const newLevel = arcadeLevel + 1;
            setArcadeScore(newScore);
            setArcadeLevel(newLevel);
            addXP(25 * arcadeLevel);

            setArcadeTimer(0);
            setArcadeLoading(true);
            try {
                await setupAttention(newLevel, newScore);
            } finally {
                setArcadeLoading(false);
            }
        } else {
            setArcadeFailure(true);
        }
    };

    useEffect(() => {
        ollamaAPI.checkStatus().then(r => setOllamaStatus(r.data)).catch(() => setOllamaStatus({ available: false }));
    }, []);

    const handleAnalyze = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        try {
            const res = await playgroundAPI.analyze(prompt);
            setResult(res.data);
            if (!hasEarnedXP) {
                addXP(10);
                setHasEarnedXP(true);
                toast.success('+10 XP for using the Playground!', { icon: '🎮' });
            }
        } catch {
            toast.error('Backend not reachable! Start the FastAPI server.');
        }
        setLoading(false);
    };

    const handleOllamaGenerate = async () => {
        if (!prompt.trim()) return;
        setOllamaLoading(true);
        try {
            const res = await ollamaAPI.generate(prompt, null, systemPrompt, temperature, maxTokens);
            setOllamaResult(res.data);
            if (res.data.success) toast.success('Real AI response received!', { icon: '🤖' });
        } catch {
            toast.error('Ollama API error.');
        }
        setOllamaLoading(false);
    };

    const handleCompare = async () => {
        if (!prompt.trim()) return;
        setCompareLoading(true);
        try {
            const res = await ollamaAPI.compare(prompt, null, systemPrompt, temperature, maxTokens);
            setCompareResult(res.data);
            addXP(5);
        } catch {
            toast.error('Comparison failed.');
        }
        setCompareLoading(false);
    };

    const TABS = [
        { id: 'arcade', label: '🕹️ LLM Arcade' },
        { id: 'tokens', label: '🔤 Tokens' },
        { id: 'embeddings', label: '🗺️ Embeddings' },
        { id: 'context', label: '🧠 Context' },
        { id: 'score', label: '✍️ Prompt Score' },
        { id: 'output', label: '🤖 AI Output' },
        { id: 'pipeline', label: '⚙️ Pipeline' },
        { id: 'real-ai', label: '🌐 Real AI' },
        { id: 'compare', label: '⚖️ Compare' },
    ];

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, position: 'relative', zIndex: 1 }}>
            <h1 className="section-title" style={{ marginBottom: 6 }}>🎮 AI <span className="text-gradient">Playground</span></h1>
            <p style={{ color: '#555566', marginBottom: 28 }}>Enter any prompt and see how AI processes it — tokens, score, and simulated output.</p>

            {/* Examples */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {EXAMPLES.map((ex, i) => (
                    <button key={i} className="btn btn-ghost btn-sm" onClick={() => setPrompt(ex)}
                        style={{ fontSize: '0.78rem' }}>
                        {ex.substring(0, 45)}...
                    </button>
                ))}
            </div>

            {/* Split Layout: Controls + Input */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: 24, marginBottom: 24 }}>
                {/* Control Panel */}
                <div className="glass-card" style={{ padding: 20 }}>
                    <div style={{ fontSize: '0.8rem', color: '#1A1A2E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>🎛️ Control Panel</div>

                    {/* System Prompt */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: '0.75rem', color: '#555566', fontWeight: 600 }}>System Prompt</span>
                        </div>
                        <input className="input-field" style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                            value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
                            placeholder="You are a helpful AI..." />
                    </div>

                    {/* Temperature */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: '0.75rem', color: '#555566', fontWeight: 600 }}>Temperature</span>
                            <span style={{ fontSize: '0.75rem', color: '#C02633', fontWeight: 700 }}>{temperature.toFixed(1)}</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#C02633' }} />

                        {/* Dynamic Temperature Explainer Module */}
                        <div style={{ marginTop: 8, padding: 12, background: 'rgba(192,38,51,0.03)', borderRadius: 8, border: '1px solid rgba(192,38,51,0.1)' }}>
                            <div style={{ fontSize: '0.7rem', color: '#C02633', fontWeight: 700, marginBottom: 4 }}>
                                {temperature <= 0.2 ? 'Strict & Factual' : temperature <= 0.6 ? 'Balanced' : 'Creative & Wild'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#555566', lineHeight: 1.4 }}>
                                {temperature <= 0.2 ? 'Always picks the most mathematically probable next word. Best for coding or math.' :
                                    temperature <= 0.6 ? 'A nice mix of predictability and natural variation.' :
                                        'Takes risks! Great for brainstorming, but watch out for hallucinations.'}
                            </div>
                        </div>
                    </div>

                    {/* Max Tokens */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: '0.75rem', color: '#555566', fontWeight: 600 }}>Max Tokens</span>
                            <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700 }}>{maxTokens}</span>
                        </div>
                        <input type="range" min="128" max="2048" step="128" value={maxTokens} onChange={e => setMaxTokens(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#2563EB' }} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
                    <textarea className="input-field" value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="Enter your prompt here..."
                        style={{ resize: 'vertical', lineHeight: 1.6, marginBottom: 12, flex: 1, minHeight: 120 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                        <span style={{ fontSize: '0.75rem', color: '#9999AA' }}>{prompt.split(/\s+/).filter(Boolean).length} words · {prompt.length} chars</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-ghost" onClick={handleOllamaGenerate} disabled={ollamaLoading || !prompt.trim()}>
                                {ollamaLoading ? '⏳' : '🌐 Real AI'}
                            </button>
                            <button className="btn btn-gold btn-lg" onClick={handleAnalyze} disabled={loading || !prompt.trim()}>
                                {loading ? '⚙️ Analyzing...' : '🚀 Analyze Prompt'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results / Arcade View */}
            <div className="fade-in">
                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => {
                            setActiveTab(t.id);
                            if (t.id !== 'arcade') setArcadeGame(null);
                        }}
                            className={`btn btn-sm ${activeTab === t.id ? 'btn-gold' : 'btn-ghost'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Arcade Tab */}
                {activeTab === 'arcade' && (
                    <div className="glass-card" style={{ padding: 24, background: arcadeGame ? '#1A1A2E' : '#FFF', color: arcadeGame ? '#FFF' : '#1A1A2E', transition: 'background 0.3s' }}>
                        {!arcadeGame ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🕹️</div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>The LLM Arcade</h2>
                                <p style={{ color: '#555566', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
                                    Stop treating AI like a magic box. Step into the matrix, beat the clock, and literally simulate how an LLM thinks.
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                                    <div className="glass-card" style={{ background: '#F8F9FA', padding: 20, textAlign: 'left', border: '2px solid #E5E7EB', cursor: 'pointer' }} onClick={() => startArcade('autoregressor')}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#C02633', marginBottom: 8 }}>⚡ 1. The Autoregressor</div>
                                        <div style={{ fontSize: '0.85rem', color: '#555566', marginBottom: 16 }}>AI only thinks 1 word ahead. Can you beat the math by predicting the most probable Next Token before the clock runs out?</div>
                                        <button className="btn btn-primary" style={{ width: '100%' }}>Play Game 1</button>
                                    </div>
                                    <div className="glass-card" style={{ background: '#F8F9FA', padding: 20, textAlign: 'left', border: '2px solid #E5E7EB', cursor: 'pointer' }} onClick={() => startArcade('squeezer')}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2563EB', marginBottom: 8 }}>🗜️ 2. The Context Squeezer</div>
                                        <div style={{ fontSize: '0.85rem', color: '#555566', marginBottom: 16 }}>Your Context Window is shrinking! Delete unnecessary words from the prompt before the timer explodes, keeping only the raw logic.</div>
                                        <button className="btn btn-primary" style={{ width: '100%' }}>Play Game 2</button>
                                    </div>
                                    <div className="glass-card" style={{ background: '#F8F9FA', padding: 20, textAlign: 'left', border: '2px solid #E5E7EB', cursor: 'pointer' }} onClick={() => startArcade('attention')}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a', marginBottom: 8 }}>🧠 3. Attention Mapper</div>
                                        <div style={{ fontSize: '0.85rem', color: '#555566', marginBottom: 16 }}>Map grammatical connections the same way Self-Attention works. Which word does the target refer to?</div>
                                        <button className="btn btn-primary" style={{ width: '100%' }}>Play Game 3</button>
                                    </div>
                                </div>
                            </div>
                        ) : arcadeFailure ? (
                            <div className="fade-in" style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{ fontSize: '4rem', marginBottom: 16 }}>💥</div>
                                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ef4444', marginBottom: 8 }}>System Failed</h2>
                                <div style={{ fontSize: '1.1rem', marginBottom: 24, color: '#FFF' }}>You reached <strong>Level {arcadeLevel}</strong> with a score of <strong>{arcadeScore}</strong>.</div>

                                <div className="glass-card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: 24, margin: '0 auto 32px', maxWidth: 600, textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>Why did this happen?</div>
                                    {arcadeGame === 'autoregressor' && (
                                        <div style={{ marginBottom: 12, color: '#FFF' }}><strong>Correct Prediction:</strong> <span style={{ color: '#4ade80' }}>{arCorrect}</span></div>
                                    )}
                                    {arcadeGame === 'attention' && (
                                        <div style={{ marginBottom: 12, color: '#FFF' }}><strong>Correct Mapping:</strong> <span style={{ color: '#4ade80' }}>{amCorrect}</span></div>
                                    )}
                                    <div style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#E5E7EB' }}>{arcadeExplanation}</div>
                                </div>

                                <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                                    <button className="btn btn-ghost" onClick={() => setArcadeGame(null)} style={{ color: '#FFF' }}>Back to Menu</button>
                                    <button className="btn btn-primary" onClick={() => startArcade(arcadeGame)}>Try Again</button>
                                </div>
                            </div>
                        ) : arcadeLoading ? (
                            <div className="fade-in" style={{ textAlign: 'center', padding: '60px 0' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 16, animation: 'spin 2s linear infinite' }}>⚙️</div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF', marginBottom: 8 }}>AI is generating...</h2>
                                <p style={{ color: '#9999AA', maxWidth: 400, margin: '0 auto' }}>Using billions of parameters to craft a unique challenge tailored to Level {arcadeLevel}.</p>
                            </div>
                        ) : (
                            <div className="fade-in">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 16 }}>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>Level {arcadeLevel}</div>
                                        <div style={{ background: 'rgba(22,163,74,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, color: '#4ade80' }}>Score: {arcadeScore}</div>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: arcadeTimer < 5 ? '#ef4444' : '#FFF', fontFamily: 'monospace' }}>
                                        ⏱️ {arcadeTimer}s
                                    </div>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setArcadeGame(null)} style={{ color: '#999' }}>Quit</button>
                                </div>

                                {arcadeGame === 'autoregressor' && (
                                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 24 }}>Predict the Next Token</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 600, lineHeight: 1.5, marginBottom: 32 }}>
                                            {arSentence} <span style={{ background: 'rgba(192,38,51,0.2)', padding: '2px 8px', borderRadius: 4, display: 'inline-block', minWidth: 100, borderBottom: '2px solid #C02633' }}>{arAnswer || '...'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, maxWidth: 400, margin: '0 auto' }}>
                                            <input className="input-field" autoFocus value={arAnswer} onChange={e => setArAnswer(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleArSubmit()}
                                                placeholder="Type the next word..." style={{ background: 'rgba(255,255,255,0.05)', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)' }} />
                                            <button className="btn btn-gold" onClick={handleArSubmit}>Submit</button>
                                        </div>
                                    </div>
                                )}

                                {arcadeGame === 'squeezer' && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <div style={{ fontSize: '0.9rem', color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>Squeeze the Context Window</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: prompt.split(/\s+/).filter(Boolean).length <= sqTargetTokens ? '#4ade80' : '#ef4444' }}>
                                                Target: {sqTargetTokens} words | Current: {prompt.split(/\s+/).filter(Boolean).length}
                                            </div>
                                        </div>
                                        <textarea className="input-field" value={prompt} onChange={e => setPrompt(e.target.value)} rows={6}
                                            style={{ background: 'rgba(255,255,255,0.05)', color: '#FFF', border: prompt.split(/\s+/).filter(Boolean).length <= sqTargetTokens ? '2px solid #4ade80' : '1px solid rgba(255,255,255,0.2)', marginBottom: 16 }} />
                                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSqSubmit} disabled={prompt.split(/\s+/).filter(Boolean).length > sqTargetTokens}>
                                            Complete Squeeze
                                        </button>
                                    </div>
                                )}

                                {arcadeGame === 'attention' && (
                                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 24 }}>Map the Attention Weight</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 600, lineHeight: 1.6, marginBottom: 32, padding: '0 20px', color: '#E5E7EB' }}>
                                            {amSentence.split(new RegExp(`\\b(${amTarget})\\b`, 'gi')).map((part, i) =>
                                                part.toLowerCase() === amTarget.toLowerCase()
                                                    ? <span key={i} style={{ background: '#16a34a', color: '#FFF', padding: '2px 8px', borderRadius: 6, fontWeight: 800 }}>{part}</span>
                                                    : <span key={i}>{part}</span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '1rem', color: '#E5E7EB', marginBottom: 16 }}>What noun does <strong style={{ color: '#4ade80' }}>"{amTarget}"</strong> attend to most strongly?</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
                                            {amOptions.map((opt, i) => (
                                                <button key={i} className="btn btn-ghost" onClick={() => handleAmSubmit(opt)} style={{ fontSize: '1.1rem', padding: '10px 24px', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF' }}>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Token Tab */}
                {activeTab === 'tokens' && result && (
                    <div className="glass-card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                            <StatMini label="Token Count" value={result.tokens.stats.token_count} color="#C02633" />
                            <StatMini label="Chars" value={result.tokens.stats.char_count} color="#2563EB" />
                            <StatMini label="Chars/Token" value={result.tokens.stats.compression_ratio} color="#7C3AED" />
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {result.tokens.subword_tokens.map((tok, i) => (
                                <div key={i} className="token-chip" style={{ background: tok.color + '22', color: tok.color, border: `1px solid ${tok.color}55` }}>
                                    {tok.text === ' ' ? '␣' : tok.text}<span style={{ fontSize: '0.6rem', marginLeft: 4, opacity: 0.6 }}>[{tok.id}]</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Embeddings Tab */}
                {activeTab === 'embeddings' && result && (
                    <div className="glass-card" style={{ padding: 24 }}>
                        <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>🗺️ 2D Semantic Mappings</div>
                        <div style={{ position: 'relative', width: '100%', height: 300, background: '#F8F9FA', border: '1px solid #E5E7EB', borderRadius: 12, backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '15px 15px' }}>
                            {result.embeddings.map((emb, i) => (
                                <div key={i} style={{ position: 'absolute', left: `${emb.x}%`, bottom: `${emb.y}%`, transform: 'translate(-50%, 50%)', background: '#10b981', color: '#fff', padding: '4px 8px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                    {emb.word}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Context Tab */}
                {activeTab === 'context' && result && (
                    <div className="glass-card" style={{ padding: 24 }}>
                        <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>🧠 Context Window Limit</div>

                        <div style={{ marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8, fontWeight: 600 }}>
                                <span>Used: {result.context.total_tokens_used} Tokens</span>
                                <span>Limit: {result.context.max_capacity} Tokens</span>
                            </div>
                            <div style={{ width: '100%', height: 10, background: '#E5E7EB', borderRadius: 100, overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(result.context.utilization_percent, 100)}%`, height: '100%', background: result.context.utilization_percent > 90 ? '#dc2626' : '#ec4899' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Score Tab */}
                {activeTab === 'score' && result && (
                    <div className="glass-card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: '#C02633' }}>{result.score.grade}</div>
                                <div style={{ fontSize: '0.85rem', color: '#555566' }}>{result.score.grade_label}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1A1A2E' }}>{result.score.total_score}<span style={{ fontSize: '1rem', color: '#9999AA' }}>/100</span></div>
                                <div className="xp-bar-wrapper" style={{ marginTop: 8 }}>
                                    <div className="xp-bar-fill" style={{ width: `${result.score.total_score}%` }} />
                                </div>
                            </div>
                        </div>
                        {result.score.feedback.map((f, i) => (
                            <div key={i} style={{ fontSize: '0.85rem', color: '#555566', padding: '6px 0', borderBottom: '1px solid #F0F0F4' }}>{f}</div>
                        ))}
                    </div>
                )}

                {/* Output Tab */}
                {activeTab === 'output' && result && (
                    <div className="glass-card" style={{ padding: 24 }}>
                        <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>🤖 Simulated AI Output</div>
                        <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '20px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#1A1A2E', lineHeight: 1.7, whiteSpace: 'pre-wrap', border: '1px solid #E5E7EB' }}>
                            {result.simulated_output}
                        </div>
                        <div style={{ marginTop: 16, fontSize: '0.75rem', color: '#9999AA', fontStyle: 'italic' }}>
                            ℹ️ This is a simulated output for learning purposes. A real LLM generates this token by token using billions of parameters.
                        </div>
                    </div>
                )}

                {/* Pipeline Tab */}
                {activeTab === 'pipeline' && result && (
                    <div className="glass-card" style={{ padding: 24 }}>
                        <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>⚙️ Processing Pipeline</div>
                        <div className="pipeline-wrapper">
                            {result.pipeline_steps.map((step, i) => (
                                <React.Fragment key={i}>
                                    <div className="pipeline-step">
                                        <div className="pipeline-step-icon" style={{ animationDelay: `${i * 0.3}s` }}>
                                            {['📝', '🔤', '🔢', '🧠', '✨'][i]}
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', color: '#1A1A2E' }}>{step.step}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#9999AA', textAlign: 'center', maxWidth: 90 }}>{step.description}</div>
                                    </div>
                                    {i < result.pipeline_steps.length - 1 && <div className="pipeline-arrow">→</div>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}

                {/* Real AI Tab */}
                {activeTab === 'real-ai' && (
                    <div className="glass-card" style={{ padding: 24 }}>
                        {/* Ollama status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '10px 14px', background: ollamaStatus?.available ? 'rgba(22,163,74,0.06)' : 'rgba(220,38,38,0.06)', border: `1px solid ${ollamaStatus?.available ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`, borderRadius: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: ollamaStatus?.available ? '#16a34a' : '#dc2626', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.83rem', color: '#555566', flex: 1 }}>
                                {ollamaStatus?.available
                                    ? `Ollama running — model: ${ollamaStatus.suggested_model}`
                                    : 'Ollama not running. Start with: ollama serve'}
                            </span>
                            {ollamaStatus?.available && (
                                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>✅ Ready</span>
                            )}
                        </div>

                        {!ollamaResult ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9999AA' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🌐</div>
                                <div style={{ marginBottom: 16, fontSize: '0.9rem' }}>
                                    {ollamaStatus?.available
                                        ? 'Click "Real AI" above or the button below to get a response from your local LLM.'
                                        : 'Install Ollama to use real AI. Run: ollama serve'}
                                </div>
                                <button className="btn btn-primary" onClick={handleOllamaGenerate} disabled={!prompt.trim() || ollamaLoading}>
                                    {ollamaLoading ? '⏳ Generating...' : '🌐 Generate with Real AI'}
                                </button>
                                {!ollamaStatus?.available && (
                                    <div style={{ marginTop: 16, fontSize: '0.8rem', color: '#9999AA', fontFamily: 'monospace', background: '#F8F9FA', padding: '12px 16px', borderRadius: 8, textAlign: 'left' }}>
                                        <div style={{ color: '#555566', marginBottom: 4 }}># Setup commands:</div>
                                        <div>ollama pull llama3.2</div>
                                        <div>ollama serve</div>
                                    </div>
                                )}
                            </div>
                        ) : ollamaResult.success ? (
                            <div className="fade-in">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1 }}>🤖 Real AI Response</div>
                                    <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>Model: {ollamaResult.model} · {ollamaResult.total_duration_ms}ms</div>
                                </div>
                                <div style={{ background: '#F8F9FA', borderRadius: 10, padding: 20, fontSize: '0.9rem', color: '#1A1A2E', lineHeight: 1.7, whiteSpace: 'pre-wrap', border: '1px solid #E5E7EB' }}>
                                    {ollamaResult.response}
                                </div>
                                <div style={{ marginTop: 12, fontSize: '0.75rem', color: '#9999AA' }}>
                                    ✨ This response was generated by a real local LLM — no internet required.
                                </div>
                            </div>
                        ) : (
                            <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: 20, color: '#dc2626' }}>
                                ❌ {ollamaResult.error}
                            </div>
                        )}
                    </div>
                )}

                {/* Compare Tab */}
                {activeTab === 'compare' && (
                    <div>
                        {!compareResult ? (
                            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚖️</div>
                                <div style={{ fontSize: '0.9rem', color: '#555566', marginBottom: 20 }}>
                                    See how simulation output compares to real AI output side-by-side.
                                </div>
                                <button className="btn btn-primary" onClick={handleCompare} disabled={compareLoading || !prompt.trim()}>
                                    {compareLoading ? '⏳ Comparing...' : '⚖️ Run Comparison'}
                                </button>
                            </div>
                        ) : (
                            <div className="fade-in">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                    <div className="glass-card" style={{ padding: 20, borderLeft: '3px solid #2563EB' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>⚙️ {compareResult.simulation.type}</div>
                                        <div style={{ fontSize: '0.83rem', color: '#1A1A2E', lineHeight: 1.6, background: '#F8F9FA', borderRadius: 8, padding: 12, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                            {compareResult.simulation.response}
                                        </div>
                                        <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#9999AA' }}>{compareResult.simulation.word_count} words</div>
                                        <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#555566', fontStyle: 'italic' }}>{compareResult.simulation.explanation}</div>
                                    </div>
                                    <div className="glass-card" style={{ padding: 20, borderLeft: '3px solid #16a34a' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>🧠 {compareResult.real_ai.type}</div>
                                        {compareResult.real_ai.available ? (
                                            <>
                                                <div style={{ fontSize: '0.85rem', color: '#1A1A2E', lineHeight: 1.6, background: '#F8F9FA', borderRadius: 8, padding: 12, whiteSpace: 'pre-wrap' }}>
                                                    {compareResult.real_ai.response}
                                                </div>
                                                <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#9999AA' }}>{compareResult.real_ai.word_count} words · {compareResult.real_ai.model}</div>
                                                <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#555566', fontStyle: 'italic' }}>{compareResult.real_ai.explanation}</div>
                                            </>
                                        ) : (
                                            <div style={{ color: '#9999AA', fontSize: '0.85rem', padding: 16 }}>
                                                Ollama not running. Start: <code>ollama serve</code>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="glass-card" style={{ padding: 16, background: 'rgba(192,38,51,0.03)' }}>
                                    <div style={{ fontSize: '0.78rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>💡 Key Insight</div>
                                    <div style={{ fontSize: '0.85rem', color: '#555566' }}>{compareResult.insight}</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatMini({ label, value, color }) {
    return (
        <div style={{ background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 10, padding: '12px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: '#9999AA', marginTop: 2 }}>{label}</div>
        </div>
    );
}
