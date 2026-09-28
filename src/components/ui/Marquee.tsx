"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll";
import { useApp } from "@/components/providers/AppProvider";

type MarqueeProps = {
  children: ReactNode;
  /** Vitesse de base en px / seconde */
  speed?: number;
  /** Nombre de copies du contenu (assez pour couvrir 2 écrans) */
  repeat?: number;
  /** Sens initial : 1 = vers la gauche, -1 = vers la droite */
  direction?: 1 | -1;
  className?: string;
};

/**
 * Texte défilant infini. La vitesse accélère avec la vélocité du scroll
 * et le sens s'inverse quand on remonte la page.
 */
export function Marquee({ children, speed = 90, repeat = 4, direction = 1, className = "" }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useApp();

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reducedMotion) return;

    let x = 0;
    let dir: number = direction;
    let boost = 0;

    const tick = (_t: number, deltaMs: number) => {
      // Largeur d'une copie : on boucle dès qu'on l'a parcourue
      const width = track.scrollWidth / repeat;
      const v = scrollState.velocity;
      if (Math.abs(v) > 0.5) dir = (v > 0 ? 1 : -1) * direction;
      boost += (Math.min(Math.abs(v) * 0.6, 12) - boost) * 0.08;

      x -= ((speed * deltaMs) / 1000) * (1 + boost) * dir;
      if (x <= -width) x += width;
      if (x > 0) x -= width;
      track.style.transform = `translate3d(${x}px,0,0)`;
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [speed, repeat, direction, reducedMotion]);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div ref={trackRef} className="marquee-track">
        {Array.from({ length: repeat }).map((_, i) => (
          // Seule la 1re copie est lue par les lecteurs d'écran
          <div key={i} aria-hidden={i > 0} className="flex shrink-0 items-center">
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
