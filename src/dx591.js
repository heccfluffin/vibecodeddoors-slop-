/* =====================================================================================================
   r591: THE QUARRY GROWS.
   - The tycoon computer is only in the quarry office now.
   - Buying anything BUILDS it in front of you: scaffolding goes up, the machine goes together piece by piece from
     the ground up, with sparks, dust and hammering, then the scaffolding comes down.
   - EIGHT ORE PROCESSING machines (after automation unlocks): an ore washer, a magnetic sorter, a ball mill, a coal
     preheater, a bar polisher, a diesel generator, an ore silo and an assay lab. Each one changes how the ore flows.
   - A QUARRY TUTORIAL the first time you come into the pit, with a waypoint for every step.
   ===================================================================================================== */
QT.push(
 {id:'wash',ic:'💧',nm:'Ore washer',proc:1,lv:['None','Washing trommel','Twin trommels'],cost:[0,450,1100],d:['','washed ore: 25% chance of an extra ore for every ore that reaches the bin','45% chance of an extra ore']},
 {id:'sortr',ic:'🧲',nm:'Magnetic sorter',proc:1,lv:['None','Magnetic sorter','Electro-sorter'],cost:[0,600,1500],d:['','the crew and the excavator find more silver, gold and crystal','even more of the rare ores']},
 {id:'mill',ic:'⚙️',nm:'Ball mill',proc:1,lv:['None','Ball mill','Twin ball mills'],cost:[0,700,1700],d:['','grinds ore finer: +1 bar from every furnace batch','+2 bars from every batch']},
 {id:'heat',ic:'🌡️',nm:'Coal preheater',proc:1,lv:['None','Coal preheater'],cost:[0,550],d:['','ore goes in hot: smelting takes 1 second less']},
 {id:'pol',ic:'✨',nm:'Bar polisher',proc:1,lv:['None','Polishing wheels','Mirror polisher'],cost:[0,800,2000],d:['','polished bars sell for 10% more','20% more']},
 {id:'gen',ic:'🔋',nm:'Diesel generator',proc:1,lv:['None','Diesel generator','Twin generators'],cost:[0,900,2200],d:['','every automatic machine works 25% faster','45% faster']},
 {id:'silo',ic:'🏗️',nm:'Ore silo',proc:1,lv:['None','Ore silo'],cost:[0,1000],d:['','the crew bring up 2 ore a trip instead of 1']},
 {id:'lab',ic:'🔬',nm:'Assay lab',proc:1,lv:['None','Assay lab'],cost:[0,1300],d:['','the geologists mark richer ground: more ore veins in every new mine, and more of them rich']});
for(const u of QT)QTD[u.id]=u;
/* ---------- what they do ---------- */
{const m0=qtMul;qtMul=function(){return m0()*[1,1.1,1.2][qtL('pol')]}}
{const s0=qtSmT;qtSmT=function(){return Math.max(2,s0()-(qtL('heat')?1:0))}}
function qtGenK(){return[1,1.25,1.45][qtL('gen')]}
/* every ore that lands in the smeltery bin may get washed into two */
function qtWash(k,n){const p=[0,.25,.45][qtL('wash')];let x=n;for(let i=0;i<n;i++)if(Math.random()<p)x++;return x}
/* the crew: generator speeds them up, the silo doubles each trip, the sorter shifts the odds; the washer works on everything */
{const qt0=qtTick;qtTick=function(q,dt){const b0={};for(const k in SM.bin)b0[k]=SM.bin[k]|0;const g=qtGenK(),c0=QA.ct||0;if(g>1){if(qtL('crew'))QA.ct=(QA.ct||0)+dt*(g-1);QA.kt=(QA.kt||0)+dt*(g-1);QA.st=(QA.st||0)+dt*(g-1)}
  const r=qt0.apply(this,arguments);const crew=qtL('crew')&&(QA.ct||0)<c0;let siloDone=0;
  /* whatever arrived in the bin this frame (the crew's skip, the excavator's bucket): the silo, the sorter and the washer get a go at it */
  for(const k of Object.keys(SM.bin)){let d=(SM.bin[k]|0)-(b0[k]|0);if(d<=0)continue;if(crew&&qtL('silo')&&!siloDone){siloDone=1;SM.bin[k]+=1;d+=1}
   if(qtL('sortr')&&(k=='cu'||k=='fe')&&Math.random()<[0,.3,.5][qtL('sortr')]){SM.bin[k]-=1;const up=Math.random()<.6?'ag':Math.random()<.8?'au':'cr';SM.bin[up]=(SM.bin[up]|0)+1}
   const w=qtWash(k,d)-d;if(w>0)SM.bin[k]=(SM.bin[k]|0)+w}
  try{qtTick2(q,dt)}catch(e){}return r}}
/* the minecart's load gets washed on its way to the bin too */
{const cu0=mnCartUp;mnCartUp=function(q){try{for(const k in MN.cart)MN.cart[k]=qtWash(k,MN.cart[k]|0)}catch(e){}return cu0.apply(this,arguments)}}
/* the ball mill: more bars out of each batch */
{const sa=smAct;smAct=function(q){const was=SM.st;const r=sa.apply(this,arguments);if(was=='idle'&&SM.st=='smelt'&&SM.batch&&qtL('mill'))SM.batch.n+=qtL('mill');return r}}
/* the assay lab: richer mines */
{const mg0=mnGen;mnGen=function(q,sd){const r=mg0.apply(this,arguments);try{if(qtL('lab')&&MN.cells){/* upgrade a share of the common veins to rich ones (the same for everyone in the mine: it follows the seed) */let s2=(MN.seed*9301+49297)%233280;const R=()=>(s2=(s2*9301+49297)%233280)/233280;for(const n of MN.nodes){if(n.h)continue;if((n.t=='cu'||n.t=='fe')&&R()<.35){n.t=R()<.6?'ag':'au';const O=ORE[n.t];n.g.children.forEach(m=>{if(m.material){m.material=m.material.clone();m.material.color.setHex(O.col);m.material.emissive&&m.material.emissive.setHex(O.em)}})}}}}catch(e){}return r}}
/* ---------- the machines (a row of them south of the smeltery) ---------- */
/* r618: two rows 6 m apart, facing the walkway between them (z -1462.5) */const QPOS={sortr:[-234,-1459],wash:[-228,-1459],mill:[-222,-1459],heat:[-216,-1459],pol:[-210,-1459],gen:[-228,-1466],silo:[-222,-1466],lab:[-216,-1466]};
function qtBuild2(q,G){const F=QD.F,ST=QM(0x8a8e94,{metalness:.8,roughness:.3}),DK=QM(0x2a2c30,{metalness:.5}),YL=QM(0xe8b020,{metalness:.3}),BL=QM(0x2a5a8a,{metalness:.5}),RD=QM(0xb02a1a,{metalness:.3}),GN=QM(0x3a7a3a,{metalness:.3});
 for(let i=q.obs.length-1;i>=0;i--)if(q.obs[i].qtm)q.obs.splice(i,1);q.obsDirty=1;
 /* r618: every machine is the design chat's qmMachine (row 1 mirrored so ore always goes in on the west and out on the east) */
 const mk=(id,fn)=>{const l=qtL(id);if(!l)return;const[x,z]=QPOS[id];const g=qtSec(G,id);CURG=g;try{const h=qmMachine(id,g,x,z,F,l,z>-1462?-1:1);for(const o of h.obs)q.obs.push(Object.assign({},o,{qtm:1}));QA.mpos=QA.mpos||{};QA.mpos[id]=h;
   for(const k of['wash','washP','sortD','mill','heatF','pol','gen','labD','labL'])if(h[k]!==undefined)QA[k]=h[k];if(fn)fn(h,x,z,l,g)}finally{CURG=null}};
 mk('wash');mk('sortr');mk('mill');
 mk('heat',(h,x,z)=>{/* the hot-ore pipe from the top of the preheater drum to the furnace roof */rodTo(CURG,DK,h.out[0],h.out[1],h.out[2],SM.x+1.5,F+3.3,SM.z-1.2,.1)});
 mk('pol');mk('gen');mk('silo');
 try{qtLinks(q,G)}catch(e){conLog('error','machine links: '+e.message)}
 mk('lab');if(0)((A,x,z)=>{/* a site lab: a window, a door beside it (not over it), an air conditioner, a satellite dish and an aerial */A(new THREE.BoxGeometry(3,2.4,2.6),QM(0xe8e8e0,{roughness:.8}),0,1.32,0);A(new THREE.BoxGeometry(3.2,.12,2.8),QM(0x3a6a8a),0,2.58,0);
  A(new THREE.BoxGeometry(1.2,.75,.04),new THREE.MeshStandardMaterial({color:0x335070,metalness:.4,roughness:.2,emissive:0x102030}),-.6,1.6,1.32);A(new THREE.BoxGeometry(1.32,.06,.06),QM(0x8a8a8a),-.6,1.2,1.33);
  A(new THREE.BoxGeometry(.78,1.95,.04),QM(0x6a8aa0),.85,1.1,1.32);A(new THREE.SphereGeometry(.04,8,6),QM(0xd8d8d8,{metalness:.8}),.55,1.1,1.36);A(new THREE.BoxGeometry(.9,.1,.5),QM(0x9a968c),.85,.17,1.55);
  A(new THREE.BoxGeometry(.7,.5,.4),QM(0xd0d0c8),-1.1,.55,-1.5);for(let k=0;k<4;k++)A(new THREE.BoxGeometry(.6,.03,.02),DK,-1.1,.4+k*.1,-1.71);
  const dish=A(new THREE.SphereGeometry(.4,14,8,0,Math.PI*2,0,Math.PI/2),QM(0xe0e0e0,{metalness:.5,side:THREE.DoubleSide}),-.9,2.95,-.6);dish.rotation.x=-.6;QA.labD=dish;A(new THREE.CylinderGeometry(.04,.04,.35,6),DK,-.9,2.75,-.6);A(new THREE.CylinderGeometry(.015,.015,1.2,5),DK,1.2,3.24,-1);
  const bk=A(new THREE.SphereGeometry(.07,8,6),new THREE.MeshBasicMaterial({color:0x30ff60}),1.2,3.86,-1);QA.labL=bk});
}
/* how the ore gets from machine to machine: belts for ore, a water main to the washer, power cables from the generator */
function qtLinks(q,G){const F=QD.F,L=id=>qtL(id)&&QPOS[id],g=qtSec(G,'links'),DK=QM(0x1a1a1a,{roughness:.6}),WP=QM(0x2a6a9a,{metalness:.6,roughness:.3});CURG=g;
 try{const belt=(a,b,ya,yb)=>{const dx=b[0]-a[0],dz=b[1]-a[1],d=Math.hypot(dx,dz)||1,ux=dx/d,uz=dz/d;qtBelt2(g,[a[0]+ux*1.55,F+(ya||1.05),a[1]+uz*1.55],[b[0]-ux*1.55,F+(yb||1.05),b[1]-uz*1.55],.55,1)};
  /* the ore line: (silo) -> sorter -> washer -> ball mill -> preheater (which pipes into the furnace) */const line=['sortr','wash','mill','heat'].filter(L),MP=QA.mpos||{};QA.oreB=[];const oreRide=b=>{const rk=[];for(let i=0;i<6;i++){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.1+(i%3)*.02,0),QM([0xd07a40,0x8a8a90,0x8a7458][i%3],{roughness:.8,metalness:i%3==2?0:.5}));r.visible=false;b.cv.add(r);rk.push(r)}QA.oreB.push({b,rk})};
  for(let k=1;k<line.length;k++){const A=MP[line[k-1]],B=MP[line[k]];if(A&&B)oreRide(qtBelt2(g,A.outs,B.ins,.55,1));else belt(QPOS[line[k-1]],QPOS[line[k]])}
  if(L('silo')&&line.length){const a=QPOS.silo,b=QPOS[line[0]];belt(a,b,1.4,1.05)}else if(L('silo')){belt(QPOS.silo,[SM.x-1,SM.z+1],1.4,3.3)}
  /* if the line does not end at the preheater, the last machine feeds the furnace roof by belt */if(line.length&&line[line.length-1]!='heat'){const a=QPOS[line[line.length-1]],h=MP[line[line.length-1]];oreRide(qtBelt2(g,h?h.outs:[a[0]+(SM.x-a[0])*.12,F+1.05,a[1]-1.55],[SM.x-.8,F+3.4,SM.z+1.2],.55,1))}
  /* polished bars: polisher -> grinder */if(L('pol')){qtBelt2(g,[QPOS.pol[0]-.2,F+1.0,QPOS.pol[1]+1.5],[SM.gx+.2,F+2.6,SM.gz-1.05],.5,1)}
  /* the water main for the washer: from a tank against the north wall, along the floor */if(L('wash')){const w=QPOS.wash,tx=w[0]-.8,tz=-1441.2;/* r618: in the gap between the furnace and the mold table */const t=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,2.2,16),QM(0x4a7a9a,{metalness:.5}));t.position.set(tx,F+1.1,tz);g.add(t);rodTo(g,WP,tx,F+.25,tz+.9,tx,F+.25,w[1]-1.2,.09,8);rodTo(g,WP,tx,F+.25,w[1]-1.2,w[0],F+1.8,w[1]-.2,.09,8);const lb=qtLab('WATER',1.2,.3,'#1a2a3a','#a0d8ff');lb.position.set(tx,F+1.6,tz+.91);g.add(lb)}
  /* power cables from the generator to every machine */if(L('gen')){const a=QPOS.gen;for(const id in QPOS){if(id=='gen'||!L(id))continue;const b=QPOS[id];rodTo(g,DK,a[0],F+.07,a[1],a[0],F+.07,b[1],.035,5);rodTo(g,DK,a[0],F+.07,b[1],b[0],F+.07,b[1],.035,5)}}}finally{CURG=null}}
/* their moving parts */
function qtTick2(q,dt){const t=q.rt||0,on=mnCnt(SM.bin)>0||SM.st!='idle',g=qtGenK(),near=Math.hypot(P.x+225,(P.z-q.OZ)+1455)<70;
 for(const w of QA.wash||[])w.rotation.x+=dt*(on?2.4*g:.3);if(QA.washP&&on&&near&&Math.random()<dt*8)try{vfx('splash',QA.washP[0]+(Math.random()-.5)*2,QD.F+1.7,QA.washP[1]+q.OZ,{n:2})}catch(e){}
 if(QA.sortD)QA.sortD.rotation.y+=dt*(on?5*g:.4);for(const m of QA.mill||[])m.rotation.x+=dt*(SM.st=='smelt'?3*g:.4);if(QA.heatF)QA.heatF.material.emissiveIntensity=.8+Math.sin(t*9)*.3+(SM.st=='smelt'?.8:0);
 for(const w of QA.pol||[])w.rotation.y+=dt*(mnCnt(SM.bars)||SM.grT>0?20:2);if(QA.labD)QA.labD.rotation.y+=dt*.5;if(QA.labL)QA.labL.material.color.setHex((t*2|0)%2?0x30ff60:0x0a3010);
 /* ore riding the belts between the machines while the line runs */for(const o of QA.oreB||[]){const L=o.b.L;o.rk.forEach((r,i)=>{r.visible=on;if(on){r.position.set(0,.12,-L/2+((t*.28+i/6)%1)*L);r.rotation.x+=dt*3}})}
 if(QA.gen&&near)for(const p of QA.gen)if(Math.random()<dt*2.5)try{vfx('puff',p[0],p[1],p[2]+q.OZ,{n:1,c:0x3a3a3a})}catch(e){}}
/* ---------- building it in front of you ---------- */
function qtConstruct(q,id){const g=QSEC[id];if(!g)return;const ms=[];g.traverse(o=>{if((o.isMesh||o.isSprite)&&o!==g)ms.push(o)});if(!ms.length)return;
 const wp=new THREE.Vector3(),bb=new THREE.Box3().setFromObject(g);for(const m of ms){m.getWorldPosition(wp);m.userData.by=wp.y;m.userData.s0=m.scale.clone();m.visible=false}ms.sort((a,b)=>a.userData.by-b.userData.by);
 /* scaffolding round it */const sc=new THREE.Group();q.g.add(sc);const lo=bb.min.clone(),hi=bb.max.clone();q.g.worldToLocal(lo);q.g.worldToLocal(hi);const x0=Math.min(lo.x,hi.x)-.4,x1=Math.max(lo.x,hi.x)+.4,z0=Math.min(lo.z,hi.z)-.4,z1=Math.max(lo.z,hi.z)+.4,y0=QD.F,y1=Math.max(lo.y,hi.y)+.5,PM=QM(0xd8b020,{metalness:.3}),PL=QM(0x8a6a3a);
 for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,y1-y0,6),PM);p.position.set(x,(y0+y1)/2,z);sc.add(p)}for(let y=y0+1.2;y<y1;y+=1.4)for(const[a,b,w,d]of[[(x0+x1)/2,z0,x1-x0,.25],[(x0+x1)/2,z1,x1-x0,.25]]){const pl=new THREE.Mesh(new THREE.BoxGeometry(w,.06,d),PL);pl.position.set(a,y,b);sc.add(pl)}
 hint('🏗️ The crew are building the '+QTD[id].lv[qtL(id)].toUpperCase()+'...');const T=Math.min(7,2.5+ms.length*.08);let t=0,k=0;
 const iv=setInterval(()=>{t+=.05;const want=Math.floor(ms.length*Math.min(1,t/T));while(k<want){const m=ms[k++];m.visible=true;const s0=m.userData.s0;m.scale.set(s0.x*.05,s0.y*.05,s0.z*.05);let u=0;const iv2=setInterval(()=>{u+=.16;const e=Math.min(1,u),o=1+Math.sin(e*Math.PI)*.15;m.scale.set(s0.x*e*o,s0.y*e*o,s0.z*e*o);if(u>=1){clearInterval(iv2);m.scale.copy(s0)}},30);
   if(m.isMesh&&k%3==0){m.getWorldPosition(wp);try{vfx(k%2?'spark':'dust',wp.x,wp.y,wp.z,{n:3,c:0xffd080,w:.6})}catch(e){}try{snd(k%2?1400+Math.random()*500:180,.04)}catch(e){}}}
  if(t>=T+.4){clearInterval(iv);for(const m of ms){m.visible=true;m.scale.copy(m.userData.s0)}let f=0;const iv3=setInterval(()=>{f+=.08;sc.position.y=-f*f*4;if(f>=1){clearInterval(iv3);q.g.remove(sc)}},30);snd(700,.1);setTimeout(()=>snd(1050,.14),120);hint('✅ '+QTD[id].lv[qtL(id)].toUpperCase()+' built and running.')}},50)}
/* ---------- the tutorial ---------- */
const QTUT=[
 {t:'🦺 Welcome to the OLD QUARRY. Talk to the FOREMAN outside the quarry office and take a MINING SHIFT.',wp:()=>[OFX(),-1487,'the FOREMAN'],done:()=>!!MN.job},
 {t:'⛏️ Ride the MINE CAGE down: it is under the red headframe on the pit floor.',wp:()=>[MN.ox-2.7,MN.oz,'the MINE CAGE'],done:q=>q.deep===5},
 {t:'💎 Find an ORE VEIN in the tunnel walls and swing at it (E) until the ore drops.',wp:q=>{const lz=P.z-q.OZ;let b=null,bd=1e9;for(const n of MN.nodes)if(!n.gone&&!n.h){const d=Math.hypot(n.x-P.x,n.z-lz);if(d<bd){bd=d;b=n}}return b?[b.x,b.z,'an ORE VEIN']:null},done:()=>mnCnt(MN.carry)>0||mnCnt(MN.cart)>0},
 {t:'🛒 Take it back to the MINECART in the cage and dump it in (E).',wp:()=>[MN.ox+.8,MN.oz,'the MINECART'],done:()=>mnCnt(MN.cart)>0},
 {t:'⬆️ Ride the cage back up (E in the cage). The ore goes to the SMELTERY bin.',wp:()=>[MN.ox-.8,MN.oz,'the CAGE'],done:q=>q.deep!==5&&(mnCnt(SM.bin)>0||SM.st!='idle')},
 {t:'🔥 At the SMELTERY, shovel the ore into the furnace (E).',wp:()=>[SM.x,SM.z+2.6,'the SMELTERY'],done:()=>SM.st!='idle'||mnCnt(SM.bars)>0},
 {t:'🫗 When it is molten, POUR it into the MOLDS (E), then knock the bars out (E).',wp:()=>[SM.mx,SM.mz+1.6,'the MOLDS'],done:()=>mnCnt(SM.bars)>0},
 {t:'⚙️ Feed the bars into the SELLING GRINDER (E) for gold.',wp:()=>[SM.gx,SM.gz+1.6,'the GRINDER'],done:()=>(qtS().earned|0)>(QTUT.e0|0)},
 {t:'🖥️ Spend it on the QUARRY TYCOON computer in the office: better tools, then machines that do the work for you.',wp:()=>[-130.4,-1486.7,'the TYCOON computer'],done:q=>!!q.milDlg&&document.getElementById('milDlg')&&/QUARRY TYCOON/.test(document.getElementById('milDlg').textContent)}];
function OFX(){return -125.4}
function qtTut(q){const S=qtS();if(S.tut||(S.earned|0)>=300&&!q.tutOn)return null;const lz=P.z-q.OZ;if(!q.tutOn){if(q.deep!==5&&!(P.x>-262&&P.x<-150&&lz>-1495&&lz<-1430))return null;q.tutOn=1;q.tutI=0;QTUT.e0=S.earned|0;hint('🎓 QUARRY TUTORIAL: follow the yellow waypoints. '+QTUT[0].t)}
 let st=QTUT[q.tutI];while(st&&st.done(q)){q.tutI++;st=QTUT[q.tutI];if(st){snd(900,.06);hint('🎓 '+st.t)}else{S.tut=1;try{saveGame()}catch(e){}snd(1200,.1);setTimeout(()=>snd(1600,.12),120);hint('🎓 Tutorial complete! The quarry is yours. Every machine you buy is built right here.');return null}}return st}
{const wl2=wpList;wpList=function(q){const L=wl2.apply(this,arguments);try{const st=qtTut(q);if(st&&GSET.wps){const w=st.wp(q);if(w&&isFinite(w[0])){for(const x of L)x.main=0;L.unshift({x:w[0],z:w[1],t:w[2],main:1})}}}catch(e){}return L}}
{const ru12=busRoamUpd;busRoamUpd=function(q,dt){const r=ru12.apply(this,arguments);try{if((q.tutT=(q.tutT||0)-dt)<=0){q.tutT=.5;qtTut(q)}}catch(e){}return r}}
