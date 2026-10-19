Status: approved by the user 2026-10-19, ready to build · preview "Desert Map Redo"

# The desert map and minimap, redone

The user, 2026-10-19: the map and minimap need redoing so every place shows properly after the reworks.
Tables and reference renderer: `docs/design/models/desert-map.js`. Line numbers are in `src/bak519.html` unless named.

## What's wrong now (from a render of r631)
- Whole places are **blank sand with an icon**: Dark Zone 51, Goblino's Scrap, the wind farm, Dusty Gulch. Their
  builders never push `q.mapR` shapes.
- **Fort Blackout has no name at zoom 1** (not in the `MAJ` regex). Zoomed in: Heliport West and LZ Bravo twice, Fort
  Blackout Airstrip on top of Runway 09, the Fort Blackout label on top of Tank Park, the parade ground drawn twice
  (build.py:438 and dx614:745).
- **Offset or partial shapes:** the airfield apron is about 20 m off its hangars (T-hangars and tower missing); the
  quarry office and yard missing; the Speedway pits outside its rect; the penitentiary is hard-coded boxes in `dmapBg`.
- **The minimap never names anything** (icons only), so inside the base you can't tell what's next to you.
- **Fragile:** the full map's centre and scale (`0,-1310`, `900/1380`) are written in five places (bak519:7747, 7788,
  build.py:347, dx597:20, :35); `MAJ` is copied in two places; the oasis water, the crater and the penitentiary are
  hard-coded in `dmapBg`; roads are found by two magic colours; the legend has no key for the shapes.
- **Clutter:** 10 phone booths and 6 "Stunt:" labels appear with the real places at zoom 1.6.

## The new map
### 1. Areas are the backbone
`AREAS` lists every named place as `[name, icon, kind, x0, x1, z0, z1, labelX, labelZ]` (17 areas: Route 13 (the
town round the bus stop), Desert PD, Fort Blackout, Dark Penitentiary, Old Quarry, Goblino's Scrap, Airfield, Dark
Zone 51, Speedway, Wind farm, Solar farm, Dusty Gulch, The Pyramid, Crash site, Mirage Lake, Observatory, Dino Dan's).
Each `kind` (`KIND`: town, civic, military, prison, industry, aviation, restricted, energy, sport, leisure, heritage)
gives a ground tint, an edge colour and building colours. Restricted (Zone 51) gets a yellow-and-black hazard edge;
towns a dashed edge.

### 2. Buildings draw themselves
Inside each area, the obstacles (`q.obs` without `kd`, not `off`, not vehicles, smaller than 80 m) that touch (0.6 m)
are one building: the same clustering as `mapBaseDraw` (dx602:18), now for every area. A cluster of 3+ pieces between
3 and 90 m across is drawn as a roof (with a small shadow); the wall pieces are drawn on top in the kind's dark colour;
lone posts under 1.2 m are skipped. So a reworked or newly built place shows on the map the moment it's built, with no
map code to update. `mapBaseDraw` and the hard-coded penitentiary boxes are replaced by this.
- Rebuild the background when the obstacle count in any area changes (as dx602:32 does for the base), so late-built
  things (the PD HQ annex, the water tanks, the command wing) appear.
- The ground shapes builders push (`q.mapR`: roads, the lake, the gorge, the mesa, the track, the solar panels, the
  base's ground layers) stay. Exact duplicates are drawn once. The oasis water and the meteor crater become ordinary
  `q.mapR` entries (`circ: 1`) pushed by their builders instead of hard-coded lines in `dmapBg`.
- Roads get `road: 'asphalt' | 'dirt'` on their `q.mapR` entry; the two magic colours stay as the fallback.
- The sand, dunes and speckles stay part of the world-sized background (`dmapBg`), so they scale and pan with the
  map. Nothing on the map may be drawn in screen space except the labels, icons, the you-arrow, the compass and the
  scale bar (the first preview drew its sand in screen space by mistake; fixed).

### 3. Labels in three classes
- **Area names, always**, uppercase on a light tag at the area's label point (Fort Blackout included). Also `BIG`:
  Lookout Mesa, Devil's Gorge, the Railroad.
- **Places** (every other `q.locs` entry) from zoom 1.6, placed so they don't overlap (they're skipped if they would).
  `DROP` removes the locs an area name or a base name now covers (the area names themselves, Heliport West, LZ Bravo,
  Fort Blackout Airstrip, Crashed plane...).
- **Base buildings** (`MAPBN`) from zoom 2 inside Fort Blackout.
- **Phone booths and stunt jumps** only when switched on (two toggles on the full map), with short names
  ("Phone: Airfield", "ROUTE 13 LEAP") from zoom 1.6.
- The full map gets a row of toggles (Places, Base buildings, Phone booths, Stunt jumps), remembered per player, and a
  key of the kinds' colours under the map (replacing the old one-line legend; keep its you/friends/vehicles part).

### 4. The minimap
- A **banner at the top** names the area you're in (`OPEN DESERT` outside every area); inside Fort Blackout a second
  line names the nearest base building within 40 m ("Motor Pool").
- Icons for every place in view, and **names for the three nearest** (within 80 m).
- Inside Fort Blackout, base-building names within 70 m.
- Same scale as now (2 px a metre), same size and spot on screen.

### 5. Smooth zoom (the user, 2026-10-19)
- Zoom **glides** to its target instead of jumping: each frame `zm += (target - zm) * (1 - exp(-dt * 14))`, snapping
  when within .002. The world point under the cursor (or between two fingers) stays under it while it glides.
- Mouse wheel: the target is multiplied by `exp(-deltaY * .0022)` (deltaY clamped to ±300; line-mode wheels x33), so
  trackpads zoom smoothly and a mouse notch is about x1.25 as now. Pinch: the target follows the finger spread. The
  + / - buttons (if any) step x1.6.
- Zoom range 1 to 6. Below 1.35 the view slides back towards the whole-map centre, reaching it at 1 (no snap).
- `prefers-reduced-motion`: jump straight to the target.
- The map only redraws while the zoom is moving (then at frame rate), as the drag does now.
- Reference: `zoomTo` and `glide` in the preview (`models/desert-map.js` has the renderer; the glide is ~15 lines).

### 6. Under the hood
- One view constant (`DMAPV = {cx: 0, cz: -1310, span: 1460}` or similar) used by every place that needs the full
  map's centre and scale (the five spots above), so they can't drift apart.
- The `MAJ` regex goes; the label class comes from `cls()`, `AREAS` and `DROP`. Warp (`dmapWarpWire`) uses the same
  filter, so you can warp to an area name (its label point) and, from zoom 2, to base buildings.
- Wreckable props (cactus, rock, barrel) on the full map from zoom 2.2 as now; the minimap's 90 m cull should use `||`
  (it uses `&&` now, so it only skips things far on both axes).
- Redraw rate unchanged.

### 7. When new places are built
Add an `AREAS` row when a new place goes in (with its kind), and nothing else: its buildings appear by themselves.
The rows for the pyramid, the crash site, the lake, the observatory and Dino Dan's are already in (they exist now and
keep their footprints in their specs). Hangar 1 is inside Fort Blackout. Dusty Gulch keeps its footprint.

## Checks
- At zoom 1, every area name is readable, nothing overlaps, and Zone 51, the scrap yard, the wind farm and Dusty Gulch
  show their buildings.
- Zoomed into the base: each `MAPBN` name once, no duplicates; the parade ground the same shade as the rest.
- The minimap names the area and the nearest places; in the base it names the buildings around you.
- Warp still works from icons and area names.
