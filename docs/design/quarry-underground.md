Status: plan approved by the user 2026-10-19 · batch 1 (the kit, tunnels, stations, rounds, ladderway, decline) approved 2026-10-20 · batch 2 (level 1 rooms) approved 2026-10-20 · batch 3 (level 2, the caves) approved 2026-10-20 · batch 4 (level 3, The Deep) approved 2026-10-20

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

### 3b. Versions of every room (the user, 2026-10-19: "variations for the main rooms so we get more stuff", then
"a few more variations ... of every room that can spawn down here", "make sure nothing overlaps and looks good")
Every room that can come up, the shaft stations included, has 2-6 versions: **88 in all** (`UGV` in
`models/quarry-under.js`, picked by `ugVariant`; stations pick theirs in `ugStation`). Only plain tunnels, junctions
and the links don't vary. A version keeps its room's size and exits, so the layout rules don't change; it changes
what's inside and how it plays. A mine uses a version it hasn't used yet when the same room comes up again, and rooms
and junctions are mirrored at random on top.

**Checked:** `models/quarry-under-check.js` (`node quarry-under-check.js`) tests every version with several rolls of
its random parts (483 rooms):
- solid things (columns, cribs, puffballs, carts, desks...) stand inside the floor, 20 cm clear of the wall, don't
  overlap each other, and don't stand in lava, chasms, pits or deep water;
- chasms and lava rivers stay in the room (their ends may run up to 1.5 m into the wall, never through it);
- nothing solid within 1.5 m of a doorway, no hazard within 1.2 m of one;
- the entry, every exit and every goal (the lava-lake island, the obsidian island, ledges, the far side of the
  sinkhole, the fossil wall, the gold by the lavafall) can be walked to: floor, shallow water, bridges, ledges,
  catwalks, the raft rope, the zip line, or stepping stones no more than a short jump apart.
It reports "all clear". It caught 12 problems in the first rooms (columns in walls, a lava river at a side exit, the
lava-lake island with no stepping stones, the lavafall's columns blocking its side exit); all fixed.
The model batches must keep to the same rules (the checker reads the same tables the models will).

Level 1 · Old Workings
| Room | Versions |
|---|---|
| Shaft station | **Pit bottom**: The cage stops here. Minecart bay, tool board, shift clock, the level map board, a bench.<br>**Timbered station**: Heavy square timbers, an old ore chute from the stopes above, a tally board with the miners' brass tags.<br>**Brick station**: A brick-lined hall with an arched roof, a tally office window and a big painted LEVEL 1. |
| Stope | **Cribbed stope**: Timber cribs hold up the roof over rough rock benches. Lots of veins, often a big seam.<br>**Shrinkage stope**: A tall stope half full of broken ore. Climb the timber ladder to a high ledge with rich veins.<br>**Glory hole**: A raise up to the quarry floor lets a shaft of daylight in. Dust in the light, veins round the walls.<br>**Flooded stope**: Still, deep water over the bottom. Walk the edge or the plank walkway; veins above the waterline.<br>**Catwalk stope**: A deep open stope you cross on a timber catwalk. Veins on the walls beside it; don't look down.<br>**Cut-and-fill stope**: A floor of packed sand fill, an ore chute up one wall and a scraper winch with its cable across the room. |
| Crib room | **Crib room**: The miners' break room: benches, a table with lunch tins, a stove. A lunchbox to find.<br>**Lamp room**: Racks of old cap lamps on chargers and a board of brass tags. One tag has a name you'll know.<br>**Foreman's office**: A desk, a safe, maps on the walls and the foreman's logbook (lore). The safe holds a shift bonus.<br>**First-aid station**: A stretcher, a cabinet and a first-aid kit you can carry: your next fall, gas or burn costs you nothing. |
| Powder magazine | **Powder magazine**: Behind a heavy door: crates of dynamite. Take up to 3 sticks.<br>**Blasting store**: A plunger box and reels of wire: dynamite set from here goes off when you push the plunger, no fuse wait.<br>**Flooded magazine**: Ankle-deep water and crates gone soft. One stick is still dry, up on the top shelf. |
| Collapsed drift | **Collapsed drift**: Broken timbers and a rubble heap to squeeze past on one side.<br>**Buried cart**: A cave-in half buried a loaded minecart: dig it out (6 swings) for a pile of ore.<br>**Propped drift**: A forest of emergency props holding up a cracked roof. Dust trickles when you pass. |
| Pump room | **Pump room**: An old pump over a deep, flooded sump.<br>**Winder room**: The big drum and brake of an old winze hoist, cables running into a fenced hole in the floor.<br>**Mine workshop**: A forge, an anvil, a drill press, broken carts waiting for repair.<br>**Compressor room**: A big air compressor thumping away, pipes off along the drives. Switch it off (E) and listen to the mine. |
| Pillar round | **Pillar round**: A drive all the way round an ore pillar: veins on every face, and two ways past.<br>**Rail loop**: The rails run round the pillar; an old ore train is parked on one side.<br>**Ore bins**: Timber ore bins stand against the far side of the pillar, full of sorted ore to bag. |

Level 2 · The Caves
| Room | Versions |
|---|---|
| Shaft station | **Cave station**: Rough rock round a timber platform at the cage, the level map board, a lamp on a wire.<br>**Pumping station**: Big pumps and pipes climbing the shaft wall, thumping away; puddles everywhere.<br>**Refuge station**: A steel door into a refuge chamber with air bottles: gas can't follow you in here. |
| Cave fork (levels 2, 3) | **Cave fork**: The cave splits.<br>**Boulder fork**: A huge boulder that fell from the roof sits where the cave splits.<br>**Dripstone fork**: Two columns and a dripping roof where the cave splits. |
| Rock island (levels 2, 3) | **Rock island**: The cave splits round a rock island and joins again: two ways past.<br>**Crystal island**: The island is one great crystal pillar, lit from inside.<br>**Mushroom island**: Giant mushrooms grow on the island, their caps reaching over the passage.<br>**Flooded round**: Ankle-deep water all the way round the island, and drips that ring like bells. |
| Crystal grotto | **Crystal grotto**: Glowing crystal clusters, silver and crystal veins.<br>**Crystal pool**: A still, glowing pool ringed with crystals. The rarest crystals grow under the water's edge (wade in).<br>**Selenite beams**: Giant crystal beams cross a tall cave at all angles high over your head, their ends sunk deep in the rock.<br>**Frost grotto**: Pale blue crystals furred with frost and a cold mist at knee height. Your breath shows.<br>**Crystal columns**: Huge six-sided crystal columns from floor to roof, a maze of light. |
| Fungus grotto | **Fungus grotto**: Giant mushrooms, moss, vines and glowworms.<br>**Puffball hollow**: Puffballs as big as cars. Hit one and it bursts in a cloud of glowing spores (harmless, slow to clear).<br>**Glow pond**: A deep pond lit from below, lily pads, mushrooms round the edge, frogs that go quiet when you come close.<br>**Shelf-fungus wall**: Giant shelf fungi grow up one wall like steps: climb them to a high ledge with gold.<br>**Root hall**: Thick pale roots hang from the roof to the floor, glowing at the tips. Something far above is very thirsty. |
| Flooded gallery | **Flooded gallery**: Knee-deep water you wade through, a plank walkway along one side.<br>**Underground lake**: Too deep to wade. Pull the rope raft across (hold E); it takes up to four.<br>**Drowned drift**: An old timbered drive the water took: rails under the surface, a sunken minecart, waist-deep in the middle.<br>**Waterfall gallery**: A waterfall pours out of a crack in the wall into a deep plunge pool. Spray, a roar, the path past it. |
| Chasm hall | **Chasm hall**: A rope bridge over a fissure, or jump the stones.<br>**Broken bridge**: The bridge has fallen. Edge round the end of the fissure on a narrow ledge, or make a long jump.<br>**Trestle crossing**: A wide fissure crossed by the miners' old timber trestle, rails and all. It creaks.<br>**Zip line**: A rusty miners' zip line: grab the handle (E) and slide over. Coming back, take the ledge round the end. |
| Stalactite hall | **Stalactite hall**: Columns, flowstone and stalactites, a path between them.<br>**Rimstone terraces**: Stepped pools of still water down the cave, each one rimmed with stone. Walk the rims.<br>**Cathedral**: A huge, tall dome round one giant column. Your lamp doesn't reach the roof.<br>**Fossil wall**: A giant fossil skeleton in the cave wall, half dug out long ago. Fossils to take (the assay office buys them).<br>**Echo chamber**: A tall, round, empty cave where every sound comes back three times. Someone left a bell on a post: ring it (E). |
| Stream crossing | **Stream crossing**: A stream crosses the passage: stepping stones.<br>**Plank footbridge**: A fast, deep stream across the passage and a plank footbridge with a rope rail.<br>**Stream tunnel**: For a stretch the passage IS the stream: wade with the current, ankle-deep. |
| Ore pass (levels 2, 3) | **Ore pass**: A grate over a chute: ore dropped in lands in the cage's minecart, no walk back.<br>**Grizzly**: A steel grizzly (a grid of bars) over the chute and a sledgehammer for big lumps. Same quick trip to the cart.<br>**Skip loader**: A little skip on rails at the chute's lip: fill it, push it over (E), and the ore goes to the cart. |

Level 3 · The Deep
| Room | Versions |
|---|---|
| Shaft station | **Deep station**: Dark rock, a heavy steel cage gate, a water barrel and a warning board: HOT GROUND.<br>**Hot station**: Big fans push cool air down the shaft; an ice-water barrel and a thermometer in the red.<br>**Sealed station**: Steel bulkheads at every exit, opened with a big wheel (E). Someone sealed this level once. |
| Magma chamber | **Magma chamber**: A lava river with a stone bridge, geysers, a lava lake with stepping stones to a diamond island.<br>**Lavafall**: Lava pours down one wall into a glowing pool. A basalt shelf runs round it to gold in the hot wall.<br>**Crust field**: A floor of cooled crust over live lava. Dark patches are safe; glowing ones burn (you're pushed off and drop 2 ore).<br>**Obsidian moat**: A ring of lava round an island of black glass. One stone bridge; diamond and gold on the island.<br>**Lava channel**: A channel of lava sweeps round one side of the chamber; a stone bridge over it to the side passage, heat shimmer everywhere. |
| Dark cave | **Dark cave**: Pitch black without the LED headlamp. A chasm and glowworms.<br>**Sinkhole**: A round, bottomless shaft in the middle of the cave. The path goes round the rim; the best veins are on the far side.<br>**Glowworm grotto**: Still black water and a roof full of glowworms. A narrow path round the edge; turn your lamp off to see it.<br>**The maze**: A forest of rock pillars. Easy to lose your way: the signposts don't reach in here.<br>**Bat roost**: Thousands of bats under a high roof. Shine your lamp up and they pour out past you; slippery guano underfoot. |
| The Geode | **Amethyst geode**: A round room lined with giant purple crystals. Gems.<br>**Celestine geode**: Pale blue crystals and a hum you feel more than hear. Gems.<br>**Citrine geode**: Golden crystals, and gold in the rock between them. Gems.<br>**Smoky quartz geode**: Dark, smoky crystals that drink your lamplight, with a few clear ones that blaze. Gems. |
| Hot seam | **Hot seam**: Glowing green rock, uranium, Geiger clicks.<br>**Green spring**: A steaming pool tinted green by the rock round it. Uranium in the walls, and the clicks get fast.<br>**Core shed**: Boxes of glowing drill cores stacked by the walls and an old core drill. Some cores are worth taking. |
| Basalt gallery | **Basalt gallery**: Black basalt columns and glowing cracks.<br>**Steam vents**: Vents in the floor hiss and puff steam that hides the way for a few seconds at a time.<br>**Obsidian tube**: Glassy black walls that throw your lamplight back at you, and sharp edges underfoot. |

New things to play with from the versions (batch 4): the rope raft (hold E to pull, up to four aboard, synced like a
door), the zip line (one way, E), the catwalk, burning crust (a floor patch that pushes you off and costs 2 ore),
puffball spores (a cloud like the gas, harmless), the foreman's safe (40-80 gold, once per mine), the first-aid kit
(cancels your next loss), the brass tag (each player's own name, a collectible), the blasting store's plunger,
the bell in the echo chamber, the buried cart (6 swings for a pile of ore), the refuge chamber (gas can't follow you
in) and the sealed station's bulkhead wheels.

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
Models go in `models/quarry-under-kit.js` (the kit and the builders) and further `models/quarry-under-*.js` files.
1. **The kit, tunnels and stations:** materials and textures, the world-position noise, the tunnel extruder (arched
   profile, fillets, timber sets, lagging, rails, lamps on a wire), room shells with doorways and portal frames,
   working faces, ore veins, signposts, the three level-1 stations, drive, bend, T junction, crossroads, dug tunnels,
   the pillar round (3 versions), the ladderway and the spiral decline. Previewed as a whole level 1 built from
   the generator.
2. **Level 1 rooms:** stope (6 versions), crib room (4), powder magazine (3), collapsed drift (3), pump room (4).
3. **Level 2:** cave profile, passages, bend, fork, rock island, the level-2 stations, crystal grotto, fungus grotto,
   flooded gallery, chasm hall, stalactite hall, stream crossing, ore pass (all versions).
4. **Level 3:** dark rock set, the level-3 stations, basalt gallery, magma chamber, dark cave, the Geode, hot seam,
   old shaft (all versions).
5. **The shift:** dynamite and crates, rubble and the rockfall, the gas cloud, the raft, zip line, lunchbox, notes,
   tags, fossils, the level map board and minimap drawing, the Shaft sinking upgrade and the cage panel.

### Batch 1: the kit, tunnels and stations (`models/quarry-under-kit.js`), approved 2026-10-20
`ugBuildLevel(plan, L)` builds a whole level from `ugGen`'s plan and returns `{g, lamps, veins, decl}`. `g` is one
group in mine coordinates (put it at `MN.ox, MN.Y, MN.oz`; level floors at y 0, -12, -24). The preview builds level 1
of a real plan this way.
- **Tunnels** (`ugTube(batch, polyline, o)`): an arched profile (`ugProf(hw)`: walls 2.6 m, arch to 2.6 + 0.45 hw;
  4 m wide drives, narrower necks) extruded along the piece's path, corners filleted (radius 3 on dug tunnels),
  resampled every 0.5 m. Timber sets every 3 m (two posts, a cap at 2.6-2.84 m, lagging boards with gaps), a lamp
  every 6 m hanging from a cap with a wire between them. The tunnel walls face inward (one-sided). A tunnel's two
  end rings are squared exactly to the opening's axis (every opening faces one of the four ways), so a bend that
  meets a drive or a doorway shares the exact same ring: no wedge-shaped slits (the user found one, 2026-10-20).
- **Rails** (`ugRails`): sleepers every 0.6 m and two continuous rails (0.6 m gauge) extruded ring by ring along the
  same path as the tunnel, so curves have no gaps and one piece's rails meet the next piece's end to end (the first
  preview built rails from short straight boxes, which opened gaps on the outside of every curve). Where lines meet
  (junctions, the pillar round's corners and side door) there is a **turntable** (`ugPlate`): a round steel plate
  set in the floor with a rim, bolts and one short pair of rails across it, turned to one of the lines; rails run to
  its rim from every doorway. (Real mines used these: push the cart on, turn the plate, push it off down another line.) Any rail end that meets nothing (another rail, a plate) gets a red **buffer stop**:
  at working faces, at the ladderway and decline mouths, at rooms without rails yet, and at the station's buffers.
- **Rock** is pushed out (never in) by `ugNoise(x, y, z)` of the world position, up to 0.2 m in tunnels and 0.22 m
  in rooms, faded to nothing within 1 m of every opening and at floor level. So two pieces meeting end to end have
  exactly the same edge, and a room's doorway has exactly the tunnel's arch.
- **Rooms** (`ugRoom(batch, corners, y, h, doors, o)`): a gravel floor, rock walls in 0.6 m cells with doorway gaps,
  a flat panel between each doorway's arch and the wall above it, a timber portal over every doorway (posts half in
  the rock, covering the joint), a rough roof. Holes in floor or roof (`o.holes`), solid blocks (`o.blocks`, the
  pillar). Wall lining can be rock, planks or brick.
- **Junctions** (T and crossroads) are 8 x 8 rooms with heavy corner posts and beams, and a two-sided **signpost**
  whose arrow points back the way you came (always the way to the cage, since every piece's entry faces its parent),
  with the distance along the tunnels ("⬅ CAGE 45 m", rounded to 5 m).
- **Shaft stations** (level 1: Pit bottom, Timbered station, Brick station): a 16 x 16 room, the 3.2 m shaft through
  floor and roof (plank-lined above the roof and down into a 1.6 m sump, steel guides in the corners, a timber collar),
  the landing gate on the -x side (where you step out, as now) with a LEVEL 1 sign and a call box, steel mesh on the
  other three sides, rails from each doorway ending at red buffers, four big lamps, the shift clock and the level map
  board on the walls, and the version's dressing.
- **Pillar round** (3 versions): the drive round a 12 x 16 pillar, cribs in the corners, sets along the sides, rails
  through (or round the whole loop for the rail-loop version), veins on every pillar face, lamps.
- **Each level's group holds everything at its own depth:** `ugBuildLevel(plan, L)` builds a ladderway's lower
  landing (and the bit of ladder inside it) with the lower level (`ugLadder(..., 'down')`), and the upper landing and
  raise with the upper one, so a level shown on its own never has a tunnel running into nothing (the user found one
  in the level 2 preview, where the landing had been built with level 1). `{links:1}` builds both with the upper
  level (the level 1 preview uses it). The spiral decline stays with its upper level.
- **Ladderway**: an upper landing with a fenced hatch, a plank-lined raise with a ladder and a landing every 3 m, and
  a lower landing with the raise coming through its roof. Both landings are full tunnel width (the first version had
  narrow 3.2 m landings, so the 4 m tunnel meeting them left black gaps either side; the user spotted it).
- **One opening size everywhere:** every place where two pieces meet is the standard 4 m arch (`ugProf(2)`). A
  piece may be wider or narrower inside (cave passages, the crib room's narrow door), but it must come back to the
  4 m arch at its openings, or close the difference with a rock bulkhead around a smaller doorway (`ugBulkhead`:
  the 4 m arch with the narrow arch cut out, and a timber frame round the doorway; the level builder adds one wherever
  a narrow neck starts at an opening). The plan's
  ladderway path is now 4 m wide too.
- **Spiral decline**: the tunnel itself spirals a turn and a half down round its rock core (72 m long, 1 in 6),
  with sets and lamps all the way.
- **Working faces**: a rough dome closing the tunnel end, with 2-3 veins on it.
- **Ore veins** (`ugVein(type)`): a dark rock patch with 8 metal nuggets in the ore's colour; a separate group
  per vein (they get broken), set 6 cm into the wall facing out. Every vein is placed on the real wall surface: the noise that
  pushes the rock out is worked out at the vein's spot (`ugTubeWall` for tunnels, the same sum as `ugRoom` for rooms,
  the wall's own points for caves). They used to sit at the un-pushed wall line, so many floated up to 0.2 m in
  front of the rock (the user saw it). A test casts a ray at every vein's wall: none float now on three mines. Tunnels get one every 5-9 m on alternate walls.
- **Merging**: everything static in a level goes through `ugBatch()` into one mesh per material (about 15 meshes for
  a whole level plus the veins and signs: 57 objects for level 1 of mine #4242). All `noSeam`. The game's `DP`
  batching should leave the mine alone, as now.
- **Lamps**: `lamps` lists every lamp ([x, y, z, strength]); the game lights the nearest ones with a fixed pool of
  point lights (the preview uses 10), so the number of lights never changes.
- **Walking**: use the plan's floor shapes (`ugWorld`) for where you can walk (inside a path's width less 0.4 m, a
  room's rectangle less 0.3 m, minus solid props), as `quarry-under-check.js` does, instead of the old 4 m cells.

Checked: the z-fight and floating checker on the whole of level 1 (mine #4242): nothing (it found the shaft planks
and the raise planks sharing the floor's plane, both lifted 2 cm). Screenshots of every piece from inside and
from above. Found and fixed on the way: doorways were walled over from the inside (a wrong distance test), the
LEVEL sign faced into the shaft.
The decline's bottom opens onto level 2, which comes in batch 3.

### Batch 2: the level 1 rooms (`models/quarry-under-l1.js`), approved 2026-10-20
Load it after the kit. The kit calls `ugRoomL1(batch, piece, level, ctx)` for each room rectangle and
`ugCollapsed(...)` after a collapsed drift's tunnel, so the rooms come out of `ugBuildLevel` like everything else
(merged per material, `noSeam`, lamps into `lamps`, veins into `veins`). Each room reads its version from the plan
(`piece.d.v`) and is mirrored with the piece. Everything is placed in the piece's own coordinates (`ugLocal`), so
it turns with the piece. Solid props are in the version's `fx` as blocks with a radius, so the checker and the walking
shapes keep them clear of doorways and paths.
- **Stope** (5.5 m high, ore veins every ~1.9 m on the walls, a big seam in three versions):
  - *Cribbed stope*: timber cribs up to the roof and rock benches.
  - *Shrinkage stope*: a big muck pile of broken ore against one long wall, a 2.4 m rock ledge along the other
    (built into the wall, no gap behind it) and a ladder leaning on it; the way through the middle stays clear.
    Its rich veins are on the room's wall above the ledge (they used to float on the ledge's open sides).
  - *Glory hole*: a hole in the roof up a 9 m raise to daylight; a shaft of light falls on the floor (a strong lamp).
  - *Flooded stope*: a deep pool in a basin that shelves down from the edge (2.3 m deep in the middle), stones round
    its rim and a plank walkway along the wall. The pool's edge blocks walking like a pit's rim.
  - *Catwalk stope*: a 7 m deep pit with a rocky lip, crossed by a plank catwalk on beams with handrails.
  - *Cut-and-fill stope*: a raised fill floor, an ore chute, a winch and its cable.
- **Crib room** (3.4 m): *Crib room* (table, benches, stove with its pipe, a kettle, SAFETY FIRST), *Lamp room*
  (racks of cap lamps charging and the tag board), *Foreman's office* (desk, safe, cabinet, the MINE PLAN board),
  *First-aid station* (stretcher, cabinet, kit).
- **Powder magazine** (3.4 m): the heavy door leaf open flat on the inside of the front wall. *Powder magazine*
  (stacked dynamite crates, DANGER · EXPLOSIVES), *Blasting store* (a plunger box and reels of wire,
  BLASTING · CLEAR THE AREA), *Flooded magazine* (shallow water, crates up on a shelf).
- **Collapsed drift**: the tunnel's broken sets (leaning, no lagging) and a rubble pile with a fallen beam.
  *Buried cart*: a tipped cart half under the rubble with spilled ore. *Propped drift*: new props with wedges.
- **Pump room** (3.9 m), each round a hole in the floor (rock lip, fence that stops short of the doors):
  *Pump room* (sump with water, pump and pipe), *Winder room* (winder drum, sheave and cable down the shaft),
  *Mine workshop* (benches, anvil, a forge with its glow), *Compressor room* (compressor, air tank and pipe).
- **Deep water** (`ugPool`, used by the flooded stope and the pump sump; level 2's lakes will use it too): the
  surface sits a little below the floor (0.25 m in the stope, 0.6 m in the sump), so a band of wet rock shows above
  it. The surface is see-through dark green with a rippled normal map (`UGK.poolN`; **the game scrolls its offset
  slowly**, about 0.012 and 0.007 per second). Under it, six faint dark layers each cover only where the basin is
  deeper than they are, so the middle looks deep and the shelving edge looks shallow, with no shader work. Water
  materials draw after the rock (`renderOrder` from the material's `userData.ro`) and don't write depth. The
  flooded magazine's ankle-deep water uses the same ripples. (The user asked for water with depth, 2026-10-20: the
  first version was a flat disc on the floor.)
- **Wall signs** fit their text: the sign canvas has the board's shape and long text shrinks to fit (the first
  try cut "DANGER · EXPLOSIVES" off at the edge).

Checked: the z-fight and floating checker on all 20 rooms, each built alone with stub tunnels, and on the whole of
level 1 of mine #4242: nothing (found and fixed: the catwalk boards, the kettle, the raise walls and the leaning sets'
lagging). `node quarry-under-check.js`: all clear, 483 rooms over many seeds, all 88 versions. Screenshots of every room
from inside.

### Batch 3: level 2, the caves (`models/quarry-under-l2.js`, `models/quarry-under-l2r.js`), approved 2026-10-20
Load them after `quarry-under-l1.js`. `ugBuildLevel` calls `ugPieceL2(b, p, L, ctx)` for every piece on levels 2 and 3
first; it builds the piece and returns true, or returns false and the kit builds it as before. `ugBuildLevel` now also
returns `solids` (mine coords `{x, z, r}`: big dressing that isn't in the plan, such as giant mushroom stems and roots).
Each level has its own rock and floor (`ugRK(L)`, `ugFL(L)`: level 2 is blue-grey `rock2`/`floor2`); faces, ladder
landings, the decline and stations use them.
- **Cave passages and bends** (`ugCave`): a rounder profile than a drive, 4.8 m wide and 4 m high, rock pushed out by
  the world noise up to 0.45 m and smooth-shaded. Within 2.4 m of each end it blends to the exact 4 m arch with no
  noise, and the last 1.6 m run straight and square to the opening, so a passage meets a doorway, a drive or another
  passage edge to edge (the plan's passage paths wiggle, so this is added at both ends). Loose stones along the foot
  of the walls, veins every 4-8 m (silver, gold, crystal, some iron and copper).
- **Cave rooms** (`ugChamber`): the plan's oval, with each doorway flattened into a straight 5.2 m stretch of wall;
  rock walls up to 3.65 m (pushed out up to 0.75 m, never at the floor or near a doorway) curving into a domed roof
  (2.6-7.5 m higher in the middle, by room: tall enough that nothing hanging or growing is in your way). Each doorway is the 4 m arch with a flat panel above it and a rock lip
  round it. `roofAt(x, z)` and `wallPt(angle, y)` give the roof height and a point on the wall, so columns, roots,
  stalactites and the fossil sit on the real rock (things hanging from the roof reach 0.9 m up into it, because the
  roof is only known exactly at its ring points). A room may have an island (a rock pillar the passage goes round,
  its top joining the roof), pits and polygon holes in its floor.
- **Forks**: plain; *Boulder fork* (a big noisy boulder and rubble); *Dripstone fork* (two flowstone columns, small
  stalactites).
- **Rock islands**: *Rock island*; *Crystal island* (the pillar is glowing crystal, faceted, with big crystals
  jutting out and four lights round it); *Mushroom island* (no pillar: a low mound under one dome, seven giant pink
  mushrooms leaning out over the passage, small green ones); *Flooded round* (ankle-deep water all round the pillar).
- **Level 2 stations** (props by name through `ugProp`): *Cave station* (a plank platform round the cage, the
  LEVEL 2 MAP board on posts); *Pumping station* (two big pumps with pipes up the shaft, a puddle); *Refuge station*
  (a yellow steel refuge chamber in the corner with its door facing the room and a REFUGE sign, air bottles). The
  refuge's plan data changed: it is now a solid `blk` r 1.4 at (-4.5, -4.8) instead of a door in the middle of the
  floor, which stood in front of the west doorway.
- **Stream crossings**: the stream cuts a channel across the passage floor (rock banks, a bed, rippled water that
  flows: **the game scrolls `UGK.streamN.offset.y`**, about -0.25 per second), running under the walls at both ends.
  *Stream crossing* (stepping stones), *Plank footbridge* (deep stream, planks on two rails, rope handrails),
  *Stream tunnel* (ankle-deep water along the passage).
- **Ore passes**: a short dug room at the end of a timbered neck (bulkhead at the opening), a 1.7 m chute with rock
  sides into the dark; *Ore pass* (a light grate), *Grizzly* (heavy bars, a sledgehammer on a rack), *Skip loader*
  (rails to the chute's lip, a skip with ore).
- **Crystal grotto** (veins mostly crystal and silver): *Crystal grotto* (16 clusters, crystals round the foot of the
  walls, lit); *Crystal pool* (a glowing, wadeable pool, 0.6 m deep, crystals round it and under its edge, a light in
  it); *Selenite beams* (a 9 m high cave; three pale beams sunk into the walls, all
  between 2.6 and 5 m up, so none is in your way); *Frost grotto* (frost crystals, icicles, a cold mist at knee height in three soft layers);
  *Crystal columns* (huge six-sided crystal columns floor to roof).
- **Fungus grotto**: *Fungus grotto* (six giant glowing mushrooms, smaller ones, green mushrooms, moss, vines down the
  walls, 90 glowworms on threads); *Puffball hollow* (five car-sized puffballs, small ones); *Glow pond* (a deep pond
  lit from below, lily pads, three frogs, mushrooms round the edge); *Shelf-fungus wall* (a 1.6 m rock ledge against
  the wall, with at least 2 m of headroom on top; six shelf fungi as steps up its face, gold veins above it); *Root hall* (thick pale roots from roof to
  floor, thin ones ending in glowing tips).
- **Flooded gallery**: *Flooded gallery* (knee-deep: the floor 0.45 m under the water, a plank walkway on posts along
  the edge); *Underground lake* (3 m deep, a rope across on two posts, a raft on four barrels); *Drowned drift*
  (timber sets standing in the water, old rails along the bottom with no buffers, a sunken cart); *Waterfall gallery*
  (a plunge pool and a wading channel joined into one basin, `ugBasin`; the water comes out of a dark crack in the
  wall, spills over a rock lip and curves out as it falls, two soft sheets of streaks that swell and thin, foam rings
  and a spray puff (three crossed soft planes) where it lands; no veins near it; **the game scrolls
  `UGK.fallT.offset.y` by about +1.2 and `UGK.fallT2.offset.y` by +0.9 per second**). The first try was one flat
  sheet of hard bars hanging from nowhere (the user's note).
- **Chasm hall**: the fissure is a hole in the floor along the plan's line, rough rock sides 9 m down, darkness at the
  bottom; it runs into the walls, or narrows to nothing where it ends inside the cave. *Chasm hall* (a sagging rope
  bridge, three stepping-stone pillars rising from the depths); *Broken bridge* (each half hangs into the gap);
  *Trestle crossing* (the miners' timber trestle: deck, rails, bents with braces down into the gap); *Zip line* (a tall
  frame, a lower one across, the cable and a handle on a pulley).
- **Stalactite hall**: *Stalactite hall* (flowstone columns, 45 stalactites, stalagmites off the ways through,
  flowstone mounds); *Rimstone terraces* (four pools rimmed with flowstone, each rim higher than the last, water
  brim-full); *Cathedral* (a 7.5 m dome round a giant fluted column); *Fossil wall* (a large made-up skeleton half dug
  out of the wall: spine, ribs, skull; a tool pile, a work lamp, small spiral fossils by the wall); *Echo chamber*
  (tall and empty but for a brass bell on a post).
- **Light**: crystals, mushrooms, glowing pools, root tips and the fossil dig's lamp add lamps to `lamps` (a few per
  room), lit by the same fixed pool of lights.

Checked: the z-fight and floating checker on every one of the 36 level 2 piece versions built on its own, and on whole
level 2s of mines #52, #777, #4242 and #9001; `node quarry-under-check.js` (all 88 versions). Screenshots of every
version from inside and above. Found and fixed on the way: the map board's posts sharing faces with the board and its
sign, stalactites and glowworm threads not reaching the roof, the crystal island's first look (a painted-on ring),
the rope bridge's deck ropes (now they sag with the planks), a texture seam down one spot of every cave room's wall,
a vein sitting on the fossil.

### Batch 4: level 3, The Deep (`models/quarry-under-l3.js`), approved 2026-10-20
Load it after `quarry-under-l2r.js`. `ugPieceL2` asks `ugPieceL3(b, p, L, ctx)` first, which builds the basalt
gallery, magma chamber, dark cave, the Geode, the hot seam and the old shaft; passages, bends, forks, islands and ore
passes are the level 2 pieces in this level's rock. `ugBuildLevel` now also returns `hot` (glowing crust patches that
burn, mine coords `{x, z, r}`), `moving` (the sealed station's doors: groups that turn on their hinge, closed at 0,
`userData.ugDoor.open` = the open angle) and `portal` (door 60's position and facing).
- **The rock** is dark red-black (`rock3`, `floor3`); the dark cave is near-black (`rockK`).
- **Changes to the kit for this batch:** cave room doorways can be narrower than 4 m (`hw`, for a neck's end:
  `doorsExtra`), and `ugCave` can be narrow (`o.hw`), so the Geode and the hot seam have a narrow cave neck with a
  rock bulkhead where it meets the 4 m tunnel and a matching narrow doorway into the room.
- **Stations:** *Deep station* (a water barrel, HOT GROUND and LEVEL 3 MAP boards); *Hot station* (two big fans on
  stands, an ice-water barrel, a TEMP 52 °C board); *Sealed station* (a steel bulkhead in every doorway: a dark steel
  wall in the arch, yellow frame, a steel door with a red wheel; the doors are moving parts for the game).
- **Basalt gallery** (a cave passage): *Basalt gallery* (glowing cracks zig-zag along the floor, clusters of
  six-sided basalt columns, the middle ones up into the roof); *Steam vents* (six vent mouths along the floor with
  steam); *Obsidian tube* (glassy black walls and floor, sharp shards along the edges).
- **Magma chamber** (a 5.5 m dome): lava rivers and the lava channel are bands cut through the floor (`ugBand`, the
  same rules as level 2's chasms: into the walls or narrowing to nothing), rough rock sides (`ugHoleSides`), lava
  0.42 m down, lights along them; stone bridges with a low parapet, arched a little (`ugStoneBridge`).
  *Magma chamber* (the river and bridge, a lava lake with an island and a diamond outcrop, stepping stones, a
  geyser, basalt columns); *Lavafall* (lava pours from a dark crack over a rock lip into the pool, a basalt-tile shelf
  round it, gold veins in the hot wall at its end); *Crust field* (the floor is cooled crust with glowing cracks;
  eight glowing patches that burn, listed in `hot`); *Obsidian moat* (a ring of lava round an island of black glass,
  one bridge, obsidian outcrops with diamond and gold); *Lava channel* (lava sweeping round one side, a bridge over it
  to the side doorway). **The game scrolls `UGK.lavaT.offset.x` (about 0.02 per second) and `UGK.lavaFT.offset.y`
  (about 0.5 per second).**
- **Dark cave** (near-black rock, nothing lit): *Dark cave* (a 9 m chasm with a plank bridge, glowworms);
  *Sinkhole* (a round shaft 24 m deep with a rough lip, diamond and gold veins on the far side); *Glowworm grotto*
  (still black water, 46 glowworms on the roof); *The maze* (rock pillars floor to roof); *Bat roost* (a 6.5 m dome,
  bats hanging in clusters, guano under them).
- **The Geode** (a dead end, through a narrow neck): a shell of banded stone tinted to its crystals (`geoA`, `geoC`,
  `geoT`, `geoS`) lined all over, walls and dome, with a dense carpet of single six-sided crystals (about 1,300, at
  least 27 cm apart, scattered, not in rows), all pointing in towards the middle with a little wobble; their sizes
  come in patches (world noise), now and then a giant, about 1 in 40 clear and blazing; gem veins between them. The
  first version (random clusters pointing every way) looked messy (the user's note), the second (crystals in rows)
  like a pegboard. About 55,000 triangles for the room, one mesh per material. *Amethyst* (purple), *Celestine*
  (pale blue), *Citrine* (gold, gold veins), *Smoky quartz* (dark, a few clear).
- **Hot seam** (a dead end, through a narrow neck): faintly glowing green rock, green crystals at the foot of the
  wall, uranium veins. *Green spring* (a glowing green pool with steam); *Core shed* (crates of glowing drill cores,
  an old core drill on a tripod).
- **The old shaft** (1 in 100, in the working face farthest from the shaft): a short timbered drive into the face,
  a rock wall across it with door 60 (wood, brass number plate, iron straps) in a timber frame, an OLD WORKINGS
  board, darkness behind the door.
- **Previews:** "Mine Level 3" (a whole level 3 from the plan; the old shaft is forced on, with a switch) and "Mine
  Level 3 Rooms" (every version, the three stations and the old shaft).

Checked: the z-fight and floating checker on all 24 versions built on their own and on whole level 3s of mines #1,
#52, #777 and #4242; the floating-vein test (none float); `node quarry-under-check.js`; level 1 and 2 again after the
kit changes. Found and fixed on the way: two gold veins on the same spot by the lavafall, the fan blades sharing a
face with their hub, the hot seam's rock too green (and its neck now ordinary rock), the lavafall landing short of its
pool.

## Checks
- Every level is one connected place, reachable on foot from the cage on level 1 (the generator guarantees it; test
  a few hundred seeds).
- Two co-op players get the same mine from the same seed.
- No gaps where pieces meet, no floating stalactites, nothing standing in lava, the water at your knees.
- The mine builds without a hitch during the cage ride, and isn't built when nobody goes down.
