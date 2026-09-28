"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { isTransitionActive } from "@/lib/transition";
import { useApp } from "@/components/providers/AppProvider";

/**
 * Transition de page (Framer Motion) : un rideau encre se retire vers le
 * haut à chaque navigation, pendant que le contenu apparaît en fondu.
 * Désactivé pendant la transition « image → header » (qui a déjà son
 * propre effet) et au tout premier affichage (géré par le loader).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const { isLoaded, reducedMotion } = useApp();
  // Évalué une seule fois au montage de la page
  const [withCurtain] = useState(() => isLoaded && !reducedMotion && !isTransitionActive());

  if (!withCurtain) return <>{children}</>;

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-0 z-[110] origin-top bg-ink"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
      />
      {/* Pas de transform sur le contenu : cela casserait les éléments
          position: fixed et le pin ScrollTrigger de la galerie */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
        {children}
      </motion.div>
    </>
  );
}
