import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Activity, Gauge, Compass, Layers, ShieldCheck, MapPin, CheckCircle } from 'lucide-react';
import { Pipeline3DBackground } from './Pipeline3DBackground';

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
    <section className="relative py-28 px-6 md:px-12 bg-[#020B18] border-b border-white/10 overflow-hidden font-sans">
      
      {/* ── 3D CANVASES & AMBIENT NEON GRID BACKGROUND ── */}
      <Pipeline3DBackground />

      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Glowing Cyan & Teal Radial Spotlights */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] bg-gradient-to-tr from-[#00D9FF]/15 via-[#00E6B8]/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute bottom-20 left-10 w-[500px] h-[400px] bg-[#168CFF]/10 blur-[130px] rounded-full" />
        <div className="absolute top-20 right-10 w-[450px] h-[350px] bg-[#7657FF]/10 blur-[120px] rounded-full" />

        {/* High-Tech Blueprint Cyber Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `radial-gradient(#00D9FF 1px, transparent 1px), linear-gradient(to right, rgba(0, 217, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 217, 255, 0.05) 1px, transparent 1px)`,
            backgroundSize: `24px 24px, 48px 48px, 48px 48px`
          }}
        />
        
        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020B18] via-transparent to-[#020B18]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#00D9FF] uppercase tracking-widest block mb-2 font-mono drop-shadow-[0_0_10px_rgba(0,217,255,0.5)]">
            Continuous Engine Architecture
          </span>
          <h2 className="font-display italic text-3xl md:text-5xl font-normal text-white tracking-tight leading-tight drop-shadow-[0_0_35px_rgba(0,217,255,0.4)]">
            Continuous Spatial Journey Through the IDR Engine
          </h2>
          <p className="text-[#B7C7D9] text-sm max-w-xl mx-auto mt-3 leading-relaxed font-sans">
            Follow the trajectory line as raw smartphone motion sensors travel through all 8 spatial processing stages.
          </p>
        </div>

        {/* Spatial Trajectory Timeline Journey Container */}
        <div className="relative">
          
          {/* Central Connecting Trajectory Beam Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-[#168CFF] via-[#00D9FF] to-[#00E6B8] opacity-60 shadow-[0_0_20px_#00D9FF] hidden md:block" />

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
                  <div className="w-full md:w-1/2 p-3">
                    <div className="bg-[#041B2D]/85 border border-[#00D9FF]/25 p-6 rounded-2xl relative overflow-hidden backdrop-blur-xl shadow-[0_0_30px_rgba(0,217,255,0.1)] hover:border-[#00D9FF]/60 transition-all hover:shadow-[0_0_45px_rgba(0,217,255,0.25)] hover:scale-[1.02]">
                      
                      {/* Top Cyber Accent Corner Line */}
                      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-[#00D9FF]/20 to-transparent pointer-events-none" />

                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs text-[#00D9FF] font-bold tracking-wider">STAGE {node.step}</span>
                        <span className="text-[9px] font-mono text-[#00E6B8] bg-[#00E6B8]/15 px-2.5 py-0.5 rounded-full border border-[#00E6B8]/30 font-semibold tracking-wider">
                          {node.tag}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-[#031426] border border-[#00D9FF]/30 text-[#00D9FF] shrink-0 shadow-[0_0_15px_rgba(0,217,255,0.3)]">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-bold text-white font-sans">{node.title}</h3>
                      </div>

                      <p className="text-xs text-[#B7C7D9] leading-relaxed font-sans">{node.desc}</p>
                    </div>
                  </div>

                  {/* Central Trajectory Node Point */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#020B18] border-2 border-[#00D9FF] flex items-center justify-center shadow-[0_0_20px_#00D9FF] z-10 hidden md:flex">
                    <div className="w-3 h-3 rounded-full bg-[#00E6B8] animate-pulse shadow-[0_0_8px_#00E6B8]" />
                  </div>

                  {/* Spacer for 50% split */}
                  <div className="w-full md:w-1/2 hidden md:block" />

                </motion.div>
              );
            })}
          </div>

        </div>

      </div>

    </section>
  );
};
