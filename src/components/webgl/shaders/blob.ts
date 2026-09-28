import { simplexNoise3D } from "./noise";

/**
 * Shader « blob liquide irisé ».
 * - Vertex : déplacement par bruit simplex + torsion, normales recalculées
 *   par différences finies pour un éclairage correct.
 * - Fragment : dégradé de 4 couleurs de marque piloté par le relief,
 *   reflet irisé en bord (fresnel) et spéculaire nacré.
 */

export const blobVertexShader = /* glsl */ `
uniform float uTime;
uniform float uSpeed;
uniform float uDensity;
uniform float uStrength;
uniform float uTwist;
uniform vec2 uMouse;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vDisplacement;
varying vec3 vWorldNormal;

${simplexNoise3D}

mat3 rotateY(float a) {
  float s = sin(a), c = cos(a);
  return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}

// Déplace un point de la sphère unité et renvoie la nouvelle position
vec3 displace(vec3 p, out float disp) {
  float t = uTime * uSpeed;
  vec3 n = normalize(p);
  // Le curseur « tire » le champ de bruit, ce qui déforme le blob vers lui
  vec3 flow = vec3(uMouse * 0.8, 0.0);
  float n1 = snoise(n * uDensity + flow + vec3(0.0, t, t * 0.6));
  float n2 = snoise(n * uDensity * 2.3 - vec3(t * 0.8));
  disp = n1 * uStrength + n2 * uStrength * 0.22;
  vec3 q = p + n * disp;
  // Torsion verticale (augmente avec le scroll)
  q = rotateY(q.y * uTwist + sin(t) * 0.2) * q;
  return q;
}

void main() {
  float disp;
  vec3 pos = displace(position, disp);

  // Normales par différences finies sur deux tangentes
  vec3 up = abs(normal.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 tangent = normalize(cross(normal, up));
  vec3 bitangent = normalize(cross(normal, tangent));
  float e = 0.012;
  float d1, d2;
  vec3 pA = displace(position + tangent * e, d1);
  vec3 pB = displace(position + bitangent * e, d2);
  vec3 displacedNormal = normalize(cross(pA - pos, pB - pos));
  // Garantit l'orientation vers l'extérieur
  if (dot(displacedNormal, normal) < 0.0) displacedNormal *= -1.0;

  vDisplacement = disp;
  vNormal = normalize(normalMatrix * displacedNormal);
  vWorldNormal = normalize(mat3(modelMatrix) * displacedNormal);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const blobFragmentShader = /* glsl */ `
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uColorD;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vDisplacement;
varying vec3 vWorldNormal;

// Dégradé cyclique entre les 4 couleurs de marque
vec3 brandGradient(float t) {
  t = fract(t) * 4.0;
  if (t < 1.0) return mix(uColorA, uColorB, smoothstep(0.0, 1.0, t));
  if (t < 2.0) return mix(uColorB, uColorC, smoothstep(1.0, 2.0, t));
  if (t < 3.0) return mix(uColorC, uColorD, smoothstep(2.0, 3.0, t));
  return mix(uColorD, uColorA, smoothstep(3.0, 4.0, t));
}

// Palette d'Inigo Quilez pour l'irisation
vec3 iridescence(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vViewPosition);
  vec3 L = normalize(vec3(0.4, 0.9, 0.7));

  float fresnel = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.2);

  // Couleur de base qui « coule » avec le relief et le temps
  float t = vDisplacement * 0.9 + dot(vWorldNormal, vec3(0.25, 0.55, 0.15)) * 0.45 + uTime * 0.035;
  vec3 base = brandGradient(t);

  // Éclairage doux (half-lambert) pour garder des couleurs saturées
  float diff = dot(N, L) * 0.5 + 0.5;
  vec3 color = base * (0.62 + 0.55 * diff);

  // Reflet irisé en périphérie
  color += iridescence(fresnel * 1.4 + vDisplacement + uTime * 0.08) * fresnel * 0.45;

  // Spéculaire nacré (capté par le bloom)
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 60.0);
  color += vec3(1.0) * spec * 0.9;

  // Le bord se fond légèrement dans le fond blanc
  color = mix(color, vec3(1.0), fresnel * 0.18);

  gl_FragColor = vec4(color, uOpacity);
  #include <colorspace_fragment>
}
`;
