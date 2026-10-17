Status: part 1 (layout) approved by the user 2026-10-17 · part 2 batches 1-4 approved · more batches coming

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
- **Belts:** each machine now returns `ins` and `outs`, the exact belt end points [x, y, z] on its west and east sides.
  Its outlet is lower than its inlet, so ore drops through the machine and the belts between machines climb.
  - Keep the hooks of every machine by id, e.g. `QA.mpos[id] = h`.
  - In `qtLinks`, make the ore-line belt from machine A to machine B
    `qtBelt2(g, QA.mpos[A].outs, QA.mpos[B].ins, .55, 1)` instead of `belt(...)` with the 1.55 offsets.
  - The "last machine to the furnace roof" belt starts at that machine's `outs`.
  - The heights:

    | Machine | Belt in (y above the floor) | Belt out |
    |---|---|---|
    | Sorter | 1.05 | .62 |
    | Washer | 1.93 | .64 |
    | Mill | 1.12 | 1.0 |
    | Preheater | 1.3 | pipe |

  - The washer's drums now sit at 1.55. Ore drops from the belt into a feed box at the top end, and outlet troughs
    under the drum mouths slope down onto the outgoing belt (towards the middle when there are twin drums).
- **Ore on the belts (the user asked for this):** while the line is running, show ore riding every ore-line belt between
  machines, the way the ore feed belt already does. For example, 5 or 6 small rocks per belt, in copper, iron and
  stone colours, added to `b.cv` and moved along `b.L` in `qtTick2`, visible only while ore is flowing.

### Batch 4: the automation and smelter upgrades (`models/quarry-works.js`), approved
Load it after `quarry-yard.js`. New globals: `qmGlow, qmMat, qmNS, qmSkip, qmOreFeed, qmCastRobot, qmBlower, qmArc,
qmPress, qmLaunder, qmRefinery`. None of them clash with existing names. Every builder takes the section group (from
`qtSec`), so the build-up animation still works. Push every returned `obs`.

**Skip hoist** (crew upgrade): `QA.skip = qmSkip(g, -247, -1453, F, -244.5, -1451.5, -249.5, -1454)`.
- The hooks are the same: `sk, skb, so, shv, cab2, x, z, TOP, bx, bz, bo`.
- It also returns `px, pz`, the rock pile. Put the miners round it on the same arc as now, but centred on (px, pz).
  Their spark spot in `qtTick` also becomes (px, pz) instead of (x + 1.2, z - 3).
- The skip now tips into an open head bin on the tower. A round downpipe on brackets carries the ore down, and a short
  spout drops it into the bunker; the old long chute is gone. Move the top dust puff to (x + 1.0, TOP - 1.3).

**Ore feed:** `const fd = qmOreFeed(g, SM.x - 4, SM.z + 4, F, SM.x - 1, SM.z + .4)`.
- `QA.feed.hp = fd.hp` and `QA.feed.fl2 = fd.fl2`. The hopper shake in `qtTick` (`hp.position.x = SM.x - 4 + ...`)
  still works.
- Run the feed belt `qtBelt2(g, fd.from, fd.to, .7, 1.2)`. It now ends at a charging chute on the furnace hood
  instead of inside it. Drop the old `DK` box at the belt end.

**Casting robot:** `QA.cast = qmCastRobot(g, SM.mx, SM.mz - 1.6, F)`.
- The joints are the same, but the old poses folded the arm back on itself. In `qtTick`'s `if(QA.cast)` block, use:
  - idle: `s1=.2, s2=.9, s3=.4`;
  - ready/pour: `s1=.55, s2=1.2, s3=.6`;
  - set/cool: `s1=.75 + tap bump (+.12)`, `s2=1.25`, `s3=.6`.

  The yaw code stays as it is. The arm then reaches over the molds.

**Blower** (furnace 1): `QA.fan = qmBlower(g, -236.8, -1451, F, SM.x - 2.2, SM.z - .4).fan`. The duct runs on stands
into the furnace's west wall.

**Arc furnace** (furnace 2): `QA.arc = qmArc(g, SM.x - .4, SM.z - 1.3, F).arc`.
- The gantry is over the front half of the furnace, clear of the chimney (SM.x + 1, SM.z + 1) and the crucible rail
  (RZ = SM.z - .6).
- In `qtTick`, the spark position changes from `SM.x + a.b, ..., SM.z + .4` to `a.el.position.x, F + 4.0, a.el.position.z`.

**Die press** (mold 2): `QA.press = qmPress(g, SM.mx, SM.mz, F).press`. Its rams stay in their cylinders at full stroke.
- **Launder:** `QA.laun = qmLaunder(g, [SM.x + 2.12, F + 1.45, SM.z - .3], [SM.mx - 1.3, F + 1.12, SM.mz - .3]).laun`.
  It now starts at a tap hole on the furnace's east wall and runs in front of the press column, not through it.

**Refinery** (mold 3): `QA.ref = qmRefinery(g, -232, -1452.3, F, SM.x + 1.2, SM.z - .2)`. The hooks are the same:
`vw, gc, gt, top`.
- Its pipe climbs the tank's east side, runs over the arc gantry at 7.1 m and drops onto the hood. Nothing stands in
  front of the firebox door.

**Batch 1 change:** in `qmFurnace` (`quarry-yard.js`), the firebox door leaf is now arched, matching the opening.
