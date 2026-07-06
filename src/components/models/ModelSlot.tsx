import React, { Suspense, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { getModel } from '@/data/modelManifest';

type Vec3 = [number, number, number];

// Loads and renders a GLTF from the manifest. Clones so the same model can appear twice.
function Gltf({ url, scale, y, rotationY }: { url: string; scale: number; y: number; rotationY: number }) {
  const { scene } = useGLTF(url);
  const object = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={object} scale={scale} position={[0, y, 0]} rotation={[0, rotationY, 0]} />;
}

// Falls back to `fallback` if the model errors (e.g. file not present yet).
class Boundary extends React.Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <>{this.props.fallback}</> : <>{this.props.children}</>;
  }
}

/**
 * Renders the GLTF for `modelKey` if it's enabled in the manifest; otherwise renders the
 * procedural `fallback`. Drop a .glb in, flip `enabled: true`, and the placeholder is
 * replaced — no other code changes needed.
 */
export default function ModelSlot({
  modelKey,
  fallback,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  modelKey: string;
  fallback: React.ReactNode;
  position?: Vec3;
  rotation?: Vec3;
}) {
  const def = getModel(modelKey);

  if (!def) {
    return (
      <group position={position} rotation={rotation}>
        {fallback}
      </group>
    );
  }

  return (
    <group position={position} rotation={rotation}>
      <Boundary fallback={fallback}>
        <Suspense fallback={null}>
          <Gltf url={def.url} scale={def.scale ?? 1} y={def.y ?? 0} rotationY={def.rotationY ?? 0} />
        </Suspense>
      </Boundary>
    </group>
  );
}
