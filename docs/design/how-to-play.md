Status: proposed

# How to Play: short version

## Now

`#how` in `bak519.html` (line ~43), shown by `howOpen()` in dx565, is about **2,000 words** in one long scroll.
It covers the hotel only, in detail nobody reads before playing, and says nothing about the desert.

## Should be

One card, **four tabs**, each one short enough to read without scrolling on a laptop. About 250 words in total.
Use the UI kit (`uik-card`, `uik-tabs`) and the game font. Keep the touch-controls line (only shown on touch devices).

The long text isn't thrown away: what it explains is either found in play (hints already explain most of it), in
the Journal, or in item tooltips. Remove the old `#how` content and replace it with the text below, word for word.

### Tab 1 · Basics

> **Get to door 100 and out.** Every door is a new room. Take the key at reception, open the door, keep going.
>
> **WASD** move · **Mouse** look · **E** use, open, hide, talk · **C** crouch · **1–9** pick an item, **click** to use it ·
> **F** flashlight · **M** map (desert) · **Esc** pause
>
> Gold comes from drawers. Spend it in the Shop between runs. Everything saves by itself.

Touch devices also get (only on touch):
> 📱 Left side: walk. Drag the right side: look. Tap the right side: use your item. **E** button: interact.

### Tab 2 · Monsters

> 🏃 **Rush & Ambush**: lights flicker, then they charge. **Hide in a locker.**
> 👁️ **Seek**: runs after you for a while. **Don't stop running.**
> 🦻 **Figure** (doors 50 and 100): blind, hears everything. **Crouch** near him.
> 👀 **Screech**: in dark rooms, if you hear "psst", **turn and look at him.**
> 🚪 **Fake doors**: only the door whose plaque shows the next number is real.

### Tab 3 · Items

> ✝️ **Crucifix** stops a monster once. 👼 **Guardian Angel** saves you once.
> 🔦 Lights run down: find 🔋 batteries. 🗝️ Lockpicks open locked doors. 🧪 Vitamins: speed and a little healing.
> Point at any item in your hotbar to see what it does.

(The "point at an item" line needs item tooltips in the hotbar. Claude Code: if they don't exist, add a short
one-line tooltip per item from the old text, shown when you hover or select the slot. If that's too much for this
change, drop that sentence.)

### Tab 4 · Desert & co-op

> 🌵 **The desert** is a big open world: drive anything you find (**E** to get in), take jobs, join the army,
> mine the quarry. **M** opens the map; click it to set a waypoint.
> 🌐 **Co-op**: play with friends from the lobby (PLAY). **/** chat · **Tab** players · **X** drop an item for a friend.
> If you go down, a friend can revive you.

### Footer (small, every tab)
> Stuck or found a bug? **F8** opens the console. *Copy report* puts it on your clipboard.

## What to avoid
- No walls of text. If a tab needs scrolling at 1366 × 768, it's too long.
- No numbers players don't need (damage values, percentages, drop rates).
- Don't change the keys themselves.

## How to check it (short)
Open How to Play at 1366 × 768: four tabs, none scrolls. On a phone-sized window the touch line shows.
