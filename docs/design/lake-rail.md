Status: layout approved 2026-10-18 · batch 1 approved · batch 2 in preview · not ready to build yet

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

