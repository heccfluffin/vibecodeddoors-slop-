/* =====================================================================================================
   The Old Quarry underground, batch 4: LEVEL 3, THE DEEP (docs/design/quarry-underground.md).
   Needs quarry-under.js, -kit.js, -l1.js, -l2.js and -l2r.js. ugPieceL2 asks ugPieceL3(b, p, L, ctx) first; it builds
   the level 3 pieces: the basalt gallery, the magma chamber, the dark cave, the Geode, the hot seam and the old shaft.
   The shared cave pieces (passages, bends, forks, islands, ore passes) come from -l2.js in this level's dark rock.
   Hazards come from the plan (lava rivers, lakes, the moat, chasms, the sinkhole, deep water: tested by
   quarry-under-check.js). Extra things the game needs: ctx.hot (glowing crust patches that burn, mine coords
   {x, z, r}), ctx.moving (the sealed station's steel doors, each a group turning on its hinge) and ctx.portal (the
   old shaft's door 60).
   ===================================================================================================== */

/* ---------- materials ---------- */
{const k0=ugKit;ugKit=function(){const K=k0();if(K.l3)return K;K.l3=1;const M=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.9},o));const rnd=ugRng(3301);
 /* lava: glowing orange with darker crust drifting on it (the game scrolls K.lavaT.offset slowly, about 0.02 per second) */
 K.lavaT=ugCanvas(256,256,(k,w,h)=>{k.fillStyle='#ff7a1a';k.fillRect(0,0,w,h);const wrap=f=>{for(const dx of[-w,0,w])for(const dy of[-h,0,h]){k.save();k.translate(dx,dy);f();k.restore()}};
  for(let i=0;i<60;i++){const x=rnd()*w,y=rnd()*h,r=8+rnd()*30;wrap(()=>{const g=k.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(255,230,120,.9)');g.addColorStop(1,'rgba(255,140,30,0)');k.fillStyle=g;k.beginPath();k.arc(x,y,r,0,7);k.fill()})}
  for(let i=0;i<34;i++){const x=rnd()*w,y=rnd()*h,r=6+rnd()*20;wrap(()=>{k.fillStyle='rgba(90,20,8,'+(.45+rnd()*.4)+')';k.beginPath();k.ellipse(x,y,r,r*(.4+rnd()*.5),rnd()*3,0,7);k.fill()})}});
 /* falling lava: streaks of yellow on orange (the game scrolls K.lavaFT.offset.y, about +0.5 per second) */
 K.lavaFT=ugCanvas(128,256,(k,w,h)=>{k.fillStyle='#e05010';k.fillRect(0,0,w,h);for(let i=0;i<90;i++){const x=rnd()*w,lw=2+rnd()*6,ph=rnd()*6.28;for(let y=0;y<h;y+=4){const a=.25+.35*Math.sin(y/h*Math.PI*2*(1+(i%3))+ph);k.fillStyle='rgba(255,220,90,'+Math.max(0,a).toFixed(2)+')';k.fillRect(x-lw/2,y,lw,4.5)}}});
 /* cooled crust: dark plates, thin glowing cracks between them */
 K.crustT=ugCanvas(256,256,(k,w,h)=>{k.fillStyle='#ff6a1a';k.fillRect(0,0,w,h);const pts=[];for(let i=0;i<26;i++)pts.push([rnd()*w,rnd()*h]);
  const im=k.getImageData(0,0,w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let d1=1e9,d2=1e9;for(const p of pts)for(const dx of[-w,0,w])for(const dy of[-h,0,h]){const d=(x-p[0]-dx)**2+(y-p[1]-dy)**2;if(d<d1){d2=d1;d1=d}else if(d<d2)d2=d}
   const e=Math.sqrt(d2)-Math.sqrt(d1),i=(y*w+x)*4;if(e>2.2){const v=34+((x*7+y*13)%9);im.data[i]=v;im.data[i+1]=v-4;im.data[i+2]=v-6}}k.putImageData(im,0,0)});
 K.crustE=ugCanvas(256,256,(k,w,h)=>{k.drawImage(K.crustT.image,0,0);const im=k.getImageData(0,0,w,h);for(let i=0;i<im.data.length;i+=4){if(im.data[i]<120){im.data[i]=im.data[i+1]=im.data[i+2]=0}}k.putImageData(im,0,0)});
 Object.assign(K.mat,{
  lava:new THREE.MeshBasicMaterial({map:K.lavaT}),
  lavaFall:new THREE.MeshBasicMaterial({map:K.lavaFT,side:THREE.DoubleSide}),
  crust:M({map:K.crustT,emissive:0xffffff,emissiveMap:K.crustE,emissiveIntensity:.9,roughness:.85}),
  basalt:M({color:0x2e2a2a,roughness:.7,flatShading:true}),
  obsidian:new THREE.MeshStandardMaterial({color:0x141018,roughness:.08,metalness:.35,flatShading:true}),
  obsidianF:new THREE.MeshStandardMaterial({map:K.gravT,color:0x2a2630,roughness:.2,metalness:.2}),
  rockK:M({map:K.rockT,color:0x3e3634}),
  amethyst:new THREE.MeshStandardMaterial({color:0xb070e8,emissive:0x5a1a8a,emissiveIntensity:.75,roughness:.12,flatShading:true}),
  celestine:new THREE.MeshStandardMaterial({color:0xa8d0ff,emissive:0x2a5ab0,emissiveIntensity:.7,roughness:.12,flatShading:true}),
  citrine:new THREE.MeshStandardMaterial({color:0xffc840,emissive:0x9a6a00,emissiveIntensity:.7,roughness:.12,flatShading:true}),
  smoky:new THREE.MeshStandardMaterial({color:0x4a4440,emissive:0x0c0a08,roughness:.08,metalness:.25,flatShading:true}),
  clearC:new THREE.MeshStandardMaterial({color:0xf4faff,emissive:0xa8b8d0,emissiveIntensity:1,roughness:.1,flatShading:true}),
  uran:new THREE.MeshStandardMaterial({color:0x9cff5a,emissive:0x3a9a20,emissiveIntensity:1,roughness:.3,flatShading:true}),
  urRock:M({map:K.rockT,color:0x5e6254,emissive:0x16300c,emissiveIntensity:.35}),
  poolG:new THREE.MeshStandardMaterial({color:0x6ad04a,emissive:0x2a7a1a,emissiveIntensity:.7,roughness:.1,transparent:true,opacity:.65,depthWrite:false,normalMap:K.poolN,normalScale:new THREE.Vector2(.25,.25)}),
  poolK:new THREE.MeshStandardMaterial({color:0x0a1218,roughness:.05,metalness:.5,transparent:true,opacity:.85,depthWrite:false,normalMap:K.poolN,normalScale:new THREE.Vector2(.15,.15)}),
  bat:M({color:0x241c1e,roughness:1}),guano:M({map:K.gravT,color:0xc8c0b0,roughness:1}),
  /* the geodes' banded stone shells, tinted to their crystals */
  geoA:M({map:K.rockT,color:0x6a5870}),geoC:M({map:K.rockT,color:0x5e6a7c}),geoT:M({map:K.rockT,color:0x7a6a50}),geoS:M({map:K.rockT,color:0x4a4644})});
 for(const k in K.mat)K.mat[k].userData.ug=k;for(const k of['poolG','poolK'])K.mat[k].userData.ro=2;return K}}

/* ---------- helpers ---------- */
/* a band cut through a cave room's floor along a centre line (a lava river, a chasm): it runs into the walls, or narrows
   to nothing where it ends inside the room. bl: the room's oval; returns the hole polygon (local coords) */
function ugBand(L0,bl,line,w){const inE=q=>Math.hypot((q[0]-bl.cx)/bl.rx,(q[1]-bl.cz)/bl.rz)<.9;let cl=line.map(q=>q.slice());const ext=(a,c,ln)=>{const dx=a[0]-c[0],dz=a[1]-c[1],l=Math.hypot(dx,dz);return[a[0]+dx/l*ln,a[1]+dz/l*ln]};
 const t0=inE(cl[0]),t1=inE(cl[cl.length-1]);cl.unshift(ext(cl[0],cl[1],t0?1.3:3));cl.push(ext(cl[cl.length-1],cl[cl.length-2],t1?1.3:3));
 const P=[];for(let i=1;i<cl.length;i++){const a=cl[i-1],c=cl[i],n=Math.max(1,Math.ceil(Math.hypot(c[0]-a[0],c[1]-a[1])/.6));for(let k=i==1?0:1;k<=n;k++)P.push([a[0]+(c[0]-a[0])*k/n,a[1]+(c[1]-a[1])*k/n])}
 const S=[0];for(let i=1;i<P.length;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const Ln=S[S.length-1];
 const hw=i=>{let k=1;if(t0)k=Math.min(k,Math.max(0,S[i])/1.3);if(t1)k=Math.min(k,(Ln-S[i])/1.3);const w0=L0.pt(P[i][0],0,P[i][1]);return w/2*Math.sqrt(Math.max(0,k))*(.85+.3*ugNoise(w0.x*.7,0,w0.z*.7))};
 const Lf=[],Rt=[];for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],c=P[Math.min(P.length-1,i+1)];let tx=c[0]-a[0],tz=c[1]-a[1];const l=Math.hypot(tx,tz);tx/=l;tz/=l;const h=hw(i);Lf.push([P[i][0]-tz*h,P[i][1]+tx*h]);Rt.push([P[i][0]+tz*h,P[i][1]-tx*h])}
 let hole=Lf.concat(Rt.reverse());if(ugArea(hole)<0)hole.reverse();const ell=[];for(let i=0;i<64;i++){const a=i/64*Math.PI*2;ell.push([bl.cx+(bl.rx-.1)*Math.cos(a),bl.cz+(bl.rz-.1)*Math.sin(a)])}if(ugArea(ell)<0)ell.reverse();
 return ugClip(hole,ell).filter((q,i,A)=>Math.hypot(q[0]-A[(i+1)%A.length][0],q[1]-A[(i+1)%A.length][1])>.02)}
/* the rough rock sides of a hole in the floor, from the floor down to -D, facing into the hole; key at the bottom (or none) */
function ugHoleSides(L,L0,hole,D,rk,bottom,by){const n=hole.length,rows=[0,-.4,-.9,-1.6,-2.5,-3.6,-5,-7,-D].filter(v=>v>=-D),pos=[],uv=[],idx=[],ar=ugArea(hole)>0;let s=0;const cols=[];
 for(let i=0;i<n;i++){const a=hole[(i+n-1)%n],c=hole[(i+1)%n];let ux=c[0]-a[0],uz=c[1]-a[1];const l=Math.hypot(ux,uz)||1;cols.push({x:hole[i][0],z:hole[i][1],ox:(ar?uz:-uz)/l,oz:(ar?-ux:ux)/l,s});s+=Math.hypot(hole[(i+1)%n][0]-hole[i][0],hole[(i+1)%n][1]-hole[i][1])}
 if(rows[rows.length-1]>-D)rows.push(-D);for(const c of cols)for(const yy of rows){const w=L0.pt(c.x,yy,c.z),d=.45*Math.min(1,-yy/.8)*ugNoise(w.x,w.y,w.z);pos.push(c.x+c.ox*d,yy,c.z+c.oz*d);uv.push(c.s/3,yy/3)}
 const m=rows.length;for(let i=0;i<n;i++){const i2=(i+1)%n;for(let j=0;j<m-1;j++){const a=i*m+j,b2=i2*m+j,c=i2*m+j+1,d=i*m+j+1;idx.push(a,b2,c,a,c,d)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 {const nA=g.attributes.normal;let sm=0;for(let i=0;i<n;i++)sm+=nA.getX(i*m+1)*-cols[i].ox+nA.getZ(i*m+1)*-cols[i].oz;if(sm<0){const ix=g.index.array;for(let i=0;i<ix.length;i+=3){const tt=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=tt}g.computeVertexNormals()}}
 L.geo(rk,g,0,0,0);if(bottom){const sh=new THREE.Shape();hole.forEach((q,i)=>i?sh.lineTo(q[0],-q[1]):sh.moveTo(q[0],-q[1]));const bg=new THREE.ShapeGeometry(sh);bg.rotateX(-Math.PI/2);const pa=bg.attributes.position,u2=[];for(let i=0;i<pa.count;i++)u2.push(pa.getX(i)/4,pa.getZ(i)/4);bg.setAttribute('uv',new THREE.Float32BufferAttribute(u2,2));L.geo(bottom,bg,0,by==null?-D+.2:by,0)}}
/* a stone bridge with a low parapet, arched a little, from (x0,z0) to (x1,z1), local */
function ugStoneBridge(L,rk,x0,z0,x1,z1,w){w=w||1.6;const dx=x1-x0,dz=z1-z0,l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l,rx=uz,rz=-ux,n=Math.max(4,Math.ceil(l/.5)),yaw=Math.atan2(dx,dz),Y=t=>.35*Math.sin(Math.PI*t);
 for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,a=[x0+dx*t0,Y(t0),z0+dz*t0],c=[x0+dx*t1,Y(t1),z0+dz*t1];
  for(const [sd,ww,hh,yo] of[[0,w,.4,-.2],[-1,.22,.32,.16],[1,.22,.32,.16]]){const o=sd*(w/2-.11);ugBeam(L,rk,[a[0]+rx*o,a[1]+yo,a[2]+rz*o],[c[0]+rx*o,c[1]+yo,c[2]+rz*o],ww,hh)}}
 for(const e of[[x0,z0,-1],[x1,z1,1]])L.box(rk,w+.3,.5,.9,e[0]+ux*e[2]*.3,-.1,e[1]+uz*e[2]*.3,yaw)}
/* basalt columns: a cluster of six-sided columns, the middle ones up into the roof (top), the others shorter */
function ugBasaltCols(L,R,x,z,r,top){const n=5+(R()*3|0);for(let i=0;i<n;i++){const a=i/n*6.28+R(),d=i<2?r*.25*R():r*(.35+R()*.55),rr=.16+R()*.14,h=i<2?top+1:1.2+R()*Math.min(2.6,top-1.8);
 L.geo('basalt',new THREE.CylinderGeometry(rr,rr,h+.1,6),x+Math.cos(a)*d,(h+.1)/2-.1,z+Math.sin(a)*d,R()*1.05)}}
/* a crystal cluster pointing along a direction d=[x,y,z] (out of a wall or down from the roof) */
function ugCrystalsDir(L,R,x,y,z,d,s,key,n){n=n||3+(R()*4|0);const D=new THREE.Vector3(d[0],d[1],d[2]).normalize();for(let i=0;i<n;i++){const h=s*(.6+R()*.9),r=s*(.1+R()*.08);
  const g=new THREE.CylinderGeometry(r,r*1.1,h,6);g.translate(0,h/2,0);const tip=new THREE.ConeGeometry(r,r*2.2,6);tip.translate(0,h+r*1.1,0);
  const v=D.clone().add(new THREE.Vector3((R()-.5)*.8,(R()-.5)*.8,(R()-.5)*.8)).normalize(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v),M=new THREE.Matrix4().makeRotationFromQuaternion(q);
  for(const gg of[g,tip]){gg.applyMatrix4(M);L.geo(key,gg,x-D.x*.12,y-D.y*.12,z-D.z*.12)}}}
/* a steam vent or geyser mound with a dark mouth, and steam (three crossed soft planes; the game puffs them) */
function ugVent(L,x,z,r,h,rk,steam){L.geo(rk,new THREE.CylinderGeometry(r*.55,r,h,10,1,true),x,h/2-.02,z);L.geo('black',new THREE.CircleGeometry(r*.55,10).rotateX(-Math.PI/2),x,h-.04,z);
 L.geo(rk,new THREE.TorusGeometry(r*.55,.06,5,12).rotateX(Math.PI/2),x,h-.02,z);if(steam)for(let k=0;k<3;k++)L.geo('mist',new THREE.PlaneGeometry(1.2,steam),x,h+steam/2,z,k*Math.PI/3)}
/* glowworms: tiny lights on threads from the roof */
function ugGlowworms(L,ch,R,n,cx,cz,rx,rz){for(let i=0;i<n;i++){const a=R()*6.28,r=Math.sqrt(R())*.9,x=cx+Math.cos(a)*rx*r,z=cz+Math.sin(a)*rz*r,rf=ch.roofAt(x,z),l=.12+R()*.4;
 L.cyl('stem',.004,.004,l+1,x,rf-l/2+.5,z,3);L.geo('glowB',new THREE.SphereGeometry(.028,6,4),x,rf-l,z)}}

/* ---------- the pieces ---------- */
function ugPieceL3(b,p,Lv,ctx){const t=p.type;if(!['basalt','magma','dark','geode','hotseam','old'].includes(t))return false;
 const v=p.d.v||0,y=UGLY(Lv),rk=ugRK(Lv),fl=ugFL(Lv),R=ugRng(p.id*1009+v*17+3),L0=ugLocal(b,p,y),W=ugWorld(p),fx=k=>p.d.fx.filter(f=>f.k==k),f1=k=>fx(k)[0];
 const lamp=(x,yy,z,s)=>{const w=L0.pt(x,yy,z);ctx.lamps.push([w.x,w.y,w.z,s||1])},pick3=()=>{const r=R();return r<.3?'au':r<.5?'cr':r<.65?'dm':r<.8?'ur':'ag'};
 const bl=p.d.shp.find(s=>s.k=='blob');let doors=[],ways=[];
 if(bl){doors=ugChamberShape(p,Object.assign({cx:bl.cx,cz:bl.cz,rx:bl.rx,rz:bl.rz},{doorsExtra:[]})).doors;ways=doors.length>1?doors.flatMap((a,i)=>doors.slice(i+1).map(c=>[[a.x,a.z],[c.x,c.z]])):[[[0,0],[bl.cx,bl.cz]]]}
 const onWay=(x,z,m)=>ways.some(w=>ugSegD(x,z,w[0],w[1])<(m||1.6)),nearDoor=(x,z,d)=>doors.some(q=>Math.hypot(q.x-x,q.z-z)<(d||3))||Math.hypot(x,z)<(d||3);
 const scatter=(n,cx,cz,rx,rz,minD,big,also)=>{const o=[];for(let k=0;o.length<n&&k<n*60;k++){const a=R()*6.28,r=Math.sqrt(R()),x=cx+Math.cos(a)*rx*r,z=cz+Math.sin(a)*rz*r;
   if(nearDoor(x,z)||(big&&onWay(x,z))||o.some(q=>Math.hypot(q[0]-x,q[1]-z)<minD)||(also&&also(x,z)))continue;o.push([x,z])}return o};

 /* ====== BASALT GALLERY: a wide cave of black basalt with glowing cracks ====== */
 if(t=='basalt'){const path=W.shp[0];const obs=v==2;const c=ugCave(b,path.pts.map(q=>[q[0],y,q[1]]),{rock:obs?'obsidian':rk,floor:obs?'obsidianF':fl,amp:obs?.3:.45});c.rk=obs?'obsidian':rk;ugCaveDress(b,c,ctx,R,Lv);
  const lp=p.d.shp[0].pts;
  if(v!=2){/* glowing cracks along the floor, zig-zagging about the middle */for(let s=1.5;s<c.L-1.5;s+=.6){const f=c.at(s),f2=c.at(s+.6),o1=Math.sin(s*1.7)*.6,o2=Math.sin((s+.6)*1.7)*.6;
    const a=[f.p[0]+f.r[0]*o1,f.p[2]+f.r[1]*o1],e=[f2.p[0]+f2.r[0]*o2,f2.p[2]+f2.r[1]*o2],dx=e[0]-a[0],dz=e[1]-a[1];b.box('lava',.1,.03,Math.hypot(dx,dz)+.04,(a[0]+e[0])/2,y+.0,(a[1]+e[1])/2,Math.atan2(dx,dz))}
   for(let s=3;s<c.L-2;s+=5){const f=c.at(s);ctx.lamps.push([f.p[0],y+.4,f.p[2],.7])}}
  if(v==0)for(const q of f1('cols').pts)ugBasaltCols(L0,R,q[0],q[1],.6,4.4);
  if(v==1){const sp=f1('spots');for(let i=0;i<sp.n;i++){const s=2.5+(c.L-5)*i/(sp.n-1),f=c.at(s),o=(R()-.5)*1.6,x=f.p[0]+f.r[0]*o,z=f.p[2]+f.r[1]*o;b.add(rk,new THREE.CylinderGeometry(.2,.45,.25,8,1,true),new THREE.Matrix4().makeTranslation(x,y+.1,z));b.add('black',new THREE.CircleGeometry(.2,8).rotateX(-Math.PI/2),new THREE.Matrix4().makeTranslation(x,y+.215,z));for(let k=0;k<3;k++)b.add('mist',new THREE.PlaneGeometry(1.1,2.2),new THREE.Matrix4().compose(new THREE.Vector3(x,y+1.3,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,k*Math.PI/3,0)),new THREE.Vector3(1,1,1)))}}
  if(v==2){/* sharp obsidian shards along the edges of the floor */for(let s=2;s<c.L-2;s+=.7){const f=c.at(s),e=c.edge(f.i),sd=R()<.5?0:1,q=e[sd],cx2=(e[0][0]+e[1][0])/2,cz2=(e[0][1]+e[1][1])/2,dx=cx2-q[0],dz=cz2-q[1],l=Math.hypot(dx,dz),h=.15+R()*.3;
    const g=new THREE.ConeGeometry(.08+R()*.06,h,4);g.rotateZ((R()-.5)*.6);b.add('obsidian',g,new THREE.Matrix4().compose(new THREE.Vector3(q[0]+dx/l*(.3+R()*.3),y+h/2-.03,q[1]+dz/l*(.3+R()*.3)),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,R()*3,0)),new THREE.Vector3(1,1,1)))}
   for(let s=3;s<c.L-2;s+=6){const f=c.at(s);ctx.lamps.push([f.p[0],y+2.6,f.p[2],.5])}}
  return true}

 /* ====== THE OLD SHAFT: a short timbered drive into the working face, a rock wall with door 60 in it ====== */
 if(t=='old'){const L=L0;const tr=ugTube(b,[[0,0],[0,-2.6]].map(q=>{const w=L.pt(q[0],0,q[1]);return[w.x,y,w.z]}),{fil:0,rails:false,sets:true,lampsOut:ctx.lamps,rock:rk,floorKey:fl});
  const pf=ugProf(2),sh=new THREE.Shape(),dw=.62,dh=2.15;sh.moveTo(-2,0);for(const q of pf.P.filter(q=>q[1]>=0))sh.lineTo(q[0],q[1]);sh.lineTo(2,0);sh.lineTo(dw,0);sh.lineTo(dw,dh);sh.lineTo(-dw,dh);sh.lineTo(-dw,0);sh.lineTo(-2,0);
  const g=new THREE.ShapeGeometry(sh),pa=g.attributes.position,u=[];for(let i=0;i<pa.count;i++)u.push(pa.getX(i)/3,pa.getY(i)/3);g.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));L.geo(rk,g,0,0,-2.6);
  /* behind the door: a dark passage; the timber frame, the old door with its number plate, a warning board */
  L.box('black',1.4,dh+.1,1.4,0,(dh+.1)/2-.02,-3.4);for(const sd of[-1,1])L.box('woodD',.22,dh+.1,.24,sd*(dw+.11),(dh+.1)/2,-2.5,0);L.box('woodD',dw*2+.7,.26,.26,0,dh+.18,-2.5,0);
  L.box('wood',dw*2-.04,dh-.04,.07,0,(dh-.04)/2+.02,-2.66,0);for(const yy of[.5,1.6])L.box('dark',dw*2-.1,.08,.02,0,yy,-2.612,0);L.cyl('brass',.04,.04,.06,dw-.18,1.05,-2.6,10,0,Math.PI/2);
  L.box('brass',.34,.2,.02,0,1.75,-2.612,0);ctx.signs.push((()=>{const w=L.pt(0,1.75,-2.59);return{x:w.x,y:w.y,z:w.z,yaw:L.yaw(0),txt:'60',w:.3}})());
  L.box('board',1.7,.4,.06,0,2.75,-2.56,0);ctx.signs.push((()=>{const w=L.pt(0,2.75,-2.52);return{x:w.x,y:w.y,z:w.z,yaw:L.yaw(0),txt:'OLD WORKINGS',w:1.6}})());
  const w=L.pt(0,0,-2.62);ctx.portal={x:w.x,y:w.y,z:w.z,yaw:L.yaw(0)};return true}

 const base={cx:bl.cx,cz:bl.cz,rx:bl.rx,rz:bl.rz};

 /* ====== MAGMA CHAMBER ====== */
 if(t=='magma'){const lavaL=f1('lava'),lake=f1('lake'),moat=f1('moat');const holes=[],pits=[];let band=null;
  if(lavaL){band=ugBand(L0,bl,lavaL.pts,lavaL.w);holes.push(band)}
  if(lake)pits.push({cx:lake.cx,cz:lake.cz,rx:lake.rx,rz:lake.rz});
  if(moat)pits.push({cx:moat.cx,cz:moat.cz,rx:moat.r+moat.w/2,rz:moat.r+moat.w/2});
  const gl0=f1('goal');const ch=ugChamber(b,p,Lv,ctx,Object.assign({},base,{dome:5.5,holes,pits,floor:v==2?'crust':fl,pick:pick3,noVein:gl0?(x,z)=>Math.hypot(x-gl0.x,z-gl0.z)<3.2:null})),L=ch.L;
  if(band){ugHoleSides(L,L0,band,.9,rk,'lava',-.42);for(let i=0;i<band.length;i+=Math.max(1,band.length/8|0)){const q=band[i];lamp(q[0],.5,q[1],1.1)}}
  if(lake){const pr=[[1,0],[.9,-.25],[.7,-.45],[0,-.55]];ugPool(L,lake,{prof:pr,surf:-.32,dep:.55,key:'lava',rock:rk,layers:false,sr:.86});lamp(lake.cx,.6,lake.cz,1.6);
   if(!lake.noisle){/* the island in the lake with a diamond outcrop */L.geo(rk,new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),lake.cx,-.32,lake.cz,0,0,0,1.25,.55,1.25);
    const g=new THREE.IcosahedronGeometry(.5,1);L.geo(rk,g,lake.cx,.35,lake.cz);for(const a of[.4,2.5,4.4]){const w=L0.pt(lake.cx+Math.cos(a)*.42,.45,lake.cz+Math.sin(a)*.42),d=L0.dir(Math.cos(a),Math.sin(a));ctx.veins.push({x:w.x,y:w.y,z:w.z,dx:d[0],dz:d[1],t:'dm'})}}}
  for(const f of fx('stones'))for(const q of f.pts)L.geo(rk,new THREE.CylinderGeometry(.42,.55,1,7),q[0],-.45,q[1],R()*3);
  for(const f of fx('bridge'))ugStoneBridge(L,rk,f.x0,f.z0,f.x1,f.z1);
  for(const f of fx('gey'))ugVent(L,f.x,f.z,.95,.45,rk,2.6);
  for(const f of fx('cols'))for(const q of f.pts)ugBasaltCols(L,R,q[0],q[1],f.r,ch.roofAt(q[0],q[1]));
  if(v==1){/* the lavafall: out of a crack high in the wall, over a lip, into the pool; a basalt shelf round it to gold */
   const fl2=f1('falls'),an=Math.atan2(fl2.z-bl.cz,fl2.x-bl.cx),top=3.4,w=ch.wallPt(an,top),wc=ch.wallPt(an,top+.42),yaw=Math.atan2(-w.nx,-w.nz),io=(q,o2)=>[q.x-q.nx*o2,q.z-q.nz*o2];
   {const c=io(wc,-.22);L.box('black',2,.3,.6,c[0],top+.42,c[1],yaw)}{const c=io(w,.1);L.geo(rk,new THREE.IcosahedronGeometry(1,1),c[0],top,c[1],yaw,0,0,1.4,.3,.55)}
   const sheet=(o0,o1,w0,w1)=>{const g=new THREE.PlaneGeometry(1,1,6,14),pa=g.attributes.position;for(let i=0;i<pa.count;i++){const f=.5-pa.getY(i),wd=w0+(w1-w0)*f;pa.setXYZ(i,pa.getX(i)*wd,top+.24-(top+.5)*f,o0+(o1-o0)*Math.sqrt(f))}g.computeVertexNormals();L.geo('lavaFall',g,w.x,0,w.z,yaw)};
   sheet(.55,2.5,1.4,2.6);lamp(io(w,1.5)[0],2,io(w,1.5)[1],1.8);
   const wk=f1('walk').pts;for(let i=1;i<wk.length;i++){const a=wk[i-1],c=wk[i],n=Math.ceil(Math.hypot(c[0]-a[0],c[1]-a[1])/.9);for(let k=0;k<=n;k++){const x=a[0]+(c[0]-a[0])*k/n,z=a[1]+(c[1]-a[1])*k/n;L.geo('basalt',new THREE.CylinderGeometry(.62,.62,.14,6),x,.05,z,R())}}
   const gl=f1('goal');for(let k=0;k<3;k++){const w2=ch.wallPt(Math.atan2(gl.z-bl.cz,gl.x-bl.cx)+(k-1)*.07,[1.2,1.9,2.6][k]);const W2=L0.pt(w2.x+w2.nx*.06,w2.y,w2.z+w2.nz*.06),d=L0.dir(-w2.nx,-w2.nz);ctx.veins.push({x:W2.x,y:W2.y,z:W2.z,dx:d[0],dz:d[1],t:'au'})}}
  if(v==2){/* the crust field: the floor is cooled crust; glowing patches burn (listed in ctx.hot for the game) */
   const cf=f1('crust');for(const q of scatter(8,cf.cx,cf.cz,cf.rx*.85,cf.rz*.85,2.4,true)){const r=.7+R()*.6,g=new THREE.CircleGeometry(1,12),pa=g.attributes.position;for(let i=1;i<pa.count;i++){const k=.75+R()*.4;pa.setXY(i,pa.getX(i)*k,pa.getY(i)*k)}g.rotateX(-Math.PI/2);
    L.geo('lava',g,q[0],.012,q[1],R()*6,0,0,r,1,r);const w=L0.pt(q[0],0,q[1]);ctx.hot.push({x:w.x,z:w.z,r});lamp(q[0],.4,q[1],.8)}}
  if(v==3){/* the obsidian moat: a ring of lava round an island of black glass with diamond and gold on it */
   const ri=moat.r-moat.w/2,ro=moat.r+moat.w/2;L.geo('obsidianF',new THREE.CircleGeometry(ri,48).rotateX(-Math.PI/2),moat.cx,0,moat.cz);
   L.geo(rk,ugInside(new THREE.CylinderGeometry(ro,ro,.9,48,1,true)),moat.cx,-.45,moat.cz);L.geo('obsidian',new THREE.CylinderGeometry(ri,ri,.9,48,1,true),moat.cx,-.45,moat.cz);
   L.geo('lava',new THREE.RingGeometry(ri,ro,48).rotateX(-Math.PI/2),moat.cx,-.42,moat.cz);for(let k=0;k<4;k++){const a=k*1.57+.4;lamp(moat.cx+Math.cos(a)*moat.r,.5,moat.cz+Math.sin(a)*moat.r,1.1)}
   for(let k=0;k<3;k++){const a=k*2.1+.9,x=moat.cx+Math.cos(a)*2.6,z=moat.cz+Math.sin(a)*2.6,g=new THREE.IcosahedronGeometry(.7,0);L.geo('obsidian',g,x,.3,z,R()*3,0,0,1,1.3,1);
    for(const b2 of[0,2.1,4.2]){const w=L0.pt(x+Math.cos(a+b2)*.5,.55,z+Math.sin(a+b2)*.5),d=L0.dir(Math.cos(a+b2),Math.sin(a+b2));ctx.veins.push({x:w.x,y:w.y,z:w.z,dx:d[0],dz:d[1],t:k?'au':'dm'})}}
   for(let i=0;i<14;i++){const a=R()*6.28,r=Math.sqrt(R())*(ri-.6),h=.15+R()*.3;L.geo('obsidian',new THREE.ConeGeometry(.08+R()*.06,h,4),moat.cx+Math.cos(a)*r,h/2-.03,moat.cz+Math.sin(a)*r,R()*3)}}
  return true}

 /* ====== DARK CAVE: pitch black rock ====== */
 if(t=='dark'){const ch0={dome:v==4?6.5:3.6,rock:'rockK',pick:pick3};const cf=f1('chasm'),pit=f1('pit'),wat=fx('water').find(w=>w.deep);let band=null;
  if(cf){band=ugBand(L0,bl,cf.pts,cf.w);ch0.holes=[band]}if(pit)ch0.pits=[{cx:pit.cx,cz:pit.cz,rx:pit.rx,rz:pit.rz}];if(wat)ch0.pits=[{cx:wat.cx,cz:wat.cz,rx:wat.rx,rz:wat.rz}];
  if(pit){const gl=f1('goal');ch0.pick=()=>R()<.5?'dm':'au';}
  const ch=ugChamber(b,p,Lv,ctx,Object.assign({},base,ch0)),L=ch.L;const gw=f1('glow');
  if(band){ugHoleSides(L,L0,band,9,'rockK','black');const f=f1('bridge');/* a plank bridge on two beams */const dx=f.x1-f.x0,dz=f.z1-f.z0,l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l,rx2=uz,rz2=-ux,yaw=Math.atan2(dx,dz);
   for(const sd of[-.42,.42])L.box('woodD',.14,.16,l+.8,f.x0+dx/2+rx2*sd,-.04,f.z0+dz/2+rz2*sd,yaw);for(let s=-.25;s<l+.3;s+=.3)L.box('wood',1.1,.05,.26,f.x0+ux*s,.065,f.z0+uz*s,yaw)}
  if(pit){/* a round shaft with no bottom you can see, a rough lip round it */L.geo('rockK',ugInside(new THREE.CylinderGeometry(pit.rx+.03,pit.rx*.9,24,40,6,true)),pit.cx,-12,pit.cz);L.geo('black',new THREE.CircleGeometry(pit.rx,24).rotateX(-Math.PI/2),pit.cx,-23.5,pit.cz);
   L.geo('rockK',new THREE.TorusGeometry(pit.rx+.08,.12,6,48).rotateX(Math.PI/2),pit.cx,.0,pit.cz,0,0,0,1,1,1)}
  if(wat){ugPool(L,wat,{bowl:1,surf:-.15,dep:3,key:'poolK',rock:'rockK',layers:false})}
  if(gw)ugGlowworms(L,ch,R,gw.n,bl.cx,gw.cz,gw.rx,gw.rz);
  if(v==3)for(const f of fx('cols'))for(const q of f.pts)ugColumn(L,q[0],q[1],f.r*.85,ch.roofAt(q[0],q[1]),'rockK',R);
  if(v==4){/* the bat roost: bats hanging in clusters under the high roof, guano below them */const sp=f1('spots');for(const q of scatter(sp.n/3|0,0,sp.cz,sp.rx,sp.rz,1.8,false)){const rf=ch.roofAt(q[0],q[1]);
    for(let k=0;k<5+(R()*5|0);k++){const x=q[0]+(R()-.5)*1.2,z=q[1]+(R()-.5)*1.2;L.geo('bat',new THREE.ConeGeometry(.07,.24,5).rotateX(Math.PI),x,rf-.12-.25,z,R()*3);L.cyl('bat',.01,.01,.5,x,rf,z,3)}
    const g=new THREE.CircleGeometry(1,10),pa=g.attributes.position;for(let i=1;i<pa.count;i++){const k=.6+R()*.5;pa.setXY(i,pa.getX(i)*k,pa.getY(i)*k)}g.rotateX(-Math.PI/2);L.geo('guano',g,q[0],.012,q[1],R()*6,0,0,1.1,1,.9)}}
  return true}

 /* ====== THE GEODE and THE HOT SEAM: a narrow neck, then a round room ====== */
 if(t=='geode'||t=='hotseam'){const neck=p.d.shp.find(s=>s.k=='path'),nw=W.shp.find(s=>s.k=='path'),e=neck.pts[neck.pts.length-1],e0=neck.pts[neck.pts.length-2]||[0,0],nl=Math.hypot(e[0]-e0[0],e[1]-e0[1]);
  {const fx0=nw.pts[0][0]-nw.pts[1][0],fz0=nw.pts[0][1]-nw.pts[1][1],fl0=Math.hypot(fx0,fz0);ugBulkhead(b,nw.pts[0][0],y,nw.pts[0][1],fx0/fl0,fz0/fl0,neck.w/2,{rock:rk})}
  ugCave(b,nw.pts.map(q=>[q[0],y,q[1]]),{hw:neck.w/2,rock:rk,floor:fl,amp:.25});
  if(t=='geode'){/* a real geode: a shell of banded stone (the version's colour) lined with a tight carpet of single crystals,
     all pointing in towards the middle, about the same size with a few big ones and a few clear ones */
   const mats=[['amethyst','geoA'],['celestine','geoC'],['citrine','geoT'],['smoky','geoS']][v],key=mats[0];
   const ch=ugChamber(b,p,Lv,ctx,Object.assign({},base,{dome:3.2,amp:.35,rock:mats[1],stones:false,doorsExtra:[{x:e[0],z:e[1],nx:(e0[0]-e[0])/nl,nz:(e0[1]-e[1])/nl,hw:neck.w/2}],pick:()=>v==2?(R()<.5?'au':'cr'):(R()<.6?'cr':'dm'),veinGap:3.2,veinSkip:.5})),L=ch.L;
   const mid=[bl.cx,1.5,bl.cz],nearNeck=(x,z)=>Math.hypot(x-e[0],z-e[1])<2.1;
   /* one crystal: an open six-sided prism (its foot is in the rock) with a pointed tip */
   const prism=(x,y0,z,len,r,k)=>{const d=new THREE.Vector3(mid[0]-x,mid[1]-y0,mid[2]-z).normalize().add(new THREE.Vector3((R()-.5)*.55,(R()-.5)*.55,(R()-.5)*.55)).normalize();
    const g=new THREE.CylinderGeometry(r,r*1.1,len,6,1,true);g.translate(0,len/2-.1,0);const tip=new THREE.ConeGeometry(r,r*2.2,6,1,true);tip.translate(0,len-.1+r*1.1,0);
    const M=new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d)).multiply(new THREE.Matrix4().makeRotationY(R()*1.05));for(const gg of[g,tip]){gg.applyMatrix4(M);L.geo(k,gg,x,y0,z)}};
   /* sizes come in patches (world noise): fields of small crystals, beds of bigger ones, now and then a giant */
   const grow=(x,y0,z)=>{const w=L0.pt(x,y0,z),n=ugNoise(w.x*.9,w.y*.9,w.z*.9),q=Math.pow(n,1.6);const big=R()<.025;const len=big?1+R()*.5:.18+q*.75+R()*.18;const r=big?.13:.035+len*.12+R()*.02;
    const k=R()<.025?'clearC':key;prism(x,y0,z,len,r,k);if(!big&&R()<.5){const o=r*2.4;prism(x+(R()-.5)*o,y0+(R()-.5)*o,z+(R()-.5)*o,len*(.5+R()*.4),r*.8,k)}};
   /* scattered evenly but not in rows: tries with a minimum spacing, wall and roof */
   const got=[],near=(x,y0,z,m)=>got.some(q=>(q[0]-x)**2+(q[1]-y0)**2+(q[2]-z)**2<m*m);
   for(let t2=0;t2<2600;t2++){const a=R()*Math.PI*2,yy=.12+R()*3.45,w=ch.wallPt(a,yy);if(nearNeck(w.x,w.z)||near(w.x,yy,w.z,.27))continue;got.push([w.x,yy,w.z]);grow(w.x+w.nx*.03,yy,w.z+w.nz*.03)}
   for(let t2=0;t2<2200;t2++){const a=R()*Math.PI*2,rr=Math.sqrt(R())*bl.rx*.97,x=bl.cx+Math.cos(a)*rr,z=bl.cz+Math.sin(a)*rr*bl.rz/bl.rx,yy=ch.roofAt(x,z)+.06;if(nearNeck(x,z)||near(x,yy,z,.27))continue;got.push([x,yy,z]);grow(x,yy,z)}
   lamp(bl.cx,1.4,bl.cz,1.4);lamp(bl.cx+1.5,2.6,bl.cz-1.5,.9)}
  else{/* the hot seam: glowing green rock and crystals; the green spring; the core shed */
   const wf=fx('water').find(w=>w.deep);const ch=ugChamber(b,p,Lv,ctx,Object.assign({},base,{dome:1.6,amp:.4,rock:'urRock',stones:false,doorsExtra:[{x:e[0],z:e[1],nx:(e0[0]-e[0])/nl,nz:(e0[1]-e[1])/nl,hw:neck.w/2}],pits:wf?[{cx:wf.cx,cz:wf.cz,rx:wf.rx,rz:wf.rz}]:[],pick:()=>R()<.7?'ur':'au',veinGap:1.8,veinSkip:.1})),L=ch.L;
   for(let i=0;i<10;i++){const a=R()*6.28,w=ch.wallPt(a,.25);if(Math.hypot(w.x-e[0],w.z-e[1])<1.6)continue;ugCrystalsDir(L,R,w.x+w.nx*.05,.25,w.z+w.nz*.05,[-w.nx,.6,-w.nz],.45+R()*.3,'uran')}
   lamp(bl.cx,1,bl.cz,1.2);
   if(wf){ugPool(L,wf,{bowl:1,surf:-.2,dep:1.6,key:'poolG',rock:'urRock',layers:false});for(let k=0;k<3;k++)L.geo('mist',new THREE.PlaneGeometry(2.6,1.6),wf.cx,.9,wf.cz,k*Math.PI/3)}
   if(v==2){/* core boxes with glowing drill cores, and the old core drill by the wall */for(const q of fx('blk').find(f=>f.n=='core box').pts){L.box('wood',.9,.35,.55,q[0],.175,q[1],.2);for(let k=0;k<3;k++)L.cyl('uran',.05,.05,.8,q[0]+(k-1)*.15*Math.cos(.2),.38,q[1]-(k-1)*.15*Math.sin(.2),8,.2+Math.PI/2,0,Math.PI/2)}
    const a=Math.atan2(-.5,1),w=ch.wallPt(a,.2),x=w.x-w.nx*.7,z=w.z-w.nz*.7;for(const s of[-.4,.4])ugBeam(L,'steel',[x+s,0,z],[x,2.2,z],.08,.08);L.box('dark',.4,.4,.4,x,1.5,z,0);L.cyl('steel',.03,.03,1.4,x,.75,z,8);L.box('paintY',.5,.25,.3,x,1.85,z,0)}}
  return true}
 return false}

/* ---------- the level 3 stations: their own props and dressing ---------- */
{const p0=ugProp;ugProp=function(b,n,x,y,z,yaw,r,ctx){const c=Math.cos(yaw),s=Math.sin(yaw),at=(lx,lz)=>[x+c*lx+s*lz,z-s*lx+c*lz];
 if(n=='barrel'){b.cyl('wood',.32,.3,.95,x,y+.475,z,14);for(const yy of[.15,.8])b.cyl('dark',.335,.335,.06,x,y+yy,z,14);b.cyl('steel',.31,.31,.02,x,y+.96,z,14);return}
 if(n=='fan'){/* a big fan on a stand, blowing cool air at the shaft */b.box('dark',.9,.12,.6,x,y+.06,z,yaw);b.box('dark',.12,1.2,.12,x,y+.66,z,yaw);const q=at(0,.05);b.add('steel',new THREE.TorusGeometry(.62,.06,8,24),new THREE.Matrix4().compose(new THREE.Vector3(q[0],y+1.5,q[1]),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,yaw,0)),new THREE.Vector3(1,1,1)));
  b.cyl('dark',.16,.16,.3,x,y+1.5,z,12,yaw,Math.PI/2);for(let k=0;k<4;k++)b.add('steel',new THREE.BoxGeometry(.16,.55,.02),new THREE.Matrix4().compose(new THREE.Vector3(q[0],y+1.5,q[1]),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,yaw,k*Math.PI/2+.3,'YXZ')),new THREE.Vector3(1,1,1)).multiply(new THREE.Matrix4().makeTranslation(0,.33,.07)));return}
 if(n=='valve box'){b.box('dark',.7,1,.45,x,y+.5,z,yaw);const q=at(0,.25);b.add('paintR',new THREE.TorusGeometry(.22,.035,6,16),new THREE.Matrix4().compose(new THREE.Vector3(q[0],y+.75,q[1]),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,yaw,0)),new THREE.Vector3(1,1,1)));b.cyl('steel',.04,.04,.12,q[0],y+.75,q[1],8,yaw,Math.PI/2);return}
 return p0.apply(this,arguments)}}
{const s0=ugStationBuild;ugStationBuild=function(b,p,L,ctx){s0(b,p,L,ctx);if(L!=2)return;const y=UGLY(L),T=ugT(p),v=p.d.v||0,hs=6;
 /* a warning board on the wall beside the gate side */
 const sign=(lx,lz,ix,iz,txt,w)=>{const q=T(lx,lz),n=ugRot(ix,iz,p.r),yaw=Math.atan2(n[0],n[1]),map=/ MAP$/.test(txt),h=map?1.1:.34,yy=y+(map?1.7:2.1);b.box('board',w+.1,h+.1,.3,q[0]-n[0]*.13,yy,q[1]-n[1]*.13,yaw);ctx.signs.push({x:q[0]+n[0]*.025,y:yy,z:q[1]+n[1]*.025,yaw,txt,w,h,map})};
 if(v==0){sign(-hs+.02,-3.8,1,0,'HOT GROUND',1.6);sign(-hs+.02,3.8,1,0,'LEVEL 3 MAP',1.6)}
 if(v==1){const q=T(-4.6,4.6);ugProp(b,'barrel',q[0],y,q[1],0,.4,ctx);b.cyl('frost',.28,.28,.02,q[0],y+.975,q[1],14);sign(-hs+.02,-3.8,1,0,'TEMP 52 °C',1.4);sign(-hs+.02,3.8,1,0,'LEVEL 3 MAP',1.6)}
 if(v==2){/* steel bulkheads in every doorway: a steel wall in the arch with a door that swings on its hinge (a moving part) */
  sign(-hs+.02,3.8,1,0,'LEVEL 3 MAP',1.6);const r={x0:-hs,x1:hs,z0:-hs,z1:hs},K=ugKit();for(const d of ugDoorsFor(p,r)){const fx2=d.x-p.x,fz2=d.z-p.z,fl=Math.hypot(fx2,fz2),nx=fx2/fl,nz=fz2/fl,px=d.x+nx*.25,pz=d.z+nz*.25,yaw=Math.atan2(nx,nz);
   const big=ugProf(2),dw=.75,dh=2.1,sh=new THREE.Shape();sh.moveTo(-2,0);for(const q of big.P.filter(q=>q[1]>=0))sh.lineTo(q[0],q[1]);sh.lineTo(2,0);sh.lineTo(dw,0);sh.lineTo(dw,dh);sh.lineTo(-dw,dh);sh.lineTo(-dw,0);sh.lineTo(-2,0);
   const g=new THREE.ShapeGeometry(sh);const g2=g.clone();g2.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI));for(const [gg,o] of[[g,-.04],[g2,.04]])b.add('dark',gg,new THREE.Matrix4().compose(new THREE.Vector3(px-nx*o,y,pz-nz*o),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,yaw+Math.PI,0)),new THREE.Vector3(1,1,1)));
   for(const sd of[-1,1])b.box('paintY',.12,dh+.1,.14,px-Math.cos(yaw)*sd*(dw+.06),y+(dh+.1)/2,pz+Math.sin(yaw)*sd*(dw+.06),yaw);b.box('paintY',2*dw+.24,.12,.14,px,y+dh+.06,pz,yaw);
   /* the door: hinged on its left edge; the game turns the group about y to open it (closed at 0) */
   const dg=new THREE.Group(),hx=-Math.cos(yaw)*dw,hz=Math.sin(yaw)*dw;dg.position.set(px+hx-nx*.12,y,pz+hz-nz*.12);dg.rotation.y=yaw;const leaf=new THREE.Mesh(new THREE.BoxGeometry(2*dw-.04,dh-.04,.08),K.mat.dark);leaf.position.set(dw,(dh-.04)/2+.02,0);dg.add(leaf);
   const wh=new THREE.Mesh(new THREE.TorusGeometry(.2,.03,6,16),K.mat.paintR);wh.position.set(dw,1.1,-.07);dg.add(wh);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.1,8),K.mat.steel);hub.rotation.x=Math.PI/2;hub.position.set(dw,1.1,-.06);dg.add(hub);
   dg.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});dg.userData.ugDoor={hinge:'left',open:-Math.PI/2};ctx.moving.push(dg)}}}}
