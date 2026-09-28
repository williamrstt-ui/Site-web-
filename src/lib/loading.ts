"use client";

/**
 * Signal « la scène 3D a rendu sa première frame ».
 * Le loader attend ce signal (avec un délai max) avant de révéler le site,
 * pour éviter un flash de canvas vide.
 */
let ready = false;
const listeners = new Set<() => void>();

export function markSceneReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((l) => l());
}

export function onSceneReady(cb: () => void) {
  if (ready) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
