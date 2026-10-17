Status: layout and batches 1-2 approved by the user 2026-10-17 · more batches coming

# Goblino's Scrap rework

The user: the scrapyard "got the job done but it is a bit shoddy". Part 1 tidies the layout (approved from a top-down
plan). Part 2 brings new models in batches, each with a preview and the user's OK, in `docs/design/models/scrap-yard.js`.

The yard is built by `xpScrap` (bak519 ~3943): fence x 60..180, z -1380..-1300, with the gate gap in the west fence at
z -1350..-1338. The crusher line is built by `xpCrusher(X, x0 + 30, z1 - 24)` = (90, -1324). The monster truck spawns in
`xpVehicles` at (150, -1312), and the rummage pile is the 'scrap pile' step (bak519 ~6278) at (100, -1312).

## Part 1: layout
- **Drive lane:** z -1347..-1341, from the gate to x 178. It's painted into the floor (batch 1).
- **Gate:** sliding gates in the existing gap, and a weighbridge just inside at x 64..74, z -1347..-1341.
- **Office:** it moves out of the gateway (today its box stands at (69, -1350), in the gap) to x 64..72,
  z -1364..-1356, with its counter window on the lane side. El Goblino stands inside at the counter.
- **Crusher line:** it stays at (90, -1324), but **its bay opens towards the drive lane (-z) instead of away from it.**
  A turn-in from the lane (x 86.5..93.5, z -1341..-1326.6) is painted into the floor. The conveyor will reach right to
  the melter (batch 3).
- **Car stacks:** two rows, z -1373 and z -1361, at x 88, 98 ... 148 (4.8 m square each).
- **Magnet crane:** at (160, -1366), among the stacks (it swings 14 m).
- **Scrap bays:** three concrete bays along the north side, at x 120 / 132 / 144, z -1316..-1303. The rummage pile moves
  into the third (144, -1309.5).
- **Tyres:** the tyre mountain at x 64..82, z -1316..-1303, with a rack at x 84..86.
- **Monster truck:** a display pad at x 158..172, z -1318..-1306. **Move its spawn to (165, -1312)**, because the old
  spot falls on the third bay.
- **Floodlights:** one in each corner (batch 1).

## Part 2: models

### Batch 1: the yard (`syYard(g)`), approved
Load `models/scrap-yard.js` after `models/fort-kit.js`. New global: `syYard`. It doesn't clash with any existing name.
Call `syYard(g)` in `xpScrap` and push its `obs`. It builds:
- the yard floor, a plane at y .025: gravel, the drive lane, the crusher turn-in, the stack aisles, and oil and rust
  stains, all in one texture;
- the fence: corrugated sheets on posts every 3 m, and barbed wire on arms leaning out;
- the sliding gates, slid open behind the west fence, on a track, with two gate posts and lamps;
- the weighbridge;
- the office;
- the entrance sign;
- four floodlights.

In `xpScrap`, change these:
- **Fence:** drop the merged post-and-board fence mesh (the `parts` / `mergeGeo` line). Keep its five `ob(...)` lines
  as they are; the new fence is on the same lines, with the same gap.
- **Office:** drop the box and roof (`A(BX(5,3,4)...)`, `A(BX(5.6,.3,4.6)...)`) and its `ob`. The returned obs include
  the new office.
- **El Goblino:** move him into the office, at the counter: `gb.position.set(67.4, .35, -1356.8)`, facing the lane
  (+z). His talk prop goes to (68, -1354.6) and the light to (68, 3.6, -1355).
- **Sign:** drop the `sign("GOBLINO'S SCRAP...")` call. The new entrance sign stands at (54, -1352), outside the fence
  north of the gate.

### Batch 2: the car stacks and the magnet crane, approved
New globals: `syFlatCar, syStacks, syCrane`. None of them clash with existing names.
- **`syStacks(g)`** replaces the nine `mkOldCar` stacks and their `ob`s. It builds 14 stacks in two rows (layout
  above), each 2-4 flattened cars, crosswise in alternating layers. Push its `obs`.
- **`const cr = syCrane(g, 160, -1366)`** replaces the crane block. Push `cr.obs`.
  - Replace the crane's anim with `anim(160, -1366, 160, () => cr.tick(q.rt))`. It's the same swing and lift as
    before, and the cable now stretches between the boom tip and the magnet.
  - `cr.arm` keeps `userData.mv = 1`.
- `syFlatCar(colour, seed)` is a single flattened car. Batch 3 can use it for the crusher's output cube, if you like.
