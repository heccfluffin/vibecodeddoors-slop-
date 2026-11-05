Status: part 1 (the way out) ready to build 2026-11-05 · part 2 (the new look) plan approved 2026-11-05 · batch 1 (the lift and the tunnel) approved 2026-11-05 · batch 2 (shaft, catwalk, cradle) approved 2026-11-05 · batch 3 (the surface) for review

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

Model batches: (1) elevator and tunnel, (2) shaft, catwalk and cradle, (3) the surface tie-in.

## Part 2 models (`models/silo.js`, needs `fort-kit.js`)
Everything is built in **silo space**: one group at the shaft centre on the ground, world (578, 0, -700), not turned
(+z is north, the tunnel is north of the shaft). World = silo + (578, 0, -700). The file's header lists every builder.

### Batch 1: the lift and the tunnel, approved 2026-11-05 · `slElevator`, `slTunnel`
- **The lift is a rack-and-pinion lift** (a change from the plan's cage on cables): the bunker is only 4 m tall, so
  there's no room for a winch and cables overhead. A lattice mast stands on the shaft's north wall from the pit to the
  bunker floor, with a toothed rack; the car's drive unit (two motors, brakes, an amber beacon) sits on the car's
  north edge and its pinions climb the rack. The car: diamond-plate deck, hazard edges, side rails with mesh, folding
  gates at the west end (the bunker) and the east end (the tunnel), a control box (UP, DOWN, stop), a lamp.
  The shaft: cast concrete, a pit with two spring buffers and a ladder, depth marks every 3 m, caged lamps. At the top:
  yellow posts, a mesh screen on the south and east sides, the sign over the west side.
- **The tunnel:** arched (3.4 m to the crown), cast concrete with ribs, the floor with a drain grating along the north
  wall and yellow walkway lines, three pipes (FUEL red, AIR grey, OXIDIZER yellow) on struts with flanges, valves and
  labels, a cable tray on the south wall, caged lamps on the crown, **BLAST DOOR 1** halfway (a concrete bulkhead with
  a 2 x 2.4 m doorway; the door is 0.5 m thick, shown open against the north side, a wheel on each face, red/green lamps),
  the passage south into the shaft at the east end (3 m wide, yellow portal, SILO 1 · CATWALK), signs, an extinguisher,
  an emergency phone, the power cabinet on the end wall.

**Wiring (Claude Code):**
1. In `siloBuild` (dx579), make `const R=new THREE.Group();R.position.set(578,0,-700)` in the silo group, then
   `EL=slElevator(R)`, `TU=slTunnel(R)`. Remove the old cage posts, mesh bars, platform, sign, the boxes under the cage,
   the tunnel/connector boxes, pipes, strip lights and the SILO 1 arrow. **Keep the hole in the bunker floor** (the
   `colorWrite:false` plane over the cage) and give every mesh of the shaft, the mast, the pit and the car
   `renderOrder=-2`, like the old pieces under the cage, so the bunker floor doesn't cover them.
2. `q.silo.plat` becomes `EL.car`: `siloTick` calls `EL.setY(y)` and `EL.tick(dt, riding)` every frame. Gates: both
   shut while riding (`EL.setGates(0,0)`), the east one open at the bottom (`setGates(0,1)`), the west one at the top
   (`setGates(1,0)`).
3. **Where you can walk** (this replaces part 1's numbers; still one joined outline, overlapping 1 m where pieces meet):
   the car x 553.7..559.6, z -694.5..-688.7 (the north strip is the mast and the drive unit), the tunnel as now
   (x 559.6..580, z -693.4..-688.8), the passage x 576.5..579.5, z -695.6..-693.4. Not walkable: `TU.blockers` moved to
   world, which are the bulkhead x 569.3..570.3 except z -692.1..-690.1 (the doorway), and the open door x 570.3..572.8,
   z -690.1..-688.8. Arrive at the car's centre (556.6, -691.6).
4. **Lights: don't add new ones.** The Old Quarry mine already has a pool of 4 point lights that move to the
   nearest lamps (`UGM.lights`, dx642b, `ugmLights`; it fades them to 0 when you're not in the mine). Wrap
   `ugmLights`: while `q.deep === 4`, put the pool at the silo lamps nearest you (`TU.lamps`, the car's `EL.lamp` in
   world space, and the shaft's `SH.lamps` from batch 2) and set their intensity (about 1.1, range 11). Adding lights
   would make every lit material in the desert costlier and the game rebuild its shaders.
5. The batching must leave the car and the door alone (`dpKeep` is already set on both); everything else is still.
6. Test: ride down (the gate opens to the tunnel), walk through the blast door, to the passage, back, ride up (the gate
   opens to the bunker); look up the shaft from the car halfway; check the bunker floor doesn't hide the shaft.

### Batch 2: the shaft, the catwalk and the cradle, approved 2026-11-05 · `slShaft`, `slCatwalk`, `slCradle`
- **The shaft:** radius 4.7 (the surface tube's size; the old one was 6), cast concrete from the floor (y -20.4) up to
  the ground, steel rings every 3 m, four guide rails on the diagonals, two cable ladders, caged lamps at four heights,
  four red strobes, a yellow steel portal where the passage comes in (TUNNEL · ELEVATOR). The floor: a cone-shaped
  flame deflector under the nozzle, a ring grate round it, scorch marks, and two exhaust ducts (east and west).
- **The catwalk** at y -14: see-through steel grating from 2.25 m to the wall, on radial beams with knee braces, a
  yellow railing on the inner edge, a diamond-plate sill where the passage meets it, the maintenance tag on a clipboard
  hung on the railing facing the passage, and the **umbilical arm** on the south side: a mast with an arm out to the
  missile's plug (missile space (0, 6.1, -1.4), so the missile must stand unturned, as it does now).
- **The cradle:** the launch ring the missile stands on (top at y -18), four legs with yellow shock absorbers, cross
  bracing, and four hold-down clamps on the skirt between the fins.

**Wiring (Claude Code), on top of batch 1:**
1. In `siloBuild`: `SH=slShaft(R)`, `CWK=slCatwalk(R)`, `CRD=slCradle(R)`. Remove the old shaft cylinders, the floor disc,
   the rings, the glowing balls, the catwalk ring, the railing and the old tag. Every mesh of these three goes on
   `renderOrder=-2` like the rest of the silo, so the bunker floor and the ground never cover them.
2. **Where you can walk:** the catwalk ring is now 2.45..4.35 m from the shaft centre (was 2.45..5.5), joined to the
   passage (part 1's outline); `CWK.blockers` (the umbilical mast) moved to world is not walkable. The tag prop stays
   at (578, -696.9).
3. The tag: keep the game's own canvas if you like (`CWK.tag.material.map`), or the one drawn here.
4. **The countdown:** when `N.st` becomes `'count'`: `SH.strobe.set(true)` and swing the arm clear over 2 s
   (`CWK.umb.set(0..1)`); when the missile leaves (`'launch'`) open the clamps over 0.5 s (`CRD.set(0..1)`); back to
   idle: strobes off, `umb.set(0)`, `CRD.set(0)` once the cradle is loaded again. `SH.strobe.tick(dt)` every frame
   while you're underground.
5. **Lights:** the pool from batch 1 also takes `SH.lamps` (shaft space = silo space). Two near the catwalk and two
   near the floor look right (the preview uses those four).
6. The surface tube still ends in the black disc at ground level until batch 3.

### Batch 3: the surface, for review · `slSurface`
With the lid open you look down the real shaft: the lining lit by the sun at the top, getting darker to black 9 m
down, the rails and cable ladders, the strobes during a countdown, and the missile's black nose 1.7 m below the ground.
A steel ring joins the shaft to the collar.

**Wiring (Claude Code):**
1. `fbSilo` (dx614): leave out the black gradient tube and the black disc (`tube`, `pit`). The collar's own inner face is
   the tube's top 1.2 m.
2. **Cut the desert floor** round the shaft like the oasis and the crater (r659, `ssCuts` in busBoard0's floor cuts):
   the square x 573.2..582.8, z -704.8..-695.2. The collar (radius 7.2) covers its corners. If any Fort ground layer
   (pads, road patches) lies inside the collar, cut or move it too.
3. `SF=slSurface(R)` in `siloBuild`. `SF.shade.set(q.deep!==4)` every frame (or when q.deep changes): the shade only
   shows from the surface.
4. **Show the missile from the surface:** dx579 shows it only while you're underground (`show=q.deep===4&&...`). Make it
   `N.st=='idle'&&!(N.cool>0)` so it stands in its cradle all the time it's loaded.
5. The shaft is no longer behind the bunker floor's hole trick from above: its meshes keep `renderOrder=-2` (needed
   for the elevator view), which is harmless from the surface.
6. Test: open the lid from launch control and look down from the collar; walk round the collar with it shut; ride
   down and look up the shaft (the shade must be gone).

Once these three batches are built, part 2 is done.
