/* =====================================================================================================
   mkCaretaker(seed): the man at the WATER DELIVERY site who takes the jerrycans from the squad and pours them
   into the tank. Overalls over a check shirt, work boots, a wide straw hat, a moustache. Jointed, with poses.
   seed (0…5) picks the shirt, overall and hat colours, so two caretakers don't look the same.

   SIZE      1.83 m tall with the hat, 0.5 m across the shoulders.
   ORIGIN    Between the feet, on the ground.
   FRONT     -z (he faces -z at rotation.y = 0, like mkSoldier). Walking towards (dx, dz): rotation.y = atan2(-dx, -dz).
   PARTS     g.userData.parts:
             hips                  Group at y 0.92 (moves for the walk bob).
             legL, legR            hip joints;  kneeL, kneeR    knee joints   (rotation.x; + swings forward)
             armL, armR            shoulders;   elbowL, elbowR  elbows        (rotation.x; + swings forward)
             head                  neck joint (rotation.x nods, rotation.y turns)
             grip                  Group between his hands. Put a jerrycan in it: grip.add(mkJerrycan()).
                                   It stays level (pose() keeps it upright). The can's spout (+x) is on his right.
   USE       g.userData.pose(name, t)
               'idle'   t = time (breathing, a look round now and then)
               'walk'   t = walk phase in cycles (add speed × dt × 0.85 per second at 1.4 m/s)
               'carry'  t = walk phase: walking with a full can held in front in both hands
               'take'   t = 0 … 1: reaching out to take a can from someone in front of him (arms out, then in)
               'pour'   t = 0 … 1: lifts the can to 1.3 m (handle height), 0.36 m in front of him, over the funnel, tips it.
                        Tip the can with can.userData.pour(f) where f = clamp((t - 0.3) / 0.4): the spout dips
                        right in front of him, the can's body rises to his left (the way you pour a jerrycan sideways).
               'wave'   t = time: waves at the squad when they arrive.
   ANIMATION (the delivery, per can; see docs/design/water-delivery.md)
             walk to the truck's tailgate → 'take' 0.8 s → 'carry' back to the tank's STAND → 'pour' 3.5 s → repeat.
   COLLISION none needed (he walks a set path). If you want one: 0.5 × 0.3 box round his origin.
   ===================================================================================================== */
function mkCaretaker(seed){
 const g=new THREE.Group();seed=(seed|0)%6;
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0},o||{}));
 const SH=[['#b03a2a','#7a1e18'],['#2a5a9a','#1a3a6a'],['#3a7a3a','#1e4a1e'],['#c08a2a','#7a5a18'],['#6a3a8a','#3a1e5a'],['#2a7a7a','#1a4a4a']][seed];
 const OV=[0x34507a,0x5a5a4a,0x7a5a3a,0x2e4a6a,0x4a4a52,0x5a4a3a][seed],HAT=[0xd8c088,0xc8a868,0xe0cc98,0xb89858,0xd0b878,0xc0a060][seed];
 /* check shirt: a 64 px tile = 20 cm of fabric */
 const shirtT=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle=SH[0];x.fillRect(0,0,64,64);x.fillStyle=SH[1];x.globalAlpha=.55;x.fillRect(0,0,64,14);x.fillRect(0,32,64,14);x.fillRect(0,0,14,64);x.fillRect(32,0,14,64);x.globalAlpha=.25;x.fillStyle='#fff';x.fillRect(0,22,64,2);x.fillRect(22,0,2,64);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t})();
 const shirt=(rx,ry)=>{const t=shirtT.clone();t.needsUpdate=true;t.repeat.set(rx,ry);return M(0xffffff,{map:t})};
 const skin=M(0xc89070,{roughness:.7}),ov=M(OV,{roughness:.9}),boot=M(0x4a2e1a,{roughness:.6}),hat=M(HAT,{roughness:1}),hair=M(0x5a3a22,{roughness:1}),brass=M(0xc8a040,{metalness:.8,roughness:.3});
 const add=(geo,m,x,y,z,p)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);p.add(o);return o};
 const cyl=(r1,r2,h,s)=>new THREE.CylinderGeometry(r1,r2,h,s||10),box=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
 const P={};
 /* ---------- hips and legs ---------- */
 const hips=new THREE.Group();hips.position.y=.92;g.add(hips);P.hips=hips;
 add(box(.34,.2,.21),ov,0,.02,0,hips);
 for(const sx of[-1,1]){const leg=new THREE.Group();leg.position.set(sx*.1,-.02,0);hips.add(leg);
  add(cyl(.085,.075,.44),ov,0,-.22,0,leg);
  const knee=new THREE.Group();knee.position.y=-.44;leg.add(knee);
  add(new THREE.SphereGeometry(.077,10,8),ov,0,0,0,knee);
  add(cyl(.072,.062,.4),ov,0,-.2,0,knee);
  add(cyl(.068,.068,.06,10),M(0x3a2a1e),0,-.37,0,knee);/* trouser cuff over the boot */
  add(box(.13,.1,.27),boot,0,-.43,-.04,knee);add(box(.135,.03,.28),M(0x2a1a10),0,-.465,-.04,knee);/* boot and sole */
  P[sx<0?'legL':'legR']=leg;P[sx<0?'kneeL':'kneeR']=knee}
 /* ---------- body ---------- */
 const torso=new THREE.Group();torso.position.y=.1;hips.add(torso);
 {const t=add(cyl(.19,.17,.52,12),shirt(3,2.5),0,.26,0,torso);t.scale.z=.68;
  /* the overall bib over the front and the straps over the shoulders */
  add(box(.28,.26,.03),ov,0,.17,-.125,torso);add(box(.07,.07,.01),M(0x2a3a5a),0,.2,-.142,torso);/* bib pocket */
  for(const sx of[-1,1]){add(box(.05,.36,.025),ov,sx*.09,.36,-.12,torso).rotation.x=.12;add(box(.05,.36,.025),ov,sx*.09,.33,.12,torso).rotation.x=-.12;add(new THREE.SphereGeometry(.018,8,6),brass,sx*.09,.29,-.142,torso)}
  add(box(.36,.1,.24),ov,0,-.03,0,torso);/* waist */
  add(cyl(.11,.13,.08),shirt(1,.3),0,.54,0,torso).scale.z=.8}/* collar */
 /* ---------- head ---------- */
 const head=new THREE.Group();head.position.y=.6;torso.add(head);P.head=head;
 add(cyl(.05,.055,.08),skin,0,.03,0,head);
 {const hd=add(new THREE.SphereGeometry(.115,16,12),skin,0,.16,0,head);hd.scale.set(.95,1.08,1);
  add(box(.04,.05,.05),skin,0,.15,-.115,head);/* nose */
  for(const sx of[-1,1]){add(new THREE.SphereGeometry(.014,8,6),M(0x1a1410,{roughness:.4}),sx*.042,.19,-.1,head);add(box(.04,.01,.01),hair,sx*.042,.215,-.104,head);/* eyes, brows */
   add(new THREE.SphereGeometry(.028,8,6),skin,sx*.112,.16,0,head)}/* ears */
  add(box(.09,.022,.02),hair,0,.115,-.112,head);/* moustache */
  const back=add(new THREE.SphereGeometry(.118,14,10,0,6.283,0,1.7),hair,0,.165,.008,head);back.scale.set(.97,1.05,1);back.rotation.x=-.25}
 /* the hat: a wide brim, a crown and a band */
 {const brim=add(cyl(.26,.26,.015,24),hat,0,.27,0,head);brim.rotation.x=.06;
  add(cyl(.12,.13,.13,16),hat,0,.33,0,head);add(cyl(.132,.132,.035,16),M(0x5a2a1a),0,.29,0,head);add(cyl(.12,.12,.01,16),hat,0,.4,0,head)}
 /* ---------- arms ---------- */
 for(const sx of[-1,1]){const arm=new THREE.Group();arm.position.set(sx*.23,.47,0);torso.add(arm);
  add(new THREE.SphereGeometry(.065,10,8),shirt(1,1),0,0,0,arm);
  add(cyl(.058,.052,.3),shirt(1.2,1.5),0,-.15,0,arm);
  const el=new THREE.Group();el.position.y=-.3;arm.add(el);
  add(new THREE.SphereGeometry(.052,10,8),shirt(1,1),0,0,0,el);
  add(cyl(.05,.042,.17),shirt(1,1),0,-.085,0,el);add(cyl(.043,.04,.1),skin,0,-.21,0,el);/* rolled sleeve, forearm */
  const hand=add(box(.07,.1,.04),skin,0,-.3,0,el);hand.userData.isHand=1;
  P[sx<0?'armL':'armR']=arm;P[sx<0?'elbowL':'elbowR']=el}
 /* the grip: sits between the hands; pose() moves it and keeps it level */
 const grip=new THREE.Group();g.add(grip);P.grip=grip;
 g.userData.parts=P;
 /* ---------- poses ---------- */
 const S=Math.sin,C=Math.cos,cl=v=>Math.max(0,Math.min(1,v)),ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
 const legs=(ph,amp)=>{const a=S(ph*6.283)*amp;P.legL.rotation.x=a;P.legR.rotation.x=-a;P.kneeL.rotation.x=-Math.max(0,-S(ph*6.283+.6))*amp*1.3;P.kneeR.rotation.x=-Math.max(0,S(ph*6.283+.6))*amp*1.3;hips.position.y=.92-Math.abs(S(ph*6.283))*.03+.015};
 const still=()=>{P.legL.rotation.x=P.legR.rotation.x=P.kneeL.rotation.x=P.kneeR.rotation.x=0;hips.position.y=.92};
 /* place the grip at a point in front of him (body frame) and keep it level, facing forward */
 const gripAt=(y,z)=>{grip.position.set(0,y,z);grip.rotation.set(0,0,0)};
 /* point both arms so the hands meet at (y, z) in the shoulder plane: two-bone IK in the y-z plane */
 const reach=(y,z)=>{const sy=hips.position.y+.1+.47,A=.3,B=.3;/* shoulder height; upper arm and forearm lengths */
  const dy=y-sy,dz=z,d=Math.max(.12,Math.min(A+B-.01,Math.hypot(dy,dz)));
  const phi=Math.atan2(-dz,-dy),al=Math.acos(cl((A*A+d*d-B*B)/(2*A*d))),ga=Math.acos(Math.max(-1,Math.min(1,(A*A+B*B-d*d)/(2*A*B))));
  for(const k of['L','R']){P['arm'+k].rotation.set(phi-al,0,k=='L'?.32:-.32);P['elbow'+k].rotation.set(Math.PI-ga,0,0)}};
 const armsDown=(sw)=>{P.armL.rotation.set(-sw,0,-.06);P.armR.rotation.set(sw,0,.06);P.elbowL.rotation.x=.15+Math.max(0,-sw)*.4;P.elbowR.rotation.x=.15+Math.max(0,sw)*.4};
 g.userData.pose=function(name,t){t=t||0;P.head.rotation.set(0,0,0);grip.visible=true;
  if(name=='walk'){legs(t,.45);armsDown(S(t*6.283)*.4);gripAt(.9,-.3);grip.visible=false}
  else if(name=='carry'){legs(t,.35);reach(1.0,-.32);gripAt(1.0-.02,-.32);P.head.rotation.x=.08}
  else if(name=='take'){still();const u=ease(t<.5?t*2:2-t*2);reach(1.05+u*.1,-.32-u*.18);gripAt(1.05+u*.1,-.32-u*.18);P.head.rotation.x=.15}
  else if(name=='pour'){still();const up=ease(cl(t/.3)),dn=ease(cl((t-.85)/.15));const y=1.0+(.3*up)*(1-dn),z=-.32-(.04*up)*(1-dn);reach(y,z);gripAt(y,z);P.head.rotation.x=.3*up*(1-dn);
   /* lean in a little while pouring */hips.position.y=.92;P.legL.rotation.x=P.legR.rotation.x=0}
  else if(name=='wave'){still();armsDown(0);P.armR.rotation.set(-.2,0,2.6);P.elbowR.rotation.x=0;P.elbowR.rotation.z=.5*S(t*8);grip.visible=false;P.head.rotation.y=.1*S(t)}
  else{/* idle */still();armsDown(S(t*1.3)*.03);hips.position.y=.92+S(t*1.6)*.004;P.head.rotation.y=Math.max(0,S(t*.4)-.85)*4*.5*S(t*.13);grip.visible=false}
  if(name!='wave'){P.elbowR.rotation.z=0}};
 g.userData.pose('idle',0);
 return g}
