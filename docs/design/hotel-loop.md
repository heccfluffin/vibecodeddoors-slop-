Status: draft for discussion (2026-10-19) · nothing to build yet: the user picks what goes in

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
