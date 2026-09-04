import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export const SignalFilterSection: React.FC = () => {
  const [filterActive, setFilterActive] = useState(true);

  const pointsCount = 100;
  const rawPath = Array.from({ length: pointsCount }).map((_, i) => {
    const x = (i / pointsCount) * 500;
    const base = 40 + Math.sin(i * 0.1) * 15;
    const noise = Math.sin(i * 0.8) * 8 + (Math.random() - 0.5) * 6;
    return `${i === 0 ? 'M' : 'L'} ${x} ${base + noise}`;
  }).join(' ');

  const filteredPath = Array.from({ length: pointsCount }).map((_, i) => {
    const x = (i / pointsCount) * 500;
    const base = 40 + Math.sin(i * 0.1) * 15;
    return `${i === 0 ? 'M' : 'L'} ${x} ${base}`;
  }).join(' ');

  return (
    <section className="py-20 px-4 max-w-5xl mx-auto font-sans">
      <div className="bg-[#0c0f19]/90 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1 font-mono">
              Neural Kinematic Signal Cleaning
            </span>
            <h2 className="font-display italic text-3xl md:text-4xl font-normal text-white tracking-tight leading-tight drop-shadow-[0_0_25px_rgba(46,230,166,0.3)]">
              AI Speed & Engine Vibration Filter
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
              Raw phone accelerometers capture engine vibrations, chassis thumps, and pothole spikes. Our neural net filters high-frequency noise to extract true forward vehicle velocity.
            </p>
          </div>

          <button
            onClick={() => setFilterActive(!filterActive)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border cursor-pointer transition-all ${
              filterActive
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-red-500/10 border-red-500/40 text-red-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{filterActive ? 'AI Filter: Active' : 'Raw Noise: Unfiltered'}</span>
          </button>
        </div>

        {/* Waveform Canvas Container */}
        <div className="bg-[#070913] border border-white/5 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 mb-2">
            <span>SIGNAL WAVEFORM (ACCELEROMETER LOG)</span>
            <span>100 samples/sec</span>
          </div>

          <svg viewBox="0 0 500 80" className="w-full h-28 overflow-visible">
            <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="4,4" />
            <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.08)" />
            <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="4,4" />

            <path
              d={filterActive ? filteredPath : rawPath}
              fill="none"
              stroke={filterActive ? '#2EE6A6' : '#ef4444'}
              strokeWidth="2.5"
              className="transition-all duration-300"
            />
          </svg>

          <div className="mt-3 flex items-center justify-between text-xs font-mono pt-2 border-t border-white/5">
            <span className="text-slate-400">Predicted Speed output:</span>
            <span className="text-[#00E5FF] font-bold">16.40 m/s (59.0 km/h)</span>
          </div>
        </div>

      </div>
    </section>
  );
};
