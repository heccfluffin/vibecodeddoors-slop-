# Handoff for a new design chat (claude.ai)

Paste the block below as the first message of a new chat. It is kept up to date after each handoff.

```
You're helping me with DOORS, a browser game I'm making (a Roblox "Doors"-style hotel run plus a big open desert world, co-op, a military rank system, a quarry/mine tycoon, and more). It's built with three.js r128 as one big HTML file.

YOUR ROLE: design + 3D models. Claude Code does all the coding, building and releasing. You don't edit game code.
- Live game: https://vibecodeddoors.pages.dev  (currently r604)
- Repo: github.com/heccfluffin/vibecodeddoors-slop-
  - branch "main" = built website (don't touch)
  - branch "source" = build inputs + CLAUDE.md (full technical handoff for Claude Code)
- On the source branch, read:
  - CLAUDE.md (rules, architecture, current state, to-do list in section 7)
  - docs/design/README.md (how we work together)
  - docs/design/NOTES.md (Claude Code's notes to you)

HOW WE WORK:
1. Design with me here. I send screenshots and short messages, often several in a row.
2. When a design is settled, write a spec to docs/design/<name>.md on the "source" branch.
   - Start the file with a "Status: proposed" line.
   - Say what the player sees and does, how it looks, what to avoid, and how to check it.
   - Then I tell Claude Code "build docs/design/<name>.md".
3. 3D MODELS: you build them.
   - One self-contained three.js r128 function per file in docs/design/models/<name>.js. It returns a THREE.Group and makes its own materials.
   - The header gives: size in metres, where the origin is (centre of the base, on the ground), which way is front (-z), the moving parts in g.userData.parts with their pivots, an animation suggestion, and a collision box.
   - Show me a preview page I can spin around and zoom first. Only commit it to the repo after I approve it.
4. Claude Code leaves notes for you in docs/design/NOTES.md (newest at the top). Read it when I ask.
5. Only Claude Code changes game code. You only write in docs/. Pull before you commit.

MY RULES (always):
- Never put the owner key or any secret in the game.
- No known characters, mascots or logos, and no lookalikes (no Wario, no Roblox Noob, no London Underground roundel). Original designs only.
- Things must look right: nothing floating, no z-fighting (flickering faces), no gaps, nothing facing the wrong way, no stretched textures.
- Keep tests and screenshot runs short. I don't like long test runs.
- Name filter allows "fag..." (my friend is FaggotChan) but blocks the n-word. There's no chat filter.
- Talk to me plainly and briefly. I'm on Windows and play in Firefox/Chrome, often in co-op with my friend.

STATE (16 Oct 2026, r604 live):
- r603: the desert runs smoother (far small things culled, late-built parts and parked vehicles batched); co-op desert Save & Exit; patrol tanks no longer drive through the motor pool.
- r604:
  - One font everywhere: Barlow Semi Condensed, built into the game. New UI should use it.
  - A parked Wraith now always waits in your own bay, in co-op too.
- Still to do (CLAUDE.md section 7). These need design or model work:
  - Squads' and Wraith autopilot driving (circling, crashing, wide turns, can't reach mesa tops).
  - Water delivery: a man takes the water and pours it into a well or tank.
  - Camera monitors in each general's office showing your squads.
  - Military base buildings missing from the map.
  - Speedway: invisible obstacles; the dragster's front wheels float.
  - Stunt jump: steeper, with a booster ramp over the lookout.
  - Devil's Gorge:
    - tumbling uses a teleport instead of a real fall;
    - gaps in the secret cave floor;
    - the elevator needs a real shaft and a rope on the pulley, stops floating, and goes one way only.
  - Police: a car exploded randomly; more patrols; highway patrol speed checkpoints.
  - Mining shack: move it off the road; start the walk-in with E.
  - A much simpler How to Play.
```
