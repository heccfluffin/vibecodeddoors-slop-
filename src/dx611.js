/* =====================================================================================================
   r613: MORE NEW MODELS from the design chat (cars.md parts 7-9).
   - The UH-9 transport and AH-4 gunship helicopters (uh9Model, ah4Model), with real cockpits and cabins.
   - The F-9 Sabre and X-22 Wraith II fighters (jetModel); their landing gear folds up on hinges.
   - The runabouts: motorbike, golf cart, quad and dune buggy (mkRunabout).
   The model functions below are the design chat's files, copied as they are.
   ===================================================================================================== */
function heliKit(g){
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6,metalness:.25},o||{}));
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const CYL=(r1,r2,len,m,x,y,z,ax,p,seg)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,seg||16),m);o.position.set(x,y,z);if(ax=='x')o.rotation.z=Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;(p||g).add(o);return o};
 /* a tube from a to b, radius ra at a and rb at b */
 const rod=(a,b,ra,m,p,rb,seg)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(rb==null?ra:rb,ra,d.length(),seg||8),m);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());(p||g).add(o);return o};
 const shape=(pts)=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))s.lineTo(q[0],q[1]);s.lineTo(pts[0][0],pts[0][1]);return s};
 /* a side profile [z, y] extruded across x (total width w, centred on x), optional holes */
 const ext=(pts,w,m,x,p,bev,holes)=>{const bt=bev==null?.04:bev;const s=shape(pts);if(holes)for(const h of holes){const hp=new THREE.Path();hp.moveTo(h[0][0],h[0][1]);for(const q of h.slice(1))hp.lineTo(q[0],q[1]);hp.lineTo(h[0][0],h[0][1]);s.holes.push(hp)}
  const geo=new THREE.ExtrudeGeometry(s,{depth:w-2*bt,bevelEnabled:bt>0,bevelThickness:bt,bevelSize:bt,bevelSegments:2,curveSegments:8});const o=new THREE.Mesh(geo,m);o.rotation.y=-Math.PI/2;o.position.x=(x||0)+(w-2*bt)/2;(p||g).add(o);return o};
 /* a plan shape [x, z] extruded up (thickness t, centred on y) — wings, stabilisers */
 const plan=(pts,t,m,y,p)=>{const bt=Math.min(.02,t/4);const geo=new THREE.ExtrudeGeometry(shape(pts.map(q=>[q[0],-q[1]])),{depth:t-2*bt,bevelEnabled:true,bevelThickness:bt,bevelSize:bt,bevelSegments:1});const o=new THREE.Mesh(geo,m);o.rotation.x=-Math.PI/2;o.position.y=(y||0)-(t-2*bt)/2;(p||g).add(o);return o};
 const pane=(pts,x,m,p)=>{const o=new THREE.Mesh(new THREE.ShapeGeometry(shape(pts)),m);o.rotation.y=-Math.PI/2;o.position.x=x;(p||g).add(o);return o};
 const tex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)};
 const decal=(w,h,draw,p)=>{const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex(256,Math.max(8,Math.round(256*h/w)),draw),transparent:true,alphaTest:.2,roughness:.7}));(p||g).add(o);return o};
 /* a decal wrapped on a tube of radius r whose axis runs along z (for stars on tail booms) */
 const wrapDecal=(r,len,arc,draw0,side,p)=>{const draw=(k,w,h)=>{k.save();k.translate(w/2,h/2);k.rotate(side*Math.PI/2);k.translate(-w/2,-h/2);draw0(k,w,h);k.restore()};const geo=new THREE.CylinderGeometry(r,r,len,12,1,true,side>0?Math.PI/2-arc/2:-Math.PI/2-arc/2,arc);const o=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:tex(256,256,draw),transparent:true,alphaTest:.2,roughness:.7,side:THREE.DoubleSide}));o.rotation.x=Math.PI/2;(p||g).add(o);return o};
 const glow=(c,op,sz)=>{if(typeof glowSp=='function')return glowSp(c,op,sz);const t=tex(64,64,(k)=>{const gr=k.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');k.fillStyle=gr;k.fillRect(0,0,64,64)});
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,color:c,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false}));s.scale.setScalar(sz);return s};
 const lite=(c,x,y,z,p,s)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(.07*(s||1),8,6),new THREE.MeshBasicMaterial({color:c}));o.position.set(x,y,z);(p||g).add(o);const gl=glow(c,.8,.45*(s||1));gl.position.set(x,y,z);(p||g).add(gl);return o};
 const star=(k,w,h)=>{k.clearRect(0,0,w,h);k.fillStyle='#d8d4c0';k.beginPath();k.arc(w/2,h/2,w*.47,0,7);k.fill();k.fillStyle='#1c2416';k.beginPath();k.arc(w/2,h/2,w*.4,0,7);k.fill();k.fillStyle='#d8d4c0';k.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?w*.15:w*.37;k.lineTo(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r)}k.fill()};
 const text=(s,col)=>(k,w,h)=>{k.clearRect(0,0,w,h);k.fillStyle=col||'#d8d4c0';k.font='bold '+(h*.75|0)+'px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';k.textAlign='center';k.textBaseline='middle';k.fillText(s,w/2,h/2+1,w-6)};
 const glass=new THREE.MeshStandardMaterial({color:0x8ab0c8,transparent:true,opacity:.32,roughness:.05,metalness:.5,side:THREE.DoubleSide,depthWrite:false});
 const mfd=new THREE.MeshStandardMaterial({map:tex(256,64,(k,w,h)=>{k.fillStyle='#0a0c0e';k.fillRect(0,0,w,h);for(let i=0;i<3;i++){const x=10+i*82;k.fillStyle='#0a2a14';k.fillRect(x,8,72,48);k.strokeStyle='#40ff80';k.lineWidth=2;k.strokeRect(x+4,12,64,40);k.beginPath();k.moveTo(x+8,40-i*6);k.lineTo(x+64,20+i*8);k.stroke()}}),emissive:0x40ff80,emissiveIntensity:.35,roughness:.4});
 /* a main rotor: hub, swashplate, pitch links, n blades (radius R) with yellow tips */
 const rotorHead=(p,n,R,ph,dark)=>{const rot=new THREE.Group();p.add(rot);const MT=M(0x5a5e64,{metalness:.75,roughness:.35}),BL=M(0x18191b,{roughness:.5,metalness:.2}),YL=M(0xe8c020,{roughness:.5});
  CYL(.34,.34,.22,MT,0,0,0,null,rot,18);CYL(.1,.12,.4,MT,0,.25,0,null,rot,10);
  for(let i=0;i<n;i++){const arm=new THREE.Group();arm.rotation.y=i*Math.PI*2/n+(ph||0);rot.add(arm);BX(.55,.12,.24,MT,.5,0,0,arm);rod([.45,-.1,.1],[.25,-.32,.1],.02,MT,arm);
   const bl=BX(R-.75,.05,.44,BL,.75+(R-.75)/2,-.04,0,arm);bl.rotation.z=-.02;BX(.42,.055,.445,YL,R-.22,-.04-(R-.97)*.02,0,arm)}
  return rot};
 return{M,BX,CYL,rod,ext,plan,pane,tex,decal,wrapDecal,glow,lite,star,text,glass,mfd,rotorHead}}

/* a three-barrel chin gun in a ball. Returns {t, spin, fl}: t.children[1] is the yoke (the game pitches it). */
function heliChinGun(K,par,x,y,z,len,m){const{M,BX,CYL,glow}=K;const t=new THREE.Group();t.position.set(x,y,z);par.add(t);
 const ball=new THREE.Mesh(new THREE.SphereGeometry(.28,18,12),m);t.add(ball);/* child 0 */
 const yoke=new THREE.Group();yoke.position.set(0,-.06,0);t.add(yoke);/* child 1 */
 BX(.5,.14,.32,M(0x2a2c30,{metalness:.6}),0,0,-.12,yoke);for(const sd of[-1,1])BX(.06,.26,.3,M(0x2a2c30,{metalness:.6}),sd*.22,-.06,-.12,yoke);
 const bar=new THREE.Group();bar.position.set(0,-.08,-.28);yoke.add(bar);CYL(.11,.11,.42,M(0x2a2c30,{metalness:.7}),0,0,-.18,'z',bar,12);BX(.24,.2,.3,M(0x3a3c40,{metalness:.6}),0,.06,-.05,bar);
 const spin=new THREE.Group();spin.position.set(0,0,-.42);bar.add(spin);const bm=M(0x141416,{metalness:.8,roughness:.3});for(let i=0;i<3;i++){const a=i/3*6.283;CYL(.034,.034,len,bm,Math.cos(a)*.06,Math.sin(a)*.06,-len/2,'z',spin,8)}
 for(const zz of[-len*.5,-len+.06])CYL(.1,.1,.07,M(0x3a3c40,{metalness:.8}),0,0,zz,'z',spin,12);
 const fl=glow(0xffc060,0,.9);fl.position.set(0,0,-len-.25);spin.add(fl);return{t,spin,fl}}

/* =================================================================== UH-9 transport */
function uh9Model(g,dark){const K=heliKit(g),{M,BX,CYL,rod,ext,plan,pane,tex,decal,wrapDecal,lite,star,text,glass,mfd,rotorHead}=K;
 const b=new THREE.Group();b.position.y=.07;g.add(b);
 const panel=tex(256,256,(k,w,h)=>{k.fillStyle='#d8d8d8';k.fillRect(0,0,w,h);k.fillStyle='#a8a8a8';k.fillRect(0,0,w,2);k.fillRect(0,0,2,h);k.fillRect(0,128,w,1);k.fillRect(150,0,1,128);
  for(let i=0;i<600;i++){k.fillStyle='rgba(0,0,0,'+(Math.random()*.05)+')';k.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*8,1)}k.fillStyle='#909090';for(let x=8;x<w;x+=16){k.fillRect(x,5,2,2);k.fillRect(x,123,2,2)}});panel.wrapS=panel.wrapT=THREE.RepeatWrapping;panel.repeat.set(.6,.6);
 const OL=M(dark?0x3a4038:0x4a5a34,{map:panel,roughness:.62,side:THREE.DoubleSide}),OD=M(dark?0x2c3028:0x3c4a2a,{map:panel,roughness:.7}),DK=M(0x1c1e20,{roughness:.6,metalness:.4}),MT=M(0x5a5e64,{metalness:.75,roughness:.35}),
  IN=M(0x2a2c2a,{roughness:.9,metalness:.1}),SEAT=M(0x3a3a30,{roughness:.95,metalness:0});
 /* ---- fuselage: one side profile, extruded 1.9 m wide, with the cabin doorway cut right through (open both sides) ---- */
 ext([[-3.45,1.05],[-2.8,.75],[2.3,.75],[3.5,1.72],[3.5,2.48],[1.9,2.75],[-1.55,2.75],[-1.55,1.6],[-3.25,1.6],[-3.6,1.45],[-3.62,1.22]],1.9,OL,0,b,.06,
  [[[-1.25,.95],[.85,.95],[.85,2.45],[-1.25,2.45]]]);
 /* ---- cockpit: roof, windscreen, side windows with door frames, the dash, two seats, sticks, overhead panel ---- */
 BX(1.9,.06,.9,OL,0,2.72,-2.0,b);
 {const L=Math.hypot(.8,1.12),ws=new THREE.Mesh(new THREE.PlaneGeometry(1.84,L),glass);ws.position.set(0,2.16,-2.85);ws.rotation.x=Math.atan2(.8,1.12);/* leans back, along its frame */b.add(ws)}/* from (z -3.25, y 1.6) to (-2.45, 2.72) */
 for(const sd of[-1,1]){pane([[-3.25,1.6],[-1.58,1.6],[-1.58,2.69],[-2.45,2.69]],sd*.95,glass,b);rod([sd*.93,1.6,-3.25],[sd*.93,2.72,-2.45],.035,DK,b);rod([sd*.95,1.6,-2.12],[sd*.95,2.7,-2.12],.03,DK,b);rod([sd*.95,2.7,-2.45],[sd*.95,2.7,-1.55],.03,DK,b)}
rod([-.95,2.72,-2.45],[.95,2.72,-2.45],.035,DK,b);
 {const d=BX(1.8,.24,.3,IN,0,1.72,-2.85,b);/* stays under the windscreen */const sc=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.2),mfd);sc.position.set(0,1.76,-2.69);sc.rotation.x=-.4;b.add(sc)}
 for(const sd of[-1,1]){BX(.5,.1,.5,SEAT,sd*.5,1.66,-2.0,b);const bk=BX(.5,.7,.1,SEAT,sd*.5,2.02,-1.7,b);bk.rotation.x=-.12;rod([sd*.5,1.62,-2.45],[sd*.5,1.95,-2.5],.02,DK,b)}
 BX(.6,.06,.45,IN,0,2.66,-2.05,b);
 /* ---- cabin inside: an outward-facing bench back to back, the floor, the door gunner's minigun on its arm ---- */
 BX(.08,.7,1.7,SEAT,0,1.5,-.2,b);for(const sd of[-1,1]){BX(.42,.08,1.6,SEAT,sd*.27,1.32,-.2,b);for(const z of[-.9,.5])BX(.05,.36,.05,MT,sd*.4,1.13,z,b)}
 {const mg=new THREE.Group();mg.position.set(.88,1.55,-1.08);mg.rotation.y=-Math.PI/2;/* pointing out of the right doorway */b.add(mg);rod([0,-.05,0],[-.17,-.05,0],.03,MT,mg);BX(.14,.16,.32,DK,0,.02,-.06,mg);CYL(.04,.04,1.0,M(0x1a1a1c,{metalness:.8}),0,.02,-.7,'z',mg,8);BX(.22,.2,.16,M(0x4a5a30),.16,-.02,.08,mg)}
 /* ---- sliding doors, slid back along the outside, with a window; the door rail ---- */
 for(const sd of[-1,1]){BX(.03,1.4,1.38,OD,sd*.98,1.7,1.62,b);BX(.008,.42,.5,glass,sd*.998,2.0,1.62,b);BX(.04,.04,3.7,MT,sd*.975,2.48,.55,b)}
 /* ---- engine housing on the roof: intakes in front, exhausts angled out at the back, grilles ---- */
 ext([[-1.35,2.75],[2.35,2.75],[2.6,2.85],[2.3,3.25],[-.9,3.32],[-1.35,3.05]],1.4,OD,0,b,.05);
 for(const sd of[-1,1]){CYL(.17,.17,.16,DK,sd*.42,2.92,-1.42,'z',b,14);CYL(.13,.13,.02,M(0x050505),sd*.42,2.92,-1.51,'z',b,12);
  const ex=rod([sd*.55,3.0,2.15],[sd*.85,3.05,2.75],.18,M(0x2a2420,{metalness:.6,roughness:.5}),b,.22,14);
  const gr=decal(1.6,.3,(k,w,h)=>{k.fillStyle='#14160f';k.fillRect(0,0,w,h);k.fillStyle='#3a4430';for(let x=4;x<w;x+=12)k.fillRect(x,4,7,h-8)},b);gr.position.set(sd*.708,2.95,.6);gr.rotation.y=sd*Math.PI/2;
  const lb=decal(1.6,.3,text(dark?'DARK ARMY · 6TH ATTACK':'DARK ARMY · 13TH AIR CAV'),b);lb.position.set(sd*.956,1.22,-2.4);/* on the nose, under the cockpit windows, clear of the wings */lb.rotation.y=sd*Math.PI/2}
 /* ---- rotor mast and the four-blade rotor ---- */
 CYL(.13,.16,.7,MT,0,3.63,.1,null,b,12);CYL(.3,.3,.06,MT,0,3.9,.1,null,b,16);for(let i=0;i<4;i++){const a=i/4*6.283;rod([Math.cos(a)*.26,3.93,.1+Math.sin(a)*.26],[Math.cos(a)*.3,4.05,.1+Math.sin(a)*.3],.018,MT,b)}
 const rp=new THREE.Group();rp.position.set(0,4.12,.1);b.add(rp);const rotor=rotorHead(rp,4,7.3,0);
 /* ---- tail boom, fin, stabilator, the tail rotor on the left, a tail guard ---- */
 rod([0,2.1,3.3],[0,2.35,9.7],.36,OL,b,.17,18);
 ext([[9.2,2.2],[10.15,2.2],[10.95,3.95],[10.45,4.0],[9.65,2.75]],.16,OL,0,b,.02);
 plan([[.15,9.2],[1.35,9.35],[1.4,9.95],[.15,10.05],[-.15,10.05],[-1.4,9.95],[-1.35,9.35],[-.15,9.2]],.07,OL,2.35,b);for(const sd of[-1,1])BX(.05,.32,.62,OL,sd*1.39,2.35,9.65,b);
 const tr=new THREE.Group();tr.position.set(-.2,3.4,10.55);b.add(tr);CYL(.12,.12,.25,MT,0,0,0,'x',tr,10);const tailR=new THREE.Group();tailR.position.x=-.13;tr.add(tailR);
 for(let i=0;i<2;i++){const bl=BX(.04,1.7,.16,M(0x1a1a1c),0,0,0,tailR);bl.rotation.x=i*Math.PI/2;for(const s of[-1,1])BX(.045,.18,.17,M(0xe8c020),0,s*.78,0,bl)}
 rod([0,2.2,9.75],[0,1.78,10.15],.035,MT,b);
 const beacon=lite(0xff2020,0,4.05,10.62,b,1.4);lite(0xffffff,0,2.2,10.98,b);
 /* ---- stub wings above the doors with a rocket pod each; nav lights on the tips ---- */
 for(const sd of[-1,1]){const w=plan([[sd*.9,-.6],[sd*2.3,-.48],[sd*2.3,.08],[sd*.9,.22]].map(q=>sd>0?q:q),.1,OD,2.55,b);
  BX(.1,.3,.36,OD,sd*2.05,2.36,-.2,b);heliPod(K,b,sd*2.05,2.0,-.2,OD);lite(sd>0?0x20ff40:0xff2020,sd*2.34,2.62,-.2,b)}
 /* ---- chin gun, searchlight, skids and their cross tubes, steps, antennas ---- */
 const cg=heliChinGun(K,b,0,.62,-3.0,1.05,OD);
 {const sl=CYL(.15,.12,.18,MT,.5,.72,-2.2,'z',b,12);const lens=new THREE.Mesh(new THREE.CircleGeometry(.12,14),new THREE.MeshBasicMaterial({color:0xfff8e0}));lens.position.set(.5,.72,-2.3);lens.rotation.y=Math.PI;b.add(lens);BX(.06,.06,.1,MT,.5,.79,-2.2,b)}
 for(const sd of[-1,1]){rod([sd*1.12,-.01,-2.3],[sd*1.12,-.01,2.4],.06,MT,b);rod([sd*1.12,-.01,-2.3],[sd*1.12,.32,-2.85],.06,MT,b);
  for(const z of[-1.6,1.1]){rod([sd*1.12,-.01,z],[sd*1.02,.5,z],.055,MT,b);rod([sd*1.02,.5,z],[sd*.7,.76,z],.055,MT,b)}
}
 rod([.3,3.3,1.5],[.38,3.75,1.8],.012,DK,b);rod([0,.75,1.4],[0,.42,1.5],.012,DK,b);
 /* ---- markings: stars wrapped on the boom, the tail number on the fin ---- */
 for(const sd of[-1,1]){const st=wrapDecal(.3,.5,1.4,star,sd,b);st.position.set(0,2.2,5.7);
  const tn=decal(.9,.2,text(dark?'66-0451':'13-0917'),b);tn.position.set(sd*.088,2.85,9.9);tn.rotation.y=sd*Math.PI/2}
 g.userData.rotor=rotor;g.userData.tailR=tailR;g.userData.cg=cg;g.userData.beacon=beacon;return g}

/* a rocket pod: a tube with holes in the nose, a yellow band and a pointed tail */
function heliPod(K,par,x,y,z,m){const{M,CYL}=K;const p=new THREE.Group();p.position.set(x,y,z);par.add(p);CYL(.24,.24,1.35,m,0,0,0,'z',p,16);
 const fr=new THREE.Mesh(new THREE.CircleGeometry(.235,16),M(0x15171a));fr.position.z=-.676;fr.rotation.y=Math.PI;p.add(fr);
 for(let i=0;i<7;i++){const a=i/6*6.283,rr=i?.13:0;const h=new THREE.Mesh(new THREE.CircleGeometry(.035,8),M(0x050505));h.position.set(Math.cos(a)*rr,Math.sin(a)*rr,-.682);h.rotation.y=Math.PI;p.add(h)}
 const tl=new THREE.Mesh(new THREE.ConeGeometry(.24,.35,16),m);tl.rotation.x=Math.PI/2;tl.position.z=.85;p.add(tl);CYL(.246,.246,.06,M(0xd8b020),0,0,-.5,'z',p,16);return p}
/* an anti-tank missile on its rail */
function heliMissile(K,par,x,y,z,s){const{M,CYL,BX}=K;s=s||1;const p=new THREE.Group();p.position.set(x,y,z);par.add(p);const W=M(0x9aa08a,{metalness:.3});CYL(.09*s,.09*s,1.6*s,W,0,0,0,'z',p,12);
 const n=new THREE.Mesh(new THREE.SphereGeometry(.09*s,12,8,0,6.283,0,Math.PI/2),M(0x3a3e44));n.rotation.x=-Math.PI/2;n.position.z=-.8*s;p.add(n);CYL(.092*s,.092*s,.08*s,M(0xd8b020),0,0,-.55*s,'z',p,12);
 for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;const f=BX(.015,.16*s,.18*s,W,Math.cos(a)*.12*s,Math.sin(a)*.12*s,.65*s,p);f.rotation.z=a+Math.PI/2}return p}

/* =================================================================== AH-4 gunship */
function ah4Model(g){const K=heliKit(g),{M,BX,CYL,rod,ext,plan,pane,tex,decal,wrapDecal,lite,star,text,glass,mfd,rotorHead}=K;const b=new THREE.Group();g.add(b);
 const panel=tex(256,256,(k,w,h)=>{k.fillStyle='#d4d4d4';k.fillRect(0,0,w,h);k.fillStyle='#a4a4a4';k.fillRect(0,0,w,2);k.fillRect(0,0,2,h);k.fillRect(0,100,w,1);k.fillRect(90,100,1,156);
  for(let i=0;i<600;i++){k.fillStyle='rgba(0,0,0,'+(Math.random()*.05)+')';k.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*8,1)}});panel.wrapS=panel.wrapT=THREE.RepeatWrapping;panel.repeat.set(.6,.6);
 const GY=M(0x3a4038,{map:panel,roughness:.6,side:THREE.DoubleSide}),GD=M(0x2a2e2a,{map:panel,roughness:.7}),DK=M(0x1a1c1e,{metalness:.4}),MT=M(0x5a5e64,{metalness:.75,roughness:.35}),IN=M(0x262826,{roughness:.9,metalness:.1}),SEAT=M(0x3a3a30,{roughness:.95,metalness:0});
 /* ---- fuselage: narrow, with two cockpit sills, the nose and the tail cone ---- */
 ext([[-5.3,1.85],[-5.45,1.6],[-5.25,1.3],[-4.3,1.2],[1.8,1.3],[3.0,1.75],[3.0,2.55],[2.2,2.75],[-1.15,2.75],[-1.25,2.05],[-4.45,1.95]],1.2,GY,0,b,.06);
 /* side sponsons (avionics bays) and the engines on pylons */
 for(const sd of[-1,1]){ext([[-1.8,1.45],[1.6,1.45],[1.95,1.8],[1.85,2.35],[-1.4,2.35],[-1.9,1.9]],.32,GD,sd*.74,b,.05);
  const nac=CYL(.42,.42,2.2,GD,sd*1.0,2.78,.6,'z',b,20);CYL(.36,.36,.02,DK,sd*1.0,2.78,-.51,'z',b,18);CYL(.12,.12,.06,MT,sd*1.0,2.78,-.53,'z',b,10);/* intake and its bullet */
  BX(.3,.3,1.6,GD,sd*.72,2.62,.6,b);/* pylon to the fuselage */
  rod([sd*1.02,2.8,1.6],[sd*1.4,2.85,2.25],.34,M(0x2a2420,{metalness:.6}),b,.38,16)}/* exhaust, bent outwards */
 /* ---- tandem cockpits: glass canopies (extruded, so every face is glass), frames, dashes, seats ---- */
 const can=(pts)=>{ext(pts,1.0,glass,0,b,0);for(const sd of[-1,1])for(let i=0;i<pts.length;i++){const a=pts[i],c=pts[(i+1)%pts.length];rod([sd*.5,a[1],a[0]],[sd*.5,c[1],c[0]],.03,DK,b)}};
 can([[-4.45,1.97],[-3.0,2.02],[-3.0,2.95],[-3.55,3.0],[-4.25,2.45]]);
 can([[-2.95,2.03],[-1.25,2.07],[-1.25,3.0],[-2.2,3.2],[-2.95,2.95]]);
BX(1.04,.08,.08,DK,0,2.5,-2.98,b);/* blast shield between the seats */
 for(const[z,yd]of[[-3.95,2.08],[-2.6,2.15]]){BX(.9,.2,.3,IN,0,yd+.08,z,b);const sc=new THREE.Mesh(new THREE.PlaneGeometry(.8,.16),mfd);sc.position.set(0,yd+.12,z+.16);sc.rotation.x=-.4;b.add(sc)}
 for(const[z,y]of[[-3.3,2.02],[-1.75,2.08]]){BX(.46,.08,.46,SEAT,0,y+.04,z,b);const bk=BX(.46,.62,.08,SEAT,0,y+.38,z+.25,b);bk.rotation.x=-.12}
 /* ---- nose sensor turret, the chin gun ---- */
 {const s=new THREE.Group();s.position.set(0,1.58,-5.55);b.add(s);CYL(.3,.3,.45,DK,0,0,0,null,s,18);for(const[x,y,r]of[[-.12,.06,.07],[.1,.06,.09],[0,-.12,.06]]){CYL(r,r,.04,M(0x203a5a,{emissive:0x10304a,metalness:.3,roughness:.1}),x,y,-.29,'z',s,14)}for(const sd of[-1,1])BX(.16,.3,.34,DK,sd*.36,0,0,s)}
 CYL(.2,.24,.36,DK,0,1.06,-3.85,null,b,14);/* gun mount under the nose */const cg=heliChinGun(K,b,0,.8,-3.85,1.6,GD);/* hung low: aimed fully up (+0.3 rad) the barrels still pass under the nose and sensor */
 /* ---- rotor pylon, mast, the four-blade rotor with a radar dome on top ---- */
 ext([[-1.3,2.72],[1.7,2.72],[1.9,2.85],[1.4,3.25],[-.6,3.28],[-1.25,3.0]],.9,GD,0,b,.05);
 CYL(.14,.17,.3,MT,0,3.4,.4,null,b,12);const rp=new THREE.Group();rp.position.set(0,3.5,.4);b.add(rp);const rotor=rotorHead(rp,4,7.7,Math.PI/4);
 {const d=new THREE.Mesh(new THREE.SphereGeometry(.42,18,10,0,6.283,0,Math.PI/2),M(0x6a6e64,{roughness:.6}));d.scale.y=.6;d.position.y=.5;rotor.add(d);CYL(.42,.42,.08,M(0x5a5e54),0,.48,0,null,rotor,18)}
 /* ---- tail boom, the swept fin, the stabiliser, tail rotor on the right, beacon ---- */
 rod([0,2.15,2.95],[0,2.3,8.7],.48,GY,b,.22,18);
 ext([[8.2,2.2],[9.0,2.2],[9.6,4.1],[9.15,4.15],[8.6,2.8]],.18,GY,0,b,.02);
 plan([[.15,8.3],[1.35,8.4],[1.4,8.95],[.15,9.05],[-.15,9.05],[-1.4,8.95],[-1.35,8.4],[-.15,8.3]],.08,GY,2.08,b);for(const sd of[-1,1])BX(.06,.42,.6,GY,sd*1.4,2.15,8.7,b);
 const tr=new THREE.Group();tr.position.set(.2,3.55,8.95);b.add(tr);CYL(.1,.1,.2,MT,0,0,0,'x',tr,10);const tailR=new THREE.Group();tailR.position.x=.12;tr.add(tailR);
 for(let i=0;i<2;i++){const bl=BX(.04,1.5,.15,M(0x1a1a1c),0,0,0,tailR);bl.rotation.x=i*.96;/* two blades crossed at 55°: the four-tip 'scissor' tail rotor */for(const s of[-1,1])BX(.045,.14,.155,M(0xe8c020),0,s*.68,0,bl)}
 const beacon=lite(0xff2020,0,4.22,9.18,b,1.4);
 /* ---- stub wings: a rocket pod, a missile rack, launch rails and nav lights ---- */
 for(const sd of[-1,1]){plan([[sd*.6,-1.15],[sd*3.2,-.95],[sd*3.2,-.25],[sd*.6,-.05]],.13,GD,1.72,b);
  BX(.1,.28,.4,GD,sd*1.6,1.52,-.6,b);heliPod(K,b,sd*1.6,1.2,-.6,GD);
  BX(.1,.22,.5,GD,sd*2.7,1.55,-.6,b);BX(.58,.06,1.2,MT,sd*2.7,1.42,-.6,b);for(const dx of[-.15,.15])heliMissile(K,b,sd*(2.7+dx),1.3,-.6,1);
  lite(sd>0?0x20ff40:0xff2020,sd*3.24,1.72,-.6,b)}
 /* ---- landing gear: two mains on trailing legs, a tail wheel ---- */
 for(const sd of[-1,1]){rod([sd*.8,1.6,-1.5],[sd*1.2,.33,-1.15],.06,MT,b);rod([sd*.8,1.45,-.9],[sd*1.2,.33,-1.15],.045,MT,b);
  const w=CYL(.33,.33,.22,DK,sd*1.2,.33,-1.2,'x',b,18);CYL(.16,.16,.24,MT,sd*1.2,.33,-1.2,'x',b,10)}
 rod([0,1.95,7.8],[0,.32,8.05],.05,MT,b);CYL(.18,.18,.14,DK,0,.18,8.05,'x',b,14);
 /* ---- markings ---- */
 for(const sd of[-1,1]){const st=wrapDecal(.415,.62,1.4,star,sd,b);st.position.set(0,2.19,4.6);
  const lb=decal(2.6,.24,text('DARK ARMY · 6TH ATTACK'),b);lb.position.set(sd*.906,2.0,-.1);lb.rotation.y=sd*Math.PI/2;
  const tn=decal(.48,.15,text('66-0702'),b);tn.position.set(sd*.098,3.0,8.97);/* inside the fin's outline */tn.rotation.y=sd*Math.PI/2}
 rod([.25,2.75,1.9],[.32,3.25,2.2],.012,DK,b);
 g.userData.rotor=rotor;g.userData.tailR=tailR;g.userData.cg=cg;g.userData.beacon=beacon;return g}
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
function mkRunabout(kind,colour){const g=new THREE.Group();
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.5,metalness:.3},o||{}));
 const paintC=colour!=null?colour:{bike:0x2a3a9a,golf:0xf4f4f0,quad:0xc02020,buggy:0xe8d030}[kind];
 const paint=M(paintC,{roughness:.35,metalness:.25}),dk=M(0x18191a,{roughness:.85,metalness:.1}),steel=M(0x5a5e62,{metalness:.65,roughness:.35}),chrome=M(0xc8ccd0,{metalness:.55,roughness:.22}),
  seatM=M(0x1e1e20,{roughness:.9,metalness:0}),hl=M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.6,roughness:.1}),tl=M(0x701010,{emissive:0xc01010,emissiveIntensity:.5}),
  glass=new THREE.MeshStandardMaterial({color:0x9ac8e0,transparent:true,opacity:.3,roughness:.05,metalness:.3,side:THREE.DoubleSide,depthWrite:false});
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const CYL=(r1,r2,len,m,x,y,z,ax,p,seg)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,seg||14),m);o.position.set(x,y,z);if(ax=='x')o.rotation.z=Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;(p||g).add(o);return o};
 const rod=(a,b,r,m,p)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),8),m);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());(p||g).add(o);
  const j=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),m);j.position.copy(B);(p||g).add(j);return o};/* a ball at the far end hides the joint */
 const B_T=.02;
 /* a side profile [z, y] extruded across x, centred on x; arches: [[z, y, r]] cut out of the bottom edge */
 const ext=(pts,w,m,x,p,bev,arches)=>{const bt=bev==null?B_T:bev;const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);
  if(arches){const bot=pts[0][1],zEnd=pts[1][0];for(const[az,ay,ar]of arches){s.lineTo(az-ar,bot);s.lineTo(az-ar,ay);s.absarc(az,ay,ar,Math.PI,0,true);s.lineTo(az+ar,bot)}s.lineTo(zEnd,bot);for(const q of pts.slice(2))s.lineTo(q[0],q[1])}
  else for(const q of pts.slice(1))s.lineTo(q[0],q[1]);s.lineTo(pts[0][0],pts[0][1]);
  const geo=new THREE.ExtrudeGeometry(s,{depth:w-2*bt,bevelEnabled:bt>0,bevelThickness:bt,bevelSize:bt,bevelSegments:2,curveSegments:12});const o=new THREE.Mesh(geo,m);o.rotation.y=-Math.PI/2;o.position.x=(x||0)+(w-2*bt)/2;(p||g).add(o);return o};
 /* a mudguard: a curved strip round a wheel at (y, z), radius r, from angle a0 to a1 (0 = straight forward, π/2 = top) */
 const guard=(x,y,z,r,w,a0,a1,m,p)=>{const geo=new THREE.CylinderGeometry(r,r,w,20,1,true,a0,a1-a0);const o=new THREE.Mesh(geo,m);o.material=o.material.clone();o.material.side=THREE.DoubleSide;o.rotation.z=Math.PI/2;o.position.set(x,y,z);(p||g).add(o);return o};
 const tex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)};
 const plate=(txt,x,y,z,ry,s,p)=>{const o=new THREE.Mesh(new THREE.PlaneGeometry(.36*(s||1),.18*(s||1)),M(0xffffff,{map:tex(256,128,(k)=>{k.fillStyle='#f0e8d0';k.fillRect(0,0,256,128);k.strokeStyle='#2a2a2a';k.lineWidth=6;k.strokeRect(4,4,248,120);
  k.fillStyle='#b03020';k.font='bold 22px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';k.textAlign='center';k.fillText('DESERT STATE',128,30);k.fillStyle='#1a1a1a';k.font='bold 64px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';k.fillText(txt,128,100,230)}),metalness:.2}));o.position.set(x,y,z);o.rotation.y=ry;(p||g).add(o);return o};
 /* wheels: the tyre t rolls; everything on the hub is inside t */
 const wheels=[];const wheel=(x,z,r,w,style)=>{const p=new THREE.Group();p.position.set(x,r,z);g.add(p);
  const knob=style=='knobby',tr=tex(64,64,(k)=>{k.fillStyle='#1c1c1c';k.fillRect(0,0,64,64);k.fillStyle='#0c0c0c';if(knob){for(let i=0;i<64;i+=16)for(let j=0;j<64;j+=16)k.fillRect(j+(i%32?8:0),i,6,8)}else{for(let i=0;i<64;i+=8)k.fillRect(0,i,64,2)}});tr.wrapS=tr.wrapT=THREE.RepeatWrapping;tr.repeat.set(1,Math.round(r*14));
  let t;if(style=='spoke'){t=new THREE.Group();const ty=new THREE.Mesh(new THREE.TorusGeometry(r-w*.45,w*.45,10,32),M(0xffffff,{map:tr,roughness:.95,metalness:0}));ty.rotation.x=Math.PI/2;t.add(ty)}/* an open tyre, so the spokes show */
  else{t=new THREE.Mesh(new THREE.CylinderGeometry(r,r,w,26),[M(0xffffff,{map:tr,roughness:.95,metalness:0}),dk,dk]);for(const s of[-1,1]){const sw2=new THREE.Mesh(new THREE.TorusGeometry(r-w*.22,w*.22,6,24),dk);sw2.rotation.x=Math.PI/2;sw2.position.y=s*(w/2-w*.22);t.add(sw2)}}/* rounded sidewalls */
  t.rotation.z=Math.PI/2;t.userData.r=r;p.add(t);
  if(style=='spoke'){const rim=new THREE.Mesh(new THREE.TorusGeometry(r*.78,.015,6,28),chrome);rim.rotation.x=Math.PI/2;t.add(rim);t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.76,r*.76,w*.55,24,1,true),M(0x2a2a2c,{metalness:.6,side:THREE.DoubleSide})));
   for(let i=0;i<16;i++){const a=i/16*6.283,s=(i%2?1:-1)*w*.18;const sp=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,r*.68,4),chrome);sp.position.set(Math.cos(a)*r*.4,s,Math.sin(a)*r*.4);sp.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.cos(a),-s*2,Math.sin(a)).normalize());t.add(sp)}
   t.add(new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,w+.06,10),steel))}
  else if(style=='golf'){t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.62,r*.62,w+.01,18),M(0xe8e8e4,{metalness:.3,roughness:.3})));t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.18,r*.18,w+.03,10),chrome))}
  else{const rr=r*.58;t.add(new THREE.Mesh(new THREE.CylinderGeometry(rr,rr,w+.01,16),M(0x3a3c3e,{metalness:.6,roughness:.35})));for(let i=0;i<5;i++){const a=i/5*6.283,b=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,w+.03,6),chrome);b.position.set(Math.cos(a)*rr*.5,0,Math.sin(a)*rr*.5);t.add(b)}t.add(new THREE.Mesh(new THREE.CylinderGeometry(rr*.3,rr*.3,w+.04,10),steel))}
  wheels.push({p,t,front:z<0});return p};
 let sw=null,swAx='z';
 const wheelSteer=(x,y,z,tilt,r)=>{const s=new THREE.Group();s.position.set(x,y,z);s.rotation.x=tilt;g.add(s);s.add(new THREE.Mesh(new THREE.TorusGeometry(r,.022,8,22),dk));
  for(const a of[0,2.1,4.2]){const b=new THREE.Mesh(new THREE.BoxGeometry(r*.9,.025,.02),steel);b.position.set(Math.cos(a)*r*.45,Math.sin(a)*r*.45,0);b.rotation.z=a;s.add(b)}
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.05,10),dk);hub.rotation.x=Math.PI/2;s.add(hub);const col=new THREE.Mesh(new THREE.CylinderGeometry(.025,.03,.5,8),dk);col.rotation.x=Math.PI/2;col.position.z=-.25;s.add(col);sw=s;swAx='z';return s};

 /* =================================================================== BIKE */
 if(kind=='bike'){const fr=M(0x2a2a2e,{metalness:.6,roughness:.4}),eng=M(0x6a6a70,{metalness:.7,roughness:.35});
  /* frame: from the steering head over the engine to the swingarm pivot, a subframe to the tail */
  const H=[0,1.0,-.55];rod(H,[0,.86,.05],.035,fr);rod(H,[0,.42,-.28],.035,fr);rod([0,.42,-.28],[0,.38,.18],.035,fr);rod([0,.38,.18],[0,.86,.05],.035,fr);rod([0,.86,.05],[0,.82,.95],.025,fr);rod([0,.4,.2],[0,.82,.62],.022,fr);
  ext([[-.5,.8],[.05,.8],[.08,.92],[-.05,1.02],[-.42,1.04],[-.56,.94]],.38,paint);/* tank */
  {const st=tex(256,64,(k,w,h)=>{k.clearRect(0,0,w,h);k.fillStyle='#e8e4d8';k.font='italic bold 40px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';k.textAlign='center';k.textBaseline='middle';k.fillText('DESERT 650',w/2,h/2)});
   for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(.38,.09),new THREE.MeshStandardMaterial({map:st,transparent:true,alphaTest:.3}));p.position.set(sd*.196,.92,-.27);p.rotation.y=sd*Math.PI/2;g.add(p)}}
  ext([[.03,.8],[.78,.78],[.9,.85],[.8,.9],[.1,.9],[.02,.86]],.3,seatM,0,null,.03);/* saddle (top 0.9, as the old seat) */
  ext([[.75,.72],[1.05,.72],[1.08,.8],[.8,.82]],.2,paint);BX(.1,.06,.04,tl,0,.76,1.07);plate('BRRM',0,.6,1.06,Math.PI,.6);BX(.04,.14,.04,fr,0,.69,1.03);/* tail, light, plate on a bracket */
  /* engine: crankcase, finned cylinder, side covers; exhaust header to a silencer */
  BX(.3,.3,.42,eng,0,.48,-.06);const cy=CYL(.11,.12,.32,eng,0,.72,-.24,null,null,14);cy.rotation.x=-.35;for(let i=0;i<5;i++){const f=CYL(.16,.16,.02,eng,0,.62+i*.055,-.2-i*.02,null,null,14);f.rotation.x=-.35}
  for(const sd of[-1,1])CYL(.13,.13,.04,chrome,sd*.16,.46,-.04,'x');
  rod([.08,.62,-.36],[.14,.3,-.2],.035,chrome);rod([.14,.3,-.2],[.17,.32,.35],.035,chrome);rod([.17,.32,.35],[.19,.48,.72],.04,chrome);{const m=CYL(.075,.065,.45,steel,.19,.52,.8,'z');m.rotation.x=Math.PI/2-.35}
  /* swingarm, shock, chain, footpegs */
  for(const sd of[-1,1])rod([sd*.1,.4,.2],[sd*.1,.36,.75],.025,fr);rod([0,.82,.5],[0,.42,.48],.028,M(0xd8b020,{metalness:.4}));CYL(.055,.055,.03,steel,-.13,.38,.18,'x');rod([-.13,.435,.18],[-.13,.46,.75],.012,dk);rod([-.13,.325,.18],[-.13,.26,.75],.012,dk);/* front sprocket and the chain's two runs to the rear sprocket */
  for(const sd of[-1,1]){BX(.14,.03,.04,steel,sd*.22,.38,.12);BX(.05,.12,.04,fr,sd*.15,.4,.12)}
  /* the front end turns about the raked steering head */
  const s=new THREE.Group();s.position.set(...H);s.rotation.x=.26;g.add(s);
  for(const sd of[-1,1]){CYL(.03,.03,.64,chrome,sd*.09,-.34,0,null,s,8);CYL(.04,.04,.2,dk,sd*.09,-.12,0,null,s,8)}BX(.26,.05,.08,steel,0,.02,0,s);BX(.26,.05,.08,steel,0,-.2,0,s);/* fork legs, triple clamps */
  CYL(.03,.03,.24,steel,0,-.66,0,'x',s,8);/* front axle */
  guard(0,-.66,0,.42,.14,1.25,2.75,paint,s);/* front mudguard: from just behind the top round to the front */
  {const hlg=new THREE.Group();hlg.position.set(0,-.08,-.14);s.add(hlg);CYL(.11,.1,.12,dk,0,0,0,'z',hlg,16);CYL(.09,.09,.02,hl,0,0,-.07,'z',hlg,16)}
  {const bar=new THREE.Group();bar.position.set(0,.1,.06);s.add(bar);CYL(.018,.018,.72,chrome,0,0,0,'x',bar,8);for(const sd of[-1,1]){CYL(.03,.03,.14,dk,sd*.32,0,0,'x',bar,8);rod([sd*.24,0,0],[sd*.28,.2,.04],.01,dk,bar);BX(.08,.05,.01,chrome,sd*.3,.23,.05,bar)}BX(.14,.08,.08,dk,0,.04,-.02,bar)}
  sw=s;swAx='y';
  wheel(0,-.72,.36,.14,'spoke');wheel(0,.75,.36,.18,'spoke');guard(0,.36,.75,.42,.18,.35,1.75,paint);/* rear mudguard: from the top round to the back */
  {const d=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.012,20),steel);d.position.set(0,-.06,0);wheels[0].t.add(d)}{const sp=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.02,20),steel);sp.position.set(0,.13,0);wheels[1].t.add(sp);for(let i=0;i<16;i++){const a=i/16*6.283,tt=new THREE.Mesh(new THREE.BoxGeometry(.025,.02,.025),steel);tt.position.set(Math.cos(a)*.105,.13,Math.sin(a)*.105);wheels[1].t.add(tt)}for(const sd of[-1,1]){const n=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.03,6),steel);n.position.y=sd*.14;wheels[1].t.add(n)}}/* rear sprocket (rolls with the wheel) and axle nuts where the swingarm meets it *//* front brake disc, on the hub */}

 /* =================================================================== GOLF */
 else if(kind=='golf'){
  ext([[-1.15,.2],[1.15,.2],[1.2,.56],[.45,.6],[.43,.42],[-.55,.42],[-.6,.9],[-.95,.92],[-1.2,.62]],1.24,paint,0,null,.03,[[-.85,.26,.3],[.9,.26,.3]]);
  BX(1.1,.02,.95,M(0x3a3a3a,{roughness:1}),0,.432,-.06);/* floor mat */
  /* bench seat with arm rests */BX(1.1,.14,.5,M(0xeae4d4,{roughness:.8}),0,.7,.15);{const bk=BX(1.1,.5,.1,M(0xeae4d4,{roughness:.8}),0,1.05,.44);bk.rotation.x=-.12}for(const sd of[-1,1])BX(.05,.2,.4,steel,sd*.58,.84,.2);BX(1.12,.04,.5,steel,0,.62,.15);
  /* dash pod with a key, a cup holder; the steering wheel */BX(1.08,.1,.22,M(0x2a2a2a,{roughness:.8}),0,.92,-.56);CYL(.04,.04,.06,dk,-.2,.98,-.5,null,null,10);BX(.04,.03,.06,chrome,.1,.97,-.47);
  wheelSteer(.32,1.12,-.32,-.9,.15);/* above and behind the dash pod; its column runs down into the dash */
  /* canopy on four posts, windscreen, two headlights */
  for(const[x,z,y0]of[[-.56,-.62,.9],[.56,-.62,.9],[-.56,.95,.56],[.56,.95,.56]])rod([x,y0,z],[x,1.94,z],.025,chrome);
  ext([[-1.0,1.92],[1.1,1.92],[1.14,1.98],[1.05,2.02],[-.95,2.02],[-1.05,1.98]],1.3,M(0x2a7a3a,{roughness:.7}),0,null,.02);BX(1.24,.01,2.0,M(0xf0f0f0),0,1.915,.05);
  {const ws=new THREE.Mesh(new THREE.PlaneGeometry(1.08,.88),glass);ws.position.set(0,1.42,-.63);ws.rotation.x=.05;g.add(ws);rod([-.54,.98,-.63],[.54,.98,-.63],.015,steel);rod([-.54,1.86,-.6],[.54,1.86,-.6],.015,steel)}
  for(const sd of[-1,1]){CYL(.06,.06,.04,hl,sd*.32,.62,-1.2,'z');CYL(.07,.07,.02,chrome,sd*.32,.62,-1.185,'z')}BX(1.0,.1,.1,M(0x2a2a2a),0,.3,-1.2);BX(1.1,.1,.1,M(0x2a2a2a),0,.3,1.2);
  for(const sd of[-1,1])BX(.12,.06,.03,tl,sd*.45,.45,1.2);
  /* the bag rack and two bags with clubs */BX(.9,.04,.36,steel,0,.6,1.02);rod([-.45,.6,1.18],[-.45,1.15,1.18],.015,steel);rod([.45,.6,1.18],[.45,1.15,1.18],.015,steel);rod([-.45,1.15,1.18],[.45,1.15,1.18],.015,steel);
  for(let i=0;i<2;i++){const bg=new THREE.Group();bg.position.set(-.24+i*.48,.62,1.02);bg.rotation.x=-.18;g.add(bg);CYL(.14,.13,.85,M(i?0x3a3a8a:0xc02020,{roughness:.8}),0,.43,0,null,bg,16);CYL(.15,.15,.06,M(0xf0f0f0),0,.86,0,null,bg,16);BX(.06,.6,.04,M(0xf0f0f0),0,.45,-.14,bg);
   for(let j=0;j<3;j++){CYL(.012,.012,.3,chrome,-.06+j*.06,1.0,0,null,bg,6);BX(.06,.05,.1,j==1?dk:chrome,-.06+j*.06,1.15,-.03,bg)}}
  plate('GOLF 1',0,.48,1.205,0,.7);
  for(const[x,z]of[[-.56,-.85],[.56,-.85],[-.56,.9],[.56,.9]])wheel(x,z,.26,.18,'golf')}

 /* =================================================================== QUAD */
 else if(kind=='quad'){
  /* frame, engine, bash plate, footrests */for(const sd of[-1,1]){rod([sd*.25,.42,-.9],[sd*.25,.42,.85],.03,steel);rod([sd*.25,.42,-.6],[sd*.22,.82,-.45],.025,steel);rod([sd*.25,.42,.45],[sd*.22,.82,.5],.025,steel)}
  BX(.4,.32,.55,M(0x5a5e62,{metalness:.6}),0,.58,0);BX(.56,.04,1.2,steel,0,.38,0);for(const sd of[-1,1]){BX(.28,.04,.46,steel,sd*.42,.46,.02);for(let i=0;i<4;i++)BX(.28,.02,.02,dk,sd*.42,.485,-.16+i*.12)}
  /* body: tank cover and the saddle */ext([[-.45,.74],[.2,.74],[.22,.92],[-.1,.96],[-.45,.9]],.5,paint);ext([[-.2,.92],[.62,.92],[.7,1.0],[.6,1.07],[-.1,1.07],[-.25,1.0]],.42,seatM,0,null,.03);
  /* mudguards over each pair of wheels (full width, so the tyres are covered from above) */
  ext([[-1.02,.62],[-.95,.82],[-.25,.86],[-.2,.66],[-.25,.66],[-.3,.8],[-.9,.77],[-.97,.62]],1.52,paint,0,null,.015);
  ext([[1.02,.62],[.95,.82],[.25,.86],[.2,.66],[.25,.66],[.3,.8],[.9,.77],[.97,.62]],1.52,paint,0,null,.015);
  /* racks */for(const[z0,z1]of[[-.95,-.42],[.4,.95]]){for(const sd of[-1,1]){rod([sd*.5,.94,z0],[sd*.5,.94,z1],.018,dk);rod([sd*.5,.86,z0],[sd*.5,.94,z0],.018,dk);rod([sd*.5,.86,z1],[sd*.5,.94,z1],.018,dk)}rod([-.5,.94,z0],[.5,.94,z0],.018,dk);rod([-.5,.94,z1],[.5,.94,z1],.018,dk);for(let i=1;i<4;i++){const z=z0+(z1-z0)*i/4;rod([-.5,.94,z],[.5,.94,z],.012,dk)}}
  /* headlights in the front guard, tail light */for(const sd of[-1,1]){BX(.18,.09,.04,hl,sd*.28,.76,-.99);}BX(.16,.06,.04,tl,0,.74,.99);plate('QUAD',0,.62,1.0,0,.6);
  /* front A-arms to the hubs, solid rear axle, exhaust */for(const sd of[-1,1]){rod([sd*.25,.44,-.75],[sd*.46,.36,-.65],.02,steel);rod([sd*.25,.44,-.55],[sd*.46,.36,-.65],.02,steel);rod([sd*.22,.72,-.62],[sd*.44,.42,-.65],.03,M(0xd8b020,{metalness:.4}))}
  CYL(.04,.04,1.0,steel,0,.34,.65,'x');rod([.2,.5,.1],[.3,.62,.7],.035,chrome);{const m=CYL(.06,.06,.3,steel,.32,.66,.85,'z');m.rotation.x=Math.PI/2-.2}
  /* handlebars: the group turns on y about the steering column */
  const s=new THREE.Group();s.position.set(0,1.18,-.5);g.add(s);CYL(.022,.022,.8,chrome,0,0,0,'x',s,8);for(const sd of[-1,1])CYL(.035,.035,.14,dk,sd*.36,0,0,'x',s,8);CYL(.035,.035,.42,steel,0,-.21,0,null,s,8);
  {const pod=new THREE.Group();pod.position.set(0,.02,-.08);s.add(pod);BX(.24,.1,.12,paint,0,0,0,pod);CYL(.04,.04,.02,hl,0,0,-.065,'z',pod,10)}
  sw=s;swAx='y';
  for(const[x,z]of[[-.6,-.65],[.6,-.65],[-.6,.65],[.6,.65]])wheel(x,z,.34,.32,'knobby')}

 /* =================================================================== BUGGY */
 else if(kind=='buggy'){const cage=M(0x2a2c2e,{metalness:.55,roughness:.4}),red=M(0xc02020,{roughness:.8,metalness:0});
  BX(1.3,.06,2.2,M(0x3a3c3e,{metalness:.5}),0,.42,.05);/* floor pan */
  ext([[-1.75,.55],[-1.6,.42],[-.5,.42],[-.5,.85],[-.75,.9],[-1.7,.72]],1.3,paint,0,null,.04);/* the fibreglass nose */
  for(const sd of[-1,1]){BX(.14,.3,1.5,paint,sd*.65,.6,.05);BX(.3,.12,.06,hl,sd*.42,.66,-1.77)}/* side pods, headlights */
  {const st=tex(256,64,(k,w,h)=>{k.clearRect(0,0,w,h);k.fillStyle='#1a1a1a';k.font='bold 44px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';k.textAlign='center';k.textBaseline='middle';k.fillText('DUNE  RAT',w/2,h/2)});
   for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(1.0,.25),new THREE.MeshStandardMaterial({map:st,transparent:true,alphaTest:.3}));p.position.set(sd*.723,.6,.05);p.rotation.y=sd*Math.PI/2;g.add(p)}}
  /* the roll cage */
  for(const sd of[-1,1]){rod([sd*.66,.75,.45],[sd*.6,1.75,.4],.035,cage);rod([sd*.66,.85,-.55],[sd*.56,1.75,-.25],.035,cage);rod([sd*.56,1.75,-.25],[sd*.6,1.75,.4],.035,cage);rod([sd*.6,1.75,.4],[sd*.6,.72,1.45],.035,cage);rod([sd*.66,.75,.45],[sd*.6,.72,1.45],.03,cage)}
  rod([-.6,1.75,.4],[.6,1.75,.4],.035,cage);rod([-.56,1.75,-.25],[.56,1.75,-.25],.035,cage);rod([-.62,1.3,.43],[.62,1.3,.43],.03,cage);rod([-.6,.72,1.45],[.6,.72,1.45],.03,cage);
  /* light bar */BX(1.0,.12,.1,dk,0,1.82,-.25);for(let i=0;i<4;i++)CYL(.045,.045,.03,hl,-.36+i*.24,1.82,-.31,'z');
  /* bucket seats with harnesses */for(const sd of[-1,1]){const x=sd*.4;BX(.5,.1,.5,seatM,x,.6,-.05);const bk=BX(.5,.72,.1,seatM,x,.98,.24);bk.rotation.x=-.15;for(const s2 of[-1,1])BX(.06,.5,.4,seatM,x+s2*.25,.82,.08);
   for(const s2 of[-1,1])BX(.05,.66,.01,red,s2*.12,0,-.056,bk);/* shoulder straps lying on the seat back (children of it) */BX(.42,.01,.06,red,x,.656,-.12);BX(.07,.012,.07,M(0xc8ccd0,{metalness:.6}),x,.658,-.12)}/* lap belt and buckle on the cushion */
  /* the steering wheel and a little dash */wheelSteer(.4,1.05,-.6,-1.1,.16);BX(1.1,.12,.15,dk,0,.88,-.55);
  /* rear engine, air filter, twin exhausts, spare wheel */
  BX(.62,.45,.6,M(0x5a5e62,{metalness:.65}),0,.72,1.12);for(const sd of[-1,1]){const c=CYL(.1,.1,.3,M(0x5a5e62,{metalness:.65}),sd*.32,.88,1.1,'x');}CYL(.13,.13,.12,chrome,0,1.0,1.1,null,null,16);
  for(const sd of[-1,1]){rod([sd*.15,.75,1.42],[sd*.18,1.0,1.6],.04,chrome);CYL(.05,.05,.04,dk,sd*.18,1.02,1.62,'z')}
  {const sp=new THREE.Group();sp.position.set(0,1.18,1.52);g.add(sp);const t2=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.26,20),dk);t2.rotation.x=Math.PI/2;sp.add(t2);const h2=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.27,14),M(0x3a3c3e,{metalness:.6}));h2.rotation.x=Math.PI/2;sp.add(h2);rod([0,0,-.08],[0,0,-.1],.06,cage,sp)}
  BX(.4,.06,.08,cage,0,1.18,1.42);/* spare wheel bracket on the rear cross bar */
  /* suspension: front A-arms and coilovers, rear trailing arms */
  for(const sd of[-1,1]){rod([sd*.4,.45,-1.2],[sd*.7,.42,-1.1],.025,steel);rod([sd*.4,.45,-.95],[sd*.7,.42,-1.1],.025,steel);rod([sd*.42,.82,-.95],[sd*.66,.5,-1.08],.04,M(0xd8b020,{metalness:.4}));
   rod([sd*.45,.48,.7],[sd*.75,.52,1.05],.03,steel);rod([sd*.5,.9,.85],[sd*.72,.6,1.02],.04,M(0xd8b020,{metalness:.4}))}
  plate('DUNE',0,.5,1.43,0,.7);for(const sd of[-1,1])BX(.12,.08,.03,tl,sd*.25,.52,1.43);BX(.66,.36,.02,M(0x2a2a2a),0,.6,1.42);/* rear panel the plate and lights sit on */
  wheel(-.85,-1.1,.42,.3,'knobby');wheel(.85,-1.1,.42,.3,'knobby');wheel(-.88,1.05,.52,.42,'knobby');wheel(.88,1.05,.52,.42,'knobby')}
 g.userData.wheels=wheels;g.userData.sw=sw;g.userData.swAx=swAx;return g}

/* ---------- hooking them in ---------- */
awHeli=function(g,dark){return uh9Model(g,dark)};
awGunship=function(g){return ah4Model(g)};
awJet=function(g,ghost){return jetModel(g,ghost,VEHK[ghost?'ghost':'jet'].msl.pods)};
/* the new guns and pods (from the model headers) */
try{VEHK.heli.msl.pods=[[2.05,2.0,-.2],[-2.05,2.0,-.2]];VEHK.heli.gun.from=[0,.55,-4.75];VEHK.gunship.gun.from=[0,.66,-6.15];VEHK.jet.gun.from=[.62,1.42,-5.0]}catch(e){conLog('error','aircraft numbers: '+e.message)}
{const mv11=mkVehModel;mkVehModel=function(k){if(k=='bike'||k=='golf'||k=='quad'||k=='buggy'){try{const K=VEHK[k],m=mkRunabout(k,K&&K.col);return typeof nvFinish=='function'?nvFinish(m,K):m}catch(e){conLog('error','runabout '+k+': '+e.message)}}return mv11.apply(this,arguments)}}
