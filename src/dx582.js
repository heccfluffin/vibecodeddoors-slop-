/* =====================================================================================================
   r582: CO-OP CRIME AND CO-OP MINES.
   - Crimes now show up for everyone out in the desert together. One player's game runs the crooks and the police and
     shares them; everybody else sees the getaway car, the police car, the arrest, and the red marks on every map.
     Anyone can blow the getaway car up (an explosion or a strike near it counts), and helpers get the reward.
   - The mine under the quarry is the SAME mine for everyone: the same tunnels, the same veins (a vein one player
     breaks is gone for the others), the same three-minute clock, and it collapses on everyone at once.
   ===================================================================================================== */
const CRR={L:[],from:'',t:0,seen:{},m:{}};
const crCoop=()=>{try{return MP.on&&mpOpen().length>0}catch(e){return false}};
/* the crime runner shares its crimes four times a second */
setInterval(()=>{try{const q=BUS.ride;if(!q||!q.roam||!crCoop())return;const L=CRM.list.filter(c=>c.st!='done').map(c=>({i:c.id,k:CRKIND.indexOf(c.K),l:c.loc.nm,st:c.st,x:+(c.st=='flee'||c.st=='stop'?c.v.x:c.x).toFixed(1),z:+(c.st=='flee'||c.st=='stop'?c.v.z:c.z).toFixed(1),h:+c.v.h.toFixed(2),vk:c.v.k,cx:c.cop?+c.cop.v.x.toFixed(1):null,cz:c.cop?+c.cop.v.z.toFixed(1):null,ch:c.cop?+c.cop.v.h.toFixed(2):0,w:c.v.wreck?1:0,d:c.dest&&c.dest.nm}));
  if(L.length||CRR.sent)xmNet(q,'crm',{L});CRR.sent=L.length>0;
  /* rewards for the helpers once the crook is in the car */for(const c of CRM.list)if((c.st=='home'||c.st=='done')&&c.helpers&&!c.paidR){c.paidR=1;for(const id of c.helpers)xmNet(q,'crrw',{to:id,g:40})}}catch(e){}},250);
XM.net.crm=(o,id)=>{try{const q=BUS.ride;if(!q)return;const L=Array.isArray(o.L)?o.L.slice(0,4):[];CRR.L=L;CRR.from=id;CRR.t=Date.now();
  for(const c of L){const K=CRKIND[c.k]||CRKIND[0];const was=CRR.seen[c.i];if(!was)hint('📻 DESERT PD: "All units, '+K[2]+' in progress at '+String(c.l||'somewhere')+'!" 🚨 It is on your map.');else if(was!==c.st){if(c.st=='flee')hint('📻 DESERT PD: "Suspect fleeing towards '+String(c.d||'the desert')+'!"');if(c.st=='cuff')hint('📻 DESERT PD: "Hands where I can see them!"');if(c.st=='home')hint('📻 DESERT PD: "Suspect in custody."')}CRR.seen[c.i]=c.st}}catch(e){}};
XM.net.crrw=(o,id)=>{try{if(String(o.to)!==SV.pid)return;const g=Math.max(0,Math.min(100,o.g|0));gold+=g;saveGame();updHud();hint('📻 DESERT PD: "Thanks for the help out there." +'+g+' gold.')}catch(e){}};
XM.net.crhit=(o,id)=>{try{const q=BUS.ride;if(!q)return;const c=CRM.list.find(c=>c.id==o.i);if(!c||!c.v||c.v.wreck)return;q.crimOK=performance.now()+600;try{vehBlow(q,c.v,false)}catch(e){}(c.helpers=c.helpers||[]).includes(id)||c.helpers.push(id)}catch(e){}};
/* the other players' copies: plain models that follow what the runner sends */
function crRemTick(q,dt){const fresh=Date.now()-CRR.t<2500?CRR.L:[];const keep={};
 for(const c of fresh){keep[c.i]=1;let R=CRR.m[c.i];if(!R){R=CRR.m[c.i]={};try{R.car=mkVehModel(c.vk||'sedan');q.g.add(R.car);R.cop=mkVehModel('cop');R.cop.visible=false;q.g.add(R.cop)}catch(e){}}
  const ln=(m,x,z,h)=>{if(!m)return;m.position.x+=(x-m.position.x)*Math.min(1,dt*8);m.position.z+=(z-m.position.z)*Math.min(1,dt*8);m.position.y=vehGround(q,m.position.x,m.position.z);m.rotation.y=h};
  if(R.car){if(!R.init){R.car.position.set(c.x,0,c.z);R.init=1}ln(R.car,c.x,c.z,c.h);R.car.visible=!c.w}
  if(R.cop){if(c.cx!=null){if(!R.cop.visible){R.cop.position.set(c.cx,0,c.cz);R.cop.visible=true}ln(R.cop,c.cx,c.cz,c.ch)}else R.cop.visible=false}}
 for(const k in CRR.m)if(!keep[k]){const R=CRR.m[k];for(const m of[R.car,R.cop])if(m&&m.parent)m.parent.remove(m);delete CRR.m[k]}}
{const ru6=busRoamUpd;busRoamUpd=function(q,dt){const r=ru6.apply(this,arguments);try{crRemTick(q,dt)}catch(e){}return r}}
/* everyone's maps */{const cm0=crMarks;crMarks=function(){const L=cm0.apply(this,arguments);if(Date.now()-CRR.t<2500)for(const c of CRR.L){if(c.st=='home')continue;L.push({x:c.x,z:c.z,st:c.st,K:CRKIND[c.k]||CRKIND[0],cop:c.cx!=null?{v:{x:c.cx,z:c.cz}}:null})}return L}}
/* blowing up somebody else's crook: an explosion near the getaway car tells the crime runner */
{const bm3=boom;boom=function(q,x,y,z,mine,pw){const r=bm3.apply(this,arguments);try{if(mine&&Date.now()-CRR.t<2500)for(const c of CRR.L){if(c.w||c.st=='home'||c.st=='cuff')continue;if(Math.hypot(c.x-x,c.z-z)<5+(pw||1)*3){xmNet(q,'crhit',{i:c.i});hint('💥 Direct hit on the getaway car!')}}}catch(e){}return r}}
/* ---------- one mine for everyone ---------- */
const MNF={t:0,from:''};
function mnFollow(){return Date.now()-MNF.t<6000}
function mnLead(q){if(!crCoop())return true;try{return cwSlot(q)===0}catch(e){return true}}
setInterval(()=>{try{const q=BUS.ride;if(!q||!q.roam||!crCoop()||!mnLead(q)||!MN.lamp)return;if(MN.st=='open'&&!MN.cells)mnGen(q);const gone=[];MN.nodes.forEach((n,i)=>{if(n.gone)gone.push(i)});xmNet(q,'mn',{sd:MN.seed,st:MN.st,t:+MN.t.toFixed(1),g:gone})}catch(e){}},2000);
XM.net.mn=(o,id)=>{try{const q=BUS.ride;if(!q||!MN.lamp)return;if(String(id)>SV.pid&&!mnFollow()&&mnLead(q))return;MNF.t=Date.now();MNF.from=id;
  const st=o.st=='closed'?'closed':'open';if(MN.st=='open'&&st=='closed'){mnCollapse(q)}else if(MN.st!=st){MN.st=st;MN.w1=MN.w2=MN.w3=0}MN.t=Math.max(0,+o.t||0);
  const sd=o.sd>>>0;if(st=='open'&&sd&&sd!==MN.seed&&q.deep!==5&&!MN.ride){mnGen(q,sd)}
  if(sd===MN.seed&&Array.isArray(o.g))for(const i of o.g){const n=MN.nodes[i|0];if(n&&!n.gone){n.gone=1;n.g.visible=false}}}catch(e){}};
XM.net.mnh=(o,id)=>{try{if((o.sd>>>0)!==MN.seed)return;const n=MN.nodes[o.i|0];if(n&&!n.gone){n.gone=1;n.g.visible=false}}catch(e){}};
/* going down: if a co-op mine is running, use its layout */{const mr0=mnRide;mnRide=function(q,dir){try{if(dir<0&&mnFollow()&&!MN.cells&&MN.seed)mnGen(q,MN.seed)}catch(e){}return mr0.apply(this,arguments)}}
/* ---------- staff: GRANT A BADGE (the 🏅 Badge button on a player in the admin panel) ---------- */
const BDNOGRANT=/^(owner|admin)$/;
function bdPick(nm,onPick){let d=document.getElementById('bdPick');if(d)d.remove();d=document.createElement('div');d.id='bdPick';d.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:95;width:min(560px,94vw);max-height:80vh;overflow:auto;background:linear-gradient(#1c1a26,#12101a);border:2px solid #b08aff;border-radius:14px;padding:14px;color:#ece6ff;font:14px Georgia,serif;box-shadow:0 12px 40px #000c';
 const L=BD.filter(b=>b&&!BDNOGRANT.test(b[0]));d.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="font-size:17px">🏅 Grant a badge to '+uE(nm)+'</b><button data-x="1" style="background:#2a2236;color:#fff;border:1px solid #8a6ad0;border-radius:8px;padding:4px 10px;cursor:pointer">✕</button></div><input id="bdQ" placeholder="Search badges..." style="width:100%;box-sizing:border-box;margin-bottom:8px;background:#0c0a12;color:#fff;border:1px solid #6a5a9a;border-radius:8px;padding:6px 8px;font:14px Georgia"><div id="bdG" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px"></div>';
 document.body.appendChild(d);for(const ev of['click','mousedown','mouseup','keydown'])d.addEventListener(ev,e=>e.stopPropagation());
 const draw=f=>{d.querySelector('#bdG').innerHTML=L.filter(b=>!f||(b[2]+' '+b[3]+' '+b[0]).toLowerCase().includes(f)).map(b=>'<button data-b="'+uE(b[0])+'" title="'+uE(b[3]||'')+'" style="text-align:left;background:#221c30;color:#f0eaff;border:1px solid #4a3a6a;border-radius:8px;padding:6px 8px;cursor:pointer">'+b[1]+' '+uE(b[2])+'</button>').join('')};draw('');
 d.querySelector('#bdQ').addEventListener('input',e=>draw(e.target.value.trim().toLowerCase()));
 d.addEventListener('click',e=>{if(e.target.closest('[data-x]')){d.remove();return}const b=e.target.closest('[data-b]');if(b){onPick(b.dataset.b);d.remove()}})}
{const sa1=stAct;stAct=function(act,pid,arg){if(act!=='badge')return sa1.apply(this,arguments);if(!myRank()){hint('🛡️ Staff only.');return}const nm=stName(pid);
  const give=id=>{const B=BDIDX[id];if(!B||BDNOGRANT.test(id))return;if(pid===SV.pid){badge(id);sysLine('🏅 You gave yourself: '+B[1]+' '+B[2]);return}if(stSend('badge',{to:pid,b:id}))sysLine('🏅 Sent '+nm+' the '+B[1]+' '+B[2]+' badge.')};
  if(arg)give(String(arg));else bdPick(nm,give)}}
{const sd1=stDo;stDo=function(k,a,nm,id){if(k!=='badge')return sd1.apply(this,arguments);let o;try{o=JSON.parse(a)}catch(e){return}if(!o||o.to!==SV.pid)return;const b=String(o.b||''),B=BDIDX[b];if(!B||BDNOGRANT.test(b))return;const had=!!(SV.bd&&SV.bd[b]);try{badge(b)}catch(e){}abuseBanner('🏅 '+B[1]+' '+B[2],'a badge from 🛡️ '+(nm||'Staff'));sysLine('🏅 '+(nm||'Staff')+' gave you a badge: '+B[1]+' '+B[2]+(had?' (you already had it)':''))}}
/* ---------- fewer, better badges ---------- */
{const GONE=['daily30','acquitted','grinned','bpack','honhard','share'];try{for(let i=BD.length-1;i>=0;i--)if(BD[i]&&GONE.includes(BD[i][0]))BD.splice(i,1);for(const k of GONE){delete BDIDX[k];const j=BDI.indexOf(k);if(j>=0)BDI.splice(j,1)}
 const st=BDIDX.stunt;if(st)st[3]='Land five of the stunt jumps in the desert.'}catch(e){}}
/* every badge is also kept in a second, separate save, so a bad or overwritten save can never take one away */
function bdBackup(){try{const o=JSON.parse(localStorage.getItem('doorsBd1')||'{}');let ch=0;for(const k in SV.bd||{})if(!o[k]){o[k]=SV.bd[k];ch=1}if(ch)localStorage.setItem('doorsBd1',JSON.stringify(o))}catch(e){}}
function bdRestore(){try{const o=JSON.parse(localStorage.getItem('doorsBd1')||'{}');if(!SV.bd)SV.bd={};let add=0;for(const k in o)if(BDIDX[k]&&!SV.bd[k]){SV.bd[k]=+o[k]||Date.now();add++}if(add)saveGame();bdBackup()}catch(e){}}
{const bg0=badge;badge=function(id){const r=bg0.apply(this,arguments);try{bdBackup()}catch(e){}return r}}
{const sa2=svApply;svApply=function(){const r=sa2.apply(this,arguments);try{setTimeout(bdRestore,0)}catch(e){}return r}}
setTimeout(bdRestore,500);
/* public desert: never pick a stale room, and if one will not connect, try the next before starting your own */
/* a failed join (or a double click) could leave the title menu sitting on top of a desert you are already in: put you back in it */
{let since=0;setInterval(()=>{try{const m=$('m');const stuck=BUS.ride&&!BUS.ride.done&&m&&m.style.display!='none'&&(state=='menu'||state=='bus');if(!stuck){since=0;return}if(!since){since=Date.now();return}if(Date.now()-since>1200){since=0;m.style.display='none';state='bus';try{if(!MOB.on)R.domElement.requestPointerLock()}catch(e){}}}catch(e){}},400)}
{const pp0=pdzPlay;pdzPlay=function(){if(PDZ.busy){hint('🏜️ Already looking for a desert...');return}if(BUS.ride){hint('🏜️ You are already out in the desert.');return}return pp0.apply(this,arguments)}}
/* ---------- Settings: skip the Desert Bus ride ---------- */
function BSKIP(){try{return localStorage.getItem('doorsSkipBus')=='1'}catch(e){return false}}
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.sw=='skipbus'){try{localStorage.setItem('doorsSkipBus',t.checked?'1':'0')}catch(x){}hint(t.checked?'🚌 The Desert Bus ride is skipped: you go straight to the desert.':'🚌 The Desert Bus ride is back.')}},true);
{const bb3=busBoard;busBoard=function(force,seat,others,seed,then){if(BSKIP()&&!BUS.ride){const t0=then;then=function(){try{if(t0)t0.apply(this,arguments)}catch(e){}try{if(BUS.ride&&!(BUS.ride.t>26.5))BUS.ride.t=26.5}catch(e){}};return bb3.call(this,force,seat,others,seed,then)}return bb3.apply(this,arguments)}}
