Status: part 1 (layout) approved by the user 2026-10-17 · part 2 batches 1-3 approved · more batches coming

# The Old Quarry rework

The user: the quarry's models are "lazily made". Part 1 tidies the layout, which the user approved from a top-down
plan. Part 2 brings the new models in batches, each with a preview and the user's OK, in `docs/design/models/quarry-*.js`.

Coordinates are desert-local x/z (world z = local z + q.OZ), with heights as in `QD` (rim -4, bench -8, floor `F` -12).
On the plan, smaller z is drawn at the top.

## Part 1: layout

### What doesn't move
- The pit, its levels and plates (`QUARRY`, `QD`), the haul-road ramp, the dirt road in.
- The headframe, the cage and the shaft (`MN.ox`, `MN.oz` = -247, -1446), and so the whole mine below.
- The smeltery line: furnace `SM.x/z` (-232, -1447), molds `SM.mx/mz` (-225, -1447), grinder `SM.gx/gz` (-217, -1447).
- The crusher `CR` (-148, -1492), the conveyor and the stockpile.
- The excavator `EX` (-178, -1456), the ore hopper `QHOP` (-190, -1443.2).

### Moves (old → new)
1. **Winch house** (cage upgrade): (-251.6, -1442.8), half inside the west bench face → **(-246, -1441.7)**, between
   the headframe and the bench, its drum side facing the headframe (drum at (-246, F+.95, -1443.0)). The rope still
   runs from the drum to the sheave.
2. **Skip hoist tower, crew bin, rock pile and miners** (crew upgrade): tower (-243.4, -1446) → **(-247, -1453)**, on
   the other side of the headframe. Bin (-244.5, -1451.5), pile (-249.5, -1454), miners on an arc round (-247, -1452).
   The cage, its call box and the "MINE · CAGE" sign are then clear.
3. **Refinery** (mold 3): (-230.8, -1451.7) → **(-232, -1452.3)**, so its pipe no longer goes inside the furnace.
   **Blower** (furnace 1): → (-236.8, -1451).
4. **Assay office** (mint): `SM.gx + 3.6` → **`SM.gx + 9`** (-208, -1447).
5. **Processing machines** (`QPOS`): pads 6 m apart in two rows.
   - Row 1, z -1459: sortr -234, wash -228, mill -222, heat -216, pol -210.
   - Row 2, z -1466: gen -228, silo -222, lab -216.
   - The water tank and the belts follow (`qtLinks`).
6. **Rubble mounds** (`QMD`): (-196, -1452), (-188, -1448), (-182, -1463), (-176, -1449), all in the dig area by the
   excavator.
7. **Dump truck**:
   - Path: (-188, -1458) → (-200, -1468) → (-214, -1471) → (-226, -1476.5) → (-160, -1476.5) → (-150, -1477)
     → (-148, -1484).
   - At the end it stops with its back to the crusher and tips its bed towards it. That means facing north (+z away
     from the crusher), so the bed lifts over the hopper.
   - Smooth the heading between points (turn at a fixed rate instead of snapping).
8. **Drill rig**: off the rim lip → **(-205, F, -1443)**, on the pit floor by the north wall, so the drill bit reaches
   the ground. Same moving parts.
9. **Blast**: plunger (-196, -1442) → **(-198, -1442)**, charge (-170.1, -1452) → **(-172, -1444)**. Re-run the wire
   between them.
10. **Site office**: the solid box → a **walk-in office** at x -134..-122, z -1496..-1485, with its door in the north
    wall (z -1485).
    - The tycoon computer (-130.4, -1487.6) and the foreman (-125.4, -1486.8) are then inside it. Their props stay
      where they are.
    - The model comes in a later batch.
11. **Floodlights**: add a fourth tower at (-157, -1483).
12. **Road signs**: replace HAUL ROAD (-132.5, -1464) and OLD QUARRY (-134, -1462) with one entrance board at
    (-133, -1463).
13. **Colliders**: give every upgrade building an obstacle (winch house, skip tower, hopper legs, feed hopper,
    refinery, assay office, casting robot base). Each model batch lists its boxes.

### Please check
- **Route grid:** the pit floor (`fl`) and the haul-road lane (`strip`) are both at -12, but they're separate plates.
  The route grid may treat them as different levels, which would put a wall at z -1473 for AI drivers. If it does,
  join them.

## Part 2: models

### Batch 1: the smelting yard and the mine head (`models/quarry-yard.js`), approved
Load it after `models/fort-kit.js`: it uses `fbKit` for materials and helpers. New globals: `qmKit, qmFurnace,
qmMoldTable, qmGrinder, qmWinch, qmAssay, qmOreHopper, qmPad, qmTurn`. None of them clash with existing names.
- **The yard faces the pit.** Build the furnace, the mold table, the grinder and the assay office with
  `qmTurn(fn, g, x, z, F)`, which turns them about their centre so they face -z (out into the pit, away from the
  north wall). It returns the same hooks, with the obstacles already mirrored.
  - Move each one's prop to its new front: the smelt prop to (SM.x, SM.z - 2.6), molds (SM.mx, SM.mz - 1.6),
    grinder (SM.gx, SM.gz - 2.2), and the assay office's counter side.
- **Foundations** (`qmPad`, 10 cm concrete). Add a plate at F + 0.1 over each one:
  - the smelting yard x -240..-202, z -1453..-1440.6, drain 'n';
  - the mine head x -251.6..-241, z -1456..-1440.6, drain 'w';
  - the ore hopper x -193.5..-186.5, z -1449.6..-1440.6;
  - the skip tower x -243.5..-236.5, z -1463.5..-1456.5.
- **`qmFurnace`** replaces the box, the chimney and the mouth in dx581's smelter block. `SM.mouth` = the returned
  `mouth`. Keep the overhead rail, the trolley, the crucible and the stream as they are. Note the rail now sits over
  the furnace's front, so its z mirrors: RZ = z - 0.6.
- **`qmMoldTable`**: `SM.molds` = the returned `molds` (6 fill meshes, same order).
- **`qmGrinder`**: `SM.gw` = the returned `gw` (2 wheels, same axis).
- **`qmWinch(g, -246, -1441.7, F, el)`** replaces the winch house in `qtBuild`. `QA.drum` = `drum` (turn it on x
  now, not z), `QA.wl` = `wl`, and `QA.exh` = `exh` when diesel. Run the rope to the sheave from `ropeFrom`.
- **`qmAssay(g, -208, -1447, F)`**, built through `qmTurn`: `QA.bal` = `bal`.
- **`qmOreHopper(g, QHOP.x, QHOP.z, F)`**: `QA.hop` = `hop`. A chute now runs down into a concrete basin on the pit
  side.
  - Call `pour()` whenever ore goes into the hopper (an excavator bucket dumped); rocks slide down the chute into the
    basin.
  - Call `tick(dt)` every frame (from the existing `qtTick` is fine). `setFill(0..1)` sets how full the basin looks.
- Push every returned `obs` to `q.obs`.

**Depth nudges:** every model file now uses `polygonOffsetUnits` only (factor 0), as you found works in r616.

### Batch 2: the rim (`models/quarry-rim.js`), approved
New globals: `qmCrusher, qmOffice, qmFlood, qmEntrance`.
- **`qmCrusher(g, CR.x, CR.z)`** replaces the crusher block in dx581: the house, hopper, jaw, flywheels, chute,
  conveyor, trestles, rocks and stockpile. It returns the same hooks, so the existing anim keeps working:
  - `btx.offset.y -= ...` scrolls the belt; the UVs are flipped so it now runs uphill, the way the rocks go;
  - `fws` turn on x, `jaw.position.y` bobs, and `rocks` ride along `cv`'s z.
  - **Also call `tick(dt)` in that anim:** rocks then drop out of the head spout and roll down the pile.
  - The truck still tips into the hopper (rim at y 6.9).
  - Push `obs`: the house, and the trestle legs either side of the belt.
- **`qmOffice(g)`**: the walk-in office at x -134..-122, z -1496..-1485, with the door in the north wall at x -128.
  Replace the solid box and its obstacle with the returned wall `obs`, and add the floor `plate` (y 0.6).
  - The steps go down to the ground on the north side.
  - Move the tycoon computer `kg` to x -133.2 (west wall desk end), z -1487.6, facing east, and its prop to match.
  - The foreman stands inside at (-125.4, -1488) on the floor plate.
- **`qmFlood(g, x, z, aimX, aimZ)`** at the four corners: (-263,-1483), (-157,-1483), (-157,-1429), (-263,-1429),
  aimed at the pit centre (-210,-1456). This replaces the three old towers. Push `obs`.
- **`qmEntrance(g, -133, -1463, -Math.PI/2)`** replaces the two road signs.

### Batch 3: the processing machines (`models/quarry-proc.js`), approved
Load it after `quarry-yard.js`. New global: `qmMachine`. It doesn't clash with any existing name.
- **Positions:** use the new `QPOS` from part 1:
  - row 1, z -1459: sortr -234, wash -228, mill -222, heat -216, pol -210;
  - row 2, z -1466: gen -228, silo -222, lab -216.
- **Facing:** both rows face the walkway between them, at z -1462.5.
  - Call with `face = -1` for row 1 and `+1` for row 2.
  - Row 1 is **mirrored** (`scale.z = -1`), not turned. That way ore always enters on the west side (-x) and leaves on
    the east (+x), matching `qtLinks`' belts. The signs are added straight to the section group, so their text isn't
    mirrored.
- **In `qtBuild2`'s `mk`:** replace the pad, the name plate, the obstacle push and the machine body with
  `const h = qmMachine(id, g, x, z, F, l, z > -1462 ? -1 : 1)`.
  - Push `h.obs` (marked `qtm: 1` as before).
  - Assign the hooks: `QA.wash = h.wash`, `QA.washP = h.washP`, `QA.sortD = h.sortD`, `QA.mill = h.mill`,
    `QA.heatF = h.heatF`, `QA.pol = h.pol`, `QA.gen = h.gen`, `QA.labD = h.labD`, `QA.labL = h.labL`.
  - `qtTick2` doesn't need changing. The lab dish is now a group (dish, feed arm and receiver), so the whole dish
    turns on its post.
  - Everything goes into the section group `g`, so `qtConstruct`'s build-up animation still works.
- **Preheater pipe:** keep the hot-ore pipe to the furnace, but start it at the returned `h.out` (the top of the drum).
- **Belts:** `qtLinks`' belts still run from centre ± 1.55, and every machine now has something at those spots:
  - the sorter's own tail pulley, the washer's feed box, the mill's feed hopper and the preheater's feed chute take
    belts in on the west side;
  - the sorter's splitter, the washer's outlet chutes and the mill's discharge screen sit over the outgoing belts on
    the east side.
