Status: shipped in r641 (2026-10-20)

# Fort Blackout's weapons (remodel list #19, the rest of it)

The tank, APC, SWAT truck, helicopters, jets and Wraith were done with the cars (cars.md). This spec does the rest:
the sentry guns, the anti-aircraft gun, the mortars, the missile (Silo 1 and the ending cutscene) and the parked
helicopter at LZ Bravo. Models: **`docs/design/models/weapons.js`** (plain three.js, needs nothing else; put it in a
new module). Everything stays where it is now and keeps the same game logic. Only the meshes change.

## 1. Sentry guns and the AA gun (`mkTurret` in bak519, ~line 6685)

Keep `mkTurret(x, z, y0, k)`'s signature, its group `gp` at (x, y0, z), its `ry0`, the `u` object it pushes to
`ML.tur`, and the obstacle for ground sentries. Replace everything that builds meshes (the plate, the pedestal, both
`if(aa){...}else{...}` branches, the radar `anim`) with:

```js
const W=aa?wpAA(gp):wpSentry(gp);const head=W.head,bar=W.bar,fl=W.fl;
if(aa)anim(x,z,300,dt=>{W.radar.rotation.y+=dt*2.5});
else anim(x,z,200,()=>{W.eye.material.emissive.setHex(ML.alarm?((q.rt*6|0)%2?0xff3030:0x300000):0xff3030)});
```

then carry on with the existing `head.rotation.y=ry0; const u={...}` line, adding `sp:W.sp` to `u`.

- **The barrel spin:** the turret tick (bak519 ~6542) does `u.bar.rotation.z=u.spin`. Change it to
  `(u.sp||u.bar).rotation.z=u.spin` so only the six-barrel cluster spins. The shield, cradle and flash stay put.
- Same hooks as before: `head` yaws (the gun faces -z), `bar` pitches on the trunnions (positive = up) and recoils
  on `position.z`, `fl` is the muzzle flash (hidden until firing). For the AA gun `fl` is a group with one flash per
  barrel; toggling `fl.visible` still works.
- Heights: the sentry's barrels are at 1.35 m above `gp` (the old `u.y` of y0 + 1.28 is fine). The AA guns are at
  1.52 m (old `u.y` y0 + 1.6 is fine; its two barrels are at x ±0.68, the old bullet offsets of ±0.5 are close enough).
- Footprints: the sentry's plate is r 0.88, which fits the 2.2 m wall platforms. The AA plate is r 1.34 (same as
  before) on the tower top at y 12.4.
- The `YL` stripe and the `glowSp` flashes are gone (the models have their own). All meshes are `noSeam`; the moving
  groups are `dpKeep`.

## 2. Mortars (`mkMortar(K)`, bak519 ~line 16117; used by the mortar pits ~line 16237)

- `mkMortar(K)` becomes `function mkMortar(K){return wpMortar()}` (or call `wpMortar()` at the call site).
- **Turn them to face the berm:** the new mortar fires towards -z, so at the call site use `m.rotation.y=Math.PI`
  so it fires towards +z, where the berm targets are (z -790..-750; the pits are at z -822).
- The firing dust: use the muzzle, `const mu=m.userData.muzzle.clone();m.localToWorld(mu)`, for the `vfx('dust',…)`
  position instead of `(mx, .8, mz)`. Optional: kick the tube back a little on firing with `m.userData.tube.position`
  (the preview moves it 5 cm back along the tube and lets it return over 0.2 s).
- Replace the three `OD` ammo boxes next to each pit (`for(let k=0;k<3;k++)A(BX(.5,.3,.9),OD,…)`) with one
  `wpRounds()` crate at `(mx-1.3, 0, mz+1.3)`, `rotation.y=.3`. It's 0.62 × 0.5, so keep the old obstacle area free.
- Leave the mortar-drill job's little field mortar (dx571) alone.

## 3. The missile

**Silo 1 (dx579):** `nkMissile(ms)` builds the missile now. Replace its mesh part (everything from removing the old
children down to `ms.userData.flame=fl`) with `wpMissile(ms)`, which clears the old meshes itself and sets
`ms.userData.flame` to a group (hidden), exactly like now. Same size: body r 1.3, skirt foot at y 0, tip at y 16.3,
nozzle down to -1.0. The fins reach r 2.0, inside the catwalk's hole (r 2.2), so the missile still rises through
it cleanly. The flame flicker (`fl.scale.set(...)`) and the trail point at y -2.5 still fit.

**The ending cutscene (`mkICBM()` in bak519, ~line 15612):** use the same missile, smaller:

```js
function mkICBM(){const g=new THREE.Group(),m=new THREE.Group();g.add(m);wpMissile(m);m.scale.setScalar(.7);g.userData.flame=[m.userData.flame];return g}
```

At 0.7 scale it's r 0.91 and 11.4 m tall (fins r 1.4, Silo 7's tube is r 2.3). The cutscene's loop over
`ms.userData.flame` toggles `visible` on each item, so the array holding the flame group works unchanged.

## 4. The parked helicopter (`mkHeli(K)`, bak519 ~line 16107, used ~line 16221)

The military `mkHeli(K)` is still the original model. Use the new transport helicopter instead:

```js
function mkHeli(K){const g=new THREE.Group();uh9Model(g,0);g.userData.tail=g.userData.tailR;return g}
```

- `uh9Model` (dx611, helis.js) sets `userData.rotor` and `userData.tailR`; the call site's anim uses
  `rotor` and `tail`, hence the alias above. Mark both `dpKeep` (they turn).
- Check the nose points the same way as the old one (the obstacle box runs from hz-9.5 to hz+5, so the long tail is
  towards -z before the -0.4 turn). If it's backwards, add `g.rotation.y=Math.PI` inside a wrapper group.
- Careful: bak519 has two functions called `mkHeli`. The police one was already replaced by `mkPoliceHeli` (r620,
  build.py). Only change the second one, `mkHeli(K)`.

## Checks
- Sentries on the wall: nothing pokes through the wall platform's rails; heads turn and fire, barrels spin.
- AA gun on the tower: radar turns, both flashes show.
- A mortar pit: the mortar points at the berm, the crate is beside it.
- Silo 1 from the catwalk, and one launch: the missile clears the catwalk ring.
- The ending cutscene's launch (if it's quick to trigger).
