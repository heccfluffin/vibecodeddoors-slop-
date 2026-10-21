Status: plan approved 2026-10-20 · batch 1 for review

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

### Batch 1: the mesa cliffs, rim, fallen rock and the ramp road, for review · `mgMesa(g)`, `mgMesaRoad(g)`
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

