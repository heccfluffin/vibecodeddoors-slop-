/* =====================================================================================================
   OLD QUARRY batch 2: the rim. Needs fort-kit.js and quarry-yard.js (qmKit, qmPad). Desert-local x/z, ground y 0.

     qmCrusher(g, cx, cz)   the primary crusher at CR (cx, cz) and its conveyor to the stockpile, same spots as now:
                            a steel crusher house on a concrete plinth with a dump hopper on top (the truck tips into it),
                            the jaw, two flywheels, a motor and V-belt guard, a walkway with a rail and a ladder; the
                            conveyor (P0 → P1 as now) on lattice trestles with a walkway, skirting and a head pulley
                            hood; the gravel stockpile. Returns {btx, fws, jaw, cv, L, rocks, obs, tick}: the same hooks
                            as dx581 (belt texture scrolls, flywheels turn on x, jaw moves on y, rocks ride along cv's z),
                            plus tick(dt): call it every frame to drop rocks out of the spout and roll them down the pile.
     qmOffice(g)            the walk-in site office, x -134..-122, z -1496..-1485, door in the north wall: a prefab
                            cabin on piers with a porch and steps, windows, a sign; inside a floor, a desk run along the
                            west wall for the tycoon computer (which stays where the game puts it, -130.4,-1487.6), a
                            filing cabinet, a site map, a hard-hat rack, a water cooler, a ceiling light.
                            Returns {obs, plate} (the walls with a 1.4 m door gap; the floor plate at y 0.6).
     qmFlood(g, x, z, aimX, aimZ)   a 14 m lattice floodlight tower with a caged ladder and four lamps aimed at a point.
     qmEntrance(g, x, z, ry)  the OLD QUARRY entrance board on two posts with the company name and a haul-road arrow.
   ===================================================================================================== */
function qmCrusher(g,cx,cz){const k=qmKit(),{B,C,rod,slab,L,tube}=k.H(g),M=k.M;const GR=M(0x5a6a5a,{metalness:.45,roughness:.5}),obs=[];
 /* plinth and the crusher house: 6 x 5, 4 m high, ribbed panels, a dump hopper on top (rim at 6.9 as now) */
 B(7.4,.4,6.4,cx,.2,cz,k.PLINTH);B(6,3.6,5,cx,2.2,cz,GR);for(let i=-2;i<=2;i++){B(.12,3.6,.08,cx+i*1.4,2.2,cz+2.54,k.STEEL);B(.12,3.6,.08,cx+i*1.4,2.2,cz-2.54,k.STEEL)}B(6.2,.2,5.2,cx,4.08,cz,k.CAST);
 const hp=new THREE.Mesh(new THREE.CylinderGeometry(3.3,1.5,2.7,4,1,true),M(0x6a7078,{metalness:.5,roughness:.45,side:THREE.DoubleSide}));hp.rotation.y=Math.PI/4;hp.position.set(cx,5.55,cz);g.add(hp);
 {const rim=new THREE.Mesh(new THREE.CylinderGeometry(3.36,3.36,.2,4,1,true),k.YEL);rim.rotation.y=Math.PI/4;rim.position.set(cx,6.9,cz);g.add(rim)}for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])rod([cx+a*2.2,4.2,cz+b*1.8],[cx+a*2.2,6.8,cz+b*1.8],.08,k.YEL);
 /* the jaw (moves), two flywheels on a shaft (turn), a motor and a belt guard */
 const jaw=new THREE.Mesh(new THREE.BoxGeometry(5.6,.5,.4),k.CAST);jaw.position.set(cx,4.2,cz+1.6);g.add(jaw);
 const fws=[];C(.16,.16,7,cx,2.2,cz+.8,k.STL2,'x',null,10);for(const sd of[-1,1]){const fw=new THREE.Group();fw.position.set(cx+sd*3.25,2.2,cz+.8);g.add(fw);const h=k.H(fw);const tr=new THREE.Mesh(new THREE.TorusGeometry(1.1,.16,10,28),k.CAST);tr.rotation.y=Math.PI/2;fw.add(tr);
  for(let i=0;i<6;i++){const sp=new THREE.Mesh(new THREE.BoxGeometry(.1,2.1,.14),k.CAST);sp.rotation.x=i*Math.PI/6;fw.add(sp)}h.C(.25,.25,.4,0,0,0,k.STL2,'x',null,14);fws.push(fw);B(.5,1.4,.6,cx+sd*3.25,.75,cz+.8,k.CAST)}
 B(1.6,1.1,1.2,cx-3.9,.95,cz-1.6,M(0x2a5a8a,{metalness:.5}));C(.32,.32,.6,cx-3.9,1.1,cz-2.5,k.STL2,'z',null,12);B(.25,1.8,.9,cx-3.4,1.6,cz-1.6,k.YEL);
 /* walkway round three sides at 4.2 m with a rail, a ladder up the east side */
 for(const[w,d,x,z]of[[7,.9,cx,cz-2.95],[7,.9,cx,cz+2.95],[.9,6.8,cx+3.45,cz]])B(w,.08,d,x,4.15,z,M(0x8a8e94,{metalness:.6}));
 for(const[x0,z0,x1,z1]of[[cx-3.5,cz-3.4,cx+3.9,cz-3.4],[cx-3.5,cz+3.4,cx+3.9,cz+3.4],[cx+3.9,cz-3.4,cx+3.9,cz+3.4]]){rod([x0,5.2,z0],[x1,5.2,z1],.03,k.YEL);rod([x0,4.7,z0],[x1,4.7,z1],.025,k.YEL);const n=Math.round(Math.hypot(x1-x0,z1-z0)/1.4);for(let i=0;i<=n;i++){const t=i/n;rod([x0+(x1-x0)*t,4.2,z0+(z1-z0)*t],[x0+(x1-x0)*t,5.2,z0+(z1-z0)*t],.03,k.YEL)}}
 for(const s of[-.22,.22])rod([cx+3.95,0,cz+1.5+s],[cx+3.95,4.2,cz+1.5+s],.03,k.STEEL);for(let y=.3;y<4.2;y+=.3)rod([cx+3.95,y,cz+1.28],[cx+3.95,y,cz+1.72],.016,k.STEEL);
 L('PRIMARY CRUSHER',3.2,.5,'#e8c020','#1a1a1a',60,cx,3.2,cz+2.6,0);obs.push({x0:cx-3.7,x1:cx+3.7,z0:cz-3.2,z1:cz+3.2});
 /* the conveyor: P0 at the crusher's discharge, P1 over the stockpile (as dx581). Belt, rollers, frame, skirting,
    a walkway alongside, lattice trestles, a hood over the head pulley */
 const P0=[cx+4.2,.9,cz-1.5],P1=[cx+18,9,cz-14];
 /* the discharge: an opening in the crusher's east wall, a sloped chute with side plates that drops onto the belt's tail,
    and a skirted feed box over the belt so the rocks land on it */B(.1,.8,1.4,cx+3.02,2.0,cz-1.5,k.SOOT);


 const Lc=Math.hypot(P1[0]-P0[0],P1[1]-P0[1],P1[2]-P0[2]);const cv=new THREE.Group();cv.position.set((P0[0]+P1[0])/2,(P0[1]+P1[1])/2,(P0[2]+P1[2])/2);g.add(cv);{const dx=P1[0]-P0[0],dy=P1[1]-P0[1],dz=P1[2]-P0[2];cv.rotation.set(-Math.atan2(dy,Math.hypot(dx,dz)),Math.atan2(dx,dz),0,'YXZ')}
 const V=k.H(cv);const btx=(typeof qtBeltTex=='function'?qtBeltTex():k.tex(32,64,(c)=>{c.fillStyle='#1c1c1c';c.fillRect(0,0,32,64);c.fillStyle='#2c2c2c';for(let y=0;y<64;y+=8)c.fillRect(0,y,32,3)}));btx.repeat.set(1,Lc/2);
 const bg=new THREE.BoxGeometry(1.2,.12,Lc);{const uv=bg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i))}/* flipped so the game's scroll (offset.y going down) runs the belt uphill, the way the rocks go */const belt=new THREE.Mesh(bg,new THREE.MeshStandardMaterial({map:btx,roughness:.8}));cv.add(belt);
 V.C(.3,.3,1.5,0,-.05,-Lc/2,k.CAST,'x',null,14);/* tail pulley */
 /* the feed box: a closed steel box over the first 2 m of the belt, the chute lands in its top, the rocks come out under
    a rubber curtain at its far end (the game's rocks start inside it, so you never see them appear) */
 {const FB=M(0x4a5458,{metalness:.5,roughness:.45}),z0=-Lc/2-.25,z1=-Lc/2+2.1,zc=(z0+z1)/2,zl=z1-z0;for(const s2 of[-1,1])V.B(.06,.75,zl,s2*.74,.4,zc,FB);V.B(1.54,.06,zl,0,.8,zc,FB);V.B(1.54,.75,.06,0,.4,z0,FB);V.B(1.0,.04,.9,0,.84,z0+.75,k.SOOT);
  for(let i=0;i<6;i++)V.B(.22,.55,.02,-.58+i*.232,.5,z1+.02,M(0x1a1a1a,{roughness:.9}));V.B(1.54,.12,.08,0,.82,z1,k.STEEL)}
 /* the chute: a closed steel duct from the crusher's discharge opening down to a collar that sits in the feed box's top hole */
 {g.updateMatrixWorld(true);cv.updateMatrixWorld(true);const T=new THREE.Vector3(0,.84,-Lc/2+.5);cv.localToWorld(T);g.worldToLocal(T);
  const A=new THREE.Vector3(cx+3.05,2.4,cz-1.5),Bt=new THREE.Vector3(T.x,T.y+.75,T.z),d=Bt.clone().sub(A),len=d.length(),DM=M(0x4a5458,{metalness:.5,roughness:.45});
  const du=new THREE.Group();du.position.copy(A).add(Bt).multiplyScalar(.5);du.lookAt(du.position.clone().add(d));du.userData.fix=1;g.add(du);const D=k.H(du);
  D.B(.9,.06,len+.1,0,-.25,0,DM);D.B(.9,.06,len+.1,0,.25,0,DM);for(const s2 of[-1,1])D.B(.06,.56,len+.1,s2*.45,0,0,DM);for(const zz of[-len/2+.05,len/2-.05])D.B(1.02,.68,.08,0,0,zz,k.STEEL);
  B(1.0,.85,.9,Bt.x,T.y+.42,Bt.z,DM);B(1.1,.08,1.0,Bt.x,T.y+.1,Bt.z,k.STEEL);/* the collar: a box from the duct's end down into the hole */
  B(1.06,.7,1.06,cx+3.1,2.4,cz-1.5,k.STEEL)/* a flange where the duct leaves the crusher */}
 for(let z=-Lc/2+.5;z<Lc/2;z+=.9){const ro=V.C(.07,.07,1.3,0,-.1,z,k.STL2,'x',null,8)}for(const s of[-1,1]){V.B(.08,.35,Lc,s*.72,0,0,k.YEL);V.B(.04,.25,Lc,s*.62,.16,0,M(0x2a2a2a))}
 V.B(.8,.05,Lc,1.25,-.18,0,M(0x8a8e94,{metalness:.6}));for(let z=-Lc/2+1;z<Lc/2;z+=1.6)V.B(.04,.9,.04,1.62,.25,z,k.YEL);V.B(.04,.04,Lc,1.62,.7,0,k.YEL);
 V.C(.35,.35,1.5,0,0,Lc/2,k.CAST,'x',null,14);/* the head: a boxed hood over the head pulley, open underneath, with a spout pointing down onto the pile */
 {const HG2=M(0x5a6a5a,{metalness:.45,roughness:.5});for(const s2 of[-1,1])V.B(.06,.9,1.3,s2*.78,.15,Lc/2-.05,HG2);V.B(1.62,.06,1.3,0,.62,Lc/2-.05,HG2);V.B(1.62,.9,.06,0,.15,Lc/2+.62,HG2);
  const sp=new THREE.Group();sp.position.set(0,-.3,Lc/2+.62);cv.add(sp);sp.rotation.x=.9;const S2=k.H(sp);S2.B(1.0,.06,.9,0,-.05,.0,HG2);for(const s2 of[-1,1])S2.B(.06,.4,.9,s2*.5,.15,0,HG2);S2.B(1.0,.4,.06,0,.15,.42,HG2);
  for(const s2 of[-1,1])V.B(.1,.1,1.4,s2*.82,-.35,Lc/2-.05,k.STEEL)}
 {const hx=P1[0]-P0[0],hz=P1[2]-P0[2],h=Math.hypot(hx,hz),qx=hz/h,qz=-hx/h;/* the belt's local +x on the ground */
  for(let i=0;i<4;i++){const t=(i+.5)/4,px=P0[0]+(P1[0]-P0[0])*t,py=P0[1]+(P1[1]-P0[1])*t,pz=P0[2]+(P1[2]-P0[2])*t,top=py-.32;
   const A=[px-qx*.95,pz-qz*.95],Bp=[px+qx*1.85,pz+qz*1.85];for(const[lx,lz]of[A,Bp]){rod([lx,0,lz],[lx,top,lz],.07,k.YEL);B(.45,.1,.45,lx,.05,lz,k.PLINTH)}
   rod([A[0],top,A[1]],[Bp[0],top,Bp[1]],.08,k.YEL);for(let y=.6;y+1.3<top-.2;y+=1.5){rod([A[0],y,A[1]],[Bp[0],y+1.3,Bp[1]],.035,k.STEEL);rod([Bp[0],y,Bp[1]],[A[0],y+1.3,A[1]],.035,k.STEEL)}
   for(const[lx,lz]of[A,Bp])obs.push({x0:lx-.25,x1:lx+.25,z0:lz-.25,z1:lz+.25})}}
 const rocks=[];for(let i=0;i<10;i++){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.22,0),M(0x9a8466,{roughness:1}));cv.add(r);rocks.push(r)}
 /* the stockpile: a gravel cone with a rough edge, a few spilled rocks */const pile=new THREE.Mesh(new THREE.ConeGeometry(8,8.3,20,3),M(0xffffff,{map:(typeof qTex=='function'?qTex('grav'):k.SAND.map),roughness:1}));{const p=pile.geometry.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);if(y<4.1&&y>-4.1){const a=Math.atan2(p.getZ(i),p.getX(i));const f=1+.06*Math.sin(a*5)+.04*Math.sin(a*11);p.setX(i,p.getX(i)*f);p.setZ(i,p.getZ(i)*f)}}pile.geometry.computeVertexNormals()}pile.position.set(P1[0]+1.2,4.15,P1[2]-1.2);g.add(pile);
 /* rocks that leave the spout, drop onto the pile and roll down its side. tick(dt) moves them (call it every frame,
    beside the game's belt animation) */
 const PX=P1[0]+1.2,PZ=P1[2]-1.2,PR=8,PH=8.3;g.updateMatrixWorld(true);cv.updateMatrixWorld(true);const ex=new THREE.Vector3(0,-.55,Lc/2+.95);cv.localToWorld(ex);g.worldToLocal(ex);
 const fall=[];for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.DodecahedronGeometry(.2+(i%3)*.04,0),M(0x9a8466,{roughness:1}));g.add(m);fall.push({m,t:i*.55,a:i*2.39})}
 const surf=(x,z)=>PH*Math.max(0,1-Math.hypot(x-PX,z-PZ)/PR)+.15;
 const tick=dt=>{for(const f of fall){f.t+=dt;const T=4.4,u=f.t%T;if(u<.35){/* the drop out of the spout */const v=u/.35,x=ex.x+(PX-ex.x)*v*.6,z=ex.z+(PZ-ex.z)*v*.6;f.m.position.set(x,ex.y-(ex.y-surf(x,z))*v*v,z)}
   else{/* rolling down the slope, slowing as it goes */const v=Math.min(1,(u-.35)/3.6),r=1+v*(PR-1.6)*(1-(1-v)*(1-v))/(1)*.9,a=f.a+Math.floor(f.t/T)*1.7;const x=PX+Math.cos(a)*r,z=PZ+Math.sin(a)*r;f.m.position.set(x,surf(x,z),z);f.m.rotation.x+=dt*(6-v*5);f.m.rotation.z+=dt*3}
   f.m.visible=u<3.9}};
 return{btx,fws,jaw,cv,L:Lc,rocks,obs,P0,P1,tick}}

function qmOffice(g){const k=qmKit(),{B,C,rod,slab,L}=k.H(g),M=k.M;const x0=-134,x1=-122,z0=-1496,z1=-1485,FY=.6,H=2.8,t=.15,cx=(x0+x1)/2,cz=(z0+z1)/2,obs=[];
 const CL=M(0xe6dfcc,{roughness:.7}),TR=M(0x3a5a7a,{roughness:.6,metalness:.2}),FL=M(0x6a6a62,{roughness:.8}),GL=M(0x4a6a80,{metalness:.5,roughness:.1,emissive:0x1a2a34});
 /* piers, a floor deck, skirting */for(let x=x0+.5;x<=x1-.4;x+=2.75)for(const z of[z0+.4,z1-.4])B(.4,FY,.4,x,FY/2,z,k.PLINTH);B(x1-x0,.12,z1-z0,cx,FY-.06,cz,FL);B(x1-x0+.06,.4,.06,cx,FY-.25,z1+.03,TR);B(x1-x0+.06,.4,.06,cx,FY-.25,z0-.03,TR);B(.06,.4,z1-z0,x0-.03,FY-.25,cz,TR);B(.06,.4,z1-z0,x1+.03,FY-.25,cz,TR);
 /* walls: cladding panels with trim strips, a door gap (1.4 m) in the north wall at x -128 */const dA=-128.7,dB=-127.3;
 const wall=(ax,c,a,b,win)=>{const len=b-a,m=(a+b)/2;if(len<.05)return;ax=='x'?B(len,H,t,m,FY+H/2,c,CL):B(t,H,len,c,FY+H/2,m,CL)};
 wall('x',z1-t/2,x0,dA);wall('x',z1-t/2,dB,x1);wall('x',z0+t/2,x0,x1);wall('z',x0+t/2,z0,z1);wall('z',x1-t/2,z0,z1);B(dB-dA,H-2.1,t,(dA+dB)/2,FY+2.1+(H-2.1)/2,z1-t/2,CL);
 obs.push({x0,x1:dA,z0:z1-t,z1},{x0:dB,x1,z0:z1-t,z1},{x0,x1,z0,z1:z0+t},{x0,x1:x0+t,z0,z1},{x0:x1-t,x1,z0,z1});
 for(let x=x0+1.5;x<x1;x+=1.5){if(x>dA-.2&&x<dB+.2)continue;B(.06,H,.04,x,FY+H/2,z1+.02,TR);B(.06,H,.04,x,FY+H/2,z0-.02,TR)}for(let z=z0+1.5;z<z1;z+=1.5){B(.04,H,.06,x0-.02,FY+H/2,z,TR);B(.04,H,.06,x1+.02,FY+H/2,z,TR)}
 for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])B(.12,H,.12,x,FY+H/2,z,TR);
 /* windows: two in the north wall, two east, one south (glass set in the wall, frames both sides) */
 const win=(ax,c,u,w,out)=>{const y=FY+1.6,h=1.0;if(ax=='x'){B(w,h,.02,u,y,c,GL);for(const s of[-1,1]){B(w+.12,.08,.1,u,y+s*(h/2+.04),c,TR);B(.08,h,.1,u+s*(w/2+.04),y,c,TR)}B(w+.2,.06,.22,u,y-h/2-.07,c+out*.06,TR)}else{B(.02,h,w,c,y,u,GL);for(const s of[-1,1]){B(.1,.08,w+.12,c,y+s*(h/2+.04),u,TR);B(.1,h,.08,c,y,u+s*(w/2+.04),TR)}B(.22,.06,w+.2,c+out*.06,y-h/2-.07,u,TR)}};
 /* cut the wall where windows go is too fussy for a cabin: the glass sits flush in a recess painted dark */
 for(const u of[-131.6,-124.6])win('x',z1+.005,u,1.6,1);for(const u of[-1493,-1488.5])win('z',x1+.005,u,1.4,1);win('x',z0-.005,-128,1.6,-1);
 /* roof: a shallow pitch with an overhang, a gutter */const RW=x1-x0+.8,RD=z1-z0+.8;{const r=B(RW,.1,RD/2+.05,cx,FY+H+.25,cz+RD/4,TR);r.rotation.x=.12;const r2=B(RW,.1,RD/2+.05,cx,FY+H+.25,cz-RD/4,TR);r2.rotation.x=-.12}B(RW,.2,.12,cx,FY+H+.02,z1+.42,k.STEEL);
 /* the porch: a deck, steps down to the ground, a rail, a canopy and a lamp over the door */B(4,.12,1.8,-128,FY-.06,z1+.9,FL);for(let i=0;i<3;i++)B(1.8,.15,.35,-128,.075+i*.15,z1+1.98+(2-i)*.35,k.CAP);for(const s of[-1,1]){rod([-128+s*2,FY,z1+1.75],[-128+s*2,FY+1,z1+1.75],.03,k.STEEL);rod([-128+s*2,FY+1,z1+.1],[-128+s*2,FY+1,z1+1.75],.03,k.STEEL);rod([-128+s*2,FY+1,z1+1.75],[-128+s*1,FY+1,z1+1.75],.03,k.STEEL)}
 B(2.6,.1,1.4,-128,FY+2.45,z1+.7,TR);for(const s of[-1,1])rod([-128+s*1.2,FY+2.4,z1+1.35],[-128+s*1.2,FY+1.7,z1+.08],.025,k.STEEL);B(.4,.06,.15,-128,FY+2.35,z1+.6,k.LIT);
 /* the door, swung open into the room */{const dg=new THREE.Group();dg.position.set(dA+.02,FY,z1-t);dg.rotation.y=1.4;g.add(dg);k.H(dg).B(1.36,2.05,.05,.68,1.03,0,TR);k.H(dg).C(.03,.03,.1,1.2,1.0,-.05,k.STL2,'z',null,8)}
 B(2.62,.36,.05,-128,FY+2.3,z1+1.42,TR);L('QUARRY OFFICE · MINE JOBS',2.5,.3,'#1a2a3a','#ffe9a8',60,-128,FY+2.3,z1+1.45,0);/* on the porch canopy's front edge */
 /* inside: a desk run along the west wall (the tycoon computer stands at its north end), a filing cabinet, a site map,
    hard hats on pegs, a water cooler, a ceiling light, a rug */const IN=M(0x6a4a2a,{roughness:.6});
 B(.8,.06,4.6,x0+.55,FY+.75,-1491.5,IN);for(const z of[-1493.6,-1489.4])B(.7,.72,.06,x0+.55,FY+.38,z,IN);B(.55,.7,.55,x0+.5,FY+.35,-1494.7,M(0x6a7078,{metalness:.5}));for(let i=0;i<3;i++)B(.4,.02,.02,x0+.78,FY+.15+i*.22,-1494.7,k.STL2);
 {const mp=k.tex(256,160,(c)=>{c.fillStyle='#e8e0c8';c.fillRect(0,0,256,160);c.strokeStyle='#8a6a3a';c.lineWidth=2;for(let i=0;i<6;i++){c.beginPath();c.ellipse(128,80,30+i*16,18+i*10,0,0,7);c.stroke()}c.fillStyle='#c02020';c.beginPath();c.arc(150,70,6,0,7);c.fill();c.fillStyle='#1a1a1a';c.font='bold 16px '+k.FONT;c.fillText('OLD QUARRY · SITE PLAN',8,152)});const m=new THREE.Mesh(new THREE.PlaneGeometry(2,1.25),new THREE.MeshStandardMaterial(Object.assign({map:mp,roughness:.9},k.PO2)));m.position.set(-128,FY+1.7,z0+t+.01);g.add(m);B(2.08,1.33,.03,-128,FY+1.7,z0+t+.005,k.CAST)}
 for(let i=0;i<4;i++){C(.02,.02,.12,x1-t-.06,FY+1.9,-1493.5+i*.45,k.STL2,'x',null,6);const hh=new THREE.Mesh(new THREE.SphereGeometry(.16,12,8,0,Math.PI*2,0,Math.PI/2),M([0xf0c020,0xf0c020,0xffffff,0xf06020][i]));hh.rotation.z=Math.PI/2;hh.position.set(x1-t-.16,FY+1.82,-1493.5+i*.45);g.add(hh)}
 B(.35,1.0,.35,x1-.4,FY+.5,z0+.45,M(0xe8e8e0));C(.13,.13,.4,x1-.4,FY+1.2,z0+.45,M(0x9ad0e8,{roughness:.2}),null,null,12);
 B(x1-x0-.3,.04,z1-z0-.3,cx,FY+H-.02,cz,M(0xe8e4d8,{roughness:.9}));B(1.2,.06,.3,cx,FY+H-.07,cz,k.LIT);/* a ceiling */B(3,.012,2,cx+1,FY+.007,cz-.5,k.tier(M(0x7a2a22,{roughness:1}),2));
 return{obs,plate:{x0,x1,z0,z1,y:FY}}}

function qmFlood(g,x,z,ax,az){const k=qmKit(),{B,C,rod}=k.H(g),M=k.M;const H=14,ry=Math.atan2(ax-x,az-z);
 B(1.6,.4,1.6,x,.2,z,k.PLINTH);const s=.55;for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])rod([x+a*s,.4,z+b*s],[x+a*s*.5,H,z+b*s*.5],.06,k.YEL);
 for(let y=1.6;y<H;y+=1.6){const f=1-(y/H)*.5;for(const[a0,b0,a1,b1]of[[-1,-1,1,-1],[-1,1,1,1],[-1,-1,-1,1],[1,-1,1,1]])rod([x+a0*s*f,y,z+b0*s*f],[x+a1*s*f,y,z+b1*s*f],.03,k.STEEL)}
 B(1.4,.12,1.4,x,H,z,k.STEEL);const hd=new THREE.Group();hd.position.set(x,H+.6,z);hd.rotation.y=ry;g.add(hd);const h=k.H(hd);h.C(.08,.08,.6,0,-.3,0,k.STEEL,null,null,8);h.B(2.6,.12,.12,0,0,0,k.STEEL);h.B(2.6,.12,.12,0,.8,0,k.STEEL);for(const sx of[-1.3,1.3])h.B(.1,.92,.1,sx,.4,0,k.STEEL);for(const[sx,sy]of[[-.65,0],[.65,0],[-.65,.8],[.65,.8]]){const lb=new THREE.Group();lb.position.set(sx,sy+.06,.18);lb.rotation.x=.5;hd.add(lb);const lh=k.H(lb);lh.B(.62,.5,.32,0,0,0,k.CAST);lh.B(.54,.42,.02,0,0,.17,k.LIT);for(const s2 of[-1,1])lh.B(.04,.3,.2,s2*.33,0,-.2,k.STEEL)}
 for(const sd of[-.18,.18])rod([x+s+.15,.4,z+sd],[x+s*.5+.15,H,z+sd],.02,k.STEEL);return{obs:[{x0:x-.8,x1:x+.8,z0:z-.8,z1:z+.8}]}}

function qmEntrance(g,x,z,ry){const k=qmKit(),gr=new THREE.Group();gr.position.set(x,0,z);gr.rotation.y=ry||0;gr.userData.fix=1;g.add(gr);const{B,C,L}=k.H(gr),M=k.M;
 for(const s of[-1,1]){C(.12,.12,3.6,s*1.9,1.8,0,M(0x5a3a22,{roughness:.8}),null,null,8);C(.25,.3,.2,s*1.9,.1,0,k.PLINTH,null,null,10)}B(4.4,1.6,.1,0,2.6,0,M(0x5a3a22,{roughness:.8}));B(4.5,.1,.2,0,3.45,0,M(0x4a2a12));
 for(const r of[0,Math.PI]){const o=r?-.056:.056;L('OLD QUARRY',4,.6,'#e8c020','#1a1a1a',110,0,3.0,o,r,gr);L('DOORS BUT DESERT MINING CO.',4,.32,'#1a1a1a','#e8c020',70,0,2.45,o,r,gr);L('HAUL ROAD → · TRUCKS TURNING',4,.3,'#1a1a1a','#f0ece0',60,0,2.05,o,r,gr)}
 return{obs:[]}}
