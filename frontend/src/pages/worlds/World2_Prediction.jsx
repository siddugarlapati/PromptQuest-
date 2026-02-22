import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { worldsAPI } from '../../services/api';
import { WorldHeader } from './World1_Basics';
import toast from 'react-hot-toast';

export default function World2() {
    const navigate = useNavigate();
    const { addXP, completeWorld } = useGame();
    const [question, setQuestion] = useState(null);
    const [selected, setSelected] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [showProbs, setShowProbs] = useState(false);

    const fetchQuestion = async () => {
        setLoading(true);
        setSelected(null);
        setResult(null);
        setShowProbs(false);
        try {
            const res = await worldsAPI.getPredictionQuestion();
            setQuestion(res.data);
        } catch {
            toast.error('Backend not reachable. Start the FastAPI server!');
        }
        setLoading(false);
    };

    useEffect(() => { fetchQuestion(); }, []);

    const handleAnswer = async (word) => {
        if (selected) return;
        setSelected(word);
        setShowProbs(true);
        try {
            const res = await worldsAPI.submitPredictionAnswer(question.prompt, word);
            const r = res.data;
            setResult(r);
            setScore(s => ({
                correct: s.correct + (r.is_correct ? 1 : 0),
                total: s.total + 1,
            }));
            if (r.is_correct) {
                addXP(r.xp_earned);
                toast.success(`+${r.xp_earned} XP`, { icon: '⚡' });
                if (score.total + 1 >= 3) {
                    completeWorld(2, 'prediction_pro');
                    toast.success('📊 Badge Unlocked: Prediction Pro!', { duration: 3000 });
                }
            }
        } catch {
            toast.error('Error submitting answer.');
        }
    };

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, position: 'relative', zIndex: 1 }}>
            <WorldHeader
                emoji="📊" title="World 2: Prediction Engine"
                subtitle="Understand how language models predict the next word using probabilities."
                onBack={() => navigate('/worlds')}
            />

            {/* Concept Card */}
            <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, borderLeft: '3px solid #2563EB' }}>
                <div style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 700, marginBottom: 6 }}>📊 HOW LLMs PREDICT</div>
                <p style={{ fontSize: '0.85rem', color: '#555566', lineHeight: 1.6 }}>
                    Language models assign probabilities to every possible next word. The model picks the word with the highest probability — but in creative mode, it sometimes chooses lower-probability words for variety. This is called <strong style={{ color: '#1A1A2E' }}>temperature</strong> in AI.
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: '0.85rem', color: '#555566' }}>Question {score.total + 1}</div>
                <div style={{ fontSize: '0.8rem', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 100, padding: '5px 14px', color: '#2563EB', fontWeight: 600 }}>
                    ✅ {score.correct}/{score.total}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#9999AA' }}>Loading...</div>
            ) : question ? (
                <div className="glass-card fade-in" style={{ padding: 28 }}>
                    {/* Prompt */}
                    <div style={{ marginBottom: 28, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Complete the sentence:</div>
                        <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 28px', display: 'inline-block' }}>
                            <span style={{ fontSize: '1.3rem', fontWeight: 600, color: '#1A1A2E' }}>{question.prompt}</span>
                            <span style={{ fontSize: '1.3rem', color: '#C02633', fontWeight: 900, marginLeft: 8 }}>____</span>
                        </div>
                    </div>

                    {/* Options */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
                        {question.options.map(opt => {
                            let bg = '#F8F9FA'; let border = '1.5px solid #E5E7EB'; let color = '#1A1A2E';
                            if (selected === opt) {
                                if (result?.is_correct) { bg = 'rgba(22,163,74,0.08)'; border = '1.5px solid #16a34a'; color = '#16a34a'; }
                                else { bg = 'rgba(220,38,38,0.08)'; border = '1.5px solid #dc2626'; color = '#dc2626'; }
                            }
                            if (selected && opt === result?.correct_answer && !result?.is_correct) {
                                bg = 'rgba(22,163,74,0.06)'; border = '1.5px solid #16a34a';
                            }
                            return (
                                <button key={opt} disabled={!!selected} onClick={() => handleAnswer(opt)}
                                    style={{ padding: '14px 16px', borderRadius: 10, border, background: bg, color, fontSize: '0.95rem', fontWeight: 600, cursor: selected ? 'default' : 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>

                    {/* Probability Bars */}
                    {showProbs && question.predictions && (
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                                🤖 Model Probability Distribution
                            </div>
                            {question.predictions.map((p, i) => (
                                <div key={i} className="prob-bar-container">
                                    <div className="prob-bar-label">
                                        <span style={{ fontWeight: 600, color: '#1A1A2E' }}>{p.word}</span>
                                        <span style={{ color: '#555566' }}>{p.probability}%</span>
                                    </div>
                                    <div className="prob-bar-track">
                                        <div className="prob-bar-fill" style={{ width: `${p.probability}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {result && (
                        <div className={result.is_correct ? 'feedback-correct' : 'feedback-wrong'}>
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
