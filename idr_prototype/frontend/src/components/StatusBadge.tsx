import React from 'react';
import { useReplayStore } from '../state/replayStore';

export const StatusBadge: React.FC = () => {
  const gnssStatus = useReplayStore((s) => s.gnssStatus);

  if (gnssStatus === 'OUTAGE') {
    return (
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-sans font-semibold">
        <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444] animate-pulse" />
        <span>GNSS Outage</span>
      </div>
    );
  }

  if (gnssStatus === 'RESTORED') {
    return (
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/40 text-[#3b82f6] text-xs font-sans font-semibold">
        <span className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]" />
        <span>GNSS Restored</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-sans font-semibold">
      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
      <span>GNSS Available</span>
    </div>
  );
};
