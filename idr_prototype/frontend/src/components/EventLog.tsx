import React from 'react';
import { motion } from 'framer-motion';
import { useReplayStore } from '../state/replayStore';

export const EventLog: React.FC = () => {
  const eventLogs = useReplayStore((s) => s.eventLogs);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'init':
        return 'text-[#00E5FF]';
      case 'outage':
        return 'text-red-400';
      case 'restore':
        return 'text-[#3b82f6]';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="bg-[#0c0f19] border border-white/5 p-4 rounded-xl h-[190px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-sans font-semibold text-slate-300">
          System event log
        </span>
        <span className="font-sans text-xs text-red-400 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shadow-[0_0_6px_#EF4444]" />
          Live
        </span>
      </div>

      {/* Terminal Log Container */}
      <div className="flex-1 bg-[#070913] border border-white/5 rounded-lg p-3 font-mono text-[11px] overflow-y-auto terminal-scrollbar space-y-1">
        {eventLogs.map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2 leading-relaxed"
          >
            <span className="text-slate-500 text-[10px] shrink-0">[{log.time}]</span>
            <span className={getTypeStyle(log.type)}>{log.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
