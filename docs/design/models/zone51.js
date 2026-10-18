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

/* ---- batch 2: Hangar 18 and the saucer ----
   zfHangar18(g)  at x -605..-555, z -1933..-1897 (centre (-580, -1915)), the door facing the apron (+z). An arched
                  steel hangar 50 wide, 36 deep, 16 high; a 20 x 12 door opening with two huge sliding leaves half open;
                  the apron in front (x -605..-555, z -1897..-1880). Inside: a sealed floor with a hatched landing
                  circle under the saucer, high-bay lights, a catwalk along the back wall with stairs, a bank of
                  consoles facing the saucer, lab benches, the SPECIMEN 13 tank, crates, cables, a gantry crane.
                  Returns {obs, saucer, beam, rim}: saucer is the Group the game hovers and turns (put it at
                  (-580, 6, -1915) as now), beam the light cone under it, rim the ring-light materials to pulse.
   zfSaucer()     the saucer on its own (built round its centre): a panelled lens hull, a rim band with lights,
                  a glowing dome, an underside ring and hatch. About 14 across. Returns {g, rim, dome}. */
function zfSaucer(){const k=zfKit(),M=k.M,g=new THREE.Group();
 /* a smooth, sleek lens: polished silver-grey with fine panel lines, a thin bright rim, a low tinted dome */
 /* not very metallic (the desert has no reflections, so high metalness reads as dark), one even silver, panel seams
    that run out from the middle and two rings, so it reads as a smooth plated hull */
 const hull=new THREE.MeshStandardMaterial({roughness:.5,metalness:.25,color:0xb4b8c0});hull.map=afCanvas(1024,256,(x,w,h)=>{x.fillStyle='#9ca2ac';x.fillRect(0,0,w,h);x.strokeStyle='rgba(50,56,70,.5)';x.lineWidth=1.5;for(let i=0;i<=32;i++){x.beginPath();x.moveTo(i*w/32,0);x.lineTo(i*w/32,h);x.stroke()}for(const y of[h*.35,h*.7]){x.beginPath();x.moveTo(0,y);x.lineTo(w,y);x.stroke()}x.fillStyle='rgba(255,255,255,.12)';for(let i=0;i<32;i+=2)x.fillRect(i*w/32+2,0,w/32-4,h)});
 /* the lathe faces outward only when its profile runs from the bottom up, so each list is reversed here */const prof=(pts)=>new THREE.LatheGeometry(pts.slice().reverse().map(p=>new THREE.Vector2(p[0],p[1])),64);
 g.add(new THREE.Mesh(prof([[0,1.25],[1.6,1.2],[3.2,1.0],[4.7,.7],[5.9,.38],[6.7,.12],[7,0]]),hull));
 {/* the underside a darker grey, so the beam light below doesn't wash it out */const und=hull.clone();und.color=new THREE.Color(0x8a909a);g.add(new THREE.Mesh(prof([[7,0],[6.7,-.12],[5.8,-.42],[4.4,-.72],[2.8,-.9],[1.22,-.95]]),und))}/* the underside stops at the hatch's rim, so the hatch opens onto the lit well */
 /* the rim: a thin dark groove with small lights set into it */const groove=new THREE.Mesh(new THREE.TorusGeometry(6.98,.06,8,96),M(0x1a1c24,{metalness:.5,roughness:.3}));groove.rotation.x=Math.PI/2;g.add(groove);
 const rim=[0x60ffb0,0x70b0ff,0xffffff].map(c=>M(c,{emissive:c,emissiveIntensity:1}));for(let i=0;i<36;i++){const a=i/36*Math.PI*2,l=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),rim[i%3]);l.position.set(Math.cos(a)*7.0,0,Math.sin(a)*7.0);g.add(l)}
 /* the dome: a low, tinted canopy on a slim collar */const col=new THREE.Mesh(new THREE.CylinderGeometry(2.05,2.15,.14,48),M(0x30343e,{metalness:.6,roughness:.25}));col.position.y=1.27;g.add(col);
 const dome=new THREE.MeshStandardMaterial({color:0x6ad8b0,emissive:0x1a6a50,emissiveIntensity:.6,transparent:true,opacity:.6,roughness:.05,metalness:.2,depthWrite:false});const dm=new THREE.Mesh(new THREE.SphereGeometry(2,48,16,0,Math.PI*2,0,Math.PI/2),dome);dm.scale.y=.55;dm.position.y=1.32;g.add(dm);
 {const st=new THREE.Mesh(new THREE.CylinderGeometry(.35,.4,.35,16),M(0x1a1c22));st.position.y=1.5;g.add(st)}
 /* underneath: a soft glowing ring, and the hatch: two half-discs that slide apart (hatch(u), u 0 shut .. 1 open);
    above them a glowing well, so when it opens you see light inside */
 const ur=new THREE.Mesh(new THREE.TorusGeometry(2.9,.07,8,64),M(0x80ffc0,{emissive:0x40ff90,emissiveIntensity:.8}));ur.rotation.x=Math.PI/2;ur.position.y=-.86;g.add(ur);
 const hr=new THREE.Mesh(new THREE.TorusGeometry(1.2,.05,6,32),M(0x1a1c24));hr.rotation.x=Math.PI/2;hr.position.y=-.95;g.add(hr);
 const well=new THREE.Mesh(new THREE.CylinderGeometry(1.18,1.18,.7,32,1,true),new THREE.MeshBasicMaterial({color:0xc8ffe8,side:THREE.BackSide}));well.position.y=-.6;g.add(well);const wtop=new THREE.Mesh(new THREE.CircleGeometry(1.18,32),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));wtop.rotation.x=Math.PI/2;wtop.position.y=-.26;g.add(wtop);
 /* an iris: six blades that turn and shrink into the rim */const HM=M(0x3a3e48,{metalness:.25,roughness:.4,side:THREE.DoubleSide}),blades=[];for(let i=0;i<6;i++){const piv=new THREE.Group();piv.position.y=-.955;piv.rotation.y=i*Math.PI/3;g.add(piv);const b=new THREE.Mesh(new THREE.CircleGeometry(1.19,8,0,Math.PI/3+.02),HM);b.rotation.x=Math.PI/2;piv.add(b);blades.push([piv,b])}
 const hatch=u=>{u=Math.min(1,Math.max(0,u));for(const[piv,b]of blades){b.scale.setScalar(Math.max(.001,1-u));piv.rotation.y=piv.userData.a0+u*.8}};blades.forEach(([piv],i)=>piv.userData.a0=i*Math.PI/3);
 g.traverse(m=>{if(m.isMesh){m.userData.noSeam=true;m.userData.dpKeep=1}});return{g,rim,dome,hatch}}

function zfHangar18(g){const k=zfKit(),{B,C,rod,L}=k.H(g),M=k.M,obs=[],hx=-580,hz=-1915,W=50,D=36,HW=8,RISE=8,z0=hz-D/2,z1=hz+D/2,DW=10,DH=12;
 const SK=afCorr(k,'#8a8e90',[1,10]),SKF=afCorr(k,'#9a9ea0',[12,1]),STL=M(0x4a4e54,{metalness:.5,roughness:.4}),YL=M(0xe8c020,{roughness:.6}),DK=M(0x26282b,{roughness:.6}),CON=M(0x9a948a,{roughness:.95});
 /* the shell, ribs, end walls (as the airfield hangar, bigger) */
 {const o=afArch(W,HW,RISE,32),i=afArch(W-.5,HW,RISE-.2,32);const sh=new THREE.Shape();sh.moveTo(-W/2,0);for(const p of o)sh.lineTo(p[0],p[1]);sh.lineTo(W/2,0);sh.lineTo(W/2-.25,0);for(const p of i.slice().reverse())sh.lineTo(p[0],p[1]);sh.lineTo(-W/2+.25,0);sh.lineTo(-W/2,0);
  const ge=new THREE.ExtrudeGeometry(sh,{depth:D,bevelEnabled:false});ge.translate(0,0,-D/2);{const uv=ge.attributes.uv;for(let j=0;j<uv.count;j++)uv.setXY(j,uv.getX(j)*.1,uv.getY(j)*.1)}const m=new THREE.Mesh(ge,SK);m.position.set(hx,0,hz);g.add(m);
  for(let z=z0;z<=z1+.01;z+=6){const rg=new THREE.Shape();rg.moveTo(-W/2-.15,0);for(const p of afArch(W+.3,HW,RISE+.15,32))rg.lineTo(p[0],p[1]);rg.lineTo(W/2+.15,0);rg.lineTo(W/2,0);for(const p of o.slice().reverse())rg.lineTo(p[0],p[1]);rg.lineTo(-W/2-.15,0);const re=new THREE.ExtrudeGeometry(rg,{depth:.25,bevelEnabled:false});re.translate(0,0,-.125);const rm=new THREE.Mesh(re,STL);rm.position.set(hx,0,Math.min(Math.max(z,z0+.13),z1-.13));g.add(rm)}}
 const prof=afArch(W-.5,HW,RISE-.2,32);
 {const sh=new THREE.Shape();sh.moveTo(-W/2+.25,0);for(const p of prof)sh.lineTo(p[0],p[1]);sh.lineTo(W/2-.25,0);sh.lineTo(-W/2+.25,0);const ge=new THREE.ShapeGeometry(sh);{const uv=ge.attributes.uv;for(let j=0;j<uv.count;j++)uv.setXY(j,uv.getX(j)*.1,uv.getY(j)*.1)}const m=new THREE.Mesh(ge,SKF);m.position.set(hx,0,z0+.2);g.add(m)}
 {const sh=new THREE.Shape();sh.moveTo(-W/2+.25,0);sh.lineTo(-DW,0);sh.lineTo(-DW,DH);sh.lineTo(DW,DH);sh.lineTo(DW,0);sh.lineTo(W/2-.25,0);for(const p of prof.slice().reverse())sh.lineTo(p[0],p[1]);sh.lineTo(-W/2+.25,0);const ge=new THREE.ExtrudeGeometry(sh,{depth:.2,bevelEnabled:false});{const uv=ge.attributes.uv;for(let j=0;j<uv.count;j++)uv.setXY(j,uv.getX(j)*.1,uv.getY(j)*.1)}const m=new THREE.Mesh(ge,SKF);m.position.set(hx,0,z1-.4);g.add(m)}
 /* the door: a header beam on outriggers, two great leaves on their track, half open (each covers half its side of the opening) */
 B(46,.6,1.2,hx,DH+.3,z1+.5,STL);for(const s of[-1,1]){C(.2,.2,DH+.6,hx+s*22.8,(DH+.6)/2,z1+.5,STL,null,null,10);B(.8,.1,.8,hx+s*22.8,.05,z1+.5,CON);obs.push({x0:hx+s*22.8-.35,x1:hx+s*22.8+.35,z0:z1+.15,z1:z1+.85})}
 for(const s of[-1,1]){const x=hx+s*(DW+.5),z=z1+.35+(s<0?0:.35);B(11,DH,.2,x,DH/2+.03,z,SKF);for(const y of[.15,DH/2,DH-.1])B(11.04,.2,.28,x,y,z,STL);for(const e of[-1,0,1])B(.2,DH,.28,x+e*5.4,DH/2+.03,z,STL);B(.12,1.2,.1,x-s*5.2,1.4,z+.2,YL);obs.push({x0:x-5.5,x1:x+5.5,z0:z-.2,z1:z+.2})}
 /* the name above the door *//* 14 x 2.2, its top corners under the arch (15.5 high at x ±7) */B(14,2.2,.15,hx,DH+2.0,z1-.15,M(0x2a2a3a));L('HANGAR 18',12.5,1.1,null,'#ffffff',90,hx,DH+2.4,z1-.07,0);L('DARK PROJECTS DIVISION',12.5,.5,null,'#ffd040',70,hx,DH+1.4,z1-.07,0);
 obs.push({x0:hx-W/2-.1,x1:hx-W/2+.4,z0,z1},{x0:hx+W/2-.4,x1:hx+W/2+.1,z0,z1},{x0:hx-W/2,x1:hx+W/2,z0:z0-.1,z1:z0+.4},{x0:hx-W/2,x1:hx-DW,z0:z1-.5,z1:z1},{x0:hx+DW,x1:hx+W/2,z0:z1-.5,z1:z1});
 /* the apron and the floor inside: a hatched landing circle under the saucer, a yellow walkway line */
 {const t=afCanvas(512,256,(x,w,h)=>{afTarmac(x,w,h,'#7a7a78',61);x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=2;for(let i=0;i<=w;i+=w/10){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke()}for(let i=0;i<=h;i+=h/3.4){x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke()}x.fillStyle='#e8c030';for(let i=0;i<10;i++){x.fillRect(w/2-60+i*13,h-20,6,20)}});afPlane(g,hx-W/2,hx+W/2,z1,z1+17,.04,t,-1)}
 {const PX=12,w=(W-.5)*PX,h=(D-.6)*PX;const t=afCanvas(w,h,(x)=>{afTarmac(x,w,h,'#5a5c60',71);x.strokeStyle='rgba(0,0,0,.3)';x.lineWidth=2;for(let i=0;i<=w;i+=6*PX){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke()}for(let i=0;i<=h;i+=6*PX){x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke()}
   const cx=w/2,cy=h/2;x.strokeStyle='#e8c030';x.lineWidth=PX*.5;x.beginPath();x.arc(cx,cy,9*PX,0,7);x.stroke();x.lineWidth=PX*.2;x.beginPath();x.arc(cx,cy,8*PX,0,7);x.stroke();x.save();x.beginPath();x.arc(cx,cy,8*PX,0,7);x.clip();x.strokeStyle='rgba(232,192,48,.35)';x.lineWidth=PX*.4;for(let i=-20*PX;i<20*PX;i+=PX*1.5){x.beginPath();x.moveTo(cx+i,cy-20*PX);x.lineTo(cx+i+20*PX,cy+20*PX);x.stroke()}x.restore();
   x.fillStyle='#e8c030';x.font='bold '+PX*1.6+'px Arial';x.textAlign='center';x.fillText('KEEP CLEAR · DO NOT STAND IN THE LIGHT',cx,cy+10.6*PX);x.fillRect(cx-.15*PX,cy+11.5*PX,.3*PX,h-(cy+11.5*PX))});afPlane(g,hx-W/2+.25,hx+W/2-.25,z0+.2,z1-.4,.06,t,-3)}
 /* lights: rows of high-bay lamps under the arch */{const R=(W*W/4+RISE*RISE)/(2*RISE),cy=HW+RISE-R,archY=d=>cy+Math.sqrt(R*R-d*d);/* lamps hang 1.6 under the roof wherever they are */for(let i=0;i<4;i++)for(const z of[hz-8,hz+8]){const x=hx-18+i*12,yy=archY(Math.abs(x-hx))-1.6;C(.01,.01,1.4,x,yy+.7,z,DK,null,null,4);const sh=new THREE.Mesh(new THREE.ConeGeometry(.6,.45,16,1,true),M(0x3a3e44,{side:THREE.DoubleSide,metalness:.4}));sh.position.set(x,yy,z);g.add(sh);const bl=new THREE.Mesh(new THREE.SphereGeometry(.2,10,6),M(0xd8e8ff,{emissive:0xc0d8ff}));bl.position.set(x,yy-.2,z);g.add(bl)}}
 /* the gantry crane rail along both side walls at 10 m, the bridge parked at the back with its hook *//* rails at 7.5 on brackets off the walls (the arch is 8.9 high there) */for(const s2 of[-1,1]){B(.4,.5,D-1,hx+s2*(W/2-1.6),7.5,hz,STL);for(let z=z0+2;z<z1;z+=6)B(1.2,.2,.2,hx+s2*(W/2-.9),7.3,z,STL)}{const bz=z0+3;B(W-3.2,.6,.6,hx,7.9,bz,YL);B(1.2,.8,1,hx+6,7.3,bz,DK);rod([hx+6,6.9,bz],[hx+6,4.5,bz],.02,DK);const hk=new THREE.Mesh(new THREE.TorusGeometry(.25,.07,6,12,Math.PI*1.4),STL);hk.position.set(hx+6,4.3,bz);g.add(hk)}
 /* the catwalk along the back wall at 6 m, rails, a stair down at the west end */{const cz=z0+1.4,y=6;B(30,.12,2,hx,y,cz,M(0x6a6e74,{metalness:.4}));rod([hx-15,y+1,cz+1],[hx+15,y+1,cz+1],.03,YL);for(let x=hx-15;x<=hx+15;x+=2.5){C(.025,.025,1,x,y+.5,cz+1,YL,null,null,6);rod([x,y-.06,cz+.9],[x,y-.06-1.2,z0+.25],.04,STL)}
  {const sx=hx-16.2,len=Math.hypot(6,7.5),st=B(1.2,.1,len,sx,y/2,cz+3.75-.75,M(0x6a6e74,{metalness:.4}));st.rotation.x=Math.atan2(y,7.5);/* low end at +z, up to the catwalk */for(let j=1;j<=30;j++){const u=(j-.5)/30;B(1.1,.05,.24,sx,u*y+.09,cz+6.75-u*7.5,M(0x8a8e94,{metalness:.3}))}/* treads */for(const e of[-.55,.55]){rod([sx+e,1,cz+6.75],[sx+e,y+1,cz-.75],.025,YL);for(let j=0;j<=6;j++){const u=j/6;const zz=cz+6.75-u*7.5,yb=u*y+.06;C(.018,.018,1-.03,sx+e,yb+.5,zz,YL,null,null,6)}}/* handrails on posts standing on the stair's edge */obs.push({x0:sx-.7,x1:sx+.7,z0:cz-1,z1:cz+7})}}
 /* the console bank on a raised dais, facing the saucer: desks with screens, chairs */{const dz=hz+11,x0=hx-8,x1=hx+8;B(x1-x0+2,.3,4,hx,.15,dz,M(0x3a3c42));obs.push({x0:x0-1,x1:x1+1,z0:dz-.8,z1:dz+.6});for(let i=0;i<5;i++){const x=x0+1.6+i*3.2;B(2.6,.9,.8,x,.75,dz-.4,M(0x2a2c32));const sc=B(.8,.5,.06,x-.6,1.55,dz-.68,M(0x60ffb0,{emissive:0x208050,emissiveIntensity:.8}));const sc2=B(.8,.5,.06,x+.4,1.55,dz-.68,M(0x60a0ff,{emissive:0x204080,emissiveIntensity:.8}));for(const s2 of[sc,sc2])s2.rotation.x=-.2;B(2.4,.03,.4,x,1.21,dz-.25,M(0x1a1a1e));
   const ch=new THREE.Group();ch.position.set(x,.3,dz+.5);g.add(ch);const{B:CB,C:CC}=k.H(ch);CC(.28,.28,.08,0,.5,0,M(0x1a1a1e),null,null,12);CC(.03,.03,.45,0,.25,0,STL,null,null,6);CB(.5,.55,.08,0,.85,.25,M(0x1a1a1e))}
  L('MISSION CONTROL · DO NOT PRESS ANYTHING',8,.4,'#1a1a1e','#ffd040',60,hx,1.45,dz-.82,Math.PI)}
 /* lab benches along the east wall: microscopes, jars, a laptop; a whiteboard with a drawing of the saucer */{const bx=hx+W/2-2.6;for(let i=0;i<3;i++){const z=hz-10+i*5;B(1.4,.9,3.6,bx,.45,z,M(0xd8dcde,{roughness:.5}));B(1.5,.05,3.7,bx,.92,z,M(0x2a2c32));obs.push({x0:bx-.75,x1:bx+.75,z0:z-1.85,z1:z+1.85});
   for(let j=0;j<4;j++){const jz=z-1.2+j*.8;C(.12,.12,.3,bx-.2,1.1,jz,M([0x60ffb0,0xd0a040,0x8a60c0,0x60a0ff][j],{emissive:[0x206040,0x403010,0x302050,0x203050][j],transparent:true,opacity:.75}),null,null,12);C(.13,.13,.05,bx-.2,1.27,jz,M(0x8a8e94,{metalness:.5}),null,null,12)}
   B(.3,.05,.3,bx+.3,.97,z+1.2,DK);C(.03,.03,.35,bx+.35,1.15,z+1.2,DK,null,null,6);C(.06,.06,.15,bx+.3,1.3,z+1.15,DK,null,null,8)}
  B(.08,1.6,3.2,hx+W/2-1.2,2.1,hz+9,M(0xf4f4f0));const wb=k.lab('',3,1.5,'#f4f4f0','#000',10);wb.material=new THREE.MeshBasicMaterial({map:afCanvas(256,128,(x,w,h)=>{x.fillStyle='#f4f4f0';x.fillRect(0,0,w,h);x.strokeStyle='#2a4aa0';x.lineWidth=2;x.beginPath();x.ellipse(100,70,60,14,0,0,7);x.stroke();x.beginPath();x.ellipse(100,60,22,16,0,Math.PI,0);x.stroke();x.fillStyle='#c02020';x.font='bold 16px Arial';x.fillText('?!',180,40);x.fillStyle='#2a4aa0';x.font='12px Arial';x.fillText('fuel: ???',170,80);x.fillText('engine: ???',170,96);x.fillText('pilot: SEE B13',170,112)})});wb.position.set(hx+W/2-1.25,2.1,hz+9);wb.rotation.y=-Math.PI/2;g.add(wb)}
 /* SPECIMEN 13: a tall glass tank of glowing green fluid on a steel base, with pipes; inside floats a small dark shape with two glowing eyes */
 {const tx=hx-12,tz=z0+5;C(1.4,1.5,.6,tx,.3,tz,STL,null,null,24);C(1.4,1.4,.3,tx,4.35,tz,STL,null,null,24);C(1.25,1.25,3.5,tx,2.35,tz,M(0x60ffb0,{emissive:0x208050,emissiveIntensity:.6,transparent:true,opacity:.45,depthWrite:false}),null,null,24);C(1.3,1.3,3.6,tx,2.35,tz,M(0xd8f0f0,{transparent:true,opacity:.15,roughness:.05,depthWrite:false}),null,null,24,true);
  {const sp=new THREE.Group();sp.position.set(tx,2.4,tz);g.add(sp);const bd=new THREE.Mesh(new THREE.SphereGeometry(.45,14,10),M(0x1a2a24,{roughness:.6}));bd.scale.y=1.3;sp.add(bd);for(const e of[-.15,.15]){const ey=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),M(0xffe060,{emissive:0xffd040}));ey.position.set(e,.15,.4);sp.add(ey)}for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const tt=new THREE.Mesh(new THREE.CylinderGeometry(.06,.02,.9,6),M(0x1a2a24));tt.position.set(Math.cos(a)*.25,-.75,Math.sin(a)*.25);tt.rotation.set(Math.sin(a)*.3,0,Math.cos(a)*.3);sp.add(tt)}sp.userData.dpKeep=1;sp.traverse(m=>m.userData.dpKeep=1)}
  for(const a of[0,2.1,4.2])rod([tx+Math.cos(a)*1.4,4.2,tz+Math.sin(a)*1.4],[tx+Math.cos(a)*3,8,tz+Math.sin(a)*.5-.5],.08,STL);obs.push({x0:tx-1.5,x1:tx+1.5,z0:tz-1.5,z1:tz+1.5});
  B(3,.8,.06,tx,1.6,tz+1.6,M(0x2a2a3a));L('SPECIMEN 13\nDO NOT TOUCH · DO NOT FEED · DO NOT ASK',2.9,.7,'#2a2a3a','#ffd040',44,tx,1.6,tz+1.64,0);B(.06,.6,.06,tx,.9,tz+1.6,STL)}
 /* crates and a sign on the back wall */for(let i=0;i<6;i++){const x=hx+6+(i%3)*2.4,z=z0+2+((i/3)|0)*2.2;B(2,1.6,2,x,.8+((i*5)%3==0&&i>2?1.6:0),z,M(0x5a6a4a,{roughness:.8}));L('DO NOT OPEN',1.6,.3,null,'#f0f0e0',60,x,1.2,z+1.01,0)}obs.push({x0:hx+4.8,x1:hx+12.4,z0:z0+.8,z1:z0+5.4});
 {const s=k.lab('THE DARK PROJECTS DIVISION\nDOES NOT EXIST',4,.8,'#2a2a3a','#ffffff',50);s.position.set(hx+14,3,z0+.32);g.add(s);B(4.1,.9,.04,hx+14,3,z0+.29,M(0x2a2a3a))}
 /* the saucer, its beam */const SC=zfSaucer();SC.g.position.set(hx,6,hz);g.add(SC.g);const beam=new THREE.Mesh(new THREE.ConeGeometry(3,6,24,1,true),new THREE.MeshBasicMaterial({color:0x80ffc0,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));beam.position.set(hx,3.1,hz);beam.userData.dpKeep=1;g.add(beam);
 obs.push({x0:hx-2,x1:hx+2,z0:hz-2,z1:hz+2});
 g.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{obs,saucer:SC.g,beam,rim:SC.rim,dome:SC.dome,hatch:SC.hatch}}
