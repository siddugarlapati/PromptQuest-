import React, { useState, useEffect } from 'react';
import { analyticsAPI, worldsAPI } from '../services/api';
import { useGame } from '../context/GameContext';
import toast from 'react-hot-toast';

const TEMPLATES = [
    { label: 'Step-by-step explanation', template: 'Explain [topic] step by step with examples for a beginner.' },
    { label: 'Summary with bullet points', template: 'Summarize [topic] in 5 bullet points. Keep it simple.' },
    { label: 'Compare two things', template: 'Compare [A] and [B]. List 3 similarities and 3 differences.' },
    { label: 'ELI5 (Explain Like I\'m 5)', template: 'Explain [topic] as if I am a 5-year-old child.' },
    { label: 'Real-world example', template: 'Give a real-world example of [topic] and explain why it works.' },
];

const GOOD_BAD = [
    {
        bad: 'Explain AI',
        good: 'You are a teacher. Explain Artificial Intelligence to a 16-year-old student using 3 simple examples and bullet points.',
        why: 'The good prompt gives the AI a role, a target audience, format instructions, and examples — all key elements of effective prompting.'
    },
    {
        bad: 'Write code',
        good: 'Write a Python function called add_numbers that takes two integers and returns their sum. Include a docstring and one example usage.',
        why: 'Specificity matters: function name, language, input/output type, and docs all guide the AI to give exactly what you need.'
    },
    {
        bad: 'Machine learning?',
        good: 'Explain machine learning in 3 parts: (1) What it is, (2) How it works, (3) A real-world example. Use simple language.',
        why: 'Structured prompts produce structured answers. Numbered parts force the AI to cover every aspect.'
    }
];

const ALL_SCENARIOS = [
    {
        id: 'A',
        title: 'The Roleplayer (Marketing)',
        scenario: 'You are the lead marketing director for a new eco-friendly shoe brand. You need the AI to generate a 3-part launch strategy that is easy for a beginner to understand. Write a prompt that gives the AI this specific persona, the shoe brand context, and the output format constraint.',
        requiredScore: 70,
    },
    {
        id: 'B',
        title: 'The Simplifier (Sci-Fi)',
        scenario: 'You are a middle school science teacher. You want the AI to explain the concept of Quantum Computing to your 12-year-old students. Write a prompt that forces the AI into this role, specifies the target audience age, and asks for 3 simple bullet points with one real-world example.',
        requiredScore: 80,
    },
    {
        id: 'C',
        title: 'The Architect (Data Extraction)',
        scenario: 'Your boss tasked you with parsing a chaotic list of customer reviews. Write a prompt that instructs the AI to extract specific metadata (Product Name, Sentiment, and Key Issue). You must provide an example of the input text inside the prompt, and state that the output must strictly be in JSON format without any conversational pleasantries.',
        requiredScore: 90,
    },
    {
        id: 'D',
        title: 'The Critic (Code Review)',
        scenario: 'You are a Senior Software Engineer reviewing a Junior Developer\'s Python code for a login function. Write a prompt instructing the AI to act as a harsh but constructive critic. It must identify security flaws and provide exactly two code snippets: the bad code and the fixed code.',
        requiredScore: 85,
    },
    {
        id: 'E',
        title: 'The Diplomat (HR Escalation)',
        scenario: 'You are an HR Manager dealing with two employees who are arguing over desk space. Write a prompt asking the AI to draft a perfectly polite but firm email to both employees. The email must mention company policy, schedule a 15-minute mediation, and physically limit the output to exactly 2 paragraphs.',
        requiredScore: 80,
    },
    {
        id: 'F',
        title: 'The Historian (Debate Prep)',
        scenario: 'You are preparing for a debate on the Industrial Revolution. Write a prompt requiring the AI to provide 3 arguments FOR the revolution and 3 arguments AGAINST it. Crucially, you must instruct the AI to cite specific historical dates or figures for every single point it makes.',
        requiredScore: 90,
    }
];

// Dynamically pick 3 scenarios per day using the calendar date
const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
const startIndex = (dayOfYear * 3) % ALL_SCENARIOS.length;
const DAILY_SCENARIOS = [
    ALL_SCENARIOS[(startIndex) % ALL_SCENARIOS.length],
    ALL_SCENARIOS[(startIndex + 1) % ALL_SCENARIOS.length],
    ALL_SCENARIOS[(startIndex + 2) % ALL_SCENARIOS.length],
].map((s, idx) => ({ ...s, dailyLevelId: idx + 1 }));

export default function PromptDashboard() {
    const { promptHistory, addPromptScore, completeWorld, addXP } = useGame();
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('hero');
    const [selectedExample, setSelectedExample] = useState(0);

    // Hero specific state
    const [currentHeroLevel, setCurrentHeroLevel] = useState(0);
    const [heroPrompt, setHeroPrompt] = useState('');
    const [heroResult, setHeroResult] = useState(null);
    const [dailyPassedStatus, setDailyPassedStatus] = useState([false, false, false]);

    const handleScore = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        try {
            const res = await worldsAPI.scorePrompt(prompt);
            const r = res.data;
            setResult(r);
            addPromptScore({ prompt, score: r.total_score, grade: r.grade, grade_label: r.grade_label });
            // Also save to backend analytics
            try {
                await analyticsAPI.savePromptHistory({ prompt, score: r.total_score, grade: r.grade, grade_label: r.grade_label });
            } catch { }
            toast.success(`Score: ${r.total_score}/100 — Grade ${r.grade}`, { icon: '✍️' });
        } catch {
            toast.error('Backend not reachable!');
        }
        setLoading(false);
    };

    const handleHeroScore = async () => {
        if (!heroPrompt.trim()) return;
        setLoading(true);
        try {
            const res = await worldsAPI.scorePrompt(heroPrompt);
            const r = res.data;
            setHeroResult(r);
            addPromptScore({ prompt: heroPrompt, score: r.total_score, grade: r.grade, grade_label: r.grade_label });
            try { await analyticsAPI.savePromptHistory({ prompt: heroPrompt, score: r.total_score, grade: r.grade, grade_label: r.grade_label }); } catch { }

            if (r.total_score >= DAILY_SCENARIOS[currentHeroLevel].requiredScore) {
                toast.success('Level Passed! 🎉');
                const newPassed = [...dailyPassedStatus];
                newPassed[currentHeroLevel] = true;
                setDailyPassedStatus(newPassed);

                if (newPassed.every(v => v === true)) {
                    toast.success('🏅 DAILY PROMPT MASTER ACHIEVED!', { icon: '🏆', duration: 5000 });
                    completeWorld('daily_prompt_master'); // Give badge or trigger logic
                    addXP(50);
                }
            } else {
                toast.error(`Score too low. You need ${DAILY_SCENARIOS[currentHeroLevel].requiredScore}. Review the feedback!`);
            }
        } catch {
            toast.error('Backend not reachable!');
        }
        setLoading(false);
    };

    const GRADE_COLORS = { S: '#C02633', A: '#16a34a', B: '#2563eb', C: '#d97706', D: '#dc2626' };

    const chartHeight = 140;
    const chartWidth = 400;

    function renderChart() {
        if (promptHistory.length < 2) return null;
        const scores = promptHistory.map(h => h.score);
        const maxS = Math.max(...scores, 100);
        const pts = promptHistory.map((h, i) => {
            const x = (i / (promptHistory.length - 1)) * chartWidth;
            const y = chartHeight - (h.score / maxS) * chartHeight;
            return `${x},${y}`;
        }).join(' ');

        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const trend = scores.length >= 3
            ? (scores[scores.length - 1] > scores[0] ? '📈 Improving' : scores[scores.length - 1] < scores[0] ? '📉 Declining' : '➡️ Steady')
            : '';

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1 }}>Score History</div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <span style={{ fontSize: '0.8rem', color: '#555566' }}>Avg: <strong style={{ color: '#C02633' }}>{avg}</strong></span>
                        <span style={{ fontSize: '0.8rem', color: '#555566' }}>Best: <strong style={{ color: '#16a34a' }}>{Math.max(...scores)}</strong></span>
                        {trend && <span style={{ fontSize: '0.8rem', color: '#555566' }}>{trend}</span>}
                    </div>
                </div>
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: chartHeight, overflow: 'visible' }}>
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(v => (
                        <line key={v} x1={0} y1={chartHeight - (v / 100) * chartHeight}
                            x2={chartWidth} y2={chartHeight - (v / 100) * chartHeight}
                            stroke="#E5E7EB" strokeWidth={1} />
                    ))}
                    {/* Area fill */}
                    <polygon
                        points={`0,${chartHeight} ${pts} ${chartWidth},${chartHeight}`}
                        fill="rgba(192,38,51,0.08)" />
                    {/* Line */}
                    <polyline points={pts} fill="none" stroke="#C02633" strokeWidth={2} strokeLinejoin="round" />
                    {/* Dots */}
                    {promptHistory.map((h, i) => {
                        const x = (i / (promptHistory.length - 1)) * chartWidth;
                        const y = chartHeight - (h.score / maxS) * chartHeight;
                        return (
                            <g key={i}>
                                <circle cx={x} cy={y} r={4} fill="#C02633" />
                                {i === promptHistory.length - 1 && (
                                    <text x={x} y={y - 10} textAnchor="middle" fontSize={10} fill="#C02633" fontWeight={700}>{h.score}</text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>
        );
    }

    const TABS = [
        { id: 'hero', label: '🚀 Zero to Hero' },
        { id: 'lab', label: '✍️ Freeplay Lab' },
        { id: 'history', label: '📊 Score History' },
        { id: 'templates', label: '📋 Templates' },
        { id: 'examples', label: '✅ Good vs Bad' },
    ];

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
            <h1 className="section-title" style={{ marginBottom: 6 }}>✍️ Prompt Engineering <span className="text-gradient">Dashboard</span></h1>
            <p style={{ color: '#555566', marginBottom: 28 }}>Master the art of writing effective AI prompts. Track your progress, learn from examples, and become a Prompt Master!</p>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                        className={`btn btn-sm ${activeTab === t.id ? 'btn-primary' : 'btn-ghost'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ZERO TO HERO TAB */}
            {activeTab === 'hero' && (
                <div style={{ display: 'grid', gridTemplateColumns: heroResult ? '1fr 1fr' : '1fr', gap: 24 }}>
                    <div>
                        <div className="glass-card" style={{ padding: 24, marginBottom: 16, border: dailyPassedStatus.every(Boolean) ? '2px solid #FFD700' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1A1A2E' }}>
                                    Level {DAILY_SCENARIOS[currentHeroLevel].dailyLevelId}: {DAILY_SCENARIOS[currentHeroLevel].title}
                                </div>
                                {dailyPassedStatus.every(Boolean) ? (
                                    <div className="badge-pill" style={{ background: '#FFD700', color: '#B8860B' }}>🏆 Mastered Today</div>
                                ) : (
                                    <div className="badge-pill">Daily Assignment {currentHeroLevel + 1}/3</div>
                                )}
                            </div>

                            {/* Anti-copy scenario box */}
                            <div style={{
                                background: '#FFFDF0', border: '1px solid #FFD966', borderRadius: 8, padding: 16, marginBottom: 20,
                                userSelect: 'none', WebkitUserSelect: 'none', cursor: 'not-allowed'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: '#d97706', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>
                                    🎯 Mission Briefing (Read & Synthesize - Do not copy)
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#1A1A2E', lineHeight: 1.6 }}>
                                    {DAILY_SCENARIOS[currentHeroLevel].scenario}
                                </div>
                            </div>

                            <div style={{ fontSize: '0.85rem', color: '#555566', fontWeight: 600, marginBottom: 8 }}>Write your prompt:</div>
                            <textarea className="input-field" rows={6} value={heroPrompt}
                                onChange={e => setHeroPrompt(e.target.value)}
                                placeholder="Write the perfect prompt to fulfill the mission requirements..." style={{ resize: 'vertical', lineHeight: 1.6 }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                                <span style={{ fontSize: '0.75rem', color: '#9999AA', fontWeight: 600 }}>
                                    Target Score: <span style={{ color: '#C02633' }}>{DAILY_SCENARIOS[currentHeroLevel].requiredScore}+</span>
                                </span>
                                <button className="btn btn-gold" onClick={handleHeroScore} disabled={loading || !heroPrompt.trim()}>
                                    {loading ? 'Scoring...' : '🚀 Submit Assignment'}
                                </button>
                            </div>
                        </div>

                        {/* Level Navigation */}
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            {DAILY_SCENARIOS.map((lvl, index) => (
                                <button key={lvl.id} onClick={() => { setCurrentHeroLevel(index); setHeroResult(null); setHeroPrompt(''); }}
                                    className={`btn btn-sm ${currentHeroLevel === index ? 'btn-primary' : 'btn-ghost'}`}>
                                    {dailyPassedStatus[index] ? '✅ ' : ''}Level {lvl.dailyLevelId}
                                </button>
                            ))}
                        </div>
                    </div>

                    {heroResult && (
                        <div className="fade-in">
                            <div className="glass-card" style={{ padding: 24, marginBottom: 16, textAlign: 'center', border: heroResult.total_score >= DAILY_SCENARIOS[currentHeroLevel].requiredScore ? '2px solid #16a34a' : '2px solid #C02633' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: heroResult.total_score >= DAILY_SCENARIOS[currentHeroLevel].requiredScore ? '#16a34a' : '#C02633' }}>
                                    {heroResult.total_score >= DAILY_SCENARIOS[currentHeroLevel].requiredScore ? 'PASS 🎉' : 'FAIL ❌'}
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1A1A2E', marginTop: 8 }}>
                                    Score: {heroResult.total_score}<span style={{ fontSize: '0.9rem', color: '#9999AA' }}>/100</span>
                                </div>
                                <div style={{ marginTop: 8, fontSize: '0.85rem', color: '#555566' }}>
                                    {heroResult.total_score >= DAILY_SCENARIOS[currentHeroLevel].requiredScore
                                        ? "Great job! You met the criteria. Move to the next level."
                                        : `You missed the target score of ${DAILY_SCENARIOS[currentHeroLevel].requiredScore}. See feedback below.`}
                                </div>
                                {heroResult.total_score >= DAILY_SCENARIOS[currentHeroLevel].requiredScore && currentHeroLevel < DAILY_SCENARIOS.length - 1 && (
                                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setCurrentHeroLevel(currentHeroLevel + 1); setHeroResult(null); setHeroPrompt(''); }}>
                                        Next Level →
                                    </button>
                                )}
                            </div>

                            <div className="glass-card" style={{ padding: 20 }}>
                                <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Targeted Feedback</div>
                                {heroResult.feedback.map((f, i) => (
                                    <div key={i} style={{ fontSize: '0.83rem', color: '#555566', padding: '5px 0', borderBottom: '1px solid #F0F0F4' }}>{f}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* LAB TAB */}
            {activeTab === 'lab' && (
                <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 24 }}>
                    <div>
                        <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
                            <div style={{ fontSize: '0.85rem', color: '#555566', fontWeight: 600, marginBottom: 8 }}>Your Prompt:</div>
                            <textarea className="input-field" rows={7} value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                placeholder="Write your prompt here... Try to be specific, give context, and include format instructions." style={{ resize: 'vertical', lineHeight: 1.6 }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                                <span style={{ fontSize: '0.75rem', color: '#9999AA' }}>
                                    {prompt.split(/\s+/).filter(Boolean).length} words
                                </span>
                                <button className="btn btn-primary" onClick={handleScore} disabled={loading || !prompt.trim()}>
                                    {loading ? 'Scoring...' : '🎯 Score My Prompt'}
                                </button>
                            </div>
                        </div>

                        {/* Prompt tips */}
                        <div className="glass-card" style={{ padding: 20 }}>
                            <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Quick Tips</div>
                            {[
                                '🎭 Give the AI a role: "You are a teacher..."',
                                '📋 Specify format: "Use bullet points"',
                                '💡 Give examples: "Like this: ..."',
                                '🎯 Set constraints: "In under 100 words"',
                                '👤 Define audience: "For a 10-year-old"',
                            ].map((tip, i) => (
                                <div key={i} style={{ fontSize: '0.82rem', color: '#555566', padding: '4px 0', borderBottom: i < 4 ? '1px solid #F0F0F4' : 'none' }}>{tip}</div>
                            ))}
                        </div>
                    </div>

                    {result && (
                        <div className="fade-in">
                            <div className="glass-card" style={{ padding: 24, marginBottom: 16, textAlign: 'center' }}>
                                <div style={{ fontSize: '4rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: GRADE_COLORS[result.grade] || '#C02633' }}>
                                    {result.grade}
                                </div>
                                <div style={{ color: GRADE_COLORS[result.grade], fontWeight: 600 }}>{result.grade_label}</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1A1A2E', marginTop: 8 }}>
                                    {result.total_score}<span style={{ fontSize: '1rem', color: '#9999AA' }}>/100</span>
                                </div>
                                <div className="xp-bar-wrapper" style={{ marginTop: 12 }}>
                                    <div className="xp-bar-fill" style={{ width: `${result.total_score}%` }} />
                                </div>
                            </div>

                            <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
                                <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Score Breakdown</div>
                                {[
                                    { key: 'length', label: '📏 Length', max: 20 },
                                    { key: 'clarity', label: '🎯 Clarity', max: 25 },
                                    { key: 'instructions', label: '📋 Instructions', max: 25 },
                                    { key: 'examples', label: '💡 Examples', max: 15 },
                                    { key: 'context', label: '🎭 Context/Role', max: 15 },
                                ].map(r => (
                                    <div key={r.key} style={{ marginBottom: 10 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: '0.82rem' }}>
                                            <span style={{ color: '#1A1A2E' }}>{r.label}</span>
                                            <span style={{ color: '#C02633', fontWeight: 600 }}>{result.breakdown[r.key]}/{r.max}</span>
                                        </div>
                                        <div className="xp-bar-wrapper" style={{ height: 5 }}>
                                            <div className="xp-bar-fill" style={{ width: `${(result.breakdown[r.key] / r.max) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="glass-card" style={{ padding: 20 }}>
                                <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Feedback</div>
                                {result.feedback.map((f, i) => (
                                    <div key={i} style={{ fontSize: '0.83rem', color: '#555566', padding: '5px 0', borderBottom: '1px solid #F0F0F4' }}>{f}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
                <div>
                    {promptHistory.length === 0 ? (
                        <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>No scores yet</div>
                            <div style={{ color: '#555566', marginBottom: 20 }}>Score your first prompt in the Lab tab to see your progress here.</div>
                            <button className="btn btn-primary" onClick={() => setActiveTab('lab')}>Go to Prompt Lab →</button>
                        </div>
                    ) : (
                        <div>
                            <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
                                {renderChart()}
                            </div>
                            <div className="glass-card" style={{ padding: 24 }}>
                                <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>All Attempts</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {[...promptHistory].reverse().map((h, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#F8F9FA', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: GRADE_COLORS[h.grade] || '#C02633', minWidth: 32, fontFamily: "'Space Grotesk', sans-serif" }}>{h.grade}</div>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <div style={{ fontSize: '0.83rem', color: '#1A1A2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.prompt}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#9999AA' }}>{h.grade_label}</div>
                                            </div>
                                            <div style={{ fontWeight: 700, color: '#C02633', fontSize: '1rem' }}>{h.score}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TEMPLATES TAB */}
            {activeTab === 'templates' && (
                <div>
                    <p style={{ color: '#555566', marginBottom: 20 }}>Click a template to load it into the Prompt Lab. Replace <code style={{ background: '#F8F9FA', padding: '1px 6px', borderRadius: 4 }}>[topic]</code> with your actual topic.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                        {TEMPLATES.map((t, i) => (
                            <div key={i} className="glass-card" style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s' }}
                                onClick={() => { setPrompt(t.template); setActiveTab('lab'); toast.success('Template loaded!'); }}>
                                <div style={{ fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>{t.label}</div>
                                <div style={{ fontSize: '0.83rem', color: '#555566', fontStyle: 'italic', lineHeight: 1.5 }}>"{t.template}"</div>
                                <div style={{ marginTop: 12, fontSize: '0.78rem', color: '#C02633', fontWeight: 600 }}>Click to use →</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* GOOD VS BAD TAB */}
            {activeTab === 'examples' && (
                <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                        {GOOD_BAD.map((_, i) => (
                            <button key={i} onClick={() => setSelectedExample(i)}
                                className={`btn btn-sm ${selectedExample === i ? 'btn-primary' : 'btn-ghost'}`}>
                                Example {i + 1}
                            </button>
                        ))}
                    </div>
                    {(() => {
                        const ex = GOOD_BAD[selectedExample];
                        return (
                            <div className="fade-in">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                    <div className="glass-card" style={{ padding: 24, borderLeft: '3px solid #dc2626' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>❌ Bad Prompt</div>
                                        <div style={{ fontSize: '1rem', color: '#1A1A2E', fontStyle: 'italic' }}>"{ex.bad}"</div>
                                        <div style={{ marginTop: 12, fontSize: '0.8rem', color: '#dc2626' }}>Too vague — AI doesn't know what format, depth, or audience you want.</div>
                                    </div>
                                    <div className="glass-card" style={{ padding: 24, borderLeft: '3px solid #16a34a' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>✅ Good Prompt</div>
                                        <div style={{ fontSize: '0.9rem', color: '#1A1A2E', fontStyle: 'italic', lineHeight: 1.5 }}>"{ex.good}"</div>
                                    </div>
                                </div>
                                <div className="glass-card" style={{ padding: 20, background: 'rgba(192,38,51,0.03)' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#9999AA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>💡 Why it works</div>
                                    <div style={{ fontSize: '0.85rem', color: '#555566', lineHeight: 1.6 }}>{ex.why}</div>
                                </div>
                                <button className="btn btn-primary" style={{ marginTop: 16 }}
                                    onClick={() => { setPrompt(ex.good); setActiveTab('lab'); }}>
                                    Try This Prompt →
                                </button>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
