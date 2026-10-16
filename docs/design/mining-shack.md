Status: proposed

# Mining shack: off the road, and E to go in

## Now

- The DOORS BUT DESERT MINING Co. shack sits right on the main road: it's centred on **x = 0** (16 m wide, x -8 … 8,
  z -1069 … -1055, `SZ = -1062`, built near "the walk: to the shack door" in `bak519.html`, obstacles at the
  `{const SZ=-1062,D=14,W=16;ob(...)` block). Cars have to drive round it.
- Walking into the doorway (`|P.x| < 1.4` near `zF = sh.SZ + sh.D/2`) starts the walk-in cutscene by itself
  (`busRoamEnd(q,false)` in the roam update). People trigger it by accident while walking past.

## Should be

### Move it to the side of the road
- Move the whole shack (building, rails, cage elevator, shaft, props, obstacles, map rectangle, the "MINING Co.
  SHACK →" sign) **east of the road**, so its nearest wall is at least **4 m from the road's edge**. Keep its z.
  Keep the door facing the road (the door is on the +z side now; turn the shack so the door faces west, towards
  the road, with a short dirt path from the road to the door).
- Use the road rectangle in `q.mapR` (colour `#4a4440`) to find the edge. Don't overlap El Goblino's gas station,
  the bus stop or the BUS 13 drop-off.
- Every hard-coded `x = 0` in the walk-in, cage and leave code must use the shack's new position instead
  (`P.x = 0`, `Math.abs(P.x) < 1.4`, `cageLeave` putting you at `P.x = 0`, the cage at `x = 0`). Add one
  `sh.X` (and turn, `sh.R`) and use it everywhere.
- The mine below (the shaft, the cage, the mine levels) can stay where it is underground if that's simpler: the
  cutscene goes down in the dark, so nobody can see that the shaft moved sideways. Only the surface part must move.
- Check the co-op cage (`cageOthers`, `vehNet {k:'cage'}`) still waits for everyone and that dx580's public-desert
  drop-off ("BUS 13 drops you at the mining shack") still lands you outside, not inside a wall.
- Squad jobs to "Mining shack" (water, aid post in dx571) use the new spot.

### E to go in
- Walking into the doorway no longer starts anything.
- In the doorway (same area as now, at the new position), the prompt says:
  **"[E] Go down the mine"** (or, in co-op with others still out in the desert: "[E] Go down the mine (the cage waits
  for everyone)").
- Press E: the walk-in cutscene starts exactly as now (walk to the door, inside, onto the cage).
- No prompt while in a vehicle, falling, or under arrest.
- A first-time hint when you first reach the door: "⛏️ Press E to go down the mine. You can come back up any time."
- Update the arrival hint text that says "Walk into the SHACK when you are ready" to "Press E at the SHACK door when
  you are ready".

## What to avoid
- No invisible boxes left on the road where the shack used to be.
- Nothing floating or sunk at the new spot (the ground there is flat sand, y = 0).
- Don't change the mine itself.

## How to check it (short)
1. Drive straight down the main road past the shack: nothing in the way.
2. Walk through the doorway without pressing anything: nothing happens. Press E: the cutscene starts.
3. Come back up: you stand outside the new door, facing the road.
