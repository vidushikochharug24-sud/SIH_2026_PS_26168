import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Activity, Gauge, Compass, Layers, ShieldCheck, MapPin, CheckCircle } from 'lucide-react';

const pipelineNodes = [
  { step: '01', title: 'Smartphone IMU & GNSS', icon: Cpu, desc: 'Captures raw 3-axis accel, gyro rate, & intermittent GPS fixes.', tag: 'INPUT STREAM' },
  { step: '02', title: 'Alignment & Calibration', icon: Compass, desc: 'Estimates 6-DOF phone pitch/roll/yaw relative to vehicle body frame.', tag: 'FRAME TRANSFORM' },
  { step: '03', title: 'AI Speed & Vibration Filter', icon: Activity, desc: 'Neural network removes engine rumble and road spikes to predict forward velocity.', tag: 'SIGNAL CLEANING' },
  { step: '04', title: 'Dead Reckoning Propagation', icon: Gauge, desc: 'Integrates velocity & heading rate to maintain trajectory propagation.', tag: 'PROPAGATION' },
  { step: '05', title: 'AI Inertial Drift Correction', icon: ShieldCheck, desc: 'Corrects systematic gyroscope bias and heading accumulation error.', tag: 'BIAS CORRECTION' },
  { step: '06', title: 'GNSS + INS EKF Fusion', icon: Layers, desc: 'Extended Kalman Filter fuses inertial dead reckoning with satellite fixes when available.', tag: 'EKF FUSION' },
  { step: '07', title: 'Map Matching & NHC', icon: MapPin, desc: 'Applies Non-Holonomic Constraints and road network geometry matching.', tag: 'ROAD CONSTRAINTS' },
  { step: '08', title: 'Continuous 10Hz Output', icon: CheckCircle, desc: 'Outputs seamless, zero-jump vehicle coordinates at 10Hz.', tag: '10Hz OUTPUT' },
];

export const EnginePipelineSection: React.FC = () => {
  return (
    <section className="py-24 px-4 max-w-5xl mx-auto font-sans relative">
      
      {/* Section Header */}
      <div className="text-center mb-16">
        <span className="text-xs font-semibold text-[#00E5FF] uppercase tracking-wider block mb-2 font-mono">
          Continuous Engine Architecture
        </span>
        <h2 className="font-display italic text-3xl md:text-5xl font-normal text-white tracking-tight leading-tight drop-shadow-[0_0_25px_rgba(0,229,255,0.3)]">
          Continuous Spatial Journey Through the IDR Engine
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2 leading-relaxed">
          Follow the trajectory line as raw smartphone motion sensors travel through all 8 spatial processing stages.
        </p>
      </div>

      {/* Spatial Trajectory Timeline Journey Container */}
      <div className="relative">
        
        {/* Central Connecting Trajectory Beam Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-[#3b82f6] via-[#00E5FF] to-[#2EE6A6] opacity-40 shadow-[0_0_15px_#00E5FF] hidden md:block" />

        <div className="space-y-12">
          {pipelineNodes.map((node, i) => {
            const IconComp = node.icon;
            const isEven = i % 2 === 0;

            return (
              <motion.div
                key={node.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                viewport={{ once: true }}
                className={`relative flex flex-col md:flex-row items-center ${
                  isEven ? 'md:flex-row-reverse' : ''
                }`}
              >
                
                {/* Node Card Content */}
                <div className="w-full md:w-1/2 p-4">
                  <div className="bg-[#0c0f19]/90 border border-white/10 p-6 rounded-2xl relative overflow-hidden shadow-xl hover:border-[#00E5FF]/40 transition-all hover:shadow-[0_0_30px_rgba(0,229,255,0.15)]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs text-slate-500 font-bold">STAGE {node.step}</span>
                      <span className="text-[9px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20">
                        {node.tag}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-slate-900 border border-white/10 text-[#00E5FF] shrink-0">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-white font-sans">{node.title}</h3>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{node.desc}</p>
                  </div>
                </div>

                {/* Central Trajectory Node Point */}
                <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#050711] border-2 border-[#00E5FF] flex items-center justify-center shadow-[0_0_15px_#00E5FF] z-10 hidden md:flex">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2EE6A6] animate-pulse" />
                </div>

                {/* Spacer for 50% split */}
                <div className="w-full md:w-1/2 hidden md:block" />

              </motion.div>
            );
          })}
        </div>

      </div>

    </section>
  );
};
