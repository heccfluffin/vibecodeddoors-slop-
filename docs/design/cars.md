Status: proposed

# New car models

The desert cars are being remodelled one family at a time. Each model in `docs/design/models/` has the same hooks
as `mkVehModel` (`userData.wheels`, `sw`, `swAx`, and `bar` for police), the same size, and seats in the same places,
so it can replace the old branch directly.

## 1. Sedans (`sedan.js`, `mkSedan(kind, colour)`)
- `mkVehModel('sedan')` → `mkSedan('cab')`  (El Goblino's cab)
- `mkVehModel('cop')` → `mkSedan('cop')`  (Desert PD cruiser; the patrol cars, backup units and crime cops use it)
- `npc1`, `npc2`, `npc3` (`mdl:'sedan'`) → `mkSedan('civ', VEHK[k].col)`
- The Highway Patrol car: if it is built from the cop model, keep doing that and let `hwpDress()` dress
  `mkSedan('cop')` (it hides the old 1.3 × 0.3 decal planes and adds its own; check its HIGHWAY PATROL panels land
  on the new doors at x ±0.997 and tweak the x if not). Its body colour should be dark: set the paint material's
  colour to the HWP colour after building.
- **Skip `vehMore()`** for these: the new model has its own mirrors, plates, exhaust, aerial and door handles.
- Keep `K.lift` / `K.sc` handling as in `mkVehModel` (none of these use it).
- The wreck look (burnt black) must still work: if it recolours materials by traversing, it will find the new ones.

## 2. Pickups (`pickup.js`, `mkPickup(kind, colour)`)
- `mkVehModel('truck')` → `mkPickup('pickup')`
- `VEHK.jeep` (`mdl:'truck'`) → `mkPickup('jeep')`
- `VEHK.monster` (`mdl:'truck'`) → `mkPickup('monster')`. This model lifts the monster's body itself: **don't apply
  `VEHK.monster.lift`** to it. Keep `VEHK.monster.sc` (1.15). The monster's wheels sit at x ±1.38 now, outside the
  body; its collision width (`VEHK.monster.w` 2.9) still covers them after the 1.15 scale.
- Skip `vehMore()` for all three.
- Seats unchanged (`VEHK.truck`, `VEHK.jeep`, `VEHK.monster`).

## Check (short)
Spawn each: the cab at the bus stop, a cruiser (heat), a townsperson's car. Get in the cab: the camera sits in the
driver's seat behind the wheel, and the steering wheel turns. Drive: wheels roll and the front wheels steer. One flat
tyre event: the tyre squashes.
