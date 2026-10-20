/* =====================================================================================================
   r639 (r641: weapons.md): FORT BLACKOUT'S WEAPONS, REMODELLED. The design chat's model file docs/design/models/weapons.js,
   copied unchanged, then the wiring. Only the meshes change: every gun, mortar and missile keeps its spot and its
   game logic.
   - Sentry guns and the AA guns on the flak towers: mkTurret (a local function inside the base's Fort Blackout
     builder) now builds wpSentry / wpAA into the turret's group. That is done by build.py patches (block "weapons"):
     same signature, same group, same ry0, same entry in ML.tur (plus sp, the spinning barrel cluster, and bz, the
     gun's rest position for the recoil), same obstacle. The turret tick spins only the barrel cluster and recoils
     the gun from its own rest position (the AA gun's axle sits 15 cm forward).
   - Mortar pits: build.py swaps the call site's mkMortar(K) for wpMortar(), turned to fire north at the berm, puts
     one wpRounds() crate beside each pit instead of three ammo boxes, puffs the firing dust at the muzzle and
     kicks the tube back a little (wpMortarKick below).
   - Silo 1's missile: nkMissile (dx579) now builds wpMissile.
   - The ending cutscene's missile: mkICBM (bak519, r515) is the same missile at 0.7 scale.
   - The parked helicopter at LZ Bravo: build.py swaps the call site's mkHeli(K) for wpHeli(), the UH-9 transport
     (uh9Model, dx611), facing the same way as the drivable UH-9 that awPad (dx549) swaps in for it.
   New globals: wpKit, wpNoSeam, wpSentry, wpAA, wpMortar, wpBomb, wpRounds, wpMissile (the model file), wpHeli,
   wpMortarKick.
   ===================================================================================================== */
/* =====================================================================================================
   weapons.js: Fort Blackout's weapons, remodelled (remodel list #19, the part not done with the cars).
   Plain three.js r128, no other model file needed.

   wpSentry(gp)   the wall/ground sentry gun ('g' turrets). Builds into gp (the group at the turret's foot).
                  A bolted base plate, a gusseted pedestal with a hazard ring and a junction box, a turntable with a
                  yoke; between the cheeks a cradle with a gun shield and a six-barrel rotary gun; an ammo can on the
                  left cheek, a sensor box (camera lens + red eye) and a whip aerial on the right.
                  Returns {head, bar, sp, fl, eye}: head yaws (faces -z), bar pitches on the trunnions (+x = up),
                  sp is the barrel cluster that spins about z (spin it instead of bar), fl the muzzle flash (hidden),
                  eye the red light (own material). Footprint r 0.88, fits the 2.2 m wall platforms.
                  Muzzle at head y 0.42 (+0.93 above the foot = 1.35), 1.5 m ahead of the trunnions.
   wpAA(gp)       the anti-aircraft gun on the tower top ('aa'). Bolted plate r 1.34, pedestal, an armoured housing
                  (sloped front), twin long-barrelled guns either side on one trunnion axle, ammo drums, a rotating
                  search radar on a mast behind and a tracking dish in front. Returns {head, bar, fl, radar}:
                  fl is a group with one flash per barrel; radar spins about y. Muzzles 3.0 m ahead, x ±0.68.
   wpMortar()     a mortar on its baseplate: ribbed plate, ball socket, tube with a blast ring, bipod with an
                  elevation screw and two handwheels, a sight. Fires towards -z at 50°. Returns a Group with
                  userData.muzzle (a Vector3 in the mortar's space, (0, 1.02, -0.47)) and userData.tube (dpKeep).
   wpRounds()     an open wooden crate of three mortar bombs with the lid leaning on it (0.62 x 0.5, 0.3 high).
   wpMissile(ms)  the ICBM. Fills the group ms (removes its old meshes first, keeps anything that isn't a mesh).
                  Silo 1 size: body r 1.3, foot of the skirt at y 0, tip at y 16.3, nozzle bell down to -1.0,
                  fins out to r 2.0 (the catwalk hole is r 2.2). Two stages, an interstage, a black ogive shroud,
                  a cable raceway, an umbilical plug, painted panels and lettering (one canvas per stage).
                  ms.userData.flame is the flame group (hidden), pointing down from y -1.0.
   ===================================================================================================== */
function wpKit(){const C={};const M=(c,o)=>{const k=c+JSON.stringify(o||{});return C[k]||(C[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6,metalness:.3},o||{})))};
 const H=par=>{const A=(geo,m,x,y,z,p)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);(p||par).add(o);return o};
  const B=(w,h,d,m,x,y,z,p)=>A(new THREE.BoxGeometry(w,h,d),m,x,y,z,p);
  const Cy=(r0,r1,h,m,x,y,z,ax,p,seg,open)=>{const o=A(new THREE.CylinderGeometry(r0,r1,h,seg||16,1,!!open),m,x,y,z,p);if(ax=='x')o.rotation.z=-Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;return o};
  const V=new THREE.Vector3(),U=new THREE.Vector3(0,1,0);
  const rod=(a,b,r,m,p,seg)=>{V.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const L=V.length();const o=A(new THREE.CylinderGeometry(r,r,L,seg||8),m,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,p);o.quaternion.setFromUnitVectors(U,V.normalize());return o};
  return{A,B,Cy,rod}};
 const can=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t};
 const hazard=(n,asp)=>can(1024,Math.max(16,Math.round(1024/asp)),(x,w,h)=>{x.fillStyle='#e8b818';x.fillRect(0,0,w,h);x.fillStyle='#16161a';for(let i=-1;i<n*2;i++){x.beginPath();const s=w/n/2;x.moveTo(i*2*s,h);x.lineTo(i*2*s+s,h);x.lineTo(i*2*s+s+h,0);x.lineTo(i*2*s+h,0);x.fill()}});
 const flash=(s)=>{const t=can(64,64,(x)=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,230,1)');g.addColorStop(.3,'rgba(255,200,90,.9)');g.addColorStop(1,'rgba(255,120,20,0)');x.fillStyle=g;x.fillRect(0,0,64,64)});const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));sp.scale.setScalar(s);return sp};
 return{M,H,can,hazard,flash}}
const wpNoSeam=g=>{g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true})};

/* ---------------------------------------- the sentry gun ---------------------------------------- */
function wpSentry(gp){const k=wpKit(),M=k.M,{A,B,Cy,rod}=k.H(gp);
 const AR=M(0x4c5642,{roughness:.55,metalness:.45}),AR2=M(0x3a4232,{roughness:.65,metalness:.4}),CB=M(0x1c1e22,{roughness:.8}),FIN=M(0x5a5e64,{metalness:.85,roughness:.3}),OD=M(0x4a5236,{roughness:.8}),
  HZ=new THREE.MeshStandardMaterial({map:k.hazard(12,24),roughness:.6}),LEN=M(0x102030,{emissive:0x1060a0,emissiveIntensity:.8,roughness:.2}),EYE=new THREE.MeshStandardMaterial({color:0x400000,emissive:0xff3030});
 /* base plate, eight bolts, pedestal with four gussets, hazard ring, bearing */
 Cy(.85,.88,.08,CB,0,.04,0,null,null,24);for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.2;Cy(.045,.045,.05,FIN,Math.cos(a)*.74,.1,Math.sin(a)*.74,null,null,6)}
 Cy(.3,.4,.76,AR2,0,.46,0,null,null,20);for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4,o=B(.3,.36,.06,AR2,Math.cos(a)*.47,.25,Math.sin(a)*.47);o.rotation.y=-a}
 Cy(.309,.32,.08,HZ,0,.76,0,null,null,24);Cy(.37,.37,.1,FIN,0,.88,0,null,null,24);
 /* junction box with its conduit down to the plate, facing back (+z) */
 B(.22,.28,.16,CB,0,.42,.42);Cy(.035,.035,.22,CB,0,.18,.45,null,null,8);B(.16,.04,.02,M(0xe8b818),0,.5,.505);
 /* the head: turntable, two cheeks, trunnion caps */
 const head=new THREE.Group();head.position.y=.93;gp.add(head);const h=k.H(head);
 h.Cy(.36,.36,.06,AR2,0,.03,0,null,null,24);for(const s of[-1,1]){h.B(.08,.56,.52,AR,s*.36,.34,0);h.B(.08,.12,.4,AR2,s*.36,.68,.04).rotation.x=0;h.Cy(.085,.085,.04,FIN,s*.42,.42,0,'x',null,12)}
 /* ammo can on the left cheek (lid, handle, belt slot), sensor box on the right (lens, red eye), whip aerial */
 h.B(.2,.3,.42,OD,-.51,.32,0);h.B(.22,.03,.44,AR2,-.51,.485,0);h.rod([-.51,.5,-.08],[-.51,.54,-.04],.012,CB);h.rod([-.51,.54,-.04],[-.51,.54,.04],.012,CB);h.rod([-.51,.54,.04],[-.51,.5,.08],.012,CB);h.B(.02,.06,.16,CB,-.41,.4,0);
 h.B(.2,.16,.3,CB,.36,.69,-.02);h.Cy(.06,.06,.05,LEN,.36,.69,-.19,'z',null,14);const eye=h.A(new THREE.SphereGeometry(.025,10,8),EYE,.43,.73,-.17);h.Cy(.008,.008,.5,CB,.42,1.01,.08,null,null,5);h.Cy(.02,.02,.04,CB,.42,.78,.08,null,null,6);
 /* the gun: cradle between the cheeks, top cover, shield, collar, trunnion pins */
 const bar=new THREE.Group();bar.position.set(0,.42,0);head.add(bar);const b=k.H(bar);
 b.B(.5,.3,.6,AR,0,0,0);b.B(.44,.05,.5,AR2,0,.175,.02);b.B(.62,.4,.04,AR,0,.02,-.33);b.B(.62,.08,.04,AR2,0,.25,-.31).rotation.x=-.5;b.Cy(.13,.13,.14,AR2,0,0,-.38,'z',null,16);for(const s of[-1,1])b.Cy(.05,.05,.12,FIN,s*.3,0,0,'x',null,10);
 b.B(.2,.04,.3,CB,0,.2,.1);/* feed cover latch */
 /* six barrels round a centre rod, clamps, muzzle clamp: they spin */
 const sp=new THREE.Group();sp.position.z=-.3;bar.add(sp);const s=k.H(sp);s.Cy(.025,.025,1.2,FIN,0,0,-.6,'z',null,8);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;s.Cy(.022,.022,1.18,FIN,Math.cos(a)*.07,Math.sin(a)*.07,-.61,'z',null,8)}for(const z of[-.32,-.78])s.Cy(.11,.11,.03,AR2,0,0,z,'z',null,14);s.Cy(.105,.105,.07,CB,0,0,-1.17,'z',null,14);
 const fl=k.flash(1.1);fl.position.set(0,0,-1.62);fl.visible=false;bar.add(fl);
 for(const o of[head,bar,sp])o.userData.dpKeep=1;eye.userData.dpKeep=1;fl.userData.dpKeep=1;wpNoSeam(gp);
 return{head,bar,sp,fl,eye}}

/* ---------------------------------------- the anti-aircraft gun ---------------------------------------- */
function wpAA(gp){const k=wpKit(),M=k.M,{A,B,Cy}=k.H(gp);
 const AR=M(0x4c5642,{roughness:.55,metalness:.45}),AR2=M(0x3a4232,{roughness:.65,metalness:.4}),CB=M(0x1c1e22,{roughness:.8}),FIN=M(0x5a5e64,{metalness:.85,roughness:.3}),OD=M(0x4a5236,{roughness:.8}),
  HZ=new THREE.MeshStandardMaterial({map:k.hazard(22,40),roughness:.6}),GRID=M(0x9aa0a8,{metalness:.6,roughness:.4,side:THREE.DoubleSide});
 Cy(1.3,1.34,.1,CB,0,.05,0,null,null,28);for(let i=0;i<10;i++){const a=i/10*Math.PI*2;Cy(.055,.055,.06,FIN,Math.cos(a)*1.15,.12,Math.sin(a)*1.15,null,null,6)}
 Cy(.62,.78,.86,AR2,0,.53,0,null,null,24);for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.5,o=B(.4,.42,.07,AR2,Math.cos(a)*.86,.31,Math.sin(a)*.86);o.rotation.y=-a}
 Cy(.626,.645,.1,HZ,0,.9,0,null,null,28);Cy(.7,.7,.12,FIN,0,1.01,0,null,null,28);
 B(.3,.36,.2,CB,0,.5,.82);Cy(.04,.04,.2,CB,0,.2,.86,null,null,8);
 const head=new THREE.Group();head.position.y=1.07;gp.add(head);const h=k.H(head);
 h.Cy(.95,.95,.08,AR2,0,.04,0,null,null,28);
 /* the housing: side profile (z forward is -), extruded across x ±0.5 */
 {const sh=new THREE.Shape();sh.moveTo(-.8,.08);sh.lineTo(-.45,.75);sh.lineTo(.6,.75);sh.lineTo(.75,.6);sh.lineTo(.75,.08);sh.lineTo(-.8,.08);const geo=new THREE.ExtrudeGeometry(sh,{depth:1,bevelEnabled:false});const o=h.A(geo,AR,.5,0,0);o.rotation.y=-Math.PI/2}
 h.B(.42,.05,.42,AR2,0,.775,.15);h.rod([-.12,.8,.15],[-.12,.85,.15],.015,CB);h.rod([.12,.8,.15],[.12,.85,.15],.015,CB);h.rod([-.12,.85,.15],[.12,.85,.15],.015,CB);
 /* vision blocks on the sloped front */for(const s of[-1,1]){const o=h.B(.22,.08,.12,M(0x203040,{emissive:0x0a2030,roughness:.1}),s*.25,.58,-.36);o.rotation.x=-1.08}
 /* tracking dish in front on a short post */h.Cy(.04,.04,.24,FIN,0,.86,-.3,null,null,8);{const d=h.A(new THREE.SphereGeometry(.22,14,8,0,Math.PI*2,0,.9),GRID,0,1.0,-.32);d.rotation.x=Math.PI/2;h.Cy(.012,.012,.2,CB,0,1.0,-.42,'z',null,5)}
 /* search radar on a mast behind: it turns */
 h.Cy(.07,.09,.6,FIN,0,1.03,.42,null,null,10);const radar=new THREE.Group();radar.position.set(0,1.33,.42);head.add(radar);const r=k.H(radar);
 r.Cy(.12,.12,.12,CB,0,.06,0,null,null,12);r.B(1.5,.05,.05,FIN,0,.16,0);{const ant=r.B(1.4,.42,.03,GRID,0,.36,-.06);ant.rotation.x=-.2;for(let i=-3;i<=3;i++){const o=r.B(.02,.42,.035,FIN,i*.2,.36,-.06);o.rotation.x=-.2}}r.rod([0,.16,0],[0,.32,.35],.02,FIN);r.B(.1,.08,.1,CB,0,.34,.36);
 /* the guns: one axle through the housing, a receiver, jacket, barrel and brake each side, ammo drums */
 const bar=new THREE.Group();bar.position.set(0,.45,-.15);head.add(bar);const b=k.H(bar);
 b.Cy(.07,.07,1.56,FIN,0,0,0,'x',null,12);
 for(const s of[-1,1]){const x=s*.68;b.B(.26,.32,.9,AR,x,0,.05);b.B(.2,.06,.7,AR2,x,.19,.05);b.Cy(.1,.1,.8,AR2,x,0,-.78,'z',null,14);b.Cy(.06,.065,2.5,FIN,x,0,-1.65,'z',null,12);b.Cy(.1,.1,.24,CB,x,0,-2.98,'z',null,12);for(const z of[-2.92,-3.04])b.B(.22,.03,.05,CB,x,0,z);
  b.Cy(.25,.25,.3,OD,s*.96,0,.15,'x',null,18);b.Cy(.15,.15,.32,CB,s*.96,0,.15,'x',null,12);b.B(.08,.12,.2,AR2,s*.82,.04,.15)}
 const fl=new THREE.Group();fl.visible=false;bar.add(fl);for(const s of[-1,1]){const f=k.flash(1.6);f.position.set(s*.68,0,-3.2);fl.add(f)}
 for(const o of[head,bar,radar,fl])o.userData.dpKeep=1;wpNoSeam(gp);
 return{head,bar,fl,radar}}

/* ---------------------------------------- the mortar ---------------------------------------- */
function wpMortar(){const g=new THREE.Group(),k=wpKit(),M=k.M,{A,B,Cy,rod}=k.H(g);
 const MT=M(0x3a4232,{metalness:.55,roughness:.5}),DK=M(0x222426,{roughness:.7}),FIN=M(0x5a5e64,{metalness:.8,roughness:.3}),OD=M(0x4a5236,{roughness:.8});
 /* the baseplate: round, six ribs, three spades, the ball socket */
 Cy(.42,.45,.06,DK,0,.03,.3,null,null,20);for(let i=0;i<6;i++){const a=i/6*Math.PI*2,o=B(.34,.05,.04,MT,Math.cos(a)*.2,.085,.3+Math.sin(a)*.2);o.rotation.y=-a}
 for(let i=0;i<3;i++){const a=i/3*Math.PI*2+Math.PI/2;const o=B(.12,.06,.04,DK,Math.cos(a)*.4,.03,.3+Math.sin(a)*.4);o.rotation.y=-a}
 A(new THREE.SphereGeometry(.09,12,8),MT,0,.11,.3);
 /* the tube at 50°: rises towards -z */const el=50*Math.PI/180,d=[0,Math.sin(el),-Math.cos(el)],at=t=>[0,.11+d[1]*t,.3+d[2]*t];
 const tube=new THREE.Group();g.add(tube);const T=k.H(tube);T.rod(at(0),at(1.2),.06,MT,null,14);{const m=at(1.17);T.rod(at(1.13),at(1.21),.078,DK,null,14);const c=at(.75);T.rod(at(.7),at(.8),.085,FIN,null,14)}
 /* the bipod: two legs from the collar to spread feet, a crossbar, the elevation screw with its handwheel, the traverse wheel */
 const c=at(.75),ft=s=>[s*.42,.03,-.62];for(const s of[-1,1]){rod([c[0]+s*.05,c[1]-.04,c[2]],ft(s),.025,MT);B(.1,.03,.14,DK,s*.42,.015,-.62)}
 const cb=s=>{const f=ft(s),u=.62;return[c[0]+s*.05+(f[0]-c[0]-s*.05)*u,c[1]-.04+(f[1]-c[1]+.04)*u,c[2]+(f[2]-c[2])*u]};rod(cb(-1),cb(1),.02,MT);
 {const m=cb(1),bot=[0,m[1],m[2]];rod(bot,[0,c[1]-.09,c[2]+.02],.03,FIN);const hw=A(new THREE.TorusGeometry(.07,.012,6,16),DK,0,bot[1]-.02,bot[2]);hw.rotation.x=Math.PI/2;rod([0,bot[1]-.02,bot[2]],[.07,bot[1]-.02,bot[2]],.008,DK)}
 {const w=A(new THREE.TorusGeometry(.06,.012,6,16),DK,.15,c[1]-.06,c[2]+.02);w.rotation.y=Math.PI/2;rod([.08,c[1]-.06,c[2]+.02],[.15,c[1]-.06,c[2]+.02],.012,MT)}
 /* the sight on the left of the collar */B(.06,.1,.14,OD,-.14,c[1]+.02,c[2]+.02);Cy(.022,.022,.08,DK,-.14,c[1]+.04,c[2]+.12,'z',null,8);Cy(.03,.03,.04,M(0x203040,{emissive:0x0a2030}),-.14,c[1]+.09,c[2]-.02,null,null,10);
 g.userData.muzzle=new THREE.Vector3(...at(1.2));g.userData.tube=tube;tube.userData.dpKeep=1;wpNoSeam(g);return g}
function wpBomb(){const g=new THREE.Group(),k=wpKit(),M=k.M,{A,B,Cy}=k.H(g);const OL=M(0x55603e,{roughness:.6}),FZ=M(0xb08a40,{metalness:.7,roughness:.35}),FN=M(0x3a3e40,{metalness:.5});
 const pts=[[.022,.12],[.05,.17],[.06,.24],[.056,.32],[.036,.38],[.014,.41],[0,.412]].map(p=>new THREE.Vector2(p[0],p[1]));A(new THREE.LatheGeometry(pts,14),OL,0,0,0);Cy(.022,.022,.012,OL,0,.12,0,null,null,14);
 Cy(.016,.016,.14,FN,0,.06,0,null,null,8);for(let i=0;i<4;i++){const a=i*Math.PI/2;const o=B(.04,.08,.004,FN,Math.cos(a)*.03,.04,Math.sin(a)*.03);o.rotation.y=-a+Math.PI/2}Cy(.012,.016,.04,FZ,0,.43,0,null,null,10);
 const band=Cy(.0605,.0605,.02,M(0xd8c020),0,.27,0,null,null,14);return g}
function wpRounds(){const g=new THREE.Group(),k=wpKit(),M=k.M,{B}=k.H(g);const WD=M(0x7a5a34,{roughness:.9,metalness:0}),WD2=M(0x6a4c2c,{roughness:.9,metalness:0});
 B(.6,.03,.46,WD,0,.035,0);for(const s of[-1,1]){B(.6,.22,.03,WD,0,.14,s*.23);B(.03,.22,.43,WD2,s*.285,.14,0)}for(const s of[-1,1])B(.62,.04,.03,WD2,0,.03,s*.22);
 for(let i=0;i<3;i++){const b=wpBomb();b.rotation.z=Math.PI/2;b.position.set(.2,.12,-.13+i*.13);g.add(b)}
 const lid=B(.6,.03,.46,WD2,0,0,0);lid.position.set(0,.18,.33);lid.rotation.x=-1.25;lid.position.y=.2;{const t=k.can(256,64,(x,w,h)=>{x.fillStyle='#6a4c2c';x.fillRect(0,0,w,h);x.fillStyle='#e8e0c0';x.font='bold 30px DoorsSans,Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('81MM · HE · 3',w/2,h/2+2)});const p=new THREE.Mesh(new THREE.PlaneGeometry(.5,.12),new THREE.MeshStandardMaterial({map:t,roughness:.9}));p.position.set(0,.016,0);p.rotation.set(-Math.PI/2,0,Math.PI);lid.add(p)}
 wpNoSeam(g);return g}

/* ---------------------------------------- the missile ---------------------------------------- */
function wpMissile(ms){for(let i=ms.children.length-1;i>=0;i--){const c=ms.children[i];if(c.isMesh)ms.remove(c)}
 const k=wpKit(),M=k.M,{A,B,Cy,rod}=k.H(ms);const GR=M(0x6a6e74,{metalness:.7,roughness:.3}),DK=M(0x1a1a1c,{roughness:.5,metalness:.3}),RD=M(0xb01818,{roughness:.5}),SH=M(0x16161a,{roughness:.35,metalness:.2});
 const F='DoorsSans,Arial,sans-serif';
 /* stage 1 skin: panel seams, a black-and-white roll pattern at the top, DARK ARMY up both sides, a hatch, stencils. u=0 is +z (under the raceway) */
 const t1=k.can(1024,768,(x,w,h)=>{x.fillStyle='#ecece6';x.fillRect(0,0,w,h);x.fillStyle='#16161a';x.fillRect(0,0,w/4,150);x.fillRect(w/2,0,w/4,150);
  x.strokeStyle='rgba(60,60,60,.45)';x.lineWidth=2;for(const y of[150,420,640]){x.beginPath();x.moveTo(0,y);x.lineTo(w,y);x.stroke()}for(let i=1;i<8;i++){x.beginPath();x.moveTo(i*w/8,150);x.lineTo(i*w/8,h);x.stroke()}
  x.fillStyle='rgba(80,80,80,.5)';for(let i=0;i<64;i++){x.fillRect(i*16+6,416,3,3);x.fillRect(i*16+6,636,3,3)}
  x.fillStyle='#16161a';x.font='bold 96px '+F;x.textAlign='center';x.textBaseline='middle';for(const u of[.25,.75]){x.save();x.translate(u*w,450);x.rotate(-Math.PI/2);x.fillText('DARK ARMY',0,0);x.restore()}
  x.save();x.translate(.5*w,480);x.rotate(-Math.PI/2);x.font='bold 44px '+F;x.fillText('DA-7 BLACKOUT',0,0);x.restore();
  x.strokeStyle='#3a3a3a';x.lineWidth=3;x.strokeRect(.62*w-45,480,90,130);x.fillStyle='#3a3a3a';for(const[a,b]of[[-40,485],[40,485],[-40,605],[40,605]])x.fillRect(.62*w+a-3,b-3,6,6);
  x.font='bold 22px '+F;x.fillText('ACCESS 3',.62*w,620+18);x.fillStyle='#b01818';x.fillText('▲ NO STEP',.38*w,300);x.fillText('▲ NO STEP',.88*w,300);x.fillStyle='#16161a';x.font='18px '+F;x.fillText('LIFT POINT',.12*w,700)});
 const t2=k.can(1024,512,(x,w,h)=>{x.fillStyle='#ecece6';x.fillRect(0,0,w,h);x.fillStyle='#16161a';x.fillRect(w/4,h-90,w/4,90);x.fillRect(.75*w,h-90,w/4,90);x.strokeStyle='rgba(60,60,60,.45)';x.lineWidth=2;for(let i=1;i<6;i++){x.beginPath();x.moveTo(i*w/6,0);x.lineTo(i*w/6,h-90);x.stroke()}
  x.fillStyle='#16161a';x.font='bold 54px '+F;x.textAlign='center';x.textBaseline='middle';for(const u of[.25,.75]){x.save();x.translate(u*w,200);x.rotate(-Math.PI/2);x.fillText('STAGE 2',0,0);x.restore()}x.font='bold 30px '+F;x.fillText('☢ HANDLE WITH CARE',.5*w,140)});
 const t3=k.can(512,64,(x,w,h)=>{x.fillStyle='#4a4e54';x.fillRect(0,0,w,h);x.fillStyle='#2a2c30';for(let i=0;i<32;i++)x.fillRect(i*16,0,5,h)});
 const W1=new THREE.MeshStandardMaterial({map:t1,roughness:.45,metalness:.2}),W2=new THREE.MeshStandardMaterial({map:t2,roughness:.45,metalness:.2}),IS=new THREE.MeshStandardMaterial({map:t3,roughness:.4,metalness:.6});
 /* the aft skirt, the nozzle bell and its base */
 Cy(1.3,1.4,.92,GR,0,.45,0,null,null,32);Cy(1.2,1.2,.04,DK,0,.01,0,null,null,32);Cy(.5,.6,.3,DK,0,-.1,0,null,null,20);
 Cy(.42,.9,1.1,M(0x3a3a3c,{metalness:.8,roughness:.35,side:THREE.DoubleSide}),0,-.45,0,null,null,24,true);Cy(.905,.905,.06,GR,0,-.98,0,null,null,24,true);
 /* stage 1, the raceway, the umbilical plug, a band of rivets at the joint */
 Cy(1.3,1.3,6.12,W1,0,3.95,0,null,null,40,true);Cy(1.312,1.312,.12,GR,0,.95,0,null,null,40,true);
 B(.18,5.7,.1,GR,0,3.95,1.33);for(let y=1.4;y<6.8;y+=.6)B(.24,.04,.12,DK,0,y,1.34);
 B(.36,.5,.12,GR,0,6.1,-1.33);Cy(.08,.08,.08,DK,0,6.1,-1.4,'z',null,10);B(.4,.06,.14,DK,0,6.38,-1.33);
 /* fins: four swept fins on the skirt, out to r 2.0 */
 {const sh=new THREE.Shape();sh.moveTo(1.28,.12);sh.lineTo(2.0,.3);sh.lineTo(2.0,1.0);sh.lineTo(1.28,2.1);sh.lineTo(1.28,.12);const geo=new THREE.ExtrudeGeometry(sh,{depth:.08,bevelEnabled:false});geo.translate(0,0,-.04);
  for(let i=0;i<4;i++){const f=new THREE.Mesh(geo,GR);f.rotation.y=i*Math.PI/2+Math.PI/4;ms.add(f);const tip=new THREE.Mesh(new THREE.BoxGeometry(.04,.72,.1),DK);tip.position.set(2.0,.65,0);const pv=new THREE.Group();pv.rotation.y=f.rotation.y;pv.add(tip);ms.add(pv)}}
 /* interstage, stage 2, red band, equipment ring */
 Cy(1.24,1.3,.82,IS,0,7.4,0,null,null,40,true);Cy(1.22,1.22,3.84,W2,0,9.7,0,null,null,40,true);Cy(1.232,1.232,.3,RD,0,10.95,0,null,null,40,true);Cy(1.18,1.22,.52,GR,0,11.85,0,null,null,40,true);
 for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;const o=B(.2,.12,.06,DK,Math.sin(a)*1.215,8.3,Math.cos(a)*1.215);o.rotation.y=a}
 /* the shroud: an ogive from r 1.18 to a point, a metal tip */
 {const pts=[];for(let i=0;i<=16;i++){const t=i/16;pts.push(new THREE.Vector2(Math.max(0,1.18*Math.sqrt(Math.max(0,1-t*t))*(1-.12*t)),12.1+4.2*t))}A(new THREE.LatheGeometry(pts,40),SH,0,0,0);A(new THREE.SphereGeometry(.07,10,8),GR,0,16.27,0);
  const seam=Cy(1.185,1.185,.03,GR,0,12.12,0,null,null,40,true)}
 /* the flame */
 const fl=new THREE.Group();fl.position.y=-1.0;ms.add(fl);
 const o1=new THREE.Mesh(new THREE.ConeGeometry(1.1,9,18,1,true),new THREE.MeshBasicMaterial({color:0xff8a30,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));o1.rotation.x=Math.PI;o1.position.y=-4.5;fl.add(o1);
 const o2=new THREE.Mesh(new THREE.ConeGeometry(.6,5,14,1,true),new THREE.MeshBasicMaterial({color:0xfff6d0,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide}));o2.rotation.x=Math.PI;o2.position.y=-2.5;fl.add(o2);
 const gl=k.flash(5);gl.position.y=-.6;fl.add(gl);fl.visible=false;ms.userData.flame=fl;
 ms.traverse(m=>{if(m.isMesh){m.userData.noSeam=true;m.userData.dpKeep=1}});return ms}

/* ---------------------------------------- wiring ---------------------------------------- */
/* LZ Bravo's parked transport helicopter: the UH-9 model as it is (nose to -z). The old model's nose pointed to +z,
   but about a second after you start walking around, awPad (dx549) hides this prop (it looks for userData.rotor and
   userData.tail near the pad) and parks the real, drivable UH-9 in its place at the same heading, and that one's
   nose points to -z. Not turning it round keeps that swap seamless. The pad's anim spins userData.rotor (about y)
   and userData.tail (about x). */
function wpHeli(){const g=new THREE.Group();uh9Model(g,0);
 const r=g.userData.rotor,t=g.userData.tailR;if(r)r.userData.dpKeep=1;if(t)t.userData.dpKeep=1;g.userData.tail=t;
 g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});return g}
/* a fired mortar's tube kicks 5 cm back along itself and settles over 0.2 s */
function wpMortarKick(m){const T=m&&m.userData.tube;if(!T)return;const el=50*Math.PI/180,t0=performance.now();
 const st=()=>{const u=Math.min(1,(performance.now()-t0)/200),k=.05*(1-u);T.position.set(0,-Math.sin(el)*k,Math.cos(el)*k);if(u<1)requestAnimationFrame(st)};st()}
/* Silo 1 */
nkMissile=function(ms){return wpMissile(ms)};
/* the ending cutscene: the same missile at 0.7 scale. The cutscene toggles visible on every item of userData.flame. */
mkICBM=function(){const g=new THREE.Group(),m=new THREE.Group();g.add(m);wpMissile(m);m.scale.setScalar(.7);g.userData.flame=[m.userData.flame];return g};
