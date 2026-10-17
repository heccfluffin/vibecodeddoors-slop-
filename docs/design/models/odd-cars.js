/* =====================================================================================================
   mkOddCar(kind, colour): five odd ones. Replaces the 'hearse', 'limo', 'rally', 'tractor' and 'icecream' branches
   of mkVehModel (bak519).
     'hearse'    DARK & SONS: long black hearse, curtained rear windows, chrome landau bars, a coffin inside
     'limo'      the stretch limo: black, tinted windows, three rows of seats, a drinks cabinet, chrome everywhere
     'rally'     the rally car (no. 13): hatchback, blue with stripes, roll cage, bucket seats, bonnet light pod,
                 roof scoop, spoiler, mud flaps, wide arches
     'tractor'   the green tractor: long bonnet with a grille, exhaust stack, big lugged rear tyres with yellow rims,
                 yellow mudguards, platform, seat, roll-over bar, three-point hitch, front weights
     'icecream'  DARK SCOOPS: the ice cream van with a serving hatch and awning on each side, a menu, freezers
                 inside, a giant cone and a loudspeaker on the roof
   ORIGIN    Centre on the ground.   FRONT  -z.
   SIZE, WHEELS, SEATS: as VEHK now (hearse 2.0 × 5.4, limo 2.0 × 7.6, rally 1.9 × 4.1, tractor 2.0 × 3.8,
             ice cream van 2.2 × 5.2). Seat cushions at the old heights.
   HOOKS     userData.wheels [{p, t, front}] (hubcaps/rims inside t; t.userData.r set: the tractor's front and rear
             wheels differ, so roll by v.v·dt / (w.t.userData.r || K.whr)), userData.sw (steering wheel), swAx 'z'.
             Ice cream van: userData.jingle = 1 (as before). Skip vehMore() for all five.
   ===================================================================================================== */
function mkOddCar(kind,colour){const g=new THREE.Group();
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.45,metalness:.35},o||{}));
 const FONT='"Barlow Semi Condensed",DoorsSans,Arial,sans-serif';
 const paintC=colour!=null?colour:{hearse:0x101014,limo:0x0c0c10,rally:0x2060d0,tractor:0x2a8a3a,icecream:0xfff0f4}[kind];
 const paint=M(paintC,kind=='icecream'?{roughness:.45,metalness:.05}:kind=='tractor'?{roughness:.4,metalness:.2}:{roughness:.28,metalness:.45}),dk=M(0x1a1a1a,{roughness:.85,metalness:0}),chrome=M(0xd0d4d8,{metalness:.55,roughness:.22}),trim=M(0x2a2622,{roughness:.9,metalness:0}),
  seatM=M(kind=='limo'?0xd8c8a8:kind=='rally'?0x1e1e22:0x5a3a26,{roughness:.8,metalness:0}),carpet=M(0x302a26,{roughness:1,metalness:0}),U=M(0x26282a,{roughness:.7,metalness:.4}),
  glass=new THREE.MeshStandardMaterial({color:0x9ac8e0,transparent:true,opacity:.28,roughness:.05,metalness:.3,side:THREE.DoubleSide,depthWrite:false}),
  tint=new THREE.MeshStandardMaterial({color:0x101418,transparent:true,opacity:.78,roughness:.08,metalness:.6,side:THREE.DoubleSide,depthWrite:false}),
  hl=M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.7,roughness:.1}),tl=M(0x701010,{emissive:0xc01010,emissiveIntensity:.6,roughness:.2});
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const CYL=(r1,r2,len,m,x,y,z,ax,p,seg)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,seg||14),m);o.position.set(x,y,z);if(ax=='x')o.rotation.z=Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;(p||g).add(o);return o};
 const rod=(a,b,r,m,p)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),8),m);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());(p||g).add(o);return o};
 const B_T=.03;
 const extrude=(s,w,m,x,bt)=>{bt=bt==null?B_T:bt;const geo=new THREE.ExtrudeGeometry(s,{depth:w-2*bt,bevelEnabled:bt>0,bevelThickness:bt,bevelSize:bt,bevelSegments:2,curveSegments:14});const o=new THREE.Mesh(geo,m);o.rotation.y=-Math.PI/2;o.position.x=(x||0)+(w-2*bt)/2;g.add(o);return o};
 const poly=pts=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))s.lineTo(q[0],q[1]);s.lineTo(pts[0][0],pts[0][1]);return s};
 const pane=(pts,x,m)=>{const o=new THREE.Mesh(new THREE.ShapeGeometry(poly(pts)),m||glass);o.rotation.y=-Math.PI/2;o.position.x=x;g.add(o);return o};
 const slope=(w,z0,y0,z1,y1,m)=>{const L=Math.hypot(z1-z0,y1-y0),p=new THREE.Mesh(new THREE.PlaneGeometry(w,L),m||glass);p.position.set(0,(y0+y1)/2,(z0+z1)/2);p.rotation.x=Math.atan2(z1-z0,y1-y0);g.add(p);return p};
 const tex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)};
 const decalM=(w,h,draw)=>new THREE.MeshStandardMaterial({map:tex(512,Math.max(8,Math.round(512*h/w)),draw),transparent:true,alphaTest:.3,roughness:.4,metalness:.1});
 const sides=(m,w,h,x,y,z)=>{for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);p.position.set(sd*x,y,z);p.rotation.y=sd*Math.PI/2;g.add(p)}};
 const text=(s,col,font)=>(k,w,h)=>{k.clearRect(0,0,w,h);k.fillStyle=col;k.font=(font||'bold ')+(h*.7|0)+'px '+FONT;k.textAlign='center';k.textBaseline='middle';k.fillText(s,w/2,h/2+2,w-10)};
 const plate=(txt,z,ry,y,x)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(.36,.18),M(0xffffff,{map:tex(256,128,(k)=>{k.fillStyle='#f0e8d0';k.fillRect(0,0,256,128);k.strokeStyle='#2a2a2a';k.lineWidth=6;k.strokeRect(4,4,248,120);
  k.fillStyle='#b03020';k.font='bold 22px '+FONT;k.textAlign='center';k.fillText('DESERT STATE',128,30);k.fillStyle='#1a1a1a';k.font='bold 64px '+FONT;k.fillText(txt,128,100,230)}),metalness:.2}));p.position.set(x||0,y,z);p.rotation.y=ry;g.add(p);return p};
 /* wheels */
 const wheels=[];const wheel=(x,z,r,w,style)=>{const p=new THREE.Group();p.position.set(x,r,z);g.add(p);
  const tr=tex(64,64,(k)=>{k.fillStyle='#1c1c1c';k.fillRect(0,0,64,64);k.fillStyle='#0c0c0c';if(style=='tractor'){for(let i=0;i<64;i+=16){k.beginPath();k.moveTo(0,i);k.lineTo(30,i+10);k.lineTo(30,i+16);k.lineTo(0,i+6);k.fill();k.beginPath();k.moveTo(64,i+8);k.lineTo(34,i+18);k.lineTo(34,i+24);k.lineTo(64,i+14);k.fill()}}else for(let i=0;i<64;i+=8)k.fillRect(0,i,64,2)});tr.wrapS=tr.wrapT=THREE.RepeatWrapping;tr.repeat.set(1,Math.round(r*10));
  const t=new THREE.Mesh(new THREE.CylinderGeometry(r,r,w,28),[M(0xffffff,{map:tr,roughness:.95,metalness:0}),dk,dk]);t.rotation.z=Math.PI/2;t.userData.r=r;p.add(t);
  for(const s of[-1,1]){const sh=new THREE.Mesh(new THREE.TorusGeometry(r-w*.18,w*.18,6,26),dk);sh.rotation.x=Math.PI/2;sh.position.y=s*(w/2-w*.18);t.add(sh)}
  if(style=='tractor'){t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.58,r*.58,w*.7,20),M(0xf0c020,{roughness:.5})));t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.2,r*.2,w*.9,10),steel()));for(let i=0;i<8;i++){const a=i/8*6.283,b=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,w*.75,6),steel());b.position.set(Math.cos(a)*r*.3,0,Math.sin(a)*r*.3);t.add(b)}}
  else if(style=='rally'){const rr=r*.62;t.add(new THREE.Mesh(new THREE.CylinderGeometry(rr,rr,w+.01,20),M(0xe8e8e8,{metalness:.4,roughness:.3})));for(let i=0;i<6;i++){const a=i/6*6.283,sp=new THREE.Mesh(new THREE.BoxGeometry(rr*.5,w+.02,.05),M(0x2a2a2a));sp.position.set(Math.cos(a)*rr*.6,0,Math.sin(a)*rr*.6);sp.rotation.y=-a;t.add(sp)}t.add(new THREE.Mesh(new THREE.CylinderGeometry(rr*.25,rr*.25,w+.04,10),M(0x2a2a2a)))}
  else{t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.6,r*.6,w+.01,18),chrome));t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.2,r*.24,w+.03,12),M(0xb8bcc0,{metalness:.5,roughness:.3})));for(let i=0;i<6;i++){const a=i/6*6.283,sp=new THREE.Mesh(new THREE.BoxGeometry(r*.3,w+.02,.025),M(0x9aa0a4,{metalness:.5,roughness:.3}));sp.position.set(Math.cos(a)*r*.36,0,Math.sin(a)*r*.36);sp.rotation.y=-a;t.add(sp)}}
  wheels.push({p,t,front:z<0});return p};
 function steel(){return M(0x5a5e62,{metalness:.65,roughness:.35})}
 let sw=null;const steer=(x,y,z,tilt,r)=>{const s=new THREE.Group();s.position.set(x,y,z);s.rotation.x=tilt;g.add(s);s.add(new THREE.Mesh(new THREE.TorusGeometry(r||.18,.022,8,24),dk));
  for(const a of[0,2.1,4.2]){const b=new THREE.Mesh(new THREE.BoxGeometry((r||.18)*.9,.025,.02),dk);b.position.set(Math.cos(a)*(r||.18)*.45,Math.sin(a)*(r||.18)*.45,0);b.rotation.z=a;s.add(b)}
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.05,12),chrome);hub.rotation.x=Math.PI/2;s.add(hub);const col=new THREE.Mesh(new THREE.CylinderGeometry(.03,.035,.34,8),dk);col.rotation.x=Math.PI/2;col.position.z=-.18;s.add(col);sw=s};
 const seat=(x,y,z,w,m)=>{BX(w,.12,.52,m||seatM,x,y,z);const bk=BX(w,.62,.11,m||seatM,x,y+.35,z+.29);bk.rotation.x=-.12;BX(w*.5,.17,.1,m||seatM,x,y+.74,z+.35)};
 const gauges=(x,y,z)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(.5,.125),new THREE.MeshStandardMaterial({map:tex(256,64,(k)=>{k.fillStyle='#14120f';k.fillRect(0,0,256,64);for(const cx of[70,186]){k.strokeStyle='#d8d0b8';k.lineWidth=2;k.beginPath();k.arc(cx,36,24,Math.PI*.8,Math.PI*2.2);k.stroke();k.strokeStyle='#ff6020';k.beginPath();k.moveTo(cx,36);k.lineTo(cx-14,24);k.stroke()}}),emissive:0x40a0ff,emissiveIntensity:.15}));p.position.set(x,y,z);p.rotation.x=-.25;g.add(p)};

 /* =================================================================== the three long cars: one body builder */
 if(kind=='hearse'||kind=='limo'||kind=='rally'){
  const C={hearse:{W:1.96,WR:.38,WW:.28,WX:.98,ZF:-1.9,ZR:1.7,AR:.45,nose:-2.7,cowl:-1.35,noseY:.82,BL:.98,RY:1.62,wsTop:-.6,rwTop:2.58,rwBot:2.62,tail:2.7,tailY:.98,seatY:.6,seats:[[.45,-.6],[-.45,-.6]],steer:[.45,1.04,-.92],dash:-1.1},
   limo:{W:1.98,WR:.36,WW:.26,WX:.98,ZF:-2.7,ZR:2.7,AR:.43,nose:-3.8,cowl:-2.2,noseY:.84,BL:.98,RY:1.54,wsTop:-1.65,rwTop:2.4,rwBot:2.85,tail:3.8,tailY:.95,seatY:.58,seats:[[.45,-1.6],[-.45,-1.6]],steer:[.45,1.02,-1.88],dash:-2.08},
   rally:{W:1.86,WR:.38,WW:.32,WX:.92,ZF:-1.35,ZR:1.35,AR:.46,nose:-2.05,cowl:-.85,noseY:.78,BL:.98,RY:1.52,wsTop:-.32,rwTop:1.15,rwBot:1.85,tail:2.05,tailY:1.0,seatY:.62,seats:[[.42,0],[-.42,0]],steer:[.42,1.02,-.4],dash:-.6}}[kind];
  const{W,WR,AR,ZF,ZR,nose,cowl,BL,RY,wsTop,rwTop,rwBot,tail}=C,hw=W/2,BOT=.24;
  /* the body sides: one profile from nose to tail with both wheel arches, as a 10 cm slab each side (so the cabin is hollow) */
  const hood=z=>C.noseY+(z-(nose+.15))/(cowl-(nose+.15))*(BL-C.noseY),trunk=z=>BL+(z-rwBot)/((tail-.15)-rwBot)*(C.tailY-BL);
  {const s=new THREE.Shape();s.moveTo(nose+.09,BOT);for(const az of[ZF,ZR]){s.lineTo(az-AR,BOT);s.lineTo(az-AR,WR);s.absarc(az,WR,AR,Math.PI,0,true);s.lineTo(az+AR,BOT)}
   s.lineTo(tail-.09,BOT);s.quadraticCurveTo(tail,BOT+.02,tail,BOT+.18);s.lineTo(tail,C.tailY-.1);s.quadraticCurveTo(tail-.01,C.tailY,tail-.15,C.tailY);s.lineTo(rwBot,BL);s.lineTo(cowl,BL);s.lineTo(nose+.15,C.noseY);s.quadraticCurveTo(nose+.01,C.noseY,nose,C.noseY-.12);s.lineTo(nose,BOT+.18);s.quadraticCurveTo(nose,BOT+.02,nose+.09,BOT);
   for(const sd of[-1,1])extrude(s,.1,paint,sd*(hw-.05))}
  /* between the slabs, inboard of the wheels: the engine bay block and the trunk block; full-width caps on the nose, the tail and over the hood and trunk lid */
  const wi=2*Math.min(hw-.1,C.WX-C.WW/2-.02);
  extrude(poly([[nose+.02,BOT],[cowl,BOT],[cowl,BL],[nose+.15,C.noseY],[nose+.02,C.noseY-.12]]),wi,paint,0,.01);
  if(tail-rwBot>.12)extrude(poly([[rwBot,BOT],[tail-.02,BOT],[tail-.02,C.tailY-.1],[tail-.15,C.tailY],[rwBot,BL]]),wi,paint,0,.01);
  {const zc=ZF-AR-.03;extrude(poly([[nose+.09,BOT],[zc,BOT],[zc,hood(zc)],[nose+.15,C.noseY],[nose,C.noseY-.12],[nose,BOT+.18]]),W,paint,0,.02)}
  {const zt=Math.max(ZR+AR+.03,rwBot);extrude(poly([[zt,BOT],[tail-.09,BOT],[tail,BOT+.18],[tail,C.tailY-.1],[tail-.15,C.tailY],[zt,zt>rwBot?trunk(zt):BL]]),W,paint,0,.02)}
  extrude(poly([[nose+.15,C.noseY],[cowl,BL],[cowl,BL-.05],[nose+.15,C.noseY-.05]]),W,paint,0,.012);/* hood lid */
  if(tail-.15-rwBot>.1)extrude(poly([[rwBot,BL],[tail-.15,C.tailY],[tail-.15,C.tailY-.05],[rwBot,BL-.05]]),W,paint,0,.012);/* trunk lid */
  /* cabin floor and door cards, clear of the rear wheels */
  const cz1=Math.min(rwBot,ZR-AR)-.05;BX(wi,.16,rwBot-cowl,dk,0,.33,(cowl+rwBot)/2);BX(wi-.02,.03,rwBot-cowl-.04,carpet,0,.425,(cowl+rwBot)/2);/* the floor runs the whole cabin (it is narrower than the gap between the wheels) */for(const sd of[-1,1])BX(.03,.36,cz1-cowl-.1,trim,sd*(hw-.115),.74,(cowl+cz1)/2);
  /* roof, headliner, windscreen, rear glass */
  {const s=new THREE.Shape(),h2=hw-.1;s.moveTo(-h2,0);s.quadraticCurveTo(-h2,.05,-h2+.06,.06);s.lineTo(h2-.06,.06);s.quadraticCurveTo(h2,.05,h2,0);s.lineTo(-h2,0);
   const r=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:rwTop-wsTop,bevelEnabled:false,curveSegments:8}),paint);r.position.set(0,RY,wsTop);g.add(r);BX(W-.26,.02,rwTop-wsTop-.02,M(0xd8d0c0,{roughness:.9,metalness:0}),0,RY-.012,(wsTop+rwTop)/2)}
  slope(W-.22,cowl,BL,wsTop,RY);if(rwBot-rwTop>.1)slope(W-.22,rwTop,RY,rwBot,BL);
  const strip=(a,b,t,m)=>{const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),d=Bv.clone().sub(A);const o=new THREE.Mesh(new THREE.BoxGeometry(t,d.length(),t),m);o.position.copy(A).add(Bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(o);return o};
  /* side glass in one pane per side, with pillars standing on it */
  const gx=hw-.065;for(const sd of[-1,1]){pane([[cowl+.04,BL+.02],[wsTop+.02,RY-.03],[rwTop-.02,RY-.03],[rwBot-.04,BL+.02]],sd*gx,kind=='limo'?tint:glass);
   strip([sd*(gx-.03),BL,cowl],[sd*(gx-.04),RY,wsTop],.07,paint);strip([sd*(gx-.03),BL,rwBot],[sd*(gx-.04),RY,rwTop],.08,paint);strip([sd*(hw-.01),BL+.01,cowl+.02],[sd*(hw-.01),BL+.01,rwBot-.02],.03,chrome)}
  /* inside: dash with gauges, the steering wheel, front seats */
  BX(W-.2,.26,.3,trim,0,.88,C.dash-.15);BX(W-.2,.05,.36,M(0x3a3430,{roughness:.9}),0,1.03,C.dash-.17);gauges(C.steer[0],.9,C.dash+.003);steer(C.steer[0],C.steer[1],C.steer[2],-1.15);
  for(const[x,z]of C.seats)seat(x,C.seatY,z,kind=='rally'?.5:.56);
  /* bumpers, lights, plates */
  const bumper=(z,m)=>{BX(W-.12,.15,.14,m,0,.32,z);for(const sd of[-1,1]){const e=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.14,12),m);e.rotation.x=Math.PI/2;e.position.set(sd*(hw-.06),.32,z);g.add(e)}};
  const bm=kind=='rally'?dk:chrome;bumper(nose-.06,bm);bumper(tail+.06,bm);
  for(const sd of[-1,1]){CYL(.1,.1,.05,hl,sd*(hw-.3),.6,nose-.01,'z');const rg=new THREE.Mesh(new THREE.TorusGeometry(.105,.018,8,20),chrome);rg.position.set(sd*(hw-.3),.6,nose-.035);g.add(rg);BX(.36,.15,.04,tl,sd*(hw-.3),.7,tail+.025)}
  {const gm=M(0xffffff,{map:tex(256,64,(k)=>{k.fillStyle='#111';k.fillRect(0,0,256,64);k.fillStyle=kind=='rally'?'#3a3c3e':'#b8bcc0';for(let i=6;i<64;i+=9)k.fillRect(4,i,248,3)}),metalness:.6,roughness:.3});BX(.9,.22,.04,[bm,bm,bm,bm,bm,gm],0,.52,nose-.005)}
  plate(kind=='hearse'?'REST 1':kind=='limo'?'VIP 777':'RALLY13',nose-.14,Math.PI,.32);plate(kind=='hearse'?'REST 1':kind=='limo'?'VIP 777':'RALLY13',tail+.028,0,.6);/* on the tail panel, above the bumper */
  for(const sd of[-1,1]){BX(.1,.03,.04,dk,sd*(hw+.05),1.0,cowl+.1);BX(.04,.1,.14,paint,sd*(hw+.1),1.03,cowl+.1)}/* mirrors */
  /* underneath: rails and axles into the hubs */for(const sd of[-1,1])BX(.1,.1,tail-nose-.4,U,sd*.55,.2,(nose+tail)/2);for(const z of[ZF,ZR])CYL(.045,.045,2*C.WX-.3,U,0,WR,z,'x');CYL(.04,.04,ZR-ZF,U,0,.3,(ZF+ZR)/2,'z');
  for(const[x,z]of[[-C.WX,ZF],[C.WX,ZF],[-C.WX,ZR],[C.WX,ZR]])wheel(x,z,WR,C.WW,kind=='rally'?'rally':'chrome');
  /* ---- the hearse's rear: curtains behind the glass, landau panels with chrome bars, the coffin, a rear door ---- */
  if(kind=='hearse'){const cur=M(0xffffff,{map:tex(128,64,(k,w,h)=>{for(let x=0;x<w;x+=8){const gr=k.createLinearGradient(x,0,x+8,0);gr.addColorStop(0,'#3a0a14');gr.addColorStop(.5,'#7a1a2a');gr.addColorStop(1,'#3a0a14');k.fillStyle=gr;k.fillRect(x,0,8,h)}}),roughness:1,metalness:0,side:THREE.DoubleSide});
   for(const sd of[-1,1]){const c=new THREE.Mesh(new THREE.PlaneGeometry(1.38,RY-BL-.05),cur);c.position.set(sd*(gx-.025),(RY+BL)/2,1.01);rod([sd*(gx-.03),RY-.03,.32],[sd*(gx-.03),RY-.03,1.7],.012,chrome);strip([sd*(gx-.03),BL,.3],[sd*(gx-.04),RY,.3],.08,paint);/* fills the window from the B-pillar to the landau panel, on a rail */c.rotation.y=sd*Math.PI/2;g.add(c);
    extrude(poly([[1.72,BL],[2.6,BL],[2.6,RY],[1.72,RY]]),.04,paint,sd*(hw-.02),.01);/* landau panel over the back of the side glass */
    const lb=new THREE.Mesh(new THREE.TorusGeometry(.32,.025,6,20,Math.PI*.9),chrome);lb.rotation.y=sd*Math.PI/2;lb.position.set(sd*(hw+.005),1.18,2.16);g.add(lb);
    strip([sd*(gx-.03),BL,1.68],[sd*(gx-.03),RY,1.68],.08,paint)}
   {const c=new THREE.Mesh(new THREE.PlaneGeometry(W-.24,RY-BL-.04),cur);c.position.set(0,(RY+BL)/2,rwTop-.03);g.add(c)}/* curtain filling the back window */
   {const cf=BX(.7,.38,2.0,M(0x5a3a1a,{roughness:.55}),0,.62,1.25);BX(.74,.06,2.04,M(0x6a4a2a,{roughness:.5}),0,.84,1.25);for(const sd of[-1,1])for(const z of[.55,1.25,1.95])BX(.02,.06,.16,chrome,sd*.37,.62,z)}/* coffin with handles */
   BX(W-.2,.03,2.1,M(0x2a1a14,{roughness:.6}),0,.44,1.25);/* the deck it slides on */
   sides(decalM(1.2,.2,text('DARK & SONS','#d8c090','bold ')),1.2,.2,hw+.006,.72,.45);/* clear of the rear wheel arch */
   BX(.012,.58,.012,M(0x0a0a0a),hw+.003,.62,.32);BX(.012,.58,.012,M(0x0a0a0a),-hw-.003,.62,.32)}
  /* ---- the limo: tinted partition, two more rows of seats, a drinks cabinet, extra pillars, twin exhausts ---- */
  if(kind=='limo'){BX(W-.3,.6,.04,tint,0,1.25,-1.05);for(const z of[.4,2.15])for(const x of[.45,-.45])seat(x,C.seatY,z,.56);
   BX(.45,.45,1.2,M(0x2a1a10,{roughness:.55}),0,.68,1.25);for(let i=0;i<3;i++){CYL(.035,.03,.16,M(0xe0e0f0,{transparent:true,opacity:.7}),-.12+i*.12,.98,1.0,null,null,8)}BX(.4,.02,1.1,chrome,0,.91,1.25);
   for(const sd of[-1,1])for(const z of[-1.05,.25,1.55])strip([sd*(gx-.03),BL,z],[sd*(gx-.03),RY,z],.09,paint);
   for(const sd of[-1,1]){CYL(.045,.045,.22,chrome,sd*.6,.22,tail+.05,'z');for(const z of[-1.6,-.4,.9,2.1])BX(.015,.03,.14,chrome,sd*(hw+.01),.86,z)}
   for(const sd of[-1,1])for(const z of[-1.05,.25,1.55])BX(.012,.66,.012,M(0x0a0a0a),sd*(hw+.003),.6,z)}
  /* ---- the rally car: cage, scoop, light pod, spoiler, mud flaps, livery ---- */
  if(kind=='rally'){const WC=M(0xe8e8e8,{metalness:.4,roughness:.4});
   for(const sd of[-1,1]){rod([sd*.62,.45,.35],[sd*.62,1.45,.3],.03,WC);rod([sd*.62,1.45,.3],[sd*.6,1.45,-.25],.03,WC);rod([sd*.6,1.45,-.25],[sd*.66,.95,-.75],.03,WC);rod([sd*.62,1.45,.3],[sd*.6,.43,1.5],.03,WC);/* rear stays down onto the floor */rod([sd*.66,.6,-.4],[sd*.64,.62,.4],.03,WC)}
   rod([-.62,1.45,.3],[.62,1.45,.3],.03,WC);rod([-.62,.6,.35],[.62,1.45,.3],.03,WC);
   BX(.5,.08,.4,dk,0,RY+.1,.2);BX(.4,.12,.04,M(0x050505),0,RY+.12,-.01);/* roof scoop */
   BX(1.3,.1,.16,dk,0,.98,-1.7);for(let i=0;i<4;i++){CYL(.08,.08,.04,hl,-.48+i*.32,.98,-1.79,'z');CYL(.085,.085,.03,M(0x2a2a2a),-.48+i*.32,.98,-1.77,'z')}for(const sd of[-1,1])rod([sd*.5,.93,-1.7],[sd*.5,.86,-1.55],.02,dk);/* bonnet light pod on two struts */
   BX(1.6,.04,.32,dk,0,RY+.18,1.1);for(const sd of[-1,1])BX(.04,.16,.28,dk,sd*.6,RY+.1,1.1);/* roof spoiler */
   for(const sd of[-1,1])for(const z of[ZF+.5,ZR+.5])BX(.3,.32,.02,M(0x2a2a2a,{roughness:.9}),sd*(C.WX),.28,z);/* mud flaps */
   for(const sd of[-1,1]){const fl=new THREE.Mesh(new THREE.TorusGeometry(AR+.03,.06,6,20,Math.PI),paint);fl.rotation.y=Math.PI/2;for(const z of[ZF,ZR]){const f=fl.clone();f.position.set(sd*(hw+.02),WR,z);g.add(f)}}/* flared arches */
   sides(decalM(1.0,1.0,(k,w,h)=>{k.clearRect(0,0,w,h);k.fillStyle='#ffffff';k.beginPath();k.arc(w/2,h/2,h*.45,0,7);k.fill();k.fillStyle='#1a1a1a';k.font='bold '+(h*.55|0)+'px '+FONT;k.textAlign='center';k.textBaseline='middle';k.fillText('13',w/2,h/2+4)}),.5,.5,hw+.012,.66,.35);
   sides(decalM(3.4,.12,(k,w,h)=>{k.fillStyle='#ffe040';k.fillRect(0,0,w,h*.45);k.fillStyle='#ffffff';k.fillRect(0,h*.55,w,h*.45)}),3.4,.12,hw+.008,.4,.1);
   {const s=decalM(.5,1.9,(k,w,h)=>{k.fillStyle='#ffffff';k.fillRect(w*.1,0,w*.3,h);k.fillStyle='#ffe040';k.fillRect(w*.6,0,w*.3,h)});const p=new THREE.Mesh(new THREE.PlaneGeometry(.5,1.0),s);p.rotation.x=-Math.PI/2-Math.atan2(.2,1.15);p.position.set(0,.9+.008,-1.45);g.add(p)}
   for(const sd of[-1,1])BX(.012,.6,.012,M(0x0a0a0a),sd*(hw+.003),.62,.5)}}

 /* =================================================================== TRACTOR */
 else if(kind=='tractor'){const YL=M(0xf0c020,{roughness:.5});
  /* bonnet with louvres and the grille, on the engine block */
  extrude(poly([[-1.78,.7],[-.25,.7],[-.25,1.42],[-1.6,1.42],[-1.78,1.3]]),.9,paint,0,.05);BX(.95,.06,1.5,YL,0,1.45,-.95);
  {const gr=M(0xffffff,{map:tex(128,128,(k)=>{k.fillStyle='#111';k.fillRect(0,0,128,128);k.fillStyle='#d8b020';for(let i=8;i<128;i+=14)k.fillRect(8,i,112,6)}),roughness:.6});BX(.7,.5,.03,[YL,YL,YL,YL,gr,gr],0,1.0,-1.79)}
  for(const sd of[-1,1]){const lv=decalM(.9,.24,(k,w,h)=>{k.fillStyle='#14160f';for(let x=8;x<w;x+=34)k.fillRect(x,4,18,h-8)});const p=new THREE.Mesh(new THREE.PlaneGeometry(.9,.24),lv);p.position.set(sd*.456,1.15,-1.0);p.rotation.y=sd*Math.PI/2;g.add(p);
   CYL(.07,.07,.04,hl,sd*.3,1.2,-1.8,'z')}
  BX(.7,.5,1.3,M(0x3a3c3e,{metalness:.5}),0,.55,-.95);/* engine block under the bonnet */
  /* front weights and the front axle */for(let i=0;i<5;i++)BX(.14,.36,.2,dk,-.3+i*.15,.75,-1.95);BX(.8,.1,.2,steel(),0,.55,-1.9);CYL(.06,.06,1.4,steel(),0,.32,-1.1,'x');BX(.24,.36,.2,steel(),0,.5,-1.1);
  /* exhaust stack with a flap */CYL(.05,.06,1.2,dk,.3,1.95,-.8,null,null,10);CYL(.065,.065,.12,chrome,.3,2.52,-.8,null,null,10);{const f=BX(.13,.01,.13,dk,.3,2.6,-.78);f.rotation.x=-.4}
  /* the platform, steps, fuel tank, the seat on its spring, steering, roll-over bar */
  BX(1.2,.08,1.1,steel(),0,.92,.35);for(const sd of[-1,1]){BX(.3,.04,.24,steel(),sd*.6,.55,.0);rod([sd*.6,.55,-.1],[sd*.6,.9,-.1],.02,steel())}
  BX(.6,.4,.5,paint,0,1.15,-.05);/* fuel tank and dash in front of the driver */
  CYL(.05,.05,.25,dk,0,1.06,.55);BX(.6,.12,.55,seatM,0,1.15,.55);{const bk=BX(.6,.5,.08,seatM,0,1.45,.85);bk.rotation.x=-.15}
  steer(0,1.45,.05,-.7,.2);gauges(0,1.25,-.29);
  for(const sd of[-1,1])rod([sd*.7,.95,1.0],[sd*.7,2.5,1.0],.045,YL);rod([-.7,2.5,1.0],[.7,2.5,1.0],.045,YL);
  /* rear mudguards over the big wheels, with lights on them */
  for(const sd of[-1,1]){const f=new THREE.Mesh(new THREE.CylinderGeometry(.86,.86,.5,24,1,true,.05,Math.PI*.95),M(0xf0c020,{roughness:.5,side:THREE.DoubleSide}));f.rotation.z=Math.PI/2;f.position.set(sd*.9,.78,.75);g.add(f);
   BX(.1,.08,.04,tl,sd*.7,1.35,1.067)}/* tail lights on the roll bar posts */
  /* the gearbox housing at the back, the three-point hitch hanging off it, the PTO shaft */BX(.62,.5,.5,M(0x3a3c3e,{metalness:.5}),0,.75,1.2);for(const sd of[-1,1])rod([sd*.24,.58,1.4],[sd*.34,.42,1.85],.03,steel());BX(.75,.05,.05,steel(),0,.42,1.85);rod([0,.95,1.42],[0,.78,1.85],.03,steel());CYL(.05,.05,.16,steel(),0,.62,1.52,'z',null,10);
  plate('FARM 1',1.456,0,.82,.18);/* on the gearbox housing */
  /* the chassis under it, and the rear axle housing */BX(.5,.25,2.6,M(0x3a3c3e,{metalness:.5}),0,.55,-.2);CYL(.08,.08,1.5,M(0x3a3c3e,{metalness:.5}),0,.78,.75,'x');
  wheel(-.75,-1.1,.32,.22,'tractor');wheel(.75,-1.1,.32,.22,'tractor');wheel(-.9,.75,.78,.42,'tractor');wheel(.9,.75,.78,.42,'tractor')}

 /* =================================================================== ICE CREAM VAN */
 else if(kind=='icecream'){const PK=M(0xff80b0,{roughness:.5}),WH=M(0xf8f4f0,{roughness:.55,metalness:.05}),BL2=M(0x80c8e8,{roughness:.5}),rub=M(0x141414,{roughness:.9,metalness:0});
  const hw=1.08,WR=.4,AR=.47;
  /* the two body sides: one profile from nose to tail with both arches, the cab window and the serving hatch cut through */
  {const sh=new THREE.Shape();sh.moveTo(-2.5,.3);for(const az of[-1.7,1.7]){sh.lineTo(az-AR,.3);sh.lineTo(az-AR,WR);sh.absarc(az,WR,AR,Math.PI,0,true);sh.lineTo(az+AR,.3)}
   sh.lineTo(2.6,.3);sh.lineTo(2.6,2.48);sh.lineTo(-1.35,2.48);sh.lineTo(-1.65,1.4);sh.lineTo(-2.45,1.15);sh.lineTo(-2.6,1.0);sh.lineTo(-2.6,.42);sh.lineTo(-2.5,.3);
   const hole=pts=>{const h=new THREE.Path();h.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))h.lineTo(q[0],q[1]);h.lineTo(pts[0][0],pts[0][1]);sh.holes.push(h)};
   hole([[-1.54,1.5],[-.32,1.5],[-.32,2.36],[-1.3,2.36]]);hole([[.2,1.5],[1.9,1.5],[1.9,2.15],[.2,2.15]]);
   for(const sd of[-1,1])extrude(sh,.08,paint,sd*(hw-.04),.01)}
  /* nose: the engine block between the wheels, a full-width cap in front of the arches, the bonnet lid */
  extrude(poly([[-2.58,.42],[-1.65,.42],[-1.65,1.4],[-2.45,1.15],[-2.58,1.02]]),1.68,paint,0,.01);
  extrude(poly([[-2.5,.3],[-2.2,.3],[-2.2,1.23],[-2.45,1.15],[-2.6,1.0],[-2.6,.42]]),2.16,paint,0,.02);
  extrude(poly([[-2.45,1.15],[-1.65,1.4],[-1.65,1.35],[-2.45,1.1]]),2.16,paint,0,.01);
  /* roof, back wall with the rear doors, the wall between cab and box, floors */
  BX(2.16,.08,3.96,WH,0,2.52,.62);BX(2.16,2.1,.08,WH,0,1.42,2.56);BX(.015,1.9,.012,rub,0,1.42,2.605);for(const sd of[-1,1])BX(.06,.16,.03,chrome,sd*.12,1.4,2.615);
  BX(2.0,2.0,.05,WH,0,1.48,-.25);{const w=new THREE.Mesh(new THREE.PlaneGeometry(.6,.35),glass);w.position.set(0,2.0,-.274);g.add(w)}
  BX(1.68,.1,1.4,dk,0,.85,-.95);BX(1.66,.02,1.36,carpet,0,.91,-.95);BX(1.68,.1,2.75,M(0x8a8e92,{metalness:.5,roughness:.4}),0,.52,1.14);
  /* glass: windscreen across the front, the cab door windows sit in their holes */
  {const L2=Math.hypot(.3,1.08),ws=new THREE.Mesh(new THREE.PlaneGeometry(2.0,L2),glass);ws.position.set(0,1.94,-1.5);ws.rotation.x=Math.atan2(.3,1.08);g.add(ws)}
  rod([-1.0,1.42,-1.645],[1.0,1.42,-1.645],.025,rub);rod([-1.0,2.47,-1.355],[1.0,2.47,-1.355],.025,rub);
  for(const sd of[-1,1])pane([[-1.54,1.5],[-.32,1.5],[-.32,2.36],[-1.3,2.36]],sd*(hw-.04));
  /* pink and blue bands along each side, below the windows */
  for(const sd of[-1,1]){BX(.012,.12,4.2,PK,sd*(hw+.004),1.32,.5);BX(.012,.06,4.2,BL2,sd*(hw+.004),1.2,.5)}
  /* inside the box: a freezer island with tubs, a shelf of cones on the back wall, a poster */
  BX(1.0,.88,1.6,M(0xd8e8f0,{metalness:.3}),0,1.01,1.05);BX(1.04,.04,1.64,chrome,0,1.47,1.05);
  {const C2=[PK,WH,M(0x8a5030),M(0x60c060)];for(let i=0;i<4;i++)for(const sd of[-1,1])CYL(.12,.12,.08,C2[i],sd*.24,1.53,.5+i*.37,null,null,14)}
  BX(1.6,.04,.26,M(0xd8d0c0),0,2.0,2.39);for(const sd of[-1,1])BX(.04,.12,.22,M(0xd8d0c0),sd*.7,1.94,2.4);for(let i=0;i<8;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(.045,.16,8),M(0xe0b060));c.rotation.x=Math.PI;c.position.set(-.63+i*.18,2.1,2.38);g.add(c)}
  /* each serving hatch: a frame round the hole, a sill, an awning on a hinge with two struts, a menu board below */
  for(const sd of[-1,1]){const x=sd*(hw+.01);BX(.03,.05,1.76,chrome,x,2.175,1.05);BX(.14,.04,1.76,chrome,sd*(hw+.05),1.48,1.05);for(const z of[.175,1.925])BX(.03,.71,.05,chrome,x,1.825,z);
   const aw=new THREE.Group();aw.position.set(sd*hw,2.24,1.05);aw.rotation.z=sd*-.35;g.add(aw);BX(.7,.03,1.86,M(0xffffff,{map:tex(256,64,(k,w,h)=>{for(let i=0;i<8;i++){k.fillStyle=i%2?'#ffffff':'#ff80b0';k.fillRect(i*w/8,0,w/8+1,h)}}),roughness:.7}),sd*.35,0,0,aw);
   BX(.04,.06,.06,chrome,sd*hw,2.24,.2);BX(.04,.06,.06,chrome,sd*hw,2.24,1.9);/* hinge blocks */
   for(const z of[.25,1.85])rod([sd*(hw+.01),1.62,z],[sd*(hw+.64),2.0,z],.015,chrome);
   const mb=new THREE.Mesh(new THREE.PlaneGeometry(.95,.55),new THREE.MeshStandardMaterial({map:tex(512,296,(k,w,h)=>{k.fillStyle='#fff8fb';k.fillRect(0,0,w,h);k.fillStyle='#ff4090';k.font='bold 74px '+FONT;k.textAlign='center';k.fillText('DARK SCOOPS',w/2,90,w-20);k.font='40px '+FONT;k.fillStyle='#8a2050';k.fillText('ice cream · 1 gold',w/2,165);k.fillText('open never',w/2,215);k.fillStyle='#ff80b0';k.fillRect(0,h-22,w,22)}),roughness:.6}));
   mb.position.set(sd*(hw+.006),.95,.45);mb.rotation.y=sd*Math.PI/2;g.add(mb)}
  /* the giant ice cream lying on the roof: a waffle cone pointing back, a sprinkled scoop at the front */
  {const a=Math.atan2(.42,2.2),T=[0,2.58,1.9],Mo=[0,2.58+2.2*Math.sin(a),1.9-2.2*Math.cos(a)];
   const cone=new THREE.Mesh(new THREE.ConeGeometry(.42,2.2,20,1,true),M(0xe0b060,{map:tex(128,128,(k)=>{k.fillStyle='#e0b060';k.fillRect(0,0,128,128);k.strokeStyle='#a87828';k.lineWidth=4;for(let i=-128;i<128;i+=16){k.beginPath();k.moveTo(i,0);k.lineTo(i+128,128);k.stroke();k.beginPath();k.moveTo(i+128,0);k.lineTo(i,128);k.stroke()}}),roughness:.8,side:THREE.DoubleSide}));
   cone.rotation.x=Math.PI/2+a;cone.position.set(0,(T[1]+Mo[1])/2,(T[2]+Mo[2])/2);g.add(cone);
   const sp=tex(128,64,(k)=>{k.fillStyle='#ff80b0';k.fillRect(0,0,128,64);const cs=['#ffffff','#60c0ff','#ffe040','#80e080'];for(let i=0;i<70;i++){k.fillStyle=cs[i%4];k.fillRect(Math.random()*128,Math.random()*64,3,1.5)}});
   const s1=new THREE.Mesh(new THREE.SphereGeometry(.45,20,14),M(0xffffff,{map:sp,roughness:.6,metalness:0}));s1.position.set(0,3.02,Mo[2]-.08);g.add(s1);
   for(const z of[.4,1.3])BX(.3,.08,.12,steel(),0,2.6+(1.9-z)/2.2*.0,z)}/* the mounts it sits on */
  /* two loudspeaker horns on a bar at the front of the roof, pointing forward */
  {BX(1.4,.05,.08,steel(),0,2.6,-1.2);for(const sd of[-1,1]){BX(.05,.14,.05,steel(),sd*.6,2.69,-1.2);const hn=new THREE.Mesh(new THREE.CylinderGeometry(.15,.045,.34,16,1,true),M(0x3a3a3a,{side:THREE.DoubleSide,roughness:.6}));hn.rotation.x=-Math.PI/2;hn.position.set(sd*.6,2.82,-1.3);g.add(hn);CYL(.06,.06,.12,M(0x2a2a2a),sd*.6,2.82,-1.08,'z',null,12)}}
  /* front: dash, the steering wheel, two seats, lights and grille, bumpers, mirrors, plates */
  BX(1.96,.28,.3,trim,0,1.3,-1.47);gauges(.5,1.32,-1.317);steer(.5,1.42,-1.2,-1.15);seat(.5,.95,-.9,.56);seat(-.5,.95,-.9,.56);
  for(const sd of[-1,1]){BX(.36,.18,.04,hl,sd*.72,.88,-2.62);BX(.32,.16,.04,tl,sd*.75,.95,2.615);BX(.14,.03,.04,dk,sd*(hw+.06),1.85,-1.48);BX(.04,.2,.14,dk,sd*(hw+.13),1.85,-1.48)}
  {const gm=M(0xffffff,{map:tex(256,64,(k)=>{k.fillStyle='#111';k.fillRect(0,0,256,64);k.fillStyle='#b8bcc0';for(let i=6;i<64;i+=9)k.fillRect(4,i,248,3)}),metalness:.6});BX(.8,.26,.03,[chrome,chrome,chrome,chrome,chrome,gm],0,.8,-2.615)}
  BX(2.0,.14,.1,chrome,0,.42,-2.66);BX(2.0,.14,.1,chrome,0,.42,2.66);plate('YUM 99',-2.716,Math.PI,.42);plate('YUM 99',2.606,0,.66,.5);
  for(const sd of[-1,1])CYL(.04,.04,4.4,U,sd*.55,.24,0,'z');for(const z of[-1.7,1.7])CYL(.045,.045,1.7,U,0,WR,z,'x');
  for(const[x,z]of[[-1.0,-1.7],[1.0,-1.7],[-1.0,1.7],[1.0,1.7]])wheel(x,z,WR,.3,'chrome');g.userData.jingle=1}

 g.userData.wheels=wheels;g.userData.sw=sw;g.userData.swAx='z';return g}
