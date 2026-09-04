import React from 'react';
import { motion } from 'framer-motion';
import { useReplayStore } from '../state/replayStore';

export const FinalMetricsPanel: React.FC = () => {
  const finalMetrics = useReplayStore((s) => s.finalMetrics);

  if (!finalMetrics) {
    return (
      <div className="bg-[#0c0f19] border border-white/5 p-4 rounded-xl h-full flex flex-col justify-center items-center text-center">
        <span className="text-xs font-sans font-semibold text-slate-300">
          Outage performance summary
        </span>
        <p className="text-xs font-sans text-slate-400 mt-2 max-w-xs leading-relaxed">
          Triggers automatically upon GNSS signal restoration to display statistical evaluation.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#0c0f19] border border-white/5 p-4 rounded-xl h-full flex flex-col justify-between"
    >
      <div className="text-xs font-sans font-semibold text-slate-300 mb-2">
        Outage performance summary
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
          <div className="text-[10px] font-sans text-slate-400">Mean DR error</div>
          <div className="font-mono text-base font-bold text-red-400">
            {finalMetrics.mean_dr_err.toFixed(2)} m
          </div>
        </div>

        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
          <div className="text-[10px] font-sans text-slate-400">Mean AI error</div>
          <div className="font-mono text-base font-bold text-emerald-400">
            {finalMetrics.mean_ai_err.toFixed(2)} m
          </div>
        </div>

        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
          <div className="text-[10px] font-sans text-slate-400">Max DR error</div>
          <div className="font-mono text-base font-bold text-red-400">
            {finalMetrics.max_dr_err.toFixed(2)} m
          </div>
        </div>

        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
          <div className="text-[10px] font-sans text-slate-400">Max AI error</div>
          <div className="font-mono text-base font-bold text-emerald-400">
            {finalMetrics.max_ai_err.toFixed(2)} m
          </div>
        </div>
      </div>

      <div className="bg-[#070913] p-2.5 rounded-lg border border-white/5 mt-2 flex justify-between items-center">
        <span className="text-[10px] font-sans text-slate-400">Overall drift reduction</span>
        <span className="font-mono text-sm font-bold text-emerald-400">
          {finalMetrics.overall_drift_reduction.toFixed(1)}%
        </span>
      </div>
    </motion.div>
  );
};
