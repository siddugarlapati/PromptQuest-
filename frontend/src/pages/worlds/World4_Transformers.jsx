import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { worldsAPI } from '../../services/api';
import { WorldHeader } from './World1_Basics';
import toast from 'react-hot-toast';

export default function World4() {
    const navigate = useNavigate();
    const { addXP, completeWorld } = useGame();
    const [text, setText] = useState('Ravi went to school because he was late.');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [attempted, setAttempted] = useState(false);
    const [showGame, setShowGame] = useState(false);

    const handleResolve = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const res = await worldsAPI.resolvePronouns(text);
            setResult(res.data);
            if (!attempted) {
                addXP(20);
                completeWorld(4, 'prompt_master'); // Reused badge id for now, actually maybe I'll define new badge later
                toast.success('🧠 +20 XP!', { duration: 3000 });
                setAttempted(true);
            }
        } catch {
            toast.error('Backend not reachable!');
        }
        setLoading(false);
    };

    const EXAMPLES = [
        'Ravi went to school because he was late',
        'The dog chased the cat until it got tired',
        'Alice and Bob went to the store, and she bought an apple'
    ];

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, position: 'relative', zIndex: 1 }}>
            <WorldHeader
                emoji="🤖" title="World 4: Transformers"
                subtitle="Discover how Self-Attention resolves pronouns by looking at context."
                onBack={() => navigate('/worlds')}
            />

            {!showGame ? (
                <div className="fade-in">
                    <div className="glass-card" style={{ padding: 32, marginBottom: 24, borderLeft: '4px solid #7C3AED' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7C3AED', marginBottom: 16 }}>
                            The Transformer Revolution
                        </h2>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            Before 2017, AIs read text one word at a time, from left to right. This meant they often forgot the beginning of a long sentence by the time they reached the end.
                            Then Google released a paper called <em>"Attention Is All You Need,"</em> introducing the <strong>Transformer architecture</strong>.
                        </p>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A1A2E', marginTop: 24, marginBottom: 12 }}>
                            The Magic of Self-Attention
                        </h3>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            Instead of reading left-to-right, Transformers look at <strong>every word in a sentence simultaneously</strong>.
                            They use a mechanism called <strong>Self-Attention</strong> to figure out mathematically which words are connected to each other, regardless of how far apart they are.
                        </p>

                        <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', marginTop: 24 }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                💡 The Pronoun Problem
                            </div>
                            <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                A classic test of AI comprehension is resolving ambiguous pronouns. <br /><br />
                                <em>"The animal didn't cross the street because <strong>it</strong> was too tired."</em> (What is <strong>it</strong>? The animal.)<br />
                                <em>"The animal didn't cross the street because <strong>it</strong> was too wide."</em> (What is <strong>it</strong>? The street.)<br /><br />
                                Self-attention calculates a heavy "attention weight" linking <strong>it</strong> to <strong>animal</strong> in the first sentence, and <strong>street</strong> in the second!
                            </p>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" style={{ width: '100%', fontSize: '1.1rem', padding: 18, background: '#7C3AED' }} onClick={() => setShowGame(true)}>
                        Let's Play: Attention Lab 🚀
                    </button>
                </div>
            ) : (
                <div className="fade-in">

                    <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, borderLeft: '3px solid #7C3AED' }}>
                        <div style={{ fontSize: '0.8rem', color: '#7C3AED', fontWeight: 700, marginBottom: 6 }}>🤖 WHAT IS SELF-ATTENTION?</div>
                        <p style={{ fontSize: '0.85rem', color: '#555566', lineHeight: 1.6 }}>
                            When you say "The dog chased the cat until <b>it</b> got tired", how does the AI know who "it" is?
                            Transformers use a mechanism called <b>Self-Attention</b> to map connections between words.
                            The word "it" pays high attention to "dog" to understand the sentence!
                        </p>
                    </div>

                    {/* Input */}
                    <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                        <div style={{ marginBottom: 12, fontSize: '0.85rem', color: '#555566', fontWeight: 600 }}>Try an example:</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                            {EXAMPLES.map(ex => (
                                <button key={ex} onClick={() => setText(ex)} className="btn btn-ghost btn-sm">
                                    "{ex}"
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <input
                                className="input-field"
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder="Type a sentence with a pronoun..."
                                onKeyDown={e => e.key === 'Enter' && handleResolve()}
                            />
                            <button className="btn btn-primary" onClick={handleResolve} disabled={loading || !text.trim()}>
                                {loading ? '...' : 'Analyze Context →'}
                            </button>
                        </div>
                    </div>

                    {/* Token Output */}
                    {result && (
                        <div className="glass-card fade-in" style={{ padding: 28 }}>

                            <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>
                                Attention Resolution Map
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: '1.4rem', marginBottom: 30, lineHeight: 2 }}>
                                {result.tokens.map((tok, i) => {
                                    // find if this token is a pronoun or target
                                    const resForPronoun = result.resolutions.find(r => r.pronoun_index === i);
                                    const resForTarget = result.resolutions.find(r => r.target_index === i);

                                    let bg = 'transparent';
                                    let border = '1px solid transparent';
                                    let color = '#1A1A2E';

                                    if (resForPronoun) {
                                        bg = 'rgba(220, 38, 38, 0.1)';
                                        border = '1px solid #dc2626';
                                        color = '#dc2626';
                                    } else if (resForTarget) {
                                        bg = 'rgba(22, 163, 74, 0.1)';
                                        border = '1px solid #16a34a';
                                        color = '#16a34a';
                                    }

                                    return (
                                        <span key={i} style={{
                                            padding: '4px 10px', borderRadius: 8, background: bg, border, color,
                                            fontWeight: (resForPronoun || resForTarget) ? 700 : 500
                                        }}>
                                            {tok}
                                        </span>
                                    );
                                })}
                            </div>

                            {result.resolutions.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {result.resolutions.map((r, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#F8F9FA', padding: '12px 16px', borderRadius: 12, border: '1px solid #E5E7EB' }}>
                                            <div style={{ color: '#dc2626', fontWeight: 700, fontSize: '1.2rem' }}>"{r.pronoun}"</div>
                                            <div style={{ color: '#9999AA', fontSize: '0.8rem' }}>looks back to</div>
                                            <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.2rem' }}>"{r.target}"</div>
                                            <div style={{ marginLeft: 'auto', background: '#1A1A2E', color: 'white', padding: '6px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600 }}>
                                                Attention Weight: {Math.round(r.attention_weight * 100)}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ color: '#9999AA', fontStyle: 'italic' }}>No pronouns resolved in this sentence. Try another example!</div>
                            )}

                            <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.18)', borderRadius: 10, padding: '12px 16px', fontSize: '0.85rem', color: '#555566', marginTop: 24 }}>
                                💡 {result.explanation}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
