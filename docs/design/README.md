# Design specs

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
