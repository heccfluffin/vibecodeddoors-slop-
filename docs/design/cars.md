Status: shipped (parts 1-6 in r611, 7-9 in r613, 10 in r614, 11-12 in r615) · 13 in r620

## Fix (2026-10-17): the tank's tail lights flicker
In `tank.js` (and its copy in dx609, the line with `BX(.14,.08,.03,tl,sd*1.3,1.32,2.965)`), the tail lights' back face sat
exactly on the hull's back face at z 2.95, and the game's seam smoothing then fought over the two. Make them
`BX(.14, .08, .05, tl, sd*1.3, 1.32, 2.96)`: 5 cm deep, sunk 1.5 cm into the hull. Nothing else changes.

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
  body: over the tyres it is 3.9 m wide after the 1.15 scale, so set `VEHK.monster.w` to 3.9 (it was 2.9), or its
  wheels go through walls and other cars.
- Skip `vehMore()` for all three.
- Seats unchanged (`VEHK.truck`, `VEHK.jeep`, `VEHK.monster`).

## 3. Fast cars (`fast-cars.js`, `mkFastCar(kind, colour)`)
- `mkVehModel('sport')` → `mkFastCar('sport')`, `'muscle'` → `mkFastCar('muscle')`, `'hotrod'` → `mkFastCar('hotrod')`,
  `'dragster'` → `mkFastCar('dragster')`. Skip `vehMore()` for them.
- **The dragster's front wheels now sit on the ground** (this is the Speedway "front wheels float" fix; if they still
  float in the game, something lifts or pitches the model: check `vehMore` and any `m.position.y` / `m.rotation.x`
  set for the dragster).
- Wheel roll: the game rolls every wheel by `v.v·dt / K.whr`. The dragster, muscle car and hot rod have different
  front and rear wheel sizes. Each tyre has `t.userData.r`: use `v.v·dt / (w.t.userData.r || K.whr)` so nothing
  looks like it slips.

## 4. Heavy vehicles (`heavy.js`, `mkHeavy(kind, opt)` and `mkTow()`)
- `mkApcModel()` → `mkHeavy('apc')`. `mkSwatModel(gun)` → `mkHeavy('swat', {gun})`. Same sizes, wheel spots and hooks:
  `userData.wheels`, `userData.bar` (light bar), `userData.gun` (APC `{tur, bar, rk:1}`, SWAT `{tur, bar, mz:[]}`).
- The old models put a Seek (with hat) in the APC's turret hatch and in the SWAT truck's driver's seat. The new models
  don't build it: add it from `userData.crew` (`{x, y, z, sc, par}`: position and scale inside `par`, the turret
  for the APC, the truck itself for the SWAT truck). Keep the Seeks: the user wants them.
- `mkVan(K, label, col)` → `mkHeavy('van', {label, col})`. **The new van faces -z like every other vehicle; the old
  one faced +z**, so add `Math.PI` to its rotation where vans are placed.
- `mkTowTruck()` → `mkTow()` (needs `pickup.js` loaded first). Same `userData.lights` (the two amber lamps), plus
  `userData.hook` (swing it a little while towing if you like). Put El Goblino at `userData.crew` (0.45, 0.5, -0.5,
  scale 0.48) as before. The old recolour traverse isn't needed.
- Skip `vehMore()` for all of these.

## 5. The X-13 Wraith and its refits (`wraith.js`)
- `protoModel(g, T)` → `wraithModel(g, T.wheels)`. Same hooks: `userData.tur` (0, 1.4, 0.2), `bar` (0, 0.3, -1.4 in
  tur, muzzles at bar z -3.0), `radar`, `mf`, and the `userData.ex` exhaust glows. Rocket pods at x ±1.18, world y 1.75,
  where `milRockets` fires from.
- In `wkBuild` (dx554), replace everything that draws (from `const M=…` to the "MK" decal) with `wraithMarks(m, l)`.
  It makes the same `wkG/wkT/wkB`, `wkBub`, and the minigun's `rws/rwsP/rwsS/rwsT/rwsF` (mount still at (0, 2.34, 2.3)),
  so `protoTick`, the gunner camera and `wkGunFire` don't change. Mk VI repaints through `userData.paint` (no more
  colour-hex traverse), and calling it again with a lower mark (a friend's Wraith via `rwk`) paints it back.
- Wheel roll: tank wheels roll by `v.v·dt/.34`. These are r 0.5, so use `v.v·dt/(w.t.userData.r||.34)`.
- `VEHK.proto` w/len and seats unchanged.

## 6. Battle tank (`tank.js`, `mkTank()`)
- The `'tank'` branch of `mkVehModel` → `mkTank()`. Same `userData.tur` (0, 1.35, 0.3) and `userData.bar` (0, 0.35, -1.5 in
  tur; `tankFire`'s recoil to -1.2 and back still fits). Muzzle at bar z -3.3. Size and seats unchanged.
- Wheels: road wheels, sprocket, idler and rollers, all `tank:1` with `t.userData.r`: use `v.v·dt/(w.t.userData.r||.34)`
  (same fix as the Wraith).
- **New: `userData.trkAdv(d)`** runs both tracks round the wheels. Call `m.userData.trkAdv && m.userData.trkAdv(v.v*dt)`
  next to the wheel roll (line with `if(w.tank)w.t.rotation.x-=…`). The tracks are two InstancedMeshes per side; only
  update them when the tank is moving and within ~80 m, to save time.

## 7. Helicopters (`helis.js`, `uh9Model(g, dark)` and `ah4Model(g)`)
- In dx549's `mkVehModel` wrapper: `awHeli(g, dark)` → `uh9Model(g, dark)`, `awGunship(g)` → `ah4Model(g)`. Same hooks:
  `userData.rotor` (y), `tailR` (x), `cg` {t, spin, fl} with `t.children[1]` the yoke, `beacon`.
- Update in `VEHK` (dx549): `heli.msl.pods` → `[[2.05,2.0,-.2],[-2.05,2.0,-.2]]` (the wings moved above the open
  doorways); `heli.gun.from` → `[0,.55,-4.75]`; `gunship.gun.from` → `[0,.66,-6.15]` (the chin gun hangs lower now so
  it can aim up without going through the nose). `cock` cameras unchanged: both have real cockpits there now.
- The hull material is double-sided so the cockpit and cabin have walls from inside.

## 8. Fighter jets (`jets.js`, `jetModel(g, ghost, pods)`)
- In dx549's `mkVehModel` wrapper: `awJet(g, ghost)` → `jetModel(g, ghost, VEHK[k].msl.pods)`. Same hooks: `ab`, `ab2`,
  `gear`, `msl` (in pods order), `beacon`. Missile spots unchanged.
- **Gear:** the model has `userData.gearSet(f)` (0 down … 1 up): legs swing up on hinges (nose back, mains inward).
  In `awLook`, replace the two `u.gear.scale.y` lines with
  `if(u.gearSet){v.gearF=v.gearF==null?(up?1:0):v.gearF;v.gearF+=((up?1:0)-v.gearF)*Math.min(1,dt*1.6);u.gearSet(v.gearF)}`
  and keep the old lines as the `else` for anything else. Don't scale `gear` any more.
- `VEHK.jet.gun.from` → `[.62,1.42,-5.0]` (gun port on the left of the nose). The X-22 stays `[0,1.3,-6.5]`.
- `cock` cameras unchanged: they sit inside the canopies (which are taller now).

## 9. Runabouts (`runabouts.js`, `mkRunabout(kind, colour)`)
- The `'bike'`, `'golf'`, `'quad'` and `'buggy'` branches of `mkVehModel` → `mkRunabout(k)`. Same sizes, wheel spots and
  seats; skip `vehMore()` for them.
- Steering hooks: `userData.sw` + `swAx`: bike `'y'` (the whole front end, raked, turns about the steering head), quad
  `'y'` (bars), golf and buggy `'z'` (steering wheel).
- Bike: the front wheel turns by `str·0.45` and the bars by `str·0.5`. Use the same factor for both (0.5) so the tyre
  stays in the fork.
- Wheels roll by `v.v·dt/(w.t.userData.r||K.whr)` as for the other new cars.

## 10. Odd cars (`odd-cars.js`, `mkOddCar(kind, colour)`)
- The `'hearse'`, `'limo'`, `'rally'`, `'tractor'` and `'icecream'` branches of `mkVehModel` → `mkOddCar(k)`. Same sizes,
  wheel spots and seats; `userData.sw` with `swAx 'z'`; the ice cream van keeps `userData.jingle = 1`. Skip `vehMore()`.
- The tractor's front (r 0.32) and rear (r 0.78) wheels differ: roll by `w.t.userData.r` (already done in r611 for the
  other new cars).

## 11. Plane and Desert Bus outside (`plane-bus.js`)
- **`mkPlane()`** replaces the `'plane'` branch of `mkVehModel`. Same hooks as now: `userData.prop` (spins on z, at
  (0, 1.5, -4.62)), `userData.wheels` (two mains, nose wheel `front: true`, `t.userData.r` set), `userData.sw` with
  `swAx 'z'` (the yoke). `g.rotation.order` is 'YXZ'. The cockpit camera (0, 1.8, -1.22) sits at eye height in the cabin.
  Skip `vehMore()` for it.
- **`busShell(g, {HW, Z0, Z1, CH, FH})`** builds the bus's outside round the interior. In `mkMegaBus`, replace the
  grey base box, the four head/tail light boxes, the two bumpers and the wheel + arch loop with
  `const wheels = busShell(g, {HW, Z0, Z1, CH, FH: DBFH});`. Keep the DESERT BUS signs, `it.dsign`, the splat, the
  flames and the `userData` line. Wheels are the old 4 axles at x ±(HW + 0.33), `t.userData.r = 0.5`.

## 12. Desert Bus inside (`bus-interior.js`)
Three base-game functions are replaced **whole** (redefine them in a module, after bak519; `mkMegaBus` calls them by
their global names): `mkMegaInterior()`, `megaExtras(it)`, `megaPolish(it)`. New globals: `biKit`, `biMerge` (checked:
no clashes).
- Everything the game reads keeps its value and position: `it` fields (`g, HW, Z0, Z1, CH, obs, seats, dleaf, doors,
  zones, drv, sk, ents, proj, lab`), the 32 seats in the same order plus the 4 tub seats, every `it.obs` box, every zone,
  `it.hoop`, `it.pit`, and all `ex.*` hooks (`ap {lev, led}`, `horn`, `dknob`, `pump`, `af`, `wire {wd, wled}`,
  `juke {bands, jc, jtx}`, `cool {lid}`, `slot {sc, stx, lv, sg}`, `score`, `balls/ballM/dm`, `tub {wt}`, `bub`,
  `stage {sp}`, `led`, `clock`). `megaPolishTick`, `megaTick`, `megaDoors` etc. need no change.
- `ex.cool.lid` and `ex.slot.lv` are now stand-ins (plain `Object3D`s the game keeps moving as before). The real lid
  and lever copy them in an `onBeforeRender`, so the lid swings on its back hinge and the lever pulls towards you.
- Door leaves: same `h` / `lf` groups, `h.rotation.y` as before.
- The mirror no longer swings; only the pine tree under it does (`ex.af` is the tree's group).
- The wiring panel is now a floor cabinet under the window (same zone and obstacle).
- **Merging:** at the end of `megaPolish`, `biMerge(it.g)` joins static meshes by material, per 4 m of bus and per side
  (about 925 meshes → 150). Animated parts, labels, glass, sprites and the ball InstancedMeshes are left alone.
  Chunks stay under 9 m across, so `busBlowApart` still throws them about.
- It calls `glowSp` and `dbSlotDraw` (both in bak519) and uses its own textures (no `mineTexR`, no `VMAT`).
- `run0Hide` is no longer needed (there's no old runner to hide).
- Check (short): board the bus, sit in a seat and at the wheel, press the horn / autopilot / destination / pump,
  open the cooler, spin the slots, throw at the hoop, dive in the ball pit, sit in the tub, sing. Then blow it up once.

## 13. Police helicopter (`police-heli.js`, `mkPoliceHeli()`)
Load it after `helis.js` (it uses `heliKit`). New global: `mkPoliceHeli`. It doesn't clash with any existing name.
- Replace the **first** `mkHeli()` in bak519 (the Dark Police helicopter, ~line 2834, used at the police pad as
  `const hm=mkHeli()`) with `mkPoliceHeli()`. The military `mkHeli(K)` further down is a different model. Don't touch it.
- The size, the origin (ground under the cabin, front -z) and the hooks are the same, so `heliTick` needs no change:
  `userData = {mr, tr, spG, cone, cm, pool, pm, bea, sk}`.
  - `mr` is at (0, 3.15, 0) and spins on y.
  - `tr` is at (.14, 2.4, 5.6) and spins on x.
  - `bea` holds the [red, blue] light bar boxes; the game sets their `material.emissive`.
  - `spG` is at (0, .8, -1.2), with `cone`/`cm` and `pool`/`pm` the same as before.
  - `sk` is `mkCopSeek(.42)` at (0, 1.05, -.6).
  - The pad obstacle (x ±1.4, z -3..2.4) still fits.
- The cabin is one mesh with a painted canvas texture (1536×768, made once) plus a grey inner lining. The windows are
  glass groups in the same mesh. Mark the rotors `dpKeep` (they spin). The rest can batch.

## Check (short)
Spawn each: the cab at the bus stop, a cruiser (heat), a townsperson's car. Get in the cab: the camera sits in the
driver's seat behind the wheel, and the steering wheel turns. Drive: wheels roll and the front wheels steer. One flat
tyre event: the tyre squashes.
