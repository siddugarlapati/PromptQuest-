import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { useGame } from '../context/GameContext';

const TOPIC_META = {
    pattern: { label: 'Pattern Recognition', emoji: '🧠', world: 1, color: '#C02633' },
    prediction: { label: 'Next-Word Prediction', emoji: '📊', world: 2, color: '#2563EB' },
    tokenization: { label: 'Tokenization', emoji: '🔤', world: 3, color: '#0891B2' },
    prompt: { label: 'Prompt Engineering', emoji: '✍️', world: 4, color: '#d97706' },
    hallucination: { label: 'Hallucination Detection', emoji: '🕵️', world: 5, color: '#7C3AED' },
    training: { label: 'AI Training', emoji: '🏋️', world: 6, color: '#16a34a' },
};

function CircularMeter({ percent, size = 160 }) {
    const r = (size / 2) - 14;
    const circumference = 2 * Math.PI * r;
    const progress = (percent / 100) * circumference;
    const color = percent >= 75 ? '#16a34a' : percent >= 50 ? '#d97706' : '#C02633';

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={10} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10}
                    strokeDasharray={`${progress} ${circumference}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s ease' }} />
            </svg>
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color, lineHeight: 1 }}>
                    {percent}%
                </div>
                <div style={{ fontSize: '0.7rem', color: '#9999AA', marginTop: 2 }}>AI Knowledge</div>
            </div>
        </div>
    );
}

export default function Analytics() {
    const { mistakes, completedWorlds, xp, getLevel, promptHistory } = useGame();
    const [backendSummary, setBackendSummary] = useState(null);

    useEffect(() => {
        analyticsAPI.getSummary().then(r => setBackendSummary(r.data)).catch(() => { });
    }, []);

    // Compute AI Understanding Meter %
    const worldsComp = completedWorlds.length;
    const promptBest = promptHistory.length > 0 ? Math.max(...promptHistory.map(h => h.score)) : 0;
    const totalMistakes = Object.values(mistakes).reduce((a, b) => a + b, 0);
    const level = getLevel();

    // Component scores
    const worldScore = (worldsComp / 6) * 40;        // 40% from worlds
    const promptScore = (promptBest / 100) * 30;     // 30% from best prompt score
    const levelScore = Math.min(level / 20, 1) * 20; // 20% from level
    const mistakePenalty = Math.min(totalMistakes * 2, 10); // -10% max from mistakes
    const aiMeterPercent = Math.round(Math.max(0, Math.min(100, worldScore + promptScore + levelScore - mistakePenalty + (xp > 0 ? 5 : 0))));

    const meterLevel = aiMeterPercent >= 75 ? 'Advanced Learner' : aiMeterPercent >= 50 ? 'Developing' : aiMeterPercent >= 25 ? 'Beginner' : 'Just Starting';

    // Mistake data — merge local & backend
    const allMistakes = { ...mistakes };
    if (backendSummary?.mistakes) {
        Object.entries(backendSummary.mistakes).forEach(([k, v]) => {
            allMistakes[k] = (allMistakes[k] || 0) + v;
        });
    }

    const CONCEPTS = [
        { key: 'pattern', label: 'Pattern Learning', done: completedWorlds.includes(1) },
        { key: 'prediction', label: 'Prediction Engine', done: completedWorlds.includes(2) },
        { key: 'tokenization', label: 'Tokenization', done: completedWorlds.includes(3) },
        { key: 'prompt', label: 'Prompt Engineering', done: completedWorlds.includes(4) },
        { key: 'hallucination', label: 'Hallucination Detection', done: completedWorlds.includes(5) },
        { key: 'training', label: 'AI Training', done: completedWorlds.includes(6) },
    ];

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
            <h1 className="section-title" style={{ marginBottom: 6 }}>📈 Learning <span className="text-gradient">Analytics</span></h1>
            <p style={{ color: '#555566', marginBottom: 32 }}>Track your AI learning progress, see where you struggle, and find out your overall AI knowledge level.</p>

            {/* Top row: AI Meter + Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, marginBottom: 24 }}>
                {/* AI Understanding Meter */}
                <div className="glass-card" style={{ padding: 28, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>
                        🤖 AI Understanding Meter
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                        <CircularMeter percent={aiMeterPercent} />
                    </div>
                    <div style={{ fontWeight: 700, color: '#1A1A2E', marginBottom: 4 }}>{meterLevel}</div>
                    <div style={{ fontSize: '0.8rem', color: '#555566' }}>
                        Complete more worlds and score higher prompts to increase!
                    </div>
                </div>

                {/* Quick stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                    {[
                        { label: 'Worlds Completed', value: `${worldsComp}/6`, color: '#C02633', icon: '🌍' },
                        { label: 'Total XP Earned', value: `${xp} XP`, color: '#2563EB', icon: '⚡' },
                        { label: 'Current Level', value: `Lv ${getLevel()}`, color: '#16a34a', icon: '⭐' },
                        { label: 'Best Prompt Score', value: promptBest > 0 ? `${promptBest}/100` : '—', color: '#7C3AED', icon: '✍️' },
                    ].map((s, i) => (
                        <div key={i} className="glass-card" style={{ padding: '16px 20px' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.icon}</div>
                            <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Concepts learned */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                        🧩 Concepts Mastered
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {CONCEPTS.map(c => {
                            const meta = TOPIC_META[c.key];
                            return (
                                <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: c.done ? `${meta.color}08` : '#F8F9FA', borderRadius: 8, border: `1px solid ${c.done ? meta.color + '30' : '#E5E7EB'}` }}>
                                    <span style={{ fontSize: '1.2rem' }}>{meta.emoji}</span>
                                    <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600, color: c.done ? '#1A1A2E' : '#9999AA' }}>{c.label}</span>
                                    <span style={{ fontSize: '0.85rem' }}>{c.done ? '✅' : '⬜'}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mistake Tracker */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                        ⚠️ Mistake Tracker
                    </div>
                    {Object.keys(allMistakes).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 20px', color: '#9999AA' }}>
                            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
                            No mistakes recorded yet!<br />Keep playing to see your weak areas.
                        </div>
                    ) : (
                        <div>
                            {Object.entries(allMistakes)
                                .sort(([, a], [, b]) => b - a)
                                .map(([topic, count]) => {
                                    const meta = TOPIC_META[topic] || { label: topic, emoji: '❓', color: '#9999AA' };
                                    const maxCount = Math.max(...Object.values(allMistakes));
                                    return (
                                        <div key={topic} style={{ marginBottom: 14 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                <span style={{ fontSize: '0.83rem', color: '#1A1A2E', fontWeight: 600 }}>
                                                    {meta.emoji} {meta.label}
                                                </span>
                                                <span style={{ fontSize: '0.8rem', color: meta.color, fontWeight: 700 }}>
                                                    {count} mistake{count !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${(count / maxCount) * 100}%`, background: meta.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                                            </div>
                                        </div>
                                    );
                                })}

                            {/* Suggestions */}
                            {backendSummary?.suggestions?.length > 0 && (
                                <div style={{ marginTop: 20, padding: '12px 14px', background: 'rgba(192,38,51,0.04)', border: '1px solid rgba(192,38,51,0.15)', borderRadius: 10 }}>
                                    <div style={{ fontSize: '0.75rem', color: '#C02633', fontWeight: 700, marginBottom: 8 }}>💡 Suggested Practice</div>
                                    {backendSummary.suggestions.map((s, i) => (
                                        <div key={i} style={{ fontSize: '0.8rem', color: '#555566', marginBottom: 4 }}>→ {s.action}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Prompt history quick glance */}
            {promptHistory.length > 0 && (
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                        ✍️ Recent Prompt Scores
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {[...promptHistory].reverse().slice(0, 8).map((h, i) => (
                            <div key={i} style={{
                                background: `${({ S: '#C02633', A: '#16a34a', B: '#2563eb', C: '#d97706', D: '#dc2626' }[h.grade] || '#9999AA')}12`,
                                border: `1px solid ${({ S: '#C02633', A: '#16a34a', B: '#2563eb', C: '#d97706', D: '#dc2626' }[h.grade] || '#9999AA')}44`,
                                borderRadius: 8, padding: '8px 14px', textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: ({ S: '#C02633', A: '#16a34a', B: '#2563eb', C: '#d97706', D: '#dc2626' }[h.grade] || '#9999AA'), fontFamily: "'Space Grotesk', sans-serif" }}>{h.grade}</div>
                                <div style={{ fontSize: '0.75rem', color: '#555566' }}>{h.score}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
