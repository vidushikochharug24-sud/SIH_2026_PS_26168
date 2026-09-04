import React from 'react';
import { motion } from 'framer-motion';
import { useReplayStore } from '../state/replayStore';

export const GlowBackground: React.FC = () => {
  const gnssStatus = useReplayStore((s) => s.gnssStatus);

  // Dynamic ambient background tint color based on status
  let tintColor = 'rgba(75, 63, 168, 0.05)';
  if (gnssStatus === 'OUTAGE') {
    tintColor = 'rgba(178, 75, 243, 0.12)';
  } else if (gnssStatus === 'RESTORED') {
    tintColor = 'rgba(79, 163, 255, 0.10)';
  } else if (gnssStatus === 'REPLAYING') {
    tintColor = 'rgba(46, 230, 166, 0.08)';
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top Left Indigo Glow Orb */}
      <div
        className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full blur-[130px] opacity-20"
        style={{ background: 'radial-gradient(circle, #4B3FA8 0%, rgba(0,0,0,0) 70%)' }}
      />

      {/* Bottom Right Teal Glow Orb */}
      <div
        className="absolute -bottom-32 -right-32 w-[700px] h-[700px] rounded-full blur-[140px] opacity-18"
        style={{ background: 'radial-gradient(circle, #1FBF9C 0%, rgba(0,0,0,0) 70%)' }}
      />

      {/* Full-Page Dynamic Tint Shift Layer */}
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundColor: tintColor }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
    </div>
  );
};
