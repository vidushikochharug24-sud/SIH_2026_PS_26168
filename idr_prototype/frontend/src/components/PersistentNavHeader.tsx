import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, Radio, ZapOff, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useReplayStore } from '../state/replayStore';

interface PersistentNavHeaderProps {
  currentSection?: string;
  onNavigateCockpit?: () => void;
}

export const PersistentNavHeader: React.FC<PersistentNavHeaderProps> = ({
  currentSection = 'hero',
  onNavigateCockpit,
}) => {
  const gnssStatus = useReplayStore((s) => s.gnssStatus);

  const getStatusBadge = () => {
    if (currentSection === 'blackout' || gnssStatus === 'OUTAGE') {
      return {
        label: 'GNSS Status: Lost (Tunnel Outage)',
        icon: <ZapOff className="w-3.5 h-3.5 text-red-400 animate-pulse" />,
        bg: 'bg-red-500/10 border-red-500/30 text-red-400',
        dot: 'bg-red-500 shadow-[0_0_8px_#EF4444]',
      };
    }

    if (currentSection === 'dr' || currentSection === 'pipeline' || currentSection === 'filter') {
      return {
        label: 'Intelligent Dead Reckoning Active',
        icon: <ShieldCheck className="w-3.5 h-3.5 text-[#3b82f6] animate-pulse" />,
        bg: 'bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6]',
        dot: 'bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]',
      };
    }

    if (currentSection === 'restore' || gnssStatus === 'RESTORED') {
      return {
        label: 'GNSS Restored — Jump-Free EKF Fusion',
        icon: <Radio className="w-3.5 h-3.5 text-[#00E5FF]" />,
        bg: 'bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF]',
        dot: 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]',
      };
    }

    return {
      label: 'GNSS Status: Connected (10Hz Stream)',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400 shadow-[0_0_8px_#34D399]',
    };
  };

  const statusInfo = getStatusBadge();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-[#060812]/80 border-b border-white/5 px-4 md:px-8 py-3 flex items-center justify-between font-sans"
    >
      {/* Brand Title (Matching User Reference Image) */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6]">
          <Navigation className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-sm md:text-base text-white tracking-tight">
            NAVISYNC
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline ml-2 border-l border-white/10 pl-2">
            Intelligent Navigation Beyond GNSS
          </span>
        </div>
      </div>

      {/* Morphing Status Badge */}
      <motion.div
        key={statusInfo.label}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`px-3 py-1.5 rounded-full border flex items-center gap-2 text-xs font-medium transition-all ${statusInfo.bg}`}
      >
        <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
        {statusInfo.icon}
        <span className="hidden md:inline">{statusInfo.label}</span>
      </motion.div>

      {/* Navigation Engine Jump Button */}
      {onNavigateCockpit && (
        <button
          onClick={onNavigateCockpit}
          className="px-3.5 py-1.5 rounded-lg bg-[#3b82f6] text-white text-xs font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
        >
          Navigation Engine
        </button>
      )}
    </motion.header>
  );
};
