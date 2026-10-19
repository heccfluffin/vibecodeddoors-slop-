Status: plan in review (2026-10-19), room versions added the same day · preview "Quarry Underground Plan" (claude.ai artifact YMAf9xif5xPEjRLr9aNz3W)

# The Old Quarry underground: the quarry mine, rebuilt

The user, 2026-10-19: design the Old Quarry's underground (the mine under the headframe), before the desert mines.
Part 1 is this plan (layout and how a shift plays). Part 2 brings the models in batches, each with a preview and the
user's OK, in `docs/design/models/quarry-under*.js`.
The layout generator is already written: `models/quarry-under.js` (`ugGen(seed)`, pure data, no THREE). The preview
draws its real output.

## What's there now (survey of r632)
- **The generator is a 37 x 37 grid of 4 m squares** (`mnGen`, dx588:21): a 3 x 3 landing at the cage, 7 random-walk
  tunnels, 7-9 round caverns (crystal, magma, flood, fungus, dark), one level at y -40.
- **Look:** square walls and corners, roofs stair-stepped (random height per square), rock texture stretched about
  9 times on tall walls, dotted seams between wall pieces, floating stalactites and cones, a cone standing in a lava
  pool, lava rivers running through the cave walls and out of the mine, flooded galleries that render black with
  you standing on the water, rock pillars that are stacks of balls. No light except your helmet lamp.
- **Play:** wander, break veins (E), carry 10-30 ore back to the minecart at the cage, ride up, smelt. Five minutes,
  then the mine collapses and anyone inside loses what they carry. Biomes and distance decide the ore. There's no
  reason to go one way rather than another, no way to find your way back except memory, and nothing happens during
  a shift.
- **Cost:** 3,200-6,700 separate meshes per mine, 30-50 copies of the lava texture, and a new mine is built every
  5 min 20 s whether anyone goes down or not (a 0.2-1.4 s hitch).

## The plan

### 1. Three levels
The mine stays in the same box (72 m each side of the shaft, `MN.ox, MN.oz` = -247, -1446) and goes deeper:

| Level | Floor y | Feel | Ore |
|---|---|---|---|
| 1 · Old Workings | -40 (as now) | timbered drives, rails, lamps on a wire, the miners' rooms | copper and iron, some silver |
| 2 · The Caves | -52 | natural caves the miners broke into: crystal, fungus, water, chasms | silver, gold, crystal |
| 3 · The Deep | -64 | hot, dark rock: magma, basalt, the dark cave, the Geode | gold, crystal, diamond, uranium |

- The shaft goes down to level 3, with a **shaft station** on every level.
- **The cage always stops at level 1.** A new tycoon upgrade, **Shaft sinking** (🕳️: "Level 1 only" / "Stops at
  level 2" 300 gold / "Stops at level 3" 900 gold), opens the cage gates on the levels below. The ride takes
  the `qtRide()` time for level 1, plus half of it again for each extra level.
- Without the upgrade you walk down: every level has a **spiral decline** (a ramp that spirals 12 m down round a rock
  core, about 1 in 4.5) or a **ladderway** at the end of a straight main drive from the station, and sometimes a second
  ladderway elsewhere. The cage panel shows the levels; locked ones say "Shaft sinking needed".

### 2. Built from pieces, not squares
`ugGen(seed)` lays out each level from **pieces**: tunnels, junctions and rooms, joined at openings ("ends") that sit on
even metres and face one of four ways. All of its randomness comes from the seed (Park-Miller, like `mnRnd`), so every
co-op player gets the same mine. It takes about 12 ms.
1. Stations on all three levels (16 m square on level 1, 12 m below).
2. **The ways down first:** from a station, a straight main drive (12-28 m), then the spiral decline (70%) or a
   ladderway. On the level below, a main drive is dug from that station to where it arrives (A* on a 2 m lattice,
   straight runs preferred), so every level is one connected place.
3. **Then each level grows** from its open ends, far ends more often (so it spreads out): after a room or a station
   comes a tunnel; a cave fork may open straight into a room; rooms are tried first while the level is short of them;
   a dead-end room is never put on the last open ends; 2 m of rock between pieces. Level 1 aims for 17-24 pieces and
   5 rooms, level 2 for 15-22 and 5, level 3 for 13-20 and 4.
4. Open ends that nothing fits become **working faces**: a rock face with 2-3 veins, the tunnel's last timber set.
5. **Ways round:** pillar rounds (level 1) and rock islands (levels 2-3) are pieces that split and rejoin, and two
   dead ends close to each other can be joined by a dug tunnel. About 2-3 per mine.
6. Rooms and junctions are mirrored at random, so two of a kind don't look the same.
7. **The 1-in-100 old shaft** to the Desert Mines (dx597) moves to level 3: its timbered portal is set into the
   working face farthest from the shaft (so it needs no room of its own).

Measured over 300 seeds: pieces per level 21 / 16 / 14, rooms 3.2 / 4.1 / 3.9, 2.7 ways round, 1.6 ladderways;
93% of seeds work first time and the rest on a later try (the generator tries up to 8 times; all 300 work).

Coordinates in the plan: metres from the shaft, forward is -z (desert-local x = `MN.ox + x`, z = `MN.oz + z`).
`ugWorld(p)` gives each piece's floor shapes in those coordinates (paths with a width, blobs, rectangles), which the
models, the collision, the minimap and the station map board all use.

### 3. The pieces
Level 1 · Old Workings
| Piece | Size | What it is |
|---|---|---|
| Shaft station | 16 x 16 | The cage, the minecart bay, a tool board, the shift clock, the level map board, a bench. Exits on all four sides. |
| Drive | 4 x 12-26 | Timbered tunnel (a set every 3 m), rails, lamps on a wire. |
| Bend | radius 6 | A curved drive. |
| T junction, crossroads | 8 x 8 | With a signpost. |
| Pillar round | 20 x 28 | The drive goes all the way round a 12 x 16 ore pillar: veins on every face, two ways past. |
| Stope | 14 x 18 | A worked-out ore chamber, timber cribs holding the roof, rough benches of rock, lots of veins, often a big seam. |
| Crib room | 8 x 10, dead end | The miners' break room: benches, a table with lunch tins, a stove, lockers. A lunchbox to find. |
| Powder magazine | 6 x 9, dead end | Behind a heavy door: dynamite crates. |
| Collapsed drift | 4 x 12 | Broken timbers, a rubble heap to squeeze past on one side. |
| Pump room | 10 x 10 | An old pump over a flooded sump. |

Level 2 · The Caves
| Piece | Size | What it is |
|---|---|---|
| Cave passage, cave bend | 4.6 wide | Natural passages, never quite straight. |
| Cave fork | 12 x 10 | The cave splits two or three ways. |
| Rock island | 20 x 24 | The passage splits round a rock island and joins again. |
| Crystal grotto | 16 x 20 | Glowing crystal clusters, silver and crystal veins. |
| Fungus grotto | 20 x 20 | Giant mushrooms, moss, vines and glowworms (today's lush fungus, done properly). |
| Flooded gallery | 10 x 24 | Knee-deep water you wade through (you stand in it, slower), a plank walkway along one side. |
| Chasm hall | 14 x 20 | A fissure across the cave: a rope bridge, or three stepping stones to jump. |
| Stalactite hall | 20 x 20 | Columns, flowstone and stalactites, a path between them. |
| Stream crossing | 6 x 12 | A stream runs across the passage: stepping stones. |
| Ore pass | 6 x 8, dead end | A grate over a chute: ore dropped in lands in the cage's minecart. Levels 2 and 3. |

Level 3 · The Deep
| Piece | Size | What it is |
|---|---|---|
| Cave passage, bend, fork, rock island | | As level 2, in dark rock. |
| Basalt gallery | 6 x 16 | Black basalt columns and glowing cracks. |
| Magma chamber | 24 x 24 | A lava river with a stone bridge, geysers, a lava lake with stepping stones to a diamond island, basalt. |
| Dark cave | 18 x 18 | Pitch black without the LED headlamp: glowworms, a chasm with a plank bridge. |
| The Geode | 12 x 15, dead end | A round room lined with giant crystals. Gems. |
| Hot seam | 6 x 9, dead end | Glowing green rock, uranium, Geiger clicks. |
| Old shaft | in a working face | The 1-in-100 way down to the Desert Mines, door 60 (dx597's portal). |

The links: the **spiral decline** (16 x 16, on both levels: in at one side, a full turn and a half down round the
core, out facing back the way you came) and the **ladderway** (4 x 8: a raise with ladders and a landing every 4 m;
hold W to climb, S to go down, like the existing climbing).

### 3b. Versions of the main rooms (the user, 2026-10-19: "variations for the main rooms so we get more stuff")
Twelve rooms come in 2-4 versions each (`UGV` in `models/quarry-under.js`, picked by `ugVariant`). A version keeps
its room's size and exits, so the layout rules don't change; it changes what's inside and how it plays. A mine uses
a version it hasn't used yet when the same room comes up twice. That's 38 versions across the twelve rooms.

| Room | Versions |
|---|---|
| Stope (L1) | **Cribbed stope** (as above) · **Shrinkage stope**: half full of broken ore, a timber ladder up to a high ledge with rich veins · **Glory hole**: a raise to the quarry floor lets a shaft of daylight in, dust in the beam · **Flooded stope**: still water over the bottom, a plank walkway along one side, veins above the waterline |
| Crib room (L1) | **Crib room** · **Lamp room**: cap lamps on chargers, a board of brass tags (one has a name you know) · **Foreman's office**: desk, wall maps, the foreman's logbook (lore), a safe with a shift bonus |
| Pump room (L1) | **Pump room** · **Winder room**: the drum and brake of an old winze hoist, cables into a fenced hole · **Mine workshop**: forge, anvil, drill press, broken carts |
| Crystal grotto (L2) | **Crystal grotto** · **Crystal pool**: a glowing pool ringed with crystals, the rarest just under the edge · **Selenite beams**: giant crystal beams across the cave, duck under some, climb over others |
| Fungus grotto (L2) | **Fungus grotto** · **Puffball hollow**: car-sized puffballs that burst into glowing spores when hit · **Glow pond**: a pond lit from below, lily pads, frogs that go quiet when you come near |
| Flooded gallery (L2) | **Flooded gallery** · **Underground lake**: too deep to wade, pull the rope raft across (hold E, up to four aboard) · **Drowned drift**: an old timbered drive under water, rails and a sunken cart, waist-deep in the middle |
| Chasm hall (L2) | **Chasm hall** · **Broken bridge**: the bridge has fallen, edge round the fissure's end on a narrow ledge or make a long jump · **Trestle crossing**: a wide fissure under the miners' creaking timber trestle |
| Stalactite hall (L2) | **Stalactite hall** · **Rimstone terraces**: stepped pools down the cave, walk the rims · **Cathedral**: a huge dome round one giant column, roof out of your lamp's reach |
| Magma chamber (L3) | **Magma chamber** (river, bridge, lake island) · **Lavafall**: lava pours down a wall into a pool, a basalt shelf round it, gold in the hot wall · **Crust field**: cooled crust over live lava, dark patches safe, glowing ones burn (pushed off, drop 2 ore) · **Obsidian moat**: a lava ring round a black glass island with diamond and gold, one bridge |
| Dark cave (L3) | **Dark cave** (chasm) · **Sinkhole**: a bottomless round shaft in the middle, the path round the rim, the best veins across · **Glowworm grotto**: still black water under a roof of glowworms, a narrow path round the edge (turn your lamp off) · **The maze**: a forest of rock pillars, no signposts inside |
| The Geode (L3) | **Amethyst** (purple) · **Celestine** (pale blue, a low hum) · **Citrine** (gold, with gold veins between the crystals) |
| Hot seam (L3) | **Hot seam** · **Green spring**: a steaming green pool, uranium in the walls, the Geiger clicks race |

New things to play with from the versions: the rope raft (a small vehicle on a rope, hold E to pull; it carries up to
four and syncs like a door), burning crust (a floor patch that pushes you off), puffball spores (a cloud, like the gas
but harmless), the safe in the foreman's office (one per mine, opened with E, 40-80 gold), and the brass tag (a
collectible: each player's own name on one tag, once). These go in batch 4 with the other shift things.

### 4. How a shift plays
- **The shift is 6:00** (was 5:00): warnings at 1:00, 0:30, 0:10 as now; at 0:00 the mine collapses and anyone still
  inside is dug out without what they carry, as now. A new mine 20 s later.
- **The deeper, the richer, the further.** Level 1 is copper and iron with some silver; level 2 silver, gold and
  crystal; level 3 gold, crystal, diamond and uranium. Without Shaft sinking the walk back from level 3 is a real
  decision against the clock.
- **Ore by place** (vein weights, replacing `MNB[b].ore`):
  | Where | cu | fe | ag | au | cr | dm | ur |
  |---|---|---|---|---|---|---|---|
  | Level 1 | .40 | .40 | .15 | .05 | | | |
  | Level 2 caves | .10 | .20 | .35 | .20 | .15 | | |
  | Crystal grotto | | .10 | .40 | .15 | .35 | | |
  | Flooded gallery | | .30 | .50 | .20 | | | |
  | Level 3 | | .10 | .15 | .40 | .25 | | |
  | Lava lake island, the Geode | | | | | .40 | .60 | |
  | Hot seam | | | | .30 | | | .70 |
  Veins sit on the walls about one per 5 m of tunnel wall; stopes, pillar rounds and working faces have two to three
  times as many. Big seams (8 swings, five times the ore) go in stopes, pillars and working faces.
- **Finding your way:** a **signpost** at every junction and station exit points back to the cage with the distance
  ("⬅ CAGE 64 m", along the tunnels). The **level map board** at each station shows the whole level. The **minimap**
  underground draws the pieces you've walked through on your level (and friends' dots), with the banner
  "LEVEL 2 · THE CAVES" (the desert-map minimap banner, used underground).
- **The rockfall:** once per shift, at a time between 1:30 and 3:20 (from the seed), one side of a pillar round or
  rock island falls in with a rumble (camera shake, dust, a hint "A rockfall on level 1!"). Rubble fills the tunnel:
  dig through it (8 swings) or go round the other side. If the mine has no rounds or islands, it falls on a dug
  tunnel or a plain one.
- **Dynamite:** the powder magazine has crates. Take up to 3 sticks (E). E on rubble or a big seam to set one: a 4 s
  fuse, then the rubble is gone, or the big seam gives all its ore at once (and the clock loses 20 s). Anyone within
  4 m is knocked down and drops half their ore. Sticks don't go up in the cage; leftovers go back in the crate.
- **Gas pockets (levels 2 and 3):** 4% of veins (from the seed and the vein's number) let out gas when broken: a
  yellow-green cloud about 6 m across for 25 s. Inside it the screen tints and a breath bar drains over 6 s; if it
  empties you pass out and the crew drag you out with half your ore. Walk out and it refills.
- **Finds:** a lunchbox in the crib room (15-40 gold and a note from an old miner), 1-2 fossils in level 2 walls
  (sell at the assay office for 60 gold), gems in the Geode (crystal and diamond veins). The notes are short lore
  lines; they come with batch 4.
- **The ore pass:** drop what you carry down the grate and it goes into the cage's minecart, the same as dumping at the
  cage. One in about half the mines, on level 2 or 3.
- **Kept as now:** the cage, headframe and shaft up top; dumping at the minecart; the cart rides up with you; the
  smeltery chain; the foreman's mining shift (12 ore); falling into a chasm (half your ore) or lava (all of it);
  the mine's own jump (`MNJ`); the LED headlamp for dark caves; co-op: the leader sends the seed, state and clock,
  broken veins go by their number in the vein list.

### 5. How it should look (for the model batches)
- **Tunnels are extruded along their paths**, not boxes: level 1 an arched profile 4 m wide and 3.4 m high with timber
  sets, lagging boards and rails; caves a rougher profile 4.6 m wide whose rock is pushed in and out by a noise taken
  from the **world position**, so two pieces that meet have the same edge (no gaps, no seams). Dug-tunnel corners get
  a 4 m radius.
- **Caverns are one shell each:** floor, walls and a domed roof in one mesh, with a few stalactites and columns, the
  roof height changing smoothly (no stair steps).
- **Openings:** every end has a frame (timber on level 1, a rock lip in caves) that covers the joint between pieces.
- **Rock texture in world metres** on every surface (no stretching), with a second, larger blotch layer so it doesn't
  repeat every 4 m.
- **Light:** the helmet lamp as now, plus **four real lights** that move to the nearest light sources (lanterns, lava,
  big crystals, glowing mushrooms) within 25 m. The number of lights never changes (so nothing recompiles). Fog per
  level: level 1 warm brown, level 2 blue-grey, level 3 red-black.
- **Water you stand in:** the flooded gallery's floor is 0.4 m below the water; your eyes drop with it and you move at
  70% speed.
- **Cost:** each piece builds one merged mesh per material (rock, timber, metal, glow), about 5 per piece, so a mine
  is around 300 meshes instead of 3,200-6,700. Small repeated things (crystals, mushrooms, cones) are instanced.
  Materials and textures are shared (no copies per lava pool). This is how the pieces are built, not a new batching
  system; the mine stays out of the `DP` batching as now.
- **Built only when needed:** the mine is generated when someone first calls the cage after the last collapse (not
  every 5:20 while nobody goes down), and built over a few frames during the cage ride, level 1 first.

### 6. Model batches (part 2)
1. **The kit and level 1:** tunnel profile and extruder, timber sets, lagging, rails and sleepers, lamps on a wire,
   signposts, working face, shaft station (with the cage stop, gates, tool board, shift clock, map board), drive,
   bend, junctions, pillar round, stope, crib room, powder magazine, collapsed drift, pump room, ladderway.
2. **Level 2:** cave profile, cave passage, bend, fork, rock island, crystal grotto, fungus grotto, flooded gallery,
   chasm hall, stalactite hall, stream crossing, the spiral decline.
3. **Level 3:** dark rock set, basalt gallery, magma chamber, dark cave, the Geode, hot seam, old shaft, ore pass.
4. **The shift:** dynamite and crates, rubble and the rockfall, the gas cloud, lunchbox and notes, fossils, the level
   map board and minimap drawing, the Shaft sinking upgrade and the cage panel.

## Checks
- Every level is one connected place, reachable on foot from the cage on level 1 (the generator guarantees it; test
  a few hundred seeds).
- Two co-op players get the same mine from the same seed.
- No gaps where pieces meet, no floating stalactites, nothing standing in lava, the water at your knees.
- The mine builds without a hitch during the cage ride, and isn't built when nobody goes down.
