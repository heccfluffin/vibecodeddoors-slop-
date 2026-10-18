Status: layout approved 2026-10-18 · batches 1-3 approved (outside, front rooms, cells) · batch 4 (courtroom) next

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

## Batches
1. The station outside, the courthouse outside, the forecourt. 2. The lobby, office, booking, break room.
3. The corridor, the cells (A, B, C, D), interrogation and observation. 4. The courtroom. 5. The HQ annex.
6. The car park, the kennel, the impound lot.
