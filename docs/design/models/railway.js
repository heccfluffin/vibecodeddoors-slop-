/* =====================================================================================================
   railway.js (railway.md): the passenger coach and the station platforms. Needs fort-kit.js, airfield.js and
   lake.js (lkKit, rrBogie, rrCoupler, afCanvas). Same conventions as the train in lake.js: a car's origin is its middle
   at rail level (y 0 = the ground, rail tops at 0.3), FRONT +x, floor at y 1.3, userData.spin(dist) turns the wheels.

   Batch 1: the coach.
   rrCoach()   a 14 m wooden passenger coach in the train's style: dark green with a cream window band, DOORS BUT
               DESERT RAILWAY on the letterboard, a clerestory roof, open end platforms with railings, gates and steps
               down both sides, two bogies, truss rods. Inside: plank floor, sixteen benches in facing pairs either
               side of the aisle, luggage racks, three oil lamps, end doors (open).
               userData: spin(dist); seats [{x,y,z,ry}] (car space, where a sitting player's hips go, facing ry);
               doors [{x,z,side}] (the four step-down points, where "Get off" puts you); lamp {x,y,z} (for a point
               light while someone rides); len 14 (the spacing for the train's car() list).
   ===================================================================================================== */
function rrCoach(){const g=new THREE.Group(),k=lkKit(),M=k.M,
 GRN=M(0x2c4a34,{roughness:.6}),CRM=M(0xe6d9b4,{roughness:.6}),DK=M(0x1a1a1c,{roughness:.5}),ST=M(0x6a6e74,{metalness:.5,roughness:.5}),BR=M(0xc8a040,{metalness:.8,roughness:.3}),
 ROOF=M(0x3a3430,{roughness:.8}),WD=M(0x8a5a32,{roughness:.7}),WD2=M(0x6a4024,{roughness:.75}),
 GLS=new THREE.MeshStandardMaterial({color:0xbcd4dc,transparent:true,opacity:.28,roughness:.1,metalness:.1,depthWrite:false,side:THREE.DoubleSide}),
 GLOW=M(0xfff0c8,{emissive:0xffd890,emissiveIntensity:1.2});
 const add=(geo,m,p,r,par)=>{const o=new THREE.Mesh(geo,m);if(p)o.position.set(...p);if(r)o.rotation.set(...r);(par||g).add(o);return o},B=(w,h,d,x,y,z,m,par)=>add(new THREE.BoxGeometry(w,h,d),m,[x,y,z],null,par);
 const L=12,HW=1.35,FL=1.3,WT=.08,Y1=2.2,Y2=3.0,TOP=3.6;
 /* plank texture for the floors and platforms */
 const plank=afCanvas(256,256,(c,w,h)=>{c.fillStyle='#8a6038';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=32){c.fillStyle='rgba(0,0,0,'+(.08+Math.random()*.1)+')';c.fillRect(0,y,w,32);c.fillStyle='rgba(30,18,8,.6)';c.fillRect(0,y,w,2)}for(let i=0;i<300;i++){c.fillStyle='rgba(40,24,10,.25)';c.fillRect(Math.random()*w,Math.random()*h,8+Math.random()*30,1)}});
 plank.wrapS=plank.wrapT=THREE.RepeatWrapping;const PL=new THREE.MeshStandardMaterial({map:plank,roughness:.8});
 /* ---- underframe ---- */
 B(14,.3,2.5,0,1.15,0,DK);
 for(const s of[-1,1]){/* truss rods with queen posts */for(const qx of[-1.6,1.6])B(.08,.45,.08,qx,.8,s*1.0,DK);for(const[a,b]of[[[-5.2,1.0],[-1.6,.58]],[[-1.6,.58],[1.6,.58]],[[1.6,.58],[5.2,1.0]]]){const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);const r=add(new THREE.CylinderGeometry(.025,.025,len,6),ST,[(a[0]+b[0])/2,(a[1]+b[1])/2,s*1.0]);r.rotation.z=-Math.atan2(dx,dy)}}
 B(1.4,.5,.8,0,.8,0,DK);/* battery box */B(.9,.35,.5,2.4,.85,-.5,DK);/* brake cylinder */
 const wheels=[...rrBogie(g,-4.8,M),...rrBogie(g,4.8,M)];rrCoupler(g,6.95,1,M);rrCoupler(g,-6.95,-1,M);
 /* ---- the body: floor, walls with windows, end walls with doors ---- */
 {const f=add(new THREE.BoxGeometry(L,.08,2*HW),PL,[0,FL+.04,0]);const uv=f.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*6,uv.getY(i)*1.5)}
 const NW=8,SP=L/NW,WW=.95;/* windows: eight a side, 1.5 m apart */
 for(const s of[-1,1]){const z=s*(HW-WT/2);
  B(L,Y1-FL,WT,0,(FL+Y1)/2,z,GRN);/* lower panels */B(L,.06,WT+.02,0,Y1+.03,z,CRM);/* sill */
  B(L,TOP-Y2,WT,0,(Y2+TOP)/2,z,GRN);/* the letterboard above the windows */
  for(let i=0;i<=NW;i++){const x=-L/2+i*SP,w=i==0||i==NW?(SP-WW)/2:SP-WW;const cx=i==0?-L/2+w/2:i==NW?L/2-w/2:x;B(w,Y2-Y1,WT,cx,(Y1+Y2)/2,z,CRM)}
  for(let i=0;i<NW;i++){const x=-L/2+SP*(i+.5);add(new THREE.PlaneGeometry(WW,Y2-Y1),GLS,[x,(Y1+Y2)/2,z],[0,s>0?0:Math.PI,0]);B(WW,.05,.03,x,(Y1+Y2)/2+.1,z+s*.03,CRM);/* sash bar */}
  /* gold lining and the lettering */B(L,.03,.01,0,Y1-.22,z+s*(WT/2+.005),BR);
  {const nm=k.lab('DOORS BUT DESERT RAILWAY',7.5,.36,null,'#e8c060',80);nm.position.set(0,3.32,z+s*(WT/2+.006));nm.rotation.y=s>0?0:Math.PI;g.add(nm)}
  {const nb=k.lab('No 1',.7,.3,null,'#e8c060',80);nb.position.set(s>0?-4.2:4.2,1.75,z+s*(WT/2+.006));nb.rotation.y=s>0?0:Math.PI;g.add(nb)}}
 /* end walls with a doorway in the middle; the doors stand open, folded back inside */
 for(const e of[-1,1]){const x=e*(L/2-WT/2),DW=.8,DH=2.05;
  for(const zs of[-1,1]){const w=HW-WT-DW/2;B(WT,TOP-FL-.08,w,x,(FL+.08+TOP)/2,zs*(DW/2+w/2),GRN)}B(WT,TOP-FL-DH,DW,x,FL+DH+(TOP-FL-DH)/2,0,GRN);
  B(WT+.02,.06,DW+.12,x,FL+DH+.03,0,CRM);
  const dr=new THREE.Group();dr.position.set(x-e*.04,FL,DW/2);dr.rotation.y=e>0?1.45:-1.45;g.add(dr);B(.05,DH-.02,DW-.02,0,(DH)/2,-(DW-.02)/2,WD,dr);add(new THREE.PlaneGeometry(.5,.6),GLS,[e>0?.03:-.03,1.45,-(DW-.02)/2],[0,Math.PI/2,0],dr);B(.06,.06,.12,e>0?.04:-.04,1.0,-(DW-.1),BR,dr)}
 /* ---- the roof: an arched main roof over everything, the clerestory on top ---- */
 {const RL=14.2,R=2.2,ang=Math.asin((HW+.12)/R),ge=new THREE.CylinderGeometry(R,R,RL,24,1,true,-ang,2*ang);ge.rotateZ(Math.PI/2);ge.rotateX(-Math.PI/2);
  /* the arc's centre sits so its edges meet the wall tops */const cy=TOP-R*Math.cos(ang)+.02;const rf=add(ge,ROOF,[0,cy,0]);rf.material=ROOF.clone();rf.material.side=THREE.DoubleSide;
  B(L-.6,.48,1.3,0,cy+R+.12,0,GRN);B(L-.4,.06,1.5,0,cy+R+.39,0,ROOF);/* clerestory and its cap */
  for(const s of[-1,1])for(let i=0;i<10;i++){add(new THREE.PlaneGeometry(.5,.22),M(0x1a2a2a,{roughness:.2,metalness:.2}),[-L/2+.9+i*1.15,cy+R+.14,s*.652],[0,s>0?0:Math.PI,0])}
  for(const s of[-1,1])B(RL,.08,.06,0,TOP+.02,s*(HW+.1),DK);/* drip rails */}
 /* ---- the end platforms: decking, railings with a gap and a gate, steps down both sides, grab rails ---- */
 for(const e of[-1,1]){const x0=e*L/2,x1=e*7,cx=(x0+x1)/2;
  {const d=add(new THREE.BoxGeometry(1,.1,2*HW),PL,[cx,FL+.0,0]);}
  /* the end railing: posts at the corners and beside the gap, top rail, bars */
  for(const zs of[-1,1]){const zo=zs*(HW-.05),zi=zs*.5;for(const z of[zo,zi])B(.05,1.05,.05,x1-e*.06,FL+.55,z,BR);B(.05,.05,Math.abs(zo-zi),x1-e*.06,FL+1.06,(zo+zi)/2,BR);for(let j=1;j<5;j++)B(.03,.9,.03,x1-e*.06,FL+.5,zi+(zo-zi)*j/5,ST)}
  /* side grab rails at the step openings, and the steps (three treads) down to station height */
  for(const zs of[-1,1]){B(.04,1.2,.04,x0+e*.08,FL+.7,zs*(HW+.03),BR);B(.04,1.2,.04,x1-e*.08,FL+.7,zs*(HW+.03),BR);
   /* (inside the loading gauge: a platform's edge is 1.6 m from the track's middle) */for(const[i,y]of[[0,1.0],[1,.72],[2,.44]]){const zz=zs*(1.2+i*.12);B(.85,.05,.26,cx,y,zz,DK)}for(const dx of[-.42,.42]){const a=new THREE.Vector3(cx+dx,FL,zs*1.2),b=new THREE.Vector3(cx+dx,.42,zs*1.46),d=b.clone().sub(a);const st=add(new THREE.BoxGeometry(.04,d.length(),.06),DK,[(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2]);st.rotation.x=Math.atan2(d.z,-d.y)*-1}}}
 /* ---- inside: sixteen benches in facing pairs, luggage racks, lamps ---- */
 const seats=[];const bench=(x,face,s)=>{const zc=s*.85,G=new THREE.Group();G.position.set(x,FL+.08,zc);G.rotation.y=face>0?0:Math.PI;g.add(G);
  B(.48,.08,.84,0,.45,0,WD,G);B(.06,.38,.8,.18,.21,0,WD2,G);for(const dz of[-.38,.38])B(.05,.42,.05,-.2,.21,dz,WD2,G);B(.08,.6,.84,-.23,.78,0,WD,G);B(.1,.06,.88,-.24,1.11,0,WD2,G);
  seats.push({x:x+(face>0?.05:-.05),y:FL+.58,z:zc,ry:face>0?-Math.PI/2:Math.PI/2})};
 for(const s of[-1,1])for(let b=0;b<4;b++){const xc=-4.5+b*3;bench(xc-.75,1,s);bench(xc+.75,-1,s)}
 for(const s of[-1,1]){B(L-.4,.03,.04,0,3.15,s*(HW-.12),BR);B(L-.4,.03,.04,0,3.15,s*(HW-.36),BR);for(let i=0;i<9;i++)B(.03,.03,.28,-L/2+.4+i*(L-.8)/8,3.12,s*(HW-.24),BR)}
 for(const x of[-4,0,4]){add(new THREE.CylinderGeometry(.02,.02,.26,6),BR,[x,TOP-.15,0]);add(new THREE.CylinderGeometry(.14,.1,.12,12),BR,[x,TOP-.32,0]);add(new THREE.SphereGeometry(.1,12,10),GLOW,[x,TOP-.42,0])}
 {const t=add(new THREE.BoxGeometry(L-.2,.04,2*HW-.2),M(0xd8ccb0,{roughness:.8}),[0,TOP-.02,0])}/* the ceiling */
 g.userData.spin=d=>{for(const w of wheels)w.rotation.z=-d/.42};g.userData.seats=seats;g.userData.len=14;g.userData.lamp={x:0,y:3.2,z:0};
 g.userData.doors=[[-6.5,-1],[-6.5,1],[6.5,-1],[6.5,1]].map(([x,s])=>({x,z:s*(HW+.9),side:s}));
 g.traverse(m=>{if(m.isMesh){m.userData.noSeam=true;m.userData.dpKeep=1}});return g}

/* =====================================================================================================
   Batch 2: the stations. Desert-local coordinates; the track runs along z = RRZ (-1640), platforms on its north side
   (+z) with their edge 1.6 m from the track's middle, top 0.6 m (like Dusty Gulch's).
   RRSTN                         the three new halts: name, platform x0..x1, the end the road comes in at, extras.
   rrStation(g, st)              one halt: the platform (concrete, a white safety line and a yellow edge strip, a ramp
                                 down at the road end, a back railing), a timber shelter with a tin lean-to roof, a
                                 bench and a timetable poster, two station signs on posts facing the track, two
                                 lamps, a bin, the departure board, a gravel patch where the track road ends; the
                                 Quarry & Gorge halt also gets a viewing bench at its west end looking across the
                                 tracks into the gorge. Returns {board, obs, props, lamps}.
                                 props: [{x,z,r,what}] for the press-E spots ('board' = read the times, 'wait' = the
                                 platform's boarding spot). obs: the shelter's walls, the railing, the signs, lamps.
   rrBoard()                     the departure board on its own (Dusty Gulch gets one too). board.set(dir, mins, secs)
                                 redraws it: dir 'EASTBOUND'/'WESTBOUND' or '' (no train due), the time to the next
                                 train. Its origin is its foot; as built its face looks +z: turn it (rotation.y = PI) to face the track.
   ===================================================================================================== */
const RRSTN=[{name:'LOOKOUT MESA',x0:-360,x1:-300,road:'W'},{name:'QUARRY & GORGE',x0:-190,x1:-130,road:'E',view:1},{name:'MIRAGE LAKE',x0:220,x1:280,road:'E'}];
function rrBoard(){const k=lkKit(),M=k.M,G=new THREE.Group(),DK=M(0x1a1a1c,{roughness:.5}),ST=M(0x6a6e74,{metalness:.5,roughness:.5});
 for(const sx of[-.75,.75]){const p=new THREE.Mesh(new THREE.BoxGeometry(.08,2.58,.08),ST);p.position.set(sx,1.29,0);G.add(p)}
 const c=document.createElement('canvas');c.width=256;c.height=128;const tx=new THREE.CanvasTexture(c);tx.anisotropy=4;
 const draw=(dir,m,s)=>{const x=c.getContext('2d');x.fillStyle='#0e0f10';x.fillRect(0,0,256,128);x.fillStyle='rgba(255,180,40,.06)';for(let i=0;i<256;i+=4)for(let j=0;j<128;j+=4)x.fillRect(i,j,2,2);
  x.fillStyle='#ffb428';x.textAlign='center';x.font='bold 20px '+(k.FONT||'Arial');x.fillText('NEXT TRAIN',128,30);x.font='bold 26px '+(k.FONT||'Arial');x.fillText(dir||'NONE DUE',128,66);
  x.font='bold 30px monospace';x.fillText(dir?((m|0)+':'+String(s|0).padStart(2,'0')):'--:--',128,106);tx.needsUpdate=true};draw('EASTBOUND',1,20);
 const face=new THREE.MeshBasicMaterial({map:tx}),b=new THREE.Mesh(new THREE.BoxGeometry(1.6,.8,.1),[DK,DK,DK,DK,face,DK]);b.position.set(0,2.2,0);G.add(b);
 const hood=new THREE.Mesh(new THREE.BoxGeometry(1.72,.06,.3),DK);hood.position.set(0,2.63,.08);G.add(hood);
 G.userData.set=draw;G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return G}
function rrStation(g,st){const k=lkKit(),M=k.M,Z=RRZ,ZE=Z+1.6,ZB=Z+7.6,PY=.6,{x0,x1}=st,xc=(x0+x1)/2,G=new THREE.Group();g.add(G);const obs=[],props=[],lamps=[];
 const CON=M(0xb0aa9e,{roughness:.9}),CON2=M(0x8e887c,{roughness:.9}),WD=M(0x8a5a32,{roughness:.75}),WD2=M(0x5a3a22,{roughness:.8}),TIN=M(0x8a8e92,{metalness:.5,roughness:.5}),RUST=M(0x7a4a2a,{roughness:.8}),DK=M(0x1a1a1c,{roughness:.5}),
  WH=M(0xe8e4da,Object.assign({roughness:.7},k.PO||{})),YL=M(0xe0b420,Object.assign({roughness:.7},k.PO||{}));
 const B=(w,h,d,x,y,z,m,par)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(par||G).add(o);return o};
 /* the platform: a slab, its coping, the lines, the ramp at the road end */
 B(x1-x0,PY-.06,ZB-ZE,xc,(PY-.06)/2,(ZE+ZB)/2,CON2);B(x1-x0,.06,ZB-ZE,xc,PY-.03,(ZE+ZB)/2,CON);
 B(x1-x0,.004,.25,xc,PY+.002,ZE+.13,YL);B(x1-x0,.004,.08,xc,PY+.002,ZE+.6,WH);
 const re=st.road=='W'?x0:x1,rs=st.road=='W'?-1:1;{/* a 6 m ramp down to the ground beside the slab's road end */const L=6,ge=new THREE.BufferGeometry(),xa=re,xb=re+rs*L,za=ZE+1.2,zb=ZB;
  const P=[xa,PY,za, xa,PY,zb, xb,0,za, xb,0,zb, xa,0,za, xa,0,zb],I=[0,2,1,1,2,3, 0,4,2, 1,3,5];ge.setAttribute('position',new THREE.Float32BufferAttribute(I.flatMap(i=>P.slice(i*3,i*3+3)),3));ge.computeVertexNormals();
  const m=new THREE.Mesh(ge,CON);m.material=CON.clone();m.material.side=THREE.DoubleSide;G.add(m);
  /* the ramp's handrail on its track side */for(let i=0;i<=3;i++){const t=i/3;B(.05,1,.05,xa+rs*L*t,PY*(1-t)+.5,za+.05,TIN)}const hr=new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(L,PY)+.05,.05,.05),TIN);hr.position.set(xa+rs*L/2,PY/2+1.02,za+.05);hr.rotation.z=-rs*Math.atan2(PY,L);G.add(hr)}
 /* the back railing (gaps for the ramp) */{const ra=st.road=='W'?x0+.3:x0+.3,rb=st.road=='W'?x1-.3:x1-.3;for(let x=ra;x<=rb+.01;x+=(rb-ra)/Math.round((rb-ra)/2.5))B(.06,1.03,.06,x,PY+.515,ZB-.15,TIN);for(const y of[PY+1.02,PY+.55])B(rb-ra,.05,.05,(ra+rb)/2,y,ZB-.15,TIN);obs.push({x0,x1,z0:ZB-.3,z1:ZB})}
 /* the shelter: three timber walls, an open front towards the track, a tin lean-to roof sloping back; a bench and a poster inside */
 {const sx=xc+(st.road=='W'?6:-6),sw=5,sd=2.6,sz0=ZB-.4-sd,h0=2.9,h1=2.5;B(sw-.2,h1+.03,.1,sx,PY+(h1+.03)/2,ZB-.45,WD);for(const e of[-1,1]){const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(sd,0);sh.lineTo(sd,h1-.01);sh.lineTo(0,h0-.01);sh.lineTo(0,0);const w=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.1,bevelEnabled:false}),WD);w.rotation.y=-Math.PI/2;w.position.set(sx+e*(sw/2-.05)+.05,PY,sz0);G.add(w)}
  for(let i=0;i<9;i++)if(i<6||i>7)B(.02,h1,.01,sx-sw/2+.3+i*.55,PY+h1/2,ZB-.505,WD2);/* no battens behind the poster */
  const roof=new THREE.Mesh(new THREE.BoxGeometry(sw+.5,.06,sd+.7),TIN);roof.position.set(sx,PY+(h0+h1)/2+.1*(h0-h1)/sd+.035,sz0+sd/2-.1);roof.rotation.x=Math.atan2(h0-h1,sd);G.add(roof);
  B(sw-.4,.08,.45,sx,PY+.45,ZB-.8,WD);B(sw-.4,.45,.06,sx,PY+.75,ZB-.58,WD);for(const dx of[-1.8,0,1.8])B(.06,.45,.4,sx+dx,PY+.22,ZB-.8,WD2);
  {const p=k.lab('TIMETABLE\nAll trains stop here,\nboth ways, for 15 s.\nSee the board for\nthe next one.\nDOORS BUT DESERT RAILWAY',1,1.2,'#f0e8c8','#2a2018',40);p.position.set(sx+1.6,PY+1.6,ZB-.52);p.rotation.y=Math.PI;G.add(p)}
  obs.push({x0:sx-sw/2,x1:sx+sw/2,z0:ZB-.5,z1:ZB-.4},{x0:sx-sw/2,x1:sx-sw/2+.1,z0:sz0,z1:ZB-.4},{x0:sx+sw/2-.1,x1:sx+sw/2,z0:sz0,z1:ZB-.4})}
 /* station signs at both ends, white boards with black letters on two posts, facing the track */
 for(const sx of[x0+2.5,x1-2.5]){for(const dx of[-1.1,1.1])B(.08,2.4,.08,sx+dx,PY+1.2,ZE+3.4,TIN);const s=k.lab(st.name,2.6,.45,'#f4f2ec','#141414',70);s.position.set(sx,PY+2.1,ZE+3.37);s.rotation.y=Math.PI;G.add(s);const s2=s.clone();s2.position.z=ZE+3.43;s2.rotation.y=0;G.add(s2);
  const bk=B(2.66,.51,.04,sx,PY+2.1,ZE+3.4,DK);obs.push({x0:sx-1.2,x1:sx+1.2,z0:ZE+3.3,z1:ZE+3.5})}
 /* lamps: tall posts with a lantern */
 for(const lx of[xc-14,xc+14]){B(.12,.2,.12,lx,PY+.1,ZE+2.6,DK);const p=new THREE.Mesh(new THREE.CylinderGeometry(.05,.07,3.4,8),DK);p.position.set(lx,PY+1.9,ZE+2.6);G.add(p);B(.6,.04,.04,lx-.25,PY+3.5,ZE+2.6,DK);
  const lt=new THREE.Mesh(new THREE.CylinderGeometry(.14,.1,.32,6),M(0xfff0c8,{emissive:0xffd890,emissiveIntensity:1.1}));lt.position.set(lx-.5,PY+3.27,ZE+2.6);G.add(lt);B(.34,.05,.34,lx-.5,PY+3.455,ZE+2.6,DK);lamps.push({x:lx-.5,y:PY+3.15,z:ZE+2.6});obs.push({x0:lx-.1,x1:lx+.1,z0:ZE+2.5,z1:ZE+2.7})}
 /* the departure board near the boarding spot, a bin, a bench on the open platform */
 const board=rrBoard();board.position.set(xc,PY,ZE+4.6);board.rotation.y=Math.PI;G.add(board);obs.push({x0:xc-.9,x1:xc+.9,z0:ZE+4.5,z1:ZE+4.7});
 {const bx=xc+(st.road=='W'?-6:6);B(1.6,.06,.42,bx,PY+.45,ZE+4.2,WD);B(1.6,.42,.05,bx,PY+.74,ZE+4.42,WD);for(const dx of[-.7,.7])B(.06,.45,.42,bx+dx,PY+.22,ZE+4.2,DK)}
 {const bn=new THREE.Mesh(new THREE.CylinderGeometry(.22,.2,.8,12),M(0x2c4a34,{roughness:.6}));bn.position.set(xc+(st.road=='W'?-2.5:2.5),PY+.4,ZE+5.2);G.add(bn);const lid=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.06,12),DK);lid.position.set(xc+(st.road=='W'?-2.5:2.5),PY+.83,ZE+5.2);G.add(lid)}
 /* the gravel patch where the track road ends, beside the ramp's foot */
 {const gx=re+rs*11,gm=M(0x8e7f66,{roughness:1,polygonOffset:true,polygonOffsetUnits:-2});const p=new THREE.Mesh(new THREE.PlaneGeometry(10,ZB+6-ZE-1),gm);p.rotation.x=-Math.PI/2;p.position.set(gx,.03,(ZE+1+ZB+6)/2);G.add(p)}
 /* Quarry & Gorge: a viewing bench at the west end, looking across the tracks to the gorge */
 if(st.view){const vx=x0+1.4;B(1.6,.06,.42,vx,PY+.45,ZE+1.6,WD);B(1.6,.42,.05,vx,PY+.74,ZE+1.82,WD);for(const dx of[-.7,.7])B(.06,.45,.42,vx+dx,PY+.22,ZE+1.6,DK);
  const s=k.lab("DEVIL'S GORGE · 70 m DOWN",1.2,.3,'#5a3a22','#f0e0b8',50);for(const dx of[-.5,.5])B(.05,1.2,.05,vx+dx+.2,PY+.6,ZE+.9,WD2);B(1.26,.34,.03,vx+.2,PY+1.1,ZE+.915,WD2);s.position.set(vx+.2,PY+1.1,ZE+.935);G.add(s)}
 props.push({x:xc,z:ZE+3.9,r:2,what:'board'},{x:xc,z:ZE+1.4,r:Math.max(3,(x1-x0)/2),what:'wait'});
 G.traverse(m=>{if(m.isMesh)m.userData.noSeam=true});return{board,obs,props,lamps,g:G}}
