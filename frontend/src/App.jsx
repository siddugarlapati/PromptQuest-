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
import World4 from './pages/worlds/World4_Transformers';
import World5 from './pages/worlds/World5_Attention';
import World6 from './pages/worlds/World6_Embeddings';
import World7 from './pages/worlds/World7_Context';
import World8 from './pages/worlds/World8_PromptEngineering';
import World9_Hallucination from './pages/worlds/World9_Hallucination';
import World10_Training from './pages/worlds/World10_Training';
import World11_RAG from './pages/worlds/World11_RAG';
import World12_Architecture from './pages/worlds/World12_Architecture';
import World13_GenerativeUI from './pages/worlds/World13_GenerativeUI';
import World14_PersonalAI from './pages/worlds/World14_PersonalAI';
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
            <Route path="/worlds/7" element={<World7 />} />
            <Route path="/worlds/8" element={<World8 />} />
            <Route path="/worlds/9" element={<World9_Hallucination />} />
            <Route path="/worlds/10" element={<World10_Training />} />
            <Route path="/worlds/11" element={<World11_RAG />} />
            <Route path="/worlds/12" element={<World12_Architecture />} />
            <Route path="/worlds/13" element={<World13_GenerativeUI />} />
            <Route path="/worlds/14" element={<World14_PersonalAI />} />
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
