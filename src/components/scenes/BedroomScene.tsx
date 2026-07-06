import { Environment } from "@react-three/drei";
import Room from "../environment/Room";
import Desk from "../environment/furniture/Desk";
import Chair from "../environment/furniture/Chair";
import Lamp from "../environment/furniture/Lamp";
import Bed from "../environment/furniture/Bed";
import ChalkOutline from "../environment/ChalkOutline";
import Clue from "../evidence/Clue";
import EvidenceRaycaster from "../evidence/EvidenceRaycaster";
import PlayerController from "../player/PlayerController";
import { case01 } from "@/data/cases/case01";

export default function BedroomScene() {
  return (
    <>
      {/*
        Using a procedural environment preset since we are not loading external HDRIs.
        'apartment' preset provides realistic indoor lighting and reflections.
      */}
      <Environment preset="apartment" background blur={0.35} environmentIntensity={0.45} />

      {/* Global Lighting */}
      <ambientLight intensity={0.38} color="#ffe9d0" />
      <hemisphereLight args={["#f3f0ff", "#4d4337", 0.35]} />

      <directionalLight
        position={[4, 7, 3]}
        intensity={2.4}
        color="#ffe2b7"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />

      {/* Focused room lights keep the clues visible without washing out the floor. */}
      <pointLight position={[1.8, 2.7, -1.1]} intensity={2.2} distance={6} color="#fff1dc" castShadow />
      <pointLight position={[-3, 2.4, -2]} intensity={1.1} distance={7} color="#e9f2ff" />
      <pointLight position={[3, 2.1, 2]} intensity={0.65} distance={8} color="#ffb98c" />

      {/* Procedural Environment */}
      <Room width={10} length={8} height={4} />

      <Desk position={[0, 0, -2]} />
      <Chair position={[0, 0, -1]} rotation={[0, Math.PI, 0]} />
      <Bed position={[-3, 0, 0]} rotation={[0, Math.PI / 2, 0]} />

      <Lamp position={[-3, 0, -2]} intensity={2} />
      <Lamp position={[3, 0, 2]} intensity={1} color="#ffccaa" />

      {/* Crime Scene Marking */}
      <ChalkOutline position={[2, 0.01, -1]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} />

      {/* Clues, driven by the case data so the scene and UI never fall out of sync */}
      {case01.evidenceItems.map((item) => (
        <Clue
          key={item.id}
          id={item.id}
          name={item.name}
          description={item.desc}
          type={item.type}
          position={item.position}
          rotation={item.rotation}
        />
      ))}

      <EvidenceRaycaster />
      <PlayerController />
    </>
  );
}
