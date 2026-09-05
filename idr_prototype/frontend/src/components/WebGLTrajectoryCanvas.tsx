import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Pt { x: number; y: number }

interface WebGLTrajectoryCanvasProps {
  gtPts: Pt[];
  drPts: Pt[];
  aiPts: Pt[];
  showDrAi: boolean;
  isRestored?: boolean;
}

export const WebGLTrajectoryCanvas: React.FC<WebGLTrajectoryCanvasProps> = ({
  gtPts,
  drPts,
  aiPts,
  showDrAi,
  isRestored = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Clean Dark Scene & Renderer Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050713');

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;
    const aspect = width / height;

    // Compute bounding box using all available points or fixed VTB bounds so camera frames the canvas perfectly (Matching media_1788374181381.png)
    const allPts = [...gtPts, ...drPts, ...aiPts];
    let minX = -40, maxX = 40, minY = -20, maxY = 20;
    if (allPts.length > 5) {
      minX = Math.min(...allPts.map(p => p.x));
      maxX = Math.max(...allPts.map(p => p.x));
      minY = Math.min(...allPts.map(p => p.y));
      maxY = Math.max(...allPts.map(p => p.y));
    }

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const dx = Math.max(maxX - minX, 25);
    const dy = Math.max(maxY - minY, 25);

    // Frame the camera frustum so the full route fills 85% of the canvas width/height
    const halfWidth = (dx / 2) * 1.15;
    const halfHeight = (dy / 2) * 1.15;
    const maxHalfDim = Math.max(halfWidth / aspect, halfHeight);

    const camera = new THREE.OrthographicCamera(
      -maxHalfDim * aspect,
       maxHalfDim * aspect,
       maxHalfDim,
      -maxHalfDim,
       0.1,
       1000
    );

    camera.position.set(cx, cy, 100);
    camera.lookAt(cx, cy, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];

    // Dark Grid Texture Background (Matching reference image)
    const gridHelper = new THREE.GridHelper(maxHalfDim * 6, 40, 0x1e293b, 0x0f172a);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.set(cx, cy, -1);
    scene.add(gridHelper);

    // Helper to draw Thick Glowing Solid Trajectory Line (Bloom + Core Line)
    const addGlowingSolidLine = (pts: Pt[], colorHex: string, zOffset: number = 0) => {
      if (pts.length < 2) return;
      const positions = new Float32Array(pts.length * 3);
      pts.forEach((p, idx) => {
        positions[idx * 3]     = p.x;
        positions[idx * 3 + 1] = p.y;
        positions[idx * 3 + 2] = zOffset;
      });

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometries.push(geom);

      // Outer Bloom Line
      const bloomMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: 0.45,
        linewidth: 8,
      });
      materials.push(bloomMat);
      scene.add(new THREE.Line(geom, bloomMat));

      // Core Line
      const coreMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: 0.95,
        linewidth: 4,
      });
      materials.push(coreMat);
      scene.add(new THREE.Line(geom, coreMat));
    };

    // Helper to draw Thick Glowing Dashed Line (For Green Ground Truth)
    const addGlowingDashedLine = (pts: Pt[], colorHex: string, zOffset: number = 0) => {
      if (pts.length < 2) return;
      const positions = new Float32Array(pts.length * 3);
      pts.forEach((p, idx) => {
        positions[idx * 3]     = p.x;
        positions[idx * 3 + 1] = p.y;
        positions[idx * 3 + 2] = zOffset;
      });

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometries.push(geom);

      // Outer Bloom Dashed Line
      const bloomMat = new THREE.LineDashedMaterial({
        color: new THREE.Color(colorHex),
        dashSize: 1.8,
        gapSize: 1.0,
        transparent: true,
        opacity: 0.4,
        linewidth: 8,
      });
      materials.push(bloomMat);
      const bloomLine = new THREE.Line(geom, bloomMat);
      bloomLine.computeLineDistances();
      scene.add(bloomLine);

      // Core Dashed Line
      const coreMat = new THREE.LineDashedMaterial({
        color: new THREE.Color(colorHex),
        dashSize: 1.8,
        gapSize: 1.0,
        transparent: true,
        opacity: 0.95,
        linewidth: 4,
      });
      materials.push(coreMat);
      const coreLine = new THREE.Line(geom, coreMat);
      coreLine.computeLineDistances();
      scene.add(coreLine);
    };

    // 1. DASHED NEON GREEN LINE (Ground Truth Benchmark - Matching media_1788374181381.png)
    if (gtPts.length >= 2) {
      addGlowingDashedLine(gtPts, '#22c55e', 0);
    }

    // 2. OUTAGE TRAJECTORIES (GLOWING RED & GLOWING BLUE)
    if (showDrAi) {
      // Solid Glowing Red Line (Naive IMU Drift - Veers heavily away from Green line)
      if (drPts.length >= 2) {
        addGlowingSolidLine(drPts, '#ef4444', 0.1);
      }

      // Solid Glowing Blue Line (AI Corrected Path)
      if (aiPts.length >= 2) {
        addGlowingSolidLine(aiPts, '#3b82f6', 0.2);
      }
    }

    // 3. GLOWING BLUE VEHICLE LOCATION DOT WITH WHITE CENTER (Matching media_1788374181381.png)
    const currentVehPt = aiPts.length > 0 && showDrAi ? aiPts[aiPts.length - 1] : gtPts.length > 0 ? gtPts[gtPts.length - 1] : { x: 0, y: 0 };
    
    // Outer Blue Glow Circle
    const outerCircleGeom = new THREE.CircleGeometry(1.6, 32);
    const outerCircleMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.95 });
    const outerCircle = new THREE.Mesh(outerCircleGeom, outerCircleMat);
    outerCircle.position.set(currentVehPt.x, currentVehPt.y, 0.5);
    scene.add(outerCircle);

    // Inner White Dot
    const innerDotGeom = new THREE.CircleGeometry(0.7, 24);
    const innerDotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const innerDot = new THREE.Mesh(innerDotGeom, innerDotMat);
    innerDot.position.set(currentVehPt.x, currentVehPt.y, 0.6);
    scene.add(innerDot);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const scale = 1 + Math.sin(elapsed * 4) * 0.12;
      outerCircle.scale.set(scale, scale, 1);
      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const newAspect = w / h;
      camera.left = -maxHalfDim * newAspect;
      camera.right = maxHalfDim * newAspect;
      camera.top = maxHalfDim;
      camera.bottom = -maxHalfDim;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
      outerCircleGeom.dispose(); outerCircleMat.dispose();
      innerDotGeom.dispose(); innerDotMat.dispose();
      renderer.dispose();
    };
  }, [gtPts, drPts, aiPts, showDrAi, isRestored]);

  return <div ref={containerRef} className="w-full h-full min-h-[420px]" />;
};
