/* =====================================================================================================
   r611: NEW CARS. The desert's vehicles get new, more detailed models from the design chat
   (docs/design/models/: sedan, pickup, fast-cars, heavy, wraith, tank):
   - El Goblino's cab, the Desert PD cruiser and the townspeople's cars: a proper old sedan with a hollow cabin.
   - The pickup, the army jeep and the MONSTER TRUCK (its body is lifted by the model itself now).
   - The sports car, muscle car, hot rod and dragster (the dragster's little front wheels touch the ground).
     The Highway Patrol car is still the sports car with its patrol dress on.
   - The APC, the SWAT truck, the panel vans and El Goblino's tow truck.
   - The X-13 Wraith and all its refit marks (wkBuild in dx554 now calls wraithMarks).
   - The battle tank, with tracks that really run round the wheels while it drives.
   Every model keeps the hooks the game reads (wheels, steering wheel, light bars, turrets, guns), so driving,
   shooting, sirens and the flat-tyre event work as before. Wheels with their own size roll at their own speed.
   ===================================================================================================== */

/* ---------- docs/design/models/sedan.js ---------- */
/* =====================================================================================================
   mkSedan(kind, colour): the desert's big old sedan, in three liveries. Replaces the 'sedan' and 'cop' branch of
   mkVehModel (bak519) and the npc1–npc3 cars (they use the sedan model).
     kind 'cab'  El Goblino's cab: amber, a checker stripe, GOBLINO CAB on the doors, a lit roof sign
     kind 'cop'  Desert PD cruiser: white with black doors, DESERT PD, push bar, light bar (userData.bar)
     kind 'civ'  someone else's car: plain paint in `colour` (default 0x3a7ad8)
   A rounded body with real wheel arches, a hollow cabin you sit in (dash, gauges, steering wheel, front seats,
   rear bench), glass all round, chrome bumpers and grille, headlights, tail lights, plates, mirrors, aerial.

   SIZE      1.98 m wide (2.12 with the mirrors), 4.38 m long (4.6 with bumpers), roof at 1.55 m.
   ORIGIN    Centre of the car, on the ground.
   FRONT     -z (the nose).
   SAME HOOKS AS mkVehModel, so it drops in:
             g.userData.wheels  [{p, t, front}] : p = Group at the wheel centre (x ±0.98, y 0.36, z ±1.42),
                                t = the tyre mesh (rotation.z = PI/2; the game spins t.rotation.x to roll it, and the hubcap
                                is inside t so it rolls too; the flat-tyre event scales it), front = z < 0
             g.userData.sw      the steering wheel Group, at (0.45, 1.02, -0.42), rotation.x = -1.15; turns on its z
             g.userData.swAx    'z'
             g.userData.bar     (cop only) [red, blue] light meshes: the game sets their material.emissive
   SEATS     Unchanged from VEHK.sedan: driver (0.45, z -0.1), passenger (-0.45, -0.1), rear (±0.42, 0.85).
             Cushions are at y 0.58 like the old model, so the camera height doesn't change.
   ALSO      vehMore() adds mirrors, plates, exhaust, aerial and handles to the old sedan. This model has its own:
             skip vehMore for these three kinds. hwpDress() (the Highway Patrol car) can dress kind 'cop' as before.
   COLLISION Unchanged (the game uses VEHK.sedan w/len).
   ===================================================================================================== */
function mkSedan(kind,colour){
 kind=kind||'civ';
 const g=new THREE.Group();
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.45,metalness:.35},o||{}));
 const paintC=kind=='cab'?0xe8a020:kind=='cop'?0xf0f0ee:(colour==null?0x3a7ad8:colour);
 const paint=M(paintC,{roughness:.32,metalness:.45}),black=M(0x15161a,{roughness:.4,metalness:.4}),dk=M(0x1a1a1a,{roughness:.85,metalness:0}),
  chrome=M(0xd0d4d8,{metalness:.55,roughness:.22})/* bright without an environment map */,trim=M(0x2a2622,{roughness:.9,metalness:0}),seatM=M(0x5a3a26,{roughness:.8,metalness:0}),carpet=M(0x302a26,{roughness:1,metalness:0}),
  glass=new THREE.MeshStandardMaterial({color:0x9ac8e0,transparent:true,opacity:.28,roughness:.05,metalness:.3,side:THREE.DoubleSide,depthWrite:false}),
  hl=M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.7,roughness:.1}),tl=M(0x701010,{emissive:0xc01010,emissiveIntensity:.6,roughness:.2});
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const FONT='Arial';
 /* extrude a side profile (points in (z, y)) across the car: x from -w/2 to +w/2, with softly rounded edges */
 const B_T=.03;
 const extrude=(shape,w,m,x)=>{const geo=new THREE.ExtrudeGeometry(shape,{depth:w-2*B_T,bevelEnabled:true,bevelThickness:B_T,bevelSize:B_T,bevelSegments:2,curveSegments:14});
  const o=new THREE.Mesh(geo,m);o.rotation.y=-Math.PI/2;o.position.x=(x||0)+(w-2*B_T)/2;g.add(o);return o};
 const W=1.98,WR=.36,WZ=1.42,AR=.43;/* width, wheel radius, wheel z, arch radius */
 /* ---------- the body ---------- */
 /* hood and nose: z -2.19 … -0.95, with the front wheel arch */
 {const s=new THREE.Shape();s.moveTo(-.95,.24);s.lineTo(-WZ+AR,.24);s.lineTo(-WZ+AR,.36);s.absarc(-WZ,.36,AR,0,Math.PI,false);s.lineTo(-WZ-AR,.24);s.lineTo(-2.1,.24);
  s.quadraticCurveTo(-2.19,.26,-2.19,.42);s.lineTo(-2.19,.66);s.quadraticCurveTo(-2.18,.8,-2.04,.84);s.lineTo(-1.2,.92);s.quadraticCurveTo(-1.0,.94,-.95,.95);s.lineTo(-.95,.24);
  extrude(s,W,paint)}
 /* trunk and tail: z 1.0 … 2.19, with the rear wheel arch */
 {const s=new THREE.Shape();s.moveTo(1.0,.24);s.lineTo(WZ-AR,.24);s.lineTo(WZ-AR,.36);s.absarc(WZ,.36,AR,Math.PI,0,true);s.lineTo(WZ+AR,.24);s.lineTo(2.1,.24);
  s.quadraticCurveTo(2.19,.26,2.19,.42);s.lineTo(2.19,.7);s.quadraticCurveTo(2.18,.88,2.02,.91);s.lineTo(1.05,.95);s.lineTo(1.0,.95);s.lineTo(1.0,.24);
  extrude(s,W,paint)}
 /* the doors: two thin slabs between the arches, so the cabin is hollow */
 for(const sd of[-1,1]){const s=new THREE.Shape();s.moveTo(-.97,.27);s.lineTo(1.02,.27);s.lineTo(1.02,.95);s.lineTo(-.97,.95);s.lineTo(-.97,.27);
  const d=extrude(s,.1,kind=='cop'?black:paint,sd*.94)}
 /* floor, sills, the inside of the doors */
 BX(1.84,.16,1.98,dk,0,.33,.03);BX(1.82,.03,1.96,carpet,0,.425,.03);
 for(const sd of[-1,1])BX(.03,.36,1.9,trim,sd*.885,.74,.03);/* door cards */
 /* door shut lines: thin dark gaps on the outside (front door / rear door) */
 for(const sd of[-1,1])for(const z of[-.94,.27,1.0]){BX(.012,.66,.012,M(0x0a0a0a),sd*1.002,.6,z)}
 /* ---------- the greenhouse ---------- */
 const RY=1.52;/* roof underside */
 {const s=new THREE.Shape();/* roof cross-section, extruded along z */const hw=.88;s.moveTo(-hw,0);s.quadraticCurveTo(-hw,.05,-hw+.06,.06);s.lineTo(hw-.06,.06);s.quadraticCurveTo(hw,.05,hw,0);s.lineTo(-hw,0);
  const geo=new THREE.ExtrudeGeometry(s,{depth:1.12,bevelEnabled:false,curveSegments:8});const r=new THREE.Mesh(geo,kind=='cop'?paint:paint);r.position.set(0,RY,-.27);g.add(r);
  BX(1.72,.02,1.1,M(0xd8d0c0,{roughness:.9,metalness:0}),0,RY-.012,.29)}/* headliner */
 const pane=(pts,x)=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))s.lineTo(p[0],p[1]);const m=new THREE.Mesh(new THREE.ShapeGeometry(s),glass);m.rotation.y=-Math.PI/2;m.position.x=x;g.add(m);return m};
 const strip=(a,b,t,m)=>{const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),d=Bv.clone().sub(A);const o=new THREE.Mesh(new THREE.BoxGeometry(t,d.length(),t),m);o.position.copy(A).add(Bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(o);return o};
 /* windscreen and rear window: planes across the car, leaning */
 {const wsL=Math.hypot(.68,.57),ws=new THREE.Mesh(new THREE.PlaneGeometry(1.76,wsL),glass);ws.position.set(0,(.95+RY)/2,(-.95+-.27)/2);ws.rotation.x=Math.atan2(.68,.57);g.add(ws);
  const rwL=Math.hypot(.45,.57),rw=new THREE.Mesh(new THREE.PlaneGeometry(1.76,rwL),glass);rw.position.set(0,(.95+RY)/2,(.85+1.3)/2);rw.rotation.x=-Math.atan2(.45,.57);g.add(rw)}
 /* side windows, and the pillars round them */
 for(const sd of[-1,1]){const x=sd*.935;pane([[-.9,.97],[-.28,RY-.03],[.25,RY-.03],[.25,.97]],x);pane([[.33,.97],[.33,RY-.03],[.84,RY-.03],[1.26,.97]],x);
  const pm=kind=='cop'?black:paint;strip([sd*.9,.95,-.95],[sd*.89,RY,-.27],.07,pm);strip([sd*.92,.95,.29],[sd*.9,RY,.29],.09,pm);strip([sd*.9,.95,1.3],[sd*.89,RY,.85],.09,pm);
  strip([sd*.95,.97,-.93],[sd*.95,.97,1.28],.03,chrome)}/* chrome window line */
 /* ---------- inside ---------- */
 BX(1.8,.28,.35,trim,0,.86,-.795);BX(1.8,.05,.42,M(0x3a3430,{roughness:.9,metalness:0}),0,1.01,-.82);/* dash: back face at z -0.62, clear of the steering wheel */
 {const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.fillStyle='#14120f';x.fillRect(0,0,256,64);
  for(const[cx,lbl]of[[70,'SPEED'],[186,'FUEL']]){x.strokeStyle='#d8d0b8';x.lineWidth=2;x.beginPath();x.arc(cx,36,24,Math.PI*.8,Math.PI*2.2);x.stroke();x.fillStyle='#d8d0b8';x.font='9px '+FONT;x.textAlign='center';x.fillText(lbl,cx,58);x.strokeStyle='#ff6020';x.lineWidth=2;x.beginPath();x.moveTo(cx,36);x.lineTo(cx-14,24);x.stroke()}
  const gm=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),emissive:0x40a0ff,emissiveIntensity:.15,roughness:.4});const p=new THREE.Mesh(new THREE.PlaneGeometry(.5,.125),gm);p.position.set(.45,.93,-.618);p.rotation.x=-.25;g.add(p)}
 /* steering wheel (same place and hook as the old model) */
 const sw=new THREE.Group();sw.position.set(.45,1.02,-.42);sw.rotation.x=-1.15;g.add(sw);
 {const r=new THREE.Mesh(new THREE.TorusGeometry(.18,.022,8,24),dk);sw.add(r);for(const a of[0,2.1,4.2]){const sp=new THREE.Mesh(new THREE.BoxGeometry(.16,.025,.02),dk);sp.position.set(Math.cos(a)*.08,Math.sin(a)*.08,0);sp.rotation.z=a;sw.add(sp)}
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.05,12),chrome);hub.rotation.x=Math.PI/2;sw.add(hub);const col=new THREE.Mesh(new THREE.CylinderGeometry(.03,.035,.3,8),dk);col.rotation.x=Math.PI/2;col.position.z=-.16;sw.add(col)}
 /* front bucket seats and the rear bench */
 const seat=(x,z,w)=>{BX(w,.12,.52,seatM,x,.58,z);const bk=BX(w,.62,.11,seatM,x,.93,z+.29);bk.rotation.x=-.12;BX(w*.5,.17,.1,seatM,x,1.32,z+.35)};
 seat(.45,-.1,.56);seat(-.45,-.1,.56);BX(1.56,.12,.5,seatM,0,.58,.82);{const rb=BX(1.56,.58,.1,seatM,0,.92,1.08);rb.rotation.x=-.12}
 BX(.2,.25,.55,trim,0,.55,-.1);/* centre console */
 /* ---------- chrome, lights, grille, plates ---------- */
 const bumper=z=>{BX(1.86,.15,.14,chrome,0,.32,z);for(const sd of[-1,1]){const e=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.14,12),chrome);e.rotation.x=Math.PI/2;e.position.set(sd*.93,.32,z);g.add(e)}};
 bumper(-2.25);bumper(2.25);
 /* grille: a chrome frame with dark horizontal bars, on the nose */
 {const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.fillStyle='#111';x.fillRect(0,0,256,64);x.fillStyle='#b8bcc0';for(let i=6;i<64;i+=9)x.fillRect(4,i,248,3);for(let i=0;i<256;i+=32)x.fillRect(i,0,2,64);
  const gm=M(0xffffff,{map:new THREE.CanvasTexture(c),metalness:.7,roughness:.3});BX(1.0,.24,.04,[chrome,chrome,chrome,chrome,chrome,gm],0,.53,-2.215);BX(1.06,.03,.05,chrome,0,.665,-2.215);BX(1.06,.03,.05,chrome,0,.395,-2.215)}
 for(const sd of[-1,1]){const h=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.05,20),hl);h.rotation.x=Math.PI/2;h.position.set(sd*.7,.6,-2.21);g.add(h);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.105,.018,8,20),chrome);ring.position.set(sd*.7,.6,-2.235);g.add(ring);
  BX(.12,.06,.04,M(0xffa020,{emissive:0xff8000,emissiveIntensity:.3}),sd*.7,.42,-2.215);/* indicators */
  BX(.36,.16,.04,tl,sd*.68,.66,2.225);BX(.38,.18,.02,chrome,sd*.68,.66,2.215)}/* tail lights */
 const plate=(z,ry,y)=>{const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');x.fillStyle='#f0e8d0';x.fillRect(0,0,256,128);x.strokeStyle='#2a2a2a';x.lineWidth=6;x.strokeRect(4,4,248,120);
  x.fillStyle='#b03020';x.font='bold 22px '+FONT;x.textAlign='center';x.fillText('DESERT STATE',128,30);x.fillStyle='#1a1a1a';x.font='bold 64px '+FONT;x.fillText(kind=='cop'?'PD 013':kind=='cab'?'CAB 13':'DSR '+(100+(paintC%900)),128,100,230);
  const p=new THREE.Mesh(new THREE.PlaneGeometry(.36,.18),M(0xffffff,{map:new THREE.CanvasTexture(c),metalness:.2,roughness:.5}));p.position.set(0,y,z);p.rotation.y=ry;g.add(p)};
 plate(-2.326,Math.PI,.32);plate(2.232,0,.5);
 /* mirrors, handles, aerial, exhaust */
 for(const sd of[-1,1]){BX(.1,.03,.04,dk,sd*1.03,1.0,-.86);BX(.04,.1,.14,paint,sd*1.08,1.03,-.86);for(const z of[-.3,.85])BX(.015,.03,.12,chrome,sd*1.01,.86,z)}
 {const a=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.7,4),chrome);a.position.set(.7,1.3,1.6);g.add(a)}
 {const e=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.2,10),chrome);e.rotation.x=Math.PI/2;e.position.set(-.6,.22,2.25);g.add(e)}/* the exhaust tip */
 /* ---------- underneath: chassis rails, axles into the wheels, drive shaft, springs, sump, exhaust, fuel tank ---------- */
 {const U=M(0x26282a,{roughness:.7,metalness:.4}),U2=M(0x3a3c3e,{roughness:.6,metalness:.5}),rust=M(0x5a3a26,{roughness:.8,metalness:.3});
  const cyl=(r,len,m,x,y,z,ax)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,12),m);o.position.set(x,y,z);if(ax=='x')o.rotation.z=Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;g.add(o);return o};
  for(const sd of[-1,1])BX(.1,.1,3.9,U,sd*.55,.2,0);/* chassis rails */
  for(const z of[-1.0,.95,2.0])BX(1.2,.08,.1,U,0,.2,z);/* cross members */
  /* the axles run right into each wheel's hub (the wheels sit at x ±0.98, their inner face at ±0.85) */
  for(const z of[-WZ,WZ]){cyl(.045,1.72,U2,0,WR,z,'x');for(const sd of[-1,1]){cyl(.13,.08,U2,sd*.82,WR,z,'x');/* brake drum behind the hub */
    /* coil spring and shock from the axle up into the body */const sp=new THREE.Mesh(new THREE.TorusGeometry(.06,.012,5,10),rust);for(let i=0;i<4;i++){const c=sp.clone();c.rotation.x=Math.PI/2;c.position.set(sd*.68,.42+i*.05,z+.12);g.add(c)}cyl(.025,.3,U2,sd*.68,.5,z+.12)}}
  BX(.5,.07,.12,U,0,WR,-WZ);/* front cross beam */
  {const d=new THREE.Mesh(new THREE.SphereGeometry(.13,12,8),U2);d.scale.set(1,.8,1);d.position.set(0,WR,WZ);g.add(d)}/* differential */
  cyl(.04,2.6,U2,0,.3,0,'z');/* drive shaft, from the gearbox to the differential */
  BX(.3,.2,.5,U2,0,.28,-.75);/* gearbox */BX(.6,.12,.7,U,0,.21,-1.75);/* engine sump under the hood */
  /* exhaust: down from the engine, along the left, a muffler, out at the back */
  cyl(.035,3.0,M(0x5a5048,{roughness:.6,metalness:.5}),-.6,.22,.7,'z');BX(.22,.16,.6,M(0x4a4440,{roughness:.6,metalness:.5}),-.6,.22,.6);
  BX(.8,.16,.35,U,.15,.22,1.85)}/* fuel tank under the trunk */
 /* ---------- wheels ---------- */
 const wheels=[];
 for(const[x,z]of[[-.98,-WZ],[.98,-WZ],[-.98,WZ],[.98,WZ]]){const p=new THREE.Group();p.position.set(x,WR,z);g.add(p);
  const t=new THREE.Mesh(new THREE.CylinderGeometry(WR,WR,.26,22),dk);t.rotation.z=Math.PI/2;p.add(t);
  for(const s of[-1,1]){const sw2=new THREE.Mesh(new THREE.TorusGeometry(WR-.04,.04,6,22),dk);sw2.position.set(0,s*.11,0);sw2.rotation.x=Math.PI/2;t.add(sw2)}/* rounded tyre shoulders */
  /* the hubcap is part of the tyre mesh's group, so it rolls with it (the game spins t.rotation.x). In t's frame the axle is y. */
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.27,18),chrome);t.add(hub);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,.28,12),M(0xb8bcc0,{metalness:.5,roughness:.3}));t.add(cap);
  for(let i=0;i<6;i++){const a=i/6*6.283;const sp=new THREE.Mesh(new THREE.BoxGeometry(.11,.28,.025),M(0x9aa0a4,{metalness:.5,roughness:.3}));sp.position.set(Math.cos(a)*.13,0,Math.sin(a)*.13);sp.rotation.y=-a;t.add(sp)}/* ribs on the hubcap */
  wheels.push({p,t,front:z<0})}
 /* ---------- liveries ---------- */
 const decal=(w,h,draw)=>{const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/w);draw(c.getContext('2d'),c.width,c.height);return new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),transparent:true,alphaTest:.3,roughness:.4,metalness:.2})};
 const sides=(m,w,h,y,z)=>{for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);p.position.set(sd*.997,y,z);p.rotation.y=sd*Math.PI/2;g.add(p)}};
 if(kind=='cab'){
  /* a checker band along the doors and the words on the doors */
  sides(decal(1.9,.08,(x,w,h)=>{const n=24;for(let i=0;i<n;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?'#1a1a1a':'#f0f0e8';x.fillRect(i*w/n,j*h/2,w/n+1,h/2+1)}}),1.9,.08,.86,.03);
  sides(decal(1.5,.3,(x,w,h)=>{x.fillStyle='#1a1a1a';x.font='bold '+(h*.62|0)+'px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText('GOBLINO CAB',w/2,h/2,w-20)}),1.5,.3,.6,.03);
  /* the roof sign, lit */
  const rs=decal(.7,.2,(x,w,h)=>{x.fillStyle='#ffe060';x.fillRect(0,0,w,h);x.fillStyle='#1a1a1a';x.font='bold '+(h*.7|0)+'px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText('TAXI',w/2,h/2+2)});rs.transparent=false;rs.emissive=new THREE.Color(0x806010);rs.emissiveMap=rs.map;
  BX(.72,.2,.26,[M(0xffe060,{emissive:0x806010}),M(0xffe060,{emissive:0x806010}),M(0xffe060,{emissive:0x806010}),dk,rs,rs],0,RY+.17,.3);BX(.5,.03,.18,dk,0,RY+.065,.3)}
 if(kind=='cop'){
  sides(decal(1.5,.3,(x,w,h)=>{x.fillStyle='#ffffff';x.font='bold '+(h*.62|0)+'px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText('DESERT PD',w/2,h/2,w-20)}),1.5,.3,.66,.03);
  sides(decal(.3,.3,(x,w,h)=>{x.fillStyle='#d4a020';x.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?w*.2:w*.46;x.lineTo(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r)}x.fill()}),.24,.24,.62,.86);/* star on the rear door */
  /* light bar: a black base and a red and a blue lens (the game flashes them) */
  BX(1.3,.06,.3,dk,0,RY+.09,.3);const lr=BX(.52,.13,.27,M(0x400000,{emissive:0xff2020,emissiveIntensity:1}),-.3,RY+.185,.3),lb=BX(.52,.13,.27,M(0x000040,{emissive:0x2040ff,emissiveIntensity:1}),.3,RY+.185,.3);
  g.userData.bar=[lr,lb];
  /* push bar on the nose */BX(1.3,.08,.08,dk,0,.5,-2.42);for(const sd of[-1,1]){BX(.08,.4,.08,dk,sd*.6,.52,-2.42);BX(.08,.08,.18,dk,sd*.6,.4,-2.3)}
  BX(.2,.14,.08,M(0x1a1a1a),.55,1.0,-.88)}/* a radio on the dash */
 g.userData.wheels=wheels;g.userData.sw=sw;g.userData.swAx='z';
 return g}

/* ---------- docs/design/models/pickup.js ---------- */
/* =====================================================================================================
   mkPickup(kind, colour): the desert pickup, in three versions. Replaces the 'truck' branch of mkVehModel, which
   the pickup, the army jeep (VEHK.jeep, mdl:'truck') and the monster truck (VEHK.monster, mdl:'truck') all use.
     kind 'pickup'   the rust-red pickup: chrome grille and bumpers, a couple of crates in the bed
     kind 'jeep'     the army truck: matte olive, white stars, black bumpers, jerrycans and a spare wheel, ARMY plates
     kind 'monster'  the MONSTER TRUCK: glossy blue with flames, body lifted 1.15 m on long shocks, 2 m wheels
   colour overrides the paint.

   SIZE      Pickup and jeep: 2.1 m wide, 4.8 m long (4.96 with bumpers), cab roof 1.98 m.
             Monster: wheels 2.0 m across at x ±1.3 (3.2 m wide over the tyres), roof 3.13 m (before the game's
             VEHK.monster.sc = 1.15 scale).
   ORIGIN    Centre of the truck, on the ground.   FRONT  -z.
   SAME HOOKS AS mkVehModel:
             userData.wheels [{p, t, front}]: p at the wheel centre, t the tyre (the game spins t.rotation.x; the hub is
                             inside t so it rolls too). Pickup/jeep wheels: x ±1.02, z ±1.55, r 0.44 (VEHK.truck.whr).
                             Monster: x ±1.3, z ±1.55, r 1.0 (VEHK.monster.whr).
             userData.sw     steering wheel Group at (0.45, 1.42, -0.72) (+1.15 for the monster), rotation.x -1.15, turns on z
             userData.swAx   'z'
   SEATS     Unchanged: VEHK.truck seats (driver 0.45 / z -0.95, passenger -0.45, two in the bed at ±0.62, z 1.2,
             sitting on the wheel wells). The bench cushion is at y 1.0 like the old model.
   MONSTER   This model lifts the monster's body itself (by 1.15). The game must NOT also apply VEHK.monster.lift to it;
             keep applying VEHK.monster.sc (1.15).
   ALSO      Skip vehMore() extras for these three (mirrors, plates, exhaust, aerial are built in).
   ===================================================================================================== */
function mkPickup(kind,colour){
 kind=kind||'pickup';
 const g=new THREE.Group();const MON=kind=='monster',JEEP=kind=='jeep',LIFT=MON?1.15:0;
 const body=new THREE.Group();body.position.y=LIFT;g.add(body);/* everything but the wheels and the suspension */
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.45,metalness:.35},o||{}));
 const paintC=colour!=null?colour:MON?0x2a8ad8:JEEP?0x4a5a3a:0x8a3a2a;
 const paint=JEEP?M(paintC,{roughness:.85,metalness:.08}):M(paintC,{roughness:.32,metalness:.45}),dk=M(0x1a1a1a,{roughness:.85,metalness:0}),
  chrome=JEEP?M(0x26282a,{roughness:.7,metalness:.3}):M(0xd0d4d8,{metalness:.55,roughness:.22}),trim=M(0x2a2622,{roughness:.9,metalness:0}),seatM=M(JEEP?0x3a3a2a:0x5a3a26,{roughness:.8,metalness:0}),
  bedM=M(JEEP?0x3a4a2e:0x2e2a26,{roughness:.9,metalness:.2}),
  glass=new THREE.MeshStandardMaterial({color:0x9ac8e0,transparent:true,opacity:.28,roughness:.05,metalness:.3,side:THREE.DoubleSide,depthWrite:false}),
  hl=M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.7,roughness:.1}),tl=M(0x701010,{emissive:0xc01010,emissiveIntensity:.6,roughness:.2});
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||body).add(o);return o};
 const CYL=(r,len,m,x,y,z,ax,p,seg)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,seg||12),m);o.position.set(x,y,z);if(ax=='x')o.rotation.z=Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;(p||body).add(o);return o};
 const strip=(a,b,t,m)=>{const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),d=Bv.clone().sub(A);const o=new THREE.Mesh(new THREE.BoxGeometry(t,d.length(),t),m);o.position.copy(A).add(Bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());body.add(o);return o};
 const FONT='Arial';
 const B_T=.03;
 const extrude=(shape,w,m,x)=>{const geo=new THREE.ExtrudeGeometry(shape,{depth:w-2*B_T,bevelEnabled:true,bevelThickness:B_T,bevelSize:B_T,bevelSegments:2,curveSegments:14});
  const o=new THREE.Mesh(geo,m);o.rotation.y=-Math.PI/2;o.position.x=(x||0)+(w-2*B_T)/2;body.add(o);return o};
 const W=2.1,WZ=1.55,WR0=.44,AR=.52,BOT=.5;/* body width, wheel z, the (pickup) wheel radius the arches are cut for, arch radius, body bottom */
 /* ---------- front: hood, fenders and nose (z -2.4 … -0.95) ---------- */
 {const s=new THREE.Shape();s.moveTo(-.95,BOT);s.lineTo(-WZ+AR,BOT);s.lineTo(-WZ+AR,WR0);s.absarc(-WZ,WR0,AR,0,Math.PI,false);s.lineTo(-WZ-AR,BOT);s.lineTo(-2.3,BOT);
  s.quadraticCurveTo(-2.4,BOT+.02,-2.4,.66);s.lineTo(-2.4,1.06);s.quadraticCurveTo(-2.39,1.2,-2.26,1.22);s.lineTo(-1.45,1.28);s.lineTo(-1.38,1.32);s.lineTo(-.95,1.36);s.lineTo(-.95,BOT);
  extrude(s,W,paint)}
 /* ---------- cab: doors (thin slabs), floor, back wall with the rear window, roof, glass ---------- */
 for(const sd of[-1,1]){const s=new THREE.Shape();s.moveTo(-.97,BOT+.04);s.lineTo(-.18,BOT+.04);s.lineTo(-.18,1.38);s.lineTo(-.97,1.38);s.lineTo(-.97,BOT+.04);extrude(s,.1,paint,sd*1.0)}
 BX(1.92,.32,.8,dk,0,.68,-.58);BX(1.9,.03,.78,trim,0,.85,-.58);/* cab floor */
 for(const sd of[-1,1])BX(.03,.4,.74,trim,sd*.945,1.12,-.58);/* door cards */
 BX(2.06,.92,.1,paint,0,.96,-.15);/* back wall, below the window */
 for(const sd of[-1,1])BX(.3,.41,.1,paint,sd*.9,1.625,-.15);BX(2.06,.09,.1,paint,0,1.875,-.15);/* window posts and header, tucked under the roof */
 {const p=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.41),glass);p.position.set(0,1.625,-.15);body.add(p)}/* rear window */
 {const s=new THREE.Shape();const hw=1.0;s.moveTo(-hw,0);s.quadraticCurveTo(-hw,.05,-hw+.06,.06);s.lineTo(hw-.06,.06);s.quadraticCurveTo(hw,.05,hw,0);s.lineTo(-hw,0);
  const r=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:1.08,bevelEnabled:false,curveSegments:8}),paint);r.position.set(0,1.92,-1.18);body.add(r);BX(1.9,.02,1.0,M(0xd8d0c0,{roughness:.9,metalness:0}),0,1.91,-.66)}
 {const L=Math.hypot(.6,.23),ws=new THREE.Mesh(new THREE.PlaneGeometry(1.96,L),glass);ws.position.set(0,1.62,-1.28);ws.rotation.x=Math.atan2(.23,.6);body.add(ws)}/* windscreen, from (z -1.39, y 1.32) to (-1.17, 1.92) */
 const pane=(pts,x)=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))s.lineTo(p[0],p[1]);const m=new THREE.Mesh(new THREE.ShapeGeometry(s),glass);m.rotation.y=-Math.PI/2;m.position.x=x;body.add(m)};
 for(const sd of[-1,1]){pane([[-1.33,1.38],[-1.16,1.9],[-.2,1.9],[-.2,1.38]],sd*.995);strip([sd*1.0,1.32,-1.39],[sd*1.0,1.93,-1.17],.08,paint);strip([sd*1.04,1.39,-1.36],[sd*1.04,1.39,-.2],.03,chrome)}
 /* ---------- inside ---------- */
 BX(1.9,.12,.42,trim,0,1.42,-1.16);/* dash top, on the cowl; its back edge is at z -0.95 */
 {const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.fillStyle='#14120f';x.fillRect(0,0,256,64);
  for(const[cx,lbl]of[[70,'SPEED'],[186,JEEP?'TEMP':'FUEL']]){x.strokeStyle='#d8d0b8';x.lineWidth=2;x.beginPath();x.arc(cx,36,24,Math.PI*.8,Math.PI*2.2);x.stroke();x.fillStyle='#d8d0b8';x.font='9px '+FONT;x.textAlign='center';x.fillText(lbl,cx,58);x.strokeStyle='#ff6020';x.beginPath();x.moveTo(cx,36);x.lineTo(cx-14,24);x.stroke()}
  const p=new THREE.Mesh(new THREE.PlaneGeometry(.5,.125),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),emissive:0x40a0ff,emissiveIntensity:.15,roughness:.4}));p.position.set(.45,1.4,-.948);p.rotation.x=-.3;body.add(p)}
 const sw=new THREE.Group();sw.position.set(.45,1.42,-.72);/* its top edge stays 4 cm behind the dash */sw.rotation.x=-1.15;body.add(sw);
 {const r=new THREE.Mesh(new THREE.TorusGeometry(.19,.022,8,24),dk);sw.add(r);for(const a of[0,2.1,4.2]){const sp=new THREE.Mesh(new THREE.BoxGeometry(.17,.025,.02),dk);sp.position.set(Math.cos(a)*.085,Math.sin(a)*.085,0);sp.rotation.z=a;sw.add(sp)}
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.05,12),chrome);hub.rotation.x=Math.PI/2;sw.add(hub);const col=new THREE.Mesh(new THREE.CylinderGeometry(.03,.035,.36,8),dk);col.rotation.x=Math.PI/2;col.position.z=-.19;sw.add(col)}
 BX(1.6,.09,.42,trim,0,.895,-.66);BX(1.7,.13,.5,seatM,0,1.0,-.66);/* seat base and bench */{const bk=BX(1.7,.6,.1,seatM,0,1.34,-.36);bk.rotation.x=-.12}/* bench seat */
 if(JEEP){BX(.22,.05,.1,dk,-.6,1.5,-1.0);BX(.18,.15,.1,M(0x2a3a22),-.6,1.43,-1.0)}/* a radio */
 /* ---------- the bed ---------- */
 BX(1.92,.13,2.4,bedM,0,.965,1.22);/* bed floor: top at y 1.03, above the tyres */
 for(let i=0;i<6;i++)BX(.05,.012,2.38,chrome,-.75+i*.3,1.036,1.22);/* ribs on the floor */
 for(const sd of[-1,1]){const s=new THREE.Shape();s.moveTo(-.08,BOT);s.lineTo(WZ-AR,BOT);s.lineTo(WZ-AR,WR0);s.absarc(WZ,WR0,AR,Math.PI,0,true);s.lineTo(WZ+AR,BOT);s.lineTo(2.32,BOT);
  s.quadraticCurveTo(2.4,BOT+.02,2.4,.62);s.lineTo(2.4,1.55);s.lineTo(-.08,1.55);s.lineTo(-.08,BOT);extrude(s,.12,paint,sd*.99);
  BX(.16,.04,2.5,chrome,sd*.99,1.57,1.16);/* rail cap */
  BX(.24,.27,.94,bedM,sd*.82,1.165,WZ)}/* wheel wells inside the bed (the bed passengers sit on these) */
 BX(1.86,.52,.08,paint,0,1.29,-.04);/* front wall of the bed */
 BX(1.86,.92,.08,paint,0,1.06,2.4);BX(1.86,.03,.1,chrome,0,1.53,2.4);/* tailgate and its top */
 {const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d');x.clearRect(0,0,512,96);x.fillStyle=JEEP?'#e8e4d0':MON?'#ffd040':'#e8e4d8';x.font='bold 70px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText(JEEP?'U.S.D. ARMY':MON?'MONSTER':'DESERT WORKS',256,52,490);
  const p=new THREE.Mesh(new THREE.PlaneGeometry(1.3,.24),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),transparent:true,alphaTest:.3,roughness:.5}));p.position.set(0,1.2,2.446);body.add(p)}
 /* ---------- front and back details ---------- */
 const bumper=(z)=>{BX(2.0,.2,.16,chrome,0,.66,z);for(const sd of[-1,1]){const e=CYL(.1,.16,chrome,sd*1.0,.66,z,'z')}};bumper(-2.48);bumper(2.5);
 {const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');x.fillStyle='#111';x.fillRect(0,0,256,128);x.fillStyle=JEEP?'#3a3c3e':'#b8bcc0';for(let i=8;i<128;i+=14)x.fillRect(6,i,244,5);for(let i=0;i<256;i+=42)x.fillRect(i,0,4,128);
  const gm=M(0xffffff,{map:new THREE.CanvasTexture(c),metalness:.6,roughness:.3});BX(1.1,.42,.05,[chrome,chrome,chrome,chrome,chrome,gm],0,.94,-2.43);
  BX(1.18,.05,.06,chrome,0,1.17,-2.43);BX(1.18,.05,.06,chrome,0,.71,-2.43)}
 for(const sd of[-1,1]){CYL(.12,.05,hl,sd*.78,.95,-2.415,'z');const ring=new THREE.Mesh(new THREE.TorusGeometry(.125,.02,8,20),chrome);ring.position.set(sd*.78,.95,-2.44);body.add(ring);
  BX(.14,.06,.04,M(0xffa020,{emissive:0xff8000,emissiveIntensity:.3}),sd*.78,.76,-2.42);
  BX(.12,.36,.04,tl,sd*.92,1.28,2.452);BX(.14,.38,.02,chrome,sd*.92,1.28,2.442)}/* tail lights on the bed corners */
 const plate=(z,ry,y)=>{const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');x.fillStyle=JEEP?'#2a2a26':'#f0e8d0';x.fillRect(0,0,256,128);x.strokeStyle=JEEP?'#e8e4d0':'#2a2a2a';x.lineWidth=6;x.strokeRect(4,4,248,120);
  x.fillStyle=JEEP?'#e8e4d0':'#b03020';x.font='bold 22px '+FONT;x.textAlign='center';x.fillText(JEEP?'U.S.D. ARMY':'DESERT STATE',128,30);x.fillStyle=JEEP?'#e8e4d0':'#1a1a1a';x.font='bold 64px '+FONT;x.fillText(JEEP?'4X 213':MON?'MONSTR':'TRK 88',128,100,230);
  const p=new THREE.Mesh(new THREE.PlaneGeometry(.36,.18),M(0xffffff,{map:new THREE.CanvasTexture(c),metalness:.2,roughness:.5}));p.position.set(0,y,z);p.rotation.y=ry;body.add(p)};
 plate(-2.566,Math.PI,.66);plate(2.586,0,.66);
 for(const sd of[-1,1]){BX(.16,.03,.04,dk,sd*1.1,1.45,-.9);BX(.04,.16,.12,chrome,sd*1.18,1.48,-.9);BX(.015,.03,.14,chrome,sd*1.055,1.25,-.5)}/* mirrors, door handles */
 CYL(.007,.9,chrome,.95,1.95,-1.25,null);/* aerial */
 /* ---------- livery ---------- */
 const decal=(w,h,draw)=>{const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/w);draw(c.getContext('2d'),c.width,c.height);return new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),transparent:true,alphaTest:.3,roughness:.5,metalness:.1})};
 const star=(x,w,h)=>{x.fillStyle='#e8e4d0';x.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?w*.19:w*.46;x.lineTo(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r)}x.fill()};
 if(JEEP){const st=decal(.5,.5,(x,w,h)=>{x.strokeStyle='#e8e4d0';x.lineWidth=14;x.beginPath();x.arc(w/2,h/2,w*.46,0,7);x.stroke();star(x,w,h)});
  for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(.5,.5),st);p.position.set(sd*1.058,.95,-.58);p.rotation.y=sd*Math.PI/2;body.add(p)}
  {const p=new THREE.Mesh(new THREE.PlaneGeometry(.6,.6),st);p.rotation.x=-Math.PI/2-.07;p.position.set(0,1.29,-1.85);body.add(p)}/* star on the hood, following its slope */
  /* jerrycans in the bed and a spare wheel against the cab */
  for(let i=0;i<3;i++){const jc=BX(.32,.46,.16,M(0x3a5a2a,{roughness:.6}),-.5+i*.36,1.26,2.2);BX(.2,.03,.03,dk,-.5+i*.36,1.505,2.2)}
  {const sp=CYL(.42,.3,dk,.45,1.45,.18,'z',null,20);CYL(.2,.31,M(0x3a4a2e),.45,1.45,.18,'z')}}
 if(MON){const fl=decal(2.2,.5,(x,w,h)=>{const gr=x.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#ffe040');gr.addColorStop(.5,'#ff8020');gr.addColorStop(1,'rgba(220,40,20,0)');x.fillStyle=gr;
  for(let i=0;i<7;i++){x.beginPath();const y0=h*(.15+i*.11);x.moveTo(0,y0);x.quadraticCurveTo(w*.35,y0-h*.25,w*(.55+.06*(i%3)),y0+h*.02);x.quadraticCurveTo(w*.3,y0+h*.12,0,y0+h*.1);x.fill()}});
  for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(2.2,.5),fl);p.position.set(sd*1.058,.9,-1.25);p.rotation.y=sd*Math.PI/2;if(sd<0)p.scale.x=-1;body.add(p)}
  BX(1.6,.12,.12,M(0x1a1a1a),0,2.05,-.6);for(let i=0;i<4;i++)CYL(.07,.08,M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.6}),-.5+i*.33,2.05,-.67,'z')}/* roof light bar */
 if(!JEEP&&!MON){for(let i=0;i<2;i++){const cr=BX(.45,.36,.45,M(0x9a7048,{roughness:.9,metalness:0}),-.2+i*.5,1.21,1.9);cr.rotation.y=i*.4}}
 /* ---------- underneath ---------- */
 const U=M(0x26282a,{roughness:.7,metalness:.4}),U2=M(0x3a3c3e,{roughness:.6,metalness:.5}),rust=M(0x5a3a26,{roughness:.8,metalness:.3});
 for(const sd of[-1,1])BX(.12,.14,4.6,U,sd*.6,.45,0);for(const z of[-1.9,-.6,.6,2.1])BX(1.32,.1,.12,U,0,.45,z);
 BX(.7,.3,.9,U2,0,.42,-1.85);/* engine sump */BX(.34,.24,.6,U2,0,.42,-.7);CYL(.045,2.1,U2,0,.42,.35,'z');/* gearbox, drive shaft */
 CYL(.04,3.6,M(0x5a5048,{roughness:.6,metalness:.5}),-.62,.42,.5,'z');BX(.24,.18,.7,M(0x4a4440,{roughness:.6,metalness:.5}),-.62,.42,.9);CYL(.045,.22,chrome,-.62,.42,2.42,'z');/* exhaust */
 BX(.9,.2,.45,U,.2,.42,2.0);/* fuel tank */
 /* ---------- wheels and suspension (not lifted with the body) ---------- */
 const WR=MON?1.0:WR0,WX=MON?1.38:1.02,TW=MON?.62:.34;/* the monster's wheels sit just outside the body */
 const wheels=[];
 const tread=(()=>{const c=document.createElement('canvas');c.width=64;c.height=64;const x=c.getContext('2d');x.fillStyle='#1a1a1a';x.fillRect(0,0,64,64);x.fillStyle='#0c0c0c';for(let i=0;i<64;i+=16){x.fillRect(0,i,28,8);x.fillRect(36,i+8,28,8)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,MON?14:7);return t})();
 const tyreM=[M(0xffffff,{map:tread,roughness:.9,metalness:0}),dk,dk];/* tread on the round face, plain sides */
 for(const[x,z]of[[-WX,-WZ],[WX,-WZ],[-WX,WZ],[WX,WZ]]){const p=new THREE.Group();p.position.set(x,WR,z);g.add(p);
  const t=new THREE.Mesh(new THREE.CylinderGeometry(WR,WR,TW,26),tyreM);t.rotation.z=Math.PI/2;p.add(t);
  for(const s of[-1,1]){const sh=new THREE.Mesh(new THREE.TorusGeometry(WR-.045,.045,6,26),dk);sh.position.set(0,s*(TW/2-.03),0);sh.rotation.x=Math.PI/2;t.add(sh)}
  /* the wheel: steel (army), chrome (pickup) or a big six-spoke (monster), inside t so it rolls */
  const rimR=MON?.55:.26,rimM=JEEP?M(0x3a4a2e,{roughness:.6,metalness:.3}):M(0xc8ccd0,{metalness:.5,roughness:.25});
  t.add(new THREE.Mesh(new THREE.CylinderGeometry(rimR,rimR,TW+.01,20),rimM));
  t.add(new THREE.Mesh(new THREE.CylinderGeometry(rimR*.3,rimR*.36,TW+.03,12),M(0x8a9094,{metalness:.5,roughness:.35})));
  const nS=MON?6:JEEP?5:8;for(let i=0;i<nS;i++){const a=i/nS*6.283;const sp=new THREE.Mesh(new THREE.BoxGeometry(rimR*.55,TW+.02,MON?.09:.035),M(0x6a7074,{metalness:.5,roughness:.35}));sp.position.set(Math.cos(a)*rimR*.6,0,Math.sin(a)*rimR*.6);sp.rotation.y=-a;t.add(sp)}
  wheels.push({p,t,front:z<0})}
 /* axles, springs and shocks: from the wheels up to the body (long ones on the monster) */
 for(const z of[-WZ,WZ]){CYL(.05,WX*2-TW,U2,0,WR,z,'x',g);for(const sd of[-1,1]){CYL(.15,.1,U2,sd*(WX-TW/2-.05),WR,z,'x',g);
   const top=MON?LIFT+.5:.8,bot=WR,h=top-bot;if(h>.05){const sx=sd*(WX-TW/2-.25);CYL(.045,h,MON?M(0xd8b020,{metalness:.5,roughness:.3}):U2,sx,bot+h/2,z+.15,null,g);CYL(.07,h*.45,MON?M(0x2a2a2e):rust,sx,bot+h*.35,z+.15,null,g);
    if(MON){CYL(.045,h,M(0xd8b020,{metalness:.5,roughness:.3}),sx,bot+h/2,z-.15,null,g);/* link bars */strip2(g,[sx*.4,top-.05,z],[sx,bot,z],.06,U2)}}}}
 if(MON)for(const sd of[-1,1])strip2(g,[sd*.6,LIFT+.4,-WZ],[sd*.6,LIFT+.4,WZ],.1,U2);
 function strip2(par,a,b,t,m){const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),d=Bv.clone().sub(A);const o=new THREE.Mesh(new THREE.BoxGeometry(t,d.length(),t),m);o.position.copy(A).add(Bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());par.add(o)}
 g.userData.wheels=wheels;g.userData.sw=sw;g.userData.swAx='z';
 return g}

/* ---------- docs/design/models/fast-cars.js ---------- */
/* =====================================================================================================
   mkFastCar(kind, colour): the four fast cars. Replaces the 'sport', 'muscle', 'hotrod' and 'dragster' branches of
   mkVehModel (bak519, the r407 vehicles).
     'sport'     a low red wedge supercar: side intakes, a rear wing, a full-width tail light, twin exhausts
     'muscle'    a black fastback with twin white stripes, hood scoop, quad headlights, fat rear tyres in flares
     'hotrod'    an open roadster: tall chrome grille shell, engine out in the open with a blower and headers,
                 cycle fenders, chopped windscreen, flames
     'dragster'  a long front-engine rail: tiny spoked front wheels ON THE GROUND, huge rear slicks, blower,
                 zoomie pipes, roll cage, butterfly steering wheel, tall rear wing, parachute pack
   colour overrides the paint (sport red, muscle black, hot rod deep red, dragster yellow).

   ORIGIN    Centre of the car on the ground.   FRONT  -z.
   SIZES / WHEELS / SEATS are the same as the old models (VEHK.sport/muscle/hotrod/dragster):
     sport     2.0 × 4.3 m, roof 1.43 m.  Wheels (±0.95, ±1.4) r 0.36.         Seats (±0.42, z -0.05); steering wheel (0.42, 1.0, -0.3)
     muscle    2.12 × 4.9 m, roof 1.62 m. Wheels front (±1.0, -1.5) r 0.38, rear (±1.0, 1.55) r 0.42.
               Seats (±0.45, z 0.35) and the back (±0.42, z 1.25)
     hotrod    1.96 × 4.2 m, screen top 1.3 m. Wheels front (±0.95, -1.3) r 0.3, rear (±0.95, 1.3) r 0.46.
               Seats (±0.4, z 0.5)
     dragster  1.9 × 8.4 m (with the wing), wing top 2.15 m. Wheels front (±0.65, -3.6) r 0.2, rear (±0.95, 2.4) r 0.6.
               Seat (0, z 1.3)
   HOOKS     As mkVehModel: userData.wheels [{p, t, front}] (hub inside t, so it rolls), userData.sw (steering
             wheel Group, turns on z), userData.swAx 'z'. Every wheel's p sits at y = its own radius, so all four
             tyres touch the ground (the dragster's front wheels too).
             The game rolls every wheel by v.v·dt / K.whr. Wheels with a different radius (dragster fronts, muscle and
             hot rod rears) would look like they slip: each wheel's t has userData.r; use it instead of K.whr if you can.
   ALSO      Skip vehMore() extras for these four (mirrors, plates, exhausts are built in).
   ===================================================================================================== */
function mkFastCar(kind,colour){
 const g=new THREE.Group();
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.45,metalness:.35},o||{}));
 const paintC=colour!=null?colour:{sport:0xd02020,muscle:0x1a1a1e,hotrod:0x8a1818,dragster:0xf0d020}[kind];
 const paint=M(paintC,{roughness:.25,metalness:.5}),dk=M(0x1a1a1a,{roughness:.85,metalness:0}),blk=M(0x111214,{roughness:.5,metalness:.4}),
  chrome=M(0xd0d4d8,{metalness:.55,roughness:.2}),trim=M(0x2a2622,{roughness:.9,metalness:0}),seatM=M(kind=='sport'?0x1a1a1c:0x6a2a1a,{roughness:.75,metalness:0}),
  glass=new THREE.MeshStandardMaterial({color:0x9ac8e0,transparent:true,opacity:.28,roughness:.05,metalness:.3,side:THREE.DoubleSide,depthWrite:false}),
  hl=M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.7,roughness:.1}),tl=M(0x701010,{emissive:0xc01010,emissiveIntensity:.6,roughness:.2}),
  U=M(0x26282a,{roughness:.7,metalness:.4}),U2=M(0x3a3c3e,{roughness:.6,metalness:.5});
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const CYL=(r1,r2,len,m,x,y,z,ax,p,seg)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,seg||14),m);o.position.set(x,y,z);if(ax=='x')o.rotation.z=Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;(p||g).add(o);return o};
 const rod=(a,b,r,m,p)=>{const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),d=Bv.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),8),m);o.position.copy(A).add(Bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());(p||g).add(o);return o};
 const FONT='Arial';
 const B_T=.03;
 const extrude=(shape,w,m,x)=>{const geo=new THREE.ExtrudeGeometry(shape,{depth:w-2*B_T,bevelEnabled:true,bevelThickness:B_T,bevelSize:B_T,bevelSegments:2,curveSegments:14});
  const o=new THREE.Mesh(geo,m);o.rotation.y=-Math.PI/2;o.position.x=(x||0)+(w-2*B_T)/2;g.add(o);return o};
 /* a side-profile shape: bottom from zA to zB with wheel arches, then the top line (points from the far end back to zA) */
 const profile=(zA,zB,bot,arches,top)=>{const s=new THREE.Shape();const dir=zB>zA?1:-1;s.moveTo(zA,bot);
  for(const[az,ay,ar]of arches.slice().sort((a,b)=>dir*(a[0]-b[0]))){const near=az-dir*ar,far=az+dir*ar;s.lineTo(near,bot);s.lineTo(near,ay);s.absarc(az,ay,ar,dir>0?Math.PI:0,dir>0?0:Math.PI,dir>0);s.lineTo(far,bot)}
  s.lineTo(zB,bot);for(const p of top)s.lineTo(p[0],p[1]);s.lineTo(zA,bot);return s};
 const pane=(pts,x)=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))s.lineTo(p[0],p[1]);const m=new THREE.Mesh(new THREE.ShapeGeometry(s),glass);m.rotation.y=-Math.PI/2;m.position.x=x;g.add(m)};
 const slope=(w,z0,y0,z1,y1,m)=>{const L=Math.hypot(z1-z0,y1-y0),p=new THREE.Mesh(new THREE.PlaneGeometry(w,L),m);p.position.set(0,(y0+y1)/2,(z0+z1)/2);p.rotation.x=Math.atan2(z1-z0,y1-y0);/* runs from (z0,y0) up to (z1,y1) */g.add(p);return p};
 const decal=(w,h,draw,o)=>{const c=document.createElement('canvas');c.width=512;c.height=Math.max(8,Math.round(512*h/w));draw(c.getContext('2d'),c.width,c.height);return new THREE.MeshStandardMaterial(Object.assign({map:new THREE.CanvasTexture(c),transparent:true,alphaTest:.3,roughness:.4,metalness:.2},o||{}))};
 const plate=(txt,z,ry,y,x)=>{const c=document.createElement('canvas');c.width=256;c.height=128;const k=c.getContext('2d');k.fillStyle='#f0e8d0';k.fillRect(0,0,256,128);k.strokeStyle='#2a2a2a';k.lineWidth=6;k.strokeRect(4,4,248,120);
  k.fillStyle='#b03020';k.font='bold 22px '+FONT;k.textAlign='center';k.fillText('DESERT STATE',128,30);k.fillStyle='#1a1a1a';k.font='bold 64px '+FONT;k.fillText(txt,128,100,230);
  const p=new THREE.Mesh(new THREE.PlaneGeometry(.36,.18),M(0xffffff,{map:new THREE.CanvasTexture(c),metalness:.2,roughness:.5}));p.position.set(x||0,y,z);p.rotation.y=ry;g.add(p)};
 /* the steering wheel and the hook */
 let sw=null;const steer=(x,y,z,tilt,r,butterfly)=>{const s=new THREE.Group();s.position.set(x,y,z);s.rotation.x=tilt;g.add(s);
  if(butterfly){for(const sd of[-1,1]){const h=new THREE.Mesh(new THREE.TorusGeometry(.07,.016,6,12,Math.PI),dk);h.position.x=sd*.08;h.rotation.z=sd>0?-Math.PI/2:Math.PI/2;s.add(h)}const b=new THREE.Mesh(new THREE.BoxGeometry(.16,.03,.03),dk);s.add(b)}
  else{s.add(new THREE.Mesh(new THREE.TorusGeometry(r||.17,.02,8,24),dk));for(const a of[0,2.1,4.2]){const sp=new THREE.Mesh(new THREE.BoxGeometry((r||.17)*.9,.022,.02),chrome);sp.position.set(Math.cos(a)*(r||.17)*.45,Math.sin(a)*(r||.17)*.45,0);sp.rotation.z=a;s.add(sp)}}
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.05,10),chrome);hub.rotation.x=Math.PI/2;s.add(hub);const col=new THREE.Mesh(new THREE.CylinderGeometry(.025,.03,.3,8),dk);col.rotation.x=Math.PI/2;col.position.z=-.16;s.add(col);sw=s};
 const bucket=(x,y,z,w)=>{BX(w,.1,.48,seatM,x,y,z);const b=BX(w,.6,.1,seatM,x,y+.33,z+.26);b.rotation.x=-.18;for(const sd of[-1,1])BX(.06,.22,.42,seatM,x+sd*(w/2-.03),y+.13,z)};
 /* wheels: tyre t (rolls), the rim and spokes inside it */
 const wheels=[];
 const wheel=(x,z,r,wd,style)=>{const p=new THREE.Group();p.position.set(x,r,z);g.add(p);
  const tread=(()=>{const c=document.createElement('canvas');c.width=64;c.height=64;const k=c.getContext('2d');k.fillStyle='#1a1a1a';k.fillRect(0,0,64,64);if(style!='slick'){k.fillStyle='#0c0c0c';for(let i=0;i<64;i+=8)k.fillRect(0,i,64,3)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,Math.max(2,Math.round(r*14)));return t})();
  /* a spoked wheel is a thin tyre ring you can see through; the others are solid tyres */
  let t;if(style=='spoke'){const tg=new THREE.TorusGeometry(r-wd*.55,wd*.55,8,Math.max(18,Math.round(r*60)));tg.rotateX(Math.PI/2);t=new THREE.Mesh(tg,dk)}
  else t=new THREE.Mesh(new THREE.CylinderGeometry(r,r,wd,Math.max(14,Math.round(r*40))),[M(0xffffff,{map:tread,roughness:.9,metalness:0}),dk,dk]);
  t.rotation.z=Math.PI/2;t.userData.r=r;p.add(t);
  if(wd>.12&&style!='spoke')for(const s of[-1,1]){const sh=new THREE.Mesh(new THREE.TorusGeometry(r-Math.min(.05,wd*.12),Math.min(.05,wd*.12),6,Math.max(14,Math.round(r*40))),dk);sh.position.set(0,s*(wd/2-Math.min(.04,wd*.1)),0);sh.rotation.x=Math.PI/2;t.add(sh)}
  if(style=='white'){/* raised white letters band on the outside wall */const ring=new THREE.Mesh(new THREE.RingGeometry(r*.72,r*.84,32),M(0xe8e4d8,{roughness:.8,metalness:0,side:THREE.DoubleSide}));ring.rotation.x=Math.PI/2;ring.position.y=(x>0?1:-1)*(wd/2+.002);t.add(ring)}
  if(style=='spoke'){/* thin wire wheel: a rim and spokes */const rim=new THREE.Mesh(new THREE.TorusGeometry(r*.78,.012,6,24),chrome);rim.rotation.x=Math.PI/2;t.add(rim);for(let i=0;i<10;i++){const a=i/10*6.283;const sp=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,r*.75,4),chrome);sp.position.set(Math.cos(a)*r*.38,0,Math.sin(a)*r*.38);sp.rotation.set(Math.PI/2,0,0);sp.rotation.z=0;sp.lookAt(0,0,0);const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.cos(a),0,Math.sin(a)));sp.quaternion.copy(q);t.add(sp)}t.add(new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,wd+.04,8),chrome))}
  else{const rr=r*(style=='slick'?.55:.66);t.add(new THREE.Mesh(new THREE.CylinderGeometry(rr,rr,wd+.01,20),style=='slick'?M(0x8a9094,{metalness:.55,roughness:.3}):chrome));
   const nS=style=='slick'?8:5;for(let i=0;i<nS;i++){const a=i/nS*6.283;const sp=new THREE.Mesh(new THREE.BoxGeometry(rr*.55,wd+.02,.04),M(0x6a7074,{metalness:.5,roughness:.35}));sp.position.set(Math.cos(a)*rr*.6,0,Math.sin(a)*rr*.6);sp.rotation.y=-a;t.add(sp)}
   t.add(new THREE.Mesh(new THREE.CylinderGeometry(rr*.25,rr*.3,wd+.04,10),chrome))}
  wheels.push({p,t,front:z<0});return p};
 const axle=(z,x,y,w)=>{CYL(.04,.04,x*2-w,U2,0,y,z,'x');for(const sd of[-1,1])CYL(.1,.1,.07,U2,sd*(x-w/2-.04),y,z,'x')};

 /* =================================================================== SPORT */
 if(kind=='sport'){const W=2.04,WZ=1.4,R=.36,AR=.42,BOT=.2,BL=.82,RY=1.38;
  extrude(profile(-.85,-2.15,BOT,[[-WZ,R,AR]],[[-2.15,.3],[-2.18,.42],[-2.0,.56],[-1.4,.7],[-.85,BL]]),W,paint);
  extrude(profile(.75,2.15,BOT,[[WZ,R,AR]],[[2.15,.36],[2.15,.78],[2.02,.88],[1.3,.86],[.75,BL]]),W,paint);
  for(const sd of[-1,1]){extrude(profile(-.87,.77,BOT+.03,[],[[.77,BL],[-.87,BL]]),.1,paint,sd*.97);
   BX(.04,.2,.55,blk,sd*1.03,.6,.95);/* side intake on the rear fender */
   pane([[-.8,BL+.02],[-.25,RY-.02],[.4,RY-.02],[.95,BL+.02]],sd*.94);rod([sd*.94,BL,-.85],[sd*.92,RY,-.25],.035,paint);rod([sd*.94,BL,.95],[sd*.92,RY,.45],.04,paint)}
  /* roof and glass */BX(1.8,.05,.72,paint,0,RY+.025,.1);BX(1.76,.02,.7,trim,0,RY-.01,.1);
  slope(1.84,-.85,BL+.02,-.25,RY,glass);slope(1.8,1.3,.87,.45,RY,glass);/* rear glass edges sit inside the sail panels */
  for(const sd of[-1,1])extrude((()=>{const t=new THREE.Shape();t.moveTo(.93,BL-.02);t.lineTo(1.34,BL+.02);t.lineTo(.43,RY+.0);t.lineTo(.93,BL-.02);return t})(),.1,paint,sd*.93);/* sail panels: close the gap between the side window and the sloped rear glass */
  BX(1.96,.03,1.9,M(0x111214,{roughness:.8,metalness:.1}),0,BOT-.01,0);/* flat floor */BX(1.8,.03,1.5,trim,0,.42,-.05);
  BX(1.7,.22,.3,trim,0,.92,-.72);/* dash */steer(.42,1.0,-.3,-1.2,.16);/* well behind the windscreen */bucket(.42,.5,-.05,.5);bucket(-.42,.5,-.05,.5);
  /* lights: thin wedge headlights, a full-width tail light, twin exhausts */
  for(const sd of[-1,1]){const h=BX(.42,.06,.1,hl,sd*.62,.55,-2.03);h.rotation.x=.35}
  BX(1.8,.07,.04,tl,0,.74,2.165);BX(1.84,.09,.02,blk,0,.74,2.152);
  for(const sd of[-1,1])CYL(.05,.05,.16,chrome,sd*.18,.34,2.15,'z');BX(1.5,.1,.08,blk,0,.3,2.18);/* diffuser */
  BX(1.6,.12,.08,blk,0,.3,-2.17);/* chin splitter */
  /* the rear wing */BX(1.84,.04,.36,blk,0,1.06,1.95);for(const sd of[-1,1]){BX(.04,.18,.36,blk,sd*.92,1.06,1.95);BX(.05,.18,.08,blk,sd*.6,.95,1.98)}
  for(const sd of[-1,1]){BX(.12,.05,.04,blk,sd*1.0,.95,-.75);BX(.04,.07,.12,paint,sd*1.07,.97,-.75)}/* mirrors */
  plate('FAST 1',2.172,0,.5);
  {const st=decal(1.2,.16,(k,w,h)=>{k.fillStyle='#f0f0e8';k.font='italic bold '+(h*.8|0)+'px '+FONT;k.textAlign='center';k.textBaseline='middle';k.fillText('V12  ·  DESERT GT',w/2,h/2,w-10)});for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.16),st);p.position.set(sd*1.0,.4,-.05);p.rotation.y=sd*Math.PI/2;g.add(p)}}
  for(const[x,z]of[[-.95,-WZ],[.95,-WZ],[-.95,WZ],[.95,WZ]])wheel(x,z,R,.3,'alloy');axle(-WZ,.95,R,.3);axle(WZ,.95,R,.3);
  for(const sd of[-1,1])BX(.1,.08,3.4,U,sd*.5,.25,0)}

 /* =================================================================== MUSCLE */
 else if(kind=='muscle'){const W=2.06,BOT=.24,BL=.98,RY=1.56;
  extrude(profile(-.95,-2.45,BOT,[[-1.5,.38,.44]],[[-2.45,.4],[-2.45,.86],[-2.36,.94],[-.95,BL]]),W,paint);
  extrude(profile(.95,2.45,BOT,[[1.55,.42,.48]],[[2.45,.4],[2.45,.9],[2.32,.98],[.95,BL]]),W,paint);
  for(const sd of[-1,1]){extrude(profile(-.97,.97,BOT+.03,[],[[.97,BL],[-.97,BL]]),.1,paint,sd*.98);
   /* rear flares over the fat tyres */const fl=new THREE.Mesh(new THREE.TorusGeometry(.5,.07,6,18,Math.PI),paint);fl.rotation.y=Math.PI/2;fl.position.set(sd*1.06,.42,1.55);g.add(fl);
   pane([[-.9,BL+.02],[-.22,RY-.02],[1.05,RY-.02],[1.05,BL+.02]],sd*.95);rod([sd*.96,BL,-.95],[sd*.94,RY,-.2],.04,paint);rod([sd*.97,BL,1.12],[sd*.94,RY,1.1],.08,paint)}
  BX(1.86,.06,1.32,paint,0,RY+.03,.45);BX(1.8,.02,1.3,trim,0,RY-.01,.45);
  slope(1.86,-.95,BL+.02,-.2,RY,glass);slope(1.8,2.1,1.0,1.1,RY,glass);/* rear glass edges sit inside the sail panels */
  for(const sd of[-1,1])extrude((()=>{const t=new THREE.Shape();t.moveTo(1.06,BL-.02);t.lineTo(2.16,BL+.0);t.lineTo(1.06,RY+.0);t.lineTo(1.06,BL-.02);return t})(),.1,paint,sd*.94);/* fastback sail panels */
  BX(1.96,.03,1.9,U,0,BOT+.02,0);BX(1.86,.03,1.9,trim,0,.5,.3);/* floor */
  BX(1.8,.24,.36,trim,0,1.0,-.38);/* dash: its back face at z -0.2 */steer(.45,1.12,.06,-1.15,.18);
  bucket(.45,.64,.35,.56);bucket(-.45,.64,.35,.56);BX(1.6,.1,.42,seatM,0,1.03,1.12);{const b=BX(1.6,.3,.08,seatM,0,1.19,1.36);b.rotation.x=-.3}/* the rear bench: its back stays 8 cm under the fastback glass */
  /* hood scoop, grille with quad lights, chrome bumpers, tail lights, stripes */
  BX(.7,.1,.8,paint,0,1.02,-1.6);BX(.6,.07,.03,blk,0,1.03,-2.0);
  BX(1.9,.38,.04,blk,0,.66,-2.475);for(const sd of[-1,1])for(const o of[.55,.82]){CYL(.085,.085,.05,hl,sd*o,.67,-2.492,'z');const r=new THREE.Mesh(new THREE.TorusGeometry(.09,.012,6,16),chrome);r.position.set(sd*o,.67,-2.517);g.add(r)}/* lamp faces 2 cm in front of the grille panel (it ends at z -2.495) */
  BX(2.0,.1,.12,chrome,0,.4,-2.5);BX(2.0,.1,.12,chrome,0,.4,2.5);
  for(const sd of[-1,1])BX(.7,.13,.04,tl,sd*.55,.75,2.465);
  {const s=decal(.4,4.9,(k,w,h)=>{k.fillStyle='#f0f0ea';k.fillRect(w*.04,0,w*.36,h);k.fillRect(w*.6,0,w*.36,h)});
   const top=(z0,z1,y,tilt)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(.42,z1-z0),s);p.rotation.x=-Math.PI/2-(tilt||0);p.position.set(0,y,(z0+z1)/2);g.add(p)};
   /* each stripe sits 8 mm above the panel it's on: the hood rises 4 cm towards the windscreen, the trunk lid is flat at 1.01 */
   top(-2.3,-1.0,.998,Math.atan2(.04,1.41));top(-.2,1.1,RY+.07);top(2.0,2.3,1.02)}
  for(const sd of[-1,1]){CYL(.05,.05,.3,chrome,sd*.55,.3,2.4,'z')}/* twin exhausts */
  plate('MUSCL 69',-2.565,Math.PI,.4);plate('MUSCL 69',2.565,0,.4);
  for(const sd of[-1,1]){BX(.12,.04,.04,chrome,sd*1.03,1.05,-.85);BX(.04,.08,.12,chrome,sd*1.1,1.07,-.85)}
  for(const[x,z,r,w]of[[-1.0,-1.5,.38,.3],[1.0,-1.5,.38,.3],[-1.0,1.55,.42,.4],[1.0,1.55,.42,.4]])wheel(x,z,r,w,'white');axle(-1.5,1.0,.38,.3);axle(1.55,1.0,.42,.4);
  {const d=new THREE.Mesh(new THREE.SphereGeometry(.14,12,8),U2);d.position.set(0,.42,1.55);g.add(d)}CYL(.045,.045,2.6,U2,0,.36,.2,'z');for(const sd of[-1,1])BX(.1,.1,4.2,U,sd*.55,.3,0)}

 /* =================================================================== HOT ROD */
 else if(kind=='hotrod'){const BOT=.42;
  /* the tub: an open two-seater with a rear deck */
  extrude(profile(.82,1.65,BOT,[],[[1.65,.55],[1.6,.9],[1.3,.98],[.82,1.0]]),1.34,paint);/* rear deck, behind the seats */
  for(const sd of[-1,1])extrude(profile(-.27,.84,BOT,[],[[.84,1.0],[-.27,1.0]]),.08,paint,sd*.63);/* cockpit sides */
  BX(1.2,.06,1.1,trim,0,.48,.29);BX(1.26,.56,.06,paint,0,.72,-.26);/* floor and firewall */
  /* the nose: narrow hood sides, a tall chrome grille shell */
  extrude(profile(-.25,-1.95,BOT,[],[[-1.95,.5],[-1.95,.86],[-1.85,.9],[-.25,.96]]),.86,paint);
  {const gs=new THREE.Shape();gs.moveTo(-.38,.42);gs.lineTo(.38,.42);gs.lineTo(.4,1.02);gs.quadraticCurveTo(0,1.2,-.4,1.02);gs.lineTo(-.38,.42);
   const gm=new THREE.Mesh(new THREE.ExtrudeGeometry(gs,{depth:.1,bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:2}),chrome);gm.position.z=-2.1;g.add(gm);
   const c=document.createElement('canvas');c.width=128;c.height=128;const k=c.getContext('2d');k.fillStyle='#111';k.fillRect(0,0,128,128);k.fillStyle='#b8bcc0';for(let i=0;i<128;i+=10)k.fillRect(i,0,4,128);
   const gi=new THREE.Mesh(new THREE.PlaneGeometry(.62,.5),M(0xffffff,{map:new THREE.CanvasTexture(c),metalness:.6,roughness:.3}));gi.position.set(0,.72,-2.125);gi.rotation.y=Math.PI;g.add(gi)}
  /* the engine, in the open on top of the hood: block, blower, injector stacks, headers */
  BX(.62,.28,.9,M(0x8a1818,{roughness:.4,metalness:.4}),0,1.06,-1.15);BX(.4,.22,.7,chrome,0,1.3,-1.15);
  for(const z of[-1.4,-1.15,-.9])for(const sd of[-1,1])CYL(.035,.035,.18,chrome,sd*.1,1.5,z);
  BX(.5,.04,.8,blk,0,1.42,-1.15);
  for(const sd of[-1,1])for(let i=0;i<4;i++){const z=-1.45+i*.2;rod([sd*.32,1.0,z],[sd*.52,.85,z+.05],.03,chrome);rod([sd*.52,.85,z+.05],[sd*.55,.62,-.3],.03,chrome)}
  for(const sd of[-1,1])CYL(.06,.05,1.6,chrome,sd*.57,.6,.5,'z');/* side pipes */
  /* chopped windscreen */for(const sd of[-1,1])rod([sd*.6,1.0,-.24],[sd*.58,1.3,-.2],.02,chrome);BX(1.18,.02,.03,chrome,0,1.3,-.2);{const ws=new THREE.Mesh(new THREE.PlaneGeometry(1.14,.28),glass);ws.position.set(0,1.15,-.22);ws.rotation.x=-.12;g.add(ws)}
  BX(1.1,.12,.2,trim,0,.95,-.15);/* dash */steer(.4,1.0,.05,-1.2,.17);
  BX(1.12,.1,.5,seatM,0,.62,.5);{const b=BX(1.12,.5,.1,seatM,0,.9,.76);b.rotation.x=-.2}/* bench */
  /* front: dropped axle, a leaf spring, cycle-less wheels; back: cycle fenders over the fat rears */
  BX(1.7,.05,.06,chrome,0,.3,-1.3);BX(.9,.04,.08,U2,0,.42,-1.3);for(const sd of[-1,1])rod([sd*.85,.3,-1.3],[sd*.3,.45,-1.6],.02,chrome);
  for(const sd of[-1,1]){const f=new THREE.Mesh(new THREE.CylinderGeometry(.56,.56,.52,24,1,true,.3,2.3),M(paintC,{roughness:.25,metalness:.5,side:THREE.DoubleSide}));f.rotation.z=Math.PI/2;f.position.set(sd*.95,.46,1.3);g.add(f)}/* cycle fenders over the rear wheels */
  /* headlights on stalks, tail lights, flames on the hood sides */
  for(const sd of[-1,1]){rod([sd*.45,.75,-1.85],[sd*.62,.95,-1.85],.02,chrome);const h=CYL(.11,.13,.14,chrome,sd*.65,.98,-1.88,'z');CYL(.1,.1,.02,hl,sd*.65,.98,-1.96,'z');CYL(.05,.05,.04,tl,sd*.35,.75,1.66,'z')}
  {const fl=decal(1.6,.4,(k,w,h)=>{const gr=k.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#ffe040');gr.addColorStop(.6,'#ff7020');gr.addColorStop(1,'rgba(200,30,10,0)');k.fillStyle=gr;
   for(let i=0;i<6;i++){k.beginPath();const y0=h*(.15+i*.13);k.moveTo(0,y0);k.quadraticCurveTo(w*.35,y0-h*.25,w*(.6+.08*(i%3)),y0+h*.03);k.quadraticCurveTo(w*.3,y0+h*.12,0,y0+h*.1);k.fill()}});
   for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.4),fl);p.position.set(sd*.442,.72,-1.15);p.rotation.y=sd*Math.PI/2;if(sd>0)p.scale.x=-1;g.add(p)}}
  plate('HOT 32',1.67,0,.6);
  for(const[x,z,r,w]of[[-.95,-1.3,.3,.2],[.95,-1.3,.3,.2],[-.95,1.3,.46,.46],[.95,1.3,.46,.46]])wheel(x,z,r,w,z<0?'spoke':'white');axle(1.3,.95,.46,.46);
  {const d=new THREE.Mesh(new THREE.SphereGeometry(.13,12,8),U2);d.position.set(0,.46,1.3);g.add(d)}for(const sd of[-1,1])BX(.08,.08,3.6,U,sd*.4,.42,-.1)}

 /* =================================================================== DRAGSTER */
 else if(kind=='dragster'){
  /* the frame: two long rails from the nose to the rear axle, cross tubes */
  for(const sd of[-1,1]){rod([sd*.2,.32,-3.9],[sd*.32,.38,-.6],.03,chrome);rod([sd*.32,.38,-.6],[sd*.4,.42,2.4],.035,chrome);rod([sd*.2,.5,-3.6],[sd*.32,.6,-.6],.02,chrome)}
  for(const z of[-3.6,-2.6,-1.6,-.6,.4,1.4])rod([-.35,.38,z],[.35,.38,z],.02,chrome);
  /* the long nose body over the front rails */
  extrude(profile(-.4,-4.0,.27,[],[[-4.0,.33],[-3.95,.42],[-.9,.6],[-.4,.62]]),.52,paint);
  /* the engine ahead of the driver: block, blower, a short scoop, zoomie pipes */
  BX(.56,.36,.9,M(0x2a2a2e,{roughness:.4,metalness:.5}),0,.72,-.05);BX(.38,.2,.6,chrome,0,1.0,-.05);BX(.3,.08,.28,blk,0,1.14,-.05);
  for(const sd of[-1,1])for(let i=0;i<4;i++){const z=-.35+i*.2;rod([sd*.28,.78,z],[sd*.62,1.1,z+.25],.04,chrome)}/* zoomies, angled up and back */
  /* the driver's cell: seat, a body panel, roll cage, butterfly wheel */
  for(const sd of[-1,1])extrude(profile(.45,1.95,.3,[],[[1.95,.4],[1.9,.85],[1.6,.92],[.45,.8]]),.1,paint,sd*.33);BX(.56,.04,1.5,U,0,.32,1.2);BX(.56,.5,.04,paint,0,.55,1.95);/* cockpit sides, floor, back panel */
  BX(.5,.08,.5,seatM,0,.5,1.3);{const b=BX(.5,.6,.08,seatM,0,.82,1.58);b.rotation.x=-.25}
  for(const sd of[-1,1]){rod([sd*.3,.85,.95],[sd*.25,1.62,1.4],.025,chrome);rod([sd*.3,.85,1.85],[sd*.25,1.62,1.45],.025,chrome)}rod([-.25,1.62,1.42],[.25,1.62,1.42],.025,chrome);
  steer(0,.95,.88,-1.1,0,true);
  /* the rear axle housing, the wing on tall struts, the parachute pack */
  for(const sd of[-1,1]){rod([sd*.35,.45,2.2],[sd*.7,2.1,3.0],.03,blk);rod([sd*.35,.45,2.9],[sd*.7,2.1,3.0],.03,blk)}
  BX(1.9,.06,.6,paint,0,2.12,3.05);for(const sd of[-1,1])BX(.04,.3,.66,blk,sd*.95,2.12,3.05);
  CYL(.12,.12,.4,M(0x1a1a1a,{roughness:.9}),0,.62,3.0,'z');CYL(.13,.13,.06,M(0xc02020),0,.62,3.22,'z');
  /* front axle: a thin beam between the little spoked wheels, ON THE GROUND (wheel centres at y 0.2) */
  CYL(.02,.02,1.22,chrome,0,.2,-3.6,'x');rod([-.2,.32,-3.9],[-.6,.2,-3.6],.015,chrome);rod([.2,.32,-3.9],[.6,.2,-3.6],.015,chrome);
  {const st=decal(2.0,.28,(k,w,h)=>{k.fillStyle='#1a1a1a';k.font='italic bold '+(h*.8|0)+'px '+FONT;k.textAlign='center';k.textBaseline='middle';k.fillText('NITRO DESERT',w/2,h/2,w-10)});for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(2.0,.2),st);p.position.set(sd*.272,.45,-2.2);p.rotation.y=sd*Math.PI/2;p.rotation.x=0;g.add(p)}}
  wheel(-.65,-3.6,.2,.08,'spoke');wheel(.65,-3.6,.2,.08,'spoke');wheel(-.95,2.4,.6,.5,'slick');wheel(.95,2.4,.6,.5,'slick');axle(2.4,.95,.6,.5);
  {const d=new THREE.Mesh(new THREE.SphereGeometry(.18,12,8),U2);d.position.set(0,.6,2.4);g.add(d)}}
 g.userData.wheels=wheels;g.userData.sw=sw;g.userData.swAx='z';
 return g}

/* ---------- docs/design/models/heavy.js ---------- */
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
 const FONT='Arial';
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
 const FONT='Arial';
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

/* ---------- docs/design/models/wraith.js ---------- */
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
 {const d=(k,w,h)=>{k.clearRect(0,0,w,h);k.fillStyle='#40c0ff';k.font='bold '+Math.round(h*.78)+'px Arial';k.textAlign='center';k.textBaseline='middle';k.fillText('X-13  WRAITH',w/2,h/2+1,w-6)};
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

/* ---------- docs/design/models/tank.js ---------- */
/* =====================================================================================================
   mkTank(): the Dark Army main battle tank. Replaces the 'tank' branch of mkVehModel (bak519).
   Olive drab, weathered. Real running gear: five road wheels a side, a drive sprocket at the back, an idler at the
   front, two return rollers, and a track made of 84 links per side that can actually run round the wheels.
   Side skirts, a sloped glacis, headlights with guards, tow hooks, engine grilles, exhausts, jerrycans.
   Turret: a wedge with a gun mantlet, a long gun with a fume extractor and a muzzle brake, a commander's cupola,
   a loader's hatch with a pintle machine gun, smoke dischargers, a sight box, two antennas, and a stowage basket.
   ORIGIN    Centre on the ground.   FRONT  -z.
   SIZE      3.1 m wide, 5.95 m long (hull), 2.5 m to the turret roof; gun to z -4.7 at rest.
             VEHK.tank stays w 3.2, len 5.4 (as before).
   HOOKS
     userData.tur      turret Group at (0, 1.35, 0.3), turns on y
     userData.bar      gun Group at (0, 0.35, -1.5) in tur, pitches on x. tankFire's recoil moves it to z -1.2 and back
                       to -1.5, so it must rest at -1.5 (it does). Muzzle at bar z -3.3.
     userData.wheels   every road wheel, the sprocket, the idler and the rollers, as {p, t, front:0, tank:1}, each with
                       t.userData.r. The game rolls tank wheels by v.v·dt/0.34: use (w.t.userData.r || .34).
     userData.trkAdv(d)  NEW: moves both tracks along by d metres (call it with v.v·dt each frame, next to the wheel
                       roll). Without the call the tracks just stand still, which also looks fine.
   ===================================================================================================== */
function mkTank(){const g=new THREE.Group();
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.8,metalness:.2},o||{}));
 /* weathered olive: noise, streaks and dust towards the bottom (the paint colour multiplies it) */
 const weath=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const k=c.getContext('2d');k.fillStyle='#e0e0e0';k.fillRect(0,0,256,256);
  for(let i=0;i<900;i++){const v=Math.random()*40|0;k.fillStyle='rgba('+(150+v)+','+(150+v)+','+(140+v)+','+(Math.random()*.25)+')';k.fillRect(Math.random()*256,Math.random()*256,2+Math.random()*10,1+Math.random()*3)}
  for(let i=0;i<40;i++){k.fillStyle='rgba(90,80,60,.08)';k.fillRect(Math.random()*256,Math.random()*256,2,20+Math.random()*60)}
  k.fillStyle='#b8b8b8';k.fillRect(0,0,256,2);k.fillRect(0,0,2,256);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(.6,.6);return t})();
 const OL=M(0x5a6a3a,{map:weath}),OD=M(0x3a4428,{map:weath,roughness:.9}),OT=M(0x4a5830,{map:weath}),
  steel=M(0x4a4c4e,{metalness:.6,roughness:.5}),dk=M(0x1c1d1e,{roughness:.85,metalness:.2}),rub=M(0x18191a,{roughness:.95,metalness:0}),
  hl=M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.6,roughness:.1}),tl=M(0x701010,{emissive:0xc01010,emissiveIntensity:.5}),jer=M(0x3a4a28,{roughness:.6});
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const CYL=(r1,r2,len,m,x,y,z,ax,p,seg)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,seg||14),m);o.position.set(x,y,z);if(ax=='x')o.rotation.z=Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;(p||g).add(o);return o};
 const rod=(a,b,r,m,p)=>{const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),d=Bv.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),8),m);o.position.copy(A).add(Bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());(p||g).add(o);return o};
 const B_T=.03;
 const ext=(pts,w,m,x,p,bev)=>{const bt=bev==null?B_T:bev;const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))s.lineTo(q[0],q[1]);s.lineTo(pts[0][0],pts[0][1]);
  const geo=new THREE.ExtrudeGeometry(s,{depth:w-2*bt,bevelEnabled:bt>0,bevelThickness:bt,bevelSize:bt,bevelSegments:1});const o=new THREE.Mesh(geo,m);o.rotation.y=-Math.PI/2;o.position.x=(x||0)+(w-2*bt)/2;(p||g).add(o);return o};
 const decal=(w,h,draw,x,y,z,ry,p)=>{const c=document.createElement('canvas');c.width=256;c.height=Math.max(8,Math.round(256*h/w));draw(c.getContext('2d'),c.width,c.height);
  const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),transparent:true,alphaTest:.2,roughness:.8}));o.position.set(x,y,z);o.rotation.y=ry;(p||g).add(o);return o};
 const star=(k,w,h,col)=>{k.fillStyle=col||'#e8e0c0';k.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?w*.19:w*.46;k.lineTo(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r)}k.fill()};

 /* ---------------- hull ---------------- */
 ext([[-2.35,.3],[2.4,.3],[2.7,.6],[2.7,1.0],[-2.9,1.0],[-2.9,.72]],1.7,OD);/* lower hull between the tracks */
 ext([[-2.75,1.0],[2.85,1.0],[2.95,1.1],[2.95,1.42],[-1.55,1.48],[-3.05,1.1],[-3.05,1.03]],3.1,OL);/* upper hull and fenders: their underside at 1.0 clears the track's top run */
 for(const sd of[-1,1]){ext([[-2.55,.56],[2.55,.56],[2.62,.64],[2.62,1.0],[-2.7,1.0],[-2.7,.66]],.06,OT,sd*1.53,null,.012);/* side skirt */
  for(let i=0;i<4;i++)BX(.012,.36,.03,dk,sd*1.565,.77,-1.95+i*1.3)}/* skirt panel joints */
 /* front: headlights with wire guards, tow hooks, the driver's vision blocks */
 for(const sd of[-1,1]){BX(.28,.2,.16,dk,sd*1.15,1.12,-3.08);CYL(.08,.08,.03,hl,sd*1.15,1.12,-3.175,'z');for(let i=0;i<3;i++)BX(.015,.2,.015,steel,sd*1.15+(i-1)*.07,1.12,-3.215);BX(.24,.015,.06,steel,sd*1.15,1.23,-3.19);/* lamp, guard bars, top bar */
  BX(.14,.1,.14,steel,sd*.7,.66,-2.92);const h=new THREE.Mesh(new THREE.TorusGeometry(.09,.03,6,12),steel);h.position.set(sd*.7,.62,-3.02);h.rotation.y=Math.PI/2;g.add(h)}
 /* the glacis rises from (z -3.05, y 1.1) to (-1.55, 1.48): slope 0.248 rad. Vision blocks and a hatch for the driver */
 {const sl=.248,y=z=>1.1+(z+3.05)*Math.tan(sl);for(const x of[-.25,0,.25]){const v=BX(.18,.06,.1,M(0x10202a,{metalness:.7,roughness:.1}),x,y(-1.75)+.03,-1.75);v.rotation.x=-sl}
  const h=CYL(.32,.32,.05,OT,0,y(-2.2)+.025,-2.2);h.rotation.x=-sl;
  const st=decal(.55,.55,(k,w,h2)=>{k.clearRect(0,0,w,h2);star(k,w,h2)},.9,y(-2.6)+.008,-2.6,0);st.rotation.x=-Math.PI/2-sl}
 /* engine deck: grilles, a towing cable, exhausts, tail lights, jerrycans on the back */
 {const c=document.createElement('canvas');c.width=128;c.height=128;const k=c.getContext('2d');k.fillStyle='#14160f';k.fillRect(0,0,128,128);k.fillStyle='#4a5430';for(let i=5;i<128;i+=11)k.fillRect(4,i,120,6);
  const gm=M(0xffffff,{map:new THREE.CanvasTexture(c),roughness:.8});for(const sd of[-1,1]){const p=BX(.9,.03,1.3,gm,sd*.62,1.45,2.0);p.rotation.x=.0133}}
 for(const sd of[-1,1]){rod([sd*1.3,1.49,-.8],[sd*1.3,1.47,1.0],.025,steel);/* tow cable along the deck edge */
  BX(.36,.24,.1,dk,sd*.9,1.12,2.98);CYL(.1,.1,.06,M(0x0a0a0a),sd*.9,1.12,3.04,'z');BX(.14,.08,.03,tl,sd*1.3,1.32,2.965)}
 for(let i=0;i<3;i++){BX(.32,.44,.15,jer,-.5+i*.38,1.22,3.04);BX(.18,.04,.04,dk,-.5+i*.38,1.45,3.04)}BX(1.2,.04,.3,steel,-.12,.98,3.0);/* jerrycans on a shelf under the rear lip */
 BX(1.66,.04,5.0,dk,0,.3,0);/* belly */

 /* ---------------- running gear ---------------- */
 const wheels=[];const wheel=(x,y,z,r,w,kind)=>{const p=new THREE.Group();p.position.set(x,y,z);g.add(p);const t=new THREE.Group();t.rotation.z=Math.PI/2;t.userData.r=r;p.add(t);
  if(kind=='road'){t.add(new THREE.Mesh(new THREE.CylinderGeometry(r,r,w,20),[rub,OD,OD]));for(const s of[-1,1]){const d=new THREE.Mesh(new THREE.CylinderGeometry(r*.72,r*.72,.02,18),OD);d.position.y=s*(w/2+.005);t.add(d)}
   for(let i=0;i<6;i++){const a=i/6*6.283,b=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,w+.04,5),steel);b.position.set(Math.cos(a)*r*.32,0,Math.sin(a)*r*.32);t.add(b)}t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.2,r*.2,w+.06,10),steel))}
  else if(kind=='sprocket'){t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.85,r*.85,w,18),OD));for(let i=0;i<12;i++){const a=i/12*6.283,tt=new THREE.Mesh(new THREE.BoxGeometry(.08,w*.9,.12),steel);tt.position.set(Math.cos(a)*r*.9,0,Math.sin(a)*r*.9);tt.rotation.y=-a;t.add(tt)}t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.3,r*.3,w+.08,10),steel))}
  else{t.add(new THREE.Mesh(new THREE.CylinderGeometry(r,r,w,18),[steel,OD,OD]));t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.3,r*.3,w+.05,10),steel))}
  wheels.push({p,t,front:0,tank:1})};
 const TX=1.2,TW=.56;/* track centre line x, width */
 for(const sd of[-1,1]){for(const z of[-1.8,-.9,0,.9,1.8])wheel(sd*TX,.39,z,.32,.48,'road');wheel(sd*TX,.5,2.42,.37,.4,'sprocket');wheel(sd*TX,.5,-2.5,.36,.4,'idler');for(const z of[-1.35,.45])wheel(sd*TX,.8,z,.09,.3,'roller');
  for(const z of[-1.8,-.9,0,.9,1.8])BX(.2,.08,.08,steel,sd*.9,.39,z);/* axle stubs from the hull */}
 /* the tracks: links on a closed curve round the idler, the road wheels and the sprocket */
 const key=[[-1.9,.035],[-.6,.035],[.6,.035],[1.9,.035],[2.27,.13],[2.706,.214],[2.825,.5],[2.706,.786],[2.42,.905],[1.2,.9],[0,.88],[-1.2,.9],[-2.5,.895],[-2.78,.775],[-2.895,.5],[-2.78,.225],[-2.35,.1]];
 const curve=new THREE.CatmullRomCurve3(key.map(p=>new THREE.Vector3(0,p[1],p[0])),true,'centripetal');const L=curve.getLength(),N=84;
 const linkG=new THREE.BoxGeometry(TW,.07,L/N*.86),trM=M(0x2a2826,{metalness:.55,roughness:.6}),gsG=new THREE.BoxGeometry(TW*.9,.04,.04);
 const trk=[];for(const sd of[-1,1]){const im=new THREE.InstancedMesh(linkG,trM,N),gs=new THREE.InstancedMesh(gsG,trM,N);g.add(im,gs);trk.push({im,gs,x:sd*TX})}
 const ctr=new THREE.Vector3(0,.47,0),dum=new THREE.Object3D(),dum2=new THREE.Object3D();let off=0;
 const place=()=>{for(const T of trk){for(let i=0;i<N;i++){let u=((i/N+off/L)%1+1)%1;const p=curve.getPointAt(u),tn=curve.getTangentAt(u);let nrm=new THREE.Vector3(0,-tn.z,tn.y);if(nrm.dot(p.clone().sub(ctr))<0)nrm.negate();
   dum.position.set(T.x,p.y,p.z);dum.up.copy(nrm);dum.lookAt(T.x,p.y+tn.y,p.z+tn.z);dum.updateMatrix();T.im.setMatrixAt(i,dum.matrix);
   dum2.position.set(T.x,p.y+nrm.y*.05,p.z+nrm.z*.05);dum2.up.copy(nrm);dum2.lookAt(T.x,p.y+nrm.y*.05+tn.y,p.z+nrm.z*.05+tn.z);dum2.updateMatrix();T.gs.setMatrixAt(i,dum2.matrix)}T.im.instanceMatrix.needsUpdate=true;T.gs.instanceMatrix.needsUpdate=true}};
 place();g.userData.trkAdv=d=>{off=(off+d)%L;place()};/* driving forward (d > 0): the bottom run moves back (+z) and the top run forward, matching the wheels */

 /* ---------------- turret ---------------- */
 const tur=new THREE.Group();tur.position.set(0,1.35,.3);g.add(tur);
 CYL(1.0,1.02,.1,dk,0,.13,0,null,tur,28);/* turret ring */
 ext([[-1.2,.15],[1.3,.15],[1.42,.38],[1.32,.78],[-.55,.84],[-1.42,.52],[-1.38,.25]],2.1,OL,0,tur);
 /* stowage basket on the back */{for(const sd of[-1,1]){rod([sd*.95,.5,1.3],[sd*.95,.5,1.85],.02,steel,tur);rod([sd*.95,.82,1.3],[sd*.95,.82,1.85],.02,steel,tur);rod([sd*.95,.5,1.85],[sd*.95,.82,1.85],.02,steel,tur)}
  rod([-.95,.5,1.85],[.95,.5,1.85],.02,steel,tur);rod([-.95,.82,1.85],[.95,.82,1.85],.02,steel,tur);BX(1.9,.03,.55,steel,0,.48,1.575,tur);
  const tarp=BX(1.2,.26,.45,M(0x6a6a48,{roughness:1}),-.25,.63,1.58,tur);tarp.rotation.z=.04;BX(.4,.3,.3,jer,.6,.65,1.6,tur)}
 /* commander's cupola with vision blocks and an open hatch; the loader's hatch with a pintle MG */
 CYL(.34,.37,.2,OT,.45,.92,.45,null,tur,18);for(let i=0;i<6;i++){const a=i/6*6.283;const vb=BX(.1,.07,.03,M(0x10202a,{metalness:.7,roughness:.1}),.45+Math.sin(a)*.36,.94,.45+Math.cos(a)*.36,tur);vb.rotation.y=a}
 {const lid=CYL(.3,.3,.05,OT,.45,1.24,.82,null,tur,16);lid.rotation.x=-1.25;rod([.45,1.02,.66],[.45,1.08,.72],.025,steel,tur)}/* hatch lid standing open, on its hinge */
 CYL(.3,.3,.05,OT,-.45,.835,.55,null,tur,16);rod([-.45,.82,.2],[-.45,1.12,.2],.025,steel,tur);
 {const mg=new THREE.Group();mg.position.set(-.45,1.14,.2);tur.add(mg);BX(.1,.1,.4,dk,0,0,-.05,mg);CYL(.025,.025,.8,dk,0,.02,-.6,'z',mg,6);BX(.14,.14,.18,jer,.12,-.02,.05,mg)}
 /* sight box, smoke dischargers, antennas, stars */
 BX(.36,.26,.34,OD,-.55,.97,-.55,tur);BX(.28,.16,.02,M(0x10202a,{metalness:.7,roughness:.1}),-.55,.98,-.725,tur);
 for(const sd of[-1,1])for(let i=0;i<3;i++){const s=CYL(.055,.055,.26,dk,sd*(.82+i*.04),.76,-1.0+i*.14,null,tur,8);s.rotation.set(-.8,0,sd*-.5)}
 for(const[x,z,h]of[[-.8,1.1,2.2],[.8,1.1,1.6]]){CYL(.04,.05,.08,dk,x,.82,z,null,tur,8);rod([x,.84,z],[x*1.05,.9+h,z+.25],.01,dk,tur)}
 for(const sd of[-1,1])decal(.55,.55,(k,w,h)=>{k.clearRect(0,0,w,h);star(k,w,h)},sd*1.058,.45,.35,sd*Math.PI/2,tur);
 for(const sd of[-1,1])decal(.6,.2,(k,w,h)=>{k.clearRect(0,0,w,h);k.fillStyle='#e8e0c0';k.font='bold '+(h*.8|0)+'px Arial';k.textAlign='center';k.textBaseline='middle';k.fillText('DA-17',w/2,h/2+1)},sd*1.058,.45,-.45,sd*Math.PI/2,tur);
 /* ---------------- the gun ---------------- */
 const bar=new THREE.Group();bar.position.set(0,.35,-1.5);tur.add(bar);
 ext([[-.32,-.26],[.25,-.26],[.25,.26],[-.32,.26],[-.42,.14],[-.42,-.14]],1.0,OT,0,bar);/* mantlet */
 CYL(.14,.14,.4,OD,0,0,-.55,'z',bar,14);CYL(.1,.115,3.0,OD,0,0,-1.9,'z',bar,14);/* sleeve, barrel */
 CYL(.16,.16,.55,OD,0,0,-1.85,'z',bar,16);for(const z of[-1.6,-2.1])CYL(.165,.165,.03,dk,0,0,z,'z',bar,16);/* fume extractor */
 CYL(.15,.15,.3,dk,0,0,-3.25,'z',bar,12);for(const sd of[-1,1])BX(.04,.12,.16,M(0x050505),sd*.15,0,-3.25,bar);CYL(.06,.06,.02,M(0x050505),0,0,-3.405,'z',bar,10);/* muzzle brake with its side ports */
 CYL(.04,.04,.7,dk,.36,.08,-.55,'z',bar,8);/* coaxial MG */
 g.userData.tur=tur;g.userData.bar=bar;g.userData.wheels=wheels;return g}

/* =====================================================================================================
   r611: putting the new models in the game
   ===================================================================================================== */
/* the monster's wheels now sit outside the body: 3.9 m over the tyres after its 1.15 scale */
try{VEHK.monster.w=3.9}catch(e){}
/* what every new model gets: the vehicle's scale, its materials kept out of the golden-hotel tint (like VMAT does),
   tyre sizes for the wheel roll, and the tank's track instances always drawn (their bounds are only one link) */
function nvFinish(g,K){const sc=(K&&K.sc)||1;if(sc!==1)g.scale.setScalar(sc);
 g.traverse(o=>{if(o.isInstancedMesh)o.frustumCulled=false;const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of ms){if(m){const u=m.userData||(m.userData={});u.gd=1}}});
 for(const w of g.userData.wheels||[]){const t=w.t;if(!t||t.userData.r)continue;const pa=t.geometry&&t.geometry.parameters;if(pa&&pa.radiusTop)t.userData.r=pa.radiusTop*sc}
 if(!g.userData.swAx)g.userData.swAx='z';return g}
/* a figure in the model's crew spot (userData.crew: x, y, z, scale, parent) */
function nvCrew(g,fig){const c=g.userData.crew;if(!c||!fig)return null;fig.position.set(c.x,c.y,c.z);(c.par||g).add(fig);return fig}
/* the Highway Patrol car: the new sports car in its dark paint, dressed by hwpDress, then fitted to the new body */
function nvHwp(K){const g=mkFastCar('sport',K.col);const M=VMAT,B=(w,h,d,x,y,z,m,par)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(par||g).add(o);return o};
 g.traverse(o=>{const pa=o.isMesh&&o.geometry.type=='PlaneGeometry'&&o.geometry.parameters;if(pa&&pa.width==1.2&&Math.abs(pa.height-.16)<.01)o.visible=false});/* no "DESERT GT" stripe */
 const n0=g.children.length;hwpDress(g,{B,M,body:null,dk:M(0x1a1a1a,{roughness:.85}),chrome:M(0xd0d4d8,{metalness:.85,roughness:.25})});
 for(const o of g.children.slice(n0)){const p=o.position,ax=Math.abs(p.x);
  /* the white door panels and HIGHWAY PATROL: on the new doors (outer face x ±1.02, z -0.87 … 0.77) */
  if(ax>.98&&ax<1.0&&p.y>.6&&p.y<.8){const pl=o.geometry&&o.geometry.type=='PlaneGeometry';p.x=Math.sign(p.x)*(pl?1.045:1.032);p.z=-.05;if(pl)o.scale.x=1.45/1.6;else o.scale.z=1.5/1.7}
  /* the badge on the hood, lying on its slope */
  else if(ax<.01&&Math.abs(p.y-.77)<.01&&Math.abs(p.z+1.55)<.01){p.y=.705;o.rotation.x=-Math.PI/2-Math.atan(.226)}
  /* the light bar on the roof (top at 1.43, z -0.26 … 0.46) */
  else if(p.y>1.3&&p.y<1.6&&Math.abs(p.z-.33)<.01){p.y+=.06;p.z=.1}
  /* the push bar and its lamps, clear of the new nose */
  else if(p.z<-2.1&&p.z>-2.3){p.z-=.12}}
 return g}
function nvBuild(k){const K=VEHK[k];if(!K)return null;
 if(k=='sedan')return mkSedan('cab');
 if(k=='cop')return mkSedan('cop');
 if(K.npc&&K.mdl=='sedan')return mkSedan('civ',K.col);
 if(k=='truck')return mkPickup('pickup');
 if(k=='jeep')return mkPickup('jeep');
 if(k=='monster')return mkPickup('monster');/* it lifts its own body: VEHK.monster.lift is not applied */
 if(k=='sport'||k=='muscle'||k=='hotrod'||k=='dragster')return mkFastCar(k);
 if(k=='hwp')return nvHwp(K);
 if(k=='proto'){const g=new THREE.Group(),w=[];wraithModel(g,w);g.userData.wheels=w;g.userData.sw=null;return g}
 if(k=='tank')return mkTank();
 return null}
/* the outermost mkVehModel: the new models for these kinds (the old ones stay as a fallback if one fails to build) */
{const mv9=mkVehModel;mkVehModel=function(k){let g=null;try{g=nvBuild(k);if(g)nvFinish(g,VEHK[k])}catch(e){g=null;try{conLog('error','new vehicle model '+k+': '+e.message)}catch(x){}}return g||mv9.apply(this,arguments)}}
/* the APC: Seek in the turret hatch, and the driver's compartment from r577. While you drive it, the hull parts that
   would block the view (everything that reaches into the compartment) are hidden, as before */
{const ap9=mkApcModel;mkApcModel=function(){let g;try{g=mkHeavy('apc')}catch(e){try{conLog('error','new APC model: '+e.message)}catch(x){}return ap9.apply(this,arguments)}
 try{nvCrew(g,mkCopSeek(g.userData.crew.sc))}catch(e){}nvFinish(g,null);
 try{g.updateMatrixWorld(true);const ck=new THREE.Box3(new THREE.Vector3(-1.38,.85,-2.95),new THREE.Vector3(1.38,2.4,-.9)),bb=new THREE.Box3(),sl=[];
  for(const o of g.children){if(!o.isMesh)continue;bb.setFromObject(o);if(!bb.isEmpty()&&bb.intersectsBox(ck))sl.push(o)}
  g.userData.ck=apcCockpit(g);g.userData.slits=sl}catch(e){try{conLog('error','APC cockpit: '+e.message)}catch(x){}}
 return g}}
/* the SWAT truck: Seek at the wheel */
{const sw9=mkSwatModel;mkSwatModel=function(gun){let g;try{g=mkHeavy('swat',{gun:!!gun})}catch(e){try{conLog('error','new SWAT model: '+e.message)}catch(x){}return sw9.apply(this,arguments)}
 try{nvCrew(g,mkCopSeek(g.userData.crew.sc))}catch(e){}return nvFinish(g,null)}}
/* the panel vans: mkVan lives in a later <script> than this module, so build.py swaps its one call (the prison's
   INMATE TRANSPORT vans) for nvVan, and turns them round (the new van faces -z, the old one faced +z) */
function nvVan(label,col){return nvFinish(mkHeavy('van',{label,col}),null)}
/* El Goblino's tow truck, with him at the wheel */
mkTowTruck=function(){const m=mkTow();m.rotation.order='YXZ';try{const c=m.userData.crew,gb=mkGoblino();gb.scale.setScalar(c.sc||.48);gb.position.set(c.x,c.y,c.z);m.add(gb)}catch(e){}return nvFinish(m,null)};
/* the hook swings a little while the tow truck works */
{const dt9=dbTowRender;dbTowRender=function(q,v,dt){const r=dt9.apply(this,arguments);try{const h=v.towM&&v.towM.userData.hook;if(h){const t=q.rt||0;h.rotation.x=Math.sin(t*2.6)*.12;h.rotation.z=Math.sin(t*1.9)*.06}}catch(e){}return r}}
