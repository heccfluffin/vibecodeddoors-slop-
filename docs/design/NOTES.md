# Notes for the design chat

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
