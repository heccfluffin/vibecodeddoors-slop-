/* =====================================================================================================
   r522: co-op revives. While you are down, a button lets you pay to get yourself back up (no need to wait for everyone
   to fall). Admins get a REVIVE EVERYONE button. The debug / admin menu no longer freezes your game in multiplayer.
   ===================================================================================================== */
let DBGMP=0;
const srvB=document.createElement('button');srvB.style.cssText='position:fixed;left:50%;bottom:calc(150px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:58;display:none;font:bold 16px Georgia,serif;border-radius:10px;padding:10px 20px;cursor:pointer;border:2px solid #e070a0;background:#5a1a3a;color:#ffe0ee;box-shadow:0 4px 18px #000a';
document.body.appendChild(srvB);for(const ev of['mousedown','mouseup','touchstart'])srvB.addEventListener(ev,e=>e.stopPropagation());
srvB.onclick=e=>{e.stopPropagation();selfRevive()};
function selfRevOK(){return MP.on&&mpOpen().length&&mpDead&&!REVO&&!MODS.one&&!HUB.on}
function selfRevive(){if(!selfRevOK())return;const c=revCost();if(gold<c){sysLine('💜 Getting yourself back up costs '+c+' gold. You have '+gold+'.');snd(150,.2);return}
 gold-=c;runRev++;saveGame();updHud();badge('revived');conLog('event','Paid '+c+' gold to self-revive in co-op');
 const rn=mpLatest();let x=0,z=-.6,h=0;for(const q of mpAlive()){const o=MP.remotes[q];if(o.n==rn){x=o.x;z=o.z;h=1;break}}
 mpRevRecv({to:SV.pid,from:SV.pid,nm:'You',rn,x,z,h});mpSend({t:'rv',s:mpS(),to:SV.pid,tn:SV.nm||'Player',from:SV.pid,nm:SV.nm||'Player',rn,x:+(+x).toFixed(2),z:+(+z).toFixed(2),h});
 sysLine('💜 You paid '+c+' gold and got yourself back up.')}
setInterval(()=>{try{const on=selfRevOK();srvB.style.display=on?'block':'none';if(on){const c=revCost();srvB.textContent='💜 Revive yourself ('+(c?'🪙 '+c:'free')+')';srvB.style.opacity=gold>=c?1:.55}}catch(e){}},400);
/* admin: everybody who is down gets up, free */
function admReviveAll(){const r=myRank&&myRank();if(!r){hint('🛡️ Staff only.');return}if(!(MP.on&&mpOpen().length)){hint('💜 Revive everyone works in a co-op game.');return}
 const rn=mpLatest();let x=0,z=-.6,h=0;if(!mpDead&&n==rn){x=P.x;z=P.z;h=1}else for(const q of mpAlive()){const o=MP.remotes[q];if(o.n==rn){x=o.x;z=o.z;h=1;break}}let k=0;
 for(const id in MP.remotes){const o=MP.remotes[id];if(!o.dd||Date.now()-o.t>8000)continue;mpSend({t:'rv',s:mpS(),to:id,tn:o.name,from:SV.pid,nm:'🛡️ '+(SV.nm||'An admin'),rn,x:+(+x).toFixed(2),z:+(+z).toFixed(2),h});o.dd=false;k++}
 if(mpDead){mpRevRecv({to:SV.pid,from:SV.pid,nm:'🛡️ Admin',rn,x,z,h});mpSend({t:'rv',s:mpS(),to:SV.pid,tn:SV.nm||'Player',from:SV.pid,nm:SV.nm||'Player',rn,x:+(+x).toFixed(2),z:+(+z).toFixed(2),h});k++}
sysLine(k?'💜 Revived '+k+' player'+(k>1?'s':'')+'.':'💜 Nobody is down right now.');[523,659,784,1047].forEach((f,i)=>setTimeout(()=>snd(f,.2),i*90))}
/* revived behind a chase a teammate already finished: you are brought to the end of it, so Seek does not start over */
function mpReviveChaseFix(){const e=MP.ceN|0;if(!e||mpDead||state!='play')return;if(n<e&&e-n<=12){try{for(const k of['seek']){smRelinquish(k);MP.sm[k].au='';MP.sm[k].act=0}}catch(x){}try{const r=RMS[ci];if(r&&r.seek&&r.seek.on){r.seek.on=false;r.seek.visible=false}}catch(x){}
 mpTpTo(e,0,.4,'⏩ '+(MP.ceNm||'A teammate')+' already finished that chase: you were brought to the end of it.')}}
/* Figure Cola in co-op: whoever runs Figure shares how far into his drink he is, and everybody else's copy of him
   picks up the can, drinks it and says thank you too */
function figGhostDrink(gh,g,m,room,dt){const md=g.children[0],ar=md&&md.userData.arms,right=ar&&(ar.find(a=>a.userData.s>0)||ar[0]),T1=+m.dk||0,s=right?right.userData.s:1;
 const sm=u=>u<=0?0:u>=1?1:u*u*(3-2*u);let rx=0,rz=0,flip=0;if(T1<.7){rx=1.0*sm(T1/.7)}else if(T1<1.8){const u=sm((T1-.7)/1.1);rx=1.0+1.25*u;rz=-s*.42*u;flip=u}else if(T1<19){rx=2.25+Math.sin(T1*3.2)*.07;rz=-s*.42;flip=1}else{const u=sm(Math.min(1,T1-19));rx=2.25*(1-u);rz=-s*.42*(1-u);flip=1-u}
 if(right){right.rotation.x=rx;right.rotation.z=rz}
 const vend=(room.dq||[]).find(d=>d.k=='vend'&&d.used);
 if(T1>.7&&!gh.can&&right){gh.can=mkCan();gh.can.position.set(0,-1.66,0);gh.can.scale.setScalar(1.6);right.add(gh.can);if(vend&&vend.can&&vend.can.parent){vend.can.parent.remove(vend.can);vend.can=null}say('Figure','Ahh. FIGURE COLA.');snd(1800,.05)}
 if(gh.can){gh.can.rotation.x=flip*.3;if(T1>1.8&&T1<19&&(gh.fz=(gh.fz||0)-dt)<=0){gh.fz=.15;const w=new THREE.Vector3(0,.13,0);gh.can.localToWorld(w);try{vfx('bubble',w.x,w.y,w.z,{n:2})}catch(e){}}}
 if(T1>=19.2&&!gh.thx){gh.thx=1;say('Figure','Thank you, little ones. I was SO thirsty.');snd(70,.5);FIGDRINK=1;if(vend)vend.broken=1;try{badge('figcola')}catch(e){}}}
function figGhostDrinkEnd(gh){if(gh.can){if(gh.can.parent)gh.can.parent.remove(gh.can);gh.can=null}gh.thx=0}
