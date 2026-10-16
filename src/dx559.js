/* =====================================================================================================
   r559: THE DOORS SERVER (doors-server.heccfluffin.workers.dev, a Cloudflare Worker).
   - The lobby, public rooms, live rooms, leaderboards and the ban registry go through DOORS' own server instead of
     the free public message boards. The rest of the game does not know the difference: SrvCl looks exactly like the
     MQTT client it used before. If the server cannot be reached the game falls back to the public boards.
   - Matchmaking (connecting two players' browsers) goes through the server too; the game itself is still direct.
     A joiner who cannot find the room there also tries the old service, so older versions can still be joined.
   - Every player proves their device ID to the server. The server enforces bans (device AND connection) and kicks.
     Owner/admin panel: a live "online now" list with KICK buttons (kicked players are out for 10 minutes).
   ===================================================================================================== */
const DSRV={host:(()=>{try{return localStorage.getItem('doorsSrvHost')||''}catch(e){return''}})()||'doors-server.heccfluffin.workers.dev',ws:'',ok:0,down:0,banned:null,kickUntil:0,pjDead:0,who:null,staff:0};DSRV.loc=/^localhost(:|$)/.test(DSRV.host);DSRV.ws=(DSRV.loc?'ws://':'wss://')+DSRV.host+'/ws';
try{PUB_BROKERS.unshift(DSRV.ws)}catch(e){}
async function srvIdReady(){for(let i=0;i<40&&!(typeof ID!='undefined'&&ID.ready);i++)await new Promise(r=>setTimeout(r,100))}
const SRVCL=new Set();
class SrvCl{
 constructor(url,opt){this.url=url;this.opt=opt||{};this.h={};this.connected=false;this.subs=new Set();this.q=[];this.ended=false;this.n=0;this.acks={};this.everOk=0;SRVCL.add(this);this.open()}
 on(ev,f){(this.h[ev]=this.h[ev]||[]).push(f);return this}
 emit(ev,...a){for(const f of(this.h[ev]||[]).slice())try{f(...a)}catch(e){}}
 open(){if(this.ended)return;if(DSRV.banned||DSRV.kickUntil>Date.now()){setTimeout(()=>this.emit('error',new Error(DSRV.banned?'banned':'kicked')),0);return}
  let ws;try{let u=this.url;try{const ti=localStorage.getItem('doorsSrvIp');if(ti&&DSRV.loc)u+='?ip='+encodeURIComponent(ti)}catch(e){}ws=new WebSocket(u)}catch(e){DSRV.down=1;setTimeout(()=>this.emit('error',e),0);return}this.ws=ws;
  const ct=setTimeout(()=>{if(!this.connected&&this.ws===ws){try{ws.close()}catch(e){}}},this.opt.connectTimeout||7000);
  ws.onmessage=async ev=>{let d;try{d=JSON.parse(ev.data)}catch(e){return}
   if(d.o=='nonce'){const hi={o:'hi',p:(typeof SV!='undefined'&&SV.pid)||'',nm:(typeof SV!='undefined'&&SV.nm)||''};if(this.opt.will&&this.opt.will.topic)hi.will={t:this.opt.will.topic,m:String(this.opt.will.payload||''),r:this.opt.will.retain?1:0};
    try{await srvIdReady();if(ID.key&&ID.pub){hi.x=ID.pub.x;hi.y=ID.pub.y;hi.s=await idSign(ID.key,'doorssrv|'+d.n)}}catch(e){}try{ws.send(JSON.stringify(hi))}catch(e){}return}
   if(d.o=='ok'){clearTimeout(ct);this.connected=true;this.everOk=1;DSRV.ok=1;DSRV.down=0;DSRV.staff=d.staff?1:0;if(this.subs.size)ws.send(JSON.stringify({o:'sub',t:[...this.subs]}));for(const m of this.q)ws.send(m);this.q=[];
    clearInterval(this.ka);this.ka=setInterval(()=>{try{if(ws.readyState===1)ws.send('{"o":"ping"}')}catch(e){}},25000);this.emit('connect');return}
   if(d.o=='msg'){this.emit('message',d.t,d.m==null?'':String(d.m),{retain:!!d.r});return}
   if(d.o=='puback'){const f=this.acks[d.id];delete this.acks[d.id];if(f)try{f()}catch(e){}return}
   if(d.o=='ban'){srvBanned(d);return}
   if(d.o=='kick'){srvKicked(d.why);return}
   if(d.o=='kicked'){srvDrop(d.u);return}
   if(d.o=='who'){DSRV.who=d.l||[];DSRV.whoT=Date.now();try{if(typeof admOpen!='undefined'&&admOpen)srvWhoDraw()}catch(e){}return}
   if(d.o=='kickr'){hint(d.ok?'👢 Kicked'+(d.n?'':' (they were not connected, but they are blocked for 10 minutes)')+'.':'👢 Kick refused: '+(d.m||''));try{srvWho()}catch(e){}return}};
  ws.onclose=()=>{clearTimeout(ct);clearInterval(this.ka);const was=this.connected;this.connected=false;if(this.ws!==ws)return;
   if(!this.everOk){DSRV.down=1;this.emit('error',new Error('The DOORS server did not answer'));return}
   this.emit('close');if(!this.ended&&(this.opt.reconnectPeriod|0)>0&&!DSRV.banned){setTimeout(()=>{if(this.ended)return;this.emit('reconnect');this.open()},Math.max(this.opt.reconnectPeriod,DSRV.kickUntil>Date.now()?DSRV.kickUntil-Date.now()+500:0))}};
  ws.onerror=()=>{}}
 raw(o){const s=JSON.stringify(o);if(this.connected&&this.ws&&this.ws.readyState===1)this.ws.send(s);else this.q.push(s)}
 publish(t,m,opts,cb){if(typeof opts=='function'){cb=opts;opts={}}const o={o:'pub',t:String(t),m:m==null?'':String(m),r:opts&&opts.retain?1:0};if(cb){o.id=++this.n;this.acks[o.id]=cb}this.raw(o);return this}
 subscribe(t,opts,cb){if(typeof opts=='function')cb=opts;const ts=Array.isArray(t)?t:typeof t=='object'&&t?Object.keys(t):[t];for(const x of ts)this.subs.add(x);if(this.connected)this.raw({o:'sub',t:ts});if(cb)setTimeout(cb,0);return this}
 unsubscribe(t){const ts=Array.isArray(t)?t:[t];for(const x of ts)this.subs.delete(x);if(this.connected)this.raw({o:'uns',t:ts});return this}
 end(force,cb){if(typeof force=='function')cb=force;this.ended=true;try{if(this.ws&&this.ws.readyState===1)this.ws.send('{"o":"bye"}')}catch(e){}this.connected=false;clearInterval(this.ka);try{this.ws&&this.ws.close()}catch(e){}SRVCL.delete(this);if(cb)setTimeout(cb,0);return this}
}
/* the public boards, as a fallback: the library is only loaded if the server is down */
class LazyMq{constructor(url,opt){this.h=[];this.q=[];this.c=null;pubLibCDN().then(()=>{if(this.ended)return;this.c=window.mqtt.connect(url,opt);for(const[e,f]of this.h)this.c.on(e,f);for(const fn of this.q)fn(this.c);this.q=[]}).catch(e=>{for(const[ev,f]of this.h)if(ev=='error')try{f(e)}catch(x){}})}
 get connected(){return !!(this.c&&this.c.connected)}
 on(e,f){this.h.push([e,f]);if(this.c)this.c.on(e,f);return this}
 _do(fn){if(this.c)fn(this.c);else this.q.push(fn);return this}
 publish(...a){return this._do(c=>c.publish(...a))}subscribe(...a){return this._do(c=>c.subscribe(...a))}unsubscribe(...a){return this._do(c=>c.unsubscribe(...a))}end(...a){this.ended=1;return this._do(c=>c.end(...a))}}
function mqConnect(url,opt){if(url===DSRV.ws)return new SrvCl(url,opt);if(DSRV.banned||DSRV.kickUntil>Date.now())throw new Error('refused');if(window.mqtt&&window.mqtt.connect)return window.mqtt.connect(url,opt);return new LazyMq(url,opt)}
function pubLib(){if(DSRV.down){return pubLibCDN()}return Promise.resolve()}
/* ---------- matchmaking ---------- */
{const pn0=pjNew;pjNew=function(id){if(DSRV.pjDead||DSRV.pjCloud||!window.Peer)return pn0(id);return new Peer(id,{host:DSRV.host.split(':')[0],port:DSRV.loc?+(DSRV.host.split(':')[1]||80):443,path:'/',secure:!DSRV.loc,key:'doors',config:{iceServers:mpIce()},debug:0})}}
{const h0=pjHost;pjHost=async function(){try{return await h0.apply(this,arguments)}catch(e){if(DSRV.pjDead||/free room code/.test(String(e)))throw e;conLog('co-op','DOORS server matchmaking failed ('+e+'), using the old service this time');DSRV.pjDead=1;setTimeout(()=>{DSRV.pjDead=0},5*60*1000);return h0.apply(this,arguments)}}}
{const j0=pjJoin;pjJoin=async function(code){let e1=null;
 /* try your server first, then the old service; if both fail, report the most useful reason (not just "no game") */
 const order=DSRV.pjDead?[1,0]:[0,1];
 for(const cloud of order){if(!cloud&&(DSRV.banned||DSRV.kickUntil>Date.now()))continue;DSRV.pjCloud=cloud;try{const r=await j0.apply(this,arguments);if(!cloud)DSRV.pjDead=0;return r}catch(e){const msg=String(e&&e.message||e);conLog('co-op','join via '+(cloud?'old service':'DOORS server')+' failed: '+msg);if(!e1||(/No game with that code/.test(String(e1))&&!/No game with that code/.test(msg)))e1=e}finally{DSRV.pjCloud=0}}
 if(e1&&/Timed out connecting|Could not connect/.test(String(e1)))throw 'Found the room, but could not connect to the host directly. One of your networks may be blocking direct connections (common on school wifi or mobile data). Try another network, or the manual codes.';
 throw e1}}
/* ---------- bans and kicks from the server ---------- */
function srvBanned(d){DSRV.banned=d;try{for(const c of SRVCL)c.ended=true}catch(e){}ID.banned={by:d.by||'the staff',at:Date.now(),why:(d.conn?'This internet connection is banned (another account was banned on it). ':'')+(d.why||'')};try{banShow()}catch(e){}}
function srvKicked(why){DSRV.kickUntil=Date.now()+10*60*1000;try{if(MP.on)mpLeave(true)}catch(e){}try{if(HUB.on)hubLeave(true)}catch(e){}try{if(state=='bus'||state=='play')clearAll&&0}catch(e){}
 let el=document.getElementById('srvKick');if(!el){el=document.createElement('div');el.id='srvKick';el.style.cssText='position:fixed;inset:0;z-index:99998;background:rgba(10,4,0,.9);display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;color:#ffe0c0;text-align:center;padding:20px';document.body.appendChild(el)}
 el.innerHTML='<div style="max-width:520px;border:3px solid #d08020;border-radius:14px;padding:22px;background:#1a0e04"><div style="font-size:50px">👢</div><h2 style="color:#ffb050;letter-spacing:2px">YOU WERE KICKED</h2><p>'+esc(why||'You were kicked by staff.')+'</p><p style="font-size:13px;opacity:.75">You can still play on your own. Co-op and the lobby open again in 10 minutes.</p><button style="margin-top:8px;padding:8px 22px;font:bold 16px Georgia;border-radius:8px;border:2px solid #d08020;background:#3a2008;color:#ffe0c0;cursor:pointer">OK</button></div>';el.style.display='flex';el.querySelector('button').onclick=()=>{el.style.display='none'};try{document.exitPointerLock()}catch(e){}}
function srvDrop(u){if(!u)return;try{for(const k in MP.peers){const p=MP.peers[k];const pu=p.uid||(p.id&&RKS[p.id]&&RKS[p.id].u);if(pu===u){sysLine('👢 '+(p.name||'A player')+' was kicked by staff.');mpDrop(k)}}}catch(e){}
 try{for(const pid in HUB.ps){const r=(HUB.rkx&&HUB.rkx[pid])||RKS[pid];if(r&&r.u===u){const q=HUB.ps[pid];if(q.g){S.remove(q.g);try{disposeObj(q.g)}catch(e){}}delete HUB.ps[pid];sysLine('👢 '+(q.nm||'A player')+' was kicked by staff.')}}}catch(e){}}
/* ---------- the owner/admin panel: who is online, and KICK ---------- */
function srvCl(){if(PUB.cl instanceof SrvCl&&PUB.cl.connected)return PUB.cl;for(const c of SRVCL)if(c.connected)return c;return null}
function srvWho(){const c=srvCl();if(c)c.raw({o:'who'})}
async function srvKick(u,why,nm){u=uidNorm(u);if(!u){hint('👢 That is not a user ID.');return}if(!ID.key){hint('👢 This device has no ID key.');return}const c=srvCl();if(!c){hint('👢 Not connected to the DOORS server right now.');return}
 const k={u,by:ID.uid,at:Date.now(),why:String(why||'').slice(0,80)};const s=await idSign(ID.key,'doorskick|'+canon({u:k.u,by:k.by,at:k.at,why:k.why}));c.raw(Object.assign({o:'kick',x:ID.pub.x,y:ID.pub.y,s},k));sysLine('👢 Kicking '+(nm?nm+' ':'')+u+'…')}
function srvWhoDraw(){const box=document.getElementById('srvWhoBox');if(!box)return;const L=(DSRV.who||[]).filter(x=>x.u||x.nm);const own=myRank()=='owner';
 box.innerHTML=!srvCl()?'<div style="opacity:.7;font-size:13px">Not connected to the DOORS server (using the public boards).</div>':!DSRV.who?'<div style="opacity:.7;font-size:13px">Asking the server…</div>':(L.length?L.map(x=>{const rk=x.u?rankOfUid(x.u):'';const me=x.u&&x.u===ID.uid;const can=x.u&&!me&&rk!='owner'&&(own||rk!='admin');const nm=String(x.nm||'Player').replace(/[<>&'"]/g,'');
  return'<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;padding:3px 6px;border-bottom:1px solid #3a2a16"><span><b>'+esc(x.nm||'Player')+'</b> <span style="font-size:11px;opacity:.7">'+(x.u||'no ID')+'</span>'+(rk?' '+RKI[rk]:'')+(me?' <i style="font-size:11px">(you)</i>':'')+'</span><span>'+(can?sBtn('👢 Kick','srvKick(\''+x.u+'\',prompt(\'Reason (optional)\')||\'\',\''+nm+'\')','#4a2a08')+(isBanned(x.u)?'':sBtn('🚫 Ban','staffBan(\''+x.u+'\',prompt(\'Reason (optional)\')||\'\',\''+nm+'\')','#4a1010')):'')+'</span></div>'}).join(''):'<div style="opacity:.7;font-size:13px">Nobody is online.</div>')+'<div style="margin-top:4px">'+sBtn('↻ Refresh','srvWho()')+'</div>'}
{const ap0=admPanel;admPanel=function(){const r=ap0.apply(this,arguments);try{const d=document.getElementById('staffDlg');if(d&&d.style.display!='none'&&!document.getElementById('srvWhoBox')){const h=[...d.querySelectorAll('h3')].find(x=>/Players here/.test(x.textContent));const sec=document.createElement('div');sec.innerHTML='<h3 style="margin:10px 0 4px">🌐 Online now (DOORS server)</h3><div style="font-size:12px;opacity:.7;margin-bottom:4px">Everyone connected anywhere: menus, lobby, co-op, the desert. KICK = out for 10 minutes. BAN = their device and their internet connection.</div><div id="srvWhoBox"></div>';if(h)h.parentNode.insertBefore(sec,h);else d.firstChild.appendChild(sec);srvWhoDraw();srvWho()}}catch(e){}return r}}
/* the account panel: show which service you are on */
setInterval(()=>{try{ID.srv=srvCl()?'DOORS server':DSRV.down?'public boards (server unreachable)':'connecting'}catch(e){}},3000);
