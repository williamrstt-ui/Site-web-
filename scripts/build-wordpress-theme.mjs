/**
 * Construit le thème WordPress installable : williamrosset-portfolio.zip
 * Usage : npm run build:wordpress
 *
 * 1. Export Next.js avec les fichiers statiques servis depuis le dossier du thème
 * 2. Copie de l'export dans <thème>/site + fichiers PHP du dossier wordpress-theme/
 * 3. Capture d'écran du thème + archive zip prête pour Apparence → Thèmes → Ajouter
 */
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const THEME = "williamrosset-portfolio";
const PREFIX = `/wp-content/themes/${THEME}/site`;
const DIST = "dist";
const themeDir = path.join(DIST, THEME);
const zipName = `${THEME}.zip`;

const run = (cmd, env = {}) => execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });

console.log(`\n▸ Export Next.js (préfixe des fichiers : ${PREFIX})`);
rmSync("out", { recursive: true, force: true });
run("npx next build", { NEXT_PUBLIC_ASSET_PREFIX: PREFIX });

console.log("\n▸ Assemblage du thème");
rmSync(DIST, { recursive: true, force: true });
mkdirSync(themeDir, { recursive: true });
cpSync("wordpress-theme", themeDir, { recursive: true });
cpSync("out", path.join(themeDir, "site"), { recursive: true });
// Le .htaccess de l'export autonome n'a pas sa place dans un thème
rmSync(path.join(themeDir, "site", ".htaccess"), { force: true });

// Vignette affichée dans Apparence → Thèmes (1200 × 900)
const cover = "public/projects/neon-bloom/cover.jpg";
const shot = existsSync("wordpress-theme/screenshot.png") ? null : cover;
if (shot) {
  await sharp(shot).resize(1200, 900, { fit: "cover" }).png().toFile(path.join(themeDir, "screenshot.png"));
}

console.log("\n▸ Création de l'archive");
rmSync(zipName, { force: true });
run(`cd ${DIST} && zip -qr ../${zipName} ${THEME}`);
// Remet un export « normal » (sans préfixe) pour ne pas mélanger les deux builds
rmSync("out", { recursive: true, force: true });

console.log(`\n✓ ${zipName} prêt : WordPress → Apparence → Thèmes → Ajouter → Téléverser`);
