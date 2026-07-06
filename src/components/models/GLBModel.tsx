import React, { Suspense, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

type Vec3 = [number, number, number];

class Boundary extends React.Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <>{this.props.fallback}</> : <>{this.props.children}</>;
  }
}

function Inner({ url, scale }: { url: string; scale: number }) {
  const { scene } = useGLTF(url);
  const object = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={object} scale={scale} />;
}

/**
 * Loads a GLB/GLTF by direct public URL and renders it at the given transform.
 * Falls back to `fallback` (procedural) if the file is missing or errors.
 */
export default function GLBModel({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  fallback = null,
}: {
  url: string;
  position?: Vec3;
  rotation?: Vec3;
  scale?: number;
  fallback?: React.ReactNode;
}) {
  return (
    <group position={position} rotation={rotation}>
      <Boundary fallback={fallback}>
        <Suspense fallback={null}>
          <Inner url={url} scale={scale} />
        </Suspense>
      </Boundary>
    </group>
  );
}
