Status: proposed (plan, part 1) · 2026-10-20

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
2. El Goblino Gas outside: forecourt, canopy, pumps, price sign, shop front.
3. Motel 13 (turned): outside, walkway, office, car park, Motel Rd, neon, pool, back yard.
4. Drive-in: lot, screen tower, speaker rows, ticket booth, marquee, snack bar and projector booth.
5. Desert Bus depot: building, platform canopy, apron, Depot Rd, arch; and the water tower.

## Things Claude Code has to keep in mind
- **Seeded random:** everything here is built inside the seeded desert load steps; add or remove `Math.random()`
  calls and everything built after them changes. Burn the same number of calls where old code is removed (as
  build.py does for the crash site).
- `q.locs` names are matched exactly by squad jobs, water delivery (`WDSP`), crimes and the map; keep them.
- Motel 13's crime (`CRSPOTS`) never fires today because it is within 140 m of the PD; worth knowing, not part of
  this spec.
- Anything animated (motel doors, gas doors, neon, the screen, the projector beam) must stay `dpKeep`.
