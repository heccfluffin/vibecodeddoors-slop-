Status: shipped in r608

# Main menu: fewer buttons

## Now (title screen)

Seventeen things to click on one screen:
- a stats row: Best door, Runs, Deaths, Escapes, Lifetime gold, Saved by items, Top killer (`svStatsChips`, dx565);
- a row of 9 pill buttons: Continue run, Shop, Badges, Journal, Friends, Account, Co-op, Owner panel, How to play
  (dx565 line ~160, the `uik-nav` row);
- three big buttons: PLAY, PLAY DESERT, DAILY RUN (`mnu-main`, bak519 ~8660 plus dx580);
- a row of 6: QUICK SOLO RUN, CUSTOMIZE, SKINS, DATING MODE, SAVE, CHANGELOG (`mnu-sub`);
- the ⚙ Settings button in the corner.

## Should be

At most **8 things** on the title screen, in this layout:

```
                              D O O R S

             ┌─────────────────────────────────────────┐
             │ ▶ Continue run · door 37                 │   <- only when there is a run to continue (door ≥ 1)
             └─────────────────────────────────────────┘
             ┌─────────────────────────────────────────┐
             │                ▶  PLAY                   │
             │   the lobby: the hotel, the desert, ...   │
             └─────────────────────────────────────────┘
             ┌─────────────────────────────────────────┐
             │             🌵 PLAY DESERT                │
             └─────────────────────────────────────────┘
             ┌─────────────────────────────────────────┐
             │             📅 DAILY RUN                  │
             │  Today: a flashlight ... · streak 1       │
             └─────────────────────────────────────────┘

        [ 📖 How to play ]  [ 🎒 Locker ]  [ 📊 Stats ]  [ ☰ More ]

  (top-left) 👤 Name · rank                                (top-right) ⚙ Settings
```

### The four buttons under the big three

- **📖 How to play**: opens the (new, short) How to Play. See `how-to-play.md`.
- **🎒 Locker**: one panel with tabs (the UI kit's `uik-tabs`):
  **Shop** (the old Shop menu) · **Customize** (`custOpen`) · **Skins** (`skinsOpen`).
  Open on Shop if you have gold to spend, otherwise Customize.
- **📊 Stats**: one panel with tabs:
  - **Stats**: the 7 numbers that used to sit at the top (Best door, Runs, Deaths, Escapes, Lifetime gold,
    Saved by items, Top killer) as a tidy two-column list, plus army rank and prestige if you have them.
  - **Badges** (144/197): the old Badges panel.
  - **Journal** (12/16): the old Journal panel.
  The button itself shows one small line under it: "Best door 100".
- **☰ More**: a small panel with a list (not a grid of big buttons):
  - 🚪 Quick solo run
  - 👥 Friends (show the inbox count if there's mail: "👥 Friends · 2")
  - 🌐 Co-op
  - 📋 Changelog
  - 👑 Owner panel (owners only, gold text, last)

### The profile chip (top-left)
Your name and army rank. Click it to open **Account**. Replaces the Account pill.

### Moved or removed
- **Dating mode: removed.** Take the button off the menu and remove its other entry points (search `dateOpen` and
  "DATING MODE" in `bak519.html` ~13439–13500 and any badge or hint that points to it). Leave the code that reads old
  save data alone, so old saves still load. If a badge can only be earned there, hide it from the badge count
  (don't delete players' earned badges).
- **SAVE** moves into **⚙ Settings → Save data** (there is already a save tab from r565). The game saves on its own
  anyway; the button there says "💾 Save now" and keeps the copy-a-backup-code behaviour.
- **Continue run** becomes the slim bar above PLAY, and only shows when the saved run is at door 1 or more
  ("Continue run (door 0)" was meaningless).
- The stats row at the top is gone (it's in Stats).

### Look
- Use the r565 UI kit (`uik-card`, `uik-tabs`, `uik-btn`) and the game font (DoorsSans / Barlow Semi Condensed).
- The four small buttons are the same width as each other, in one row under the big three, centred.
  On narrow screens (under 520 px) they go 2 × 2.
- The big three keep their colours (green, sand, purple; the daily theme colours still apply).
- The pause menu and the lobby are not part of this.

## What to avoid
- Don't lose any feature: everything that was on the screen is still reachable in one or two clicks.
- Don't break the owner-only check for the Owner panel (it must not appear for anyone else, and no owner key goes in
  the page).
- Don't move Settings out of the corner: other screens use the same gear.
- No new fonts, no Georgia (the build swaps it anyway, but write DoorsSans in new code).

## How to check it (short)
1. Title screen: count the clickable things. 8 or fewer (9 with Continue run).
2. Open each of Locker, Stats, More: every old button is in one of them and works.
3. Narrow the window to phone width: the four buttons wrap 2 × 2, nothing overlaps.
4. A non-owner account has no Owner panel anywhere.
