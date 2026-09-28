/**
 * État mutable partagé entre les cartes DOM de la galerie et leurs plans
 * WebGL : l'élément à suivre, l'intensité du survol et la position de la
 * souris (en UV 0 → 1) sur l'image.
 */
export type GalleryItemState = {
  el: HTMLElement | null;
  hover: number;
  mouse: { x: number; y: number };
};

export const createGalleryItems = (n: number): GalleryItemState[] =>
  Array.from({ length: n }, () => ({ el: null, hover: 0, mouse: { x: 0.5, y: 0.5 } }));
