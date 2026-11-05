Status: plan approved 2026-11-05 (models after the roads) (shown on the desert road plan map, change 12)

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
railings, eight bench seats, windows, lamps, DOORS BUT DESERT RAILWAY on the side).
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
Batch 1: the passenger coach (outside and in). Batch 2: the platform kit (platform, shelter, departure board, sign,
bench, lamp, bin) and the three new stations put together.
