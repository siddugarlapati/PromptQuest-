import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { worldsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function World1() {
    const navigate = useNavigate();
    const { addXP, completeWorld } = useGame();
    const [question, setQuestion] = useState(null);
    const [selected, setSelected] = useState(null);
    const [result, setResult] = useState(null);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [loading, setLoading] = useState(false);
    const [difficulty, setDifficulty] = useState('easy');
    const [streak, setStreak] = useState(0);

    const fetchQuestion = async () => {
        setLoading(true);
        setSelected(null);
        setResult(null);
        try {
            const res = await worldsAPI.getPatternQuestion(difficulty);
            setQuestion(res.data);
        } catch {
            toast.error('Could not reach backend. Make sure it is running!');
        }
        setLoading(false);
    };

    useEffect(() => { fetchQuestion(); }, [difficulty]);

    const handleAnswer = async (option) => {
        if (selected) return;
        setSelected(option);
        try {
            const res = await worldsAPI.submitPatternAnswer(question.question_item, option);
            const r = res.data;
            setResult(r);
            const newTotal = score.total + 1;
            if (r.is_correct) {
                addXP(r.xp_earned);
                setScore({ correct: score.correct + 1, total: newTotal });
                setStreak(s => s + 1);
                toast.success(`+${r.xp_earned} XP`, { icon: '⚡' });
                if (newTotal >= 3) {
                    completeWorld(1, 'ai_explorer');
                    toast.success('🔍 Badge Unlocked: AI Explorer!', { duration: 3000 });
                }
            } else {
                setStreak(0);
                setScore({ correct: score.correct, total: newTotal });
            }
        } catch {
            toast.error('Error submitting answer.');
        }
    };

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, position: 'relative', zIndex: 1 }}>
            <WorldHeader
                emoji="🧠" title="World 1: AI Basics"
                subtitle="Learn how AI recognizes patterns to classify information."
                onBack={() => navigate('/worlds')}
            />

            {/* Difficulty + Score */}
            <div style={styles.topRow}>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['easy', 'medium', 'hard'].map(d => (
                        <button key={d} className={`btn ${difficulty === d ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                            onClick={() => setDifficulty(d)} style={{ textTransform: 'capitalize' }}>
                            {d}
                        </button>
                    ))}
                </div>
                <div style={styles.scoreChip}>
                    ✅ {score.correct}/{score.total} &nbsp; 🔥 Streak: {streak}
                </div>
            </div>

            {/* Concept explanation */}
            <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, borderLeft: '3px solid #C02633' }}>
                <div style={{ fontSize: '0.8rem', color: '#C02633', fontWeight: 700, marginBottom: 6 }}>🧠 HOW AI LEARNS PATTERNS</div>
                <p style={{ fontSize: '0.85rem', color: '#555566', lineHeight: 1.6 }}>
                    AI learns by finding common traits in examples. If it sees Dog → Animal, Cat → Animal, Tiger → Animal, it recognizes the pattern: four-legged creatures = Animals. Then it applies that rule to new items it hasn't seen before!
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#9999AA' }}>Loading question...</div>
            ) : question ? (
                <div className="glass-card fade-in" style={{ padding: 28 }}>
                    {/* Examples */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                            📚 Training Examples (AI has seen these)
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {question.examples.map((ex, i) => (
                                <div key={i} style={styles.exampleChip}>
                                    <span style={{ color: '#1A1A2E', fontWeight: 600 }}>{ex.item}</span>
                                    <span style={{ color: '#9999AA' }}>→</span>
                                    <span style={{ color: '#C02633', fontWeight: 700 }}>{ex.category}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Question */}
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <div style={{ fontSize: '0.85rem', color: '#555566', marginBottom: 8 }}>What category does this belong to?</div>
                        <div style={styles.questionItem}>{question.question_item}</div>
                        <div style={{ color: '#9999AA', fontSize: '1.2rem' }}>→ ?</div>
                    </div>

                    {/* Options */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                        {question.options.map(opt => {
                            let bg = '#F8F9FA';
                            let border = '1.5px solid #E5E7EB';
                            let color = '#1A1A2E';
                            if (selected === opt) {
                                if (result?.is_correct) { bg = 'rgba(22,163,74,0.08)'; border = '1.5px solid #16a34a'; color = '#16a34a'; }
                                else { bg = 'rgba(220,38,38,0.08)'; border = '1.5px solid #dc2626'; color = '#dc2626'; }
                            }
                            if (selected && opt === result?.correct_answer && !result?.is_correct) {
                                bg = 'rgba(22,163,74,0.06)'; border = '1.5px solid #16a34a';
                            }
                            return (
                                <button key={opt} onClick={() => handleAnswer(opt)}
                                    style={{ ...styles.optionBtn, background: bg, border, color }}
                                    disabled={!!selected}>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>

                    {/* Result */}
                    {result && (
                        <div className={result.is_correct ? 'feedback-correct' : 'feedback-wrong'} style={{ marginTop: 20 }}>
                            {result.feedback}
                        </div>
                    )}

                    {result && (
                        <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} onClick={fetchQuestion}>
                            Next Question →
                        </button>
                    )}
                </div>
            ) : null}
        </div>
    );
}

// Shared WorldHeader component
export function WorldHeader({ emoji, title, subtitle, onBack }) {
    return (
        <div style={{ marginBottom: 28 }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#C02633', fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 600 }}>
                ← Back to Worlds
            </button>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{emoji}</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif", color: '#1A1A2E' }}>{title}</h1>
            <p style={{ color: '#555566' }}>{subtitle}</p>
        </div>
    );
}

const styles = {
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
    scoreChip: {
        background: 'rgba(192,38,51,0.06)', border: '1px solid rgba(192,38,51,0.18)',
        borderRadius: 100, padding: '6px 16px', fontSize: '0.8rem', color: '#C02633', fontWeight: 600,
    },
    exampleChip: {
        background: '#F8F9FA', border: '1px solid #E5E7EB',
        borderRadius: 8, padding: '8px 14px', display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.9rem',
    },
    questionItem: {
        fontSize: '3rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif",
        color: '#1A1A2E', marginBottom: 8,
    },
    optionBtn: {
        padding: '14px 20px', borderRadius: 10, fontSize: '0.95rem', fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
    },
};
