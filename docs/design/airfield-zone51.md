Status: layout and the whole airfield and Zone 51 batches 1-3 approved by the user 2026-10-18 · Zone 51 batch 4 next

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

### Airfield batch 2 (approved) · `afHangar(g)`, `afFuel(g)`, `afTHangars(g)` → `{obs}` each; `afCropDuster()` → Group
- Replaces in `xpAirfield`'s hangar block: the two side walls, back wall, roof box, half-cylinder roof, front wall
  above the door, the AVGAS box and drum and its label, the three crates, and all their `ob`s. Keep the light
  `light(0xfff0d0, 1.2, 20, hx, H-1, hz)`. The old sign label goes (the new hangar carries it on its front).
- Push every returned `obs`. The hangar's door opening is x 288..312 (24 m), wide enough for the plane.
- The hangar floor is a plane at y .06 (nudge -3) over the apron (.04).
- `afTHangars` builds the crop duster itself (in Hangar 2). It is a model, not a vehicle, with one obstacle box.

### Airfield batch 3 (approved) · `afCrossing(g)` → `{obs, flash}`, `afTerminal(g)`, `afCarPark(g)` → `{obs}`
- **The road:** extend the airfield's dirt road (`road(300, -1033.5, 300, -1210, 1)` in `xpRoads`) no further; the
  crossing pieces are planes from z -1220 to -1210 and -1244 to -1240 (y .045). The route grid should treat x
  296.5..303.5 from z -1210 to -1264 as drivable (it already is: the runway and apron are open ground).
- `flash` is two red materials: alternate them every 0.6 s (`(q.rt / .6 | 0) % 2`), emissiveIntensity 1 and .1.
- Terminal and car park are new; push their `obs`. The terminal's glass door to the runway stands open (x 322.5..324.5)
  and the entrance from the road is a doorway in its west wall (z -1206..-1204).
- New `rect()` map entries if you like: terminal `#e6d6b8`, car park `#b4a080`.

### Airfield batch 4 (approved) · `afTower(g, 430, -1200)` → `{obs, beacon, red}`, `afWindsock(g, 380, -1248)` → `{obs, sk, so}`
- Replaces the tower's shaft box, floor, glass box, four posts, roof, mast, red sphere, TOWER label (and its `ob`), and
  the windsock pole, sock group and cone (and its `ob`). Keep the intercom prop and the tower light.
- Anims: `beacon.rotation.y += dt * 1.6`; blink `red.emissiveIntensity` between 1 and .1 each half second (the old
  `bl.visible` toggle); windsock as before: `sk.rotation.y = PI*.75 + sin(rt*.6)*.5`, `so.rotation.z = PI/2 - .2 +
  sin(rt*2.5)*.1`. All three are `dpKeep`.
- The stair is a two-lane switchback stair tower east of the walkway (four flights side by side, a landing across both lanes at each end, handrails, X-braces, no arms back to the shaft); its top landing meets a gap in
  the walkway railing. The walkway and stair are looks only (no plates), unless you want players to climb it.

### Zone 51 batch 1 (approved) · `models/zone51.js`: `zfFence(g)`, `zfGate(g)`, `zfTraps(g)` → `{obs}`, `zfTower(g, x, z)` → `{pv, obs}`
- Load after `airfield.js` (it uses `afCanvas`, `afPlane`, `afTarmac`). New global `DZB` (the bounds and gaps).
- Replaces `xpDarkZone`'s fence block (the four chain-link planes, merged posts, warning labels, `sign(...)`, the
  "psst" label) and its tower block (legs, platform, cab, posts, roof, searchlight drum, beam, pivot). Keep the
  tower lights and the sweeping anim on the returned `pv` (same rotations as now).
- **Fence obstacles:** the west side is now one run with an opening for the Screech hole (z -1801.2..-1800, height
  1.45, a ragged tear in the mesh). Players walk through it as before.
- **The gate:** replace the game's gate group `gg` with the returned `gate` (same spot), keep
  `ob(x1-.3, x1+.3, -1873.5, -1866.5, {m: gate, kd: 'gate'})`, `q.dzGate` and the "Try the gate" prop. `arm` is the
  boom barrier (looks only; lift it with `rotation.x = -1.45` when the gate is down, if you like). The guard post
  and the two gate posts have obstacles.
- **Tank traps:** remove the game's three tank traps by the east fence (x1-20); push `zfTraps` obstacles. The weaving
  lane is 3.4 m wide, so AI cars and the player can get through slowly.

### Zone 51 batch 2 (approved) · `zfHangar18(g)` → `{obs, saucer, beam, rim, dome, hatch}`, `zfSaucer()`
- Replaces `xpDarkZone`'s Hangar 18 block meshes (floor, walls, roof, cylinder roof, label, front wall pieces, the
  saucer group and its lights, the beam, the two labels). Keep the four hangar lights, the saucer light `ul`, `loc`s, the
  prop, and the anim (now on the returned `saucer`/`beam`; `rim` materials can pulse). The saucer is built at
  (-580, 6, -1915), so the anim's `position.y = 6 + sin(...)` still works. Push `obs`.

**The new abduction (replaces the `q.abd` block in the base's tick, ~bak519 "the saucer"):** today you rise straight
up through the saucer, spinning. New sequence, 6.3 s, input locked as now (`q.abd` keeps blocking movement):
- 0 to 0.6 s: the hatch under the saucer opens (`hatch(u)`, an iris of six blades, u 0 to 1). The beam brightens.
- 0.6 to 1.4 s: you are drawn smoothly sideways to the middle of the beam (P.x, P.z ease to the saucer's centre).
- 1.4 to 3.6 s: you rise (eased) until your eyes are 0.7 below the hatch (saucer y - 1.65), slowly turning; the view
  tilts up to look into the lit well. **Hide the beam cone while you are in it** (`beam.visible = false` from 1.4 s;
  from inside it only shows its own faces).
- 3.1 to 3.6 s: fade to white (the existing `bsF` overlay, background #f4fff8).
- 3.6 to 4.0 s: the hatch closes behind you (u 1 to 0), unseen under the white.
- 4.0 to 5.6 s: hold white, "👽 ..." in the middle.
- 5.6 s: pick the place as the old code does (`l`, the drop point `D = (l.x+4, l.z+4)`), reset the hangar beam and
  hatch. **The ride out (new):** a second saucer (`zfSaucer()`, built once and kept hidden; the hangar one stays
  parked) appears 28 m up, about 200 m from D on the side away from it (or at the hangar, if D is near), its hatch
  open. Fade the white out over 0.5 s.
  - 5.6 to 7.8 s: it races to D (eased), banking slightly, spinning. The camera rides 3.6 m under its hatch, looking
    ahead and down (the land streaking past). Move P with it so the world streams in around you.
  - 7.8 to 8.2 s: it has stopped over D. You are let go.
  - 8.2 s on: you fall (the existing `q.fling` from 24 m, soft), looking up at the saucer; at 9.2 s it shoots up
    and away (rising and accelerating along its heading), and is hidden at 11.6 s.
  - Then the hint and the badge as before.
- Its beam cone is never shown during this (you are inside it).
- Sounds: keep the rising whine (300 + t*400) while rising; a soft clunk when the hatch closes.
- The preview's "Step into the light" button plays this with the camera.

### Zone 51 batch 3 (approved) · `zfBarracks(g)` → `{obs, visitor}`, `zfB13(g)` → `{obs, vats}`, `zfRadar(g)` → `{obs, dish}`
(also `zfHut`, `zfVisitor`)
- Replaces `xpDarkZone`'s radar block (plinth, dish group, stand, its `ob` and anim: spin the returned `dish` instead,
  `rotation.y = q.rt * .4`) and the two barracks boxes, roofs, windows, doors, labels and their `ob`s.
- **Building 13 is new** (x -528..-500, z -1814..-1796); the radome (-612, -1822) is new. Push all `obs`.
- **The visitor:** add a prop at (-549.6, -1797.5), radius 1.5, "[E] Talk to the visitor", lines like:
  "He nods politely. He does not look up from his jelly." · "\"The food here is... an experience.\"" ·
  "\"Do not tell them I can leave whenever I like.\"" · "He offers you some jelly. It glows. You decline."
- `vats`: pulse `emissiveIntensity = .5 + .3 * sin(rt*2 + i)` (optional). Building 13's roof pieces are tagged
  `userData.b13roof` (the preview hides them to look inside; the game keeps them).
- The huts' doors and the blast door are looks only (the insides are reachable only in the preview).
