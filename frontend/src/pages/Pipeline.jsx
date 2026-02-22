import React, { useState, useEffect } from 'react';

const STEPS = [
    { icon: '📝', label: 'Input', color: '#FF6B6B', desc: 'Your text prompt is received by the model' },
    { icon: '🔤', label: 'Tokenization', color: '#4ECDC4', desc: 'Text is split into tokens (subword units)' },
    { icon: '🔢', label: 'Embeddings', color: '#45B7D1', desc: 'Each token becomes a high-dimensional vector' },
    { icon: '🧠', label: 'Attention', color: '#96CEB4', desc: 'Transformer layers compute token relationships' },
    { icon: '🎯', label: 'Prediction', color: '#D4A017', desc: 'Softmax outputs probability for each token' },
    { icon: '✨', label: 'Output', color: '#BB8FCE', desc: 'Most likely tokens are selected and decoded' },
];

export default function Pipeline() {
    const [activeStep, setActiveStep] = useState(-1);
    const [running, setRunning] = useState(false);
    const [demoText, setDemoText] = useState('The capital of France is');
    const [demoTokens] = useState(['The', 'capital', 'of', 'France', 'is']);

    const runAnimation = () => {
        setRunning(true);
        setActiveStep(-1);
        STEPS.forEach((_, i) => {
            setTimeout(() => {
                setActiveStep(i);
                if (i === STEPS.length - 1) {
                    setTimeout(() => setRunning(false), 800);
                }
            }, i * 900);
        });
    };

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, position: 'relative', zIndex: 1 }}>
            <h1 className="section-title" style={{ marginBottom: 6 }}>⚙️ Visual AI <span className="text-gradient">Pipeline</span></h1>
            <p style={{ color: '#B8A090', marginBottom: 32 }}>See exactly how a Large Language Model processes your input from start to finish.</p>

            {/* Demo Input */}
            <div className="glass-card" style={{ padding: 24, marginBottom: 32, textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#7A6858', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Example Prompt</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F8F6F0', marginBottom: 20 }}>"{demoText}"</div>
                <button className="btn btn-gold btn-lg" onClick={runAnimation} disabled={running}>
                    {running ? '⚙️ Processing...' : '▶ Run Pipeline Animation'}
                </button>
            </div>

            {/* Pipeline Steps */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 40 }}>
                {STEPS.map((step, i) => {
                    const isActive = activeStep === i;
                    const isDone = activeStep > i;
                    return (
                        <div
                            key={i}
                            className="glass-card"
                            style={{
                                padding: 24,
                                transition: 'all 0.5s',
                                border: isActive ? `2px solid ${step.color}` : isDone ? `1px solid ${step.color}44` : '1px solid rgba(255,255,255,0.06)',
                                boxShadow: isActive ? `0 0 24px ${step.color}33` : 'none',
                                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: '50%', background: isActive ? `${step.color}22` : 'rgba(255,255,255,0.04)',
                                    border: `2px solid ${isActive ? step.color : 'rgba(255,255,255,0.08)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                                    transition: 'all 0.5s',
                                }}>
                                    {isDone ? '✅' : step.icon}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: step.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Step {i + 1}</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>{step.label}</div>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#B8A090', lineHeight: 1.5 }}>{step.desc}</p>

                            {/* Step-specific visualization */}
                            {isActive && (
                                <div style={{ marginTop: 12, padding: '10px 14px', background: `${step.color}11`, border: `1px solid ${step.color}33`, borderRadius: 8, fontSize: '0.8rem', color: step.color, fontWeight: 600 }}>
                                    {i === 0 && `📝 Processing: "${demoText}"`}
                                    {i === 1 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{demoTokens.map((t, j) => <span key={j} style={{ background: `${step.color}22`, border: `1px solid ${step.color}44`, borderRadius: 4, padding: '2px 8px' }}>{t}</span>)}</div>}
                                    {i === 2 && '🔢 [0.23, -0.67, 0.91, ...] × 768 dims per token'}
                                    {i === 3 && '🧠 Multi-head self-attention across all 5 tokens'}
                                    {i === 4 && 'Paris: 91% | London: 5% | Rome: 4%'}
                                    {i === 5 && '✨ Output: "Paris" (highest probability)'}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Concepts section */}
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 20 }}>🧠 Key LLM Concepts</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {[
                    { title: 'Transformer Architecture', icon: '🏗️', desc: 'LLMs use stacked transformer blocks with self-attention mechanisms to understand context across long sequences.' },
                    { title: 'Context Window', icon: '🪟', desc: 'The maximum number of tokens a model can process at once. GPT-4 can handle 128K tokens — roughly 300 pages of text.' },
                    { title: 'Temperature', icon: '🌡️', desc: 'Controls randomness. Low temperature = predictable (factual). High temperature = creative (varied). Default = 0.7.' },
                    { title: 'Parameters', icon: '⚙️', desc: 'GPT-4 has ~1.76 trillion parameters — adjustable weights learned during training on hundreds of billions of text tokens.' },
                    { title: 'Hallucination', icon: '👻', desc: 'When AI generates plausible-sounding but false information. Caused by over-generalization from training data patterns.' },
                    { title: 'Few-shot Learning', icon: '🎯', desc: 'Giving the model 2-3 examples in the prompt teaches it the task pattern without fine-tuning the model weights.' },
                ].map((c, i) => (
                    <div key={i} className="glass-card" style={{ padding: 20 }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{c.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6, color: '#D4A017' }}>{c.title}</div>
                        <p style={{ fontSize: '0.82rem', color: '#B8A090', lineHeight: 1.6 }}>{c.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
