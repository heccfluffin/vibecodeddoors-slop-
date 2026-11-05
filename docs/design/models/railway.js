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
