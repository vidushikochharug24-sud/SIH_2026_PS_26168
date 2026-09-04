import React from 'react';
import { MapPin } from 'lucide-react';

export const MapMatchingSection: React.FC = () => {
  return (
    <section className="py-20 px-4 max-w-5xl mx-auto font-sans">
      <div className="bg-[#0a0d16]/90 border border-white/10 rounded-2xl p-6 md:p-10 text-center md:text-left shadow-2xl">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-6 space-y-4">
            <span className="text-xs font-semibold text-[#00E5FF] uppercase tracking-wider block font-mono">
              Physical Road Network Integration
            </span>
            <h2 className="font-display italic text-3xl md:text-5xl font-normal text-white tracking-tight leading-tight drop-shadow-[0_0_25px_rgba(0,229,255,0.3)]">
              Map Matching & Non-Holonomic Constraints
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Vehicles cannot move sideways or leave drivable road boundaries. By combining Non-Holonomic Constraints (NHC: zero lateral velocity) with road geometry matching, drifting inertial estimates smoothly converge onto actual road centerlines.
            </p>

            <div className="pt-2 grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block mb-1">LATERAL DRIFT (NHC)</span>
                <span className="text-emerald-400 font-bold">0.00 m/s</span>
              </div>
              <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 block mb-1">ROAD CONSTRAINTS</span>
                <span className="text-[#00E5FF] font-bold">ENFORCED</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 flex justify-center">
            <div className="relative w-full max-w-sm h-64 bg-slate-950 border border-white/10 rounded-2xl p-4 flex flex-col justify-between overflow-hidden">
              
              <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>ROAD VECTOR GEOMETRY</span>
                <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
              </div>

              <svg viewBox="0 0 300 120" className="w-full h-32">
                <path d="M 10 90 Q 150 10 290 90" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="24" strokeLinecap="round" />
                <path d="M 10 90 Q 150 10 290 90" fill="none" stroke="#00E5FF" strokeWidth="1" strokeDasharray="4,4" />

                <path d="M 10 90 Q 140 30 270 110" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,4" />
                <path d="M 10 90 Q 150 12 288 88" fill="none" stroke="#3b82f6" strokeWidth="3" />
              </svg>

              <div className="flex justify-between items-center font-mono text-[10px]">
                <span className="text-red-400">Drifting IMU estimate</span>
                <span className="text-[#3b82f6] font-bold">Matched Road Vector</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
