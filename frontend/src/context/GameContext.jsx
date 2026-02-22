import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { gamificationAPI, analyticsAPI } from '../services/api';

const GameContext = createContext(null);

export function GameProvider({ children }) {
    const [loading, setLoading] = useState(true);
    const [xp, setXP] = useState(0);
    const [completedWorlds, setCompletedWorlds] = useState([]);
    const [badges, setBadges] = useState(() => {
        try { return JSON.parse(localStorage.getItem('pq_badges') || '[]'); } catch { return []; }
    });
    const [playerName, setPlayerName] = useState(() => localStorage.getItem('pq_name') || 'Explorer');
    const [mistakes, setMistakes] = useState({});
    const [promptHistory, setPromptHistory] = useState([]);

    // Keep badges and name in local storage for now, since they are minor
    useEffect(() => { localStorage.setItem('pq_badges', JSON.stringify(badges)); }, [badges]);
    useEffect(() => { localStorage.setItem('pq_name', playerName); }, [playerName]);

    // Initial load from SQLite backend
    useEffect(() => {
        const loadState = async () => {
            try {
                const [progRes, anRes, histRes] = await Promise.all([
                    gamificationAPI.getProgress(),
                    analyticsAPI.getSummary(),
                    analyticsAPI.getPromptHistory()
                ]);

                setXP(progRes.data.xp || 0);
                setCompletedWorlds(progRes.data.completed_worlds || []);
                setMistakes(anRes.data.mistakes || {});
                setPromptHistory(histRes.data.history || []);
            } catch (err) {
                console.error("Failed to load state from backend", err);
            } finally {
                setLoading(false);
            }
        };
        loadState();
    }, []);

    const addXP = useCallback(async (amount) => {
        // Optimistic update
        setXP(prev => prev + amount);
        try {
            await gamificationAPI.addXP(amount);
        } catch (err) {
            console.error("Failed to add XP to backend", err);
        }
    }, []);

    const completeWorld = useCallback(async (worldId, earnedBadge) => {
        setCompletedWorlds(prev => prev.includes(worldId) ? prev : [...prev, worldId]);
        if (earnedBadge) {
            setBadges(prev => prev.includes(earnedBadge) ? prev : [...prev, earnedBadge]);
        }
        try {
            await gamificationAPI.completeWorld(worldId);
        } catch (err) {
            console.error("Failed to save world completion to backend", err);
        }
    }, []);

    const recordMistake = useCallback(async (topic) => {
        const t = topic.toLowerCase().trim();
        setMistakes(prev => ({ ...prev, [t]: (prev[t] || 0) + 1 }));
        try {
            await analyticsAPI.recordMistake(t);
        } catch (err) {
            console.error("Failed to record mistake to backend", err);
        }
    }, []);

    const addPromptScore = useCallback(async (entry) => {
        const newEntry = { ...entry, timestamp: new Date().toISOString(), index: promptHistory.length + 1 };
        setPromptHistory(prev => [...prev, newEntry]);
        try {
            await analyticsAPI.savePromptHistory(entry);
        } catch (err) {
            console.error("Failed to save prompt history to backend", err);
        }
    }, [promptHistory.length]);

    const getLevel = useCallback(() => {
        const levels = [
            { level: 1, title: 'Beginner', min: 0, max: 100 },
            { level: 2, title: 'Explorer', min: 100, max: 250 },
            { level: 3, title: 'Learner', min: 250, max: 450 },
            { level: 4, title: 'Thinker', min: 450, max: 700 },
            { level: 5, title: 'Intermediate', min: 700, max: 1000 },
            { level: 6, title: 'Practitioner', min: 1000, max: 1400 },
            { level: 7, title: 'Analyst', min: 1400, max: 1900 },
            { level: 8, title: 'Advanced', min: 1900, max: 2500 },
            { level: 9, title: 'Master', min: 2500, max: 3200 },
            { level: 10, title: 'AI Expert', min: 3200, max: Infinity },
        ];
        let current = levels[0];
        for (const lv of levels) {
            if (xp >= lv.min) current = lv;
        }
        const next = levels[Math.min(current.level, levels.length - 1)];
        const progress = current.max === Infinity ? 100 :
            Math.round(((xp - current.min) / (current.max - current.min)) * 100);
        return { ...current, progress, nextXP: current.max };
    }, [xp]);

    const resetProgress = useCallback(async () => {
        setXP(0);
        setCompletedWorlds([]);
        setBadges([]);
        setMistakes({});
        setPromptHistory([]);
        localStorage.clear();
        // Currently no endpoint to reset xp/worlds from UI, but analytics can be reset
        try {
            await gamificationAPI.addXP(-xp); // Hack to reset strictly for local test
        } catch { }
    }, [xp]);

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF' }}>
            <div style={{ color: '#C02633', fontWeight: 600 }}>Loading Learning Profile...</div>
        </div>;
    }

    return (
        <GameContext.Provider value={{
            xp, addXP,
            completedWorlds, completeWorld,
            badges, playerName, setPlayerName,
            mistakes, recordMistake,
            promptHistory, addPromptScore,
            getLevel, resetProgress
        }}>
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error('useGame must be used inside GameProvider');
    return ctx;
};
