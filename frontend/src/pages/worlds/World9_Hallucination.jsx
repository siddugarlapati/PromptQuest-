import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { worldsAPI } from '../../services/api';
import { WorldHeader } from './World1_Basics';
import toast from 'react-hot-toast';

export default function World9() {
    const navigate = useNavigate();
    const { addXP, completeWorld } = useGame();
    const [question, setQuestion] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [showGame, setShowGame] = useState(false);

    const fetchQuestion = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await worldsAPI.getHallucinationQuestion();
            setQuestion(res.data);
        } catch {
            toast.error('Backend not reachable!');
        }
        setLoading(false);
    };

    useEffect(() => { fetchQuestion(); }, []);

    const handleAnswer = async (answer) => {
        if (result) return;
        try {
            const res = await worldsAPI.submitHallucinationAnswer(question._id, answer);
            const r = res.data;
            setResult(r);
            setScore(s => ({
                correct: s.correct + (r.is_correct ? 1 : 0),
                total: s.total + 1,
            }));
            if (r.is_correct) {
                addXP(r.xp_earned);
                toast.success(`+${r.xp_earned} XP!`, { icon: '🕵️' });
                if (score.total + 1 >= 3) {
                    completeWorld(5, 'truth_seeker');
                    toast.success('🕵️ Badge: Truth Seeker!', { duration: 3000 });
                }
            }
        } catch {
            toast.error('Error submitting answer.');
        }
    };

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, position: 'relative', zIndex: 1 }}>
            <WorldHeader
                emoji="🕵️" title="World 9: Hallucination Detective"
                subtitle="AI sometimes makes up facts. Can you spot the hallucinations?"
                onBack={() => navigate('/worlds')}
            />
            {!showGame ? (
                <div className="fade-in">
                    <div className="glass-card" style={{ padding: 32, marginBottom: 24, borderLeft: '4px solid #7C3AED' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7C3AED', marginBottom: 16 }}>
                            The Illusion of Truth
                        </h2>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            As we learned in World 2, an AI is fundamentally a "next-word predictor". It is optimized to generate text that <em>sounds</em> highly probable. However, "sounding probable" is not the same thing as "being true".
                            When an AI generates false information confidently, we call it a <strong>Hallucination</strong>.
                        </p>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A1A2E', marginTop: 24, marginBottom: 12 }}>
                            Why do they hallucinate?
                        </h3>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            1. <strong>Training Data Gaps:</strong> If you ask about a highly specific or recent event, the AI hasn't memorized the facts, but it still tries to predict plausible-sounding words. <br />
                            2. <strong>Context Forgetting:</strong> As seen in World 7, if crucial facts slide out of the context window, the AI makes up replacements.<br />
                            3. <strong>Sycophancy:</strong> AIs are trained to be helpful and agreeable. If you ask a leading question ("Why did Lincoln hate dogs?"), the AI might invent a story to agree with your premise, even if Lincoln actually loved dogs!
                        </p>

                        <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', marginTop: 24 }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                💡 The Danger
                            </div>
                            <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                A hallucination isn't a "glitch"—it's the AI working exactly as designed! It is generating the most statistically likely words. This is why you must <strong>always verify</strong> factual claims made by an AI, especially regarding code, law, or medicine.
                            </p>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" style={{ width: '100%', fontSize: '1.1rem', padding: 18, background: '#7C3AED', color: 'white', border: 'none' }} onClick={() => setShowGame(true)}>
                        Let's Play: Spot the Fake 🚀
                    </button>
                </div>
            ) : (
                <div className="fade-in">

                    <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, borderLeft: '3px solid #7C3AED' }}>
                        <div style={{ fontSize: '0.8rem', color: '#7C3AED', fontWeight: 700, marginBottom: 6 }}>🕵️ WHAT IS AI HALLUCINATION?</div>
                        <p style={{ fontSize: '0.85rem', color: '#555566', lineHeight: 1.6 }}>
                            LLMs sometimes state <strong style={{ color: '#1A1A2E' }}>false information confidently</strong> — this is called hallucination. It happens because models generate the most probable text, not necessarily true text. Your job: fact-check the AI!
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ fontSize: '0.85rem', color: '#555566' }}>Question {score.total + 1}</div>
                        <div style={{ fontSize: '0.8rem', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 100, padding: '5px 14px', color: '#7C3AED', fontWeight: 600 }}>
                            🕵️ {score.correct}/{score.total} Correct
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 60, color: '#9999AA' }}>Loading...</div>
                    ) : question ? (
                        <div className="glass-card fade-in" style={{ padding: 32 }}>
                            {/* AI Statement */}
                            <div style={{ marginBottom: 32 }}>
                                <div style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                                    🤖 AI Statement:
                                </div>
                                <div style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.18)', borderRadius: 12, padding: '20px 24px', fontSize: '1.1rem', fontStyle: 'italic', color: '#1A1A2E', lineHeight: 1.6 }}>
                                    "{question.question.replace("An AI says: ", "").replace(/^'|'$/g, '').replace(/^"|"$/g, '')}"
                                </div>
                            </div>

                            {/* True / False Buttons */}
                            {!result && (
                                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 }}>
                                    <button
                                        className="btn btn-lg"
                                        onClick={() => handleAnswer(true)}
                                        style={{ flex: 1, background: 'rgba(22,163,74,0.08)', border: '2px solid rgba(22,163,74,0.35)', color: '#16a34a', fontSize: '1.2rem', fontWeight: 800, padding: '18px' }}
                                    >
                                        ✅ TRUE
                                    </button>
                                    <button
                                        className="btn btn-lg"
                                        onClick={() => handleAnswer(false)}
                                        style={{ flex: 1, background: 'rgba(220,38,38,0.08)', border: '2px solid rgba(220,38,38,0.35)', color: '#dc2626', fontSize: '1.2rem', fontWeight: 800, padding: '18px' }}
                                    >
                                        ❌ FALSE
                                    </button>
                                </div>
                            )}

                            {/* Result */}
                            {result && (
                                <>
                                    <div className={result.is_correct ? 'feedback-correct' : 'feedback-wrong'} style={{ marginBottom: 16, fontSize: '1rem', lineHeight: 1.6 }}>
                                        {result.feedback}
                                    </div>
                                    <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', borderRadius: 10, padding: '12px 16px', fontSize: '0.85rem', color: '#555566', lineHeight: 1.5 }}>
                                        <strong style={{ color: '#1A1A2E' }}>✔ Correct Answer:</strong> {result.correct_answer ? 'TRUE' : 'FALSE'}
                                    </div>
                                    <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} onClick={fetchQuestion}>
                                        Next Question →
                                    </button>
                                </>
                            )}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
