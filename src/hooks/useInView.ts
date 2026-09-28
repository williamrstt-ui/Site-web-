"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Indique si un élément est (presque) visible. Sert à mettre en pause
 * les canvas WebGL hors écran pour économiser GPU et batterie.
 */
export function useInView(ref: RefObject<Element | null>, rootMargin = "200px") {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
