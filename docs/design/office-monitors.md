Status: shipped in r612

# Squad camera monitors in each General's office

Model: `docs/design/models/squad-monitors.js` (`mkSquadMonitors()`), with `setFeed(i, text, live)` and `update(dt)`.

## What the player sees
- On the left wall of each of the four General's offices (command wing, dx557): a bank of four monitors with a small
  desk under it.
- Every squad of **yours** that's out gets a screen: a live picture from a camera riding behind and above its lead
  vehicle, with a strip along the bottom: "SQUAD ALPHA · EN ROUTE TO OLD QUARRY", the time, and a blinking REC.
  Status text is the squad's `s.st` (rolling out / en route to … / on site: … / heading home).
- Screens with no squad show NO SIGNAL and static.
- When a squad is working on site, the camera parks 12 m from the site at 6 m up and slowly circles, so you can watch
  the job being acted out.
- When a squad is lost, its screen shows the last picture frozen with "SIGNAL LOST" for 10 s, then NO SIGNAL.
- The CAM buttons on the desk light up for live feeds. Pressing E at the desk cycles a big view of one feed over the
  whole bank (nice to have; skip if it's fiddly).

## Placement
- `mkSquadMonitors()` on each office's **left wall**: origin at `(ox0 + 0.15, 0, -853)`, `rotation.y = -Math.PI/2`
  (facing into the office). Office 1 uses the outer wall at `CWB.x0`. Check it doesn't overlap the flag pole at
  `ox0 + 1` (it shouldn't: the bank is centred on z -853, the flag is near the back wall). If it does, move the flag.
- Desk collision box from the model header.

## The cameras (the code part)
- One `THREE.PerspectiveCamera(55, 16/9, 0.5, 400)` per live squad, and one `WebGLRenderTarget(320, 180)` each.
  Set `screens[i].material.map = rt.texture`, then `setFeed(i, text, true)`.
- Camera position: 14 m behind and 7 m above the lead vehicle, looking at a point 6 m ahead of it. Smooth it
  (lerp 0.1 per frame) so bumps don't shake it.
- **Only render when the player is inside that office** (inside the office's walls, not in a vehicle). Render **one
  feed per frame**, round robin, so 3 squads = each screen updates every 3rd frame. That's plenty.
- Render with the desert scene as it is. Before each feed render, turn off the things that only matter to the player's
  view (the HUD sprites, the player's own first-person bits, the r603 far-culling layers must use the feed camera's
  position, or the far squads film empty ground). Simplest: render with the camera's layers set to the normal world
  layers, and skip the perf culler's per-camera work for these small renders.
- If the frame rate drops below 30 while in the office, render feeds at half that rate.
- Call the model's `update(dt)` while in the office (labels, REC blink, static).

## Co-op
- You see your own squads. A friend standing in their office sees theirs. You don't need to sync the feeds.

## What to avoid
- No rendering when nobody is in the office (no cost elsewhere in the desert).
- Don't render the feeds at full resolution: 320 × 180 is enough on a 1 m screen.
- Don't use the player's camera for the feeds.

## How to check it (short)
Send two squads out, walk into your office: two live screens with the convoys driving, two NO SIGNAL. Walk out and back
in: still fine. One look at the frame rate in the office vs outside.
