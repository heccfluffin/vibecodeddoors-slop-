Status: layout approved 2026-10-18 · batches 1-5 approved · batch 6 (Song, Sand, tomb) in review

# The Pyramid rework (remodel list #20)

A full rework of the look of the Pyramid, outside, on the ground floor and in the undercroft. **Every room, trap,
puzzle, prop and spot stays where it is** (the ground-floor grid `F` and the undercroft grid `FB` in `pyrBuild` /
`pyrUnder` are unchanged), so all the gameplay keeps working. Models: **`docs/design/models/pyr.js`**.

## Layout
- The pyramid: same place and size (`PYR` -175, -1040, base 76 m, 56 m high), the way in on the east side.
- The temple gateway at the passage mouth (x -133.5): pylon towers either side (z ±1.6..±5), a winged sun over the
  door, braziers. The opening stays 3.2 m wide, the passage stays x -153..-133.5.
- The avenue: paving x -133.5..-122, z ±3.5; three jackal statues each side (x -129.5, -127, -124.5, z ±4.6);
  two obelisks (x -121.8, z ±4.4); the two sphinxes (x -132.2..-125.8, z ±8.6, facing east). The taxi stop and
  phone booth at (-120, -1040) are unchanged.
- The dig camp: x -166..-148, z -1097..-1083 (south of the base, east of the road).
- Ruins in the sand: fallen columns (-194, -1088), a broken statue (-127, -995), fallen casing stones (-221, -1050).
  All clear of the base (x -213..-137, z -1078..-1002).

## Batches
1. Outside: the faces, capstone, rubble, gateway, avenue, sphinxes, obelisks, dig camp, ruins.
2. The ground floor's walls, ceilings, floors and lights; the entrance hall; the antechamber.
3. The dart and blade corridors, the sealed door and its dials, the clue rooms and the scarab trapdoor.
4. The treasure chamber (gold, sarcophagus and mummy, chest, golden mask).
5. The undercroft: walls, stairs and landing, the Trial of the Jackal, the Trial of the Sun.
6. The Trial of Song, the Trial of Sand, the tomb.

## Notes for the wiring (batch 1)
- Keep the game's portal walls (z ±1.6..3.8, 5.5 high) and its roof block (y 3.9..5.5) between x -153 and -133.5;
  the gateway towers wrap them (tower inner faces at z ±1.75, fronts at x -133.46), the carved panel sits on the roof
  block's front. Drop the old glyph plane `lt` at `px1+.01` and the old bollards (the gateway has its own, same spots).
- All carvings are drawn with paths (`pyGlyph`), never hieroglyph font characters (they don't render everywhere).

## Notes for the wiring (batch 2)
- `pyrBuild`: the wall-box loop ("the walls you can see"), the floor box `pyrBox(B*2,.06,B*2)` and the ceiling slab
  `pyrBox(48.2,.25,48.2)` go; call `pyFloorplan(g)` instead (painted faces on the cell lines, a ceiling tile per floor
  cell at WH, the same floor slab). The collision loop stays as it is. `PYF` must stay equal to the game's `F`.
- The portal's three boxes become `pyPortal(g)` (same sizes and places, new stone).
- `torch(x,z,ry,lit)`: build `pyTorch(g,x,z,ry)` instead of the bracket/stick/cup; put the game's glow sprite at
  `t.userData.glow` and the PointLight where it was. `PYTF` lists the wall faces with torches; if a torch moves,
  update it (those faces get a panel with a clear middle and soot above the flame).
- New: `pyEntrance(g)` (hall door frame, two unlit torches at (X+12.8, Z-1.45) and (X+19.2, Z+1.45) with glow
  sprites, no lights) and `pyAntechamber(g)` (columns, guardians, door frames; push its `obs`).
- Antechamber props swap their meshes, spots and E prompts unchanged: stele 0 → `pyStele()` at the same place and
  `ry` (keep the clue plane at z .18); table + scroll → `pyScrollTable()` at (X+3.5, Z+5.4); the three urns →
  `pyJar()`; the bones → `pySkeleton()` at (X+6.4, Z-7.0). The other two steles use `pyStele()` too.

## Notes for the wiring (batch 2, the passage)
- The game's long entrance hall in the portal passage is built in `pyrUnder` (painted `pyrArt` planes at z ±1.58 and
  four `pyrTorch` calls at X+31.5 / X+37.5). Replace those with `pyPassage(g)` (panels 1 cm off the walls, a starry
  ceiling 1 cm under the roof block, four `pyTorch(…, 0)` on the wall faces); the light goes on `.lit`.
- `pyrTorch` everywhere else (undercroft) → `pyTorch(g, x, z, ry, 0)` (0 = the group sits on the wall face), keeping
  the game's glow sprites at `userData.glow` and its PointLight.
- The old sphinxes are also in `pyrUnder` (X+46, Z±7.5, with their `ob`): remove them, the avenue has the new ones.

## Notes for the wiring (batch 3)
- Darts: keep the tiles and their logic; their materials `TS`/`TC` → `pyDartMats().safe` / `.cracked`. The flying dart
  cylinder → `pyDart()` (points +z; for darts flying -z turn it round y by π instead of `rotation.x`).
- Blades: keep `pv` and the swing/kill code. Inside `pv` replace arm, blade and cap with `pyBlade()`; the `DK` ceiling
  box → `pyBladeMount(g, bx, zc)`. The wall panels at the four blade cells show the slot the blade passes through.
- Sealed door: `slab` → `pySealedSlab()` (a group, same centre and size, so `slab.position.y` still sinks it); add
  `pySealedFrame(g, sx)`. Each dial's `ring` → `pyDial()` inside `dg` (front at .025; the symbol face stays at .035,
  the name plates stay at sx+.51).
- Trapdoor: `slab` → `pyTrapSlab()` (same size and centre, still slides); the 4 frame strips, the `pit` plane and the
  `sg` scarab plane go, `pyTrapFrame(g, hx, hz)` replaces them (the dark stairs picture is at y .056, above the
  floor; the old pit at .035 was under the floor and never showed).
- `pyClueRooms(g)`: the scribe's corner and the scarab statue; push its `obs`. Steles 1 and 2 → `pyStele()`.

## Notes for the wiring (batch 4, the treasure chamber)
- `gp(x,z,s)` → add `pyGoldPile(s)` at (x, 0, z) instead of its cone and five coins (the coins were under the floor).
- `sar` → `pySarcophagus()` at (tx, 0, Z+3.2) (open on top, filled to .42 so the mummy lies on it); `lid` →
  `pySarcLid()` at (tx, .99, Z+3.2), same moves (`position`, `rotation.z`); `mum` → `pyMummy()` at the same spot,
  its `userData.tr` is the part that sits up.
- `ch` → `pyChest()` at (cx(1)+.3, 0, Z-2.6); `chl` → `pyChestLid()` at (cx(1)+.3, .79, Z-2.6), same open move.
- `ped` → `pyPedestal()` at (cx(1)-.6, 0, Z+.6); the mask group's children → `pyMask()` (same group, same sway, same
  glow sprite; hide the group as now when taken).
- New: `pyTreasureRoom(g)` (shrine, jars, fans, chariot wheels); push its `obs`. The gold light stays as it is.

## Notes for the wiring (batch 5, the undercroft)
- `pyrUnder`: the wall-box loop, the floor box, the ceiling slab and the beam loop go; call `pyUnderplan(g)` (painted
  faces on the cell lines, worn and darker; ceiling tiles; beams on odd columns running into the walls; the floor slab,
  top at Y). `PYFB` must stay equal to `FB`; `PYUT` lists the `T(...)` torch walls.
- `T(i,j,side,lit)`: `pyrTorch` → `pyTorch(g, x, z, ry, .048)` at the same spot, `t.position.y = Y` (its wall is
  4.8 cm behind, the game's x/z use *.97). Lights and glow sprites as now.
- `art(lines, icons, x, z, ry, w, h)`: keep the plane, its material → `pyTablet(lines, w, h)` (same words, the icons
  are drawn as signs). Move the Jackal clue tablet (bx(12), bz(13)-1.58) to x bx(12)+.25: the closed gate covers
  its left 20 cm.
- Stairs: the nine step boxes and the black `sh` plane → `pyUnderStairs(g)` (steps wall to wall with nosings, a
  stone-lined opening over cell (4,14), which has no ceiling tile). The bones → `pyLandingDressing(g)`.
- `gate(k, ...)`: the slab → `pyGateSlab(x1-x0, HH, z1-z0, k)` (k = 'jackal' | 'sun' | 'song' | 'tomb'), same place,
  still sinks by `position.y`.
- Jackal: the altar box + gold top → `pyAltar()` at (ax, Y, az) (keep the fire glow sprite); `pyrJackal(M, red, 1.1)`
  → `pyJackal({red, scale: 1.1, round: true})` (round plinth because they turn; eyes at y 2.51, z .36 for the glow).
- Sun: the gold reflector → `pySunSource()` at (sx, by, sz) (keep the shaft box and glow); the disc and its 12 rays →
  `pySunTarget()` at (tx, by, bz(3)-1.6), and use its `userData.disc` as `disc` (its emissive lights up as now).
  Mirrors: the pedestal → `pyMirrorStand()` in `gr`; the frame and the two mirror faces → `pyMirrorHead()` in `piv`.

## Notes for the wiring (batch 6: Song, Sand, the tomb)
- Song: each gong's two posts and beam → `pyGongFrame(g, x, z)`; the disc `d` → `pyGongDisc()` (same place, still
  wobbled and lit through `d.material.emissive`); the label planes' material → `pyGongLabel(k)` (signs drawn; the
  game's '𓂀' label needed a font some PCs lack). The priest's parts → `pyPriest()` in `pr` (same spot and turn).
  The HUD and caption texts that print `SY[k]` are unchanged.
- Sand: each lever's base box → `pyLeverPlate(g, x, Y+1.4, z, sd)` (plate, two cheeks, the axle along z); in `h`, the
  handle and knob → `pyLeverHandle(sd)` (same pivot). **Swap the lever angles**: start and reset `h.rotation.z = -sd*.6`,
  pulled `+sd*.6`. Then a lever starts up at 45° and pulls down to 24° below level; with the old angles the pulled
  handle went 34 cm into the wall. The sand box's material → `pySandMats().sand` (the game already scrolls its map); the four
  fall columns' material → `pySandMats().fall` (scroll `map.offset.y -= dt*1.5` while pouring). Add
  `pySandCracks(g)`. **Move the Sand tablet** from (bx(18), bz(10)-1.25, ry 0) to (bx(18)-1.58, bz(10)+.2, ry π/2):
  it hung 10 cm in front of the Song gate, so it floated in the open doorway once the gate sank.
- Tomb: the coffin base, stripes, gold top, face and headdress → `pyKhufuCoffin()` at (tx, Y, tz) (same footprint;
  its top is now Y+1.6, the blk is unchanged). Guardians → `pyJackal({scale: 1.45})`. `gp` → `pyGoldPile(1.1)`. The
  four jars → `pyCanopic(0..3)`. The Heart's pedestal → `pyHeartPedestal()`; `ht`'s geometry → `pyHeartGeo()` (same
  material, spin, beat and glow). The two floating bowls → `pyWallBowl(g, x, Y+1.6, bz(20)+1.45)` (bracket into the
  wall; keep the glow sprites). The secret stone → `pyGateSlab(.5, HH, 3.2, 'tomb')` like the other gates.
