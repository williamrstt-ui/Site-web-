"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { onSceneReady } from "@/lib/loading";
import { useApp } from "@/components/providers/AppProvider";
import { site } from "@/data/site";

/** Couleurs des rideaux successifs qui se lèvent après le 100 % */
const CURTAINS = ["#2b50ff", "#ff4fd8", "#ff6a1f"];

/**
 * Loader : compteur 0 → 100 % piloté par le chargement réel
 * (polices, window.load, 1re frame WebGL), puis révélation par
 * une cascade de rideaux colorés.
 */
export function Loader() {
  const { setLoaded, reducedMotion, isLoaded } = useApp();
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isLoaded) return;
    const root = rootRef.current;
    if (!root) return;

    // Progression cible : grimpe doucement puis saute aux jalons réels
    let target = 0;
    const shown = { value: 0 };
    // Seule l'accueil a une scène 3D à attendre
    const milestones = { fonts: false, window: false, scene: pathname !== "/" };

    const recompute = () => {
      const reached = 30 + (milestones.fonts ? 20 : 0) + (milestones.window ? 20 : 0) + (milestones.scene ? 30 : 0);
      target = Math.max(target, reached);
    };

    document.fonts?.ready.then(() => {
      milestones.fonts = true;
      recompute();
    });
    const onLoad = () => {
      milestones.window = true;
      recompute();
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
    const offScene = onSceneReady(() => {
      milestones.scene = true;
      recompute();
    });
    // Filet de sécurité : jamais plus de 4,5 s de loader
    const safety = window.setTimeout(() => (target = 100), 4500);
    // Montée « organique » au démarrage
    const creep = window.setInterval(() => (target = Math.max(target, Math.min(target + 3, 90))), 90);

    let finished = false;
    const tick = (_time: number, deltaMs: number) => {
      // Le compteur rattrape la cible avec un lissage exponentiel indépendant des fps
      const k = reducedMotion ? 1 : 1 - Math.exp(-deltaMs / 220);
      shown.value += (target - shown.value) * k;
      const v = Math.min(100, Math.round(shown.value + (target === 100 ? 0.5 : 0)));
      if (counterRef.current) counterRef.current.textContent = String(v).padStart(3, "0");
      if (barRef.current) barRef.current.style.transform = `scaleX(${v / 100})`;
      if (v >= 100 && !finished) {
        finished = true;
        reveal();
      }
    };
    gsap.ticker.add(tick);

    const reveal = () => {
      gsap.ticker.remove(tick);
      if (reducedMotion) {
        gsap.to(root, { autoAlpha: 0, duration: 0.3, onStart: setLoaded, onComplete: () => setDone(true) });
        return;
      }
      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({ onComplete: () => setDone(true) });
      tl.to(q("[data-loader-content]"), { yPercent: -120, duration: 0.9, ease: "expo.in", stagger: 0.05 })
        // Le panneau blanc puis chaque rideau coloré se lèvent en cascade
        .to(q("[data-loader-panel]"), {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1.1,
          ease: "expo.inOut",
          stagger: 0.12,
        }, "-=0.25")
        .add(setLoaded, "-=0.9");
    };

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("load", onLoad);
      window.clearTimeout(safety);
      window.clearInterval(creep);
      offScene();
    };
    // Le loader ne s'exécute qu'au premier affichage : pathname est lu une fois
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, reducedMotion, setLoaded]);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[150]"
      role="status"
      aria-live="polite"
      aria-label="Chargement du site"
    >
      {/* Panneau principal : le premier à se lever (l'ordre DOM = l'ordre d'animation) */}
      <div
        data-loader-panel
        className="absolute inset-0 flex flex-col justify-between bg-paper p-5 md:p-10"
        style={{ clipPath: "inset(0% 0% 0% 0%)", zIndex: 10 }}
      >
        <div className="flex items-start justify-between overflow-hidden text-sm uppercase tracking-[0.2em]">
          <span data-loader-content>
            {site.firstName} {site.lastName}
          </span>
          <span data-loader-content className="text-muted">
            Portfolio — {new Date().getFullYear()}
          </span>
        </div>

        <div className="overflow-hidden">
          <div data-loader-content className="flex items-end justify-between gap-6">
            <span className="font-serif text-2xl italic md:text-4xl">Chargement de l&apos;univers</span>
            <span className="font-sans text-[26vw] leading-[0.8] font-medium tracking-[-0.06em] tabular-nums md:text-[18vw]">
              <span ref={counterRef}>000</span>
              <span className="text-iris pr-[0.1em] align-top text-[0.3em]">%</span>
            </span>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden">
          <div
            ref={barRef}
            className="h-full origin-left bg-linear-to-r from-electric via-pink to-orange"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>

      {/* Rideaux colorés, révélés puis levés à leur tour */}
      {CURTAINS.map((c, i) => (
        <div
          key={c}
          data-loader-panel
          className="absolute inset-0"
          style={{ background: c, clipPath: "inset(0% 0% 0% 0%)", zIndex: 9 - i }}
        />
      ))}
    </div>
  );
}
