"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useApp } from "@/components/providers/AppProvider";
import { scrollToTarget } from "@/lib/scroll";
import { sounds } from "@/lib/sound";
import { site } from "@/data/site";

const NAV = [
  { label: "Créations", hash: "#creations" },
  { label: "À propos", hash: "#a-propos" },
  { label: "Contact", hash: "#contact" },
];

/**
 * Header fixe minimal. Le texte passe en mode « difference » pour rester
 * lisible sur la 3D comme sur les images.
 */
export function Header() {
  const { isLoaded, soundOn, toggleSound } = useApp();
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={isLoaded ? { y: 0, opacity: 1 } : undefined}
      transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1], delay: 0.4 }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex items-start justify-between p-5 text-sm text-white mix-blend-difference md:p-8"
    >
      <Link
        href="/"
        className="pointer-events-auto group flex flex-col leading-tight"
        aria-label={`${site.firstName} ${site.lastName} — accueil`}
      >
        <span className="font-medium">
          {site.firstName} {site.lastName}
        </span>
        <span className="font-serif text-base italic opacity-70 transition-opacity group-hover:opacity-100">
          {site.role}
        </span>
      </Link>

      <nav aria-label="Navigation principale" className="pointer-events-auto flex items-center gap-5 md:gap-8">
        <ul className="hidden gap-6 md:flex">
          {NAV.map((item) => (
            <li key={item.hash}>
              <Link
                href={`/${item.hash}`}
                onClick={(e) => {
                  // Sur l'accueil : scroll fluide Lenis au lieu du saut natif
                  if (onHome) {
                    e.preventDefault();
                    scrollToTarget(item.hash);
                  }
                  sounds.click();
                }}
                className="relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:after:origin-left hover:after:scale-x-100"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? "Couper les sons" : "Activer les sons"}
          className="flex items-center gap-2"
        >
          <span className="flex h-3 items-end gap-[2px]" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="w-[2px] bg-current"
                style={{
                  height: soundOn ? undefined : 2,
                  animation: soundOn ? `eq 0.${6 + i}s ease-in-out ${i * 0.1}s infinite alternate` : "none",
                }}
              />
            ))}
          </span>
          <span>Son {soundOn ? "on" : "off"}</span>
        </button>
      </nav>

      <style>{`@keyframes eq { from { height: 2px } to { height: 12px } }`}</style>
    </motion.header>
  );
}
