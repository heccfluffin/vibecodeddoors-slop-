Status: complete, all approved 2026-10-18 (lake 1-2, observatory, Dino Dan's, railway track and crossings, the train) · ready to build

# Mirage Lake, the observatory, Dino Dan's and the railway

Models in `models/lake.js` (needs `fort-kit.js` and `airfield.js`). Desert-local coordinates, +z is north.
Layout plan: the design chat's "Lake, Stars, Dino, Rails" plan page.

## Part 1: layout (approved)

### Mirage Lake (`xpLake`, `LAKE` x 250, z -1560, r 58)
- The water circle is unchanged (`q.water`, the vehicle-keep-out `ob`s, wading on foot). New: turquoise shallows and
  ripples, a wet-sand rim, palm clumps with reeds and rocks round the shore (not on the beach or pier).
- The pier keeps its place (x 248.4..251.6, z -1533..-1499, deck y 0.6, its `q.plates` entry); fishing at the end.
- New: bait shop x 254..262, z -1500..-1493. Beach (z -1494..-1483): umbrellas and loungers x 214..250, volleyball
  x 268..280, lifeguard tower x 281..285, snack hut x 234..242, shower at (244,-1486). Boathouse x 176..190,
  z -1572..-1556 with swan pedal boats; swim-area buoys on a 44 m arc off the beach; the sailboat drifts as now.

### Observatory (`xpObservatory`, 608, -1480)
- Same spot and rotating dome; proper tower, slit, telescope through the slit; radio dish (624,-1468); caravan
  x 616..626, z -1498..-1492; planet walk along the dirt road (x 566..590, z -1475).

### Dino Dan's (`xpDino`, 120, -1935)
- Same spot and size for the dinosaur; gift shop x 92..104, z -1938..-1925 (with porch); baby dino (136,-1925),
  egg (140,-1932), dig site x 132..146, z -1952..-1942, picnic tables x 100..112, z -1948..-1942, car park
  x 80..112, z -1918..-1906.

### The railway (`xpRail`, `RAIL.z` -1640, x -640..640)
- Same line and train path; raised ballast bed, sleepers, rails, telegraph poles every 35 m on the north side,
  mileposts; the three crossings (x 0, -440, 560) get crossbucks, twin lights, gate arms, crossing boards, signal
  posts and a STOP · LOOK · LISTEN sign; the train is remodelled (locomotive, tender, six wagons).

Batches: 1 lake water, shore, palms, pier, bait shop · 2 beach, lifeguard, snack hut, boathouse, buoys, sailboat ·
3 observatory · 4 Dino Dan's · 5 railway track and crossings · 6 the train.

## Part 2: models

### Batch 1 (approved) · `lkWater(g)` → `{tick}`, `lkShore(g)` → `{obs, palms}`, `lkPier(g)` → `{obs, plate, rod, lampAt}`, `lkBait(g)` → `{obs, prop}`; `lkPalm(h, lean)`, `LKW`
- Replaces in `xpLake`: the water circle (keep `q.water`, the vehicle `ob`s and `q.mapR`), the shore ring, the old
  emissive pulse anim, the pier box/posts/rails/lamp/tackle box/rod and their `ob`s, and the old `q.plates` pier entry
  (use `plate`, same numbers). Keep the fishing prop (same spot and text); it now turns `rod.rotation.x` (-0.8 resting,
  -1.2 while waiting) exactly as before. Put the pier `light(...)` at `lampAt`.
- `tick(t)` every frame inside the lake's `anim(...)` gate (ripples, sparkles). Palms: `p.rotation.z = sin(t*.7+i)*.03`.
- Water layers sit at y .04 / .045 / .046 with their own polygonOffsetUnits; they are transparent. The ripple and
  sparkle layers are dpKeep.
- Bait shop `prop`: optional, e.g. "[E] Read the bait board" with lines like "WORMS: FRESH · BREAD: ALSO FRESH ·
  WORMS IN BREAD: ASK".

### Batch 2 (approved) · `lkBeach(g)` → `{obs}`, `lkBoathouse(g)` → `{obs, bob, plate}`, `lkBuoys(g)` → `{bob}`, `lkSailboat()`, `lkBob(list, t)`; parts `lkUmbrella`, `lkLounger`, `lkSwan`
- Replaces in `xpLake`: the four umbrellas/loungers and their `ob`s, the lifeguard chair, its `ob` and label, and the
  old box sailboat (put `lkSailboat()` in its place and keep the same drift/rock `anim`).
- `lkBob([...bh.bob, ...buoys.bob], t)` every frame inside the lake's anim gate (swans and buoys are dpKeep).
- The boathouse jetty is walkable: push `plate` into `q.plates` like the pier.
- Scenery only: the kiosk, shower, volleyball court, lifeguard tower, boathouse and swans have no gameplay.

### Batch 3 (approved) · `obTower(g)` → `{obs, dome, prop}`, `obDish(g)` → `{obs, dish}`, `obCaravan(g)`, `obPlanets(g)` → `{obs}`; `OBS`
- Replaces all of `xpObservatory`'s meshes and its `ob`. Keep `zone`, the sign, `loc`.
- `dome` replaces the old `dm` group: same anim, `dome.rotation.y = sin(rt*.15)*1.2` (the slit is on its -z side, like
  the old one). Optional: `dish.rotation.y = sin(rt*.1)*.6`. Both are dpKeep.
- **The door moved to the west side** (facing the road in). The telescope prop (`[E] Use the big telescope`, same
  lines, same badge) moves to `prop` (598.6, -1480); put the blue `light(...)` there too (y 3.5).
- The caravan, planets and dish are scenery with small obstacles.

### Batch 4 (approved) · `ddDino(g)` → `{obs, under}`, `ddShop(g)` → `{obs, prop}`, `ddExtras(g)` → `{obs}`; `ddDinoModel(skin, belly)`, `ddLoft`, `ddSkin`
- Replaces all of `xpDino`'s meshes (the dinosaur group, the shop box, roof, door, windows, label) and both old `ob`s.
  Keep `zone`, the two `light(...)`s, the road sign at (8,-1880), `loc`.
- Props: "Buy a postcard" moves to the shop's `prop` (98, -1926.4), same price and lines; "Stand under the dinosaur"
  stays at (dx+5, dz) = (125, -1935) or use `under` (120, -1935); same lines.
- The toy dinosaurs in the shop windows and Baby Dan are small copies of `ddDinoModel` (fine to batch: static).
- Scenery only: egg, dig site, picnic tables, car park.

### Batch 5 (approved) · `rrTrack(g, x0, x1, z, gaps)`, `rrCrossing(g, cx)` → `{K, obs}`, `rrPoles(g)` → `{obs}`; `RRZ`, `RRX`
- Replaces in `xpRail`: the sleeper InstancedMesh, the two rail boxes, the ballast plane, and the whole crossing loop
  (posts, light spheres, labels, arm pivots and their `ob`s). Keep `rect(...)` for the map, the sign, `loc`.
- Main line: `rrTrack(g, -DXB, DXB, RAIL.z, RRX.map(x => [x-3.6, x+3.6]))`. The Dusty Gulch siding (in the base's
  station block, `sz2 = z-9`, x 400..540) can use `rrTrack(g, 400, 540, sz2, [])` instead of its own sleepers/rails.
  All of these meshes are `noChunk` like the old ones (they're 1.3 km long).
- Crossings: `for (const cx of RRX) { const c = rrCrossing(g, cx); q.xings.push(c.K); c.obs.forEach(o => q.obs.push(o)) }`.
  `K` has the same fields the old code made (`x, arms[{pv, sd}], lights[], obs[], down, a`), so `xpTrainTick`
  works unchanged. The gate boxes start `off:1` (open), as before.
- Rail tops stay at y 0.3 and the rails 1.5 m apart, so the train and the handcar sit on them as now.

### Batch 6 (approved) · `rrLoco()`, `rrTender()`, `rrWagon(kind, col, name)`; helpers `rrBogie`, `rrCoupler`
- Replaces the train cars built in `xpRail` (`car(12, ...)` for the locomotive and the six `car(11, ...)` wagons).
  Build `q.train` the same way with these groups: loco (len 12), **a new tender (len 7)**, then the six wagons with
  the old colours and kinds (`i%3==2` 'flat', `i%3==1` 'tank', else 'box' with the name `['DOORS BUT FREIGHT',
  'GWEEN SODA','EL GOBLINO LOGISTICS','DARK CARGO'][i%4]`). `T.len` grows by 8.2 m; the crossings use `T.len`, fine.
- **Front is +x now**: don't turn the locomotive (`c.rotation.y = Math.PI` goes). Positions stay
  `m.position.set(head - off, 0, z)`.
- Headlight: `TR.hl` at the loco's `userData.lamp` (5.7, 3.75, 0) and pointing ahead (+x); the smoke sprite at
  `userData.stack` (4.6, 4.8, 0) (the old one was at -3.6 in the turned model, i.e. +3.6 ahead).
- Wheels: in `xpTrainTick`, `c.m.userData.spin(T.dist)` for every car, where `T.dist += T.v * dt` (optional, but the
  side rods look best moving).
- All train meshes are dpKeep (they move every frame).

