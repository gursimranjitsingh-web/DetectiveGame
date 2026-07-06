// Mutable player pose written each frame by PlayerController and read by the
// minimap. Kept out of the store so it doesn't trigger 60fps React re-renders.
export const playerPose = { x: 0, z: 0, angle: 0 };
