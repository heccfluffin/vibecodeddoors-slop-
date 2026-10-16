Status: shipped in r609

# THUNDERBOLT uplink: new model

Model: `docs/design/models/uplink.js` (`mkUplink()`). The header has size, placement, parts and collision boxes.

## Replace
In `xsBuild` (dx552), the block "the uplink at Radar Station 13": the 1.2 m box, the screen box, the blue glow sprite
and the tilted disc. Put `mkUplink()` at **x 447, z -693.6, rotation.y = Math.PI**. Move the [E] prop to
**(447.5, -692.2)** (in front of the console). Keep its text and action as they are.

## Hook the console to the strike (using `g.userData.setState` / `update`)
- Each frame while the player is within 60 m: `update(dt)`.
- Prompt state, checked about twice a second:
  - rank below Field Marshal → `'locked'`
  - cooldown running (`S().obT > Date.now()`) → `'charging'` with the seconds left
  - otherwise → `'ready'`
- When `xsPick` opens for THUNDERBOLT and a target is chosen → `'aim'` with `{x, z, nm}` and the dish angles:
  `az` = direction from the uplink to the target in the model's local frame (remember the 180° turn),
  `el` = 70° for targets under 300 m away, down to 35° for the far side of the map.
- When `xsOrbital` fires → `'fire'` for 4 s, then `'charging'`.
- In co-op, other players' consoles follow the same states from the `xmNet 'xs'` message (`k:'ob'`): `'fire'`, then
  `'charging'`.

## Collision
Use the boxes in the model header (rotated with the model). The pad is walkable (0.15 m step).

## Check (short)
Walk up as a low rank: red lamp, red screen, key off. As Field Marshal: green, sweep. Pick a target: the dish turns,
the FIRE cover flips up. Fire: white screen, beacon spins fast, then the countdown.
