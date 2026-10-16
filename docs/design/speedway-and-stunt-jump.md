Status: proposed

# Speedway fixes and the new Quarry Skip booster jump

Models: `docs/design/models/booster-ramp.js` (`mkBoosterRamp()`) and `docs/design/models/landing-ramp.js`
(`mkLandingRamp()`). Their headers have the profiles, `q.ramps` entries, parts and collision boxes.

## 1. Speedway: invisible obstacles

**Now:** you bump into nothing in and around the Speedway (`xpSpeedway`, centre 300, -1830). There are `q.obs` boxes
with no mesh.

**Fix:**
- Find them, don't guess. Add a temporary debug view (owner/dev only, not shipped on): draw every `q.obs` box within
  150 m of the Speedway as a red wireframe at 1 m high. Walk and drive the track and the infield. Any red box with no
  visible thing inside it is a stray.
- Likely suspects (check these first): boxes left behind by later modules that moved or removed a prop (dx5xx
  "speedway" changes, crime spots in dx585 that spawn a "race car being stolen", the army "live-fire" and "PT" jobs
  that put down props at the Speedway and may not remove their obstacles), and tyre-wall boxes that are bigger than
  the tyres.
- Remove the strays. Where a box belongs to a real thing, make it match that thing's size (within 0.1 m).
- A squad job's props must remove their obstacles when the job ends (check `cwWorkEnd` and the dx571 job setups).

## 2. Speedway: the dragster's front wheels float

**Now:** the dragster's small front wheels hang in the air.

**Fix:** every wheel of the dragster touches the ground when it is parked and when it drives:
- Front wheels: radius about 0.3 m (`whr`), centre at y = 0.3 at the front axle (near the nose, z ≈ -3.6).
- Rear slicks: they set the ride height. Keep them as they look, with the bottom of the tyre at y = 0.
- Check the generic wheel placement in `mkVehModel` for `k=='dragster'`: it probably puts all four wheels at one
  height or uses one radius for both axles. Give the dragster its own front and rear wheel sizes and heights.
- Check in the garage preview and parked at the Speedway (`xpVehicles2`, 290, -1792).

## 3. Quarry Skip: steeper, with a booster over Lookout Mesa

**Now:** "STUNT JUMP · QUARRY SKIP" is a small 17° ramp at (-330, -1460) pointing -z (built in `xpStunts`).

**New:** replace that ramp with the booster ramp, and add the landing ramp on the far side of the mesa.

### Placement (world)
- Booster ramp: `mkBoosterRamp()` at **x -330, z -1464**, rotation 0 (it launches towards -z). Its lip is at z -1469.
  The booster strip runs z -1459 … -1447.
- Landing ramp: `mkLandingRamp()` at **x -330, z -1625.1**, rotation 0. Its back wall is at z -1618.6, its end at
  z -1631.6 (8 m short of the railway at z -1640).
- Map: both as `#a07040` rectangles; keep the "Stunt: QUARRY SKIP" map label on the booster.
- Move the sign of the old ramp (the model has its own sign; remove the old `sign(...)` for this one).
- Check nothing else is in the 6 m wide flight line (x -333 … -327) on the mesa top: the cabin, telescope and hermit
  must not be inside it, or the car hits them. The peak is 36 m up, so only tall things matter, but check.

### The launch
- A car "has boost" if it drove over the strip (any wheel inside x ±2.5 of the strip, z -1459 … -1447) at 12 m/s or
  more within the last 2 s.
- When a car with boost leaves the lip (the second ramp, the one with `boost:1`):
  - set its horizontal speed `v.v = 40` and `v.vy = 33.6`, heading exactly down the ramp (`v.h` = straight -z);
  - while in this flight, no air steering (keep the existing `v.air ? .2` turn rate at 0 for this jump), so it
    always lands on the landing ramp;
  - flash the ramp lamps (model header), a big whoosh sound and a short camera shake, dust off the lip.
- With the game's gravity (18 m/s²) the car peaks at 36 m, clears the mesa's far edge by 4.5 m, and lands about
  152 m out on the steep part of the landing ramp. These numbers are in the preview page; don't change one without
  the others.
- No boost (too slow, or missed the strip): ordinary ramp physics. It's a steep 40° kicker, so you pop up high and
  land on the sand in front of the mesa. Fine.
- The stunt counts as before (`stunt:'QUARRY SKIP'`, `sj:1`) and pays the first time. New hint:
  "🛹 STUNT JUMP: QUARRY SKIP! Over the mesa. 3.8 s in the air."

### The landing
- Landing on a ramp marked `land:1` is soft: **no damage**, keep the horizontal speed (minus 25 %), `vy = 0`.
- Landing anywhere else from that height does damage as now (it should never happen with boost).
- After landing the car rolls down onto the sand; it slows down normally.

## What to avoid

- No invisible boxes left anywhere near the Speedway or the new ramps.
- The ramps' decks must line up with `q.ramps` exactly, so wheels sit on the steel (no sinking, no floating).
- Don't put the booster strip's glow on layers the r603 culling hides when you are near.
- Don't let squads or police drive up the booster (their route planner should treat both ramps as walls, except the
  existing `links` logic, which must not link this ramp: it's a one-off stunt, not a road).

## How to check it (short)

1. Debug view at the Speedway: no red box without a thing in it.
2. Park the dragster: all four wheels on the ground.
3. Drive any car over the strip and up the ramp: over the mesa, onto the landing ramp, no damage.
4. Drive up slowly without the strip: a normal pop, no boost.
