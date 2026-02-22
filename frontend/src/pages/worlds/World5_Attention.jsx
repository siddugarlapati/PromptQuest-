import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { worldsAPI } from '../../services/api';
import { WorldHeader } from './World1_Basics';
import toast from 'react-hot-toast';
import ForceGraph2D from 'react-force-graph-2d';

export default function World5() {
    const navigate = useNavigate();
    const { addXP, completeWorld } = useGame();
    const [prompt, setPrompt] = useState('Explain how quantum computing works in simple terms.');
    const [focusWord, setFocusWord] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [attempted, setAttempted] = useState(false);
    const [showGame, setShowGame] = useState(false);

    const handleAnalyze = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        try {
            const res = await worldsAPI.analyzeAttention(prompt, focusWord);
            setResult(res.data);
            if (!attempted) {
                addXP(20);
                completeWorld(5, 'truth_seeker');
                toast.success('🎯 +20 XP!', { duration: 3000 });
                setAttempted(true);
            }
        } catch {
            toast.error('Backend not reachable!');
        }
        setLoading(false);
    };

    // Build the Graph Data
    const graphData = useMemo(() => {
        if (!result) return { nodes: [], links: [] };

        const nodes = result.tokens.map((tok, i) => ({
            id: i,
            name: tok.token,
            val: Math.max(1, tok.attention * 20), // Node size based on attention
            color: tok.attention > 0.6 ? '#dc2626' : (tok.attention > 0.3 ? '#f59e0b' : '#3b82f6'),
            attention: tok.attention
        }));

        const links = [];

        // Connect adjacent words to keep sentence structure
        for (let i = 0; i < nodes.length - 1; i++) {
            links.push({ source: i, target: i + 1, value: 0.5, color: 'rgba(0,0,0,0.1)' });
        }

        // Connect words to the "Top Focus Words" to show attention heads pulling
        const topIndices = result.tokens
            .map((t, i) => ({ t, i }))
            .filter(obj => result.top_tokens.includes(obj.t.token))
            .map(obj => obj.i);

        for (let i = 0; i < nodes.length; i++) {
            for (let j of topIndices) {
                if (i !== j) {
                    // Pull strength based on the target token's high attention weight
                    links.push({
                        source: i,
                        target: j,
                        value: nodes[j].attention * 2,
                        color: `rgba(220, 38, 38, ${nodes[j].attention * 0.3})`
                    });
                }
            }
        }

        return { nodes, links };
    }, [result]);

    const renderNode = useCallback((node, ctx, globalScale) => {
        const label = node.name;
        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // padding

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = node.color;
        ctx.fillText(label, node.x, node.y);

        node.__bckgDimensions = bckgDimensions; // keep bounds for click detection
    }, []);

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, position: 'relative', zIndex: 1 }}>
            <WorldHeader
                emoji="🎯" title="World 5: Attention Lab"
                subtitle="See exactly which words the AI assigns the most &quot;weight&quot; to in your prompt."
                onBack={() => navigate('/worlds')}
            />

            {!showGame ? (
                <div className="fade-in">
                    <div className="glass-card" style={{ padding: 32, marginBottom: 24, borderLeft: '4px solid #d97706' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginBottom: 16 }}>
                            Not All Words Are Equal
                        </h2>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            When you give an AI a giant block of text, how does it know what is actually important versus what is just filler?
                            The secret sauce is the <strong>Attention Mechanism</strong>.
                        </p>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A1A2E', marginTop: 24, marginBottom: 12 }}>
                            Calculating Relevance
                        </h3>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            Attention assigns a mathematical <strong>weight</strong> (or importance score) to every single token in the prompt.
                            If you tell the AI "Please summarize this document about quantum computing," the model assigns extremely high attention weights to the words <code>summarize</code> and <code>quantum computing</code>, while ignoring words like <code>please</code> and <code>this</code>.
                        </p>

                        <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', marginTop: 24 }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                💡 The Gravity Well Analogy
                            </div>
                            <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                Think of important words as having high mass. They create "gravity wells." <br />
                                Less important words in the sentence orbit around these high-mass words, allowing the AI to understand the core intent of your sentence without getting distracted by the fluff.
                            </p>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" style={{ width: '100%', fontSize: '1.1rem', padding: 18, background: '#d97706' }} onClick={() => setShowGame(true)}>
                        Let's Play: Attention Gravity Lab 🚀
                    </button>
                </div>
            ) : (
                <div className="fade-in">

                    <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, borderLeft: '3px solid #d97706' }}>
                        <div style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 700, marginBottom: 6 }}>🎯 VISUALIZING PROMPT ATTENTION</div>
                        <p style={{ fontSize: '0.85rem', color: '#555566', lineHeight: 1.6 }}>
                            Not all words are equal! The AI "pays attention" more heavily to nouns, verbs, and instruction keywords (like "explain", "summarize").
                            Below, words with higher attention weights act as gravity wells, pulling context from surrounding words.
                        </p>
                    </div>

                    {/* Input */}
                    <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <div style={{ marginBottom: 8, fontSize: '0.85rem', color: '#555566', fontWeight: 600 }}>Enter a prompt:</div>
                                <textarea
                                    className="input-field"
                                    style={{ minHeight: 80, padding: 16, width: '100%', resize: 'none' }}
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                />
                            </div>

                            <div>
                                <div style={{ marginBottom: 8, fontSize: '0.85rem', color: '#555566', fontWeight: 600 }}>Force focus on a specific word (Optional):</div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <input
                                        className="input-field"
                                        value={focusWord}
                                        onChange={e => setFocusWord(e.target.value)}
                                        placeholder="e.g. quantum"
                                        style={{ width: 250 }}
                                    />
                                    <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading || !prompt.trim()}>
                                        {loading ? '...' : 'Compute Attention →'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Token Output */}
                    {result && (
                        <div className="glass-card fade-in" style={{ padding: 28 }}>

                            <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>
                                Interactive Attention Graph (Drag Nodes)
                            </div>

                            <div style={{ width: '100%', height: 400, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'grab' }}>
                                <ForceGraph2D
                                    width={800}
                                    height={400}
                                    graphData={graphData}
                                    nodeAutoColorBy="group"
                                    linkColor="color"
                                    linkWidth={link => link.value}
                                    nodeCanvasObject={renderNode}
                                    nodePointerAreaPaint={(node, color, ctx) => {
                                        ctx.fillStyle = color;
                                        const bckgDimensions = node.__bckgDimensions;
                                        bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
                                    }}
                                />
                            </div>

                            <div style={{ background: '#F8F9FA', borderRadius: 12, padding: '16px 20px', border: '1px solid #E5E7EB', marginTop: 24 }}>
                                <div style={{ fontSize: '0.8rem', color: '#555566', fontWeight: 600, marginBottom: 8 }}>Top Focus Words (Gravity Centers):</div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {result.top_tokens.map((t, idx) => (
                                        <div key={idx} style={{ background: '#1A1A2E', color: 'white', padding: '6px 16px', borderRadius: 100, fontSize: '0.9rem', fontWeight: 600 }}>
                                            #{idx + 1} {t}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.18)', borderRadius: 10, padding: '12px 16px', fontSize: '0.85rem', color: '#555566', marginTop: 24 }}>
                                💡 {result.explanation}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
