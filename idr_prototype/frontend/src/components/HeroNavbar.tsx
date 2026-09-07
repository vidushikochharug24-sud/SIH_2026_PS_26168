import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Compass } from 'lucide-react';
import { useReplayStore } from '../state/replayStore';

interface HeroNavbarProps {
  onNavigateCockpit?: () => void;
  onScrollToSection?: (id: string) => void;
}

export const HeroNavbar: React.FC<HeroNavbarProps> = ({
  onNavigateCockpit,
  onScrollToSection,
}) => {
  const currentView = useReplayStore((s) => s.currentView);
  const setStoreView = useReplayStore((s) => s.setStoreView);

  return (
    <motion.header
      initial={{ y: -25, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[#020B18]/85 border-b border-white/10 px-4 md:px-10 py-3 flex items-center justify-between font-sans shadow-[0_4px_30px_rgba(2,11,24,0.8)]"
    >
      {/* ── LEFT: NAVISYNC BRAND LOGO ── */}
      <div
        onClick={() => {
          setStoreView('landing');
          if (onScrollToSection) onScrollToSection('hero');
        }}
        className="flex items-center gap-3 cursor-pointer select-none group"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-[#00D9FF]/40 bg-[#031426] shadow-[0_0_20px_rgba(0,217,255,0.3)] flex-shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center p-0.5">
          <img src="/navisync_logo.png" alt="NaviSync Satellite Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <div className="relative inline-flex items-center font-black italic tracking-tighter text-xl sm:text-2xl leading-none pr-5 drop-shadow-[0_0_15px_rgba(0,217,255,0.7)]">
            <span className="text-white">Navi</span>
            <span className="bg-gradient-to-r from-[#00D9FF] via-[#00E6B8] to-[#168CFF] bg-clip-text text-transparent">Sync</span>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 pointer-events-none opacity-90">
              <span className="w-3 h-[1.5px] bg-[#00E6B8] rounded-full shadow-[0_0_4px_#00E6B8]" />
              <span className="w-4.5 h-[1.5px] bg-[#00D9FF] rounded-full shadow-[0_0_4px_#00D9FF]" />
              <span className="w-2 h-[1.5px] bg-[#168CFF] rounded-full shadow-[0_0_4px_#168CFF]" />
            </div>
          </div>
          <span className="text-[9px] font-mono tracking-[0.2em] text-[#B7C7D9] uppercase font-semibold mt-0.5">
            ISRO SIH 2026 · PS 26168
          </span>
        </div>
      </div>

      {/* ── CENTER: NAVIGATION LINKS ── */}
      <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider text-[#B7C7D9]">
        <button
          onClick={() => onScrollToSection ? onScrollToSection('hero') : window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="hover:text-white transition-colors cursor-pointer py-1 relative group"
        >
          <span>Home</span>
          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00D9FF] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </button>
        <button
          onClick={() => onScrollToSection ? onScrollToSection('features') : null}
          className="hover:text-white transition-colors cursor-pointer py-1 relative group"
        >
          <span>Features</span>
          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00D9FF] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </button>
        <button
          onClick={() => onScrollToSection ? onScrollToSection('how-it-works') : null}
          className="hover:text-white transition-colors cursor-pointer py-1 relative group"
        >
          <span>How It Works</span>
          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00D9FF] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </button>
        <button
          onClick={() => onScrollToSection ? onScrollToSection('about') : null}
          className="hover:text-white transition-colors cursor-pointer py-1 relative group"
        >
          <span>About</span>
          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00D9FF] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </button>
      </nav>

      {/* ── RIGHT: GET STARTED CTA ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (onNavigateCockpit) onNavigateCockpit();
            else setStoreView(currentView === 'predictor' ? 'landing' : 'predictor');
          }}
          className="py-2 px-5 rounded-full bg-gradient-to-r from-[#00D9FF] via-[#168CFF] to-[#7657FF] text-white text-xs font-bold tracking-wide shadow-[0_0_25px_rgba(0,217,255,0.4)] hover:shadow-[0_0_35px_rgba(0,217,255,0.7)] hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Get Started</span>
          <ArrowRight className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </motion.header>
  );
};
