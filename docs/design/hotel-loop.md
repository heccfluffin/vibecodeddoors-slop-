Status: ideas approved 2026-10-19 (all of A-H) · part 1 (A, C, E, F, G, H) approved · ready to build · part 2 (B floors, D new creatures) plan below, waiting for the user's OK before models

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

**The creatures are our own.** Idea D said "Halt, Eyes, Timothy, Dupe". Those are characters from the original Doors,
so the hotel gets **original creatures with the same kinds of challenge** instead (and the desert bus's existing
passengers are left alone).

## B. Four floors and the elevator between them
| Floor | Doors | Look | What lives there (on top of what part 1 already has) |
|---|---|---|---|
| 1 · Guest Floors | 1-24 | today's hotel: wood, wallpaper, carpet | Rush; Screech from 10 |
| 2 · The Old Wing | 26-50 (library at 50) | faded green wallpaper, peeling and dusty, dimmer lamps, cobwebs | + Ambush, Seek's first chase, **the Usher** |
| 3 · Staff & Service | 51-74 | cream tiles, lino floors, pipes on the ceiling, strip lights, staff signs | + Seek's second chase, **drawer rats**, more Creak stairwells |
| 4 · The Deep Hotel | 76-99, then the boiler at 100 | dark red, water stains, puddles, lights that flicker | everything, + **the Portrait** and **the Doorman** |

- **The elevator break** comes at doors 25 and 75, and right after the library (between 50 and 51).
  - You step into an elevator lobby: a lift, a vending machine (gold), and a board with the next floor's name and what lives there.
  - The game saves there.
  - The doors close, then a 15-20 s ride with the floor counter ticking and a little shake; you can hear the next floor before you see it.
  - In co-op the lift waits for everyone, or leaves after 30 s with whoever is in it, and the rest catch up at the next floor's first room.
- **The looks are texture and light swaps** in the existing room builder: each floor maps the room textures (`TX` keys such as wall, floor, ceil) to its own set, plus a light tint. No new room layouts are needed. The streak rooms (offices, archive, stairwell) keep their own looks.
- **Part 1's ranges change when floors are on**, so each chase sits inside one floor: Seek 1 in 27..38, Seek 2 in 52..64. Jeff stays in 41..47 or 52..58. The back room stays in 80..92.

## D. Four new creatures (original)
- **The Usher** (floor 2 and later; the walk-backwards challenge):
  - A long dim corridor with a tall, faceless bellhop of blue smoke holding a lantern at the far end.
  - Now and then the lantern flares and "BACK UP" flashes. Walk backwards (away from him) until it fades; walking forward while it's up costs 30 HP and pushes you back.
  - Reach the far door to end it.
- **Drawer rats** (floor 3 and later; the drawer jump-scare):
  - About 1 drawer in 50 has a rat. It leaps out at your face with a squeak and runs off: 5 damage, and the drawer is empty.
  - A Lucky Find perk owner sees whiskers poking out first.
- **The Portrait** (floor 4; the don't-look challenge):
  - In some rooms a big gilded portrait hangs on a wall. Its painted figure has been scratched out, leaving a pale shape that turns to follow you.
  - While it's on your screen and you're within 12 m, you lose 10 HP a second and the screen tints. Look away, or cover it by hiding.
  - A crucifix burns it for the rest of the room.
- **The Doorman** (floor 4; the pick-the-right-door challenge):
  - A room with three doors, each with a brass number plate. Only one shows the right room number; the others are a digit off.
  - Open a wrong one and a long grey arm in a doorman's sleeve shoots out: 35 damage, and that door slams.
  - The real door opens normally.

## Order of work, once this plan is OK
1. The floor looks: a preview of one hallway in all four looks.
2. The elevator lobby and the lift (model and preview).
3. The four creatures, one batch (models, poses, a preview of each in a room).
4. The wiring notes and the "what lives where" numbers.
