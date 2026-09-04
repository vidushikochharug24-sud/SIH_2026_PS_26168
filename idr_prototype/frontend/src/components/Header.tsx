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
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6]">
          <Navigation className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-sans text-white tracking-tight leading-tight">
            NAVISYNC <span className="text-[#3b82f6] block md:inline font-semibold">Navigation Engine</span>
          </h1>
          <p className="text-xs font-sans text-slate-400 mt-0.5">
            Intelligent Navigation Beyond GNSS — 10Hz synchronized phone-IMU dead reckoning
          </p>
        </div>
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
