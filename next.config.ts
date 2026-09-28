import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // next/image sert automatiquement de l'AVIF, sinon du WebP.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560],
  },
  // Three.js est livré en ESM : on le laisse transpiler proprement.
  transpilePackages: ["three"],
};

export default nextConfig;
