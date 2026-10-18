Status: layout approved 2026-10-18 · batch 1 (outside) approved · batch 2 (ground floor shell, hall, antechamber) in review

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
