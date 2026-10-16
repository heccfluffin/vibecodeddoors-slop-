/* =====================================================================================================
   mkTank(): the Dark Army main battle tank. Replaces the 'tank' branch of mkVehModel (bak519).
   Olive drab, weathered. Real running gear: five road wheels a side, a drive sprocket at the back, an idler at the
   front, two return rollers, and a track made of 84 links per side that can actually run round the wheels.
   Side skirts, a sloped glacis, headlights with guards, tow hooks, engine grilles, exhausts, jerrycans.
   Turret: a wedge with a gun mantlet, a long gun with a fume extractor and a muzzle brake, a commander's cupola,
   a loader's hatch with a pintle machine gun, smoke dischargers, a sight box, two antennas, and a stowage basket.
   ORIGIN    Centre on the ground.   FRONT  -z.
   SIZE      3.1 m wide, 5.95 m long (hull), 2.5 m to the turret roof; gun to z -4.7 at rest.
             VEHK.tank stays w 3.2, len 5.4 (as before).
   HOOKS
     userData.tur      turret Group at (0, 1.35, 0.3), turns on y
     userData.bar      gun Group at (0, 0.35, -1.5) in tur, pitches on x. tankFire's recoil moves it to z -1.2 and back
                       to -1.5, so it must rest at -1.5 (it does). Muzzle at bar z -3.3.
     userData.wheels   every road wheel, the sprocket, the idler and the rollers, as {p, t, front:0, tank:1}, each with
                       t.userData.r. The game rolls tank wheels by v.v·dt/0.34: use (w.t.userData.r || .34).
     userData.trkAdv(d)  NEW: moves both tracks along by d metres (call it with v.v·dt each frame, next to the wheel
                       roll). Without the call the tracks just stand still, which also looks fine.
   ===================================================================================================== */
function mkTank(){const g=new THREE.Group();
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.8,metalness:.2},o||{}));
 /* weathered olive: noise, streaks and dust towards the bottom (the paint colour multiplies it) */
 const weath=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const k=c.getContext('2d');k.fillStyle='#e0e0e0';k.fillRect(0,0,256,256);
  for(let i=0;i<900;i++){const v=Math.random()*40|0;k.fillStyle='rgba('+(150+v)+','+(150+v)+','+(140+v)+','+(Math.random()*.25)+')';k.fillRect(Math.random()*256,Math.random()*256,2+Math.random()*10,1+Math.random()*3)}
  for(let i=0;i<40;i++){k.fillStyle='rgba(90,80,60,.08)';k.fillRect(Math.random()*256,Math.random()*256,2,20+Math.random()*60)}
  k.fillStyle='#b8b8b8';k.fillRect(0,0,256,2);k.fillRect(0,0,2,256);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(.6,.6);return t})();
 const OL=M(0x5a6a3a,{map:weath}),OD=M(0x3a4428,{map:weath,roughness:.9}),OT=M(0x4a5830,{map:weath}),
  steel=M(0x4a4c4e,{metalness:.6,roughness:.5}),dk=M(0x1c1d1e,{roughness:.85,metalness:.2}),rub=M(0x18191a,{roughness:.95,metalness:0}),
  hl=M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.6,roughness:.1}),tl=M(0x701010,{emissive:0xc01010,emissiveIntensity:.5}),jer=M(0x3a4a28,{roughness:.6});
 const BX=(w,h,d,m,x,y,z,p)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(p||g).add(o);return o};
 const CYL=(r1,r2,len,m,x,y,z,ax,p,seg)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,seg||14),m);o.position.set(x,y,z);if(ax=='x')o.rotation.z=Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;(p||g).add(o);return o};
 const rod=(a,b,r,m,p)=>{const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),d=Bv.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),8),m);o.position.copy(A).add(Bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());(p||g).add(o);return o};
 const B_T=.03;
 const ext=(pts,w,m,x,p,bev)=>{const bt=bev==null?B_T:bev;const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))s.lineTo(q[0],q[1]);s.lineTo(pts[0][0],pts[0][1]);
  const geo=new THREE.ExtrudeGeometry(s,{depth:w-2*bt,bevelEnabled:bt>0,bevelThickness:bt,bevelSize:bt,bevelSegments:1});const o=new THREE.Mesh(geo,m);o.rotation.y=-Math.PI/2;o.position.x=(x||0)+(w-2*bt)/2;(p||g).add(o);return o};
 const decal=(w,h,draw,x,y,z,ry,p)=>{const c=document.createElement('canvas');c.width=256;c.height=Math.max(8,Math.round(256*h/w));draw(c.getContext('2d'),c.width,c.height);
  const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),transparent:true,alphaTest:.2,roughness:.8}));o.position.set(x,y,z);o.rotation.y=ry;(p||g).add(o);return o};
 const star=(k,w,h,col)=>{k.fillStyle=col||'#e8e0c0';k.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?w*.19:w*.46;k.lineTo(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r)}k.fill()};

 /* ---------------- hull ---------------- */
 ext([[-2.35,.3],[2.4,.3],[2.7,.6],[2.7,1.0],[-2.9,1.0],[-2.9,.72]],1.7,OD);/* lower hull between the tracks */
 ext([[-2.75,1.0],[2.85,1.0],[2.95,1.1],[2.95,1.42],[-1.55,1.48],[-3.05,1.1],[-3.05,1.03]],3.1,OL);/* upper hull and fenders: their underside at 1.0 clears the track's top run */
 for(const sd of[-1,1]){ext([[-2.55,.56],[2.55,.56],[2.62,.64],[2.62,1.0],[-2.7,1.0],[-2.7,.66]],.06,OT,sd*1.53,null,.012);/* side skirt */
  for(let i=0;i<4;i++)BX(.012,.36,.03,dk,sd*1.565,.77,-1.95+i*1.3)}/* skirt panel joints */
 /* front: headlights with wire guards, tow hooks, the driver's vision blocks */
 for(const sd of[-1,1]){BX(.28,.2,.16,dk,sd*1.15,1.12,-3.08);CYL(.08,.08,.03,hl,sd*1.15,1.12,-3.175,'z');for(let i=0;i<3;i++)BX(.015,.2,.015,steel,sd*1.15+(i-1)*.07,1.12,-3.215);BX(.24,.015,.06,steel,sd*1.15,1.23,-3.19);/* lamp, guard bars, top bar */
  BX(.14,.1,.14,steel,sd*.7,.66,-2.92);const h=new THREE.Mesh(new THREE.TorusGeometry(.09,.03,6,12),steel);h.position.set(sd*.7,.62,-3.02);h.rotation.y=Math.PI/2;g.add(h)}
 /* the glacis rises from (z -3.05, y 1.1) to (-1.55, 1.48): slope 0.248 rad. Vision blocks and a hatch for the driver */
 {const sl=.248,y=z=>1.1+(z+3.05)*Math.tan(sl);for(const x of[-.25,0,.25]){const v=BX(.18,.06,.1,M(0x10202a,{metalness:.7,roughness:.1}),x,y(-1.75)+.03,-1.75);v.rotation.x=-sl}
  const h=CYL(.32,.32,.05,OT,0,y(-2.2)+.025,-2.2);h.rotation.x=-sl;
  const st=decal(.55,.55,(k,w,h2)=>{k.clearRect(0,0,w,h2);star(k,w,h2)},.9,y(-2.6)+.008,-2.6,0);st.rotation.x=-Math.PI/2-sl}
 /* engine deck: grilles, a towing cable, exhausts, tail lights, jerrycans on the back */
 {const c=document.createElement('canvas');c.width=128;c.height=128;const k=c.getContext('2d');k.fillStyle='#14160f';k.fillRect(0,0,128,128);k.fillStyle='#4a5430';for(let i=5;i<128;i+=11)k.fillRect(4,i,120,6);
  const gm=M(0xffffff,{map:new THREE.CanvasTexture(c),roughness:.8});for(const sd of[-1,1]){const p=BX(.9,.03,1.3,gm,sd*.62,1.45,2.0);p.rotation.x=.0133}}
 for(const sd of[-1,1]){rod([sd*1.3,1.49,-.8],[sd*1.3,1.47,1.0],.025,steel);/* tow cable along the deck edge */
  BX(.36,.24,.1,dk,sd*.9,1.12,2.98);CYL(.1,.1,.06,M(0x0a0a0a),sd*.9,1.12,3.04,'z');BX(.14,.08,.03,tl,sd*1.3,1.32,2.965)}
 for(let i=0;i<3;i++){BX(.32,.44,.15,jer,-.5+i*.38,1.22,3.04);BX(.18,.04,.04,dk,-.5+i*.38,1.45,3.04)}BX(1.2,.04,.3,steel,-.12,.98,3.0);/* jerrycans on a shelf under the rear lip */
 BX(1.66,.04,5.0,dk,0,.3,0);/* belly */

 /* ---------------- running gear ---------------- */
 const wheels=[];const wheel=(x,y,z,r,w,kind)=>{const p=new THREE.Group();p.position.set(x,y,z);g.add(p);const t=new THREE.Group();t.rotation.z=Math.PI/2;t.userData.r=r;p.add(t);
  if(kind=='road'){t.add(new THREE.Mesh(new THREE.CylinderGeometry(r,r,w,20),[rub,OD,OD]));for(const s of[-1,1]){const d=new THREE.Mesh(new THREE.CylinderGeometry(r*.72,r*.72,.02,18),OD);d.position.y=s*(w/2+.005);t.add(d)}
   for(let i=0;i<6;i++){const a=i/6*6.283,b=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,w+.04,5),steel);b.position.set(Math.cos(a)*r*.32,0,Math.sin(a)*r*.32);t.add(b)}t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.2,r*.2,w+.06,10),steel))}
  else if(kind=='sprocket'){t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.85,r*.85,w,18),OD));for(let i=0;i<12;i++){const a=i/12*6.283,tt=new THREE.Mesh(new THREE.BoxGeometry(.08,w*.9,.12),steel);tt.position.set(Math.cos(a)*r*.9,0,Math.sin(a)*r*.9);tt.rotation.y=-a;t.add(tt)}t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.3,r*.3,w+.08,10),steel))}
  else{t.add(new THREE.Mesh(new THREE.CylinderGeometry(r,r,w,18),[steel,OD,OD]));t.add(new THREE.Mesh(new THREE.CylinderGeometry(r*.3,r*.3,w+.05,10),steel))}
  wheels.push({p,t,front:0,tank:1})};
 const TX=1.2,TW=.56;/* track centre line x, width */
 for(const sd of[-1,1]){for(const z of[-1.8,-.9,0,.9,1.8])wheel(sd*TX,.39,z,.32,.48,'road');wheel(sd*TX,.5,2.42,.37,.4,'sprocket');wheel(sd*TX,.5,-2.5,.36,.4,'idler');for(const z of[-1.35,.45])wheel(sd*TX,.8,z,.09,.3,'roller');
  for(const z of[-1.8,-.9,0,.9,1.8])BX(.2,.08,.08,steel,sd*.9,.39,z);/* axle stubs from the hull */}
 /* the tracks: links on a closed curve round the idler, the road wheels and the sprocket */
 const key=[[-1.9,.035],[-.6,.035],[.6,.035],[1.9,.035],[2.27,.13],[2.706,.214],[2.825,.5],[2.706,.786],[2.42,.905],[1.2,.9],[0,.88],[-1.2,.9],[-2.5,.895],[-2.78,.775],[-2.895,.5],[-2.78,.225],[-2.35,.1]];
 const curve=new THREE.CatmullRomCurve3(key.map(p=>new THREE.Vector3(0,p[1],p[0])),true,'centripetal');const L=curve.getLength(),N=84;
 const linkG=new THREE.BoxGeometry(TW,.07,L/N*.86),trM=M(0x2a2826,{metalness:.55,roughness:.6}),gsG=new THREE.BoxGeometry(TW*.9,.04,.04);
 const trk=[];for(const sd of[-1,1]){const im=new THREE.InstancedMesh(linkG,trM,N),gs=new THREE.InstancedMesh(gsG,trM,N);g.add(im,gs);trk.push({im,gs,x:sd*TX})}
 const ctr=new THREE.Vector3(0,.47,0),dum=new THREE.Object3D(),dum2=new THREE.Object3D();let off=0;
 const place=()=>{for(const T of trk){for(let i=0;i<N;i++){let u=((i/N+off/L)%1+1)%1;const p=curve.getPointAt(u),tn=curve.getTangentAt(u);let nrm=new THREE.Vector3(0,-tn.z,tn.y);if(nrm.dot(p.clone().sub(ctr))<0)nrm.negate();
   dum.position.set(T.x,p.y,p.z);dum.up.copy(nrm);dum.lookAt(T.x,p.y+tn.y,p.z+tn.z);dum.updateMatrix();T.im.setMatrixAt(i,dum.matrix);
   dum2.position.set(T.x,p.y+nrm.y*.05,p.z+nrm.z*.05);dum2.up.copy(nrm);dum2.lookAt(T.x,p.y+nrm.y*.05+tn.y,p.z+nrm.z*.05+tn.z);dum2.updateMatrix();T.gs.setMatrixAt(i,dum2.matrix)}T.im.instanceMatrix.needsUpdate=true;T.gs.instanceMatrix.needsUpdate=true}};
 place();g.userData.trkAdv=d=>{off=(off+d)%L;place()};/* driving forward (d > 0): the bottom run moves back (+z) and the top run forward, matching the wheels */

 /* ---------------- turret ---------------- */
 const tur=new THREE.Group();tur.position.set(0,1.35,.3);g.add(tur);
 CYL(1.0,1.02,.1,dk,0,.13,0,null,tur,28);/* turret ring */
 ext([[-1.2,.15],[1.3,.15],[1.42,.38],[1.32,.78],[-.55,.84],[-1.42,.52],[-1.38,.25]],2.1,OL,0,tur);
 /* stowage basket on the back */{for(const sd of[-1,1]){rod([sd*.95,.5,1.3],[sd*.95,.5,1.85],.02,steel,tur);rod([sd*.95,.82,1.3],[sd*.95,.82,1.85],.02,steel,tur);rod([sd*.95,.5,1.85],[sd*.95,.82,1.85],.02,steel,tur)}
  rod([-.95,.5,1.85],[.95,.5,1.85],.02,steel,tur);rod([-.95,.82,1.85],[.95,.82,1.85],.02,steel,tur);BX(1.9,.03,.55,steel,0,.48,1.575,tur);
  const tarp=BX(1.2,.26,.45,M(0x6a6a48,{roughness:1}),-.25,.63,1.58,tur);tarp.rotation.z=.04;BX(.4,.3,.3,jer,.6,.65,1.6,tur)}
 /* commander's cupola with vision blocks and an open hatch; the loader's hatch with a pintle MG */
 CYL(.34,.37,.2,OT,.45,.92,.45,null,tur,18);for(let i=0;i<6;i++){const a=i/6*6.283;const vb=BX(.1,.07,.03,M(0x10202a,{metalness:.7,roughness:.1}),.45+Math.sin(a)*.36,.94,.45+Math.cos(a)*.36,tur);vb.rotation.y=a}
 {const lid=CYL(.3,.3,.05,OT,.45,1.24,.82,null,tur,16);lid.rotation.x=-1.25;rod([.45,1.02,.66],[.45,1.08,.72],.025,steel,tur)}/* hatch lid standing open, on its hinge */
 CYL(.3,.3,.05,OT,-.45,.835,.55,null,tur,16);rod([-.45,.82,.2],[-.45,1.12,.2],.025,steel,tur);
 {const mg=new THREE.Group();mg.position.set(-.45,1.14,.2);tur.add(mg);BX(.1,.1,.4,dk,0,0,-.05,mg);CYL(.025,.025,.8,dk,0,.02,-.6,'z',mg,6);BX(.14,.14,.18,jer,.12,-.02,.05,mg)}
 /* sight box, smoke dischargers, antennas, stars */
 BX(.36,.26,.34,OD,-.55,.97,-.55,tur);BX(.28,.16,.02,M(0x10202a,{metalness:.7,roughness:.1}),-.55,.98,-.725,tur);
 for(const sd of[-1,1])for(let i=0;i<3;i++){const s=CYL(.055,.055,.26,dk,sd*(.82+i*.04),.76,-1.0+i*.14,null,tur,8);s.rotation.set(-.8,0,sd*-.5)}
 for(const[x,z,h]of[[-.8,1.1,2.2],[.8,1.1,1.6]]){CYL(.04,.05,.08,dk,x,.82,z,null,tur,8);rod([x,.84,z],[x*1.05,.9+h,z+.25],.01,dk,tur)}
 for(const sd of[-1,1])decal(.55,.55,(k,w,h)=>{k.clearRect(0,0,w,h);star(k,w,h)},sd*1.058,.45,.35,sd*Math.PI/2,tur);
 for(const sd of[-1,1])decal(.6,.2,(k,w,h)=>{k.clearRect(0,0,w,h);k.fillStyle='#e8e0c0';k.font='bold '+(h*.8|0)+'px "Barlow Semi Condensed",DoorsSans,Arial,sans-serif';k.textAlign='center';k.textBaseline='middle';k.fillText('DA-17',w/2,h/2+1)},sd*1.058,.45,-.45,sd*Math.PI/2,tur);
 /* ---------------- the gun ---------------- */
 const bar=new THREE.Group();bar.position.set(0,.35,-1.5);tur.add(bar);
 ext([[-.32,-.26],[.25,-.26],[.25,.26],[-.32,.26],[-.42,.14],[-.42,-.14]],1.0,OT,0,bar);/* mantlet */
 CYL(.14,.14,.4,OD,0,0,-.55,'z',bar,14);CYL(.1,.115,3.0,OD,0,0,-1.9,'z',bar,14);/* sleeve, barrel */
 CYL(.16,.16,.55,OD,0,0,-1.85,'z',bar,16);for(const z of[-1.6,-2.1])CYL(.165,.165,.03,dk,0,0,z,'z',bar,16);/* fume extractor */
 CYL(.15,.15,.3,dk,0,0,-3.25,'z',bar,12);for(const sd of[-1,1])BX(.04,.12,.16,M(0x050505),sd*.15,0,-3.25,bar);CYL(.06,.06,.02,M(0x050505),0,0,-3.405,'z',bar,10);/* muzzle brake with its side ports */
 CYL(.04,.04,.7,dk,.36,.08,-.55,'z',bar,8);/* coaxial MG */
 g.userData.tur=tur;g.userData.bar=bar;g.userData.wheels=wheels;return g}
