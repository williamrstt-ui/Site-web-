"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/scroll";
import { useApp } from "@/components/providers/AppProvider";
import { Marquee } from "@/components/ui/Marquee";
import { Magnetic } from "@/components/ui/Magnetic";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { site } from "@/data/site";

/** Petite étoile graphique utilisée comme séparateur du marquee */
function Star({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className="mx-[3vw] h-[0.6em] w-[0.6em] shrink-0" style={{ color }}>
      <path
        fill="currentColor"
        d="M50 0c4 27 23 46 50 50-27 4-46 23-50 50-4-27-23-46-50-50C27 46 46 27 50 0Z"
      />
    </svg>
  );
}

/**
 * Contact : grand marquee infini, CTA magnétiques et réseaux sociaux.
 */
export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useApp();

  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.from("[data-contact-reveal]", {
        y: 60,
        opacity: 0,
        stagger: 0.08,
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-title"
      className="relative overflow-hidden rounded-t-[2rem] bg-ink pt-24 text-paper md:rounded-t-[3rem] md:pt-36"
    >
      <h2 id="contact-title" className="sr-only">
        Contact
      </h2>

      <p data-contact-reveal className="mb-10 px-5 text-sm tracking-[0.2em] text-paper/60 uppercase md:px-8">
        (Contact) — Un projet, une alternance, un café ?
      </p>

      {/* Marquee géant */}
      <div data-contact-reveal className="text-[18vw] leading-none font-medium tracking-[-0.05em] md:text-[12vw]">
        <Marquee speed={80}>
          <span className="whitespace-nowrap">Créons</span>
          <Star color="#ff4fd8" />
          <span className="font-serif font-normal whitespace-nowrap italic">ensemble</span>
          <Star color="#2b50ff" />
          <span className="whitespace-nowrap">l&apos;inoubliable</span>
          <Star color="#ff6a1f" />
        </Marquee>
      </div>

      <div className="mt-16 grid gap-12 px-5 pb-10 md:mt-24 md:grid-cols-[1.2fr_1fr] md:px-8">
        <div data-contact-reveal className="flex flex-wrap items-center gap-4">
          <MagneticButton href={`mailto:${site.email}`} external variant="outline" className="border-paper/30! text-paper!">
            {site.email}
            <span aria-hidden>↗</span>
          </MagneticButton>
        </div>

        <ul data-contact-reveal className="flex flex-wrap items-center gap-3 md:justify-end" aria-label="Réseaux sociaux">
          {site.socials.map((s) => (
            <li key={s.label}>
              <Magnetic strength={0.5}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="hover"
                  className="inline-flex h-24 w-24 items-center justify-center rounded-full border border-paper/25 text-sm transition-colors duration-500 hover:border-transparent hover:bg-paper hover:text-ink md:h-28 md:w-28"
                >
                  <span data-magnetic-inner>{s.label}</span>
                </a>
              </Magnetic>
            </li>
          ))}
        </ul>
      </div>

      <footer className="flex flex-col gap-4 border-t border-paper/15 px-5 py-6 text-sm text-paper/60 md:flex-row md:items-center md:justify-between md:px-8">
        <p>
          © {new Date().getFullYear()} {site.firstName} {site.lastName} — Tous droits réservés
        </p>
        <p className="font-serif text-base italic">Conçu avec curiosité, WebGL & beaucoup de café.</p>
        <button
          type="button"
          onClick={() => scrollToTarget(0)}
          className="self-start text-paper underline-offset-4 hover:underline md:self-auto"
        >
          Retour en haut ↑
        </button>
      </footer>
    </section>
  );
}
