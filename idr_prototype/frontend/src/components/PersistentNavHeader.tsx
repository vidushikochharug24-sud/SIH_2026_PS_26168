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
      {/* ── LEFT: NAVISYNC BRAND LOGO (Matching media_1788641440393.jpg) ── */}
      <div
        onClick={() => setStoreView('landing')}
        className="flex items-center gap-3 cursor-pointer select-none group"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-[#00E5FF]/40 bg-black/60 shadow-[0_0_15px_rgba(0,229,255,0.3)] flex-shrink-0 group-hover:scale-105 transition-transform">
          <img src="/navisync_logo.jpg" alt="NAVISYNC Logo" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <div className="font-black italic tracking-tighter text-lg sm:text-xl leading-none flex items-center gap-1 drop-shadow-[0_0_12px_rgba(0,229,255,0.6)]">
            <span className="text-white">NAVI</span>
            <span className="bg-gradient-to-r from-[#00E5FF] to-[#2EE6A6] bg-clip-text text-transparent">SYNC</span>
          </div>
          <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase hidden lg:inline">
            ISRO SIH 2026 · PS 26168
          </span>
        </div>
      </div>

      {/* ── CENTER: NAVIGATION LINKS (Matching media_1788641337211.png) ── */}
      <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold tracking-wider uppercase text-slate-300">
        <button
          onClick={() => scrollToSection('hero')}
          className="hover:text-[#00E5FF] transition-colors cursor-pointer py-1"
        >
          HOME
        </button>
        <button
          onClick={() => scrollToSection('pipeline')}
          className="hover:text-[#00E5FF] transition-colors cursor-pointer py-1"
        >
          PIPELINE
        </button>
        <button
          onClick={() => scrollToSection('dr')}
          className="hover:text-[#00E5FF] transition-colors cursor-pointer py-1"
        >
          DRIFT CONTROL
        </button>
        <button
          onClick={() => scrollToSection('map-matching')}
          className="hover:text-[#00E5FF] transition-colors cursor-pointer py-1"
        >
          MAP MATCHING
        </button>
        <button
          onClick={() => scrollToSection('benchmarks')}
          className="hover:text-[#00E5FF] transition-colors cursor-pointer py-1"
        >
          BENCHMARKS
        </button>
      </nav>

      {/* ── RIGHT: SEARCH INPUT & ENGINE CTA BUTTON ── */}
      <div className="flex items-center gap-3">
        {/* Search Bar Input (Matching media_1788641337211.png) */}
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
        <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 text-[11px] font-mono font-medium ${statusInfo.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
          <span className="hidden xl:inline">{statusInfo.label}</span>
        </div>

        {/* Navigation Engine Launch Button */}
        <button
          onClick={() => {
            if (onNavigateCockpit) onNavigateCockpit();
            else setStoreView(currentView === 'predictor' ? 'landing' : 'predictor');
          }}
          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#2EE6A6] text-black text-xs font-bold shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:scale-105 transition-transform flex items-center gap-1.5 cursor-pointer"
        >
          <Play className="w-3 h-3 fill-black" />
          <span>{currentView === 'predictor' ? 'Story Landing' : 'Engine Cockpit'}</span>
        </button>
      </div>
    </motion.header>
  );
};

