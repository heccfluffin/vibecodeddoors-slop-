/* =====================================================================================================
   r525: UPDATE PROMPT and MILITARY SQUADS.
   - Played from the website (GitHub Pages), the game checks every few minutes for a newer build and offers to update.
   - In co-op at Fort Blackout, finishing a military job gives the same XP to every enlisted teammate near you (your
     squad). Teammates' rank and XP float over their heads while they are on the base.
   ===================================================================================================== */
const UPD={seen:0,el:null};
function updNum(b){const m=String(b||'').match(/r(\d+)/);return m?+m[1]:0}
/* r544: before reloading, make sure the website is really serving the new file yet. GitHub Pages can take a minute or two
   to roll an update out everywhere; reloading too early just brought back the old game and the same prompt */
function updGo(d,nw){const b=d.querySelector('#updGo');if(b){b.disabled=true;b.textContent='⏳ Checking...'}try{saveGame()}catch(e){}
 const url=location.pathname.replace(/[^/]*$/,'')+'index.html?cb='+Date.now();
 fetch(url,{cache:'reload'}).then(r=>r.ok?r.text():'').then(t=>{const m=String(t).match(/const BUILD='[^']*?(r\d+)'/),got=m?updNum(m[1]):0;
  if(got>=nw){try{sessionStorage.setItem('updWant',String(nw))}catch(e){}location.replace(location.pathname+'?v='+nw+'&t='+Date.now())}
  else{if(b){b.disabled=false;b.textContent='⬆️ Update now'}const w=d.querySelector('#updWait')||(()=>{const e2=document.createElement('div');e2.id='updWait';e2.style.cssText='font-size:12px;color:#ffd860;margin-top:6px';d.appendChild(e2);return e2})();w.textContent='⏳ The website is still publishing r'+nw+'. Give it a minute or two, then press Update again.'}})
 .catch(()=>{try{sessionStorage.setItem('updWant',String(nw))}catch(e){}location.replace(location.pathname+'?v='+nw+'&t='+Date.now())})}
/* came back from an update but the old file was served anyway: say so, and quietly wait before asking again */
try{const w=+sessionStorage.getItem('updWant')||0;if(w){sessionStorage.removeItem('updWant');if(updNum(BUILD)<w){UPD.seen=w;setTimeout(()=>{UPD.seen=0},120000);setTimeout(()=>{try{hint('⏳ The website was still publishing the update, so you got the old version. It will offer it again in a couple of minutes.')}catch(e){}},4000)}}}catch(e){}
function updCheck(){if(!/^https?:$/.test(location.protocol))return;fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{if(!j)return;const nw=updNum(j.b),cur=updNum(BUILD);if(nw>cur&&nw>UPD.seen)updShow(j,nw)}).catch(()=>{})}
function updShow(j,nw){UPD.seen=nw;if(UPD.el)UPD.el.remove();const d=document.createElement('div');UPD.el=d;
 d.style.cssText='position:fixed;left:50%;top:calc(8px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:300;background:#14261a;border:2px solid #6ad89a;border-radius:12px;padding:10px 14px;font:15px Georgia,serif;color:#e8ffe8;box-shadow:0 4px 20px #000a;max-width:92vw;text-align:center';
 d.innerHTML='<b style="color:#9affc0">🆕 Update available: '+esc(String(j.b))+'</b>'+(j.notes?'<div style="font-size:13px;opacity:.85;margin:4px 0">'+esc(String(j.notes)).slice(0,240)+'</div>':'')+'<div style="font-size:12px;opacity:.7;margin:2px 0 6px">Your save is kept. Updating now ends a run you are in the middle of.</div><button id="updGo" style="margin:2px 4px;padding:6px 16px;font:bold 15px Georgia;border-radius:8px;border:2px solid #6ad89a;background:#1e4a2e;color:#e8ffe8;cursor:pointer">⬆️ Update now</button><button id="updNo" style="margin:2px 4px;padding:6px 14px;font:15px Georgia;border-radius:8px;border:2px solid #6a6a5a;background:#2a2a20;color:#e8e0c8;cursor:pointer">Later</button>';
 for(const ev of['mousedown','mouseup','click','touchstart'])d.addEventListener(ev,e=>e.stopPropagation());document.body.appendChild(d);
 d.querySelector('#updGo').onclick=()=>updGo(d,nw);d.querySelector('#updNo').onclick=()=>{d.remove();UPD.el=null}}
setTimeout(updCheck,6000);setInterval(updCheck,180000);
/* ---------- squads ---------- */
function milSqNear(q,x,z){const lz=P.z-q.OZ;return (milArea(P.x,lz)&&milArea(x,z))||Math.hypot(P.x-x,lz-z)<150}
{const mo0=milOpDone;milOpDone=function(q,o){const ok=q&&q.mil&&q.mil.op===o&&!o.fin;mo0(q,o);if(ok&&!dbgCheat)try{vehNet(q,{k:'msq',nm:o.D.nm,ic:o.D.ic||'🎖️',xp:o.D.xp|0,x:+P.x.toFixed(1),z:+(P.z-q.OZ).toFixed(1),by:SV.nm||'A teammate'});const sq=Object.values(q.vnet.rem).filter(r=>Date.now()-r.t<4000&&(r.mr|0)>=2&&milSqNear(q,r.x,r.z)).length;if(sq)setTimeout(()=>hint('🪖 Your squad ('+sq+' teammate'+(sq>1?'s':'')+') earned +'+(o.D.xp|0)+' XP too.'),1800)}catch(e){}}}
function milSqIn(q,o,id){const N=q.vnet,r=N.rem[id];
 if(o.k=='mrk'){if(r){r.mr=Math.max(0,Math.min(12,o.r|0));r.mx=Math.max(0,o.xp|0)}return}
 if(o.k=='msq'){const S=milSV();if((S.r|0)<2||!milSqNear(q,+o.x||0,+o.z||0)||dbgCheat)return;const xp=Math.max(0,Math.min(500,o.xp|0));if(!xp)return;S.ops=(S.ops|0)-1;/* milXP counts an op; a squad share is not your own op */milXP(q,xp,'Squad: '+fsName(String(o.by||''))+' finished '+String(o.ic||'')+' '+String(o.nm||'a job').slice(0,30))}}
{const dn0=desertNet;desertNet=function(o){try{if(o&&o.t=='dz'&&(o.k=='msq'||o.k=='mrk')){const q=BUS.ride,id=String(o.id||'');if(q&&q.vnet&&id&&id!==SV.pid)milSqIn(q,o,id);return}}catch(e){}return dn0(o)}}
/* share my rank now and then; draw teammates' ranks over their heads on the base */
function milRankTag(txt){const c=document.createElement('canvas');c.width=256;c.height=48;const k=c.getContext('2d');k.fillStyle='rgba(20,30,14,.85)';k.fillRect(0,0,256,48);k.strokeStyle='#9ab060';k.lineWidth=3;k.strokeRect(2,2,252,44);k.fillStyle='#e8f0c8';k.font='bold 22px Georgia';k.textAlign='center';k.textBaseline='middle';k.fillText(txt,128,25);
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));sp.scale.set(1.6,.3,1);sp.renderOrder=999;return sp}
setInterval(()=>{try{const q=BUS.ride;if(!q||!q.roam||!q.vnet)return;const S=milSV();if((q.mrT=(q.mrT||0)+1)%8==0)vehNet(q,{k:'mrk',r:S.r|0,xp:S.xp|0});
 for(const id in q.vnet.rem){const r=q.vnet.rem[id];if(!r.av)continue;const on=(r.mr|0)>=1&&milArea(r.x,r.z)&&milArea(P.x,P.z-q.OZ);const txt=on?(MILRANK[r.mr][1]+' '+MILRANK[r.mr][0].toUpperCase()+' · '+(r.mx|0)+' XP'):'';
  if(r.rtT!==txt){if(r.rtag){r.av.remove(r.rtag);r.rtag.material.map.dispose();r.rtag=null}r.rtT=txt;if(txt){r.rtag=milRankTag(txt);r.rtag.position.y=2.75;r.av.add(r.rtag)}}}}catch(e){}},500);
