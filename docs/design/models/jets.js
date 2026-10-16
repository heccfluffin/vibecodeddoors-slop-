/* =====================================================================================================
   The two fighters, remodelled. Replace awJet (dx549):  jetModel(g, ghost)
     ghost = 0   the F-9 SABRE: grey, single fin, side intakes, a big bubble canopy, centre fuel tank
     ghost = 1   the X-22 WRAITH II: black stealth interceptor, faceted, diamond wing, twin canted fins,
                 a flat stealth nozzle, gold-tinted canopy
   Builds into g (the game makes g with rotation.order 'YXZ') and returns g.
   ORIGIN    Centre on the ground (wheels touch y 0, gear down).   FRONT  -z.
   SIZE      F-9: 9.6 m span (over the tip missiles), 13.6 m long, 4.5 m to the fin tip.
             X-22: 10.8 m span, 13.5 m long, 3.8 m tall.
   HOOKS (same as now; awLook / awFire drive them):
     userData.ab, ab2   afterburner glow sprites at z 6.4 and 5.9 (material.opacity and scale are set)
     userData.gear      landing gear Group (keep it at scale 1 now)
     userData.gearSet(f)  NEW: f = 0 gear down … 1 gear up. The nose leg swings back under the cockpit, the main legs fold
                        inward under the wing roots. In awLook, replace the
                        gear.scale.y lines with: v.gearF += ((up?1:0) - v.gearF) * min(1, dt*1.6);  u.gearSet(v.gearF)
     userData.msl       the missiles, in VEHK[k].msl.pods order (each hidden as it is fired)
     userData.beacon    red beacon (visible toggled)
   Missiles sit exactly at VEHK.jet / VEHK.ghost msl.pods (unchanged). Pass the pods in, or it uses those numbers.
   CHANGED NUMBER: VEHK.jet.gun.from → [0.62, 1.42, -5.0] (the gun port is on the left of the nose now; the old point
     was in the air). VEHK.ghost.gun.from stays [0, 1.3, -6.5] (under the nose).
   ===================================================================================================== */
function jetModel(g,ghost,pods){
 const P=pods||(ghost?[[1.4,.85,-.5],[-1.4,.85,-.5],[2.4,.85,0],[-2.4,.85,0]]:[[4.9,1.45,.5],[-4.9,1.45,.5],[3.2,1.0,0],[-3.2,1.0,0],[2.0,1.0,-.2],[-2.0,1.0,-.2]]);
 const Y=1.45;const b=new THREE.Group();g.add(b);
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.5,metalness:.45},o||{}));
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||b).add(o);return o};
 const CYL=(r1,r2,len,m,x,y,z,ax,p,seg)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,seg||16),m);o.position.set(x,y,z);if(ax=='x')o.rotation.z=Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;(p||b).add(o);return o};
 const rod=(a,c,r,m,p,r2)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...c),d=B.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r2==null?r:r2,r,d.length(),8),m);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());(p||b).add(o);return o};
 const shape=pts=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))s.lineTo(q[0],q[1]);s.lineTo(pts[0][0],pts[0][1]);return s};
 /* a plan shape [x, z] as a thin wing, centred on y */
 const plan=(pts,t,m,y,p)=>{const bt=Math.min(.03,t/3);const geo=new THREE.ExtrudeGeometry(shape(pts.map(q=>[q[0],-q[1]])),{depth:t-2*bt,bevelEnabled:true,bevelThickness:bt,bevelSize:bt,bevelSegments:1});const o=new THREE.Mesh(geo,m);o.rotation.x=-Math.PI/2;o.position.y=y-(t-2*bt)/2;(p||b).add(o);return o};
 /* a side profile [z, y] extruded across x (a fin), centred on x = 0 of its parent */
 const prof=(pts,w,m,p)=>{const bt=Math.min(.025,w/3);const geo=new THREE.ExtrudeGeometry(shape(pts),{depth:w-2*bt,bevelEnabled:true,bevelThickness:bt,bevelSize:bt,bevelSegments:1});const o=new THREE.Mesh(geo,m);o.rotation.y=-Math.PI/2;o.position.x=(w-2*bt)/2;(p||b).add(o);return o};
 /* a lofted body through cross-sections {z, w, h, y, p}: p = 2 is an ellipse, higher is squarer, lower is a diamond */
 const loft=(st,n,m)=>{const pos=[],uv=[],idx=[];const L=st[st.length-1].z-st[0].z;
  st.forEach((s,i)=>{for(let j=0;j<=n;j++){const a=j/n*Math.PI*2,c=Math.cos(a),si=Math.sin(a),e=2/(s.p||2);pos.push(s.w/2*Math.sign(c)*Math.pow(Math.abs(c),e),s.y+s.h/2*Math.sign(si)*Math.pow(Math.abs(si),e),s.z);uv.push(j/n*2,(s.z-st[0].z)/L*4)}});
  for(let i=0;i<st.length-1;i++)for(let j=0;j<n;j++){const a=i*(n+1)+j,c=a+n+1;idx.push(a,a+1,c,a+1,c+1,c)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();const o=new THREE.Mesh(geo,m);b.add(o);return o};
 const tex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)};
 const decal=(w,h,draw)=>{const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex(256,Math.max(8,Math.round(256*h/w)),draw),transparent:true,alphaTest:.2,roughness:.6}));b.add(o);return o};
 const text=(s,col)=>(k,w,h)=>{k.clearRect(0,0,w,h);k.fillStyle=col;k.font='bold '+(h*.75|0)+'px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';k.textAlign='center';k.textBaseline='middle';k.fillText(s,w/2,h/2+1,w-6)};
 const star=(fg,bg)=>(k,w,h)=>{k.clearRect(0,0,w,h);k.fillStyle=fg;k.beginPath();k.arc(w/2,h/2,w*.47,0,7);k.fill();k.fillStyle=bg;k.beginPath();k.arc(w/2,h/2,w*.4,0,7);k.fill();k.fillStyle=fg;k.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?w*.15:w*.37;k.lineTo(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r)}k.fill()};
 const glow=(c,op,sz)=>{if(typeof glowSp=='function')return glowSp(c,op,sz);const t=tex(64,64,k=>{const gr=k.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');k.fillStyle=gr;k.fillRect(0,0,64,64)});
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,color:c,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false}));s.scale.setScalar(sz);return s};
 const lite=(c,x,y,z,s)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(.07*(s||1),8,6),new THREE.MeshBasicMaterial({color:c}));o.position.set(x,y,z);b.add(o);const gl=glow(c,.8,.45*(s||1));gl.position.set(x,y,z);b.add(gl);return o};
 /* panel lines for the skin */
 const skin=tex(256,256,(k,w,h)=>{k.fillStyle='#e0e0e0';k.fillRect(0,0,w,h);k.fillStyle='#b4b4b4';k.fillRect(0,0,w,2);k.fillRect(0,0,2,h);k.fillRect(0,128,w,1);k.fillRect(110,0,1,128);k.fillRect(190,128,1,128);
  for(let i=0;i<500;i++){k.fillStyle='rgba(0,0,0,'+(Math.random()*.04)+')';k.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*8,1)}k.fillStyle='#a8a8a8';for(let x=6;x<w;x+=12){k.fillRect(x,4,2,2);k.fillRect(x,124,2,2)}});skin.wrapS=skin.wrapT=THREE.RepeatWrapping;
 const C1=ghost?M(0x1c1e22,{map:skin,roughness:.55,metalness:.4,flatShading:true}):M(0x8a9298,{map:skin,roughness:.45,metalness:.25}),
  C2=ghost?M(0x26282c,{map:skin,roughness:.6,metalness:.4,flatShading:true}):M(0x6a727a,{map:skin,roughness:.5,metalness:.25}),
  DK=M(0x141516,{roughness:.4}),MT=M(0x8a8e94,{metalness:.8,roughness:.3}),TR=ghost?M(0x3a3e44,{roughness:.5}):M(0x4a5056,{roughness:.5}),
  glass=new THREE.MeshStandardMaterial({color:ghost?0xc8a040:0x8ab0c8,transparent:true,opacity:ghost?.5:.32,roughness:.05,metalness:.7,side:THREE.DoubleSide,depthWrite:false}),
  IN=M(0x262828,{roughness:.9,metalness:.1}),mfd=M(0x0a0c0e,{map:tex(128,64,(k,w,h)=>{k.fillStyle='#0a0c0e';k.fillRect(0,0,w,h);for(let i=0;i<2;i++){k.fillStyle='#0a2a14';k.fillRect(6+i*62,8,54,48);k.strokeStyle='#40ff80';k.lineWidth=2;k.beginPath();k.arc(33+i*62,32,16,0,7);k.stroke()}}),emissive:0x40ff80,emissiveIntensity:.35});

 /* ---------------- fuselage ---------------- */
 if(!ghost){loft([{z:-7.65,w:.04,h:.04,y:Y},{z:-7.0,w:.42,h:.42,y:Y-.02},{z:-6.0,w:.78,h:.76,y:Y},{z:-5.0,w:1.0,h:.94,y:Y+.02},{z:-4.0,w:1.08,h:1.0,y:Y},{z:-2.8,w:1.15,h:1.04,y:Y-.02},
   {z:-1.0,w:1.25,h:1.12,y:Y+.02,p:2.6},{z:1.2,w:1.3,h:1.1,y:Y+.02,p:2.6},{z:3.2,w:1.25,h:1.0,y:Y,p:2.4},{z:4.6,w:1.2,h:1.0,y:Y,p:2.1},{z:5.05,w:1.2,h:1.0,y:Y,p:2}],28,C1);
  CYL(.012,.02,.9,MT,0,Y,-8.05,'z');/* pitot */
  /* side intakes: boxes with rounded lips and dark mouths, running back into the body */
  for(const sd of[-1,1]){BX(.55,.82,3.2,C2,sd*.84,Y-.1,-1.0);BX(.47,.7,.04,M(0x050505),sd*.84,Y-.1,-2.615);for(const yy of[.41,-.41])BX(.57,.04,.06,TR,sd*.84,Y-.1+yy,-2.6);for(const xx of[-.275,.275])BX(.04,.86,.06,TR,sd*.84+xx,Y-.1,-2.6)}
 }else{loft([{z:-7.75,w:.04,h:.03,y:Y-.05,p:1.3},{z:-6.6,w:.9,h:.45,y:Y-.05,p:1.3},{z:-5.2,w:1.5,h:.75,y:Y,p:1.3},{z:-3.6,w:2.0,h:.95,y:Y,p:1.3},{z:-1.5,w:2.6,h:1.0,y:Y,p:1.4},
   {z:1.5,w:2.6,h:.95,y:Y,p:1.4},{z:4.0,w:2.0,h:.7,y:Y,p:1.4},{z:5.2,w:1.6,h:.48,y:Y,p:1.6}],16,C1);
  /* caret intakes under the chines */for(const sd of[-1,1]){const it=BX(.5,.42,1.6,C2,sd*1.0,Y-.32,-1.8);BX(.42,.34,.03,M(0x050505),sd*1.0,Y-.32,-2.615);rod([sd*.75,Y-.11,-2.6],[sd*1.25,Y-.53,-2.6],.02,TR)}}
 /* ---------------- cockpit: bubble canopy with its frame, seat, pilot, dash and HUD ---------------- */
 {const cz=ghost?-4.0:-3.6,cy=Y+(ghost?.28:.17),dk=Y+(ghost?.45:.5);/* cy: the canopy's rim, low enough to meet the body's curved sides; dk: the cockpit floor (top of the body) */const cp=new THREE.Mesh(new THREE.SphereGeometry(.6,28,16,0,Math.PI*2,0,Math.PI/2),glass);cp.scale.set(ghost?.92:.86,1.8,2.4);cp.position.set(0,cy,cz);b.add(cp);
  const arch=new THREE.Mesh(new THREE.TorusGeometry(.5,.035,6,20,Math.PI),M(0x2a2c30,{metalness:.6}));arch.scale.set(.95,2.0,1);arch.position.set(0,cy,cz+.55);b.add(arch);/* frame behind the pilot's head */
  /* the ejection seat and the pilot sit together in one group, sunk 12 cm into the cockpit floor and leaning back a little */
  {const st=new THREE.Group();st.position.set(0,dk-.12,cz+.18);st.rotation.x=.12;b.add(st);const SB=(w,h,d,m,x,y,z)=>BX(w,h,d,m,x,y,z,st);
   const SM=M(0x2e3032,{roughness:.8}),CU=M(0x4a4436,{roughness:.95,metalness:0}),SU=M(ghost?0x2a2c30:0x55623e,{roughness:.85,metalness:0}),GV=M(0x1e1e1e,{roughness:.9,metalness:0});
   SB(.5,.1,.52,SM,0,.04,0);SB(.42,.06,.44,CU,0,.11,-.01);/* seat pan and cushion (top at 0.14) */
   SB(.5,.72,.09,SM,0,.44,.27);SB(.42,.56,.04,CU,0,.42,.21);/* back and its cushion */
   for(const sd of[-1,1])SB(.05,.8,.18,SM,sd*.27,.4,.24);/* side frames, behind the pilot's shoulders */
   SB(.38,.14,.14,SM,0,.74,.27);SB(.18,.05,.05,M(0xd8b020),0,.21,-.27);/* headbox, the yellow ejection handle between the knees */
   /* the pilot: hips on the cushion, back against the seat, thighs forward, hands on the stick and throttle */
   SB(.38,.36,.24,SU,0,.32,.08);SB(.44,.1,.24,SU,0,.48,.08);/* torso, shoulders */
   SB(.36,.12,.42,SU,0,.2,-.18);for(const sd of[-1,1]){SB(.12,.34,.12,SU,sd*.1,.06,-.4)}/* thighs, shins down to the floor */
   for(const sd of[-1,1]){SB(.08,.24,.08,SU,sd*.22,.36,-.04);SB(.08,.08,.2,GV,sd*.2,.24,-.15)}/* arms and gloved hands */
   SB(.12,.08,.12,SU,0,.55,.08);/* neck */
   const hm=new THREE.Mesh(new THREE.SphereGeometry(.16,14,10),M(ghost?0x2a2c30:0x5a6a3a,{roughness:.6}));hm.position.set(0,.66,.06);st.add(hm);
   const vz=new THREE.Mesh(new THREE.SphereGeometry(.163,14,10,-Math.PI*.75,Math.PI*.5,Math.PI*.35,Math.PI*.3),M(0x202830,{metalness:.8,roughness:.1}));vz.position.copy(hm.position);st.add(vz);
   SB(.12,.06,.1,M(0x3a3c3e,{roughness:.8}),0,.56,-.06)}/* oxygen mask */
  /* the instrument panel: a sunk base, a face tilted towards the pilot with three lit screens, a glare shield on top and the HUD glass on two posts */
  {const ip=new THREE.Group();ip.position.set(0,dk,cz-.62);b.add(ip);BX(.6,.3,.24,IN,0,0,0,ip);
   const face=new THREE.Group();face.position.set(0,.13,.12);face.rotation.x=-.45;ip.add(face);BX(.6,.3,.04,IN,0,0,0,face);
   for(let i=0;i<3;i++){const sc=new THREE.Mesh(new THREE.PlaneGeometry(.15,.13),mfd);sc.position.set(-.18+i*.18,.0,.022);face.add(sc)}
   BX(.66,.04,.22,M(0x1a1b1c,{roughness:.9}),0,.31,0,ip);/* glare shield */
   for(const sd of[-1,1])BX(.015,.16,.015,MT,sd*.09,.41,-.04,ip);const hud=new THREE.Mesh(new THREE.PlaneGeometry(.18,.13),new THREE.MeshBasicMaterial({color:0x60ff90,transparent:true,opacity:.16,side:THREE.DoubleSide,depthWrite:false}));hud.position.set(0,.45,-.04);hud.rotation.x=-.25;ip.add(hud)}}
 /* ---------------- wings, tails, fins ---------------- */
 if(!ghost){for(const sd of[-1,1]){plan([[sd*.55,-4.3],[sd*1.0,-2.0],[sd*4.75,.2],[sd*4.75,1.45],[sd*.55,2.9]],.12,C1,Y-.1);
   BX(.1,.08,1.9,MT,sd*4.8,Y-.1,.5);/* wingtip launch rail */
   plan([[sd*.55,3.3],[sd*3.0,4.75],[sd*3.0,5.45],[sd*.55,5.45]],.08,C1,Y-.02);
   BX(.06,.5,1.1,C1,sd*.55,Y-.72,4.1).rotation.z=sd*.3}/* ventral fins */
  prof([[2.4,Y+.45],[5.4,Y+.45],[5.95,Y+3.05],[5.0,Y+3.05]],.12,C1);BX(.08,.06,.3,M(0xd8d8d8),0,Y+3.1,5.5);
  for(const[x,z]of[[3.2,0],[2.0,-.2]])for(const sd of[-1,1])BX(.08,.26,.9,MT,sd*x,Y-.29,z);/* pylons for the underwing missiles */
  /* centre fuel tank on its pylon */CYL(.32,.32,3.2,M(0x9aa0a6,{metalness:.4}),0,.66,.2,'z');{const tn=new THREE.Mesh(new THREE.ConeGeometry(.32,.7,16),M(0x9aa0a6,{metalness:.4}));tn.rotation.x=-Math.PI/2;tn.position.set(0,.66,-1.75);b.add(tn);const tt=new THREE.Mesh(new THREE.ConeGeometry(.32,.5,16),M(0x9aa0a6,{metalness:.4}));tt.rotation.x=Math.PI/2;tt.position.set(0,.66,2.05);b.add(tt)}BX(.08,.12,.6,MT,0,.98,.2);
 }else{for(const sd of[-1,1]){plan([[sd*1.0,-2.9],[sd*5.4,2.3],[sd*5.4,3.2],[sd*1.0,3.7]],.14,C1,Y-.12);
   rod([sd*1.0,Y-.12,-2.9],[sd*5.4,Y-.12,2.3],.03,TR);/* leading-edge trim */
   const f=new THREE.Group();f.position.set(sd*.55,Y+.15,3.0);f.rotation.z=sd*-.42;b.add(f);prof([[0,0],[2.2,0],[2.6,2.0],[1.5,2.0]],.1,C1,f);/* twin canted fins */
   const tn=decal(1.0,.2,text('DARK ARMY','#4a4e54'));f.add(tn);tn.position.set(sd*.058,.8,1.35);tn.rotation.y=sd*Math.PI/2;
   for(const[x,z]of[[1.4,-.5],[2.4,0]])BX(.08,.42,.8,MT,sd*x,Y-.4,z)}}/* pylons */
 /* ---------------- engine: a round nozzle with petals (F-9) or a flat stealth nozzle (X-22); the afterburner glows ---------------- */
 if(!ghost){CYL(.55,.6,.9,MT,0,Y,5.5,'z',b,22);const core=new THREE.Mesh(new THREE.CircleGeometry(.48,20),DK);core.position.set(0,Y,5.94);b.add(core);for(let i=0;i<14;i++){const a=i/14*6.283,p=BX(.22,.03,.5,M(0x4a4c50,{metalness:.8}),Math.cos(a)*.6,Y+Math.sin(a)*.6,6.15);p.rotation.z=a+Math.PI/2}
 }else{BX(1.5,.42,.5,C2,0,Y,5.45);BX(1.36,.3,.02,DK,0,Y,5.71);for(const yy of[.19,-.19])plan([[-.75,5.68],[.75,5.68],[.75,5.85],[.5,6.05],[.25,5.85],[0,6.05],[-.25,5.85],[-.5,6.05],[-.75,5.85]],.04,C2,Y+yy);for(const sd of[-1,1])BX(.04,.42,.36,C2,sd*.73,Y,5.86)}/* sawtooth lips top and bottom, and the side walls */
 const ab=glow(0xff8a30,0,3.2);ab.position.set(0,Y,6.4);b.add(ab);const ab2=glow(0x60a0ff,0,1.6);ab2.position.set(0,Y,5.9);b.add(ab2);
 /* ---------------- weapons: missiles at the pods ---------------- */
 const MS=[];for(const p of P){const s=ghost?.85:1,m=new THREE.Group();m.position.set(p[0],p[1],p[2]);b.add(m);const W=M(0xe8e8e0,{metalness:.3});CYL(.09*s,.09*s,2.2*s,W,0,0,0,'z',m,12);
  const n=new THREE.Mesh(new THREE.ConeGeometry(.09*s,.36*s,12),M(0x3a3e44));n.rotation.x=-Math.PI/2;n.position.z=-1.28*s;m.add(n);CYL(.092*s,.092*s,.1*s,M(0xd8b020),0,0,-.8*s,'z',m,12);
  for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;const f=BX(.015,.3*s,.28*s,W,Math.cos(a)*.15*s,Math.sin(a)*.15*s,.9*s,m);f.rotation.z=a+Math.PI/2;const c=BX(.015,.2*s,.16*s,W,Math.cos(a)*.13*s,Math.sin(a)*.13*s,-.75*s,m);c.rotation.z=a+Math.PI/2}MS.push(m)}
 if(!ghost){BX(.1,.07,.3,DK,.62,Y-.03,-5.0);rod([.57,Y-.03,-5.15],[.6,Y-.03,-4.85],.04,M(0x050505))}/* gun port on the left of the nose */
 /* ---------------- landing gear (folds up into the belly: origin at y 1.0) ---------------- */
 const gear=new THREE.Group();gear.position.y=1.0;b.add(gear);
 /* each leg hangs from a hinge at the top of its bay; gearSet() swings it up: the nose leg folds back, the mains fold inward */
 const leg=(x,z,r,top)=>{top=top||0;const pv=new THREE.Group();pv.position.set(x,top,z);gear.add(pv);const yc=-1+r-top,yh=yc+r+.06;/* wheel centre and fork crown, below the hinge */
  rod([0,.18,0],[0,yh,0],.06,MT,pv);rod([0,.18,.4],[0,yh+.15,0],.035,MT,pv);/* both start 18 cm up inside the body, so there's no gap where the body curves */BX(.38,.06,.12,MT,0,yh,0,pv);for(const sd of[-1,1])rod([sd*.16,yh,0],[sd*.16,yc,0],.03,MT,pv);
  CYL(.035,.035,.36,MT,0,yc,0,'x',pv,8);CYL(r,r,.22,DK,0,yc,0,'x',pv,16);CYL(r*.48,r*.48,.24,MT,0,yc,0,'x',pv,10);return pv};
 const wb=ghost?.26:.29;/* wing underside, above the gear origin */
 const gN=leg(0,ghost?-4.9:-4.6,.24),gR=leg(1.3,1.2,.3,wb),gL=leg(-1.3,1.2,.3,wb);
 g.userData.gearSet=f=>{f=Math.max(0,Math.min(1,f));const e=f*f*(3-2*f);/* ease in and out */gN.rotation.x=-e*Math.PI*.5;/* nose leg folds back, under the cockpit */gR.rotation.z=-e*Math.PI*.5;gL.rotation.z=e*Math.PI*.5;
  gear.visible=f<.985;g.userData.gearF=f};
 /* ---------------- lights and markings ---------------- */
 const tipX=ghost?5.4:4.75;lite(0x20ff40,tipX,Y-.1,ghost?2.8:1.4);lite(0xff2020,-tipX,Y-.1,ghost?2.8:1.4);const beacon=lite(0xff2020,0,Y+(ghost?.5:.58),1.8,1.2);
 const wingTop=Y-(ghost?.12:.1)+(ghost?.07:.06)+.008;
 for(const sd of[-1,1]){const st=decal(.9,.9,star(ghost?'#4a4e54':'#e8e4d0',ghost?'#1c1e22':'#3a4a2a'));st.rotation.x=-Math.PI/2;st.position.set(sd*(ghost?3.4:3.0),wingTop,ghost?1.6:1.15);
  const lb=decal(1.6,.3,text(ghost?'X-22':'F-9 SABRE',ghost?'#5a5e64':'#e8e4d0'));lb.rotation.y=sd*Math.PI/2;
  if(ghost){lb.position.set(sd*1.258,Y-.32,-1.6)}else lb.position.set(sd*1.123,Y-.1,-1.0);
  if(!ghost){const tn=decal(1.3,.26,text('BLACKOUT 09','#e8e4d0'));tn.position.set(sd*.068,Y+1.6,4.6);tn.rotation.y=sd*Math.PI/2}}
 g.userData.ab=ab;g.userData.ab2=ab2;g.userData.gear=gear;g.userData.msl=MS;g.userData.beacon=beacon;return g}
