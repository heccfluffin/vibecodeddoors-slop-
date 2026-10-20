Status: building (Claude Code, 2026-10-20) · was: approved 2026-10-18 · ready to build

# The plane crash site (remodel list #21)

Model: **`docs/design/models/crash.js`** (plain three.js, needs nothing else). `csWreck(g)` builds the whole site:
the walk-in front fuselage of flight DA-100 (Sandpiper Air), the left wing with the pilot's camp under it, SOS in
rocks, the tail section with the black box, and a 75 m skid furrow with debris back to the first impact.
Same spot as now: the site's origin is the old `px, pz` = **(-38, -1165)**, not turned.

## Wiring (bak519, both blocks use `px=-38, pz=-1165`)

**1. The meshes (~line 6989, the block that starts `{const px=-38,pz=-1165;const fu=new THREE.Group()`).**
Replace the fuselage, nose, windows, wing, tail, debris, `ob`/`rect` calls and the black box mesh with:

```js
const cg=new THREE.Group();cg.position.set(px,0,pz);g.add(cg);const W=csWreck(cg);
for(const o of W.obs)ob(px+o.x0,px+o.x1,pz+o.z0,pz+o.z1);
for(const r of W.map)rect(px+r[0],px+r[1],pz+r[2],pz+r[3],r[4]);
const bb=W.bb;
```

Keep the black box `q.props.push(...)` as it is (it hides `bb` and pays 25 gold), but move it to the new spot:
`x: px+W.box[0], z: pz+W.box[1]` (world (-64.2, -1167.2), beside the tail section). Keep `q.locs.push(...)`.

**2. The props (~line 6205, `T('crashed plane',...)`).** Remove the two little meshes (`fg`, the flare gun box, and
`lg`, the log); the model has both now. Move the two props, and the flare's launch spot:
- Flare gun: **(px-3.6, pz-6.4)** = world (-41.6, -1171.4), at the camp under the wing (on the suitcase table).
  Use it for the prop, for `xmFlare(q,g,…)` and `xmNet(q,'flare',{x,z})`, and as the default in `XM.net.flare`.
- Pilot's log: **(px+4.75, pz)** = world (-33.25, -1165), on the pedestal between the two cockpit seats.
  Make its radius **1.6** so you can read it from the aisle (the cockpit seats are obstacles).

Nothing else changes: the flare count, the log pages, the black box text and gold.

## What to know
- **Walking in:** the cabin floor is the desert floor (y 0), so no step is needed. The obstacles leave an aisle
  (z -0.6 .. 0.2) from the break at x -10 to the cockpit, the front door gap on -z (x 1.4 .. 2.3) and the cockpit
  doorway (z -0.42 .. 0.42 at x 2.5). There's no roof collision; nothing needs it.
- The old desert door at (-30, -1150) and the red barrel at (-34, -1172) are untouched and clear of the wreck.
- The furrow and scorch marks are flat decals (`polygonOffsetUnits` only) with low sand berms (0.3 m): no
  obstacles, cars drive over them. Debris you'd hit (the right wing, the right engine, the main gear, the fire ring,
  the camp, the tail) have obstacles.
- All meshes are `noSeam`; the black box is `dpKeep` (it gets hidden). Everything else is static and can be batched.
- Built with a fixed random seed, so co-op players see the same site.

## Checks
- Walk in through the break, down the aisle and read the log in the cockpit; walk out of the front door.
- Fire the flare at the camp; pick up the black box by the tail.
- The map shows the wreck, the tail, the right wing, the furrow and the SOS.
