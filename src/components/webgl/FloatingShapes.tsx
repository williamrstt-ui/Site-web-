"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { pointer } from "@/lib/pointer";

type Shape = {
  geometry: "torus" | "capsule" | "sphere" | "cone" | "box";
  color: string;
  position: [number, number, number];
  scale: number;
  rotation?: [number, number, number];
};

/** Petits objets brillants aux couleurs de marque qui flottent autour du blob */
const SHAPES: Shape[] = [
  { geometry: "torus", color: "#ff6a1f", position: [-2.9, 1.3, -0.6], scale: 0.42, rotation: [0.8, 0.3, 0] },
  { geometry: "sphere", color: "#c6f432", position: [2.6, 1.5, -0.4], scale: 0.26 },
  { geometry: "capsule", color: "#ff4fd8", position: [2.9, -1.2, 0.3], scale: 0.3, rotation: [0.3, 0, 0.9] },
  { geometry: "cone", color: "#2b50ff", position: [-3.3, -0.3, 0.2], scale: 0.3, rotation: [0.4, 0, -0.5] },
  { geometry: "box", color: "#7b2bff", position: [0.9, 2.2, -1.4], scale: 0.24, rotation: [0.6, 0.7, 0] },
  { geometry: "sphere", color: "#2b50ff", position: [-1.2, -2.1, -1.2], scale: 0.16 },
];

function ShapeGeometry({ type }: { type: Shape["geometry"] }) {
  switch (type) {
    case "torus":
      return <torusGeometry args={[1, 0.38, 32, 96]} />;
    case "capsule":
      return <capsuleGeometry args={[0.55, 1.2, 12, 32]} />;
    case "cone":
      return <coneGeometry args={[0.8, 1.5, 48]} />;
    case "box":
      return <boxGeometry args={[1.2, 1.2, 1.2]} />;
    default:
      return <sphereGeometry args={[1, 48, 48]} />;
  }
}

type FloatingShapesProps = {
  /** Nombre d'objets affichés (réduit sur mobile) */
  count?: number;
  speed?: number;
  getProgress?: () => number;
};

export function FloatingShapes({ count = SHAPES.length, speed = 1, getProgress }: FloatingShapesProps) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    // Parallaxe souris + écartement au scroll
    const p = getProgress?.() ?? 0;
    g.position.x += (pointer.x * 0.25 - g.position.x) * 0.04;
    g.position.y += (pointer.y * 0.18 - g.position.y) * 0.04;
    const s = 1 + p * 0.5;
    g.scale.setScalar(g.scale.x + (s - g.scale.x) * 0.06);
  });

  return (
    <group ref={group}>
      {SHAPES.slice(0, count).map((shape, i) => (
        <Float key={i} speed={1.6 * speed} rotationIntensity={1.2 * speed} floatIntensity={1.4 * speed}>
          <mesh position={shape.position} scale={shape.scale} rotation={shape.rotation}>
            <ShapeGeometry type={shape.geometry} />
            <meshPhysicalMaterial
              color={shape.color}
              roughness={0.18}
              metalness={0.05}
              clearcoat={1}
              clearcoatRoughness={0.08}
              sheen={0.6}
              sheenColor="#ffffff"
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}
