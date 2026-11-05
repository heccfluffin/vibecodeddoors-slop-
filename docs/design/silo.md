Status: part 1 (the way out) ready to build 2026-11-05 · part 2 (the new look) plan for review

# Silo 1: getting out again, and a new look

Silo 1 is at Fort Blackout, centre (578, -700). You go down from the launch control bunker (x 495..560, z -716..-686)
in the freight elevator at its east end (rank Lieutenant Colonel and up). Everything underground is in `src/dx579.js`
lines 72-122 (`SILO`, `siloOK`, `siloBuild`, `siloRide`, `siloTick`); the outside is `fbSilo` (dx614). It's the only
silo you can walk into (the ICBM in the ending is a cutscene).

## Part 1: the way out (a bug fix, no models; build this first)
**What goes wrong.** Down there, where you can walk is three rectangles plus the catwalk ring (`siloOK`), and each
rectangle is shrunk by 0.35 m on **all four sides**, including the sides where it meets the next one:
- elevator (x 553.6..559.6) and tunnel (x 559.6..580) leave a strip x 559.25..559.95 you can't stand in;
- tunnel (z -693.4..-688.8) and the connector to the shaft (z -694.9..-693.2) leave a strip z -693.55..-693.05.

You move at most 0.25 m a step, so you can't get across either strip. The elevator drops you in the tunnel (x 560.8),
so you're stuck in a 20 m corridor: the "Ride the elevator up" prompt is 3.4 m away, behind the first strip, and the
shaft is behind the second. Map warp is refused while you're underground, and the rescue (`deepWatch`) doesn't fire
because where you stand is valid. Only a launch from launch control (a co-op friend) pulls you out.

**The fix:**
1. **One walkable outline, not shrunk where pieces meet.** Make the pieces overlap by 1 m where they join (elevator
   x to 560.6, tunnel from x 558.6; connector up to z -692.4), or test the union with the 0.35 m margin only on its
   outer edges. Check with a flood fill from the arrival point that the elevator, the tunnel, the connector and the
   catwalk ring are all one area.
2. **Arrive inside the elevator cage** (its centre), not in the tunnel, so the way up is the first thing you see.
3. **The "Ride the elevator up" prompt** stays at the cage, radius 2.2, and also shows from the tunnel mouth (a second
   prop at x 561, same action).
4. **A safety net:** if you're ever at `q.deep === 4` and can't reach the cage (say a future change breaks the outline
   again), the pause menu gets **Climb out of the silo** (it runs the ride up). And map warp from the silo is allowed
   (it ends the ride and sets `q.deep = 0` first), since nothing down there needs you to stay.
5. **Test:** ride down, walk to the shaft, walk round the catwalk, read the tag, walk back, ride up; and ride up straight
   away from the arrival point. In co-op, two players down at once.

Changelog (players): "Fixed: you can get back out of Silo 1 again."

## Part 2: the new look (plan; models come after you approve this)
**What's there now:** plain boxes for the tunnel, three pipes, strip lights; the shaft is two open cylinders seen from
inside, glowing balls for lights, a flat disc for the floor, a ring for the catwalk and the missile model. The shaft
(radius 6) doesn't match the tube you see from the surface (radius 4.6), and its top pokes 0.3 m above the collar.

**The plan (same rooms, same walkable outline as part 1, same missile and launch sequence):**
1. **The freight elevator:** a proper cage lift: a steel deck with diamond plate and yellow-black edges, a folding gate,
   a control box with UP/DOWN, a light in the cage roof, the shaft walls in ribbed concrete with the counterweight
   rails, a warning lamp that turns while it moves.
2. **The tunnel to the shaft:** a curved-roof concrete tunnel with cable trays and bundled cables along the walls, three
   coloured pipes with valves and stencilled labels, caged lights every 4 m, a blast door halfway (open, 0.6 m thick,
   on its hinge, with a wheel), floor grating over a drain channel, and signs (SILO 1, NO SMOKING, OXIDIZER).
3. **The shaft:** matched to the surface tube (radius 4.6 inside; the catwalk ring and walkable ring shrink with it),
   ribbed concrete lining with steel rings every 3 m, the missile's guide rails, cable runs, real lamps in cages
   (a few point lights, the rest glow), the launch tube's floor with the flame deflector and a drain grate, and a red
   strobe that runs during a countdown. The top meets the underside of the collar and the lid.
4. **The catwalk:** steel grating (you can see down through it) on brackets, a proper railing, a short bridge to the
   connector, the maintenance tag on its clipboard, and an umbilical arm reaching from the catwalk to the missile that
   swings away at launch.
5. **The missile on its cradle:** the existing model, standing on a cradle with clamps that open at launch.
6. **From the surface:** the open lid shows the real shaft below (no black disc), with the missile's nose visible when
   it's loaded.

Model batches once this is OK: (1) elevator and tunnel, (2) shaft, catwalk and cradle, (3) the surface tie-in.
