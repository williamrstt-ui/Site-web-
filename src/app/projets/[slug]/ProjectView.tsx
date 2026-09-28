"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { endProjectTransition } from "@/lib/transition";
import { useApp } from "@/components/providers/AppProvider";
import { SplitReveal } from "@/components/ui/SplitReveal";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Magnetic } from "@/components/ui/Magnetic";
import { projects, type Project } from "@/data/projects";

type ProjectViewProps = { project: Project; next: Project };

/**
 * Page projet :
 * - header plein écran = même image que la carte cliquée (continuité de la transition)
 * - textes en parallaxe
 * - images révélées au scroll (clip-path + dé-zoom)
 * - projet suivant pour enchaîner sans revenir en arrière
 */
export function ProjectView({ project, next }: ProjectViewProps) {
  const rootRef = useRef<HTMLElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const { isLoaded, reducedMotion } = useApp();
  const [heroReady, setHeroReady] = useState(false);

  // Signale à l'overlay de transition que le header est affiché
  const onHeroLoad = () => {
    setHeroReady(true);
    endProjectTransition();
  };
  useEffect(() => {
    if (heroImgRef.current?.complete) onHeroLoad();
  }, []);

  useGSAP(
    () => {
      if (reducedMotion) return;

      // Parallaxe du header : l'image descend moins vite que la page
      gsap.to("[data-hero-image]", {
        yPercent: 22,
        ease: "none",
        scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-hero-title]", {
        yPercent: -60,
        ease: "none",
        scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: true },
      });

      // Textes en parallaxe (data-speed : >0 plus lent, <0 plus rapide)
      gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
        const speed = parseFloat(el.dataset.speed ?? "0");
        gsap.fromTo(
          el,
          { y: speed * 120 },
          {
            y: -speed * 120,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      // Révélation des images : le cadre s'ouvre et l'image dé-zoome
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        const img = el.querySelector("img");
        gsap.fromTo(
          el,
          { clipPath: "inset(18% 12% 18% 12% round 24px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 12px)",
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 95%", end: "top 35%", scrub: true },
          },
        );
        if (img)
          gsap.fromTo(
            img,
            { scale: 1.3 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
      });

      gsap.from("[data-fade]", {
        y: 40,
        opacity: 0,
        stagger: 0.08,
        scrollTrigger: { trigger: "[data-intro]", start: "top 80%" },
      });
    },
    { scope: rootRef, dependencies: [reducedMotion] },
  );

  const meta = [
    { label: "Année", value: project.year },
    { label: "Catégorie", value: project.category },
    { label: "Client", value: project.client },
    { label: "Rôle", value: project.role },
  ];

  return (
    <article ref={rootRef} style={{ ["--accent" as string]: project.color }}>
      {/* ── Header plein écran ─────────────────────────────── */}
      <header data-hero className="relative h-[100svh] w-full overflow-hidden" style={{ background: project.color }}>
        <div data-hero-image className="absolute inset-0">
          <Image
            ref={heroImgRef}
            src={project.cover.src}
            alt={project.cover.alt}
            fill
            priority
            sizes="100vw"
            onLoad={onHeroLoad}
            className="object-cover"
          />
        </div>
        {/* Voile pour garantir le contraste du titre */}
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-black/25" />

        <div className="absolute inset-x-0 bottom-0 px-5 pb-8 text-white md:px-8 md:pb-10">
          <div data-hero-title>
            <p className="mb-4 flex gap-4 text-sm tracking-[0.2em] uppercase">
              <span>{project.category}</span>
              <span aria-hidden>—</span>
              <span>{project.year}</span>
            </p>
            <SplitReveal
              as="h1"
              text={project.title}
              play={isLoaded && heroReady}
              delay={0.35}
              className="block font-serif text-[18vw] leading-[0.85] tracking-[-0.03em] italic md:text-[12vw]"
            />
          </div>
        </div>
      </header>

      {/* ── Introduction ───────────────────────────────────── */}
      <section data-intro className="grid gap-16 px-5 py-24 md:grid-cols-12 md:px-8 md:py-40">
        <div className="md:col-span-4">
          <Link
            href="/#creations"
            data-fade
            className="mb-12 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
          >
            <span aria-hidden>←</span> Tous les projets
          </Link>
          <dl data-speed="0.15" className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-1">
            {meta.map((m) => (
              <div key={m.label} data-fade>
                <dt className="mb-1 text-xs tracking-[0.2em] text-muted uppercase">{m.label}</dt>
                <dd className="text-lg">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="md:col-span-8">
          <p
            data-fade
            className="font-serif text-[9vw] leading-[1] tracking-[-0.02em] md:text-[4.4vw]"
          >
            {project.tagline}
          </p>
          <div data-speed="-0.1" className="mt-12 grid gap-6 text-lg leading-relaxed text-muted md:grid-cols-2">
            {project.description.map((paragraph, i) => (
              <p key={i} data-fade>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Images révélées au scroll ──────────────────────── */}
      <section aria-label="Images du projet" className="flex flex-col gap-10 px-5 pb-24 md:gap-24 md:px-8 md:pb-40">
        {project.gallery.map((image, i) => {
          const landscape = image.width >= image.height;
          return (
            <figure
              key={image.src}
              className={landscape ? "w-full" : `w-full md:w-[55%] ${i % 2 ? "md:ml-auto" : "md:ml-[12%]"}`}
            >
              <div
                data-reveal
                className="relative overflow-hidden rounded-xl"
                style={{ aspectRatio: `${image.width} / ${image.height}`, background: `${project.color}22` }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={landscape ? "100vw" : "(max-width: 768px) 100vw, 55vw"}
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 flex justify-between text-sm text-muted">
                <span>{image.alt}</span>
                <span className="tabular-nums">
                  {String(i + 1).padStart(2, "0")} / {String(project.gallery.length).padStart(2, "0")}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </section>

      {/* ── Projet suivant ─────────────────────────────────── */}
      <section
        aria-label="Projet suivant"
        className="flex flex-col items-center gap-10 border-t border-line px-5 py-24 md:px-8 md:py-36"
      >
        <p className="text-sm tracking-[0.2em] text-muted uppercase">Projet suivant</p>
        <div className="w-[min(86vw,440px)]">
          <ProjectCard project={next} index={projects.indexOf(next)} sizes="440px" />
        </div>
        <Magnetic>
          <Link
            href="/#creations"
            className="inline-flex rounded-full border border-ink/20 px-6 py-3 text-sm transition-colors hover:bg-ink hover:text-paper"
          >
            <span data-magnetic-inner>Retour à la galerie</span>
          </Link>
        </Magnetic>
      </section>
    </article>
  );
}
