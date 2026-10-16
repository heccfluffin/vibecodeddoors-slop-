Status: shipped in r606

# Speeds in km/h everywhere

The user wants km/h, to match the new speed checkpoints (`police.md`, limit 70 km/h).

## Change
- Every speed shown to the player becomes km/h: `Math.round(Math.abs(v.v) * 3.6) + ' km/h'` instead of `× 2.237 … mph`.
  That's the driving HUD lines (cars, the bus, the plane, the Wraith, the dragster, Highway Patrol hints), stunt and
  race read-outs, the salt-flat speed run, any "MPH!!" hints, and the vehicle descriptions in the garage
  ("top speed …").
- `mph` / `MPH` appears about 250 times in `bak519.html` and maybe in the dx modules. Many are in hint text and jokes:
  convert the number too (e.g. "600 MPH" → "970 KM/H"), and keep the joke.
- Speeds the game stores or compares in m/s don't change.

## Leave alone
- **Distances on the Desert Bus trip** (Tucson → Las Vegas, "/ 360 mi"): that's a US road-trip story, so miles fit.
  Only its *speed* shows in km/h. (If the user wants kilometres there too, it's 579 km.)
- Old changelog entries.

## Check (short)
Drive any car: the HUD says km/h, and 70 km/h on the HUD matches 70 on a checkpoint board.
