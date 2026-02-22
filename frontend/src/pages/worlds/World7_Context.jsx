import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { worldsAPI } from '../../services/api';
import { WorldHeader } from './World1_Basics';
import toast from 'react-hot-toast';

export default function World7() {
    const navigate = useNavigate();
    const { addXP, completeWorld } = useGame();

    // UI State
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [maxTokens, setMaxTokens] = useState(40);
    const [loading, setLoading] = useState(false);

    // Simulation Result State
    const [retained, setRetained] = useState([]);
    const [forgotten, setForgotten] = useState([]);
    const [stats, setStats] = useState(null);
    const [attempted, setAttempted] = useState(false);
    const [showGame, setShowGame] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        const newMsg = { text: input, role: 'user' };
        const updatedChat = [...messages, newMsg];
        setMessages(updatedChat);
        setInput('');

        await runSimulation(updatedChat);
    };

    const runSimulation = async (chatMessages) => {
        setLoading(true);
        try {
            const res = await worldsAPI.simulateContext(chatMessages, maxTokens);
            const data = res.data;
            setRetained(data.retained);
            setForgotten(data.forgotten);
            setStats(data);

            if (!attempted && data.forgotten.length > 0) {
                // Give badge only once they successfully trigger a forget event 
                // to prove they pushed the context limit
                addXP(20);
                completeWorld(7, 'context_wizard');
                toast.success('🧠 Context limit reached! +20 XP', { duration: 4000 });
                setAttempted(true);
            }
        } catch {
            toast.error('Backend not reachable!');
        }
        setLoading(false);
    };

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, position: 'relative', zIndex: 1 }}>
            <WorldHeader
                emoji="🧠" title="World 7: Context Window Lab"
                subtitle="Understand the AI's short-term memory limit and how it forgets over long conversations."
                onBack={() => navigate('/worlds')}
            />

            {!showGame ? (
                <div className="fade-in">
                    <div className="glass-card" style={{ padding: 32, marginBottom: 24, borderLeft: '4px solid #ec4899' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ec4899', marginBottom: 16 }}>
                            The AI's Short-Term Memory
                        </h2>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            Unlike a human who can remember things from years ago, an AI only remembers exactly what is currently inside its <strong>Context Window</strong>.
                            If it's not in the context window, the AI has completely forgotten it.
                        </p>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A1A2E', marginTop: 24, marginBottom: 12 }}>
                            The Sliding Window
                        </h3>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            Every AI model has a strict limit on how many tokens it can look at simultaneously. ChatGPT might have a limit of 128,000 tokens (roughly a 300-page book).
                            As your conversation grows longer and longer, eventually you hit that limit. When you do, the AI system simply drops the oldest messages from the top of the chat to make room for the new ones.
                        </p>

                        <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', marginTop: 24 }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                💡 Why Hallucinations Happen
                            </div>
                            <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                Imagine chatting with an AI for 3 hours. In the first 5 minutes, you mentioned your name was "Sarah". <br />
                                3 hours later, you ask "What's my name?". If those first messages have fallen out of the context window, the AI cannot confidently answer, and might hallucinate a fake name to try and sound helpful!
                            </p>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" style={{ width: '100%', fontSize: '1.1rem', padding: 18, background: '#ec4899' }} onClick={() => setShowGame(true)}>
                        Let's Play: Memory Limit Lab 🚀
                    </button>
                </div>
            ) : (
                <div className="fade-in">

                    <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, borderLeft: '3px solid #ec4899' }}>
                        <div style={{ fontSize: '0.8rem', color: '#ec4899', fontWeight: 700, marginBottom: 6 }}>🧠 WHAT IS A CONTEXT WINDOW?</div>
                        <p style={{ fontSize: '0.85rem', color: '#555566', lineHeight: 1.6 }}>
                            Every LLM has a strict limit on how many tokens it can hold in its "short-term memory" at once.
                            When a chat gets too long, the oldest messages are permanently pushed out of the window to make room for new ones.
                            If you refer to something you said an hour ago, the AI might hallucinate because it literally can no longer "see" that part of the chat!
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                        {/* Left: Chat Input */}
                        <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <div style={{ fontSize: '0.85rem', color: '#555566', fontWeight: 700, textTransform: 'uppercase' }}>Chat Simulator</div>
                                <div style={{ background: '#F3F4F6', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600 }}>
                                    Token Limit:
                                    <select value={maxTokens} onChange={(e) => { setMaxTokens(Number(e.target.value)); runSimulation(messages); }}
                                        style={{ background: 'none', border: 'none', fontWeight: 700, outline: 'none', marginLeft: 6, cursor: 'pointer' }}>
                                        <option value={20}>20 Tokens</option>
                                        <option value={40}>40 Tokens</option>
                                        <option value={100}>100 Tokens</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ flex: 1, background: '#F8F9FA', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, marginBottom: 16, minHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {messages.map((m, i) => (
                                    <div key={i} style={{
                                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                        background: m.role === 'user' ? '#1A1A2E' : '#E5E7EB',
                                        color: m.role === 'user' ? '#fff' : '#1A1A2E',
                                        padding: '10px 14px', borderRadius: 12, maxWidth: '80%', fontSize: '0.9rem'
                                    }}>
                                        {m.text}
                                    </div>
                                ))}
                                {messages.length === 0 && (
                                    <div style={{ color: '#9999AA', textAlign: 'center', marginTop: 100, fontStyle: 'italic' }}>Start typing to test the memory limit.</div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <input
                                    className="input-field"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Send a message..."
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    autoFocus
                                />
                                <button className="btn btn-primary" onClick={handleSend} disabled={loading || !input.trim()}>
                                    Send
                                </button>
                            </div>
                        </div>

                        {/* Right: AI Memory State */}
                        <div className="glass-card fade-in" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: '0.85rem', color: '#555566', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>
                                Active Context Window
                            </div>

                            {stats && (
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8, fontWeight: 600 }}>
                                        <span>Used: {stats.total_tokens_used} Tokens</span>
                                        <span>Limit: {stats.max_capacity} Tokens</span>
                                    </div>
                                    <div style={{ width: '100%', height: 10, background: '#E5E7EB', borderRadius: 100, overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${Math.min(stats.utilization_percent, 100)}%`, height: '100%',
                                            background: stats.utilization_percent > 90 ? '#dc2626' : '#ec4899',
                                            transition: 'width 0.3s'
                                        }} />
                                    </div>
                                </div>
                            )}

                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {/* Render Forgotten first (they are chronological, oldest at top) */}
                                {forgotten.map((m, i) => (
                                    <div key={`f-${i}`} style={{ padding: '12px 0', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', opacity: 0.4 }}>
                                        <div style={{ textDecoration: 'line-through', color: '#dc2626', fontSize: '0.9rem', width: '80%' }}>{m.text}</div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{m.tokens} tkns</div>
                                    </div>
                                ))}

                                {/* Render Retained next */}
                                {retained.map((m, i) => (
                                    <div key={`r-${i}`} style={{ padding: '12px 0', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between' }}>
                                        <div style={{ color: '#1A1A2E', fontSize: '0.9rem', width: '80%' }}>{m.text}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>{m.tokens} tkns</div>
                                    </div>
                                ))}

                                {messages.length === 0 && (
                                    <div style={{ color: '#9999AA', textAlign: 'center', marginTop: 100 }}>Memory is completely empty.</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
