Status: proposed

# Fort Blackout on the map

## Now

Many military base buildings don't appear on the desert map (`dmapDraw`, from `q.mapR`). Only a few later modules add
rectangles: the command wing (dx557, `#5a6a4a`), the Wraith bays (dx572, `#4a5a5a`), the motor pool (dx598,
`#4a5a4a`). Most of the base built in `bak519.html` (around `MILB`, x 300 … 600, z -930 … -660) and the
r550–r579 additions are missing or are drawn as one flat block.

## Should be

Every building, wall and fenced area on the base shows on the map, in a colour by type, and the big ones have a name
when the map is zoomed in (`DMAP.zm >= 2`).

### How to find them all (don't hand-pick)
- Go through `q.obs` inside `MILB` (plus the restricted zone `MILRZ` and the AA ring `MILAA`). Group boxes that belong
  to one building (they touch or are less than 1 m apart). Any group with a footprint over 3 × 3 m is a building.
  Thin long groups (under 1 m wide, over 6 m long) are walls or fences.
- Compare with the `q.mapR` rectangles already there. Add what's missing. Don't add a second rectangle on top of one
  that is already right (it would draw twice and look darker).
- Better than a runtime pass: once you have the list, add the rectangles where each building is built, in the same
  code, so they move with it if it moves.

### Colours (keep the map's earthy look)
| Type | Colour | Examples |
|---|---|---|
| Hangars, big sheds | `#5a5e64` | Hangar 1, refit station, vehicle sheds |
| Offices, barracks, mess | `#6a6a52` | command wing, barracks, mess hall, HQ |
| Secure / launch | `#5a3a3a` | launch control, silo hatches, armoury |
| Workshops, motor pool, bays | `#4a5a5a` | Wraith bays, motor pool (keep existing) |
| Towers, small huts | `#7a6a4a` | watchtowers, gate booths, radar |
| Walls and fences | `#3a3a36`, drawn 1 px wider than their real width so they show | perimeter wall, inner fences |
| Concrete aprons, helipads, parade ground | `#8a8a80` | aprons, runway bits on the base |

Draw roofs first, then walls/fences on top (the order of `q.mapR` is the draw order).

### Names on the map
Add map labels (the same way `loc(...)` names show) for: Hangar 1, Command wing, Wraith bays, Motor pool, Launch
control, Silo 1, Barracks, Mess hall, Main gate, Restricted zone gate. Only show them at zoom 2 and above, so the
normal map isn't cluttered.

## What to avoid
- Don't redraw the whole base as one rectangle.
- Don't use bright colours: the map elsewhere is muted.
- Don't change `navBuild` by accident: it treats `#4a4440` and `#8a6a44` rectangles as roads. Don't use those two.

## How to check it (short)
Open the map, zoom in on Fort Blackout. Compare with one screenshot of the base from above (the r603 `pv.js` "base"
spot): every building you can see from above is on the map, roughly the right size and place.
