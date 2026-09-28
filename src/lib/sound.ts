"use client";

/**
 * Micro-sons synthétisés avec la Web Audio API : aucun fichier à charger.
 * Désactivés par défaut, activables via le bouton « Son » du header.
 */

let ctx: AudioContext | null = null;
let enabled = false;

export function setSoundEnabled(value: boolean) {
  enabled = value;
  if (value && !ctx && typeof window !== "undefined") {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = AC ? new AC() : null;
  }
  if (value) ctx?.resume();
}

type Blip = { freq: number; to?: number; duration?: number; gain?: number; type?: OscillatorType };

function blip({ freq, to = freq, duration = 0.08, gain = 0.04, type = "sine" }: Blip) {
  if (!enabled || !ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(to, now + duration);
  amp.gain.setValueAtTime(0, now);
  amp.gain.linearRampToValueAtTime(gain, now + 0.005);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(amp).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export const sounds = {
  /** Survol d'un élément interactif */
  hover: () => blip({ freq: 1800, to: 2400, duration: 0.05, gain: 0.018 }),
  /** Clic */
  click: () => blip({ freq: 520, to: 180, duration: 0.14, gain: 0.05, type: "triangle" }),
  /** Ouverture d'un projet */
  whoosh: () => blip({ freq: 180, to: 900, duration: 0.45, gain: 0.03, type: "sine" }),
};
