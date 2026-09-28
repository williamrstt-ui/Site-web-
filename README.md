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

## Mise en ligne sur williamrosset.fr — thème WordPress (recommandé)

```bash
npm run build:wordpress   # → williamrosset-portfolio.zip
```

1. Admin WordPress → **Apparence → Thèmes → Ajouter → Téléverser un thème** → choisir `williamrosset-portfolio.zip` → Installer.
2. Cliquez sur **Activer**. Le portfolio remplace le site public ; `/wp-admin` reste accessible.
3. Pour revenir en arrière : réactivez simplement votre ancien thème.
4. Mise à jour : relancez `npm run build:wordpress`, puis re-téléversez le zip et choisissez « Remplacer l'actuel par la version téléversée ».

Le thème (`wordpress-theme/functions.php`) sert l'export Next.js rangé dans `site/` ; JS, CSS, polices et images sont servis directement par le serveur depuis le dossier du thème.

## Alternative : export statique sans WordPress (Infomaniak)

Le site est exporté en fichiers statiques (`output: "export"`) : pas besoin de Node.js ni de WordPress sur le serveur.

1. `npm run build` → génère le dossier `out/` (il contient aussi le `.htaccess`).
2. **Sauvegardez d'abord votre WordPress** : Manager Infomaniak → Hébergement Web → Sauvegardes (ou téléchargez le dossier du site + un export de la base de données).
3. Dans le Manager : Hébergement Web → votre site → **Gestionnaire de fichiers** (ou FTP avec FileZilla).
4. Ouvrez le dossier racine du site williamrosset.fr (souvent `/sites/williamrosset.fr`), déplacez les fichiers WordPress dans un sous-dossier `ancien-wordpress/` (ne les supprimez pas tout de suite).
5. Téléversez **le contenu** de `out/` (pas le dossier lui-même) à la racine, `.htaccess` compris (fichier caché).
6. Ouvrez https://williamrosset.fr en navigation privée pour contourner le cache.

Pour chaque mise à jour : `npm run build` puis re-téléverser le contenu de `out/`.

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
