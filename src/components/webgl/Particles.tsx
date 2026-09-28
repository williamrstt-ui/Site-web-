"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { particlesFragmentShader, particlesVertexShader } from "./shaders/particles";
import { pointer } from "@/lib/pointer";

const PALETTE = ["#2b50ff", "#7b2bff", "#ff4fd8", "#ff6a1f", "#c6f432", "#0d0d0f"];

type ParticlesProps = {
  count?: number;
  speed?: number;
  getProgress?: () => number;
};

/** Confettis 3D répartis dans une coquille sphérique autour du blob */
export function Particles({ count = 1500, speed = 1, getProgress }: ParticlesProps) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { gl, camera } = useThree();
  const mouse3D = useMemo(() => new THREE.Vector3(), []);

  const { positions, colors, scales, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const seeds = new Float32Array(count);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      // Distribution uniforme dans une coquille (rayon 2 → 5.5)
      const r = 2 + Math.pow(Math.random(), 0.8) * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.7;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      c.set(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
      colors.set([c.r, c.g, c.b], i * 3);
      scales[i] = 0.4 + Math.random() * 1.2;
      seeds[i] = Math.random();
    }
    return { positions, colors, scales, seeds };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      uSize: { value: 38 },
      uMouse3D: { value: new THREE.Vector3(99, 99, 99) },
      uSpread: { value: 1 },
    }),
    [gl],
  );

  useFrame((_, delta) => {
    if (!material.current) return;
    uniforms.uTime.value += Math.min(delta, 1 / 30) * speed;
    // Projette la souris sur le plan z = 0
    mouse3D.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
    const dist = -camera.position.z / mouse3D.z;
    uniforms.uMouse3D.value.copy(camera.position).addScaledVector(mouse3D, dist);
    // Les particules s'écartent quand on scrolle
    const target = 1 + (getProgress?.() ?? 0) * 0.8;
    uniforms.uSpread.value += (target - uniforms.uSpread.value) * 0.06;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={particlesVertexShader}
        fragmentShader={particlesFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
