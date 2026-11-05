/* =====================================================================================================
   SILO 1 (silo.md part 2). Needs fort-kit.js.
   SILO SPACE: every builder here works in a group placed at the shaft centre on the ground, world (578, 0, -700),
   not turned: x east, z the same way as the world (+z is north; the tunnel is north of the shaft), desert floor y 0.
   The tunnel level is y -14 (SLD.Y). Where things are in silo space (world = silo + (578, 0, -700)):
     elevator shaft  x -24.4..-18.4, z 5.4..12.4      tunnel  x -18.4..2, z 6.6..11.2 (centre line z 8.9)
     passage into the shaft  x -1.5..1.5, z 4.4..6.6  shaft  centre (0, 0), radius 4.7 inside (the surface tube's size)

   Batch 1: the freight elevator and the tunnel.
   slElevator(g)  -> {car, setY(y), setGates(w,e), tick(dt,moving), lamp}
       The shaft (cast concrete, pit with buffers, depth marks, caged lamps), the rack-and-pinion mast on its north wall
       (the bunker is only 4 m tall, so no cables or winch overhead), the top landing frame with its sign, and the car:
       diamond-plate deck, side rails, two folding gates (west = the bunker side, east = the tunnel), the drive unit on
       the car's north edge with two motors, the pinions on the rack, guide rollers, the control box, a lamp and an amber
       beacon. The car's origin is the middle of the shaft (x -21.4, z 8.9), deck top at the car's y: the game sets
       car.position.y (0 at the top, -14 at the bottom), or calls setY(y). setGates(w,e): 0 shut .. 1 folded open (the
       west gate opens at the top, the east one at the bottom, both shut while it moves). tick(dt,moving): the pinions
       turn and the beacon spins while it moves. lamp: where to put the car's point light (car space).
   slTunnel(g)    -> {door, lamps:[Vector3,...], blockers:[{x0,x1,z0,z1},...]}
       The arched concrete tunnel with ribs, the floor with a drain grating and walkway lines, three pipes with valves
       on the north wall, a cable tray on the south wall, caged lamps on the crown, BLAST DOOR 1 halfway (shown open),
       the passage south into the shaft at the east end, signs, an extinguisher, a phone, the power cabinet.
       door: the blast door's hinge group (rotation.y 0 = shut, -PI/2 = open, as built). lamps: the lamp positions
       (silo space); light about three of them. blockers: places you can't walk (silo space): the bulkhead either side
       of the doorway and the open door.
   ===================================================================================================== */
const SLD={Y:-14,R:4.7,E:{x0:-24.4,x1:-18.4,z0:5.4,z1:12.4,xc:-21.4,zc:8.9},T:{x0:-18.4,x1:2,zc:8.9,hw:2.3,sp:2.4,rise:1},
 P:{x0:-1.5,x1:1.5,z0:4.4,z1:6.6,h:2.4},BD:{x0:-8.7,x1:-7.7,hw:1,h:2.4},RIBS:[-14.9,-11.5,-4.7,-1.1],LAMPS:[-16.6,-13.2,-10,-6.2,-2.9,.6]};

function slKit(){if(slKit.k)return slKit.k;const f=fbKit(),k=Object.create(f);slKit.k=k;const M=f.M,tex=f.tex;
 let sd=24681;const r=()=>((sd=Math.imul(sd^sd>>>15,sd|1)+0x6d2b79f5|0)>>>0)/4294967296;k.r=r;
 const TM=(t,s,o)=>{const m=M(0xffffff,o);m.map=t;m.userData.s=s;return m};k.TM=TM;
 /* cast concrete: form-board lines, tie holes, drips. 2.4 m a tile */
 k.CON=TM(tex(256,256,(x,w,h)=>{x.fillStyle='#8c8d88';x.fillRect(0,0,w,h);for(let y=0;y<h;y+=32){const v=120+r()*22|0;x.fillStyle='rgba('+v+','+v+','+(v-4)+',.35)';x.fillRect(0,y,w,32);x.fillStyle='rgba(40,40,38,.4)';x.fillRect(0,y,w,1.5)}
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.fillStyle='rgba(30,30,28,.55)';x.beginPath();x.arc(32+i*64,16+j*64,3,0,7);x.fill()}
  for(let i=0;i<900;i++){x.fillStyle='rgba(50,50,46,'+(r()*.18)+')';x.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}
  for(let i=0;i<8;i++){const dx=r()*w,dy=r()*h*.6,L=40+r()*120,g=x.createLinearGradient(0,dy,0,dy+L);g.addColorStop(0,'rgba(60,55,45,.25)');g.addColorStop(1,'rgba(60,55,45,0)');x.fillStyle=g;x.fillRect(dx,dy,3+r()*5,L)}}),1/2.4,{roughness:.95});
 /* the floor: worn concrete, saw-cut joints every 2 m */
 k.FLR=TM(tex(256,256,(x,w,h)=>{x.fillStyle='#6c6d69';x.fillRect(0,0,w,h);for(let i=0;i<2500;i++){const v=80+r()*60|0;x.fillStyle='rgba('+v+','+v+','+v+','+(r()*.25)+')';x.fillRect(r()*w,r()*h,1+r()*2,1)}
  for(let i=0;i<6;i++){x.fillStyle='rgba(40,38,34,.12)';x.beginPath();x.ellipse(r()*w,r()*h,20+r()*40,10+r()*20,r()*3,0,7);x.fill()}x.fillStyle='rgba(30,30,30,.55)';x.fillRect(0,0,w,2);x.fillRect(0,0,2,h)}),1/2,{roughness:.9});
 /* diamond plate, 0.6 m a tile */
 k.DIA=TM(tex(128,128,(x,w,h)=>{x.fillStyle='#767a80';x.fillRect(0,0,w,h);for(let j=0;j<8;j++)for(let i=0;i<8;i++){x.save();x.translate(i*16+(j%2?8:0)+4,j*16+8);x.rotate(j%2?.6:-.6);x.fillStyle='#a8acb2';x.fillRect(-6,-1.6,12,3.2);x.fillStyle='#4a4e54';x.fillRect(-6,1.6,12,1);x.restore()}}),1/.6,{metalness:.6,roughness:.45});
 /* the rack's teeth, 8 cm apart, on a 0.64 m tile */
 k.RACK=TM(tex(16,128,(x,w,h)=>{x.fillStyle='#3a3c40';x.fillRect(0,0,w,h);for(let y=0;y<h;y+=16){x.fillStyle='#a8acb2';x.fillRect(0,y+2,w,7);x.fillStyle='#d0d4d8';x.fillRect(0,y+2,w,2)}}),1/.64,{metalness:.7,roughness:.35});
 /* drain grating: cut-out bars */
 k.GRT=new THREE.MeshStandardMaterial({map:tex(64,64,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='#8a8e94';for(let i=0;i<w;i+=8)x.fillRect(i,0,3,h);for(let j=0;j<h;j+=32)x.fillRect(0,j,w,3)}),alphaTest:.5,side:THREE.DoubleSide,metalness:.6,roughness:.45});
 k.RED=M(0xa81c18,{roughness:.5,metalness:.2});k.GRY=M(0x8a8e92,{roughness:.5,metalness:.3});k.YEL=M(0xe0b820,{roughness:.5,metalness:.2});
 k.OLV=M(0x56604a,{roughness:.55,metalness:.35});k.DOOR=M(0x646a62,{roughness:.5,metalness:.45});k.CAB=M(0x9aa0a4,{roughness:.45,metalness:.4});k.BLK=M(0x1c1d20,{roughness:.6,metalness:.3});
 k.GLOW=M(0xfff2d0,{emissive:0xffe6b0,emissiveIntensity:1.2});k.GRN=M(0x103010,{emissive:0x30ff50,emissiveIntensity:1});k.RDL=M(0x300808,{emissive:0xff2a1a,emissiveIntensity:.25});
 k.AMB=M(0xffa020,{emissive:0xff8a10,emissiveIntensity:1.2,transparent:true,opacity:.8});
 k.HZD=TM(f.HAZ.map,f.HAZ.userData.s,Object.assign({roughness:.6},f.PO));
 k.GT=tex(64,64,(x)=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64)});
 k.glow=(s,col)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:k.GT,color:col||0xffe0a0,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.setScalar(s);return sp};
 /* merging many small parts into one mesh: list of [geometry, matrix] */
 k.merge=(list,m)=>{let n=0;const gs=list.map(([ge,mx])=>{const g2=ge.index?ge.toNonIndexed():ge.clone();g2.applyMatrix4(mx);n+=g2.attributes.position.count;return g2});const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2);let o=0;
  for(const g2 of gs){P.set(g2.attributes.position.array,o*3);N.set(g2.attributes.normal.array,o*3);if(g2.attributes.uv)U.set(g2.attributes.uv.array,o*2);o+=g2.attributes.position.count}
  const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('normal',new THREE.BufferAttribute(N,3));G.setAttribute('uv',new THREE.BufferAttribute(U,2));return new THREE.Mesh(G,m)};
 k.rodL=(list,a,b,rad,seg)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),L=d.length();list.push([new THREE.CylinderGeometry(rad,rad,L,seg||6,1),new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(.5),new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()),new THREE.Vector3(1,1,1))])};
 k.boxL=(list,w,h,d,x,y,z,ry)=>{list.push([new THREE.BoxGeometry(w,h,d),new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,ry||0,0)),new THREE.Vector3(1,1,1))])};
 /* a shape in the (z, y) plane, given relative to (zc, Y), pushed east-to-west: the faces are at x = xE (faces east) and x = xE-depth (faces west) */
 k.ext=(sh,depth,xE,zc,Y,m)=>{const ge=new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:false,curveSegments:16});ge.rotateY(-Math.PI/2);ge.translate(xE,Y,zc);const s=(m.userData&&m.userData.s)||1,uv=ge.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*s,uv.getY(i)*s);const o=new THREE.Mesh(ge,m);o.userData.noSeam=true;return o};
 /* a caged bulkhead lamp; dir 'down' hangs from a ceiling, 'side' sits on a wall facing +z (turn the group) */
 k.cageLamp=(dir)=>{const G=new THREE.Group(),H=f.H(G);if(dir=='down'){H.C(.12,.12,.04,0,-.02,0,k.GRY,null,null,14);H.C(.06,.07,.06,0,-.07,0,k.BLK,null,null,10);const gl=new THREE.Mesh(new THREE.SphereGeometry(.09,14,10),k.GLOW);gl.position.y=-.16;G.add(gl);
   const T=new THREE.Mesh(new THREE.TorusGeometry(.11,.008,5,18),k.GRY);T.rotation.x=Math.PI/2;T.position.y=-.16;G.add(T);for(let i=0;i<4;i++){const a=i*Math.PI/2;H.rod([Math.cos(a)*.1,-.08,Math.sin(a)*.1],[Math.cos(a)*.03,-.27,Math.sin(a)*.03],.007,k.GRY,null,5)}const sp=k.glow(.9);sp.position.y=-.16;G.add(sp)}
  else{H.B(.2,.26,.04,0,0,.02,k.GRY);const gl=new THREE.Mesh(new THREE.SphereGeometry(.08,14,10,0,Math.PI*2,0,Math.PI/2),k.GLOW);gl.rotation.x=Math.PI/2;gl.position.z=.04;G.add(gl);for(const y of[-.06,0,.06])H.B(.18,.012,.012,0,y,.12,k.GRY);for(const x of[-.06,.06])H.B(.012,.2,.012,x,0,.128,k.GRY);const sp=k.glow(.8);sp.position.z=.1;G.add(sp)}
  return G};
 k.sign=(G,s,w,h,bg,fg,x,y,z,ry)=>{const m=f.lab(s,w,h,bg,fg,64);m.position.set(x,y,z);m.rotation.y=ry||0;G.add(m);return m};
 return k}

/* the tunnel's cross-section in (z, y) relative to (zc, Y): straight walls to 2.4 m, an arch to 3.4 m. d insets it */
function slProf(d){d=d||0;const T=SLD.T,hw=T.hw-d,R0=(T.hw*T.hw+T.rise*T.rise)/(2*T.rise),cy=T.sp+T.rise-R0,R=R0-d,ys=cy+Math.sqrt(R*R-hw*hw);
 const a0=Math.atan2(ys-cy,-hw),a1=Math.atan2(ys-cy,hw),N=18,arch=[];for(let i=0;i<=N;i++){const a=a0+(a1-a0)*i/N;arch.push({z:R*Math.cos(a),y:cy+R*Math.sin(a),nz:-Math.cos(a),ny:-Math.sin(a)})}
 return{hw,ys,polys:[[{z:-hw,y:0,nz:1,ny:0},{z:-hw,y:ys,nz:1,ny:0}],arch,[{z:hw,y:ys,nz:-1,ny:0},{z:hw,y:0,nz:-1,ny:0}]]}}
/* the outline as a closed list of points (counter-clockwise), for shapes */
function slOutline(d){const p=slProf(d),o=[new THREE.Vector2(-p.hw,0),new THREE.Vector2(p.hw,0)];for(let i=p.polys[1].length-1;i>=0;i--){const q=p.polys[1][i];o.push(new THREE.Vector2(q.z,q.y))}return o}
/* the lining: the profile pushed along x from x0 to x1, faces inwards. skip(i) leaves out polyline i (0 south wall, 1 arch, 2 north wall) */
function slSweep(prof,x0,x1,m,skip){const T=SLD.T,Y=SLD.Y,P=[],N=[],U=[],I=[],s=(m.userData&&m.userData.s)||.5;let u=0,base=0;
 prof.polys.forEach((pl,pi)=>{const lens=[0];for(let i=1;i<pl.length;i++)lens.push(lens[i-1]+Math.hypot(pl[i].z-pl[i-1].z,pl[i].y-pl[i-1].y));if(skip&&skip(pi)){u+=lens[lens.length-1];return}
  pl.forEach((p,i)=>{for(const x of[x0,x1]){P.push(x,Y+p.y,T.zc+p.z);N.push(0,p.ny,p.nz);U.push((u+lens[i])*s,x*s)}});for(let i=0;i<pl.length-1;i++){const a=base+i*2;I.push(a,a+1,a+2,a+1,a+3,a+2)}base+=pl.length*2;u+=lens[lens.length-1]});
 const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(P,3));ge.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));ge.setIndex(I);const o=new THREE.Mesh(ge,m);o.userData.noSeam=true;return o}

/* ---------------------------------------- the freight elevator ---------------------------------------- */
function slElevator(g){const k=slKit(),H=k.H(g),{B,C}=H,E=SLD.E,Y=SLD.Y,xc=E.xc,zc=E.zc,PIT=Y-1.2,TH=.3;
 /* the shaft walls: north, south and west are plain; the east wall has the tunnel's arch cut out at the bottom */
 B(E.x1-E.x0+2*TH,-PIT,TH,xc,PIT/2,E.z1+TH/2,k.CON);B(E.x1-E.x0+2*TH,-PIT,TH,xc,PIT/2,E.z0-TH/2,k.CON);B(TH,-PIT,E.z1-E.z0,E.x0-TH/2,PIT/2,zc,k.CON);
 {const T=SLD.T,sh=new THREE.Shape([new THREE.Vector2(E.z0-T.zc,PIT-Y),new THREE.Vector2(E.z1-T.zc,PIT-Y),new THREE.Vector2(E.z1-T.zc,-Y),new THREE.Vector2(E.z0-T.zc,-Y)]);sh.holes.push(new THREE.Path(slOutline(0)));g.add(k.ext(sh,TH,E.x1+TH,T.zc,Y,k.CON))}
 /* the pit: floor, two spring buffers, a ladder */B(E.x1-E.x0,.2,E.z1-E.z0,xc,PIT-.1,zc,k.FLR);
 for(const dz of[-2.2,1.2]){C(.22,.26,.12,xc,PIT+.06,zc+dz,k.YEL,null,null,14);C(.16,.16,.5,xc,PIT+.37,zc+dz,k.BLK,null,null,12);for(let i=0;i<5;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(.17,.025,6,16),k.GRY);t.rotation.x=Math.PI/2;t.position.set(xc,PIT+.18+i*.09,zc+dz);g.add(t)}C(.22,.22,.06,xc,PIT+.65,zc+dz,k.YEL,null,null,14)}
 {const L=[];for(const dz of[-.22,.22])k.rodL(L,[E.x0+.12,PIT,E.z0+1+dz],[E.x0+.12,Y-.1,E.z0+1+dz],.02);for(let y=PIT+.25;y<Y;y+=.3)k.rodL(L,[E.x0+.12,y,E.z0+.78],[E.x0+.12,y,E.z0+1.22],.015);g.add(k.merge(L,k.GRY))}
 /* depth marks every 3 m on the south wall, with a hazard band, and caged lamps on the west wall */
 for(const d of[3,6,9,12]){B(E.x1-E.x0,.12,.01,xc,-d-.25,E.z0+.006,k.HZD);k.sign(g,'−'+d+' m',.6,.3,null,'#e8e0c8',xc+1.6,-d+.05,E.z0+.012,0)}
 for(const y of[-4.5,-10.5]){const l=k.cageLamp('side');l.position.set(E.x0+.01,y,zc-1.6);l.rotation.y=Math.PI/2;g.add(l)}
 /* the mast: a 0.6 m lattice tower on the north wall from the pit to the top landing, tied to the wall every 3 m, the rack on its south face */
 const MX=xc,MZ0=E.z1-.75,MZ1=E.z1-.15,MT=3.85;{const L=[],cs=[[MX-.3,MZ0],[MX+.3,MZ0],[MX-.3,MZ1],[MX+.3,MZ1]];for(const[x,z]of cs)k.rodL(L,[x,PIT,z],[x,MT,z],.035,8);
  for(let y=PIT+.1,i=0;y<MT-.1;y+=.75,i++){for(const[a,b]of[[0,1],[2,3],[0,2],[1,3]]){k.rodL(L,[cs[a][0],y,cs[a][1]],[cs[b][0],y,cs[b][1]],.015);k.rodL(L,[cs[a][0],y,cs[a][1]],[cs[b][0],Math.min(MT,y+.75),cs[b][1]],.012)}}
  for(let y=PIT+1.5;y<0;y+=3){for(const dx of[-.3,.3])k.rodL(L,[MX+dx,y,MZ1],[MX+dx,y,E.z1-.03],.03);k.boxL(L,.9,.12,.04,MX,y,E.z1-.02)}g.add(k.merge(L,k.GRY))}
 {const rk=B(.09,MT-PIT,.06,MX,(MT+PIT)/2,MZ0-.065,k.RACK);B(.16,MT-PIT,.03,MX,(MT+PIT)/2,MZ0-.02,k.GRY);B(.75,.12,.75,MX,MT+.06,(MZ0+MZ1)/2,k.YEL)}
 /* the top landing frame at the bunker floor: yellow posts, a chain-link screen on the south and east sides, the header with the sign */
 for(const[x,z]of[[E.x0,E.z0],[E.x0,E.z1],[E.x1,E.z0],[E.x1,E.z1]])B(.18,3.9,.18,x,1.95,z,k.YEL);
 B(E.x1-E.x0,.16,.16,xc,3.8,E.z0,k.YEL);B(E.x1-E.x0,.16,.16,xc,3.8,E.z1,k.YEL);B(.16,.16,E.z1-E.z0,E.x1,3.8,zc,k.YEL);B(.16,.5,E.z1-E.z0,E.x0,3.5,zc,k.YEL);
 {const lk=new THREE.MeshStandardMaterial({map:k.LINK.map,alphaTest:.4,side:THREE.DoubleSide,metalness:.6,roughness:.5});
  const sc=(w,cx,cz,ry)=>{const ge=new THREE.PlaneGeometry(w,3.5),uv=ge.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/.6,uv.getY(i)*3.5/.6);const m=new THREE.Mesh(ge,lk);m.position.set(cx,1.9,cz);m.rotation.y=ry;g.add(m);B(ry?.05:w,.16,ry?w:.05,cx,.08,cz,k.YEL);B(ry?.05:w,.06,ry?w:.05,cx,3.66,cz,k.YEL)};
  sc(E.x1-E.x0-.18,xc,E.z0,0);sc(E.z1-E.z0-.18,E.x1,zc,Math.PI/2)}
 k.sign(g,'SILO 1 · FREIGHT ELEVATOR\nTUNNEL LEVEL −14 m',3.4,.64,'#e8c020','#1a1a1a',E.x0-.09,3.5,zc,-Math.PI/2);
 /* ---- the car ---- */
 const car=new THREE.Group();car.position.set(xc,0,zc);car.userData.dpKeep=1;g.add(car);const CH=k.H(car),CZ0=-3.4,CZ1=2.45,CW=2.9,czm=(CZ0+CZ1)/2,cd=CZ1-CZ0;
 CH.B(2*CW,.18,cd,0,-.09,czm,k.DIA);for(const z of[CZ0+.3,czm,CZ1-.3])CH.B(2*CW,.22,.14,0,-.295,z,k.OLV);for(const x of[-CW+.1,CW-.1])CH.B(.14,.2,cd,x,-.28,czm,k.OLV);
 for(const x of[-CW+.14,CW-.14])CH.B(.26,.008,cd-.1,x,.004,czm,k.HZD);
 /* side rails, south full length, north either side of the drive unit */
 {const L=[];const rail=(z,x0,x1)=>{for(let x=x0;x<=x1+.01;x+=(x1-x0)/Math.max(1,Math.round((x1-x0)/1.4)))k.boxL(L,.06,1.1,.06,x,.55,z);for(const y of[1.08,.55])k.boxL(L,x1-x0,.05,.05,(x0+x1)/2,y,z);k.boxL(L,x1-x0,.15,.02,(x0+x1)/2,.075,z)};
  rail(CZ0+.05,-CW+.05,CW-.05);rail(CZ1-.05,-CW+.05,-.75);rail(CZ1-.05,.75,CW-.05);car.add(k.merge(L,k.OLV))}
 {const lk=new THREE.MeshStandardMaterial({map:k.LINK.map,alphaTest:.4,side:THREE.DoubleSide,metalness:.6,roughness:.5});const pan=(w,x,z)=>{const ge=new THREE.PlaneGeometry(w,.88);const uv=ge.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/.6,uv.getY(i)*.88/.6);const m=new THREE.Mesh(ge,lk);m.position.set(x,.6,z);car.add(m)};
  pan(2*CW-.1,0,CZ0+.05);pan(CW-.8,(-CW-.75)/2,CZ1-.05);pan(CW-.8,(CW+.75)/2,CZ1-.05)}
 /* the drive unit on the north edge: housing, two motors with brakes, the pinions on the rack, guide rollers round the mast */
 CH.B(1.3,1.5,.55,0,.75,CZ1-.275,k.OLV);CH.B(1.34,.06,.59,0,1.5,CZ1-.275,k.BLK);for(const x of[-.3,.3]){CH.C(.15,.15,.42,x,1.74,CZ1-.3,k.GRY,null,null,16);CH.C(.16,.16,.06,x,1.97,CZ1-.3,k.BLK,null,null,16);CH.B(.22,.16,.2,x,1.62,CZ1-.08,k.BLK)}
 for(let i=0;i<6;i++)CH.B(.82,.02,.01,-.13,.35+i*.12,CZ1-.556,k.BLK);
 const PZc=MZ0-.095-.1-zc,pins=[];for(const y of[.45,1.15]){for(const dx of[-.085,.085])CH.B(.05,.14,PZc-CZ1+.04,dx,y,(CZ1+PZc+.04)/2,k.OLV);const p=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.08,16),M2(k));p.rotation.z=Math.PI/2;p.position.set(0,y,PZc);car.add(p);pins.push(p);CH.C(.03,.03,.25,0,y,PZc,k.GRY,'x',null,8)}
 for(const y of[.15,1.45])for(const dx of[-.37,.37]){CH.B(.06,.06,MZ0-zc+.12-CZ1,dx*1.13,y,(CZ1+MZ0-zc+.12)/2,k.OLV);CH.C(.035,.035,.075,dx,y,MZ0-zc+.05,k.BLK,null,null,10)}
 /* the control box, the lamp, the beacon */
 CH.B(.3,.38,.1,.48,1.05,CZ1-.6,k.YEL);for(const[dy,mm]of[[.08,k.GRN],[-.02,k.RDL]])CH.C(.035,.035,.03,.48,1.05+dy,CZ1-.66,mm,'z',null,10);CH.C(.05,.04,.04,.48,.92,CZ1-.67,k.RED,'z',null,12);
 {const t=k.sign(car,'LIFT',.26,.06,'#1a1a1a','#e8c020',.48,1.27,CZ1-.656,Math.PI)}
 k.sign(car,'DRIVE UNIT · KEEP CLEAR',1.1,.16,'#e8c020','#1a1a1a',0,1.38,CZ1-.557,Math.PI);
 {const l=k.cageLamp('side');l.position.set(-.4,1.2,CZ1-.55);l.rotation.y=Math.PI;car.add(l)}
 CH.C(.035,.035,.47,0,1.765,CZ1-.3,k.GRY,null,null,10);CH.C(.06,.08,.02,0,1.54,CZ1-.3,k.GRY,null,null,12);CH.C(.1,.12,.08,0,2.03,CZ1-.3,k.BLK,null,null,14);const dome=new THREE.Mesh(new THREE.SphereGeometry(.11,16,10,0,Math.PI*2,0,Math.PI/2),k.AMB);dome.position.set(0,2.07,CZ1-.3);car.add(dome);
 const bcn=new THREE.Group();bcn.position.set(0,2.12,CZ1-.3);car.add(bcn);{const rf=new THREE.Mesh(new THREE.BoxGeometry(.14,.06,.02),k.GLOW);rf.position.z=.03;bcn.add(rf);const sp=k.glow(.7,0xffa040);sp.position.set(0,0,.1);bcn.add(sp);bcn.userData.sp=sp}
 /* the two folding gates: flat slats on a top track, crossed bars between them, folding up against the north end */
 const gates=[];for(const sx of[-1,1]){const x=sx*(CW-.03);for(const z of[CZ0+.05,CZ1-.05])CH.B(.08,2.2,.08,x,1.1,z,k.YEL);CH.B(.08,.08,cd-.1,x,2.18,czm,k.YEL);
  const G={x,sl:[],xs:[]};const n=14;for(let i=0;i<n;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(.03,1.96,.05),k.GRY);s.position.set(x,1.08,0);car.add(s);G.sl.push(s)}
  for(let i=0;i<n-1;i++)for(let h=0;h<2;h++)for(let c=0;c<2;c++){const r=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,1,5),k.GRY);r.position.x=x;car.add(r);G.xs.push({r,i,h,c})}gates.push(G)}
 const setGate=(G,u)=>{const n=G.sl.length,z1=CZ1-.12,span=(z1-(CZ0+.12)),sp=span/(n-1)+(.055-span/(n-1))*u;G.sl.forEach((s,i)=>{s.position.z=z1-i*sp});
  for(const o of G.xs){const za=z1-o.i*sp,zb=za-sp,ya=.12+o.h*.95,yb=ya+.95,a=[o.c?ya:yb,o.c?yb:ya],dz=zb-za,dy=a[1]-a[0],L=Math.hypot(dz,dy);o.r.scale.set(1,L,1);o.r.position.set(G.x,(a[0]+a[1])/2,(za+zb)/2);o.r.rotation.set(Math.atan2(dz,dy),0,0)}};
 const setGates=(w,e)=>{setGate(gates[0],w);setGate(gates[1],e)};setGates(1,0);
 car.traverse(o=>{if(o.isMesh){o.userData.noSeam=true;o.userData.dpKeep=1}});
 let spin=0;const tick=(dt,moving)=>{if(moving){spin+=dt;pins.forEach(p=>p.rotation.x=spin*8);bcn.rotation.y+=dt*7;bcn.userData.sp.material.opacity=.5+.5*Math.max(0,Math.cos(bcn.rotation.y))}else bcn.userData.sp.material.opacity=0;dome.material.emissiveIntensity=moving?1.6:.3};tick(0,false);
 g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});
 return{car,setY:y=>{car.position.y=y},setGates,tick,lamp:new THREE.Vector3(0,2.6,0)}}
function M2(k){return k.M(0x9aa0a6,{metalness:.75,roughness:.3})}

/* ---------------------------------------- the tunnel ---------------------------------------- */
function slTunnel(g){const k=slKit(),H=k.H(g),{B,C}=H,T=SLD.T,Y=SLD.Y,zc=T.zc,ZS=zc-T.hw,ZN=zc+T.hw,PS=SLD.P,BD=SLD.BD,X0=T.x0+.3,X1=T.x1;
 const prof=slProf(0);
 /* the lining: the south wall leaves the passage open; the arch and the north wall run the whole way */
 g.add(slSweep(prof,X0,X1,k.CON,i=>i==0));g.add(slSweep({polys:[prof.polys[0]]},X0,PS.x0,k.CON));g.add(slSweep({polys:[prof.polys[0]]},PS.x1,X1,k.CON));
 /* concrete ribs every few metres, and the end wall */
 for(const x of SLD.RIBS){if(x>PS.x0-.5&&x<PS.x1+.1)continue;const out=slOutline(0),inn=slOutline(.12),s2=new THREE.Shape();s2.moveTo(-T.hw,0);for(let i=out.length-1;i>=2;i--)s2.lineTo(out[i].x,out[i].y);s2.lineTo(T.hw,0);s2.lineTo(T.hw-.12,0);for(let i=2;i<inn.length;i++)s2.lineTo(inn[i].x,inn[i].y);s2.lineTo(-T.hw+.12,0);s2.lineTo(-T.hw,0);
g.add(k.ext(s2,.4,x+.4,zc,Y,k.CON))}
 g.add(k.ext(new THREE.Shape(slOutline(0)),.3,X1+.3,zc,Y,k.CON));
 /* the floor: a slab, a drain channel along the north wall with a grating, two yellow walkway lines */
 const DZ0=ZN-.6,DZ1=ZN-.2;B(X1-X0,.3,DZ0-ZS,(X0+X1)/2,Y-.15,(ZS+DZ0)/2,k.FLR);B(X1-X0,.3,ZN-DZ1,(X0+X1)/2,Y-.15,(DZ1+ZN)/2,k.FLR);B(X1-X0,.12,DZ1-DZ0,(X0+X1)/2,Y-.24,(DZ0+DZ1)/2,k.BLK);
 {const ge=new THREE.PlaneGeometry(X1-X0,DZ1-DZ0),uv=ge.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*(X1-X0)/.3,uv.getY(i)*(DZ1-DZ0)/.3);const gr=new THREE.Mesh(ge,k.GRT);gr.rotation.x=-Math.PI/2;gr.position.set((X0+X1)/2,Y-.025,(DZ0+DZ1)/2);g.add(gr);for(const z of[DZ0+.012,DZ1-.012])B(X1-X0,.025,.024,(X0+X1)/2,Y-.0125,z,k.GRY)}
 for(const z of[ZS+.45,zc+.85])B(X1-X0-.3,.004,.08,(X0+X1)/2,Y+.002,z,k.LINEY);
 B(.2,.012,T.hw*2-.1,T.x0+.1,Y+.006,zc,k.HZD);
 /* the passage south into the shaft: floor, walls, ceiling, a steel portal, hazard stripes at the threshold */
 B(PS.x1-PS.x0,.3,PS.z1-PS.z0,0,Y-.15,(PS.z0+PS.z1)/2,k.FLR);for(const s of[-1,1])B(.25,PS.h,PS.z1-PS.z0-.02,s*(PS.x1+.125),Y+PS.h/2,(PS.z0+PS.z1)/2-.01,k.CON);
 B(PS.x1-PS.x0+.5,.25,PS.z1-PS.z0,0,Y+PS.h+.125,(PS.z0+PS.z1)/2,k.CON);
 for(const s of[-1,1])B(.12,PS.h-.16,.1,s*(PS.x1+.06),Y+(PS.h-.16)/2,PS.z1+.05,k.YEL);B(PS.x1-PS.x0+.24,.16,.1,0,Y+PS.h-.08,PS.z1+.05,k.YEL);
 B(PS.x1-PS.x0,.008,.3,0,Y+.004,PS.z1-.15,k.HZD);for(const s of[-1,1]){const l=k.cageLamp('side');l.position.set(s*(PS.x1+.0),Y+1.9,PS.z0+.9);l.rotation.y=-s*Math.PI/2;l.position.x=s*PS.x1-s*.0;g.add(l)}
 k.sign(g,'SILO 1 · CATWALK',1.4,.13,'#1a1a1a','#e8c020',0,Y+PS.h-.08,PS.z1+.106,0);
 /* the pipes on the north wall: fuel (red), air (grey), oxidizer (yellow), on struts, with flanges, two valves and labels */
 const PZ=ZN-.2,pipes=[[k.RED,2.02,.07,'FUEL'],[k.GRY,1.76,.06,'AIR'],[k.YEL,1.5,.07,'OXIDIZER']],PX0=T.x0+.75,PX1=X1;
 const clear=x=>!SLD.RIBS.some(r=>x>r-.25&&x<r+.65)&&!(x>BD.x0-.3&&x<BD.x1+.3);
 for(const[m,y,r]of pipes){C(r,r,PX1-PX0,(PX0+PX1)/2,Y+y,PZ,m,'x',null,14);for(let x=PX0+2;x<PX1-.5;x+=4)if(clear(x))C(r+.035,r+.035,.06,x,Y+y,PZ,m,'x',null,14);C(r+.05,r+.05,.03,PX0+.02,Y+y,PZ,k.GRY,'x',null,14)}
 B(.5,.75,.3,PX0-.25,Y+1.76,ZN-.15,k.CAB);k.sign(g,'MANIFOLD 1',.4,.1,'#1a1a1a','#e8e0c8',PX0-.25,Y+2.05,ZN-.306,Math.PI);
 {const L=[];for(let x=PX0+1;x<PX1-.4;x+=2){if(!clear(x))continue;k.boxL(L,.05,.86,.05,x,Y+1.76,ZN-.03);for(const[,y,r]of pipes){k.boxL(L,.03,.03,.24,x,Y+y+r+.015,ZN-.13);k.boxL(L,.03,.03,.24,x,Y+y-r-.015,ZN-.13)}}g.add(k.merge(L,k.GRY))}
 for(const x of SLD.RIBS)if(x<PS.x0-.5||x>PS.x1+.1)for(const[,y,r]of pipes)C(r+.03,r+.03,.44,x+.2,Y+y,PZ,k.GRY,'x',null,12);
 for(const[m,y,r]of pipes)for(const x of[BD.x0-.02,BD.x1+.02])C(r+.04,r+.04,.05,x,Y+y,PZ,k.GRY,'x',null,12);
 const valve=(x,y,r,m)=>{B(.22,r*2+.08,r*2+.08,x,Y+y,PZ,m);C(.025,.025,.2,x,Y+y,PZ-r-.1,k.GRY,'z',null,8);const w=new THREE.Mesh(new THREE.TorusGeometry(.13,.014,6,20),k.RED);w.position.set(x,Y+y,PZ-r-.2);g.add(w);for(let i=0;i<4;i++){const a=i*Math.PI/4;H.rod([x,Y+y,PZ-r-.2],[x+Math.cos(a)*.13,Y+y+Math.sin(a)*.13,PZ-r-.2],.008,k.RED,null,5);H.rod([x,Y+y,PZ-r-.2],[x-Math.cos(a)*.13,Y+y-Math.sin(a)*.13,PZ-r-.2],.008,k.RED,null,5)}};
 valve(-13.6,2.02,.07,k.RED);valve(-3.4,1.5,.07,k.YEL);valve(-9.6,1.76,.06,k.GRY);
 for(const[m,y,r,t]of pipes)for(const x of[-15.8,-6.6]){const bg=t=='FUEL'?'#a81c18':t=='AIR'?'#8a8e92':'#e0b820',fg=t=='OXIDIZER'?'#1a1a1a':'#f0ece0';k.sign(g,'◀  '+t,.5,r*1.5,bg,fg,x,Y+y,PZ-r-.004,Math.PI)}
 /* the cable tray on the south wall, from the elevator to a junction box short of the passage */
 const TY=Y+2.12,TZ0=ZS+.15,TZ1=ZS+.55,TX0=T.x0+.5,TX1=PS.x0-.9;{const L=[];for(const z of[TZ0,TZ1])k.boxL(L,TX1-TX0,.07,.025,(TX0+TX1)/2,TY,z);for(let x=TX0+.15;x<TX1;x+=.3)k.boxL(L,.025,.02,TZ1-TZ0,x,TY-.025,(TZ0+TZ1)/2);
  for(let x=TX0+.6;x<TX1;x+=1.5){if(!clear(x))continue;k.boxL(L,.04,.04,TZ1-ZS+.02,x,TY-.055,(ZS+TZ1)/2)}g.add(k.merge(L,k.GRY))}
 {const L=[];[[.03,.22],[.024,.29],[.035,.36],[.02,.43],[.028,.5]].forEach(([r,dz],i)=>{k.rodL(L,[TX0,TY-.015+r,ZS+dz],[TX1+.05,TY-.015+r,ZS+dz],r,8)});g.add(k.merge(L,k.BLK))}
 B(.55,.65,.22,TX1+.4,TY-.3,ZS+.11,k.CAB);k.sign(g,'JB-4',.3,.1,'#1a1a1a','#e8e0c8',TX1+.4,TY-.12,ZS+.227,0);for(const x of SLD.RIBS)if(x<TX1)B(.44,.14,TZ1-TZ0+.06,x+.2,TY-.01,(TZ0+TZ1)/2,k.GRY);B(.08,.16,TZ1-TZ0+.06,BD.x0-.04,TY-.01,(TZ0+TZ1)/2,k.GRY);B(.08,.16,TZ1-TZ0+.06,BD.x1+.04,TY-.01,(TZ0+TZ1)/2,k.GRY);
 /* the lamps on the crown, joined by a conduit */
 const lamps=[];for(const x of SLD.LAMPS){const l=k.cageLamp('down');l.position.set(x,Y+3.4,zc);g.add(l);lamps.push(new THREE.Vector3(x,Y+3.05,zc))}
 C(.02,.02,X1-X0,(X0+X1)/2,Y+3.385,zc+.18,k.GRY,'x',null,6);
 /* BLAST DOOR 1: a concrete bulkhead with a steel frame, the door open against the north side, a wheel each side, lamps */
 {const b=slOutline(0),hw=BD.hw,sh=new THREE.Shape();sh.moveTo(-T.hw,0);sh.lineTo(-hw,0);sh.lineTo(-hw,BD.h);sh.lineTo(hw,BD.h);sh.lineTo(hw,0);sh.lineTo(T.hw,0);for(let i=2;i<b.length;i++)sh.lineTo(b[i].x,b[i].y);sh.lineTo(-T.hw,0);g.add(k.ext(sh,BD.x1-BD.x0,BD.x1,zc,Y,k.CON))}
 for(const x of[BD.x0-.04,BD.x1+.04]){for(const s of[-1,1])B(.08,BD.h,.14,x,Y+BD.h/2,zc+s*(BD.hw+.07),k.DOOR);B(.08,.14,2*BD.hw+.28,x,Y+BD.h+.07,zc,k.DOOR)}
 B(BD.x1-BD.x0,.04,2*BD.hw,(BD.x0+BD.x1)/2,Y+.02,zc,k.GRY);
 for(const[x,ry]of[[BD.x0-.012,-Math.PI/2],[BD.x1+.012,Math.PI/2]]){k.sign(g,'BLAST DOOR 1',1.5,.26,'#e8c020','#1a1a1a',x,Y+2.85,zc,ry);for(const[dz,m]of[[-1.35,k.RDL],[1.35,k.GRN]]){const bx=new THREE.Mesh(new THREE.BoxGeometry(.06,.14,.14),k.BLK);bx.position.set(x+(ry>0?.018:-.018),Y+2.6,zc+dz);g.add(bx);const lm=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),m);lm.position.set(x+(ry>0?.06:-.06),Y+2.6,zc+dz);g.add(lm)}}
 const DH=2.5,DW=2.2,DT=.5,door=new THREE.Group();door.position.set(BD.x1+.08,Y,zc+BD.hw+.12);door.userData.dpKeep=1;g.add(door);
 {const sh=new THREE.Shape(),rr=.12,x0=-DW,x1=0,y0=.03,y1=.03+DH;sh.moveTo(x0+rr,y0);sh.lineTo(x1-rr,y0);sh.quadraticCurveTo(x1,y0,x1,y0+rr);sh.lineTo(x1,y1-rr);sh.quadraticCurveTo(x1,y1,x1-rr,y1);sh.lineTo(x0+rr,y1);sh.quadraticCurveTo(x0,y1,x0,y1-rr);sh.lineTo(x0,y0+rr);sh.quadraticCurveTo(x0,y0,x0+rr,y0);
  const ge=new THREE.ExtrudeGeometry(sh,{depth:DT,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:2,curveSegments:6});ge.rotateY(-Math.PI/2);ge.translate(DT,0,0);const dm=new THREE.Mesh(ge,k.DOOR);door.add(dm);
  const DHd=k.H(door);for(const fx of[-.035,DT+.035]){const sx=fx<0?-1:1;const hub=DHd.C(.06,.06,.12,fx+sx*.04,1.3,-DW/2,k.GRY,'x',null,12);const w=new THREE.Mesh(new THREE.TorusGeometry(.32,.025,8,28),k.RED);w.rotation.y=Math.PI/2;w.position.set(fx+sx*.1,1.3,-DW/2);door.add(w);for(let i=0;i<6;i++){const a=i*Math.PI/3;DHd.rod([fx+sx*.1,1.3,-DW/2],[fx+sx*.1,1.3+Math.sin(a)*.32,-DW/2+Math.cos(a)*.32],.014,k.RED,null,6)}
   for(const y of[.5,1.3,2.1])DHd.B(.05,.12,.3,fx+sx*.01,y,-DW+.2,k.GRY);k.sign(door,'BLAST DOOR 1',1.2,.2,null,'#e8e0c8',fx+sx*.006,2.15,-DW/2,sx>0?Math.PI/2:-Math.PI/2);k.sign(door,'KEEP SHUT DURING\nLAUNCH',.9,.22,null,'#e8c020',fx+sx*.006,1.85,-DW/2,sx>0?Math.PI/2:-Math.PI/2)}
  DHd.B(DT,DH-.1,.006,DT/2,.03+DH/2,-DW-.034,k.HZD)}
 for(const y of[.45,1.3,2.15]){C(.08,.08,.36,BD.x1+.08,Y+y,zc+BD.hw+.12,k.GRY,null,null,12);B(.16,.3,.1,BD.x1+.04,Y+y,zc+BD.hw+.12,k.GRY)}
 door.rotation.y=-Math.PI/2;
 {const fx0=BD.x1+.1,fx1=BD.x1+.08+DW+.15,fz0=zc+BD.hw+.06,fz1=fz0+DT+.1;for(const z of[fz0,fz1])B(fx1-fx0,.004,.06,(fx0+fx1)/2,Y+.002,z,k.LINEY);B(.06,.004,fz1-fz0,fx1,Y+.002,(fz0+fz1)/2,k.LINEY)}
 /* dressing: signs, an extinguisher, a phone, the power cabinet at the east end */
 k.sign(g,'SILO 1  ➜',1.0,.26,'#1a1a1a','#e8c020',PS.x0-1.4,Y+1.55,ZS+.012,0);
 k.sign(g,'LEVEL −14 m · SILO 1 TUNNEL',1.8,.24,'#e8c020','#1a1a1a',T.x0+2.6,Y+1.55,ZS+.012,0);
 k.sign(g,'NO SMOKING\nNO NAKED FLAMES',.8,.36,'#b01818','#f0ece0',-15.8,Y+1.0,ZN-.012,Math.PI);
 k.sign(g,'⚠ OXIDIZER\nCORROSIVE',.7,.32,'#e0b820','#1a1a1a',-3.4,Y+.95,ZN-.012,Math.PI);
 {const x=-12.6;B(.14,.08,.12,x,Y+.95,ZS+.06,k.GRY);C(.08,.08,.5,x,Y+.68,ZS+.16,k.RED,null,null,14);C(.05,.08,.08,x,Y+.97,ZS+.16,k.RED,null,null,12);C(.025,.025,.06,x,Y+1.03,ZS+.16,k.BLK,null,null,8);k.sign(g,'FIRE',.3,.12,'#b01818','#f0ece0',x,Y+1.3,ZS+.012,0)}
 {const x=-6.4;B(.36,.5,.16,x,Y+1.35,ZS+.08,k.YEL);B(.08,.24,.06,x-.08,Y+1.38,ZS+.19,k.BLK);C(.008,.008,.3,x+.06,Y+1.2,ZS+.19,k.BLK,null,null,5);k.sign(g,'EMERGENCY PHONE',.5,.08,'#1a1a1a','#e8c020',x,Y+1.68,ZS+.012,0)}
 {const z=zc+.6;B(.4,1.9,1.3,X1-.2,Y+.95,z,k.CAB);for(let i=0;i<3;i++){const lm=new THREE.Mesh(new THREE.SphereGeometry(.03,8,6),i?k.GRN:k.RDL);lm.position.set(X1-.41,Y+1.6,z-.3+i*.15);g.add(lm)}B(.02,.04,.2,X1-.41,Y+1.0,z+.45,k.BLK);k.sign(g,'SILO 1 · POWER',.8,.14,'#1a1a1a','#e8e0c8',X1-.407,Y+1.75,z,-Math.PI/2);
  for(const[,y,r]of pipes)C(r+.05,r+.05,.04,X1-.026,Y+y,PZ,k.GRY,'x',null,14)}
 g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});
 return{door,lamps,blockers:[{x0:BD.x0,x1:BD.x1,z0:ZS,z1:zc-BD.hw},{x0:BD.x0,x1:BD.x1,z0:zc+BD.hw,z1:ZN},{x0:BD.x1,x1:BD.x1+DW+.3,z0:zc+BD.hw,z1:ZN}]}}
