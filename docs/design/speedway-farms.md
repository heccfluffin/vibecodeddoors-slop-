Status: layout approved 2026-10-18 · Speedway batch 1 in preview · not ready to build yet

# The Speedway, the wind farm and the solar farm

Models in `models/speedway.js` (needs `fort-kit.js` and `airfield.js`). Desert-local coordinates, +z is north.
Layout plan: the design chat's "Speedway and Farms" plan page.

## Part 1: layout (approved)

### The Speedway (`xpSpeedway`)
- **The oval does not move**: centre (300, -1830), RX 110, RZ 38, 14 m wide; straights x 228..372; start line x 300
  on the main (north) straight, z -1792, driven east. `q.race` (checkpoints, lap logic, 25 s badge) is unchanged.
- Tyre walls stay at radius RZ-8 (inner) and RZ+8 (outer), except: the main straight has a concrete wall
  (x 228..323, z -1784) with a catch fence; the pit lane opens from x 323 to 6 m into the east bend; a low pit wall
  runs x 330..372 at z -1784.
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
(batches are added here as they are approved)
