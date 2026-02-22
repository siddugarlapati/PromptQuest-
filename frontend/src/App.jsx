import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GameProvider } from './context/GameContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import WorldsHub from './pages/WorldsHub';
import World1 from './pages/worlds/World1_Basics';
import World2 from './pages/worlds/World2_Prediction';
import World3 from './pages/worlds/World3_Tokenization';
import World4 from './pages/worlds/World4_PromptEngineering';
import World5 from './pages/worlds/World5_Hallucination';
import World6 from './pages/worlds/World6_MiniTrainer';
import Playground from './pages/Playground';
import Pipeline from './pages/Pipeline';
import PromptDashboard from './pages/PromptDashboard';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Navbar />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#1A1A2E',
              border: '1px solid rgba(192,38,51,0.2)',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            },
            success: { iconTheme: { primary: '#16a34a', secondary: '#FFFFFF' } },
            error: { iconTheme: { primary: '#C02633', secondary: '#FFFFFF' } },
          }}
        />
        <div className="page-wrapper">
          <div className="stars-bg" />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/worlds" element={<WorldsHub />} />
            <Route path="/worlds/1" element={<World1 />} />
            <Route path="/worlds/2" element={<World2 />} />
            <Route path="/worlds/3" element={<World3 />} />
            <Route path="/worlds/4" element={<World4 />} />
            <Route path="/worlds/5" element={<World5 />} />
            <Route path="/worlds/6" element={<World6 />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/prompt-lab" element={<PromptDashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </GameProvider>
  );
}
