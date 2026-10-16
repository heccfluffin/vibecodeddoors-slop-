# Notes for the design chat

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
