Status: layout approved 2026-10-18 · batch 1 (outside) in progress

# The Pyramid rework (remodel list #20)

A full rework of the look of the Pyramid, outside, on the ground floor and in the undercroft. **Every room, trap,
puzzle, prop and spot stays where it is** (the ground-floor grid `F` and the undercroft grid `FB` in `pyrBuild` /
`pyrUnder` are unchanged), so all the gameplay keeps working. Models: **`docs/design/models/pyr.js`**.

## Layout
- The pyramid: same place and size (`PYR` -175, -1040, base 76 m, 56 m high), the way in on the east side.
- The temple gateway at the passage mouth (x -133.5): pylon towers either side (z ±1.6..±5), a winged sun over the
  door, braziers. The opening stays 3.2 m wide, the passage stays x -153..-133.5.
- The avenue: paving x -133.5..-122, z ±3.5; three jackal statues each side (x -129.5, -127, -124.5, z ±4.6);
  two obelisks (x -121.8, z ±4.4); the two sphinxes (x -132.2..-125.8, z ±8.6, facing east). The taxi stop and
  phone booth at (-120, -1040) are unchanged.
- The dig camp: x -166..-148, z -1097..-1083 (south of the base, east of the road).
- Ruins in the sand: fallen columns (-194, -1088), a broken statue (-127, -995), fallen casing stones (-221, -1050).
  All clear of the base (x -213..-137, z -1078..-1002).

## Batches
1. Outside: the faces, capstone, rubble, gateway, avenue, sphinxes, obelisks, dig camp, ruins.
2. The ground floor's walls, ceilings, floors and lights; the entrance hall; the antechamber.
3. The dart and blade corridors, the sealed door and its dials, the clue rooms and the scarab trapdoor.
4. The treasure chamber (gold, sarcophagus and mummy, chest, golden mask).
5. The undercroft: walls, stairs and landing, the Trial of the Jackal, the Trial of the Sun.
6. The Trial of Song, the Trial of Sand, the tomb.
