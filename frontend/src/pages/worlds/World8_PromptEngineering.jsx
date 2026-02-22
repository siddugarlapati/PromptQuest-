import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { worldsAPI } from '../../services/api';
import { WorldHeader } from './World1_Basics';
import toast from 'react-hot-toast';

const RUBRIC = [
    { key: 'length', label: 'Length', max: 20, icon: '📏' },
    { key: 'clarity', label: 'Clarity', max: 25, icon: '🎯' },
    { key: 'instructions', label: 'Instructions', max: 25, icon: '📋' },
    { key: 'examples', label: 'Examples', max: 15, icon: '💡' },
    { key: 'context', label: 'Context/Role', max: 15, icon: '🎭' },
];

const GRADE_COLORS = { S: '#C02633', A: '#16a34a', B: '#2563eb', C: '#d97706', D: '#dc2626' };

export default function World8() {
    const navigate = useNavigate();
    const { addXP, completeWorld } = useGame();
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bestScore, setBestScore] = useState(0);
    const [showGame, setShowGame] = useState(false);

    const TIPS = [
        "You are a helpful teacher. Explain photosynthesis step-by-step in simple language for a 10-year-old, using bullet points and a real-life example.",
        "List 5 tips to improve focus while studying. Format as bullet points. Avoid jargon.",
        "Write a short story about a robot learning to paint. Make it inspiring and end with a lesson.",
    ];

    const handleScore = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        try {
            const res = await worldsAPI.scorePrompt(prompt);
            const r = res.data;
            setResult(r);
            if (r.total_score > bestScore) {
                setBestScore(r.total_score);
                addXP(r.xp_earned);
                toast.success(`+${r.xp_earned} XP! Score: ${r.total_score}/100`, { icon: '✍️' });
                if (r.total_score >= 80) {
                    completeWorld(4, 'prompt_master');
                    toast.success('✍️ Badge Unlocked: Prompt Master!', { duration: 3000 });
                }
            }
        } catch {
            toast.error('Backend not reachable!');
        }
        setLoading(false);
    };

    const gradeColor = result ? GRADE_COLORS[result.grade] || '#C02633' : '#C02633';

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, position: 'relative', zIndex: 1 }}>
            <WorldHeader
                emoji="✍️" title="World 8: Prompt Engineering"
                subtitle="Learn to write effective prompts that guide AI to produce great results."
                onBack={() => navigate('/worlds')}
            />

            {!showGame ? (
                <div className="fade-in">
                    <div className="glass-card" style={{ padding: 32, marginBottom: 24, borderLeft: '4px solid #FFC82C' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#B8860B', marginBottom: 16 }}>
                            Programming in English
                        </h2>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            AI models are incredibly powerful, but they aren't mind readers. The quality of the output depends entirely on the quality of your input.
                            <strong>Prompt Engineering</strong> is the skill of structuring text so that the AI understands exactly what you want.
                        </p>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A1A2E', marginTop: 24, marginBottom: 12 }}>
                            The Anatomy of a Perfect Prompt
                        </h3>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            A strong prompt usually contains four key elements:<br /><br />
                            1. <strong>Role/Context:</strong> "Act as a senior software engineer."<br />
                            2. <strong>Instruction/Task:</strong> "Review this Python code for security vulnerabilities."<br />
                            3. <strong>Format:</strong> "Provide your answer as a bulleted list."<br />
                            4. <strong>Examples (Few-Shot):</strong> "For example, if you see hardcoded passwords, flag them like this..."
                        </p>

                        <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', marginTop: 24 }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                💡 Zero-Shot vs Few-Shot
                            </div>
                            <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                A <strong>Zero-Shot</strong> prompt gives no examples: <em>"Translate 'Hello' to French."</em><br /><br />
                                A <strong>Few-Shot</strong> prompt provides examples to lock in the pattern: <em>"Translate to French. Dog {`->`} Chien. Cat {`->`} Chat. Hello {`->`} ?"</em><br /><br />
                                Few-shot prompting drastically improves the AI's accuracy and adherence to specific formatting rules!
                            </p>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" style={{ width: '100%', fontSize: '1.1rem', padding: 18, background: '#B8860B', color: 'white', border: 'none' }} onClick={() => setShowGame(true)}>
                        Let's Play: Prompt Grader Lab 🚀
                    </button>
                </div>
            ) : (
                <div className="fade-in">

                    <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, borderLeft: '3px solid #FFC82C' }}>
                        <div style={{ fontSize: '0.8rem', color: '#B8860B', fontWeight: 700, marginBottom: 6 }}>✍️ THE ART OF PROMPTING</div>
                        <p style={{ fontSize: '0.85rem', color: '#555566', lineHeight: 1.6 }}>
                            A great prompt has: a clear <strong style={{ color: '#1A1A2E' }}>task</strong>, a <strong style={{ color: '#1A1A2E' }}>role</strong> for the AI, <strong style={{ color: '#1A1A2E' }}>format instructions</strong>, and <strong style={{ color: '#1A1A2E' }}>examples</strong>. Score 80+ to earn the Prompt Master badge!
                        </p>
                    </div>

                    {/* Best Score */}
                    {bestScore > 0 && (
                        <div style={{ marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#555566' }}>Best score this session:</span>
                            <span style={{ fontWeight: 700, color: '#C02633', fontSize: '1rem' }}>{bestScore}/100</span>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 24 }}>
                        {/* Input panel */}
                        <div>
                            <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
                                <div style={{ fontSize: '0.85rem', color: '#555566', fontWeight: 600, marginBottom: 12 }}>Example prompts to try:</div>
                                {TIPS.map((t, i) => (
                                    <button key={i} onClick={() => setPrompt(t)} className="btn btn-ghost btn-sm"
                                        style={{ display: 'block', width: '100%', marginBottom: 8, textAlign: 'left', fontSize: '0.75rem', lineHeight: 1.4, whiteSpace: 'normal', height: 'auto', padding: '8px 12px' }}>
                                        {t.substring(0, 80)}...
                                    </button>
                                ))}
                            </div>

                            <div className="glass-card" style={{ padding: 24 }}>
                                <div style={{ fontSize: '0.85rem', color: '#555566', fontWeight: 600, marginBottom: 8 }}>Your Prompt:</div>
                                <textarea
                                    className="input-field"
                                    rows={8}
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    placeholder="Write your prompt here. Be specific, clear, and include instructions..."
                                    style={{ resize: 'vertical', lineHeight: 1.6 }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                                    <span style={{ fontSize: '0.75rem', color: '#9999AA' }}>{prompt.split(/\s+/).filter(Boolean).length} words</span>
                                    <button className="btn btn-primary" onClick={handleScore} disabled={loading || !prompt.trim()}>
                                        {loading ? 'Scoring...' : '🎯 Score My Prompt'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results panel */}
                        {result && (
                            <div className="fade-in">
                                <div className="glass-card" style={{ padding: 24, marginBottom: 16, textAlign: 'center' }}>
                                    <div style={{ fontSize: '4rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: gradeColor }}>{result.grade}</div>
                                    <div style={{ fontSize: '0.9rem', color: gradeColor, fontWeight: 600 }}>{result.grade_label}</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1A1A2E', marginTop: 8 }}>
                                        {result.total_score}<span style={{ fontSize: '1rem', color: '#9999AA' }}>/100</span>
                                    </div>

                                    {/* Score bar */}
                                    <div className="xp-bar-wrapper" style={{ marginTop: 12 }}>
                                        <div className="xp-bar-fill" style={{ width: `${result.total_score}%`, background: `linear-gradient(90deg, #C02633, ${gradeColor})` }} />
                                    </div>
                                </div>

                                {/* Rubric breakdown */}
                                <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
                                    <div style={{ fontSize: '0.8rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Score Breakdown</div>
                                    {RUBRIC.map(r => (
                                        <div key={r.key} style={{ marginBottom: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.85rem' }}>
                                                <span style={{ color: '#1A1A2E' }}>{r.icon} {r.label}</span>
                                                <span style={{ color: '#C02633', fontWeight: 600 }}>{result.breakdown[r.key]}/{r.max}</span>
                                            </div>
                                            <div className="xp-bar-wrapper" style={{ height: 6 }}>
                                                <div className="xp-bar-fill" style={{ width: `${(result.breakdown[r.key] / r.max) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Feedback */}
                                <div className="glass-card" style={{ padding: 20 }}>
                                    <div style={{ fontSize: '0.8rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Feedback</div>
                                    {result.feedback.map((f, i) => (
                                        <div key={i} style={{ fontSize: '0.85rem', color: '#555566', padding: '5px 0', borderBottom: '1px solid #F0F0F4' }}>{f}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
