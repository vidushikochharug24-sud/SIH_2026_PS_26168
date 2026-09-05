import React from 'react';
import { useReplayStore } from '../state/replayStore';
import { StatusBadge } from './StatusBadge';
import { Navigation } from 'lucide-react';

export const Header: React.FC = () => {
  const gnssStatus = useReplayStore((s) => s.gnssStatus);

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
        <div className="w-10 h-10 rounded-2xl overflow-hidden border border-[#00E5FF]/40 bg-black/90 shadow-[0_0_20px_rgba(0,229,255,0.4)] flex-shrink-0 flex items-center justify-center p-0.5">
          <img src="/navisync_logo.png" alt="NAVISYNC Satellite Emblem Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="relative inline-flex items-center font-black italic tracking-tighter text-xl md:text-2xl leading-none pr-6 drop-shadow-[0_0_15px_rgba(0,229,255,0.7)]">
              <span className="text-white">NAVI</span>
              <span className="bg-gradient-to-r from-[#00E5FF] via-[#00E5FF] to-[#2EE6A6] bg-clip-text text-transparent">SYNC</span>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-1 pointer-events-none opacity-90">
                <span className="w-3.5 h-[1.8px] bg-[#2EE6A6] rounded-full shadow-[0_0_6px_#2EE6A6]" />
                <span className="w-5 h-[1.8px] bg-[#00E5FF] rounded-full shadow-[0_0_6px_#00E5FF]" />
                <span className="w-2.5 h-[1.8px] bg-[#2EE6A6] rounded-full shadow-[0_0_6px_#2EE6A6]" />
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/30 px-2 py-0.5 rounded-full uppercase">
              Engine Cockpit
            </span>
          </div>
          <p className="text-xs font-sans text-slate-400 mt-1">
            Intelligent Navigation Beyond GNSS — 10Hz synchronized phone-IMU dead reckoning
          </p>
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
