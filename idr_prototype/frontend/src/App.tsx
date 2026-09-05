import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useReplayStore } from './state/replayStore';
import { LandingPage } from './components/LandingPage';
import { TrajectoryPanel } from './components/TrajectoryPanel';
import { SensorPanel } from './components/SensorPanel';
import { CyberHighwayCanvas } from './components/CyberHighwayCanvas';
import { GpsCursorTrail } from './components/GpsCursorTrail';
import { PersistentNavHeader } from './components/PersistentNavHeader';

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
            className="relative z-10 max-w-7xl mx-auto px-4 pt-20 pb-6 font-sans"
          >
            {/* Top Persistent Header Bar */}
            <PersistentNavHeader onNavigateCockpit={() => setStoreView('landing')} />

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
