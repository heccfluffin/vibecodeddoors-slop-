Status: part 1 (layout) approved by the user 2026-10-17 · part 2 batches 1-4 approved · batch 5 (middle and restricted zone) next

# Fort Blackout rework

The user: the base "has stuff just shoved into it". Part 1 is the new layout, which the user approved from a top-down plan.
Part 2 is the building models, which come one batch at a time, each with a preview and the user's OK, from
`docs/design/models/fort-*.js`. Build part 1 whenever you like. It doesn't need the new models.

All coordinates are desert world x/z (world z = local z + q.OZ). North = -z (the gate is at the top of the map).
I checked these against your constraints note in NOTES.md (2026-10-17).

## Part 1: layout

### What doesn't move
- **Main gate** at x 552..568, z -930, and the `WK_GATE` points (561,-990/-962/-938).
- **The north wall** (z -930) and the east and south walls. The **west wall moves** out to x 215 (see "The base grows west").
- **Runway 09** (`ALB`, centre line z -980, landing from the west, touchdown about x 265).
- **Command wing** (`CWB`), **Wraith bays** (`WBAY`) and their airlock doors.
- **HQ, the barracks huts, latrines, recruiting office, mess hall, boot camp, depot, tank park, LZ Bravo, mortars,
  range, hangar, launch control, Silo 1, radar.** Their footprints stay where they are. Part 2 reskins them.

### Roads
All roads are 7 m wide (the taxiway is 8 m), concrete, with a kerb (0.15 m high, 0.3 m wide) and a 1.5 m pavement
wherever a building faces the road. Lamp posts go every 25 m on one side.

| Road | Centre line | Notes |
|---|---|---|
| Gate Avenue | x 560, z -1004 → -735 | Was -1033.5 → -735. It now starts at the new outer checkpoint (below). |
| North Street | z -885, x 222 → 560 | Was x 420 → 560, ending under the squad shed. Now it runs the full width of the base. |
| Parade Road | z -805, x 415 → 560 | New. Joins Gate Avenue to the Wraith bay apron (the apron ends at z -814). |
| Parade Lane | x 475, z -885 → -805 | New. Runs between the command wing (ends x 470) and the parade ground (starts x 480). |
| South Street | z -735, x 222 → 560 | Was x 470 → 560. |
| West Road | x 296, z -885 → -735 | New. Joins North and South Street along the new west strip. |
| Airside lane | x 491.5, z -940 → -885 | New. Through a new **airside gate**, a gap in the north wall at x 488..495. |
| Taxiway | z -952, x 513 → 556.5 | New, 8 m. From the jet apron to Gate Avenue. |
| ~~z -905, x 520 → 560~~ | removed | It ran through the new motor pool canopy. |

- **Plaza walkway**, x 412..418, z -880 → -827: for people only, paved, not a road. Put bollards across both ends with
  gaps under 3 m, so the base route grid closes it to vehicles.
- **`milRoads`**: replace with the lines above. **Police and squad routes:** Gate Avenue keeps its line, so beats that
  use it only gain the stretch to the outer checkpoint. Nothing else outside the base moves.

### Moves (old → new)
1. **Squad motor pool** `MPOOL`: x 455..485, z -901..-872 → **x 495..525, z -925..-896**.
   - Four roller doors on the **south wall**, centred x 499, 506.5, 514, 521.5, opening onto an apron (z -896..-888.5)
     and North Street.
   - The crew door is on the west wall at z -905, facing the airside lane.
   - `CWPOOL` spawn points: (499,-892), (506.5,-892), (514,-892), (521.5,-892), facing south (+z).
   - The squad vehicles park inside in four rows, one per door, facing south.
   - The crew walk from the offices: out of the office doors, along Parade Lane, then across North Street.
2. **Old motor pool canopy** (x 490..540, z -925..-885) → **x 528..553, z -925..-893**.
   - Keep the order of the `addVeh` calls (co-op vehicle ids).
   - 3 jeeps at (533,-919), (540.5,-919), (548,-919), facing south.
   - 2 trucks at (535,-907), (547,-907).
   - The APC at (541,-897), facing south.
   - Workshop bench along the back (z -924.5, x 530..550). Supply pallet `SUPPAL` → (551,-911).
   - The sign moves to the canopy's front edge.
3. **Parade ground** paint: x 420..560, z -880..-800 → **x 480..553, z -878..-812**.
   - Flagpole → (516,-872), halyard prop beside it.
   - Podium → (516,-866), facing south.
   - Formation (18 + sergeant) centred (516,-854), facing north (towards the flag).
   - Bleachers → x 482..485.7, z -862..-842, facing east.
   - Floodlights → (482,-876), (551,-876), (482,-814), (551,-814).
   - Inspection posts: spread round the parade ground's edge.
4. **Command plaza**, x 401..429, z -880..-827: paving, planters and benches round the walkway. Its floor is decoration
   only; give the planters colliders.
5. **Flak tower** (450,-924) → **(462,-924)**, clear of Hut 3's back wall.
6. **Gun pit** (400,-740) → **(400,-750)** with its prop, off South Street.
7. **Maintenance tank** in Hangar 1 (342,-692) → **(395,-700)**, off the refit pad. Remove the second set of hangar tool
   carts (bak:6825; they are built twice).
8. **Uplink** `UPLK` (447,-693.6) → **(449.5,-693.6)**, clear of the radar dome.
9. **Launch control guards** → (537,-719.5) and (546,-719.5), facing north (rotation 0), either side of the door.
10. **Leftover X-13 trials beacon** at (520,-666): remove.
11. **Tank patrols** (`ML.gtk`):
    - loop 1 runs round the parade ground on the roads: (475,-885) → (556,-885) → (556,-805) → (475,-805);
    - loop 2 runs back and forth along South Street: (335,-735) ↔ (552,-735).
12. **Foot patrols**:
    - patrol 1 round the parade ground pavement;
    - patrol 2 along North Street;
    - patrol 3 along the inside of the airfield fence.

### The airfield annex
The runway becomes part of the base: a fenced annex joined to the north wall.
- **Fence**: (300,-930) → (215,-930) → (215,-1004) → (552,-1004). Then a gap for the outer gate, then (568,-1004) →
  (600,-1004) → (600,-930).
  - Chain-link, 3 m high, with posts every 3 m and a strand of razor wire.
  - Where it crosses the runway line (x 215, z -998..-962) it is a **1 m** barrier, so landing planes clear it.
  - Colliders on the fence.
- **Outer checkpoint** at (560,-1004): a booth, a lifting barrier on the same rules as the main gate barrier, and a
  guard. The **dragon's teeth** move here as a zig-zag chicane outside it (z -1016..-1008), with colliders.
  Remove the old row at z -939.
- **Guard towers** at (230,-1000) and (598,-1000).
- **Jet shelters** move 4 m north: back walls from z -931 → **-935**, so they no longer touch the base wall.
  The apron stays at x 403..513, z -964..-940.
- **Air Ops** building, x 305..345, z -962..-936, door on the north side.
- **Aviation fuel farm**, x 350..396, z -960..-940.
- **Approach lights**, x 214..234, z -985..-975 (no colliders).
- The control tower stays at (545,-944).
- **"On base" check**: add the annex rectangle **x 215..600, z -1004..-930** to `milArea` (and to the map frame).
  Military rules apply inside it as on the base. `MILAA` already covers it.

### The base grows west
The base becomes one rectangle with the airfield: the **west wall moves from x 300 to x 215**, in line with the airfield
fence.
- **`MILB`** → x **215**..600, z -930..-660. **`MILRZ`** → x **215**..600, z -725..-660 (the restricted fence and its
  laser gate at x 462..478 stay; the fence just runs further west). **`MILAA`** → x **200**..670, z -1000..-590.
- **"On base" check** (with the annex above): x 215..600, z -1004..-660, one rectangle.
- **The old west wall** at x 300 goes, with its razor wire and its sentry sign.
  - The four west wall turrets move to x 215 (same z: -700, -780, -860, -910).
  - The NW and SW flak towers follow `X0` (now 221). The RZ sentry signs follow `X0`.
- **Please check:** no other desert feature sits in x 215..300, z -930..-660 (the milBuild "ground" step already clears
  dunes inside `MILB`).
- **New in the strip.** Footprints are below; part 2 brings the models. Until then, plain boxes with the names are fine.

| What | Footprint | Notes |
|---|---|---|
| Power plant (generator hall, fuel day tank, cooling fans) | x 225..265, z -924..-898 | Door S. Could later feed the `ML.power` / substation story. |
| Water treatment and pump house | x 270..290, z -924..-898 | Door S. The water tower stays at (312,-896). |
| Solar array | x 225..290, z -879..-869 | Low panels on frames, 1.2 m high. |
| Heliport West hangar | x 222..250, z -858..-834 | Door E, facing the pads. |
| Helipads W1, W2, W3 | centres (275,-848), (275,-822), (275,-796), radius 9 | Painted H, edge lights. Park spare UH-9 / AH-4 here if you like (they must fly home to their own pad). |
| Fuel bowser and crew hut | x 228..246, z -826..-818 | |
| PX store and gym | x 222..260, z -772..-746 | Door E. A shop counter inside is a later idea; for now, closed blinds. |
| Basketball court | x 266..290, z -770..-748 | Two hoops, painted lines, a low fence. |
| Armoury and weapons test bunker | x 225..290, z -716..-672 | Inside the restricted zone. Door N. |

### Map labels (`MAPBN`), name and centre
HQ (360,-860) · Command Wing (450,-853) · Wraith Bays (450,-835) · Motor Pool (524,-909) · Parade Ground (516,-845) ·
Barracks (388,-912) · Latrines (474,-916) · Recruiting (586,-910) · Mess Hall (582,-892) · LZ Bravo (582,-848) ·
Boot Camp (364,-812) · Depot (350,-782) · Tank Park (470,-780) · Range (556,-765) · Hangar 1 (375,-694) ·
Launch Control (527,-701) · Silo 1 (578,-700) · Radar (442,-700) · Air Ops (325,-949) · Fuel Farm (373,-950) ·
Shelters (448,-946) · Tower (545,-944) · Runway 09 (385,-980) · Power Plant (245,-911) · Water (280,-911) ·
Heliport West (250,-846) · PX (241,-759) · Armoury (257,-694).

### Missions
Nothing a mission uses is removed. The squad motor pool moves (missions and crimes that point at `MPOOL` follow the
constant). The old canopy's vehicles move with it. The parade ground props (flag, inspection) follow item 3.

## Part 2: building models
Each batch lists its file, its builder functions and what they replace. Everything is static meshes with opaque
materials (the fence uses alphaTest, not transparency), so the `DP` batching merges it.

### Batch 1: the base kit (`models/fort-kit.js`), approved
Shared materials and helpers are in `fbKit()`. New globals: `fbKit, fbDress, fbWall, fbGate, fbCheckpoint, fbFlak,
fbGuardTower, fbFence, fbRoad, fbLamp, fbSignpost, fbBollard, M_red` (I checked: no clashes).
- **`fbDress(g, b, style)`** gives the plain `BLD` boxes a new outside: a block skin 5 mm off the outer faces, a plinth,
  windows, a door frame, a canopy with a lamp and a name board, drainpipes, and a roof by style. It only adds things
  outside the walls and above the roof slab, so rooms, props and obstacles inside don't change. Call it straight after
  each `BLD(...)` with the same numbers, and **drop that BLD's `o.lab`** (the name board replaces it):
  - Huts 1-3: `fbDress(g,{x0:a,x1:b,z0:-922,z1:-902,h:3.4,sd:'s',da,db,name:'HUT '+(i+1),num:i+1},'hut')`
  - Latrines, Recruiting office, HQ: style `'flat'`, name as the old label.
  - Ammo bunker and Launch control: style `'bunker'` (earth mound round the three sides without the door, concrete
    wing walls). Add obstacles for the mounds: the mound reaches `1.1*h` out from each of those walls.
    The launch control mound must not cover Silo 1 or the radar: trim its east side if it does (or skip the mound on
    that side, see the code's `ex` per side).
  - The mess hall, the new motor pool and the west-strip buildings come in batch 2.
- **`fbWall(g, ax, c, a0, a1, h)`** draws a perimeter wall run (0.8 m thick, 6 m high, panels between pilasters, razor
  wire, floodlights). In milBuild's 'wall' step, keep the `ob(...)` boxes, but draw each run with `fbWall` instead of
  `W`'s mesh, the razor tori and the dark top boxes. Runs: north x X0..552 and 568..X1 at z -930; south and east as now;
  west at the new X0 (215).
- **`fbGate(g, 560, -930)`** replaces the lintel, its sign, the two gatehouse meshes and the barrier. Keep the
  gatehouse obstacles (x 548..552 and 568..572, z -929..-925), the soldiers, the "HALT" sign and the visitors' lane.
  **`ML.arm` = the returned `arm`** (same pivot (552.5, 1.25, -922), still turned on z by the existing anim).
- **`fbFlak(g, x, z)`** replaces the legs, braces, platform and parapet of each flak tower. The platform top is still
  y 12.4, where `mkTurret(..., 12.4, 'aa')` goes. Keep the `ob`. The red light: use the returned `beacon` instead of
  `rl` in the anim (same blink); the glow sprite stays.
- **`fbGuardTower(g, x, z)`** at (230,-1000) and (598,-1000). Obstacle 3.4 x 3.4 m.
- **`fbFence(g, x0, z0, x1, z1, h)`** for the annex fence: h 3 everywhere, h 1 across the runway line
  (x 215, z -998..-962). Add the `ob` boxes along it (0.2 m thick).
- **`fbCheckpoint(g, 560, -1004)`**: the outer checkpoint booth and barrier. Its `arm` follows the same rule as the
  main gate's. Booth obstacle 3 x 3 m at (566.5,-1004).
- **`fbRoad(g, x0, z0, x1, z1, w, {gaps, pave, lamps, lampSide})`** draws each road from part 1 (concrete slabs, lines,
  kerbs, pavements, lamps every 25 m). If the game's own `road()` also feeds the route grid or the map, keep those
  calls and only hide their meshes. Kerbs have no colliders.
- **`fbSignpost(g, x, z, ry, lines)`** at the junctions (for example ['HQ →', '← BARRACKS', 'MOTOR POOL →']).
  **`fbBollard(g, x, z)`**: across both ends of the plaza walkway, 1.2 m apart.

**Batch 1 fixes (after approval, same file):** painted lines and decals use `k.LINE` / `k.LINEY` (1 cm up plus a
polygon offset), every text plate from `k.lab` has a polygon offset, and `fbRoad` takes `trim:[t0,t1]` for a road that
ends at another road (0.3 if that road has only a kerb on this side, 1.8 with a pavement), so kerbs and pavements don't
overlap at junctions. Give every junction its gap on the through road and its trim on the road that ends.

### Batch 2: motor pool and parade ground (`models/fort-north.js`), approved
New globals: `fbMotorPool, fbCanopy, fbParade, fbFlagpole, fbPodium, fbBleachers, fbFloodMast`.
- **`fbMotorPool(g, {x0:495,x1:525,z0:-925,z1:-896, doors:[499,506.5,514,521.5], crewZ:-905})`** replaces `cwShed`'s
  meshes. It returns `{doors:[{x,m,lt}], obs}`:
  - push `obs` to `q.obs`;
  - each door's `m` is 4 m tall and centred at y 2, so the existing `d.m.scale.y = hh/4; d.m.position.y = 4 - hh/2`
    works unchanged;
  - `lt` is the door's lamp mesh with its own material.
  The doors are now in the **south wall**, so the "is a squad vehicle at this door" test changes from z rows on the
  east wall (`Math.abs(u.v.z-d.rz)<4 && u.v.x > MPOOL.x1-12 ...`) to x columns on the south wall
  (`Math.abs(u.v.x-d.x)<4 && u.v.z > MPOOL.z1-12 && u.v.z < MPOOL.z1+14`). The vehicles inside park facing south,
  one per door column.
- **`fbCanopy(g, 528, 553, -925, -893)`**: the open vehicle canopy and workshop. Push the returned `obs`. It carries
  the "MOTOR POOL · CORPORALS AND UP" sign, so drop the old one.
- **`fbParade(g, 480, 553, -878, -812)`**: the square, the marching grid and the badge. It replaces the old painted
  plane and lines in the 'ground' step.
- **`fbFlagpole(g, 516, -872)`** returns `{flag, wave}`. **`ML.flag = flag`**. The existing anim keeps setting
  `flag.position.y` (2 → 11.2). Call `wave(q.rt)` in that anim instead of turning `fl` and `st`. The flag is green
  with an eye; the old pole and its 0.4 m obstacle go, so give the new base an obstacle of x 515.1..516.9,
  z -872.9..-871.1.
- **`fbPodium(g, 516, -866, 0)`** faces south. Its `obs` are in local coordinates (centre ± 3.1 x 1.6) at
  (516,-866).
- **`fbBleachers(g, 482, 485.7, -862, -842, 'e')`** replaces the bleacher boxes (build.py:262/343 patches).
  Obstacle: the whole footprint.
- **`fbFloodMast(g, x, z, ry)`** at the four corners of the parade ground, aimed in: (482,-876, -0.75π),
  (551,-876, 0.75π), (482,-814, -0.25π), (551,-814, 0.25π). Obstacle 1 x 1 m each.
- The mess hall, recruiting office and latrines use `fbDress(..., 'flat')` from batch 1, with the names as their
  old labels.

**Kit fixes with batch 3:** the building skins use `k.SKIN` / `k.SKINP` (a small polygon offset) because they sit only
3.5 cm in front of the game's walls; windows, frames, sills and text plates on them use a bigger offset (`k.PO2`).
`fbDress` takes `b.noWin:['e',...]` to leave windows off a side.

### Batch 3: the west strip (`models/fort-west.js`), approved
New globals: `fbShell, fbPowerPlant, fbWaterWorks, fbSolar, fbHeliHangar, fbHelipad, fbWindsock, fbFuelPoint, fbPX,
fbCourt, fbArmoury`. Each builds at its part 1 footprint and returns `{obs}`: push them all to `q.obs`. None have rooms:
they're closed shells (the core sits 25 cm inside the skin) with closed doors.
- `fbHeliHangar(g)` is the exception: it's open at the east end with a floor inside, so a helicopter can be parked
  in it. Its `obs` are the walls and the two door panels.
- `fbHelipad(g, 275, -848, 'W1')`, `(275,-822,'W2')`, `(275,-796,'W3')`; `fbWindsock(g, 288, -860)`.
  If you park spare helicopters here, they fly home to their own pad.
- `fbArmoury(g)` also returns `lamp` (the test cell's red lamp): blink it in an anim if you like.
- The power plant could later light up when `ML.power` is on, and go dark in an outage. Not needed now.

### Batch 4: the airfield annex (`models/fort-air.js`), approved
New globals: `fbShelter, fbTower, fbAirOps, fbFuelFarm, fbApproachLights`. The kit's `fbRoad` takes `{taxi:true}`:
no kerbs, with a yellow centre line. The kit's `k.H` now also has `tube`.
- **`fbShelter(g, x, n)`** at x 418, 448, 478 (n 1-3) replaces the three shelters in `awBase` (the cylinder, the back
  wall, its obstacles and the "SHELTER n" decal). Their back walls move 4 m north, to z -935. Each shelter is open to
  the north and its front is at z -957. Push the returned `obs`. The jets' parking spots (418/448/478, -950) stay inside.
- **`fbTower(g, 545, -944)`** replaces the tower meshes. Keep the obstacle and the glow sprite, and put the sprite at
  the returned `beacon` position.
- **`fbAirOps(g)`**, **`fbFuelFarm(g)`**, **`fbApproachLights(g)`**: push their `obs`. A 5 m service road runs along
  the base wall: `fbRoad(g, 300, -933.2, 403, -933.2, 5, {taxi:true})`. The taxiway is
  `fbRoad(g, 513, -952, 556.5, -952, 8, {taxi:true})`.
- The fence, guard towers and outer checkpoint are in batch 1. The old dragon's teeth row at z -939 goes; put the new
  chicane at z -1016..-1008 (simple concrete blocks with colliders are fine).
- `awBase` still draws the runway, its lines, the apron, the windsock and the fleet. Keep those.
