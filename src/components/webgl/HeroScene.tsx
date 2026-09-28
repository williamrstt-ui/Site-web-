"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { LiquidBlob } from "./LiquidBlob";
import { Particles } from "./Particles";
import { FloatingShapes } from "./FloatingShapes";
import { Effects } from "./Effects";
import { markSceneReady } from "@/lib/loading";

type HeroSceneProps = {
  /** Version allégée pour mobile / tactile */
  lowPower: boolean;
  reducedMotion: boolean;
  /** Progression de sortie du hero (0 → 1) */
  getProgress: () => number;
  /** Met la boucle de rendu en pause hors écran */
  active: boolean;
};

/** Signale au loader que la première frame est rendue */
function ReadySignal() {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    markSceneReady();
  });
  return null;
}

/**
 * Scène WebGL plein écran du hero : blob liquide + confettis + objets
 * flottants, éclairés par un environnement studio généré en local
 * (aucun HDR à télécharger).
 */
export default function HeroScene({ lowPower, reducedMotion, getProgress, active }: HeroSceneProps) {
  const [degraded, setDegraded] = useState(false);
  const speed = reducedMotion ? 0.15 : 1;
  const withEffects = !lowPower && !degraded && !reducedMotion;

  return (
    <Canvas
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      camera={{ position: [0, 0, 7], fov: 35, near: 0.1, far: 50 }}
      dpr={lowPower ? [1, 1.5] : [1, 2]}
      frameloop={active ? "always" : "never"}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.NeutralToneMapping,
      }}
      aria-hidden
    >
      {/* Coupe le post-processing si les fps chutent durablement */}
      <PerformanceMonitor onDecline={() => setDegraded(true)} />
      <AdaptiveDpr pixelated={false} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />

      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#f6f5f1"]} />
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={2} color="#ff4fd8" position={[-5, 0, 1]} scale={[3, 6, 1]} />
        <Lightformer form="rect" intensity={2} color="#2b50ff" position={[5, 1, -1]} scale={[3, 6, 1]} />
        <Lightformer form="circle" intensity={1.5} color="#ff6a1f" position={[0, -4, 2]} scale={3} />
      </Environment>

      <LiquidBlob detail={lowPower ? 48 : 96} radius={lowPower ? 1.15 : 1.35} speed={speed} getProgress={getProgress} />
      <Particles count={lowPower ? 400 : 1200} speed={speed} getProgress={getProgress} />
      <FloatingShapes count={lowPower ? 3 : 6} speed={speed} getProgress={getProgress} />

      {withEffects && <Effects />}
      <ReadySignal />
    </Canvas>
  );
}
