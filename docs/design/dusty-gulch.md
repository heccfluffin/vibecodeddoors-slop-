Status: layout and batch 1 approved by the user 2026-10-17 · more batches coming

# Dusty Gulch rework

The user wants every place remodelled. Dusty Gulch (`xpGulch`, bak519 ~3779) already has proper insides, so this
rework is the outside. **Every building keeps its footprint, its inside and every prop and mission spot**: the diner,
Bob's, the saloon, the bank and its vault, and the chapel. Models go in `docs/design/models/gulch.js` (load it after
`fort-kit.js`). New globals start with `gu`. None of them clash with existing names.

## Part 1: layout (approved)
Main Street is the old road `road(450, -1423.5, 450, -1560)`.
- **West fronts** are at x 440 (doors +x), at the diner's z -1449, Bob's -1474 and the saloon's -1501.
- **East fronts** are the bank at x 460 (door z -1451) and the chapel at x 462 (door z -1485).

1. **Western fronts** on every building: a false front with the painted name, board siding and a covered porch.
   Batches 2 and 3.
2. **Boardwalks:** one continuous covered boardwalk per side, x 440..443 and 457..460, z -1515..-1437. They have steps
   at the doors and the ends, and replace each shell's own porch (pass `noPorch: 1`).
3. **Main Street:** a dirt street from the arch to the south end, a welcome arch at z -1430, iron lamp posts along the
   edges, and hitching rails with troughs. The town pump is in the diner/Bob's alley and a broken wagon in the
   Bob's/saloon alley.
4. **East side:** the chapel's bell tower becomes part of its front (batch 3), a small undertaker's by the cemetery,
   and a picket fence along the cemetery's street side.
5. **Water tower** at (532, -1500): a timber tower with a wooden tank (batch 4).
6. **Sunny Acres** (x 398..442, z -1558..-1518) becomes a trailer park (batch 4):
   - a drive from Main Street (x 436..443, z -1541..-1537) to a gravel loop (x 404..436, z -1550..-1526, 4 m wide);
   - five trailers on pads round the loop, facing in, with decks and awnings: the flamingo one, the TV one, the
     washing-line one, the porch-swing one, and a new rusty one for sale at x 401;
   - a green inside the loop with a fire pit, camp chairs, the BBQ and a picnic table;
   - a shower and laundry block, an office trailer with the sign on its roof, mailboxes by the gate, and a low wire
     fence.
7. **The station** (450, -1629): a station house and a water tank for the trains (batch 4).

## Part 2: models

### Batch 1: Main Street (`guStreet(g)`), approved
Call it in `xpGulch` and push its `obs` to `q.obs` and its `plates` to `q.plates` (the boardwalk decks are at y .46,
the steps at .15).
- **The street:** a dirt plane, x 442.5..457.5, z -1560..-1423, at y .03, with ruts and hoof prints in one texture.
  **Stop drawing the asphalt mesh of `road(450, -1423.5, 450, -1560)`.** Keep any route-grid or road data it adds;
  only the mesh goes. If that's hard, raise the dirt plane to y .05.
- **Boardwalks:** decks on piers, an edge beam, posts every 3.6 m with knee braces, and a sloping tin awning.
  - West: x 440..443, z -1515..-1437. East: x 457..460, the same z, 2 m deeper in front of the chapel.
  - Pass `noPorch: 1` to every `shell(...)` call, because the boardwalks replace the porches and their awning posts.
- **Welcome arch** at z -1430: two log posts at x 441.5 and 458.5, a crossbeam, the painted board both ways, and a cow
  skull. Drop the old `[456, -1432, 'DUSTY GULCH\nPOP. 13...']` street sign from `xpRoads`.
- **Lamps:** replace the street lamps (the merged posts at x 445/455 every 26 m, now in the middle of the dirt
  street) with iron lantern posts.
  - In town (z -1437..-1515) they stand at x 442.8 / 457.2, on the boardwalk edge. Outside town they're at x 442.2 /
    457.8.
  - Keep the game's `light(...)` calls, moved to the lantern tops (y 3.6).
- **Hitching rails with water troughs** at (444, -1453), (444, -1478), (444, -1506), (456, -1455) and (456, -1478).
  Drop the old taxi-stand hitching rail at (470, -1448).
- **Town pump and trough** at (432, -1462). **Broken wagon** at (426, -1486), with one wheel off.
- The three barrels at (458..460, -1436) can stay.
