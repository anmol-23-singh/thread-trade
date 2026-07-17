import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeDClothes() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, px: 0, py: 0, vx: 0, vy: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xFBC5C5, 0.05); // Cute pastel pink fog to match background

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xFBFAF4, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
    keyLight.position.set(5, 10, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xC9962C, 0.55); // Warm gold rim
    rimLight.position.set(-5, 2, -5);
    scene.add(rimLight);

    // 3. Materials & Textures
    const createWeaveBumpMap = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 32, 32);
      ctx.strokeStyle = '#909090';
      ctx.lineWidth = 1.0;
      for (let x = 0; x < 32; x += 4) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 32); ctx.stroke();
      }
      for (let y = 0; y < 32; y += 4) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(32, y); ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(8, 8);
      return tex;
    };
    
    const fabricBump = createWeaveBumpMap();

    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xC9962C,
      metalness: 0.95,
      roughness: 0.1,
    });

    const textMaterial = new THREE.MeshStandardMaterial({
      color: 0xFBFAF4,
      roughness: 0.18,
      metalness: 0.65,
    });

    // Brown & Black Fabric Materials
    const brownBlackMaterials = [
      new THREE.MeshPhysicalMaterial({ color: 0x1A1A1A, roughness: 0.65, sheen: 0.8, bumpMap: fabricBump, bumpScale: 0.015, side: THREE.DoubleSide }), // Matte Black
      new THREE.MeshPhysicalMaterial({ color: 0x2C2C2C, roughness: 0.7, sheen: 0.7, bumpMap: fabricBump, bumpScale: 0.012, side: THREE.DoubleSide }), // Charcoal
      new THREE.MeshPhysicalMaterial({ color: 0x3E2723, roughness: 0.8, sheen: 0.9, bumpMap: fabricBump, bumpScale: 0.018, side: THREE.DoubleSide }), // Dark Coffee Brown
      new THREE.MeshPhysicalMaterial({ color: 0x5D4037, roughness: 0.7, sheen: 0.8, bumpMap: fabricBump, bumpScale: 0.015, side: THREE.DoubleSide }), // Medium Cocoa Brown
      new THREE.MeshPhysicalMaterial({ color: 0x795548, roughness: 0.65, sheen: 0.75, bumpMap: fabricBump, bumpScale: 0.013, side: THREE.DoubleSide }), // Terracotta Brown
      new THREE.MeshPhysicalMaterial({ color: 0x8D6E63, roughness: 0.6, sheen: 0.7, bumpMap: fabricBump, bumpScale: 0.01, side: THREE.DoubleSide }), // Light Camel/Tan
      new THREE.MeshPhysicalMaterial({ color: 0x4E3629, roughness: 0.75, sheen: 0.85, bumpMap: fabricBump, bumpScale: 0.016, side: THREE.DoubleSide }) // Walnut Brown
    ];

    // 4. Volumetric "THREAD-TRADE" Text
    const createTHREADTRADEText = () => {
      const g = new THREE.Group();

      const createT = () => {
        const letter = new THREE.Group();
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.08), textMaterial);
        top.position.set(0, 0.15, 0);
        const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 0.08), textMaterial);
        vertical.position.set(0, -0.05, 0);
        letter.add(top, vertical);
        return letter;
      };

      const createH = () => {
        const letter = new THREE.Group();
        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 0.08), textMaterial);
        legL.position.set(-0.09, 0, 0);
        const legR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 0.08), textMaterial);
        legR.position.set(0.09, 0, 0);
        const cross = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.045, 0.08), textMaterial);
        cross.position.set(0, 0, 0);
        letter.add(legL, legR, cross);
        return letter;
      };

      const createR = () => {
        const letter = new THREE.Group();
        const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 0.08), textMaterial);
        vertical.position.set(-0.1, 0, 0);
        const loop = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 8, 16, Math.PI), textMaterial);
        loop.position.set(-0.1, 0.08, 0);
        loop.rotation.z = -Math.PI * 0.5;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.2), textMaterial);
        leg.position.set(0.0, -0.08, 0);
        leg.rotation.z = -Math.PI * 0.22;
        letter.add(vertical, loop, leg);
        return letter;
      };

      const createE = () => {
        const letter = new THREE.Group();
        const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 0.08), textMaterial);
        vertical.position.set(-0.1, 0, 0);
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.08), textMaterial);
        top.position.set(0, 0.15, 0);
        const mid = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.08), textMaterial);
        mid.position.set(-0.025, 0, 0);
        const btm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.08), textMaterial);
        btm.position.set(0, -0.15, 0);
        letter.add(vertical, top, mid, btm);
        return letter;
      };

      const createA = () => {
        const letter = new THREE.Group();
        const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.38), textMaterial);
        legL.position.set(-0.07, 0, 0);
        legL.rotation.z = Math.PI * 0.12;
        const legR = legL.clone();
        legR.position.x = 0.07;
        legR.rotation.z = -Math.PI * 0.12;
        const cross = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.06), textMaterial);
        cross.position.set(0, -0.04, 0);
        letter.add(legL, legR, cross);
        return letter;
      };

      const createD = () => {
        const letter = new THREE.Group();
        const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 0.08), textMaterial);
        vertical.position.set(-0.08, 0, 0);
        const loop = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 8, 24, Math.PI), textMaterial);
        loop.position.set(-0.08, 0, 0);
        loop.rotation.z = -Math.PI * 0.5;
        letter.add(vertical, loop);
        return letter;
      };

      const createHyphen = () => {
        const letter = new THREE.Group();
        const mid = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.045, 0.08), textMaterial);
        mid.position.set(0, 0, 0);
        letter.add(mid);
        return letter;
      };

      const letters = [
        createT(), createH(), createR(), createE(), createA(), createD(),
        createHyphen(),
        createT(), createR(), createA(), createD(), createE()
      ];

      const spacing = 0.22;
      letters.forEach((l, index) => {
        l.position.x = (index - 5.5) * spacing;
        g.add(l);
      });

      return g;
    };

    const threadTradeText = createTHREADTRADEText();
    // Center of the panel (0, 0) and scaled up prominently (1.6x)
    threadTradeText.position.set(0, 0, -1.0);
    threadTradeText.scale.set(1.6, 1.6, 1.6);
    scene.add(threadTradeText);

    // 5. Procedural Garments Building Helpers
    const createHangerMesh = () => {
      const g = new THREE.Group();
      const hookGeom = new THREE.TorusGeometry(0.1, 0.01, 12, 32, Math.PI * 1.35);
      const hook = new THREE.Mesh(hookGeom, goldMaterial);
      hook.rotation.z = -Math.PI * 0.18;
      hook.position.set(0.02, 0.16, 0);
      g.add(hook);

      const hangerCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.36, -0.06, 0),
        new THREE.Vector3(-0.16, 0.01, 0),
        new THREE.Vector3(0, 0.04, 0),
        new THREE.Vector3(0.16, 0.01, 0),
        new THREE.Vector3(0.36, -0.06, 0)
      ]);
      const barGeom = new THREE.TubeGeometry(hangerCurve, 24, 0.012, 8, false);
      const bar = new THREE.Mesh(barGeom, goldMaterial);
      g.add(bar);
      return g;
    };

    const createPinkSkirt = (mat) => {
      const g = new THREE.Group();
      const topGeom = new THREE.CylinderGeometry(0.12, 0.13, 0.18, 16);
      topGeom.scale(1.05, 1, 0.5);
      const top = new THREE.Mesh(topGeom, mat);
      top.position.set(0, -0.09, 0);
      g.add(top);

      const skirtGeom = new THREE.CylinderGeometry(0.13, 0.28, 0.24, 32, 4, true);
      const pos = skirtGeom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i); const py = pos.getY(i); const pz = pos.getZ(i);
        const bottomF = Math.max(0, (-py + 0.12) / 0.24);
        const angle = Math.atan2(pz, px);
        const ripple = 1.0 + Math.sin(angle * 12) * 0.15 * bottomF;
        pos.setX(i, px * ripple); pos.setZ(i, pz * ripple);
      }
      skirtGeom.computeVertexNormals();
      skirtGeom.scale(1, 1, 0.5);
      const skirt = new THREE.Mesh(skirtGeom, mat);
      skirt.position.set(0, -0.3, 0);
      g.add(skirt);
      return g;
    };

    const createBlueShirt = (mat) => {
      const g = new THREE.Group();
      const bodyGeom = new THREE.CylinderGeometry(0.17, 0.17, 0.38, 20);
      bodyGeom.scale(1, 1, 0.5);
      const body = new THREE.Mesh(bodyGeom, mat);
      body.position.set(0, -0.19, 0);
      g.add(body);

      const sleeveLGeom = new THREE.CylinderGeometry(0.06, 0.04, 0.24, 12);
      const sleeveL = new THREE.Mesh(sleeveLGeom, mat);
      sleeveL.position.set(-0.21, -0.12, 0);
      sleeveL.rotation.z = Math.PI * 0.16;
      g.add(sleeveL);

      const sleeveR = sleeveL.clone();
      sleeveR.position.x = 0.21;
      sleeveR.rotation.z = -Math.PI * 0.16;
      g.add(sleeveR);

      const collarGeom = new THREE.TorusGeometry(0.07, 0.012, 8, 24);
      collarGeom.scale(1, 0.5, 1);
      const collar = new THREE.Mesh(collarGeom, goldMaterial);
      collar.position.set(0, 0, 0);
      collar.rotation.x = Math.PI * 0.5;
      g.add(collar);
      return g;
    };

    const createDarkCoat = (mat) => {
      const g = new THREE.Group();
      const bodyGeom = new THREE.CylinderGeometry(0.18, 0.2, 0.52, 20);
      bodyGeom.scale(1.05, 1, 0.55);
      const body = new THREE.Mesh(bodyGeom, mat);
      body.position.set(0, -0.26, 0);
      g.add(body);

      const sleeveLGeom = new THREE.CylinderGeometry(0.06, 0.045, 0.36, 16);
      const sleeveL = new THREE.Mesh(sleeveLGeom, mat);
      sleeveL.position.set(-0.22, -0.2, 0);
      sleeveL.rotation.z = Math.PI * 0.12;
      g.add(sleeveL);

      const sleeveR = sleeveL.clone();
      sleeveR.position.x = 0.22;
      sleeveR.rotation.z = -Math.PI * 0.12;
      g.add(sleeveR);

      const lapelGeom = new THREE.BoxGeometry(0.03, 0.25, 0.04);
      const lapelL = new THREE.Mesh(lapelGeom, goldMaterial);
      lapelL.position.set(-0.06, -0.16, 0.05);
      lapelL.rotation.z = -Math.PI * 0.08;
      const lapelR = lapelL.clone();
      lapelR.position.x = 0.06;
      lapelR.rotation.z = Math.PI * 0.08;
      g.add(lapelL, lapelR);
      return g;
    };

    const createPurpleDress = (mat) => {
      const g = new THREE.Group();
      const topGeom = new THREE.CylinderGeometry(0.11, 0.13, 0.22, 16);
      topGeom.scale(1, 1, 0.45);
      const top = new THREE.Mesh(topGeom, mat);
      top.position.set(0, -0.11, 0);
      g.add(top);

      const skirtGeom = new THREE.CylinderGeometry(0.13, 0.36, 0.55, 32, 8, true);
      const pos = skirtGeom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const px = pos.getX(i); const py = pos.getY(i); const pz = pos.getZ(i);
        const bottomF = Math.max(0, (-py + 0.275) / 0.55);
        const angle = Math.atan2(pz, px);
        const ripple = 1.0 + Math.sin(angle * 8) * 0.16 * Math.pow(bottomF, 1.2);
        pos.setX(i, px * ripple); pos.setZ(i, pz * ripple);
      }
      skirtGeom.computeVertexNormals();
      skirtGeom.scale(1, 1, 0.52);
      const skirt = new THREE.Mesh(skirtGeom, mat);
      skirt.position.set(0, -0.48, 0);
      g.add(skirt);

      const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.02, 24), goldMaterial);
      belt.position.set(0, -0.22, 0);
      belt.scale.set(1, 1, 0.46);
      g.add(belt);
      return g;
    };

    const createTrousers = (mat) => {
      const g = new THREE.Group();
      const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16), mat);
      waist.position.set(0, -0.05, 0);
      waist.scale.set(1, 1, 0.45);
      g.add(waist);

      const legGeom = new THREE.CylinderGeometry(0.065, 0.08, 0.42, 16);
      const legL = new THREE.Mesh(legGeom, mat);
      legL.position.set(-0.07, -0.25, 0);
      g.add(legL);

      const legR = legL.clone();
      legR.position.x = 0.07;
      g.add(legR);
      return g;
    };

    const items = [
      { build: createPinkSkirt },
      { build: createBlueShirt },
      { build: createDarkCoat },
      { build: createPurpleDress },
      { build: createTrousers }
    ];

    // 6. Spawn FEWER clothes (10 items) floating as foreground bubbles
    const numGarments = 10;
    const clothingGroups = [];
    const bubbleContainer = new THREE.Group();
    scene.add(bubbleContainer);

    for (let i = 0; i < numGarments; i++) {
      const garmentGroup = new THREE.Group();

      const hanger = createHangerMesh();
      garmentGroup.add(hanger);

      const mat = brownBlackMaterials[Math.floor(Math.random() * brownBlackMaterials.length)];
      const itemType = items[i % items.length];
      const cloth = itemType.build(mat);
      garmentGroup.add(cloth);

      // Position in the foreground (z from -0.8 to 0.8) so they float in front of the text
      const rx = (Math.random() - 0.5) * 5.0;
      const ry = (Math.random() - 0.5) * 4.2;
      const rz = (Math.random() - 0.5) * 1.6;
      garmentGroup.position.set(rx, ry, rz);

      bubbleContainer.add(garmentGroup);
      clothingGroups.push(garmentGroup);

      const driftAngle = Math.random() * Math.PI * 2;
      const driftSpeed = 0.002 + Math.random() * 0.0035;
      const baseScale = 0.38 + Math.random() * 0.12;
      garmentGroup.scale.set(baseScale, baseScale, baseScale);

      garmentGroup.userData = {
        index: i,
        baseScale,
        vx: Math.cos(driftAngle) * driftSpeed,
        vy: Math.sin(driftAngle) * driftSpeed,
        vz: (Math.random() - 0.5) * 0.001,
        swayAngleX: 0,
        swayAngleZ: 0,
        swayVelX: 0,
        swayVelZ: 0
      };
    }

    // 7. Gold Thread Track (e^x curve) in the background (z = -2.2)
    const trackPoints = [];
    for (let k = 0; k < 60; k++) {
      const progress = k / 59;
      // Spread from left to right (-3.2 to 3.2)
      const cx = -3.2 + progress * 6.4;
      // Exponential function (y = e^x shape)
      const cy = Math.exp((cx + 1.2) * 0.4) * 0.7 - 1.15;
      // Put it in the distance (z = -2.2)
      const cz = -2.2;
      trackPoints.push(new THREE.Vector3(cx, cy, cz));
    }
    const trackCurve = new THREE.CatmullRomCurve3(trackPoints);
    const trackGeom = new THREE.TubeGeometry(trackCurve, 64, 0.015, 8, false);
    const trackMaterial = new THREE.MeshStandardMaterial({
      color: 0xC9962C,
      emissive: 0xC9962C,
      emissiveIntensity: 1.0,
      roughness: 0.1
    });
    const trackLine = new THREE.Mesh(trackGeom, trackMaterial);
    scene.add(trackLine);

    // 8. Stretched Thread Dust Particles
    const particleCount = 45;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = [];
    const particleOffsets = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 6;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3 - 1.5;
      
      particleSpeeds.push(0.002 + Math.random() * 0.003);
      particleOffsets.push({
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const createThreadTexture = () => {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 32;
      pCanvas.height = 32;
      const pCtx = pCanvas.getContext('2d');
      pCtx.strokeStyle = 'rgba(251, 250, 244, 0.75)';
      pCtx.lineWidth = 1.8;
      pCtx.beginPath();
      pCtx.moveTo(6, 16);
      pCtx.quadraticCurveTo(16, 2, 26, 16);
      pCtx.stroke();
      return new THREE.CanvasTexture(pCanvas);
    };

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.16,
      map: createThreadTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 9. Mouse Interactions
    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;

      mouseRef.current.targetX = (clientX / width) * 2 - 1;
      mouseRef.current.targetY = -(clientY / height) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 10. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();
    const springK = 0.07;
    const damping = 0.93;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const mouse = mouseRef.current;

      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;
      mouse.vx = mouse.x - mouse.px;
      mouse.vy = mouse.y - mouse.py;
      mouse.px = mouse.x;
      mouse.py = mouse.y;

      const mouse3D = new THREE.Vector3(mouse.x * 4.6, mouse.y * 3.4, 0);

      // Kinetic Float Centered (y = 0) and scaled up (1.6x)
      threadTradeText.position.y = Math.sin(elapsed * 1.5) * 0.06;
      threadTradeText.rotation.y = Math.sin(elapsed * 0.6) * 0.08;
      threadTradeText.children.forEach((l, i) => {
        l.rotation.y = Math.sin(elapsed * 1.2 + i * 0.25) * 0.12;
      });

      // Animate Clothes as floating bubbles
      clothingGroups.forEach((gGroup) => {
        const u = gGroup.userData;

        gGroup.position.x += u.vx;
        gGroup.position.y += u.vy;
        gGroup.position.z += u.vz;

        const xLimit = 2.8;
        const yLimit = 2.2;

        if (gGroup.position.x > xLimit) gGroup.position.x = -xLimit;
        else if (gGroup.position.x < -xLimit) gGroup.position.x = xLimit;

        if (gGroup.position.y > yLimit) gGroup.position.y = -yLimit;
        else if (gGroup.position.y < -yLimit) gGroup.position.y = yLimit;

        if (gGroup.position.z > 0.8) u.vz = -Math.abs(u.vz);
        else if (gGroup.position.z < -0.8) u.vz = Math.abs(u.vz);

        // Repel from cursor
        const dist = mouse3D.distanceTo(gGroup.position);
        if (dist < 2.0) {
          const pushDir = new THREE.Vector3().subVectors(gGroup.position, mouse3D);
          pushDir.z = 0;
          pushDir.normalize();

          const force = (2.0 - dist) * 0.016;
          u.vx += pushDir.x * force;
          u.vy += pushDir.y * force;

          u.swayVelZ += pushDir.x * force * 1.6;
          u.swayVelX += pushDir.y * force * 1.6;
        }

        u.vx *= 0.94;
        u.vy *= 0.94;

        // Slow drift force
        const angle = elapsed * 0.15 + u.index;
        u.vx += Math.cos(angle) * 0.0002;
        u.vy += Math.sin(angle) * 0.0002;

        const curSpeed = Math.sqrt(u.vx * u.vx + u.vy * u.vy);
        const maxSpeed = 0.035;
        if (curSpeed > maxSpeed) {
          u.vx = (u.vx / curSpeed) * maxSpeed;
          u.vy = (u.vy / curSpeed) * maxSpeed;
        }

        // Sway physics
        const springForceZ = -springK * u.swayAngleZ;
        const dampingForceZ = -u.swayVelZ * (1 - damping);
        u.swayVelZ += springForceZ + dampingForceZ;
        u.swayAngleZ += u.swayVelZ;

        const springForceX = -springK * u.swayAngleX;
        const dampingForceX = -u.swayVelX * (1 - damping);
        u.swayVelX += springForceX + dampingForceX;
        u.swayAngleX += u.swayVelX;

        gGroup.rotation.z = u.swayAngleZ;
        gGroup.rotation.x = u.swayAngleX;

        gGroup.rotation.y += 0.006 + (u.index % 5) * 0.002;
      });

      // Animate Particles
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particleSpeeds[i] * 0.4;
        positions[i * 3 + 1] += particleSpeeds[i];

        if (positions[i * 3 + 1] > 2.6) {
          positions[i * 3 + 1] = -2.6;
          positions[i * 3] = (Math.random() - 0.5) * 6;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 11. Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 12. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      scene.remove(particles);
      particleGeometry.dispose();
      particleMaterial.dispose();
      
      scene.remove(trackLine);
      trackGeom.dispose();
      trackMaterial.dispose();

      const disposeNode = (node) => {
        if (node.geometry) node.geometry.dispose();
        if (node.material) {
          if (Array.isArray(node.material)) node.material.forEach(m => m.dispose());
          else node.material.dispose();
        }
      };

      bubbleContainer.traverse(disposeNode);
      scene.remove(bubbleContainer);
      
      threadTradeText.traverse(disposeNode);
      scene.remove(threadTradeText);
      
      fabricBump.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center p-6 select-none bg-gradient-to-tr from-[#FBC5C5] to-[#FDE2E4]">
      {/* Delicate Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#212c3903_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none z-0" />
      
      {/* Brand Text Details in background */}
      <div className="absolute inset-0 flex flex-col justify-between p-12 pointer-events-none z-0">
        <div className="flex justify-between items-start">
          <div className="font-mono text-xs text-ink/10 tracking-widest uppercase">* THREAD TRADE NETWORK *</div>
        </div>
        <div className="flex justify-between items-end">
          <div className="font-mono text-[9px] text-ink/10 tracking-widest uppercase">PREMIUM CLOTHING EXCHANGE</div>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-gold/5 blur-[120px] pointer-events-none z-0" />

      {/* Main Canvas */}
      <div ref={containerRef} className="w-full h-full min-h-[440px] z-10" />

      {/* Kinetic Tips */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none text-center z-10 animate-pulse">
        <p className="font-sans text-[10px] font-bold tracking-widest text-ink/20 uppercase">
          ✦ Centered Volumetric branding & gold thread track ✦
        </p>
      </div>
    </div>
  );
}
