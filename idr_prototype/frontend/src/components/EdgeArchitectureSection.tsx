import React from 'react';
import { Cpu, Smartphone, ArrowRight, Zap } from 'lucide-react';

export const EdgeArchitectureSection: React.FC = () => {
  return (
    <section className="py-20 px-4 max-w-5xl mx-auto font-sans">
      <div className="bg-[#0a0d16]/90 border border-white/10 rounded-2xl p-6 md:p-10 text-center shadow-2xl">
        
        <span className="text-xs font-semibold text-[#00E5FF] uppercase tracking-wider block mb-2 font-mono">
          Edge Hardware Deployment
        </span>
        <h2 className="font-display italic text-3xl md:text-5xl font-normal text-white tracking-tight leading-tight mb-3 drop-shadow-[0_0_25px_rgba(0,229,255,0.3)]">
          10Hz Smartphone Real-Time Inference
        </h2>
        <p className="text-xs md:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
          Our model trains on cloud GPU telemetry logs and quantizes into lightweight ONNX / TFLite binaries, delivering low-latency 10Hz position predictions directly on mobile hardware without cloud dependencies.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
          
          <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl w-full md:w-1/3 flex flex-col items-center">
            <Cpu className="w-8 h-8 text-[#00E5FF] mb-3" />
            <span className="font-bold text-white mb-1 font-sans">CLOUD / WORKSTATION</span>
            <span className="text-[10px] text-slate-400 font-sans">Offline Model Training & Hyperparameter Tuning</span>
          </div>

          <ArrowRight className="w-6 h-6 text-slate-500 shrink-0 transform rotate-90 md:rotate-0" />

          <div className="bg-slate-900 border border-[#3b82f6]/40 p-5 rounded-2xl w-full md:w-1/3 flex flex-col items-center shadow-[0_0_25px_rgba(59,130,246,0.2)]">
            <Zap className="w-8 h-8 text-[#3b82f6] mb-3" />
            <span className="font-bold text-white mb-1 font-sans">LIGHTWEIGHT QUANTIZATION</span>
            <span className="text-[10px] text-slate-400 font-sans">TFLite / ONNX Float16 Mobile Runtime</span>
          </div>

          <ArrowRight className="w-6 h-6 text-slate-500 shrink-0 transform rotate-90 md:rotate-0" />

          <div className="bg-slate-900 border border-emerald-500/40 p-5 rounded-2xl w-full md:w-1/3 flex flex-col items-center">
            <Smartphone className="w-8 h-8 text-emerald-400 mb-3" />
            <span className="font-bold text-white mb-1 font-sans">SMARTPHONE EDGE ENGINE</span>
            <span className="text-[10px] text-slate-400 font-sans">10Hz Real-Time Inference on IMU Motion Stream</span>
          </div>

        </div>

      </div>
    </section>
  );
};
