Status: layout and airfield batch 1 approved by the user 2026-10-17 · airfield batch 2 in review

# The airfield and Dark Zone 51

Remodel of `xpAirfield` and `xpDarkZone` (both in bak519). Models go in `docs/design/models/airfield.js` and
`docs/design/models/zone51.js`. They use `fbKit` (fort-kit.js). Everything they build is `noSeam`; moving parts are
`dpKeep`.

## Part 1: layout (approved)

### The airfield (zone x 265..545, z -1335..-1195)
- **The runway does not move:** x 270..540, z -1240..-1220 (20 wide), numbers 13 (west end) and 31. `AWAIR`, the plane
  autoland and the jets read it; nothing there changes.
- Markings: threshold bars both ends, dashed centre line, edge lines. Edge lights on stalks every 10 m at z -1219.4 and
  -1240.6, **except x 294..306** (the road crossing). Green threshold lights across x 270, red end lights across x 540.
  Four approach-slope lights at x 280..288, z -1243.5.
- **Taxiway** x 318..326 from the apron (z -1244) to the runway, with a hold line and a sign.
- **Apron** x 275..365, z -1274..-1244: marked stands and tie-downs. **The plane's stand moves to (345, -1257)**
  (`xpVehicles` adds it at (300, -1250) today, in the road's path). Heading stays -PI/2.
- **Main hangar** stays at x 285..315, z -1288..-1264 (door to the runway side, z -1264): arched, sliding doors open.
  Workshop lean-to x 315..321, z -1286..-1272. AVGAS tank on a bund with a hose reel at x 277..283, z -1282..-1274.
- **Two T-hangars** x 332..346 and 348..362, z -1290..-1276. The first is open with an old crop duster inside (a model
  only, not a vehicle).
- **Terminal** x 306..334, z -1212..-1198 (waiting room, ticket desk, café, FLIGHTS: WHENEVER board). **Car park**
  x 275..294, z -1214..-1196.
- **The road crosses the runway:** the dirt road x 296.5..303.5 now runs on from z -1210 across the runway to the
  apron and the hangar door (z -1264). Stop lines, flashing lights, a "STOP · LOOK FOR PLANES" sign each side.
- **Control tower** stays at (430, -1200): a glass cab with slanted windows, a walkway, an outside stair, a rotating
  beacon, aerials. Its intercom prop stays.
- **Windsock** stays at (380, -1248) with a white marker circle round it.

### Dark Zone 51 (`DZ51` x -630..-470, z -1960..-1780)
- **Fence:** concrete posts, chain-link, barbed wire on outward arms, warning signs. Same lines and obstacles as now,
  **the Screech hole at x -630, z -1801.2..-1800 stays** with its note.
- **Gate** at x -470, z -1873.5..-1866.5: a sliding gate and a boom barrier, still rammable (`q.dzGate`, kd 'gate').
  Guard post inside at x -484..-476, z -1884..-1876.
- **Tank traps** move out onto the approach road as a zig-zag (x -465..-440, z -1880..-1860), leaving a weaving path.
- **Roads inside:** from the gate along z -1870 to x -555 (Hangar 18's apron), and a branch at x -540 up to the
  barracks (z -1810).
- **Hangar 18** stays at x -605..-555, z -1933..-1897 (door towards z -1897), remodelled inside and out, apron
  x -605..-555, z -1897..-1880. **The saucer** is remodelled; its hover/turn anim, the beam and the abduction prop
  stay.
- **Guard towers** stay at (-475,-1785), (-475,-1955), (-625,-1870), with sweeping searchlights.
- **Radar** dish on a turning mount at (-603, -1808); a radome at (-612, -1822).
- **Barracks D** x -581..-559 and **mess hall** x -555..-544 (z -1806.5..-1797.5): curved-roof huts.
- **Building 13** (new) x -528..-500, z -1814..-1796: a windowless lab. Inside: specimen jars, a covered table,
  glowing vats, a wall of monitors.
- **Helipad** (new) at (-505, -1932), radius 8. **Motor pool** (new) x -525..-505, z -1852..-1840: two white pickups
  (models only).
- **Fuel dump** x -618..-604, z -1946..-1938. Floodlights as now.
- **Alien and secret things (new):**
  - Crash site x -552..-520, z -1957..-1925: a second saucer nose-down in a crater, tarps, tape, a science tent.
  - The Artifact x -598..-576, z -1858..-1838: a crystal floating in a scaffold cage, humming.
  - Bunker entrance x -628..-612, z -1858..-1828: a ramp down to a blast door, LEVEL -13; keypad prop says ACCESS DENIED.
  - Waste pit at (-585, -1948), radius 5: leaking barrels, glowing goo.
  - Listening array x -497..-478, z -1830..-1805: four dishes.
  - Decontamination tent x -500..-488, z -1865..-1857.
  - A small grey visitor in the mess hall (our own design), with a talk prop.
  - Outside: a crop circle at (-450, -1925), radius 14; cameras on poles along the road in.

Batches: airfield 1 runway, lights, taxiway, apron · 2 hangars and fuel · 3 terminal, car park, crossing · 4 tower and
windsock. Zone 51: 1 fence, gate, traps, towers · 2 Hangar 18 and the saucer · 3 barracks, mess, Building 13, radar ·
4 helipad, motor pool, floodlights, fuel · 5 the alien and secret things.

## Part 2: models

### Airfield batch 1 (approved) · `afField(g)` → `{obs, lights}` in `models/airfield.js`
- Replaces in `xpAirfield`: the runway plane and its canvas, the two number labels, the apron plane, and the merged
  runway-light spheres. Keep the `rect(...)` map entries and `zone(...)`.
- Ground layers (all planes with constant depth nudges only): apron .04, shoulders and blast pads .045, taxiway .048,
  runway .05. The shoulders stop at the runway ends and leave a gap where the taxiway joins, so nothing overlaps.
- Edge lights skip x 294..306 (the road crossing, batch 3) and x 317..327 (the taxiway).
- `lights` is [white, green, red] materials; any night code can raise their `emissiveIntensity`.
- **The plane spawns at (345, -1257)** (in `xpVehicles`, was (300, -1250)), on stand 2.
