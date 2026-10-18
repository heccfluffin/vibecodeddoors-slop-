# Notes for the design chat

## 2026-10-18 · r623: the airfield and Zone 51 batches 1-5 built (airfield-zone51.md, dx617)
- xpAirfield and xpDarkZone are redefined in dx617 and use your models. r623 was held until batch 5 was approved, then shipped with it; zfSaucer is the new copy (no seat blob).
- **Batch 5:** as specced. The Artifact hums (a low tone every 1.6 s) within 15 m. The keypad prop buzzes twice and says ACCESS DENIED.
- **Abduction:** built as specced (zfAbdTick).
  - The ride-out saucer starts up to 200 m from the drop point, on the line from Hangar 18, so it comes from the base's direction. It starts at the hangar if the drop point is nearer than 200 m.
  - The camera rides 3.6 m under its hatch, pitched down 0.55.
  - After the drop it leaves along its heading.
- **Boom barrier:** the arm isn't animated; it stays down even after the gate is rammed.
- **Fuel drums:** I used your dump's static drums (the old knockable barrels are gone).
- **Inside roads:** gate to Hangar 18's apron along z -1870, and the x -540 branch to the barracks. They're the game's own `road()` asphalt; no model was needed.
- **Hangar 18:** the old 4 m obstacle under the saucer is gone, since you get drawn into the beam anyway.
- **Tank traps:** I didn't check whether AI route planning gets through the 3.4 m weaving lane. The route grid pads obstacles by 2.2 m, so it may treat the road in as closed. Players can drive it.

## 2026-10-17 · r620: Goblino's Scrap (scrap-yard.md) and the police helicopter (cars.md part 13), dx616
- Built as written. xpScrap and xpCrusher are redefined in dx616 and build the yard from your models. crushTick, crushOK and crushStart are redefined too.
- **crushStart** used to put you at cz + 5.5 when it waved you out of the car. That's behind the new back wall, so you now land at cz - 5.5, in the turn-in.
- **Spawned car or Wraith hint:** shown once per car, and only to the driver.
- **Ingot hint:** uses the car's VEHK name, e.g. "A cab's worth: 18 gold".
- **Monster truck theft:** +40 heat (2 stars), crime text "stealing El Goblino's monster truck". It resets within 6 m of the spawn point. It doesn't count if you own a monster truck.
- **Police helicopter:** the rotor groups are marked dpKeep in the swap patch (build.py).
- **Fort Blackout road fix:** the "roads cull up close" report was the old road strip. The game's `road()` only records a road; `xpRoadsBuild` later lays the old textured strip (6 cm high, depth factor -8) and junction patches. Fort roads are now flagged `fb` and get neither (they still go on the map and route grid). If a design needs `road()` for routing under its own road model, set `fb` the same way.

## 2026-10-17 · r619: Old Quarry fixes applied as written
- Crucible rail, trolley and stream now use RZ = SM.z - .3 (dx581). The rubble mound moved to (-185, -1451) (dx589). Built and load-checked; not yet watched pouring in the game.

## 2026-10-17 · r618: Old Quarry rework built (old-quarry.md, dx615)
All of part 1 and batches 1-5 are in. Differences from the spec, and why:
- **Route grid (your "please check"):** you were right. The floor and the haul-road lane were two levels with a wall between them; plates at the same height now share a level. But the second machine row (z -1466) also closes the gap to the bottom of the haul road for the route grid (4.6 m physically, shut once every obstacle is padded by 2.2 m on a 3 m grid). Rather than move the row, I added a straight-line route link from (-225,-1471.5) to (-200,-1466). AI drivers now get from the highway to the pit floor and the walkway between the machines.
- **Crucible stops:** I kept `SM.tro.a = SM.mx - 1.25` (not `- .75` more). The pour code already subtracts the lip offset from `a` itself, so taking .75 off again would have poured short of the first mold. The molds are reversed as you said.
- **Pour stream:** it falls at RZ (z -1447.6), under the pot. That's 15 cm outside the molds' front edge, because the molds sit at the table's centre line. Moving RZ or the molds would line it up, if you want it exact.
- **Die press mode:** the metal now runs from the furnace's tap hole into the launder, so the crucible no longer tips at home (it would have poured onto nothing).
- **Water tank** for the washer: moved from x w-0.5 to w-0.8 (-228.8), into the gap between the furnace and the mold table; at the old spot its pipe ran through the turned mold table's bar rack.
- **Ore hopper:** obstacles on its four legs (it returns none).
- **The game's labels** were dropped wherever your models have their own (crew ore, ore feed, arc furnace, press, refinery, assay, hopper, grinder, smeltery, ingot molds). The winch keeps the game's DIESEL WINCH / ELECTRIC HOIST board, and the blast furnace (level 1) keeps its board, now on the furnace's front.
- **Haul truck:** it backs up the last leg to the crusher (so it ends facing north and tips over the hopper), wheels roll backwards while reversing, and it turns at a steady rate.
- **The rubble mound at (-188,-1448)** touches the ore hopper's new basin.
- **Lookout Mesa (the user spotted it):** the road up the mesa was a thin slab with nothing under it; there is now a solid embankment under it (plain earth colour).
- **Fort Blackout roads vanishing up close (the user saw it):** the motor pool apron slab and its lines (which I built outside the kit builders) were not marked `noSeam`, so the game's seam smoothing piled a depth nudge of -18 on them and they were drawn over North Street near the camera. Everything the kit draws is now marked. If you ever hand me plain kit pieces built with `k.H(g)` directly, I mark them the same way. I also fixed the game's ground-layer pass so it can no longer stack nudges on shared materials.
- **Checked:** the build, no errors with every upgrade at max, every hook present, the route grid (highway → haul road → pit floor → machine walkway), and screenshots of the yard, the machine rows, the mine head, the rim, the pit floor and the mesa road.
- **Not checked (real play):** the smelt/pour/cast cycle, the press and launder, the skip cycle, the hopper pour animation, ore riding the belts, the truck's run, the blast, the office walk-in, co-op.

## 2026-10-17 · r617: two Fort Blackout fixes
- The command wing's and the Wraith bays' walls are centred on their lines in the game (they stand 15 cm proud of the outline), so `fbCmdBlock`'s skins, windows and boards were buried inside them. In my copy `fbCmdBlock` dresses an outline 15 cm larger (x 429.85..470.15, CW front z -860.15, bay front z -825.85). If you remodel those two again, use those numbers.
- `fbAirOps`: the weather mast by the door stood in the service road; it's on the roof now (331, -938).

## 2026-10-17 · r616: Fort Blackout rework built (fort-blackout.md, dx614)
Everything in the spec is in, as one release. What's different from the spec, and why:
- **Depth nudges (please use this in future kit pieces):** a slope nudge (`polygonOffsetFactor`) on a big flat slab pulls it in front of everything standing on it when you look across it at a low angle. The parade ground hid its own podium, the formation and the bleachers. In my copy every nudge is now constant only (`polygonOffsetUnits`, factor 0), and that's enough at all distances. The game's seam smoothing (r406) was also stacking its own nudges on the kit's touching slabs and lines (factors of -100 and more), so everything the kit builds is marked `noSeam`. The model files in docs/design/models are untouched; the changes are in src/dx614.js.
- **Chicane:** the two rows of teeth are at z -1020 and -1009 (the spec had -1016..-1008), and they overlap by 3.5 m instead of fully. The AI route grid pads every obstacle by 2.2 m on a 3 m grid, and with the spec's spacing it closed the only way through the fence gap. Squads, police and the autopilot would have been locked out of the base.
- **Airside lane:** 5.6 m wide, not 7. Its east edge would have run into the motor pool's west wall at x 495.
- **Junctions:** a road that ends at another stops at that road's edge (so no slabs overlap), and the through road has a kerb/pavement gap there, so no trims were needed. Gate Avenue's gaps cut both sides.
- **Badge:** the ring text on the parade badge read backwards; the letter rotation sign is flipped.
- **Silo:** the lid and the rams are kept out of the batching (`dpKeep`), or the lid's render hook never runs and it never opens. Checked: it opens.
- **Tool carts:** I removed the plain set in milBuild instead of the interiors set (bak:6825). The interiors ones are nicer, and one plain cart stood in the spares rack.
- **Inspection op:** the gate post was inside the new canopy, so it's at the guard post (556,-917) now; the motor pool post is on the new apron (521,-890).
- **The "leftover beacon" at (520,-666)** was the X-13 trials' first gate (only shown during that op). That gate is on South Street now (505,-735).
- **Small moves:** the hangar programme sign is at y 8.25 (it clipped the new door header); the FIRING LINE sign moved to z -799 (it stood on Parade Road).
- **Bounds:** `MILAA` z0 is -1010 (not -1000) so the annex fence is inside it; the visitors' safe lane now starts at the outer checkpoint (z -1010).
- **Squad vehicles** wait inside the shed in the four door columns, facing south. They drive out through their door onto North Street, and come home the same way.
- **Kept:** the restricted-zone patrol tank loop; the water tower; the comms tower; the fire truck.
- **Known:** Air Ops' radio mast obstacle pokes 0.4 m into the south half of the service road at x 331. In the headless renderer two of the command wing's front windows drew without glass.
- **Checked:** the build, no errors, nothing else in the new west strip (no cacti, rocks, props or vehicles there), no road crosses the new outline; the route grid gets from the highway through the checkpoint to the gate, North Street, the taxiway and the service road; the base grid gets from the gate to every new road, the bay apron and the motor pool apron. Screenshots: overview, gate, checkpoint and airfield, west strip, parade ground, plaza, motor pool, command wing, restricted zone, silo (shut and open).
- **Not checked (real play):** driving round, squads leaving and coming home through the new shed doors, missions (flag, inspection, patrol, supply run), co-op, frame rate on a real GPU.

## 2026-10-17 · From the design chat: Fort Blackout is ready to build
`docs/design/fort-blackout.md` has the new layout (part 1) and all five model batches (part 2), each approved by the
user. Load `models/fort-kit.js` first, then `fort-north.js`, `fort-west.js`, `fort-air.js` and `fort-mid.js`.
Positions are desert world x/z. The base grows west to x 215 and takes in an airfield annex. `CWB`, `WBAY`, the
runway and the main gate don't move; `MPOOL` does.

## 2026-10-17 · Before the Fort Blackout rework: what the code expects (constraints, not a spec)
Plan around these, or tell me in the spec which ones should move. Anything that moves is fine, I just need the new numbers. Coordinates are desert world x/z.
- **Base bounds** `MILB` x 300..600, z -930..-660 (the "you are on the base" checks, map frame). `MILRZ` x 300..600, z -725..-660 is the restricted zone. `MILAA` x 230..670, z -1000..-590 is the air-defence area. If the outline changes, give me new rectangles.
- **Main gate** at x 561, z about -930. The Wraith autopilot drives in and out through `WK_GATE` points (561,-990), (561,-962), (561,-938). Squads and police also leave through it. If the gate moves, give me the road line through it.
- **Walking/driving grid inside the base** (`bgGrid`/`bgPath`) is built automatically from the wall and building boxes (`q.obs`). New walls work by themselves, but gaps narrower than about 3 m are closed for vehicles, so keep driveways at least 4 m wide (8 m+ for the tank and the Wraith).
- **Command wing** `CWB` x 430..470, z -860..-846: 4 general offices, each with the squad camera monitors and a high-security door to its Wraith bay.
- **Wraith bays** `WBAY` start at x 430, z -845..-826, 4 bays 10 m wide, right behind the command wing. Bay ownership and the parked-Wraith restore depend on these numbers. The bays and the offices must stay next to each other, or the doors need a new link.
- **Squad motor pool** `MPOOL` x 455..485, z -901..-872 (squad vehicles parked in rows, the crew stands there).
- **Other spots with fixed positions** (map labels `MAPBN`): Hangar 1 (395,-694), HQ (360,-886), Tank park (470,-806), Launch control (520,-708). The base map draws the walls itself; only the labels are hand-placed. Give each building a name and centre.
- **Runway 09** (the autopilot "nearest airstrip" landing): `ALB` = runway centre line z -980, approach from the west, touchdown about x 265. The parked aircraft sit near the hangar. If the runway moves or turns, I need both ends and the direction to land.
- **Police patrol beats** (`PCRB`) are point lists on the roads. One goes around town and the bus stop near the base (x 0..205, z -935..-1120). If roads near the base move, list the new road centre lines and I'll redo the beats and squad routes.
- **Missions and crime events** use a few base spots (the HQ desk, Launch control, the tank park). Moving a building is fine; tell me which old building it replaces so the missions follow it.
- **Performance:** a big rework is fine. The batching system merges static meshes automatically, so many small parts are OK, but please avoid lots of separate transparent or animated parts across the base.

## 2026-10-17 · r615: the plane and the Desert Bus (cars.md parts 11-12, dx613)
- `mkPlane` replaces the plane model (same finishing step as the other new vehicles). `busShell` replaces the old grey box, light, bumper line and wheel loop in `mkMegaBus`; the board, seats, zones, doors and the rest of the base bus logic are untouched.
- `biKit`, `biMerge`, `mkMegaInterior`, `megaExtras` and `megaPolish` are used whole: the new ones replace the old functions (nothing else wrapped them). The bus counts about 900 meshes after merging (the count includes the parts that stay separate on purpose).
- Checked: the bus builds with all its hooks (36 seats, 51 obstacles, 14 zones, 8 wheels, hoop, ball pit, 2 doors), the plane has its propeller, 3 wheels and steering; outside and inside screenshots look right; no errors. Not checked in real play: driving the bus, sitting in seats, horn/autopilot/pump, cooler, slots, hoop, ball pit, tub, karaoke, the blow-up.

## 2026-10-17 · r614: odd cars (cars.md part 10, dx612)
- `mkOddCar` for the hearse, limo, rally car, tractor and ice cream van, as written (same finishing step as the other new cars; the ice cream van keeps `userData.jingle = 1`; the tractor's wheels roll by their own radius).
- Checked: each builds with its hooks, nothing below the ground, a parked-row screenshot looks right. Not checked: driving them, the interiors.

## 2026-10-17 · r613: helicopters, jets, runabouts (cars.md parts 7-9, dx611)
- `uh9Model`/`ah4Model` replace `awHeli`/`awGunship`, `jetModel` replaces `awJet` (pods passed from `VEHK[k].msl.pods`). The VEHK numbers from the headers are set (heli pods and gun, gunship gun, jet gun). The jets' gear uses `gearSet` in `awLook` exactly as you wrote it; anything without `gearSet` keeps the old shrink.
- `mkRunabout` for bike, golf, quad and buggy (with the same finishing step as the other new cars: scale, gold-tint marks, tyre radius). The bike's front wheel now turns by `str·0.5`, the same as the bars.
- Checked: every model builds with its hooks and nothing sits below the ground (only the jets' afterburner glow sprite box dips 0.15 m, which is invisible). Not checked: flying them, the cockpit views, the gear folding in flight.

## 2026-10-16 · r612: squad camera monitors (office-monitors.md, dx610)
- Built as specced: a bank on each office's left wall at (ox0 + 0.15, 0, -853), desk collision box from the header. Feeds only for squads of yours, only rendered while you stand in your own office on foot, one feed per frame round robin, half rate under 30 fps. 320 × 180 targets, camera 14 m behind / 7 m above the lead vehicle (lerp 0.1), circling 12 m out at 6 m while on site, SIGNAL LOST frozen 10 s.
- The desert hides chunks and vehicles far from the player, so far squads would film empty sand: for each feed render, the chunks and vehicles within 250 m of that feed's camera are shown for that one render, then hidden again. The feed camera also sees the r603 far-cull layer.
- The big view on E at the desk (nice to have) is not built.

## 2026-10-16 · r611: new vehicle models (cars.md, dx609)
- All six model files are in the game, unchanged except the font string (`Arial`; the build swaps it for DoorsSans).
- **Highway Patrol car:** it was never built from the cop model. It is the sports car plus `hwpDress`, so it is now `mkFastCar('sport')` in the dark HWP paint. Its door panels and HIGHWAY PATROL text, hood badge, light bar and push bar were moved to fit the new body: panels at x ±1.03–1.045, 1.5 m long, centred at z -0.05 so they clear the side intake; badge tilted to the hood; bar on the roof. The "V12 · DESERT GT" stripe is hidden on it.
- **APC:** the r577 driver's compartment stays. While you drive it, every hull part that reaches into the compartment is hidden (chosen by position now).
- **Seeks and El Goblino:** the Seeks in the APC hatch and the SWAT driver's seat wear caps (`mkCopSeek`). El Goblino drives the tow truck; the tow hook swings gently.
- **Vans:** only the prison's three INMATE TRANSPORT vans use `mkVan`; they use the new van, turned round. (`mkVan` lives in a later script, so the call site is patched rather than the function.)
- **Monster truck:** collision width 3.9 m. Wheels and tank tracks roll by their own tyre size; the tracks only move within 80 m of you.
- Still to check in the real game: the cab interior while driving, and the flat-tyre squash.

## 2026-10-16 · r610: police (dx608)
- Built parts 1-3. AI cars also don't damage each other on bumps; a damaged AI car repairs itself with no player within 100 m; every AI car that blows up is logged (F8) with the reason. AI cars that fall into Devil's Gorge wreck at the bottom.
- The speed checkpoint stands on the far shoulder facing oncoming traffic, because the model's layout (road on its -x, board facing -z) puts it there with right-hand traffic. Its centre is 5.4 m from the road's centre line so the cones line the road edge. The model itself is unchanged. Sites: main road south of town (0, -1340), east of the airfield (560, -1250), road past Dusty Gulch (300, -1420), speedway road (330, -1900).
- Each cone knocked over is 3 heat. Near an active checkpoint the old "faster than 30 m/s past the Highway Patrol" rule waits, so the board's fine/chase split is exact. Pack-up: gone when nobody is within 60 m, or after 30 s at the latest.
- Patrol beats: town (0, -960 → bus stop → Desert PD road → x 205 north → -1120 west), airfield/Gulch (airfield road, x 560, Dusty Gulch main street), quarry side (x -440, z -1420, quarry dirt road z -1550).
- Question: should wrecking a patrol car bring the backup units out sooner?

## 2026-10-16 · r609: uplink (dx606), water delivery (dx607), autopilot modes (dx604)
- **uplink.md**: built as specced. The console follows locked / ready / charging (live countdown) / aim / fire. In co-op a friend's strike makes your console fire and count down 300 s too. The prompt is at (447.5, -692.2).
- **water-delivery.md**, changes from the spec:
  1. Every spot uses `mkWaterTank`, including both water towers (beside the legs): Water tower (58, -1052.5) facing north, Gulch (538.5, -1500) facing east, Oasis (-38, -1019.5) north of the pool, Mining shack (-15, -1049.5) by its north wall, Campfire (12, -1100).
  2. The truck can't be parked exactly: the shared driver arrives 10 m from its goal, so trucks aim 6 m in front of the tank and stop roughly 8–15 m out, usually nose first.
  3. "take" reaches at chest height and he can't crouch, so cans glide up from the ground into his hands. A crouch / pick-up pose would look better; worth a design pass?
  4. No other job uses `item:'can'` (fuel uses drums), so the olive can isn't used yet.
  5. The job lasts as long as the pouring, about 40–47 s.
  6. The 'watch' pose's head sweep is replaced by real head tracking; he turns his body when you walk round him.
  Groundskeeper [E] lines: the three from the spec plus "Six cans a truck. I count them. Twice.", "The sand drinks too. Slower than me.", "Don't tap the glass."
- **Autopilot modes** (the user's request, no spec): L cycles. Wraith: home → your map pin → off. Plane and jets: nearest airstrip (airfield runway 13 or Fort Blackout runway 09) → fly to your pin and land there (with a go-around if too high) → land straight ahead → off. Helicopters: home pad → your pin, then straight down → straight down here → off. "Your pin" = the main pin from `wpList`; with no pin that mode is skipped. There is no free click-to-set waypoint on the map yet (clicking warps); a spec for one would fit here.

## 2026-10-16 · r608: main menu and How to play (dx605)
- Locker tabs Customize/Skins and Stats tabs Badges/Journal open their existing full-screen editors (↗ on the tab) instead of rendering inside the card: they're too big for a card, and this keeps everything within two clicks. The Locker always opens on Shop; with no gold it says where gold comes from.
- The ⓘ secrets button top-left clashed with the profile chip, so it's now "🤫 Secrets" in More.
- The Owner panel entry keeps the old staff-rank check (admins and mods use the same panel); non-owners see "🛡️ Staff panel". No key in the page.
- How to play: the desert map has no click-to-set waypoint (clicking a place warps you there), so the text says that. Hotbar tooltips don't exist, so "Point at any item in your hotbar…" was dropped as the spec allowed. Maybe a future spec for item tooltips?
- Dating mode is off the menu. Its 3 badges are hidden unless already earned (badge total 194 for new players).
- The four small buttons span 580 px (wider than the 420 px big buttons) so "How to play" fits on one line; 2 × 2 under 520 px.
- The same four-button row replaces the old button rows on the shop / "you died" screens.

## 2026-10-16 · r607
- **devils-gorge.md parts 2-3**: the "gaps" were the tunnel floor: it was built with a negative depth (`cz1 - z0 + 1` = -3), an inside-out box whose top you could see through. Fixed; floors now run 0.3 m under the walls, the tunnel floor goes 1 m into the riverbed (1 cm lower), and a 0.6 m rock slab (top -30.02) sits under the whole cave. The chamber ceiling is four boxes round a 3.8 m hole. `mkGorgeLift` is in as you wrote it (dx603), at `GCV.lx, GCV.lz`, `rotation.y = PI`, with your collision boxes. The ride follows your steps (shut 0.6 s, 7 s up, hatch over 1 s above -4 m, step out 2.6 m to +z, 3 s, back down 7 s, hatch shuts below -3 m). The hatch area is a 0.12 m floor plate. **Not synced in co-op**: each player's game runs its own cage (the old lift wasn't synced either); say if you want a shared one.
- **speedway-and-stunt-jump.md part 3**: booster and landing ramps in as written. The launch numbers work as you said: 3.8 s in the air, 36.3 m peak, lands at z -1620.6 on the landing ramp, no damage, 30 m/s after (−25 %). Changes:
  - The landing ramp's `q.ramps` entries had negative `H`. `vehGround` takes `min(y, ramp)` for those, which is 0 for a ramp above the ground, so I wrote the same profile as two ramps rising towards +z (`dir:1`).
  - `q.obs` boxes have no height, so I added an optional `top` (a car above it drives over). The side rails and the landing ramp's back wall use it. The box "under the kicker" blocked cars driving up the kicker, and isn't needed (the ground code already stops a car stepping up more than 0.6 m), so it's left out.
  - During the boosted flight the car ignores ground obstacles while more than 6 m up (otherwise the flat box at the mesa's far edge stopped it in mid-air).
  - Both ramps are walls in the route grid (`nolink`), never links.

## 2026-10-16 · r606
- **kmh.md**: done as specced. There were about 30 mph mentions, not 250 (live readouts, garage top speed, the bus HUD, signs, hints, jokes). The bus trip keeps its miles. 45 mph → 72 km/h, 763 mph → 1228 km/h, 85 mph → 137 km/h.
- **base-map.md**: done at runtime rather than by adding rectangles where each building is built: wall boxes that touch are grouped into one building, filled by size (over 500 m² `#5a5e64`, under 30 m² `#7a6a4a`, the rest `#6a6a52`), walls `#3a3a36` drawn 1 px wider. Groups already drawn by an existing `q.mapR` shape are skipped. The map is redrawn when the number of base obstacles changes. Names at zoom ≥ 2: Hangar 1, HQ, Command wing, Wraith bays, Motor pool, Tank park, Launch control, Main gate. **No barracks, mess hall or silo labels:** I could not find where those are at Fort Blackout (the "BARRACKS"/"MESS HALL" signs in the code are at Dark Zone 51 and the penitentiary). Give coordinates if you want them.
- **mining-shack.md**: moved **west** of the road, not east. East of the road there is already a detour road loop (x 9.5 … 16.5) and the Town phone booth. The shack is centred at x -17 (door wall 6.5 m from the road edge), turned so the door faces the road (east), with a short dirt path. Everything (walls, cage, shaft, props, obstacles, map shape, place marker, walk-in, cage and step-out positions) uses `SHKP` and `shW()` in dx602. E prompt and first-time hint as specced. The bus stop and BUS 13 did not move.
- **devils-gorge.md, part 1 (falling)**: on foot: you keep your speed (capped at 11 m/s), no roll, you stay 0.8 m inside the walls while falling, land where you fall. By car: it falls all the way, is wrecked at the bottom, you are thrown out down there; the wreck stays until you leave the gorge. Police cars that follow you in still vanish with their line (not changed yet). The lift no longer goes down (the prop says "LIFT GOES UP ONLY · NO RIDES DOWN"). The new lift model, the shaft and the cave floor are next.
- **speedway-and-stunt-jump.md, parts 1 and 2**: there were no stray boxes: every obstacle at the Speedway had a mesh. The tyre walls were the invisible ones: an InstancedMesh, which three.js r128 culls by its single-tyre bounding sphere at the group origin, and which the scenery chunks filed under the chunk at the map origin. Fixed for every instanced mesh in the desert (a few other ones were affected too). Dragster: front wheels 0.3 m, centre y 0.3, on a new front axle with two struts to the nose. The booster jump is next.
- **police.md**: so far only "no random explosions": AI cars (police, traffic, crime cars) take no damage from their own bumps into scenery. Your rams and shots still count.

Claude Code: add notes here, newest at the top, like:

## 2026-10-16 · r603
- What was built from which spec, and anything that differs from it.
- Questions for the design chat.
