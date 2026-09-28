"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useApp } from "@/components/providers/AppProvider";
import { useHasFinePointer } from "@/hooks/useMediaQuery";

type MagneticProps = {
  children: ReactNode;
  /** Intensité de l'attraction (0 → 1) */
  strength?: number;
  className?: string;
};

/**
 * Enveloppe magnétique : l'enfant est attiré vers le curseur quand on
 * le survole, puis revient en place avec un rebond élastique.
 * Le contenu interne ([data-magnetic-inner]) bouge un peu plus pour
 * créer un effet de profondeur.
 */
export function Magnetic({ children, strength = 0.35, className = "" }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reducedMotion } = useApp();
  const fine = useHasFinePointer();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion || !fine) return;
    const inner = el.querySelector<HTMLElement>("[data-magnetic-inner]");

    const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.35)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.35)" });
    const ixTo = inner ? gsap.quickTo(inner, "x", { duration: 0.8, ease: "elastic.out(1, 0.35)" }) : null;
    const iyTo = inner ? gsap.quickTo(inner, "y", { duration: 0.8, ease: "elastic.out(1, 0.35)" }) : null;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
      ixTo?.(dx * strength * 0.4);
      iyTo?.(dy * strength * 0.4);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
      ixTo?.(0);
      iyTo?.(0);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength, reducedMotion, fine]);

  return (
    <span ref={ref} className={`inline-block will-change-transform ${className}`}>
      {children}
    </span>
  );
}
