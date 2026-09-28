"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { imagePlaneFragmentShader, imagePlaneVertexShader } from "./shaders/imagePlane";
import type { GalleryItemState } from "./galleryState";

const CAMERA_Z = 800;

/**
 * Caméra en perspective dont le champ de vision est calculé pour que
 * 1 unité 3D = 1 pixel CSS : les plans se calent exactement sur le DOM
 * tout en gardant de la profondeur pour les courbures.
 */
function PixelPerfectCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(0, 0, CAMERA_Z);
    cam.fov = (2 * Math.atan(size.height / 2 / CAMERA_Z) * 180) / Math.PI;
    cam.near = 1;
    cam.far = 3000;
    cam.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

type Shared = { velocity: number; canvasRect: DOMRect | null };

/** Mesure la vitesse horizontale réelle de la galerie (px / frame) */
function VelocityTracker({ items, shared }: { items: GalleryItemState[]; shared: Shared }) {
  const { gl } = useThree();
  const prev = useRef<number | null>(null);
  useFrame(() => {
    shared.canvasRect = gl.domElement.getBoundingClientRect();
    const el = items[0]?.el;
    if (!el) return;
    const left = el.getBoundingClientRect().left;
    const delta = prev.current === null ? 0 : prev.current - left;
    prev.current = left;
    const target = THREE.MathUtils.clamp(delta / 60, -1, 1);
    shared.velocity += (target - shared.velocity) * 0.1;
  }, -1); // priorité : avant les plans
  return null;
}

function ImagePlane({ texture, item, shared }: { texture: THREE.Texture; item: GalleryItemState; shared: Shared }) {
  const mesh = useRef<THREE.Mesh>(null);
  const { size } = useThree();

  const uniforms = useMemo(() => {
    const image = texture.image as { width: number; height: number };
    return {
      uTexture: { value: texture },
      uImageSize: { value: new THREE.Vector2(image.width, image.height) },
      uPlaneSize: { value: new THREE.Vector2(1, 1) },
      uHover: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uVelocity: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 1 },
    };
  }, [texture]);

  useFrame((_, delta) => {
    const m = mesh.current;
    const c = shared.canvasRect;
    if (!m || !item.el || !c) return;
    const r = item.el.getBoundingClientRect();

    // Culling : inutile de dessiner les images hors écran
    m.visible = r.right > c.left - 200 && r.left < c.right + 200;
    if (!m.visible) return;

    // Positionnement DOM → 3D (origine au centre du canvas, y vers le haut)
    m.scale.set(r.width, r.height, 1);
    m.position.x = r.left - c.left + r.width / 2 - size.width / 2;
    m.position.y = -(r.top - c.top + r.height / 2) + size.height / 2;

    const u = uniforms;
    u.uPlaneSize.value.set(r.width, r.height);
    u.uTime.value += delta;
    u.uHover.value += (item.hover - u.uHover.value) * 0.08;
    u.uMouse.value.x += (item.mouse.x - u.uMouse.value.x) * 0.1;
    u.uMouse.value.y += (item.mouse.y - u.uMouse.value.y) * 0.1;
    u.uVelocity.value = shared.velocity;
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        vertexShader={imagePlaneVertexShader}
        fragmentShader={imagePlaneFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

function Planes({ srcs, items, onReady }: { srcs: string[]; items: GalleryItemState[]; onReady: () => void }) {
  const textures = useTexture(srcs);
  const { gl } = useThree();
  const shared = useMemo<Shared>(() => ({ velocity: 0, canvasRect: null }), []);

  useEffect(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      t.needsUpdate = true;
    });
    // Envoie les textures au GPU tout de suite pour éviter un à-coup au 1er affichage
    textures.forEach((t) => gl.initTexture(t));
    onReady();
  }, [textures, gl, onReady]);

  return (
    <>
      <VelocityTracker items={items} shared={shared} />
      {textures.map((t, i) => (
        <ImagePlane key={srcs[i]} texture={t} item={items[i]} shared={shared} />
      ))}
    </>
  );
}

type GalleryCanvasProps = {
  srcs: string[];
  items: GalleryItemState[];
  active: boolean;
  onReady: () => void;
};

/** Canvas superposé à la galerie : un plan WebGL par image */
export default function GalleryCanvas({ srcs, items, active, onReady }: GalleryCanvasProps) {
  return (
    <Canvas
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <PixelPerfectCamera />
      <Suspense fallback={null}>
        <Planes srcs={srcs} items={items} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
