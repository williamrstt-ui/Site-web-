"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type MouseEvent, type PointerEvent } from "react";
import type { Project } from "@/data/projects";
import type { GalleryItemState } from "@/components/webgl/galleryState";
import { startProjectTransition } from "@/lib/transition";
import { sounds } from "@/lib/sound";
import { useApp } from "@/components/providers/AppProvider";

type ProjectCardProps = {
  project: Project;
  index: number;
  /** État partagé avec le plan WebGL (absent en mode DOM seul) */
  glState?: GalleryItemState;
  /** L'image DOM est masquée quand le plan WebGL prend le relais */
  hideImage?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Carte projet réutilisable : lien accessible vers la page projet,
 * curseur « Voir » coloré, et déclenchement de la transition image → header.
 */
export function ProjectCard({
  project,
  index,
  glState,
  hideImage = false,
  className = "",
  sizes = "(max-width: 768px) 78vw, 34vw",
  priority,
}: ProjectCardProps) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useApp();
  const href = `/projets/${project.slug}`;

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    sounds.click();
    // Ctrl/Cmd-clic, clic molette… : comportement natif (nouvel onglet)
    if (reducedMotion || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const media = mediaRef.current;
    if (!media) return;
    e.preventDefault();
    const r = media.getBoundingClientRect();
    const img = media.querySelector("img");
    startProjectTransition({
      href,
      src: img?.currentSrc || project.cover.src,
      alt: project.cover.alt,
      color: project.color,
      rect: { top: r.top, left: r.left, width: r.width, height: r.height },
    });
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!glState || !mediaRef.current) return;
    const r = mediaRef.current.getBoundingClientRect();
    glState.mouse.x = (e.clientX - r.left) / r.width;
    glState.mouse.y = 1 - (e.clientY - r.top) / r.height;
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      onPointerEnter={() => glState && (glState.hover = 1)}
      onPointerLeave={() => glState && (glState.hover = 0)}
      onPointerMove={onPointerMove}
      onFocus={() => glState && (glState.hover = 1)}
      onBlur={() => glState && (glState.hover = 0)}
      data-cursor="view"
      data-cursor-color={project.color}
      aria-label={`${project.title} — ${project.category}, ${project.year}`}
      className={`group block ${className}`}
    >
      <div
        ref={(el) => {
          mediaRef.current = el;
          if (glState) glState.el = el;
        }}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-xl"
        style={{ background: `${project.color}22` }}
      >
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-expo)] ${
            hideImage ? "opacity-0" : "group-hover:scale-[1.04]"
          }`}
        />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4 text-xs text-muted uppercase md:mt-5 md:text-sm">
        <span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
        <p className="text-right">
          {project.category}
          <span className="mx-2" aria-hidden>
            ·
          </span>
          {project.year}
        </p>
      </div>
      <h3 className="mt-2 font-serif text-4xl leading-none italic md:text-5xl">{project.title}</h3>
      {/* Pastille de couleur qui s'étire au survol */}
      <span
        aria-hidden
        className="mt-3 block h-[2px] w-0 transition-[width] duration-700 ease-[var(--ease-expo)] group-hover:w-full group-focus-visible:w-full"
        style={{ background: project.color }}
      />
    </Link>
  );
}
