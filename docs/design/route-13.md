Status: shipped in r657 (2026-10-23, `src/dx641.js`)

# Route 13: the old town round the bus stop

The town where BUS 13 drops you: the bus stop, El Goblino Gas, Motel 13, the drive-in and the Desert Bus depot,
with the small sights between them (those have their own spec, `small-sights.md`). The game calls it "Old Town".
Coordinates are desert-local (world z = local z - 9000), +z is north, the barrier is at z -880 (cars stop at -894).

## What's there now (survey of r645)
- **Route 13** is the old bus road along x 0 (7 m wide, z +200 … -1200, then Route 13 South). Side roads: the link to
  Sunset Blvd at z -1037 (east, a T right at the bus stop), the PD road at z -990 (east), the road at z -1120 (east)
  and Pyramid Way at z -1120 (west), plus a loop round the mining shack's **old** spot (z -1048.5, x 13, z -1076)
  that has led nowhere since the shack moved in r606 (the Highway Patrol route still drives it).
- **Bus stop** (4.3, -1043.5): a pole with the round DESERT MINES plates, a bench and a skull. BUS 13 parks on the
  road centre at (0, -1040.6). "[E] Wait for BUS 13" (solo only). Also the respawn point (4, -1040).
- **El Goblino Gas**: canopy over two pumps at (28, -1005), the shop x 36…48, z -1011…-999 (a full inside: shelves,
  fridges, counter, El Goblino, the hidden garage code). Pole sign at (22, -996). **No driveway**: the pumps sit in
  the sand between Route 13 and the shop.
- **Motel 13** x 64…88, z -905…-899, four rooms (10, 11, 12, 14 and the painted door 13). **It faces north**, at
  the barrier, with its car park (z -897…-885) mostly beyond where cars can go. No road reaches it. Pool to the east,
  neon pole at (62.5, -898).
- **Drive-in** centred (-40, -930): the screen on two posts facing north, six speaker posts, two old cars with
  sitters, a snack bar (-28, -920) and the projector booth (-40, -916). Plain sand, no road.
- **Desert Bus depot**: a small shelter (-79, -988) beside the Desert Bus (x -86.8…-81.2, z -1006…-974, facing
  south) and the orange portal arch at z -1022 (x -91…-77). No road; the bus is jammed against the shelter.
- Also in town: the water tower (58, -1060), the broken-down car (-7.5, -985), five doors standing in the sand,
  billboards, two phone booths (Town (18, -1068), Desert PD (96, -1004)), jump ramps, the Desert PD (remodelled,
  east of the gas station).
- Leftovers: the 'MINING Co. SHACK →' billboard at (-7, -1048) pointing at nothing, a ground hole at (0, -1066)
  from the old shaft (hidden under the road), and the random cacti and rocks of the bus ride, whose keep-out boxes
  still use the pre-r606 positions, so they can land inside the town's places.

## The plan
Keep every name, prop, interior, mission spot and phone booth. Things move only where this plan says so. New
globals start with `rt`.

1. **Main street.** Route 13 through town (z -895 … -1115) gets gravel shoulders, kerbs where the town's grounds
   meet it, old street lamps both sides every 24 m (with a light on every other one), a line of timber power poles
   with sagging wires down the west side, and a sign at each end: "OLD TOWN · ROUTE 13 · POP. 13" (north, z -895,
   facing south; south, z -1115, facing north).
2. **Bus stop.** A proper shelter east of the pole (x 5…9.5, z -1047…-1041.5): steel frame, roof, back panel with
   the timetable "BUS 13 · HOTEL ⇄ DESERT MINES · EVERY RIDE, ALWAYS", the bench moved inside, a bin. The round
   DESERT MINES plates stay on their pole. A painted BUS STOP bay on the road where BUS 13 parks. The prop and the
   respawn point don't move.
3. **Old roads.** Remove the dead loop round the shack's old spot (and move the Highway Patrol route off it), the
   pointless billboard, and the ground hole. Fix the scatter keep-out list so no random cactus or rock lands inside
   any place in town (better: no bus-ride scatter inside the town box at all, x -100…110, z -1125…-880).
4. **El Goblino Gas.** A concrete forecourt from Route 13 to the shop (x 3.5…36, z -1013…-993.5, joining both
   Route 13 and the PD road), a new canopy with green fascia and EL GOBLINO GAS letters on all four sides, new pumps
   on islands, a tall roadside price sign ("BREAD 12 · CHEESE 15 · GWEEN SODA 20"), an air and water post, and a
   remodelled shop front (stucco, a big window band, the sliding doors). **The shop's inside stays as it is.**
   **A drive-through car wash** (the user, 2026-10-20) east of the shop: a tunnel building x 64…78, z -1009…-1001,
   cars drive in from the west across a 16 m apron (so long cars like the dragster can line up straight; the user's
   note) (the forecourt carries on east past the shop to x 84.5, where it meets the PD drive) and out to the east, then turn
   north onto the PD road. Inside: two big spinning brushes, an overhead brush, spray arches, a dryer, lights that say
   PULL FORWARD / STOP / GO. "[E] Wash the car (5 🪙)" while you sit in a car in the bay: the car is pulled through
   slowly, brushes spin, foam and water, then a shine sparkle; it cleans off scorch marks and smoke and puts back a
   little health. A WASH sign on the roof and a price board at the entrance.
5. **Motel 13: turned round to face the town.** The building (and everything in it) turns 180° about its centre
   (76, -902), so the doors face south. Its car park moves to the south side (x 62…90, z -919…-906), a short
   **Motel Rd** joins it to Route 13 along z -922 (x 3.5…62), the neon pole stands at the car park entrance where
   you can see it from Route 13, the pool stays on the east end, and the back yard (washing line, dumpster, propane
   cage, ice machine) is on the north side. A remodelled outside: stucco, a walkway under the overhang with posts,
   room numbers on the doors, an office with a lit OFFICE sign at the west end.
6. **Drive-in.** A gravel lot (x -52…-20, z -942…-908) with a short drive in from Route 13 along z -912
   (x -20…-3.5, on the west side, opposite Motel Rd). A screen on a proper timber tower frame with bracing (screen size and place kept), the
   speaker posts in two curved rows, a ticket booth at the lot entrance, and a marquee sign by Route 13: "DRIVE-IN ·
   TONIGHT: D O O R S". The snack bar and projector booth are remodelled in place (their props stay).
7. **Desert Bus depot.** A depot building east of the bus (x -78…-64, z -1000…-978): waiting room, ticket window,
   DESERT BUS sign on the roof, a platform canopy along the bus's door side (the shelter goes), a concrete apron under
   the bus and round the arch (x -94…-62, z -1030…-966), and **Depot Rd** from Route 13 along z -1045 (x -62…-3.5).
   The groundskeeper's water tank at the shack (-15, -1049.5) moves 3 m south to (-15, -1052) so the road clears it.
   The arch is remodelled in place (posts, beam and portal kept).
8. **Water tower** (58, -1060): remodelled in place (riveted tank on four legs with cross bracing, ladder and
   walkway, OLD TOWN painted on the tank). Its ladder and spray-tag props stay.
9. **Map:** every new road and ground gets its `q.mapR` shape; the town's labels don't change.

## Model batches (part 2, after this plan is approved)
1. Main street kit: lamps, power poles and wires, kerbs, shoulders, town signs; the bus stop shelter and bay.
2. El Goblino Gas outside: forecourt, canopy, pumps, price sign, shop front, and the car wash.
3. Motel 13 (turned): outside, walkway, office, car park, Motel Rd, neon, pool, back yard.
4. Drive-in: lot, screen tower, speaker rows, ticket booth, marquee, snack bar and projector booth.
5. Desert Bus depot: building, platform canopy, apron, Depot Rd, arch; and the water tower.

## Part 2: models (`models/route13.js`, needs `fort-kit.js`)

### Batch 1: main street and bus stop, approved 2026-10-20 · `rtMain(g)` → `{obs, lights, lamps}`, `rtBusStop(g)` → `{obs}`
Call both from the town's builder (the desert load step that builds the bus stop), push `obs` to `q.obs`, and put the
game's `light(...)` at each of `lights` (every other lamp). The places the street things must avoid are in `RT`
(`gapE`/`gapW`: where roads and the gas forecourt join each side; `keep`: spots beside the road).
- **Shoulders:** 2 m of gravel each side of Route 13 from the north town sign to the south one (z -895…-1115), at
  y .012 (the road is .02), in pieces that stop at every road mouth: east at Motel Rd, the gas forecourt and PD road,
  and the Sunset Blvd link; west at the drive-in drive and Depot Rd.
- **Street lamps:** both sides (x ±6.6), every 24 m, the east row offset 12 m; a tapered steel pole, an arm curving
  out over the road edge, a long lamp head with a glowing lens. None at a road mouth, by the broken-down car, the
  bus stop or the Highway Patrol car's spot.
- **Power poles:** down the west side (x -9.5) every 36 m (nudged off the road mouths), with a crossarm, three
  insulators, braces and step bolts; three wires sag from pole to pole.
- **Town signs:** OLD TOWN · ROUTE 13 · POP. 13 · HOME OF BUS 13 on a board hung between two posts, painted
  LEAVING OLD TOWN · DRIVE SAFE · COME BACK SOON (YOU WILL) on the back. North end (-9.5, -897) facing north (the way
  BUS 13 comes in), south end (9.5, -1113) facing south.
- **Bus stop shelter** just south of the pole, x 5…9.5, z -1050…-1044.5 (moved 3 m south of the first plan so the
  round plates don't hide its fascia): a blue steel frame (corner posts, a middle post at the back, eaves beams), a roof
  sheet sloping 20 cm to the back with a deep edge band all round (the front band is the BUS 13 · DESERT MINES sign),
  glass back and full-depth glass ends cut to the slope, a timetable poster (BUS 13 · HOTEL ⇄ DESERT MINES; departs ??:??, ANY MINUTE / NOW,
  NEVER / ALWAYS; "Do not run for the bus. It waits."), a slatted bench inside, a bin at the south end. Open to the
  road. **Remove the old bench and skull** beside the pole (`bench`, its legs and `skl` in busBoard0) and their
  obstacle `ob(4.8,5.4,-1044.4,-1042.6)`. The pole, its plates, its obstacle and the "Wait for BUS 13" prop stay.
- **BUS STOP bay:** a yellow dashed box on the east lane (x .35…3.35, z -1053.5…-1041.5) with BUS STOP written for
  drivers heading north.
- Checked: z-fight and floating checker clean (the only hits are the curved wires against themselves and the glass
  frames' bottom rails, which hang between posts).

### Batch 2: El Goblino Gas and the car wash, approved 2026-10-20 · `rtGas(g)` → `{obs, lights, pumps}`, `rtShopFront(g)` → `{obs}`, `rtCarWash(g)` → `{obs, lights, bay, parts}`
Call all three where the base builds El Goblino Gas (`busRoamBuild`). The shop's inside, El Goblino, the counter,
shelves, fridges, till, the sliding doors, the OPEN 24/7 (ish) sign, the ICE chest, the explosive barrels, the taxi
stand and every prop stay as they are.
- **Remove from the base:** the canopy slab, its four posts (keep their obstacles: the new columns stand on the same
  spots), the cream fascia and its EL GOBLINO GAS text, the two pumps and their islands (the new `pumps` replace them:
  keep the two "Fill up" props and give each pump obstacle `kd:'pump'`, with `m` = the new pump group, so it still
  gets knocked over; the obstacle is now x 26.8…29.2 by 1.2 m), the old pole sign `dsSign('EL GOBLINO GAS…')` at
  (22, -996), and **the shop's west wall pieces** (the two side pieces and the header over the door; keep their
  obstacles), because `rtShopFront` is the new west wall.
- **Forecourt:** concrete slabs (4 m joints, oil stains) x 3.5…84.5, z -1013…-993.5 at y .025, joining Route 13, the PD drive and the
  PD road; a low kerb along the south edge; a dashed yellow box in front of the car wash entrance. No arrows (the user
  didn't like them).
  (The first version's canvas arrows came out squashed and its long lead-in lines looked like they floated; the
  user's note.) Add its `q.mapR` shape in a concrete colour (and make sure the route grid lets cars drive on it).
- **Canopy:** x 20.6…35.4, z -1010.6…-999.4, underside at 5 m, 0.9 m deep, green with a white stripe, EL GOBLINO GAS
  and El Goblino's logo (his red head, ears, yellow eyes and top hat on a green disc) on the north, south and west
  faces, a white underside lit softly from its own lights, six glowing panels set flush in thin steel rims (the first
  version's panels hung below a dark underside and looked like they floated; the user's note) (`lights`: three points for the game's lights), four square
  white columns with a green foot and a lit band.
- **Pumps** (one group each, at (28, -1007.2) and (28, -1002.8)): an island 2.4 × 1.2 m with yellow noses and
  bollards, a white dispenser with a green top and foot, the logo, a price window "7.13 🪙 GWEEN UNLEADED" and a hose
  and nozzle on both long sides (cars pull up along x either side).
- **Price sign** by Route 13 at (12, -996.2): two steel posts, the logo on top, EL GOBLINO GAS, and a price board
  BREAD ··· 12 · CHEESE ··· 15 · GWEEN SODA ··· 20 on both faces. Obstacle x 10.1…13.9.
- **Air and water post** at (34.6, -1012.4).
- **Shop front** (`rtShopFront`, the new west wall, x 35.85…36.15, z -1011.16…-998.84, 4.2 high): stucco piers, two
  shop windows you can see into (z -1010.2…-1007.4 and -1002.6…-999.8, sill 0.9, head 2.5) in aluminium frames, a
  green tiled base, the doorway exactly where it was (z -1006.3…-1003.7, 2.6 high) for the sliding doors, and a
  parapet above the roof with EL GOBLINO GAS · SHOP and the logo.
- **Car wash** (`rtCarWash`, x 64…78, z -1009…-1001, 4.4 high, open at both ends, a 16 m apron in front with painted
  lead-in lines; the explosive barrels at (44, -996) and (45.2, -996.4) move out of the north lane to (37.4, -1012.4)
  and (38.4, -1012.5), beside the air post): white walls with a bubble mural (whole bubbles that
  join across the tiles; the wall ends are plain, the user's note) and a green foot, a green fascia, a blue WASH sign on the roof, ENTER · 5 🪙 · STAY IN YOUR CAR over the entrance, a
  price board at the entry (WASH · 5 🪙, WAX · FREE, GOBLIN NOT RESPONSIBLE FOR GOBLINS), a wet dark floor with tyre
  guide rails and a drain, three ceiling lights (`lights`), a blue spray arch with nozzles (`parts.jets`: soft white
  spray cones, hidden until washing), two tall side brushes and an overhead brush (soft foam rolls: a striped
  roll inside a ragged fringe), a dryer hood standing on two floor ducts and tied to the ceiling, and a PULL FORWARD / STOP / GO sign hung on
  two rods at the exit (`parts.sign`). The ceiling is a white slab between the walls (underside 4.31 m) with the
  three light panels flush in it; the green roof box sits on the wall tops.
  **How it plays:** drive into the bay (`bay`), "[E] Wash the car (5 🪙)" while you sit in a car in the bay: the car
  is pulled slowly from the arch to the exit (about 8 s; your controls are off), the jets show, the brushes spin
  and **close in until they touch the car**: call `rtWashTick(W, car, dt)` every frame with the car's
  `{x, z, hw, hl, top(dx)}` (half width, half length, roof height along its length; null when the bay is empty). It
  spins the brushes and slides `parts.sliderL/R` (the side brushes, hung from carriages on the gantry beams) in along
  z onto the car's sides, round its nose and tail as it arrives and leaves, and `parts.sliderTop` (the top brush, on
  arms in fixed sleeves) down onto the bonnet, roof and boot; the foam squashes 6 cm into the paint. The user's note:
  the first version's brushes didn't touch the car. then
  the dryer roars and GO lights up; it removes scorch and smoke on the car and gives back 10% of its health. The
  walls are obstacles; the brushes and jets are not. In co-op the washing car's owner runs it and sends start and
  progress.
- Checked: z-fight and floating checker clean except for faces hidden under the shop's roof and the brushes, which
  hang from their gantries.

### Batch 3: Motel 13, approved 2026-10-21 · `rtMotel(g)` → `{obs, lights, doors, tvs, spots, plates}`, `rtMotelLot(g)` → `{obs, lights, neon, vac, cars, mapR}`, `rtMotelPool(g)` → `{obs, plates}`
These replace the whole base motel block (`/* ---- MOTEL 13: four rooms you can walk into ...` in the far-desert
builder, from `const mx=64,mz=-902` to its `q.locs.push({nm:'Motel 13'...})`) and the `T('motel back',...)` block.
Keep every prop and its text, the noise TV game (`q.tvs`, `noisePush`/`noiseOut`), `q.d13`, the ice machine's
cooldown and heal, the loc 'Motel 13' at (76, -902). Only their places change; `spots` has them all.
- **Turned round:** the doors face south. Seen from the car park the doors read **10, 11, 12, 14, OFFICE** from left
  to right: room 10 is at the east end (x 82…88), then 11, 12, and room 14 at x 64…70 beside the new office. (Not a
  straight 180° turn: the rooms are mirrored north-south and renumbered so the order still reads left to right from
  the car park. The insides are the old ones, mirrored.) The painted door 13 is on room 14's east wall, the wall it
  shares with room 12, between the dresser and the bathroom. The lipstick message is still in room 12.
- **Building:** office x 56…64, rooms x 64…88, front wall z -905, back wall z -899, walls 20 cm thick on those lines,
  3 m high; cream stucco outside, striped wallpaper in the rooms, pine panelling in the office; a flat roof (3.0…3.25)
  with a white ceiling and soffit, a 2 m overhang over the walkway and a turquoise fascia with a white cap. All of
  it is static and can be batched except the door hinges, the TVs, the office fan and the washing.
- **Doors (`doors`):** `{n, hinge, x, z, ob}` for rooms 14, 12, 11, 10 and the office (`n:'office'`). The hinge is
  on the door's west edge; the base code's `hinge.rotation.y=-st.a` swings it **into** the room. `ob` is the door's
  obstacle (already in `obs`): take it out of `q.obs` while open, as the base does. The props: outside at
  (x, -906.0), inside at (x, -904.1); the "standing in the doorway" check uses z -905. Give the office door the same
  open/close prop ("[E] Open the office"). Each door has a brass number, and there is a lamp beside every door.
- **Rooms:** for each `spots.rooms[i]` = `{n, x0, door, bed, mirror, tv, ac, d13?}`: bed prop at `bed`, mirror prop
  at `mirror`, TV prop at `tv`, door 13 prop at `d13` (room 14). `tvs[i]` = `{tg, screen, x, z}`: push
  `{tg, x, z, off:0, n:0}` to `q.tvs` and set `screen.material.map = STT` (the game's static).
- **Office (new):** a big window with a lit VACANCY sign, a counter with a bell, the guest book and BACK IN 13 MINUTES,
  a key board (10, 11, 12, 13, 14; the 13 hook has a key), a 13-hour clock, a calendar, a ceiling fan
  (`spots.fan`, turn it about y), a bench, a postcard rack, a water cooler, a cactus, a leaflet rack. New props:
  "[E] Ring the bell" at `spots.bell` (ding; nobody comes; the sign says BACK IN 13 MINUTES; it said that last time
  too), "[E] Look at the keys" at `spots.keys` (keys for 10, 11, 12 and 14, and one for 13 that fits nothing), "[E]
  Read the guest book" at `spots.book` (every name is "A. Traveller", every one checked in, none checked out). A lit
  OFFICE box sign stands on the roof over the office.
- **Ice machine** on the walkway by the office door, (56.75, -905.55); its prop at `spots.ice`.
- **Walkway:** concrete, 12 cm high, z -906.9…-905.1, x 55.9…88.1, white posts; push `plates` (y .12) so you stand on
  it. Concrete sills in the doorways.
- **Back yard** (north side, gravel to z -894.6): an air conditioner on a bracket and a frosted bathroom window per
  room, drainpipes, the dumpster (76, -896.6, label facing the building), the propane cage (67.1, -897.4), the washing
  line between (79.5, -895.6) and (85.5, -895.6) with four sheets (`spots.sheets`: sway them about x, as the base
  does). The ice machine moved to the front.
- **Car park (`rtMotelLot`):** asphalt x 56…90, z -925.5…-906.9 (painted: ten bays nose-in to the walkway, OFFICE in
  the two office bays, the room numbers in the others, MOTEL 13 GUESTS ONLY in the aisle for cars coming in), concrete
  wheel stops (drive over them), two lot lamps on the south edge, a P · MOTEL GUESTS ONLY sign. The two guests' cars
  (`mkOldCar`) go at `cars` ([x, z, ry], nose to the walkway). Add `mapR`.
- **Motel Rd:** the game's own road, `road(56,-922,3.5,-922)` (Route 13 to the car park; it ends where the car park
  starts). The batch 1 shoulders already leave its mouth open.
- **Neon sign** at the car park entrance (54, -917), by Motel Rd, seen from Route 13: a concrete foot, a pole, a big
  double-sided MOTEL 13 board (· KING BEDS · COLOR TV · ICE ·) with a pink tube border, VACANCY under it, a gold star
  on top. Flicker `neon` (the base's 4% flicker on `material.opacity`); `vac` stays lit. Its light is in `lights`.
- **Pool (`rtMotelPool`)** stays at x 92.5…99.5, z -905.5…-901.5: a concrete deck (x 90.5…101.5, z -907.5…-899.5,
  `plates` y .06), a tiled coping with 3 FT / 13 FT marks, water light at the shallow end and dark at the deep end,
  a ladder, two loungers with towels, an umbrella and the rules (NO LIFEGUARD · NO DIVING · NO RUNNING · NO SEEK).
- Checked: z-fight checker clean; the only "floating" hits are the AC grilles and drawer fronts, which are on the
  faces of their boxes.

### Batch 4: the drive-in, approved 2026-10-21 · `rtDriveIn(g)` → `{obs, lights, posts, spots, parts, mapR}`, `rtDriveHuts(g)` → `{obs, lights}`
Replace the base drive-in's meshes (the block `/* ---- the drive-in: a big screen showing "DOORS"...` and the
`T('drive-in',...)` block) with these. **Keep:** the picture plane `pl` and its canvas animation (it stays at
(-40, 6, -937.8), 5 cm in front of the new screen), the projector beam, its switch prop and `XM.net.proj`, the popcorn
prop, the two old cars (`mkOldCar` at (-44, -923) and (-37, -923)) with their sitters, the loc 'Drive-in'.
**Remove:** the old screen box, its two posts and brackets and its obstacle (the new `obs` has the screen's), the six
speaker posts and their cables, the snack bar's boxes, glass, counter and label, the projector booth's boxes and
lens (the beam stays), and the snack bar's and booth's old obstacles (same footprints in the new `obs`).
- **Lot:** gravel x -52…-20, z -942…-908 (1.5 cm up). **The drive:** the game's road `road(-20,-912,-3.5,-912)`;
  batch 1's shoulders already leave its mouth open. Add `mapR`.
- **Screen:** the same panel (14.5 × 7, centre (-40, 6, -938), facing north) with a cap and side trims, a green skirt
  board under it (PLEASE HANG UP YOUR SPEAKER BEFORE YOU DRIVE AWAY), and behind it a timber tower: four posts,
  girts, cross braces in every bay, a raking strut to a concrete foot behind each post, knee braces, and a steel
  ladder up the middle.
- **Speaker posts (`posts`):** two rows curved round the screen (radius 15 and 22 from (-40, -938)), between the
  3.5 m parking bays; the second row leaves a gap round the projector booth. Each: a pipe in a concrete collar, a
  junction box marked ROW 1 · 3 etc., two speakers on hooks (one for the car on each side) and their cables.
  Optional prop at each post: "[E] Hang the speaker on your window" (a crackly "...DOORS...", static).
- **Ticket booth** at (-17.5, -906.9), on the north side of the drive at the lot entrance: a white booth with glass
  all round, a red roof and a TICKETS sign, a hatch on the drive side. New prop at `spots.ticket`: "[E] Buy a ticket"
  (free: "The booth is empty. A sign says PAY AT THE SNACK BAR. The snack bar says PAY AT THE BOOTH.").
- **Marquee** at (-13, -919.5), south of the drive mouth and clear of the power line: two steel posts, a neon
  ★ DRIVE-IN ★ header and a bulb-ringed letter board TONIGHT · D O O R S · ALSO SHOWING: RUN., on both faces (north
  and south). Two lights in `lights`.
- **Snack bar** (same footprint, (-28, -920), 4 × 3 m): cream walls with a red base band, a serving window to the south
  with a counter on brackets and a red and white awning, the SNACKS · POPCORN 3 🪙 · GWEEN SODA sign, a popcorn machine,
  a soda fountain and a menu board inside (POPCORN 3, GWEEN SODA 2, HOT DOG 4, MYSTERY BOX 13), a back door, and a
  giant popcorn box on the roof. The popcorn prop and its light stay where they are.
- **Projector booth** (same footprint, (-40, -916)): block walls, a flat roof with a cream drip edge, the projector
  housing and lens in a port in the south wall (where the beam starts), a second port, a steel door on the north side
  (PROJECTION · KEEP OUT, where the switch prop is), a roof vent, and a film reel badge on the east wall.
- Checked: z-fight checker clean except the speaker cables' tight bends against themselves; nothing floating.

### Batch 5: the Desert Bus depot and the water tower, approved 2026-10-21 · `rtDepot(g)` → `{obs, lights, plates, spots, mapR}`, `rtWaterTower(g)` → `{obs, parts}`
**Depot.** Replace the base depot block (`/* ---- the Desert Bus depot: a shelter, a timetable, and the arch ...`):
**remove** the shelter (roof, four posts, bench, its obstacle `ob(x+3,x+7,z+1,z+3)`), the timetable and its board,
the two orange arch posts and their obstacles, the beam and its two TO LAS VEGAS labels. **Keep** the portal plane,
its glow sprite, the two glow strips (y .04 and 5.71) and the portal animation, the loc 'Desert Bus depot', `DBX`
and everything about the bus (it still parks at (-84, -990) facing south; the hitch-ride and get-off spot
(-79, -985) is now on the platform).
- **Apron:** concrete (3 m slabs) x -94…-62, z -1030…-966 under the bus and round the arch, plus a lane x -72…-62,
  z -1049…-1030 down to **Depot Rd**, the game's road `road(-62,-1045,-3.5,-1045)` (batch 1 already leaves its mouth
  open on Route 13). A yellow dashed BUS ONLY box round the bus's spot. Add `mapR` (apron, building, platform).
- **Depot building** x -78…-64, z -1000…-978, 4.2 m walls and a parapet: cream stucco with an orange base band and
  coping, big aluminium windows, a glass entrance onto the platform (z -991.2…-988.8) and another onto the lane in
  the south wall (x -72.2…-69.8), glass doors standing open, high windows on the east side. A big DESERT BUS sign
  (with a little bus) on a steel frame on the roof, both faces. Walk-in: a terrazzo floor, the ticket counter along
  the north wall (TICKETS, INFORMATION, LOST & FOUND) with a stool, a DEPARTURES board (LAS VEGAS · NOW, LAS VEGAS ·
  NOW, LAS VEGAS · ON TIME, TUCSON · YOU ARE HERE, ANYWHERE ELSE · NO) and a clock marked 5 MIN, three rows of
  back-to-back benches, lockers, a GWEEN SODA machine, GENTS and LADIES (OUT OF ORDER) doors, the old timetable framed
  by the platform door, ceiling lights.
  Props at `spots`: "[E] Read the timetable" (the old text), "[E] Look at the departures" (board), "[E] Buy a ticket"
  at the TICKETS window ("No need. The bus is free. The bus is always free. That is the problem."), "[E] Buy a
  GWEEN SODA (2 🪙)" (+ a little health, like the snack bar).
- **Platform:** 25 cm high, x -81.1…-78, z -1005…-976, along the bus's door side, with a yellow edge line, two
  benches and two bins against the building, a canopy cantilevered off the wall on tie rods (two slim columns carry
  its ends), and PLATFORM 1 · LAS VEGAS signs hanging under it. Push `plates` (y .25).
- **Arch**, remodelled in place: orange pillars 0.9 m wide whose inner faces stay at x -90.75 and -77.25 (where the
  portal meets them), white chevrons, concrete plinths, and a deep beam with TO LAS VEGAS · 360 MI and bulbs on both
  faces; its bottom stays at 5.75 m, on top of the portal. Pillar obstacles in `obs`.
- The groundskeeper's water tank at the shack moves from (-15, -1049.5) to (-15, -1052) so Depot Rd clears it.

**Water tower** at (58, -1060), remodelled in place. Replace the base tower block (`/* ---- the water tower: four
legs ...`) meshes; keep the loc, the ladder prop, the perch and the spray tag code (`T('water tower',...)`).
- Same legs (feet at ±3.4, meeting the tank at ±2.1 at 11.2 m), now steel tubes on concrete feet, two rings of struts,
  tension-rod X bracing with turnbuckles; a ring girder, a riveted tank (radius 3, 11.6…15.6 m) with OLD TOWN · DOORS
  BUT DESERT · POP. 13 painted on the road (west) side, a conical roof with a finial, a red light and a vent, the
  catwalk (radius 3.62) with a railing, the ladder exactly where it was (x 61.78) now with a safety cage, a short
  ladder up the tank side to the roof, and the outlet pipe with a red valve wheel. Obstacles in `obs`.
- **Spray tag:** the old flat tag plane stood out from the round tank at its edges. Use `parts.tag` instead (a curved
  panel on the east face, same size, 2 cm off the tank): set its `material.map` to the tag canvas texture and
  `material.opacity = 1` (it starts invisible), and drop the old plane.
- Checked: z-fight checker clean on the depot, the arch and the tower; nothing floating.

## Things Claude Code has to keep in mind
- **Seeded random:** everything here is built inside the seeded desert load steps; add or remove `Math.random()`
  calls and everything built after them changes. Burn the same number of calls where old code is removed (as
  build.py does for the crash site).
- `q.locs` names are matched exactly by squad jobs, water delivery (`WDSP`), crimes and the map; keep them.
- Motel 13's crime (`CRSPOTS`) never fires today because it is within 140 m of the PD; worth knowing, not part of
  this spec.
- Anything animated (motel doors, gas doors, neon, the screen, the projector beam) must stay `dpKeep`.
