import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { worldsAPI } from '../../services/api';
import { WorldHeader } from './World1_Basics';
import toast from 'react-hot-toast';

export default function World3() {
    const navigate = useNavigate();
    const { addXP, completeWorld } = useGame();
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [attempted, setAttempted] = useState(false);

    const handleTokenize = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const res = await worldsAPI.tokenize(text);
            setResult(res.data);
            if (!attempted) {
                addXP(15);
                completeWorld(3, 'token_master');
                toast.success('🔤 +15 XP! Badge: Token Master!', { duration: 3000 });
                setAttempted(true);
            }
        } catch {
            toast.error('Backend not reachable!');
        }
        setLoading(false);
    };

    const EXAMPLES = ['I love AI', 'The quick brown fox jumps over the lazy dog', 'Large Language Models are transformers', 'Tokenization splits text into pieces'];

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, position: 'relative', zIndex: 1 }}>
            <WorldHeader
                emoji="🔤" title="World 3: Tokenization"
                subtitle="See how AI breaks your text into tokens — the fundamental unit it understands."
                onBack={() => navigate('/worlds')}
            />

            <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, borderLeft: '3px solid #0891B2' }}>
                <div style={{ fontSize: '0.8rem', color: '#0891B2', fontWeight: 700, marginBottom: 6 }}>🔤 WHAT IS TOKENIZATION?</div>
                <p style={{ fontSize: '0.85rem', color: '#555566', lineHeight: 1.6 }}>
                    LLMs don't read text character by character — they read <strong style={{ color: '#1A1A2E' }}>tokens</strong>. A token is roughly 4 characters or 0.75 words. "tokenization" → ["token", "ization"]. The model sees token IDs, not raw text!
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
                        placeholder="Type anything here..."
                        onKeyDown={e => e.key === 'Enter' && handleTokenize()}
                    />
                    <button className="btn btn-primary" onClick={handleTokenize} disabled={loading || !text.trim()}>
                        {loading ? '...' : 'Tokenize →'}
                    </button>
                </div>
            </div>

            {/* Token Output */}
            {result && (
                <div className="glass-card fade-in" style={{ padding: 28 }}>
                    {/* Stats Row */}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
                        <StatMini label="Tokens" value={result.token_count} color="#C02633" />
                        <StatMini label="Characters" value={result.char_count} color="#2563EB" />
                        <StatMini label="Chars / Token" value={result.compression_ratio} color="#7C3AED" />
                    </div>

                    {/* Tokens */}
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                            Token Visualization
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                            {result.tokens.map((tok, i) => (
                                <div key={i} className="token-chip" style={{ background: tok.color + '18', color: tok.color, border: `1px solid ${tok.color}44` }}>
                                    {tok.text}
                                    <span style={{ fontSize: '0.65rem', color: tok.color + 'AA', marginLeft: 4 }}>[{tok.id}]</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Insight */}
                    <div style={{ background: 'rgba(8,145,178,0.06)', border: '1px solid rgba(8,145,178,0.18)', borderRadius: 10, padding: '12px 16px', fontSize: '0.85rem', color: '#555566' }}>
                        💡 Your text of <strong style={{ color: '#1A1A2E' }}>{result.char_count} characters</strong> was split into <strong style={{ color: '#C02633' }}>{result.token_count} tokens</strong>. LLMs have token limits (e.g., GPT-4 supports 128,000 tokens).
                    </div>
                </div>
            )}
        </div>
    );
}

function StatMini({ label, value, color }) {
    return (
        <div style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 10, padding: '12px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: '#9999AA', marginTop: 2 }}>{label}</div>
        </div>
    );
}
