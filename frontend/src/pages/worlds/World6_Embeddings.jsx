import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { worldsAPI } from '../../services/api';
import { WorldHeader } from './World1_Basics';
import toast from 'react-hot-toast';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';

export default function World6() {
    const navigate = useNavigate();
    const { addXP, completeWorld } = useGame();
    const [wordInput, setWordInput] = useState('Dog, Cat, Car, Bus, Apple, Banana');
    const [embeddings, setEmbeddings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [attempted, setAttempted] = useState(false);
    const [showGame, setShowGame] = useState(false);

    // Compute Graph Data for 3D View
    const graphData = useMemo(() => {
        const nodes = embeddings.map((emb, i) => ({
            id: emb.word,
            x: emb.x * 20, // Spread out x
            y: emb.y * 20, // Spread out y
            z: Math.random() * 40 - 20, // Add random depth to simulate high dimensions
            color: '#10b981', // Emerald green
        }));

        const links = [];
        // Connect nodes that are close to each other (simulating semantic clusters)
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 400) { // Connect if "semantically close"
                    links.push({ source: nodes[i].id, target: nodes[j].id });
                }
            }
        }
        return { nodes, links };
    }, [embeddings]);

    const handleMap = async () => {
        const words = wordInput.split(',').map(w => w.trim()).filter(w => w);
        if (words.length === 0) return;

        setLoading(true);
        try {
            const res = await worldsAPI.mapEmbeddings(words);
            setEmbeddings(res.data.embeddings);

            if (!attempted) {
                addXP(20);
                completeWorld(6, 'ai_explorer'); // Badge reuse for now
                toast.success('🗺️ +20 XP!', { duration: 3000 });
                setAttempted(true);
            }
        } catch {
            toast.error('Backend not reachable!');
        }
        setLoading(false);
    };

    useEffect(() => { handleMap(); }, []); // Intial load

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, position: 'relative', zIndex: 1 }}>
            <WorldHeader
                emoji="🗺️" title="World 6: Embeddings Lab"
                subtitle="Discover how AI turns words into numbers and maps them in multi-dimensional space."
                onBack={() => navigate('/worlds')}
            />

            {!showGame ? (
                <div className="fade-in">
                    <div className="glass-card" style={{ padding: 32, marginBottom: 24, borderLeft: '4px solid #10b981' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginBottom: 16 }}>
                            Turning Words into Numbers
                        </h2>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            Computers can only do math. They don't know what "Apple" means, nor do they know that an "Apple" is more similar to an "Orange" than a "Car".
                            To solve this, AI converts words into lists of numbers called <strong>Vector Embeddings</strong>.
                        </p>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A1A2E', marginTop: 24, marginBottom: 12 }}>
                            Mapping Meaning in Space
                        </h3>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            Imagine a 3D graph where X is "how alive", Y is "how red", and Z is "how big".
                            <br /><br />
                            <code>Apple = [0.8, 0.9, 0.1]</code><br />
                            <code>Firetruck = [0.0, 0.9, 0.9]</code><br />
                            <code>Dog = [0.9, 0.1, 0.3]</code><br /><br />
                            Now, imagine this graph has <strong>4,000 dimensions</strong> instead of 3. That mathematical coordinate is the "Embedding". By calculating the distance between two coordinates, the AI can mathematically prove that "Dog" is closer to "Cat" than "Firetruck".
                        </p>

                        <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', marginTop: 24 }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                💡 King - Man + Woman = Queen
                            </div>
                            <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                Because meaning is turned into math, you can actually do algebra with concepts! If you take the coordinates for King, subtract the "maleness" vector, and add the "femaleness" vector, you land exactly on the coordinate for Queen.
                            </p>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" style={{ width: '100%', fontSize: '1.1rem', padding: 18, background: '#10b981' }} onClick={() => setShowGame(true)}>
                        Let's Play: 3D Mapping Lab 🚀
                    </button>
                </div>
            ) : (
                <div className="fade-in">

                    <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, borderLeft: '3px solid #10b981' }}>
                        <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, marginBottom: 6 }}>🗺️ WHAT ARE EMBEDDINGS?</div>
                        <p style={{ fontSize: '0.85rem', color: '#555566', lineHeight: 1.6 }}>
                            AI doesn't understand english words directly. It converts every word into a long list of numbers (a vector) and plots it in space.
                            Words with similar meanings (like "Dog" and "Cat") are plotted very close to each other. Unrelated words (like "Car" and "Banana") are far apart!
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                        <div style={{ marginBottom: 8, fontSize: '0.85rem', color: '#555566', fontWeight: 600 }}>Enter words to plot (comma separated):</div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <input
                                className="input-field"
                                value={wordInput}
                                onChange={e => setWordInput(e.target.value)}
                                placeholder="e.g. King, Queen, Man, Woman"
                                onKeyDown={e => e.key === 'Enter' && handleMap()}
                            />
                            <button className="btn btn-primary" onClick={handleMap} disabled={loading || !wordInput.trim()}>
                                {loading ? 'Plotting...' : 'Map Words →'}
                            </button>
                        </div>
                    </div>

                    <div className="glass-card fade-in" style={{ padding: 24 }}>
                        <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                            2D Semantic Space Visualization (Simplified from 4096 dimensions)
                        </div>

                        <div style={{
                            position: 'relative', width: '100%', height: 400,
                            background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12,
                            overflow: 'hidden', cursor: 'grab'
                        }}>
                            {embeddings.length > 0 ? (
                                <ForceGraph3D
                                    graphData={graphData}
                                    width={800}
                                    height={400}
                                    nodeAutoColorBy="group"
                                    nodeLabel="id"
                                    nodeRelSize={8}
                                    backgroundColor="#0f172a"
                                    linkWidth={2}
                                    linkOpacity={0.2}
                                    nodeThreeObject={node => {
                                        const sprite = new SpriteText(node.id);
                                        sprite.color = node.color;
                                        sprite.textHeight = 8;
                                        sprite.fontWeight = 'bold';
                                        return sprite;
                                    }}
                                />
                            ) : (
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#94a3b8' }}>
                                    Plot words to see them in 3D outer space!
                                </div>
                            )}
                        </div>

                        <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 10, padding: '12px 16px', fontSize: '0.85rem', color: '#555566', marginTop: 24 }}>
                            💡 Notice how items from the same conceptual category clump together into neighborhoods!
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
