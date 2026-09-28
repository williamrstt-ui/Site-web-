"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { blobFragmentShader, blobVertexShader } from "./shaders/blob";
import { pointer } from "@/lib/pointer";

type LiquidBlobProps = {
  /** Subdivisions de l'icosaèdre (moins sur mobile) */
  detail?: number;
  radius?: number;
  /** Progression de scroll 0 → 1 lue à chaque frame */
  getProgress?: () => number;
  /** Vitesse d'animation (≈0 si reduced motion) */
  speed?: number;
  colors?: [string, string, string, string];
  position?: [number, number, number];
};

const DEFAULT_COLORS: [string, string, string, string] = ["#2b50ff", "#7b2bff", "#ff4fd8", "#ff6a1f"];

/**
 * Sphère liquide morphing : réagit à la souris (déformation + rotation)
 * et au scroll (torsion, amplitude et échelle augmentent).
 */
export function LiquidBlob({
  detail = 64,
  radius = 1.35,
  getProgress,
  speed = 1,
  colors = DEFAULT_COLORS,
  position = [0, 0, 0],
}: LiquidBlobProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const smoothMouse = useRef(new THREE.Vector2());

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: 0.28 },
      uDensity: { value: 1.35 },
      uStrength: { value: 0.28 },
      uTwist: { value: 0 },
      uMouse: { value: new THREE.Vector2() },
      uOpacity: { value: 1 },
      uColorA: { value: new THREE.Color(colors[0]) },
      uColorB: { value: new THREE.Color(colors[1]) },
      uColorC: { value: new THREE.Color(colors[2]) },
      uColorD: { value: new THREE.Color(colors[3]) },
    }),
    // Les couleurs sont figées au montage : inutile de recréer le matériau
    [],
  );

  useFrame((_, delta) => {
    const m = mesh.current;
    if (!m) return;
    const dt = Math.min(delta, 1 / 30);
    const progress = getProgress?.() ?? 0;

    uniforms.uTime.value += dt * speed;

    // Souris lissée
    smoothMouse.current.x += (pointer.x - smoothMouse.current.x) * 0.05;
    smoothMouse.current.y += (pointer.y - smoothMouse.current.y) * 0.05;
    uniforms.uMouse.value.copy(smoothMouse.current);

    // Scroll : le blob se tord, s'agite et grossit en quittant le hero
    uniforms.uTwist.value = THREE.MathUtils.lerp(uniforms.uTwist.value, progress * 1.6, 0.08);
    uniforms.uStrength.value = THREE.MathUtils.lerp(uniforms.uStrength.value, 0.28 + progress * 0.35, 0.08);

    const targetScale = 1 + progress * 0.6;
    m.scale.setScalar(THREE.MathUtils.lerp(m.scale.x, targetScale, 0.08));

    // Rotation continue + inclinaison vers la souris
    m.rotation.y += dt * 0.12 * speed;
    m.rotation.x = THREE.MathUtils.lerp(m.rotation.x, -smoothMouse.current.y * 0.35, 0.05);
    m.rotation.z = THREE.MathUtils.lerp(m.rotation.z, smoothMouse.current.x * 0.2, 0.05);
    m.position.y = THREE.MathUtils.lerp(m.position.y, position[1] + progress * 0.9, 0.08);
  });

  return (
    <mesh ref={mesh} position={position}>
      <icosahedronGeometry args={[radius, detail]} />
      <shaderMaterial
        vertexShader={blobVertexShader}
        fragmentShader={blobFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}
