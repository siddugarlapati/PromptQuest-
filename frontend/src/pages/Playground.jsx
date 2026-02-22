import React, { useState, useEffect } from 'react';
import { playgroundAPI, ollamaAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useGame } from '../context/GameContext';

export default function Playground() {
    const { addXP } = useGame();
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('tokens');
    const [hasEarnedXP, setHasEarnedXP] = useState(false);

    // Ollama state
    const [ollamaStatus, setOllamaStatus] = useState(null);
    const [ollamaResult, setOllamaResult] = useState(null);
    const [ollamaLoading, setOllamaLoading] = useState(false);
    const [compareResult, setCompareResult] = useState(null);
    const [compareLoading, setCompareLoading] = useState(false);

    const EXAMPLES = [
        'Explain quantum computing to a 10-year-old.',
        'You are a chef. List 3 healthy breakfast ideas with bullet points.',
        'Write a haiku about artificial intelligence.',
    ];

    useEffect(() => {
        ollamaAPI.status().then(r => setOllamaStatus(r.data)).catch(() => setOllamaStatus({ available: false }));
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
            const res = await ollamaAPI.generate(prompt);
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
            const res = await ollamaAPI.compare(prompt);
            setCompareResult(res.data);
            addXP(5);
        } catch {
            toast.error('Comparison failed.');
        }
        setCompareLoading(false);
    };

    const TABS = [
        { id: 'tokens', label: '🔤 Tokens' },
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

            {/* Input */}
            <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                <textarea className="input-field" rows={4} value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Enter your prompt here..."
                    style={{ resize: 'vertical', lineHeight: 1.6, marginBottom: 12 }} />
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

            {/* Results */}
            {(result || ollamaResult || compareResult) && (
                <div className="fade-in">
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
                        {TABS.map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)}
                                className={`btn btn-sm ${activeTab === t.id ? 'btn-gold' : 'btn-ghost'}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Token Tab */}
                    {activeTab === 'tokens' && result && (
                        <div className="glass-card" style={{ padding: 24 }}>
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                                <StatMini label="Token Count" value={result.tokens.token_count} color="#C02633" />
                                <StatMini label="Chars" value={result.tokens.char_count} color="#2563EB" />
                                <StatMini label="Chars/Token" value={result.tokens.compression_ratio} color="#7C3AED" />
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                {result.tokens.tokens.map((tok, i) => (
                                    <div key={i} className="token-chip" style={{ background: tok.color + '22', color: tok.color, border: `1px solid ${tok.color}55` }}>
                                        {tok.text}<span style={{ fontSize: '0.6rem', marginLeft: 4, opacity: 0.6 }}>[{tok.id}]</span>
                                    </div>
                                ))}
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
            )}
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
