/* =====================================================================================================
   r615: THE PLANE AND THE DESERT BUS, remodelled by the design chat (cars.md parts 11-12).
   - mkPlane(): the plane, with a real cabin you sit in.
   - busShell(): the Desert Bus from outside (body, lights, bumpers, wheels and arches) round the interior.
   - mkMegaInterior(), megaExtras(), megaPolish(): the whole inside of the bus rebuilt (same seats, zones, obstacles and
     hooks as before, so the lounge, slots, hoop, ball pit, hot tub, karaoke and the dash all work the same),
     then biMerge() joins the static parts (about 925 meshes become 150).
   These three replace the base game's functions of the same names (mkMegaBus calls them by name).
   The functions below are the design chat's files, copied as they are.
   ===================================================================================================== */
function mkPlane(){const g=new THREE.Group();g.rotation.order='YXZ';
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.45,metalness:.2},o||{}));
 const FONT='"Barlow Semi Condensed",DoorsSans,Arial,sans-serif';
 const WH=M(0xf2f0e8,{roughness:.35,metalness:.15}),RD=M(0xc02020,{roughness:.4}),dk=M(0x1a1a1a,{roughness:.85,metalness:0}),steel=M(0x8a8e94,{metalness:.7,roughness:.3}),
  IN=M(0x3a3632,{roughness:.9,metalness:0}),seatM=M(0x5a3a26,{roughness:.85,metalness:0}),
  glass=new THREE.MeshStandardMaterial({color:0x9ac8e0,transparent:true,opacity:.28,roughness:.05,metalness:.3,side:THREE.DoubleSide,depthWrite:false});
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const CYL=(r1,r2,len,m,x,y,z,ax,p,seg)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,seg||16),m);o.position.set(x,y,z);if(ax=='x')o.rotation.z=Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;(p||g).add(o);return o};
 const rod=(a,b,r,m,p)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),8),m);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());(p||g).add(o);return o};
 const poly=pts=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))s.lineTo(q[0],q[1]);s.lineTo(pts[0][0],pts[0][1]);return s};
 const ext=(pts,w,m,x,bt,p)=>{bt=bt==null?.02:bt;const geo=new THREE.ExtrudeGeometry(poly(pts),{depth:w-2*bt,bevelEnabled:bt>0,bevelThickness:bt,bevelSize:bt,bevelSegments:1});const o=new THREE.Mesh(geo,m);o.rotation.y=-Math.PI/2;o.position.x=(x||0)+(w-2*bt)/2;(p||g).add(o);return o};
 const plan=(pts,t,m,y,p)=>{const bt=Math.min(.03,t/3);const geo=new THREE.ExtrudeGeometry(poly(pts.map(q=>[q[0],-q[1]])),{depth:t-2*bt,bevelEnabled:true,bevelThickness:bt,bevelSize:bt,bevelSegments:2});const o=new THREE.Mesh(geo,m);o.rotation.x=-Math.PI/2;o.position.y=y-(t-2*bt)/2;(p||g).add(o);return o};
 const pane=(pts,x)=>{const o=new THREE.Mesh(new THREE.ShapeGeometry(poly(pts)),glass);o.rotation.y=-Math.PI/2;o.position.x=x;g.add(o);return o};
 const loft=(st,n,m)=>{const pos=[],idx=[];st.forEach(s=>{for(let j=0;j<=n;j++){const a=j/n*Math.PI*2,c=Math.cos(a),si=Math.sin(a),e=2/(s.p||2);pos.push(s.w/2*Math.sign(c)*Math.pow(Math.abs(c),e),s.y+s.h/2*Math.sign(si)*Math.pow(Math.abs(si),e),s.z)}});
  for(let i=0;i<st.length-1;i++)for(let j=0;j<n;j++){const a=i*(n+1)+j,c=a+n+1;idx.push(a,a+1,c,a+1,c+1,c)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();const o=new THREE.Mesh(geo,m);g.add(o);return o};
 const tex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)};
 const lite=(c,x,y,z)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),new THREE.MeshBasicMaterial({color:c}));o.position.set(x,y,z);g.add(o);return o};
 /* ---------------- engine cowl: a rounded nose closed at the front, running back to the windscreen ---------------- */
 loft([{z:-4.47,w:.5,h:.5,y:1.5},{z:-4.42,w:.86,h:.84,y:1.5},{z:-4.2,w:1.04,h:.98,y:1.48,p:2.4},{z:-3.4,w:1.2,h:1.0,y:1.42,p:2.6},{z:-2.6,w:1.24,h:.86,y:1.38,p:3}],22,WH);
 {const cap=new THREE.Mesh(new THREE.CircleGeometry(.25,18),dk);cap.position.set(0,1.5,-4.475);cap.rotation.y=Math.PI;g.add(cap)}
 for(const sd of[-1,1]){BX(.16,.1,.05,dk,sd*.3,1.25,-4.4);}/* air intakes either side of the spinner */
 rod([.35,1.0,-3.5],[.38,.9,-3.1],.035,M(0x6a5a4a,{metalness:.6}));/* exhaust stub */
 /* ---------------- the cabin: side slabs to the sill, floor, belly, panel, windscreen, roof, windows, doors, seat ---------------- */
 for(const sd of[-1,1])ext([[-2.62,1.0],[.62,1.0],[.62,1.66],[-1.95,1.66],[-2.62,1.81]],.06,WH,sd*.59,.01);
 BX(1.12,.05,3.2,IN,0,1.03,-1.0);BX(1.24,.08,3.24,WH,0,.97,-1.0);/* floor and belly */
 BX(1.12,.36,.14,IN,0,1.45,-2.5);BX(1.18,.05,.3,M(0x1e1e1e,{roughness:.95}),0,1.655,-2.45);/* low enough to see over the cowl from the seat *//* instrument panel and glare shield */
 {const gm=new THREE.MeshStandardMaterial({map:tex(256,64,(k)=>{k.fillStyle='#14120f';k.fillRect(0,0,256,64);for(let i=0;i<5;i++){const cx=26+i*51;k.strokeStyle='#d8d0b8';k.lineWidth=2;k.beginPath();k.arc(cx,32,20,0,7);k.stroke();k.strokeStyle='#ff6020';k.beginPath();k.moveTo(cx,32);k.lineTo(cx+8,18-i*2);k.stroke()}}),emissive:0x40a0ff,emissiveIntensity:.18});
  const p=new THREE.Mesh(new THREE.PlaneGeometry(.95,.24),gm);p.position.set(0,1.47,-2.429);g.add(p)}
 /* windscreen from the cowl (z -2.62, y 1.81) up to the roof (z -1.9, y 2.24), with a centre post */
 {const L=Math.hypot(.72,.43),ws=new THREE.Mesh(new THREE.PlaneGeometry(1.18,L),glass);/* meets the side windows */ws.position.set(0,2.025,-2.26);ws.rotation.x=Math.atan2(.72,.43);g.add(ws)}
 BX(1.24,.06,2.56,WH,0,2.27,-.62);BX(1.12,.02,2.5,M(0xd8d0c0,{roughness:.9}),0,2.235,-.62);/* roof and headliner */
 for(const sd of[-1,1]){pane([[-2.58,1.81],[-1.95,1.67],[.58,1.67],[.58,2.22],[-1.9,2.22]],sd*.59);/* runs right up to the windscreen pillar, along the top of the side */
  rod([sd*.6,1.81,-2.62],[sd*.6,2.24,-1.9],.03,WH);rod([sd*.6,1.66,-1.3],[sd*.6,2.24,-1.3],.025,WH);rod([sd*.6,1.66,.6],[sd*.6,2.24,.6],.03,WH);/* window frames: windscreen pillar, door post, rear post */
  BX(.01,.62,.012,M(0x5a5a5a),sd*.623,1.33,-1.98);BX(.01,.62,.012,M(0x5a5a5a),sd*.623,1.33,-.64);BX(.03,.03,.12,steel,sd*.635,1.5,-.8)}/* door shut lines and handle */
 BX(1.14,1.24,.04,IN,0,1.62,.62);/* cabin back wall */
 BX(.56,.1,.5,seatM,0,1.12,-1.2);{const b=BX(.56,.62,.1,seatM,0,1.48,-.94);b.rotation.x=-.12}BX(.6,.06,.5,steel,0,1.05,-1.2);/* the pilot's seat on its frame */
 /* the yoke */{const s=new THREE.Group();s.position.set(0,1.48,-1.95);s.rotation.x=-1.1;g.add(s);BX(.34,.04,.04,dk,0,0,0,s);for(const sd of[-1,1])BX(.04,.12,.04,dk,sd*.17,.04,0,s);CYL(.025,.025,.5,steel,0,0,-.26,'z',s,8);g.userData.sw=s;g.userData.swAx='z'}
 /* ---------------- the tail cone, fin and tailplane ---------------- */
 loft([{z:.58,w:1.24,h:1.32,y:1.61,p:2.8},{z:2.0,w:.96,h:1.0,y:1.67,p:2.6},{z:3.5,w:.56,h:.62,y:1.8,p:2.3},{z:4.9,w:.2,h:.3,y:1.95},{z:4.95,w:.02,h:.02,y:1.96}],22,WH);
 ext([[3.4,2.1],[4.95,2.0],[5.05,3.2],[4.55,3.3],[3.95,2.3]],.09,RD,0,.02);BX(.095,.9,.01,M(0x7a1010),0,2.6,4.9).rotation.x=.08;/* fin and the rudder line */
 plan([[.2,4.0],[1.8,4.3],[1.8,4.95],[.2,5.0],[-.2,5.0],[-1.8,4.95],[-1.8,4.3],[-.2,4.0]],.07,WH,1.86);
 lite(0xffffff,0,1.96,5.0);lite(0xff2020,0,3.33,4.6);/* tail light, beacon on the fin */
 /* ---------------- the wing on top, with red tips, struts and nav lights ---------------- */
 plan([[-5.5,-.95],[5.5,-.95],[5.5,.35],[-5.5,.35]],.16,WH,2.38);
 for(const sd of[-1,1]){plan([[sd*5.0,-.96],[sd*5.52,-.96],[sd*5.52,.36],[sd*5.0,.36]],.17,RD,2.38);BX(2.2,.01,.03,M(0x9a9890),sd*3.6,2.467,.08);/* red tip, aileron line */
  rod([sd*.6,1.15,-.35],[sd*2.4,2.3,-.35],.035,steel);lite(sd>0?0x20ff40:0xff2020,sd*5.54,2.38,-.95)}
 /* red stripe along the cowl and cabin; the registration on the tail */
 for(const sd of[-1,1]){BX(.012,.1,3.2,RD,sd*.623,1.2,-1.0);const r=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.22),new THREE.MeshStandardMaterial({map:tex(256,52,(k,w,h)=>{k.clearRect(0,0,w,h);k.fillStyle='#ffffff';k.font='bold 44px '+FONT;k.textAlign='center';k.textBaseline='middle';k.fillText('DS-13',w/2,h/2+2)}),transparent:true,alphaTest:.3}));
  r.position.set(sd*.052,2.55,4.5);r.scale.set(.62,.82,1);r.rotation.y=sd*Math.PI/2;g.add(r)}/* on the fin, inside its outline */
 /* ---------------- the propeller ---------------- */
 const pg=new THREE.Group();pg.position.set(0,1.5,-4.62);g.add(pg);{const sp=new THREE.Mesh(new THREE.ConeGeometry(.2,.36,16),RD);sp.rotation.x=-Math.PI/2;sp.position.z=-.06;pg.add(sp);CYL(.21,.21,.08,RD,0,0,.13,'z',pg,16);
  for(const sd of[-1,1]){const bl=new THREE.Mesh(new THREE.BoxGeometry(.13,.78,.04),dk);bl.position.set(0,sd*.48,.05);/* ends where the yellow tip starts */bl.rotation.y=sd*.25;pg.add(bl);BX(.13,.1,.042,M(0xe8c020),0,sd*.92,.05,pg).rotation.y=sd*.25}}g.userData.prop=pg;
 /* ---------------- landing gear: spring legs with wheel spats, a faired nose leg ---------------- */
 const wheels=[];const wheel=(x,z,r,w,front)=>{const p=new THREE.Group();p.position.set(x,r,z);g.add(p);const t=new THREE.Mesh(new THREE.CylinderGeometry(r,r,w,20),dk);t.rotation.z=Math.PI/2;t.userData.r=r;p.add(t);
  t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.5,r*.5,w+.01,14),M(0xd8d8d8,{metalness:.5})));t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.15,r*.15,w+.03,8),steel));wheels.push({p,t,front});return p};
 for(const sd of[-1,1]){rod([sd*.5,.98,-.5],[sd*.95,.45,-.5],.05,steel);rod([sd*.95,.45,-.5],[sd*1.1,.3,-.5],.04,steel);wheel(sd*1.1,-.5,.3,.18,false);
  const sp=new THREE.Mesh(new THREE.SphereGeometry(.38,16,10,0,Math.PI*2,0,Math.PI*.6),WH);sp.scale.set(.42,1,1.4);sp.position.set(sd*1.1,.3,-.5);g.add(sp)}/* wheel spat: covers the top of the tyre */
 rod([0,1.0,-3.55],[0,.4,-3.6],.045,steel);BX(.2,.08,.2,steel,0,.42,-3.6);for(const sd of[-1,1])rod([sd*.09,.42,-3.6],[sd*.09,.22,-3.6],.02,steel);const nw=wheel(0,-3.6,.22,.14,true);
 g.userData.wheels=wheels;return g}

function busShell(g,o){const{HW,Z0,Z1,CH,FH}=o;
 const M=(c,p)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.5,metalness:.2},p||{}));
 const CR=M(0xf0e8d8,{roughness:.6}),OR=M(0xd8701a,{roughness:.5}),dk=M(0x1a1a1a,{roughness:.85,metalness:0}),chrome=M(0xc8ccd2,{metalness:.6,roughness:.22}),steel=M(0x5a5e62,{metalness:.6,roughness:.4}),
  hl=M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.7,roughness:.1}),tl=M(0x701010,{emissive:0xc01010,emissiveIntensity:.6}),am=M(0xffa020,{emissive:0xff8000,emissiveIntensity:.4});
 const BX=(w,h,d,m,x,y,z)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);g.add(b);return b};
 const CYL=(r1,r2,len,m,x,y,z,ax,seg)=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,seg||16),m);c.position.set(x,y,z);if(ax=='x')c.rotation.z=Math.PI/2;else if(ax=='z')c.rotation.x=Math.PI/2;g.add(c);return c};
 const rod=(a,b,r,m)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A);const c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),8),m);c.position.copy(A).add(B).multiplyScalar(.5);c.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(c);return c};
 const tex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)};
 const XO=HW+.12,ZF=Z0-.12,ZB=Z1+.12,TOP=FH+CH+.14;/* outer faces of the interior's walls, roof top */
 /* ---- under-tray and the cream skirt below the walls, with a chrome rub strip ---- */
 BX(HW*2,.45,Z1-Z0,M(0x2a2a2c,{roughness:.8}),0,.53,(Z0+Z1)/2);
 for(const sd of[-1,1]){BX(.06,FH-.3,Z1-Z0+.26,CR,sd*(XO-.025),.3+(FH-.3)/2,(Z0+Z1)/2);BX(.03,.06,Z1-Z0+.2,chrome,sd*(XO+.025),.42,(Z0+Z1)/2)}
 BX(HW*2+.25,FH-.3,.06,CR,0,.3+(FH-.3)/2,ZF+.025);BX(HW*2+.25,FH-.3,.06,CR,0,.3+(FH-.3)/2,ZB-.025);
 /* ---- wheels outside the walls, under orange flares, with mud flaps behind ---- */
 const wheels=[],WX=HW+.33,tr=tex(64,64,(k)=>{k.fillStyle='#1c1c1c';k.fillRect(0,0,64,64);k.fillStyle='#0c0c0c';for(let i=0;i<64;i+=10)k.fillRect(0,i,64,4)});tr.wrapS=tr.wrapT=THREE.RepeatWrapping;tr.repeat.set(1,6);
 for(const z of[Z0+3,Z0+6.5,Z1-7,Z1-3.5])for(const sd of[-1,1]){const p=new THREE.Group();p.position.set(sd*WX,.5,z);g.add(p);
  const t=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.4,26),[M(0xffffff,{map:tr,roughness:.95,metalness:0}),dk,dk]);t.rotation.z=Math.PI/2;t.userData.r=.5;p.add(t);
  for(const s of[-1,1]){const sh=new THREE.Mesh(new THREE.TorusGeometry(.44,.07,6,24),dk);sh.rotation.x=Math.PI/2;sh.position.y=s*.13;t.add(sh)}
  t.add(new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.41,20),chrome));t.add(new THREE.Mesh(new THREE.CylinderGeometry(.1,.13,.44,12),M(0x9aa0a4,{metalness:.6})));
  for(let i=0;i<8;i++){const a=i/8*6.283,n=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.46,6),steel);n.position.set(Math.cos(a)*.2,0,Math.sin(a)*.2);t.add(n)}
  wheels.push({p,t,front:z<Z0+5});
  const fl=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,.54,24,1,true,.3,Math.PI-.6),M(0xd8701a,{roughness:.5,side:THREE.DoubleSide}));fl.rotation.z=Math.PI/2;fl.position.set(sd*(WX-.02),.5,z);g.add(fl);/* flare over the tyre */
  BX(.4,.4,.02,dk,sd*(WX-.02),.4,z+.62);BX(.48,.04,.06,steel,sd*(HW+.33),.62,z+.62)}/* mud flap hung from a bracket off the skirt */
 /* ---- the front: bumper, grille, four round headlights, indicators, wipers, a frame round the destination sign, mirrors ---- */
 BX(HW*2+.3,.28,.24,chrome,0,.55,ZF-.12);for(const sd of[-1,1])BX(.3,.28,.5,chrome,sd*(HW+.02),.55,ZF+.0);
 {const gm=M(0xffffff,{map:tex(256,64,(k)=>{k.fillStyle='#111';k.fillRect(0,0,256,64);k.fillStyle='#b8bcc0';for(let i=6;i<64;i+=9)k.fillRect(4,i,248,3)}),metalness:.6,roughness:.3});BX(2.6,.5,.03,[chrome,chrome,chrome,chrome,chrome,gm],0,FH+.48,ZF-.015)}
 for(const sd of[-1,1]){for(const x of[1.55,2.05]){CYL(.16,.16,.04,hl,sd*x,FH+.5,ZF-.02,'z');const r=new THREE.Mesh(new THREE.TorusGeometry(.17,.025,8,20),chrome);r.position.set(sd*x,FH+.5,ZF-.04);g.add(r)}BX(.24,.1,.04,am,sd*2.45,FH+.2,ZF-.02)}
 for(const sd of[-1,1]){const w=BX(.025,1.1,.025,dk,sd*.7,FH+1.4,Z0-.085);w.rotation.z=sd*1.1}/* wipers resting on the windscreen */
 {const y=FH+CH-.35;BX(2.84,.05,.06,dk,0,y+.25,ZF-.02);BX(2.84,.05,.06,dk,0,y-.25,ZF-.02);for(const sd of[-1,1])BX(.05,.55,.06,dk,sd*1.4,y,ZF-.02)}
 for(const sd of[-1,1]){rod([sd*XO,FH+2.0,Z0+.2],[sd*(XO+.45),FH+2.3,Z0-.25],.03,dk);rod([sd*XO,FH+1.4,Z0+.2],[sd*(XO+.45),FH+1.9,Z0-.25],.03,dk);BX(.08,.6,.28,dk,sd*(XO+.48),FH+2.0,Z0-.25)}
 /* ---- roof: two air-con pods, a hatch, amber marker lights at the front, red at the back ---- */
 {const ac=M(0xffffff,{map:tex(128,64,(k)=>{k.fillStyle='#d8d4cc';k.fillRect(0,0,128,64);k.fillStyle='#8a8680';for(let x=8;x<128;x+=12)k.fillRect(x,10,6,44)}),roughness:.6});for(const z of[Z0+9,Z1-9])BX(1.8,.32,2.6,[CR,CR,CR,CR,ac,ac],0,TOP+.16,z)}
 BX(.9,.08,.9,M(0x2a2c30),0,TOP+.04,(Z0+Z1)/2);
 for(let i=0;i<5;i++){BX(.14,.06,.04,am,-1.6+i*.8,TOP-.12,ZF-.02);BX(.14,.06,.04,tl,-1.6+i*.8,TOP-.12,ZB+.02)}
 /* ---- the back: engine grille, tail-light clusters, a ladder, plate, exhaust, bumper ---- */
 {const gm=M(0xffffff,{map:tex(256,64,(k)=>{k.fillStyle='#111';k.fillRect(0,0,256,64);k.fillStyle='#8a8e92';for(let i=4;i<64;i+=8)k.fillRect(4,i,248,4)}),metalness:.5});BX(3.0,.6,.03,[CR,CR,CR,CR,gm,gm],0,FH+.55,ZB+.015)}
 for(const sd of[-1,1]){BX(.3,.36,.04,tl,sd*(HW-.3),FH+.45,ZB+.02);BX(.3,.14,.04,am,sd*(HW-.3),FH+.75,ZB+.02);BX(.3,.12,.04,hl,sd*(HW-.3),FH+.9,ZB+.02)}
 for(const x of[1.7,2.1])rod([x,FH+.95,ZB+.1],[x,TOP+.02,ZB+.1],.025,chrome);for(let y=FH+1.1;y<TOP;y+=.3)rod([1.7,y,ZB+.1],[2.1,y,ZB+.1],.018,chrome);for(const x of[1.7,2.1])for(const y of[FH+1.0,TOP-.1])rod([x,y,ZB],[x,y,ZB+.1],.02,chrome);
 {const p=new THREE.Mesh(new THREE.PlaneGeometry(.5,.25),M(0xffffff,{map:tex(256,128,(k)=>{k.fillStyle='#f0e8d0';k.fillRect(0,0,256,128);k.strokeStyle='#2a2a2a';k.lineWidth=6;k.strokeRect(4,4,248,120);k.fillStyle='#b03020';k.font='bold 22px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';k.textAlign='center';k.fillText('DESERT STATE',128,30);k.fillStyle='#1a1a1a';k.font='bold 64px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';k.fillText('BUS 13',128,100)}),metalness:.2}));p.position.set(0,.98,ZB+.006);g.add(p)}
 CYL(.07,.07,.35,chrome,-2.0,.36,ZB+.1,'z');BX(HW*2+.3,.28,.24,chrome,0,.55,ZB+.12);
 return wheels}
function biKit(){if(biKit.k)return biKit.k;const k={};
 const FONT='"Barlow Semi Condensed",DoorsSans,Arial,sans-serif';k.FONT=FONT;
 const tex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t};k.tex=tex;
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6,metalness:.05},o||{}));k.M=M;
 /* a textured material; s = texture repeats per metre (the helpers set UVs in metres, so nothing stretches) */
 const TM=(t,s,o)=>{const m=M(0xffffff,o);m.map=t;m.userData.s=s;return m};
 const rnd=(()=>{let a=1234567;return()=>((a=Math.imul(a^a>>>15,a|1)+0x6d2b79f5|0)>>>0)/4294967296})();/* own little RNG: never touches Math.random */
 /* seat fabric: 90s coach moquette, navy with desert squiggles */
 k.FAB=TM(tex(128,128,(x)=>{x.fillStyle='#1d2a48';x.fillRect(0,0,128,128);x.lineWidth=3;x.lineCap='round';
  for(let i=0;i<9;i++){const cx=rnd()*128,cy=rnd()*128;x.strokeStyle=['#e07a2a','#2fa5b5','#f0c040'][i%3];x.beginPath();x.moveTo(cx-12,cy);for(let j=1;j<=4;j++)x.lineTo(cx-12+j*6,cy+(j%2?-5:5));x.stroke()}
  for(let i=0;i<14;i++){x.fillStyle=['#3a5a8a','#e07a2a','#7ac0c8'][i%3];x.beginPath();x.arc(rnd()*128,rnd()*128,2,0,7);x.fill()}}),3,{roughness:.95});
 k.PLA=M(0x4a4a50,{roughness:.55});k.PLA2=M(0x8a8a90,{roughness:.5});
 k.STL=M(0xb8bcc2,{metalness:.7,roughness:.3});k.CHR=M(0xd8dce2,{metalness:.85,roughness:.18});k.BRASS=M(0xd8b060,{metalness:.8,roughness:.3});
 k.BLK=M(0x1a1a1c,{roughness:.8});k.WHT=M(0xf4f0e8,{roughness:.9});k.LEA=M(0x34343a,{roughness:.55});
 k.CR=M(0xf0e8d8,{roughness:.8});k.OR=M(0xd8701a);k.BRN=M(0x6a3a1a);k.DK=M(0x2a2c30);
 k.GL=new THREE.MeshStandardMaterial({color:0x9ac8e0,transparent:true,opacity:.2,roughness:.05,metalness:.3,depthWrite:false,side:THREE.DoubleSide});
 k.LAMP=M(0xfff8e8,{emissive:0xfff0c8,emissiveIntensity:.9});k.YEL=M(0xf0c020,{roughness:.7});
 /* wood */
 const wood=(base,dark)=>tex(256,256,(x)=>{x.fillStyle=base;x.fillRect(0,0,256,256);for(let i=0;i<70;i++){x.strokeStyle=dark;x.globalAlpha=.12+rnd()*.2;x.lineWidth=1+rnd()*2;const y=rnd()*256;x.beginPath();x.moveTo(0,y);for(let s=0;s<=8;s++)x.lineTo(s*32,y+Math.sin(s*.9+y)*3);x.stroke()}x.globalAlpha=1});
 k.WD=TM(wood('#9a6a3a','#4a2a12'),1.5,{roughness:.55});k.WD2=TM(wood('#6a4224','#2a1608'),1.5,{roughness:.55});
 /* lower walls: terracotta vinyl with a fine grain */
 k.LOW=TM(tex(64,64,(x)=>{x.fillStyle='#8c4a30';x.fillRect(0,0,64,64);for(let i=0;i<60;i++){x.fillStyle=rnd()<.5?'#7e4029':'#985538';x.fillRect(rnd()*64,rnd()*64,1,3)}}),3,{roughness:.8});
 k.KICK=M(0x3a2418,{roughness:.7});
 /* upper walls and ceiling: cream, finely perforated */
 k.UP=TM(tex(64,64,(x)=>{x.fillStyle='#ece2cc';x.fillRect(0,0,64,64);x.fillStyle='#d4c8b0';for(let i=4;i<64;i+=8)for(let j=4;j<64;j+=8)x.fillRect(i,j,2,2)}),5,{roughness:.9});
 /* floors */
 k.RUB=TM(tex(64,64,(x)=>{x.fillStyle='#4a4c50';x.fillRect(0,0,64,64);x.fillStyle='#3a3c40';for(let i=0;i<64;i+=8)x.fillRect(0,i,64,3)}),5,{roughness:.9});
 k.CARP=TM(tex(64,64,(x)=>{x.fillStyle='#2c3448';x.fillRect(0,0,64,64);for(let i=0;i<300;i++){x.fillStyle=['#3a4460','#232a3c','#4a3a52'][i%3];x.fillRect(rnd()*64,rnd()*64,1,1)}}),4,{roughness:1});
 {const t=tex(256,1024,(x)=>{x.scale(2,2);const R='#4e0c12',R2='#66141c',G='#c08a38',G2='#7a5422',N='#24080c';x.fillStyle=R;x.fillRect(0,0,128,512);
   x.fillStyle=N;x.fillRect(0,0,14,512);x.fillRect(114,0,14,512);x.fillStyle=G2;x.fillRect(3,0,2,512);x.fillRect(123,0,2,512);x.fillStyle=G;x.fillRect(11,0,1.5,512);x.fillRect(115.5,0,1.5,512);
   for(let y=0;y<512;y+=12){x.fillStyle=G2;x.beginPath();x.moveTo(8,y+1);x.lineTo(10,y+6);x.lineTo(8,y+11);x.lineTo(6,y+6);x.fill();x.beginPath();x.moveTo(120,y+1);x.lineTo(122,y+6);x.lineTo(120,y+11);x.lineTo(118,y+6);x.fill()}
   x.fillStyle=R2;x.fillRect(19,0,90,512);x.strokeStyle=G2;x.lineWidth=1.5;x.beginPath();x.moveTo(18,0);x.lineTo(18,512);x.moveTo(110,0);x.lineTo(110,512);x.stroke();
   /* a lattice of thin diamonds over the field */x.strokeStyle='rgba(36,8,12,.5)';x.lineWidth=1;for(let y=-128;y<640;y+=32){x.beginPath();x.moveTo(19,y);x.lineTo(109,y+90);x.moveTo(109,y);x.lineTo(19,y+90);x.stroke()}
   for(let y=0;y<512;y+=128){const cy=y+40;/* medallion */x.fillStyle=N;x.beginPath();x.moveTo(64,cy-32);x.lineTo(96,cy);x.lineTo(64,cy+32);x.lineTo(32,cy);x.fill();x.strokeStyle=G;x.lineWidth=2;x.stroke();
    x.fillStyle=R;x.beginPath();x.moveTo(64,cy-22);x.lineTo(86,cy);x.lineTo(64,cy+22);x.lineTo(42,cy);x.fill();x.strokeStyle=G2;x.lineWidth=1.5;x.stroke();
    x.fillStyle=G;x.beginPath();x.arc(64,cy,7,0,7);x.fill();x.fillStyle=N;x.beginPath();x.arc(64,cy,3,0,7);x.fill();for(const[dx,dy]of[[0,-14],[0,14],[-12,0],[12,0]]){x.fillStyle=G2;x.beginPath();x.arc(64+dx,cy+dy,2.5,0,7);x.fill()}
    /* an eight-point star between them */const sy=y+104;x.fillStyle=G2;x.beginPath();for(let i=0;i<16;i++){const a=i/16*Math.PI*2,r=i%2?5:13;x.lineTo(64+Math.sin(a)*r,sy-Math.cos(a)*r)}x.fill();x.fillStyle=N;x.beginPath();x.arc(64,sy,3,0,7);x.fill()}
   for(let i=0;i<5000;i++){x.fillStyle=rnd()<.5?'rgba(0,0,0,.1)':'rgba(255,210,170,.05)';x.fillRect(rnd()*128,rnd()*512,.6,1.2)}/* woven pile */});t.offset.x=.5;k.RUN=TM(t,1/1.12,{roughness:1})}
 k.PAR=TM(tex(256,256,(x)=>{const C=['#a8743e','#9a6634','#b07c46','#946030','#a26c3a'];for(let r=0;r<8;r++){const off=(r%2)*64;for(let c=-1;c<3;c++){x.fillStyle=C[(r*3+c+5)%5];x.fillRect(c*128+off,r*32,128,32);x.fillStyle='rgba(60,30,10,.45)';x.fillRect(c*128+off,r*32,2,32)}x.fillStyle='rgba(60,30,10,.45)';x.fillRect(0,r*32,256,1)}
  for(let i=0;i<160;i++){x.fillStyle='rgba(70,40,15,.16)';x.fillRect(rnd()*256,rnd()*256,8+rnd()*24,1)}}),1,{roughness:.5});
 k.TILE=TM(tex(128,128,(x)=>{x.fillStyle='#e8f0f2';x.fillRect(0,0,128,128);for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.fillStyle=(i+j)%2?'#4aa8c8':'#7cc4dc';x.fillRect(i*32+2,j*32+2,28,28)}}),3,{roughness:.25});
 k.DASH=TM(tex(64,64,(x)=>{x.fillStyle='#26272b';x.fillRect(0,0,64,64);for(let i=0;i<300;i++){x.fillStyle=rnd()<.5?'#232428':'#2a2b30';x.fillRect(rnd()*64,rnd()*64,1,1)}}),14,{roughness:.85});
 k.GRILL=TM(tex(64,64,(x)=>{x.fillStyle='#202022';x.fillRect(0,0,64,64);x.fillStyle='#5a5a60';for(let i=2;i<64;i+=6)for(let j=2;j<64;j+=6){x.beginPath();x.arc(i+(j/6%2)*3,j,1.6,0,7);x.fill()}}),10,{roughness:.6,metalness:.4});
 k.VENT=TM(tex(64,64,(x)=>{x.fillStyle='#c8ccd0';x.fillRect(0,0,64,64);x.fillStyle='#5a5e64';for(let i=4;i<64;i+=8)x.fillRect(4,i,56,3)}),3,{metalness:.4,roughness:.4});
 k.NET=new THREE.MeshBasicMaterial({map:tex(64,64,(x)=>{x.clearRect(0,0,64,64);x.strokeStyle='#ffffff';x.lineWidth=3;x.beginPath();x.moveTo(0,0);x.lineTo(64,64);x.moveTo(64,0);x.lineTo(0,64);x.stroke()}),transparent:true,alphaTest:.3,side:THREE.DoubleSide});k.NET.userData.s=8;
 /* text plates (MeshBasic, like the old labels) */
 k.lab=(s,w,h,bg,fg,fs)=>{const c=document.createElement('canvas');c.width=512;c.height=Math.max(32,Math.round(512*h/w));const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);x.fillStyle=fg;let f=fs||60;x.font='bold '+f+'px '+FONT;while(x.measureText(s).width>480&&f>12){f-=2;x.font='bold '+f+'px '+FONT}x.textAlign='center';x.textBaseline='middle';x.fillText(s,256,c.height/2+2);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}))};
 /* UVs in metres: boxes by face direction (offset by the box position so neighbours line up), anything else scaled */
 k.wuv=(ge,s,ox,oy,oz)=>{const p=ge.attributes.position,n=ge.attributes.normal,uv=ge.attributes.uv;if(!uv)return ge;if(ge.type!=='BoxGeometry'){for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*s,uv.getY(i)*s)}else for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i)),X=p.getX(i)+(ox||0),Y=p.getY(i)+(oy||0),Z=p.getZ(i)+(oz||0);let u,v;if(ax>=ay&&ax>=az){u=Z;v=Y}else if(ay>=az){u=X;v=Z}else{u=X;v=Y}uv.setXY(i,u*s,v*s)}uv.needsUpdate=true;return ge};
 /* builders bound to a parent group. Meshes made here are marked static (st) for the merge in megaPolish */
 k.H=g=>{const add=(o,p)=>{(p||g).add(o);o.userData.st=1;return o},S=m=>m&&m.userData&&m.userData.s;
  const B=(w,h,d,x,y,z,m,p)=>{const ge=new THREE.BoxGeometry(w,h,d);if(S(m))k.wuv(ge,S(m),x,y,z);const o=new THREE.Mesh(ge,m);o.position.set(x,y,z);return add(o,p)};
  const C=(r1,r2,h,x,y,z,m,ax,p,seg,open,t0,tl)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg||16,1,!!open,t0||0,tl==null?Math.PI*2:tl),m);o.position.set(x,y,z);if(ax=='x')o.rotation.z=Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;return add(o,p)};
  const SP=(r,x,y,z,m,p,sx,sy,sz,seg)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,seg||14,Math.max(6,(seg||14)*2/3|0)),m);o.position.set(x,y,z);if(sx)o.scale.set(sx,sy,sz);return add(o,p)};
  const poly=pts=>{const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))s.lineTo(q[0],q[1]);s.lineTo(pts[0][0],pts[0][1]);return s};
  /* ext: a side profile [[z,y],...] pushed across x, width w, centred on x */
  const ext=(pts,w,m,x,p,bt)=>{bt=bt==null?.02:bt;const ge=new THREE.ExtrudeGeometry(poly(pts),{depth:w-2*bt,bevelEnabled:bt>0,bevelThickness:bt,bevelSize:bt,bevelSegments:2});if(S(m))k.wuv(ge,S(m));const o=new THREE.Mesh(ge,m);o.rotation.y=-Math.PI/2;o.position.x=(x||0)+(w-2*bt)/2;return add(o,p)};
  const rod=(a,b,r,m,p,seg)=>{const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),d=Bv.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),seg||8),m);o.position.copy(A).add(Bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return add(o,p)};
  const tube=(pts,r,m,p,seg)=>add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(q=>new THREE.Vector3(...q))),seg||24,r,6,false),m),p);
  /* a text plate; ry turns it (0 faces +z) */
  const L=(s,w,h,bg,fg,fs,x,y,z,ry,p,rx)=>{const o=k.lab(s,w,h,bg,fg,fs);o.position.set(x,y,z);o.rotation.set(rx||0,ry||0,0,'YXZ');(p||g).add(o);return o};
  return{add,B,C,SP,ext,rod,tube,L,poly}};
 return biKit.k=k}

/* merge static meshes: by material, per 4 m of bus and per side, so a blown-up bus still flies apart in chunks */
function biMerge(g){g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(g.matrixWorld).invert(),bk=new Map();
 g.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!o.userData.st||Array.isArray(o.material)||o.onBeforeRender!==THREE.Object3D.prototype.onBeforeRender)return;let p=o.parent;while(p&&p!==g){if(!p.userData.fix)return;p=p.parent}if(!p)return;
  const mx=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld),c=new THREE.Vector3().setFromMatrixPosition(mx);if(mx.determinant()<0)return;
  const key=o.material.uuid+'|'+Math.floor((c.z+20)/4)+'|'+(c.x<0?0:1);if(!bk.has(key))bk.set(key,{m:o.material,l:[]});bk.get(key).l.push({o,mx})});
 let n0=0,n1=0;for(const{m,l}of bk.values()){if(l.length<2)continue;let n=0;const gs=l.map(({o,mx})=>{const ge=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();ge.applyMatrix4(mx);n+=ge.attributes.position.count;return ge});
  const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2);let i=0;for(const ge of gs){const c=ge.attributes.position.count;P.set(ge.attributes.position.array,i*3);N.set(ge.attributes.normal.array,i*3);if(ge.attributes.uv)U.set(ge.attributes.uv.array,i*2);i+=c;ge.dispose()}
  const mg=new THREE.BufferGeometry();mg.setAttribute('position',new THREE.BufferAttribute(P,3));mg.setAttribute('normal',new THREE.BufferAttribute(N,3));mg.setAttribute('uv',new THREE.BufferAttribute(U,2));mg.computeBoundingSphere();
  g.add(new THREE.Mesh(mg,m));for(const{o}of l)o.parent.remove(o);n0+=l.length;n1++}
 return[n0,n1]}

/* =====================================================================================================
   mkMegaInterior: the shell, the cockpit, the seats
   ===================================================================================================== */
function mkMegaInterior(){const g=new THREE.Group(),{HW,Z0,Z1,CH}=MBUS,ZL=Z1-Z0,ZC=(Z0+Z1)/2,k=biKit(),{B,C,SP,ext,rod,tube,L}=k.H(g),M=k.M;
 const it={g,HW,Z0,Z1,CH,obs:[],seats:[],dleaf:[],doors:MBUS.doors,zones:[],drv:{x:-1.75,z:Z0+1.3},sk:new THREE.Group(),ents:[],proj:[]};
 const{CR,OR,BRN,DK,GL,CHR,STL,WD,WD2,LOW,UP,KICK,PLA,BLK,LAMP,YEL}=k;
 it.lab=(s,w,h,bg,fg,fs)=>k.lab(s,w,h,bg,fg,fs);
 /* ---- floor slab and roof slab (as before), then the floor finishes: rubber at the front, carpet in the seating,
         a red runner down the aisle, wood parquet in the lounge and games room ---- */
 B(HW*2+.24,.08,ZL+.24,0,-.04,ZC,M(0x2a2c34));B(HW*2+.24,.14,ZL+.24,0,CH+.07,ZC,CR);
 const FS=Z0+4.7,FL=-2.9;/* seating starts, lounge starts */
 B(HW*2,.008,FS-Z0,0,.004,(Z0+FS)/2,k.RUB);B(HW*2,.008,FL-FS,0,.004,(FS+FL)/2,k.CARP);B(HW*2,.008,Z1-FL,0,.004,(FL+Z1)/2,k.PAR);
 {const r0=Z0+1.15,r1=9.05,rl=r1-r0,rc=(r0+r1)/2,BD=M(0x3a1014,{roughness:.9});B(1.12,.008,rl,0,.012,rc,k.RUN);for(const sx of[-1,1])B(.025,.014,rl,sx*.5725,.011,rc,BD);/* bound edges */
  const FR=M(0xe0c48a,{roughness:1});for(const[z,dz]of[[r0,-1],[r1,1]]){B(1.17,.014,.03,0,.011,z+dz*.015,BD);for(let i=0;i<28;i++)B(.014,.004,.05,-.54+i*.04,.009,z+dz*.055,FR)}/* fringe */
  for(let z=r0+.6;z<r1-.2;z+=1)for(const sx of[-1,1])B(.01,.01,.06,sx*.5725,.023,z,k.BRASS)}/* little brass clips along the edges */
 for(const z of[FS,FL])B(HW*2,.012,.05,0,.006,z,STL);/* metal strips where the floors meet */
 /* ---- the side walls. Outside (same as before, the new outer shell is built round it): cream panels, a band of
         glass, orange and brown stripes, dark pillars. Inside: terracotta lining, a wood sill and header rail,
         cream upper lining, pillar covers, curtains on a brass rail ---- */
 const pil=[];
 const wall=(sd,a,b)=>{const l=b-a,c=(a+b)/2;if(l<.02)return;const x=sd*(HW+.06);
  B(.12,1.1,l,x,.55,c,CR);B(.12,CH-2.3,l,x,2.3+(CH-2.3)/2,c,CR);const gp=new THREE.Mesh(new THREE.PlaneGeometry(l,1.2),GL);gp.rotation.y=Math.PI/2;gp.position.set(x,1.7,c);g.add(gp);
  B(.04,.16,l,sd*(HW+.14),.75,c,OR);B(.04,.09,l,sd*(HW+.14),.5,c,BRN);for(let z=a+.4;z<b-.2;z+=2.4){B(.13,1.2,.1,x,1.7,z,DK);pil.push([sd,z])}
  const xi=sd*(HW-.015);B(.03,.1,l,xi,.05,c,KICK);B(.03,.98,l,xi,.59,c,LOW);B(.11,.05,l,sd*(HW-.055),1.105,c,WD);C(.025,.025,l,sd*(HW-.11),1.105,c,WD,'z',null,8);
  B(.08,.07,l,sd*(HW-.04),2.335,c,WD);B(.03,CH-.03-2.37,l,xi,(2.37+CH-.03)/2,c,UP);B(.05,.05,l,sd*(HW-.055),CH-.055,c,CR);
  if(l>.6)C(.012,.012,l-.1,sd*(HW-.1),2.27,c,k.BRASS,'z',null,6)};
 wall(-1,Z0,Z1);{let a=Z0;for(const[d0,d1]of MBUS.doors){wall(1,a,d0);
   /* the door: header above it (both sides), dark frame posts, a yellow step edge, chrome grab poles */
   B(.12,CH-2.3,d1-d0,HW+.06,2.3+(CH-2.3)/2,(d0+d1)/2,CR);B(.03,CH-.03-2.37,d1-d0,HW-.015,(2.37+CH-.03)/2,(d0+d1)/2,UP);B(.08,.07,d1-d0,HW-.04,2.335,(d0+d1)/2,WD);
   for(const z of[d0+.03,d1-.03])B(.14,2.3,.06,HW+.06,1.15,z,DK);B(.14,.012,d1-d0,HW-.04,.006,(d0+d1)/2,YEL);
   for(const z of[d0-.12,d1+.12]){C(.02,.02,CH-.03,HW-.15,(CH-.03)/2,z,CHR,null,null,10);C(.035,.035,.02,HW-.15,.01,z,CHR,null,null,10);C(.035,.035,.02,HW-.15,CH-.04,z,CHR,null,null,10)}
   /* two folding leaves. h = hinge (the game turns h.rotation.y), lf = the leaf. Frame, rails, two panes, rubber
      edge where they meet, a push bar inside */
   a=d1;const w=(d1-d0)/2-.04;for(const[hz,sd]of[[d0+.06,1],[d1-.06,-1]]){const h=new THREE.Group();h.position.set(HW+.06,0,hz);g.add(h);const lf=new THREE.Group();lf.position.z=sd*w/2;h.add(lf);const DB=(ww,hh,dd,y,z,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(.05,hh,dd),m);o.position.set(0,y,z);lf.add(o);return o};
    DB(.05,.1,w,.07,0,DK);DB(.05,.12,w,2.18,0,DK);DB(.05,.1,w,1.1,0,DK);for(const ez of[-w/2+.03,w/2-.03])DB(.05,2.25,.06,1.13,ez,DK);
    const rb=new THREE.Mesh(new THREE.BoxGeometry(.06,2.2,.025),BLK);rb.position.set(0,1.13,-sd*(w/2+.005));lf.add(rb);
    for(const[y0,y1]of[[.12,1.05],[1.15,2.12]]){const gp2=new THREE.Mesh(new THREE.PlaneGeometry(w-.1,y1-y0),GL);gp2.rotation.y=Math.PI/2;gp2.position.y=(y0+y1)/2;lf.add(gp2)}
    const pb=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,w-.2,8),CHR);pb.rotation.x=Math.PI/2;pb.position.set(-.07,1.0,0);lf.add(pb);for(const ez of[-(w-.24)/2,(w-.24)/2]){const st=new THREE.Mesh(new THREE.BoxGeometry(.05,.02,.02),CHR);st.position.set(-.045,1.0,ez);lf.add(st)}
    it.dleaf.push({h,sd,z:(d0+d1)/2,a:0})}}wall(1,a,Z1)}
 for(const[sd,z]of pil)B(.05,1.2,.16,sd*(HW-.02),1.7,z,CR);/* pillar covers inside */
 /* curtains: two gathered drapes and a tie-back at each pillar, not by the doors or the wiring cabinet */
 {const CU=M(0xb8402a,{roughness:1}),TIE=M(0xe0b050,{roughness:.9});const prof=[];for(let i=0;i<=8;i++)prof.push([i*.022,Math.sin(i*Math.PI/2)*.016]);for(let i=8;i>=0;i--)prof.push([i*.022,Math.sin(i*Math.PI/2)*.016-.02]);
  const shp=k.H(g).poly(prof),cg=new THREE.ExtrudeGeometry(shp,{depth:.95,bevelEnabled:false});cg.translate(-.088,.002,0);cg.rotateX(Math.PI/2);cg.rotateY(-Math.PI/2);
  const nearDoor=z=>MBUS.doors.some(([d0,d1])=>z>d0-.35&&z<d1+.35);
  for(const[sd,z]of pil){if(sd>0&&nearDoor(z))continue;if(sd<0&&z>Z0+2.4&&z<Z0+3.7)continue;
   for(const dz of[-.2,.2]){const c=new THREE.Mesh(cg,CU);c.position.set(sd*(HW-.08),2.24,z+dz);c.userData.st=1;g.add(c);
    const tb=C(.06,.06,.05,sd*(HW-.08),1.55,z+dz,TIE,null,null,10)}}}
 /* ---- ceiling: cream lining, light strips with diffusers, a roof hatch ---- */
 B(HW*2,.03,ZL,0,CH-.015,ZC,UP);
 for(let z=Z0+2;z<Z1;z+=4){B(.7,.04,2.2,0,CH-.05,z,CR);B(.6,.01,2.1,0,CH-.075,z,LAMP)}
 B(.96,.03,.96,0,CH-.045,0,DK);B(.84,.012,.84,0,CH-.062,0,M(0xd8d4cc));
 /* ---- the front: the outside wall and windscreen as before; inside a moulded dash, the driver's binnacle with lit
         gauges, a proper wheel, the driver's seat on its spring base, pedals, sun visors, a ceiling console ---- */
 B(HW*2,.95,.12,0,.475,Z0-.06,CR);B(HW*2,CH-2.6,.12,0,2.6+(CH-2.6)/2,Z0-.06,CR);{const ws=new THREE.Mesh(new THREE.PlaneGeometry(HW*2,1.65),GL);ws.position.set(0,1.78,Z0-.06);g.add(ws)}for(const x of[-HW+.05,0,HW-.05])B(.1,1.65,.1,x,1.78,Z0-.06,DK);
 for(const x of[-HW+.08,HW-.08])B(.1,1.62,.05,x,1.8,Z0+.025,CR);B(.06,1.62,.04,0,1.8,Z0+.02,CR);
 B(HW*2-.06,CH-.03-2.6,.03,0,(2.6+CH-.03)/2,Z0+.015,UP);
 ext([[Z0,0],[Z0,1.0],[Z0+.75,1.0],[Z0+.85,.97],[Z0+.9,.86],[Z0+.88,.1],[Z0+.92,0]],HW*2-.04,k.DASH,0);
 {const x=it.drv.x;/* binnacle */ext([[Z0+.2,1.0],[Z0+.22,1.2],[Z0+.32,1.22],[Z0+.45,1.08],[Z0+.45,1.0]],.66,k.DASH,x);
  const gc=k.tex(256,128,(c)=>{c.fillStyle='#0c0d10';c.fillRect(0,0,256,128);const dial=(cx,cy,r,lab,col)=>{c.strokeStyle='#d8dce0';c.lineWidth=2;c.beginPath();c.arc(cx,cy,r,0,7);c.stroke();for(let i=0;i<=10;i++){const a=Math.PI*.75+i/10*Math.PI*1.5;c.beginPath();c.moveTo(cx+Math.cos(a)*r*.82,cy+Math.sin(a)*r*.82);c.lineTo(cx+Math.cos(a)*r*.95,cy+Math.sin(a)*r*.95);c.stroke()}c.strokeStyle=col;c.lineWidth=3;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(2.9)*r*.75,cy+Math.sin(2.9)*r*.75);c.stroke();c.fillStyle='#d8dce0';c.font='bold 13px '+k.FONT;c.textAlign='center';c.fillText(lab,cx,cy+r*.55)};
   dial(70,64,50,'KM/H','#ff8a20');dial(186,64,50,'RPM','#ff8a20');c.fillStyle='#40e060';c.fillRect(118,20,20,6);c.fillStyle='#ffb020';c.fillRect(118,100,20,6)});
  const gp=new THREE.Mesh(new THREE.PlaneGeometry(.5,.25),new THREE.MeshStandardMaterial({map:gc,emissive:0xffffff,emissiveMap:gc,emissiveIntensity:.6,roughness:.3}));const ang=Math.atan2(.13,.14);gp.position.set(x,1.15,Z0+.385);gp.rotation.x=-ang;gp.translateZ(.026);g.add(gp);
  /* the wheel: rim, three spokes, a hub with the bus badge, the column into the dash */
  const wg=new THREE.Group();wg.position.set(x,1.12,Z0+.75);wg.rotation.x=-1.0;wg.userData.fix=1;g.add(wg);const wh=k.H(wg);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.26,.03,10,32),BLK);rim.userData.st=1;wg.add(rim);
  for(const a of[Math.PI/2+Math.PI,Math.PI/6,Math.PI*5/6]){const s=wh.B(.24,.05,.016,Math.cos(a)*.13,Math.sin(a)*.13,0,PLA);s.rotation.z=a}
  wh.C(.07,.07,.05,0,0,.0,PLA,'z',null,20);const badge=new THREE.Mesh(new THREE.CircleGeometry(.05,20),M(0xd8701a,{metalness:.4,roughness:.3}));badge.position.z=.026;wg.add(badge);badge.userData.st=1;
  wh.C(.035,.04,.36,0,0,-.2,PLA,'z',null,12);
  /* the driver's seat */
  C(.13,.16,.08,x,.04,it.drv.z,BLK,null,null,16);C(.11,.11,.28,x,.2,it.drv.z,M(0x202022,{roughness:.9}),null,null,16);for(let i=0;i<4;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(.115,.012,6,20),BLK);r.rotation.x=Math.PI/2;r.position.set(x,.1+i*.065,it.drv.z);r.userData.st=1;g.add(r)}
  B(.5,.05,.5,x,.36,it.drv.z,PLA);
  ext([[-.27,.4],[-.29,.45],[-.27,.52],[-.22,.54],[.22,.52],[.26,.5],[.26,.4]].map(([z,y])=>[it.drv.z+z,y]),.6,k.LEA,x);
  ext([[.2,.52],[.23,.8],[.22,1.05],[.26,1.12],[.27,1.28],[.31,1.33],[.37,1.33],[.4,1.25],[.38,.52]].map(([z,y])=>[it.drv.z+z,y]),.58,k.LEA,x);
  for(const sd of[-1,1]){B(.07,.06,.38,x+sd*.34,.72,it.drv.z+.02,k.LEA);B(.04,.2,.05,x+sd*.34,.6,it.drv.z+.2,PLA)}
  /* pedals */for(const[dx,w]of[[-.12,.1],[.12,.16]]){const pd=B(w,.2,.025,x+dx,.16,Z0+.98,BLK);pd.rotation.x=-.5;rod([x+dx,.26,Z0+.95],[x+dx,.42,Z0+.9],.012,STL)}
  /* gear push-buttons on the dash */B(.18,.04,.22,-1.22,1.04,Z0+.45,PLA);[['D','#40e060'],['N','#ffffff'],['R','#ff4040']].forEach(([s,c],i)=>L(s,.04,.04,'#1a1a1e',c,40,-1.28+i*.06,1.066,Z0+.47,0,null,-Math.PI/2));
  it.obs.push({x0:x-.4,x1:x+.4,z0:it.drv.z-.35,z1:it.drv.z+.42})}
 it.obs.push({x0:-HW,x1:HW,z0:Z0,z1:Z0+.95});
 /* vents in the dash face and a glovebox */for(const x of[-.9,0,.9])B(.34,.12,.012,x,.8,Z0+.925,k.VENT);B(.6,.3,.012,1.7,.6,Z0+.915,M(0x2e2f34,{roughness:.8}));B(.12,.03,.02,1.7,.72,Z0+.925,STL);
 /* ticket printer at the right end of the dash */B(.32,.24,.26,2.3,1.16,Z0+.3,M(0x3a3c42,{roughness:.5}));L('TICKETS',.24,.05,'#3a3c42','#ffd040',60,2.3,1.22,Z0+.437,0);B(.2,.012,.02,2.3,1.08,Z0+.435,BLK);
 /* sun visors and the ceiling console over the driver (radio, CB) */
 for(const x of[-1.75,1.25]){C(.012,.012,.7,x,2.58,Z0+.07,STL,'x',null,6);const v=B(.72,.28,.02,x,2.58-.131,Z0+.07+.048,M(0x5a5048,{roughness:.9}));v.rotation.x=-.35}
 B(.8,.18,.45,-1.75,CH-.12,Z0+.3,k.DASH);{const rc=k.tex(256,64,(c)=>{c.fillStyle='#141518';c.fillRect(0,0,256,64);c.fillStyle='#ffb020';c.font='bold 26px monospace';c.fillText('FM 101.3',14,40);c.fillStyle='#5a5e64';for(let i=0;i<5;i++)c.fillRect(150+i*20,18,14,28)});const rp=new THREE.Mesh(new THREE.PlaneGeometry(.6,.14),new THREE.MeshStandardMaterial({map:rc,emissive:0xffffff,emissiveMap:rc,emissiveIntensity:.4}));rp.position.set(-1.75,CH-.12,Z0+.527);g.add(rp)}
 /* ---- the back wall, now with a real window ---- */
 {const BW=2.4,Y0=1.65,Y1=2.55;B(HW*2,Y0,.12,0,Y0/2,Z1+.06,CR);B(HW*2,CH-Y1,.12,0,(Y1+CH)/2,Z1+.06,CR);for(const sd of[-1,1])B(HW-BW/2,Y1-Y0,.12,sd*(BW/2+(HW-BW/2)/2),(Y0+Y1)/2,Z1+.06,CR);
  const bw=new THREE.Mesh(new THREE.PlaneGeometry(BW,Y1-Y0),GL);bw.position.set(0,(Y0+Y1)/2,Z1+.06);g.add(bw);
  const LW=HW*2-.06;B(LW,1.08,.03,0,.54,Z1-.015,LOW);B(LW,Y0-1.08,.03,0,(1.08+Y0)/2,Z1-.015,UP);B(LW,CH-.03-Y1,.03,0,(Y1+CH-.03)/2,Z1-.015,UP);for(const sd of[-1,1])B(HW-.03-BW/2,Y1-Y0,.03,sd*(BW/2+(HW-.03-BW/2)/2),(Y0+Y1)/2,Z1-.015,UP);
  B(BW+.08,.04,.06,0,Y0-.0,Z1-.02,BLK);B(BW+.08,.04,.06,0,Y1,Z1-.02,BLK);for(const sd of[-1,1])B(.04,Y1-Y0+.04,.06,sd*(BW/2+.02),(Y0+Y1)/2,Z1-.02,BLK);
  B(.05,.05,LW,0,CH-.055,Z1-.055,CR).rotation.y=Math.PI/2}
 B(HW*2-.06,.05,.05,0,CH-.055,Z0+.055,CR);
 /* ---- passenger seats: rows of four, an aisle in the middle. Each pair: moulded cushions and backs in the moquette,
         grey plastic shells with a fold-down tray and a pocket, armrests, a steel frame ---- */
 const pair=new THREE.Group();pair.userData.fix=1;{const h=k.H(pair),F=k.FAB;
  for(const s of[-.425,.425]){h.ext([[-.25,.44],[-.27,.49],[-.26,.545],[-.22,.565],[.18,.55],[.22,.53],[.22,.44]],.72,F,s);h.B(.7,.05,.46,s,.42,-.02,PLA);
   h.ext([[.19,.57],[.2,.75],[.22,.95],[.22,1.04],[.245,1.09],[.26,1.22],[.29,1.26],[.34,1.27],[.365,1.2],[.32,.6],[.3,.57]],.7,F,s);
   h.ext([[.29,.5],[.34,1.18],[.395,1.18],[.35,.5]],.74,PLA,s);
   const hc=h.B(.5,.15,.008,s,1.16,.227,k.WHT);hc.rotation.x=.115;
   const tr=h.B(.46,.3,.012,s,.95,.412,k.PLA2);tr.rotation.x=.066;const tl=h.B(.08,.025,.012,s,1.06,.42,BLK);tl.rotation.x=.066;
   const pk=h.B(.5,.16,.012,s,.68,.392,M(0x2a2a30,{roughness:.9}));pk.rotation.x=.066}
  for(const ax of[-.83,0,.83]){h.B(.06,.05,.42,ax,.72,.02,PLA);h.B(.04,.22,.05,ax,.6,.16,STL)}
  for(const lx of[-.55,.55]){h.rod([lx,.02,-.15],[lx,.42,-.05],.022,STL);h.rod([lx,.02,.18],[lx,.42,.12],.022,STL);h.B(.06,.02,.42,lx,.01,.015,STL)}
  h.C(.024,.024,1.5,0,.41,.03,STL,'x',null,8)}
 for(let z=Z0+5.6;z<=Z0+12.6;z+=1.0){for(const x of[-1.95,-1.1,1.1,1.95]){it.seats.push({x,z});it.obs.push({x0:x-.41,x1:x+.41,z0:z-.27,z1:z+.33})}
  for(const sd of[-1,1]){const p=pair.clone();p.position.set(sd*1.525,0,z);g.add(p);/* grab bar on the aisle seat's shell */const ax=sd*.76;rod([ax,1.14,z+.41],[ax,1.14,z+.49],.012,CHR);rod([ax,1.14,z+.49],[ax,.98,z+.48],.012,CHR);rod([ax,.98,z+.48],[ax,.98,z+.4],.012,CHR)}}
 /* ---- luggage racks over the seats: a deep aluminium shelf, a lip with row numbers, reading lights under it ---- */
 {const RZ0=Z0+5.1,RZ1=Z0+13.1,RL=RZ1-RZ0,RC=(RZ0+RZ1)/2,AL=M(0xb0b4ba,{metalness:.6,roughness:.35});
  for(const sd of[-1,1]){B(.92,.025,RL,sd*(HW-.49),2.5,RC,AL);B(.015,.1,RL,sd*(HW-.955),2.53,RC,AL);B(.3,.04,RL,sd*(HW-.8),2.467,RC,M(0xd8d4cc,{roughness:.6}));
   for(let z=RZ0+.1;z<=RZ1;z+=2){rod([sd*(HW-.03),2.4,z],[sd*(HW-.6),2.49,z],.015,AL);B(.03,.12,.04,sd*(HW-.045),2.42,z,AL)}
   let r=1;for(let z=Z0+5.6;z<=Z0+12.6;z+=1,r++){for(const dx of[-.07,.07])C(.025,.025,.01,sd*(HW-.8)+dx,2.444,z,M(0xfff4d8,{emissive:0xffe8b0,emissiveIntensity:.5}),null,null,12);
    L(String(r)+(sd<0?'A':'C'),.14,.07,'#1a2e52','#ffe9a8',70,sd*(HW-.97),2.53,z,sd<0?Math.PI/2:-Math.PI/2)}
   /* suitcases and a hat */const cols=[0x6a3a2a,0x2a4a6a,0x8a2a2a,0x3a5a3a,0xc8a060,0x4a3a6a];for(let i=0;i<5;i++){const z=RZ0+.6+i*1.55+(sd>0?.5:0),w=.36+((i*7+(sd>0?3:0))%3)*.06,cm=M(cols[(i+(sd>0?2:0))%cols.length],{roughness:.7});
    ext([[z-w/2,2.515],[z-w/2,2.72],[z+w/2,2.72],[z+w/2,2.515]],.5,cm,sd*(HW-.42),null,.025);rod([sd*(HW-.42)-.06,2.745,z],[sd*(HW-.42)+.06,2.745,z],.012,BLK);for(const dx of[-.06,.06])rod([sd*(HW-.42)+dx,2.72,z],[sd*(HW-.42)+dx,2.745,z],.01,BLK)}}
  {const hm=M(0x8a6a3a,{roughness:.9}),hx=-(HW-.42),hz=RZ0+3.4;C(.22,.22,.02,hx,2.524,hz,hm,null,null,18);C(.11,.13,.12,hx,2.594,hz,hm,null,null,14);C(.132,.132,.03,hx,2.55,hz,M(0x3a2010),null,null,14)}}
 /* ---- grab rails along the aisle ceiling, with hanging straps ---- */
 for(const sd of[-1,1]){C(.016,.016,8.2,sd*.62,CH-.1,Z0+9.1,CHR,'z',null,8);for(let z=Z0+5.1;z<=Z0+13.1;z+=2)rod([sd*.62,CH-.1,z],[sd*.62,CH-.03,z],.012,CHR);
  for(let z=Z0+5.5;z<=Z0+12.6;z+=1){B(.03,.2,.008,sd*.62,CH-.21,z,M(0x2a2a2e));const r=new THREE.Mesh(new THREE.TorusGeometry(.055,.013,6,14),M(0xf0e8d0,{roughness:.5}));r.position.set(sd*.62,CH-.355,z);r.rotation.y=Math.PI/2;r.userData.st=1;g.add(r)}}
 /* ---- hanging area signs, both sides printed ---- */
 const sign=(s,z,w)=>{B(w+.06,.36,.04,0,CH-.42,z,DK);for(const r of[0,Math.PI])L(s,w,.3,'#1a2e52','#ffe9a8',56,0,CH-.42,z+(r?-.0215:.0215),r);for(const sx of[-1,1])rod([sx*w*.4,CH-.24,z],[sx*w*.4,CH-.03,z],.008,CHR)};
 sign('🍿 LOUNGE',-2.6,1.6);sign('🎯 GAMES · 🏀 HOOPS',3.2,2.4);sign('🛁 HOT TUB · 🎤 KARAOKE',12.65,2.8);
 return it}

/* =====================================================================================================
   megaExtras: the furniture you use. Same spots, same zones, same ex.* hooks as before
   ===================================================================================================== */
function megaExtras(it){const g=it.g,{HW,Z0,Z1,CH}=it,k=biKit(),M=k.M,{B,C,SP,ext,rod,tube,L}=k.H(g),ex={},Z=(kk,x0,x1,z0,z1)=>it.zones.push({kk,x0,x1,z0,z1,k:kk});
 const{CHR,STL,BLK,PLA,DK,WD,WD2}=k;
 /* little panel with its own parent: H for a hook group (not merged) */
 const HG=(p)=>{const h=k.H(p);const add=h.add;return h};
 /* ---- AUTOPILOT: brushed plate, a guarded toggle (ex.ap.lev turns on z), a lamp in a chrome bezel (ex.ap.led) ---- */
 {const ap=new THREE.Group();ap.position.set(-.7,1.06,Z0+.6);g.add(ap);const h=HG(ap);h.ext([[-.12,-.022],[-.12,.018],[.12,.018],[.12,-.022]],.36,M(0x2c2e33,{metalness:.5,roughness:.4}),0,null,.008);
  for(const sx of[-.13,-.01])h.B(.012,.05,.07,sx,.045,-.01,M(0xc0c4c8,{metalness:.8,roughness:.3}));
  const lev=new THREE.Group();lev.position.set(-.07,.03,-.01);ap.add(lev);h.C(.009,.009,.13,0,.065,0,M(0xc0c4c8,{metalness:.8}),null,lev,8);h.SP(.022,0,.135,0,M(0xd02020,{roughness:.4}),lev,1,1.3,1);h.C(.022,.022,.012,0,.006,0,BLK,null,lev,12);
  h.C(.032,.032,.01,.1,.031,-.03,k.CHR,null,null,16);const led=new THREE.Mesh(new THREE.SphereGeometry(.024,14,8,0,Math.PI*2,0,Math.PI/2),M(0x200000,{emissive:0x400000}));led.position.set(.1,.035,-.03);ap.add(led);
  h.L('AUTOPILOT',.3,.06,'#2c2e33','#ffd040',60,0,.032,.085,0,null,-Math.PI/2);ex.ap={lev,led};Z('ap',-1.25,-.15,Z0+.9,Z0+1.8)}
 /* ---- HORN: a big red mushroom button (ex.horn, the game pushes it down) in a chrome collar ---- */
 {const hn=new THREE.Group();hn.position.set(.75,1.06,Z0+.6);g.add(hn);const h=HG(hn);h.ext([[-.12,-.022],[-.12,.018],[.12,.018],[.12,-.022]],.3,M(0x2c2e33,{metalness:.5,roughness:.4}),0,null,.008);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.098,.014,8,24),CHR);ring.rotation.x=Math.PI/2;ring.position.y=.03;hn.add(ring);
  const hb=new THREE.Mesh(new THREE.CylinderGeometry(.08,.09,.06,24),M(0xd02020,{emissive:0x300000,roughness:.35}));hb.position.y=.05;hn.add(hb);const cap=new THREE.Mesh(new THREE.SphereGeometry(.08,20,8,0,Math.PI*2,0,Math.PI/2),hb.material);cap.scale.y=.3;cap.position.y=.03;hb.add(cap);
  h.L('HORN',.2,.045,'#2c2e33','#ffffff',60,0,.032,.098,0,null,-Math.PI/2);ex.horn=hb;Z('horn',.2,1.3,Z0+.9,Z0+1.8);
  /* DESTINATION: a dial face with marks, a knob with a pointer (ex.dknob turns on y), a route card */
  const dd=new THREE.Group();dd.position.set(1.85,1.06,Z0+.6);g.add(dd);const d=HG(dd);d.ext([[-.13,-.022],[-.13,.018],[.13,.018],[.13,-.022]],.5,M(0x2c2e33,{metalness:.5,roughness:.4}),0,null,.008);
  const ft=k.tex(128,128,(c)=>{c.fillStyle='#e8e0cc';c.beginPath();c.arc(64,64,62,0,7);c.fill();c.strokeStyle='#1a1a1a';c.lineWidth=4;for(let i=0;i<6;i++){const a=i/6*Math.PI*2;c.beginPath();c.moveTo(64+Math.sin(a)*46,64-Math.cos(a)*46);c.lineTo(64+Math.sin(a)*60,64-Math.cos(a)*60);c.stroke()}});
  const face=new THREE.Mesh(new THREE.CircleGeometry(.1,28),new THREE.MeshBasicMaterial({map:ft,transparent:true}));face.rotation.x=-Math.PI/2;face.position.set(-.15,.031,-.02);dd.add(face);
  const kn=new THREE.Mesh(new THREE.CylinderGeometry(.06,.07,.05,20),M(0xc0c4c8,{metalness:.8,roughness:.3}));kn.position.set(-.15,.05,-.02);dd.add(kn);const ptr=new THREE.Mesh(new THREE.BoxGeometry(.016,.012,.07),M(0xffb020,{emissive:0x402000}));ptr.position.set(0,.031,-.03);kn.add(ptr);
  for(const[dx,c]of[[.04,'#ffb020'],[.1,'#40c0ff'],[.16,'#ff60a0']]){d.C(.014,.014,.012,dx,.03,-.04,M(new THREE.Color(c).getHex(),{emissive:new THREE.Color(c).getHex(),emissiveIntensity:.3}),null,null,10)}
  d.L('DESTINATION',.36,.055,'#2c2e33','#ffb020',50,.03,.032,.1,0,null,-Math.PI/2);ex.dknob=kn;Z('dest',1.3,2.6,Z0+.9,Z0+1.8);
  /* TYRE PUMP: a red barrel on a foot plate, T-handle (ex.pump moves on y), a gauge, a coiled hose to a nozzle */
  const pu=new THREE.Group();pu.position.set(HW-.28,0,Z0+4.1);g.add(pu);const p=HG(pu);
  p.B(.3,.03,.3,0,.015,0,M(0x2a2a2a,{roughness:.8}));for(const sx of[-1,1])p.B(.08,.025,.12,sx*.1,.04,-.06,M(0x4a4a4a));
  p.C(.085,.085,.62,0,.34,0,M(0xc81e1e,{roughness:.4,metalness:.2}),null,null,20);p.C(.09,.09,.03,0,.66,0,M(0x2a2a2a),null,null,20);p.C(.09,.09,.03,0,.05,0,M(0x2a2a2a),null,null,20);
  const gg=k.tex(64,64,(c)=>{c.fillStyle='#f4f0e4';c.beginPath();c.arc(32,32,31,0,7);c.fill();c.strokeStyle='#d02020';c.lineWidth=3;c.beginPath();c.arc(32,32,24,Math.PI*.8,Math.PI*2.2);c.stroke();c.strokeStyle='#111';c.beginPath();c.moveTo(32,32);c.lineTo(48,22);c.stroke()});
  p.C(.05,.05,.03,-.1,.5,0,CHR,'x',null,18);const gf=new THREE.Mesh(new THREE.CircleGeometry(.042,20),new THREE.MeshBasicMaterial({map:gg}));gf.position.set(-.119,.5,0);gf.rotation.y=-Math.PI/2;pu.add(gf);
  p.B(.012,.11,.26,-.093,.3,0,M(0xf0f0f0));p.L('TYRE PUMP',.24,.09,'#d02020','#ffffff',56,-.106,.3,0,-Math.PI/2);
  const ph=new THREE.Group();ph.position.y=.72;pu.add(ph);p.C(.015,.015,.32,0,.1,0,CHR,null,ph,8);p.C(.025,.025,.34,0,.26,0,BLK,'z',ph,10);for(const s of[-1,1])p.C(.03,.03,.06,0,.26,s*.2,M(0xd02020),'z',ph,10);
  p.tube([[0,.08,.08],[.02,.12,.16],[.1,.2,.14],[.12,.3,.06],[.08,.36,-.02],[0,.4,-.08],[-.06,.46,-.1]],.012,BLK,null,30);p.C(.016,.012,.08,-.07,.5,-.1,CHR,null,null,8);
  ex.pump=ph;it.obs.push({x0:HW-.42,x1:HW,z0:Z0+3.95,z1:Z0+4.25});Z('pump',HW-1.3,HW,Z0+3.4,Z0+4.8)}
 Z('drv',-2.6,-1.25,Z0+.9,Z0+2.5);
 /* ---- the mirror (static) and the little pine tree that swings under it (ex.af turns on z) ---- */
 {const mx=-.95,my=CH-.32,mz=Z0+.5;rod([mx,my+.03,mz],[mx,CH-.03,mz],.014,M(0x2a2a2e));C(.04,.04,.02,mx,CH-.04,mz,M(0x2a2a2e),null,null,12);
  ext([[mz-.025,my-.055],[mz-.025,my+.055],[mz+.02,my+.05],[mz+.02,my-.05]],.36,M(0x2a2a2e,{roughness:.5}),mx,null,.012);
  const mg=new THREE.Mesh(new THREE.PlaneGeometry(.32,.086),M(0xc8d8e0,{metalness:.95,roughness:.08}));mg.position.set(mx,my,mz+.033);g.add(mg);
  const af=new THREE.Group();af.position.set(mx+.1,my-.07,mz);g.add(af);const sl=new THREE.Mesh(new THREE.CylinderGeometry(.002,.002,.14,4),M(0xf0f0f0));sl.position.y=-.07;af.add(sl);
  const ts=new THREE.Shape();ts.moveTo(0,0);[[.05,-.04],[.02,-.04],[.06,-.09],[.025,-.09],[.07,-.145],[.012,-.145],[.012,-.17],[-.012,-.17],[-.012,-.145],[-.07,-.145],[-.025,-.09],[-.06,-.09],[-.02,-.04],[-.05,-.04]].forEach(q=>ts.lineTo(q[0],q[1]));ts.lineTo(0,0);
  const tr=new THREE.Mesh(new THREE.ShapeGeometry(ts),M(0x2aa040,{emissive:0x0a3010,side:THREE.DoubleSide}));tr.position.y=-.14;af.add(tr);ex.af=af}
 /* ---- WIRING cabinet under the left window: hazard border, louvred door with a window onto the wires, a lamp ---- */
 {const wp=new THREE.Group();wp.position.set(-HW+.03,0,Z0+3.05);g.add(wp);const w=HG(wp),haz=k.tex(128,16,(c)=>{for(let i=-16;i<144;i+=16){c.fillStyle='#ffd020';c.beginPath();c.moveTo(i,0);c.lineTo(i+8,0);c.lineTo(i+16,16);c.lineTo(i+8,16);c.fill();c.fillStyle='#1a1a1a';c.beginPath();c.moveTo(i+8,0);c.lineTo(i+16,0);c.lineTo(i+24,16);c.lineTo(i+16,16);c.fill()}});
  w.B(.12,1.0,.8,.06,.52,0,M(0x4a4a50,{metalness:.5,roughness:.45}));w.B(.12,.04,.84,.06,1.04,0,M(0x3a3a40,{metalness:.5}));
  const hm=new THREE.MeshBasicMaterial({map:haz});for(const[y,wd]of[[.95,.76],[.1,.76]]){const s=new THREE.Mesh(new THREE.PlaneGeometry(wd,.05),hm);s.position.set(.127,y,0);s.rotation.y=Math.PI/2;wp.add(s)}
  const bk=w.B(.01,.5,.5,.119,.52,-.08,M(0x1a1a1e));
  for(let i=0;i<5;i++){const c=[0xff3030,0x30a0ff,0xffe030,0x40e060,0xff40ff][i];w.tube([[.128,.75,-.28+i*.05],[.134,.6,-.24+i*.04],[.133,.45,-.16+(i%2?.06:-.04)],[.128,.3,-.12+i*.03]],.008,M(c,{roughness:.5}),null,16)}
  for(let i=0;i<3;i++)w.B(.02,.04,.12,.125,.72-i*.2,.08,M(0xd8d8d0));
  const fr=M(0x6a6a72,{metalness:.6});w.B(.02,.04,.54,.126,.79,-.08,fr);w.B(.02,.04,.54,.126,.25,-.08,fr);w.B(.02,.58,.04,.126,.52,-.35,fr);w.B(.02,.58,.04,.126,.52,.19,fr);
  const gl=new THREE.Mesh(new THREE.PlaneGeometry(.5,.5),k.GL);gl.position.set(.127,.52,-.08);gl.rotation.y=Math.PI/2;wp.add(gl);
  w.L('⚡ WIRING · SUPERBOOST',.6,.09,'#ffd020','#1a1a1a',44,.128,.88,0,Math.PI/2);
  const wled=new THREE.Mesh(new THREE.SphereGeometry(.025,12,8,0,Math.PI*2,0,Math.PI/2),M(0x200000,{emissive:0x400000}));wled.rotation.z=-Math.PI/2;wled.position.set(.12,.52,.3);wp.add(wled);w.C(.033,.033,.01,.122,.52,.3,CHR,'x',null,14);
  ex.wire={wd:bk,wled};Z('wire',-HW,-HW+1.3,Z0+2.55,Z0+3.6);it.obs.push({x0:-HW,x1:-HW+.15,z0:Z0+2.65,z1:Z0+3.45})}
 /* ---- the lounge ---- */
 /* JUKEBOX: walnut cabinet, glowing arch, bubble tubes (ex.juke.bands), a speaker grille, the song screen (jc/jtx) */
 {const jb=new THREE.Group();jb.position.set(-HW+.3,0,-2.1);jb.rotation.y=-Math.PI/2;g.add(jb);const j=HG(jb);
  j.B(.5,.95,.36,0,.475,0,WD2);j.B(.54,.06,.4,0,.03,0,CHR);
  const arch=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.36,24,1,true,Math.PI/2,Math.PI),WD2);arch.geometry.rotateX(Math.PI/2);arch.position.y=.95;jb.add(arch);arch.material=WD2;
  const back=new THREE.Mesh(new THREE.CircleGeometry(.25,24,0,Math.PI),WD2);back.position.set(0,.95,.18);jb.add(back);
  const at=k.tex(256,128,(c)=>{const gr=c.createLinearGradient(0,0,256,0);['#ff3080','#ffb020','#40e060','#30c0ff','#a040ff'].forEach((s,i)=>gr.addColorStop(i/4,s));c.fillStyle=gr;c.fillRect(0,0,256,128);c.fillStyle='rgba(0,0,0,.55)';c.beginPath();c.arc(128,128,80,0,7);c.fill();c.strokeStyle='#d8d8d8';c.lineWidth=3;for(let r=20;r<80;r+=12){c.beginPath();c.arc(128,128,r,Math.PI,0);c.stroke()}c.fillStyle='#ffd040';c.beginPath();c.arc(128,128,14,0,7);c.fill()});
  const af=new THREE.Mesh(new THREE.CircleGeometry(.22,24,0,Math.PI),new THREE.MeshStandardMaterial({map:at,emissive:0xffffff,emissiveMap:at,emissiveIntensity:.5}));af.position.set(0,.95,-.186);af.rotation.y=Math.PI;jb.add(af);
  const tor=new THREE.Mesh(new THREE.TorusGeometry(.245,.014,8,24,Math.PI),CHR);tor.position.set(0,.95,-.18);jb.add(tor);
  const bands=[];for(const[x,c]of[[-.215,0xff3080],[.215,0x30c0ff]]){const b=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.86,12),M(0x111111,{emissive:c,emissiveIntensity:.2,transparent:true,opacity:.9}));b.position.set(x,.52,-.185);jb.add(b);bands.push(b)}
  const gr=new THREE.Mesh(new THREE.PlaneGeometry(.34,.34),k.GRILL);gr.position.set(0,.3,-.186);gr.rotation.y=Math.PI;jb.add(gr);j.B(.36,.02,.02,0,.48,-.19,CHR);j.B(.36,.02,.02,0,.12,-.19,CHR);
  for(let i=0;i<6;i++)j.B(.035,.025,.02,-.1+i*.04,.66,-.19,M([0xf0f0f0,0xffd040][i%2]));j.B(.34,.11,.02,0,.78,-.185,M(0x1a1a1a));
  const jc=document.createElement('canvas');jc.width=192;jc.height=48;const jtx=new THREE.CanvasTexture(jc),js=new THREE.Mesh(new THREE.PlaneGeometry(.3,.075),new THREE.MeshBasicMaterial({map:jtx}));js.position.set(0,.78,-.2);js.rotation.y=Math.PI;jb.add(js);
  ex.juke={bands,jc,jtx,st:-1};it.obs.push({x0:-HW,x1:-HW+.52,z0:-2.4,z1:-1.8});Z('juke',-HW,-HW+1.4,-2.9,-1.4)}
 /* SNACK COOLER: an open box with snacks inside, a hinged lid. The game moves ex.cool.lid (a stand-in);
    the real lid turns on its back hinge to match */
 {const co=new THREE.Group();co.position.set(-HW+.32,0,0);co.rotation.y=-Math.PI/2;g.add(co);const c=HG(co),WHc=M(0xf4f4f0,{roughness:.4}),BL=M(0x2a6ad8,{roughness:.4});
  c.B(.62,.04,.42,0,.02,0,WHc);c.B(.62,.46,.04,0,.27,-.19,WHc);c.B(.62,.46,.04,0,.27,.19,WHc);c.B(.04,.46,.34,-.29,.27,0,WHc);c.B(.04,.46,.34,.29,.27,0,WHc);c.B(.54,.02,.34,0,.3,0,M(0xd8e8f0,{roughness:.2}));
  for(let i=0;i<5;i++)c.C(.033,.033,.12,-.2+i*.1,.36,-.06+(i%2)*.1,M([0xe02020,0x40e060,0xffd020,0x2a8ae0,0xff8020][i],{metalness:.5,roughness:.3}),null,null,12);
  {const bag=c.B(.16,.2,.05,.12,.4,.08,M(0xf0a020));bag.rotation.z=.3}
  for(const s of[-1,1])c.B(.03,.04,.16,s*.32,.38,0,M(0x2a2a2a));c.B(.08,.06,.02,.2,.06,-.215,M(0x2a2a2a));
  c.L('SNACKS',.36,.1,'#2a6ad8','#ffffff',60,0,.3,-.217,Math.PI);
  const lid=new THREE.Object3D(),hinge=new THREE.Group();hinge.position.set(0,.5,.21);co.add(hinge);
  const lm=new THREE.Mesh(new THREE.BoxGeometry(.64,.07,.44),BL);lm.position.set(0,.035,-.21);hinge.add(lm);const hd=new THREE.Mesh(new THREE.BoxGeometry(.2,.035,.05),M(0xd8d8d8));hd.position.set(0,.09,-.21);hinge.add(hd);
  lm.onBeforeRender=()=>{const a=-lid.rotation.x;if(hinge.rotation.x!==a){hinge.rotation.x=a;hinge.updateMatrixWorld(true)}};
  ex.cool={lid,open:0};it.obs.push({x0:-HW,x1:-HW+.56,z0:-.33,z1:.33});Z('cool',-HW,-HW+1.4,-.7,.7)}
 /* GWEEN SODA machine: green cabinet, a lit window with shelves of cans (vg is the glass), a coin column, a drop tray */
 {const vm=new THREE.Group();vm.position.set(-HW+.42,0,2.3);vm.rotation.y=-Math.PI/2;g.add(vm);const v=HG(vm),GR=M(0x2aa040,{roughness:.4,metalness:.1});
  v.ext([[-.25,0],[-.25,1.86],[-.2,1.9],[.35,1.9],[.35,0]],.9,GR,0,null,.02);
  v.B(.24,1.4,.1,.31,1.0,-.3,GR);v.B(.06,1.4,.1,-.42,1.0,-.3,GR);v.B(.9,.42,.1,0,.21,-.3,GR);v.B(.9,.2,.1,0,1.8,-.3,GR);
  v.B(.6,1.2,.02,-.08,1.1,-.285,M(0x0e2414,{emissive:0x0a3010}));for(let r=0;r<4;r++){v.B(.6,.02,.1,-.08,.56+r*.3,-.3,M(0xc8ccd0,{metalness:.6}));for(let c=0;c<4;c++)v.C(.035,.035,.13,-.31+c*.15,.635+r*.3,-.3,M([0x40e060,0x30c050,0x60f080,0x40e060][(r+c)%4],{emissive:0x0a3010,metalness:.5,roughness:.3}),null,null,12)}
  const vg=new THREE.Mesh(new THREE.PlaneGeometry(.6,1.2),new THREE.MeshStandardMaterial({color:0x9ae0b0,emissive:0x206030,transparent:true,opacity:.35,roughness:.05}));vg.position.set(-.08,1.1,-.356);vg.rotation.y=Math.PI;vm.add(vg);
  for(let i=0;i<4;i++)v.B(.05,.04,.012,.31,1.4-i*.07,-.356,M([0xff4040,0xffd020,0x40c0ff,0xffffff][i]));v.B(.06,.1,.012,.31,1.05,-.356,M(0x1a1a1a));v.B(.03,.06,.014,.31,1.05,-.362,CHR);
  v.B(.4,.16,.012,-.08,.24,-.356,M(0x111111));v.B(.42,.04,.03,-.08,.34,-.36,M(0x1e5a28));
  v.L('GWEEN SODA · 10 🪙',.84,.15,'#103a18','#80ff90',50,0,1.8,-.3565,Math.PI);
  it.obs.push({x0:-HW,x1:-HW+.8,z0:1.85,z1:2.75});Z('vend',-HW,-HW+1.5,1.5,3.1)}
 /* SLOT MACHINE: curved red cabinet, gold marquee, the reels screen (sc/stx), buttons, a coin tray, a side lever.
    The game pulls ex.slot.lv (a stand-in); the real lever swings towards you to match */
 {const sl=new THREE.Group();sl.position.set(HW-.3,0,-2.4);sl.rotation.y=Math.PI/2;g.add(sl);const s=HG(sl),RD=M(0xb01818,{metalness:.35,roughness:.35}),GD=M(0xd8a830,{metalness:.8,roughness:.25});
  s.ext([[.2,0],[-.2,0],[-.2,.45],[-.29,.5],[-.29,.56],[-.21,.6],[-.21,1.22],[-.17,1.3],[.2,1.3]],.58,RD,0);
  s.ext([[-.23,1.3],[-.23,1.5],[.2,1.5],[.2,1.3]],.64,GD,0,null,.015);s.B(.5,.05,.1,0,.08,-.25,GD);
  const sc=document.createElement('canvas');sc.width=192;sc.height=64;const stx=new THREE.CanvasTexture(sc),scr=new THREE.Mesh(new THREE.PlaneGeometry(.42,.15),new THREE.MeshBasicMaterial({map:stx}));scr.position.set(0,.98,-.237);scr.rotation.y=Math.PI;sl.add(scr);
  for(const[w,h,x,y]of[[.48,.03,0,1.07],[.48,.03,0,.89],[.03,.21,-.225,.98],[.03,.21,.225,.98]])s.B(w,h,.02,x,y,-.235,GD);
  [0xff3030,0xffd020,0x30c0ff].forEach((c,i)=>s.C(.025,.025,.02,-.1+i*.1,.585,-.25,M(c,{emissive:c,emissiveIntensity:.3}),null,null,12));
  s.L('🎰 VEGAS PRACTICE',.56,.15,'#3a0a0a','#ffe060',44,0,1.4,-.252,Math.PI);
  s.C(.035,.035,.05,.32,.85,0,CHR,'x',null,12);const rl=new THREE.Group();rl.position.set(.345,.85,0);sl.add(rl);s.C(.014,.014,.4,0,.2,0,CHR,null,rl,8);const kn=new THREE.Mesh(new THREE.SphereGeometry(.05,14,10),M(0xff2020,{emissive:0x400000}));kn.position.y=.42;rl.add(kn);
  const lv=new THREE.Object3D();kn.onBeforeRender=()=>{const a=-lv.rotation.x;if(rl.rotation.x!==a){rl.rotation.x=a;rl.updateMatrixWorld(true)}};
  const sg=typeof glowSp=='function'?glowSp(0xffd060,.35,.9):new THREE.Object3D();sg.position.set(0,1.62,0);sl.add(sg);
  ex.slot={sc,stx,lv,sg,spin:0,show:['7️⃣','7️⃣','7️⃣']};try{dbSlotDraw(ex.slot)}catch(e){}it.obs.push({x0:HW-.52,x1:HW,z0:-2.72,z1:-2.08});Z('slot',HW-1.4,HW,-3.2,-1.6)}
 /* ---- games ---- */
 /* THROW STUFF crate: plank crate with corner posts, full of tomatoes, a basketball, a rubber chicken, a pie, a balloon */
 {const cx=HW-.5,cz=4.2,cr=M(0xffffff,{roughness:.8});cr.map=k.WD.map;cr.userData.s=1.5;
  B(.8,.04,.8,cx,.02,cz,cr);for(const[w,d,x,z]of[[.8,.04,0,-.38],[.8,.04,0,.38],[.04,.72,-.38,0],[.04,.72,.38,0]])for(let i=0;i<3;i++)B(w,.18,d,cx+x,.12+i*.22,cz+z,cr);
  for(const sx of[-1,1])for(const sz of[-1,1])B(.07,.7,.07,cx+sx*.385,.35,cz+sz*.385,WD2);B(.72,.04,.72,cx,.6,cz,M(0x3a2414));
  const it2=[[0xe02020,-.2,-.15],[0xe03020,-.05,-.22],[0xd02020,.18,.2]];for(const[c,x,z]of it2){SP(.07,cx+x,.67,cz+z,M(c,{roughness:.4}),null,1,.85,1);C(.02,.0,.03,cx+x,.73,cz+z,M(0x2a8a2a),null,null,5)}
  const bt=k.tex(64,32,(c)=>{c.fillStyle='#e0681a';c.fillRect(0,0,64,32);c.strokeStyle='#1a1a1a';c.lineWidth=2;c.beginPath();c.moveTo(0,16);c.lineTo(64,16);c.moveTo(16,0);c.lineTo(16,32);c.moveTo(48,0);c.lineTo(48,32);c.stroke()});SP(.12,cx+.12,.72,cz-.1,new THREE.MeshStandardMaterial({map:bt,roughness:.7}));
  {const ch=M(0xffd040,{roughness:.6});const b=SP(.07,cx-.15,.7,cz+.15,ch,null,1,.8,1.6);b.rotation.y=.6;SP(.045,cx-.22,.78,cz+.06,ch);C(.0,.02,.05,cx-.25,.78,cz+.01,M(0xff8020),'z',null,6);B(.015,.04,.05,cx-.22,.83,cz+.06,M(0xe02020))}
  C(.1,.09,.04,cx+.18,.64,cz-.22,M(0xd8b070),null,null,18);C(.09,.09,.012,cx+.18,.662,cz-.22,M(0xf4f0e8),null,null,18);
  SP(.11,cx-.1,1.15,cz-.15,M(0xff60a0,{roughness:.2}),null,1,1.15,1);tube([[cx-.1,1.02,cz-.15],[cx-.08,.85,cz-.12],[cx-.12,.68,cz-.16]],.003,M(0xf0f0f0),null,10);
  B(.02,.2,.72,HW-.91,.36,cz,M(0x3a2010));L('🍅🏀🐔🥧🎈 THROW STUFF',.7,.16,'#3a2010','#ffe0a0',44,HW-.927,.36,cz,-Math.PI/2);
  it.obs.push({x0:HW-.92,x1:HW,z0:3.78,z1:4.62});Z('grab',HW-1.6,HW,3.5,5)}
 /* HOOP: a framed backboard on brackets, the ring on a brace (it.hoop as before), a rope net, the score panel beside it */
 {const HP={x:-HW+.62,y:2.45,z:6.6},bx=-HW+.06;B(.04,.7,1.2,bx,2.7,HP.z,M(0xf8f8f8,{roughness:.3}));for(const[h,w,y,z]of[[.03,1.24,3.05,0],[.03,1.24,2.35,0],[.7,.03,2.7,-.6],[.7,.03,2.7,.6]])B(.05,h,w==1.24?w:.03,bx,y,HP.z+z,M(0xd02020));
  B(.006,.03,.4,bx+.022,2.6,HP.z,M(0xd02020));B(.006,.03,.4,bx+.022,2.88,HP.z,M(0xd02020));B(.006,.3,.03,bx+.022,2.74,HP.z-.185,M(0xd02020));B(.006,.3,.03,bx+.022,2.74,HP.z+.185,M(0xd02020));
  for(const sz of[-.4,.4])B(.03,.06,.06,-HW+.025,2.7,HP.z+sz,M(0x6a6a72,{metalness:.6}));
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.3,.02,8,28),M(0xff6a10,{metalness:.5,roughness:.4}));ring.rotation.x=Math.PI/2;ring.position.set(HP.x,HP.y,HP.z);g.add(ring);ring.userData.st=1;
  B(.26,.03,.12,-HW+.2,HP.y,HP.z,M(0xff6a10,{metalness:.5}));rod([-HW+.08,2.4,HP.z],[-HW+.3,HP.y-.01,HP.z],.012,M(0xff6a10,{metalness:.5}));
  const net=new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(.3,0),new THREE.Vector2(.26,-.2),new THREE.Vector2(.2,-.42)],16,0,Math.PI*2),k.NET);k.wuv(net.geometry,4);net.position.set(HP.x,HP.y,HP.z);g.add(net);it.hoop=HP;
  B(.05,.3,1.0,-HW+.055,2.75,7.75,M(0x1a1a1e));const sb=document.createElement('canvas');sb.width=256;sb.height=64;const sbt=new THREE.CanvasTexture(sb),sbm=new THREE.Mesh(new THREE.PlaneGeometry(.9,.22),new THREE.MeshBasicMaterial({map:sbt}));sbm.position.set(-HW+.087,2.75,7.75);sbm.rotation.y=Math.PI/2;g.add(sbm);ex.score={sb,sbt,n:-1}}
 /* BALL PIT: striped vinyl pads with rolled tops, a gap at each end to climb in, padded corner posts with net sides,
    the three hundred balls (instanced, moved by the game), a sign on a bar */
 {const x0=-2.1,x1=2.1,z0=9.3,z1=12.4,cols3=[0xff4060,0x40a0ff,0xffd040],PD=cols3.map(c=>{const t=k.tex(32,64,(x)=>{x.fillStyle='#'+new THREE.Color(c).getHexString();x.fillRect(0,0,32,64);x.fillStyle='rgba(255,255,255,.35)';x.fillRect(0,0,32,6)});const m=M(0xffffff,{roughness:.85});m.map=t;m.userData.s=2.5;return m});
  const cush=(w,d,x,z,m)=>{B(w,.42,d,x,.21,z,m);const c=C(.11,.11,w>d?w:d,x,.44,z,m,w>d?'x':'z',null,14)};
  cush(1.35,.2,x0+.675,z0,PD[0]);cush(1.35,.2,x1-.675,z0,PD[0]);cush(1.35,.2,x0+.675,z1,PD[1]);cush(1.35,.2,x1-.675,z1,PD[1]);cush(.2,z1-z0-.2,x0,(z0+z1)/2,PD[2]);cush(.2,z1-z0-.2,x1,(z0+z1)/2,PD[2]);
  B(x1-x0-.2,.04,z1-z0-.2,0,.02,(z0+z1)/2,M(0x2a4a8a,{roughness:.9}));
  for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]]){C(.12,.12,.6,x,.3,z,PD[(x>0?1:0)+(z>11?1:0)],null,null,14);C(.04,.04,1.6,x,1.4,z,M(0xe8e8e8),null,null,10);SP(.09,x,2.25,z,M(cols3[(x>0?1:0)+(z>11?1:0)],{roughness:.4}))}
  for(const x of[x0,x1]){const n=new THREE.Mesh(new THREE.PlaneGeometry(z1-z0-.1,1.5),k.NET);k.wuv(n.geometry,6);n.position.set(x,1.38,(z0+z1)/2);n.rotation.y=Math.PI/2;g.add(n);C(.015,.015,z1-z0,x,2.13,(z0+z1)/2,M(0xe8e8e8),'z',null,6)}
  const cols=[0xff4040,0x40a0ff,0xffe040,0x40e060,0xff60d0,0xff9020],bg=new THREE.SphereGeometry(.1,8,6),N=50;ex.balls=[];ex.ballM=[];const dm=new THREE.Object3D();
  cols.forEach((c,ci)=>{const im=new THREE.InstancedMesh(bg,M(c,{roughness:.45}),N);g.add(im);ex.ballM.push(im);for(let kk=0;kk<N;kk++){const bx=x0+.22+Math.random()*(x1-x0-.44),bz=z0+.22+Math.random()*(z1-z0-.44),by=.1+Math.random()*.32;dm.position.set(bx,by,bz);dm.updateMatrix();im.setMatrixAt(kk,dm.matrix);ex.balls.push({im,k:kk,x:bx,z:bz,y0:by,px:bx,py:by,pz:bz,mv:0})}im.instanceMatrix.needsUpdate=true});ex.dm=dm;
  C(.03,.03,x1-x0,0,2.2,z0,M(0xe8e8e8),'x',null,8);B(1.46,.3,.04,0,2.36,z0,M(0xffffff));for(const r of[0,Math.PI])L('🟦 BALL PIT 🟥',1.4,.24,'#ff4060','#ffffff',70,0,2.36,z0+(r?.0215:-.0215),r+Math.PI);for(const sx of[-.6,.6])rod([sx,2.2,z0],[sx,2.21,z0],.01,M(0xe8e8e8));
  for(const sd of[-1,1])it.obs.push({x0:sd<0?x0-.12:x1-.12,x1:sd<0?x0+.12:x1+.12,z0,z1});it.obs.push({x0,x1:-.65,z0:z1-.12,z1:z1+.12},{x0:.65,x1,z0:z1-.12,z1:z1+.12},{x0,x1:-.65,z0:z0-.12,z1:z0+.12},{x0:.65,x1,z0:z0-.12,z1:z0+.12});Z('pit',x0+.2,x1-.2,z0+.2,z1-.2);it.pit={x0,x1,z0,z1}}
 /* HOT TUB in the back left corner: wood surround and rim, tiled inside, water (ex.tub.wt), bubbles, a duck, a towel */
 {const x0=-HW,x1=-.8,z0=12.9,z1=Z1,TT=k.TILE;
  B(x1-x0-.16,.3,z1-z0-.16,(x0+x1)/2-.08,.15,(z0+z1)/2+.08,TT);
  B(.03,.36,z1-z0-.16,x0+.045,.48,(z0+z1)/2+.08,TT);B(x1-x0-.16,.36,.03,(x0+x1)/2-.08,.48,z1-.045,TT);
  B(.03,.36,z1-z0-.16,x1-.175,.48,(z0+z1)/2+.08,TT);B(x1-x0-.16,.36,.03,(x0+x1)/2-.08,.48,z0+.175,TT);
  B(x1-x0,.62,.16,(x0+x1)/2,.31,z0+.08,WD);B(.16,.62,z1-z0,x1-.08,.31,(z0+z1)/2,WD);
  for(const[w,d,x,z]of[[x1-x0,.2,(x0+x1)/2,z0+.08],[.2,z1-z0,x1-.08,(z0+z1)/2],[.12,z1-z0-.16,x0+.06,(z0+z1)/2+.08],[x1-x0-.16,.12,(x0+x1)/2-.08,z1-.06]])B(w,.05,d,x,.645,z,WD2);
  const wt=new THREE.Mesh(new THREE.BoxGeometry(1.65,.06,2.85),new THREE.MeshStandardMaterial({color:0x40b8e8,transparent:true,opacity:.8,roughness:.1,emissive:0x0a3048}));wt.position.set(-1.815,.45,14.515);g.add(wt);
  {const dk=new THREE.Group();wt.add(dk);dk.position.set(-1.6-wt.position.x,.04,14.6-wt.position.z);dk.rotation.y=.7;const Y=M(0xffd020,{roughness:.4});const b=new THREE.Mesh(new THREE.SphereGeometry(.07,14,10),Y);b.scale.set(1,.7,1.3);dk.add(b);const hd=new THREE.Mesh(new THREE.SphereGeometry(.045,12,8),Y);hd.position.set(0,.07,-.06);dk.add(hd);const bk=new THREE.Mesh(new THREE.ConeGeometry(.02,.05,8),M(0xff8020));bk.rotation.x=-Math.PI/2;bk.position.set(0,.065,-.115);dk.add(bk);for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.008,6,4),BLK);e.position.set(s*.022,.085,-.095);dk.add(e)}}
  ex.bub=[];for(let i=0;i<10;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.04,6,4),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7}));b.position.set(x0+.3+Math.random()*(x1-x0-.6),.48,z0+.4+Math.random()*(z1-z0-.6));g.add(b);ex.bub.push(b)}ex.tub={wt,x0,x1,z0,z1};
  {const tw=M(0xf4f0e8,{roughness:1});B(.3,.08,.22,x1-.12,.71,z0+.14,tw);B(.3,.012,.06,x1-.12,.71,z0+.14,M(0x2a8ac8));B(.3,.012,.06,x1-.12,.75,z0+.14,M(0x2a8ac8))}
  for(const z of[13.6,14.8,15.6])C(.03,.03,.01,x0+.065,.55,z,k.CHR,'x',null,12);
  it.obs.push({x0,x1:x1+.08,z0:z0-.08,z1});Z('tub',x1,x1+.9,z0,z1);it.seats.push({x:-1.25,z:14.05,dy:-.62,tub:1},{x:-1.25,z:15.45,dy:-.62,tub:1},{x:-2.15,z:14.05,dy:-.62,tub:1,eo:1},{x:-2.15,z:15.45,dy:-.62,tub:1,eo:1});
  L('🛁 HOT TUB (it is 45°C outside)',1.5,.18,'#0a3048','#bff0ff',44,(x0+x1)/2,.34,z0-.006,Math.PI)}
 /* KARAOKE in the back right: a carpeted stage with a lit edge, a mic on a tripod stand, two speakers, a lyrics
    screen, and a truss of stage lamps (ex.stage.sp are their glows) */
 {const x0=.8,x1=HW,z0=13.2,z1=Z1,ST=M(0x5a2a6a,{roughness:1});
  B(x1-x0,.16,z1-z0,(x0+x1)/2,.08,(z0+z1)/2,M(0x2a1a2e,{roughness:.8}));B(x1-x0,.02,z1-z0,(x0+x1)/2,.17,(z0+z1)/2,ST);
  B(x1-x0,.025,.012,(x0+x1)/2,.09,z0-.006,M(0xff40ff,{emissive:0xff40ff,emissiveIntensity:.6}));B(.012,.025,z1-z0,x0-.006,.09,(z0+z1)/2,M(0xff40ff,{emissive:0xff40ff,emissiveIntensity:.6}));
  const mx=1.75,mz=14.0;for(let i=0;i<3;i++){const a=i/3*Math.PI*2;rod([mx,.4,mz],[mx+Math.cos(a)*.22,.18,mz+Math.sin(a)*.22],.01,BLK)}C(.012,.012,1.3,mx,.95,mz,BLK,null,null,8);C(.02,.02,.06,mx,.42,mz,BLK,null,null,10);
  rod([mx,1.58,mz],[mx,1.62,mz-.06],.012,BLK);C(.016,.022,.16,mx,1.63,mz-.1,M(0x2a2a2e,{metalness:.4}),null,null,10).rotation.x=-.6;SP(.04,mx,1.69,mz-.145,M(0x9a9a9a,{metalness:.8,roughness:.4}));
  it.obs.push({x0:1.68,x1:1.82,z0:13.93,z1:14.07});
  for(const sx of[1.0,2.45]){B(.36,.56,.3,sx,.46,15.6,M(0x1a1a1c));for(const[y,r]of[[.6,.1],[.33,.06]]){const sp=new THREE.Mesh(new THREE.CircleGeometry(r,20),k.GRILL);sp.position.set(sx,y,15.444);sp.rotation.y=Math.PI;g.add(sp);sp.userData.st=1;const rg=new THREE.Mesh(new THREE.TorusGeometry(r,.008,6,20),M(0x5a5a60,{metalness:.6}));rg.position.set(sx,y,15.447);g.add(rg);rg.userData.st=1}}
  {const lt=k.tex(256,128,(c)=>{const gr=c.createLinearGradient(0,0,0,128);gr.addColorStop(0,'#1a0a3a');gr.addColorStop(1,'#3a0a4a');c.fillStyle=gr;c.fillRect(0,0,256,128);c.font='bold 20px '+k.FONT;c.textAlign='center';c.fillStyle='#ffffff';c.fillText('♪ Miles and miles of sand ♪',128,52);c.fillStyle='#ff80ff';c.fillText('a goblin at the wheel',128,84)});
   B(1.14,.66,.04,1.95,1.75,Z1-.05,M(0x111111));const lp=new THREE.Mesh(new THREE.PlaneGeometry(1.06,.58),new THREE.MeshStandardMaterial({map:lt,emissive:0xffffff,emissiveMap:lt,emissiveIntensity:.6}));lp.position.set(1.95,1.75,Z1-.0715);lp.rotation.y=Math.PI;g.add(lp)}
  L('🎤 KARAOKE',1.1,.28,'#2a0a3a','#ff80ff',70,1.95,2.62,Z1-.036,Math.PI);
  C(.02,.02,x1-x0,(x0+x1)/2,CH-.07,Z1-.3,M(0x6a6a72,{metalness:.6}),'x',null,8);for(const sx of[x0+.05,x1-.05])rod([sx,CH-.07,Z1-.3],[sx,CH-.03,Z1-.3],.012,M(0x6a6a72));
  const sp=[];for(let i=0;i<6;i++){const x=x0+.2+i*.32;C(.05,.06,.12,x,CH-.15,Z1-.3,M(0x1a1a1c,{metalness:.4}),null,null,12);rod([x,CH-.09,Z1-.3],[x,CH-.07,Z1-.3],.008,BLK);const col=[0xff40ff,0x40c0ff,0xffe040][i%3];C(.045,.045,.005,x,CH-.212,Z1-.3,M(col,{emissive:col,emissiveIntensity:.8}),null,null,12);
   const s=typeof glowSp=='function'?glowSp(col,.4,.5):new THREE.Sprite(new THREE.SpriteMaterial({color:col,transparent:true,opacity:.4}));s.position.set(x,CH-.24,Z1-.3);g.add(s);sp.push(s)}
  ex.stage={sp,x0,x1,z0,z1};Z('sing',x0,x1,z0-.6,z1)}
 it.ex=ex;return ex}

/* =====================================================================================================
   megaPolish: LED sign and clock (ticked by megaPolishTick as before), posters, plants, safety kit, door mats,
   the ceiling vents and camera; then merge the static meshes
   ===================================================================================================== */
function megaPolish(it){const g=it.g,{HW,Z0,Z1,CH}=it,k=biKit(),M=k.M,{B,C,SP,ext,rod,tube,L}=k.H(g),ex=it.ex||{};const{CHR,STL,BLK,WD2}=k;
 /* vents in the lounge ceiling, a dome camera at the front */
 for(const z of[-1,4,8,12])for(const sd of[-1,1])B(.4,.012,.25,sd*1.6,CH-.036,z,k.VENT);
 {const cam=new THREE.Mesh(new THREE.SphereGeometry(.08,14,8,0,Math.PI*2,0,Math.PI/2),M(0x1a1a1e,{metalness:.4}));cam.rotation.x=Math.PI;cam.position.set(1.6,CH-.03,Z0+4.4);g.add(cam);SP(.015,1.6,CH-.1,Z0+4.36,M(0xff2020,{emissive:0xff0000}))}
 /* posters of every destination, in wood frames on the upper walls of the lounge and games room */
 const POST=[['🌅','SUNSET SPRINGS','#e86a2a','#ffe9a8'],['🤠','GHOST TOWN','#8a5a2a','#f0e0c0'],['💎','CRYSTAL CANYON','#6a3a9a','#e0d0ff'],['🎰','LUCKY LIGHTS','#c02060','#ffe060'],['🧂','SALT FLATS','#4a7aa8','#ffffff'],['🌊','THUNDER FALLS','#2a6a8a','#d0f4ff']];
 const poster=(i,sd,z)=>{const[ic,nm,bg,fg]=POST[i];const t=k.tex(256,192,(c)=>{const gr=c.createLinearGradient(0,0,0,192);gr.addColorStop(0,bg);gr.addColorStop(1,'#1a1008');c.fillStyle=gr;c.fillRect(0,0,256,192);c.fillStyle='rgba(20,10,4,.6)';c.beginPath();c.moveTo(0,130);c.lineTo(40,110);c.lineTo(60,118);c.lineTo(110,96);c.lineTo(150,112);c.lineTo(200,100);c.lineTo(256,118);c.lineTo(256,192);c.lineTo(0,192);c.fill();c.font='64px serif';c.textAlign='center';c.fillText(ic,128,82);c.fillStyle=fg;c.font='bold 26px '+k.FONT;c.fillText(nm,128,150);c.font='600 14px '+k.FONT;c.fillText('VISIT BY DESERT BUS',128,174)});
  const x=sd*(HW-.045);B(.03,.56,.74,x,2.82,z,WD2);const p=new THREE.Mesh(new THREE.PlaneGeometry(.66,.48),new THREE.MeshBasicMaterial({map:t}));p.position.set(x-sd*.0215,2.82,z);p.rotation.y=-sd*Math.PI/2;g.add(p)};
 poster(0,-1,-2.0);poster(1,-1,.1);poster(2,-1,2.3);poster(3,1,-2.2);poster(4,1,2.4);poster(5,1,6.6);
 /* plants: a snake plant by the middle door, a potted cactus by the soda machine */
 const pot=(x,z)=>{C(.2,.15,.36,x,.18,z,M(0xc0603a,{roughness:.8}),null,null,16);C(.215,.215,.05,x,.355,z,M(0xb0562f,{roughness:.8}),null,null,16);C(.18,.18,.01,x,.37,z,M(0x3a2a1a,{roughness:1}),null,null,16);it.obs.push({x0:x-.22,x1:x+.22,z0:z-.22,z1:z+.22})};
 {const x=HW-.3,z=1.6;pot(x,z);const lf=M(0x3a7a3a,{roughness:.7,side:THREE.DoubleSide});for(let i=0;i<9;i++){const a=i/9*Math.PI*2+.3,h=.5+((i*5)%4)*.08,s=new THREE.Shape();s.moveTo(-.035,0);s.quadraticCurveTo(-.045,h*.6,0,h);s.quadraticCurveTo(.045,h*.6,.035,0);s.lineTo(-.035,0);const m=new THREE.Mesh(new THREE.ShapeGeometry(s,6),lf);m.position.set(x+Math.cos(a)*.08,.37,z+Math.sin(a)*.08);m.rotation.set(0,-a+Math.PI/2,0,'YXZ');m.rotation.x=-.12;m.userData.st=1;g.add(m)}}
 {const x=-HW+.3,z=3.4,cg=M(0x4a8a3a,{roughness:.7});pot(x,z);C(.08,.08,.6,x,.67,z,cg,null,null,12);SP(.08,x,.97,z,cg,null,1,.7,1);for(const[sx,h,y]of[[1,.25,.75],[-1,.18,.6]]){rod([x,y,z],[x+sx*.16,y,z],.045,cg,null,10);C(.045,.045,h,x+sx*.16,y+h/2,z,cg,null,null,10);SP(.045,x+sx*.16,y+h,z,cg,null,1,.8,1)}SP(.03,x,1.03,z,M(0xff60a0,{roughness:.5}))}
 /* safety: an extinguisher on a bracket, an emergency hammer, a first-aid box */
 {const x=-HW+.12,z=Z0+4.4;C(.08,.08,.42,x,.55,z,M(0xd02020,{roughness:.4}),null,null,16);SP(.08,x,.76,z,M(0xd02020,{roughness:.4}),null,1,.5,1);C(.025,.025,.06,x,.82,z,BLK,null,null,10);tube([[x,.83,z],[x+.06,.82,z+.05],[x+.08,.6,z+.08],[x+.05,.42,z+.07]],.01,BLK,null,12);
  B(.06,.04,.2,-HW+.06,.55,z,M(0x2a2a2a));L('FIRE',.14,.05,'#d02020','#ffffff',60,x+.086,.55,z,Math.PI/2);
  B(.04,.24,.08,-HW+.05,.95,Z0+6.6,M(0xd02020));B(.02,.12,.03,-HW+.075,.98,Z0+6.6,M(0x4a4a4a));L('BREAK GLASS',.2,.04,'#d02020','#ffffff',40,-HW+.077,.85,Z0+6.6,Math.PI/2);
  B(.06,.26,.34,HW-.06,.75,Z0+4.85,k.WHT);L('✚ FIRST AID',.3,.07,'#ffffff','#d02020',50,HW-.097,.75,Z0+4.85,-Math.PI/2)}
 /* the LED sign over the aisle at the front of the seating (ex.led), the clock on the back wall (ex.clock) */
 {const c=document.createElement('canvas');c.width=512;c.height=48;const t=new THREE.CanvasTexture(c);B(2.36,.3,.08,0,CH-.3,Z0+4.84,M(0x111111,{roughness:.6}));for(const sx of[-1,1])rod([sx*1.0,CH-.15,Z0+4.84],[sx*1.0,CH-.03,Z0+4.84],.01,CHR);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(2.2,.2),new THREE.MeshBasicMaterial({map:t}));m.position.set(0,CH-.3,Z0+4.84+.046);g.add(m);const m2=m.clone();m2.position.z=Z0+4.84-.046;m2.rotation.y=Math.PI;g.add(m2);ex.led={c,t,x:0,txt:'',ft:0}}
 {const c=document.createElement('canvas');c.width=c.height=128;const t=new THREE.CanvasTexture(c);C(.21,.21,.04,0,CH-.32,Z1-.05,WD2,'z',null,28);const m=new THREE.Mesh(new THREE.CircleGeometry(.18,28),new THREE.MeshBasicMaterial({map:t}));m.position.set(0,CH-.32,Z1-.0715);m.rotation.y=Math.PI;g.add(m);ex.clock={c,t,last:-1}}
 /* a HOWDY mat at each door */
 {const mt=k.tex(128,64,(c)=>{c.fillStyle='#5a4a30';c.fillRect(0,0,128,64);c.strokeStyle='#3a2e1c';for(let i=0;i<128;i+=4){c.beginPath();c.moveTo(i,0);c.lineTo(i,64);c.stroke()}c.fillStyle='#e0b050';c.font='bold 28px '+k.FONT;c.textAlign='center';c.fillText('HOWDY',64,42)});
  for(const[d0,d1]of it.doors){const w=d1-d0-.1;B(.7,.012,w,HW-.45,.006,(d0+d1)/2,M(0x5a4a30,{roughness:1}));const p=new THREE.Mesh(new THREE.PlaneGeometry(w-.04,.66),new THREE.MeshStandardMaterial({map:mt,roughness:1}));p.rotation.set(-Math.PI/2,0,Math.PI/2);p.position.set(HW-.45,.018,(d0+d1)/2);g.add(p)}}
 it.ex=ex;
 /* merge everything static into a few meshes */
 try{const r=biMerge(g);it.merged=r}catch(e){try{conLog('error','bus merge: '+e.message)}catch(x){}}}

{const mv13=mkVehModel;mkVehModel=function(k){if(k=='plane'){try{const K=VEHK.plane,m=mkPlane();return typeof nvFinish=='function'?nvFinish(m,K):m}catch(e){conLog('error','plane model: '+e.message)}}return mv13.apply(this,arguments)}}
