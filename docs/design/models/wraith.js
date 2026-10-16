/* =====================================================================================================
   The X-13 WRAITH, remodelled, with all six refit marks.
     wraithModel(g, wheels)  builds the Wraith into the group g. Replaces protoModel(g, T) (bak519): call it as
                             protoModel = (g, T) => wraithModel(g, T.wheels).
     wraithMarks(m, l)       (re)builds the refit parts for mark l (0 … 6) on a model made by wraithModel. Replaces the
                             drawing part of wkBuild (dx554): everything from "const M=…" to the "MK" decal. Keep the
                             line that ends wkBuild (v.wkA = l). Safe to call again with another mark: it removes the
                             old parts and repaints.
   ORIGIN    Centre on the ground.   FRONT  -z.
   SIZE      Hull 2.4 wide, sponsons and skirts to 3.75 wide (x ±1.87), nose z -3.95, tail z 3.45 (afterburners to 3.95),
             deck 1.5 m, turret roof 2.1 m, barrels to z -4.4 (turret straight ahead).
             VEHK.proto stays w 3.0, len 6.6 (as before; the old model was this size too).
   WHEELS    3 a side at x ±1.55, z -2.2 / 0 / 2.2, r 0.5. Pushed as {p, t, front:0, tank:1}; each tyre has t.userData.r = 0.5.
             The game rolls tank wheels by v.v·dt/0.34: please use (w.t.userData.r || .34) so they don't look like
             they skid.
   HOOKS (same names as now)
     userData.tur      turret Group at (0, 1.4, 0.2), turns on y
     userData.bar      gun Group at (0, 0.3, -1.4) in tur, pitches on x; muzzles at bar z -3.0
     userData.radar    spins on y (protoTick)
     userData.mf       muzzle flash (glowSp sprite at bar z -3.2, hidden)
     meshes with userData.ex = 1: exhaust glows (protoTick sets their emissiveIntensity)
     Rocket pods on the turret cheeks at x ±1.18, y 0.35 (world 1.75): where milRockets launches from.
     From wraithMarks: userData.wkG / wkT / wkB (mark groups on hull / turret / gun), wkBub (Mk IV shield bubble, same
     size as now), rws / rwsP / rwsS / rwsT / rwsF (the gunner's remote minigun: mount at (0, 2.34, 2.3), pitch group,
     spinning barrels, muzzle tip, flash), exactly as wkBuild made them.
   ANIMATION (all already in the game): radar spin, exhaust glow pulse, turret/gun aim, minigun aim + spin, shield
     flash. Nothing new needed.
   ===================================================================================================== */
function wraithModel(g,wheels){
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.5,metalness:.5},o||{}));
 /* a panel-line texture for the armour: thin seams and a few rivets, multiplied by the paint colour */
 const panelTex=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const k=c.getContext('2d');k.fillStyle='#d8d8d8';k.fillRect(0,0,256,256);
  k.fillStyle='#9a9a9a';k.fillRect(0,0,256,3);k.fillRect(0,0,3,256);k.fillRect(0,126,256,2);k.fillRect(170,0,2,126);k.fillRect(84,128,2,128);
  k.fillStyle='#888';for(const[x,y]of[[10,10],[246,10],[10,118],[160,118],[180,10],[94,140],[246,140],[94,246],[10,246]]){k.beginPath();k.arc(x,y,2.5,0,7);k.fill()}
  for(let i=0;i<300;i++){k.fillStyle='rgba(0,0,0,'+(Math.random()*.05)+')';k.fillRect(Math.random()*256,Math.random()*256,2+Math.random()*6,1)}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(.55,.55);return t})();
 const OL=M(0x2a2f36,{map:panelTex,roughness:.5,metalness:.5}),OE=M(0x3e4650,{map:panelTex,roughness:.45,metalness:.55}),OD=M(0x15181c,{roughness:.6,metalness:.5}),
  BL=M(0x40c0ff,{emissive:0x2090e0,emissiveIntensity:.9}),RD=M(0xa02020,{emissive:0x600000}),FIN=M(0x5a5e64,{metalness:.8,roughness:.3}),
  HL=M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.8,roughness:.1}),GN=M(0x1a1c1f,{metalness:.8,roughness:.3}),rub=M(0x16171a,{roughness:.95,metalness:0});
 g.userData.paint={OL,OE};/* wraithMarks repaints these two for the Mk VI */
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const CYL=(r1,r2,len,m,x,y,z,ax,p,seg)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,seg||14),m);o.position.set(x,y,z);if(ax=='x')o.rotation.z=Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;(p||g).add(o);return o};
 const B_T=.03;
 /* a side profile [z, y] extruded across x, centred on x (total width w, bevel included) */
 const ext=(pts,w,m,x,p,bev)=>{const bt=bev==null?B_T:bev;const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))s.lineTo(q[0],q[1]);s.lineTo(pts[0][0],pts[0][1]);
  const geo=new THREE.ExtrudeGeometry(s,{depth:w-2*bt,bevelEnabled:bt>0,bevelThickness:bt,bevelSize:bt,bevelSegments:1,curveSegments:8});const o=new THREE.Mesh(geo,m);o.rotation.y=-Math.PI/2;o.position.x=(x||0)+(w-2*bt)/2;(p||g).add(o);return o};
 const decal=(w,h,draw)=>{const c=document.createElement('canvas');c.width=256;c.height=Math.max(8,Math.round(256*h/w));draw(c.getContext('2d'),c.width,c.height);
  return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),transparent:true,alphaTest:.2,roughness:.5,metalness:.3}))};
 const glow=(c,op,sz)=>{if(typeof glowSp=='function')return glowSp(c,op,sz);const cv=document.createElement('canvas');cv.width=cv.height=64;const k=cv.getContext('2d');const gr=k.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');k.fillStyle=gr;k.fillRect(0,0,64,64);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),color:c,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false}));s.scale.setScalar(sz);return s};

 /* ---------------- hull: a low stealth wedge ---------------- */
 ext([[-3.3,.5],[3.2,.5],[3.45,.8],[3.45,1.42],[1.1,1.5],[-1.3,1.42],[-3.95,1.08],[-3.95,.92]],2.4,OL);
 /* sponsons over the wheels (top shelf), and the skirts hanging over the tyres */
 for(const sd of[-1,1]){ext([[-3.55,1.04],[3.3,1.04],[3.38,1.12],[3.3,1.3],[-3.0,1.32],[-3.62,1.12]],.62,OE,sd*1.53);
  ext([[-3.15,.66],[3.0,.66],[3.12,.8],[3.12,1.06],[-3.35,1.06],[-3.35,.86]],.08,OL,sd*1.83,null,.015);
  BX(.025,.05,6.0,BL,sd*1.875,.7,-.08);/* blue light strip along the skirt's bottom edge */
  for(let i=0;i<5;i++)BX(.02,.36,.03,OD,sd*1.874,.86,-2.4+i*1.15);/* skirt panel seams */
  /* the suspension: a trailing arm from the hull to each hub, and a shock */
  for(const z of[-2.2,0,2.2]){const a=BX(.14,.12,.6,GN,sd*1.26,.56,z+.22);a.rotation.x=-.25;CYL(.05,.05,.5,FIN,sd*1.24,.86,z+.32,null,null,8)}}
 /* nose: the vision slit, headlights in armoured housings, tow eyes */
 {const s=decal(1.4,.12,(k,w,h)=>{k.fillStyle='#0a1a26';k.fillRect(0,0,w,h);k.fillStyle='#40c0ff';k.globalAlpha=.85;k.fillRect(4,3,w-8,h-6)});s.material=new THREE.MeshStandardMaterial({map:s.material.map,emissive:0x2090e0,emissiveIntensity:.8,emissiveMap:s.material.map});
  /* the upper glacis runs from (z -3.95, y 1.08) up to (-1.3, 1.42): slope 0.128 rad */s.rotation.x=-Math.PI/2-.128;s.position.set(0,1.08+(3.95-3.6)*.128+.008,-3.6);g.add(s)}
 for(const sd of[-1,1]){BX(.42,.22,.2,OD,sd*.85,1.0,-3.98);BX(.32,.12,.03,HL,sd*.85,1.0,-4.09);BX(.03,.16,.04,FIN,sd*.85,1.0,-4.115);/* lens and a centre bar */
  const te=new THREE.Mesh(new THREE.TorusGeometry(.08,.025,6,12),FIN);te.position.set(sd*.45,.72,-3.62);te.rotation.y=Math.PI/2;g.add(te);BX(.1,.08,.1,FIN,sd*.45,.72,-3.55)}
 BX(.42,.06,.05,BL,-.85,1.225,-3.08);BX(.42,.06,.05,BL,.85,1.225,-3.08);/* running lights on the glacis edge */
 /* engine deck: two grilles, the hatch, a rear light bar; rear plate with exhaust ports that glow */
 {const c=document.createElement('canvas');c.width=128;c.height=128;const k=c.getContext('2d');k.fillStyle='#0c0e10';k.fillRect(0,0,128,128);k.fillStyle='#3a4048';for(let i=6;i<128;i+=12)k.fillRect(6,i,116,6);
  const gm=M(0xffffff,{map:new THREE.CanvasTexture(c),metalness:.6,roughness:.4});for(const sd of[-1,1]){const p=BX(.6,.03,1.2,gm,sd*.68,1.47,1.8);p.rotation.x=-.034}}
 BX(1.1,.08,.06,RD,0,1.3,3.47);for(const sd of[-1,1]){BX(.28,.28,.12,OD,sd*.4,1.0,3.5);const e=BX(.22,.22,.03,M(0x4080ff,{emissive:0x2060ff,emissiveIntensity:1.2}),sd*.4,1.0,3.575);e.userData.ex=1}
 /* the X-13 name on the skirts */
 {const d=(k,w,h)=>{k.clearRect(0,0,w,h);k.fillStyle='#40c0ff';k.font='bold '+Math.round(h*.78)+'px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';k.textAlign='center';k.textBaseline='middle';k.fillText('X-13  WRAITH',w/2,h/2+1,w-6)};
  for(const sd of[-1,1]){const p=decal(1.5,.22,d);p.position.set(sd*1.846,1.19,.3);/* on the sponson's outer face */p.rotation.y=sd*Math.PI/2;g.add(p)}}
 /* ---------------- wheels: tread, a dark rim, a glowing hub ring, six lugs. Hub parts sit inside t, so they roll ---------------- */
 const tread=(()=>{const c=document.createElement('canvas');c.width=64;c.height=64;const k=c.getContext('2d');k.fillStyle='#1a1a1c';k.fillRect(0,0,64,64);k.fillStyle='#0a0a0b';for(let i=0;i<64;i+=16){k.fillRect(0,i,28,7);k.fillRect(36,i+8,28,7)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,6);return t})();
 for(const sd of[-1,1])for(const z of[-2.2,0,2.2]){const p=new THREE.Group();p.position.set(sd*1.55,.5,z);g.add(p);
  const t=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.42,24),[M(0xffffff,{map:tread,roughness:.95,metalness:0}),rub,rub]);t.rotation.z=Math.PI/2;t.userData.r=.5;p.add(t);
  t.add(new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.43,16),OD));const ring=new THREE.Mesh(new THREE.TorusGeometry(.22,.03,6,20),BL);ring.rotation.x=Math.PI/2;ring.position.y=sd*.218;t.add(ring);
  t.add(new THREE.Mesh(new THREE.CylinderGeometry(.13,.15,.47,10),FIN));for(let i=0;i<6;i++){const a=i/6*6.283,l=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.45,6),GN);l.position.set(Math.cos(a)*.28,0,Math.sin(a)*.28);t.add(l)}
  wheels.push({p,t,front:0,tank:1})}
 /* the underside: a dark belly between the wheels */BX(2.3,.04,6.4,OD,0,.49,-.05);

 /* ---------------- turret ---------------- */
 const tur=new THREE.Group();tur.position.set(0,1.4,.2);g.add(tur);
 CYL(.95,.98,.1,OD,0,.08,0,null,tur,28);/* turret ring, sunk into the deck */
 ext([[-1.3,.1],[1.15,.1],[1.25,.32],[1.1,.66],[-.65,.7],[-1.35,.38]],1.8,OL,0,tur);
 ext([[-.6,.66],[.9,.66],[.95,.72],[-.5,.74]],1.3,OE,0,tur,.015);/* raised roof plate */
 /* rocket pods on arms (milRockets fires from x ±1.18, y .35) */
 for(const sd of[-1,1]){BX(.3,.12,.5,GN,sd*.98,.35,.15,tur);ext([[-.52,.07],[.75,.07],[.8,.12],[.8,.6],[.7,.63],[-.52,.63]],.56,OD,sd*1.18,tur,.02);
  BX(.5,.5,.03,OE,sd*1.18,.35,-.55,tur);for(let i=0;i<4;i++){const h=CYL(.09,.09,.06,RD,sd*1.18+(i%2?.13:-.13),.35+(i<2?.13:-.13),-.57,'z',tur,10);const r=new THREE.Mesh(new THREE.TorusGeometry(.1,.015,5,12),GN);r.position.set(h.position.x,h.position.y,-.575);tur.add(r)}
  /* smoke launchers on the front corners, angled out */for(let i=0;i<3;i++){const sm=CYL(.05,.05,.28,OD,sd*(.55+i*.14),.78,-.62,null,tur,8);sm.rotation.set(-.7,0,sd*-.25)}}
 /* sensor head with a red lamp, commander's cupola, the radar on its mast */
 BX(.05,.9,.05,FIN,.55,1.16,.7,tur);BX(.18,.14,.16,OD,.55,1.66,.7,tur);BX(.06,.06,.03,RD,.55,1.66,.615,tur);
 CYL(.28,.3,.16,OE,-.35,.82,.2,null,tur,16);for(let i=0;i<6;i++){const a=i/6*6.283;BX(.08,.05,.02,M(0x203040,{emissive:0x104060}),-.35+Math.sin(a)*.29,.84,.2+Math.cos(a)*.29,tur).rotation.y=a}
 const rd=new THREE.Group();rd.position.set(-.5,1.08,.85);tur.add(rd);BX(.05,.4,.05,FIN,0,-.18,0,rd);CYL(.06,.06,.05,GN,0,.02,0,null,rd);const dish=BX(.72,.04,.24,M(0x9aa0a8,{metalness:.6,roughness:.3}),0,.08,0,rd);dish.rotation.x=.3;
 g.userData.radar=rd;
 /* ---------------- the twin 40 mm in a mantlet ---------------- */
 const bar=new THREE.Group();bar.position.set(0,.3,-1.4);tur.add(bar);
 ext([[-.4,-.27],[.2,-.27],[.2,.27],[-.4,.27],[-.5,.15],[-.5,-.15]],1.05,OE,0,bar);
 for(const sd of[-1,1]){CYL(.15,.15,1.0,OD,sd*.25,0,-.95,'z',bar,14);CYL(.1,.11,1.8,GN,sd*.25,0,-2.0,'z',bar,12);/* thermal jacket, then the barrel */
  for(const z of[-2.8,-2.95])CYL(.135,.135,.05,OD,sd*.25,0,z,'z',bar,12);CYL(.12,.12,.25,GN,sd*.25,0,-2.875,'z',bar,12);/* muzzle brake */
  CYL(.07,.07,.02,M(0x050505),sd*.25,0,-3.0,'z',bar,10)}
 CYL(.04,.04,1.2,GN,.6,.1,-.9,'z',bar,8);/* coax */
 const mf=glow(0xffd080,1,2.2);mf.position.set(0,0,-3.2);mf.visible=false;bar.add(mf);
 g.userData.tur=tur;g.userData.bar=bar;g.userData.mf=mf;return g}

function wraithMarks(m,l){const u=m.userData;if(!u.tur||!u.bar)return;l=Math.max(0,Math.min(6,l|0));
 for(const k of['wkG','wkT','wkB']){if(u[k]&&u[k].parent)u[k].parent.remove(u[k]);u[k]=null}u.wkBub=null;
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.5,metalness:.5},o||{})),G=new THREE.Group(),TG=new THREE.Group(),BG=new THREE.Group();m.add(G);u.tur.add(TG);u.bar.add(BG);u.wkG=G;u.wkT=TG;u.wkB=BG;
 const BX=(p,w,h,d,mt,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mt);o.position.set(x,y,z);p.add(o);return o},CY=(p,r1,r2,h,mt,x,y,z,seg)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg||12),mt);o.position.set(x,y,z);p.add(o);return o};
 const AR=M(0x343b44,{roughness:.55}),AR2=M(0x262b31),GN=M(0x1a1c1f,{metalness:.8,roughness:.3}),GD=M(0xd8aa40,{metalness:.9,roughness:.25,emissive:0x302000}),CYM=M(0x40e0ff,{emissive:0x20b0ff,emissiveIntensity:1.3}),RD=M(0xa02020,{emissive:0x600000}),BLT=M(0x6a6e72,{metalness:.7,roughness:.3});
 /* an armour tile with four bolt heads on its face; n = outward axis 'x+','x-','y' */
 const tile=(p,w,h,d,x,y,z,ax,mt)=>{const t=BX(p,w,h,d,mt||AR,x,y,z);const fx=ax=='y'?0:(ax=='x+'?1:-1);for(const a of[-1,1])for(const b of[-1,1]){const bo=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.02,6),BLT);
   if(ax=='y'){bo.position.set(a*(w/2-.07),h/2+.01,b*(d/2-.07))}else{bo.rotation.z=Math.PI/2;bo.position.set(fx*(w/2+.01),a*(h/2-.06),b*(d/2-.07))}t.add(bo)}return t};
 /* ---- the remote minigun mount on the engine deck (every Wraith has it: the gunner's seat drives it) ---- */
 CY(G,.24,.3,.84,AR2,0,1.88,2.3,14);CY(G,.32,.32,.06,GN,0,2.31,2.3,18);const rw=new THREE.Group();rw.position.set(0,2.34,2.3);G.add(rw);BX(rw,.5,.14,.54,AR,0,.05,0);for(const sd of[-1,1])BX(rw,.06,.34,.32,AR,sd*.22,.25,0);
 const rp=new THREE.Group();rp.position.set(0,.3,0);rw.add(rp);CY(rp,.09,.09,.5,GN,0,0,0).rotation.z=Math.PI/2;BX(rp,.26,.22,.52,AR2,0,0,-.05);BX(rp,.2,.26,.34,M(0x4a5a30,{roughness:.8}),.28,-.04,.02);/* ammo can */
 BX(rp,.13,.13,.22,GN,-.18,.08,-.1);BX(rp,.09,.07,.02,M(0x203040,{emissive:0x2060a0}),-.18,.08,-.215);/* sight */
 const sp=new THREE.Group();sp.position.set(0,0,-.31);rp.add(sp);for(let i=0;i<6;i++){const a=i/6*6.283;const b=CY(sp,.025,.025,.9,GN,Math.cos(a)*.065,Math.sin(a)*.065,-.45,8);b.rotation.x=Math.PI/2}for(const z of[-.25,-.85]){const r=CY(sp,.11,.11,.05,AR2,0,0,z,12);r.rotation.x=Math.PI/2}
 const tip=new THREE.Object3D();tip.position.set(0,0,-1.0);sp.add(tip);let fl=null;try{fl=(typeof glowSp=='function')?glowSp(0xffc060,.9,.7):null;if(fl){fl.position.set(0,0,-1.05);sp.add(fl);fl.visible=false}}catch(e){}u.rws=rw;u.rwsP=rp;u.rwsS=sp;u.rwsT=tip;u.rwsF=fl;
 /* ---- Mk I: reactive armour, bolted on ---- */if(l>=1){
  /* on the upper glacis: two rows, lying on the slope (y = 1.08 + (z+3.95)·0.128) */for(const z of[-3.2,-2.6])for(const x of[-.78,-.26,.26,.78]){const t=tile(G,.48,.1,.5,x,1.08+(z+3.95)*.128+.06,z,'y');t.rotation.x=-.128}
  for(const sd of[-1,1]){for(let i=0;i<5;i++)tile(G,.1,.3,1.05,sd*1.92,.88,-2.35+i*1.15,sd>0?'x+':'x-',i%2?AR:AR2);/* skirt tiles, 2 cm off the skirt */
   tile(TG,.1,.3,.5,sd*.96,.33,-.9,sd>0?'x+':'x-')}}/* turret cheeks, in front of the rocket pods */
 /* ---- Mk II: a second pair of rocket pods on top of the first ---- */if(l>=2){for(const sd of[-1,1]){BX(TG,.52,.42,1.15,AR2,sd*1.18,.84,.15);BX(TG,.54,.05,1.17,AR,sd*1.18,1.07,.15);BX(TG,.5,.42,.03,AR,sd*1.18,.84,-.445);
  for(let i=0;i<4;i++){const h=CY(TG,.08,.08,.06,RD,sd*1.18+(i%2?.13:-.13),.84+(i<2?.11:-.11),-.45,8);h.rotation.x=Math.PI/2}}}
 /* ---- Mk III: afterburners on the tail, with their ducts along the deck ---- */if(l>=3){for(const sd of[-1,1]){const n=new THREE.Mesh(new THREE.CylinderGeometry(.3,.36,.5,18,1,true),M(0x1a1c1f,{metalness:.8,roughness:.3,side:THREE.DoubleSide}));n.position.set(sd*1.0,1.12,3.7);n.rotation.x=Math.PI/2;G.add(n);/* open at the back so the glow shows */const lip=new THREE.Mesh(new THREE.TorusGeometry(.33,.04,6,18),AR);lip.position.set(sd*1.0,1.12,3.95);G.add(lip);
   const gl=CY(G,.33,.33,.03,M(0x4080ff,{emissive:0x2060ff,emissiveIntensity:1.2}),sd*1.0,1.12,3.62,18);gl.rotation.x=Math.PI/2;gl.userData.ex=1;
   const d=BX(G,.34,.2,1.6,AR,sd*1.0,1.55,2.55);d.rotation.x=-.034;BX(G,.3,.06,.04,M(0x0c0c0e),sd*1.0,1.6,1.75)}}/* duct on the deck, its intake mouth */
 /* ---- Mk IV: shield emitters on the four corners, and the bubble ---- */if(l>=4){for(const x of[-1.5,1.5])for(const z of[-2.8,2.9]){CY(G,.08,.1,.12,GN,x,1.38,z,10);CY(G,.04,.06,.4,GN,x,1.62,z,8);const o=new THREE.Mesh(new THREE.SphereGeometry(.1,12,8),CYM);o.position.set(x,1.9,z);G.add(o);const r=new THREE.Mesh(new THREE.TorusGeometry(.14,.015,5,16),CYM);r.rotation.x=Math.PI/2;r.position.set(x,1.9,z);G.add(r)}
  const bub=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshBasicMaterial({color:0x60d0ff,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));bub.scale.set(2.6,1.8,4.3);bub.position.y=1.2;bub.visible=false;G.add(bub);u.wkBub=bub}
 /* ---- Mk V: railgun rails and coils around both barrels ---- */if(l>=5){for(const sd of[-1,1]){for(const y of[-.13,.13])BX(BG,.05,.05,1.25,GN,sd*.25,y,-2.075);for(let i=0;i<4;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(.2,.03,6,18),CYM);t.position.set(sd*.25,0,-1.6-i*.36);BG.add(t)}}}
 /* ---- Mk VI: gold trim, midnight paint, a halo antenna ---- */
 const P=u.paint;if(P){P.OL.color.setHex(l>=6?0x1a2238:0x2a2f36);P.OE.color.setHex(l>=6?0x2c3a5a:0x3e4650)}
 if(l>=6){for(const sd of[-1,1]){BX(G,.04,.04,6.1,GD,sd*1.62,1.335,.15);BX(TG,.04,.03,1.4,GD,sd*.62,.755,.15)}BX(G,1.2,.04,.04,GD,0,1.1,-3.97);
  const halo=new THREE.Mesh(new THREE.TorusGeometry(.22,.025,6,20),GD);halo.position.set(.55,1.88,.7);halo.rotation.x=Math.PI/2;TG.add(halo);BX(TG,.03,.2,.03,GD,.55,1.83,.7);BX(TG,.44,.015,.015,GD,.55,1.88,.7);BX(TG,.015,.015,.44,GD,.55,1.88,.7)}/* the halo on a short post above the sensor head, held by two spokes */
 /* the mark on the turret sides */if(l>=1){const c=document.createElement('canvas');c.width=256;c.height=96;const k=c.getContext('2d');k.fillStyle=l>=6?'#2a2008':'#101418';k.fillRect(0,0,256,96);k.fillStyle=l>=6?'#ffd060':'#40c0ff';k.font='bold 60px monospace';k.textAlign='center';k.textBaseline='middle';k.fillText('MK '+['','I','II','III','IV','V','VI'][l],128,50);
  const mt=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.5});for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(.62,.23),mt);p.position.set(sd*1.468,.35,.3);/* on the rocket pod's outer face */p.rotation.y=sd*Math.PI/2;TG.add(p)}}
 return l}
