import React from 'react';
import { useReplayStore } from '../state/replayStore';
import { StatusBadge } from './StatusBadge';
import { Navigation } from 'lucide-react';

export const Header: React.FC = () => {
  const gnssStatus = useReplayStore((s) => s.gnssStatus);
  const setStoreView = useReplayStore((s) => s.setStoreView);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'REPLAYING': return 'Running';
      case 'OUTAGE': return 'Outage active';
      case 'RESTORED': return 'Fusing';
      default: return 'Standby';
    }
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-2 border-b border-white/5">
      {/* Top Left Title Card */}
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

      {/* Top Right Status Indicators */}
      <div className="flex items-center gap-3 self-end md:self-auto">
        <div className="px-3.5 py-1.5 rounded-lg bg-slate-900/80 border border-white/5 flex items-center gap-2 text-xs font-sans">
          <span className="text-slate-400">Status:</span>
          <span className="text-[#00E5FF] font-semibold">{getStatusLabel(gnssStatus)}</span>
        </div>
        <StatusBadge />
      </div>
    </header>
  );
};
