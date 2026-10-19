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
 stope:{nm:'Stope',cat:'room',lv:[1],w:3,mx:3,want:1,mk(R){const ex=R()<.6?[[0,-18,0]]:[];return{foot:[[-7,7,-18,0]],ex,shp:[{k:'path',pts:[[0,0],[0,-2]],w:4},{k:'rect',x0:-7,x1:7,z0:-18,z1:-2,rough:1}],fx:[{k:'cribs',pts:[[-3.5,-6],[3.5,-6],[-3.5,-12],[3.5,-12],[0,-15]]},{k:'ore',n:7},{k:'icon',x:0,z:-9,t:'⛏️'}]}}},
 crib:{nm:'Crib room',cat:'end',lv:[1],w:2,mx:1,want:1,mk(){return{foot:[[-4,4,-10,0]],ex:[],shp:[{k:'path',pts:[[0,0],[0,-2]],w:2.4},{k:'rect',x0:-4,x1:4,z0:-10,z1:-2}],fx:[{k:'icon',x:0,z:-6,t:'🥪'}]}}},
 magazine:{nm:'Powder magazine',cat:'end',lv:[1],w:2,mx:1,want:1,mk(){return{foot:[[-3,3,-9,0]],ex:[],shp:[{k:'path',pts:[[0,0],[0,-3]],w:2},{k:'rect',x0:-3,x1:3,z0:-9,z1:-3}],fx:[{k:'door',x:0,z:-3},{k:'icon',x:0,z:-6,t:'🧨'}]}}},
 collapsed:{nm:'Collapsed drift',cat:'tun',lv:[1],w:1.5,mx:2,mk(){return{foot:[[-2,2,-12,0]],ex:[[0,-12,0]],shp:[{k:'path',pts:[[0,0],[0,-12]],w:4}],fx:[{k:'sets',pts:[[0,0],[0,-12]],broken:1},{k:'rubble',x:.9,z:-6}]}}},
 pump:{nm:'Pump room',cat:'room',lv:[1],w:1.5,mx:1,mk(){return{foot:[[-5,5,-10,0]],ex:[[0,-10,0]],shp:[{k:'rect',x0:-5,x1:5,z0:-10,z1:0}],fx:[{k:'water',cx:-2,cz:-5,rx:2.4,rz:3.4},{k:'icon',x:2.2,z:-5,t:'🛢️'}]}}},
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
 hall:{nm:'Stalactite hall',cat:'room',lv:[2],w:2,mx:1,mk(R){return{foot:[[-10,10,-20,0]],ex:[[0,-20,0]].concat(R()<.5?[[10,-10,1]]:[]),shp:[{k:'blob',cx:0,cz:-10,rx:10,rz:10}],fx:[{k:'cols',pts:[[-4,-6],[3.6,-5],[-2,-13],[4.5,-13.5],[0,-10]]},{k:'icon',x:-5,z:-10,t:'🪨'}]}}},
 stream:{nm:'Stream crossing',cat:'tun',lv:[2],w:1.5,mx:2,mk(){return{foot:[[-3,3,-12,0]],ex:[[0,-12,0]],shp:[{k:'path',pts:[[0,0],[.8,-6],[0,-12]],w:4.6,org:1}],fx:[{k:'stream',pts:[[-3,-5],[3,-7]]},{k:'stones',pts:[[-.2,-5.4],[.8,-6],[1.6,-6.6]]}]}}},
 orepass:{nm:'Ore pass',cat:'end',lv:[2,3],w:1.5,mx:1,mk(){return{foot:[[-3,3,-8,0]],ex:[],shp:[{k:'path',pts:[[0,0],[0,-2]],w:3},{k:'rect',x0:-3,x1:3,z0:-8,z1:-2}],fx:[{k:'grate',x:0,z:-5.4},{k:'icon',x:0,z:-5.4,t:'⬇️'}]}}},
 /* ----- Level 3: The Deep ----- */
 magma:{nm:'Magma chamber',cat:'room',lv:[3],w:3,mx:2,want:1,mk(R){return{foot:[[-12,12,-24,0]],ex:[[0,-24,0]].concat(R()<.5?[[12,-12,1]]:[]),shp:[{k:'blob',cx:0,cz:-12,rx:12,rz:12}],fx:[{k:'lava',pts:[[-11,-15],[-4,-13],[3,-14.4],[11,-12.6]],w:1.4},{k:'bridge',x0:0,z0:-11.6,x1:0,z1:-16},{k:'lake',cx:4.6,cz:-6.6,rx:3.8,rz:2.2},{k:'icon',x:4.6,z:-6.6,t:'💠'},{k:'gey',x:-6,z:-7},{k:'cols',pts:[[-8,-18],[-6.6,-19.4],[7,-19]],c:'#2a2422'}]}}},
 dark:{nm:'Dark cave',cat:'room',lv:[3],w:2,mx:1,want:1,mk(){return{foot:[[-9,9,-18,0]],ex:[[0,-18,0]],shp:[{k:'blob',cx:0,cz:-9,rx:9,rz:9,dark:1}],fx:[{k:'chasm',pts:[[-9,-10],[-3,-8.6],[3,-9.8],[9,-8.4]],w:2.6},{k:'bridge',x0:-.4,z0:-7.4,x1:-.4,z1:-11.2},{k:'glow',n:18,rx:8,rz:8,cz:-9},{k:'icon',x:-5,z:-13,t:'🔦'}]}}},
 geode:{nm:'The Geode',cat:'end',lv:[3],w:2,mx:1,want:1,mk(){return{foot:[[-6,6,-15,0]],ex:[],shp:[{k:'path',pts:[[0,0],[0,-3.4]],w:2.4,org:1},{k:'blob',cx:0,cz:-9,rx:6,rz:6,geo:1}],fx:[{k:'ring',cx:0,cz:-9,r:5.2},{k:'icon',x:0,z:-9,t:'💜'}]}}},
 hotseam:{nm:'Hot seam',cat:'end',lv:[3],w:1.5,mx:1,mk(){return{foot:[[-3,3,-9,0]],ex:[],shp:[{k:'path',pts:[[0,0],[0,-3]],w:2.6,org:1},{k:'blob',cx:0,cz:-6,rx:3,rz:3}],fx:[{k:'spots',n:6,c:'#9cff5a',rx:2,rz:2,cz:-6},{k:'icon',x:0,z:-6,t:'☢️'}]}}},
 basalt:{nm:'Basalt gallery',cat:'tun',lv:[3],w:2,mx:2,mk(R){const p=ugWig(R,16,.8);return{foot:[[-3,3,-16,0]],ex:[[0,-16,0]],shp:[{k:'path',pts:p,w:5,org:1}],fx:[{k:'cols',pts:[[-2,-4],[2,-8],[-2.2,-12]],c:'#2a2422',r:.7},{k:'cracks',pts:p}]}}},
 /* ----- links between levels ----- */
 decline:{nm:'Spiral decline',cat:'link',lv:[1,2],w:0,mx:2,mk(){const c=ugArc(6,-8,6,Math.PI,4*Math.PI,36);return{foot:[[-2,14,-16,0]],both:1,ex:[[12,0,2,1]],shp:[{k:'path',pts:[[0,0],[0,-8]],w:4},{k:'path',pts:c,w:4},{k:'path',pts:[[12,-8],[12,0]],w:4}],fx:[{k:'spiral',cx:6,cz:-8},{k:'icon',x:6,z:-8,t:'↘️'}]}}},
 ladder:{nm:'Ladderway',cat:'link',lv:[1,2],w:0,mx:3,mk(){return{foot:[[-2,2,-8,0]],both:1,ex:[[0,-8,0,1]],shp:[{k:'path',pts:[[0,0],[0,-8]],w:3.2}],fx:[{k:'hatch',x:0,z:-4},{k:'icon',x:0,z:-4,t:'🪜'}]}}},
 old:{nm:'Old shaft (1 in 100)',cat:'end',lv:[3],w:0,mx:1,mk(){return{foot:[],ex:[],shp:[],fx:[{k:'portal',x:0,z:0},{k:'icon',x:0,z:-2.2,t:'🚪'}]}}}
};
/* ---- VARIANTS: the main rooms come in several versions, so mines don't repeat. Each variant keeps its room's size and
   exits and changes what's inside (and how it plays). fx(d,R) rewrites the features; the first is the room as above.
   A mine uses a different variant each time the same room comes up, while there are unused ones. ---- */
const UGV={
 stope:[
  {nm:'Cribbed stope',ds:'Timber cribs hold up the roof over rough rock benches. Lots of veins, often a big seam.'},
  {nm:'Shrinkage stope',ds:'A tall stope half full of broken ore. Climb the timber ladder to a high ledge with rich veins.',fx:()=>[{k:'muck',cx:1.5,cz:-10,rx:4.4,rz:6},{k:'ledge',x0:-7,x1:-3.6,z0:-16,z1:-4},{k:'ladder2',x:-3.2,z:-10},{k:'icon',x:-5.3,z:-10,t:'🪜'}]},
  {nm:'Glory hole',ds:'A raise up to the quarry floor lets a shaft of daylight in. Dust in the light, veins round the walls.',fx:()=>[{k:'sun',cx:0,cz:-10,r:3.2},{k:'cribs',pts:[[-4.5,-5],[4.5,-5],[-4.5,-15],[4.5,-15]]},{k:'icon',x:0,z:-10,t:'☀️'}]},
  {nm:'Flooded stope',ds:'The bottom is under still water. A plank walkway runs along one side; veins above the waterline.',fx:()=>[{k:'water',cx:1.6,cz:-10,rx:5,rz:7.2},{k:'walk',pts:[[-5.6,-2.4],[-5.6,-17.4]]},{k:'icon',x:1.6,z:-10,t:'💧'}]}],
 crib:[
  {nm:'Crib room',ds:'The miners\' break room: benches, a table with lunch tins, a stove. A lunchbox to find.'},
  {nm:'Lamp room',ds:'Racks of old cap lamps on chargers and a board of brass tags. One tag has a name you\'ll know.',fx:()=>[{k:'racks',pts:[[-3.2,-4],[-3.2,-6],[-3.2,-8],[3.2,-4],[3.2,-6]]},{k:'icon',x:0,z:-6,t:'🔦'}]},
  {nm:'Foreman\'s office',ds:'A desk, a safe, maps on the walls and the foreman\'s logbook (lore). The safe holds a shift bonus.',fx:()=>[{k:'desk',x:1.4,z:-7.6},{k:'icon',x:-2,z:-5,t:'🗄️'}]}],
 pump:[
  {nm:'Pump room',ds:'An old pump over a flooded sump.'},
  {nm:'Winder room',ds:'The big drum and brake of an old winze hoist, cables running into a hole in the floor (fenced off).',fx:()=>[{k:'drum',x:-1.4,z:-5},{k:'pit',cx:2.8,cz:-5,rx:1.4,rz:1.4},{k:'icon',x:-1.4,z:-5,t:'⚙️'}]},
  {nm:'Mine workshop',ds:'A forge, an anvil, a drill press, broken carts waiting for repair.',fx:()=>[{k:'desk',x:-3,z:-3.2},{k:'desk',x:3,z:-7},{k:'icon',x:0,z:-5,t:'🔨'}]}],
 crystal:[
  {nm:'Crystal grotto',ds:'Glowing crystal clusters, silver and crystal veins.'},
  {nm:'Crystal pool',ds:'A still, glowing pool ringed with crystals. The rarest crystals grow under the water\'s edge.',fx:()=>[{k:'water',cx:0,cz:-10,rx:4,rz:5,c:'#38c8f0'},{k:'ringspots',cx:0,cz:-10,rx:5.2,rz:6.2,n:20,c:'#9ff0ff'},{k:'icon',x:0,z:-10,t:'💎'}]},
  {nm:'Selenite beams',ds:'Giant crystal beams cross the cave at all angles: duck under some, climb over others.',fx:()=>[{k:'beams',ls:[[[-7,-5],[6,-14]],[[-6,-15.5],[7,-7]],[[-2.5,-3],[2.5,-17.5]]]},{k:'icon',x:-4,z:-10,t:'💎'}]}],
 fungus:[
  {nm:'Fungus grotto',ds:'Giant mushrooms, moss, vines and glowworms.'},
  {nm:'Puffball hollow',ds:'Puffballs as big as cars. Hit one and it bursts in a cloud of glowing spores (harmless, slow to clear).',fx:()=>[{k:'puff',pts:[[-5,-6],[4.5,-5],[-3,-14],[5,-14.5],[0,-10]]},{k:'icon',x:-5,z:-10,t:'🍄'}]},
  {nm:'Glow pond',ds:'A dark pond lit from below, lily pads, mushrooms round the edge, frogs that go quiet when you come close.',fx:()=>[{k:'water',cx:1.5,cz:-11,rx:5.4,rz:4.6,c:'#2fb8a0'},{k:'spots',n:9,c:'#5fbf6a',rx:4,rz:3,cz:-11,r:.7,dx:1.5},{k:'ringspots',cx:1.5,cz:-11,rx:7,rz:6.2,n:14,c:'#e58ae0'},{k:'icon',x:1.5,z:-11,t:'🐸'}]}],
 flooded:[
  {nm:'Flooded gallery',ds:'Knee-deep water you wade through, a plank walkway along one side.'},
  {nm:'Underground lake',ds:'Too deep to wade. Pull the rope raft across (hold E); it takes up to four.',fx:()=>[{k:'water',cx:0,cz:-12,rx:4.6,rz:9.4,c:'#2f6f98'},{k:'rope',pts:[[0,-1.6],[0,-22.4]]},{k:'raft',x:0,z:-5},{k:'icon',x:2.4,z:-14,t:'🛶'}]},
  {nm:'Drowned drift',ds:'An old timbered drive the water took: rails under the surface, a sunken minecart, waist-deep in the middle.',fx:()=>[{k:'water',cx:0,cz:-12,rx:4.4,rz:10.6},{k:'sets',pts:[[0,-1],[0,-23]]},{k:'rail',pts:[[0,-1],[0,-23]]},{k:'icon',x:1.6,z:-13,t:'🛒'}]}],
 chasm:[
  {nm:'Chasm hall',ds:'A rope bridge over a fissure, or jump the stones.'},
  {nm:'Broken bridge',ds:'The bridge has fallen. Edge round the end of the fissure on a narrow ledge, or make a long jump.',fx:()=>[{k:'chasm',pts:[[-5.4,-9.4],[-2,-10.5],[3,-9.4],[7,-10.6]],w:3},{k:'bridge',x0:0,z0:-7.6,x1:0,z1:-8.8},{k:'bridge',x0:0,z0:-11.2,x1:0,z1:-12.4},{k:'ledge2',pts:[[-4.6,-6.4],[-6.2,-9.6],[-4.8,-13]]}]},
  {nm:'Trestle crossing',ds:'A wide fissure crossed by the miners\' old timber trestle, rails and all. It creaks.',fx:()=>[{k:'chasm',pts:[[-7,-9.6],[-2,-10.6],[3,-9.2],[7,-10.4]],w:5},{k:'trestle',x0:0,z0:-6.4,x1:0,z1:-13.6}]}],
 hall:[
  {nm:'Stalactite hall',ds:'Columns, flowstone and stalactites, a path between them.'},
  {nm:'Rimstone terraces',ds:'Stepped pools of still water down the cave, each one rimmed with stone. Walk the rims.',fx:()=>[{k:'terraces',cx:0,cz:-10,n:4,rx:8,rz:8}]},
  {nm:'Cathedral',ds:'A huge, tall dome round one giant column. Your lamp doesn\'t reach the roof.',fx:()=>[{k:'cols',pts:[[0,-10]],r:3.2},{k:'cols',pts:[[-6,-5],[6.5,-14],[-6.4,-15],[6,-5.5]],r:.6},{k:'icon',x:-5,z:-10,t:'⛪'}]}],
 magma:[
  {nm:'Magma chamber',ds:'A lava river with a stone bridge, geysers, a lava lake with stepping stones to a diamond island.'},
  {nm:'Lavafall',ds:'Lava pours down one wall into a glowing pool. A basalt shelf runs round it; gold in the hot wall.',fx:()=>[{k:'falls',x:-11,z:-12,w:6},{k:'lake',cx:-7,cz:-12,rx:3.4,rz:4.6,noisle:1},{k:'ledge',x0:-11,x1:-7.6,z0:-19,z1:-17},{k:'gey',x:4,z:-6},{k:'gey',x:5,z:-17},{k:'cols',pts:[[8,-10],[9,-12],[8.4,-14]],c:'#2a2422'},{k:'icon',x:-9,z:-12,t:'🌋'}]},
  {nm:'Crust field',ds:'A floor of cooled crust over live lava. Dark patches are safe; glowing ones burn (you\'re pushed off and drop ore).',fx:()=>[{k:'crust',cx:0,cz:-12,rx:9.6,rz:9.6},{k:'icon',x:0,z:-12,t:'🔥'}]},
  {nm:'Obsidian moat',ds:'A ring of lava round an island of black glass. One stone bridge; diamond and gold on the island.',fx:()=>[{k:'moat',cx:0,cz:-12,r:6.4,w:1.8},{k:'isle2',cx:0,cz:-12,r:5.4},{k:'bridge',x0:0,z0:-4.2,x1:0,z1:-7.4},{k:'icon',x:0,z:-12,t:'💠'}]}],
 dark:[
  {nm:'Dark cave',ds:'Pitch black without the LED headlamp. A chasm and glowworms.'},
  {nm:'Sinkhole',ds:'A round, bottomless shaft in the middle of the cave. The path goes round the rim; the best veins are on the far side.',fx:()=>[{k:'pit',cx:0,cz:-9,rx:4.4,rz:4.4},{k:'glow',n:14,rx:8,rz:8,cz:-9},{k:'icon',x:-6.4,z:-9,t:'🔦'}]},
  {nm:'Glowworm grotto',ds:'Still black water and a roof full of glowworms. A narrow path round the edge; turn your lamp off to see it.',fx:()=>[{k:'water',cx:.6,cz:-9,rx:6.2,rz:6.4,c:'#16303c'},{k:'glow',n:46,rx:8,rz:8,cz:-9},{k:'icon',x:-6.8,z:-9,t:'✨'}]},
  {nm:'The maze',ds:'A forest of rock pillars. Easy to lose your way: the signposts don\'t reach in here.',fx:()=>{const p=[];for(let i=-2;i<=2;i++)for(let j=0;j<4;j++)if((i+j)%2==0||i==0&&j==2)p.push([i*3.2,-3.6-j*3.4]);return[{k:'cols',pts:p,r:.95,c:'#4a4440'},{k:'icon',x:-6.6,z:-15,t:'🔦'}]}}],
 geode:[
  {nm:'Amethyst geode',ds:'A round room lined with giant purple crystals. Gems.'},
  {nm:'Celestine geode',ds:'Pale blue crystals and a hum you feel more than hear. Gems.',fx:()=>[{k:'ring',cx:0,cz:-9,r:5.2,c:'#4f8ad0',c2:'#bcd8ff'},{k:'icon',x:0,z:-9,t:'💙'}]},
  {nm:'Citrine geode',ds:'Golden crystals, and gold in the rock between them. Gems.',fx:()=>[{k:'ring',cx:0,cz:-9,r:5.2,c:'#c89020',c2:'#ffe08a'},{k:'icon',x:0,z:-9,t:'💛'}]}],
 hotseam:[
  {nm:'Hot seam',ds:'Glowing green rock, uranium, Geiger clicks.'},
  {nm:'Green spring',ds:'A steaming pool tinted green by the rock round it. Uranium in the walls, and the clicks get fast.',fx:()=>[{k:'water',cx:0,cz:-6,rx:2,rz:2,c:'#6ad04a'},{k:'icon',x:0,z:-6,t:'☢️'}]}]
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
 return{foot:[[-h,h,-h,h]],ex,shp:[{k:'rect',x0:-h,x1:h,z0:-h,z1:h}],fx:[{k:'shaft'},{k:'icon',x:n==1?-4.4:-2.8,z:n==1?4.4:2.8,t:n==1?'🛗':'🛗'}]};
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
if(typeof module!='undefined')module.exports={UGL,UGP,UGV,UGB,ugGen,ugWorld,ugRot,ugRng};
