import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useReplayStore } from './state/replayStore';
import { LandingPage } from './components/LandingPage';
import { TrajectoryPanel } from './components/TrajectoryPanel';
import { SensorPanel } from './components/SensorPanel';
import { CyberHighwayCanvas } from './components/CyberHighwayCanvas';
import { GpsCursorTrail } from './components/GpsCursorTrail';

export const App: React.FC = () => {
  const currentView = useReplayStore((s) => s.currentView);
  const setStoreView = useReplayStore((s) => s.setStoreView);

  return (
    <div className="relative min-h-screen bg-[#04060c] text-[#E8E6F5] overflow-x-hidden">
      
      {/* ── GLOBAL GPS NAVIGATION ARROW & BREADCRUMB TRAIL ────── */}
      <GpsCursorTrail />

      {/* ── BACKGROUND 3D STREETVIEW CANVAS (Visible in background) ────── */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <CyberHighwayCanvas scrollProgress={0.5} />
      </div>

      {/* Dark Vignette Overlay for Crisp Readability */}
      <div className="fixed inset-0 bg-gradient-to-t from-[#04060c] via-[#04060c]/60 to-[#04060c]/90 pointer-events-none z-0" />

      <AnimatePresence mode="wait">
        {currentView === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage />
          </motion.div>
        ) : (
          <motion.div
            key="predictor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-7xl mx-auto px-4 py-6 font-sans"
          >
            {/* Top Navigation Bar with Editorial Cyan-to-Emerald Heading */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <button
                onClick={() => setStoreView('landing')}
                className="inline-flex items-center gap-2 text-xs font-sans text-slate-300 hover:text-[#00E5FF] bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#00E5FF]" />
                <span>Return to Landing Story</span>
              </button>

              {/* Glowing Editorial Serif Title matching landing page headings */}
              <div className="font-display italic text-lg md:text-xl font-normal bg-gradient-to-r from-white via-[#00E5FF] to-[#2EE6A6] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(0,229,255,0.35)]">
                NAVISYNC — Intelligent Navigation Beyond GNSS
              </div>
            </div>

            {/* HERO AUTOMOTIVE NAVIGATION CONSOLE */}
            <div className="mb-6">
              <TrajectoryPanel />
            </div>

            {/* RESTRAINED SECONDARY SENSOR TELEMETRY */}
            <div className="mt-6">
              <SensorPanel />
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
