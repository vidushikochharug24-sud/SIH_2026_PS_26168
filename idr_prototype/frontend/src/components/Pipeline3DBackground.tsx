import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export const Pipeline3DBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 800;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. 3D Particle Cloud / Spatial Constellation Grid (Spans full page scroll depth)
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorCyan = new THREE.Color(0x00D9FF);
    const colorTeal = new THREE.Color(0x00E6B8);
    const colorBlue = new THREE.Color(0x168CFF);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 180; // Vertically spans all sections to bottom
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25 - 5;

      const mixColor = i % 3 === 0 ? colorCyan : i % 3 === 1 ? colorTeal : colorBlue;
      colors[i * 3] = mixColor.r;
      colors[i * 3 + 1] = mixColor.g;
      colors[i * 3 + 2] = mixColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 2. 3D Wireframe Grid Plane
    const gridHelper = new THREE.GridHelper(45, 32, 0x00D9FF, 0x041E36);
    gridHelper.position.y = -18;
    gridHelper.position.z = -5;
    gridHelper.rotation.x = Math.PI / 6;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.25;
    scene.add(gridHelper);

    // 3. Floating 3D Wireframe Torus Rings
    const ringGroup = new THREE.Group();

    const ringGeom = new THREE.TorusGeometry(3.8, 0.03, 16, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00D9FF,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });

    const ring1 = new THREE.Mesh(ringGeom, ringMat);
    ring1.position.set(-9, 6, -8);
    ring1.rotation.x = Math.PI / 3;
    ringGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeom, ringMat);
    ring2.position.set(9, -8, -6);
    ring2.rotation.y = Math.PI / 4;
    ringGroup.add(ring2);

    scene.add(ringGroup);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Rotate particle cloud gently
      particles.rotation.y = elapsed * 0.04;
      particles.rotation.x = Math.sin(elapsed * 0.03) * 0.05;

      // Animate grid helper
      gridHelper.position.z = -5 + Math.sin(elapsed * 0.2) * 1.5;

      // Rotate 3D floating rings
      ring1.rotation.z = elapsed * 0.15;
      ring2.rotation.x = elapsed * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
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
      geometry.dispose();
      material.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0 overflow-hidden" />;
};
