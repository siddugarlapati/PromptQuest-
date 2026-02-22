import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const WORLDS = [
    {
        id: 1, emoji: '🧠', title: 'AI Basics',
        desc: 'Learn how AI recognizes patterns and categorizes information.',
        color: '#FF6B6B', tag: 'Pattern Recognition', xp: '20 XP/Q',
    },
    {
        id: 2, emoji: '📊', title: 'Prediction Engine',
        desc: 'Understand how LLMs predict the next word using probability.',
        color: '#4ECDC4', tag: 'Next-Word Prediction', xp: '25 XP/Q',
    },
    {
        id: 3, emoji: '🔤', title: 'Tokenization',
        desc: 'See how text is broken into tokens that AI can understand.',
        color: '#45B7D1', tag: 'Tokenization', xp: '15 XP',
    },
    {
        id: 4, emoji: '✍️', title: 'Prompt Engineering',
        desc: 'Write better prompts and get scored on clarity and structure.',
        color: '#D4A017', tag: 'Prompt Scoring', xp: 'Up to 20 XP',
    },
    {
        id: 5, emoji: '🕵️', title: 'Hallucination Detective',
        desc: 'Spot when AI makes things up — a crucial skill for AI users.',
        color: '#BB8FCE', tag: 'Critical Thinking', xp: '30 XP/Q',
    },
];

const BADGE_META = {
    ai_explorer: { name: 'AI Explorer', icon: '🔍' },
    prediction_pro: { name: 'Prediction Pro', icon: '📊' },
    token_master: { name: 'Token Master', icon: '🔤' },
    prompt_master: { name: 'Prompt Master', icon: '✍️' },
    truth_seeker: { name: 'Truth Seeker', icon: '🕵️' },
};

export default function Dashboard() {
    const navigate = useNavigate();
    const { xp, getLevel, completedWorlds, badges, playerName, setPlayerName, resetProgress } = useGame();
    const level = getLevel();

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, position: 'relative', zIndex: 1 }}>

            {/* Hero Header */}
            <div style={styles.hero}>
                <div>
                    <div style={{ fontSize: '0.85rem', color: '#C02633', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
                        Welcome back, {playerName} 👋
                    </div>
                    <h1 className="section-title" style={{ marginBottom: 6 }}>
                        PromptQuest <span className="text-gradient">Dashboard</span>
                    </h1>
                    <p style={{ color: '#555566', fontSize: '1rem' }}>
                        Master how Large Language Models work — one world at a time.
                    </p>
                </div>
                <img
                    src="/au-logo.png"
                    alt="Anurag University"
                    style={{ height: 56, objectFit: 'contain' }}
                />
            </div>

            {/* Stats Row */}
            <div style={styles.statsGrid}>
                <StatCard icon="⚡" label="Total XP" value={`${xp} XP`} color="#C02633" />
                <StatCard icon="🎖️" label="Current Level" value={`Lv ${level.level} — ${level.title}`} color="#C02633" />
                <StatCard icon="🌍" label="Worlds Completed" value={`${completedWorlds.length} / 5`} color="#2563EB" />
                <StatCard icon="🏅" label="Badges Earned" value={`${badges.length} / 5`} color="#7C3AED" />
            </div>

            {/* XP Progress */}
            <div className="glass-card" style={{ padding: '20px 24px', marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                        <span style={{ fontWeight: 700, color: '#C02633' }}>Level {level.level}</span>
                        <span style={{ color: '#9999AA', fontSize: '0.85rem', marginLeft: 8 }}>→</span>
                        <span style={{ color: '#9999AA', fontSize: '0.85rem', marginLeft: 8 }}>Level {level.level + 1}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#9999AA' }}>{xp} / {level.nextXP === Infinity ? '∞' : level.nextXP} XP</span>
                </div>
                <div className="xp-bar-wrapper">
                    <div className="xp-bar-fill" style={{ width: `${level.progress}%` }} />
                </div>
                <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#9999AA' }}>
                    {level.progress}% to next level
                </div>
            </div>

            {/* World Cards */}
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 20 }}>
                🌏 Learning Worlds
            </h2>
            <div style={styles.worldsGrid}>
                {WORLDS.map(world => {
                    const done = completedWorlds.includes(world.id);
                    return (
                        <div
                            key={world.id}
                            className="world-card"
                            onClick={() => navigate(`/worlds/${world.id}`)}
                            style={{ opacity: 1 }}
                        >
                            {done && (
                                <div style={styles.doneBadge}>✅ Completed</div>
                            )}
                            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{world.emoji}</div>
                            <div style={{ fontSize: '0.7rem', color: world.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                                {world.tag}
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>{world.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: '#555566', lineHeight: 1.5, marginBottom: 16 }}>{world.desc}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', background: 'rgba(192,38,51,0.08)', color: '#C02633', padding: '3px 10px', borderRadius: 100, fontWeight: 600 }}>
                                    {world.xp}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: world.color, fontWeight: 600 }}>
                                    World {world.id} →
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Badges */}
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 40, marginBottom: 20 }}>
                🏅 Your Badges
            </h2>
            <div style={styles.badgesGrid}>
                {Object.entries(BADGE_META).map(([id, meta]) => {
                    const earned = badges.includes(id);
                    return (
                        <div key={id} className="glass-card" style={{
                            ...styles.badgeCard,
                            opacity: earned ? 1 : 0.4,
                            border: earned ? '1px solid rgba(192,38,51,0.3)' : '1px solid #E8EAED',
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: 8 }}>{meta.icon}</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: earned ? '#C02633' : '#9999AA' }}>{meta.name}</div>
                            {!earned && <div style={{ fontSize: '0.7rem', color: '#BBBBCC', marginTop: 4 }}>Locked</div>}
                        </div>
                    );
                })}
            </div>

            {/* Quick Links */}
            <div style={{ display: 'flex', gap: 16, marginTop: 40, flexWrap: 'wrap' }}>
                <button className="btn btn-gold btn-lg" onClick={() => navigate('/playground')}>
                    🎮 AI Playground
                </button>
                <button className="btn btn-outline btn-lg" onClick={() => navigate('/pipeline')}>
                    ⚙️ Visual Pipeline
                </button>
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={resetProgress}>
                    🔄 Reset Progress
                </button>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    return (
        <div className="glass-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: '1.8rem' }}>{icon}</div>
            <div>
                <div style={{ fontSize: '0.75rem', color: '#9999AA', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color }}>{value}</div>
            </div>
        </div>
    );
}

const styles = {
    hero: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
        gap: 16,
        flexWrap: 'wrap',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24,
    },
    worldsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
    },
    badgesGrid: {
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
    },
    badgeCard: {
        padding: '20px 24px',
        textAlign: 'center',
        minWidth: 130,
    },
    doneBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        background: 'rgba(22,163,74,0.08)',
        color: '#16a34a',
        border: '1px solid rgba(22,163,74,0.25)',
        borderRadius: 6,
        padding: '2px 8px',
        fontSize: '0.7rem',
        fontWeight: 600,
    },
};
