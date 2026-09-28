"use client";

import { useSyncExternalStore } from "react";

let cached: boolean | null = null;

function detect() {
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement("canvas");
    cached = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    cached = false;
  }
  return cached;
}

/** true si le navigateur supporte WebGL (false côté serveur) */
export function useWebGL() {
  return useSyncExternalStore(
    () => () => {},
    detect,
    () => false,
  );
}
