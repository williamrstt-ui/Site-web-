/**
 * Shader des images de la galerie.
 * - Vertex : courbure proportionnelle à la vitesse de défilement
 *   + onde qui part du curseur au survol.
 * - Fragment : cadrage « object-fit: cover », zoom au survol, ondulation
 *   liquide et léger décalage RGB (aberration) lié à la vitesse.
 */

export const imagePlaneVertexShader = /* glsl */ `
uniform float uVelocity;
uniform float uHover;
uniform vec2 uMouse;
uniform float uTime;
uniform vec2 uPlaneSize;

varying vec2 vUv;
varying float vWave;

#define PI 3.14159265

void main() {
  vUv = uv;
  vec3 p = position;

  // Courbure : les bords reculent quand la galerie file vite
  float bend = sin(uv.x * PI) * uVelocity;
  p.z -= bend * uPlaneSize.x * 0.12;
  // Légère ondulation verticale dans le sens du mouvement
  // (p.x/p.y sont en unités locales, z est en pixels : le mesh n'est pas mis à l'échelle en z)
  p.y += sin(uv.x * PI) * uVelocity * 0.04;

  // Onde concentrique depuis le curseur au survol
  float d = distance(uv, uMouse);
  float wave = sin(d * 18.0 - uTime * 5.0) * exp(-d * 3.5) * uHover;
  p.z += wave * uPlaneSize.x * 0.035;
  vWave = wave;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const imagePlaneFragmentShader = /* glsl */ `
uniform sampler2D uTexture;
uniform vec2 uImageSize;
uniform vec2 uPlaneSize;
uniform float uHover;
uniform float uVelocity;
uniform float uTime;
uniform vec2 uMouse;
uniform float uOpacity;

varying vec2 vUv;
varying float vWave;

// Équivalent GLSL de object-fit: cover
vec2 coverUv(vec2 uv, vec2 plane, vec2 image) {
  vec2 ratio = vec2(
    min((plane.x / plane.y) / (image.x / image.y), 1.0),
    min((plane.y / plane.x) / (image.y / image.x), 1.0)
  );
  return vec2(uv.x * ratio.x + (1.0 - ratio.x) * 0.5, uv.y * ratio.y + (1.0 - ratio.y) * 0.5);
}

void main() {
  vec2 uv = coverUv(vUv, uPlaneSize, uImageSize);

  // Zoom doux centré au survol
  uv = (uv - 0.5) * (1.0 - 0.08 * uHover) + 0.5;

  // Ondulation liquide
  uv.x += sin(uv.y * 12.0 + uTime * 2.2) * 0.006 * uHover;
  uv.y += cos(uv.x * 10.0 + uTime * 1.8) * 0.006 * uHover;
  uv += vWave * 0.015;

  // Aberration chromatique horizontale liée à la vitesse
  float shift = uVelocity * 0.02 + uHover * 0.003;
  float r = texture2D(uTexture, uv + vec2(shift, 0.0)).r;
  float g = texture2D(uTexture, uv).g;
  float b = texture2D(uTexture, uv - vec2(shift, 0.0)).b;

  gl_FragColor = vec4(r, g, b, uOpacity);
  #include <colorspace_fragment>
}
`;
