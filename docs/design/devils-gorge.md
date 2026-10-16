Status: proposed

# Devil's Gorge: real fall, solid cave floor, new one-way lift

Model: `docs/design/models/gorge-lift.js` (`mkGorgeLift()`). Read its header first: it has the sizes, parts,
the `setLift(y, gate, hatch)` helper and the collision boxes.

## 1. Falling in: a real fall, not a teleport

**Now:** walking off the edge (`xpSafeTick` → `q.fling` with `gorge:1`) drops you straight down with no sideways
speed, spins the camera (`P.roll`), and on landing `deepEnter` can move you up to 8 m sideways to the nearest
`deepOK` spot. It feels like a cut to the bottom. Vehicles are worse: `xpVehGorge` respawns you on top as soon as the
car is 6 m down.

**Should be:**
- **On foot:** you keep the speed and direction you were walking (or running, or jumping) with. Gravity as for any
  fall (the same 18 m/s² `q.fling` uses). The camera stays upright: no roll spin. A small dip and shake on landing.
- You land **where you actually fall**. If that spot is blocked (a boulder in `q.deepB`), you slide off it to the
  nearest free spot within 1.5 m, not 8 m.
- No damage (the existing "soft drift of sand" idea stays). Keep the existing hint text and badge.
- If the gorge wall at that point slopes, slide down it instead of passing through it: while falling, keep the player
  at least 0.4 m inside the gorge edge (`GORGE.z0 + 0.4 … GORGE.z1 - 0.4`).
- **In a vehicle:** it falls the whole 30 m with its own physics (`v.air`, `vy`), lands on the riverbed and is wrecked
  if the landing speed is high (it will be: about 23 m/s). You get thrown out on landing (the normal bail-out),
  alive, at the bottom. **No respawn on top.** The wreck stays down there (El Goblino can still winch it back later:
  use `vehRestore` after you leave the gorge, not before).
- Police cars that follow you in: same fall, then wrecked. Keep the `copSay` line.

## 2. The secret cave floor has gaps

I couldn't find the gaps from the code alone (the chamber and tunnel floors meet their walls exactly, which is
already risky). Fix it so there can't be any:
- Put **one solid dark rock slab under the whole cave** (tunnel + chamber), 0.6 m thick, top at `y = -30.02`,
  reaching 0.8 m past every wall on all sides. Any gap then shows rock, never sky or the desert.
- Make each floor piece run 0.3 m **under** the walls instead of stopping at their inner faces.
- Where the tunnel meets the gorge riverbed, overlap the tunnel floor 1 m into the riverbed floor (and check they are
  not at the same height there: lower the tunnel floor's overlap 1 cm, or it will z-fight).
- Claude Code: if you know where the user saw the gaps (or they send a screenshot), fix that spot too.

## 3. The lift: real shaft, rope, one way only

Replace the old lift in `xpGorgeCave` ("the cage lift: a shaft up to the surface …" down to `q.gcage=…`) with
`mkGorgeLift()`:
- Place it at `GCV.lx, GCV.lz`, ground level, `rotation.y = Math.PI` (gate faces world +z, towards the gorge, where
  you step out now).
- **Cut a 3.8 × 3.8 m hole in the cave ceiling** around the shaft (split the chamber ceiling box into 4 boxes round
  the hole). The model's collar under the ceiling hides the edge.
- **Remove** the old 3.4 m ground plate at the headframe, and make sure no desert ground is drawn inside the shaft
  opening (3.4 × 3.4 m). Check from inside the cage on the way up: you should see the shaft walls, then the hatch
  opening, then sky. No sand surface cutting across the cage.
- **One way: up.** Remove the "[E] Ride the old lift DOWN" prop. On the surface the sign says "LIFT GOES UP ONLY ·
  NO RIDES DOWN". If the player presses E at the top, nothing happens (no prompt).
- The ride, using `setLift`:
  1. The cage waits at the bottom with its gate open (`setLift(-30, 1, 0)`).
  2. "[E] Ride the lift up to the surface" (keep the prompt). The gate shuts in 0.6 s, the cage rises over 7 s (keep
     the current ease and the rattle sounds), the hatch opens over 1 s once the cage is above -4 m.
  3. At the top the gate opens and you step out to the front (world +z, 2.6 m out, as now).
  4. 3 s later the gate shuts and the **empty cage goes back down** (7 s), the hatch shuts once the cage is below -3 m,
     and the gate opens at the bottom. In co-op everyone sees this (send the cage height with the existing lift sync,
     or a simple start time).
  5. If another player is in the cave when the cage is at the top, they wait for it to come back down. The prompt at
     the bottom says "The cage is on its way down…" until it arrives.
- The player is carried by the cage: `P.dy = cage y + 0.12` (the cage floor), so you never float above or sink into it.
- Collision boxes as listed in the model header (surface `q.obs`, cave `q.deepB`).
- Map: keep the "Old Gorge Mine" map rectangle; make it 4.4 × 4.4 m.

## What to avoid

- No teleports, no screen cuts. The fall and the lift ride are all seen.
- Don't let the falling player pass through the gorge walls or end up "deep" outside the gorge (the `deepWatch`
  watchdog in dx534 would pull them up again; keep it working).
- No z-fighting where floors overlap (offset 1 cm).
- Nothing floating: the cage always hangs on the rope; the rope always reaches the sheave.

## How to check it (short)

1. Walk off the gorge edge at a run: you arc out, fall, land on the riverbed below where you left. No spin.
2. Drive a car off: it falls, smashes, you are thrown out at the bottom.
3. Walk the whole cave floor edge with the camera low: no light coming through anywhere.
4. Ride the lift: look up the shaft (walls, then the hatch opening, then sky), step out at the top, watch the empty
   cage go back down and the hatch close. Try E at the top: nothing.
