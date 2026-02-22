import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { worldsAPI } from '../../services/api';
import { WorldHeader } from './World1_Basics';
import toast from 'react-hot-toast';

const SESSION_ID = `session_${Date.now()}`;

const STARTER_EXAMPLES = [
    { item: 'Dog', category: 'Animal' },
    { item: 'Cat', category: 'Animal' },
    { item: 'Car', category: 'Vehicle' },
];

export default function World6() {
    const navigate = useNavigate();
    const { addXP, completeWorld } = useGame();
    const [examples, setExamples] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [testItem, setTestItem] = useState('');
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tested, setTested] = useState(false);
    const [phase, setPhase] = useState('train'); // 'train' | 'test'
    const [completed, setCompleted] = useState(false);

    const handleTrain = async () => {
        if (!newItem.trim() || !newCategory.trim()) return;
        setLoading(true);
        try {
            const res = await worldsAPI.world6Train(newItem, newCategory, SESSION_ID);
            setExamples(res.data.model_state);
            setNewItem('');
            setNewCategory('');
            toast.success(res.data.message);
        } catch {
            toast.error('Backend not reachable!');
        }
        setLoading(false);
    };

    const handleLoadStarter = async () => {
        setLoading(true);
        for (const ex of STARTER_EXAMPLES) {
            try {
                const res = await worldsAPI.world6Train(ex.item, ex.category, SESSION_ID);
                setExamples(res.data.model_state);
            } catch { }
        }
        setLoading(false);
        toast.success('Loaded 3 starter examples!');
    };

    const handleTest = async () => {
        if (!testItem.trim()) return;
        setLoading(true);
        try {
            const res = await worldsAPI.world6Predict(testItem, SESSION_ID);
            setPrediction(res.data);
            if (!tested) {
                addXP(20);
                setTested(true);
            }
            if (!completed && examples.length >= 3) {
                completeWorld(6, 'ai_trainer');
                setCompleted(true);
                toast.success('🏋️ Badge Unlocked: AI Trainer!', { duration: 3000 });
            }
        } catch {
            toast.error('Backend not reachable!');
        }
        setLoading(false);
    };

    const handleReset = async () => {
        try {
            await worldsAPI.world6Reset(SESSION_ID);
            setExamples([]);
            setPrediction(null);
            setPhase('train');
            setTested(false);
            toast('Model reset! Start training again.', { icon: '🔄' });
        } catch {
            toast.error('Reset failed.');
        }
    };

    const CATEGORY_COLORS = ['#C02633', '#2563EB', '#16a34a', '#7C3AED', '#d97706', '#0891B2'];
    const getCategoryColor = (cat) => {
        const cats = [...new Set(examples.map(e => e.category))];
        const idx = cats.indexOf(cat);
        return CATEGORY_COLORS[idx % CATEGORY_COLORS.length] || '#9999AA';
    };

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
            <WorldHeader
                emoji="🏋️" title="World 6: Mini AI Trainer"
                subtitle="Teach your own AI model by giving it examples, then test what it learned!"
                onBack={() => navigate('/worlds')}
            />

            {/* Explanation */}
            <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, borderLeft: '3px solid #16a34a' }}>
                <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, marginBottom: 6 }}>🏋️ HOW AI TRAINING WORKS</div>
                <p style={{ fontSize: '0.85rem', color: '#555566', lineHeight: 1.6 }}>
                    AI learns by seeing <strong style={{ color: '#1A1A2E' }}>many examples</strong>. You show it: Dog → Animal, Cat → Animal, Car → Vehicle.
                    After training, it can <strong style={{ color: '#1A1A2E' }}>generalize</strong> — recognizing that "Elephant" is also an Animal!
                    This is the core idea behind <strong style={{ color: '#1A1A2E' }}>Machine Learning</strong>.
                </p>
            </div>

            {/* Phase tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <button onClick={() => setPhase('train')} className={`btn ${phase === 'train' ? 'btn-primary' : 'btn-ghost'}`}>
                    🏋️ Train Phase
                </button>
                <button onClick={() => setPhase('test')} className={`btn ${phase === 'test' ? 'btn-primary' : 'btn-ghost'}`} disabled={examples.length === 0}>
                    🧪 Test Phase
                </button>
            </div>

            {/* TRAIN PHASE */}
            {phase === 'train' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                        <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
                            <div style={{ fontSize: '0.85rem', color: '#555566', fontWeight: 600, marginBottom: 16 }}>Add Training Example</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <input className="input-field" value={newItem} onChange={e => setNewItem(e.target.value)}
                                    placeholder="Item (e.g., Lion)" onKeyDown={e => e.key === 'Enter' && handleTrain()} />
                                <input className="input-field" value={newCategory} onChange={e => setNewCategory(e.target.value)}
                                    placeholder="Category (e.g., Animal)" onKeyDown={e => e.key === 'Enter' && handleTrain()} />
                                <button className="btn btn-primary" onClick={handleTrain} disabled={loading || !newItem.trim() || !newCategory.trim()}>
                                    {loading ? '...' : '➕ Teach This'}
                                </button>
                            </div>
                        </div>

                        <button className="btn btn-ghost" style={{ width: '100%', marginBottom: 8 }} onClick={handleLoadStarter}>
                            ⚡ Load Starter Examples (Dog, Cat, Car)
                        </button>

                        {examples.length > 0 && (
                            <button className="btn btn-ghost" style={{ width: '100%', color: '#dc2626', border: '1px solid rgba(220,38,38,0.3)' }} onClick={handleReset}>
                                🗑️ Reset Model
                            </button>
                        )}
                    </div>

                    {/* Training data visualization */}
                    <div className="glass-card" style={{ padding: 24 }}>
                        <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                            🧠 AI Memory ({examples.length} examples)
                        </div>
                        {examples.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9999AA', fontSize: '0.9rem' }}>
                                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🤖</div>
                                The AI has no memory yet.<br />Add training examples!
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {examples.map((ex, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#F8F9FA', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                                        <span style={{ fontWeight: 600, color: '#1A1A2E', flex: 1 }}>{ex.item}</span>
                                        <span style={{ color: '#9999AA' }}>→</span>
                                        <span style={{ background: getCategoryColor(ex.category) + '18', color: getCategoryColor(ex.category), border: `1px solid ${getCategoryColor(ex.category)}44`, borderRadius: 20, padding: '2px 10px', fontSize: '0.8rem', fontWeight: 700 }}>
                                            {ex.category}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {examples.length >= 3 && (
                            <div style={{ marginTop: 16 }}>
                                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setPhase('test')}>
                                    ✅ Model Ready — Start Testing →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TEST PHASE */}
            {phase === 'test' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div className="glass-card" style={{ padding: 24 }}>
                        <div style={{ fontSize: '0.85rem', color: '#555566', fontWeight: 600, marginBottom: 16 }}>
                            Test Your Trained AI
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#9999AA', marginBottom: 16 }}>
                            Type a new item the AI has never seen. See if it generalizes from training!
                        </p>
                        <input className="input-field" value={testItem} onChange={e => setTestItem(e.target.value)}
                            placeholder="Test item (e.g., Elephant)" onKeyDown={e => e.key === 'Enter' && handleTest()} style={{ marginBottom: 12 }} />
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleTest} disabled={loading || !testItem.trim()}>
                            {loading ? 'Thinking...' : '🧠 Ask AI'}
                        </button>

                        {/* Quick test suggestions */}
                        <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: '0.75rem', color: '#9999AA', marginBottom: 8 }}>Try these:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {['Elephant', 'Tiger', 'Truck', 'Bus', 'Rabbit', 'Motorcycle'].map(s => (
                                    <button key={s} className="btn btn-ghost btn-sm" onClick={() => setTestItem(s)}>{s}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Prediction result */}
                    <div className="glass-card" style={{ padding: 24 }}>
                        {!prediction ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9999AA' }}>
                                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🤔</div>
                                Ask the AI something!
                            </div>
                        ) : (
                            <div className="fade-in">
                                <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                                    AI Prediction
                                </div>
                                {prediction.prediction ? (
                                    <>
                                        <div style={{ textAlign: 'center', padding: '20px', background: '#F8F9FA', borderRadius: 12, marginBottom: 16 }}>
                                            <div style={{ fontSize: '1.1rem', color: '#9999AA', marginBottom: 4 }}>{testItem}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#9999AA', margin: '8px 0' }}>→</div>
                                            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#C02633', fontFamily: "'Space Grotesk', sans-serif" }}>
                                                {prediction.prediction}
                                            </div>
                                            <div style={{ marginTop: 8, fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>
                                                {Math.round(prediction.confidence * 100)}% confident
                                            </div>
                                            <div style={{ marginTop: 4, fontSize: '0.7rem', color: '#9999AA', background: 'rgba(192,38,51,0.06)', borderRadius: 20, padding: '2px 10px', display: 'inline-block' }}>
                                                via {prediction.method?.replace('_', ' ')}
                                            </div>
                                        </div>
                                        <div style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 10, padding: 14, fontSize: '0.82rem', color: '#555566', lineHeight: 1.5 }}>
                                            💡 {prediction.explanation}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: 14, fontSize: '0.85rem', color: '#dc2626' }}>
                                        {prediction.message}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
