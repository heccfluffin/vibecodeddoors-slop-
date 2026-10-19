Status: plan in review (2026-10-19)

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

## Work in batches (each with a preview, like the prison)
1. **Batch 1:** the turn and jog-room rules, the floor pools, the bug fix, and the floor 1 rooms (1-5).
2. **Batch 2:** floor 2 rooms (6-10).
3. **Batch 3:** floor 3 rooms (11-16).
4. **Batch 4:** floor 4 rooms (17-20).
5. **After that:** the desert mines loop and remodel (remodel-list.md).
