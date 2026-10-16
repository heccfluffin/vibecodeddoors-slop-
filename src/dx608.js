/* =====================================================================================================
   r610: POLICE. No more police cars blowing up on their own, more patrols, and Highway Patrol speed checkpoints.
   (Design spec: docs/design/police.md. Model: docs/design/models/speed-checkpoint.js.)
   1. AI cars (police, Highway Patrol, backup units, traffic, squads) already took no damage from their own bumps
      into scenery (r606). Now they also take none from bumping into each other, a damaged AI car quietly repairs
      itself when nobody is within 100 m, an AI car that falls into Devil's Gorge is wrecked at the bottom, and
      every AI car that blows up is written to the console (F8) with the reason, so a repeat can be tracked.
   2. Three Desert PD patrol cars, each on its own beat: town and the bus stop; the airfield and Dusty Gulch;
      the quarry, the mesa and the wind farm. They drive at the speed limit (70 km/h), stop for a second at
      junctions, now and then pull over for a while, chase anyone they spot with heat, and join any chase within
      300 m. A wrecked one is replaced from the Desert PD car park 60 s later. Only the host drives them (everyone
      sees them through the normal car sync), and far from every player they just roll along their beat.
   3. Every 6 to 10 minutes there is a 40 % chance that the Highway Patrol sets up a speed checkpoint on one of four
      long straights for 4 minutes: a radar trailer with a YOUR SPEED board, cones and a warning sign. Limit
      70 km/h. Up to 39 over: a fine (25 gold + 3 per km/h over). 40 over or more: the Highway Patrol comes after you.
      Knocking over a cone costs 3 heat; ramming the trailer is a crime. It shows as a red icon on the map.
   ===================================================================================================== */

function mkSpeedCheckpoint(){
 const g=new THREE.Group();
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.55,metalness:.3},o||{}));
 const yel=M(0xe8b818,{roughness:.5}),dark=M(0x1c1e20,{roughness:.5}),steel=M(0x8a9096,{metalness:.7,roughness:.35}),tyre=M(0x161616,{roughness:.9,metalness:0});
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const CYL=(r1,r2,h,m,x,y,z,p,s)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,s||14),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const beam=(a,b,t,m,p)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);const o=new THREE.Mesh(new THREE.BoxGeometry(t,d.length(),t),m);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());(p||g).add(o);return o};
 const FONT='"Barlow Semi Condensed",DoorsSans,Arial,sans-serif';
 const LIMIT=70,parts={cones:[]};
 /* ---------- the trailer ---------- */
 BX(1.3,.55,1.9,yel,0,.68,.5);/* body: z -0.45 … 1.45 */
 BX(1.32,.06,1.92,dark,0,.98,.5);/* lid trim */
 for(const sx of[-1,1]){/* wheels and mudguards */const w=CYL(.3,.3,.2,tyre,sx*.76,.3,.5,null,18);w.rotation.z=Math.PI/2;const hb=CYL(.14,.14,.21,steel,sx*.76,.3,.5);hb.rotation.z=Math.PI/2;
  const mg=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.24,18,1,true,0,Math.PI),dark);mg.rotation.z=Math.PI/2;mg.rotation.y=sx<0?Math.PI:0;mg.position.set(sx*.76,.3,.5);mg.material=new THREE.MeshStandardMaterial({color:0x1c1e20,roughness:.5,side:THREE.DoubleSide});g.add(mg)}
 BX(1.36,.08,.08,steel,0,.36,.5);/* axle */
 /* the tongue (A-frame) to the back, with a jack stand */
 beam([-.55,.5,1.45],[0,.5,2.4],.07,steel);beam([.55,.5,1.45],[0,.5,2.4],.07,steel);CYL(.05,.05,.12,dark,0,.5,2.45);
 CYL(.035,.035,.5,steel,0,.25,2.25);CYL(.07,.07,.04,dark,0,.02,2.25);/* jack and its foot */
 /* the front stands (so it sits level) */for(const sx of[-1,1]){CYL(.03,.03,.38,steel,sx*.5,.21,-.35);BX(.12,.03,.12,dark,sx*.5,.015,-.35)}
 /* solar panel on top, tilted up */{const sp=new THREE.Group();sp.position.set(0,1.05,.9);sp.rotation.x=-.35;g.add(sp);
  const c=document.createElement('canvas');c.width=128;c.height=128;const x=c.getContext('2d');x.fillStyle='#1a2a4a';x.fillRect(0,0,128,128);x.strokeStyle='#8a98b0';x.lineWidth=2;for(let i=0;i<=128;i+=32){x.beginPath();x.moveTo(i,0);x.lineTo(i,128);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(128,i);x.stroke()}
  BX(1.1,.04,.9,[steel,steel,M(0xffffff,{map:new THREE.CanvasTexture(c),metalness:.4,roughness:.25}),steel,steel,steel],0,.02,0,sp);for(const sx of[-1,1])BX(.04,.12,.04,steel,sx*.45,-.06,-.3,sp)}
 /* ---------- the mast and the LED board, facing -z ---------- */
 for(const sx of[-1,1])BX(.08,1.85,.08,steel,sx*.5,.98+.92,-.2);
 BX(1.42,1.37,.14,dark,0,2.08,-.25);/* board case: y 1.395 … 2.765, front face at z -0.32 */
 const cv=document.createElement('canvas');cv.width=272;cv.height=256;const bx=cv.getContext('2d');const btex=new THREE.CanvasTexture(cv);
 const board=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.25),new THREE.MeshBasicMaterial({map:btex}));board.rotation.y=Math.PI;board.position.set(0,2.08,-.322);g.add(board);parts.board=board;
 /* radar head under the board, and strobes on the top corners */
 BX(.22,.14,.16,dark,0,1.32,-.28);{const lens=new THREE.Mesh(new THREE.CircleGeometry(.05,16),M(0x30343a,{metalness:.8,roughness:.2}));lens.rotation.y=Math.PI;lens.position.set(0,1.32,-.361);g.add(lens)}
 parts.strobes=[-1,1].map(sx=>{const m=new THREE.MeshStandardMaterial({color:sx<0?0xff3020:0x3060ff,emissive:sx<0?0xff2010:0x2050ff,emissiveIntensity:.1,transparent:true,opacity:.9,roughness:.2});CYL(.05,.06,.03,dark,sx*.6,2.78,-.25);const s=CYL(.045,.045,.09,m,sx*.6,2.84,-.25);s.material=m;return s});
 /* a reflective chevron strip on the trailer's back and front */
 {const c=document.createElement('canvas');c.width=256;c.height=32;const x=c.getContext('2d');x.fillStyle='#e83020';x.fillRect(0,0,256,32);x.fillStyle='#f0f0f0';for(let i=-32;i<256;i+=32){x.beginPath();x.moveTo(i,32);x.lineTo(i+16,32);x.lineTo(i+32,0);x.lineTo(i+16,0);x.fill()}
  const m=M(0xffffff,{map:new THREE.CanvasTexture(c),roughness:.4});for(const z of[-.451,1.451]){const p=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.15),m);p.position.set(0,.55,z);if(z<0)p.rotation.y=Math.PI;g.add(p)}}
 /* the HIGHWAY PATROL word on both sides, painted */
 {const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d');x.clearRect(0,0,512,96);x.fillStyle='#1c1e20';x.font='bold 56px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText('HIGHWAY PATROL',256,50,490);
  const m=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),transparent:true,alphaTest:.3,roughness:.5});for(const sx of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.3),m);p.rotation.y=sx*Math.PI/2;p.position.set(sx*.651,.72,.5);g.add(p)}}
 /* ---------- cones ---------- */
 const coneTex=(()=>{const c=document.createElement('canvas');c.width=32;c.height=128;const x=c.getContext('2d');x.fillStyle='#f05a14';x.fillRect(0,0,32,128);x.fillStyle='#f4f4ec';x.fillRect(0,22,32,18);x.fillRect(0,56,32,14);return new THREE.CanvasTexture(c)})();
 const coneM=M(0xffffff,{map:coneTex,roughness:.6,metalness:0}),baseM=M(0x2a2a2a,{roughness:.8,metalness:0});
 const mkCone=(x,z)=>{const c=new THREE.Group();c.position.set(x,0,z);g.add(c);BX(.38,.03,.38,baseM,0,.015,0,c);const k=new THREE.Mesh(new THREE.CylinderGeometry(.025,.15,.68,16,1,true),coneM);k.position.y=.37;c.add(k);
  const tip=new THREE.Mesh(new THREE.CircleGeometry(.025,12),coneM);tip.rotation.x=-Math.PI/2;tip.position.y=.71;c.add(tip);parts.cones.push(c);return c};
 for(let i=0;i<7;i++){const z=-16+i*2.2,x=-2.8+Math.min(1,i/6)*1.0;mkCone(x,z)}/* the taper ends 1.8 m before the trailer, 0.9 m clear of its side */
 /* ---------- the warning sign (separate group) ---------- */
 const warn=new THREE.Group();
 {const post=new THREE.Mesh(new THREE.BoxGeometry(.08,2.6,.08),steel);post.position.y=1.3;warn.add(post);
  const sgn=(w,h,draw,y)=>{const c=document.createElement('canvas');c.width=256;c.height=Math.round(256*h/w);const x=c.getContext('2d');draw(x,c.width,c.height);const m=M(0xffffff,{map:new THREE.CanvasTexture(c),roughness:.6,metalness:.1});
   const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,.03),[steel,steel,steel,steel,steel,m]);b.position.set(0,y,-.06);warn.add(b)};
  sgn(.75,.95,(x,w,h)=>{x.fillStyle='#f4f4f0';x.fillRect(0,0,w,h);x.strokeStyle='#111';x.lineWidth=8;x.strokeRect(10,10,w-20,h-20);x.fillStyle='#111';x.textAlign='center';x.textBaseline='middle';x.font='bold 50px '+FONT;x.fillText('SPEED',w/2,h*.2,w-40);x.fillText('LIMIT',w/2,h*.37,w-40);x.font='bold 110px '+FONT;x.fillText(String(LIMIT),w/2,h*.63,w-40);x.font='bold 40px '+FONT;x.fillText('km/h',w/2,h*.86,w-40)},2.05);
  sgn(.75,.3,(x,w,h)=>{x.fillStyle='#e8b818';x.fillRect(0,0,w,h);x.strokeStyle='#111';x.lineWidth=6;x.strokeRect(6,6,w-12,h-12);x.fillStyle='#111';x.textAlign='center';x.textBaseline='middle';x.font='bold 40px '+FONT;x.fillText('SPEED CHECK AHEAD',w/2,h/2+2,w-28)},1.38)}
 /* ---------- the LED board ---------- */
 let cur=null,lim=LIMIT,T=0;
 function drawBoard(){const x=bx,w=272,h=256;x.fillStyle='#0a0b0c';x.fillRect(0,0,w,h);
  x.fillStyle='#e8b818';x.fillRect(0,0,w,46);x.fillStyle='#111';x.font='bold 34px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText('YOUR SPEED',w/2,25,w-16);
  const over=cur!=null&&cur>lim,way=cur!=null&&cur>=lim+40,col=cur==null?'#202020':way?'#ff3020':over?'#ffb020':'#40ff60';
  /* big LED digits: drawn as a dot grid clipped to the number */
  if(cur!=null){const t=String(Math.round(cur));const c2=document.createElement('canvas');c2.width=w;c2.height=140;const y2=c2.getContext('2d');y2.fillStyle='#fff';y2.font='bold 132px '+FONT;y2.textAlign='center';y2.textBaseline='middle';y2.fillText(t,w/2,74,w-20);
   const d=y2.getImageData(0,0,w,140).data;x.fillStyle=col;for(let yy=4;yy<140;yy+=7)for(let xx=4;xx<w;xx+=7){if(d[(yy*w+xx)*4+3]>100){x.beginPath();x.arc(xx,52+yy,2.8,0,7);x.fill()}}}
  else{x.fillStyle='#1a1c1e';for(let yy=56;yy<192;yy+=7)for(let xx=4;xx<w;xx+=7){x.beginPath();x.arc(xx,yy,2.2,0,7);x.fill()}}
  const blink=Math.floor(T*3)%2==0;x.fillStyle='#16181a';x.fillRect(0,200,w,56);
  x.font='bold 30px '+FONT;if(way&&blink){x.fillStyle='#ff3020';x.fillText('STOP · POLICE',w/2,228,w-16)}else if(over&&blink){x.fillStyle='#ffb020';x.fillText('SLOW DOWN',w/2,228,w-16)}else{x.fillStyle='#d8d8d0';x.fillText('LIMIT '+lim+' KM/H',w/2,228,w-16)}
  btex.needsUpdate=true}
 g.userData.parts=parts;g.userData.warn=warn;g.userData.LIMIT=LIMIT;g.userData.CAR={x:1.0,z:6.5,ry:0};
 g.userData.setSpeed=function(mph,limit){cur=mph?mph:null;if(limit)lim=limit;drawBoard()};
 let acc=0;g.userData.update=function(dt){T+=dt;acc+=dt;const over=cur!=null&&cur>lim;
  parts.strobes[0].material.emissiveIntensity=over&&Math.floor(T*8)%2==0?3:.1;parts.strobes[1].material.emissiveIntensity=over&&Math.floor(T*8)%2==1?3:.1;
  if(acc>.15){acc=0;drawBoard()}};
 drawBoard();
 return g}

/* ===================================================================================================== 
   1. AI CARS: NO SELF-WRECKING, SELF-REPAIR, AND A LOG OF EVERY AI CAR THAT BLOWS UP
   ===================================================================================================== */
/* is this car driven by the game (not by a person)? the same rule as AISELF in dx602 */
function aiCar(q,v){return !!v&&!(q.seat&&q.seat.v===v)&&!(q.inBus&&q.inBus.v===v)&&!!(v.npc||v.k=='cop'||(q.cop&&q.cop.v===v))}
/* the names of the functions that led here (for the log) */
function aiCaller(){try{const L=String(new Error().stack||'').split('\n'),out=[];for(const ln of L){const m=ln.match(/at (?:Object\.)?([\w$.]+) \(/)||ln.match(/^([\w$.]+)@/);if(!m)continue;const n=m[1];if(/^(aiCaller|vehDamage|vehBlow|Error|apply)$/.test(n)||out.includes(n))continue;out.push(n);if(out.length>=3)break}return out.join(' < ')||'unknown'}catch(e){return 'unknown'}}
function aiName(q,v){return v.pcr?'patrol car '+v.pcr:v.hwp?'the Highway Patrol car':v.pdU?'a backup squad car':v.sqd?'a squad '+v.k:v.crimCop?'a crime-scene cop car':v.crim?'a getaway '+v.k:q.cop&&q.cop.v===v?"Seek's cruiser":'an AI '+v.k}
/* which vehicle's physics is running right now (so a ram can be put down to whoever did it) */
let PHYSV=null;
{const vp8=vehPhys;vehPhys=function(q,v){const p=PHYSV;PHYSV=v;let r;try{r=vp8.apply(this,arguments)}finally{PHYSV=p}
  /* ramming the speed trailer is a crime */try{const C=q.spc;if(C&&C.ob&&v&&v.hitO===C.ob&&q.seat&&q.seat.v===v&&q.rt-(C.ramT||-9)>3&&Math.abs(v.v)>3){C.ramT=q.rt;addHeat(q,8,'trailer');hwpSay(['That trailer cost more than your car.','You hit the SPEED TRAILER. It was measuring you. It still is.'][Math.random()*2|0])}}catch(e){}
  return r}}
{const vd8=vehDamage;vehDamage=function(q,v,n){if(!v||!n||!q)return vd8.apply(this,arguments);
  /* an AI car bumping another AI car: neither is hurt */if(AISELF&&v!==AISELF&&aiCar(q,v)&&aiCar(q,AISELF))return;
  /* an AI car landing at the bottom of Devil's Gorge: that one is real */if(AISELF===v&&!v.K.plane&&!v.wreck&&v.y<-20&&gorgeAt(v.x,v.z)){v.aiWhy="fell into Devil's Gorge";vehBlow(q,v,false);return}
  if(aiCar(q,v)&&AISELF!==v){const by=PHYSV&&PHYSV!==v?PHYSV:null,me=by&&q.seat&&q.seat.v===by;v.aiWhy=(by?(me?'rammed by your '+by.k:'hit by '+aiName(q,by)):'damage from '+aiCaller())+' ('+Math.round(n)+' damage, total '+Math.round((v.dmg||0)+n)+')';if(me)v.myHit=q.rt}
  return vd8.apply(this,arguments)}}
{const vb8=vehBlow;vehBlow=function(q,v,mine){const was=!v||v.wreck;if(!was&&aiCar(q,v)){try{conLog('warn','AI car blown up: '+aiName(q,v)+' at '+Math.round(v.x)+', '+Math.round(v.z)+'. Why: '+(v.aiWhy||(mine?'you did it':'no damage recorded, called from '+aiCaller())))}catch(e){}}
  const r=vb8.apply(this,arguments);if(!was&&v.wreck)v.aiWhy=null;
  /* a patrol car: back out of the Desert PD car park 60 s later */if(!was&&v&&v.pcr&&v.wreck){try{pcrWrecked(q,v)}catch(e){conLog('error','patrol car wreck: '+e.message)}}
  return r}}
{const cw8=copWreck;copWreck=function(q,mine){try{if(q.cop&&q.cop.st!='wreck')conLog('warn',"AI car blown up: Seek's cruiser at "+Math.round(q.cop.v.x)+', '+Math.round(q.cop.v.z)+'. Why: '+(mine?'you did it':'called from '+aiCaller()))}catch(e){}return cw8.apply(this,arguments)}}
/* everyone in this desert (you and your friends), wherever they are */
function pcrNear(q){const L=[[P.x,P.z-q.OZ]];try{const R=q.vnet&&q.vnet.rem;for(const id in R){const r=R[id];if(r&&Date.now()-(r.t||0)<6000)L.push([r.x,r.z])}}catch(e){}return L}
function pcrMinD(L,x,z){let d=1e9;for(const p of L)d=Math.min(d,Math.hypot(p[0]-x,p[1]-z));return d}
/* a damaged AI car fixes itself when nobody is within 100 m to see it */
function aiRepair(q){const L=pcrNear(q);for(const v of q.vehs){if(v.gone||v.wreck||!(v.dmg>0)||!aiCar(q,v))continue;if(pcrMinD(L,v.x,v.z)>100){v.dmg=0;v.aiWhy=null}}
 const c=q.cop;if(c&&c.v&&c.st!='wreck'&&c.v.dmg>0&&pcrMinD(L,c.v.x,c.v.z)>100)c.v.dmg=0}

/* =====================================================================================================
   2. THREE PATROL CARS ON THEIR OWN BEATS
   ===================================================================================================== */
/* each beat: [x, z, 1 = a junction (stop for a second)], driven in order and round again */
const PCRB=[
 /* town and the bus stop */[[0,-960,1],[0,-1037,1],[100,-1037,1],[205,-1030,1],[205,-935],[205,-1030,1],[100,-1037,1],[0,-1037,1],[0,-1120,1],[-170,-1120],[-5,-1120,1],[0,-1076]],
 /* the airfield and Dusty Gulch */[[300,-1030,1],[300,-1200],[300,-1030,1],[560,-1030,1],[560,-1420,1],[450,-1420,1],[450,-1550],[450,-1420,1],[560,-1420,1],[560,-1030,1]],
 /* the quarry, Lookout Mesa and the wind farm */[[-200,-1120],[-440,-1120,1],[-440,-1420,1],[-200,-1420],[0,-1420,1],[0,-1550,1],[-215,-1550],[0,-1550,1],[0,-1420,1],[-440,-1420,1],[-440,-1120,1]]];
const PCRV=19.5;/* 70 km/h */
const PCRL={spot:['Desert PD! Stay right where you are.','Got a visual. Pursuing.','You. Yes, YOU. Pull over.'],help:['Backup on the way!','Unit joining the pursuit.','I hear we are chasing someone. Count me in.'],lost:['Lost them. Back on the beat.','They are gone. Resuming patrol.']};
/* the host (lowest id in this desert) drives them, the same way as the Highway Patrol */
function pcrHost(q){let low=SV.pid;try{const R=q.vnet&&q.vnet.rem;for(const id in R)if(Date.now()-(R[id].t||0)<6000&&id<low)low=id}catch(e){}return low===SV.pid}
/* built on every player's game at the same moment (right after the Highway Patrol car), so the car numbers match */
function pcrSpawn(q){if(q.pcr||!q.addVeh)return;q.pcr=PCRB.map((B,i)=>{const a=B[0],b=B[1],h=Math.atan2(-(b[0]-a[0]),-(b[1]-a[1]));const v=q.addVeh('cop',a[0],a[1],h);v.npc=1;v.nogar=1;v.occ=[];v.pcr=i+1;
  try{pdLights(v);for(const s of v.pdL||[])s.visible=false}catch(e){}
  const pr=q.props.find(p=>p.veh===v);if(pr)pr.txt=()=>q.seat||q.inBus?'':v.wreck?'🔥 A Desert PD patrol car. Was.':'🚓 A Desert PD patrol car, out on its beat.';
  return{v,i,B,wi:1,st:'patrol',t:0,puT:70+i*40}})}
{const hs8=hwpSpawn;hwpSpawn=function(q){const had=!!(q&&q.hwp);const r=hs8.apply(this,arguments);try{if(q&&q.hwp&&!had)pcrSpawn(q)}catch(e){conLog('error','patrol cars: '+e.message)}return r}}
/* wrecked: tell the host (if it was not the host's game), and come back out of the car park in 60 s */
function pcrWrecked(q,v){const u=q.pcr&&q.pcr[v.pcr-1];v.wreckT=60;
 /* a free spot in the Desert PD car park to come back out of */const t={K:v.K,r:v.r,x:0,z:0,h:0,hitO:null};for(const[ox,oz]of[[0,12],[-7,12],[7,12],[0,18],[-7,18],[7,18],[0,6]]){t.x=DPD.X+1+ox;t.z=DPD.Z+oz;let ok=true;try{ok=vehOK(q,t,t.x,t.z,0)}catch(e){}if(ok)break}v.sx=t.x;v.sz=t.z;v.sh=0;
 if(u){u.st='patrol';u.tg=null;u.c=null;u.cc=null;u.stopT=0;u.back=1}
 if(v.myHit!=null&&q.rt-v.myHit<3){v.myHit=null;try{addHeat(q,15,'copcar');hint('💥 You wrecked a Desert PD patrol car! (+heat)')}catch(e){}}
 if(!pcrHost(q))xmNet(q,'pcrw',{i:v.pcr-1})}
/* the players the police care about (same rules as the Highway Patrol), with the car each one is driving */
function pcrVeh(q,id){if(id===SV.pid)return q.seat?q.seat.v:q.inBus?q.inBus.v:null;try{const r=q.vnet.rem[id];if(r&&r.v>=0)return q.vehs[r.v]||null;if(r&&r.ib>=0)return q.vehs[r.ib]||null}catch(e){}return null}
function pcrSay(q,u,id,L){const t=L[Math.random()*L.length|0];if(id===SV.pid){try{hint('📻 Desert PD unit '+(u.i+1)+': "'+t+'"')}catch(e){}}else xmNet(q,'pcrc',{to:id,i:u.i,t})}
function pcrChaseOn(q,u,p,help){u.st='chase';u.tg=p.id;u.ct=0;u.lost=0;u.cc=null;u.stopT=0;pcrSay(q,u,p.id,help?PCRL.help:PCRL.spot);if(p.id===SV.pid){q.heatT=0;snd(960,.25);setTimeout(()=>snd(740,.25),220)}}
function pcrTick(q,dt){const L=q.pcr;if(!L||!dt)return;
 /* lights and siren on everyone's screen */for(const u of L){const v=u.v,on=u.st=='chase'&&!v.wreck&&!v.gone;if(v.pdL){const f=Math.floor((q.rt||0)*6)%2;v.pdL[0].visible=on&&!!f;v.pdL[1].visible=on&&!f}
  if(on){const d=Math.hypot(P.x-v.x,P.z-q.OZ-v.z);if(d<150&&(u.sir=(u.sir||0)-dt)<=0){u.sir=.45;u.sw=!u.sw;snd(u.sw?700:540,.3*Math.max(.12,1-d/150))}}}
 if(!pcrHost(q)){for(const u of L)if(u.v.owner===SV.pid)u.v.owner=null;return}
 if((q.pcrN=(q.pcrN||0)-dt)<=0){q.pcrN=1;xmNet(q,'pcr',{s:L.map(u=>u.st=='chase'?1:0),tg:L.map(u=>u.tg||'')})}
 const near=pcrNear(q);let pls=null;try{pls=hwpPlayers(q)}catch(e){pls=[]}navReady(q);
 for(const u of L)try{pcrOne(q,u,pls,near,dt)}catch(e){conLog('error','patrol car '+(u.i+1)+': '+e.message)}}
function pcrOne(q,u,pls,near,dt){const v=u.v;if(v.gone)return;v.owner=SV.pid;
 if(v.wreck){u.st='patrol';u.tg=null;return}u.t+=dt;
 if(u.back){/* just back out of the car park: start the beat at its nearest point */u.back=0;let bi=0,bd=1e9;u.B.forEach((w,j)=>{const d=Math.hypot(w[0]-v.x,w[1]-v.z);if(d<bd){bd=d;bi=j}});u.wi=bi}
 const far=pcrMinD(near,v.x,v.z)>400;
 /* chases: spot someone with heat (as the old patrol cruiser does), or join a chase within 300 m */
 if(u.st!='chase'&&(u.sT=(u.sT||0)-dt)<=0){u.sT=.5;for(const p of pls){if(!p.ok||!(p.heat>0))continue;const d=Math.hypot(p.x-v.x,p.z-v.z);
   const chased=p.heat>=30||(q.hwp&&q.hwp.st=='pursue'&&q.hwp.tg===p.id);if(chased&&d<300){pcrChaseOn(q,u,p,1);break}
   if(far)continue;if(p.car?d<40:(d<46&&copSees(v.x,v.z,p.x,p.z))){pcrChaseOn(q,u,p,0);break}}}
 if(u.st=='chase'){const p=pls.find(x=>x.id===u.tg);u.ct+=dt;const d=p?Math.hypot(p.x-v.x,p.z-v.z):1e9;if(d>350)u.lost+=dt;else u.lost=0;
  const hwpOn=q.hwp&&q.hwp.st=='pursue'&&q.hwp.tg===u.tg;
  if(!p||!p.ok||u.lost>8||u.ct>240||(!(p.heat>0)&&!hwpOn)){if(p&&p.ok&&u.lost<=8)pcrSay(q,u,p.id,['All clear. Back on the beat.']);else if(u.tg)pcrSay(q,u,u.tg,PCRL.lost);u.st='patrol';u.tg=null;u.c=null;u.back=1;return}
  if(u.ghost){u.ghost=0;u.c=null;u.cc=null;v.v=Math.min(v.v,8)}
  pcrChase(q,u,p,dt);return}
 /* far from everyone: no physics, just roll along the beat so it is somewhere sensible when someone comes near */
 if(far){pcrGhost(q,u,dt);return}
 if(u.ghost){u.ghost=0;u.c=null;v.v=Math.min(Math.abs(v.v),8);try{v.y=vehGround(q,v.x,v.z)}catch(e){}}
 const brake=()=>{v.K=VEHK.cop;v.hitO=null;vehPhys(q,v,dt,0,0,true,true)};
 if(u.stopT>0){u.stopT-=dt;brake();return}
 /* pulled over on the shoulder for a while */
 if(u.st=='pull'){u.pt+=dt;const d=Math.hypot(u.pp[0]-v.x,u.pp[1]-v.z);if(u.pt>14&&!u.held){u.st='patrol';u.c=null;return}
  if(u.held||(d<2.5&&Math.abs(v.v)<.6)){u.held=(u.held||0)+dt;brake();if(u.held>u.pw){u.st='patrol';u.held=0;u.c=null}return}
  cwDrive(q,u,u.pp[0],u.pp[1],dt,7,1.2);return}
 const w=u.B[u.wi%u.B.length],d=cwDrive(q,u,w[0],w[1],dt,PCRV,0);
 if(d<8){if(w[2])u.stopT=1;u.wi=(u.wi+1)%u.B.length}
 /* now and then: pull over (on a straight, going at speed, the shoulder clear) */
 if((u.puT-=dt)<=0){u.puT=60+Math.random()*90;const f=[-Math.sin(v.h),-Math.cos(v.h)],rt=[Math.cos(v.h),-Math.sin(v.h)],px=v.x+f[0]*16+rt[0]*4,pz=v.z+f[1]*16+rt[1]*4;
  let ok=false;try{const sv=v.hitO;ok=Math.abs(v.v)>12&&d>70&&Math.abs(wrapA(Math.atan2(-(w[0]-v.x),-(w[1]-v.z))-v.h))<.2&&vehOK(q,v,px,pz,v.h)&&Math.abs(vehGround(q,px,pz)-v.y)<.3;v.hitO=sv}catch(e){}
  if(ok){u.st='pull';u.pp=[px,pz];u.pt=0;u.held=0;u.pw=10+Math.random()*10}}}
/* far away: along the beat at the speed limit, no collisions */
function pcrGhost(q,u,dt){const v=u.v;u.ghost=1;let step=PCRV*dt;for(let k=0;k<3&&step>0;k++){const w=u.B[u.wi%u.B.length],dx=w[0]-v.x,dz=w[1]-v.z,d=Math.hypot(dx,dz);if(d<=step){v.x=w[0];v.z=w[1];step-=d;u.wi=(u.wi+1)%u.B.length;continue}v.x+=dx/d*step;v.z+=dz/d*step;v.h=Math.atan2(-dx,-dz);step=0}
 v.v=PCRV;v.air=0;v.vy=0;if((u.gyT=(u.gyT||0)-dt)<=0){u.gyT=.5;try{v.y=vehGround(q,v.x,v.z)}catch(e){}}if(v.m){v.m.position.set(v.x,v.y,v.z);v.m.rotation.set(0,v.h,0)}}
/* chasing: the same driving as the backup cars (dx555/dx601) */
function pcrChase(q,u,p,dt){const v=u.v,tv=pcrVeh(q,p.id),gx=tv?tv.x:p.x,gz=tv?tv.z:p.z,d=Math.hypot(gx-v.x,gz-v.z);let sx0=gx,sz0=gz,tag=null;const C=u.cc||(u.cc={});
 if(d>14||!navLOS(v.x,v.z,gx,gz)){C.npT=(C.npT||0)-dt;if(C.npT<=0||u.replan||C.ntx==null||Math.hypot(C.ntx-gx,C.ntz-gz)>8){u.replan=0;C.npT=d>200?1.6:.8;C.ntx=gx;C.ntz=gz;navReq(q,C,'path',v.x,v.z,gx,gz,d>150?1:0)}navWork(C,2);const wp=C.path&&navSteer(C,v.x,v.z,12);if(wp){sx0=wp[0];sz0=wp[1];tag=wp[2]||null}}
 const ds=Math.hypot(sx0-v.x,sz0-v.z),ramp=tag=='land'||(tag=='ramp'&&ds<12);let want=Math.atan2(-(sx0-v.x),-(sz0-v.z));if(!ramp)want=aiProbe(q,v,u,want,dt,['me',tv].filter(Boolean),Math.min(14,ds));
 const tsp=tv?Math.abs(tv.owner===SV.pid?tv.v:(tv.tsp||tv.v||0)):0,mx=d>60?30:Math.max(10,tsp+8);v.K=Object.assign({},VEHK.cop,{max:ramp?Math.max(20,mx):mx});
 const atGoal=sx0===gx&&sz0===gz,r=aiCtl(q,v,u,want,ds,dt,{max:mx,ramp,stop:atGoal&&!tv?5:null,orbit:!(tv&&tsp>3)});let fx=r[0];if(tv&&d<3)fx=tsp>2?.6:-.2;
 v.hitO=null;vehPhys(q,v,dt,fx,r[1],true,false);
 /* bumping your car hurts it (like the backup cars) */if(v.hitO&&tv&&v.hitO===tv&&q.seat&&q.seat.v===tv&&Math.abs(v.v)>6&&(u.rmT=(u.rmT||0)-dt)<=0){u.rmT=1.5;try{vehDamage(q,tv,Math.abs(v.v)*.6)}catch(e){}snd(90,.2);try{camShake(.25,.2)}catch(e){}}}
/* co-op messages */
XM.net.pcr=(o,id)=>{const q=BUS.ride;if(!q||!q.pcr||pcrHost(q))return;q.pcr.forEach((u,i)=>{u.st=o.s&&o.s[i]?'chase':'patrol';u.tg=o.tg&&o.tg[i]||null})};
XM.net.pcrc=o=>{const q=BUS.ride;if(!q||o.to!==SV.pid)return;q.heatT=0;try{hint('📻 Desert PD unit '+((o.i|0)+1)+': "'+String(o.t||'Pull over.').slice(0,80)+'"')}catch(e){}snd(960,.25)};
XM.net.pcrw=(o,id)=>{const q=BUS.ride,u=q&&q.pcr&&q.pcr[o.i|0];if(!u||u.v.wreck||!pcrHost(q))return;u.v.aiWhy="wrecked in a friend's game";vehBlow(q,u.v,false);vehNet(q,{k:'wr',v:u.v.id})};
{const ru8=busRoamUpd;busRoamUpd=function(q,dt){const r=ru8.apply(this,arguments);try{if(q&&q.roam&&q.pcr)pcrTick(q,dt)}catch(e){conLog('error','patrol cars: '+e.message)}try{if(q&&q.roam&&(q.aiRT=(q.aiRT||0)-dt)<=0){q.aiRT=1;aiRepair(q)}}catch(e){conLog('error','AI repair: '+e.message)}return r}}

/* =====================================================================================================
   3. HIGHWAY PATROL SPEED CHECKPOINTS
   ===================================================================================================== */
/* where: long straights, away from towns, junctions and bends. rx, rz: a point on the road's centre line;
   th: which way the checkpoint faces (the board looks at the traffic coming the busier way). The trailer stands
   just off the far edge of the road (5.4 m from the centre line), so the cones taper along the road's edge. */
const SPCK=[{nm:'Main road south of town',rx:0,rz:-1340,th:Math.PI},
 {nm:'East of the airfield',rx:560,rz:-1250,th:Math.PI},
 {nm:'Road past Dusty Gulch',rx:300,rz:-1420,th:Math.PI/2},
 {nm:'Speedway road',rx:330,rz:-1900,th:Math.PI/2},
 /* debug only (spcForce(4)): just south of the bus stop */{nm:'Test: north road',rx:0,rz:-1165,th:Math.PI,test:1}];
const SPCO=5.4,SPCLIM=70;
SPCK.forEach(S=>{S.x=S.rx+SPCO*Math.cos(S.th);S.z=S.rz-SPCO*Math.sin(S.th)});
/* a point in the checkpoint's own layout to the desert, and back */
function spcW(S,lx,lz){const c=Math.cos(S.th),s=Math.sin(S.th);return[S.x+lx*c+lz*s,S.z-lx*s+lz*c]}
function spcL(S,x,z){const c=Math.cos(S.th),s=Math.sin(S.th),dx=x-S.x,dz=z-S.z;return[dx*c-dz*s,dx*s+dz*c]}
/* the height of whatever is underfoot (the road surface, not just the sand under it) */
function spcY(q,x,z){let y=0;try{y=vehGround(q,x,z)||0}catch(e){}try{const rc=new THREE.Raycaster(new THREE.Vector3(x,y+3,z+q.OZ),new THREE.Vector3(0,-1,0),0,3.6);q.g.updateMatrixWorld();const hits=rc.intersectObject(q.g,true);for(const h of hits){let o=h.object,skip=false;while(o&&o!==q.g){if(o.userData&&(o.userData.spc||o.userData.veh)){skip=true;break}o=o.parent}if(skip||!h.object.visible)continue;const hy=h.point.y-q.g.position.y;if(hy<y+.4&&hy>y-.3){y=Math.max(y,hy);break}}}catch(e){}return y}
/* put it up (on every player's game) */
function spcBuild(q,C){if(C.g)return;const S=SPCK[C.i];if(!S)return;const g=mkSpeedCheckpoint();g.userData.spc=1;const gy=spcY(q,S.x,S.z);g.position.set(S.x,gy,S.z);g.rotation.y=S.th;q.g.add(g);C.g=g;C.x=S.x;C.z=S.z;
 for(const c of g.userData.parts.cones){const w=spcW(S,c.position.x,c.position.z);c.position.y=spcY(q,w[0],w[1])-gy;c.userData.w=w;c.rotation.order='YXZ'}
 const wn=g.userData.warn,ww=spcW(S,0,-70);wn.userData.spc=1;wn.position.set(ww[0],spcY(q,ww[0],ww[1]),ww[1]);wn.rotation.y=S.th;q.g.add(wn);C.warn=wn;
 /* the trailer is solid (box x -0.75 … 0.75, z -1 … 2), and so is the sign post */const cs=[[-.75,-1],[.75,-1],[-.75,2],[.75,2]].map(p=>spcW(S,p[0],p[1]));
 C.ob={x0:Math.min(...cs.map(p=>p[0])),x1:Math.max(...cs.map(p=>p[0])),z0:Math.min(...cs.map(p=>p[1])),z1:Math.max(...cs.map(p=>p[1])),spc:1};C.ob2={x0:ww[0]-.05,x1:ww[0]+.05,z0:ww[1]-.05,z1:ww[1]+.05,spc:1};q.obs.push(C.ob,C.ob2);q.obsDirty=1;
 C.loc={nm:'Speed checkpoint',x:S.x,z:S.z,ic:'🚨',seen:1};C.kmh=null;g.userData.setSpeed(null,SPCLIM)}
function spcClear(q,C){if(!C)return;for(const o of[C.g,C.warn])if(o&&o.parent)o.parent.remove(o);C.g=C.warn=null;for(const o of[C.ob,C.ob2]){const i=q.obs.indexOf(o);if(i>=0)q.obs.splice(i,1)}C.ob=C.ob2=null;q.obsDirty=1}
/* where the Highway Patrol car parks (nose out, ready to chase) */
function spcCar(S){const c=SPCCAR;const w=spcW(S,c.x,c.z);return{x:w[0],z:w[1],h:S.th+c.ry}}
const SPCCAR={x:1.0,z:6.5,ry:0};/* = g.userData.CAR of the model */
function spcSend(q,C){xmNet(q,'spc',C?{i:C.i,st:C.st,t:+(C.t||0).toFixed(0)}:{st:'off'})}
/* start one (the host, or spcForce for testing) */
function spcStart(q,i){if(q.spc)return null;const C={i,st:'go',gt:0,t:240,pass:{},said:{},pt:0};q.spc=C;spcSend(q,C);return C}
/* the debug switch: put a checkpoint up at once (the Highway Patrol car is moved to it) */
function spcForce(i){const q=BUS.ride;if(!q||!q.hwp)return 'no desert';i=i==null?4:i|0;if(q.spc){spcClear(q,q.spc);q.spc=null}const C=spcStart(q,i),H=q.hwp,v=H.v,c=spcCar(SPCK[i]);v.x=c.x;v.z=c.z;v.h=c.h;v.v=0;v.netSnap=1;if(v.m){v.m.position.set(v.x,v.y,v.z);v.m.rotation.y=v.h}C.st='set';spcBuild(q,C);spcSend(q,C);return SPCK[i].nm}
/* the drivers who can be measured: you or a friend at the wheel of a car (not walking, not on the bus, not a passenger, not flying) */
function spcDrivers(q){const L=[];const ok=v=>v&&!v.gone&&!v.wreck&&!v.K.bus&&!v.K.plane&&!v.K.heli&&(v.y||0)<4;
 if(q.seat&&q.seat.i==0&&ok(q.seat.v))L.push({id:SV.pid,v:q.seat.v,spd:q.seat.v.v});
 try{const R=q.vnet&&q.vnet.rem;for(const id in R){const r=R[id];if(!r||Date.now()-(r.t||0)>4000||r.v<0||r.st!==0||r.ib>=0)continue;const v=q.vehs[r.v];if(ok(v))L.push({id,v,spd:v.owner===SV.pid?v.v:(v.tsp!=null?v.tsp:v.v)})}}catch(e){}return L}
/* the car's speed towards the board (along the road, in km/h), and where it is in the checkpoint's layout */
function spcRel(S,d){const v=d.v,l=spcL(S,v.x,v.z),vx=-Math.sin(v.h)*d.spd,vz=-Math.cos(v.h)*d.spd,c=Math.cos(S.th),s=Math.sin(S.th);return{lx:l[0],lz:l[1],vz:vx*s+vz*c}}
/* a fine (in the speeder's own game) */
function spcFine(q,kmh,fine){if(gold>=fine){gold-=fine;try{saveGame();updHud()}catch(e){}hint('🚨 HIGHWAY PATROL: '+kmh+' in a '+SPCLIM+'. Fined '+fine+' gold. Slow down.')}else{addHeat(q,10,'speeding');hint('🚨 HIGHWAY PATROL: '+kmh+' in a '+SPCLIM+'. You cannot pay the '+fine+' gold fine: +10 heat instead.')}snd(500,.1);setTimeout(()=>snd(400,.15),200)}
XM.net.spcf=o=>{const q=BUS.ride;if(q&&o.to===SV.pid)spcFine(q,o.kmh|0,o.fine|0)};
XM.net.spc=(o,id)=>{const q=BUS.ride;if(!q||!q.roam||pcrHost(q))return;let C=q.spc;if(o.st=='off'||o.st=='pack'){if(C&&C.st!='pack'){C.st='pack';C.pt=0}return}const i=o.i|0;if(!SPCK[i])return;
 if(!C||C.i!==i){if(C)spcClear(q,C);C=q.spc={i,st:'go',gt:0,t:240,pass:{},said:{},pt:0}}C.st=String(o.st);C.t=+o.t||0};
/* the board, the cones, the strobes and the measuring (all players); the decisions (the host) */
let SPCT=0;
function spcTick(q,dt){const C=q.spc;if(!C||!dt)return;const S=SPCK[C.i],H=q.hwp,host=pcrHost(q);
 if((C.st=='set'||C.st=='pack')&&!C.g)spcBuild(q,C);
 if(host&&(C.nT=(C.nT||0)-dt)<=0){C.nT=4;spcSend(q,C)}
 if(C.st=='go'&&host&&(H.v.wreck||H.v.gone)){C.st='pack';C.pt=0;spcSend(q,C)}
 if(C.st=='set'){C.t-=dt;if(host&&C.t<=0){C.st='pack';C.pt=0;spcSend(q,C);hwpPackUp(q)}}
 const near=pcrNear(q),dn=C.g?pcrMinD(near,C.x,C.z):1e9;
 if(C.st=='pack'){C.pt+=dt;if(!C.g||dn>60||C.pt>30){spcClear(q,C);q.spc=null;if(host)spcSend(q,null)}return}
 if(!C.g)return;const g=C.g,U=g.userData,meD=Math.hypot(P.x-C.x,P.z-q.OZ-C.z);
 /* the board: the nearest car coming towards it, within 120 m */const drv=[];for(const v of q.vehs){if(v.gone||v.wreck||v.K.bus||v.K.plane||Math.abs(v.v||v.tsp||0)<.5)continue;const sp=v.owner&&v.owner!==SV.pid?(v.tsp!=null?v.tsp:v.v):v.v,r=spcRel(S,{v,spd:sp});if(r.lz<-120||r.lz>1||Math.abs(r.lx)>16||r.vz<1)continue;drv.push([-r.lz,r.vz])}
 drv.sort((a,b)=>a[0]-b[0]);const kmh=drv.length?Math.round(drv[0][1]*3.6):null;if(kmh!==C.kmh&&meD<400){C.kmh=kmh;U.setSpeed(kmh,SPCLIM)}
 if(meD<150)U.update(dt);
 /* the cones: knocked over by anything that drives into them */if(dn<40||meD<40)spcCones(q,C,S,dt);
 /* the host measures every driver as they pass the trailer, once per pass */
 if(host&&C.st=='set'){for(const d of spcDrivers(q)){const rec=C.pass[d.id]||(C.pass[d.id]={}),dist=Math.hypot(d.v.x-C.x,d.v.z-C.z),r=spcRel(S,d);if(dist>120){delete C.pass[d.id];continue}
   if(!rec.done&&rec.lz!=null&&rec.lz<0&&r.lz>=0&&Math.abs(r.lx)<20&&r.vz>0){rec.done=1;spcJudge(q,C,d,Math.round(r.vz*3.6))}rec.lz=r.lz}}}
function spcJudge(q,C,d,kmh){const over=kmh-SPCLIM;if(over<1)return;const H=q.hwp,me=d.id===SV.pid;
 if(over>=40&&H&&!H.v.wreck&&H.st=='patrol'){C.kmh=kmh;try{C.g.userData.setSpeed(kmh,SPCLIM)}catch(e){}hwpGo(q,H,d.id,'speed');if(me)addHeat(q,12,'speeding');else xmNet(q,'hwps',{to:d.id});return}
 const fine=25+3*Math.min(over,39);if(me)spcFine(q,kmh,fine);else xmNet(q,'spcf',{to:d.id,kmh,fine})}
function spcCones(q,C,S,dt){const cones=C.g.userData.parts.cones;
 for(const c of cones){const k=c.userData;if(k.sl){/* sliding to a stop */const t=Math.min(dt,k.sl.t);c.position.x+=k.sl.x*t;c.position.z+=k.sl.z*t;k.sl.t-=dt;if(k.sl.t<=0)k.sl=null;continue}if(k.down)continue;
  const w=k.w;for(const v of q.vehs){if(v.gone||Math.abs(v.x-w[0])>6||Math.abs(v.z-w[1])>6)continue;const sp=Math.abs(v.owner&&v.owner!==SV.pid?(v.tsp||0):v.v);if(sp<1.2||vehSegD(v,w[0],w[1])>v.r+.25)continue;
   /* over it goes, in the direction the car was going */k.down=1;const a=v.h-S.th,dir=Math.sign(v.owner&&v.owner!==SV.pid?(v.tsp||1):v.v)||1;c.rotation.y=dir>0?a:a+Math.PI;c.rotation.x=-1.5;c.position.y+=.17;const s=Math.min(3,sp*.25);k.sl={x:-Math.sin(c.rotation.y)*s,z:-Math.cos(c.rotation.y)*s,t:.4};
   if(Math.hypot(P.x-w[0],P.z-q.OZ-w[1])<60)snd(150,.08);
   if(q.seat&&q.seat.v===v&&q.seat.i==0){addHeat(q,3,'cone');if(!C.said[SV.pid]){C.said[SV.pid]=1;hwpSay('That cone had a family.')}}break}}}
/* time is up: the Highway Patrol car goes back to its loop */
function hwpPackUp(q){const H=q.hwp;if(!H)return;let bi=0,bd=1e9;HWPR.forEach((w,i)=>{const d=Math.hypot(w[0]-H.v.x,w[1]-H.v.z);if(d<bd){bd=d;bi=i}});H.wi=bi;H.spu=null}
/* while a checkpoint is on, the Highway Patrol car's "patrol" is: drive there, park, wait */
function spcDrive(q,H,v,dt,C){const S=SPCK[C.i],c=spcCar(S),d=Math.hypot(c.x-v.x,c.z-v.z);
 if(C.st=='go'){C.gt+=dt;if(C.gt>150){/* could not get there: if nobody is watching, it just appears there; otherwise call it off */const near=pcrNear(q);if(pcrMinD(near,c.x,c.z)>250&&pcrMinD(near,v.x,v.z)>250){v.x=c.x;v.z=c.z;v.h=c.h;v.v=0;v.netSnap=1;try{v.y=vehGround(q,v.x,v.z)}catch(e){}if(v.m){v.m.position.set(v.x,v.y,v.z);v.m.rotation.set(0,v.h,0)}}else{C.st='pack';C.pt=0;spcSend(q,C);hwpPackUp(q);return}}}
 if(d>5){H.spu=H.spu||{v};const ow=v.owner;v.owner=null;try{cwDrive(q,H.spu,c.x,c.z,dt,d>40?22:10,d>40?0:1)}finally{v.owner=ow}return}
 /* there: stop, then (if nobody is close enough to see it) square up neatly on the parking spot */
 if(Math.abs(v.v)>.3){hwpPhys(q,v,dt,v.v>0?-1:1,0,6);return}v.v=0;
 if((Math.abs(wrapA(v.h-c.h))>.05||d>.3)&&pcrMinD(pcrNear(q),v.x,v.z)>70){v.x=c.x;v.z=c.z;v.h=c.h;v.netSnap=1;if(v.m){v.m.position.x=v.x;v.m.position.z=v.z;v.m.rotation.y=v.h}}
 if(C.st=='go'){C.st='set';C.t=240;spcBuild(q,C);spcSend(q,C)}}
{const hp8=hwpPatrol;hwpPatrol=function(q,H,v,dt){const C=q.spc;if(C&&(C.st=='go'||C.st=='set')&&!v.wreck)return spcDrive(q,H,v,dt,C);return hp8.apply(this,arguments)}}
/* at the checkpoint, the board does the measuring: the old "faster than 30 m/s near the patrol car" rule waits */
{const hl8=hwpPlayers;hwpPlayers=function(q){const L=hl8.apply(this,arguments);try{const C=q.spc;if(SPCT&&C&&C.st=='set'&&C.x!=null&&q.hwp&&q.hwp.st=='patrol')for(const p of L)if(Math.hypot(p.x-C.x,p.z-C.z)<130)p.spd=0}catch(e){}return L}}
/* every 6 to 10 minutes of desert time, a 40 % chance (the host decides) */
{const ht8=hwpTick;hwpTick=function(q,dt){SPCT=1;let r;try{r=ht8.apply(this,arguments)}finally{SPCT=0}
  try{if(q&&q.hwp){try{CRIMES.cone='knocking over police cones';CRIMES.trailer='ramming a speed trailer'}catch(e){}
   if(q.spcN==null)q.spcN=360+Math.random()*240;if(!q.spc&&pcrHost(q)&&(q.spcN-=dt)<=0){q.spcN=360+Math.random()*240;const H=q.hwp;if(Math.random()<.4&&!H.v.wreck&&!H.v.gone&&H.st=='patrol'){const L=SPCK.map((S,i)=>i).filter(i=>!SPCK[i].test);spcStart(q,L[Math.random()*L.length|0])}}
   spcTick(q,dt)}}catch(e){conLog('error','speed checkpoint: '+e.message)}return r}}
/* the map: a red 🚨 where it is */
{const dd8=dmapDraw;dmapDraw=function(q,cv,cx,cz,sc,full){const r=dd8.apply(this,arguments);try{const C=q.spc;if(!C||!C.g||C.st!='set')return r;const x=cv.getContext('2d'),W=cv.width,H=cv.height,px=W/2+(C.x-cx)*sc,py=H/2+(C.z-cz)*sc;if(px<-20||py<-20||px>W+20||py>H+20)return r;
  const R=full?13:10;x.save();x.fillStyle='rgba(200,30,30,.92)';x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.arc(px,py,R,0,7);x.fill();x.stroke();x.font=(full?16:12)+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText('🚨',px,py+1);
  if(full){x.font='bold 12px Arial';x.fillStyle='#fff';x.strokeStyle='rgba(0,0,0,.7)';x.lineWidth=3;x.strokeText('SPEED CHECK',px,py+R+9);x.fillText('SPEED CHECK',px,py+R+9)}x.restore()}catch(e){}return r}}
