/**
 * Informations générales du site : identité, textes et liens.
 * Modifiez ici votre bio, votre email et vos réseaux.
 */
export const site = {
  firstName: "William",
  lastName: "Rosset",
  role: "Étudiant en Master 1 Marketing",
  baseline: "Direction artistique · Identités de marque · Campagnes · Contenus",
  location: "France",
  email: "hello@williamrosset.com", // ← remplacez par votre adresse
  about:
    "Je crois que le marketing le plus efficace est celui qu'on a envie de regarder. Entre stratégie et création, je conçois des marques, des campagnes et des images qui racontent une histoire, suscitent une émotion et donnent envie d'agir. Curieux, exigeant et obsédé par le détail, je cherche aujourd'hui une alternance ou un stage pour continuer à créer ce qui fait « wow ».",
  /** Mots de la bio mis en couleur quand ils se révèlent */
  highlight: ["marketing", "regarder.", "émotion", "wow"],
  socials: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "LinkedIn", href: "https://linkedin.com/" },
    { label: "Behance", href: "https://behance.net/" },
  ],
} as const;
