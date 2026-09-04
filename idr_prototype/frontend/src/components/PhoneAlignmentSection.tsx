import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, RotateCw, Compass } from 'lucide-react';

export const PhoneAlignmentSection: React.FC = () => {
  const [pitch, setPitch] = useState(12);
  const [roll, setRoll] = useState(-5);
  const [yaw, setYaw] = useState(8);

  return (
    <section className="py-20 px-4 max-w-5xl mx-auto font-sans">
      <div className="bg-[#0a0d16]/90 border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Explanation */}
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-semibold text-[#00E5FF] uppercase tracking-wider block font-mono">
              Coordinate Frame Calibration
            </span>
            <h2 className="font-display italic text-3xl md:text-5xl font-normal text-white tracking-tight leading-tight drop-shadow-[0_0_25px_rgba(0,229,255,0.3)]">
              Automatic Phone-to-Vehicle Frame Alignment
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Drivers place smartphones in mounts or console trays at arbitrary angles. Our system dynamically estimates 6-DOF Euler angles (pitch, roll, yaw) to align phone accelerometer and gyroscope axes to the vehicle's true forward direction.
            </p>

            {/* Live Interactive Sliders */}
            <div className="pt-4 space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>PITCH (x-axis tilt)</span>
                  <span className="text-[#00E5FF] font-bold">{pitch}°</span>
                </div>
                <input
                  type="range" min="-45" max="45" value={pitch}
                  onChange={e => setPitch(Number(e.target.value))}
                  className="w-full accent-[#00E5FF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>ROLL (y-axis tilt)</span>
                  <span className="text-emerald-400 font-bold">{roll}°</span>
                </div>
                <input
                  type="range" min="-45" max="45" value={roll}
                  onChange={e => setRoll(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>YAW (heading offset)</span>
                  <span className="text-amber-400 font-bold">{yaw}°</span>
                </div>
                <input
                  type="range" min="-45" max="45" value={yaw}
                  onChange={e => setYaw(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right 3D Interactive Phone Model */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-64 h-80 bg-slate-900/90 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center shadow-2xl">
              
              <motion.div
                style={{
                  rotateX: pitch,
                  rotateY: roll,
                  rotateZ: yaw,
                }}
                className="w-36 h-64 bg-slate-950 border-2 border-[#00E5FF] rounded-2xl p-4 flex flex-col justify-between items-center shadow-[0_0_30px_rgba(0,229,255,0.25)] relative"
              >
                <div className="w-12 h-1 bg-white/20 rounded-full mb-2" />
                <Smartphone className="w-12 h-12 text-[#00E5FF]" />
                <span className="font-mono text-[9px] text-[#00E5FF] uppercase font-bold">
                  PHONE BODY FRAME
                </span>
                <div className="w-6 h-6 rounded-full border border-white/20" />
              </motion.div>

              <div className="absolute bottom-3 text-center font-mono text-[10px] text-slate-400">
                <Compass className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
                Transforming body frame $\rightarrow$ ENU Local Frame
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
