/* =====================================================================================================
   mkPlane(): the little desert plane, remodelled. Replaces the 'plane' branch of mkVehModel (bak519).
     A white high-wing four-seater look, red trim: a rounded engine cowl with a red spinner and a two-blade propeller,
     a real cabin you sit in (windscreen, side windows, doors, a panel with lit gauges, a control yoke, a seat),
     a tapered tail with fin and tailplane, a strut-braced wing with nav lights, spring-steel main legs with
     wheel spats and a faired nose wheel.
   ORIGIN    Centre on the ground (wheels touch y 0).   FRONT  -z.   The game sets g.rotation.order 'YXZ' (done here too).
   SIZE      Span 11 m (as before), 9.6 m long (spinner to rudder), 3.3 m to the fin tip.
   HOOKS     userData.prop    propeller Group at (0, 1.5, -4.62), spins on z (as now)
             userData.wheels  [{p, t, front}]: two mains (front false) and the nose wheel (front true), t.userData.r set
             userData.sw, swAx 'z': the yoke, turns on its z
   SEAT      VEHK.plane seat (0, -1.2): the pilot's seat cushion is at y 1.12; the cockpit camera (0, 1.8, -1.22) sits at
             eye height inside the cabin, with the panel and the windscreen in front of it.
   ALSO      Skip vehMore() for it.

   busShell(g, o): the Desert Bus's OUTSIDE, built round the existing interior (mkMegaInterior stays exactly as it is).
     o = {HW, Z0, Z1, CH, FH} = MBUS.HW, MBUS.Z0, MBUS.Z1, MBUS.CH, DBFH.
     In mkMegaBus, replace: the grey base box, the four head/tail light boxes, the two bumpers, and the wheel + arch loop
     with   const wheels = busShell(g, {HW, Z0, Z1, CH, FH: DBFH});   Keep everything else (the DESERT BUS signs, the
     LAS VEGAS sign it.dsign, the splat, the flames, megaExtras, megaPolish, userData).
     Adds: a cream skirt with a chrome rub strip and an under-tray; orange wheel flares over the outside wheels and mud
     flaps; proper wheels (tread, lug nuts, hubcaps, t.userData.r = 0.5); a front with a chrome bumper, grille, four round
     headlights, indicators, wipers and a frame round the destination sign; big bus mirrors on arms; roof air-con pods,
     a roof hatch and marker lights; a back with an engine grille, tail-light clusters, a ladder, a plate, an exhaust
     and a bumper. Wheel spots are the old ones (4 axles, x ±(HW + 0.33)).
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
