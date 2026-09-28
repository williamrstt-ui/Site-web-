"use client";

/**
 * Position du pointeur normalisée (-1 → 1), écoutée une seule fois sur
 * window. Les canvas WebGL étant sous le contenu (pointer-events: none),
 * ils lisent cette valeur plutôt que les événements R3F.
 */
export const pointer = { x: 0, y: 0, active: false };

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      pointer.active = true;
    },
    { passive: true },
  );
}
