Status: proposed

# AI driving: squads and the Wraith autopilot

## The problem (what the player sees)

- Squad vehicles and the Wraith autopilot drive in circles, always turning the same way.
- They hit a wall, reverse a little, then drive straight back into the same wall.
- They take wide turns, so they can't get through gates, between buildings or into bays.
- Squads sent to **Lookout Mesa** (and anything else on a raised plate) never get onto the top. They stop at the
  foot of the cliff and push against it.

## What it should look like

AI drivers should drive like a careful person:

1. They follow a planned route (a line of points), looking a little way ahead, not straight at the final goal.
2. They slow down **before** a corner, not in it. Tight corners are taken slowly, open road is taken fast.
3. If a corner is too tight for the turning circle, they do a **three-point turn** (reverse with the wheel turned the
   other way, then go forward again). The Wraith (tank steering) just **turns on the spot** instead.
4. When they get stuck, they back off **away** from what they hit, then plan a fresh route from where they now are.
   They never ram the same wall twice in a row.
5. They drive **up the mesa ramp** onto the top when the job is up there.

## Why it goes wrong now (from reading the code)

These are the causes I found. Claude Code: check them, they may not be all of it.

- **Mesa tops are unreachable to the route planner.** `navBuild` blocks every cell of any plate with `|y|>2`
  (`q.plates`), so the mesa top is solid. The mesa road is an **x-axis** ramp (`ax:'x'`, in `xpMesa`), but the
  ramp-link code in `navBuild` only handles z-axis ramps (it uses `r.z0`, `r.dir*r.len` along z and `cx` from `x0/x1`),
  and those links are for jump ramps (launch and land past the end). So no route can ever reach the top, and
  `navReach` snaps the target to the nearest cell at the bottom of the cliff.
- **Turning circle is ignored.** `cwDrive` only slows to throttle `.35` when the heading error is over 1.1 rad.
  At speed the car can't make the turn, overshoots, and loops around the point (the "circling").
  The Wraith autopilot does the same with `fx=.35` when `|dh|>1.0`.
- **Stuck recovery points the wrong way, and the two drivers disagree.** `cwDrive` reverses with steer `sign(dh)`,
  `wkAPTick` reverses with `-sign(dh)`. When the target is roughly behind, `dh` flips between `+π` and `-π`, so the
  sign is close to random, and the chosen side is often the one that swings the nose back into the wall.
  After reversing, squads keep the same path (`stuckN` only re-plans after 2 hits), so they hit the same wall.
- **The Wraith has tank steering** (`VEHK.proto.tank=1`): in `vehPhys`, a tank turns on the spot when `fx=0`.
  The autopilot never uses that. It always creeps forward at `.35` while turning, so its turns are wide too.
- **Followers aim 8 m behind the vehicle ahead** with `cwDrive(..., dist 3.5)`, which skips the route planner
  (`dist!==0` goes straight to the old code). In tight spaces followers cut corners into walls.
- **"Nobody watching" teleport.** When the player is more than 160 m away and the lead is stuck, `cwTick` slides the
  whole convoy up to 25 m towards the waypoint, which can put it inside a building. Keep the idea (it saves jams no one
  sees), but only move to a free nav cell along the planned path, never through a wall.

## The design

### 1. One shared driver for all AI vehicles

Make one function, for example `aiDrive(q, v, D, dt, opt)`, used by the squads (lead and followers) and the Wraith
autopilot. `D` is that driver's memory (path, index, stuck timers). Police and NPC traffic can keep their own code.
Keep `vehPhys` as it is. Only change what throttle and steering the AI feeds it.

### 2. Path following (pure pursuit)

- Follow the planned path, aiming at a point **ahead along the path**, not at the next corner:
  look-ahead distance `L = clamp(4 + 0.35 × speed, 5, 14)` metres, measured along the path.
- Keep the existing `navSteer` behaviour for ramp run-ups: never skip a `'ramp'` point, and drive straight and fast
  from `'ramp'` to `'land'`.
- Inside Fort Blackout keep using `bgPath` (the 2 m base grid). Outside, `navReq`/`navSteer` (the desert grid).
- Re-plan when: the goal moved more than 3 m, after every stuck recovery (see 4), and if the vehicle is more than
  8 m off its path.

### 3. Speed for corners

- Look at the path up to 25 m ahead and find the sharpest bend (angle between path segments).
- Target speed for that bend: `vTurn = clamp(K.turn × R_min, 3, max)`, where `R_min` is the radius the bend needs.
  Simple version that works fine: bend under 0.4 rad → full speed; 0.4–1.2 rad → 12 m/s; over 1.2 rad → 6 m/s.
- Brake (`fx=-1`) if faster than the target speed for the coming bend; otherwise use throttle as normal.
- Final approach to a parking spot or bay: max 5 m/s for the last 10 m, stop within 2.5 m.

### 4. Tight turns and stuck recovery

**Wheeled vehicles** (jeep, truck, APC, SWAT):
- If the aim point is more than 100° off the nose and closer than 12 m: **three-point turn**. Stop, reverse up to
  1.6 s with the wheel turned **towards the side the target is NOT on** (so the nose swings towards the target),
  then drive forward. Pick the side once, at the start of the manoeuvre, from the sign of the lateral offset of the
  target (`lat = rx×(-fz) + rz×fx`), not from `dh`. Keep that side for the whole manoeuvre.
- **Stuck** = throttle on and speed under 0.5 m/s for 1.0 s, or a collision (`v.v` flipped by the bounce in `vehPhys`).
  Then:
  1. Reverse for 1.2 s, steering so the nose swings **away from the side that hit**. Work out the side from where the
     blocking box is (`v.hitO` if it is an obstacle, else probe 2 m ahead-left and ahead-right with `vehOK`).
  2. Stop. Re-plan from here (always, not only after 2 hits). Mark the cell in front as blocked for this driver for
     10 s so the new route goes around it.
  3. If stuck 4 times within 20 s at roughly the same spot (within 6 m), give up on that point: skip ahead to the next
     path point that is in line of sight, or, for squads with no player within 160 m, use the safe hop below.

**The Wraith** (tank steering, `K.tank`):
- If the aim point is more than 45° off the nose: throttle `0` and full steer, so it **turns on the spot**, then go.
- Stuck: reverse straight back 1 s, turn on the spot to face the new route, re-plan.

### 5. Followers

- Followers use the **same path as the lead**, offset back along it: follower *i* aims at the point on the lead's
  path that is `9 × i` metres behind the lead. Same look-ahead, same corner speeds, same stuck logic.
- If a follower is more than 40 m behind, it gets its own route to the lead's current point.
- Stop if the vehicle ahead is closer than 6 m (no rear-ending in queues at gates).

### 6. Mesa tops and other raised plates

- In `navBuild`, a plate with `y>2` that a **drive-up ramp** touches is not solid. Treat it as open ground, and block
  only its edges (a 1-cell border), except where the ramp's top end meets the plate.
- A drive-up ramp is one in `q.ramps` whose high end (`y0 + H`) is within 0.5 m of a plate's `y` and whose high end
  sits on that plate's edge. Handle `ax:'x'` and `ax:'z'` ramps.
- The ramp itself: its cells are open along its length, and its long sides are blocked (so routes don't drive off
  the side of it). Its low end joins the ground.
- Jump ramps (the existing `links`) stay as they are.
- `navReach` then reaches the mesa top from the road, and squads drive up the ramp like a player would.
- Pits (plates with `y<-2`, like the quarry) work the same way if they have a ramp down.

### 7. The "nobody watching" hop (squads only)

Keep it, but safe: only when no player is within 160 m and the lead has been stuck 3+ times. Move the whole convoy
to the path point 20–30 m further on (never off the path), each vehicle on a free nav cell, facing along the path.

## What to avoid

- Don't add a new grid or path-finder. Use `navBuild`/`navJob`/`navSteer` and `bgPath`.
- Don't change `vehPhys` or how the player drives.
- Don't let AI vehicles teleport through walls or into buildings.
- Don't make the path search run all at once on one frame for long routes (keep `navWork` time-slicing).
- Police chase driving is out of scope. Don't break it (it shares `navBuild`, so test one chase start).

## How to check it (short)

1. **Mesa:** send a squad to "Lookout Mesa". It should drive up the ramp road and park on top.
2. **Base gate:** send a squad out and watch it leave the motor pool and get through the restricted-zone gate
   without hitting the gate posts. Followers stay in a line.
3. **Wraith autopilot:** park the Wraith facing a wall near the airfield hangar and press L. It should turn on the
   spot, drive home, and park in your bay with no wall hits.
4. **Stuck test:** drive a truck into the path of a squad and leave it there. The squad should back off away from it,
   drive around it, and carry on. No circling.
5. A headless check is fine for 1–3: log the number of collisions and stuck events per trip. Should be 0–2, not dozens.
   Don't run long live tests.
