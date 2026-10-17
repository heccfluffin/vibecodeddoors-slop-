Status: layout, batches 1-3, all five interiors and batch 4a (water tower, station) approved by the user 2026-10-17 · Sunny Acres next

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
- **Lamps:** replace the street lamps (the merged posts at x 445/455 every 26 m, which are now in the middle of the
  dirt street).
  - In town, lanterns hang on iron brackets from the boardwalk edge beams every 7.2 m (x 443.3 / 456.7, y 2.9).
  - Outside town, iron lantern posts stand at x 442.2 / 457.8.
  - Keep the game's `light(...)` calls at the lanterns: every second one in town, and every outside post.
- **Arch braces** run from each post up to the crossbeam.
- **Hitching rails with water troughs** at (444, -1453), (444, -1478), (444, -1506), (456, -1455) and (456, -1478).
  Drop the old taxi-stand hitching rail at (470, -1448).
- **Town pump and trough** at (432, -1462). **Broken wagon** at (426, -1486), with one wheel off.
- The three barrels at (458..460, -1436) can stay.

### Batch 2: the west side fronts (`guWest(g)`), approved
New globals: `guFront, guWest`. Call `guWest(g)` after the three west shells.
- In each west `shell(...)` call (the diner, Bob's and the saloon): pass `noPorch: 1` (batch 1), and **drop the name
  sign** (the `lab(name, ...)` at `fx + dir*.2, H + .75` and its backing board `A(BX(.2, 1.1, ...))`). The false front
  carries the name now. `shell` could take `o.noSign`.
- **How the front sits:**
  - The false front stands .42 out from the wall (x 440.42..440.52), in front of the shell's roof edge and window
    frames.
  - Its openings are cut exactly where the shell's are, so the doorway, the windows, the swinging saloon doors and
    every prop are unchanged.
  - Linings close the openings back to the wall.
  - The fronts rise to 7.2 (diner, arched top), 7.0 (Bob's, stepped top) and 8.6 (saloon, flat top with a bracketed
    cornice and two painted upper windows).
- **Extras:** the diner's neon "EAT" blade sign, Bob's hanging shingle, and three crates by Bob's door on the
  boardwalk (no collision needed; they're against the wall).
- The diner's "OPEN" sign (inside the window) stays.

### Batch 3: the east side (approved) · `guEast(g)` → `{obs}`
- **Bank** (`guFront` at x 460, flat top 7.6): dressed stone, a heavy cornice, pilasters either side of the door,
  a navy and gold name board ("EST. 1886 · YOUR GOLD IS SAFE (MOSTLY)"). Openings match the shell's exactly.
- **Chapel** (`guFront` at x 462, top 6.8 plus a gable to 9.8): white boards, purple trim, a round rose window in
  the gable. The **belfry** stands on the ridge at (462, cz): four posts, slatted sides, a cap and a four-sided
  spire with a gold cross. It is open in the middle so **the game's bell (the cone at y 11.5) hangs inside it
  unchanged**, and the ring-the-bell prop still works. Remove the base's old tower box (`BX(3,10,3)` at y 7.7) and
  its cone roof at 13.6; keep the bell. A bell rope runs down the front (looks only).
- **Undertaker's** (new, x 460.4..466, z -1505.6..-1500.6, on the boardwalk): a small closed shop with a stepped
  front, a shut door with a note, two coffins leaning by it. Its box is in `obs`.
- **Boot Hill:** a white picket fence along the cemetery's street side (x 460, z -1560..-1506), with an open gate
  at z -1534.6..-1531.4 under an iron arch and a "BOOT HILL" board on chains. Fence runs are in `obs`. The base's
  cemetery fence on that side (the merged posts on the x0 side) goes; the other three sides stay. If the base's
  gate is on another side, keep it and this gate is just a second way in.
- The street lamp that stood in the new gateway (east side, z -1534) moves to z -1538.5 (already in `guStreet`).
- In the bank and chapel `shell(...)` calls: `noPorch: 1`, and drop the name sign and its backing board, as on the
  west side.

### Fix for every shell: the door frame z-fights
In `shell(...)` the door frame posts are `BX(.42, 2.5, .1)` at `cz ± 1.35`, so their inner faces sit at `cz ± 1.3`,
exactly on the wall's cut ends. Move them to `cz ± 1.34` (inner faces 1 cm proud of the wall). The head piece is
fine (it already hangs 5 cm below the lintel).

### Interiors 1: Rushy's Diner (approved) · `guDiner(g)` → `{fan, tubes, obs}`
- **Shell call:** add `noPanel: 1` (the diner brings its own wainscot; the shell's panelling and its rail at y 1.12
  would z-fight with it) and drop `backWin` (the menu board covers that window). `shell` needs `o.noPanel` to skip the
  panelling and the skirting rail.
- **Remove the game's meshes** (keep every `ob`, `prop`, label and light): the counter box, the five stools (seat and
  pole), the two booths (table, post, foot, seats, backs), the pie case's glass box and its three pies, the pie on
  the counter (two cylinders), the jukebox body and its yellow panel.
- **Keep:** the OPEN sign, the menu label on the back wall (it gets a chrome frame behind it), Rush, the shell's two
  lamps, `q.juke`, all the props.
- **The jukebox now faces into the room (-z).** Move its prop from `(jx, jz + 1)` to `(jx, jz - 1)` and its light `jl`
  from `jz + .5` to `jz - .5`.
- **Animate** (in the existing jukebox `anim`): `fan.rotation.y += dt * 2.2` always; when `q.juke.st` is on, cycle
  each tube's colour (`m.color` / `m.emissive` `setHSL((t * .15 + i * .3) % 1, 1, .6 / .5)`, emissiveIntensity .9),
  when off set emissiveIntensity .1. The fan is `dpKeep`.
- **New obstacles** (push `obs`): the back counter (x 404.15..405.3, z -1455.5..-1444) and the two booths under
  the side windows. The middle booths, counter, stools and jukebox keep the game's obstacles.
- Pieces stand on y 0 like the game's old ones did.

### Interiors 2: Bob's Bargains (approved) · `guBobs(g)` → `{obs, stoveGlow}`
- **Shell call:** add `noPanel: 1` (the back shelves' boards would z-fight with the panelling).
- **Remove the game's meshes** (keep every `ob` and `prop`): the merged shelf frames and merged boxes, the three barrel
  cylinders, the till (two boxes), the counter box, the four item boxes and their price labels.
- **Keep:** Bob and his `anim`, the shell's lamps, every prop (buy x4, talk to Bob).
- **New obstacles** (push `obs`): the display case in front of the counter (x 416.6..417.4, cz±3.4), the hat stand,
  the stove in the back corner, the two island tables (x 426.45..429.55, cz±3.2 ±.6). The aisle from the door to the
  counter (cz±2) stays clear.
- **Animate:** `stoveGlow.emissiveIntensity = .8 + sin(t*11)*.15 + sin(t*27)*.1` (any flicker is fine).
- Everything here stands on the floor's top, y .18.

### Interiors 3: the Rusty Door saloon (approved) · `guSaloon(g)` → `{obs, flames}`, `guBatwing(sd)`
- **Shell call:** unchanged (it keeps its panelling; nothing here touches the walls below 1.2).
- **Remove the game's meshes** (keep every `ob`, `prop`, light and `anim`): the chandelier group's ring, candles,
  flames and chains (keep its `light`), the three rug boxes, the steer skull group, the two front-wall lamp boxes and
  globes, the bar box, the back-bar box, its 14 bottles and two shelves, the piano's two boxes, the three tables and
  their crate stools.
- **Swinging doors:** keep the hinge groups `h` and their `anim`; replace each leaf box `d` with `h.add(guBatwing(sd))`
  (the leaf is built in the hinge's own space, same size and place as the old box).
- **The posters:** move the game's two labels (`p1`, `p2`) from the back wall (they were hidden behind the back bar) to
  the side wall: `p1` at (412.5, 2.2, -1490.185), `p2` at (414.5, 2.2, -1490.185), both `rotation.y = Math.PI`.
  `guSaloon` draws their frames and a third poster.
- **Animate (optional):** each of `flames` can wobble, `f.scale.y = 1 + sin(t*9 + i*1.7) * .15`. Flames are `dpKeep`,
  and so is the chandelier group (it is built at the game's spot, 424, 3.4, cz).
- **New obstacles:** none. Everything stands where the game's obstacles already are (bar, piano, tables).
- Everything here stands on the floor's top, y .18. The bar top is at 1.18.

### Interiors 4: First Dark Bank (approved) · `guBank(g)` → `{obs}`, `guVaultDoor(hinge, VR)` → `{wh, dial}`
- **Shell call:** unchanged (it keeps its panelling; everything at the walls below 1.2 stands .24 off them).
- **Remove the game's meshes** (keep every `ob`, `prop`, light, the clock group and the whole vault logic): the eight
  brass posts and their balls, the two rope cylinders, the plant pot and plant, the teller counter's base box and
  glass box, the three teller desks and their black boxes.
- **The vault door:** keep the `hinge` group, the wall pieces, the rings, the collar torus, the VAULT label, the gold,
  the bags, `dob`, `vopen` and the prop. Instead of adding the door cylinder, the two hinge barrels, the wheel group,
  the dial and the eight bolt heads to `hinge`, call `const VD = guVaultDoor(hinge, VR)` and use `wh = VD.wh` (the
  rob code spins `wh`, and it sits where the old wheel did). Everything in it is `dpKeep`.
- **New obstacles** (push `obs`): the two marble columns (466, cz±5.5), the two writing tables, the two clerks' desks
  (478, cz±4.5) and the two safe-deposit walls (x 481..489 against the side walls). The way from the door through the
  ropes, the gap in the counter (cz±1.1) and up to the vault stays clear.
- Everything here stands on the floor's top, y .18.

### Interiors 5: the Chapel of the Closed Door (approved) · `guChapel(g)` → `{obs, flames, rope}`
- **Shell call:** unchanged (it keeps its panelling, stained glass and back window).
- **Remove the game's meshes:** the aisle runner box, the six altar candles and their flames (keep the light `cl2`
  and its flicker `anim`), the eight pews (seat, back, two ends each), the altar box and the gold cross (two boxes).
- **Remove the game's obstacles** for the old pews (`ob(475, 481, pz - .3, pz + .3)`, eight of them) and the altar
  (`ob(493, 495, cz - .4, cz + .4)`). `guChapel` returns the new ones: 18 pews facing the altar (x 468.5..484.5,
  either side of a 2 m centre aisle), the altar rail (x 489.6, with a gap at cz±1.1), the altar (turned: x 493.45..494.5,
  cz±1.25), the pulpit and its steps, the lectern, the organ and the font.
- **The bell rope** hangs at the ring prop (466, cz-3). In the ring prop's anim you can also swing it:
  `rope.rotation.z = Math.sin(t * 6) * .12 * Math.max(0, 1 - t / 3)`. It is `dpKeep`.
- **Animate (optional):** `flames` wobble like the saloon's.
- The back window's arch frame and the glass above its head are drawn at the game's window height (y 1.2..2.6
  above 0); the rest stands on the floor's top, y .18.

### Batch 4a: water tower and station (approved)
**Water tower** · `guWaterTower(g, 532, -1500)` → `{obs}` (and the helper `guCurvedSign`)
- Replaces the game's four leg cylinders, the tank cylinder, the cone roof and the `DUSTY GULCH` label. Keep `loc`.
- Replace its `ob(tx-3, tx+3, tz-3, tz+3)` with the returned obstacles: four footings and the trough. You can now walk
  under the tower, between the legs.

**Station** · `guStation(g)` → `{obs, plate}`
- The rails are at `RAIL.z` -1640 and the cars are 2.8 wide, but the game's platform was centred on z -1629, 6 m from
  the track. The new platform runs x 420..480, z -1638.4..-1629.4, top y .6.
- Remove the game's platform box, its six posts, its canopy box, the `DUSTY GULCH / TRAIN STOPS HERE` label (the
  canopy now carries it on a hanging board) and the bench's four boxes.
- Replace the platform's `q.plates` entry with the returned `plate`. Push `obs` (the station house, the bench, the
  luggage cart).
- Move the timetable prop from `(sx + 8, sz)` to `(458, -1634.9)` (in front of the new board, on the platform). `loc`
  and the train's stop (`HS` 482, the arrival hint that checks distance to (450, -1629)) can stay as they are.

**The trains' water tank** · `guTrainTank(g, 488, -1634)` → `{obs}`. New, past the platform's east end. Push `obs`
(four footings). The spout arm is folded up, clear of the train.

**One more thing found in the game's code:** the "taxi stand" hitching rail at (470, -1448) (two posts, a rail and
`ob(468, 472, -1448.2, -1447.8)`) stands inside the bank's lobby. Remove it; the street has its own rails now.

### Coming next
- **Interiors (the user asked for these too):** one batch per building, for the diner, Bob's, the saloon, the bank
  and the chapel. They keep every prop, mission spot and moving part (the jukebox, Bob, the piano, the vault).
- Then the water tower, Sunny Acres and the station.
