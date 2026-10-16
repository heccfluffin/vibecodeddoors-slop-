Status: working list (design chat)

# Remodel list

Every model the game builds, ranked: how often players see it × how rough it is now. The design chat remodels them
one at a time (preview → user approves → commit to `docs/design/models/`), then the user tells Claude Code to swap
each one in. Animations and textures come with each model.

Done so far: Gorge lift, Quarry Skip ramps, THUNDERBOLT uplink, water tank, jerrycan, caretaker (spare),
the Groundskeeper, squad monitors, speed checkpoint.

## Tier 1: seen all the time
| # | What | Where it's built | Notes |
|---|---|---|---|
| 1 | **Soldiers and police officers** | `mkSoldier`, `mkCopSeek` (bak519), `mkOfficer` (dx555); ~50 call sites | They're all the Seek monster model with a cap stuck on. Needs a proper soldier and a proper officer, jointed like the Groundskeeper, with walk/run/sit/drive/salute poses. |
| 2 | **Desert cars** | `mkVehModel` (one function for ~20 vehicles), `mkOldCar`, `mkVan`, `mkTowTruck`, `mkApcModel`, `mkSwatModel` | Box cars. Do them in families: sedan/cab, pickup/jeep, police cruiser + Highway Patrol, dragster/sport/muscle, trucks/APC. |
| 3 | **Player avatar** | `mkAvatar` | What co-op friends see of each other. Keep the outfit/skin system working. |
| 4 | **Elevators** | hotel `mkElevator`; Silo 1 freight elevator (dx579); mine cage and headframe (shack cage in bak519 ~2495, dx581 headframe) | The user asked for these after the gorge lift. |
| 5 | **The Desert Bus** | `mkBusModel`, `mkBusInterior`, `mkMegaBus`, `mkMegaInterior` | You spend a lot of time in it. |
| 6 | **Hotel items** | `mkKey`, `mkCross` (crucifix), `mkJug` (Starlight Jug), `mkBulb`, `mkDrawer`, `mkLoreBook`, lockers | Small, held in your hand, seen close up. |

## Tier 2: characters and entities
| # | What | Where | Notes |
|---|---|---|---|
| 7 | Seek | `mkSeekModel` | The base for everything above; remodel him last of the people, after soldiers stop using him. |
| 8 | El Goblino | `mkGoblino` (1 part) | Very simple now. |
| 9 | Honcho | `mkHoncho`, `mkHonchoRun` | |
| 10 | Jeff | `mkJeff` | |
| 11 | Screech, ghosts, Grin, inmates, the pharaoh | `mkScr`, `mkGhost`, `mkGrin`, `mkInmate`, `mkPharaoh` | |
| 12 | Ohien | `mkOhien`, `mkSylveon` | |
| 13 | Animals | `mkDog`, `mkRat` | |

## Tier 3: desert places (big, done in pieces)
| # | What | Where |
|---|---|---|
| 14 | Dusty Gulch (town) | `xpGulch`, `xpMoreTown` |
| 15 | Fort Blackout buildings | dx55x–dx57x, dx598 |
| 16 | Airfield, Dark Zone 51 | `xpAirfield`, `xpDarkZone` |
| 17 | Speedway, scrap yard, crusher, wind and solar farms | `xpSpeedway`, `xpScrap`, `xpCrusher`, `xpWind`, `xpSolar*` |
| 18 | Mirage Lake, observatory, dino, railway | `xpLake`, `xpObservatory`, `xpDino`, `xpRail` |
| 19 | Military vehicles and weapons | tank (in `mkVehModel`), `mkApcModel`, `mkHeli`, `mkICBM`, `mkTurret`, `mkMortar` |

## Tier 4: hotel rooms
Rooms are generated (`mkRoomRaw`, `mkHallVar`, `mkWingRoom`, libraries, cellar, sewer, boiler…). These are layout
code more than models: better done as texture and prop passes than remodels. Later.
