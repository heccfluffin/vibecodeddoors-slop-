Status: layout approved 2026-10-18 · Speedway batches 1-3 and the wind farm (batch 4) approved · solar farm (batch 5) next · not ready to build yet

# The Speedway, the wind farm and the solar farm

Models in `models/speedway.js` (needs `fort-kit.js` and `airfield.js`). Desert-local coordinates, +z is north.
Layout plan: the design chat's "Speedway and Farms" plan page.

## Part 1: layout (approved)

### The Speedway (`xpSpeedway`)
- **The oval does not move**: centre (300, -1830), RX 110, RZ 38, 14 m wide; straights x 228..372; start line x 300
  on the main (north) straight, z -1792, driven east. `q.race` (checkpoints, lap logic, 25 s badge) is unchanged.
- Tyre walls stay at radius RZ-8 (inner) and RZ+8 (outer), except: the main straight has a concrete wall
  (x 228..303, z -1784) with a catch fence; the pit lane peels off at x 303 and curves in; a low pit wall runs
  x 330..372 at z -1784; past x 372 the pit exit is an 8 m band round the outside of the east bend that narrows to
  nothing by 0.6 rad, and the outer tyre wall follows its outside edge (`SPX.rOut`). (Changed during batch 2.)
- Behind the main straight: grandstand x 250..310, z -1781..-1766; race control tower x 314..322; pit lane
  x 323..378, z -1783.4..-1777; four pit boxes x 332..370; four garages x 328..372, z -1777..-1766.
- **Pit stops (new):** stop in a pit box (under ~5 km/h) and a crew of four runs out (jack, wheel guns, tyres,
  windscreen). About 4 s, then the car is fully repaired (`v.dmg = 0`). Show the pit stop time; keep the best one in
  the save and on the race board. The pit lane counts as track for the lap (extend `inT` so a pit stop doesn't scrap
  the lap).
- Entrance arch and ticket booth over the dirt road at z -1894..-1890; car park x 240..292, z -1895..-1880.
- Infield: paddock (three team trailers) x 250..330, z -1852..-1838; skid pad at (360, -1830), R 9; scoreboard
  x 285..315, z -1812..-1808 facing the grandstand; portaloos; six floodlight masts outside the oval.

### Wind farm (`xpWind`) and solar farm (`xpSolar`)
- Turbines stay in their spots (turbine 6 still turns the wrong way); gravel pads, service track, substation yard
  x -505..-482, z -1285..-1270; power line along the dirt road to Coyote Rd.
- Solar panels stay in the same 12 x 10 grid (still instanced); inverters at the row ends (x -44..-41.5); fence
  x -198..-38, z -1348..-1263 with a gate where the road arrives; control hut x -34..-24, z -1296..-1288; HALT's cart.

Batches: 1 track, kerbs, tyre walls, wall and fence, pit wall, start gantry · 2 grandstand, race control, pits,
pit lane, crew · 3 entrance, car park, infield, floodlights · 4 wind farm · 5 solar farm.

## Part 2: models

### Speedway batch 1 (approved) · `spTrack(g)` → `{obs, board, lights}` in `models/speedway.js`
Also exported: `SPW` (the oval's numbers), `spPt(u, r)`, `spLen()`, `spRibbon(...)` (the later batches use them).
- Replaces in `xpSpeedway`: the two straight planes and the two ring bends, the tyre InstancedMesh and its ~420 `ob`s,
  the gantry posts/beam/boards, the chequered plane. Keep `zone`, `q.mapR`, `q.race`, `loc`, the sign at (300,-1884).
  The grandstand, pits and prop go in batch 2.
- Push all `obs` (tyre stacks are one box per three stacks; the concrete wall, pit wall and the two gantry towers).
- `q.race.bd = board` (same size and canvas as the old BEST LAP board, so `xpRaceBoard` works unchanged).
- Start lights: `lights(reds, green)`. Off when idle. When a lap starts (R.i goes to 0): all green for 1.5 s, then off.
  If you like: while a car sits still within 20 m before the line (x 280..300 on the straight), count down the reds
  one a second, then green.
- The tyre InstancedMesh is unculled already (`frustumCulled = false`); leave it out of scenery chunks like `imFix`.
- The catch fence is a transparent plane (alphaTest): keep it out of DP batching if that breaks transparency (dpKeep).

### Speedway batch 2 (approved) · `spStand(g)` → `{obs, flags}`, `spControl(g)` → `{obs, beacon}`, `spPits(g)` → `{obs, boxes, crewHome, boardAt}`; `mkPitCrew(col)`, `mkWheelGun()`, `mkPitJack()`
- Replaces in `xpSpeedway`: the three grey grandstand steps and their `ob`, the pits box, its roof, its label and `ob`.
  Push all `obs`. The race board prop moves to `boardAt` (garage 1's west wall); same text, plus the best pit stop.
- `flags`: each frame `f.rotation.y = sin(t*1.7 + i) * .25` (they're dpKeep). `beacon`: blink it while a lap is running
  (emissiveIntensity 1.4 / 0.2 every half second), off otherwise.
- The seat InstancedMeshes use per-instance colours (`setColorAt`); they're unculled. The grandstand is one obstacle
  box (you can't climb it).
- **Pit stops** (new gameplay):
  - Trigger: you're the driver, your car is within a pit box (`boxes`: |dx| < 3, |dz| < 2) and slower than 5 km/h, and no
    stop is running. Not for planes, the bus, helicopters.
  - One crew of four (`mkPitCrew()`, green) waits at `crewHome` facing the lane (rotation.y = 0 faces -z, i.e. the lane).
    Crew 0 and 1 carry a `mkWheelGun()` in `parts.grip` (gun.rotation.x = -PI/2). The jack (`mkPitJack()`) waits at
    (box.x + 3.2, -1778.5), turned rotation.y = PI/2.
  - Timeline from the stop (s), with the car at (bx, bz) facing east:
    0-0.9 the crew run (pose 'run') to: wheel men (bx+1.4, bz+1.75) and (bx-1.4, bz+1.75) facing -z; jack man
    (bx+4.6, bz) facing -x (rotation.y = PI/2) pushing the jack in to (bx+3.2, bz); wiper (bx+.6, bz-1.9) facing +z.
    0.9-1.4 jack man pose 'jack', `lift` 0→1, the car rises 0.15 m. 1.3-3.3 wheel men pose 'gun' (play an air-gun
    buzz), wiper pose 'wipe' until 3.6 then 'go'. 3.3-3.8 jack down (lift 1→0, car down). 3.8-4.4 the jack man drags
    the jack north to z -1778.5, clear of the car. At 3.8 `v.dmg = 0` (and any smoke/fire state cleared), show
    "PIT STOP 3.8 s" (time from stopping to the car coming down) and save the best in `SV.xpit`; "GO!" — the car
    may leave. The crew stay put until the car has left the box (more than 4 m away), then run home (0.9 s).
  - Hold the car still (no throttle) from the stop until 3.8 s. If the car leaves early, cancel: crew run home.
  - The pit lane counts as track for the lap: in `xpRaceTick` treat x 303..400, z -1786..-1776 as inside (`inT`).
  - Local to the driver (no sync needed; friends just see the car stopped).
- Pit lane paint is one canvas over the lane shape (note: canvas top = south, see the comment in `spPits`).

### Speedway batch 3 (approved) · `spEntrance(g)` → `{obs}`, `spInfield(g)` → `{obs, score, scoreDraw}`, `spFloods(g)` → `{obs, lamps}`
- Drop the base's sign at (300,-1884) (the arch replaces it). The dirt road `road(300,-1896.5,300,-1880,1)` can stay or
  go: the entrance lays its own gravel from the Southern Pass to the track, and on from the back straight's inner edge
  to the paddock (x 296.5..303.5, z -1861..-1852).
- **Crossing (changes batch 1):** both tyre walls now have a gap at x 294..306 on the back straight (`SPX.cross`), so
  cars can drive into the infield. `spTrack` already leaves it out (stacks, belts and obstacles).
- **Bug fixed in `spTrack`:** obstacle boxes are now made per unbroken run of tyres; before, a box could join the end
  of the inner wall to the start of the outer one (an invisible wall across the track). Use the current file.
- Scoreboard: `score.material.map = scoreDraw(SV.xlap, SV.xpit)` on build and whenever either record changes
  (dispose the old map). It's dpKeep.
- Floodlights: `lamps.emissiveIntensity` 0.3 by day, 1.6 at night if the desert has a night; add a few
  `light(...)` points if you like (they're aimed at the track centre).
- The skid pad and the paddock are scenery (no gameplay). Everything else is `noSeam`.

### Wind farm (batch 4, approved) · `wfFarm(g)` → `{obs, rotors, beacon, prop}` in `models/farms.js`; `wfTurbine(ds)`, `WFT`
- Replaces in `xpWind`: the tower cylinders, nacelle boxes, hub cylinders, hub groups and blades, their `ob`s, the
  substation box/roof/insulators and their `ob`s. Keep `zone`, `sign('WIND FARM...')`, `loc`.
- Spin: `for(const r of rotors) r.hub.rotation.z += dt * r.sp` inside the same `anim(...)` distance gate as now (the
  hubs are dpKeep). `sp` and the start phase are the old ones (`WFT`; turbine 6 is negative).
- `beacon` (one shared material): blink it, e.g. `emissiveIntensity = (t % 1.5) < .3 ? 2 : .15`.
- The substation prop (`[E] Read the substation sign`, same three lines) moves to `prop` (-486, -1268.6), at the gate.
- Push all `obs` (towers 3.8 m boxes, transformer boxes, fence sides with a gap at the gate, transformer, gantry
  legs, cabinets, hut, poles). The service track and pads are flat gravel (y .04, units -1), no obstacles.

