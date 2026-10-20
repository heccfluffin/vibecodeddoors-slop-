Status: shipped in r638 (2026-10-20)

# Move the meteor crater off the police station

The user's screenshot (2026-10-19): the meteor crater's rubble ring and the green rock sit inside the new impound lot
by the guard booth. The crater (140, -1005) was there first; the Desert PD rework put the impound lot at
x 138..156, z -1025..-1004 (desert-pd.md batch 6), right on top of it, and some of the five meteorite fragments
land in the lot too.

## Move it 35 m north to (140, -970)
- Checked against the desert's obstacles, ground shapes, roads and named places (dumped from the game), plus the PD,
  its HQ annex, the impound lot and the courthouse (built late, so not in the dump). The crater and all five
  fragment spots (x 128..162, z -983..-956) have 12 m of open sand to the impound lot, 33 m to the nearest road,
  52 m to the PD's phone booth and 61 m to Skull Rock. Nothing else is planned there in the other specs.
- Everything moves together, so the fragments stay "scattered round the crater" and saved progress (`SV.met`) still
  matches (same five spots, same order).

## The changes (all in bak519, so build.py R patches)
1. The crater itself (rim, pit, green rock, its obstacle, glow, the "Touch the glowing rock" prop, the map marker in
   `q.locs`) and the five fragments both start with `const kx=140,kz=-1005` (2 places):
   `_o,_n='const kx=140,kz=-1005','const kx=140,kz=-970'; assert s.count(_o)==2; s=s.replace(_o,_n)`
2. The map circle in `dmapBg` (bak519 ~7765) uses `X(140),Y(-1005)` twice:
   `_o,_n='X(140),Y(-1005)','X(140),Y(-970)'; assert s.count(_o)==2; s=s.replace(_o,_n)`
   (desert-map.md turns this into a `q.mapR` circle pushed by the crater's builder; use (140, -970) there.)
3. Nothing else refers to the spot (checked: dx555's K-9 Biscuit at z -1005.4 and the impound lot's barrels are
   PD things and stay).

## Check
A screenshot from the PD forecourt looking east: the impound lot and the guard booth clear, the crater out on the
sand beyond, all five fragments on open sand (`freeSpot` still nudges them off anything).
