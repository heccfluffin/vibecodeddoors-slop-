# Notes for the design chat

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
