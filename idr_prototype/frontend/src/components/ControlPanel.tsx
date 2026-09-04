import React from 'react';
import { Play, Pause, RotateCcw, ZapOff, Radio } from 'lucide-react';
import { useReplayStore } from '../state/replayStore';
import { useReplaySocket } from '../hooks/useReplaySocket';

export const ControlPanel: React.FC = () => {
  const gnssStatus = useReplayStore((s) => s.gnssStatus);
  const liveMetrics = useReplayStore((s) => s.liveMetrics);
  const outageDurationSec = useReplayStore((s) => s.outageDurationSec);
  const setOutageDuration = useReplayStore((s) => s.setOutageDuration);

  const { startReplay, pauseReplay, resetReplay, triggerOutage, restoreGnss, updateOutageDuration } = useReplaySocket();

  const isStartDisabled = gnssStatus !== 'IDLE';
  const isPauseDisabled = gnssStatus === 'IDLE';
  const isOutageDisabled = gnssStatus !== 'REPLAYING';
  const isRestoreDisabled = gnssStatus !== 'OUTAGE';

  const handleSliderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    setOutageDuration(val);
    updateOutageDuration(val);
  };

  return (
    <div className="slate-card p-4 flex flex-col justify-between h-full space-y-4">
      
      {/* Section Header */}
      <div>
        <h3 className="text-[11px] font-mono font-bold tracking-widest text-[#8B93B0] uppercase mb-3">
          MISSION CONTROL
        </h3>

        {/* 2-Column Action Buttons Grid (Matching Screenshot) */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            disabled={isStartDisabled}
            onClick={startReplay}
            className="py-3 px-3 rounded-lg font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 border transition-all disabled:opacity-30 disabled:cursor-not-allowed border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START</span>
          </button>

          <button
            disabled={isPauseDisabled}
            onClick={pauseReplay}
            className="py-3 px-3 rounded-lg font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 border transition-all disabled:opacity-30 disabled:cursor-not-allowed border-amber-500/40 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
          >
            <Pause className="w-4 h-4" />
            <span>PAUSE</span>
          </button>

          <button
            onClick={resetReplay}
            className="py-3 px-3 rounded-lg font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 border border-white/10 text-[#8B93B0] bg-white/5 hover:text-white hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET</span>
          </button>

          <button
            disabled={isOutageDisabled}
            onClick={() => triggerOutage(outageDurationSec)}
            className="py-3 px-3 rounded-lg font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 border transition-all disabled:opacity-30 disabled:cursor-not-allowed border-red-500/40 text-red-400 bg-red-500/10 hover:bg-red-500/20"
          >
            <ZapOff className="w-4 h-4" />
            <span>SIMULATE OUTAGE</span>
          </button>

          <button
            disabled={isRestoreDisabled}
            onClick={restoreGnss}
            className="col-span-2 py-3 px-3 rounded-lg font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 border transition-all disabled:opacity-30 disabled:cursor-not-allowed border-[#00E5FF]/40 text-[#00E5FF] bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20"
          >
            <Radio className="w-4 h-4" />
            <span>RESTORE GNSS</span>
          </button>
        </div>
      </div>

      {/* Outage Duration Dropdown */}
      <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg border border-white/5">
        <span className="text-[10px] font-mono text-[#8B93B0] tracking-wider uppercase">OUTAGE DURATION</span>
        <select
          value={outageDurationSec}
          onChange={handleSliderChange}
          className="bg-black/60 text-[#00E5FF] font-mono font-bold text-xs px-3 py-1 rounded border border-white/10 outline-none cursor-pointer"
        >
          <option value={10}>10s</option>
          <option value={20}>20s</option>
          <option value={30}>30s</option>
          <option value={45}>45s</option>
          <option value={60}>60s</option>
        </select>
      </div>

      {/* SESSION STATS SECTION (Matching Screenshot) */}
      <div className="border-t border-white/10 pt-3 space-y-2">
        <h4 className="text-[10px] font-mono font-bold tracking-widest text-[#8B93B0] uppercase mb-1">
          SESSION
        </h4>

        <div className="flex justify-between items-center font-mono text-xs">
          <span className="text-[#8B93B0]">ELAPSED OUTAGE TIME</span>
          <span className="text-white font-bold">{liveMetrics.elapsed_outage.toFixed(1)}s</span>
        </div>

        <div className="flex justify-between items-center font-mono text-xs">
          <span className="text-[#8B93B0]">DISTANCE TRAVELLED</span>
          <span className="text-white font-bold">{liveMetrics.distance.toFixed(1)} m</span>
        </div>
      </div>

    </div>
  );
};
