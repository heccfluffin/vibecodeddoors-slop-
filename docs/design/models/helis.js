/* =====================================================================================================
   The two Fort Blackout helicopters, remodelled. Replace awHeli and awGunship (dx549):
     uh9Model(g, dark)   the UH-9 transport (dark = 1 gives the darker "6th Attack" paint, like awHeli(g, 1))
     ah4Model(g)         the AH-4 attack gunship
   Both build into g (the game makes g with rotation.order 'YXZ', as now) and return g.
   ORIGIN    Centre on the ground (skids / wheels touch y 0).   FRONT  -z.
   HOOKS (same as now; awLook / awFire / dx554 drive them):
     userData.rotor    main rotor Group, spins on y      userData.tailR   tail rotor blades Group, spins on x
     userData.cg       chin gun {t, spin, fl}: t turns on y, t.children[1] is the yoke that pitches on x,
                       spin turns on z, fl is the muzzle flash sprite (its material.opacity is set)
     userData.beacon   red beacon (visible toggled)
   CHANGED NUMBERS (please update VEHK in dx549):
     heli.msl.pods     [[2.05, 2.0, -0.2], [-2.05, 2.0, -0.2]]   (the stub wings are now above the doors, like a
                       real transport, so the doorways are open)
     heli.gun.from     [0, 0.55, -4.75]   (chin gun muzzle)
     gunship.gun.from  [0, 0.66, -6.15];   gunship.msl.pods stays [[1.6, 1.35, -0.6], [-1.6, 1.35, -0.6]]
     cock (cockpit camera) unchanged for both: there are real cockpits round those points now.
   SIZE      UH-9: 3.4 m over the rotor-pod wings, 14.6 m nose to tail fin, rotor 15 m across, 4.3 m tall.
             AH-4: 6.6 m over the wingtips, 15 m long, rotor 15.4 m across, 4.3 m tall.
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
