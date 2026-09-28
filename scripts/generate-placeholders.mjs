/**
 * Génère des visuels placeholder abstraits (JPG) pour chaque projet.
 * Usage : npm run placeholders
 * Remplacez ensuite les fichiers de /public/projects/<slug>/ par vos créations.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BRAND = ["#2b50ff", "#7b2bff", "#ff4fd8", "#ff6a1f", "#c6f432", "#ffb800", "#1fbf6a"];

const PROJECTS = [
  { slug: "neon-bloom", color: "#ff4fd8" },
  { slug: "maison-sel", color: "#2b50ff" },
  { slug: "pulse", color: "#ff6a1f" },
  { slug: "lumen", color: "#7b2bff" },
  { slug: "verde", color: "#1fbf6a" },
  { slug: "echo", color: "#ffb800" },
];

const FILES = [
  { name: "cover.jpg", w: 1600, h: 2000 },
  { name: "01.jpg", w: 2000, h: 1250 },
  { name: "02.jpg", w: 1600, h: 2000 },
  { name: "03.jpg", w: 2000, h: 1250 },
];

// Générateur pseudo-aléatoire déterministe (mêmes images à chaque run)
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function svg({ w, h, color, seed }) {
  const r = rng(seed);
  const pick = () => BRAND[Math.floor(r() * BRAND.length)];
  const blobs = Array.from({ length: 6 }, () => {
    const cx = r() * w;
    const cy = r() * h;
    const rad = (0.2 + r() * 0.35) * Math.max(w, h);
    return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${pick()}" opacity="${0.55 + r() * 0.4}"/>`;
  }).join("");
  const rings = Array.from({ length: 3 }, () => {
    const cx = r() * w;
    const cy = r() * h;
    const rad = (0.05 + r() * 0.12) * Math.max(w, h);
    return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="#ffffff" stroke-width="${2 + r() * 6}" opacity="0.8"/>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${color}"/>
      <stop offset="1" stop-color="#f6f5f1"/>
    </linearGradient>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${Math.max(w, h) * 0.06}"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <g filter="url(#blur)">${blobs}</g>
  ${rings}
  <rect x="${w * 0.06}" y="${h * 0.06}" width="${w * 0.88}" height="${h * 0.88}" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2"/>
</svg>`;
}

let seed = 7;
for (const project of PROJECTS) {
  const dir = path.join("public", "projects", project.slug);
  await mkdir(dir, { recursive: true });
  for (const file of FILES) {
    seed += 97;
    await sharp(Buffer.from(svg({ ...file, color: project.color, seed })))
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(dir, file.name));
  }
  console.log(`✓ ${project.slug}`);
}
