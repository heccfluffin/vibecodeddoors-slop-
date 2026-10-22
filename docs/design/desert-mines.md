Status: ideas for the user to pick from (2026-10-22)

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
