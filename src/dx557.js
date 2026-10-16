/* =====================================================================================================
   r557: THE COMMAND WING. Four General's offices in a new block on the base (one each in co-op). Each has a
   COMMAND TERMINAL: send a squad out on a mission. They take vehicles out of the motor pool, drive there, do the job
   (load crates, sweep the area, fire on the range, guard a site) and drive back, and you get paid when they return.
   You can follow them and watch. Generals run one squad at a time, Field Marshals two, Grand Marshals three.
   Also: the AH-4 gunship gets a proper nose and bubble canopies.
   ===================================================================================================== */
const CWB={x0:430,x1:470,z0:-860,z1:-846};
const SQN=['ALPHA','BRAVO','CHARLIE'];
const SQM=[
 {k:'convoy',nm:'Convoy run',ic:'🚚',veh:['jeep','truck','truck'],work:'loading crates',to:['Dusty Gulch station','Dusty Gulch','Goblino\'s Scrap'],pay:1.0},
 {k:'sweep',nm:'Area sweep',ic:'🔍',veh:['jeep','jeep','jeep'],work:'sweeping the area',to:['Wind farm','Solar farm','Old Quarry','Crashed plane','The Pyramid'],pay:.9},
 {k:'live',nm:'Live-fire exercise',ic:'💥',veh:['tank','tank','apc'],work:'firing on the range',to:['Speedway','Old Quarry','Meteor crater','Airfield'],pay:1.3},
 {k:'guard',nm:'Site security',ic:'🛡️',veh:['apc','jeep'],work:'guarding the site',to:['Observatory','Radio mast','Water tower','Airfield','Chapel'],pay:.8},
 {k:'salvage',nm:'Wreck recovery',ic:'🔧',veh:['truck','jeep'],work:'salvaging the wreck',to:['Crashed plane','Broken-down car','Goblino\'s Scrap'],pay:1.1}];
function cwSlot(q){/* which office is mine: by my place among the players in the desert */let ids=[SV.pid];try{const R=q.vnet&&q.vnet.rem;for(const id in R)if(Date.now()-(R[id].t||0)<8000)ids.push(id)}catch(e){}ids=[...new Set(ids)].sort();return Math.max(0,ids.indexOf(SV.pid))%4}
function cwBuild(q){if(q.cw||!q.g||!q.obs||!q.mil)return;const g=new THREE.Group();q.g.add(g);const C={g,off:[],sq:[],mis:null,rollT:0};q.cw=C;const Z=CWB,H=3.4,t=.3;
 const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.8,metalness:.1},o||{})),A=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o},BX=(w,h,d)=>new THREE.BoxGeometry(w,h,d),ob=(x0,x1,z0,z1)=>q.obs.push({x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1)});
 const CON=M(0x8a8c80),IN=M(0xc8c0a8),FL=M(0x5a3a22,{roughness:.6}),WD=M(0x4a2a14,{roughness:.5}),OL=M(0x3a4a2a),GD=M(0xd8b040,{metalness:.8,roughness:.3});
 const cx=(Z.x0+Z.x1)/2,cz=(Z.z0+Z.z1)/2,W=Z.x1-Z.x0,D=Z.z1-Z.z0;A(BX(W,.08,D),FL,cx,.04,cz);A(BX(W+.6,.3,D+.6),M(0x5a5c52),cx,H+.15,cz);
 A(BX(W,H,t),CON,cx,H/2,Z.z1);ob(Z.x0,Z.x1,Z.z1-t/2,Z.z1+t/2);A(BX(t,H,D),CON,Z.x0,H/2,cz);ob(Z.x0-t/2,Z.x0+t/2,Z.z0,Z.z1);A(BX(t,H,D),CON,Z.x1,H/2,cz);ob(Z.x1-t/2,Z.x1+t/2,Z.z0,Z.z1);
 const sg=pdTxt('COMMAND WING · GENERAL OFFICERS',9,.9,'#20261c','#e8d890');sg.position.set(cx,H+.85,Z.z0-.36);sg.rotation.y=Math.PI;g.add(sg);A(BX(9.4,1.1,.2),M(0x20261c),cx,H+.85,Z.z0-.2);
 for(let i=0;i<4;i++){const ox0=Z.x0+i*10,ox1=ox0+10,oc=ox0+5;if(i>0){A(BX(t,H,D),IN,ox0,H/2,cz);ob(ox0-t/2,ox0+t/2,Z.z0,Z.z1)}
  /* the front wall of each office: a door in the middle and a window either side */const dA=oc-.7,dB=oc+.7;A(BX(dA-ox0,H,t),CON,(ox0+dA)/2,H/2,Z.z0);ob(ox0,dA,Z.z0-t/2,Z.z0+t/2);A(BX(ox1-dB,H,t),CON,(dB+ox1)/2,H/2,Z.z0);ob(dB,ox1,Z.z0-t/2,Z.z0+t/2);A(BX(1.4,H-2.4,t),CON,oc,2.4+(H-2.4)/2,Z.z0);
  for(const sd of[-1,1])A(BX(2,1,.06),new THREE.MeshStandardMaterial({color:0x9ac0e0,transparent:true,opacity:.35}),oc+sd*3,1.7,Z.z0-.17);
  const np=pdTxt('OFFICE '+(i+1),1.6,.32,'#d8b040','#20261c');np.position.set(oc+1.3,2.1,Z.z0-.17);np.rotation.y=Math.PI;g.add(np);
  /* inside: a big desk with the command terminal, a chair, a flag, the wall map, a rug, a filing cabinet, a plant */
  A(BX(4,.05,4),M(0x6a1a1a,{roughness:.95}),oc,.09,cz);A(BX(2.6,.8,1.1),WD,oc,.4,Z.z1-2.6);ob(oc-1.3,oc+1.3,Z.z1-3.15,Z.z1-2.05);A(BX(2.7,.06,1.2),WD,oc,.82,Z.z1-2.6);
  A(BX(.7,.5,.06),M(0x1a1a1a),oc,1.15,Z.z1-2.85);const scr=pdTxt('',.62,.42,'#03140a','#40ff80');scr.position.set(oc,1.15,Z.z1-2.815);g.add(scr);A(BX(.5,.03,.18),M(0x2a2a2a),oc,.86,Z.z1-2.35);
  A(BX(.6,.5,.6),M(0x2a1a10),oc,.5,Z.z1-1.5);A(BX(.6,.7,.12),M(0x2a1a10),oc,1.0,Z.z1-1.2);
  const map=pdTxt('',3.4,2,'#c8b890','#3a2a10');map.position.set(oc,2.0,Z.z1-.17);map.rotation.y=Math.PI;g.add(map);A(BX(3.5,2.1,.04),WD,oc,2.0,Z.z1-.14);
  A(new THREE.CylinderGeometry(.03,.03,2.4,8),GD,ox0+1,1.2,Z.z1-1);const fl=A(BX(.04,.6,.9),M(0x3a4a2a),ox0+1,2.1,Z.z1-1.5);A(BX(.6,1.3,.5),M(0x5a5e64,{metalness:.6}),ox1-.6,.65,Z.z1-1);ob(ox1-.9,ox1-.3,Z.z1-1.25,Z.z1-.75);
  A(new THREE.CylinderGeometry(.22,.18,.4,10),M(0x8a5a3a),ox1-.6,.2,Z.z0+.7);A(new THREE.SphereGeometry(.35,10,8),M(0x3a7a3a),ox1-.6,.65,Z.z0+.7);
  
  const O={i,oc,scr,map,fl};C.off.push(O);
  q.props.push({x:oc,z:Z.z1-2,r:1.4,txt:()=>{const mine=cwSlot(q)===i;return mine?(milRank()>=9?'[E] 💻 COMMAND TERMINAL: send troops on a mission':'💻 Command terminal: Generals only'):'💻 This is another General\'s office'},act:()=>{if(cwSlot(q)!==i){hint('💻 Not your office. Yours is OFFICE '+(cwSlot(q)+1)+'.');return}if(milRank()<9){hint('💻 "ACCESS DENIED. GENERAL OFFICERS ONLY."');snd(180,.2);return}cwDlg(q)}})}
 q.obsDirty=1;q.mapR&&q.mapR.push({x0:Z.x0,x1:Z.x1,z0:Z.z0,z1:Z.z1,c:'#5a6a4a'});q.mapBg=null;
 let tt=0;q.anims.push({x:cx,z:cz,r:120,f:dt=>{tt+=dt;if((C.dT=(C.dT||0)-dt)>0)return;C.dT=.5;const mySlot=cwSlot(q);for(const O of C.off){O.fl.rotation.y=Math.sin(tt*1.4+O.i)*.12;const mine=O.i===mySlot;
   const c=O.scr.userData.cv,k=c.getContext('2d');k.fillStyle='#03140a';k.fillRect(0,0,c.width,c.height);k.fillStyle='#40ff80';k.font='bold 40px monospace';k.textAlign='left';
   if(mine){const act=C.sq.filter(s=>!s.done);k.fillText('COMMAND · '+(SV.nm||'GENERAL').slice(0,12).toUpperCase(),14,46);k.font='30px monospace';if(!act.length)k.fillText('NO SQUADS DEPLOYED',14,110);act.slice(0,3).forEach((s,j)=>k.fillText(s.nm+': '+s.st.toUpperCase(),14,110+j*48));if(Math.floor(tt*2)%2)k.fillText('_',14,c.height-24)}else{k.fillText('OFFICE '+(O.i+1),14,46);k.font='30px monospace';k.fillText('LOCKED',14,110)}O.scr.userData.tx.needsUpdate=true;
   /* the wall map: the desert, your squads as dots */const mc=O.map.userData.cv,mk=mc.getContext('2d');mk.fillStyle='#c8b890';mk.fillRect(0,0,mc.width,mc.height);mk.strokeStyle='#8a7a5a';mk.lineWidth=2;for(let a=1;a<8;a++){mk.beginPath();mk.moveTo(a*mc.width/8,0);mk.lineTo(a*mc.width/8,mc.height);mk.stroke()}const sx=x=>(x+640)/1280*mc.width,sz=z=>(z+1980)/1300*mc.height;mk.fillStyle='#3a5a2a';mk.fillRect(sx(300),sz(-930),sx(600)-sx(300),sz(-660)-sz(-930));mk.fillStyle='#3a2a10';mk.font='bold 22px Georgia';mk.fillText('FORT BLACKOUT',sx(330),sz(-700));
   if(mine)for(const s of C.sq){if(s.done)continue;const L=s.v[0];if(!L)continue;mk.fillStyle='#c02020';mk.beginPath();mk.arc(sx(L.v.x),sz(L.v.z),9,0,7);mk.fill();mk.fillStyle='#202020';mk.fillText(s.nm,sx(L.v.x)+12,sz(L.v.z)+6);mk.strokeStyle='#c02020';mk.setLineDash([8,6]);mk.beginPath();mk.moveTo(sx(L.v.x),sz(L.v.z));mk.lineTo(sx(s.dst.x),sz(s.dst.z));mk.stroke();mk.setLineDash([])}O.map.userData.tx.needsUpdate=true}}});
 conLog('info','Command Wing built')}
setInterval(()=>{try{const q=BUS.ride;if(q&&q.roam&&q.g&&q.obs&&q.mil&&!q.ld&&q.props&&q.anims)cwBuild(q)}catch(e){conLog('error','command wing: '+e.message)}},1500);
function cwMax(){const r=milRank();return r>=13?3:r>=11?2:1}
function cwRoll(q){const C=q.cw,L=q.locs||[];const out=[];for(let n=0;n<4;n++){for(let k=0;k<20;k++){const T=SQM[Math.random()*SQM.length|0],nm=T.to[Math.random()*T.to.length|0],loc=L.find(l=>l.nm==nm);if(!loc)continue;if(out.some(o=>o.loc===loc&&o.T===T))continue;const d=Math.hypot(loc.x-556,loc.z+940);const gold=Math.round((120+d*.35)*T.pay/10)*10,xp=Math.round(25+d*.06);out.push({T,loc,gold,xp,d});break}}C.offer=out;C.rollT=300}
function cwDlg(q){const C=q.cw;if(!C)return;if(!C.offer||C.rollT<=0)cwRoll(q);const act=C.sq.filter(s=>!s.done),free=cwMax()-act.length;
 const body='<p>'+act.length+' of '+cwMax()+' squad'+(cwMax()>1?'s':'')+' deployed'+(cwMax()<3?' (more squads at higher ranks)':'')+'. Squads take vehicles out of the motor pool, drive there, do the job and drive back: you get paid when they return. Follow them if you want to watch.</p>'+(act.length?'<p style="color:#ffd890">'+act.map(s=>'🪖 SQUAD '+s.nm+': '+s.T.nm+' at '+s.loc.nm+' · '+s.st).join('<br>')+'</p>':'')+'<p style="opacity:.75;font-size:12px">New missions come in every five minutes.</p>';
 const btns=C.offer.map((o,i)=>['m'+i,o.T.ic+' <b>'+o.T.nm.toUpperCase()+'</b> · '+o.loc.nm+' · 🪙 '+o.gold+' · '+o.xp+' XP<br><span style="font-weight:normal;font-size:12.5px;opacity:.85">'+o.T.veh.length+' vehicles ('+o.T.veh.join(', ')+') · '+Math.round(o.d)+' m out · '+o.T.work+'</span>',free<=0]);
 milDlg(q,'💻 COMMAND TERMINAL · OFFICE '+(cwSlot(q)+1),body,btns,b=>{const o=C.offer[+b.slice(1)];if(!o)return false;if(C.sq.filter(s=>!s.done).length>=cwMax()){hint('💻 All your squads are out. Wait for one to come home.');return false}C.offer.splice(+b.slice(1),1);cwSend(q,o)})}
const CWPOOL=[478,-876];
function cwSend(q,o){const C=q.cw,used=new Set(C.sq.filter(s=>!s.done).map(s=>s.nm));const nm=SQN.find(n=>!used.has(n))||'DELTA';
 const lx=o.loc.x,lz=o.loc.z,dx=561-lx,dz=-950-lz,dd=Math.hypot(dx,dz)||1;const dst={x:lx+dx/dd*16,z:lz+dz/dd*16};
 const s={nm,T:o.T,loc:o.loc,gold:o.gold,xp:o.xp,dst,st:'rolling out',ph:'out',wp:[[540,-876],[561,-890],[561,-918],[561,-950],[dst.x,dst.z]],wi:0,v:[],sol:[],t:0,done:0};
 const slot=SQN.indexOf(nm)<0?3:SQN.indexOf(nm);o.T.veh.forEach((k,i)=>{const v=q.addVeh(k,CWPOOL[0]-i*8,CWPOOL[1]-slot*7,-Math.PI/2);v.owner=SV.pid;v.mil=99;v.npc=1;v.nogar=1;v.sqd=1;for(const p of q.props)if(p.veh===v)p.txt=()=>'🪖 Squad '+nm+' ('+o.T.nm+'). They are busy.';s.v.push({v,stuck:0,bT:0})});
 C.sq.push(s);snd(600,.1);setTimeout(()=>snd(800,.1),120);hint('🪖 SQUAD '+nm+' is rolling out: '+o.T.nm+' at '+o.loc.nm+'. 🪙 '+o.gold+' when they get back.');try{sysLine('🪖 General '+(SV.nm||'')+' sent Squad '+nm+' to '+o.loc.nm)}catch(e){}}
function cwDrive(q,u,gx,gz,dt,max,dist){const v=u.v;const dx=gx-v.x,dz=gz-v.z,d=Math.hypot(dx,dz),dh=wrapA(Math.atan2(-dx,-dz)-v.h);
 if(u.bT<0){u.bT+=dt;v.K=Object.assign({},VEHK[v.k],{max:6});v.hitO=null;vehPhys(q,v,dt,-.9,Math.sign(dh)||1,true,false);return d}
 const fx=d<dist?(Math.abs(v.v)>1.5?-1:0):Math.abs(dh)>1.1?.35:1;v.K=Object.assign({},VEHK[v.k],{max:Math.min(max,VEHK[v.k].max||14)});v.hitO=null;vehPhys(q,v,dt,fx,Math.max(-1,Math.min(1,-dh*2.2)),true,false);
 if(fx>.3&&Math.abs(v.v)<.6){u.stuck+=dt;if(u.stuck>1.4){u.stuck=0;u.bT=-1.1-Math.random()*.6}}else u.stuck=0;return d}
function cwTick(q,dt){const C=q.cw;if(!C)return;if(C.rollT>0)C.rollT-=dt;const lz=P.z-q.OZ;
 for(const s of C.sq){if(s.done)continue;s.t+=dt;const lead=s.v[0];
  if(s.v.some(u=>u.v.wreck)){s.done=1;s.st='lost';hint('💥 SQUAD '+s.nm+' took losses and is out of action. Mission failed.');setTimeout(()=>{for(const u of s.v)try{garRemove(q,u.v)}catch(e){}for(const m of s.sol)if(m.parent)m.parent.remove(m)},8000);continue}
  if(s.ph=='out'||s.ph=='back'){const w=s.wp[s.wi];const far=Math.hypot(P.x-lead.v.x,lz-lead.v.z)>160;
   const d=cwDrive(q,lead,w[0],w[1],dt,16,0);/* the rest follow in a line */cwTrailRec(s);s.v.forEach((u,i)=>{if(!i)return;const pv=s.v[i-1].v;const tp=cwTrailPt(s,i);const bx=tp?tp[0]:pv.x+Math.sin(pv.h)*8,bz=tp?tp[1]:pv.z+Math.cos(pv.h)*8;cwDrive(q,u,bx,bz,dt,18,tp?1.5:3.5)});
   /* nobody watching and stuck? they get on with it */if(far&&(lead.stuck>.8||lead.bT<0)){const st=Math.min(25,d);const ux=(w[0]-lead.v.x)/(d||1),uz=(w[1]-lead.v.z)/(d||1);s.v.forEach((u,i)=>{u.v.x+=ux*st;u.v.z+=uz*st;u.v.h=Math.atan2(-ux,-uz);u.stuck=0;u.bT=0})}
   if(far&&s.v.some((u,i)=>i&&Math.hypot(u.v.x-lead.v.x,u.v.z-lead.v.z)>40)){s.v.forEach((u,i)=>{if(!i)return;u.v.x=lead.v.x+Math.sin(lead.v.h)*8*i;u.v.z=lead.v.z+Math.cos(lead.v.h)*8*i;u.v.h=lead.v.h})}
   if(d<(s.wi==s.wp.length-1?10:7)){s.wi++;if(s.wi>=s.wp.length){if(s.ph=='out'){s.ph='work';s.wt=0;s.st=s.T.work;hint('📻 SQUAD '+s.nm+': "On site at '+s.loc.nm+'. '+s.T.work[0].toUpperCase()+s.T.work.slice(1)+'."');cwWorkStart(q,s)}else{s.done=1;s.st='home';cwPay(q,s)}}}
   if(s.ph=='out'||s.ph=='back')s.st=s.ph=='out'?'en route to '+s.loc.nm:'heading home';if(s.t>600&&s.ph=='back'){s.done=1;cwPay(q,s)}continue}
  if(s.ph=='work'){s.wt+=dt;for(const u of s.v){u.v.v*=Math.max(0,1-dt*3)}cwWorkTick(q,s,dt);if(s.wt>28){cwWorkEnd(q,s);s.ph='back';s.wi=0;s.wp=[[561,-950],[561,-918],[561,-890],[540,-876],[CWPOOL[0],CWPOOL[1]]];hint('📻 SQUAD '+s.nm+': "Job done. Heading home."')}}}}
function cwWorkStart(q,s){const L=s.v[0].v;s.sol=[];s.props=[];for(let i=0;i<4;i++){const m=mkSoldier(0);const a=i/4*6.283;m.position.set(L.x+Math.cos(a)*4,.9,L.z+Math.sin(a)*4);q.g.add(m);m.userData.a=a;s.sol.push(m)}
 if(s.T.k=='convoy'||s.T.k=='salvage'){for(let i=0;i<4;i++){try{const c=supCrate();c.position.set(s.dst.x+6+i*1.2,.3,s.dst.z+3);q.g.add(c);s.props.push(c)}catch(e){}}}}
function cwWorkTick(q,s,dt){const L=s.v[0].v,t=s.wt;s.sol.forEach((m,i)=>{let tx,tz;
  if(s.T.k=='convoy'||s.T.k=='salvage'){/* carry the crates from the pile to the trucks */const c=s.props[i];const tr=s.v[Math.min(s.v.length-1,1)].v;const ph=(t*.25+i*.25)%1;const ax=s.dst.x+6+i*1.2,az=s.dst.z+3,bx=tr.x+Math.sin(tr.h)*2.6,bz=tr.z+Math.cos(tr.h)*2.6;const f=ph<.5?ph*2:2-ph*2;tx=ax+(bx-ax)*f;tz=az+(bz-az)*f;if(c){c.visible=!(t>20&&ph>.45);c.position.set(m.position.x,ph<.5?.3:1.3,m.position.z+.4)}}
  else if(s.T.k=='sweep'){const a=m.userData.a+t*.25;tx=L.x+Math.cos(a)*14;tz=L.z+Math.sin(a)*14}
  else if(s.T.k=='guard'){const a=m.userData.a;tx=L.x+Math.cos(a)*9;tz=L.z+Math.sin(a)*9;m.rotation.y=-a-Math.PI/2+Math.sin(t*.6+i)*.6}
  else{tx=L.x+Math.cos(m.userData.a)*5;tz=L.z+Math.sin(m.userData.a)*5}
  const dx=tx-m.position.x,dz=tz-m.position.z,d=Math.hypot(dx,dz);if(d>.2){const sp=Math.min(d,3.2*dt);m.position.x+=dx/d*sp;m.position.z+=dz/d*sp;m.rotation.y=Math.atan2(dx,dz);try{seekRunOn(m,dt)}catch(e){}}});
 if(s.T.k=='live'){for(const u of s.v){const v=u.v;if(!v.K.tank||!v.m.userData.tur)continue;u.fc=(u.fc||2+Math.random()*2)-dt;if(u.fc<=0){u.fc=3+Math.random()*2;const T={x:v.x-Math.sin(v.h)*70+(Math.random()-.5)*20,y:0,z:v.z-Math.cos(v.h)*70+(Math.random()-.5)*20};try{btShootShell(q,v,T,.02)}catch(e){}}}}}
function cwWorkEnd(q,s){for(const m of s.sol)if(m.parent)m.parent.remove(m);for(const c of s.props||[])if(c.parent)c.parent.remove(c);s.sol=[];s.props=[]}
function cwPay(q,s){gold+=s.gold;try{saveGame();updHud()}catch(e){}try{milXP(q,s.xp,'Squad '+s.nm+': '+s.T.nm)}catch(e){}snd(1500,.08);setTimeout(()=>snd(1900,.1),100);hint('🪙 SQUAD '+s.nm+' is home from '+s.loc.nm+'. +'+s.gold+' GOLD.');for(const u of s.v)try{garRemove(q,u.v)}catch(e){}}
{let last=performance.now();const tick=()=>{requestAnimationFrame(tick);const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;try{const q=BUS.ride;if(state=='bus'&&q&&q.roam&&q.cw)cwTick(q,dt)}catch(e){conLog('error','squads: '+e.message)}};requestAnimationFrame(tick)}
/* a waypoint to your office when you first make General */
{const w0=milRZWay;milRZWay=function(q){const r=w0.apply(this,arguments);if(r)return r;try{const S=milSV();if(milRank()>=9&&!S.cwSeen&&q.cw){const lz=P.z-q.OZ,i=cwSlot(q),x=CWB.x0+i*10+5;if(Math.hypot(P.x-x,lz-(CWB.z1-2))<3){S.cwSeen=1;milSave();hint('💻 Your office, General. The COMMAND TERMINAL sends squads out on missions.')}else return[x,CWB.z1-2,'YOUR OFFICE (Command Wing)']}}catch(e){}return null}}
/* AI drivers (squads, backup units, the militia) do not wreck themselves by bumping into cacti: crash damage is off while they drive */
let AIDRV=0;{const vd0=vehDamage;vehDamage=function(q,v,n){if(AIDRV&&v&&(v.sqd||v.pdU||v.bt))return;return vd0.apply(this,arguments)}}
{const c0=cwDrive;cwDrive=function(){AIDRV=1;try{return c0.apply(this,arguments)}finally{AIDRV=0}}}
{const p0=pdUnitsTick;pdUnitsTick=function(){AIDRV=1;try{return p0.apply(this,arguments)}finally{AIDRV=0}}}
{const b0=btTick;btTick=function(){AIDRV=1;try{return b0.apply(this,arguments)}finally{AIDRV=0}}}
