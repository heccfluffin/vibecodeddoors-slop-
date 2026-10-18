Status: shipped in r626 (2026-10-18): layout and batches 1-6

# The Desert PD rework (remodel list #22)

The station doubles in size, the court moves into its own courthouse next door, the cells are rebuilt, and the HQ
annex, car park and kennel are redone, with a new impound lot. Models: **`docs/design/models/pd.js`**.

**Careful with the jail.** Every gameplay spot is listed below with its new position. Cells A and B keep their exact
insides: the whole cell block (cells, corridor, keys, Seek's chair, the laser grid) moves by **(-2.7, -2.0)** as
one piece, so every jail offset stays the same.

## Layout (all world x/z; the PD's front faces +z)

### What doesn't move
- `DPD` stays (88, -1020): the cop home spot `DPD.Z+12`, crime/bounty distance checks and the backup parking all
  stay. The **front wall stays on z -1017.5** and the **main door stays at x 85.4 .. 86.6**, so "turn yourself in"
  (`DPD.X-2, DPD.Z+4.4`), Seek's cruiser bay (89, -1012), the driveway and the "out of the front door = free" check
  (`lz > pd.zf + .5`) are unchanged.
- The HQ annex (`PDH`, x 106..134, z -1025..-1013), its officers and the car park stay where they are.

### The station: x 64..96, z -1031.5..-1017.5 (was 80..96, -1029.5..-1017.5)
Front band (z -1024.5..-1017.5, 7 m deep), west to east:
| Room | x | Doors |
|---|---|---|
| Booking (mugshot wall, fingerprints) | 64..71 | to the corridor: x 66.5..67.5 on z -1024.5 |
| Chief Seek's office | 71..78 | to the lobby: z -1022..-1021 on x 78 |
| Lobby | 78..90 | main door x 85.4..86.6 (front); corridor door x 83.8..84.8 on z -1024.5 (the laser grid) |
| Break room | 90..96 | to the lobby: z -1022.4..-1021.4 on x 90 |

Back band (z -1031.5..-1024.5):
| Room | x | z |
|---|---|---|
| Corridor | 64..92 | -1027.5..-1024.5 (3 m, as now) |
| Interrogation (door x 65.6..66.6) | 64..69.3 | -1031.5..-1027.5 |
| Observation, one-way mirror (door x 70.4..71.4) | 69.3..72.5 | -1031.5..-1027.5 |
| Cell C, the drunk tank (looks only; door x 74.85) | 72.5..77.3 | -1031.5..-1027.5 |
| **Cell A** (door `dAx` 79.65) | 77.3..82.1 | -1031.5..-1027.5 |
| **Cell B** (door `dBx` 84.55) | 82.1..87.0 | -1031.5..-1027.5 |
| Cell D, holding (looks only; door x 89.35) | 87.0..92 | -1031.5..-1027.5 |
| Records and janitor (door x 93.5..94.5 on z -1024.5, from the break room) | 92..96 | -1031.5..-1024.5 |

New `q.pd` lines: `zf` -1017.5, `zp` -1024.5, `zc` -1027.5, `zb` -1031.5.

### The courthouse: x 42..58, z -1030..-1018 (new)
Portico x 46..54, z -1018..-1015.5 (six columns); front door x 49.2..50.8. Entrance hall z -1021..-1018 (doorway
x 49..51 into the courtroom). Courtroom z -1030..-1021: judge's bench (50, -1028.4), the dock (50, -1024.2),
"address the court" (50, -1026.3), jury seats (56.2, -1027.6 / -1026.0 / -1024.4), facing west.
Not guilty: you're put outside the courthouse door at (50, -1014.5), facing +z.

### Outside
- Forecourt paving x 42..106, z -1017.5..-1013.3 (3 cm, kerbed, dropped kerb across the driveway mouth x 84.5..91.5).
  **The driveway road must then start at z -1013.3** (`road(88,-1016.4,88,-993.5)` → `road(88,-1013.3,88,-993.5)`),
  or the two would fight. The alley x 58..64 and the yard x 96..106 are paved too.
- The two red barrels at (82, -1014) and (83.2, -1014.5) end up on the forecourt: move them to (60.5, -1029) and
  (61.7, -1029.4), in the alley.
- Impound lot x 138..156, z -1025..-1004 (new, batch 6).

## Ideas for later (the user, 2026-10-18)
- **Use the interrogation room in the arrest cutscene,** before the court: you're sat at the interrogation table, Seek
  (or Detective Gloom) leans over the lamp and asks a couple of silly questions, someone watches through the one-way
  mirror from the observation room, then it cuts to the dock. The spots are ready (`pdCellBlock(g).spots`): your
  chair `intChair` (65.9, -1029.5, facing +x), the questioner `intCop` (67.7, -1029.5, facing -x), the watcher
  `obsWatch` (70.6, -1029.5, facing -x, behind the mirror).

## Batches (all approved)
1. The station outside, the courthouse outside, the forecourt. 2. The lobby, office, booking, break room.
3. The corridor, the cells (A, B, C, D), interrogation and observation, records. 4. Inside the courthouse.
5. The HQ annex. 6. The car park, Chief Seek's bay, the flagpole, the kennel, the impound lot.

## The models (`pd.js`, plain three.js, needs nothing else; put it in a new module)
| Function | Builds | Returns |
|---|---|---|
| `pdStationShell(g)` | station outer walls, roof, portico, signs (batch 1) | `{obs, map, blink}` (blink: the mast light, make it flash) |
| `pdCourtShell(g)` | the courthouse outside (batch 1) | `{obs, map, flags}` (wave them with `pdFlagWave(flags, t)` each frame) |
| `pdForecourt(g)` | paving, kerb, alley, yard, lamps, planters, benches, notice board, SURRENDER HERE | `{obs, map}` |
| `pdFrontRooms(g, {you})` | booking, office, lobby, break room (batch 2) | `{obs, posters, spots}` (posters[0] is the player's WANTED poster) |
| `pdCellBlock(g)` | corridor, cells A-D, interrogation, observation, records (batch 3) | `{obs, pd, spots}` |
| `pdCourtRoom(g)` | inside the courthouse (batch 4) | `{obs, wig, gav, spots}` |
| `pdAnnex(g)` | the HQ annex (batch 5) | `{obs, scr, wb, map}` |
| `pdGrounds(g)` | car park, Seek's bay, flagpole, kennel, impound lot (batch 6) | `{obs, map, flag, spots}` |

All coordinates are the desert's own (the ones the code uses: `ob(x0,x1,z0,z1)`, props, `DPD`). Build them into the
same group `desertPD` uses; `obs` go through `ob(...)`, `map` rects (`[x0,x1,z0,z1,colour]`) through `rect(...)`.
Every mesh is `noSeam`; the things that move are `dpKeep`.

## Wiring

### 1. `desertPD(q, g, T)` (bak519 ~4118): rebuild it with the models
Keep the function and everything it puts in `q.pd`, but replace all its meshes:
```js
const st=pdStationShell(g),ct=pdCourtShell(g),fc=pdForecourt(g),fr=pdFrontRooms(g,{you:fsName(SV.nm||'')||'YOU'}),
      cb=pdCellBlock(g),cr=pdCourtRoom(g);
for(const R2 of[st,ct,fc,fr,cb,cr]){for(const o of R2.obs)ob(o.x0,o.x1,o.z0,o.z1);for(const m of R2.map||[])rect(...m)}
```
Careful with **cell doors**: `cb.obs` already contains `cb.pd.cA.dob` and `cb.pd.cB.dob` (pushed as plain objects). The
jail code adds and removes those exact objects from `q.obs`, so push them **as is** (`q.obs.push(cb.pd.cA.dob)`),
not as copies through `ob()`. Same for cells C and D (they never open).

Then build `q.pd` from `cb.pd` plus:
- `judge` = `mkCopSeek(.8)` at `cr.spots.judge` (x 50, y 1.56, z -1028.85, `rotation.y = Math.PI`, hide `children[1]`
  as now), `wig: cr.wig`, `gav: cr.gav`.
- `jury`: the same three `entModel` jurors at `cr.spots.jury[i]` (x 56.2, z -1027.6 / -1026.0 / -1024.4), y = their
  old y + `cr.spots.juryFloor` (0.18, the box's platform), `rotation.y = cr.spots.juryRy` (-π/2, as now).
- Tim the stenographer: `entModel('tim')` at `cr.spots.tim` (45, 0.7, -1027.6).
- `dock: cr.spots.dock` (50, -1024.2).
- `home: {x:74.5, z:-1021}` (Chief Seek's office), `door: {x:84.3, z:-1026}`,
  `path: [[74.5,-1021],[78.7,-1021.5],[83.2,-1023.4],[84.3,-1024.1],[84.3,-1026]]` (`fr.spots.path`),
  `exit: {x:86, z:-1016.3}` (unchanged).
- `x: 88, z: -1020` stay (DPD). `zf` -1017.5, `zp` -1024.5, `zc` -1027.5, `zb` -1031.5, and the new `cdx` 84.3 come from
  `cb.pd`.

Split the old `q.anims` entry in two: the cell doors at the station (`x, z, r:40`) and the wig, judge and jury at the
courthouse (`50, -1024, r:30`). Add the mast light blink and the two courthouse flags to an anim. Lights: keep a
PointLight in the lobby (84, 3, -1021), the corridor (78, 3, -1026) and the courtroom (50, 4.5, -1025).

Props (same text and actions as now, new spots):
| Prop | Was | Now |
|---|---|---|
| Ring the bell | x+.4, zp+3.0 | **(84.9, -1020.7)** r .6 |
| Take a donut | x+1.0, zp+3.0 | **(85.5, -1020.7)** r .5 |
| Address the court | cx, zb+2.9 | **(50, -1026.3)** r 1.3 |
| New: have your mugshot taken | | **(65.2, -1021)** r 1.0, a hint only: flash `snd`, "📸 Front. Side. Other side. The camera is a potato." (optional) |
Add `q.locs.push({nm:'Courthouse', x:50, z:-1022, ic:'⚖️'})`.

### 2. The jail code (bak519 ~4189 and ~7588..7660): the cell block moved by (-2.7, -2.0)
`cb.pd` already has every object at its new spot (brick, mop, keys, tile, bone, lid, fuse box, padlock, lasers, the
MAXIMUM SECURITY sign, both cells' `box`, `sp`, `dx`, `k0`). What's left are the hard-coded offsets:
- **`jailProps`**: change `const x=pd.x` to **`const x=pd.x-2.7`**. Every spot there is written as `x ± a` and
  `zb/zc + b`; with the new `pd.zb`/`pd.zc` (each 2 m further back) and this x, they all land on the new objects.
- **`jailTick`, the laser grid**: `lx>pd.x-1.5&&lx<pd.x-.5` → **`lx>pd.cdx-.5&&lx<pd.cdx+.5`**.
- **`jailTick`, Seek's line of sight** (the `inLobby/skLobby/skCourt/plCourt/los` line): the court is no longer behind
  the partition, and Seek now starts in his office. Use rooms instead:
  ```js
  const reg=(x,z)=>z>pd.zp?(x<78?'office':x>90?'break':'lobby'):(x>92?'records':'cells');
  const los=reg(lx,lz)===reg(pt.x,pt.z)||(Math.abs(lx-pd.cdx)<.6&&Math.abs(pt.x-pd.cdx)<4);
  ```
- **`courtEnd`**: when found **not guilty**, put the player outside the courthouse: `P.x=50; P.z=-1014.5+q.OZ;
  P.yaw=Math.PI` (instead of `DPD.X-2, DPD.Z+5.5`). The "fined, no cell" branch stays at the station door.
- Nothing else moves: `jailSleepInit` (the chair at `C.dx+.85, zc+1.55`), `jailNearDoor`, `jailInCell`, `jailReset`,
  `jailPadDrop`, the fishing rod and the dig dust all work from `pd`/`C` values.
- Search the modules for `pd.x`, `pd.zb`, `pd.zc`, `pd.zp` and old numbers (80..96, -1029.5..-1022.5) before calling it
  done; I found none outside bak519 (dx533's turn-in uses `DPD.X-2, DPD.Z+4.4`, which is unchanged).

### 3. The HQ annex (`pdHQ`, dx555)
Replace its building, rooms, car park, flagpole and kennel meshes with `pdAnnex(g)` and `pdGrounds(g)` (into the
annex's group). Keep the officers, their props and the backup car logic as they are.
- The dispatch screens: `scr = ax.scr` (three planes with `userData.cv/tx`, drawn by the same code).
- The whiteboard: `wb = ax.wb`.
- The flag: `fl = gr.flag` (a group; the anim's `fl.rotation.y` still waves it). Its obstacle moves with it:
  drop `ob(104.3,104.7,-1012.2,-1011.8)`, the new one is in `gr.obs`.
- Biscuit: the dog group moves to **(134.4, 0, -1006.6)**, inside his run. Drop the old dog house and its obstacle.
- The three squad cars stay at (112/116/120, -1008.5).
- `q.mapR`: use `ax.map` and `gr.map`.

### 4. Outside (build.py patches)
- `road(88,-1016.4,88,-993.5)` → **`road(88,-1013.3,88,-993.5)`** (the forecourt now meets it).
- The red barrels at (82, -1014) and (83.2, -1014.5) → **(60.5, -1029)** and **(61.7, -1029.4)** (the alley).

## Checks
- Walk round the station, the courthouse and the annex; nothing blocks a doorway.
- Get busted once: the court (dock view), then cell A; take the mop, hook the keys from sleeping Seek, open the door,
  walk out through the lobby (free). Twice: cell B, the padlock code from the skeleton, the cistern spoon, the tile.
  Three times: the laser grid at the corridor door and the fuse box.
- Found not guilty: you come out of the courthouse doors.
- Turn yourself in at SURRENDER HERE; a crook's bounty at the station; backup cars leave the car park.
- The dispatch screens and the briefing whiteboard update.
