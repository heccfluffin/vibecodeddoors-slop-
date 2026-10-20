/* =====================================================================================================
   The Old Quarry underground, batch 3 (second half): THE LEVEL 2 CAVE ROOMS (docs/design/quarry-underground.md).
   Needs quarry-under.js, -kit.js, -l1.js and -l2.js. ugPieceL2 calls ugCaveRoom(b, p, L, ctx, blob) for the crystal
   grotto, fungus grotto, flooded gallery, chasm hall and stalactite hall; each picks its version from the plan (p.d.v)
   and places its things in the piece's own coords. Positions of solid things and hazards come from the plan's
   versions (UGV, tested by quarry-under-check.js); scattered dressing keeps 3 m clear of every doorway and, for big
   things, 1.6 m clear of the straight ways between doorways. Big solid dressing (giant mushroom stems, roots) is also
   listed in ctx.solids (mine coords, {x, z, r}) for the game's walking.
   ===================================================================================================== */

/* ---------- materials ---------- */
{const k0=ugKit;ugKit=function(){const K=k0();if(K.l2r)return K;K.l2r=1;const M=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.9},o));
 /* soft round fade (mist), streaks for falling water, a spiral shell (fossils) */
 K.fadeT=ugCanvas(128,128,(k,w,h)=>{const g=k.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.6,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');k.fillStyle=g;k.fillRect(0,0,w,h)});
 K.fallT=ugCanvas(64,256,(k,w,h)=>{k.fillStyle='#000';k.fillRect(0,0,w,h);const r=ugRng(77);for(let i=0;i<70;i++){const x=r()*w,l=20+r()*90,y=r()*h;k.fillStyle='rgba(255,255,255,'+(.25+r()*.6)+')';k.fillRect(x,y,1+r()*2.5,l);k.fillRect(x,y-h,1+r()*2.5,l)}});
 K.fallT.repeat.set(2,1.5);
 K.ammoT=ugCanvas(128,128,(k,w,h)=>{k.fillStyle='#b8a888';k.fillRect(0,0,w,h);k.strokeStyle='#6a5a44';k.lineWidth=3;k.beginPath();for(let a=0;a<6*Math.PI;a+=.1){const r=3+a*3.1;k.lineTo(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r)}k.stroke();
  for(let a=.5;a<6*Math.PI;a+=.45){const r=3+a*3.1;k.beginPath();k.moveTo(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r);k.lineTo(w/2+Math.cos(a)*(r+8),h/2+Math.sin(a)*(r+8));k.stroke()}});
 Object.assign(K.mat,{
  selenite:new THREE.MeshStandardMaterial({color:0xf4f0e4,emissive:0x5a5448,emissiveIntensity:.6,roughness:.2,metalness:.05,flatShading:true}),
  mist:new THREE.MeshBasicMaterial({map:K.fadeT,color:0xe8f4ff,transparent:true,opacity:.28,depthWrite:false}),
  /* falling water: streaks (the game scrolls K.fallT.offset.y down, about 1.2 per second) */
  falls:new THREE.MeshBasicMaterial({color:0xcfe8f4,alphaMap:K.fallT,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide}),
  foam:new THREE.MeshBasicMaterial({map:K.fadeT,color:0xffffff,transparent:true,opacity:.7,depthWrite:false}),
  poolC:new THREE.MeshStandardMaterial({color:0x38c8f0,emissive:0x1a90c0,emissiveIntensity:.8,roughness:.1,transparent:true,opacity:.7,depthWrite:false,normalMap:K.poolN,normalScale:new THREE.Vector2(.25,.25)}),
  poolT:new THREE.MeshStandardMaterial({color:0x2fb8a0,emissive:0x1a8a70,emissiveIntensity:.7,roughness:.1,transparent:true,opacity:.62,depthWrite:false,normalMap:K.poolN,normalScale:new THREE.Vector2(.25,.25)}),
  poolB:new THREE.MeshStandardMaterial({color:0x1c3e58,roughness:.12,metalness:.3,transparent:true,opacity:.66,depthWrite:false,normalMap:K.poolN,normalScale:new THREE.Vector2(.3,.3)}),
  glowBed:new THREE.MeshBasicMaterial({color:0x6af0d0}),glowB:new THREE.MeshBasicMaterial({color:0x9ff8ff}),tipG:new THREE.MeshBasicMaterial({color:0xfff0a8}),
  moss:M({color:0x4a7a3a,roughness:1}),lily:M({color:0x3f8a3a,roughness:.7}),frog:M({color:0x5aa040,roughness:.6}),
  root:M({map:K.woodT,color:0xe8dcc0,roughness:.85}),bone:M({color:0xe0d4b4,roughness:.8}),puff:M({color:0xece4d2,roughness:1}),
  ammo:M({map:K.ammoT,roughness:.8})});
 for(const k in K.mat)K.mat[k].userData.ug=k;for(const k of['poolC','poolT','poolB'])K.mat[k].userData.ro=2;K.mat.mist.userData.ro=3;K.mat.falls.userData.ro=3;K.mat.foam.userData.ro=3;return K}}

/* ---------- helpers ---------- */
const ugProfY=(pr,r)=>{if(r>=1)return 0;for(let i=1;i<pr.length;i++)if(r>=pr[i][0]){const a=pr[i-1],c=pr[i],t=(r-a[0])/((c[0]-a[0])||1);return a[1]+(c[1]-a[1])*t}return pr[pr.length-1][1]};
const ugSegD=(x,z,a,c)=>{const vx=c[0]-a[0],vz=c[1]-a[1],l=vx*vx+vz*vz||1,t=Math.max(0,Math.min(1,((x-a[0])*vx+(z-a[1])*vz)/l));return Math.hypot(x-a[0]-vx*t,z-a[1]-vz*t)};
/* clip a polygon by a convex one (Sutherland-Hodgman); both [[x,z]...], the clip polygon anticlockwise */
function ugClip(poly,clip){let out=poly;for(let i=0;i<clip.length;i++){const A=clip[i],B=clip[(i+1)%clip.length],inside=q=>(B[0]-A[0])*(q[1]-A[1])-(B[1]-A[1])*(q[0]-A[0])>=0;const inp=out;out=[];
  for(let k=0;k<inp.length;k++){const P=inp[k],Q=inp[(k+1)%inp.length],ip=inside(P),iq=inside(Q);if(ip)out.push(P);if(ip!=iq){const dx=Q[0]-P[0],dz=Q[1]-P[1],ex=B[0]-A[0],ez=B[1]-A[1],den=dx*ez-dz*ex;if(Math.abs(den)>1e-12){const t=((A[0]-P[0])*ez-(A[1]-P[1])*ex)/den;out.push([P[0]+dx*t,P[1]+dz*t])}}}if(!out.length)break}return out}
const ugArea=P=>{let a=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];a+=p[0]*q[1]-q[0]*p[1]}return a/2};
/* a basin made of overlapping ovals (each with its own depth profile), meshed in rings round a middle point c.
   Returns its outline (for the floor hole) and depthAt(x,z) */
function ugBasinShape(parts,c){let o=[];for(const P of parts)for(let i=0;i<72;i++){const a=i/72*Math.PI*2,x=P.cx+P.rx*Math.cos(a),z=P.cz+P.rz*Math.sin(a);if(parts.every(Q=>Q===P||Math.hypot((x-Q.cx)/Q.rx,(z-Q.cz)/Q.rz)>=1))o.push([x,z])}
 o.sort((a,b)=>Math.atan2(a[1]-c[1],a[0]-c[0])-Math.atan2(b[1]-c[1],b[0]-c[0]));
 const depthAt=(x,z)=>Math.min(...parts.map(P=>ugProfY(P.prof,Math.hypot((x-P.cx)/P.rx,(z-P.cz)/P.rz))));return{pts:o,depthAt,c}}
function ugBasin(L,B,o){const K=12,n=B.pts.length,pos=[],uv=[],idx=[];for(let k=0;k<=K;k++){const f=k/K;for(let i=0;i<n;i++){const q=B.pts[i],x=q[0]+(B.c[0]-q[0])*f,z=q[1]+(B.c[1]-q[1])*f;pos.push(x,k?B.depthAt(x,z):0,z);uv.push(x/2.5,z/2.5)}}
 for(let k=0;k<K;k++)for(let i=0;i<n;i++){const i2=(i+1)%n,a=k*n+i,b2=k*n+i2,c=(k+1)*n+i2,d=(k+1)*n+i;idx.push(a,c,b2,a,d,c)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 if(g.attributes.normal.getY(n*3)<0){const ix=g.index.array;for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t}g.computeVertexNormals()}L.geo(o.rock||'wet2',g,0,0,0);
 const sh=new THREE.Shape();B.pts.forEach((q,i)=>i?sh.lineTo(q[0],-q[1]):sh.moveTo(q[0],-q[1]));const sg=new THREE.ShapeGeometry(sh);sg.rotateX(-Math.PI/2);const pa=sg.attributes.position,su=[];for(let i=0;i<pa.count;i++)su.push(pa.getX(i)/6,pa.getZ(i)/6);sg.setAttribute('uv',new THREE.Float32BufferAttribute(su,2));L.geo(o.key||'pool',sg,0,o.surf,0)}
/* a rope or cable hanging between two local points with a sag */
function ugSag(L,key,a,c,sag,r,n){n=n||16;const P=[];for(let i=0;i<=n;i++){const t=i/n;P.push(new THREE.Vector3(a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t-sag*4*t*(1-t),a[2]+(c[2]-a[2])*t))}L.geo(key,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P),n*2,r,5,false),0,0,0);return P}
/* a box from point a to point b (local, [x,y,z]), w x h cross-section */
function ugBeam(L,key,a,c,w,h){const dx=c[0]-a[0],dy=c[1]-a[1],dz=c[2]-a[2],l=Math.hypot(dx,dy,dz),g=new THREE.BoxGeometry(w,h,l);g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(dx/l,dy/l,dz/l))));L.geo(key,g,(a[0]+c[0])/2,(a[1]+c[1])/2,(a[2]+c[2])/2)}

/* ---------- the rooms ---------- */
function ugCaveRoom(b,p,Lv,ctx,bl){const t=p.type,v=p.d.v||0,y=UGLY(Lv),rk=ugRK(Lv),R=ugRng(p.id*977+v*13+5),fx=k=>p.d.fx.filter(f=>f.k==k),f1=k=>fx(k)[0];
 const base={cx:bl.cx,cz:bl.cz,rx:bl.rx,rz:bl.rz},L0=ugLocal(b,p,y),doors=ugChamberShape(p,base).doors;
 const solid=(x,z,r)=>{const w=L0.pt(x,0,z);ctx.solids.push({x:w.x,z:w.z,r})},lamp=(x,yy,z,s)=>{const w=L0.pt(x,yy,z);ctx.lamps.push([w.x,w.y,w.z,s||1])};
 /* the straight ways between doorways (or from the only doorway to the middle) stay clear of big things */
 const ways=doors.length>1?doors.flatMap((a,i)=>doors.slice(i+1).map(c=>[[a.x,a.z],[c.x,c.z]])):[[[doors[0].x,doors[0].z],[bl.cx,bl.cz]]];
 const onWay=(x,z,m)=>ways.some(w=>ugSegD(x,z,w[0],w[1])<(m||1.6)),nearDoor=(x,z,d)=>doors.some(q=>Math.hypot(q.x-x,q.z-z)<(d||3));
 const scatter=(n,cx,cz,rx,rz,minD,big,also)=>{const o=[];for(let k=0;o.length<n&&k<n*60;k++){const a=R()*6.28,r=Math.sqrt(R()),x=cx+Math.cos(a)*rx*r,z=cz+Math.sin(a)*rz*r;
   if(nearDoor(x,z)||(big&&onWay(x,z))||o.some(q=>Math.hypot(q[0]-x,q[1]-z)<minD)||(also&&also(x,z)))continue;o.push([x,z])}return o};
 const room=o=>ugChamber(b,p,Lv,ctx,Object.assign({},base,o));
 const drips=(ch,n,key,rmax)=>{for(let i=0;i<n;i++){const a=R()*6.28,r=Math.sqrt(R())*.85,x=bl.cx+Math.cos(a)*bl.rx*r,z=bl.cz+Math.sin(a)*bl.rz*r;ugDrip(ch.L,x,z,.06+R()*(rmax||.12),.3+R()*1.1,ch.roofAt(x,z),true,key)}};

 /* ====== CRYSTAL GROTTO ====== */
 if(t=='crystal'){const wf=f1('water');const pick=()=>{const r=R();return r<.45?'cr':r<.75?'ag':'au'};
  const ch=room({dome:v==2?5.6:v==4?4.2:3.6,pits:v==1?[{cx:wf.cx,cz:wf.cz,rx:wf.rx,rz:wf.rz}]:[],pick}),L=ch.L;
  const clusters=(pts,s0,s1,key,lit)=>pts.forEach((q,i)=>{const s=s0+R()*(s1-s0);ugCrystals(L,R,q[0],q[1],s,key);if(lit&&i<lit)lamp(q[0],.8,q[1],1.1)});
  /* crystals at the foot of the walls, all round */
  const wall=(n,key)=>{for(let i=0;i<n;i++){const a=R()*6.28,w=ch.wallPt(a,.3);if(nearDoor(w.x,w.z,3.2))continue;ugCrystals(L,R,w.x-w.nx*.25,w.z-w.nz*.25,.6+R()*.7,key)}};
  if(v==0){const sp=f1('spots');clusters(scatter(sp.n,sp.dx||0,sp.cz,sp.rx,sp.rz,1.5,true),.6,1.5,'crystal',4);wall(10,'crystal')}
  if(v==1){/* the glowing pool: shallow enough to wade, lit from inside; crystals round it and under its edge */
   ugPool(L,wf,{prof:[[1,0],[.95,-.2],[.8,-.42],[.5,-.58],[0,-.62]],surf:-.05,dep:.62,key:'poolC',rock:'wet2'});lamp(wf.cx,.2,wf.cz,1.6);
   const rs=f1('ringspots');for(let i=0;i<rs.n;i++){const a=i/rs.n*6.28+R()*.2,x=rs.cx+Math.cos(a)*rs.rx,z=rs.cz+Math.sin(a)*rs.rz;if(nearDoor(x,z,2.4))continue;ugCrystals(L,R,x,z,.7+R()*.6,'crystal')}
   for(let i=0;i<9;i++){const a=R()*6.28,r=.72+R()*.12,x=wf.cx+Math.cos(a)*wf.rx*r,z=wf.cz+Math.sin(a)*wf.rz*r;ugCrystals(L,R,x,z,.4+R()*.3,'crystal',ugProfY([[1,0],[.95,-.2],[.8,-.42],[.5,-.58],[0,-.62]],r))}wall(6,'crystal')}
  if(v==2){/* selenite beams across the cave: one to climb over, one to duck under, one high; ends sunk into the walls */
   const hs=[[2.6,3.4],[2.9,4.3],[3.6,5]],rs=[.42,.34,.5];f1('beams').ls.forEach((l,i)=>{const [a,c]=l,dx=c[0]-a[0],dz=c[1]-a[1],n=Math.hypot(dx,dz),ux=dx/n,uz=dz/n,h=hs[i%3];
    const A=[a[0]-ux*3,h[0]-(h[1]-h[0])*3/n,a[1]-uz*3],C=[c[0]+ux*3,h[1]+(h[1]-h[0])*3/n,c[1]+uz*3],g=new THREE.CylinderGeometry(rs[i%3],rs[i%3],Math.hypot(C[0]-A[0],C[1]-A[1],C[2]-A[2]),6);
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(C[0]-A[0],C[1]-A[1],C[2]-A[2]).normalize())));L.geo('selenite',g,(A[0]+C[0])/2,(A[1]+C[1])/2,(A[2]+C[2])/2);
    const m=[(a[0]+c[0])/2,(a[1]+c[1])/2];lamp(m[0],(h[0]+h[1])/2+.6,m[1],.9)});
   clusters(scatter(7,0,bl.cz,5.5,7,2,true),.5,1,'selenite',0);wall(5,'selenite')}
  if(v==3){/* frost: pale crystals, icicles, a cold mist at knee height */
   const sp=f1('spots');clusters(scatter(sp.n,0,sp.cz,sp.rx,sp.rz,1.4,true),.5,1.2,'frost',3);wall(8,'frost');drips(ch,26,'frost',.08);
   const mi=f1('mist');for(const [yy,s] of[[.18,1],[.42,.9],[.68,.75]])L.geo('mist',new THREE.CircleGeometry(1,40).rotateX(-Math.PI/2),mi.cx,yy,mi.cz,0,0,0,mi.rx*s,1,mi.rz*s)}
  if(v==4){/* huge six-sided crystal columns from floor to roof */
   const cf=f1('cols');cf.pts.forEach((q,i)=>{const tp=ch.roofAt(q[0],q[1])+.9,g=new THREE.CylinderGeometry(cf.r*.85,cf.r,tp+.1,6);L.geo('crystal',g,q[0],(tp+.1)/2-.1,q[1],R()*1.05);ugCrystals(L,R,q[0]+cf.r,q[1],.6,'crystal');if(i<2)lamp(q[0],1.4,q[1],1.2)});wall(6,'crystal')}
  return true}

 /* ====== FUNGUS GROTTO ====== */
 if(t=='fungus'){const wf=f1('water'),led=f1('ledge');
  const ch=room({dome:5,pits:v==2?[{cx:wf.cx,cz:wf.cz,rx:wf.rx,rz:wf.rz}]:[],pick:()=>{const r=R();return r<.35?'ag':r<.5?'au':r<.75?'fe':'cu'}}),L=ch.L;
  const giants=(pts,key)=>pts.forEach((q,i)=>{const cr=1.3+R()*.8,a=R()*6.28,rf=Math.min(ch.roofAt(q[0],q[1]),ch.roofAt(q[0]+Math.cos(a)*(cr+.5),q[1]+Math.sin(a)*(cr+.5))),h=Math.max(2.4,Math.min(3+R()*1.4,rf-.7-.45*cr)),top=ugMushroom(L,R,q[0],q[1],h,cr,key,[Math.cos(a)*.5,Math.sin(a)*.5]);solid(q[0],q[1],.4);if(i<4)lamp(top[0],top[1]-.5,top[2],1)});
  const smalls=(pts,key,s0,s1)=>pts.forEach(q=>{const n=2+(R()*3|0);for(let k=0;k<n;k++){const h=s0+R()*(s1-s0);ugMushroom(L,R,q[0]+(R()-.5)*.8,q[1]+(R()-.5)*.8,h,h*.45+R()*.1,key,[(R()-.5)*.2,(R()-.5)*.2])}});
  const moss=(pts)=>pts.forEach(q=>{const g=new THREE.CircleGeometry(1,10);const pa=g.attributes.position;for(let i=1;i<pa.count;i++){const k=.7+R()*.5;pa.setXY(i,pa.getX(i)*k,pa.getY(i)*k)}g.rotateX(-Math.PI/2);L.geo('moss',g,q[0],.012,q[1],R()*6,0,0,.6+R()*.7,1,.5+R()*.6)});
  const glowworms=n=>{for(let i=0;i<n;i++){const a=R()*6.28,r=Math.sqrt(R())*.9,x=bl.cx+Math.cos(a)*bl.rx*r,z=bl.cz+Math.sin(a)*bl.rz*r,rf=ch.roofAt(x,z),l=.12+R()*.3;
   L.cyl('stem',.004,.004,l+1,x,rf-l/2+.5,z,3);L.geo('glowB',new THREE.SphereGeometry(.028,6,4),x,rf-l,z)}};
  const vines=n=>{for(let i=0;i<n;i++){const a=R()*6.28,w=ch.wallPt(a,3.4);if(nearDoor(w.x,w.z,3))continue;const l=1+R()*1.8,P=[];for(let k=0;k<=5;k++)P.push(new THREE.Vector3(w.x-w.nx*(.05+k*.05)+Math.sin(k*1.7+i)*.12,3.9-l*k/5,w.z-w.nz*(.05+k*.05)+Math.cos(k*1.3+i)*.12));L.geo('moss',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P),12,.035,4,false),0,0,0)}};
  if(v==0){const pk=fx('spots').find(f=>f.c=='#e58ae0'),gr=fx('spots').find(f=>f.c!='#e58ae0');const big=scatter(6,0,pk.cz,pk.rx*.72,pk.rz*.72,3.2,true);giants(big,'capP');
   smalls(scatter(10,0,pk.cz,pk.rx,pk.rz,1.4,true,(x,z)=>big.some(q=>Math.hypot(q[0]-x,q[1]-z)<2)),'capP',.5,1.3);smalls(scatter(6,0,gr.cz,gr.rx,gr.rz,1.6,false),'capG',.2,.5);moss(scatter(gr.n,0,gr.cz,gr.rx,gr.rz,1.2,false));vines(14);glowworms(90)}
  if(v==1){/* puffballs as big as cars, and small ones round them */
   for(const q of f1('puff').pts){const g=new THREE.IcosahedronGeometry(1.55,2),pa=g.attributes.position;for(let i=0;i<pa.count;i++){const w=L0.pt(q[0]+pa.getX(i),pa.getY(i),q[1]+pa.getZ(i)),k=.94+.12*ugNoise(w.x*2,w.y*2,w.z*2);pa.setXYZ(i,pa.getX(i)*k,pa.getY(i)*k,pa.getZ(i)*k)}g.computeVertexNormals();L.geo('puff',g,q[0],1.55*.78-.12,q[1],R()*3,0,0,1,.78,1)}
   for(const q of scatter(14,0,bl.cz,7.5,7.5,1,false,(x,z)=>f1('puff').pts.some(p2=>Math.hypot(p2[0]-x,p2[1]-z)<2.1))){const r=.2+R()*.35;L.geo('puff',new THREE.SphereGeometry(r,10,8),q[0],r*.75,q[1],0,0,0,1,.8,1)}
   smalls(scatter(6,0,bl.cz,8,8,2,true),'capP',.3,.8);for(const q of f1('puff').pts.slice(0,3))lamp(q[0],3,q[1],.8);glowworms(40)}
  if(v==2){/* the glow pond: lit from below, lily pads, mushrooms round the edge, frogs */
   ugPool(L,wf,{bowl:1,surf:-.2,dep:2,key:'poolT',rock:'wet2',layers:false});L.geo('glowBed',new THREE.CircleGeometry(1,24).rotateX(-Math.PI/2),wf.cx,-1.6,wf.cz,0,0,0,wf.rx*.35,1,wf.rz*.35);lamp(wf.cx,-.3,wf.cz,1.8);
   const lp=fx('spots').find(f=>f.c=='#5fbf6a');const pads=[];for(let k=0;pads.length<lp.n&&k<300;k++){const a=R()*6.28,r=Math.sqrt(R())*.8,x=wf.cx+Math.cos(a)*wf.rx*r,z=wf.cz+Math.sin(a)*wf.rz*r;if(pads.some(q=>Math.hypot(q[0]-x,q[1]-z)<1.2))continue;pads.push([x,z])}
   pads.forEach((q,i)=>{const r=.35+R()*.3;L.geo('lily',new THREE.CircleGeometry(r,16,.4,Math.PI*2-.5).rotateX(-Math.PI/2),q[0],-.185,q[1],R()*6);if(i<3){L.geo('frog',new THREE.SphereGeometry(.13,10,8),q[0],-.12,q[1],0,0,0,1,.7,1.2);for(const sd of[-.06,.06])L.geo('frog',new THREE.SphereGeometry(.04,8,6),q[0]+sd,-.05,q[1]-.08)}});
   const rs=f1('ringspots');for(let i=0;i<rs.n;i++){const a=i/rs.n*6.28,x=rs.cx+Math.cos(a)*rs.rx,z=rs.cz+Math.sin(a)*rs.rz;if(nearDoor(x,z,2.6)||onWay(x,z,1.2))continue;const h=.7+R()*1.4;ugMushroom(L,R,x,z,h,h*.4+.1,'capP',[Math.cos(a)*.15,Math.sin(a)*.15])}glowworms(60)}
  if(v==3){/* the shelf-fungus wall: shelves like steps up to a high ledge with gold */
   const x0=Math.min(led.x0,led.x1),x1=Math.max(led.x0,led.x1),side=x0>0?1:-1,face=side>0?x0:x1,lh=2.7,w=5.2;const lx=side>0?(face+w/2):(face-w/2);
   L.box(rk,w,lh,led.z1-led.z0,lx,lh/2,(led.z0+led.z1)/2,0);L.box(ugFL(Lv),w-.1,.02,led.z1-led.z0-.1,lx,lh+.01,(led.z0+led.z1)/2,0);
   for(let i=0;i<6;i++){const yy=.45*(i+1),z=led.z1-.6-i*(led.z1-led.z0-1.2)/5,g=new THREE.CylinderGeometry(.72,.8,.15,16,1,false,side>0?Math.PI:0,Math.PI);L.geo('capT',g,face,yy-.075,z)}
   for(let i=0;i<5;i++){const a=Math.atan2((led.z0+led.z1)/2-bl.cz+(i-2)*.9,side*bl.rx),w2=ch.wallPt(a,lh+.5+R()*.8);ctx.veins.push((()=>{const W=L0.pt(w2.x+w2.nx*.06,w2.y,w2.z+w2.nz*.06),d=L0.dir(-w2.nx,-w2.nz);return{x:W.x,y:W.y,z:W.z,dx:d[0],dz:d[1],t:'au'}})())}
   const pk=fx('spots').find(f=>f.c=='#e58ae0');smalls(scatter(8,pk.dx||0,pk.cz,pk.rx,pk.rz,1.6,true,(x,z)=>x*side>face*side-1.2),'capP',.5,1.4);giants(scatter(2,-side*3,bl.cz,3,5,4,true,(x,z)=>x*side>face*side-2.5),'capP');glowworms(50)}
  if(v==4){/* the root hall: thick pale roots from the roof to the floor, thinner ones ending in glowing tips */
   const cf=f1('cols');for(const q of cf.pts){const tp=ch.roofAt(q[0],q[1])+1,P=[];for(let k=0;k<=6;k++){const f=k/6;P.push(new THREE.Vector3(q[0]+Math.sin(f*4+q[0])*.25,tp-(tp+.15)*f,q[1]+Math.cos(f*3+q[1])*.25))}
    L.geo('root',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P),24,cf.r*.7,8,false),0,0,0);L.geo('root',new THREE.ConeGeometry(cf.r*1.3,.6,8),P[6].x,.25,P[6].z);solid(q[0],q[1],cf.r)}
   for(let i=0;i<16;i++){const a=R()*6.28,r=Math.sqrt(R())*.85,x=bl.cx+Math.cos(a)*bl.rx*r,z=bl.cz+Math.sin(a)*bl.rz*r,rf=ch.roofAt(x,z),l=1+R()*1.8;
    L.cyl('root',.03,.1,l+1,x,rf-l/2+.5,z,6);L.geo('tipG',new THREE.SphereGeometry(.07,8,6),x,rf-l,z);if(i<4)lamp(x,rf-l-.2,z,.7)}
   smalls(scatter(6,0,bl.cz,8,8,2,false),'capG',.2,.5);moss(scatter(10,0,bl.cz,8,8,1.4,false))}
  return true}

 /* ====== FLOODED GALLERY ====== */
 if(t=='flooded'){const ws=fx('water'),pk=()=>{const r=R();return r<.4?'ag':r<.6?'au':r<.8?'fe':'cu'};
  if(v==3){/* the waterfall gallery: a plunge pool and a wading channel joined into one basin */
   const deep=ws.find(w=>w.deep),sh=ws.find(w=>!w.deep);const B=ugBasinShape([{cx:deep.cx,cz:deep.cz,rx:deep.rx,rz:deep.rz,prof:[[1,0],[.92,-.35],[.7,-1.2],[.35,-2],[0,-2.2]]},{cx:sh.cx,cz:sh.cz,rx:sh.rx,rz:sh.rz,prof:[[1,0],[.95,-.25],[.88,-.42],[0,-.45]]}],[(deep.cx+sh.cx)/2,deep.cz]);
   const ch=room({dome:3,holes:[B.pts],pick:pk}),L=ch.L;ugBasin(L,B,{surf:-.04,key:'pool'});
   for(const f of[.3,.55,.8]){const d=-.04+(-2.2+.04)*f,pr=[[1,0],[.92,-.35],[.7,-1.2],[.35,-2],[0,-2.2]];let r=0;for(let i=1;i<pr.length;i++)if(d>=pr[i][1]){r=pr[i-1][0]+(pr[i][0]-pr[i-1][0])*(d-pr[i-1][1])/(pr[i][1]-pr[i-1][1]);break}if(r>.05)L.geo('poolD',new THREE.CircleGeometry(1,40).rotateX(-Math.PI/2),deep.cx,d,deep.cz,0,0,0,deep.rx*r*1.03,1,deep.rz*r*1.03)}
   const fl=f1('falls'),w=ch.wallPt(Math.atan2(fl.z-bl.cz,fl.x-bl.cx),3.3),fw=2.1,top=3.3;
   L.box('black',fw+.3,.45,.7,w.x+w.nx*.38,top+.1,w.z+w.nz*.38,Math.atan2(w.nx,w.nz));
   const g=new THREE.PlaneGeometry(fw,top+.1,1,6),pa=g.attributes.position;for(let i=0;i<pa.count;i++){const yy=pa.getY(i)+(top+.1)/2,k=Math.pow(1-yy/(top+.1),1.6)*.55;pa.setZ(i,k)}g.computeVertexNormals();
   L.geo('falls',g,w.x-w.nx*.3,(top+.1)/2-.06,w.z-w.nz*.3,Math.atan2(-w.nx,-w.nz));L.geo('foam',new THREE.CircleGeometry(1.2,20).rotateX(-Math.PI/2),w.x-w.nx*.95,-.02,w.z-w.nz*.95);
   for(const [yy,s] of[[.4,1.4],[1,1.1]])L.geo('mist',new THREE.CircleGeometry(1,24).rotateX(-Math.PI/2),w.x-w.nx*1.1,yy,w.z-w.nz*1.1,0,0,0,s,1,s);
   return true}
  const wf=ws[0],pf={0:[[1,0],[.96,-.25],[.9,-.42],[0,-.45]],1:null,2:[[1,0],[.9,-.35],[.62,-.8],[.45,-.9],[0,-.9]]}[v];
  const ch=room({dome:2.8,pits:[{cx:wf.cx,cz:wf.cz,rx:wf.rx,rz:wf.rz}],pick:pk}),L=ch.L;
  if(v==0){ugPool(L,wf,{prof:pf,surf:-.04,dep:.45,key:'pool',rock:'wet2'});
   /* the plank walkway along one side, on posts standing in the water's edge */
   const wk=f1('walk'),a=wk.pts[0],c=wk.pts[1],dd=(x,z)=>ugProfY(pf,Math.hypot((x-wf.cx)/wf.rx,(z-wf.cz)/wf.rz));
   for(let z=a[1]-.15;z>c[1]+.15;z-=.3)L.box('woodD',.95,.05,.26,a[0],.3,z,0);for(let z=a[1]-.4;z>c[1];z-=1.8)for(const sd of[-.42,.42]){const bt=dd(a[0]+sd,z)-.05;L.box('wood',.1,.27-bt,.1,a[0]+sd,(.27+bt)/2,z,0)}
   for(const sd of[-.42,.42])L.box('wood',.08,.08,Math.abs(c[1]-a[1])-.2,a[0]+sd,.235,(a[1]+c[1])/2,0)}
  if(v==1){/* the underground lake: deep; a rope across it and a raft that runs along the rope */
   ugPool(L,wf,{bowl:1,surf:-.25,dep:3,key:'poolB',rock:'wet2',prof:[[1,0],[.95,-.3],[.85,-.9],[.6,-2],[.3,-2.8],[0,-3]]});
   const rp=f1('rope').pts,rf=f1('raft'),A=[rp[0][0],1.2,rp[0][1]],C=[rp[1][0],1.2,rp[1][1]];for(const q of[A,C])L.cyl('woodD',.1,.12,1.5,q[0],.7,q[2],8);ugSag(L,'rope',A,C,.45,.025,30);
   for(let i=0;i<8;i++)L.box('wood',2.2,.07,.24,rf.x,.05,rf.z-.95+i*.27,0);for(const sd of[-.75,.75])L.box('woodD',.12,.12,2.2,rf.x+sd,-.03,rf.z,0);
   for(const [sx,sz] of[[-.6,-.6],[.6,-.6],[-.6,.6],[.6,.6]])L.cyl('dark',.26,.26,.9,rf.x+sx,-.25,rf.z+sz,12,0,Math.PI/2,0);L.cyl('woodD',.05,.05,1.3,rf.x+.9,.7,rf.z,6);L.geo('steel',new THREE.TorusGeometry(.08,.02,6,12),rf.x+.9,1.2,rf.z,0,0,Math.PI/2)}
  if(v==2){/* the drowned drift: timber sets standing in the water, rails along the bottom, a sunken cart */
   ugPool(L,wf,{prof:pf,surf:-.04,dep:.9,key:'pool',rock:'wet2'});const dd=(x,z)=>ugProfY(pf,Math.hypot((x-wf.cx)/wf.rx,(z-wf.cz)/wf.rz));
   const sp=f1('sets').pts;for(let z=sp[0][1]-1.5;z>sp[1][1]+1;z-=3){const b0=Math.min(dd(-2.1,z),dd(2.1,z))-.1;for(const sd of[-2.1,2.1]){const bt=dd(sd,z)-.08;L.box('wood',.22,2.7-bt,.22,sd,(2.7+bt)/2,z,0)}L.box('wood',4.5,.24,.24,0,2.8,z,0)}
   const rl=f1('rail').pts,P3=[];for(let z=rl[0][1];z>=rl[1][1]-.01;z-=.5){const w=L0.pt(0,dd(0,z),z);P3.push([w.x,w.y,w.z])}const tr=ugTube(ugNull,P3,{fil:0,sets:false});ugRails(b,tr,null);   /* old rails just end: no buffers */
   const ct=[1.6,-13],cy=dd(ct[0],ct[1]);L.box('steel',.9,.6,1.3,ct[0],cy+.42,ct[1],.4,0,.22);L.box('oreRock',.8,.1,1.2,ct[0]+.06,cy+.7,ct[1],.4,0,.22);for(const sx of[-.35,.35])L.cyl('rail',.16,.16,.08,ct[0]+sx*Math.cos(.4),cy+.1+sx*.2,ct[1]-sx*Math.sin(.4),12,.4,0,Math.PI/2)}
  return true}

 /* ====== CHASM HALL ====== */
 if(t=='chasm'){const cf=f1('chasm'),D=9,pk=()=>{const r=R();return r<.35?'ag':r<.55?'au':r<.65?'cr':'fe'};
  /* the fissure: its centre line runs into the walls, or tapers to nothing where it ends inside the cave */
  const inE=q=>Math.hypot((q[0]-bl.cx)/bl.rx,(q[1]-bl.cz)/bl.rz)<.9;let cl=cf.pts.map(q=>q.slice());const ext=(a,c,ln)=>{const dx=a[0]-c[0],dz=a[1]-c[1],l=Math.hypot(dx,dz);return[a[0]+dx/l*ln,a[1]+dz/l*ln]};
  const t0=inE(cl[0]),t1=inE(cl[cl.length-1]);if(!t0)cl.unshift(ext(cl[0],cl[1],3));else cl.unshift(ext(cl[0],cl[1],1.3));if(!t1)cl.push(ext(cl[cl.length-1],cl[cl.length-2],3));else cl.push(ext(cl[cl.length-1],cl[cl.length-2],1.3));
  const P=[];for(let i=1;i<cl.length;i++){const a=cl[i-1],c=cl[i],n=Math.max(1,Math.ceil(Math.hypot(c[0]-a[0],c[1]-a[1])/.6));for(let k=i==1?0:1;k<=n;k++)P.push([a[0]+(c[0]-a[0])*k/n,a[1]+(c[1]-a[1])*k/n])}
  const S=[0];for(let i=1;i<P.length;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const Ln=S[S.length-1];
  const hw=i=>{let k=1;if(t0)k=Math.min(k,Math.max(0,S[i])/1.3);if(t1)k=Math.min(k,(Ln-S[i])/1.3);const w0=L0.pt(P[i][0],0,P[i][1]);return cf.w/2*Math.sqrt(Math.max(0,k))*(.85+.3*ugNoise(w0.x*.7,0,w0.z*.7))};
  const Lf=[],Rt=[];for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],c=P[Math.min(P.length-1,i+1)];let tx=c[0]-a[0],tz=c[1]-a[1];const l=Math.hypot(tx,tz);tx/=l;tz/=l;const h=hw(i);Lf.push([P[i][0]-tz*h,P[i][1]+tx*h]);Rt.push([P[i][0]+tz*h,P[i][1]-tx*h])}
  let hole=Lf.concat(Rt.reverse());if(ugArea(hole)<0)hole.reverse();const ell=[];for(let i=0;i<64;i++){const a=i/64*Math.PI*2;ell.push([bl.cx+(bl.rx-.1)*Math.cos(a),bl.cz+(bl.rz-.1)*Math.sin(a)])}if(ugArea(ell)<0)ell.reverse();
  hole=ugClip(hole,ell).filter((q,i,A)=>Math.hypot(q[0]-A[(i+1)%A.length][0],q[1]-A[(i+1)%A.length][1])>.02);
  const ch=room({dome:4.2,holes:[hole],pick:pk}),L=ch.L;
  /* the fissure's sides: rough rock going down 9 m, facing into the gap; darkness at the bottom */
  {const n=hole.length,rows=[0,-.5,-1.3,-2.3,-3.5,-5,-7,-D],pos=[],uv=[],idx=[],ar=ugArea(hole)>0;let s=0;const cols=[];for(let i=0;i<n;i++){const a=hole[(i+n-1)%n],c=hole[(i+1)%n];let ux=c[0]-a[0],uz=c[1]-a[1];const l=Math.hypot(ux,uz)||1;cols.push({x:hole[i][0],z:hole[i][1],ox:(ar?uz:-uz)/l,oz:(ar?-ux:ux)/l,s});s+=Math.hypot(hole[(i+1)%n][0]-hole[i][0],hole[(i+1)%n][1]-hole[i][1])}
   for(const c of cols)for(const yy of rows){const w=L0.pt(c.x,yy,c.z),d=.45*Math.min(1,-yy/.8)*ugNoise(w.x,w.y,w.z);pos.push(c.x+c.ox*d,yy,c.z+c.oz*d);uv.push(c.s/3,yy/3)}
   const m=rows.length;for(let i=0;i<n;i++){const i2=(i+1)%n;for(let j=0;j<m-1;j++){const a=i*m+j,b2=i2*m+j,c=i2*m+j+1,d=i*m+j+1;idx.push(a,b2,c,a,c,d)}}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
   /* make sure the sides face into the gap */{const nA=g.attributes.normal;let sm=0;for(let i=0;i<n;i++)sm+=nA.getX(i*m+3)*-cols[i].ox+nA.getZ(i*m+3)*-cols[i].oz;if(sm<0){const ix=g.index.array;for(let i=0;i<ix.length;i+=3){const tt=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=tt}g.computeVertexNormals()}}
   L.geo(rk,g,0,0,0);const sh=new THREE.Shape();hole.forEach((q,i)=>i?sh.lineTo(q[0],-q[1]):sh.moveTo(q[0],-q[1]));const bg=new THREE.ShapeGeometry(sh);bg.rotateX(-Math.PI/2);L.geo('black',bg,0,-D+.2,0)}
  const bridge=(f,broken)=>{const dx=f.x1-f.x0,dz=f.z1-f.z0,l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l,rx2=uz,rz2=-ux,yaw=Math.atan2(dx,dz);
   /* the end that sits on firm floor (farther from the fissure's centre line) carries the posts */
   const cd=(x,z)=>Math.min(...cf.pts.slice(1).map((q,i)=>ugSegD(x,z,cf.pts[i],q)));const sw=broken&&cd(f.x0,f.z0)<cd(f.x1,f.z1);const a=sw?[f.x1,f.z1]:[f.x0,f.z0],c=sw?[f.x0,f.z0]:[f.x1,f.z1],du=sw?-1:1;
   const sag=broken?0:.28,dy=s=>-sag*4*(s/l)*(1-s/l);for(let s=.12;s<l;s+=.32)L.box('woodD',1.1,.05,.24,a[0]+ux*du*s,.06+dy(s),a[1]+uz*du*s,yaw);
   for(const sd of[-.6,.6]){for(const e of broken?[0]:[0,l])L.box('wood',.12,1.15,.12,a[0]+ux*du*(e+(e?.25:-.25))+rx2*sd,.55,a[1]+uz*du*(e+(e?.25:-.25))+rz2*sd,yaw);
    const A=[a[0]-ux*du*.25+rx2*sd,1.05,a[1]-uz*du*.25+rz2*sd];const C=[c[0]+ux*du*(broken?0:.25)+rx2*sd,broken?.4:1.05,c[1]+uz*du*(broken?0:.25)+rz2*sd];ugSag(L,'rope',A,C,broken?.1:.32,.022,16);
    /* the two ropes the planks lie on, sagging with them */ugSag(L,'rope',[a[0]-ux*du*.25+rx2*sd*.92,.035,a[1]-uz*du*.25+rz2*sd*.92],[c[0]+ux*du*(broken?0:.25)+rx2*sd*.92,.035,c[1]+uz*du*(broken?0:.25)+rz2*sd*.92],sag*(l+.5)/l,.02,16)}
   if(broken){/* the broken end hangs down into the gap: planks on two ropes */for(let k=0;k<8;k++){const yy=-.25-k*.32;L.box('woodD',1.0,.24,.05,c[0]+ux*du*.05,yy,c[1]+uz*du*.05,yaw)}for(const sd of[-.45,.45])L.cyl('rope',.02,.02,2.7,c[0]+rx2*sd+ux*du*.08,-1.25,c[1]+rz2*sd+uz*du*.08,5)}};
  if(v==0||v==1){if(v==0)bridge(f1('bridge'),false);else fx('bridge').forEach(f=>bridge(f,true));
   for(const q of fx('stones').flatMap(f=>f.pts)){const g=new THREE.CylinderGeometry(.5,.75,D,7,4);const pa=g.attributes.position;for(let i=0;i<pa.count;i++){const yy=pa.getY(i);if(yy<D/2-.01){const w=L0.pt(q[0]+pa.getX(i),yy,q[1]+pa.getZ(i)),k=.85+.3*ugNoise(w.x,w.y,w.z);pa.setX(i,pa.getX(i)*k);pa.setZ(i,pa.getZ(i)*k)}}g.computeVertexNormals();L.geo(rk,g,q[0],-D/2+.03,q[1],R()*3)}}
  if(v==2){/* the miners' timber trestle: a deck with rails, bents going down into the gap */
   const f=f1('trestle'),dx=f.x1-f.x0,dz=f.z1-f.z0,l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l,rx2=uz,rz2=-ux,yaw=Math.atan2(dx,dz);
   for(const sd of[-.75,.75])L.box('wood',.24,.24,l,f.x0+dx/2+rx2*sd,.0,f.z0+dz/2+rz2*sd,yaw);for(let s=.15;s<l;s+=.35)L.box('woodD',2.0,.06,.24,f.x0+ux*s,.15,f.z0+uz*s,yaw);
   const A=L0.pt(f.x0,.18,f.z0),C=L0.pt(f.x1,.18,f.z1);ugRailLine(b,[[A.x,A.z],[C.x,C.z]],y+.18,ctx,0);
   for(let s=1.2;s<l-1;s+=1.6){const x=f.x0+ux*s,z=f.z0+uz*s;for(const sd of[-.75,.75])L.box('wood',.24,D,.24,x+rx2*sd,-D/2-.1,z+rz2*sd,yaw);for(let yy=-1.8;yy>-D;yy-=2.4){L.box('wood',1.8,.2,.2,x,yy,z,yaw+Math.PI/2);ugBeam(L,'woodD',[x-rx2*.75,yy,z-rz2*.75],[x+rx2*.75,yy-2.2,z+rz2*.75],.12,.12)}}}
  if(v==3){/* a rusty zip line: a tall frame on this side, a lower one on the far side, a handle on a pulley */
   const zp=f1('zip').pts,A=zp[0],C=zp[1],dx=C[0]-A[0],dz=C[1]-A[1],l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l,rx2=uz,rz2=-ux;
   const frame=(q,h)=>{for(const sd of[-.7,.7])ugBeam(L,'wood',[q[0]+rx2*sd,-.05,q[1]+rz2*sd],[q[0]+rx2*sd*.15,h,q[1]+rz2*sd*.15],.16,.16);L.box('wood',.5,.2,.3,q[0],h,q[1],Math.atan2(dx,dz));ugBeam(L,'wire',[q[0]-ux*.1,h,q[1]-uz*.1],[q[0]-ux*1.6,-.02,q[1]-uz*1.6],.03,.03);L.cyl('steel',.08,.08,.3,q[0]-ux*1.6,.1,q[1]-uz*1.6,8)};
   frame(A,3.2);frame(C,2.3);const cab=ugSag(L,'steel',[A[0],3.25,A[1]],[C[0],2.35,C[1]],.25,.018,20);const hp=cab[2];
   L.cyl('dark',.09,.09,.06,hp.x,hp.y-.02,hp.z,12,Math.atan2(dx,dz),0,Math.PI/2);L.cyl('steel',.015,.015,1.1,hp.x,hp.y-.6,hp.z,6);L.cyl('woodD',.04,.04,.7,hp.x,hp.y-1.15,hp.z,8,Math.atan2(dx,dz)+Math.PI/2,0,Math.PI/2)}
  return true}

 /* ====== STALACTITE HALL ====== */
 if(t=='hall'){const pk=()=>{const r=R();return r<.4?'ag':r<.55?'au':r<.65?'cr':r<.85?'fe':'cu'};
  const dome=v==2?7.5:v==4?6.5:4.4;
  if(v==1){/* rimstone terraces: pools rimmed with stone stepping up towards the back, water brim-full in each */
   const tf=f1('terraces'),pools=[];for(let k=0;k<tf.n;k++){const z=tf.cz+tf.rz*.7-k*(tf.rz*1.4/(tf.n-1)),x=(k%2?1:-1)*1.4;pools.push({cx:x,cz:z,rx:3.6,rz:1.3,h:.14+.09*k})}
   const ch=room({dome,pits:pools.map(q=>({cx:q.cx,cz:q.cz,rx:q.rx*.99,rz:q.rz*.99})),pick:pk}),L=ch.L;
   for(const q of pools){const pr=[[1,0],[.95,-.12],[.8,-.22],[0,-.26]];ugPool(L,{cx:q.cx,cz:q.cz,rx:q.rx*.99,rz:q.rz*.99},{prof:pr,surf:q.h-.035,dep:.26,key:'pool',rock:'wet2',sr:.985});
    const tg=new THREE.TorusGeometry(1,.075,8,72);tg.rotateX(Math.PI/2);const sy=(q.h+.12)/.15;tg.scale(q.rx,sy,q.rz);L.geo('flow',tg,q.cx,q.h-.075*sy,q.cz)}
   drips(ch,30,'flow',.1);return true}
  const fsl=v==3?f1('fossil').pts:null;const ch=room({dome,pick:pk,veinGap:v==4?4:2.8,noVein:fsl?(x,z)=>fsl.some((q,i)=>i&&ugSegD(x,z,fsl[i-1],q)<2.2):null}),L=ch.L;
  const mites=(n,near)=>{for(const q of scatter(n,0,bl.cz,bl.rx*.85,bl.rz*.85,.9,true,(x,z)=>near&&Math.hypot((x-bl.cx)/bl.rx,(z-bl.cz)/bl.rz)<.55))ugDrip(L,q[0],q[1],.12+R()*.16,.4+R()*1.1,0,false)};
  if(v==0){for(const f of fx('cols'))for(const q of f.pts)ugColumn(L,q[0],q[1],(f.r||1)*.8,ch.roofAt(q[0],q[1]),'flow',R);drips(ch,45,'flow',.14);mites(16,true);
   for(const q of scatter(5,0,bl.cz,bl.rx*.8,bl.rz*.8,3,true))ugPile(L,R,q[0],q[1],.8+R()*.5,.6+R()*.4,.35,'flow')}
  if(v==2){/* the cathedral: one giant fluted column under a huge dome */
   const cs=fx('cols');const big=cs.find(f=>f.r>2),sm=cs.find(f=>f.r<2);const q=big.pts[0],tp=ch.roofAt(q[0],q[1])+1.2,g=new THREE.CylinderGeometry(1,1,tp+.1,48,16,true),pa=g.attributes.position;
   for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i),yy=pa.getY(i)+(tp+.1)/2,f=yy/tp,a=Math.atan2(z,x),r=big.r*(.62+.38*Math.pow(Math.abs(f-.45)*1.9,1.5))*(1+.07*Math.sin(a*9+f*4))*(f<.06?1.2-f*3.3:1);pa.setX(i,Math.cos(a)*r);pa.setZ(i,Math.sin(a)*r)}g.computeVertexNormals();L.geo('flow',g,q[0],(tp+.1)/2-.1,q[1]);
   for(const q2 of sm.pts)ugColumn(L,q2[0],q2[1],sm.r*.8,ch.roofAt(q2[0],q2[1]),'flow',R);drips(ch,30,'flow',.16);mites(10,false)}
  if(v==3){/* the fossil wall: a giant skeleton half dug out of the cave wall, tools, and small fossils to take */
   const fp=f1('fossil').pts,ang=fp.map(q=>Math.atan2(q[1]-bl.cz,q[0]-bl.cx)),ys=[1.7,2.1,2.3,2.0];const sp=[];for(let i=0;i<fp.length-1;i++)for(let k=0;k<12;k++){const f=k/12;sp.push([ang[i]+(ang[i+1]-ang[i])*f,ys[i]+(ys[i+1]-ys[i])*f])}sp.push([ang[ang.length-1],ys[ys.length-1]]);
   const W=sp.map(([a,yy])=>ch.wallPt(a,yy));W.forEach((w,i)=>{const s2=i>W.length-10?.5+.05*(W.length-1-i):1,nb=W[Math.min(W.length-1,i+1)],pb=W[Math.max(0,i-1)];
    L.geo('bone',new THREE.CylinderGeometry(.12*s2,.12*s2,.17*s2,10).applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(nb.x-pb.x,nb.y-pb.y,nb.z-pb.z).normalize()))),w.x-w.nx*.05,w.y,w.z-w.nz*.05);
    if(i%2==0)L.geo('bone',new THREE.BoxGeometry(.06,.14*s2,.06),w.x-w.nx*.05,w.y+.16*s2,w.z-w.nz*.05);
    /* ribs: down the wall from the front half of the spine, bowing out from the rock and back in */
    if(i>2&&i<W.length*.6&&i%2==0){const rl=1.35*(1-i/(W.length*.9)),P=[];for(let k=0;k<=6;k++){const f=k/6,yy=w.y-.1-rl*f,w2=ch.wallPt(sp[i][0],yy),out=.05+.22*Math.sin(f*Math.PI);P.push(new THREE.Vector3(w2.x-w2.nx*out,yy,w2.z-w2.nz*out))}L.geo('bone',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P),12,.04,5,false),0,0,0)}});
   {const w=W[0],w1=W[2],dx=w.x-w1.x,dy=w.y-w1.y,dz=w.z-w1.z,l=Math.hypot(dx,dz),hx=w.x+dx/l*.6,hz=w.z+dz/l*.6,yw=Math.atan2(dx,dz);
    L.geo('bone',new THREE.SphereGeometry(.5,16,10),hx-w.nx*.1,w.y+.08,hz-w.nz*.1,yw,0,0,.65,.55,1.25);L.geo('black',new THREE.SphereGeometry(.1,8,6),hx-w.nx*.38,w.y+.2,hz-w.nz*.38);
    L.geo('bone',new THREE.BoxGeometry(.16,.1,.85),hx+dx/l*.12-w.nx*.12,w.y-.26,hz+dz/l*.12-w.nz*.12,yw,.25);for(let k=0;k<5;k++)L.geo('bone',new THREE.ConeGeometry(.025,.1,5).rotateX(Math.PI),hx+dx/l*(.3-k*.12)-w.nx*.2,w.y-.2,hz+dz/l*(.3-k*.12)-w.nz*.2)}
   const tp=fx('blk').find(f=>f.n=='tool pile').pts[0];L.box('wood',.7,.5,.5,tp[0],.25,tp[1],.3);L.cyl('steel',.2,.17,.4,tp[0]+.6,.2,tp[1]-.3,12);ugBeam(L,'woodD',[tp[0]-.5,0,tp[1]+.6],[tp[0]-.3,1.1,tp[1]+.2],.05,.05);L.box('steel',.06,.4,.08,tp[0]-.3,1.12,tp[1]+.2,.3);
   L.cyl('steel',.03,.03,1.6,tp[0]+.2,.8,tp[1]+.9,6);for(const a of[0,2.1,4.2])ugBeam(L,'steel',[tp[0]+.2+Math.cos(a)*.4,0,tp[1]+.9+Math.sin(a)*.4],[tp[0]+.2,.9,tp[1]+.9],.03,.03);L.geo('glass',new THREE.SphereGeometry(.12,10,8),tp[0]+.2,1.65,tp[1]+.9);lamp(tp[0]+.2,1.6,tp[1]+.9,1.2);
   for(let i=0;i<5;i++){const a=ang[0]+(ang[3]-ang[0])*(i+.5)/5,w=ch.wallPt(a,.3);L.cyl('ammo',.14+R()*.08,.14+R()*.08,.07,w.x-w.nx*(.5+R()*.4),.035,w.z-w.nz*(.5+R()*.4),18,R()*6)}
   drips(ch,25,'flow',.1)}
  if(v==4){/* the echo chamber: tall, round and empty but for a bell on a post */
   const q=fx('blk').find(f=>f.n=='bell post').pts[0];L.box('woodD',.2,2.6,.2,q[0],1.3,q[1],0);L.box('woodD',.9,.14,.14,q[0]+.35,2.55,q[1],0);
   const bp=[[.02,0],[.2,-.05],[.24,-.2],[.27,-.38],[.38,-.5],[.36,-.53]].map(v2=>new THREE.Vector2(v2[0],v2[1]));L.geo('brass',new THREE.LatheGeometry(bp,18),q[0]+.65,2.48,q[1]);L.geo('brass',new THREE.LatheGeometry(bp.slice().reverse().map(v2=>new THREE.Vector2(v2.x*.95,v2.y)),18),q[0]+.65,2.48,q[1]);
   L.cyl('rope',.012,.012,1.2,q[0]+.65,1.48,q[1],5);drips(ch,20,'flow',.12)}
  return true}
 return false}
