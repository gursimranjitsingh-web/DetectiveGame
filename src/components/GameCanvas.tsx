import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import * as THREE from "three";
import Scene from "./Scene";
import PostProcessing from "./PostProcessing";
import { Loader, Preload } from "@react-three/drei";
import { ensureAudio } from "@/game/audio";

export default function GameCanvas() {
  // Browsers block audio until a user gesture — unlock the AudioContext on first input.
  useEffect(() => {
    const unlock = () => ensureAudio();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  return (
    <>
      <Canvas
        shadows
        // Cap DPR at 1.5 — rendering at full 2x on retina was a big, invisible cost.
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        camera={{ position: [0, 1.7, 5], fov: 60, near: 0.1, far: 100 }}
        className="w-full h-full block"
      >
        <Suspense fallback={null}>
          <Scene />
          <PostProcessing />
          <Preload all />
        </Suspense>
      </Canvas>
      <Loader />
    </>
  );
}
