Status: building (no more self-wrecking AI cars shipped in r606; the rest next)

# Police: no random explosions, more patrols, speed checkpoints

Model: `docs/design/models/speed-checkpoint.js` (`mkSpeedCheckpoint()`), with `setSpeed`, `update`, `warn`, `CAR`.

## 1. A police car blew up by itself at a road corner

**Likely cause:** AI-driven cars collect crash damage like the player's car. `vehPhys` calls `vehDamage` on every hard
hit; a patrol car that clips a corner or a wall a few times at speed reaches 100 and `vehBlow` fires, with nobody near.
The Highway Patrol car's `hwpPhys` hides its owner around the physics call, which may also skip some of the guards.
(r605's new driver should hit things less, but it can still happen.)

**Fix:**
- AI cars (police, Highway Patrol, backup units, NPC traffic, squads) take **no damage from hitting scenery**. They only
  take damage from: a player's vehicle ramming them, explosions, weapons, the gorge.
- If an AI car is stuck and smoking anyway, it repairs itself when no player is within 100 m.
- Log (console, F8) every `vehBlow` of an AI car with the reason, so a repeat can be tracked.

## 2. More police out patrolling

**Now:** one patrol cruiser (`q.cop`, respawns on a timer), the Highway Patrol car (`q.hwp`) on its loop (`HWPR`),
and backup units only during a chase.

**Should be:**
- **3 patrol cruisers** on the desert roads at any time (Desert PD, the existing cruiser model), each on its own part of
  the road network: town and the bus stop; the airfield / Dusty Gulch side; the quarry / mesa / wind farm side.
- They drive at the speed limit (70 km/h ≈ 19.5 m/s), stop at junctions for a second, and now and then pull over for 10–20 s
  (parked on the shoulder, lights off) before carrying on.
- Any of them can start a chase the way the existing patrol does (`copPatrol` rules), and they join a chase within
  300 m as backup.
- When a cruiser is wrecked, a new one drives out of the Desert PD car park 60 s later.
- Only the host (lowest id, as `hwpTick` does) drives them; everyone sees them.
- Performance: cars more than 400 m from every player don't run physics; they just move along their route (no
  collisions) so they're in a sensible place when someone comes near.

## 3. Highway Patrol speed checkpoints

Sometimes the **Highway Patrol** (its existing dark car, `hwpDress`) sets up a checkpoint instead of cruising.

### When and where
- Every 6–10 minutes of desert time, 40 % chance: the HWP car drives to one of these straight stretches and sets up:
  the main road south of town, the long road east of the airfield, the road past Dusty Gulch, the speedway road.
  (Pick straights at least 200 m long. Claude Code: choose exact spots from `HWPR` and the `q.mapR` roads.)
- It stays 4 minutes, then packs up (cones and trailer vanish while nobody is within 60 m, or it drives off and they
  stay 30 s) and goes back to patrol.
- Map: a small 🚨 icon at the checkpoint while it's up.

### Setting up
- `mkSpeedCheckpoint()` on the shoulder, front (-z) facing the traffic in the busier direction; its `warn` sign 70 m
  before it on the same side. The HWP car parks at `CAR` (nose out).
- The board shows the speed of any car driving towards it within 120 m (`setSpeed(kmh)`; km/h = m/s × 3.6).
  The checkpoint works in **km/h** (the user's choice). The HUD speedometer still shows mph (`× 2.237`); ask the user
  whether to switch the HUD to km/h too, so the two match.
  Blank when nothing's coming. `update(dt)` while a player is within 150 m.

### Speeding: what happens (the user's choice)
- Limit **70 km/h**. Measured when the car passes the trailer (closest point, within 20 m of it).
- **1–39 km/h over: a fine.** Take it from your cash (gold): 25 gold + 3 per km/h over, e.g. 90 km/h = 85 gold.
  Hint: "🚨 HIGHWAY PATROL: 90 in a 70. Fined 85 gold. Slow down." No chase, no heat. If you can't pay, it's 10 heat instead.
- **40+ km/h over (110 km/h and up): the Highway Patrol chases you.** The board shows STOP · POLICE, the HWP car
  pulls out with lights and siren (`hwpGo(q,H,id,'speed')`) and adds heat as it does now for speeding.
- Each player is only fined or chased once per pass (don't fine them again while they're still within 120 m).
- Co-op: the host runs the checkpoint; the fine goes to the player who sped (send them a `hwps`-style message).
- The existing 30 m/s "speeding past the Highway Patrol" rule on patrol stays as it is.

### Knocking things over
- Hitting a cone tips it over (`rotation.x = 1.5`, sliding a little), no damage, small "thunk". The HWP officer says
  something dry once ("That cone had a family.") and it counts as 3 heat.
- Hitting the trailer is a crash like any other (it's in `q.obs`), and it's a crime (`CRIMES`: "ramming a speed trailer").

## What to avoid
- No checkpoint inside a town, at a junction, or on a bend.
- The cones must stand on the road surface (y of the road), not float or sink.
- Don't fine players who are walking, in the bus, or not driving (passengers).

## How to check it (short)
Force a checkpoint near the bus stop (debug), drive past at 60 km/h (nothing), 90 (fined), 120 (chased). Watch one patrol
cruiser drive its loop for a minute without blowing up.
