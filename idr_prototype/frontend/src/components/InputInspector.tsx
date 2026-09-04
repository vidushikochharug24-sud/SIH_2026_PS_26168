import React from 'react';
import { useReplayStore } from '../state/replayStore';
import { Database, Activity, Radio, Compass } from 'lucide-react';

export const InputInspector: React.FC = () => {
  const accelHistory = useReplayStore((s) => s.accelHistory);
  const gyroHistory = useReplayStore((s) => s.gyroHistory);
  const gtTrajectory = useReplayStore((s) => s.gtTrajectory);
  const aiTrajectory = useReplayStore((s) => s.aiTrajectory);
  const stepIdx = useReplayStore((s) => s.stepIdx);
  const totalSteps = useReplayStore((s) => s.totalSteps);

  const latestGt = gtTrajectory.length > 0 ? gtTrajectory[gtTrajectory.length - 1] : { x: 0, y: 0 };
  const latestAi = aiTrajectory.length > 0 ? aiTrajectory[aiTrajectory.length - 1] : { x: 0, y: 0 };

  const latestAccel = accelHistory.length > 0 ? accelHistory[accelHistory.length - 1] : 9.81;
  const latestGyro = gyroHistory.length > 0 ? gyroHistory[gyroHistory.length - 1] : 0.01;

  const ax = (latestAccel * 0.15).toFixed(2);
  const ay = (latestAccel * 0.08).toFixed(2);
  const az = (latestAccel * 0.98).toFixed(2);

  const gx = (latestGyro * 0.1).toFixed(3);
  const gy = (latestGyro * 0.05).toFixed(3);
  const gz = latestGyro.toFixed(3);

  return (
    <div className="bg-[#0c0f19] border border-white/5 rounded-xl p-4 space-y-4">
      
      {/* Header (clean sans font) */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="text-xs font-sans font-semibold text-slate-200">
            Seeded input telemetry feed
          </h3>
        </div>
        <span className="font-mono text-xs text-[#2EE6A6] bg-[#2EE6A6]/10 px-2 py-0.5 rounded border border-[#2EE6A6]/30">
          Frame {stepIdx}/{totalSteps}
        </span>
      </div>

      {/* Raw 3-Axis Accelerometer Stream */}
      <div>
        <div className="flex justify-between items-center text-xs font-sans text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            3-axis accelerometer (m/s²)
          </span>
          <span className="text-emerald-400 font-mono font-medium">{latestAccel.toFixed(2)} mag</span>
        </div>
        <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
          <div className="bg-black/40 p-2 rounded-lg border border-white/5">
            <span className="text-[9px] font-sans text-slate-400 block mb-0.5">A_X</span>
            <span className="text-slate-200 font-bold">{ax}</span>
          </div>
          <div className="bg-black/40 p-2 rounded-lg border border-white/5">
            <span className="text-[9px] font-sans text-slate-400 block mb-0.5">A_Y</span>
            <span className="text-slate-200 font-bold">{ay}</span>
          </div>
          <div className="bg-black/40 p-2 rounded-lg border border-white/5">
            <span className="text-[9px] font-sans text-slate-400 block mb-0.5">A_Z</span>
            <span className="text-slate-200 font-bold">{az}</span>
          </div>
        </div>
      </div>

      {/* Raw 3-Axis Gyroscope Rate Stream */}
      <div>
        <div className="flex justify-between items-center text-xs font-sans text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            3-axis gyroscope rate (rad/s)
          </span>
          <span className="text-amber-400 font-mono font-medium">{latestGyro.toFixed(3)} mag</span>
        </div>
        <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
          <div className="bg-black/40 p-2 rounded-lg border border-white/5">
            <span className="text-[9px] font-sans text-slate-400 block mb-0.5">G_X</span>
            <span className="text-slate-200 font-bold">{gx}</span>
          </div>
          <div className="bg-black/40 p-2 rounded-lg border border-white/5">
            <span className="text-[9px] font-sans text-slate-400 block mb-0.5">G_Y</span>
            <span className="text-slate-200 font-bold">{gy}</span>
          </div>
          <div className="bg-black/40 p-2 rounded-lg border border-white/5">
            <span className="text-[9px] font-sans text-slate-400 block mb-0.5">G_Z</span>
            <span className="text-slate-200 font-bold">{gz}</span>
          </div>
        </div>
      </div>

      {/* Synchronized Fix Positions */}
      <div className="pt-1 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
          <span className="text-[10px] font-sans text-slate-400 flex items-center gap-1 mb-1">
            <Radio className="w-3 h-3 text-emerald-400" /> Ground truth fix (X, Y)
          </span>
          <span className="font-mono text-emerald-400 font-bold block">
            ({latestGt.x.toFixed(1)}, {latestGt.y.toFixed(1)})
          </span>
        </div>
        <div className="bg-black/40 p-2.5 rounded-lg border border-white/5">
          <span className="text-[10px] font-sans text-slate-400 flex items-center gap-1 mb-1">
            <Radio className="w-3 h-3 text-[#3b82f6]" /> AI model fix (X, Y)
          </span>
          <span className="font-mono text-[#3b82f6] font-bold block">
            ({latestAi.x.toFixed(1)}, {latestAi.y.toFixed(1)})
          </span>
        </div>
      </div>

    </div>
  );
};
