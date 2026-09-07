import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, ArrowDown, Radio, ShieldCheck, Globe, Cpu, Target, Compass, Sparkles, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';
import { useReplayStore } from '../state/replayStore';
import { HeroNavbar } from './HeroNavbar';
import { InteractiveEarthCanvas } from './InteractiveEarthCanvas';
import { CyberHighwayCanvas } from './CyberHighwayCanvas';
import { Pipeline3DBackground } from './Pipeline3DBackground';
import { BlackoutTransition } from './BlackoutTransition';
import { EnginePipelineSection } from './EnginePipelineSection';
import { PhoneAlignmentSection } from './PhoneAlignmentSection';
import { SignalFilterSection } from './SignalFilterSection';
import { DriftComparisonSection } from './DriftComparisonSection';
import { MapMatchingSection } from './MapMatchingSection';
import { GnssReturnSection } from './GnssReturnSection';
import { ResultsBenchmarkSection } from './ResultsBenchmarkSection';
import { EdgeArchitectureSection } from './EdgeArchitectureSection';

export type LandingState = 
  | 'INTRO_VIDEO'       // 1. Pure video playback (no text/UI overlay)
  | 'SIGNAL_ACHIEVED'   // 2. Video completed -> "Satellite Signal Acquired" prompt
  | 'EARTH_ACTIVE'      // 3. Clicked prompt -> 3D Half-Earth active & rotatable left/right
  | 'STREET_TRANSITION' // 4 -> 5 Transition to Street View
  | 'STREET_VIEW';      // 5. Descended into 3D Street View experience

export const LandingPage: React.FC = () => {
  const setStoreView = useReplayStore((s) => s.setStoreView);
  
  // Cinematic State Machine
  const [landingState, setLandingState] = useState<LandingState>('INTRO_VIDEO');
  const [heroTextVisible, setHeroTextVisible] = useState(false);
  const [earthHovered, setEarthHovered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const finalVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoEndedRef = useRef(false);

  // Feature Cards Carousel State
  const [carouselIdx, setCarouselIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIdx((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // 1. MP4 Hero Video Auto-Play, Unmuted Sound & Smooth Handoff
  useEffect(() => {
    const video = finalVideoRef.current;
    if (!video) return;

    if (landingState === 'INTRO_VIDEO') {
      videoEndedRef.current = false;
      video.currentTime = 0;
      video.muted = false;
      video.volume = 1.0;

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Autoplay with audio blocked by browser policy, falling back to muted with click-to-unmute listener:', err);
          video.muted = true;
          video.play().catch(() => {});

          const unmute = () => {
            if (finalVideoRef.current) {
              finalVideoRef.current.muted = false;
              finalVideoRef.current.volume = 1.0;
            }
            window.removeEventListener('click', unmute);
            window.removeEventListener('touchstart', unmute);
          };
          window.addEventListener('click', unmute);
          window.addEventListener('touchstart', unmute);
        });
      }
    }

    const handleTimeUpdate = () => {
      if (videoEndedRef.current) return;
      // Smoothly transition to Satellite Signal Acquired state when video reaches end frame
      if (video.duration && video.currentTime >= video.duration - 0.25) {
        videoEndedRef.current = true;
        if (!video.paused) video.pause();
        setLandingState('SIGNAL_ACHIEVED');
      }
    };

    const handleEnded = () => {
      if (videoEndedRef.current) return;
      videoEndedRef.current = true;
      if (!video.paused) video.pause();
      setLandingState('SIGNAL_ACHIEVED');
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [landingState]);

  // 2. Click Prompt Handler -> Reveal 3D Earth, then fade in Hero Text
  const handleSignalClick = () => {
    if (landingState !== 'SIGNAL_ACHIEVED') return;
    setLandingState('EARTH_ACTIVE');
    setTimeout(() => {
      setHeroTextVisible(true);
    }, 400);
  };

  // 3. Scroll Progress & Street View Section Activation
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const progress = totalHeight > 0 ? currentScroll / totalHeight : 0;
      setScrollProgress(progress);

      if (currentScroll < 350) {
        setActiveSection('hero');
        // Restore 3D Earth scene and hero text whenever returning to top
        if (landingState === 'STREET_VIEW' || landingState === 'STREET_TRANSITION') {
          setLandingState('EARTH_ACTIVE');
          setHeroTextVisible(true);
        }
      } else {
        if (currentScroll > 350 && landingState === 'EARTH_ACTIVE') {
          setLandingState('STREET_VIEW');
        }
        if (currentScroll < 1200) setActiveSection('blackout');
        else if (currentScroll < 2000) setActiveSection('pipeline');
        else if (currentScroll < 2800) setActiveSection('dr');
        else if (currentScroll < 3600) setActiveSection('restore');
        else setActiveSection('cockpit');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [landingState]);

  // Trigger Camera Zoom from 3D Earth into Street View
  const handleLaunchTransition = () => {
    if (landingState === 'STREET_TRANSITION' || landingState === 'STREET_VIEW') return;
    setLandingState('STREET_TRANSITION');
  };

  const handleZoomComplete = () => {
    setLandingState('STREET_VIEW');
    const el = document.getElementById('hero-streetview');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setLandingState('EARTH_ACTIVE');
      setHeroTextVisible(true);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#020B18] text-[#FFFFFF] overflow-x-hidden font-sans select-none">
      
      {/* ── TOP NAV BAR (Fades in after clicking Initialize 3D Globe) ── */}
      <AnimatePresence>
        {(landingState === 'EARTH_ACTIVE' || landingState === 'STREET_TRANSITION' || landingState === 'STREET_VIEW') && (
          <HeroNavbar
            onNavigateCockpit={() => setStoreView('predictor')}
            onScrollToSection={scrollToSection}
          />
        )}
      </AnimatePresence>

      {/* ── TOP LEFT FLOATING BRAND LOGO OVER VIDEO ── */}
      <AnimatePresence>
        {(landingState === 'INTRO_VIDEO' || landingState === 'SIGNAL_ACHIEVED') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-5 left-6 md:left-10 z-40 flex items-center gap-4 select-none pointer-events-auto cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img
              src="/navisync_logo.png"
              alt="NaviSync Logo"
              className="h-10 sm:h-12 md:h-13 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,217,255,0.8)]"
            />
            <span className="text-xs sm:text-sm font-mono tracking-[0.2em] text-[#B7C7D9] uppercase font-bold border-l-2 border-[#00D9FF]/40 pl-4 py-1">
              ISRO SIH 2026 · PS 26168
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. HERO SECTION CONTAINER (PHONE → ROUTE → LIVE 3D EARTH) ── */}
      <section id="hero" className="relative w-full h-screen min-h-[720px] flex flex-col justify-between pt-20 overflow-hidden bg-[#020B18]">
        
        {/* Background MP4 Intro Video Layer (Phone → Route → Earth) */}
        <div className={`absolute inset-0 transition-opacity duration-700 pointer-events-none z-0 ${
          landingState === 'INTRO_VIDEO' || landingState === 'SIGNAL_ACHIEVED' ? 'opacity-100' : 'opacity-0'
        }`}>
          <video
            ref={finalVideoRef}
            playsInline
            preload="auto"
            style={{ transform: 'translateZ(0)', willChange: 'transform' }}
            className="w-full h-full object-cover object-center"
          >
            <source src="/final.mp4" type="video/mp4" />
          </video>
          {/* Dark Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020B18]/70 via-transparent to-[#020B18]/90 pointer-events-none" />
        </div>

        {/* Live Three.js Interactive 3D Earth Canvas Layer (Half-Earth at bottom, drag rotatable) */}
        <div className={`absolute inset-0 transition-opacity duration-700 z-0 ${
          landingState === 'EARTH_ACTIVE' || landingState === 'STREET_TRANSITION' || landingState === 'STREET_VIEW'
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}>
          <InteractiveEarthCanvas
            onEarthClick={handleLaunchTransition}
            onHoverStateChange={setEarthHovered}
            isZoomingToStreet={landingState === 'STREET_TRANSITION'}
            onZoomComplete={handleZoomComplete}
          />
        </div>

        {/* ── 2. STEP 2 OVERLAY: HUD SATELLITE SIGNAL ACQUIRED BUTTON (ALIGN EXACTLY OVER VIDEO HUD CARD) ── */}
        <AnimatePresence>
          {landingState === 'SIGNAL_ACHIEVED' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-[5%] md:right-[10%] top-[28%] md:top-[33%] z-30 flex flex-col items-end"
            >
              {/* Cyber HUD Card aligned exactly on top of video HUD card */}
              <div className="relative bg-[#020B18]/95 backdrop-blur-2xl border border-[#00D9FF]/70 rounded-xl p-6 shadow-[0_0_60px_rgba(0,217,255,0.5)] w-[360px] sm:w-[475px]">
                
                {/* Cyber Corner Brackets */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#00D9FF]" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#00D9FF]" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#00D9FF]" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#00D9FF]" />

                {/* Header */}
                <div className="border-b border-[#00D9FF]/25 pb-3 mb-4 flex items-center justify-between">
                  <h3 className="text-[#00D9FF] font-mono font-bold tracking-widest text-sm sm:text-base uppercase flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00E6B8] animate-ping" />
                    SATELLITE SIGNAL ACQUIRED
                  </h3>
                </div>

                {/* Content Body: Ring Gauge + Sat Stats */}
                <div className="flex items-center gap-6 my-3">
                  {/* Radial Ring Gauge */}
                  <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-[#00D9FF]" strokeDasharray="85, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-white font-mono font-bold text-sm leading-none">12</span>
                      <span className="text-[#00D9FF] text-[9px] font-mono leading-none mt-0.5">37%</span>
                    </div>
                  </div>

                  {/* Satellite Stats */}
                  <div className="space-y-1.5 text-xs sm:text-sm font-sans">
                    <div className="text-white font-medium">12 Satellites in range</div>
                    <div className="text-slate-300">22 Satellites in view</div>
                    <div className="text-slate-300">
                      Signal strength: <span className="text-[#00E6B8] font-bold">Excellent</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Pulsing Satellite Signal Button */}
                <button
                  onClick={handleSignalClick}
                  className="w-full mt-5 py-3.5 px-6 rounded-lg font-bold text-xs sm:text-sm text-black bg-gradient-to-r from-[#00D9FF] via-[#00E6B8] to-[#00D9FF] shadow-[0_0_40px_rgba(0,217,255,0.8)] flex items-center justify-center gap-2.5 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer group"
                >
                  <Globe className="w-4.5 h-4.5 text-black group-hover:rotate-45 transition-transform" />
                  <span className="tracking-wider uppercase font-mono font-bold">ENTER NAVISYNC →</span>
                </button>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 3. HERO HTML OVERLAY (APPEARS AFTER 3D EARTH INITIALIZATION) ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-8 sm:pt-12 flex flex-col items-start w-full">
          
          <AnimatePresence>
            {heroTextVisible && (landingState === 'EARTH_ACTIVE' || landingState === 'STREET_TRANSITION') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="flex flex-col items-start"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#031426]/85 backdrop-blur-md border border-[#00D9FF]/35 shadow-[0_0_20px_rgba(0,217,255,0.25)] text-[#00D9FF] text-xs font-semibold mb-6">
                  <Zap className="w-4 h-4 text-[#00D9FF] animate-pulse" />
                  <span>AI-ML Based Intelligent Dead Reckoning · SIH 2026</span>
                </div>

                {/* Main Heading */}
                <h1 className="font-display italic text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.1] max-w-4xl drop-shadow-[0_0_40px_rgba(0,217,255,0.3)] mb-4">
                  <span className="text-white block">NaviSync: An Intelligent</span>
                  <span className="bg-gradient-to-r from-white via-[#00D9FF] to-[#00E6B8] bg-clip-text text-transparent">
                    Dead Reckoning Engine
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg md:text-xl text-[#B7C7D9] max-w-xl mb-8 font-sans leading-relaxed">
                  Continuous vehicle navigation when GNSS signals disappear. Drag globe left/right to explore.
                </p>

                {/* Scroll Indicator Prompt (Navigation Button Removed) */}
                <div className="flex items-center gap-3 pt-2">
                  <div
                    onClick={handleLaunchTransition}
                    className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-[#031426]/75 backdrop-blur-md border border-[#00D9FF]/30 text-slate-300 text-xs font-mono tracking-widest uppercase cursor-pointer hover:text-[#00D9FF] hover:border-[#00D9FF]/70 hover:shadow-[0_0_20px_rgba(0,217,255,0.3)] transition-all group"
                  >
                    <span>SCROLL DOWN TO ENTER STREETVIEW TUNNEL</span>
                    <ArrowDown className="w-4 h-4 text-[#00D9FF] animate-bounce" />
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* ── SATELLITE SIGNAL STATUS CARD (ACTIVE WITH 3D EARTH) ── */}
        <AnimatePresence>
          {(landingState === 'EARTH_ACTIVE') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-6 sm:right-12 bottom-24 z-20 bg-[#031426]/85 backdrop-blur-xl border border-[#00D9FF]/40 rounded-2xl p-4 sm:p-5 shadow-[0_0_40px_rgba(0,217,255,0.3)] max-w-xs text-xs font-sans space-y-2 pointer-events-none"
            >
              <div className="flex items-center gap-2 text-[#00E6B8] font-mono font-bold tracking-wider text-[11px] uppercase">
                <span className="w-2 h-2 rounded-full bg-[#00E6B8] shadow-[0_0_8px_#00E6B8] animate-pulse" />
                <span>SATELLITE SIGNAL ACQUIRED</span>
              </div>
              <div className="flex justify-between items-center text-[#B7C7D9] pt-1">
                <span>Satellites in range:</span>
                <span className="text-white font-mono font-bold">12 Active</span>
              </div>
              <div className="flex justify-between items-center text-[#B7C7D9]">
                <span>Signal strength:</span>
                <span className="text-[#00D9FF] font-semibold">Excellent (99.8%)</span>
              </div>
              <div className="flex justify-between items-center text-[#B7C7D9]">
                <span>Position:</span>
                <span className="text-white font-mono text-[10px]">28.6139° N, 77.2090° E</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Earth Hover Drag Prompt */}
        <AnimatePresence>
          {earthHovered && landingState === 'EARTH_ACTIVE' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-12 z-20 bg-[#00D9FF] text-black font-bold text-xs px-4 py-2 rounded-full shadow-[0_0_30px_#00D9FF] flex items-center gap-2 pointer-events-none"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Drag left or right to rotate globe</span>
            </motion.div>
          )}
        </AnimatePresence>

      </section>

      {/* ── 3. FEATURE CARDS CAROUSEL ── */}
      <section id="features" className="relative z-10 py-16 bg-[#031426] border-y border-white/10 px-6 md:px-12 overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          <div className="text-center mb-8">
            <span className="text-[#00D9FF] font-mono text-xs font-bold tracking-widest uppercase mb-1 block">CORE CAPABILITIES</span>
            <h2 className="font-display italic text-3xl md:text-4xl text-white font-normal">Engine Features</h2>
          </div>

          {/* Carousel Interactive Card Frame */}
          <div className="relative w-full max-w-xl flex items-center justify-center">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={carouselIdx}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: 0.95 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`w-full bg-[#041B2D]/90 border rounded-3xl p-6 md:p-7 ${
                  carouselIdx === 0
                    ? 'border-[#00D9FF]/60 shadow-[0_0_40px_rgba(0,217,255,0.3)]'
                    : carouselIdx === 1
                    ? 'border-[#00E6B8]/60 shadow-[0_0_40px_rgba(0,230,184,0.3)]'
                    : carouselIdx === 2
                    ? 'border-[#168CFF]/60 shadow-[0_0_40px_rgba(22,140,255,0.3)]'
                    : 'border-[#7657FF]/60 shadow-[0_0_40px_rgba(118,87,255,0.3)]'
                } backdrop-blur-xl flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left`}
              >
                {carouselIdx === 0 && (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-[#00D9FF]/15 border border-[#00D9FF]/40 text-[#00D9FF] flex items-center justify-center shrink-0">
                      <Radio className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#00D9FF] uppercase mb-1">FEATURE 01 / 04</span>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Satellite Powered</h3>
                      <p className="text-sm md:text-base text-[#B7C7D9] leading-relaxed font-sans">
                        Real-time positioning with multi-satellite constellation support.
                      </p>
                    </div>
                  </>
                )}

                {carouselIdx === 1 && (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-[#00E6B8]/15 border border-[#00E6B8]/40 text-[#00E6B8] flex items-center justify-center shrink-0">
                      <Cpu className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#00E6B8] uppercase mb-1">FEATURE 02 / 04</span>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">AI Enhanced</h3>
                      <p className="text-sm md:text-base text-[#B7C7D9] leading-relaxed font-sans">
                        Smarter routes, neural velocity predictions, zero hassle.
                      </p>
                    </div>
                  </>
                )}

                {carouselIdx === 2 && (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-[#168CFF]/15 border border-[#168CFF]/40 text-[#168CFF] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#168CFF] uppercase mb-1">FEATURE 03 / 04</span>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">High Accuracy</h3>
                      <p className="text-sm md:text-base text-[#B7C7D9] leading-relaxed font-sans">
                        Centimeter-level dead reckoning precision for smoother journeys.
                      </p>
                    </div>
                  </>
                )}

                {carouselIdx === 3 && (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-[#7657FF]/15 border border-[#7657FF]/40 text-[#7657FF] flex items-center justify-center shrink-0">
                      <Globe className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#7657FF] uppercase mb-1">FEATURE 04 / 04</span>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Global Coverage</h3>
                      <p className="text-sm md:text-base text-[#B7C7D9] leading-relaxed font-sans">
                        Navigate anywhere on Earth, even deep inside tunnels & urban canyons.
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Previous Arrow Button */}
            <button
              onClick={() => setCarouselIdx((prev) => (prev === 0 ? 3 : prev - 1))}
              className="absolute -left-4 sm:-left-14 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#020B18]/90 border border-white/20 text-white flex items-center justify-center shadow-xl hover:border-[#00D9FF] hover:text-[#00D9FF] hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
              aria-label="Previous Feature"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Arrow Button */}
            <button
              onClick={() => setCarouselIdx((prev) => (prev === 3 ? 0 : prev + 1))}
              className="absolute -right-4 sm:-right-14 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#020B18]/90 border border-white/20 text-white flex items-center justify-center shadow-xl hover:border-[#00D9FF] hover:text-[#00D9FF] hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
              aria-label="Next Feature"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Indicator Navigation Dots */}
          <div className="flex items-center gap-3 mt-8">
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                onClick={() => setCarouselIdx(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === carouselIdx ? 'w-8 bg-[#00D9FF] shadow-[0_0_12px_#00D9FF]' : 'w-2.5 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to feature ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ── 4. STREET VIEW ENVIRONMENT (Matching media_1788800836866.png) ── */}
      <div id="hero-streetview" className="relative z-10 min-h-screen bg-[#020B18]">
        
        {/* Background 3D Street View Tunnel Canvas */}
        <div className="relative w-full h-[650px] overflow-hidden border-b border-white/10">
          <CyberHighwayCanvas scrollProgress={scrollProgress} />

          {/* Overlay CTA inside 3D Tunnel */}
          <div className="absolute inset-0 flex flex-col justify-center items-center px-4 text-center z-10 pointer-events-none">
            <div className="bg-[#020B18]/85 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 max-w-2xl text-center shadow-[0_0_80px_rgba(0,217,255,0.3)]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D9FF]/15 border border-[#00D9FF]/40 text-[#00D9FF] text-xs font-mono mb-4">
                <Compass className="w-3.5 h-3.5 animate-spin" />
                <span>3D STREET VIEW ENVIRONMENT ACTIVE</span>
              </div>
              <h2 className="font-display italic text-3xl md:text-5xl font-normal text-white mb-3 leading-tight">
                Dive into Street View
              </h2>
              <p className="text-sm text-[#B7C7D9] max-w-lg mx-auto mb-6">
                Real-time 10Hz phone IMU acceleration, gyro orientation & AI dead reckoning fusion.
              </p>
              <button
                onClick={() => setStoreView('predictor')}
                className="py-3 px-8 rounded-full font-bold text-xs text-black bg-[#00E6B8] hover:bg-[#00D9FF] shadow-[0_0_30px_#00E6B8] transition-all cursor-pointer pointer-events-auto"
              >
                Enter Navigation Cockpit Engine →
              </button>
            </div>
          </div>
        </div>

        {/* ── CONTINUOUS 3D BACKGROUND & NEON GRID SPANNING ALL SECTIONS TILL BOTTOM ── */}
        <div className="relative w-full overflow-hidden bg-[#020B18]">
          
          {/* Continuous Three.js 3D Particle Constellation Background Canvas */}
          <Pipeline3DBackground />

          {/* Ambient Radial Spotlights & Cyber Blueprint Grid */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(#00D9FF 1px, transparent 1px), linear-gradient(to right, rgba(0, 217, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 217, 255, 0.04) 1px, transparent 1px)`,
                backgroundSize: `24px 24px, 48px 48px, 48px 48px`
              }}
            />
            {/* Soft Ambient Neon Glow Orbs down the page */}
            <div className="absolute top-[10%] left-1/4 w-[600px] h-[600px] bg-[#00D9FF]/10 blur-[150px] rounded-full" />
            <div className="absolute top-[35%] right-10 w-[550px] h-[550px] bg-[#00E6B8]/10 blur-[150px] rounded-full" />
            <div className="absolute top-[60%] left-10 w-[600px] h-[600px] bg-[#168CFF]/10 blur-[150px] rounded-full" />
            <div className="absolute top-[85%] right-1/4 w-[500px] h-[500px] bg-[#7657FF]/10 blur-[150px] rounded-full" />
          </div>

          {/* STORY SECTIONS */}
          <div id="pipeline" className="relative z-10">
            <EnginePipelineSection />
          </div>

          <div className="relative z-10">
            <PhoneAlignmentSection />
          </div>

          <div className="relative z-10">
            <SignalFilterSection />
          </div>

          <div id="dr" className="relative z-10">
            <DriftComparisonSection />
          </div>

          <div id="map-matching" className="relative z-10">
            <MapMatchingSection />
          </div>

          <div className="relative z-10">
            <GnssReturnSection />
          </div>

          <div id="benchmarks" className="relative z-10">
            <ResultsBenchmarkSection />
          </div>

          <div id="about" className="relative z-10">
            <EdgeArchitectureSection />
          </div>

          {/* Footer */}
          <footer className="relative z-10 py-16 text-center border-t border-white/10 bg-[#020B18]/90 backdrop-blur-md">
            <h3 className="font-display italic text-2xl text-white mb-2 drop-shadow-[0_0_20px_rgba(0,217,255,0.3)]">Experience NaviSync Engine</h3>
            <p className="text-xs text-[#B7C7D9] max-w-md mx-auto mb-6">
              ISRO Smart India Hackathon 2026 — Problem Statement 26168.
            </p>
            <button
              onClick={() => setStoreView('predictor')}
              className="py-3 px-6 rounded-full font-bold text-xs text-black bg-gradient-to-r from-[#00D9FF] to-[#00E6B8] hover:scale-105 transition-transform cursor-pointer"
            >
              Enter Navigation Engine
            </button>
          </footer>

        </div>

      </div>

    </div>
  );
};
