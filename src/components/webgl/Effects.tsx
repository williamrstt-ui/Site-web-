"use client";

import { Bloom, ChromaticAberration, EffectComposer } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

const CA_OFFSET = new THREE.Vector2(0.0007, 0.0005);

/**
 * Post-processing « premium » réservé au desktop :
 * bloom très sélectif (seulement les reflets spéculaires) et aberration
 * chromatique subtile, plus forte sur les bords de l'écran.
 * Le grain de film est géré en CSS (moins coûteux, identique partout).
 */
export function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur luminanceThreshold={0.92} luminanceSmoothing={0.2} intensity={0.55} radius={0.7} />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={CA_OFFSET}
        radialModulation
        modulationOffset={0.35}
      />
    </EffectComposer>
  );
}
