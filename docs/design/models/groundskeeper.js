/* =====================================================================================================
   mkGroundskeeper(): THE GROUNDSKEEPER. Keeps the desert's wells and tanks. A dark, smooth head with a round brass
   porthole visor (pale cyan glass), a wide flat black hat, a long sage-green coat, two brown leather straps down the
   front into a belt with a pouch, a copper air tank on his back, big dark gloves and boots.
   Quiet and odd, but harmless.

   SIZE      1.95 m tall with the hat. 0.56 m across the shoulder pads.
   ORIGIN    Between the feet, on the ground.
   FRONT     -z (faces -z at rotation.y = 0, like mkSoldier and mkCaretaker). Walking towards (dx, dz):
             rotation.y = atan2(-dx, -dz).
   PARTS     The same as mkCaretaker, so he can do the water job too:
             hips, legL, legR, kneeL, kneeR, armL, armR, elbowL, elbowR, head, grip
             plus:
             tails     [left, right] the coat's lower halves (Groups); pose() swings them with the legs
             visor     Mesh, the porthole glass. It's full of water: pose() redraws it (sloshing surface, rising bubbles,
                       rippling light), 20 times a second, sloshing more while he walks
             valve     Mesh, the handwheel on top of the tank (pose() turns it now and then)
   USE       g.userData.pose(name, t): 'idle' | 'walk' | 'carry' | 'take' | 'pour' | 'wave' (as mkCaretaker),
             plus 'watch' (t = time): stands very still, head slowly turning to follow something.
             For 'carry' / 'take' / 'pour' put a can in parts.grip (mkJerrycan()).
   ANIMATION Call pose() every frame (the visor pulse and the tank hiss twitch are inside it).
   COLLISION 0.56 × 0.5 box round his origin (the tank sticks out 0.3 m behind) if he needs one.
   ===================================================================================================== */
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
