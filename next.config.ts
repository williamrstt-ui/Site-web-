import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Export 100 % statique (dossier /out) : se dépose tel quel sur un
  // hébergement mutualisé (Infomaniak, OVH…), sans serveur Node.js.
  output: "export",
  // /projets/pulse → /projets/pulse/index.html, servi nativement par Apache
  trailingSlash: true,
  // Thème WordPress : JS/CSS/polices servis depuis le dossier du thème
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || undefined,
  images: {
    // L'optimiseur d'images de Next.js a besoin d'un serveur : en export
    // statique, les images sont servies telles quelles (pensez à les
    // exporter en WebP/JPG ~2000 px, 80 % de qualité).
    unoptimized: true,
  },
};

export default nextConfig;
