# Blackwood Manor — 3D Model Drop-in Guide

Case 03 runs fully on procedural placeholders right now. To upgrade any object to a real
model: download a **`.glb`**, save it at the exact path below, then tell me the key and
I'll flip `enabled: true` in `src/data/modelManifest.ts` (one line). The placeholder is
replaced automatically — no other changes.

All recommended sources are **CC0** (free, commercial-OK, no credit required).

## Where to download
- **Furniture** → Kenney *Furniture Kit* (CC0): https://kenney.nl/assets/furniture-kit
  (unzip, grab the `.glb` files you want)
- **Characters** → Quaternius *Universal Base Characters* (CC0, rigged) +
  *Universal Animation Library*: https://quaternius.com/  /  https://quaternius.itch.io/
- **Props** → Poly Pizza (filter to **CC0**): https://poly.pizza/

## File → path map (rename the download to match)

| Manifest key            | Save as                                   | Suggested model            |
|-------------------------|-------------------------------------------|----------------------------|
| `character`             | `public/models/characters/character.glb`  | Quaternius base character  |
| `furniture.bookshelf`   | `public/models/furniture/bookshelf.glb`   | Kenney bookcase            |
| `furniture.desk`        | `public/models/furniture/desk.glb`        | Kenney desk                |
| `furniture.sofa`        | `public/models/furniture/sofa.glb`        | Kenney sofa/couch          |
| `furniture.armchair`    | `public/models/furniture/armchair.glb`    | Kenney lounge chair        |
| `furniture.diningTable` | `public/models/furniture/dining-table.glb`| Kenney table + chairs      |
| `furniture.bed`         | `public/models/furniture/bed.glb`         | Kenney bed                 |
| `furniture.wardrobe`    | `public/models/furniture/wardrobe.glb`    | Kenney wardrobe/cabinet    |
| `furniture.kitchen`     | `public/models/furniture/kitchen.glb`     | Kenney kitchen counter     |
| `furniture.chandelier`  | `public/models/furniture/chandelier.glb`  | Poly Pizza chandelier      |
| `prop.revolver`         | `public/models/props/revolver.glb`        | Poly Pizza revolver/pistol |
| `prop.wineGlass`        | `public/models/props/wine-glass.glb`      | Poly Pizza wine glass      |
| `prop.safe`             | `public/models/props/safe.glb`            | Poly Pizza safe            |
| `prop.plant`            | `public/models/props/plant.glb`           | Poly Pizza potted plant    |
| `prop.crate`            | `public/models/props/crate.glb`           | Poly Pizza crate           |

## Notes
- Prefer **`.glb`** (single file). If a pack only gives `.gltf`+`.bin`+textures, keep them
  together and point the key's `url` at the `.gltf`.
- Keep polycounts reasonable (these packs already are) to stay at 60 FPS.
- Rigged character animations (idle/talk) can be wired once the character model is in —
  tell me and I'll hook up the Universal Animation Library.
