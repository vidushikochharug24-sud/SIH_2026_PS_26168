import React from 'react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  precision?: number;
  subtext?: string;
  color?: string;
  isGood?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  precision = 1,
  subtext,
  color = '#E8E6F5',
  isGood = true,
}) => {
  return (
    <div className="bg-[#0c0f19] border border-white/5 p-4 rounded-xl relative overflow-hidden flex flex-col justify-between">
      <div>
        <div className="text-xs font-sans font-medium text-slate-400 mb-1">
          {title}
        </div>
        <div className="font-mono text-2xl font-bold tracking-tight" style={{ color }}>
          <motion.span
            key={value}
            initial={{ opacity: 0.6, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {value.toFixed(precision)}
          </motion.span>
          {unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
        </div>
      </div>

      {subtext && (
        <div className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-sans">
          {subtext}
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 h-[2px] ${
          isGood
            ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
            : 'bg-gradient-to-r from-red-400 to-rose-500'
        }`}
      />
    </div>
  );
};
