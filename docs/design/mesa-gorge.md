Status: shipped in r658 (2026-10-23, `src/dx644.js`)

# Lookout Mesa and Devil's Gorge

The gorge's fall, lift and cave were done in `devils-gorge.md` (r606-r607) and the Quarry Skip jump in
`speedway-and-stunt-jump.md`. This is the rest: what the mesa and the gorge look like, and the things on them.
Coordinates are desert-local, +z is north. New globals start with `mg`.

## What's there now (survey of r645)
- **Lookout Mesa** (`xpMesa`): one plain box, x -400…-280, z -1600…-1500, 14 m high, with a sand slab on top. The
  only way up is an 8 m ramp road on the east side (x -280…-220 at z -1550, with the r618 embankment under it). On top:
  the Hermit's cabin (a plank box) and the Hermit, a telescope (first look reveals the whole map), a flagpole, a
  campfire with soda cans, the coin binoculars on the south rim, and the summit book on a lectern 0.4 m from the
  Hermit, so their two prompts fight. The Quarry Skip jump flies over the mesa from north to south. No rim, no cliffs,
  no rocks: it reads as a box.
- **Devil's Gorge** (`xpGorge`): z -1744…-1700 across the whole map (1,480 m), 30 m deep. Walls are two long flat
  boxes with a stripe texture; the floor is a flat slab with a 12 m blue strip for the river, 46 boulders and some sand
  drifts. Three bridges (Route 13 at x 0, Coyote Rd at x -440, Dune Rd South at x 560) are grey slabs with rails, three
  girders and two piers. The gorge jump (a plank ramp at x 300 to the rock ledge on the south side), the zipline (two
  timber towers at x -150 with two cables), DANGER signs. A comment promises a vulture and a dead tree; neither exists.

## The plan
Keep every footprint the game walks and drives on: the mesa's plate at y 14 and its 120 x 100 m top, the ramp road
(its `q.ramps` entry and route-grid link), the gorge band z -1744…-1700 and depth 30, the bridge decks (width, height,
the rails' obstacles), the ledge, the jump ramp, the zipline cable ends, and every prop.

### Lookout Mesa
1. **Cliffs.** The box becomes a mesa: cliff faces in layered sandstone bands (pale cap rock, red middle, darker
   base), with buttresses, overhangs under the cap rock and gullies, all within 1.5 m of the old sides (outside them,
   so you still can't walk into the rock). A skirt of fallen boulders and scree round the foot (solid where big).
2. **The top edge:** an uneven rim of cap rock and boulders (low enough to see over, with gaps), a few shrubs and
   dry grass tufts on top. The top stays flat where you walk.
3. **The ramp road:** cut into the cliff: rock walls rising on the mesa side, a stone retaining wall and a timber
   guard rail on the drop side, the old signs remodelled (MESA ROAD · STEEP · USE LOW GEAR, and LOOKOUT MESA ELEV.
   14 m at the top).
4. **On top:**
   - the Hermit's cabin: a weathered board-and-batten cabin with a tin roof, a porch with a rocking chair, a stove
     pipe with smoke, a water barrel, a solar panel, a woodpile;
   - **the summit book moves** to a stone cairn with a little weather box on it (-345, -1545), away from the Hermit;
   - a lookout point on the south rim: a stone platform with an iron railing round the coin binoculars, and a
     bench;
   - the telescope remodelled (brass on a wooden tripod, on a little rise);
   - the flagpole and campfire remodelled (a proper fire ring, log seats, the soda can stack).

### Devil's Gorge
5. **Walls.** Canyon walls in sandstone bands with ledges, buttresses, alcoves and fallen blocks, slightly uneven
   along their length (repeating 40 m pieces in a few variations, so it stays cheap), kept inside the band so the
   fall, the floor and the cave still fit. Overhanging rim rock at the top edge, so you see the drop coming.
6. **Riverbed:** a winding river channel with banks and shallows (instead of the straight blue strip), sandbars,
   pebbles, the boulders, two dead trees, bleached driftwood, and a pair of vultures circling high above the middle.
7. **Rim:** warning signs and a short rail of old fence posts with wire where roads meet the rim; cairns along it.
8. **Bridges** (decks, widths and rails kept):
   - Route 13 (x 0): a steel girder bridge with riveted truss sides and a nameplate "DEVIL'S GORGE BRIDGE";
   - Coyote Rd (x -440): a timber trestle under the deck;
   - Dune Rd South (x 560): a concrete deck on two tall concrete piers with arches.
9. **Gorge jump:** the ramp remodelled (a steel kicker on a timber frame with chevrons, flags), the ledge gets a
   landing pad of packed sand with tyre marks and a "YOU MADE IT" sign.
10. **Zipline:** the two towers remodelled (timber towers with stairs up to the platforms, a roof over the top
    platform, cable anchors), the cables kept where they are.

## Model batches (part 2, after this plan is approved)
1. Mesa cliffs, rim, scree and the ramp road.
2. Mesa top: cabin, cairn and summit book, lookout point, telescope, flagpole, campfire.
3. Gorge walls, rim and riverbed (with the trees and vultures).
4. The three bridges.
5. Gorge jump and zipline towers.

## Things Claude Code has to keep in mind
- The gorge walls run the whole map; keep them to a few meshes (`noChunk`) and check draw calls.
- `gorgeAt`, `deepOK`, `deepWatch` and the fall code depend on the band z -1744…-1700; nothing new may stick into it
  above the floor where you could land on it, unless it is listed in `q.deepB`.
- The Quarry Skip flight line (x -333…-327) must stay clear on the mesa top above y 15.5 (the binoculars are 3 m
  under it today).

## Part 2: models (`models/mesa-gorge.js`, needs `fort-kit.js` and `route13.js`)
Constants: `MG` (the mesa box, the road, the Quarry Skip lane kept clear, the props' spots kept clear).

### Batch 1: the mesa cliffs, rim, fallen rock and the ramp road, approved 2026-10-21 · `mgMesa(g)`, `mgMesaRoad(g)`
- **`mgMesa(g)`** replaces the mesa's body box in `xpMesa` (the `body` mesh). Keep the sand top slab, the plate, the
  ramp entry, the zones, the map rect and every prop.
  - **Cliffs:** one mesh all round, measured out from the old box's sides (0.15 to 1.5 m outside, never inside):
    a darker base with a flared foot, three red layers with a small ledge at the foot of each, a shadowed undercut, and
    the pale cap rock jutting out over it in jointed blocks (a few broken off). Buttresses every 12 m or so, gullies
    that cut right back, dark streaks running down from the cap. The cap rock folds over the top edge as a low lip
    (6 cm above the sand inside the box, so the top stays flat to walk on). The face is open where the road joins
    (z -1554.3 to -1545.5 on the east side); the road's walls hide the cut.
  - **Rim:** cap-rock boulders along the top edge in clusters with gaps, all under 1 m high. None on the Quarry Skip
    line (x -341 to -319), at the road's top or near the binoculars.
  - **Fallen rock:** 18 talus heaps leaning on the cliffs (2 to 5 m high) plus a bigger one at each corner, fallen
    cap-rock slabs and boulders, and a scatter of smaller stones. Kept off the Quarry Skip line north and south, the
    road and the props.
  - **Plants:** dry grass tufts and a few shrubs near the rim on top and round the foot (not solid).
  - Returns `{obs, parts:{cliff}}`. `obs`: 2 m pieces along the foot of the cliffs (out to the rock's furthest point
    under 2.5 m, so you can't walk into it), the talus heaps, the big fallen rocks, and the rim boulders where they
    stand on the top. Push them all into `q.obs`.
- **`mgMesaRoad(g)`** replaces the ramp's slab, its two kerbs, the r618 rock fill under it (dx615's `xpMesa` wrapper)
  and the two signs (`sign('LOOKOUT MESA…')`, `sign('MESA ROAD…')`). The `q.ramps` entry and its route-grid link stay.
  - A gravel road surface with two tyre ruts, 3 cm above the ramp's height (0 m at x -220, 14 m at x -280), z -1554
    to -1546, running 0.6 m onto the flat at the bottom.
  - South (the drop): a dressed sandstone retaining wall from the ground to 35 cm above the road (z -1554.65 to
    -1554.05), with a stone cap and a timber guard rail (posts every 3 m, two rails on the outer face). Solid.
  - North: a rock shoulder beside the road, up to 3 m above it in the middle, falling away at both ends, sloping down
    to the ground on its north side, with loose rocks. Solid (z -1545.9 to -1540.5).
  - Signs: MESA ROAD · STEEP · USE LOW GEAR with a 23% grade plate at the bottom (-214, -1557), and a plank sign
    LOOKOUT MESA · ELEV. 14 m · NO LITTERING at the top (-284.5, -1559), both facing east (the way you arrive).
  - Returns `{obs}`.
- Draw calls: the cliff, rim, talus, fallen rock and plants are one mesh each; mark them `noChunk` if the chunker would
  split them.

### Batch 2: on top of the mesa, approved 2026-10-21 · `mgMesaTop(g)`
Replaces the top's old meshes in `xpMesa` (the cabin box, roof, door, chimney; the telescope's legs and tube; the
flagpole and the `lab('DOORS')` flag; the campfire stones and the soda cans) and in `T('mesa')` (the binoculars' post,
head, coin slot and label, and the summit book's lectern and book). Keep every prop, the Hermit, the smoke sprite, the
fire sprite and its light; move them as below.
- **The Hermit's cabin** (-320, -1560), same 7 x 5 m footprint and obstacle: weathered board-and-batten walls on a
  stone footing, a tin gable roof ridged east-west with a ridge cap, barge boards and fascia, four windows (glass in
  `parts.win`: set `emissiveIntensity` .5 at night), a plank door on the west wall, a stove pipe through the north
  slope with a rain cap (`spots.smoke`: move the smoke sprite there, it was at H+5), a solar panel on the south slope,
  a gutter and downpipe into a rain barrel at the north-east corner, a woodpile along the east wall, a chopping block
  with an axe. **Porch** on the west: a plank deck 30 cm up with one step (both in `plates`), a lean-to tin roof on two
  posts, a rocking chair, a porch lamp (`lights`). **The Hermit stands on the porch**: `spots.hermit` (y is the deck).
  The talk prompt stays at (hx-5, hz).
- **The summit book moves to a cairn** at (-345, -1545): stacked flat stones with an open steel register box on top
  (the book and a pen inside, a SUMMIT REGISTER plate). Move the "Sign the summit book" prop to `spots.book` (the
  cairn's north side) and drop the old lectern and book by the cabin. Obstacle 1.5 m square.
- **The lookout point** on the south rim: paving x -335.5 to -324.5, z -1599.4 to -1592.4 (5 cm up, flat to walk on),
  a low stone kerb, an iron railing with ball-topped posts along the rim and back along both sides (open to the north),
  new coin binoculars (pedestal, coin box with the LOOKOUT · 1 GOLD plate, twin-barrel head looking south) at the same
  spot (-330, -1596), a bench, and a brass direction dial on a stone plinth (arrows to the gorge, Zone 51, Route 13 and
  the lake). **Fix:** the binoculars put you 0.6 m *south* of them, looking south, so the head was behind you. Stand at
  `spots.binoUse` (0.6 m north) and put the prompt at `spots.binoProp`. Everything stays under 15.5 m on the Quarry
  Skip line (the head's top is at 15.34).
- **The telescope** (-380, -1550) on a little rise: a round stone top 30 cm up ringed with rocks (`plates`: 2.4 m
  square), a brass telescope on a wooden tripod with brass feet, aimed south-east over the gorge. Prompt unchanged.
- **The flagpole** (-310, -1520): a concrete base, an 8 m white pole with a brass ball, a halyard and cleat, and a cloth
  DOORS flag that waves: call `tick(t)` every frame (replaces the old label's rotate/stretch anim).
- **The campfire** (-340, -1525): a ring of 13 stones, an ash bed, a teepee of charred sticks that glow a little, three
  log seats, and a crate with the soda cans stacked 4-3-2-1 plus a few crushed ones. The fire sprite and light stay
  (`spots.fire`); the old obstacle stays.
- Returns `{obs, plates, spots, parts:{flag, win}, tick, lights}`.

### Batch 3: the gorge walls, rim and riverbed, approved 2026-10-21 · `mgGorgeWalls(g)`, `mgGorgeBed(g)`, `mgGorgeRim(g)`, `mgVultures(g)`
Constants: `MGG` (the band, the ledge, the cave mouth, the bridges, the jump, the zipline; `MGG.zc(x)` and `MGG.zw(x)` are
the river's centre line and half width). `mgBedH(x, z)` is the visual floor height (you still walk at -30).
- **What goes:** in `xpGorge` the floor slab, the blue river strip, the long wall boxes (north, the two south pieces and
  the lintel over the cave), the two end caps, the ledge column and its top slab, the two `sign('DANGER…')` calls; in
  `xpGorgeCave` the 46 boulders (and their `q.deepB` boxes: they used `Math.random`), the ten sand drifts and the cave
  mouth's arch (`ar` and its two posts). Keep the ground cut, the bridges, the jump ramp, the zipline, the cave
  inside, the lift and every prop (batches 4 and 5 do the bridges, the jump and the zipline).
- **`mgGorgeWalls(g)`**: the north and south walls (x -660 to 660) and the two end walls (x ±641), one mesh each,
  `noChunk`. Sandstone in seven layers (a dark base, red, pale, orange, red, pale, the pale cap) that rise and fall a
  little along the gorge, a ledge at the foot of each layer, buttresses and vertical joints, chutes, low alcoves at the
  foot here and there, desert varnish streaks, and a cap rock with an undercut below it. **Every face is set back
  into the rock (0 to 3.5 m), never into the band**, and the top edge is exactly on the band edge so the ground meets
  it. A low rim lip (5 cm, 1.7 m wide) runs along the top on the ground side; it is sunk where the bridges, the ledge
  and the jump are, so it never pokes through a deck or a road. The south wall wraps round the jump ledge (its sides
  set back at most about 1 m, its top a packed-sand plane at 1.5 cm; batch 5 puts the landing pad on it). **The cave
  mouth** is a hole in the south wall (x 188.4 to 195.6, up to -23.9) with the face flush round it, framed by big
  fallen blocks and a lintel stone (two `deepB` boxes for the side blocks). Sand covers the band past both map ends.
  Returns `{deepB}`.
- **`mgGorgeBed(g)`**: one floor mesh (x -660 to 660, z -1748 to -1696), `noChunk`: a river channel winding inside the
  band (kept north of the ledge and away from the cave), up to 45 cm deep with sloping banks, shallows, five
  sandbars, wet sand along the water, rubble rising along the foot of both walls (it only rises in the strip you can't
  walk on, so the stop line is where the rubble starts), flat in front of the cave. The water is a strip 5 cm above
  the floor (`parts.water`: its texture flows when you call `tick(t)`). The floor is smooth near the water and the
  water fades out at both banks, so the shoreline is a clean soft line (the first version had jagged edges). Pebbles along the banks, about 50 boulders, 60
  talus heaps against the walls, two bleached dead trees (x -262 and 418) and ten pieces of driftwood. Returns
  `{deepB, parts:{water}, tick}`: push `deepB` into `q.deepB` (boulders, the high part of each talus heap, the trees).
  You still walk at -30; the floor you see is within 5 cm of that where you can walk, except the river (you wade, 5 cm
  deep) and the sandbars.
- **`mgGorgeRim(g)`**: where each of the three roads meets the rim, on both rims: an old fence (weathered posts every
  2.5 m, three strands of sagging wire) from the bridge's rail 20 m out each way, with a DANGER · SHEER DROP · 30 m ·
  KEEP BACK sign at each end (12 signs). Small cairns every 95 m along both rims, kept away from the bridges, the
  zipline, the jump and the lift. Returns `{obs}` (the fences, the signs, the cairns).
- **`mgVultures(g)`**: two vultures circling 34 to 39 m up over the Route 13 bridge, gliding with a flap now and then.
  Returns `{tick(t)}`: call it every frame (cheap: two small groups).
- Size: about 230,000 triangles in all (most in the two long walls and the floor), in about 15 draw calls.

### Batch 4: the three bridges, approved 2026-10-21 (the Route 13 tower's cap now meets the deck) · `mgBridgeSteel(g, cx, W)`, `mgBridgeTrestle(g, cx, W)`, `mgBridgeArch(g, cx, W)`
Call them with each bridge's centre and width from `GORGE.bridges` (Route 13: 0, 9.2; Coyote Rd: -440, 9.2; Dune Rd
South: 560, 9.2). They replace everything in `xpGorge`'s bridge loop (deck, rails, rail posts, the three girders, the
two piers); the rail `ob()` calls can stay or be replaced by the returned `obs` (the same boxes). Each keeps the deck
(W + 1.4 m wide, top at y -0.02, z -1746 to -1698), so driving and `gorgeAt` are unchanged.
- **Route 13: steel through-truss.** Two riveted Pratt trusses (12 panels of 4 m, 5.8 m high) standing on the rail
  lines, inclined end posts, gusset plates, overhead struts and X bracing, portals with knee braces and a **DEVIL'S
  GORGE BRIDGE · ROUTE 13 · BUILT 1931 · 30 m DROP** nameplate on both ends. **Clearance under the portals is 5.1 m.**
  Asphalt deck with a double yellow centre line and white edge lines, a W-beam guard rail inside each truss, floor beams
  and stringers underneath, concrete abutments at both rims, and in the middle a four-legged braced steel tower on
  concrete footings (open below 4.5 m, so you can walk under it).
- **Coyote Rd: timber trestle.** Ten bents (four posts each, the outer ones battered out), girts and X bracing from 5 m
  above the floor up, struts between the bents, concrete pads, stringers and a plank deck, timber guard rails (posts
  every 2 m, two rails), log cribs at both rims, and a sign at the north end: COYOTE RD TRESTLE · 1908 · 10 TONNE LIMIT.
- **Dune Rd South: concrete viaduct.** Two tall tapered piers (z -1733.5 and -1710.5) on footings, three arches (the
  side ones spring from the gorge walls), arch rings standing proud, pier caps, a cornice, solid parapets with a cap on
  the rail lines, a worn concrete road surface, and a DUNE RD VIADUCT · 1956 plaque at each end.
- Each returns `{obs, deepB}`; `deepB` holds the piers, posts and footings on the gorge floor. **`deepOK` has its own
  check for the old piers** (the per-bridge `for(const sd of[-1,1])` loop with `px=cx+sd*(W/2+.2)` at the band's middle):
  remove it and use the returned `deepB` instead, or there are invisible posts under the new bridges.
- Draw calls: about 3 to 6 per bridge (steel, concrete and timber are merged per bridge).

### Batch 5: the gorge jump and the zipline towers, approved 2026-10-22 · `mgGorgeJump(g)`, `mgZipline(g)`, `mgPadTex()`
- **`mgGorgeJump(g)`** replaces the jump ramp's plank slab and its six posts, the `sign('STUNT JUMP…')` and nothing else
  (its `q.ramps` entry, map rect and loc stay). Same footprint and slope (x 296 to 304, 0 m at z -1688 up to 3.2 m at
  z -1697): a diamond-plate steel deck 3 cm above the ramp height, a steel lip with a yellow-black stripe across the
  last metre, a timber frame underneath (posts every 1.5 m, cross beams, bracing; the open front shows it), yellow and
  black chevron boards on both sides pointing the way you go, and two flag poles at the lip with chequered flags
  (`tick(t)` waves them). A STUNT JUMP · 31 m · FLOOR IT board at (309.5, -1684). On the ledge: a YOU MADE IT sign
  at the side of the way out (287, -1740.5). Returns `{obs, tick}` (the flag poles, the two boards).
- **The landing pad** is the ledge's top from batch 3, now textured with `mgPadTex()`: packed sand, tyre marks
  coming in from the north edge, LAND HERE in big painted letters (readable as you fly in), and edge lines along the
  three open sides. Nothing on the pad is solid.
- **`mgZipline(g)`** replaces the two towers in `T('ziplines')` (the corner rods, rings, both decks, the rail ring, the
  high and low posts) and the zipline `sign(…)`. **The two ride cables, the trolleys, the props and the ride code stay.**
  Each tower: four battered timber posts on footings with girts and X bracing, except the gorge face, which is left
  open where riders pass (girts at 6 and 9 m only); a low deck at 3.0 m (arrivals) and the top deck at 12 m; a railing
  round the top, open on the gorge side and the back where the cable runs; a pyramid tin roof (eaves 14.6 m); a cable
  gantry with the pulley exactly where each cable starts (x ±0.7, 13.1 m); the low-end post with a red buffer where each
  cable ends (4.6 m); back-stay cables to concrete anchors behind (solid); and stairs up the side where you press E
  (east on the north tower, west on the south one): eight flights with landings at the low deck and the top.
  Returns `{obs}` (the towers, the stairs, the anchors, the sign). The towers' old obstacle boxes are the same.

