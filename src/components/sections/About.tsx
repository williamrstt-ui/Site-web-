"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useApp } from "@/components/providers/AppProvider";
import { useInView } from "@/hooks/useInView";
import { useWebGL } from "@/hooks/useWebGL";
import { site } from "@/data/site";

const AboutScene = dynamic(() => import("@/components/webgl/AboutScene"), { ssr: false });

const SKILLS = [
  { title: "Expertises", items: ["Stratégie de marque", "Direction artistique", "Social media", "Campagnes 360°"] },
  { title: "Outils", items: ["Suite Adobe", "Figma", "Canva", "Notion", "Meta Business Suite"] },
  { title: "Parcours", items: ["Master 1 Marketing", "Licence Marketing & Communication", "Projets associatifs"] },
];

/** Nettoie un mot pour le comparer à la liste des mots mis en avant */
const normalize = (w: string) => w.toLowerCase().replace(/[«»"“”.,!?;:]/g, "");

/**
 * À propos : la bio se colore mot par mot au rythme du scroll, avec un
 * nœud 3D irisé en arrière-plan.
 */
export function About() {
  const { lowPower, reducedMotion } = useApp();
  const hasWebGL = useWebGL();
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const progress = useRef(0);
  const inView = useInView(sectionRef);

  const highlights = site.highlight.map(normalize);
  const words = site.about.split(" ");

  useGSAP(
    () => {
      if (reducedMotion) return;
      // Chaque mot passe de 12 % à 100 % d'opacité, dans l'ordre de lecture
      gsap.fromTo(
        "[data-word]",
        { opacity: 0.12 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: textRef.current, start: "top 82%", end: "bottom 50%", scrub: true },
        },
      );
      // Progression de la section, lue par la scène 3D
      gsap.to(progress, {
        current: 1,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.from("[data-skill]", {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-skills]", start: "top 85%" },
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  const getProgress = useCallback(() => progress.current, []);

  return (
    <section
      ref={sectionRef}
      id="a-propos"
      aria-labelledby="about-title"
      // overflow-clip (et non hidden) : ne crée pas de conteneur de scroll, le sticky reste actif
      className="relative overflow-clip px-5 py-32 md:px-8 md:py-48"
    >
      {hasWebGL && (
        <div aria-hidden className="absolute inset-0 opacity-40 md:left-auto md:w-[50%] md:opacity-100">
          {/* Canvas « collant » : garde la taille d'un écran pendant toute la section */}
          <div className="sticky top-0 h-[100svh]">
            <AboutScene active={inView} lowPower={lowPower} reducedMotion={reducedMotion} getProgress={getProgress} />
          </div>
        </div>
      )}

      <div className="relative">
        <h2 id="about-title" className="mb-10 text-sm tracking-[0.2em] text-muted uppercase md:mb-16">
          (À propos)
        </h2>

        <p
          ref={textRef}
          className="max-w-[22ch] text-[8.5vw] leading-[1.05] font-medium tracking-[-0.035em] md:max-w-[19ch] md:text-[4.6vw]"
        >
          {words.map((word, i) => {
            const isHighlight = highlights.includes(normalize(word));
            return (
              <span key={i}>
                <span
                  data-word
                  className={isHighlight ? "text-iris font-serif font-normal tracking-[-0.01em] italic" : undefined}
                >
                  {word}
                </span>{" "}
              </span>
            );
          })}
        </p>

        <div data-skills className="mt-24 grid gap-10 border-t border-line pt-10 sm:grid-cols-3 md:mt-40">
          {SKILLS.map((group) => (
            <div key={group.title} data-skill>
              <h3 className="mb-4 font-serif text-2xl italic">{group.title}</h3>
              <ul className="space-y-1 text-muted">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
