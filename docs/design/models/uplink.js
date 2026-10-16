/* =====================================================================================================
   mkUplink(): the THUNDERBOLT orbital strike uplink at Radar Station 13. A concrete pad with a steerable satellite
   dish, an operator console (live screen, keyboard, key switch, guarded FIRE button, status lamps), an equipment
   rack with a beacon on top, and a warning sign. Replaces the black box and the disc in xsBuild (dx552).

   SIZE      Pad 4.0 m (x) × 3.6 m (z). Dish up to 3.0 m high. Rack 2.15 m with its beacon.
   ORIGIN    Centre of the pad, on the ground (the pad is 0.15 m thick, its top is y = 0.15).
   FRONT     -z = where the operator stands (in front of the console). The dish and rack are behind and beside it.
             In the game: place at x 447, z -693.6, rotation.y = Math.PI (operator faces the radar building, dish on the
             building side; the pad's back edge then sits 0.3 m in front of the building at z -695.5).
             The [E] prompt: local (-0.5, -1.4), i.e. world (447.5, -692.2) with that placement.
   PARTS     g.userData.parts:
             az      Group, dish azimuth. Pivot local (1.2, 1.35, 0.85). rotation.y.
                     The dish rim (1.1 m) can't reach the console or the rack at any angle.
             el      Group inside az, dish elevation. Pivot 0.45 above az. rotation.x = -(PI/2 - elevation).
             beacon  Group on top of the rack. rotation.y spins it.
             cover   Group, the flip cover over the FIRE button. rotation.x: 0 shut … 1.9 open.
             key     Mesh, the key in the key switch. rotation.y: 0 off … 1.2 on.
             screen  Mesh with a CanvasTexture (redrawn by update()).
   USE       g.userData.setState(s, info)   s = 'locked' | 'ready' | 'charging' | 'aim' | 'fire'
                 info: for 'charging' the seconds left; for 'aim' {x, z, nm} of the target (for the screen text) and
                 optionally {az, el} in radians (local) to slew the dish to.
             g.userData.update(dt)          call every frame while the player is within ~60 m (dish slew, beacon,
                                             screen at 10 fps, LEDs). Skip it when far away: nothing breaks.
   ANIMATION (suggested, with the existing xsPick / xsOrbital flow)
             Not Field Marshal: 'locked' (key off, red lamp, red screen).
             Field Marshal, ready: 'ready' (key on, green lamp, dish parked looking straight up, slow sweep on screen).
             While picking a target: 'aim' with the target; the dish turns towards it (az from atan2 of the direction,
             el 35–70° by distance). Fire: 'fire' for 4 s (cover flips open, white screen, beacon fast), then
             'charging' with the cooldown seconds until 0, then 'ready'.
   COLLISION Pad is walkable (0.15 step). Boxes (local, before rotation):
               console  x -1.25 … 0.25,  z -1.0 … -0.05
               rack     x -1.85 … -1.25, z 0.0 … 0.6
               dish     x 0.85 … 1.55,   z 0.5 … 1.2     (the pedestal; the dish itself is overhead)
               sign     0.1 × 0.1 at (1.6, -1.5)
   ===================================================================================================== */
function mkUplink(){
 const g=new THREE.Group();
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6,metalness:.3},o||{}));
 const con=M(0x8a8a84,{roughness:1,metalness:0}),olive=M(0x4a5236,{roughness:.7}),oliveD=M(0x343a26,{roughness:.7}),dark=M(0x1c1f22,{roughness:.5,metalness:.5}),
  steel=M(0x8a9096,{metalness:.7,roughness:.35}),white=M(0xe8e8e2,{roughness:.45,metalness:.1,side:THREE.DoubleSide});
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const CY=(r1,r2,h,m,x,y,z,p,s)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,s||16),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const beam=(a,b,t,m,p)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(t,t,d.length(),6),m);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());(p||g).add(o);return o};
 const cv=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)};
 const FONT='"Barlow Semi Condensed",DoorsSans,Arial,sans-serif';
 const parts={};

 /* ---------- the pad ---------- */
 {const t=cv(256,256,(x,w,h)=>{x.fillStyle='#8a8a84';x.fillRect(0,0,w,h);for(let i=0;i<1400;i++){const v=110+Math.random()*60|0;x.fillStyle='rgba('+v+','+v+','+(v-6)+',.35)';x.fillRect(Math.random()*w,Math.random()*h,2,2)}x.strokeStyle='rgba(40,40,36,.5)';x.lineWidth=2;x.strokeRect(1,1,w-2,h-2)});
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,1.8);/* 2 m tiles with a joint line, 4.0 × 3.6 m */
  BX(4,.15,3.6,[con,con,M(0x9a9a94,{map:t,roughness:1,metalness:0}),con,con,con],0,.075,0)}
 /* hazard plate under the dish */
 {const t=cv(256,256,(x,w,h)=>{x.fillStyle='#e0b020';x.fillRect(0,0,w,h);x.fillStyle='#1a1a1a';for(let i=-h;i<w;i+=48){x.beginPath();x.moveTo(i,h);x.lineTo(i+24,h);x.lineTo(i+24+h,0);x.lineTo(i+h,0);x.fill()}x.fillStyle='#5a5a54';x.fillRect(40,40,w-80,h-80)});
  BX(1.1,.02,1.1,[oliveD,oliveD,M(0xffffff,{map:t,roughness:.8,metalness:0}),oliveD,oliveD,oliveD],1.2,.16,.85)}

 /* ---------- the dish ---------- */
 CY(.22,.28,1.2,olive,1.2,.75,.85);CY(.34,.34,.06,oliveD,1.2,.18,.85);/* pedestal and its base flange */
 for(let i=0;i<6;i++){const a=i/6*6.283;CY(.025,.025,.05,steel,1.2+Math.cos(a)*.29,.22,.85+Math.sin(a)*.29,null,6)}/* bolts */
 const az=new THREE.Group();az.position.set(1.2,1.35,.85);g.add(az);parts.az=az;
 CY(.3,.3,.15,oliveD,0,.075,0,az);
 for(const sx of[-1,1]){BX(.08,.45,.18,olive,sx*.5,.375,0,az);CY(.07,.07,.12,steel,sx*.5,.45,0,az).rotation.z=Math.PI/2}
 BX(1.08,.1,.18,olive,0,.15,0,az);/* the yoke's cross piece */
 const el=new THREE.Group();el.position.y=.45;az.add(el);parts.el=el;
 CY(.06,.06,1.1,steel,0,0,0,el).rotation.z=Math.PI/2;/* elevation axle */
 {const F=.75,R=1.1,pts=[];for(let i=0;i<=16;i++){const r=R*i/16;pts.push(new THREE.Vector2(r,.05+r*r/(4*F)))}
  const dish=new THREE.Mesh(new THREE.LatheGeometry(pts,36),white);el.add(dish);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(R,.025,6,48),M(0xc8c8c0,{roughness:.5}));rim.rotation.x=Math.PI/2;rim.position.y=.05+R*R/(4*F);el.add(rim);
  CY(.16,.12,.14,oliveD,0,.02,0,el);/* hub */
  const fy=.05+F;const horn=CY(.06,.1,.22,dark,0,fy-.02,0,el);/* the feed horn at the focus */CY(.11,.11,.03,M(0xc02a1e),0,fy+.1,0,el);
  for(let i=0;i<3;i++){const a=i/3*6.283+.5;beam([Math.cos(a)*R*.95,.05+(R*.95)**2/(4*F),Math.sin(a)*R*.95],[0,fy+.05,0],.015,steel,el)}}

 /* ---------- the console ---------- */
 BX(1.4,.8,.9,olive,-.5,.55,-.5);/* base cabinet: x -1.2 … 0.2, z -0.95 … -0.05, top 0.95 (runs under the screen housing) */
 for(const sx of[-1,1])BX(.02,.5,.4,oliveD,-.5+sx*.4,.5,-.951);/* two door panel lines (front) */
 BX(1.36,.12,.02,dark,-.5,.22,-.96);/* kick plate */
 /* the sloped desk: a wedge under it so there is no gap at the sides */
 {const sh=new THREE.Shape();sh.moveTo(-.95,.95);sh.lineTo(-.35,.95);sh.lineTo(-.35,1.115);sh.lineTo(-.95,.95);
  const w=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:1.4,bevelEnabled:false}),olive);w.rotation.y=-Math.PI/2;w.position.x=.2;g.add(w)}
 const a=Math.atan2(.17,.65),L=Math.hypot(.65,.17);
 const desk=new THREE.Group();desk.position.set(-.5,(.95+1.12)/2+.025,-.675);desk.rotation.x=-a;g.add(desk);
 BX(1.46,.05,L+.04,oliveD,0,-.0,0,desk);/* desk slab; its top is the desk group's y = 0.025 */
 const S=.025;
 /* keyboard */{const t=cv(384,128,(x,w,h)=>{x.fillStyle='#202326';x.fillRect(0,0,w,h);x.fillStyle='#4a5056';for(let r=0;r<4;r++)for(let c=0;c<12;c++)x.fillRect(8+c*31+(r%2)*8,8+r*30,26,24);x.fillRect(80,8+4*30-4,200,0)});
  BX(.6,.03,.2,[dark,dark,M(0xffffff,{map:t,roughness:.6}),dark,dark,dark],-.3,S+.015,-.08,desk)}
 /* key switch */CY(.04,.04,.02,steel,.12,S+.01,-.05,desk,12);{const k=BX(.012,.025,.05,M(0xd8b040,{metalness:.8,roughness:.3}),.12,S+.03,-.05,desk);parts.key=k}
 /* the FIRE button and its flip cover */
 CY(.08,.08,.03,M(0xe0b020),.42,S+.015,-.05,desk,20);
 const btnM=M(0xd02020,{emissive:0x600000,emissiveIntensity:.6,roughness:.3});CY(.05,.055,.05,btnM,.42,S+.055,-.05,desk,20);
 {const cvr=new THREE.Group();cvr.position.set(.42,S+.03,.06);desk.add(cvr);parts.cover=cvr;
  const cm=new THREE.MeshStandardMaterial({color:0xff6040,transparent:true,opacity:.45,roughness:.1,depthWrite:false});BX(.2,.01,.22,cm,0,.1,-.11,cvr);for(const sx of[-1,1])BX(.01,.09,.22,cm,sx*.095,.05,-.11,cvr);BX(.18,.09,.01,cm,0,.05,-.215,cvr);BX(.2,.012,.02,steel,0,.006,0,cvr)}
 /* status lamps along the back of the desk: LOCKED red, CHARGING amber, READY green */
 const lampC=[0xff3020,0xffa020,0x30ff60],lamps=lampC.map((c,i)=>{const m=new THREE.MeshStandardMaterial({color:0x222222,emissive:c,emissiveIntensity:.08,roughness:.3});CY(.025,.025,.02,dark,-.55+i*.12,S+.01,.22,desk,12);const l=new THREE.Mesh(new THREE.SphereGeometry(.022,10,6,0,6.283,0,1.6),m);l.position.set(-.55+i*.12,S+.02,.22);desk.add(l);return m});
 /* little printed labels under the lamps */{const t=cv(256,32,(x,w,h)=>{x.fillStyle='#343a26';x.fillRect(0,0,w,h);x.fillStyle='#d8d8c0';x.font='bold 18px '+FONT;x.textAlign='center';['READY','CHRG','LOCK'].forEach((s,i)=>x.fillText(s,40+i*85,23,80))});
  const pg=new THREE.PlaneGeometry(.36,.045);pg.rotateZ(Math.PI);/* text reads from the operator's side */const pl=new THREE.Mesh(pg,M(0xffffff,{map:t,roughness:.8}));pl.rotation.x=-Math.PI/2;pl.position.set(-.43,S+.002,.27);desk.add(pl)}
 /* the screen housing and the screen */
 BX(1.4,.96,.3,olive,-.5,1.43,-.2);BX(1.5,.05,.38,oliveD,-.5,1.935,-.26);/* housing and its hood */
 BX(1.28,.7,.02,dark,-.5,1.53,-.355);/* bezel */
 const sc=document.createElement('canvas');sc.width=512;sc.height=264;const sx=sc.getContext('2d');const stex=new THREE.CanvasTexture(sc);
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.62),new THREE.MeshBasicMaterial({map:stex}));screen.rotation.y=Math.PI;screen.position.set(-.5,1.53,-.367);g.add(screen);parts.screen=screen;
 /* a cable from the console to the rack, and a conduit from the rack to the dish */
 BX(.1,.06,1.0,dark,-1.25,.18,-.35+.15);/* conduit: rack → along the pad → round the hazard plate → up into a junction box on the dish pedestal */
 BX(1.89,.08,.12,dark,-.31,.19,.48);BX(.12,.08,.49,dark,.62,.19,.665);BX(.32,.08,.12,dark,.8,.19,.85);
 BX(.12,.33,.12,dark,.9,.315,.85);BX(.12,.26,.22,oliveD,.98,.52,.85);CY(.02,.02,.04,steel,.98,.67,.85,null,6);

 /* ---------- the rack ---------- */
 BX(.6,1.9,.6,oliveD,-1.55,1.1,.3);
 {const t=cv(128,384,(x,w,h)=>{x.fillStyle='#15181a';x.fillRect(0,0,w,h);for(let r=0;r<8;r++){const y=8+r*46;x.fillStyle='#2a2e32';x.fillRect(6,y,w-12,40);x.fillStyle='#0a0c0e';x.fillRect(12,y+26,70,6);
   for(let k=0;k<5;k++){x.fillStyle=['#30ff60','#ffa020','#30ff60','#40a0ff','#ff3020'][(r+k)%5];x.fillRect(12+k*12,y+8,6,6)}}});
  const lm=new THREE.MeshStandardMaterial({color:0xffffff,map:t,emissiveMap:t,emissive:0xffffff,emissiveIntensity:.7,roughness:.5});parts.ledMat=lm;
  const p=new THREE.Mesh(new THREE.PlaneGeometry(.5,1.5),lm);p.rotation.y=Math.PI;p.position.set(-1.55,1.15,-.002);g.add(p)}
 for(const sy of[.17,2.07])BX(.62,.04,.62,dark,-1.55,sy,.3);/* top and bottom trims */
 {CY(.1,.12,.08,dark,-1.55,2.13,.3);const bm=new THREE.MeshStandardMaterial({color:0xff4020,emissive:0xff2000,emissiveIntensity:.5,transparent:true,opacity:.85,roughness:.2});CY(.09,.09,.14,bm,-1.55,2.24,.3);
  const bc=new THREE.Group();bc.position.set(-1.55,2.24,.3);g.add(bc);parts.beacon=bc;BX(.02,.1,.09,steel,0,0,.0,bc).position.x=.03;parts.beaconMat=bm}

 /* ---------- the sign ---------- */
 BX(.08,1.7,.08,steel,1.6,1.0,-1.5);
 {const t=cv(512,284,(x,w,h)=>{x.fillStyle='#e0b020';x.fillRect(0,0,w,h);x.fillStyle='#1a1a1a';x.fillRect(14,14,w-28,h-28);x.fillStyle='#e0b020';x.fillRect(22,22,w-44,64);x.fillStyle='#1a1a1a';x.textAlign='center';x.textBaseline='middle';x.font='bold 46px '+FONT;x.fillText('⚠ DANGER',w/2,55,w-80);
   x.fillStyle='#f0e8d0';x.font='bold 48px '+FONT;x.fillText('THUNDERBOLT UPLINK',w/2,130,w-60);x.font='600 32px '+FONT;x.fillText('ORBITAL STRIKE CONTROL',w/2,180,w-60);x.fillStyle='#e0b020';x.fillText('FIELD MARSHAL ONLY',w/2,228,w-60)});
  BX(.9,.5,.04,[steel,steel,steel,steel,steel,M(0xffffff,{map:t,roughness:.7})],1.6,1.6,-1.54)}

 /* ---------- state and animation ---------- */
 const st={s:'ready',info:null,t:0,scrT:0,az:0,el:Math.PI/2,taz:0,tel:Math.PI/2,fireT:0};
 function draw(){const x=sx,w=512,h=264,t=st.t,s=st.s;const col=s=='locked'?'#ff4030':s=='charging'?'#ffb030':s=='fire'?'#ffffff':'#40ff80';
  x.fillStyle=s=='fire'?(Math.sin(t*30)>0?'#e8f0ff':'#a0c0ff'):'#03140c';x.fillRect(0,0,w,h);
  if(s!='fire'){x.strokeStyle='rgba(64,255,128,.12)';x.lineWidth=1;for(let i=0;i<w;i+=32){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke()}for(let i=0;i<h;i+=32){x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke()}}
  x.fillStyle=s=='fire'?'#203050':col;x.fillRect(0,0,w,30);x.fillStyle=s=='fire'?'#e8f0ff':'#03140c';x.font='bold 20px '+FONT;x.textBaseline='middle';x.textAlign='left';x.fillText('THUNDERBOLT · ORBITAL UPLINK',10,16);x.textAlign='right';x.fillText('RS-13',w-10,16);
  if(s=='fire'){x.fillStyle='#203050';x.textAlign='center';x.font='bold 64px '+FONT;x.fillText('FIRING',w/2,150);return}
  /* the orbit diagram on the left */const cx=120,cy=230,R=150;x.strokeStyle=col;x.globalAlpha=.5;x.lineWidth=2;x.beginPath();x.arc(cx,cy+60,110,Math.PI*1.15,Math.PI*1.85);x.stroke();x.setLineDash([4,6]);x.beginPath();x.arc(cx,cy+60,R,Math.PI*1.1,Math.PI*1.9);x.stroke();x.setLineDash([]);x.globalAlpha=1;
  const sa=Math.PI*(1.15+.7*((t*.05)%1));x.fillStyle=col;x.beginPath();x.arc(cx+Math.cos(sa)*R,cy+60+Math.sin(sa)*R,6,0,7);x.fill();x.font='14px '+FONT;x.textAlign='center';x.fillText('SAT-9 THUNDERBOLT',cx,58);
  /* the status block on the right */x.textAlign='left';x.fillStyle=col;const L=(y,sz,txt,wt)=>{x.font=(wt||'bold')+' '+sz+'px '+FONT;x.fillText(txt,262,y,240)};
  if(s=='locked'){L(78,30,'UPLINK LOCKED');L(112,18,'Field Marshal authorisation','600');L(136,18,'required.','600');if(Math.sin(t*4)>0){x.strokeStyle=col;x.lineWidth=3;x.strokeRect(256,56,244,40)}}
  else if(s=='charging'){const sec=Math.max(0,Math.ceil(+st.info||0));L(78,30,'RECHARGING');L(118,40,Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'));x.strokeStyle=col;x.lineWidth=2;x.strokeRect(262,140,230,18);x.fillRect(264,142,226*(1-Math.min(1,sec/300)),14)}
  else if(s=='aim'){const T=st.info||{};L(78,30,'TARGET LOCKED');L(112,18,(T.nm||'GRID')+'','600');L(136,18,'X '+Math.round(T.x||0)+'   Z '+Math.round(T.z||0),'600');L(176,22,Math.sin(t*6)>0?'▶ CONFIRM TO FIRE':'');
   x.strokeStyle=col;x.lineWidth=2;const px=440,py=205;x.beginPath();x.arc(px,py,22,0,7);x.moveTo(px-34,py);x.lineTo(px+34,py);x.moveTo(px,py-34);x.lineTo(px,py+34);x.stroke()}
  else{L(78,30,'READY');L(112,18,'Select a target on the map.','600');const sw=(t*1.5)%6.283;x.strokeStyle=col;x.globalAlpha=.8;x.beginPath();x.arc(440,200,40,0,7);x.moveTo(440,200);x.lineTo(440+Math.cos(sw)*40,200+Math.sin(sw)*40);x.stroke();x.globalAlpha=1}
  x.fillStyle='rgba(0,0,0,.18)';for(let i=0;i<h;i+=3)x.fillRect(0,i,w,1);/* scan lines */}
 function setState(s,info){st.s=s;st.info=info;st.t=0;
  lamps[0].emissiveIntensity=s=='locked'?1.6:.08;lamps[1].emissiveIntensity=s=='charging'?1.6:.08;lamps[2].emissiveIntensity=s=='ready'||s=='aim'?1.6:.08;
  parts.key.rotation.y=s=='locked'?0:1.2;
  if(s=='aim'&&info&&info.az!=null){st.taz=info.az;st.tel=Math.PI/2-(info.el!=null?info.el:1)}
  if(s=='ready'||s=='locked'){st.taz=st.az;st.tel=0}/* park: straight up */
  if(s=='fire')st.fireT=0;draw();stex.needsUpdate=true}
 function update(dt){st.t+=dt;
  /* the dish slews at 40°/s */const step=.7*dt,mv=(c,tg)=>c+Math.max(-step,Math.min(step,Math.atan2(Math.sin(tg-c),Math.cos(tg-c))));st.az=mv(st.az,st.taz);st.el=mv(st.el,st.tel);az.rotation.y=st.az;el.rotation.x=-st.el;
  parts.beacon.rotation.y+=dt*(st.s=='fire'?18:st.s=='locked'?0:4);parts.beaconMat.emissiveIntensity=st.s=='locked'?.2:st.s=='fire'?2:.6+.5*Math.max(0,Math.sin(st.t*8));
  parts.cover.rotation.x+=((st.s=='fire'||st.s=='aim'?1.9:0)-parts.cover.rotation.x)*Math.min(1,dt*6);
  btnM.emissiveIntensity=st.s=='aim'?.6+.8*Math.max(0,Math.sin(st.t*8)):st.s=='fire'?2:.3;
  parts.ledMat.emissiveIntensity=.55+.25*Math.sin(st.t*13)*Math.sin(st.t*7.3);
  if((st.scrT-=dt)<=0){st.scrT=.1;draw();stex.needsUpdate=true}}
 g.userData.parts=parts;g.userData.setState=setState;g.userData.update=update;
 st.tel=0;st.el=0;el.rotation.x=0;setState('ready');
 return g}
