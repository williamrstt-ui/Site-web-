"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollState, scrollToTarget } from "@/lib/scroll";
import { useApp } from "./AppProvider";

/**
 * Scroll fluide Lenis, synchronisé sur le ticker GSAP pour que
 * ScrollTrigger, Lenis et les animations tournent sur la même frame.
 * Désactivé si l'utilisateur préfère réduire les animations.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const { reducedMotion, isLoaded } = useApp();
  const pathname = usePathname();

  useEffect(() => {
    // Mise à jour de l'état partagé même sans Lenis
    const onNativeScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollState.y = window.scrollY;
      scrollState.progress = max > 0 ? window.scrollY / max : 0;
    };

    if (reducedMotion) {
      window.addEventListener("scroll", onNativeScroll, { passive: true });
      return () => window.removeEventListener("scroll", onNativeScroll);
    }

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });
    scrollState.lenis = lenis;

    lenis.on("scroll", (l: Lenis) => {
      scrollState.y = l.scroll;
      scrollState.velocity = l.velocity;
      scrollState.progress = l.progress;
      ScrollTrigger.update();
    });

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      scrollState.lenis = null;
      scrollState.velocity = 0;
    };
  }, [reducedMotion]);

  // Bloque le scroll pendant le loader
  useEffect(() => {
    const lenis = scrollState.lenis;
    if (!isLoaded) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
  }, [isLoaded, reducedMotion]);

  // Retour en haut à chaque changement de page (ou vers l'ancre demandée)
  useEffect(() => {
    scrollState.lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    // Laisse le temps au DOM de la nouvelle page de se poser
    const id = window.setTimeout(() => {
      ScrollTrigger.refresh();
      const hash = window.location.hash;
      if (hash && document.querySelector(hash)) scrollToTarget(hash, true);
    }, 150);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return <>{children}</>;
}
