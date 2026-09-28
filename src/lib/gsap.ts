"use client";

/**
 * Point d'entrée unique pour GSAP : on enregistre les plugins une seule
 * fois côté client et on ré-exporte tout depuis ici.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.defaults({ ease: "expo.out", duration: 1.2 });
}

export { gsap, ScrollTrigger, useGSAP };
