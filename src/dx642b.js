/* =====================================================================================================
   r655 candidate: THE OLD QUARRY UNDERGROUND, part 2: THE WIRING (docs/design/quarry-underground.md).
   The mine under the headframe is rebuilt from the design chat's models (dx642):
   - THREE LEVELS built from pieces: level 1 Old Workings (timbered drives, rails, the miners' rooms), level 2 The Caves
     and level 3 The Deep, each with its own shaft station. Every room comes in several versions.
   - The cage always stops at level 1. SHAFT SINKING (a new Quarry Tycoon upgrade) opens the cage gate on level 2, then
     level 3. Without it you walk down: a spiral decline or a ladderway on every level (hold W / S on the ladder).
   - A shift is 6 minutes. Once per shift one side of a pillar round or rock island caves in (dig through, 8 swings, or
     go round). Dynamite from the powder magazine (up to 3 sticks) clears rubble or blows a big seam in one go. Some veins
     on levels 2 and 3 let out GAS (walk out before your breath runs out). Lunchboxes, notes, brass tag 17, fossils
     (the assay office buys them), a first-aid kit, the foreman's safe, the raft, the zip line, the ore pass...
   - Finding your way: signposts back to the cage, a map board at every station, and the minimap underground shows
     the pieces you have walked through on your level.
   - The mine is only made when someone first takes the cage down, and it is built a level at a time during the ride
     (level 1 first), not every five minutes while nobody goes down.
   Walking uses the plan's floor shapes on a 25 cm grid per level (floor, chasm, lava, deep or wading water, ramps,
   solid things), as the design chat's room checker does.
   ?nougm in the address keeps the old mine.
   ===================================================================================================== */
const UGW={on:!/[?&]nougm\b/.test(location.search)};
const UGG={N:608,O:76,S:.25};
const UGM={plan:null,L:[null,null,null],job:null,lv:0,y:0,gone:new Set(),seen:[new Set(),new Set(),new Set()],hinted:new Set(),
 lights:null,lsl:[],lt:0,breath:1,gas:[],fxs:[],charges:[],fall:null,dyn:0,aid:0,climb:null,raft:null,onRaft:0,zip:null,riding:null,
 taken:new Set(),comp:1,doorsOpen:new Set(),fallT:-1,ventT:0,stats:{ms:0,levels:0}};
const UGLN=4;   /* the fixed pool of lights that move to the nearest lamps */
const ugmY=L=>UGL[0].y+UGLY(L);                            /* desert y of a level's floor */
const ugmLvOf=y=>Math.max(0,Math.min(2,Math.round(-y/12))); /* the level a mine-coords height belongs to */
const ugmLX=x=>x-MN.ox,ugmLZ=z=>z-MN.oz;                    /* desert-local -> mine coords */
function ugmIdx(x,z){const i=Math.floor((x+UGG.O)/UGG.S),j=Math.floor((z+UGG.O)/UGG.S);return(i<0||j<0||i>=UGG.N||j>=UGG.N)?-1:j*UGG.N+i}
function ugmCode(L,x,z){const l=UGM.L[L];if(!l||!l.grid)return 0;const k=ugmIdx(x,z);return k<0?0:l.grid.c[k]}
function ugmPid(L,x,z){const l=UGM.L[L];if(!l||!l.grid)return-1;const k=ugmIdx(x,z);return k<0?-1:l.grid.p[k]-1}
const ugmPolyD=(x,z,P)=>{let m=1e9;for(let i=1;i<P.length;i++)m=Math.min(m,ugSegD(x,z,P[i-1],P[i]));return m};
const ugmCat=t=>UGP[t]?UGP[t].cat:(t=='station'?'st':'tun');

/* ---------- the kit's shared materials and pictures (never thrown away) ---------- */
function ugmKit(){const K=ugKit();if(!K.gm){K.gm=1;for(const k in K.oreM)K.oreM[k].userData.ug='ore_'+k;const T=new Set();for(const k in K){const v=K[k];if(v&&v.isTexture)T.add(v)}
  for(const k in K.mat){const m=K.mat[k];for(const f of['map','normalMap','emissiveMap','alphaMap','bumpMap'])if(m[f])T.add(m[f])}K.texSet=T}return K}
/* throw away a built level: its own shapes and pictures, but not the kit's shared materials */
function ugmFree(o){if(!o)return;const K=ugmKit();o.traverse(m=>{if(m.geometry)try{m.geometry.dispose()}catch(e){}const a=m.material;if(a)for(const x of Array.isArray(a)?a:[a]){if(x.userData&&x.userData.ug&&!x.userData.ugOwn)continue;for(const f of['map','emissiveMap'])if(x[f]&&!K.texSet.has(x[f]))try{x[f].dispose()}catch(e){}try{x.dispose()}catch(e){}}})}

/* ---------- the shaft stations: the landing gate slides up (it was a fixed grille), the shaft is lined all the way
   between levels (the sump floor is left out on levels 1 and 2, so the cage can go on down) ---------- */
{const s0=ugStationBuild;ugStationBuild=function(b,p,L,ctx){if(!UGW.on)return s0.apply(this,arguments);const y=UGLY(L),gx=-1.92,bars=[];
 const pb=Object.create(b);pb.box=function(k,w,h,d,x,yy,z){
  if(k=='steel'&&Math.abs(x-gx)<1e-6&&((w===.02&&h===2.1&&d===.02)||(w===.03&&h===.05&&d===2.6))){bars.push([w,h,d,x,yy,z]);return pb}
  if(k=='black'&&L<2&&w===3.2&&h===.1&&d===3.2&&Math.abs(yy-(y-1.6))<1e-6)return pb;
  b.box.apply(b,arguments);return pb};
 s0.call(this,pb,p,L,ctx);ctx.gateBars=bars;
 if(L<2){const top=y-1.62,bot=UGLY(L+1)+4.2+3.22,hh=top-bot;
  for(const [ax,az,yaw] of[[0,-1.6,0],[1.6,0,-Math.PI/2],[0,1.6,Math.PI],[-1.6,0,Math.PI/2]])b.box('plank',3.2,hh,.08,ax*1.03,bot+hh/2,az*1.03,yaw);
  const gb=UGLY(L+1)+4.2+3.2,gt=y-1.6;for(const sx of[-1,1])for(const sz of[-1,1])b.box('steel',.12,gt-gb,.12,sx*1.48,(gt+gb)/2,sz*1.48,0)}}}

/* ---------- building a level a piece at a time (the kit's ugBuildLevel, split into steps) ---------- */
function* ugmBuildGen(plan,L){const K=ugmKit(),g=new THREE.Group(),b=ugBatch();
 const ctx={lamps:[],veins:[],signs:[],posts:[],decl:[],ends:[],plates:[],solids:[],moving:[],pickups:[],hot:[],dist:null};
 const len=p=>{let s=0;for(const sh of p.d.shp)if(sh.k=='path')for(let i=1;i<sh.pts.length;i++)s+=Math.hypot(sh.pts[i][0]-sh.pts[i-1][0],sh.pts[i][1]-sh.pts[i-1][1]);return s||8};
 const memo={};ctx.dist=p=>{if(p.st)return 0;if(memo[p.id]!=null)return memo[p.id];const par=plan.P[p.par];memo[p.id]=par?ctx.dist(par)+len(par):0;return memo[p.id]};
 const y=UGLY(L);
 const piece=p=>{const here=p.L==L;const t=p.type;
  if(p.st){ugStationBuild(b,p,L,ctx);return}
  if(t=='decline'){ugDecline(b,p,ctx);return}
  if(t=='ladder'){ugLadder(b,p,ctx,here?'up':'down');return}
  if(t=='tee'||t=='cross'){ugJunction(b,p,L,ctx);return}
  if(t=='round'){ugRound(b,p,L,ctx);return}
  if(typeof ugPieceL2=='function'&&ugPieceL2(b,p,L,ctx))return;
  if(t=='old')return;
  const W=ugWorld(p);
  for(const s of W.shp){
   if(s.k=='path'&&s.w<3.99){const op=ugOpenings(p);for(const [q,nb] of[[s.pts[0],s.pts[1]],[s.pts[s.pts.length-1],s.pts[s.pts.length-2]]]){if(!op.some(o=>Math.hypot(o.x-q[0],o.z-q[1])<.05))continue;const fx=q[0]-nb[0],fz=q[1]-nb[1],l=Math.hypot(fx,fz);ugBulkhead(b,q[0],y,q[1],fx/l,fz/l,s.w/2)}}
   if(s.k=='path'){const tr=ugTube(b,s.pts.map(q=>[q[0],y,q[1]]),{hw:Math.min(2,s.w/2),fil:t=='join'?3:0,rails:true,ends:ctx.ends,lampsOut:ctx.lamps,lampOff:p.id%2,broken:t=='collapsed'});
    if(t=='collapsed'&&typeof ugCollapsed=='function')ugCollapsed(b,p,y,ctx,tr);
    const R=ugRng(p.id*977+13);for(let sd=3+R()*3;sd<tr.L-2;sd+=5+R()*4){const side=R()<.5?-1:1,hi=R()<.5;if(R()<.35)continue;const sc=sd-((sd-1.5)%3+3)%3+1.5;const s2=Math.abs(sd-sc)<.6?sc+1.5:sd;
     const w=ugTubeWall(tr,ugTubeRing(tr,s2),side<0?(hi?2:1):(hi?12:13));ctx.veins.push({x:w.x,y:w.y,z:w.z,dx:w.dx,dz:w.dz,t:R()<.15?'ag':R()<.55?'fe':'cu'})}}
   else if(s.k=='rect'&&typeof ugRoomL1=='function'&&ugRoomL1(b,p,L,ctx)){}
   else if(s.k=='rect'){const lr=p.d.shp.find(q=>q.k=='rect');const r={x0:lr.x0,x1:lr.x1,z0:lr.z0,z1:lr.z1};ugRectRoom(b,p,r,t=='stope'?5.5:3.6,y,{doors:ugDoorsFor(p,r)})}}};
 for(const p of plan.P){const here=p.L==L,above=p.d.both&&p.L+1==L;if(!here&&!(above&&p.type=='ladder'))continue;
  const v0=ctx.veins.length,m0=ctx.moving.length,k0=ctx.pickups.length;piece(p);for(let i=v0;i<ctx.veins.length;i++)ctx.veins[i].pid=p.id;
  for(let i=m0;i<ctx.moving.length;i++)ctx.moving[i].userData.pid=p.id;for(let i=k0;i<ctx.pickups.length;i++)ctx.pickups[i].userData.pid=p.id;yield 1}
 for(const o of plan.open)if(o.cap&&o.L==L){const par=plan.P[o.par];if(!par)continue;const v0=ctx.veins.length;const sp=ugFace(b,o.x,y,o.z,o.dir,2,{rock:ugRK(L),floor:ugFL(L)});const R=ugRng(Math.round(o.x*13+o.z*7));for(const q of sp)if(R()<.8)ctx.veins.push({x:q[0],y:q[1],z:q[2],dx:q[3],dz:q[4],t:R()<.25?'ag':R()<.6?'fe':'cu'});for(let i=v0;i<ctx.veins.length;i++){ctx.veins[i].pid=o.par;ctx.veins[i].face=1}}
 for(const e of ctx.ends){if(ctx.ends.some(f=>f!==e&&Math.hypot(f.x-e.x,f.z-e.z)<.06&&Math.abs(f.y-e.y)<.1))continue;if(ctx.plates.some(q=>Math.hypot(q[0]-e.x,q[1]-e.z)<(q[2]||1.0)))continue;ugBuffer(b,e.x,e.y,e.z,e.dx,e.dz,ctx)}
 yield 1;b.build(g,K.mat);yield 1;
 for(const m of ctx.moving)g.add(m);for(const m of ctx.pickups)g.add(m);
 const R=ugRng(4242+L);for(const v of ctx.veins){const m=ugVein(v.t,R);m.position.set(v.x,v.y,v.z);m.rotation.y=Math.atan2(-v.dx,-v.dz);g.add(m)}
 for(const s of ctx.posts){const d=Math.max(5,Math.round(s.dist/5)*5);g.add(ugSign(s.x,s.y,s.z,s.yaw,'⬅ CAGE '+d+' m','CAGE '+d+' m ➡'))}
 for(const s of ctx.signs){const sw=s.w||1.2,sh=s.h||.34,t=s.map&&typeof ugMapTex=='function'?ugMapTex(plan,L,{here:[s.x,s.z],ar:sw/sh}):ugSignTex(s.txt,sw/sh);const m=new THREE.Mesh(new THREE.PlaneGeometry(sw,sh),new THREE.MeshStandardMaterial({map:t,roughness:.8}));m.position.set(s.x,s.y,s.z);m.rotation.y=s.yaw;m.userData.noSeam=true;g.add(m)}
 const res={g,lamps:ctx.lamps,veins:ctx.veins,decl:ctx.decl,solids:ctx.solids,moving:ctx.moving,pickups:ctx.pickups,hot:ctx.hot,portal:ctx.portal||null,gateBars:ctx.gateBars||[]};
 /* level 2: one or two fossils in the cave walls, each in place of a vein (the shift file's step) */
 if(L==1){const R2=ugRng((plan.seed||1)*31+7),vs=g.children.filter(o=>o.userData.vein&&o.userData.vein!='cr'&&o.userData.vein!='dm');const n=vs.length?1+(R2()<.5?1:0):0;
  for(let i=0;i<n&&vs.length;i++){const v=vs.splice(R2()*vs.length|0,1)[0],f=ugFossil(R2()<.6?'ammonite':'trilobite');f.position.copy(v.position);f.rotation.copy(v.rotation);g.remove(v);ugmFree(v);
   const k=res.veins.findIndex(q=>Math.abs(q.x-v.position.x)<1e-6&&Math.abs(q.z-v.position.z)<1e-6);if(k>=0)res.veins.splice(k,1);g.add(f);res.pickups.push(f)}}
 return res}

/* ---------- ore by place (the spec's table): veins in the plain tunnels, junctions and working faces follow their
   level; the rooms keep the ore the models gave them ---------- */
const UGORE=[{cu:.4,fe:.4,ag:.15,au:.05},{cu:.1,fe:.2,ag:.35,au:.2,cr:.15},{fe:.1,ag:.15,au:.4,cr:.25,dm:.05,ur:.05}];
const UGPLAIN=new Set(['drive','bend','tee','cross','collapsed','join','station','round','cpass','cbend','fork','island','basalt','ladder','decline']);
function ugmPick(R,w){let s=0;for(const k in w)s+=w[k];let r=R()*s;for(const k in w){r-=w[k];if(r<=0)return k}return Object.keys(w)[0]}

/* ---------- the veins of a level go into a few shared shapes (one per kind of ore); each vein keeps its own stretch of
   corners, so it can still shrink as you hit it and vanish when it breaks ---------- */
function ugmVeins(L,lev,res,plan){const K=ugmKit(),g=res.g,vg=g.children.filter(o=>o.userData.vein),B={},recs=[];const R=ugRng(((plan.seed|0)*7+L*131+11)>>>0);
 const lab=qtL('lab')>0;let s2=((plan.seed|0)*9301+49297+L*17)%233280;const R2=()=>(s2=(s2*9301+49297)%233280)/233280;
 const v3=new THREE.Vector3(),M=new THREE.Matrix4(),Nm=new THREE.Matrix3();
 vg.forEach((v,i)=>{const info=res.veins[i]||{};const p=plan.P[info.pid];let t=v.userData.vein;
  if(info.face||(p&&UGPLAIN.has(p.type)))t=ugmPick(R,UGORE[L]);
  if(lab&&(t=='cu'||t=='fe')&&R2()<.35)t=R2()<.6?'ag':'au';
  const big=!!info.big,sc=big?1.7:1,c=v.position.clone();v.updateMatrix();const rec={t,c,big,pid:info.pid,ranges:[],s:1,vis:true,y:v.position.y,dx:info.dx||0,dz:info.dz||0};
  for(const m of v.children){m.updateMatrix();M.multiplyMatrices(v.matrix,m.matrix);Nm.getNormalMatrix(M);const key=m.material===K.mat.oreRock?'rock':'ore_'+t,gg=m.geometry.index?m.geometry.toNonIndexed():m.geometry;
   const P=gg.attributes.position,N=gg.attributes.normal,U=gg.attributes.uv,bb=B[key]||(B[key]={p:[],n:[],u:[],mat:key=='rock'?K.mat.oreRock:K.oreM[t]});const st=bb.p.length/3;
   for(let k=0;k<P.count;k++){v3.fromBufferAttribute(P,k).applyMatrix4(M);v3.sub(c).multiplyScalar(sc).add(c);bb.p.push(v3.x,v3.y,v3.z);v3.fromBufferAttribute(N,k).applyMatrix3(Nm).normalize();bb.n.push(v3.x,v3.y,v3.z);if(U)bb.u.push(U.getX(k),U.getY(k));else bb.u.push(0,0)}
   rec.ranges.push({key,st,n:P.count});if(gg!==m.geometry)gg.dispose()}
  recs.push(rec);g.remove(v);ugmFree(v)});
 const meshes={};for(const key in B){const bb=B[key],G=new THREE.BufferGeometry();const pa=new THREE.BufferAttribute(new Float32Array(bb.p),3);pa.setUsage(THREE.DynamicDrawUsage);G.setAttribute('position',pa);G.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(bb.n),3));G.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(bb.u),2));G.computeBoundingSphere();
  const me=new THREE.Mesh(G,bb.mat);me.userData.noSeam=true;me.userData.ugVeins=1;g.add(me);meshes[key]={m:me,orig:new Float32Array(bb.p)}}
 lev.veinMesh=meshes;return recs}
/* make a vein's look match its node (shrunk by hits, gone when broken) */
function ugmVeinSync(lev,rec,n){const s=n.g.visible?n.g.scale.x:0;if(s===rec.s)return;rec.s=s;const c=rec.c;
 for(const r of rec.ranges){const mm=lev.veinMesh[r.key];if(!mm)continue;const a=mm.m.geometry.attributes.position,A=a.array,O=mm.orig;for(let k=r.st*3,e=(r.st+r.n)*3;k<e;k+=3){A[k]=c.x+(O[k]-c.x)*s;A[k+1]=c.y+(O[k+1]-c.y)*s;A[k+2]=c.z+(O[k+2]-c.z)*s}
  a.needsUpdate=true}}

/* ---------- the walking grid: what is under every 25 cm square of a level ----------
   0 rock · 1 floor · 2 chasm (you fall) · 3 lava · 4 deep water (no wading) · 5 wading water · 6 ramp (the spiral
   decline: its height comes from the ramp) · 7 something solid · 8 the cage floor (only when the cage is here) · 9 hot crust */
const UGPROF={fa:[[1,0],[.96,-.25],[.9,-.42],[0,-.45]],fb:[[1,0],[.9,-.35],[.62,-.8],[.45,-.9],[0,-.9]],fc:[[1,0],[.95,-.25],[.88,-.42],[0,-.45]],
 isl:[[1,0],[.985,-.1],[.96,-.17],[0,-.2]],cry:[[1,0],[.95,-.2],[.8,-.42],[.5,-.58],[0,-.62]],ter:[[1,0],[.95,-.12],[.8,-.22],[0,-.26]],str:[[1,0],[.85,-.15],[0,-.18]]};
function ugmWaterKind(p,f){const t=p.type,v=p.d.v||0;if(f.deep)return'deep';
 if(t=='flooded')return v==0?UGPROF.fa:v==2?UGPROF.fb:v==3?UGPROF.fc:'deep';if(t=='island'&&v==3)return UGPROF.isl;if(t=='crystal'&&v==1)return UGPROF.cry;return null}
/* the solid things, the hazards and the ways across them, in the piece's own coordinates (as the room checker reads them) */
function ugmInfo(p,lev){const d=p.d,t=p.type,v=d.v||0,sol=[],cross=[],haz=[],T=ugT(p),sw=p.r%2==1;
 const wat=(f,prof,surf)=>{const c=T(f.cx,f.cz);lev.waters.push({cx:c[0],cz:c[1],rx:sw?f.rz:f.rx,rz:sw?f.rx:f.rz,prof,surf})};
 for(const f of d.fx||[]){const k=f.k;
  if(k=='cols')for(const q of f.pts)sol.push([q[0],q[1],(f.r||1)+.25]);
  if(k=='cribs')for(const q of f.pts)sol.push([q[0],q[1],1]);
  if(k=='puff')for(const q of f.pts)sol.push([q[0],q[1],1.9]);
  if(k=='racks')for(const q of f.pts)sol.push([q[0],q[1],.7]);
  if(k=='blk')for(const q of f.pts)sol.push([q[0],q[1],(f.r||.6)+.2]);
  if(k=='desk')sol.push([f.x,f.z,.9]);if(k=='drum')sol.push([f.x,f.z,1.7]);if(k=='gey')sol.push([f.x,f.z,1.05]);if(k=='rubble')sol.push([f.x,f.z,1.15]);
  if(k=='muck')sol.push([f.cx,f.cz,Math.min(f.rx,f.rz)*.9+.2]);
  if(k=='pillar')haz.push((x,z)=>x>f.x0-.3&&x<f.x1+.3&&z>f.z0-.3&&z<f.z1+.3?7:0);
  if(k=='isle')haz.push((x,z)=>((x-f.cx)/(f.rx+.3))**2+((z-f.cz)/(f.rz+.3))**2<1?7:0);
  if(k=='chasm')haz.push((x,z)=>ugmPolyD(x,z,f.pts)<f.w/2?2:0);
  if(k=='lava')haz.push((x,z)=>ugmPolyD(x,z,f.pts)<f.w/2?3:0);
  if(k=='lake')haz.push((x,z)=>(((x-f.cx)/f.rx)**2+((z-f.cz)/f.rz)**2<1&&(f.noisle||Math.hypot(x-f.cx,z-f.cz)>1.1))?3:0);
  if(k=='pit'){const code=t=='dark'?2:7;haz.push((x,z)=>((x-f.cx)/(f.rx+.15))**2+((z-f.cz)/(f.rz+.15))**2<1?code:0)}
  if(k=='moat')haz.push((x,z)=>Math.abs(Math.hypot(x-f.cx,z-f.cz)-f.r)<f.w/2?3:0);
  if(k=='water'){const kd=ugmWaterKind(p,f);if(kd=='deep')haz.push((x,z)=>((x-f.cx)/Math.max(.3,f.rx-.15))**2+((z-f.cz)/Math.max(.3,f.rz-.15))**2<1?4:0);else if(kd){wat(f,kd,0);haz.push((x,z)=>((x-f.cx)/f.rx)**2+((z-f.cz)/f.rz)**2<1?5:0)}}
  if(k=='stream'){const w=(f.w||1.2)/2;if(!f.deep){const a=T(f.pts[0][0],f.pts[0][1]),c=T(f.pts[f.pts.length-1][0],f.pts[f.pts.length-1][1]);lev.streams.push({a,c,w})}haz.push((x,z)=>ugmPolyD(x,z,f.pts)<w?(f.deep?4:5):0)}
  if(k=='terraces'){for(let i=0;i<f.n;i++){const pz=f.cz+f.rz*.7-i*(f.rz*1.4/(f.n-1)),px=(i%2?1:-1)*1.4,q={cx:px,cz:pz,rx:3.6*.99,rz:1.3*.99};wat(q,UGPROF.ter,0);haz.push((x,z)=>((x-q.cx)/q.rx)**2+((z-q.cz)/q.rz)**2<1?5:0)}}
  if(k=='bridge')cross.push((x,z)=>ugSegD(x,z,[f.x0,f.z0],[f.x1,f.z1])<.75);
  if(k=='trestle')cross.push((x,z)=>ugSegD(x,z,[f.x0,f.z0],[f.x1,f.z1])<1.0);
  if(k=='walk'){cross.push((x,z)=>ugmPolyD(x,z,f.pts)<.5);const top=t=='stope'&&v==3?.2:t=='flooded'&&v==0?.33:0;if(top&&f.pts.length==2){const a=T(f.pts[0][0],f.pts[0][1]),c=T(f.pts[1][0],f.pts[1][1]),hw=t=='flooded'?.47:.55;lev.plats.push({x0:Math.min(a[0],c[0])-(Math.abs(a[0]-c[0])<.01?hw:0),x1:Math.max(a[0],c[0])+(Math.abs(a[0]-c[0])<.01?hw:0),z0:Math.min(a[1],c[1])-(Math.abs(a[1]-c[1])<.01?hw:0),z1:Math.max(a[1],c[1])+(Math.abs(a[1]-c[1])<.01?hw:0),top,walk:1})}}
  if(k=='ledge2')cross.push((x,z)=>ugmPolyD(x,z,f.pts)<.45);
  if(k=='stones')for(const q of f.pts)cross.push((x,z)=>Math.hypot(x-q[0],z-q[1])<.6);
  if(k=='isle2')cross.push((x,z)=>Math.hypot(x-f.cx,z-f.cz)<f.r);
  if(k=='ledge'){const a=T(f.x0,f.z0),c=T(f.x1,f.z1),top=t=='stope'?2.42:1.6;lev.plats.push({x0:Math.min(a[0],c[0]),x1:Math.max(a[0],c[0]),z0:Math.min(a[1],c[1]),z1:Math.max(a[1],c[1]),top,ledge:1})}}
 return{sol,cross,haz}}
/* is this spot (piece coordinates) inside the piece's floor? */
function ugmInFloor(p,L,lx,lz,fp){if(p.type=='ladder'){if(p.L==L)return Math.abs(lx)<1.6&&lz<.01&&lz>-6.2;return Math.abs(lx)<1.6&&lz<-1.8&&lz>-8.01}
 for(const s of p.d.shp){if(s.k=='path'){const P=fp&&fp.get(s)||s.pts;if(ugmPolyD(lx,lz,P)<s.w/2-.4)return true}
  else if(s.k=='blob'){const a=s.rx*.92-.3,b=s.rz*.92-.3;if(((lx-s.cx)/a)**2+((lz-s.cz)/b)**2<1)return true}
  else if(s.k=='rect'){if(lx>s.x0+.3&&lx<s.x1-.3&&lz>s.z0+.3&&lz<s.z1-.3)return true}}return false}
/* a piece's footprint in mine coords */
function ugmBox(p){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;const add=(x,z)=>{x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z)};
 if(p.type=='join'){for(const s of p.d.shp)if(s.pts)for(const q of s.pts)add(q[0],q[1]);return[x0-2.5,x1+2.5,z0-2.5,z1+2.5]}
 for(const f of p.d.foot){for(const [a,b] of[[f[0],f[2]],[f[1],f[3]],[f[0],f[3]],[f[1],f[2]]]){const w=ugRot(a,b,p.r);add(p.x+w[0],p.z+w[1])}}
 if(x0>x1)return null;return[x0-2.5,x1+2.5,z0-2.5,z1+2.5]}
function ugmRaster(G,p,L,lev){const t=p.type;if(t=='decline'||t=='old')return;const bb=ugmBox(p);if(!bb)return;const info=ugmInfo(p,lev),N=UGG.N,S=UGG.S,O=UGG.O,ir=(4-p.r)%4;
 /* the dug tunnels are drawn with rounded corners: walk the same rounded line */
 let fp=null;if(t=='join'){fp=new Map();for(const s of p.d.shp)if(s.k=='path')fp.set(s,ugFillet(s.pts.map(q=>[q[0],0,q[1]]),3).map(q=>[q[0],q[2]]))}
 const i0=Math.max(0,Math.floor((bb[0]+O)/S)),i1=Math.min(N-1,Math.ceil((bb[1]+O)/S)),j0=Math.max(0,Math.floor((bb[2]+O)/S)),j1=Math.min(N-1,Math.ceil((bb[3]+O)/S));
 for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const wx=-O+(i+.5)*S,wz=-O+(j+.5)*S,l=ugRot(wx-p.x,wz-p.z,ir),lx=l[0],lz=l[1];if(!ugmInFloor(p,L,lx,lz,fp))continue;
  let c=1;for(const s of info.sol)if((lx-s[0])**2+(lz-s[1])**2<s[2]*s[2]){c=7;break}
  if(c==1){let cr=false;for(const f of info.cross)if(f(lx,lz)){cr=true;break}if(!cr)for(const h of info.haz){const v=h(lx,lz);if(v){c=v;break}}}
  if(p.st&&Math.abs(lx)<1.6&&Math.abs(lz)<1.6)c=(lx<-.15&&Math.abs(lz)<1.0)?8:7;
  if(t=='ladder'&&p.L==L&&lx>-1&&lx<1&&lz>-5.6&&lz<-3.6)c=7;
  const k=j*N+i,cur=G.c[k];if(cur===0||(cur===1&&c!==1)||c===7){G.c[k]=c;G.p[k]=p.id+1}}}
/* the spiral decline: its centre line in mine coords (the kit's own formula), one point every 25 cm */
function ugmRampPts(p){const T=ugT(p),y0=UGLY(p.L),drop=UGLY(p.L)-UGLY(p.L+1);const loc=[[0,0],[0,-8]].concat(ugArc(6,-8,6,Math.PI,4*Math.PI,54).slice(1)).concat([[12,0]]);
 const Ls=[0];for(let i=1;i<loc.length;i++)Ls.push(Ls[i-1]+Math.hypot(loc[i][0]-loc[i-1][0],loc[i][1]-loc[i-1][1]));const tot=Ls[Ls.length-1],out=[];
 for(let i=1;i<loc.length;i++){const a=loc[i-1],b=loc[i],l=Ls[i]-Ls[i-1],n=Math.max(1,Math.ceil(l/.25));for(let k=(i==1?0:1);k<=n;k++){const f=k/n,s=Ls[i-1]+l*f,u=Math.max(0,Math.min(1,(s-1.5)/(tot-3))),w=T(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f);out.push([w[0],y0-drop*u,w[1]])}}
 return out}
function ugmRasterRamp(G,R,pid){const N=UGG.N,S=UGG.S,O=UGG.O,r=1.6;for(const q of R){const i0=Math.max(0,Math.floor((q[0]-r+O)/S)),i1=Math.min(N-1,Math.floor((q[0]+r+O)/S)),j0=Math.max(0,Math.floor((q[2]-r+O)/S)),j1=Math.min(N-1,Math.floor((q[2]+r+O)/S));
 for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const wx=-O+(i+.5)*S,wz=-O+(j+.5)*S;if((wx-q[0])**2+(wz-q[2])**2<r*r){const k=j*N+i;G.c[k]=6;G.p[k]=pid+1}}}}
/* the floor of the ramp at (x, z), on the turn nearest the height you are at */
function ugmRamp(x,z,y){let best=null,bs=1e9;for(const R of UGM.ramps||[])for(const q of R.pts){const dh=(q[0]-x)**2+(q[2]-z)**2;if(dh>5)continue;const s=dh+4*(q[1]-y)**2;if(s<bs){bs=s;best={y:q[1],d:Math.sqrt(dh)}}}return best}
/* wading: the depth under you */
function ugmWade(lev,x,z){for(const w of lev.waters){const r=Math.hypot((x-w.cx)/w.rx,(z-w.cz)/w.rz);if(r<1)return ugProfY(w.prof,r)}for(const s of lev.streams)if(ugSegD(x,z,s.a,s.c)<s.w)return -.18;return 0}

/* ---------- a whole level: build it, then its veins, its walking grid and the things you can press E on ---------- */
function* ugmLevelGen(plan,L){const t0=performance.now();
 const res=yield* ugmBuildGen(plan,L);
 const lev={L,g:res.g,res,props:[],recs:null,grid:null,waters:[],streams:[],plats:[],doors:[],lamps:res.lamps,hot:res.hot,gate:null,veinMesh:null,fx:[],built:0};
 lev.recs=ugmVeins(L,lev,res,plan);yield 1;
 const G={c:new Uint8Array(UGG.N*UGG.N),p:new Uint16Array(UGG.N*UGG.N)};lev.grid=G;let k=0;
 for(const p of plan.P){const here=p.L==L,low=p.d.both&&p.L+1==L;if(!here&&!(low&&p.type=='ladder'))continue;ugmRaster(G,p,L,lev);if(++k%4==0)yield 1}
 for(const R of UGM.ramps)if(R.L==L||R.L+1==L)ugmRasterRamp(G,R.pts,R.pid);
 const N=UGG.N,S=UGG.S,O=UGG.O,disc=(x,z,r,f)=>{const i0=Math.max(0,Math.floor((x-r+O)/S)),i1=Math.min(N-1,Math.floor((x+r+O)/S)),j0=Math.max(0,Math.floor((z-r+O)/S)),j1=Math.min(N-1,Math.floor((z+r+O)/S));for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const wx=-O+(i+.5)*S,wz=-O+(j+.5)*S;if((wx-x)**2+(wz-z)**2<r*r)f(j*N+i)}};
 for(const s of res.solids)disc(s.x,s.z,s.r+.25,i=>{if(G.c[i]&&G.c[i]!==6)G.c[i]=7});
 for(const h of res.hot)disc(h.x,h.z,h.r,i=>{if(G.c[i]===1)G.c[i]=9});
 /* working faces close the tunnel ends: no walking into the rock beyond them (the old shaft lets you up to its door) */
 for(const o of plan.open)if(o.L==L&&(o.cap||o.old!=null)){const v=ugRot(0,-1,o.dir),lim=o.old!=null?2.2:.6;disc(o.x,o.z,6,i=>{const wx=-O+(i%N+.5)*S,wz=-O+((i/N|0)+.5)*S,rx=wx-o.x,rz=wz-o.z,al=rx*v[0]+rz*v[1],lat=Math.abs(rx*v[1]-rz*v[0]);if(al>lim&&lat<3.2&&G.c[i]!==6)G.c[i]=0})}
 yield 1;
 ugmGate(L,lev);ugmMovers(L,lev,plan);ugmProps(L,lev,plan);
 res.g.visible=false;if(MN.g)MN.g.add(res.g);lev.built=1;UGM.L[L]=lev;
 if(UGM.fall&&UGM.fall.L===L&&UGM.fall.hap&&!UGM.fall.g)ugmFallMake(UGM.fall,false);
 UGM.stats.levels++;return lev}
/* the landing gate on the -x side of the shaft: its grille slides up when the cage is at this level */
function ugmGate(L,lev){const K=ugmKit(),g=new THREE.Group();g.userData.dpKeep=1;for(const b of lev.res.gateBars||[]){const m=new THREE.Mesh(new THREE.BoxGeometry(b[0],b[1],b[2]),K.mat.steel);m.position.set(b[3]+.08,b[4],b[5]);m.userData.noSeam=true;g.add(m)}lev.g.add(g);lev.gate=g}
/* the raft, the zip line handle, the sealed station's doors; the dynamite crate and the other things you can take */
function ugmMovers(L,lev,plan){for(const m of lev.res.moving){const u=m.userData;m.userData.dpKeep=1;
  if(u.raft){const a=u.raft.a,c=u.raft.c,dx=c[0]-a[0],dz=c[2]-a[2],l=Math.hypot(dx,dz)||1;const s=((m.position.x-a[0])*dx+(m.position.z-a[2])*dz)/(l*l);UGM.raft={g:m,a,c,l,ux:dx/l,uz:dz/l,s,s0:Math.max(.1,Math.min(.5,s)),s1:.9,y:m.position.y,L,dir:1,net:0};}
  if(u.zip){const P3=u.zip;let l=0;for(let i=1;i<P3.length;i++)l+=Math.hypot(P3[i][0]-P3[i-1][0],P3[i][1]-P3[i-1][1],P3[i][2]-P3[i-1][2]);UGM.zip={g:m,P:P3,l,t:0,st:'home',L,p0:m.position.clone(),q0:m.quaternion.clone()}}
  if(u.ugDoor){const yaw=m.rotation.y,dw=.75,cx=m.position.x+Math.cos(yaw)*dw,cz=m.position.z-Math.sin(yaw)*dw;lev.doors.push({g:m,cx,cz,nx:Math.sin(yaw),nz:Math.cos(yaw),tx:Math.cos(yaw),tz:-Math.sin(yaw),open:0,a:0,to:u.ugDoor.open,i:lev.doors.length})}}}
function ugmTake(L,i){return UGM.taken.has(L+':'+i)}
function ugmNet(o){try{const q=BUS.ride;if(q)xmNet(q,'ugx',Object.assign({sd:MN.seed},o))}catch(e){}}
function ugmProps(L,lev,plan){const q=BUS.ride,PL=lev.props,Y=UGL[0].y,K=ugmKit();
 const add=(x,z,r,txt,act)=>{const o={x:MN.ox+x,z:MN.oz+z,r,deep:1,mn:1,ugL:L,txt,act};PL.push(o);return o};
 /* the cage (and the minecart in it) */
 add(-1.2,0,2.2,()=>ugmCageTxt(q,L),()=>ugmCageAct(q,L));
 /* the veins */
 lev.recs.forEach((rec,i)=>{const n={t:rec.t,x:MN.ox+rec.c.x+rec.dx*.65,z:MN.oz+rec.c.z+rec.dz*.65,hp:3,gone:0,g:new THREE.Object3D(),L,rec,ugi:MN.nodes.length};n.g.position.set(MN.ox+rec.c.x,Y+rec.c.y,MN.oz+rec.c.z);
  if(rec.big){n.big=1;n.bhp=8}const yr=rec.c.y-UGLY(L);if(yr>2.7)n.need=yr-2.3;const p=plan.P[rec.pid];if(p&&p.type=='dark')n.dark=1;
  if(L>0){const h=ugHash((plan.seed|0)^0x9a5,n.ugi,7);if(h<.04)n.gas=1}
  if(rec.t=='ur')n.ur=1;MN.nodes.push(n);if(UGM.gone.has(n.ugi)){n.gone=1;n.g.visible=false}
  add(n.x-MN.ox,n.z-MN.oz,1.4,()=>{if(q.deep!==5||n.gone)return'';const nm=ORE[n.t]?ORE[n.t].nm:'ore';if(n.big&&UGM.dyn>0)return'[E] 🧨 Set a stick of dynamite on the big '+nm+' seam';return'[E] ⛏️ Swing at the '+(n.big?'BIG '+nm.toUpperCase()+' SEAM':nm+' vein')},()=>{if(n.big&&UGM.dyn>0&&!n.gone){ugmCharge(q,{kind:'seam',n});return}mnHit(q,n)})});
 /* things to take */
 lev.res.pickups.forEach((g0,i)=>{const kind=g0.userData.pick,key=L+':'+i,pz=g0.position;g0.userData.dpKeep=1;if(ugmTake(L,i)&&kind!='lunchbox'&&kind!='dynamite crate')g0.visible=false;
  if(kind=='lunchbox')add(pz.x,pz.z,1.5,()=>ugmTake(L,i)?'🥪 An empty lunchbox.':'[E] 🥪 Open the old lunchbox',()=>ugmLunch(q,L,i,g0));
  else if(kind=='tag')add(pz.x,pz.z,1.4,()=>g0.visible?'[E] 🏷️ Take brass tag 17 · HARLAN':'',()=>{if(!g0.visible)return;g0.visible=false;UGM.taken.add(key);ugmNet({k:'take',key});const S=qtS();S.tags=(S.tags|0)+1;try{saveGame()}catch(e){}snd(1300,.05);hint('🏷️ Brass tag 17. HARLAN, stamped deep. The board has a hook for it... Tags you have found: '+S.tags+'.')});
  else if(kind=='fossil')add(pz.x,pz.z,1.4,()=>g0.visible?'[E] 🦴 Take the '+(g0.userData.fossil||'ammonite')+' fossil':'',()=>{if(!g0.visible)return;g0.visible=false;UGM.taken.add(key);ugmNet({k:'take',key});const S=qtS();S.fos=(S.fos|0)+1;try{saveGame()}catch(e){}snd(700,.06);hint('🦴 A fossil '+(g0.userData.fossil||'ammonite')+'! You carry '+S.fos+'. The ASSAY OFFICE in the quarry pays 60 gold each.')});
  else if(kind=='dynamite crate'){const p=plan.P[g0.userData.pid];lev.crate={g:g0,n:p&&p.d.v==2?1:9,key};if(p&&p.d.v==2)ugmCrateSet(lev,1);if(UGM.crateN!=null)ugmCrateSet(lev,UGM.crateN);
   add(pz.x,pz.z,1.5,()=>{const c=lev.crate;if(!c.n)return UGM.dyn?'🧨 The crate is empty. You carry '+UGM.dyn+' sticks.':'🧨 The crate is empty.';if(UGM.dyn>=3)return'🧨 You carry 3 sticks: that is all you can take.';return'[E] 🧨 Take a stick of dynamite ('+UGM.dyn+'/3 carried · '+c.n+' in the crate)'},()=>{const c=lev.crate;if(!c.n||UGM.dyn>=3)return;UGM.dyn++;ugmCrateSet(lev,c.n-1);ugmNet({k:'crate',n:c.n});snd(500,.05);hint(UGM.dyn==1?'🧨 A stick of dynamite. E on rubble or a BIG SEAM to set it: a 4 second fuse, then RUN (4 m). The clock loses 20 seconds for every blast.':'🧨 '+UGM.dyn+' sticks.')})}});
 /* the rooms' own things, from the plan */
 for(const p of plan.P){const here=p.L==L;if(!here)continue;const T=ugT(p),v=p.d.v||0,t=p.type,fx=k=>p.d.fx.filter(f=>f.k==k),blk=n=>{const o=[];for(const f of p.d.fx)if(f.k=='blk'&&f.n==n)for(const q of f.pts)o.push(T(q[0],q[1]));return o};
  if(t=='crib'&&v==2)for(const w of blk('safe'))add(w[0],w[1],1.5,()=>UGM.safe?'🗄️ The foreman\'s safe stands open, empty.':'[E] 🗄️ Open the foreman\'s safe',()=>{if(UGM.safe)return;UGM.safe=1;ugmNet({k:'safe'});const g2=40+(ugHash(plan.seed|0,p.id,3)*41|0);gold+=g2;try{saveGame();updHud()}catch(e){}snd(900,.1);setTimeout(()=>snd(1300,.12),140);hint('🗄️ The combination is written inside the desk drawer, of course. '+g2+' gold: a shift bonus nobody collected.')});
  if(t=='crib'&&v==2)for(const f of fx('desk'))add(T(f.x,f.z)[0],T(f.x,f.z)[1],1.4,()=>'[E] 📖 Read the foreman\'s logbook',()=>{const i=(plan.seed|0)%UGNOTES.length;milDlg(q,'📖 THE FOREMAN\'S LOGBOOK','<p><i>'+UGNOTES[(i+5)%UGNOTES.length]+'</i></p><p><i>'+UGNOTES[(i+11)%UGNOTES.length]+'</i></p>',[['ok','Close']],()=>true)});
  if(t=='crib'&&v==3)for(const w of blk('cabinet'))add(w[0],w[1],1.5,()=>UGM.aid?'⛑️ You carry the first-aid kit: your next fall, gas or burn costs you nothing.':UGM.aidUsed?'⛑️ The cabinet is empty.':'[E] ⛑️ Take the first-aid kit',()=>{if(UGM.aid||UGM.aidUsed)return;UGM.aid=1;UGM.aidUsed=1;snd(800,.06);hint('⛑️ A first-aid kit. Your next fall, gas or burn costs you nothing.')});
  if(t=='magazine'&&v==1)for(const w of blk('plunger'))add(w[0],w[1],1.5,()=>UGM.charges.some(c=>c.mine)?'[E] 🧨 Push the PLUNGER: everything you set goes off NOW':'🧨 The plunger box. Set a charge, then push the plunger: no fuse wait.',()=>{let n=0;for(const c of UGM.charges)if(c.mine){c.t=Math.max(c.t,3.95);n++}if(n){snd(200,.2);hint('🧨 CLEAR THE AREA!')}});
  if(t=='collapsed'&&v==1)for(const w of blk('cart'))add(w[0],w[1],1.6,()=>UGM.cart>=6?'🛒 The buried cart, dug out and empty.':'[E] ⛏️ Dig out the buried cart ('+(UGM.cart|0)+'/6)',()=>{if((UGM.cart|0)>=6||MN.hitT>performance.now())return;MN.hitT=performance.now()+600;UGM.cart=(UGM.cart|0)+1;snd(160,.08);try{vfx('dust',MN.ox+w[0],ugmY(L)+.6,MN.oz+w[1]+q.OZ,{n:6,w:1})}catch(e){}
   if(UGM.cart>=6){const R=ugRng((plan.seed|0)+p.id*5);let got=0;for(let i=0;i<8&&mnCnt(MN.carry)<qtCap();i++){const k=ugmPick(R,UGORE[0]);MN.carry[k]=(MN.carry[k]|0)+1;got++}snd(900,.1);hint('🛒 The cart comes free: '+got+' ore spills into your bag'+(mnCnt(MN.carry)>=qtCap()?' (it is full)':'')+'.')}});
  if(t=='pump'&&v==3)for(const w of blk('compressor')){lev.fx.push({k:'comp',x:w[0],z:w[1]});add(w[0],w[1],1.9,()=>UGM.comp?'[E] 💨 Switch the compressor OFF':'[E] 💨 Switch the compressor back ON',()=>{UGM.comp=UGM.comp?0:1;snd(UGM.comp?160:90,.3);hint(UGM.comp?'💨 It thumps back into life.':'💨 Silence. Drips... a creak far off... something settling. The mine is listening too.')})}
  if(t=='hall'&&v==4)for(const w of blk('bell post'))add(w[0],w[1],1.5,()=>'[E] 🔔 Ring the bell',()=>{const f=[880,660,520];snd(880,.5);for(let i=1;i<4;i++)setTimeout(()=>snd(880,.35/i),i*380);hint('🔔 Dong... dong... dong... dong.')});
  if(t=='fungus'&&v==1)for(const f of fx('puff'))for(const q2 of f.pts){const w=T(q2[0],q2[1]);add(w[0],w[1],2.6,()=>'[E] 🍄 Hit the puffball',()=>{ugmCloud(L,w[0],UGLY(L),w[1],'spore');snd(120,.2);hint('🍄 POOF. A cloud of glowing spores. Harmless, they say.')})}
  if(t=='station'&&L==1&&v==2)for(const w of blk('refuge chamber')){lev.refuge={x:w[0],z:w[1]};add(w[0],w[1],2.6,()=>'🚪 The REFUGE CHAMBER: air bottles and a steel door. Gas cannot reach you here.',()=>{})}
  if(t=='hotseam'&&v==2)for(const w of blk('core box')){const key='core'+p.id+'_'+w[0].toFixed(1);add(w[0],w[1],1.5,()=>UGM.taken.has(key)?'☢️ An empty core box.':'[E] ☢️ Take a glowing drill core',()=>{if(UGM.taken.has(key)||mnCnt(MN.carry)>=qtCap())return;UGM.taken.add(key);MN.carry.ur=(MN.carry.ur|0)+1;snd(2400,.03);hint('☢️ A drill core of uranium ore. Clicks like a cricket.')})}
  if(t=='orepass')for(const f of fx('grate')){const w=T(f.x,f.z);add(w[0],w[1],1.9,()=>mnCnt(MN.carry)?(v==2?'[E] ⬇️ Fill the skip and push it over: '+mnCnt(MN.carry)+' ore down the chute to the cage\'s minecart':'[E] ⬇️ Drop your '+mnCnt(MN.carry)+' ore down the chute (it lands in the cage\'s minecart)'):'⬇️ The ore pass: anything you drop down here lands in the minecart in the cage.',()=>{const n=mnCnt(MN.carry);if(!n)return;for(const k in MN.carry)MN.cart[k]=(MN.cart[k]|0)+MN.carry[k];MN.carry={};try{MN.cartM.ore.visible=true;MN.cartM.ore.scale.setScalar(.8+Math.min(1.6,mnCnt(MN.cart)*.05))}catch(e){}if(MN.job)MN.job.dep=mnCnt(MN.cart);snd(140,.4);setTimeout(()=>snd(90,.3),400);hint('⬇️ Rumble... clatter... '+n+' ore goes down the chute into the minecart ('+mnCnt(MN.cart)+' in the cart).')})}
  if(t=='magma')for(const f of fx('gey'))lev.fx.push({k:'gey',x:T(f.x,f.z)[0],z:T(f.x,f.z)[1],ph:ugHash(p.id,f.x*10|0,1)*7});
  if(t=='basalt'&&v==1){const s=ugWorld(p).shp.find(q2=>q2.k=='path');if(s)lev.fx.push({k:'vent',pts:s.pts})}
  if(t=='old'&&lev.res.portal){const po=lev.res.portal,fx2=-Math.sin(po.yaw),fz2=-Math.cos(po.yaw),px=po.x+fx2*1.2,pz=po.z+fz2*1.2;MN.dme={x:MN.ox+px,z:MN.oz+pz};
   add(px,pz,1.8,()=>{if(q.deep!==5)return'';if(MP.on&&mpOpen().length){const n=dmeHere(q),need=mpOpen().length;if(!MP.host)return'⛏️ An old shaft down to the DESERT MINES (door 60). The host leads the way down. ('+n+'/'+need+' others here)';return n<need?'⛏️ The DESERT MINES shaft (door 60). Waiting for everyone: '+n+'/'+need+' here':'[E] ⬇️ Everyone is here: go down to the DESERT MINES, door 60'}return'[E] ⬇️ Open door 60: the old shaft down to the DESERT MINES'},()=>dmeGo(q))}}
 /* the ladderways: climb down at the hatch, up from the landing below */
 for(const p of plan.P){if(p.type!='ladder')continue;const T=ugT(p);if(p.L==L){const w=T(-1.25,-4.6);add(w[0],w[1],1.4,()=>'[E] 🪜 Climb down the ladder (level '+(L+2)+')',()=>ugmClimb(q,p,-1))}
  if(p.L+1==L){const w=T(0,-4.6);add(w[0],w[1],1.4,()=>'[E] 🪜 Climb up the ladder (level '+(L)+')',()=>ugmClimb(q,p,1))}}
 /* the stope's ledge ladder */
 for(const p of plan.P){if(p.L!=L||p.type!='stope'||(p.d.v||0)!=1)continue;const T=ugT(p),ld=p.d.fx.find(f=>f.k=='ladder2'),lg=p.d.fx.find(f=>f.k=='ledge');if(!ld||!lg)continue;const w=T(ld.x,ld.z),edge=Math.abs(lg.x0-ld.x)<Math.abs(lg.x1-ld.x)?lg.x0:lg.x1,inw=edge==lg.x0?.7:-.7,top=T(edge+inw,ld.z);
  add(w[0],w[1],1.6,()=>MNJ.h>1.8?'[E] 🪜 Climb back down the ladder':'[E] 🪜 Climb the ladder up to the ledge',()=>{if(MNJ.h>1.8){P.x=MN.ox+w[0];P.z=MN.oz+w[1]+q.OZ;MNJ.h=0;MNJ.vy=0;MNJ.g=1}else{P.x=MN.ox+top[0];P.z=MN.oz+top[1]+q.OZ;MNJ.h=2.42;MNJ.vy=0;MNJ.g=1;hint('🧗 Up on the ledge. The rich veins are on the wall above it.')}snd(300,.05)})}
 /* the raft and the zip line */
 if(UGM.raft&&UGM.raft.L===L){const RF=UGM.raft;RF.prop=add(0,0,2.6,()=>ugmRaftTxt(q),()=>ugmRaftAct(q));ugmRaftPlace();
  /* at each end of the rope you can haul the raft over to your side */
  for(const [e,sv] of[[RF.a,RF.s0],[RF.c,RF.s1]]){const near=()=>Math.abs(RF.s-sv)<.06;add(e[0],e[2],1.7,()=>near()||UGM.onRaft?ugmRaftTxt(q):'[E] 🛶 Haul the raft over to this side',()=>{if(near()||UGM.onRaft){ugmRaftAct(q);return}RF.haul=sv;snd(150,.2)})}}
 if(UGM.zip&&UGM.zip.L===L){const Z=UGM.zip,a=Z.P[0];Z.prop=add(a[0],a[2],1.8,()=>Z.st=='home'?'[E] 🪝 Grab the zip line handle and slide across':'🪝 The zip line handle is on the far side. It slides back by itself in a moment.',()=>ugmZipGo(q))}
 /* the sealed station's bulkhead wheels */
 for(const d of lev.doors)add(d.cx-d.nx*.6,d.cz-d.nz*.6,1.6,()=>d.open?'':'[E] 🔴 Turn the wheel: open the bulkhead door',()=>{if(d.open)return;d.open=1;UGM.doorsOpen.add(L+':'+d.i);ugmNet({k:'door',L,i:d.i});snd(120,.5);setTimeout(()=>snd(90,.4),300);hint('🔴 The wheel squeals round. The steel door swings open.')});
 /* the rockfall's two ends */
 if(UGM.fall&&UGM.fall.L===L)ugmFallProps(lev)}
function ugmCrateSet(lev,n){const c=lev.crate;if(!c)return;n=Math.max(0,n|0);if(n===c.n&&c.g.userData.n===n)return;const o=c.g,nw=ugDynCrate(n);nw.position.copy(o.position);nw.quaternion.copy(o.quaternion);nw.userData=Object.assign({},o.userData,{n});if(o.parent){o.parent.add(nw);o.parent.remove(o)}ugmFree(o);c.g=nw;c.n=n;UGM.crateN=n}

/* ---------- the cage: it stops at level 1, and lower once the shaft is sunk ---------- */
function ugmCageHere(L){return L<=qtL('sink')}
function ugmCageTxt(q,L){if(MN.ride||q.deep!==5)return'';if(!ugmCageHere(L))return'🛗 The cage does not stop on level '+(L+1)+'. SHAFT SINKING (Quarry Tycoon computer) opens this gate. Take the way up.';
 if(mnCnt(MN.carry))return'[E] 🛒 Dump your ore into the minecart ('+mnCnt(MN.carry)+' carried · cart '+mnCnt(MN.cart)+')';
 return qtL('sink')?'[E] 🛗 The cage panel: up to the quarry, or another level (cart: '+mnCnt(MN.cart)+' ore)':'[E] ⬆️ Ride the cage back up to the quarry (cart: '+mnCnt(MN.cart)+' ore)'}
function ugmCageAct(q,L){if(!ugmCageHere(L)||MN.ride)return;if(mnCnt(MN.carry)){mnDump(q);return}if(qtL('sink'))ugmCageDlg(q);else mnRide(q,1,-1)}
function ugmCageDlg(q){const open=1+qtL('sink'),deep=q.deep===5,B=[];if(deep)B.push(['up','⬆️ <b>UP TO THE QUARRY</b><br><span style="font-weight:normal;font-size:12.5px">The cart rides up with you ('+mnCnt(MN.cart)+' ore)</span>',false]);
 for(let i=0;i<3;i++){if(deep&&i===UGM.lv)continue;const ok=i<open;B.push(['L'+i,(ok?'🛗 ':'🔒 ')+'<b>LEVEL '+(i+1)+' · '+UGL[i].nm.toUpperCase()+'</b>'+(ok?'':'<br><span style="font-weight:normal;font-size:12.5px">SHAFT SINKING NEEDED (Quarry Tycoon computer)</span>'),!ok])}
 milDlg(q,'🛗 THE CAGE','<p>The deeper, the richer: level 1 copper and iron, level 2 silver, gold and crystal, level 3 gold, crystal, diamond and uranium.</p>',B,b=>{setTimeout(()=>{if(b=='up')mnRide(q,1,-1);else mnRide(q,deep?(+b.slice(1)>UGM.lv?-1:1):-1,+b.slice(1))},0);return true})}
function ugmCageY(L){return L<0?QD.F:ugmY(L)}
/* the panel in the cage: a lamp and a button for each level */
function ugmPanelSet(){try{const pn=UGM.panel;if(!pn)return;const o=1+qtL('sink'),h=MN.ride?0:(UGM.cageL>=0?UGM.cageL+1:0),k=o*10+h;if(pn.userData.k===k)return;pn.userData.k=k;pn.userData.set(o,h)}catch(e){}}

/* ---------- making the mine: the plan first (cheap), the levels while the cage goes down ---------- */
function ugmReset(q,keep){const G=MN.g;if(G&&G.parent)G.parent.remove(G);for(const lev of UGM.L)if(lev&&lev.g)ugmFree(lev.g);for(const c of UGM.gas.concat(UGM.fxs))if(c.g)ugmFree(c.g);
 UGM.L=[null,null,null];UGM.job=null;UGM.plan=null;UGM.ramps=[];UGM.fall=null;UGM.gas=[];UGM.fxs=[];UGM.charges=[];UGM.raft=null;UGM.onRaft=0;UGM.zip=null;UGM.riding=null;UGM.climb=null;UGM.taken=new Set();UGM.doorsOpen=new Set();UGM.crateN=null;UGM.safe=0;UGM.cart=0;UGM.aidUsed=0;UGM.comp=1;UGM.hinted=new Set();UGM.seen=[new Set(),new Set(),new Set()];UGM.breath=1;
 if(!keep)UGM.gone=new Set();MN.nodes=[];MN.obst=[];MN.deco=[];MN.plat=[];MN.pits=[1];MN.ur=[];MN.dme=null;MN.rooms=[];MN.bio=null;
 if(q)for(let i=q.props.length-1;i>=0;i--)if(q.props[i].mn&&q.props[i].ugL!=null)q.props.splice(i,1);
 if(MN.g===G)MN.g=null;ugmUI(0,0)}
function ugmEnsure(q){if(UGM.plan||!MN.seed)return;const t0=performance.now();UGM.plan=ugGen(MN.seed>>>0,{old:!!window.DME_FORCE});const plan=UGM.plan;
 UGM.ramps=plan.P.filter(p=>p.type=='decline').map(p=>({L:p.L,pid:p.id,pts:ugmRampPts(p)}));
 const g=new THREE.Group();g.name='ugMine';g.position.set(MN.ox,UGL[0].y,MN.oz);g.visible=false;q.g.add(g);MN.g=g;
 /* the rockfall: on the level of the plan's pick, at the shift file's spot for that level */
 try{if(plan.fall){const L=plan.P[plan.fall.id].L,sp=ugRockfallSpot(plan,L,plan.seed);if(sp)UGM.fall={L,t:plan.fall.t,sp,k:0,hap:0,g:null,gone:0}}}catch(e){conLog('error','rockfall spot: '+e.message)}
 UGM.queue=[0,1,2];UGM.job=null;UGM.stats.plan=performance.now()-t0}
function ugmBuildTick(budget){const t0=performance.now();while(performance.now()-t0<budget){if(!UGM.job){if(!UGM.queue||!UGM.queue.length||!UGM.plan)return;const L=UGM.queue.shift();UGM.job={L,it:ugmLevelGen(UGM.plan,L),t:0}}
  const j=UGM.job,t1=performance.now();let r;try{r=j.it.next()}catch(e){conLog('error','mine level '+(j.L+1)+': '+e.message);UGM.job=null;continue}j.t+=performance.now()-t1;
  if(r.done){UGM.stats['L'+j.L]=Math.round(j.t);UGM.job=null;const q=BUS.ride;if(q&&q.deep===5&&j.L===UGM.lv)ugmSetLevel(q,UGM.lv,1)}}}
function ugmReady(L){const l=UGM.L[L];return!!(l&&l.built)}

/* ---------- which level you are on: its things to press E on, its pits and veins ---------- */
function ugmSetLevel(q,L,force){if(L===UGM.lv&&!force)return;const was=UGM.lv;UGM.lv=L;
 for(let i=q.props.length-1;i>=0;i--)if(q.props[i].mn&&q.props[i].ugL!=null)q.props.splice(i,1);
 const lev=UGM.L[L];if(lev)for(const o of lev.props)q.props.push(o);
 MN.ur=MN.nodes.filter(n=>n.L===L&&n.ur);
 if(was!==L&&q.deep===5&&!MN.ride)hint(['⛏️','💎','🌋'][L]+' LEVEL '+(L+1)+' · '+UGL[L].nm.toUpperCase()+(L==0?': copper and iron, some silver.':L==1?': silver, gold and crystal. Mind the gas.':': gold, crystal, diamond and uranium. Hot.'))}

/* ---------- the rockfall ---------- */
function ugmFallMake(F,loud){const lev=UGM.L[F.L];if(!lev||F.g)return;const sp=F.sp,g=ugRockfall(sp.w,sp.h,sp.len,(MN.seed|0)+7,F.L);g.position.set(sp.x,UGLY(F.L),sp.z);g.rotation.y=sp.yaw;g.userData.dpKeep=1;g.traverse(o=>{if(o.isMesh)o.userData.noSeam=true});
 g.userData.stage(Math.min(8,F.k));lev.g.add(g);F.g=g;F.ax=Math.sin(sp.yaw);F.az=Math.cos(sp.yaw);if(F.gone)g.visible=false;
 if(loud){const d=ugDust((MN.seed|0)+3);d.position.copy(g.position);d.userData.dpKeep=1;lev.g.add(d);UGM.fxs.push({g:d,t:0,L:F.L})}
 if(!lev.fallProps)ugmFallProps(lev)}
function ugmFallProps(lev){const F=UGM.fall;if(!F||!F.g||lev.fallProps)return;lev.fallProps=1;const q=BUS.ride,sp=F.sp;
 for(const sd of[-1,1]){const x=sp.x+F.ax*sd*(sp.len/2+.8),z=sp.z+F.az*sd*(sp.len/2+.8),o={x:MN.ox+x,z:MN.oz+z,r:1.7,deep:1,mn:1,ugL:F.L,
  txt:()=>F.gone||F.k>=8?'':UGM.dyn>0?'[E] 🧨 Set a stick of dynamite on the rubble':'[E] ⛏️ Dig through the rubble ('+F.k+'/8) · or go round the other way',
  act:()=>{if(F.gone||F.k>=8)return;if(UGM.dyn>0){ugmCharge(q,{kind:'rub',sd});return}if(MN.hitT>performance.now())return;MN.hitT=performance.now()+650;F.k++;F.g.userData.stage(F.k);ugmNet({k:'dig',n:F.k});snd(170,.08);setTimeout(()=>snd(1100+Math.random()*500,.03),60);try{vfx('dust',MN.ox+x,ugmY(F.L)+1,MN.oz+z+q.OZ,{n:6,w:1});camShake(.06,.1)}catch(e){}if(F.k>=8)hint('⛏️ Through! A gap just wide enough to squeeze past.')}};
  lev.props.push(o);if(UGM.lv===F.L&&q&&q.deep===5)q.props.push(o)}}
function ugmFallTick(q){const F=UGM.fall;if(!F||F.hap||MN.st!='open'||MN.t<F.t)return;F.hap=1;const lev=UGM.L[F.L];if(lev)ugmFallMake(F,true);
 if(q.deep===5){hint('🪨 A ROCKFALL on level '+(F.L+1)+'! A passage by '+(UGM.plan.P[F.sp.piece]&&UGM.plan.P[F.sp.piece].type=='round'?'a pillar':'a rock island')+' has caved in: dig through (8 swings) or go round.');snd(45,1.4);snd(70,.8);camShake(F.L===UGM.lv?.7:.25,1.2)}}
function ugmRubble(x,z){const F=UGM.fall;if(!F||!F.g||F.gone||F.L!==UGM.lv)return false;const rx=x-F.sp.x,rz=z-F.sp.z,al=rx*F.ax+rz*F.az,lat=rx*F.az-rz*F.ax;
 if(Math.abs(lat)<F.sp.w/2+.2&&Math.abs(al)<F.sp.len/2+.4)return!(F.k>=8&&Math.abs(lat)<.6);return false}

/* ---------- dynamite: set a charge, a 4 s fuse (or the plunger), the blast ---------- */
function ugmCharge(q,o){if(UGM.dyn<=0)return;const L=UGM.lv,lev=UGM.L[L];if(!lev)return;const g=ugCharge();g.userData.dpKeep=1;let x,y,z,yaw;
 if(o.kind=='seam'){const r=o.n.rec;x=r.c.x+r.dx*.14;y=r.c.y;z=r.c.z+r.dz*.14;yaw=Math.atan2(-r.dx,-r.dz)}
 else{const F=UGM.fall,sp=F.sp;x=sp.x+F.ax*o.sd*(sp.len/2-.1);z=sp.z+F.az*o.sd*(sp.len/2-.1);y=UGLY(L)+1.0;yaw=Math.atan2(-F.ax*o.sd,-F.az*o.sd)}
 g.position.set(x,y,z);g.rotation.y=yaw;lev.g.add(g);UGM.dyn--;UGM.charges.push({g,t:0,L,x,y,z,kind:o.kind,n:o.n,mine:1});snd(300,.1);
 hint('🧨 Fuse lit! FOUR SECONDS: get back at least 4 m!'+(UGM.dyn?' ('+UGM.dyn+' sticks left)':''))}
function ugmBlast(q,L,x,y,z,mine,kind,n){const lev=UGM.L[L];if(lev){const b=ugBlast();b.position.set(x,y-.6,z);b.userData.dpKeep=1;lev.g.add(b);UGM.fxs.push({g:b,t:0,L,blast:1});const d=ugDust((MN.seed|0)+(x*7|0));d.position.set(x,UGLY(L),z);lev.g.add(d);UGM.fxs.push({g:d,t:0,L})}
 snd(40,1.2);snd(70,.7);snd(110,.4);MN.t+=20;
 if(kind=='rub'&&UGM.fall){UGM.fall.gone=1;if(UGM.fall.g)UGM.fall.g.visible=false}
 if(q.deep===5&&L===UGM.lv&&!MN.ride){const px=P.x-MN.ox,pz=P.z-q.OZ-MN.oz,py=(P.dy||0)-UGL[0].y+1,d=Math.hypot(px-x,pz-z,py-y);camShake(d<10?1:.3,1);
  if(d<4){const n2=mnCnt(MN.carry);let lost=0;if(UGM.aid){UGM.aid=0;hint('💥 The blast throws you flat! The first-aid kit patches you up; you keep your ore.')}else{for(const k in MN.carry){const h=Math.ceil((MN.carry[k]|0)/2);lost+=h;MN.carry[k]-=h;if(MN.carry[k]<=0)delete MN.carry[k]}hint('💥 The blast throws you flat!'+(lost?' '+lost+' ore spills out of your bag and is lost in the rubble.':''))}
   try{bsF.style.transition='opacity .1s';bsF.style.background='#fff';bsF.style.opacity=.8;setTimeout(()=>{bsF.style.transition='opacity 1.2s';bsF.style.opacity=0;setTimeout(()=>{bsF.style.background='#000'},1300)},120)}catch(e){}}
  else hint(kind=='rub'?'💥 BOOM! The rubble is blown clear. (The clock lost 20 seconds.)':'💥 BOOM! (The clock lost 20 seconds.)')}}
function ugmChargeTick(q,dt){for(let i=UGM.charges.length-1;i>=0;i--){const c=UGM.charges[i];c.t+=dt;if(c.g.userData.tick(c.t))continue;UGM.charges.splice(i,1);if(c.g.parent)c.g.parent.remove(c.g);ugmFree(c.g);
  ugmBlast(q,c.L,c.x,c.y,c.z,true,c.kind,c.n);ugmNet({k:'blast',L:c.L,x:+c.x.toFixed(2),y:+c.y.toFixed(2),z:+c.z.toFixed(2),kind:c.kind});
  if(c.kind=='seam'&&c.n&&!c.n.gone){const n=c.n;n.gone=1;n.g.visible=false;try{xmNet(q,'mnh',{sd:MN.seed,i:n.ugi})}catch(e){}ugmVeinBroke(q,n,true);const t=n.t;let got=0;for(let k=0;k<7&&mnCnt(MN.carry)<qtCap();k++){MN.carry[t]=(MN.carry[t]|0)+1;got++}
   if(got)setTimeout(()=>hint('💎 The whole seam comes down: '+got+' '+(ORE[t]?ORE[t].nm:'')+' ore in your bag'+(mnCnt(MN.carry)>=qtCap()?' (full)':'')+'.'),900)}}
 for(let i=UGM.fxs.length-1;i>=0;i--){const f=UGM.fxs[i];f.t+=dt;let on=true;try{on=f.g.userData.tick(f.t)}catch(e){on=false}if(!on){UGM.fxs.splice(i,1);if(f.g.parent)f.g.parent.remove(f.g);f.g.traverse(o=>{if(o.material&&o.material.userData&&o.material.userData.ug)o.material.userData.ugOwn=1});ugmFree(f.g)}}}

/* ---------- gas and spores ---------- */
function ugmCloud(L,x,y,z,kind){const lev=UGM.L[L];if(!lev)return;const g=ugGasCloud(((MN.seed|0)+(x*13|0)+(z*7|0))>>>0);g.position.set(x,y,z);g.userData.dpKeep=1;
 if(kind=='spore')g.traverse(o=>{if(o.material&&!o.material.userData.sp){o.material.color.setHex(0x80ffd0);o.material.blending=THREE.AdditiveBlending;o.material.userData.sp=1}});
 lev.g.add(g);UGM.gas.push({g,t:0,life:kind=='spore'?40:25,L,x,y,z,kind})}
function ugmVeinBroke(q,n,local){if(n.gas){const r=n.rec;ugmCloud(n.L,r.c.x+r.dx*1.6,UGLY(n.L),r.c.z+r.dz*1.6,'gas');if(q.deep===5&&n.L===UGM.lv){snd(200,.6);hint('☁️ A hiss from the rock... GAS! Yellow air: walk out of it before your breath runs out.')}}
 if(n.ur)MN.ur=MN.nodes.filter(m=>m.L===UGM.lv&&m.ur&&!m.gone)}
function ugmInRefuge(mx,mz){const lev=UGM.L[UGM.lv];return!!(lev&&lev.refuge&&Math.hypot(mx-lev.refuge.x,mz-lev.refuge.z)<2.7)}
function ugmGasTick(q,dt){const now=performance.now();if(now-(UGM.gt||0)>2000)UGM.breath=1;/* (back after being away: a full breath) */UGM.gt=now;let inG=false;const mx=P.x-MN.ox,mz=P.z-q.OZ-MN.oz,my=(P.dy||0)-UGL[0].y;
 for(let i=UGM.gas.length-1;i>=0;i--){const c=UGM.gas[i];c.t+=dt;if(!c.g.userData.tick(c.t,c.life)){UGM.gas.splice(i,1);if(c.g.parent)c.g.parent.remove(c.g);c.g.traverse(o=>{if(o.material&&o.material.userData)o.material.userData.ugOwn=1});ugmFree(c.g);continue}
  if(c.kind=='gas'&&q.deep===5&&!MN.ride&&c.L===UGM.lv&&c.t<c.life-3&&Math.hypot(mx-c.x,mz-c.z)<3.3&&Math.abs(my-c.y)<3)inG=true}
 if(inG&&ugmInRefuge(mx,mz))inG=false;
 if(inG){UGM.breath=Math.max(0,UGM.breath-dt/6);if(UGM.breath<=0&&!UGM.out)ugmPassOut(q)}else UGM.breath=Math.min(1,UGM.breath+dt/3);
 ugmUI(inG,UGM.breath)}
/* r661: the breath bar only while the mine's gas check is running (it stayed on screen, empty, after you left the mine mid-gas) */
setInterval(()=>{const d=document.getElementById('ugmGas');if(d&&d.style.display!=='none'&&!(performance.now()-(UGM.gt||0)<300)){d.style.display='none'}},250);
function ugmUI(inG,b){let d=document.getElementById('ugmGas');if(!inG&&b>=1){if(d)d.style.display='none';return}if(!d){d=document.createElement('div');d.id='ugmGas';d.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:30;display:none';d.innerHTML='<div style="position:absolute;inset:0;background:radial-gradient(circle,rgba(200,224,80,.12),rgba(160,190,40,.42))"></div><div style="position:absolute;left:50%;bottom:22%;transform:translateX(-50%);width:220px;font:bold 13px DoorsSans,Arial;color:#f0f0c0;text-align:center;text-shadow:0 1px 2px #000">BREATH<div style="margin-top:3px;height:10px;border:2px solid #e0e090;border-radius:6px;background:#0008;overflow:hidden"><div id="ugmGasB" style="height:100%;background:#d8e050"></div></div></div>';document.body.appendChild(d)}
 d.style.display='block';d.firstChild.style.opacity=inG?1:.35;const bb=document.getElementById('ugmGasB');if(bb)bb.style.width=Math.round(b*100)+'%'}
function ugmPassOut(q){UGM.out=1;const aid=UGM.aid;try{bsF.style.transition='opacity .6s';bsF.style.background='#000';bsF.style.opacity=1}catch(e){}snd(80,.8);
 setTimeout(()=>{try{let lost=0;if(aid){UGM.aid=0}else for(const k in MN.carry){const h=Math.ceil((MN.carry[k]|0)/2);lost+=h;MN.carry[k]-=h;if(MN.carry[k]<=0)delete MN.carry[k]}
  ugmOut(q);q.deep=0;q.deepY=0;q.xr=null;P.x=MN.ox+3;P.z=MN.oz+2+q.OZ;P.dy=QD.F;MNJ.h=0;UGM.breath=1;ugmUI(0,1);bsF.style.transition='opacity 1.5s';bsF.style.opacity=0;
  hint(aid?'⛑️ You passed out in the gas. The crew dragged you out and the first-aid kit brought you round: you kept your ore.':'☁️ You passed out in the gas. The crew dragged you out to the quarry'+(lost?', minus '+lost+' ore':'')+'.')}catch(e){conLog('error','gas: '+e.message)}UGM.out=0},1400)}
/* leaving the mine (for any reason): put down what only works underground */
function ugmOut(q){UGM.onRaft=0;UGM.climb=null;UGM.riding=null;if(UGM.dyn){const lev=UGM.L.find(l=>l&&l.crate);if(lev)ugmCrateSet(lev,lev.crate.n+UGM.dyn);hint('🧨 You put your '+UGM.dyn+' stick'+(UGM.dyn>1?'s':'')+' of dynamite back in the crate: it does not go up in the cage.');UGM.dyn=0}
 for(let i=q.props.length-1;i>=0;i--)if(q.props[i].mn&&q.props[i].ugL!=null)q.props.splice(i,1);ugmUI(0,1)}

/* ---------- the lunchbox ---------- */
function ugmLunch(q,L,i,g0){const key=L+':'+i;if(UGM.taken.has(key))return;UGM.taken.add(key);ugmNet({k:'take',key});const lid=g0.userData.lid,nt=g0.userData.note;let t=0;const iv=setInterval(()=>{t+=.05;if(lid)lid.rotation.x=-1.9*Math.min(1,t/.5);if(t>=.5){clearInterval(iv);if(nt)nt.visible=true}},30);
 const s=UGM.plan.seed|0,gd=15+(ugHash(s,L,9)*26|0),ni=Math.floor(ugHash(s,i,4)*UGNOTES.length);gold+=gd;try{saveGame();updHud()}catch(e){}snd(600,.08);
 setTimeout(()=>milDlg(q,'🥪 THE OLD LUNCHBOX','<p>Under a stale biscuit: <b>'+gd+' gold</b> in an old tobacco tin, and a folded note.</p><p style="font-size:15px"><i>"'+UGNOTES[ni]+'"</i></p>',[['ok','Put the note back']],()=>true),500)}

/* ---------- the ladderway ---------- */
function ugmClimb(q,p,dir){if(UGM.climb||MN.ride)return;const T=ugT(p),w=T(-.25,-4.6),yT=UGLY(p.L),yB=UGLY(p.L+1);UGM.climb={p,x:w[0],z:w[1],yT,yB,y:dir<0?yT:yB};P.x=MN.ox+w[0];P.z=MN.oz+w[1]+q.OZ;MNJ.h=0;
 q.xr={k:'ugl',txt:()=>'🪜 On the ladder: W climbs up, S climbs down ('+Math.round(UGM.climb?UGM.climb.y-UGM.climb.yB:0)+' m above level '+(p.L+2)+')',act:null};snd(260,.05)}
function ugmClimbTick(q,dt){const c=UGM.climb;if(!c)return;const sp=1.9*dt;if(keys.KeyW)c.y+=sp;if(keys.KeyS)c.y-=sp;if((keys.KeyW||keys.KeyS)&&Math.random()<dt*3)snd(220+Math.random()*60,.03);
 P.x=MN.ox+c.x;P.z=MN.oz+c.z+q.OZ;P.dy=UGL[0].y+c.y;q.deepY=P.dy;MN.Y=P.dy;
 if(c.y>=c.yT){const w=ugT(c.p)(-1.3,-4.6);UGM.climb=null;q.xr=null;UGM.y=c.yT;P.x=MN.ox+w[0];P.z=MN.oz+w[1]+q.OZ;ugmSetLevel(q,c.p.L)}
 else if(c.y<=c.yB){const w=ugT(c.p)(0,-5.2);UGM.climb=null;q.xr=null;UGM.y=c.yB;P.x=MN.ox+w[0];P.z=MN.oz+w[1]+q.OZ;ugmSetLevel(q,c.p.L+1)}
 else ugmSetLevel(q,ugmLvOf(c.y),0)}

/* ---------- the rope raft (hold E to pull) ---------- */
function ugmRaftPlace(){const R=UGM.raft;if(!R)return;const x=R.a[0]+(R.c[0]-R.a[0])*R.s,z=R.a[2]+(R.c[2]-R.a[2])*R.s;R.g.position.x=x;R.g.position.z=z;R.x=x;R.z=z;R.deck=R.y+.09;if(R.prop){R.prop.x=MN.ox+x;R.prop.z=MN.oz+z}}
function ugmOnRaft(mx,mz,m){const R=UGM.raft;if(!R)return false;const rx=mx-R.x,rz=mz-R.z,al=rx*R.ux+rz*R.uz,lat=rx*R.uz-rz*R.ux;return Math.abs(al)<1.0+m&&Math.abs(lat)<1.0+m}
function ugmRaftTxt(q){const R=UGM.raft;if(!R||q.deep!==5)return'';if(!UGM.onRaft)return'[E] 🛶 Step onto the raft';return R.arr?'[E] 🛶 Step off the raft':'[E] 🛶 Hold E: pull the raft along the rope'}
function ugmRaftAct(q){const R=UGM.raft;if(!R)return;if(!UGM.onRaft){UGM.onRaft=1;R.arr=0;P.x=MN.ox+R.x;P.z=MN.oz+R.z+q.OZ;UGM.pullT=performance.now()+400;snd(180,.1);hint('🛶 You are on the raft. Hold E to pull it along the rope.');return}
 if(R.arr&&performance.now()>(UGM.pullT||0)){R.arr=0;const e=R.s<.5?R.a:R.c,w=ugmFind(e[0],e[2],UGM.lv);UGM.onRaft=0;P.x=MN.ox+w[0];P.z=MN.oz+w[1]+q.OZ;snd(200,.06)}}
function ugmRaftTick(q,dt){const R=UGM.raft;if(!R)return;if(!keys.KeyE)R.hold=0;if(UGM.onRaft&&keys.KeyE&&!R.hold&&performance.now()>(UGM.pullT||0)-300){if(R.s<=R.s0+.01)R.dir=1;else if(R.s>=R.s1-.01)R.dir=-1;const ds=R.dir*1.1*dt/R.l,s=Math.max(R.s0,Math.min(R.s1,R.s+ds));if(s<=R.s0+.01||s>=R.s1-.01){R.hold=1;R.arr=1;UGM.pullT=performance.now()+300}if(s!==R.s){R.s=s;R.net-=dt;if(R.net<=0){R.net=.25;ugmNet({k:'raft',s:+s.toFixed(3)})}if(Math.random()<dt*2)snd(150+Math.random()*30,.05)}}
 if(R.haul!=null){if(UGM.onRaft)R.haul=null;else{const d=R.haul-R.s,st=1.4*dt/R.l;if(Math.abs(d)<=st){R.s=R.haul;R.haul=null;ugmNet({k:'raft',s:+R.s.toFixed(3)})}else R.s+=Math.sign(d)*st}}
 const x0=R.x,z0=R.z;ugmRaftPlace();if(UGM.onRaft&&q.deep===5){P.x+=R.x-x0;P.z+=R.z-z0;R.g.position.y=R.y+Math.sin((q.rt||0)*1.3)*.02}}
/* the nearest spot you can walk on */
function ugmFind(x,z,L){if(mnOKL(L,x,z))return[x,z];for(let r=.3;r<4;r+=.3)for(let a=0;a<6.28;a+=.35){const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(mnOKL(L,px,pz))return[px,pz]}return[x,z]}
function mnOKL(L,x,z){const c=ugmCode(L,x,z);return c===1||c===5||c===9}

/* ---------- the zip line ---------- */
function ugmZipGo(q){const Z=UGM.zip;if(!Z||Z.st!='home'||MN.ride||UGM.climb)return;Z.st='ride';Z.t=0;UGM.riding=Z;q.xr={k:'ugz',txt:()=>'🪝 Wheeee...',act:null};ugmNet({k:'zip'});snd(500,.3)}
function ugmZipAt(Z,f){const P3=Z.P;let want=Z.l*f;for(let i=1;i<P3.length;i++){const a=P3[i-1],b=P3[i],l=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);if(want<=l||i==P3.length-1){const k=Math.min(1,want/(l||1));return[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k]}want-=l}return P3[P3.length-1]}
function ugmZipTick(q,dt){const Z=UGM.zip;if(!Z)return;if(Z.st=='ride'){Z.t+=dt;const f=Math.min(1,Z.t/Math.max(1.5,Z.l/6)),p=ugmZipAt(Z,f*.94);Z.g.position.set(p[0],p[1],p[2]);
  if(UGM.riding===Z&&q.deep===5){P.x=MN.ox+p[0];P.z=MN.oz+p[2]+q.OZ;P.dy=UGL[0].y+p[1]-2.05;q.deepY=P.dy;MN.Y=P.dy}
  if(f>=1){Z.st='far';Z.t=0;if(UGM.riding===Z){UGM.riding=null;q.xr=null;const e=Z.P[Z.P.length-1],a=Z.P[0],dx=e[0]-a[0],dz=e[2]-a[2],l=Math.hypot(dx,dz)||1,w=ugmFind(e[0]-dx/l*.4,e[2]-dz/l*.4,Z.L);P.x=MN.ox+w[0];P.z=MN.oz+w[1]+q.OZ;MNJ.h=0;snd(120,.15);hint('🪝 Across! Coming back, take the narrow ledge round the end of the fissure.')}}}
 else if(Z.st=='far'){Z.t+=dt;if(Z.t>9){Z.st='back';Z.t=0}}
 else if(Z.st=='back'){Z.t+=dt;const f=Math.max(0,1-Z.t/5),p=ugmZipAt(Z,f*.94);Z.g.position.set(p[0],p[1],p[2]);if(f<=0){Z.st='home';Z.g.position.copy(Z.p0)}}}

/* ---------- the walking (replaces the old mine's square cells) ---------- */
function ugmDoorBlock(lev,x,z){for(const d of lev.doors){const rx=x-d.cx,rz=z-d.cz,al=rx*d.nx+rz*d.nz,lat=rx*d.tx+rz*d.tz;if(Math.abs(al)<.35&&Math.abs(lat)<2.1){if(!(d.open&&d.a>.7&&Math.abs(lat)<.55))return true}}return false}
function ugmOK(x,z){/* desert-local x, z */if(MN.st!='open'&&MN.st!='warn')return Math.hypot(x-MN.ox,z-MN.oz)<1.6;
 const L=UGM.lv,lev=UGM.L[L];if(!UGM.plan||!lev||!lev.grid)return Math.hypot(x-MN.ox+.8,z-MN.oz)<.7;
 const mx=x-MN.ox,mz=z-MN.oz;if(UGM.onRaft)return ugmOnRaft(mx,mz,0);
 const k=ugmIdx(mx,mz),c=k<0?0:lev.grid.c[k];
 if(c===6){const r=ugmRamp(mx,mz,UGM.y);if(!r||r.d>1.65||Math.abs(r.y-UGM.y)>.8)return false}
 else if(c===0||c===4||c===7)return false;
 else if(c===8){if(UGM.cageL!==L||MN.ride)return false}
 for(const p of lev.plats)if(mx>p.x0-.3&&mx<p.x1+.3&&mz>p.z0-.3&&mz<p.z1+.3&&p.top>MNJ.h+.65)return false;
 if(lev.doors.length&&ugmDoorBlock(lev,mx,mz))return false;
 if(ugmRubble(mx,mz))return false;
 return true}
function ugmTop(x,z,h){const L=UGM.lv,lev=UGM.L[L];if(!UGM.plan||!lev||!lev.grid)return 0;const mx=x-MN.ox,mz=z-MN.oz,k=ugmIdx(mx,mz),c=k<0?0:lev.grid.c[k];let fy=UGLY(L),t=0;
 if(UGM.onRaft){fy=UGM.raft?UGM.raft.deck:fy}
 else if(c===6){const r=ugmRamp(mx,mz,UGM.y);if(r&&r.d<2.2)fy=r.y;UGM.y=fy;const nl=ugmLvOf(fy);if(nl!==L){const q=BUS.ride;if(q)ugmSetLevel(q,nl)}}
 else{UGM.y=UGLY(L);if(c===5)fy=UGLY(L)+ugmWade(lev,mx,mz)}
 UGM.wade=!UGM.onRaft&&c===5&&fy<UGLY(L)-.1;MN.Y=UGL[0].y+fy;
 if(!UGM.onRaft){if(c===2)t=-60;else if(c===3)t=-1}
 for(const p of lev.plats)if(mx>p.x0-.2&&mx<p.x1+.2&&mz>p.z0-.2&&mz<p.z1+.2&&p.top<=h+.65)t=Math.max(t,p.top);
 return t}
function ugmPit(x,z){if(UGM.onRaft)return null;const c=ugmCode(UGM.lv,x-MN.ox,z-MN.oz);return c===2?{}:c===3?{lava:1}:null}

/* ---------- the lights: a fixed pool that moves to the nearest lamps (the number of lights never changes) ---------- */
const UGLCOL={crystal:0x9fe8ff,island:0xffd8a0,magma:0xff8a40,basalt:0xff7a3a,fungus:0xe8a0ff,hotseam:0xa8ff70,geode:0xd8b0ff,dark:0x9fe0ff};
function ugmLights(q,dt){const Ls=UGM.lights;if(!Ls)return;const on=q.deep===5&&UGM.plan;
 if(on&&(UGM.lt-=dt)<=0){UGM.lt=.2;const px=P.x-MN.ox,pz=P.z-q.OZ-MN.oz,py=(P.dy||0)-UGL[0].y+1.5,cand=[];
  for(let L=0;L<3;L++){const lev=UGM.L[L];if(!lev||!lev.g.visible)continue;for(const l of lev.lamps){const d=Math.hypot(l[0]-px,(l[1]-py)*1.5,l[2]-pz);if(d<25)cand.push([d,l,L])}}
  cand.sort((a,b)=>a[0]-b[0]);const want=cand.slice(0,UGLN).map(c=>c[1]);
  for(let i=0;i<UGLN;i++){const s=UGM.lsl[i];if(s&&!want.includes(s.l))UGM.lsl[i]=null}
  for(const c of cand.slice(0,UGLN)){if(UGM.lsl.some(s=>s&&s.l===c[1]))continue;const i=[0,1,2,3].find(i=>!UGM.lsl[i]);if(i==null)break;const l=c[1],Lt=Ls[i];
   Lt.position.set(MN.ox+l[0],UGL[0].y+l[1],MN.oz+l[2]);const pid=ugmPid(c[2],l[0],l[2]),p=pid>=0?UGM.plan.P[pid]:null;Lt.color.setHex(p&&UGLCOL[p.type]||0xffd49a);Lt.intensity=0;UGM.lsl[i]={l,L:c[2]}}}
 for(let i=0;i<UGLN;i++){const Lt=Ls[i],s=UGM.lsl[i],tg=on&&s?Math.min(2.2,1.1*(s.l[3]||1)):0;Lt.intensity+=(tg-Lt.intensity)*Math.min(1,dt*6);if(Lt.intensity<.01&&!tg)Lt.intensity=0}}
/* fog and the dark, per level */
const UGFOG=[0x22160c,0x0e161c,0x1c0806];
function ugmAtmo(q,dt,dark){const led=qtL('lamp')>0,L=MN.lamp,tg=dark?(led?.1:.015):.13;q.ugK=(q.ugK==null?tg:q.ugK)+(tg-(q.ugK==null?tg:q.ugK))*Math.min(1,dt*3);
 if(L){L.intensity=dark?(led?2.2:.25):(led?1.6:1.15);L.distance=dark?(led?24:3.5):(led?24:18);L.color.setHex(UGM.lv==2?0xffc8a0:0xfff0d8)}
 try{if(S.fog){S.fog.far=dark?(led?20:4):(led?34:28);S.fog.color.setHex(dark?0x020202:UGFOG[UGM.lv])}}catch(e){}}
/* the water ripples, the stream, the waterfall and the lava move */
function ugmScroll(dt){const K=UGK;if(!K.ok)return;try{K.poolN.offset.x+=.012*dt;K.poolN.offset.y+=.007*dt;if(K.streamN)K.streamN.offset.y-=.25*dt;if(K.fallT)K.fallT.offset.y+=1.2*dt;if(K.fallT2)K.fallT2.offset.y+=.9*dt;if(K.lavaT)K.lavaT.offset.x+=.02*dt;if(K.lavaFT)K.lavaFT.offset.y+=.5*dt}catch(e){}}
/* which levels are drawn: yours, and the next one when you can see into it (the shaft, a ramp, a ladder, a ride) */
function ugmVis(q){const vis=[0,0,0];if(q.deep!==5){for(const l of UGM.L)if(l)l.g.visible=false;return}const L=UGM.lv,mx=P.x-MN.ox,mz=P.z-q.OZ-MN.oz;vis[L]=1;
 if(MN.ride){const r=MN.ride;if(r.from>=0)vis[r.from]=1;if(r.to>=0)vis[r.to]=1;const lc=ugmLvOf((P.dy||0)-UGL[0].y);vis[lc]=1}
 if(UGM.climb){vis[UGM.climb.p.L]=1;vis[UGM.climb.p.L+1]=1}
 if(Math.hypot(mx,mz)<9){if(L>0)vis[L-1]=1;if(L<2)vis[L+1]=1}
 for(const R of UGM.ramps)if((R.L===L||R.L+1===L)){const p=UGM.plan.P[R.pid],c=ugT(p)(6,-8);if(Math.hypot(mx-c[0],mz-c[1])<22){vis[R.L]=1;vis[R.L+1]=1}}
 for(const p of UGM.plan.P)if(p.type=='ladder'&&(p.L===L||p.L+1===L)){const c=ugT(p)(0,-4.6);if(Math.hypot(mx-c[0],mz-c[1])<9){vis[p.L]=1;vis[p.L+1]=1}}
 for(let i=0;i<3;i++){const l=UGM.L[i];if(l)l.g.visible=!!vis[i]}}

/* ---------- the mine's own functions, rebuilt for three levels ---------- */
function ugmGen(q,sd){sd=sd>>>0;if(sd&&sd===MN.seed&&MN.cells)return;ugmReset(q);MN.seed=sd||(((Math.random()*1e9)|0)+7);MN.cells={seed:MN.seed};UGM.lv=0;UGM.y=0;UGM.cageL=-1}
function ugmRideStart(q,dir,to){if(q.xr||q.seat||MN.ride)return;const from=q.deep===5?UGM.lv:-1;
 if(to===undefined){if(dir<0){if(from<0&&qtL('sink')>0){ugmCageDlg(q);return}to=0}else to=-1}
 if(to===from)return;
 if(to>=0&&MN.st!='open'){hint(MN.st=='closed'?'⛏️ The crew are blasting a new mine. '+Math.ceil(MN.gap-MN.t)+' s.':'⛏️ The shaft is closed: the mine is coming down!');snd(180,.1);return}
 if(to>=0&&!ugmCageHere(to)){hint('🔒 The cage does not stop there yet: SHAFT SINKING at the Quarry Tycoon computer.');snd(180,.1);return}
 try{if(to>=0&&mnFollow()&&!MN.cells&&MN.seed)mnGen(q,MN.seed)}catch(e){}if(to>=0&&!MN.cells)mnGen(q);if(to>=0)ugmEnsure(q);
 if(from>=0){UGM.onRaft=0;UGM.climb=null;UGM.riding=null;if(to<0)ugmOut(q)}for(const k in keys)keys[k]=0;
 const y0=ugmCageY(from),y1=ugmCageY(to),legs=(from<0||to<0?1:0)+.5*Math.abs((to<0?0:to)-(from<0?0:from));
 P.x=MN.ox-.8;P.z=MN.oz+q.OZ;q.xr={k:'mn',txt:()=>'',act:null};q.deep=5;q.deepY=y0;MN.ride={dir:y1>y0?1:-1,t:0,from,to,y0,y1,T:qtRide()*Math.max(.5,legs)};UGM.cageL=-2;MNJ.h=0;
 snd(140,.3);hint(to<0?'⬆️ Up we go. The cart rattles behind you.':from<0?'⬇️ The cage drops into the dark. '+Math.round(y0-y1)+' metres of rope.':'🛗 The cage grinds '+(y1<y0?'down':'up')+' to level '+(to+1)+'.')}
function ugmTick(q,dt){MN.t+=dt;
 if(MN.st=='open'){const left=MN.life-MN.t;if(left<60&&!MN.w1){MN.w1=1;if(q.deep===5){hint('⚠️ The timbers CREAK. One minute until this mine comes down.');snd(70,.4)}}if(left<30&&!MN.w2){MN.w2=1;if(q.deep===5){hint('⚠️ Dust is falling from the roof. THIRTY SECONDS. Get to the cage!');snd(60,.5)}}if(left<10&&!MN.w3){MN.w3=1;if(q.deep===5){hint('🚨 ROCKS ARE FALLING. TEN SECONDS!');snd(50,.6)}}
  if(q.deep===5&&left<30){if(Math.random()<dt*(left<10?14:5))try{vfx('dust',P.x+(Math.random()-.5)*5,(P.dy||MN.Y)+3,P.z+(Math.random()-.5)*5,{n:3,w:1})}catch(e){}if(left<10)camShake(.12,.1)}
  if(left<=0&&!mnFollow())mnCollapse(q)}
 else if(MN.st=='closed'){if(MN.t>=MN.gap&&!mnFollow()){MN.st='open';MN.t=0;MN.w1=MN.w2=MN.w3=0;mnGen(q);const lz=P.z-q.OZ;if(Math.hypot(P.x-MN.ox,lz-MN.oz)<60&&!q.deep)hint('💥 BOOM... the crew have blasted a NEW MINE. The cage is running again.')}}
 /* the cage ride (it waits at the bottom until the level below is built) */const Ld=MN.ride;if(Ld){Ld.t+=dt;let u=Math.min(1,Ld.t/Ld.T);if(Ld.to>=0&&!ugmReady(Ld.to))u=Math.min(u,.97);const e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2,y=Ld.y0+(Ld.y1-Ld.y0)*e;
  q.deepY=y;P.x=MN.ox-.8;P.z=MN.oz+q.OZ;P.dy=y;MN.Y=y;if(MN.cage)MN.cage.position.y=y;if(Math.random()<dt*3)snd(110+Math.random()*40,.04);
  if(u>=1){MN.ride=null;q.xr=null;snd(220,.2);if(Ld.to>=0){q.deep=5;UGM.cageL=Ld.to;UGM.y=UGLY(Ld.to);MN.Y=ugmY(Ld.to);q.deepY=MN.Y;P.x=MN.ox-.8;MNJ.h=0;MNJ.vy=0;MNJ.g=1;ugmSetLevel(q,Ld.to,1);
    hint('⛏️ LEVEL '+(Ld.to+1)+' · '+UGL[Ld.to].nm.toUpperCase()+'. Swing at the veins (E), bring the ore back to the MINECART in the cage. '+Math.max(0,Math.ceil(MN.life-MN.t))+' s before it comes down.')}
   else{q.deep=0;q.deepY=0;P.x=MN.ox-2.7;P.dy=QD.F;UGM.cageL=-1;if(MN.cage)MN.cage.position.y=QD.F;mnCartUp(q);ugmUI(0,1);const S=qtS();if(S.fos&&!qtL('mint'))setTimeout(()=>hint('🦴 You carry '+S.fos+' fossil'+(S.fos>1?'s':'')+'. The ASSAY OFFICE buys them (60 gold each): build it at the Quarry Tycoon computer.'),2500)}}}
 /* the cage waits at the station you are at, if it stops there */
 if(!MN.ride&&q.deep===5&&UGM.plan&&ugmCageHere(UGM.lv)&&UGM.cageL!==UGM.lv&&Math.hypot(P.x-MN.ox,P.z-q.OZ-MN.oz)>5){UGM.cageL=UGM.lv;if(MN.cage)MN.cage.position.y=ugmY(UGM.lv)}
 if(q.deep===5){if(MN.lamp){MN.lamp.intensity=1.15;MN.lamp.position.set(P.x,(P.dy||MN.Y)+1.9,P.z-q.OZ)}}else if(MN.lamp&&MN.lamp.intensity)MN.lamp.intensity=0;
 /* r596: the cage drops down the shaft when the mine collapses, and is wound back up */
 try{const d=MN.cdrop,cg=MN.cage;if(d&&cg&&!MN.ride){d.t+=dt;if(MN.st=='closed'){const y1=QD.F-9;if(cg.position.y>y1){cg.position.y=Math.max(y1,cg.position.y-dt*(1.5+d.t*2));if(Math.random()<dt*4)try{snd(70+Math.random()*30,.05)}catch(e){}}}
   else{cg.position.y=Math.min(QD.F,cg.position.y+dt*3);if(Math.random()<dt*3)try{snd(110+Math.random()*40,.04)}catch(e){}if(cg.position.y>=QD.F){cg.position.y=QD.F;MN.cdrop=null;try{snd(220,.2)}catch(e){}}}}}catch(e){}
 try{smeltTick(q,dt)}catch(e){}}

/* ---------- every frame (after everything else in the desert's update) ---------- */
function ugmFar(q){/* deep underground nothing past the fog can be seen: a near far plane keeps the desert above from being drawn */
 const want=q.deep===5&&(P.dy||0)<QD.F-6;if(want&&!UGM.far0){UGM.far0=C.far;C.far=70;C.updateProjectionMatrix()}else if(!want&&UGM.far0){if(C.far===70){C.far=UGM.far0;C.updateProjectionMatrix()}UGM.far0=0}}
function ugmFrame(q,dt,px0,pz0){ugmFar(q);if(!MN.g&&!UGM.plan)return;
 if(UGM.job||UGM.queue&&UGM.queue.length)ugmBuildTick(q.deep===5||MN.ride?10:4);
 ugmScroll(dt);ugmPanelSet();
 if(q.deep!==5||!UGM.plan){ugmVis(q);ugmLights(q,dt);if(q.deep!==5&&(UGM.climb||UGM.onRaft||UGM.riding))ugmOut(q);return}
 ugmVis(q);ugmLights(q,dt);ugmFallTick(q);ugmChargeTick(q,dt);ugmGasTick(q,dt);ugmRaftTick(q,dt);ugmZipTick(q,dt);ugmClimbTick(q,dt);
 const lev=UGM.L[UGM.lv];if(!lev)return;
 /* the gates and doors */for(const l of UGM.L){if(!l)continue;if(l.gate){const want=UGM.cageL===l.L&&!MN.ride?1.95:0;l.gate.position.y+=(want-l.gate.position.y)*Math.min(1,dt*2.5)}for(const d of l.doors){const want=d.open?1:0;d.a+=(want-d.a)*Math.min(1,dt*1.5);d.g.rotation.y=Math.atan2(d.nx,d.nz)+d.to*Math.min(1,d.a)}}
 /* the veins shrink and vanish as they are hit */for(const n of MN.nodes)if(n.L===UGM.lv&&n.rec)ugmVeinSync(lev,n.rec,n);
 if(MN.ride)return;
 /* never left standing somewhere you cannot be (a rockfall on top of you, a ledge...): step to the nearest free spot */
 if(!q.xr&&!UGM.onRaft&&!MN.falling&&MN.st=='open'&&!ugmOK(P.x,P.z-q.OZ)){const x0=P.x,z0=P.z-q.OZ;let done=0;for(let r=.25;r<6&&!done;r+=.25)for(let a=0;a<6.28&&!done;a+=.3){const x=x0+Math.cos(a)*r,z=z0+Math.sin(a)*r;if(ugmOK(x,z)){P.x=x;P.z=z+q.OZ;done=1}}}
 const mx=P.x-MN.ox,mz=P.z-q.OZ-MN.oz,pid=ugmPid(UGM.lv,mx,mz),p=pid>=0?UGM.plan.P[pid]:null;
 /* wading: slower (70%), the eyes drop with the floor */if(UGM.wade&&px0!=null&&!q.xr){const dx=P.x-px0,dz=P.z-pz0;if(dx||dz){const nx=P.x+dx*.4,nz=P.z+dz*.4;if(ugmOK(nx,nz-q.OZ)){P.x=nx;P.z=nz}}if(P.sp>0&&Math.random()<dt*3)try{vfx('splash',P.x,(P.dy||0)+.4,P.z,{n:2})}catch(e){}}
 q.wade=UGM.wade?1:0;
 if(p){UGM.seen[UGM.lv].add(p.id);if(!UGM.hinted.has(p.id)){UGM.hinted.add(p.id);const c=ugmCat(p.type);if((c=='room'||c=='end'||(c=='jn'&&p.d.vn&&p.type!='tee'&&p.type!='cross')||p.type=='basalt'||p.type=='stream'||(p.type=='collapsed'&&p.d.v))&&p.d.vn){const ic=(p.d.fx.find(f=>f.k=='icon')||{}).t||'⛏️';hint(ic+' '+p.d.vn.toUpperCase()+': '+(p.d.vd||''))}}}
 ugmAtmo(q,dt,p&&p.type=='dark');q.deepY=MN.Y;
 /* burning ground: glowing crust, and the geysers when they go off */
 const hot=(why)=>{if(UGM.burnT>performance.now())return;UGM.burnT=performance.now()+1500;let lost=0;if(UGM.aid){UGM.aid=0}else for(const k of Object.keys(MN.carry)){if(lost>=2)break;const t=Math.min(2-lost,MN.carry[k]|0);MN.carry[k]-=t;lost+=t;if(MN.carry[k]<=0)delete MN.carry[k]}snd(120,.3);try{vfx('ember',P.x,(P.dy||0)+.3,P.z,{n:6});camShake(.2,.2)}catch(e){}hint(why+(lost?' You drop '+lost+' ore.':UGM.aid===0&&!lost?'':''))};
 for(const h of lev.hot)if(Math.hypot(mx-h.x,mz-h.z)<h.r){const a=Math.atan2(mz-h.z,mx-h.x),w=ugmFind(h.x+Math.cos(a)*(h.r+.7),h.z+Math.sin(a)*(h.r+.7),UGM.lv);P.x=MN.ox+w[0];P.z=MN.oz+w[1]+q.OZ;hot('🔥 HOT! That crust was glowing: you jump off it.');break}
 const t=q.rt||0;UGM.ventT-=dt;
 for(const f of lev.fx){if(f.k=='gey'){const u=(t+f.ph)%7,near=Math.hypot(mx-f.x,mz-f.z);if(u<1.9){if(near<28&&Math.random()<dt*14)try{vfx('ember',MN.ox+f.x+(Math.random()-.5)*.5,ugmY(UGM.lv)+.4+Math.random()*4,MN.oz+f.z+q.OZ,{n:2})}catch(e){}if(near<1.6)hot('🌋 The geyser goes off under you!')}else if(u>6.4&&near<28&&Math.random()<dt*5)try{vfx('puff',MN.ox+f.x,ugmY(UGM.lv)+.3,MN.oz+f.z+q.OZ,{n:1,c:0xff8030})}catch(e){}}
  else if(f.k=='vent'){if(UGM.ventT<=0&&Math.random()<.5){const i=Math.random()*(f.pts.length-1)|0,a=f.pts[i],b=f.pts[i+1],k=Math.random(),x=a[0]+(b[0]-a[0])*k,z=a[1]+(b[1]-a[1])*k;if(Math.hypot(mx-x,mz-z)<20)try{vfx('puff',MN.ox+x,ugmY(UGM.lv)+.2,MN.oz+z+q.OZ,{n:6,c:0xe8e8e8});snd(300,.15)}catch(e){}}}
  else if(f.k=='comp'&&UGM.comp){if(Math.hypot(mx-f.x,mz-f.z)<14&&((t*2.2)%1)<dt*2.2)snd(55,.12)}}
 if(UGM.ventT<=0)UGM.ventT=.8;
 /* the first-aid kit also covers a fall into a chasm or the lava (the fall code takes the ore, the kit gives it back) */
 if(MN.falling&&!UGM.falling){UGM.falling=1;const snap=JSON.parse(JSON.stringify(MN.carry));if(UGM.aid){UGM.aid=0;setTimeout(()=>{MN.carry=snap;hint('⛑️ The first-aid kit patched you up: you kept your ore.')},1000)}}else if(!MN.falling)UGM.falling=0}

/* ---------- co-op: the same mine for everyone (seed, clock and broken veins as before; the rest here) ---------- */
function ugmNetIn(o,id){const q=BUS.ride;if(!q||(o.sd>>>0)!==MN.seed)return;const k=o.k;
 if(k=='dig'&&UGM.fall){UGM.fall.k=Math.max(UGM.fall.k,o.n|0);if(UGM.fall.g)UGM.fall.g.userData.stage(Math.min(8,UGM.fall.k))}
 else if(k=='blast'){ugmBlast(q,o.L|0,+o.x,+o.y,+o.z,false,o.kind)}
 else if(k=='door'){UGM.doorsOpen.add((o.L|0)+':'+(o.i|0));const l=UGM.L[o.L|0];if(l&&l.doors[o.i|0])l.doors[o.i|0].open=1}
 else if(k=='raft'&&UGM.raft&&!(UGM.onRaft&&keys.KeyE)){UGM.raft.s=Math.max(UGM.raft.s0,Math.min(UGM.raft.s1,+o.s||0))}
 else if(k=='take'){const key=String(o.key);UGM.taken.add(key);const[L,i]=key.split(':').map(Number);const l=UGM.L[L];if(l){const g0=l.res.pickups[i];if(g0&&g0.userData.pick!='lunchbox'&&g0.userData.pick!='dynamite crate')g0.visible=false;if(g0&&g0.userData.pick=='lunchbox'&&g0.userData.lid){g0.userData.lid.rotation.x=-1.9;if(g0.userData.note)g0.userData.note.visible=true}}}
 else if(k=='crate'){UGM.crateN=Math.max(0,(o.n|0)-1);const l=UGM.L.find(l=>l&&l.crate);if(l)ugmCrateSet(l,UGM.crateN)}
 else if(k=='safe')UGM.safe=1;
 else if(k=='zip'&&UGM.zip&&UGM.zip.st=='home'){UGM.zip.st='ride';UGM.zip.t=0}}

/* ---------- the Shaft sinking upgrade (Quarry Tycoon) ---------- */
function ugmSinkUp(){if(QTD.sink)return;const i=QT.findIndex(u=>u.id=='cage');const u={id:'sink',ic:UGSINK.icon,nm:UGSINK.nm,lv:UGSINK.levels.map(l=>l.nm),cost:UGSINK.levels.map(l=>l.cost),d:['the cage stops at level 1','the cage gate opens on level 2 (The Caves) too','the cage stops at all three levels, down to The Deep']};QT.splice(i+1,0,u);QTD.sink=u}

/* ---------- the minimap underground: the pieces you have walked through on your level ---------- */
function ugmMini(q,cv){const k=cv.getContext('2d'),W=cv.width,H=cv.height,L=UGM.lv,fr=[];try{const N=q.vnet;for(const id in (N&&N.rem)||{}){const r=N.rem[id];if(Date.now()-r.t>4000)continue;if(Math.abs((r.dy||0)-ugmY(L))<5&&Math.hypot(r.x-MN.ox,r.z-MN.oz)<80)fr.push({x:r.x-MN.ox,z:r.z-MN.oz,c:'#4ad0ff'})}}catch(e){}
 ugMiniDraw(k,UGM.plan,L,{w:W,h:H,me:{x:P.x-MN.ox,z:P.z-q.OZ-MN.oz,yaw:P.yaw},friends:fr,seen:UGM.seen[L],scale:1.6*W/200})}

/* ---------- switching it all on ---------- */
if(UGW.on){
 MN.life=360;MN.pits=[1];ugmSinkUp();
 mnGen=function(q,sd){return ugmGen(q,sd)};
 mnRide=function(q,dir,to){return ugmRideStart(q,dir,to)};
 mnTick=function(q,dt){return ugmTick(q,dt)};
 mnOK=ugmOK;mnTop=ugmTop;mnPit=ugmPit;
 /* the collapse: the old code throws the mine away (here the kit's shared materials are kept); a cage on its way down turns back */
 {const c0=mnCollapse;mnCollapse=function(q){const R0=MN.ride,G=MN.g;MN.g=null;let r;try{r=c0.apply(this,arguments)}finally{MN.g=G;ugmReset(q)}
   try{if(R0&&R0.to>=0&&MN.ride===R0){const y=P.dy||R0.y0;MN.ride={dir:1,t:0,from:-1,to:-1,y0:y,y1:QD.F,T:qtRide()*.8};hint('🪨 The mine is coming down! The winchman hauls the cage back up.')}}catch(e){}
   UGM.dyn=0;return r}}
 /* swinging at a vein: the dark caves need the LED headlamp, ledge veins need you up on the ledge; gas */
 {const h0=mnHit;mnHit=function(q,n){if(n&&n.rec){if(n.dark&&!qtL('lamp')){if(!(MN.dkT>performance.now())){MN.dkT=performance.now()+2500;hint('🌑 Too dark to find the seam. You need an LED HEADLAMP (Quarry Tycoon computer).');snd(180,.06)}return}
   if(n.need&&MNJ.h<n.need){if(!(MN.hT>performance.now())){MN.hT=performance.now()+2000;hint('🧗 That vein is up on the ledge. Climb up to it.')}return}}
  const was=n&&n.gone,r=h0.apply(this,arguments);if(n&&n.rec&&!was&&n.gone)try{ugmVeinBroke(q,n,true)}catch(e){}return r}}
 /* co-op */
 {const m0=XM.net.mn;XM.net.mn=(o,id)=>{m0(o,id);try{if((o.sd>>>0)===MN.seed&&Array.isArray(o.g))for(const i of o.g)UGM.gone.add(i|0)}catch(e){}}}
 {const h0=XM.net.mnh;XM.net.mnh=(o,id)=>{let n=null,was=true;try{if((o.sd>>>0)===MN.seed){UGM.gone.add(o.i|0);n=MN.nodes[o.i|0];was=!n||!!n.gone}}catch(e){}h0(o,id);try{const q=BUS.ride;if(n&&!was&&n.gone&&q)ugmVeinBroke(q,n,false)}catch(e){}}}
 XM.net.ugx=(o,id)=>{try{ugmNetIn(o,id)}catch(e){}};
 /* every frame, after the rest of the desert */
 {const ru=busRoamUpd;busRoamUpd=function(q,dt){const px0=P.x,pz0=P.z,r=ru.apply(this,arguments);try{ugmFrame(q,dt,px0,pz0)}catch(e){conLog('error','mine: '+e.message)}return r}}
 /* the quarry: the lights' pool, the cage panel, the fossil counter at the assay office */
 {const s0=mnSurface;mnSurface=function(X){const r=s0.apply(this,arguments);try{const q=X.q;UGM.lights=[];UGM.lsl=[];for(let i=0;i<UGLN;i++){const l=new THREE.PointLight(0xffd49a,0,11,1.7);l.userData.dpKeep=1;q.g.add(l);UGM.lights.push(l)}
   if(MN.cage){const pn=ugCagePanel();pn.position.set(-1.27,1.35,-1.075);pn.userData.dpKeep=1;MN.cage.add(pn);UGM.panel=pn;pn.userData.k=-1}
   X.prop(SM.gx+9,SM.gz-2.8,2.4,()=>{const f=qtS().fos|0;if(!f||q.deep||!qtL('mint'))return'';return'[E] 🦴 Sell '+f+' fossil'+(f>1?'s':'')+' to the ASSAY OFFICE ('+60*f+' gold)'},()=>{const S=qtS(),f=S.fos|0;if(!f||!qtL('mint'))return;S.fos=0;gold+=60*f;S.earned=(S.earned|0)+60*f;try{saveGame();updHud()}catch(e){}snd(900,.1);setTimeout(()=>snd(1300,.12),120);hint('🦴 The assayer squints through his glass: "Ammonites, trilobites... genuine." '+60*f+' gold.')})}catch(e){conLog('error','mine lights: '+e.message)}return r}}
 {const bb=busBoard;busBoard=function(){try{if(!BUS.ride){ugmReset(null);UGM.lights=null;UGM.lsl=[];UGM.panel=null;UGM.dyn=0;UGM.aid=0;UGM.cageL=-1;UGM.lv=0}}catch(e){}return bb.apply(this,arguments)}}
 /* the minimap underground */
 {const dd=dmapDraw;dmapDraw=function(q,cv,cx,cz,sc,full){if(!full&&q&&q.deep===5&&UGM.plan&&!MN.ride&&UGM.L[UGM.lv]){try{ugmMini(q,cv);return}catch(e){conLog('error','mine minimap: '+e.message)}}return dd.apply(this,arguments)}}
 /* the mine stays out of the desert's batching (as the old one did): the people batching (r654) is told too */
 if(typeof sknRoots=='function'){const s0=sknRoots;sknRoots=function(q){return s0(q).filter(o=>o!==MN.g)}}
}
