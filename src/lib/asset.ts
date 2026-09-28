/**
 * Préfixe des fichiers de /public (images des projets).
 * Vide en temps normal ; pour le thème WordPress, il vaut le chemin du
 * dossier du thème afin que le serveur serve les images directement.
 */
const PREFIX = process.env.NEXT_PUBLIC_ASSET_PREFIX ?? "";

export const asset = (path: string) => `${PREFIX}${path}`;
