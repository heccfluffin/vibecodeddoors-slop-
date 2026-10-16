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
                                t = the tyre mesh (rotation.z = PI/2; the flat-tyre event scales it), front = z < 0
             g.userData.sw      the steering wheel Group, at (0.45, 1.0, -0.56), rotation.x = -1.15; turns on its z
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
 const FONT='"Barlow Semi Condensed",DoorsSans,Arial,sans-serif';
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
 BX(1.8,.28,.4,trim,0,.86,-.77);BX(1.8,.05,.48,M(0x3a3430,{roughness:.9,metalness:0}),0,1.01,-.8);/* dash */
 {const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.fillStyle='#14120f';x.fillRect(0,0,256,64);
  for(const[cx,lbl]of[[70,'SPEED'],[186,'FUEL']]){x.strokeStyle='#d8d0b8';x.lineWidth=2;x.beginPath();x.arc(cx,36,24,Math.PI*.8,Math.PI*2.2);x.stroke();x.fillStyle='#d8d0b8';x.font='9px '+FONT;x.textAlign='center';x.fillText(lbl,cx,58);x.strokeStyle='#ff6020';x.lineWidth=2;x.beginPath();x.moveTo(cx,36);x.lineTo(cx-14,24);x.stroke()}
  const gm=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),emissive:0x40a0ff,emissiveIntensity:.15,roughness:.4});const p=new THREE.Mesh(new THREE.PlaneGeometry(.5,.125),gm);p.position.set(.45,.93,-.568);p.rotation.x=-.25;g.add(p)}
 /* steering wheel (same place and hook as the old model) */
 const sw=new THREE.Group();sw.position.set(.45,1.0,-.56);sw.rotation.x=-1.15;g.add(sw);
 {const r=new THREE.Mesh(new THREE.TorusGeometry(.18,.022,8,24),dk);sw.add(r);for(const a of[0,2.1,4.2]){const sp=new THREE.Mesh(new THREE.BoxGeometry(.16,.025,.02),dk);sp.position.set(Math.cos(a)*.08,Math.sin(a)*.08,0);sp.rotation.z=a;sw.add(sp)}
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.05,12),chrome);hub.rotation.x=Math.PI/2;sw.add(hub);const col=new THREE.Mesh(new THREE.CylinderGeometry(.03,.035,.42,8),dk);col.rotation.x=Math.PI/2;col.position.z=-.22;sw.add(col)}
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
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.27,18),chrome);hub.rotation.z=Math.PI/2;p.add(hub);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,.28,12),M(0xb8bcc0,{metalness:.5,roughness:.3}));cap.rotation.z=Math.PI/2;p.add(cap);
  for(let i=0;i<6;i++){const a=i/6*6.283;const sp=new THREE.Mesh(new THREE.BoxGeometry(.28,.11,.025),M(0x9aa0a4,{metalness:.5,roughness:.3}));sp.position.set(0,Math.cos(a)*.13,Math.sin(a)*.13);sp.rotation.x=a;p.add(sp)}/* ribs on the hubcap */
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
