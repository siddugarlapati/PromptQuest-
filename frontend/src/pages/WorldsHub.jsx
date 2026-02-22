import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const WORLDS = [
    { id: 1, emoji: '🧠', title: 'AI Basics', desc: 'Pattern recognition and categorization — AI learns from examples.', color: '#C02633', tag: 'Pattern Recognition' },
    { id: 2, emoji: '📊', title: 'Prediction Engine', desc: 'Next-word probabilities — how AI predicts text.', color: '#2563EB', tag: 'Prediction' },
    { id: 3, emoji: '🔤', title: 'Tokenization', desc: 'How text becomes tokens — the atoms AI reads.', color: '#0891B2', tag: 'Tokenizer' },
    { id: 4, emoji: '✍️', title: 'Prompt Engineering', desc: 'Write & score effective prompts to guide AI.', color: '#d97706', tag: 'Scoring' },
    { id: 5, emoji: '🕵️', title: 'Hallucination Detective', desc: 'Spot AI lies — fact-check AI output.', color: '#7C3AED', tag: 'Critical Thinking' },
    { id: 6, emoji: '🏋️', title: 'Mini AI Trainer', desc: 'Teach your own AI by giving it examples, then test it!', color: '#16a34a', tag: 'AI Training' },
];

export default function WorldsHub() {
    const navigate = useNavigate();
    const { completedWorlds } = useGame();

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, position: 'relative', zIndex: 1 }}>
            <h1 className="section-title" style={{ marginBottom: 6 }}>🌏 Learning <span className="text-gradient">Worlds</span></h1>
            <p className="section-subtitle">Choose a world to explore. Each world teaches a core concept of how LLMs work.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                {WORLDS.map(w => {
                    const done = completedWorlds.includes(w.id);
                    return (
                        <div key={w.id} className="world-card" onClick={() => navigate(`/worlds/${w.id}`)}>
                            {done && (
                                <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(22,163,74,0.08)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.25)', borderRadius: 6, padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700 }}>
                                    ✅ DONE
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                                <div style={{ fontSize: '2.5rem' }}>{w.emoji}</div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: w.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>World {w.id} · {w.tag}</div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A1A2E' }}>{w.title}</h3>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#555566', lineHeight: 1.6, marginBottom: 16 }}>{w.desc}</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: '0.85rem', color: w.color, fontWeight: 600 }}>Play →</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
