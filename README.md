# William Rosset — Portfolio 3D

Portfolio vitrine en WebGL : blanc lumineux, accents saturés, 3D liquide.

**Stack** : Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · React Three Fiber + Drei · shaders GLSL custom · GSAP + ScrollTrigger · Lenis · Framer Motion · @react-three/postprocessing

## Lancer le projet

```bash
npm install        # installe les dépendances
npm run dev        # http://localhost:3000
npm run build      # build de production
npm start          # sert le build
npm run typecheck  # vérification TypeScript
```

Node.js 20.9 ou plus récent est requis.

## Ajouter une création

Tout se passe dans **`src/data/projects.ts`** :

1. Déposez vos images dans `public/projects/<slug>/` (ex. `cover.jpg`, `01.jpg`…).
2. Ajoutez un objet au tableau `projects` (titre, année, catégorie, description, couleur, images).
3. C'est tout : la galerie, la page `/projets/<slug>` et le lien « Projet suivant » sont générés automatiquement.

Les textes généraux (bio, email, réseaux) sont dans **`src/data/site.ts`**.

Les images actuelles sont des placeholders générés par `npm run placeholders`. Remplacez-les par vos fichiers en gardant les mêmes noms, ou changez les chemins dans `projects.ts`. Pensez à renseigner les vraies dimensions (`width`/`height`) pour que le cadrage soit juste.

## Arborescence

```
src/
├── app/
│   ├── layout.tsx              # polices, providers, loader, curseur, grain
│   ├── template.tsx            # transition de page (rideau Framer Motion)
│   ├── page.tsx                # accueil : Hero → Galerie → À propos → Contact
│   ├── not-found.tsx
│   ├── globals.css             # tokens Tailwind, grain, Lenis, reduced motion
│   └── projets/[slug]/
│       ├── page.tsx            # génération statique + métadonnées
│       └── ProjectView.tsx     # header, parallaxe, révélations au scroll
├── components/
│   ├── providers/              # AppProvider (état global), SmoothScroll (Lenis)
│   ├── sections/               # Hero, Gallery, About, Contact
│   ├── ui/                     # Loader, Cursor, Magnetic, Marquee, SplitReveal,
│   │                           # ProjectCard, ProjectTransition, Header…
│   └── webgl/
│       ├── HeroScene.tsx       # canvas du hero + post-processing
│       ├── LiquidBlob.tsx      # sphère liquide morphing
│       ├── Particles.tsx       # confettis 3D
│       ├── FloatingShapes.tsx  # objets brillants flottants
│       ├── GalleryCanvas.tsx   # plans WebGL calés sur le DOM
│       ├── AboutScene.tsx      # nœud irisé secondaire
│       └── shaders/            # GLSL : blob, particules, images, bruit simplex
├── data/                       # projects.ts, site.ts ← à personnaliser
├── hooks/                      # media queries, inView, détection WebGL
└── lib/                        # gsap, scroll, pointeur, sons, transition
```

## Performances et accessibilité

- La 3D est chargée en différé (`next/dynamic`, chunks séparés) et mise en pause hors écran.
- Sur mobile et tactile : blob moins détaillé, 3× moins de particules, pas de post-processing, galerie sans WebGL.
- `PerformanceMonitor` coupe le post-processing si le nombre d'images par seconde chute.
- `prefers-reduced-motion` : pas de Lenis, galerie en grille, animations coupées, 3D presque figée.
- Navigation clavier complète (lien d'évitement, focus visible), sons désactivés par défaut.
