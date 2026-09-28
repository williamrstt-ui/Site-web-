"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Magnetic } from "./Magnetic";
import { sounds } from "@/lib/sound";

type MagneticButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline";
  external?: boolean;
  className?: string;
};

/**
 * Bouton rond/pilule magnétique avec remplissage coloré au survol.
 * Rendu en <a> (lien externe / mailto) ou <Link> (navigation interne).
 */
export function MagneticButton({ href, children, variant = "solid", external, className = "" }: MagneticButtonProps) {
  const base =
    "group relative inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-5 text-base font-medium md:px-10 md:py-6 md:text-lg transition-colors duration-500";
  const styles =
    variant === "solid"
      ? "bg-ink text-paper"
      : "border border-ink/25 text-ink hover:text-paper";

  const content = (
    <>
      {/* Remplissage irisé qui monte depuis le bas */}
      <span
        aria-hidden
        className="absolute inset-0 translate-y-[101%] rounded-full bg-linear-to-r from-electric via-violet to-pink transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-y-0 group-focus-visible:translate-y-0"
      />
      <span data-magnetic-inner className="relative z-10 inline-flex items-center gap-3">
        {children}
      </span>
    </>
  );

  const shared = {
    className: `${base} ${styles} ${className}`,
    onClick: () => sounds.click(),
    "data-cursor": "hover",
  };

  return (
    <Magnetic>
      {external ? (
        <a href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer" {...shared}>
          {content}
        </a>
      ) : (
        <Link href={href} {...shared}>
          {content}
        </Link>
      )}
    </Magnetic>
  );
}
