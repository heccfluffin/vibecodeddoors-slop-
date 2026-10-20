Status: proposed (plan, part 1) · 2026-10-20

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
