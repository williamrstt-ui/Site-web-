"use client";

import { createElement, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useApp } from "@/components/providers/AppProvider";

type SplitRevealProps = {
  text: string;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
  className?: string;
  /** Classe appliquée à chaque lettre (ex. police serif italique) */
  charClassName?: string;
  /** Déclenche l'animation quand passe à true */
  play?: boolean;
  delay?: number;
  stagger?: number;
};

/**
 * Découpe un texte en lettres masquées et les révèle une par une.
 * Le texte complet reste lisible par les lecteurs d'écran (span sr-only),
 * les lettres découpées sont masquées de l'arbre d'accessibilité.
 */
export function SplitReveal({
  text,
  as = "span",
  className = "",
  charClassName = "",
  play = true,
  delay = 0,
  stagger = 0.035,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const { reducedMotion } = useApp();

  useEffect(() => {
    const el = ref.current;
    if (!el || !play) return;
    const chars = el.querySelectorAll<HTMLElement>("[data-char]");
    if (reducedMotion) {
      gsap.set(chars, { y: 0, rotate: 0, opacity: 1 });
      return;
    }
    // GSAP lit l'état initial (translateY(110%) en ligne) comme un y en px
    const tween = gsap.to(chars, {
      y: 0,
      rotate: 0,
      opacity: 1,
      duration: 1.4,
      ease: "expo.out",
      stagger,
      delay,
    });
    return () => {
      tween.kill();
    };
  }, [play, delay, stagger, reducedMotion]);

  const words = text.split(" ");

  // Texte complet pour les lecteurs d'écran, lettres découpées masquées
  const content = (
    <>
      <span className="sr-only">{text}</span>
      {words.map((word, wi) => (
        <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
          {Array.from(word).map((char, ci) => (
            <span key={ci} className="reveal-mask">
              <span
                data-char
                className={`inline-block will-change-transform ${charClassName}`}
                style={{ transform: "translateY(110%) rotate(8deg)", opacity: 0 }}
              >
                {char}
              </span>
            </span>
          ))}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </>
  );

  return createElement(as, { ref, className }, content);
}
