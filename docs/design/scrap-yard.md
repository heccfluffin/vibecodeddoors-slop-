Status: approved by the user 2026-10-17: layout and all four model batches, to build

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

### Batch 3: the crusher line (`syCrusher(g, cx, cz)`), approved
New global: `syCrusher`. It doesn't clash with any existing name.

**In `xpCrusher`:** replace everything from the bay down to the ingot pile's base with `const H = syCrusher(g, cx, cz)`,
and push `H.obs`.
- Keep the game's light `fl` (put it at `H.flAt`) and its smoke sprite `smk` (at `H.smkAt`).
- Build `q.crush` from H: `pr, ram, belt, btx, bx0, bx1, bz, fx, fz, mouth, mx, mz, fill, lp, lm, stream, px, pz, sg, y0`.
  Then `q.crL = H.crL`.

**The bay now opens towards the drive lane (-z):** the back wall is on the +z side, and the sign and the warning lamps
face the lane. Move the crusher prop to (cx, cz - 3.6).

**The conveyor** now runs from the bay wall right to the melter's charging door (no gap). `bx0` and `bx1` keep their
values, so the cube's path is the same.

**`crushTick` changes:**
- **Press:** the platen now travels 3.3 m (it reaches the bed).
  - press: `pr.position.y = y0 - e*3.3; ram.position.y = 4.8 - e*1.65; ram.scale.y = 1 + e*2.75` (and the same in
    the 'cube' phase, going back up);
  - **the car only squashes when the platen reaches it:**
    `v.m.scale.y = C.sy * Math.max(.2, Math.min(1, (C.pr.position.y - .51) / H))`, where H is the car's height
    (`(v.K.ht || 1.7)`). Before, it shrank from the start, before the press touched it.
- **Ladle:** the ladle is now a pot on trunnions inside a bail. `lp` is the pot, at its middle, at y 2.6. It tips
  towards the mould on x as before (`lp.rotation.x = tilt * 1.15`). Its spout faces the mould, and the furnace's tap
  spout runs out over it.
- **Into the melter:** the old cube slid on past the belt and shrank through the furnace wall. Now it tips over the
  end drum into the charging door, and the door drops shut behind it. Add `cd` (the door) to `q.crush`, and replace
  the 'melt' phase with:
  ```js
  const u=Math.min(1,C.t/2.4),k=Math.min(1,u/.6);
  if(C.cube){C.cube.position.x=C.bx1+.2+k*2.4;C.cube.position.y=1.17-Math.max(0,k-.35)*.5;C.cube.rotation.z=-Math.min(1,k*1.6)*.35;
   if(u>=.6&&C.cube.parent){C.cube.parent.remove(C.cube);C.cube=null}}
  C.cd.position.y=u<.6?2.95:2.95-Math.min(1,(u-.6)/.25)*1.4;
  if(u>=1){C.ph='pour';C.t=0;C.lm.visible=true;snd(260,.3);setTimeout(()=>snd(200,.4),300)}
  ```
  Keep the sparks at the door. Drop the old scale-down and emissive tint.
  In 'cool', reopen the door: `C.cd.position.y = 1.55 + Math.min(1, C.t / 1.2) * 1.4`.
  The mouth glows brighter in 'melt' and in 'pour'.
- **Pour stream:** `stream.position.y = 1.62; stream.scale.y = 1.6`. The stream is placed at the spout's x (mx + .2).

**Gameplay changes the user asked for:**
- **Spawned cars and the Wraith can't be crushed.** In `crushOK`, add `&& !v.sp && !v.K.proto && v.k != 'proto'`.
  When one stops in the bay, show the hint once:
  `🗜️ El Goblino shakes his head. "That one is not scrap, amigo. Bring me a real wreck."`
- **An ingot's value depends on the car.** Pay `crushPay(v)` instead of a flat 15.
  - `crushPay(v)`: the car's value from the garage list (`GARK` price × 0.15) if it's there. Otherwise its size:
    `Math.round(v.K.w * v.K.len * 1.2)`. Clamp to 8..60.
  - For example: a quad ≈ 8, a sedan ≈ 18, a jeep ≈ 30, a limo or hearse ≈ 25-35.
  - Store it on the ingot (`ing.userData.val`), show it in the hint ("Ingot #3 cast! A sedan's worth: 18 gold"), and
    tint the ingot: below 15 dull grey, 15-29 steel, 30 and up bright and shiny.
  - The sign text becomes 'THE CRUSHER\nDRIVE IN · STOP · GET PAID' and the pallet's label 'INGOTS · PRICED BY THE CAR'.

### Batch 4: the scrap bays, the tyres and the monster truck pad, approved
New globals: `syBays, syTyres, syMonsterPad`. None of them clash with existing names. Push every returned `obs`.
- **`const b = syBays(g)`:** three block-built bays (steel / copper & brass / dig in) at x 114.5..149.5,
  z -1316..-1303.
  - **The rummage pile moves into bay 3.** In the 'scrap pile' step, drop the 22 pieces, their `ob` and the old
    "SCRAP · DIG IN" label (the bay has its own board).
  - Move the rummage prop to `b.rummage` = (144, -1318), at the bay's mouth.
- **`syTyres(g)`:** replaces the 16 tyre-stack loops and their `ob` in `xpScrap`. It builds the tyre mountain and the
  rack beside it.
- **`const mp = syMonsterPad(g)`:** a plinth (top at y .33) with a ramp, a banner, flag poles and spotlights.
  - **Move the monster truck's spawn** in `xpVehicles` from (150, -1312, π/2) to `mp.spawn` = (165, -1312, 0). It then
    faces out over the ramp.
  - The plinth is 30 cm high. Add a `q.plates` entry for it (x 158..172, z -1318..-1306, y .33) so cars sit on it, and
    a `q.ramps` entry for the ramp (z -1320.1..-1317.9, x 163..167).
- **Stealing the monster truck makes you wanted (the user asked for this).** If you drive it more than 15 m off its
  pad and you haven't bought it, El Goblino reports it, like the other theft crimes in dx585. The wanted level goes up
  by 2 stars, with the hint `🚨 El Goblino: "¡LADRÓN! My monster truck!" The Desert PD are on their way.`
  - It applies once per theft: the trigger resets when the truck is back on its pad, or after it respawns.
  - Owning a monster truck from the garage (`garOwned('monster')`) means that one isn't stolen. Only the yard's own
    truck counts.
