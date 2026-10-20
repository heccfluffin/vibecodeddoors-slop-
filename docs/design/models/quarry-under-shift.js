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
