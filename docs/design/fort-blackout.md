Status: part 1 (layout) approved by the user 2026-10-17 · part 2 (building models) in progress

# Fort Blackout rework

The user: the base "has stuff just shoved into it". Part 1 is the new layout, which the user approved from a top-down plan.
Part 2 is the building models, which come one batch at a time, each with a preview and the user's OK, from
`docs/design/models/fort-*.js`. Build part 1 whenever you like. It doesn't need the new models.

All coordinates are desert world x/z (world z = local z + q.OZ). North = -z (the gate is at the top of the map).
I checked these against your constraints note in NOTES.md (2026-10-17).

## Part 1: layout

### What doesn't move
- **Main gate** at x 552..568, z -930, and the `WK_GATE` points (561,-990/-962/-938).
- **`MILB`** x 300..600, z -930..-660; `MILRZ`; `MILAA`.
- **Runway 09** (`ALB`, centre line z -980, landing from the west, touchdown about x 265).
- **Command wing** (`CWB`), **Wraith bays** (`WBAY`) and their airlock doors.
- **HQ, the barracks huts, latrines, recruiting office, mess hall, boot camp, depot, tank park, LZ Bravo, mortars,
  range, hangar, launch control, Silo 1, radar.** Their footprints stay where they are. Part 2 reskins them.

### Roads
All roads are 7 m wide (the taxiway is 8 m), concrete, with a kerb (0.15 m high, 0.3 m wide) and a 1.5 m pavement
wherever a building faces the road. Lamp posts go every 25 m on one side.

| Road | Centre line | Notes |
|---|---|---|
| Gate Avenue | x 560, z -1004 → -735 | Was -1033.5 → -735. It now starts at the new outer checkpoint (below). |
| North Street | z -885, x 312 → 560 | Was x 420 → 560, ending under the squad shed. Now it runs the full width past the huts. |
| Parade Road | z -805, x 415 → 560 | New. Joins Gate Avenue to the Wraith bay apron (the apron ends at z -814). |
| Parade Lane | x 475, z -885 → -805 | New. Runs between the command wing (ends x 470) and the parade ground (starts x 480). |
| South Street | z -735, x 330 → 560 | Was x 470 → 560. |
| Airside lane | x 491.5, z -940 → -885 | New. Through a new **airside gate**, a gap in the north wall at x 488..495. |
| Taxiway | z -952, x 513 → 556.5 | New, 8 m. From the jet apron to Gate Avenue. |
| ~~z -905, x 520 → 560~~ | removed | It ran through the new motor pool canopy. |

- **Plaza walkway**, x 412..418, z -880 → -827: for people only, paved, not a road. Put bollards across both ends with
  gaps under 3 m, so the base route grid closes it to vehicles.
- **`milRoads`**: replace with the lines above. **Police and squad routes:** Gate Avenue keeps its line, so beats that
  use it only gain the stretch to the outer checkpoint. Nothing else outside the base moves.

### Moves (old → new)
1. **Squad motor pool** `MPOOL`: x 455..485, z -901..-872 → **x 495..525, z -925..-896**.
   - Four roller doors on the **south wall**, centred x 499, 506.5, 514, 521.5, opening onto an apron (z -896..-888.5)
     and North Street.
   - The crew door is on the west wall at z -905, facing the airside lane.
   - `CWPOOL` spawn points: (499,-892), (506.5,-892), (514,-892), (521.5,-892), facing south (+z).
   - The squad vehicles park inside in four rows, one per door, facing south.
   - The crew walk from the offices: out of the office doors, along Parade Lane, then across North Street.
2. **Old motor pool canopy** (x 490..540, z -925..-885) → **x 528..553, z -925..-893**.
   - Keep the order of the `addVeh` calls (co-op vehicle ids).
   - 3 jeeps at (533,-919), (540.5,-919), (548,-919), facing south.
   - 2 trucks at (535,-907), (547,-907).
   - The APC at (541,-897), facing south.
   - Workshop bench along the back (z -924.5, x 530..550). Supply pallet `SUPPAL` → (551,-911).
   - The sign moves to the canopy's front edge.
3. **Parade ground** paint: x 420..560, z -880..-800 → **x 480..553, z -878..-812**.
   - Flagpole → (516,-872), halyard prop beside it.
   - Podium → (516,-866), facing south.
   - Formation (18 + sergeant) centred (516,-854), facing north (towards the flag).
   - Bleachers → x 482..485.7, z -862..-842, facing east.
   - Floodlights → (482,-876), (551,-876), (482,-814), (551,-814).
   - Inspection posts: spread round the parade ground's edge.
4. **Command plaza**, x 401..429, z -880..-827: paving, planters and benches round the walkway. Its floor is decoration
   only; give the planters colliders.
5. **Flak tower** (450,-924) → **(462,-924)**, clear of Hut 3's back wall.
6. **Gun pit** (400,-740) → **(400,-750)** with its prop, off South Street.
7. **Maintenance tank** in Hangar 1 (342,-692) → **(395,-700)**, off the refit pad. Remove the second set of hangar tool
   carts (bak:6825; they are built twice).
8. **Uplink** `UPLK` (447,-693.6) → **(449.5,-693.6)**, clear of the radar dome.
9. **Launch control guards** → (537,-719.5) and (546,-719.5), facing north (rotation 0), either side of the door.
10. **Leftover X-13 trials beacon** at (520,-666): remove.
11. **Tank patrols** (`ML.gtk`):
    - loop 1 runs round the parade ground on the roads: (475,-885) → (556,-885) → (556,-805) → (475,-805);
    - loop 2 runs back and forth along South Street: (335,-735) ↔ (552,-735).
12. **Foot patrols**:
    - patrol 1 round the parade ground pavement;
    - patrol 2 along North Street;
    - patrol 3 along the inside of the airfield fence.

### The airfield annex
The runway becomes part of the base: a fenced annex joined to the north wall.
- **Fence**: (300,-930) → (215,-930) → (215,-1004) → (552,-1004). Then a gap for the outer gate, then (568,-1004) →
  (600,-1004) → (600,-930).
  - Chain-link, 3 m high, with posts every 3 m and a strand of razor wire.
  - Where it crosses the runway line (x 215, z -998..-962) it is a **1 m** barrier, so landing planes clear it.
  - Colliders on the fence.
- **Outer checkpoint** at (560,-1004): a booth, a lifting barrier on the same rules as the main gate barrier, and a
  guard. The **dragon's teeth** move here as a zig-zag chicane outside it (z -1016..-1008), with colliders.
  Remove the old row at z -939.
- **Guard towers** at (230,-1000) and (598,-1000).
- **Jet shelters** move 4 m north: back walls from z -931 → **-935**, so they no longer touch the base wall.
  The apron stays at x 403..513, z -964..-940.
- **Air Ops** building, x 305..345, z -962..-936, door on the north side.
- **Aviation fuel farm**, x 350..396, z -960..-940.
- **Approach lights**, x 214..234, z -985..-975 (no colliders).
- The control tower stays at (545,-944).
- **"On base" check**: add the annex rectangle **x 215..600, z -1004..-930** to `milArea` (and to the map frame).
  Military rules apply inside it as on the base. `MILAA` already covers it.

### Map labels (`MAPBN`), name and centre
HQ (360,-860) · Command Wing (450,-853) · Wraith Bays (450,-835) · Motor Pool (524,-909) · Parade Ground (516,-845) ·
Barracks (388,-912) · Latrines (474,-916) · Recruiting (586,-910) · Mess Hall (582,-892) · LZ Bravo (582,-848) ·
Boot Camp (364,-812) · Depot (350,-782) · Tank Park (470,-780) · Range (556,-765) · Hangar 1 (375,-694) ·
Launch Control (527,-701) · Silo 1 (578,-700) · Radar (442,-700) · Air Ops (325,-949) · Fuel Farm (373,-950) ·
Shelters (448,-946) · Tower (545,-944) · Runway 09 (385,-980).

### Missions
Nothing a mission uses is removed. The squad motor pool moves (missions and crimes that point at `MPOOL` follow the
constant). The old canopy's vehicles move with it. The parade ground props (flag, inspection) follow item 3.

## Part 2: building models
Coming in batches. Each will list its file, its builder function and what it replaces.
