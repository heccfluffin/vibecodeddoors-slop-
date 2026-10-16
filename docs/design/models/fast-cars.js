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
 const FONT='"Barlow Semi Condensed",DoorsSans,Arial,sans-serif';
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
