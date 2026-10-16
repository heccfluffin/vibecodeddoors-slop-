/* =====================================================================================================
   r568: FRIENDS BY USER ID, with an INBOX.
   - Type a friend's user ID (U-XXXX-XXXX) and press Send: a friend request lands in their inbox (a retained note on the
     board at .../fr/<their id>/<your id>), even if they are offline right now. They Accept or Decline.
   - Accepting adds each of you to the other's list. Friends added this way (or with a new friend code) stay up to date:
     every player keeps a signed profile note (.../fp/<id>) with their stats and badges, and friends listen for it.
   - Every note is signed with the sender's device key and checked against their user ID, so nobody can send requests or
     stats pretending to be someone else.
   ===================================================================================================== */
const FRB=REG_T.replace(/reg\/$/,''),FRQ={inbox:{},sent:{},cl:null,pubT:0,dirtyT:0};
const frIn=()=>FRB+'fr/'+ID.uid+'/',frProf=u=>FRB+'fp/'+u;
async function frSign(o){const s=await idSign(ID.key,'doorsfr|'+canon(o));return JSON.stringify({o,x:ID.pub.x,y:ID.pub.y,s})}
async function frCheck(txt){let m;try{m=JSON.parse(txt)}catch(e){return null}if(!m||!m.o||typeof m.o!='object')return null;try{if(await uidOf(String(m.x),String(m.y))!==m.o.from)return null;if(!await idVerify(String(m.x),String(m.y),'doorsfr|'+canon(m.o),String(m.s)))return null}catch(e){return null}return m.o}
function frSubAll(){const cl=FRQ.cl;if(!cl||!ID.uid)return;try{cl.subscribe(frIn()+'+')}catch(e){}for(const f of(SV.fr||[]))if(f.u)try{cl.subscribe(frProf(f.u))}catch(e){}}
async function frNet(){if(!ID.ready||!ID.uid||!ID.key||ID.banned)return null;try{const cl=await pubConnect();if(!cl)return null;if(FRQ.cl!==cl){FRQ.cl=cl;cl.on('message',(t,m)=>{frMsg(String(t),m==null?'':String(m))});cl.on('connect',()=>{frSubAll();frPublish(1)})}frSubAll();return cl}catch(e){return null}}
async function frPublish(force){const cl=FRQ.cl;if(!cl||!cl.connected||!ID.key)return;const now=Date.now();if(!force&&now-FRQ.pubT<60000)return;FRQ.pubT=now;try{const snap=fsSnap();cl.publish(frProf(ID.uid),await frSign({t:'p',from:ID.uid,snap}),{retain:true,qos:0})}catch(e){}}
function frAdd(snap,u){const f=fsOne(Object.assign({},snap,{u}));if(!f||f.id===SV.pid)return null;fsEnsure();const i=SV.fr.findIndex(x=>x.id===f.id||(u&&x.u===u));if(i>=0)SV.fr[i]=f;else{if(SV.fr.length>=40)return null;SV.fr.push(f)}saveGame();try{badge('friend')}catch(e){}try{FRQ.cl&&FRQ.cl.subscribe(frProf(u))}catch(e){}return f}
async function frMsg(t,txt){if(!ID.uid)return;
 if(t.startsWith(frIn())){const from=t.slice(frIn().length);if(!txt){delete FRQ.inbox[from];frRedraw();return}const o=await frCheck(txt);if(!o||o.to!==ID.uid||o.from!==from)return;
  if(o.t=='req'){if((SV.fr||[]).some(f=>f.u===from)){frClear(from);return}if(isBanned(from))return;const isNew=!FRQ.inbox[from];FRQ.inbox[from]=o;frRedraw();if(isNew&&Date.now()-(+o.at||0)<36e5)try{hint('📬 Friend request from '+esc(fsName(o.nm)||'a player')+'. Open 👥 Friends to accept it.')}catch(e){}}
  else if(o.t=='acc'){const f=frAdd(o.snap||{},from);frClear(from);delete FRQ.sent[from];if(f){try{hint('👥 '+esc(f.n)+' accepted your friend request!')}catch(e){}frPublish(1)}frRedraw()}return}
 if(t.startsWith(FRB+'fp/')){const u=t.slice((FRB+'fp/').length);if(!txt)return;const i=(SV.fr||[]).findIndex(f=>f.u===u);if(i<0)return;const o=await frCheck(txt);if(!o||o.from!==u||o.t!='p')return;const f=fsOne(Object.assign({},o.snap,{u}));if(!f)return;const old=SV.fr[i];if(f.t<=(old.t||0))return;SV.fr[i]=f;if(Date.now()-FRQ.dirtyT>5000){FRQ.dirtyT=Date.now();saveGame()}frRedraw()}}
function frClear(from){try{FRQ.cl&&FRQ.cl.publish(frIn()+from,'',{retain:true,qos:0})}catch(e){}delete FRQ.inbox[from]}
async function frRequest(raw){const u=uidNorm(raw);if(!u)return'That is not a user ID (they look like U-ABCD-EFGH).';if(u===ID.uid)return'That is your own user ID.';if((SV.fr||[]).some(f=>f.u===u))return'They are already your friend.';
 const cl=await frNet();if(!cl)return'Could not reach the DOORS server right now. Try again in a moment.';
 const o={t:'req',from:ID.uid,to:u,nm:SV.nm||'Player',snap:fsSnap(),at:Date.now()};try{cl.publish(FRB+'fr/'+u+'/'+ID.uid,await frSign(o),{retain:true,qos:1})}catch(e){return'Could not send it.'}FRQ.sent[u]=Date.now();frPublish(1);return''}
async function frAccept(from){const o=FRQ.inbox[from];if(!o)return;const f=frAdd(o.snap||{},from);frClear(from);const cl=await frNet();if(cl){try{cl.publish(FRB+'fr/'+from+'/'+ID.uid,await frSign({t:'acc',from:ID.uid,to:from,nm:SV.nm||'Player',snap:fsSnap(),at:Date.now()}),{retain:true,qos:1})}catch(e){}frPublish(1)}try{hint(f?'👥 You and '+esc(f.n)+' are friends now.':'👥 Your friend list is full (40).')}catch(e){}frRedraw()}
function frDecline(from){frClear(from);frRedraw()}
const frCount=()=>Object.keys(FRQ.inbox).length;
/* the friends panel: an ID / inbox box at the top */
function frBox(){const n=frCount(),L=Object.entries(FRQ.inbox).sort((a,b)=>(b[1].at||0)-(a[1].at||0));const pend=Object.keys(FRQ.sent).filter(u=>!(SV.fr||[]).some(f=>f.u===u));
 return '<div id="frIdBox" style="border:1px solid #6a5a3a;border-radius:12px;padding:10px 12px;margin:0 0 10px;background:rgba(0,0,0,.25)">'+
  '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between"><div>Your user ID: <b style="font-family:monospace;color:#ffd860;font-size:16px">'+(ID.uid||'…')+'</b> <button data-fr="copy" style="background:#2a1c10;color:#e8d9b0;border:1px solid #d4a850;border-radius:8px;padding:3px 9px;cursor:pointer">Copy</button></div>'+
  '<div style="display:flex;gap:6px;align-items:center"><input id="frU" placeholder="Friend\'s ID: U-XXXX-XXXX" maxlength="11" style="background:#120c06;color:#ffd860;border:1px solid #6a5a3a;border-radius:8px;padding:5px 8px;font:14px monospace;width:170px"><button data-fr="send" style="background:#24482b;color:#eaffee;border:1px solid #7fd08f;border-radius:8px;padding:5px 11px;cursor:pointer">➕ Send request</button></div></div>'+
  '<div id="frMsg" style="font-size:13px;min-height:1.2em;margin-top:4px;color:#80e080"></div>'+
  '<div style="font-weight:bold;color:#ffd860;margin-top:4px">📬 Inbox'+(n?' ('+n+')':'')+'</div>'+
  (L.length?L.map(([u,o])=>'<div style="display:flex;align-items:center;gap:8px;justify-content:space-between;padding:6px 8px;border:1px solid #4d3a1f;border-radius:10px;margin-top:5px"><span><b>'+esc(fsName(o.nm)||'Player')+'</b> <span style="font-family:monospace;font-size:12px;opacity:.75">'+u+'</span><br><span style="font-size:12px;opacity:.75">best door '+((o.snap&&o.snap.b)|0)+' · '+((o.snap&&o.snap.w)|0)+' escapes · '+(o.at?new Date(o.at).toLocaleString():'')+'</span></span><span><button data-fr="acc" data-u="'+u+'" style="background:#24482b;color:#eaffee;border:1px solid #7fd08f;border-radius:8px;padding:4px 10px;cursor:pointer">✔ Accept</button> <button data-fr="dec" data-u="'+u+'" style="background:#2a1c10;color:#e8d9b0;border:1px solid #7a6034;border-radius:8px;padding:4px 10px;cursor:pointer">Decline</button></span></div>').join(''):'<div style="font-size:13px;opacity:.65;margin-top:3px">No friend requests.'+(FRQ.cl&&FRQ.cl.connected?'':' (connecting…)')+'</div>')+
  (pend.length?'<div style="font-size:12px;opacity:.7;margin-top:6px">⏳ Waiting for: '+pend.map(u=>'<span style="font-family:monospace">'+u+'</span>').join(', ')+'</div>':'')+
  '<div style="font-size:12px;opacity:.6;margin-top:6px">Friends added by ID keep their stats up to date by themselves. Friend codes still work too.</div></div>'}
function frRedraw(){try{if(frp.style.display=='flex'){const b=document.getElementById('frIdBox');if(b&&!b.contains(document.activeElement)){b.outerHTML=frBox();frWire()}}}catch(e){}try{frNavCount()}catch(e){}}
function frWire(){const b=document.getElementById('frIdBox');if(!b||b.__w)return;b.__w=1;b.addEventListener('keydown',e=>e.stopPropagation());
 b.addEventListener('click',async e=>{const t=e.target.closest('[data-fr]');if(!t)return;e.stopPropagation();const a=t.dataset.fr,msg=m=>{const x=document.getElementById('frMsg');if(x){x.style.color=/^✔/.test(m)?'#80e080':'#ff9a80';x.textContent=m}};
  if(a=='copy'){try{navigator.clipboard.writeText(ID.uid||'')}catch(x){}msg('✔ Copied your ID. Send it to a friend.')}
  else if(a=='send'){const v=document.getElementById('frU').value;msg('Sending…');const r=await frRequest(v);if(r)msg(r);else{msg('✔ Request sent to '+uidNorm(v)+'. It waits in their inbox until they accept.');document.getElementById('frU').value=''}}
  else if(a=='acc')frAccept(t.dataset.u);else if(a=='dec')frDecline(t.dataset.u)})}
{const fd0=frDraw;frDraw=function(){const r=fd0.apply(this,arguments);try{const host=frp.firstElementChild;if(host&&!document.getElementById('frIdBox')){const sc=host.children[1]||host;const w=document.createElement('div');w.innerHTML=frBox();sc.insertBefore(w.firstChild,sc.firstChild);frWire()}}catch(e){conLog('error','friends inbox: '+e.message)}frNet();return r}}
/* the Friends button on the title screen shows how many requests are waiting */
function frNavCount(){const n=frCount();document.querySelectorAll('#svb .uik-nav button').forEach(b=>{if(/Friends/.test(b.textContent)){const t='👥 Friends'+(n?' · 📬 '+n:'');if(b.textContent!==t)b.textContent=t}})}
setInterval(()=>{try{frNavCount()}catch(e){}},1500);
/* start listening once the device ID is ready, and keep my profile note fresh */
setTimeout(function frBoot(){if(!ID.ready){setTimeout(frBoot,3000);return}frNet().then(()=>frPublish(1))},6000);
setInterval(()=>{try{if(FRQ.cl&&FRQ.cl.connected)frPublish(0);else if(ID.ready&&!document.hidden)frNet()}catch(e){}},60000);
