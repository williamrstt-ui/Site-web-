import { simplexNoise3D } from "./noise";

/**
 * Nuée de particules colorées qui orbitent autour du blob et fuient le
 * curseur. Chaque particule reçoit une couleur de marque via attribut.
 */
export const particlesVertexShader = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;
uniform vec3 uMouse3D;
uniform float uSpread;

attribute float aScale;
attribute vec3 aColor;
attribute float aSeed;

varying vec3 vColor;
varying float vAlpha;

${simplexNoise3D}

void main() {
  vec3 p = position * uSpread;

  // Orbite lente autour de l'axe Y, vitesse propre à chaque particule
  float angle = uTime * (0.05 + aSeed * 0.08);
  float s = sin(angle), c = cos(angle);
  p.xz = mat2(c, -s, s, c) * p.xz;

  // Dérive organique
  p += vec3(
    snoise(p * 0.35 + uTime * 0.1),
    snoise(p * 0.35 + 17.0 + uTime * 0.1),
    snoise(p * 0.35 + 31.0 + uTime * 0.1)
  ) * 0.25;

  // Répulsion du curseur
  vec3 toMouse = p - uMouse3D;
  float d = length(toMouse);
  p += normalize(toMouse) * smoothstep(1.4, 0.0, d) * 0.6;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * uPixelRatio * (1.0 / -mv.z);

  vColor = aColor;
  vAlpha = smoothstep(14.0, 4.0, -mv.z);
}
`;

export const particlesFragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  // Disque net aux bords adoucis
  float d = length(gl_PointCoord - 0.5);
  float alpha = smoothstep(0.5, 0.42, d) * vAlpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(vColor, alpha);
  #include <colorspace_fragment>
}
`;
