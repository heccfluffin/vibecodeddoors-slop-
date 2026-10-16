/* ---------- r561: group runs that can't reach their host ----------
   When the crew's host can't be reached, everyone who failed says so on <lobby>go2. The failed player with the
   smallest id becomes the new host and posts a fresh room code there; the others join it. Anyone left with
   nobody to go with is taken back to the lobby with an explanation, instead of a black screen. */
const GRP={g:null};
function grpPub(o){const G=GRP.g;if(!G)return;try{PUB.cl&&PUB.cl.publish(G.k+'go2',JSON.stringify(Object.assign({i:SV.pid,r:G.r},o)))}catch(e){}}
function grpListen(){const cl=PUB.cl;if(!cl||cl.__grp)return;cl.__grp=1;cl.on('message',(t,m)=>{const G=GRP.g;if(!G||String(t)!==G.k+'go2')return;let o;try{o=JSON.parse(String(m))}catch(e){return}
  const id=fsPid(o&&o.i);if(!id||id==SV.pid||o.r!==G.r)return;
  if(o.f)G.fails.add(id);
  else if(/^[A-Z0-9]{6}$/.test(String(o.code||''))&&!G.code2){G.code2=String(o.code);G.by=id}})}
function grpStart(k,host,o){GRP.g={k,host,r:String(o.code||''),d:o.d?1:0,m:Array.isArray(o.m)?o.m.filter(x=>typeof x=='string').slice(0,20):[],fails:new Set(),code2:'',by:'',done:0,ids:o.ids.slice(0,12),nm:{}};
 for(const id in (HUB.ps||{}))GRP.g.nm[id]=HUB.ps[id].nm||'A player';
 try{grpListen();PUB.cl&&PUB.cl.subscribe(k+'go2')}catch(e){}
 /* forget it after a while: by then everyone has either connected or given up */
 const g=GRP.g;setTimeout(()=>{if(GRP.g===g&&g.done)grpEnd()},90000)}
function grpEnd(){const G=GRP.g;GRP.g=null;try{if(G&&PUB.cl&&!HUB.on)PUB.cl.unsubscribe(G.k+'go2')}catch(e){}}
const grpWhy=e=>typeof e=='string'?e:(e&&e.message)||String(e);
async function grpBack(msg){const G=GRP.g;if(G)G.done=1;grpEnd();MP.auto=0;HUBRUN=0;try{mpLeave(true)}catch(e){}MP.on=false;
 try{await hubEnter()}catch(e){}setTimeout(()=>{hint(msg);sysLine('⚠️ '+msg)},800)}
function grpFail(e){const G=GRP.g;MP.auto=0;if(!G||G.done){sysLine('Could not join the group: '+grpWhy(e));grpBack('Could not reach the host of the group run, so you are back in the lobby.');return}
 const hn=G.nm[G.host]||'the host';
 sysLine('Could not reach '+hn+' ('+grpWhy(e)+'). Checking if the rest of the group can go up together...');
 G.fails.add(SV.pid);grpPub({f:1});const t0=Date.now();
 const tick=()=>{if(G.done||GRP.g!==G)return;const el=Date.now()-t0;
  if(G.code2){G.done=1;sysLine('🔁 '+(G.nm[G.by]||'Another player')+' is hosting the group instead. Joining...');MP.auto=1;HUBRUN=1;
   pjJoin(G.code2).then(()=>{sysLine('🔗 Connected: the run starts when the new host is ready.');grpEnd()}).catch(e2=>{grpBack('Could not reach the host of the group run, or the backup host ('+grpWhy(e2)+'). Your network may be blocking direct connections (common on school wifi or mobile data). You are back in the lobby.')});return}
  const f=[...G.fails].sort();
  if(f.length>=2&&f[0]===SV.pid&&el>=3000){G.done=1;grpHost(G,f.slice(1));return}
  if(el>30000){grpBack(f.length>=2?'The backup host never answered, so you are back in the lobby.':'Could not reach '+hn+' for the group run. One of your networks may be blocking direct connections (common on school wifi or mobile data). You are back in the lobby: try again, or play on your own.');return}
  setTimeout(tick,400)};
 tick()}
/* the backup host: same as the elevator host, waiting for whoever else could not reach the first host */
async function grpHost(G,crew){MP.auto=0;HUBRUN=1;HUB.dailyGo=!!G.d;RUNMODS=G.m.slice();const go=()=>{grpEnd();HUB.dailyGo?dailyStart():playNow()};
 sysLine('🛗 You are hosting the group instead. Waiting for the others...');
 try{const code=await pjHost();grpPub({code,ids:crew});
  const t0=Date.now();const wait=()=>{const ok=mpOpen().length;if(ok>=crew.length||(ok>0&&Date.now()-t0>8000)||Date.now()-t0>15000){if(!ok){sysLine('Nobody connected in time: starting on your own.');mpLeave(true)}go()}else setTimeout(wait,400)};wait()}
 catch(e){sysLine('Could not make a group room ('+grpWhy(e)+').');grpBack('Could not make a backup room for the group, so you are back in the lobby.')}}
/* ---------- r561/r567: /rank — staff set army ranks (their own or another player's), and undo busts ----------
   /rank Sergeant · /rank undo · /rank Bob Sergeant · /rank Bob undo. The last 5 busts are kept on each save. */
/* r567: milestone ranks. A bust never drops you below the milestone under your rank: Private, Sergeant, Captain, Colonel, General, Supreme Commander */
const MILMS=[2,4,6,8,9,12];function milFloor(r){let f=0;for(const m of MILMS)if(m<r)f=m;return f}
function rkFind(a){a=String(a||'').trim().toLowerCase();if(!a)return-1;let r=MILRANK.findIndex(k=>k[0].toLowerCase()==a);if(r<0)r=MILRANK.findIndex(k=>k[0].toLowerCase().startsWith(a));return r}
/* change MY rank: arg is a rank name or 'undo'; returns a message */
function rkApply(arg){const S=milSV();if(String(arg).toLowerCase()=='undo'){const bl=Array.isArray(S.bl)?S.bl:(S.lost?[S.lost]:[]);const b=bl.pop();if(!b)return{ok:0,m:'No bust on record to undo.'};S.bl=bl;S.lost=bl[bl.length-1]||null;S.dis=Math.max(0,(S.dis|0)-1);S.r=Math.max(0,Math.min(MILRANK.length-1,b.r|0));S.xp=Math.max(b.xp|0,MILRANK[S.r][2]);if(S.r>=2)S.bc=1;milSave();return{ok:1,m:'Bust undone: back to '+milRankNm(S.r)+'.'}}
 const r=rkFind(arg);if(r<0)return{ok:0,m:'Ranks: '+MILRANK.map(k=>k[0]).join(', ')};S.r=r;S.xp=Math.max(S.xp|0,MILRANK[r][2]);if(r<9&&S.xp>=MILRANK[r+1][2])S.xp=MILRANK[r][2];if(r>=2)S.bc=1;milSave();return{ok:1,m:'Rank set to '+milRankNm(r)+'.'}}
{const c0=mpChatCmd;mpChatCmd=function(t){const m=String(t).match(/^\/\s*rank\b\s*(.*)$/i);if(!m)return c0.apply(this,arguments);
  if(!myRank()){sysLine('🎖️ /rank is for admins and the owner.');return true}const S=milSV(),a=m[1].trim();
  if(!a){const bl=Array.isArray(S.bl)?S.bl.length:0;sysLine('🎖️ You are '+milRankNm(S.r)+' ('+(S.xp|0)+' XP)'+(bl?' · '+bl+' bust'+(bl>1?'s':'')+' on record':'')+'. /rank Sergeant · /rank undo · /rank <player> Sergeant · /rank <player> undo');return true}
  const parts=a.split(/\s+/),last=parts[parts.length-1];
  if(parts.length>=2&&(last.toLowerCase()=='undo'||rkFind(last)>=0)){const who=parts.slice(0,-1).join(' ');const f=typeof stFind=='function'?stFind(who):[];
   if(!f.length){sysLine('🎖️ Nobody called "'+who+'" is here.');return true}if(f.length>1){sysLine('🎖️ Which one? '+f.map(p=>p.nm).join(', '));return true}
   if(stSend('rank',{to:f[0].pid,a:last}))sysLine('🎖️ '+(last.toLowerCase()=='undo'?'Undoing the last bust for ':'Setting the rank of ')+f[0].nm+(last.toLowerCase()=='undo'?'':' to '+milRankNm(rkFind(last)))+'…');else sysLine('🎖️ '+f[0].nm+' is not connected to you.');return true}
  if(parts.length==1&&last.toLowerCase()!='undo'&&rkFind(last)<0&&typeof stFind=='function'&&stFind(last).length){sysLine('🎖️ Add a rank or undo: /rank '+last+' Sergeant · /rank '+last+' undo');return true}
  const r=rkApply(a);sysLine('🎖️ '+r.m);if(r.ok)try{hint('🎖️ '+milRankNm(S.r)+' '+(MILRANK[S.r][1]||''))}catch(e){}return true}}
/* (r567: the r563 'Admin rank' clean-up is gone: it wrongly reset every rank above General) */
