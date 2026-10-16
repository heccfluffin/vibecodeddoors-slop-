/* =====================================================================================================
   mkHeavy(kind, opt): the big ones. Replaces mkApcModel, mkSwatModel and mkVan (bak519).
     'apc'   the 8×8 armoured car ("DARK POLICE"): sloped glacis, upper hull over the wheels, vision blocks, caged
             lights, stowage boxes, rear ramp, roof hatches, a turret with twin guns and two rocket pods
     'swat'  the black armoured SWAT truck: ram bar, armoured glass, side steps and grab rails, roof hatch,
             light bar; opt.gun = true adds the roof turret (like mkSwatModel(true))
     'van'   a panel van (prop): opt.label = side text (e.g. 'DESERT NEWS'), opt.col = body colour
   ORIGIN    Centre on the ground.   FRONT  -z.
             NOTE: the old mkVan faced +z (its cab was at +z). Place the new van with rotation.y + PI to keep it
             facing the same way.
   SIZES / WHEELS (same as the old models):
     apc   2.9 × 7.0 m, hull top 2.2 m, turret top 2.9 m. Wheels (±1.45; z -2.3, -0.8, 0.8, 2.3) r 0.6.
     swat  2.5 × 6.0 m, roof 2.45 m (turret top 3.0 m). Wheels (±1.2, ±1.9) r 0.5.
     van   2.2 × 5.4 m, roof 2.45 m. Wheels (±0.95; z -1.7, 1.9) r 0.36.
   HOOKS (as the old models):
     userData.wheels [{p, t, front}]   (hub inside t, so it rolls)
     userData.bar    [red, blue]        light bar meshes (apc, swat); the game sets material.emissive
     userData.gun    apc: {tur, bar, rk:1}  (tur at (0, 2.2, -0.2), turns on y; bar at (0, 0.45, -0.6) in tur, pitches on x)
                     swat with opt.gun: {tur, bar, mz:[]}  (tur at (0, 2.62, 0.9))
     userData.crew   {x, y, z, sc, par}: where the old models put their gunner / driver figure (the APC's in the turret
                     hatch, the SWAT truck's in the driver's seat). Add the game's own figure there as before.
   COLLISION as before (VEHK.apc / VEHK.swat w and len).
   ===================================================================================================== */
function mkHeavy(kind,opt){
 opt=opt||{};const g=new THREE.Group();
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6,metalness:.3},o||{}));
 const dk=M(0x141414,{roughness:.85,metalness:0}),steel=M(0x6a6e72,{metalness:.6,roughness:.4}),chrome=M(0xc8ccd0,{metalness:.55,roughness:.22}),
  hl=M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.7,roughness:.1}),tl=M(0x701010,{emissive:0xc01010,emissiveIntensity:.6,roughness:.2}),
  glass=new THREE.MeshStandardMaterial({color:0x6a8aa0,transparent:true,opacity:.45,roughness:.05,metalness:.4,side:THREE.DoubleSide,depthWrite:false});
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const CYL=(r1,r2,len,m,x,y,z,ax,p,seg)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,seg||14),m);o.position.set(x,y,z);if(ax=='x')o.rotation.z=Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;(p||g).add(o);return o};
 const rod=(a,b,r,m,p)=>{const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),d=Bv.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),8),m);o.position.copy(A).add(Bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());(p||g).add(o);return o};
 const FONT='"Barlow Semi Condensed",DoorsSans,Arial,sans-serif';
 const B_T=.03;
 const extrude=(pts,w,m,x,p)=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))s.lineTo(q[0],q[1]);s.lineTo(pts[0][0],pts[0][1]);
  const geo=new THREE.ExtrudeGeometry(s,{depth:w-2*B_T,bevelEnabled:true,bevelThickness:B_T,bevelSize:B_T,bevelSegments:2,curveSegments:10});
  const o=new THREE.Mesh(geo,m);o.rotation.y=-Math.PI/2;o.position.x=(x||0)+(w-2*B_T)/2;(p||g).add(o);return o};
 /* set-in windows: a dark rubber frame half sunk into the body, and tinted glass 6 mm proud of it */
 const tint=M(0x34485a,{metalness:.6,roughness:.12,side:THREE.DoubleSide}),seal=M(0x0c0c0e,{roughness:.9,metalness:0});
 const sideWin=(poly,x)=>{for(const sd of[-1,1]){extrude(poly,.08,seal,sd*x);/* frame: x ± 0.04, its bevel 3 cm wider than the glass */
   const s=new THREE.Shape();s.moveTo(poly[0][0],poly[0][1]);for(const q of poly.slice(1))s.lineTo(q[0],q[1]);const m=new THREE.Mesh(new THREE.ShapeGeometry(s),tint);m.rotation.y=-Math.PI/2;m.position.x=sd*(x+.046);g.add(m)}};
 /* a window lying on a slope that runs from (z0,y0) up to (z1,y1), facing forward/up */
 const slopeWin=(w,z0,y0,z1,y1,f)=>{const dz=z1-z0,dy=y1-y0,L=Math.hypot(dz,dy),nz=-dy/L,ny=dz/L,th=Math.atan2(dz,dy),k=f||.82,mz=(z0+z1)/2,my=(y0+y1)/2;
  const fr=BX(w+.08,L*k+.08,.04,seal,0,my+ny*.0,mz+nz*.0);fr.rotation.x=th;/* frame: from 2 cm inside to 2 cm outside */
  const gl=BX(w,L*k,.01,tint,0,my+ny*.031,mz+nz*.031);gl.rotation.x=th};/* glass: 2.6 to 3.6 cm out */
 const sideText=(txt,w,h,x,y,z,bg,fg)=>{const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/w);const k=c.getContext('2d');if(bg){k.fillStyle=bg;k.fillRect(0,0,c.width,c.height)}else k.clearRect(0,0,c.width,c.height);
  k.fillStyle=fg;k.font='bold '+(c.height*.7|0)+'px '+FONT;k.textAlign='center';k.textBaseline='middle';k.fillText(txt,c.width/2,c.height/2+2,c.width-20);
  const m=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),transparent:!bg,alphaTest:bg?0:.3,roughness:.6});for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);p.position.set(sd*x,y,z);p.rotation.y=sd*Math.PI/2;g.add(p)}};
 const wheels=[];
 const wheel=(x,z,r,wd,hubM,lugs)=>{const p=new THREE.Group();p.position.set(x,r,z);g.add(p);
  const tread=(()=>{const c=document.createElement('canvas');c.width=64;c.height=64;const k=c.getContext('2d');k.fillStyle='#181818';k.fillRect(0,0,64,64);k.fillStyle='#0a0a0a';for(let i=0;i<64;i+=16){k.beginPath();k.moveTo(0,i);k.lineTo(32,i+8);k.lineTo(64,i);k.lineTo(64,i+6);k.lineTo(32,i+14);k.lineTo(0,i+6);k.fill()}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,Math.round(r*12));return t})();
  const t=new THREE.Mesh(new THREE.CylinderGeometry(r,r,wd,24),[M(0xffffff,{map:tread,roughness:.95,metalness:0}),dk,dk]);t.rotation.z=Math.PI/2;t.userData.r=r;p.add(t);
  for(const s of[-1,1]){const sh=new THREE.Mesh(new THREE.TorusGeometry(r-.05,.05,6,24),dk);sh.position.set(0,s*(wd/2-.04),0);sh.rotation.x=Math.PI/2;t.add(sh)}
  t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.55,r*.55,wd+.01,18),hubM));t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.2,r*.24,wd+.06,10),steel));
  for(let i=0;i<(lugs||8);i++){const a=i/(lugs||8)*6.283;const b=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,wd+.04,6),steel);b.position.set(Math.cos(a)*r*.38,0,Math.sin(a)*r*.38);t.add(b)}
  wheels.push({p,t,front:z<0});return p};

 /* =================================================================== APC */
 if(kind=='apc'){const OD=M(0x3a4a2a,{roughness:.85,metalness:.15}),OD2=M(0x2e3c22,{roughness:.85,metalness:.15});
  /* lower hull between the wheels (2.3 wide), upper hull over them (2.9 wide, top 2.2) */
  extrude([[-3.0,.55],[3.3,.55],[3.45,.8],[3.45,1.27],[-3.3,1.27],[-3.45,1.05]],2.3,OD);
  extrude([[-3.45,1.25],[3.45,1.25],[3.45,2.1],[3.3,2.2],[-2.2,2.2],[-3.5,1.4]],2.9,OD);
  /* wheel arch liners over each wheel, under the upper hull */for(const z of[-2.3,-.8,.8,2.3])for(const sd of[-1,1])BX(.5,.06,1.36,OD2,sd*1.42,1.24,z);
  /* front: vision blocks on the glacis, caged headlights, tow hooks */
  {const vb=M(0x0a1a10,{emissive:0x041008,metalness:.6,roughness:.1});for(let i=0;i<4;i++){/* lying on the glacis (slope .55 rad), 3 cm proud */const f=BX(.48,.07,.2,OD2,-.75+i*.5,1.94+.03,-2.62);f.rotation.x=-.55;const v=BX(.4,.02,.12,vb,-.75+i*.5,1.94+.068,-2.64);v.rotation.x=-.55}}
  for(const sd of[-1,1]){BX(.36,.34,.14,OD2,sd*1.0,1.35,-3.55);/* lamp housing, standing out of the nose (its face is at z -3.51) */CYL(.13,.13,.04,hl,sd*1.0,1.35,-3.635,'z');
   for(let i=0;i<3;i++)BX(.02,.3,.02,steel,sd*1.0+(i-1)*.1,1.35,-3.69);BX(.34,.02,.1,steel,sd*1.0,1.51,-3.66);BX(.34,.02,.1,steel,sd*1.0,1.19,-3.66)/* cage in front of the lens */
   BX(.12,.1,.12,steel,sd*.6,.8,-3.25);/* bracket on the lower nose */const hk=new THREE.Mesh(new THREE.TorusGeometry(.08,.025,6,12),steel);hk.position.set(sd*.6,.8,-3.38);hk.rotation.y=Math.PI/2;g.add(hk)}
  /* stowage boxes and a jerrycan rack on the hull sides; a towing cable; antenna whips */
  for(const sd of[-1,1]){for(const z of[-1.75,1.95])BX(.25,.4,1.0,OD2,sd*1.58,1.7,z);BX(.05,.06,4.6,steel,sd*1.47,1.47,0);}
  for(const sd of[-1,1]){CYL(.03,.03,.1,dk,sd*1.1,2.25,2.9);rod([sd*1.1,2.25,2.9],[sd*1.25,4.2,3.3],.01,dk)}
  /* rear ramp, hinged at the bottom, with its handle and two tail lights */
  BX(2.1,1.35,.08,OD2,0,1.22,3.49);for(let i=0;i<5;i++)BX(1.9,.03,.03,OD,0,.7+i*.25,3.54);BX(.5,.06,.06,steel,0,1.6,3.56);for(const sd of[-1,1])BX(.14,.2,.04,tl,sd*1.25,1.9,3.47);
  /* roof hatches behind the turret */for(const z of[1.4,2.4]){CYL(.36,.36,.06,OD2,0,2.23,z);const h=new THREE.Mesh(new THREE.TorusGeometry(.36,.035,6,16),steel);h.rotation.x=Math.PI/2;h.position.set(0,2.26,z);g.add(h)}
  /* light bar on the roof */const lr=BX(.4,.12,.25,M(0x300000,{emissive:0x400000}),-.4,2.27,1.8),lb=BX(.4,.12,.25,M(0x000030,{emissive:0x000040}),.4,2.27,1.8);BX(1.0,.04,.3,dk,0,2.22,1.8);g.userData.bar=[lr,lb];
  /* the turret */const tur=new THREE.Group();tur.position.set(0,2.2,-.2);g.add(tur);
  CYL(.95,1.0,.12,OD2,0,.06,0,null,tur,24);
  extrude([[-1.0,.12],[.9,.12],[.9,.62],[.7,.72],[-.75,.72],[-1.05,.45]],1.6,OD,0,tur);
  for(const sd of[-1,1]){BX(.5,.5,1.0,OD2,sd*1.05,.45,.1,tur);for(let i=0;i<4;i++){const rt=CYL(.08,.08,.06,M(0xc02020,{emissive:0x300000}),sd*1.05+((i%2)-.5)*.22,.45+((i>>1)-.5)*.22,-.42,'z',tur);rt.rotation.x=Math.PI/2}
   BX(.06,.5,.9,steel,sd*.82,.45,.1,tur)}/* rocket pods on arms */
  const bar=new THREE.Group();bar.position.set(0,.45,-.6);tur.add(bar);BX(.6,.3,.4,OD2,0,0,-.1,bar);
  for(const sd of[-1,1]){CYL(.07,.07,1.8,dk,sd*.18,0,-1.0,'z',bar);CYL(.1,.1,.18,dk,sd*.18,0,-1.85,'z',bar)}
  {const h=new THREE.Mesh(new THREE.TorusGeometry(.3,.05,6,14),steel);h.rotation.x=Math.PI/2;h.position.set(.35,.75,.55);tur.add(h)}
  g.userData.gun={tur,bar,rk:1};g.userData.crew={x:.35,y:.95,z:.55,sc:.4,par:tur};
  sideText('DARK POLICE',2.3,.42,1.462,1.72,.1,null,'#e8e0c0');/* between the two storage boxes */
  for(const z of[-2.3,-.8,.8,2.3])for(const sd of[-1,1])wheel(sd*1.45,z,.6,.45,OD2,8);
  for(const z of[-2.3,-.8,.8,2.3])CYL(.06,.06,2.4,dk,0,.6,z,'x')}

 /* =================================================================== SWAT */
 else if(kind=='swat'){const BK=M(0x1a1a20,{metalness:.35,roughness:.55}),GR=M(0x2a2a30,{metalness:.3,roughness:.6});
  /* lower body with the wheel arches cut out, then the hood + cab and the rear box above it */
  const arch=(z)=>{const p=[];for(let i=0;i<=10;i++){const a=Math.PI-i/10*Math.PI;p.push([z+Math.cos(a)*.6,.5+Math.sin(a)*.6])}return p};
  extrude([[-3.0,.45],[-2.5,.45],...arch(-1.9).slice(1,-1),[-1.3,.45],[1.3,.45],...arch(1.9).slice(1,-1),[2.5,.45],[3.0,.45],[3.0,1.3],[-3.0,1.3]],2.4,BK);
  extrude([[-3.0,1.28],[-1.25,1.28],[-1.25,2.45],[-1.55,2.45],[-2.1,1.75],[-2.95,1.6],[-3.0,1.45]],2.36,BK);/* hood and cab front */
  extrude([[-1.27,1.28],[3.0,1.28],[3.0,2.4],[2.92,2.45],[-1.27,2.45]],2.4,BK);/* the box */
  /* armoured glass: windscreen and the cab side windows; gun ports in the box */
  slopeWin(1.9,-2.1,1.75,-1.55,2.45,.74);/* windscreen on the cab's sloped front */
  sideWin([[-1.33,1.84],[-1.33,2.32],[-1.6,2.32],[-1.96,1.84]],1.18);/* cab side windows follow the slope */
  for(const sd of[-1,1]){
   for(let i=0;i<3;i++){BX(.04,.24,.5,M(0x0a0e14,{metalness:.6,roughness:.15}),sd*1.215,2.1,-.2+i*1.15);BX(.03,.32,.58,GR,sd*1.205,2.1,-.2+i*1.15)}
   /* side steps and grab rails */BX(.25,.05,1.2,steel,sd*1.32,.62,-.9);BX(.25,.05,1.6,steel,sd*1.32,.62,.4);/* a vertical grab handle by the cab door, on two stand-offs */rod([sd*1.25,1.45,-1.12],[sd*1.25,2.05,-1.12],.022,steel);for(const y of[1.5,2.0])rod([sd*1.19,y,-1.12],[sd*1.25,y,-1.12],.018,steel)}
  /* front: ram bar, grille, lights; back: doors, step, lights */
  BX(2.5,.25,.3,steel,0,.6,-3.12);for(const sd of[-1,1])BX(.15,.7,.15,steel,sd*.7,.8,-3.15);BX(1.6,.12,.12,steel,0,1.15,-3.15);
  {const c=document.createElement('canvas');c.width=256;c.height=96;const k=c.getContext('2d');k.fillStyle='#0a0a0c';k.fillRect(0,0,256,96);k.fillStyle='#3a3a40';for(let i=6;i<96;i+=12)k.fillRect(8,i,240,6);
   BX(1.3,.4,.04,[BK,BK,BK,BK,BK,M(0xffffff,{map:new THREE.CanvasTexture(c)})],0,1.3,-3.0)}
  for(const sd of[-1,1]){BX(.36,.14,.04,hl,sd*.88,1.3,-3.0);BX(.12,.08,.04,M(0xffa020,{emissive:0xff8000,emissiveIntensity:.3}),sd*.88,1.12,-3.0)}
  BX(2.0,.04,.04,M(0x0a0a0a),0,1.85,3.03);BX(.04,1.08,.04,M(0x0a0a0a),0,1.85,3.03);/* rear double door lines */
  for(const sd of[-1,1]){BX(.06,.2,.06,steel,sd*.3,1.85,3.05);BX(.2,.3,.04,tl,sd*1.0,1.5,3.02)}BX(1.6,.06,.3,steel,0,.5,3.15);
  /* roof: hatch, light bar */CYL(.32,.32,.06,GR,0,2.48,1.6);
  const lr=BX(.5,.14,.3,M(0x300000,{emissive:0x400000}),-.35,2.53,-1.0),lb=BX(.5,.14,.3,M(0x000030,{emissive:0x000040}),.35,2.53,-1.0);BX(1.3,.05,.32,dk,0,2.47,-1.0);g.userData.bar=[lr,lb];
  if(opt.gun){const tur=new THREE.Group();tur.position.set(0,2.62,.9);g.add(tur);CYL(.48,.5,.12,GR,0,.0,0,null,tur,20);BX(.9,.3,.9,GR,0,.2,0,tur);
   const bar=new THREE.Group();bar.position.set(0,.4,0);tur.add(bar);for(const sd of[-1,1])CYL(.06,.06,1.4,dk,sd*.14,0,-.7,'z',bar);BX(.5,.3,.4,GR,0,0,-.05,bar);
   BX(.06,.5,.7,M(0x3a3a40,{metalness:.6}),-.48,.35,-.1,tur);BX(.06,.5,.7,M(0x3a3a40,{metalness:.6}),.48,.35,-.1,tur);g.userData.gun={tur,bar,mz:[]}}
  g.userData.crew={x:.5,y:1.55,z:-2.0,sc:.42,par:g};
  sideText('S.W.A.T.',2.2,.52,1.212,1.6,1.0,null,'#f0f0f0');
  for(const z of[-1.9,1.9])for(const sd of[-1,1])wheel(sd*1.2,z,.5,.4,GR,8);
  for(const z of[-1.9,1.9])CYL(.05,.05,2.0,dk,0,.5,z,'x')}

 /* =================================================================== VAN */
 else if(kind=='van'){const col=opt.col!=null?opt.col:0xf0f0ec,WH=M(col,{roughness:.45,metalness:.2}),band=M(0x2040a0,{roughness:.5});
  const arch=(z,r)=>{const p=[];for(let i=0;i<=10;i++){const a=Math.PI-i/10*Math.PI;p.push([z+Math.cos(a)*r,.36+Math.sin(a)*r])}return p};
  extrude([[-2.7,.3],[-2.1,.3],...arch(-1.7,.44).slice(1,-1),[-1.26,.3],[1.46,.3],...arch(1.9,.44).slice(1,-1),[2.34,.3],[2.7,.3],[2.7,2.4],[2.62,2.45],[-1.2,2.45],[-1.9,1.5],[-2.62,1.35],[-2.7,1.2]],2.2,WH);
  BX(2.22,.22,5.3,band,0,1.05,0);/* a coloured band all round */
  slopeWin(1.86,-1.9,1.5,-1.2,2.45,.8);/* windscreen */
  sideWin([[-1.02,1.6],[-1.02,2.28],[-1.27,2.28],[-1.76,1.6]],1.1);/* cab side windows follow the slope */
  for(const sd of[-1,1]){
   BX(.012,1.1,.012,M(0x2a2a2a),sd*1.112,1.6,-.95);BX(.012,.03,1.3,M(0x2a2a2a),sd*1.112,2.12,-.3);/* front door line, sliding-door rail */BX(.015,.03,.14,chrome,sd*1.115,1.4,-1.1);/* door lines, handle */
   BX(.18,.04,.05,dk,sd*1.18,1.62,-1.62);BX(.05,.22,.16,dk,sd*1.29,1.68,-1.62);BX(.012,.18,.12,M(0x8a9aa8,{metalness:.8,roughness:.1}),sd*1.29,1.68,-1.705)}/* mirrors: the arm starts inside the body (its slope is at z -1.76 here) */
  for(const sd of[-1,1]){BX(.3,.14,.04,hl,sd*.75,1.0,-2.72);BX(.18,.4,.04,tl,sd*.95,1.5,2.72)}BX(2.0,.18,.14,steel,0,.45,-2.75);BX(2.0,.18,.14,steel,0,.45,2.75);
  {const c=document.createElement('canvas');c.width=256;c.height=64;const k=c.getContext('2d');k.fillStyle='#111';k.fillRect(0,0,256,64);k.fillStyle='#888';for(let i=6;i<64;i+=10)k.fillRect(6,i,244,4);BX(1.0,.25,.04,[WH,WH,WH,WH,WH,M(0xffffff,{map:new THREE.CanvasTexture(c)})],0,.85,-2.72)}
  BX(.012,1.8,.012,M(0x2a2a2a),0,1.4,2.72);/* rear doors */
  if(opt.label)sideText(opt.label,2.3,.48,1.118,1.62,1.3,'#1a2a6a','#ffffff');
  for(const[x,z]of[[-.95,-1.7],[.95,-1.7],[-.95,1.9],[.95,1.9]])wheel(x,z,.36,.26,M(0xb8bcc0,{metalness:.5,roughness:.3}),5)}
 g.userData.wheels=wheels;return g}

/* =====================================================================================================
   mkTow(): El Goblino's tow truck. Replaces mkTowTruck (bak519). Needs mkPickup (pickup.js).
   The lime pickup with a wrecker in the bed: a turntable post, a boom with a hydraulic ram, a pulley and a cable
   down to a swinging hook, plus a wheel-lift under the back. Amber light bar on the cab roof, EL GOBLINO TOWING
   on the doors and the tailgate.
   ORIGIN / FRONT / WHEELS / STEERING: as mkPickup('pickup') (front -z; wheels x ±1.02, z ±1.55, r 0.44).
   SIZE      2.1 × 5.6 m (the wheel-lift sticks out 0.6 m behind), boom tip 2.45 m up.
   HOOKS     userData.lights [A, B]   the two amber lamps (the game flashes material.emissive, as now)
             userData.hook            the hook Group (hangs from the boom tip; swing it on x/z if you like)
             userData.crew {x,y,z,sc} El Goblino's seat: (0.45, 0.5, -0.5), scale 0.48 (as now)
             wheels / sw / swAx as mkPickup.
   SKIP      vehMore() extras (built in). The game's recolour traverse isn't needed any more.
   ===================================================================================================== */
function mkTow(){const g=mkPickup('pickup',0x5a9a2a);
 const rm=[];g.traverse(o=>{if(o.isMesh&&o.material&&o.material.color&&o.material.color.getHex()===0x9a7048)rm.push(o)});for(const o of rm)o.parent.remove(o);/* no crates */
 g.traverse(o=>{if(o.isMesh&&o.material&&o.material.map&&o.geometry.parameters&&o.geometry.parameters.width==1.3&&o.geometry.parameters.height==.24)o.visible=false});/* hide the DESERT WORKS tailgate text */
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.5,metalness:.4},o||{}));
 const yel=M(0xe8c020,{metalness:.45,roughness:.4}),steel=M(0x6a6e72,{metalness:.6,roughness:.35}),dk=M(0x1a1a1a,{roughness:.8,metalness:.1});
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const rod=(a,b,r,m,p)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),10),m);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());(p||g).add(o);return o};
 const FONT='"Barlow Semi Condensed",DoorsSans,Arial,sans-serif';
 /* the wrecker: base plate on the bed floor (top 1.03), turntable, post */
 BX(1.2,.06,1.0,steel,0,1.06,1.5);{const t=new THREE.Mesh(new THREE.CylinderGeometry(.42,.45,.12,20),dk);t.position.set(0,1.15,1.5);g.add(t)}
 BX(.5,.62,.5,yel,0,1.52,1.5);BX(.56,.06,.56,steel,0,1.86,1.5);
 /* boom from the post (z 1.5, y 1.95) up and back to the tip (z 3.05, y 2.4); a box section with a pulley */
 const P0=[0,1.95,1.45],P1=[0,2.4,3.05];{const d=[0,P1[1]-P0[1],P1[2]-P0[2]],L=Math.hypot(d[1],d[2]);const bm=BX(.2,.22,L,yel,0,(P0[1]+P1[1])/2,(P0[2]+P1[2])/2);bm.rotation.x=-Math.atan2(d[1],d[2]);
  for(const sd of[-1,1])BX(.03,.24,L*.92,M(0x3a3a3a),sd*.115,(P0[1]+P1[1])/2,(P0[2]+P1[2])/2).rotation.x=bm.rotation.x}
 for(const sd of[-1,1])BX(.04,.3,.3,yel,sd*.14,2.4,3.05);/* cheek plates at the tip */
 {const pw=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.08,16),steel);pw.rotation.z=Math.PI/2;pw.position.set(0,2.4,3.05);g.add(pw)}
 /* hydraulic ram from the post foot to the boom's middle */rod([0,1.3,1.1],[0,2.12,2.05],.07,steel);rod([0,1.3,1.1],[0,1.75,1.6],.1,M(0x2a2a2a));
 /* the winch on the post, and the cable over the pulley to the hook */
 {const w=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.4,14),dk);w.rotation.z=Math.PI/2;w.position.set(0,1.55,1.22);g.add(w)}
 rod([0,1.68,1.22],[0,2.5,3.0],.012,M(0x101010));
 const hook=new THREE.Group();hook.position.set(0,2.27,3.17);g.add(hook);rod([0,0,0],[0,-.85,0],.012,M(0x101010),hook);
 BX(.12,.16,.08,steel,0,-.9,0,hook);{const h=new THREE.Mesh(new THREE.TorusGeometry(.09,.025,8,16,Math.PI*1.4),steel);h.position.set(0,-1.06,0);h.rotation.set(0,Math.PI/2,Math.PI*.8);hook.add(h)}
 /* wheel-lift under the back: arm, crossbar, two cradles */
 BX(.18,.14,1.0,yel,0,.4,2.75);BX(1.5,.12,.16,yel,0,.4,3.2);for(const sd of[-1,1]){BX(.3,.05,.34,yel,sd*.45,.43,3.2);BX(.3,.1,.05,yel,sd*.45,.5,3.355)}/* folded wheel cradles */
 /* amber light bar on the cab roof (roof top 1.98) */
 BX(1.3,.06,.24,dk,0,2.01,-.55);const amb=()=>M(0x402000,{emissive:0xff9000,emissiveIntensity:1,roughness:.3});
 const lA=BX(.4,.13,.22,amb(),-.38,2.105,-.55),lB=BX(.4,.13,.22,amb(),.38,2.105,-.55);BX(.22,.1,.2,M(0xd0d0d0,{metalness:.5}),0,2.09,-.55);
 /* livery: doors and tailgate */
 const dec=(w,h,draw)=>{const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/w);draw(c.getContext('2d'),c.width,c.height);return new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),transparent:true,alphaTest:.3,roughness:.5})};
 const door=dec(.72,.42,(k,w,h)=>{k.fillStyle='#f4f0e0';k.textAlign='center';k.textBaseline='middle';k.font='bold '+(h*.42|0)+'px '+FONT;k.fillText('EL GOBLINO',w/2,h*.3,w-12);k.font='bold '+(h*.26|0)+'px '+FONT;k.fillText('TOWING · FAST',w/2,h*.72,w-12);k.fillRect(w*.1,h*.52,w*.8,4)});
 for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(.72,.42),door);p.position.set(sd*1.058,1.0,-.58);p.rotation.y=sd*Math.PI/2;g.add(p)}
 {const p=new THREE.Mesh(new THREE.PlaneGeometry(1.3,.24),dec(1.3,.24,(k,w,h)=>{k.fillStyle='#f4f0e0';k.font='bold '+(h*.75|0)+'px '+FONT;k.textAlign='center';k.textBaseline='middle';k.fillText('EL GOBLINO TOWING',w/2,h/2+2,w-10)}));p.position.set(0,1.2,2.446);g.add(p)}
 g.userData.lights=[lA,lB];g.userData.hook=hook;g.userData.crew={x:.45,y:.5,z:-.5,sc:.48};return g}
