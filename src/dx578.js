/* =====================================================================================================
   r578: THE WRAITH IS YOURS.
   - Owner lock: an X-13 only lets its owner drive. Anyone else can ride in the gunner seat, and only while the owner
     is at the wheel.
   - Wraith bays: the door opens when your Wraith rolls up, closes behind you quickly, and opens from the inside when
     you walk up to it. Each bay has a SECURITY PANEL (trust list) and two ceiling turrets: anyone you have not
     trusted who gets into your bay is zapped and thrown out.
   - Refits are real challenges now. The crew bolt on a PROTOTYPE part, then you have to prove it in a test built for
     that part. Pass and it is yours for good; fail and it comes off again.
   ===================================================================================================== */
const WKTRY={ref:0};
{const wm0=wkMine;wkMine=function(){const b=wm0.apply(this,arguments);return WKTRY.ref>b?WKTRY.ref:b}}
/* ---------- owner lock ---------- */
function wkOwner(q){return garOwned('proto')||!!(q&&q.mil&&q.mil.auth)||!!(q&&q.mil&&q.mil.op&&/^(trials|refit)/.test(q.mil.op.D&&q.mil.op.D.id||''))}
{const ve1=vehEnter;vehEnter=function(q,v,i){try{if(v&&v.K&&v.K.proto&&!q.seat&&!wkOwner(q)){const drv=v.occ&&v.occ[0];if(!drv||drv===SV.pid){hint('🔒 The X-13 is LOCKED. Only its owner can drive it. When they are at the wheel you can ride in the gunner seat.');snd(180,.12);return}
   let k=-1;for(let j=1;j<v.occ.length;j++)if(!v.occ[j]){k=j;break}if(k<0){hint('🔒 The X-13 is full.');return}return ve1.call(this,q,v,k)}}catch(e){}return ve1.apply(this,arguments)}}
/* ---------- bays: who owns which, and who they trust (shared with the other players out here) ---------- */
function btrList(){const S=milSV();if(!Array.isArray(S.btr))S.btr=[];return S.btr}
function btrHas(id){return btrList().some(t=>t.id===id)}
function bayFresh(q,i){const b=q.bayNet&&q.bayNet[i];return b&&Date.now()-b.t<9000?b:null}
setInterval(()=>{try{const q=BUS.ride;if(!q||!q.roam||!q.wbay)return;const i=bayMine(q);if(i<0)return;const d=q.wbay.doors[i];xmNet(q,'bay',{i,nm:String(SV.nm||'Player').slice(0,16),tr:btrList().map(t=>t.id).slice(0,20),open:d&&d.u>.5?1:0})}catch(e){}},2500);
XM.net.bay=(o,id)=>{try{const q=BUS.ride;if(!q)return;const i=o.i|0;if(i<0||i>=WBAY.n)return;(q.bayNet=q.bayNet||{})[i]={id,nm:fsName(String(o.nm||''))||'Player',tr:Array.isArray(o.tr)?o.tr.map(String).slice(0,20):[],open:o.open?1:0,t:Date.now()};
  const d=q.wbay&&q.wbay.doors[i];if(d&&d.lab&&d.nlab!==q.bayNet[i].nm){d.nlab=q.bayNet[i].nm;try{const nl=pdTxt('BAY '+(i+1)+' · '+d.nlab.toUpperCase().slice(0,12),3.2,.32,'#d8b040','#20261c');nl.position.copy(d.lab.position);nl.position.z+=.02;if(d.nlM&&d.nlM.parent)d.nlM.parent.remove(d.nlM);q.wbay.g.add(nl);d.nlM=nl;d.lab.visible=false}catch(e){}}}catch(e){}};
/* turrets in every bay, and the security panel in yours */
function bayDefBuild(q){const B=q.wbay;if(!B||B.def)return;B.def=1;const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.5,metalness:.6},o||{}));const H=5.2;
 for(const d of B.doors){d.tur=[];for(const sd of[-1,1]){const g=new THREE.Group();g.position.set(d.cx+sd*3.2,H-.25,(WBAY.z0+WBAY.z1)/2+2);B.g.add(g);const base=new THREE.Mesh(new THREE.CylinderGeometry(.22,.26,.2,12),M(0x2a2e34));g.add(base);const head=new THREE.Group();head.position.y=-.25;g.add(head);
   const hb=new THREE.Mesh(new THREE.SphereGeometry(.22,12,8),M(0x3a3e44));head.add(hb);const bl=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,.45,8),M(0x15181c));bl.rotation.x=Math.PI/2;bl.position.z=-.3;head.add(bl);const eye=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),M(0x300000,{emissive:0xff2020,emissiveIntensity:.6}));eye.position.set(0,.05,-.2);head.add(eye);
   const beam=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1,6),new THREE.MeshBasicMaterial({color:0xff3030,transparent:true,opacity:.85}));beam.visible=false;B.g.add(beam);d.tur.push({g,head,eye,beam})}}
 const i=bayMine(q);if(i<0)return;const d=B.doors[i],px=d.cx+3.9,pz=WBAY.z1-1.1;const pn=new THREE.Group();pn.position.set(px,0,pz);B.g.add(pn);
 const post=new THREE.Mesh(new THREE.BoxGeometry(.5,1.2,.25),M(0x2a2e34));post.position.y=.6;pn.add(post);const scr=new THREE.Mesh(new THREE.BoxGeometry(.44,.3,.04),M(0x0a1810,{emissive:0x20c060,emissiveIntensity:.6}));scr.position.set(0,1.05,-.13);scr.rotation.x=-.3;pn.add(scr);
 q.props.push({x:px,z:pz-.6,r:1.3,txt:()=>q.seat?'':'[E] 🛡️ Bay security: who can come in ('+btrList().length+' trusted)',act:()=>bayTrustDlg(q)})}
function bayTrustDlg(q){const here=[];for(const id in (q.vnet&&q.vnet.rem)||{}){const r=q.vnet.rem[id];if(Date.now()-r.t<6000)here.push({id,nm:fsName(r.nm||'')||'Player'})}
 const L=btrList();const rows=here.map(p=>'<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #2a3a20"><span>'+esc(p.nm)+'</span><span>'+(btrHas(p.id)?'✅ trusted':'⛔ not trusted')+'</span></div>').join('')||'<p style="opacity:.7">Nobody else is out in the desert right now.</p>';
 const away=L.filter(t=>!here.some(p=>p.id===t.id));const btn=here.map(p=>[(btrHas(p.id)?'u:':'t:')+p.id,(btrHas(p.id)?'⛔ Stop trusting ':'✅ Trust ')+p.nm]).concat(away.map(t=>['u:'+t.id,'⛔ Remove '+t.nm+' (away)'])).slice(0,8);btn.push(['x','Close']);
 milDlg(q,'🛡️ BAY '+(bayMine(q)+1)+' SECURITY','<p style="margin-top:0">Trusted players can open your bay and walk in. Anyone else who gets in is zapped by the turrets and thrown out.</p>'+rows+(away.length?'<p style="font-size:13px;opacity:.75">Also trusted (not here now): '+away.map(t=>esc(t.nm)).join(', ')+'</p>':''),btn,b=>{if(!b||b=='x')return;const id=b.slice(2),S=milSV();if(b[0]=='t'){const p=here.find(x=>x.id===id);if(p&&!btrHas(id)){btrList().push({id,nm:p.nm});hint('✅ '+p.nm+' can come into your bay now.')}}else{S.btr=btrList().filter(t=>t.id!==id)}milSave();setTimeout(()=>bayTrustDlg(q),50)})}
{const bb0=bayBuild;bayBuild=function(q){const r=bb0.apply(this,arguments);try{bayDefBuild(q)}catch(e){conLog('error','bay defence: '+e.message)}return r}}
/* the turrets: they track whoever does not belong, and zap them out */
function bayIn(i,x,z){const cx=bayX(i);return Math.abs(x-cx)<WBAY.w/2-.4&&z>WBAY.z0&&z<WBAY.z1}
function bayDefTick(q,dt){const B=q.wbay;if(!B||!B.def)return;const mine=bayMine(q),lz=P.z-q.OZ;
 for(const d of B.doors){if(!d.tur)continue;let tgt=null;
  if(d.i!==mine){const BN=bayFresh(q,d.i);const tr=BN&&BN.tr.includes(SV.pid);if(BN&&!tr){const me=q.seat?q.seat.v:null,x=me?me.x:P.x,z=me?me.z:lz;if(bayIn(d.i,x,z))tgt={x,y:(me?me.y+1.2:(P.dy||0)+1.2),z,me:1}}}
  else{for(const id in (q.vnet&&q.vnet.rem)||{}){const r=q.vnet.rem[id];if(Date.now()-r.t>3000||btrHas(id))continue;if(bayIn(d.i,r.x,r.z)){tgt={x:r.x,y:1.2,z:r.z,nm:r.nm};break}}}
  d.lock=tgt?(d.lock||0)+dt:0;
  for(const T of d.tur){const wp=new THREE.Vector3();T.g.getWorldPosition(wp);if(tgt){const dx=tgt.x-T.g.position.x,dz=tgt.z-T.g.position.z,dy=tgt.y-(T.g.position.y-.25);T.head.rotation.y=Math.atan2(-dx,-dz);T.head.rotation.x=Math.atan2(dy,Math.hypot(dx,dz));T.eye.material.emissiveIntensity=1.6;
    const on=d.lock>.6&&((q.rt*8)|0)%2==0;T.beam.visible=on;if(on){const a=new THREE.Vector3(T.g.position.x,T.g.position.y-.25,T.g.position.z),b=new THREE.Vector3(tgt.x,tgt.y,tgt.z),L=a.distanceTo(b);T.beam.position.copy(a).add(b).multiplyScalar(.5);T.beam.scale.set(1,L,1);T.beam.lookAt(b);T.beam.rotateX(Math.PI/2)}}
   else{T.head.rotation.y+=dt*.6;T.head.rotation.x=.25;T.eye.material.emissiveIntensity=.6;T.beam.visible=false}}
  if(tgt&&d.lock>.6&&Math.random()<dt*6)try{snd(1400+Math.random()*400,.03)}catch(e){}
  if(tgt&&tgt.me&&d.lock>1.4){d.lock=0;bayZap(q,d)}
  if(tgt&&!tgt.me&&d.i===mine&&!d.warned){d.warned=1;hint('🚨 Intruder in your bay: '+(fsName(tgt.nm||'')||'someone')+'. The turrets are on it. (Trust people at the security panel.)')}if(!tgt)d.warned=0}}
function bayZap(q,d){const BN=bayFresh(q,d.i);if(d.zapT)return;d.zapT=1;const me=q.seat?q.seat.v:null;
 /* the turrets go to full power: thick white-blue arcs, sparks, crackle */for(const T of d.tur){T.beam.material.color.setHex(0xa0e0ff);T.beam.scale.x=T.beam.scale.z=4;T.beam.visible=true}
 for(let k=0;k<6;k++)setTimeout(()=>{try{snd(1600+Math.random()*1400,.05);snd(90+Math.random()*60,.08);vfx('spark',me?me.x:P.x,(me?me.y:(P.dy||0))+1.2,(me?me.z:P.z-q.OZ)+q.OZ,{n:14,c:0x9ad8ff});camShake(.25,.15)}catch(e){}},k*60);
 try{bsF.style.transition='none';bsF.style.background='#bfe8ff';bsF.style.opacity=.7;setTimeout(()=>{bsF.style.background='#ff3030';bsF.style.opacity=.5},90);setTimeout(()=>{bsF.style.transition='opacity .9s';bsF.style.opacity=0;setTimeout(()=>bsF.style.background='#000',1000)},200)}catch(e){}
 setTimeout(()=>{try{for(const T of d.tur){T.beam.material.color.setHex(0xff3030);T.beam.scale.x=T.beam.scale.z=1}d.zapT=0;d.lock=0;
  /* ...and OUT you go: launched through the door into the yard */snd(70,.5);snd(220,.25);camShake(.7,.6);const z0=WBAY.z1+.9;
  if(q.seat){const v=q.seat.v;v.x=d.cx;v.z=z0+2;v.h=Math.PI;v.v=17;v.air=1;v.vy=7.5;v.spin=(Math.random()-.5)*3;try{vehDamage(q,v,10)}catch(e){}}
  else{P.x=d.cx+(Math.random()-.5);P.z=z0+q.OZ;q.fling={vx:(Math.random()-.5)*3,vz:13,vy:9,y:(P.dy||0)+1,t:0,soft:1}}
  hint('⚡ BAY '+(d.i+1)+' SECURITY: you are not on '+((BN&&BN.nm)||'the owner')+'\'s trust list. ZAP... and OUT you go.')}catch(e){d.zapT=0}},420)}

{let last=performance.now();const tk=()=>{requestAnimationFrame(tk);const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;try{const q=BUS.ride;if(state=='bus'&&q&&q.roam&&q.wbay)bayDefTick(q,dt)}catch(e){}};requestAnimationFrame(tk)}
/* ---------- REFITS AS CHALLENGES ---------- */
function rfTarget(q,o,x,z,lab){const M=q.mil;const g=new THREE.Group();g.position.set(x,0,z);q.g.add(g);const pl=new THREE.Mesh(new THREE.BoxGeometry(3,3.2,.2),VMAT(0xe8e0c0));pl.position.y=1.8;g.add(pl);const t=dsSign('✕','#c02020','#fff');t.scale.setScalar(.85);g.add(t);const pole=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,6,6),VMAT(0xff4020,{emissive:0x802010}));pole.position.y=3;g.add(pole);
 const tg={x,z,g,dead:0,onHit(){const v=q.seat&&q.seat.v;const far=v?Math.hypot(v.x-x,v.z-z):999;if(o.minD&&far<o.minD){tg.dead=0;hint('🎯 Too close: that one only counts from '+o.minD+' m away. ('+Math.round(far)+' m)');return}g.rotation.x=Math.PI/2*.95;pole.visible=false;o.n=(o.n||0)+1;snd(600,.1);hint('🎯 '+(lab||'Target')+' down! ('+o.n+'/'+o.need+')')}};M.tg.push(tg);M.rangeT.push(tg);return tg}
function rfWr(q){const s=q.seat;return s&&s.i==0&&s.v.K.proto?s.v:null}
function rfOpforAdd(q,o,x,z){const M=q.mil;const v=q.addVeh('tank',x,z,Math.PI/2);v.mil=99;v.guard=1;v.nogar=1;v.npc=1;const tg={x,z,v,hp:2,hits:0,dead:0,onHit(){tg.x=v.x;tg.z=v.z;o.n=(o.n||0)+1;v.wreck=1;v.wreckT=99;try{boom(q,v.x,v.y+1,v.z,0,1.2,v)}catch(e){}hint('⚔️ OPFOR tank knocked out! ('+o.n+'/'+o.need+')')}};M.tg.push(tg);o.of.push({v,tg,cd:2+Math.random()*2});for(const p of q.props)if(p.veh===v)p.txt=()=>''}
const RFC={
 1:{t:'LIVE-FIRE ARMOUR TEST',d:'Two OPFOR tanks open up on you while you drive the four range checkpoints. Make it through all four in 80 seconds without losing more than 80% of your armour.',
  go(q,o){o.t=80;o.n=0;o.need=4;o.ok=1;milOpfor(q,o);milBeacons(q,o,[[560,-800],[575,-760],[548,-732],[520,-785]])},
  line(q,o){const v=rfWr(q);return'🛡️ ARMOUR TEST · checkpoint '+Math.min(4,o.n+1)+'/4 under fire · armour '+(v?Math.max(0,100-Math.round(v.dmg||0)):'?')+'% · '+Math.ceil(o.t)+'s'},
  tick(q,o,dt){o.t-=dt;milOpforTick(q,o,dt*1.5);const v=rfWr(q);if(v&&(v.dmg||0)>80)return'Armour below 20%. The reactive plates did not hold up.';const b=o.bc&&o.bc[o.n];if(b&&v&&Math.hypot(v.x-b[0],v.z-b[1])<7){o.n++;snd(800,.08);milBeaconOff(q,o,o.n-1);if(o.n>=4)return true}if(o.t<=0)return'Time. Four checkpoints, under fire, in 80 seconds.'},
  end(q,o){milBeaconsClear(q,o);milOpforClear(q,o)}},
 2:{t:'SALVO TEST',d:'Eight targets across the range berm, 35 seconds. One pod is not enough: you need the full eight-rocket salvo.',
  go(q,o){o.t=35;o.n=0;o.need=8;o.ok=1;for(let i=0;i<8;i++)rfTarget(q,o,588+(i%2)*4,-805+i*10.5,'Target')},
  line(q,o){return'🚀 SALVO TEST · targets '+o.n+'/8 on the range berm · '+Math.ceil(o.t)+'s'},
  tick(q,o,dt){o.t-=dt;if(o.n>=8)return true;if(o.t<=0)return'Time. Eight targets in 35 seconds is a salvo job.'},end(q,o){milTargetsClear(q)}},
 3:{t:'SPEED TRAP',d:'Route 13, heading south: three speed-trap gates. Go through every one at 50 m/s or more (Shift for the afterburners). Miss one and you start again at the first.',
  go(q,o){o.t=180;o.n=0;o.need=3;milBeacons(q,o,[[0,-1080],[0,-1230],[0,-1380]])},
  line(q,o){const v=rfWr(q);return'🔥 SPEED TRAP · gate '+(o.n+1)+'/3 on Route 13 at 50+ m/s · you: '+(v?Math.round(Math.abs(v.v)):0)+' m/s · '+Math.ceil(o.t)+'s'},
  tick(q,o,dt){o.t-=dt;const v=rfWr(q),b=o.bc&&o.bc[o.n];if(v&&b&&Math.abs(v.z-b[1])<6&&Math.abs(v.x-b[0])<9){const sp=Math.abs(v.v);if(sp>=50){o.n++;snd(900,.1);milBeaconOff(q,o,o.n-1);hint('🔥 '+Math.round(sp)+' m/s. Gate '+o.n+'/3.');if(o.n>=3)return true}else if(!o.slow){o.slow=1;hint('🐢 '+Math.round(sp)+' m/s: too slow. Back to the first gate (north of it, then run south).');milBeaconsClear(q,o);milBeacons(q,o,[[0,-1080],[0,-1230],[0,-1380]]);o.n=0;setTimeout(()=>o.slow=0,2500)}}if(o.t<=0)return'Time. The afterburners never got a clean run.'},
  end(q,o){milBeaconsClear(q,o)}},
 4:{t:'SHIELD SOAK',d:'Park in the impact zone on the range and sit through a 30-second artillery barrage. Stay inside the ring and keep the hull above 40%.',
  go(q,o){o.t=150;o.n=0;o.need=1;o.ph=0;o.bt=30;o.ok=1;milBeacons(q,o,[[565,-765]])},
  line(q,o){const v=rfWr(q);return o.ph?'⚡ SHIELD SOAK · hold position · barrage '+Math.ceil(o.bt)+'s · hull '+(v?Math.max(0,100-Math.round(v.dmg||0)):'?')+'%':'⚡ SHIELD SOAK · drive into the IMPACT ZONE on the range and stop · '+Math.ceil(o.t)+'s'},
  tick(q,o,dt){const v=rfWr(q);if(!o.ph){o.t-=dt;if(v&&Math.hypot(v.x-565,v.z+765)<7&&Math.abs(v.v)<2){o.ph=1;hint('📻 "Shot, over." The barrage is coming in. Do NOT move.');snd(300,.2)}if(o.t<=0)return'Time. You never got into the impact zone.';return}
   o.bt-=dt;if(!v||Math.hypot(v.x-565,v.z+765)>9)return'You left the impact zone. The test needs you to SIT in it.';if((v.dmg||0)>60)return'Hull below 40%. The shield needs more work.';
   if((o.sh=(o.sh||0)-dt)<=0){o.sh=.9+Math.random()*.5;const a=Math.random()*6.28,r=1.5+Math.random()*4.5;try{boom(q,v.x+Math.cos(a)*r,.6,v.z+Math.sin(a)*r,false,.9)}catch(e){}}if(o.bt<=0)return true},
  end(q,o){milBeaconsClear(q,o)}},
 5:{t:'LONG SHOT',d:'Four targets far out in the desert south of the gate. Each one only counts if you hit it from 200 m or more away. Two and a half minutes.',
  go(q,o){o.t=150;o.n=0;o.need=4;o.ok=1;o.minD=200;for(const[x,z]of[[500,-1290],[610,-1260],[430,-1240],[560,-1340]])rfTarget(q,o,x,z,'Long-range target')},
  line(q,o){return'🎯 LONG SHOT · targets '+o.n+'/4 · fire from 200 m+ (they are south of the gate) · '+Math.ceil(o.t)+'s'},
  tick(q,o,dt){o.t-=dt;if(o.n>=4)return true;if(o.t<=0)return'Time. The rails are there; the shots were not.'},end(q,o){milTargetsClear(q)},
  wp(q,o){return[560,-1000,'the FIRING POINT outside the gate']}},
 6:{t:'THE GAUNTLET',d:'Everything at once: three OPFOR tanks dug in on the range, hitting harder than ever. Knock out all three in two minutes and keep the Wraith in one piece.',
  go(q,o){o.t=120;o.n=0;o.need=3;o.ok=1;milOpfor(q,o);rfOpforAdd(q,o,592,-766)},
  line(q,o){const v=rfWr(q);return'👑 THE GAUNTLET · OPFOR tanks '+o.n+'/3 · hull '+(v?Math.max(0,100-Math.round(v.dmg||0)):'?')+'% · '+Math.ceil(o.t)+'s'},
  tick(q,o,dt){o.t-=dt;milOpforTick(q,o,dt*1.8);const v=q.mil.proto;if(v&&v.wreck)return'The Wraith is a wreck. Not perfected yet.';if(o.n>=3)return true;if(o.t<=0)return'Time. The OPFOR hold the range.'},end(q,o){milOpforClear(q,o)}}};
function wkRefit2(n,min,xp){const C=RFC[n];return{id:'refit'+n,nm:'Wraith refit: '+WKN[n],ic:'🛸',min,xp,ref:n,
 d:'The crew fit a PROTOTYPE '+WKN[n].split('· ')[1]+' at the REFIT BAY (Hangar 1). Then the '+C.t+': '+C.d+' Pass and it is yours for good. '+WKD[n],
 start(q,o){if(!garOwned('proto')){o.fin=1;setTimeout(()=>{if(q.mil.op===o){q.mil.op=null;hint('🛸 You need your own Wraith first: pass the X-13 TRIALS.')}},0);return}o.rp=(milSV().wk|0)>=n;if(o.rp)setTimeout(()=>hint('🛸 REPLAY: your Wraith already has the '+WKN[n]+'. Run the '+C.t+' again for the XP.'),0);if((milSV().wk|0)<n-1){o.fin=1;setTimeout(()=>{if(q.mil.op===o){q.mil.op=null;hint('🛸 One refit at a time: your Wraith needs the '+WKN[n-1]+' first.')}},0);return}o.st=0;o.h=0;o.n=0;o.t=240;milBeacons(q,o,[WKBAY])},
 line(q,o){if(o.st==0){const s=q.seat;return'🛸 Drive your WRAITH onto the REFIT BAY pad in Hangar 1'+(o.h>0?' · crew fitting the prototype '+Math.round(o.h/8*100)+'%':s&&s.v.K.proto?'':' · get in your Wraith')}return C.line(q,o)},
 tick(q,o,dt){if(o.st==0){const s=q.seat;const at=s&&s.i==0&&s.v.K.proto&&Math.hypot(s.v.x-WKBAY[0],s.v.z-WKBAY[1])<5.5;if(at&&Math.abs(s.v.v)<1.2){if(o.h==0)hint('🔧 Hold still: the crew are fitting the prototype.');o.h+=dt;if(Math.random()<dt*12)try{vfx('ember',s.v.x+(Math.random()-.5)*3,s.v.y+1.5,s.v.z+(Math.random()-.5)*5+q.OZ,{n:3})}catch(e){}if(Math.random()<dt*4)snd(900+Math.random()*600,.03);
    if(o.h>=8){WKTRY.ref=n;try{wkBuild(s.v,wkMine())}catch(e){}milBeaconsClear(q,o);o.bc=null;o.st=1;snd(500,.1);setTimeout(()=>snd(800,.15),120);hint(o.rp?'🛸 The crew re-tune the '+WKN[n]+'. Now the '+C.t+' again: '+C.d:'🛸 PROTOTYPE '+WKN[n]+' fitted. Now the '+C.t+': '+C.d);C.go(q,o)}}else if(o.h>0&&o.h<8)o.h=Math.max(0,o.h-dt*2);return}
  const r=C.tick(q,o,dt);if(r===true){const S=milSV();S.wk=Math.max(S.wk|0,n);milSave();WKTRY.ref=0;try{const v=q.mil.proto;if(v)wkBuild(v,wkMine())}catch(e){}if(o.rp)hint('🛸 '+C.t+' PASSED again. Nice flying.');else{hint('🛸 '+C.t+' PASSED. The '+WKN[n]+' is yours for good. '+WKD[n]);if(n>=6)try{badge('wraith6')}catch(e){}}if(!o.rp)try{sysLine('🛸 '+(SV.nm||'Someone')+'\'s Wraith passed the '+C.t+' and is now '+WKN[n])}catch(e){}milOpDone(q,o)}
  else if(typeof r=='string'){WKTRY.ref=0;try{const v=q.mil.proto;if(v)wkBuild(v,wkMine())}catch(e){}milOpFail(q,o,r+(o.rp?'':' The prototype part comes off again.'))}},
 end(q,o){if(o.bc)milBeaconsClear(q,o);try{C.end(q,o)}catch(e){}if(WKTRY.ref===n){WKTRY.ref=0;try{const v=q.mil.proto;if(v)wkBuild(v,wkMine())}catch(e){}}},
 wp(q,o){if(o.st==0)return[WKBAY[0],WKBAY[1],'the REFIT BAY'];if(C.wp)return C.wp(q,o);const b=o.bc&&o.bc[o.n];return b?[b[0],b[1],C.t+' checkpoint']:null}}}
for(let i=0;i<MILOPS.length;i++){const m=/^refit(\d)$/.exec(MILOPS[i].id||'');if(m){const o=MILOPS[i];MILOPS[i]=wkRefit2(+m[1],o.min,o.xp)}}
/* ---------- chat video: "I like like liker" (or anything close: "like like liker", "i like liker", "like like likers") ---------- */
try{VIDS.push({ph:['i like like liker','like like liker'],test:w=>/ (i )?like,? (like,? )?likers? /.test(w),id:'likeVid',cap:'👍 I like like liker'})}catch(e){}

/* ---------- Wraith refit parts sit a hair in front of the hull, so they never flicker against it ---------- */
{const wb0=wkBuild;wkBuild=function(v,l){const r=wb0.apply(this,arguments);try{const u=v.m&&v.m.userData;for(const k of['wkG','wkT','wkB']){const G=u&&u[k];if(G)G.traverse(o=>{if(o.isMesh&&o.material&&!o.material.transparent){if(!o.material.__po){o.material=o.material.clone();o.material.__po=1}o.material.polygonOffset=true;o.material.polygonOffsetFactor=-2;o.material.polygonOffsetUnits=-2}})}}catch(e){}return r}}
