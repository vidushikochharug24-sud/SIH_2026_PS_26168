import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface InteractiveEarthCanvasProps {
  onEarthClick?: () => void;
  onHoverStateChange?: (isHovered: boolean) => void;
  isZoomingToStreet?: boolean;
  onZoomComplete?: () => void;
}

export const InteractiveEarthCanvas: React.FC<InteractiveEarthCanvasProps> = ({
  onEarthClick,
  onHoverStateChange,
  isZoomingToStreet = false,
  onZoomComplete,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera Setup - Dark Prussian Blue background
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background over dark container

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // Position camera to view half-Earth in bottom 40-50% of viewport
    camera.position.set(0, -1.8, 8.5);
    camera.lookAt(0, -2.5, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x041B2D, 2.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x00D9FF, 3.0);
    sunLight.position.set(12, 10, 15);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x168CFF, 2.0);
    rimLight.position.set(-12, 5, -10);
    scene.add(rimLight);

    // 3. Earth Group Setup
    const earthGroup = new THREE.Group();
    earthGroup.position.set(0, -3.2, 0); // Positioned in lower portion of screen
    scene.add(earthGroup);

    // Create Canvas Texture for Landmasses & Night City Lights
    const createEarthCanvasTexture = () => {
      const cvs = document.createElement('canvas');
      cvs.width = 1024;
      cvs.height = 512;
      const ctx = cvs.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(cvs);

      // Ocean Background
      ctx.fillStyle = '#031426';
      ctx.fillRect(0, 0, cvs.width, cvs.height);

      // Stylized Procedural Cyan/Teal Continents
      ctx.fillStyle = '#00D9FF';
      ctx.shadowColor = '#00E6B8';
      ctx.shadowBlur = 12;

      // Draw stylized continent blobs
      const drawBlob = (cx: number, cy: number, r: number) => {
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.2) {
          const rad = r + Math.sin(a * 5) * (r * 0.25) + Math.cos(a * 3) * (r * 0.2);
          const x = cx + Math.cos(a) * rad;
          const y = cy + Math.sin(a) * rad;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      };

      // North America
      drawBlob(250, 180, 75);
      // South America
      drawBlob(320, 340, 60);
      // Europe & Asia
      drawBlob(600, 160, 110);
      // Africa
      drawBlob(540, 290, 80);
      // Australia
      drawBlob(820, 360, 45);
      // India / South Asia Highlight
      drawBlob(680, 230, 40);

      // City Lights (Glowing Dots)
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * cvs.width;
        const y = Math.random() * cvs.height;
        ctx.fillRect(x, y, 1.5, 1.5);
      }

      return new THREE.CanvasTexture(cvs);
    };

    const earthTexture = createEarthCanvasTexture();
    const earthGeom = new THREE.SphereGeometry(3.5, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpScale: 0.05,
      shininess: 45,
      specular: new THREE.Color(0x00D9FF),
      emissive: new THREE.Color(0x020B18),
    });
    const earthMesh = new THREE.Mesh(earthGeom, earthMat);
    earthGroup.add(earthMesh);

    // 4. Atmospheric Glow Outer Shell
    const atmosphereShader = {
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform float intensity;
        void main() {
          float atmos = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
          gl_FragColor = vec4(0.0, 0.85, 1.0, 1.0) * atmos * intensity;
        }
      `
    };

    const atmosUniforms = { intensity: { value: 1.2 } };
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: atmosphereShader.vertexShader,
      fragmentShader: atmosphereShader.fragmentShader,
      uniforms: atmosUniforms,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });

    const atmosGeom = new THREE.SphereGeometry(3.9, 64, 64);
    const atmosMesh = new THREE.Mesh(atmosGeom, atmosMat);
    earthGroup.add(atmosMesh);

    // 5. Cloud Layer
    const cloudsGeom = new THREE.SphereGeometry(3.56, 48, 48);
    const cloudsMat = new THREE.MeshPhongMaterial({
      color: 0x00D9FF,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeom, cloudsMat);
    earthGroup.add(cloudsMesh);

    // 6. Orbital Rings & Orbiting Satellite
    const orbitRadius = 5.2;
    const orbitGeom = new THREE.RingGeometry(orbitRadius - 0.02, orbitRadius + 0.02, 128);
    const orbitMat = new THREE.MeshBasicMaterial({
      color: 0x00D9FF,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const orbitRing = new THREE.Mesh(orbitGeom, orbitMat);
    orbitRing.rotation.x = Math.PI / 3;
    orbitRing.rotation.y = Math.PI / 6;
    earthGroup.add(orbitRing);

    // Satellite Mesh
    const satGroup = new THREE.Group();
    const bodyGeom = new THREE.BoxGeometry(0.2, 0.2, 0.3);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, metalness: 0.9, roughness: 0.1 });
    const satBody = new THREE.Mesh(bodyGeom, bodyMat);
    satGroup.add(satBody);

    // Solar Panels
    const panelGeom = new THREE.BoxGeometry(0.8, 0.02, 0.25);
    const panelMat = new THREE.MeshBasicMaterial({ color: 0x00D9FF });
    const panels = new THREE.Mesh(panelGeom, panelMat);
    satGroup.add(panels);

    earthGroup.add(satGroup);

    // 7. Location Pin & Signal Pulse Rings
    const pinGroup = new THREE.Group();
    // Position pin near India lat/lng on Earth surface
    const lat = 28.6139 * (Math.PI / 180);
    const lng = 77.2090 * (Math.PI / 180);
    const r = 3.53;
    const px = r * Math.cos(lat) * Math.sin(lng);
    const py = r * Math.sin(lat);
    const pz = r * Math.cos(lat) * Math.cos(lng);
    pinGroup.position.set(px, py, pz);

    // Glowing Pin Circle
    const pinGeom = new THREE.SphereGeometry(0.12, 16, 16);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0x00E6B8 });
    const pinMesh = new THREE.Mesh(pinGeom, pinMat);
    pinGroup.add(pinMesh);

    // Expanding Cyan Signal Waves
    const signalRings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const ringG = new THREE.RingGeometry(0.08, 0.12, 32);
      const ringM = new THREE.MeshBasicMaterial({
        color: 0x00D9FF,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ringMesh = new THREE.Mesh(ringG, ringM);
      ringMesh.lookAt(px * 2, py * 2, pz * 2);
      pinGroup.add(ringMesh);
      signalRings.push(ringMesh);
    }
    earthGroup.add(pinGroup);

    // 8. Raycaster for Hover & Click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([earthMesh, pinMesh]);

      const isHit = intersects.length > 0;
      setHovered(isHit);
      if (onHoverStateChange) onHoverStateChange(isHit);

      if (isHit) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'default';
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([earthMesh, pinMesh]);
      if (intersects.length > 0 && onEarthClick) {
        onEarthClick();
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handlePointerDown);

    // 9. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();
    let satAngle = 0;
    let zoomProgress = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Earth rotation
      earthMesh.rotation.y = elapsed * 0.08;
      cloudsMesh.rotation.y = elapsed * 0.11;

      // Orbiting Satellite
      satAngle = elapsed * 0.6;
      satGroup.position.x = Math.cos(satAngle) * orbitRadius;
      satGroup.position.z = Math.sin(satAngle) * orbitRadius;
      satGroup.position.y = Math.sin(satAngle * 0.5) * 1.5;
      satGroup.rotation.y = -satAngle;

      // Signal wave pulses
      signalRings.forEach((ring, idx) => {
        const pulse = (elapsed * 1.8 + idx * 0.6) % 2.0;
        ring.scale.set(1 + pulse * 2.5, 1 + pulse * 2.5, 1);
        (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1.0 - pulse / 2.0);
      });

      // Hover response
      atmosUniforms.intensity.value = THREE.MathUtils.lerp(
        atmosUniforms.intensity.value,
        hovered ? 2.2 : 1.2,
        0.1
      );

      // Camera Zoom Animation into Earth Surface on Click / Transition
      if (isZoomingToStreet) {
        zoomProgress += 0.025;
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, 0.4, 0.08);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, -3.1, 0.08);
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, px * 0.8, 0.08);
        
        if (zoomProgress >= 1.2 && onZoomComplete) {
          onZoomComplete();
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
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
      window.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handlePointerDown);
      window.removeEventListener('resize', handleResize);
      document.body.style.cursor = 'default';
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      earthGeom.dispose(); earthMat.dispose();
      atmosGeom.dispose(); atmosMat.dispose();
      cloudsGeom.dispose(); cloudsMat.dispose();
      orbitGeom.dispose(); orbitMat.dispose();
      bodyGeom.dispose(); bodyMat.dispose();
      panelGeom.dispose(); panelMat.dispose();
      pinGeom.dispose(); pinMat.dispose();
      renderer.dispose();
    };
  }, [hovered, isZoomingToStreet, onEarthClick, onHoverStateChange, onZoomComplete]);

  return <div ref={containerRef} className="w-full h-full min-h-[480px]" />;
};
