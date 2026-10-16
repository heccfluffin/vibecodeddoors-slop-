/* =====================================================================================================
   mkGorgeLift(): the OLD GORGE MINE lift. A timber headframe on the desert, a lined shaft 30 m down, and the
   iron cage that rides it, hung on a real rope that runs over the sheave wheel to a winch drum.
   Replaces the old lift in xpGorgeCave (bak519.html, "the cage lift: a shaft up to the surface ...").

   SIZE      Headframe 4.4 m wide (x), 9.95 m tall (top of the sheave). Whole footprint on the surface:
             x -2.2 … +2.2, z -2.3 … +9.6 (the winch sits behind, on +z). The shaft goes down to y = -30.
   ORIGIN    Centre of the shaft, at desert ground level (y = 0). The cave floor is y = -30 (GCV chamber floor).
   FRONT     -z = the cage gate, the side you step out of. In the game the old exit is world +z (towards the
             gorge), so place it with rotation.y = Math.PI. The winch then sits on the side away from the gorge.

   SHAFT     Inner opening 3.4 × 3.4 m (cage is 2.6 × 2.6). Lined with timber cribbing from y = 0 to y = -24
             (the cave ceiling), then an open timber frame from -24 to -30 inside the chamber.
             The CAVE CEILING needs a 3.8 × 3.8 m hole cut where the shaft comes through (x ±1.9, z ±1.9 around
             the origin). A timber collar under the ceiling (y -24.3 … -24.0) hides the cut edge.
             Nothing else may be drawn inside the 3.4 × 3.4 opening between y = -24 and y = 0.12
             (no ground plate: remove the old 3.4 m "A(BX(3.4,.08,3.4) ..." plate at the headframe).
   SURFACE   A timber collar round the opening, top at y = +0.12, and two hatch leaves that close the opening
             (walkable, top at +0.12). They swing up when the cage comes up and close after it goes down.

   PARTS     g.userData.parts:
             cage    Group. Origin = centre of the cage floor, underside. position.y = -30 (bottom) … 0 (top).
             gate    Group inside the cage, hinge at the cage front-left post (x -1.22, z -1.3).
                     rotation.y: 0 = shut, 1.55 = open (swings outward).
             rope    Mesh. The rope from the sheave down to the cage. Top fixed at the sheave; scale.y = length.
             sheave  Group. The big wheel on top. Axis = x. Pivot at its axle (0, 9.0, 1.0).
             drum    Group. The winch drum. Axis = x. Pivot at its axle (0, 1.1, 8.5).
             hatchL, hatchR  Groups, hinges at x = -1.54 and +1.54, y = 0.12. rotation.z: hatchL 0 … +1.75,
                     hatchR 0 … -1.75 (up and slightly outward).
   USE       g.userData.setLift(y, gate, hatch) does it all, keeping rope, wheel and drum in step:
               y     = cage height, -30 (bottom) … 0 (top)
               gate  = 0 shut … 1 open
               hatch = 0 shut … 1 open (open it before the cage passes y = -3, shut it once the cage is below -3)
   ANIMATION (suggested; one way only: up)
             Waiting at the bottom: setLift(-30, 1, 0).
             [E] inside: gate shuts (0.6 s), ride up 7 s with smooth ease, hatch opens over 1 s when y > -4,
             stop at 0, gate opens, you step out through the front. Then 3 s later the gate shuts, the empty cage
             goes back down (7 s), the hatch shuts once y < -3, and the gate opens again at the bottom.
             There is NO way to ride it down: no [E] prompt on the surface (just the sign).
             While the cage moves: small random sway (cage.rotation.z = sin(t*9)*0.004) and rope creak sounds.
   COLLISION Surface (q.obs): the 4 headframe legs: boxes 0.3 × 0.3 at (±2.05, ±2.05).
             The 2 back legs' feet: 0.3 × 0.3 at (±1.6, 6.4). The winch: x -1.2 … 1.2, z 7.4 … 9.6.
             The hatches are flat floor; nothing to add.
             Cave (q.deepB): the 4 corner posts 0.25 × 0.25 at (±1.8, ±1.8) and the 2 guide posts 0.25 × 0.25 at
             (±1.8, 0). Inside the cage: you can walk in from the front only (the cage's back and sides are bars).
   All coordinates above are LOCAL (before rotation.y = Math.PI).
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
