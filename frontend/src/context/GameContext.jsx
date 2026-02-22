import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const GameContext = createContext(null);

export function GameProvider({ children }) {
    const [xp, setXP] = useState(() => parseInt(localStorage.getItem('pq_xp') || '0'));
    const [completedWorlds, setCompletedWorlds] = useState(() => {
        try { return JSON.parse(localStorage.getItem('pq_worlds') || '[]'); } catch { return []; }
    });
    const [badges, setBadges] = useState(() => {
        try { return JSON.parse(localStorage.getItem('pq_badges') || '[]'); } catch { return []; }
    });
    const [playerName, setPlayerName] = useState(() => localStorage.getItem('pq_name') || 'Explorer');
    const [mistakes, setMistakes] = useState(() => {
        try { return JSON.parse(localStorage.getItem('pq_mistakes') || '{}'); } catch { return {}; }
    });
    const [promptHistory, setPromptHistory] = useState(() => {
        try { return JSON.parse(localStorage.getItem('pq_prompt_history') || '[]'); } catch { return []; }
    });

    useEffect(() => { localStorage.setItem('pq_xp', xp); }, [xp]);
    useEffect(() => { localStorage.setItem('pq_worlds', JSON.stringify(completedWorlds)); }, [completedWorlds]);
    useEffect(() => { localStorage.setItem('pq_badges', JSON.stringify(badges)); }, [badges]);
    useEffect(() => { localStorage.setItem('pq_mistakes', JSON.stringify(mistakes)); }, [mistakes]);
    useEffect(() => { localStorage.setItem('pq_prompt_history', JSON.stringify(promptHistory)); }, [promptHistory]);

    const addXP = useCallback((amount) => {
        setXP(prev => prev + amount);
    }, []);

    const completeWorld = useCallback((worldId, earnedBadge) => {
        setCompletedWorlds(prev => prev.includes(worldId) ? prev : [...prev, worldId]);
        if (earnedBadge) {
            setBadges(prev => prev.includes(earnedBadge) ? prev : [...prev, earnedBadge]);
        }
    }, []);

    const recordMistake = useCallback((topic) => {
        const t = topic.toLowerCase().trim();
        setMistakes(prev => ({ ...prev, [t]: (prev[t] || 0) + 1 }));
    }, []);

    const addPromptScore = useCallback((entry) => {
        setPromptHistory(prev => [...prev, { ...entry, timestamp: new Date().toISOString(), index: prev.length + 1 }]);
    }, []);

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

    const resetProgress = useCallback(() => {
        setXP(0);
        setCompletedWorlds([]);
        setBadges([]);
        setMistakes({});
        setPromptHistory([]);
        localStorage.clear();
    }, []);

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
