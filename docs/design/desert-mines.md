Status: all ideas picked 2026-10-22 (A to H) · part 1 (A, B, C, D, H: the rules) approved 2026-10-22 · part 1 models: batch 1 (the blocked doors) approved, batch 2 (things in the rooms) approved, batch 3 (the creatures) approved 2026-11-05 · **part 1 ready to build** · part 2 (F) plan approved 2026-11-05, models batch 1 (the looks and the stations) for review · part 3 (E, G) still to design

# The Desert Mines: how the run plays now, and what to change

This is about the **Desert Mines run** ("DOORS BUT DESERT"): doors 1 to 100 under the desert, reached by BUS 13 and the
mining shack's cage (or the 1-in-100 old shaft in the quarry mine, which drops you at door 60). It lives in
`src/bak519.html` under `DSRT` (line numbers below are in that file). The **quarry mine** under the Old Quarry's
headframe (`MN`, `mnGen`, the biomes, the shift and the smeltery) is a different thing and already has its own spec,
`quarry-underground.md` (ready to build). The two only meet at the old shaft.

## How a run plays now
- **Getting there:** BUS 13 from the lobby (22 s ride), roam the desert, press E on the DOORS BUT DESERT MINING Co.
  shack, ride the cage down 48 m (co-op: the cage waits for everyone). `desertStart` (7860) starts the run with
  `RUNMODS=['curse']` and the sandy tint. You get a pickaxe on the first frame.
- **The rooms are hotel rooms with a mine skin.** `mkRoomRaw` builds them, `MINE` (14420) switches off offices,
  archives, stairs, every side wing, locked doors and dark rooms, and `desertDecor` (7997) swaps the textures to rock,
  dirt and planks. About half the rooms are plain 8 x 4 m tunnels with a timber set every 3.2 m; the rest get one of
  eleven shapes (cavern, chasm, zigzag, pillars, collapsed, crystal, junction, stream, pinch, dig, cart puzzle).
  Corners come from the turn system.
- **Every door is boarded:** three pickaxe swings (one with the steel pickaxe from door 35), or sprint into it.
- **Every sixth room is a cave-in:** search crates for dynamite, plant it, walk the wire back, push the plunger (or
  dig ten swings).
- **Fixed set pieces at fixed doors:** the minecart chase 25-34, the steel pickaxe at 35, Figure's mineshaft at 50,
  Seek's sewer chase 65-74, Seek's dam at 100, then the exit.
- **Threats:** the normal hotel creatures, plus the Pharaoh's curse every 1-2 minutes (carry the slab back within 20
  seconds or the room fills with sand).
- **Rewards:** +100 gold for getting out, +30 per curse returned, eight badges. `SV.dwin` (mines escaped) is saved but
  never shown, and the win screen still says you "walked out of the hotel".

## What makes it weak
1. **A mines mode where you never mine.** No ore, no haul, no economy; the pickaxe is only a door key, and the "ore
   glints" in the walls are paint. Nothing you do down there carries over to the quarry, the smeltery or your stats.
2. **One verb, about 80 times.** Swing at boards. After door 35 (or with a sprint) it is one hit, so the main obstacle
   stops mattering for two thirds of the run.
3. **The same cave-in about 16 times a run**, identical every time, and skippable by digging.
4. **The room shapes are scenery.** You can't fall into the chasm or the stream, the junction's lever does nothing,
   the crystal room only changes the light colour, there's no jumping.
5. **The hotel with things taken away.** No side rooms, keys, dark rooms, shop or surprises, and half the rooms are the
   same plain tunnel. No sense of going deeper: door 90 looks like door 9.
6. **Few mine dangers.** The curse is the only one and it repeats in exactly the same form.
7. **Same set pieces at the same doors every run.** They're the best parts, but you know when each is coming.
8. **Flat rewards** and some leftovers (below, H).

## Ideas to pick from

### A. Mine for real
- Ore veins in the run's rooms (copper and iron near the top, silver and gold deeper, crystal and diamond rare, deep
  down). Swing to break them; ore goes in a satchel (limited space, upgradable from the quarry's satchel level).
- **Ore carts at checkpoints** (every 10 doors or so): tip your satchel in to bank it. Die and you lose what you carry,
  not what you banked.
- At the exit your haul turns into gold, and the banked ore also lands in the smeltery's bin up top (so the run feeds
  the quarry tycoon, and the quarry's upgrades help the run).
- A haul counter on the HUD and on the win screen.

### B. Mix up the doors (not just boards)
A pool of blockers, more of the hard ones deeper down: **boards** (pickaxe or shoulder), **rubble** (dig, or blast
with dynamite you carry), **iron grate** (find the wrench in the room, or pull a lever that's somewhere else in the
room), **cart door** (the cart puzzle, more often), **flooded passage** (turn the pump valve and wait while the water
drops), **crawlspace** (crouch through, something may follow), **rope bridge** over a real chasm (one of two bridges
is rotten). The steel pickaxe still helps with boards and rubble, but not the rest.

### C. Real dangers in the rooms
- **Chasms you can fall into** and narrow ledges to jump (the quarry mine's jump code already exists).
- **Gas pockets:** your lamp flame turns blue and flickers; get through quickly or you black out (damage, not death
  at first). Dynamite in gas is a very bad idea.
- **Rockfall:** dust trickles from a spot on the roof for a second, then rocks come down. Step out of the way.
- **Rising water** in flooded rooms: wade fast or swim (air bar, as at the dam).
- **Lamp oil:** your lamp slowly runs down; oil cans in crates and drawers. Out of oil, it's dark (you can still see
  a little, and the dark brings out things in D).

### D. Three mine creatures (built from models the game already has)
- **The Runaway Cart** (instead of Rush in the mines): rumbling on the rails, a light coming down the tunnel; get into
  a side alcove or off the rails. It smashes boards and crates on the way, so it can also help you.
- **Bats** (instead of Screech): a swarm comes out of a dark hole if your lamp is low or you're loud; cover the lamp
  (hold a key) until they pass, or they knock you down and steal ore.
- **The Burrower** (the dam's worms): too much mining noise in one room and it bursts out of the wall where you dug;
  run to the next room. It's why you can't just mine every vein.
- The Pharaoh's curse stays, but with three forms (the slab, a sand-fall timer, mummy hands from the floor).

### E. Shuffle the set pieces
Pick four or five per run from a bigger pool, in door ranges instead of fixed doors: the **minecart chase**, **Seek's
sewer**, **Figure's mineshaft**, plus new ones: a **flooded gallery** you cross on a raft, a **crystal cathedral**
(a big cave puzzle with light beams and mirrors), a **collapsing stope** (run while the floor drops away behind you),
a **cage lift** ride with something on the roof, an **underground lake** with a rowing boat in the dark. **Seek's dam**
stays the finale at 100.

### F. Go deeper: levels and more turns (this is the remodel)
- **Five levels**, each about 20 doors, joined by a cage lift or a long ladder: **1 Old Workings** (timber, rails,
  lanterns), **2 Crystal Caves** (blue glow, big caverns), **3 The Flooded Level** (water, pumps, mud), **4 The Hot
  Rocks** (magma glow, heat haze, basalt), **5 The Deep** (pitch black, huge spaces, old bones). Each has its own room
  pool, look, ore, music and dangers, so door 90 feels very different from door 9.
- **More room types and more turns:** sloping tunnels (going down), T-junctions with a dead end and something in it,
  forks where both ways rejoin, shafts with ladders, wide galleries, stopes, ore chutes, a pump room, a powder
  magazine, a miners' canteen, a lamp room, an old office. These get models from the design chat, like the hotel's room
  batches.
- Rooms made from real cave shapes instead of boxes (rough walls, uneven roofs), reusing what's being made for the
  quarry mine.

### G. Run goals, a shop and rewards
- **The Company Store** at door 60 (so the old shaft lands you at a shop, which finally makes sense): lamp oil, rope,
  dynamite, a better satchel, a helmet that takes one rockfall.
- **Contracts** before you go down (the foreman's board at the shack): "bring out 5 gold ore", "find the lost miner's
  lunchbox", "no dynamite", "get out with your lamp still lit". Gold and badges for each.
- **A proper win screen:** haul, gold, doors, deaths avoided; the mines-escaped count shown in Stats.
- New badges for the new things (first diamond, survived the Burrower, every set piece seen).

### H. Fixes (whatever else is picked)
- Two badges share the id `miner` (Break On Through, and the quarry's Shift worker in dx581), so Shift worker can
  never show and a shift gives the board badge. Give Shift worker its own id.
- The win text says "walked out of the hotel"; give the mines their own.
- Show `SV.dwin` in Stats.
- Leftover "FLOOD n/10" and "THE DAM BURSTS" texts that can't happen any more; the bus stop comment says 60 s, the
  prompt 20 s.
- Door 60 means nothing in the mines (the shop is switched off there); G gives it a meaning.

## What I'd suggest
**A, B, C, D and H first** (they change what you do every minute and need few new models), then **F** (the levels and
the room remodel: that's where most of the model work is), then **E and G**. Nothing here touches the hotel run.

---

# Part 1: the spec for A, B, C, D and H (the game rules), approved 2026-10-22
The user picked everything (A to H), 2026-10-22. Order: **part 1** (this: A, B, C, D, H, the rules), then **part 2** (F:
the five levels and the room remodel, mostly models), then **part 3** (E and G: shuffled set pieces, the Company Store,
contracts). Part 1 needs a few small models; they come as one model batch once these rules are OK.

General rules for everything below:
- **Only in the Desert Mines run** (`DSRT.on`, and the Daily run's mine stretch where it says so). The hotel is untouched.
- **Co-op:** everything placed in a room is rolled in `mkRoomRaw` with the seeded `Math.random` (or `gemH` for looks),
  so every player gets the same room. Things that happen while you play (a rockfall going off, the Burrower waking, a
  bridge snapping, the Runaway Cart) are decided by the host and sent to everyone, like the curse and the chases.
- Line numbers are in `src/bak519.html`.

## A. Mining for real
**Veins.** Ordinary mine rooms (not set pieces, stations, door 50 or 100) get 2 to 5 ore veins on the walls: a patch of
rock with coloured lumps, at chest height, never behind a locker or in a doorway. Their ore depends on how deep you are:

| Doors | Ore you can find (most common first) |
|---|---|
| 1 to 20 | copper, iron |
| 21 to 40 | iron, copper, silver |
| 41 to 60 | silver, iron, gold |
| 61 to 80 | gold, silver, crystal |
| 81 to 99 | gold, crystal, and 1 room in 6 a diamond vein |

The ore types and values are the quarry's (`ORE`: copper 4, iron 6, silver 35, gold 80, crystal 120, diamond 220).
- **Mining a vein:** E with the pickaxe out, like a board. 3 hits (2 with the steel pickaxe; the quarry's pick upgrade
  takes one more off, never below 1). It gives 1 to 3 ore (diamond: 1) and goes dull. Hits make noise (see D).
- **The satchel:** you carry up to 12 ore (+4 for each level of the quarry's satchel upgrade; +6 from the store's
  bigger satchel, part 3). Full: "Your satchel is full. Find an ore cart." The HUD shows the satchel (ore count and
  its gold value) next to the gold.
- **Ore carts** stand in the room at doors 10, 20, 30 … 90 (moved one door on if that door is a set piece or a
  station). E at the cart tips your satchel in: that ore is **banked**. Every player banks their own.
- **When the run ends:** banked ore is always paid, win or die. Carried ore is paid only if you escape. The Company
  pays a quarter of the ore's value in gold (copper 1, iron 1.5, silver 9, gold 20, crystal 30, diamond 55), rounded
  up per run, times the run's gold multiplier. The same ore is added to `SV.mine.ore` (the quarry's lifetime count).
- **Losing ore:** bats steal 1 to 3 carried ore (D); falling into a chasm drops half your carried ore (C).
- **The quarry helps the run:** its pick level (fewer hits), satchel level (more space) and lamp level (the lantern
  lasts longer, C) all count down here. That's the link between the two.
- Badges: **Prospector** (bank 50 ore in one run), **Diamond in the Rough** (bring out a diamond).

## B. More kinds of blocked doors
Every normal exit gets one blocker, rolled per door. The chance of each changes with depth:

| Blocker | From door | Share at 1-20 / 21-50 / 51-99 | How you get through |
|---|---|---|---|
| Boards | 1 | 70% / 35% / 20% | 3 pickaxe hits (1 with the steel pickaxe), or barge through as now |
| Rubble | 8 | 20% / 20% / 15% | dig: 6 hits (4 with the steel pickaxe); or blow it with a dynamite stick (part 3's store, or a crate find); or the Runaway Cart smashes it |
| Iron grate | 12 | 10% / 15% / 15% | find the **wrench** hidden in the room (on a crate, a tool rack or the floor) and turn the bolts (3 x E); or pull the **lever** somewhere else in the room. The pickaxe does nothing |
| Crawlspace | 15 | 0 / 10% / 10% | the door is a low hole: crouch to go through (C). Bats and the Burrower like these rooms (D) |
| Flooded passage | 25 | 0 / 10% / 15% | the doorway is under water: hold E at the **pump valve** (4 s), the water drains in 8 s. You can wade in early: half speed, and your air runs down (C) |
| Rope bridge | 30 | 0 / 5% / 15% | the room is a real chasm with **two rope bridges**; one is rotten and snaps when you're halfway (you fall, C). A loose plank and a frayed rope give it away if you look |
| Cart puzzle | 8 | 0 / 5% / 10% | as now (`cartpz`) |

- **Cave-ins** stay but come every 9th door instead of every 6th (`nn%9==4`), and the crates have new joke finds.
- **The steel pickaxe** (door 35) still speeds up boards, rubble and veins, but not grates, water or bridges, so it
  stops being the end of the puzzle.
- The door blocker is part of the room roll (seeded, in `MP.gs` like everything else). The Runaway Cart opens boards
  and rubble it passes through, which can save you the work.
- Badges: **Grease Monkey** (open 10 grates with the wrench in one run), **Bridge Inspector** (pick the good bridge 5
  times in one run without falling).

## C. Real dangers in the rooms
**Jumping.** In mine runs, Space jumps and C crouches (now both crouch; the dam already has `damJump`). Jump height
about 0.9 m and 2.2 m across; you land on ledges and rocks through the room's height function (`rfn`), as at the dam.

**Falling into chasms.** The chasm room shape (and the rope bridge rooms) are real gaps now. Falling in: a 2 second
drop with the screen going dark, **40 damage** (60 from door 61), half your carried ore lost, and you climb out at the
room's entrance. It can kill you (tip: "Abyss"). Narrow places (2 m or less) can be jumped.

**Gas pockets.** From door 20, about 1 room in 10 (never two in a row). A faint green haze low in the room and a
hissing vent; your lantern flame turns blue as you walk in. After 3 seconds inside you take 4 damage a second, until you
leave the haze (it fills the room from the vent outwards over 20 s, so be quick). The gas is heavy: **crouching doubles the damage**, so stand up and walk out. Any
explosion in the gas (dynamite, a spark from the Runaway Cart) blows the room: 60 damage to everyone in it, and the
door's blocker is gone.

**Rockfall.** From door 10, 1 or 2 spots in some rooms (more deeper). When you walk within 3 m, dust trickles from the
roof for 1.2 s (a sound and a dust sprite), then rocks come down on a 2 m circle: **35 damage**, or none with the
helmet (part 3, it breaks). It leaves a small rubble heap you walk round. Each spot goes off once.

**Rising water.** The flooded passage door (B) and, from door 40, 1 room in 12: water rises slowly from the floor when
you enter, to 1.6 m in 30 seconds. Wading is half speed. When it's over your head your **air** runs down (a bar on
the HUD, 8 seconds), then 10 damage a second (tip: "Drowned"). Leaving the room resets it. This is the air bar the dam
was meant to have (`DAM.o2` is set but never used): build it once and use it in both.

**The lantern and the dark.**
- In mine runs you start with a lantern (`inv.n`, full) instead of nothing. It burns for 240 s as now (longer with
  the quarry's lamp upgrade: +25% a level).
- **Oil cans** (new item `oi`: +50% fuel) are found in drawers and crates in the mines instead of batteries (the
  flashlight keeps its batteries).
- **The rooms get darker as you go down:** doors 1-20 lit as now; 21-50 about half the room lights are out; 51-99 only
  the lanterns at the doors are lit (`dk` stays off: this is the mines' own dimming, and Screech stays out, see D).
- With the lantern out (no fuel, or turned off with L) it's very dark, bats come (D), and the gas pockets are hard to
  see. The flashlight still works if you have one.

## D. Three mine creatures (models the game already has)
**The Runaway Cart** (takes Rush's place in mine runs; same rolls, same delays, same warning time).
- The warning: a rumble and a squeal of wheels, the lanterns swing, then a light coming down the tunnel.
- It's a loaded ore cart with a lamp on the front (the minecart chase's cart), riding the rails down the middle of the
  rooms along Rush's path (`evPath`). It hits you if you're **within 1.5 m of the middle of the room**; standing
  against a wall, in an **alcove** (new: one or two niches cut into each mine room's walls, a few small rocks inside) or
  in a locker is safe. **70 damage.**
- It smashes boards, rubble and crates in its way (the door after it is open). In a gas room it sets the gas off.
- **Ambush in the mines is the Runaway Train:** three carts coupled, with Ambush's rules (back and forth, three passes).

**Bats** (take Screech's place in mine runs; Screech stays out of the mines as now).
- In dim rooms (from door 21) and anywhere when your lantern is out: squeaks from a dark crack in the roof, then a
  swarm in 2 seconds.
- **Turn your lantern off (L) or crouch** before they come and they fly over. Otherwise they knock into you: 15
  damage, and they steal 1 to 3 carried ore. They come at most once a room.

**The Burrower** (the dam's worm, bigger; from door 30).
- **Noise:** every pickaxe hit in a room (boards, rubble, veins) adds 1, dynamite adds 4. When a room's noise reaches
  12 (10 from door 61), the walls rumble for 3 seconds, then the Burrower bursts out of the wall where you last hit.
- It lunges after you through the room for 8 seconds at a fast walk (6.5 m/s), then pulls back into its hole. **45
  damage** if it reaches you. Going through the exit door escapes it (it never leaves its room). A locker works too: it
  searches for 3 seconds and goes.
- It's the reason not to mine every vein in one room: spread your digging out, or mine fast and run.

**The Pharaoh's curse**, three forms (rolled each time):
- **The slab** (as now).
- **The sand-glass:** a sand timer appears over the door: reach the next door within 25 seconds or the sand fills the
  room (as the curse's doom now).
- **Mummy hands:** for 15 seconds, hands reach up from the floor where you stand still: keep moving. Caught: held for
  1.5 seconds and 20 damage.
- Tips for each.

**Badges:** **Dodgeball** (survive 10 Runaway Carts in one run), **Lights Out** (let the bats pass 5 times),
**Worm Food** (escape the Burrower without being hit, 3 times).

## H. Fixes
1. **The badge clash:** the quarry's "Shift worker" (dx581) uses the id `miner`, which is already "Break On Through".
   Give it its own id (`shift`) and, for players who already finished a shift (`SV.mine.shifts>0`), award it on load.
2. **The win screen** in the mines: "YOU ESCAPED THE MINES · You came up the last ladder into the desert sun." plus the
   haul (A): ore banked and carried, gold for it, and the run's total.
3. **Stats:** add "Mines escaped" (`SV.dwin`) to the Stats panel (dx605 `mmStats`), and "Ore brought out".
4. **Leftovers:** remove the "FLOOD n/10" label and the "water is coming" line that can't happen any more (the mines
   go from 100 straight to the exit); the bus stop comment says 60 s but the prompt 20 s (make them agree: 20 s); the
   dam's hint says "1 damage every 0.3 s" but it's 2 every 0.1 s (make the hint right).
5. **Door 60:** the old shaft drops you at door 60, which means nothing in the mines. Part 3 puts the Company Store
   there.

## For the player (How to play and the changelog)
- How to play, Desert Mines tab: "Mine the coloured veins with your pickaxe and bank your ore in the carts every ten
  doors. Doors can be boarded, buried, barred or flooded. Jump with Space. Watch the roof, the gas and your lantern's
  oil. Get off the rails when you hear a cart."
- Changelog lines (players): "The Desert Mines: real mining. Ore veins, ore carts and a haul at the end." "New doors in
  the mines: rubble, iron grates, crawlspaces, flooded passages and rope bridges." "New dangers: chasms, gas, rockfall,
  rising water, and your lantern runs out." "New creatures in the mines: the Runaway Cart, bats and the Burrower."

## Models needed for part 1 (one batch, after these rules are OK)
Ore veins (six ores, a dull broken look), the ore cart checkpoint (the chase's cart, parked, with a sign), rubble
blocker, iron grate with bolts, wrench, lever, crawlspace door, flooded doorway with pump valve and water, two rope
bridges (good and rotten) and the real chasm edges, gas vent and haze, rockfall spot and heap, wall alcoves, oil can,
the Runaway Cart and the Runaway Train (from the chase cart), bats, the Burrower (from the dam's worm), the sand-glass and
the mummy hands. HUD icons: satchel, air bar.

## Part 1 models (`models/desert-mines.js`, needs `fort-kit.js`, `route13.js` and `mesa-gorge.js`)
Door space: each blocker is built round a doorway at the origin (the door in the plane z 0, the room on +z, the opening
x ±0.8, 3 m high, as `mineDoor` builds them); put the group at the door of the room it blocks. Every material has
`userData.gd = 1` so the mines' sandy tint leaves it alone.

### Batch 1: the blocked doors, approved 2026-11-05 · `dmRubble`, `dmGrate`, `dmWrench`, `dmLever`, `dmCrawl`, `dmFlood`, `dmChasm`
- **Rubble** (`dmRubble(g)`): a rock fall burying the doorway, with a broken prop and a cracked lintel in it. The rocks are dropped one by one onto the heap (`dmPile`), so each rests on the ground or on the rocks under it, over a dirt core that shows between them. Six layers;
  `setDig(k)` clears them from the top as you dig (k = hits done / hits needed), leaving a few stones. Obstacle until
  clear. Dynamite or the Runaway Cart clear it at once.
- **Iron grate** (`dmGrate(g)`): a rusty barred gate in a bolted frame across the doorway, a DANGER · NO ENTRY plate,
  hinged on the left. Three latch bolts on the right: `setBolt(i, k)` turns each out as you use the wrench (one E each);
  then the gate swings open (`parts.leaf.rotation.y` to -1.75). **The wrench** (`dmWrench()`) lies somewhere in the room
  (on a crate, a tool rack or the floor). **The lever** (`dmLever(g, x, z, ry)`): a lever box marked GRATE on a timber
  post against a wall, with a cable up to the roof; pull it down (`parts.handle.rotation.x` from 0.35, up, to 2.6, down; it leans out towards you either way) and the grate's bolts
  draw back by themselves.
- **Crawlspace** (`dmCrawl(g)`): a rock fall over the doorway with a timbered crawl hole (1.2 m wide, 1.05 m high,
  1.9 m long) through to the door. Obstacles: the rocks, and the hole as crouch-only (`cr: 1`).
- **Flooded sump** (`dmFlood(g, HX)`): the last 5.5 m of the room ramps down 2.2 m into a sump, and the door is at
  the bottom, under water. **The room's exit height is -2.2** (like the stair rooms' `UP`; the next room carries on from
  there), and `heightAt(z)` is the floor for the room's height function. The sump's sides and the end wall below the
  floor are rock (the doorway left open). A hand pump on the right wall (a pipe down into the sump, the pump body, a
  red valve wheel and a WATER gauge), and a FLOODED · PUMP IT FIRST sign. `setLevel(k)`: 0 full (just under the room
  floor) to 1 dry; the gauge needle follows. Hold E at the wheel (`parts.wheel` turns) for 4 s, then it drains over
  8 s. Wading in early: the water is over your head at the door (the air bar, C).
- **Chasm and rope bridges** (`dmChasm(g, HX, za, zb, {rotten})`): a real chasm across the room from `za` to `zb`
  (6 m in the preview): rock lips, rough walls going down 12 m into the dark, a faint mist far below, and two rope
  bridges at x -1.8 and +1.8 (1.1 m wide: posts, hand ropes, foot ropes, uprights, planks). The rotten one (`rotten`:
  -1 or 1) has missing planks, darker rope and a frayed end hanging off at the middle: the clues. `bridges` gives both
  walkable strips; `parts.snap(k)` (0 → 1 over about 0.6 s) breaks the rotten one in the middle and swings both halves
  down. The room's floor needs a gap between `za` and `zb` (the chasm room shape's black strip goes).

### Batch 2: things in the rooms, approved 2026-11-05 · `dmVein`, `dmOreCart`, `dmAlcove`, `dmOil`, `dmGas`, `dmRockfall`
Room space: the mine room (walls at x ±4, roof 4 m). Rolled with the room (seeded) like everything else.
- **Ore veins** (`dmVein(g, x, y, z, ry, ore, seed)`, chest height y 1.35, its back on the wall: `ry` PI/2 on the left
  wall, -PI/2 on the right). A rough rock boss standing out of the wall, in the ore's own rock and flecked with it:
  - **copper:** rounded native-copper nuggets, some gone green;
  - **iron:** dark metallic knobs with rust;
  - **silver:** bright wiry nuggets, some tarnished;
  - **gold:** yellow nuggets in white quartz;
  - **crystal:** three clusters of glowing six-sided crystals with points;
  - **diamond:** a few clear stones in blue-grey rock.
  `setMined(k)` (hits done / hits needed) knocks the ore out; at 1 the boss is a flattened pocket covered in pick
  scars with chips on the floor. `tick(t)` twinkles silver, gold, crystal and diamond. `DMORE` holds the names and
  colours. The boss uses its own flat (planar) texture so it doesn't swirl.
- **The ore cart** (`dmOreCart(g, x, z, ry)`): a painted, riveted steel tub with rust streaks on four wheels, a push bar
  and couplings, on a 4 m length of track with sleepers and a buffer stop; a lamp on a post (`lights`) and an ORE CART
  · BANK YOUR ORE · E board on its own posts beside the track, readable from both sides. `setLoad(k)` raises the ore
  in the tub as ore is banked (shared in co-op: the tub shows everyone's banked ore together). Obstacle: the cart, the
  track and the buffer.
- **Alcoves** (`dmAlcove(g, x, z, side)`): two rough rock pillars from floor to roof standing 0.9 m out from the wall,
  1.4 m apart, a timber head beam, a few stones inside. One or two a room (from door 2). `spot` is where you stand.
- **Oil cans** (`dmOil()`): a green LAMP OIL tin with a spout, cap and handle (the pickup, in drawers and crates).
- **Gas pockets** (`dmGas(g, x, z, HX, L)`): a dark fissure by the wall with a yellow sulphur crust, a GAS! · DON'T STOP
  chalk board on a stake, and a low green haze. `setFill(k)` spreads it from the fissure through the room (0 → 1 over
  the 20 s in the spec), `tick(t)` makes it drift. The haze is sprites (`gd` set).
- **Loose roof** (`dmRockfall(g, x, z)`): cracks drawn on the roof, flat slabs hanging a little low and stones about to
  drop. `warn(true)` starts a trickle of dust (the 1.2 s warning), `fall(k)` (0 → 1 over 0.6 s) drops the stones, and
  at 1 a small heap stays (`obs`, as in the spec).

### Batch 3: the creatures, approved 2026-11-05 · `dmRunCart`, `dmBats`, `dmBurrower`, `dmBurrowHole`, `dmSandGlass`, `dmMummyHand`
- **The Runaway Cart** (`dmRunCart(1)`) and **the Runaway Train** (`dmRunCart(3)`): ore carts heaped with dark ore that
  glows red in the cracks, the front one with a big headlamp, a faint light cone (narrow at the lamp, widening and fading ahead) and two little red lamps; iron
  chains between the train's carts. Faces -z; move the group along Rush's path. `tick(t, speed)` spins the wheels,
  throws sparks off them and rattles the carts. Put a point light at `light` (its own space): the headlamp lights the
  tunnel as it comes.
- **Bats** (`dmBats(n)`, about 26): small black bats with red eyes and jagged wings. `tick(t, spread, k)`: `k` 0 is the
  swarm roosting in a tight knot in a crack in the roof, 1 out and swirling over `spread` metres; move the group along
  the room as they pass.
- **The Burrower** (`dmBurrower()`): the dam's worm, bigger and browner: 14 segments with dark rings and short spines,
  a head that is open at the front, with three rings of teeth and a red glow down its throat (a red point light inside).
  `tick(dt, head, dir, open)`: put the head at a point facing `dir`, and the body follows, each segment trailing the
  one before; `open` 0 to 1 flares the teeth. `reset()` before it comes out again. **`dmBurrowHole(g, x, y, z, ry)`**
  is the broken hole it bursts out of (and leaves), with rubble on the floor. It is 2.6 m across: put it in the
  middle of a bay between two timber sets, with no lamp, pipe or sign within 1.4 m of its centre.
- **The sand-glass** (`dmSandGlass()`): the curse's sand timer, hanging over the door: a carved wooden frame with gold
  bands, two glass bulbs, sand running from top to bottom, a soft golden glow. `setK(k)` (0 full → 1 run out),
  `tick(t)` turns it slowly.
- **Mummy hands** (`dmMummyHand()`): a bandaged hand and forearm with a loose trailing bandage, coming up out of a
  patch of churned sand. `setRise(k)` (0 hidden → 1 out to the elbow), `setGrab(k)` closes the fingers. Several at a
  time, round where you stand still.

# Part 2 (F): five levels and the room remodel · plan approved 2026-11-05
Only in the Desert Mines run (`DSRT.on`); the Daily run's mine stretch uses level 1's look and rooms. Part 1's rules
(ore table, blockers, dangers, creatures) all stay; the levels only change the look, the room mix and how often things
happen. Everything is rolled in `mkRoomRaw` with the seeded `Math.random`, as now.

## The five levels
| Level | Doors | Look | Light | Ore (part 1) | More of / less of |
|---|---|---|---|---|---|
| 1 Old Workings | 1-19 | sandy brown rock, a timber set every 3.2 m, plank lagging in places, rails | a lantern on every other set (as now) | copper, iron | more boards, rockfall, Runaway Carts; no gas or water (as part 1) |
| 2 Crystal Caves | 21-39 | no timber: natural caves in grey-blue rock, crystal clusters in the walls and roof glowing blue and violet, bigger caverns; old rusty rails half buried in sand | half the lanterns (part 1); the crystals light the rest | iron, copper, silver | more chasms, rope bridges and bats; fewer boards |
| 3 The Flooded Level | 41-59 | dark wet rock that shines, puddles, ankle-deep water in about half the rooms (looks and splashes only), pipes along the walls | half the lanterns | silver, iron, gold | more flooded passages, rising water and gas; less rockfall |
| 4 The Hot Rocks | 61-79 | black basalt with glowing orange cracks, steam from the floor, a heat shimmer near lava | only the door lanterns (part 1); the cracks glow orange | gold, silver, crystal | chasm rooms become **lava channels** (falling in: as a chasm, but 60 damage and you burn for 3 s); more gas and Burrower |
| 5 The Deep | 81-99 | huge dark spaces, room heights up to 8 m, old bones, faint glowing fungus, the carved stone of an older dig (the Pharaoh's people) | **no lanterns at all**: your lantern and the fungus only | gold, crystal, diamond | more bats, Burrower and curse (every 60-90 s instead of 1-2 min) |

Door 100 stays Seek's dam, the finale. The set pieces stay where they are until part 3 shuffles them; they take on the
look of the level they fall in (the minecart chase 25-34 runs through crystal caves, Seek's sewer 65-74 through the hot
rocks).

**Sound:** each level has its own background, made from the game's existing sounds (no new music files): 1 creaking
timber and drips, 2 a soft glassy hum, 3 running water and a slow pump thud, 4 bubbling and hissing, 5 almost silence
with a deep far-off rumble. Arriving on a level shows its name for 3 s ("LEVEL 3 · THE FLOODED LEVEL · 180 m").

## The cage stations (doors 20, 40, 60 and 80)
- Each is a station hall at the bottom of the level (HX 5, L 15, in the level's look) with the cage at its far end, the
  level board ("LEVEL 2 · CRYSTAL CAVES · 120 m DOWN"), a bell, a winding signal board and a bench.
- **The cage is a through car, like the hotel's lift** (`hotel-loop.md` B2): in at the front gate, out at the back gate
  into the next level's first room. Nothing really moves: the cage shakes, the shaft's rock wall slides up past the
  open mesh sides (a moving texture), lamps go by, 12 s. The next room is built while the gates are shut. Co-op: it goes
  when everyone is in, or 30 s after the first player steps in (stragglers are moved in before the gates close), as in
  the hotel.
- **Door 60's hall** gets the Company Store counter in part 3. The quarry's 1-in-100 old shaft lands you in this hall.
- **The last cage (80) stops short:** "The cable won't go any further." A ladder beside it goes down the last 10 m: E
  on the ladder, a 5 s climb down (the camera goes down the rungs), then The Deep.
- Badges: **Five Levels Down** (reach The Deep), **Spelunker** (see every room type in the mines, over any number of runs).

## The rooms
**The room frame stays as now:** a box with the entry at one end and the exit at the other, corners from the turn
system. That keeps co-op seeding, turns, the creatures' paths and the doors working. Every room still starts and ends
at floor height 0; going down happens in the cages (and the dip, below).

**Rough walls:** every mine room's walls and roof get a lumpy rock shell over the box (the quarry underground's
rock-wall kit), in the level's rock. The box stays for collision; the shell only makes it look like a cave.

**Corners:** as often as on the hotel's upper floors. The fork and the side drift (below) add more ways to go.

**The mix per level** (the existing eleven shapes plus seventeen new rooms; plain tunnel = the share of ordinary
tunnels):

| Level | Plain tunnel | Existing shapes | New rooms |
|---|---|---|---|
| 1 | 40% | zigzag, pillars, collapsed, junction, dig, cart puzzle, pinch | powder magazine, lamp room, canteen, old office, ore chute |
| 2 | 25% | cavern, chasm, crystal, pinch | geode, wide gallery, fork, stope, lamp room |
| 3 | 35% | stream, pillars, junction, cart puzzle | pump room, dip, fork, side drift, ladder raise |
| 4 | 30% | chasm (lava channel), collapsed, pinch | lava steps, steam vents, ore chute, stope |
| 5 | 20% | cavern, collapsed, chasm | bone pit, old temple, wide gallery, side drift, ladder raise |

**The new rooms, and what they do:**
1. **Fork:** a rock pillar splits the room into two passages that meet again before the exit. One side has a find (a
   vein or a crate), the other a danger (a rockfall spot or the edge of a gas pocket).
2. **Side drift:** a short dead-end tunnel off one wall (6 m). At its end: two veins, a crate, or a miner's skeleton
   with an oil can (level 5). Sometimes it's where the Burrower is.
3. **Wide gallery:** twice as wide, two rows of rock pillars, two tracks.
4. **Stope:** a tall worked-out space (8 m) with timber props across it; a ladder up to a ledge with a rich vein.
5. **Ore chute:** a timber chute from the roof over a cart. Pull its gate (E): ore rattles down, one free ore each, but
   it's loud (+4 noise, the Burrower).
6. **Pump room:** a big old steam pump with a wheel. Turn it on (hold E, 4 s) and the next flooded passage is already
   drained when you get there.
7. **Powder magazine:** an iron cupboard behind a DANGER sign: one stick of dynamite per player. Never next to a gas room.
8. **Lamp room:** racks of lamps and an oil drum: E fills your lantern (once each).
9. **Canteen:** a table and benches, lunch tins, a kettle, crates and drawers to search.
10. **Old office:** a desk, drawers, and a level map on the wall that marks which of the next five rooms have gas.
11. **Geode:** you walk through a giant hollow crystal geode, glowing; a silver vein inside; quiet (no bats here).
12. **Dip:** timber steps down 1.2 m into a flooded hollow (waist-deep, half speed) and up the other side.
13. **Ladder raise:** a rock wall across the room; the way on is up a 3 m ladder onto a ledge and down the other side.
    Ladders are climbed with W/S (new, also used in the stope).
14. **Lava steps:** a lava channel across the room with stepping stones to jump; some sink a little when you land.
15. **Steam vents:** vents in the floor blow in turns (a hiss 2 s before): 15 damage and a shove. Walk between bursts.
16. **Bone pit:** a huge dark cavern; the path goes under the rib cage of something enormous.
17. **Old temple:** carved stone pillars, steps and a carved doorway from an older dig. The curse likes to start here.

## Models (after this plan is OK), in four batches
1. **The stations and the five looks:** the station hall and through cage with the moving shaft wall, the level
   boards, the ladder down to The Deep; the rough rock shell and each level's dressing (timber sets, crystal clusters,
   wet walls and pipes, glowing cracks, bones and fungus). Preview: a plain tunnel in each look, and a cage ride.
2. **The working rooms:** powder magazine, lamp room, canteen, old office, ore chute, pump room.
3. **The cave rooms:** fork, side drift, wide gallery, stope, geode, dip, ladder raise.
4. **The deep rooms:** lava steps, steam vents, bone pit, old temple.

## Part 2 models (`models/desert-mines.js`, the same file as part 1)

### Batch 1: the five looks and the cage stations, for review · `DMLV`, `dmShell`, `dmDress`, `dmFloorMat`, `dmStation`, `dmCage`, `dmManway`, `dmManwayFoot`
**What's in it:**
- **The rough rock shell** for every mine room: lumpy walls that bulge out up to 0.3 m, and a vaulted roof (higher on
  levels 2 and 5). Both end walls have their door holes. It only ever goes outwards from the room's box, so the box
  stays the collision. The only exception is the top corners of the box, above 3.4 m, which the vault rounds off.
- **Each level's rock and floor pictures:**
  - 1: sandy brown.
  - 2: grey-blue with glints.
  - 3: dark, wet and streaked, with green slime.
  - 4: black basalt with faint column joints. It has no glow of its own: the glowing cracks are placed per room.
  - 5: almost black.
- **Each level's dressing:**
  - 1: plank lagging laid over the timber sets, and boards behind the posts; old tools and a water barrel.
  - 2: glowing blue and violet crystal clusters on the walls and roof, small ones at the foot of the walls.
  - 3: puddles, a rusty pipe along one wall on brackets, ankle-deep water in wet rooms.
  - 4: glowing cracks placed one by one in each room, so no two rooms look alike and nothing repeats. Each crack
    starts on the floor a little way out from the wall, runs to the foot of the wall and climbs it, sometimes with a
    branch, as a bright core with a soft glow that breathes slowly. Two cracks cross the roof, and up to two magma
    seeps (glowing pools with a dark crust) sit where the biggest cracks meet the floor. The rock warms to red
    towards the floor. Also basalt columns along the foot of the walls and two steam vents with faint steam.
  - 5: glowing fungus at the foot of the walls; bones (long bones, ribs, a horned skull); a fallen carved stone block.
- **The station hall:** a concrete apron with a yellow line, the level board and the next level's board on posts, a
  bench and two lamp posts.
- **The cage** in the last 2.75 m of the hall:
  - a concrete front wall with a steel frame and a hazard stripe;
  - a mesh landing gate that lifts;
  - the car: checker-plate floor, mesh sides, the hoist bow and ropes, a lamp, a bell cord;
  - a back gate in the exit door hole;
  - red and green signal lamps, a bell and a signals board;
  - a 'CABLE SHORT · USE THE MANWAY' board for station 80.
- **The ride is faked:** nothing really moves.
  - The shaft rock slides up past the mesh sides, with lamps going by, and the car shakes.
  - A rock plate rises behind the front gate as the car "leaves" the hall.
  - Behind the back gate you see shaft rock until the next level's landing door ("LEVEL 3") comes up into place as the
    car "arrives". The landing door then lifts with the back gate.
- **The manway** (station 80): a timber collar round a 1.2 m hole, a hand rail, a sign, a ladder 10 m down a
  plank-lined shaft.
- **The manway's foot** (room 81): the ladder coming down out of a lined raise in the roof, with a collar frame.

**Wiring (Claude Code):**
- **Levels:** `dmLevel(nn)` = 1 + floor((nn - 1) / 20) for doors 1 to 99 (door 20 is still level 1: its station is
  the bottom of level 1). The level decides the look, the room mix (part 2's table), the lights and the sounds.
- **The shell:**
  - In `desertDecor`, for each mine room that is a plain box (not a turn leg, not a set piece, not door 100), build
    `dmShell(G2, {HX, HY, Z: L + 2, lv, dIn, dOut, seed: nn})` with the group at the room's entry wall (z +1 in the
    room's space).
  - `dIn`/`dOut` are the doors' x. Pass `dIn: null` for a room entered by the manway (room 81).
  - Hide the room's old wall, end-wall and ceiling meshes (keep their obstacles). Corner legs keep the old flat re-skin
    for now.
  - The shell only uses the seed it is given, never the seeded `Math.random`, so co-op rooms stay the same.
- **The floor:** put `dmFloorMat(lv)` on the floor box (texture repeat: 2.5 m per tile).
- **Timber sets:** level 1 as now (every 3.2 m). Level 3 every 6.4 m in darker wood. None on levels 2 and 4. Level 5:
  one or two broken old sets.
- **Dressing:** `dmDress(G2, shell, {seed: nn, sets: [the sets' z], capTop, wet})`.
  - `capTop` is the top of the sets' caps.
  - `wet` is for about half the rooms on level 3.
  - Call `tick(t)` each frame while the room is near (steam, the water's ripples).
  - `obs` go into the room's obstacles.
- **Lights:**
  - Lanterns as part 1: level 1 every other set; levels 2 and 3 about every 8 m; level 4 only at the doors; level 5
    none.
  - `dress.glow` lists up to a few spots where a pool light (blue on 2, orange on 4, teal on 5, short range) makes the
    crystals, cracks and fungus light the room. Take them from the existing light pool, don't add lights.
  - The level-5 rooms are meant to be dark: your lantern and the fungus are the light.
- **Stations (doors 20, 40, 60 and 80):**
  - Each is a hall with HX 5, HY 5 and Z 16, in the level's look (`dmShell` + `dmDress` with no rails), plus
    `dmStation(G2, {lv, HX: 5, Z: 16})`.
  - Add `dmCage(G2, {lv, HX: 5, HY: 5, Z: 16, x: dOut})` at the exit. The car's inside is x ±1.1, z 0.2..2.4 from the
    exit wall.
  - Collision:
    - the front wall is solid except the 1.5 m opening while the front gate is up;
    - the car's sides are solid;
    - the back gate is solid until it's up.
- **The ride** (like the hotel's lift):
  - When everyone is in the car, or 30 s after the first player steps in (stragglers are moved in), call
    `signal('go')`, close the front gate (`gate('f', k)` over 1.5 s) and `ride(30)`.
  - For 12 s, call `tick(dt, speed)` with speed ramping 0 → 1 over 2 s and back to 0 over the last 2 s. That's 30 m of
    "travel", and the plates and the landing door follow it.
  - Build the next room while the gates are shut. Then `signal('stop')`, open the back gate (`gate('b', k)`, 1.5 s),
    ding, and show the level's name.
  - Hang a pool light at `lamp` while someone is in the car.
- **Station 80:**
  - The cage runs as above but stops with a jolt after 8 s. Then `short(true)` and the front gate opens again ("The
    cable won't go any further.").
  - `dmManway(G2, x, z)` stands in the hall beside the cage. The preview uses (2.4, -9.6) in a 16 m hall; the game
    cuts the floor at `hole`.
  - E at the ladder (`top`) starts a 5 s climb down (the camera goes down the rungs, fades). You come out at the foot
    of `dmManwayFoot(G2, x, z, HY, 5, HX)` near room 81's entry wall, facing into the room.
  - Room 81's shell takes `holes: [foot.hole]`, and its entry door is never used: the cage's back gate stays shut at
    80.
  - Co-op: each player climbs on their own.
- **Badges:** "Five Levels Down" when you reach the foot of the ladder.

# Part 3 (E, G): shuffled set pieces, the Company Store and contracts: plan after part 2
