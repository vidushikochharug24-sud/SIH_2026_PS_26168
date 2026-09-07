import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Search, Radio, ZapOff, CheckCircle2, ShieldCheck, Play } from 'lucide-react';
import { useReplayStore } from '../state/replayStore';

interface PersistentNavHeaderProps {
  currentSection?: string;
  onNavigateCockpit?: () => void;
}

export const PersistentNavHeader: React.FC<PersistentNavHeaderProps> = ({
  currentSection = 'hero',
  onNavigateCockpit,
}) => {
  const currentView = useReplayStore((s) => s.currentView);
  const setStoreView = useReplayStore((s) => s.setStoreView);
  const gnssStatus = useReplayStore((s) => s.gnssStatus);
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = () => {
    if (currentSection === 'blackout' || gnssStatus === 'OUTAGE') {
      return {
        label: 'GNSS Lost (Outage)',
        bg: 'bg-red-500/15 border-red-500/40 text-red-400',
        dot: 'bg-red-500 shadow-[0_0_8px_#EF4444]',
      };
    }

    if (currentSection === 'dr' || currentSection === 'pipeline' || currentSection === 'filter') {
      return {
        label: 'IDR Mode Active',
        bg: 'bg-[#00E5FF]/15 border-[#00E5FF]/40 text-[#00E5FF]',
        dot: 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]',
      };
    }

    return {
      label: 'GNSS 10Hz Live',
      bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
      dot: 'bg-emerald-400 shadow-[0_0_8px_#34D399]',
    };
  };

  const statusInfo = getStatusBadge();

  const scrollToSection = (id: string) => {
    if (currentView !== 'landing') {
      setStoreView('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[#06151a]/90 border-b border-[#00E5FF]/20 px-4 md:px-8 py-2.5 flex items-center justify-between font-sans shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
    >
      {/* ── LEFT: NAVISYNC BRAND LOGO ── */}
      <div
        onClick={() => setStoreView('landing')}
        className="flex items-center gap-4 cursor-pointer select-none group"
      >
        <img
          src="/navisync_logo.png"
          alt="NaviSync Logo"
          className="h-9 sm:h-11 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,217,255,0.8)] group-hover:scale-105 transition-transform"
        />
        <span className="text-xs sm:text-sm font-mono tracking-[0.2em] text-[#B7C7D9] uppercase font-bold border-l-2 border-[#00D9FF]/40 pl-4 py-1">
          ISRO SIH 2026 · PS 26168
        </span>
      </div>

      {/* ── CENTER: NAVIGATION LINKS (Matching HeroNavbar) ── */}
      <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider text-[#B7C7D9]">
        <button
          onClick={() => scrollToSection('hero')}
          className="hover:text-white transition-colors cursor-pointer py-1 relative group"
        >
          <span>Home</span>
          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00D9FF] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </button>
        <button
          onClick={() => scrollToSection('features')}
          className="hover:text-white transition-colors cursor-pointer py-1 relative group"
        >
          <span>Features</span>
          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00D9FF] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </button>
        <button
          onClick={() => scrollToSection('pipeline')}
          className="hover:text-white transition-colors cursor-pointer py-1 relative group"
        >
          <span>How It Works</span>
          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00D9FF] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </button>
        <button
          onClick={() => scrollToSection('about')}
          className="hover:text-white transition-colors cursor-pointer py-1 relative group"
        >
          <span>About</span>
          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00D9FF] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        </button>
      </nav>

      {/* ── RIGHT: SEARCH INPUT & LIVE STATUS BADGE ── */}
      <div className="flex items-center gap-3">
        {/* Search Bar Input */}
        <div className="relative hidden sm:flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search engine docs..."
            className="w-36 lg:w-48 bg-[#0b2027]/70 border border-[#00E5FF]/30 rounded-full pl-8 pr-3 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00E5FF] transition-all"
          />
        </div>

        {/* Live Status Badge */}
        <div className={`px-3 py-1 rounded-full border flex items-center gap-1.5 text-[11px] font-mono font-medium ${statusInfo.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
          <span className="hidden sm:inline">{statusInfo.label}</span>
        </div>
      </div>
    </motion.header>
  );
};

