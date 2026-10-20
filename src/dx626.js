/* =====================================================================================================
   crash-site.md: the plane crash site, remodelled (remodel list #21). (Release number: set by the lead when merged.)

   What it does: the crashed plane south-west of the bus stop (old spot px, pz = -38, -1165) is rebuilt from the
   design chat's model docs/design/models/crash.js. You now find the front fuselage of flight DA-100 (Sandpiper
   Air) sunk into the sand: walk in through the torn break or the open front door, down the aisle between the
   seats to the cockpit, where the pilot's log lies on the pedestal between the two seats. The left wing is still
   on, with the pilot's camp under it (tarp, cushions, fire ring, water, the flare gun on a suitcase table), SOS
   in rocks past the wing tip, the tail section rolled on its side with the orange black box beside it, and a
   75 m skid furrow with the right wing, an engine, a propeller, the main gear, seats and suitcases along it.

   What it replaces: the old fuselage, nose, windows, wing, tail, debris, black box mesh and their obstacles and
   map rectangles in desertLocs (bak519), plus the two little flare gun and log meshes in the 'crashed plane'
   step. That wiring is done by build.py patches (block "crash-site.md"); this module only holds the model.
   The black box pick-up, the flare gun (3 flares) and the pilot's log keep their text and rewards; they moved
   to the new spots the spec gives (box beside the tail, flare at the camp, log in the cockpit).

   Globals added (checked against bak519 and dx*.js, no clashes): CSX, CSZ, csKit, csRand, csTubeGeo, csRimGeo,
   csWreck. (dx596 has a CSZ, but it is a const inside mnLush, so it just shadows this one there.)
   The model code below is the model file unchanged.
   ===================================================================================================== */
/* =====================================================================================================
   crash.js: the plane crash site, remodelled (remodel list #21). Plain three.js r128, needs nothing else.

   csWreck(g)  builds the whole site into g. g sits at the old crash spot (CSX, 0, CSZ) = (-38, 0, -1165), not
               turned, so local x/z = world x/z minus CSX/CSZ. The plane faces +x (east-ish), the side the old
               desert door stands on is +z (that door at world (-30, -1150) is untouched, 17 m from the nose).
     - The front fuselage of a high-wing twin turboprop ("SANDPIPER AIR", flight DA-100), sunk into the sand to
       its floor, from local x -10 (a torn break) to the crumpled nose at +7.6. You can walk in through the
       break or the open front door (on -z), down the aisle between the seats (1 + 2, sand drifted in, bins
       open, oxygen masks hanging) and through the cockpit door. The pilot's log lies on the centre pedestal.
     - The left wing (-z) is still on, its tip bent down into the sand, the left engine under it with bent
       blades. Under the wing: the pilot's camp. A tarp lean-to, seat cushions, two seats round a fire ring,
       water bottles, a suitcase table with the flare gun case on it, fourteen tally marks on the fuselage.
       SOS in rocks out in the open past the wing tip.
     - Behind: the tail section (fin with the sandpiper logo, DA-100), rolled on its side, and the orange
       black box that fell out of its tail cone. A 75 m skid furrow with sand berms runs back from the break to
       the first impact (scorched), with the right wing, the right engine, a propeller, the main gear, seats,
       suitcases and skin panels along it.
   Returns {obs, map, bb, log, flare, box}:
     obs   AABBs {x0,x1,z0,z1} in local x/z;   map  [x0,x1,z0,z1,colour] rectangles for the desert map (local);
     bb    the black box mesh (hide it when picked up);   log/flare/box  [x, z] prop spots (local).
   ===================================================================================================== */
const CSX=-38,CSZ=-1165;
function csKit(){const C={};const M=(c,o)=>{const k=c+JSON.stringify(o||{});return C[k]||(C[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.7,metalness:.1},o||{})))};
 const H=par=>{const A=(geo,m,x,y,z,p)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);(p||par).add(o);return o};
  const B=(w,h,d,m,x,y,z,p)=>A(new THREE.BoxGeometry(w,h,d),m,x,y,z,p);
  const Cy=(r0,r1,h,m,x,y,z,ax,p,seg,open)=>{const o=A(new THREE.CylinderGeometry(r0,r1,h,seg||14,1,!!open),m,x,y,z,p);if(ax=='x')o.rotation.z=-Math.PI/2;else if(ax=='z')o.rotation.x=Math.PI/2;return o};
  const V=new THREE.Vector3(),U=new THREE.Vector3(0,1,0);
  const rod=(a,b,r,m,p,seg)=>{V.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]);const L=V.length();const o=A(new THREE.CylinderGeometry(r,r,L,seg||6),m,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,p);o.quaternion.setFromUnitVectors(U,V.normalize());return o};
  return{A,B,Cy,rod}};
 const can=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t};
 return{M,H,can}}
/* a random sequence that's the same every time (the site must look the same for everyone in co-op) */
function csRand(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
/* a tube along x: radius r0 at x0 to r1 at x1, centre height cy, angles a0..a1 (0 = top, π/2 = +z side).
   jag: {end:0|1, d:[...]} pushes the ring at that end in by d[i] metres (a torn edge). uv: u along x, v = 1 - a/2π. */
function csTubeGeo(x0,x1,r0,r1,cy,a0,a1,N,L,jag,dent){const P=[],UV=[],I=[];
 for(let j=0;j<=L;j++){const t=j/L;for(let i=0;i<=N;i++){const a=a0+(a1-a0)*i/N;let x=x0+(x1-x0)*t;const r=r0+(r1-r0)*t;
  if(jag&&((jag.end==0&&j==0)||(jag.end==1&&j==L)))x+=(jag.end==0?1:-1)*jag.d[i%jag.d.length];
  let y=cy+r*Math.cos(a),z=r*Math.sin(a);if(dent){const o=dent(x,y,z);x=o[0];y=o[1];z=o[2]}
  P.push(x,y,z);UV.push((x0+(x1-x0)*t-x0)/(x1-x0),1-a/(Math.PI*2))}}
 for(let j=0;j<L;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;I.push(a,a+1,b,b,a+1,b+1)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.setIndex(I);g.computeVertexNormals();return g}
/* the torn rim between an outer and an inner tube at one end */
function csRimGeo(x,ro,ri,cy,a0,a1,N,d,sgn){const P=[],I=[];for(let i=0;i<=N;i++){const a=a0+(a1-a0)*i/N,dx=sgn*d[i%d.length];P.push(x+dx,cy+ro*Math.cos(a),ro*Math.sin(a),x+dx,cy+ri*Math.cos(a),ri*Math.sin(a))}
 for(let i=0;i<N;i++){const a=i*2;I.push(a,a+1,a+2,a+2,a+1,a+3)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();return g}

function csWreck(g){const k=csKit(),M=k.M,{A,B,Cy,rod}=k.H(g),R=csRand(2109),obs=[],map=[],F='DoorsSans,Arial,sans-serif',TAU=Math.PI*2;
 const ob=(x0,x1,z0,z1)=>obs.push({x0,x1,z0,z1});
 const WH=M(0xe8e8e4,{roughness:.5,metalness:.3}),GR=M(0x8a8e92,{metalness:.6,roughness:.45}),DK=M(0x24262a,{roughness:.7}),TL=M(0x1f7a7a,{roughness:.5}),
  SEAT=M(0x2a4a7a,{roughness:.9}),SEAT2=M(0x223c64,{roughness:.9}),SAND=M(0xd6be8c,{roughness:1,metalness:0}),SOOT=M(0x2a2622,{roughness:1,metalness:0}),RIM=M(0x9a9ea2,{metalness:.6,roughness:.5,side:THREE.DoubleSide}),
  PL=M(0xd8d6d0,{roughness:.8}),YL=M(0xe8c020),OR=M(0xff7a20,{roughness:.5});
 const CY=1.15,RO=1.6,RI=1.55,N=36;
 /* ---------- the skin: livery outside (windows painted, a teal cheat line, the name, tally marks), panels and lit windows inside ---------- */
 const skin=(len,opt)=>k.can(Math.round(len*64),512,(x,w,h)=>{x.fillStyle='#e8e8e4';x.fillRect(0,0,w,h);
   const row=a=>a/TAU*h;/* +z side rows 0..h/2, -z side rows h/2..h (drawn upside down so it reads right) */
   x.fillStyle='#1f7a7a';for(const[a0,a1]of[[1.62,1.78],[TAU-1.78,TAU-1.62]])x.fillRect(0,row(a0),w,row(a1)-row(a0));
   x.fillStyle='#c8a040';for(const[a0,a1]of[[1.8,1.84],[TAU-1.84,TAU-1.8]])x.fillRect(0,row(a0),w,row(a1)-row(a0));
   x.fillStyle='#6a6e72';x.fillRect(0,row(Math.PI)-30,w,60);/* the belly */
   x.strokeStyle='rgba(90,90,90,.35)';x.lineWidth=1;for(let u=0;u<w;u+=48){x.beginPath();x.moveTo(u,0);x.lineTo(u,h);x.stroke()}
   if(opt.win){x.fillStyle='#1a2630';for(const s of[1,-1])for(let u=opt.win[0];u<opt.win[1];u+=.8*64){const a=s>0?1.35:TAU-1.35;x.beginPath();x.roundRect?x.roundRect(u-11,row(a)-15,22,30,9):x.rect(u-11,row(a)-15,22,30);x.fill()}}
   if(opt.name){x.fillStyle='#1f7a7a';x.font='bold 64px '+F;x.textBaseline='middle';x.textAlign='center';x.fillText('SANDPIPER AIR',opt.name,row(1.05));x.save();x.translate(opt.name,row(TAU-1.05));x.rotate(Math.PI);x.fillText('SANDPIPER AIR',0,0);x.restore()}
   if(opt.tally){x.save();x.translate(opt.tally,row(TAU-1.5));x.rotate(Math.PI);x.strokeStyle='#2a2a2a';x.lineWidth=4;let u=-120;for(let i=0;i<14;i++){if(i%5==4){x.beginPath();x.moveTo(u-46,22);x.lineTo(u+4,-20);x.stroke();u+=16}else{x.beginPath();x.moveTo(u,-22);x.lineTo(u+2,22);x.stroke();u+=12}}x.restore()}
   if(opt.cock){x.fillStyle='#1a2630';const u0=opt.cock[0],u1=opt.cock[1];x.beginPath();x.moveTo(u0,row(1.15));x.lineTo(u1,row(.75));x.lineTo(u1,h);x.lineTo(u0,h);x.closePath();x.globalAlpha=0;x.fill();x.globalAlpha=1;
    for(const[a0,a1]of[[0,.55],[.6,1.12],[TAU-1.12,TAU-.6],[TAU-.55,TAU]]){x.beginPath();x.moveTo(u0,row(a0)+2);x.lineTo(u1,row(a0)+2);x.lineTo(u1,row(a1)-2);x.lineTo(u0+20,row(a1)-2);x.closePath();x.fill()}
    x.strokeStyle='rgba(220,230,240,.7)';x.lineWidth=2;x.beginPath();x.moveTo(u0+30,row(.2));x.lineTo(u0+70,row(.35));x.lineTo(u0+55,row(.5));x.moveTo(u0+70,row(.35));x.lineTo(u0+100,row(.3));x.stroke()}
   if(opt.reg){x.fillStyle='#1a1a1a';x.font='bold 54px '+F;x.textAlign='center';x.textBaseline='middle';x.fillText('DA-100',opt.reg,row(1.2));x.save();x.translate(opt.reg,row(TAU-1.2));x.rotate(Math.PI);x.fillText('DA-100',0,0);x.restore()}
   if(opt.soot){for(let i=0;i<40;i++){const u=opt.soot[0]+R()*opt.soot[1],v=R()*h;const gr=x.createRadialGradient(u,v,0,u,v,30+R()*40);gr.addColorStop(0,'rgba(30,26,22,.55)');gr.addColorStop(1,'rgba(30,26,22,0)');x.fillStyle=gr;x.fillRect(u-80,v-80,160,160)}}});
 const inner=(len,opt)=>k.can(Math.round(len*64),256,(x,w,h)=>{x.fillStyle='#c8c6c0';x.fillRect(0,0,w,h);const row=a=>a/TAU*h;x.fillStyle='#b4b2ac';x.fillRect(0,0,w,row(.5));x.fillRect(0,row(TAU-.5),w,h);
   x.strokeStyle='rgba(80,80,80,.3)';for(let u=0;u<w;u+=51){x.beginPath();x.moveTo(u,0);x.lineTo(u,h);x.stroke()}
   if(opt.win){x.fillStyle='#f4ecd8';for(const s of[1,-1])for(let u=opt.win[0];u<opt.win[1];u+=.8*64){const a=s>0?1.35:TAU-1.35;x.fillRect(u-10,row(a)-7,20,14)}}
   if(opt.cock){x.fillStyle='#e8f0f4';const u0=opt.cock[0],u1=opt.cock[1];for(const[a0,a1]of[[0,.55],[.6,1.12],[TAU-1.12,TAU-.6],[TAU-.55,TAU]])x.fillRect(u0,row(a0)+1,u1-u0,row(a1)-row(a0)-2)}});
 const SK=(t,wrap)=>{if(wrap)t.wrapT=THREE.RepeatWrapping;return new THREE.MeshStandardMaterial({map:t,roughness:.5,metalness:.25})},IN=t=>{t.wrapT=THREE.RepeatWrapping;return new THREE.MeshStandardMaterial({map:t,roughness:.85,side:THREE.BackSide,emissive:0x2a2826})};
 const jag=[];for(let i=0;i<=N;i++)jag.push(.15+R()*.75*(Math.sin(i*1.7)*.5+.6));jag[N]=jag[0];
 /* ---------- the front fuselage: three tubes so the front door can be an opening ---------- */
 {const DA0=3.91,DA1=5.24;/* the door's angles on the -z side, y 0 .. 1.95 */
  const t1=skin(11.4,{win:[.4*64,10.6*64],name:4.5*64,tally:3.5*64,soot:[0,90]}),i1=inner(11.4,{win:[.4*64,10.6*64]});
  const tb=(x0,x1,a0,a1,tO,tI,j)=>{A(csTubeGeo(x0,x1,RO,RO,CY,a0,a1,N,1,j?{end:0,d:jag}:null),SK(tO,1),0,0,0);A(csTubeGeo(x0,x1,RI,RI,CY,a0,a1,N,1,j?{end:0,d:jag}:null),IN(tI),0,0,0)};
  tb(-10,1.4,0,TAU,t1,i1,1);A(csRimGeo(-10,RO,RI,CY,0,TAU,N,jag,1),RIM,0,0,0);
  const t2=skin(.9,{}),i2=inner(.9,{});tb(1.4,2.3,DA1,DA0+TAU,t2,i2,0);
  const t3=skin(3.25,{}),i3=inner(3.25,{});tb(2.3,5.55,0,TAU,t3,i3,0);
  /* door frame and the door itself, swung open forward against the side */
  for(const x of[1.4,2.3])rod([x,CY+RO*Math.cos(DA0),RO*Math.sin(DA0)],[x,CY+RO*Math.cos(DA1),RO*Math.sin(DA1)],.04,GR);
  {const dg=new THREE.Group();dg.position.set(2.32,0,-1.64);dg.rotation.y=Math.PI+.15;g.add(dg);const d=k.H(dg);d.B(.9,1.9,.07,WH,-.45,.98,-.04);d.B(.9,.12,.072,TL,-.45,.7,-.04);d.B(.08,.3,.05,GR,-.8,1.0,.02);d.B(.4,.5,.02,M(0x1a2630),-.45,1.35,-.08)}
  /* the nose: a tapering tube crumpled underneath, a cap, the cockpit windows */
  const dent=(x,y,z)=>{const f=Math.max(0,x-6.3)/1.6;if(y<CY)return[x-f*f*.5*(CY-y),y+f*.25*(CY-y),z*(1-f*.15)];return[x,y,z]};
  const t4=skin(2.1,{cock:[0,2.1*64*.85]}),i4=inner(2.1,{cock:[0,2.1*64*.85]});A(csTubeGeo(5.55,7.65,RO,.72,CY,0,TAU,N,4,null,dent),SK(t4,1),0,0,0);A(csTubeGeo(5.55,7.6,RI,.68,CY,0,TAU,N,4,null,dent),IN(i4),0,0,0);
  {const cap=A(new THREE.SphereGeometry(.72,16,10,0,TAU,0,Math.PI/2),WH,7.62,CY,0);cap.rotation.z=-Math.PI/2;cap.scale.set(1,.55,1)}
  map.push([-10,7.6,-1.6,1.6,'#d8d8d4'])}
 /* ---------- inside: sand floor over the carpet, seats, bins, masks, the cockpit ---------- */
 {const cp=A(new THREE.PlaneGeometry(13,.8),M(0x2a3450,{roughness:1,polygonOffset:true,polygonOffsetUnits:-2}),-3.5,.012,-.2);cp.rotation.x=-Math.PI/2;
  const seat=(x,z,ry,par,lean)=>{const sg=new THREE.Group();sg.position.set(x,0,z);sg.rotation.y=ry||0;(par||g).add(sg);const s=k.H(sg);
   s.B(.46,.12,.46,SEAT,0,.46,0);s.B(.4,.06,.4,GR,0,.37,0);for(const a of[-.18,.18])for(const b of[-.16,.16])s.Cy(.02,.02,.34,GR,a,.17,b,null,null,6);
   const bk=new THREE.Group();bk.position.set(-.22,.5,0);bk.rotation.z=.18+(lean||0);sg.add(bk);const b=k.H(bk);b.B(.1,.72,.46,SEAT2,0,.36,0);b.B(.105,.2,.3,M(0xf0f0ec),0,.6,0);
   for(const a of[-.25,.25])s.B(.4,.05,.05,GR,0,.62,a);return sg};
  /* rows every 0.8 m; the last ones flew out the back */
  for(let x=-7.6;x<=1.0;x+=.8){seat(x,-.85,0,null,x==-4.4?.5:0);if(x<1.4){seat(x,.45,0);seat(x,.93,0)}}
  ob(-10,5.6,1.1,1.7);ob(-10,1.4,-1.7,-1.1);ob(2.3,5.6,-1.7,-1.1);ob(-7.9,1.25,-1.1,-.6);ob(-7.9,1.25,.2,1.1);
  /* overhead bins, some open; oxygen masks on their hoses */
  for(const s of[-1,1])for(let x=-9.4;x<1.2;x+=1.6){const z=s*.81;B(1.56,.3,.42,PL,x+.8,2.1,z);const op=R()<.4;const dg=new THREE.Group();dg.position.set(x+.8,2.25,s*.6);g.add(dg);dg.rotation.x=op?s*1.2:0;k.H(dg).B(1.54,.32,.03,M(0xe0ded8),0,-.16,0)}
  for(let i=0;i<9;i++){const x=-7.4+R()*8,z=(R()<.5?-.85:.7);const L=.3+R()*.4;rod([x,1.95,z],[x+.02,1.95-L,z+.02],.006,M(0xd8d8d0));Cy(.06,.05,.07,YL,x+.02,1.95-L-.03,z+.02,null,null,10)}
  /* sand blown in at the break, spilling out */{const s=A(new THREE.SphereGeometry(1,20,10,0,TAU,0,Math.PI/2),SAND,-9.6,0,0);s.scale.set(3.4,.55,1.5)}
  /* the bulkhead with the cockpit doorway, the door swung into the cabin */
  {const sh=new THREE.Shape();sh.absarc(0,0,RI-.01,0,TAU,false);const ho=new THREE.Path();ho.moveTo(-.4,-CY);ho.lineTo(.4,-CY);ho.lineTo(.4,.75);ho.lineTo(-.4,.75);ho.lineTo(-.4,-CY);sh.holes.push(ho);
   for(const x of[2.55,2.6]){const m=A(new THREE.ShapeGeometry(sh,24),M(0xb8b6b0,{side:x==2.55?THREE.BackSide:THREE.FrontSide}),x,CY,0);m.rotation.y=Math.PI/2}
   const dg=new THREE.Group();dg.position.set(2.5,0,.4);dg.rotation.y=1.35;g.add(dg);k.H(dg).B(.78,1.85,.04,M(0xc8c6c0),-.39,.95,0);ob(2.45,2.65,-1.1,-.42);ob(2.45,2.65,.42,1.1)}
  /* the cockpit: two seats, a pedestal with the log on it, the panel, yokes, the overhead panel */
  seat(4.0,-.6,0);seat(4.0,.6,0);ob(3.7,4.3,-.95,-.3);ob(3.7,4.3,.3,.95);
  B(1.0,.5,.36,DK,4.85,.7,0);B(.5,.03,.3,M(0x5a4030),4.75,.965,0);{const t=k.can(256,160,(x,w,h)=>{x.fillStyle='#5a4030';x.fillRect(0,0,w,h);x.fillStyle='#e8dcc0';x.font='bold 40px '+F;x.textAlign='center';x.fillText("PILOT'S LOG",w/2,70);x.font='28px '+F;x.fillText('DA-100',w/2,120)});const p=A(new THREE.PlaneGeometry(.46,.28),new THREE.MeshStandardMaterial({map:t,roughness:.9}),4.75,.982,0);p.rotation.set(-Math.PI/2,0,-Math.PI/2)}
  {const t=k.can(512,128,(x,w,h)=>{x.fillStyle='#1c1e22';x.fillRect(0,0,w,h);for(let i=0;i<12;i++){const u=30+i*40+(i>5?24:0),v=i%2?84:44;x.fillStyle='#0a0a0c';x.beginPath();x.arc(u,v,17,0,7);x.fill();x.strokeStyle='#c8c8c0';x.lineWidth=2;x.beginPath();x.arc(u,v,15,0,7);x.stroke();x.strokeStyle='#e8e8e0';x.beginPath();x.moveTo(u,v);x.lineTo(u+Math.cos(i*1.9)*12,v+Math.sin(i*1.9)*12);x.stroke()}});
   B(.28,.56,2.1,DK,5.55,1.2,0);const p=A(new THREE.PlaneGeometry(2.0,.5),new THREE.MeshStandardMaterial({map:t,roughness:.6}),5.405,1.2,0);p.rotation.y=-Math.PI/2;B(.5,.08,2.0,DK,5.45,1.52,0)}
  for(const z of[-.6,.6]){rod([5.2,.1,z],[5.0,1.0,z],.035,DK);B(.05,.06,.36,DK,4.98,1.02,z);for(const s of[-1,1])B(.05,.16,.05,DK,4.98,1.12,z+s*.16)}
  {const o=B(1.0,.08,.7,DK,4.6,2.42,0);o.rotation.z=-.25}
  ob(5.3,7.7,-1.5,1.5)}
 /* ---------- the left wing (-z), still on: root on the roof, inboard drooping, outboard bent into the sand ---------- */
 const foil=(c,t)=>{const sh=new THREE.Shape();sh.moveTo(c/2,0);sh.bezierCurveTo(c*.4,t*.9,c*.05,t,-c*.2,t*.8);sh.bezierCurveTo(-c*.4,t*.55,-c*.48,t*.2,-c/2,0);sh.lineTo(c/2,0);return sh};
 const wingPiece=(par,len,c,t,mat)=>{const geo=new THREE.ExtrudeGeometry(foil(c,t),{depth:len,bevelEnabled:false});const m=new THREE.Mesh(geo,mat);par.add(m);return m};
 const WX=-4.0,WY=2.68;
 {const w1=new THREE.Group();w1.position.set(WX,WY,-.6);w1.rotation.x=-.1;g.add(w1);/* the tip droops */
  const p=wingPiece(w1,5.6,2.4,.32,WH);p.position.z=-5.6;/* extruded along z, so it runs from -5.6 to 0 */
  /* the centre section on the roof, a fairing, and the torn stub of the right wing */{const c=wingPiece(g,2.5,2.4,.32,WH);c.position.set(WX,WY,-.6);B(2.6,.14,2.4,WH,WX-.05,2.64,.1);const pl=B(2.2,.26,.04,RIM,WX-.05,WY+.12,1.92);pl.rotation.x=.2}
  /* the engine under the wing, blades bent */const eg=new THREE.Group();eg.position.set(.2,-.15,-3.4);w1.add(eg);const e=k.H(eg);
  e.Cy(.5,.42,3.6,WH,-.3,-.45,0,'x',null,18);e.Cy(.42,.3,.6,GR,1.75,-.45,0,'x',null,18);e.Cy(.3,.3,.02,SOOT,-2.11,-.45,0,'x',null,18);e.B(1.6,.3,.5,WH,-.5,-.1,0);
  {const hb=new THREE.Group();hb.position.set(2.1,-.45,0);hb.rotation.x=.4;eg.add(hb);const h=k.H(hb);h.A(new THREE.SphereGeometry(.24,12,8,0,TAU,0,Math.PI/2),GR,0,0,0).rotation.z=-Math.PI/2;
   for(let i=0;i<4;i++){const bg=new THREE.Group();bg.rotation.x=i*Math.PI/2;hb.add(bg);const L1=.8,L2=.6;const b1=k.H(bg).B(.06,L1,.2,DK,.05,L1/2+.15,0);const bend=new THREE.Group();bend.position.set(.05,L1+.15,0);bend.rotation.z=.6+i*.15;bg.add(bend);k.H(bend).B(.06,L2,.18,DK,0,L2/2,0)}}
  {const sc=A(new THREE.CircleGeometry(.9,18),M(0x1e1a16,{transparent:true,opacity:.6,depthWrite:false,polygonOffset:true,polygonOffsetUnits:-3}),-1.0,.03,-3.6);sc.rotation.x=-Math.PI/2;sc.scale.set(1.8,1,1)}
  const w2=new THREE.Group();w2.position.set(0,0,-5.55);w2.rotation.x=-.36;w1.add(w2);const p2=wingPiece(w2,4.3,2.2,.28,WH);p2.position.z=-4.3;
  k.H(w2).B(.2,.12,.1,M(0xd02020,{emissive:0x300000}),-.2,.1,-4.3);/* nav light */
  map.push([-5.4,-2.6,-10.6,-1.6,'#d8d8d4']);ob(-5.3,-2.7,-10.6,-9.0);ob(-2.2,1.1,-4.0,-3.0)}
 /* ---------- the pilot's camp under the wing ---------- */
 {const TP=M(0x5a6a3a,{roughness:.95,side:THREE.DoubleSide});
  /* the tarp: tied to the trailing edge, down to two stakes, ropes */{const geo=new THREE.PlaneGeometry(3.2,2.9,6,6);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);p.setZ(i,Math.sin((y/2.9+.5)*Math.PI)*.12)}geo.computeVertexNormals();
   const t=A(geo,TP,-6.25,1.15,-6.3);t.rotation.set(0,Math.PI/2,0);t.rotateX(.74);for(const z of[-7.8,-4.8]){Cy(.03,.03,.5,M(0x6a4a2a),-7.15,.2,z,null,null,6);rod([-7.15,.42,z],[-7.25,.05,z+(z<-6?-.4:.4)],.008,M(0xc8b890))}}
  /* bed: four seat cushions under the tarp, a blanket */for(let i=0;i<4;i++)B(.46,.1,.46,SEAT,-5.6,.05,-7.3+i*.48);B(.9,.04,1.5,M(0x8a3030,{roughness:1}),-5.55,.12,-6.75);
  /* two seats pulled out round the fire ring */const sf=(x,z,ry)=>{const sg=new THREE.Group();sg.position.set(x,0,z);sg.rotation.y=ry;g.add(sg);const s=k.H(sg);s.B(.46,.12,.46,SEAT,0,.42,0);s.B(.4,.4,.4,GR,0,.18,0);s.B(.1,.72,.46,SEAT2,-.22,.82,0).rotation.z=.15;s.B(.105,.2,.3,M(0xf0f0ec),-.24,1.06,0).rotation.z=.15};
  sf(-1.6,-5.4,-.9);sf(-1.0,-8.6,.9);
  /* the fire ring: stones, ash, charred sticks */{const ST=M(0x7a6a5a,{roughness:1,metalness:0});for(let i=0;i<9;i++){const a=i/9*TAU;const s=A(new THREE.DodecahedronGeometry(.16,0),ST,.6+Math.cos(a)*.5,.08,-7+Math.sin(a)*.5);s.rotation.set(R()*3,R()*3,0);s.scale.y=.7}
   const ash=A(new THREE.CircleGeometry(.42,14),M(0x3a3632,{roughness:1,polygonOffset:true,polygonOffsetUnits:-2}),.6,.02,-7);ash.rotation.x=-Math.PI/2;for(let i=0;i<4;i++){const s=Cy(.03,.03,.6,M(0x1a1612),.6,.06,-7,null,null,5);s.rotation.set(Math.PI/2,i*.8,0)}ob(.05,1.15,-7.55,-6.45)}
  /* water bottles, a suitcase table with the flare gun case on it */
  for(let i=0;i<7;i++){const x=-4.8+(i%4)*.12,z=-4.5+(i/4|0)*.12;Cy(.045,.045,.24,M(0x6aa8d0,{transparent:true,opacity:.75,roughness:.2}),x,.12+(i>=4?0:0),z,null,null,8);Cy(.025,.025,.03,M(0x2a6ad0),x,.255,z,null,null,8)}
  B(.7,.42,.45,M(0x6a2a2a,{roughness:.8}),-3.6,.21,-6.4);B(.72,.03,.47,M(0x4a1a1a),-3.6,.43,-6.4);B(.2,.04,.04,DK,-3.6,.47,-6.17);
  B(.36,.08,.26,OR,-3.6,.485,-6.4);{const fg=new THREE.Group();fg.position.set(-3.6,.54,-6.4);g.add(fg);const f=k.H(fg);f.B(.22,.07,.05,M(0xe04818),.02,0,0);f.Cy(.03,.03,.16,M(0xe04818),.16,.0,0,'x',null,8);f.B(.05,.12,.04,M(0xe04818),-.06,-.04,0).rotation.z=.3}
  ob(-6.4,-3.3,-8.3,-4.3)}
 /* ---------- SOS in rocks out past the wing tip ---------- */
 {const pts=[];const S=(ox)=>{const P=[[1,1.6],[0,1.6],[-.4,1.2],[-.4,.5],[0,.05],[.5,-.1],[.9,-.5],[.9,-1.2],[.5,-1.6],[-.5,-1.6]];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.32);for(let j=0;j<n;j++){const t=j/n;pts.push([ox+a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])}}};
  S(-6);S(3);for(let i=0;i<22;i++){const a=i/22*TAU;pts.push([-1.5+Math.cos(a)*1.1,Math.sin(a)*1.65])}
  const im=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.17,0),M(0x6a5a4a,{roughness:1,metalness:0}),pts.length),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),s=new THREE.Vector3();
  pts.forEach((p,i)=>{e.set(R()*3,R()*3,R()*3);q.setFromEuler(e);const k2=.8+R()*.5;s.set(k2,k2*.7,k2);m4.compose(new THREE.Vector3(-2+p[0],.07,-16-p[1]),q,s);im.setMatrixAt(i,m4)});g.add(im);
  /* note: letters drawn so they read from the plane's side; z flipped so "SOS" reads east to west from the sky? it reads left to right looking north (-z) */
  map.push([-9,4,-18,-14,'#8a7a6a'])}
 /* ---------- the tail section, rolled on its side, and the black box ---------- */
 const tg=new THREE.Group();tg.position.set(-17,1.15,1.2);tg.rotation.set(.55,-.3,.093,'YZX');g.add(tg);{const T=k.H(tg);
  const tj=jag.map((d,i)=>.2+((i*7)%5)*.12);const ts=skin(7,{reg:1.8*64}),ti=inner(7,{});
  T.A(csTubeGeo(-7,0,.55,RO,0,0,TAU,N,1,{end:1,d:tj}),SK(ts,1),0,0,0);T.A(csTubeGeo(-7,0,.5,RI,0,0,TAU,N,1,{end:1,d:tj}),IN(ti),0,0,0);T.A(csRimGeo(0,RO,RI,0,0,TAU,N,tj,-1),RIM,0,0,0);
  T.Cy(.55,.4,.5,GR,-7.25,0,0,'x',null,16);
  /* the fin: swept, with the sandpiper on both sides */{const sh=new THREE.Shape();sh.moveTo(-1.2,0);sh.lineTo(-5.4,0);sh.lineTo(-7.2,3.0);sh.lineTo(-5.9,3.0);sh.lineTo(-1.2,0);const geo=new THREE.ExtrudeGeometry(sh,{depth:.16,bevelEnabled:false});geo.translate(0,0,-.08);T.A(geo,WH,0,.9,0);
   const lg=k.can(256,256,(x,w,h)=>{x.fillStyle='#1f7a7a';x.beginPath();x.arc(128,128,120,0,7);x.fill();x.fillStyle='#e8e8e4';x.beginPath();x.ellipse(118,140,62,30,-.25,0,7);x.fill();x.beginPath();x.arc(178,100,22,0,7);x.fill();x.beginPath();x.moveTo(196,96);x.lineTo(250,112);x.lineTo(196,106);x.fill();x.fillRect(100,165,6,50);x.fillRect(130,160,6,55);x.fillStyle='#1a1a1a';x.beginPath();x.arc(184,96,4,0,7);x.fill()});
   for(const s of[1,-1]){const p=T.A(new THREE.PlaneGeometry(1.3,1.3),new THREE.MeshStandardMaterial({map:lg,transparent:true,roughness:.5}),-5.05,2.1,s*.085);if(s<0)p.rotation.y=Math.PI}}
  /* the tailplanes */for(const s of[-1,1]){const sh=new THREE.Shape();sh.moveTo(-5.0,0);sh.lineTo(-6.9,0);sh.lineTo(-7.3,s*2.8);sh.lineTo(-6.4,s*2.8);sh.lineTo(-5.0,0);const geo=new THREE.ExtrudeGeometry(sh,{depth:.12,bevelEnabled:false});const m=T.A(geo,WH,0,.15,0);m.rotation.x=Math.PI/2;m.position.y=.2}}
 ob(-25.2,-16,-3.4,2.9);map.push([-24.5,-16,-1.8,2.6,'#d8d8d4']);
 const bb=B(.42,.3,.52,OR,-26.2,.15,-2.2);bb.rotation.y=.5;{const t=k.can(256,128,(x,w,h)=>{x.fillStyle='#ff7a20';x.fillRect(0,0,w,h);x.fillStyle='#1a1a1a';x.font='bold 30px '+F;x.textAlign='center';x.fillText('FLIGHT RECORDER',w/2,52);x.font='22px '+F;x.fillText('DO NOT OPEN',w/2,90)});const p=new THREE.Mesh(new THREE.PlaneGeometry(.48,.24),new THREE.MeshStandardMaterial({map:t,roughness:.5}));p.position.set(0,0,.262);bb.add(p);for(const s of[-1,1]){const b2=new THREE.Mesh(new THREE.BoxGeometry(.44,.04,.06),new THREE.MeshStandardMaterial({color:0xe8e8e0}));b2.position.set(0,s*.09,-.25);bb.add(b2)}}
 /* ---------- the furrow: churned sand with berms, from the first impact to the break ---------- */
 {const fz=x=>.9*Math.sin((x+10)/17),fw=x=>Math.min(1,.45+(x+86)/40);const prof=[[-2.7,0],[-2.25,.3],[-1.85,.06],[1.85,.06],[2.25,.3],[2.7,0]];
  const P=[],UV=[],I=[];let n=0;for(let x=-86;x<=-10.4;x+=1){const z0=fz(x),w=fw(x),dz=(fz(x+.5)-fz(x-.5));const nx=-dz,nz=1,L=Math.hypot(nx,nz);prof.forEach(([o,y],j)=>{P.push(x+nx/L*o*w,y*w,z0+nz/L*o*w);UV.push((x+86)/6,j/(prof.length-1))});n++}
  for(let i=0;i<n-1;i++)for(let j=0;j<prof.length-1;j++){const a=i*prof.length+j,b=a+prof.length;I.push(a,a+1,b,a+1,b+1,b)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));geo.setIndex(I);geo.computeVertexNormals();
  const t=k.can(256,128,(x,w,h)=>{x.fillStyle='#c4a874';x.fillRect(0,0,w,h);for(let i=0;i<300;i++){x.fillStyle=R()<.5?'rgba(120,90,50,.25)':'rgba(240,220,180,.25)';x.fillRect(R()*w,R()*h,8+R()*40,2)}});t.wrapS=THREE.RepeatWrapping;
  A(geo,new THREE.MeshStandardMaterial({map:t,roughness:1,polygonOffset:true,polygonOffsetUnits:-2}),0,0,0);
  for(const[x,z,r]of[[-84,0,2.4],[-79,.4,1.6]]){const s=A(new THREE.CircleGeometry(r,20),M(0x2a2420,{transparent:true,opacity:.4,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetUnits:-4}),x,.09,fz(x)+z);s.rotation.x=-Math.PI/2;s.scale.set(1.5,1,1)}
  map.push([-86,-10,-3,3,'#b89c6a'])}
 /* ---------- debris along the furrow ---------- */
 {/* the right wing, torn off, lying upside down */const w=new THREE.Group();w.position.set(-32,.34,7.2);w.rotation.set(Math.PI,.35,0);g.add(w);const p=wingPiece(w,8.2,2.4,.32,WH);p.position.z=-4.1;k.H(w).B(.06,.3,.4,RIM,0,.15,-4.1);ob(-35.5,-28.5,3.4,11)
  map.push([-35.5,-28.5,3.4,11,'#d8d8d4']);
  /* the right engine on its side, its propeller further back */const eg=new THREE.Group();eg.position.set(-47,.45,4.5);eg.rotation.set(1.2,.5,0);g.add(eg);const e=k.H(eg);e.Cy(.5,.42,3.4,WH,0,0,0,'x',null,18);e.Cy(.42,.3,.6,GR,1.95,0,0,'x',null,18);e.Cy(.32,.32,.04,SOOT,-1.72,0,0,'x',null,18);ob(-49,-45,3.5,5.5);
  {const pg=new THREE.Group();pg.position.set(-60,.12,2.4);pg.rotation.set(-Math.PI/2+.08,0,.6);g.add(pg);const p2=k.H(pg);p2.A(new THREE.SphereGeometry(.24,12,8),GR,0,0,0);for(let i=0;i<4;i++){const bg=new THREE.Group();bg.rotation.z=i*Math.PI/2;pg.add(bg);k.H(bg).B(.2,.9,.06,DK,0,.6,0);const bd=new THREE.Group();bd.position.set(0,1.05,0);bd.rotation.x=(i%2?.4:-.3);bg.add(bd);k.H(bd).B(.18,.5,.06,DK,0,.25,0)}}
  /* the main gear */{const gg=new THREE.Group();gg.position.set(-40,0,-3.6);gg.rotation.y=.8;g.add(gg);const q=k.H(gg);for(const s of[-.25,.25]){q.Cy(.42,.42,.24,DK,0,.42,s,'z',null,18);q.Cy(.2,.2,.26,GR,0,.42,s,'z',null,12)}q.rod([0,.42,0],[.9,1.0,0],.07,GR);q.rod([.5,.66,0],[.6,1.1,.3],.04,GR);ob(-40.7,-39.3,-4.3,-2.9)}
  /* seats thrown out */const ts=(x,z,rx,ry)=>{const sg=new THREE.Group();sg.position.set(x,.25,z);sg.rotation.set(rx,ry,0);g.add(sg);const s=k.H(sg);s.B(.46,.12,.46,SEAT,0,0,0);s.B(.1,.72,.46,SEAT2,-.22,.36,0);s.B(.105,.2,.3,M(0xf0f0ec),-.23,.6,0);for(const a of[-.18,.18])s.Cy(.02,.02,.3,GR,a,-.2,0,null,null,6)};
  ts(-22,-2.8,1.4,.5);ts(-27,3.2,.0,2.2);ts(-26.4,3.8,.0,2.4);ts(-53,-2.2,-1.5,1.2);ts(-67,1.6,1.6,-.4);
  /* suitcases, two burst open with clothes */const sc=(x,z,ry,col,open)=>{const s=new THREE.Group();s.position.set(x,0,z);s.rotation.y=ry;g.add(s);const h=k.H(s);h.B(.7,.12,.46,M(col),0,.06,0);if(open){const l=h.B(.7,.12,.46,M(col),0,.06,.47);l.rotation.x=.1;for(let i=0;i<3;i++)h.B(.25+R()*.3,.04,.2+R()*.2,M([0xd04040,0x40a0d0,0xe8e0c0,0x3a6a3a][i]),(R()-.5)*.5,.13+i*.02,(R()-.5)*.2+(i==2?.5:0)).rotation.y=R()}else h.B(.7,.12,.46,M(col),0,.18,0)};
  sc(-24,1.6,.4,0x3a4a6a,1);sc(-33,-1.8,1.9,0x6a3a2a,0);sc(-44,-1.2,.8,0x2a2a2a,1);sc(-57,4.1,2.6,0x8a7a3a,0);sc(-71,-.8,1.1,0x4a6a4a,0);
  /* torn skin panels, bent */for(const[x,z,ry]of[[-15,-2.4,.3],[-20,4,1.2],[-37,1.4,2.2],[-51,-.6,.9],[-63,-2.6,2.8],[-75,2.4,.5],[-80,-1.2,1.9]]){const pg=new THREE.Group();pg.position.set(x,.05,z);pg.rotation.y=ry;g.add(pg);const s=k.H(pg);const a=s.B(1.2,.03,.9,WH,0,.02,0);a.rotation.z=.08;const b=s.B(.7,.03,.9,WH,.9,.2,0);b.rotation.z=.5;s.B(1.2,.035,.12,TL,0,.04,.3).rotation.z=.08}
  /* a life vest, an oxygen bottle, a wheel cover */B(.4,.06,.5,YL,-29,.03,-1.6).rotation.y=.7;Cy(.12,.12,.7,M(0x2a6a3a,{metalness:.4}),-42,.12,2.2,'x').rotation.y=.4;{const c=Cy(.4,.4,.06,GR,-58,.03,-1.4,null,null,16)}}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});bb.userData.dpKeep=1;
 return{obs,map,bb,log:[4.75,0],flare:[-3.6,-6.4],box:[-26.2,-2.2]}}
