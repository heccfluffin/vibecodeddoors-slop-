Status: layout approved 2026-10-19 · batch 1 approved · batch 2 approved, its courtyard re-planned (in review) · batch 3 (cells, corridor A, cameras) next

# The Dark Penitentiary rework (remodel list #23)

Same prison, same place and size (`PENA`, `PENF`, `PENI`, `PENB` unchanged). **Every gameplay spot stays where it is**:
the walls and doors guards and cameras see through (`P0.walls`, `P0.doors`), your cell D-4 (bunk, meal slot, vent
grate), the vent maze lanes and fans, the laundry baskets, the dozing guard and his keycard, the control room switches,
the note, the workshop toolbox, the cuttable fence sections (`P0.fence`), the searchlight paths, the cameras, the guard
routes and the hiding spots (`W.hides`). Models: **`docs/design/models/pen.js`**.

## Layout (approved)
- Fences, four watchtowers (searchlights that turn to follow their light circles), a sally port at the front gate with
  the gatehouse and a barrier arm, the inner wall, Cell Block D, the workshop: all in their current places.
- New things in the yard and the courtyard, one job per side, in straight rows and columns. Checked by a script: none
  of them overlaps another, the game's things, the guard routes (z -846 and -672 outside; x -476/-404, z -734/-806
  inside), the fence (3 m kept clear inside it), the damaged sections (6 m), the inner wall (1 m) or the gate path
  (x -450..-430).

| New thing | Where |
|---|---|
| Picnic tables under a shade sail | x -530..-512, z -695..-683 |
| Pull-up bars and weights | x -500..-482, z -695..-683 |
| Bleachers | x -465..-460, z -695..-679 |
| Football pitch with goals | x -456..-424, z -697..-677 |
| Bleachers | x -420..-415, z -695..-679 |
| Handball wall | x -404..-386, z -692..-686 |
| Table tennis tables | x -376..-358, z -695..-683 |
| Greenhouse | x -526..-514, z -818..-806 |
| Inmate garden: raised beds | x -526..-514, z -797..-781 |
| Water tank on a stand | x -523..-517, z -747..-741 |
| Prison van and a fuel pump | x -368..-356, z -735..-725 |
| Bins and compost | x -368..-356, z -788..-782 |
| Tyre stacks and scrap | x -368..-356, z -822..-814 |
| Shipping container and pallets | x -526..-514, z -840..-834 |
| Line-up boxes painted on the ground | x -504..-490, z -840..-834 |
| Benches and a weights pile | x -460..-452, z -840..-834 |
| Kitchen delivery dock | x -400..-388, z -840..-834 |
| Stores row: supply cages on a pad | x -426..-416, z -822..-816 |
| Stores row: forklift and pallets | x -412..-405, z -821..-817 |
| Stores row: power box in a fenced pen | x -400..-396, z -821..-817 |
| Outdoor washing lines (laundry side) | x -400..-388, z -789..-769 |
| Yard guard booth | x -390.3..-387.7, z -719.3..-716.7 |
| Chess tables with stools | x -435..-409, z -713.5..-711.5 |
| Rest shelter with benches, by the planters | x -484..-468, z -815.3..-810.7 |

**The courtyard was re-planned on 2026-10-19.** The first plan missed the game's later yard code: `penYard` (exercise
cage, half court, picnic tables, planters, gate control booth, AC units, water tanks, light poles, benches),
`penSecure` (catwalk, PA horns, CCTV domes, the sally port, the head-count board), `penMess` (the mess hall on the
block's west side) and `penActBuild` (gym, yard and laundry activities). All of those stay where they are and are
remodelled in place. The new courtyard things above are checked against them too (and against the yard walkers' paths
at z -732 and -705, the three yard inmates, the guard loop and the gate path): nothing overlaps.

## Batches
1. The fences, the watchtowers, the front gate and gatehouse, everything outside the fence.
2. The yard and the courtyard (the table above), the inner wall, the workshop, Cell Block D's outside.
3. The eleven cells (your cell D-4), corridor A, the cameras.
4. The vent maze and the fans, the laundry.
5. The break room, the control room, the mess hall, the hiding spots.

## Notes for the wiring (batch 1: fences, towers, front gate, outside)
- `seg()` in `penBuild`: make the chain link with `penFenceMesh(g, x0, z0, x1, z1)` instead of its plane, and drop the
  post and razor tori. It returns `null` in the gate and gatehouse gaps (x -450..-435 on both lines): store a dummy
  `{visible: true}` as `m` there so the cut code still works. Keep every obstacle and both `P0.fence`/`P0.fenceO`
  lists exactly as now. After `ring()`, call `penFenceTop(g)` once (posts, arms, strands, razor coil; static).
- Towers: replace the legs, cab, roof and windows with `penTower(g, x, z)`; keep the 4 x 4 obstacle but pass `null`
  as its mesh. Put the glow sprite in `head` (the lamp drum) at (0, 0, .45). Each frame in `penAnim`, aim each tower's
  light at the nearest outer searchlight circle with its `aim(x, y, z)` (the yoke turns, the drum tips; keep the towers
  in `P0.towers`).
- **The front gate is built by `src/gate528.js`** (it replaces the base's gate line via build.py), and dx529 slides its
  leaves: the main leaves (`PG.main`, x0 = -440 -/+ 2.5) move 5 m, the outer ones (`PG.outer`, x0 = -440 -/+ 3.5) 7 m.
  Today they slide straight through their own pillars and through the gatehouse. New layout, all clear of both tracks:
  - the main leaves' groups move to z -859.55 (just inside the fence, under its top arms) and get `penFrontGate(g).main[i]`
    as their contents; the outer leaves' groups move to z -863.45 (just outside the outer fence) and get `.outer[i]`;
  - `penFrontGate(g)` builds the two rails and buffer posts, the main pillars (x -446.4..-444.9 and -435.1..-433.6,
    z -861..-859.8), the gantry behind the big sign, the outer posts (x -447, -433) with the sally port sign's beam,
    the stop line, the gatehouse, the raised barrier and the road. gate528's pillars, gantry, lamps, outer posts, the
    stop line and the old gatehouse meshes go (the spike strip stays);
  - **the gatehouse moves** to x -452..-448, z -868.4..-864.4 (its obstacle too); it used to sit in the outer track;
  - the fence near the gate: keep gate528's obstacles `PG.oIn`/`PG.oOut`; its two rebuilt `seg()` pieces use
    `penFenceMesh` like every other section (the gaps are x -445..-435 inner, -447..-433 outer).
- **The gate control room** (dx529, x -429..-423, z -858.5..-853.5): its walls, roof, floor, console and lamps →
  `penGateControl(g)`; the door mesh and keypad inside `dg` → its `leaf`; use its `btnG` as the green button. The
  obstacles, the door group and the sign stay.
- **The visitation block** (dx528, `PVB`): walls, roof, floor, counter, glass, dividers, stools and phones →
  `penVisitation(g)` (same spots; the obstacles stay). Its door gap is z -875..-872 but the wall over it was only 2 m:
  the new frame covers all 3 m. The big VISITATION sign now stands on posts on the roof (same place); move the small
  "VISITS · 60 SECONDS" sign off the doorway to (B.x0-.17, 1.9, -870).
- **The staff car park moves east** to x -411..-381 (lines from x -409, cars at -407.4, -401, -388.2, the sign at
  x -396): at the game's spot it is under the visitation block, cars and all.
- `penPolish2` outside: the bus → `penBus()` at (-472, 0, -871); the car park, its lines and the three cars, the three
  barriers, the spike strip, the bunker's sandbags and the jeep, the water tower, the generator → `penOutside(g)`
  (all at the game's spots; keep every obstacle). The flag pole → `penFlagpole()` at (-453, 0, -871) (the waving flag
  stays). Kennels: the run's panels and the two houses → part of `penOutside`; the dogs → its `dogs` (same spots; the
  game's anim turns and bobs them). Lamp posts → `penLampPost(g, x, z, ry)` (returns the head position: put the glow
  sprite there). Under each "DANGER KEEP OUT" sign add `penSignPost(g, x, z, ry)` (they floated by the fence).

## Notes for the wiring (batch 2: yard, courtyard, inner wall, workshop, the block's outside)
- **Ground:** the yard's gravel plane stays at y .05 but uses `penYardMats().gravel`. The courtyard plane inside the
  inner wall is replaced by `penGround(g)`: four concrete strips round Cell Block D (the old single plane ran under the
  block and showed through its floor) and the gate path (x -444..-436, y .075) from the front gate to the inner gate.
  All are `noSeam`.
- **New yard items** (the layout table above; each is static): `penRecreation(g)` (far row, z -697..-677),
  `penGardens(g)` (west column), `penServices(g)` (east column, by the workshop), `penDeliveries(g)` (gate row,
  z -840..-834), `penCourtyard(g)` (inside the inner wall). Give each its footprint as a `q.obs`-style box in
  `penBuild` (walk-through: the painted line-up boxes, the pitch, the court lines, the rubber mat). Nothing in them
  touches a game spot: the gate path, the hides, the fence cut points, the guard routes and the exit door's apron were
  kept clear (checked with a script).
- **Basketball court:** the game's 14 x 9 slab and its hoop posts at (-470, -845) → `penCourt(g)` (same spot, lines,
  two hoops with backboards and nets, facing the court; the posts stay at the game's spots).
- **Floodlight poles** (`-520 + 32 i`, z -848, 9 m): → `penFloodMast(g, x, z)` (a tapered mast with a ladder and two
  lamps facing +z). The two lamp faces are at (x -/+ .6, 9.25, z + .49): put the game's glows there.
- **Workshop** (x -366..-358, z -765..-755): walls, roof, door and props → `penWorkshop(g)`. Its west front now has
  corner piers that narrow the opening to z -763.8..-756.2: add obstacles for them (x -366.2..-365.85, z -765..-763.8
  and -756.2..-755). The workbench and the toolbox stay at
  the game's spots (-359.6, -760) and (-359.5, .9 high), so the cutters pickup works as now. Signs: WORKSHOP up to
  y 2.75; the "FENCE → (cutters inside)" sign to (-366.012, 1.6, -764.25), size 1.1 x .5 (it hung over the opening).
- **Hiding spots outside** (`penPolish2`'s `hide()`): the two dumpsters → `penDumpster()` (the `'z'` one turned by
  PI/2), the two crate stacks → `penCrateStack()` (the top crate floated 10 cm over the second). Same spots, same
  obstacles, same hide logic.
- **Inner wall** (7 m): the wall meshes → `penInnerWall(g)` (coping, bands, buttresses, lamps; no buttresses at the
  gate gap). Keep every obstacle and LOS box. It returns `{lampMat}`: use that as the inner gate's `lt` indicator
  material (red shut, green open). Today `lt` sits inside the wall where nobody can see it.
- **Inner gate** (`igate` DOOR, x -446..-434 at z -830): the slab mesh → `penInnerGate()`, positioned where the slab
  is (y 3.4) and moved the same way; drop the `scale.y` of 2.6 (the model is already 12 x 6.76). It rides 2 cm up on
  the steel track that `penInnerWall` lays in the gap.
- **Courtyard (re-planned):** `penCourtyard(g)` now builds only the new things (stores row, washing lines, yard booth,
  chess tables, rest shelter); give each its footprint from the table as an obstacle (the chess stools and the shelter's
  posts can be small boxes). The catwalk stair needs one too: x -388..-381.5, z -702.5..-701.3.
- **The game's later yard, remodelled in place** (`penYardGame(g)` builds all of it and returns the handles; or call the
  parts). Hide the old meshes, keep every obstacle, prompt, activity and anim position:
  - `penYard` exercise cage → `penGymCage(g)` (posts, link, rails, razor coil, rubber floor, the two weight benches, the
    dumbbell rack, the pull-up bar, the punching bag on an A-frame; the old cage floor paint goes). It returns `{bag}`:
    swing that group with `rotation.z` instead of the old bag mesh. penSecure's cage torus wire goes (the coil is in the
    model). The PA horn on the west fence (-497.6, -780) and the CCTV dome by the north-east corner (-482, -768.4) now
    have arms on taller posts.
  - half court → `penHalfCourt(g)` (paint and hoop; the hoop faces the court, the ball anim is unchanged).
  - the picnic tables move into a tidy 2 x 2 grid: `penPicnic` at (-490, -722), (-480, -722), (-490, -713), (-480, -713)
    (obstacles 2.6 x 1.9 at the new spots; they were scattered).
  - planters → `penPlanter(g, x, -818)` for x -494..-458 step 6; gate control booth → `penGuardBooth(g, -454, -823, 2.4,
    1, 'GATE CONTROL')` (move its glow sprite down to y 2.0, it was inside the roof; the old label goes, it is in the
    model); AC units → `penACUnit(g, -384.5, z)` (returns the fan: spin it about y instead of the old blade); water tanks →
    `penTank(g, -384.5, z)`; light poles → `penLightPole(g, x, z)` (returns the glow spot); the two benches →
    `penBench(g, x, -704, 0, 2.4)`.
  - `penSecure` catwalk → `penCatwalk(g)`: the deck now runs into the wall (no gap), brackets, the eight posts, a
    railing, and a **stair down at the east end** (x -388..-381.6) so the guard up there has a way up. It also has the
    drop rod for the CCTV dome under it (-440, -701.2) and an arm for the PA horn (-440, -700.8). Move the "NO CLIMBING"
    sign to z -700.38 and the "INMATES ESCORTED / YARD CLOSES AT DUSK" sign (penYard) to z -700.38: both hung in the air.
  - the sally port → `penSallyPort(g)`: the arch, a glass porch from the block wall out to z -735.2 (extend its two side
    obstacles back to the wall, z -739.85), a roof, the floor mat. It returns `{light}`: use it as the arch's red/green
    light. The SALLY PORT sign is in the model (on the porch's front); the old one floated over the arch.
  - CCTV domes on the block walls (-470.4, -770), (-470.4, -790), (-409.6, -748), (-409.6, -790): `penDomeArm(g, x, 3.9,
    z, wallX, null)` with wallX -470.12 / -409.88 (they hung 25 cm off the walls). The PA horn on the mess hall's west
    wall gets its arm in `penMessOutside`.
- **The mess hall from outside:** `penMessOutside(g)`: a plain facade skin on its three outer walls, a parapet round
  its roof, frames, glass and bars outside the four slit windows. Its own wall corners overlap each other (the game's
  shell); the skin covers that.
- **Cell Block D outside:** `penBlockOutside(g)` adds a facade skin 1 cm off every outer wall (on the west side only
  outside the mess hall, so its doorway stays open), the exit door's frame,
  keypad (no canopy and apron any more: the sally port's porch covers the door; the exit DOOR at x -416..-414 is
  unchanged and still slides into the wall), downpipes, and
  a parapet, AC units and ducts on the roof (the game's roof slab stays). The CELL BLOCK D signs go 20 cm off the
  walls (they were inside the new skin), the two warning signs on the inner wall to `I.z0 - .45`.
