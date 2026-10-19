Status: layout approved 2026-10-19 · batch 1 (fences, watchtowers, front gate, outside) in progress

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
| Exercise cage | x -495..-483, z -724..-712 |
| Forklift and pallets | x -462..-454, z -721..-715 |
| Inner guard booth | x -392..-386, z -721..-715 |
| Supply cages | x -495..-485, z -822..-816 |
| Benches | x -464..-456, z -820..-818 |
| Benches | x -424..-416, z -820..-818 |
| Outdoor washing lines | x -495..-482, z -790..-770 |
| Power box | x -490.5..-486.5, z -757..-753 |

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
  as its mesh. Put the glow sprite in `head` at (0, 0, .45). Each frame in `penAnim`, turn each tower's `head` to the
  nearest outer searchlight circle: `head.lookAt(L.c.position)` (keep the towers in `P0.towers`).
- Front gate: the gate slab, the gatehouse box and roof, and the road and its dashes go; `penFrontGate(g)` builds the
  pylons, the gantry behind the big sign (the sign stays), both sliding gates, the gatehouse, the raised barrier and the
  road. Keep the gatehouse obstacle (pass `null` as its mesh).
- `penPolish2` outside: the bus → `penBus()` at (-472, 0, -871); the car park, its lines and the three cars, the three
  barriers, the spike strip, the bunker's sandbags and the jeep, the water tower, the generator → `penOutside(g)`
  (all at the game's spots; keep every obstacle). The flag pole → `penFlagpole()` at (-453, 0, -871) (the waving flag
  stays). Kennels: the run's panels and the two houses → part of `penOutside`; the dogs → its `dogs` (same spots; the
  game's anim turns and bobs them). Lamp posts → `penLampPost(g, x, z, ry)` (returns the head position: put the glow
  sprite there). Under each "DANGER KEEP OUT" sign add `penSignPost(g, x, z, ry)` (they floated by the fence).
