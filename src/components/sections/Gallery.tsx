"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll";
import { projects } from "@/data/projects";
import { useApp } from "@/components/providers/AppProvider";
import { useInView } from "@/hooks/useInView";
import { useWebGL } from "@/hooks/useWebGL";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { createGalleryItems } from "@/components/webgl/galleryState";

const GalleryCanvas = dynamic(() => import("@/components/webgl/GalleryCanvas"), { ssr: false });

/**
 * Galerie des créations.
 * - Desktop : défilement horizontal piloté par le scroll vertical (pin
 *   ScrollTrigger) + plans WebGL qui ondulent au survol et se courbent
 *   avec la vitesse.
 * - Mobile : même défilement horizontal, images DOM avec skew CSS
 *   (pas de WebGL pour préserver la batterie).
 * - Reduced motion : simple grille, aucune animation.
 */
export function Gallery() {
  const { lowPower, reducedMotion } = useApp();
  const hasWebGL = useWebGL();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, "100px");
  const [glReady, setGlReady] = useState(false);

  const horizontal = !reducedMotion;
  const useGL = horizontal && hasWebGL && !lowPower;

  // Un état partagé par carte, stable pour toute la vie du composant
  const items = useMemo(() => createGalleryItems(projects.length), []);
  const srcs = useMemo(() => projects.map((p) => p.cover.src), []);
  const onReady = useCallback(() => setGlReady(true), []);

  useGSAP(
    () => {
      const track = trackRef.current;
      const section = sectionRef.current;
      if (!horizontal || !track || !section) return;

      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
          },
        },
      });

      // Mobile / sans WebGL : skew CSS proportionnel à la vitesse
      if (!useGL) {
        const cards = track.querySelectorAll("[data-card]");
        const skewTo = gsap.quickTo(cards, "skewX", { duration: 0.6, ease: "power3.out" });
        const tick = () => {
          skewTo(gsap.utils.clamp(-8, 8, scrollState.velocity * -0.4));
        };
        gsap.ticker.add(tick);
        return () => gsap.ticker.remove(tick);
      }
    },
    { scope: sectionRef, dependencies: [horizontal, useGL], revertOnUpdate: true },
  );

  return (
    <section
      ref={sectionRef}
      id="creations"
      aria-labelledby="creations-title"
      className={horizontal ? "relative h-[100svh] overflow-hidden" : "relative px-5 py-24 md:px-8"}
    >
      <div
        ref={trackRef}
        className={
          horizontal
            ? "flex h-full w-max items-center gap-[8vw] pr-[10vw] pl-5 will-change-transform md:gap-[6vw] md:pl-8"
            : "grid gap-16 md:grid-cols-2"
        }
      >
        {/* Bloc d'intro */}
        <header className={horizontal ? "w-[80vw] shrink-0 md:w-[34vw]" : "md:col-span-2"}>
          <p className="mb-6 text-sm tracking-[0.2em] text-muted uppercase">({String(projects.length).padStart(2, "0")}) Créations</p>
          <h2 id="creations-title" className="font-sans text-[13vw] leading-[0.85] font-medium tracking-[-0.05em] md:text-[6.5vw]">
            Sélection
            <br />
            <span className="text-iris font-serif font-normal tracking-[-0.02em] italic">de projets</span>
          </h2>
          <p className="mt-8 max-w-[38ch] text-base text-muted md:text-lg">
            Campagnes, identités, contenus et images. Chaque projet part d&apos;un insight marketing et
            se termine en émotion visuelle.
          </p>
        </header>

        {projects.map((project, i) => (
          <div
            key={project.slug}
            data-card
            className={
              horizontal
                ? `w-[74vw] shrink-0 md:w-[27vw] ${i % 2 === 1 ? "md:translate-y-[9vh]" : "md:-translate-y-[5vh]"}`
                : ""
            }
          >
            <ProjectCard
              project={project}
              index={i}
              glState={useGL ? items[i] : undefined}
              hideImage={useGL && glReady}
              sizes={horizontal ? "(max-width: 768px) 74vw, 27vw" : "(max-width: 768px) 100vw, 50vw"}
            />
          </div>
        ))}
      </div>

      {useGL && (
        <GalleryCanvas srcs={srcs} items={items} active={inView} onReady={onReady} />
      )}

      {horizontal && (
        <div aria-hidden className="absolute inset-x-5 bottom-6 h-px bg-ink/10 md:inset-x-8 md:bottom-8">
          <div ref={barRef} className="h-full origin-left bg-ink" style={{ transform: "scaleX(0)" }} />
        </div>
      )}
    </section>
  );
}
