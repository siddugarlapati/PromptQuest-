import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

// Anurag University official logo (local copy)
const LOGO_URL = '/au-logo.png';

export default function Navbar() {
    const { xp, getLevel } = useGame();
    const location = useLocation();
    const navigate = useNavigate();
    const level = getLevel();
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Worlds', path: '/worlds' },
        { label: 'Playground', path: '/playground' },
        { label: 'Prompt Lab', path: '/prompt-lab' },
        { label: 'Analytics', path: '/analytics' },
        { label: 'Pipeline', path: '/pipeline' },
    ];

    return (
        <nav style={styles.nav}>
            <div style={styles.inner}>
                {/* Left: AU Logo + Brand */}
                <div style={styles.left} onClick={() => navigate('/dashboard')}>
                    <img
                        src={LOGO_URL}
                        alt="Anurag University"
                        style={styles.logo}
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                    <div>
                        <div style={styles.brand}>PromptQuest</div>
                        <div style={styles.sub}>Anurag University</div>
                    </div>
                </div>

                {/* Center: Nav Links */}
                <div style={styles.links}>
                    {navLinks.map(l => (
                        <Link
                            key={l.path}
                            to={l.path}
                            style={{
                                ...styles.link,
                                ...(location.pathname.startsWith(l.path) ? styles.linkActive : {})
                            }}
                        >
                            {l.label}
                        </Link>
                    ))}
                </div>

                {/* Right: XP + Level */}
                <div style={styles.right}>
                    <div style={styles.xpChip}>
                        <span style={styles.levelBadge}>Lv {level.level}</span>
                        <div style={styles.xpInfo}>
                            <span style={styles.xpLabel}>{level.title}</span>
                            <div style={styles.xpBarMini}>
                                <div style={{ ...styles.xpBarFill, width: `${level.progress}%` }} />
                            </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#C02633', fontWeight: 700 }}>
                            ⚡{xp} XP
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        background: '#FFFFFF',
        borderBottom: '1px solid #E8EAED',
        boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
        height: 72,
    },
    inner: {
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        flexShrink: 0,
    },
    logo: {
        height: 48,
        width: 'auto',
        maxWidth: 160,
        objectFit: 'contain',
    },
    brand: {
        fontSize: '1rem',
        fontWeight: 800,
        fontFamily: "'Space Grotesk', sans-serif",
        color: '#C02633',
        lineHeight: 1.2,
    },
    sub: {
        fontSize: '0.65rem',
        color: '#9999AA',
        letterSpacing: '0.5px',
        lineHeight: 1,
    },
    links: {
        display: 'flex',
        gap: 4,
        flex: 1,
        justifyContent: 'center',
    },
    link: {
        padding: '7px 16px',
        borderRadius: 8,
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#555566',
        transition: 'all 0.2s',
    },
    linkActive: {
        background: 'rgba(192,38,51,0.08)',
        color: '#C02633',
        fontWeight: 600,
    },
    right: {
        flexShrink: 0,
    },
    xpChip: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#FFF5F5',
        border: '1px solid rgba(192,38,51,0.18)',
        borderRadius: 10,
        padding: '6px 12px',
    },
    levelBadge: {
        background: 'linear-gradient(135deg, #C02633, #D42D3C)',
        color: '#fff',
        padding: '2px 8px',
        borderRadius: 6,
        fontSize: '0.75rem',
        fontWeight: 700,
    },
    xpInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
    },
    xpLabel: {
        fontSize: '0.7rem',
        color: '#888899',
        fontWeight: 500,
    },
    xpBarMini: {
        width: 60,
        height: 4,
        background: '#F0F0F4',
        borderRadius: 100,
        overflow: 'hidden',
    },
    xpBarFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #C02633, #FFC82C)',
        borderRadius: 100,
        transition: 'width 0.5s ease',
    },
};
