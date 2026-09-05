import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Globe, Zap, ArrowDown, Target, Navigation } from 'lucide-react';
import { useReplayStore } from '../state/replayStore';
import { CyberHighwayCanvas } from './CyberHighwayCanvas';
import { PersistentNavHeader } from './PersistentNavHeader';
import { BlackoutTransition } from './BlackoutTransition';
import { EnginePipelineSection } from './EnginePipelineSection';
import { PhoneAlignmentSection } from './PhoneAlignmentSection';
import { SignalFilterSection } from './SignalFilterSection';
import { DriftComparisonSection } from './DriftComparisonSection';
import { MapMatchingSection } from './MapMatchingSection';
import { GnssReturnSection } from './GnssReturnSection';
import { ResultsBenchmarkSection } from './ResultsBenchmarkSection';
import { EdgeArchitectureSection } from './EdgeArchitectureSection';

export const LandingPage: React.FC = () => {
  const setStoreView = useReplayStore((s) => s.setStoreView);
  
  const [introFinished, setIntroFinished] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const video5Ref = useRef<HTMLVideoElement | null>(null);

  // Mouse Tracking State for GPS Cursor Trail & Radial Spotlight Reveal
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [cursorAngle, setCursorAngle] = useState(0);
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleStartZoomTransition = () => {
    if (isZooming || introFinished) return;
    setIsZooming(true);
    setTimeout(() => {
      setIntroFinished(true);
      setIsZooming(false);
    }, 850);
  };

  useEffect(() => {
    if (video5Ref.current) {
      video5Ref.current.play().catch(e => console.warn('Video play error:', e));
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      setMousePos({ x, y });

      // Calculate GPS Navigation arrow heading angle based on movement delta
      const dx = x - prevMouseRef.current.x;
      const dy = y - prevMouseRef.current.y;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        setCursorAngle(angleDeg);
      }
      prevMouseRef.current = { x, y };

      // Append trailing particles (extended trail length)
      setTrail((prev) => [
        ...prev.slice(-28),
        { x, y, id: Date.now() + Math.random() },
      ]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const progress = totalHeight > 0 ? currentScroll / totalHeight : 0;
      setScrollProgress(progress);

      if (currentScroll < 500) setActiveSection('hero');
      else if (currentScroll < 1200) setActiveSection('blackout');
      else if (currentScroll < 2000) setActiveSection('pipeline');
      else if (currentScroll < 2800) setActiveSection('dr');
      else if (currentScroll < 3600) setActiveSection('restore');
      else setActiveSection('cockpit');
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#04060c] text-[#E8E6F5] overflow-x-hidden font-sans select-none">
      
      {/* ── BACKGROUND 3D STREETVIEW CANVAS ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <CyberHighwayCanvas
          scrollProgress={scrollProgress}
          isBlackout={activeSection === 'blackout'}
        />
      </div>

      {/* ── SATELLITE INTRO VIDEO LAYER WITH CYAN-TO-EMERALD GRADIENT HEADING ─── */}
      <AnimatePresence>
        {!introFinished && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={isZooming ? { opacity: 0, scale: 1.35 } : { opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            onClick={handleStartZoomTransition}
            className="fixed inset-0 z-50 bg-[#04060c] flex flex-col justify-center items-center px-4 select-none cursor-none overflow-hidden"
          >
            {/* Centered Full-Screen Video 5 Layer (Always Visible & Crisp) */}
            <video
              ref={video5Ref}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onCanPlay={(e) => e.currentTarget.play().catch(() => {})}
              onWaiting={(e) => e.currentTarget.play().catch(() => {})}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-75 scale-105 pointer-events-none"
            >
              <source src="/video5.mp4" type="video/mp4" />
            </video>

            {/* Base Background Infinite Image Carousel Strip (Always Visible - Not Black) */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-75 pointer-events-none overflow-hidden flex z-0 py-4">
              <motion.div
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="flex gap-6 min-w-max px-4"
              >
                {['/pic1.jpg', '/pic2.jpg', '/pic3.jpg', '/pic4.jpg', '/pic1.jpg', '/pic2.jpg', '/pic3.jpg', '/pic4.jpg', '/pic1.jpg', '/pic2.jpg', '/pic3.jpg', '/pic4.jpg'].map((imgSrc, i) => (
                  <div key={i} className="w-72 h-44 sm:w-96 sm:h-56 md:w-[420px] md:h-64 rounded-3xl overflow-hidden border border-white/30 shadow-[0_0_30px_rgba(0,229,255,0.25)] bg-black/40 flex-shrink-0">
                    <img src={imgSrc} alt={`Carousel ${i}`} className="w-full h-full object-cover opacity-90 transition-transform duration-500" />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Interactive Cyan Spotlight Beam (Follows cursor, adds vivid glow without blackening outer background) */}
            <div
              className="absolute inset-0 pointer-events-none z-1"
              style={{
                background: `radial-gradient(360px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 229, 255, 0.22) 0%, rgba(46, 230, 166, 0.08) 45%, transparent 80%)`,
              }}
            />

            {/* High-Contrast Spotlight Carousel Overlay (Amplifies brightness under cursor spotlight lens) */}
            <div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden flex z-2 py-4"
              style={{
                WebkitMaskImage: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
                maskImage: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
              }}
            >
              <motion.div
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="flex gap-6 min-w-max px-4"
              >
                {['/pic1.jpg', '/pic2.jpg', '/pic3.jpg', '/pic4.jpg', '/pic1.jpg', '/pic2.jpg', '/pic3.jpg', '/pic4.jpg', '/pic1.jpg', '/pic2.jpg', '/pic3.jpg', '/pic4.jpg'].map((imgSrc, i) => (
                  <div key={i} className="w-72 h-44 sm:w-96 sm:h-56 md:w-[420px] md:h-64 rounded-3xl overflow-hidden border-2 border-[#00E5FF] shadow-[0_0_60px_rgba(0,229,255,0.9)] bg-black flex-shrink-0">
                    <img src={imgSrc} alt={`Spotlight Carousel ${i}`} className="w-full h-full object-cover opacity-100 scale-105" />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Subtle Non-Obscuring Ambient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#04060c]/40 via-transparent to-[#04060c]/40 pointer-events-none z-5" />

            {/* Central Spaced Ultra-Transparent Glass Container Box */}
            <div className="relative z-10 bg-[#060913]/35 backdrop-blur-md border border-white/25 rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_0_90px_rgba(0,229,255,0.3)] flex flex-col items-center justify-center max-w-2xl text-center mx-4 my-auto group">
              
              {/* NAVISYNC Pure CSS Text Logotype */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="mb-5 text-center pointer-events-auto relative inline-block cursor-none select-none transition-all duration-300 hover:drop-shadow-[0_0_50px_rgba(0,229,255,1)]"
              >
                <div className="relative inline-flex items-center justify-center font-black italic tracking-tighter text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-none drop-shadow-[0_0_35px_rgba(0,229,255,0.8)] px-3 py-1 overflow-visible">
                  
                  {/* NAVI in Pure Bold White */}
                  <span className="text-white hover:text-[#00E5FF] transition-colors duration-300">NAVI</span>

                  {/* SYNC in Cyan-to-Emerald Gradient */}
                  <span className="bg-gradient-to-r from-[#00E5FF] via-[#00E5FF] to-[#2EE6A6] bg-clip-text text-transparent pr-2 hover:brightness-125 transition-all duration-300">
                    SYNC
                  </span>

                  {/* Cyber Streak Lines on Right Side of C */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-1 pointer-events-none opacity-85">
                    <span className="w-5 h-[2px] bg-[#2EE6A6] rounded-full shadow-[0_0_8px_#2EE6A6]" />
                    <span className="w-9 h-[2px] bg-[#00E5FF] rounded-full shadow-[0_0_8px_#00E5FF]" />
                    <span className="w-4 h-[2px] bg-[#2EE6A6] rounded-full shadow-[0_0_8px_#2EE6A6]" />
                  </div>

                </div>

                {/* Subtitle Line with Interactive Highlight */}
                <div className="text-[9px] sm:text-[10px] md:text-[11px] font-mono font-bold tracking-[0.35em] text-slate-200 uppercase mt-0.5 drop-shadow-[0_0_12px_rgba(0,229,255,0.5)] hover:text-[#00E5FF] hover:tracking-[0.4em] transition-all duration-300">
                  INTELLIGENT DEAD RECKONING ENGINE
                </div>
              </motion.div>

              {/* Compact Holographic HUD Target Crosshair Ring */}
              <motion.div
                animate={isZooming ? { scale: 24, opacity: 0 } : { scale: [0.97, 1.03, 0.97] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="flex flex-col items-center justify-center mb-4 pointer-events-none"
              >
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border border-[#00E5FF]/40 flex items-center justify-center shadow-[0_0_25px_rgba(0,229,255,0.4)]">
                  <div className="absolute inset-0 rounded-full border border-dashed border-[#2EE6A6]/60 animate-spin" style={{ animationDuration: '18s' }} />
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF]/60 flex items-center justify-center backdrop-blur-sm">
                    <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00E5FF] animate-pulse" />
                  </div>
                </div>

                <div className="mt-2 bg-[#0c0f19]/70 backdrop-blur-md px-3 py-0.5 rounded-full border border-[#00E5FF]/50 text-[#00E5FF] text-[10px] font-mono font-medium flex items-center gap-2 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399] animate-pulse" />
                  <span>Satellite Signal Acquired</span>
                </div>
              </motion.div>

              {/* Cyan-to-Emerald Glowing Editorial Serif Heading with Hover Glow */}
              <div className="pointer-events-none space-y-2 mt-2">
                <h1 className="font-display italic text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-tight bg-gradient-to-r from-white via-[#00E5FF] to-[#2EE6A6] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,229,255,0.6)] group-hover:drop-shadow-[0_0_45px_rgba(0,229,255,0.9)] transition-all duration-300">
                  Continuous vehicle navigation when GNSS disappears.
                </h1>
                <span className="font-mono text-[10px] sm:text-[11px] text-[#00E5FF] tracking-widest uppercase block animate-pulse">
                  Click anywhere or scroll to descend into street view
                </span>
              </div>

            </div>

            {/* ── EXTENDED NEON GPS NAVIGATION ARROW CURSOR & TRAIL ── */}
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
              {/* Glowing Cyan Breadcrumb Particles Trail */}
              {trail.map((p, idx) => {
                const ratio = idx / trail.length;
                const size = 3 + ratio * 7;
                const opacity = ratio * 0.75;
                return (
                  <div
                    key={p.id}
                    className="absolute rounded-full bg-[#00E5FF] shadow-[0_0_12px_#00E5FF]"
                    style={{
                      left: p.x - size / 2,
                      top: p.y - size / 2,
                      width: `${size}px`,
                      height: `${size}px`,
                      opacity,
                    }}
                  />
                );
              })}

              {/* GPS Navigation Arrow Cursor Head */}
              <div
                className="absolute transition-transform duration-75 ease-out flex items-center justify-center"
                style={{
                  left: mousePos.x - 12,
                  top: mousePos.y - 12,
                  transform: `rotate(${cursorAngle}deg)`,
                }}
              >
                <div className="relative flex items-center justify-center">
                  <Navigation className="w-6 h-6 text-[#00E5FF] fill-[#00E5FF]/50 filter drop-shadow-[0_0_12px_#00E5FF]" />
                  <div className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#fff]" />
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── REVEALED STREETVIEW & 11 STORY SECTIONS ─────────────────────────── */}
      <div className={introFinished ? 'opacity-100 transition-opacity duration-700' : 'opacity-0'}>
        {/* Persistent Navigation Header */}
        <PersistentNavHeader
          currentSection={activeSection}
          onNavigateCockpit={() => setStoreView('predictor')}
        />

        {/* ── SECTION 1: HERO ENTRY (Cyan-to-Emerald Gradient Title) ───── */}
        <section className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4 text-center max-w-4xl mx-auto pt-12">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3b82f6]/15 border border-[#3b82f6]/40 text-[#00E5FF] text-xs font-semibold mb-6">
            <Zap className="w-4 h-4 text-[#00E5FF] animate-pulse" />
            <span>AI-ML Based Intelligent Dead Reckoning · SIH 2026</span>
          </div>

          {/* Glowing Editorial Serif Title matching uploaded image */}
          <h1 className="font-display italic text-4xl md:text-6xl font-normal tracking-tight bg-gradient-to-r from-white via-[#00E5FF] to-[#2EE6A6] bg-clip-text text-transparent mb-4 leading-tight drop-shadow-[0_0_35px_rgba(0,229,255,0.45)]">
            Intelligent Dead Reckoning
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-8 leading-relaxed font-sans">
            Continuous vehicle navigation when GNSS signals disappear.
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center mb-10">
            <button
              onClick={() => setStoreView('predictor')}
              className="py-3.5 px-8 rounded-xl font-semibold text-sm text-black bg-gradient-to-r from-[#2EE6A6] via-[#1FBF9C] to-[#3b82f6] shadow-[0_0_35px_rgba(46,230,166,0.4)] flex items-center justify-center gap-2.5 cursor-pointer hover:scale-105 transition-transform"
            >
              <span>Launch Navigation Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-slate-500 text-xs font-mono flex flex-col items-center gap-2 animate-bounce">
            <span>SCROLL TO ENTER STREETVIEW TUNNEL</span>
            <ArrowDown className="w-4 h-4 text-[#00E5FF]" />
          </div>

        </section>

        {/* ── SECTION 2: SIGNATURE BLACKOUT TRANSITION ───────────────────── */}
        <div className="relative z-10">
          <BlackoutTransition />
        </div>

        {/* ── SECTION 3: CONTINUOUS ENGINE PIPELINE ──────────────────────── */}
        <div className="relative z-10">
          <EnginePipelineSection />
        </div>

        {/* ── SECTION 4: PHONE ALIGNMENT ─────────────────────────────────── */}
        <div className="relative z-10">
          <PhoneAlignmentSection />
        </div>

        {/* ── SECTION 5: AI SIGNAL FILTER ────────────────────────────────── */}
        <div className="relative z-10">
          <SignalFilterSection />
        </div>

        {/* ── SECTION 6: DRIFT COMPARISON ────────────────────────────────── */}
        <div className="relative z-10">
          <DriftComparisonSection />
        </div>

        {/* ── SECTION 7: MAP MATCHING & ROAD CONSTRAINTS ────────────────── */}
        <div className="relative z-10">
          <MapMatchingSection />
        </div>

        {/* ── SECTION 8: JUMP-FREE GNSS RETURN ───────────────────────────── */}
        <div className="relative z-10">
          <GnssReturnSection />
        </div>

        {/* ── SECTION 10: QUANTITATIVE BENCHMARK RESULTS ────────────────── */}
        <div className="relative z-10">
          <ResultsBenchmarkSection />
        </div>

        {/* ── SECTION 11: EDGE ARCHITECTURE ──────────────────────────────── */}
        <div className="relative z-10">
          <EdgeArchitectureSection />
        </div>

        {/* Footer */}
        <footer className="relative z-10 py-16 text-center border-t border-white/5 bg-[#030408]">
          <h3 className="font-display italic text-2xl text-white mb-2 drop-shadow-[0_0_20px_rgba(46,230,166,0.3)]">Experience the Navigation Engine</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            Real 10Hz synchronized IO-VNBD dataset replay & outage injection.
          </p>
          <button
            onClick={() => setStoreView('predictor')}
            className="py-3 px-6 rounded-xl font-semibold text-xs text-black bg-[#2EE6A6] hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            Enter Navigation Engine
          </button>
        </footer>
      </div>

    </div>
  );
};
