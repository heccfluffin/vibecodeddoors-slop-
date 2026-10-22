Status: all ideas picked 2026-10-22 (A to H) · part 1 (A, B, C, D, H: the rules) approved 2026-10-22 · part 1 models next

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

# Part 2 (F): five levels and the room remodel: plan after part 1
Levels of about 20 doors joined by a cage lift or a long ladder: 1 Old Workings, 2 Crystal Caves, 3 The Flooded Level,
4 The Hot Rocks, 5 The Deep, each with its own room pool, look, ore, music and dangers; many more room types and turns;
real cave shapes instead of boxes. Planned once part 1 is approved.

# Part 3 (E, G): shuffled set pieces, the Company Store and contracts: plan after part 2
