Status: plan approved 2026-10-19 · batch 1 (turns, floor pools, the bug fix, floor 1's rooms, the jog room) approved · ready to build · batch 2 (floor 2's rooms) approved · ready to build · batch 3 (floor 3's rooms) approved · ready to build · batch 4 (floor 4's rooms) approved · ready to build (all batches done)

# The hotel remodel: more room types and more turns

The user, 2026-10-19: the whole hotel needs a remodel with a lot more room types and more turns, so it looks good and
is more entertaining. The floor looks (hotel-loop.md B1) are the first step. This is the plan for the rest.
Line numbers are in `src/bak519.html` unless another file is named.

## What the hotel has now
- **Every ordinary room is the same box**: 8 m wide (HX 4), 4 m tall, 16-26 m long, door at the far end.
- **Half of the ordinary rooms** (doors 3-98, not every 5th) get a special type from `wt0` (line 14423), each about
  1 in 32: side rooms (`rooms`), an L arm (`L`, `L2`), a cellar, three libraries, a garden, a catwalk, an intersection,
  T and X junctions, a ballroom, a warehouse, vents. Rarer ones on top: flood, press, casino, Jeff's shop, the pets.
- **70% of the rest** get a hall variant from `mkHallVar` (12513): columns, zig-zag walls, lanes, an island,
  arches, a dining table, a fountain, a gallery, ducts, rubble, a study, aisles, a split hall. These are dressing inside
  the same 8 m box.
- **Streaks** take over some stretches: offices, the archive, the stairwell.
- **Turns** (dx590): about 1 eligible room in 2 can put its exit in a side wall near the far end; never two corners in
  a row; many room types can't turn at all (catwalks, vents, flood, press, the big library, T, X, intersections).
- **A bug:** the type roll picks from the first 16 of 19 names (`[...][Math.random()*16|0]`), so **suites and service
  rooms (laundry, kitchen, bathroom, luggage, gym) never come up** on their own.

**What feels flat:** the same width and height in almost every room, flat floors, no rooms you look *down into* or
*across*, the same room types on every floor, and long straight runs between corners.

## The plan
### 1. Each floor gets its own room pool
The type roll draws from the floor's pool (hotel-loop.md B3 has the floors), so each floor feels like a different part
of the hotel. Old types stay, sorted where they fit; the new ones (2) are spread over the floors.

| Floor | Old types it keeps | New types (2 below) |
|---|---|---|
| 1 Guest Floors | side rooms, suites, L arms, garden, ballroom, gallery, dining, fountain, study | guest corridor, lounge bar, grand staircase, restaurant, games room |
| 2 Old Wing | the three libraries, catwalk, cellar, columns, arches, study | chapel, theatre, portrait hall, nursery, dead conservatory |
| 3 Staff & Service | service rooms, warehouse, vents, ducts, lanes, aisles, press | kitchen, laundry hall, boiler tunnels, switchboard, staff canteen, linen stores |
| 4 Deep Hotel | flood, cellar, rubble, catwalk, junctions | drained pool, bathhouse, collapsed floor, sunken lounge, flooded ballroom |

### 2. Twenty new room types
Each is a real layout, not just dressing: different widths, heights, levels or shapes. Every one still has one way in
and one exit, works with the turn system where marked, and has dressers/wardrobes in sensible places so drawers,
hiding and Rush still work.

**Floor 1**
1. **Guest corridor**: a narrow 4 m hall lined with numbered guest-room doors every 3.5 m, both sides; a few stand
   open into small bedrooms with a bed, a lamp and a dresser. Can turn.
2. **Lounge bar**: a wide room (HX 7) with a long bar, stools, armchairs round low tables and a piano. Can turn.
3. **Grand staircase**: a two-storey atrium. You come in on a balcony and walk round it, then down a curved staircase
   to the floor below, where the exit is. The showpiece; about 1 per floor.
4. **Restaurant**: round tables with cloths and chairs in a grid, a host stand, a kitchen door (fake). Can turn.
5. **Games room**: billiard tables, a dartboard, card tables, a jukebox.

**Floor 2**

6. **Chapel**: pews in two rows, an aisle, an altar under a round window, candles.
7. **Theatre**: rows of seats stepping down to a stage with a curtain. The exit is beside the stage.
8. **Portrait hall**: a tall (6 m), narrow hall with huge portraits and suits of armour; the eyes are painted.
9. **Nursery**: a playroom with a rocking horse, blocks, a cot and a music box that plays when you pass. Can turn.
10. **Dead conservatory**: a glass-roofed room with dead plants, cracked panes and a stone path. Can turn.

**Floor 3**

11. **Kitchen**: steel counters in rows, stoves, hanging pans, a walk-in fridge you can hide in. Can turn.
12. **Laundry hall**: rows of big washers and dryers, laundry carts, lines of sheets you walk through. Can turn.
13. **Boiler tunnels**: low (2.6 m), narrow tunnels with pipes, a couple of bends inside the room, steam puffs.
14. **Switchboard**: an old telephone exchange with operator desks, cables and a ringing phone. Can turn.
15. **Staff canteen**: long tables and benches, a serving counter, lockers. Can turn.
16. **Linen stores**: shelving aisles of folded sheets and towels (a maze of three aisles, like a library).

**Floor 4**

17. **Drained pool**: an indoor pool with no water. You walk down the steps into the empty tank and out the other
    end. Tiles, a high diving board, rust.
18. **Bathhouse**: steam, a tiled floor with two baths sunk into it, benches and changing booths (hiding spots).
19. **Collapsed floor**: half the floor has fallen to the room below. You cross on the joists and planks; the drop is
    real but only 2 m (a small fall, not death).
20. **Sunken lounge**: three steps down into a wide, wet lounge with sofas round a dead fireplace, then up again.

### 3. More turns
- **Turn more often:** the corner chance goes from about 1 in 2 to about 2 in 3 of eligible rooms, and more room types
  may turn (the new ones marked "can turn", plus the libraries B and C, the garden, the ballroom and the warehouse).
- **S-bends:** a left corner may be followed straight away by a right one (or the other way round), so the run zig-zags.
  Two corners the same way in a row stay banned (it would come back on itself).
- **Jog rooms (new shape):** the room shifts sideways 3-4 m half-way along through a short angled section, so you
  can't see the exit from the door. Works with any plain hall and most hall variants.
- **Inner corners:** the guest corridor, the boiler tunnels, the linen stores and the laundry hall can bend once
  *inside* the room (an L-shaped room), as well as having a side exit.

### 4. Rhythm
- **Widths and heights vary:** narrow rooms (HX 2-2.5), normal (4), wide (6-7), tall (6 m), low (2.6 m). Two narrow or two
  wide rooms in a row are avoided.
- **Levels:** the grand staircase, the theatre, the drained pool, the sunken lounge and the collapsed floor go up or
  down. The next room always starts back at the normal floor height.

### 5. The bug fix
- The type roll uses the whole list (suites and service rooms come back), and the new floor pools replace that list.

## Batch 1 (approved; models: `docs/design/models/hotel-rooms.js`, needs `hotel.js` loaded first; preview "Hotel Rooms 1")
### How the room models plug in
- Every builder is `hrmXxx(g, o)` with `o = {L, HX, HY, seed, mat(key, a, b), floorNo}` and builds into `g` (the room
  group `G`) in room-local coordinates (entry wall z 1, exit wall ez = -L-1, floor y 0). It returns:
  `obs` (push into `obs0`), `occ` (push into `occ`, so the game's wardrobes and dressers keep off those walls),
  `ward` (wardrobe spots: put the game's wardrobe there, `x, z, ry`), `trimGaps` (wall stretches where the wainscot,
  chair rail and baseboard must stop: guest doors, the kitchen doors), `lamps` (extra lights for `RL`), `anims`
  (per-frame callbacks), and per room: `open` (wings), `rf`/`up`, `path`/`inside`/`DX` (the jog room).
- `mat(key, a, b)` must return the room's own material for `wall`/`wains`/`floor`/`ceil`/`door` (the game's `T()` with
  the floor-look swaps), so the new rooms take each floor's look.
- All their random choices come from `hflRng(seed)` (use the room number), never `Math.random`.
- Mark everything they build `userData.noSeam = true`.
- **The floor height needs x as well:** `rfn(P.z)` becomes `rfn(P.z, P.x)` (and `crkGround` the same); the existing
  `rf` functions ignore the second argument. The grand staircase needs it.
- **Wings must use the room's HX:** the wing code in `mkRoomRaw` writes `s*4` for the wall line and puts the header
  over the opening at y 3..4. It should use `s*HX`, and a wing may give `hh` (the opening height; the header then
  runs from `hh` to `HY`). The guest corridor's bedrooms are wings with `hh` 2.2.
- Lamps: rooms lower than 4 m put the centre lamps at `HY - .1` (the game's `LY` is 3.9 or 4.2 now).

### The rooms (floor 1's pool)
| Room | Size | What's in it | Notes |
|---|---|---|---|
| `hrmGuestCorr` guest corridor | L 24-30, HX 2, HY 3.6 | a red runner, numbered guest doors every 3.5 m on both sides (staggered), brass sconces between them, one open bedroom per side | doors are fake (on the wall) except the two open ones (wings: `open`, d 3.6, hz 1.8, g .55, hh 2.2). Each bedroom: double bed, nightstand and lamp, picture, rug, a wardrobe spot. Some doors have a DO NOT DISTURB hanger. Can turn. |
| `hrmLounge` lounge bar | L 26, HX 7, HY 4.5 | a 9 m bar on one wall (back-bar shelves of bottles, mirror, counter with a brass foot rail, 9 stools, 3 pendants), three groups of four armchairs on rugs, a grand piano | the bar side is in `occ`. Can turn. |
| `hrmGrand` grand staircase | L 28, HX 7, HY 9, **UP 4.5** | a central flight up to a landing, two side flights up to a balcony across the far end, white balusters and dark rails, a big chandelier, a clock under the balcony, two portraits; the marble tops share one tile grid (`hrmSlab`, UVs from room coordinates) so the squares line up | the exit door is on the balcony (`up` 4.5, the next room starts up there). Heights from `hrmGrandRF(x, z)` (`rf`); the balustrades are thin obstacles. No centre lamps (it returns its own). No turn. At most one per floor. |
| `hrmRestaurant` restaurant | L 24, HX 6, HY 4 | 8 round tables with cloths, candles and plates in two rows (a clear middle aisle), a host stand by the door, kitchen swing doors (fake) with a dessert trolley, a waiter's station | Can turn. |
| `hrmGames` games room | L 22, HX 5, HY 4 | two billiard tables (racked balls) under green three-shade lamps, a cue rack and bead scoreboard, a dartboard with its throw line, a card table with chips, a glowing jukebox | Can turn. |

### The jog room (any floor)
- `hrmJog(g, {L, HY, J, mat, col})` builds the **whole shell** (floor, ceiling, walls with trim, the exit wall);
  the game's own side walls, floor and ceiling are skipped for it. J is the sideways step (±3.5 m), HX 4.
- Part A runs from the door to `zA = -0.4 L`, a 3 m angled part, then part B to the exit, which is at `DX = J`
  (the game already supports an off-centre exit door: `dd.cx`).
- It returns `path` (for Rush and Ambush), `lamps` (down the middle line), `inside(x, z)` (use it instead of the
  `|x| <= HX` bounds check) and `DX`.
- Plain jog halls, or with the gallery variant only. It can't also turn at its exit.

### Turns
- `turnOK`: the chance goes from .55 to .7; the room types allowed to turn add the guest corridor, lounge, restaurant,
  games room, libraries B and C, the garden, the ballroom and the warehouse.
- **S-bends:** a corner may follow a corner if it turns the **other way** (left after right or right after left); the
  same way twice stays banned. `turnOK`'s "never two corners in a row" becomes "never two the same way in a row".
- Jog rooms: 1 in 8 plain halls on every floor (not the first 2 rooms of a floor, not next to a corner).

### Floor pools and the bug fix
- The type roll (line 14423) takes its list from `HFLPOOL[hflFloor(nn)]` (the table in "1. Each floor gets its own
  room pool" above; types not built yet are left out until their batch ships). Floor 1 now: rooms, L, L2, suite,
  svc, garden, ball, guest corridor x2, lounge, restaurant, games, and the grand staircase (once per floor, door 8+).
- The roll index uses the list's real length (`Math.random()*list.length|0`), so suites and service rooms appear.

## Batch 2 (approved; floor 2's rooms; models appended to `hotel-rooms.js`; preview "Hotel Rooms 2", in the Old Wing look)
New return fields: `noLamps` (the room lights itself: skip the centre lamps, use `lamps`), `noFloor` (skip the game's
floor box), `noCeil` (skip the game's ceiling), `noEvents` (no Rush or Ambush in this room), `musicBox` (a point for
the music-box sound), and `anims` callbacks now get `(dt, t, cam)` (the camera position).

| Room | Size | What's in it | Notes |
|---|---|---|---|
| `hrmChapel` chapel | L 24, HX 5, HY 6 | 11 rows of pews either side of the aisle, a dais (.2 m) with a stone altar, cloth, candlesticks and a book, iron candle stands, a lectern, a round stained-glass window over the exit door, a hymn board, three hanging iron lanterns | `rf` = `hrmChapelRF` (the dais). The **confessional** at the back is two hiding spots (`ward` entries with `booth: 1`: use the wardrobe hide logic; the curtains don't need to move). `noLamps`. Can turn. |
| `hrmTheatre` theatre | L 26, HX 6, HY 6.5 | an entry landing, 12 rows of red seats stepping down (aisles in the middle and both sides), the pit, a centre stair up to the stage, footlights, a gilt proscenium, red curtains and valance, a chair in a spotlight, the ghost light, sconces | `noFloor` (it builds its floors and the walls below y 0), `rf` = `hrmTheatreRF(z, x)`, `noLamps`. Seat rows and the stage edge (except the stair) are obstacles. Wardrobes in the wings. No turn (the exit is on the stage). |
| `hrmPortraits` portrait hall | L 26, HX 3, HY 6 | six big portraits with gilt frames and picture lights, alternating sides; **their pupils follow you** (in `anims`); a suit of armour with a halberd on a plinth opposite each; brass posts and red ropes keep you to the middle; a runner | `noEvents` (the ropes leave nowhere to hide until the far end, where there are two wardrobes). No turn. |
| `hrmNursery` nursery | L 20, HX 4.5, HY 3.6 | a paper frieze of ducks and clouds, a letter rug, a rocking horse that rocks by itself, a cot with a turning mobile, toy blocks (and a little tower), a tea table with small chairs and cups, a dollhouse, a toy train going round its oval track, a toy chest, a music box with a turning dancer on a shelf | `musicBox`: play a short music-box tune when a player comes within 4 m (once per visit). The toy cupboard is a `ward` spot. Can turn. |
| `hrmConservatory` dead conservatory | L 24, HX 5, walls 3 m | glass clerestory (3-4 m) and a pitched glass roof to a 6 m ridge on iron frames, glass gables, ~10% of panes missing and some cracked, brick planters of dead plants, a dead tree in a round planter, a stone path, a stone bench, pots, a watering can, a dry basin, broken glass, dead creepers, two lanterns, cold moonlight | build with HY 3 and `noCeil`; `noLamps`. The glass is transparent (`depthWrite: false`). Two potting-shed `ward` spots. Can turn. |

- The guest corridor's wardrobe spot (batch 1) now faces into the bedroom (`ry` 0).
- Checker: clean apart from the usual trim end faces against walls, and the preview's stand-in wardrobes.

## Batch 3 (approved; floor 3's rooms; models appended to `hotel-rooms.js`; preview "Hotel Rooms 3", in the Staff & Service look)
New fields: `ward` entries can have `noModel: 1` (the room already shows the hiding place: a staff locker or the
cold-room door; use the hide logic but don't place the game's wardrobe), `locker: 1`, `cold: 1`; `dres` entries can
have `cabinet: 1` (a filing cabinet: use the drawer loot logic); `noShell` (the room builds its whole shell);
`doorH` (the exit door is this tall; scale the door leaf); `phone` (a point for a ringing-telephone sound).

| Room | Size | What's in it | Notes |
|---|---|---|---|
| `hrmKitchen` kitchen | L 24, HX 5, HY 3.6 | six stoves under a long steel hood (pots, a frying pan, one oven glowing), three sinks with taps, two steel prep tables with boards and bowls, pan racks hanging over them, bins and a mop bucket | hiding: the **cold room** door near the end (`cold`, `noModel`) and two of four **staff lockers** by the door (`locker`, `noModel`). Can turn. |
| `hrmLaundryHall` laundry hall | L 26, HX 5, HY 4 | six big washers a side (some drums turning), three stacks of dryers a side, two folding tables with folded linen, three laundry carts, **four lines of hanging sheets across the hall** that sway; you walk through them (not obstacles) | two linen-cupboard wardrobes at the far end. Can turn. |
| `hrmTunnels` boiler tunnels | L 22, path half-width 1.3, height 2.6 | a low concrete tunnel with **two bends** (down, across 4.5 m, down, back across, down to the exit), a drain channel, three pipes under the ceiling that follow the bends, hangers, two red valve wheels, gauges, a DANGER HOT PIPES sign, steam puffs at the bends, caged bulkhead lamps | `noShell`: it builds everything. Use `path` for Rush/Ambush, `inside(x, z)` for the walls, `lamps`. The exit door is 1.6 x 2.4 (`doorH`); a header fills the gap over the previous room's 3 m door. One maintenance-cupboard wardrobe in the far bend. No turn. |
| `hrmSwitchboard` switchboard | L 20, HX 4.5, HY 3.6 | eight switchboard sections a side (jack panels with lamps, key shelves, patch cords, headsets, swivel chairs), a supervisor's desk with a typewriter, a green lamp and a **ringing telephone** (it shakes; `phone` for the sound), two filing cabinets (`dres`, `cabinet`), a cable tray, a SILENCE PLEASE sign | two wardrobes by the door. Can turn. |
| `hrmCanteen` staff canteen | L 22, HX 5, HY 3.6 | a serving counter with food wells, a sneeze guard, a tray slide, trays, an urn; six long tables with benches (some trays, plates and mugs left out); eight lockers at the far end (two are hiding spots), a notice board, bins, a clock | Can turn. |
| `hrmLinen` linen stores | L 24, HX 5, HY 4 | three runs of double-sided steel shelving full of folded linen, with **gaps to cross between them** (a small maze), end labels, a rolling ladder, laundry bags, a check-in desk with a ledger and a bell | two linen cupboards at the far end. Can turn. |

- The floor-3 strip light's end caps (hotel.js) are a little taller now so the tubes sit inside them.
- No inner bends in the laundry hall, linen stores or guest corridor after all (the plan's "inner corners"): the boiler
  tunnels have them, and the turn system already bends the rest.
- Checker: clean apart from the usual trim end faces and the preview's stand-in wardrobes.

## Batch 4 (approved; floor 4's rooms; models appended to `hotel-rooms.js`; preview "Hotel Rooms 4", in the Deep Hotel look)
| Room | Size | What's in it | Notes |
|---|---|---|---|
| `hrmPool` drained pool | L 28, HX 7, HY 6 | an empty tiled pool (|x| < 4, z -5..-22): eight steps down the whole width at each end, the floor slopes from 1.2 m to 2.2 m deep and back; lane lines, old green water in the deep end, dead leaves, depth marks, chrome ladders; a tiled deck round it with coping, a springboard, a lifeguard chair, loungers | `noFloor`, `rf` = `hrmPoolRF(z, x)`. The tank's long sides are obstacles, so you go down the steps (or round the deck). Two changing-booth wardrobes on the near deck; the side walls by the tank are in `occ`. Can turn. |
| `hrmBathhouse` bathhouse | L 24, HX 5.5, HY 4.5 | its own tiled floor with **two baths sunk into it** (murky water 25 cm down, a step inside, a raised rim, a dripping brass spout, steam drifting up), slatted benches with towels on hooks, wooden buckets | `noFloor`. The baths' rims are obstacles. **Three curtained changing booths** are the hiding spots (`booth: 1`). Can turn. |
| `hrmCollapsed` collapsed floor | L 24, HX 4.5, HY 4 | the floor is gone from z -5 to -17: joists across the hole (some broken), **two planks wide of walkway that zig-zags across them**, ragged broken boards at both edges; 2 m below, the room under it (rubble, a fallen chandelier, a broken bed, a dim red light) and **a rubble slope up to the far floor**; torn caution tape and a FLOOR UNSAFE sign | `noFloor`, `rf` = `hrmCollapsedRF(z, x)`: off the planks you fall 2 m (no damage), and the slope brings you back up. Both walls over the hole are in `occ` (wardrobes only on the solid floor). No turn. |
| `hrmSunken` sunken lounge | L 24, HX 6, HY 4 | three steps down at z -5, a wet dark lounge at -.45 m with standing water, three steps up at z -17; a dead fireplace with ash, charred logs and a dark mirror, three sofas in a U on a rug, a coffee table, a knocked-over floor lamp, a dead palm, a drinks cart | `noFloor`, `rf` = `hrmSunkenRF(z)`. Wardrobes on the upper floors at each end. Can turn. |

- The "flooded ballroom" in the pool table above is the game's existing flood room on floor 4; no new model.
- Checker: clean apart from the usual trim end faces, faces hidden under floors, and the preview's stand-in wardrobes.

## Work in batches (each with a preview, like the prison)
1. **Batch 1:** the turn and jog-room rules, the floor pools, the bug fix, and the floor 1 rooms (1-5).
2. **Batch 2:** floor 2 rooms (6-10).
3. **Batch 3:** floor 3 rooms (11-16).
4. **Batch 4:** floor 4 rooms (17-20).
5. **After that:** the desert mines loop and remodel (remodel-list.md).
