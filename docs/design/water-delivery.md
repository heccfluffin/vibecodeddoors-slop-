Status: proposed

# Water delivery: a man takes the water and pours it in

Models (in `docs/design/models/`):
- `water-tank.js`: `mkWaterTank()`, the tank, with `setLevel()`, `FUNNEL` and `STAND`
- `jerrycan.js`: `mkJerrycan(colour)`, the can, with `pour(f, len)`
- `caretaker.js`: `mkCaretaker(seed)`, the man, with `pose(name, t)` and a `grip` to hold the can

## Now
The squad's "Water delivery" job (dx571, `water`, `setup:'carry'`, `item:'can'`) has two soldiers carry green boxes
from the truck to a spot and back. Nobody receives them, and nothing happens to the water.

## Should be

### At each delivery spot
- **Water tower, Gulch water tower:** pour into the existing tower's base. If it has no low inlet, put `mkWaterTank()`
  next to its legs (it reads as a header tank). **Jeff's Oasis:** next to the pool. **Mining shack, Campfire:**
  `mkWaterTank()` stands there permanently (it's useful scenery even when no job is running).
- Each spot has one **caretaker** (`mkCaretaker(seed)`, a different seed per spot so they look different).
  He's there all the time (idle pose, a slow look round), and he **waves** when a squad truck arrives.

### The job, acted out
1. The truck parks with its tailgate 8–10 m from the tank's front (`FUNNEL` side). The soldiers jump down.
2. Two soldiers carry cans (now real `mkJerrycan()` cans, blue) from the truck and **put them down in a row** 1.5 m
   from the tank front (standing up: `position.y = 0.43`). They keep going until all 6 are down.
3. The **caretaker** walks to the row, `'take'`s a can, `'carry'`s it to `STAND`, faces the tank and `'pour'`s it
   (3.5 s). The stream shows and the tank's gauge goes up 12 % per can (`setLevel`). He goes back for the next one.
   (In the preview he walks to the tailgate; in the game the row on the ground is better: no one climbs on trucks.)
4. Empty cans go back on the truck: the soldiers carry them back while he pours.
5. When the last can is poured, he gives the squad a wave, and the job's "work" phase ends (as now, `cwWorkEnd`).
   Use the length of the pouring to set the job time instead of the fixed 28 s, with 28 s as the minimum.
- If no player is within 120 m, skip the acting: just raise the level and finish (as jobs do now when nobody's near).
- The tank level is per spot and drops slowly over the day (one can's worth every 5 minutes), so the next delivery
  has something to fill. Don't save it; it can start at 20 % each session.

### Other jobs that use `item:'can'`
Use `mkJerrycan(0x3a5a2a)` (olive, fuel) instead of the green box wherever the job is about fuel, and the blue one
for water.

## What to avoid
- The caretaker must not walk through the tank, the truck or the soldiers. Give him a straight path: row of cans →
  `STAND`. Put the row so that path is clear.
- Feet on the ground: his origin is between his feet; keep `position.y` at the ground height.
- The pouring stream must start at the spout and end at the funnel (the preview computes `len` from the spout's world
  height minus `FUNNEL.y`; do the same).
- Don't put a tank on a road or in a building (check with the map rectangles).

## How to check it (short)
Send a squad on a water delivery to the Mining shack and follow it. The caretaker waves, takes each can, pours it, and
the float in the gauge rises. One quick look at the Campfire tank with no job running: he stands idle by it.
