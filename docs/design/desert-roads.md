Status: part 1 (the layout plan) approved 2026-11-05, right-hand traffic · part 2 (the road look: models) batch 1 approved 2026-11-05, batch 2 (the whole network, bridge ends, signs) for review · part 3 (AI on the roads) after that

# Desert roads: a tidy layout, one look, and AI that drives on them

The user: "the whole desert map and its roads needs an improved layout, as the roads look quite rough and some of them
are randomly placed" and "allowing the ai of cars to drive on them better, would be a bonus too".

## How it is now (survey 2026-11-05)
- **Four road builders, four looks:** the bus road is one plain plane (busBoard0); `patWorld` lays its own boxes (not in
  `q.xroads`, so no junction patches); `road()` + `xpRoadsBuild` lay textured strips at y .06 with a 1.6 mm height
  staircase; the Fort draws its own (`fbRoad`). Seams where they meet: (0,-1200), (-178.5,-1120), (208.5,-1030), x 96.5..103.5.
- **Only straight rectangles.** No curves, no rounded corners. T junctions get no patch (the main road's edge line runs
  across the mouth); dirt tracks are never patched.
- **Roads that go nowhere or jog:** the x 205 spur stops 17 m short of Fort North Street; Pyramid Way's 40 m stub east
  of Route 13; Route 13 and Dune Rd run 60 m past Southern Pass; the town to Sunset Blvd link jogs east, north, east in
  boxes; the quarry track is three boxes.
- **Places with no road:** the Dark Penitentiary (its gate stub at x -440 has 240 m of sand to Coyote Rd); the airfield
  is a dirt dead end.
- **Mixed widths and surfaces:** 7, 5, 8, 10 m; Zone 51's 5 m dirt approach into a 7 m road; the Fort's roads recorded
  at the wrong width; Gulch Main St is dirt in the world and asphalt on the map.
- **Road strips cross Devil's Gorge** on top of the new bridge decks.
- **AI:** the route grid (`navBuild`, 3 m cells) prefers road cells but doesn't need them; traffic `LA/LB/LC`, Highway
  Patrol `HWPR`, Seek's `PATR`/`HROUTE` and the police beats `PCRB` are hand-typed point lists.

## Part 1: the layout (approved 2026-11-05; see the map preview)
The places stay where they are. The bridges and the railway crossings stay at x 0, -440 and 560 (so `GORGE.bridges`,
`RRX`, `q.xings`, `LKCLR` and the gate arms don't move). Coordinates are desert-local (x, z).

**Highways (8 m):** Route 13 x 0 from the bus ride to Southern Pass (T at (0,-1900)); Sunset Blvd z -1037 from Route 13
to Dune Rd (one straight road; was -1037 then -1030 with a jog); Dune Rd x 560 from the Fort gate (560,-1004) south,
turning west on a 45 m curve into Southern Pass; Southern Pass z -1900; Coyote Rd x -440 from the **prison gate
(-440,-860)** south, turning east on a 15 m curve into Southern Pass (just below the Hangar Rd junction); Gulch Rd z -1420 from Coyote Rd to Dune Rd;
Pyramid Way z -1120 from Route 13 to Coyote Rd.

**Town roads (7 m):** Motel Rd, the drive-in, Depot Rd, the pyramid spur, the PD road (its corner rounded); the
**Fort North link** (x 205 from Sunset Blvd north to z -902, then a 17 m curve into Fort North Street at (222,-885); the
Fort's west fence needs a gate there); **Airfield Rd** (x 300 from Sunset Blvd to the airfield, asphalt, a 10 m turning
loop at the end, still crossing the runway where dx617 cuts it); the **Zone 51 road** (leaves Coyote Rd at z -1858,
curves to the gate (-470,-1870), on to Hangar 18 at x -555; the barracks spur at x -540).

**Dirt tracks (5 m):** the mesa, quarry (one curve down to the haul road), lake, scrap, solar, speedway, observatory,
station, wind farm tracks, and Gulch Main St (now shown as dirt on the map).

**Gone:** Pyramid Way's east stub, the two southern overruns, the box jog, the old Sunset Blvd strip at z -1030.

**At the gorge:** the road surface stops at each bridge's ends; the bridge deck carries the road across.

## Part 2: the road look (models: `models/desert-roads.js`, needs `fort-kit.js`)
One builder, `drBuild`, from one table `DROADS` (each road: name, kind, a centre line of straight pieces and arcs).
- Highway: 8 m, white edge lines, yellow centre dash (solid near junctions), 1.2 m gravel shoulders with a ragged edge
  that fades into the sand, reflector posts every 50 m on the right.
- Town road: 7 m, edge lines, dash. Dirt: 5 m, ruts, ragged edges, no lines.
- Ribbon meshes that follow the centre line (texture along the road), cut into ~100 m pieces so the batching keeps them
  with their scenery cells; one height (y .06); depth nudges only with `polygonOffsetUnits`.
- Junction pieces: T and crossroads with rounded kerb corners (9 m on asphalt, 5 m on dirt), stop lines, give-way
  marks, a stop sign on the side road; a gravel mouth where a dirt track leaves asphalt.
- The bus road, the patWorld boxes and the xroads strips are all replaced; Fort streets keep `fbRoad` but are recorded
  at their real widths.

## Part 3: AI on the roads (after part 2)
- `DROADS` also makes a **road graph**: junctions and road ends as nodes, lanes as paths (right-hand traffic: lane
  centre 2 m right of the centre line on highways and town roads; the middle on dirt).
- Routes: from the car to the nearest road, along the graph (shortest time, speed limit per road), off the road only
  for the last stretch. `navReq` asks the graph first and falls back to the grid.
- Driving: slow for curves and junctions (speed from the curve's radius), give way at T junctions to the through road,
  stop at stop lines when something is crossing, keep a 2 s gap behind the car ahead in the same lane, pass a stopped
  car only when the other lane is clear.
- Traffic loops, Highway Patrol, Seek's patrols and the police beats become lists of road names or junctions, so they
  follow any later change to the layout by themselves.
- Speed limits: highways 90 km/h, town 50, dirt 40 (the cars' own top speed still caps them).

## Has to move with it (for Claude Code)
The AI routes above; the street signs `S`; `xpCover` keeps clear of the new roads by itself (it follows mapR);
the map (`dm2Draw`) should read `DROADS` for road shapes and kinds; `NAV` road cells from `DROADS`.

### Batch 1: pieces, junctions, dirt track mouths, approved 2026-11-05 · `drPiece`, `drJunction`, `drMouth`, `drStopSign`
- `drPiece(g, centreLine, kind)`: the road between two junctions, from a list of points (curves made with `drArc`).
  Cut into ~100 m pieces (frames worked out along the whole road first, so pieces join exactly and the dashes keep one rhythm). Highways have 1.2 m gravel shoulders with ragged outer edges (town roads 0.8 m), white edge lines, a yellow centre
  dash (3 m on, 9 m off) and reflector posts every 25 m (alternate sides); town roads lines only; dirt tracks ruts and
  ragged edges.
- `drJunction(g, x, z, arms)`: T junctions and crossroads, all at right angles (every junction in the plan is). Rounded
  kerb corners (9 m), edge lines that follow them, the gravel shoulder all round the kerbs, a stop line and a STOP sign on each road that gives way. Returns how
  far from the centre each road piece starts.
- `drMouth(g, x, z, dir, halfWidth)`: a gravel mouth where a dirt track leaves an asphalt road; the asphalt road and
  its edge line run straight past.
- **Sides:** in three.js, a driver facing (dx, dz) has their right hand towards (-dz, dx). Right-hand traffic keeps
  to that side: the AI's lane centre is 2 m that way from the centre line (part 3).
- Everything is flat at y .06 (the old strips' height), with lines nudged by `polygonOffsetUnits` only.

### Batch 2: the whole network, bridge ends, signs, for review · `DROADS`, `drNetwork`, `drBridgeEnd`, signs
- **`DROADS`** is the approved layout as data: 15 junctions (`J`: x, z, arms, the two names for the street sign),
  52 road pieces (`P`: name, kind, centre line with the curves), 12 gravel mouths (`M`), the three bridges (`B`, rims
  `RIM`), the airfield turning circle (`TC`), speed limits per kind (`LIM`: highway 90, town 50, dirt 40 km/h) and four
  direction boards (`GS`). **`drNetwork(g)`** builds it all: junctions first, then each piece trimmed to the arm it
  leaves by (a piece's end on a junction centre takes the arm pointing its way; ends on a gravel mouth start beyond it),
  bridge ends, the turning circle, street-name signs at every junction, speed limit signs 40 m after junctions on
  pieces over 150 m long, the direction boards. Returns `{J, obs, pieces}` (`obs`: the guard rails).
- **Staggered side roads:** the drive-in joins 10 m north of Motel Rd and Depot Rd 8 m south of Sunset Blvd, so those
  two junctions take a side road shifted along the main road (`off` on the arm). One junction each, no overlap.
- **Bridge ends** (`drBridgeEnd`): the road stops 5 m from the rim; a concrete approach slab slopes down to the rim
  (the decks' top is at y -0.02, the roads at .06); a steel expansion joint; W-beam guard rails on both shoulders for
  18 m, lined up with the bridges' own rails, their far ends turned down into the ground; yellow-black end markers.
- **Signs:** green street-name blades on every junction; white SPEED LIMIT signs; green direction boards before Route 13
  at Pyramid Way and at Gulch Rd, on Sunset Blvd before the Fort Link, and on Dune Rd before Sunset Blvd.
- **Changed from the plan:** Hangar Rd leaves Coyote Rd at z -1870 (the gate's line) and runs straight; the Southern
  Pass west corner is 15 m (was 25 m) so it fits below that junction.

**Wiring notes (Claude Code), for when part 2 is built:**
1. Build with `drNetwork(q.g)` (desert-local coordinates are q.g space, like the old roads) in place of
   `xpRoadsBuild`'s strips and junction patches, the `patWorld` road boxes and busBoard0's bus road plane; keep the
   Fort's own streets (`fbRoad`, flagged `fb`). Record each piece into `q.xroads` with its kind, so the map and
   `xpCover`'s keep-clear still work.
2. `drNetwork(...).obs` are q.obs boxes.
3. Route 13's painted BUS STOP bay (route13.js) sits on top of the new road; check it still shows (it may need the
   same `polygonOffsetUnits` nudge as the lines).
4. The level crossings' boards sit above the road (rails at .3), so the roads simply run under them.
5. The gorge rim's fences (mesa-gorge) start 2.2 m either side of each bridge; the guard rails here stand on the
   shoulders inside them, so they don't overlap.
6. Check the bridge decks' ends line up with the approach slabs at the rims (deck z -1746..-1698, rims -1744/-1700).
