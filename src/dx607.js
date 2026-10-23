/* =====================================================================================================
   r609: WATER DELIVERY, ACTED OUT (docs/design/water-delivery.md; models water-tank.js, jerrycan.js, groundskeeper.js).
   Every water delivery spot (Water tower, Gulch water tower, Jeff's Oasis, Mining shack, Campfire) now has a
   corrugated water tank and THE GROUNDSKEEPER, a quiet man in a long green coat with a water-filled porthole for a face.
   He stands by his tank all day, watches you when you come close, and has a few words if you press E.
   When a squad brings water:
   1. the truck pulls up in front of the tank and he waves,
   2. two soldiers carry six blue jerrycans from the truck and stand them in a row in front of the tank,
   3. he takes each can, carries it to the funnel and pours it in (the float in the gauge goes up 12 % a can),
      then puts the empty back in the row, and the soldiers take the empties back to the truck,
   4. after the last can he waves the squad off and the job is done (it takes as long as the pouring, 28 s at least).
   If nobody is near (120 m), the water just goes in and the job takes the usual time.
   The tanks slowly empty (one can's worth every five minutes) and start at 20 % each session.
   ===================================================================================================== */
function mkWaterTank(){
 const g=new THREE.Group();
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.5,metalness:.55},o||{}));
 const cv=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)};
 const FONT='Arial';
 const R=1.1,H=1.8,B=.12;/* tank radius, wall height, plinth height */
 const parts={};
 /* plinth */
 {const t=cv(128,128,(x,w,h)=>{x.fillStyle='#8c8a82';x.fillRect(0,0,w,h);for(let i=0;i<500;i++){const v=110+Math.random()*50|0;x.fillStyle='rgba('+v+','+v+','+(v-5)+',.4)';x.fillRect(Math.random()*w,Math.random()*h,2,2)}});
  const m=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.28,B,32),[M(0x8c8a82,{roughness:1,metalness:0}),M(0xffffff,{map:t,roughness:1,metalness:0}),M(0x8c8a82,{roughness:1,metalness:0})]);m.position.y=B/2;g.add(m)}
 /* the wall: horizontal corrugations, 8 ridges per 0.6 m (a 256 px tile), so the texture repeats 3 times up the wall */
 const corr=cv(64,256,(x,w,h)=>{for(let i=0;i<8;i++){const y=i*32;const gr=x.createLinearGradient(0,y,0,y+32);gr.addColorStop(0,'#c8ccce');gr.addColorStop(.35,'#eef0f0');gr.addColorStop(.6,'#9aa0a4');gr.addColorStop(1,'#c0c4c6');x.fillStyle=gr;x.fillRect(0,y,w,32)}});
 corr.wrapS=corr.wrapT=THREE.RepeatWrapping;corr.repeat.set(12,3);
 const wallM=M(0xffffff,{map:corr,metalness:.6,roughness:.42});
 {const w=new THREE.Mesh(new THREE.CylinderGeometry(R,R,H,48,1,true),wallM);w.position.y=B+H/2;g.add(w);
  /* the inside, dark (seen through the hatch) */const inn=new THREE.Mesh(new THREE.CylinderGeometry(R-.02,R-.02,H,48,1,true),M(0x2a3034,{side:THREE.BackSide,roughness:.8}));inn.position.y=B+H/2;g.add(inn);
  for(const y of[B+.03,B+H-.03]){const r=new THREE.Mesh(new THREE.TorusGeometry(R+.01,.03,6,48),M(0x9aa0a4));r.rotation.x=Math.PI/2;r.position.y=y;g.add(r)}}
 /* the roof: a shallow cone, with a round hatch and a strainer */
 const RY=B+H;
 {const roof=new THREE.Mesh(new THREE.CylinderGeometry(.32,R+.04,.32,48,1,true),M(0xb8bcbe,{metalness:.6,roughness:.45,side:THREE.DoubleSide}));roof.position.y=RY+.16;g.add(roof);
  const top=new THREE.Mesh(new THREE.CircleGeometry(.32,32),M(0x3a4246,{roughness:.6}));top.rotation.x=-Math.PI/2;top.position.y=RY+.32;g.add(top);
  /* strainer: a mesh grille ring over the hole */const gt=cv(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='#9aa0a4';x.lineWidth=3;for(let i=0;i<w;i+=10){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke()}});
  const gr=new THREE.Mesh(new THREE.CircleGeometry(.3,32),M(0xffffff,{map:gt,transparent:true,alphaTest:.5,side:THREE.DoubleSide}));gr.rotation.x=-Math.PI/2;gr.position.y=RY+.335;g.add(gr);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.32,.025,6,32),M(0x9aa0a4));rim.rotation.x=Math.PI/2;rim.position.y=RY+.33;g.add(rim)}
 /* the water you see through the strainer */
 const surf=new THREE.Mesh(new THREE.CircleGeometry(R-.03,40),new THREE.MeshStandardMaterial({color:0x2a6a8a,roughness:.15,metalness:.2,transparent:true,opacity:.9}));surf.rotation.x=-Math.PI/2;g.add(surf);parts.surface=surf;
 /* fill funnel on the front: a pipe out of the wall at 0.75 m, an elbow, and a funnel at waist height */
 const pipeM=M(0x5a6a72,{metalness:.6,roughness:.4});
 {const p=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.3,12),pipeM);p.rotation.x=Math.PI/2;p.position.set(0,.75,-R-.12);g.add(p);
  const el=new THREE.Mesh(new THREE.SphereGeometry(.055,12,8),pipeM);el.position.set(0,.75,-R-.27);g.add(el);
  const up=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.12,12),pipeM);up.position.set(0,.84,-R-.27);g.add(up);
  const fn=new THREE.Mesh(new THREE.CylinderGeometry(.17,.05,.2,20,1,true),M(0x7a8890,{side:THREE.DoubleSide,metalness:.6,roughness:.4}));fn.position.set(0,.98,-R-.27);g.add(fn);
  const fr=new THREE.Mesh(new THREE.TorusGeometry(.17,.012,6,24),pipeM);fr.rotation.x=Math.PI/2;fr.position.set(0,1.08,-R-.27);g.add(fr)}
 g.userData.FUNNEL={x:0,y:1.08,z:-R-.27};g.userData.STAND={x:0,z:-R-.64};
 /* tap at the bottom front-left, with a drip */
 {const p=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.22,10),pipeM);p.rotation.x=Math.PI/2;const a=-Math.PI/2-.5;/* around the wall, front-left */
  const px=Math.cos(a)*(R+.1),pz=Math.sin(a)*(R+.1);p.position.set(px,.32,pz);p.rotation.y=-a-Math.PI/2;g.add(p);
  const body=new THREE.Mesh(new THREE.BoxGeometry(.07,.09,.07),M(0xb08a3a,{metalness:.8,roughness:.3}));const ox=Math.cos(a)*(R+.22),oz=Math.sin(a)*(R+.22);body.position.set(ox,.32,oz);g.add(body);
  const sp=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.08,8),body.material);sp.position.set(ox,.25,oz);g.add(sp);
  const v=new THREE.Mesh(new THREE.BoxGeometry(.12,.02,.02),M(0xc02a1e,{metalness:.3}));v.position.set(ox,.38,oz);v.rotation.y=-a;g.add(v);parts.valve=v;
  const d=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.2,6),new THREE.MeshStandardMaterial({color:0x6ab0d8,transparent:true,opacity:.7}));d.position.set(ox,.11,oz);d.visible=false;g.add(d);parts.drip=d}
 /* sight tube with a float, and a level board behind it, front-right */
 const ga=-Math.PI/2+.45,gx=Math.cos(ga)*(R+.08),gz=Math.sin(ga)*(R+.08);
 {const bd=cv(64,512,(x,w,h)=>{x.fillStyle='#f0ead8';x.fillRect(0,0,w,h);x.fillStyle='#1a1a1a';x.font='bold 22px '+FONT;x.textAlign='center';
   [['FULL',.04],['¾',.27],['½',.5],['¼',.73],['E',.96]].forEach(([s,f])=>{const y=12+f*(h-24);x.fillRect(4,y-1,16,3);x.fillText(s,40,y+8)})});
  const b=new THREE.Mesh(new THREE.PlaneGeometry(.12,1.5),M(0xffffff,{map:bd,metalness:0,roughness:.8}));b.position.set(Math.cos(ga)*(R+.02),B+.15+.75,Math.sin(ga)*(R+.02));b.lookAt(b.position.x*2,b.position.y,b.position.z*2);g.add(b);
  b.position.x+=Math.cos(ga+Math.PI/2)*.08;b.position.z+=Math.sin(ga+Math.PI/2)*.08;
  const tube=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,1.56,10),new THREE.MeshStandardMaterial({color:0xcfe8f0,transparent:true,opacity:.35,roughness:.05,depthWrite:false}));tube.position.set(gx,B+.15+.75,gz);g.add(tube);
  for(const y of[B+.12,B+.15+1.53]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.04,10),pipeM);c.position.set(gx,y,gz);g.add(c);const br=new THREE.Mesh(new THREE.BoxGeometry(.02,.02,.1),pipeM);br.position.set((gx+Math.cos(ga)*R)/2,y,(gz+Math.sin(ga)*R)/2);br.rotation.y=-ga+Math.PI/2;g.add(br)}
  const fl=new THREE.Mesh(new THREE.SphereGeometry(.018,10,8),M(0xd02a1e,{metalness:.1,roughness:.4}));fl.position.set(gx,0,gz);g.add(fl);parts.float=fl}
 /* stencilled name, on a curved patch just off the wall */
 {const t=cv(512,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='rgba(30,50,60,.85)';x.font='bold 64px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText('DRINKING WATER',w/2,h/2,w-20)});
  const len=1.8/(R+.012);/* 1.8 m of wall */const pt=new THREE.Mesh(new THREE.CylinderGeometry(R+.012,R+.012,.45,24,1,true,Math.PI-len/2+.9,len),new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.3,roughness:.6}));pt.position.y=B+1.45;g.add(pt)}
 g.userData.parts=parts;
 g.userData.setLevel=function(f){f=Math.max(0,Math.min(1,f));parts.float.position.y=B+.15+.02+f*1.46;surf.position.y=B+.05+f*(H-.12);surf.visible=f>.01};
 g.userData.setLevel(.2);
 return g}
function mkJerrycan(colour){
 const g=new THREE.Group();const col=colour==null?0x2a5a9a:colour;
 const body=new THREE.MeshStandardMaterial({color:col,roughness:.55,metalness:.35});
 const dark=new THREE.MeshStandardMaterial({color:new THREE.Color(col).multiplyScalar(.6),roughness:.6,metalness:.35});
 const steel=new THREE.MeshStandardMaterial({color:0x9aa0a4,roughness:.35,metalness:.8});
 const can=new THREE.Group();can.position.y=-.43;g.add(can);/* everything below is built from the can's bottom */
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||can).add(o);return o};
 /* the body: a box with its vertical edges rounded (four thin cylinders at the corners) */
 const W=.35,H=.4,D=.17,r=.03;
 BX(W-2*r,H,D,body,0,H/2,0);BX(W,H,D-2*r,body,0,H/2,0);
 for(const sx of[-1,1])for(const sz of[-1,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,H,10),body);c.position.set(sx*(W/2-r),H/2,sz*(D/2-r));can.add(c)}
 /* the X pressed into both big faces, and a seam round the middle */
 for(const sz of[-1,1]){for(const a of[1,-1]){const x=BX(.012,Math.hypot(W-.1,H-.1),.008,dark,0,H/2,sz*(D/2+.003));x.rotation.z=a*Math.atan2(W-.1,H-.1)}
  BX(W-.06,.012,.008,dark,0,.02,sz*(D/2+.003));BX(W-.06,.012,.008,dark,0,H-.02,sz*(D/2+.003))}
 BX(W+.004,.012,D+.004,dark,0,H/2,0);/* the welded seam (stands 2 mm proud of every face) */
 /* the shoulder on top, a little lower at the spout side */
 BX(W-.02,.02,D-.02,body,0,H+.01,0);
 /* three handles across the top; the middle one is the origin of the whole group */
 for(const hx of[-.1,0,.1]){for(const sz of[-1,1])BX(.016,.07,.016,steel,hx,H+.055,sz*.045);BX(.02,.02,.11,steel,hx,H+.09,0)}
 /* the spout, on the +x side, with a hinged cap */
 const sp=new THREE.Mesh(new THREE.CylinderGeometry(.028,.032,.06,14),steel);sp.position.set(.135,H+.04,0);sp.rotation.z=-.35;can.add(sp);
 const capG=new THREE.Group();capG.position.set(.165,H+.07,0);can.add(capG);
 {const c=new THREE.Mesh(new THREE.CylinderGeometry(.034,.034,.025,14),dark);c.position.set(-.02,.01,0);c.rotation.z=-.35;capG.add(c);const lv=new THREE.Mesh(new THREE.BoxGeometry(.05,.01,.02),steel);lv.position.set(-.05,.02,0);capG.add(lv)}
 /* the stream: a thin blue column that hangs from the spout tip */
 const sg=new THREE.CylinderGeometry(.018,.012,1,8,1,true);sg.translate(0,-.5,0);
 const stream=new THREE.Mesh(sg,new THREE.MeshStandardMaterial({color:0x8ac8f0,transparent:true,opacity:.75,roughness:.05,side:THREE.DoubleSide,depthWrite:false}));
 stream.position.set(.15,H+.075,0);stream.visible=false;can.add(stream);
 g.userData.parts={cap:capG,stream,can};
 g.userData.pour=function(f,len){f=Math.max(0,Math.min(1,f||0));const a=f*2.0;g.rotation.z=-a;/* spout side goes down */
  capG.rotation.z=Math.min(1,f*3)*2.2;stream.visible=f>.6;stream.scale.y=len||.5;stream.rotation.z=a;/* undo the tilt so it falls straight */};
 return g}
function mkGroundskeeper(){
 const g=new THREE.Group();
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0},o||{}));
 /* the coat: sage canvas, faint weave and dust (a 128 px tile = 40 cm) */
 const coatT=(rx,ry)=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#8a947a';x.fillRect(0,0,128,128);
  for(let i=0;i<128;i+=2){x.fillStyle='rgba(0,0,0,.035)';x.fillRect(0,i,128,1);x.fillRect(i,0,1,128)}
  for(let i=0;i<500;i++){x.fillStyle='rgba('+(Math.random()<.5?'60,52,36':'200,190,160')+','+(Math.random()*.12)+')';x.fillRect(Math.random()*128,Math.random()*128,1+Math.random()*3,1+Math.random()*2)}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return M(0xffffff,{map:t,side:THREE.DoubleSide})};
 const headM=M(0x1e2022,{roughness:.45,metalness:.2}),trou=M(0x2e3230),boot=M(0x2a2622,{roughness:.6}),hatM=M(0x1a1a1c,{roughness:.7,side:THREE.DoubleSide}),
  leather=M(0x6a3a1e,{roughness:.6}),glove=M(0x2a2c2a,{roughness:.6}),brass=M(0xb08a3a,{metalness:.85,roughness:.3}),copper=M(0xa0522d,{metalness:.75,roughness:.32}),iron=M(0x3a3a3c,{metalness:.6,roughness:.45}),btn=M(0x2a2a26,{roughness:.4});
 const add=(geo,m,x,y,z,p)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);p.add(o);return o};
 const cyl=(r1,r2,h,s)=>new THREE.CylinderGeometry(r1,r2,h,s||12),box=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
 const P={};const HY=.95,A=.31,B=.31;
 /* ---------- hips, legs ---------- */
 const hips=new THREE.Group();hips.position.y=HY;g.add(hips);P.hips=hips;
 add(box(.32,.18,.22),trou,0,.02,0,hips);
 for(const sx of[-1,1]){const leg=new THREE.Group();leg.position.set(sx*.1,-.02,0);hips.add(leg);
  add(cyl(.075,.068,.45),trou,0,-.225,0,leg);const knee=new THREE.Group();knee.position.y=-.45;leg.add(knee);
  add(new THREE.SphereGeometry(.07,10,8),trou,0,0,0,knee);add(cyl(.066,.06,.4),trou,0,-.2,0,knee);
  add(cyl(.075,.08,.18),boot,0,-.36,0,knee);add(box(.14,.09,.28),boot,0,-.43,-.05,knee);add(box(.145,.025,.29),M(0x161412),0,-.473,-.05,knee);
  P[sx<0?'legL':'legR']=leg;P[sx<0?'kneeL':'kneeR']=knee}
 /* the coat below the belt: two halves that swing with the legs, a slit at the front */
 P.tails=[-1,1].map(sx=>{const t=new THREE.Group();t.position.set(sx*.1,.1,0);hips.add(t);/* hung from the bottom of the coat's body, so there's no gap at the waist */
  const geo=new THREE.CylinderGeometry(.205,.26,.74,14,1,true,sx<0?Math.PI+.04:.04,Math.PI-.08);const m=new THREE.Mesh(geo,coatT(1.5,1.8));m.position.set(-sx*.1,-.37,0);m.scale.z=.74;t.add(m);return t});
 /* ---------- body ---------- */
 const torso=new THREE.Group();torso.position.y=.1;hips.add(torso);
 {const t=add(cyl(.21,.19,.56,16),coatT(3,1.6),0,.28,0,torso);t.scale.z=.72;
  add(box(.02,.54,.02),M(0x6e7862),0,.28,-.14,torso);/* the coat's front seam */
  for(let i=0;i<4;i++)add(new THREE.SphereGeometry(.017,8,6),btn,.035,.46-i*.11,-.14,torso);/* buttons */
  add(cyl(.12,.15,.08,14),coatT(1,.3),0,.56,0,torso).scale.z=.8;/* collar */
  /* shoulder pads */for(const sx of[-1,1]){const pd=add(new THREE.SphereGeometry(.09,12,8,0,6.283,0,1.7),coatT(1,1),sx*.2,.52,0,torso);pd.scale.set(1.15,.85,1)}
  /* two leather straps from the shoulders down the front into the belt, with brass buckles */
  for(const sx of[-1,1]){add(box(.045,.52,.018),leather,sx*.1,.3,-.148,torso);add(box(.045,.018,.3),leather,sx*.1,.575,0,torso);/* over the shoulder */
   const bk=add(box(.05,.04,.01),brass,sx*.1,.18,-.159,torso);add(box(.03,.02,.012),leather,sx*.1,.18,-.16,torso)}
  /* the straps also go round the back to the tank harness */for(const sx of[-1,1])add(box(.045,.5,.018),leather,sx*.1,.3,.148,torso);
  /* the belt, a big buckle and a pouch on his right hip */
  add(cyl(.215,.215,.06,16),leather,0,.02,0,torso).scale.z=.74;add(box(.07,.06,.015),brass,0,.02,-.163,torso);
  add(box(.1,.12,.07),M(0x5a3218,{roughness:.6}),.19,-.04,-.08,torso);add(box(.1,.03,.075),M(0x4a2a14),.19,.02,-.08,torso)}
 /* ---------- the copper tank on his back ---------- */
 const tank=new THREE.Group();tank.position.set(0,.3,.27);torso.add(tank);
 {add(cyl(.12,.12,.42,18),copper,0,0,0,tank);add(new THREE.SphereGeometry(.12,18,10,0,6.283,0,Math.PI/2),copper,0,.21,0,tank);add(new THREE.SphereGeometry(.12,18,10,0,6.283,Math.PI/2,Math.PI/2),copper,0,-.21,0,tank);
  for(const y of[-.12,.12]){const b=add(new THREE.TorusGeometry(.123,.012,6,24),M(0x5a2e16,{metalness:.5,roughness:.4}),0,y,0,tank);b.rotation.x=Math.PI/2}
  add(cyl(.025,.025,.08,10),brass,0,.36,0,tank);/* valve stem */const vw=add(new THREE.TorusGeometry(.04,.008,6,16),brass,0,.41,0,tank);vw.rotation.x=Math.PI/2;P.valve=vw;
  add(box(.08,.04,.04),brass,0,.43,0,tank);/* cap */
  /* a hose from the tank up to the back of his head */
  const pts=[new THREE.Vector3(-.05,.25,-.02),new THREE.Vector3(-.08,.4,-.05),new THREE.Vector3(-.04,.5,-.11),new THREE.Vector3(0,.49,-.15)];/* up into the plug at the back of his head */
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),16,.014,6,false),M(0x2a2a2a,{roughness:.7}),0,0,0,tank)}
 /* ---------- head ---------- */
 const head=new THREE.Group();head.position.set(0,.6,0);torso.add(head);P.head=head;
 add(cyl(.065,.075,.1,14),headM,0,.04,0,head);/* neck */
 {const hd=add(new THREE.SphereGeometry(.125,20,14),headM,0,.19,0,head);hd.scale.set(.92,1.12,.95);
  /* the porthole: a brass ring and a pale cyan glass, set into the front of the head */
  const ring=add(new THREE.TorusGeometry(.068,.016,10,28),brass,0,.2,-.124,head);
  for(let i=0;i<8;i++){const a=i/8*6.283;add(new THREE.SphereGeometry(.008,6,4),brass,Math.cos(a)*.068,.2+Math.sin(a)*.068,-.132,head)}/* rivets */
  /* the porthole is full of water: a canvas drawn every few frames (see drawWater below) */
  const wc=document.createElement('canvas');wc.width=wc.height=128;const wt=new THREE.CanvasTexture(wc);P.waterCanvas=wc;P.waterTex=wt;
  const vm=new THREE.MeshStandardMaterial({map:wt,emissiveMap:wt,emissive:0xffffff,emissiveIntensity:.55,roughness:.05,metalness:.1});
  const vz=add(new THREE.CircleGeometry(.06,24),vm,0,.2,-.124,head);/* in front of the head's surface (which is at -0.119 here) */vz.rotation.y=Math.PI;P.visor=vz;

  add(cyl(.02,.02,.05,8),iron,0,.2,.12,head).rotation.x=Math.PI/2}/* where the hose plugs in at the back */
 /* the hat: a wide flat brim and a low crown */
 {/* sits down on the head: the crown goes over the top of it, the brim rests where the head is 0.19 m wide */add(cyl(.34,.34,.022,32),hatM,0,.265,0,head);add(cyl(.128,.132,.13,20),hatM,0,.335,0,head);add(cyl(.128,.128,.01,20),hatM,0,.405,0,head);add(cyl(.137,.137,.03,20),M(0x0e0e10),0,.29,0,head);add(cyl(.105,.105,.012,20),hatM,0,.27,0,head)}
 /* ---------- arms ---------- */
 for(const sx of[-1,1]){const arm=new THREE.Group();arm.position.set(sx*.25,.47,0);torso.add(arm);
  add(cyl(.065,.058,A),coatT(1,1),0,-A/2,0,arm);
  const el=new THREE.Group();el.position.y=-A;arm.add(el);add(new THREE.SphereGeometry(.057,10,8),coatT(1,1),0,0,0,el);
  add(cyl(.058,.066,.2),coatT(1,1),0,-.1,0,el);/* sleeve */
  add(cyl(.062,.058,.08),glove,0,-.22,0,el);/* glove cuff */add(box(.09,.12,.06),glove,0,-.3,0,el);add(box(.035,.06,.04),glove,sx*.05,-.27,-.02,el);/* big glove and thumb */
  P[sx<0?'armL':'armR']=arm;P[sx<0?'elbowL':'elbowR']=el}
 const grip=new THREE.Group();g.add(grip);P.grip=grip;
 g.userData.parts=P;
 /* ---------- poses ---------- */
 const S=Math.sin,cl=v=>Math.max(0,Math.min(1,v)),ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;let tt=0;
 const legs=(ph,amp)=>{const a=S(ph*6.283)*amp;P.legL.rotation.x=a;P.legR.rotation.x=-a;P.kneeL.rotation.x=-Math.max(0,-S(ph*6.283+.6))*amp*1.3;P.kneeR.rotation.x=-Math.max(0,S(ph*6.283+.6))*amp*1.3;hips.position.y=HY-Math.abs(S(ph*6.283))*.025+.012;
  P.tails[0].rotation.x=Math.max(a,-.05)*.55;P.tails[1].rotation.x=Math.max(-a,-.05)*.55};
 const still=()=>{P.legL.rotation.x=P.legR.rotation.x=P.kneeL.rotation.x=P.kneeR.rotation.x=0;hips.position.y=HY;P.tails[0].rotation.x=P.tails[1].rotation.x=0};
 const gripAt=(y,z)=>{grip.position.set(0,y,z);grip.rotation.set(0,0,0)};
 const reach=(y,z)=>{const sy=hips.position.y+.1+.47,dy=y-sy,dz=z,d=Math.max(.12,Math.min(A+B-.01,Math.hypot(dy,dz)));
  const phi=Math.atan2(-dz,-dy),al=Math.acos(cl((A*A+d*d-B*B)/(2*A*d))),ga=Math.acos(Math.max(-1,Math.min(1,(A*A+B*B-d*d)/(2*A*B))));
  for(const k of['L','R']){P['arm'+k].rotation.set(phi-al,0,k=='L'?.34:-.34);P['elbow'+k].rotation.set(Math.PI-ga,0,0)}};
 const armsDown=sw=>{P.armL.rotation.set(-sw,0,-.08);P.armR.rotation.set(sw,0,.08);P.elbowL.rotation.set(.12+Math.max(0,-sw)*.4,0,0);P.elbowR.rotation.set(.12+Math.max(0,sw)*.4,0,0)};
 /* the water in the porthole: a sloshing surface, rising bubbles, rippling light. It sloshes more when he walks. */
 const bub=[];for(let i=0;i<9;i++)bub.push({x:30+Math.random()*68,y:128*Math.random(),r:1.5+Math.random()*3.5,v:10+Math.random()*18,w:Math.random()*6});
 let wAcc=0,lt=0;
 function drawWater(t,name){const x=P.waterCanvas.getContext('2d'),W=128,dt=Math.min(.1,t-lt);lt=t;const moving=name=='walk'||name=='carry';
  const amp=moving?7:2.5,lvl=30+S(t*(moving?5.5:1.6))*amp*.6;/* the water's surface height, from the top */
  /* air above the water: a dim glassy grey-green */const ga=x.createLinearGradient(0,0,0,lvl);ga.addColorStop(0,'#2a3c3e');ga.addColorStop(1,'#3e5a5c');x.fillStyle=ga;x.fillRect(0,0,W,W);
  /* the water body: a wavy top edge, deep teal going darker downwards */
  x.beginPath();x.moveTo(0,W);for(let i=0;i<=W;i+=4){const y=lvl+S(i*.09+t*3.1)*amp*.35+S(i*.05-t*2.3)*amp*.45+(i-64)*S(t*(moving?5.5:1.6)+1)*amp*.012;x.lineTo(i,y)}x.lineTo(W,W);x.closePath();
  const gw=x.createLinearGradient(0,lvl,0,W);gw.addColorStop(0,'#4ad0d8');gw.addColorStop(.35,'#1c96a8');gw.addColorStop(1,'#0a4a5a');x.fillStyle=gw;x.fill();
  x.save();x.clip();
  /* light rippling through it (caustics): soft wavy bright lines */
  x.globalAlpha=.22;x.strokeStyle='#d8ffff';x.lineWidth=2;for(let k=0;k<6;k++){x.beginPath();for(let i=0;i<=W;i+=6){const y=lvl+14+k*15+S(i*.11+t*2+k)*4+S(i*.04-t*1.3+k*2)*3;i?x.lineTo(i,y):x.moveTo(i,y)}x.stroke()}x.globalAlpha=1;
  /* bubbles rise and wobble, and pop at the surface */
  for(const b of bub){b.y-=b.v*dt;if(b.y<lvl+2){b.y=W+Math.random()*20;b.x=30+Math.random()*68}const bx=b.x+S(t*3+b.w)*2;
   x.strokeStyle='rgba(220,255,255,.75)';x.lineWidth=1.2;x.beginPath();x.arc(bx,b.y,b.r,0,7);x.stroke();x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.arc(bx-b.r*.35,b.y-b.r*.35,b.r*.3,0,7);x.fill()}
  x.restore();
  /* the bright line of the surface itself */x.strokeStyle='rgba(200,255,255,.8)';x.lineWidth=2;x.beginPath();for(let i=0;i<=W;i+=4){const y=lvl+S(i*.09+t*3.1)*amp*.35+S(i*.05-t*2.3)*amp*.45+(i-64)*S(t*(moving?5.5:1.6)+1)*amp*.012;i?x.lineTo(i,y):x.moveTo(i,y)}x.stroke();
  /* a curved glare on the glass */x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=5;x.beginPath();x.arc(64,64,48,3.6,4.5);x.stroke();
  P.waterTex.needsUpdate=true}
 g.userData.pose=function(name,t){t=t||0;tt+=1/60;P.head.rotation.set(0,0,0);grip.visible=true;
  P.visor.material.emissiveIntensity=.5+.1*S(tt*1.3);if((wAcc+=1/60)>=.05){wAcc=0;drawWater(tt,name)}
  P.valve.rotation.z=Math.max(0,S(tt*.3)-.95)*40;/* now and then he gives the valve a quarter turn */
  if(name=='walk'){legs(t,.42);armsDown(S(t*6.283)*.35);grip.visible=false}
  else if(name=='carry'){legs(t,.32);reach(1.0,-.34);gripAt(.98,-.34);P.head.rotation.x=.15}
  else if(name=='take'){still();const u=ease(t<.5?t*2:2-t*2);reach(1.05+u*.1,-.34-u*.2);gripAt(1.05+u*.1,-.34-u*.2);P.head.rotation.x=.25}
  else if(name=='pour'){still();const up=ease(cl(t/.3)),dn=ease(cl((t-.85)/.15));const y=1.0+(.3*up)*(1-dn),z=-.34-(.04*up)*(1-dn);reach(y,z);gripAt(y,z);P.head.rotation.x=.3*up*(1-dn)}
  else if(name=='wave'){still();armsDown(0);P.armR.rotation.set(-.2,0,2.4);P.elbowR.rotation.set(0,0,.4*S(t*5));grip.visible=false}
  else if(name=='watch'){still();armsDown(0);grip.visible=false;P.head.rotation.set(0,S(t*.25)*.7,0);hips.position.y=HY+S(t*1.2)*.003}
  else{still();armsDown(S(t*1.1)*.025);grip.visible=false;hips.position.y=HY+S(t*1.4)*.004;P.head.rotation.y=Math.max(0,S(t*.35)-.8)*5*.4*S(t*.11)}};
 g.userData.pose('idle',0);
 return g}
/* ---------- the spots: where each tank stands and which way its funnel faces (the way the trucks come in) ---------- */
/* rotation.y: Math.PI = funnel to +z (north, towards the base road), -Math.PI/2 = funnel to +x (east) */
const WDSP=[
 {nm:'Water tower',x:58,z:-1052.5,ry:Math.PI},/* just north of the tower's legs */
 {nm:'Gulch water tower',x:538.5,z:-1500,ry:-Math.PI/2},/* east of the tower, facing the road */
 {nm:"Jeff's Oasis",x:-38,z:-1019.5,ry:Math.PI},/* north of the pool, between the palms */
 {nm:'Mining shack',x:-15,z:-1052,ry:Math.PI},/* beside the shack's north wall (r655: 2.5 m south, clear of Depot Rd) */
 {nm:'Campfire',x:12,z:-1100,ry:Math.PI}];
const WDEL={q:null,spots:[],li:0};
const WDLN=['The tanks are thirsty. So am I. I don\'t drink.','Mind the funnel.','*a long gurgle from the helmet*','Six cans a truck. I count them. Twice.','The sand drinks too. Slower than me.','Don\'t tap the glass.'];
/* tank-local (x, z) to desert coords */
function wdW(sp,lx,lz){const c=Math.cos(sp.ry),s=Math.sin(sp.ry);return[sp.x+lx*c+lz*s,sp.z-lx*s+lz*c]}
function wdBuild(q){WDEL.q=q;WDEL.spots=[];for(const d of WDSP){try{
  const sp=Object.assign({},d);let gy=0;try{gy=vehGround(q,sp.x,sp.z)}catch(e){}sp.y=gy;
  const t=mkWaterTank();t.position.set(sp.x,gy,sp.z);t.rotation.y=sp.ry;t.userData.dpKeep=1;q.g.add(t);sp.tank=t;
  /* collision: the tank, and the funnel on its front */const box=(x0,x1,z0,z1)=>{const a=wdW(sp,x0,z0),b=wdW(sp,x1,z1);return{x0:Math.min(a[0],b[0]),x1:Math.max(a[0],b[0]),z0:Math.min(a[1],b[1]),z1:Math.max(a[1],b[1])}};
  q.obs.push(box(-1.25,1.25,-1.25,1.25),box(-.2,.2,-1.45,-1.25));
  const gk=mkGroundskeeper();gk.userData.dpKeep=1;q.g.add(gk);sp.gk=gk;sp.home=[1.9,-1.7];const h=wdW(sp,1.9,-1.7);gk.position.set(h[0],gy,h[1]);gk.rotation.y=sp.ry;
  Object.assign(sp,{lv:.2,shown:.2,mode:'idle',waveT:0,headY:0,ph:0,pose:['idle',0],tt:Math.random()*9,li:Math.random()*WDLN.length|0,job:null});
  const pr={x:h[0],z:h[1],r:2,txt:()=>q.seat||q.inBus||!q.roam?'':'[E] 💧 Talk to the Groundskeeper',act:()=>{sp.li=(sp.li+1)%WDLN.length;hint('💧 Groundskeeper: "'+WDLN[sp.li]+'" (tank '+Math.round(sp.lv*100)+' %)');try{snd(140,.15)}catch(e){}}};q.props.push(pr);sp.prop=pr;
  WDEL.spots.push(sp)}catch(e){conLog('error','water spot '+d.nm+': '+e.message)}}q.obsDirty=1}
setInterval(()=>{try{const q=BUS.ride;if(q&&q.roam&&q.g&&q.locs&&q.locs.length&&WDEL.q!==q)wdBuild(q)}catch(e){conLog('error','water spots: '+e.message)}},1000);
const wdSpotOf=nm=>WDEL.q===BUS.ride?WDEL.spots.find(s=>s.nm==nm):null;
/* ---------- the squad drives up to the tank's front (it stops about 10 m short of this point, so the truck ends up roughly 8-15 m out) ---------- */
{const cs0=cwSend;cwSend=function(q,o){const r=cs0.apply(this,arguments);try{if(o&&o.T&&o.T.k=='water'){const sp=wdSpotOf(o.loc&&o.loc.nm),s=q.cw.sq[q.cw.sq.length-1];if(sp&&s&&s.T===o.T){const p=wdW(sp,0,-6);s.dst={x:p[0],z:p[1]};s.wp[s.wp.length-1]=[p[0],p[1]]}}}catch(e){conLog('error','water route: '+e.message)}return r}}
/* ---------- walking helpers ---------- */
const wdEase=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2,wdCl=v=>Math.max(0,Math.min(1,v));
/* the Groundskeeper walks (faces -z at rotation 0) */
function wdGo(sp,x,z,dt,sp0){const g=sp.gk,dx=x-g.position.x,dz=z-g.position.z,d=Math.hypot(dx,dz);if(d<.06)return true;const st=Math.min(d,(sp0||1.4)*dt);g.position.x+=dx/d*st;g.position.z+=dz/d*st;g.rotation.y=Math.atan2(-dx,-dz);sp.ph+=st*.85;return false}
function wdFace(sp,a,dt){const g=sp.gk;g.rotation.y+=Math.atan2(Math.sin(a-g.rotation.y),Math.cos(a-g.rotation.y))*Math.min(1,dt*6)}
/* a can held by a soldier: in his right hand, beside him */
function wdHold(m,c){const r=m.rotation.y;c.position.set(m.position.x+Math.cos(r)*.32,.86,m.position.z-Math.sin(r)*.32);c.rotation.set(0,r+Math.PI/2,0)}
const wdV=new THREE.Vector3();
/* ---------- the job ---------- */
function wdStart(q,s){const G=s.sg2,sp=wdSpotOf(s.loc&&s.loc.nm);if(!G||!sp)return;
 /* the old green boxes are not used */G.g.visible=false;for(const it of G.items)if(it.parent)it.parent.remove(it);G.items=[];G.parts=[];
 const W={sp,cans:[],next:0,gi:0,gst:'wave',gt:0,sd:[{st:'go'},{st:'go'}]};G.W=W;G.wEnd=1e9;
 /* nobody near (or he is busy with another squad): the water just goes in */
 const busy=sp.job&&sp.job.G!==G&&!sp.job.s.done,far=Math.hypot(P.x-sp.x,P.z-q.OZ-sp.z)>120;
 if(far||busy){W.skip=1;sp.lv=Math.min(1,sp.lv+.72);G.wEnd=28;return}
 sp.job={s,G};
 for(let i=0;i<6;i++){const c=mkJerrycan();c.visible=false;c.userData.dpKeep=1;q.g.add(c);G.items.push(c);W.cans.push({m:c,st:'truck',slot:i})}
 sp.waveT=0;sp.mode='job'}
function wdAbort(sp){const j=sp.job;sp.job=null;sp.mode='home';try{if(j&&j.G){for(const it of j.G.items)if(it.parent)it.parent.remove(it)}}catch(e){}}
function wdTick(q,s,dt){const G=s.sg2,W=G.W,sp=W.sp,t=s.wt;
 const truck=s.v[0].v,tg=[truck.x+Math.sin(truck.h)*3.4,truck.z+Math.cos(truck.h)*3.4];
 /* the guards: either side of the tailgate, looking at the tank */
 const S=s.sol;for(let i=2;i<S.length;i++){const m=S[i],px=Math.cos(truck.h)*(i==2?1.6:-1.6),pz=-Math.sin(truck.h)*(i==2?1.6:-1.6);if(sgWalk(m,tg[0]+px,tg[1]+pz,dt,2)){m.position.y=.9;m.rotation.y=Math.atan2(sp.x-m.position.x,sp.z-m.position.z)}}
 if(W.skip){for(let i=0;i<2&&i<S.length;i++){const m=S[i],a=i?-.7:.7;if(sgWalk(m,tg[0]+Math.cos(truck.h+a)*2.4,tg[1]-Math.sin(truck.h+a)*2.4,dt,2))m.rotation.y=Math.atan2(sp.x-m.position.x,sp.z-m.position.z)}return}
 if(t>240){G.wEnd=s.wt;return}/* never hang a squad */
 /* the two carriers */
 for(let i=0;i<2&&i<S.length;i++){const m=S[i],d=W.sd[i];m.position.y=.9;
  if(d.st=='go'){/* to the tailgate for a full can, or to the row for an empty one */
   if(W.next<6){if(sgWalk(m,tg[0]+(i?-.5:.5)*Math.cos(truck.h),tg[1]-(i?-.5:.5)*Math.sin(truck.h),dt,2.6)){const c=W.cans[W.next++];c.st='carried';c.m.visible=true;d.c=c;d.st='toRow'}}
   else{const e=W.cans.find(c=>c.st=='empty'&&!c.claim);if(e){e.claim=1;d.c=e;d.st='toEmpty'}else{const a=i?-.9:.9;if(sgWalk(m,tg[0]+Math.cos(truck.h+a)*2.2,tg[1]-Math.sin(truck.h+a)*2.2,dt,2))m.rotation.y=Math.atan2(sp.x-m.position.x,sp.z-m.position.z)}}}
  else if(d.st=='toRow'){const p=wdW(sp,(d.c.slot-2.5)*.5,-3.2);wdHold(m,d.c.m);if(sgWalk(m,p[0],p[1],dt,2.2)){d.st='drop';d.t=0}wdHold(m,d.c.m)}
  else if(d.st=='drop'){d.t+=dt;const p=wdW(sp,(d.c.slot-2.5)*.5,-2.7);m.rotation.y=Math.atan2(p[0]-m.position.x,p[1]-m.position.z);const u=wdCl(d.t/.6);m.position.y=.9-.3*Math.sin(u*Math.PI);
   if(u<1){wdHold(m,d.c.m);d.c.m.position.y-=.43*Math.sin(u*Math.PI/2)}else{d.c.m.position.set(p[0],sp.y+.43,p[1]);d.c.m.rotation.set(0,sp.ry,0);d.c.st='row';d.c=null;d.st='go'}}
  else if(d.st=='toEmpty'){const p=wdW(sp,(d.c.slot-2.5)*.5,-3.2);if(sgWalk(m,p[0],p[1],dt,2.2)){d.st='pick';d.t=0}}
  else if(d.st=='pick'){d.t+=dt;const u=wdCl(d.t/.6);m.position.y=.9-.3*Math.sin(u*Math.PI);if(u>=.5){d.c.st='back';wdHold(m,d.c.m)}if(u>=1){d.st='toTruck'}}
  else if(d.st=='toTruck'){wdHold(m,d.c.m);if(sgWalk(m,tg[0],tg[1],dt,2.6)){d.c.m.visible=false;d.c.st='gone';d.c=null;d.st='go'}else wdHold(m,d.c.m)}}
 /* the Groundskeeper */
 const g=sp.gk,gc=W.cans[W.gi];W.gt+=dt;
 if(W.gst=='wave'){wdFace(sp,Math.atan2(-(truck.x-g.position.x),-(truck.z-g.position.z)),dt);sp.pose=['wave',W.gt];if(W.gt>2.5){W.gst='toCan';W.gt=0}}
 else if(W.gst=='toCan'){const p=wdW(sp,(W.gi-2.5)*.5,-2.2);if(wdGo(sp,p[0],p[1],dt)){wdFace(sp,sp.ry,dt);sp.pose=['idle',sp.tt];if(gc.st=='row'){W.gst='take';W.gt=0;W.from=gc.m.position.clone()}}else sp.pose=['walk',sp.ph]}
 else if(W.gst=='take'){wdFace(sp,sp.ry,dt);const u=wdCl(W.gt/.8);sp.pose=['take',u];g.userData.pose('take',u);g.updateMatrixWorld(true);g.userData.parts.grip.getWorldPosition(wdV);q.g.worldToLocal(wdV);const e=wdEase(wdCl(u*1.6));gc.m.position.lerpVectors(W.from,wdV,e);
  if(u>=1){g.userData.parts.grip.add(gc.m);gc.m.position.set(0,0,0);gc.m.rotation.set(0,0,0);gc.st='gk';W.gst='carry';W.gt=0}}
 else if(W.gst=='carry'){const st=wdW(sp,0,-1.74);if(wdGo(sp,st[0],st[1],dt)){W.gst='turn';W.gt=0}sp.pose=['carry',sp.ph]}
 else if(W.gst=='turn'){wdFace(sp,sp.ry+Math.PI,dt);sp.pose=['carry',0];if(W.gt>.5){g.rotation.y=sp.ry+Math.PI;W.gst='pour';W.gt=0;W.lvd=0}}
 else if(W.gst=='pour'){const u=wdCl(W.gt/3.5);sp.pose=['pour',u];const f=u<.85?wdCl((u-.3)/.3):wdCl((.97-u)/.12);
  g.userData.pose('pour',u);g.updateMatrixWorld(true);const cu=gc.m.userData;cu.pour(f,.3);gc.m.updateMatrixWorld(true);cu.parts.stream.getWorldPosition(wdV);q.g.worldToLocal(wdV);const len=Math.max(.05,wdV.y-(sp.y+sp.tank.userData.FUNNEL.y)+.03);cu.pour(f,len);
  if(f>.6&&!W.lvd){W.lvd=1;sp.lv=Math.min(1,sp.lv+.12);try{snd(90,.3)}catch(e){}}
  if(u>=1){cu.pour(0);gc.st='emptyHeld';W.gst='back';W.gt=0}}
 else if(W.gst=='back'){const p=wdW(sp,(W.gi-2.5)*.5,-2.2);if(wdGo(sp,p[0],p[1],dt)){W.gst='put';W.gt=0}sp.pose=['carry',sp.ph]}
 else if(W.gst=='put'){wdFace(sp,sp.ry,dt);const u=wdCl(W.gt/.7);sp.pose=['take',1-u];
  if(u>=1){const p=wdW(sp,(W.gi-2.5)*.5,-2.7);q.g.add(gc.m);gc.m.position.set(p[0],sp.y+.43,p[1]);gc.m.rotation.set(0,sp.ry,0);gc.st='empty';W.gi++;W.gt=0;W.gst=W.gi>=6?'bye':'toCan'}}
 else if(W.gst=='bye'){wdFace(sp,Math.atan2(-(truck.x-g.position.x),-(truck.z-g.position.z)),dt);sp.pose=['wave',W.gt];if(W.gt>2.5){W.gst='done';G.wEnd=Math.max(28,s.wt+.1);sp.job=null;sp.mode='home'}}}
/* the job is over (or was called off): the Groundskeeper goes back to his place */
{const sje=sjEnd;sjEnd=function(q,s){try{const G=s&&s.sg2;if(G&&G.W){const sp=G.W.sp;if(sp.job&&sp.job.G===G){sp.job=null;sp.mode='home'}}}catch(e){}return sje.apply(this,arguments)}}
{const sjs=sjStart;sjStart=function(q,s){const r=sjs.apply(this,arguments);try{if(s.T&&s.T.k=='water')wdStart(q,s)}catch(e){conLog('error','water job: '+e.message)}return r}}
{const sjt=sjTick;sjTick=function(q,s,dt){if(s.sg2&&s.sg2.W)return wdTick(q,s,dt);return sjt.apply(this,arguments)}}
/* ---------- every frame: the tanks' levels, and the Groundskeepers when nobody is giving them water ---------- */
function wdFrame(q,dt){const lz=P.z-q.OZ;for(const sp of WDEL.spots){
 sp.lv=Math.max(0,sp.lv-.12*dt/300);if(Math.abs(sp.shown-sp.lv)>.0005){const k=.06*dt;sp.shown+=Math.max(-k,Math.min(k,sp.lv-sp.shown));if(sp.lv<sp.shown-.05)sp.shown=sp.lv}
 const g=sp.gk,pd=Math.hypot(P.x-g.position.x,lz-g.position.z);sp.tt+=dt;
 /* a job that ended without telling us (the squad was lost) */if(sp.job){const s=sp.job.s;if(s.done||s.sg2!==sp.job.G)wdAbort(sp)}
 if(!sp.job){const h=wdW(sp,sp.home[0],sp.home[1]);
  if(sp.mode=='home'){if(wdGo(sp,h[0],h[1],dt)){sp.mode='idle';}sp.pose=['walk',sp.ph]}
  else if(pd<10&&!q.inBus)sp.pose=['watch',sp.tt];else{wdFace(sp,sp.ry,dt*.3);sp.pose=['idle',sp.tt]}}
 sp.prop.x=g.position.x;sp.prop.z=g.position.z;
 if(pd<60){try{if(Math.abs((sp.tank.userData.lvS||-1)-sp.shown)>.001){sp.tank.userData.setLevel(sp.shown);sp.tank.userData.lvS=sp.shown}
   const ps=sp.pose;g.userData.pose(ps[0],ps[1]);
   /* watching you: the head follows, and when you go round him he turns his body too */
   if(ps[0]=='watch'){let a=Math.atan2(-(P.x-g.position.x),-(lz-g.position.z))-g.rotation.y;a=Math.atan2(Math.sin(a),Math.cos(a));if(Math.abs(a)>1.1)g.rotation.y+=Math.sign(a)*Math.min(Math.abs(a)-1.1,dt*.8);const want=Math.max(-1.1,Math.min(1.1,a));sp.headY+=(want-sp.headY)*Math.min(1,dt*2.5);g.userData.parts.head.rotation.y=sp.headY}else sp.headY*=.9}catch(e){}}}}
{const ru=busRoamUpd;busRoamUpd=function(q,dt){const r=ru.apply(this,arguments);try{if(q&&WDEL.q===q&&q.g)wdFrame(q,Math.min(.1,dt))}catch(e){conLog('error','water tick: '+e.message)}return r}}
