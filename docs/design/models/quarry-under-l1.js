/* =====================================================================================================
   The Old Quarry underground, batch 2: THE LEVEL 1 ROOMS (docs/design/quarry-underground.md).
   Needs quarry-under.js and quarry-under-kit.js. ugBuildLevel calls ugRoomL1(b, p, L, ctx) for a room's rectangle
   (the neck tunnel and its bulkhead are built by the kit) and ugCollapsed(...) after a collapsed drift's tunnel.
   Everything is placed in the piece's own coordinates (entry at 0,0, the room runs towards -z) through ugLocal, which
   turns it into mine coordinates. The positions of the solid things come from the plan's versions (UGV), which the
   room checker (quarry-under-check.js) tests; mirrored pieces have their data mirrored already, and hand-placed
   extras use mx (-1 when mirrored).
   ===================================================================================================== */
function ugLocal(b,p,y){const Mp=new THREE.Matrix4().makeTranslation(p.x,y,p.z).multiply(new THREE.Matrix4().makeRotationY(-p.r*Math.PI/2));
 const M=(x,yy,z,ry,rx,rz,sx,sy,sz)=>Mp.clone().multiply(new THREE.Matrix4().compose(new THREE.Vector3(x,yy,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0,'YXZ')),new THREE.Vector3(sx||1,sy||1,sz||1)));
 const mx=p.d.mir?-1:1;
 return{M,mx,
  box:(k,w,h,d,x,yy,z,ry,rx,rz)=>b.add(k,new THREE.BoxGeometry(w,h,d),M(x,yy,z,ry,rx,rz)),
  cyl:(k,r0,r1,h,x,yy,z,seg,ry,rx,rz)=>b.add(k,new THREE.CylinderGeometry(r0,r1,h,seg||12),M(x,yy,z,ry,rx,rz)),
  geo:(k,g,x,yy,z,ry,rx,rz,sx,sy,sz)=>b.add(k,g,M(x,yy,z,ry,rx,rz,sx,sy,sz)),
  pt:(x,yy,z)=>new THREE.Vector3(x,yy,z).applyMatrix4(Mp),
  dir:(x,z)=>ugRot(x,z,p.r),
  yaw:a=>-p.r*Math.PI/2+a}}

/* turn a geometry inside out (pit and shaft walls are seen from inside) */
function ugInside(g){g=g.index?g.toNonIndexed():g;const P=g.attributes.position.array,N=g.attributes.normal.array,U=g.attributes.uv.array;
 for(let i=0;i<P.length;i+=9)for(let k=0;k<3;k++){let t=P[i+3+k];P[i+3+k]=P[i+6+k];P[i+6+k]=t;t=N[i+3+k];N[i+3+k]=N[i+6+k];N[i+6+k]=t}
 for(let i=0;i<U.length;i+=6)for(let k=0;k<2;k++){const t=U[i+2+k];U[i+2+k]=U[i+4+k];U[i+4+k]=t}for(let i=0;i<N.length;i++)N[i]=-N[i];return g}
/* a rocky lip round a hole in the floor (covers the seam between the floor's edge and the hole's wall) */
function ugLip(L,cx,cz,rx,rz,inner){const g=new THREE.RingGeometry(inner||.9,1.12,48);g.rotateX(-Math.PI/2);const sx=rx,sz=rz;L.geo('oreRock',g,cx,.012,cz,0,0,0,sx,1,sz)}
/* ore veins along a room's walls: every `gap` metres or so, skipping doorways and corners. r: the room rect (local),
   doors: local [x,z] points on the outline, ys: [min,max] height, types: weights. Returns nothing; pushes to ctx.veins */
function ugWallVeins(L,r,doors,ctx,R,o){o=o||{};const gap=o.gap||3,ys=o.ys||[.9,2.1],pick=o.pick||(()=>R()<.15?'ag':R()<.55?'fe':'cu'),H=o.h||3.4,amp=o.amp==null?.22:o.amp;
 const walls=[[r.x0,r.z1,r.x1,r.z1,0,-1],[r.x1,r.z1,r.x1,r.z0,-1,0],[r.x1,r.z0,r.x0,r.z0,0,1],[r.x0,r.z0,r.x0,r.z1,1,0]];
 for(const [ax,az,bx,bz,ix,iz] of walls){const len=Math.hypot(bx-ax,bz-az);for(let t=1.2;t<len-1.2;t+=gap*(.7+R()*.6)){
  const x=ax+(bx-ax)*t/len,z=az+(bz-az)*t/len;if(doors.some(d=>Math.hypot(d[0]-x,d[1]-z)<2.8))continue;if(R()<(o.skip||.25))continue;
  const yy=ys[0]+R()*(ys[1]-ys[0]);
  /* the wall is pushed out by the noise as ugRoom does it (less near corners, doorways, floor and roof): follow it */
  let dm=Math.min(t,len-t,(yy+.1)*2,H+.1-yy);for(const q of doors){const tq=(q[0]-ax)*(bx-ax)/len+(q[1]-az)*(bz-az)/len,pq=Math.abs((q[0]-ax)*(bz-az)/len-(q[1]-az)*(bx-ax)/len);if(pq<.1)dm=Math.min(dm,Math.max(0,Math.abs(t-tq)-2))}
  const w0=L.pt(x,yy,z),dd=amp*Math.min(1,dm)*Math.min(1,yy/.7)*ugNoise(w0.x,w0.y,w0.z)+.06,w=L.pt(x-ix*dd,yy,z-iz*dd),d=L.dir(ix,iz);ctx.veins.push({x:w.x,y:w.y,z:w.z,dx:d[0],dz:d[1],t:pick(),big:o.big&&R()<o.big?1:0})}}}
/* the doors of a room in local coords: the piece's openings and neck ends that lie on the rect */
function ugLocalDoors(p,r){const on=(x,z)=>(Math.abs(x-r.x0)<.05||Math.abs(x-r.x1)<.05)&&z>r.z0-.05&&z<r.z1+.05||(Math.abs(z-r.z0)<.05||Math.abs(z-r.z1)<.05)&&x>r.x0-.05&&x<r.x1+.05;
 const c=[[0,0]].concat(p.d.ex.map(e=>[e[0],e[1]]));for(const s of p.d.shp)if(s.k=='path')for(const q of[s.pts[0],s.pts[s.pts.length-1]])c.push(q);return c.filter(q=>on(q[0],q[1]))}
/* a lamp hanging from the roof on a wire, local coords */
function ugHangLamp(L,ctx,x,z,y0,top,str){L.cyl('wire',.008,.008,top-y0-.2,x,(top+y0+.2)/2,z,4);L.cyl('steel',.08,.11,.1,x,y0+.15,z,10);L.geo('glass',new THREE.SphereGeometry(.09,10,8),x,y0+.05,z);const w=L.pt(x,y0,z);ctx.lamps.push([w.x,w.y,w.z,str||1])}
/* a pile of loose rock (rubble or broken ore): a low mound and stones on it */
function ugPile(L,R,x,z,rx,rz,h,key){const m=new THREE.SphereGeometry(1,14,7,0,Math.PI*2,0,Math.PI/2);L.geo(key||'oreRock',m,x,0,z,0,0,0,rx,h,rz);
 for(let i=0;i<Math.round(rx*rz*3);i++){const a=R()*6.28,rr=Math.sqrt(R())*.85,px=x+Math.cos(a)*rx*rr,pz=z+Math.sin(a)*rz*rr,py=h*Math.sqrt(Math.max(0,1-rr*rr))*.92;const s=.12+R()*.22;L.geo(key||'oreRock',new THREE.DodecahedronGeometry(s,0),px,py,pz,R()*3,R()*3,0)}}
/* deep water in a hole in the floor (local coords). q: the hole's ellipse {cx,cz,rx,rz}.
   o.bowl: a basin that shelves down from the edge (a stope pool); otherwise straight sides (a sump, o.dep deep).
   The surface sits o.surf below the floor, so a band of wet rock shows above it; darker layers below it make the
   middle look deep. */
function ugPool(L,q,o){o=o||{};const surf=o.surf==null?-.25:o.surf,dep=o.dep||2.3;let rAt;
 const wr=o.rock||'wetRock';
 if(o.bowl||o.prof){const pr=o.prof||[[1,0],[.97,-.15],[.9,-.38],[.82,-.55],[.62,-1.15],[.42,-1.7],[.2,-2.1],[0,-dep]];
  rAt=d=>{for(let i=1;i<pr.length;i++)if(d>=pr[i][1]){const a=pr[i-1],b=pr[i],t=(d-a[1])/(b[1]-a[1]);return a[0]+(b[0]-a[0])*t}return 0};
  const g=new THREE.LatheGeometry(pr.map(p=>new THREE.Vector2(p[0],p[1])),48);const uv=g.attributes.uv,per=Math.PI*(q.rx+q.rz)/4;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*per,uv.getY(i)*1.6);
  L.geo(wr,g,q.cx,0,q.cz,0,0,0,q.rx,1,q.rz)}
 else{rAt=()=>1;L.geo(wr,new THREE.CircleGeometry(1,28),q.cx,-dep,q.cz,0,-Math.PI/2,0,q.rx,1,q.rz)}
 /* the surface (o.hole: a local polygon cut out of it, e.g. an island standing in the water) */
 const sr=o.sr||rAt(surf)*1.01;if(o.hole){const sh=new THREE.Shape();sh.absellipse(q.cx,-q.cz,q.rx*sr,q.rz*sr,0,Math.PI*2,false,0);const hp=new THREE.Path();o.hole.forEach((v,i)=>i?hp.lineTo(v[0],-v[1]):hp.moveTo(v[0],-v[1]));sh.holes.push(hp);
  const g=new THREE.ShapeGeometry(sh,48);g.rotateX(-Math.PI/2);const pa=g.attributes.position,uv=[];for(let i=0;i<pa.count;i++)uv.push(pa.getX(i)/(2*q.rx*sr)+.5,pa.getZ(i)/(2*q.rz*sr)+.5);g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));L.geo(o.key||'pool',g,0,surf,0)}
 else L.geo(o.key||'pool',new THREE.CircleGeometry(1,64),q.cx,surf,q.cz,0,-Math.PI/2,0,q.rx*sr,q.rz*sr,1);
 if(dep>.6&&o.layers!==false)for(const f of[.12,.26,.4,.54,.68,.82]){const d=surf+(-dep-surf)*f,r=rAt(d)*1.03;if(r>.05)L.geo('poolD',new THREE.CircleGeometry(1,48),q.cx,d,q.cz,0,-Math.PI/2,0,q.rx*r,q.rz*r,1)}}
/* a plain sign on a backing board against a wall: local position on the wall, (ix,iz) pointing into the room */
function ugWallSign(L,ctx,x,yy,z,ix,iz,txt,w){const a=Math.atan2(ix,iz);L.box('board',w+.1,.44,.3,x-ix*.13,yy,z-iz*.13,a);const p=L.pt(x+ix*.025,yy,z+iz*.025);ctx.signs.push({x:p.x,y:p.y,z:p.z,yaw:L.yaw(a),txt,w})}

/* ---------- the rooms ---------- */
function ugRoomL1(b,p,Lv,ctx){const t=p.type,v=p.d.v||0,y=UGLY(Lv);
 const lr=p.d.shp.find(q=>q.k=='rect');if(!lr)return false;const r={x0:lr.x0,x1:lr.x1,z0:lr.z0,z1:lr.z1};
 const L=ugLocal(b,p,y),R=ugRng(p.id*7919+v*31+11),mx=L.mx,doors=ugLocalDoors(p,r),fx=k=>p.d.fx.filter(f=>f.k==k);
 const room=(h,o)=>ugRectRoom(b,p,r,h,y,Object.assign({doors:ugDoorsFor(p,r)},o||{}));
 /* mine-coord rect holes from local rects, mine-coord pits from local ellipses */
 const lrect=(x0,x1,z0,z1)=>{const a=L.pt(x0,0,z0),c=L.pt(x1,0,z1);return{x0:Math.min(a.x,c.x),x1:Math.max(a.x,c.x),z0:Math.min(a.z,c.z),z1:Math.max(a.z,c.z)}};
 const lpit=(cx,cz,rx,rz)=>{const c=L.pt(cx,0,cz),sw=p.r%2==1;return{cx:c.x,cz:c.z,rx:sw?rz:rx,rz:sw?rx:rz}};

 if(t=='stope'){const h=5.5;
  const pit=fx('pit')[0]||fx('water').find(w=>w.deep),sun=fx('sun')[0];
  room(h,{pits:pit?[lpit(pit.cx,pit.cz,pit.rx,pit.rz)]:[],holes:sun?[Object.assign({roof:1},lrect(-1.6,1.6,-11.6,-8.4))]:[],floor:v==5?'fill':'floor'});
  for(const q of[[-3,-6],[3,-14]])ugHangLamp(L,ctx,q[0]*mx,q[1],3.4,h,1.2);
  if(v==0){for(const f of fx('cribs'))for(const q of f.pts)ugCrib(L.box?{box:(k,w,hh,d,x,yy,z,ry)=>L.box(k,w,hh,d,x,yy-y,z,ry)}:b,q[0],y,q[1],h);
   /* rough rock benches along the long walls */
   for(const sd of[-1,1])for(let z=-4.5;z>-16;z-=3.6){const w=.9+R()*.5,hh=.6+R()*.5;L.box('rock',w,hh,3.2,sd*(7-w/2+.05),hh/2,z,0)}}
  if(v==1){const m=fx('muck')[0];ugPile(L,R,m.cx,m.cz,m.rx,m.rz,1.8);
   const lg0=fx('ledge')[0],lsd=Math.abs(lg0.x0-r.x0)<Math.abs(lg0.x1-r.x1)?-1:1;/* the ledge runs back into the wall (no slit behind it) */
   const lg={x0:lsd<0?r.x0-.3:lg0.x0,x1:lsd<0?lg0.x1:r.x1+.3,z0:lg0.z0,z1:lg0.z1},lw=lg.x1-lg.x0,lc=(lg.x0+lg.x1)/2,ld=lg.z1-lg.z0,lcz=(lg.z0+lg.z1)/2,lh=2.4;L.box('rock',lw,lh,ld,lc,lh/2,lcz,0);L.box('floor',lw-.1,.02,ld-.1,lc,lh+.01,lcz,0);
   /* a timber ladder leaning from the floor to the ledge's edge */
   const ld2=fx('ladder2')[0],edge=Math.abs(lg.x0-ld2.x)<Math.abs(lg.x1-ld2.x)?lg.x0:lg.x1,th=Math.atan2(ld2.x-edge,lh),len=Math.hypot(ld2.x-edge,lh)+.35;
   for(const sd of[-.25,.25])L.box('wood',.07,len,.07,ld2.x-Math.sin(th)*len/2,Math.cos(th)*len/2,ld2.z+sd,0,0,th);for(let yy=.3;yy<lh+.2;yy+=.3)L.box('wood',.05,.05,.56,ld2.x-Math.tan(th)*yy,yy,ld2.z,0);
   /* rich veins on the room's wall above the ledge */
   {const wx=lsd<0?r.x0:r.x1;for(let z=lg.z1-1;z>lg.z0+.8;z-=1.6+R()*.6){const yy=lh+.6+R()*1.2,w0=L.pt(wx,yy,z),dm=Math.min(1,5.6-yy,Math.abs(z-r.z0),Math.abs(z-r.z1)),dd=.22*dm*ugNoise(w0.x,w0.y,w0.z)+.06,w=L.pt(wx+lsd*dd,yy,z),d=L.dir(-lsd,0);ctx.veins.push({x:w.x,y:w.y,z:w.z,dx:d[0],dz:d[1],t:R()<.4?'au':'ag'})}}}
  if(v==2){const sh=lrect(-1.6,1.6,-11.6,-8.4),cx=(sh.x0+sh.x1)/2,cz=(sh.z0+sh.z1)/2,top=y+h,H=9;
   /* the raise up to daylight: four rock walls, a bright opening at the top, a beam of light to the floor */
   for(const [ax,az,w,ry] of[[0,-11.6,3.2,0],[0,-8.4,3.2,Math.PI],[-1.6,-10,3.2,Math.PI/2],[1.6,-10,3.2,-Math.PI/2]]){L.geo('rock',new THREE.PlaneGeometry(w,H),ax,h+H/2,az,ry)}
   L.geo('sky',new THREE.PlaneGeometry(3.2,3.2),0,h+H,-10,0,Math.PI/2);
   const beam=new THREE.CylinderGeometry(1.25,1.55,h+H-.1,20,1,true);L.geo('beam',beam,0,(h+H)/2,-10);L.geo('beam',new THREE.CircleGeometry(1.6,24),0,.015,-10,0,-Math.PI/2);
   const w=L.pt(0,h+1,-10);ctx.lamps.push([w.x,w.y,w.z,2.2]);
   for(const f of fx('cribs'))for(const q of f.pts)ugCrib({box:(k,ww,hh,d,x,yy,z,ry)=>L.box(k,ww,hh,d,x,yy-y,z,ry)},q[0],y,q[1],h)}
  if(v==3){const wf=fx('water')[0];ugPool(L,wf,{bowl:1,surf:-.25,dep:2.3});ugLip(L,wf.cx,wf.cz,wf.rx,wf.rz,.995);
   for(let i=0;i<26;i++){const a=i/26*6.28,s=.18+R()*.2;L.geo('oreRock',new THREE.DodecahedronGeometry(s,0),wf.cx+Math.cos(a)*(wf.rx+.15),s*.5,wf.cz+Math.sin(a)*(wf.rz+.15),R()*3,R()*3,0)}
   const wk=fx('walk')[0],a=wk.pts[0],c=wk.pts[1];for(let z=a[1]-.2;z>c[1]+.2;z-=.3)L.box('woodD',1.1,.05,.26,a[0],.17,z,0);for(let z=a[1]-.5;z>c[1];z-=2)for(const sd of[-.5,.5])L.box('wood',.1,.14,.1,a[0]+sd,.07,z,0)}
  if(v==4){const pt=fx('pit')[0],D=7;
   /* the open stope: a round shaft of rock going down, a dark floor far below, a catwalk across on beams */
   L.geo('rock',ugInside(new THREE.CylinderGeometry(pt.rx+.06,pt.rx*.92,D,40,4,true)),pt.cx,-D/2,pt.cz);ugLip(L,pt.cx,pt.cz,pt.rx,pt.rz);
   L.geo('black',new THREE.CircleGeometry(pt.rx*.92,32),pt.cx,-D,pt.cz,0,-Math.PI/2);
   const wk=fx('walk')[0],z0=wk.pts[0][1],z1=wk.pts[1][1];for(let z=z0;z>z1-.01;z-=.25)L.box('woodD',1.2,.06,.22,0,.005,z-.11,0);
   for(let z=pt.cz+pt.rz-.6;z>pt.cz-pt.rz+.5;z-=2.4){L.box('wood',2*Math.sqrt(Math.max(0,pt.rx*pt.rx-(z-pt.cz)**2))+.6,.22,.22,0,-.2,z,0);}
   for(const sd of[-.66,.66]){L.box('wood',.06,.06,z0-z1,sd,1.0,(z0+z1)/2,0);for(let z=z0-.1;z>z1;z-=1.6)L.box('wood',.07,1.0,.07,sd,.5,z,0)}
   for(let i=0;i<30;i++){const a=i/30*6.28,s=.15+R()*.18;L.geo('oreRock',new THREE.DodecahedronGeometry(s,0),pt.cx+Math.cos(a)*(pt.rx+.2),s*.45,pt.cz+Math.sin(a)*(pt.rz+.2),R()*3,R()*3,0)}}
  if(v==5){const ch=fx('blk').find(f=>f.n=='chute').pts[0],wi=fx('blk').find(f=>f.n=='winch').pts[0];
   L.box('wood',.9,h-.4,1,ch[0],(h-.4)/2,ch[1],0);L.box('woodD',.8,.06,1.3,ch[0]+mx*.6,1.1,ch[1],0,0,mx*.6);
   L.box('dark',1.4,.25,1.4,wi[0],.125,wi[1],0);L.cyl('steel',.38,.38,1.1,wi[0],.75,wi[1],16,0,0,Math.PI/2);L.box('dark',.5,.5,.6,wi[0],.5,wi[1]-.75*mx,0);
   const an=[-6.6*mx,-4],dx=an[0]-wi[0],dz=an[1]-wi[1],l=Math.hypot(dx,dz);L.box('wire',.025,.025,l,(an[0]+wi[0])/2,.12,(an[1]+wi[1])/2,Math.atan2(dx,dz));L.cyl('steel',.08,.08,.4,an[0],.2,an[1],8)}
  /* veins: lots in a stope, and a big seam in some versions */
  ugWallVeins(L,r,doors,ctx,R,{gap:1.9,ys:[.9,2.6],skip:.2,big:[0,3,5].includes(v)?.12:0,h:5.5});
  return true}

 if(t=='crib'){const h=3.4;room(h);ugHangLamp(L,ctx,0,-6,2.5,h,1.1);
  const blk=n=>(fx('blk').find(f=>f.n==n)||{pts:[]}).pts;
  if(v==0){const tb=blk('table')[0];L.box('wood',.8,.06,1.3,tb[0],.78,tb[1],0);for(const q of[[-.32,-.55],[.32,-.55],[-.32,.55],[.32,.55]])L.box('woodD',.07,.75,.07,tb[0]+q[0],.375,tb[1]+q[1],0);
   for(const sd of[-.72,.72]){L.box('wood',.3,.05,1.3,tb[0]+sd,.46,tb[1],0);for(const dz of[-.5,.5])L.box('woodD',.06,.44,.24,tb[0]+sd,.22,tb[1]+dz,0)}
   for(let i=0;i<4;i++){L.cyl('steel',.09,.09,.12,tb[0]+(R()-.5)*.5,.87,tb[1]-.55+i*.17,10)}   /* the mugs stay clear of the lunch tin */ctx.pickups.push(ugPut(L,ugLunchbox(),tb[0]+.15,.81,tb[1]+.3,.3));
   const st=blk('stove')[0];L.box('dark',.6,.8,.5,st[0],.4,st[1],0);L.cyl('dark',.07,.07,h-.8,st[0],.8+(h-.8)/2,st[1],10);L.cyl('steel',.12,.1,.18,st[0]-.1,.905,st[1]+.05,12);
   L.box('wood',.3,.04,1.6,-3.82*mx,1.5,-4.5,0);for(let i=0;i<5;i++)L.cyl('steel',.07,.07,.11,-3.82*mx,1.58,-3.9-i*.3,10);ugWallSign(L,ctx,0,1.8,-9.98+.0,0,1,'SAFETY FIRST',1.4)}
  if(v==1){for(const q of blk('rack').length?blk('rack'):fx('racks')[0].pts){L.box('wood',.5,1.8,.9,q[0],.9,q[1],0);for(let k=0;k<3;k++)for(let j=-1;j<=1;j++){L.box('woodD',.46,.03,.86,q[0],.5+k*.5,q[1],0);L.geo('lampG',new THREE.SphereGeometry(.06,8,6),q[0]+(q[0]>0?-.12:.12),.6+k*.5,q[1]+j*.26)}}
   L.box('board',2,1.2,.08,0,1.7,-9.93,0);/* the brass tags on their board; one of them you can take: number 17 */const sp=R()*24|0;for(let i=0;i<6;i++)for(let j=0;j<4;j++){if(i*4+j==sp){ctx.pickups.push(ugPut(L,ugTag(17,'HARLAN'),-.75+i*.3,1.3+j*.26,-9.887));continue}L.cyl('brass',.06,.06,.02,-.75+i*.3,1.3+j*.26,-9.88,10,0,Math.PI/2)}}
  if(v==2){const d=fx('desk')[0];L.box('woodD',1.4,.06,.7,d.x,.76,d.z,0);for(const q of[[-.62,-.28],[.62,-.28],[-.62,.28],[.62,.28]])L.box('woodD',.06,.73,.06,d.x+q[0],.365,d.z+q[1],0);
   L.box('paper',.5,.01,.36,d.x-.2,.795,d.z,.2);L.box('red',.24,.05,.32,d.x+.35,.815,d.z+.05,-.1);L.box('wood',.45,.05,.45,d.x,.46,d.z+.7,0);L.box('wood',.45,.5,.05,d.x,.72,d.z+.92,0);
   const sf=blk('safe')[0];L.box('dark',.8,.9,.7,sf[0],.45,sf[1],0);L.cyl('brass',.08,.08,.04,sf[0],.55,sf[1]+.36,12,0,Math.PI/2);
   L.box('dark',.5,1.3,.5,-3.6*mx,.65,-4.6,0);ugWallSign(L,ctx,3.98*mx,1.9,-5,-mx,0,'MINE PLAN',1.6)}
  if(v==3){const sr=blk('stretcher')[0];for(const dz of[-.75,.75]){L.box('woodD',.6,.05,.08,sr[0],.62,sr[1]+dz,0);for(const sd of[-.25,.25])L.box('woodD',.05,.6,.05,sr[0]+sd,.3,sr[1]+dz,0)}L.box('cloth',.56,.05,1.9,sr[0],.67,sr[1],0);
   const cb=blk('cabinet')[0];L.box('white',.8,1.6,.5,cb[0],.8,cb[1],0);L.box('red',.3,.08,.02,cb[0],1.2,cb[1]+.26,0);L.box('red',.08,.3,.02,cb[0],1.2,cb[1]+.26,0);L.box('red',.36,.2,.24,cb[0],1.7,cb[1],0)}
  ugWallVeins(L,r,doors,ctx,R,{gap:3.5,skip:.55});
  return true}

 if(t=='magazine'){const h=3.4;room(h);ugHangLamp(L,ctx,0,-6.6,2.6,h,.9);
  /* the heavy door, swung open flat against the inside of the front wall */
  L.box('wood',1.9,2.4,.1,-1.98*mx,1.21,-3.12,0);for(const yy of[.5,1.9])L.box('dark',1.9,.12,.02,-1.98*mx,yy,-3.18,0);
  const crate=(x,z,s)=>{const yw=R()*.2;L.box('wood',.8,.65,.8,x,.325+(s||0),z,yw);L.box('red',.6,.02,.02,x,.5+(s||0),z+.41,0);return yw};
  const blk=n=>(fx('blk').find(f=>f.n==n)||{pts:[]}).pts;
  /* the first crate has an open box of dynamite on it (you can take sticks from it) */blk('crate').forEach((q,i)=>{const yw=crate(q[0],q[1]);if(i==0)ctx.pickups.push(ugPut(L,ugDynCrate(9),q[0]-.06*Math.cos(yw),.65,q[1]+.06*Math.sin(yw),yw));else if(v==0&&R()<.7)crate(q[0],q[1],.65)});
  if(v==0){ugWallSign(L,ctx,0,2.1,-8.98,0,1,'DANGER · EXPLOSIVES',1.8);L.box('wood',1.8,.04,.4,2.6*mx,1.4,-6,Math.PI/2)}
  if(v==1){const pl=blk('plunger')[0];L.box('woodD',.5,.4,.4,pl[0],.2,pl[1],0);L.cyl('steel',.03,.03,.5,pl[0],.65,pl[1],8);L.box('steel',.4,.04,.04,pl[0],.9,pl[1],0);
   for(const dz of[0,.55])L.cyl('woodD',.25,.25,.3,1.9*mx,.25,-4.9-dz,14,0,0,Math.PI/2);ugWallSign(L,ctx,0,2.1,-8.98,0,1,'BLASTING · CLEAR THE AREA',2.2)}
  if(v==2){const wf=fx('water')[0];L.geo('waterS',new THREE.CircleGeometry(1,32),wf.cx,.04,wf.cz,0,-Math.PI/2,0,wf.rx,wf.rz,1);L.box('wood',1.6,.04,.35,0,1.9,-8.8,0);L.cyl('red',.04,.04,.3,.3,1.97,-8.8,8,0,0,Math.PI/2)}
  return true}

 if(t=='pump'){const h=3.9;const pit=fx('pit')[0]||fx('water').find(w=>w.deep);
  room(h,{pits:pit?[lpit(pit.cx,pit.cz,pit.rx,pit.rz)]:[]});ugHangLamp(L,ctx,0,-5,2.8,h,1.1);
  const blk=n=>(fx('blk').find(f=>f.n==n)||{pts:[]}).pts;
  /* a hole in the floor: rock sides going down, water or black at the bottom, a fence round it */
  const hole=(q,dep,wet)=>{const cg=ugInside(new THREE.CylinderGeometry(1.012,1,dep,40,2,true));cg.scale(q.rx,1,q.rz);L.geo('rock',cg,q.cx,-dep/2,q.cz);ugLip(L,q.cx,q.cz,q.rx,q.rz);if(wet)ugPool(L,q,{surf:-.6,dep});else L.geo('black',new THREE.CircleGeometry(1,28),q.cx,-dep,q.cz,0,-Math.PI/2,0,q.rx,q.rz,1);
   const n=Math.max(8,Math.round((q.rx+q.rz)*2.4));for(let i=0;i<n;i++){const a=i/n*6.28,a2=(i+1)/n*6.28,x=q.cx+Math.cos(a)*(q.rx+.35),z=q.cz+Math.sin(a)*(q.rz+.35),x2=q.cx+Math.cos(a2)*(q.rx+.35),z2=q.cz+Math.sin(a2)*(q.rz+.35);
    if(doors.some(d=>Math.hypot(d[0]-x,d[1]-z)<1.6))continue;L.box('wood',.07,1,.07,x,.5,z,0);L.box('wood',Math.hypot(x2-x,z2-z)+.04,.06,.06,(x+x2)/2,.98,(z+z2)/2,Math.atan2(-(z2-z),x2-x))}};
  if(v==0){hole(pit,2.4,true);const pm=blk('pump')[0];L.box('dark',1.2,.25,1.4,pm[0],.125,pm[1],0);L.cyl('steel',.32,.32,1.1,pm[0],.8,pm[1]+.3,16);L.cyl('dark',.55,.55,.12,pm[0]+.45*mx,.75,pm[1]-.3,20,0,0,Math.PI/2);
   L.cyl('rail',.07,.07,Math.abs(pm[0]-pit.cx)-.2,(pm[0]+pit.cx)/2,.55,pm[1]+.3,8,0,0,Math.PI/2);L.cyl('rail',.07,.07,h-1.3,pm[0],1.35+(h-1.3)/2,pm[1]+.3,8)}
  if(v==1){const pt=fx('pit')[0];hole(pt,6,false);const dr=fx('drum')[0];L.cyl('dark',.9,.9,1.6,dr.x,1.2,dr.z,24,0,Math.PI/2,0);for(const sd of[-.9,.9]){L.box('wood',.2,1.25,.2,dr.x-.5,.62,dr.z+sd,0,0,.3);L.box('wood',.2,1.25,.2,dr.x+.5,.62,dr.z+sd,0,0,-.3)}
   L.box('steel',.06,1.2,.06,dr.x-1.1*mx,.8,dr.z+.95,0,0,mx*.4);L.box('wood',2*pt.rx+1,.24,.24,pt.cx,2.9,pt.cz,0);L.cyl('dark',.35,.35,.1,pt.cx,2.65,pt.cz,16,0,0,Math.PI/2);
   const cl=Math.hypot(pt.cx-dr.x,2.65-2.1);L.box('wire',cl,.02,.02,(pt.cx+dr.x)/2,(2.65+2.1)/2,pt.cz,0,0,Math.atan2(2.65-2.1,pt.cx-dr.x));L.cyl('wire',.012,.012,4,pt.cx+.35*Math.sign(dr.x-pt.cx)*-1,.6,pt.cz,4)}
  if(v==2){for(const d of fx('desk')){L.box('wood',1.4,.08,.7,d.x,.86,d.z,0);for(const q of[[-.62,-.28],[.62,-.28],[-.62,.28],[.62,.28]])L.box('woodD',.08,.82,.08,d.x+q[0],.41,d.z+q[1],0);L.box('dark',.2,.18,.16,d.x+.4,.99,d.z,0);L.box('steel',.5,.04,.06,d.x-.3,.92,d.z+.1,.4)}
   const an=blk('anvil')[0];L.box('dark',.3,.35,.3,an[0],.175,an[1],0);L.box('dark',.5,.16,.22,an[0],.43,an[1],0);
   const fg=blk('forge')[0];L.box('brick',1,.9,1,fg[0],.45,fg[1],0);L.box('red',.6,.04,.6,fg[0],.92,fg[1],0);L.box('dark',.7,.6,.7,fg[0],h-.9,fg[1],0);L.cyl('dark',.12,.12,.6,fg[0],h-.3,fg[1],8);const w=L.pt(fg[0],1,fg[1]);ctx.lamps.push([w.x,w.y,w.z,.8])}
  if(v==3){const cp=blk('compressor')[0];L.box('dark',2,.3,1.3,cp[0],.15,cp[1],0);for(const sd of[-.45,.25])L.cyl('steel',.3,.3,.9,cp[0]+sd*mx,.75,cp[1],16);L.cyl('dark',.6,.6,.14,cp[0]+.85*mx,.75,cp[1],24,0,0,Math.PI/2);
   const tk=blk('air tank')[0];L.cyl('steel',.55,.55,2.2,tk[0],1.1,tk[1],20);L.geo('steel',new THREE.SphereGeometry(.55,16,8,0,Math.PI*2,0,Math.PI/2),tk[0],2.2,tk[1]);
   L.cyl('rail',.06,.06,Math.hypot(tk[0]-cp[0],tk[1]-cp[1]),(tk[0]+cp[0])/2,1.6,(tk[1]+cp[1])/2,8,Math.atan2(tk[0]-cp[0],tk[1]-cp[1]),Math.PI/2,0)}
  ugWallVeins(L,r,doors,ctx,R,{gap:3,skip:.45,h:3.9});
  return true}
 return false}

/* ---------- the collapsed drift: after its tunnel (broken sets) is built ---------- */
function ugCollapsed(b,p,y,ctx,tr){const v=p.d.v||0,L=ugLocal(b,p,y),R=ugRng(p.id*331+v),mx=L.mx;
 for(const f of p.d.fx){
  if(f.k=='rubble'){ugPile(L,R,f.x,f.z,1.05,1.4,.9,'oreRock');/* a fallen cap beam across the heap */L.box('wood',3.2,.24,.24,f.x-.3*mx,.55,f.z+.4,.5*mx,0,.25*mx)}
  if(f.k=='blk'&&f.n=='cart')for(const q of f.pts){L.box('steel',.9,.6,1.3,q[0],.32,q[1],.2*mx,.18,.12);for(let i=0;i<9;i++)L.geo('oreRock',new THREE.DodecahedronGeometry(.12+R()*.1,0),q[0]+(R()-.5)*1.2,.08,q[1]+.9+R()*.6,R()*3,R()*3,0)}
  if(f.k=='blk'&&f.n=='prop')for(const q of f.pts){const hh=2.6+.45*2*Math.sin(Math.acos(Math.min(1,Math.abs(q[0])/2)))-.12;L.box('wood',.2,hh,.2,q[0],hh/2,q[1],0);L.box('woodD',.32,.08,.3,q[0],hh-.02,q[1],0)}}}
