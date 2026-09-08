import React, { useRef, useEffect } from 'react';
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

  // Keep refs for callback props so useEffect never tears down on prop changes
  const onEarthClickRef = useRef(onEarthClick);
  const onHoverStateChangeRef = useRef(onHoverStateChange);
  const isZoomingToStreetRef = useRef(isZoomingToStreet);
  const onZoomCompleteRef = useRef(onZoomComplete);

  useEffect(() => {
    onEarthClickRef.current = onEarthClick;
    onHoverStateChangeRef.current = onHoverStateChange;
    isZoomingToStreetRef.current = isZoomingToStreet;
    onZoomCompleteRef.current = onZoomComplete;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera Setup - Dark Prussian Blue background
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
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
    earthGroup.position.set(0, -3.2, 0);
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

      drawBlob(250, 180, 75);  // North America
      drawBlob(320, 340, 60);  // South America
      drawBlob(600, 160, 110); // Europe & Asia
      drawBlob(540, 290, 80);  // Africa
      drawBlob(820, 360, 45);  // Australia
      drawBlob(680, 230, 40);  // India

      // City Lights
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

    const panelGeom = new THREE.BoxGeometry(0.8, 0.02, 0.25);
    const panelMat = new THREE.MeshBasicMaterial({ color: 0x00D9FF });
    const panels = new THREE.Mesh(panelGeom, panelMat);
    satGroup.add(panels);

    earthGroup.add(satGroup);

    // 7. Location Pin & Signal Pulse Rings
    const pinGroup = new THREE.Group();
    const lat = 28.6139 * (Math.PI / 180);
    const lng = 77.2090 * (Math.PI / 180);
    const r = 3.53;
    const px = r * Math.cos(lat) * Math.sin(lng);
    const py = r * Math.sin(lat);
    const pz = r * Math.cos(lat) * Math.cos(lng);
    pinGroup.position.set(px, py, pz);

    const pinGeom = new THREE.SphereGeometry(0.12, 16, 16);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0x00E6B8 });
    const pinMesh = new THREE.Mesh(pinGeom, pinMat);
    pinGroup.add(pinMesh);

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

    // 8. Raycaster for Hover & Click + Drag Rotation
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);

    let isHovered = false;
    let isDragging = false;
    let startX = 0;
    let targetRotationY = 0;
    let currentRotationY = 0;
    let hasDragged = false;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      isDragging = true;
      startX = clientX;
      hasDragged = false;

      const rect = container.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const rect = container.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([earthMesh, pinMesh]);

      const isHit = intersects.length > 0;
      if (isHit !== isHovered) {
        isHovered = isHit;
        if (onHoverStateChangeRef.current) {
          onHoverStateChangeRef.current(isHit);
        }
      }

      if (isDragging) {
        const deltaX = clientX - startX;
        if (Math.abs(deltaX) > 3) hasDragged = true;
        targetRotationY += deltaX * 0.006;
        startX = clientX;
        document.body.style.cursor = 'grabbing';
      } else if (isHit) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'default';
      }
    };

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      isDragging = false;
      document.body.style.cursor = 'default';

      if (!hasDragged && onEarthClickRef.current) {
        const rect = container.getBoundingClientRect();
        const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([earthMesh, pinMesh]);
        if (intersects.length > 0) {
          onEarthClickRef.current();
        }
      }
    };

    const domEl = container;
    domEl.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    domEl.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // 9. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();
    let satAngle = 0;
    let zoomProgress = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Earth rotation
      if (!isDragging) {
        targetRotationY += 0.0015;
      }
      currentRotationY += (targetRotationY - currentRotationY) * 0.12;
      earthMesh.rotation.y = currentRotationY;
      cloudsMesh.rotation.y = currentRotationY * 1.15;

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
        isHovered ? 2.2 : 1.2,
        0.1
      );

      // Camera Zoom Animation into Earth Surface
      if (isZoomingToStreetRef.current) {
        zoomProgress += 0.025;
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, 0.4, 0.08);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, -3.1, 0.08);
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, px * 0.8, 0.08);
        
        if (zoomProgress >= 1.2 && onZoomCompleteRef.current) {
          onZoomCompleteRef.current();
        }
      }

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
      domEl.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      domEl.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
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
  }, []); // Empty dependency array -> Mounts ONCE!

  return <div ref={containerRef} className="w-full h-full min-h-[480px] cursor-grab active:cursor-grabbing" />;
};
