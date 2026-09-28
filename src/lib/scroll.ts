import type Lenis from "lenis";

/**
 * État de scroll partagé, volontairement mutable (pas de state React) :
 * il est lu à chaque frame par les scènes WebGL et le marquee sans
 * provoquer le moindre re-render.
 */
export const scrollState = {
  /** Position de scroll en px */
  y: 0,
  /** Vitesse instantanée (px / frame) fournie par Lenis */
  velocity: 0,
  /** Progression globale 0 → 1 */
  progress: 0,
  /** Instance Lenis (null si reduced motion) */
  lenis: null as Lenis | null,
};

/** Scroll programmatique qui passe par Lenis quand il est actif */
export function scrollToTarget(target: number | string | HTMLElement, immediate = false) {
  if (scrollState.lenis) {
    scrollState.lenis.scrollTo(target, { immediate, duration: 1.6 });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
  } else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  }
}
