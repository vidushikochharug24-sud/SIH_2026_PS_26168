import React, { useState, useEffect, useRef } from 'react';
import { Navigation } from 'lucide-react';

export const GpsCursorTrail: React.FC = () => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [cursorAngle, setCursorAngle] = useState(0);
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      setMousePos({ x, y });

      const dx = x - prevMouseRef.current.x;
      const dy = y - prevMouseRef.current.y;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        setCursorAngle(angleDeg);
      }
      prevMouseRef.current = { x, y };

      setTrail((prev) => [
        ...prev.slice(-28),
        { x, y, id: Date.now() + Math.random() },
      ]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (mousePos.x < 0 && mousePos.y < 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
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
  );
};
