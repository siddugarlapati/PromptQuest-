import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { WorldHeader } from './World1_Basics';
import toast from 'react-hot-toast';

// A mock simulator of an AI streaming code and rendering it dynamically
export default function World13_GenerativeUI() {
    const navigate = useNavigate();
    const { addXP, completeWorld } = useGame();

    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [streamedCode, setStreamedCode] = useState('');
    const [previewActive, setPreviewActive] = useState(false);
    const [attempted, setAttempted] = useState(false);
    const [showGame, setShowGame] = useState(false);

    // Pre-written mock response for educational simulation
    const calculatorCode = `function Calculator() {
  const [display, setDisplay] = React.useState('0');
  
  const handleNum = (num) => {
    setDisplay(display === '0' ? num : display + num);
  };
  const handleClear = () => setDisplay('0');
  const handleEq = () => {
    try { setDisplay(eval(display).toString()); }
    catch { setDisplay('Error'); }
  };

  return (
    <div style={{ background: '#1e293b', padding: 24, borderRadius: 16, width: 280, color: 'white', fontFamily: 'monospace' }}>
      <div style={{ background: '#0f172a', padding: 16, fontSize: 32, textAlign: 'right', borderRadius: 8, marginBottom: 16 }}>
        {display}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map(btn => (
          <button 
            key={btn}
            onClick={() => btn === 'C' ? handleClear() : btn === '=' ? handleEq() : handleNum(btn)}
            style={{ 
              padding: '16px 0', fontSize: 20, borderRadius: 8, cursor: 'pointer', border: 'none',
              background: btn === '=' ? '#10b981' : btn === 'C' ? '#ef4444' : '#334155', color: 'white'
            }}>
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}`;

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setStreamedCode('');
        setPreviewActive(false);

        // Simulate streaming tokens from an LLM
        let currentCode = '';
        for (let i = 0; i < calculatorCode.length; i++) {
            currentCode += calculatorCode[i];
            setStreamedCode(currentCode);
            // Wait 5ms between characters to simulate token streaming
            await new Promise(r => setTimeout(r, 5));
        }

        setIsGenerating(false);
        setPreviewActive(true);

        if (!attempted && prompt.toLowerCase().includes('calculator')) {
            addXP(30);
            completeWorld(13, 'ai_explorer');
            toast.success('🛠️ Vibe Coding Successful! +30 XP');
            setAttempted(true);
        } else if (!attempted) {
            toast('Try prompting specifically for a "Calculator" to earn XP.', { icon: '💡' });
        }
    };

    // Actual executable React component that is "generated"
    const RenderedCalculator = () => {
        const [display, setDisplay] = useState('0');
        const handleNum = (num) => setDisplay(display === '0' ? num : display + num);
        const handleClear = () => setDisplay('0');
        const handleEq = () => {
            try { setDisplay(eval(display).toString()); }
            catch { setDisplay('Error'); }
        };

        return (
            <div style={{ background: '#1e293b', padding: 24, borderRadius: 16, width: 280, color: 'white', fontFamily: 'monospace', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}>
                <div style={{ background: '#0f172a', padding: 16, fontSize: 32, textAlign: 'right', borderRadius: 8, marginBottom: 16 }}>{display}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'].map(btn => (
                        <button
                            key={btn}
                            onClick={() => btn === 'C' ? handleClear() : btn === '=' ? handleEq() : handleNum(btn)}
                            style={{ padding: '16px 0', fontSize: 20, borderRadius: 8, cursor: 'pointer', border: 'none', background: btn === '=' ? '#10b981' : btn === 'C' ? '#ef4444' : '#334155', color: 'white' }}
                        >
                            {btn}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, position: 'relative', zIndex: 1 }}>
            <WorldHeader
                emoji="🛠️" title="World 13: Vibe Coding (Generative UI)"
                subtitle="Teach AI what you want, and watch it write and render the software instantly like Cursor or v0.dev."
                onBack={() => navigate('/worlds')}
            />

            {!showGame ? (
                <div className="fade-in">
                    <div className="glass-card" style={{ padding: 32, marginBottom: 24, borderLeft: '4px solid #ec4899' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ec4899', marginBottom: 16 }}>
                            "Vibe Coding" & Generative UI
                        </h2>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            For decades, creating software meant writing complex syntax line by line. But because AI models have been trained on millions of GitHub repositories, they can now <strong>write code fluently</strong>.
                        </p>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A1A2E', marginTop: 24, marginBottom: 12 }}>
                            The Shift from Writing to Directing
                        </h3>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            When you combine a powerful LLM with a real-time web browser, something magical happens. You just type what you want in plain English, the AI streams the React or HTML code, and the browser renders it instantly.
                            <br /><br />
                            This has led to a new paradigm called <strong>"Vibe Coding"</strong>—where anyone can build functional software just by describing the "vibe" or the rules of what they want, without knowing the underlying syntax.
                        </p>

                        <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', marginTop: 24 }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                💡 The Future of Software
                            </div>
                            <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                Tools like Cursor, v0.dev, and GitHub Copilot Workspaces use this exact mechanic. The barrier to entry for building apps has permanently dropped from "knowing how to code" to "knowing what you want to build."
                            </p>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" style={{ width: '100%', fontSize: '1.1rem', padding: 18, background: '#ec4899', color: 'white', border: 'none' }} onClick={() => setShowGame(true)}>
                        Let's Play: Generate an App 🚀
                    </button>
                </div>
            ) : (
                <div className="fade-in">

                    <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, borderLeft: '3px solid #ec4899' }}>
                        <div style={{ fontSize: '0.8rem', color: '#ec4899', fontWeight: 700, marginBottom: 6 }}>🧠 WHAT IS VIBE CODING?</div>
                        <p style={{ fontSize: '0.85rem', color: '#555566', lineHeight: 1.6 }}>
                            Instead of just writing text, modern AIs can generate raw React/HTML code. When put inside an environment that can execute that code on-the-fly, the AI becomes a real-time web developer.
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <input
                                className="input-field"
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                placeholder="E.g. Build me a dark-mode calculator app"
                                style={{ flex: 1 }}
                                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                            />
                            <button className="btn btn-primary" onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
                                {isGenerating ? 'Generating...' : 'Generate UI ✨'}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 24, height: 500 }}>
                        {/* Code Window */}
                        <div className="glass-card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0f172a' }}>
                            <div style={{ background: '#1e293b', padding: '12px 16px', borderBottom: '1px solid #334155', display: 'flex', gap: 8, alignItems: 'center' }}>
                                <div style={{ width: 12, height: 12, borderRadius: 6, background: '#ef4444' }} />
                                <div style={{ width: 12, height: 12, borderRadius: 6, background: '#eab308' }} />
                                <div style={{ width: 12, height: 12, borderRadius: 6, background: '#22c55e' }} />
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: 12, fontFamily: 'monospace' }}>AI_Engineer.jsx</span>
                            </div>
                            <pre style={{ padding: 20, margin: 0, color: '#38bdf8', fontSize: '0.85rem', overflowY: 'auto', flex: 1 }}>
                                <code>{streamedCode}</code>
                                {isGenerating && <span style={{ borderRight: '2px solid #38bdf8', animation: 'blink 1s step-end infinite' }}>&nbsp;</span>}
                            </pre>
                        </div>

                        {/* Preview Window */}
                        <div className="glass-card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                            {previewActive ? (
                                <div className="fade-in">
                                    <RenderedCalculator />
                                </div>
                            ) : (
                                <div style={{ color: '#94a3b8', textAlign: 'center' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>🖥️</div>
                                    <div>UI Preview Canvas</div>
                                    <div style={{ fontSize: '0.8rem', marginTop: 8 }}>Awaiting prompt...</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <style>{`
                @keyframes blink { 50% { border-color: transparent; } }
            `}</style>
                </div>
            )}
        </div>
    );
}
