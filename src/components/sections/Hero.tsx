"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollState, scrollToTarget } from "@/lib/scroll";
import { markSceneReady } from "@/lib/loading";
import { useApp } from "@/components/providers/AppProvider";
import { useInView } from "@/hooks/useInView";
import { useWebGL } from "@/hooks/useWebGL";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { site } from "@/data/site";

// La 3D n'est chargée que côté client, dans son propre chunk
const HeroScene = dynamic(() => import("@/components/webgl/HeroScene"), { ssr: false });

/**
 * Hero plein écran : scène WebGL + nom géant révélé lettre par lettre.
 * Le texte est en mix-blend-difference : noir sur le fond blanc, négatif
 * coloré quand il passe devant le blob.
 */
export function Hero() {
  const { isLoaded, lowPower, reducedMotion } = useApp();
  const hasWebGL = useWebGL();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, "0px");

  // Sans WebGL, on ne fait pas attendre le loader
  useEffect(() => {
    if (!hasWebGL) {
      const id = window.setTimeout(markSceneReady, 300);
      return () => window.clearTimeout(id);
    }
  }, [hasWebGL]);

  const getProgress = useCallback(() => {
    const h = typeof window === "undefined" ? 1 : window.innerHeight;
    return Math.min(Math.max(scrollState.y / h, 0), 1);
  }, []);

  // Parallaxe de sortie : le nom monte et s'estompe
  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.to("[data-hero-parallax]", {
        yPercent: -35,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-hero-fade]", {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "40% top", scrub: true },
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  // Apparition des infos secondaires après le loader
  useGSAP(
    () => {
      if (!isLoaded) return;
      gsap.from("[data-hero-meta]", {
        y: 24,
        opacity: 0,
        duration: 1.2,
        stagger: 0.08,
        delay: reducedMotion ? 0 : 0.9,
      });
    },
    { scope: sectionRef, dependencies: [isLoaded] },
  );

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-label="Introduction"
      // Le fond paper est porté par la section : le mix-blend-difference du nom
      // a ainsi toujours une toile de fond, même dans un contexte isolé
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-paper"
    >
      {/* Halo CSS : fallback sans WebGL et fond pendant le chargement */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 h-[55vmin] w-[55vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-opacity duration-1000"
        style={{
          background: "conic-gradient(from 90deg, #2b50ff, #7b2bff, #ff4fd8, #ff6a1f, #2b50ff)",
          opacity: hasWebGL && isLoaded ? 0 : 0.7,
        }}
      />

      {hasWebGL && (
        <div className="absolute inset-0">
          <HeroScene lowPower={lowPower} reducedMotion={reducedMotion} getProgress={getProgress} active={inView} />
        </div>
      )}

      {/* Contenu éditorial — surtout pas de z-index ici : il isolerait le
          mix-blend-difference du canvas et le nom deviendrait invisible */}
      <div className="pointer-events-none relative flex h-full flex-col justify-end px-5 pb-6 md:px-8 md:pb-8">
        <div data-hero-parallax className="text-white mix-blend-difference">
          <h1 className="display font-sans font-medium uppercase">
            <SplitReveal text={site.firstName} play={isLoaded} delay={0.2} className="block" />
            <SplitReveal
              text={site.lastName}
              play={isLoaded}
              delay={0.45}
              className="block text-right"
              charClassName="font-serif normal-case italic tracking-[-0.02em]"
            />
          </h1>
        </div>

        <div data-hero-fade className="mt-6 grid grid-cols-2 items-end gap-4 text-sm md:mt-10 md:grid-cols-3">
          <p data-hero-meta className="max-w-[32ch] text-ink">
            <span className="font-serif text-lg italic">{site.role}</span>
            <br />
            <span className="text-muted">{site.baseline}</span>
          </p>
          <p data-hero-meta className="hidden text-center text-muted md:block">
            Basé en {site.location} — disponible pour une alternance
          </p>
          <button
            type="button"
            data-hero-meta
            onClick={() => scrollToTarget("#creations")}
            className="pointer-events-auto flex items-center justify-self-end gap-3 text-ink"
          >
            <span>Découvrir</span>
            <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-ink/15">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollhint_1.8s_var(--ease-quart)_infinite] bg-ink" />
            </span>
          </button>
        </div>
      </div>

      <style>{`@keyframes scrollhint { 0% { transform: translateY(-100%) } 100% { transform: translateY(200%) } }`}</style>
    </section>
  );
}
