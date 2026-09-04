import React from 'react';
import { useReplayStore } from '../state/replayStore';
import { MetricCard } from './MetricCard';

export const MetricsPanel: React.FC = () => {
  const liveMetrics = useReplayStore((s) => s.liveMetrics);
  const gnssStatus = useReplayStore((s) => s.gnssStatus);
  const stepIdx = useReplayStore((s) => s.stepIdx);
  const totalSteps = useReplayStore((s) => s.totalSteps);

  const formatStatus = (s: string) => {
    switch (s) {
      case 'REPLAYING': return 'Running';
      case 'OUTAGE': return 'Outage active';
      case 'RESTORED': return 'Fusing';
      default: return 'Standby';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3.5">
      
      {/* Card 1: Outage Time */}
      <MetricCard
        title="Elapsed outage time"
        value={liveMetrics.elapsed_outage}
        unit="s"
        precision={1}
        subtext={`Status: ${formatStatus(gnssStatus)}`}
        color="#E29BFF"
        isGood={false}
      />

      {/* Card 2: Distance Travelled */}
      <MetricCard
        title="Distance travelled"
        value={liveMetrics.distance}
        unit="m"
        precision={1}
        subtext={`Tick: ${stepIdx} / ${totalSteps}`}
        color="#3b82f6"
        isGood={true}
      />

      {/* Card 3: Positional Error Split */}
      <div className="bg-[#0c0f19] border border-white/5 p-4 rounded-xl relative overflow-hidden flex flex-col justify-between">
        <div className="text-xs font-sans font-medium text-slate-400 mb-1">
          Positional error vs GPS reference
        </div>
        <div className="flex justify-between items-baseline my-1">
          <div>
            <div className="text-[10px] font-sans text-red-400">Normal DR</div>
            <div className="font-mono text-xl font-bold text-red-400">
              {liveMetrics.dr_error.toFixed(2)} m
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-sans text-emerald-400">AI IDR</div>
            <div className="font-mono text-xl font-bold text-emerald-400">
              {liveMetrics.ai_error.toFixed(2)} m
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 to-teal-500" />
      </div>

      {/* Card 4: AI Drift Reduction */}
      <MetricCard
        title="AI drift reduction"
        value={liveMetrics.drift_reduction}
        unit="%"
        precision={1}
        subtext="Error reduced vs naive dead reckoning"
        color="#2EE6A6"
        isGood={true}
      />

    </div>
  );
};
