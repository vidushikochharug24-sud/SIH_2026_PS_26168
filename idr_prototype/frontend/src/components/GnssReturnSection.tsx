import React from 'react';
import { motion } from 'framer-motion';
import { Radio, RefreshCw, CheckCircle2 } from 'lucide-react';

export const GnssReturnSection: React.FC = () => {
  return (
    <section className="py-20 px-4 max-w-5xl mx-auto text-center font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-semibold">
          <Radio className="w-4 h-4 animate-pulse" />
          <span>Jump-Free Signal Restoration</span>
        </div>

        <h2 className="font-display italic text-3xl md:text-5xl font-normal text-white tracking-tight leading-tight drop-shadow-[0_0_25px_rgba(0,229,255,0.3)]">
          Smooth GNSS Re-acquisition & Fusion
        </h2>

        <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans">
          When exiting a tunnel or blackout zone, traditional navigation apps jerk or snap the cursor abruptly to the new GPS fix. Our Extended Kalman Filter smoothly fuses the satellite fix with the inertial estimate over 2.0 seconds.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left">
          
          <div className="bg-[#0c0f19]/90 border border-white/5 p-5 rounded-2xl">
            <RefreshCw className="w-5 h-5 text-[#00E5FF] mb-3" />
            <h3 className="text-sm font-bold text-white mb-1 font-sans">State Vector Convergence</h3>
            <p className="text-xs text-slate-400 font-sans">Position covariance matrices update dynamically to absorb spatial delta without velocity spikes.</p>
          </div>

          <div className="bg-[#0c0f19]/90 border border-white/5 p-5 rounded-2xl">
            <Radio className="w-5 h-5 text-emerald-400 mb-3" />
            <h3 className="text-sm font-bold text-white mb-1 font-sans">Smooth S-Curve Fusion</h3>
            <p className="text-xs text-slate-400 font-sans">Applies cubic alpha blending ($\alpha \in [0, 1]$) to guarantee smooth path derivative continuity.</p>
          </div>

          <div className="bg-[#0c0f19]/90 border border-white/5 p-5 rounded-2xl">
            <CheckCircle2 className="w-5 h-5 text-blue-400 mb-3" />
            <h3 className="text-sm font-bold text-white mb-1 font-sans">Zero User Disruption</h3>
            <p className="text-xs text-slate-400 font-sans">Driver experiences seamless turn-by-turn guidance without confusing map teleportation.</p>
          </div>

        </div>
      </motion.div>
    </section>
  );
};
