export interface Point {
  x: number;
  y: number;
}

export function drawGlowPath(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  coreWidth: number = 2.5,
  glowWidth: number = 10,
  glowAlpha: number = 0.25,
  isDotted: boolean = false
) {
  if (points.length < 2) return;

  ctx.save();
  if (isDotted) {
    ctx.setLineDash([5, 5]);
  }

  // 1. Outer Glow Pass
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.strokeStyle = color;
  ctx.globalAlpha = glowAlpha;
  ctx.lineWidth = glowWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  // 2. Mid Glow Pass
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.globalAlpha = glowAlpha * 1.8;
  ctx.lineWidth = glowWidth / 2.5;
  ctx.stroke();

  // 3. Crisp Core Pass
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.globalAlpha = 1.0;
  ctx.lineWidth = coreWidth;
  ctx.stroke();

  ctx.restore();
}

export function drawRadarBlip(
  ctx: CanvasRenderingContext2D,
  pos: Point,
  pulseScale: number = 1.0
) {
  ctx.save();

  // Expanding Radar Ring
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 12 * pulseScale, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(46, 230, 166, 0.2)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(46, 230, 166, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Core Glowing Vehicle Marker
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = '#2EE6A6';
  ctx.shadowBlur = 12;
  ctx.fill();

  ctx.restore();
}
