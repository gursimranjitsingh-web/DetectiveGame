import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

// Deliberately lightweight. The previous stack (SSAO + always-on Depth of Field +
// adaptive ToneMapping) was the main source of lag — SSAO also errored without a
// NormalPass, so it cost frame time for nothing. Tone mapping is now handled cheaply
// by the renderer (ACES, set on the Canvas gl), leaving only a soft bloom + vignette.
export default function PostProcessing() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.35}
        luminanceThreshold={0.85}
        luminanceSmoothing={0.03}
        mipmapBlur
      />
      <Vignette
        offset={0.15}
        darkness={0.55}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
