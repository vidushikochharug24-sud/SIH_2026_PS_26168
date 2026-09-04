import React from 'react';
import { useReplayStore } from '../state/replayStore';
import { Activity, Compass, Gauge, Move } from 'lucide-react';

export const SensorPanel: React.FC = () => {
  const accelHistory = useReplayStore((s) => s.accelHistory);
  const gyroHistory = useReplayStore((s) => s.gyroHistory);
  const velHistory = useReplayStore((s) => s.velHistory);
  const dispHistory = useReplayStore((s) => s.dispHistory);

  const latestAccel = accelHistory.length > 0 ? accelHistory[accelHistory.length - 1] : 9.77;
  const latestGyro = gyroHistory.length > 0 ? gyroHistory[gyroHistory.length - 1] : 0.01;
  const latestVel = velHistory.length > 0 ? velHistory[velHistory.length - 1] : 16.40;
  const latestDisp = dispHistory.length > 0 ? dispHistory[dispHistory.length - 1] : 0.00;

  return (
    <div className="bg-[#0c0f19] border border-white/5 rounded-xl p-4">
      {/* Header (sentence case, clean sans font) */}
      <h3 className="text-xs font-sans font-semibold text-slate-300 mb-3">
        Real-time IMU & kinematics telemetry
      </h3>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Card 1: Accel Magnitude */}
        <div className="bg-[#070913] p-3.5 rounded-lg border border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-sans font-medium text-slate-400">
            <span>Accel magnitude</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-emerald-400">
            {latestAccel.toFixed(2)} <span className="text-xs font-normal text-slate-400">m/s²</span>
          </div>
        </div>

        {/* Card 2: Gyro Magnitude */}
        <div className="bg-[#070913] p-3.5 rounded-lg border border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-sans font-medium text-slate-400">
            <span>Gyro magnitude</span>
            <Compass className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-amber-400">
            {latestGyro.toFixed(2)} <span className="text-xs font-normal text-slate-400">rad/s</span>
          </div>
        </div>

        {/* Card 3: Predicted Speed */}
        <div className="bg-[#070913] p-3.5 rounded-lg border border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-sans font-medium text-slate-400">
            <span>Predicted speed</span>
            <Gauge className="w-3.5 h-3.5 text-[#00E5FF]" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-[#00E5FF]">
            {latestVel.toFixed(2)} <span className="text-xs font-normal text-slate-400">m/s</span>
          </div>
        </div>

        {/* Card 4: Outage Displacement */}
        <div className="bg-[#070913] p-3.5 rounded-lg border border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-sans font-medium text-slate-400">
            <span>Outage displacement</span>
            <Move className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-red-400">
            {latestDisp.toFixed(2)} <span className="text-xs font-normal text-slate-400">m</span>
          </div>
        </div>

      </div>
    </div>
  );
};
