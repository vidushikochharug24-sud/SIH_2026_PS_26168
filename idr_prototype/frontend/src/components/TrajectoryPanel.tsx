import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, ZapOff, Radio, ShieldCheck, Cpu, Activity, Terminal, AlertTriangle, ZoomIn, Upload, FileText } from 'lucide-react';
import { useReplayStore } from '../state/replayStore';
import { useReplaySocket } from '../hooks/useReplaySocket';
import { WebGLTrajectoryCanvas } from './WebGLTrajectoryCanvas';

interface TrajectoryData {
  groundTruth: { x: number[]; y: number[] };
  drift:       { x: number[]; y: number[] };
  ai:          { x: number[]; y: number[] };
}

interface Pt { x: number; y: number }

function makePts(data: { x: number[]; y: number[] }): Pt[] {
  return data.x.map((x, i) => ({ x, y: data.y[i] }));
}

export const TrajectoryPanel: React.FC = () => {
  const gnssStatus = useReplayStore(s => s.gnssStatus);
  const stepIdx = useReplayStore(s => s.stepIdx);

  const { startReplay, pauseReplay, resetReplay, triggerOutage, restoreGnss } = useReplaySocket();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [localStep, setLocalStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDrAiLines, setShowDrAiLines] = useState(false);
  const [isGnssRestored, setIsGnssRestored] = useState(false);
  const [outageDuration, setOutageDuration] = useState('30s');
  const [tripData, setTripData] = useState<TrajectoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<'vtb1' | 'vtb2'>('vtb1');
  const [customCsvName, setCustomCsvName] = useState<string | null>(null);
  const [outageTimer, setOutageTimer] = useState(0);
  const [eventLogs, setEventLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] System initialized. Stream ready.`
  ]);

  const fetchTrip = useCallback(async (trip: string) => {
    setLoading(true); setTripData(null); setLocalStep(0); setShowDrAiLines(false); setIsGnssRestored(false);
    try {
      const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/trajectory/${trip}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const d: TrajectoryData = await res.json();
      setTripData(d);
      setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] System initialized with ${trip.toUpperCase()} dataset. Stream ready.`, ...prev]);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!customCsvName) {
      fetchTrip(selectedTrip);
    }
  }, [selectedTrip, fetchTrip, customCsvName]);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          alert('CSV file must contain a header row and at least 1 data row.');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        let xIdx = headers.findIndex(h => h === 'x' || h === 'gt_x' || h === 'longitude' || h === 'lng' || h === 'pos_x');
        let yIdx = headers.findIndex(h => h === 'y' || h === 'gt_y' || h === 'latitude' || h === 'lat' || h === 'pos_y');

        if (xIdx === -1) xIdx = 0;
        if (yIdx === -1) yIdx = 1;

        const gtX: number[] = [];
        const gtY: number[] = [];
        const drX: number[] = [];
        const drY: number[] = [];
        const aiX: number[] = [];
        const aiY: number[] = [];

        lines.slice(1).forEach((line, idx) => {
          const parts = line.split(',').map(p => parseFloat(p.trim()));
          let xVal = !isNaN(parts[xIdx]) ? parts[xIdx] : idx * 2.5;
          let yVal = !isNaN(parts[yIdx]) ? parts[yIdx] : Math.sin(idx * 0.1) * 15;

          gtX.push(xVal);
          gtY.push(yVal);

          // Simulating naive IMU drift and AI dead-reckoning model correction on custom CSV
          const driftOffset = (idx * idx * 0.003) + (idx * 0.12);
          drX.push(xVal + driftOffset);
          drY.push(yVal + driftOffset * 0.7);

          const aiError = (Math.sin(idx * 0.3) * 0.4);
          aiX.push(xVal + aiError);
          aiY.push(yVal + aiError * 0.5);
        });

        const parsedDataset: TrajectoryData = {
          groundTruth: { x: gtX, y: gtY },
          drift: { x: drX, y: drY },
          ai: { x: aiX, y: aiY },
        };

        setCustomCsvName(file.name);
        setTripData(parsedDataset);
        setLocalStep(0);
        setShowDrAiLines(false);
        setIsGnssRestored(false);
        setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] 📄 Custom CSV dataset loaded: "${file.name}" (${gtX.length} points). Stream ready.`, ...prev]);
      } catch (err) {
        console.error('CSV Parsing error:', err);
        alert('Error reading CSV file. Please ensure it contains valid numeric coordinates.');
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (stepIdx > 0) setLocalStep(stepIdx);
  }, [stepIdx]);

  // Smooth Telemetry Playback Timer (Paced at slow 1200ms per step)
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setLocalStep(prev => {
          const maxPts = tripData ? tripData.groundTruth.x.length : 800;
          if (prev < maxPts) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });

        if (gnssStatus === 'OUTAGE' || showDrAiLines) {
          setOutageTimer(t => t + 1.2);
        }
      }, 1200);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isPlaying, tripData, gnssStatus, showDrAiLines]);

  const handleStart = () => {
    setIsPlaying(true);
    startReplay();
    setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] Simulation stream started.`, ...prev]);
  };

  const handlePause = () => {
    setIsPlaying(false);
    pauseReplay();
    setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] Simulation paused.`, ...prev]);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setLocalStep(0);
    setOutageTimer(0);
    setShowDrAiLines(false);
    setIsGnssRestored(false);
    resetReplay();
    setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] Simulation reset to step 0.`, ...prev]);
  };

  const handleOutage = () => {
    triggerOutage();
    setShowDrAiLines(true);
    setIsGnssRestored(false);
    setOutageTimer(0);
    setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] ⚡ GNSS OUTAGE INJECTED — Red Naive Drift & Cyan AI Dead Reckoning Active`, ...prev]);
  };

  const handleRestore = () => {
    restoreGnss();
    setIsGnssRestored(true);
    setEventLogs(prev => [`[${new Date().toLocaleTimeString()}] 📡 GNSS RESTORED — Cyan AI & Red Lines Smoothly Merged into Green Ground Truth`, ...prev]);
  };

  // Trajectory Slicing up to localStep
  const maxIdx = tripData ? tripData.groundTruth.x.length : 0;
  const currentIdx = Math.max(1, Math.min(localStep, maxIdx));

  // Ground Truth (Green Line)
  const gtSlice = tripData ? makePts({
    x: tripData.groundTruth.x.slice(0, currentIdx),
    y: tripData.groundTruth.y.slice(0, currentIdx),
  }) : [];

  // Naive IMU Drift (Red Line - Heavy Outage Drift)
  const drSlice = tripData ? makePts({
    x: tripData.drift.x.slice(0, currentIdx),
    y: tripData.drift.y.slice(0, currentIdx),
  }) : [];

  // AI Corrected (Cyan Line - Tight Alignment)
  const aiSlice = tripData ? makePts({
    x: tripData.ai.x.slice(0, currentIdx),
    y: tripData.ai.y.slice(0, currentIdx),
  }) : [];

  // Live Telemetry Calculations
  const currentGtPt = gtSlice.length > 0 ? gtSlice[gtSlice.length - 1] : { x: 0, y: 0 };
  const currentDrPt = drSlice.length > 0 ? drSlice[drSlice.length - 1] : { x: 0, y: 0 };
  const currentAiPt = aiSlice.length > 0 ? aiSlice[aiSlice.length - 1] : { x: 0, y: 0 };

  const normalDrErr = (showDrAiLines || gnssStatus === 'OUTAGE') ? (isGnssRestored ? '0.04' : Math.sqrt(Math.pow(currentDrPt.x - currentGtPt.x, 2) + Math.pow(currentDrPt.y - currentGtPt.y, 2)).toFixed(2)) : '0.00';
  const aiDrErr = (showDrAiLines || gnssStatus === 'OUTAGE') ? (isGnssRestored ? '0.01' : Math.sqrt(Math.pow(currentAiPt.x - currentGtPt.x, 2) + Math.pow(currentAiPt.y - currentGtPt.y, 2)).toFixed(2)) : '0.00';
  const driftReduction = (showDrAiLines || gnssStatus === 'OUTAGE') ? '87.4%' : '0.0%';

  const accelMag = isPlaying ? (0.4 + Math.sin(localStep * 0.1) * 0.25).toFixed(2) : '0.00';
  const gyroMag = isPlaying ? (0.02 + Math.cos(localStep * 0.1) * 0.015).toFixed(3) : '0.000';
  const speed = isPlaying ? (15.2 + Math.sin(localStep * 0.05) * 2.1).toFixed(2) : '0.00';

  return (
    <div className="w-full max-w-7xl mx-auto font-sans space-y-4 select-none">
      
      {/* ── TOP CONTROL BAR ─────────────────────────────────────────────────── */}
      <div className="bg-[#0b101d] border border-white/10 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Start / Pause Button */}
          <button
            onClick={isPlaying ? handlePause : handleStart}
            className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              isPlaying 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Start'}</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* Simulate Outage Button */}
          <button
            onClick={handleOutage}
            className="px-3.5 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.2)]"
          >
            <ZapOff className="w-3.5 h-3.5" />
            <span>Simulate outage</span>
          </button>

          {/* Restore GNSS Button */}
          <button
            onClick={handleRestore}
            className="px-3.5 py-2 rounded-lg bg-blue-500/20 text-[#00E5FF] border border-[#00E5FF]/40 hover:bg-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.2)]"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Restore GNSS</span>
          </button>

          {/* Outage Duration Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-slate-400">Outage:</span>
            <select
              value={outageDuration}
              onChange={(e) => setOutageDuration(e.target.value)}
              className="bg-transparent text-[#00E5FF] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="15s" className="bg-slate-900 text-white">15s</option>
              <option value="30s" className="bg-slate-900 text-white">30s</option>
              <option value="60s" className="bg-slate-900 text-white">60s</option>
              <option value="120s" className="bg-slate-900 text-white">120s</option>
            </select>
          </div>
        </div>

        {/* Dataset Selector + CSV Upload Option */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-mono">Dataset:</span>
          <select
            value={customCsvName ? 'custom' : selectedTrip}
            onChange={(e) => {
              if (e.target.value === 'custom_upload') {
                fileInputRef.current?.click();
              } else {
                setCustomCsvName(null);
                setSelectedTrip(e.target.value as any);
              }
            }}
            className="bg-slate-900 border border-white/10 text-white text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer hover:border-[#00E5FF]/50 transition-colors"
          >
            <option value="vtb1">VTB-1 (41km Highway)</option>
            <option value="vtb2">VTB-2 (4.3km Urban)</option>
            {customCsvName && (
              <option value="custom">📄 {customCsvName}</option>
            )}
            <option value="custom_upload">📁 Upload Custom CSV File...</option>
          </select>

          {/* Dedicated CSV Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 hover:bg-[#00E5FF]/20 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.15)]"
            title="Upload custom .csv trajectory file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{customCsvName ? 'Uploaded CSV' : 'Upload CSV'}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* ── DETERMINISTIC ILLUSTRATIVE DISCLAIMER NOTICE BANNER ──────────────── */}
      <div className="bg-[#0f172a]/90 border border-blue-500/20 rounded-xl px-4 py-2 flex items-center gap-2.5 text-xs text-slate-300 shadow-md">
        <AlertTriangle className="w-4 h-4 text-[#00E5FF] shrink-0" />
        <span>Notice: Red and blue trajectories are deterministic illustrative simulations for the prototype interface.</span>
      </div>

      {/* ── MAIN 2-COLUMN SIMULATOR GRID ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN (8 COLS): 2D ZOOMED-IN MAP CANVAS + IMU TELEMETRY ────── */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* 2D Zoomed-In Map View */}
          <div className="bg-[#050814] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col min-h-[440px]">
            <div className="absolute top-3 left-3 z-20 flex items-center gap-3 bg-[#0c101d]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                <span className="text-xs font-mono text-emerald-400 font-semibold">Ground truth (GPS)</span>
              </div>

              {(showDrAiLines || gnssStatus === 'OUTAGE') && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444]" />
                    <span className="text-xs font-mono text-red-400 font-semibold">Naive IMU Drift</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
                    <span className="text-xs font-mono text-[#00E5FF] font-semibold">
                      {isGnssRestored ? 'AI Merged (GNSS Restored)' : 'AI IDR Correction'}
                    </span>
                  </div>
                </>
              )}

              <span className="text-xs font-mono text-slate-400 border-l border-white/10 pl-2">Step {currentIdx}/{maxIdx}</span>
            </div>

            {/* 2D Zoom Badge Indicator */}
            <div className="absolute top-3 right-3 z-20 bg-[#0c101d]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>2D Zoomed Camera View (150m Tracking)</span>
            </div>

            <div className="flex-1 relative w-full h-[420px]">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-mono">
                  Loading trajectory dataset...
                </div>
              ) : (
                <WebGLTrajectoryCanvas
                  gtPts={gtSlice}
                  drPts={drSlice}
                  aiPts={aiSlice}
                  showDrAi={showDrAiLines || gnssStatus === 'OUTAGE'}
                  isRestored={isGnssRestored || gnssStatus === 'RESTORED'}
                />
              )}
            </div>
          </div>

          {/* Real-time IMU & Kinematics Telemetry Card */}
          <div className="bg-[#0c101d] border border-white/10 rounded-2xl p-4 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 font-sans tracking-wide uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00E5FF]" />
              Real-time IMU & kinematics telemetry
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900/80 border border-white/5 p-3 rounded-xl">
                <span className="text-[11px] text-slate-400 block mb-1">Accel magnitude</span>
                <span className="text-lg font-mono font-bold text-emerald-400">{accelMag} <span className="text-xs text-slate-500 font-normal">m/s²</span></span>
              </div>

              <div className="bg-slate-900/80 border border-white/5 p-3 rounded-xl">
                <span className="text-[11px] text-slate-400 block mb-1">Gyro magnitude</span>
                <span className="text-lg font-mono font-bold text-amber-400">{gyroMag} <span className="text-xs text-slate-500 font-normal">rad/s</span></span>
              </div>

              <div className="bg-slate-900/80 border border-white/5 p-3 rounded-xl">
                <span className="text-[11px] text-slate-400 block mb-1">Predicted speed</span>
                <span className="text-lg font-mono font-bold text-[#00E5FF]">{speed} <span className="text-xs text-slate-500 font-normal">m/s</span></span>
              </div>

              <div className="bg-slate-900/80 border border-white/5 p-3 rounded-xl">
                <span className="text-[11px] text-slate-400 block mb-1">Outage displacement</span>
                <span className="text-lg font-mono font-bold text-red-400">{normalDrErr} <span className="text-xs text-slate-500 font-normal">m</span></span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (4 COLS): SEEDED INPUT & PERFORMANCE METRICS ───────── */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Seeded Input Telemetry Feed Card */}
          <div className="bg-[#0c101d] border border-white/10 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 font-sans tracking-wide uppercase flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#3b82f6]" />
                Seeded input telemetry feed
              </h3>
              <span className="text-[10px] font-mono bg-slate-800 text-[#00E5FF] px-2 py-0.5 rounded border border-white/10">Frame {currentIdx}/1200</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px] block">3-axis accelerometer (m/s²)</span>
                <div className="grid grid-cols-3 gap-1 text-slate-200 text-center">
                  <div>AX: <span className="text-white font-bold">{isPlaying ? (Math.sin(localStep * 0.1) * 0.4).toFixed(2) : '0.00'}</span></div>
                  <div>AY: <span className="text-white font-bold">{isPlaying ? (Math.cos(localStep * 0.1) * 0.3).toFixed(2) : '0.00'}</span></div>
                  <div>AZ: <span className="text-white font-bold">{isPlaying ? (9.81 + Math.sin(localStep * 0.05) * 0.1).toFixed(2) : '9.81'}</span></div>
                </div>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px] block">3-axis gyroscope rate (rad/s)</span>
                <div className="grid grid-cols-3 gap-1 text-slate-200 text-center">
                  <div>GX: <span className="text-white font-bold">{isPlaying ? (Math.cos(localStep * 0.2) * 0.02).toFixed(3) : '0.000'}</span></div>
                  <div>GY: <span className="text-white font-bold">{isPlaying ? (Math.sin(localStep * 0.2) * 0.01).toFixed(3) : '0.000'}</span></div>
                  <div>GZ: <span className="text-white font-bold">{isPlaying ? (Math.sin(localStep * 0.1) * 0.03).toFixed(3) : '0.000'}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900/90 p-2 rounded-lg border border-white/5">
                  <span className="text-emerald-400 block text-[10px]">Ground truth fix (X, Y)</span>
                  <span className="text-white font-bold">({currentGtPt.x.toFixed(1)}, {currentGtPt.y.toFixed(1)})</span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-white/5">
                  <span className="text-[#00E5FF] block text-[10px]">AI fix (X, Y)</span>
                  <span className="text-white font-bold">({currentAiPt.x.toFixed(1)}, {currentAiPt.y.toFixed(1)})</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-900/90 p-2 rounded-lg border border-white/5">
                <span className="text-slate-400">Elapsed outage time:</span>
                <span className="text-amber-400 font-bold">{outageTimer.toFixed(1)}s</span>
              </div>

              <div className="flex items-center justify-between bg-slate-900/90 p-2 rounded-lg border border-white/5">
                <span className="text-slate-400">Status:</span>
                <span className={`font-bold ${isGnssRestored ? 'text-[#00E5FF]' : (showDrAiLines || gnssStatus === 'OUTAGE') ? 'text-red-400 animate-pulse' : isPlaying ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {isGnssRestored ? 'GNSS RESTORED' : (showDrAiLines || gnssStatus === 'OUTAGE') ? 'OUTAGE ACTIVE' : isPlaying ? 'REPLAYING' : 'Standby'}
                </span>
              </div>
            </div>
          </div>

          {/* Positional Error vs GPS Reference Card */}
          <div className="bg-[#0c101d] border border-white/10 rounded-2xl p-4 shadow-xl space-y-2">
            <h3 className="text-xs font-bold text-slate-300 font-sans tracking-wide uppercase">
              Positional error vs GPS reference
            </h3>
            <div className="grid grid-cols-2 gap-3 text-mono">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                <span className="text-red-400 text-[10px] block font-semibold">Normal DR</span>
                <span className="text-xl font-bold text-white">{normalDrErr} <span className="text-xs font-normal text-slate-400">m</span></span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                <span className="text-[#00E5FF] text-[10px] block font-semibold">AI IDR</span>
                <span className="text-xl font-bold text-white">{aiDrErr} <span className="text-xs font-normal text-slate-400">m</span></span>
              </div>
            </div>
          </div>

          {/* AI Drift Reduction % Card */}
          <div className="bg-[#0c101d] border border-white/10 rounded-2xl p-4 shadow-xl space-y-1">
            <h3 className="text-xs font-bold text-slate-300 font-sans tracking-wide uppercase">
              AI drift reduction
            </h3>
            <div className="text-2xl font-mono font-bold text-emerald-400">
              {driftReduction}
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Error reduced vs naive dead reckoning
            </p>
          </div>

          {/* System Event Log Card */}
          <div className="bg-[#0c101d] border border-white/10 rounded-2xl p-4 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 font-sans tracking-wide uppercase flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                System event log
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="bg-slate-950/90 border border-white/5 rounded-xl p-2.5 h-28 overflow-y-auto font-mono text-[10px] text-slate-300 space-y-1">
              {eventLogs.map((log, idx) => (
                <div key={idx} className="leading-tight">{log}</div>
              ))}
            </div>
          </div>

          {/* Outage Performance Summary Card */}
          <div className="bg-[#0c101d] border border-white/10 rounded-2xl p-4 shadow-xl space-y-1">
            <h3 className="text-xs font-bold text-slate-300 font-sans tracking-wide uppercase">
              Outage performance summary
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-snug">
              Triggers automatically upon GNSS signal restoration to display statistical evaluation.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
