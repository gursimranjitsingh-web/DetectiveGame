import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

type Vec3 = [number, number, number];

const MALE = '/models/characters/base/Superhero_Male_FullBody.gltf';
const FEMALE = '/models/characters/base/Superhero_Female_FullBody.gltf';
const ANIM = '/models/characters/animations.glb';

useGLTF.preload(MALE);
useGLTF.preload(FEMALE);
useGLTF.preload(ANIM);

class Boundary extends React.Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <>{this.props.fallback}</> : <>{this.props.children}</>;
  }
}

function Rigged({ gender, clip }: { gender: 'm' | 'f'; clip?: string }) {
  const { scene } = useGLTF(gender === 'f' ? FEMALE : MALE);
  const { animations } = useGLTF(ANIM);
  const cloned = useMemo(() => SkeletonUtils.clone(scene) as THREE.Object3D, [scene]);
  const group = useRef<THREE.Group>(null);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    if (!names.length) return;
    // Pick an idle-ish clip (or a specific one), else the first.
    const pick =
      names.find((n) => clip && n.toLowerCase().includes(clip.toLowerCase())) ??
      names.find((n) => /idle/i.test(n)) ??
      names[0];
    const action = actions[pick];
    if (!action) return;
    action.reset().fadeIn(0.4).play();
    return () => {
      action.fadeOut(0.2);
    };
  }, [actions, names, clip]);

  useEffect(() => {
    cloned.traverse((o) => {
      o.castShadow = true;
    });
  }, [cloned]);

  return (
    <group ref={group}>
      <primitive object={cloned} />
    </group>
  );
}

// Procedural fallback if the model/animation fails to load.
function Fallback({ hue }: { hue: number }) {
  const coat = `hsl(${hue}, 30%, 34%)`;
  return (
    <group>
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.34, 1.0, 0.24]} />
        <meshStandardMaterial color={coat} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[0.24, 0.26, 0.24]} />
        <meshStandardMaterial color="#d8b48c" roughness={0.7} />
      </mesh>
      <mesh position={[-0.1, 0.4, 0]} castShadow>
        <boxGeometry args={[0.12, 0.9, 0.18]} />
        <meshStandardMaterial color="#22262c" roughness={0.85} />
      </mesh>
      <mesh position={[0.1, 0.4, 0]} castShadow>
        <boxGeometry args={[0.12, 0.9, 0.18]} />
        <meshStandardMaterial color="#22262c" roughness={0.85} />
      </mesh>
    </group>
  );
}

export default function Character({
  gender = 'm',
  hue = 210,
  clip,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: {
  gender?: 'm' | 'f';
  hue?: number;
  clip?: string;
  position?: Vec3;
  rotation?: Vec3;
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Boundary fallback={<Fallback hue={hue} />}>
        <Suspense fallback={<Fallback hue={hue} />}>
          <Rigged gender={gender} clip={clip} />
        </Suspense>
      </Boundary>
    </group>
  );
}
