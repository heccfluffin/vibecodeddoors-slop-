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
