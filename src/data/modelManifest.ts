// Manifest of GLTF/GLB models the game CAN use. Each entry is disabled by default so
// the game runs fully on procedural placeholders. When you drop a real .glb into the
// matching public/models path and set `enabled: true`, ModelSlot swaps the placeholder
// for the model automatically. See MODELS.md for the download list + exact paths.

export interface ModelDef {
  url: string;
  enabled: boolean;
  scale?: number;
  /** vertical offset applied to the loaded model (to sit it on the floor) */
  y?: number;
  rotationY?: number;
}

export const MODELS: Record<string, ModelDef> = {
  // Characters (Quaternius Universal Base Characters — rigged .glb)
  character: { url: '/models/characters/character.glb', enabled: false, scale: 1, y: 0 },

  // Furniture (Kenney Furniture Kit — .glb)
  'furniture.bookshelf': { url: '/models/furniture/bookshelf.glb', enabled: false, scale: 1 },
  'furniture.desk': { url: '/models/furniture/desk.glb', enabled: false, scale: 1 },
  'furniture.sofa': { url: '/models/furniture/sofa.glb', enabled: false, scale: 1 },
  'furniture.armchair': { url: '/models/furniture/armchair.glb', enabled: false, scale: 1 },
  'furniture.diningTable': { url: '/models/furniture/dining-table.glb', enabled: false, scale: 1 },
  'furniture.bed': { url: '/models/furniture/bed.glb', enabled: false, scale: 1 },
  'furniture.wardrobe': { url: '/models/furniture/wardrobe.glb', enabled: false, scale: 1 },
  'furniture.kitchen': { url: '/models/furniture/kitchen.glb', enabled: false, scale: 1 },
  'furniture.rug': { url: '/models/furniture/rug.glb', enabled: false, scale: 1 },
  'furniture.painting': { url: '/models/furniture/painting.glb', enabled: false, scale: 1 },
  'furniture.chandelier': { url: '/models/furniture/chandelier.glb', enabled: false, scale: 1 },

  // Props (Poly Pizza — CC0 .glb)
  'prop.revolver': { url: '/models/props/revolver.glb', enabled: false, scale: 1 },
  'prop.wineGlass': { url: '/models/props/wine-glass.glb', enabled: false, scale: 1 },
  'prop.safe': { url: '/models/props/safe.glb', enabled: false, scale: 1 },
  'prop.plant': { url: '/models/props/plant.glb', enabled: false, scale: 1 },
  'prop.crate': { url: '/models/props/crate.glb', enabled: false, scale: 1 },
};

export function getModel(key: string): ModelDef | undefined {
  const m = MODELS[key];
  return m && m.enabled ? m : undefined;
}
