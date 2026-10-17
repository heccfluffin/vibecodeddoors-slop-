Status: part 1 (layout) approved by the user 2026-10-17 · part 2 (models) in progress

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
Coming in batches.
