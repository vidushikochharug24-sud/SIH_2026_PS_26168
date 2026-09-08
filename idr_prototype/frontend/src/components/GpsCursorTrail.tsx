import React, { useEffect, useRef } from 'react';

export const GpsCursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cursorAngleRef = useRef(0);
  const trailRef = useRef<Array<{ x: number; y: number; alpha: number; radius: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      mousePosRef.current = { x, y, active: true };

      const dx = x - prevMouseRef.current.x;
      const dy = y - prevMouseRef.current.y;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        cursorAngleRef.current = angleDeg;
      }
      prevMouseRef.current = { x, y };

      // Append new breadcrumb point
      trailRef.current.push({ x, y, alpha: 0.75, radius: 6 });
      if (trailRef.current.length > 24) {
        trailRef.current.shift();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Render loop running via requestAnimationFrame
    const animate = () => {
      animId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const trail = trailRef.current;
      const mousePos = mousePosRef.current;

      if (!mousePos.active) return;

      // 1. Draw Breadcrumb Trail Points
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        const ratio = (i + 1) / trail.length;
        const radius = 2 + ratio * 5;
        const opacity = ratio * 0.7;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${opacity})`;
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }

      // 2. Draw GPS Navigation Arrow Head at Current Mouse Position
      ctx.save();
      ctx.translate(mousePos.x, mousePos.y);
      ctx.rotate((cursorAngleRef.current * Math.PI) / 180);

      // Navigation Arrow Path
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(7, 9);
      ctx.lineTo(0, 5);
      ctx.lineTo(-7, 9);
      ctx.closePath();

      ctx.fillStyle = 'rgba(0, 229, 255, 0.75)';
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.stroke();

      // Center White Target Dot
      ctx.beginPath();
      ctx.arc(0, 2, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 6;
      ctx.fill();

      ctx.restore();
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9999]" />;
};
