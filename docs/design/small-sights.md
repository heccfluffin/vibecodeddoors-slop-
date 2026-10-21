Status: plan approved 2026-10-20 · batch 1 for review

# The small sights

Seven small places round Route 13: Jeff's Oasis, Skull Rock, the meteor crater, the radio mast, the campfire, the
wishing well and the wind pump. They are built in up to three layers of the base game (`busRoamBuild`,
`desertLocs`/`pyrBuild`, and the `xpMoreTown` extras); none has its own builder. Coordinates are desert-local, +z is
north. New globals start with `ss`.

**Every sight stays where it is**, keeps its `q.locs` name (squad jobs, water delivery, crimes and the map look them
up), its props and what they do, its saved progress (`SV.met`, `SV.skEye`, `SV.wellD/N`) and its co-op messages
(pump, marsh, riff, bats). The remodel is the look, plus the small bugs listed under each.

## What's wrong now, and the plan for each
1. **Jeff's Oasis** (-38, -1030). Now: a perfect blue disc with a **square** invisible wall round it, six identical
   palms in a ring, a sign and a tip crate. The "Dip your feet" spot is inside the wall and gets nudged.
   Plan: a natural pond (irregular outline, a shelving sandy bank you can stand on, deeper middle, reeds and flat
   rocks at the edge), palms of different heights and leans with drooping fronds and coconuts, Jeff's tip stand (a
   little wooden counter, the jar, "PLEASE TIP · JEFF"), an empty hammock between two palms ("Jeff is not here"
   gets a place to be not in). The wall follows the water's edge instead of a square; the dip prop sits on the bank.
   The water-delivery tank and groundskeeper stay.
2. **Skull Rock** (76, -960, facing north). Now: a skull of spheres and boxes; the text says you can climb into the
   mouth but the mouth is solid. Plan: one sculpted, weathered sandstone skull (cracks, wind-worn brow, sand drifted
   against the jaw), and **a walk-in mouth**: a small hollow 2.5 m deep behind the teeth with a gap you can step
   through. The shout prop moves just inside it, so the echo and bats come from in there. A rock step under the left
   eye so "Reach into the eye socket" looks reachable.
3. **Meteor crater** (140, -970). Now: a torus rim, a flat disc and a green rock. Plan: a proper crater (raised,
   broken rim, a bowl that slopes down 1.5 m, scorched glassy floor, thrown-out rocks round it), the glowing meteorite
   half buried and cracked with green crystal showing, and the five fragments as small glowing green stones (they
   are props already but have no model of their own). Note for Claude Code: collecting all five gives the observatory
   badge `stars`; it should be its own badge or none.
4. **Radio mast** (-62, -905). Now: a three-leg lattice with no ladder (the climb text mentions one), a box hut whose
   door faces away from town. Plan: a proper lattice mast with a caged ladder up to the 16 m platform, aerials and a
   dish at the top, a blinking beacon, guy wires to three concrete anchors; the hut gets a gable roof, a door facing
   south (towards town; the inside and the radio prop stay), a KDRT sign, a little generator and a fuel drum.
5. **Campfire** (18, -1105). Now: a ring of six stones, a tent of two panels, one bench without collision. Plan: a
   proper fire ring with charred logs and embers, a ridge tent with guy ropes and pegs, two log benches (both solid),
   the guitar, a cooler, a kettle on a stone, string lights between two poles. Props stay.
6. **Wishing well** (-22, -1095). Now: a stone drum, two posts, a roof slab, a rod; the bucket prop has no bucket.
   Plan: a stone well with a shingled roof, a windlass with crank and rope, **a bucket on the rope** (it goes down and
   comes back up when you wind it), coins glinting in the water, a little sign "WISHES 10 🪙".
7. **Wind pump** (-55, -1000). Now: a four-leg tower with a wheel, a trough; the "Turn the pump wheel" spot is
   inside the tower's wall, and its creak is heard all over the desert. Plan: a classic farm windmill (four-leg steel
   tower with a ladder and a platform under the wheel, an 18-blade wheel, a tail vane painted "OLD TOWN"), a pump
   jack, a round steel stock tank (the trough), the crank moved outside the tower. The creak only plays near it.

## Fixes for all seven
- No random bus-ride cactus or rock lands on any of them (keep-out circles, see route-13.md).
- Each gets a `q.mapR` shape (the oasis and crater circles are drawn by hand in `dmapBg` today; desert-map.md moves
  them to `q.mapR`).
- The props that `xpMoreTown` finds by exact position (Skull Rock's shout, the crater rock) or by geometry (the wind
  pump trough) must still be found after the remodel: give them names or keep a handle to them.

## Model batches (part 2, after this plan is approved)
1. The oasis, the wishing well and the campfire (the three in the middle of town).
2. The wind pump and the radio mast.
3. Skull Rock and the meteor crater.

## Part 2: models (`models/small-sights.js`, needs `fort-kit.js` and `route13.js`)
Every builder takes the desert group `g` and returns its obstacles (`obs`, push them to `q.obs`), the spots for the
props (`spots`) and map shapes (`mapR`; circles `[x, z, r, colour]`, which desert-map.md draws). Palms, rocks and
reeds use a fixed seed, so they don't touch `Math.random` (the desert's seeded sequence is safe; if old code that
used `R()` is removed, burn the same number of calls, see route-13.md).

### Batch 1: the oasis, the wishing well and the campfire, approved 2026-10-21 · `ssOasis(g)`, `ssWell(g)` (+ `ssWellTick`), `ssCampfire(g)`
- **Jeff's Oasis** (`ssOasis`): replace the base pool disc, its square obstacle `ob(ox-6,ox+6,oz-6,oz+6)`, the six
  palms and their obstacles, the old sign `dsSign("JEFF'S OASIS...")`, the crate and the jar (and their obstacle).
  Keep the tip prop (same spot, `spots.tip`), the "Dip your feet" prop (now at `spots.dip`, in the shallow edge),
  the loc, the water-delivery tank and groundskeeper (north, clear of the palms).
  **The pond has real depth** (the user's ask): the desert floor gets a square hole round it, like the quarry and the
  mine shaft: add `[SSO.x-SSO.cut, SSO.x+SSO.cut, SSO.z-SSO.cut, SSO.z+SSO.cut]` (x -48…-28, z -1040…-1020) to the
  `rectCuts` list where the ground is laid in `busRoamBuild` ("the ground, in four pieces round the mouth of the mine
  shaft"). `ssOasis` fills the hole with a sculpted patch: flat at its edges (y 0, so it meets the floor with no
  step), a sandy bank that shelves down to the waterline at y -0.2, and the bed falling away to 1.5 m deep in the
  middle; vertex colours darken the sand towards the water and tint the bed. Set `SSO.sand` to a function that
  returns the desert floor's own material (the sand texture, as the ground pieces use; it gets cloned and tiled every
  10 m) before calling `ssOasis`, and give the patch the same ground treatment as the floor pieces (`dpGroundMats`)
  so the two match. The water is a see-through sheet at the waterline: pale in the shallows where you see the sand
  under it, dark blue-green where it is deep, with ripples and a pale edge line. The irregular outline is
  `SSO.r(angle)` (4.5 to 7.5 m). **The water is the obstacle** (half-metre cells inside the waterline); you stand on
  the bank, and the "Dip your feet" prop sits on the bank at the water's edge (`spots.dip`). Reed clumps (some
  cattails, the ones in the water grow from the bed), four flat rocks on the bank, a few lily pads on the water.
  Six palms of different heights (5.8 to 8.6 m) and
  leans, ringed trunks, eleven drooping fronds each and a cluster of coconuts (the hanging dead fronds were dropped: they read as brown spikes, the user's note). A striped hammock between the
  two west palms (new prop at `spots.hammock`: "[E] Lie in Jeff's hammock", a short rest and a line such as "Jeff's
  hammock. Still warm. Jeff is not here."). Jeff's tip stand where the crate was: a little counter, the jar with a
  few coins, a PLEASE TIP · JEFF board. The oasis sign on two posts by the path in from the road.
- **Wishing well** (`ssWell`): replace the base drum, the black disc, the two posts, the roof slab and the rod. Keep
  both props (toss a coin at `spots.toss`; wind up the bucket at `spots.bucket`) and the obstacle. A stone well with a
  cap ring, dark water low down with coins glinting, two posts on stone footings, a shingled gable roof, a windlass
  with the rope wound on it and a crank, and **the bucket on the rope**: while the bucket prop is busy (1.4 s), run
  `ssWellTick(W, k)` with `k` going 0 → 1 → 0 (down into the water and back up; the drum and crank turn with it).
  A small sign: WISHES 1 🪙 · REFUNDS: NEVER (the plan said 10; the coin toss costs 1, so the sign says 1).
- **Campfire** (`ssCampfire`): replace the base's six stones, three logs, the tent (two panels, back, door, obstacle),
  the first bench and the guitar meshes from `T('campfire')`, and the second bench. Keep the flame sprite and its
  light and sparks, and all three props (`spots`: warm, marshmallow, guitar), and the marshmallow stick. A ring of
  rough stones round an ash bed, five charred logs in a teepee, glowing embers (`parts.embers`: flicker their
  `emissiveIntensity` with the flame); a ridge tent on the old spot and turn with poles, a triangular doorway in the front with both flaps rolled up and tied along its edges (the first version's single flap stuck out oddly, the user's note), guy
  ropes and pegs; two log benches on stumps on the old spots, both solid now; the guitar leaning on the first
  bench; a cooler, a kettle on a flat stone, a stack of firewood; string lights on two poles (`lights`: one soft
  light). Obstacles in `obs`.
- Checked: z-fight checker clean on all three (the only hits are palm fronds touching themselves); nothing floating.
