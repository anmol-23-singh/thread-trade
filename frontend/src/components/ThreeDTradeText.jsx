import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeDTradeText() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();

    // Orthographic camera works beautifully for stylized geometric text
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lights to bring out the stone/metal highlights
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.55);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xFFFFFF, 1.4);
    dirLight1.position.set(4, 5, 3);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xC9962C, 0.7); // Gold reflection light
    dirLight2.position.set(-4, -2, 2);
    scene.add(dirLight2);

    // 3. Volumetric Material: Stone with metallic edge highlights
    const textMaterial = new THREE.MeshStandardMaterial({
      color: 0xFBFAF4, // Off-white stone
      roughness: 0.15,
      metalness: 0.6, // Captures gold and white specular highlights
    });

    const letterGroup = new THREE.Group();
    scene.add(letterGroup);

    // 4. Procedural Letter Mesh Creation (T, R, A, D, E)
    const createT = () => {
      const g = new THREE.Group();
      const top = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.05, 0.08), textMaterial);
      top.position.set(0, 0.15, 0);
      const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 0.08), textMaterial);
      vertical.position.set(0, -0.05, 0);
      g.add(top, vertical);
      return g;
    };

    const createR = () => {
      const g = new THREE.Group();
      const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 0.08), textMaterial);
      vertical.position.set(-0.1, 0, 0);

      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 8, 16, Math.PI), textMaterial);
      loop.position.set(-0.1, 0.08, 0);
      loop.rotation.z = -Math.PI * 0.5;

      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.2), textMaterial);
      leg.position.set(0.0, -0.08, 0);
      leg.rotation.z = -Math.PI * 0.22;

      g.add(vertical, loop, leg);
      return g;
    };

    const createA = () => {
      const g = new THREE.Group();
      const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.38), textMaterial);
      legL.position.set(-0.07, 0, 0);
      legL.rotation.z = Math.PI * 0.12;

      const legR = legL.clone();
      legR.position.x = 0.07;
      legR.rotation.z = -Math.PI * 0.12;

      const cross = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.06), textMaterial);
      cross.position.set(0, -0.04, 0);

      g.add(legL, legR, cross);
      return g;
    };

    const createD = () => {
      const g = new THREE.Group();
      const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 0.08), textMaterial);
      vertical.position.set(-0.08, 0, 0);

      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 8, 24, Math.PI), textMaterial);
      loop.position.set(-0.08, 0, 0);
      loop.rotation.z = -Math.PI * 0.5;

      g.add(vertical, loop);
      return g;
    };

    const createE = () => {
      const g = new THREE.Group();
      const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 0.08), textMaterial);
      vertical.position.set(-0.1, 0, 0);

      const top = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.08), textMaterial);
      top.position.set(0, 0.15, 0);

      const mid = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.08), textMaterial);
      mid.position.set(-0.025, 0, 0);

      const bottom = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.08), textMaterial);
      bottom.position.set(0, -0.15, 0);

      g.add(vertical, top, mid, bottom);
      return g;
    };

    // Instantiate and space out letters
    const letters = [createT(), createR(), createA(), createD(), createE()];
    const spacing = 0.36;

    letters.forEach((l, index) => {
      l.position.x = (index - 2) * spacing;
      letterGroup.add(l);
    });

    // Angle the group slightly as requested
    letterGroup.rotation.x = 0.12;
    letterGroup.rotation.y = -0.22;
    letterGroup.scale.set(0.85, 0.85, 0.85); // Slightly smaller than SWAP text

    // 5. Animation Loop (Slow Parallel Kinetic Motion)
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      // Slow kinetic float
      letterGroup.position.y = Math.sin(time * 1.5) * 0.05;

      // Parallel wave: rotate each letter on its Y-axis at a phase offset
      letters.forEach((l, i) => {
        l.rotation.y = Math.sin(time * 1.2 + i * 0.5) * 0.15;
        l.position.y = Math.cos(time * 1.5 + i * 0.3) * 0.02;
      });

      // Tilt entire word to catch light
      letterGroup.rotation.y = -0.22 + Math.sin(time * 0.6) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // 6. Resize support
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);

      const disposeNode = (node) => {
        if (node.geometry) node.geometry.dispose();
        if (node.material) node.material.dispose();
      };
      letterGroup.traverse(disposeNode);
      scene.remove(letterGroup);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 select-none relative h-[90px]">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
