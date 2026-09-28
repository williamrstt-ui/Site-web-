/**
 * ─────────────────────────────────────────────────────────────
 *  PROJETS — le seul fichier à modifier pour ajouter une création
 * ─────────────────────────────────────────────────────────────
 *
 *  1. Déposez vos images dans /public/projects/<slug>/
 *  2. Ajoutez un objet dans le tableau `projects` ci-dessous.
 *  3. C'est tout : la galerie, la page projet et la navigation
 *     « projet suivant » sont générées automatiquement.
 *
 *  Conseils images : JPG/PNG en ~2000 px de large, next/image
 *  se charge de servir de l'AVIF/WebP à la bonne taille.
 */

export type ProjectImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Project = {
  /** Identifiant d'URL : /projets/<slug> */
  slug: string;
  title: string;
  year: string;
  category: string;
  /** Client, marque ou contexte (cours, concours, projet perso…) */
  client: string;
  /** Votre rôle sur le projet */
  role: string;
  /** Phrase d'accroche affichée sous le titre */
  tagline: string;
  /** Paragraphes de description (un élément = un paragraphe) */
  description: string[];
  /** Couleur d'accent du projet (curseur, détails, halo) */
  color: string;
  /** Image principale : vignette de la galerie + header de la page projet */
  cover: ProjectImage;
  /** Images supplémentaires révélées au scroll sur la page projet */
  gallery: ProjectImage[];
};

/* Petit utilitaire pour écrire les chemins d'images sans répétition */
const img = (slug: string, file: string, alt: string, width = 1600, height = 2000): ProjectImage => ({
  src: `/projects/${slug}/${file}`,
  alt,
  width,
  height,
});

export const projects: Project[] = [
  {
    slug: "neon-bloom",
    title: "Neon Bloom",
    year: "2025",
    category: "Campagne d'affichage",
    client: "Festival fictif — projet de cours",
    role: "Direction artistique, concept, déclinaisons",
    tagline: "Une campagne qui fait éclore la ville en couleurs.",
    description: [
      "Neon Bloom est une campagne d'affichage imaginée pour un festival de musique électronique. Le brief : attirer une cible 18-25 ans dans un paysage urbain saturé de messages.",
      "La réponse : des formes organiques et fluorescentes qui semblent pousser sur les murs, déclinées en affiches 4x3, abribus et formats sociaux animés.",
    ],
    color: "#FF4FD8",
    cover: img("neon-bloom", "cover.jpg", "Affiche principale de la campagne Neon Bloom"),
    gallery: [
      img("neon-bloom", "01.jpg", "Déclinaison abribus", 2000, 1250),
      img("neon-bloom", "02.jpg", "Série d'affiches", 1600, 2000),
      img("neon-bloom", "03.jpg", "Format réseaux sociaux", 2000, 1250),
    ],
  },
  {
    slug: "maison-sel",
    title: "Maison Sel",
    year: "2025",
    category: "Identité de marque",
    client: "Épicerie fine — étude de cas",
    role: "Stratégie de marque, logo, packaging",
    tagline: "Une identité minérale pour une épicerie de bord de mer.",
    description: [
      "Maison Sel est une identité complète pour une épicerie fine : plateforme de marque, logotype, système typographique et gamme de packagings.",
      "Le parti pris : un blanc éclatant comme le sel, ponctué d'un bleu électrique qui évoque l'océan et rend la marque immédiatement reconnaissable en rayon.",
    ],
    color: "#2B50FF",
    cover: img("maison-sel", "cover.jpg", "Packaging Maison Sel"),
    gallery: [
      img("maison-sel", "01.jpg", "Logotype et déclinaisons", 2000, 1250),
      img("maison-sel", "02.jpg", "Gamme de packagings", 1600, 2000),
      img("maison-sel", "03.jpg", "Charte graphique", 2000, 1250),
    ],
  },
  {
    slug: "pulse",
    title: "Pulse",
    year: "2024",
    category: "Social media",
    client: "Marque de sport — concours étudiant",
    role: "Stratégie de contenu, motion, copywriting",
    tagline: "Trente jours de contenus pour faire battre une communauté.",
    description: [
      "Pulse est une stratégie social media sur 30 jours pour le lancement d'une ligne de running. Ligne éditoriale, calendrier, formats courts et templates animés.",
      "Chaque contenu reprend un rythme cardiaque graphique qui devient la signature visuelle de la campagne.",
    ],
    color: "#FF6A1F",
    cover: img("pulse", "cover.jpg", "Visuel clé de la campagne Pulse"),
    gallery: [
      img("pulse", "01.jpg", "Grille Instagram", 2000, 1250),
      img("pulse", "02.jpg", "Story animée", 1600, 2000),
      img("pulse", "03.jpg", "Templates de contenus", 2000, 1250),
    ],
  },
  {
    slug: "lumen",
    title: "Lumen",
    year: "2024",
    category: "Photographie",
    client: "Série personnelle",
    role: "Photographie, retouche, édition",
    tagline: "La lumière comme matière première.",
    description: [
      "Lumen est une série photographique autour de la lumière artificielle et de la couleur dans l'espace urbain nocturne.",
      "Une recherche personnelle qui nourrit aujourd'hui mon approche de la direction artistique : chercher l'émotion avant l'information.",
    ],
    color: "#7B2BFF",
    cover: img("lumen", "cover.jpg", "Photographie de la série Lumen"),
    gallery: [
      img("lumen", "01.jpg", "Série Lumen, image 1", 2000, 1250),
      img("lumen", "02.jpg", "Série Lumen, image 2", 1600, 2000),
      img("lumen", "03.jpg", "Série Lumen, image 3", 2000, 1250),
    ],
  },
  {
    slug: "verde",
    title: "Verde",
    year: "2023",
    category: "Branding & packaging",
    client: "Start-up food — projet de groupe",
    role: "Chef de projet, direction artistique",
    tagline: "Rendre le végétal irrésistible.",
    description: [
      "Verde est une marque de snacks végétaux pensée pour la génération Z. Positionnement, nom, identité et packagings pop.",
      "Le projet a été présenté devant un jury de professionnels et a remporté le prix de la meilleure plateforme de marque.",
    ],
    color: "#1FBF6A",
    cover: img("verde", "cover.jpg", "Packaging de la marque Verde"),
    gallery: [
      img("verde", "01.jpg", "Plateforme de marque", 2000, 1250),
      img("verde", "02.jpg", "Packagings", 1600, 2000),
      img("verde", "03.jpg", "Mise en situation", 2000, 1250),
    ],
  },
  {
    slug: "echo",
    title: "Écho",
    year: "2023",
    category: "Vidéo & motion",
    client: "Association culturelle",
    role: "Réalisation, montage, motion design",
    tagline: "Un teaser qui résonne longtemps après.",
    description: [
      "Écho est le teaser vidéo d'une saison culturelle : 45 secondes de typographie cinétique et de formes sonores.",
      "Diffusé sur les réseaux de l'association, il a généré trois fois plus d'engagement que la saison précédente.",
    ],
    color: "#FFB800",
    cover: img("echo", "cover.jpg", "Image extraite du teaser Écho"),
    gallery: [
      img("echo", "01.jpg", "Storyboard", 2000, 1250),
      img("echo", "02.jpg", "Typographie cinétique", 1600, 2000),
      img("echo", "03.jpg", "Frames clés", 2000, 1250),
    ],
  },
];

/* ── Helpers ─────────────────────────────────────────────── */

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

/** Projet suivant (boucle sur le premier en fin de liste) */
export const getNextProject = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};
