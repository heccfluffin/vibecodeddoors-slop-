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
- **No known characters or lookalikes:** no Wario stand-ins, no Roblox Noob, no London Underground roundel and
  the like. Original designs only.
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

- **Live: r602** (`main`).
- **Built but NOT released (r603, in this branch):**
  - `src/dx599.js`: desert performance part 2, on top of the r500 `DP` system:
    - **Late batching:** desert groups built after the r500 pass, once still for 6 s, go through `DP._mergeRoot`
      and are added to `D.roots` (the watchdog then checks them). This was added last and is **untested**:
      vehicles built late (the parked aircraft and trucks at the base) are batched as movers (`D.movers`).
    - **Distance culling** of loose leaves that aren't in a chunk, using layer 6 (`PL_FAR`): small objects
      (radius < 1.2) disappear beyond 150 m, medium ones (< 4) beyond 320 m, everything beyond the fog.
      The Raycaster prototype is patched to also hit layer 6.
    - `?noperf` in the URL turns it off. `perfForce()` is a test hook.
    - Measured at the base with swiftshader: draw calls ~1390 → ~1140 and tris 224k → 210k (before the vehicle
      batching). The biggest remaining cost at the base: **5 parked aircraft, ~140 meshes each (~700 draw calls),
      not batched**. That's what the untested vehicle step targets. The bus stop went from 367 to ~225 calls.
    - JS profiling showed game logic is only ~6% of CPU. Rendering/driver work dominates, so draw calls and
      triangles are what matter. The scene has ~34k meshes, and `scene.updateMatrixWorld` traverses all of them
      every frame.
    - An earlier attempt at a separate merge system double-merged the r500 batches and broke visuals. It was thrown
      away. **Don't write a second batching system.**
  - `src/dx575.js`: desert **Save & Exit now works in co-op** (it leaves the room instead of refusing).
  - The patrol tank loop near the base was moved so tanks don't drive through the motor pool
    (build.py patch: `[[421,-869.5],[586,-869.5],[586,-737],[421,-737]]`).
  - Motor pool floor lines are raised (they disappeared a short way off).
  - **The r603 changelog entry hasn't been written yet.** Add it in dx531.js before releasing.
- Before releasing r603: check visually that nothing disappears or looks wrong with the perf changes (compare
  `?noperf`), especially the bus-stop shack doorway and the phone booth on the north road. Those broke with the old
  merge attempt and should be fine now, but haven't been re-checked.

## 7. Pending requests from the user (not done yet)

The user asked the remaining performance work to:
- cull distant and off-screen objects;
- pause inactive areas only if that won't break timers, enemies, physics or other game logic;
- test it and report what improved, what was tested, and what issues remain.

They said no three.js upgrade is needed if the game runs fine. Don't start one without explicit approval.

**Desert / base**
1. **Wraith not in its bay** after closing and reopening the game, then warping to Fort Blackout with "skip bus
   cutscene" on. Check that `bayBuild`'s restore (`rs()` in dx572) runs on that path, that `S.bayPark` is saved
   (`milSave`) and that `bayMine(q)` is valid then. Maybe give each player a persistent bay index instead of `cwSlot`.
2. **Autopilot and squads drive in circles:** they always turn one way, crash into walls, reverse a little and crash
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
11. **Change the font everywhere.** It's Georgia almost everywhere and "screams made by AI". Pick one good-looking
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
| Desert perf part 2 (unreleased) | dx599 |
| Quarry, mine core, smeltery, excavator, drill rig, headframe, cage | dx581 |
| Mine biomes, parkour, magma | dx588 |
| Quarry tycoon | dx587, dx589 |
| Military: ranks, missions, Wraith, refits | dx55x–dx57x |
| Command wing, squads | dx557 (+ dx571, dx572) |
| Wraith bays, autopilot | dx572 |
| Desert Save & Exit | dx575 |

When in doubt, `grep` the function name across `src/bak519.html` and `src/dx*.js`. The newest wrapper is in the
highest-numbered module.
