import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { WorldHeader } from './World1_Basics';
import api from '../../services/api';
import { ragAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function World11() {
    const navigate = useNavigate();
    const { addXP, completeWorld } = useGame();

    const [file, setFile] = useState(null);
    const [uploadStats, setUploadStats] = useState(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [attempted, setAttempted] = useState(false);
    const [querying, setQuerying] = useState(false);
    const [showGame, setShowGame] = useState(false);

    const dbStats = uploadStats || { state: 'empty', chunks: 0 };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a PDF file first!');
            return;
        }
        setLoading(true);
        try {
            const res = await ragAPI.uploadPDF(file);
            if (res.data.error) {
                toast.error(res.data.error);
            } else {
                setUploadStats(res.data);
                toast.success('PDF Processed & Embedded into Vector DB!');
            }
        } catch {
            toast.error('Failed to parse PDF from backend.');
        }
        setLoading(false);
    };

    const handleClearDB = async () => {
        try {
            await api.delete('/rag/reset');
            setUploadStats(null); // Reset upload stats
            setResults(null);
            toast.success('Vector database cleared.');
        } catch (e) {
            toast.error('Failed to clear database.');
        }
    };

    const handleQuery = async () => {
        if (!query.trim() || dbStats.state === 'empty') return;
        setQuerying(true);
        try {
            const res = await api.post('/rag/query', { query });
            setResults(res.data);
            if (!attempted) {
                addXP(25);
                completeWorld(11, 'rag_architect');
                toast.success('🧠 +25 XP! RAG Search Complete');
                setAttempted(true);
            }
        } catch (e) {
            toast.error('Query failed.');
        }
        setQuerying(false);
    };

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, position: 'relative', zIndex: 1 }}>
            <WorldHeader
                emoji="📚" title="World 11: RAG & Vector DB"
                subtitle="Teach an AI new knowledge by storing text as math (vectors), then searching for it."
                onBack={() => navigate('/worlds')}
            />

            {!showGame ? (
                <div className="fade-in">
                    <div className="glass-card" style={{ padding: 32, marginBottom: 24, borderLeft: '4px solid #6366f1' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1', marginBottom: 16 }}>
                            Giving AI Custom Knowledge
                        </h2>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            AI models are trained on terrible, massive amounts of data—but they don't know your company's private docs, your medical records, or news that happened yesterday.
                            You can't just paste a 10,000-page book into the prompt box because of the <strong>Context Window limit</strong> we learned about earlier.
                        </p>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A1A2E', marginTop: 24, marginBottom: 12 }}>
                            Enter: Retrieval-Augmented Generation (RAG)
                        </h3>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            Instead of giving the AI the whole book, we: <br /><br />
                            1. <strong>Chunk & Embed:</strong> Chop the textbook into paragraphs and turn each paragraph into a mathematical coordinate (an <strong>Embedding</strong>).<br />
                            2. <strong>Vector DB:</strong> Store all these coordinates in a special database.<br />
                            3. <strong>Retrieve:</strong> When the user asks "How do I fix the engine?", we convert the question into math, find the single paragraph in the database that is mathematically closest to the question, and pull it out.<br />
                            4. <strong>Augment & Generate:</strong> We silently attach that <em>one paragraph</em> to the user's prompt and say, "Answer the question using only this context."
                        </p>

                        <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', marginTop: 24 }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                💡 The Industry Standard
                            </div>
                            <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                RAG is the single most important architecture in enterprise AI right now. Every "Chat with PDF" app or internal company AI operates using exactly this mechanism!
                            </p>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" style={{ width: '100%', fontSize: '1.1rem', padding: 18, background: '#6366f1', color: 'white', border: 'none' }} onClick={() => setShowGame(true)}>
                        Let's Play: Build a RAG Pipeline 🚀
                    </button>
                </div>
            ) : (
                <div className="fade-in">

                    <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, borderLeft: '3px solid #6366f1' }}>
                        <div style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 700, marginBottom: 6 }}>📚 RETRIEVAL-AUGMENTED GENERATION (RAG)</div>
                        <p style={{ fontSize: '0.85rem', color: '#555566', lineHeight: 1.6 }}>
                            Real AI models can't memorize everything. RAG solves this by letting you upload documents to a "Vector Database".
                            When you ask a question, the database finds the most mathematically similar text chunks and gives them to the AI to read!
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 24, flexDirection: 'row', flexWrap: 'wrap' }}>

                        {/* Left Side: Upload Document */}
                        <div style={{ flex: '1 1 400px' }}>
                            <div className="glass-card" style={{ padding: 24, height: '100%' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>1. Build Vector Database</span>
                                    <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: 100, background: dbStats.state === 'ready' ? '#dcfce7' : '#fee2e2', color: dbStats.state === 'ready' ? '#16a34a' : '#ef4444' }}>
                                        {dbStats.state === 'ready' ? `✅ ${dbStats.chunks} Chunks Loaded` : '🔴 DB Empty'}
                                    </span>
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: 16 }}>
                                    Drop a PDF document below. The system will extract the text, chunk it, and convert it into high-dimensional space.
                                </p>

                                <div style={{
                                    border: '2px dashed #cbd5e1',
                                    borderRadius: 12,
                                    padding: 32,
                                    textAlign: 'center',
                                    background: '#f8fafc',
                                    marginBottom: 16,
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 12
                                }}>
                                    <div style={{ fontSize: '2.5rem' }}>📄</div>
                                    <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
                                        {file ? file.name : 'Click to upload a .pdf'}
                                    </div>
                                    {file && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{(file.size / 1024).toFixed(1)} KB</div>}

                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleFileChange}
                                        style={{
                                            opacity: 0,
                                            position: 'absolute',
                                            top: 0, left: 0, width: '100%', height: '100%',
                                            cursor: 'pointer'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleUpload} disabled={loading || !file}>
                                        {loading ? 'Parsing PDF...' : 'Extract & Embed PDF'}
                                    </button>
                                    <button className="btn btn-secondary" onClick={handleClearDB} disabled={!uploadStats}>
                                        Clear DB
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Query RAG */}
                        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div className="glass-card" style={{ padding: 24 }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>2. Vector Similarity Search</h3>
                                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: 16 }}>
                                    Ask a question. The database will find the most relevant chunks using "Cosine Similarity" math.
                                </p>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <input
                                        className="input-field"
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        placeholder="E.g. Where is the university?"
                                        style={{ flex: 1 }}
                                    />
                                    <button className="btn btn-primary" onClick={handleQuery} disabled={querying || dbStats.state === 'empty'}>
                                        {querying ? 'Searching...' : 'Search DB 🔍'}
                                    </button>
                                </div>
                            </div>

                            {/* Results */}
                            {results && (
                                <div className="glass-card fade-in" style={{ padding: 24, flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                                        Retrieved Context Chunks
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {results.retrieved_chunks.map((chunk, i) => (
                                            <div key={i} style={{ padding: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', position: 'relative' }}>
                                                <div style={{ position: 'absolute', top: -10, left: 16, background: '#6366f1', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
                                                    Rank #{chunk.rank}
                                                </div>
                                                <div style={{ position: 'absolute', top: -10, right: 16, background: '#10b981', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
                                                    {Math.round(chunk.similarity_score * 100)}% Match
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: '#334', lineHeight: 1.5, marginTop: 8 }}>
                                                    "{chunk.text}"
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 10, padding: '12px 16px', fontSize: '0.85rem', color: '#555566', marginTop: 20 }}>
                                        💡 <strong>How an LLM uses this:</strong> It takes your hidden question and silently glues these returned chunks next to it, saying: "Based on this retrieved text, answer the user's question."
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
