import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { WorldHeader } from './World1_Basics';
import { ollamaAPI, ragAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function World14_PersonalAI() {
    const navigate = useNavigate();
    const { addXP, completeWorld } = useGame();

    // State for local model setup
    const [modelCheckLoading, setModelCheckLoading] = useState(false);
    const [ollamaStatus, setOllamaStatus] = useState('unknown'); // 'unknown', 'online', 'offline'

    // State for RAG Chat
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [hasContext, setHasContext] = useState(false);

    const [chatInput, setChatInput] = useState('');
    const [isTalkingToAI, setIsTalkingToAI] = useState(false);
    const [chatLog, setChatLog] = useState([
        { role: 'ai', content: 'Hello! I am your Local AI. Upload a PDF document above to give me some Memory Context, and then ask me questions about it!' }
    ]);

    const checkOllama = async () => {
        setModelCheckLoading(true);
        try {
            await ollamaAPI.checkStatus();
            setOllamaStatus('online');
            toast.success('Ollama is online and ready!');
        } catch {
            setOllamaStatus('offline');
            toast.error('Ollama not detected on port 11434.');
        }
        setModelCheckLoading(false);
    };

    const handleFileUpload = async (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        setFile(selectedFile);

        setIsUploading(true);
        try {
            const res = await ragAPI.uploadPDF(selectedFile);
            if (res.data.error) {
                toast.error(res.data.error);
            } else {
                setHasContext(true);
                toast.success('PDF Processed into Vector DB Context!');
                setChatLog(prev => [...prev, { role: 'system', content: `[SYSTEM: PDF "${selectedFile.name}" has been embedded into Vector Memory.]` }]);
            }
        } catch {
            toast.error('Failed to parse PDF.');
        }
        setIsUploading(false);
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim() || ollamaStatus !== 'online') return;

        const userQuery = chatInput;
        setChatInput('');
        setChatLog(prev => [...prev, { role: 'user', content: userQuery }]);
        setIsTalkingToAI(true);

        try {
            // STEP 1: RAG Retrieval (MockVectorDB)
            let context = '';
            if (hasContext) {
                const ragRes = await ragAPI.query(userQuery);
                if (ragRes.data.retrieved_chunks) {
                    context = ragRes.data.retrieved_chunks.map(c => c.text).join(' ');
                }
            }

            // STEP 2: Augment Prompt
            const systemPrompt = "You are a helpful student assistant AI running locally. Use the provided context to answer the user's question. If the context doesn't have the answer, say so.";
            const augmentedPrompt = hasContext
                ? `Context information:\n${context}\n\nUser Question: ${userQuery}`
                : userQuery;

            // STEP 3: Generation (Local Ollama Llama3)
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3.2:3b',
                    prompt: augmentedPrompt,
                    system: systemPrompt,
                    stream: false
                })
            });

            if (!response.ok) throw new Error('Ollama failed to respond');

            const data = await response.json();
            setChatLog(prev => [...prev, { role: 'ai', content: data.response }]);

            // Give XP
            addXP(50);
            completeWorld(14, 'system_architect');

        } catch (err) {
            toast.error('Ollama Generation failed. Make sure Ollama is running `llama3.2:3b`.');
            setChatLog(prev => [...prev, { role: 'ai', content: 'Connection to local Llama-3 brain failed. Are you sure you ran `ollama run llama3.2:3b` in your terminal?' }]);
        }

        setIsTalkingToAI(false);
    };

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, position: 'relative', zIndex: 1 }}>
            <WorldHeader
                emoji="🎓" title="World 14: The Personal AI Hub"
                subtitle="The Capstone Project. Build a real local chatbot connected to a RAG Vector Database."
                onBack={() => navigate('/worlds')}
            />

            <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, borderLeft: '3px solid #8b5cf6' }}>
                <div style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 700, marginBottom: 6 }}>🎓 CAPSTONE: LOCAL AI & VIBE CODING</div>
                <p style={{ fontSize: '0.85rem', color: '#555566', lineHeight: 1.6 }}>
                    You have learned Tokens, Embeddings, Attention, and Vector Databases. Now it is time to put it all together.
                    You are going to run a <strong>real Large Language Model (Llama-3.2:3b) locally on your own computer</strong>, completely offline and private.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Step 1: Install Ollama */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Step 1: Install the Brain (Ollama)</h3>
                    <p style={{ fontSize: '0.85rem', color: '#555566', marginBottom: 16 }}>
                        Ollama is a tool that lets you run powerful AI models right on your Mac/PC without needing OpenAI API keys.
                    </p>
                    <div style={{ background: '#0f172a', padding: 16, borderRadius: 8, color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: 16 }}>
                        <div>1. Download Ollama from ollama.com</div>
                        <div>2. Open a terminal and run:</div>
                        <div style={{ color: '#22c55e', marginTop: 8 }}>$ ollama run llama3.2:3b</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: ollamaStatus === 'online' ? '#dcfce7' : '#f1f5f9', borderRadius: 8, maxWidth: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: ollamaStatus === 'online' ? '#22c55e' : ollamaStatus === 'offline' ? '#ef4444' : '#cbd5e1' }} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
                                {ollamaStatus === 'online' ? 'Llama-3 Online' : ollamaStatus === 'offline' ? 'Ollama Not Detected' : 'Waiting for connection...'}
                            </span>
                        </div>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={checkOllama} disabled={modelCheckLoading}>
                            {modelCheckLoading ? 'Checking...' : 'Ping Ollama'}
                        </button>
                    </div>
                </div>

                {/* Step 2: Python Tutorial */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Step 2: Code Your Own RAG (Python)</h3>
                    <p style={{ fontSize: '0.85rem', color: '#555566', marginBottom: 16 }}>
                        Instead of just using a UI, you can build your own terminal chatbot from scratch! Using the <code>ollama</code> and <code>chromadb</code> Python libraries, a RAG pipeline takes less than 20 lines of code.
                    </p>
                    <div style={{ background: '#0f172a', padding: 20, borderRadius: 8, color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.85rem', overflowX: 'auto', lineHeight: 1.5 }}>
                        <pre style={{ margin: 0 }}>
                            <span style={{ color: '#c678dd' }}>import</span> ollama{'\n'}
                            <span style={{ color: '#c678dd' }}>import</span> chromadb{'\n'}
                            {'\n'}
                            <span style={{ color: '#5c6370', fontStyle: 'italic' }}># 1. Initialize Vector Database</span>{'\n'}
                            client = chromadb.Client(){'\n'}
                            collection = client.create_collection(name=<span style={{ color: '#98c379' }}>"docs"</span>){'\n'}
                            {'\n'}
                            <span style={{ color: '#5c6370', fontStyle: 'italic' }}># 2. Add Documents (Embeddings are created mathematically in the background)</span>{'\n'}
                            collection.add({'\n'}
                            {'    '}documents=[<span style={{ color: '#98c379' }}>"The midterm is on Oct 15th."</span>, <span style={{ color: '#98c379' }}>"The final is worth 40%."</span>],{'\n'}
                            {'    '}ids=[<span style={{ color: '#98c379' }}>"doc1"</span>, <span style={{ color: '#98c379' }}>"doc2"</span>]{'\n'}
                            ){'\n'}
                            {'\n'}
                            <span style={{ color: '#5c6370', fontStyle: 'italic' }}># 3. Retrieve Context based on Question</span>{'\n'}
                            question = <span style={{ color: '#98c379' }}>"When is the midterm?"</span>{'\n'}
                            results = collection.query(query_texts=[question], n_results=<span style={{ color: '#d19a66' }}>1</span>){'\n'}
                            context = results[<span style={{ color: '#98c379' }}>'documents'</span>][<span style={{ color: '#d19a66' }}>0</span>][<span style={{ color: '#d19a66' }}>0</span>]{'\n'}
                            {'\n'}
                            <span style={{ color: '#5c6370', fontStyle: 'italic' }}># 4. Generate Response using Local Ollama</span>{'\n'}
                            prompt = <span style={{ color: '#61afef' }}>f</span><span style={{ color: '#98c379' }}>"Using this context: </span>{'{context}'}<span style={{ color: '#98c379' }}>\\n\\nAnswer: </span>{'{question}'}<span style={{ color: '#98c379' }}>"</span>{'\n'}
                            response = ollama.generate(model=<span style={{ color: '#98c379' }}>"llama3.2:3b"</span>, prompt=prompt){'\n'}
                            {'\n'}
                            <span style={{ color: '#61afef' }}>print</span>(response[<span style={{ color: '#98c379' }}>'response'</span>]){'\n'}
                        </pre>
                    </div>
                </div>

                <h3 style={{ fontSize: '1.4rem', color: '#1A1A2E', marginTop: 16 }}>Step 3: Test the Interactive Web UI</h3>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>

                    {/* Upload Memory (Left) */}
                    <div className="glass-card" style={{ padding: 24, flex: '1 1 300px' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Upload Memory (RAG DB)</h3>
                        <p style={{ fontSize: '0.85rem', color: '#555566', marginBottom: 16 }}>
                            Llama-3 doesn't know about your university assignments. Let's give it "Retrieval-Augmented Generation" memory by uploading a PDF into our Vector DB.
                        </p>

                        <div style={{
                            border: '2px dashed #cbd5e1', borderRadius: 12, padding: 32, textAlign: 'center', background: '#f8fafc',
                            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative'
                        }}>
                            <div style={{ fontSize: '2.5rem' }}>📄</div>
                            <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
                                {isUploading ? 'Extracting text...' : file ? file.name : 'Upload .pdf to Vector DB'}
                            </div>
                            <input type="file" accept="application/pdf" onChange={handleFileUpload} style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                        </div>
                    </div>

                    {/* Right Side: The Chatbot App */}
                    <div className="glass-card" style={{ flex: '1 1 500px', padding: 0, display: 'flex', flexDirection: 'column', height: 650, overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>Personal RAG Assistant</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Powered by Local Llama-3 & Embeddings</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <span style={{ fontSize: '0.7rem', background: ollamaStatus === 'online' ? '#22c55e' : '#cbd5e1', color: 'white', padding: '4px 8px', borderRadius: 100, fontWeight: 600 }}>LLM</span>
                                <span style={{ fontSize: '0.7rem', background: hasContext ? '#6366f1' : '#cbd5e1', color: 'white', padding: '4px 8px', borderRadius: 100, fontWeight: 600 }}>VECTOR DB</span>
                            </div>
                        </div>

                        <div style={{ flex: 1, padding: 20, overflowY: 'auto', background: '#fff', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {chatLog.map((msg, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : msg.role === 'system' ? 'center' : 'flex-start' }}>
                                    <div style={{
                                        maxWidth: '80%', padding: '12px 16px', borderRadius: 16, fontSize: '0.9rem', lineHeight: 1.5,
                                        background: msg.role === 'user' ? '#38bdf8' : msg.role === 'system' ? '#f1f5f9' : '#f8fafc',
                                        color: msg.role === 'user' ? '#fff' : msg.role === 'system' ? '#64748b' : '#334155',
                                        border: msg.role === 'ai' ? '1px solid #e2e8f0' : 'none',
                                        borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                                        borderBottomLeftRadius: msg.role === 'ai' ? 4 : 16,
                                        fontStyle: msg.role === 'system' ? 'italic' : 'normal'
                                    }}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isTalkingToAI && (
                                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                    <div style={{ padding: '12px 16px', borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '0.9rem' }}>
                                        Llama-3 is thinking...
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ padding: 16, borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <input
                                    className="input-field"
                                    style={{ flex: 1, padding: '12px 16px', borderRadius: 100 }}
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={ollamaStatus !== 'online' ? "Ping Ollama top-left first..." : "Ask your local AI something..."}
                                    disabled={ollamaStatus !== 'online' || isTalkingToAI}
                                />
                                <button
                                    className="btn btn-primary"
                                    style={{ borderRadius: 100, width: 44, height: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={handleSendMessage}
                                    disabled={ollamaStatus !== 'online' || isTalkingToAI || !chatInput.trim()}
                                >
                                    ⬆️
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
