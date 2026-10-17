/* =====================================================================================================
   r549: THE FORT BLACKOUT AIR WING.
   - A flyable UH-style transport helicopter replaces the parked prop on LZ Bravo (Lieutenant), with a three-barrel
     chin gun, rocket pods, a door gunner's minigun, skids, nav lights and a spinning four-blade rotor.
   - A two-seat attack gunship (Captain), the F-9 "Sabre" fighter (Major) and the black X-22 "Wraith II" interceptor
     (Colonel) live on a brand new 300 m AIRSTRIP just outside the north fence, with hardened shelters and a tower.
   - Helicopters: SPACE up, C or SHIFT down, W/S forward/back, A/D turn. Fighters: W climb, S dive, A/D turn,
     SHIFT afterburner, SPACE airbrake. Every aircraft: click or F = gun, R = missiles / rockets, V = camera, L = land.
   - A steady chase camera that moves WITH the aircraft (no lag or wobble at 400 km/h) and a flight HUD.
   - Fix: tanks hit by an explosion no longer barrel-roll into the ground forever.
   ===================================================================================================== */
const AW={RW:{x0:235,x1:535,z:-980,w:30},kinds:['heli','gunship','jet','ghost']};
Object.assign(VEHK,{
 heli:{nm:'the UH-9 transport helicopter',col:0x4a5a34,w:2.8,len:12,max:34,acc:6,turn:1.3,whr:.4,seats:[[.55,-2.2,.55],[-.55,-2.2,.55],[.9,.2,.55],[-.9,.2,.55]],plane:1,heli:1,climb:9,ceil:150,cock:[.55,2.05,-2.3],camD:15,camH:3.2,gun:{rof:.075,spd:240,pw:.35,dmg:1,from:[0,.9,-3.0]},msl:{n:14,rof:.22,spd:120,pw:.9,pods:[[1.75,1.25,-.2],[-1.75,1.25,-.2]]}},
 gunship:{nm:'the AH-4 attack gunship',col:0x3a4038,w:2.6,len:14,max:44,acc:8,turn:1.6,whr:.4,seats:[[0,-3.1,.6],[0,-1.6,1.0]],plane:1,heli:1,climb:11,ceil:170,cock:[0,2.8,-3.3],camD:16,camH:3.4,gun:{rof:.06,spd:260,pw:.4,dmg:1,from:[0,.8,-4.2]},msl:{n:24,rof:.16,spd:140,pw:1,pods:[[1.6,1.35,-.6],[-1.6,1.35,-.6]]}},
 jet:{nm:'the F-9 Sabre fighter',col:0x707880,w:3.0,len:15,max:58,acc:16,turn:2.1,whr:.45,seats:[[0,-3.4,1.1]],plane:1,jet:1,vcr:78,vmax:125,vmin:34,climb:34,ceil:240,cock:[0,2.55,-3.5],camD:20,camH:3.6,gun:{rof:.05,spd:340,pw:.45,dmg:1,from:[.8,1.4,-5.2]},msl:{n:6,rof:.45,spd:170,pw:1.5,pods:[[4.9,1.45,.5],[-4.9,1.45,.5],[3.2,1.0,0],[-3.2,1.0,0],[2.0,1.0,-.2],[-2.0,1.0,-.2]]}},
 ghost:{nm:'the X-22 Wraith II interceptor',col:0x1c1e22,w:3.0,len:16,max:62,acc:18,turn:2.5,whr:.45,seats:[[0,-3.8,1.1]],plane:1,jet:1,vcr:90,vmax:150,vmin:36,climb:40,ceil:260,cock:[0,2.5,-3.9],camD:21,camH:3.6,gun:{rof:.04,spd:360,pw:.5,dmg:1,from:[0,1.3,-6.5]},msl:{n:8,rof:.35,spd:190,pw:1.7,pods:[[1.4,.85,-.5],[-1.4,.85,-.5],[2.4,.85,0],[-2.4,.85,0]]}}});
/* ---------------------------------------------------------------- models ---------------------------------------------------------------- */
function awDecal(txt,w,h,bg,fg,font){const c=document.createElement('canvas');c.width=256;c.height=Math.max(16,Math.round(256*h/w));const k=c.getContext('2d');if(bg){k.fillStyle=bg;k.fillRect(0,0,c.width,c.height)}k.fillStyle=fg;let f=Math.round(c.height*.62);k.font='bold '+f+'px '+(font||'Arial');while(k.measureText(txt).width>c.width*.92&&f>8){f--;k.font='bold '+f+'px '+(font||'Arial')}k.textAlign='center';k.textBaseline='middle';k.fillText(txt,c.width/2,c.height/2+1);
 return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:!bg,depthWrite:!!bg,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}))}
function awStar(r){const c=document.createElement('canvas');c.width=c.height=128;const k=c.getContext('2d');k.fillStyle='#1c2416';k.beginPath();k.arc(64,64,62,0,6.283);k.fill();k.fillStyle='#e8e4d0';k.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?20:50;k.lineTo(64+Math.cos(a)*rr,64+Math.sin(a)*rr)}k.closePath();k.fill();
 return new THREE.Mesh(new THREE.CircleGeometry(r,24),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}))}
function awKit(g){const M=(c,o)=>VMAT(c,o),add=(geo,m,x,y,z,par)=>{const o=new THREE.Mesh(geo,m);o.position.set(x||0,y||0,z||0);(par||g).add(o);return o},Gp=(x,y,z,par)=>{const q=new THREE.Group();q.position.set(x||0,y||0,z||0);(par||g).add(q);return q};
 const BX=(w,h,d)=>new THREE.BoxGeometry(w,h,d),CY=(a,b,h,s)=>new THREE.CylinderGeometry(a,b,h,s||16),SP=(r,s,t,...rest)=>new THREE.SphereGeometry(r,s||20,t||14,...rest);
 /* a tube along the z axis */const tz=(r0,r1,len,m,x,y,z,par,seg)=>{const o=add(CY(r1,r0,len,seg||18),m,x,y,z,par);o.rotation.x=Math.PI/2;return o};
 const GL=new THREE.MeshStandardMaterial({color:0x1a2a3a,metalness:.9,roughness:.08,transparent:true,opacity:.82,emissive:0x0a1420});GL.userData={gd:1};
 const lite=(c,x,y,z,par,s)=>{const o=add(SP(.07*(s||1),8,6),new THREE.MeshBasicMaterial({color:c}),x,y,z,par);const gl=glowSp(c,.8,.45*(s||1));gl.position.set(x,y,z);(par||g).add(gl);return o};
 return{M,add,Gp,BX,CY,SP,tz,GL,lite}}
/* a rocket pod: a tube with nineteen holes in the nose and a pointed tail */
function awPod(K,par,x,y,z,m){const p=K.Gp(x,y,z,par);K.tz(.24,.24,1.35,m,0,0,0,p,16);const fr=K.add(new THREE.CircleGeometry(.235,16),K.M(0x15171a),0,0,-.68,p);fr.rotation.y=Math.PI;for(let i=0;i<7;i++){const a=i/6*6.283,rr=i?.13:0;const h=K.add(new THREE.CircleGeometry(.035,8),K.M(0x050505),Math.cos(a)*rr,Math.sin(a)*rr,-.685,p);h.rotation.y=Math.PI}const tl=K.add(new THREE.ConeGeometry(.24,.35,16),m,0,0,.85,p);tl.rotation.x=Math.PI/2;K.tz(.245,.245,.06,K.M(0xd8b020),0,0,-.5,p);return p}
/* an air-to-air missile on a rail */
function awMissile(K,par,x,y,z,s){s=s||1;const p=K.Gp(x,y,z,par);const W=K.M(0xe8e8e0,{metalness:.3});K.tz(.09*s,.09*s,2.2*s,W,0,0,0,p,12);const n=K.add(new THREE.ConeGeometry(.09*s,.36*s,12),K.M(0x3a3e44),0,0,-1.28*s,p);n.rotation.x=-Math.PI/2;K.tz(.092*s,.092*s,.12*s,K.M(0xd8b020),0,0,-.8*s,p,12);
 for(let i=0;i<4;i++){const f=K.add(K.BX(.02,.32*s,.3*s),W,0,0,.9*s,p);f.rotation.z=i*Math.PI/2+Math.PI/4;f.position.x=Math.cos(i*Math.PI/2+Math.PI/4)*.16*s;f.position.y=Math.sin(i*Math.PI/2+Math.PI/4)*.16*s;const c2=K.add(K.BX(.02,.22*s,.18*s),W,Math.cos(i*Math.PI/2+Math.PI/4)*.14*s,Math.sin(i*Math.PI/2+Math.PI/4)*.14*s,-.75*s,p);c2.rotation.z=i*Math.PI/2+Math.PI/4}
 K.add(K.BX(.06,.08,1.6*s),K.M(0x5a5e64,{metalness:.6}),0,.12*s,0,p);return p}
/* a rotary chin gun in a ball turret */
function awChinGun(K,par,x,y,z,len,m){const t=K.Gp(x,y,z,par);K.add(K.SP(.3,16,12),m,0,0,0,t);const yoke=K.Gp(0,-.05,0,t);K.add(K.BX(.5,.12,.3),K.M(0x2a2c30),0,0,-.1,yoke);const bar=K.Gp(0,-.08,-.25,yoke);K.tz(.11,.11,.5,K.M(0x2a2c30,{metalness:.7}),0,0,-.2,bar,12);
 const spin=K.Gp(0,0,-.45,bar);for(let i=0;i<3;i++){const a=i/3*6.283;K.tz(.035,.035,len,K.M(0x1a1a1c,{metalness:.8,roughness:.3}),Math.cos(a)*.06,Math.sin(a)*.06,-len/2,spin,8)}K.tz(.1,.1,.08,K.M(0x3a3c40,{metalness:.8}),0,0,-len*.55,spin,12);K.tz(.1,.1,.08,K.M(0x3a3c40,{metalness:.8}),0,0,-len+.06,spin,12);
 const fl=glowSp(0xffc060,0,.9);fl.position.set(0,0,-len-.25);spin.add(fl);return{t,spin,fl}}
function awHeli(g,dark){const K=awKit(g),{M,add,Gp,BX,CY,SP,tz,GL,lite}=K;const OL=M(dark?0x3a4038:0x4a5a34,{roughness:.62,metalness:.2}),OD=M(dark?0x2c3028:0x3c4a2a,{roughness:.7,metalness:.2}),DK=M(0x1c1e20,{roughness:.6,metalness:.4}),MT=M(0x5a5e64,{metalness:.75,roughness:.35});
 const body=Gp(0,.07,0);   /* lifted a touch so the skids sit ON the pad, not in it */
 /* the cabin: a rounded box made of a stretched cylinder and a nose ball, tapering into the boom */
 const cab=add(CY(1.0,1.0,4.2,24),OL,0,1.75,0,body);cab.rotation.x=Math.PI/2;cab.scale.set(1.0,1.0,1.08);
 const flr=add(BX(1.9,.5,4.2),OL,0,1.05,0,body);                                                       /* the flat belly */
 const nose=add(SP(1.0,24,16,0,6.283,Math.PI/2,Math.PI/2),OL,0,1.75,-2.1,body);nose.scale.set(1,1.08,1.35);    /* lower half of the nose */
 const can=add(SP(1.0,24,16,0,6.283,0,Math.PI/2),GL,0,1.75,-2.1,body);can.scale.set(.97,1.05,1.35);           /* the glass upper nose */
 add(BX(.06,.06,1.5),DK,0,2.78,-2.55,body).rotation.x=.55;add(BX(1.9,.06,.06),DK,0,2.62,-1.25,body);          /* canopy frames */
 for(const sd of[-1,1]){const fr=add(BX(.05,.9,.05),DK,sd*.75,2.25,-2.05,body);fr.rotation.x=-.35;fr.rotation.z=sd*.25}
 const aft=add(CY(.42,1.0,2.2,24),OL,0,1.85,3.15,body);aft.rotation.x=Math.PI/2;aft.scale.set(1,1.05,1);
 const boom=add(CY(.2,.42,6.2,18),OL,0,2.15,7.3,body);boom.rotation.x=Math.PI/2;boom.rotation.z=0;boom.position.y=2.12;
 /* tail fin, stabilisers and the tail rotor (on the left) */
 const fin=add(BX(.14,1.8,1.25),OL,0,2.85,10.25,body);fin.rotation.x=-.32;add(BX(.15,.4,.6),OL,0,2.15,10.0,body);
 const stab=add(BX(2.6,.08,.7),OL,0,2.15,9.3,body);for(const sd of[-1,1])add(BX(.06,.45,.6),OL,sd*1.3,2.3,9.3,body);
 const tr=Gp(-.2,3.25,10.5,body);add(CY(.12,.12,.25,10),MT,0,0,0,tr).rotation.z=Math.PI/2;const tblades=Gp(-.13,0,0,tr);for(let i=0;i<2;i++){const b=add(BX(.04,1.7,.16),M(0x1a1a1c),0,0,0,tblades);b.rotation.x=i*Math.PI/2;for(const s of[-1,1])add(BX(.045,.18,.17),M(0xe8c020),0,s*.78,0,b)}
 const beacon=lite(0xff2020,0,3.82,10.55,body,1.4);lite(0xffffff,0,2.12,10.95,body);
 /* the engine deck: housings, intakes, twin exhausts, the mast and the rotor */
 add(BX(1.5,.75,2.9),OD,0,3.0,.45,body);add(BX(1.3,.2,2.6),OL,0,3.42,.45,body);for(const sd of[-1,1]){tz(.2,.2,.5,DK,sd*.55,3.0,-1.25,body,14);const ex=tz(.18,.24,.9,M(0x2a2420,{metalness:.6,roughness:.5}),sd*.55,3.05,2.15,body,14);ex.rotation.y=sd*.25;add(new THREE.CircleGeometry(.17,12),M(0x050505),sd*.62,3.05,2.6,body)}
 for(let i=0;i<5;i++)add(BX(1.52,.03,.06),DK,0,3.15,-.7+i*.15,body);
 add(CY(.13,.16,.75,12),MT,0,3.75,.1,body);const rotor=Gp(0,4.12,.1,body);add(CY(.34,.34,.24,16),MT,0,0,0,rotor);add(CY(.1,.1,.45,10),MT,0,.25,0,rotor);
 for(let i=0;i<4;i++){const arm=Gp(0,0,0,rotor);arm.rotation.y=i*Math.PI/2;add(BX(.5,.1,.22),MT,.45,0,0,arm);const bl=add(BX(6.6,.05,.42),M(0x1a1c1e,{roughness:.5}),3.75,-.04,0,arm);bl.rotation.z=-.025;add(BX(.4,.055,.43),M(0xe8c020),6.9,-.12,0,arm)}
 /* stub wings with rocket pods, plus the chin gun */
 for(const sd of[-1,1]){const w=add(BX(1.25,.12,.75),OD,sd*1.55,1.55,-.2,body);w.rotation.z=sd*-.06;add(BX(.08,.4,.3),OD,sd*1.75,1.33,-.2,body);awPod(K,body,sd*1.75,1.13,-.2,OD);lite(sd>0?0x20ff40:0xff2020,sd*2.2,1.58,-.2,body)}
 const cg=awChinGun(K,body,0,.85,-2.75,1.05,OD);
 /* doors, windows, the door gunner's minigun, skids, steps, antennas, a searchlight */
 for(const sd of[-1,1]){const dw=add(BX(.04,1.0,1.6),DK,sd*1.0,1.85,.2,body);if(sd>0){dw.material=M(0x0a0c0e);dw.scale.y=1.05}for(const z of[-1.0,1.4])add(BX(.04,.45,.55),GL,sd*.99,2.05,z,body);add(BX(.04,.05,1.62),MT,sd*1.02,1.33,.2,body)}
 const mg=Gp(1.15,1.75,-.2,body);add(BX(.05,.5,.05),MT,0,-.25,0,mg);tz(.04,.04,1.0,M(0x1a1a1c,{metalness:.8}),0,0,-.45,mg,8);add(BX(.14,.16,.3),DK,0,.0,-.05,mg);add(BX(.24,.2,.16),M(0x4a5a30),0,-.06,.15,mg);
 for(const sd of[-1,1]){tz(.07,.07,4.6,MT,sd*1.12,.12,-.1,body,10);const up=tz(.07,.07,.65,MT,sd*1.12,.3,-2.6,body,10);up.rotation.x=Math.PI/2+.55;for(const z of[-1.3,1.1]){const st=add(CY(.05,.05,.95,8),MT,sd*1.02,.58,z,body);st.rotation.z=sd*.18;add(BX(.12,.1,.18),DK,sd*.95,1.02,z,body)}}
 add(BX(.03,.5,.03),DK,.3,3.6,1.6,body).rotation.x=-.4;add(BX(.03,.35,.03),DK,0,.55,1.4,body);
 const sl=add(CY(.15,.12,.18,12),MT,.45,.85,-1.9,body);sl.rotation.x=Math.PI/2;add(new THREE.CircleGeometry(.12,12),new THREE.MeshBasicMaterial({color:0xfff8e0}),.45,.85,-2.0,body).rotation.y=Math.PI;
 /* markings */for(const sd of[-1,1]){const st=awStar(.45);st.position.set(sd*.43,2.2,5.4);st.rotation.y=sd*Math.PI/2;body.add(st);const lb=awDecal(dark?'DARK ARMY · 6TH ATTACK':'DARK ARMY · 13TH AIR CAV',2.6,.28,null,'#e8e4d0','Georgia');lb.position.set(sd*1.025,2.55,.2);lb.rotation.y=sd*Math.PI/2;body.add(lb);const tn=awDecal(dark?'66-0451':'13-0917',1.0,.22,null,'#e8e4d0');tn.position.set(sd*.2,2.75,10.05);tn.rotation.y=sd*Math.PI/2;body.add(tn)}
 g.userData.rotor=rotor;g.userData.tailR=tblades;g.userData.cg=cg;g.userData.beacon=beacon;return g}
function awGunship(g){const K=awKit(g),{M,add,Gp,BX,CY,SP,tz,GL,lite}=K;const GY=M(0x3a4038,{roughness:.6,metalness:.25}),GD=M(0x2a2e2a,{roughness:.7,metalness:.25}),DK=M(0x1a1c1e,{metalness:.4}),MT=M(0x5a5e64,{metalness:.75,roughness:.35});const b=Gp(0,0,0);
 /* a narrow, angular fuselage: nose bay, stepped tandem cockpit, wide middle, long tail */
 add(BX(1.15,1.2,4.6),GY,0,1.9,-.6,b);
 /* r557: a tapered eight-sided nose instead of a box with a pyramid on it, a sensor ball on the tip, a cockpit tub and two stepped bubble canopies */
 {const nz=add(CY(.3,.6,2.4,8),GY,0,1.86,-4.1,b);nz.rotation.x=-Math.PI/2;nz.rotation.y=Math.PI/8;nz.scale.set(.95,1,1.0);const tip=add(CY(.16,.3,.35,8),GY,0,1.86,-5.45,b);tip.rotation.x=-Math.PI/2;tip.rotation.y=Math.PI/8;
  add(SP(.3,16,12),DK,0,1.62,-5.35,b);add(CY(.12,.12,.06,14),M(0x203a5a,{emissive:0x10304a,metalness:.2,roughness:.1}),0,1.62,-5.66,b).rotation.x=Math.PI/2;for(const sd of[-1,1])add(BX(.12,.18,.22),DK,sd*.3,1.62,-5.3,b);
  add(BX(.96,.36,3.3),GY,0,2.38,-2.55,b);add(BX(.9,.2,1.0),GY,0,2.62,-1.8,b);
  const can=(r,len,y,z,rx)=>{const c=add(new THREE.CylinderGeometry(r,r,len,14,1,false,0,Math.PI),GL,0,y,z,b);c.rotation.order='ZXY';c.rotation.x=Math.PI/2;c.rotation.z=Math.PI/2;c.rotation.y=rx||0;
   for(const e of[-1,1]){const f=add(new THREE.TorusGeometry(r,.035,5,14,Math.PI),DK,0,y,z+e*len/2,b)}const sp=add(BX(.05,.05,len),DK,0,y+r,z,b);return c};
  can(.47,1.35,2.55,-3.35);can(.5,1.45,2.72,-1.9);add(BX(1.0,.06,3.0),DK,0,2.56,-2.6,b)}
 add(BX(1.6,1.1,2.6),GY,0,2.25,.5,b);for(const sd of[-1,1]){tz(.42,.42,2.2,GD,sd*.98,2.75,.6,b,18);add(new THREE.CircleGeometry(.36,16),DK,sd*.98,2.75,-.52,b).rotation.y=Math.PI;const ex=tz(.3,.36,.6,M(0x2a2420,{metalness:.6}),sd*1.05,2.8,1.95,b,16);ex.rotation.y=sd*.4}
 const tb=add(CY(.22,.5,7.2,16),GY,0,2.15,5.3,b);tb.rotation.x=Math.PI/2;const fin=add(BX(.16,2.0,1.3),GY,0,3.0,8.7,b);fin.rotation.x=-.35;add(BX(2.8,.09,.8),GY,0,2.05,8.2,b);for(const sd of[-1,1])add(BX(.06,.5,.7),GY,sd*1.4,2.25,8.2,b);
 const tr=Gp(.2,3.55,8.95,b);const tbl=Gp(.12,0,0,tr);for(let i=0;i<4;i++){const bl=add(BX(.04,1.5,.15),M(0x1a1a1c),0,0,0,tbl);bl.rotation.x=i*Math.PI/4}tz(.1,.1,.2,MT,0,0,0,tr,10).rotation.y=Math.PI/2;
 const beacon=lite(0xff2020,0,4.0,9.1,b,1.4);
 add(CY(.14,.18,.7,12),MT,0,3.1,.4,b);const rotor=Gp(0,3.5,.4,b);add(CY(.36,.36,.26,16),MT,0,0,0,rotor);add(SP(.25,12,8),MT,0,.3,0,rotor);for(let i=0;i<4;i++){const arm=Gp(0,0,0,rotor);arm.rotation.y=i*Math.PI/2+Math.PI/4;const bl=add(BX(7.0,.06,.48),M(0x18191b),3.9,-.03,0,arm);bl.rotation.z=-.02;add(BX(.4,.065,.49),M(0xe8c020),7.2,-.11,0,arm)}
 /* stub wings: a rocket pod and two missiles each side, wingtip launch rails */
 for(const sd of[-1,1]){add(BX(2.6,.14,1.0),GD,sd*1.95,1.65,-.6,b);add(BX(.1,.45,.4),GD,sd*1.6,1.42,-.6,b);awPod(K,b,sd*1.6,1.2,-.6,GD);for(const dx of[2.55,2.85])awMissile(K,b,sd*dx,1.35,-.6,.75);add(BX(.08,.3,.5),GD,sd*2.7,1.55,-.6,b);lite(sd>0?0x20ff40:0xff2020,sd*3.25,1.68,-.6,b)}
 const cg=awChinGun(K,b,0,1.08,-3.85,1.6,GD);
 /* landing gear: two mains and a tail wheel */for(const sd of[-1,1]){const st=add(CY(.06,.06,1.3,8),MT,sd*.95,.75,-1.2,b);st.rotation.z=sd*.35;const wh=add(CY(.33,.33,.22,16),DK,sd*1.2,.33,-1.2,b);wh.rotation.z=Math.PI/2;add(CY(.16,.16,.24,10),MT,sd*1.2,.33,-1.2,b).rotation.z=Math.PI/2}add(CY(.05,.05,1.6,8),MT,0,1.15,7.8,b).rotation.x=-.35;const tw=add(CY(.18,.18,.14,12),DK,0,.18,8.05,b);tw.rotation.z=Math.PI/2;
 for(const sd of[-1,1]){const st=awStar(.42);st.position.set(sd*.81,2.25,1.2);st.rotation.y=sd*Math.PI/2;b.add(st);const lb=awDecal('DARK ARMY · 6TH ATTACK',2.4,.24,null,'#d8d4c0','Georgia');lb.position.set(sd*.59,1.55,-2.0);lb.rotation.y=sd*Math.PI/2;b.add(lb)}
 g.userData.rotor=rotor;g.userData.tailR=tbl;g.userData.cg=cg;g.userData.beacon=beacon;return g}
/* a swept wing as an extruded outline (x out, z back), thin and with a little sweep */
function awWing(K,pts,th,m){const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth:th,bevelEnabled:true,bevelThickness:th*.4,bevelSize:th*.4,bevelSegments:1,steps:1});geo.rotateX(Math.PI/2);geo.translate(0,th/2,0);return new THREE.Mesh(geo,m)}
function awJet(g,ghost){const K=awKit(g),{M,add,Gp,BX,CY,SP,tz,GL,lite}=K;const C1=ghost?M(0x1c1e22,{roughness:.5,metalness:.45}):M(0x7a8288,{roughness:.45,metalness:.45}),C2=ghost?M(0x26282c,{roughness:.55,metalness:.45}):M(0x5e666e,{roughness:.5,metalness:.45}),DK=M(0x141516,{metalness:.5,roughness:.4}),MT=M(0x8a8e94,{metalness:.8,roughness:.3});
 const b=Gp(0,0,0),Y=1.45;
 /* fuselage: a long tapering body with a sharp nose, a pitot tube and a bubble canopy */
 const fu=tz(.72,.9,8.6,C1,0,Y,.6,b,24);fu.scale.set(1,1,ghost?.72:.86);const ns=add(new THREE.ConeGeometry(.72,3.6,24),C1,0,Y,-5.3,b);ns.rotation.x=-Math.PI/2;ns.scale.set(1,1,ghost?.72:.86);add(CY(.02,.03,1.0,6),MT,0,Y,-7.5,b).rotation.x=Math.PI/2;
 const rd=add(new THREE.ConeGeometry(.5,1.2,20),M(0x2a2c30,{roughness:.8}),0,Y,-6.55,b);rd.rotation.x=-Math.PI/2;rd.scale.set(1,1,ghost?.72:.86);
 const cp=add(SP(.62,24,16,0,6.283,0,Math.PI/2),GL,0,Y+.45,-3.3,b);cp.scale.set(.85,.9,2.6);add(BX(1.06,.08,.12),MT,0,Y+.48,-2.15,b);const hr=add(new THREE.TorusGeometry(.42,.035,6,20,Math.PI),MT,0,Y+.45,-3.9,b);hr.scale.set(.95,1.0,1);
 add(BX(.5,.12,.4),DK,0,Y+.9,-3.6,b);/* the pilot's head */add(SP(.2,12,10),M(0x3a4a2a),0,Y+.85,-3.45,b);add(SP(.2,12,10,0,6.283,0,Math.PI*.5),M(0xd8d0b0,{metalness:.2}),0,Y+.9,-3.45,b);
 /* intakes either side, the spine */for(const sd of[-1,1]){const it=add(BX(.62,.82,3.0),C2,sd*.95,Y-.08,-1.3,b);add(BX(.5,.7,.06),DK,sd*.95,Y-.08,-2.81,b)}add(BX(.6,.35,5.0),C1,0,Y+.6,1.0,b);
 /* wings, tailplanes, fin(s) */const wing=ghost?[[0,-2.6],[5.6,2.6],[5.6,3.3],[0,3.6]]:[[0,-1.6],[4.9,1.3],[5.0,2.4],[0,2.9]];for(const sd of[-1,1]){const w=awWing(K,wing.map(p=>[p[0]*sd,p[1]]),.14,C1);w.position.set(sd*.7,Y-.05,0);b.add(w);const fl=add(BX(1.6,.05,.4),C2,sd*(.7+2.7),Y-.02,2.45,b)}
 const tp=ghost?null:[[0,0],[2.6,1.6],[2.6,2.3],[0,2.3]];if(tp)for(const sd of[-1,1]){const w=awWing(K,tp.map(p=>[p[0]*sd,p[1]]),.1,C1);w.position.set(sd*.6,Y,3.6);b.add(w)}
 const finS=[[0,0],[0,2.6],[2.0,2.6],[2.8,0]];const mkFin=(x,lean)=>{const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(2.4,0);s.lineTo(2.9,2.6);s.lineTo(1.8,2.6);s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth:.12,bevelEnabled:false});geo.rotateY(-Math.PI/2);const f=new THREE.Mesh(geo,C1);f.position.set(x+.06,Y+.5,2.8);f.rotation.z=lean;b.add(f);return f};
 if(ghost){mkFin(.85,-.4);mkFin(-.85,.4)}else mkFin(0,0);
 /* the engine: a ring nozzle with petals, a dark core and an afterburner glow */const nz=tz(.62,.55,.9,MT,0,Y,5.2,b,20);add(new THREE.CircleGeometry(.5,20),DK,0,Y,5.66,b);for(let i=0;i<12;i++){const a=i/12*6.283,p=add(BX(.2,.03,.5),M(0x4a4c50,{metalness:.8}),Math.cos(a)*.6,Y+Math.sin(a)*.6,5.85,b);p.rotation.z=a+Math.PI/2}
 const ab=glowSp(0xff8a30,0,3.2);ab.position.set(0,Y,6.4);b.add(ab);const ab2=glowSp(0x60a0ff,0,1.6);ab2.position.set(0,Y,5.9);b.add(ab2);
 /* weapons: wingtip and underwing missiles, a gun port, a centre fuel tank */const MS=[];for(const p of VEHK[ghost?'ghost':'jet'].msl.pods)MS.push(awMissile(K,b,p[0],p[1],p[2],ghost?.85:1));if(!ghost){const tk=tz(.32,.32,3.2,M(0x9aa0a6,{metalness:.4}),0,.65,.2,b,16);const tn=add(new THREE.ConeGeometry(.32,.7,16),M(0x9aa0a6,{metalness:.4}),0,.65,-1.75,b);tn.rotation.x=-Math.PI/2;add(BX(.06,.35,.5),MT,0,.95,.2,b);for(const sd of[-1,1])for(const x of[2.0,3.2])add(BX(.08,.32,.9),MT,sd*x,1.18,.0,b)}
 add(BX(.12,.08,.3),DK,.8,Y+.2,-4.9,b);
 /* landing gear: nose wheel and two mains, folded away in flight */const gear=Gp(0,0,0,b);const strut=(x,z,h)=>{add(CY(.07,.07,h,8),MT,x,h/2+.2,z,gear);const w=add(CY(.28,.28,.2,16),DK,x,.28,z,gear);w.rotation.z=Math.PI/2;add(CY(.13,.13,.22,10),MT,x,.28,z,gear).rotation.z=Math.PI/2};strut(0,-4.6,Y-.55);strut(1.3,1.2,Y-.6);strut(-1.3,1.2,Y-.6);add(BX(.04,.6,1.0),C2,1.1,.9,1.2,gear);add(BX(.04,.6,1.0),C2,-1.1,.9,1.2,gear);
 /* lights and markings */lite(0x20ff40,ghost?5.6:5.0,Y,2.4,b);lite(0xff2020,ghost?-5.6:-5.0,Y,2.4,b);const beacon=lite(0xff2020,0,Y+.5,1.8,b,1.2);
 for(const sd of[-1,1]){const st=awStar(.5);st.position.set(sd*3.2,Y+.13,1.6);st.rotation.x=-Math.PI/2;b.add(st);const lb=awDecal(ghost?'X-22':'F-9 SABRE',1.6,.3,null,ghost?'#5a5e64':'#e8e4d0');lb.position.set(sd*(ghost?.62:.8),Y+.1,-1.2);lb.rotation.y=sd*Math.PI/2;b.add(lb)}
 const tn=awDecal(ghost?'DARK ARMY':'BLACKOUT 09',1.3,.28,null,ghost?'#4a4e54':'#e8e4d0');tn.position.set(.07,Y+1.6,4.4);tn.rotation.y=Math.PI/2;b.add(tn);
 g.userData.ab=ab;g.userData.ab2=ab2;g.userData.gear=gear;g.userData.msl=MS;g.userData.beacon=beacon;return g}
{const mv0=mkVehModel;mkVehModel=function(k){if(!AW.kinds.includes(k))return mv0.apply(this,arguments);const g=new THREE.Group();g.rotation.order='YXZ';try{if(k=='heli')awHeli(g,0);else if(k=='gunship')awGunship(g);else awJet(g,k=='ghost')}catch(e){conLog('error','aircraft model '+k+': '+e.message)}return g}}
/* ---------------------------------------------------------------- flight ---------------------------------------------------------------- */
const awDown=()=>!!(keys.KeyC||keys.ShiftLeft||keys.ShiftRight||keys.ControlLeft);
function awEdge(q,v,nx,nz,mine){const m=14;let edge=false;if(nx<-DXB+m){nx=-DXB+m;edge=true}if(nx>DXB-m){nx=DXB-m;edge=true}if(nz<DZS+m){nz=DZS+m;edge=true}if(nz>DZN-m){if(milArea(nx,nz,m)){}else if(milArea(v.x,v.z,m)){nx=v.x;nz=Math.min(nz,MILB.z1-m);edge=true}else{nz=DZN-m;edge=true}}if(edge){v.h+=.03;if(mine&&(v.edT=(v.edT||0)-1/60)<=0){v.edT=4;hint('✈️ The sandstorm wall. Nothing flies through that. Turn back.')}}return[nx,nz]}
function heliPhys(q,v,dt,fx,sx,drv,hb){const K=v.K,mine=q.seat&&q.seat.v===v,m=v.m;if(v.wreck){v.v*=Math.max(0,1-dt*2);v.vy-=18*dt;v.y+=v.vy*dt;const g0=vehGround(q,v.x,v.z);if(v.y<=g0){v.y=g0;v.vy=0}return}
 let alDown=false;if(v.al){if(drv&&(fx||sx||hb)&&(v.al.t=(v.al.t||0)+dt)>1){v.al=null;if(mine)hint('🚁 Auto-land off.')}else{v.al.t=(v.al.t||0)+dt;drv=true;fx=0;sx=0;hb=false;const g0=vehGround(q,v.x,v.z),dx=v.sx-v.x,dz=v.sz-v.z,d=Math.hypot(dx,dz);
  /* fly home to the pad you took it from, then settle onto it facing the way it was parked */if(v.al.ph=='home'){const want=Math.atan2(-dx,-dz),dh=wrapA(want-v.h);sx=Math.max(-1,Math.min(1,-dh*2));fx=Math.abs(dh)>.6?0:Math.min(1,d/40);if(v.y-g0<30)hb=true;if(d<3&&Math.abs(v.v)<3){v.al.ph='down'}}else{const dh=wrapA(v.sh-v.h);sx=Math.max(-1,Math.min(1,-dh*2));if(d>.5){v.x+=dx*Math.min(1,dt*1.5);v.z+=dz*Math.min(1,dt*1.5)}alDown=true}}}
 v.rpm=(v.rpm||0)+((drv?1:0)-(v.rpm||0))*Math.min(1,dt*(drv?.7:.35));const gnd=vehGround(q,v.x,v.z),up=drv&&hb,dn=drv&&(awDown()||alDown);
 let tvy=up?K.climb:dn?-K.climb*.75:0;if(!drv)tvy=-5;if(v.rpm<.55&&tvy>0)tvy=0;if(alDown&&v.y-gnd<3)tvy=-1.6;
 v.vy+=(tvy-v.vy)*Math.min(1,dt*2.6);v.y+=v.vy*dt;if(v.y>K.ceil){v.y=K.ceil;v.vy=Math.min(0,v.vy)}
 if(v.y<=gnd){const hard=v.vy<-7;v.y=gnd;if(v.air){v.air=0;if(hard){vehDamage(q,v,(-v.vy-6)*8);snd(70,.5);if(mine)camShake(.6,.4)}else snd(200,.08);if(v.al&&v.al.ph=='down'){v.al=null;v.v=0;if(mine)hint('🚁 Down. Nice and gentle, right where you found it.')}}v.vy=Math.max(0,v.vy)}else if(v.y>gnd+.25)v.air=1;
 const air=v.air,tv=air&&drv?fx*K.max*(fx<0?.45:1):0;v.v+=(tv-v.v)*Math.min(1,dt*(air?.8:4));
 v.str+=((drv?-sx:0)-v.str)*Math.min(1,dt*4);if(v.rpm>.4)v.h+=v.str*K.turn*dt*(air?1:.35);
 let nx=v.x-Math.sin(v.h)*v.v*dt,nz=v.z-Math.cos(v.h)*v.v*dt;[nx,nz]=awEdge(q,v,nx,nz,mine);
 if(v.y-gnd<3.5&&!vehOK(q,v,nx,nz,v.h)&&v.hitO!=='me'){const sp=Math.abs(v.v);v.v*=-.3;if(sp>6){vehDamage(q,v,sp*1.5);snd(90,.3);if(mine)camShake(.5,.3)}}else{v.x=nx;v.z=nz}
 /* nose down going forward, a lean into turns, a little hover wobble */const tp=-(v.v/K.max)*.24+(tv-v.v)*-.004,tb=air?-v.str*.28*Math.min(1,.4+Math.abs(v.v)/12):0;v.pit=(v.pit||0)+(tp-(v.pit||0))*Math.min(1,dt*3);v.bank=(v.bank||0)+(tb+(air?Math.sin(q.rt*1.7)*.012:0)-(v.bank||0))*Math.min(1,dt*3);
 if(air&&v.y-gnd<12&&Math.random()<dt*14*v.rpm)try{const a=Math.random()*6.283,r=3+Math.random()*4;vfx('dust',v.x+Math.cos(a)*r,gnd+.2,v.z+Math.sin(a)*r+q.OZ,{n:2,w:1.5})}catch(e){}
 if(mine&&(v.snT=(v.snT||0)-dt)<=0&&v.rpm>.2){v.snT=.11/(.4+v.rpm);snd(55+v.rpm*25,.05)}}
function jetPhys(q,v,dt,fx,sx,drv,hb,pp0){const K=v.K,mine=q.seat&&q.seat.v===v;if(v.al&&!v.wreck){if(drv&&(fx||sx)&&(v.al.t||0)>1.5){v.al=null;if(mine)hint('✈️ Autoland OFF: you have control.')}else{jetAuto(q,v,dt,mine);return}}if(v.wreck||!v.air){const kk=v.K;v.K=Object.assign({},kk,{acc:kk.acc,max:kk.max});pp0(q,v,dt,fx,sx,drv,hb);v.K=kk;if(v.air&&v.v<K.vmin)v.v=K.vmin+2;return}
 
 const cl=drv?fx:0,boost=drv&&(keys.ShiftLeft||keys.ShiftRight);let tv=cl>0?K.climb:cl<0?-K.climb*1.15:-.8;const gnd=vehGround(q,v.x,v.z);if(v.y-gnd<9&&cl<=0&&tv<-4)tv=-4;v.vy+=(tv-v.vy)*Math.min(1,dt*(v.y-gnd<9?4:2.2));if(v.y>K.ceil&&v.vy>0)v.vy*=Math.max(0,1-dt*3);
 const want=hb?K.vmin:boost?K.vmax:cl<0?K.vcr*1.12:K.vcr;v.v+=(want-v.v)*Math.min(1,dt*(boost?.7:.45));if(v.v<K.vmin)v.v=K.vmin;
 v.str+=((drv?-sx:0)-v.str)*Math.min(1,dt*5);v.h+=v.str*K.turn*(hb?1.25:1)*dt;v.bank+=((-v.str*1.15)-v.bank)*Math.min(1,dt*3.2);v.pit+=(Math.atan2(v.vy,v.v)-v.pit)*Math.min(1,dt*3);
 let nx=v.x-Math.sin(v.h)*v.v*dt,nz=v.z-Math.cos(v.h)*v.v*dt;[nx,nz]=awEdge(q,v,nx,nz,mine);v.x=nx;v.z=nz;v.y+=v.vy*dt;
 const g2=vehGround(q,v.x,v.z);if(v.y<=g2){v.y=g2;const vy=v.vy,hard=vy<-7||Math.abs(v.bank)>.45||v.v>K.vcr*.9;v.air=0;v.vy=0;v.bank=0;v.pit=0;if(hard){vehDamage(q,v,(-vy-5)*9+(v.v>K.vcr*.9?40:10));v.v*=.5;snd(70,.6);snd(110,.3);if(mine){camShake(.9,.6);hint('💥 That was a CONTROLLED FLIGHT INTO TERRAIN. The jet is not happy.')}}else{snd(300,.12);if(mine)hint('✈️ Touchdown. Hold S to brake.')}return}
 if(v.clipT>0)v.clipT-=dt;if(v.y-g2<10&&!(v.clipT>0)&&!vehOK(q,v,v.x,v.z,v.h)&&v.hitO!=='edge'&&v.hitO!=='me'&&!(v.hitO&&v.hitO.K)){v.clipT=3;vehDamage(q,v,30);v.v=Math.max(K.vmin,v.v*.6);snd(90,.4);if(mine){camShake(.6,.4);hint('💥 CLIPPED SOMETHING. Pull up!')}v.hitO=null}
 if(mine&&(v.snT=(v.snT||0)-dt)<=0){v.snT=.25;snd(40+v.v*.6,.3)}}
{const pp0=planePhys;planePhys=function(q,v,dt,fx,sx,drv,hb){const K=v.K;if(K.heli)return heliPhys(q,v,dt,fx,sx,drv,hb);if(K.jet)return jetPhys(q,v,dt,fx,sx,drv,hb,pp0);return pp0.apply(this,arguments)}}
/* L on a helicopter: straight down, gently */{const at0=planeAutoToggle;planeAutoToggle=function(q,v){if(v&&v.K.heli){if(!v.air){hint('🚁 Already on the ground. SPACE to lift off.');return}const far=Math.hypot(v.x-v.sx,v.z-v.sz)>6;v.al=v.al?null:{t:0,ph:far?'home':'down'};hint(v.al?(far?'🚁 Auto-land: flying home to the pad, then down. (Any key to take over.)':'🚁 Auto-land: coming straight down.'):'🚁 Auto-land off.');snd(800,.08);return}return at0.apply(this,arguments)}}
/* ---------------------------------------------------------------- per-frame look ---------------------------------------------------------------- */
function awLook(q,dt){const now=q.rt||0;for(const v of q.vehs){if(!v.K||!(v.K.heli||v.K.jet)||!v.m)continue;const u=v.m.userData,mine=q.seat&&q.seat.v===v;
  if(v.K.heli){const rpm=mine?(v.rpm||0):(v.air?1:Math.max(0,(v.rpm||0)-dt*.3));if(!mine)v.rpm=rpm;if(rpm>.01){if(u.rotor)u.rotor.rotation.y+=dt*rpm*27;if(u.tailR)u.tailR.rotation.x+=dt*rpm*62}}
  if(u.cg&&u.cg.spin){if(u.cg.fT>0){u.cg.fT-=dt;u.cg.spin.rotation.z+=dt*40;u.cg.fl.material.opacity=Math.random()<.6?.9:0}else u.cg.fl.material.opacity=0;if(mine){u.cg.t.rotation.y=Math.max(-1.2,Math.min(1.2,wrapA(P.yaw-v.h)));u.cg.t.children[1]&&(u.cg.t.children[1].rotation.x=Math.max(-.2,Math.min(.6,-P.pitch*.8)))}}
  if(u.ab){const boost=mine&&v.air&&(keys.ShiftLeft||keys.ShiftRight),thr=v.air?(boost?1:.35):Math.min(.4,Math.abs(v.v)/40);u.ab.material.opacity+=((boost?.95:thr*.5)-u.ab.material.opacity)*Math.min(1,dt*6);u.ab.scale.setScalar(2.4+(boost?1.8+Math.random()*.6:thr));u.ab2.material.opacity=thr*.8}
  if(u.gear){const up=v.air&&v.y-vehGround(q,v.x,v.z)>3;u.gear.scale.y+=((up?.02:1)-u.gear.scale.y)*Math.min(1,dt*3);u.gear.visible=u.gear.scale.y>.05}
  if(u.msl){const n=v.msl==null?u.msl.length:v.msl;u.msl.forEach((s,i)=>s.visible=i<n)}
  if(u.beacon)u.beacon.visible=Math.floor(now*1.6+v.id)%2==0}}
/* ---------------------------------------------------------------- weapons ---------------------------------------------------------------- */
function awFire(q,kind){const s=q.seat;if(!s||s.i!=0)return;const v=s.v,K=v.K;if(!(K.heli||K.jet)||v.wreck)return;const W=kind=='msl'?K.msl:K.gun;if(!W)return;q.awCd=q.awCd||{};if((q.awCd[kind]||0)>0)return;
 if(kind=='msl'){if(v.msl==null)v.msl=K.msl.n;if(v.msl<=0){if((q.awNo=(q.awNo||0)-1)<0){q.awNo=6;hint(K.heli?'🚀 Rockets empty. Land to rearm (or wait).':'🚀 Missiles empty. They reload in 20 seconds, or straight away on the ground.')}return}v.msl--;v.mrT=20}
 q.awCd[kind]=W.rof;const m=v.m;m.updateMatrixWorld(true);let o;if(kind=='msl'){const p=W.pods[(q.awPi=(q.awPi||0)+1)%W.pods.length];o=new THREE.Vector3(p[0],p[1],p[2]-1.2)}else o=new THREE.Vector3(...W.from);o.applyMatrix4(m.matrixWorld);if(kind=='gun'&&m.userData.cg&&m.userData.cg.fl){/* straight out of the chin gun's barrels */m.userData.cg.fl.getWorldPosition(o)}o.z-=q.OZ;
 /* aim: the aircraft's nose; on a helicopter the chin gun follows your view */const d=new THREE.Vector3(0,0,-1);if(K.heli&&kind=='gun'){const yaw=v.h+Math.max(-1.2,Math.min(1.2,wrapA(P.yaw-v.h))),pt=Math.max(-.6,Math.min(.2,P.pitch-.12));d.set(-Math.sin(yaw)*Math.cos(pt),Math.sin(pt),-Math.cos(yaw)*Math.cos(pt))}else{d.applyQuaternion(m.quaternion);if(K.heli)d.y-=.12}d.normalize();
 const spd=W.spd+Math.abs(v.v);awShot(q,{x:o.x,y:o.y,z:o.z,vx:d.x*spd,vy:d.y*spd,vz:d.z*spd,k:kind,pw:W.pw,own:v,mine:1},true);
 try{vehNet(q,{k:'aws',x:+o.x.toFixed(2),y:+o.y.toFixed(2),z:+o.z.toFixed(2),vx:+(d.x*spd).toFixed(1),vy:+(d.y*spd).toFixed(1),vz:+(d.z*spd).toFixed(1),kk:kind,pw:W.pw,v:v.id})}catch(e){}
 if(kind=='gun'){if(m.userData.cg)m.userData.cg.fT=.12;if(Math.random()<.5)snd(160+Math.random()*60,.05);if(Math.random()<.3)camShake(.04,.05)}else{snd(300,.2);snd(120,.4);camShake(.12,.15);try{vfx('dust',o.x,o.y,o.z+q.OZ,{n:6,w:.8})}catch(e){}}}
function awShot(q,o,local){const m=new THREE.Group();if(o.k=='msl'){const b=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,1.4,8),VMAT(0xe8e8e0));b.rotation.x=Math.PI/2;m.add(b);const n=new THREE.Mesh(new THREE.ConeGeometry(.09,.3,8),VMAT(0xc02020));n.rotation.x=-Math.PI/2;n.position.z=-.85;m.add(n);const gl=glowSp(0xffa040,.95,1.4);gl.position.z=.8;m.add(gl)}else{const tr=new THREE.Mesh(new THREE.BoxGeometry(.07,.07,2.2),new THREE.MeshBasicMaterial({color:0xffe080}));m.add(tr);const gl=glowSp(0xffc060,.7,.6);m.add(gl)}
 m.position.set(o.x,o.y,o.z);m.lookAt(o.x+o.vx,o.y+o.vy,o.z+o.vz);q.g.add(m);(q.aws=q.aws||[]).push(Object.assign({m,t:0},o))}
function awShotTick(q,dt){if(q.awCd)for(const k in q.awCd)q.awCd[k]-=dt;for(const v of q.vehs)if(v.K&&(v.K.heli||v.K.jet)&&v.msl!=null&&v.msl<v.K.msl.n){if(!v.air){v.mrT=(v.mrT||0)-dt*6}else v.mrT=(v.mrT||0)-dt;if(v.mrT<=0){v.msl=v.K.msl.n;if(q.seat&&q.seat.v===v)hint(v.K.heli?'🚀 Rockets re-armed.':'🚀 Missiles re-armed.')}}
 const L=q.aws;if(!L||!L.length)return;for(let i=L.length-1;i>=0;i--){const s=L[i];s.t+=dt;if(s.k=='gun')s.vy-=4*dt;const steps=Math.max(1,Math.ceil(Math.hypot(s.vx,s.vy,s.vz)*dt/3));let hit=0;
  for(let j=0;j<steps&&!hit;j++){const h=dt/steps;s.x+=s.vx*h;s.y+=s.vy*h;s.z+=s.vz*h;if(s.y<=vehGround(q,s.x,s.z)+.05){hit=1;break}if(s.y<6)for(const o of q.obs){if(o.off)continue;if(s.x>o.x0&&s.x<o.x1&&s.z>o.z0&&s.z<o.z1){hit=1;break}}if(!hit&&s.t>.05)for(const v of vehAll(q)){if(v===s.own||v.wreck)continue;if(Math.abs(s.y-(v.y||0)-1.2)<(v.K.jet?2.2:2.6)&&vehSegD(v,s.x,s.z)<v.r+.3){hit=1;break}}}
  s.m.position.set(s.x,s.y,s.z);if(s.k=='msl'&&Math.random()<dt*50)try{vfx('puff',s.x,s.y,s.z+q.OZ,{n:1,c:0xd0ccc4})}catch(e){}
  if(hit||s.t>(s.k=='msl'?6:1.8)){if(hit){try{boom(q,s.x,Math.max(.3,s.y),s.z,s.mine&&s.local!==false,s.pw,null,1)}catch(e){}if(s.k=='gun')snd(300+Math.random()*200,.04)}if(s.m.parent)s.m.parent.remove(s.m);L.splice(i,1)}}}
addEventListener('mousedown',e=>{if(state!='bus'||e.button!==0)return;const q=BUS.ride;if(q&&q.roam&&q.seat&&q.seat.i==0&&(q.seat.v.K.heli||q.seat.v.K.jet)&&document.pointerLockElement){q.awHold=1;awFire(q,'gun')}});
addEventListener('mouseup',e=>{const q=BUS.ride;if(q)q.awHold=0});
addEventListener('keydown',e=>{if(state!='bus')return;const q=BUS.ride;if(!(q&&q.roam&&q.seat&&q.seat.i==0&&(q.seat.v.K.heli||q.seat.v.K.jet)))return;if(e.code=='KeyF'){q.awHold=1;awFire(q,'gun')}if(e.code=='KeyR'&&!e.repeat)awFire(q,'msl')});
addEventListener('keyup',e=>{if(e.code=='KeyF'){const q=BUS.ride;if(q)q.awHold=0}});
/* other players' shots */{const dn3=desertNet;desertNet=function(o){try{if(o&&o.t=='dz'&&o.k=='aws'){const q=BUS.ride,id=String(o.id||'');if(q&&id&&id!==SV.pid){const v=q.vehs[o.v|0];awShot(q,{x:+o.x,y:+o.y,z:+o.z,vx:+o.vx,vy:+o.vy,vz:+o.vz,k:o.kk=='msl'?'msl':'gun',pw:Math.min(2,+o.pw||1),own:v,mine:0,local:false},false);if(v&&v.m&&v.m.userData.cg&&o.kk!='msl')v.m.userData.cg.fT=.12}return}}catch(e){}return dn3(o)}}
/* ---------------------------------------------------------------- camera and HUD ---------------------------------------------------------------- */
const ACC={off:null,ok:0};
{const pc0=planeCam;planeCam=function(dt){const q=state=='bus'&&BUS.ride;const v=q&&q.roam&&q.seat&&q.seat.v;if(!v||!(v.K.heli||v.K.jet))return pc0.apply(this,arguments);if(!PLN._q)pc0.apply(this,arguments);
 const m=v.m,K=v.K;PLN._e.set(m.rotation.x,m.rotation.y,m.rotation.z,'YXZ');PLN._q2.setFromEuler(PLN._e);const wx=m.position.x,wy=m.position.y,wz=m.position.z+q.OZ,rel=wrapA(P.yaw-v.h);
 if(PLN.cam=='cockpit'){const p=PLN._v.set(...(K.cock||[0,1.8,-1.2])).applyQuaternion(PLN._q2);C.position.set(wx+p.x,wy+p.y,wz+p.z);PLN._e.set(P.pitch,rel,0,'YXZ');PLN._q.setFromEuler(PLN._e);C.quaternion.copy(PLN._q2).multiply(PLN._q);ACC.ok=0;return}
 /* chase: the offset from the aircraft is what gets smoothed, so the camera never lags behind at speed */
 const dist=(K.camD||14)+Math.min(6,Math.abs(v.v)*.05),ang=v.h+rel*.95,pit=Math.max(-.6,Math.min(.95,.2-P.pitch*.85));const want=PLN._v.set(Math.sin(ang)*Math.cos(pit)*dist,(K.camH||2.5)+Math.sin(pit)*dist,Math.cos(ang)*Math.cos(pit)*dist);
 if(!ACC.off){ACC.off=new THREE.Vector3()}if(!ACC.ok){ACC.off.copy(want);ACC.ok=1}else ACC.off.lerp(want,Math.min(1,dt*5));
 C.position.set(wx+ACC.off.x,wy+ACC.off.y,wz+ACC.off.z);const gy=vehGround(q,C.position.x,C.position.z-q.OZ)+1.0;if(C.position.y<gy)C.position.y=gy;
 PLN.cl.set(wx-Math.sin(v.h)*6,wy+(K.heli?1.8:1.5),wz-Math.cos(v.h)*6);C.up.set(0,1,0);C.lookAt(PLN.cl);C.rotateZ((v.bank||0)*(K.jet?.3:.2))}}
const AWH={el:null};
function awHud(q){const v=q&&q.roam&&q.seat&&q.seat.i==0&&q.seat.v;const on=!!(v&&(v.K.heli||v.K.jet));if(!AWH.el){const d=document.createElement('div');d.style.cssText='position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:24;font:bold 14px "Courier New",monospace;color:#9affc0;background:rgba(6,16,10,.62);border:1px solid #3a8a5a;border-radius:8px;padding:5px 12px;pointer-events:none;white-space:nowrap;text-shadow:0 0 4px #000';document.body.appendChild(d);AWH.el=d}
 AWH.el.style.display=on?'block':'none';if(!on)return;const alt=Math.max(0,v.y-vehGround(q,v.x,v.z)),K=v.K,n=v.msl==null?K.msl.n:v.msl;const t=(K.heli?'🚁':'✈️')+' '+Math.round(Math.abs(v.v)*3.6)+' km/h · ALT '+Math.round(alt)+' m · HDG '+String(Math.round(((-v.h*180/Math.PI)%360+360)%360)).padStart(3,'0')+' · 🔫 GUN · 🚀 '+n+'/'+K.msl.n+(v.mrT>0&&n<K.msl.n?' ('+Math.ceil(v.mrT)+'s)':'')+(K.jet&&v.air&&(keys.ShiftLeft||keys.ShiftRight)?' · 🔥 AFTERBURNER':'')+(v.al?' · AUTO':'');if(AWH.el.textContent!==t)AWH.el.textContent=t}
/* entering: a quick reminder of the controls */{const ve1=vehEnter;vehEnter=function(q,v,i){const was=q.seat;const r=ve1.apply(this,arguments);try{if(!was&&q.seat&&q.seat.v===v&&q.seat.i==0&&v.K&&(v.K.heli||v.K.jet)){ACC.ok=0;hint(v.K.heli?'🚁 '+v.K.nm.replace(/^the /,'')+': SPACE lift · C/SHIFT down · W/S forward/back · A/D turn · CLICK/F chin gun · R rockets · V camera · L land':'✈️ '+v.K.nm.replace(/^the /,'')+': hold W down the runway to take off · W climb · S dive · A/D turn · SHIFT afterburner · SPACE airbrake · CLICK/F cannon · R missiles · V camera · L autoland')}}catch(e){}return r}}
/* ---------------------------------------------------------------- the airstrip and the fleet ---------------------------------------------------------------- */
function awBase(q){const M2=q.mil;if(!M2||q.awB)return;q.awB=1;const g=q.g,R=AW.RW,MS=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.95},o||{})),A=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o},BX=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
 const flat=(w,d,m,x,y,z,po)=>{const o=A(new THREE.PlaneGeometry(w,d),m,x,y,z);o.rotation.x=-Math.PI/2;if(po){m.polygonOffset=true;m.polygonOffsetFactor=po;m.polygonOffsetUnits=po}return o};
 /* clear stray cacti, rocks and boulders out of the base and off the airstrip */{const inX=(x,z)=>(x>MILB.x0-2&&x<MILB.x1+2&&z>MILB.z0-2&&z<MILB.z1+2)||(x>R.x0-25&&x<R.x1+25&&z>R.z-R.w/2-12&&z<-928);let n=0;
  for(let i=q.obs.length-1;i>=0;i--){const o=q.obs[i];if(!o.m||!(o.kd=='cactus'||o.kd=='rock'||o.kd=='boulder'))continue;const x=(o.x0+o.x1)/2,z=(o.z0+o.z1)/2;if(inX(x,z)){o.m.visible=false;q.obs.splice(i,1);n++}}
  g.traverse(o=>{if(!o.visible)return;const x=o.position.x,z=o.position.z;if(!inX(x,z))return;if(o.isGroup&&o.children[0]&&o.children[0].material&&o.children[0].material.color&&o.children[0].material.color.getHex()===0x3a7a3a&&o.children[0].geometry&&o.children[0].geometry.type=='CylinderGeometry'){o.visible=false;n++}else if(o.isMesh&&o.geometry&&(o.geometry.type=='DodecahedronGeometry'||o.geometry.type=='IcosahedronGeometry')&&o.parent===g){o.visible=false;n++}});M2.strays=n}
 /* clear the dunes off the strip */g.traverse(o=>{if(!o.isMesh||!o.geometry||o.geometry.type!='SphereGeometry'||o.scale.x<2.5)return;const x=o.position.x,z=o.position.z,r=o.scale.x;if(x+r>R.x0-20&&x-r<R.x1+20&&z+r>R.z-60&&z-r<-928)o.visible=false});
 const L=R.x1-R.x0,cx=(R.x0+R.x1)/2;const asT=penTex('#3a3c40',1200,256);asT.repeat.set(L/8,R.w/8);flat(L,R.w,MS(0xffffff,{map:asT}),cx,.06,R.z,-3);flat(L+20,R.w+16,MS(0x8a8270),cx,.035,R.z,-2);
 const W=MS(0xf0ece0),Yl=MS(0xe8c020);W.polygonOffset=Yl.polygonOffset=true;W.polygonOffsetFactor=W.polygonOffsetUnits=-5;Yl.polygonOffsetFactor=Yl.polygonOffsetUnits=-5;
 for(let x=R.x0+40;x<R.x1-40;x+=14)flat(7,.5,W,x,.08,R.z);for(const sd of[-1,1])flat(L,.4,W,cx,.08,R.z+sd*(R.w/2-1));
 for(const end of[R.x0+8,R.x1-8])for(let i=0;i<8;i++)flat(1.2,8,W,end,.08,R.z-R.w/2+3+i*3.4+(i>3?2:0));
 const num=(t,x,rot)=>{const c=document.createElement('canvas');c.width=256;c.height=128;const k=c.getContext('2d');k.fillStyle='#f0ece0';k.font='bold 110px Arial';k.textAlign='center';k.textBaseline='middle';k.fillText(t,128,68);const mt=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6});const o=flat(10,5,mt,x,.085,R.z);o.rotation.z=rot};num('27',R.x0+22,-Math.PI/2);num('09',R.x1-22,Math.PI/2);
 /* edge lights along both sides, green at the ends */for(let x=R.x0;x<=R.x1;x+=20)for(const sd of[-1,1]){const end=x<R.x0+5||x>R.x1-5;A(BX(.25,.25,.25),new THREE.MeshStandardMaterial({color:end?0x20ff60:0xfff0c0,emissive:end?0x10c040:0xffe0a0}),x,.14,R.z+sd*(R.w/2+1.5))}
 /* the apron by the gate road, three hardened shelters, a control tower, a windsock */
 flat(110,24,MS(0xffffff,{map:(()=>{const t=penTex('#4a4c50',900,256);t.repeat.set(12,3);return t})()}),458,.06,-952,-3);flat(12,46,MS(0x4a4c50),520,.058,-956,-3);
 /* r616: the hardened shelters (fbShelter) and the control tower (fbTower), from dx614 */for(let i=0;i<3;i++){const sx=418+i*30;for(const o of fbShelter(g,sx,i+1).obs)q.obs.push(o)}
 {const tx=545,tz=-944;const T=fbTower(g,tx,tz);for(const o of T.obs)q.obs.push(o);const bc=glowSp(0xff2020,.9,1.2);bc.position.set(...T.beacon);g.add(bc)}
 {const wx=R.x1+10,wz=R.z-R.w/2-6;A(new THREE.CylinderGeometry(.08,.1,6,8),MS(0xd0d0d0),wx,3,wz);const ws=A(new THREE.ConeGeometry(.6,2.6,12,1,true),new THREE.MeshStandardMaterial({color:0xff6a20,side:THREE.DoubleSide}),wx+1.3,5.8,wz);ws.rotation.z=Math.PI/2;q.anims.push(dt=>{ws.rotation.x=Math.sin((q.rt||0)*1.3)*.2})}
 {const s=dsSign('FORT BLACKOUT AIRSTRIP · RUNWAY 09/27\nMAJORS AND ABOVE FLY · EVERYONE ELSE WATCHES','#20261c','#e8f0d0');s.position.set(R.x1-14,0,-938);s.rotation.y=Math.PI;g.add(s)}
 /* the fleet */const mv=(k,x,z,h,r)=>{const v=q.addVeh(k,x,z,h);v.mil=r;v.mk=k;v.nogar=1;return v};
 for(let i=0;i<3;i++)mv('jet',418+i*30,-950,0,7);mv('ghost',395,-960,-Math.PI/2,8);mv('gunship',500,-955,-Math.PI/2,6);
 q.locs.push({nm:'Fort Blackout Airstrip',x:cx,z:R.z,ic:'🛫'});/* on the map too */try{q.mapR.push({x0:R.x0,x1:R.x1,z0:R.z-R.w/2,z1:R.z+R.w/2,c:'#3a3c40'},{x0:403,x1:513,z0:-964,z1:-940,c:'#4a4c50'},{x0:514,x1:526,z0:-979,z1:-933,c:'#4a4c50'});for(let i=0;i<3;i++)q.mapR.push({x0:409+i*30,x1:427+i*30,z0:-957,z1:-935,c:'#7a7c74'});q.mapR.push({x0:543,x1:547,z0:-946,z1:-942,c:'#8a8c84'});q.mapBg=null;if(typeof DMAP!=='undefined'){DMAP.bgDirty=1}}catch(e){}q.obsDirty=1}
/* the helipad: the parked prop is swapped for the real thing */
function awPad(q){const M2=q.mil;if(!M2||q.awP)return;q.awP=1;let old=null;q.g.traverse(o=>{if(!old&&o.userData&&o.userData.rotor&&o.userData.tail&&Math.hypot(o.position.x-582,o.position.z+848)<3)old=o});if(old){old.visible=false;for(let i=q.obs.length-1;i>=0;i--){const o=q.obs[i];if(o.x0<=579.9&&o.x1>=584&&o.z0<=-857&&o.z1>=-844)q.obs.splice(i,1)}q.obsDirty=1;q.obsDirty=1}
 const v=q.addVeh('heli',582,-848,-.4);v.mil=5;v.mk='heli';v.nogar=1}
setInterval(()=>{try{const q=BUS.ride;if(!q||!q.roam||!q.mil||!q.addVeh)return;awBase(q);awPad(q)}catch(e){conLog('error','air wing: '+e.message)}},1000);
setInterval(()=>{try{awHud(state=='bus'&&BUS.ride)}catch(e){}},150);
/* the per-frame bits ride along with the desert's own update */{const vr0=vehRender;vehRender=function(q,v,dt){const r=vr0.apply(this,arguments);try{if(v.spin&&!v.K.plane){const g=vehGround(q,v.x,v.z);if(v.y<=g+.15){v.spT=(v.spT||0)+dt;if(v.spT>.6){v.spin=0;v.air=0;v.spT=0}}else v.spT=0}}catch(e){}return r}}
{let last=performance.now();const tick=()=>{requestAnimationFrame(tick);const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;try{const q=BUS.ride;if(state=='bus'&&q&&q.roam&&q.vehs){awLook(q,dt);awShotTick(q,dt);if(q.awHold){const s=q.seat;if(s&&s.v.K&&(s.v.K.heli||s.v.K.jet))awFire(q,'gun');else q.awHold=0}}}catch(e){}};requestAnimationFrame(tick)}

/* phones and tablets: lift / descend / gun / missile buttons while you fly */
const AWB={el:null};function awBtns(){const q=state=='bus'&&BUS.ride,v=q&&q.roam&&q.seat&&q.seat.i==0&&q.seat.v,on=!!(MOB&&MOB.on&&v&&(v.K.heli||v.K.jet));
 if(!AWB.el){const d=document.createElement('div');d.style.cssText='position:fixed;right:14px;bottom:calc(210px + env(safe-area-inset-bottom,0px));z-index:31;display:none;flex-direction:column;gap:8px';const mk=(t,down,up)=>{const b=document.createElement('button');b.textContent=t;b.style.cssText='width:64px;height:52px;border-radius:12px;border:2px solid #6ad89a;background:rgba(10,30,20,.8);color:#e8ffe8;font:bold 20px Georgia;touch-action:none';b.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();down()},{passive:false});b.addEventListener('touchend',e=>{e.preventDefault();up&&up()});d.appendChild(b);return b};
  AWB.up=mk('⬆',()=>{keys.Space=1},()=>{keys.Space=0});AWB.dn=mk('⬇',()=>{keys.KeyC=1},()=>{keys.KeyC=0});mk('🔫',()=>{const q2=BUS.ride;if(q2){q2.awHold=1;awFire(q2,'gun')}},()=>{const q2=BUS.ride;if(q2)q2.awHold=0});mk('🚀',()=>{const q2=BUS.ride;if(q2)awFire(q2,'msl')});AWB.ab=mk('🔥',()=>{keys.ShiftLeft=1},()=>{keys.ShiftLeft=0});document.body.appendChild(d);AWB.el=d}
 AWB.el.style.display=on?'flex':'none';if(on){AWB.up.style.display=v.K.heli?'block':'none';AWB.dn.style.display=v.K.heli?'block':'none';AWB.ab.style.display=v.K.jet?'block':'none'}}
setInterval(()=>{try{awBtns()}catch(e){}},300);

/* ---- jets: L flies the approach to the Fort Blackout airstrip, lands, and taxis back to where you found it ---- */
function jetAuto(q,v,dt,mine){const A=v.al,R=AW.RW,K=v.K;A.t=(A.t||0)+dt;const g0=vehGround(q,v.x,v.z);const steer=(tx,tz,rate)=>{const want=Math.atan2(-(tx-v.x),-(tz-v.z)),dh=wrapA(want-v.h);const tr=Math.max(-K.turn*.8,Math.min(K.turn*.8,dh*(rate||1.5)));v.h+=tr*dt;v.str=-tr/K.turn;return dh};
 const fly=(sp,alt)=>{v.v+=(sp-v.v)*Math.min(1,dt*.6);const vy=Math.max(-14,Math.min(14,(alt-v.y)*.8));v.vy+=(vy-v.vy)*Math.min(1,dt*2);v.y+=v.vy*dt;v.x-=Math.sin(v.h)*v.v*dt;v.z-=Math.cos(v.h)*v.v*dt;v.pit+=(Math.atan2(v.vy,Math.max(10,v.v))-v.pit)*Math.min(1,dt*3);v.bank+=((-v.str*1.0)-v.bank)*Math.min(1,dt*3)};
 const FX=R.x0-380,TD=R.x0+35;
 if(!A.ph)A.ph=v.air?'fix':'taxi';
 if(A.ph=='fix'){steer(FX,R.z);fly(K.vcr*.8,80);if(Math.hypot(v.x-FX,v.z-R.z)<70)A.ph='turn'}
 else if(A.ph=='turn'){const dh=steer(TD+200,R.z,2);fly(70,70);if(Math.abs(dh)<.08&&Math.abs(v.z-R.z)<20)A.ph='final'}
 else if(A.ph=='final'){steer(R.x1,R.z,2.5);const dist=TD-v.x,alt=Math.max(0,Math.min(70,dist*.14));fly(dist>150?60:46,g0+alt);if(dist<0||v.y<=g0+.3){v.y=g0;v.vy=0;v.air=0;v.pit=0;v.bank=0;A.ph='roll';snd(300,.12);if(mine)hint('✈️ Touchdown on runway 09. Braking.')}}
 else if(A.ph=='roll'){v.y=g0;v.v=Math.max(0,v.v-12*dt);steer(R.x1,R.z,2);v.x-=Math.sin(v.h)*v.v*dt;v.z-=Math.cos(v.h)*v.v*dt;v.bank*=.9;if(v.v<7)A.ph='taxi'}
 else if(A.ph=='taxi'){v.y=g0;v.air=0;const wps=[[v.sx,R.z],[v.sx,v.sz]];A.wi=A.wi||0;if(Math.abs(v.z-R.z)>R.w/2+2&&A.wi==0&&Math.abs(v.x-v.sx)>8)A.wi=0;const w=wps[Math.min(A.wi,1)],d=Math.hypot(w[0]-v.x,w[1]-v.z);
  if(d<2.5){if(A.wi==0)A.wi=1;else{const dh=wrapA(v.sh-v.h);v.h+=Math.max(-.8,Math.min(.8,dh*2))*dt;v.v=0;if(Math.abs(dh)<.03){v.h=v.sh;v.al=null;if(mine)hint('✈️ Parked, right where you found it. Nice flying.');snd(500,.08)}return}}
  steer(w[0],w[1],2.5);v.v+=(Math.min(8,d)-v.v)*Math.min(1,dt*1.5);v.x-=Math.sin(v.h)*v.v*dt;v.z-=Math.cos(v.h)*v.v*dt;v.bank*=.9;v.pit*=.9}}
{const at1=planeAutoToggle;planeAutoToggle=function(q,v){if(v&&v.K.jet){if(v.al){v.al=null;hint('✈️ Autoland OFF. You have control.');snd(500,.08);return}v.al={t:0};snd(800,.08);setTimeout(()=>snd(1000,.08),120);hint(v.air?'🛬 AUTOLAND: approach from the west, down onto runway 09 at Fort Blackout, then taxi back to your spot. (Steer to take over.)':'🛬 AUTO-TAXI: back to where you found it.');return}return at1.apply(this,arguments)}}
