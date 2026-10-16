/* =====================================================================================================
   mkPickup(kind, colour): the desert pickup, in three versions. Replaces the 'truck' branch of mkVehModel, which
   the pickup, the army jeep (VEHK.jeep, mdl:'truck') and the monster truck (VEHK.monster, mdl:'truck') all use.
     kind 'pickup'   the rust-red pickup: chrome grille and bumpers, a couple of crates in the bed
     kind 'jeep'     the army truck: matte olive, white stars, black bumpers, jerrycans and a spare wheel, ARMY plates
     kind 'monster'  the MONSTER TRUCK: glossy blue with flames, body lifted 1.15 m on long shocks, 2 m wheels
   colour overrides the paint.

   SIZE      Pickup and jeep: 2.1 m wide, 4.8 m long (4.96 with bumpers), cab roof 1.98 m.
             Monster: wheels 2.0 m across at x ±1.3 (3.2 m wide over the tyres), roof 3.13 m (before the game's
             VEHK.monster.sc = 1.15 scale).
   ORIGIN    Centre of the truck, on the ground.   FRONT  -z.
   SAME HOOKS AS mkVehModel:
             userData.wheels [{p, t, front}]: p at the wheel centre, t the tyre (the game spins t.rotation.x; the hub is
                             inside t so it rolls too). Pickup/jeep wheels: x ±1.02, z ±1.55, r 0.44 (VEHK.truck.whr).
                             Monster: x ±1.3, z ±1.55, r 1.0 (VEHK.monster.whr).
             userData.sw     steering wheel Group at (0.45, 1.42, -0.72) (+1.15 for the monster), rotation.x -1.15, turns on z
             userData.swAx   'z'
   SEATS     Unchanged: VEHK.truck seats (driver 0.45 / z -0.95, passenger -0.45, two in the bed at ±0.62, z 1.2,
             sitting on the wheel wells). The bench cushion is at y 1.0 like the old model.
   MONSTER   This model lifts the monster's body itself (by 1.15). The game must NOT also apply VEHK.monster.lift to it;
             keep applying VEHK.monster.sc (1.15).
   ALSO      Skip vehMore() extras for these three (mirrors, plates, exhaust, aerial are built in).
   ===================================================================================================== */
function mkPickup(kind,colour){
 kind=kind||'pickup';
 const g=new THREE.Group();const MON=kind=='monster',JEEP=kind=='jeep',LIFT=MON?1.15:0;
 const body=new THREE.Group();body.position.y=LIFT;g.add(body);/* everything but the wheels and the suspension */
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.45,metalness:.35},o||{}));
 const paintC=colour!=null?colour:MON?0x2a8ad8:JEEP?0x4a5a3a:0x8a3a2a;
 const paint=JEEP?M(paintC,{roughness:.85,metalness:.08}):M(paintC,{roughness:.32,metalness:.45}),dk=M(0x1a1a1a,{roughness:.85,metalness:0}),
  chrome=JEEP?M(0x26282a,{roughness:.7,metalness:.3}):M(0xd0d4d8,{metalness:.55,roughness:.22}),trim=M(0x2a2622,{roughness:.9,metalness:0}),seatM=M(JEEP?0x3a3a2a:0x5a3a26,{roughness:.8,metalness:0}),
  bedM=M(JEEP?0x3a4a2e:0x2e2a26,{roughness:.9,metalness:.2}),
  glass=new THREE.MeshStandardMaterial({color:0x9ac8e0,transparent:true,opacity:.28,roughness:.05,metalness:.3,side:THREE.DoubleSide,depthWrite:false}),
  hl=M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.7,roughness:.1}),tl=M(0x701010,{emissive:0xc01010,emissiveIntensity:.6,roughness:.2});
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||body).add(o);return o};
 const CYL=(r,len,m,x,y,z,ax,p,seg)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,seg||12),m);o.position.set(x,y,z);if(ax=='x')o.rotation.z=Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;(p||body).add(o);return o};
 const strip=(a,b,t,m)=>{const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),d=Bv.clone().sub(A);const o=new THREE.Mesh(new THREE.BoxGeometry(t,d.length(),t),m);o.position.copy(A).add(Bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());body.add(o);return o};
 const FONT='"Barlow Semi Condensed",DoorsSans,Arial,sans-serif';
 const B_T=.03;
 const extrude=(shape,w,m,x)=>{const geo=new THREE.ExtrudeGeometry(shape,{depth:w-2*B_T,bevelEnabled:true,bevelThickness:B_T,bevelSize:B_T,bevelSegments:2,curveSegments:14});
  const o=new THREE.Mesh(geo,m);o.rotation.y=-Math.PI/2;o.position.x=(x||0)+(w-2*B_T)/2;body.add(o);return o};
 const W=2.1,WZ=1.55,WR0=.44,AR=.52,BOT=.5;/* body width, wheel z, the (pickup) wheel radius the arches are cut for, arch radius, body bottom */
 /* ---------- front: hood, fenders and nose (z -2.4 … -0.95) ---------- */
 {const s=new THREE.Shape();s.moveTo(-.95,BOT);s.lineTo(-WZ+AR,BOT);s.lineTo(-WZ+AR,WR0);s.absarc(-WZ,WR0,AR,0,Math.PI,false);s.lineTo(-WZ-AR,BOT);s.lineTo(-2.3,BOT);
  s.quadraticCurveTo(-2.4,BOT+.02,-2.4,.66);s.lineTo(-2.4,1.06);s.quadraticCurveTo(-2.39,1.2,-2.26,1.22);s.lineTo(-1.45,1.28);s.lineTo(-1.38,1.32);s.lineTo(-.95,1.36);s.lineTo(-.95,BOT);
  extrude(s,W,paint)}
 /* ---------- cab: doors (thin slabs), floor, back wall with the rear window, roof, glass ---------- */
 for(const sd of[-1,1]){const s=new THREE.Shape();s.moveTo(-.97,BOT+.04);s.lineTo(-.18,BOT+.04);s.lineTo(-.18,1.38);s.lineTo(-.97,1.38);s.lineTo(-.97,BOT+.04);extrude(s,.1,paint,sd*1.0)}
 BX(1.92,.32,.8,dk,0,.68,-.58);BX(1.9,.03,.78,trim,0,.85,-.58);/* cab floor */
 for(const sd of[-1,1])BX(.03,.4,.74,trim,sd*.945,1.12,-.58);/* door cards */
 BX(2.06,.92,.1,paint,0,.96,-.15);/* back wall, below the window */
 for(const sd of[-1,1])BX(.3,.41,.1,paint,sd*.9,1.625,-.15);BX(2.06,.09,.1,paint,0,1.875,-.15);/* window posts and header, tucked under the roof */
 {const p=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.41),glass);p.position.set(0,1.625,-.15);body.add(p)}/* rear window */
 {const s=new THREE.Shape();const hw=1.0;s.moveTo(-hw,0);s.quadraticCurveTo(-hw,.05,-hw+.06,.06);s.lineTo(hw-.06,.06);s.quadraticCurveTo(hw,.05,hw,0);s.lineTo(-hw,0);
  const r=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:1.08,bevelEnabled:false,curveSegments:8}),paint);r.position.set(0,1.92,-1.18);body.add(r);BX(1.9,.02,1.0,M(0xd8d0c0,{roughness:.9,metalness:0}),0,1.91,-.66)}
 {const L=Math.hypot(.6,.23),ws=new THREE.Mesh(new THREE.PlaneGeometry(1.96,L),glass);ws.position.set(0,1.62,-1.28);ws.rotation.x=Math.atan2(.23,.6);body.add(ws)}/* windscreen, from (z -1.39, y 1.32) to (-1.17, 1.92) */
 const pane=(pts,x)=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))s.lineTo(p[0],p[1]);const m=new THREE.Mesh(new THREE.ShapeGeometry(s),glass);m.rotation.y=-Math.PI/2;m.position.x=x;body.add(m)};
 for(const sd of[-1,1]){pane([[-1.33,1.38],[-1.16,1.9],[-.2,1.9],[-.2,1.38]],sd*.995);strip([sd*1.0,1.32,-1.39],[sd*1.0,1.93,-1.17],.08,paint);strip([sd*1.04,1.39,-1.36],[sd*1.04,1.39,-.2],.03,chrome)}
 /* ---------- inside ---------- */
 BX(1.9,.12,.42,trim,0,1.42,-1.16);/* dash top, on the cowl; its back edge is at z -0.95 */
 {const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.fillStyle='#14120f';x.fillRect(0,0,256,64);
  for(const[cx,lbl]of[[70,'SPEED'],[186,JEEP?'TEMP':'FUEL']]){x.strokeStyle='#d8d0b8';x.lineWidth=2;x.beginPath();x.arc(cx,36,24,Math.PI*.8,Math.PI*2.2);x.stroke();x.fillStyle='#d8d0b8';x.font='9px '+FONT;x.textAlign='center';x.fillText(lbl,cx,58);x.strokeStyle='#ff6020';x.beginPath();x.moveTo(cx,36);x.lineTo(cx-14,24);x.stroke()}
  const p=new THREE.Mesh(new THREE.PlaneGeometry(.5,.125),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),emissive:0x40a0ff,emissiveIntensity:.15,roughness:.4}));p.position.set(.45,1.4,-.948);p.rotation.x=-.3;body.add(p)}
 const sw=new THREE.Group();sw.position.set(.45,1.42,-.72);/* its top edge stays 4 cm behind the dash */sw.rotation.x=-1.15;body.add(sw);
 {const r=new THREE.Mesh(new THREE.TorusGeometry(.19,.022,8,24),dk);sw.add(r);for(const a of[0,2.1,4.2]){const sp=new THREE.Mesh(new THREE.BoxGeometry(.17,.025,.02),dk);sp.position.set(Math.cos(a)*.085,Math.sin(a)*.085,0);sp.rotation.z=a;sw.add(sp)}
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.05,12),chrome);hub.rotation.x=Math.PI/2;sw.add(hub);const col=new THREE.Mesh(new THREE.CylinderGeometry(.03,.035,.36,8),dk);col.rotation.x=Math.PI/2;col.position.z=-.19;sw.add(col)}
 BX(1.6,.09,.42,trim,0,.895,-.66);BX(1.7,.13,.5,seatM,0,1.0,-.66);/* seat base and bench */{const bk=BX(1.7,.6,.1,seatM,0,1.34,-.36);bk.rotation.x=-.12}/* bench seat */
 if(JEEP){BX(.22,.05,.1,dk,-.6,1.5,-1.0);BX(.18,.15,.1,M(0x2a3a22),-.6,1.43,-1.0)}/* a radio */
 /* ---------- the bed ---------- */
 BX(1.92,.13,2.4,bedM,0,.965,1.22);/* bed floor: top at y 1.03, above the tyres */
 for(let i=0;i<6;i++)BX(.05,.012,2.38,chrome,-.75+i*.3,1.036,1.22);/* ribs on the floor */
 for(const sd of[-1,1]){const s=new THREE.Shape();s.moveTo(-.08,BOT);s.lineTo(WZ-AR,BOT);s.lineTo(WZ-AR,WR0);s.absarc(WZ,WR0,AR,Math.PI,0,true);s.lineTo(WZ+AR,BOT);s.lineTo(2.32,BOT);
  s.quadraticCurveTo(2.4,BOT+.02,2.4,.62);s.lineTo(2.4,1.55);s.lineTo(-.08,1.55);s.lineTo(-.08,BOT);extrude(s,.12,paint,sd*.99);
  BX(.16,.04,2.5,chrome,sd*.99,1.57,1.16);/* rail cap */
  BX(.24,.27,.94,bedM,sd*.82,1.165,WZ)}/* wheel wells inside the bed (the bed passengers sit on these) */
 BX(1.86,.52,.08,paint,0,1.29,-.04);/* front wall of the bed */
 BX(1.86,.92,.08,paint,0,1.06,2.4);BX(1.86,.03,.1,chrome,0,1.53,2.4);/* tailgate and its top */
 {const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d');x.clearRect(0,0,512,96);x.fillStyle=JEEP?'#e8e4d0':MON?'#ffd040':'#e8e4d8';x.font='bold 70px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText(JEEP?'U.S.D. ARMY':MON?'MONSTER':'DESERT WORKS',256,52,490);
  const p=new THREE.Mesh(new THREE.PlaneGeometry(1.3,.24),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),transparent:true,alphaTest:.3,roughness:.5}));p.position.set(0,1.2,2.446);body.add(p)}
 /* ---------- front and back details ---------- */
 const bumper=(z)=>{BX(2.0,.2,.16,chrome,0,.66,z);for(const sd of[-1,1]){const e=CYL(.1,.16,chrome,sd*1.0,.66,z,'z')}};bumper(-2.48);bumper(2.5);
 {const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');x.fillStyle='#111';x.fillRect(0,0,256,128);x.fillStyle=JEEP?'#3a3c3e':'#b8bcc0';for(let i=8;i<128;i+=14)x.fillRect(6,i,244,5);for(let i=0;i<256;i+=42)x.fillRect(i,0,4,128);
  const gm=M(0xffffff,{map:new THREE.CanvasTexture(c),metalness:.6,roughness:.3});BX(1.1,.42,.05,[chrome,chrome,chrome,chrome,chrome,gm],0,.94,-2.43);
  BX(1.18,.05,.06,chrome,0,1.17,-2.43);BX(1.18,.05,.06,chrome,0,.71,-2.43)}
 for(const sd of[-1,1]){CYL(.12,.05,hl,sd*.78,.95,-2.415,'z');const ring=new THREE.Mesh(new THREE.TorusGeometry(.125,.02,8,20),chrome);ring.position.set(sd*.78,.95,-2.44);body.add(ring);
  BX(.14,.06,.04,M(0xffa020,{emissive:0xff8000,emissiveIntensity:.3}),sd*.78,.76,-2.42);
  BX(.12,.36,.04,tl,sd*.92,1.28,2.452);BX(.14,.38,.02,chrome,sd*.92,1.28,2.442)}/* tail lights on the bed corners */
 const plate=(z,ry,y)=>{const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');x.fillStyle=JEEP?'#2a2a26':'#f0e8d0';x.fillRect(0,0,256,128);x.strokeStyle=JEEP?'#e8e4d0':'#2a2a2a';x.lineWidth=6;x.strokeRect(4,4,248,120);
  x.fillStyle=JEEP?'#e8e4d0':'#b03020';x.font='bold 22px '+FONT;x.textAlign='center';x.fillText(JEEP?'U.S.D. ARMY':'DESERT STATE',128,30);x.fillStyle=JEEP?'#e8e4d0':'#1a1a1a';x.font='bold 64px '+FONT;x.fillText(JEEP?'4X 213':MON?'MONSTR':'TRK 88',128,100,230);
  const p=new THREE.Mesh(new THREE.PlaneGeometry(.36,.18),M(0xffffff,{map:new THREE.CanvasTexture(c),metalness:.2,roughness:.5}));p.position.set(0,y,z);p.rotation.y=ry;body.add(p)};
 plate(-2.566,Math.PI,.66);plate(2.586,0,.66);
 for(const sd of[-1,1]){BX(.16,.03,.04,dk,sd*1.1,1.45,-.9);BX(.04,.16,.12,chrome,sd*1.18,1.48,-.9);BX(.015,.03,.14,chrome,sd*1.055,1.25,-.5)}/* mirrors, door handles */
 CYL(.007,.9,chrome,.95,1.95,-1.25,null);/* aerial */
 /* ---------- livery ---------- */
 const decal=(w,h,draw)=>{const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/w);draw(c.getContext('2d'),c.width,c.height);return new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),transparent:true,alphaTest:.3,roughness:.5,metalness:.1})};
 const star=(x,w,h)=>{x.fillStyle='#e8e4d0';x.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?w*.19:w*.46;x.lineTo(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r)}x.fill()};
 if(JEEP){const st=decal(.5,.5,(x,w,h)=>{x.strokeStyle='#e8e4d0';x.lineWidth=14;x.beginPath();x.arc(w/2,h/2,w*.46,0,7);x.stroke();star(x,w,h)});
  for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(.5,.5),st);p.position.set(sd*1.058,.95,-.58);p.rotation.y=sd*Math.PI/2;body.add(p)}
  {const p=new THREE.Mesh(new THREE.PlaneGeometry(.6,.6),st);p.rotation.x=-Math.PI/2-.07;p.position.set(0,1.29,-1.85);body.add(p)}/* star on the hood, following its slope */
  /* jerrycans in the bed and a spare wheel against the cab */
  for(let i=0;i<3;i++){const jc=BX(.32,.46,.16,M(0x3a5a2a,{roughness:.6}),-.5+i*.36,1.26,2.2);BX(.2,.03,.03,dk,-.5+i*.36,1.505,2.2)}
  {const sp=CYL(.42,.3,dk,.45,1.45,.18,'z',null,20);CYL(.2,.31,M(0x3a4a2e),.45,1.45,.18,'z')}}
 if(MON){const fl=decal(2.2,.5,(x,w,h)=>{const gr=x.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#ffe040');gr.addColorStop(.5,'#ff8020');gr.addColorStop(1,'rgba(220,40,20,0)');x.fillStyle=gr;
  for(let i=0;i<7;i++){x.beginPath();const y0=h*(.15+i*.11);x.moveTo(0,y0);x.quadraticCurveTo(w*.35,y0-h*.25,w*(.55+.06*(i%3)),y0+h*.02);x.quadraticCurveTo(w*.3,y0+h*.12,0,y0+h*.1);x.fill()}});
  for(const sd of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(2.2,.5),fl);p.position.set(sd*1.058,.9,-1.25);p.rotation.y=sd*Math.PI/2;if(sd<0)p.scale.x=-1;body.add(p)}
  BX(1.6,.12,.12,M(0x1a1a1a),0,2.05,-.6);for(let i=0;i<4;i++)CYL(.07,.08,M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.6}),-.5+i*.33,2.05,-.67,'z')}/* roof light bar */
 if(!JEEP&&!MON){for(let i=0;i<2;i++){const cr=BX(.45,.36,.45,M(0x9a7048,{roughness:.9,metalness:0}),-.2+i*.5,1.21,1.9);cr.rotation.y=i*.4}}
 /* ---------- underneath ---------- */
 const U=M(0x26282a,{roughness:.7,metalness:.4}),U2=M(0x3a3c3e,{roughness:.6,metalness:.5}),rust=M(0x5a3a26,{roughness:.8,metalness:.3});
 for(const sd of[-1,1])BX(.12,.14,4.6,U,sd*.6,.45,0);for(const z of[-1.9,-.6,.6,2.1])BX(1.32,.1,.12,U,0,.45,z);
 BX(.7,.3,.9,U2,0,.42,-1.85);/* engine sump */BX(.34,.24,.6,U2,0,.42,-.7);CYL(.045,2.1,U2,0,.42,.35,'z');/* gearbox, drive shaft */
 CYL(.04,3.6,M(0x5a5048,{roughness:.6,metalness:.5}),-.62,.42,.5,'z');BX(.24,.18,.7,M(0x4a4440,{roughness:.6,metalness:.5}),-.62,.42,.9);CYL(.045,.22,chrome,-.62,.42,2.42,'z');/* exhaust */
 BX(.9,.2,.45,U,.2,.42,2.0);/* fuel tank */
 /* ---------- wheels and suspension (not lifted with the body) ---------- */
 const WR=MON?1.0:WR0,WX=MON?1.38:1.02,TW=MON?.62:.34;/* the monster's wheels sit just outside the body */
 const wheels=[];
 const tread=(()=>{const c=document.createElement('canvas');c.width=64;c.height=64;const x=c.getContext('2d');x.fillStyle='#1a1a1a';x.fillRect(0,0,64,64);x.fillStyle='#0c0c0c';for(let i=0;i<64;i+=16){x.fillRect(0,i,28,8);x.fillRect(36,i+8,28,8)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,MON?14:7);return t})();
 const tyreM=[M(0xffffff,{map:tread,roughness:.9,metalness:0}),dk,dk];/* tread on the round face, plain sides */
 for(const[x,z]of[[-WX,-WZ],[WX,-WZ],[-WX,WZ],[WX,WZ]]){const p=new THREE.Group();p.position.set(x,WR,z);g.add(p);
  const t=new THREE.Mesh(new THREE.CylinderGeometry(WR,WR,TW,26),tyreM);t.rotation.z=Math.PI/2;p.add(t);
  for(const s of[-1,1]){const sh=new THREE.Mesh(new THREE.TorusGeometry(WR-.045,.045,6,26),dk);sh.position.set(0,s*(TW/2-.03),0);sh.rotation.x=Math.PI/2;t.add(sh)}
  /* the wheel: steel (army), chrome (pickup) or a big six-spoke (monster), inside t so it rolls */
  const rimR=MON?.55:.26,rimM=JEEP?M(0x3a4a2e,{roughness:.6,metalness:.3}):M(0xc8ccd0,{metalness:.5,roughness:.25});
  t.add(new THREE.Mesh(new THREE.CylinderGeometry(rimR,rimR,TW+.01,20),rimM));
  t.add(new THREE.Mesh(new THREE.CylinderGeometry(rimR*.3,rimR*.36,TW+.03,12),M(0x8a9094,{metalness:.5,roughness:.35})));
  const nS=MON?6:JEEP?5:8;for(let i=0;i<nS;i++){const a=i/nS*6.283;const sp=new THREE.Mesh(new THREE.BoxGeometry(rimR*.55,TW+.02,MON?.09:.035),M(0x6a7074,{metalness:.5,roughness:.35}));sp.position.set(Math.cos(a)*rimR*.6,0,Math.sin(a)*rimR*.6);sp.rotation.y=-a;t.add(sp)}
  wheels.push({p,t,front:z<0})}
 /* axles, springs and shocks: from the wheels up to the body (long ones on the monster) */
 for(const z of[-WZ,WZ]){CYL(.05,WX*2-TW,U2,0,WR,z,'x',g);for(const sd of[-1,1]){CYL(.15,.1,U2,sd*(WX-TW/2-.05),WR,z,'x',g);
   const top=MON?LIFT+.5:.8,bot=WR,h=top-bot;if(h>.05){const sx=sd*(WX-TW/2-.25);CYL(.045,h,MON?M(0xd8b020,{metalness:.5,roughness:.3}):U2,sx,bot+h/2,z+.15,null,g);CYL(.07,h*.45,MON?M(0x2a2a2e):rust,sx,bot+h*.35,z+.15,null,g);
    if(MON){CYL(.045,h,M(0xd8b020,{metalness:.5,roughness:.3}),sx,bot+h/2,z-.15,null,g);/* link bars */strip2(g,[sx*.4,top-.05,z],[sx,bot,z],.06,U2)}}}}
 if(MON)for(const sd of[-1,1])strip2(g,[sd*.6,LIFT+.4,-WZ],[sd*.6,LIFT+.4,WZ],.1,U2);
 function strip2(par,a,b,t,m){const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),d=Bv.clone().sub(A);const o=new THREE.Mesh(new THREE.BoxGeometry(t,d.length(),t),m);o.position.copy(A).add(Bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());par.add(o)}
 g.userData.wheels=wheels;g.userData.sw=sw;g.userData.swAx='z';
 return g}
