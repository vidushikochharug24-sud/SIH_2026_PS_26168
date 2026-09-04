import React, { useRef, useEffect } from 'react';

interface SensorSparklineProps {
  title: string;
  data: number[];
  color: string;
  unit: string;
}

export const SensorSparkline: React.FC<SensorSparklineProps> = ({
  title,
  data,
  color,
  unit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (data.length < 2) return;

    const maxVal = Math.max(...data, 1.0);
    const minVal = Math.min(...data, 0.0);
    const range = maxVal - minVal || 1;

    const stepX = rect.width / (data.length - 1);

    // Outer Glow Pass
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = i * stepX;
      const y = rect.height - ((data[i] - minVal) / range) * (rect.height - 10) - 5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Crisp Core Pass
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = i * stepX;
      const y = rect.height - ((data[i] - minVal) / range) * (rect.height - 10) - 5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [data, color]);

  const latestVal = data.length > 0 ? data[data.length - 1] : 0;

  return (
    <div className="glass-panel p-3 flex flex-col justify-between h-[135px]">
      <div className="flex justify-between items-center text-xs">
        <span className="text-[10px] uppercase font-semibold text-[#8B87A8] tracking-wider">
          {title}
        </span>
        <span className="font-mono text-xs font-bold" style={{ color }}>
          {latestVal.toFixed(2)} <span className="text-[9px] text-[#8B87A8]">{unit}</span>
        </span>
      </div>

      <div className="w-full h-16 relative rounded overflow-hidden mt-1">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
};
