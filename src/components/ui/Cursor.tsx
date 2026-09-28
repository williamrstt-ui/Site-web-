"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { sounds } from "@/lib/sound";
import { useHasFinePointer } from "@/hooks/useMediaQuery";

type CursorMode = "default" | "hover" | "view";

/**
 * Curseur custom :
 * - un point qui suit la souris avec un léger retard (lerp GSAP)
 * - grossit sur tout élément cliquable (a, button, [data-cursor="hover"])
 * - devient une pastille « Voir » sur les projets ([data-cursor="view"])
 * Masqué automatiquement sur les écrans tactiles.
 */
export function Cursor() {
  const hasFinePointer = useHasFinePointer();
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<CursorMode>("default");
  const [label, setLabel] = useState("Voir");
  const [color, setColor] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasFinePointer || !ref.current) return;
    const el = ref.current;
    document.documentElement.classList.add("has-custom-cursor");

    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      setVisible(true);
    };

    // Détection par délégation : un seul listener pour toute la page
    let lastTarget: Element | null = null;
    const onOver = (e: PointerEvent) => {
      const target =
        (e.target as Element | null)?.closest<HTMLElement>(
          "[data-cursor], a, button, [role='button'], input, textarea, select, label",
        ) ?? null;
      if (target === lastTarget) return;
      lastTarget = target;

      if (!target || target.dataset.cursor === "none") {
        setMode("default");
        setColor(null);
        return;
      }
      if (target.dataset.cursor === "view") {
        setMode("view");
        setLabel(target.dataset.cursorLabel ?? "Voir");
        setColor(target.dataset.cursorColor ?? null);
      } else {
        setMode("hover");
        setColor(null);
      }
      sounds.hover();
    };

    const onLeaveWindow = () => setVisible(false);
    const onDown = () => gsap.to(el.firstElementChild, { scale: 0.8, duration: 0.2 });
    const onUp = () => gsap.to(el.firstElementChild, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [hasFinePointer]);

  if (!hasFinePointer) return null;

  const size = mode === "view" ? 104 : mode === "hover" ? 64 : 14;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[140]"
      // En mode « difference », le curseur blanc reste visible sur fond clair comme sombre
      style={{ opacity: visible ? 1 : 0, transition: "opacity .3s", mixBlendMode: mode === "view" ? "normal" : "difference" }}
    >
      <div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          background: mode === "hover" ? "transparent" : mode === "view" ? (color ?? "var(--color-ink)") : "#fff",
          border: mode === "hover" ? "1.5px solid #fff" : "0px solid transparent",
          transition:
            "width .5s var(--ease-expo), height .5s var(--ease-expo), background-color .4s, border-width .3s",
        }}
      >
        <span
          className="text-[11px] font-medium tracking-[0.18em] text-white uppercase"
          style={{
            opacity: mode === "view" ? 1 : 0,
            transform: `scale(${mode === "view" ? 1 : 0.4})`,
            transition: "opacity .3s, transform .5s var(--ease-expo)",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
