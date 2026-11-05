# Design specs

## Ready to build (approved by the user, not in the game yet) · updated 2026-11-05
Claude Code: these are waiting. Each spec's own status line and wiring notes say what's in it.
| Spec | What it is | Models |
|---|---|---|
| `hotel-loop.md` | the hotel run: part 1 (A, C, E, F, G, H) and part 2 (four floors and their looks, the lift lobby, Halt, Timothy, Eyes) | `models/hotel.js` |
| `hotel-rooms.md` | twenty new hotel room types, the jog room, more turns, floor room pools, the room-roll bug fix (all four batches approved) | `models/hotel-rooms.js` (needs `hotel.js`) |
| `desert-mines.md` | **part 1 only** (A, B, C, D, H): real mining with ore veins and the ore cart, seven kinds of blocked doors, room dangers (gas, rockfall, oil), the three creatures (Runaway Cart, bats, the Burrower) and the curse, and the fixes. Parts 2 and 3 are still being designed | `models/desert-mines.js` (needs `fort-kit.js`, `route13.js`, `mesa-gorge.js`) |
| `silo.md` | **urgent part first**: part 1 fixes being stuck in Silo 1 (the walkable rooms don't join). Part 2 is the new look: rack-and-pinion freight lift, arched tunnel with Blast Door 1, the shaft at the surface tube's size, see-through catwalk, umbilical arm, missile cradle, and the open lid showing the real shaft | `models/silo.js` (needs `fort-kit.js`; the preview also uses `weapons.js` and `fort-mid.js`) |


In progress (design): the desert mines (`desert-mines.md` parts 2 and 3), the desert road layout (`desert-roads.md`, part 1 plan for review).

Still to design: the desert mines loop and remodel.

This folder is how the design chat (Claude in the claude.ai app) and Claude Code work together on DOORS.

- **The design chat writes specs here.** One Markdown file per feature or fix (for example `office-monitors.md`).
  Each spec says what the player should see and do, how it should look, what to avoid, and how to check it is right.
  The design chat only writes in `docs/`. It never edits the game code, builds or releases.
- **Claude Code builds them.** When the user says "build docs/design/<name>.md", read the spec, check it against
  `CLAUDE.md` (the user's standing rules always win), make the change, test, and release as usual.
  If something in the spec can't work or doesn't fit the code, do the closest sensible thing and say so in `NOTES.md`.
- **Status line at the top of each spec:** `Status: proposed | building | shipped in rNNN | dropped`.
  Claude Code updates it when it starts and when it ships.
- **`NOTES.md` (in this folder)** is for messages back to the design chat: what was built and how,
  what had to change from the spec, questions, or screenshots/ideas worth a design pass.
  Newest notes at the top, each with the date and build number.

Only one side changes code: Claude Code. If both need to touch the same file in `docs/`, pull first.

## Models (`docs/design/models/`)

The design chat also builds 3D models. These are the one kind of code it writes, and they are finished parts, not game logic.

- Each model is **`docs/design/models/<name>.js`**: one self-contained three.js r128 function, in the game's own style,
  for example `function mkDrillRig(){ ... return g }`. It returns a `THREE.Group`. It uses no globals except `THREE`,
  makes its own materials, and puts nothing in the scene.
- **The header comment says everything needed to place it:** size in metres, where the origin is (usually the centre of
  the base, on the ground), which way is front (-z unless stated), which named parts move (`g.userData.parts`:
  wheels, arm, door and so on, with their pivots), any suggested animation code, and a suggested collision box.
- There may also be `<name>.md` with notes, and a preview page the user has already approved.

**Claude Code: "add docs/design/models/<name>.js to the game"** means:
1. Copy the function into the right module, or a new one. Rename it if the name clashes with an existing global
   (search `src/bak519.html` and `src/dx*.js`).
2. Place it, add obstacles (`ob(...)`, `q.obs`), props and animations, and replace the old model if there is one.
3. Don't change how the model looks without saying so in `NOTES.md`. Small fixes for fit (scale, ground height,
   overlaps with what is around it) are fine, but list them.
4. Set the `Status:` line in the header and release as usual.
