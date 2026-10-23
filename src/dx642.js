/* =====================================================================================================
   r655 candidate: THE OLD QUARRY UNDERGROUND (docs/design/quarry-underground.md), part 1: THE MODELS.
   The design chat's seven model files, byte for byte and in their load order:
   quarry-under.js (the layout generator ugGen), quarry-under-kit.js (the kit, ugBuildLevel), quarry-under-l1.js
   (level 1 rooms), quarry-under-l2.js and quarry-under-l2r.js (level 2, the caves), quarry-under-l3.js (level 3, The
   Deep) and quarry-under-shift.js (dynamite, rockfall, gas, pickups, map board, minimap, cage panel).
   Nothing here touches the game: dx642b.js wires it in (the mine, walking, the cage, the shift).
   ===================================================================================================== */
/* ---------------- docs/design/models/quarry-under.js ---------------- */
/* =====================================================================================================
   The Old Quarry's underground: the LAYOUT GENERATOR (reference for docs/design/quarry-underground.md, part 1).
   Pure data, no THREE: ugGen(seed) returns a plan of three levels of pieces (tunnels, junctions, rooms, ramps).
   Coordinates are metres from the shaft centre: world x = MN.ox + x, world z = MN.oz + z (desert-local), and every
   level has its own floor height (UGL[i].y). Forward is -z. All randomness comes from the seed (co-op safe).
   ===================================================================================================== */
const UGL=[
 {n:1,key:'works',nm:'Old Workings',y:-40,rooms:5,min:17,max:24},
 {n:2,key:'caves',nm:'The Caves',y:-52,rooms:5,min:15,max:22},
 {n:3,key:'deep',nm:'The Deep',y:-64,rooms:4,min:13,max:20}];
const UGB=72;          // the mine stays inside +-72 m of the shaft (the same box as today's mine)
const UGC=2;           // occupancy grid cell (m)
function ugRng(s){s=(s>>>0)%2147483647||1;return()=>(s=s*16807%2147483647)/2147483647}

/* ---- shape helpers (local piece space: entry at 0,0, the piece runs towards -z) ---- */
const ugArc=(cx,cz,r,a0,a1,n)=>{const p=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;p.push([cx+r*Math.cos(a),cz+r*Math.sin(a)])}return p};
function ugWig(R,L,amp){const p=[[0,0]];const n=Math.max(2,Math.round(L/4));for(let i=1;i<n;i++)p.push([(R()*2-1)*amp,-L*i/n]);p.push([0,-L]);return p}

/* ---- the piece types. cat: tun (tunnel), jn (junction), room, end (dead-end room), link (to the level below).
   lv: levels it can appear on; w: weight; mx: most per mine; want: try hard to place at least one.
   mk(R) gives foot (occupancy rects), ex (exits [x,z,dir,levelDelta]; dir 0 fwd -z, 1 right +x, 2 back, 3 left -x),
   shp (what the floor looks like) and fx (features for the plan). ---- */
const UGP={
 /* ----- Level 1: Old Workings (timbered, rails, lamps on a wire) ----- */
 drive:{nm:'Drive',cat:'tun',lv:[1],w:6,mk(R){const L=[12,16,20,26][R()*4|0];return{foot:[[-2,2,-L,0]],ex:[[0,-L,0]],shp:[{k:'path',pts:[[0,0],[0,-L]],w:4}],fx:[{k:'sets',pts:[[0,0],[0,-L]]},{k:'rail',pts:[[0,0],[0,-L]]}]}}},
 bend:{nm:'Bend',cat:'tun',lv:[1],w:4,mk(R){const s=R()<.5?1:-1,p=ugArc(6*s,0,6,s>0?Math.PI:0,s>0?1.5*Math.PI:-.5*Math.PI,10);return{foot:[[s>0?-2:-8,s>0?8:2,-8,0]],ex:[[6*s,-6,s>0?1:3]],shp:[{k:'path',pts:p,w:4}],fx:[{k:'sets',pts:p},{k:'rail',pts:p}]}}},
 tee:{nm:'T junction',cat:'jn',lv:[1],w:4,mk(){return{foot:[[-4,4,-8,0]],ex:[[-4,-4,3],[4,-4,1]],shp:[{k:'path',pts:[[0,0],[0,-4]],w:4},{k:'path',pts:[[-4,-4],[4,-4]],w:4}],fx:[{k:'sign',x:0,z:-5.6},{k:'rail',pts:[[0,0],[0,-4],[4,-4]]}]}}},
 cross:{nm:'Crossroads',cat:'jn',lv:[1],w:2,mk(){return{foot:[[-4,4,-8,0]],ex:[[-4,-4,3],[4,-4,1],[0,-8,0]],shp:[{k:'path',pts:[[0,0],[0,-8]],w:4},{k:'path',pts:[[-4,-4],[4,-4]],w:4}],fx:[{k:'sign',x:1.6,z:-5.6},{k:'rail',pts:[[0,0],[0,-8]]}]}}},
 stope:{nm:'Stope',cat:'room',lv:[1],w:3,mx:3,want:1,mk(R){const ex=R()<.6?[[0,-18,0]]:[];return{foot:[[-7,7,-18,0]],ex,shp:[{k:'path',pts:[[0,0],[0,-2]],w:4},{k:'rect',x0:-7,x1:7,z0:-18,z1:-2,rough:1}],fx:[{k:'cribs',pts:[[-3.5,-6],[3.5,-6],[-3.5,-12],[3.5,-12],[0,-14]]},{k:'ore',n:7},{k:'icon',x:0,z:-9,t:'⛏️'}]}}},
 crib:{nm:'Crib room',cat:'end',lv:[1],w:2,mx:1,want:1,mk(){return{foot:[[-4,4,-10,0]],ex:[],shp:[{k:'path',pts:[[0,0],[0,-2]],w:2.4},{k:'rect',x0:-4,x1:4,z0:-10,z1:-2}],fx:[{k:'blk',pts:[[0,-6.6]],r:1.1,n:'table'},{k:'blk',pts:[[3,-9]],r:.5,n:'stove'},{k:'icon',x:0,z:-6.6,t:'🥪'}]}}},
 magazine:{nm:'Powder magazine',cat:'end',lv:[1],w:2,mx:1,want:1,mk(){return{foot:[[-3,3,-9,0]],ex:[],shp:[{k:'path',pts:[[0,0],[0,-3]],w:2},{k:'rect',x0:-3,x1:3,z0:-9,z1:-3}],fx:[{k:'door',x:0,z:-3},{k:'blk',pts:[[-1.9,-7.6],[1.9,-7.6],[-1.9,-5.6]],r:.55,n:'crate',c:'#8a2a1a'},{k:'icon',x:.6,z:-6,t:'🧨'}]}}},
 collapsed:{nm:'Collapsed drift',cat:'tun',lv:[1],w:1.5,mx:2,mk(){return{foot:[[-2,2,-12,0]],ex:[[0,-12,0]],shp:[{k:'path',pts:[[0,0],[0,-12]],w:4}],fx:[{k:'sets',pts:[[0,0],[0,-12]],broken:1},{k:'rubble',x:.7,z:-6}]}}},
 pump:{nm:'Pump room',cat:'room',lv:[1],w:2,mx:1,mk(){return{foot:[[-5,5,-10,0]],ex:[[0,-10,0]],shp:[{k:'rect',x0:-5,x1:5,z0:-10,z1:0}],fx:[{k:'water',cx:-2,cz:-5,rx:2.4,rz:3.4,deep:1},{k:'blk',pts:[[2.6,-5]],r:.95,n:'pump'},{k:'icon',x:2.6,z:-5,t:'🛢️'}]}}},
 round:{nm:'Pillar round',cat:'jn',lv:[1],w:2.5,mx:2,want:1,mk(R){const p=[[0,-4],[8,-4],[8,-24],[-8,-24],[-8,-4],[0,-4]];const ex=[[0,-28,0]];if(R()<.4)ex.push([10,-14,1]);return{foot:[[-10,10,-28,0]],ex,ring:{a:[8,-14],b:[-8,-14]},shp:[{k:'path',pts:[[0,0],[0,-4]],w:4},{k:'path',pts:p,w:4},{k:'path',pts:[[0,-24],[0,-28]],w:4}].concat(ex.length>1?[{k:'path',pts:[[8,-14],[10,-14]],w:4}]:[]),fx:[{k:'pillar',x0:-6,x1:6,z0:-22,z1:-6},{k:'sets',pts:p},{k:'rail',pts:[[0,0],[0,-4],[8,-4],[8,-24],[0,-24],[0,-28]]},{k:'icon',x:0,z:-14,t:'⛏️'}]}}},
 /* ----- Level 2: The Caves (natural, organic shapes) ----- */
 cpass:{nm:'Cave passage',cat:'tun',lv:[2,3],w:6,mk(R){const L=[12,18,24][R()*3|0],p=ugWig(R,L,1.2);return{foot:[[-3,3,-L,0]],ex:[[0,-L,0]],shp:[{k:'path',pts:p,w:4.6,org:1}]}}},
 cbend:{nm:'Cave bend',cat:'tun',lv:[2,3],w:4,mk(R){const s=R()<.5?1:-1,p=ugArc(8*s,0,8,s>0?Math.PI:0,s>0?1.5*Math.PI:-.5*Math.PI,12);return{foot:[[s>0?-3:-11,s>0?11:3,-11,0]],ex:[[8*s,-8,s>0?1:3]],shp:[{k:'path',pts:p,w:4.6,org:1}]}}},
 fork:{nm:'Cave fork',cat:'jn',lv:[2,3],w:4,mk(R){return{foot:[[-6,6,-10,0]],ex:[[-6,-6,3],[6,-6,1]].concat(R()<.5?[[0,-10,0]]:[]),shp:[{k:'blob',cx:0,cz:-5.2,rx:6,rz:5}]}}},
 island:{nm:'Rock island',cat:'jn',lv:[2,3],w:2.5,mx:2,want:1,mk(R){const c=ugArc(0,-12,7.5,Math.PI*.5,Math.PI*2.5,28).map(q=>[q[0]*(1+.08*Math.sin(q[1]*1.3)),q[1]]);const ex=[[0,-24,0]];if(R()<.4)ex.push([10,-12,1]);return{foot:[[-10,10,-24,0]],ex,ring:{a:[7.5,-12],b:[-7.5,-12]},shp:[{k:'path',pts:[[0,0],[0,-4.5]],w:4.6,org:1},{k:'path',pts:c,w:4.2,org:1},{k:'path',pts:[[0,-19.5],[0,-24]],w:4.6,org:1}].concat(ex.length>1?[{k:'path',pts:[[7.5,-12],[10,-12]],w:4.6,org:1}]:[]),fx:[{k:'isle',cx:0,cz:-12,rx:5.2,rz:5.2}]}}},
 crystal:{nm:'Crystal grotto',cat:'room',lv:[2],w:3,mx:2,want:1,mk(R){return{foot:[[-8,8,-20,0]],ex:[[0,-20,0]].concat(R()<.5?[[8,-10,1]]:[]),shp:[{k:'blob',cx:0,cz:-10,rx:8,rz:10}],fx:[{k:'spots',n:16,c:'#7fe4ff',rx:6,rz:7,cz:-10},{k:'icon',x:0,z:-10,t:'💎'}]}}},
 fungus:{nm:'Fungus grotto',cat:'room',lv:[2],w:3,mx:2,want:1,mk(R){return{foot:[[-10,10,-20,0]],ex:[[0,-20,0]].concat(R()<.5?[[-10,-10,3]]:[]),shp:[{k:'blob',cx:0,cz:-10,rx:10,rz:10}],fx:[{k:'spots',n:22,c:'#e58ae0',rx:8,rz:8,cz:-10,r:1.1},{k:'spots',n:16,c:'#5fbf6a',rx:8,rz:8,cz:-10,r:.8},{k:'icon',x:0,z:-10,t:'🍄'}]}}},
 flooded:{nm:'Flooded gallery',cat:'room',lv:[2],w:2.5,mx:1,want:1,mk(){return{foot:[[-5,5,-24,0]],ex:[[0,-24,0]],shp:[{k:'blob',cx:0,cz:-12,rx:5,rz:12}],fx:[{k:'water',cx:.6,cz:-12,rx:4,rz:11},{k:'walk',pts:[[-3.4,-1],[-3.4,-23]]},{k:'icon',x:1,z:-12,t:'💧'}]}}},
 chasm:{nm:'Chasm hall',cat:'room',lv:[2],w:2,mx:1,want:1,mk(){return{foot:[[-7,7,-20,0]],ex:[[0,-20,0]],shp:[{k:'blob',cx:0,cz:-10,rx:7,rz:10}],fx:[{k:'chasm',pts:[[-7,-9],[-2,-10.5],[3,-9.4],[7,-10.6]],w:3},{k:'bridge',x0:0,z0:-7.6,x1:0,z1:-12.4},{k:'stones',pts:[[-4.6,-8.4],[-4.2,-10],[-4.8,-11.6]]}]}}},
 hall:{nm:'Stalactite hall',cat:'room',lv:[2],w:3,mx:1,want:1,mk(R){return{foot:[[-10,10,-20,0]],ex:[[0,-20,0]].concat(R()<.5?[[10,-10,1]]:[]),shp:[{k:'blob',cx:0,cz:-10,rx:10,rz:10}],fx:[{k:'cols',pts:[[-4,-6],[3.6,-5],[-2,-13],[4.5,-13.5],[0,-10]]},{k:'icon',x:-5,z:-10,t:'🪨'}]}}},
 stream:{nm:'Stream crossing',cat:'tun',lv:[2],w:1.5,mx:2,mk(){return{foot:[[-3,3,-12,0]],ex:[[0,-12,0]],shp:[{k:'path',pts:[[0,0],[.8,-6],[0,-12]],w:4.6,org:1}],fx:[{k:'stream',pts:[[-3,-5],[3,-7]]},{k:'stones',pts:[[-.2,-5.4],[.8,-6],[1.6,-6.6]]}]}}},
 orepass:{nm:'Ore pass',cat:'end',lv:[2,3],w:1.5,mx:1,mk(){return{foot:[[-3,3,-8,0]],ex:[],shp:[{k:'path',pts:[[0,0],[0,-2]],w:3},{k:'rect',x0:-3,x1:3,z0:-8,z1:-2}],fx:[{k:'grate',x:0,z:-5.4},{k:'icon',x:0,z:-5.4,t:'⬇️'}]}}},
 /* ----- Level 3: The Deep ----- */
 magma:{nm:'Magma chamber',cat:'room',lv:[3],w:3,mx:2,want:1,mk(R){return{foot:[[-12,12,-24,0]],ex:[[0,-24,0]].concat(R()<.5?[[12,-12,1]]:[]),shp:[{k:'blob',cx:0,cz:-12,rx:12,rz:12}],fx:[{k:'lava',pts:[[-11,-15],[-4,-13],[3,-14.4],[10.6,-16.6]],w:1.4},{k:'bridge',x0:0,z0:-11.6,x1:0,z1:-16},{k:'lake',cx:4.6,cz:-6.6,rx:3.8,rz:2.2},{k:'stones',pts:[[1.5,-6.5],[2.8,-6.7]]},{k:'icon',x:4.6,z:-6.6,t:'💠'},{k:'gey',x:-6,z:-7},{k:'cols',pts:[[-6,-17.5],[-4.4,-19.2],[6.2,-18.6]],r:.8,c:'#2a2422'}]}}},
 dark:{nm:'Dark cave',cat:'room',lv:[3],w:2,mx:1,want:1,mk(){return{foot:[[-9,9,-18,0]],ex:[[0,-18,0]],shp:[{k:'blob',cx:0,cz:-9,rx:9,rz:9,dark:1}],fx:[{k:'chasm',pts:[[-9,-10],[-3,-8.6],[3,-9.8],[9,-8.4]],w:2.6},{k:'bridge',x0:-.4,z0:-7.4,x1:-.4,z1:-11.2},{k:'glow',n:18,rx:8,rz:8,cz:-9},{k:'icon',x:-5,z:-13,t:'🔦'}]}}},
 geode:{nm:'The Geode',cat:'end',lv:[3],w:2,mx:1,want:1,mk(){return{foot:[[-6,6,-15,0]],ex:[],shp:[{k:'path',pts:[[0,0],[0,-3.4]],w:2.4,org:1},{k:'blob',cx:0,cz:-9,rx:6,rz:6,geo:1}],fx:[{k:'ring',cx:0,cz:-9,r:5.2},{k:'icon',x:0,z:-9,t:'💜'}]}}},
 hotseam:{nm:'Hot seam',cat:'end',lv:[3],w:1.5,mx:1,mk(){return{foot:[[-3,3,-9,0]],ex:[],shp:[{k:'path',pts:[[0,0],[0,-3]],w:2.6,org:1},{k:'blob',cx:0,cz:-6,rx:3,rz:3}],fx:[{k:'spots',n:6,c:'#9cff5a',rx:2,rz:2,cz:-6},{k:'icon',x:0,z:-6,t:'☢️'}]}}},
 basalt:{nm:'Basalt gallery',cat:'tun',lv:[3],w:2,mx:2,mk(R){const p=ugWig(R,16,.8);return{foot:[[-3,3,-16,0]],ex:[[0,-16,0]],shp:[{k:'path',pts:p,w:5,org:1}],fx:[{k:'cols',pts:[[p[1][0]-1.3,p[1][1]],[p[2][0]+1.3,p[2][1]],[p[3][0]-1.3,p[3][1]]],c:'#2a2422',r:.6},{k:'cracks',pts:p}]}}},
 /* ----- links between levels ----- */
 decline:{nm:'Spiral decline',cat:'link',lv:[1,2],w:0,mx:2,mk(){const c=ugArc(6,-8,6,Math.PI,4*Math.PI,36);return{foot:[[-2,14,-16,0]],both:1,ex:[[12,0,2,1]],shp:[{k:'path',pts:[[0,0],[0,-8]],w:4},{k:'path',pts:c,w:4},{k:'path',pts:[[12,-8],[12,0]],w:4}],fx:[{k:'spiral',cx:6,cz:-8},{k:'icon',x:6,z:-8,t:'↘️'}]}}},
 ladder:{nm:'Ladderway',cat:'link',lv:[1,2],w:0,mx:3,mk(){return{foot:[[-2,2,-8,0]],both:1,ex:[[0,-8,0,1]],shp:[{k:'path',pts:[[0,0],[0,-8]],w:4}],fx:[{k:'hatch',x:0,z:-4},{k:'icon',x:0,z:-4,t:'🪜'}]}}},
 old:{nm:'Old shaft (1 in 100)',cat:'end',lv:[3],w:0,mx:1,mk(){return{foot:[],ex:[],shp:[],fx:[{k:'portal',x:0,z:0},{k:'icon',x:0,z:-2.2,t:'🚪'}]}}}
};
/* ---- VARIANTS: the main rooms come in several versions, so mines don't repeat. Each variant keeps its room's size and
   exits and changes what's inside (and how it plays). fx(d,R) rewrites the features; the first is the room as above.
   A mine uses a different variant each time the same room comes up, while there are unused ones. ---- */
const UGV={
 /* ---------- the shaft stations (one per level; the cage in the middle, an exit on every side) ---------- */
 station1:[
  {nm:'Pit bottom',ds:'The cage stops here. Minecart bay, tool board, shift clock, the level map board, a bench.',fx:()=>[{k:'blk',pts:[[-6.4,-6.4],[6.4,-6.4]],r:.6,n:'bench'},{k:'blk',pts:[[6.4,6.4]],r:.6,n:'tool board'}]},
  {nm:'Timbered station',ds:'Heavy square timbers, an old ore chute from the stopes above, a tally board with the miners\' brass tags.',fx:()=>[{k:'cribs',pts:[[-6.2,-6.2],[6.2,-6.2],[6.2,6.2]]},{k:'blk',pts:[[-6.4,6.4]],r:.5,n:'chute'}]},
  {nm:'Brick station',ds:'A brick-lined hall with an arched roof, a tally office window and a big painted LEVEL 1.',fx:()=>[{k:'blk',pts:[[-6.3,-6.3]],r:.7,n:'tally office'},{k:'blk',pts:[[6.4,-6.4],[6.4,6.4]],r:.5,n:'lamp post'}]}],
 station2:[
  {nm:'Cave station',ds:'Rough rock round a timber platform at the cage, the level map board, a lamp on a wire.',fx:()=>[{k:'blk',pts:[[-4.6,-4.6]],r:.5,n:'map board'}]},
  {nm:'Pumping station',ds:'Big pumps and pipes climbing the shaft wall, thumping away; puddles everywhere.',fx:()=>[{k:'blk',pts:[[4.4,-4.4],[4.4,4.4]],r:.7,n:'pump'},{k:'water',cx:-3.6,cz:3.6,rx:1.6,rz:1.4}]},
  {nm:'Refuge station',ds:'A steel door into a refuge chamber with air bottles: gas can\'t follow you in here.',fx:()=>[{k:'blk',pts:[[-4.5,-4.8]],r:1.4,n:'refuge chamber'},{k:'blk',pts:[[-4.6,4.6]],r:.5,n:'air bottles'},{k:'door',x:-4.5,z:-3.6}]}],
 station3:[
  {nm:'Deep station',ds:'Dark rock, a heavy steel cage gate, a water barrel and a warning board: HOT GROUND.',fx:()=>[{k:'blk',pts:[[4.6,-4.6]],r:.5,n:'barrel'}]},
  {nm:'Hot station',ds:'Big fans push cool air down the shaft; an ice-water barrel and a thermometer in the red.',fx:()=>[{k:'blk',pts:[[-4.6,-4.6],[4.6,-4.6]],r:.6,n:'fan'}]},
  {nm:'Sealed station',ds:'Steel bulkheads at every exit, opened with a big wheel (E). Someone sealed this level once.',fx:()=>[{k:'blk',pts:[[4.6,4.6]],r:.5,n:'valve box'}]}],
 /* ---------- level 1 ---------- */
 stope:[
  {nm:'Cribbed stope',ds:'Timber cribs hold up the roof over rough rock benches. Lots of veins, often a big seam.'},
  {nm:'Shrinkage stope',ds:'A tall stope half full of broken ore. Climb the timber ladder to a high ledge with rich veins.',fx:()=>[{k:'muck',cx:4.2,cz:-10,rx:2.6,rz:5.6},{k:'ledge',x0:-6.8,x1:-3.6,z0:-16,z1:-4},{k:'ladder2',x:-3.2,z:-10},{k:'icon',x:-5.2,z:-10,t:'🪜'}]},
  {nm:'Glory hole',ds:'A raise up to the quarry floor lets a shaft of daylight in. Dust in the light, veins round the walls.',fx:()=>[{k:'sun',cx:0,cz:-10,r:3.2},{k:'cribs',pts:[[-4.5,-5],[4.5,-5],[-4.5,-15],[4.5,-15]]},{k:'icon',x:0,z:-10,t:'☀️'}]},
  {nm:'Flooded stope',ds:'Still, deep water over the bottom. Walk the edge or the plank walkway; veins above the waterline.',fx:()=>[{k:'water',cx:1.6,cz:-9.6,rx:5,rz:6,deep:1},{k:'walk',pts:[[-5.6,-2.4],[-5.6,-17.4]]},{k:'icon',x:1.6,z:-9.6,t:'💧'}]},
  {nm:'Catwalk stope',ds:'A deep open stope you cross on a timber catwalk. Veins on the walls beside it; don\'t look down.',fx:()=>[{k:'pit',cx:0,cz:-10,rx:5,rz:5},{k:'walk',pts:[[0,-3.6],[0,-16.4]]},{k:'icon',x:3,z:-10,t:'🕳️'}]},
  {nm:'Cut-and-fill stope',ds:'A floor of packed sand fill, an ore chute up one wall and a scraper winch with its cable across the room.',fx:()=>[{k:'blk',pts:[[-5.8,-10]],r:.6,n:'chute'},{k:'blk',pts:[[5.4,-14]],r:.8,n:'winch'},{k:'icon',x:0,z:-9,t:'⛏️'}]}],
 crib:[
  {nm:'Crib room',ds:'The miners\' break room: benches, a table with lunch tins, a stove. A lunchbox to find.'},
  {nm:'Lamp room',ds:'Racks of old cap lamps on chargers and a board of brass tags. One tag has a name you\'ll know.',fx:()=>[{k:'racks',pts:[[-3,-4],[-3,-6],[-3,-8],[3,-4],[3,-6]]},{k:'icon',x:0,z:-6,t:'🔦'}]},
  {nm:'Foreman\'s office',ds:'A desk, a safe, maps on the walls and the foreman\'s logbook (lore). The safe holds a shift bonus.',fx:()=>[{k:'desk',x:1.4,z:-7.6},{k:'blk',pts:[[-3,-9]],r:.5,n:'safe'},{k:'icon',x:-2,z:-5,t:'🗄️'}]},
  {nm:'First-aid station',ds:'A stretcher, a cabinet and a first-aid kit you can carry: your next fall, gas or burn costs you nothing.',fx:()=>[{k:'blk',pts:[[2.5,-6]],r:1,n:'stretcher'},{k:'blk',pts:[[-3,-8.6]],r:.5,n:'cabinet'},{k:'icon',x:0,z:-6,t:'⛑️'}]}],
 magazine:[
  {nm:'Powder magazine',ds:'Behind a heavy door: crates of dynamite. Take up to 3 sticks.'},
  {nm:'Blasting store',ds:'A plunger box and reels of wire: dynamite set from here goes off when you push the plunger, no fuse wait.',fx:()=>[{k:'door',x:0,z:-3},{k:'blk',pts:[[-1.9,-7.6]],r:.55,n:'crate',c:'#8a2a1a'},{k:'blk',pts:[[1.9,-7.4]],r:.5,n:'plunger'},{k:'icon',x:0,z:-6,t:'🧨'}]},
  {nm:'Flooded magazine',ds:'Ankle-deep water and crates gone soft. One stick is still dry, up on the top shelf.',fx:()=>[{k:'door',x:0,z:-3},{k:'water',cx:0,cz:-6,rx:2.6,rz:2.8},{k:'blk',pts:[[-1.9,-7.6]],r:.55,n:'crate',c:'#8a2a1a'},{k:'icon',x:.6,z:-6,t:'🧨'}]}],
 collapsed:[
  {nm:'Collapsed drift',ds:'Broken timbers and a rubble heap to squeeze past on one side.'},
  {nm:'Buried cart',ds:'A cave-in half buried a loaded minecart: dig it out (6 swings) for a pile of ore.',fx:()=>[{k:'sets',pts:[[0,0],[0,-12]],broken:1},{k:'rubble',x:-.6,z:-5},{k:'blk',pts:[[.9,-8.4]],r:.8,n:'cart'},{k:'icon',x:.9,z:-8.4,t:'🛒'}]},
  {nm:'Propped drift',ds:'A forest of emergency props holding up a cracked roof. Dust trickles when you pass.',fx:()=>[{k:'blk',pts:[[-1.2,-3],[1.2,-3],[-1.2,-6],[1.2,-6],[0,-7.5],[-1.2,-9],[1.2,-9]],r:.2,n:'prop',c:'#8a5a2e'}]}],
 pump:[
  {nm:'Pump room',ds:'An old pump over a deep, flooded sump.'},
  {nm:'Winder room',ds:'The big drum and brake of an old winze hoist, cables running into a fenced hole in the floor.',fx:()=>[{k:'drum',x:-1.4,z:-5},{k:'pit',cx:2.8,cz:-5,rx:1.4,rz:1.4},{k:'icon',x:-1.4,z:-5,t:'⚙️'}]},
  {nm:'Mine workshop',ds:'A forge, an anvil, a drill press, broken carts waiting for repair.',fx:()=>[{k:'desk',x:-3,z:-3.2},{k:'desk',x:3,z:-7},{k:'blk',pts:[[-2.6,-7.4]],r:.4,n:'anvil'},{k:'blk',pts:[[-4.1,-9.1]],r:.6,n:'forge'},{k:'icon',x:0,z:-5,t:'🔨'}]},
  {nm:'Compressor room',ds:'A big air compressor thumping away, pipes off along the drives. Switch it off (E) and listen to the mine.',fx:()=>[{k:'blk',pts:[[-2.8,-5]],r:1.2,n:'compressor'},{k:'blk',pts:[[3,-3.4]],r:.7,n:'air tank'},{k:'icon',x:-2.8,z:-5,t:'💨'}]}],
 round:[
  {nm:'Pillar round',ds:'A drive all the way round an ore pillar: veins on every face, and two ways past.'},
  {nm:'Rail loop',ds:'The rails run round the pillar; an old ore train is parked on one side.',fx:()=>[{k:'pillar',x0:-6,x1:6,z0:-22,z1:-6},{k:'sets',pts:[[0,-4],[8,-4],[8,-24],[-8,-24],[-8,-4],[0,-4]]},{k:'rail',pts:[[0,0],[0,-4],[8,-4],[8,-24],[-8,-24],[-8,-4],[0,-4]]},{k:'blk',pts:[[-9,-10],[-9,-12],[-9,-14],[-9,-16]],r:.5,n:'cart'}]},
  {nm:'Ore bins',ds:'Timber ore bins stand against the far side of the pillar, full of sorted ore to bag.',fx:()=>[{k:'pillar',x0:-6,x1:6,z0:-22,z1:-6},{k:'sets',pts:[[0,-4],[8,-4],[8,-24],[-8,-24],[-8,-4],[0,-4]]},{k:'blk',pts:[[-4,-23],[4,-23]],r:.5,n:'ore bin'},{k:'icon',x:0,z:-14,t:'⛏️'}]}],
 /* ---------- levels 2 and 3 ---------- */
 fork:[
  {nm:'Cave fork',ds:'The cave splits.'},
  {nm:'Boulder fork',ds:'A huge boulder that fell from the roof sits where the cave splits.',fx:()=>[{k:'blk',pts:[[0,-5.6]],r:1.1,n:'boulder',c:'#6a625a'}]},
  {nm:'Dripstone fork',ds:'Two columns and a dripping roof where the cave splits.',fx:()=>[{k:'cols',pts:[[-2.2,-4.2]],r:.5},{k:'cols',pts:[[2.4,-6.8]],r:.4}]}],
 island:[
  {nm:'Rock island',ds:'The cave splits round a rock island and joins again: two ways past.'},
  {nm:'Crystal island',ds:'The island is one great crystal pillar, lit from inside.',fx:()=>[{k:'isle',cx:0,cz:-12,rx:5.2,rz:5.2},{k:'ringspots',cx:0,cz:-12,rx:4.4,rz:4.4,n:16,c:'#9ff0ff'}]},
  {nm:'Mushroom island',ds:'Giant mushrooms grow on the island, their caps reaching over the passage.',fx:()=>[{k:'isle',cx:0,cz:-12,rx:5.2,rz:5.2},{k:'ringspots',cx:0,cz:-12,rx:3.6,rz:3.6,n:7,c:'#e58ae0'}]},
  {nm:'Flooded round',ds:'Ankle-deep water all the way round the island, and drips that ring like bells.',fx:()=>[{k:'water',cx:0,cz:-12,rx:9.4,rz:9.4},{k:'isle',cx:0,cz:-12,rx:5.2,rz:5.2}]}],
 crystal:[
  {nm:'Crystal grotto',ds:'Glowing crystal clusters, silver and crystal veins.'},
  {nm:'Crystal pool',ds:'A still, glowing pool ringed with crystals. The rarest crystals grow under the water\'s edge (wade in).',fx:()=>[{k:'water',cx:0,cz:-10,rx:4,rz:5,c:'#38c8f0'},{k:'ringspots',cx:0,cz:-10,rx:5.2,rz:6.2,n:20,c:'#9ff0ff'},{k:'icon',x:0,z:-10,t:'💎'}]},
  {nm:'Selenite beams',ds:'Giant crystal beams cross a tall cave at all angles high over your head, their ends sunk deep in the rock.',fx:()=>[{k:'beams',ls:[[[-6,-5],[5.4,-14]],[[-5.4,-15.4],[6,-7]],[[-2.4,-3.4],[2.4,-16.6]]]},{k:'icon',x:-4,z:-10,t:'💎'}]},
  {nm:'Frost grotto',ds:'Pale blue crystals furred with frost and a cold mist at knee height. Your breath shows.',fx:()=>[{k:'spots',n:14,c:'#d8f4ff',rx:5.6,rz:7,cz:-10},{k:'mist',cx:0,cz:-10,rx:6,rz:7.6},{k:'icon',x:0,z:-10,t:'❄️'}]},
  {nm:'Crystal columns',ds:'Huge six-sided crystal columns from floor to roof, a maze of light.',fx:()=>[{k:'cols',pts:[[-3.5,-6],[3.2,-7.5],[-1,-11],[4,-13],[-4,-14.5]],r:.9,c:'#7fe4ff'}]}],
 fungus:[
  {nm:'Fungus grotto',ds:'Giant mushrooms, moss, vines and glowworms.'},
  {nm:'Puffball hollow',ds:'Puffballs as big as cars. Hit one and it bursts in a cloud of glowing spores (harmless, slow to clear).',fx:()=>[{k:'puff',pts:[[-5,-6],[4.5,-5],[-3,-14],[5,-14.5],[0,-10]]},{k:'icon',x:-5,z:-10,t:'🍄'}]},
  {nm:'Glow pond',ds:'A deep pond lit from below, lily pads, mushrooms round the edge, frogs that go quiet when you come close.',fx:()=>[{k:'water',cx:1.5,cz:-11,rx:5.4,rz:4.6,c:'#2fb8a0',deep:1},{k:'spots',n:9,c:'#5fbf6a',rx:4,rz:3,cz:-11,r:.7,dx:1.5},{k:'ringspots',cx:1.5,cz:-11,rx:6.6,rz:5.8,n:14,c:'#e58ae0'},{k:'icon',x:1.5,z:-11,t:'🐸'}]},
  {nm:'Shelf-fungus wall',ds:'Giant shelf fungi grow up one wall like steps: climb them to a high ledge with gold.',fx:()=>[{k:'ledge',x0:5.4,x1:8,z0:-12.6,z1:-7.4},{k:'spots',n:6,c:'#d8a060',rx:1,rz:2.4,cz:-10,dx:4.4,r:.6},{k:'spots',n:16,c:'#e58ae0',rx:6,rz:7,cz:-10,dx:-1.5,r:.8},{k:'icon',x:6.6,z:-10,t:'🍄'}]},
  {nm:'Root hall',ds:'Thick pale roots hang from the roof to the floor, glowing at the tips. Something far above is very thirsty.',fx:()=>[{k:'cols',pts:[[-4,-5],[3.6,-6.4],[-1.4,-11],[5,-12.6],[-5.4,-13],[1.2,-15.6]],r:.45,c:'#c8b08a'},{k:'icon',x:0,z:-8,t:'🌱'}]}],
 flooded:[
  {nm:'Flooded gallery',ds:'Knee-deep water you wade through, a plank walkway along one side.'},
  {nm:'Underground lake',ds:'Too deep to wade. Pull the rope raft across (hold E); it takes up to four.',fx:()=>[{k:'water',cx:0,cz:-12,rx:4.6,rz:9.4,c:'#2f6f98',deep:1},{k:'rope',pts:[[0,-1.6],[0,-22.4]]},{k:'raft',x:0,z:-5},{k:'icon',x:2.4,z:-14,t:'🛶'}]},
  {nm:'Drowned drift',ds:'An old timbered drive the water took: rails under the surface, a sunken minecart, waist-deep in the middle.',fx:()=>[{k:'water',cx:0,cz:-12,rx:4.4,rz:10.6},{k:'sets',pts:[[0,-1],[0,-23]]},{k:'rail',pts:[[0,-1],[0,-23]]},{k:'icon',x:1.6,z:-13,t:'🛒'}]},
  {nm:'Waterfall gallery',ds:'A waterfall pours out of a crack in the wall into a deep plunge pool. Spray, a roar, the path past it.',fx:()=>[{k:'falls',x:-4.6,z:-12,w:3,c:'#9fd8f0'},{k:'water',cx:-2.2,cz:-12,rx:2.4,rz:3,c:'#3f88b8',deep:1},{k:'water',cx:.8,cz:-12,rx:3.4,rz:9}]}],
 chasm:[
  {nm:'Chasm hall',ds:'A rope bridge over a fissure, or jump the stones.'},
  {nm:'Broken bridge',ds:'The bridge has fallen. Edge round the end of the fissure on a narrow ledge, or make a long jump.',fx:()=>[{k:'chasm',pts:[[-5.4,-9.4],[-2,-10.5],[3,-9.4],[7,-10.6]],w:3},{k:'bridge',x0:0,z0:-7.6,x1:0,z1:-8.8},{k:'bridge',x0:0,z0:-11.2,x1:0,z1:-12.4},{k:'ledge2',pts:[[-4.6,-6.4],[-6.2,-9.6],[-4.8,-13]]}]},
  {nm:'Trestle crossing',ds:'A wide fissure crossed by the miners\' old timber trestle, rails and all. It creaks.',fx:()=>[{k:'chasm',pts:[[-7,-9.6],[-2,-10.6],[3,-9.2],[7,-10.4]],w:5},{k:'trestle',x0:0,z0:-6.4,x1:0,z1:-13.6}]},
  {nm:'Zip line',ds:'A rusty miners\' zip line: grab the handle (E) and slide over. Coming back, take the ledge round the end.',fx:()=>[{k:'chasm',pts:[[-5.2,-9.6],[-2,-10.4],[3,-9.4],[7,-10.4]],w:4},{k:'zip',pts:[[1.6,-6.6],[1.6,-13.6]]},{k:'ledge2',pts:[[-4.4,-6.6],[-6,-10],[-4.4,-13.6]]},{k:'icon',x:1.6,z:-10,t:'🪝'}]}],
 hall:[
  {nm:'Stalactite hall',ds:'Columns, flowstone and stalactites, a path between them.'},
  {nm:'Rimstone terraces',ds:'Stepped pools of still water down the cave, each one rimmed with stone. Walk the rims.',fx:()=>[{k:'terraces',cx:0,cz:-10,n:4,rx:8,rz:8}]},
  {nm:'Cathedral',ds:'A huge, tall dome round one giant column. Your lamp doesn\'t reach the roof.',fx:()=>[{k:'cols',pts:[[0,-10]],r:3.2},{k:'cols',pts:[[-6,-5],[6.5,-14],[-6.4,-15],[6,-5.5]],r:.6},{k:'icon',x:-5,z:-10,t:'⛪'}]},
  {nm:'Fossil wall',ds:'A giant fossil skeleton in the cave wall, half dug out long ago. Fossils to take (the assay office buys them).',fx:()=>[{k:'fossil',pts:[[-8.4,-5.4],[-8.9,-8],[-8.9,-11],[-8.4,-14]]},{k:'blk',pts:[[-6,-13.4]],r:.5,n:'tool pile'},{k:'goal',x:-7.4,z:-9.4,n:'the fossil wall'},{k:'icon',x:-6.6,z:-9.6,t:'🦴'}]},
  {nm:'Echo chamber',ds:'A tall, round, empty cave where every sound comes back three times. Someone left a bell on a post: ring it (E).',fx:()=>[{k:'blk',pts:[[0,-10]],r:.3,n:'bell post'},{k:'icon',x:0,z:-11.4,t:'🔔'}]}],
 stream:[
  {nm:'Stream crossing',ds:'A stream crosses the passage: stepping stones.'},
  {nm:'Plank footbridge',ds:'A fast, deep stream across the passage and a plank footbridge with a rope rail.',fx:()=>[{k:'stream',pts:[[-3,-5],[3,-7]],w:1.6,deep:1},{k:'bridge',x0:.6,z0:-4.4,x1:1,z1:-7.6}]},
  {nm:'Stream tunnel',ds:'For a stretch the passage IS the stream: wade with the current, ankle-deep.',fx:()=>[{k:'water',cx:.4,cz:-6,rx:1.8,rz:5.2}]}],
 orepass:[
  {nm:'Ore pass',ds:'A grate over a chute: ore dropped in lands in the cage\'s minecart, no walk back.'},
  {nm:'Grizzly',ds:'A steel grizzly (a grid of bars) over the chute and a sledgehammer for big lumps. Same quick trip to the cart.',fx:()=>[{k:'grate',x:0,z:-5.4},{k:'blk',pts:[[2.2,-7.2]],r:.4,n:'hammer rack'},{k:'icon',x:0,z:-5.4,t:'⬇️'}]},
  {nm:'Skip loader',ds:'A little skip on rails at the chute\'s lip: fill it, push it over (E), and the ore goes to the cart.',fx:()=>[{k:'grate',x:0,z:-6.4},{k:'blk',pts:[[-1.6,-4.4]],r:.6,n:'skip'},{k:'rail',pts:[[-1.6,-2.4],[-1.6,-6.4]]},{k:'icon',x:0,z:-6.4,t:'⬇️'}]}],
 magma:[
  {nm:'Magma chamber',ds:'A lava river with a stone bridge, geysers, a lava lake with stepping stones to a diamond island.'},
  {nm:'Lavafall',ds:'Lava pours down one wall into a glowing pool. A basalt shelf runs round it to gold in the hot wall.',fx:()=>[{k:'falls',x:-11,z:-12,w:6},{k:'lake',cx:-7,cz:-12,rx:3.4,rz:4.6,noisle:1},{k:'walk',pts:[[-3.4,-17.2],[-7,-17.6],[-9.6,-15]]},{k:'goal',x:-9.6,z:-15,n:'the gold in the hot wall'},{k:'gey',x:4,z:-6},{k:'gey',x:5,z:-17},{k:'cols',pts:[[6.4,-19],[8.4,-17.2]],r:.7,c:'#2a2422'},{k:'icon',x:-7,z:-12,t:'🌋'}]},
  {nm:'Crust field',ds:'A floor of cooled crust over live lava. Dark patches are safe; glowing ones burn (you\'re pushed off and drop 2 ore).',fx:()=>[{k:'crust',cx:0,cz:-12,rx:9.6,rz:9.6},{k:'icon',x:0,z:-12,t:'🔥'}]},
  {nm:'Obsidian moat',ds:'A ring of lava round an island of black glass. One stone bridge; diamond and gold on the island.',fx:()=>[{k:'moat',cx:0,cz:-12,r:6.4,w:1.8},{k:'isle2',cx:0,cz:-12,r:5.4},{k:'bridge',x0:0,z0:-4.2,x1:0,z1:-7.4},{k:'icon',x:0,z:-12,t:'💠'}]},
  {nm:'Lava channel',ds:'A channel of lava sweeps round one side of the chamber; a stone bridge over it to the side passage, heat shimmer everywhere.',fx:()=>[{k:'lava',pts:[[6,-2.5],[9.4,-8],[9.6,-16],[6,-21.5]],w:1.4},{k:'bridge',x0:8.2,z0:-12,x1:11.2,z1:-12},{k:'gey',x:-5,z:-8},{k:'cols',pts:[[-6,-16],[-3.8,-18.4]],r:.7,c:'#2a2422'},{k:'icon',x:9.6,z:-12,t:'🌋'}]}],
 dark:[
  {nm:'Dark cave',ds:'Pitch black without the LED headlamp. A chasm and glowworms.'},
  {nm:'Sinkhole',ds:'A round, bottomless shaft in the middle of the cave. The path goes round the rim; the best veins are on the far side.',fx:()=>[{k:'pit',cx:0,cz:-9,rx:4.4,rz:4.4},{k:'glow',n:14,rx:8,rz:8,cz:-9},{k:'goal',x:0,z:-15.4,n:'the far side'},{k:'icon',x:-6.4,z:-9,t:'🔦'}]},
  {nm:'Glowworm grotto',ds:'Still black water and a roof full of glowworms. A narrow path round the edge; turn your lamp off to see it.',fx:()=>[{k:'water',cx:.6,cz:-9,rx:6.2,rz:6.4,c:'#16303c',deep:1},{k:'glow',n:46,rx:8,rz:8,cz:-9},{k:'icon',x:-6.8,z:-9,t:'✨'}]},
  {nm:'The maze',ds:'A forest of rock pillars. Easy to lose your way: the signposts don\'t reach in here.',fx:()=>{const p=[];for(let i=-2;i<=2;i++)for(let j=0;j<4;j++){const x=i*2.8+(j%2?1.4:0),z=-4.2-j*3.2;if((i+j)%2==0&&Math.hypot(x/6.6,(z+9)/6.6)<1&&Math.hypot(x,z)>3.4&&Math.hypot(x,z+18)>3.4)p.push([x,z])}return[{k:'cols',pts:p,r:.9,c:'#4a4440'},{k:'icon',x:-6.4,z:-9,t:'🔦'}]}},
  {nm:'Bat roost',ds:'Thousands of bats under a high roof. Shine your lamp up and they pour out past you; slippery guano underfoot.',fx:()=>[{k:'spots',n:30,c:'#3a3036',rx:7,rz:7,cz:-9,r:.4},{k:'icon',x:0,z:-9,t:'🦇'}]}],
 geode:[
  {nm:'Amethyst geode',ds:'A round room lined with giant purple crystals. Gems.'},
  {nm:'Celestine geode',ds:'Pale blue crystals and a hum you feel more than hear. Gems.',fx:()=>[{k:'ring',cx:0,cz:-9,r:5.2,c:'#4f8ad0',c2:'#bcd8ff'},{k:'icon',x:0,z:-9,t:'💙'}]},
  {nm:'Citrine geode',ds:'Golden crystals, and gold in the rock between them. Gems.',fx:()=>[{k:'ring',cx:0,cz:-9,r:5.2,c:'#c89020',c2:'#ffe08a'},{k:'icon',x:0,z:-9,t:'💛'}]},
  {nm:'Smoky quartz geode',ds:'Dark, smoky crystals that drink your lamplight, with a few clear ones that blaze. Gems.',fx:()=>[{k:'ring',cx:0,cz:-9,r:5.2,c:'#4a4440',c2:'#d8d0c8'},{k:'icon',x:0,z:-9,t:'🖤'}]}],
 hotseam:[
  {nm:'Hot seam',ds:'Glowing green rock, uranium, Geiger clicks.'},
  {nm:'Green spring',ds:'A steaming pool tinted green by the rock round it. Uranium in the walls, and the clicks get fast.',fx:()=>[{k:'water',cx:0,cz:-6,rx:1.8,rz:1.8,c:'#6ad04a',deep:1},{k:'icon',x:0,z:-6,t:'☢️'}]},
  {nm:'Core shed',ds:'Boxes of glowing drill cores stacked by the walls and an old core drill. Some cores are worth taking.',fx:()=>[{k:'blk',pts:[[-1.6,-6.8],[1.6,-5.2]],r:.5,n:'core box',c:'#5a7a3a'},{k:'icon',x:0,z:-6,t:'☢️'}]}],
 basalt:[
  {nm:'Basalt gallery',ds:'Black basalt columns and glowing cracks.'},
  {nm:'Steam vents',ds:'Vents in the floor hiss and puff steam that hides the way for a few seconds at a time.',fx:d=>[{k:'cracks',pts:d.shp[0].pts},{k:'spots',n:6,c:'#e8e8e8',rx:1.4,rz:6,cz:-8,r:.35},{k:'icon',x:0,z:-8,t:'♨️'}]},
  {nm:'Obsidian tube',ds:'Glassy black walls that throw your lamplight back at you, and sharp edges underfoot.',fx:d=>[{k:'spots',n:10,c:'#6a5a7a',rx:1.6,rz:7,cz:-8,r:.3},{k:'icon',x:0,z:-8,t:'🖤'}]}]
};
function ugVariant(type,d,R,usedV){
 const L=UGV[type];if(!L)return d;const u=usedV[type]||(usedV[type]=[]);
 let free=L.map((_,i)=>i).filter(i=>!u.includes(i));if(!free.length)free=L.map((_,i)=>i);
 const i=free[R()*free.length|0],v=L[i];d.v=i;d.vn=v.nm;d.vd=v.ds;if(v.fx)d.fx=v.fx(d,R);return d;
}
/* the shaft stations (the root of each level, centred on the shaft) */
function ugStation(n,R){
 const h=n==1?8:6,all=[[0,-h,0],[h,0,1],[0,h,2],[-h,0,3]];
 const ex=all;
 const d={foot:[[-h,h,-h,h]],ex,shp:[{k:'rect',x0:-h,x1:h,z0:-h,z1:h}],fx:[{k:'shaft'},{k:'icon',x:n==1?-4.4:-2.8,z:n==1?4.4:2.8,t:'🛗'}]};
 const V=UGV['station'+n],v=V[R()*V.length|0];d.v=V.indexOf(v);d.vn=v.nm;d.vd=v.ds;d.fx=d.fx.concat(v.fx(d));return d;
}
/* mirror a piece left to right (rooms and junctions, so two of a kind don't look the same) */
function ugMirror(d){const mx=v=>-v;d.mir=1;
 d.foot=d.foot.map(f=>[-f[1],-f[0],f[2],f[3]]);d.ex=d.ex.map(e=>[-e[0],e[1],e[2]==1?3:e[2]==3?1:e[2],e[3]]);
 const m=o=>{const c=Object.assign({},o);if(c.pts)c.pts=c.pts.map(q=>[-q[0],q[1]]);for(const k of['x','cx','x0','x1','dx'])if(typeof c[k]=='number')c[k]=-c[k];if(c.ls)c.ls=c.ls.map(l=>l.map(q=>[-q[0],q[1]]));
  if((c.k=='rect'||c.k=='pillar'||c.k=='ledge')&&c.x0>c.x1){const t=c.x0;c.x0=c.x1;c.x1=t}return c};
 d.shp=d.shp.map(m);d.fx=d.fx.map(m);if(d.ring)d.ring={a:[-d.ring.a[0],d.ring.a[1]],b:[-d.ring.b[0],d.ring.b[1]]};return d}
const ugRot=(x,z,r)=>r==0?[x,z]:r==1?[-z,x]:r==2?[-x,-z]:[z,-x];

/* ---- the generator ---- */
function ugGen(seed,opt){
 opt=opt||{};
 for(let tries=0;tries<8;tries++){const m=ugTry((seed>>>0)+tries*7919,opt);if(m.ok){m.seed=seed;m.tries=tries+1;return m}}
 return ugTry(seed,opt);
}
function ugTry(seed,opt){
 const R=ugRng(seed),occ=[new Map(),new Map(),new Map()],P=[],open=[],used={},usedV={},cnt=[0,0,0],rooms=[0,0,0];
 const key=(i,j)=>i*1000+j;
 /* place a piece: def from mk(), at world socket (x,z), turned r quarter turns, on level L. Checks occupancy with a
    2 m gap to everything except its parent. Returns the piece or null. */
 function fits(d,x,z,r,L,par){
  for(const lv of d.both?[L,L+1]:[L]){if(lv>2)return false;
   for(const f of d.foot){const a=ugRot(f[0],f[2],r),b=ugRot(f[1],f[3],r);
    const x0=Math.min(a[0],b[0])+x,x1=Math.max(a[0],b[0])+x,z0=Math.min(a[1],b[1])+z,z1=Math.max(a[1],b[1])+z;
    if(x0<-UGB||x1>UGB||z0<-UGB||z1>UGB)return false;
    for(let i=Math.floor((x0-UGC)/UGC);i<Math.ceil((x1+UGC)/UGC);i++)for(let j=Math.floor((z0-UGC)/UGC);j<Math.ceil((z1+UGC)/UGC);j++){
     const o=occ[lv].get(key(i,j));if(o===undefined)continue;
     const inner=i>=Math.floor(x0/UGC)&&i<Math.ceil(x1/UGC)&&j>=Math.floor(z0/UGC)&&j<Math.ceil(z1/UGC);
     if(o!==par||inner&&o!==par)return false}}}
  return true;
 }
 function mark(d,x,z,r,L,id){for(const lv of d.both?[L,L+1]:[L])for(const f of d.foot){const a=ugRot(f[0],f[2],r),b=ugRot(f[1],f[3],r);
  const x0=Math.min(a[0],b[0])+x,x1=Math.max(a[0],b[0])+x,z0=Math.min(a[1],b[1])+z,z1=Math.max(a[1],b[1])+z;
  for(let i=Math.floor(x0/UGC);i<Math.ceil(x1/UGC);i++)for(let j=Math.floor(z0/UGC);j<Math.ceil(z1/UGC);j++)occ[lv].set(key(i,j),id)}}
 function add(type,d,x,z,r,L,par){
  d.fx=d.fx||[];if(UGP[type]&&UGP[type].cat!='tun'&&UGP[type].cat!='link'&&R()<.5)ugMirror(d);
  const id=P.length,p={id,type,L,x,z,r,d,par};P.push(p);mark(d,x,z,r,L,id);used[type]=(used[type]||0)+1;
  if(type!='station')cnt[L]++;if(UGP[type]&&(UGP[type].cat=='room'||UGP[type].cat=='end'))rooms[L]++;
  for(const e of d.ex){const w=ugRot(e[0],e[1],r);open.push({x:x+w[0],z:z+w[1],dir:(e[2]+r)%4,L:L+(e[3]||0),par:id,cat:UGP[type]?UGP[type].cat:'jn'})}
  return p;
 }
 // stations on every level
 for(let L=0;L<3;L++){const d=ugStation(L+1,R);add('station',d,0,0,0,L,-1);P[P.length-1].st=1}
 const links=[0,0];
 function pick(s){
  const lvn=s.L+1,cands=[],live=open.filter(o=>o.L==s.L&&!o.done).length;let w0=1;
  for(const k in UGP){const t=UGP[k];if(!t.lv.includes(lvn)||!t.w)continue;if(t.mx&&(used[k]||0)>=t.mx)continue;
   if(s.cat!='tun'&&t.cat!='tun'&&!(s.cat=='jn'&&s.L>0&&s.par>2&&t.cat!='jn'))continue; // after a room, link or station a tunnel first (a cave fork may open straight into a room)
   if(t.cat=='end'&&live<=2)continue;                    // never close off the last open ends with a dead-end room
   if(t.cat=='jn'&&live<=2)w0=3;else w0=1;
   let w=t.w*w0;if(t.want&&!used[k]&&cnt[s.L]>UGL[s.L].max*.3)w*=4;
   if(t.cat=='end'&&cnt[s.L]<4)w*=.3;
   if(t.cat=='tun'&&cnt[s.L]>UGL[s.L].max*.6)w*=.4;
   cands.push([k,w])}
  return cands;
 }
 function wpick(c){let s=0;for(const x of c)s+=x[1];let v=R()*s;for(const x of c){v-=x[1];if(v<=0)return x[0]}return c.length?c[c.length-1][0]:null}
 const live=L=>open.filter(o=>o.L==L&&!o.done).length;
 function tryPut(k,s,L,rr){const d=UGP[k].mk(rr||R);if(!d.ex.length&&live(L)<=2)return 0;   // never close off the last open ends
  if(!fits(d,s.x,s.z,s.dir,L,s.par))return 0;ugVariant(k,d,R,usedV);if(d.v!=null)usedV[k].push(d.v);add(k,d,s.x,s.z,s.dir,L,s.par);return 1}
 // one growth step on level L: pick an open end (far ones more often, so the level spreads out) and put a piece on it
 function step(L){
  const here=open.filter(s=>s.L==L&&!s.done);if(!here.length)return false;
  let tw=0;const wt=here.map(o=>{const w=1+Math.hypot(o.x,o.z)/18;tw+=w;return w});let v=R()*tw,s=here[here.length-1];
  for(let k=0;k<here.length;k++){v-=wt[k];if(v<=0){s=here[k];break}}
  // a second, quicker way down now and then: a ladderway off a tunnel end
  if(L<2&&s.cat=='tun'&&(used.ladder||0)<2&&R()<.12&&tryPut('ladder',s,L)){s.done=1;return true}
  if(rooms[L]>=UGL[L].rooms&&cnt[L]>=UGL[L].min||cnt[L]>=UGL[L].max){s.done=1;s.cap=1;return true}
  let put=0;const c=pick(s);
  // still short of rooms: try the rooms first
  if((s.cat=='tun'||s.cat=='jn'&&L>0&&s.par>2)&&rooms[L]<UGL[L].rooms&&R()<.8&&live(L)>2){const rc=c.filter(x=>{const t=UGP[x[0]].cat;return t=='room'||t=='end'});
   for(let t=0;t<4&&rc.length&&!put;t++){const k=wpick(rc);if(tryPut(k,s,L))put=1;else rc.splice(rc.findIndex(x=>x[0]==k),1)}}
  for(let t=0;t<6&&c.length&&!put;t++){const k=wpick(c);if(tryPut(k,s,L)){put=1;break}const i=c.findIndex(x=>x[0]==k);if(i>=0&&t>2)c.splice(i,1)}
  if(!put&&tryPut(L==0?'drive':'cpass',s,L,()=>0))put=1;     // a short tunnel before giving up on this end
  s.done=1;if(!put)s.cap=1;return true;
 }
 // The main way down from each level: a straight main drive from the station, then the spiral decline (or a ladderway),
 // laid out first while the levels are still empty. On the level below, a drive is dug from the station to where it
 // arrives, so every level is joined up. Then every level grows from all its open ends.
 for(let L=0;L<2;L++){
  const sts=open.filter(o=>o.L==L&&o.par===L&&!o.done);let made=false;
  for(let t=0;t<12&&!made;t++){const a=sts[R()*sts.length|0];if(!a)break;
   const Ld=[12,16,20,24,28][R()*5|0],k=R()<.7?'decline':'ladder';
   const dd={foot:[[-2,2,-Ld,0]],ex:[[0,-Ld,0]],shp:[{k:'path',pts:[[0,0],[0,-Ld]],w:4}],fx:[{k:'sets',pts:[[0,0],[0,-Ld]]},{k:'rail',pts:[[0,0],[0,-Ld]]}]};
   if(!fits(dd,a.x,a.z,a.dir,L,a.par))continue;
   const v=ugRot(0,-Ld,a.dir),lx=a.x+v[0],lz=a.z+v[1],ld=UGP[k].mk(R);
   if(!fits(ld,lx,lz,a.dir,L,-9))continue;
   const dp=add('drive',dd,a.x,a.z,a.dir,L,a.par);dp.main=1;a.done=1;
   const lo=open.pop();lo.done=1;add(k,ld,lx,lz,a.dir,L,dp.id);links[L]=k;made=true}
  if(!made)return{ok:false,why:'link L'+L};
 }
 for(let L=1;L<3;L++){
  const arr=open.filter(o=>o.L==L&&!o.done&&o.par!==L&&P[o.par].type==links[L-1]),sts=open.filter(o=>o.L==L&&o.par===L&&!o.done);
  const pairs=[];for(const a of sts)for(const b of arr)pairs.push([Math.hypot(a.x-b.x,a.z-b.z),a,b]);pairs.sort((u,v)=>u[0]-v[0]);
  let joined=false;for(const [D,a,b] of pairs){const path=ugDig(occ[L],a,b,75);if(!path)continue;
   const d={foot:[],ex:[],shp:[{k:'path',pts:path,w:4}],fx:[{k:'sets',pts:path},{k:'rail',pts:path}]};const p={id:P.length,type:'join',L,x:0,z:0,r:0,d,par:a.par,join:b.par,main:1};P.push(p);cnt[L]++;
   for(const c of path.cells)occ[L].set(c,p.id);a.done=b.done=1;joined=true;break}
  if(!joined)return{ok:false,why:'join L'+L};
 }
 for(let L=0;L<3;L++){let g=0;while(g++<400&&step(L));if(cnt[L]<UGL[L].min*.6)return{ok:false,why:'small L'+L+' '+cnt[L]}}
 // the 1-in-100 old shaft to the Desert Mines: its timbered portal is set into a working face on the deep level
 // (the farthest one from the shaft), so it needs no room of its own. The loops below leave that face alone.
 const R2=ugRng(seed^0x5eed);
 if(opt.old||R2()<.01){const f=open.filter(s=>s.L==2&&s.cap).sort((a,b)=>(b.cat=='tun')-(a.cat=='tun')||Math.hypot(b.x,b.z)-Math.hypot(a.x,a.z))[0]||open.filter(s=>s.L==1&&s.cap).sort((a,b)=>Math.hypot(b.x,b.z)-Math.hypot(a.x,a.z))[0];
  if(f){const d=UGP.old.mk(R2);const p={id:P.length,type:'old',L:f.L,x:f.x,z:f.z,r:f.dir,d,par:f.par};P.push(p);f.cap=0;f.used=1;f.old=p.id}}
 // loops: join two dead ends on a level with a dug tunnel found on the grid (A*, straight runs preferred), so there is
 // more than one way round. Up to 2 per level, 12-60 m apart, with 2 m of rock to everything else.
 const loops=[];
 for(let L=0;L<3;L++){let made=0;const caps=open.filter(s=>s.L==L&&s.cap);
  const pairs=[];for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++){const a=caps[i],b=caps[j],D=Math.hypot(a.x-b.x,a.z-b.z);if(D>=10&&D<=70&&a.par!=b.par)pairs.push([D,a,b])}
  pairs.sort((u,v)=>u[0]-v[0]);
  for(const [D,a,b] of pairs){if(made>=2)break;if(a.used||b.used)continue;
   const path=ugDig(occ[L],a,b);if(!path)continue;
   const d={foot:[],ex:[],shp:[{k:'path',pts:path,w:4}],fx:[{k:'sets',pts:path}]};
   const p={id:P.length,type:'join',L,x:0,z:0,r:0,d,par:a.par,join:b.par,len:0};P.push(p);
   for(let k=1;k<path.length;k++)p.len+=Math.hypot(path[k][0]-path[k-1][0],path[k][1]-path[k-1][1]);
   for(const c of path.cells)occ[L].set(c,p.id);a.used=b.used=1;a.cap=b.cap=0;loops.push(p.id);made++}}
 // the rockfall: once per mine, mid-shift, on one side of a pillar round / rock island (there is always a way round);
 // with none, on a dug loop; failing that, on any tunnel (then you dig through it)
 const rings=P.filter(p=>p.d.ring),lp=P.filter(p=>loops.includes(p.id)),tun=P.filter(p=>UGP[p.type]&&UGP[p.type].cat=='tun');
 let fall=null;const ft=90+R()*110|0;
 if(rings.length){const p=rings[R()*rings.length|0],q=R()<.5?p.d.ring.a:p.d.ring.b,w=ugRot(q[0],q[1],p.r);fall={id:p.id,x:p.x+w[0],z:p.z+w[1],t:ft,round:1}}
 else{const pool=lp.length?lp:tun;if(pool.length){const p=pool[R()*pool.length|0],sh=ugWorld(p).shp[0],q=sh.pts[Math.floor(sh.pts.length/2)],q2=sh.pts.length==2?[(sh.pts[0][0]+sh.pts[1][0])/2,(sh.pts[0][1]+sh.pts[1][1])/2]:q;fall={id:p.id,x:q2[0],z:q2[1],t:ft}}}
 return{ok:true,P,open,loops,fall,links,count:cnt.slice(),rooms:rooms.slice()};
}
/* dig a joining tunnel between two open ends (A* on a 2 m lattice whose points sit on even metres, like the sockets).
   A lattice point is free when the 6 m square round it (a 4 m tunnel plus 1 m of rock each side) holds nothing,
   except, close to either end, the piece that end belongs to. Straight runs are preferred. Returns the polyline
   (corners only, from socket to socket) with .cells = the occupancy cells it uses, or null. */
function ugDig(occ,a,b,maxc){
 const K=(i,j)=>i*1000+j,lim=UGB/UGC;
 const va=ugRot(0,-1,a.dir),vb=ugRot(0,-1,b.dir);
 const si=Math.round(a.x/UGC+va[0]),sj=Math.round(a.z/UGC+va[1]),gi=Math.round(b.x/UGC+vb[0]),gj=Math.round(b.z/UGC+vb[1]);
 const free=(i,j)=>{if(Math.abs(i)>lim-2||Math.abs(j)>lim-2)return false;
  const na=Math.abs(i-si)+Math.abs(j-sj)<=2,nb=Math.abs(i-gi)+Math.abs(j-gj)<=2;
  for(let ci=i-2;ci<=i+1;ci++)for(let cj=j-2;cj<=j+1;cj++){const o=occ.get(K(ci,cj));if(o===undefined)continue;
   if(na&&o===a.par||nb&&o===b.par)continue;return false}
  return true};
 if(!free(si,sj)||!free(gi,gj))return null;
 const D=[[1,0],[0,1],[-1,0],[0,-1]],open=[[0,si,sj,-1]],g=new Map([[K(si,sj)+'_-1',0]]),from=new Map();
 const h=(i,j)=>Math.abs(i-gi)+Math.abs(j-gj);let n=0,end=null;
 while(open.length&&n++<20000){let bi=0;for(let q=1;q<open.length;q++)if(open[q][0]<open[bi][0])bi=q;const [f,i,j,dd]=open.splice(bi,1)[0];
  const gk=K(i,j)+'_'+dd,gc=g.get(gk);
  if(i==gi&&j==gj){end=gk;break}
  if(gc>(maxc||44))continue;   // at most ~88 m of new tunnel (150 m for a main drive)
  for(let d=0;d<4;d++){const ni=i+D[d][0],nj=j+D[d][1];if(!free(ni,nj))continue;const nk=K(ni,nj)+'_'+d,ng=gc+1+(dd>=0&&dd!=d?1.5:0);
   if(g.has(nk)&&g.get(nk)<=ng)continue;g.set(nk,ng);from.set(nk,gk);open.push([ng+h(ni,nj),ni,nj,d])}}
 if(!end)return null;
 const lat=[];let k=end;while(k){lat.push(+k.split('_')[0]);k=from.get(k)}lat.reverse();
 const ctr=c=>{const i=Math.round(c/1000),j=c-i*1000;return[i*UGC,j*UGC]};
 const raw=[[a.x,a.z]].concat(lat.map(ctr),[[b.x,b.z]]),pts=[raw[0]];
 for(let q=1;q<raw.length-1;q++){const p0=raw[q-1],p1=raw[q],p2=raw[q+1];
  const t1=[Math.sign(p1[0]-p0[0]),Math.sign(p1[1]-p0[1])],t2=[Math.sign(p2[0]-p1[0]),Math.sign(p2[1]-p1[1])];
  if(t1[0]!=t2[0]||t1[1]!=t2[1])pts.push(p1)}
 pts.push(raw[raw.length-1]);
 const cells=[];for(const c of lat){const i=Math.round(c/1000),j=c-i*1000;for(let ci=i-1;ci<=i;ci++)for(let cj=j-1;cj<=j;cj++)cells.push(K(ci,cj))}
 pts.cells=cells;return pts;
}
/* piece shapes in world space (for drawing, the minimap and the station map board) */
function ugWorld(p){
 const T=(x,z)=>{const w=ugRot(x,z,p.r);return[p.x+w[0],p.z+w[1]]};
 const shp=p.d.shp.map(s=>s.k=='path'?Object.assign({},s,{pts:s.pts.map(q=>T(q[0],q[1]))}):s.k=='blob'||s.k=='ring'?Object.assign({},s,(()=>{const c=T(s.cx,s.cz),sw=p.r%2==1;return{cx:c[0],cz:c[1],rx:sw?s.rz:s.rx,rz:sw?s.rx:s.rz}})()):s.k=='rect'?Object.assign({},s,(()=>{const a=T(s.x0,s.z0),b=T(s.x1,s.z1);return{x0:Math.min(a[0],b[0]),x1:Math.max(a[0],b[0]),z0:Math.min(a[1],b[1]),z1:Math.max(a[1],b[1])}})()):s);
 return{shp,T};
}
if(typeof module!='undefined'&&typeof window=='undefined')module.exports={UGL,UGP,UGV,UGB,ugGen,ugWorld,ugRot,ugRng,ugStation};

/* ---------------- docs/design/models/quarry-under-kit.js ---------------- */
/* =====================================================================================================
   The Old Quarry underground: THE KIT and batch 1 (docs/design/quarry-underground.md, part 2).
   Needs quarry-under.js (the plan). Builds a level of the mine from ugGen's plan:
     ugBuildLevel(plan, L) -> {g, lamps, veins, decl, solids, moving, pickups, hot, portal}   (L = 0, 1, 2; one THREE.Group in mine coordinates)
   Mine coordinates: x, z from the shaft (desert-local x = MN.ox + x, z = MN.oz + z), y from level 1's floor
   (desert y = MN.Y + y). Level floors are at y 0, -12, -24 (UGL[i].y - UGL[0].y).
   Everything static in a piece is merged into one mesh per material (ugBatch); veins, lamps' lights and signs stay
   separate objects so the game can hide, light or update them.
   Rock is pushed OUT of the tunnels by a noise of the world position (ugNoise), never in, and faded to nothing at
   every opening, so pieces that meet share the exact same edge (no gaps, no seams).
   ===================================================================================================== */

/* ---------- textures and materials (made once) ---------- */
const UGK={};
function ugCanvas(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t}
function ugKit(){
 if(UGK.ok)return UGK;UGK.ok=1;
 const rnd=ugRng(9157);
 /* rock: warm strata, blotches and cracks; drawn wrapped so it tiles */
 const wrap=(k,w,h,f)=>{for(const dx of[-w,0,w])for(const dy of[-h,0,h]){k.save();k.translate(dx,dy);f();k.restore()}};
 UGK.rockT=ugCanvas(512,512,(k,w,h)=>{k.fillStyle='#8a755e';k.fillRect(0,0,w,h);
  for(let i=0;i<14;i++){const y=rnd()*h,t=6+rnd()*26,c=rnd()<.5?'rgba(60,44,30,.22)':'rgba(200,170,130,.16)';wrap(k,w,h,()=>{k.fillStyle=c;k.beginPath();k.moveTo(0,y);for(let x=0;x<=w;x+=32)k.lineTo(x,y+Math.sin(x*.02+i)*6);for(let x=w;x>=0;x-=32)k.lineTo(x,y+t+Math.sin(x*.025+i*2)*5);k.fill()})}
  for(let i=0;i<420;i++){const x=rnd()*w,y=rnd()*h,r=4+rnd()*22,c=rnd()<.5?'rgba(40,30,22,.12)':'rgba(230,205,170,.10)';wrap(k,w,h,()=>{k.fillStyle=c;k.beginPath();k.ellipse(x,y,r,r*(.4+rnd()*.5),rnd()*3,0,7);k.fill()})}
  k.lineWidth=1.4;for(let i=0;i<40;i++){let x=rnd()*w,y=rnd()*h;k.strokeStyle='rgba(30,22,16,.45)';wrap(k,w,h,()=>{k.beginPath();k.moveTo(x,y);let a=rnd()*7,px=x,py=y;for(let j=0;j<6;j++){a+=rnd()-.5;px+=Math.cos(a)*12;py+=Math.sin(a)*12;k.lineTo(px,py)}k.stroke()})}});
 UGK.gravT=ugCanvas(256,256,(k,w,h)=>{k.fillStyle='#6e5e4c';k.fillRect(0,0,w,h);for(let i=0;i<2600;i++){const v=rnd();k.fillStyle=v<.5?'rgba(40,32,24,.35)':'rgba(190,170,140,.30)';k.fillRect(rnd()*w,rnd()*h,1+rnd()*3,1+rnd()*2)}});
 UGK.woodT=ugCanvas(128,512,(k,w,h)=>{k.fillStyle='#8a6440';k.fillRect(0,0,w,h);for(let i=0;i<60;i++){const x=rnd()*w;k.strokeStyle='rgba('+(40+rnd()*30|0)+',28,14,'+(.15+rnd()*.25)+')';k.lineWidth=1+rnd()*2;k.beginPath();k.moveTo(x,0);for(let y=0;y<=h;y+=32)k.lineTo(x+Math.sin(y*.03+i)*3,y);k.stroke()}
  for(let i=0;i<5;i++){const x=rnd()*w,y=rnd()*h;k.fillStyle='rgba(50,30,14,.5)';k.beginPath();k.ellipse(x,y,3,7,0,0,7);k.fill()}});
 UGK.brickT=ugCanvas(256,256,(k,w,h)=>{k.fillStyle='#5a4a3e';k.fillRect(0,0,w,h);for(let r=0;r<16;r++)for(let c=0;c<5;c++){const x=c*52+(r%2?26:0),y=r*16;const v=rnd();k.fillStyle='rgb('+(130+v*40|0)+','+(70+v*25|0)+','+(48+v*18|0)+')';k.fillRect(x+2,y+2,48,12);if(x+52>w){k.fillRect(x+2-w,y+2,48,12)}}});
 UGK.plankT=ugCanvas(256,256,(k,w,h)=>{for(let i=0;i<8;i++){const v=rnd();k.fillStyle='rgb('+(118+v*30|0)+','+(84+v*20|0)+','+(52+v*12|0)+')';k.fillRect(i*32,0,32,h);k.fillStyle='rgba(30,18,8,.6)';k.fillRect(i*32,0,2,h);for(let j=0;j<10;j++){k.strokeStyle='rgba(50,30,14,.25)';k.beginPath();const x=i*32+4+rnd()*24;k.moveTo(x,0);k.lineTo(x+Math.sin(j)*3,h);k.stroke()}}});
 /* water ripples: a tiling normal map from a few waves and soft blobs (the game scrolls its offset slowly) */
 UGK.poolN=(()=>{const W=256,H=new Float32Array(W*W),bl=[];for(let i=0;i<70;i++)bl.push([rnd()*W,rnd()*W,6+rnd()*18,rnd()<.5?-1:1]);
  for(let y=0;y<W;y++)for(let x=0;x<W;x++){let h=Math.sin((x*3+y*1)/W*6.283)*.5+Math.sin((x*-2+y*5)/W*6.283)*.35+Math.sin((x*7-y*4)/W*6.283)*.18;
   for(const b of bl){let dx=Math.abs(x-b[0]),dy=Math.abs(y-b[1]);dx=Math.min(dx,W-dx);dy=Math.min(dy,W-dy);const d=(dx*dx+dy*dy)/(b[2]*b[2]);if(d<4)h+=b[3]*.25*Math.exp(-d)}H[y*W+x]=h}
  return ugCanvas(W,W,(k)=>{const im=k.createImageData(W,W);for(let y=0;y<W;y++)for(let x=0;x<W;x++){const hx=H[y*W+(x+1)%W]-H[y*W+(x+W-1)%W],hy=H[((y+1)%W)*W+x]-H[((y+W-1)%W)*W+x];
   let nx=-hx*3,ny=-hy*3,nz=1;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;const i=(y*W+x)*4;im.data[i]=(nx*.5+.5)*255;im.data[i+1]=(ny*.5+.5)*255;im.data[i+2]=(nz*.5+.5)*255;im.data[i+3]=255}k.putImageData(im,0,0)})})();
 UGK.poolN.repeat.set(3,3);
 const M=(o)=>{const m=new THREE.MeshStandardMaterial(Object.assign({roughness:.9},o));return m};
 UGK.mat={
  rock:M({map:UGK.rockT,color:0xd0bca4}),rock2:M({map:UGK.rockT,color:0x9aa4b0}),rock3:M({map:UGK.rockT,color:0x6a5a56}),
  floor:M({map:UGK.gravT,color:0xc8b8a0}),
  wood:M({map:UGK.woodT,color:0xd8b890,roughness:.85}),woodD:M({map:UGK.woodT,color:0x8a6a50,roughness:.9}),
  plank:M({map:UGK.plankT,color:0xe0d0b8,roughness:.88}),brick:M({map:UGK.brickT,color:0xffffff,roughness:.92}),
  steel:M({color:0x5e636a,metalness:.55,roughness:.45}),rail:M({color:0x4c4642,metalness:.6,roughness:.5}),
  black:M({color:0x1c1a18,roughness:.8}),paintY:M({color:0xd8a020,roughness:.6}),paintR:M({color:0xa82a20,roughness:.6}),
  glass:new THREE.MeshStandardMaterial({color:0xfff0c8,emissive:0xffc870,emissiveIntensity:1.6,roughness:.3}),
  wire:M({color:0x1a1a1a,roughness:.6}),
  board:M({color:0x3a2c1e,roughness:.85}),paper:M({color:0xe8dcc0,roughness:.9}),green:M({color:0x2f5a3a,roughness:.7}),
  oreRock:M({map:UGK.rockT,color:0x5a4a3c}),fill:M({map:UGK.gravT,color:0xf0e0c0}),
  floor2:M({map:UGK.gravT,color:0xaeb0b4}),floor3:M({map:UGK.gravT,color:0x6a5c56}),
  water:new THREE.MeshStandardMaterial({color:0x183038,roughness:.06,metalness:.3,transparent:true,opacity:.9}),
  waterS:new THREE.MeshStandardMaterial({color:0x4a7a84,roughness:.1,metalness:.2,transparent:true,opacity:.45,depthWrite:false,normalMap:UGK.poolN,normalScale:new THREE.Vector2(.25,.25)}),
  /* deep water: a see-through rippled surface, darker layers under it that only cover where the basin is deeper
     (so the middle looks deeper than the edges), and wet rock for the basin */
  pool:new THREE.MeshStandardMaterial({color:0x1a3236,roughness:.16,metalness:.3,transparent:true,opacity:.62,depthWrite:false,normalMap:UGK.poolN,normalScale:new THREE.Vector2(.22,.22)}),
  poolD:new THREE.MeshBasicMaterial({color:0x07120f,transparent:true,opacity:.2,depthWrite:false}),
  wetRock:M({map:UGK.rockT,color:0x6e5a48,roughness:.35}),
  beam:new THREE.MeshBasicMaterial({color:0xfff0c0,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}),
  sky:new THREE.MeshBasicMaterial({color:0xfff4dc}),
  white:M({color:0xe8e4dc,roughness:.6}),red:M({color:0xb02a20,roughness:.6}),dark:M({color:0x2a2c30,metalness:.5,roughness:.5}),
  brass:M({color:0xc8a040,metalness:.7,roughness:.35}),cloth:M({color:0x6a7a5a,roughness:1}),
  lampG:new THREE.MeshStandardMaterial({color:0xfff0c8,emissive:0xffd890,emissiveIntensity:1.2,roughness:.4})};
 for(const k in UGK.mat)UGK.mat[k].userData.ug=k;
 UGK.mat.poolD.userData.ro=1;UGK.mat.pool.userData.ro=2;UGK.mat.waterS.userData.ro=2;
 UGK.ore={cu:[0xd07a40,0x5a2410],fe:[0x8a8a90,0x202024],ag:[0xe0e4ea,0x404850],au:[0xffc830,0x806000],cr:[0x60e0ff,0x2080c0],dm:[0xe8f8ff,0x8ab0d0],ur:[0x9cff5a,0x3a8a20]};
 UGK.oreM={};for(const k in UGK.ore)UGK.oreM[k]=new THREE.MeshStandardMaterial({color:UGK.ore[k][0],emissive:UGK.ore[k][1],emissiveIntensity:.9,metalness:k=='cr'||k=='dm'?.1:.45,roughness:.3});
 return UGK;
}

/* ---------- noise of the world position (0..1); the same everywhere, so meeting pieces match ---------- */
function ugHash(i,j,k){let h=Math.imul(i,374761393)^Math.imul(j,668265263)^Math.imul(k,1274126177);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
function ugVN(x,y,z){const i=Math.floor(x),j=Math.floor(y),k=Math.floor(z),fx=x-i,fy=y-j,fz=z-k,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),w=fz*fz*(3-2*fz);
 const L=(a,b,t)=>a+(b-a)*t,h=ugHash;
 return L(L(L(h(i,j,k),h(i+1,j,k),u),L(h(i,j+1,k),h(i+1,j+1,k),u),v),L(L(h(i,j,k+1),h(i+1,j,k+1),u),L(h(i,j+1,k+1),h(i+1,j+1,k+1),u),v),w)}
function ugNoise(x,y,z){return .62*ugVN(x*.55,y*.55,z*.55)+.38*ugVN(x*1.7+31.7,y*1.7+7.3,z*1.7+11.1)}

/* ---------- merging: everything static in a piece becomes one mesh per material ---------- */
function ugBatch(){const B={};const self={
 add(key,geo,m){const g=geo.index?geo.toNonIndexed():geo.clone();if(m)g.applyMatrix4(m);(B[key]=B[key]||[]).push(g);return self},
 box(key,w,h,d,x,y,z,ry,rx,rz){const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0,'YXZ')),new THREE.Vector3(1,1,1));return self.add(key,new THREE.BoxGeometry(w,h,d),m)},
 cyl(key,r0,r1,h,x,y,z,seg,ry,rx,rz){const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0,'YXZ')),new THREE.Vector3(1,1,1));return self.add(key,new THREE.CylinderGeometry(r0,r1,h,seg||10),m)},
 raw(key,pos,nor,uv){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));(B[key]=B[key]||[]).push(g);return self},
 build(parent,mats){for(const k in B){const L=B[k];let n=0;for(const g of L)n+=g.attributes.position.count;const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2);let o=0;
   for(const g of L){const c=g.attributes.position.count;P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);if(g.attributes.uv)U.set(g.attributes.uv.array,o*2);o+=c;g.dispose()}
   const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('normal',new THREE.BufferAttribute(N,3));G.setAttribute('uv',new THREE.BufferAttribute(U,2));G.computeBoundingSphere();
   const me=new THREE.Mesh(G,mats[k]);me.userData.noSeam=true;me.userData.ugKey=k;me.renderOrder=mats[k].userData.ro||0;parent.add(me)}}};
 return self}

/* ---------- tunnel profile: vertical walls, then a flattened arch. hw = half width ---------- */
function ugProf(hw){const wy=2.6,top=wy+.45*hw,P=[];
 for(let i=0;i<=3;i++)P.push([-hw,-.1+(wy+.1)*i/3,-1,0]);
 for(let i=1;i<8;i++){const a=Math.PI*(1-i/8),nx=Math.cos(a)/hw,ny=Math.sin(a)/(top-wy),l=Math.hypot(nx,ny);P.push([hw*Math.cos(a),wy+(top-wy)*Math.sin(a),nx/l,ny/l])}
 for(let i=3;i>=0;i--)P.push([hw,-.1+(wy+.1)*i/3,1,0]);
 return{P,hw,wy,top}}

/* round the corners of a polyline [[x,y,z]...] with arcs of radius r (where the turn is more than 3 degrees) */
function ugFillet(pts,r){if(!r||pts.length<3)return pts.slice();const o=[pts[0]];
 for(let i=1;i<pts.length-1;i++){const a=pts[i-1],b=pts[i],c=pts[i+1];const u=[a[0]-b[0],a[2]-b[2]],v=[c[0]-b[0],c[2]-b[2]],lu=Math.hypot(u[0],u[1]),lv=Math.hypot(v[0],v[1]);
  const cos=(u[0]*v[0]+u[1]*v[1])/(lu*lv),th=Math.PI-Math.acos(Math.max(-1,Math.min(1,cos)));if(th<.05){o.push(b);continue}
  const d=Math.min(r*Math.tan(th/2),lu*.48,lv*.48),rr=d/Math.tan(th/2);
  const p0=[b[0]+u[0]/lu*d,b[2]+u[1]/lu*d],p1=[b[0]+v[0]/lv*d,b[2]+v[1]/lv*d];
  // centre: from p0 along the inward normal
  const bis=[u[0]/lu+v[0]/lv,u[1]/lu+v[1]/lv],bl=Math.hypot(bis[0],bis[1]),cd=rr/Math.sin((Math.PI-th)/2)/ 1;
  const cx=b[0]+bis[0]/bl*Math.hypot(d,rr),cz=b[2]+bis[1]/bl*Math.hypot(d,rr);
  let a0=Math.atan2(p0[1]-cz,p0[0]-cx),a1=Math.atan2(p1[1]-cz,p1[0]-cx);let da=a1-a0;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
  const n=Math.max(2,Math.ceil(Math.abs(da)*rr/.5));for(let k=0;k<=n;k++){const t=k/n,aa=a0+da*t;o.push([cx+Math.cos(aa)*rr,b[1],cz+Math.sin(aa)*rr])}}
 o.push(pts[pts.length-1]);return o}
function ugResample(pts,step){const o=[pts[0]];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],L=Math.hypot(b[0]-a[0],b[2]-a[2],b[1]-a[1]),n=Math.max(1,Math.ceil(L/step));for(let k=1;k<=n;k++){const t=k/n;o.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t])}}return o}

/* ---------- the tunnel extruder. pts: polyline in mine coords [[x,y,z]]. o: {hw, amp, fil, rock, sets, rails, lamps,
   holes:[[s0,s1,x0,x1]] (gaps in the floor, s along the tunnel), capA, capB}. Returns {L, at(s)->frame, frames} ---------- */
function ugTube(b,pts,o){
 o=o||{};const pf=ugProf(o.hw||2),amp=o.amp==null?.2:o.amp,rk=o.rock||'rock';
 const P=ugResample(ugFillet(pts,o.fil==null?3:o.fil),.5),n=P.length,S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][2]-P[i-1][2]));const L=S[n-1];
 const T=P.map((p,i)=>{const a=P[Math.max(0,i-1)],c=P[Math.min(n-1,i+1)];let tx=c[0]-a[0],tz=c[2]-a[2];const l=Math.hypot(tx,tz)||1;return[tx/l,tz/l]});
 /* the two ends meet other pieces: square them up exactly to the nearest axis (every opening faces one of the four
    ways), so the end ring lies in the doorway's plane and two tunnels meeting share the same ring (no wedge gaps) */
 for(const i of[0,n-1]){const [tx,tz]=T[i];if(Math.abs(tx)>.97)T[i]=[Math.sign(tx),0];else if(Math.abs(tz)>.97)T[i]=[0,Math.sign(tz)]}
 const fade=s=>Math.min(1,s/1,(L-s)/1);
 /* walls and roof */
 const pos=[],nor=[],uv=[],pr=pf.P,m=pr.length,V=[];const pl=[0];for(let j=1;j<m;j++)pl.push(pl[j-1]+Math.hypot(pr[j][0]-pr[j-1][0],pr[j][1]-pr[j-1][1]));
 for(let i=0;i<n;i++){const [tx,tz]=T[i],rx=-tz,rz=tx,row=[];for(let j=0;j<m;j++){const [sx,y,nx,ny]=pr[j];let x=P[i][0]+rx*sx,yy=P[i][1]+y,z=P[i][2]+rz*sx;
   const hy=Math.max(0,Math.min(1,y/.7)),d=amp*fade(S[i])*hy*ugNoise(x,yy,z);x+=(rx*nx)*d;yy+=ny*d;z+=(rz*nx)*d;row.push([x,yy,z,-(rx*nx),-ny,-(rz*nx),S[i]/3,pl[j]/3])}V.push(row)}
 const push=(q)=>{pos.push(q[0],q[1],q[2]);nor.push(q[3],q[4],q[5]);uv.push(q[6],q[7])};
 for(let i=0;i<n-1;i++)for(let j=0;j<m-1;j++){const a=V[i][j],b2=V[i+1][j],c=V[i+1][j+1],d=V[i][j+1];push(a);push(b2);push(c);push(a);push(c);push(d)}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();b.add(rk,geo);
 /* the floor, with holes cut where asked */
 const fp=[],fn=[],fu=[];const holes=o.holes||[];
 const cols=[-pf.hw];for(const h of holes){cols.push(h[2],h[3])}cols.push(pf.hw);const xs=[...new Set(cols)].sort((a,b)=>a-b);
 /* the floor's edge points, row by row; on the inside of a tight bend an edge would run backwards and the floor fold
    over itself (two layers flickering), so there it waits until the bend has passed */
 const FQ=[];for(let i=0;i<n;i++){const [tx,tz]=T[i],rx=-tz,rz=tx,row=xs.map(x=>[P[i][0]+rx*x,P[i][1],P[i][2]+rz*x]);if(i)row.forEach((v,c)=>{const q=FQ[i-1][c];if((v[0]-q[0])*tx+(v[2]-q[2])*tz<.02)row[c]=[q[0],v[1],q[2]]});FQ.push(row)}
 for(let i=0;i<n-1;i++){const s0=S[i],s1=S[i+1];for(let c=0;c<xs.length-1;c++){const x0=xs[c],x1=xs[c+1],mx=(x0+x1)/2,ms=(s0+s1)/2;if(holes.some(h=>ms>h[0]&&ms<h[1]&&mx>h[2]&&mx<h[3]))continue;
   const A=FQ[i][c],B2=FQ[i][c+1],C=FQ[i+1][c+1],D=FQ[i+1][c];const tris=[[A,B2,C],[A,C,D]].filter(t=>Math.abs((t[1][0]-t[0][0])*(t[2][2]-t[0][2])-(t[1][2]-t[0][2])*(t[2][0]-t[0][0]))>1e-7);
   for(const t of tris)for(const v of t){fp.push(v[0],v[1],v[2]);fn.push(0,1,0);fu.push(v[0]/2.5,v[2]/2.5)}}}
 /* make sure the floor faces up */
 for(let k=0;k<fp.length;k+=9){const ax=fp[k],az=fp[k+2],bx=fp[k+3],bz=fp[k+5],cx=fp[k+6],cz=fp[k+8];if((bx-ax)*(cz-az)-(bz-az)*(cx-ax)>0){for(let q=0;q<3;q++){const t=fp[k+3+q];fp[k+3+q]=fp[k+6+q];fp[k+6+q]=t}const tu0=fu[k/9*6+2],tu1=fu[k/9*6+3];fu[k/9*6+2]=fu[k/9*6+4];fu[k/9*6+3]=fu[k/9*6+5];fu[k/9*6+4]=tu0;fu[k/9*6+5]=tu1}}
 b.raw(o.floorKey||'floor',fp,fn,fu);
 const at=s=>{let i=1;while(i<n-1&&S[i]<s)i++;const t=(s-S[i-1])/((S[i]-S[i-1])||1),p=[P[i-1][0]+(P[i][0]-P[i-1][0])*t,P[i-1][1]+(P[i][1]-P[i-1][1])*t,P[i-1][2]+(P[i][2]-P[i-1][2])*t],tt=T[i];return{p,t:tt,r:[-tt[1],tt[0]],yaw:Math.atan2(-tt[0],-tt[1])}};
 const res={L,at,pf,P,S,T,amp};
 if(o.sets!==false)ugSets(b,res,o);
 if(o.rails)ugRails(b,res,o.ends);
 if(o.lamps!==false&&o.lampsOut)ugLamps(b,res,o.lampsOut,o.lampOff||0);
 return res}

/* a point on a tunnel's wall surface (ring i, profile point j, noise included) with the way it faces, 6 cm into the
   rock: where a vein goes. Veins sit on the real wall this way, never in front of a bulge or behind a hollow */
function ugTubeWall(tr,i,j){const p=tr.P[i],[tx,tz]=tr.T[i],rx=-tz,rz=tx,q=tr.pf.P[j],sx=q[0],yy=q[1],x=p[0]+rx*sx,y=p[1]+yy,z=p[2]+rz*sx;
 const hy=Math.max(0,Math.min(1,yy/.7)),d=tr.amp*Math.min(1,tr.S[i],tr.L-tr.S[i])*hy*ugNoise(x,y,z),sg=Math.sign(sx),ox=rx*sg,oz=rz*sg;return{x:x+ox*(d+.06),y,z:z+oz*(d+.06),dx:-ox,dz:-oz}}
/* the nearest ring to a distance along a tunnel */
const ugTubeRing=(tr,s)=>{let i=0;while(i<tr.S.length-1&&tr.S[i+1]<=s)i++;return i};
/* timber sets every 3 m: two posts, a cap, and lagging boards over the caps (some missing). broken: some sets lean */
function ugSets(b,t,o){const pf=t.pf,hw=pf.hw,px=hw-.28,cw=2*hw-.3,sp=3,R=ugRng((Math.round(t.P[0][0]*7)^Math.round(t.P[0][2]*13))+77);
 let si=0;for(let s=1.5;s<t.L-1;s+=sp,si++){const f=t.at(s),[x,y,z]=f.p,yaw=f.yaw,rx=f.r[0],rz=f.r[1];
  const lean=o.broken&&R()<.4?(R()-.5)*.25:0;
  for(const sd of[-1,1])b.box('wood',.22,2.6,.22,x+rx*sd*px,y+1.3,z+rz*sd*px,yaw,0,sd*lean*.3);
  b.box('wood',cw,.24,.24,x,y+2.72,z,yaw,0,lean*.2);
  if(s+sp<t.L-1&&!lean)for(let k=-3;k<=3;k++){if(R()<.15)continue;const f2=t.at(s+sp/2),xx=f2.p[0]+f2.r[0]*k*.5,zz=f2.p[2]+f2.r[1]*k*.5;b.box('woodD',.2,.04,sp-.1,xx,f2.p[1]+2.855-(si%2)*.012,zz,f2.yaw)   /* every other span 12 mm lower: on a bend the boards of two spans can cross */}}}
/* rails: sleepers every 0.6 m and two continuous rails (0.6 m gauge) following the path ring by ring, so curves
   have no gaps and two pieces' rails meet end to end. ends: a list that collects both ends (for buffer stops) */
function ugRails(b,t,ends){for(let s=.45;s<t.L-.3;s+=.6){const f=t.at(s);b.box('woodD',1.1,.08,.18,f.p[0],f.p[1]+.04,f.p[2],f.yaw)}
 const P=t.P,T=t.T,n=P.length,pos=[],w=.03,y0=.08,y1=.18;
 const quad=(a,b2,c,d,nx,ny,nz)=>{const e1=[b2[0]-a[0],b2[1]-a[1],b2[2]-a[2]],e2=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],cr=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
  const ok=cr[0]*nx+cr[1]*ny+cr[2]*nz>=0;for(const q of ok?[a,b2,c,a,c,d]:[a,c,b2,a,d,c])pos.push(q[0],q[1],q[2])};
 for(const off of[-.3,.3])for(let i=0;i<n-1;i++){const r0=[-T[i][1],T[i][0]],r1=[-T[i+1][1],T[i+1][0]],A=P[i],B=P[i+1];
  const at=(p,r,o,yy)=>[p[0]+r[0]*o,p[1]+yy,p[2]+r[1]*o];
  quad(at(A,r0,off-w,y1),at(A,r0,off+w,y1),at(B,r1,off+w,y1),at(B,r1,off-w,y1),0,1,0);
  for(const sd of[-1,1]){const o=off+sd*w;quad(at(A,r0,o,y0),at(B,r1,o,y0),at(B,r1,o,y1),at(A,r0,o,y1),r0[0]*sd,0,r0[1]*sd)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(new Array(pos.length/3*2).fill(0),2));g.computeVertexNormals();b.add('rail',g);
 if(ends){const e0=P[0],e1=P[n-1];ends.push({x:e0[0],y:e0[1],z:e0[2],dx:-T[0][0],dz:-T[0][1]},{x:e1[0],y:e1[1],z:e1[2],dx:T[n-1][0],dz:T[n-1][1]})}}
/* a turn plate: a round steel plate in the floor where rails meet (junctions, the pillar round) */
/* a turntable: a round steel plate set in the floor where lines meet, with one short pair of rails across it and a rim.
   A loaded cart is pushed onto it, the plate is turned by hand, and the cart is pushed off down another line.
   (dx,dz): the way its rails point (it sits turned to one of the lines) */
function ugPlate(b,x,y,z,ctx,dx,dz){dx=dx||0;dz=dz==null?1:dz;const yaw=Math.atan2(-dx,-dz),rx=-dz,rz=dx;
 b.cyl('steel',.9,.9,.05,x,y+.025,z,28);
 const rim=new THREE.TorusGeometry(.875,.03,6,28);rim.rotateX(Math.PI/2);b.add('rail',rim,new THREE.Matrix4().makeTranslation(x,y+.05,z));
 for(const sd of[-.3,.3])b.box('rail',.06,.13,1.62,x+rx*sd,y+.115,z+rz*sd,yaw);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.39;b.cyl('rail',.035,.035,.02,x+Math.cos(a)*.62,y+.06,z+Math.sin(a)*.62,8)}
 if(ctx)ctx.plates.push([x,z])}
/* rails between mine-coord points with fillets, registering their ends */
function ugRailLine(b,pts,y,ctx,fil){const t=ugTube(ugNull,pts.map(q=>[q[0],y,q[1]]),{fil:fil==null?3:fil,sets:false});ugRails(b,t,ctx.ends);return t}
/* lamps hanging from the caps every other set, a wire along the roof between them; lamp spots go in out[] */
function ugLamps(b,t,out,off){let first=null,prev=null;for(let s=1.5+(off||0)*3;s<t.L-1;s+=6){const f=t.at(s),x=f.p[0]+f.r[0]*.35,z=f.p[2]+f.r[1]*.35,y=f.p[1];
  b.cyl('wire',.008,.008,.24,x,y+2.48,z,4);b.cyl('steel',.07,.09,.08,x,y+2.34,z,10);b.add('glass',new THREE.SphereGeometry(.075,10,8),new THREE.Matrix4().makeTranslation(x,y+2.25,z));
  out.push([x,y+2.2,z]);if(prev){const dx=x-prev[0],dz=z-prev[2],l=Math.hypot(dx,dz);b.box('wire',.012,.012,l,(x+prev[0])/2,y+2.58,(z+prev[2])/2,Math.atan2(-dx,-dz))}prev=[x,y,z]}}

/* ---------- a room shell: floor, rock walls (pushed out by noise, flat at doorways), a rough roof.
   pts: the room's corners in mine coords, anticlockwise seen from above, at floor y; h: height.
   doors: [{x,z,hw}] doorway centres on the walls (mine coords); each gets the tunnel's arch shape, a filler panel
   above it and a timber portal. o.wall: 'rock'|'plank'|'brick' lining; o.roof: 'rock'|'beams'; o.holes: floor/roof
   holes [{x0,x1,z0,z1,roof}] (mine coords, axis-aligned). o.inner: true for a block's walls seen from outside. ---------- */
function ugRoom(b,pts,y,h,doors,o){o=o||{};const amp=o.amp==null?.22:o.amp,rk=o.rock||'rock',lin=o.wall||rk;
 const nn=pts.length;
 for(let e=0;e<nn;e++){const A=pts[e],B=pts[(e+1)%nn],dx=B[0]-A[0],dz=B[1]-A[1],len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len;
  const nx=uz,nz=-ux;  /* outward normal (into the rock); the walls face the other way, into the room */
  const ds=doors.map(d=>{const t=(d.x-A[0])*ux+(d.z-A[1])*uz,off=Math.abs((d.x-A[0])*nx+(d.z-A[1])*nz);return off<.3&&t>0&&t<len?{t,hw:d.hw,d}:null}).filter(Boolean);
  const pf=ds.map(d=>ugProf(d.hw));const topD=ds.length?Math.max(...pf.map(p=>p.top))+.15:0;
  /* columns: wall edges and doorway edges; rows: floor, doorway top, roof */
  const cx=[0,len];for(const d of ds){cx.push(d.t-d.hw,d.t+d.hw)}const step=.6;let C=[...new Set(cx.map(v=>+v.toFixed(3)))].sort((a,b)=>a-b),C2=[];for(let i=0;i<C.length-1;i++){const k=Math.max(1,Math.ceil((C[i+1]-C[i])/step));for(let q=0;q<k;q++)C2.push(C[i]+(C[i+1]-C[i])*q/k)}C2.push(len);
  const ry=[-.1];if(topD&&topD<h)ry.push(topD);ry.push(h+.1);let R2=[];for(let i=0;i<ry.length-1;i++){const k=Math.max(1,Math.ceil((ry[i+1]-ry[i])/step));for(let q=0;q<k;q++)R2.push(ry[i]+(ry[i+1]-ry[i])*q/k)}R2.push(h+.1);
  const inDoor=(t,yy)=>ds.some(d=>t>d.t-d.hw+1e-3&&t<d.t+d.hw-1e-3&&yy<topD-1e-3);
  const dist=(t,yy)=>{let m=Math.min(t,len-t,(yy+.1)*2,h+.1-yy);for(const d of ds){const ex=Math.max(d.t-d.hw-t,0,t-d.t-d.hw),ey=Math.max(yy-topD,0);m=Math.min(m,Math.hypot(ex,ey))}return m};
  const vx=(t,yy)=>{let x=A[0]+ux*t,z=A[1]+uz*t;const f=Math.min(1,dist(t,yy)/1)*Math.max(0,Math.min(1,yy/.7)),d=amp*f*ugNoise(x,y+yy,z);return[x+nx*d,y+yy,z+nz*d]};
  const pos=[],uv=[];
  for(let i=0;i<C2.length-1;i++)for(let j=0;j<R2.length-1;j++){const t0=C2[i],t1=C2[i+1],y0=R2[j],y1=R2[j+1];if(inDoor((t0+t1)/2,(y0+y1)/2))continue;
   const a=vx(t0,y0),bq=vx(t1,y0),c=vx(t1,y1),d=vx(t0,y1),U=(t,yy)=>[(A[0]*-uz+A[1]*ux)*0+((e*7.3)+t)/3,yy/3];
   const q=[[a,U(t0,y0)],[bq,U(t1,y0)],[c,U(t1,y1)],[d,U(t0,y1)]];
   for(const k of[0,1,2,0,2,3]){pos.push(...q[k][0]);uv.push(...q[k][1])}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();b.add(lin,geo);
  /* over each doorway: a flat panel between the arch and the wall row above, then a timber portal */
  ds.forEach((d,k)=>{const p=pf[k],sh=new THREE.Shape();sh.moveTo(-d.hw,p.wy);sh.lineTo(-d.hw,topD);sh.lineTo(d.hw,topD);sh.lineTo(d.hw,p.wy);
   for(let i=p.P.length-5;i>=4;i--){const q=p.P[i];if(q[1]>=p.wy-1e-6)sh.lineTo(q[0],q[1])}
   const g2=new THREE.ShapeGeometry(sh);const pa=g2.attributes.position;const uvs=[];for(let i=0;i<pa.count;i++){uvs.push((d.t+pa.getX(i))/3,pa.getY(i)/3)}g2.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
   /* the panel's x runs along the wall, its face looks into the room */
   const mx=new THREE.Matrix4().compose(new THREE.Vector3(A[0]+ux*d.t,y,A[1]+uz*d.t),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,Math.atan2(-uz,ux),0)),new THREE.Vector3(1,1,1));
   b.add(lin,g2,mx);
   if(o.portal!==false){const px=A[0]+ux*d.t-nx*.12,pz=A[1]+uz*d.t-nz*.12,py=Math.atan2(-ux,-uz)+Math.PI/2;
    for(const sd of[-1,1])b.box('wood',.3,p.wy+.02,.3,px+ux*sd*(d.hw+.02),y+(p.wy-.08)/2+.01,pz+uz*sd*(d.hw+.02),0);
    b.box('wood',2*d.hw+.7,.32,.32,px,y+p.wy+.06,pz,Math.atan2(-uz,ux))}})}
 /* floor and roof (with holes), as grids so the roof can be rough */
 const xs=pts.map(p=>p[0]),zs=pts.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs);
 const inPoly=(x,z)=>{let c=false;for(let i=0,j=nn-1;i<nn;j=i++){const a=pts[i],bb=pts[j];if((a[1]>z)!=(bb[1]>z)&&x<(bb[0]-a[0])*(z-a[1])/(bb[1]-a[1])+a[0])c=!c}return c};
 const holes=o.holes||[],blocks=o.blocks||[];const inHole=(x,z,roof)=>holes.some(H=>(!!H.roof==roof||H.both)&&x>H.x0&&x<H.x1&&z>H.z0&&z<H.z1)||blocks.some(H=>x>H.x0&&x<H.x1&&z>H.z0&&z<H.z1);
 const gx=[x0];for(const H of holes.concat(blocks))gx.push(H.x0,H.x1);gx.push(x1);const gz=[z0];for(const H of holes.concat(blocks))gz.push(H.z0,H.z1);gz.push(z1);
 const sub=(L,st)=>{L=[...new Set(L.map(v=>+v.toFixed(3)))].sort((a,b)=>a-b);const o2=[];for(let i=0;i<L.length-1;i++){const k=Math.max(1,Math.ceil((L[i+1]-L[i])/st));for(let q=0;q<k;q++)o2.push(L[i]+(L[i+1]-L[i])*q/k)}o2.push(L[L.length-1]);return o2};
 const GX=sub(gx,.8),GZ=sub(gz,.8);const fp=[],fn=[],fu=[],rp=[],ru=[];
 const edgeD=(x,z)=>{let m=1e9;for(let i=0;i<nn;i++){const a=pts[i],c=pts[(i+1)%nn];const vx=c[0]-a[0],vz=c[1]-a[1],l=vx*vx+vz*vz,t=Math.max(0,Math.min(1,((x-a[0])*vx+(z-a[1])*vz)/l));m=Math.min(m,Math.hypot(x-a[0]-vx*t,z-a[1]-vz*t))}for(const H of holes.concat(blocks)){m=Math.min(m,Math.hypot(Math.max(H.x0-x,0,x-H.x1),Math.max(H.z0-z,0,z-H.z1)))}return m};
 const roofY=(x,z)=>y+h+(o.roof=='flat'?0:.5*Math.min(1,edgeD(x,z)/1.2)*ugNoise(x,y+h,z));
 for(let i=0;i<GX.length-1;i++)for(let j=0;j<GZ.length-1;j++){const a=GX[i],c=GX[i+1],e=GZ[j],f=GZ[j+1],mx=(a+c)/2,mz=(e+f)/2;if(!inPoly(mx,mz))continue;
  if(!inHole(mx,mz,true)){for(const v of[[a,e],[c,f],[a,f],[a,e],[c,e],[c,f]]){rp.push(v[0],roofY(v[0],v[1]),v[1]);ru.push(v[0]/3,v[1]/3)}}}
 if(o.noCap)return{x0,x1,z0,z1};
 /* the floor: one flat shape with exact holes (rectangles, pillars, round or oval pits) */
 {const sh=new THREE.Shape();pts.forEach((q,i)=>i?sh.lineTo(q[0],-q[1]):sh.moveTo(q[0],-q[1]));
  for(const H of holes.filter(H=>!H.roof||H.both).concat(blocks)){const hp=new THREE.Path();hp.moveTo(H.x0,-H.z0);hp.lineTo(H.x1,-H.z0);hp.lineTo(H.x1,-H.z1);hp.lineTo(H.x0,-H.z1);hp.lineTo(H.x0,-H.z0);sh.holes.push(hp)}
  for(const E of o.pits||[]){const hp=new THREE.Path();hp.absellipse(E.cx,-E.cz,E.rx,E.rz,0,Math.PI*2,false,0);sh.holes.push(hp)}
  const fg=new THREE.ShapeGeometry(sh,24);fg.rotateX(-Math.PI/2);fg.translate(0,y,0);const pa=fg.attributes.position,uvs=[];for(let i=0;i<pa.count;i++)uvs.push(pa.getX(i)/2.5,pa.getZ(i)/2.5);fg.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));b.add(o.floor||'floor',fg)}
 const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(rp,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(ru,2));rg.computeVertexNormals();b.add(o.roofMat||rk,rg);
 return{x0,x1,z0,z1}}

/* ---------- a bulkhead: where a narrower tunnel (a room's neck) meets the standard 4 m opening, a flat rock wall with
   the narrow arch cut in it fills the difference, with a timber frame round the doorway. (x,z) the opening's centre,
   (fx,fz) the way it faces (out, towards the 4 m tunnel), hw the narrow half-width ---------- */
function ugBulkhead(b,x,y,z,fx,fz,hw,o){const big=ugProf(2),sm=ugProf(hw),sh=new THREE.Shape(),wall=P=>P.filter(q=>q[1]>=0);
 const ob=wall(big.P),ib=wall(sm.P);sh.moveTo(-2,0);for(const q of ob)sh.lineTo(q[0],q[1]);sh.lineTo(2,0);sh.lineTo(hw,0);for(let i=ib.length-1;i>=0;i--)sh.lineTo(ib[i][0],ib[i][1]);sh.lineTo(-hw,0);sh.lineTo(-2,0);
 const g=new THREE.ShapeGeometry(sh);const pa=g.attributes.position,uv=[];for(let i=0;i<pa.count;i++)uv.push(pa.getX(i)/3,pa.getY(i)/3);g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 /* the shape's x runs to the right as you face it, its face looks along (fx,fz) */
 const yaw=Math.atan2(fx,fz);b.add((o&&o.rock)||'rock',g,new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,yaw,0)),new THREE.Vector3(1,1,1)));
 const rx=fz,rz=-fx,px=x+fx*.12,pz=z+fz*.12;for(const sd of[-1,1])b.box('wood',.24,sm.wy,.24,px+rx*sd*(hw+.04),y+sm.wy/2,pz+rz*sd*(hw+.04),yaw);b.box('wood',2*hw+.5,.26,.26,px,y+sm.wy+.13,pz,yaw)}

/* ---------- a working face: closes a tunnel end with a rough rock dome. (x,z) the end, dir 0..3 the way the tunnel
   was going, y the floor. Returns the spots for its veins ---------- */
function ugFace(b,x,y,z,dir,hw,o){o=o||{};const pf=ugProf(hw||2),v=ugRot(0,-1,dir),r=[-v[1],v[0]],P=pf.P,m=P.length,depth=1.2,rings=5,cy=pf.wy*.55,pos=[],uv=[];
 const pt=(j,k)=>{const q=P[j],t=k/rings,fw=depth*Math.sin(t*Math.PI/2),sx=q[0]*Math.cos(t*Math.PI/2),yy=q[1]<=0?q[1]:q[1]+(cy-q[1])*t;
  let X=x+r[0]*sx+v[0]*fw,Z=z+r[1]*sx+v[1]*fw;const d=(k>0?.3:0)*ugNoise(X,y+yy,Z)*Math.min(1,Math.max(0,yy/.7));return[X+v[0]*d,y+yy,Z+v[1]*d]};
 for(let k=0;k<rings;k++)for(let j=0;j<m-1;j++){const a=pt(j,k),b2=pt(j+1,k),c=pt(j+1,k+1),d=pt(j,k+1);for(const q of[a,b2,c,a,c,d]){pos.push(...q);uv.push((q[0]+q[2])/3,q[1]/3)}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
 /* make the dome face back down the tunnel */
 const nA=geo.attributes.normal;let s=0;for(let i=0;i<nA.count;i++)s+=nA.getX(i)*v[0]+nA.getZ(i)*v[1];if(s>0){const pa=geo.attributes.position.array,ua=geo.attributes.uv.array;for(let i=0;i<pa.length;i+=9)for(let q=0;q<3;q++){const t=pa[i+3+q];pa[i+3+q]=pa[i+6+q];pa[i+6+q]=t}for(let i=0;i<ua.length;i+=6)for(let q=0;q<2;q++){const t=ua[i+2+q];ua[i+2+q]=ua[i+4+q];ua[i+4+q]=t}geo.computeVertexNormals()}
 b.add(o.rock||'rock',geo);
 /* the floor under the dome, following its bottom edge */
 const fp=[],fn=[],fu=[],edge=[];for(let k=0;k<=rings;k++)edge.push(pt(0,k));for(let k=rings;k>=0;k--)edge.push(pt(m-1,k));
 for(let i=0;i<edge.length-1;i++){const A=[x,y,z],B=edge[i],C=edge[i+1];const tri=[A,B,C];const cr=(B[0]-A[0])*(C[2]-A[2])-(B[2]-A[2])*(C[0]-A[0]);const T3=cr>0?[A,C,B]:tri;for(const q of T3){fp.push(q[0],y,q[2]);fn.push(0,1,0);fu.push(q[0]/2.5,q[2]/2.5)}}
 b.raw(o.floor||'floor',fp,fn,fu);
 /* spots for veins on the face, facing back down the tunnel */
 return[[2,2],[12,1],[6,3]].map(([j,k])=>{const q=pt(j,k);return[q[0]+v[0]*.06,q[1],q[2]+v[1]*.06,-v[0],-v[1]]})}

/* ---------- an ore vein: a dark rock patch on the wall with metal nuggets. A separate group (it gets broken) ---------- */
function ugVein(type,R){const K=ugKit(),g=new THREE.Group();R=R||Math.random;
 const p=new THREE.Mesh(new THREE.DodecahedronGeometry(.42,0),K.mat.oreRock);p.scale.set(1,.75,.38);g.add(p);
 for(let i=0;i<8;i++){const n=new THREE.Mesh(new THREE.OctahedronGeometry(.08+R()*.08,0),K.oreM[type]||K.oreM.fe);const a=R()*6.28,rr=R()*.3;n.position.set(Math.cos(a)*rr,Math.sin(a)*rr*.75,-.12-R()*.05);n.rotation.set(R()*3,R()*3,0);g.add(n)}
 g.userData.vein=type;return g}

/* ---------- a signpost: a post and a board with an arrow and the distance to the cage ---------- */
/* the canvas has the board's own shape (ar = width / height), and long text shrinks to fit inside the frame */
function ugSignTex(txt,ar){const W=Math.round(72*(ar||3.55));return ugCanvas(W,72,(k,w,h)=>{k.fillStyle='#e8d8b0';k.fillRect(0,0,w,h);k.strokeStyle='#5a3a1a';k.lineWidth=6;k.strokeRect(3,3,w-6,h-6);k.fillStyle='#2a1a0c';let f=34;const F=()=>k.font='700 '+f+'px "Barlow Semi Condensed",DoorsSans,Arial';F();while(f>14&&k.measureText(txt).width>w-28){f--;F()}k.textBaseline='middle';k.textAlign='center';k.fillText(txt,w/2,h/2+2)})}
function ugSign(x,y,z,yaw,txt,back){const K=ugKit(),g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw;
 const post=new THREE.Mesh(new THREE.BoxGeometry(.1,1.75,.1),K.mat.wood);post.position.y=.875;g.add(post);
 const t=ugSignTex(txt),t2=ugSignTex(back||txt),bd=new THREE.Mesh(new THREE.BoxGeometry(.95,.27,.04),[K.mat.woodD,K.mat.woodD,K.mat.woodD,K.mat.woodD,new THREE.MeshStandardMaterial({map:t,roughness:.8}),new THREE.MeshStandardMaterial({map:t2,roughness:.8})]);bd.position.set(0,1.55,.07);g.add(bd);
 g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});return g}

/* =====================================================================================================
   THE PIECES OF LEVEL 1 (batch 1): stations, tunnels, junctions, pillar rounds, ladderway, spiral decline
   ===================================================================================================== */
const UGLY=L=>UGL[L].y-UGL[0].y;
/* each level's rock and floor materials (level 1 warm brown, level 2 blue-grey, level 3 dark) */
const ugRK=L=>L==0?'rock':'rock'+(L+1),ugFL=L=>L==0?'floor':'floor'+(L+1);
/* yaw for a box whose length runs along local x, to lie along (dx,dz) */
const ugYX=(dx,dz)=>Math.atan2(-dz,dx);
/* a batch that throws everything away (to get a tunnel's frames without building it) */
const ugNull={add(){return this},box(){return this},raw(){return this},cyl(){return this}};
/* local piece coords -> mine coords */
const ugT=p=>(x,z)=>{const w=ugRot(x,z,p.r);return[p.x+w[0],p.z+w[1]]};
const ugYaw=(p,a)=>-p.r*Math.PI/2+(a||0);   /* rotation.y for a piece-local object */
/* the openings of a piece: its entry (0,0) and its exits, in mine coords, with the level they are on */
function ugOpenings(p){const T=ugT(p),o=[{x:p.x,z:p.z,L:p.L,dir:(p.r+2)%4,entry:1}];for(const e of p.d.ex){const w=T(e[0],e[1]);o.push({x:w[0],z:w[1],L:p.L+(e[3]||0),dir:(e[2]+p.r)%4})}return o}

/* a rectangular room in piece-local coords (x0..x1, z0..z1), doors where the piece's openings or neck tubes meet it */
function ugRectRoom(b,p,r,h,y,o){const T=ugT(p);const c=[T(r.x0,r.z1),T(r.x1,r.z1),T(r.x1,r.z0),T(r.x0,r.z0)];
 /* anticlockwise seen from above (x right, z down the screen is +z): check and flip */
 let A=0;for(let i=0;i<4;i++){const a=c[i],d=c[(i+1)%4];A+=a[0]*d[1]-d[0]*a[1]}if(A<0)c.reverse();
 return ugRoom(b,c,y,h,o.doors||[],o)}

/* mine-coord doors for a room: openings and neck-tube ends that lie on its outline */
function ugDoorsFor(p,r,extra){const T=ugT(p),ds=[];const on=(x,z)=>(Math.abs(x-r.x0)<.05||Math.abs(x-r.x1)<.05)&&z>r.z0-.05&&z<r.z1+.05||(Math.abs(z-r.z0)<.05||Math.abs(z-r.z1)<.05)&&x>r.x0-.05&&x<r.x1+.05;
 const cand=[[0,0,2]].concat(p.d.ex.map(e=>[e[0],e[1],2]));for(const s of p.d.shp)if(s.k=='path')for(const q of[s.pts[0],s.pts[s.pts.length-1]])cand.push([q[0],q[1],s.w/2]);
 for(const q of cand.concat(extra||[]))if(on(q[0],q[1])){const w=T(q[0],q[1]);if(!ds.some(d=>Math.hypot(d.x-w[0],d.z-w[1])<.1))ds.push({x:w[0],z:w[1],hw:Math.min(2,q[2])})}
 return ds}

/* ---- the shaft stations: the room, the shaft with its landing gate, guides and a sump, and the version's dressing ---- */
function ugStationBuild(b,p,L,ctx){const y=UGLY(L),h=L==0?4.6:4.2,hs=L==0?8:6,r={x0:-hs,x1:hs,z0:-hs,z1:hs},v=p.d.v||0;
 const wall=L==0?['rock','plank','brick'][v]:'rock'+(L==0?'':L+1);
 const sh=1.6;/* the shaft: 3.2 m square, open through floor and roof */
 ugRectRoom(b,p,r,h,y,{doors:ugDoorsFor(p,r),wall,rock:L==0?'rock':'rock'+(L+1),floor:ugFL(L),holes:[{x0:-sh,x1:sh,z0:-sh,z1:sh,both:1}],roof:L==0&&v==2?'flat':'rock'});
 /* shaft lining: timber boards up 3 m above the roof and 1.5 m down into the sump, on all four sides; the -x side
    (where you step out) is open between the guides and has the landing gate */
 for(const [ax,az,yaw] of[[0,-sh,0],[sh,0,-Math.PI/2],[0,sh,Math.PI],[-sh,0,Math.PI/2]]){
  b.box('plank',3.2,1.6,.08,ax*1.03,y-.82,az*1.03,yaw);b.box('plank',3.2,3.2,.08,ax*1.03,y+h+1.62,az*1.03,yaw);
 }
 /* the sump floor, the corner guides (steel), a collar of timber round the hole at floor level */
 b.box('black',3.2,.1,3.2,0,y-1.6,0,0);
 for(const sx of[-1,1])for(const sz of[-1,1])b.box('steel',.12,h+4.8,.12,sx*1.48,y+(h+4.8)/2-1.6,sz*1.48,0);
 /* (the two along x run the full 3.8 m; the two along z fit between them, so the corners don't overlap) */
 for(const [ax,az,yaw] of[[0,-sh-.15,0],[sh+.15,0,Math.PI/2],[0,sh+.15,0],[-sh-.15,0,Math.PI/2]])b.box('wood',yaw?2*sh:2*sh+.6,.16,.3,ax,y+.08,az,yaw);
 /* the landing gate on the -x side: a steel frame with mesh, a sign LEVEL n over it, a call box with two lights */
 const gx=-sh-.32;b.box('steel',.08,2.3,.08,gx,y+1.15,-1.3,0);b.box('steel',.08,2.3,.08,gx,y+1.15,1.3,0);b.box('steel',.1,.1,2.7,gx,y+2.3,0,0);
 for(let k=-5;k<=5;k++)b.box('steel',.02,2.1,.02,gx,y+1.13,k*.24,0);b.box('steel',.03,.05,2.6,gx,y+.3,0,0);b.box('steel',.03,.05,2.6,gx,y+1.3,0,0);
 b.box('paintY',.06,.32,1.6,gx-.02,y+2.51,0,0);   /* the LEVEL board sits on the gate's top bar */
 /* the other three sides of the shaft are fenced with steel mesh at the landing */
 for(const [ax,az,yaw] of[[0,-sh-.02,0],[sh+.02,0,Math.PI/2],[0,sh+.02,0]]){b.box('steel',2.9,.06,.05,ax,y+2.2,az,yaw);b.box('steel',2.9,.06,.05,ax,y+.25,az,yaw);for(let k=-6;k<=6;k++){const o=k*.22;b.box('steel',.025,1.95,.025,ax+(yaw?0:o),y+1.22,az+(yaw?o:0),0)}}
 /* the call box stands on its own post beside the gate (it used to hang in the air) */b.box('steel',.12,.36,.26,gx-.1,y+1.35,1.75,0);b.box('steel',.06,1.17,.06,gx-.1,y+.585,1.75,0);b.box('steel',.2,.03,.2,gx-.1,y+.015,1.75,0);
 ctx.signs.push({x:gx-.06,y:y+2.51,z:0,yaw:-Math.PI/2,txt:'LEVEL '+(L+1),w:1.5});
 /* rails from each doorway towards the shaft, stopping at a buffer 2.4 m short */
 if(L==0)for(const d of ugDoorsFor(p,r)){const vx=-d.x,vz=-d.z,l=Math.hypot(vx,vz),ex=d.x+vx/l*(l-2.6),ez=d.z+vz/l*(l-2.6);
  const t=ugRailLine(b,[[d.x,d.z],[ex,ez]],y,ctx,0);ugBuffer(b,ex,y,ez,t.T[t.T.length-1][0],t.T[t.T.length-1][1],ctx)}
 /* the version's dressing */
 const T=ugT(p);
 for(const f of p.d.fx){if(f.k=='blk')for(const q of f.pts){const w=T(q[0],q[1]);ugProp(b,f.n,w[0],y,w[1],ugYaw(p,Math.atan2(q[0],q[1])),f.r||.5,ctx)}
  if(f.k=='cribs')for(const q of f.pts){const w=T(q[0],q[1]);ugCrib(b,w[0],y,w[1],h)}}
 /* every station: a bench, the shift clock and the level map board on the walls beside the gate side */
 /* on the -x wall, facing into the room (+x), each on a thick backing board that reaches into the rock */
 if(L==0){const w=T(-hs+.06,-4.6),w2=T(-hs+.06,4.6),yaw=ugYaw(p,Math.PI/2),n=ugRot(-1,0,p.r);
  for(const [q,yy,wd,ht] of[[w,y+2.2,1.3,.44],[w2,y+1.7,1.75,1.2]])b.box('board',wd,ht,.36,q[0]+n[0]*.17,yy,q[1]+n[1]*.17,yaw);
  ctx.signs.push({x:w[0]-n[0]*.02,y:y+2.2,z:w[1]-n[1]*.02,yaw,txt:'SHIFT 6:00',w:1.2,clock:1});ctx.signs.push({x:w2[0]-n[0]*.02,y:y+1.7,z:w2[1]-n[1]*.02,yaw,txt:'LEVEL 1 MAP',w:1.6,h:1.1,map:1})}
 /* big lamps on the roof */
 for(const q of[[-hs/2,-hs/2],[hs/2,hs/2],[hs/2,-hs/2],[-hs/2,hs/2]]){const w=T(q[0],q[1]);b.cyl('wire',.01,.01,.6,w[0],y+h-.3,w[1],4);b.cyl('steel',.16,.22,.12,w[0],y+h-.62,w[1],12);b.add('glass',new THREE.SphereGeometry(.1,10,8),new THREE.Matrix4().makeTranslation(w[0],y+h-.72,w[1]));ctx.lamps.push([w[0],y+h-.8,w[1],1.4])}
}
/* small props by name (stations and later rooms): simple, solid, sitting on the floor */
function ugProp(b,n,x,y,z,yaw,r,ctx){
 if(n=='bench'){b.box('wood',1.6,.08,.4,x,y+.46,z,yaw);for(const s of[-.65,.65])b.box('woodD',.08,.44,.36,x+Math.cos(yaw)*s,y+.22,z-Math.sin(yaw)*s,yaw);return}
 if(n=='tool board'){b.box('board',1.2,1.4,.06,x,y+1.4,z,yaw);for(let i=0;i<4;i++)b.box('steel',.05,.7,.04,x+Math.cos(yaw)*(-.4+i*.27),y+1.4,z-Math.sin(yaw)*(-.4+i*.27),yaw);b.box('woodD',.1,.7,.1,x,y+.35,z,yaw);return}
 if(n=='chute'){b.box('wood',1,2.6,.9,x,y+2.4,z,yaw);b.box('woodD',.9,.08,1.2,x,y+1.0,z,yaw,-.5);return}
 if(n=='tally office'){b.box('plank',1.3,2.3,1.3,x,y+1.15,z,yaw);b.box('black',.7,.5,.02,x,y+1.5,z+.66,yaw);return}
 if(n=='lamp post'){b.box('steel',.1,2.4,.1,x,y+1.2,z,0);b.add('glass',new THREE.SphereGeometry(.12,10,8),new THREE.Matrix4().makeTranslation(x,y+2.5,z));if(ctx)ctx.lamps.push([x,y+2.4,z,.9]);return}
 b.box('woodD',2*r*.8,.9,2*r*.8,x,y+.45,z,yaw)}
/* a timber crib: logs stacked square, floor to roof */
function ugCrib(b,x,y,z,h){for(let i=0;i<Math.floor(h/.32);i++){const yy=y+.16+i*.32;if(i%2){b.box('wood',1.5,.3,.3,x,yy,z-.6,0);b.box('wood',1.5,.3,.3,x,yy,z+.6,0)}else{b.box('wood',.3,.3,1.5,x-.6,yy,z,0);b.box('wood',.3,.3,1.5,x+.6,yy,z,0)}}}

/* ---- a junction (T or crossroads) or any rect-room piece without its own dressing yet ---- */
function ugJunction(b,p,L,ctx){const y=UGLY(L),r={x0:-4,x1:4,z0:-8,z1:0};ugRectRoom(b,p,r,3.9,y,{doors:ugDoorsFor(p,r)});
 const T=ugT(p);/* heavy timber: two posts and a beam across the middle */
 for(const q of[[-3.75,-.3],[3.75,-.3],[-3.75,-7.7],[3.75,-7.7]]){const w=T(q[0],q[1]);b.box('wood',.26,3.0,.26,w[0],y+1.5,w[1],0)}
 for(const zz of[-.3,-7.7]){const a=T(-3.9,zz),c=T(3.9,zz);b.box('wood',Math.hypot(c[0]-a[0],c[1]-a[1])+.01,.3,.3,(a[0]+c[0])/2,y+3.12,(a[1]+c[1])/2,ugYX(c[0]-a[0],c[1]-a[1]))}
 /* a turn plate in the middle; rails from every doorway to its edge */
 const c=T(0,-4),ed=ugRot(0,1,p.r);ugPlate(b,c[0],y,c[1],ctx,ed[0],ed[1]);for(const q of[[0,0]].concat(p.d.ex.map(e=>[e[0],e[1]]))){const w=T(q[0],q[1]),dx=c[0]-w[0],dz=c[1]-w[1],l=Math.hypot(dx,dz);ugRailLine(b,[w,[c[0]-dx/l*.85,c[1]-dz/l*.85]],y,ctx,0)}
 /* a signpost by the far wall, pointing back the way you came (to the cage) */
 const w=T(1.9,-6.6),dx=ugRot(1,0,p.r);ctx.posts.push({x:w[0],y,z:w[1],yaw:Math.atan2(dx[0],dx[1]),dist:ctx.dist(p)})}

/* ---- the pillar round: the drive goes round a solid ore pillar ---- */
function ugRound(b,p,L,ctx){const y=UGLY(L),T=ugT(p),r={x0:-10,x1:10,z0:-26,z1:-2},v=p.d.v||0,h=3.6;
 const pil={x0:-6,x1:6,z0:-22,z1:-6};const pc=[T(pil.x0,pil.z0),T(pil.x1,pil.z1)],pb={x0:Math.min(pc[0][0],pc[1][0]),x1:Math.max(pc[0][0],pc[1][0]),z0:Math.min(pc[0][1],pc[1][1]),z1:Math.max(pc[0][1],pc[1][1])};
 /* the necks in and out, and the doors where they meet the room */
 const tw=(a,c)=>[[T(a[0],a[1])[0],y,T(a[0],a[1])[1]],[T(c[0],c[1])[0],y,T(c[0],c[1])[1]]];
 ugTube(b,tw([0,0],[0,-2]),{fil:0,rails:true,ends:ctx.ends,sets:false});const hasOut=p.d.ex.some(e=>Math.abs(e[1]+28)<.1);if(hasOut)ugTube(b,tw([0,-26],[0,-28]),{fil:0,rails:true,ends:ctx.ends,sets:false});
 const extra=[[0,-2,2]].concat(hasOut?[[0,-26,2]]:[]);
 ugRectRoom(b,p,r,h,y,{doors:ugDoorsFor(p,r,extra),blocks:[pb]});
 /* the pillar's own walls, facing the drive (corners in the order that puts the rock inside the pillar) */
 ugRoom(b,[[pb.x0,pb.z1],[pb.x1,pb.z1],[pb.x1,pb.z0],[pb.x0,pb.z0]],y,h,[],{portal:false,noCap:1});
 /* timber: cribs in the four corners, square sets along the sides */
 for(const q of[[-8,-4],[8,-4],[8,-24],[-8,-24]]){const w=T(q[0],q[1]);ugCrib(b,w[0],y,w[1],h-.1)}
 for(const zz of[-9,-14,-19])for(const sx of[-1,1]){if(sx==1&&zz==-14&&p.d.ex.some(e=>Math.abs(Math.abs(e[0])-10)<.1))continue;const a=T(sx*6.25,zz),e=T(sx*9.75,zz);for(const q of[a,e])b.box('wood',.24,h-.4,.24,q[0],y+(h-.4)/2,q[1],0);b.box('wood',Math.hypot(e[0]-a[0],e[1]-a[1])+.3,.26,.26,(a[0]+e[0])/2,y+h-.27,(a[1]+e[1])/2,ugYX(e[0]-a[0],e[1]-a[1]))}
 /* rails: turn plates where lines meet (by the entry, by the exit, by a side door), lines along the drive between them;
    the rail-loop version runs a second line down the other side */
 const W=q=>T(q[0],q[1]),side=(p.d.ex.find(e=>Math.abs(Math.abs(e[0])-10)<.1)||[0])[0],sx=Math.sign(side);
 for(const [q,lx,lz] of[[[0,-4],0,1],[[0,-24],1,0]].concat(sx?[[[8*sx,-14],0,1]]:[])){const w=W(q),d=ugRot(lx,lz,p.r);ugPlate(b,w[0],y,w[1],ctx,d[0],d[1])}
 ugRailLine(b,[W([0,-2]),W([0,-3.15])],y,ctx,0);if(hasOut)ugRailLine(b,[W([0,-24.85]),W([0,-26])],y,ctx,0);
 for(const s2 of v==1?[1,-1]:[sx||1]){if(sx&&s2==sx){ugRailLine(b,[W([.85*s2,-4]),W([8*s2,-4]),W([8*s2,-13.15])],y,ctx);ugRailLine(b,[W([8*s2,-14.85]),W([8*s2,-24]),W([.85*s2,-24])],y,ctx);ugRailLine(b,[W([10*s2,-14]),W([8.85*s2,-14])],y,ctx,0)}
  else ugRailLine(b,[W([.85*s2,-4]),W([8*s2,-4]),W([8*s2,-24]),W([.85*s2,-24])],y,ctx)}
 /* veins on the pillar, about one per 3 m of face, facing out into the drive */
 const R=ugRng(p.id*31+5);for(const [ax,az,bx,bz,ox,oz] of[[-6,-6,6,-6,0,1],[6,-6,6,-22,1,0],[6,-22,-6,-22,0,-1],[-6,-22,-6,-6,-1,0]])for(let t=.12;t<.92;t+=.2+R()*.1){if(R()<.3)continue;const len=Math.hypot(bx-ax,bz-az),yv=.9+R()*1.1,fx0=ax+(bx-ax)*t,fz0=az+(bz-az)*t,w0=T(fx0,fz0);
   /* the pillar's walls are pushed into the pillar by the noise (ugRoom): follow them */const dd=.22*Math.min(1,t*len,(1-t)*len,h+.1-yv)*ugNoise(w0[0],y+yv,w0[1])+.06;
   const w=T(fx0-ox*dd,fz0-oz*dd),d=ugRot(ox,oz,p.r);ctx.veins.push({x:w[0],y:y+yv,z:w[1],dx:d[0],dz:d[1],t:R()<.2?'ag':R()<.5?'fe':'cu'})}
 /* the version's props */
 for(const f of p.d.fx)if(f.k=='blk')for(const q of f.pts){const w=T(q[0],q[1]);if(f.n=='cart')ugCart(b,w[0],y,w[1],ugYaw(p));else if(f.n=='ore bin')ugBin(b,w[0],y,w[1],ugYaw(p));}
 /* lamps */
 for(const q of[[0,-4],[0,-24],[-8,-14],[8,-14]]){const w=T(q[0],q[1]);b.cyl('steel',.07,.09,.08,w[0],y+h-.5,w[1],10);b.cyl('wire',.008,.008,.4,w[0],y+h-.25,w[1],4);b.add('glass',new THREE.SphereGeometry(.075,10,8),new THREE.Matrix4().makeTranslation(w[0],y+h-.6,w[1]));ctx.lamps.push([w[0],y+h-.65,w[1],1])}}
/* a buffer stop: a red-painted beam on two posts where the rails end */
function ugBuffer(b,x,y,z,dx,dz,ctx){const yaw=Math.atan2(-dx,-dz),bx=x-dx*.15,bz=z-dz*.15;b.box('paintR',.9,.3,.22,bx,y+.42,bz,yaw);for(const sd of[-.3,.3])b.box('woodD',.14,.4,.14,bx+dz*sd,y+.2,bz-dx*sd,yaw);if(ctx)ctx.plates.push([x,z,.3])}
function ugCart(b,x,y,z,yaw){b.box('steel',.9,.6,1.3,x,y+.62,z,yaw);b.box('rail',.94,.06,1.34,x,y+.92,z,yaw);for(const sx of[-.35,.35])for(const sz of[-.4,.4]){const c=Math.cos(yaw),s=Math.sin(yaw);b.cyl('rail',.16,.16,.08,x+c*sx+s*sz,y+.16,z-s*sx+c*sz,12,yaw,0,Math.PI/2)}}
function ugBin(b,x,y,z,yaw){b.box('wood',.9,1.3,.9,x,y+.65,z,yaw);b.box('oreRock',.82,.12,.82,x,y+1.28,z,yaw)}

/* ---- the ladderway: an upper landing with a hatch in the floor, a timbered raise with ladders and landings every
   3 m, a lower landing with the raise coming through its roof ---- */
/* part: 'up' (the upper landing, the raise and the ladder above the lower roof: built with the upper level) or 'down'
   (the lower landing and the ladder inside it: built with the lower level, so each level's group holds everything at
   its own depth); no part = both */
function ugLadder(b,p,ctx,part){const T=ugT(p),y0=UGLY(p.L),y1=UGLY(p.L+1),h=3.9,up=part!='down',dn=part!='up';
 /* the landings are full tunnel width (4 m) so the tunnels that meet them fit their doorways exactly */
 const H={x0:-.75,x1:.75,z0:-5.35,z1:-3.85};const hc=[T(H.x0,H.z0),T(H.x1,H.z1)],hole={x0:Math.min(hc[0][0],hc[1][0]),x1:Math.max(hc[0][0],hc[1][0]),z0:Math.min(hc[0][1],hc[1][1]),z1:Math.max(hc[0][1],hc[1][1])};
 /* upper landing: the doorway from the tunnel, the hatch in the floor */
 if(up)ugRectRoom(b,p,{x0:-2,x1:2,z0:-6.5,z1:0},h,y0,{doors:[{x:p.x,z:p.z,hw:2}],holes:[Object.assign({},hole)],rock:ugRK(p.L),floor:ugFL(p.L)});
 /* lower landing: the raise comes through its roof, a doorway out at the far end */
 const ex=T(0,-8);if(dn)ugRectRoom(b,p,{x0:-2,x1:2,z0:-8,z1:-1.5},h,y1,{doors:[{x:ex[0],z:ex[1],hw:2}],holes:[Object.assign({roof:1},hole)],rock:ugRK(p.L+1),floor:ugFL(p.L+1)});
 /* the raise: four plank walls from the lower roof to the upper floor, a ladder on one side, landings every 3 m */
 const top=y0-.02,bot=y1+h+.02,cx=(hole.x0+hole.x1)/2,cz=(hole.z0+hole.z1)/2,hx=(hole.x1-hole.x0)/2,hz=(hole.z1-hole.z0)/2,hgt=top-bot;
 if(up){b.box('plank',2*hx,hgt,.06,cx,bot+hgt/2,hole.z0-.03,0);b.box('plank',2*hx,hgt,.06,cx,bot+hgt/2,hole.z1+.03,0);b.box('plank',.06,hgt,2*hz,hole.x0-.03,bot+hgt/2,cz,0);b.box('plank',.06,hgt,2*hz,hole.x1+.03,bot+hgt/2,cz,0)}
 /* the ladder runs from the lower landing's floor, up through its roof and the raise, to 1.1 m above the upper floor */
 const lx=hole.x0+.12,lt=top+1.1;for(const sx of[-.22,.22]){if(dn)b.box('wood',.06,bot-y1,.06,lx,(y1+bot)/2,cz+sx,0);if(up)b.box('wood',.06,lt-bot,.06,lx,(bot+lt)/2,cz+sx,0)}for(let yy=y1+.29;yy<top+1;yy+=.3)if(yy<bot?dn:up)b.box('wood',.04,.04,.44,lx,yy,cz,0);   /* rungs end inside the rails */
 if(up)for(let yy=bot+3;yy<top-1;yy+=3)b.box('woodD',2*hx-.7,.06,2*hz,cx+.33,yy,cz,0);
 if(dn){const c=T(0,-5.6);ctx.lamps.push([c[0],y1+2.6,c[1],.7])}
 if(!up)return;
 /* a fence round the hatch upstairs */
 for(const [a,c] of[[[hole.x0,hole.z0],[hole.x1,hole.z0]],[[hole.x1,hole.z0],[hole.x1,hole.z1]],[[hole.x0,hole.z1],[hole.x1,hole.z1]]]){const dx=Math.abs(c[0]-a[0]),dz=Math.abs(c[1]-a[1]);b.box('wood',dx?dx+.06:.06,.06,dz?dz-.06:.06,(a[0]+c[0])/2,y0+1.0,(a[1]+c[1])/2,0);}   /* the side rail fits between the end rails */
 for(const q of[[hole.x0,hole.z0],[hole.x1,hole.z0],[hole.x1,hole.z1],[hole.x0,hole.z1]])b.box('wood',.07,1.04,.07,q[0],y0+.52,q[1],0);
 ctx.lamps.push([cx,y0+2.6,cz,.8])}

/* ---- the spiral decline: a tunnel that spirals a turn and a half down round a rock core, 12 m ---- */
function ugDecline(b,p,ctx){const T=ugT(p),y0=UGLY(p.L),drop=UGLY(p.L)-UGLY(p.L+1);
 const loc=[[0,0],[0,-8]].concat(ugArc(6,-8,6,Math.PI,4*Math.PI,54).slice(1)).concat([[12,0]]);
 const L=[0];for(let i=1;i<loc.length;i++)L.push(L[i-1]+Math.hypot(loc[i][0]-loc[i-1][0],loc[i][1]-loc[i-1][1]));const tot=L[L.length-1];
 const pts=loc.map((q,i)=>{const w=T(q[0],q[1]),u=Math.max(0,Math.min(1,(L[i]-1.5)/(tot-3)));return[w[0],y0-drop*u,w[1]]});
 ugTube(b,pts,{fil:0,rails:false,lampsOut:ctx.lamps,amp:.2,rock:ugRK(p.L),floorKey:ugFL(p.L)});
 const c=T(6,-8);ctx.decl.push({x:c[0],z:c[1],y0,drop})}

/* =====================================================================================================
   BUILD A LEVEL from the plan
   ===================================================================================================== */
function ugBuildLevel(plan,L,opt){opt=opt||{};const K=ugKit(),g=new THREE.Group(),b=ugBatch();
 const ctx={lamps:[],veins:[],signs:[],posts:[],decl:[],ends:[],plates:[],solids:[],moving:[],pickups:[],hot:[],dist:null};
 /* distance to the cage along the parent chain (for signposts) */
 const len=p=>{let s=0;for(const sh of p.d.shp)if(sh.k=='path')for(let i=1;i<sh.pts.length;i++)s+=Math.hypot(sh.pts[i][0]-sh.pts[i-1][0],sh.pts[i][1]-sh.pts[i-1][1]);return s||8};
 const memo={};ctx.dist=p=>{if(p.st)return 0;if(memo[p.id]!=null)return memo[p.id];const par=plan.P[p.par];memo[p.id]=par?ctx.dist(par)+len(par):0;return memo[p.id]};
 const y=UGLY(L);
 for(const p of plan.P){
  const here=p.L==L,above=p.d.both&&p.L+1==L;if(!here&&!(above&&p.type=='ladder'))continue;
  const t=p.type;
  if(p.st){ugStationBuild(b,p,L,ctx);continue}
  if(t=='decline'){ugDecline(b,p,ctx);continue}
  if(t=='ladder'){ugLadder(b,p,ctx,here?(opt.links?null:'up'):'down');continue}
  if(t=='tee'||t=='cross'){ugJunction(b,p,L,ctx);continue}
  if(t=='round'){ugRound(b,p,L,ctx);continue}
  if(typeof ugPieceL2=='function'&&ugPieceL2(b,p,L,ctx))continue;   /* levels 2 and 3 (quarry-under-l2.js, -l3.js) */
  if(t=='old')continue;
  /* tunnels (drive, bend, collapsed, dug joins) and, for now, the rooms of batch 2 as plain shells */
  const W=ugWorld(p);
  for(const s of W.shp){
   if(s.k=='path'&&s.w<3.99){const op=ugOpenings(p);for(const [q,nb] of[[s.pts[0],s.pts[1]],[s.pts[s.pts.length-1],s.pts[s.pts.length-2]]]){if(!op.some(o=>Math.hypot(o.x-q[0],o.z-q[1])<.05))continue;const fx=q[0]-nb[0],fz=q[1]-nb[1],l=Math.hypot(fx,fz);ugBulkhead(b,q[0],y,q[1],fx/l,fz/l,s.w/2)}}
   if(s.k=='path'){const tr=ugTube(b,s.pts.map(q=>[q[0],y,q[1]]),{hw:Math.min(2,s.w/2),fil:t=='join'?3:0,rails:true,ends:ctx.ends,lampsOut:ctx.lamps,lampOff:p.id%2,broken:t=='collapsed'});
    /* a vein every 6 m or so, on alternate walls */
    if(t=='collapsed'&&typeof ugCollapsed=='function')ugCollapsed(b,p,y,ctx,tr);
    const R=ugRng(p.id*977+13);for(let sd=3+R()*3;sd<tr.L-2;sd+=5+R()*4){const side=R()<.5?-1:1,hi=R()<.5;if(R()<.35)continue;const sc=sd-((sd-1.5)%3+3)%3+1.5;const s2=Math.abs(sd-sc)<.6?sc+1.5:sd;/* not behind a timber set */
     const w=ugTubeWall(tr,ugTubeRing(tr,s2),side<0?(hi?2:1):(hi?12:13));ctx.veins.push({x:w.x,y:w.y,z:w.z,dx:w.dx,dz:w.dz,t:R()<.15?'ag':R()<.55?'fe':'cu'})}}
   else if(s.k=='rect'&&typeof ugRoomL1=='function'&&ugRoomL1(b,p,L,ctx)){}   /* the dressed rooms of batch 2 (quarry-under-l1.js) */
   else if(s.k=='rect'){const lr=p.d.shp.find(q=>q.k=='rect');const r={x0:lr.x0,x1:lr.x1,z0:lr.z0,z1:lr.z1};ugRectRoom(b,p,r,t=='stope'?5.5:3.6,y,{doors:ugDoorsFor(p,r)})}}
 }
 /* working faces at the ends where nothing fitted */
 for(const o of plan.open)if(o.cap&&o.L==L){const par=plan.P[o.par];if(!par)continue;const hw=2;const sp=ugFace(b,o.x,y,o.z,o.dir,hw,{rock:ugRK(L),floor:ugFL(L)});const R=ugRng(Math.round(o.x*13+o.z*7));for(const q of sp)if(R()<.8)ctx.veins.push({x:q[0],y:q[1],z:q[2],dx:q[3],dz:q[4],t:R()<.25?'ag':R()<.6?'fe':'cu'})}
 /* rail ends that meet nothing (another rail end, a turn plate, a buffer) get a buffer stop */
 for(const e of ctx.ends){if(ctx.ends.some(f=>f!==e&&Math.hypot(f.x-e.x,f.z-e.z)<.06&&Math.abs(f.y-e.y)<.1))continue;if(ctx.plates.some(q=>Math.hypot(q[0]-e.x,q[1]-e.z)<(q[2]||1.0)))continue;ugBuffer(b,e.x,e.y,e.z,e.dx,e.dz,ctx)}
 b.build(g,K.mat);
 /* moving parts (doors) are their own groups, pivoting where they hinge */
 for(const m of ctx.moving)g.add(m);
 /* things you can pick up (batch 5: lunchbox, tags, fossils, dynamite) are their own groups too */
 for(const m of ctx.pickups)g.add(m);
 /* veins */
 const R=ugRng(4242+L);for(const v of ctx.veins){const m=ugVein(v.t,R);m.position.set(v.x,v.y,v.z);
  m.rotation.y=Math.atan2(-v.dx,-v.dz);   /* the nuggets (local -z) face along (dx,dz), out of the rock */
  g.add(m)}
 /* signposts and wall signs */
 /* a signpost's board faces both side arms; the arrow points back towards the entry, the way to the cage */
 for(const s of ctx.posts){const d=Math.max(5,Math.round(s.dist/5)*5);const sg=ugSign(s.x,s.y,s.z,s.yaw,'⬅ CAGE '+d+' m','CAGE '+d+' m ➡');g.add(sg)}
 for(const s of ctx.signs){const sw=s.w||1.2,sh=s.h||.34,t=s.map&&typeof ugMapTex=='function'?ugMapTex(plan,L,{here:[s.x,s.z],ar:sw/sh}):ugSignTex(s.txt,sw/sh);const m=new THREE.Mesh(new THREE.PlaneGeometry(sw,sh),new THREE.MeshStandardMaterial({map:t,roughness:.8}));m.position.set(s.x,s.y,s.z);m.rotation.y=s.yaw;m.userData.noSeam=true;g.add(m)}
 return{g,lamps:ctx.lamps,veins:ctx.veins,decl:ctx.decl,solids:ctx.solids,moving:ctx.moving,pickups:ctx.pickups,hot:ctx.hot,portal:ctx.portal||null}}

/* ---------------- docs/design/models/quarry-under-l1.js ---------------- */
/* =====================================================================================================
   The Old Quarry underground, batch 2: THE LEVEL 1 ROOMS (docs/design/quarry-underground.md).
   Needs quarry-under.js and quarry-under-kit.js. ugBuildLevel calls ugRoomL1(b, p, L, ctx) for a room's rectangle
   (the neck tunnel and its bulkhead are built by the kit) and ugCollapsed(...) after a collapsed drift's tunnel.
   Everything is placed in the piece's own coordinates (entry at 0,0, the room runs towards -z) through ugLocal, which
   turns it into mine coordinates. The positions of the solid things come from the plan's versions (UGV), which the
   room checker (quarry-under-check.js) tests; mirrored pieces have their data mirrored already, and hand-placed
   extras use mx (-1 when mirrored).
   ===================================================================================================== */
function ugLocal(b,p,y){const Mp=new THREE.Matrix4().makeTranslation(p.x,y,p.z).multiply(new THREE.Matrix4().makeRotationY(-p.r*Math.PI/2));
 const M=(x,yy,z,ry,rx,rz,sx,sy,sz)=>Mp.clone().multiply(new THREE.Matrix4().compose(new THREE.Vector3(x,yy,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0,'YXZ')),new THREE.Vector3(sx||1,sy||1,sz||1)));
 const mx=p.d.mir?-1:1;
 return{M,mx,
  box:(k,w,h,d,x,yy,z,ry,rx,rz)=>b.add(k,new THREE.BoxGeometry(w,h,d),M(x,yy,z,ry,rx,rz)),
  cyl:(k,r0,r1,h,x,yy,z,seg,ry,rx,rz)=>b.add(k,new THREE.CylinderGeometry(r0,r1,h,seg||12),M(x,yy,z,ry,rx,rz)),
  geo:(k,g,x,yy,z,ry,rx,rz,sx,sy,sz)=>b.add(k,g,M(x,yy,z,ry,rx,rz,sx,sy,sz)),
  pt:(x,yy,z)=>new THREE.Vector3(x,yy,z).applyMatrix4(Mp),
  dir:(x,z)=>ugRot(x,z,p.r),
  yaw:a=>-p.r*Math.PI/2+a}}

/* turn a geometry inside out (pit and shaft walls are seen from inside) */
function ugInside(g){g=g.index?g.toNonIndexed():g;const P=g.attributes.position.array,N=g.attributes.normal.array,U=g.attributes.uv.array;
 for(let i=0;i<P.length;i+=9)for(let k=0;k<3;k++){let t=P[i+3+k];P[i+3+k]=P[i+6+k];P[i+6+k]=t;t=N[i+3+k];N[i+3+k]=N[i+6+k];N[i+6+k]=t}
 for(let i=0;i<U.length;i+=6)for(let k=0;k<2;k++){const t=U[i+2+k];U[i+2+k]=U[i+4+k];U[i+4+k]=t}for(let i=0;i<N.length;i++)N[i]=-N[i];return g}
/* a rocky lip round a hole in the floor (covers the seam between the floor's edge and the hole's wall) */
function ugLip(L,cx,cz,rx,rz,inner){const g=new THREE.RingGeometry(inner||.9,1.12,48);g.rotateX(-Math.PI/2);const sx=rx,sz=rz;L.geo('oreRock',g,cx,.012,cz,0,0,0,sx,1,sz)}
/* ore veins along a room's walls: every `gap` metres or so, skipping doorways and corners. r: the room rect (local),
   doors: local [x,z] points on the outline, ys: [min,max] height, types: weights. Returns nothing; pushes to ctx.veins */
function ugWallVeins(L,r,doors,ctx,R,o){o=o||{};const gap=o.gap||3,ys=o.ys||[.9,2.1],pick=o.pick||(()=>R()<.15?'ag':R()<.55?'fe':'cu'),H=o.h||3.4,amp=o.amp==null?.22:o.amp;
 const walls=[[r.x0,r.z1,r.x1,r.z1,0,-1],[r.x1,r.z1,r.x1,r.z0,-1,0],[r.x1,r.z0,r.x0,r.z0,0,1],[r.x0,r.z0,r.x0,r.z1,1,0]];
 for(const [ax,az,bx,bz,ix,iz] of walls){const len=Math.hypot(bx-ax,bz-az);for(let t=1.2;t<len-1.2;t+=gap*(.7+R()*.6)){
  const x=ax+(bx-ax)*t/len,z=az+(bz-az)*t/len;if(doors.some(d=>Math.hypot(d[0]-x,d[1]-z)<2.8))continue;if(R()<(o.skip||.25))continue;
  const yy=ys[0]+R()*(ys[1]-ys[0]);
  /* the wall is pushed out by the noise as ugRoom does it (less near corners, doorways, floor and roof): follow it */
  let dm=Math.min(t,len-t,(yy+.1)*2,H+.1-yy);for(const q of doors){const tq=(q[0]-ax)*(bx-ax)/len+(q[1]-az)*(bz-az)/len,pq=Math.abs((q[0]-ax)*(bz-az)/len-(q[1]-az)*(bx-ax)/len);if(pq<.1)dm=Math.min(dm,Math.max(0,Math.abs(t-tq)-2))}
  const w0=L.pt(x,yy,z),dd=amp*Math.min(1,dm)*Math.min(1,yy/.7)*ugNoise(w0.x,w0.y,w0.z)+.06,w=L.pt(x-ix*dd,yy,z-iz*dd),d=L.dir(ix,iz);ctx.veins.push({x:w.x,y:w.y,z:w.z,dx:d[0],dz:d[1],t:pick(),big:o.big&&R()<o.big?1:0})}}}
/* the doors of a room in local coords: the piece's openings and neck ends that lie on the rect */
function ugLocalDoors(p,r){const on=(x,z)=>(Math.abs(x-r.x0)<.05||Math.abs(x-r.x1)<.05)&&z>r.z0-.05&&z<r.z1+.05||(Math.abs(z-r.z0)<.05||Math.abs(z-r.z1)<.05)&&x>r.x0-.05&&x<r.x1+.05;
 const c=[[0,0]].concat(p.d.ex.map(e=>[e[0],e[1]]));for(const s of p.d.shp)if(s.k=='path')for(const q of[s.pts[0],s.pts[s.pts.length-1]])c.push(q);return c.filter(q=>on(q[0],q[1]))}
/* a lamp hanging from the roof on a wire, local coords */
function ugHangLamp(L,ctx,x,z,y0,top,str){L.cyl('wire',.008,.008,top-y0-.2,x,(top+y0+.2)/2,z,4);L.cyl('steel',.08,.11,.1,x,y0+.15,z,10);L.geo('glass',new THREE.SphereGeometry(.09,10,8),x,y0+.05,z);const w=L.pt(x,y0,z);ctx.lamps.push([w.x,w.y,w.z,str||1])}
/* a pile of loose rock (rubble or broken ore): a low mound and stones on it */
function ugPile(L,R,x,z,rx,rz,h,key){const m=new THREE.SphereGeometry(1,14,7,0,Math.PI*2,0,Math.PI/2);L.geo(key||'oreRock',m,x,0,z,0,0,0,rx,h,rz);
 for(let i=0;i<Math.round(rx*rz*3);i++){const a=R()*6.28,rr=Math.sqrt(R())*.85,px=x+Math.cos(a)*rx*rr,pz=z+Math.sin(a)*rz*rr,py=h*Math.sqrt(Math.max(0,1-rr*rr))*.92;const s=.12+R()*.22;L.geo(key||'oreRock',new THREE.DodecahedronGeometry(s,0),px,py,pz,R()*3,R()*3,0)}}
/* deep water in a hole in the floor (local coords). q: the hole's ellipse {cx,cz,rx,rz}.
   o.bowl: a basin that shelves down from the edge (a stope pool); otherwise straight sides (a sump, o.dep deep).
   The surface sits o.surf below the floor, so a band of wet rock shows above it; darker layers below it make the
   middle look deep. */
function ugPool(L,q,o){o=o||{};const surf=o.surf==null?-.25:o.surf,dep=o.dep||2.3;let rAt;
 const wr=o.rock||'wetRock';
 if(o.bowl||o.prof){const pr=o.prof||[[1,0],[.97,-.15],[.9,-.38],[.82,-.55],[.62,-1.15],[.42,-1.7],[.2,-2.1],[0,-dep]];
  rAt=d=>{for(let i=1;i<pr.length;i++)if(d>=pr[i][1]){const a=pr[i-1],b=pr[i],t=(d-a[1])/(b[1]-a[1]);return a[0]+(b[0]-a[0])*t}return 0};
  const g=new THREE.LatheGeometry(pr.map(p=>new THREE.Vector2(p[0],p[1])),48);const uv=g.attributes.uv,per=Math.PI*(q.rx+q.rz)/4;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*per,uv.getY(i)*1.6);
  L.geo(wr,g,q.cx,0,q.cz,0,0,0,q.rx,1,q.rz)}
 else{rAt=()=>1;L.geo(wr,new THREE.CircleGeometry(1,28),q.cx,-dep,q.cz,0,-Math.PI/2,0,q.rx,1,q.rz)}
 /* the surface (o.hole: a local polygon cut out of it, e.g. an island standing in the water) */
 const sr=o.sr||rAt(surf)*1.01;if(o.hole){const sh=new THREE.Shape();sh.absellipse(q.cx,-q.cz,q.rx*sr,q.rz*sr,0,Math.PI*2,false,0);const hp=new THREE.Path();o.hole.forEach((v,i)=>i?hp.lineTo(v[0],-v[1]):hp.moveTo(v[0],-v[1]));sh.holes.push(hp);
  const g=new THREE.ShapeGeometry(sh,48);g.rotateX(-Math.PI/2);const pa=g.attributes.position,uv=[];for(let i=0;i<pa.count;i++)uv.push(pa.getX(i)/(2*q.rx*sr)+.5,pa.getZ(i)/(2*q.rz*sr)+.5);g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));L.geo(o.key||'pool',g,0,surf,0)}
 else L.geo(o.key||'pool',new THREE.CircleGeometry(1,64),q.cx,surf,q.cz,0,-Math.PI/2,0,q.rx*sr,q.rz*sr,1);
 if(dep>.6&&o.layers!==false)for(const f of[.12,.26,.4,.54,.68,.82]){const d=surf+(-dep-surf)*f,r=rAt(d)*1.03;if(r>.05)L.geo('poolD',new THREE.CircleGeometry(1,48),q.cx,d,q.cz,0,-Math.PI/2,0,q.rx*r,q.rz*r,1)}}
/* a plain sign on a backing board against a wall: local position on the wall, (ix,iz) pointing into the room */
function ugWallSign(L,ctx,x,yy,z,ix,iz,txt,w){const a=Math.atan2(ix,iz);L.box('board',w+.1,.44,.3,x-ix*.13,yy,z-iz*.13,a);const p=L.pt(x+ix*.025,yy,z+iz*.025);ctx.signs.push({x:p.x,y:p.y,z:p.z,yaw:L.yaw(a),txt,w})}

/* ---------- the rooms ---------- */
function ugRoomL1(b,p,Lv,ctx){const t=p.type,v=p.d.v||0,y=UGLY(Lv);
 const lr=p.d.shp.find(q=>q.k=='rect');if(!lr)return false;const r={x0:lr.x0,x1:lr.x1,z0:lr.z0,z1:lr.z1};
 const L=ugLocal(b,p,y),R=ugRng(p.id*7919+v*31+11),mx=L.mx,doors=ugLocalDoors(p,r),fx=k=>p.d.fx.filter(f=>f.k==k);
 const room=(h,o)=>ugRectRoom(b,p,r,h,y,Object.assign({doors:ugDoorsFor(p,r)},o||{}));
 /* mine-coord rect holes from local rects, mine-coord pits from local ellipses */
 const lrect=(x0,x1,z0,z1)=>{const a=L.pt(x0,0,z0),c=L.pt(x1,0,z1);return{x0:Math.min(a.x,c.x),x1:Math.max(a.x,c.x),z0:Math.min(a.z,c.z),z1:Math.max(a.z,c.z)}};
 const lpit=(cx,cz,rx,rz)=>{const c=L.pt(cx,0,cz),sw=p.r%2==1;return{cx:c.x,cz:c.z,rx:sw?rz:rx,rz:sw?rx:rz}};

 if(t=='stope'){const h=5.5;
  const pit=fx('pit')[0]||fx('water').find(w=>w.deep),sun=fx('sun')[0];
  room(h,{pits:pit?[lpit(pit.cx,pit.cz,pit.rx,pit.rz)]:[],holes:sun?[Object.assign({roof:1},lrect(-1.6,1.6,-11.6,-8.4))]:[],floor:v==5?'fill':'floor'});
  for(const q of[[-3,-6],[3,-14]])ugHangLamp(L,ctx,q[0]*mx,q[1],3.4,h,1.2);
  if(v==0){for(const f of fx('cribs'))for(const q of f.pts)ugCrib(L.box?{box:(k,w,hh,d,x,yy,z,ry)=>L.box(k,w,hh,d,x,yy-y,z,ry)}:b,q[0],y,q[1],h);
   /* rough rock benches along the long walls */
   for(const sd of[-1,1])for(let z=-4.5;z>-16;z-=3.6){const w=.9+R()*.5,hh=.6+R()*.5;L.box('rock',w,hh,3.2,sd*(7-w/2+.05),hh/2,z,0)}}
  if(v==1){const m=fx('muck')[0];ugPile(L,R,m.cx,m.cz,m.rx,m.rz,1.8);
   const lg0=fx('ledge')[0],lsd=Math.abs(lg0.x0-r.x0)<Math.abs(lg0.x1-r.x1)?-1:1;/* the ledge runs back into the wall (no slit behind it) */
   const lg={x0:lsd<0?r.x0-.3:lg0.x0,x1:lsd<0?lg0.x1:r.x1+.3,z0:lg0.z0,z1:lg0.z1},lw=lg.x1-lg.x0,lc=(lg.x0+lg.x1)/2,ld=lg.z1-lg.z0,lcz=(lg.z0+lg.z1)/2,lh=2.4;L.box('rock',lw,lh,ld,lc,lh/2,lcz,0);L.box('floor',lw-.1,.02,ld-.1,lc,lh+.01,lcz,0);
   /* a timber ladder leaning from the floor to the ledge's edge */
   const ld2=fx('ladder2')[0],edge=Math.abs(lg.x0-ld2.x)<Math.abs(lg.x1-ld2.x)?lg.x0:lg.x1,th=Math.atan2(ld2.x-edge,lh),len=Math.hypot(ld2.x-edge,lh)+.35;
   for(const sd of[-.25,.25])L.box('wood',.07,len,.07,ld2.x-Math.sin(th)*len/2,Math.cos(th)*len/2,ld2.z+sd,0,0,th);for(let yy=.3;yy<lh+.2;yy+=.3)L.box('wood',.05,.05,.56,ld2.x-Math.tan(th)*yy,yy,ld2.z,0);
   /* rich veins on the room's wall above the ledge */
   {const wx=lsd<0?r.x0:r.x1;for(let z=lg.z1-1;z>lg.z0+.8;z-=1.6+R()*.6){const yy=lh+.6+R()*1.2,w0=L.pt(wx,yy,z),dm=Math.min(1,5.6-yy,Math.abs(z-r.z0),Math.abs(z-r.z1)),dd=.22*dm*ugNoise(w0.x,w0.y,w0.z)+.06,w=L.pt(wx+lsd*dd,yy,z),d=L.dir(-lsd,0);ctx.veins.push({x:w.x,y:w.y,z:w.z,dx:d[0],dz:d[1],t:R()<.4?'au':'ag'})}}}
  if(v==2){const sh=lrect(-1.6,1.6,-11.6,-8.4),cx=(sh.x0+sh.x1)/2,cz=(sh.z0+sh.z1)/2,top=y+h,H=9;
   /* the raise up to daylight: four rock walls, a bright opening at the top, a beam of light to the floor */
   for(const [ax,az,w,ry] of[[0,-11.6,3.2,0],[0,-8.4,3.2,Math.PI],[-1.6,-10,3.2,Math.PI/2],[1.6,-10,3.2,-Math.PI/2]]){L.geo('rock',new THREE.PlaneGeometry(w,H),ax,h+H/2,az,ry)}
   L.geo('sky',new THREE.PlaneGeometry(3.2,3.2),0,h+H,-10,0,Math.PI/2);
   const beam=new THREE.CylinderGeometry(1.25,1.55,h+H-.1,20,1,true);L.geo('beam',beam,0,(h+H)/2,-10);L.geo('beam',new THREE.CircleGeometry(1.6,24),0,.015,-10,0,-Math.PI/2);
   const w=L.pt(0,h+1,-10);ctx.lamps.push([w.x,w.y,w.z,2.2]);
   for(const f of fx('cribs'))for(const q of f.pts)ugCrib({box:(k,ww,hh,d,x,yy,z,ry)=>L.box(k,ww,hh,d,x,yy-y,z,ry)},q[0],y,q[1],h)}
  if(v==3){const wf=fx('water')[0];ugPool(L,wf,{bowl:1,surf:-.25,dep:2.3});ugLip(L,wf.cx,wf.cz,wf.rx,wf.rz,.995);
   for(let i=0;i<26;i++){const a=i/26*6.28,s=.18+R()*.2;L.geo('oreRock',new THREE.DodecahedronGeometry(s,0),wf.cx+Math.cos(a)*(wf.rx+.15),s*.5,wf.cz+Math.sin(a)*(wf.rz+.15),R()*3,R()*3,0)}
   const wk=fx('walk')[0],a=wk.pts[0],c=wk.pts[1];for(let z=a[1]-.2;z>c[1]+.2;z-=.3)L.box('woodD',1.1,.05,.26,a[0],.17,z,0);for(let z=a[1]-.5;z>c[1];z-=2)for(const sd of[-.5,.5])L.box('wood',.1,.14,.1,a[0]+sd,.07,z,0)}
  if(v==4){const pt=fx('pit')[0],D=7;
   /* the open stope: a round shaft of rock going down, a dark floor far below, a catwalk across on beams */
   L.geo('rock',ugInside(new THREE.CylinderGeometry(pt.rx+.06,pt.rx*.92,D,40,4,true)),pt.cx,-D/2,pt.cz);ugLip(L,pt.cx,pt.cz,pt.rx,pt.rz);
   L.geo('black',new THREE.CircleGeometry(pt.rx*.92,32),pt.cx,-D,pt.cz,0,-Math.PI/2);
   const wk=fx('walk')[0],z0=wk.pts[0][1],z1=wk.pts[1][1];for(let z=z0;z>z1-.01;z-=.25)L.box('woodD',1.2,.06,.22,0,.005,z-.11,0);
   for(let z=pt.cz+pt.rz-.6;z>pt.cz-pt.rz+.5;z-=2.4){L.box('wood',2*Math.sqrt(Math.max(0,pt.rx*pt.rx-(z-pt.cz)**2))+.6,.22,.22,0,-.2,z,0);}
   for(const sd of[-.66,.66]){L.box('wood',.06,.06,z0-z1,sd,1.0,(z0+z1)/2,0);for(let z=z0-.1;z>z1;z-=1.6)L.box('wood',.07,1.0,.07,sd,.5,z,0)}
   for(let i=0;i<30;i++){const a=i/30*6.28,s=.15+R()*.18;L.geo('oreRock',new THREE.DodecahedronGeometry(s,0),pt.cx+Math.cos(a)*(pt.rx+.2),s*.45,pt.cz+Math.sin(a)*(pt.rz+.2),R()*3,R()*3,0)}}
  if(v==5){const ch=fx('blk').find(f=>f.n=='chute').pts[0],wi=fx('blk').find(f=>f.n=='winch').pts[0];
   L.box('wood',.9,h-.4,1,ch[0],(h-.4)/2,ch[1],0);L.box('woodD',.8,.06,1.3,ch[0]+mx*.6,1.1,ch[1],0,0,mx*.6);
   L.box('dark',1.4,.25,1.4,wi[0],.125,wi[1],0);L.cyl('steel',.38,.38,1.1,wi[0],.75,wi[1],16,0,0,Math.PI/2);L.box('dark',.5,.5,.6,wi[0],.5,wi[1]-.75*mx,0);
   const an=[-6.6*mx,-4],dx=an[0]-wi[0],dz=an[1]-wi[1],l=Math.hypot(dx,dz);L.box('wire',.025,.025,l,(an[0]+wi[0])/2,.12,(an[1]+wi[1])/2,Math.atan2(dx,dz));L.cyl('steel',.08,.08,.4,an[0],.2,an[1],8)}
  /* veins: lots in a stope, and a big seam in some versions */
  ugWallVeins(L,r,doors,ctx,R,{gap:1.9,ys:[.9,2.6],skip:.2,big:[0,3,5].includes(v)?.12:0,h:5.5});
  return true}

 if(t=='crib'){const h=3.4;room(h);ugHangLamp(L,ctx,0,-6,2.5,h,1.1);
  const blk=n=>(fx('blk').find(f=>f.n==n)||{pts:[]}).pts;
  if(v==0){const tb=blk('table')[0];L.box('wood',.8,.06,1.3,tb[0],.78,tb[1],0);for(const q of[[-.32,-.55],[.32,-.55],[-.32,.55],[.32,.55]])L.box('woodD',.07,.75,.07,tb[0]+q[0],.375,tb[1]+q[1],0);
   for(const sd of[-.72,.72]){L.box('wood',.3,.05,1.3,tb[0]+sd,.46,tb[1],0);for(const dz of[-.5,.5])L.box('woodD',.06,.44,.24,tb[0]+sd,.22,tb[1]+dz,0)}
   for(let i=0;i<4;i++){L.cyl('steel',.09,.09,.12,tb[0]+(R()-.5)*.5,.87,tb[1]-.55+i*.17,10)}   /* the mugs stay clear of the lunch tin */ctx.pickups.push(ugPut(L,ugLunchbox(),tb[0]+.15,.81,tb[1]+.3,.3));
   const st=blk('stove')[0];L.box('dark',.6,.8,.5,st[0],.4,st[1],0);L.cyl('dark',.07,.07,h-.8,st[0],.8+(h-.8)/2,st[1],10);L.cyl('steel',.12,.1,.18,st[0]-.1,.905,st[1]+.05,12);
   L.box('wood',.3,.04,1.6,-3.82*mx,1.5,-4.5,0);for(let i=0;i<5;i++)L.cyl('steel',.07,.07,.11,-3.82*mx,1.58,-3.9-i*.3,10);ugWallSign(L,ctx,0,1.8,-9.98+.0,0,1,'SAFETY FIRST',1.4)}
  if(v==1){for(const q of blk('rack').length?blk('rack'):fx('racks')[0].pts){L.box('wood',.5,1.8,.9,q[0],.9,q[1],0);for(let k=0;k<3;k++)for(let j=-1;j<=1;j++){L.box('woodD',.46,.03,.86,q[0],.5+k*.5,q[1],0);L.geo('lampG',new THREE.SphereGeometry(.06,8,6),q[0]+(q[0]>0?-.12:.12),.6+k*.5,q[1]+j*.26)}}
   L.box('board',2,1.2,.08,0,1.7,-9.93,0);/* the brass tags on their board; one of them you can take: number 17 */const sp=R()*24|0;for(let i=0;i<6;i++)for(let j=0;j<4;j++){if(i*4+j==sp){ctx.pickups.push(ugPut(L,ugTag(17,'HARLAN'),-.75+i*.3,1.3+j*.26,-9.887));continue}L.cyl('brass',.06,.06,.02,-.75+i*.3,1.3+j*.26,-9.88,10,0,Math.PI/2)}}
  if(v==2){const d=fx('desk')[0];L.box('woodD',1.4,.06,.7,d.x,.76,d.z,0);for(const q of[[-.62,-.28],[.62,-.28],[-.62,.28],[.62,.28]])L.box('woodD',.06,.73,.06,d.x+q[0],.365,d.z+q[1],0);
   L.box('paper',.5,.01,.36,d.x-.2,.795,d.z,.2);L.box('red',.24,.05,.32,d.x+.35,.815,d.z+.05,-.1);L.box('wood',.45,.05,.45,d.x,.46,d.z+.7,0);L.box('wood',.45,.5,.05,d.x,.72,d.z+.92,0);
   const sf=blk('safe')[0];L.box('dark',.8,.9,.7,sf[0],.45,sf[1],0);L.cyl('brass',.08,.08,.04,sf[0],.55,sf[1]+.36,12,0,Math.PI/2);
   L.box('dark',.5,1.3,.5,-3.6*mx,.65,-4.6,0);ugWallSign(L,ctx,3.98*mx,1.9,-5,-mx,0,'MINE PLAN',1.6)}
  if(v==3){const sr=blk('stretcher')[0];for(const dz of[-.75,.75]){L.box('woodD',.6,.05,.08,sr[0],.62,sr[1]+dz,0);for(const sd of[-.25,.25])L.box('woodD',.05,.6,.05,sr[0]+sd,.3,sr[1]+dz,0)}L.box('cloth',.56,.05,1.9,sr[0],.67,sr[1],0);
   const cb=blk('cabinet')[0];L.box('white',.8,1.6,.5,cb[0],.8,cb[1],0);L.box('red',.3,.08,.02,cb[0],1.2,cb[1]+.26,0);L.box('red',.08,.3,.02,cb[0],1.2,cb[1]+.26,0);L.box('red',.36,.2,.24,cb[0],1.7,cb[1],0)}
  ugWallVeins(L,r,doors,ctx,R,{gap:3.5,skip:.55});
  return true}

 if(t=='magazine'){const h=3.4;room(h);ugHangLamp(L,ctx,0,-6.6,2.6,h,.9);
  /* the heavy door, swung open flat against the inside of the front wall */
  L.box('wood',1.9,2.4,.1,-1.98*mx,1.21,-3.12,0);for(const yy of[.5,1.9])L.box('dark',1.9,.12,.02,-1.98*mx,yy,-3.18,0);
  const crate=(x,z,s)=>{const yw=R()*.2;L.box('wood',.8,.65,.8,x,.325+(s||0),z,yw);L.box('red',.6,.02,.02,x,.5+(s||0),z+.41,0);return yw};
  const blk=n=>(fx('blk').find(f=>f.n==n)||{pts:[]}).pts;
  /* the first crate has an open box of dynamite on it (you can take sticks from it) */blk('crate').forEach((q,i)=>{const yw=crate(q[0],q[1]);if(i==0)ctx.pickups.push(ugPut(L,ugDynCrate(9),q[0]-.06*Math.cos(yw),.65,q[1]+.06*Math.sin(yw),yw));else if(v==0&&R()<.7)crate(q[0],q[1],.65)});
  if(v==0){ugWallSign(L,ctx,0,2.1,-8.98,0,1,'DANGER · EXPLOSIVES',1.8);L.box('wood',1.8,.04,.4,2.6*mx,1.4,-6,Math.PI/2)}
  if(v==1){const pl=blk('plunger')[0];L.box('woodD',.5,.4,.4,pl[0],.2,pl[1],0);L.cyl('steel',.03,.03,.5,pl[0],.65,pl[1],8);L.box('steel',.4,.04,.04,pl[0],.9,pl[1],0);
   for(const dz of[0,.55])L.cyl('woodD',.25,.25,.3,1.9*mx,.25,-4.9-dz,14,0,0,Math.PI/2);ugWallSign(L,ctx,0,2.1,-8.98,0,1,'BLASTING · CLEAR THE AREA',2.2)}
  if(v==2){const wf=fx('water')[0];L.geo('waterS',new THREE.CircleGeometry(1,32),wf.cx,.04,wf.cz,0,-Math.PI/2,0,wf.rx,wf.rz,1);L.box('wood',1.6,.04,.35,0,1.9,-8.8,0);L.cyl('red',.04,.04,.3,.3,1.97,-8.8,8,0,0,Math.PI/2)}
  return true}

 if(t=='pump'){const h=3.9;const pit=fx('pit')[0]||fx('water').find(w=>w.deep);
  room(h,{pits:pit?[lpit(pit.cx,pit.cz,pit.rx,pit.rz)]:[]});ugHangLamp(L,ctx,0,-5,2.8,h,1.1);
  const blk=n=>(fx('blk').find(f=>f.n==n)||{pts:[]}).pts;
  /* a hole in the floor: rock sides going down, water or black at the bottom, a fence round it */
  const hole=(q,dep,wet)=>{const cg=ugInside(new THREE.CylinderGeometry(1.012,1,dep,40,2,true));cg.scale(q.rx,1,q.rz);L.geo('rock',cg,q.cx,-dep/2,q.cz);ugLip(L,q.cx,q.cz,q.rx,q.rz);if(wet)ugPool(L,q,{surf:-.6,dep});else L.geo('black',new THREE.CircleGeometry(1,28),q.cx,-dep,q.cz,0,-Math.PI/2,0,q.rx,q.rz,1);
   const n=Math.max(8,Math.round((q.rx+q.rz)*2.4));for(let i=0;i<n;i++){const a=i/n*6.28,a2=(i+1)/n*6.28,x=q.cx+Math.cos(a)*(q.rx+.35),z=q.cz+Math.sin(a)*(q.rz+.35),x2=q.cx+Math.cos(a2)*(q.rx+.35),z2=q.cz+Math.sin(a2)*(q.rz+.35);
    if(doors.some(d=>Math.hypot(d[0]-x,d[1]-z)<1.6))continue;L.box('wood',.07,1,.07,x,.5,z,0);L.box('wood',Math.hypot(x2-x,z2-z)+.04,.06,.06,(x+x2)/2,.98,(z+z2)/2,Math.atan2(-(z2-z),x2-x))}};
  if(v==0){hole(pit,2.4,true);const pm=blk('pump')[0];L.box('dark',1.2,.25,1.4,pm[0],.125,pm[1],0);L.cyl('steel',.32,.32,1.1,pm[0],.8,pm[1]+.3,16);L.cyl('dark',.55,.55,.12,pm[0]+.45*mx,.75,pm[1]-.3,20,0,0,Math.PI/2);
   L.cyl('rail',.07,.07,Math.abs(pm[0]-pit.cx)-.2,(pm[0]+pit.cx)/2,.55,pm[1]+.3,8,0,0,Math.PI/2);L.cyl('rail',.07,.07,h-1.3,pm[0],1.35+(h-1.3)/2,pm[1]+.3,8)}
  if(v==1){const pt=fx('pit')[0];hole(pt,6,false);const dr=fx('drum')[0];L.cyl('dark',.9,.9,1.6,dr.x,1.2,dr.z,24,0,Math.PI/2,0);for(const sd of[-.9,.9]){L.box('wood',.2,1.25,.2,dr.x-.5,.62,dr.z+sd,0,0,.3);L.box('wood',.2,1.25,.2,dr.x+.5,.62,dr.z+sd,0,0,-.3)}
   L.box('steel',.06,1.2,.06,dr.x-1.1*mx,.8,dr.z+.95,0,0,mx*.4);L.box('wood',2*pt.rx+1,.24,.24,pt.cx,2.9,pt.cz,0);L.cyl('dark',.35,.35,.1,pt.cx,2.65,pt.cz,16,0,0,Math.PI/2);
   const cl=Math.hypot(pt.cx-dr.x,2.65-2.1);L.box('wire',cl,.02,.02,(pt.cx+dr.x)/2,(2.65+2.1)/2,pt.cz,0,0,Math.atan2(2.65-2.1,pt.cx-dr.x));L.cyl('wire',.012,.012,4,pt.cx+.35*Math.sign(dr.x-pt.cx)*-1,.6,pt.cz,4)}
  if(v==2){for(const d of fx('desk')){L.box('wood',1.4,.08,.7,d.x,.86,d.z,0);for(const q of[[-.62,-.28],[.62,-.28],[-.62,.28],[.62,.28]])L.box('woodD',.08,.82,.08,d.x+q[0],.41,d.z+q[1],0);L.box('dark',.2,.18,.16,d.x+.4,.99,d.z,0);L.box('steel',.5,.04,.06,d.x-.3,.92,d.z+.1,.4)}
   const an=blk('anvil')[0];L.box('dark',.3,.35,.3,an[0],.175,an[1],0);L.box('dark',.5,.16,.22,an[0],.43,an[1],0);
   const fg=blk('forge')[0];L.box('brick',1,.9,1,fg[0],.45,fg[1],0);L.box('red',.6,.04,.6,fg[0],.92,fg[1],0);L.box('dark',.7,.6,.7,fg[0],h-.9,fg[1],0);L.cyl('dark',.12,.12,.6,fg[0],h-.3,fg[1],8);const w=L.pt(fg[0],1,fg[1]);ctx.lamps.push([w.x,w.y,w.z,.8])}
  if(v==3){const cp=blk('compressor')[0];L.box('dark',2,.3,1.3,cp[0],.15,cp[1],0);for(const sd of[-.45,.25])L.cyl('steel',.3,.3,.9,cp[0]+sd*mx,.75,cp[1],16);L.cyl('dark',.6,.6,.14,cp[0]+.85*mx,.75,cp[1],24,0,0,Math.PI/2);
   const tk=blk('air tank')[0];L.cyl('steel',.55,.55,2.2,tk[0],1.1,tk[1],20);L.geo('steel',new THREE.SphereGeometry(.55,16,8,0,Math.PI*2,0,Math.PI/2),tk[0],2.2,tk[1]);
   L.cyl('rail',.06,.06,Math.hypot(tk[0]-cp[0],tk[1]-cp[1]),(tk[0]+cp[0])/2,1.6,(tk[1]+cp[1])/2,8,Math.atan2(tk[0]-cp[0],tk[1]-cp[1]),Math.PI/2,0)}
  ugWallVeins(L,r,doors,ctx,R,{gap:3,skip:.45,h:3.9});
  return true}
 return false}

/* ---------- the collapsed drift: after its tunnel (broken sets) is built ---------- */
function ugCollapsed(b,p,y,ctx,tr){const v=p.d.v||0,L=ugLocal(b,p,y),R=ugRng(p.id*331+v),mx=L.mx;
 for(const f of p.d.fx){
  if(f.k=='rubble'){ugPile(L,R,f.x,f.z,1.05,1.4,.9,'oreRock');/* a fallen cap beam across the heap */L.box('wood',3.2,.24,.24,f.x-.3*mx,.55,f.z+.4,.5*mx,0,.25*mx)}
  if(f.k=='blk'&&f.n=='cart')for(const q of f.pts){L.box('steel',.9,.6,1.3,q[0],.32,q[1],.2*mx,.18,.12);for(let i=0;i<9;i++)L.geo('oreRock',new THREE.DodecahedronGeometry(.12+R()*.1,0),q[0]+(R()-.5)*1.2,.08,q[1]+.9+R()*.6,R()*3,R()*3,0)}
  if(f.k=='blk'&&f.n=='prop')for(const q of f.pts){const hh=2.6+.45*2*Math.sin(Math.acos(Math.min(1,Math.abs(q[0])/2)))-.12;L.box('wood',.2,hh,.2,q[0],hh/2,q[1],0);L.box('woodD',.32,.08,.3,q[0],hh-.02,q[1],0)}}}

/* ---------------- docs/design/models/quarry-under-l2.js ---------------- */
/* =====================================================================================================
   The Old Quarry underground, batch 3: LEVEL 2, THE CAVES (docs/design/quarry-underground.md).
   Needs quarry-under.js, quarry-under-kit.js and quarry-under-l1.js. ugBuildLevel calls ugPieceL2(b, p, L, ctx) for
   every piece on levels 2 and 3 before its own code; it returns true when it built the piece.
   - ugCave: a natural passage. Its profile is rounder and wider than a drive (4.8 m wide, 4 m high) and its rock is
     pushed out by the world noise up to 0.45 m, but within 2.4 m of each end it narrows smoothly to the exact 4 m arch
     with no noise, so it meets any doorway, drive or other passage edge to edge.
   - ugChamber: a cave room (forks, rock islands, grottos, halls): an oval floor, rock walls up to 3.65 m that curve
     into a domed roof, doorways flattened to the 4 m arch with a rock lip round them.
   Dug tunnels (joins) and drives on these levels are the miners' own: timbered, with this level's rock, no rails.
   ===================================================================================================== */

/* ---------- the caves' own materials (added to the kit's set) ---------- */
{const k0=ugKit;ugKit=function(){const K=k0();if(K.l2)return K;K.l2=1;const M=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.9},o));
 K.streamN=K.poolN.clone();K.streamN.needsUpdate=true;K.streamN.repeat.set(1.5,6);
 Object.assign(K.mat,{
  /* a stream: rippled, see-through; the game scrolls K.streamN along the flow (offset.y, about 0.25 per second) */
  stream:new THREE.MeshStandardMaterial({color:0x24464c,roughness:.1,metalness:.25,transparent:true,opacity:.6,depthWrite:false,normalMap:K.streamN,normalScale:new THREE.Vector2(.45,.45)}),
  wet2:M({map:K.rockT,color:0x7a8088,roughness:.35}),
  flow:M({map:K.rockT,color:0xe4d4b4,roughness:.6}),               /* flowstone: columns, curtains */
  crystal:new THREE.MeshStandardMaterial({color:0xa8ecff,emissive:0x2a9ac8,emissiveIntensity:.85,roughness:.12,metalness:.1}),
  crystalP:new THREE.MeshStandardMaterial({map:K.rockT,color:0x8fdcf4,emissive:0x1c6c8c,emissiveIntensity:.7,roughness:.2,metalness:.15,flatShading:true}),
  frost:new THREE.MeshStandardMaterial({color:0xeaf8ff,emissive:0x6a9ab8,emissiveIntensity:.5,roughness:.3}),
  stem:M({color:0xe8dcc8,roughness:.8}),gill:M({color:0x8a6a6a,roughness:.9}),
  capP:new THREE.MeshStandardMaterial({color:0xe070d8,emissive:0x9a2a90,emissiveIntensity:.75,roughness:.55}),
  capG:new THREE.MeshStandardMaterial({color:0x6ad070,emissive:0x2a8a3a,emissiveIntensity:.7,roughness:.55}),
  capT:M({color:0xc89060,roughness:.7}),
  rope:M({color:0x9a7a4a,roughness:1})});
 for(const k in K.mat)K.mat[k].userData.ug=k;K.mat.stream.userData.ro=2;return K}}

/* ---------- the cave profile: 15 points laid out like ugProf(2) (4 up the left wall, 7 over the roof, 4 down the
   right wall), so the two can be blended point by point ---------- */
function ugCaveProf(){const W=[[-2.1,-.1],[-2.38,.85],[-2.48,1.75],[-2.4,2.6]],P=W.slice();
 for(let i=1;i<8;i++){const a=Math.PI*(1-i/8);P.push([2.4*Math.cos(a),2.65+1.35*Math.sin(a)])}
 for(let i=3;i>=0;i--)P.push([-W[i][0],W[i][1]]);return P}

/* ---------- a cave passage. pts: [[x,y,z]] in mine coords. o: {rock, floor, amp, keep:[half-planes], fil}.
   o.keep: the floor is kept only where a*x+b*z+c<=0 for one of the half-planes [a,b,c] (a stream cuts it in two) ---------- */
function ugCave(b,pts,o){o=o||{};const chw=o.hw||2,A=ugProf(chw).P,Cv=ugCaveProf().map(([x,y])=>[x*chw/2,y*(.55+.45*chw/2)]),m=A.length,amp=o.amp==null?.45:o.amp,rk=o.rock||'rock2';
 /* both ends run straight and square for 1.6 m, so the end rings sit flat in the doorways */
 let Q=pts.slice();const sq=(a,c)=>{const dx=c[0]-a[0],dz=c[2]-a[2],l=Math.hypot(dx,dz);return Math.abs(dx)>Math.abs(dz)?[Math.sign(dx),0,Math.abs(dz)/l]:[0,Math.sign(dz),Math.abs(dx)/l]};
 if(Q.length>=2){const a0=sq(Q[0],Q[1]),e=Q[Q.length-1],a1=sq(Q[Q.length-2],e);const mid=Q.slice(1,-1);let head=[Q[0]],tail=[e];
  if(a0[2]>.03){head.push([Q[0][0]+a0[0]*1.6,Q[0][1],Q[0][2]+a0[1]*1.6])}if(a1[2]>.03){tail.unshift([e[0]-a1[0]*1.6,e[1],e[2]-a1[1]*1.6])}
  Q=head.concat(mid.filter(q=>(a0[2]<=.03||Math.hypot(q[0]-Q[0][0],q[2]-Q[0][2])>2.4)&&(a1[2]<=.03||Math.hypot(q[0]-e[0],q[2]-e[2])>2.4))).concat(tail)}
 const P=ugResample(ugFillet(Q,o.fil==null?2.5:o.fil),.5),n=P.length,S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][2]-P[i-1][2]));const L=S[n-1];
 const T=P.map((p,i)=>{const a=P[Math.max(0,i-1)],c=P[Math.min(n-1,i+1)];let tx=c[0]-a[0],tz=c[2]-a[2];const l=Math.hypot(tx,tz)||1;return[tx/l,tz/l]});
 for(const i of[0,n-1]){const [tx,tz]=T[i];if(Math.abs(tx)>.9)T[i]=[Math.sign(tx),0];else if(Math.abs(tz)>.9)T[i]=[0,Math.sign(tz)]}
 const kf=s=>{const t=Math.max(0,Math.min(1,Math.min(s,L-s)/2.4));return t*t*(3-2*t)};
 const pl=[0];for(let j=1;j<m;j++)pl.push(pl[j-1]+Math.hypot(Cv[j][0]-Cv[j-1][0],Cv[j][1]-Cv[j-1][1]));
 const pos=[],uv=[],idx=[],prof=(j,k)=>[A[j][0]+(Cv[j][0]-A[j][0])*k,A[j][1]+(Cv[j][1]-A[j][1])*k];
 for(let i=0;i<n;i++){const k=kf(S[i]),[tx,tz]=T[i],rx=-tz,rz=tx;for(let j=0;j<m;j++){const [sx,sy]=prof(j,k);let x=P[i][0]+rx*sx,yy=P[i][1]+sy,z=P[i][2]+rz*sx;
   let nx=sx,ny=sy-1.5;const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;const hy=Math.max(0,Math.min(1,sy/.7)),d=amp*k*hy*ugNoise(x,yy,z);
   pos.push(x+rx*nx*d,yy+ny*d,z+rz*nx*d);uv.push(S[i]/3,pl[j]/3)}}
 for(let i=0;i<n-1;i++)for(let j=0;j<m-1;j++){const a=i*m+j,b2=(i+1)*m+j,c=(i+1)*m+j+1,d=i*m+j+1;idx.push(a,b2,c,a,c,d)}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();b.add(rk,geo);
 /* the floor: flat, as wide as the wall at floor height (plus 6 cm under the rock) */
 const hwAt=i=>{const k=kf(S[i]),p0=prof(0,k),p1=prof(1,k),t=(0-p0[1])/(p1[1]-p0[1]);return-(p0[0]+(p1[0]-p0[0])*t)+.06};
 const edge=i=>{const [tx,tz]=T[i],h=hwAt(i);return[[P[i][0]+tz*h,P[i][2]-tx*h],[P[i][0]-tz*h,P[i][2]+tx*h]]};
 const fp=[],fn=[],fu=[],keep=o.keep||[null];const y=P[0][1];
 const clip=(poly,H)=>{if(!H)return poly;const o2=[];for(let i=0;i<poly.length;i++){const a=poly[i],c=poly[(i+1)%poly.length],fa=H[0]*a[0]+H[1]*a[1]+H[2],fc=H[0]*c[0]+H[1]*c[1]+H[2];if(fa<=0)o2.push(a);if((fa<0)!=(fc<0)&&fa!=0&&fc!=0){const t=fa/(fa-fc);o2.push([a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t])}}return o2};
 /* on the inside of a tight bend the floor's edge would run backwards and fold over itself (two layers of floor
    flickering); there it waits until the bend has passed */
 const E=[];for(let i=0;i<n;i++){const e=edge(i);if(i)for(const sd of[0,1]){const q=E[i-1][sd],[tx,tz]=T[i];if((e[sd][0]-q[0])*tx+(e[sd][1]-q[1])*tz<.02)e[sd]=q.slice()}E.push(e)}
 for(let i=0;i<n-1;i++){const e0=E[i],e1=E[i+1],quad=[e0[0],e1[0],e1[1],e0[1]].filter((q,k,a)=>{const r=a[(k+1)%a.length];return Math.hypot(q[0]-r[0],q[1]-r[1])>1e-6});if(quad.length<3)continue;for(const H of keep){const pg=clip(quad,H);for(let t=1;t<pg.length-1;t++){let tri=[pg[0],pg[t],pg[t+1]];const cr=(tri[1][0]-tri[0][0])*(tri[2][1]-tri[0][1])-(tri[1][1]-tri[0][1])*(tri[2][0]-tri[0][0]);if(cr>0)tri=[tri[0],tri[2],tri[1]];for(const v of tri){fp.push(v[0],y,v[1]);fn.push(0,1,0);fu.push(v[0]/2.5,v[1]/2.5)}}}}
 b.raw(o.floor||'floor2',fp,fn,fu);
 const at=s=>{let i=1;while(i<n-1&&S[i]<s)i++;const t=(s-S[i-1])/((S[i]-S[i-1])||1),p=[P[i-1][0]+(P[i][0]-P[i-1][0])*t,P[i-1][1]+(P[i][1]-P[i-1][1])*t,P[i-1][2]+(P[i][2]-P[i-1][2])*t],tt=T[i];return{p,t:tt,r:[-tt[1],tt[0]],yaw:Math.atan2(-tt[0],-tt[1]),i}};
 /* a point on the wall surface: ring i, profile point j */
 const wall=(i,j)=>[pos[(i*m+j)*3],pos[(i*m+j)*3+1],pos[(i*m+j)*3+2]];
 return{L,at,P,S,T,n,m,wall,edge,kf}}

/* veins and loose stones along a cave passage (rings, so they sit on the real wall) */
function ugCaveDress(b,c,ctx,R,lv){const pick=()=>{const r=R();return lv==1?(r<.3?'ag':r<.45?'au':r<.55?'cr':r<.8?'fe':'cu'):(r<.3?'au':r<.5?'dm':r<.65?'ur':r<.85?'ag':'fe')};
 for(let s=3+R()*3;s<c.L-3;s+=4+R()*4){if(R()<.3)continue;const f=c.at(s),side=R()<.5?0:1,j=side?12:2,w=c.wall(f.i,j),r=f.r,sg=side?1:-1;
  ctx.veins.push({x:w[0]+r[0]*sg*.06,y:w[1],z:w[2]+r[1]*sg*.06,dx:-r[0]*sg,dz:-r[1]*sg,t:pick()})}
 for(let s=2.2;s<c.L-2.2;s+=1.1+R()*1.6){const f=c.at(s),e=c.edge(f.i),side=R()<.5?0:1,q=e[side],cx=(e[0][0]+e[1][0])/2,cz=(e[0][1]+e[1][1])/2,dx=cx-q[0],dz=cz-q[1],l=Math.hypot(dx,dz),sz=.12+R()*.26;
  b.add(c.rk||'rock2',new THREE.DodecahedronGeometry(sz,0),new THREE.Matrix4().compose(new THREE.Vector3(q[0]+dx/l*(.22+sz*.5),f.p[1]+sz*.25,q[1]+dz/l*(.22+sz*.5)),new THREE.Quaternion().setFromEuler(new THREE.Euler(R()*3,R()*3,0)),new THREE.Vector3(1,.7,1)))}}

/* ---------- a cave room (chamber) in the piece's own coords. o: {cx,cz,rx,rz, dome, amp, isle:{cx,cz,r,bot,key},
   pits:[{cx,cz,rx,rz}], holes:[[[x,z]..]], H (wall height, >= the door top 3.65)}. Returns its outline and roofAt(x,z) ---------- */
/* a cave room's outline (local coords): the oval, flattened into a straight 5.2 m wall round each doorway.
   doors: the piece's openings on (or near) the oval; (nx,nz) faces out of the room, (tx,tz) runs along the wall */
function ugChamberShape(p,o){const cx=o.cx,cz=o.cz,rx=o.rx,rz=o.rz;
 const op=[[0,0,0,1]].concat(p.d.ex.map(e=>{const v=ugRot(0,-1,e[2]);return[e[0],e[1],v[0],v[1]]}));
 const doors=op.filter(q=>Math.abs(Math.hypot((q[0]-cx)/rx,(q[1]-cz)/rz)-1)*Math.min(rx,rz)<1.4).map(q=>({x:q[0],z:q[1],nx:q[2],nz:q[3],tx:-q[3],tz:q[2],hw:2}))
  .concat((o.doorsExtra||[]).map(q=>({x:q.x,z:q.z,nx:q.nx,nz:q.nz,tx:-q.nz,tz:q.nx,hw:q.hw||2})));
 const N=Math.max(28,Math.ceil(Math.PI*(rx+rz)/.75));let pts=[];for(let i=0;i<N;i++){const a=i/N*Math.PI*2;pts.push([cx+rx*Math.cos(a),cz+rz*Math.sin(a)])}
 for(const d of doors){const fw=d.hw+.6;pts=pts.filter(q=>!(Math.abs((q[0]-d.x)*d.tx+(q[1]-d.z)*d.tz)<fw+.15&&(q[0]-d.x)*d.nx+(q[1]-d.z)*d.nz>-3.5));for(const s of[-fw,-d.hw,d.hw,fw])pts.push([d.x+d.tx*s,d.z+d.tz*s])}
 pts.sort((a,c)=>Math.atan2(a[1]-cz,a[0]-cx)-Math.atan2(c[1]-cz,c[0]-cx));pts=pts.filter((q,i)=>Math.hypot(q[0]-pts[(i+1)%pts.length][0],q[1]-pts[(i+1)%pts.length][1])>.05);
 return{pts,doors}}
function ugChamber(b,p,Lv,ctx,o){const y=UGLY(Lv),L=ugLocal(b,p,y),rk=o.rock||ugRK(Lv),fl=o.floor||ugFL(Lv),amp=o.amp==null?.75:o.amp,H=3.65,
 cx=o.cx,cz=o.cz,rx=o.rx,rz=o.rz,dome=o.dome==null?Math.min(rx,rz)*.4:o.dome,isle=o.isle;
 const sh0=ugChamberShape(p,o),pts=sh0.pts,doors=sh0.doors;
 /* columns round the wall, about every 0.7 m, with an outward normal */
 const cols=[],nP=pts.length;for(let e=0;e<nP;e++){const A=pts[e],B=pts[(e+1)%nP],len=Math.hypot(B[0]-A[0],B[1]-A[1]),k=Math.max(1,Math.ceil(len/.7));for(let q=0;q<k;q++)cols.push({x:A[0]+(B[0]-A[0])*q/k,z:A[1]+(B[1]-A[1])*q/k})}
 const nc=cols.length;for(let i=0;i<nc;i++){const a=cols[(i+nc-1)%nc],c=cols[(i+1)%nc];let ux=c.x-a.x,uz=c.z-a.z;const l=Math.hypot(ux,uz);cols[i].nx=uz/l;cols[i].nz=-ux/l}
 const onDoor=c=>doors.find(d=>Math.abs((c.x-d.x)*d.nx+(c.z-d.z)*d.nz)<.02&&Math.abs((c.x-d.x)*d.tx+(c.z-d.z)*d.tz)<d.hw+.62);
 for(const c of cols){const d=onDoor(c);if(d){c.nx=d.nx;c.nz=d.nz;c.lat=(c.x-d.x)*d.tx+(c.z-d.z)*d.tz;c.door=d}}
 const fade=c=>{let m=9;for(const d of doors){const lat=Math.abs((c.x-d.x)*d.tx+(c.z-d.z)*d.tz),ax=Math.abs((c.x-d.x)*d.nx+(c.z-d.z)*d.nz);m=Math.min(m,Math.hypot(Math.max(0,lat-d.hw),ax))}return Math.min(1,m/1.4)};
 const nz=(x,yy,z)=>{const w=L.pt(x,yy,z);return ugNoise(w.x,w.y,w.z)};
 const Ys=[-.1,.55,1.2,1.9,2.6,3.15,H];
 const pos=[],uv=[],idx=[];const V=(x,yy,z,u,v)=>{pos.push(x,yy,z);uv.push(u,v);return pos.length/3-1};
 const perim=[0];for(let i=1;i<=nc;i++){const a=cols[i-1],c=cols[i%nc];perim.push(perim[i-1]+Math.hypot(c.x-a.x,c.z-a.z))}
 /* the wall: rows of vertices pushed out (into the rock) by the noise, not at the floor or near a doorway */
 /* (the first column is repeated at the end with its own texture position, so the texture has no seam) */
 const W=[];for(let i=0;i<=nc;i++){const c=cols[i%nc],f=fade(c),row=[];for(const yy of Ys){const hy=Math.max(0,Math.min(1,yy/.7)),d=amp*f*hy*nz(c.x,yy,c.z);row.push(V(c.x+c.nx*d,yy,c.z+c.nz*d,perim[i]/3,yy/3))}c.f=f;W.push(row)}
 const inDoor=(a,c)=>a.door&&c.door&&a.door===c.door&&Math.abs(a.lat)<a.door.hw+.01&&Math.abs(c.lat)<a.door.hw+.01;
 for(let i=0;i<nc;i++){const i2=i+1;if(inDoor(cols[i],cols[i2%nc]))continue;for(let j=0;j<Ys.length-1;j++){const a=W[i][j],b2=W[i2][j],c=W[i2][j+1],d=W[i][j+1];idx.push(a,b2,c,a,c,d)}}
 /* the island (a rock pillar the passage goes round): its wall faces out, its top meets the roof */
 let IW=null,ip=null;if(isle){IW=[];ip=[];const bot=isle.bot==null?-.1:isle.bot;for(let i=0;i<=nc;i++){const a=Math.atan2(cols[i%nc].z-isle.cz,cols[i%nc].x-isle.cx),ux=Math.cos(a),uz=Math.sin(a),bx=isle.cx+ux*isle.r,bz=isle.cz+uz*isle.r,row=[];if(i<nc)ip.push([bx,bz]);
   for(const yy of [bot].concat(Ys.slice(1))){const hy=Math.max(0,Math.min(1,yy/.7)),d=amp*hy*nz(bx,yy,bz)*.8;row.push(V(bx-ux*d,yy,bz-uz*d,i*.6/3,yy/3))}IW.push(row)}
  const tgt=isle.key?(isle.idx=[]):idx;for(let i=0;i<nc;i++){const i2=i+1;for(let j=0;j<Ys.length-1;j++){const a=IW[i][j],b2=IW[i2][j],c=IW[i2][j+1],d=IW[i][j+1];tgt.push(a,c,b2,a,d,c)}}}
 /* the roof: rings from the top of the wall in to the middle (or to the island's top), rising into a dome */
 const K=7,top=i=>[pos[W[i][Ys.length-1]*3],pos[W[i][Ys.length-1]*3+2]];let prev=W.map(r=>r[Ys.length-1]);
 for(let k=1;k<=K;k++){const f=k/K,cur=[];for(let i=0;i<=nc;i++){if(isle&&k==K){cur.push(IW[i][Ys.length-1]);continue}const t=top(i),tg=isle?[pos[IW[i][Ys.length-1]*3],pos[IW[i][Ys.length-1]*3+2]]:[cx,cz];
   const x=t[0]+(tg[0]-t[0])*f,z=t[1]+(tg[1]-t[1])*f,sh=isle?Math.sin(Math.PI*f):1-(1-f)*(1-f),yy=H+dome*sh+amp*1.3*nz(x,H+dome*sh,z)*Math.min(1,f*2.5)*(isle?Math.sin(Math.PI*f):1);cur.push(V(x,yy,z,x/3,z/3))}
  for(let i=0;i<nc;i++){const i2=i+1;const a=prev[i],b2=prev[i2],c=cur[i2],d=cur[i];idx.push(a,b2,c,a,c,d)}prev=cur}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();L.geo(rk,geo,0,0,0);
 if(isle&&isle.key){const g2=new THREE.BufferGeometry();g2.setAttribute('position',geo.attributes.position);g2.setAttribute('uv',geo.attributes.uv);g2.setIndex(isle.idx);g2.computeVertexNormals();L.geo(isle.key,g2,0,0,0)}
 /* the doorways: a flat panel between the arch and the roof's edge, and a rock lip round the arch */
 for(const d of doors){const pf=ugProf(d.hw),dw=d.hw;const sh=new THREE.Shape();sh.moveTo(-dw,pf.wy);sh.lineTo(-dw,H);sh.lineTo(dw,H);sh.lineTo(dw,pf.wy);for(let i=pf.P.length-5;i>=4;i--){const q=pf.P[i];if(q[1]>=pf.wy-1e-6)sh.lineTo(q[0],q[1])}
  const g2=new THREE.ShapeGeometry(sh);const pa=g2.attributes.position,uvs=[];for(let i=0;i<pa.count;i++)uvs.push(pa.getX(i)/3,pa.getY(i)/3);g2.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  L.geo(rk,g2,d.x,0,d.z,Math.atan2(-d.tz,d.tx));
  const lp=pf.P.filter(q=>q[1]>-.05).map(q=>{const lx=q[0]*1.06,ly=q[1]<=pf.wy?q[1]:pf.wy+(q[1]-pf.wy)*1.12;return new THREE.Vector3(d.x+d.tx*lx-d.nx*.07,ly,d.z+d.tz*lx-d.nz*.07)});
  lp.unshift(lp[0].clone().setY(-.12));lp.push(lp[lp.length-1].clone().setY(-.12));
  const tg=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lp,false,'centripetal'),40,.19,7,false),tu=tg.attributes.uv;for(let i=0;i<tu.count;i++)tu.setXY(i,tu.getX(i)*4.5,tu.getY(i)*.4);L.geo(rk,tg,0,0,0)}
 /* the floor, with the island and any pits cut out */
 {const sh=new THREE.Shape();pts.forEach((q,i)=>i?sh.lineTo(q[0],-q[1]):sh.moveTo(q[0],-q[1]));
  if(isle&&!o.isleInPit){const hp=new THREE.Path();ip.forEach((q,i)=>i?hp.lineTo(q[0],-q[1]):hp.moveTo(q[0],-q[1]));sh.holes.push(hp)}
  for(const E of o.pits||[]){const hp=new THREE.Path();hp.absellipse(E.cx,-E.cz,E.rx,E.rz,0,Math.PI*2,false,0);sh.holes.push(hp)}
  for(const P2 of o.holes||[]){const hp=new THREE.Path();P2.forEach((q,i)=>i?hp.lineTo(q[0],-q[1]):hp.moveTo(q[0],-q[1]));sh.holes.push(hp)}
  const fg=new THREE.ShapeGeometry(sh,24);fg.rotateX(-Math.PI/2);const pa=fg.attributes.position,uvs=[];for(let i=0;i<pa.count;i++)uvs.push(pa.getX(i)/2.5,pa.getZ(i)/2.5);fg.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));L.geo(fl,fg,0,0,0)}
 /* where the roof is above a point (for columns, roots and stalactites), near enough: the roof is flat between its rings */
 const angOf=(x,z)=>Math.atan2(z-cz,x-cx);
 const rimAt=a=>{for(let i=0;i<nP;i++){const A=pts[i],B=pts[(i+1)%nP],ax=A[0]-cx,az=A[1]-cz,bx=B[0]-cx,bz=B[1]-cz,dx=Math.cos(a),dz=Math.sin(a);const den=dx*(bz-az)-dz*(bx-ax);if(Math.abs(den)<1e-9)continue;const t=(ax*(bz-az)-az*(bx-ax))/den,u=(ax*dz-az*dx)/den;if(t>0&&u>=-1e-6&&u<=1+1e-6)return t}return Math.min(rx,rz)};
 const roofAt=(x,z)=>{const r=Math.hypot(x-cx,z-cz),R0=rimAt(angOf(x,z)),f=Math.max(0,Math.min(1,1-r/R0)),sh=1-(1-f)*(1-f);return H+dome*sh+amp*1.3*nz(x,H+dome*sh,z)*Math.min(1,f*2.5)};
 /* veins round the wall, never near a doorway */
 const R=ugRng(p.id*613+(p.d.v||0)*7+1),vw=o.veinGap||2.8;let next=R()*vw;
 for(let i=0;i<nc;i++){if(perim[i]<next)continue;next=perim[i]+vw*(.7+R()*.6);const c=cols[i];if(c.f<.99||R()<(o.veinSkip==null?.3:o.veinSkip)||(o.noVein&&o.noVein(c.x,c.z)))continue;
  const j=2+(R()*3|0),yy=Ys[j],pv=pos.slice(W[i][j]*3,W[i][j]*3+3),w=L.pt(pv[0]+c.nx*.06,yy,pv[2]+c.nz*.06),dd=L.dir(-c.nx,-c.nz);
  ctx.veins.push({x:w.x,y:w.y,z:w.z,dx:dd[0],dz:dd[1],t:(o.pick||(()=>{const r=R();return r<.3?'ag':r<.45?'au':r<.58?'cr':r<.8?'fe':'cu'}))()})}
 /* loose stones along the foot of the wall */
 if(o.stones!==false)for(let i=0;i<nc;i+=2){const c=cols[i];if(c.f<1||R()<.45)continue;const s2=.12+R()*.3;L.geo(rk,new THREE.DodecahedronGeometry(s2,0),c.x-c.nx*(.15+s2*.5),s2*.22,c.z-c.nz*(.15+s2*.5),R()*3,R()*3,0,1,.7,1)}
 /* a point on the wall surface at angle a (round the middle) and height yy, with the wall's outward normal */
 const ca=cols.map(c=>Math.atan2(c.z-cz,c.x-cx));
 const wallPt=(a,yy)=>{let i=0;for(let k=0;k<nc;k++){const a0=ca[k],a1=ca[(k+1)%nc];let d1=a1-a0;if(d1<0)d1+=Math.PI*2;let d=a-a0;while(d<0)d+=Math.PI*2;while(d>=Math.PI*2)d-=Math.PI*2;if(d<=d1){i=k;break}}
  const i2=(i+1)%nc;let d1=ca[i2]-ca[i];if(d1<0)d1+=Math.PI*2;let d=a-ca[i];while(d<0)d+=Math.PI*2;const t=Math.min(1,d/(d1||1));let j=0;while(j<Ys.length-2&&Ys[j+1]<yy)j++;const u=Math.max(0,Math.min(1,(yy-Ys[j])/(Ys[j+1]-Ys[j])));
  const P=(ii,jj)=>pos.slice(W[ii][jj]*3,W[ii][jj]*3+3),l=(A,B,k)=>A.map((v,q)=>v+(B[q]-v)*k);const p0=l(P(i,j),P(i2,j),t),p1=l(P(i,j+1),P(i2,j+1),t),q=l(p0,p1,u);
  const nx=cols[i].nx+(cols[i2].nx-cols[i].nx)*t,nz=cols[i].nz+(cols[i2].nz-cols[i].nz)*t,nl=Math.hypot(nx,nz);return{x:q[0],y:yy,z:q[2],nx:nx/nl,nz:nz/nl}};
 return{pts,doors,roofAt,wallPt,L,cols,H,isle:ip,dome}}

/* ---------- small cave things, in piece-local coords through L ---------- */
/* a column from floor to roof: an hourglass of flowstone, sunk into both */
function ugColumn(L,x,z,r,top,key,R){const n=9,pr=[];for(let i=0;i<=n;i++){const t=i/n,w=r*(.55+.45*Math.pow(Math.abs(t-.5)*2,1.6))*(1+.08*Math.sin(i*2.3+r*7));pr.push(new THREE.Vector2(w,-.1+(top+1.1)*t))}
 const g=new THREE.LatheGeometry(pr,14);L.geo(key||'flow',g,x,0,z,R?R()*6:0)}
/* a stalagmite (up from the floor) or a stalactite (down from the roof: dn=true, y0 = the roof there) */
function ugDrip(L,x,z,r,h,y0,dn,key){if(dn){/* reaches 0.9 m up into the roof, which is only near enough known between its rings */const g=new THREE.ConeGeometry(r*(h+.9)/h,h+.9,9,3);g.rotateX(Math.PI);L.geo(key||'flow',g,x,y0-h/2+.45,z)}else{const g=new THREE.ConeGeometry(r,h,9,3);L.geo(key||'flow',g,x,h/2-.05,z)}}
/* a crystal cluster: a few six-sided crystals with pointed tips, leaning out from a sunk base. s: size */
function ugCrystals(L,R,x,z,s,key,y0,up){const n=3+(R()*4|0);for(let i=0;i<n;i++){const h=s*(.6+R()*.9),r=s*(.09+R()*.07),a=R()*6.28,lean=.15+R()*.55;
  const g=new THREE.CylinderGeometry(r,r*1.1,h,6);g.translate(0,h/2,0);const tip=new THREE.ConeGeometry(r,r*2.2,6);tip.translate(0,h+r*1.1,0);
  const M=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.cos(a)*lean,R()*3,Math.sin(a)*lean));for(const q of[g,tip]){q.applyMatrix4(M);L.geo(key||'crystal',q,x+Math.cos(a)*s*.08,(y0||0)-.06,z+Math.sin(a)*s*.08)}}}
/* a mushroom: pale stem, a domed cap (glowing for the big cave kinds), gills under it. lean: [dx,dz] */
function ugMushroom(L,R,x,z,h,cr,key,lean,y0){y0=y0||0;lean=lean||[0,0];const tx=x+lean[0],tz=z+lean[1],len=Math.hypot(lean[0],lean[1],h);
 const st=new THREE.CylinderGeometry(Math.max(.06,cr*.16),Math.max(.09,cr*.24),len+.05,10);st.translate(0,len/2,0);
 st.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(lean[0],h,lean[1]).normalize())));L.geo('stem',st,x,y0-.05,z);
 const cap=new THREE.SphereGeometry(cr,18,8,0,Math.PI*2,0,Math.PI*.45);cap.scale(1,.55,1);L.geo(key||'capP',cap,tx,y0+h-cr*.12,tz);
 const gi=new THREE.CircleGeometry(cr*.985*Math.sin(Math.PI*.45),18);gi.rotateX(Math.PI/2);L.geo('gill',gi,tx,y0+h-cr*.12+cr*.55*Math.cos(Math.PI*.45)-.004,tz);
 return[tx,y0+h,tz]}

/* ---------- the level 2 and 3 pieces ---------- */
function ugPieceL2(b,p,Lv,ctx){if(Lv==0)return false;if(typeof ugPieceL3=='function'&&ugPieceL3(b,p,Lv,ctx))return true;const t=p.type,y=UGLY(Lv),R=ugRng(p.id*331+17),W=ugWorld(p);
 /* the miners' tunnels: timbered, this level's rock, no rails */
 if(t=='join'||t=='drive'){for(const s of W.shp)if(s.k=='path'){const tr=ugTube(b,s.pts.map(q=>[q[0],y,q[1]]),{hw:2,fil:t=='join'?3:0,rails:false,lampsOut:ctx.lamps,lampOff:p.id%2,rock:ugRK(Lv),floorKey:ugFL(Lv)});
   for(let sd=3+R()*3;sd<tr.L-2;sd+=5+R()*4){const side=R()<.5?-1:1,hi=R()<.5;if(R()<.35)continue;const sc=sd-((sd-1.5)%3+3)%3+1.5,s2=Math.abs(sd-sc)<.6?sc+1.5:sd,w=ugTubeWall(tr,ugTubeRing(tr,s2),side<0?(hi?2:1):(hi?12:13));ctx.veins.push({x:w.x,y:w.y,z:w.z,dx:w.dx,dz:w.dz,t:R()<.3?'ag':R()<.6?'fe':'cu'})}}return true}
 /* cave passages and bends */
 if(t=='cpass'||t=='cbend'){for(const s of W.shp)if(s.k=='path'){const c=ugCave(b,s.pts.map(q=>[q[0],y,q[1]]),{rock:ugRK(Lv),floor:ugFL(Lv)});c.rk=ugRK(Lv);ugCaveDress(b,c,ctx,R,Lv)}return true}
 if(t=='stream'){ugStream(b,p,Lv,ctx,W,R);return true}
 if(t=='orepass'){ugOrePass(b,p,Lv,ctx,W);return true}
 const blob=p.d.shp.find(s=>s.k=='blob');
 if(t=='fork'){const ch=ugChamber(b,p,Lv,ctx,{cx:blob.cx,cz:blob.cz,rx:blob.rx,rz:blob.rz,dome:2.6});const L=ch.L,v=p.d.v||0;
  if(v==1){const q=p.d.fx.find(f=>f.n=='boulder').pts[0];const g=new THREE.IcosahedronGeometry(1.35,1);const pa=g.attributes.position;for(let i=0;i<pa.count;i++){const w=L.pt(q[0]+pa.getX(i),pa.getY(i),q[1]+pa.getZ(i)),k=.8+.45*ugNoise(w.x*1.3,w.y*1.3,w.z*1.3);pa.setXYZ(i,pa.getX(i)*k,pa.getY(i)*k,pa.getZ(i)*k)}g.computeVertexNormals();L.geo(ugRK(Lv),g,q[0],.75,q[1],R()*3,0,0,1.1,.85,1.1);
   for(let i=0;i<7;i++){const a=R()*6.28,d=1.6+R()*.8,s2=.12+R()*.2;L.geo(ugRK(Lv),new THREE.DodecahedronGeometry(s2,0),q[0]+Math.cos(a)*d,s2*.3,q[1]+Math.sin(a)*d,R()*3,R()*3,0)}}
  if(v==2){for(const f of p.d.fx.filter(f=>f.k=='cols'))for(const q of f.pts)ugColumn(L,q[0],q[1],f.r||.5,ch.roofAt(q[0],q[1]),'flow',R);
   for(let i=0;i<14;i++){const x=blob.cx+(R()-.5)*blob.rx*1.3,z=blob.cz+(R()-.5)*blob.rz*1.3;if(Math.hypot((x-blob.cx)/blob.rx,(z-blob.cz)/blob.rz)>.8)continue;const h=.3+R()*.8;ugDrip(L,x,z,.08+R()*.1,h,ch.roofAt(x,z),true)}}
  return true}
 if(t=='island'){const v=p.d.v||0,fi=p.d.fx.find(f=>f.k=='isle')||{cx:0,cz:-12};const base={cx:0,cz:-12,rx:10,rz:12};
  if(v==2){/* Mushroom island: a low mound under one big dome, giant mushrooms on it leaning out over the passage */
   const ch=ugChamber(b,p,Lv,ctx,Object.assign({dome:5.2},base)),L=ch.L;const m=new THREE.SphereGeometry(1,24,8,0,Math.PI*2,0,Math.PI/2);L.geo(ugRK(Lv),m,fi.cx,-.05,fi.cz,0,0,0,5.3,1.1,5.3);
   const rs=p.d.fx.find(f=>f.k=='ringspots');for(let i=0;i<rs.n;i++){const a=i/rs.n*6.28+.3,x=rs.cx+Math.cos(a)*rs.rx,z=rs.cz+Math.sin(a)*rs.rz,yb=1.1*Math.sqrt(Math.max(0,1-(rs.rx/5.3)**2))-.05;
    const top=ugMushroom(L,R,x,z,2.6+R()*1.2,1.7+R()*.6,'capP',[Math.cos(a)*1.1,Math.sin(a)*1.1],yb);const w=L.pt(top[0],top[1]-.4,top[2]);ctx.lamps.push([w.x,w.y,w.z,.9])}
   for(let i=0;i<10;i++){const a=R()*6.28,r=R()*3.2;ugMushroom(L,R,fi.cx+Math.cos(a)*r,fi.cz+Math.sin(a)*r,.4+R()*.5,.25+R()*.2,'capG',[0,0],1.1*Math.sqrt(Math.max(0,1-(r/5.3)**2))-.08)}
   return true}
  const flood=v==3,cry=v==1;
  const ch=ugChamber(b,p,Lv,ctx,Object.assign({dome:3.4,isle:{cx:fi.cx,cz:fi.cz,r:5.3,bot:flood?-.3:-.1,key:cry?'crystalP':null},isleInPit:flood,pits:flood?[{cx:0,cz:-12,rx:9.4,rz:9.4}]:[],rock:ugRK(Lv)},base)),L=ch.L;
  if(flood)ugPool(L,{cx:0,cz:-12,rx:9.4,rz:9.4},{prof:[[1,0],[.985,-.1],[.96,-.17],[0,-.2]],surf:-.04,dep:.2,key:'waterS',rock:'wet2',hole:ch.isle});
  if(cry){/* the island is one great crystal pillar: its face shows through in glowing crystal, big crystals jut out of it */
   const rs=p.d.fx.find(f=>f.k=='ringspots');
   for(let i=0;i<rs.n;i++){const a=i/rs.n*6.28;ugCrystals(L,R,fi.cx+Math.cos(a)*4.75,fi.cz+Math.sin(a)*4.75,1.3+R()*.9,'crystal',.1+R()*1.7)}
   for(const a of[0,1.57,3.14,4.71]){const w=L.pt(fi.cx+Math.cos(a)*6.2,2,fi.cz+Math.sin(a)*6.2);ctx.lamps.push([w.x,w.y,w.z,1.2])}}
  return true}
 if(blob&&['crystal','fungus','flooded','chasm','hall'].includes(t)){const dm={crystal:3.6,fungus:5,flooded:2.8,chasm:4.2,hall:4.4};
  if(typeof ugCaveRoom=='function'&&ugCaveRoom(b,p,Lv,ctx,blob))return true;
  ugChamber(b,p,Lv,ctx,{cx:blob.cx,cz:blob.cz,rx:blob.rx,rz:blob.rz,dome:dm[t]});return true}
 return false}

/* ---------- the stream crossing: a cave passage with a stream across it ---------- */
function ugStream(b,p,Lv,ctx,W,R){const v=p.d.v||0,y=UGLY(Lv),T=ugT(p),path=W.shp.find(s=>s.k=='path');
 const sf=p.d.fx.find(f=>f.k=='stream'),wf=p.d.fx.find(f=>f.k=='water');
 if(!sf){/* Stream tunnel: ankle-deep water along the passage */const c=ugCave(b,path.pts.map(q=>[q[0],y,q[1]]),{rock:ugRK(Lv),floor:ugFL(Lv)});c.rk=ugRK(Lv);ugCaveDress(b,c,ctx,R,Lv);
  const L=ugLocal(b,p,y);L.geo('stream',new THREE.CircleGeometry(1,40),wf.cx,.07,wf.cz,0,-Math.PI/2,0,wf.rx,wf.rz,1);
  const rg=new THREE.RingGeometry(.92,1.08,40);L.geo('wet2',rg,wf.cx,.012,wf.cz,0,-Math.PI/2,0,wf.rx,wf.rz,1);return}
 const w=sf.w||1.2,dep=sf.deep?1.1:.4,a=T(sf.pts[0][0],sf.pts[0][1]),c2=T(sf.pts[1][0],sf.pts[1][1]),ux=c2[0]-a[0],uz=c2[1]-a[1],ul=Math.hypot(ux,uz),u=[ux/ul,uz/ul],nrm=[-u[1],u[0]];
 /* which side of the stream the entry is on: keep the floor on the far side of each bank */
 const ent=[p.x,p.z],sd=Math.sign((ent[0]-a[0])*nrm[0]+(ent[1]-a[1])*nrm[1])||1,n=[nrm[0]*sd,nrm[1]*sd];
 const H1=[-n[0],-n[1],(a[0]+n[0]*w/2)*n[0]+(a[1]+n[1]*w/2)*n[1]],H2=[n[0],n[1],-((a[0]-n[0]*w/2)*n[0]+(a[1]-n[1]*w/2)*n[1])];
 const c=ugCave(b,path.pts.map(q=>[q[0],y,q[1]]),{rock:ugRK(Lv),floor:ugFL(Lv),keep:[H1,H2]});c.rk=ugRK(Lv);ugCaveDress(b,c,ctx,R,Lv);
 /* the banks meet the passage's floor edges: find those four corners */
 const side=k=>{const o=[];for(let i=0;i<c.n;i++)o.push(c.edge(i)[k]);return o};const Ls=side(0),Rs=side(1);
 const hit=(poly,P0,d)=>{for(let i=0;i<poly.length-1;i++){const A=poly[i],B=poly[i+1],ex=B[0]-A[0],ez=B[1]-A[1],den=d[0]*ez-d[1]*ex;if(Math.abs(den)<1e-9)continue;const t=((A[0]-P0[0])*ez-(A[1]-P0[1])*ex)/den,s=((A[0]-P0[0])*d[1]-(A[1]-P0[1])*d[0])/den;if(s>=0&&s<=1)return[P0[0]+d[0]*t,P0[1]+d[1]*t]}return null};
 const e1=[a[0]+n[0]*w/2,a[1]+n[1]*w/2],e2=[a[0]-n[0]*w/2,a[1]-n[1]*w/2];const C={a1:hit(Ls,e1,u),b1:hit(Rs,e1,u),a2:hit(Ls,e2,u),b2:hit(Rs,e2,u)};if(!C.a1||!C.b1||!C.a2||!C.b2)return;
 const pos=[],q4=(A,B,Cc,D,want)=>{const v1=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],v2=[Cc[0]-A[0],Cc[1]-A[1],Cc[2]-A[2]],cr=[v1[1]*v2[2]-v1[2]*v2[1],v1[2]*v2[0]-v1[0]*v2[2],v1[0]*v2[1]-v1[1]*v2[0]];const ok=cr[0]*want[0]+cr[1]*want[1]+cr[2]*want[2]>0;for(const q of ok?[A,B,Cc,A,Cc,D]:[A,Cc,B,A,D,Cc])pos.push(q[0],q[1],q[2])};
 const P3=(q,yy)=>[q[0],y+yy,q[1]];
 /* the banks (rock faces down to the bed), the ends where the stream runs under the walls, the bed */
 q4(P3(C.a1,0),P3(C.b1,0),P3(C.b1,-dep),P3(C.a1,-dep),[-n[0],0,-n[1]]);q4(P3(C.a2,0),P3(C.b2,0),P3(C.b2,-dep),P3(C.a2,-dep),[n[0],0,n[1]]);
 const mid=[(C.a1[0]+C.b2[0])/2,(C.a1[1]+C.b2[1])/2];for(const [A,B] of[[C.a1,C.a2],[C.b1,C.b2]]){const wd=[mid[0]-A[0],0,mid[1]-A[1]];q4(P3(A,.02),P3(B,.02),P3(B,-dep),P3(A,-dep),wd)}
 q4(P3(C.a1,-dep),P3(C.b1,-dep),P3(C.b2,-dep),P3(C.a2,-dep),[0,1,0]);
 b.raw('wet2',pos,(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return Array.from(g.attributes.normal.array)})(),pos.map((v,i)=>i%3==1?null:v/2).filter(v=>v!==null));
 /* the water, flowing along u (v of the texture runs downstream) */
 const sy=y-(sf.deep?.3:.12),wp=[],wn=[],wu=[],cs=[C.a1,C.a2,C.b2,C.b1];const tri=[[0,1,2],[0,2,3]];const uvq=q=>[((q[0]-a[0])*n[0]+(q[1]-a[1])*n[1])/w,((q[0]-a[0])*u[0]+(q[1]-a[1])*u[1])/4];
 for(const tr of tri){let T3=tr.map(i=>cs[i]);const cr=(T3[1][0]-T3[0][0])*(T3[2][1]-T3[0][1])-(T3[1][1]-T3[0][1])*(T3[2][0]-T3[0][0]);if(cr>0)T3=[T3[0],T3[2],T3[1]];for(const q of T3){wp.push(q[0],sy,q[1]);wn.push(0,1,0);wu.push(...uvq(q))}}
 b.raw('stream',wp,wn,wu);
 /* stepping stones, or the plank footbridge with a rope rail */
 const L=ugLocal(b,p,y);
 for(const f of p.d.fx){if(f.k=='stones')for(const q of f.pts){const g=new THREE.CylinderGeometry(.36,.48,dep+.06,7);L.geo(ugRK(Lv),g,q[0],-dep/2+.02,q[1],R()*3)}
  if(f.k=='bridge'){const dx=f.x1-f.x0,dz=f.z1-f.z0,l=Math.hypot(dx,dz),yaw=Math.atan2(dx,dz),ux2=dx/l,uz2=dz/l,rx2=uz2,rz2=-ux2;
   for(let s=.15;s<l;s+=.3)L.box('woodD',.95,.06,.26,f.x0+ux2*s,.08,f.z0+uz2*s,yaw);for(const s2 of[-.42,.42])L.box('wood',.1,.1,l,f.x0+dx/2+rx2*s2,.03,f.z0+dz/2+rz2*s2,yaw);
   for(const s2 of[-.5,.5]){for(const e of[0,l]){L.box('wood',.08,1,.08,f.x0+ux2*e+rx2*s2,.5,f.z0+uz2*e+rz2*s2,yaw)}L.geo('rope',new THREE.CylinderGeometry(.022,.022,l,6).rotateX(Math.PI/2),f.x0+dx/2+rx2*s2,.92,f.z0+dz/2+rz2*s2,yaw)}}}}

/* ---------- the ore pass: a short dug room at the end of a timbered neck, a grate over a chute to the cage's cart ---------- */
function ugOrePass(b,p,Lv,ctx,W){const y=UGLY(Lv),L=ugLocal(b,p,y),v=p.d.v||0,rk=ugRK(Lv),fl=ugFL(Lv),T=ugT(p);
 const path=W.shp.find(s=>s.k=='path'),lr=p.d.shp.find(s=>s.k=='rect'),r={x0:lr.x0,x1:lr.x1,z0:lr.z0,z1:lr.z1};
 const op=ugOpenings(p);for(const [q,nb] of[[path.pts[0],path.pts[1]]]){if(!op.some(o=>Math.hypot(o.x-q[0],o.z-q[1])<.05))continue;const fx=q[0]-nb[0],fz=q[1]-nb[1],l=Math.hypot(fx,fz);ugBulkhead(b,q[0],y,q[1],fx/l,fz/l,path.w/2,{rock:rk})}
 ugTube(b,path.pts.map(q=>[q[0],y,q[1]]),{hw:path.w/2,fil:0,rails:false,sets:true,lamps:false,rock:rk,floorKey:fl});
 const g=p.d.fx.find(f=>f.k=='grate'),gh=.85,a=L.pt(g.x-gh,0,g.z-gh),c=L.pt(g.x+gh,0,g.z+gh);
 const hole={x0:Math.min(a.x,c.x),x1:Math.max(a.x,c.x),z0:Math.min(a.z,c.z),z1:Math.max(a.z,c.z)};
 ugRectRoom(b,p,r,3.4,y,{doors:ugDoorsFor(p,r),rock:rk,floor:fl,holes:[hole]});
 /* the chute: rock sides going down, dark below; the grate (or the grizzly's heavy bars) over it */
 const D=3;for(const [ax,az,ry] of[[0,-gh,0],[gh,0,-Math.PI/2],[0,gh,Math.PI],[-gh,0,Math.PI/2]])L.geo(rk,new THREE.PlaneGeometry(2*gh,D),g.x+ax,-D/2,g.z+az,ry);L.geo('black',new THREE.PlaneGeometry(2*gh,2*gh),g.x,-D+.01,g.z,0,-Math.PI/2);
 const bw=v==1?.12:.05,sp=v==1?.3:.18;L.box('steel',2*gh+.4,.08,.14,g.x,.045,g.z-gh-.06,0);L.box('steel',2*gh+.4,.08,.14,g.x,.045,g.z+gh+.06,0);
 for(let x=-gh+sp/2;x<gh;x+=sp)L.box('steel',bw,v==1?.12:.06,2*gh+.3,g.x+x,v==1?.065:.035,g.z,0);if(v!=1)for(const z of[-.4,.4])L.box('steel',2*gh+.2,.04,.05,g.x,.075,g.z+z,0);
 if(v==1){/* the hammer rack: a board on the nearest side wall, a peg, a sledgehammer hanging from it */const q=p.d.fx.find(f=>f.n=='hammer rack').pts[0],sx=Math.sign(q[0])||1,wx=sx>0?r.x1:r.x0,bx=wx-sx*.07;
  L.box('wood',.12,1.2,.9,bx,1.1,q[1],0);L.box('woodD',.22,.06,.06,bx-sx*.15,1.45,q[1],0);L.cyl('woodD',.025,.025,.95,bx-sx*.2,.95,q[1],8);L.box('steel',.14,.14,.3,bx-sx*.2,.46,q[1],0)}
 if(v==2){const rl=p.d.fx.find(f=>f.k=='rail'),q=p.d.fx.find(f=>f.n=='skip').pts[0];const w1=T(rl.pts[0][0],rl.pts[0][1]),w2=T(rl.pts[1][0],rl.pts[1][1]+.4);ugRailLine(b,[w1,w2],y,ctx,0);
  const wk=T(q[0],q[1]);ugCart(b,wk[0],y,wk[1],ugYaw(p));L.box('oreRock',.8,.12,1.2,q[0],.9,q[1],0)}
 /* a lamp, and veins in the dug walls */
 ugHangLamp(L,ctx,0,-3.2,2.5,3.4,1);ugWallVeins(L,r,ugLocalDoors(p,r),ctx,ugRng(p.id*41+3),{gap:2.6,ys:[.9,2],pick:()=>'ag',skip:.4,h:3.4})}

/* ---------- the level 2 stations: the kit builds the room and the shaft; these are their own props ---------- */
{const p0=ugProp;ugProp=function(b,n,x,y,z,yaw,r,ctx){const c=Math.cos(yaw),s=Math.sin(yaw),at=(lx,lz)=>[x+c*lx+s*lz,z-s*lx+c*lz];
 if(n=='map board'){b.box('board',1.7,1.1,.08,x,y+1.55,z,yaw);for(const sd of[-.7,.7]){const q=at(sd,-.1);b.box('woodD',.1,2.2,.1,q[0],y+1.1,q[1],yaw)}if(ctx){const q=at(0,.05);ctx.signs.push({x:q[0],y:y+1.55,z:q[1],yaw,txt:'LEVEL 2 MAP',w:1.6,h:1,map:1})}return}
 if(n=='pump'){b.box('dark',1.3,.25,1.3,x,y+.125,z,yaw);b.cyl('steel',.42,.42,1.1,x,y+.8,z,18);b.cyl('dark',.5,.5,.1,x,y+1.4,z,18);b.cyl('steel',.12,.12,4.2,x,y+3.4,z,10);const q=at(.6,0);b.cyl('dark',.32,.32,.5,q[0],y+.6,q[1],14,yaw,0,Math.PI/2);return}
 if(n=='air bottles'){b.box('steel',.9,.08,.5,x,y+.04,z,yaw);for(let i=0;i<4;i++){const q=at(-.33+i*.22,0);b.cyl('paintY',.09,.09,1.3,q[0],y+.73,q[1],12);b.cyl('steel',.03,.03,.12,q[0],y+1.44,q[1],8)}b.box('steel',.9,.05,.05,x,y+1.0,z,yaw);return}
 if(n=='refuge chamber'){/* a steel box with a heavy door on its front, air bottles inside */const w=2.6,d=2.2,h=2.3;b.box('paintY',w,h,d,x,y+h/2,z,yaw);b.box('dark',w+.08,.12,d+.08,x,y+h+.06,z,yaw);
  /* the door is on the side facing the room (local -z) */const q=at(0,-d/2-.03);b.box('steel',.9,1.9,.06,q[0],y+1,q[1],yaw);const q2=at(-.3,-d/2-.08);b.cyl('steel',.14,.14,.05,q2[0],y+1.1,q2[1],14,yaw,Math.PI/2);if(ctx){const q3=at(0,-d/2-.07);ctx.signs.push({x:q3[0],y:y+2.05,z:q3[1],yaw:yaw+Math.PI,txt:'REFUGE',w:1.1})}return}
 return p0.apply(this,arguments)}}
{const s0=ugStationBuild;ugStationBuild=function(b,p,L,ctx){s0(b,p,L,ctx);if(L==0)return;const y=UGLY(L),T=ugT(p),v=p.d.v||0;
 /* Cave station: a timber platform round the cage */
 if(v==0&&L==1){for(const [x0,x1,z0,z1] of[[-4.2,4.2,1.9,4.2],[-4.2,4.2,-4.2,-1.9],[-4.2,-1.9,-1.9,1.9],[1.9,4.2,-1.9,1.9]]){const a=T(x0,z0),c=T(x1,z1);b.box('plank',Math.abs(c[0]-a[0]),.1,Math.abs(c[1]-a[1]),(a[0]+c[0])/2,y+.05,(a[1]+c[1])/2,0)}}
 /* puddles (the pumping station) */
 for(const f of p.d.fx)if(f.k=='water'){const w=T(f.cx,f.cz),sw=p.r%2==1;b.add('waterS',new THREE.CircleGeometry(1,32).rotateX(-Math.PI/2),new THREE.Matrix4().compose(new THREE.Vector3(w[0],y+.015,w[1]),new THREE.Quaternion(),new THREE.Vector3(sw?f.rz:f.rx,1,sw?f.rx:f.rz)))}}}

/* ---------------- docs/design/models/quarry-under-l2r.js ---------------- */
/* =====================================================================================================
   The Old Quarry underground, batch 3 (second half): THE LEVEL 2 CAVE ROOMS (docs/design/quarry-underground.md).
   Needs quarry-under.js, -kit.js, -l1.js and -l2.js. ugPieceL2 calls ugCaveRoom(b, p, L, ctx, blob) for the crystal
   grotto, fungus grotto, flooded gallery, chasm hall and stalactite hall; each picks its version from the plan (p.d.v)
   and places its things in the piece's own coords. Positions of solid things and hazards come from the plan's
   versions (UGV, tested by quarry-under-check.js); scattered dressing keeps 3 m clear of every doorway and, for big
   things, 1.6 m clear of the straight ways between doorways. Big solid dressing (giant mushroom stems, roots) is also
   listed in ctx.solids (mine coords, {x, z, r}) for the game's walking.
   ===================================================================================================== */

/* ---------- materials ---------- */
{const k0=ugKit;ugKit=function(){const K=k0();if(K.l2r)return K;K.l2r=1;const M=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.9},o));
 /* soft round fade (mist), streaks for falling water, a spiral shell (fossils) */
 K.fadeT=ugCanvas(128,128,(k,w,h)=>{const g=k.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.6,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');k.fillStyle=g;k.fillRect(0,0,w,h)});
 /* falling water: a thin sheet everywhere, many soft streaks that swell and thin along their length (so scrolling
    looks like flowing water, not moving bars), soft left and right edges; tiles top to bottom */
 const fallTex=seed=>ugCanvas(256,512,(k,w,h)=>{const r=ugRng(seed);k.fillStyle='rgb(70,70,70)';k.fillRect(0,0,w,h);
  for(let i=0;i<170;i++){const x=12+r()*(w-24),lw=1.5+r()*7,a=.12+r()*.4,ph=r()*6.28,fr=1+(r()*3|0),wv=r()*2;
   for(let y=0;y<h;y+=4){const al=a*(.5+.5*Math.sin(y/h*Math.PI*2*fr+ph));k.fillStyle='rgba(255,255,255,'+al.toFixed(3)+')';k.fillRect(x+Math.sin(y/h*Math.PI*6+ph)*wv-lw/2,y,lw,4.5)}}
  k.globalCompositeOperation='multiply';const g=k.createLinearGradient(0,0,w,0);g.addColorStop(0,'#000');g.addColorStop(.2,'#fff');g.addColorStop(.8,'#fff');g.addColorStop(1,'#000');k.fillStyle=g;k.fillRect(0,0,w,h);k.globalCompositeOperation='source-over'});
 K.fallT=fallTex(77);K.fallT.repeat.set(1,1.2);K.fallT2=fallTex(91);K.fallT2.repeat.set(1,.9);
 K.ammoT=ugCanvas(128,128,(k,w,h)=>{k.fillStyle='#b8a888';k.fillRect(0,0,w,h);k.strokeStyle='#6a5a44';k.lineWidth=3;k.beginPath();for(let a=0;a<6*Math.PI;a+=.1){const r=3+a*3.1;k.lineTo(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r)}k.stroke();
  for(let a=.5;a<6*Math.PI;a+=.45){const r=3+a*3.1;k.beginPath();k.moveTo(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r);k.lineTo(w/2+Math.cos(a)*(r+8),h/2+Math.sin(a)*(r+8));k.stroke()}});
 Object.assign(K.mat,{
  selenite:new THREE.MeshStandardMaterial({color:0xf4f0e4,emissive:0x5a5448,emissiveIntensity:.6,roughness:.2,metalness:.05,flatShading:true}),
  mist:new THREE.MeshBasicMaterial({map:K.fadeT,color:0xe8f4ff,transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide}),
  /* falling water, two sheets (the game scrolls K.fallT.offset.y by about +1.2 and K.fallT2.offset.y by +0.9 per second) */
  falls:new THREE.MeshStandardMaterial({color:0xd8ecf6,emissive:0x1a2a30,roughness:.3,alphaMap:K.fallT,transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide}),
  falls2:new THREE.MeshStandardMaterial({color:0xa8c8d8,emissive:0x101c22,roughness:.3,alphaMap:K.fallT2,transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide}),
  foam:new THREE.MeshBasicMaterial({map:K.fadeT,color:0xffffff,transparent:true,opacity:.7,depthWrite:false}),
  poolC:new THREE.MeshStandardMaterial({color:0x38c8f0,emissive:0x1a90c0,emissiveIntensity:.8,roughness:.1,transparent:true,opacity:.7,depthWrite:false,normalMap:K.poolN,normalScale:new THREE.Vector2(.25,.25)}),
  poolT:new THREE.MeshStandardMaterial({color:0x2fb8a0,emissive:0x1a8a70,emissiveIntensity:.7,roughness:.1,transparent:true,opacity:.62,depthWrite:false,normalMap:K.poolN,normalScale:new THREE.Vector2(.25,.25)}),
  poolB:new THREE.MeshStandardMaterial({color:0x1c3e58,roughness:.12,metalness:.3,transparent:true,opacity:.66,depthWrite:false,normalMap:K.poolN,normalScale:new THREE.Vector2(.3,.3)}),
  glowBed:new THREE.MeshBasicMaterial({color:0x6af0d0}),glowB:new THREE.MeshBasicMaterial({color:0x9ff8ff}),tipG:new THREE.MeshBasicMaterial({color:0xfff0a8}),
  moss:M({color:0x4a7a3a,roughness:1}),lily:M({color:0x3f8a3a,roughness:.7}),frog:M({color:0x5aa040,roughness:.6}),
  root:M({map:K.woodT,color:0xe8dcc0,roughness:.85}),bone:M({color:0xe0d4b4,roughness:.8}),puff:M({color:0xece4d2,roughness:1}),
  ammo:M({map:K.ammoT,roughness:.8})});
 for(const k in K.mat)K.mat[k].userData.ug=k;for(const k of['poolC','poolT','poolB'])K.mat[k].userData.ro=2;K.mat.mist.userData.ro=3;K.mat.falls.userData.ro=3;K.mat.falls2.userData.ro=3;K.mat.foam.userData.ro=3;return K}}

/* ---------- helpers ---------- */
const ugProfY=(pr,r)=>{if(r>=1)return 0;for(let i=1;i<pr.length;i++)if(r>=pr[i][0]){const a=pr[i-1],c=pr[i],t=(r-a[0])/((c[0]-a[0])||1);return a[1]+(c[1]-a[1])*t}return pr[pr.length-1][1]};
const ugSegD=(x,z,a,c)=>{const vx=c[0]-a[0],vz=c[1]-a[1],l=vx*vx+vz*vz||1,t=Math.max(0,Math.min(1,((x-a[0])*vx+(z-a[1])*vz)/l));return Math.hypot(x-a[0]-vx*t,z-a[1]-vz*t)};
/* clip a polygon by a convex one (Sutherland-Hodgman); both [[x,z]...], the clip polygon anticlockwise */
function ugClip(poly,clip){let out=poly;for(let i=0;i<clip.length;i++){const A=clip[i],B=clip[(i+1)%clip.length],inside=q=>(B[0]-A[0])*(q[1]-A[1])-(B[1]-A[1])*(q[0]-A[0])>=0;const inp=out;out=[];
  for(let k=0;k<inp.length;k++){const P=inp[k],Q=inp[(k+1)%inp.length],ip=inside(P),iq=inside(Q);if(ip)out.push(P);if(ip!=iq){const dx=Q[0]-P[0],dz=Q[1]-P[1],ex=B[0]-A[0],ez=B[1]-A[1],den=dx*ez-dz*ex;if(Math.abs(den)>1e-12){const t=((A[0]-P[0])*ez-(A[1]-P[1])*ex)/den;out.push([P[0]+dx*t,P[1]+dz*t])}}}if(!out.length)break}return out}
const ugArea=P=>{let a=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];a+=p[0]*q[1]-q[0]*p[1]}return a/2};
/* a basin made of overlapping ovals (each with its own depth profile), meshed in rings round a middle point c.
   Returns its outline (for the floor hole) and depthAt(x,z) */
function ugBasinShape(parts,c){let o=[];for(const P of parts)for(let i=0;i<72;i++){const a=i/72*Math.PI*2,x=P.cx+P.rx*Math.cos(a),z=P.cz+P.rz*Math.sin(a);if(parts.every(Q=>Q===P||Math.hypot((x-Q.cx)/Q.rx,(z-Q.cz)/Q.rz)>=1))o.push([x,z])}
 o.sort((a,b)=>Math.atan2(a[1]-c[1],a[0]-c[0])-Math.atan2(b[1]-c[1],b[0]-c[0]));
 const depthAt=(x,z)=>Math.min(...parts.map(P=>ugProfY(P.prof,Math.hypot((x-P.cx)/P.rx,(z-P.cz)/P.rz))));return{pts:o,depthAt,c}}
function ugBasin(L,B,o){const K=12,n=B.pts.length,pos=[],uv=[],idx=[];for(let k=0;k<=K;k++){const f=k/K;for(let i=0;i<n;i++){const q=B.pts[i],x=q[0]+(B.c[0]-q[0])*f,z=q[1]+(B.c[1]-q[1])*f;pos.push(x,k?B.depthAt(x,z):0,z);uv.push(x/2.5,z/2.5)}}
 for(let k=0;k<K;k++)for(let i=0;i<n;i++){const i2=(i+1)%n,a=k*n+i,b2=k*n+i2,c=(k+1)*n+i2,d=(k+1)*n+i;idx.push(a,c,b2,a,d,c)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 if(g.attributes.normal.getY(n*3)<0){const ix=g.index.array;for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t}g.computeVertexNormals()}L.geo(o.rock||'wet2',g,0,0,0);
 const sh=new THREE.Shape();B.pts.forEach((q,i)=>i?sh.lineTo(q[0],-q[1]):sh.moveTo(q[0],-q[1]));const sg=new THREE.ShapeGeometry(sh);sg.rotateX(-Math.PI/2);const pa=sg.attributes.position,su=[];for(let i=0;i<pa.count;i++)su.push(pa.getX(i)/6,pa.getZ(i)/6);sg.setAttribute('uv',new THREE.Float32BufferAttribute(su,2));L.geo(o.key||'pool',sg,0,o.surf,0)}
/* a rope or cable hanging between two local points with a sag */
function ugSag(L,key,a,c,sag,r,n){n=n||16;const P=[];for(let i=0;i<=n;i++){const t=i/n;P.push(new THREE.Vector3(a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t-sag*4*t*(1-t),a[2]+(c[2]-a[2])*t))}L.geo(key,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P),n*2,r,5,false),0,0,0);return P}
/* a box from point a to point b (local, [x,y,z]), w x h cross-section */
function ugBeam(L,key,a,c,w,h){const dx=c[0]-a[0],dy=c[1]-a[1],dz=c[2]-a[2],l=Math.hypot(dx,dy,dz),g=new THREE.BoxGeometry(w,h,l);g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(dx/l,dy/l,dz/l))));L.geo(key,g,(a[0]+c[0])/2,(a[1]+c[1])/2,(a[2]+c[2])/2)}

/* ---------- the rooms ---------- */
function ugCaveRoom(b,p,Lv,ctx,bl){const t=p.type,v=p.d.v||0,y=UGLY(Lv),rk=ugRK(Lv),R=ugRng(p.id*977+v*13+5),fx=k=>p.d.fx.filter(f=>f.k==k),f1=k=>fx(k)[0];
 const base={cx:bl.cx,cz:bl.cz,rx:bl.rx,rz:bl.rz},L0=ugLocal(b,p,y),doors=ugChamberShape(p,base).doors;
 const solid=(x,z,r)=>{const w=L0.pt(x,0,z);ctx.solids.push({x:w.x,z:w.z,r})},lamp=(x,yy,z,s)=>{const w=L0.pt(x,yy,z);ctx.lamps.push([w.x,w.y,w.z,s||1])};
 /* the straight ways between doorways (or from the only doorway to the middle) stay clear of big things */
 const ways=doors.length>1?doors.flatMap((a,i)=>doors.slice(i+1).map(c=>[[a.x,a.z],[c.x,c.z]])):[[[doors[0].x,doors[0].z],[bl.cx,bl.cz]]];
 const onWay=(x,z,m)=>ways.some(w=>ugSegD(x,z,w[0],w[1])<(m||1.6)),nearDoor=(x,z,d)=>doors.some(q=>Math.hypot(q.x-x,q.z-z)<(d||3));
 const scatter=(n,cx,cz,rx,rz,minD,big,also)=>{const o=[];for(let k=0;o.length<n&&k<n*60;k++){const a=R()*6.28,r=Math.sqrt(R()),x=cx+Math.cos(a)*rx*r,z=cz+Math.sin(a)*rz*r;
   if(nearDoor(x,z)||(big&&onWay(x,z))||o.some(q=>Math.hypot(q[0]-x,q[1]-z)<minD)||(also&&also(x,z)))continue;o.push([x,z])}return o};
 const room=o=>ugChamber(b,p,Lv,ctx,Object.assign({},base,o));
 const drips=(ch,n,key,rmax)=>{for(let i=0;i<n;i++){const a=R()*6.28,r=Math.sqrt(R())*.85,x=bl.cx+Math.cos(a)*bl.rx*r,z=bl.cz+Math.sin(a)*bl.rz*r;ugDrip(ch.L,x,z,.06+R()*(rmax||.12),.3+R()*1.1,ch.roofAt(x,z),true,key)}};

 /* ====== CRYSTAL GROTTO ====== */
 if(t=='crystal'){const wf=f1('water');const pick=()=>{const r=R();return r<.45?'cr':r<.75?'ag':'au'};
  const ch=room({dome:v==2?5.6:v==4?4.2:3.6,pits:v==1?[{cx:wf.cx,cz:wf.cz,rx:wf.rx,rz:wf.rz}]:[],pick}),L=ch.L;
  const clusters=(pts,s0,s1,key,lit)=>pts.forEach((q,i)=>{const s=s0+R()*(s1-s0);ugCrystals(L,R,q[0],q[1],s,key);if(lit&&i<lit)lamp(q[0],.8,q[1],1.1)});
  /* crystals at the foot of the walls, all round */
  const wall=(n,key)=>{for(let i=0;i<n;i++){const a=R()*6.28,w=ch.wallPt(a,.3);if(nearDoor(w.x,w.z,3.2))continue;ugCrystals(L,R,w.x-w.nx*.25,w.z-w.nz*.25,.6+R()*.7,key)}};
  if(v==0){const sp=f1('spots');clusters(scatter(sp.n,sp.dx||0,sp.cz,sp.rx,sp.rz,1.5,true),.6,1.5,'crystal',4);wall(10,'crystal')}
  if(v==1){/* the glowing pool: shallow enough to wade, lit from inside; crystals round it and under its edge */
   ugPool(L,wf,{prof:[[1,0],[.95,-.2],[.8,-.42],[.5,-.58],[0,-.62]],surf:-.05,dep:.62,key:'poolC',rock:'wet2'});lamp(wf.cx,.2,wf.cz,1.6);
   const rs=f1('ringspots');for(let i=0;i<rs.n;i++){const a=i/rs.n*6.28+R()*.2,x=rs.cx+Math.cos(a)*rs.rx,z=rs.cz+Math.sin(a)*rs.rz;if(nearDoor(x,z,2.4))continue;ugCrystals(L,R,x,z,.7+R()*.6,'crystal')}
   for(let i=0;i<9;i++){const a=R()*6.28,r=.72+R()*.12,x=wf.cx+Math.cos(a)*wf.rx*r,z=wf.cz+Math.sin(a)*wf.rz*r;ugCrystals(L,R,x,z,.4+R()*.3,'crystal',ugProfY([[1,0],[.95,-.2],[.8,-.42],[.5,-.58],[0,-.62]],r))}wall(6,'crystal')}
  if(v==2){/* selenite beams across the cave: one to climb over, one to duck under, one high; ends sunk into the walls */
   const hs=[[2.6,3.4],[2.9,4.3],[3.6,5]],rs=[.42,.34,.5];f1('beams').ls.forEach((l,i)=>{const [a,c]=l,dx=c[0]-a[0],dz=c[1]-a[1],n=Math.hypot(dx,dz),ux=dx/n,uz=dz/n,h=hs[i%3];
    const A=[a[0]-ux*3,h[0]-(h[1]-h[0])*3/n,a[1]-uz*3],C=[c[0]+ux*3,h[1]+(h[1]-h[0])*3/n,c[1]+uz*3],g=new THREE.CylinderGeometry(rs[i%3],rs[i%3],Math.hypot(C[0]-A[0],C[1]-A[1],C[2]-A[2]),6);
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(C[0]-A[0],C[1]-A[1],C[2]-A[2]).normalize())));L.geo('selenite',g,(A[0]+C[0])/2,(A[1]+C[1])/2,(A[2]+C[2])/2);
    const m=[(a[0]+c[0])/2,(a[1]+c[1])/2];lamp(m[0],(h[0]+h[1])/2+.6,m[1],.9)});
   clusters(scatter(7,0,bl.cz,5.5,7,2,true),.5,1,'selenite',0);wall(5,'selenite')}
  if(v==3){/* frost: pale crystals, icicles, a cold mist at knee height */
   const sp=f1('spots');clusters(scatter(sp.n,0,sp.cz,sp.rx,sp.rz,1.4,true),.5,1.2,'frost',3);wall(8,'frost');drips(ch,26,'frost',.08);
   const mi=f1('mist');for(const [yy,s] of[[.18,1],[.42,.9],[.68,.75]])L.geo('mist',new THREE.CircleGeometry(1,40).rotateX(-Math.PI/2),mi.cx,yy,mi.cz,0,0,0,mi.rx*s,1,mi.rz*s)}
  if(v==4){/* huge six-sided crystal columns from floor to roof */
   const cf=f1('cols');cf.pts.forEach((q,i)=>{const tp=ch.roofAt(q[0],q[1])+.9,g=new THREE.CylinderGeometry(cf.r*.85,cf.r,tp+.1,6);L.geo('crystal',g,q[0],(tp+.1)/2-.1,q[1],R()*1.05);ugCrystals(L,R,q[0]+cf.r,q[1],.6,'crystal');if(i<2)lamp(q[0],1.4,q[1],1.2)});wall(6,'crystal')}
  return true}

 /* ====== FUNGUS GROTTO ====== */
 if(t=='fungus'){const wf=f1('water'),led=f1('ledge');
  const ch=room({dome:5,pits:v==2?[{cx:wf.cx,cz:wf.cz,rx:wf.rx,rz:wf.rz}]:[],pick:()=>{const r=R();return r<.35?'ag':r<.5?'au':r<.75?'fe':'cu'}}),L=ch.L;
  const giants=(pts,key)=>pts.forEach((q,i)=>{const cr=1.3+R()*.8,a=R()*6.28,rf=Math.min(ch.roofAt(q[0],q[1]),ch.roofAt(q[0]+Math.cos(a)*(cr+.5),q[1]+Math.sin(a)*(cr+.5))),h=Math.max(2.4,Math.min(3+R()*1.4,rf-.7-.45*cr)),top=ugMushroom(L,R,q[0],q[1],h,cr,key,[Math.cos(a)*.5,Math.sin(a)*.5]);solid(q[0],q[1],.4);if(i<4)lamp(top[0],top[1]-.5,top[2],1)});
  const smalls=(pts,key,s0,s1)=>pts.forEach(q=>{const n=2+(R()*3|0);for(let k=0;k<n;k++){const h=s0+R()*(s1-s0);ugMushroom(L,R,q[0]+(R()-.5)*.8,q[1]+(R()-.5)*.8,h,h*.45+R()*.1,key,[(R()-.5)*.2,(R()-.5)*.2])}});
  const moss=(pts)=>pts.forEach(q=>{const g=new THREE.CircleGeometry(1,10);const pa=g.attributes.position;for(let i=1;i<pa.count;i++){const k=.7+R()*.5;pa.setXY(i,pa.getX(i)*k,pa.getY(i)*k)}g.rotateX(-Math.PI/2);L.geo('moss',g,q[0],.012,q[1],R()*6,0,0,.6+R()*.7,1,.5+R()*.6)});
  const glowworms=n=>{for(let i=0;i<n;i++){const a=R()*6.28,r=Math.sqrt(R())*.9,x=bl.cx+Math.cos(a)*bl.rx*r,z=bl.cz+Math.sin(a)*bl.rz*r,rf=ch.roofAt(x,z),l=.12+R()*.3;
   L.cyl('stem',.004,.004,l+1,x,rf-l/2+.5,z,3);L.geo('glowB',new THREE.SphereGeometry(.028,6,4),x,rf-l,z)}};
  const vines=n=>{for(let i=0;i<n;i++){const a=R()*6.28,w=ch.wallPt(a,3.4);if(nearDoor(w.x,w.z,3))continue;const l=1+R()*1.8,P=[];for(let k=0;k<=5;k++)P.push(new THREE.Vector3(w.x-w.nx*(.05+k*.05)+Math.sin(k*1.7+i)*.12,3.9-l*k/5,w.z-w.nz*(.05+k*.05)+Math.cos(k*1.3+i)*.12));L.geo('moss',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P),12,.035,4,false),0,0,0)}};
  if(v==0){const pk=fx('spots').find(f=>f.c=='#e58ae0'),gr=fx('spots').find(f=>f.c!='#e58ae0');const big=scatter(6,0,pk.cz,pk.rx*.72,pk.rz*.72,3.2,true);giants(big,'capP');
   smalls(scatter(10,0,pk.cz,pk.rx,pk.rz,1.4,true,(x,z)=>big.some(q=>Math.hypot(q[0]-x,q[1]-z)<2)),'capP',.5,1.3);smalls(scatter(6,0,gr.cz,gr.rx,gr.rz,1.6,false),'capG',.2,.5);moss(scatter(gr.n,0,gr.cz,gr.rx,gr.rz,1.2,false));vines(14);glowworms(90)}
  if(v==1){/* puffballs as big as cars, and small ones round them */
   for(const q of f1('puff').pts){const g=new THREE.IcosahedronGeometry(1.55,2),pa=g.attributes.position;for(let i=0;i<pa.count;i++){const w=L0.pt(q[0]+pa.getX(i),pa.getY(i),q[1]+pa.getZ(i)),k=.94+.12*ugNoise(w.x*2,w.y*2,w.z*2);pa.setXYZ(i,pa.getX(i)*k,pa.getY(i)*k,pa.getZ(i)*k)}g.computeVertexNormals();L.geo('puff',g,q[0],1.55*.78-.12,q[1],R()*3,0,0,1,.78,1)}
   for(const q of scatter(14,0,bl.cz,7.5,7.5,1,false,(x,z)=>f1('puff').pts.some(p2=>Math.hypot(p2[0]-x,p2[1]-z)<2.1))){const r=.2+R()*.35;L.geo('puff',new THREE.SphereGeometry(r,10,8),q[0],r*.75,q[1],0,0,0,1,.8,1)}
   smalls(scatter(6,0,bl.cz,8,8,2,true),'capP',.3,.8);for(const q of f1('puff').pts.slice(0,3))lamp(q[0],3,q[1],.8);glowworms(40)}
  if(v==2){/* the glow pond: lit from below, lily pads, mushrooms round the edge, frogs */
   ugPool(L,wf,{bowl:1,surf:-.2,dep:2,key:'poolT',rock:'wet2',layers:false});L.geo('glowBed',new THREE.CircleGeometry(1,24).rotateX(-Math.PI/2),wf.cx,-1.6,wf.cz,0,0,0,wf.rx*.35,1,wf.rz*.35);lamp(wf.cx,-.3,wf.cz,1.8);
   const lp=fx('spots').find(f=>f.c=='#5fbf6a');const pads=[];for(let k=0;pads.length<lp.n&&k<300;k++){const a=R()*6.28,r=Math.sqrt(R())*.8,x=wf.cx+Math.cos(a)*wf.rx*r,z=wf.cz+Math.sin(a)*wf.rz*r;if(pads.some(q=>Math.hypot(q[0]-x,q[1]-z)<1.2))continue;pads.push([x,z])}
   pads.forEach((q,i)=>{const r=.35+R()*.3;L.geo('lily',new THREE.CircleGeometry(r,16,.4,Math.PI*2-.5).rotateX(-Math.PI/2),q[0],-.185,q[1],R()*6);if(i<3){L.geo('frog',new THREE.SphereGeometry(.13,10,8),q[0],-.12,q[1],0,0,0,1,.7,1.2);for(const sd of[-.06,.06])L.geo('frog',new THREE.SphereGeometry(.04,8,6),q[0]+sd,-.05,q[1]-.08)}});
   const rs=f1('ringspots');for(let i=0;i<rs.n;i++){const a=i/rs.n*6.28,x=rs.cx+Math.cos(a)*rs.rx,z=rs.cz+Math.sin(a)*rs.rz;if(nearDoor(x,z,2.6)||onWay(x,z,1.2))continue;const h=.7+R()*1.4;ugMushroom(L,R,x,z,h,h*.4+.1,'capP',[Math.cos(a)*.15,Math.sin(a)*.15])}glowworms(60)}
  if(v==3){/* the shelf-fungus wall: shelves like steps up to a high ledge with gold */
   const x0=Math.min(led.x0,led.x1),x1=Math.max(led.x0,led.x1),side=x0>0?1:-1,face=side>0?x0:x1,lh=1.6,w=5.2;   /* low enough that you can stand up on it under the curve of the roof */const lx=side>0?(face+w/2):(face-w/2);
   L.box(rk,w,lh,led.z1-led.z0,lx,lh/2,(led.z0+led.z1)/2,0);L.box(ugFL(Lv),w-.1,.02,led.z1-led.z0-.1,lx,lh+.01,(led.z0+led.z1)/2,0);
   for(let i=0;i<6;i++){const yy=lh*(i+1)/6,z=led.z1-.6-i*(led.z1-led.z0-1.2)/5,g=new THREE.CylinderGeometry(.72,.8,.15,16,1,false,side>0?Math.PI:0,Math.PI);L.geo('capT',g,face,yy-.075,z)}
   for(let i=0;i<5;i++){const a=Math.atan2((led.z0+led.z1)/2-bl.cz+(i-2)*.9,side*bl.rx),w2=ch.wallPt(a,lh+.5+R()*.8);ctx.veins.push((()=>{const W=L0.pt(w2.x+w2.nx*.06,w2.y,w2.z+w2.nz*.06),d=L0.dir(-w2.nx,-w2.nz);return{x:W.x,y:W.y,z:W.z,dx:d[0],dz:d[1],t:'au'}})())}
   const pk=fx('spots').find(f=>f.c=='#e58ae0');smalls(scatter(8,pk.dx||0,pk.cz,pk.rx,pk.rz,1.6,true,(x,z)=>x*side>face*side-1.2),'capP',.5,1.4);giants(scatter(2,-side*3,bl.cz,3,5,4,true,(x,z)=>x*side>face*side-2.5),'capP');glowworms(50)}
  if(v==4){/* the root hall: thick pale roots from the roof to the floor, thinner ones ending in glowing tips */
   const cf=f1('cols');for(const q of cf.pts){const tp=ch.roofAt(q[0],q[1])+1,P=[];for(let k=0;k<=6;k++){const f=k/6;P.push(new THREE.Vector3(q[0]+Math.sin(f*4+q[0])*.25,tp-(tp+.15)*f,q[1]+Math.cos(f*3+q[1])*.25))}
    L.geo('root',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P),24,cf.r*.7,8,false),0,0,0);L.geo('root',new THREE.ConeGeometry(cf.r*1.3,.6,8),P[6].x,.25,P[6].z);solid(q[0],q[1],cf.r)}
   for(let i=0;i<16;i++){const a=R()*6.28,r=Math.sqrt(R())*.85,x=bl.cx+Math.cos(a)*bl.rx*r,z=bl.cz+Math.sin(a)*bl.rz*r,rf=ch.roofAt(x,z),l=1+R()*1.8;
    L.cyl('root',.03,.1,l+1,x,rf-l/2+.5,z,6);L.geo('tipG',new THREE.SphereGeometry(.07,8,6),x,rf-l,z);if(i<4)lamp(x,rf-l-.2,z,.7)}
   smalls(scatter(6,0,bl.cz,8,8,2,false),'capG',.2,.5);moss(scatter(10,0,bl.cz,8,8,1.4,false))}
  return true}

 /* ====== FLOODED GALLERY ====== */
 if(t=='flooded'){const ws=fx('water'),pk=()=>{const r=R();return r<.4?'ag':r<.6?'au':r<.8?'fe':'cu'};
  if(v==3){/* the waterfall gallery: a plunge pool and a wading channel joined into one basin */
   const deep=ws.find(w=>w.deep),sh=ws.find(w=>!w.deep);const B=ugBasinShape([{cx:deep.cx,cz:deep.cz,rx:deep.rx,rz:deep.rz,prof:[[1,0],[.92,-.35],[.7,-1.2],[.35,-2],[0,-2.2]]},{cx:sh.cx,cz:sh.cz,rx:sh.rx,rz:sh.rz,prof:[[1,0],[.95,-.25],[.88,-.42],[0,-.45]]}],[(deep.cx+sh.cx)/2,deep.cz]);
   const fl0=f1('falls'),ch=room({dome:3,holes:[B.pts],pick:pk,noVein:(x,z)=>Math.hypot(x-fl0.x,z-fl0.z)<2.6}),L=ch.L;ugBasin(L,B,{surf:-.04,key:'pool'});
   for(const f of[.3,.55,.8]){const d=-.04+(-2.2+.04)*f,pr=[[1,0],[.92,-.35],[.7,-1.2],[.35,-2],[0,-2.2]];let r=0;for(let i=1;i<pr.length;i++)if(d>=pr[i][1]){r=pr[i-1][0]+(pr[i][0]-pr[i-1][0])*(d-pr[i-1][1])/(pr[i][1]-pr[i-1][1]);break}if(r>.05)L.geo('poolD',new THREE.CircleGeometry(1,40).rotateX(-Math.PI/2),deep.cx,d,deep.cz,0,0,0,deep.rx*r*1.03,1,deep.rz*r*1.03)}
   /* the source: a dark crack in the wall with a rock lip under it; the water spills over the lip, curves out and falls
      into the plunge pool as two soft sheets, with foam and spray where it lands */
   const fl=f1('falls'),an=Math.atan2(fl.z-bl.cz,fl.x-bl.cx),top=3.1,w=ch.wallPt(an,top),wc=ch.wallPt(an,top+.42),yaw=Math.atan2(-w.nx,-w.nz),io=(q,o2)=>[q.x-q.nx*o2,q.z-q.nz*o2];
   {const c=io(wc,-.22);L.box('black',1.5,.3,.6,c[0],top+.42,c[1],yaw)}
   {const g=new THREE.IcosahedronGeometry(1,1),pa=g.attributes.position;for(let i=0;i<pa.count;i++){const k=.85+.3*ugNoise(pa.getX(i)*3+fl.x,pa.getY(i)*3,pa.getZ(i)*3+fl.z);pa.setXYZ(i,pa.getX(i)*k,pa.getY(i)*k,pa.getZ(i)*k)}g.computeVertexNormals();const c=io(w,.1);L.geo(rk,g,c[0],top,c[1],yaw,0,0,1.05,.28,.5)}
   const sheet=(key,o0,o1,w0,w1)=>{const g=new THREE.PlaneGeometry(1,1,6,14),pa=g.attributes.position;for(let i=0;i<pa.count;i++){const f=.5-pa.getY(i),wd=w0+(w1-w0)*f;pa.setXYZ(i,pa.getX(i)*wd,top+.24-(top+.3)*f,o0+(o1-o0)*Math.sqrt(f))}g.computeVertexNormals();L.geo(key,g,w.x,0,w.z,yaw)};
   sheet('falls2',.48,1.05,.9,1.4);sheet('falls',.56,1.18,1.05,1.7);
   const fp=io(w,1.15);L.geo('foam',new THREE.CircleGeometry(.95,20).rotateX(-Math.PI/2),fp[0],-.02,fp[1]);L.geo('foam',new THREE.RingGeometry(1.1,1.5,24).rotateX(-Math.PI/2),fp[0],-.025,fp[1]);
   /* spray: three soft upright planes crossing at the foot of the falls, so it reads as a puff from any side */
   for(let k=0;k<3;k++)L.geo('mist',new THREE.PlaneGeometry(2.4,1.7),fp[0],.75,fp[1],yaw+k*Math.PI/3);
   return true}
  const wf=ws[0],pf={0:[[1,0],[.96,-.25],[.9,-.42],[0,-.45]],1:null,2:[[1,0],[.9,-.35],[.62,-.8],[.45,-.9],[0,-.9]]}[v];
  const ch=room({dome:2.8,pits:[{cx:wf.cx,cz:wf.cz,rx:wf.rx,rz:wf.rz}],pick:pk}),L=ch.L;
  if(v==0){ugPool(L,wf,{prof:pf,surf:-.04,dep:.45,key:'pool',rock:'wet2'});
   /* the plank walkway along one side, on posts standing in the water's edge */
   const wk=f1('walk'),a=wk.pts[0],c=wk.pts[1],dd=(x,z)=>ugProfY(pf,Math.hypot((x-wf.cx)/wf.rx,(z-wf.cz)/wf.rz));
   for(let z=a[1]-.15;z>c[1]+.15;z-=.3)L.box('woodD',.95,.05,.26,a[0],.3,z,0);for(let z=a[1]-.4;z>c[1];z-=1.8)for(const sd of[-.42,.42]){const bt=dd(a[0]+sd,z)-.05;L.box('wood',.1,.27-bt,.1,a[0]+sd,(.27+bt)/2,z,0)}
   for(const sd of[-.42,.42])L.box('wood',.08,.08,Math.abs(c[1]-a[1])-.2,a[0]+sd,.235,(a[1]+c[1])/2,0)}
  if(v==1){/* the underground lake: deep; a rope across it and a raft that runs along the rope */
   ugPool(L,wf,{bowl:1,surf:-.25,dep:3,key:'poolB',rock:'wet2',prof:[[1,0],[.95,-.3],[.85,-.9],[.6,-2],[.3,-2.8],[0,-3]]});
   const rp=f1('rope').pts,rf=f1('raft'),A=[rp[0][0],1.2,rp[0][1]],C=[rp[1][0],1.2,rp[1][1]];for(const q of[A,C])L.cyl('woodD',.1,.12,1.5,q[0],.7,q[2],8);ugSag(L,'rope',A,C,.45,.025,30);
   /* the raft is a moving part: it runs along the rope (userData.raft: the rope's ends, mine coords) */const rg=ugPut(L,ugRaft(),rf.x,0,rf.z,0),wa=L.pt(A[0],A[1],A[2]),wc=L.pt(C[0],C[1],C[2]);rg.userData.raft={a:[wa.x,wa.y,wa.z],c:[wc.x,wc.y,wc.z]};ctx.moving.push(rg)}
  if(v==2){/* the drowned drift: timber sets standing in the water, rails along the bottom, a sunken cart */
   ugPool(L,wf,{prof:pf,surf:-.04,dep:.9,key:'pool',rock:'wet2'});const dd=(x,z)=>ugProfY(pf,Math.hypot((x-wf.cx)/wf.rx,(z-wf.cz)/wf.rz));
   const sp=f1('sets').pts;for(let z=sp[0][1]-1.5;z>sp[1][1]+1;z-=3){const b0=Math.min(dd(-2.1,z),dd(2.1,z))-.1;for(const sd of[-2.1,2.1]){const bt=dd(sd,z)-.08;L.box('wood',.22,2.7-bt,.22,sd,(2.7+bt)/2,z,0)}L.box('wood',4.5,.24,.24,0,2.8,z,0)}
   const rl=f1('rail').pts,P3=[];for(let z=rl[0][1];z>=rl[1][1]-.01;z-=.5){const w=L0.pt(0,dd(0,z),z);P3.push([w.x,w.y,w.z])}const tr=ugTube(ugNull,P3,{fil:0,sets:false});ugRails(b,tr,null);   /* old rails just end: no buffers */
   const ct=[1.6,-13],cy=dd(ct[0],ct[1]);L.box('steel',.9,.6,1.3,ct[0],cy+.42,ct[1],.4,0,.22);L.box('oreRock',.8,.1,1.2,ct[0]+.06,cy+.7,ct[1],.4,0,.22);for(const sx of[-.35,.35])L.cyl('rail',.16,.16,.08,ct[0]+sx*Math.cos(.4),cy+.1+sx*.2,ct[1]-sx*Math.sin(.4),12,.4,0,Math.PI/2)}
  return true}

 /* ====== CHASM HALL ====== */
 if(t=='chasm'){const cf=f1('chasm'),D=9,pk=()=>{const r=R();return r<.35?'ag':r<.55?'au':r<.65?'cr':'fe'};
  /* the fissure: its centre line runs into the walls, or tapers to nothing where it ends inside the cave */
  const inE=q=>Math.hypot((q[0]-bl.cx)/bl.rx,(q[1]-bl.cz)/bl.rz)<.9;let cl=cf.pts.map(q=>q.slice());const ext=(a,c,ln)=>{const dx=a[0]-c[0],dz=a[1]-c[1],l=Math.hypot(dx,dz);return[a[0]+dx/l*ln,a[1]+dz/l*ln]};
  const t0=inE(cl[0]),t1=inE(cl[cl.length-1]);if(!t0)cl.unshift(ext(cl[0],cl[1],3));else cl.unshift(ext(cl[0],cl[1],1.3));if(!t1)cl.push(ext(cl[cl.length-1],cl[cl.length-2],3));else cl.push(ext(cl[cl.length-1],cl[cl.length-2],1.3));
  const P=[];for(let i=1;i<cl.length;i++){const a=cl[i-1],c=cl[i],n=Math.max(1,Math.ceil(Math.hypot(c[0]-a[0],c[1]-a[1])/.6));for(let k=i==1?0:1;k<=n;k++)P.push([a[0]+(c[0]-a[0])*k/n,a[1]+(c[1]-a[1])*k/n])}
  const S=[0];for(let i=1;i<P.length;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const Ln=S[S.length-1];
  const hw=i=>{let k=1;if(t0)k=Math.min(k,Math.max(0,S[i])/1.3);if(t1)k=Math.min(k,(Ln-S[i])/1.3);const w0=L0.pt(P[i][0],0,P[i][1]);return cf.w/2*Math.sqrt(Math.max(0,k))*(.85+.3*ugNoise(w0.x*.7,0,w0.z*.7))};
  const Lf=[],Rt=[];for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],c=P[Math.min(P.length-1,i+1)];let tx=c[0]-a[0],tz=c[1]-a[1];const l=Math.hypot(tx,tz);tx/=l;tz/=l;const h=hw(i);Lf.push([P[i][0]-tz*h,P[i][1]+tx*h]);Rt.push([P[i][0]+tz*h,P[i][1]-tx*h])}
  let hole=Lf.concat(Rt.reverse());if(ugArea(hole)<0)hole.reverse();const ell=[];for(let i=0;i<64;i++){const a=i/64*Math.PI*2;ell.push([bl.cx+(bl.rx-.1)*Math.cos(a),bl.cz+(bl.rz-.1)*Math.sin(a)])}if(ugArea(ell)<0)ell.reverse();
  hole=ugClip(hole,ell).filter((q,i,A)=>Math.hypot(q[0]-A[(i+1)%A.length][0],q[1]-A[(i+1)%A.length][1])>.02);
  const ch=room({dome:4.2,holes:[hole],pick:pk}),L=ch.L;
  /* the fissure's sides: rough rock going down 9 m, facing into the gap; darkness at the bottom */
  {const n=hole.length,rows=[0,-.5,-1.3,-2.3,-3.5,-5,-7,-D],pos=[],uv=[],idx=[],ar=ugArea(hole)>0;let s=0;const cols=[];for(let i=0;i<n;i++){const a=hole[(i+n-1)%n],c=hole[(i+1)%n];let ux=c[0]-a[0],uz=c[1]-a[1];const l=Math.hypot(ux,uz)||1;cols.push({x:hole[i][0],z:hole[i][1],ox:(ar?uz:-uz)/l,oz:(ar?-ux:ux)/l,s});s+=Math.hypot(hole[(i+1)%n][0]-hole[i][0],hole[(i+1)%n][1]-hole[i][1])}
   for(const c of cols)for(const yy of rows){const w=L0.pt(c.x,yy,c.z),d=.45*Math.min(1,-yy/.8)*ugNoise(w.x,w.y,w.z);pos.push(c.x+c.ox*d,yy,c.z+c.oz*d);uv.push(c.s/3,yy/3)}
   const m=rows.length;for(let i=0;i<n;i++){const i2=(i+1)%n;for(let j=0;j<m-1;j++){const a=i*m+j,b2=i2*m+j,c=i2*m+j+1,d=i*m+j+1;idx.push(a,b2,c,a,c,d)}}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
   /* make sure the sides face into the gap */{const nA=g.attributes.normal;let sm=0;for(let i=0;i<n;i++)sm+=nA.getX(i*m+3)*-cols[i].ox+nA.getZ(i*m+3)*-cols[i].oz;if(sm<0){const ix=g.index.array;for(let i=0;i<ix.length;i+=3){const tt=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=tt}g.computeVertexNormals()}}
   L.geo(rk,g,0,0,0);const sh=new THREE.Shape();hole.forEach((q,i)=>i?sh.lineTo(q[0],-q[1]):sh.moveTo(q[0],-q[1]));const bg=new THREE.ShapeGeometry(sh);bg.rotateX(-Math.PI/2);L.geo('black',bg,0,-D+.2,0)}
  const bridge=(f,broken)=>{const dx=f.x1-f.x0,dz=f.z1-f.z0,l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l,rx2=uz,rz2=-ux,yaw=Math.atan2(dx,dz);
   /* the end that sits on firm floor (farther from the fissure's centre line) carries the posts */
   const cd=(x,z)=>Math.min(...cf.pts.slice(1).map((q,i)=>ugSegD(x,z,cf.pts[i],q)));const sw=broken&&cd(f.x0,f.z0)<cd(f.x1,f.z1);const a=sw?[f.x1,f.z1]:[f.x0,f.z0],c=sw?[f.x0,f.z0]:[f.x1,f.z1],du=sw?-1:1;
   const sag=broken?0:.28,dy=s=>-sag*4*(s/l)*(1-s/l);for(let s=.12;s<l;s+=.32)L.box('woodD',1.1,.05,.24,a[0]+ux*du*s,.06+dy(s),a[1]+uz*du*s,yaw);
   for(const sd of[-.6,.6]){for(const e of broken?[0]:[0,l])L.box('wood',.12,1.15,.12,a[0]+ux*du*(e+(e?.25:-.25))+rx2*sd,.55,a[1]+uz*du*(e+(e?.25:-.25))+rz2*sd,yaw);
    const A=[a[0]-ux*du*.25+rx2*sd,1.05,a[1]-uz*du*.25+rz2*sd];const C=[c[0]+ux*du*(broken?0:.25)+rx2*sd,broken?.4:1.05,c[1]+uz*du*(broken?0:.25)+rz2*sd];ugSag(L,'rope',A,C,broken?.1:.32,.022,16);
    /* the two ropes the planks lie on, sagging with them */ugSag(L,'rope',[a[0]-ux*du*.25+rx2*sd*.92,.035,a[1]-uz*du*.25+rz2*sd*.92],[c[0]+ux*du*(broken?0:.25)+rx2*sd*.92,.035,c[1]+uz*du*(broken?0:.25)+rz2*sd*.92],sag*(l+.5)/l,.02,16)}
   if(broken){/* the broken end hangs down into the gap: planks on two ropes */for(let k=0;k<8;k++){const yy=-.25-k*.32;L.box('woodD',1.0,.24,.05,c[0]+ux*du*.05,yy,c[1]+uz*du*.05,yaw)}for(const sd of[-.45,.45])L.cyl('rope',.02,.02,2.7,c[0]+rx2*sd+ux*du*.08,-1.25,c[1]+rz2*sd+uz*du*.08,5)}};
  if(v==0||v==1){if(v==0)bridge(f1('bridge'),false);else fx('bridge').forEach(f=>bridge(f,true));
   for(const q of fx('stones').flatMap(f=>f.pts)){const g=new THREE.CylinderGeometry(.5,.75,D,7,4);const pa=g.attributes.position;for(let i=0;i<pa.count;i++){const yy=pa.getY(i);if(yy<D/2-.01){const w=L0.pt(q[0]+pa.getX(i),yy,q[1]+pa.getZ(i)),k=.85+.3*ugNoise(w.x,w.y,w.z);pa.setX(i,pa.getX(i)*k);pa.setZ(i,pa.getZ(i)*k)}}g.computeVertexNormals();L.geo(rk,g,q[0],-D/2+.03,q[1],R()*3)}}
  if(v==2){/* the miners' timber trestle: a deck with rails, bents going down into the gap */
   const f=f1('trestle'),dx=f.x1-f.x0,dz=f.z1-f.z0,l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l,rx2=uz,rz2=-ux,yaw=Math.atan2(dx,dz);
   for(const sd of[-.75,.75])L.box('wood',.24,.24,l,f.x0+dx/2+rx2*sd,.0,f.z0+dz/2+rz2*sd,yaw);for(let s=.15;s<l;s+=.35)L.box('woodD',2.0,.06,.24,f.x0+ux*s,.15,f.z0+uz*s,yaw);
   const A=L0.pt(f.x0,.18,f.z0),C=L0.pt(f.x1,.18,f.z1);ugRailLine(b,[[A.x,A.z],[C.x,C.z]],y+.18,ctx,0);
   for(let s=1.2;s<l-1;s+=1.6){const x=f.x0+ux*s,z=f.z0+uz*s;for(const sd of[-.75,.75])L.box('wood',.24,D,.24,x+rx2*sd,-D/2-.1,z+rz2*sd,yaw);for(let yy=-1.8;yy>-D;yy-=2.4){L.box('wood',1.8,.2,.2,x,yy,z,yaw+Math.PI/2);ugBeam(L,'woodD',[x-rx2*.75,yy,z-rz2*.75],[x+rx2*.75,yy-2.2,z+rz2*.75],.12,.12)}}}
  if(v==3){/* a rusty zip line: a tall frame on this side, a lower one on the far side, a handle on a pulley */
   const zp=f1('zip').pts,A=zp[0],C=zp[1],dx=C[0]-A[0],dz=C[1]-A[1],l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l,rx2=uz,rz2=-ux;
   const frame=(q,h)=>{for(const sd of[-.7,.7])ugBeam(L,'wood',[q[0]+rx2*sd,-.05,q[1]+rz2*sd],[q[0]+rx2*sd*.15,h,q[1]+rz2*sd*.15],.16,.16);L.box('wood',.5,.2,.3,q[0],h,q[1],Math.atan2(dx,dz));ugBeam(L,'wire',[q[0]-ux*.1,h,q[1]-uz*.1],[q[0]-ux*1.6,-.02,q[1]-uz*1.6],.03,.03);L.cyl('steel',.08,.08,.3,q[0]-ux*1.6,.1,q[1]-uz*1.6,8)};
   frame(A,3.2);frame(C,2.3);const cab=ugSag(L,'steel',[A[0],3.25,A[1]],[C[0],2.35,C[1]],.25,.018,20);const hp=cab[2];
   /* the handle is a moving part: it runs down the cable (userData.zip: the cable's points, mine coords) */const zh=ugPut(L,ugZipHandle(),hp.x,hp.y,hp.z,Math.atan2(dx,dz));zh.userData.zip=cab.map(q=>{const w=L.pt(q.x,q.y,q.z);return[w.x,w.y,w.z]});ctx.moving.push(zh)}
  return true}

 /* ====== STALACTITE HALL ====== */
 if(t=='hall'){const pk=()=>{const r=R();return r<.4?'ag':r<.55?'au':r<.65?'cr':r<.85?'fe':'cu'};
  const dome=v==2?7.5:v==4?6.5:4.4;
  if(v==1){/* rimstone terraces: pools rimmed with stone stepping up towards the back, water brim-full in each */
   const tf=f1('terraces'),pools=[];for(let k=0;k<tf.n;k++){const z=tf.cz+tf.rz*.7-k*(tf.rz*1.4/(tf.n-1)),x=(k%2?1:-1)*1.4;pools.push({cx:x,cz:z,rx:3.6,rz:1.3,h:.14+.09*k})}
   const ch=room({dome,pits:pools.map(q=>({cx:q.cx,cz:q.cz,rx:q.rx*.99,rz:q.rz*.99})),pick:pk}),L=ch.L;
   for(const q of pools){const pr=[[1,0],[.95,-.12],[.8,-.22],[0,-.26]];ugPool(L,{cx:q.cx,cz:q.cz,rx:q.rx*.99,rz:q.rz*.99},{prof:pr,surf:q.h-.035,dep:.26,key:'pool',rock:'wet2',sr:.985});
    const tg=new THREE.TorusGeometry(1,.075,8,72);tg.rotateX(Math.PI/2);const sy=(q.h+.12)/.15;tg.scale(q.rx,sy,q.rz);L.geo('flow',tg,q.cx,q.h-.075*sy,q.cz)}
   drips(ch,30,'flow',.1);return true}
  const fsl=v==3?f1('fossil').pts:null;const ch=room({dome,pick:pk,veinGap:v==4?4:2.8,noVein:fsl?(x,z)=>fsl.some((q,i)=>i&&ugSegD(x,z,fsl[i-1],q)<2.2):null}),L=ch.L;
  const mites=(n,near)=>{for(const q of scatter(n,0,bl.cz,bl.rx*.85,bl.rz*.85,.9,true,(x,z)=>near&&Math.hypot((x-bl.cx)/bl.rx,(z-bl.cz)/bl.rz)<.55))ugDrip(L,q[0],q[1],.12+R()*.16,.4+R()*1.1,0,false)};
  if(v==0){for(const f of fx('cols'))for(const q of f.pts)ugColumn(L,q[0],q[1],(f.r||1)*.8,ch.roofAt(q[0],q[1]),'flow',R);drips(ch,45,'flow',.14);mites(16,true);
   for(const q of scatter(5,0,bl.cz,bl.rx*.8,bl.rz*.8,3,true))ugPile(L,R,q[0],q[1],.8+R()*.5,.6+R()*.4,.35,'flow')}
  if(v==2){/* the cathedral: one giant fluted column under a huge dome */
   const cs=fx('cols');const big=cs.find(f=>f.r>2),sm=cs.find(f=>f.r<2);const q=big.pts[0],tp=ch.roofAt(q[0],q[1])+1.2,g=new THREE.CylinderGeometry(1,1,tp+.1,48,16,true),pa=g.attributes.position;
   for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i),yy=pa.getY(i)+(tp+.1)/2,f=yy/tp,a=Math.atan2(z,x),r=big.r*(.62+.38*Math.pow(Math.abs(f-.45)*1.9,1.5))*(1+.07*Math.sin(a*9+f*4))*(f<.06?1.2-f*3.3:1);pa.setX(i,Math.cos(a)*r);pa.setZ(i,Math.sin(a)*r)}g.computeVertexNormals();L.geo('flow',g,q[0],(tp+.1)/2-.1,q[1]);
   for(const q2 of sm.pts)ugColumn(L,q2[0],q2[1],sm.r*.8,ch.roofAt(q2[0],q2[1]),'flow',R);drips(ch,30,'flow',.16);mites(10,false)}
  if(v==3){/* the fossil wall: a giant skeleton half dug out of the cave wall, tools, and small fossils to take */
   const fp=f1('fossil').pts,ang=fp.map(q=>Math.atan2(q[1]-bl.cz,q[0]-bl.cx)),ys=[1.7,2.1,2.3,2.0];const sp=[];for(let i=0;i<fp.length-1;i++)for(let k=0;k<12;k++){const f=k/12;sp.push([ang[i]+(ang[i+1]-ang[i])*f,ys[i]+(ys[i+1]-ys[i])*f])}sp.push([ang[ang.length-1],ys[ys.length-1]]);
   const W=sp.map(([a,yy])=>ch.wallPt(a,yy));W.forEach((w,i)=>{const s2=i>W.length-10?.5+.05*(W.length-1-i):1,nb=W[Math.min(W.length-1,i+1)],pb=W[Math.max(0,i-1)];
    L.geo('bone',new THREE.CylinderGeometry(.12*s2,.12*s2,.17*s2,10).applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(nb.x-pb.x,nb.y-pb.y,nb.z-pb.z).normalize()))),w.x-w.nx*.05,w.y,w.z-w.nz*.05);
    if(i%2==0)L.geo('bone',new THREE.BoxGeometry(.06,.14*s2,.06),w.x-w.nx*.05,w.y+.16*s2,w.z-w.nz*.05);
    /* ribs: down the wall from the front half of the spine, bowing out from the rock and back in */
    if(i>2&&i<W.length*.6&&i%2==0){const rl=1.35*(1-i/(W.length*.9)),P=[];for(let k=0;k<=6;k++){const f=k/6,yy=w.y-.1-rl*f,w2=ch.wallPt(sp[i][0],yy),out=.05+.22*Math.sin(f*Math.PI);P.push(new THREE.Vector3(w2.x-w2.nx*out,yy,w2.z-w2.nz*out))}L.geo('bone',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P),12,.04,5,false),0,0,0)}});
   {const w=W[0],w1=W[2],dx=w.x-w1.x,dy=w.y-w1.y,dz=w.z-w1.z,l=Math.hypot(dx,dz),hx=w.x+dx/l*.6,hz=w.z+dz/l*.6,yw=Math.atan2(dx,dz);
    L.geo('bone',new THREE.SphereGeometry(.5,16,10),hx-w.nx*.1,w.y+.08,hz-w.nz*.1,yw,0,0,.65,.55,1.25);L.geo('black',new THREE.SphereGeometry(.1,8,6),hx-w.nx*.38,w.y+.2,hz-w.nz*.38);
    L.geo('bone',new THREE.BoxGeometry(.16,.1,.85),hx+dx/l*.12-w.nx*.12,w.y-.26,hz+dz/l*.12-w.nz*.12,yw,.25);for(let k=0;k<5;k++)L.geo('bone',new THREE.ConeGeometry(.025,.1,5).rotateX(Math.PI),hx+dx/l*(.3-k*.12)-w.nx*.2,w.y-.2,hz+dz/l*(.3-k*.12)-w.nz*.2)}
   const tp=fx('blk').find(f=>f.n=='tool pile').pts[0];L.box('wood',.7,.5,.5,tp[0],.25,tp[1],.3);L.cyl('steel',.2,.17,.4,tp[0]+.6,.2,tp[1]-.3,12);ugBeam(L,'woodD',[tp[0]-.5,0,tp[1]+.6],[tp[0]-.3,1.1,tp[1]+.2],.05,.05);L.box('steel',.06,.4,.08,tp[0]-.3,1.12,tp[1]+.2,.3);
   L.cyl('steel',.03,.03,1.6,tp[0]+.2,.8,tp[1]+.9,6);for(const a of[0,2.1,4.2])ugBeam(L,'steel',[tp[0]+.2+Math.cos(a)*.4,0,tp[1]+.9+Math.sin(a)*.4],[tp[0]+.2,.9,tp[1]+.9],.03,.03);L.geo('glass',new THREE.SphereGeometry(.12,10,8),tp[0]+.2,1.65,tp[1]+.9);lamp(tp[0]+.2,1.6,tp[1]+.9,1.2);
   /* loose fossils at the foot of the wall, split face up: you can pick them up */for(let i=0;i<5;i++){const a=ang[0]+(ang[3]-ang[0])*(i+.5)/5,w=ch.wallPt(a,.3),d=.5+R()*.4;ctx.pickups.push(ugPut(L,ugFossil(i%3==1?'trilobite':'ammonite'),w.x-w.nx*d,.035,w.z-w.nz*d,R()*6,Math.PI/2))}
   drips(ch,25,'flow',.1)}
  if(v==4){/* the echo chamber: tall, round and empty but for a bell on a post */
   const q=fx('blk').find(f=>f.n=='bell post').pts[0];L.box('woodD',.2,2.6,.2,q[0],1.3,q[1],0);L.box('woodD',.9,.14,.14,q[0]+.35,2.55,q[1],0);
   const bp=[[.02,0],[.2,-.05],[.24,-.2],[.27,-.38],[.38,-.5],[.36,-.53]].map(v2=>new THREE.Vector2(v2[0],v2[1]));L.geo('brass',new THREE.LatheGeometry(bp,18),q[0]+.65,2.48,q[1]);L.geo('brass',new THREE.LatheGeometry(bp.slice().reverse().map(v2=>new THREE.Vector2(v2.x*.95,v2.y)),18),q[0]+.65,2.48,q[1]);
   L.cyl('rope',.012,.012,1.2,q[0]+.65,1.48,q[1],5);drips(ch,20,'flow',.12)}
  return true}
 return false}

/* ---------------- docs/design/models/quarry-under-l3.js ---------------- */
/* =====================================================================================================
   The Old Quarry underground, batch 4: LEVEL 3, THE DEEP (docs/design/quarry-underground.md).
   Needs quarry-under.js, -kit.js, -l1.js, -l2.js and -l2r.js. ugPieceL2 asks ugPieceL3(b, p, L, ctx) first; it builds
   the level 3 pieces: the basalt gallery, the magma chamber, the dark cave, the Geode, the hot seam and the old shaft.
   The shared cave pieces (passages, bends, forks, islands, ore passes) come from -l2.js in this level's dark rock.
   Hazards come from the plan (lava rivers, lakes, the moat, chasms, the sinkhole, deep water: tested by
   quarry-under-check.js). Extra things the game needs: ctx.hot (glowing crust patches that burn, mine coords
   {x, z, r}), ctx.moving (the sealed station's steel doors, each a group turning on its hinge) and ctx.portal (the
   old shaft's door 60).
   ===================================================================================================== */

/* ---------- materials ---------- */
{const k0=ugKit;ugKit=function(){const K=k0();if(K.l3)return K;K.l3=1;const M=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.9},o));const rnd=ugRng(3301);
 /* lava: glowing orange with darker crust drifting on it (the game scrolls K.lavaT.offset slowly, about 0.02 per second) */
 K.lavaT=ugCanvas(256,256,(k,w,h)=>{k.fillStyle='#ff7a1a';k.fillRect(0,0,w,h);const wrap=f=>{for(const dx of[-w,0,w])for(const dy of[-h,0,h]){k.save();k.translate(dx,dy);f();k.restore()}};
  for(let i=0;i<60;i++){const x=rnd()*w,y=rnd()*h,r=8+rnd()*30;wrap(()=>{const g=k.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(255,230,120,.9)');g.addColorStop(1,'rgba(255,140,30,0)');k.fillStyle=g;k.beginPath();k.arc(x,y,r,0,7);k.fill()})}
  for(let i=0;i<34;i++){const x=rnd()*w,y=rnd()*h,r=6+rnd()*20;wrap(()=>{k.fillStyle='rgba(90,20,8,'+(.45+rnd()*.4)+')';k.beginPath();k.ellipse(x,y,r,r*(.4+rnd()*.5),rnd()*3,0,7);k.fill()})}});
 /* falling lava: streaks of yellow on orange (the game scrolls K.lavaFT.offset.y, about +0.5 per second) */
 K.lavaFT=ugCanvas(128,256,(k,w,h)=>{k.fillStyle='#e05010';k.fillRect(0,0,w,h);for(let i=0;i<90;i++){const x=rnd()*w,lw=2+rnd()*6,ph=rnd()*6.28;for(let y=0;y<h;y+=4){const a=.25+.35*Math.sin(y/h*Math.PI*2*(1+(i%3))+ph);k.fillStyle='rgba(255,220,90,'+Math.max(0,a).toFixed(2)+')';k.fillRect(x-lw/2,y,lw,4.5)}}});
 /* cooled crust: dark plates, thin glowing cracks between them */
 K.crustT=ugCanvas(256,256,(k,w,h)=>{k.fillStyle='#ff6a1a';k.fillRect(0,0,w,h);const pts=[];for(let i=0;i<26;i++)pts.push([rnd()*w,rnd()*h]);
  const im=k.getImageData(0,0,w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let d1=1e9,d2=1e9;for(const p of pts)for(const dx of[-w,0,w])for(const dy of[-h,0,h]){const d=(x-p[0]-dx)**2+(y-p[1]-dy)**2;if(d<d1){d2=d1;d1=d}else if(d<d2)d2=d}
   const e=Math.sqrt(d2)-Math.sqrt(d1),i=(y*w+x)*4;if(e>2.2){const v=34+((x*7+y*13)%9);im.data[i]=v;im.data[i+1]=v-4;im.data[i+2]=v-6}}k.putImageData(im,0,0)});
 K.crustE=ugCanvas(256,256,(k,w,h)=>{k.drawImage(K.crustT.image,0,0);const im=k.getImageData(0,0,w,h);for(let i=0;i<im.data.length;i+=4){if(im.data[i]<120){im.data[i]=im.data[i+1]=im.data[i+2]=0}}k.putImageData(im,0,0)});
 Object.assign(K.mat,{
  lava:new THREE.MeshBasicMaterial({map:K.lavaT}),
  lavaFall:new THREE.MeshBasicMaterial({map:K.lavaFT,side:THREE.DoubleSide}),
  crust:M({map:K.crustT,emissive:0xffffff,emissiveMap:K.crustE,emissiveIntensity:.9,roughness:.85}),
  basalt:M({color:0x2e2a2a,roughness:.7,flatShading:true}),
  obsidian:new THREE.MeshStandardMaterial({color:0x141018,roughness:.08,metalness:.35,flatShading:true}),
  obsidianF:new THREE.MeshStandardMaterial({map:K.gravT,color:0x2a2630,roughness:.2,metalness:.2}),
  rockK:M({map:K.rockT,color:0x3e3634}),
  amethyst:new THREE.MeshStandardMaterial({color:0xb070e8,emissive:0x5a1a8a,emissiveIntensity:.75,roughness:.12,flatShading:true}),
  celestine:new THREE.MeshStandardMaterial({color:0xa8d0ff,emissive:0x2a5ab0,emissiveIntensity:.7,roughness:.12,flatShading:true}),
  citrine:new THREE.MeshStandardMaterial({color:0xffc840,emissive:0x9a6a00,emissiveIntensity:.7,roughness:.12,flatShading:true}),
  smoky:new THREE.MeshStandardMaterial({color:0x4a4440,emissive:0x0c0a08,roughness:.08,metalness:.25,flatShading:true}),
  clearC:new THREE.MeshStandardMaterial({color:0xf4faff,emissive:0xa8b8d0,emissiveIntensity:1,roughness:.1,flatShading:true}),
  uran:new THREE.MeshStandardMaterial({color:0x9cff5a,emissive:0x3a9a20,emissiveIntensity:1,roughness:.3,flatShading:true}),
  urRock:M({map:K.rockT,color:0x5e6254,emissive:0x16300c,emissiveIntensity:.35}),
  poolG:new THREE.MeshStandardMaterial({color:0x6ad04a,emissive:0x2a7a1a,emissiveIntensity:.7,roughness:.1,transparent:true,opacity:.65,depthWrite:false,normalMap:K.poolN,normalScale:new THREE.Vector2(.25,.25)}),
  poolK:new THREE.MeshStandardMaterial({color:0x0a1218,roughness:.05,metalness:.5,transparent:true,opacity:.85,depthWrite:false,normalMap:K.poolN,normalScale:new THREE.Vector2(.15,.15)}),
  bat:M({color:0x241c1e,roughness:1}),guano:M({map:K.gravT,color:0xc8c0b0,roughness:1}),
  /* the geodes' banded stone shells, tinted to their crystals */
  geoA:M({map:K.rockT,color:0x6a5870}),geoC:M({map:K.rockT,color:0x5e6a7c}),geoT:M({map:K.rockT,color:0x7a6a50}),geoS:M({map:K.rockT,color:0x4a4644})});
 for(const k in K.mat)K.mat[k].userData.ug=k;for(const k of['poolG','poolK'])K.mat[k].userData.ro=2;return K}}

/* ---------- helpers ---------- */
/* a band cut through a cave room's floor along a centre line (a lava river, a chasm): it runs into the walls, or narrows
   to nothing where it ends inside the room. bl: the room's oval; returns the hole polygon (local coords) */
function ugBand(L0,bl,line,w){const inE=q=>Math.hypot((q[0]-bl.cx)/bl.rx,(q[1]-bl.cz)/bl.rz)<.9;let cl=line.map(q=>q.slice());const ext=(a,c,ln)=>{const dx=a[0]-c[0],dz=a[1]-c[1],l=Math.hypot(dx,dz);return[a[0]+dx/l*ln,a[1]+dz/l*ln]};
 const t0=inE(cl[0]),t1=inE(cl[cl.length-1]);cl.unshift(ext(cl[0],cl[1],t0?1.3:3));cl.push(ext(cl[cl.length-1],cl[cl.length-2],t1?1.3:3));
 const P=[];for(let i=1;i<cl.length;i++){const a=cl[i-1],c=cl[i],n=Math.max(1,Math.ceil(Math.hypot(c[0]-a[0],c[1]-a[1])/.6));for(let k=i==1?0:1;k<=n;k++)P.push([a[0]+(c[0]-a[0])*k/n,a[1]+(c[1]-a[1])*k/n])}
 const S=[0];for(let i=1;i<P.length;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const Ln=S[S.length-1];
 const hw=i=>{let k=1;if(t0)k=Math.min(k,Math.max(0,S[i])/1.3);if(t1)k=Math.min(k,(Ln-S[i])/1.3);const w0=L0.pt(P[i][0],0,P[i][1]);return w/2*Math.sqrt(Math.max(0,k))*(.85+.3*ugNoise(w0.x*.7,0,w0.z*.7))};
 const Lf=[],Rt=[];for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],c=P[Math.min(P.length-1,i+1)];let tx=c[0]-a[0],tz=c[1]-a[1];const l=Math.hypot(tx,tz);tx/=l;tz/=l;const h=hw(i);Lf.push([P[i][0]-tz*h,P[i][1]+tx*h]);Rt.push([P[i][0]+tz*h,P[i][1]-tx*h])}
 let hole=Lf.concat(Rt.reverse());if(ugArea(hole)<0)hole.reverse();const ell=[];for(let i=0;i<64;i++){const a=i/64*Math.PI*2;ell.push([bl.cx+(bl.rx-.1)*Math.cos(a),bl.cz+(bl.rz-.1)*Math.sin(a)])}if(ugArea(ell)<0)ell.reverse();
 return ugClip(hole,ell).filter((q,i,A)=>Math.hypot(q[0]-A[(i+1)%A.length][0],q[1]-A[(i+1)%A.length][1])>.02)}
/* the rough rock sides of a hole in the floor, from the floor down to -D, facing into the hole; key at the bottom (or none) */
function ugHoleSides(L,L0,hole,D,rk,bottom,by){const n=hole.length,rows=[0,-.4,-.9,-1.6,-2.5,-3.6,-5,-7,-D].filter(v=>v>=-D),pos=[],uv=[],idx=[],ar=ugArea(hole)>0;let s=0;const cols=[];
 for(let i=0;i<n;i++){const a=hole[(i+n-1)%n],c=hole[(i+1)%n];let ux=c[0]-a[0],uz=c[1]-a[1];const l=Math.hypot(ux,uz)||1;cols.push({x:hole[i][0],z:hole[i][1],ox:(ar?uz:-uz)/l,oz:(ar?-ux:ux)/l,s});s+=Math.hypot(hole[(i+1)%n][0]-hole[i][0],hole[(i+1)%n][1]-hole[i][1])}
 if(rows[rows.length-1]>-D)rows.push(-D);for(const c of cols)for(const yy of rows){const w=L0.pt(c.x,yy,c.z),d=.45*Math.min(1,-yy/.8)*ugNoise(w.x,w.y,w.z);pos.push(c.x+c.ox*d,yy,c.z+c.oz*d);uv.push(c.s/3,yy/3)}
 const m=rows.length;for(let i=0;i<n;i++){const i2=(i+1)%n;for(let j=0;j<m-1;j++){const a=i*m+j,b2=i2*m+j,c=i2*m+j+1,d=i*m+j+1;idx.push(a,b2,c,a,c,d)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 {const nA=g.attributes.normal;let sm=0;for(let i=0;i<n;i++)sm+=nA.getX(i*m+1)*-cols[i].ox+nA.getZ(i*m+1)*-cols[i].oz;if(sm<0){const ix=g.index.array;for(let i=0;i<ix.length;i+=3){const tt=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=tt}g.computeVertexNormals()}}
 L.geo(rk,g,0,0,0);if(bottom){const sh=new THREE.Shape();hole.forEach((q,i)=>i?sh.lineTo(q[0],-q[1]):sh.moveTo(q[0],-q[1]));const bg=new THREE.ShapeGeometry(sh);bg.rotateX(-Math.PI/2);const pa=bg.attributes.position,u2=[];for(let i=0;i<pa.count;i++)u2.push(pa.getX(i)/4,pa.getZ(i)/4);bg.setAttribute('uv',new THREE.Float32BufferAttribute(u2,2));L.geo(bottom,bg,0,by==null?-D+.2:by,0)}}
/* a stone bridge with a low parapet, arched a little, from (x0,z0) to (x1,z1), local */
function ugStoneBridge(L,rk,x0,z0,x1,z1,w){w=w||1.6;const dx=x1-x0,dz=z1-z0,l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l,rx=uz,rz=-ux,n=Math.max(4,Math.ceil(l/.5)),yaw=Math.atan2(dx,dz),Y=t=>.35*Math.sin(Math.PI*t);
 for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,a=[x0+dx*t0,Y(t0),z0+dz*t0],c=[x0+dx*t1,Y(t1),z0+dz*t1];
  for(const [sd,ww,hh,yo] of[[0,w,.4,-.2],[-1,.22,.32,.16],[1,.22,.32,.16]]){const o=sd*(w/2-.11);ugBeam(L,rk,[a[0]+rx*o,a[1]+yo,a[2]+rz*o],[c[0]+rx*o,c[1]+yo,c[2]+rz*o],ww,hh)}}
 for(const e of[[x0,z0,-1],[x1,z1,1]])L.box(rk,w+.3,.5,.9,e[0]+ux*e[2]*.3,-.1,e[1]+uz*e[2]*.3,yaw)}
/* basalt columns: a cluster of six-sided columns, the middle ones up into the roof (top), the others shorter */
function ugBasaltCols(L,R,x,z,r,top){const n=5+(R()*3|0);for(let i=0;i<n;i++){const a=i/n*6.28+R(),d=i<2?r*.25*R():r*(.35+R()*.55),rr=.16+R()*.14,h=i<2?top+1+i*.15:1.2+R()*Math.min(2.6,top-1.8);
 L.geo('basalt',new THREE.CylinderGeometry(rr,rr,h+.1,6),x+Math.cos(a)*d,(h+.1)/2-.1,z+Math.sin(a)*d,R()*1.05)}}
/* a crystal cluster pointing along a direction d=[x,y,z] (out of a wall or down from the roof) */
function ugCrystalsDir(L,R,x,y,z,d,s,key,n){n=n||3+(R()*4|0);const D=new THREE.Vector3(d[0],d[1],d[2]).normalize();for(let i=0;i<n;i++){const h=s*(.6+R()*.9),r=s*(.1+R()*.08);
  const g=new THREE.CylinderGeometry(r,r*1.1,h,6);g.translate(0,h/2,0);const tip=new THREE.ConeGeometry(r,r*2.2,6);tip.translate(0,h+r*1.1,0);
  const v=D.clone().add(new THREE.Vector3((R()-.5)*.8,(R()-.5)*.8,(R()-.5)*.8)).normalize(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v),M=new THREE.Matrix4().makeRotationFromQuaternion(q);
  for(const gg of[g,tip]){gg.applyMatrix4(M);L.geo(key,gg,x-D.x*.12,y-D.y*.12,z-D.z*.12)}}}
/* a steam vent or geyser mound with a dark mouth, and steam (three crossed soft planes; the game puffs them) */
function ugVent(L,x,z,r,h,rk,steam){L.geo(rk,new THREE.CylinderGeometry(r*.55,r,h,10,1,true),x,h/2-.02,z);L.geo('black',new THREE.CircleGeometry(r*.55,10).rotateX(-Math.PI/2),x,h-.04,z);
 L.geo(rk,new THREE.TorusGeometry(r*.55,.06,5,12).rotateX(Math.PI/2),x,h-.02,z);if(steam)for(let k=0;k<3;k++)L.geo('mist',new THREE.PlaneGeometry(1.2,steam),x,h+steam/2,z,k*Math.PI/3)}
/* glowworms: tiny lights on threads from the roof */
function ugGlowworms(L,ch,R,n,cx,cz,rx,rz){for(let i=0;i<n;i++){const a=R()*6.28,r=Math.sqrt(R())*.9,x=cx+Math.cos(a)*rx*r,z=cz+Math.sin(a)*rz*r,rf=ch.roofAt(x,z),l=.12+R()*.4;
 L.cyl('stem',.004,.004,l+1,x,rf-l/2+.5,z,3);L.geo('glowB',new THREE.SphereGeometry(.028,6,4),x,rf-l,z)}}

/* ---------- the pieces ---------- */
function ugPieceL3(b,p,Lv,ctx){const t=p.type;if(!['basalt','magma','dark','geode','hotseam','old'].includes(t))return false;
 const v=p.d.v||0,y=UGLY(Lv),rk=ugRK(Lv),fl=ugFL(Lv),R=ugRng(p.id*1009+v*17+3),L0=ugLocal(b,p,y),W=ugWorld(p),fx=k=>p.d.fx.filter(f=>f.k==k),f1=k=>fx(k)[0];
 const lamp=(x,yy,z,s)=>{const w=L0.pt(x,yy,z);ctx.lamps.push([w.x,w.y,w.z,s||1])},pick3=()=>{const r=R();return r<.3?'au':r<.5?'cr':r<.65?'dm':r<.8?'ur':'ag'};
 const bl=p.d.shp.find(s=>s.k=='blob');let doors=[],ways=[];
 if(bl){doors=ugChamberShape(p,Object.assign({cx:bl.cx,cz:bl.cz,rx:bl.rx,rz:bl.rz},{doorsExtra:[]})).doors;ways=doors.length>1?doors.flatMap((a,i)=>doors.slice(i+1).map(c=>[[a.x,a.z],[c.x,c.z]])):[[[0,0],[bl.cx,bl.cz]]]}
 const onWay=(x,z,m)=>ways.some(w=>ugSegD(x,z,w[0],w[1])<(m||1.6)),nearDoor=(x,z,d)=>doors.some(q=>Math.hypot(q.x-x,q.z-z)<(d||3))||Math.hypot(x,z)<(d||3);
 const scatter=(n,cx,cz,rx,rz,minD,big,also)=>{const o=[];for(let k=0;o.length<n&&k<n*60;k++){const a=R()*6.28,r=Math.sqrt(R()),x=cx+Math.cos(a)*rx*r,z=cz+Math.sin(a)*rz*r;
   if(nearDoor(x,z)||(big&&onWay(x,z))||o.some(q=>Math.hypot(q[0]-x,q[1]-z)<minD)||(also&&also(x,z)))continue;o.push([x,z])}return o};

 /* ====== BASALT GALLERY: a wide cave of black basalt with glowing cracks ====== */
 if(t=='basalt'){const path=W.shp[0];const obs=v==2;const c=ugCave(b,path.pts.map(q=>[q[0],y,q[1]]),{rock:obs?'obsidian':rk,floor:obs?'obsidianF':fl,amp:obs?.3:.45});c.rk=obs?'obsidian':rk;ugCaveDress(b,c,ctx,R,Lv);
  const lp=p.d.shp[0].pts;
  if(v!=2){/* glowing cracks along the floor, zig-zagging about the middle */for(let s=1.5;s<c.L-1.5;s+=.6){const f=c.at(s),f2=c.at(s+.6),o1=Math.sin(s*1.7)*.6,o2=Math.sin((s+.6)*1.7)*.6;
    const a=[f.p[0]+f.r[0]*o1,f.p[2]+f.r[1]*o1],e=[f2.p[0]+f2.r[0]*o2,f2.p[2]+f2.r[1]*o2],dx=e[0]-a[0],dz=e[1]-a[1];b.box('lava',.1,.03,Math.hypot(dx,dz)+.04,(a[0]+e[0])/2,y+.0,(a[1]+e[1])/2,Math.atan2(dx,dz))}
   for(let s=3;s<c.L-2;s+=5){const f=c.at(s);ctx.lamps.push([f.p[0],y+.4,f.p[2],.7])}}
  if(v==0)for(const q of f1('cols').pts)ugBasaltCols(L0,R,q[0],q[1],.6,4.4);
  if(v==1){const sp=f1('spots');for(let i=0;i<sp.n;i++){const s=2.5+(c.L-5)*i/(sp.n-1),f=c.at(s),o=(R()-.5)*1.6,x=f.p[0]+f.r[0]*o,z=f.p[2]+f.r[1]*o;b.add(rk,new THREE.CylinderGeometry(.2,.45,.25,8,1,true),new THREE.Matrix4().makeTranslation(x,y+.1,z));b.add('black',new THREE.CircleGeometry(.2,8).rotateX(-Math.PI/2),new THREE.Matrix4().makeTranslation(x,y+.215,z));for(let k=0;k<3;k++)b.add('mist',new THREE.PlaneGeometry(1.1,2.2),new THREE.Matrix4().compose(new THREE.Vector3(x,y+1.3,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,k*Math.PI/3,0)),new THREE.Vector3(1,1,1)))}}
  if(v==2){/* sharp obsidian shards along the edges of the floor */for(let s=2;s<c.L-2;s+=.7){const f=c.at(s),e=c.edge(f.i),sd=R()<.5?0:1,q=e[sd],cx2=(e[0][0]+e[1][0])/2,cz2=(e[0][1]+e[1][1])/2,dx=cx2-q[0],dz=cz2-q[1],l=Math.hypot(dx,dz),h=.15+R()*.3;
    const g=new THREE.ConeGeometry(.08+R()*.06,h,4);g.rotateZ((R()-.5)*.6);b.add('obsidian',g,new THREE.Matrix4().compose(new THREE.Vector3(q[0]+dx/l*(.3+R()*.3),y+h/2-.03,q[1]+dz/l*(.3+R()*.3)),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,R()*3,0)),new THREE.Vector3(1,1,1)))}
   for(let s=3;s<c.L-2;s+=6){const f=c.at(s);ctx.lamps.push([f.p[0],y+2.6,f.p[2],.5])}}
  return true}

 /* ====== THE OLD SHAFT: a short timbered drive into the working face, a rock wall with door 60 in it ====== */
 if(t=='old'){const L=L0;const tr=ugTube(b,[[0,0],[0,-2.6]].map(q=>{const w=L.pt(q[0],0,q[1]);return[w.x,y,w.z]}),{fil:0,rails:false,sets:true,lampsOut:ctx.lamps,rock:rk,floorKey:fl});
  const pf=ugProf(2),sh=new THREE.Shape(),dw=.62,dh=2.15;sh.moveTo(-2,0);for(const q of pf.P.filter(q=>q[1]>=0))sh.lineTo(q[0],q[1]);sh.lineTo(2,0);sh.lineTo(dw,0);sh.lineTo(dw,dh);sh.lineTo(-dw,dh);sh.lineTo(-dw,0);sh.lineTo(-2,0);
  const g=new THREE.ShapeGeometry(sh),pa=g.attributes.position,u=[];for(let i=0;i<pa.count;i++)u.push(pa.getX(i)/3,pa.getY(i)/3);g.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));L.geo(rk,g,0,0,-2.6);
  /* behind the door: a dark passage; the timber frame, the old door with its number plate, a warning board */
  L.box('black',1.4,dh+.1,1.4,0,(dh+.1)/2-.02,-3.4);for(const sd of[-1,1])L.box('woodD',.22,dh+.1,.24,sd*(dw+.11),(dh+.1)/2,-2.5,0);L.box('woodD',dw*2+.7,.26,.26,0,dh+.18,-2.5,0);
  L.box('wood',dw*2-.04,dh-.04,.07,0,(dh-.04)/2+.02,-2.66,0);for(const yy of[.5,1.6])L.box('dark',dw*2-.1,.08,.02,0,yy,-2.612,0);L.cyl('brass',.04,.04,.06,dw-.18,1.05,-2.6,10,0,Math.PI/2);
  L.box('brass',.34,.2,.02,0,1.75,-2.612,0);ctx.signs.push((()=>{const w=L.pt(0,1.75,-2.59);return{x:w.x,y:w.y,z:w.z,yaw:L.yaw(0),txt:'60',w:.3}})());
  L.box('board',1.7,.4,.06,0,2.75,-2.56,0);ctx.signs.push((()=>{const w=L.pt(0,2.75,-2.52);return{x:w.x,y:w.y,z:w.z,yaw:L.yaw(0),txt:'OLD WORKINGS',w:1.6}})());
  const w=L.pt(0,0,-2.62);ctx.portal={x:w.x,y:w.y,z:w.z,yaw:L.yaw(0)};return true}

 const base={cx:bl.cx,cz:bl.cz,rx:bl.rx,rz:bl.rz};

 /* ====== MAGMA CHAMBER ====== */
 if(t=='magma'){const lavaL=f1('lava'),lake=f1('lake'),moat=f1('moat');const holes=[],pits=[];let band=null;
  if(lavaL){band=ugBand(L0,bl,lavaL.pts,lavaL.w);holes.push(band)}
  if(lake)pits.push({cx:lake.cx,cz:lake.cz,rx:lake.rx,rz:lake.rz});
  if(moat)pits.push({cx:moat.cx,cz:moat.cz,rx:moat.r+moat.w/2,rz:moat.r+moat.w/2});
  const gl0=f1('goal');const ch=ugChamber(b,p,Lv,ctx,Object.assign({},base,{dome:5.5,holes,pits,floor:v==2?'crust':fl,pick:pick3,noVein:gl0?(x,z)=>Math.hypot(x-gl0.x,z-gl0.z)<3.2:null})),L=ch.L;
  if(band){ugHoleSides(L,L0,band,.9,rk,'lava',-.42);for(let i=0;i<band.length;i+=Math.max(1,band.length/8|0)){const q=band[i];lamp(q[0],.5,q[1],1.1)}}
  if(lake){const pr=[[1,0],[.9,-.25],[.7,-.45],[0,-.55]];ugPool(L,lake,{prof:pr,surf:-.32,dep:.55,key:'lava',rock:rk,layers:false,sr:.86});lamp(lake.cx,.6,lake.cz,1.6);
   if(!lake.noisle){/* the island in the lake with a diamond outcrop */L.geo(rk,new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),lake.cx,-.32,lake.cz,0,0,0,1.25,.55,1.25);
    const g=new THREE.IcosahedronGeometry(.5,1);L.geo(rk,g,lake.cx,.35,lake.cz);for(const a of[.4,2.5,4.4]){const w=L0.pt(lake.cx+Math.cos(a)*.42,.45,lake.cz+Math.sin(a)*.42),d=L0.dir(Math.cos(a),Math.sin(a));ctx.veins.push({x:w.x,y:w.y,z:w.z,dx:d[0],dz:d[1],t:'dm'})}}}
  for(const f of fx('stones'))for(const q of f.pts)L.geo(rk,new THREE.CylinderGeometry(.42,.55,1,7),q[0],-.45,q[1],R()*3);
  for(const f of fx('bridge'))ugStoneBridge(L,rk,f.x0,f.z0,f.x1,f.z1);
  for(const f of fx('gey'))ugVent(L,f.x,f.z,.95,.45,rk,2.6);
  for(const f of fx('cols'))for(const q of f.pts)ugBasaltCols(L,R,q[0],q[1],f.r,ch.roofAt(q[0],q[1]));
  if(v==1){/* the lavafall: out of a crack high in the wall, over a lip, into the pool; a basalt shelf round it to gold */
   const fl2=f1('falls'),an=Math.atan2(fl2.z-bl.cz,fl2.x-bl.cx),top=3.4,w=ch.wallPt(an,top),wc=ch.wallPt(an,top+.42),yaw=Math.atan2(-w.nx,-w.nz),io=(q,o2)=>[q.x-q.nx*o2,q.z-q.nz*o2];
   {const c=io(wc,-.22);L.box('black',2,.3,.6,c[0],top+.42,c[1],yaw)}{const c=io(w,.1);L.geo(rk,new THREE.IcosahedronGeometry(1,1),c[0],top,c[1],yaw,0,0,1.4,.3,.55)}
   const sheet=(o0,o1,w0,w1)=>{const g=new THREE.PlaneGeometry(1,1,6,14),pa=g.attributes.position;for(let i=0;i<pa.count;i++){const f=.5-pa.getY(i),wd=w0+(w1-w0)*f;pa.setXYZ(i,pa.getX(i)*wd,top+.24-(top+.5)*f,o0+(o1-o0)*Math.sqrt(f))}g.computeVertexNormals();L.geo('lavaFall',g,w.x,0,w.z,yaw)};
   sheet(.55,2.5,1.4,2.6);lamp(io(w,1.5)[0],2,io(w,1.5)[1],1.8);
   /* the shelf: the tops of basalt columns packed in a honeycomb along the walk, each its own height, thin dark cracks
      between them; none overhang the pool */
   {const wk=f1('walk').pts,hr=.46,dx=Math.sqrt(3)*hr,dz=1.5*hr,lk=f1('lake'),near=(x,z)=>{let d=1e9;for(let i=1;i<wk.length;i++)d=Math.min(d,ugSegD(x,z,wk[i-1],wk[i]));return d};
    let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const q of wk){x0=Math.min(x0,q[0]-1);x1=Math.max(x1,q[0]+1);z0=Math.min(z0,q[1]-1);z1=Math.max(z1,q[1]+1)}
    for(let j=Math.floor(z0/dz);j*dz<=z1;j++)for(let i=Math.floor(x0/dx)-1;i*dx<=x1;i++){const x=i*dx+(j&1?dx/2:0),z=j*dz;if(near(x,z)>.95)continue;
     if(lk&&((x-lk.cx)/(lk.rx+.5))**2+((z-lk.cz)/(lk.rz+.5))**2<1)continue;const top=.06+R()*.2;L.geo('basalt',new THREE.CylinderGeometry(hr-.03,hr-.03,top+.3,6),x,(top-.3)/2,z,0)}}
   const gl=f1('goal');for(let k=0;k<3;k++){const w2=ch.wallPt(Math.atan2(gl.z-bl.cz,gl.x-bl.cx)+(k-1)*.07,[1.2,1.9,2.6][k]);const W2=L0.pt(w2.x+w2.nx*.06,w2.y,w2.z+w2.nz*.06),d=L0.dir(-w2.nx,-w2.nz);ctx.veins.push({x:W2.x,y:W2.y,z:W2.z,dx:d[0],dz:d[1],t:'au'})}}
  if(v==2){/* the crust field: the floor is cooled crust; glowing patches burn (listed in ctx.hot for the game) */
   const cf=f1('crust');for(const q of scatter(8,cf.cx,cf.cz,cf.rx*.85,cf.rz*.85,2.4,true)){const r=.7+R()*.6,g=new THREE.CircleGeometry(1,12),pa=g.attributes.position;for(let i=1;i<pa.count;i++){const k=.75+R()*.4;pa.setXY(i,pa.getX(i)*k,pa.getY(i)*k)}g.rotateX(-Math.PI/2);
    L.geo('lava',g,q[0],.012,q[1],R()*6,0,0,r,1,r);const w=L0.pt(q[0],0,q[1]);ctx.hot.push({x:w.x,z:w.z,r});lamp(q[0],.4,q[1],.8)}}
  if(v==3){/* the obsidian moat: a ring of lava round an island of black glass with diamond and gold on it */
   const ri=moat.r-moat.w/2,ro=moat.r+moat.w/2;L.geo('obsidianF',new THREE.CircleGeometry(ri,48).rotateX(-Math.PI/2),moat.cx,0,moat.cz);
   L.geo(rk,ugInside(new THREE.CylinderGeometry(ro,ro,.9,48,1,true)),moat.cx,-.45,moat.cz);L.geo('obsidian',new THREE.CylinderGeometry(ri,ri,.9,48,1,true),moat.cx,-.45,moat.cz);
   L.geo('lava',new THREE.RingGeometry(ri,ro,48).rotateX(-Math.PI/2),moat.cx,-.42,moat.cz);for(let k=0;k<4;k++){const a=k*1.57+.4;lamp(moat.cx+Math.cos(a)*moat.r,.5,moat.cz+Math.sin(a)*moat.r,1.1)}
   for(let k=0;k<3;k++){const a=k*2.1+.9,x=moat.cx+Math.cos(a)*2.6,z=moat.cz+Math.sin(a)*2.6,g=new THREE.IcosahedronGeometry(.7,0);L.geo('obsidian',g,x,.3,z,R()*3,0,0,1,1.3,1);
    for(const b2 of[0,2.1,4.2]){const w=L0.pt(x+Math.cos(a+b2)*.5,.55,z+Math.sin(a+b2)*.5),d=L0.dir(Math.cos(a+b2),Math.sin(a+b2));ctx.veins.push({x:w.x,y:w.y,z:w.z,dx:d[0],dz:d[1],t:k?'au':'dm'})}}
   for(let i=0;i<14;i++){const a=R()*6.28,r=Math.sqrt(R())*(ri-.6),h=.15+R()*.3;L.geo('obsidian',new THREE.ConeGeometry(.08+R()*.06,h,4),moat.cx+Math.cos(a)*r,h/2-.03,moat.cz+Math.sin(a)*r,R()*3)}}
  return true}

 /* ====== DARK CAVE: pitch black rock ====== */
 if(t=='dark'){const ch0={dome:v==4?6.5:3.6,rock:'rockK',pick:pick3};const cf=f1('chasm'),pit=f1('pit'),wat=fx('water').find(w=>w.deep);let band=null;
  if(cf){band=ugBand(L0,bl,cf.pts,cf.w);ch0.holes=[band]}if(pit)ch0.pits=[{cx:pit.cx,cz:pit.cz,rx:pit.rx,rz:pit.rz}];if(wat)ch0.pits=[{cx:wat.cx,cz:wat.cz,rx:wat.rx,rz:wat.rz}];
  if(pit){const gl=f1('goal');ch0.pick=()=>R()<.5?'dm':'au';}
  const ch=ugChamber(b,p,Lv,ctx,Object.assign({},base,ch0)),L=ch.L;const gw=f1('glow');
  if(band){ugHoleSides(L,L0,band,9,'rockK','black');const f=f1('bridge');/* a plank bridge on two beams */const dx=f.x1-f.x0,dz=f.z1-f.z0,l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l,rx2=uz,rz2=-ux,yaw=Math.atan2(dx,dz);
   for(const sd of[-.42,.42])L.box('woodD',.14,.16,l+.8,f.x0+dx/2+rx2*sd,-.04,f.z0+dz/2+rz2*sd,yaw);for(let s=-.25;s<l+.3;s+=.3)L.box('wood',1.1,.05,.26,f.x0+ux*s,.065,f.z0+uz*s,yaw)}
  if(pit){/* a round shaft with no bottom you can see, a rough lip round it */L.geo('rockK',ugInside(new THREE.CylinderGeometry(pit.rx+.03,pit.rx*.9,24,40,6,true)),pit.cx,-12,pit.cz);L.geo('black',new THREE.CircleGeometry(pit.rx,24).rotateX(-Math.PI/2),pit.cx,-23.5,pit.cz);
   L.geo('rockK',new THREE.TorusGeometry(pit.rx+.08,.12,6,48).rotateX(Math.PI/2),pit.cx,.0,pit.cz,0,0,0,1,1,1)}
  if(wat){ugPool(L,wat,{bowl:1,surf:-.15,dep:3,key:'poolK',rock:'rockK',layers:false})}
  if(gw)ugGlowworms(L,ch,R,gw.n,bl.cx,gw.cz,gw.rx,gw.rz);
  if(v==3)for(const f of fx('cols'))for(const q of f.pts)ugColumn(L,q[0],q[1],f.r*.85,ch.roofAt(q[0],q[1]),'rockK',R);
  if(v==4){/* the bat roost: bats hanging in clusters under the high roof, guano below them */const sp=f1('spots');for(const q of scatter(sp.n/3|0,0,sp.cz,sp.rx,sp.rz,1.8,false)){const rf=ch.roofAt(q[0],q[1]);
    for(let k=0;k<5+(R()*5|0);k++){const x=q[0]+(R()-.5)*1.2,z=q[1]+(R()-.5)*1.2;L.geo('bat',new THREE.ConeGeometry(.07,.24,5).rotateX(Math.PI),x,rf-.12-.25,z,R()*3);L.cyl('bat',.01,.01,.5,x,rf,z,3)}
    const g=new THREE.CircleGeometry(1,10),pa=g.attributes.position;for(let i=1;i<pa.count;i++){const k=.6+R()*.5;pa.setXY(i,pa.getX(i)*k,pa.getY(i)*k)}g.rotateX(-Math.PI/2);L.geo('guano',g,q[0],.012,q[1],R()*6,0,0,1.1,1,.9)}}
  return true}

 /* ====== THE GEODE and THE HOT SEAM: a narrow neck, then a round room ====== */
 if(t=='geode'||t=='hotseam'){const neck=p.d.shp.find(s=>s.k=='path'),nw=W.shp.find(s=>s.k=='path'),e=neck.pts[neck.pts.length-1],e0=neck.pts[neck.pts.length-2]||[0,0],nl=Math.hypot(e[0]-e0[0],e[1]-e0[1]);
  {const fx0=nw.pts[0][0]-nw.pts[1][0],fz0=nw.pts[0][1]-nw.pts[1][1],fl0=Math.hypot(fx0,fz0);ugBulkhead(b,nw.pts[0][0],y,nw.pts[0][1],fx0/fl0,fz0/fl0,neck.w/2,{rock:rk})}
  ugCave(b,nw.pts.map(q=>[q[0],y,q[1]]),{hw:neck.w/2,rock:rk,floor:fl,amp:.25});
  if(t=='geode'){/* a real geode: a shell of banded stone (the version's colour) lined with a tight carpet of single crystals,
     all pointing in towards the middle, about the same size with a few big ones and a few clear ones */
   const mats=[['amethyst','geoA'],['celestine','geoC'],['citrine','geoT'],['smoky','geoS']][v],key=mats[0];
   const ch=ugChamber(b,p,Lv,ctx,Object.assign({},base,{dome:3.2,amp:.35,rock:mats[1],stones:false,doorsExtra:[{x:e[0],z:e[1],nx:(e0[0]-e[0])/nl,nz:(e0[1]-e[1])/nl,hw:neck.w/2}],pick:()=>v==2?(R()<.5?'au':'cr'):(R()<.6?'cr':'dm'),veinGap:3.2,veinSkip:.5})),L=ch.L;
   const mid=[bl.cx,1.5,bl.cz],nearNeck=(x,z)=>Math.hypot(x-e[0],z-e[1])<2.1;
   /* one crystal: an open six-sided prism (its foot is in the rock) with a pointed tip */
   const prism=(x,y0,z,len,r,k)=>{const d=new THREE.Vector3(mid[0]-x,mid[1]-y0,mid[2]-z).normalize().add(new THREE.Vector3((R()-.5)*.55,(R()-.5)*.55,(R()-.5)*.55)).normalize();
    const g=new THREE.CylinderGeometry(r,r*1.1,len,6,1,true);g.translate(0,len/2-.1,0);const tip=new THREE.ConeGeometry(r,r*2.2,6,1,true);tip.translate(0,len-.1+r*1.1,0);
    const M=new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d)).multiply(new THREE.Matrix4().makeRotationY(R()*1.05));for(const gg of[g,tip]){gg.applyMatrix4(M);L.geo(k,gg,x,y0,z)}};
   /* sizes come in patches (world noise): fields of small crystals, beds of bigger ones, now and then a giant */
   const grow=(x,y0,z)=>{const w=L0.pt(x,y0,z),n=ugNoise(w.x*.9,w.y*.9,w.z*.9),q=Math.pow(n,1.6);const big=R()<.025;const len=big?1+R()*.5:.18+q*.75+R()*.18;const r=big?.13:.035+len*.12+R()*.02;
    const k=R()<.025?'clearC':key;prism(x,y0,z,len,r,k);if(!big&&R()<.5){const o=r*2.4;prism(x+(R()-.5)*o,y0+(R()-.5)*o,z+(R()-.5)*o,len*(.5+R()*.4),r*.8,k)}};
   /* scattered evenly but not in rows: tries with a minimum spacing, wall and roof */
   const got=[],near=(x,y0,z,m)=>got.some(q=>(q[0]-x)**2+(q[1]-y0)**2+(q[2]-z)**2<m*m);
   for(let t2=0;t2<2600;t2++){const a=R()*Math.PI*2,yy=.12+R()*3.45,w=ch.wallPt(a,yy);if(nearNeck(w.x,w.z)||near(w.x,yy,w.z,.27))continue;got.push([w.x,yy,w.z]);grow(w.x+w.nx*.03,yy,w.z+w.nz*.03)}
   for(let t2=0;t2<2200;t2++){const a=R()*Math.PI*2,rr=Math.sqrt(R())*bl.rx*.97,x=bl.cx+Math.cos(a)*rr,z=bl.cz+Math.sin(a)*rr*bl.rz/bl.rx,yy=ch.roofAt(x,z)+.06;if(nearNeck(x,z)||near(x,yy,z,.27))continue;got.push([x,yy,z]);grow(x,yy,z)}
   lamp(bl.cx,1.4,bl.cz,1.4);lamp(bl.cx+1.5,2.6,bl.cz-1.5,.9)}
  else{/* the hot seam: glowing green rock and crystals; the green spring; the core shed */
   const wf=fx('water').find(w=>w.deep);const ch=ugChamber(b,p,Lv,ctx,Object.assign({},base,{dome:1.6,amp:.4,rock:'urRock',stones:false,doorsExtra:[{x:e[0],z:e[1],nx:(e0[0]-e[0])/nl,nz:(e0[1]-e[1])/nl,hw:neck.w/2}],pits:wf?[{cx:wf.cx,cz:wf.cz,rx:wf.rx,rz:wf.rz}]:[],pick:()=>R()<.7?'ur':'au',veinGap:1.8,veinSkip:.1})),L=ch.L;
   for(let i=0;i<10;i++){const a=R()*6.28,w=ch.wallPt(a,.25);if(Math.hypot(w.x-e[0],w.z-e[1])<1.6)continue;ugCrystalsDir(L,R,w.x+w.nx*.05,.25,w.z+w.nz*.05,[-w.nx,.6,-w.nz],.45+R()*.3,'uran')}
   lamp(bl.cx,1,bl.cz,1.2);
   if(wf){ugPool(L,wf,{bowl:1,surf:-.2,dep:1.6,key:'poolG',rock:'urRock',layers:false});for(let k=0;k<3;k++)L.geo('mist',new THREE.PlaneGeometry(2.6,1.6),wf.cx,.9,wf.cz,k*Math.PI/3)}
   if(v==2){/* core boxes with glowing drill cores, and the old core drill by the wall */for(const q of fx('blk').find(f=>f.n=='core box').pts){L.box('wood',.9,.35,.55,q[0],.175,q[1],.2);for(let k=0;k<3;k++)L.cyl('uran',.05,.05,.8,q[0]+(k-1)*.15*Math.cos(.2),.38,q[1]-(k-1)*.15*Math.sin(.2),8,.2+Math.PI/2,0,Math.PI/2)}
    const a=Math.atan2(-.5,1),w=ch.wallPt(a,.2),x=w.x-w.nx*.7,z=w.z-w.nz*.7;for(const s of[-.4,.4])ugBeam(L,'steel',[x+s,0,z],[x,2.2,z],.08,.08);L.box('dark',.4,.4,.4,x,1.5,z,0);L.cyl('steel',.03,.03,1.4,x,.75,z,8);L.box('paintY',.5,.25,.3,x,1.85,z,0)}}
  return true}
 return false}

/* ---------- the level 3 stations: their own props and dressing ---------- */
{const p0=ugProp;ugProp=function(b,n,x,y,z,yaw,r,ctx){const c=Math.cos(yaw),s=Math.sin(yaw),at=(lx,lz)=>[x+c*lx+s*lz,z-s*lx+c*lz];
 if(n=='barrel'){b.cyl('wood',.32,.3,.95,x,y+.475,z,14);for(const yy of[.15,.8])b.cyl('dark',.335,.335,.06,x,y+yy,z,14);b.cyl('steel',.31,.31,.02,x,y+.96,z,14);return}
 if(n=='fan'){/* a big fan on a stand, blowing cool air at the shaft */b.box('dark',.9,.12,.6,x,y+.06,z,yaw);b.box('dark',.12,1.2,.12,x,y+.66,z,yaw);const q=at(0,.05);b.add('steel',new THREE.TorusGeometry(.62,.06,8,24),new THREE.Matrix4().compose(new THREE.Vector3(q[0],y+1.5,q[1]),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,yaw,0)),new THREE.Vector3(1,1,1)));
  b.cyl('dark',.16,.16,.3,x,y+1.5,z,12,yaw,Math.PI/2);for(let k=0;k<4;k++)b.add('steel',new THREE.BoxGeometry(.16,.55,.02),new THREE.Matrix4().compose(new THREE.Vector3(q[0],y+1.5,q[1]),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,yaw,k*Math.PI/2+.3,'YXZ')),new THREE.Vector3(1,1,1)).multiply(new THREE.Matrix4().makeTranslation(0,.33,.07)));return}
 if(n=='valve box'){b.box('dark',.7,1,.45,x,y+.5,z,yaw);const q=at(0,.25);b.add('paintR',new THREE.TorusGeometry(.22,.035,6,16),new THREE.Matrix4().compose(new THREE.Vector3(q[0],y+.75,q[1]),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,yaw,0)),new THREE.Vector3(1,1,1)));b.cyl('steel',.04,.04,.12,q[0],y+.75,q[1],8,yaw,Math.PI/2);return}
 return p0.apply(this,arguments)}}
{const s0=ugStationBuild;ugStationBuild=function(b,p,L,ctx){s0(b,p,L,ctx);if(L!=2)return;const y=UGLY(L),T=ugT(p),v=p.d.v||0,hs=6;
 /* a warning board on the wall beside the gate side */
 const sign=(lx,lz,ix,iz,txt,w)=>{const q=T(lx,lz),n=ugRot(ix,iz,p.r),yaw=Math.atan2(n[0],n[1]),map=/ MAP$/.test(txt),h=map?1.1:.34,yy=y+(map?1.7:2.1);b.box('board',w+.1,h+.1,.3,q[0]-n[0]*.13,yy,q[1]-n[1]*.13,yaw);ctx.signs.push({x:q[0]+n[0]*.025,y:yy,z:q[1]+n[1]*.025,yaw,txt,w,h,map})};
 if(v==0){sign(-hs+.02,-3.8,1,0,'HOT GROUND',1.6);sign(-hs+.02,3.8,1,0,'LEVEL 3 MAP',1.6)}
 if(v==1){const q=T(-4.6,4.6);ugProp(b,'barrel',q[0],y,q[1],0,.4,ctx);b.cyl('frost',.28,.28,.02,q[0],y+.975,q[1],14);sign(-hs+.02,-3.8,1,0,'TEMP 52 °C',1.4);sign(-hs+.02,3.8,1,0,'LEVEL 3 MAP',1.6)}
 if(v==2){/* steel bulkheads in every doorway: a steel wall in the arch with a door that swings on its hinge (a moving part) */
  sign(-hs+.02,3.8,1,0,'LEVEL 3 MAP',1.6);const r={x0:-hs,x1:hs,z0:-hs,z1:hs},K=ugKit();for(const d of ugDoorsFor(p,r)){const fx2=d.x-p.x,fz2=d.z-p.z,fl=Math.hypot(fx2,fz2),nx=fx2/fl,nz=fz2/fl,px=d.x+nx*.25,pz=d.z+nz*.25,yaw=Math.atan2(nx,nz);
   const big=ugProf(2),dw=.75,dh=2.1,sh=new THREE.Shape();sh.moveTo(-2,0);for(const q of big.P.filter(q=>q[1]>=0))sh.lineTo(q[0],q[1]);sh.lineTo(2,0);sh.lineTo(dw,0);sh.lineTo(dw,dh);sh.lineTo(-dw,dh);sh.lineTo(-dw,0);sh.lineTo(-2,0);
   const g=new THREE.ShapeGeometry(sh);const g2=g.clone();g2.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI));for(const [gg,o] of[[g,-.04],[g2,.04]])b.add('dark',gg,new THREE.Matrix4().compose(new THREE.Vector3(px-nx*o,y,pz-nz*o),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,yaw+Math.PI,0)),new THREE.Vector3(1,1,1)));
   /* the frame's posts stop under its head (no faces shared) */for(const sd of[-1,1])b.box('paintY',.12,dh,.14,px-Math.cos(yaw)*sd*(dw+.06),y+dh/2,pz+Math.sin(yaw)*sd*(dw+.06),yaw);b.box('paintY',2*dw+.24,.12,.14,px,y+dh+.06,pz,yaw);
   /* the door: hinged on its left edge; the game turns the group about y to open it (closed at 0) */
   const dg=new THREE.Group(),hx=-Math.cos(yaw)*dw,hz=Math.sin(yaw)*dw;dg.position.set(px+hx-nx*.12,y,pz+hz-nz*.12);dg.rotation.y=yaw;const leaf=new THREE.Mesh(new THREE.BoxGeometry(2*dw-.04,dh-.04,.08),K.mat.dark);leaf.position.set(dw,(dh-.04)/2+.02,0);dg.add(leaf);
   const wh=new THREE.Mesh(new THREE.TorusGeometry(.2,.03,6,16),K.mat.paintR);wh.position.set(dw,1.1,-.07);dg.add(wh);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.1,8),K.mat.steel);hub.rotation.x=Math.PI/2;hub.position.set(dw,1.1,-.06);dg.add(hub);
   dg.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});dg.userData.ugDoor={hinge:'left',open:-Math.PI/2};ctx.moving.push(dg)}}}}

/* ---------------- docs/design/models/quarry-under-shift.js ---------------- */
/* =====================================================================================================
   The Old Quarry underground, batch 5: THE SHIFT (docs/design/quarry-underground.md, "How a shift plays").
   Needs the other quarry-under files (loads last). Things that move, get picked up, or come and go during a shift.
   Each is its own group (never merged into the level batches), built at the origin, facing -z, standing on y 0.
   - ugDynamite(), ugDynCrate(n), ugCharge() (+ userData.tick(t)), ugBlast() (+ tick(t), false when done)
   - ugRockfall(w, h, len, seed, L): rubble filling a passage; userData.stage(k) = k swings dug (0-8)
     ugRockfallSpot(plan, L, seed): where this shift's rockfall goes {x, z, yaw, w, h, len, piece}
   - ugGasCloud(seed) (+ tick(t, life)), ugDust(seed) (+ tick(t))
   - ugRaft(), ugZipHandle(): moving parts (put in ctx.moving, their paths in userData)
   - ugLunchbox(), ugNote(i), ugTag(n, name), ugFossil(kind): pickups (put in ctx.pickups)
   - UGNOTES: the old miners' notes; UGSINK: the Shaft sinking upgrade
   - ugMapTex(plan, L, o): the station's map board; ugMiniDraw(c2d, plan, L, o): the minimap underground
   - ugCagePanel(): the panel in the cage, userData.set(open, here)
   - ugPut(Lh, obj, x, y, z, ry): place a group in a room's own coordinates (Lh = ugLocal(...))
   ===================================================================================================== */

/* ---------- materials ---------- */
{const k0=ugKit;ugKit=function(){const K=k0();if(K.sh)return K;K.sh=1;const M=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.8},o));
 const F=s=>'700 '+s+'px "Barlow Semi Condensed",DoorsSans,Arial';
 K.dynT=ugCanvas(128,64,(k,w,h)=>{k.fillStyle='#b8261c';k.fillRect(0,0,w,h);k.fillStyle='rgba(0,0,0,.18)';for(let x=0;x<w;x+=9)k.fillRect(x,0,1,h);k.fillStyle='#ecdcae';k.fillRect(0,h*.3,w,h*.4);k.fillStyle='#1a1008';k.font=F(15);k.textAlign='center';k.textBaseline='middle';k.fillText('DYNAMITE',w/2,h/2+1)});
 K.crateT=ugCanvas(256,128,(k,w,h)=>{k.fillStyle='#a07a4c';k.fillRect(0,0,w,h);for(let i=1;i<5;i++){k.fillStyle='rgba(60,36,16,.4)';k.fillRect(0,i*h/5,w,2)}k.fillStyle='#a8201a';k.font=F(34);k.textAlign='center';k.fillText('EXPLOSIVES',w/2,62);k.font=F(20);k.fillText('HANDLE WITH CARE',w/2,96)});
 K.paperT=ugCanvas(128,96,(k,w,h)=>{k.fillStyle='#e8dcbc';k.fillRect(0,0,w,h);k.strokeStyle='rgba(40,30,20,.55)';k.lineWidth=1.4;const r=ugRng(5);for(let y=16;y<h-10;y+=10){k.beginPath();let x=10;k.moveTo(x,y);const e=w-12-r()*30;while(x<e){x+=4+r()*7;k.lineTo(x,y+(r()-.5)*2.5)}k.stroke()}});
 K.splitT=ugCanvas(128,128,(k,w,h)=>{k.fillStyle='#b4a488';k.fillRect(0,0,w,h);const r=ugRng(8);for(let i=0;i<500;i++){k.fillStyle='rgba('+(60+r()*60|0)+','+(50+r()*40|0)+',30,'+(r()*.25)+')';k.fillRect(r()*w,r()*h,1+r()*4,1+r()*3)}});
 Object.assign(K.mat,{
  dyn:M({map:K.dynT,roughness:.7}),fuse:M({color:0x2a2018,roughness:1}),tape:M({color:0x9a968a,roughness:.6}),straw:M({color:0xc8a860,roughness:1}),
  spark:new THREE.MeshBasicMaterial({color:0xffd060}),crateS:M({map:K.crateT}),
  tin:M({color:0x3e6a7e,metalness:.45,roughness:.45}),tinD:M({color:0x3e6a7e,metalness:.45,roughness:.45,side:THREE.DoubleSide}),paper2:M({map:K.paperT,roughness:.95,side:THREE.DoubleSide}),
  split:M({map:K.splitT,roughness:.9}),fossil:M({color:0xdccfae,roughness:.7}),
  flash:new THREE.MeshBasicMaterial({color:0xfff0c0,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending}),
  gas:new THREE.MeshBasicMaterial({map:K.fadeT,color:0xc8e050,transparent:true,opacity:.33,depthWrite:false,side:THREE.DoubleSide}),
  dust:new THREE.MeshBasicMaterial({map:K.fadeT,color:0x9a8670,transparent:true,opacity:.5,depthWrite:false,side:THREE.DoubleSide})});
 for(const k in K.mat)K.mat[k].userData.ug=K.mat[k].userData.ug||k;return K}}
const ugMesh=(geo,mat)=>{const m=new THREE.Mesh(geo,typeof mat=='string'?ugKit().mat[mat]:mat);m.userData.noSeam=true;return m};
const ugAt=(m,x,y,z,rx,ry,rz)=>{m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);return m};
/* place a group in a room's own coordinates (Lh from ugLocal) */
function ugPut(Lh,o,x,y,z,ry,rx,rz){Lh.M(x,y,z,ry,rx,rz).decompose(o.position,o.quaternion,o.scale);return o}
/* three soft upright planes crossing and one flat one: a puff of gas or dust that looks right from any side */
function ugPuff(mat,w,h){const g=new THREE.Group();for(let k=0;k<3;k++)g.add(ugAt(ugMesh(new THREE.PlaneGeometry(w,h),mat),0,0,0,0,k*Math.PI/3));g.add(ugMesh(new THREE.CircleGeometry(w*.45,16).rotateX(-Math.PI/2),mat));return g}

/* ---------- dynamite ---------- */
const ugStick=len=>ugMesh(new THREE.CylinderGeometry(.022,.022,len||.2,12),'dyn');
function ugDynamite(){const g=new THREE.Group();g.add(ugAt(ugStick(),0,.022,0,0,0,Math.PI/2));
 g.add(ugMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(.098,.022,0),new THREE.Vector3(.14,.026,0),new THREE.Vector3(.17,.03,.02),new THREE.Vector3(.19,.006,.05)]),10,.004,4),'fuse'));
 g.userData.pick='dynamite';return g}
/* an open crate of dynamite: lid off and leant against its side, sticks lying on the packing straw; n sticks (0-12) */
function ugDynCrate(n){const g=new THREE.Group(),W=.62,H=.34,D=.42,t=.025;
 g.add(ugAt(ugMesh(new THREE.BoxGeometry(W-2*t,t,D-2*t),'wood'),0,t/2,0));
 for(const sd of[-1,1]){g.add(ugAt(ugMesh(new THREE.BoxGeometry(W,H,t),'wood'),0,H/2,sd*(D/2-t/2)));g.add(ugAt(ugMesh(new THREE.BoxGeometry(t,H,D-2*t),'wood'),sd*(W/2-t/2),H/2,0))}
 g.add(ugAt(ugMesh(new THREE.PlaneGeometry(W-.06,H-.08),'crateS'),0,H/2,D/2+.007));
 const sy=t+.2;g.add(ugAt(ugMesh(new THREE.BoxGeometry(W-2*t-.01,.2,D-2*t-.01),'straw'),0,t+.1,0));
 /* sticks lie across the crate (along x) in a row of 7, then a second layer of 5 in the dips */
 for(let i=0;i<Math.min(12,n||0);i++){const row=i<7?0:1,k=row?i-7:i;g.add(ugAt(ugStick(.2),(k%2?.04:-.04),sy+.022+row*.036,-.15+k*.05+(row?.025:0),0,0,Math.PI/2))}
 /* the lid stands on the floor and leans on the top edge of the +x side */
 g.add(ugAt(ugMesh(new THREE.BoxGeometry(W,.02,D),'woodD'),W/2+.022,.3,0,0,0,-1.25));
 g.userData.pick='dynamite crate';return g}
/* a set charge on the face: a stick taped flat to the rock (the rock is behind, +z), a fuse hanging from it, and a
   spark burning up the fuse. tick(t): t = seconds since lit, a 4 s fuse; returns false when it goes off */
function ugCharge(){const g=new THREE.Group();g.add(ugAt(ugStick(),0,0,-.024));
 for(const y of[-.055,.055])g.add(ugAt(ugMesh(new THREE.BoxGeometry(.07,.022,.03),'tape'),0,y,-.015));
 const pts=[];for(let i=0;i<=8;i++){const f=i/8;pts.push(new THREE.Vector3(.04*Math.sin(f*4),-.1-f*.38,-.024-.05*Math.sin(f*2.6)))}const fc=new THREE.CatmullRomCurve3(pts);g.add(ugMesh(new THREE.TubeGeometry(fc,16,.005,4),'fuse'));
 const sp=ugMesh(new THREE.SphereGeometry(.022,8,6),'spark');g.add(sp);g.userData.tick=t=>{sp.position.copy(fc.getPoint(Math.max(0,1-t/4)));sp.scale.setScalar(.8+Math.random()*.8);return t<4};g.userData.tick(0);g.userData.pick='charge';return g}
/* the blast: a flash, then dust rolling out (tick(t) returns false when it has gone). It has its own materials */
function ugBlast(){const g=new THREE.Group(),K=ugKit(),fm=K.mat.flash.clone(),dm=K.mat.dust.clone(),fl=ugMesh(new THREE.SphereGeometry(1,16,10),fm);g.add(fl);const ps=[],R=ugRng(17);
 for(let i=0;i<7;i++){const p=ugPuff(dm,2.2,1.6),a=R()*6.28;p.userData.d=[Math.cos(a),R()*.4,Math.sin(a)];g.add(p);ps.push(p)}
 g.userData.tick=t=>{fl.visible=t<.25;fl.scale.setScalar(.3+t*9);fm.opacity=Math.max(0,.9-t*3.6);const k=Math.min(1,t/1.4);for(const p of ps){const d=p.userData.d;p.position.set(d[0]*k*2.6,.7+d[1]*k*2+k*.6,d[2]*k*2.6);p.scale.setScalar(.5+k*1.4)}dm.opacity=.55*(1-Math.min(1,Math.max(0,(t-1)/2)));return t<3};
 g.userData.tick(0);return g}

/* ---------- the rockfall ---------- */
/* rubble filling a passage w wide, h high, len long (its own coords: the passage runs along z, centred on 0, floor
   at y 0). A heap highest in the middle, lower at both ends, stones spilling out. The stones in a 1.8 m wide notch
   down the middle (all the way up, so nothing is left hanging) are split into 8 slices along the way, dug from both ends towards the middle;
   stage(k) clears the first k (k = swings so far; 8 = through). Batched: one mesh per slice and material */
function ugRockfall(w,h,len,seed,L){const R=ugRng(seed||9),K=ugKit(),g=new THREE.Group(),rk=ugRK(L||0),order=[0,7,1,6,2,5,3,4];
 const bs=[];for(let i=0;i<9;i++)bs.push(ugBatch());
 const put=(b,s,x,y,z)=>b.add(R()<.3?'oreRock':rk,new THREE.DodecahedronGeometry(s,0),new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(R()*3,R()*3,R()*3)),new THREE.Vector3(1,.8,1)));
 for(let z=-len/2;z<=len/2+.01;z+=.4)for(let x=-w/2+.15;x<=w/2-.15+.01;x+=.4){const e=Math.min(1,Math.abs(z)/(len/2)),top=h*(.45+.55*Math.cos(e*Math.PI/2))*(1-.3*Math.pow(Math.abs(x)/(w/2),3));
  for(let y=.16;y<top;y+=.38){const s=.2+R()*.17,px=x+(R()-.5)*.2,py=y+(R()-.5)*.12,pz=z+(R()-.5)*.2;let k=8;if(Math.abs(px)<.9)k=order.indexOf(Math.min(7,Math.max(0,Math.floor((pz+len/2)/len*8))));put(bs[k],s,px,py,pz)}}
 for(let i=0;i<46;i++){const s=.06+R()*.13,e=R()<.5?-1:1;put(bs[8],s,(R()-.5)*w*.85,s*.4,e*(len/2+.15+R()*1.1))}
 const parts=bs.map(b=>{const sg=new THREE.Group();b.build(sg,K.mat);g.add(sg);return sg});
 g.userData.stage=k=>parts.forEach((p,i)=>p.visible=i>=k||i==8);g.userData.rockfall={w,h,len};return g}
/* where this shift's rockfall goes: one side of a pillar round or a rock island (so there is always a way round);
   with none on the level, the middle of a dug join or a tunnel */
function ugRockfallSpot(plan,L,seed){const R=ugRng((seed>>>0)^0x5eed),P=plan.P.filter(p=>p.L==L),pick=a=>a[R()*a.length|0];
 /* a side is free when no doorway opens off it, the parked ore train (rail loop) isn't on it, and no giant mushroom
    caps (mushroom island) reach over it */
 const sides=p=>[-1,1].filter(sd=>!p.d.ex.some(e=>Math.abs(e[0]-10*sd)<.1)&&!(p.type=='round'&&p.d.v==1&&sd==-1)&&!(p.type=='island'&&p.d.v==2));
 const rounds=P.filter(p=>(p.type=='round'||p.type=='island')&&sides(p).length);
 if(rounds.length){const p=pick(rounds),ss=sides(p),sd=ss[R()*ss.length|0],T=ugT(p),isl=p.type=='island',w=T(sd*(isl?7.6:8),isl?-12:-14);
  return{x:w[0],z:w[1],yaw:ugYaw(p),w:isl?4.2:4,h:isl?3.6:3.5,len:3.2,piece:p.id}}
 const tun=P.filter(p=>p.type=='join'),all=tun.length?tun:P.filter(p=>['drive','bend','cpass','cbend'].includes(p.type));if(!all.length)return null;
 const p=pick(all),s=ugWorld(p).shp.find(q=>q.k=='path'),i=Math.max(1,s.pts.length>>1),a=s.pts[i-1],c=s.pts[i];
 return{x:(a[0]+c[0])/2,z:(a[1]+c[1])/2,yaw:Math.atan2(c[0]-a[0],c[1]-a[1]),w:Math.min(4,s.w||4),h:3.2,len:3,piece:p.id}}
/* dust hanging in the air after a fall or a blast (tick(t) returns false when it has settled) */
function ugDust(seed){const R=ugRng(seed||3),g=new THREE.Group(),dm=ugKit().mat.dust.clone();for(let i=0;i<5;i++){const p=ugPuff(dm,3,2.4);p.position.set((R()-.5)*3,1.3,(R()-.5)*4);g.add(p)}
 g.userData.tick=t=>{g.children.forEach(p=>p.position.y=1.3+t*.05);dm.opacity=.5*Math.max(0,1-t/8);return t<8};return g}

/* ---------- gas ---------- */
/* a yellow-green cloud about 6 m across that swells, drifts and thins over its life (25 s by default) */
function ugGasCloud(seed){const R=ugRng(seed||7),g=new THREE.Group(),gm=ugKit().mat.gas.clone();for(let i=0;i<9;i++){const p=ugPuff(gm,2.8,2.2),a=R()*6.28,r=R()*1.8;p.userData.o=[Math.cos(a)*r,.9+R()*.9,Math.sin(a)*r,R()*6.28];g.add(p)}
 g.userData.tick=(t,life)=>{life=life||25;const k=Math.min(1,t/3),fade=Math.max(0,Math.min(1,(life-t)/4));g.children.forEach(p=>{const o=p.userData.o;p.position.set(o[0]*(.5+k*.7)+Math.sin(t*.3+o[3])*.3,o[1],o[2]*(.5+k*.7)+Math.cos(t*.25+o[3])*.3);p.scale.setScalar(.6+k*.6);p.rotation.y=t*.05+o[3]});gm.opacity=.33*fade*Math.min(1,t*2+.2);return t<life};
 g.userData.tick(0,25);return g}

/* ---------- moving parts ---------- */
/* the rope raft: a plank deck on two stringers and four barrels, a post with a ring the rope runs through */
function ugRaft(){const g=new THREE.Group();for(let i=0;i<8;i++)g.add(ugAt(ugMesh(new THREE.BoxGeometry(2.2,.07,.24),'wood'),0,.05,-.95+i*.27));
 for(const sd of[-.75,.75])g.add(ugAt(ugMesh(new THREE.BoxGeometry(.12,.12,2.2),'woodD'),sd,-.03,0));
 for(const [sx,sz] of[[-.6,-.6],[.6,-.6],[-.6,.6],[.6,.6]])g.add(ugAt(ugMesh(new THREE.CylinderGeometry(.26,.26,.9,12),'dark'),sx,-.25,sz,0,0,Math.PI/2));
 g.add(ugAt(ugMesh(new THREE.CylinderGeometry(.05,.05,1.3,6),'woodD'),.9,.7,0));g.add(ugAt(ugMesh(new THREE.TorusGeometry(.08,.02,6,12),'steel'),.9,1.2,0,0,0,Math.PI/2));
 return g}
/* the zip line handle: a pulley on the cable (the group's origin), a rod and a T-bar to hang from. The cable runs
   along the group's z */
function ugZipHandle(){const g=new THREE.Group();g.add(ugAt(ugMesh(new THREE.CylinderGeometry(.09,.09,.06,14),'dark'),0,-.02,0,0,0,Math.PI/2));
 for(const sd of[-.045,.045])g.add(ugAt(ugMesh(new THREE.BoxGeometry(.02,.22,.04),'steel'),sd,-.08,0));
 g.add(ugAt(ugMesh(new THREE.CylinderGeometry(.015,.015,1.1,6),'steel'),0,-.6,0));g.add(ugAt(ugMesh(new THREE.CylinderGeometry(.04,.04,.7,8),'woodD'),0,-1.15,0,0,0,Math.PI/2));return g}

/* ---------- pickups ---------- */
/* the old lunchbox: a tin with a rounded lid (userData.lid turns about x to open it), a wire handle, a brass latch
   and a folded note inside (userData.note, shown when the lid opens) */
function ugLunchbox(){const g=new THREE.Group();g.add(ugAt(ugMesh(new THREE.BoxGeometry(.3,.12,.18),'tin'),0,.06,0));
 const lid=new THREE.Group();lid.position.set(0,.12,-.09);lid.add(ugAt(ugMesh(new THREE.CylinderGeometry(.09,.09,.3,16,1,false,0,Math.PI),'tinD'),0,0,.09,0,0,Math.PI/2));g.add(lid);
 lid.add(ugAt(ugMesh(new THREE.BoxGeometry(.04,.05,.012),'brass'),0,-.005,.186));
 /* the handle is on the lid */for(const sd of[-.1,.1])lid.add(ugAt(ugMesh(new THREE.BoxGeometry(.012,.04,.02),'steel'),sd,.095,.09));lid.add(ugAt(ugMesh(new THREE.CylinderGeometry(.008,.008,.21,6),'steel'),0,.115,.09,0,0,Math.PI/2));
 const nt=ugNote(0);nt.position.set(0,.12,0);nt.rotation.y=.2;nt.visible=false;g.add(nt);g.userData.lid=lid;g.userData.note=nt;g.userData.pick='lunchbox';return g}
/* a folded note lying flat, one half lifted a little at the fold */
function ugNote(i){const g=new THREE.Group(),G=()=>new THREE.PlaneGeometry(.13,.09).rotateX(-Math.PI/2);g.add(ugAt(ugMesh(G(),'paper2'),0,.005,.045));
 g.add(ugAt(ugMesh(G().translate(0,0,-.045),'paper2'),0,.005,0,.35));g.userData.pick='note';g.userData.note=i||0;return g}
/* a miner's brass tag: a disc with a hole and his number stamped in it (a name too, for the one you'll know).
   The face is the group's +z */
function ugTag(n,name){const t=ugCanvas(128,128,(k,w,h)=>{k.fillStyle='#c8a040';k.fillRect(0,0,w,h);k.strokeStyle='#8a6a20';k.lineWidth=5;k.beginPath();k.arc(64,64,58,0,7);k.stroke();k.fillStyle='#4a3008';k.textAlign='center';k.textBaseline='middle';k.font='700 '+(name?40:56)+'px "Barlow Semi Condensed",DoorsSans,Arial';k.fillText(String(n),64,name?62:70);if(name){k.font='700 19px "Barlow Semi Condensed",DoorsSans,Arial';k.fillText(name,64,94)}k.fillStyle='#1a1008';k.beginPath();k.arc(64,20,8,0,7);k.fill()});
 t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;const g=new THREE.Group(),face=new THREE.MeshStandardMaterial({map:t,metalness:.6,roughness:.4});
 g.add(ugAt(ugMesh(new THREE.CylinderGeometry(.05,.05,.004,24,1,true),'brass'),0,0,0,Math.PI/2));
 const c=new THREE.CircleGeometry(.05,24);g.add(ugAt(ugMesh(c,face),0,0,.002));g.add(ugAt(ugMesh(c.clone(),'brass'),0,0,-.002,0,Math.PI));
 g.userData.pick='tag';g.userData.tag=[n,name||''];return g}
/* a fossil: a split lump of stone (the flat split face is the group's -z, the lump behind it, +z) with an ammonite
   (a coiled shell) or a trilobite (a ridged bug) standing out of the face. Set in the wall like a vein, or lying loose */
function ugFossil(kind){const g=new THREE.Group();const lump=ugMesh(new THREE.SphereGeometry(.17,12,8,0,Math.PI*2,0,Math.PI/2),'split');lump.rotation.x=Math.PI/2;lump.scale.set(1,1,.55);g.add(lump);
 g.add(ugAt(ugMesh(new THREE.CircleGeometry(.17,24),'split'),0,0,0,0,Math.PI));
 if(kind=='trilobite'){const b=ugMesh(new THREE.SphereGeometry(1,16,10),'fossil');b.scale.set(.06,.1,.02);g.add(b);const ax=ugMesh(new THREE.SphereGeometry(1,12,8),'fossil');ax.scale.set(.018,.095,.03);g.add(ax);
  for(let i=0;i<8;i++){const yy=-.07+i*.018,f=Math.sqrt(Math.max(0,1-(yy/.1)**2)),r=ugMesh(new THREE.SphereGeometry(1,14,6),'fossil');r.scale.set(.062*f,.005,.022*f+.002);r.position.y=yy;g.add(r)}
  const hd=ugMesh(new THREE.SphereGeometry(1,14,8),'fossil');hd.scale.set(.065,.035,.022);hd.position.set(0,.085,0);g.add(hd)}
 else{const pts=[];for(let a=0;a<5.2*Math.PI;a+=.2){const r=.01+a*.0078;pts.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,0))}const sp=ugMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),90,.011,6),'fossil');sp.scale.z=.7;g.add(sp)}
 g.userData.pick='fossil';g.userData.fossil=kind||'ammonite';return g}

/* the old miners' notes (one in each lunchbox; the game picks one by the seed) */
const UGNOTES=[
 'Shift 14. The cage stuck between levels again. Forty minutes in the dark with Old Harlan humming. Never again.',
 'Whoever keeps taking my good pick: I know it is you, Teddy.',
 'Found gold on the far side of the sinkhole. Could not reach it. Maybe the next fool will.',
 'The pumps on level 2 thump all night. Sometimes they thump back.',
 'Foreman says the old shaft is sealed. Then why is there a door in it, and why is it numbered 60?',
 'Three sticks, four second fuse, run. That is the whole lesson.',
 'Tag 17 is back on the lamp room board again. Harlan has been gone a year. Who keeps hanging it up?',
 'If the air goes yellow, walk out. Do not run, do not breathe deep. Walk.',
 'The crystals in the round room hum when you put your ear to them. Bill says it is the rock settling. Bill is wrong.',
 'Lunch: two eggs, bread, the last of the cheese. Do not touch it, Teddy.',
 'Rockfall by the pillar again. Went round the other side. Always go round the other side.',
 'They are sinking the shaft to the deep level. Hot down there. Bring water. Bring more water than that.',
 'The bats left all at once today. The whole roost. We came up early.',
 'Marked my best seam with a cross on the map board. Somebody rubbed it out.',
 'Fossil the size of a cart on level 2. The assay office pays well for the small ones.',
 'Last shift. Leaving my lunchbox for whoever finds it. Eat the biscuits, they keep.'];
/* the Shaft sinking upgrade (for the tycoon's list) */
const UGSINK={id:'sink',icon:'🕳️',nm:'Shaft sinking',ds:'Opens the cage gate on the deeper levels.',levels:[{nm:'Level 1 only',cost:0},{nm:'Stops at level 2',cost:300},{nm:'Stops at level 3',cost:900}]};

/* ---------- the level map (board and minimap) ---------- */
/* draws one level's pieces. o: {w, h (px), pad, top (px kept for the title), scale (px per m), cx, cz (centre, m),
   here:[x, z] (a red dot), seen (Set of piece ids: only those are drawn), colours fill/ink/cage/link} */
function ugMapDraw(k,plan,L,o){o=o||{};const W=o.w||640,H=o.h||440,pad=o.pad==null?28:o.pad,top=o.top==null?44:o.top;
 const P=plan.P.filter(p=>p.L==L||(p.d.both&&p.type=='ladder'&&p.L+1==L));
 let cx=o.cx,cz=o.cz,sc=o.scale;if(sc==null){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of P)for(const s of ugWorld(p).shp){const pts=s.k=='path'?s.pts:s.k=='rect'?[[s.x0,s.z0],[s.x1,s.z1]]:s.k=='blob'?[[s.cx-s.rx,s.cz-s.rz],[s.cx+s.rx,s.cz+s.rz]]:[];for(const q of pts){x0=Math.min(x0,q[0]-3);x1=Math.max(x1,q[0]+3);z0=Math.min(z0,q[1]-3);z1=Math.max(z1,q[1]+3)}}
  sc=Math.min((W-2*pad)/(x1-x0),(H-top-pad)/(z1-z0));cx=(x0+x1)/2;cz=(z0+z1)/2}
 const X=x=>W/2+(x-cx)*sc,Z=z=>top+(H-top-pad)/2+(z-cz)*sc,fill=o.fill||'#6a5236';
 k.lineCap='round';k.lineJoin='round';k.fillStyle=k.strokeStyle=fill;
 const draw=s=>{if(s.k=='path'){k.lineWidth=Math.max(2,(s.w||4)*sc);k.beginPath();s.pts.forEach((q,i)=>i?k.lineTo(X(q[0]),Z(q[1])):k.moveTo(X(q[0]),Z(q[1])));k.stroke()}
  else if(s.k=='rect')k.fillRect(X(s.x0),Z(s.z0),(s.x1-s.x0)*sc,(s.z1-s.z0)*sc);
  else if(s.k=='blob'){k.beginPath();k.ellipse(X(s.cx),Z(s.cz),s.rx*sc,s.rz*sc,0,0,7);k.fill()}};
 for(const p of P){if(o.seen&&!o.seen.has(p.id))continue;ugWorld(p).shp.forEach(draw)}
 /* the shaft, and the ways up and down */
 const f=Math.max(11,sc*4.5|0)+'px "Barlow Semi Condensed",DoorsSans,Arial';
 for(const p of P){if(o.seen&&!o.seen.has(p.id))continue;
  if(p.st){k.fillStyle=o.cage||'#c8a040';k.fillRect(X(p.x-1.6),Z(p.z-1.6),3.2*sc,3.2*sc);k.strokeStyle=o.ink||'#3a2a18';k.lineWidth=1.5;k.strokeRect(X(p.x-1.6),Z(p.z-1.6),3.2*sc,3.2*sc)}
  if(p.type=='ladder'||p.type=='decline'){k.fillStyle=o.link||'#1e5a8a';k.font='700 '+f;k.textAlign='center';k.textBaseline='middle';k.fillText(p.L==L?'▼':'▲',X(p.x),Z(p.z))}}
 if(o.here){k.fillStyle='#c0201a';k.beginPath();k.arc(X(o.here[0]),Z(o.here[1]),Math.max(5,sc*1.3),0,7);k.fill();k.strokeStyle='#fff';k.lineWidth=1.5;k.stroke()}
 return{X,Z,sc}}
/* the map board on a station wall: aged paper, a grid, the level's pieces, the cage, YOU ARE HERE, a scale.
   o: {here:[x, z], ar (width / height of the board, 1.45 by default)} */
function ugMapTex(plan,L,o){o=o||{};const lv=UGL[L],H=440,W=Math.round(H*(o.ar||1.4545));return ugCanvas(W,H,(k,w,h)=>{const r=ugRng(321+L);
 k.fillStyle='#e4d4ae';k.fillRect(0,0,w,h);for(let i=0;i<1500;i++){k.fillStyle='rgba(90,70,40,'+(r()*.08)+')';k.fillRect(r()*w,r()*h,2+r()*6,1+r()*3)}
 k.strokeStyle='rgba(90,70,40,.16)';k.lineWidth=1;for(let x=10;x<w;x+=20){k.beginPath();k.moveTo(x,40);k.lineTo(x,h-8);k.stroke()}for(let y=40;y<h-8;y+=20){k.beginPath();k.moveTo(8,y);k.lineTo(w-8,y);k.stroke()}
 const m=ugMapDraw(k,plan,L,Object.assign({w,h},o));
 k.fillStyle='#3a2a18';k.font='700 28px "Barlow Semi Condensed",DoorsSans,Arial';k.textAlign='left';k.textBaseline='alphabetic';k.fillText('LEVEL '+lv.n+' · '+lv.nm.toUpperCase(),16,31);
 k.font='600 15px "Barlow Semi Condensed",DoorsSans,Arial';k.textAlign='center';k.fillText('▼ way down    ▲ way up    ■ cage    ● you are here',w/2,h-9);
 k.strokeStyle='#3a2a18';k.lineWidth=2;k.beginPath();k.moveTo(16,h-14);k.lineTo(16+10*m.sc,h-14);k.moveTo(16,h-19);k.lineTo(16,h-9);k.moveTo(16+10*m.sc,h-19);k.lineTo(16+10*m.sc,h-9);k.stroke();k.textAlign='left';k.font='600 13px "Barlow Semi Condensed",DoorsSans,Arial';k.fillText('10 m',22+10*m.sc,h-9);
 /* north arrow (up the board = -z) */
 k.save();k.translate(w-26,h-34);k.fillStyle='#3a2a18';k.beginPath();k.moveTo(0,-14);k.lineTo(7,8);k.lineTo(0,3);k.lineTo(-7,8);k.closePath();k.fill();k.font='700 13px "Barlow Semi Condensed",DoorsSans,Arial';k.textAlign='center';k.fillText('N',0,22);k.restore();
 k.strokeStyle='rgba(60,40,20,.55)';k.lineWidth=5;k.strokeRect(2.5,2.5,w-5,h-5)})}
/* the minimap underground: dark, only the pieces you have been in, the cage, ways up and down, your friends (dots)
   and you (an arrow), and the level's name along the top.
   o: {w, h, me:{x, z, yaw}, friends:[{x, z, c}], seen (Set of piece ids), scale (px per m, 1.6 by default)} */
function ugMiniDraw(k,plan,L,o){const W=o.w||200,H=o.h||200,lv=UGL[L],me=o.me||{x:0,z:0,yaw:0};k.save();k.fillStyle='#0e0a08';k.fillRect(0,0,W,H);
 const m=ugMapDraw(k,plan,L,{w:W,h:H,pad:0,top:0,scale:o.scale||1.6,cx:me.x,cz:me.z,seen:o.seen,fill:'#8a7458',ink:'#e6d6b2',cage:'#c8a040',link:'#7ab8e8'});
 for(const f of o.friends||[]){k.fillStyle=f.c||'#4ad0ff';k.beginPath();k.arc(m.X(f.x),m.Z(f.z),4.5,0,7);k.fill();k.strokeStyle='#000';k.lineWidth=1;k.stroke()}
 k.translate(m.X(me.x),m.Z(me.z));k.rotate(-me.yaw);k.fillStyle='#fff';k.strokeStyle='#000';k.lineWidth=1.5;k.beginPath();k.moveTo(0,-8);k.lineTo(6,7);k.lineTo(0,3);k.lineTo(-6,7);k.closePath();k.fill();k.stroke();k.setTransform(1,0,0,1,0,0);
 k.fillStyle='rgba(0,0,0,.65)';k.fillRect(0,0,W,22);k.fillStyle='#f0e0c0';k.font='700 14px "Barlow Semi Condensed",DoorsSans,Arial';k.textAlign='center';k.textBaseline='middle';k.fillText('LEVEL '+lv.n+' · '+lv.nm.toUpperCase(),W/2,12);k.restore()}

/* ---------- the cage panel ---------- */
/* a steel panel with a lamp and a button for each level. set(open, here): open = how many levels the cage may stop
   at (Shaft sinking: 1-3), here = the level the cage is at (1-3). A locked level says SHAFT SINKING NEEDED.
   The face is the group's +z; 0.42 x 0.7 m, 5 cm thick */
function ugCagePanel(){const g=new THREE.Group(),c=document.createElement('canvas');c.width=192;c.height=320;const t=new THREE.CanvasTexture(c);
 g.add(ugMesh(new THREE.BoxGeometry(.42,.7,.05),'dark'));g.add(ugAt(ugMesh(new THREE.PlaneGeometry(.38,.64),new THREE.MeshStandardMaterial({map:t,roughness:.6,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.35})),0,0,.03));
 for(const [x,y] of[[-.19,.33],[.19,.33],[-.19,-.33],[.19,-.33]])g.add(ugAt(ugMesh(new THREE.CylinderGeometry(.008,.008,.012,8),'steel'),x,y,.035,Math.PI/2));
 const F=s=>'700 '+s+'px "Barlow Semi Condensed",DoorsSans,Arial';
 g.userData.set=(open,here)=>{const k=c.getContext('2d');k.fillStyle='#3a3c40';k.fillRect(0,0,192,320);k.fillStyle='#f0d040';k.fillRect(0,0,192,36);k.fillStyle='#1a1a1a';k.font=F(24);k.textAlign='center';k.textBaseline='middle';k.fillText('CAGE',96,19);
  for(let i=0;i<3;i++){const y=50+i*90,ok=i<open,at=i+1==here;k.fillStyle=at?'#fff4c0':ok?'#3ad060':'#c02a20';k.beginPath();k.arc(36,y+24,11,0,7);k.fill();k.fillStyle=ok?'#d8d8d8':'#7a7a7a';k.beginPath();k.arc(104,y+24,22,0,7);k.fill();k.fillStyle='#1a1a1a';k.font=F(28);k.fillText(String(i+1),104,y+25);
   k.fillStyle=ok?'#e0e0e0':'#ff8a70';k.font=F(ok?16:14);k.fillText(ok?['OLD WORKINGS','THE CAVES','THE DEEP'][i]:'SHAFT SINKING NEEDED',96,y+64)}t.needsUpdate=true};
 g.userData.set(1,1);return g}

/* ---------- level 2: one or two fossils in the cave walls ---------- */
/* each takes the place of a vein (veins already sit on the real rock), so it is set in the wall the same way */
{const b0=ugBuildLevel;ugBuildLevel=function(plan,L,opt){const res=b0(plan,L,opt);if(L!=1)return res;
 const R=ugRng((plan.seed||1)*31+7),vs=res.g.children.filter(o=>o.userData.vein&&o.userData.vein!='cr'&&o.userData.vein!='dm');const n=vs.length?1+(R()<.5?1:0):0;
 for(let i=0;i<n&&vs.length;i++){const v=vs.splice(R()*vs.length|0,1)[0],f=ugFossil(R()<.6?'ammonite':'trilobite');f.position.copy(v.position);f.rotation.copy(v.rotation);res.g.remove(v);
  const k=res.veins.findIndex(q=>Math.abs(q.x-v.position.x)<1e-6&&Math.abs(q.z-v.position.z)<1e-6);if(k>=0)res.veins.splice(k,1);res.g.add(f);res.pickups.push(f)}
 return res}}

