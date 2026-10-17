/* =====================================================================================================
   r572: proper driving.
   - SQUADS plan a real route (the same grid search the desert police use) instead of driving straight at each waypoint,
     so they go round buildings, walls and rocks.
   - The WRAITH AUTOPILOT plans a route home from anywhere on the map, comes in through the restricted-zone gate,
     opens the door and parks. If you own the Wraith it goes to YOUR WRAITH BAY instead.
   - WRAITH BAYS: four private bays behind the general offices (one per office, like the offices). The roller door
     opens by itself when the owner walks or drives up, and stays shut for everyone else. A Wraith parked in your bay
     cannot be damaged, and it is still there next time you come to the desert.
   ===================================================================================================== */
{const mv2=mkVehModel;mkVehModel=function(k){const m=mv2.apply(this,arguments);try{if(k=='swat'){let n=0;m.traverse(o=>{if(o.isMesh)n++});if(!n&&typeof mkSwatModel=='function'){const a=mkSwatModel(false);a.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.type=='PlaneGeometry'&&o.material&&o.material.map)o.visible=false});a.userData=Object.assign({},m.userData||{},a.userData||{});return a}}}catch(e){}return m}}
/* ---------- squads: route planning for the lead vehicle ---------- */
{const cd1=cwDrive;cwDrive=function(q,u,gx,gz,dt,max,dist){const v=u.v;const real=Math.hypot(gx-v.x,gz-v.z);if(dist!==0||real<6)return cd1.apply(this,arguments);
  try{if(typeof bgIn=='function'&&bgIn(v.x,v.z)&&bgIn(gx,gz)){/* inside Fort Blackout: the base grid */u.c=u.c||{};const C=u.c;if(!C.bpT||Math.hypot(C.bpT[0]-gx,C.bpT[1]-gz)>3||(u.stuckN|0)>=2){C.bpT=[gx,gz];C.bp=bgPath(q,v.x,v.z,gx,gz,[])||null;C.bi=0;u.stuckN=0}if(u.bT<0&&!u.cnt){u.cnt=1;u.stuckN=(u.stuckN|0)+1}else if(u.bT>=0)u.cnt=0;if(C.bp&&C.bp.length){while(C.bi<C.bp.length-1&&Math.hypot(C.bp[C.bi][0]-v.x,C.bp[C.bi][1]-v.z)<4)C.bi++;const p=C.bp[C.bi];cd1.call(this,q,u,p[0],p[1],dt,max,0);return real}}}catch(e){}
  try{u.c=u.c||{};const C=u.c;if(!C.tg||Math.hypot(C.tg[0]-gx,C.tg[1]-gz)>3||((u.stuckN|0)>=2&&!C.jobs?.path)){C.tg=[gx,gz];C.path=null;C.pi=0;u.stuckN=0;navReq(q,C,'path',v.x,v.z,gx,gz,1)}navWork(C,2);
   if(u.bT<0&&!u.cnt){u.cnt=1;u.stuckN=(u.stuckN|0)+1}else if(u.bT>=0)u.cnt=0;
   const pt=C.path&&C.path.length?navSteer(C,v.x,v.z,10):null;if(pt){cd1.call(this,q,u,pt[0],pt[1],dt,max,0);return real}}catch(e){}
  return cd1.apply(this,arguments)}}
/* ---------- WRAITH BAYS ---------- */
const WBAY={x0:430,z0:-845,z1:-826,w:10,n:4};
function bayX(i){return WBAY.x0+i*WBAY.w+WBAY.w/2}
function bayMine(q){try{if(!garOwned('proto'))return -1;return cwSlot(q)}catch(e){return -1}}
function bayBuild(q){if(q.wbay||!q.g||!q.obs)return;const g=new THREE.Group();q.g.add(g);const B={g,doors:[]};q.wbay=B;const H=5.2,t=.3,Z0=WBAY.z0,Z1=WBAY.z1,X0=WBAY.x0,X1=X0+WBAY.w*WBAY.n,cz=(Z0+Z1)/2,D=Z1-Z0;
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.8,metalness:.15},o||{})),A=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o},ob=(x0,x1,z0,z1)=>{const o={x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1)};q.obs.push(o);return o};
 const CON=M(0x7c7e74),RF=M(0x4a4c46),FL=M(0x5a5c56,{polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),DR=M(0x8a8e92,{metalness:.5}),YL=M(0xd8b020);
 A(X1-X0,.08,D,FL,(X0+X1)/2,.07,cz);A(X1-X0+.6,.3,D+.6,RF,(X0+X1)/2,H+.15,cz);A(X1-X0,H,t,CON,(X0+X1)/2,H/2,Z0);ob(X0,X1,Z0-t/2,Z0+t/2);
 for(let i=0;i<=WBAY.n;i++){const x=X0+i*WBAY.w;A(t,H,D,CON,x,H/2,cz);ob(x-t/2,x+t/2,Z0,Z1)}
 /* r616: the bay fronts (fbCmdBlock, dx614) carry the name */
 for(let i=0;i<WBAY.n;i++){const cx=bayX(i),dw=7.6,a=cx-dw/2,b=cx+dw/2;
  A(a-(cx-WBAY.w/2),H,t,CON,(cx-WBAY.w/2+a)/2,H/2,Z1);ob(cx-WBAY.w/2,a,Z1-t/2,Z1+t/2);A(cx+WBAY.w/2-b,H,t,CON,(b+cx+WBAY.w/2)/2,H/2,Z1);ob(b,cx+WBAY.w/2,Z1-t/2,Z1+t/2);A(dw,H-4.5,t,CON,cx,4.5+(H-4.5)/2,Z1);
  const dm=A(dw,4.5,.12,DR,cx,2.25,Z1+.05);for(let k=0;k<9;k++){const r=new THREE.Mesh(new THREE.BoxGeometry(dw,.05,.16),M(0x6a6e72,{metalness:.6}));r.position.y=-2.1+k*.5;dm.add(r)}const st=new THREE.Mesh(new THREE.BoxGeometry(dw,.25,.18),YL);st.position.y=-2.1;dm.add(st);
  const lt=A(.3,.3,.3,M(0x200000,{emissive:0xc00000}),cx+dw/2+.5,4.2,Z1+.2);
  const lab=pdTxt('BAY '+(i+1),1.4,.32,'#d8b040','#20261c');lab.position.set(cx,4.75,Z1+.18);g.add(lab);
  const dob=ob(a,b,Z1-.2,Z1+.2);B.doors.push({i,cx,m:dm,lt,ob:dob,u:0,obOn:1,lab})}
 q.anims.push({x:(X0+X1)/2,z:cz,r:250,f:dt=>bayTick(q,dt)});q.obsDirty=1;q.mapR&&q.mapR.push({x0:X0,x1:X1,z0:Z0,z1:Z1,c:'#4a5a5a'});q.mapBg=null;
 /* a Wraith you left in your bay last time is still there (wait for the Wraith itself to exist first) */{let tries=0;const rs=()=>{try{const S=milSV(),i=bayMine(q),pv=q.mil&&q.mil.proto;if(!pv||i<0){if(++tries<40&&BUS.ride===q){setTimeout(rs,1000);return}B.ready=1;return}if((S.bayPark||S.spawn=='office')&&garOwned('proto')&&!pv.wreck&&!(q.seat&&q.seat.v===pv)){pv.x=bayX(i);pv.z=(WBAY.z0+WBAY.z1)/2-1;pv.h=0;pv.v=0;pv.bayLock=1;pv.netSnap=1;S.bayPark=1}}catch(e){}B.ready=1};setTimeout(rs,1500)}
 /* your bay: a sign with your name */setTimeout(()=>{try{const i=bayMine(q);if(i>=0){const d=B.doors[i];const nl=pdTxt('BAY '+(i+1)+' · '+String(SV.nm||'YOU').toUpperCase().slice(0,12),3.2,.32,'#40c0ff','#0a1420');nl.position.copy(d.lab.position);nl.position.z+=.02;B.g.add(nl);d.lab.visible=false}}catch(e){}},2000)}
function bayTick(q,dt){const B=q.wbay;if(!B)return;const mine=bayMine(q),lz=P.z-q.OZ,me=q.seat&&q.seat.v;for(const d of B.doors){let want=0;const BN=d.i!==mine&&typeof bayFresh=='function'?bayFresh(q,d.i):null,ok=d.i===mine||!!(BN&&BN.tr.includes(SV.pid));if(ok){const px=me?me.x:P.x,pz=me?me.z:lz;const outside=pz>WBAY.z1&&Math.hypot(px-d.cx,pz-(WBAY.z1+2))<11,inside=Math.abs(px-d.cx)<WBAY.w/2&&pz>WBAY.z1-7&&pz<WBAY.z1+.5;const wr=q.mil&&q.mil.proto;const wrNear=d.i===mine&&wr&&!wr.wreck&&Math.hypot(wr.x-d.cx,wr.z-(WBAY.z1+3))<22&&(me===wr||(q.seat&&q.seat.v===wr));want=(outside||inside||wrNear||d.force>0)?1:0;if(d.force>0)d.force-=dt}if(BN&&BN.open)want=1;
  const pu=d.u;d.u+=(want-d.u)*Math.min(1,dt*(want?1.5:2.4));{const hh=4.5*Math.max(.06,1-d.u*.94);d.m.scale.y=hh/4.5;d.m.position.y=4.5-hh/2}if((pu<.05)!==(d.u<.05)||(pu>.9)!==(d.u>.9))try{snd(d.u>pu?520:360,.08)}catch(e){}
  const open=d.u>.85;if(open===!!d.obOn){d.obOn=!open;if(open){const k=q.obs.indexOf(d.ob);if(k>=0)q.obs.splice(k,1)}else q.obs.push(d.ob);q.obsDirty=1}d.lt.material.emissive.setHex(d.u>.5?0x20c040:0xc00000)}
 /* the Wraith in your bay: locked and protected; leaving it there is remembered */const pv=q.mil&&q.mil.proto;if(pv&&mine>=0){const inside=Math.abs(pv.x-bayX(mine))<4.2&&pv.z>WBAY.z0&&pv.z<WBAY.z1&&!pv.wreck;const empty=!(q.seat&&q.seat.v===pv);pv.bayLock=inside&&empty?1:0;const S=milSV();const was=!!S.bayPark;/* remembered until you actually drive it away (a friend joining or leaving the desert used to shuffle the bay numbers and forget it) */if(B.ready){if(inside&&empty&&!was){S.bayPark=1;milSave();hint('🔒 X-13 parked in your Wraith bay: locked, protected, and it will be here next time.')}else if(was&&!empty&&!inside){S.bayPark=0;milSave()}}}
 /* a hint the first time you walk up to the bays */if(!q.bayHint&&Math.hypot(P.x-(WBAY.x0+20),lz-(WBAY.z1+4))<14){q.bayHint=1;hint(mine>=0?'🛸 Your WRAITH BAY is BAY '+(mine+1)+': the door opens for you. Park the X-13 inside to keep it safe.':'🛸 WRAITH BAYS: private bays for X-13 owners. Pass the X-13 trials to get one.')}}
{const vd2=vehDamage;vehDamage=function(q,v,n){if(v&&v.bayLock)return;return vd2.apply(this,arguments)}}
{const vb2=vehBlow;vehBlow=function(q,v){if(v&&v.bayLock)return;return vb2.apply(this,arguments)}}
{const cb1=cwBuild;cwBuild=function(q){const r=cb1.apply(this,arguments);try{bayBuild(q)}catch(e){conLog('error','wraith bays: '+e.message)}return r}}
/* ---------- the WRAITH AUTOPILOT, with a planned route ----------
   The desert has a route grid already (the police use it); Fort Blackout sits north of it, so the base gets its own
   small grid here. Out in the desert: plan to the base gate, then through the base to the door, then in. */
const WKG={x0:213,x1:626,z0:-948,z1:-652,c:2};/* r616: the base reaches x 215 now */
function bgIn(x,z){return x>WKG.x0&&x<WKG.x1&&z>WKG.z0&&z<WKG.z1}
function bgGrid(q,skip){const W=Math.ceil((WKG.x1-WKG.x0)/WKG.c),H=Math.ceil((WKG.z1-WKG.z0)/WKG.c),g=new Uint8Array(W*H),R=bgGrid.R||3.1;const obl=q.obs.filter(o=>!(skip.includes(o)||o.off||o.dest||o.veh));/* parked and moving vehicles are in the way too */for(const w of q.vehs||[]){if(w.gone||skip.includes(w)||(q.wkAP&&q.wkAP.v===w)||(q.seat&&q.seat.v===w))continue;if(!bgIn(w.x,w.z))continue;const r=Math.max(w.K.w||2,w.K.len||4)/2;obl.push({x0:w.x-r,x1:w.x+r,z0:w.z-r,z1:w.z+r})}for(const o of obl){if(o.x1<WKG.x0-R||o.x0>WKG.x1+R||o.z1<WKG.z0-R||o.z0>WKG.z1+R)continue;const i0=Math.max(0,Math.floor((o.x0-R-WKG.x0)/WKG.c)),i1=Math.min(W-1,Math.floor((o.x1+R-WKG.x0)/WKG.c)),j0=Math.max(0,Math.floor((o.z0-R-WKG.z0)/WKG.c)),j1=Math.min(H-1,Math.floor((o.z1+R-WKG.z0)/WKG.c));for(let j=j0;j<=j1;j++)for(let k=i0;k<=i1;k++)g[j*W+k]=1}return{g,W,H}}
function bgPath(q,sx,sz,tx,tz,skip){const{g,W,H}=bgGrid(q,skip||[]);const cell=(x,z)=>{const i=Math.floor((x-WKG.x0)/WKG.c),j=Math.floor((z-WKG.z0)/WKG.c);return i<0||j<0||i>=W||j>=H?-1:j*W+i};const xz=k=>[WKG.x0+(k%W+.5)*WKG.c,WKG.z0+((k/W|0)+.5)*WKG.c];
 const free=k=>{if(k<0)return -1;if(!g[k])return k;const i0=k%W,j0=k/W|0;for(let r=1;r<6;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){const i=i0+di,j=j0+dj;if(i<0||j<0||i>=W||j>=H)continue;const n=j*W+i;if(!g[n])return n}return -1};
 const s=free(cell(sx,sz)),t=free(cell(tx,tz));if(s<0||t<0)return null;const N=W*H,gs=new Float32Array(N).fill(1e9),from=new Int32Array(N).fill(-1),done=new Uint8Array(N);const ti=t%W,tj=t/W|0,h=k=>{const di=Math.abs(k%W-ti),dj=Math.abs((k/W|0)-tj);return Math.max(di,dj)+.414*Math.min(di,dj)};
 const open=[s];gs[s]=0;const fs=new Float32Array(N).fill(1e9);fs[s]=h(s);let it=0;while(open.length&&it++<60000){let bi=0;for(let i=1;i<open.length;i++)if(fs[open[i]]<fs[open[bi]])bi=i;const k=open[bi];open[bi]=open[open.length-1];open.pop();if(k===t)break;if(done[k])continue;done[k]=1;const i0=k%W,j0=k/W|0;
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const i=i0+di,j=j0+dj;if(i<0||j<0||i>=W||j>=H)continue;const n=j*W+i;if(g[n]||done[n])continue;if(di&&dj&&(g[j0*W+i]||g[j*W+i0]))continue;const c=gs[k]+(di&&dj?1.414:1);if(c<gs[n]){gs[n]=c;from[n]=k;fs[n]=c+h(n)*1.1;open.push(n)}}}
 if(from[t]<0&&s!==t)return null;const raw=[];for(let k=t;k>=0&&raw.length<5000;k=from[k]){raw.push(xz(k));if(k===s)break}raw.reverse();raw.push([tx,tz]);
 /* straighten: keep only the corners */const los=(a,b)=>{const d=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(d/1);for(let i=1;i<n;i++){const u=i/n,k=cell(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u);if(k<0||g[k])return false}return true};const out=[raw[0]];let a=0;while(a<raw.length-1){let b=raw.length-1;while(b>a+1&&!los(raw[a],raw[b]))b--;out.push(raw[b]);a=b}return out}
const WK_GATE=[[561,-990],[561,-962],[561,-938]];
function wkPlan(q,v,T){const skip=[];try{if(q.mil&&q.mil.door&&q.mil.door.ob)skip.push(q.mil.door.ob);if(q.wbay)for(const d of q.wbay.doors)skip.push(d.ob)}catch(e){}let pts=[];
 if(!bgIn(v.x,v.z)){let dz=null;for(let tr=0;tr<2&&!dz;tr++){try{if(tr)navBuild(q);const r=navPath(q,v.x,v.z,WK_GATE[0][0],WK_GATE[0][1],1);if(r&&r.length)dz=r.map(p=>[p[0],p[1]])}catch(e){}}pts=(dz||[]).concat(WK_GATE);const b=bgPath(q,WK_GATE[2][0],WK_GATE[2][1],T.apron[0],T.apron[1],skip);pts=pts.concat(b||[T.apron])}
 else{const b=bgPath(q,v.x,v.z,T.apron[0],T.apron[1],skip);pts=b||[T.apron]}return pts.concat(T.line,[T.inside])}
wkAPStart=function(q,v){const mine=q.wbay?bayMine(q):-1;let T;if(mine>=0){const x=bayX(mine);T={nm:'your Wraith bay',apron:[x,WBAY.z1+12],line:[[x,WBAY.z1+3]],inside:[x,(WBAY.z0+WBAY.z1)/2-1],bay:mine}}else T={nm:'Hangar 1',apron:[452,-694],line:[[432,-694]],inside:[378,-694]};
 const ins=(x,z)=>T.bay!=null?Math.abs(x-T.inside[0])<4&&z>WBAY.z0&&z<WBAY.z1:hgInside(q,x,z);if(ins(v.x,v.z)){hint('🛸 You are already in '+T.nm+'.');return}
 q.wkAP={v,T,pts:wkPlan(q,v,T),k:0,stuck:0,bT:0,t:0,rq:0};snd(800,.08);setTimeout(()=>snd(1100,.08),110);hint('🛸 WRAITH AUTOPILOT: heading home to '+T.nm+'. (L again, or steer, to take over.)')};
/* something parked or driving in the way: swerve round it */
function wkAvoid(q,v){const fx=-Math.sin(v.h),fz=-Math.cos(v.h);let best=0,bd=1e9;for(const w of q.vehs||[]){if(w===v||w.gone)continue;const rx=w.x-v.x,rz=w.z-v.z,ah=rx*fx+rz*fz;if(ah<1||ah>16)continue;const lat=rx*-fz+rz*fx,rr=(Math.max(w.K.w||2,w.K.len||4)/2)+2.2;if(Math.abs(lat)>rr)continue;if(ah<bd){bd=ah;best=(lat>=0?-1:1)*Math.min(.9,(rr-Math.abs(lat))/rr+.35)}}return best}
wkAPTick=function(q,dt){const A=q.wkAP;if(!A)return;const s=q.seat;if(!s||s.v!==A.v||s.i!=0||A.v.wreck){wkAPStop(q);return}const v=A.v,T=A.T;A.t+=dt;
 if(keys.KeyW||keys.KeyS||keys.KeyA||keys.KeyD||keys.ArrowUp||keys.ArrowDown){if(A.t>1){wkAPStop(q,'🛸 Autopilot off: you took the controls.');return}}
 const P2=A.pts,n=P2.length,lastI=n-1,inI=n-1-T.line.length;/* the last few points are the run into the bay / hangar */
 if(A.k>=inI-2){if(T.bay!=null){const d=q.wbay&&q.wbay.doors[T.bay];if(d)d.force=3}else if(q.mil&&q.mil.door&&!q.mil.door.open){q.mil.door.open=1;snd(700,.15);hint('🛸 The blast door opens for the Wraith.')}}
 /* wait for the door to be fully open before driving through it */if(A.k>=inI){const open=T.bay!=null?!!(q.wbay&&q.wbay.doors[T.bay].u>.88):!!(q.mil&&q.mil.door&&q.mil.door.obOff);if(!open){v.v*=Math.max(0,1-dt*4);A.stuck=0;return}}
 const w=P2[Math.min(A.k,lastI)],dx=w[0]-v.x,dz=w[1]-v.z,d=Math.hypot(dx,dz);const final=A.k>=lastI,slow=A.k>=inI;
 if(final&&d<2.5){v.v=0;wkAPStop(q,'🛸 Parked in '+T.nm+'. Welcome home.');return}if(!final&&d<(slow?3:6)){A.k++;return}
 let max=slow?7:26;const nx=P2[Math.min(A.k+1,lastI)];if(nx&&!slow){const turn=Math.abs(wrapA(Math.atan2(-(nx[0]-w[0]),-(nx[1]-w[1]))-Math.atan2(-dx,-dz)));if(d<25&&turn>.6)max=12}
 let dh=wrapA(Math.atan2(-dx,-dz)-v.h);if(!slow)dh+=wkAvoid(q,v);let fx=Math.abs(dh)>1.0?.35:1;if(final&&d<5)fx=Math.abs(v.v)>1.2?-1:.4;
 if(A.bT<0){A.bT+=dt;v.v=Math.min(v.v,0);vehPhys(q,v,dt,-.9,-(Math.sign(dh)||1),true,false);if(A.bT>=0){A.rq++;A.pts=wkPlan(q,v,T);A.k=0}}
 else{const K0=v.K;v.K=Object.assign({},K0,{max});vehPhys(q,v,dt,fx,Math.max(-1,Math.min(1,-dh*2.2)),true,false);v.K=K0;if(fx>.3&&Math.abs(v.v)<.5){A.stuck+=dt;if(A.stuck>1.2){A.stuck=0;A.bT=-1.1}}else A.stuck=0}
 if(A.rq>6)wkAPStop(q,'🛸 Autopilot: I cannot find a way through from here. Drive it a bit closer and try again (L).')};
