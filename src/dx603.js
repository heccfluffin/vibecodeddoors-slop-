/* =====================================================================================================
   r607: DEVIL'S GORGE AND THE QUARRY SKIP (docs/design/devils-gorge.md parts 2-3, speedway-and-stunt-jump.md part 3).
   - THE OLD GORGE MINE LIFT is rebuilt from the design chat's model (mkGorgeLift): a lined shaft through the cave
     ceiling, a timber headframe, a real rope over the sheave to the winch, hatches over the shaft on the surface.
     It only goes UP: ride it from the cave, step out at the top, and the empty cage goes back down by itself.
   - THE CAVE FLOOR: the tunnel floor was built with a negative depth (an inside-out box you could see through).
     Fixed, every floor piece now runs under its walls, and one solid rock slab sits under the whole cave.
   - QUARRY SKIP: the old little ramp is replaced by a steel booster ramp (mkBoosterRamp) and a landing ramp on the far
     side of Lookout Mesa (mkLandingRamp). Drive over the glowing strip at speed and up the kicker: it fires you
     over the mesa onto the landing ramp. Without the boost it is just a steep kicker.
   The three model functions below are the design chat's files, copied as they are.
   ===================================================================================================== */
function mkGorgeLift(){
 const g=new THREE.Group();
 /* ---------- materials ---------- */
 const timber=new THREE.MeshStandardMaterial({color:0x6e4c2c,roughness:1});
 const timberD=new THREE.MeshStandardMaterial({color:0x553820,roughness:1});
 const iron=new THREE.MeshStandardMaterial({color:0x4a4a4e,metalness:.65,roughness:.5});
 const ironD=new THREE.MeshStandardMaterial({color:0x2e2e32,metalness:.6,roughness:.6});
 const rust=new THREE.MeshStandardMaterial({color:0x7a3e22,metalness:.4,roughness:.8});
 const ropeM=new THREE.MeshStandardMaterial({color:0x3a3026,roughness:1});
 const lampM=new THREE.MeshStandardMaterial({color:0xffe0a0,emissive:0xffb050,emissiveIntensity:1.2});
 /* timber cribbing for the shaft lining: a 256 px canvas = 2 m × 2 m, 8 logs of 25 cm */
 const crib=(w,h)=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
  for(let i=0;i<8;i++){const y=i*32;const s=88+((i*53)%28);x.fillStyle='rgb('+(s+22)+','+(s-8)+','+(s-38)+')';x.fillRect(0,y,256,32);
   x.fillStyle='rgba(0,0,0,.35)';x.fillRect(0,y+29,256,3);x.fillStyle='rgba(255,230,190,.08)';x.fillRect(0,y+1,256,3);
   for(let k=0;k<26;k++){x.fillStyle='rgba(30,15,5,'+(.08+((k*37+i*11)%10)/60)+')';x.fillRect((k*97+i*41)%256,y+4+((k*13)%22),20+((k*29)%40),1)}
   const j=(i*71)%256;x.fillStyle='rgba(0,0,0,.4)';x.fillRect(j,y,2,32)}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(w/2,h/2);return new THREE.MeshStandardMaterial({map:t,roughness:1})};
 /* sign texture: text on a board, drawn at the board's real proportions */
 const signMat=(w,h,lines,bg,fg)=>{const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/w);const x=c.getContext('2d');
  x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);x.strokeStyle=fg;x.lineWidth=6;x.strokeRect(8,8,c.width-16,c.height-16);x.fillStyle=fg;x.textAlign='center';x.textBaseline='middle';
  const n=lines.length;lines.forEach((L,i)=>{x.font=(i?'600 ':'bold ')+Math.round(c.height*(n==1?.42:i?.17:.3))+'px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';x.fillText(L,256,c.height*(n==1?.52:(i?.72:.38)),c.width-90)});
  const t=new THREE.CanvasTexture(c);return new THREE.MeshStandardMaterial({map:t,roughness:.9})};
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const CY=(r,len,m,x,y,z,p,seg)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,seg||10),m);o.position.set(x,y,z);(p||g).add(o);return o};
 /* a beam from point a to point b */
 const beam=(a,b,t,m,p)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),L=d.length();const o=new THREE.Mesh(new THREE.BoxGeometry(t,L,t),m);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());(p||g).add(o);return o};

 /* ======================= THE SHAFT ======================= */
 const TOP=-.18,BOT=-24,SH=TOP-BOT;/* lining from the ceiling up to just under the surface collar */
 for(const sx of[-1,1])BX(.2,SH,3.8,crib(3.8,SH),sx*1.8,(TOP+BOT)/2,0);/* ±x walls run the full 3.8 m and cover the corners */
 for(const sz of[-1,1])BX(3.4,SH,.2,crib(3.4,SH),0,(TOP+BOT)/2,sz*1.8);
 /* guide rails the cage runs on: from the cave floor to 2.9 m up the headframe */
 for(const sx of[-1,1]){BX(.16,32.9,.2,timberD,sx*1.62,(-30+2.9)/2,0);BX(.25,.2,.2,timberD,sx*1.825,2.8,0)}
 /* in the cave: an open frame from the floor (-30) to the ceiling (-24) */
 for(const sx of[-1,1])for(const sz of[-1,1])BX(.25,6,.25,timber,sx*1.8,-27,sz*1.8);
 for(const sx of[-1,1])BX(.25,6,.25,timber,sx*1.8,-27,0);/* the posts behind the guides */
 for(const sx of[-1,1])BX(.18,.22,3.35,timber,sx*1.8,-27,0);/* side rails at waist height (between the corner posts) */
 BX(3.35,.22,.18,timber,0,-27,1.8);/* back rail; the front stays open, that is the way in */
 for(const sx of[-1,1])BX(.4,.3,4.4,timber,sx*2.0,-24.15,0);/* the collar under the cave ceiling, hiding the cut */
 for(const sz of[-1,1])BX(3.6,.3,.4,timber,0,-24.15,sz*2.0);
 /* bottom: two buffer blocks the cage lands on (the cage floor sits on the cave floor between them) */
 for(const sx of[-1,1])BX(.3,.18,.5,ironD,sx*1.45,-29.91,1.0);
 /* a small sign in the cave on the front-left post */
 {const m=signMat(1.2,.4,['▲ LIFT TO SURFACE'],'#4a2a12','#ffe0a0');const s=BX(1.2,.4,.04,[timberD,timberD,timberD,timberD,timberD,m],-1.8,-28.2,-1.8-.125-.02);s.userData.sign=1}

 /* ======================= THE SURFACE COLLAR AND HATCHES ======================= */
 for(const sx of[-1,1])BX(.5,.3,4.4,timber,sx*1.95,-.03,0);/* x-beams run the full length */
 for(const sz of[-1,1])BX(3.4,.3,.5,timber,0,-.03,sz*1.95);/* z-beams sit between them */
 /* lips between the collar and the hinge line, either side of the guide rails */
 for(const sx of[-1,1])for(const sz of[-1,1])BX(.16,.3,1.6,timber,sx*1.62,-.03,sz*.9);
 const parts={};
 for(const sx of[-1,1]){const h=new THREE.Group();h.position.set(sx*1.54,.12,0);g.add(h);
  const leaf=new THREE.Group();h.add(leaf);/* planks across, two battens underneath */
  /* four planks, with a slot in the middle so the open leaf clears the guide rail */
  for(const[z,i]of[[-1.305,0],[-.51,1],[.51,0],[1.305,1]])BX(1.54,.07,z<-1||z>1?.79:.8,i?timber:timberD,-sx*.77,-.035,z,leaf);
  for(const bz of[-1.1,1.1])BX(1.4,.06,.14,timberD,-sx*.77,-.1,bz,leaf);
  BX(.08,.04,.5,iron,-sx*.06,.02,-1.0,leaf);BX(.08,.04,.5,iron,-sx*.06,.02,1.0,leaf);/* hinge straps */
  parts[sx<0?'hatchL':'hatchR']=h}

 /* ======================= THE HEADFRAME ======================= */
 const LG=7.8;/* legs stand on the collar corners (top 0.12) and go up to 7.8 */
 for(const sx of[-1,1])for(const sz of[-1,1])BX(.3,LG-.12,.3,timber,sx*2.05,(LG+.12)/2,sz*2.05);
 for(const y of[2.8,5.3]){for(const sz of[-1,1])BX(3.8,.2,.2,timber,0,y,sz*2.05);for(const sx of[-1,1])BX(.2,.2,3.8,timber,sx*2.05,y,0)}
 /* diagonal braces on the sides and the back, in the upper two panels (the front stays open to walk out) */
 for(const[y0,y1]of[[2.9,5.2],[5.4,7.7]]){for(const sx of[-1,1])beam([sx*2.05,y0,-1.9],[sx*2.05,y1,1.9],.16,timberD);beam([-1.9,y0,2.05],[1.9,y1,2.05],.16,timberD)}
 /* the cap */for(const sx of[-1,1])BX(.3,.3,4.4,timber,sx*2.05,LG+.15,0);for(const sz of[-1,1])BX(3.8,.3,.3,timber,0,LG+.15,sz*2.05);
 /* the back legs, leaning down towards the winch */
 for(const sx of[-1,1])beam([sx*2.0,LG,2.05],[sx*1.6,0,6.4],.28,timber);
 for(const sx of[-1,1])BX(.4,.1,.4,ironD,sx*1.6,.05,6.4);/* footing plates */
 beam([-1.75,3.9,4.4],[1.75,3.9,4.4],.18,timberD);/* a cross-tie between the back legs */
 /* the sheave: bearing beams, blocks, axle, wheel */
 const SY=9.0,SZ=1.0,SR=1.0;
 for(const sx of[-1,1]){BX(.25,.3,4.4,timberD,sx*.35,LG+.45,0);BX(.25,.55,.4,ironD,sx*.35,LG+.6+.275,SZ)}
 CY(.07,.95,iron,0,SY,SZ).rotation.z=Math.PI/2;
 {const s=new THREE.Group();s.position.set(0,SY,SZ);g.add(s);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(SR-.04,.07,8,36),rust);rim.rotation.y=Math.PI/2;s.add(rim);
  for(const ox of[-.06,.06]){const fl=new THREE.Mesh(new THREE.TorusGeometry(SR+.02,.025,6,36),rust);fl.rotation.y=Math.PI/2;fl.position.x=ox;s.add(fl)}
  for(let i=0;i<6;i++){const sp=new THREE.Mesh(new THREE.BoxGeometry(.05,SR*2-.12,.07),rust);sp.rotation.x=i*Math.PI/6;s.add(sp)}
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.2,12),ironD);hub.rotation.z=Math.PI/2;s.add(hub);parts.sheave=s}
 /* the sign over the front */
 {const m=signMat(3.6,1.0,['OLD GORGE MINE','LIFT GOES UP ONLY · NO RIDES DOWN'],'#4a2a12','#ffe0a0');BX(3.6,1.0,.06,[timberD,timberD,timberD,timberD,timberD,m],0,3.7,-2.2-.03)}
 /* a lamp under the cap, front */
 {BX(.1,.3,.1,iron,0,LG-.15,-2.05+.2);const l=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),lampM);l.position.set(0,LG-.38,-2.05+.2);g.add(l)}

 /* ======================= THE WINCH ======================= */
 const WZ=8.5,WY=1.1;
 BX(2.4,.3,2.2,timberD,0,.15,WZ);/* skid: x ±1.2, z 7.4 … 9.6 */
 for(const sx of[-1,1]){BX(.12,.95,.8,ironD,sx*.75,.3+.475,WZ)}
 CY(.06,1.62,iron,0,WY,WZ).rotation.z=Math.PI/2;
 {const d=new THREE.Group();d.position.set(0,WY,WZ);g.add(d);
  const wrap=new THREE.Mesh(new THREE.CylinderGeometry(.47,.47,1.0,18),ropeM);wrap.rotation.z=Math.PI/2;d.add(wrap);
  for(const sx of[-1,1]){const f=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,.06,18),rust);f.rotation.z=Math.PI/2;f.position.x=sx*.53;d.add(f)}
  /* wraps of rope, so it reads as rope and you can see it turn */for(let i=0;i<7;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(.475,.025,5,18),new THREE.MeshStandardMaterial({color:0x2a221a,roughness:1}));r.rotation.y=Math.PI/2;r.position.x=-.42+i*.14;d.add(r)}
  const mark=new THREE.Mesh(new THREE.BoxGeometry(.9,.04,.08),new THREE.MeshStandardMaterial({color:0xc8a040,roughness:.8}));mark.position.set(0,.5,0);d.add(mark);parts.drum=d}
 /* the engine and its exhaust, the brake lever */
 BX(1.2,.8,.7,new THREE.MeshStandardMaterial({color:0x5a6a4a,metalness:.4,roughness:.6}),0,.7,9.15);
 CY(.06,.9,ironD,.4,1.55,9.3);CY(.08,.08,ironD,.4,2.04,9.3);
 BX(.08,.08,.08,ironD,1.0,.4,WZ-.3);beam([1.0,.4,WZ-.3],[1.05,1.5,WZ-.55],.06,iron);
 {const k=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),new THREE.MeshStandardMaterial({color:0xb02020,roughness:.6}));k.position.set(1.05,1.53,WZ-.56);g.add(k)}

 /* ======================= THE ROPE ======================= */
 /* back run: from the sheave over to the top of the drum (outer tangent of the two circles, in the y-z plane) */
 {const c1=[SZ,SY],r1=SR+.02,c2=[WZ,WY],r2=.5;const dz=c2[0]-c1[0],dy=c2[1]-c1[1],L=Math.hypot(dz,dy),ux=dz/L,uy=dy/L,px=-uy,py=ux;/* perpendicular, pointing up/back */
  const ct=(r1-r2)/L,st=Math.sqrt(1-ct*ct),nz=ux*ct+px*st,ny=uy*ct+py*st;
  beam([0,c1[1]+r1*ny,c1[0]+r1*nz],[0,c2[1]+r2*ny,c2[0]+r2*nz],.05,ropeM)}
 /* front run: hangs straight down from the front of the sheave (z = 0) to the cage shackle */
 {const geo=new THREE.CylinderGeometry(.025,.025,1,6);geo.translate(0,-.5,0);const r=new THREE.Mesh(geo,ropeM);r.position.set(0,SY,0);g.add(r);parts.rope=r}

 /* ======================= THE CAGE ======================= */
 const cage=new THREE.Group();g.add(cage);parts.cage=cage;
 BX(2.6,.12,2.6,ironD,0,.06,0,cage);/* floor */
 for(let i=0;i<6;i++)BX(2.5,.01,.06,iron,0,.125,-1.0+i*.4,cage);/* tread strips on the floor, raised 5 mm */
 BX(2.6,.1,2.6,iron,0,2.5,0,cage);/* roof */
 for(const sx of[-1,1])for(const sz of[-1,1])BX(.08,2.33,.08,iron,sx*1.26,1.285,sz*1.26,cage);
 /* bars: back (+z) and both sides */
 for(let i=1;i<7;i++){const t=-1.26+i*.36;BX(.04,2.33,.04,iron,t,1.285,1.26,cage);BX(.04,2.33,.04,iron,1.26,1.285,t,cage);BX(.04,2.33,.04,iron,-1.26,1.285,t,cage)}
 for(const y of[.5,1.15]){BX(2.44,.06,.06,iron,0,y,1.26,cage);for(const sx of[-1,1])BX(.06,.06,2.44,iron,sx*1.26,y,0,cage)}
 /* guide shoes on both sides, touching the rails */
 for(const sx of[-1,1])for(const y of[.3,2.25])BX(.24,.3,.3,ironD,sx*1.42,y,0,cage);
 /* on the roof: a cross bar, the shackle the rope hangs from, and a lamp under the roof */
 BX(2.4,.15,.18,ironD,0,2.625,0,cage);
 {const sh=new THREE.Mesh(new THREE.TorusGeometry(.1,.025,6,12),iron);sh.position.set(0,2.8,0);cage.add(sh);BX(.06,.12,.06,iron,0,2.72,0,cage)}
 {const l=new THREE.Mesh(new THREE.SphereGeometry(.1,10,8),lampM);l.position.set(0,2.33,0);cage.add(l);BX(.04,.1,.04,iron,0,2.42,0,cage)}
 const ROPE_Y=2.9;/* where the rope joins the shackle, above the cage floor */
 /* the gate: a hinged grille on the front, opening outward */
 {const gt=new THREE.Group();gt.position.set(-1.22,.12,-1.3);cage.add(gt);
  for(const y of[.06,1.15,2.2])BX(2.44,.06,.05,iron,1.22,y,0,gt);
  for(let i=0;i<8;i++)BX(.035,2.2,.035,iron,.06+i*.33,1.13,0,gt);
  BX(.06,.06,.12,rust,2.36,1.15,-.05,gt);/* latch */parts.gate=gt}

 /* ======================= ONE CALL MOVES EVERYTHING ======================= */
 const LIM=(v,a,b)=>Math.max(a,Math.min(b,v));
 g.userData.parts=parts;
 g.userData.setLift=function(y,gate,hatch){y=LIM(y,-30,0);cage.position.y=y;
  parts.rope.scale.y=SY-(y+ROPE_Y);
  parts.sheave.rotation.x=(y+30)/SR;/* the rope moving up turns the wheel */
  parts.drum.rotation.x=(y+30)/.5;/* and winds it onto the drum */
  parts.gate.rotation.y=LIM(gate==null?0:gate,0,1)*1.55;
  const h=LIM(hatch==null?0:hatch,0,1)*1.75;parts.hatchL.rotation.z=h;parts.hatchR.rotation.z=-h};
 g.userData.setLift(-30,1,0);
 return g}
function mkBoosterRamp(){
 const g=new THREE.Group();
 const steel=new THREE.MeshStandardMaterial({color:0x6a6e74,metalness:.6,roughness:.45});
 const steelD=new THREE.MeshStandardMaterial({color:0x3a3d42,metalness:.55,roughness:.55});
 const red=new THREE.MeshStandardMaterial({color:0xc02a1e,metalness:.3,roughness:.5});
 const yel=new THREE.MeshStandardMaterial({color:0xe0b020,metalness:.2,roughness:.6});
 const lampM=new THREE.MeshStandardMaterial({color:0x60e0ff,emissive:0x30c8ff,emissiveIntensity:1});
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 /* deck height along the ramp (the top of the deck plates) */
 const P=[[5,0],[-1,1.6],[-5,5.0]];
 const deckY=z=>{if(z>=P[1][0])return P[0][1]+(P[1][1]-P[0][1])*(P[0][0]-z)/(P[0][0]-P[1][0]);return P[1][1]+(P[2][1]-P[1][1])*(P[1][0]-z)/(P[1][0]-P[2][0])};
 /* chevrons pointing -z: a 256 px tile = 2 m × 2 m */
 const chev=(w,l,glow)=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=glow?'#0a1a22':'#4a4e54';x.fillRect(0,0,256,256);
  if(!glow){x.fillStyle='rgba(255,255,255,.06)';for(let i=0;i<256;i+=16)for(let j=(i/16%2)*8;j<256;j+=16)x.fillRect(j,i,6,2)}/* tread plate */
  x.strokeStyle=glow?'#60e8ff':'#e0b020';x.lineWidth=22;x.lineCap='square';for(const y0 of[60,188]){x.beginPath();x.moveTo(40,y0+40);x.lineTo(128,y0-30);x.lineTo(216,y0+40);x.stroke()}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(w/2,l/2);
  return new THREE.MeshStandardMaterial(glow?{map:t,emissiveMap:t,emissive:0xffffff,emissiveIntensity:.9,roughness:.6}:{map:t,metalness:.5,roughness:.5})};
 const parts={lights:[]};
 /* ---------- the deck: two plates, each with its top face on the profile line ---------- */
 const T=.15;
 for(let i=0;i<2;i++){const[z0,y0]=P[i],[z1,y1]=P[i+1],L=Math.hypot(z1-z0,y1-y0),a=Math.atan2(y1-y0,z0-z1);/* angle up towards -z */
  const nz=Math.sin(a),ny=Math.cos(a);/* deck normal (points up and towards +z) */
  const mats=[steelD,steelD,chev(6.2,L,false),steelD,steelD,steelD];
  const d=new THREE.Mesh(new THREE.BoxGeometry(6.2,T,L),mats);d.position.set(0,(y0+y1)/2-ny*T/2,(z0+z1)/2-nz*T/2);d.rotation.x=a;g.add(d);
  /* side rails on the deck edges: red, 0.5 m tall */
  for(const sx of[-1,1]){const r=new THREE.Mesh(new THREE.BoxGeometry(.12,.5,L),red);r.position.set(sx*3.06,(y0+y1)/2+ny*.25,(z0+z1)/2+nz*.25);r.rotation.x=a;g.add(r)}}
 /* the kink between the two plates: a round pipe hides the seam */
 {const k=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,6.2,12),steel);k.rotation.z=Math.PI/2;k.position.set(0,P[1][1]-.1,P[1][0]);g.add(k)}
 /* the lip: a yellow steel edge at the top */
 BX(6.2,.18,.22,yel,0,P[2][1]-.09,P[2][0]-.11);
 /* ---------- the frame underneath ---------- */
 const post=(x,z)=>{const top=deckY(z)-T/Math.cos(z>=P[1][0]?Math.atan2(1.6,6):Math.atan2(3.4,4))-.02;if(top<.15)return;BX(.18,top,.18,steelD,x,top/2,z);BX(.4,.04,.4,steelD,x,.02,z)};
 for(const z of[2,-1,-3,-4.9])for(const x of[-2.8,-1,1,2.8])post(x,z);
 /* cross braces under the kicker, and the open front closed with a mesh grille so nothing drives under it */
 for(const z of[-3,-4.9]){const h=deckY(z)-.6;BX(5.8,.12,.12,steelD,0,h,z);BX(5.8,.12,.12,steelD,0,h/2,z)}
 for(const sx of[-1,1]){/* side bracing of the kicker */const zz=[-1,-3,-4.9];for(let i=0;i<2;i++){const a=new THREE.Vector3(sx*2.9,.2,zz[i]),b=new THREE.Vector3(sx*2.9,deckY(zz[i+1])-.5,zz[i+1]),d=b.clone().sub(a);const m=new THREE.Mesh(new THREE.BoxGeometry(.1,d.length(),.1),steelD);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(m)}}
 {const c=document.createElement('canvas');c.width=512;c.height=416;const x=c.getContext('2d');x.clearRect(0,0,512,416);x.strokeStyle='#2a2d32';x.lineWidth=6;for(let i=-416;i<512;i+=34){x.beginPath();x.moveTo(i,0);x.lineTo(i+416,416);x.stroke();x.beginPath();x.moveTo(i+416,0);x.lineTo(i,416);x.stroke()}
  const t=new THREE.CanvasTexture(c);const gm=new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.5,side:THREE.DoubleSide,metalness:.5,roughness:.6});
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(6.0,4.85),gm);gr.position.set(0,4.85/2,-5.26);g.add(gr)}
 /* ---------- lamps along the sides of the deck ---------- */
 for(const sx of[-1,1])for(const z of[4,1.5,-1.5,-3.8]){const y=deckY(z)+.55;const l=new THREE.Mesh(new THREE.SphereGeometry(.09,10,8),lampM);l.position.set(sx*3.06,y+(z<-1?.12:0),z);g.add(l);parts.lights.push(l)}
 /* ---------- the booster strip in front ---------- */
 {const m=chev(5,12,true);const s=new THREE.Mesh(new THREE.BoxGeometry(5,.04,12),[steelD,steelD,m,steelD,steelD,steelD]);s.position.set(0,.02,11);g.add(s);parts.strip=s;
  for(const sx of[-1,1])BX(.25,.06,12,yel,sx*2.625,.03,11)}
 /* ---------- the sign ---------- */
 {BX(.2,3.2,.2,steelD,4.2,1.6,9);const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');x.fillStyle='#c02a1e';x.fillRect(0,0,512,256);x.strokeStyle='#fff';x.lineWidth=10;x.strokeRect(10,10,492,236);x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';
  x.font='bold 74px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';x.fillText('QUARRY SKIP',256,84,470);x.font='600 40px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';x.fillText('BOOSTER · OVER THE MESA',256,160,470);x.fillText('FULL SEND ▶',256,208,470);
  const sm=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.7});BX(2.0,1.0,.06,[steelD,steelD,steelD,steelD,sm,steelD],4.2,2.9,9.13)}
 g.userData.parts=parts;
 return g}
function mkLandingRamp(){
 const g=new THREE.Group();
 const steelD=new THREE.MeshStandardMaterial({color:0x3a3d42,metalness:.55,roughness:.55});
 const yel=new THREE.MeshStandardMaterial({color:0xe0b020,metalness:.2,roughness:.6});
 const red=new THREE.MeshStandardMaterial({color:0xc02a1e,metalness:.3,roughness:.5});
 const BX=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o};
 const W=10.4,P=[[6.5,4.4],[1.5,1.0],[-6.5,0]],T=.15;
 const plate=(w,l)=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#4a4e54';x.fillRect(0,0,256,256);x.fillStyle='rgba(255,255,255,.06)';for(let i=0;i<256;i+=16)for(let j=(i/16%2)*8;j<256;j+=16)x.fillRect(j,i,6,2);
  /* a yellow target band every 2 m */x.fillStyle='#e0b020';x.fillRect(0,120,256,16);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(w/2,l/2);return new THREE.MeshStandardMaterial({map:t,metalness:.5,roughness:.5})};
 const deckY=z=>z>=P[1][0]?P[1][1]+(P[0][1]-P[1][1])*(z-P[1][0])/(P[0][0]-P[1][0]):P[2][1]+(P[1][1]-P[2][1])*(z-P[2][0])/(P[1][0]-P[2][0]);
 for(let i=0;i<2;i++){const[z0,y0]=P[i],[z1,y1]=P[i+1],L=Math.hypot(z1-z0,y1-y0),a=Math.atan2(y1-y0,z0-z1);/* negative: going down towards -z */
  const nz=Math.sin(a),ny=Math.cos(a);
  const d=new THREE.Mesh(new THREE.BoxGeometry(W,T,L),[steelD,steelD,plate(W,L),steelD,steelD,steelD]);d.position.set(0,(y0+y1)/2-ny*T/2,(z0+z1)/2-nz*T/2);d.rotation.x=a;g.add(d);
  if(i==0)for(const sx of[-1,1]){const r=new THREE.Mesh(new THREE.BoxGeometry(.12,.35,L),red);r.position.set(sx*5.06,(y0+y1)/2+ny*.175,(z0+z1)/2+nz*.175);r.rotation.x=a;g.add(r)}}
 {const k=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,W,12),steelD);k.rotation.z=Math.PI/2;k.position.set(0,P[1][1]-.1,P[1][0]);g.add(k)}
 /* the top edge and the back wall (solid steel panel with yellow and black stripes) */
 BX(W,.18,.22,yel,0,P[0][1]-.09,P[0][0]+.11);
 {const c=document.createElement('canvas');c.width=512;c.height=216;const x=c.getContext('2d');x.fillStyle='#1a1a1a';x.fillRect(0,0,512,216);x.fillStyle='#e0b020';for(let i=-216;i<512;i+=48){x.beginPath();x.moveTo(i,216);x.lineTo(i+24,216);x.lineTo(i+24+216,0);x.lineTo(i+216,0);x.fill()}
  const m=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.7});/* 512 × 216 = 10.4 m × 4.4 m */
  BX(W,P[0][1]-.18,.2,[steelD,steelD,steelD,steelD,m,steelD],0,(P[0][1]-.18)/2,P[0][0]+.12)}
 /* legs under the steep part, and the sides closed with grilles */
 for(const z of[5,3])for(const x of[-4.8,-1.6,1.6,4.8]){const h=deckY(z)-T/Math.cos(Math.atan2(3.4,5))-.02;BX(.18,h,.18,steelD,x,h/2,z);BX(.4,.04,.4,steelD,x,.02,z)}
 {const c=document.createElement('canvas');c.width=512;c.height=512;const x=c.getContext('2d');x.strokeStyle='#2a2d32';x.lineWidth=6;for(let i=-512;i<512;i+=34){x.beginPath();x.moveTo(i,0);x.lineTo(i+512,512);x.stroke();x.beginPath();x.moveTo(i+512,0);x.lineTo(i,512);x.stroke()}
  const t=new THREE.CanvasTexture(c);const gm=new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.5,side:THREE.DoubleSide,metalness:.5,roughness:.6});
  /* a triangle-ish side panel under the steep part: a shape following the deck */
  const sh=new THREE.Shape();sh.moveTo(P[1][0],0);sh.lineTo(P[0][0],0);sh.lineTo(P[0][0],P[0][1]-.2);sh.lineTo(P[1][0],P[1][1]-.2);sh.lineTo(P[1][0],0);
  const geo=new THREE.ShapeGeometry(sh);/* map UVs to metres / 4 so the grille is not stretched */const uv=geo.attributes.uv,pos=geo.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)/4,pos.getY(i)/4);t.wrapS=t.wrapT=THREE.RepeatWrapping;
  for(const sx of[-1,1]){const m=new THREE.Mesh(geo,gm);m.rotation.y=-Math.PI/2;m.position.x=sx*5.1;g.add(m)}}
 return g}

/* ---------- obstacles with a height: a car above `top` drives over them (the space under a ramp, a ramp's back wall) ---------- */
/* (the check is in vehOK, patched in build.py) */

/* ---------- the gorge lift ---------- */
const GLIFT={y:-30,gate:1,hatch:0,ph:'bottom',t:0,ride:0,m:null};
function gorgeLiftBuild(X,lx,lz){const{q,g}=X;const m=mkGorgeLift();m.position.set(lx,0,lz);m.rotation.y=Math.PI;m.userData.mv=1;m.userData.noChunk=1;g.add(m);GLIFT.m=m;GLIFT.ph='bottom';GLIFT.y=-30;GLIFT.gate=1;GLIFT.hatch=0;GLIFT.ride=0;m.userData.setLift(-30,1,0);
 /* local (before the half turn) to world */const W=(x,z)=>[lx-x,lz-z],box=(x0,x1,z0,z1)=>{const a=W(x0,z0),b=W(x1,z1);return[Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1])]};
 for(const sx of[-1,1])for(const sz of[-1,1]){const r=box(sx*2.05-.15,sx*2.05+.15,sz*2.05-.15,sz*2.05+.15);X.ob(r[0],r[1],r[2],r[3])}
 for(const sx of[-1,1]){const r=box(sx*1.6-.15,sx*1.6+.15,6.25,6.55);X.ob(r[0],r[1],r[2],r[3])}{const r=box(-1.2,1.2,7.4,9.6);X.ob(r[0],r[1],r[2],r[3])}
 q.deepB=q.deepB||[];for(const[a,b]of[[-1.8,-1.8],[1.8,-1.8],[-1.8,1.8],[1.8,1.8],[-1.8,0],[1.8,0]]){const r=box(a-.125,a+.125,b-.125,b+.125);q.deepB.push({x0:r[0],x1:r[1],z0:r[2],z1:r[3]})}
 /* the hatches are floor */q.plates.push({x0:lx-1.7,x1:lx+1.7,z0:lz-1.7,z1:lz+1.7,y:.12});
 q.gcage={m:m.userData.parts.cage,x:lx,z:lz};
 X.prop(lx,lz,1.3,()=>{if(GLIFT.ride)return'';return GLIFT.ph=='bottom'?'[E] Ride the lift up to the surface':'⏳ The cage is on its way down...'},()=>liftGo(q,1)).deep=1}
liftGo=function(q,dir){if(dir<0||q.lift||!GLIFT.m||GLIFT.ph!='bottom')return;GLIFT.ph='shut';GLIFT.t=0;GLIFT.ride=1;q.lift={dir:1,t:0};q.deep=1;q.deepY=-30;for(const k in keys)keys[k]=0;snd(140,.4);hint('⬆️ The gate clangs shut. The old cage rattles and starts to climb...')};
const glEase=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
liftTick=function(q,dt){const L=GLIFT;if(!L.m)return;L.t+=dt;const lx=q.gcage.x,lz=q.gcage.z;
 if(L.ph=='shut'){L.gate=Math.max(0,1-L.t/.6);if(L.t>=.6){L.ph='up';L.t=0}}
 else if(L.ph=='up'){const u=Math.min(1,L.t/7);L.y=-30+30*glEase(u);if(L.y>-4)L.hatch=Math.min(1,L.hatch+dt);if(Math.random()<dt*3)snd(110+Math.random()*50,.05);if(u>=1){L.y=0;L.hatch=1;L.ph='open';L.t=0;snd(200,.3)}}
 else if(L.ph=='open'){L.gate=Math.min(1,L.t/.6);if(L.t>=.6){L.ph='wait';L.t=0;if(L.ride){L.ride=0;q.lift=null;q.deep=0;q.deepY=0;P.x=lx;P.z=lz+2.6+q.OZ;P.dy=0;hint('⛏️ Daylight. You step out of the OLD GORGE MINE headframe, south of the gorge. (The lift only goes up.)')}}}
 else if(L.ph=='wait'){if(L.t>=3){L.ph='close';L.t=0}}
 else if(L.ph=='close'){L.gate=Math.max(0,1-L.t/.6);if(L.t>=.6){L.ph='down';L.t=0}}
 else if(L.ph=='down'){const u=Math.min(1,L.t/7);L.y=-30*glEase(u);if(L.y<-3)L.hatch=Math.max(0,L.hatch-dt);if(u>=1){L.y=-30;L.hatch=0;L.ph='reopen';L.t=0}}
 else if(L.ph=='reopen'){L.gate=Math.min(1,L.t/.6);if(L.t>=.6){L.ph='bottom';L.t=0}}
 const moving=L.ph=='up'||L.ph=='down';const cg=L.m.userData.parts.cage;try{L.m.userData.setLift(L.y,L.gate,L.hatch);cg.rotation.z=moving?Math.sin(L.t*9)*.004:0}catch(e){}
 /* you ride on the cage floor */if(L.ride&&q.lift){P.x=lx;P.z=lz+q.OZ;P.dy=L.y+.12+(moving?Math.sin(L.t*14)*.02:0);q.deepY=L.y}};

/* ---------- the Quarry Skip booster jump ---------- */
const QSKIP={bx:-330,bz:-1464,lx:-330,lz:-1625.1,m:null};
let LANDSOFT=null;
function quarrySkipBuild(X){const{q,g,rect,loc}=X;const B=QSKIP;
 const b=mkBoosterRamp();b.position.set(B.bx,0,B.bz);g.add(b);b.userData.noChunk=1;B.m=b;
 const l=mkLandingRamp();l.position.set(B.lx,0,B.lz);g.add(l);
 /* the decks, for the wheels: (local z, height) run-in (+5,0)→(-1,1.6), kicker (-1,1.6)→(-5,5.0) */
 q.ramps.push({x0:B.bx-2.9,x1:B.bx+2.9,z0:B.bz+5,len:6,H:1.6,y0:0,dir:-1,nolink:1});
 q.ramps.push({x0:B.bx-2.9,x1:B.bx+2.9,z0:B.bz-1,len:4,H:3.4,y0:1.6,dir:-1,stunt:'QUARRY SKIP',sj:1,boost:1,nolink:1});
 /* landing: (local z, height) (-6.5,0)→(+1.5,1.0)→(+6.5,4.4), written as ramps rising towards +z (the ground code takes the higher of ramp and ground) */
 q.ramps.push({x0:B.lx-5,x1:B.lx+5,z0:B.lz-6.5,len:8,H:1.0,y0:0,dir:1,land:1,nolink:1});
 q.ramps.push({x0:B.lx-5,x1:B.lx+5,z0:B.lz+1.5,len:5,H:3.4,y0:1.0,dir:1,land:1,nolink:1});
 const ob=(x0,x1,z0,z1,top)=>{const o={x0,x1,z0,z1};if(top!=null)o.top=top;q.obs.push(o);return o};
 for(const sx of[-1,1])ob(B.bx+Math.min(sx*3,sx*3.12),B.bx+Math.max(sx*3,sx*3.12),B.bz-5,B.bz+3.5,5.6);/* (nothing under the kicker: the ground code already stops a car stepping up more than 0.6 m, so you cannot drive under the deck) */ob(B.bx+4.1,B.bx+4.3,B.bz+8.9,B.bz+9.1);
 ob(B.lx-5.2,B.lx+5.2,B.lz+6.4,B.lz+6.7,4.4);for(const sx of[-1,1])ob(B.lx+Math.min(sx*5,sx*5.12),B.lx+Math.max(sx*5,sx*5.12),B.lz+1.5,B.lz+6.5,4.6);q.obsDirty=1;
 rect(B.bx-3.1,B.bx+3.1,B.bz-5,B.bz+17,'#a07040');rect(B.lx-5.2,B.lx+5.2,B.lz-6.5,B.lz+6.7,'#a07040');loc('Stunt: QUARRY SKIP',B.bx,B.bz,'🛹');
 /* the strip's chevrons run forward, the lamps pulse */let t=0,fl=0;q.anims.push({x:B.bx,z:B.bz,r:150,f:dt=>{t+=dt;const P2=b.userData.parts;try{P2.strip.material[2].map.offset.y-=dt*1.5;const lm=P2.lights[0].material;if(B.flash>0){B.flash-=dt;lm.emissiveIntensity=2}else lm.emissiveIntensity=.6+.6*Math.max(0,Math.sin(t*8))}catch(e){}}})}
{const xs0=xpStunts;xpStunts=function(X){const r=xs0.apply(this,arguments);try{quarrySkipBuild(X)}catch(e){conLog('error','quarry skip: '+e.message)}return r}}
const qsOnLand=(v)=>v.x>QSKIP.lx-5.4&&v.x<QSKIP.lx+5.4&&v.z>QSKIP.lz-7&&v.z<QSKIP.lz+7;
{const vp7=vehPhys;vehPhys=function(q,v,dt,fx,sx,drv,hb){if(!v||!q||v.K.plane)return vp7.apply(this,arguments);const B=QSKIP;
  /* drove over the strip fast enough: the booster is armed for 2 s */if(Math.abs(v.x-B.bx)<2.5+(v.K.w||2)/2&&v.z>B.bz+5&&v.z<B.bz+17&&Math.abs(v.v)>=12)v.qsT=performance.now();
  const wasAir=!!v.air;if(v.qsFly&&v.air){sx=0;v.str=0}
  const soft=v.air&&(v.qsFly||qsOnLand(v));const pL=LANDSOFT;if(soft)LANDSOFT=v;let r;try{r=vp7.call(this,q,v,dt,fx,sx,drv,hb)}finally{LANDSOFT=pL}
  /* off the lip with the booster armed: fire */if(!wasAir&&v.air&&v.jr&&v.jr.boost&&v.qsT&&performance.now()-v.qsT<2000){v.qsT=0;v.qsFly=1;v.h=0;v.v=40;v.vy=33.6;B.flash=.5;try{snd(90,.6);snd(400,.3);setTimeout(()=>snd(700,.25),120);vfx('dust',v.x,.8,v.z+q.OZ,{n:30,w:2.5})}catch(e){}if(q.seat&&q.seat.v===v)try{camShake(.5,.5)}catch(e){}}
  /* down: on the landing ramp it is a soft landing (no damage, a quarter of the speed gone) */if(wasAir&&!v.air){if(v.qsFly||qsOnLand(v)){if(v.qsFly&&q.seat&&q.seat.v===v){try{hint('🛹 STUNT JUMP: QUARRY SKIP! Over the mesa. '+(v.jT||0).toFixed(1)+' s in the air.')}catch(e){}}if(qsOnLand(v))v.v*=.75}v.qsFly=0}
  return r}}
{const vd7=vehDamage;vehDamage=function(q,v,n){if(LANDSOFT&&v===LANDSOFT)return;return vd7.apply(this,arguments)}}
