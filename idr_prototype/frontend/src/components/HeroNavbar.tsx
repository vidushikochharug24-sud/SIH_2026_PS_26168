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
      exit={{ y: -25, opacity: 0 }}
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
        <img
          src="/navisync_logo.png"
          alt="NaviSync Logo"
          className="h-8 sm:h-9 w-auto object-contain drop-shadow-[0_0_15px_rgba(0,217,255,0.7)] group-hover:scale-105 transition-transform"
        />
        <span className="text-[9px] font-mono tracking-[0.2em] text-[#B7C7D9] uppercase font-semibold border-l border-white/20 pl-3 py-0.5">
          ISRO SIH 2026 · PS 26168
        </span>
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
