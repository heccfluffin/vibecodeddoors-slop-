/* =====================================================================================================
   r606: A BATCH OF DESERT FIXES.
   - FORT BLACKOUT ON THE MAP: most of the base's buildings never made it onto the map. Now every building is drawn
     from its actual walls (wall pieces that touch are one building, filled in), so the map matches what is there,
     including the parts that are built later (the command wing, the bays, the motor pool). Coloured by kind,
     and the main buildings get names when you zoom the big map in.
   - SPEEDWAY: the tyre walls were invisible (three.js only drew them when the middle of the map was on screen, and the
     scenery chunks only showed them near the bus stop), so you hit "nothing". Every instanced mesh is fixed.
   - THE DRAGSTER: bigger front wheels on a real front axle, so they no longer hang in the air.
   - AI CARS no longer wreck themselves on walls and corners (the police car that blew up on its own). You can
     still wreck them yourself.
   - DEVIL'S GORGE: falling in is a real fall: you keep your speed, no spinning, and you land where you fall.
     Driving in: the car falls all the way, crashes at the bottom and you are thrown out down there.
     The old lift only goes up now.
   - THE MINING SHACK moved off the road (west of it, door facing the road, a dirt path to it). Walking in no
     longer starts the cutscene: press E at the door.
   ===================================================================================================== */
/* r660: the base map (every building drawn from its walls) and the base names on the big map moved to dx645, which
   does the same for every named area of the desert (docs/design/desert-map.md). MAPBN stays here: it is the list of
   the base's building names (dx645 shows them). */
/* names of the base's buildings, shown on the big map zoomed in and on the minimap */
const MAPBN=[/* r616: the reworked Fort Blackout (docs/design/fort-blackout.md) */['HQ',360,-860],['Command Wing',450,-853],['Wraith Bays',450,-835],['Motor Pool',524,-909],['Parade Ground',516,-845],['Barracks',388,-912],['Latrines',474,-916],['Recruiting',586,-910],['Mess Hall',582,-892],['LZ Bravo',582,-848],['Boot Camp',364,-812],['Depot',350,-782],['Tank Park',470,-780],['Range',556,-765],['Hangar 1',375,-694],['Launch Control',527,-701],['Silo 1',578,-700],['Radar',442,-700],['Air Ops',325,-949],['Fuel Farm',373,-950],['Shelters',448,-946],['Tower',545,-944],['Runway 09',385,-980],['Power Plant',245,-911],['Water',280,-911],['Heliport West',250,-846],['PX',241,-759],['Armoury',257,-694],['Main gate',561,-930]];

/* ---------- instanced meshes (the Speedway tyre walls and others): always drawn, never filed under a far chunk ---------- */
function imFix(q){if(q.imFix||!q.chunks)return;q.imFix=1;const L=[];q.g.traverse(o=>{if(o.isInstancedMesh)L.push(o)});for(const o of L){o.frustumCulled=false;o.userData.noChunk=1;let p=o.parent,inChunk=false;while(p&&p!==q.g){if(p.userData&&p.userData.chunk)inChunk=true;p=p.parent}if(inChunk){o.updateMatrixWorld(true);q.g.attach(o)}}}
{const ru7=busRoamUpd;busRoamUpd=function(q,dt){const r=ru7.apply(this,arguments);try{if(q)imFix(q)}catch(e){conLog('error','instanced: '+e.message)}return r}}

/* ---------- the dragster: front wheels of 0.3 m on a front axle ---------- */
{const mv6=mkVehModel;mkVehModel=function(k){const m=mv6.apply(this,arguments);try{if(k=='dragster'){for(const w of m.userData.wheels||[])if(w.front){w.p.scale.set(1,1.5,1.5);w.p.position.y=.3}
  const ax=new THREE.Mesh(new THREE.BoxGeometry(1.42,.1,.1),VMAT(0x1a1a1a,{metalness:.5}));ax.position.set(0,.3,-3.6);m.add(ax);for(const sd of[-1,1]){const st=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,1.2),VMAT(0x1a1a1a,{metalness:.5}));st.position.set(sd*.25,.36,-3.05);st.rotation.y=sd*.35;m.add(st)}}}catch(e){}return m}}

/* ---------- AI drivers do not wreck themselves on scenery (rams and gunfire from you still count) ---------- */
let AISELF=null;
{const vp6=vehPhys;vehPhys=function(q,v){const ai=v&&!(q.seat&&q.seat.v===v)&&!(q.inBus&&q.inBus.v===v)&&(v.npc||v.k=='cop'||(q.cop&&q.cop.v===v));if(!ai)return vp6.apply(this,arguments);const p=AISELF;AISELF=v;try{return vp6.apply(this,arguments)}finally{AISELF=p}}}
{const vd6=vehDamage;vehDamage=function(q,v,n){if(AISELF&&v===AISELF)return;return vd6.apply(this,arguments)}}

/* ---------- Devil's Gorge: a real fall ---------- */
/* how fast you were walking (so you keep going over the edge) */
{const ru8=busRoamUpd;busRoamUpd=function(q,dt){const px=P.x,pz=P.z;const r=ru8.apply(this,arguments);try{if(q&&dt>0&&!q.fling){q.pvx=(P.x-px)/dt;q.pvz=(P.z-pz)/dt}
  /* thrown into the gorge (a crash, a blast): you land down there */const f=q&&q.fling;if(f&&!f.gorge&&!q.deep&&gorgeAt(P.x,P.z-q.OZ)){f.gorge=1;f.noRoll=1}if(f&&f.gorge){const lz=P.z-q.OZ,G=GORGE;if(lz<G.z0+.8){P.z=G.z0+.8+q.OZ;if(f.vz<0)f.vz=0}if(lz>G.z1-.8){P.z=G.z1-.8+q.OZ;if(f.vz>0)f.vz=0}}
  /* your car went over the edge: it falls all the way, crashes at the bottom, and you are thrown out down there */
  const s=q&&q.seat;if(s&&s.v&&!s.v.K.plane&&!s.v.wreck&&gorgeAt(s.v.x,s.v.z)&&s.v.y<-29.5&&!s.v.air){const v=s.v;try{vehBlow(q,v,false)}catch(e){}if(q.fling){q.fling.gorge=1;q.fling.noRoll=1}}}catch(e){conLog('error','gorge: '+e.message)}return r}}
{const sf8=xpSafeTick;xpSafeTick=function(q,dt){if(q.seat||q.inBus||q.fling||q.rsp||q.deep||q.lift||q.xr)return sf8.apply(this,arguments);if(gorgeAt(P.x,P.z-q.OZ)){const sp=Math.hypot(q.pvx||0,q.pvz||0),k=sp>11?11/sp:1;q.fling={vx:(q.pvx||0)*k,vz:(q.pvz||0)*k,vy:0,y:P.dy,t:0,soft:1,gorge:1,noRoll:1};snd(200,.3);return}return sf8.apply(this,arguments)}}
/* your own car: no winching back to the top while it is still falling or lying at the bottom */
{const vg8=xpVehGorge;xpVehGorge=function(q,v){if(q.seat&&q.seat.v===v&&!v.K.plane)return;if(v.wreck&&gorgeAt(v.x,v.z)){if(q.fling&&gorgeAt(P.x,P.z-q.OZ)){q.fling.gorge=1;q.fling.noRoll=1}if(q.deep||(q.fling&&q.fling.gorge))return}return vg8.apply(this,arguments)}}

/* ---------- the mining shack, off the road ---------- */
const SHKP={cx:-17,sz:-1062,th:Math.PI/2};
/* a point in the shack's own layout (as it was built at x = 0) to where it is now */
function shW(lx,lz){const c=Math.cos(SHKP.th),s=Math.sin(SHKP.th),dz=lz-SHKP.sz;return[SHKP.cx+lx*c+dz*s,SHKP.sz-lx*s+dz*c]}
function shBox(x0,x1,z0,z1){const a=shW(x0,z0),b=shW(x1,z1);return[Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1])]}
/* E at the door */
{const ru9=busRoamUpd;busRoamUpd=function(q,dt){const r=ru9.apply(this,arguments);try{if(q&&q.sh&&q.props&&!q.shProp){q.shProp=1;const d=shW(0,q.sh.SZ+q.sh.D/2+1.2);
   q.props.push({x:d[0],z:d[1],r:2.4,txt:()=>{if(q.seat||q.inBus||q.fling||q.jail||q.court||q.walk||!q.roam)return'';let co=0;try{co=MP.on&&mpOpen().length>0}catch(e){}return co?'[E] Go down the mine (the cage waits for everyone)':'[E] Go down the mine'},act:()=>{if(q.seat||q.inBus||q.fling||q.jail||q.court||q.walk||!q.roam)return;busRoamEnd(q,false)}})}
  if(q&&q.sh&&q.roam&&!q.shTip){const d=shW(0,q.sh.SZ+q.sh.D/2+1.2);if(Math.hypot(P.x-d[0],P.z-q.OZ-d[1])<4){q.shTip=1;hint('⛏️ Press E to go down the mine. You can come back up any time.')}}}catch(e){conLog('error','shack: '+e.message)}return r}}
