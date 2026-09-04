import React from 'react';
import { Award } from 'lucide-react';

export const ResultsBenchmarkSection: React.FC = () => {
  return (
    <section className="py-20 px-4 max-w-6xl mx-auto font-sans">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3 font-mono">
          <Award className="w-4 h-4" />
          <span>Empirical Validation Results</span>
        </div>
        <h2 className="font-display italic text-3xl md:text-5xl font-normal text-white tracking-tight leading-tight drop-shadow-[0_0_25px_rgba(46,230,166,0.3)]">
          Performance Benchmarks & Experimental Accuracy
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2 leading-relaxed">
          Validated on synchronised IO-VNBD datasets (`VTB01` 41.8 km trip and `VTB02` 4.3 km trip) comparing baseline dead reckoning against our AI model.
        </p>
      </div>

      <div className="bg-[#0c0f19]/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-black/50 border-b border-white/10 font-mono text-[11px] text-slate-400 uppercase">
                <th className="p-4">Navigation Method</th>
                <th className="p-4">Total Distance</th>
                <th className="p-4">Final Error (m)</th>
                <th className="p-4">Drift Rate (%)</th>
                <th className="p-4 text-right">Accuracy Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              
              <tr className="hover:bg-white/[0.02]">
                <td className="p-4 font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Ground Truth GPS Reference
                </td>
                <td className="p-4 font-mono text-slate-300">41,892.4 m</td>
                <td className="p-4 font-mono text-slate-300">0.00 m</td>
                <td className="p-4 font-mono text-slate-300">0.00 %</td>
                <td className="p-4 text-right">
                  <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30 text-[10px] font-semibold">
                    Baseline
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-white/[0.02]">
                <td className="p-4 font-bold text-red-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Ordinary Dead Reckoning (Naive IMU)
                </td>
                <td className="p-4 font-mono text-slate-300">41,892.4 m</td>
                <td className="p-4 font-mono text-red-400 font-bold">3,339.1 m</td>
                <td className="p-4 font-mono text-red-400 font-bold">7.97 %</td>
                <td className="p-4 text-right">
                  <span className="bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full border border-red-500/30 text-[10px] font-semibold">
                    High Drift
                  </span>
                </td>
              </tr>

              <tr className="bg-[#3b82f6]/5 hover:bg-[#3b82f6]/10">
                <td className="p-4 font-bold text-[#3b82f6] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                  AI-Assisted IDR Model (Proposed)
                </td>
                <td className="p-4 font-mono text-slate-300">41,892.4 m</td>
                <td className="p-4 font-mono text-[#3b82f6] font-bold">1,010.2 m</td>
                <td className="p-4 font-mono text-[#3b82f6] font-bold">2.41 %</td>
                <td className="p-4 text-right">
                  <span className="bg-[#3b82f6]/20 text-[#00E5FF] px-2.5 py-1 rounded-full border border-[#00E5FF]/40 text-[10px] font-bold">
                    69.75% Improved
                  </span>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
