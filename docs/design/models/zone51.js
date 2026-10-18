/* Dark Zone 51 (airfield-zone51.md). Needs fort-kit.js (fbKit) and airfield.js (afKit, afPlane, afCanvas, afTarmac).
   Desert-local coordinates (DZ51 x -630..-470, z -1960..-1780). Everything is noSeam; moving parts are dpKeep.

   Batch 1:
   zfFence(g)         the perimeter: concrete posts, chain-link, outward-leaning arms with barbed wire and razor coil,
                      warning signs. Gaps: the gate (x -470, z -1873.5..-1866.5) and the Screech hole (x -630,
                      z -1801.2..-1800, the wire peeled back). Returns {obs} (the same runs the game uses today).
   zfGate(g)          the gate: two heavy posts with lamps, a sliding gate in a Group `gate` placed at (-470, 0, -1870)
                      (the ramming code knocks it off: give its obstacle m: gate, kd: 'gate'); a boom barrier outside
                      with its arm in `arm` (pivot at its post; rotation.z lifts it); a guard post inside.
                      Returns {gate, arm, obs}.
   zfTraps(g)         steel tank traps in a zig-zag on the approach road (x -465..-440), leaving a weaving lane.
                      Returns {obs}.
   zfTower(g, x, z)   a guard tower: braced steel legs, a cab with windows, a ladder, a searchlight that sweeps.
                      Returns {pv, obs}: pv is the searchlight's pivot (same as the game's: rotation.y sweeps,
                      rotation.x tilts), its beam cone hangs from it.
*/
function zfKit(){if(zfKit.k)return zfKit.k;const f=fbKit(),k=Object.create(f);k.M=f.M;zfKit.k=k;return k}
const DZB={x0:-630,x1:-470,z0:-1960,z1:-1780,gz0:-1873.5,gz1:-1866.5,hz0:-1801.2,hz1:-1800};

function zfFence(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],{x0,x1,z0,z1}=DZB,CON=M(0xa8a49c,{roughness:.95}),STL=M(0x6a6e74,{metalness:.5,roughness:.4}),H=3.2;
 const link=afCanvas(64,64,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle='rgba(205,210,215,.95)';x.lineWidth=1.6;for(let i=-64;i<128;i+=8){x.beginPath();x.moveTo(i,0);x.lineTo(i+64,64);x.stroke();x.beginPath();x.moveTo(i+64,0);x.lineTo(i,64);x.stroke()}});link.wrapS=link.wrapT=THREE.RepeatWrapping;
 const posts=[],arms=[],wire=M(0x9a9ea4,{metalness:.6,roughness:.35});
 /* one straight run from a to b (along x or z), its outward side is `out` (+1/-1 on the other axis) */
 const panel=(ax,az,bx,bz,y0,y1)=>{const L2=Math.hypot(bx-ax,bz-az),alongX=Math.abs(bx-ax)>.01;const t=link.clone();t.needsUpdate=true;t.repeat.set(L2/2,(y1-y0)/2);const m=new THREE.Mesh(new THREE.PlaneGeometry(L2,y1-y0),new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide,depthWrite:false,alphaTest:.2}));m.position.set((ax+bx)/2,(y0+y1)/2,(az+bz)/2);m.rotation.y=alongX?0:Math.PI/2;g.add(m)};
 const run=(ax,az,bx,bz,out,hole)=>{const L2=Math.hypot(bx-ax,bz-az),alongX=Math.abs(bx-ax)>.01;
  if(!hole)panel(ax,az,bx,bz,.08,H-.07);else{/* along z only: mesh either side of the hole, and over it */panel(ax,az,ax,hole[0]-.5,.08,H-.07);panel(ax,hole[1]+.5,bx,bz,.08,H-.07)/* the 2.2 m across the hole is drawn by the hole itself */}
  const n=Math.max(1,Math.round(L2/3));for(let i=0;i<=n;i++){const px=ax+(bx-ax)*i/n,pz=az+(bz-az)*i/n;B(.18,H,.18,px,H/2,pz,CON);
   /* the outward-leaning arm on top */const ox=alongX?0:out*.55,oz=alongX?out*.55:0;rod([px,H-.05,pz],[px+ox,H+.5,pz+oz],.03,STL)}
  /* top rail, bottom tension wire, three barbed strands on the arms, the razor coil along them */
  rod([ax,H-.1,az],[bx,H-.1,bz],.035,STL);if(!hole)rod([ax,.12,az],[bx,.12,bz],.012,wire);else{rod([ax,.12,az],[ax,.12,hole[0]],.012,wire);rod([ax,.12,hole[1]],[bx,.12,bz],.012,wire)}
  for(const f of[.35,.7,1]){const ox=alongX?0:out*.55*f,oz=alongX?out*.55*f:0;rod([ax+ox,H-.05+.55*f,az+oz],[bx+ox,H-.05+.55*f,bz+oz],.008,wire)}
  {const ox=alongX?0:out*.3,oz=alongX?out*.3:0,cx=(ax+bx)/2+ox,cz=(az+bz)/2+oz,turns=Math.round(L2/.35),pts=[];for(let i=0;i<=turns*8;i++){const u=i/(turns*8),a=u*turns*Math.PI*2,r=.26;const along=-L2/2+u*L2;const lx=alongX?along:Math.sin(a)*r,lz=alongX?Math.sin(a)*r:along;pts.push(new THREE.Vector3(cx+lx,H+.35+Math.cos(a)*r,cz+lz))}const tb=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),turns*8,.01,3),wire);g.add(tb)}
  if(!hole)obs.push({x0:Math.min(ax,bx)-.15,x1:Math.max(ax,bx)+.15,z0:Math.min(az,bz)-.15,z1:Math.max(az,bz)+.15});else obs.push({x0:ax-.15,x1:ax+.15,z0:az,z1:hole[0]},{x0:ax-.15,x1:ax+.15,z0:hole[1],z1:bz})};
 run(x0,z0,x1,z0,-1);run(x0,z1,x1,z1,1);run(x0,z0,x0,z1,-1,[DZB.hz0,DZB.hz1,1.45]);/* the west side runs unbroken; only the mesh has the hole */run(x1,z0,x1,DZB.gz0-.6,1);run(x1,DZB.gz1+.6,x1,z1,1);
  /* the Screech hole: one 2.2 m piece of mesh across the hole, with a ragged, roughly round hole torn out of its
    bottom (about 1.2 wide and 1.4 high); no flap */
 {const x=x0,za=DZB.hz0-.5,zb=DZB.hz1+.5,zc=(DZB.hz0+DZB.hz1)/2,PW=zb-za,PH=H-.15,HW=1.25,HH=1.45;let sd=13;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;
  const outline=[];for(let i=0;i<=24;i++){const a=Math.PI*i/24,w=HW/2*(1+(r()-.5)*.18),h=HH*(1+(r()-.5)*.12);outline.push([Math.cos(a)*w,i==0||i==24?0:Math.sin(a)*h*(.85+.15*Math.sin(a))])}
  const pix=128,cw=Math.round(PW*pix/2),ch=Math.round(PH*pix/2);const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const c=cv.getContext('2d');c.strokeStyle='rgba(205,210,215,.95)';c.lineWidth=1.6*pix/64;for(let i=-ch;i<cw+ch;i+=8*pix/64){c.beginPath();c.moveTo(i,0);c.lineTo(i+ch,ch);c.stroke();c.beginPath();c.moveTo(i+ch,0);c.lineTo(i,ch);c.stroke()}
  const U=zz=>(zz-za)/PW*cw,V=y=>ch-(y-.08)/PH*ch;c.globalCompositeOperation='destination-out';c.beginPath();outline.forEach(([dz,y],i)=>{const px=U(zc+dz),py=V(y);i?c.lineTo(px,py):c.moveTo(px,py)});c.closePath();c.fill();
  /* bent cut ends round the edge: short grey strokes poking out of the hole's rim */c.globalCompositeOperation='source-over';c.strokeStyle='rgba(185,190,195,.95)';c.lineWidth=1.4*pix/64;outline.forEach(([dz,y],i)=>{if(i%2)return;const px=U(zc+dz),py=V(y),nx=dz,ny=-(y-0);const l=Math.hypot(nx,ny)||1;c.beginPath();c.moveTo(px,py);c.lineTo(px-nx/l*6,py-ny/l*6*-1);c.stroke()});
  const tx=new THREE.CanvasTexture(cv);tx.anisotropy=4;const hm=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),new THREE.MeshBasicMaterial({map:tx,transparent:true,side:THREE.DoubleSide,depthWrite:false,alphaTest:.2}));hm.rotation.y=Math.PI/2;hm.position.set(x,.08+PH/2,(za+zb)/2);g.add(hm);
  B(.03,.5,1,x-.06,1.9,-1798.7,M(0x1a1a1a));for(const dz of[-.4,.4])rod([x-.04,2.17,-1798.7+dz],[x,2.3,-1798.7+dz],.006,wire);const n=k.lab('psst. this way.\n– S',1,.5,'#1a1a1a','#f0f0f0',50);n.position.set(x-.08,1.9,-1798.7);n.rotation.y=-Math.PI/2;g.add(n)}
 /* warning signs every 30 m, on the outside face */const SG=['RESTRICTED AREA\nDARK ZONE 51','NO TRESPASSING\nTRESPASSERS WILL BE SEEKED','USE OF DARK FORCE\nAUTHORISED','TURN AROUND\n(THIS MEANS YOU, HALT)','PHOTOGRAPHY\nPROHIBITED','KEEP OUT\nNOTHING TO SEE HERE'];let si=0;
 const sign=(x,z,ry)=>{const sg=new THREE.Group();sg.position.set(x,1.7,z);sg.rotation.y=ry;g.add(sg);const bd=new THREE.Mesh(new THREE.BoxGeometry(1.4,.9,.03),M(0xf0ece4));sg.add(bd);const l=k.lab(SG[si++%SG.length],1.3,.8,'#ffffff','#c01818',40);l.position.z=.02;sg.add(l);const bar=new THREE.Mesh(new THREE.BoxGeometry(1.4,.16,.035),M(0xc01818));bar.position.y=.37;sg.add(bar)};
 for(let x=x0+15;x<x1;x+=30){sign(x,z0-.1,Math.PI);sign(x,z1+.1,0)}for(let z=z0+15;z<z1;z+=30){if(Math.abs(z-(-1800.6))>4)sign(x0-.1,z,-Math.PI/2);if(z<DZB.gz0-3||z>DZB.gz1+3)sign(x1+.1,z,Math.PI/2)}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}

function zfGate(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],x=DZB.x1,zc=(DZB.gz0+DZB.gz1)/2,STL=M(0x6a6e74,{metalness:.5,roughness:.4}),YB=M(0xe8c020,{roughness:.5}),RD=M(0xc01818,{roughness:.5}),CON=M(0xa8a49c,{roughness:.95});
 /* the two gate posts: square steel with a lamp each, in the gaps the fence leaves (z gz0-.6..gz0 and gz1..gz1+.6) */
 for(const z of[DZB.gz0-.3,DZB.gz1+.3]){B(.45,4,.45,x,2,z,STL);B(.55,.12,.55,x,4.06,z,STL);C(.12,.15,.3,x+.3,3.8,z,M(0x26282b),'x',null,10);C(.1,.1,.03,x+.46,3.8,z,M(0xfff4d0,{emissive:0xffe0a0,emissiveIntensity:.9}),'x',null,10);B(.8,.3,.8,x,.15,z,CON);obs.push({x0:x-.3,x1:x+.3,z0:z-.3,z1:z+.3})}
 /* the gate: two leaves of steel frame with mesh and diagonal bracing, on its own Group (the ramming code throws it) */
 const gate=new THREE.Group();gate.position.set(x,0,zc);g.add(gate);const{B:GB,rod:GR}=k.H(gate);const link=afCanvas(64,64,(c,w,h)=>{c.strokeStyle='rgba(205,210,215,.95)';c.lineWidth=1.6;for(let i=-64;i<128;i+=8){c.beginPath();c.moveTo(i,0);c.lineTo(i+64,64);c.stroke();c.beginPath();c.moveTo(i+64,0);c.lineTo(i,64);c.stroke()}});link.wrapS=link.wrapT=THREE.RepeatWrapping;link.repeat.set(1.6,1.4);
 for(const s of[-1,1]){const zz=s*1.72,W=3.4,Hh=2.9;GB(.1,.1,W,0,.2,zz,STL);GB(.1,.1,W,0,Hh,zz,STL);for(const e of[-1,1])GB(.1,Hh-.1,.1,0,(Hh+.2)/2,zz+e*(W/2-.05),STL);GR([0,.25,zz-s*(W/2-.1)],[0,Hh-.05,zz+s*(W/2-.1)],.03,STL);
  const mm=new THREE.Mesh(new THREE.PlaneGeometry(W-.1,Hh-.2),new THREE.MeshBasicMaterial({map:link,transparent:true,side:THREE.DoubleSide,depthWrite:false,alphaTest:.2}));mm.rotation.y=Math.PI/2;mm.position.set(0,(Hh+.2)/2,zz);gate.add(mm);
  for(let i=0;i<2;i++){const w=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.06,12),M(0x26282b));w.rotation.x=Math.PI/2;w.position.set(0,.09,zz+s*(i?-1.2:1.2));gate.add(w)}
  const sg=k.lab('AUTHORISED DARK\nPERSONNEL ONLY',1.6,.6,'#c01818','#ffffff',44);sg.position.set(.06,1.7,zz);sg.rotation.y=Math.PI/2;gate.add(sg);const sb=sg.clone();sb.position.x=-.06;sb.rotation.y=-Math.PI/2;gate.add(sb)}
 {const lk=new THREE.Mesh(new THREE.BoxGeometry(.2,.3,.25),M(0xd8b020,{metalness:.5,roughness:.3}));lk.position.set(.12,1.4,0);gate.add(lk);const sh=new THREE.Mesh(new THREE.TorusGeometry(.08,.02,6,12,Math.PI),M(0xc0c4c8,{metalness:.5}));sh.position.set(.12,1.57,0);sh.rotation.y=Math.PI/2;gate.add(sh)}
 gate.traverse(m=>{m.userData.dpKeep=1});
 /* the boom barrier outside the gate (x -466), its post on the south side of the road; the arm across the road */
 const bx=x+4,bz=DZB.gz0-.8;B(.5,1.1,.5,bx,.55,bz,RD);B(.6,.12,.6,bx,1.16,bz,M(0x26282b));C(.1,.1,.7,bx,1.0,bz,STL,'z',null,10);obs.push({x0:bx-.3,x1:bx+.3,z0:bz-.3,z1:bz+.3});
 const arm=new THREE.Group();arm.position.set(bx,1.0,bz+.35);g.add(arm);{const n=8,len=7.6;for(let i=0;i<n;i++){const sgm=new THREE.Mesh(new THREE.BoxGeometry(.14,.14,len/n),i%2?RD:M(0xf4f0e6));sgm.position.z=(i+.5)*len/n;arm.add(sgm)}const cw=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.6),M(0x3a3a3c));cw.position.z=-.5;arm.add(cw);const tip=new THREE.Mesh(new THREE.SphereGeometry(.08,8,6),M(0xff2010,{emissive:0xff1000,emissiveIntensity:.9}));tip.position.z=len;arm.add(tip);
  const rest=new THREE.Mesh(new THREE.BoxGeometry(.12,.9,.12),YB);rest.position.set(bx,.45,DZB.gz1+.9);g.add(rest)}arm.rotation.x=0;arm.traverse(m=>m.userData.dpKeep=1);
 /* the guard post inside (x -484..-476, z -1884..-1876): a block hut with a wrap-round window to the gate, a door, a flat roof with a floodlight */
 {const x0=-484,x1=-476,za=-1884,zb=-1876,xc=(x0+x1)/2,zc2=(za+zb)/2,H=2.8,W2=M(0xc8c4b8,{roughness:.9}),GL=M(0x5a7a8a,{metalness:.3,roughness:.1,transparent:true,opacity:.6});
  B(x1-x0,1.0,zb-za,xc,.5,zc2,W2);for(const[a,b]of[[x0,za],[x1,za],[x0,zb],[x1,zb]])B(.25,H,.25,a+(a<xc?.125:-.125),H/2,b+(b<zc2?.125:-.125),W2);B(x1-x0,.6,zb-za,xc,H-.3,zc2,W2);
  B(x1-x0-.5,1.2,.06,xc,1.6,zb-.12,GL);B(.06,1.2,zb-za-.5,x1-.12,1.6,zc2,GL);B(.06,1.2,zb-za-.5,x0+.12,1.6,zc2,GL);B(x1-x0-.5,1.2,.06,xc,1.6,za+.12,W2);
  B(.9,2.1,.06,x0+1.4,1.05,za+.1,M(0x2a3a4a));B(x1-x0+.6,.2,zb-za+.6,xc,H+.1,zc2,M(0x5a5e64));C(.06,.06,1,x1-.6,H+.7,zb-.6,STL,null,null,8);B(.6,.3,.25,x1-.6,H+1.2,zb-.5,M(0x26282b)).rotation.x=-.4;
  B(.5,.9,.4,x1-.6,.45,zb-.6,M(0x3a3a3c));L('GATE',1.2,.3,'#26282b','#ffd040',60,xc,H-.3,zb+.01,0);obs.push({x0,x1,z0:za,z1:zb})}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{gate,arm,obs}}

function zfTraps(g){const k=zfKit(),M=k.M,obs=[],ST=M(0x4a4c50,{metalness:.5,roughness:.55}),RU=M(0x7a4a2a,{roughness:.8});
 /* a hedgehog: three steel angles crossing at the middle, standing on three of their ends */
 const hog=(x,z,ry)=>{/* three angles along x, y and z, then the group turned so one corner of that cube points up: it stands on three ends */const hg=new THREE.Group(),inner=new THREE.Group();hg.add(inner);for(let i=0;i<3;i++){const a=new THREE.Group();const b1=new THREE.Mesh(new THREE.BoxGeometry(1.8,.16,.03),i==1?RU:ST),b2=new THREE.Mesh(new THREE.BoxGeometry(1.8,.03,.16),ST);b2.position.set(0,.065,.065);a.add(b1,b2);if(i==1)a.rotation.z=Math.PI/2;if(i==2)a.rotation.y=Math.PI/2;inner.add(a)}
  inner.quaternion.setFromUnitVectors(new THREE.Vector3(1,1,1).normalize(),new THREE.Vector3(0,1,0));hg.position.set(x,.9/Math.sqrt(3)+.02,z);hg.rotation.y=ry;g.add(hg);obs.push({x0:x-.75,x1:x+.75,z0:z-.75,z1:z+.75})};
 /* rows across the road, alternating sides, leaving a 3.4 m lane that weaves north and south */
 for(const[x,side]of[[-463,1],[-456,-1],[-449,1],[-442,-1]]){const lane=side>0?[-1874,-1870.6]:[-1869.4,-1866];for(let z=-1880;z<=-1860;z+=2.2){if(z>lane[0]-.8&&z<lane[1]+.8)continue;hog(x,z,(x*7+z)%3)}}
 /* reflective posts marking the lane */for(const[x,side]of[[-463,1],[-456,-1],[-449,1],[-442,-1]]){const lz=side>0?-1872.3:-1867.7;for(const e of[-1.9,1.9]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,1,8),M(0xf0ece4));p.position.set(x,.5,lz+e);g.add(p);const r=new THREE.Mesh(new THREE.BoxGeometry(.06,.1,.11),M(0xff6010,{emissive:0x803000}));r.position.set(x,.85,lz+e);g.add(r)}}
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs}}

function zfTower(g,tx,tz){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],STL=M(0x5a5e64,{metalness:.5,roughness:.45}),CON=M(0xa8a49c,{roughness:.95}),CAB=M(0x6a6e64,{roughness:.6}),GL=M(0x4a6070,{metalness:.3,roughness:.1,transparent:true,opacity:.6});
 const FY=9,R0=1.9,R1=1.4;for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){rod([tx+a*R0,0,tz+b*R0],[tx+a*R1,FY,tz+b*R1],.1,STL,null,8);B(.6,.2,.6,tx+a*R0,.1,tz+b*R0,CON)}
 const at=(a,b,y)=>{const r=R0+(R1-R0)*y/FY;return[tx+a*r,y,tz+b*r]};const C4=[[-1,-1],[1,-1],[1,1],[-1,1]];
 for(let i=0;i<4;i++){const[a,b]=C4[i],[c,d]=C4[(i+1)%4];for(const y of[3,6])rod(at(a,b,y),at(c,d,y),.05,STL);for(const[y0,y1]of[[.3,3],[3,6],[6,FY-.2]]){rod(at(a,b,y0),at(c,d,y1),.03,STL);rod(at(c,d,y0),at(a,b,y1),.03,STL)}}
 /* the cab: a floor, half-height walls, a band of windows, corner posts, a roof with an overhang */
 B(4.2,.25,4.2,tx,FY+.12,tz,STL);for(const s of[-1,1]){B(4,1.0,.12,tx,FY+.75,tz+s*1.94,CAB);B(.12,1.0,4,tx+s*1.94,FY+.75,tz,CAB)}
 for(const s of[-1,1]){B(3.7,.9,.04,tx,FY+1.7,tz+s*1.94,GL);B(.04,.9,3.7,tx+s*1.94,FY+1.7,tz,GL)}for(const[a,b]of C4)B(.14,1.9,.14,tx+a*1.95,FY+1.2,tz+b*1.95,STL);
 B(4.8,.2,4.8,tx,FY+2.3,tz,M(0x3a3e42));B(4.9,.08,4.9,tx,FY+2.18,tz,STL);
 /* the ladder up one leg face, a hatch in the floor */{const lz=tz+R0+.15;for(const s of[-1,1])rod([tx+s*.25,0,lz],[tx+s*.25,FY+.2,tz+R1+.15],.03,STL);for(let y=.35;y<FY;y+=.33){const r=R0+(R1-R0)*y/FY;C(.018,.018,.5,tx,y,tz+r+.15,STL,'x',null,6)}}
 /* the searchlight: a pivot on the roof edge, the lamp drum, the beam cone (as the game's) */
 const sx=tx,sy=FY+2.6,sz=tz;C(.15,.2,.3,sx,FY+2.55,sz,STL,null,null,10);const pv=new THREE.Group();pv.position.set(sx,sy+.2,sz);g.add(pv);
 {const yk=new THREE.Mesh(new THREE.TorusGeometry(.42,.04,6,16,Math.PI),STL);yk.rotation.y=Math.PI/2;pv.add(yk);const dr=new THREE.Mesh(new THREE.CylinderGeometry(.38,.42,.6,16),M(0x3a3a3e,{metalness:.5}));dr.position.y=-.1;pv.add(dr);const ln=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.03,16),M(0xfff4d0,{emissive:0xfff0c0,emissiveIntensity:1}));ln.position.y=-.41;pv.add(ln);
  const bm=new THREE.Mesh(new THREE.ConeGeometry(4,40,12,1,true),new THREE.MeshBasicMaterial({color:0xfff0c0,transparent:true,opacity:.14,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));bm.position.y=-20.4;pv.add(bm)}
 pv.rotation.x=Math.PI/2-.35;pv.traverse(m=>m.userData.dpKeep=1);
 obs.push({x0:tx-2.1,x1:tx+2.1,z0:tz-2.1,z1:tz+2.1});g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{pv,obs}}
