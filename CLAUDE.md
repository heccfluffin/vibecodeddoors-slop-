# DOORS (vibecodeddoors): handoff notes for Claude Code

DOORS is a browser game (a Roblox *Doors*-style hotel run, plus a big open "desert" world, co-op, a military rank
system and much more), built with **three.js r128** (cdnjs) as one huge single HTML file.

- Live site: https://vibecodeddoors.pages.dev (Cloudflare Pages, deployed from the **`main`** branch of
  `heccfluffin/vibecodeddoors-slop-`: `index.html` + `media/*.b64` + `version.json`).
- Server: `doors-server.heccfluffin.workers.dev` (Cloudflare Worker + Durable Object, in `server/` on `main`,
  deployed by `.github/workflows/server.yml` when `server/` changes). It does the lobby, public rooms,
  leaderboards, PeerJS matchmaking and bans. Gameplay itself is peer to peer.
- This branch (**`source`**) holds the *build inputs*. `main` only holds the built output. **Never hand-edit
  `index.html` on `main`.** Change the sources here, build, then deploy.


## 0. Design specs from the design chat (read this)

The user also works with Claude in the claude.ai app on design. That chat writes feature specs into
**`docs/design/`** (one Markdown file each) and never edits code. When the user says "build docs/design/<name>.md",
build it from the spec. Update the spec's `Status:` line when you start and when it ships, and write anything the
design chat should know (what changed from the spec, questions) at the top of **`docs/design/NOTES.md`**.
The standing rules below always win over a spec. See `docs/design/README.md`.

---

## 1. How the build works

```
src/bak519.html   the frozen base game (~30 MB, includes base64 music/video). Never edit it.
src/dx522.js ...  "modules": later code, appended to the base in order (dx522 … dx599)
src/gate528.js    another appended module
src/figmus.mp3, src/likevid.mp4   media inlined at the end of the build
build.py          THE build script (was p520.py)
deploy.py         splits out/DOORS.html into index.html + media/*.b64 for the website
tests/            headless Playwright checks (see section 5)
out/              build output (git-ignored)
```

`build.py` does three things, in order:

1. Reads `src/bak519.html` into `s`.
2. Applies hundreds of **`R(a, b)` patches**: exact string replacements on the base. `R` asserts the string
   `a` occurs **exactly once** (`assert c==1`). If a patch fails you get `AssertionError: (first 70 chars, count)`.
   Some places need the same change in two spots. Those use
   `_o,_n=(...); assert s.count(_o)==2; s=s.replace(_o,_n)` instead of `R`.
3. Injects each module just before the `</script>` that follows the `const HUBWX` marker:
   `k=s.index('</script>',s.index('const HUBWX'));s=s[:k]+"\n"+open(S+'dxNNN.js').read()+"\n"+s[k:]`.
   Modules are injected in list order, and **later modules run after earlier ones** (same `<script>`, same scope).

It then inlines the media, sets `const BUILD='YYYY-MM-DD rNNN'` (that regex is near the end of build.py), writes
`out/DOORS.html` and runs `node --check` on every inline script (prints `ok` or the error).

**New R patches go just before the `import base64` line** at the end of build.py. The older code does
`k=s.index('import base64');s=s[:k]+add+s[k:]` on its own text when adding them.

### Module conventions

- Every module starts with a big comment saying which release it is (`r596: …`) and what it does, in plain English.
- The game is written as global function declarations. Modules **wrap** them by reassigning:
  `{const f0=someFn;someFn=function(){const r=f0.apply(this,arguments);/*extra*/return r}}`.
  This works because they share the script's global scope. Calls go through the global name, so wrappers stack.
- **Name clashes** with existing globals have caused real bugs (`smTick`, `fallTick` and `evAt` already existed).
  Before adding a global function or variable, search `src/bak519.html` and `src/dx*.js` for the name.
- Top-level `const`/`let` in a module is fine. Watch out for the TDZ inside the base's big functions: for example
  `fds` in `mkRoomRaw` is declared after the wing loop, so code run from the wing loop cannot touch it.
- Comments and in-game text are plain, friendly English. Changelog lines are written for players, not programmers.

## 2. The release workflow (do all of it, every release)

1. Bump the build number in `build.py` (`2026-10-16 r603` → the next `rNNN`, today's date). It's the
   `re.sub(r"const BUILD=…")` line near the end. Also replace any `"YYYY-MM-DD rNNN"` text the old workflow used.
2. Add a changelog entry at the **top** of `CHLOG` in `src/dx531.js`:
   `['r604',['First change, written for players','Second change']],`
   (escape apostrophes as `\'`). The in-game CHANGELOG button and the lobby board read this.
3. Build: `python3 build.py`. Every inline script must say `ok`.
   **Also run `node --check src/dx*.js`.** A missing quote once shipped and blanked the menu (r602).
4. Quick load check: `node tests/ld.js` should print the function types and `[]` (no page errors).
5. Deploy: check out `main` somewhere, run `python3 deploy.py /path/to/main-checkout` (it writes
   `index.html` and `media/`), then **edit `version.json` by hand** there:
   `{"b": "r604", "notes": "short player-facing summary"}`.
6. Commit and push `main`. Commit messages end with the attribution lines the user wants:
   `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (and the old sessions also added a `Claude-Session:` line).
7. Wait about 50 s, then check that `https://vibecodeddoors.pages.dev/version.json` shows the new build.
8. Zip `out/DOORS.html` as `DOORS.zip` and give it to the user. They like getting the file each release.
9. Commit the source changes to this `source` branch too, so it stays the real source of truth.

## 3. Standing rules from the user (keep to them)

- **Never embed the owner key** or any secret in the HTML. People must not be able to read the owner code from the page.
- **Name filter:** allows "fag…" (the user's friend is literally called FaggotChan), but blocks the n-word.
  There is **no chat filter**.
- **Moderation:** kicks are device-only. Bans cover device and connection.
- **Tests: keep them short.** The user has rejected long live tests and long screenshot runs several times.
  They have also interrupted long tool calls. Prefer a quick load check plus one targeted check.
  Don't do live co-op tests.
- The user plays on Windows, in Firefox and Chrome, often in co-op with a friend. They send screenshots and short
  messages, often several in a row while you work. Batch them, ship often, and say plainly what was and wasn't
  verified.
- They want things to *look* right (no floating parts, no z-fighting, no gaps, nothing facing the wrong way).

## 4. Architecture notes (things that bit us)

### Hotel rooms / co-op determinism

- `mkRoom → mkRoom0 → mkRoomRaw`. `mkRoom0` seeds `Math.random` with `mulb(seed ^ imul(n+1, 2654435761))`.
  All room generation must use `Math.random` (seeded) and must not depend on client state.
- **r592 fix:** three.js gives every new object a random UUID from `Math.random`, which used to eat numbers from the
  seeded sequence, so clients with different caches got different rooms. `dx593.js` now routes calls coming from
  `three.min.js` to the browser's own random (via a stack check while seeded). Don't break this.
- The Room Inspector (F7 or `/room`, in `dx592.js`) compares room generation between co-op players and has
  "Copy desync report". Use it when the user reports desyncs.
- Generator globals sync over `MP.gs` (genSnap/genRest).
- The turn system is in `dx590.js`: L-shaped corner legs, T-rooms, `turnOK`/`turnPlan`, `sideExit`/`legEnd`, `rmPlace`,
  and `worldTo` re-centres the world on enter. Heading `hd` is in {-1, 0, 1}. Rush and Ambush follow paths (`evPath`).
- Side rooms (`mkSideRoom`) have real doors (`SRQ`/`srTick`) and drawers (`srDrawer`).
- The L-wing with rooms was rebuilt in `dx595.js` (`l2Build`, `l2Finish`, `L2W`).
- Seek chase crossroads are in `dx594.js` (`crossFinish`, blue lamp).

### The desert

- `BUS.ride` is the desert state object `q`: `q.g` is the root group, `q.obs` the AABB obstacles, `q.props` the press-E
  prompts, `q.vehs` the vehicles, `q.anims` the per-frame callbacks, `q.OZ` a z offset (world z = local z + q.OZ).
- `busRoamUpd(q, dt)` is the per-frame update and is wrapped by many modules.
- **There is already a performance system from r500** (inside `bak519.html`, the `DP` object, around "6. BATCHING").
  It batches static meshes by material class with a watchdog (`dpMergeRoot`, `dpWatch`, `memDirty`), hides merged
  members on **layer 2** (`DP.HID`), culls chunks, sprites and far vehicles by quality tier, and has a resolution governor.
  **Don't build a second batching system.** Extend this one (see the r603 work below).
- Military base "Fort Blackout": bounds in `MILB`. The command wing (`CWB`, `dx557.js`) has 4 general offices,
  squads (`cwSend`, `cwTick`, `cwDrive`), the Wraith bays (`WBAY`, `dx572.js`), the squad motor pool (`MPOOL`,
  `dx598.js`) and the high-security office-to-bay doors (`dx597.js`).
- **Bay ownership is `cwSlot(q)`**: the player's index among the players currently in the desert, sorted by id.
  It changes when friends join or leave. That made parked Wraiths "forgotten" (partly fixed in r600: `S.bayPark`
  now only clears when you actually drive the Wraith out). The user says it **still** fails after closing and
  reopening the game and warping to the base with "skip bus cutscene" on. See the pending list.
- The quarry and mine (`dx581.js`, `dx587–589.js`, `dx591.js`, `dx596.js`): `MN` is the mine state, `mnGen` builds a mine,
  `MNB` holds the biomes, `MNJ` is the jump state, `MN.plat` the parkour/bridge platforms,
  `MN.pits` the chasms and lava (rects, or ellipses with `e:1`).
  `QT` holds the quarry tycoon upgrades, `qtL(id)` the level, and `SM` the smeltery.
- Soldiers: `mkSoldier()` models face **-z** at rotation 0. When walking towards (dx, dz), use
  `rotation.y = atan2(-dx, -dz)`. Seated in a vehicle: `rotation.y = v.h`.
- **Depth nudges:** never put `polygonOffsetFactor` on a big flat slab (it pulls the slab in front of everything standing on
  it at low angles); use `polygonOffsetUnits` only. The seam smoothing (`seamFix`, r406) nudges every pair of touching flat
  faces and stacks up; mark meshes that handle their own offsets `userData.noSeam=true` (dx614 does this for the kit).
  Anything animated by a render hook or moved every frame should be `userData.dpKeep=1` so the batching leaves it alone.
- **The base has its own route grid** (`bgGrid`/`bgPath`, `WKG`); most of Fort Blackout is south of the desert grid `NAV`.
- Desert map: `dmapDraw(q, canvas, cx, cz, scale, full)`, `DMAP` (`zm` zoom, `px`/`pz` pan added in r599).
  Click-to-warp is `dmapWarp`.

## 5. Testing (headless)

`tests/` has Playwright scripts that load `out/DOORS.html` with a local copy of three r128 (`tests/three/three.min.js`)
and swiftshader WebGL:

```
npm i playwright   (and: npx playwright install chromium)
node tests/ld.js       # load check: page errors, key functions defined   <- run every release
node tests/chl.js      # changelog button
node tests/mp.js [file] # desert perf numbers (slow under swiftshader; frame times are NOT meaningful, compare calls/tris)
node tests/prof.js [file] base   # CPU profile in the desert
node tests/pv.js file tag        # screenshots of a few desert spots (with ?noperf to compare)
```

Getting into the desert in a test:
`busBoard(true,0,[],4242,()=>{window.__done=1;BUS.ride.t=40})`, wait for `__done`, then
`q.inBus=null;q.seat=null;q.roam=1;document.getElementById('m').style.display='none'`, and set `P.x`, `P.z` (+`q.OZ`).
Under swiftshader each frame takes 1–3 s, so keep waits short and frame counts small (6).
Use `--use-gl=swiftshader` **only**. Adding `--enable-webgl --ignore-gpu-blocklist` made Chromium hang here.

## 6. Current state

- **Live: r649** (2026-10-21; r649 = lag window upgrade, no game change (`dx634`, `LAGV`): GPU time via EXT_disjoint_timer_query_webgl2 when available (outermost R.render wrapper, only while the window is open), draw calls by kind every 2 s (`lagCats`), standing/moving per lagTake, 'Hide everything in the desert' switch (LAGHIDE 'all'), `lagRun` steps incl. half resolution (`lagHalf`, pauses the QS governor by swapping applyQS) and `lagLimit` verdict (refresh cap / CPU parts / GPU pixels / GPU amount / waiting); `lagAuto` redefined; Benchmark button `lagBench` with 3 fixed views `LAGVIEWS`. tools/lagbench.js is the console version for r648. Backups `backup-*-r648`. The user wants comparable reports from both PCs before choosing the next optimisation (parked vehicles is only a candidate). r648 = MWC follow-up: three's updateWorldMatrix (getWorldPosition etc.) leaves matrixWorldNeedsUpdate=true on the object and its parents, which made mwSelf redo whole subtrees every frame; the flag now only counts for matrixAutoUpdate=false objects (mwPQS returns whether it recomposed). At (210,-918) real-frame recomputes 18,400 → 3,550; bit-exact tests repeated at the bus stop and (210,-918). r647 = desert perf: matrices only redone for things that moved (`dx633`, `MWC`, `?nomwc`): `mwPQS` keeps o.matrix when position/quaternion/scale are unchanged (cache `__mwc`); `mwSelf` redoes the world matrix only on force, matrixWorldNeedsUpdate, a new parent (`__mwpar`) or a parent that changed after the object was last up to date (`__mwchg` > `__mwf`, counter `MWC.f`), which covers reparenting, remove/re-add and hidden/batched skips; vehicles use `mwFull` (everything, hidden too, same check); `mwWalk` (dx621) wrapped; `S.updateMatrixWorld` replaced (it used to force the whole scene every frame) and it does the lag window's "positions" timing itself. Verified bit-exact against a from-scratch recompute (0 mismatches in ~19k objects per frame over many frames, while things moved), plus a controlled reparent/re-add test that fails without the parent tracking. Swiftshader Chrome: scene update 9.5-11.8 → 3.7-5.4 ms, vehicles 5.5 → 1.5 ms. Lag reports on r646 also showed 260-400 ms first-draw spikes (1,500 new meshes uploaded in one frame) near the bus stop 8-14 s after arriving; not handled yet. r646 = desert perf: places with moving parts get batched (`dx632`, `MXB`, `?nomxb`): a q.g group the late batcher (dx599, needs 6 s of total stillness) hasn't batched is watched piece by piece for 10 s (`mxbSig`: matrix relative to the group, shown, colour/glow/opacity/map, geometry; NaN for multi-material or onBeforeRender pieces); changed pieces get `dpDyn` (the batcher's own "moved" flag), the rest is batched with `DP._mergeRoot`; groups that moved as a whole go to `q.dp.movers` (checked every frame), others to `MXB.roots` with their own watchdog (`mxbWatch`, 0.4 ms a frame, uses `DP._check` = dpCheckRecs, exported by a build.py patch). Measured facing the PD HQ (was never batched: 1,578 pieces, officers walk): 3,430 → 2,135 calls at (129,-1028), 4,044 → 2,749 outside, 2,573 → 1,493 inside; 0 ghosts. The water-delivery groundskeepers/tanks (`dpKeep`, 77+28 pieces each) are left alone on purpose. r645 = the train runs in single player (`q.train` starts with `dw:0,done:0` in dx631) and the BUILD label is right again (r644 shipped saying r643). Pyramid texture sharing was tried and dropped (1% fewer draw calls, +0.8 s load). r644 = the Pyramid (`pyramid.md`, `dx629` py*, ~60 build.py patches in pyrBuild/pyrUnder, `pywBurn` keeps the seeded random sequence, undercroft group shown only when q.deep===2). All six specs the user asked for (crash site, weapons, Hangar 1, Dusty Gulch, lake-rail, pyramid) are shipped. r643 = r643 = lake/observatory/Dino Dan's/railway/train (`lake-rail.md`, `dx631`: xpLake/xpObservatory/xpDino/xpRail redefined, xpTrainTick and xpCover wrapped; build.py: old pole loop off, quad moved). r642 = r642 = Dusty Gulch (`dusty-gulch.md`, `dx630` gu*: xpGulch redefined in dx630, model group GU, Main Street road flagged fb; build.py: sign list, limo spot). r641 = r641 = weapons (`weapons.md`, `dx627` wp*: mkTurret splice (local), u.sp/u.bz, mortar pits, nkMissile, mkICBM, LZ Bravo `wpHeli` kept at heading -0.4 for the awPad swap). r640 = r640 = Hangar 1 (`hangar-1.md`, `dx628` hg*, `hgSub` gives the models their own group `q.hg1`; build.py block in milBuild; dx556 rfsBuild/rfsTick). r639 = r639 = crash site (`crash-site.md`, `dx626` csWreck, build.py patches in desertLocs and T('crashed plane'); burns 50 R() to keep desertLocs' seeded sequence). Specs being built by helper agents in worktrees /home/user/wt-*: weapons dx627, Hangar 1 dx628, then pyramid dx629, Dusty Gulch dx630, lake-rail dx631. r638 = r638 = design chat small fixes: meteor crater to (140,-970) (build.py, meteor-crater.md) and crop duster z-fight numbers (dx617). r637 = r637 = step 3, car-vs-car checks (`dx625`, `VCG`, `?novcg`): obstacles already had a grid (`obsNear`/`obsGrid`); vehOK/vehHit now skip vehicles surely out of reach (`vcgNear`, build.py patches, same order so the same first hit) and `vehSegD` remembers each centre line (same arithmetic). Shadow-tested: 0 mismatches in 4,062 live calls, 20,295 boundary points, 996 vehOK spots. Gain only 10-16% per call (Math.hypot/sin/cos dominate; not replaced, to stay bit-identical). Backups `backup-*-r636`. Scenery: the biggest draw-call group is the late-built areas, not q.chunks. r636 = r636 = debris (vehShatter/busBlowApart, build.py R patches) skips `dpMerged` batches: a batch and its own pieces used to both fly off. Vehicle regression tests (missiles, shatter, wreck/respawn, watchdog list, warm-up retention) passed; backups `backup-*-r635`. r635 = r635 = VEHICLE BATCHING (`dx624`, `VB`, `?novb`): each moving part a vehicle's userData points at (wheels t/p, sw, tur, bar, rotor, tailR, msl, radar, rws...) is merged with `DP._mergeRoot` relative to itself (other moving parts flagged dpKeep meanwhile) and pushed to `q.dp.movers`; the jet's `gear` is skipped (legs fold inside it); one vehicle per frame. Verified per vertex (error 0) after animating parts and while driving. r634 = r634 = map warp goes to the place's phone booth within 220 m (`dmapWarp`, dx597; prison marker was inside the cell block = softlock), warp blocked only for real prisoners; prison control-room switches moved to the west wall z -766.4/-767.8 and the console button texture turned (pen_gen.py `fix()` block). **pen_gen.py needs the game's own dpPen: run `PEN_BASE=1 python3 build.py`, then `python3 tools/pen_gen.py`, then a normal build.** r633 = r633 = warm-up follow-up: an `Object3D.add` hook queues anything added to the desert after loading (`WARM.hot`, `warmHot`): vehicles warmed from 1.2 km, other new things within 450 m; hot warming waits for the first scan's light list (`WARM.litQ`), else shaders were made for an unlit scene (+6 programs, caught by test). Also dx555 walking officers faced backwards (Seek model faces -z: +PI). Backups `backup-*-r632`; r632 = desert WARM-UP (`dx623`, `WARM`, `?nowarm`): uploads geometry nearest-first (≤450 m; bus stop while riding, player while roaming) by drawing small batches into a 1x1 scissor with `q.g` hidden, the batch and the visible desert lights reparented into `WARM.prox` and restored; adaptive batch size; 10 ms/frame on the ride, 2.5 ms in play; never during the loading screen. Backups `backup-*-r631`. Step B (vehicle batching) waits for the user's review of A; minimap (C) untouched; r631 = lag window spike catcher (`lagGap`, `lagSpikeTxt`, per-frame `LAG.cur`); r630 = LAG TEST window (`dx622`, `LAG`, F9 or /lag): live FPS/frame graph, per-system timings (wraps LAGSYS globals and `loop` only while open), render-only hide switches restored after each render, "Find the lag" auto test, Copy report. Ask the user for that report when they report lag; r629 = r629 = desert performance STEP 1 of the user's master prompt (`dx621`, `MWX`): the renderer's per-frame matrix update skips hidden subtrees and merged batch members under `q.g` (vehicles `__mwKeep` never skipped); readers refresh via `mwFresh` (localToWorld/worldToLocal, Box3.setFromObject, raycasts into the desert, memDirty + dpSprites via build.py, perfCull/perfRootFP in dx599). `?nomwx` or `MWX.on=false` turns it off. Backups: branches `backup-source-r628`, `backup-main-r628`. Steps 2 (vehicle batching), 3 (AI collision grid) wait for the user's approval; step 4 (minimap rate) needs explicit approval. r628 = r628 = penitentiary batch 6: `dpPen` is LOCAL to the r500 block, so tools/pen_gen.py writes `src/dx620dp.js` and build.py replaces the base dpPen text with it; the held-back yard builders are now called from penNewYard; r627 = Dark Penitentiary rework (`penitentiary.md`, `dx620`, GENERATED by `tools/pen_gen.py` from the built game's text (it reads the first, base copy of each function): redefines penBuild/penPolish1-4/penBreak/penYard/penSecure/penMess/penActBuild/penAnim, old meshes off via `PENOFF`/`PG_`, models in; dx528 visitation uses penVisitation; the model's penBasket renamed penBasketM; the new yard things are held back because they collide with the base's `dpPen`); r626 = r626 = Desert PD rework (`desert-pd.md`, `dx619`: desertPD and pdHQ redefined; cells moved (-2.7,-2.0); courthouse x 42..58 with the court; build.py patches jailProps/laser/LOS (`pdRg`)/courtEnd acq/pdDim (`pd.x0`,`pd.x1`)/driveway road/barrels); r625 = r625 = Speedway, wind farm and solar farm rework (`speedway-farms.md`, `dx618`: xpSpeedway/xpRaceTick/xpWind/xpSolar redefined, `SPG`, pit stops `spPitTick`, best stop `SV.xpit`, scoreboard `spScoreRefresh`); r624 = r624 = Zone 51 tank traps removed (zfTraps not called, user's request); r623 = the airfield and Dark Zone 51 rework, all batches incl. Zone 51 batch 5 secrets (`airfield-zone51.md`, `dx617`: xpAirfield and xpDarkZone redefined, `AFX`, `ZFA`, new abduction `zfAbdTick` called from the base's q.abd block via build.py, plane stand (345,-1257)); r622 = r622 = Old Quarry outer wall tops 2 cm under the ground (dx581), they flickered with the desert floor along the rim; r621 = Dark Zone 51 entrance sign turned to face the road, build.py patch). r620 (2026-10-17). r620 = Goblino's Scrap rework (`scrap-yard.md`) + police helicopter (`cars.md` part 13), both in `dx616`
  (xpScrap/xpCrusher/crushTick/crushOK/crushStart redefined, `crushPay`, `SYR`, `syTheft` monster truck theft; `mkPoliceHeli` swapped in by
  build.py). Also the real cause of "Fort roads cull up close": `road()` only records into `q.xroads`, and `xpRoadsBuild` later lays the old
  textured strip (y .06, factor -8) plus junction patches; Fort roads are flagged `fb` in `milRoads` and skipped (build.py r620 patches).
- r619 (`main`, 2026-10-17; r619 = the design chat's two Old Quarry fixes: crucible RZ = SM.z-.3, rubble mound at (-185,-1451)). r618 released 2026-10-17. r618 = the Old Quarry rework (`old-quarry.md`): `dx615` holds the design chat's
  five quarry model files (`qmKit`, `qmTurn`, `qmFurnace`... `qmMachine`, `qmSkip`, `qmCrucible`, `qmHaulTruck`), the wiring is
  direct edits in dx581 (rim, crusher, truck, office, blast, yard, pour code: the pot tips via `SM.cru.pot`), dx589 (qtBuild
  sections, qtTick poses), dx591 (`QPOS` two rows, `qmMachine`, `QA.mpos`, `QA.oreB` ore on belts), dx587 (office computer).
  Route grid: plates at the same rounded height share a level (build.py r618), and `navExtraLinks` (dx615) adds straight links.
  Also the Lookout Mesa road embankment (an `xpMesa` wrapper in dx615).
  Fort Blackout road fix: every mesh built from the kit must be `noSeam` (the motor pool apron in `milRoads` wasn't, got a
  seam nudge of -18 and was drawn over North Street up close); `groundLayers` now nudges from the material's original values (`gl0`).
- r617: r617 = command wing/bay dressing moved 15 cm out (their walls are centred on
  the outline) and the Air Ops weather mast on the roof. r616 = the Fort Blackout rework (`fort-blackout.md`): `dx614` holds the design
  chat's five model files (`fbKit`, `fbDress`, `fbWall`, `fbRoad`... 45 builders) plus the wiring (`milRoads` redefined with
  `FBROADS`, a `milBuild` wrapper for the annex/west strip/plaza, `milArea` covers the annex `FBANX`, a `cwBuild` wrapper for
  `fbCmdBlock`). About 70 build.py R patches (block "r616") swap the base's old meshes for the new ones; direct edits in dx549
  (shelters, tower), dx557 (squad spawn/route `CWPD`), dx572 (`WKG.x0` 213), dx598 (new `MPOOL`, `cwShed`, `cwCrewPath`,
  doors in the south wall), dx602 (`MAPBN`), dx606 (`UPLK`). `MILB.x0` is 215. build.py can dump the patched text before the
  r616 block with `DUMP=/path python3 build.py` (handy for writing R patches against already-patched code).
- r615: the plane and the Desert Bus inside and out (`dx613`).
- r614: the five odd cars (`dx612`, `mkOddCar`).
- r613: r613 = helicopter, jet and runabout models (`dx611`: `uh9Model`,
  `ah4Model`, `jetModel` + `gearSet` in `awLook`, `mkRunabout`).
- r612 (2026-10-16): r612 = squad camera monitors in the offices (`dx610`, `SQMON`, `sqmTick`;
  feeds render only in your own office, one per frame).
- r611: r611 = new vehicle models (`dx609`, helper agent; `nvFinish`, `nvCrew`,
  `nvHwp`, `nvBuild`, `nvVan`; `wkBuild` in dx554 now calls `wraithMarks`; wheel roll uses `w.t.userData.r`).
- r610: r610 = police (`dx608`, helper agent): 3 patrol cruisers (`PCRB` beats, host
  drives, sync messages `pcr`/`pcrc`/`pcrw`), Highway Patrol speed checkpoints (`SPCK` sites, `spcForce(i)` debug), AI
  self-repair and wreck logging.
- r609: r609 = uplink (`dx606`) and water delivery (`dx607`), built by a helper
  agent, plus autopilot modes (`dx604`: L cycles modes for the Wraith, planes, jets and helicopters; `wpPlan`, `apFixed`).
- r608: r608 = the main menu and How to play (`src/dx605.js`, built by a helper
  agent; the old `#how` text is cut out in build.py, `#how` stays as an empty title-screen marker).
- r607:
- r607 (`src/dx603.js` + build.py patches): the design chat's `mkGorgeLift`, `mkBoosterRamp`, `mkLandingRamp`;
  one-way lift state machine (`GLIFT`, replaces `liftGo`/`liftTick`); cave floor fix (the tunnel floor box had a negative
  depth); Quarry Skip booster (`QSKIP`, launch in a `vehPhys` wrapper, soft landing via `LANDSOFT`). **`q.obs` boxes
  can now have `top`** (a car above `top - 0.3` passes over), and `q.ramps` can have `nolink` (wall in the route grid).
- **Design specs waiting to be built:** see the "Ready to build" list at the top of `docs/design/README.md` (the old line here said all specs were shipped; that was out of date). Build one only when the user says "build docs/design/<name>.md".
- r606 (`src/dx602.js` + build.py patches): km/h everywhere (`kmh.md`); base map drawn from the wall boxes
  (`mapBaseDraw`, labels `MAPBN`); every desert InstancedMesh unculled and pulled out of scenery chunks (`imFix`;
  that was the Speedway's "invisible obstacles"); dragster front axle; AI cars don't damage themselves on scenery
  (`AISELF` around `vehPhys`/`vehDamage`); gorge fall keeps momentum, no roll, cars fall and wreck at the bottom;
  lift only goes up; mining shack moved west of the road (`SHKP`, `shW`, `shBox`, E prompt). Specs' status lines and
  `docs/design/NOTES.md` are updated. **Still to build:** devils-gorge parts 2-3 (cave floor slab, lift model),
  speedway-and-stunt-jump part 3 (booster ramp models), police (3 patrol cars, km/h checkpoints, cop gorge fall),
  main-menu, how-to-play, uplink, water-delivery, office-monitors (model needs the user's OK).
- r605: `src/dx601.js` **shared AI driver** used by every AI car: `aiCtl(q,v,s,want,d,dt,o)` (speed for bends,
  three-point turns when the point is inside the tightest turning circle `5/K.turn`, stuck recovery that alternates
  sides and sets `s.replan`, circling detection), `aiProbe` (feelers, slope-aware), `aiPassed`, `aiBend`.
  `cwDrive` is fully redefined there (squads, crime getaway cars, crime cops), `wkAPTick` (autopilot) too; police
  patrol/chase use it via build.py R patches; backup cars (`pdUnitsTick`, dx555) edited directly. Squad followers
  follow the leader's track (`cwTrailRec`/`cwTrailPt`). Squads "arrive" at the end of their planned route.
  **Route grid levels:** plates higher/lower than 2 m (Lookout Mesa, the Old Quarry) are separate levels in `NAV.pl`,
  joined only by east-west ramp roads (`navXRamp`, path tags `'up'` then `'land'`). The base game only handled
  north-south jump ramps and made a bogus link for x-ramps.
  Tested by simulation (driver + physics at 30 steps/s, no rendering), new vs r604: point beside the car 15.4 s/1.8 laps
  → 2.6 s; behind 7.8 → 4.0 s; Lookout Mesa and Old Quarry unreachable → 14 s and 13 s; Bus stop (inside a building)
  reached; autopilot home from the desert 38 → 36 s; cop reaches a standing player in 2 s (same). Not tested: real
  play, co-op, the backup cars.
- r604: `src/dx600.js` keeps a parked Wraith in your *current* bay (the bay index from `cwSlot` changes when friends
  join; the parked Wraith now follows it while empty and still, you take ownership so it syncs, and the name sign
  follows). **One font**: build.py swaps Georgia/Arial/Impact/serif/sans-serif for `DoorsSans` (Barlow Semi
  Condensed, `src/fonts/*.woff2`, registered with `FontFace` in `<head>` before any game code). Kept on purpose:
  monospace, Tahoma (retro Windows windows), Comic Sans (jokes). New code should just write `Georgia` or `Arial`
  in fonts and the build swaps it, or write `DoorsSans,Arial,sans-serif` directly.
- r603 contents: `src/dx599.js` desert performance part 2 on top of the r500 `DP` system (late batching of desert
  groups and late-built vehicles, distance culling of loose leaves on layer 6 `PL_FAR`, `?noperf` turns it off,
  `perfForce()` test hook); desert Save & Exit in co-op (`dx575.js`); tank loop moved off the motor pool; motor pool
  floor lines raised.
- **Bug found and fixed before release:** `perfCull` measured distance from an object's origin. A batched mesh
  sits at its group's origin, which can be hundreds of metres from what it draws, so whole base buildings were
  culled while you stood next to them. It now measures from the geometry's bounding-sphere centre. Any future
  culling code must do the same.
- Measured with swiftshader, draw calls with perf on vs `?noperf`: bus stop 375 → 225, north road booth 2024 → 807,
  base 1192 → 553. Triangles are about the same (the gain is draw calls). Screenshots matched at all three spots.
- Not checked: a close-up of the parked aircraft (the test aimed at the wrong spot), and real-GPU frame rates.

## 7. Pending requests from the user (not done yet)

**Optimisation is on hold (user, 2026-10-18):** the user will send a new "master prompt" (maybe as a text file) once the
current design work is done. Don't start optimisation work, even if the design chat asks for it, until that arrives.

The user asked the remaining performance work to:
- cull distant and off-screen objects;
- pause inactive areas only if that won't break timers, enemies, physics or other game logic;
- test it and report what improved, what was tested, and what issues remain.

They said no three.js upgrade is needed if the game runs fine. Don't start one without explicit approval.

**Desert / base**
1. ~~Wraith not in its bay~~: fixed in r604 (dx600). Solo restore already worked in a headless test; the co-op bay
   shuffle was the cause. If the user still sees it, ask whether a friend was in the desert and who owns a Wraith.
2. ~~Autopilot and squads drive in circles~~ (and police): done in r605, see section 6. Old note: they always turn one way, crash into walls, reverse a little and crash
   again, and take wide turns so they can't get through small gaps. Squads can't get up mesa tops because they drive
   straight at the goal instead of following a path (ramps). Related code: `cwDrive` (dx557, wrapped in dx572 with
   `bgPath` base grid and `navReq`/`navSteer`), the autopilot in dx572, `vehPhys`. Needed: proper path following,
   tighter turning or three-point turns, and a better stuck recovery (reverse while steering the other way, then
   re-plan).
3. **Water delivery squad job:** have a man at the destination who takes the water and puts it in a well or tank.
4. **Monitors** on the walls of each general office, showing camera footage of what your squads are doing
   (render-to-texture from a camera following the lead vehicle).
5. **Many military base buildings don't show on the map** (add them to `q.mapR` with colours).
6. **Speedway:** lots of invisible obstacles around it (stray `q.obs` without meshes). The **dragster's front wheels
   float.**
7. **Stunt jump** ("STUNT JUMP · QUARRY SKIP"): make it steeper, with a booster ramp that launches you over the lookout.
8. **Devil's Gorge:**
   - tumbling down it teleports you to the bottom; use the normal fall instead;
   - gaps in the floor of the secret cave;
   - the elevator needs a real shaft (you currently see through the ground);
   - the lift has no rope on the pulley and floats;
   - it should not be possible to ride it back down.
9. **Police:** a dark (police?) car randomly blew up at a road corner. Add more police patrolling the map, and
   sometimes have highway patrol set up speed checkpoints.
10. **Mining shack** (Doors But Desert Mining Co.) blocks a road. Move it to the side, and make the walk-in cutscene
    start with **E** instead of by walking into it.

**Global**
11. ~~Change the font everywhere.~~ Done in r604 (Barlow Semi Condensed). It's Georgia almost everywhere and "screams made by AI". Pick one good-looking
    font (Google Fonts are fine) and use it consistently. Check canvas text (`ctx.font=`), CSS, `pdTxt`/`lab`/`sgn`
    label helpers and the HUD.
12. **Simplify "How to play"**. There's far too much text.

**Hotel**
13. A trim crossing side-room doors was reported earlier but never located. Ask for a screenshot or room type if
    it comes up again.

## 8. Feature map (where things live)

| Area | Modules |
|---|---|
| Changelog (CHLOG), lobby board, menu changelog button | dx531, dx597 |
| Turns, legs, T-rooms, side rooms, Rush/Ambush paths, Ambush audio | dx590 |
| Quarry processing machines, tutorial, build animation | dx591 |
| Room inspector (desync) | dx592 |
| RNG isolation (co-op room fix), office rooms don't turn | dx593 |
| Seek crossroads | dx594 |
| L-wing rebuild | dx595 |
| Caves: chasms, lava lakes, geysers, lush fungus, big ore, cage drop, desert jump | dx596 |
| Map warp/drag, office-bay door, desert-mines shaft (1% in mine), changelog button | dx597 |
| Squad motor pool, crews, squad map routes, co-op Save & Exit (hotel) | dx598 |
| Desert perf part 2 | dx599 |
| Wraith follows your bay, font registration in build.py | dx600 |
| Shared AI driver, squad convoy track, autopilot, route-grid levels (mesa, quarry) | dx601 |
| Base map, instanced-mesh fix, dragster axle, AI self-damage, gorge fall, mining shack move | dx602 |
| Gorge lift model, cave floor, Quarry Skip booster jump | dx603 |
| Autopilot modes (L cycles) | dx604 |
| Main menu (4-button row, Locker, Stats, More), How to play tabs | dx605 |
| Orbital uplink console | dx606 |
| Water delivery: tanks, groundskeeper, jerrycans | dx607 |
| Police: patrol cruisers, speed checkpoints, AI repair/logging | dx608 |
| New vehicle models (sedans, pickups, fast cars, heavy, Wraith, tank) | dx609 |
| Squad camera monitors in the offices | dx610 |
| Helicopter, jet and runabout models | dx611 |
| Odd cars: hearse, limo, rally car, tractor, ice cream van | dx612 |
| Plane, Desert Bus shell and interior | dx613 |
| Fort Blackout rework: kit models, roads, annex, west strip, plaza, motor pool move | dx614 (+ build.py r616 block) |
| Old Quarry rework models, route-grid extra links, mesa road fill | dx615 (wiring in dx581/587/589/591) |
| Goblino's Scrap rework (yard, crusher, ingot pay, monster truck theft), police helicopter | dx616 |
| Airfield and Dark Zone 51 rework, new abduction ride | dx617 |
| Speedway (pit stops, start lights, scoreboard), wind farm, solar farm rework | dx618 |
| Desert PD: station, cells, courthouse, HQ annex, grounds, impound lot | dx619 |
| Dark Penitentiary rework (generated by tools/pen_gen.py) | dx620, dx620dp (replaces the base dpPen) |
| Desert perf step 1: skip matrix updates of hidden/merged objects (`MWX`, `mwFresh`) | dx621 |
| Lag test window (F9, /lag) | dx622 |
| Desert warm-up (GPU uploads ahead of time) | dx623 |
| Vehicle batching (moving parts batched relative to themselves) | dx624 |
| Car-vs-car check pre-filter, centre-line memo | dx625 |
| Desert perf: batching places with moving parts (MXB) | dx632 |
| Desert perf: matrices only redone for things that moved (MWC) | dx633 |
| Lag window: what limits the frame rate, GPU timer, benchmark (LAGV) | dx634 |
| Plane crash site (csWreck) | dx626 |
| Hangar 1 inside (hg*), refit station look | dx628 (+ dx556) |
| Fort weapons: sentries, AA, mortars, missiles, LZ Bravo heli (wp*) | dx627 |
| Dusty Gulch rework (gu*, xpGulch redefined) | dx630 |
| Mirage Lake, observatory, Dino Dan's, railway, train | dx631 |
| The Pyramid rework (py*) | dx629 |
| Quarry, mine core, smeltery, excavator, drill rig, headframe, cage | dx581 |
| Mine biomes, parkour, magma | dx588 |
| Quarry tycoon | dx587, dx589 |
| Military: ranks, missions, Wraith, refits | dx55x–dx57x |
| Command wing, squads | dx557 (+ dx571, dx572) |
| Wraith bays, autopilot | dx572 |
| Desert Save & Exit | dx575 |

When in doubt, `grep` the function name across `src/bak519.html` and `src/dx*.js`. The newest wrapper is in the
highest-numbered module.
