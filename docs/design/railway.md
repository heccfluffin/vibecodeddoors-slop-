Status: plan approved 2026-11-05 · models: batch 1 (the coach) approved 2026-11-05, batch 2 (the stations) for review (shown on the desert road plan map, change 12)

# The railway: four stations, both ways, and a train you can ride

The user: "could we get the railway having multiple stations?"

## How it is now
The line runs straight along z -1640 across the desert (x -720..+640), with level crossings at x 0, -440 and 560
(`RRX`). The train (dx631 models: locomotive 12 m, tender 7 m, six freight wagons 11 m each, about 88 m long) is not a
vehicle: `xpTrainTick` (bak519) moves it east at 19 m/s from x -720, stops it once at Dusty Gulch (head at x 482) for
12 s, runs it off the east edge, waits 26 s and starts again from the west. Co-op keeps it in step with the `trn`
message (lowest player id sends). You can't get on it.

## The plan
**Four stations, platforms on the north side of the track** (like Dusty Gulch's: z -1638.4..-1629.4, 0.6 m high):

| Station | Platform x | Train's head when stopped (eastbound) | Access |
|---|---|---|---|
| Lookout Mesa | -360..-300 | -305 | dirt track from Coyote Rd along z -1622 |
| Quarry & Gorge | -190..-130 | -135 | dirt track from Route 13 along z -1622; a viewing bench at the platform's west end looks across the tracks into the gorge |
| Mirage Lake | 220..280 | 275 | new dirt track from Gulch Rd at x 320, down the lake's east side (outside its 58 m shore) |
| Dusty Gulch | 400..540 (as now) | 482 (as now) | the station track (as now) |

A stopped train (head minus 88 m to head) stays at least 45 m clear of every level crossing, so stopping never leaves a
gate down across a road.

**Both ways:** the train alternates eastbound and westbound runs. Westbound the whole train is turned round (models
rotated 180 degrees, cars placed on the other side of the head) and its stopping points are mirrored so the coach still
lines up with each platform. It stops at every station for 15 s each way, then whistles and pulls away. Between runs it
waits off the map as now. The `trn` co-op message gains the direction.

**A passenger coach** behind the tender (a new model in the dx631 style: green and cream, open end platforms with
railings, sixteen bench seats in facing pairs, windows, lamps, DOORS BUT DESERT RAILWAY on the side).
- Standing on a platform while the train is stopped: `[E] Board the train (to <next station>)`. You take a seat
  (like the bus: you can look around, the camera stays in the coach).
- At the next stop: `[E] Get off at <station>` puts you on that platform. Stay on to ride further. At the end of a run
  you're put off at the last station ("End of the line").
- Free to ride. A small badge for riding the whole line one way.
- In co-op each player rides on their own; the train is already shared.
- You can't board while wanted by the police (the conductor won't have it), and the coach shrugs off the train's usual
  "the train does not stop" collision for you while you're on board.

**Each platform gets:** a station sign with its name, a bench and a lamp, a shelter with a departure board ("NEXT TRAIN ·
EASTBOUND · 1:20", counting down from the train's real position), a timetable poster, a bin. Dusty Gulch keeps its
station house and gets the board.

**The map:** stations get a railway icon and their names; the full map shows the next train's direction.

## Has to move with it (for Claude Code)
`xpTrainTick` (bak519 3921) and its dx631 wrapper (wheels, smoke): the single Gulch stop becomes a list of stops per
direction; the crossings logic already works from the head and length, so it needs the direction too. The station
tracks join the road plan (`desert-roads.md`), so they are built with it.

## Models (after the plan is approved)
`models/railway.js` (needs `fort-kit.js`, `airfield.js`, `lake.js`).

### Batch 1: the passenger coach, approved 2026-11-05 · `rrCoach()`
A 14 m wooden coach in the train's style: dark green with a cream window band and gold lining, DOORS BUT DESERT RAILWAY
on the letterboard, No 1 on the side, a clerestory roof with little windows, drip rails, truss rods underneath, two
bogies and couplers like the wagons. Open end platforms with brass railings (a gap in the middle to step across to the
next car), grab rails and three steps down each corner, kept inside the loading gauge (a platform's edge is 1.6 m from
the track's middle). Inside: plank floor, eight bays of facing benches either side of the aisle (sixteen seats), brass
luggage racks, three hanging oil lamps, open end doors.

**Wiring (Claude Code):** add it to the train in dx631's car list right after the tender: `car(14, rrCoach())` (the
same car() spacing, wheels via `userData.spin`). `userData.seats` gives sixteen sitting spots (car space, yaw `ry`) for
riders, `userData.doors` the four step-down points (a player getting off goes to the nearest one on the platform side,
+z), `userData.lamp` where to hang a point light while someone rides (borrow one of the pool lights, don't add one).
Westbound the whole train is turned round, so seats and doors turn with it. The coach is about 14 m more train:
update the stopping points in railway.md's table by 14 m if the coach goes anywhere other than behind the tender (it
was planned there; the table assumes it).

### Batch 2: the stations, for review · `RRSTN`, `rrStation(g, st)`, `rrBoard()`
Each new halt is a 60 m platform on the north side of the track (0.6 m high, its edge 1.6 m from the track's middle,
6 m deep, like Dusty Gulch's): concrete with a yellow edge strip and a white line, a 6 m ramp down at the road end
(with a handrail on the track side), a railing along the back. On it: a timber shelter with an open front, a tin roof
sloping back, a bench and a timetable poster; the departure board on two posts in the middle; a station sign at each
end (name on both sides); two lamps; a bench and a bin on the open platform; a gravel patch at the ramp's foot where the
station track ends. Quarry & Gorge also gets a viewing bench at its west end facing the gorge, with a small sign
("DEVIL'S GORGE · 70 m DOWN").

**Wiring (Claude Code):**
- `RRSTN` holds the three new halts (name, platform x0..x1, `road` = the end the track comes in at, `view`). Build each
  with `rrStation(q.g, st)` in dx631's railway build (desert-local coordinates, z from lake.js's `RRZ`). It returns
  `{board, obs, props, lamps, g}`: push `obs` into `q.obs`; `props` are the press-E spots (`what:'board'` = read the
  times; `what:'wait'` = the boarding spot along the platform, where "[E] Board the train" shows while the train is
  stopped there); `lamps` are lantern positions: light the nearest two from the existing pool at night, don't add lights.
  The platform top (y 0.6) and the ramp must be walkable (add them like Dusty Gulch's platform); the ramp is 4.8 m wide
  at z RRZ+2.8..RRZ+7.6 beside the slab's road end.
- `board.userData.set(dir, mins, secs)` redraws the board: `dir` 'EASTBOUND' or 'WESTBOUND' from the train's real
  position and speed (time until its coach stops here), or `''` for none due ("NONE DUE --:--"). Redraw at most once
  a second, only when a player is within ~60 m.
- Dusty Gulch gets one `rrBoard()` too, beside its station house facing the track (`rotation.y = PI`: as built the
  board looks +z).
- The station tracks are in the road plan (`desert-roads.md`); the gravel patch sits where each one ends.
- Everything is `noSeam`; nothing moves, so the batching may take it all except the board (`dpKeep` on the board's face
  mesh, its texture changes).

Preview: the three halts on one stretch of track, the train stopped at Quarry & Gorge, a fake countdown on the boards
and a night switch (the lamps lit). The dark band south of Quarry & Gorge is a stand-in for the gorge.
