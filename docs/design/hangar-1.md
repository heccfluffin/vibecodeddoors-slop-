Status: building (Claude Code, 2026-10-20) · was: approved by the user 2026-10-17 (layout and all four batches), to build

# Hangar 1 rework (the X-13 Wraith hangar)

The user: the hangar didn't get a remodel with Fort Blackout (only its outside cladding, `fbHangarSkin`). Inside, the
tank under repair sat beside the lane, two mechanics stood on the refit pad, two pairs of red tool carts were stacked
inside each other and the overhead crane wandered about with the tank turret on its hook.

Models: `docs/design/models/hangar-1.js`. Load it after `fort-kit.js` (it uses `fbKit`). New globals:
`hgShell, hgDoorSlab, hgCrane, hgWorkshop, hgSouth, hgRefit`. None of them clash with existing names.
Everything the kit builds is marked `noSeam`. The moving parts (the two cranes' bridges) are marked `dpKeep`.
Push every returned `obs` to `q.obs`.

The hangar's inside faces are x 325.5 / 424.5 and z -717.5 / -670.5. The ceiling (the underside of the roof slab) is
at y 9. The blast door opening is in the east wall, z -704..-684.

## Layout
- **Drive lane:** z -698..-690, from the door to the refit station (345, -694). The Wraith parks in its bay box,
  x 370..386, z -700..-688.
- **North side, the workshop:**
  - the tank bay x 379..393, z -714..-706, with the overhead crane above it;
  - benches along the north wall, x 332..360;
  - the engine stand and parts table at x 352..358.5, z -711;
  - scissor lift (375.5, -711.5), road wheels (396.5, -715), compressor (400.5, -715.3), fuel bowser (408, -715).
- **South side:**
  - the control room x 388..404, z -676..-671.1, with its door on the west end;
  - spares racks x 344..354 and 356..366, z -671.8;
  - the drum cage x 370..374, z -675..-671.2;
  - the crew corner x 405.5..419, z -672.5..-670.6;
  - a fire point at (421.5, -670.6).
- The laser grid, the four ceiling turrets and the cyan light strips (dx556) stay where they are.

## Batch 1: the building, `hgShell(g)` and `hgDoorSlab`
- **`hgShell(g)`** in the restricted-zone step, after the hangar walls (bak519 ~6751).
  - It builds:
    - the painted floor, a plane at y .08: the lane edges, the bay box with "BAY 1 · X-13 WRAITH", the tank bay's
      hazard border, a zebra walkway at x 408..411 and the KEEP CLEAR hatch at the door are all in one texture;
    - the wall lining;
    - two steel door pockets inside the east wall (x 423.83..424.33). The blast door slabs slide into them, so they
      no longer slide along in front of the inside wall;
    - steel columns at x 331, 355, 367, 379, 391, 403, 415 on both long walls (none at 343, where the refit gantry is);
    - roof trusses on the columns (chords at y 8.15 and 8.9) and purlins;
    - 21 high-bay lights.
  - **Remove** from the base:
    - the floor plane `hf` (the hangar's own plane at y .08);
    - the six yellow dashes `A(BX(2,.012,.3),YL,345+i*14,.1,-694)`;
    - the lamp grid (`for(let x=HX0+8;...)LAMP(x,HH,zz,2.4)`);
    - in the 'hangar' furniture step, the hazard stripes round the vehicle bay (`for(const z of[-702,-686])...` and
      `for(const x of[355,399])...`) and the cable snake (the 14 boxes at y .11 by the diagnostics desk).
- **`hgDoorSlab(dA, -1); hgDoorSlab(dB, 1);`** right after the two slabs are made (bak519 ~6754).
  - It takes the old yellow stripe children off and paints the slab: from outside, each slab carries half of the big
    "HANGAR 1 · X-13 WRAITH PROGRAMME" board; on the inside, panels and chevrons.
  - It adds ribs on the inside face, a seal on the meeting edge and rollers.
  - Nothing sticks out of the outside face, so the slab still slides behind the cladding cleanly.
  - The animation (`dA.position.z`, `dB.position.z`) and the obstacle `dob` are unchanged.
- Move the "X-13 · WRAITH · TWIN 40mm..." screen at (335, 3, -717.4) up to y 4.2, so it sits above the new pegboard.

## Batch 2: the workshop, `hgCrane(g)` and `hgWorkshop(g)`
In the 'hangar' furniture step (bak519 ~6824):
- **Crane:**
  - Replace the old gantry crane (the two rails at z -712 / -676, their posts every 12 m, the bridge `br`, the trolley,
    the chain `ch` and the hook `hk`) with `const cr = hgCrane(g)`.
  - It runs on two runways over the tank bay. Its south posts at x 379 and 391, z -703.8 carry obstacles.
  - Replace the crane's anim with `anim(386, -710, 250, () => cr.tick(q.rt))`.
- **Tank:**
  - The hull is the r616 one, moved to `hull.position.set(386, .45, -710)` with rotation π/2. Its obstacle becomes
    x 383..389, z -712..-708.
  - Drop the base's four yellow stands, because `hgWorkshop` draws new ones there.
  - Hang the turret from the new hook: `cr.hk.add(tur2); tur2.position.set(0, -1.1, 0); tur2.rotation.y = Math.PI/2`.
    Drop the old `ch.scale` and `hk.position` lines.
- **Mechanics:** move them from the refit pad to (383.5, .9, -707.4) with rotation 0 and (389.6, .9, -710) with
  rotation π/2. Drop the base's red cart and wrench at (338.5, -689.5), because `hgWorkshop` has a cart by the tank.
- **`hgWorkshop(g)`** replaces:
  - the four workbenches (same spots and obstacles);
  - the red tool carts at (350, -712), (375, -712) and (400, -712) in the 'hangar' step, and the ones at (350, -712),
    (400, -712) and (350, -676) in the "more" step. Two pairs were inside each other;
  - in the "more" step: the fuel bowser and its label, the scissor lift, the compressor and its hoses, and the four
    tyre tori at (410, -706).
- **Tank drums:** the four tank drums at (418, -676) move into the drum cage. Batch 3 draws them, so drop the base ones.

## Batch 3: the south side, `hgSouth(g)`
- **Diagnostics:** this replaces the diagnostics station: the desk, chair, three screens and the
  "X-13 DIAGNOSTICS..." label at (396, 2.1, -675.7).
  - The technician moves into the control room: `tech.position.set(396, .5, -674.2); tech.rotation.y = 0`. He faces
    the window and the Wraith. (Use the y the game used for him.)
- **Spares and lockers:** it also replaces the spares rack at (346, -676) and its label (the new racks hold the pods
  and wheels), and the five lockers at (414 + k*.6, -671).
- **Signs:** the "NO SMOKING..." sign is drawn by `hgSouth` at (411.5, 2.75, -670.6), so drop the base one at
  (414, 3.2, -670.6). It was behind the new wall lining anyway.

## Batch 4: the refit station, `hgRefit(g, X, Z)` (dx556)
- **Build:** in `rfsBuild`, replace everything from the pad down to the holo (the pad and spokes, the ring, the
  the gantry, the bridge `br` and its cable/hook/part, the parts
  rack, the robot arms and the holo) with:
  `const H = hgRefit(g, X, Z); Object.assign(R, {ring: H.ring, br: H.br, cab: H.cab, hook: H.hook, part: H.part, pe: H.pe, arms: H.arms, holo: H.holo}); for (const o of H.obs) q.obs.push(o);`
  - The moving parts have the same names and joint heights, so `rfsTick` keeps driving the crane, the part and the holo.
  - The crew, the light strips, the laser grid and the turrets stay as they are.
- **Guide lines:** the two cyan lines from the pad to the door now stop at the Wraith bay box:
  `for (const sd of [-1, 1]) for (const [a, b] of [[X+4.72, 369.6], [386.4, 424]]) A(BX(b-a, .02, .12), CYN, (a+b)/2, .12, Z+sd*2.2);`
  They start at the pad's flat front edge (X + 4.72; the old X + 5.4 left a 0.7 m gap). Skip the chevrons that fall inside the box, at x 369..387. The painted yellow lane lines stop at the box too, and start at the pad's rim.
- **Arm poses:** the welding arms used to fold back on themselves and point away from the pad. In `rfsTick`, replace the
  `for(const a of R.arms){...}` block with:
  ```js
  for(const a of R.arms){const f=a.sd>0?Math.PI:0,e=Math.min(1,dt*(weld?4:2));
   if(weld){a.yw.rotation.y+=(f+Math.sin(tt*1.3+a.sd)*.12-a.yw.rotation.y)*e;a.s1.rotation.z=0;a.s1.rotation.x+=(.5-a.s1.rotation.x)*e;a.s2.rotation.x+=(1.33+Math.sin(tt*9+a.sd)*.03-a.s2.rotation.x)*e;
    a.gl.visible=Math.random()<.8;a.gl.scale.setScalar(.4+Math.random()*.5);if(Math.random()<dt*25){const w=new THREE.Vector3();a.tip.getWorldPosition(w);try{vfx('ember',w.x,w.y,w.z,{n:3})}catch(e){}}if(Math.random()<dt*6)snd(1400+Math.random()*900,.02)}
   else{a.yw.rotation.y+=(f+Math.sin(tt*.4+a.sd)*.3-a.yw.rotation.y)*e;a.s1.rotation.x+=(-.1-a.s1.rotation.x)*e;a.s2.rotation.x+=(.7+Math.sin(tt*.7)*.1-a.s2.rotation.x)*e;a.gl.visible=false}}
  ```
  The arms now turn to face the pad and reach in over the Wraith, with the torch pointing down at the part.

## Check (short)
1. Inside the hangar: no flicker on the floor markings, the lining or the door pockets.
2. Open the blast door: the slabs slide into the pockets.
3. Run a refit job: the crane brings the part, and the arms weld it from the pad side.
4. Walk round the tank bay and the control room: no walking through anything.
