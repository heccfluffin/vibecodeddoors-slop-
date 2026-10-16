/* =====================================================================================================
   r596: CAVES, PART 3.
   - CHASMS: dark caves (and some crystal / fungus caverns) are split by a bottomless chasm. Cross on the plank bridge,
     or jump the stepping stones. Fall in and the crew haul you out, minus half of what you were carrying.
   - LAVA LAKES in the big magma chambers, with stepping stones across to an island of DIAMONDS. Fall in and you lose
     everything you carry.
   - Parkour routes are checked: every pillar has to stand in open cave, clear of the lava river, chasms and walls, and
     stalagmites, crystals and mushrooms in the way of the route are cleared. Magma and dark caves always have one, and
     magma chambers are taller with a higher ledge.
   - Lava GEYSERS that erupt every few seconds.
   - FUNGUS GROTTOS are big open caverns full of lush growth: moss, grass, ferns, hanging vines with glowing berries,
     glow pods, giant mushrooms and glowworms on the roof. Dark caves get glowworms, rubble and roots.
   - Rare BIG ORE seams: eight swings, five times the ore, but every swing has a 5% chance of bringing the collapse closer.
   - When a mine collapses, the cage (with the minecart) drops down the shaft and is wound back up for the next mine.
   ===================================================================================================== */
function mnPit(x,z){for(const p of MN.pits||[]){if(p.e){const a=(x-p.cx)/p.rx,b=(z-p.cz)/p.rz;if(a*a+b*b<1)return p}else if(x>p.x0&&x<p.x1&&z>p.z0&&z<p.z1)return p}return null}
function mnOpenAt(C,x,z){const k=mnCell(x,z);return k>=0&&!!C[k]}
function mnPlatHit(x,z,w){return(MN.plat||[]).some(p=>x+w/2+.5>p.x0&&x-w/2-.5<p.x1&&z+w/2+.5>p.z0&&z-w/2-.5<p.z1)}
/* ---------- a chasm across the cavern ---------- */
function mnChasm(X){const{o,cs,cx,cz,Y,R,add,C,g}=X;if(o.r<2.6||o.b=='magma'||o.b=='flood')return;if(!(o.b=='dark'||((o.b=='crystal'||o.b=='fungus')&&R()<.35)))return;if(Math.hypot(cx-MN.ox,cz-MN.oz)<12)return;
 const along=R()<.5?'x':'z',W=o.b=='dark'?2.4:2.0,c0=(along=='x'?cz:cx)+(R()-.5)*2;let lo=1e9,hi=-1e9;
 for(const k of cs){const[x,z]=mnXZ(k),pp=along=='x'?z:x,aa=along=='x'?x:z;if(Math.abs(pp-c0)<2){lo=Math.min(lo,aa-2);hi=Math.max(hi,aa+2)}}if(hi-lo<7)return;
 const pit=along=='x'?{x0:lo,x1:hi,z0:c0-W/2,z1:c0+W/2}:{x0:c0-W/2,x1:c0+W/2,z0:lo,z1:hi};const P2=(a,p)=>along=='x'?[a,p]:[p,a];
 /* the hole goes down a long way: rock walls on both sides and the ends, black at the bottom (the floor is cut away later) */const len=hi-lo,mid=(lo+hi)/2,DP=16,WM=X.MAT?X.MAT[o.b].w:new THREE.MeshStandardMaterial({color:0x2a2420});
 for(const sd of[-1,1]){const[x,z]=P2(mid,c0+sd*(W/2+.1));add(new THREE.BoxGeometry(along=='x'?len:.2,DP,along=='x'?.2:len),WM,x,Y-.3-DP/2,z)}for(const e of[lo,hi]){const[x,z]=P2(e,c0);add(new THREE.BoxGeometry(along=='x'?.2:W+.4,DP,along=='x'?W+.4:.2),WM,x,Y-.3-DP/2,z)}
 {const[x,z]=P2(mid,c0);const m=add(new THREE.PlaneGeometry(along=='x'?len:W,along=='x'?W:len),new THREE.MeshBasicMaterial({color:0x000000}),x,Y-.3-DP+.05,z);m.rotation.x=-Math.PI/2;for(let r2=0;r2<6;r2++){const[x2,z2]=P2(lo+R()*len,c0+(R()-.5)*W*.8);const b=add(new THREE.DodecahedronGeometry(.25+R()*.5,0),WM,x2,Y-1.2-R()*DP*.7,z2);b.rotation.set(R()*3,R()*3,R()*3)}}
 const RKm=new THREE.MeshStandardMaterial({color:0x2a2420,roughness:1});for(let a=lo+.4;a<hi-.4;a+=.9)for(const sd of[-1,1]){const[x,z]=P2(a+(R()-.5)*.4,c0+sd*(W/2+.12));const r=.12+R()*.18;if(!mnOpenAt(C,x,z))continue;const b=add(new THREE.DodecahedronGeometry(r,0),RKm,x,Y+r*.4,z);b.rotation.set(R()*3,R()*3,R()*3)}
 MN.pits.push(pit);
 /* a plank bridge with rope rails */const bt=lo+(hi-lo)*(.3+R()*.4);{const ok=mnOpenAt(C,...P2(bt,c0-W/2-.8))&&mnOpenAt(C,...P2(bt,c0+W/2+.8));if(ok){const PL=new THREE.MeshStandardMaterial({color:0x6a4a2a,roughness:.9}),RP=new THREE.MeshStandardMaterial({color:0x8a7a5a,roughness:1});
   for(let p=-W/2-.4;p<=W/2+.4;p+=.3){const[x,z]=P2(bt+(R()-.5)*.04,c0+p);const pl=add(new THREE.BoxGeometry(along=='x'?1.2:.26,.06,along=='x'?.26:1.2),PL,x,Y+.05,z);pl.rotation.y=(R()-.5)*.06}
   for(const s2 of[-1,1]){for(const e of[-1,1]){const[x,z]=P2(bt+s2*.6,c0+e*(W/2+.45));add(new THREE.CylinderGeometry(.05,.06,1.1,6),PL,x,Y+.55,z)}const[x1,z1]=P2(bt+s2*.6,c0-W/2-.45),[x2,z2]=P2(bt+s2*.6,c0+W/2+.45);rodTo(g,RP,x1,Y+1.05,z1,(x1+x2)/2,Y+.8,(z1+z2)/2,.02);rodTo(g,RP,(x1+x2)/2,Y+.8,(z1+z2)/2,x2,Y+1.05,z2,.02)}
   const[bx,bz]=P2(bt,c0);MN.plat.push(along=='x'?{x0:bx-.55,x1:bx+.55,z0:pit.z0-.3,z1:pit.z1+.3,top:.08,br:1}:{x0:pit.x0-.3,x1:pit.x1+.3,z0:bz-.55,z1:bz+.55,top:.08,br:1})}}
 /* stepping stones somewhere else along it (dark caves) */if(o.b=='dark'){const st=bt>(lo+hi)/2?lo+(bt-lo)*.45:bt+(hi-bt)*.55;if(Math.abs(st-bt)>3){const[x,z]=P2(st,c0);const SM=new THREE.MeshStandardMaterial({color:0x3a3430,roughness:1});const s=add(new THREE.CylinderGeometry(.42,.3,6,7),SM,x,Y-2.9,z);MN.plat.push({x0:x-.4,x1:x+.4,z0:z-.4,z1:z+.4,top:.1})}}}
/* ---------- a lava lake with stepping stones to an island of diamonds (big magma chambers) ---------- */
function mnLavaLake(X,along,rvC){const{o,cs,cx,cz,Y,R,add,C,g,q,deco}=X;if(o.r<3.2)return;const rx=3.6,rz=1.9;
 for(const sd of R()<.5?[-1,1]:[1,-1]){const c0=rvC+sd*(1.6/2+rz+1.0),[lx,lz]=along=='x'?[cx,c0]:[c0,cz];const ex=along=='x'?rx:rz,ez=along=='x'?rz:rx;
  let ok=true;for(let a=0;a<24&&ok;a++){const t=a/24*Math.PI*2;if(!mnOpenAt(C,lx+Math.cos(t)*(ex+1.1),lz+Math.sin(t)*(ez+1.1)))ok=false}if(!ok||Math.hypot(lx-MN.ox,lz-MN.oz)<10)continue;
  const LT=lavaTex().clone();LT.needsUpdate=true;LT.repeat.set(2,2);const lk=add(new THREE.CircleGeometry(1,40),new THREE.MeshBasicMaterial({map:LT}),lx,Y-.5,lz);{const wl=add(new THREE.CylinderGeometry(1,1,.6,40,1,true),new THREE.MeshStandardMaterial({color:0x2a1a14,roughness:.9,emissive:0x501000,side:THREE.DoubleSide}),lx,Y-.25,lz);wl.scale.set(ex,1,ez)}lk.rotation.x=-Math.PI/2;lk.scale.set(ex,ez,1);deco.push({k:'lavaP',m:lk});
  const CR=new THREE.MeshStandardMaterial({color:0x1a1210,roughness:.7,emissive:0x2a0800});for(let a=0;a<34;a++){const t=a/34*Math.PI*2,r=.2+R()*.25,b=add(new THREE.DodecahedronGeometry(r,0),CR,lx+Math.cos(t)*(ex+.1),Y+r*.35,lz+Math.sin(t)*(ez+.1));b.rotation.set(R()*3,R()*3,R()*3)}
  {const gl=glowSp(0xff5010,.8,Math.max(ex,ez)*2.2);gl.position.set(lx,Y+.6,lz);g.add(gl)}
  MN.pits.push({e:1,cx:lx,cz:lz,rx:ex,rz:ez,lava:1});
  /* stones from one end of the lake to the island at the other */const u=along=='x'?[1,0]:[0,1],end=R()<.5?-1:1,isl=[lx+u[0]*end*(rx-1.0),lz+u[1]*end*(rx-1.0)];const SM=new THREE.MeshStandardMaterial({color:0x3a2a24,roughness:.9,emissive:0x1a0400});
  {const I=add(new THREE.CylinderGeometry(.95,1.1,1,9),SM,isl[0],Y-.15,isl[1]);MN.plat.push({x0:isl[0]-.8,x1:isl[0]+.8,z0:isl[1]-.8,z1:isl[1]+.8,top:.35})}
  for(let s=-(rx-.85),i=0;s<rx-2.15;s+=1.3,i++){const zz=(i%2?1:-1)*.35,x2=lx+u[0]*end*s+(along=='x'?0:zz),z2=lz+u[1]*end*s+(along=='x'?zz:0);
   add(new THREE.CylinderGeometry(.4,.48,1,7),SM,x2,Y-.2,z2);MN.plat.push({x0:x2-.36,x1:x2+.36,z0:z2-.36,z1:z2+.36,top:.3})}
  /* the diamonds on the island */for(const off of[-.35,.35]){const x=isl[0]+(along=='x'?0:off),z=isl[1]+(along=='x'?off:0),O=ORE.dm,nd={t:'dm',x,z,hp:3,gone:0,h:.95,g:new THREE.Group()};nd.g.position.set(x,Y+.75,z);g.add(nd.g);const om=new THREE.MeshStandardMaterial({color:O.col,emissive:O.em,emissiveIntensity:1.4,metalness:.2,roughness:.15,transparent:true,opacity:.9});
   for(let e=0;e<5;e++){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.13+R()*.1,0),om);m.position.set((R()-.5)*.5,(R()-.2)*.3,(R()-.5)*.5);m.rotation.set(R()*3,R()*3,R()*3);m.scale.y=1.6;nd.g.add(m)}nd.g.add(glowSp(0x9ae0ff,.45,1.3));
   MN.nodes.push(nd);q.props.push({x,z,r:1.1,deep:1,mn:1,txt:()=>q.deep!==5||nd.gone?'':MNJ.h<.3?'':'[E] ⛏️ Swing at the '+O.nm+' ('+O.ic+')',act:()=>mnHit(q,nd)})}
  MN.pkr=(MN.pkr||[]).concat([[isl[0],isl[1]]]);return}}
/* ---------- the parkour route, checked ---------- */
function mnParkour(X){const{o,cs,cx,cz,Y,R,add,C,g,q,K}=X,N=MN.N;const edge=k=>{const i=k%N,j=k/N|0;return[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>!C[K(i+a,j+b)])};
 let rv=null;if(o.b=='magma'){let ax=0,az=0;for(const k of cs){const[x,z]=mnXZ(k);ax=Math.max(ax,Math.abs(x-cx));az=Math.max(az,Math.abs(z-cz))}rv=ax>=az?{z:cz+1.6}:{x:cx+1.6}}
 const fits=(x,z,w,top)=>{for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1],[0,0]])if(!mnOpenAt(C,x+a*(w/2+.35),z+b*(w/2+.35)))return false;if(mnPit(x,z))return false;
  for(const p of MN.pits||[]){const bx=p.e?{x0:p.cx-p.rx,x1:p.cx+p.rx,z0:p.cz-p.rz,z1:p.cz+p.rz}:p;if(x+w/2+.6>bx.x0&&x-w/2-.6<bx.x1&&z+w/2+.6>bx.z0&&z-w/2-.6<bx.z1)return false}
  if(X.deco.some(d=>d.k=='gey'&&Math.hypot(d.x-x,d.z-z)<w/2+2.2))return false;if(rv&&(rv.z!=null?Math.abs(z-rv.z)<w/2+1.3:Math.abs(x-rv.x)<w/2+1.3))return false;if(mnPlatHit(x,z,w))return false;if(Math.hypot(x-MN.ox,z-MN.oz)<6)return false;
  /* the cave has to be tall enough to stand on it */const k=mnCell(x,z);if(k<0||MN.ht&&MN.ht[k]<top+2.1)return false;return true};
 const cand=[];for(const k of cs){const i=k%N,j=k/N|0;if(Math.hypot(i-o.i,j-o.j)>o.r+.3)continue;const e=edge(k);if(!e.length)continue;const[x,z]=mnXZ(k),d=Math.hypot(x-cx,z-cz);if(d<3)continue;cand.push([d,k,e[0]])}cand.sort((a,b)=>b[0]-a[0]);
 const tops=o.b=='magma'?[5.2,4.4,3.6]:o.b=='dark'?[4.6,3.6]:[3.6];
 for(const TOP of tops)for(const[sp,zig]of[[1.35,.55],[1.2,1.0],[1.1,.3]])for(const[d,k,[ea,eb]]of cand){const[lx0,lz0]=mnXZ(k),lx=lx0+ea*.55,lz=lz0+eb*.55;const ux=-ea,uz=-eb,px=-uz,pz=ux;
  /* the ledge sits against the wall; the pillars march out from it into the cavern */const n=Math.ceil(TOP/.8),rise=TOP/(n+1);
  if(!mnOpenAt(C,lx,lz)||mnPit(lx,lz)||mnPlatHit(lx,lz,2.4))continue;if(MN.ht&&MN.ht[k]<TOP+2.1)continue;
  /* the route can bend: it walks out from the ledge, and turns along the wall if it runs out of room */const steps=[];let x=lx,z=lz,dx=ux,dz=uz,ok=true;let first=1.95;
  for(let i=n-1;i>=0;i--){let nx=x+dx*(i==n-1?first:sp),nz=z+dz*(i==n-1?first:sp);const zz=(i%2?1:-1)*zig;let tx=nx+px*zz,tz=nz+pz*zz;
   if(!fits(tx,tz,1.3,rise*(i+1))){/* try turning left or right */let done=false;for(const[ax2,az2]of[[px,pz],[-px,-pz]]){const t2x=x+ax2*sp,t2z=z+az2*sp;if(fits(t2x,t2z,1.3,rise*(i+1))){tx=t2x;tz=t2z;nx=t2x;nz=t2z;done=true;break}}if(!done){ok=false;break}}
   steps.unshift([tx,tz,rise*(i+1)]);x=nx;z=nz}
  if(!ok)continue;
  /* build it */const rockM=new THREE.MeshStandardMaterial({map:qTex('mrock'),roughness:1,color:MNB[o.b].wall}),capM=new THREE.MeshStandardMaterial({map:qTex('mrock'),roughness:1,color:0xb0a090});
  const plat=(x,z,w,top)=>{const m=add(new THREE.BoxGeometry(w,top,w),rockM,x,Y+top/2,z);m.userData.pk=1;const c=add(new THREE.BoxGeometry(w+.08,.12,w+.08),capM,x,Y+top+.02,z);c.userData.pk=1;for(let i=0;i<3;i++){const b=add(new THREE.DodecahedronGeometry(.2+R()*.2,0),rockM,x+(R()-.5)*w*.9,Y+R()*top,z+(R()-.5)*w*.9);b.scale.z=.5;b.userData.pk=1}MN.plat.push({x0:x-w/2,x1:x+w/2,z0:z-w/2,z1:z+w/2,top})};
  plat(lx,lz,2.6,TOP);for(const[x2,z2,t2]of steps)plat(x2,z2,1.3,t2);
  for(const[t2,off]of[['dm',-.7],['ur',.7]]){const x2=lx+px*off,z2=lz+pz*off,O=ORE[t2],nd={t:t2,x:x2,z:z2,hp:3,gone:0,h:TOP,g:new THREE.Group()};nd.g.position.set(x2,Y+TOP+.35,z2);g.add(nd.g);const om=new THREE.MeshStandardMaterial({color:O.col,emissive:O.em,emissiveIntensity:1.4,metalness:.2,roughness:.15,transparent:t2=='dm',opacity:.9});
   for(let e=0;e<6;e++){const m=new THREE.Mesh(t2=='dm'?new THREE.OctahedronGeometry(.14+R()*.12,0):new THREE.DodecahedronGeometry(.12+R()*.1,0),om);m.position.set((R()-.5)*.6,(R()-.2)*.4,(R()-.5)*.6);m.rotation.set(R()*3,R()*3,R()*3);if(t2=='dm')m.scale.y=1.6;nd.g.add(m)}nd.g.add(glowSp(t2=='dm'?0x9ae0ff:0x80ff50,.45,1.4));
   MN.nodes.push(nd);q.props.push({x:x2,z:z2,r:1.6,deep:1,mn:1,txt:()=>q.deep!==5||nd.gone?'':MNJ.h<TOP-.6?'':'[E] ⛏️ Swing at the '+O.nm+' ('+O.ic+')',act:()=>mnHit(q,nd)});if(t2=='ur')MN.ur=(MN.ur||[]).concat([nd])}
  MN.pkr=(MN.pkr||[]).concat(steps.map(s=>[s[0],s[1]]),[[lx,lz]]);X.deco.push({k:'pk',x:lx,z:lz});return}}
/* ---------- a lava geyser ---------- */
function mnGeyser(X,x,z){const{add,Y,deco,R,g}=X;{const bad=(MN.pits||[]).some(p=>p.e?(((x-p.cx)/(p.rx+1.8))**2+((z-p.cz)/(p.rz+1.8))**2<1):(x>p.x0-1.8&&x<p.x1+1.8&&z>p.z0-1.8&&z<p.z1+1.8))||mnPlatHit(x,z,3)||MN.nodes.some(n=>Math.hypot(n.x-x,n.z-z)<2.4)||deco.some(d=>(d.k=='gey'&&Math.hypot(d.x-x,d.z-z)<4)||(d.k=='lavaP'&&d.m&&Math.hypot(d.m.position.x-x,d.m.position.z-z)<2.8))||(MN.rvB&&Math.hypot(MN.rvB.bx-x,MN.rvB.bz-z)<3);if(bad)return}const LT=lavaTex().clone();LT.needsUpdate=true;LT.repeat.set(1.2,1.2);const pool=add(new THREE.CircleGeometry(.95,24),new THREE.MeshBasicMaterial({map:LT}),x,Y+.08,z);pool.rotation.x=-Math.PI/2;
 const RK=new THREE.MeshStandardMaterial({color:0x1e1612,roughness:.8,emissive:0x260600});const cone=add(new THREE.CylinderGeometry(1.0,1.6,.4,20,1,true),RK,x,Y+.12,z);for(let a=0;a<12;a++){const t=a/12*Math.PI*2,r=.2+R()*.2,b=add(new THREE.DodecahedronGeometry(r,0),RK,x+Math.cos(t)*1.15,Y+.2,z+Math.sin(t)*1.15);b.rotation.set(R()*3,R()*3,R()*3)}
 const gl=glowSp(0xff6020,1,3.2);gl.position.set(x,Y+.5,z);g.add(gl);const CT=lavaTex().clone();CT.needsUpdate=true;CT.repeat.set(2,1);
 const col=add(new THREE.CylinderGeometry(.18,.45,1,14,1,true),new THREE.MeshBasicMaterial({map:CT,transparent:true,opacity:.93,side:THREE.DoubleSide,depthWrite:false}),x,Y+.5,z);col.visible=false;
 const cap=add(new THREE.SphereGeometry(.35,10,8),new THREE.MeshBasicMaterial({color:0xffa030,transparent:true,opacity:.85}),x,Y+1,z);cap.visible=false;
 for(const m of[pool,cone,col,cap])m.userData.pk=1;deco.push({k:'gey',col,cap,gl,LT,CT,x,z,ph:R()*7,on:0});MN.obst.push({x,z,r:1.5})}
/* ---------- lush caves: fungus grottos and dark caves ---------- */
function mnLush(X){const{o,cs,Y,R,add,g,HT,cx,cz}=X;if(o.b!='fungus'&&o.b!='dark')return;const L=mnLush.M||(mnLush.M={moss:new THREE.MeshStandardMaterial({color:0x2a5232,emissive:0x061a0a,roughness:1,polygonOffset:true,polygonOffsetFactor:-2}),grass:new THREE.MeshStandardMaterial({color:0x4a9a4a,emissive:0x0c3010,roughness:.9}),
  vine:new THREE.MeshStandardMaterial({color:0x2a5a2a,roughness:1}),leaf:new THREE.MeshStandardMaterial({color:0x3a8a3a,emissive:0x081a08,roughness:.9,side:THREE.DoubleSide}),berry:new THREE.MeshBasicMaterial({color:0x80ffd0}),pod:new THREE.MeshStandardMaterial({color:0x60ffd0,emissive:0x30d0a0,emissiveIntensity:1.2}),
  stem:new THREE.MeshStandardMaterial({color:0xe8e0d0,roughness:.8}),cap:[new THREE.MeshStandardMaterial({color:0x40c0a0,emissive:0x106050,roughness:.6}),new THREE.MeshStandardMaterial({color:0xa060d0,emissive:0x401860,roughness:.6})],root:new THREE.MeshStandardMaterial({color:0x3a2a1e,roughness:1}),rub:new THREE.MeshStandardMaterial({color:0x2a2622,roughness:1}),
  gG:new THREE.ConeGeometry(.03,1,4),vG:new THREE.BoxGeometry(.04,1,.04),lG:new THREE.PlaneGeometry(.22,.12),bG:new THREE.SphereGeometry(.05,6,4),pG:new THREE.SphereGeometry(.12,8,6)});
 const CSZ=MN.C,rp=(x)=>x+(R()-.5)*CSZ*.9,pts=[];const fun=o.b=='fungus';
 for(const k of cs){const[x,z]=mnXZ(k),H=HT[k];
  if(fun){/* moss */for(let m=0;m<2;m++){const p=add(new THREE.CircleGeometry(.6+R()*.8,10),L.moss,rp(x),Y+.012+m*.002,rp(z));p.rotation.x=-Math.PI/2;p.scale.y=.6+R()*.6}
   /* grass tufts */for(let t=0;t<3;t++){const gx=rp(x),gz=rp(z);for(let b=0;b<4;b++){const h=.25+R()*.35,m=new THREE.Mesh(L.gG,L.grass);m.scale.set(1,h,1);m.position.set(gx+(R()-.5)*.25,Y+h/2,gz+(R()-.5)*.25);m.rotation.set((R()-.5)*.4,0,(R()-.5)*.4);g.add(m)}}
   /* ferns */if(R()<.35){const fx=rp(x),fz=rp(z);for(let f=0;f<6;f++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.18,.7),L.leaf);m.position.set(fx,Y+.3,fz);m.rotation.set(-.9,f*1.05,0);m.translateY(.25);g.add(m)}}
   /* glow pods */if(R()<.4){for(let p=0;p<3;p++){const m=new THREE.Mesh(L.pG,L.pod);m.position.set(rp(x),Y+.1,rp(z));m.scale.set(1,.8+R()*.6,1);g.add(m)}}
   /* little mushrooms */if(R()<.45){const mx=rp(x),mz=rp(z);for(let b=0;b<3;b++){const s=.15+R()*.2,st=add(new THREE.CylinderGeometry(.03,.04,s,6),L.stem,mx+(R()-.5)*.4,Y+s/2,mz+(R()-.5)*.4);add(new THREE.SphereGeometry(.1+s*.3,8,5,0,Math.PI*2,0,Math.PI/2),L.cap[R()*2|0],st.position.x,Y+s,st.position.z).scale.y=.6}}}
  else{/* dark caves: rubble and roots */if(R()<.5){const rx2=rp(x),rz2=rp(z);for(let b=0;b<4;b++){const r=.1+R()*.25,m=add(new THREE.DodecahedronGeometry(r,0),L.rub,rx2+(R()-.5)*.7,Y+r*.4,rz2+(R()-.5)*.7);m.rotation.set(R()*3,R()*3,R()*3)}}}
  /* hanging vines (fungus) or roots (dark) */if(R()<(fun?.55:.3)){const vx=rp(x),vz=rp(z),vl=fun?1.4+R()*2.4:.8+R()*1.6;const v=new THREE.Mesh(L.vG,fun?L.vine:L.root);v.scale.y=vl;v.position.set(vx,Y+H-vl/2,vz);g.add(v);
   if(fun){for(let y=.3;y<vl;y+=.35){const lf=new THREE.Mesh(L.lG,L.leaf);lf.position.set(vx+(R()-.5)*.08,Y+H-y,vz+(R()-.5)*.08);lf.rotation.set((R()-.5)*.8,R()*6,(R()-.5)*.8);g.add(lf)}const b=new THREE.Mesh(L.bG,L.berry);b.position.set(vx,Y+H-vl-.03,vz);g.add(b)}}
  /* glowworms on the roof */for(let w=0;w<(fun?6:9);w++)pts.push(rp(x),Y+HT[k]-.02,rp(z))}
 if(fun){/* giant mushrooms, tree-sized now the roof is high */for(let m=0;m<2;m++){const k=cs[R()*cs.length|0],[x,z]=mnXZ(k);if(Math.hypot(x-cx,z-cz)<2||mnPit(x,z)||mnPlatHit(x,z,2))continue;const s=2.6+R()*2.2,H=HT[k];if(s>H-1.2)continue;
   add(new THREE.CylinderGeometry(.22+s*.05,.35+s*.06,s,10),L.stem,x,Y+s/2,z);const cp=add(new THREE.SphereGeometry(.9+s*.3,16,10,0,Math.PI*2,0,Math.PI/2),L.cap[R()*2|0],x,Y+s-.05,z);cp.scale.y=.55;for(let d=0;d<8;d++){const a=d/8*Math.PI*2;add(new THREE.SphereGeometry(.06,6,4),L.berry,x+Math.cos(a)*(.7+s*.25),Y+s-.1,z+Math.sin(a)*(.7+s*.25))}X.obst(x,z,.5+s*.07)}}
 if(pts.length){const gm=new THREE.BufferGeometry();gm.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));const pm=new THREE.PointsMaterial({color:fun?0x90ffe0:0x70d0ff,size:.07,sizeAttenuation:true,transparent:true,opacity:.9});const P=new THREE.Points(gm,pm);P.frustumCulled=false;g.add(P)}}
/* after the cave is built: clear stalagmites and the like off the parkour routes, and pick the rare big ore seams */
{const mx0=mnExtras;mnExtras=function(q,g,R,add,obst,C,BI,HT,rooms,MAT,deco,K,IN){MN.pkr=[];
  /* lava lakes in the big magma chambers (before the parkour, so the routes keep out of them) */
  const r=mx0.apply(this,arguments);
  try{const pts=MN.pkr||[];if(pts.length){const near=(x,z,r2)=>pts.some(p=>Math.hypot(x-p[0],z-p[1])<r2);
    for(const c of g.children.slice()){if(!c.isMesh||c.isInstancedMesh||c.userData.pk)continue;const ty=c.geometry&&c.geometry.type;if(!/Cone|Dodecahedron|Cylinder|Sphere|Octahedron/.test(ty||''))continue;if(near(c.position.x,c.position.z,1.6))g.remove(c)}
    for(const c of g.children.slice()){if(c.type==='Group'&&!c.userData.pk&&!MN.nodes.some(n=>n.g===c)&&near(c.position.x,c.position.z,1.4))g.remove(c)}
    MN.obst=MN.obst.filter(o=>!near(o.x,o.z,1.6+o.r*.5))}}catch(e){conLog('error','parkour clearing: '+e.message)}
  /* nothing stands in a chasm or a lava lake */try{const inP=(x,z,m)=>(MN.pits||[]).some(p=>p.e?(((x-p.cx)/(p.rx+m))**2+((z-p.cz)/(p.rz+m))**2<1):(x>p.x0-m&&x<p.x1+m&&z>p.z0-m&&z<p.z1+m));
   for(const c of g.children.slice()){if(!c.isMesh||c.isInstancedMesh||c.userData.pk)continue;const ty=c.geometry&&c.geometry.type;if(ty=='DodecahedronGeometry'){if(c.position.y>MN.Y+.5&&inP(c.position.x,c.position.z,.3))g.remove(c);continue}if(!/Cone|Cylinder|Sphere|Octahedron/.test(ty||''))continue;if(c.position.y>MN.Y+2.6)continue;if(inP(c.position.x,c.position.z,.5)&&(ty!='CylinderGeometry'||!(MN.plat||[]).some(p=>c.position.x>p.x0-.6&&c.position.x<p.x1+.6&&c.position.z>p.z0-.6&&c.position.z<p.z1+.6)))g.remove(c)}
   for(const c of g.children.slice())if(c.type==='Group'&&!MN.nodes.some(n=>n.g===c)&&inP(c.position.x,c.position.z,.4))g.remove(c);
   MN.obst=MN.obst.filter(o=>!inP(o.x,o.z,.2))}catch(e){}
  try{const B=MN.rvB;if(B){MN.plat.push(B.along=='x'?{x0:B.bx-.9,x1:B.bx+.9,z0:B.bz-B.rw/2-.6,z1:B.bz+B.rw/2+.6,top:.3}:{x0:B.bx-B.rw/2-.6,x1:B.bx+B.rw/2+.6,z0:B.bz-.9,z1:B.bz+.9,top:.3})}MN.rvB=null}catch(e){}
  try{const inP2=(x,z,m)=>(MN.pits||[]).some(p=>p.e?(((x-p.cx)/(p.rx+m))**2+((z-p.cz)/(p.rz+m))**2<1):(x>p.x0-m&&x<p.x1+m&&z>p.z0-m&&z<p.z1+m));
   for(const c of g.children.slice()){if(!c.isMesh||c.isInstancedMesh)continue;const ty=c.geometry&&c.geometry.type;if((ty=='CircleGeometry'||ty=='TorusGeometry')&&c.position.y>MN.Y-.1&&c.position.y<MN.Y+.2&&inP2(c.position.x,c.position.z,1.2))g.remove(c)}}catch(e){}
  try{mnHoles(g,MAT,C,BI)}catch(e){conLog('error','cave holes: '+e.message)}
  try{const R2=mnRnd((MN.seed|0)+977),cand=MN.nodes.filter(n=>!n.h&&n.t!='dm'&&n.t!='ur');const nb=Math.min(cand.length,2+(R2()*3|0));for(let i=0;i<nb;i++){const n=cand.splice(R2()*cand.length|0,1)[0];if(!n)break;n.big=1;n.bhp=8;n.g.scale.multiplyScalar(2.1);n.g.add(glowSp(0xffe0a0,.35,2.2));}}catch(e){}
  return r}}
/* ---------- moving the world: geysers erupting, falling into chasms and lava ---------- */
{const ru12=busRoamUpd;busRoamUpd=function(q,dt){const r=ru12.apply(this,arguments);try{if(q.deep===5&&!MN.ride&&MN.deco){const t=q.rt||0,lz=P.z-q.OZ;
   for(const d of MN.deco){if(d.k!=='gey')continue;d.LT.offset.set(Math.sin(t*.3)*.2,(t*.08)%1);const u=(t+d.ph)%7;const near=Math.hypot(P.x-d.x,lz-d.z)<28;
    if(u<1.9){if(!d.on){d.on=1;if(near)try{snd(55,.5);snd(90,.3)}catch(e){}}const k=Math.sin(u/1.9*Math.PI),h=.4+Math.pow(k,.7)*5.4;d.col.visible=true;d.col.scale.set(.8+k*.4,h,.8+k*.4);d.col.position.y=MN.Y+h/2;d.CT.offset.y=-(t*2.2)%1;d.cap.visible=true;d.cap.position.y=MN.Y+h;d.cap.scale.setScalar(.8+k*.8);d.gl.scale.setScalar(3.2+k*4);
     if(near&&Math.random()<dt*20)try{vfx('ember',d.x+(Math.random()-.5)*.6,MN.Y+h,d.z+q.OZ+(Math.random()-.5)*.6,{n:2})}catch(e){}}
    else{if(d.on){d.on=0;d.col.visible=false;d.cap.visible=false;d.gl.scale.setScalar(3.2)}if(near&&u>6.3&&Math.random()<dt*6)try{vfx('puff',d.x,MN.Y+.3,d.z+q.OZ,{n:1,c:0xff8030})}catch(e){}}}
   /* where you last stood safely */const pit=mnPit(P.x,lz);if(MNJ.g&&MNJ.h>=0&&!pit){let edge=false;for(const p of MN.pits||[]){if(mnPit(P.x+1.1,lz)||mnPit(P.x-1.1,lz)||mnPit(P.x,lz+1.1)||mnPit(P.x,lz-1.1)){edge=true;break}}if(!edge)MN.safe={x:P.x,z:lz}}
   if(!MN.falling&&(MNJ.h<-2.2||(MNJ.h<-.3&&pit&&pit.lava))){MN.falling=1;const lava=pit&&pit.lava;try{bsF.style.transition='opacity .25s';bsF.style.background=lava?'#ff4000':'#000';bsF.style.opacity=1}catch(e){}try{snd(lava?120:80,.6);if(lava)snd(60,.8)}catch(e){}
    setTimeout(()=>{try{const sf=MN.safe||{x:MN.ox-.8,z:MN.oz};P.x=sf.x;P.z=sf.z+q.OZ;MNJ.h=0;MNJ.vy=0;MNJ.g=1;P.dy=MN.Y;let lost=0;if(lava){lost=mnCnt(MN.carry);MN.carry={}}else{for(const k in MN.carry){const h=Math.ceil((MN.carry[k]|0)/2);lost+=h;MN.carry[k]-=h;if(MN.carry[k]<=0)delete MN.carry[k]}}
      hint(lava?'🔥 You fell in the LAVA. The crew fished you out with a hook'+(lost?', but the '+lost+' ore you were carrying melted':'')+'.':'🕳️ You fell down the CHASM. The crew hauled you up on a rope'+(lost?', but '+lost+' ore fell out of your bag':'')+'.');
      bsF.style.transition='opacity 1.2s';bsF.style.opacity=0;setTimeout(()=>{try{bsF.style.background='#000'}catch(e){}},1300)}catch(e){}MN.falling=0},900)}}}catch(e){}return r}}
/* ---------- the rare big ore seams ---------- */
{const mh3=mnHit;mnHit=function(q,n){try{if(n&&n.big&&!n.gone&&q.deep===5){const k=mnCell(n.x,n.z);if((MN.bio&&MN.bio[k]=='dark'&&!qtL('lamp'))||mnCnt(MN.carry)>=qtCap()||MN.hitT>performance.now())return mh3.apply(this,arguments);
   MN.hitT=performance.now()+650;snd(150,.1);setTimeout(()=>snd(1100+Math.random()*500,.04),60);try{vfx('spark',n.g.position.x,n.g.position.y,n.g.position.z+q.OZ,{n:12,c:0xffd080});camShake(.12,.12)}catch(e){}n.bhp--;n.g.scale.multiplyScalar(.95);
   if(MN.st=='open'&&Math.random()<.05){MN.t=Math.max(MN.t,Math.min(MN.life-12,MN.t+45));camShake(.7,.9);snd(45,1.2);try{vfx('dust',P.x,MN.Y+3,P.z,{n:12,w:3})}catch(e){}hint('🪨 The whole roof GROANS. That big seam was holding it up: the mine will come down SOONER! ('+Math.max(0,Math.ceil(MN.life-MN.t))+' s)')}
   else if(n.bhp>0&&n.bhp%3==0)hint('💎 A BIG '+ORE[n.t].nm.toUpperCase()+' SEAM: '+n.bhp+' more swings. Careful, it is holding the roof up.');
   if(n.bhp<=0){n.big=0;n.hp=1;MN.hitT=0;const c0=mnCnt(MN.carry);mh3.call(this,q,n);if(n.gone){MN.carry[n.t]=(MN.carry[n.t]|0)+5;hint('💎 The big seam comes away: '+(mnCnt(MN.carry)-c0)+' '+ORE[n.t].nm+' ore! You carry '+mnCnt(MN.carry)+'.')}}
   return}}catch(e){conLog('error','big ore: '+e.message)}return mh3.apply(this,arguments)}}
/* ---------- the cage drops down the shaft when the mine collapses, and is wound back up for the next one ---------- */
{const mc0=mnCollapse;mnCollapse=function(q){const r=mc0.apply(this,arguments);try{if(!MN.ride&&MN.cage)MN.cdrop={y0:MN.cage.position.y,t:0}}catch(e){}return r}}
{const mt0=mnTick;mnTick=function(q,dt){const r=mt0.apply(this,arguments);try{const d=MN.cdrop,cg=MN.cage;if(d&&cg&&!MN.ride){d.t+=dt;if(MN.st=='closed'){const y1=QD.F-9;if(cg.position.y>y1){cg.position.y=Math.max(y1,cg.position.y-dt*(1.5+d.t*2));if(Math.random()<dt*4)try{snd(70+Math.random()*30,.05)}catch(e){}}}
   else{cg.position.y=Math.min(QD.F,cg.position.y+dt*3);if(Math.random()<dt*3)try{snd(110+Math.random()*40,.04)}catch(e){}if(cg.position.y>=QD.F){cg.position.y=QD.F;MN.cdrop=null;try{snd(220,.2)}catch(e){}}}}}catch(e){}return r}}
/* the lava lake goes in from the magma chamber's dressing */
{const ch0=mnChasm;mnChasm=function(X){const r=ch0.apply(this,arguments);try{if(X.o.b=='magma'){let ax=0,az=0;for(const k of X.cs){const[x,z]=mnXZ(k);ax=Math.max(ax,Math.abs(x-X.cx));az=Math.max(az,Math.abs(z-X.cz))}const along=ax>=az?'x':'z';mnLavaLake(X,along,along=='x'?X.cz+1.6:X.cx+1.6);{const len=(along=='x'?ax:az)*2+MN.C,rw=1.3,c=along=='x'?X.cz+1.6:X.cx+1.6,m=along=='x'?X.cx:X.cz;MN.pits.push(along=='x'?{x0:m-len/2,x1:m+len/2,z0:c-rw/2,z1:c+rw/2,lava:1,rv:1}:{x0:c-rw/2,x1:c+rw/2,z0:m-len/2,z1:m+len/2,lava:1,rv:1});0}
   /* one or two geysers out in the open chamber, wherever there is room */for(let tr=0,n0=X.deco.filter(d=>d.k=='gey').length;tr<14&&X.deco.filter(d=>d.k=='gey').length<n0+2;tr++){const k=X.cs[X.R()*X.cs.length|0],[x,z]=mnXZ(k);if(Math.hypot(x-MN.ox,z-MN.oz)<8)continue;const gx=x+(X.R()-.5)*2,gz=z+(X.R()-.5)*2;let ok=true;for(const[a2,b2]of[[1.8,0],[-1.8,0],[0,1.8],[0,-1.8]])if(!mnOpenAt(X.C,gx+a2,gz+b2))ok=false;if(ok)mnGeyser(X,gx,gz)}}}catch(e){conLog('error','lava lake: '+e.message)}return r}}

/* the floor is cut away over chasms, lava lakes and the lava river, so they have real depth */
function mnHoles(g,MAT,C,BI){const N=MN.N,CS=MN.C,Y=MN.Y,pits=MN.pits||[];if(!pits.length)return;const bb=p=>p.e?{x0:p.cx-p.rx,x1:p.cx+p.rx,z0:p.cz-p.rz,z1:p.cz+p.rz}:p;
 const inP=(x,z)=>pits.some(p=>p.e?(((x-p.cx)/p.rx)**2+((z-p.cz)/p.rz)**2<1):(x>p.x0&&x<p.x1&&z>p.z0&&z<p.z1));
 const idx={};const order={};for(let k=0;k<N*N;k++){if(!C[k])continue;const b=BI[k];order[b]=order[b]||0;idx[k]=order[b]++}
 const ims=g.children.filter(c=>c.isInstancedMesh);const Z=new THREE.Matrix4().makeScale(0,0,0);const touched=new Set();
 for(let k=0;k<N*N;k++){if(!C[k]||BI[k]=='flood')continue;const[x,z]=mnXZ(k),h=CS/2;if(!pits.some(p=>{const r=bb(p);return x+h>r.x0&&x-h<r.x1&&z+h>r.z0&&z-h<r.z1}))continue;
  const b=BI[k],im=ims.find(m=>m.material===MAT[b].f);if(!im)continue;im.setMatrixAt(idx[k],Z);touched.add(im);
  /* the floor around the hole, in strips */const st=.4,n=Math.round(CS/st);for(let r=0;r<n;r++){const zz=z-h+st*(r+.5);let a=-1;for(let c=0;c<=n;c++){const xx=x-h+st*(c+.5),open=c<n&&!inP(xx,zz);if(open&&a<0)a=c;if((!open||c==n)&&a>=0){const w=(c-a)*st,m=new THREE.Mesh(new THREE.BoxGeometry(w,.3,st),MAT[b].f);m.position.set(x-h+a*st+w/2,Y-.15,zz);g.add(m);a=-1}}}}
 for(const im of touched)im.instanceMatrix.needsUpdate=true;
 /* the lava river sits down in its channel, between dark glowing walls */for(const d of MN.deco||[])if(d.k=='lavaR')d.m.position.y=Y-.45;const CW=new THREE.MeshStandardMaterial({color:0x2a1a14,roughness:.9,emissive:0x401000});for(const p of pits){if(!p.rv)continue;const ax=p.x1-p.x0>p.z1-p.z0;for(const sd of[0,1]){const m=new THREE.Mesh(new THREE.BoxGeometry(ax?p.x1-p.x0:.1,.4,ax?.1:p.z1-p.z0),CW);m.position.set(ax?(p.x0+p.x1)/2:(sd?p.x1:p.x0),Y-.45,ax?(sd?p.z1:p.z0):(p.z0+p.z1)/2);g.add(m)}}}
/* ---------- jumping in the desert (SPACE), outdoors only: not inside buildings or the prison, not in the mine (it has its own) ---------- */
const DJ={h:0,vy:0,sp:0};
{const ru13=busRoamUpd;busRoamUpd=function(q,dt){const r=ru13.apply(this,arguments);try{const lz=P.z-q.OZ;
  const can=state=='play'&&!q.deep&&!q.seat&&!q.inBus&&!q.fling&&!q.lift&&!q.icut&&!q.xr&&!q.kp&&!q.court&&!q.rsp&&!q.wireUI&&!(q.pen&&q.pen.on)&&!q.wade&&!q.ingot&&!inDest(P.x,lz)&&!penArea(P.x,lz)&&!(typeof MN!='undefined'&&MN.ride);
  if(can&&keys.Space&&!DJ.sp&&DJ.h<=.001&&DJ.vy<=0){DJ.vy=5.6;try{snd(220,.04)}catch(e){}}DJ.sp=!!keys.Space;
  if(!can){DJ.h=0;DJ.vy=0}else if(DJ.h>0||DJ.vy>0){DJ.vy-=18*dt;DJ.h+=DJ.vy*dt;if(DJ.h<=0){DJ.h=0;if(DJ.vy<-4)try{snd(110,.05)}catch(e){}DJ.vy=0}}
  if(DJ.h>0)P.dy+=DJ.h}catch(e){}return r}}
