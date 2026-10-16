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
const QPOS={sortr:[-233,-1456],wash:[-228.5,-1456],mill:[-224,-1456],heat:[-219.5,-1456],pol:[-214.5,-1453],gen:[-228.5,-1462],silo:[-224,-1462],lab:[-219.5,-1462]};
function qtBuild2(q,G){const F=QD.F,ST=QM(0x8a8e94,{metalness:.8,roughness:.3}),DK=QM(0x2a2c30,{metalness:.5}),YL=QM(0xe8b020,{metalness:.3}),BL=QM(0x2a5a8a,{metalness:.5}),RD=QM(0xb02a1a,{metalness:.3}),GN=QM(0x3a7a3a,{metalness:.3});
 for(let i=q.obs.length-1;i>=0;i--)if(q.obs[i].qtm)q.obs.splice(i,1);q.obsDirty=1;
 const mk=(id,fn)=>{const l=qtL(id);if(!l)return;const[x,z]=QPOS[id];const g=qtSec(G,id);const A=(geo,m,px,py,pz)=>{const o=new THREE.Mesh(geo,m);o.position.set(x+px,F+py,z+pz);g.add(o);return o};CURG=g;try{fn(A,x,z,l,g)}finally{CURG=null}
  /* a concrete pad and a name plate */A(new THREE.BoxGeometry(3.6,.12,3.6),QM(0x9a968c,{roughness:1}),0,.06,0);const lb=qtLab(QTD[id].lv[l].toUpperCase(),2.2,.3,'#1a1a1a','#e8c020');lb.position.set(x,F+.45,z+1.82);g.add(lb);q.obs.push({x0:x-1.5,x1:x+1.5,z0:z-1.5,z1:z+1.5,qtm:1})};
 const leg=(A,x,z,h,c)=>A(new THREE.BoxGeometry(.14,h,.14),c||DK,x,h/2+.12,z),bolt=(A,x,y,z)=>A(new THREE.CylinderGeometry(.035,.035,.03,6),ST,x,y,z);
 mk('wash',(A,x,z,l)=>{/* trommels: perforated drums on roller frames over a settling tank; spray bar on top; outlet chute */QA.wash=[];const zs=l>1?[-.8,.8]:[0];
  A(new THREE.BoxGeometry(3,.36,zs.length>1?3:1.7),QM(0x3a4a52,{metalness:.5}),0,.3,0);A(new THREE.BoxGeometry(2.8,.04,zs.length>1?2.8:1.5),QM(0x2a6a8a,{metalness:.3,roughness:.1,transparent:true,opacity:.85}),0,.47,0);
  for(const dz of zs){const tr=new THREE.Group();tr.position.set(x,F+1.15,z+dz);CURG.add(tr);const d=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,2.4,18,1,true),QM(0x6a7078,{metalness:.6,side:THREE.DoubleSide}));d.rotation.z=Math.PI/2;tr.add(d);for(const e of[-1.15,-.4,.4,1.15]){const rg=new THREE.Mesh(new THREE.TorusGeometry(.51,.045,6,20),DK);rg.rotation.y=Math.PI/2;rg.position.x=e;tr.add(rg)}for(let h=0;h<10;h++){const st=new THREE.Mesh(new THREE.BoxGeometry(2.3,.03,.05),QM(0x4a4e54,{metalness:.6}));const a=h/10*Math.PI*2;st.position.set(0,Math.cos(a)*.49,Math.sin(a)*.49);st.rotation.x=-a;tr.add(st)}QA.wash.push(tr);
   for(const sx of[-1.05,1.05]){for(const sz of[-.38,.38]){const rl=A(new THREE.CylinderGeometry(.09,.09,.16,10),ST,sx,.64,dz+sz);rl.rotation.z=Math.PI/2}A(new THREE.BoxGeometry(.12,.3,1),DK,sx,.6,dz)}
   A(new THREE.CylinderGeometry(.05,.05,2.5,8),QM(0x2a6a9a,{metalness:.6}),0,1.82,dz).rotation.z=Math.PI/2;for(let n=-1;n<=1;n++)A(new THREE.ConeGeometry(.05,.1,6),ST,n*.8,1.74,dz).rotation.x=Math.PI}
  const ch=A(new THREE.BoxGeometry(.6,.06,.7),ST,1.55,.85,0);ch.rotation.z=-.4;QA.washP=[x,z]});
 mk('sortr',(A,x,z,l)=>{/* a feed hopper onto a short belt, a big red magnet drum at the head, chutes into three bins */A(new THREE.BoxGeometry(2.6,.12,1.1),DK,0,.84,0);for(const sx of[-1.15,1.15])for(const sz of[-.45,.45])leg(A,sx,sz,.72);
  const b=new THREE.Mesh(new THREE.BoxGeometry(2.1,.06,.8),QM(0x232323));b.position.set(x-.2,F+.95,z);CURG.add(b);const hp=A(new THREE.CylinderGeometry(.55,.2,.6,4,1,true),QM(0x6a7078,{metalness:.6,side:THREE.DoubleSide}),-1,1.35,0);hp.rotation.y=Math.PI/4;
  const dr=A(new THREE.CylinderGeometry(.42,.42,1,18),QM(0xc02020,{metalness:.5}),.95,1.38,0);dr.rotation.x=Math.PI/2;QA.sortD=dr;for(const sz of[-.55,.55]){A(new THREE.BoxGeometry(.18,.9,.08),DK,.95,1.05,sz);A(new THREE.CylinderGeometry(.12,.12,.06,12),ST,.95,1.38,sz*1.05).rotation.x=Math.PI/2}
  A(new THREE.BoxGeometry(.4,.3,.3),BL,.95,1.15,-.8);for(const[px,c]of[[-.9,0xd07a40],[0,0x8a8a90],[.9,0xe0e4ea]]){A(new THREE.BoxGeometry(.72,.55,.62),QM(0x4a4e54,{metalness:.5}),px,.4,1.32);A(new THREE.DodecahedronGeometry(.2,0),QM(c,{metalness:.7}),px,.72,1.32)}
  if(l>1){A(new THREE.BoxGeometry(.5,.9,.5),BL,-1.4,.57,-.75);A(new THREE.SphereGeometry(.06,8,6),new THREE.MeshBasicMaterial({color:0x60c0ff}),-1.4,1.06,-.75)}});
 mk('mill',(A,x,z,l)=>{/* ball mills on bearing pedestals, girth gear, a pinion and motor, feed chute in, discharge trunnion out */QA.mill=[];const zs=l>1?[-.85,.85]:[0];for(const dz of zs){const m=new THREE.Group();m.position.set(x,F+1.2,z+dz);CURG.add(m);const c=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,2,20),QM(0x5a6a7a,{metalness:.6}));c.rotation.z=Math.PI/2;m.add(c);for(const e of[-1.06,1.06]){const cap=new THREE.Mesh(new THREE.CylinderGeometry(.6,.25,.14,20),QM(0x4a5a6a,{metalness:.6}));cap.rotation.z=e>0?-Math.PI/2:Math.PI/2;cap.position.x=e;m.add(cap)}
   const gr=new THREE.Mesh(new THREE.TorusGeometry(.64,.07,6,28),YL);gr.rotation.y=Math.PI/2;gr.position.x=.45;m.add(gr);for(let b2=0;b2<8;b2++){const bt=new THREE.Mesh(new THREE.BoxGeometry(.04,.04,.04),ST);const a=b2/8*Math.PI*2;bt.position.set(-.3,Math.cos(a)*.6,Math.sin(a)*.6);m.add(bt)}QA.mill.push(m);
   for(const sx of[-1.25,1.25]){A(new THREE.BoxGeometry(.4,.75,.5),DK,sx,.5,dz);A(new THREE.CylinderGeometry(.22,.22,.36,12),ST,sx,.95,dz).rotation.z=Math.PI/2}A(new THREE.BoxGeometry(.5,.4,.45),BL,.45,.32,dz+(dz?Math.sign(dz)*.6:.75));A(new THREE.CylinderGeometry(.15,.15,.18,12),YL,.45,.6,dz+(dz?Math.sign(dz)*.6:.75)).rotation.x=Math.PI/2}
  const fc=A(new THREE.BoxGeometry(.4,.06,.5),ST,-1.6,1.55,0);fc.rotation.z=.5});
 mk('heat',(A,x,z)=>{/* a riveted preheater drum on legs, coal firebox with a glowing door, a stack, a gauge, a hot-ore pipe up to the furnace roof */for(const[sx,sz]of[[-.95,-.55],[.15,-.55],[-.95,.55],[.15,.55]])leg(A,sx,sz,.5);
  A(new THREE.CylinderGeometry(.85,.85,2.2,18),QM(0x3a3a3a,{metalness:.6}),-.4,1.72,0);for(const y of[.9,1.7,2.5])A(new THREE.TorusGeometry(.86,.035,6,24),DK,-.4,y,0).rotation.x=Math.PI/2;A(new THREE.ConeGeometry(.85,.6,18),QM(0x3a3a3a,{metalness:.6}),-.4,3.12,0);
  const fb=A(new THREE.BoxGeometry(.6,.45,.05),new THREE.MeshStandardMaterial({color:0x200800,emissive:0xff5010,emissiveIntensity:1}),-.4,1.0,.87);QA.heatF=fb;A(new THREE.BoxGeometry(.72,.57,.03),DK,-.4,1.0,.85);
  A(new THREE.CylinderGeometry(.12,.14,3.2,10),DK,.95,1.72,-.3);A(new THREE.CylinderGeometry(.18,.18,.08,10),DK,.95,3.36,-.3);const gg=A(new THREE.CylinderGeometry(.12,.12,.04,14),new THREE.MeshBasicMaterial({color:0xf0f0e8}),-.4,1.9,.87);gg.rotation.x=Math.PI/2;
  rodTo(CURG,DK,x-.4,F+3.4,z,SM.x+1.5,F+3.3,SM.z-1.2,.1);for(let i=0;i<6;i++)A(new THREE.DodecahedronGeometry(.16,0),QM(0x111111,{roughness:1}),.6+Math.random()*.7,.2,.95+Math.random()*.5)});
 mk('pol',(A,x,z,l)=>{/* a bench with guarded polishing wheels on a shared shaft, a motor at the end, a tray of shining bars */A(new THREE.BoxGeometry(2.4,.12,1.1),QM(0x4a4e54,{metalness:.5}),0,.86,0);for(const sx of[-1.1,1.1])for(const sz of[-.45,.45])leg(A,sx,sz,.74);
  A(new THREE.CylinderGeometry(.04,.04,2.2,8),ST,0,1.25,0).rotation.z=Math.PI/2;QA.pol=[];for(let i=0;i<l+1;i++){const px=-.7+i*.7;const w=A(new THREE.CylinderGeometry(.3,.3,.1,20),QM(0xe8e8f0,{metalness:.9,roughness:.1}),px,1.25,0);w.rotation.z=Math.PI/2;QA.pol.push(w);const gd=A(new THREE.CylinderGeometry(.36,.36,.16,20,1,true,0,Math.PI),QM(0x3a6a2a,{metalness:.4,side:THREE.DoubleSide}),px,1.25,0);gd.rotation.z=Math.PI/2}
  A(new THREE.CylinderGeometry(.2,.2,.45,12),BL,1.2,1.25,0).rotation.z=Math.PI/2;A(new THREE.BoxGeometry(.8,.06,.4),QM(0x6a4a2a),-.2,.95,.33);for(let i=0;i<3;i++)A(new THREE.BoxGeometry(.18,.08,.32),QM(0xf0d050,{metalness:.95,roughness:.08}),-.45+i*.22,1.02,.33)});
 mk('gen',(A,x,z,l)=>{/* diesel gensets on skids: louvred housing, exhaust with a rain cap, a fuel tank, a control panel on the end */QA.gen=[];const zs=l>1?[-.85,.85]:[0];for(const dz of zs){A(new THREE.BoxGeometry(2.7,.14,1.0),DK,0,.19,dz);A(new THREE.BoxGeometry(2.5,1.1,.9),GN,0,.81,dz);A(new THREE.BoxGeometry(2.56,.06,.96),DK,0,1.39,dz);
   for(let k=0;k<7;k++){const lv=A(new THREE.BoxGeometry(.05,.5,.02),DK,-1.05+k*.12,.85,dz+.46);lv.rotation.y=.5}A(new THREE.BoxGeometry(.04,.55,.6),QM(0xe8e0d0),1.27,.85,dz);A(new THREE.SphereGeometry(.035,8,6),new THREE.MeshBasicMaterial({color:0x30ff60}),1.3,1.0,dz+.18);
   A(new THREE.CylinderGeometry(.07,.07,.6,8),DK,.8,1.72,dz-.2);A(new THREE.CylinderGeometry(.13,.13,.04,8),DK,.8,2.04,dz-.2);QA.gen.push([x+.8,F+2.1,z+dz-.2])}
  A(new THREE.CylinderGeometry(.35,.35,1.2,14),RD,-.4,.5,zs.length>1?0:-1.05).rotation.z=Math.PI/2});
 mk('silo',(A,x,z)=>{/* an ore silo on a braced steel stand, a discharge gate and spout, a caged ladder, a railing round the roof */for(const[sx,sz]of[[-.85,-.85],[.85,-.85],[-.85,.85],[.85,.85]])A(new THREE.BoxGeometry(.16,2.2,.16),DK,sx,1.22,sz);for(const[a,b,c,d2]of[[-.85,-.85,.85,-.85],[-.85,.85,.85,.85],[-.85,-.85,-.85,.85],[.85,-.85,.85,.85]])rodTo(CURG,DK,x+a,F+.3,z+b,x+c,F+1.9,z+d2,.04);
  A(new THREE.ConeGeometry(1.1,1,18),QM(0xb8bcc0,{metalness:.7}),0,1.85,0).rotation.x=Math.PI;A(new THREE.BoxGeometry(.4,.3,.4),DK,0,1.25,0);A(new THREE.CylinderGeometry(1.2,1.2,3,20),QM(0xb8bcc0,{metalness:.7,roughness:.35}),0,3.85,0);A(new THREE.ConeGeometry(1.2,.8,20),QM(0xb8bcc0,{metalness:.7,roughness:.35}),0,5.75,0);
  for(const y of[2.7,3.85,5])A(new THREE.TorusGeometry(1.22,.04,6,24),DK,0,y,0).rotation.x=Math.PI/2;for(const sd of[-.2,.2])A(new THREE.BoxGeometry(.04,5,.04),YL,1.28,3,sd);for(let y=.6;y<5.3;y+=.35)A(new THREE.BoxGeometry(.04,.04,.4),YL,1.28,y,0);
  A(new THREE.TorusGeometry(.7,.03,6,20),YL,0,6.1,0).rotation.x=Math.PI/2;for(let k=0;k<6;k++){const a=k/6*6.283;A(new THREE.BoxGeometry(.03,.4,.03),YL,Math.cos(a)*.7,5.92,Math.sin(a)*.7)}});
 try{qtLinks(q,G)}catch(e){conLog('error','machine links: '+e.message)}
 mk('lab',(A,x,z)=>{/* a site lab: a window, a door beside it (not over it), an air conditioner, a satellite dish and an aerial */A(new THREE.BoxGeometry(3,2.4,2.6),QM(0xe8e8e0,{roughness:.8}),0,1.32,0);A(new THREE.BoxGeometry(3.2,.12,2.8),QM(0x3a6a8a),0,2.58,0);
  A(new THREE.BoxGeometry(1.2,.75,.04),new THREE.MeshStandardMaterial({color:0x335070,metalness:.4,roughness:.2,emissive:0x102030}),-.6,1.6,1.32);A(new THREE.BoxGeometry(1.32,.06,.06),QM(0x8a8a8a),-.6,1.2,1.33);
  A(new THREE.BoxGeometry(.78,1.95,.04),QM(0x6a8aa0),.85,1.1,1.32);A(new THREE.SphereGeometry(.04,8,6),QM(0xd8d8d8,{metalness:.8}),.55,1.1,1.36);A(new THREE.BoxGeometry(.9,.1,.5),QM(0x9a968c),.85,.17,1.55);
  A(new THREE.BoxGeometry(.7,.5,.4),QM(0xd0d0c8),-1.1,.55,-1.5);for(let k=0;k<4;k++)A(new THREE.BoxGeometry(.6,.03,.02),DK,-1.1,.4+k*.1,-1.71);
  const dish=A(new THREE.SphereGeometry(.4,14,8,0,Math.PI*2,0,Math.PI/2),QM(0xe0e0e0,{metalness:.5,side:THREE.DoubleSide}),-.9,2.95,-.6);dish.rotation.x=-.6;QA.labD=dish;A(new THREE.CylinderGeometry(.04,.04,.35,6),DK,-.9,2.75,-.6);A(new THREE.CylinderGeometry(.015,.015,1.2,5),DK,1.2,3.24,-1);
  const bk=A(new THREE.SphereGeometry(.07,8,6),new THREE.MeshBasicMaterial({color:0x30ff60}),1.2,3.86,-1);QA.labL=bk});
}
/* how the ore gets from machine to machine: belts for ore, a water main to the washer, power cables from the generator */
function qtLinks(q,G){const F=QD.F,L=id=>qtL(id)&&QPOS[id],g=qtSec(G,'links'),DK=QM(0x1a1a1a,{roughness:.6}),WP=QM(0x2a6a9a,{metalness:.6,roughness:.3});CURG=g;
 try{const belt=(a,b,ya,yb)=>{const dx=b[0]-a[0],dz=b[1]-a[1],d=Math.hypot(dx,dz)||1,ux=dx/d,uz=dz/d;qtBelt2(g,[a[0]+ux*1.55,F+(ya||1.05),a[1]+uz*1.55],[b[0]-ux*1.55,F+(yb||1.05),b[1]-uz*1.55],.55,1)};
  /* the ore line: (silo) -> sorter -> washer -> ball mill -> preheater (which pipes into the furnace) */const line=['sortr','wash','mill','heat'].filter(L);for(let k=1;k<line.length;k++)belt(QPOS[line[k-1]],QPOS[line[k]]);
  if(L('silo')&&line.length){const a=QPOS.silo,b=QPOS[line[0]];belt(a,b,1.4,1.05)}else if(L('silo')){belt(QPOS.silo,[SM.x-1,SM.z+1],1.4,3.3)}
  /* if the line does not end at the preheater, the last machine feeds the furnace roof by belt */if(line.length&&line[line.length-1]!='heat'){const a=QPOS[line[line.length-1]];qtBelt2(g,[a[0]+(SM.x-a[0])*.12,F+1.05,a[1]-1.55],[SM.x-.8,F+3.4,SM.z+1.2],.55,1)}
  /* polished bars: polisher -> grinder */if(L('pol')){qtBelt2(g,[QPOS.pol[0]-.2,F+1.0,QPOS.pol[1]+1.5],[SM.gx+.2,F+2.6,SM.gz-1.05],.5,1)}
  /* the water main for the washer: from a tank against the north wall, along the floor */if(L('wash')){const w=QPOS.wash,tx=w[0]+.5,tz=-1441.2;const t=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,2.2,16),QM(0x4a7a9a,{metalness:.5}));t.position.set(tx,F+1.1,tz);g.add(t);rodTo(g,WP,tx,F+.25,tz+.9,tx,F+.25,w[1]-1.2,.09,8);rodTo(g,WP,tx,F+.25,w[1]-1.2,w[0],F+1.8,w[1]-.2,.09,8);const lb=qtLab('WATER',1.2,.3,'#1a2a3a','#a0d8ff');lb.position.set(tx,F+1.6,tz+.91);g.add(lb)}
  /* power cables from the generator to every machine */if(L('gen')){const a=QPOS.gen;for(const id in QPOS){if(id=='gen'||!L(id))continue;const b=QPOS[id];rodTo(g,DK,a[0],F+.07,a[1],a[0],F+.07,b[1],.035,5);rodTo(g,DK,a[0],F+.07,b[1],b[0],F+.07,b[1],.035,5)}}}finally{CURG=null}}
/* their moving parts */
function qtTick2(q,dt){const t=q.rt||0,on=mnCnt(SM.bin)>0||SM.st!='idle',g=qtGenK(),near=Math.hypot(P.x+225,(P.z-q.OZ)+1455)<70;
 for(const w of QA.wash||[])w.rotation.x+=dt*(on?2.4*g:.3);if(QA.washP&&on&&near&&Math.random()<dt*8)try{vfx('splash',QA.washP[0]+(Math.random()-.5)*2,QD.F+1.7,QA.washP[1]+q.OZ,{n:2})}catch(e){}
 if(QA.sortD)QA.sortD.rotation.y+=dt*(on?5*g:.4);for(const m of QA.mill||[])m.rotation.x+=dt*(SM.st=='smelt'?3*g:.4);if(QA.heatF)QA.heatF.material.emissiveIntensity=.8+Math.sin(t*9)*.3+(SM.st=='smelt'?.8:0);
 for(const w of QA.pol||[])w.rotation.y+=dt*(mnCnt(SM.bars)||SM.grT>0?20:2);if(QA.labD)QA.labD.rotation.y+=dt*.5;if(QA.labL)QA.labL.material.color.setHex((t*2|0)%2?0x30ff60:0x0a3010);
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
