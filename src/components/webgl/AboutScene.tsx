"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { pointer } from "@/lib/pointer";

type AboutSceneProps = {
  active: boolean;
  lowPower: boolean;
  reducedMotion: boolean;
  /** Progression de la section (0 → 1) */
  getProgress: () => number;
};

/** Nœud torique chromé à reflets irisés, qui tourne avec le scroll */
function IridescentKnot({ lowPower, speed, getProgress }: { lowPower: boolean; speed: number; getProgress: () => number }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const m = mesh.current;
    if (!m) return;
    const p = getProgress();
    m.rotation.x = THREE.MathUtils.lerp(m.rotation.x, p * Math.PI * 1.5 + pointer.y * 0.2, 0.06);
    m.rotation.y += Math.min(delta, 1 / 30) * 0.2 * speed;
    m.rotation.z = THREE.MathUtils.lerp(m.rotation.z, pointer.x * 0.25, 0.05);
  });

  return (
    <Float speed={1.2 * speed} floatIntensity={0.8 * speed} rotationIntensity={0.2 * speed}>
      <mesh ref={mesh} scale={0.62}>
        <torusKnotGeometry args={[1, 0.34, lowPower ? 160 : 320, lowPower ? 24 : 48, 2, 3]} />
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={1}
          roughness={0.12}
          iridescence={1}
          iridescenceIOR={1.6}
          iridescenceThicknessRange={[120, 900]}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </Float>
  );
}

/**
 * Élément 3D secondaire de la section « À propos ».
 * L'environnement coloré se reflète sur le métal irisé.
 */
export default function AboutScene({ active, lowPower, reducedMotion, getProgress }: AboutSceneProps) {
  return (
    <Canvas
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      camera={{ position: [0, 0, 6], fov: 35 }}
      dpr={lowPower ? [1, 1.5] : [1, 2]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping }}
      aria-hidden
    >
      <Environment resolution={256} frames={1}>
        {/* Studio blanc : le métal reflète un fond clair plutôt que du noir */}
        <color attach="background" args={["#ecebe6"]} />
        <Lightformer form="rect" intensity={4} position={[0, 5, 2]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={3} color="#2b50ff" position={[-5, 1, 0]} scale={[3, 8, 1]} />
        <Lightformer form="rect" intensity={3} color="#ff4fd8" position={[5, -1, 0]} scale={[3, 8, 1]} />
        <Lightformer form="ring" intensity={2.5} color="#ff6a1f" position={[0, -3, 4]} scale={3} />
        <Lightformer form="rect" intensity={2} color="#c6f432" position={[0, 0, -6]} scale={[6, 6, 1]} />
      </Environment>
      <IridescentKnot lowPower={lowPower} speed={reducedMotion ? 0.1 : 1} getProgress={getProgress} />
    </Canvas>
  );
}
