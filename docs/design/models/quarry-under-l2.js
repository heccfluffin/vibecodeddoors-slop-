/* =====================================================================================================
   The Old Quarry underground, batch 3: LEVEL 2, THE CAVES (docs/design/quarry-underground.md).
   Needs quarry-under.js, quarry-under-kit.js and quarry-under-l1.js. ugBuildLevel calls ugPieceL2(b, p, L, ctx) for
   every piece on levels 2 and 3 before its own code; it returns true when it built the piece.
   - ugCave: a natural passage. Its profile is rounder and wider than a drive (4.8 m wide, 4 m high) and its rock is
     pushed out by the world noise up to 0.45 m, but within 2.4 m of each end it narrows smoothly to the exact 4 m arch
     with no noise, so it meets any doorway, drive or other passage edge to edge.
   - ugChamber: a cave room (forks, rock islands, grottos, halls): an oval floor, rock walls up to 3.65 m that curve
     into a domed roof, doorways flattened to the 4 m arch with a rock lip round them.
   Dug tunnels (joins) and drives on these levels are the miners' own: timbered, with this level's rock, no rails.
   ===================================================================================================== */

/* ---------- the caves' own materials (added to the kit's set) ---------- */
{const k0=ugKit;ugKit=function(){const K=k0();if(K.l2)return K;K.l2=1;const M=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.9},o));
 K.streamN=K.poolN.clone();K.streamN.needsUpdate=true;K.streamN.repeat.set(1.5,6);
 Object.assign(K.mat,{
  /* a stream: rippled, see-through; the game scrolls K.streamN along the flow (offset.y, about 0.25 per second) */
  stream:new THREE.MeshStandardMaterial({color:0x24464c,roughness:.1,metalness:.25,transparent:true,opacity:.6,depthWrite:false,normalMap:K.streamN,normalScale:new THREE.Vector2(.45,.45)}),
  wet2:M({map:K.rockT,color:0x7a8088,roughness:.35}),
  flow:M({map:K.rockT,color:0xe4d4b4,roughness:.6}),               /* flowstone: columns, curtains */
  crystal:new THREE.MeshStandardMaterial({color:0xa8ecff,emissive:0x2a9ac8,emissiveIntensity:.85,roughness:.12,metalness:.1}),
  crystalP:new THREE.MeshStandardMaterial({map:K.rockT,color:0x8fdcf4,emissive:0x1c6c8c,emissiveIntensity:.7,roughness:.2,metalness:.15,flatShading:true}),
  frost:new THREE.MeshStandardMaterial({color:0xeaf8ff,emissive:0x6a9ab8,emissiveIntensity:.5,roughness:.3}),
  stem:M({color:0xe8dcc8,roughness:.8}),gill:M({color:0x8a6a6a,roughness:.9}),
  capP:new THREE.MeshStandardMaterial({color:0xe070d8,emissive:0x9a2a90,emissiveIntensity:.75,roughness:.55}),
  capG:new THREE.MeshStandardMaterial({color:0x6ad070,emissive:0x2a8a3a,emissiveIntensity:.7,roughness:.55}),
  capT:M({color:0xc89060,roughness:.7}),
  rope:M({color:0x9a7a4a,roughness:1})});
 for(const k in K.mat)K.mat[k].userData.ug=k;K.mat.stream.userData.ro=2;return K}}

/* ---------- the cave profile: 15 points laid out like ugProf(2) (4 up the left wall, 7 over the roof, 4 down the
   right wall), so the two can be blended point by point ---------- */
function ugCaveProf(){const W=[[-2.1,-.1],[-2.38,.85],[-2.48,1.75],[-2.4,2.6]],P=W.slice();
 for(let i=1;i<8;i++){const a=Math.PI*(1-i/8);P.push([2.4*Math.cos(a),2.65+1.35*Math.sin(a)])}
 for(let i=3;i>=0;i--)P.push([-W[i][0],W[i][1]]);return P}

/* ---------- a cave passage. pts: [[x,y,z]] in mine coords. o: {rock, floor, amp, keep:[half-planes], fil}.
   o.keep: the floor is kept only where a*x+b*z+c<=0 for one of the half-planes [a,b,c] (a stream cuts it in two) ---------- */
function ugCave(b,pts,o){o=o||{};const A=ugProf(2).P,Cv=ugCaveProf(),m=A.length,amp=o.amp==null?.45:o.amp,rk=o.rock||'rock2';
 /* both ends run straight and square for 1.6 m, so the end rings sit flat in the doorways */
 let Q=pts.slice();const sq=(a,c)=>{const dx=c[0]-a[0],dz=c[2]-a[2],l=Math.hypot(dx,dz);return Math.abs(dx)>Math.abs(dz)?[Math.sign(dx),0,Math.abs(dz)/l]:[0,Math.sign(dz),Math.abs(dx)/l]};
 if(Q.length>=2){const a0=sq(Q[0],Q[1]),e=Q[Q.length-1],a1=sq(Q[Q.length-2],e);const mid=Q.slice(1,-1);let head=[Q[0]],tail=[e];
  if(a0[2]>.03){head.push([Q[0][0]+a0[0]*1.6,Q[0][1],Q[0][2]+a0[1]*1.6])}if(a1[2]>.03){tail.unshift([e[0]-a1[0]*1.6,e[1],e[2]-a1[1]*1.6])}
  Q=head.concat(mid.filter(q=>(a0[2]<=.03||Math.hypot(q[0]-Q[0][0],q[2]-Q[0][2])>2.4)&&(a1[2]<=.03||Math.hypot(q[0]-e[0],q[2]-e[2])>2.4))).concat(tail)}
 const P=ugResample(ugFillet(Q,o.fil==null?2.5:o.fil),.5),n=P.length,S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][2]-P[i-1][2]));const L=S[n-1];
 const T=P.map((p,i)=>{const a=P[Math.max(0,i-1)],c=P[Math.min(n-1,i+1)];let tx=c[0]-a[0],tz=c[2]-a[2];const l=Math.hypot(tx,tz)||1;return[tx/l,tz/l]});
 for(const i of[0,n-1]){const [tx,tz]=T[i];if(Math.abs(tx)>.9)T[i]=[Math.sign(tx),0];else if(Math.abs(tz)>.9)T[i]=[0,Math.sign(tz)]}
 const kf=s=>{const t=Math.max(0,Math.min(1,Math.min(s,L-s)/2.4));return t*t*(3-2*t)};
 const pl=[0];for(let j=1;j<m;j++)pl.push(pl[j-1]+Math.hypot(Cv[j][0]-Cv[j-1][0],Cv[j][1]-Cv[j-1][1]));
 const pos=[],uv=[],idx=[],prof=(j,k)=>[A[j][0]+(Cv[j][0]-A[j][0])*k,A[j][1]+(Cv[j][1]-A[j][1])*k];
 for(let i=0;i<n;i++){const k=kf(S[i]),[tx,tz]=T[i],rx=-tz,rz=tx;for(let j=0;j<m;j++){const [sx,sy]=prof(j,k);let x=P[i][0]+rx*sx,yy=P[i][1]+sy,z=P[i][2]+rz*sx;
   let nx=sx,ny=sy-1.5;const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;const hy=Math.max(0,Math.min(1,sy/.7)),d=amp*k*hy*ugNoise(x,yy,z);
   pos.push(x+rx*nx*d,yy+ny*d,z+rz*nx*d);uv.push(S[i]/3,pl[j]/3)}}
 for(let i=0;i<n-1;i++)for(let j=0;j<m-1;j++){const a=i*m+j,b2=(i+1)*m+j,c=(i+1)*m+j+1,d=i*m+j+1;idx.push(a,b2,c,a,c,d)}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();b.add(rk,geo);
 /* the floor: flat, as wide as the wall at floor height (plus 6 cm under the rock) */
 const hwAt=i=>{const k=kf(S[i]),p0=prof(0,k),p1=prof(1,k),t=(0-p0[1])/(p1[1]-p0[1]);return-(p0[0]+(p1[0]-p0[0])*t)+.06};
 const edge=i=>{const [tx,tz]=T[i],h=hwAt(i);return[[P[i][0]+tz*h,P[i][2]-tx*h],[P[i][0]-tz*h,P[i][2]+tx*h]]};
 const fp=[],fn=[],fu=[],keep=o.keep||[null];const y=P[0][1];
 const clip=(poly,H)=>{if(!H)return poly;const o2=[];for(let i=0;i<poly.length;i++){const a=poly[i],c=poly[(i+1)%poly.length],fa=H[0]*a[0]+H[1]*a[1]+H[2],fc=H[0]*c[0]+H[1]*c[1]+H[2];if(fa<=0)o2.push(a);if((fa<0)!=(fc<0)&&fa!=0&&fc!=0){const t=fa/(fa-fc);o2.push([a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t])}}return o2};
 for(let i=0;i<n-1;i++){const e0=edge(i),e1=edge(i+1),quad=[e0[0],e1[0],e1[1],e0[1]];for(const H of keep){const pg=clip(quad,H);for(let t=1;t<pg.length-1;t++){let tri=[pg[0],pg[t],pg[t+1]];const cr=(tri[1][0]-tri[0][0])*(tri[2][1]-tri[0][1])-(tri[1][1]-tri[0][1])*(tri[2][0]-tri[0][0]);if(cr>0)tri=[tri[0],tri[2],tri[1]];for(const v of tri){fp.push(v[0],y,v[1]);fn.push(0,1,0);fu.push(v[0]/2.5,v[1]/2.5)}}}}
 b.raw(o.floor||'floor2',fp,fn,fu);
 const at=s=>{let i=1;while(i<n-1&&S[i]<s)i++;const t=(s-S[i-1])/((S[i]-S[i-1])||1),p=[P[i-1][0]+(P[i][0]-P[i-1][0])*t,P[i-1][1]+(P[i][1]-P[i-1][1])*t,P[i-1][2]+(P[i][2]-P[i-1][2])*t],tt=T[i];return{p,t:tt,r:[-tt[1],tt[0]],yaw:Math.atan2(-tt[0],-tt[1]),i}};
 /* a point on the wall surface: ring i, profile point j */
 const wall=(i,j)=>[pos[(i*m+j)*3],pos[(i*m+j)*3+1],pos[(i*m+j)*3+2]];
 return{L,at,P,S,T,n,m,wall,edge,kf}}

/* veins and loose stones along a cave passage (rings, so they sit on the real wall) */
function ugCaveDress(b,c,ctx,R,lv){const pick=()=>{const r=R();return lv==1?(r<.3?'ag':r<.45?'au':r<.55?'cr':r<.8?'fe':'cu'):(r<.3?'au':r<.5?'dm':r<.65?'ur':r<.85?'ag':'fe')};
 for(let s=3+R()*3;s<c.L-3;s+=4+R()*4){if(R()<.3)continue;const f=c.at(s),side=R()<.5?0:1,j=side?12:2,w=c.wall(f.i,j),r=f.r,sg=side?1:-1;
  ctx.veins.push({x:w[0]+r[0]*sg*.06,y:w[1]-.2+R()*.4,z:w[2]+r[1]*sg*.06,dx:-r[0]*sg,dz:-r[1]*sg,t:pick()})}
 for(let s=2.2;s<c.L-2.2;s+=1.1+R()*1.6){const f=c.at(s),e=c.edge(f.i),side=R()<.5?0:1,q=e[side],cx=(e[0][0]+e[1][0])/2,cz=(e[0][1]+e[1][1])/2,dx=cx-q[0],dz=cz-q[1],l=Math.hypot(dx,dz),sz=.12+R()*.26;
  b.add(c.rk||'rock2',new THREE.DodecahedronGeometry(sz,0),new THREE.Matrix4().compose(new THREE.Vector3(q[0]+dx/l*(.22+sz*.5),f.p[1]+sz*.25,q[1]+dz/l*(.22+sz*.5)),new THREE.Quaternion().setFromEuler(new THREE.Euler(R()*3,R()*3,0)),new THREE.Vector3(1,.7,1)))}}

/* ---------- a cave room (chamber) in the piece's own coords. o: {cx,cz,rx,rz, dome, amp, isle:{cx,cz,r,bot,key},
   pits:[{cx,cz,rx,rz}], holes:[[[x,z]..]], H (wall height, >= the door top 3.65)}. Returns its outline and roofAt(x,z) ---------- */
/* a cave room's outline (local coords): the oval, flattened into a straight 5.2 m wall round each doorway.
   doors: the piece's openings on (or near) the oval; (nx,nz) faces out of the room, (tx,tz) runs along the wall */
function ugChamberShape(p,o){const cx=o.cx,cz=o.cz,rx=o.rx,rz=o.rz;
 const op=[[0,0,0,1]].concat(p.d.ex.map(e=>{const v=ugRot(0,-1,e[2]);return[e[0],e[1],v[0],v[1]]}));
 const doors=op.filter(q=>Math.abs(Math.hypot((q[0]-cx)/rx,(q[1]-cz)/rz)-1)*Math.min(rx,rz)<1.4).map(q=>({x:q[0],z:q[1],nx:q[2],nz:q[3],tx:-q[3],tz:q[2]}));
 const N=Math.max(28,Math.ceil(Math.PI*(rx+rz)/.75));let pts=[];for(let i=0;i<N;i++){const a=i/N*Math.PI*2;pts.push([cx+rx*Math.cos(a),cz+rz*Math.sin(a)])}
 for(const d of doors){pts=pts.filter(q=>!(Math.abs((q[0]-d.x)*d.tx+(q[1]-d.z)*d.tz)<2.75&&(q[0]-d.x)*d.nx+(q[1]-d.z)*d.nz>-3.5));for(const s of[-2.6,-2,2,2.6])pts.push([d.x+d.tx*s,d.z+d.tz*s])}
 pts.sort((a,c)=>Math.atan2(a[1]-cz,a[0]-cx)-Math.atan2(c[1]-cz,c[0]-cx));pts=pts.filter((q,i)=>Math.hypot(q[0]-pts[(i+1)%pts.length][0],q[1]-pts[(i+1)%pts.length][1])>.05);
 return{pts,doors}}
function ugChamber(b,p,Lv,ctx,o){const y=UGLY(Lv),L=ugLocal(b,p,y),rk=o.rock||ugRK(Lv),fl=o.floor||ugFL(Lv),amp=o.amp==null?.75:o.amp,H=3.65,
 cx=o.cx,cz=o.cz,rx=o.rx,rz=o.rz,dome=o.dome==null?Math.min(rx,rz)*.4:o.dome,isle=o.isle;
 const sh0=ugChamberShape(p,o),pts=sh0.pts,doors=sh0.doors;
 /* columns round the wall, about every 0.7 m, with an outward normal */
 const cols=[],nP=pts.length;for(let e=0;e<nP;e++){const A=pts[e],B=pts[(e+1)%nP],len=Math.hypot(B[0]-A[0],B[1]-A[1]),k=Math.max(1,Math.ceil(len/.7));for(let q=0;q<k;q++)cols.push({x:A[0]+(B[0]-A[0])*q/k,z:A[1]+(B[1]-A[1])*q/k})}
 const nc=cols.length;for(let i=0;i<nc;i++){const a=cols[(i+nc-1)%nc],c=cols[(i+1)%nc];let ux=c.x-a.x,uz=c.z-a.z;const l=Math.hypot(ux,uz);cols[i].nx=uz/l;cols[i].nz=-ux/l}
 const onDoor=c=>doors.find(d=>Math.abs((c.x-d.x)*d.nx+(c.z-d.z)*d.nz)<.02&&Math.abs((c.x-d.x)*d.tx+(c.z-d.z)*d.tz)<2.62);
 for(const c of cols){const d=onDoor(c);if(d){c.nx=d.nx;c.nz=d.nz;c.lat=(c.x-d.x)*d.tx+(c.z-d.z)*d.tz;c.door=d}}
 const fade=c=>{let m=9;for(const d of doors){const lat=Math.abs((c.x-d.x)*d.tx+(c.z-d.z)*d.tz),ax=Math.abs((c.x-d.x)*d.nx+(c.z-d.z)*d.nz);m=Math.min(m,Math.hypot(Math.max(0,lat-2),ax))}return Math.min(1,m/1.4)};
 const nz=(x,yy,z)=>{const w=L.pt(x,yy,z);return ugNoise(w.x,w.y,w.z)};
 const Ys=[-.1,.55,1.2,1.9,2.6,3.15,H];
 const pos=[],uv=[],idx=[];const V=(x,yy,z,u,v)=>{pos.push(x,yy,z);uv.push(u,v);return pos.length/3-1};
 const perim=[0];for(let i=1;i<=nc;i++){const a=cols[i-1],c=cols[i%nc];perim.push(perim[i-1]+Math.hypot(c.x-a.x,c.z-a.z))}
 /* the wall: rows of vertices pushed out (into the rock) by the noise, not at the floor or near a doorway */
 /* (the first column is repeated at the end with its own texture position, so the texture has no seam) */
 const W=[];for(let i=0;i<=nc;i++){const c=cols[i%nc],f=fade(c),row=[];for(const yy of Ys){const hy=Math.max(0,Math.min(1,yy/.7)),d=amp*f*hy*nz(c.x,yy,c.z);row.push(V(c.x+c.nx*d,yy,c.z+c.nz*d,perim[i]/3,yy/3))}c.f=f;W.push(row)}
 const inDoor=(a,c)=>a.door&&c.door&&a.door===c.door&&Math.abs(a.lat)<2.01&&Math.abs(c.lat)<2.01;
 for(let i=0;i<nc;i++){const i2=i+1;if(inDoor(cols[i],cols[i2%nc]))continue;for(let j=0;j<Ys.length-1;j++){const a=W[i][j],b2=W[i2][j],c=W[i2][j+1],d=W[i][j+1];idx.push(a,b2,c,a,c,d)}}
 /* the island (a rock pillar the passage goes round): its wall faces out, its top meets the roof */
 let IW=null,ip=null;if(isle){IW=[];ip=[];const bot=isle.bot==null?-.1:isle.bot;for(let i=0;i<=nc;i++){const a=Math.atan2(cols[i%nc].z-isle.cz,cols[i%nc].x-isle.cx),ux=Math.cos(a),uz=Math.sin(a),bx=isle.cx+ux*isle.r,bz=isle.cz+uz*isle.r,row=[];if(i<nc)ip.push([bx,bz]);
   for(const yy of [bot].concat(Ys.slice(1))){const hy=Math.max(0,Math.min(1,yy/.7)),d=amp*hy*nz(bx,yy,bz)*.8;row.push(V(bx-ux*d,yy,bz-uz*d,i*.6/3,yy/3))}IW.push(row)}
  const tgt=isle.key?(isle.idx=[]):idx;for(let i=0;i<nc;i++){const i2=i+1;for(let j=0;j<Ys.length-1;j++){const a=IW[i][j],b2=IW[i2][j],c=IW[i2][j+1],d=IW[i][j+1];tgt.push(a,c,b2,a,d,c)}}}
 /* the roof: rings from the top of the wall in to the middle (or to the island's top), rising into a dome */
 const K=7,top=i=>[pos[W[i][Ys.length-1]*3],pos[W[i][Ys.length-1]*3+2]];let prev=W.map(r=>r[Ys.length-1]);
 for(let k=1;k<=K;k++){const f=k/K,cur=[];for(let i=0;i<=nc;i++){if(isle&&k==K){cur.push(IW[i][Ys.length-1]);continue}const t=top(i),tg=isle?[pos[IW[i][Ys.length-1]*3],pos[IW[i][Ys.length-1]*3+2]]:[cx,cz];
   const x=t[0]+(tg[0]-t[0])*f,z=t[1]+(tg[1]-t[1])*f,sh=isle?Math.sin(Math.PI*f):1-(1-f)*(1-f),yy=H+dome*sh+amp*1.3*nz(x,H+dome*sh,z)*Math.min(1,f*2.5)*(isle?Math.sin(Math.PI*f):1);cur.push(V(x,yy,z,x/3,z/3))}
  for(let i=0;i<nc;i++){const i2=i+1;const a=prev[i],b2=prev[i2],c=cur[i2],d=cur[i];idx.push(a,b2,c,a,c,d)}prev=cur}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();L.geo(rk,geo,0,0,0);
 if(isle&&isle.key){const g2=new THREE.BufferGeometry();g2.setAttribute('position',geo.attributes.position);g2.setAttribute('uv',geo.attributes.uv);g2.setIndex(isle.idx);g2.computeVertexNormals();L.geo(isle.key,g2,0,0,0)}
 /* the doorways: a flat panel between the arch and the roof's edge, and a rock lip round the arch */
 const pf=ugProf(2);for(const d of doors){const sh=new THREE.Shape();sh.moveTo(-2,pf.wy);sh.lineTo(-2,H);sh.lineTo(2,H);sh.lineTo(2,pf.wy);for(let i=pf.P.length-5;i>=4;i--){const q=pf.P[i];if(q[1]>=pf.wy-1e-6)sh.lineTo(q[0],q[1])}
  const g2=new THREE.ShapeGeometry(sh);const pa=g2.attributes.position,uvs=[];for(let i=0;i<pa.count;i++)uvs.push(pa.getX(i)/3,pa.getY(i)/3);g2.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  L.geo(rk,g2,d.x,0,d.z,Math.atan2(-d.tz,d.tx));
  const lp=pf.P.filter(q=>q[1]>-.05).map(q=>{const lx=q[0]*1.06,ly=q[1]<=pf.wy?q[1]:pf.wy+(q[1]-pf.wy)*1.12;return new THREE.Vector3(d.x+d.tx*lx-d.nx*.07,ly,d.z+d.tz*lx-d.nz*.07)});
  lp.unshift(lp[0].clone().setY(-.12));lp.push(lp[lp.length-1].clone().setY(-.12));
  const tg=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lp,false,'centripetal'),40,.19,7,false),tu=tg.attributes.uv;for(let i=0;i<tu.count;i++)tu.setXY(i,tu.getX(i)*4.5,tu.getY(i)*.4);L.geo(rk,tg,0,0,0)}
 /* the floor, with the island and any pits cut out */
 {const sh=new THREE.Shape();pts.forEach((q,i)=>i?sh.lineTo(q[0],-q[1]):sh.moveTo(q[0],-q[1]));
  if(isle&&!o.isleInPit){const hp=new THREE.Path();ip.forEach((q,i)=>i?hp.lineTo(q[0],-q[1]):hp.moveTo(q[0],-q[1]));sh.holes.push(hp)}
  for(const E of o.pits||[]){const hp=new THREE.Path();hp.absellipse(E.cx,-E.cz,E.rx,E.rz,0,Math.PI*2,false,0);sh.holes.push(hp)}
  for(const P2 of o.holes||[]){const hp=new THREE.Path();P2.forEach((q,i)=>i?hp.lineTo(q[0],-q[1]):hp.moveTo(q[0],-q[1]));sh.holes.push(hp)}
  const fg=new THREE.ShapeGeometry(sh,24);fg.rotateX(-Math.PI/2);const pa=fg.attributes.position,uvs=[];for(let i=0;i<pa.count;i++)uvs.push(pa.getX(i)/2.5,pa.getZ(i)/2.5);fg.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));L.geo(fl,fg,0,0,0)}
 /* where the roof is above a point (for columns, roots and stalactites), near enough: the roof is flat between its rings */
 const angOf=(x,z)=>Math.atan2(z-cz,x-cx);
 const rimAt=a=>{for(let i=0;i<nP;i++){const A=pts[i],B=pts[(i+1)%nP],ax=A[0]-cx,az=A[1]-cz,bx=B[0]-cx,bz=B[1]-cz,dx=Math.cos(a),dz=Math.sin(a);const den=dx*(bz-az)-dz*(bx-ax);if(Math.abs(den)<1e-9)continue;const t=(ax*(bz-az)-az*(bx-ax))/den,u=(ax*dz-az*dx)/den;if(t>0&&u>=-1e-6&&u<=1+1e-6)return t}return Math.min(rx,rz)};
 const roofAt=(x,z)=>{const r=Math.hypot(x-cx,z-cz),R0=rimAt(angOf(x,z)),f=Math.max(0,Math.min(1,1-r/R0)),sh=1-(1-f)*(1-f);return H+dome*sh+amp*1.3*nz(x,H+dome*sh,z)*Math.min(1,f*2.5)};
 /* veins round the wall, never near a doorway */
 const R=ugRng(p.id*613+(p.d.v||0)*7+1),vw=o.veinGap||2.8;let next=R()*vw;
 for(let i=0;i<nc;i++){if(perim[i]<next)continue;next=perim[i]+vw*(.7+R()*.6);const c=cols[i];if(c.f<.99||R()<(o.veinSkip==null?.3:o.veinSkip)||(o.noVein&&o.noVein(c.x,c.z)))continue;
  const yy=1+R()*1.4,j=yy<1.55?2:yy<2.25?3:4,pv=pos.slice(W[i][j]*3,W[i][j]*3+3),w=L.pt(pv[0]+c.nx*.06,yy,pv[2]+c.nz*.06),dd=L.dir(-c.nx,-c.nz);
  ctx.veins.push({x:w.x,y:w.y,z:w.z,dx:dd[0],dz:dd[1],t:(o.pick||(()=>{const r=R();return r<.3?'ag':r<.45?'au':r<.58?'cr':r<.8?'fe':'cu'}))()})}
 /* loose stones along the foot of the wall */
 if(o.stones!==false)for(let i=0;i<nc;i+=2){const c=cols[i];if(c.f<1||R()<.45)continue;const s2=.12+R()*.3;L.geo(rk,new THREE.DodecahedronGeometry(s2,0),c.x-c.nx*(.15+s2*.5),s2*.22,c.z-c.nz*(.15+s2*.5),R()*3,R()*3,0,1,.7,1)}
 /* a point on the wall surface at angle a (round the middle) and height yy, with the wall's outward normal */
 const ca=cols.map(c=>Math.atan2(c.z-cz,c.x-cx));
 const wallPt=(a,yy)=>{let i=0;for(let k=0;k<nc;k++){const a0=ca[k],a1=ca[(k+1)%nc];let d1=a1-a0;if(d1<0)d1+=Math.PI*2;let d=a-a0;while(d<0)d+=Math.PI*2;while(d>=Math.PI*2)d-=Math.PI*2;if(d<=d1){i=k;break}}
  const i2=(i+1)%nc;let d1=ca[i2]-ca[i];if(d1<0)d1+=Math.PI*2;let d=a-ca[i];while(d<0)d+=Math.PI*2;const t=Math.min(1,d/(d1||1));let j=0;while(j<Ys.length-2&&Ys[j+1]<yy)j++;const u=Math.max(0,Math.min(1,(yy-Ys[j])/(Ys[j+1]-Ys[j])));
  const P=(ii,jj)=>pos.slice(W[ii][jj]*3,W[ii][jj]*3+3),l=(A,B,k)=>A.map((v,q)=>v+(B[q]-v)*k);const p0=l(P(i,j),P(i2,j),t),p1=l(P(i,j+1),P(i2,j+1),t),q=l(p0,p1,u);
  const nx=cols[i].nx+(cols[i2].nx-cols[i].nx)*t,nz=cols[i].nz+(cols[i2].nz-cols[i].nz)*t,nl=Math.hypot(nx,nz);return{x:q[0],y:yy,z:q[2],nx:nx/nl,nz:nz/nl}};
 return{pts,doors,roofAt,wallPt,L,cols,H,isle:ip,dome}}

/* ---------- small cave things, in piece-local coords through L ---------- */
/* a column from floor to roof: an hourglass of flowstone, sunk into both */
function ugColumn(L,x,z,r,top,key,R){const n=9,pr=[];for(let i=0;i<=n;i++){const t=i/n,w=r*(.55+.45*Math.pow(Math.abs(t-.5)*2,1.6))*(1+.08*Math.sin(i*2.3+r*7));pr.push(new THREE.Vector2(w,-.1+(top+1.1)*t))}
 const g=new THREE.LatheGeometry(pr,14);L.geo(key||'flow',g,x,0,z,R?R()*6:0)}
/* a stalagmite (up from the floor) or a stalactite (down from the roof: dn=true, y0 = the roof there) */
function ugDrip(L,x,z,r,h,y0,dn,key){if(dn){/* reaches 0.9 m up into the roof, which is only near enough known between its rings */const g=new THREE.ConeGeometry(r*(h+.9)/h,h+.9,9,3);g.rotateX(Math.PI);L.geo(key||'flow',g,x,y0-h/2+.45,z)}else{const g=new THREE.ConeGeometry(r,h,9,3);L.geo(key||'flow',g,x,h/2-.05,z)}}
/* a crystal cluster: a few six-sided crystals with pointed tips, leaning out from a sunk base. s: size */
function ugCrystals(L,R,x,z,s,key,y0,up){const n=3+(R()*4|0);for(let i=0;i<n;i++){const h=s*(.6+R()*.9),r=s*(.09+R()*.07),a=R()*6.28,lean=.15+R()*.55;
  const g=new THREE.CylinderGeometry(r,r*1.1,h,6);g.translate(0,h/2,0);const tip=new THREE.ConeGeometry(r,r*2.2,6);tip.translate(0,h+r*1.1,0);
  const M=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.cos(a)*lean,R()*3,Math.sin(a)*lean));for(const q of[g,tip]){q.applyMatrix4(M);L.geo(key||'crystal',q,x+Math.cos(a)*s*.08,(y0||0)-.06,z+Math.sin(a)*s*.08)}}}
/* a mushroom: pale stem, a domed cap (glowing for the big cave kinds), gills under it. lean: [dx,dz] */
function ugMushroom(L,R,x,z,h,cr,key,lean,y0){y0=y0||0;lean=lean||[0,0];const tx=x+lean[0],tz=z+lean[1],len=Math.hypot(lean[0],lean[1],h);
 const st=new THREE.CylinderGeometry(Math.max(.06,cr*.16),Math.max(.09,cr*.24),len+.05,10);st.translate(0,len/2,0);
 st.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(lean[0],h,lean[1]).normalize())));L.geo('stem',st,x,y0-.05,z);
 const cap=new THREE.SphereGeometry(cr,18,8,0,Math.PI*2,0,Math.PI*.45);cap.scale(1,.55,1);L.geo(key||'capP',cap,tx,y0+h-cr*.12,tz);
 const gi=new THREE.CircleGeometry(cr*.985*Math.sin(Math.PI*.45),18);gi.rotateX(Math.PI/2);L.geo('gill',gi,tx,y0+h-cr*.12+cr*.55*Math.cos(Math.PI*.45)-.004,tz);
 return[tx,y0+h,tz]}

/* ---------- the level 2 and 3 pieces ---------- */
function ugPieceL2(b,p,Lv,ctx){if(Lv==0)return false;const t=p.type,y=UGLY(Lv),R=ugRng(p.id*331+17),W=ugWorld(p);
 /* the miners' tunnels: timbered, this level's rock, no rails */
 if(t=='join'||t=='drive'){for(const s of W.shp)if(s.k=='path'){const tr=ugTube(b,s.pts.map(q=>[q[0],y,q[1]]),{hw:2,fil:t=='join'?3:0,rails:false,lampsOut:ctx.lamps,lampOff:p.id%2,rock:ugRK(Lv),floorKey:ugFL(Lv)});
   for(let sd=3+R()*3;sd<tr.L-2;sd+=5+R()*4){const f=tr.at(sd),side=R()<.5?-1:1;if(R()<.35)continue;ctx.veins.push({x:f.p[0]+f.r[0]*side*2.06,y:y+1+R()*.9,z:f.p[2]+f.r[1]*side*2.06,dx:-f.r[0]*side,dz:-f.r[1]*side,t:R()<.3?'ag':R()<.6?'fe':'cu'})}}return true}
 /* cave passages and bends */
 if(t=='cpass'||t=='cbend'){for(const s of W.shp)if(s.k=='path'){const c=ugCave(b,s.pts.map(q=>[q[0],y,q[1]]),{rock:ugRK(Lv),floor:ugFL(Lv)});c.rk=ugRK(Lv);ugCaveDress(b,c,ctx,R,Lv)}return true}
 if(t=='stream'){ugStream(b,p,Lv,ctx,W,R);return true}
 if(t=='orepass'){ugOrePass(b,p,Lv,ctx,W);return true}
 const blob=p.d.shp.find(s=>s.k=='blob');
 if(t=='fork'){const ch=ugChamber(b,p,Lv,ctx,{cx:blob.cx,cz:blob.cz,rx:blob.rx,rz:blob.rz,dome:2.6});const L=ch.L,v=p.d.v||0;
  if(v==1){const q=p.d.fx.find(f=>f.n=='boulder').pts[0];const g=new THREE.IcosahedronGeometry(1.35,1);const pa=g.attributes.position;for(let i=0;i<pa.count;i++){const w=L.pt(q[0]+pa.getX(i),pa.getY(i),q[1]+pa.getZ(i)),k=.8+.45*ugNoise(w.x*1.3,w.y*1.3,w.z*1.3);pa.setXYZ(i,pa.getX(i)*k,pa.getY(i)*k,pa.getZ(i)*k)}g.computeVertexNormals();L.geo(ugRK(Lv),g,q[0],.75,q[1],R()*3,0,0,1.1,.85,1.1);
   for(let i=0;i<7;i++){const a=R()*6.28,d=1.6+R()*.8,s2=.12+R()*.2;L.geo(ugRK(Lv),new THREE.DodecahedronGeometry(s2,0),q[0]+Math.cos(a)*d,s2*.3,q[1]+Math.sin(a)*d,R()*3,R()*3,0)}}
  if(v==2){for(const f of p.d.fx.filter(f=>f.k=='cols'))for(const q of f.pts)ugColumn(L,q[0],q[1],f.r||.5,ch.roofAt(q[0],q[1]),'flow',R);
   for(let i=0;i<14;i++){const x=blob.cx+(R()-.5)*blob.rx*1.3,z=blob.cz+(R()-.5)*blob.rz*1.3;if(Math.hypot((x-blob.cx)/blob.rx,(z-blob.cz)/blob.rz)>.8)continue;const h=.3+R()*.8;ugDrip(L,x,z,.08+R()*.1,h,ch.roofAt(x,z),true)}}
  return true}
 if(t=='island'){const v=p.d.v||0,fi=p.d.fx.find(f=>f.k=='isle')||{cx:0,cz:-12};const base={cx:0,cz:-12,rx:10,rz:12};
  if(v==2){/* Mushroom island: a low mound under one big dome, giant mushrooms on it leaning out over the passage */
   const ch=ugChamber(b,p,Lv,ctx,Object.assign({dome:5.2},base)),L=ch.L;const m=new THREE.SphereGeometry(1,24,8,0,Math.PI*2,0,Math.PI/2);L.geo(ugRK(Lv),m,fi.cx,-.05,fi.cz,0,0,0,5.3,1.1,5.3);
   const rs=p.d.fx.find(f=>f.k=='ringspots');for(let i=0;i<rs.n;i++){const a=i/rs.n*6.28+.3,x=rs.cx+Math.cos(a)*rs.rx,z=rs.cz+Math.sin(a)*rs.rz,yb=1.1*Math.sqrt(Math.max(0,1-(rs.rx/5.3)**2))-.05;
    const top=ugMushroom(L,R,x,z,2.6+R()*1.2,1.7+R()*.6,'capP',[Math.cos(a)*1.1,Math.sin(a)*1.1],yb);const w=L.pt(top[0],top[1]-.4,top[2]);ctx.lamps.push([w.x,w.y,w.z,.9])}
   for(let i=0;i<10;i++){const a=R()*6.28,r=R()*3.2;ugMushroom(L,R,fi.cx+Math.cos(a)*r,fi.cz+Math.sin(a)*r,.4+R()*.5,.25+R()*.2,'capG',[0,0],1.1*Math.sqrt(Math.max(0,1-(r/5.3)**2))-.08)}
   return true}
  const flood=v==3,cry=v==1;
  const ch=ugChamber(b,p,Lv,ctx,Object.assign({dome:3.4,isle:{cx:fi.cx,cz:fi.cz,r:5.3,bot:flood?-.3:-.1,key:cry?'crystalP':null},isleInPit:flood,pits:flood?[{cx:0,cz:-12,rx:9.4,rz:9.4}]:[],rock:ugRK(Lv)},base)),L=ch.L;
  if(flood)ugPool(L,{cx:0,cz:-12,rx:9.4,rz:9.4},{prof:[[1,0],[.985,-.1],[.96,-.17],[0,-.2]],surf:-.04,dep:.2,key:'waterS',rock:'wet2',hole:ch.isle});
  if(cry){/* the island is one great crystal pillar: its face shows through in glowing crystal, big crystals jut out of it */
   const rs=p.d.fx.find(f=>f.k=='ringspots');
   for(let i=0;i<rs.n;i++){const a=i/rs.n*6.28;ugCrystals(L,R,fi.cx+Math.cos(a)*4.75,fi.cz+Math.sin(a)*4.75,1.3+R()*.9,'crystal',.1+R()*1.7)}
   for(const a of[0,1.57,3.14,4.71]){const w=L.pt(fi.cx+Math.cos(a)*6.2,2,fi.cz+Math.sin(a)*6.2);ctx.lamps.push([w.x,w.y,w.z,1.2])}}
  return true}
 if(blob&&['crystal','fungus','flooded','chasm','hall'].includes(t)){const dm={crystal:3.6,fungus:5,flooded:2.8,chasm:4.2,hall:4.4};
  if(typeof ugCaveRoom=='function'&&ugCaveRoom(b,p,Lv,ctx,blob))return true;
  ugChamber(b,p,Lv,ctx,{cx:blob.cx,cz:blob.cz,rx:blob.rx,rz:blob.rz,dome:dm[t]});return true}
 return false}

/* ---------- the stream crossing: a cave passage with a stream across it ---------- */
function ugStream(b,p,Lv,ctx,W,R){const v=p.d.v||0,y=UGLY(Lv),T=ugT(p),path=W.shp.find(s=>s.k=='path');
 const sf=p.d.fx.find(f=>f.k=='stream'),wf=p.d.fx.find(f=>f.k=='water');
 if(!sf){/* Stream tunnel: ankle-deep water along the passage */const c=ugCave(b,path.pts.map(q=>[q[0],y,q[1]]),{rock:ugRK(Lv),floor:ugFL(Lv)});c.rk=ugRK(Lv);ugCaveDress(b,c,ctx,R,Lv);
  const L=ugLocal(b,p,y);L.geo('stream',new THREE.CircleGeometry(1,40),wf.cx,.07,wf.cz,0,-Math.PI/2,0,wf.rx,wf.rz,1);
  const rg=new THREE.RingGeometry(.92,1.08,40);L.geo('wet2',rg,wf.cx,.012,wf.cz,0,-Math.PI/2,0,wf.rx,wf.rz,1);return}
 const w=sf.w||1.2,dep=sf.deep?1.1:.4,a=T(sf.pts[0][0],sf.pts[0][1]),c2=T(sf.pts[1][0],sf.pts[1][1]),ux=c2[0]-a[0],uz=c2[1]-a[1],ul=Math.hypot(ux,uz),u=[ux/ul,uz/ul],nrm=[-u[1],u[0]];
 /* which side of the stream the entry is on: keep the floor on the far side of each bank */
 const ent=[p.x,p.z],sd=Math.sign((ent[0]-a[0])*nrm[0]+(ent[1]-a[1])*nrm[1])||1,n=[nrm[0]*sd,nrm[1]*sd];
 const H1=[-n[0],-n[1],(a[0]+n[0]*w/2)*n[0]+(a[1]+n[1]*w/2)*n[1]],H2=[n[0],n[1],-((a[0]-n[0]*w/2)*n[0]+(a[1]-n[1]*w/2)*n[1])];
 const c=ugCave(b,path.pts.map(q=>[q[0],y,q[1]]),{rock:ugRK(Lv),floor:ugFL(Lv),keep:[H1,H2]});c.rk=ugRK(Lv);ugCaveDress(b,c,ctx,R,Lv);
 /* the banks meet the passage's floor edges: find those four corners */
 const side=k=>{const o=[];for(let i=0;i<c.n;i++)o.push(c.edge(i)[k]);return o};const Ls=side(0),Rs=side(1);
 const hit=(poly,P0,d)=>{for(let i=0;i<poly.length-1;i++){const A=poly[i],B=poly[i+1],ex=B[0]-A[0],ez=B[1]-A[1],den=d[0]*ez-d[1]*ex;if(Math.abs(den)<1e-9)continue;const t=((A[0]-P0[0])*ez-(A[1]-P0[1])*ex)/den,s=((A[0]-P0[0])*d[1]-(A[1]-P0[1])*d[0])/den;if(s>=0&&s<=1)return[P0[0]+d[0]*t,P0[1]+d[1]*t]}return null};
 const e1=[a[0]+n[0]*w/2,a[1]+n[1]*w/2],e2=[a[0]-n[0]*w/2,a[1]-n[1]*w/2];const C={a1:hit(Ls,e1,u),b1:hit(Rs,e1,u),a2:hit(Ls,e2,u),b2:hit(Rs,e2,u)};if(!C.a1||!C.b1||!C.a2||!C.b2)return;
 const pos=[],q4=(A,B,Cc,D,want)=>{const v1=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],v2=[Cc[0]-A[0],Cc[1]-A[1],Cc[2]-A[2]],cr=[v1[1]*v2[2]-v1[2]*v2[1],v1[2]*v2[0]-v1[0]*v2[2],v1[0]*v2[1]-v1[1]*v2[0]];const ok=cr[0]*want[0]+cr[1]*want[1]+cr[2]*want[2]>0;for(const q of ok?[A,B,Cc,A,Cc,D]:[A,Cc,B,A,D,Cc])pos.push(q[0],q[1],q[2])};
 const P3=(q,yy)=>[q[0],y+yy,q[1]];
 /* the banks (rock faces down to the bed), the ends where the stream runs under the walls, the bed */
 q4(P3(C.a1,0),P3(C.b1,0),P3(C.b1,-dep),P3(C.a1,-dep),[-n[0],0,-n[1]]);q4(P3(C.a2,0),P3(C.b2,0),P3(C.b2,-dep),P3(C.a2,-dep),[n[0],0,n[1]]);
 const mid=[(C.a1[0]+C.b2[0])/2,(C.a1[1]+C.b2[1])/2];for(const [A,B] of[[C.a1,C.a2],[C.b1,C.b2]]){const wd=[mid[0]-A[0],0,mid[1]-A[1]];q4(P3(A,.02),P3(B,.02),P3(B,-dep),P3(A,-dep),wd)}
 q4(P3(C.a1,-dep),P3(C.b1,-dep),P3(C.b2,-dep),P3(C.a2,-dep),[0,1,0]);
 b.raw('wet2',pos,(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return Array.from(g.attributes.normal.array)})(),pos.map((v,i)=>i%3==1?null:v/2).filter(v=>v!==null));
 /* the water, flowing along u (v of the texture runs downstream) */
 const sy=y-(sf.deep?.3:.12),wp=[],wn=[],wu=[],cs=[C.a1,C.a2,C.b2,C.b1];const tri=[[0,1,2],[0,2,3]];const uvq=q=>[((q[0]-a[0])*n[0]+(q[1]-a[1])*n[1])/w,((q[0]-a[0])*u[0]+(q[1]-a[1])*u[1])/4];
 for(const tr of tri){let T3=tr.map(i=>cs[i]);const cr=(T3[1][0]-T3[0][0])*(T3[2][1]-T3[0][1])-(T3[1][1]-T3[0][1])*(T3[2][0]-T3[0][0]);if(cr>0)T3=[T3[0],T3[2],T3[1]];for(const q of T3){wp.push(q[0],sy,q[1]);wn.push(0,1,0);wu.push(...uvq(q))}}
 b.raw('stream',wp,wn,wu);
 /* stepping stones, or the plank footbridge with a rope rail */
 const L=ugLocal(b,p,y);
 for(const f of p.d.fx){if(f.k=='stones')for(const q of f.pts){const g=new THREE.CylinderGeometry(.36,.48,dep+.06,7);L.geo(ugRK(Lv),g,q[0],-dep/2+.02,q[1],R()*3)}
  if(f.k=='bridge'){const dx=f.x1-f.x0,dz=f.z1-f.z0,l=Math.hypot(dx,dz),yaw=Math.atan2(dx,dz),ux2=dx/l,uz2=dz/l,rx2=uz2,rz2=-ux2;
   for(let s=.15;s<l;s+=.3)L.box('woodD',.95,.06,.26,f.x0+ux2*s,.08,f.z0+uz2*s,yaw);for(const s2 of[-.42,.42])L.box('wood',.1,.1,l,f.x0+dx/2+rx2*s2,.03,f.z0+dz/2+rz2*s2,yaw);
   for(const s2 of[-.5,.5]){for(const e of[0,l]){L.box('wood',.08,1,.08,f.x0+ux2*e+rx2*s2,.5,f.z0+uz2*e+rz2*s2,yaw)}L.geo('rope',new THREE.CylinderGeometry(.022,.022,l,6).rotateX(Math.PI/2),f.x0+dx/2+rx2*s2,.92,f.z0+dz/2+rz2*s2,yaw)}}}}

/* ---------- the ore pass: a short dug room at the end of a timbered neck, a grate over a chute to the cage's cart ---------- */
function ugOrePass(b,p,Lv,ctx,W){const y=UGLY(Lv),L=ugLocal(b,p,y),v=p.d.v||0,rk=ugRK(Lv),fl=ugFL(Lv),T=ugT(p);
 const path=W.shp.find(s=>s.k=='path'),lr=p.d.shp.find(s=>s.k=='rect'),r={x0:lr.x0,x1:lr.x1,z0:lr.z0,z1:lr.z1};
 const op=ugOpenings(p);for(const [q,nb] of[[path.pts[0],path.pts[1]]]){if(!op.some(o=>Math.hypot(o.x-q[0],o.z-q[1])<.05))continue;const fx=q[0]-nb[0],fz=q[1]-nb[1],l=Math.hypot(fx,fz);ugBulkhead(b,q[0],y,q[1],fx/l,fz/l,path.w/2,{rock:rk})}
 ugTube(b,path.pts.map(q=>[q[0],y,q[1]]),{hw:path.w/2,fil:0,rails:false,sets:true,lamps:false,rock:rk,floorKey:fl});
 const g=p.d.fx.find(f=>f.k=='grate'),gh=.85,a=L.pt(g.x-gh,0,g.z-gh),c=L.pt(g.x+gh,0,g.z+gh);
 const hole={x0:Math.min(a.x,c.x),x1:Math.max(a.x,c.x),z0:Math.min(a.z,c.z),z1:Math.max(a.z,c.z)};
 ugRectRoom(b,p,r,3.4,y,{doors:ugDoorsFor(p,r),rock:rk,floor:fl,holes:[hole]});
 /* the chute: rock sides going down, dark below; the grate (or the grizzly's heavy bars) over it */
 const D=3;for(const [ax,az,ry] of[[0,-gh,0],[gh,0,-Math.PI/2],[0,gh,Math.PI],[-gh,0,Math.PI/2]])L.geo(rk,new THREE.PlaneGeometry(2*gh,D),g.x+ax,-D/2,g.z+az,ry);L.geo('black',new THREE.PlaneGeometry(2*gh,2*gh),g.x,-D+.01,g.z,0,-Math.PI/2);
 const bw=v==1?.12:.05,sp=v==1?.3:.18;L.box('steel',2*gh+.4,.08,.14,g.x,.045,g.z-gh-.06,0);L.box('steel',2*gh+.4,.08,.14,g.x,.045,g.z+gh+.06,0);
 for(let x=-gh+sp/2;x<gh;x+=sp)L.box('steel',bw,v==1?.12:.06,2*gh+.3,g.x+x,v==1?.065:.035,g.z,0);if(v!=1)for(const z of[-.4,.4])L.box('steel',2*gh+.2,.04,.05,g.x,.075,g.z+z,0);
 if(v==1){/* the hammer rack: a board on the nearest side wall, a peg, a sledgehammer hanging from it */const q=p.d.fx.find(f=>f.n=='hammer rack').pts[0],sx=Math.sign(q[0])||1,wx=sx>0?r.x1:r.x0,bx=wx-sx*.07;
  L.box('wood',.12,1.2,.9,bx,1.1,q[1],0);L.box('woodD',.22,.06,.06,bx-sx*.15,1.45,q[1],0);L.cyl('woodD',.025,.025,.95,bx-sx*.2,.95,q[1],8);L.box('steel',.14,.14,.3,bx-sx*.2,.46,q[1],0)}
 if(v==2){const rl=p.d.fx.find(f=>f.k=='rail'),q=p.d.fx.find(f=>f.n=='skip').pts[0];const w1=T(rl.pts[0][0],rl.pts[0][1]),w2=T(rl.pts[1][0],rl.pts[1][1]+.4);ugRailLine(b,[w1,w2],y,ctx,0);
  const wk=T(q[0],q[1]);ugCart(b,wk[0],y,wk[1],ugYaw(p));L.box('oreRock',.8,.12,1.2,q[0],.9,q[1],0)}
 /* a lamp, and veins in the dug walls */
 ugHangLamp(L,ctx,0,-3.2,2.5,3.4,1);ugWallVeins(L,r,ugLocalDoors(p,r),ctx,ugRng(p.id*41+3),{gap:2.6,ys:[.9,2],pick:()=>'ag',skip:.4})}

/* ---------- the level 2 stations: the kit builds the room and the shaft; these are their own props ---------- */
{const p0=ugProp;ugProp=function(b,n,x,y,z,yaw,r,ctx){const c=Math.cos(yaw),s=Math.sin(yaw),at=(lx,lz)=>[x+c*lx+s*lz,z-s*lx+c*lz];
 if(n=='map board'){b.box('board',1.7,1.1,.08,x,y+1.55,z,yaw);for(const sd of[-.7,.7]){const q=at(sd,-.1);b.box('woodD',.1,2.2,.1,q[0],y+1.1,q[1],yaw)}if(ctx){const q=at(0,.05);ctx.signs.push({x:q[0],y:y+1.55,z:q[1],yaw,txt:'LEVEL 2 MAP',w:1.5,map:1})}return}
 if(n=='pump'){b.box('dark',1.3,.25,1.3,x,y+.125,z,yaw);b.cyl('steel',.42,.42,1.1,x,y+.8,z,18);b.cyl('dark',.5,.5,.1,x,y+1.4,z,18);b.cyl('steel',.12,.12,4.2,x,y+3.4,z,10);const q=at(.6,0);b.cyl('dark',.32,.32,.5,q[0],y+.6,q[1],14,yaw,0,Math.PI/2);return}
 if(n=='air bottles'){b.box('steel',.9,.08,.5,x,y+.04,z,yaw);for(let i=0;i<4;i++){const q=at(-.33+i*.22,0);b.cyl('paintY',.09,.09,1.3,q[0],y+.73,q[1],12);b.cyl('steel',.03,.03,.12,q[0],y+1.44,q[1],8)}b.box('steel',.9,.05,.05,x,y+1.0,z,yaw);return}
 if(n=='refuge chamber'){/* a steel box with a heavy door on its front, air bottles inside */const w=2.6,d=2.2,h=2.3;b.box('paintY',w,h,d,x,y+h/2,z,yaw);b.box('dark',w+.08,.12,d+.08,x,y+h+.06,z,yaw);
  /* the door is on the side facing the room (local -z) */const q=at(0,-d/2-.03);b.box('steel',.9,1.9,.06,q[0],y+1,q[1],yaw);const q2=at(-.3,-d/2-.08);b.cyl('steel',.14,.14,.05,q2[0],y+1.1,q2[1],14,yaw,Math.PI/2);if(ctx){const q3=at(0,-d/2-.07);ctx.signs.push({x:q3[0],y:y+2.05,z:q3[1],yaw:yaw+Math.PI,txt:'REFUGE',w:1.1})}return}
 return p0.apply(this,arguments)}}
{const s0=ugStationBuild;ugStationBuild=function(b,p,L,ctx){s0(b,p,L,ctx);if(L==0)return;const y=UGLY(L),T=ugT(p),v=p.d.v||0;
 /* Cave station: a timber platform round the cage */
 if(v==0&&L==1){for(const [x0,x1,z0,z1] of[[-4.2,4.2,1.9,4.2],[-4.2,4.2,-4.2,-1.9],[-4.2,-1.9,-1.9,1.9],[1.9,4.2,-1.9,1.9]]){const a=T(x0,z0),c=T(x1,z1);b.box('plank',Math.abs(c[0]-a[0]),.1,Math.abs(c[1]-a[1]),(a[0]+c[0])/2,y+.05,(a[1]+c[1])/2,0)}}
 /* puddles (the pumping station) */
 for(const f of p.d.fx)if(f.k=='water'){const w=T(f.cx,f.cz),sw=p.r%2==1;b.add('waterS',new THREE.CircleGeometry(1,32).rotateX(-Math.PI/2),new THREE.Matrix4().compose(new THREE.Vector3(w[0],y+.015,w[1]),new THREE.Quaternion(),new THREE.Vector3(sw?f.rz:f.rx,1,sw?f.rx:f.rz)))}}}
