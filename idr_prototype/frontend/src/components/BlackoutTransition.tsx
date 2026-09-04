import React from 'react';
import { motion } from 'framer-motion';
import { ZapOff, ShieldCheck, ArrowDown } from 'lucide-react';

export const BlackoutTransition: React.FC = () => {
  return (
    <section className="relative py-24 px-4 max-w-5xl mx-auto text-center font-sans">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
          <ZapOff className="w-4 h-4 animate-pulse" />
          <span>Simulated Tunnel Outage Zone</span>
        </div>

        <h2 className="font-display italic text-3xl md:text-5xl text-white tracking-tight leading-tight">
          What happens when GNSS disappears?
        </h2>

        <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans">
          Vehicles entering urban tunnels, underpasses, or high-rise canyons lose satellite GPS fixes instantly. Standard systems freeze or jump wildy.
        </p>

        {/* Transition Visualizer Card */}
        <div className="mt-10 p-6 md:p-8 rounded-2xl bg-[#0a0d16] border border-red-500/20 max-w-3xl mx-auto text-left relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex-1 space-y-2">
              <span className="text-xs text-red-400 font-mono font-medium block">GNSS SIGNAL: 0% (BLACKOUT)</span>
              <h3 className="text-xl font-bold text-white font-sans">Satellite Lock Interrupted</h3>
              <p className="text-xs text-slate-400 font-sans">Position data stream drops. Dead Reckoning estimator takes over instantaneously.</p>
            </div>

            <div className="flex items-center gap-3 shrink-0 bg-slate-900/90 p-4 rounded-xl border border-white/10">
              <ShieldCheck className="w-8 h-8 text-[#3b82f6]" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Fallback Engine</span>
                <span className="text-sm font-bold text-white font-sans">IMU + AI Kinematics</span>
              </div>
            </div>

          </div>

          {/* Bottom pulse line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-[#3b82f6]" />
        </div>

        <div className="pt-6 flex justify-center text-slate-500">
          <ArrowDown className="w-5 h-5 animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
};
