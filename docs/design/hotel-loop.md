Status: ideas approved 2026-10-19 (all of A-H) · part 1 (A, C, E, F, G, H) approved · ready to build · part 2 (B floors, D creatures) plan approved · floor looks approved · ready to build (`models/hotel.js`) · the lift lobby in review

# The hotel: how the run plays now, and what to change

Line numbers are in `src/bak519.html` unless another file is named.

## How a run plays now
- **Length.** One run is doors 0 → 111 (`EXN=111`), 112 rooms with no timer. A guess: 30-60+ minutes.
  - You can save and continue a run (`runSave`; co-op continue in dx543), but the run has no stages or rest points.
- **Fixed landmarks, the same every run:**
  - doors 25-34 and 65-74: Seek chases (`CH=[25,65]`)
  - door 50: Figure's library
  - door 60: Jeff's shop
  - door 100: the boiler hall (10 breakers)
  - doors 101-110: the meltdown, ending in the exit at 111 and the car park ending
  - every 8th door: a locked door
  - every door where n % 5 = 3: a rain-window (Grin) room
- **In between.** Each room is one of about 16 layouts (half the time), a plain hallway variant otherwise, plus:
  - streaks: office floors (from door 4, 10%), archive (from 3, 8%), stairwell with Creak (from 6, 6%)
  - turns and side rooms (dx590)
  - rare rooms: flood, steam, casino, pets
- **Danger:**
  - Rush (45% from door 2) and Ambush (25% from door 30): at most one every 4 doors.
  - Screech: in dark rooms (14% from door 6).
  - Creak: in stairwells.
  - Honcho: in the boss office.
  - Grin: 1% of rooms.
  - Figure: at doors 50, 100 and 101-110.
  - Seek: at 25 and 65.
  - Fake doors: 25 damage.
- **Loot.** Drawers give gold 5-34 (44%), vitamins (11%), lockpicks (9%), a flashlight (5%), a lantern (3%), and rarities: crucifix 0.6%, Guardian Angel 0.12%, the five passives 0.125% each. Side-room drawers only ever have gold, vitamins, lockpicks, a flashlight or a bandage.
- **Gold** is the only hotel currency. It buys four cheap pre-run items (vitamins 15, lockpicks 25, lantern 30, flashlight 50), Jeff's ten items at door 60, and revives (400/800/1200…). **It is halved at the end of every run, including when you escape** (`goldKeep`, called by both the death and the win menus).
- **What carries over between runs:** badges (122, cosmetic), skins, stats, best door (capped at 100), the daily streak, and the Gilded Lantern. There is no hotel XP and nothing to unlock that changes play.
- **Modes:** about 40 modifiers (more gold, harder), the Daily Run (door 20-30, seeded), the Gilded Gauntlet, DOORS BUT DESERT, Retro.

## What makes the loop weak
1. **Every run has the same skeleton.** Seek is always at 25 and 65, the library at 50, Jeff at 60, a locked door every 8th door, rain every n%5=3. After two runs you know what comes next.
2. **No difficulty curve after door 30.** Spawn rates never rise. Doors 35-49 and 75-99 are long stretches of the same mix, and the run is long enough that this drags.
3. **Gold has nowhere good to go.** Halving it even on an escape, a shop with four cheap items and no unlocks means there's little reason to grab gold, take risks or come back for another run.
4. **Exploring doesn't pay.** Side rooms have worse drawers than the main room. Rare items are so rare that most runs never see a crucifix.
5. **The cast is small for 112 rooms.** Rush and Ambush do most of the work. Eyes, Halt and Timothy already have models and lines on the desert bus but never appear in the hotel.
6. **Small bugs that affect the loop:**
   - `suite` and `svc` rooms can never roll: the list has 19 entries but is picked with `random()*16`.
   - Best door is capped at 100, so the meltdown and the exit don't count.
   - Creak, Pharaoh and other kills are dropped from the stats on reload (`svApply` keeps 9 causes).
   - The Rush death tip says "wardrobe".
   - A duplicate `miner` badge id makes "Shift worker" impossible.

What already works and should stay: the room variety, the streaks (offices, archive, stairwell), the modifiers, the Daily Run, Seek's crossroads, the finale and meltdown.

## Ideas to pick from
Each one is independent. They can be mixed.

**A. Shuffle the skeleton.** Keep the same beats but move them each run, seeded so co-op stays in sync:
- Seek 1 somewhere in 20-35, Seek 2 in 60-75.
- Jeff's shop somewhere in 40-58, and a second, smaller "vending room" between 75 and 90.
- Locked doors at random (about 1 in 8) instead of every 8th.
- Rain rooms at random.

The library stays at 50 and the boiler at 100 as the two big anchors.

**B. Floors with a rest stop.** Split the run into four floors (1-25, 26-50, 51-75, 76-100), each with its own look and its own mix of entities, then the finale. Between floors comes an elevator ride (a 20-second breather): it saves the run, you can buy a few things, and the next floor's threats are shown. Runs feel like progress, and co-op players who join late start at a floor.

**C. A real difficulty curve.** Tie the rates to the floor (or the door):
- The event gap shrinks from 4 doors to 3, then 2.
- Ambush gets more passes later.
- Dark rooms go from 14% to about 30% by the 90s.
- Fake doors appear more often later.

The early rooms get a little easier, so new players learn before it bites.

**D. New entities from things that already exist:**
- **Halt:** a long blue corridor. When he says "TURN AROUND" you walk backwards, otherwise he hits you.
- **Eyes:** a glowing cluster in a room that hurts while you look at it. Look away and walk past.
- **Timothy:** a spider in a drawer, a jump scare and 5 damage, about 1 drawer in 60.
- **Dupe:** a room with two or three doors; only the one with the right room number is real. A wrong door hurts and spawns a lunge.

Each would start at a different floor, so the cast grows as you go.

**E. Make gold worth having:**
- Keep all your gold when you escape (halve it only on death).
- A bigger pre-run shop: the crucifix, the passives (one each per run), and a "second wind" revive token.
- **Knobs** as a second currency earned per door reached, paid out at the end even when you die. They're spent on cosmetic skins and run perks (start with a lighter, an extra hiding-spot sense, a 10% Jeff discount) unlocked one by one.

Gold would buy things for this run; knobs would mean every run counts.

**F. Make exploring pay.** Side rooms get the full drawer table, with better odds since they're off the path. About 1 in 10 side rooms is locked and has a richer stash (a lockpick decides). A guiding light leads to a secret stash once per floor. The crucifix goes from 0.6% to about 1.5% in side rooms.

**G. Run goals.** Each run rolls three small goals: "hide from 3 Rush without a locker", "escape the library without being heard", "open 10 side-room drawers". Each pays knobs or gold. They're shown in the pause menu and the elevator.

**H. The fixes in point 6 above.** These are small and could ship with anything.

A sensible first package: **A + C + E + H** (fresh runs, a curve, rewards that matter, the fixes). Then **B** and **D**, which need models and rooms. **F** and **G** are cheap add-ons to either.

---

# Part 1: the spec (A, C, E, F, G, H): game rules only, no new models

General rules for everything below:
- **Co-op determinism.** Everything about the run's shape is rolled from the run seed (`mpSeed || soloSeed`) with its own RNG (`dxRng(seed ^ 0x51ED)`), once, at run start, into one object `RUNPLAN`. It is never rolled with `Math.random`, so all players and every Continue get the same plan. Goals (G) are per player.
- **Modes left as they are:** the Daily Run, the Gilded Gauntlet and DOORS BUT DESERT keep their own rules. Retro Mode uses the new rules.
- **A new modifier, Classic layout** (`classic`, +0% gold) brings back the fixed doors (Seek at 25/65, Jeff at 60, locks every 8th, rain every n%5=3) for anyone who likes it.

## A. Shuffle the skeleton
`RUNPLAN` holds:
- **`seek: [s1, s2]`**: s1 in 20..30 and s2 in 60..70 (each chase is 10 rooms, as now). `CH` stops being a constant: `chIdx` reads `RUNPLAN.seek`, and every other use of `CH` and of the numbers 25 and 65 for the chases has to follow it (search for `CH[`, `25` and `65` near Seek code; the crossroads in dx594 use `chIdx`).
- **`jeff`**: one door in 41..47 or 52..58, at least 3 doors after the end of chase 1. It replaces `nn==60` in the room pick, so `noshop` still removes it.
- **`back`**: one door in 80..92, at least 3 doors after chase 2 ends. It is **Jeff's back room**: the Jeff room again, but only 4 items picked from `JSHOP` (seeded), 1 of each, at the normal price, and no tip jar. Its sign says "JEFF'S BACK ROOM · LAST STOP BEFORE THE BOILER".
- **`lock`**: a set of door numbers. Each door from 3 to 99 is in it with chance 1/8 (1/4 with the `lock` modifier), but never within 3 doors of the last one (1 with `lock`). It replaces `nn%(MODS.lock?4:8)==0` in the `locked=` line; all the other conditions on that line stay, so locked doors still never land in chases, offices and so on.
- **`rain`**: a set. Each door from 3 to 99 is in it with chance 1/5, never two in a row. It replaces every `nn%5==3` and `nn%5!=3` in room generation (the rain windows, Grin's room, `cw0`, the dark-room roll). Use one helper, `isRain(nn)`.
- **The library stays at 50, the boiler at 100, and the meltdown and exit after it.** Streak cool-downs that avoided 50/60/98 and the chases ("blocked near 50, 60, 98") must now avoid `RUNPLAN.jeff`, `RUNPLAN.back` and both chases.
- The Room Inspector (dx592) should show `RUNPLAN` in its desync report.

## C. A real difficulty curve
Four bands by door: **1-14, 15-39, 40-69, 70-99** (part 2's floors will replace these).

| | 1-14 | 15-39 | 40-69 | 70-99 |
|---|---|---|---|---|
| Doors between Rush/Ambush (`nn-evLast`) | 6 | 4 | 4 | 3 |
| Chance of an event in an eligible room | .30 | .45 | .50 | .55 |
| of which Ambush (from door 30) | 0 | .25 | .25 | .35 |
| Ambush passes | - | 2 | 2-3 | 3-4 |
| Dark rooms (Screech) | 0 before 10, then .08 | .12 | .18 | .26 |
| Fake-door rooms and fake side doors (their rolls) | x0.5 | x1 | x1 | x1.5 |

- The table changes the numbers in the event roll in `mkRoomRaw` (`r<.25` / `r<.45`, `nn-evLast>=4`) and in the dark roll (`Math.random()<.14`).
- The `rush` modifier and the Gauntlet keep their own numbers.
- The 4-door rule in `setCur` (`r.n-evAt>=4`) uses the same table.
- Grin starts at door 15 instead of 6.

## E. Gold and knobs
- **Escaping keeps all your gold.** `goldKeep()` halves it only on death. The win menu's line becomes "🪙 You keep all N gold."
- **The pre-run shop (`SH`)** gains:
  - Crucifix: 300 (max 1, `pre.c`)
  - Bandage: 20
  - Battery: 20
  - Guardian Angel: 600 (max 1, `pre.h`)
  - Second Wind: 250 (max 1, new `pre.w`). The first time you would die, you get up on the spot with 40 HP and 3 s of safety. It doesn't work with the One Life modifier, and it isn't kept after the run.
  - Each passive from `PV` (shoes, magnet, clover, battery, vest): 150 each, one each.

  All of these appear in Locker → Shop and at the lobby desk (`hubBuy`).
- **Knobs** 🔘 are a new currency (`SV.kn`, saved through `svExtras` in dx574). At the end of every run, dead or escaped (not on Save & exit; when the run is continued and ends):
  - 1 knob per door reached (counted up to 111), plus 50 for escaping, plus goal rewards (G);
  - times the modifier bonus (`MODG`);
  - nothing in debug runs. In co-op, each player gets their own.

  The end screen shows "🔘 +N knobs".
- **Perks**, bought with knobs in a new Locker tab, **Perks**: each is bought once and kept forever. You equip up to 1 at first; a second slot costs 300 knobs and a third 600. They are off in the Daily Run and the Gauntlet. Equipped perks show on the modifier screen. In co-op each player uses their own.

| Perk | Knobs | Effect |
|---|---|---|
| Pocket Torch | 120 | start every run with a flashlight at half charge |
| Light Sleeper | 150 | the lights flicker 4 s before Rush/Ambush instead of 3 |
| Haggler | 100 | Jeff's prices -10% (both shops) |
| Deep Pockets | 80 | +1 vitamins at the start |
| Lockpicker | 80 | +1 lockpick at the start |
| Lucky Find | 200 | rare drawer items x1.25 |
| Thick Skin | 250 | max HP 110 (and 55 with Fragile) |
| Second Look | 180 | the Item Radar's ping range +50% (only if you carry one) |

## F. Make exploring pay
- **Side-room drawers** (`srDrawer`) use the main drawer table, not the small one, with gold 10-45 instead of 5-34. The rare items (crucifix, Guardian Angel, passives, rainbow flashlight, radar) are x2.5.
- **Locked side rooms:** 1 in 10 side rooms has a locked door (lockpick or key, like the main doors).
  - Inside is a **stash crate**: press E for 40-80 gold plus two rolls of the side-room table.
  - Rolled from the room seed, so co-op matches. The crate is an existing crate prop with a lid.
- **One hidden stash per band** (the four bands of C; door picked in `RUNPLAN`, in a plain hallway room):
  - a loose vent panel low on a wall with a faint sparkle every few seconds;
  - press E for 60-120 gold and one rare roll;
  - in co-op the first player to open it shares the gold with everyone.
- **The crucifix** in normal drawers goes from 0.6% to 0.8%.

## G. Run goals
At the start of each run (not Daily or Gauntlet) each player gets **3 goals** from the list, rolled from their own id and the run seed. Goals show:
- in the pause menu;
- as a toast when done ("✔ Goal: Open 20 drawers · +20 🔘");
- in the end screen.

The knobs are paid with the run's knobs, so a goal finished in a run that ends in death still pays.

| Goal | Knobs |
|---|---|
| Open 20 drawers | 20 |
| Open 8 side-room drawers | 25 |
| Survive 3 Rush or Ambush without a locker or bed (high ground or vent) | 40 |
| Hide from Ambush in a bed | 25 |
| Reach door 50 without Screech hurting you | 25 |
| Finish a Seek chase without a hand hitting you | 35 |
| Get through the library without Figure chasing you | 40 |
| Buy something from Jeff | 15 |
| Open a locked side room | 25 |
| Find a hidden stash | 30 |
| Use a crucifix | 20 |
| Pick 3 locks | 20 |
| Reach door 75 without reviving | 35 |
| Finish an office floor or crack an archive code | 25 |
| Reach door 35 holding 150 gold | 20 |
| Escape the hotel | 50 |

A goal that can't happen in a run (no office streak, no Ambush yet) just doesn't pay. The counters live in a per-run object saved with the run (`runSave`), so Continue keeps them.

## H. Fixes
- **The room-type roll:** `[...][Math.random()*16|0]` has 19 entries, so `suite` and `svc` never roll. Use `*19|0` and check the guest suite and service rooms still build cleanly, since they have never been seen.
- **Best door:** `SV.best` counts up to 111 (it is capped at 100 in both the death and the win code).
- **Kill stats:** `svApply` keeps every kill cause in `SV.k` (it only keeps 9; Creak, Pharaoh and the others are lost on reload).
- **The Rush death tip:** say "locker or bed", not "wardrobe".
- **The duplicate `miner` badge id** (dx581:247) gets its own id, so "Shift worker" can be earned.
- **The FLOOD label:** the "FLOOD n/10" label in `enter()` for Desert mode can't show; either remove it or make it reachable.
- **The stairwell header comment:** it says 4 rooms; the code and the hint say 5. Fix the comment.

## For the player (the How to play and the changelog)
- "The hotel is different every run: Seek, Jeff's shop and the locked doors move."
- "Escaping keeps all your gold."
- "Earn knobs every run, even when you die, and spend them on perks."
- "Side rooms are worth a look: better drawers, and some are locked with a stash inside."
- "Three goals every run."

---

# Part 2: the plan (B floors, D new creatures): needs models, so plan first

**The creatures use the game's own models, as they are** (the user's call, 2026-10-19): Halt, Eyes and Timothy already
exist in the game (`entModel`, the desert bus passengers), so the hotel reuses those models with no new ones. Dupe is
not needed: the hotel's fake doors already do that job.

## B. Four floors and the elevator between them
| Floor | Doors | Look | What lives there (on top of what part 1 already has) |
|---|---|---|---|
| 1 · Guest Floors | 1-24 | today's hotel: wood, wallpaper, carpet | Rush; Screech from 10 |
| 2 · The Old Wing | 26-50 (library at 50) | faded green wallpaper, peeling and dusty, dimmer lamps, cobwebs | + Ambush, Seek's first chase, **Halt** |
| 3 · Staff & Service | 52-74 | cream tiles, lino floors, pipes on the ceiling, strip lights, staff signs | + Seek's second chase, **Timothy** in drawers, more Creak stairwells |
| 4 · The Deep Hotel | 76-99, then the boiler at 100 | dark red, water stains, puddles, lights that flicker | everything, + **Eyes** and more fake doors |

- **The elevator break** is rooms 25, 51 (right after the library) and 75: each is a lift lobby (B2 below).
  - You step into an elevator lobby: a lift, a vending machine (gold), and a board with the next floor's name and what lives there.
  - The game saves there.
  - The doors close, then a 15-20 s ride with the floor counter ticking and a little shake; you can hear the next floor before you see it.
  - In co-op the lift waits for everyone, or leaves after 30 s with whoever is in it, and the rest catch up at the next floor's first room.
- **The looks are texture and light swaps** in the existing room builder: each floor maps the room textures (`TX` keys such as wall, floor, ceil) to its own set, plus a light tint. No new room layouts are needed. The streak rooms (offices, archive, stairwell) keep their own looks.
- **Part 1's ranges change when floors are on**, so each chase sits inside one floor: Seek 1 in 27..38, Seek 2 in 52..64. Jeff stays in 41..47 or 52..58. The back room stays in 80..92.

## D. Three creatures in the hotel, with the game's existing models
- **Halt** (floor 2 and later; `entModel('halt')`):
  - a long dim corridor with Halt at the far end;
  - now and then "TURN AROUND" flashes: walk backwards until it fades. Walking forward while it's up costs 30 HP and pushes you back.
  - Reach the far door to end it.
- **Timothy** (floor 3 and later; the game's Timothy model): about 1 drawer in 50 has him. He jumps out at your face: 5 damage, and the drawer is empty. A Lucky Find perk owner sees a leg poking out first.
- **Eyes** (floor 4; `entModel('eyes')`):
  - floats in some rooms. While it's on your screen within 12 m, you lose 10 HP a second and the screen tints;
  - look away, or hide;
  - a crucifix sends it away for the rest of the room.
- **Fake doors** (the game's own; the Dupe job): more of them on floor 4 (part 1's x1.5 already does this).

## B1. The floor looks (model: `docs/design/models/hotel.js`, approved)
Floor 1 stays exactly as it is now. Floors 2-4 change only textures, trim colours, the hall lamps, the light tint and
the fog, plus a little dressing. No layout, obstacle, door or furniture changes.

| | Walls | Lower panels | Floor | Ceiling | Lamps | Dressing |
|---|---|---|---|---|---|---|
| 2 Old Wing | faded green striped paper, bare-plaster patches, a cleaner square where a picture hung | grey-green painted, chipped | worn green carpet, threadbare patches | yellowed, cracked, an old water ring | old glass bowls, dimmer (.58) | cobwebs in the wall/ceiling crease and the 4 corners, up to 4 strips of paper peeling off |
| 3 Staff & Service | cream 25 cm tiles, one teal row at 1.5 m | teal tiles | speckled lino, scuffs | painted, plain | twin-tube strip lights (cool white, .75) | two pipes along one side of the ceiling (copper and a lagged one) bending up into the ceiling at each end, hangers every 2 m; up to 3 staff signs |
| 4 Deep Hotel | dark red paper with water running down from the ceiling, mould | near-black wood, a wet tide line | dark red carpet, wet patches | stained, brown rings | bare bulbs on cords that flicker (`hflFlick`), 1 in 5 dead | 2-4 puddles, each under a ceiling stain with a drip falling into it and a ripple |

**Wiring notes**
- `HFL[f]` holds everything per floor: `tx` (texture key swaps), `trim` (colour swaps for the rail 0x6e4326, the
  baseboard 0x2a1608 and the crown 0xd8c8a8), `lamp` {c, i, dead, flick}, `amb` [colour, intensity], `fog` [colour, near, far].
- Register `hflTex(f)` into `TX` once at load under the `tx` names (hfWall2... hfDoor4). While a hall room of floor f
  is built (the rooms where `hotelW` is true, and their side rooms), `T(k,a,b)` uses `HFL[f].tx[k]` when it has one.
  **The new wall tiles are 4 m tall**: for a wall key, halve b (`T(key, a, b/2)`), and the piece over an opening
  (`wOff(...,.5)`) needs offset .75 instead of .5. Wainscot, floor, ceiling and door keep the game's repeats.
- Trim: swap the three colours in `box()`/`boxMat` during the same build (a Map lookup on number colours).
- Lamps: on floors 2-4 the hall lamp box (`box(0,LYz,z,1.2,.12,.5,0xfff0c0,0xffd890)`, the hotelW branch only) becomes
  `hflLamp(f, HY>4 ? HY-4 : 0)`, its group placed at (0, HY-.04, z) (1 cm into the ceiling); the `mkLight` goes to
  y = HY-.04+`at` with `HFL[f].lamp` colour and intensity. Floor 4: 1 lamp in 5 is dead (light 0, bulb emissive 0);
  the rest run `hflFlick(lampNo, t)` on both the light and the bulb's `emissiveIntensity`.
- Light and fog: on entering a room of floor f set the ambient light (`S` has one AmbientLight, 0x2a2014 .7 now) and
  `S.fog`/`S.background` from `HFL[f]`. Rooms with their own look (offices, archive, stairwell, library, catwalks...)
  keep what they do now.
- Dressing: after a hotelW hall is built, `hflDress(f, {g:G, L, HX, HY, zA:.95, zB:ez+.05, occ, open:wg, seed:nn})`;
  run its `anims` each frame while the room exists. **It uses its own random numbers** (`hflRng`, seeded from the room
  number), never `Math.random`, so co-op rooms stay identical. Everything it makes is decoration (no obstacles).
  Mark it all `userData.noSeam=true`.
- Not checked: the game's wing pieces and the end-wall trim already have end faces that meet (the checker flags them
  on floor 1 too); nothing new adds to that.

## B2. The lift lobby and the lift (model: `hotel.js`, `hflLift` and the lobby things; in review)
- **Rooms 25, 51 and 75** are lift lobbies (so floor 3 is now 52-74). HX 5, HY 4.2, L 15, built as a hotelW hall in the
  look of the floor you are **leaving**, with a marble floor (`hflMarbleT`, 2 m tiles) and two ceiling lamps
  (z -2 and -10). No wardrobes, no side rooms, no events, no Jeff/Figure/locked roll in these rooms.
- **The lift** (`hflLift({HX, HY, mat, col})`) sits at the end: group at (DX, 0, ez). It builds a full-width front
  wall at z = ez + `HFLD` (2.6) with the lobby trim, the landing doors in a dark-wood portal with a brass frame, the
  half-moon floor dial, the call buttons and two sconces; the shaft walls; the car; and the back portal, which fits the
  room's normal 1.6 x 3 m exit-door hole. **The back landing doors replace the exit door** (no `pv` door leaf in
  these rooms). `mat(key,a,b)` must return the room's wall/wainscot material (so the floor swaps apply), `col(c)` the
  trim colour swap.
- **It is a through car**: in at the front, out at the back onto the next room. Nothing moves, so no physics or
  teleport: the car shakes (`car.position` jitter, 4 mm) and the dials turn.
- **The ride** (the preview's timings): when every player in the run is inside the car (|x| < 1, z between ez+.2 and
  ez+2.4), or 30 s after the first one steps in, the front doors close (1.5 s, `doors('f', k)`). Players left in the lobby
  are moved into the car just before the doors shut (simplest co-op answer; the plan's "catch up" is not needed then).
  Then 12 s "up": `show(at, to, 1)` updates the display, the button panel and both dials (`front.dial`/`back.dial`
  `.userData.set(f + p)`), the car shakes with a 0.3 s light dip half-way, the next floor's sounds fade in. Ding, then
  the back doors open (1.5 s, `doors('b', k)`). The next room (nn+1) is built while the doors are shut.
- **Collision**: the front wall is solid except the 1.2 m door gap while the front doors are open; the car's side and
  end walls (inside x ±1, z ez+.2..ez+2.4) are solid except the open door gaps; the shaft is closed.
- **The lobby things**, back on the wall face, facing into the room:
  - `hflVend()` vending machine (1 x 1.9 x .8 m), left wall at z -4. E opens the gold shop from part 1 (E).
  - `hflBoard(next)` next-floor board, right wall at z -5, y 2.2. Text comes from `HFL[next]` and its list of what lives there.
  - `hflBook()` guest book lectern, right side (HX-1.2, z -9), facing the room. Walking up to it saves (or the room
    saves on entry; the lamp `glow` turns green, emissive 0x30ff60, once saved).
  - `hflBench()` left wall at z -8; `hflPlant(dead)` in both front corners (dead plants in the floor-3 lobby).
- All lobby text canvases use `hflRng` or fixed text, never `Math.random`.
- Checker: clean apart from the game's own trim end faces (the same as every hall) and the dial rim ends, which sit
  inside its base bar.

## Order of work, once this plan is OK
1. The floor looks: a preview of one hallway in all four looks.
2. The elevator lobby and the lift (model and preview).
3. The creature rules: Halt's corridor, Timothy's drawers, the Eyes rooms (no models to make).
4. The wiring notes and the "what lives where" numbers.
