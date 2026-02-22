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
    const [showGame, setShowGame] = useState(false);

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

            {!showGame ? (
                <div className="fade-in">
                    <div className="glass-card" style={{ padding: 32, marginBottom: 24, borderLeft: '4px solid #0891B2' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0891B2', marginBottom: 16 }}>
                            How AI Reads Text
                        </h2>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            A Large Language Model does not understand words the way humans do. It also doesn't simply read letter-by-letter. Instead, it breaks text down into chunks called <strong>Tokens</strong>.
                        </p>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A1A2E', marginTop: 24, marginBottom: 12 }}>
                            What is a Token?
                        </h3>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            A token can be a single character, a whole word, or part of a word (a "subword"). Most modern AIs (like GPT-4 and Llama-3) use a method called <strong>Byte-Pair Encoding (BPE)</strong>.
                            <br /><br />
                            For example, the word <code>"hamburger"</code> might be split into three tokens: <code>["ham", "bur", "ger"]</code>.
                        </p>

                        <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', marginTop: 24 }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                💡 Rule of Thumb
                            </div>
                            <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                In English, <strong>1 Token ≈ 4 characters</strong> or <strong>0.75 words</strong>.<br />
                                This means a 100-token paragraph is roughly 75 words.<br /><br />
                                <em>Fun Fact:</em> Because models read in chunks, an AI might struggle with tasks like "Count the number of letters in this sentence" because it literally never sees the individual letters!
                            </p>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" style={{ width: '100%', fontSize: '1.1rem', padding: 18, background: '#0891B2' }} onClick={() => setShowGame(true)}>
                        Let's Play: Tokenizer Lab 🚀
                    </button>
                </div>
            ) : (
                <div className="fade-in">

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
                                <StatMini label="Words" value={result.word_tokens.length} color="#C02633" />
                                <StatMini label="Characters" value={result.stats.char_count} color="#2563EB" />
                                <StatMini label="Subword Tokens" value={result.subword_tokens.length} color="#7C3AED" />
                            </div>

                            {/* Word Tokens */}
                            <TokenGroup title="Word Tokens" tokens={result.word_tokens} />

                            {/* Character Tokens */}
                            <TokenGroup title="Character Tokens" tokens={result.char_tokens} />

                            {/* Subword Tokens */}
                            <TokenGroup title="Subword Tokens (BPE)" tokens={result.subword_tokens} />

                            {/* Insight */}
                            <div style={{ background: 'rgba(8,145,178,0.06)', border: '1px solid rgba(8,145,178,0.18)', borderRadius: 10, padding: '12px 16px', fontSize: '0.85rem', color: '#555566', marginTop: 24 }}>
                                💡 Your text of <strong style={{ color: '#1A1A2E' }}>{result.stats.char_count} characters</strong> was compressed into <strong style={{ color: '#C02633' }}>{result.stats.token_count} subword tokens</strong> using Byte-Pair Encoding (BPE). LLMs process and "read" these subwords!
                            </div>
                        </div>
                    )}
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

function TokenGroup({ title, tokens }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                {title}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {tokens.map((tok, i) => (
                    <div key={i} style={{
                        background: tok.color + '18', color: tok.color, border: `1px solid ${tok.color}44`,
                        padding: '4px 8px', borderRadius: 6, fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 600
                    }}>
                        {tok.text === ' ' ? '␣' : tok.text}
                    </div>
                ))}
            </div>
        </div>
    );
}
