"use client";

/**
 * Mini-store pour la transition « image → header de projet ».
 *
 * 1. La carte cliquée appelle `startProjectTransition()` avec la position
 *    de son image à l'écran.
 * 2. <ProjectTransition /> (monté dans le layout, donc persistant entre
 *    les routes) clone l'image, l'agrandit en plein écran puis navigue.
 * 3. La page projet appelle `endProjectTransition()` quand son header est
 *    prêt : le clone s'efface et révèle la vraie page, pixel pour pixel.
 */

export type TransitionPayload = {
  href: string;
  src: string;
  alt: string;
  color: string;
  rect: { top: number; left: number; width: number; height: number };
};

type Listener = (event: { type: "start"; payload: TransitionPayload } | { type: "end" }) => void;

const listeners = new Set<Listener>();
let active = false;

export const isTransitionActive = () => active;

export function startProjectTransition(payload: TransitionPayload) {
  if (active) return;
  active = true;
  listeners.forEach((l) => l({ type: "start", payload }));
}

export function endProjectTransition() {
  if (!active) return;
  listeners.forEach((l) => l({ type: "end" }));
}

/** Appelé par l'overlay quand il a fini de disparaître */
export function releaseTransition() {
  active = false;
}

export function subscribeTransition(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
