"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { releaseTransition, subscribeTransition, type TransitionPayload } from "@/lib/transition";
import { sounds } from "@/lib/sound";

/**
 * Overlay persistant (monté dans le layout) qui réalise la transition
 * « l'image cliquée s'agrandit jusqu'à devenir le header du projet ».
 *
 * Séquence : clone à la position de la carte → plein écran → navigation
 * → la page projet signale qu'elle est prête → fondu du clone.
 */
export function ProjectTransition() {
  const router = useRouter();
  const [payload, setPayload] = useState<TransitionPayload | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const state = useRef({ expanded: false, endRequested: false, fading: false });

  /** Fondu final, déclenché une seule fois quand les deux conditions sont réunies */
  const tryFinish = useRef(() => {});
  tryFinish.current = () => {
    const s = state.current;
    if (!s.expanded || !s.endRequested || s.fading || !boxRef.current) return;
    s.fading = true;
    gsap.to(boxRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => {
        setPayload(null);
        releaseTransition();
      },
    });
  };

  useEffect(
    () =>
      subscribeTransition((event) => {
        if (event.type === "start") {
          state.current = { expanded: false, endRequested: false, fading: false };
          setPayload(event.payload);
        } else {
          state.current.endRequested = true;
          tryFinish.current();
        }
      }),
    [],
  );

  // Agrandissement dès que le clone est monté
  useEffect(() => {
    const box = boxRef.current;
    if (!payload || !box) return;
    const { rect, href } = payload;
    sounds.whoosh();
    router.prefetch(href);

    const tl = gsap.timeline();
    tl.set(box, { top: rect.top, left: rect.left, width: rect.width, height: rect.height, opacity: 1, borderRadius: 12 })
      .to(box, {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        borderRadius: 0,
        duration: 1.1,
        ease: "expo.inOut",
      })
      .fromTo(imgRef.current, { scale: 1.12 }, { scale: 1, duration: 1.1, ease: "expo.inOut" }, 0)
      .add(() => {
        state.current.expanded = true;
        router.push(href, { scroll: false });
        tryFinish.current();
      });

    // Filet de sécurité si la page projet ne signale jamais qu'elle est prête
    const safety = window.setTimeout(() => {
      state.current.expanded = true;
      state.current.endRequested = true;
      tryFinish.current();
    }, 5000);

    return () => {
      tl.kill();
      window.clearTimeout(safety);
    };
  }, [payload, router]);

  if (!payload) return null;

  return (
    <div
      ref={boxRef}
      aria-hidden
      className="pointer-events-none fixed z-[120] overflow-hidden"
      style={{ background: payload.color, opacity: 0 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- clone de l'image déjà chargée par next/image */}
      <img ref={imgRef} src={payload.src} alt="" className="h-full w-full object-cover" />
    </div>
  );
}
