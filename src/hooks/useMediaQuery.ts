"use client";

import { useSyncExternalStore } from "react";

/**
 * Media query réactive, compatible SSR (renvoie `serverValue` côté serveur
 * puis la vraie valeur après hydratation, sans avertissement).
 */
export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** L'utilisateur a demandé à réduire les animations */
export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

/** Écran tactile / petit écran → on sert une 3D allégée */
export const useIsLowPower = () => useMediaQuery("(hover: none), (pointer: coarse), (max-width: 767px)");

/** Souris précise disponible → curseur custom */
export const useHasFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)");
