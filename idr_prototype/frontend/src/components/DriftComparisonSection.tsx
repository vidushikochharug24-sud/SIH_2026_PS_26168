import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const DriftComparisonSection: React.FC = () => {
  return (
    <section className="py-20 px-4 max-w-6xl mx-auto font-sans">
      <div className="text-center mb-12">
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-2 font-mono">
          Drift Accumulation Problem
        </span>
        <h2 className="font-display italic text-3xl md:text-5xl font-normal text-white tracking-tight leading-tight drop-shadow-[0_0_25px_rgba(251,191,36,0.3)]">
          Ordinary DR Drift vs AI Inertial Correction
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2 leading-relaxed">
          Without GNSS updates, naive dead reckoning integration suffers exponential heading and speed error drift. Our deep learning model reduces drift error by over 69%.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Ordinary DR (High Drift) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-[#0c0f19]/90 border border-red-500/30 p-6 rounded-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> ORDINARY DEAD RECKONING
            </span>
            <span className="text-xs font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
              7.97% DRIFT
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-6 leading-relaxed font-sans">
            Integrates raw IMU acceleration and gyro rates without bias compensation. Trajectory diverges rapidly from actual ground truth.
          </p>

          <div className="bg-[#070913] p-4 rounded-xl border border-white/5 space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Final Position Error:</span>
              <span className="text-red-400 font-bold">3,339.1 m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Drift Rate:</span>
              <span className="text-red-400 font-bold">79.7 m / km</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: AI IDR Model (Low Drift) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-[#0c0f19]/90 border border-emerald-500/30 p-6 rounded-2xl relative overflow-hidden shadow-[0_0_30px_rgba(46,230,166,0.15)]"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> AI-ASSISTED IDR MODEL
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              2.41% DRIFT
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-6 leading-relaxed font-sans">
            Neural network dynamically predicts speed and heading correction factors, suppressing exponential drift accumulation over long outages.
          </p>

          <div className="bg-[#070913] p-4 rounded-xl border border-white/5 space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Final Position Error:</span>
              <span className="text-emerald-400 font-bold">1,010.2 m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Error Reduction:</span>
              <span className="text-emerald-400 font-bold">69.75% Improvement</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
