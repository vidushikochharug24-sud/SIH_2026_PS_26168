import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface CyberHighwayCanvasProps {
  scrollProgress?: number;
  isBlackout?: boolean;
}

export const CyberHighwayCanvas: React.FC<CyberHighwayCanvasProps> = ({
  scrollProgress = 0,
  isBlackout = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Optimized Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.016);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 3.2, 14);
    camera.lookAt(0, 0, -30);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambLight = new THREE.AmbientLight(0x94a3b8, 1.2);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    // 2. Asphalt Road, Double Yellow Center Line & Sidewalks (Matching Reference Image)
    const roadWidth = 12;
    const roadLength = 160;
    const roadGeom = new THREE.PlaneGeometry(roadWidth, roadLength);
    const roadMat = new THREE.MeshPhongMaterial({ color: 0x1e293b, shininess: 30 });
    const roadMesh = new THREE.Mesh(roadGeom, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, -1, -40);
    scene.add(roadMesh);

    // Double Yellow Center Divider Line (Matching Ref Image media_1788370346730.png)
    const doubleYellowGroup = new THREE.Group();
    const yellowGeom = new THREE.PlaneGeometry(0.18, roadLength);
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const yellowL = new THREE.Mesh(yellowGeom, yellowMat); yellowL.rotation.x = -Math.PI / 2; yellowL.position.set(-0.15, -0.96, -40); doubleYellowGroup.add(yellowL);
    const yellowR = new THREE.Mesh(yellowGeom, yellowMat); yellowR.rotation.x = -Math.PI / 2; yellowR.position.set(0.15, -0.96, -40); doubleYellowGroup.add(yellowR);
    scene.add(doubleYellowGroup);

    // Dashed White Lane Dividers
    const dashCount = 26;
    const dashesGroup = new THREE.Group();
    const dashGeom = new THREE.PlaneGeometry(0.25, 2.5);
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    for (let i = 0; i < dashCount; i++) {
      const dL = new THREE.Mesh(dashGeom, dashMat); dL.rotation.x = -Math.PI / 2; dL.position.set(-2.8, -0.96, 20 - i * 6); dashesGroup.add(dL);
      const dR = new THREE.Mesh(dashGeom, dashMat); dR.rotation.x = -Math.PI / 2; dR.position.set(2.8, -0.96, 20 - i * 6); dashesGroup.add(dR);
    }
    scene.add(dashesGroup);

    // Sidewalks & Red Curbs
    const sidewalkMat = new THREE.MeshPhongMaterial({ color: 0x334155 });
    const curbMat = new THREE.MeshPhongMaterial({ color: 0x7f1d1d });

    const leftWalk = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, roadLength), sidewalkMat); leftWalk.position.set(-9, -0.9, -40); scene.add(leftWalk);
    const rightWalk = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, roadLength), sidewalkMat); rightWalk.position.set(9, -0.9, -40); scene.add(rightWalk);
    const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, roadLength), curbMat); leftCurb.position.set(-6.15, -0.88, -40); scene.add(leftCurb);
    const rightCurb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, roadLength), curbMat); rightCurb.position.set(6.15, -0.88, -40); scene.add(rightCurb);

    // 3. 3D Architectural Buildings
    const buildingGroup = new THREE.Group();
    const buildingColors = [0x0f172a, 0x1e1e24, 0x27272a, 0x1c1917];
    const windowLitMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.85 });
    const windowGlassMat = new THREE.MeshPhongMaterial({ color: 0x38bdf8, shininess: 80 });
    const winGeom = new THREE.PlaneGeometry(0.9, 1.2);

    for (let b = 0; b < 16; b++) {
      const side = b % 2 === 0 ? -13.5 : 13.5;
      const zPos = 18 - b * 9.5;
      const height = 10 + (b % 4) * 3.5;
      const widthB = 7;

      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(widthB, height, 7), new THREE.MeshPhongMaterial({ color: buildingColors[b % buildingColors.length] }));
      bMesh.position.set(side, height / 2 - 0.8, zPos);
      buildingGroup.add(bMesh);

      // Roof Cap
      const roofMesh = new THREE.Mesh(new THREE.BoxGeometry(widthB + 0.8, 0.4, 7.8), new THREE.MeshPhongMaterial({ color: 0x475569 }));
      roofMesh.position.set(side, height - 0.6, zPos);
      buildingGroup.add(roofMesh);

      // Windows
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const isLit = (r + c + b) % 3 === 0;
          const winMesh = new THREE.Mesh(winGeom, isLit ? windowLitMat : windowGlassMat);
          winMesh.position.set(side > 0 ? side - 3.51 : side + 3.51, 2.0 + r * 2.2, zPos - 2 + c * 1.8);
          winMesh.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
          buildingGroup.add(winMesh);
        }
      }
    }
    scene.add(buildingGroup);

    // 4. Classic 3D Double-Head Street Lamps
    const lampsGroup = new THREE.Group();
    const poleGeom = new THREE.CylinderGeometry(0.08, 0.12, 4.2, 10);
    const poleMat = new THREE.MeshPhongMaterial({ color: 0x0f172a });
    const armGeom = new THREE.BoxGeometry(1.2, 0.08, 0.08);
    const bulbGeom = new THREE.SphereGeometry(0.22, 12, 12);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    for (let l = 0; l < 16; l++) {
      const side = l % 2 === 0 ? -6.8 : 6.8;
      const zPos = 16 - l * 9.5;

      const pole = new THREE.Mesh(poleGeom, poleMat); pole.position.set(side, 1.2, zPos); lampsGroup.add(pole);
      const arm = new THREE.Mesh(armGeom, poleMat); arm.position.set(side, 3.2, zPos); lampsGroup.add(arm);
      const bulbL = new THREE.Mesh(bulbGeom, bulbMat); bulbL.position.set(side - 0.5, 3.1, zPos); lampsGroup.add(bulbL);
      const bulbR = new THREE.Mesh(bulbGeom, bulbMat); bulbR.position.set(side + 0.5, 3.1, zPos); lampsGroup.add(bulbR);
    }
    scene.add(lampsGroup);

    // 4.5. REALISTIC 3D TREES & BUSHES ALONG STREET SIDEWALKS
    const vegetationGroup = new THREE.Group();
    const trunkMat = new THREE.MeshPhongMaterial({ color: 0x3e2723, shininess: 5 });
    const leafMats = [
      new THREE.MeshPhongMaterial({ color: 0x15803d, shininess: 15 }),
      new THREE.MeshPhongMaterial({ color: 0x166534, shininess: 15 }),
      new THREE.MeshPhongMaterial({ color: 0x047857, shininess: 15 }),
      new THREE.MeshPhongMaterial({ color: 0x0f766e, shininess: 15 }),
    ];

    const trunkGeom = new THREE.CylinderGeometry(0.12, 0.22, 1.8, 8);
    const canopyGeom1 = new THREE.DodecahedronGeometry(1.1, 1);
    const canopyGeom2 = new THREE.ConeGeometry(1.2, 2.2, 7);
    const bushGeom = new THREE.DodecahedronGeometry(0.55, 1);

    for (let t = 0; t < 22; t++) {
      const side = t % 2 === 0 ? -7.8 : 7.8;
      const zPos = 24 - t * 7.5;
      const isBush = t % 3 === 0;

      if (isBush) {
        // 3D Bush / Shrub Cluster
        const bushCluster = new THREE.Group();
        const leafMat = leafMats[t % leafMats.length];
        
        for (let b = 0; b < 3; b++) {
          const bush = new THREE.Mesh(bushGeom, leafMat);
          bush.position.set((b - 1) * 0.45, 0.25 + (b % 2) * 0.15, (b % 2) * 0.25);
          bush.scale.set(1 + b * 0.1, 0.85 + b * 0.1, 1);
          bushCluster.add(bush);
        }
        bushCluster.position.set(side, -0.7, zPos);
        vegetationGroup.add(bushCluster);
      } else {
        // 3D Tree
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.y = 0.9;
        tree.add(trunk);

        const leafMat = leafMats[t % leafMats.length];

        if (t % 2 === 0) {
          // Rounded Foliage Tree
          const canopy = new THREE.Mesh(canopyGeom1, leafMat);
          canopy.position.y = 2.4;
          canopy.scale.set(1, 1.25, 1);
          tree.add(canopy);
        } else {
          // Pine / Conical Layered Tree
          const cone1 = new THREE.Mesh(canopyGeom2, leafMat); cone1.position.y = 2.2; tree.add(cone1);
          const cone2 = new THREE.Mesh(canopyGeom2, leafMat); cone2.position.y = 3.0; cone2.scale.set(0.75, 0.75, 0.75); tree.add(cone2);
        }

        tree.position.set(side, -0.8, zPos);
        vegetationGroup.add(tree);
      }
    }
    scene.add(vegetationGroup);

    // 5. DETAILED 3D CAR VEHICLES MATCHING USER REFERENCE IMAGE (media_1788370346730.png)
    const carsGroup = new THREE.Group();
    
    // Builder for Realistic Sedan / Limousine matching ref image
    const createSedanCar = (colorHex: number, isLimo: boolean = false) => {
      const car = new THREE.Group();
      const length = isLimo ? 4.5 : 3.4;

      // Lower Main Body (Glossy Sedan Finish)
      const bodyGeom = new THREE.BoxGeometry(1.5, 0.65, length);
      const bodyMat = new THREE.MeshPhongMaterial({ color: colorHex, shininess: 90 });
      const body = new THREE.Mesh(bodyGeom, bodyMat);
      body.position.y = 0.35;
      car.add(body);

      // Sloped Roof Cabin & Windshield
      const roofLength = isLimo ? 2.8 : 1.8;
      const roofGeom = new THREE.BoxGeometry(1.25, 0.55, roofLength);
      const roofMat = new THREE.MeshPhongMaterial({ color: colorHex, shininess: 90 });
      const roof = new THREE.Mesh(roofGeom, roofMat);
      roof.position.set(0, 0.85, isLimo ? 0 : -0.2);
      car.add(roof);

      // Tinted Glass Windows (Front & Rear)
      const glassMat = new THREE.MeshPhongMaterial({ color: 0x0f172a, shininess: 100 });
      const winFront = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.45), glassMat);
      winFront.rotation.x = -Math.PI / 4;
      winFront.position.set(0, 0.9, roof.position.z - roofLength / 2 - 0.05);
      car.add(winFront);

      const winRear = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.45), glassMat);
      winRear.rotation.x = Math.PI / 4;
      winRear.position.set(0, 0.9, roof.position.z + roofLength / 2 + 0.05);
      car.add(winRear);

      // Red Taillight Bar
      const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const tailMesh = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.15, 0.1), tailMat);
      tailMesh.position.set(0, 0.5, length / 2 + 0.02);
      car.add(tailMesh);

      // License Plate
      const plateMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const plateMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.2), plateMat);
      plateMesh.position.set(0, 0.3, length / 2 + 0.03);
      car.add(plateMesh);

      // 4 Wheels
      const wheelGeom = new THREE.CylinderGeometry(0.32, 0.32, 0.25, 16);
      const wheelMat = new THREE.MeshPhongMaterial({ color: 0x0f172a });
      const rimMat = new THREE.MeshPhongMaterial({ color: 0xe2e8f0 });
      const rimGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.26, 16);

      const wPositions = [
        [-0.8, 0.32, -length / 3],
        [0.8, 0.32, -length / 3],
        [-0.8, 0.32, length / 3],
        [0.8, 0.32, length / 3],
      ];

      wPositions.forEach(([x, y, z]) => {
        const wMesh = new THREE.Mesh(wheelGeom, wheelMat);
        wMesh.rotation.z = Math.PI / 2;
        wMesh.position.set(x, y, z);
        car.add(wMesh);

        const rMesh = new THREE.Mesh(rimGeom, rimMat);
        rMesh.rotation.z = Math.PI / 2;
        rMesh.position.set(x, y, z);
        car.add(rMesh);
      });

      return car;
    };

    // 4 Distinct Car Configurations matching user uploaded picture (media_1788370346730.png)
    const carConfigs = [
      { color: 0x7c3aed, isLimo: true,  laneX: -4.2, speed: -14, initialZ: 10 }, // Purple Limo (Outer Left)
      { color: 0x22c55e, isLimo: false, laneX: -1.6, speed: -14, initialZ: -10 }, // Green Sedan (Inner Left)
      { color: 0xea580c, isLimo: false, laneX: 1.6,  speed: 14,  initialZ: 5 },  // Orange-Red Sedan (Inner Right)
      { color: 0x94a3b8, isLimo: true,  laneX: 4.2,  speed: 14,  initialZ: -20 }, // Silver Grey Limo (Outer Right)
    ];

    const carList: { mesh: THREE.Group; initialZ: number; speed: number; laneX: number }[] = [];

    carConfigs.forEach((cfg) => {
      const carMesh = createSedanCar(cfg.color, cfg.isLimo);
      if (cfg.speed < 0) carMesh.rotation.y = Math.PI; // Face oncoming direction for left lanes
      carMesh.position.set(cfg.laneX, -0.6, cfg.initialZ);
      carsGroup.add(carMesh);
      carList.push({ mesh: carMesh, initialZ: cfg.initialZ, speed: cfg.speed, laneX: cfg.laneX });
    });

    scene.add(carsGroup);

    // 6. Active Vehicle Trajectory Path Line
    const trajPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 80; i++) {
      const z = 15 - i * 1.5;
      const x = Math.sin(i * 0.08) * 1.5;
      trajPoints.push(new THREE.Vector3(x, -0.88, z));
    }
    const trajGeom = new THREE.BufferGeometry().setFromPoints(trajPoints);
    const trajMat = new THREE.LineBasicMaterial({ color: 0x00E5FF, linewidth: 3, transparent: true, opacity: 0.95 });
    const trajLine = new THREE.Line(trajGeom, trajMat);
    scene.add(trajLine);

    // Satellite Beam Stream
    const beamGroup = new THREE.Group();
    const beamGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 18, -10),
      new THREE.Vector3(0, -0.85, 0)
    ]);
    const beamMat = new THREE.LineDashedMaterial({ color: 0x2EE6A6, dashSize: 0.6, gapSize: 0.3, transparent: true, opacity: 0.85 });
    const beamLine = new THREE.Line(beamGeom, beamMat);
    beamLine.computeLineDistances();
    beamGroup.add(beamLine);
    scene.add(beamGroup);

    // Radar Target Crosshair Ring HUD
    const ringGeom = new THREE.RingGeometry(0.7, 0.95, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x2EE6A6, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
    const hudRing = new THREE.Mesh(ringGeom, ringMat);
    hudRing.rotation.x = Math.PI / 2;
    hudRing.position.set(0, -0.85, 0);
    scene.add(hudRing);

    // Pointer Parallax
    let targetMouseX = 0, targetMouseY = 0;
    let currentMouseX = 0, currentMouseY = 0;

    const handlePointer = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', handlePointer);

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

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth Lerp Interpolation
      currentMouseX += (targetMouseX - currentMouseX) * 0.06;
      currentMouseY += (targetMouseY - currentMouseY) * 0.06;

      const zOffset = scrollProgress * 55;
      camera.position.z = 14 - zOffset * 0.5;
      camera.position.x = currentMouseX * 0.5;
      camera.position.y = 3.2 - currentMouseY * 0.3;
      camera.lookAt(0, 0, -30 - zOffset * 0.5);

      // Animate center white dashes
      dashesGroup.position.z = (elapsed * 6) % 6;

      // Animate 3D Cars driven by Scroll Progress & Time!
      carList.forEach((carItem) => {
        const scrollDrive = scrollProgress * 60;
        let newZ = carItem.initialZ - (elapsed * carItem.speed) - scrollDrive;
        
        if (newZ < -110) newZ += 130;
        if (newZ > 20) newZ -= 130;
        
        carItem.mesh.position.z = newZ;
      });

      // Pulse HUD ring
      const scale = 1 + Math.sin(elapsed * 4) * 0.12;
      hudRing.scale.set(scale, scale, 1);

      // Hide satellite beam in blackout
      beamGroup.visible = !isBlackout;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointer);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      roadGeom.dispose(); roadMat.dispose();
      yellowGeom.dispose(); yellowMat.dispose();
      dashGeom.dispose(); dashMat.dispose();
      sidewalkMat.dispose(); curbMat.dispose();
      winGeom.dispose(); windowLitMat.dispose(); windowGlassMat.dispose();
      poleGeom.dispose(); poleMat.dispose(); armGeom.dispose(); bulbGeom.dispose(); bulbMat.dispose();
      trajGeom.dispose(); trajMat.dispose();
      beamGeom.dispose(); beamMat.dispose();
      ringGeom.dispose(); ringMat.dispose();
      renderer.dispose();
    };
  }, [scrollProgress, isBlackout]);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#04060c] via-transparent to-[#04060c]/80 pointer-events-none z-20" />
    </div>
  );
};
